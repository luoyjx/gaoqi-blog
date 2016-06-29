/*!
 * reply controller
 */

var Promise = require('bluebird');
var validator = require('validator');
var _ = require('lodash');

var at = require('../common/at');
var message = require('../common/message');
var User = require('../dao').User;
var Post = require('../dao').Post;
var Reply = require('../dao').Reply;
var config = require('../config');

/**
 * 添加回复
 */
exports.add = function (req, res, next) {
  var content = req.body.r_content;
  var post_id = req.params._id;
  var reply_id = req.body.reply_id;

  var str = validator.trim(content);
  if (str === '') {
    res.status(422);
    return res.render('notify/notify', {error: '回复内容不能为空！'});
  }

  var _post;

  Post
    .getPost(post_id)
    .then(function(postFind) {
      if (postFind.lock) {
        return res.status(403).wrapSend('此主题已锁定。');
      }

      _post = postFind;

      return User.getUserById(postFind.author_id);
    })
    .then(function(userFind) {
      return Promise
        .all([
          Reply
            .newAndSave(content, post_id, req.session.user._id, reply_id)
            .then(function(reply) {
              //发送at消息，并防止重复 at 作者
              var newContent = content.replace('@' + userFind.login_name + ' ', '');
              at.sendMessageToMentionUsers(newContent, post_id, req.session.user._id, reply._id, userFind.login_name, _post.title);
              _post.reply_count += 1;
              _post.update_at = new Date();
              _post.save();
              return Promise.resolve(reply);
            })
            .then(function(reply) {
              if (_post.author_id.toString() !== req.session.user._id.toString()) {
                message.sendReplyMessage(_post.author_id, req.session.user._id, _post._id, reply._id);
              }
              return Promise.resolve(reply);
            }),
          User
            .getUserById(req.session.user._id)
            .then(function(user) {
              user.score += 5;
              user.reply_count += 1;
              user.save();
              req.session.user = user;
            })
        ]);
    })
    .spread(function(reply) {
      res.redirect('/p/' + post_id + '#' + reply._id);
    })
    .catch(function(err) {
      next(err);
    });
};
