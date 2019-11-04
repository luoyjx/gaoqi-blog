/**
 * post collection dao
 * @authors yanjixiong ()
 * @date    2016-11-28 22:45:20
 * @version $Id$
 */

var _ = require('lodash')
var Promise = require('bluebird')
var Post = require('./post')
var PostCollection = require('../models').PostCollection

/**
 * 查询user收藏的文章
 * @param  {[type]} userId  [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
exports.getCollectionPostByUser = function getCollectionPostByUser (userId, options) {
  return PostCollection
    .find({ user_id: userId }, {}, options)
    .exec()
    .then(function (postCollections) {
      var postIds = _.map(postCollections, 'post_id')

      var query = { _id: { $in: postIds } }
      var options = _.assign(options, { sort: '-update_at' })

      return Promise
        .all([
          Post.getPostsByQuery(query, options),
          Post.getCountByQuery(query)
        ])
    })
}

/**
 * 添加文章收藏
 * @param  {[type]} postId 文章id
 * @param  {[type]} userId 用户id
 * @return {[type]}
 */
exports.create = function create (postId, userId) {
  var postCollection = new PostCollection()
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
exports.remove = function remove (postId, userId) {
  return PostCollection.remove({ user_id: userId, post_id: postId })
}

/**
 * 是否收藏了此文章
 * @param  {[type]}  postId 文章id
 * @param  {[type]}  userId 用户id
 * @return {Boolean}
 */
exports.hasCollect = function hasCollect (postId, userId) {
  return PostCollection.findOne({ post_id: postId, user_id: userId }).exec()
}
