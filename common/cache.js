/*!
 * cache
 */
var Promise = require('bluebird');
var redis = require('./redis');

/**
 * 从cache中取出缓存
 * @param key 键
 */
var get = function (key) {
  return redis
      .get(key)
      .then(function (data) {
        return Promise.resolve(JSON.parse(data));
      });
};

exports.get = get;


/**
 * 将键值对数据缓存起来
 *
 * @param key  键
 * @param value 值
 * @param time 参数可选，秒为单位
 */
var set = function (key, value, time) {
  value = JSON.stringify(value);
  if (!time) {
    return redis.set(key, value);
  } else {
    //将毫秒单位转为秒
    return redis.setex(key, parseInt(time), value);
  }
};

exports.set = set;
