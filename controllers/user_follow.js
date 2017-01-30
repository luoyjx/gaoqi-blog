/**
 * user follow controller
 * @authors yanjixiong ()
 * @date    2016-12-08 11:55:40
 * @version $Id$
 */

var Promise = require('bluebird');
var _ = require('lodash');
var validator = require('validator');
var User = require('../dao').User;
var UserFollow = require('../dao').UserFollow;
var Post = require('../dao').Post;
var config = require('../config');

/**
 * 关注用户的文章
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getFollowUserPost = function getFollowUserPost(req, res, next) {
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  page = page > 0 ? page : 1;
  var user = req.session.user;
  var followIds = [];
  var limit = config.list_topic_count;

  UserFollow
    .getByFollower(user._id)
    .then(function(follows) {
      followIds = _.map(follows, 'following_id');

      var postQuery = { author_id: { $in: followIds } };
      var postOptions = {  skip: (page - 1) * limit, limit: limit, sort: '-update_at' };

      return Promise
        .all([
          Post.getPostsByQuery(postQuery, postOptions),
          Post.getCountByQuery(postQuery)          
        ]);
    })
    .spread(function(posts, count) {
      //总页数
      var pages = Math.ceil(count / limit);

      res.render('user/user_follow', {
        pages: pages,
        current_page: page,
        posts: posts,
        base: '/my/following',
        title: '我的关注'
      })
    })
    .catch(function(err) {
      console.error('getFollowUserPost error: ', err);
      next(err);
    });
}

/**
 * 关注
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.follow = function follow(req, res, next) {
  var followingId = validator.trim(req.params.id);
  var referer = req.headers.referer;
  UserFollow
    .follow(followingId, req.session.user._id)
    .then(function() {
      return User
        .incFollowingCount(req.session.user._id)
        .then(function() {
          var user = req.session.user;
          user.following_count++;
          req.session.user = res.locals.user = user;
          return Promise.resolve();
        });
    })
    .then(function() {
      res.redirect(referer);
    })
    .catch(function(err) {
      next(err);
    });
};

/**
 * 取消关注
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.unFollow = function unFollow(req, res, next) {
  var followingId = validator.trim(req.params.id);
  var referer = req.headers.referer;
  UserFollow
    .unFollow(followingId, req.session.user._id)
    .then(function() {
      return User
        .decFollowingCount(req.session.user._id)
        .then(function() {
          var user = req.session.user;
          user.following_count--;
          req.session.user = res.locals.user = user;
          return Promise.resolve();
        });
    })
    .then(function() {
      res.redirect(referer);
    })
    .catch(function(err) {
      next(err);
    })
}

