'use strict'

const validator = require('validator')
const tools = require('../common/tools')
const User = require('../services/user')
const mail = require('../common/mail')
const utility = require('utility')
const config = require('config')
const authFilter = require('../middlewares/auth')
const uuid = require('uuid')

/**
 * 跳转到登录页面
 */
exports.showLogin = function * showLogin () {
  this.session._loginReferer = this.headers.referer
  yield this.render('sign/signin', {
    title: '登录'
  })
}

/**
 * 定义一些登录时跳到首页的页面
 * @type {Array}
 */
const notJump = [
  '/active_account', // active page
  '/reset_pass', // reset password page, avoid to reset twice
  '/signup', // regist page
  '/search_pass' // serch pass page
]

/**
 * 登录操作
 */
exports.signIn = function * signIn () {
  const loginname = validator.trim(this.request.body.name)
  const pass = validator.trim(this.request.body.pass)

  if (!loginname || !pass) {
    this.status = 422
    return yield this.render('sign/signin', { error: '信息不完整' })
  }

  let getUserFunc
  if (loginname.indexOf('@') !== -1) {
    getUserFunc = User.getUserByEmail
  } else {
    getUserFunc = User.getUserByLoginName
  }

  const user = yield getUserFunc(loginname)

  if (!user) {
    return yield this.render('sign/signin', { error: '用户名不存在' })
  }

  const passhash = user.pwd
  // 验证密码
  const flag = yield tools.bcompare(pass, passhash)

  if (!flag) {
    return yield this.render('sign/signin', { error: '用户名不存在' })
  }

  // 验证是否激活，未激活再次发送激活邮件
  if (!user.is_active) {
    mail.sendActiveMail(user.email, utility.md5(user.email + user.pwd + config.session_secret), user.login_name)
    this.status = 403
    return yield this.render('sign/signin', { error: '账号未激活，已重新发送激活邮件到' + user.email })
  }

  // 验证成功，存储session cookie，跳转到首页
  authFilter.gen_session(user, res)
  // 检查需要跳转到首页的页面
  let refer = this.session._loginReferer || '/'
  for (let i = 0, len = notJump.length; i !== len; ++i) {
    if (refer.indexOf(notJump[i]) >= 0) {
      refer = '/'
      break
    }
  }
  this.redirect(refer)
}

/**
 * 跳转到注册页面
 * @param req
 * @param res
 * @param next
 */
exports.showSignup = function * showSignup () {
  yield this.render('sign/signup', {
    title: '注册'
  })
}

/**
 * 提交注册信息
 * @param req
 * @param res
 * @param next
 */
exports.signup = function * signup () {
  const loginname = validator.trim(this.request.body.loginname).toLowerCase()
  const email = validator.trim(this.request.body.email).toLowerCase()
  const pass = validator.trim(this.request.body.pass)
  const re_pass = validator.trim(this.request.body.re_pass)

  let errInfo = ''

  const hasEmpty = [loginname, pass, re_pass, email].some((item) => {
    return item === ''
  })

  errInfo = hasEmpty ? '信息填写不完整' : ''
  errInfo = loginname.length < 5 ? '用户名不能少于5个字符' : ''
  errInfo = !tools.validateId(loginname) ? '用户名不合法' : ''
  errInfo = !validator.isEmail(email) ? '邮箱填写不正确' : ''
  errInfo = pass !== re_pass ? '两次密码填写不一致' : ''

  if (errInfo) {
    this.status = 422
    return yield this.render('sign/signup', { error: errInfo, loginname, email })
  }

  const users = yield User.getUsersByQuery({
    '$or': [
      { 'login_name': loginname },
      { email }
    ]
  }, {})

  if (users.length > 0) {
    this.status = 422
    return yield this.render('sign/signup', { error: '用户名或邮箱已被使用', loginname, email })
  }

  const passHashed = yield tools.bhash(pass)
  const avatarUrl = User.makeGravatar(email)

  yield User.newAndSave(loginname, loginname, passHashed, email, avatarUrl, false)

  mail.sendActiveMail(email, utility.md5(email + passHashed + config.session_secret), loginname)

  yield this.render('sign/signup', {
    success: '欢迎加入' + config.name + '！我们已经向您的邮箱发送了一封邮件，点击邮件中的链接激活账号',
    title: '注册'
  })
}

