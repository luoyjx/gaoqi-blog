const Promise = require('bluebird')
const mongoose = require('mongoose')
const UserModel = mongoose.model('User')
const config = require('../config')
const UserService = require('../services').User
const Message = require('../services').Message

/**
 * 需要管理员权限
 */
exports.adminRequired = (req, res, next) => {
  if (!req.session.user) {
    return res.render('notify/notify', { error: '你还没有登录' })
  }
  if (!req.session.user.is_admin) {
    return res.render('notify/notify', { error: '需要管理员权限' })
  }
  next()
}

/**
 * 需要登录
 */
exports.userRequired = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/signin')
  }
  next()
}

exports.blockUser = () => {
  return (req, res, next) => {
    if (req.path === '/signout') {
      return next()
    }
    if (req.session.user && req.session.user.is_block && req.method !== 'GET') {
      return res
        .status(403)
        .send('您已被管理员锁定了.有疑问请联系 yjk99@qq.com')
    }
    next()
  }
}

const genSession = (user, res) => {
  const authToken = user._id + '$$$$' // 以后可能会存储更多信息，用 $$$$ 来分隔
  res.cookie(config.auth_cookie_name, authToken, {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30,
    signed: true,
    httpOnly: true
  }) // cookie 有效期30天
}

exports.gen_session = genSession

// 验证用户是否登录
exports.authUser = (req, res, next) => {
  if (config.debug && req.cookies.mock_user) {
    const mockUser = JSON.parse(req.cookies.mock_user)
    req.session.user = new UserModel(mockUser)
    if (mockUser.is_admin) {
      req.session.user.is_admin = true
    }
    return next()
  }

  let userPromise
  if (req.session.user) {
    userPromise = Promise.resolve(req.session.user)
  } else {
    const authToken = req.signedCookies[config.auth_cookie_name]
    if (!authToken) {
      return next()
    }

    const auth = authToken.split('$$$$')
    const userId = auth[0]
    userPromise = UserService.getUserById(userId)
  }

  userPromise.then(user => {
    if (!user) {
      return next()
    }

    user = res.locals.user = req.session.user = new UserModel(user)

    if (config.admins[user.login_name]) {
      user.is_admin = true
    }

    Message.getMessagesCount(user._id).then(count => {
      user.messages_count = count
      next()
    })
  })
}
