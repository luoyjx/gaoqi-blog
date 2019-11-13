/**
 * user follow api
 * @authors yanjixiong ()
 * @date    2016-11-28 23:07:14
 * @version $Id$
 */

const validator = require('validator')
const UserFollow = require('../services').UserFollow

/**
 * 关注
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.follow = async (req, res, next) => {
  const followingId = validator.trim(req.query.following_id)

  try {
    await UserFollow.follow(followingId, req.user._id)
    res.json({
      success: 1
    })
  } catch (error) {
    next(error)
  }
}

exports.unFollow = async (req, res, next) => {
  const followingId = validator.trim(req.query.following_id)

  try {
    await UserFollow.unFollow(followingId, req.user._id)
    res.json({
      success: 1
    })
  } catch (error) {
    next(error)
  }
}
