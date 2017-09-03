'use strict'

const Promise = require('bluebird')
const _ = require('lodash')
const Message = require('../models').Message
const User = require('./user')
const Post = require('./post')
const Reply = require('./reply')

const getMessageRelations = exports.getMessageRelations = function (message) {
  if (message.type === 'reply' || message.type === 'reply2' || message.type === 'at') {
    return Promise
      .all([
        User.getUserById(message.author_id),
        Post.getPostById(message.post_id),
        Reply.getReplyById(message.reply_id)
      ])
      .spread(function (author, post, reply) {
        message = _.extend(message.toObject(), {
          author,
          post: post[0],
          reply
        })
        if (!author || !post[0]) {
          message.is_invalid = true
        }

        return Promise.resolve(message)
      })
  }
  return Promise.resolve({ is_invalid: true })
}

/**
 * 根据用户id获取未读消息的数量
 * Callback:
 * - err, 数据库错误
 * - count, 未读消息数量
 * @param {String} id 用户id
 */
exports.getMessagesCount = function getMessagesCount (id) {
  return Message.count({ master_id: id, has_read: false }).exec()
}

/**
 * 根据消息id获取消息
 * Callback:
 * - err, 数据库错误
 * - message, 消息对象
 * @param {String} id 消息ID
 * @param {Function} callback 回调函数
 */
exports.getMessageById = function getMessageById (id) {
  return Message
    .findOne({ _id: id })
    .exec()
    .then(function (message) {
      return getMessageRelations(message)
    })
}

/**
 * 根据用户ID，获取已读消息列表
 * Callback:
 * - err, 数据库异常
 * - messages, 消息列表
 * @param {String} userId 用户ID
 */
exports.getReadMessagesByUserId = function (userId) {
  return Message
    .find(
      { master_id: userId, has_read: true },
      null,
      { sort: '-create_at', limit: 20 }
    )
    .exec()
}

/**
 * 根据用户ID，获取未读消息列表
 * Callback:
 * - err, 数据库异常
 * - messages, 未读消息列表
 * @param {String} userId 用户ID
 */
exports.getUnreadMessageByUserId = function (userId) {
  return Message
    .find({ master_id: userId, has_read: false }, null, { sort: '-create_at' })
    .exec()
}

/**
 * 将消息设置成已读
 */
exports.updateMessagesToRead = function (userId, messages) {
  const ids = messages.map(function (m) {
    return m.id
  })
  const query = { master_id: userId, _id: { $in: ids } }
  return Message
    .update(query, { $set: { has_read: true } }, { multi: true })
    .exec()
}
