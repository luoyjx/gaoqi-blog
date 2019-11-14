/*!
 * message common
 */

const Promise = require('bluebird')
const models = require('../models')
const Message = models.Message

exports.sendReplyMessage = (masterId, authorId, postId, replyId) => {
  const message = new Message()
  message.type = 'reply'
  message.master_id = masterId
  message.author_id = authorId
  message.post_id = postId
  message.reply_id = replyId
  message.save()
  return Promise.resolve(message)
}

exports.sendAtMessage = (masterId, authorId, postId, replyId) => {
  const message = new Message()
  message.type = 'at'
  message.master_id = masterId
  message.author_id = authorId
  message.post_id = postId
  message.reply_id = replyId
  message.save()
  return Promise.resolve(message)
}
