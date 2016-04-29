/*！
 * 微信文章 dao
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */

var EventProxy = require('eventproxy');
var models = require('../models');
var Topic = models.Topic;

/**
 * 添加微信主题信息
 * Callback:
 * - err, 错误信息
 * - topic, 主题信息
 * @param {String} title 标题
 * @param {String} description 描述信息
 * @param {ObjectId} category 主题分类
 * @param {String} link 文章链接地址
 * @param {ObjectId} account 微信号
 * @param {Function} callback 回调
 */
exports.newAndSave = function(title, description, category, link, account, callback) {
  var topic = new Topic();
  topic.title = title;
  topic.description = description;
  topic.category = category;
  topic.link = link;
  topic.account = account;
  topic.save(callback);
};

/**
 * 通过标题查询微信文章
 * Callback:
 * - err, 错误信息
 * - topic, 主题实体
 * @param {String} title 标题
 * @param {Function} callback 回调函数
 */
exports.findOneByTitle = function(title, callback) {
  Topic.findOne({title: title}, callback);
};