/**
 * 退出登录
 */
exports.signout = function * signout () {
  this.session.destroy()
  this.cookies.clear(config.auth_cookie_name, { signed: true })
  this.redirect('back')
}

/**
 * 激活用户账号
 */
exports.activeUser = function * activeUser () {
  // 邮箱中的激活链接参数
  const key = this.query.key
  const name = this.query.name

  const user = yield User.getUserByLoginName(name)
  if (!user) {
    return this.throw(404, '[ACTIVE_USER] 未能找到用户：' + name)
  }

  const passhash = user.pwd
  if (!user || utility.md5(user.email + passhash + config.session_secret) !== key) {
    return yield this.render('notify/notify', {
      error: '信息有误，账号无法激活',
      title: '通知'
    })
  }

  if (user.is_active) {
    return yield this.render('notify/notify', {
      error: '账号已经是激活状态',
      title: '通知'
    })
  }

  user.is_active = true
  user.save()

  yield this.render('notify/notify', {
    success: '帐号已被激活，请登录',
    title: '通知'
  })
}

/**
 * 找回密码
 */
exports.showSearchPass = function * showSearchPass () {
  yield this.render('sign/search_pass')
}

/**
 * 更新
 */
exports.updateSearchPass = function * updateSearchPass () {
  const email = validator.trim(this.request.body.email).toLowerCase()
  if (!validator.isEmail(email)) {
    return yield this.render('sign/search_pass', { error: '邮箱不合法', email })
  }

  // 动态生成retrive_key和timestamp到users collection,之后重置密码进行验证
  const retrieveKey = uuid.v4()
  const retrieveTime = new Date().getTime()

  const user = User.getUserByEmail(email)
  if (!user) {
    return yield this.render('sign/search_pass', { error: '没有这个电子邮箱。', email })
  }

  user.retrieve_key = retrieveKey
  user.retrieve_time = retrieveTime
  yield user.save()

  // 发送重置密码邮件
  mail.sendResetPassMail(email, retrieveKey, user.login_name)

  yield this.render('notify/notify', {
    success: '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。'
  })
}

/**
 * reset password
 * 'get' to show the page, 'post' to reset password
 * after reset password, retrieve_key&time will be destroy
 */
exports.resetPass = function * resetPass () {
  const key = validator.trim(this.query.key)
  const name = validator.trim(this.query.name)

  const user = yield User.getUserByNameAndKey(name, key)

  if (!user) {
    this.status = 403
    return yield this.render('notify/notify', { error: '信息有误，密码无法重置。' })
  }

  const now = new Date().getTime()
  const oneDay = 1000 * 60 * 60 * 24
  if (!user.retrieve_time || now - user.retrieve_time > oneDay) {
    this.status = 403
    return yield this.render('notify/notify', { error: '该链接已过期，请重新申请。' })
  }

  yield this.render('sign/reset', { name, key })
}

/**
 * 修改密码
 */
exports.updatePass = function * updatePass () {
  const psw = validator.trim(this.request.body.psw) || ''
  const repsw = validator.trim(this.request.body.repsw) || ''
  const key = validator.trim(this.request.body.key) || ''
  const name = validator.trim(this.request.body.name) || ''

  if (psw !== repsw) {
    return yield this.render('sign/reset', { name, key, error: '两次密码输入不一致。' })
  }

  const user = yield User.getUserByNameAndKey(name, key)

  if (!user) {
    return yield this.render('notify/notify', { error: '错误的激活链接' })
  }

  const passhash = yield tools.bhash(psw)

  user.pwd = passhash
  user.retrieve_key = null
  user.retrieve_time = null
  user.is_active = true // 用户激活

  yield user.save()

  yield this.render('notify/notify', { success: '你的密码已重置。' })
}
