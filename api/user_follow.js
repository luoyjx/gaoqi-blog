/**
 * user follow api
 * @authors yanjixiong ()
 * @date    2016-11-28 23:07:14
 * @version $Id$
 */

var validator = require('validator')
var UserFollow = require('../services').UserFollow

/**
 * 关注
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.follow = (req, res, next) => {
  var followingId = validator.trim(req.query.following_id)
  UserFollow.follow(followingId, req.user._id)
    .then(() => {
      res.json({
        success: 1
      })
    })
    .catch(err => {
      next(err)
    })
}

exports.unFollow = (req, res, next) => {
  var followingId = validator.trim(req.query.following_id)
  UserFollow.unFollow(followingId, req.user._id)
    .then(result => {
      res.json({
        success: 1
      })
    })
    .catch(err => {
      next(err)
    })
}
