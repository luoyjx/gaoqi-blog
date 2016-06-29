var Promise = require('bluebird');
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');
var config = require('../config');
var UserProxy = require('../dao').User;
var Message = require('../dao').Message;

/**
 * 需要管理员权限
 */
exports.adminRequired = function (req, res, next) {
  if (!req.session.user) {
    return res.render('notify/notify', {error: '你还没有登录'});
  }
  if (!req.session.user.is_admin) {
    return res.render('notify/notify', {error: '需要管理员权限'});
  }
  next();
};

/**
 * 需要登录
 */
exports.userRequired = function (req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/signin');
  }
  next();
};

exports.blockUser = function () {
  return function (req, res, next) {
    if (req.path === '/signout') {
      return next();
    }
    if (req.session.user && req.session.user.is_block && req.method !== 'GET') {
      return res.status(403).send('您已被管理员锁定了.有疑问请联系 yjk99@qq.com');
    }
    next();
  };
};


function gen_session(user, res) {
  var auth_token = user._id + '$$$$'; // 以后可能会存储更多信息，用 $$$$ 来分隔
  res.cookie(config.auth_cookie_name, auth_token,
    {path: '/', maxAge: 1000 * 60 * 60 * 24 * 30, signed: true, httpOnly: true}); //cookie 有效期30天
}

exports.gen_session = gen_session;

// 验证用户是否登录
exports.authUser = function (req, res, next) {
  if (config.debug && req.cookies['mock_user']) {
    var mockUser = JSON.parse(req.cookies['mock_user']);
    req.session.user = new UserModel(mockUser);
    if (mockUser.is_admin) {
      req.session.user.is_admin = true;
    }
    return next();
  }

  var userPromise;
  if (req.session.user) {
    userPromise = Promise.resolve(req.session.user);
  } else {
    var auth_token = req.signedCookies[config.auth_cookie_name];
    if (!auth_token) {
      return next();
    }

    var auth = auth_token.split('$$$$');
    var user_id = auth[0];
    userPromise = UserProxy.getUserById(user_id);
  }

  userPromise
    .then(function(user) {
      if (!user) {
        return next();
      }

      user = res.locals.user = req.session.user = new UserModel(user);

      if (config.admins.hasOwnProperty(user.login_name)) {
        user.is_admin = true;
      }
      Message.getMessagesCount(user._id)
        .then(function(count) {
          user.messages_count = count;
          next();
        });
    });
};
