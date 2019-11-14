/*!
 * tag dao
 */
const Promise = require('bluebird')

const models = require('../models')
const Tag = models.Tag

/**
 * 获得热门标签
 * Callback:
 * - err, 数据库错误
 * - tags, 热门标签
 * @param {Object} options 查询选项
 */
exports.getHotTagsByQuery = options => {
  return Tag.find({}, { name: 1, _id: 0 }, options).exec()
}

/**
 * 根据名称查询一个tag
 * Callback:
 * - err, 数据库错误
 * - tag, Tag信息
 * @param {String} name 标签名称
 */
exports.getTagByName = name => {
  return Tag.findOne({ name: name }).exec()
}

/**
 * 根据条件查询所有的标签
 * Callback:
 * - err, 数据库错误
 * - tags, 多个标签
 * @param {String} query 查询条件
 * @param {Object} opt 查询选项
 */
exports.getAllTagsByQuery = (query, opt) => {
  return Tag.find(query, {}, opt).exec()
}

/**
 * 查询Tag的总数
 * Callback:
 * - err, 数据库错误
 * - count, 总数
 * @param {String} query 查询参数
 */
exports.getCountByQuery = query => {
  return Tag.count(query).exec()
}

/**
 * 新增一条tag信息
 * @param {String} name tag名称
 * @param {String} description tag描述信息
 */
exports.newAndSave = (name, description) => {
  const tag = new Tag()
  tag.name = name
  tag.description = description
  tag.save()
  return Promise.resolve(tag)
}

/**
 * 更新或新增tag信息
 * @param {String} query 需要更新的过滤
 * @param {Object} update 更新的字段
 * @param {Object} opts 选项，如 {upsert: true}
 */
exports.upsert = (query, update, opts) => {
  return Tag.update(query, update, opts).exec()
}
