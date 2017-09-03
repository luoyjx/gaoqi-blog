'use strict'

const Promise = require('bluebird')
const _ = require('lodash')
const validator = require('validator')
const User = require('../services/user')
const UserFollow = require('../services/user_follow')
const Post = require('../services/post')
const config = require('../config')

/**
 * 关注用户的文章
 */
exports.getFollowUserPost = function * getFollowUserPost () {
  let page = this.query.page ? parseInt(this.query.page, 10) : 1
  page = page > 0 ? page : 1
  const user = this.session.user
  const limit = config.list_topic_count
  let followIds = []

  const follows = yield UserFollow.getByFollower(user._id)

  followIds = _.map(follows, 'following_id')

  const postQuery = { author_id: { $in: followIds } }
  const postOptions = { skip: (page - 1) * limit, limit, sort: '-update_at' }

  const [posts, count] = yield Promise.all([
    Post.getPostsByQuery(postQuery, postOptions),
    Post.getCountByQuery(postQuery)
  ])

  // 总页数
  const pages = Math.ceil(count / limit)

  yield this.render('user/user_follow', {
    pages,
    current_page: page,
    posts,
    base: '/my/following',
    title: '我的关注'
  })
}

/**
 * 关注
 */
exports.follow = function * follow () {
  const followingId = validator.trim(this.params.id)
  const referer = this.headers.referer

  yield UserFollow.follow(followingId, this.session.user._id)
  yield User.incFollowingCount(this.session.user._id)

  const user = this.session.user
  user.following_count++
  this.session.user = user

  this.redirect(referer)
}

/**
 * 取消关注
 */
exports.unFollow = function * unFollow () {
  const followingId = validator.trim(this.params.id)
  const referer = this.headers.referer

  yield UserFollow.unFollow(followingId, this.session.user._id)
  yield User.decFollowingCount(this.session.user._id)

  const user = this.session.user
  user.following_count--
  this.session.user = user

  this.redirect(referer)
}
