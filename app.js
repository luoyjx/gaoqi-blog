'use strict';

const http = require('http');
const path = require('path');
const logger = require('koa-logger');
const json = require('koa-json');
const jsonp = require('koa-safe-jsonp');
const koaNunjucks = require('koa-nunjucks-2');
const session = require('koa-generic-session');
const redisStore = require('koa-redis');
const compress = require('koa-compress');
const mount = require('koa-mount');
const serve = require('koa-static');
const onerror = require('koa-onerror');
const clearCookie = require('koa-clear-cookie');

const config = require('./config');
const router = require('./router');
const filters = require('./common/filters');
const log = require('./common/logger');

let app = require('koa')();

onerror(app);

jsonp(app);

// global middlewares
app.context.render = koaNunjucks({
  ext: 'html',
  path: path.join(__dirname, 'views'),
  nunjucksConfig: {
    autoescape: true,
    watch: process.env.NODE_ENV !== 'production'
  }
});

const env = app.context.render.env;
Object
  .keys(filters)
  .forEach((filterName) => {
    console.log('inject %s filter', filterName);
    env.addFilter(filterName, filters[filterName]);
  });

app.keys = ['gaoqi-blog', config.session_secret];
app.use(compress({
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}));
app.use(clearCookie());
app.use(mount('/public', serve(path.join(__dirname, 'public'))));
app.use(require('koa-bodyparser')({
  formLimit: '10mb',
  jsonLimit: '10mb',
  textLimit: '10mb'
}));
app.use(json());
app.use(logger());

app.use(session({
  store: redisStore({
    host: config.redis_host,
    port: config.redis_port,
    db: config.redis_db
  }),
  cookie: {
    maxAge: null // 浏览器关闭session失效
  }
}));

app.use(function *(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// mount root routes
app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', function (err, ctx) {
  err.url = err.url || ctx.request.url;
  console.log(err);
  console.log(err.stack);
  logger.error(err);
  log.error('server error', err, ctx);
});

app = http.createServer(app.callback());

if (!module.parent) {
  app.listen(config.port);
}

module.exports = app;
