'use strict'

const config = require('config')
const PostCollection = require('../services/post_collection')
const User = require('../services/user')

/**
 * 查询收藏文章
 */
exports.getPostCollection = function * getPostCollection () {
  let page = this.query.page ? parseInt(this.query.page, 10) : 1
  page = page > 0 ? page : 1
  const user = this.session.user
  const limit = config.list_topic_count
  const options = { skip: (page - 1) * limit, limit, sort: '-create_at' }

  const [posts, count] = yield PostCollection.getCollectionPostByUser(user._id, options)
  const pages = Math.ceil(count / config.list_topic_count)

  yield this.render('user/post_collection', {
    current_page: page,
    posts,
    pages,
    base: '/my/post_collection',
    title: '文章收藏'
  })
}

/**
 * 收藏文章
 */
exports.create = function * create () {
  const postId = this.params._id
  const user = this.session.user

  yield PostCollection.create(postId, user._id)
  yield User.incCollectCount(user._id)
  user.collect_post_count++
  this.session.user = user
  this.body = { success: 1 }
}

/**
 * 取消收藏文章
 */
exports.removeById = function * removeById () {
  const postId = this.params._id
  const user = this.session.user

  yield PostCollection.remove(postId, user._id)
  yield User.decCollectCount(user._id)

  user.collect_post_count--
  this.session.user = user

  this.body = { success: 1 }
}
