/*!
 * user controller
 */
var Post = require('../dao').Post;
var User = require('../dao').User;
var Reply = require('../dao').Reply;
var validator = require('validator');
var EventProxy = require('eventproxy');
var config = require('../config');

/**
 * 个人主页
 * @param req
 * @param res
 * @param next
 */
exports.index = function (req, res, next) {
  var user_name = validator.trim(req.params.name);
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  page = page > 0 ? page : 1;

  var user_ep = new EventProxy();
  user_ep.fail(next);

  User.getUserByLoginName(user_name, user_ep.done('find_user'));

  user_ep.all('find_user', function(user) {
    if (!user) {
      return res.render('notify/notify', {
        error: '并没有找到这样一个作者'
      });
    }

    var proxy = new EventProxy();
    var events = ['latest', 'pages'];

    proxy.all(events, function(latest, pages) {
      res.render('user/home', {
        author: user.login_name,
        latest: latest,
        pages: pages,
        current_page: page,
        title: user.name + '的个人主页'
      });
    });
    proxy.fail(next);

    var post_query = {author_id: user._id};
    var limit = config.list_topic_count;

    var latest_options = {skip: (page - 1) * limit, limit: limit, sort: '-create_at'};
    Post.getPostsByQuery(post_query, latest_options, proxy.done('latest'));

    Post.getCountByQuery(post_query, proxy.done('pages', function (all_count) {
      var pages = Math.ceil(all_count / limit);
      proxy.emit('pages', pages);
    }));
  });
};

/**
 * 获取作者最热文章
 * @param req
 * @param res
 * @param next
 */
exports.top  = function(req, res, next) {
  var user_name = validator.trim(req.params.name);
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  page = page > 0 ? page : 1;

  var user_ep = new EventProxy();
  user_ep.fail(next);

  User.getUserByLoginName(user_name, user_ep.done('find_user'));

  user_ep.all('find_user', function(user) {
    if (!user) {
      return res.render('notify/notify', {
        error: '并没有找到这样一个作者'
      });
    }

    var proxy = new EventProxy();
    var events = ['top', 'pages'];

    proxy.all(events, function(top, pages) {
      res.render('user/top', {
        author: user.login_name,
        top: top,
        pages: pages,
        current_page: page,
        title: user.name + '的热门文章'
      });
    });
    proxy.fail(next);

    var post_query = {author_id: user._id};
    var limit = config.list_topic_count;

    var top_options = {skip: (page - 1) * limit, limit: limit, sort: '-pv'};
    Post.getPostsByQuery(post_query, top_options, proxy.done('top'));

    Post.getCountByQuery(post_query, proxy.done('pages', function (all_count) {
      var pages = Math.ceil(all_count / limit);
      proxy.emit('pages', pages);
    }));
  });
};

/**
 * 作者发表的评论
 * @param req
 * @param res
 * @param next
 */
exports.replies = function(req, res, next){
  var user_name = validator.trim(req.params.name);
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  page = page > 0 ? page : 1;

  var user_ep = new EventProxy();
  user_ep.fail(next);

  User.getUserByLoginName(user_name, user_ep.done('find_user'));

  user_ep.all('find_user', function(user) {
    if (!user) {
      return res.render('notify/notify', {
        error: '并没有找到这样一个作者'
      });
    }

    var proxy = new EventProxy();
    var events = ['from_author'];

    proxy.all(events, function(from_author) {
      res.render('user/replies', {
        author: user.login_name,
        from_author: from_author,
        title: user.name + '最近的评论'
      });
    });
    proxy.fail(next);

    var limit = config.list_topic_count;

    var reply_option = {skip: (page - 1) * limit, limit: limit, sort: '-create_at'};
    Reply.getRepliesByAuthorId(user._id, reply_option, proxy.done('from_author'));
  });
};

/**
 * 用户设置
 * @param req
 * @param res
 * @param next
 */
exports.setting = function (req, res, next) {
  res.render('user/setting');
};


