/*!
 * sign controller
 */
var validator = require('validator');
var EventProxy = require('eventproxy');
var tools = require('../common/tools');
var User = require('../dao').User;
var mail = require('../common/mail');
var utility = require('utility');
var config = require('../config');
var authFilter = require('../filter/auth');
var uuid = require('node-uuid');

/**
 * 跳转到登录页面
 * @param req
 * @param res
 * @param next
 */
exports.showLogin = function (req, res, next) {
  req.session._loginReferer = req.headers.referer;
  res.render('sign/signin', {
    title: '登录'
  });
};

/**
 * 定义一些登录时跳到首页的页面
 * @type {Array}
 */
var notJump = [
  '/active_account', //active page
  '/reset_pass',     //reset password page, avoid to reset twice
  '/signup',         //regist page
  '/search_pass'    //serch pass page
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
  var proxy = new EventProxy();
  proxy.fail(next);

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

  proxy.on('info_err', function (err) {
    res.status(422);
    return res.render('sign/signin', {error: '用户名或密码错误'});
  });

  getUserFunc(loginname, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return proxy.emit('info_err');
    }
    var passhash = user.pwd;
    //验证密码
    tools.bcompare(pass, passhash, proxy.done(function (flag) {
      if (!flag) {
        return proxy.emit('info_err');
      }
      //验证是否激活，未激活再次发送激活邮件
      if (!user.is_active) {
        mail.sendActiveMail(user.email, utility.md5(user.email + passhash + config.session_secret), user.login_name);
        res.status(403);
        return res.render('sign/signin', {error: '账号未激活，已重新发送激活邮件到' + user.email });
      }

      //验证成功，存储session cookie，跳转到首页
      authFilter.gen_session(user, res);
      //检查需要跳转到首页的页面
      var refer = req.session._loginReferer || '/';
      for (var i = 0, len = notJump.length; i !== len; ++i) {
        if (refer.indexOf(notJump[i]) >= 0) {
          refer = '/';
          break;
        }
      }
      res.redirect(refer);
    }));
  });
};

/**
 * 跳转到注册页面
 * @param req
 * @param res
 * @param next
 */
exports.showSignup = function (req, res, next) {
  res.render('sign/signup', {
    title: '注册'
  });
};

/**
 * 提交注册信息
 * @param req
 * @param res
 * @param next
 */
exports.signup = function (req, res, next) {
  var loginname = validator.trim(req.body.loginname).toLowerCase();
  var email = validator.trim(req.body.email).toLowerCase();
  var pass = validator.trim(req.body.pass);
  var re_pass = validator.trim(req.body.re_pass);

  var proxy = new EventProxy();
  proxy.fail(next);

  //校验不通过
  proxy.on('info_err', function (msg) {
    res.status = 422;
    res.render('sign/signup', {error: msg, loginname: loginname, email: email});
  });

  if ([loginname, pass, re_pass, email].some(function (item) {
    return item === '';
  })) {
    proxy.emit('info_err', '信息填写不完整');
    return;
  }
  if (loginname.length < 5) {
    proxy.emit('info_err', '用户名不能少于5个字符');
    return;
  }
  if (!tools.validateId(loginname)) {
    proxy.emit('info_err', '用户名不合法');
    return;
  }
  if (!validator.isEmail(email)) {
    proxy.emit('info_err', '邮箱填写不正确');
    return;
  }
  if (pass !== re_pass) {
    proxy.emit('info_err', '两次密码填写不一致');
  }

  User.getUsersByQuery({'$or': [
    {'login_name': loginname},
    {'email': email}
  ]}, {}, function (err, users) {
    if (err) {
      return next(err);
    }
    if (users.length > 0) {
      proxy.emit('info_err', '用户名或邮箱已被使用');
      return;
    }
    tools.bhash(pass, proxy.done(function (passhash) {
      var avatarUrl = User.makeGravatar(email);
      User.newAndSave(loginname, loginname, passhash, email, avatarUrl, false, function (err) {
        if (err) {
          return next(err);
        }
        mail.sendActiveMail(email, utility.md5(email + passhash + config.session_secret), loginname);
        res.render('sign/signup', {
          success: '欢迎加入' + config.name + '！我们已经向您的邮箱发送了一封邮件，点击邮件中的链接激活账号',
          title: '注册'
        });
      });
    }));
  });
};

