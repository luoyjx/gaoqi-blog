/*!
 gaoqi-blog app.js
 */


var config = require('./config');
var path = require('path');
var Loader = require('loader');
var LoaderConnect = require('loader-connect')
var express = require('express');
var session = require('express-session');
var errorhandler = require('errorhandler');
var RedisStore = require('connect-redis')(session);
var redisClient = require('./common/redis.js');
var passport = require('passport');
require('./models');
var auth = require('./middleware/auth');
var online = require('./middleware/online');
var GitHubStrategy = require('passport-github').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var busboy = require('connect-busboy');
var _ = require('lodash');
var csurf = require('csurf');
var cors = require('cors');
var render = require('./common/render');
var cutter = require('./common/cutter');

var webRouter = require('./web_router');
var webApi = require('./web_api');

var app = express();

// 静态文件目录
var staticDir = path.join(__dirname, 'public');
var assets = {};
if (process.env.NODE_ENV === 'production') {
  try {
    assets = require('./assets.json');
  } catch (e) {
    console.log('You must execute `make build` before start app when mini_assets is true.');
    throw e;
  }
}

app.disable('x-powered-by');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));
app.locals._layoutFile = 'layout.html';

app.use(require('./middleware/wrap').render);
app.use(require('./middleware/wrap').send);
app.use(require('response-time')());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(require('method-override')());
app.use(cookieParser(config.session_secret));
app.use(compress());
app.use(session({
    secret: config.session_secret,
    store: new RedisStore({
        client: redisClient,
        port: config.redis_port,
        host: config.redis_host
    }),
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());

// custom middleware 过滤未登陆
app.use(auth.authUser);
//缓存已登录用户标识在线
app.use(online.cacheOnline);

// 静态资源
if (config.debug) {
  app.use(LoaderConnect.less(__dirname)); // 测试环境用，编译 .less on the fly
}
app.use('/public', express.static(staticDir));

if (!config.debug) {
  app.use(function (req, res, next) {
    if (req.path.indexOf('/api') === -1) {
      csurf()(req, res, next);
      return;
    }
    next();
  });
  app.set('view cache', true);
}

//github oauth
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
passport.use(new GitHubStrategy(config.GITHUB_OAUTH, function (accessToken, refreshToken, profile, done) {
  done(null, profile);
}));

// set static, dynamic helpers
_.extend(app.locals, {
  config: config,
  Loader: Loader,
  assets: assets
});
_.extend(app.locals, render);
_.extend(app.locals, cutter);

app.use(function (req, res, next) {
  res.locals.csrf = req.csrfToken ? req.csrfToken() : '';
  next();
});

app.use(busboy({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}));

app.use('/', webRouter);
app.use('/api', cors(), webApi);


// error handler
if (config.debug) {
  app.use(errorhandler());
} else {
  app.use(function (err, req, res, next) {
    console.log(err);
    return res.status(500).send('500 status');
  });
}

app.listen(process.env.PORT ? process.env.PORT : config.port, function () {
  console.log("GaoqiBlog listening on port %s in %s mode", process.env.PORT ? process.env.PORT : config.port, app.settings.env);
});


module.exports = app;
