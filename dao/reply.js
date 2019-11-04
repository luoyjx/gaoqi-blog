/*!
 * reply dao
 */

var Promise = require('bluebird')
var models = require('../models')
var Reply = models.Reply

var tools = require('../common/tools')
var at = require('../common/at')
var User = require('./user')

/**
 * 获取一条回复信息
 * @param {String} id 回复ID
 */
exports.getReply = function (id) {
  return new Promise(function (resolve, reject) {
    Reply.findOne({ _id: id }, function (err, reply) {
      if (err) return reject(err)
      resolve(reply)
    })
  })
}

/**
 * 根据回复ID，获取回复
 * Callback:
 * - err, 数据库异常
 * - reply, 回复内容
 * @param {String} id 回复ID
 */
exports.getReplyById = function (id) {
  var _reply

  return Reply
    .findOne({ _id: id })
    .then(function (replyFind) {
      if (!replyFind) return Promise.resolve()

      _reply = replyFind

      var authorId = replyFind.author_id

      return Promise
        .all([
          User.getUserById(authorId),
          at.linkUsers(_reply.content)
        ])
    })
    .spread(function (userFind, replyContent) {
      _reply.author = userFind
      _reply.friendly_create_at = tools.formatDate(_reply.create_at, true)
      _reply.content = replyContent
      return Promise.resolve(_reply)
    })
}

/**
 * 根据条件查询回复
 * @param query
 * @param option
 */
exports.getRepliesByQuery = function (query, option) {
  return Reply
    .find(query, {}, option)
    .populate('post_id')
    .populate('author_id')
    .exec()
}

/**
 * 根据主题ID，获取回复列表
 * Callback:
 * - err, 数据库异常
 * - replies, 回复列表
 * @param {String} id 文章ID
 */
exports.getRepliesByPostId = function (id) {
  return Reply
    .find({ post_id: id }, '', { sort: 'create_at' })
    .exec()
    .then(function (replies) {
      if (replies.length === 0) {
        return Promise.resolve([])
      }
      return Promise.map(replies, function (reply) {
        return User
          .getUserById(reply.author_id)
          .then(function (author) {
            reply.author = author || { _id: '' }
            reply.friendly_create_at = tools.formatDate(reply.create_at, true)
            reply.content = at.linkUsers(reply.content)
            return reply
          })
      })
    })
}

/**
 * 创建并保存一条回复信息
 * @param {String} content 回复内容
 * @param {String} postId 文章ID
 * @param {String} authorId 回复作者
 * @param {String} [replyId] 回复ID，当二级回复时设定该值
 */
exports.newAndSave = function (content, postId, authorId, replyId) {
  var reply = new Reply()
  reply.content = content
  reply.post_id = postId
  reply.author_id = authorId
  if (replyId) {
    reply.reply_id = replyId
  }
  reply.save()
  return Promise.resolve(reply)
}

/**
 * 根据作者id查询回复
 * @param authorId
 * @param opt
 */
exports.getRepliesByAuthorId = function (authorId, opt) {
  return Reply
    .find({ author_id: authorId }, {}, opt)
    .exec()
    .then(function (replies) {
      if (replies.length === 0) {
        return Promise.resolve([])
      }
      return Promise.map(replies, function (reply) {
        return User
          .getUserById(reply.author_id)
          .then(function (author) {
            reply.author = author || { _id: '' }
            reply.friendly_create_at = tools.formatDate(reply.create_at, true)
            return reply
          })
      })
    })
}

/**
 * 通过 author_id 获取回复总数
 * @param authorId 作者ID
 */
exports.getCountByAuthorId = function (authorId) {
  return Reply.count({ author_id: authorId }).exec()
}
