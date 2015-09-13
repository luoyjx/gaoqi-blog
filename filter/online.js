/*!
 * 在线缓存
 * 缓存一定时间内访问过的已登陆用户
 */

var cacheTool = require('../common/cache');

/**
 * 访问时将已登陆用户访问缓存在线
 * @param req
 * @param res
 * @param next
 */
exports.cacheOnline = function(req, res, next) {
  if (req.session.user) {
    cacheTool.set(encode(req.session.user._id), {online: 1}, 1000 * 60 * 30);//30分钟
  }
  next();
};

/**
 * 是否在线
 * @param userId
 * @param callback
 */
exports.isOnline = function(userId, callback) {
  cacheTool.get(encode(userId), function(err, data) {
    if (err) {
      return callback(err);
    }
    if (!data) {
      return callback(null, false);
    }
    callback(null, true);
  })
};

/**
 * 生成key
 * @param uid
 * @returns {string}
 */
function encode(uid) {
  return 'online:' + uid;
}