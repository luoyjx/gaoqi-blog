/**
 * post collection dao
 * @authors yanjixiong ()
 * @date    2016-11-28 22:45:20
 * @version $Id$
 */

const _ = require('lodash')
const Promise = require('bluebird')
const Post = require('./post')
const PostCollection = require('../models').PostCollection

/**
 * 查询user收藏的文章
 * @param  {[type]} userId  [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
exports.getCollectionPostByUser = async (userId, options) => {
  const postCollections = await PostCollection.find(
    { user_id: userId },
    {},
    options
  ).exec()

  const postIds = _.map(postCollections, 'post_id')
  const query = { _id: { $in: postIds } }
  const opts = _.assign(options, { sort: '-update_at' })

  return Promise.all([
    Post.getPostsByQuery(query, opts),
    Post.getCountByQuery(query)
  ])
}

/**
 * 添加文章收藏
 * @param  {[type]} postId 文章id
 * @param  {[type]} userId 用户id
 * @return {[type]}
 */
exports.create = (postId, userId) => {
  const postCollection = new PostCollection()
  postCollection.user_id = userId
  postCollection.post_id = postId
  postCollection.save()
  return Promise.resolve(postCollection)
}

/**
 * 取消文章收藏
 * @param  {[type]} postId 文章id
 * @param  {[type]} userId 用户id
 * @return {[type]}
 */
exports.remove = (postId, userId) => {
  return PostCollection.remove({ user_id: userId, post_id: postId })
}

/**
 * 是否收藏了此文章
 * @param  {[type]}  postId 文章id
 * @param  {[type]}  userId 用户id
 * @return {Boolean}
 */
exports.hasCollect = (postId, userId) => {
  return PostCollection.findOne({ post_id: postId, user_id: userId }).exec()
}
