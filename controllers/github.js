
const uuid = require('node-uuid')
const validator = require('validator')

const { User } = require('../models')
const authMiddleWare = require('../middleware/auth')
const tools = require('../common/tools')

exports.callback = async (req, res, next) => {
  const profile = req.user

  try {
    const user = await User.findOne({ github_id: profile.id })

    // 当用户已经是用户时，通过 github 登陆将会更新他的资料
    if (user) {
      user.github_username = profile.username
      user.github_id = profile.id
      user.github_accessToken = profile.accessToken

      if (profile.emails[0].value) {
        user.email = profile.emails[0].value
      }

      await user.save()
      authMiddleWare.gen_session(user, res)
      return res.redirect('/')
    } else {
      // 如果用户还未存在，则建立新用户
      req.session.profile = profile
      return res.redirect('/login/github/new')
    }
  } catch (error) {
    next(error)
  }
}

exports.new = function (req, res, next) {
  res.render('sign/new_oauth', { actionPath: '/login/github/create' })
}

exports.create = async (req, res, next) => {
  const profile = req.session.profile
  const isnew = req.body.isnew
  const loginname = validator.trim(req.body.name)
  const password = validator.trim(req.body.pass)

  if (!profile) {
    return res.redirect('/signin')
  }

  delete req.session.profile

  if (isnew) { // 注册新账号
    try {
      const user = new User({
        login_name: profile.username,
        pwd: profile.accessToken,
        email: profile.emails[0].value,
        github_id: profile.id,
        github_username: profile.username,
        github_accessToken: profile.accessToken,
        avatar: profile._json.avatar_url,
        is_active: true,
        accessToken: uuid.v4()
      })
      await user.save()
      authMiddleWare.gen_session(user, res)
      res.redirect('/')
    } catch (err) {
      // 根据 err.err 的错误信息决定如何回应用户，这个地方写得很难看
      if (err.message.indexOf('duplicate key error') !== -1) {
        if (err.message.indexOf('email') !== -1) {
          return res
            .status(500)
            .wrapRender('sign/no_github_email')
        }
        if (err.message.indexOf('login_name') !== -1) {
          return res
            .status(500)
            .send('您 GitHub 账号的用户名与之前注册的用户名重复了')
        }
      }
      return next(err)
      // END 根据 err.err 的错误信息决定如何回应用户，这个地方写得很难看
    }
  } else { // 关联老账号
    try {
      const user = await User.findOne({ login_name: loginname })
      if (!user) return res.status(403).wrapRender('sign/signin', { error: '账号名或密码错误。' })

      const ok = await tools.bcompare(password, user.pwd)
      if (!bool) return res.status(403).wrapRender('sign/signin', { error: '账号名或密码错误。' })

      user.github_username = profile.username
      user.github_id = profile.id
      user.avatar = profile._json.avatar_url
      user.github_accessToken = profile.accessToken
      await user.save()

      authMiddleWare.gen_session(user, res)
      res.redirect('/')
    } catch (err) {
      next(err)
    }
  }
}
