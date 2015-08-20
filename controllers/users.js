/*!
 * user controller
 */
var Post = require('../dao').Post;
var User = require('../dao').User;
var Reply = require('../dao').Reply;
var validator = require('validator');
var EventProxy = require('eventproxy');
var config = require('../config');
var tools = require('../common/tools');

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

  user_ep.assign('find_user', function(user) {
    if (!user) {
      return res.render('notify/notify', {
        error: '并没有找到这样一个作者'
      });
    }

    var proxy = new EventProxy();
    var events = ['latest', 'pages'];

    proxy.assign(events, function(latest, pages) {
      res.render('user/home', {
        author: user,
        latest: latest,
        pages: pages,
        current_page: page,
        title: user.login_name + '的个人主页'
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

  user_ep.assign('find_user', function(user) {
    if (!user) {
      return res.render('notify/notify', {
        error: '并没有找到这样一个作者'
      });
    }

    var proxy = new EventProxy();
    var events = ['top', 'pages'];

    proxy.assign(events, function(top, pages) {
      res.render('user/top', {
        author: user,
        top: top,
        pages: pages,
        current_page: page,
        title: user.login_name + '的热门文章'
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

  user_ep.assign('find_user', function(user) {
    if (!user) {
      return res.render('notify/notify', {
        error: '并没有找到这样一个作者'
      });
    }

    var proxy = new EventProxy();
    var events = ['from_author'];

    proxy.assign(events, function(from_author) {
      res.render('user/replies', {
        author: user,
        from_author: from_author,
        title: user.login_name + '最近的评论'
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
  var login_name = validator.trim(req.params.name);

  if (!req.session.user || login_name != req.session.user.login_name) {
    return res.render('notify/notify', {
      error: '你没有权限访问此页面'
    });
  }

  User.getUserByLoginName(login_name, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('notify/notify', {
        error: '找不到这个用户'
      });
    }
    res.render('user/setting', {
      user: user
    });
  });
};

/**
 * 修改基本信息设置
 * @param req
 * @param res
 * @param next
 */
exports.updateSetting = function updateSetting(req, res, next) {
  var ep = new EventProxy();
  ep.fail(next);
  var url = validator.trim(req.body.url);
  url = validator.escape(url);
  var location = validator.trim(req.body.location);
  location = validator.escape(location);
  var weibo = validator.trim(req.body.weibo);
  weibo = validator.escape(weibo);
  var signature = validator.trim(req.body.signature);
  signature = validator.escape(signature);

  User.getUserById(req.session.user._id, ep.done(function (user) {
    user.url = url;
    user.location = location;
    user.signature = signature;
    user.weibo = weibo;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      req.session.user = user.toObject({virtual: true});
      return res.render('user/setting', {
        success: '修改信息成功'
      });
    });
  }));
};

/**
 * 修改密码
 * @param req
 * @param res
 * @param next
 */
exports.updatePassword = function updatePassword(req, res, next) {
  var ep = new EventProxy();
  ep.fail(next);
  var old_pass = validator.trim(req.body.old_pass);
  var new_pass = validator.trim(req.body.new_pass);
  if (!old_pass || !new_pass) {
    return res.render('user/setting', {
      error: '旧密码或新密码不得为空'
    });
  }

  User.getUserById(req.session.user._id, ep.done(function (user) {
    tools.bcompare(old_pass, user.pwd, ep.done(function (bool) {
      if (!bool) {
        return res.render('user/setting', {
          error: '当前密码不正确'
        });
      }

      tools.bhash(new_pass, ep.done(function (passhash) {
        user.pwd = passhash;
        user.save(function (err) {
          if (err) {
            return next(err);
          }
          return res.render('user/setting', {
            success: '密码已被修改'
          });
        });
      }));
    }));
  }));
};


