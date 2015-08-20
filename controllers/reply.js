/*!
 * reply controller
 */

var validator = require('validator');
var _ = require('lodash');


var EventProxy = require('eventproxy');
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

  var ep = EventProxy.create();
  ep.fail(next);

  Post.getPost(post_id, ep.doneLater(function (post) {
    if (!post) {
      ep.unbind();
      // just 404 page
      return next();
    }
    if (post.lock) {
      return res.status(403).send('此主题已锁定。');
    }
    ep.emit('post', post);
  }));

  ep.all('post', function (post) {
    User.getUserById(post.author_id, ep.done('post_author'));
  });

  ep.all('post', 'post_author', function (post, postAuthor) {
    Reply.newAndSave(content, post_id, req.session.user._id, reply_id, ep.done(function (reply) {
      ep.emit('reply_saved', reply);
      //发送at消息，并防止重复 at 作者
      var newContent = content.replace('@' + postAuthor.loginname + ' ', '');
      at.sendMessageToMentionUsers(newContent, post_id, req.session.user._id, reply._id);
      post.reply_count += 1;
      post.save();
    }));

    User.getUserById(req.session.user._id, ep.done(function (user) {
      user.score += 5;
      user.reply_count += 1;
      user.save();
      req.session.user = user;
      ep.emit('score_saved');
    }));
  });

  ep.all('reply_saved', 'post', function (reply, post) {
    if (post.author_id.toString() !== req.session.user._id.toString()) {
      message.sendReplyMessage(post.author_id, req.session.user._id, post._id, reply._id);
    }
    ep.emit('message_saved');
  });

  ep.all('reply_saved', 'message_saved', 'score_saved', function (reply) {
    res.redirect('/p/' + post_id + '#' + reply._id);
  });
};

/**
 * 删除回复信息
 */
exports.delete = function (req, res, next) {
  var reply_id = req.body.reply_id;
  Reply.getReplyById(reply_id, function (err, reply) {
    if (err) {
      return next(err);
    }

    if (!reply) {
      res.status(422);
      res.json({status: 'no reply ' + reply_id + ' exists'});
      return;
    }
    if (reply.author_id.toString() === req.session.user._id.toString() || req.session.user.is_admin) {
      reply.remove();
      res.json({status: 'success'});

      if (!reply.reply_id) {
        reply.author.score -= 5;
        reply.author.reply_count -= 1;
        reply.author.save();
      }
    } else {
      res.json({status: 'failed'});
      return;
    }

    Post.reduceCount(reply.post_id, _.noop);
  });
};
/*
 打开回复编辑器
 */
exports.showEdit = function (req, res, next) {
  var reply_id = req.params.reply_id;

  Reply.getReplyById(reply_id, function (err, reply) {
    if (!reply) {
      res.status(422);
      res.render('notify/notify', {error: '此回复不存在或已被删除。'});
      return;
    }
    if (req.session.user._id.equals(reply.author_id) || req.session.user.is_admin) {
      res.render('reply/edit', {
        reply_id: reply._id,
        content: reply.content
      });
    } else {
      res.status(403);
      res.render('notify/notify', {error: '对不起，你不能编辑此回复。'});
    }
  });
};
/*
 提交编辑回复
 */
exports.update = function (req, res, next) {
  var reply_id = req.params.reply_id;
  var content = req.body.t_content;

  Reply.getReplyById(reply_id, function (err, reply) {
    if (!reply) {
      res.render('notify/notify', {error: '此回复不存在或已被删除。'});
      return;
    }

    if (String(reply.author_id) === req.session.user._id.toString() || req.session.user.is_admin) {

      if (content.trim().length > 0) {
        reply.content = content;
        reply.save(function (err) {
          if (err) {
            return next(err);
          }
          res.redirect('/p/' + reply.post_id + '#' + reply._id);
        });
      } else {
        res.render('notify/notify', {error: '回复的字数太少。'});
      }
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此回复。'});
    }
  });
};