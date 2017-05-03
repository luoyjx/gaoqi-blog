/**
 * user follow dao
 * @authors yanjixiong ()
 * @date    2016-11-28 22:43:38
 * @version $Id$
 */

var Promise = require('bluebird');
var UserFollow = require('../models').UserFollow;


module.exports = {
  /**
   * 根据关注者查询被关注用户
   * @param  {[type]} followerId [description]
   * @return {[type]}            [description]
   */
  getByFollower: function getByFollower(followerId) {
    return UserFollow.find({follower_id: followerId});
  },

  /**
   * 根据条件查询
   * @param  {[type]} query [description]
   * @param  {[type]} opt   [description]
   * @return {[type]}       [description]
   */
  findByQuery: function findByQuery(query, opt) {
    return UserFollow.find(query, '', opt).exec();
  },

  /**
   * 关注一个用户
   * @param  {[type]} following [description]
   * @param  {[type]} follower  [description]
   * @return {[type]}           [description]
   */
  follow: function follow(following, follower) {
    var userFollow = new UserFollow();
    userFollow.following_id = following;
    userFollow.follower_id = follower;
    return userFollow.save();
  },

  /**
   * 取关一个用户
   * @param  {[type]} following [description]
   * @param  {[type]} follower  [description]
   * @return {[type]}           [description]
   */
  unFollow: function unFollow(following, follower) {
    return UserFollow.remove({
      following_id: following,
      follower_id: follower
    })
  },

  /**
   * 是否关注
   * @param  {[type]}  following 被关注者
   * @param  {[type]}  follower  关注者
   * @return {Boolean}           [description]
   */
  hasFollow: function hasFollow(following, follower) {
    return UserFollow
      .findOne({following_id: following, follower_id: follower})
      .then(function(userFollowFind) {
        return Promise.resolve(!!userFollowFind);
      })
  }


};