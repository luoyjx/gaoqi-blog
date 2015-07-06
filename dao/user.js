/*!
 * user dao
 */
var models = require('../models');
var User = models.User;
var utility = require('utility');
var uuid = require('node-uuid');
var config = require('../config');


/**
 * 根据多个用户名查询多个用户信息
 * Callback:
 * - err, 数据库错误
 * - users, 多个用户信息
 * @param {Array} names 多个用户名
 * @param {Function} callback 回调函数
 */
exports.getUsersByNames = function (names, callback) {
  if (names.length === 0) {
    return callback(null, []);
  }
  User.find({'login_name': {$in: names}}, callback);
};

/**
 * 根据id查询用户
 * Callback:
 * - err, 数据库错误
 * - user, 用户信息
 * @param {String} id 用户id
 * @param {Function} callback 回调函数
 */
exports.getUserById = function (id, callback) {
  User.findOne({_id: id}, callback);
};

/**
 * 通过登录名查询用户
 * Callback:
 * - err, 数据库错误
 * - user, 用户信息
 * @param {String} loginName 登录名
 * @param {Function} callback 回调函数
 */
exports.getUserByLoginName = function (loginName, callback) {
  User.findOne({'login_name': loginName}, callback);
};

/**
 * 根据邮箱查询用户
 * Callback:
 * - err, 数据库错误
 * - user, 用户信息
 * @param {String} email 邮箱
 * @param {Function} callback 回调函数
 */
exports.getUserByEmail = function (email, callback) {
  User.findOne({'email': email}, callback);
};

/**
 * 根据查询条件，获取一个用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} login_name 用户名
 * @param {String} key 激活码
 * @param {Function} callback 回调函数
 */
exports.getUserByNameAndKey = function (login_name, key, callback) {
  User.findOne({login_name: login_name, retrieve_key: key}, callback);
};

/**
 * 根据关键字，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getUsersByQuery = function (query, opt, callback) {
  User.find(query, '', opt, callback);
};

/**
 * 创建并保存用户信息
 * @param {String} name 用户名称
 * @param {String} login_name 登录名
 * @param {String} pass 密码
 * @param {String} email 邮箱
 * @param {String} avatar_url 头像地址
 * @param {Boolean} active 是否激活
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function (name, login_name, pass, email, avatar_url, active, callback) {
  var user = new User();
  user.name = login_name;
  user.login_name = login_name;
  user.pwd = pass;
  user.email = email;
  user.is_active = active || false;
  user.avatar = avatar_url;
  user.accessToken = uuid.v4();
  user.save(callback);
};

/**
 * 根据邮箱生成头像地址
 * @param {String} email 邮箱
 * @returns {string} avatar地址
 */
exports.makeGravatar = function () {
  return config.site_static_host + '/avatar/default.png';
};