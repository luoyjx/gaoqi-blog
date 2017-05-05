/*!
 * message common
 */

var Promise = require('bluebird');
var models       = require('../models');
var Message      = models.Message;

exports.sendReplyMessage = function (master_id, author_id, post_id, reply_id) {
  var message = new Message();
  message.type = 'reply';
  message.master_id = master_id;
  message.author_id = author_id;
  message.post_id  = post_id;
  message.reply_id  = reply_id;
  message.save();
  return Promise.resolve(message);
};

exports.sendAtMessage = function (master_id, author_id, post_id, reply_id) {

  var message = new Message();
  message.type = 'at';
  message.master_id = master_id;
  message.author_id = author_id;
  message.post_id  = post_id;
  message.reply_id  = reply_id;
  message.save();
  return Promise.resolve(message);
};
