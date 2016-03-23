/*！
 * 微信号 dao
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */

var EventProxy = require('eventproxy');
var models = require('../models');
var TopicAccount = models.TopicAccount;

/**
 * 创建微信公众号信息
 * Callback:
 * - err, 错误信息
 * - topicAccount, 公众号信息
 * @param {String} name 公众号名称
 * @param {String} link 公众号搜狗链接
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function(name, link, callback) {
  var topicAccount = new TopicAccount();
  topicAccount.name = name;
  topicAccount.link = link;
  topicAccount.save(callback);
};

/**
 * 根据名称查询
 * Callback:
 * - err, 错误信息
 * - topicAccount, 微信公众号
 * @param {String} name 名称
 * @param {Function} callback 回调函数
 */
exports.findOneByName = function(name, callback) {
  TopicAccount.findOne({name: name}, callback);
};