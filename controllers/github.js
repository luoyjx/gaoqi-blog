//var Promise = require('bluebird');
var uuid = require('node-uuid');
var validator = require('validator');
var Models = require('../models');
var User = Models.User;
var authMiddleWare = require('../middleware/auth');
var tools = require('../common/tools');
var config = require('../config');

exports.callback = function (req, res, next) {
  var profile = req.user;
  User
    .findOne({github_id: profile.id})
    .then(function(user) {
      // 当用户已经是用户时，通过 github 登陆将会更新他的资料
      if (user) {
        user.github_username = profile.username;
        user.github_id = profile.id;
        user.github_accessToken = profile.accessToken;
        if (profile.emails[0].value) {
          user.email = profile.emails[0].value;
        }

        return user
          .save()
          .then(function (){
            authMiddleWare.gen_session(user, res);
            return res.redirect('/');
          });
      } else {
        // 如果用户还未存在，则建立新用户
        req.session.profile = profile;
        return res.redirect('/login/github/new');
      }
    })
    .catch(function(err) {
      next(err);
    });
};

exports.new = function (req, res, next) {
  res.render('sign/new_oauth', {actionPath: '/login/github/create'});
};

exports.create = function (req, res, next) {
  var profile = req.session.profile;
  var isnew = req.body.isnew;
  var loginname = validator.trim(req.body.name);
  var password = validator.trim(req.body.pass);

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
    user
      .save()
      .then(function() {
        authMiddleWare.gen_session(user, res);
        res.redirect('/');
      })
      .catch(function(err) {
        // 根据 err.err 的错误信息决定如何回应用户，这个地方写得很难看
        if (err.message.indexOf('duplicate key error') !== -1) {
          if (err.message.indexOf('email') !== -1) {
            return res
              .status(500)
              .wrapRender('sign/no_github_email');
          }
          if (err.message.indexOf('login_name') !== -1) {
            return res
              .status(500)
              .send('您 GitHub 账号的用户名与之前注册的用户名重复了');
          }
        }
        return next(err);
        // END 根据 err.err 的错误信息决定如何回应用户，这个地方写得很难看
      });
  } else { // 关联老账号
    User
      .findOne({login_name: loginname})
      .then(function(user) {
        if (!user) return res.status(403).wrapRender('sign/signin', { error: '账号名或密码错误。'});
        return tools
          .bcompare(password, user.pwd)
          .then(function(bool) {
            if (!bool) return res.status(403).wrapRender('sign/signin', { error: '账号名或密码错误。'});
            user.github_username = profile.username;
            user.github_id = profile.id;
            user.avatar = profile._json.avatar_url;
            user.github_accessToken = profile.accessToken;
            return user
              .save()
              .then(function() {
                authMiddleWare.gen_session(user, res);
                res.redirect('/');
              });
          });
      })
      .catch(function(err) {
        next(err);
      });
  }
};
