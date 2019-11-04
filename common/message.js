/*!
 * message common
 */

var Promise = require('bluebird')
var models = require('../models')
var Message = models.Message

exports.sendReplyMessage = function (masterId, authorId, postId, replyId) {
  var message = new Message()
  message.type = 'reply'
  message.master_id = masterId
  message.author_id = authorId
  message.post_id = postId
  message.reply_id = replyId
  message.save()
  return Promise.resolve(message)
}

exports.sendAtMessage = function (masterId, authorId, postId, replyId) {
  var message = new Message()
  message.type = 'at'
  message.master_id = masterId
  message.author_id = authorId
  message.post_id = postId
  message.reply_id = replyId
  message.save()
  return Promise.resolve(message)
}
