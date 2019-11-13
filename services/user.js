/*!
 * user dao
 */
const url = require('url')
const qn = require('qn')
const gravatar = require('gravatar')
const request = require('request')
const Promise = require('bluebird')
const uuid = require('node-uuid')

const models = require('../models')
const config = require('../config')

const User = models.User
let qnClient = null

if (config.qn_avatar_access.secretKey !== 'your secret key') {
  qnClient = qn.create(config.qn_avatar_access)
}

/**
 * 根据多个用户名查询多个用户信息
 * Callback:
 * - err, 数据库错误
 * - users, 多个用户信息
 * @param {Array} names 多个用户名
 */
exports.getUsersByNames = names => {
  if (names.length === 0) return Promise.resolve([])
  return User.find({ login_name: { $in: names } }).exec()
}

/**
 * 根据id查询用户
 * Callback:
 * - err, 数据库错误
 * - user, 用户信息
 * @param {String} id 用户id
 */
exports.getUserById = id => {
  return User.findOne({ _id: id }).exec()
}

/**
 * 通过登录名查询用户
 * Callback:
 * - err, 数据库错误
 * - user, 用户信息
 * @param {String} loginName 登录名
 */
exports.getUserByLoginName = loginName => {
  return User.findOne({ login_name: loginName }).exec()
}

/**
 * 根据邮箱查询用户
 * Callback:
 * - err, 数据库错误
 * - user, 用户信息
 * @param {String} email 邮箱
 */
exports.getUserByEmail = email => {
  return User.findOne({ email: email })
}

/**
 * 根据查询条件，获取一个用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} login_name 用户名
 * @param {String} key 激活码
 */
exports.getUserByNameAndKey = (loginName, key) => {
  return User.findOne({ login_name: loginName, retrieve_key: key }).exec()
}

/**
 * 根据关键字，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String|object} query 关键字
 * @param {Object} opt 选项
 */
exports.getUsersByQuery = (query, opt) => {
  return User.find(query, '', opt).exec()
}

/**
 * 查询一个并更新
 * @param {Object} query 查询条件
 * @param {Object} update 更新属性
 * @returns {Promise}
 */
exports.findOneAndUpdate = (query, update) => {
  return User.findOneAndUpdate(query, update).exec()
}

/**
 * 关注数增加
 * @param  {[type]} userId [description]
 * @return {[type]}        [description]
 */
exports.incFollowingCount = userId => {
  return User.update({ _id: userId }, { $inc: { following_count: 1 } }).exec()
}

/**
 * 关注数减少
 * @param  {[type]} userId [description]
 * @return {[type]}        [description]
 */
exports.decFollowingCount = userId => {
  return User.update({ _id: userId }, { $inc: { following_count: -1 } }).exec()
}

/**
 * 增加文章收藏数
 * @param  {[type]} userId 用户id
 * @return {[type]}        [description]
 */
exports.incCollectCount = userId => {
  return User.update(
    { _id: userId },
    { $inc: { collect_post_count: 1 } }
  ).exec()
}

/**
 * 减少文章收藏数
 * @param  {[type]} userId [description]
 * @return {[type]}        [description]
 */
exports.decCollectCount = userId => {
  return User.update(
    { _id: userId },
    { $inc: { collect_post_count: -1 } }
  ).exec()
}

/**
 * 创建并保存用户信息
 * @param {String} name 用户名称
 * @param {String} login_name 登录名
 * @param {String} pass 密码
 * @param {String} email 邮箱
 * @param {String} avatar_url 头像地址
 * @param {Boolean} active 是否激活
 */
exports.newAndSave = (name, loginName, pass, email, avatarUrl, active) => {
  const user = new User()
  user.name = loginName
  user.login_name = loginName
  user.pwd = pass
  user.email = email
  user.is_active = active || false
  user.avatar = avatarUrl
  user.accessToken = uuid.v4()
  user.save()
  return Promise.resolve(user)
}

/**
 * 根据邮箱生成头像地址
 * @param {String} email 邮箱
 * @returns {string} avatar地址
 */
exports.makeGravatar = email => {
  const urlObj = url.URL(gravatar.url(email, { d: 'retro' }))
  const avatarUrl = urlObj.path
  const avatarPath = avatarUrl.replace('//www.gravatar.com', '')
  const avatarKey = avatarPath.split('?')[0]
  console.log(avatarUrl)
  console.log(avatarKey)

  if (qnClient) {
    qnClient.upload(
      request('http:' + avatarUrl),
      { key: avatarKey },
      (err, result) => {
        if (err) return console.error(err)
        console.log(result)
      }
    )
  }

  return config.avatar_static_host + avatarKey
}
