/*!
 * tag dao
 */
var EventProxy = require('eventproxy');
var models = require('../models');
var Tag = models.Tag;

/**
 * 获得热门标签
 * Callback:
 * - err, 数据库错误
 * - tags, 热门标签
 * @param {Object} options 查询选项
 * @param {Function} callback 回调函数
 */
exports.getHotTagsByQuery = function (options, callback) {
  Tag.find({}, {name: 1, _id: 0}, options, function (err, tags) {
    if (err) {
      callback(err);
    }
    if (tags.length === 0) {
      callback(null, []);
    }
    callback(null, tags);
  });
};

/**
 * 根据名称查询一个tag
 * Callback:
 * - err, 数据库错误
 * - tag, Tag信息
 * @param {String} name 标签名称
 * @param {Function} callback 回调函数
 */
exports.getTagByName = function (name, callback) {
  Tag.findOne({name: name}, callback);
};

/**
 * 根据条件查询所有的标签
 * Callback:
 * - err, 数据库错误
 * - tags, 多个标签
 * @param {String} query 查询条件
 * @param {Object} opt 查询选项
 * @param {Function} callback 回调函数
 */
exports.getAllTagsByQuery = function (query, opt, callback) {
  Tag.find(query, {}, opt, callback);
};

/**
 * 查询Tag的总数
 * Callback:
 * - err, 数据库错误
 * - count, 总数
 * @param {String} query 查询参数
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
  Tag.count(query, callback);
};

/**
 * 新增一条tag信息
 * @param {String} name tag名称
 * @param {String} description tag描述信息
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function (name, description, callback) {
  var tag = new Tag();
  tag.name = name;
  tag.description = description;
  tag.save(callback);
};

/**
 * 更新或新增tag信息
 * @param {String} query 需要更新的过滤
 * @param {Object} update 更新的字段
 * @param {Object} opts 选项，如 {upsert: true}
 * @param {Function} callback 回调函数
 */
exports.upsert = function (query, update, opts, callback) {
  Tag.update(query, update, opts, callback);
};

