'use strict'

const mongoose = require('mongoose')
const config = require('config')
const UserModel = mongoose.model('User')
const UserProxy = require('../services/user')
const Message = require('../services/message')

/**
 * 需要管理员权限
 */
exports.adminRequired = function * adminRequired (next) {
  if (!this.session.user) {
    return yield this.render('notify/notify', { error: '你还没有登录' })
  }
  if (!this.session.user.is_admin) {
    return yield this.render('notify/notify', { error: '需要管理员权限' })
  }
  yield next
}

/**
 * 需要登录
 */
exports.userRequired = function * userRequired (next) {
  if (!this.session || !this.session.user) {
    return this.redirect('/console/login')
  }

  yield next
}

/**
 * api 需要登录请求
 * @yield {[type]}   [description]
 */
exports.userRequiredApi = function * userRequiredApi (next) {
  if (!this.session.user) {
    this.status = 401
    this.body = {
      success: false,
      message: '请先登录后进行操作'
    }
    return
  }

  yield next
}

exports.blockUser = function () {
  return function (req, res, next) {
    if (req.path === '/signout') {
      return next()
    }
    if (req.session.user && req.session.user.is_block && req.method !== 'GET') {
      return res.status(403).send('您已被管理员锁定了.有疑问请联系 yjk99@qq.com')
    }
    next()
  }
}

exports.gen_session = function * gen_session (user, ctx) {
  const auth_token = user._id + '$$$$' // 以后可能会存储更多信息，用 $$$$ 来分隔
  ctx.cookie.set(config.auth_cookie_name, auth_token,
    { path: '/', maxAge: 1000 * 60 * 60 * 24 * 30, signed: true }) // cookie 有效期30天
}

// 验证用户是否登录
exports.authUser = function * authUser (next) {
  if (config.debug && this.cookies.get('mock_user', { signed: true })) {
    const mockUser = JSON.parse(this.cookies.get('mock_user', { signed: true }))
    this.session.user = new UserModel(mockUser)
    if (mockUser.is_admin) {
      this.session.user.is_admin = true
    }
    return yield next
  }

  let user
  if (this.session.user) {
    user = this.session.user
  } else {
    const auth_token = this.cookies.get(config.auth_cookie_name, { signed: true })
    if (!auth_token) {
      return yield next
    }

    const auth = auth_token.split('$$$$')
    const userId = auth[0]
    user = yield UserProxy.getUserById(userId)
  }

  if (!user) {
    return yield next
  }

  user = this.state.user = this.session.user = new UserModel(user)

  if (config.admins.hasOwnProperty(user.login_name)) {
    user.is_admin = true
  }

  const count = yield Message.getMessagesCount(user._id)
  user.messages_count = count

  yield next
}
