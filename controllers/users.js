/*!
 * user controller
 */

var Promise = require('bluebird')
var Post = require('../dao').Post
var User = require('../dao').User
var Reply = require('../dao').Reply
var UserFollow = require('../dao').UserFollow
var validator = require('validator')
var config = require('../config')
var tools = require('../common/tools')

/**
 * 个人主页
 * @param req
 * @param res
 * @param next
 */
exports.index = function (req, res, next) {
  var userNname = validator.trim(req.params.name)

  User
    .getUserByLoginName(userNname)
    .then(function (user) {
      if (!user) {
        return res.wrapRender('notify/notify', {
          error: '并没有找到这样一个作者'
        })
      }

      var postQuery = { author_id: user._id }

      var latestOptions = { limit: 10, sort: '-create_at' }
      var topOptions = { limit: 10, sort: '-pv' }
      var replyOptions = { limit: 10, sort: '-create_at' }
      return Promise
        .all([
          Post.getPostsByQuery(postQuery, latestOptions),
          Post.getPostsByQuery(postQuery, topOptions),
          Reply.getRepliesByAuthorId(user._id, replyOptions),
          Promise.resolve(user),
          req.session.user
            ? UserFollow.hasFollow(user._id, req.session.user._id)
            : Promise.resolve(false)
        ])
    })
    .spread(function (latest, top, replies, user, hasFollow) {
      user.frendly_create_at = tools.format(user.create_at, 'YYYY-MM-DD HH:mm:ss Z')

      res.wrapRender('user/home', {
        author: user,
        latest: latest,
        top: top,
        replies: replies,
        hasFollow: hasFollow,
        title: user.login_name
      })
    })
    .catch(function (err) {
      next(err)
    })
}

/**
 * 获取作者最热文章
 * @param req
 * @param res
 * @param next
 */
exports.top = function (req, res, next) {
  var userName = validator.trim(req.params.name)
  var page = req.query.page ? parseInt(req.query.page, 10) : 1
  page = page > 0 ? page : 1

  User
    .getUserByLoginName(userName)
    .then(function (user) {
      if (!user) {
        return res.wrapRender('notify/notify', {
          error: '并没有找到这样一个作者'
        })
      }

      var postQuery = { author_id: user._id }
      var limit = config.list_topic_count

      var topOptions = { skip: (page - 1) * limit, limit: limit, sort: '-pv' }
      return Promise
        .all([
          Post.getPostsByQuery(postQuery, topOptions),
          Post.getCountByQuery(postQuery)
            .then(function (allCount) {
              return Promise.resolve(Math.ceil(allCount / limit))
            }),
          Promise.resolve(user)
        ])
    })
    .spread(function (top, pages, user) {
      res.wrapRender('user/top', {
        author: user,
        top: top,
        pages: pages,
        current_page: page,
        title: user.login_name + '的热门文章 - 第' + page + '页'
      })
    })
    .catch(function (err) {
      next(err)
    })
}

/**
 * 作者发表的评论
 * @param req
 * @param res
 * @param next
 */
exports.replies = function (req, res, next) {
  var userName = validator.trim(req.params.name)
  var page = req.query.page ? parseInt(req.query.page, 10) : 1
  page = page > 0 ? page : 1

  var _user

  User
    .getUserByLoginName(userName)
    .then(function (user) {
      if (!user) {
        return res.wrapRender('notify/notify', {
          error: '并没有找到这样一个作者'
        })
      }

      _user = user

      var limit = config.list_topic_count

      var replyOption = { skip: (page - 1) * limit, limit: limit, sort: '-create_at' }
      return Reply.getRepliesByAuthorId(user._id, replyOption)
    })
    .then(function (fromAuthor) {
      res.wrapRender('user/replies', {
        author: _user,
        from_author: fromAuthor,
        title: _user.login_name + '最近的评论'
      })
    })
    .catch(function (err) {
      next(err)
    })
}

/**
 * 用户设置
 * @param req
 * @param res
 * @param next
 */
exports.setting = function (req, res, next) {
  var loginName = validator.trim(req.params.name)

  if (!req.session.user || loginName !== req.session.user.login_name) {
    return res.render('notify/notify', {
      error: '你没有权限访问此页面'
    })
  }

  User
    .getUserByLoginName(loginName)
    .then(function (user) {
      if (!user) {
        return res.wrapRender('notify/notify', {
          error: '找不到这个用户'
        })
      }
      res.wrapRender('user/setting', {
        user: user
      })
    })
    .catch(function (err) {
      next(err)
    })
}

/**
 * 修改基本信息设置
 * @param req
 * @param res
 * @param next
 */
exports.updateSetting = function updateSetting (req, res, next) {
  var url = validator.trim(req.body.url)
  var location = validator.trim(req.body.location)
  location = validator.escape(location)
  var weibo = validator.trim(req.body.weibo)
  var signature = validator.trim(req.body.signature)
  signature = validator.escape(signature)

  User
    .getUserById(req.session.user._id)
    .then(function (user) {
      user.url = url
      user.location = location
      user.signature = signature
      user.weibo = weibo
      user.save()
      return Promise.resolve(user)
    })
    .then(function (user) {
      res.locals.user = req.session.user = user.toObject({ virtual: true })
      return res.wrapRender('user/setting', {
        success: '修改信息成功'
      })
    })
    .catch(function (err) {
      next(err)
    })
}

/**
 * 修改密码
 * @param req
 * @param res
 * @param next
 */
exports.updatePassword = function updatePassword (req, res, next) {
  var oldPass = validator.trim(req.body.old_pass)
  var newPass = validator.trim(req.body.new_pass)
  if (!oldPass || !newPass) {
    return res.wrapRender('user/setting', {
      error: '旧密码或新密码不得为空'
    })
  }

  var _user

  User
    .getUserById(req.session.user._id)
    .then(function (user) {
      _user = user

      return tools.bcompare(oldPass, user.pwd)
    })
    .then(function (bool) {
      if (!bool) {
        return res.wrapRender('user/setting', {
          error: '当前密码不正确'
        })
      }

      return tools.bhash(newPass)
    })
    .then(function (passhash) {
      if (_user) {
        _user.pwd = passhash
        _user.save()
      }
    })
    .then(function () {
      return res.render('user/setting', {
        success: '密码已被修改'
      })
    })
    .catch(function (err) {
      next(err)
    })
}
