/*!
 * reply dao
 */

const Promise = require('bluebird')

const models = require('../models')
const tools = require('../common/tools')
const at = require('../common/at')
const User = require('./user')

const Reply = models.Reply

/**
 * 获取一条回复信息
 * @param {String} id 回复ID
 */
exports.getReply = id => {
  return new Promise((resolve, reject) => {
    Reply.findOne({ _id: id }, (err, reply) => {
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
exports.getReplyById = async id => {
  const replyFind = await Reply.findOne({ _id: id })
  if (!replyFind) return
  const authorId = replyFind.author_id

  const [userFind, replyContent] = await Promise.all([
    User.getUserById(authorId),
    at.linkUsers(replyFind.content)
  ])

  replyFind.author = userFind
  replyFind.friendly_create_at = tools.formatDate(replyFind.create_at, true)
  replyFind.content = replyContent
  return replyFind
}

/**
 * 根据条件查询回复
 * @param query
 * @param option
 */
exports.getRepliesByQuery = (query, option) => {
  return Reply.find(query, {}, option)
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
exports.getRepliesByPostId = async id => {
  const replies = await Reply.find({ post_id: id }, '', {
    sort: 'create_at'
  }).exec()
  if (replies.length === 0) {
    return []
  }

  return Promise.map(replies, async reply => {
    const author = await User.getUserById(reply.author_id)
    reply.author = author || { _id: '' }
    reply.friendly_create_at = tools.formatDate(reply.create_at, true)
    reply.content = at.linkUsers(reply.content)
    return reply
  })
}

/**
 * 创建并保存一条回复信息
 * @param {String} content 回复内容
 * @param {String} postId 文章ID
 * @param {String} authorId 回复作者
 * @param {String} [replyId] 回复ID，当二级回复时设定该值
 */
exports.newAndSave = (content, postId, authorId, replyId) => {
  const reply = new Reply()
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
exports.getRepliesByAuthorId = async (authorId, opt) => {
  const replies = await Reply.find({ author_id: authorId }, {}, opt).exec()

  if (replies.length === 0) {
    return []
  }

  return Promise.map(replies, async reply => {
    const author = await User.getUserById(reply.author_id)
    reply.author = author || { _id: '' }
    reply.friendly_create_at = tools.formatDate(reply.create_at, true)
    return reply
  })
}

/**
 * 通过 author_id 获取回复总数
 * @param authorId 作者ID
 */
exports.getCountByAuthorId = authorId => {
  return Reply.count({ author_id: authorId }).exec()
}
