'use strict';

const Promise = require('bluebird');
const validator = require('validator');
const tools = require('../common/tools');
const User = require('../services/user');
const mail = require('../common/mail');
const utility = require('utility');
const config = require('../config');
const authFilter = require('../middleware/auth');
const uuid = require('node-uuid');

/**
 * 跳转到登录页面
 */
exports.showLogin = function *showLogin() {
  this.session._loginReferer = this.headers.referer;
  yield this.render('sign/signin', {
    title: '登录'
  });
};

/**
 * 定义一些登录时跳到首页的页面
 * @type {Array}
 */
const notJump = [
  '/active_account', // active page
  '/reset_pass',     // reset password page, avoid to reset twice
  '/signup',         // regist page
  '/search_pass'    // serch pass page
];

/**
 * 登录操作
 * @param req
 * @param res
 * @param next
 */
exports.signIn = function (req, res, next) {
  var loginname = validator.trim(req.body.name);
  var pass = validator.trim(req.body.pass);

  if (!loginname || !pass) {
    res.status(422);
    return res.render('sign/signin', {error: '信息不完整'});
  }

  var getUserFunc;
  if (loginname.indexOf('@') !== -1) {
    getUserFunc = User.getUserByEmail;
  } else {
    getUserFunc = User.getUserByLoginName;
  }

  var _user;

  getUserFunc(loginname)
    .then(function(user) {
      if (!user) return res.wrapRender('sign/signin', {error: '用户名不存在'});

      _user = user;

      var passhash = user.pwd;
      // 验证密码
      return tools.bcompare(pass, passhash);
    })
    .then(function(flag) {
      if (!flag) return res.wrapRender('sign/signin', {error: '用户名不存在'});

      // 验证是否激活，未激活再次发送激活邮件
      if (!_user.is_active) {
        mail.sendActiveMail(_user.email, utility.md5(_user.email + _user.pwd + config.session_secret), user.login_name);
        res.status(403);
        return res.wrapRender('sign/signin', {error: '账号未激活，已重新发送激活邮件到' + user.email });
      }

      // 验证成功，存储session cookie，跳转到首页
      authFilter.gen_session(_user, res);
      // 检查需要跳转到首页的页面
      var refer = req.session._loginReferer || '/';
      for (var i = 0, len = notJump.length; i !== len; ++i) {
        if (refer.indexOf(notJump[i]) >= 0) {
          refer = '/';
          break;
        }
      }
      res.redirect(refer);
    })
    .catch(function(err) {
      next(err);
    });
};

/**
 * 跳转到注册页面
 * @param req
 * @param res
 * @param next
 */
exports.showSignup = function *showSignup() {
  yield this.render('sign/signup', {
    title: '注册'
  });
};

/**
 * 提交注册信息
 * @param req
 * @param res
 * @param next
 */
exports.signup = function *signup() {
  const loginname = validator.trim(this.request.body.loginname).toLowerCase();
  const email = validator.trim(this.request.body.email).toLowerCase();
  const pass = validator.trim(this.request.body.pass);
  const re_pass = validator.trim(this.request.body.re_pass);

  let errInfo = '';

  const hasEmpty = [loginname, pass, re_pass, email].some((item) => {
    return item === '';
  });

  errInfo = hasEmpty ? '信息填写不完整' : '';
  errInfo = loginname.length < 5 ? '用户名不能少于5个字符' : '';
  errInfo = !tools.validateId(loginname) ? '用户名不合法' : '';
  errInfo = !validator.isEmail(email) ? '邮箱填写不正确' : '';
  errInfo = pass !== re_pass ? '两次密码填写不一致' : '';

  if (errInfo) {
    this.status = 422;
    return yield this.render('sign/signup', { error: errInfo, loginname, email });
  }

  const users = yield User.getUsersByQuery({
    '$or': [
      { 'login_name': loginname },
      { email }
    ]
  }, {});

  if (users.length > 0) {
    this.status = 422;
    return yield this.render('sign/signup', { error: '用户名或邮箱已被使用', loginname, email });
  }

  const passHashed = yield tools.bhash(pass);
  const avatarUrl = User.makeGravatar(email);

  yield User.newAndSave(loginname, loginname, passHashed, email, avatarUrl, false);

  mail.sendActiveMail(email, utility.md5(email + passHashed + config.session_secret), loginname);

  yield this.render('sign/signup', {
    success: '欢迎加入' + config.name + '！我们已经向您的邮箱发送了一封邮件，点击邮件中的链接激活账号',
    title: '注册'
  });
};

