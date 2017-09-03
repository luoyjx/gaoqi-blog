'use strict'

const Promise = require('bluebird')
const config = require('config')
const Post = require('../services/post')
const User = require('../services/user')
const Reply = require('../services/reply')
const UserFollow = require('../services/user_follow')
const validator = require('validator')
const tools = require('../common/tools')

/**
 * 个人主页
 */
exports.index = function * index () {
  const user_name = validator.trim(this.params.name)

  const user = yield User.getUserByLoginName(user_name)

  if (!user) {
    return yield this.render('notify/notify', {
      error: '并没有找到这样一个作者'
    })
  }

  const post_query = { author_id: user._id }
  const latest_options = { limit: 10, sort: '-create_at' }
  const top_options = { limit: 10, sort: '-pv' }
  const reply_options = { limit: 10, sort: '-create_at' }

  const [latest, top, replies, hasFollow] = yield Promise.all([
    Post.getPostsByQuery(post_query, latest_options),
    Post.getPostsByQuery(post_query, top_options),
    Reply.getRepliesByAuthorId(user._id, reply_options),
    this.session.user
      ? UserFollow.hasFollow(user._id, this.session.user._id)
      : Promise.resolve(false)
  ])

  user.frendly_create_at = tools.format(user.create_at, 'YYYY-MM-DD HH:mm:ss Z')

  yield this.render('user/home', {
    author: user,
    latest,
    top,
    replies,
    hasFollow,
    title: user.login_name
  })
}

/**
 * 获取作者最热文章
 */
exports.top = function * top () {
  const user_name = validator.trim(this.params.name)
  let page = this.query.page ? parseInt(this.query.page, 10) : 1
  page = page > 0 ? page : 1

  const user = yield User.getUserByLoginName(user_name)

  if (!user) {
    return yield this.wrapRender('notify/notify', {
      error: '并没有找到这样一个作者'
    })
  }

  const post_query = { author_id: user._id }
  const limit = config.list_topic_count
  const top_options = { skip: (page - 1) * limit, limit, sort: '-pv' }

  const [top, pages] = yield Promise.all([
    Post.getPostsByQuery(post_query, top_options),
    Post.getCountByQuery(post_query)
      .then(function (all_count) {
        return Promise.resolve(Math.ceil(all_count / limit))
      })
  ])

  yield this.render('user/top', {
    author: user,
    top,
    pages,
    current_page: page,
    title: user.login_name + '的热门文章 - 第' + page + '页'
  })
}

/**
 * 作者发表的评论
 */
exports.replies = function * replies () {
  const user_name = validator.trim(this.params.name)
  let page = this.query.page ? parseInt(this.query.page, 10) : 1
  page = page > 0 ? page : 1

  const user = yield User.getUserByLoginName(user_name)

  if (!user) {
    return yield this.render('notify/notify', {
      error: '并没有找到这样一个作者'
    })
  }

  const limit = config.list_topic_count
  const reply_option = { skip: (page - 1) * limit, limit, sort: '-create_at' }

  const fromAuthor = yield Reply.getRepliesByAuthorId(user._id, reply_option)

  yield this.render('user/replies', {
    author: user,
    from_author: fromAuthor,
    title: user.login_name + '最近的评论'
  })
}

/**
 * 用户设置
 */
exports.setting = function * setting () {
  const loginName = validator.trim(this.params.name)

  if (!this.session.user || loginName !== this.session.user.login_name) {
    return yield this.render('notify/notify', {
      error: '你没有权限访问此页面'
    })
  }

  const user = yield User.getUserByLoginName(loginName)

  if (!user) {
    return yield this.render('notify/notify', {
      error: '找不到这个用户'
    })
  }

  yield this.render('user/setting', {
    user
  })
}

/**
 * 修改基本信息设置
 */
exports.updateSetting = function * updateSetting () {
  const url = validator.trim(this.request.body.url)
  let location = validator.trim(this.request.body.location)
  location = validator.escape(location)
  const weibo = validator.trim(this.request.body.weibo)
  let signature = validator.trim(this.request.body.signature)
  signature = validator.escape(signature)

  const user = yield User.getUserById(this.session.user._id)
  user.url = url
  user.location = location
  user.signature = signature
  user.weibo = weibo
  yield user.save()

  this.session.user = user.toObject({ virtual: true })
  this.render('user/setting', {
    success: '修改信息成功'
  })
}

/**
 * 修改密码
 */
exports.updatePassword = function * updatePassword () {
  const old_pass = validator.trim(this.request.body.old_pass)
  const new_pass = validator.trim(this.request.body.new_pass)
  if (!old_pass || !new_pass) {
    return yield this.render('user/setting', {
      error: '旧密码或新密码不得为空'
    })
  }

  const user = yield User.getUserById(this.session.user._id)
  const isCorrect = yield tools.bcompare(old_pass, user.pwd)

  if (!isCorrect) {
    return yield this.render('user/setting', {
      error: '当前密码不正确'
    })
  }

  const passhash = yield tools.bhash(new_pass)

  if (user) {
    user.pwd = passhash
    yield user.save()
  }

  yield this.render('user/setting', {
    success: '密码已被修改'
  })
}
