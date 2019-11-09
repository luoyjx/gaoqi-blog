/*!
 * user controller
 */

const Bluebird = require('bluebird')
const validator = require('validator')

const { Post, User, Reply, UserFollow } = require('../dao')
const config = require('../config')
const tools = require('../common/tools')

/**
 * 个人主页
 * @param req
 * @param res
 * @param next
 */
exports.index = async (req, res, next) => {
  const userNname = validator.trim(req.params.name)

  try {
    const user = await User.getUserByLoginName(userNname)

    if (!user) {
      return res.wrapRender('notify/notify', {
        error: '并没有找到这样一个作者'
      })
    }

    var postQuery = { author_id: user._id }

    var latestOptions = { limit: 10, sort: '-create_at' }
    var topOptions = { limit: 10, sort: '-pv' }
    var replyOptions = { limit: 10, sort: '-create_at' }

    const [latest, top, replies, hasFollow] = await Bluebird.all([
      Post.getPostsByQuery(postQuery, latestOptions),
      Post.getPostsByQuery(postQuery, topOptions),
      Reply.getRepliesByAuthorId(user._id, replyOptions),
      req.session.user
        ? UserFollow.hasFollow(user._id, req.session.user._id)
        : Bluebird.resolve(false)
    ])

    user.frendly_create_at = tools.format(user.create_at, 'YYYY-MM-DD HH:mm:ss Z')

    res.wrapRender('user/home', {
      author: user,
      latest: latest,
      top: top,
      replies: replies,
      hasFollow: hasFollow,
      title: user.login_name
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 获取作者最热文章
 * @param req
 * @param res
 * @param next
 */
exports.top = async (req, res, next) => {
  const userName = validator.trim(req.params.name)
  let page = req.query.page ? parseInt(req.query.page, 10) : 1
  page = page > 0 ? page : 1

  try {
    const user = await User.getUserByLoginName(userName)

    if (!user) {
      return res.wrapRender('notify/notify', {
        error: '并没有找到这样一个作者'
      })
    }

    const postQuery = { author_id: user._id }
    const limit = config.list_topic_count

    const topOptions = { skip: (page - 1) * limit, limit: limit, sort: '-pv' }

    const [top, pages] = await Bluebird.all([
      Post.getPostsByQuery(postQuery, topOptions),
      Post.getCountByQuery(postQuery)
        .then((allCount) => {
          return Bluebird.resolve(Math.ceil(allCount / limit))
        })
    ])

    res.wrapRender('user/top', {
      author: user,
      top: top,
      pages: pages,
      current_page: page,
      title: user.login_name + '的热门文章 - 第' + page + '页'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 作者发表的评论
 * @param req
 * @param res
 * @param next
 */
exports.replies = async (req, res, next) => {
  const userName = validator.trim(req.params.name)
  let page = req.query.page ? parseInt(req.query.page, 10) : 1
  page = page > 0 ? page : 1

  try {
    const _user = await User.getUserByLoginName(userName)

    if (!_user) {
      return res.wrapRender('notify/notify', {
        error: '并没有找到这样一个作者'
      })
    }

    const limit = config.list_topic_count
    const replyOption = { skip: (page - 1) * limit, limit: limit, sort: '-create_at' }
    const fromAuthor = await Reply.getRepliesByAuthorId(_user._id, replyOption)

    res.wrapRender('user/replies', {
      author: _user,
      from_author: fromAuthor,
      title: _user.login_name + '最近的评论'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 用户设置
 * @param req
 * @param res
 * @param next
 */
exports.setting = async (req, res, next) => {
  const loginName = validator.trim(req.params.name)

  if (!req.session.user || loginName !== req.session.user.login_name) {
    return res.render('notify/notify', {
      error: '你没有权限访问此页面'
    })
  }

  try {
    const user = await User.getUserByLoginName(loginName)

    if (!user) {
      return res.wrapRender('notify/notify', {
        error: '找不到这个用户'
      })
    }
    res.wrapRender('user/setting', {
      user: user
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 修改基本信息设置
 * @param req
 * @param res
 * @param next
 */
exports.updateSetting = async (req, res, next) => {
  const url = validator.trim(req.body.url)
  const weibo = validator.trim(req.body.weibo)
  let location = validator.trim(req.body.location)
  location = validator.escape(location)
  let signature = validator.trim(req.body.signature)
  signature = validator.escape(signature)

  try {
    const user = await User.getUserById(req.session.user._id)
    user.url = url
    user.location = location
    user.signature = signature
    user.weibo = weibo
    await user.save()
    res.locals.user = req.session.user = user.toObject({ virtual: true })
    res.wrapRender('user/setting', {
      success: '修改信息成功'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 修改密码
 * @param req
 * @param res
 * @param next
 */
exports.updatePassword = function updatePassword (req, res, next) {
  const oldPass = validator.trim(req.body.old_pass)
  const newPass = validator.trim(req.body.new_pass)
  if (!oldPass || !newPass) {
    return res.wrapRender('user/setting', {
      error: '旧密码或新密码不得为空'
    })
  }

  try {
    const _user = await User.getUserById(req.session.user._id)
    const ok = await tools.bcompare(oldPass, user.pwd)

    if (!ok) {
      return res.wrapRender('user/setting', {
        error: '当前密码不正确'
      })
    }

    const passhash = await tools.bhash(newPass)
    if (_user) {
      _user.pwd = passhash
      _user.save()
    }

    res.render('user/setting', {
      success: '密码已被修改'
    })
  } catch (error) {
    next(error)
  }
}
