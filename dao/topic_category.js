/*！
 * 文章分类 dao
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */
var EventProxy = require('eventproxy');
var models = require('../models');
var TopicCategory = models.TopicCategory;

/**
 * 添加文章分类信息
 * Callback:
 * - err, 错误信息
 * - topicCategory, 文章分类
 * @param {String} name 分类名称
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function(name, callback) {
  var topicCategory = new TopicCategory();
  topicCategory.name = name;
  topicCategory.save(callback);
};

/**
 * 通过名称查询文章分类
 * Callback:
 * - err, 错误信息
 * - topicCategory, 文章分类实体
 * @param {String} name 名称
 * @param {Function} callback 回调函数
 */
exports.findOneByName = function(name, callback) {
  TopicCategory.findOne({name: name}, callback);
};