/**
 * 退出登录
 */
exports.signout = function *signout() {
  this.session.destroy();
  this.cookies.clear(config.auth_cookie_name, { signed: true });
  this.redirect('back');
};

/**
 * 激活用户账号
 */
exports.activeUser = function *activeUser() {
  // 邮箱中的激活链接参数
  const key = this.query.key;
  const name = this.query.name;

  const user = yield User.getUserByLoginName(name);
  if (!user) {
    return this.throw(404, '[ACTIVE_USER] 未能找到用户：' + name);
  }

  const passhash = user.pwd;
  if (!user || utility.md5(user.email + passhash + config.session_secret) !== key) {
    return yield this.render('notify/notify', {
      error: '信息有误，账号无法激活',
      title: '通知'
    });
  }

  if (user.is_active) {
    return yield this.render('notify/notify', {
      error: '账号已经是激活状态',
      title: '通知'
    });
  }

  user.is_active = true;
  user.save();

  yield this.render('notify/notify', {
    success: '帐号已被激活，请登录',
    title: '通知'
  });
};

/**
 * 找回密码
 */
exports.showSearchPass = function *showSearchPass() {
  yield this.render('sign/search_pass');
};

/**
 * 更新
 */
exports.updateSearchPass = function *updateSearchPass() {
  const email = validator.trim(this.request.body.email).toLowerCase();
  if (!validator.isEmail(email)) {
    return yield this.render('sign/search_pass', { error: '邮箱不合法', email });
  }

  // 动态生成retrive_key和timestamp到users collection,之后重置密码进行验证
  const retrieveKey = uuid.v4();
  const retrieveTime = new Date().getTime();

  const user = User.getUserByEmail(email);
  if (!user) {
    return yield this.render('sign/search_pass', { error: '没有这个电子邮箱。', email });
  }

  user.retrieve_key = retrieveKey;
  user.retrieve_time = retrieveTime;
  yield user.save();

  // 发送重置密码邮件
  mail.sendResetPassMail(email, retrieveKey, user.login_name);

  yield this.render('notify/notify', {
    success: '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。'
  });
};

/**
 * reset password
 * 'get' to show the page, 'post' to reset password
 * after reset password, retrieve_key&time will be destroy
 */
exports.resetPass = function (req, res, next) {
  var key  = validator.trim(req.query.key);
  var name = validator.trim(req.query.name);

  User
    .getUserByNameAndKey(name, key)
    .then(function(user) {
      if (!user) {
        return res.status(403).wrapRender('notify/notify', {error: '信息有误，密码无法重置。'});
      }

      var now = new Date().getTime();
      var oneDay = 1000 * 60 * 60 * 24;
      if (!user.retrieve_time || now - user.retrieve_time > oneDay) {
        return res.status(403).wrapRender('notify/notify', {error: '该链接已过期，请重新申请。'});
      }
      return res.wrapRender('sign/reset', {name: name, key: key});
    })
    .catch(function(err) {
      next(err);
    });
};

exports.updatePass = function (req, res, next) {
  var psw   = validator.trim(req.body.psw) || '';
  var repsw = validator.trim(req.body.repsw) || '';
  var key   = validator.trim(req.body.key) || '';
  var name  = validator.trim(req.body.name) || '';

  if (psw !== repsw) {
    return res.wrapRender('sign/reset', {name: name, key: key, error: '两次密码输入不一致。'});
  }

  User
    .getUserByNameAndKey(name, key)
    .then(function(user) {
      if (!user) {
        return res.wrapRender('notify/notify', {error: '错误的激活链接'});
      }

      tools
        .bhash(psw)
        .then(function(passhash) {
          user.pwd           = passhash;
          user.retrieve_key  = null;
          user.retrieve_time = null;
          user.is_active     = true; // 用户激活

          user
            .save()
            .then(function() {
              return res.render('notify/notify', {success: '你的密码已重置。'});
            });
        });
    })
    .catch(function(err) {
      next(err);
    });
};