/**
 * 退出登录
 * @param req
 * @param res
 * @param next
 */
exports.signout = function (req, res, next) {
  req.session.destroy();
  res.clearCookie(config.auth_cookie_name, { path: '/' });
  res.redirect('back');
};

/**
 * 激活用户账号
 * @param req
 * @param res
 * @param next
 */
exports.activeUser = function activeUser(req, res, next) {
  //邮箱中的激活链接参数
  var key = req.query.key;
  var name = req.query.name;

  User.getUserByLoginName(name, function (err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(new Error('[ACTIVE_USER] 未能找到用户：' + name));
    }

    var passhash = user.pwd;
    if (!user || utility.md5(user.email + passhash + config.session_secret) !== key) {
      return res.render('notify/notify', {
        error: '信息有误，账号无法激活',
        title: '通知'
      });
    }

    if (user.is_active) {
      return res.render('notify/notify', {
        error: '账号已经是激活状态',
        title: '通知'
      });
    }

    user.is_active = true;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      res.render('notify/notify', {
        success: '帐号已被激活，请登录',
        title: '通知'
      });
    });
  });
};

exports.showSearchPass = function (req, res) {
  res.render('sign/search_pass');
};

exports.updateSearchPass = function (req, res, next) {
  var email = validator.trim(req.body.email).toLowerCase();
  if (!validator.isEmail(email)) {
    return res.render('sign/search_pass', {error: '邮箱不合法', email: email});
  }

  // 动态生成retrive_key和timestamp到users collection,之后重置密码进行验证
  var retrieveKey  = uuid.v4();
  var retrieveTime = new Date().getTime();

  User.getUserByEmail(email, function (err, user) {
    if (!user) {
      res.render('sign/search_pass', {error: '没有这个电子邮箱。', email: email});
      return;
    }
    user.retrieve_key = retrieveKey;
    user.retrieve_time = retrieveTime;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      // 发送重置密码邮件
      mail.sendResetPassMail(email, retrieveKey, user.login_name);
      res.render('notify/notify', {success: '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。'});
    });
  });
};

/**
 * reset password
 * 'get' to show the page, 'post' to reset password
 * after reset password, retrieve_key&time will be destroy
 * @param  {http.req}   req
 * @param  {http.res}   res
 * @param  {Function} next
 */
exports.resetPass = function (req, res, next) {
  var key  = validator.trim(req.query.key);
  var name = validator.trim(req.query.name);

  User.getUserByNameAndKey(name, key, function (err, user) {
    if (!user) {
      res.status(403);
      return res.render('notify/notify', {error: '信息有误，密码无法重置。'});
    }
    var now = new Date().getTime();
    var oneDay = 1000 * 60 * 60 * 24;
    if (!user.retrieve_time || now - user.retrieve_time > oneDay) {
      res.status(403);
      return res.render('notify/notify', {error: '该链接已过期，请重新申请。'});
    }
    return res.render('sign/reset', {name: name, key: key});
  });
};

exports.updatePass = function (req, res, next) {
  var psw   = validator.trim(req.body.psw) || '';
  var repsw = validator.trim(req.body.repsw) || '';
  var key   = validator.trim(req.body.key) || '';
  var name  = validator.trim(req.body.name) || '';

  var ep = new EventProxy();
  ep.fail(next);

  if (psw !== repsw) {
    return res.render('sign/reset', {name: name, key: key, error: '两次密码输入不一致。'});
  }
  User.getUserByNameAndKey(name, key, ep.done(function (user) {
    if (!user) {
      return res.render('notify/notify', {error: '错误的激活链接'});
    }
    tools.bhash(psw, ep.done(function (passhash) {
      user.pwd          = passhash;
      user.retrieve_key  = null;
      user.retrieve_time = null;
      user.is_active        = true; // 用户激活

      user.save(function (err) {
        if (err) {
          return next(err);
        }
        return res.render('notify/notify', {success: '你的密码已重置。'});
      });
    }));
  }));
};