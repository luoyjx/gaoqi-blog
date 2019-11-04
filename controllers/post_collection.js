/**
 * post collection controller
 * @authors yanjixiong ()
 * @date    2016-12-09 22:43:20
 * @version $Id$
 */

var config = require('../config')
var PostCollection = require('../dao').PostCollection
var User = require('../dao').User

/**
 * 查询收藏文章
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getPostCollection = function getPostCollection (req, res, next) {
  var page = req.query.page ? parseInt(req.query.page) : 1
  page = page > 0 ? page : 1
  var user = req.session.user

  var limit = config.list_topic_count
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-create_at' }

  PostCollection
    .getCollectionPostByUser(user._id, options)
    .spread(function (posts, count) {
      var pages = Math.ceil(count / config.list_topic_count)

      res.render('user/post_collection', {
        current_page: page,
        posts: posts,
        pages: pages,
        base: '/my/post_collection',
        title: '文章收藏'
      })
    })
    .catch(function (err) {
      console.log(err)
      next(err)
    })
}

/**
 * 收藏文章
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.create = function create (req, res, next) {
  var postId = req.params._id
  var user = req.session.user

  PostCollection
    .create(postId, user._id)
    .then(function () {
      return User.incCollectCount(user._id)
        .then(function () {
          user.collect_post_count++
          req.session.user = res.locals.user = user
          return Promise.resolve()
        })
    })
    .then(function () {
      res.wrapSend({ success: 1 })
    })
    .catch(function (err) {
      console.log(err)
      next(err)
    })
}

/**
 * 取消收藏文章
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.removeById = function removeById (req, res, next) {
  var postId = req.params._id
  var user = req.session.user

  PostCollection
    .remove(postId, user._id)
    .then(function () {
      return User.decCollectCount(user._id)
        .then(function () {
          user.collect_post_count--
          req.session.user = res.locals.user = user
          return Promise.resolve()
        })
    })
    .then(function () {
      res.wrapSend({ success: 1 })
    })
    .catch(function (err) {
      console.log(err)
      next(err)
    })
}
