/*!
 * 消息dao
 */

var EventProxy = require('eventproxy');
var _ = require('lodash');

var Message = require('../models').Message;

var User = require('./user');
var Post = require('./post');
var Reply = require('./reply');

/**
 * 根据用户id获取未读消息的数量
 * Callback:
 * - err, 数据库错误
 * - count, 未读消息数量
 * @param {String} id 用户id
 * @param {Function} callback 获取消息数量
 */
exports.getMessagesCount = function getMessagesCount(id, callback) {
  Message.count({master_id: id, has_read: false}, callback);
};

/**
 * 根据消息id获取消息
 * Callback:
 * - err, 数据库错误
 * - message, 消息对象
 * @param {String} id 消息ID
 * @param {Function} callback 回调函数
 */
exports.getMessageById = function getMessageById(id, callback) {
  Message.findOne({_id: id}, function(err, message) {
    if (err) {
      return callback(err);
    }
    getMessageRelations(message, callback);
  });
};

var getMessageRelations = exports.getMessageRelations = function (message, callback) {
  if (message.type === 'reply' || message.type === 'reply2' || message.type === 'at') {
    var proxy = new EventProxy();
    proxy.fail(callback);
    proxy.assign('author', 'post', 'reply', function (author, post, reply) {
      message.author = author;
      message.post = post;
      message.reply = reply;
      if (!author || !post) {
        message.is_invalid = true;
      }
      return callback(null, message);
    }); // 接收异常
    User.getUserById(message.author_id, proxy.done('author'));
    Post.getPostById(message.post_id, proxy.done('post'));
    Reply.getReplyById(message.reply_id, proxy.done('reply'));
  } else {
    return callback(null, {is_invalid: true});
  }
};

/**
 * 根据用户ID，获取已读消息列表
 * Callback:
 * - err, 数据库异常
 * - messages, 消息列表
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getReadMessagesByUserId = function (userId, callback) {
  Message.find({master_id: userId, has_read: true}, null,
    {sort: '-create_at', limit: 20}, callback);
};

/**
 * 根据用户ID，获取未读消息列表
 * Callback:
 * - err, 数据库异常
 * - messages, 未读消息列表
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUnreadMessageByUserId = function (userId, callback) {
  Message.find({master_id: userId, has_read: false}, null,
    {sort: '-create_at'}, callback);
};


/**
 * 将消息设置成已读
 */
exports.updateMessagesToRead = function (userId, messages, callback) {
  callback = callback || _.noop;
  if (messages.length === 0) {
    return callback();
  }

  var ids = messages.map(function (m) {
    return m.id;
  });

  var query = { master_id: userId, _id: { $in: ids } };
  Message.update(query, { $set: { has_read: true } }, { multi: true }).exec(callback);
};