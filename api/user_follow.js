'use strict';

const validator = require('validator');
const UserFollow = require('../services/user_follow');

/**
 * 关注
 */
exports.follow = function *follow() {
  const followingId = validator.trim(this.query.following_id);

  yield UserFollow.follow(followingId, this.user._id);

  this.body = {
    success: 1
  };
};

/**
 * 取消关注
 */
exports.unFollow = function *unFollow() {
  const followingId = validator.trim(this.query.following_id);

  yield UserFollow.unFollow(followingId, this.user._id);

  this.body = {
    success: 1
  };
};
