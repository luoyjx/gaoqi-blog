var Models = require('../models');
var User = Models.User;
var authMiddleWare = require('../filter/auth');
var tools = require('../common/tools');
var eventproxy = require('eventproxy');
var uuid = require('node-uuid');
var validator = require('validator');
var config = require('../config');

/**
 * github登陆回调接口
 * @param req
 * @param res
 * @param next
 */
exports.callback = function (req, res, next) {
  var profile = req.user;
  User.findOne({githubId: profile.id}, function (err, user) {
    if (err) {
      return next(err);
    }
    // 当用户已经是用户时，通过 github 登陆将会更新他的资料
    if (user) {
      user.github_username = profile.username;
      user.github_id = profile.id;
      user.github_accessToken = profile.accessToken;
      if (profile.emails[0].value) {
        user.email = profile.emails[0].value;
      }

      user.save(function (err) {
        if (err) {
          return next(err);
        }
        authMiddleWare.gen_session(user, res);
        return res.redirect('/');
      });
    } else {
      // 如果用户还未存在，则建立新用户
      req.session.profile = profile;
      return res.redirect('/login/github/new');
    }
  });
};

/**
 * 创建新用户页面
 * @param req
 * @param res
 * @param next
 */
exports.new = function (req, res, next) {
  res.render('sign/new_oauth', {actionPath: '/login/github/create'});
};

/**
 * 通过github创建新用户
 * @param req
 * @param res
 * @param next
 * @returns {redirect|*|redirect|redirect}
 */
exports.create = function (req, res, next) {
  var profile = req.session.profile;
  var isnew = req.body.isnew;
  var loginname = validator.trim(req.body.name);
  var password = validator.trim(req.body.pass);
  var ep = new eventproxy();
  ep.fail(next);

  if (!profile) {
    return res.redirect('/signin');
  }
  delete req.session.profile;
  if (isnew) { // 注册新账号
    var user = new User({
      login_name: profile.username,
      pwd: profile.accessToken,
      email: profile.emails[0].value,
      github_id: profile.id,
      github_username: profile.username,
      github_accessToken: profile.accessToken,
      avatar: profile._json.avatar_url,
      is_active: true,
      accessToken: uuid.v4()
    });
    user.save(function (err) {
      if (err) {
        // 根据 err.err 的错误信息决定如何回应用户，这个地方写得很难看
        if (err.message.indexOf('duplicate key error') !== -1) {
          if (err.message.indexOf('users.$email') !== -1) {
            return res.status(500)
              .render('sign/no_github_email');
          }
          if (err.message.indexOf('users.$loginname') !== -1) {
            return res.status(500)
              .send('您 GitHub 账号的用户名与之前注册的用户名重复了');
          }
        }
        return next(err);
        // END 根据 err.err 的错误信息决定如何回应用户，这个地方写得很难看
      }
      authMiddleWare.gen_session(user, res);
      res.redirect('/');
    });
  } else { // 关联老账号
    ep.on('login_error', function (login_error) {
      res.status(403);
      res.render('sign/signin', { error: '账号名或密码错误。' });
    });
    User.findOne({login_name: loginname},
      ep.done(function (user) {
        if (!user) {
          return ep.emit('login_error');
        }
        tools.bcompare(password, user.pwd, ep.done(function (bool) {
          if (!bool) {
            return ep.emit('login_error');
          }
          user.github_username = profile.username;
          user.github_id = profile.id;
          user.github_accessToken = profile.accessToken;

          user.save(function (err) {
            if (err) {
              return next(err);
            }
            authMiddleWare.gen_session(user, res);
            res.redirect('/');
          });
        }));
      }));
  }
};