'use strict';
/**
 * 在线缓存
 * 缓存一定时间内访问过的已登陆用户
 */

const cacheTool = require('../common/cache');

/**
 * 访问时将已登陆用户访问缓存在线
 */
exports.cacheOnline = function *cacheOnline(next) {
  if (this.session.user) {
    cacheTool.set(encode(this.session.user._id), { online: 1 }, 60); // 1分钟
  }

  yield next;
};

/**
 * 是否在线
 * @param userId
 */
exports.isOnline = function (userId) {
  return cacheTool.get(encode(userId));
};

/**
 * 生成key
 * @param uid
 * @returns {string}
 */
function encode(uid) {
  return 'online:' + uid;
}
