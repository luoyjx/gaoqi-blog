/*!
 * category dao
 */

var models = require('../models');
var Category = models.Category;

/**
 * 查询所有分类
 * Callback:
 * - err, 数据库错误
 * - categories, 多个分类信息
 * @param {Function} callback 回调函数
 */
exports.getAllCategory = function (callback) {
  Category.find({}, {_id: 0, name: 1, show_name: 1}, {}, function (err, categories) {
    if (err) {
      return callback(err, null);
    }
    if (categories.length === 0) {
      return callback(null, []);
    }
    callback(null, categories);
  });
};

/**
 * 通过分类名(非显示名称)查询一个分类信息
 * Callback:
 * - err, 数据库错误
 * - category, 分类信息
 * @param {String} name 分类名
 * @param {Function} callback 回调函数
 */
exports.getCategoryByName = function (name, callback) {
  Category.findOne({name: name}, callback);
};

/**
 * 通过分类id查询一个分类
 * Callback:
 * - err, 数据库错误
 * - category, 分类信息
 * @param {String} id 分类id
 * @param {Function} callback 回调函数
 */
exports.getCategoryById = function (id, callback) {
  Category.findOne({_id: id}, callback);
};

