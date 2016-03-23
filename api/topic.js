/*！
 * 微信文章 api
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */

var EventProxy = require('eventproxy');
var Topic = require('../dao').Topic;
var TopicCategory = require('../dao').TopicCategory;
var TopicAccount = require('../dao').TopicAccount;
var validator = require('validator');

/**
 * 通过api接口添加微信文章
 * @param req
 * @param res
 * @param next
 */
exports.create = function(req, res, next) {
  var title = validator.trim(req.body.title);//文章标题
  var link = validator.trim(req.body.link);//文章链接
  var accountName = validator.trim(req.body.accountName);//公众号名称
  var accountLink = validator.trim(req.body.accountLink);//公众号链接
  var categoryName = validator.trim(req.body.category);//分类名称

  var ep = new EventProxy();
  ep.fail(next);
  var events = ['topic_account', 'topic_category'];

  ep.assign(events, function(topic_account, topic_category) {
    console.log('pre save done');
    //存储文章
    Topic.newAndSave(title, '', topic_category._id, link, topic_account._id, function(err, topic) {
      if (err) {
        next(err);
      }
      res.send({
        success: 1,
        topic_id: topic._id
      });
    });
  });

  TopicAccount.findOneByName(accountName, function(err, topicAccount) {
    if (err) {
      return console.log(err);
    }

    if (!topicAccount) {
      TopicAccount.newAndSave(accountName, accountLink, function(err, account) {
        ep.emit('topic_account', account);
      })
    } else {
      ep.emit('topic_account', topicAccount);
    }
  });

  TopicCategory.findOneByName(categoryName, function(err, topicCategory) {
    if (err) return next(err);

    if (!topicCategory) {
      TopicCategory.newAndSave(categoryName, function(err, category) {
        ep.emit('topic_category', category);
      })
    } else {
      ep.emit('topic_category', topicCategory);
    }
  })


};