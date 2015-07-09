/*!
 * web router
 */
var express = require('express');

var auth = require('./filter/auth');
var index = require('./controllers/index');
var user = require('./controllers/users');
var sign = require('./controllers/sign');
var rss = require('./controllers/rss');
var post = require('./controllers/post');
var tag = require('./controllers/tag');
var reply = require('./controllers/reply');
var github = require('./controllers/github');
var configMiddleware = require('./filter/conf');
var passport = require('passport');

var config = require('./config');
var router = express.Router();

router.get('/', index.index);//首页
router.get('/sitemap.xml', index.sitemap);

router.get('/signin', sign.showLogin);//跳到登录页面
router.post('/signin', sign.signIn);//登录
router.get('/signup', sign.showSignup);//跳到注册页面
router.post('/signup', sign.signup);//注册
router.get('/active_account', sign.active_user);  //帐号激活
router.get('/signout', sign.signout);//退出

router.get('/post/create', auth.userRequired, post.showCreate);//创建文章页面
router.get('/post/:_id/edit', auth.userRequired, post.edit);
router.get('/p/:_id', post.index);//文章内容页

router.post('/post/:_id/edit', auth.userRequired, post.update);
router.post('/post/:_id/delete', auth.userRequired, post.delete);
router.post('/post/:_id/lock', auth.adminRequired, post.lock); //锁定文章
router.post('/post/:_id/top', auth.adminRequired, post.top);//顶置
router.post('/post/:_id/good', auth.adminRequired, post.good);//精华
router.post('/post/:_id/recommend', auth.userRequired, post.recommend);//推荐
router.post('/post/:_id/unrecommend', auth.userRequired, post.un_recommend);//取消推荐
router.post('/post/:_id/collect', auth.userRequired, post.collect);//收藏
router.post('/post/:_id/un_collect', auth.userRequired, post.un_collect);//取消收藏
router.post('/post/create', auth.userRequired, post.create);//新增文章
router.post('/upload', auth.userRequired, post.upload); //上传图片

router.post('/post/:_id/reply', auth.userRequired, reply.add);//添加评论

router.get('/u/:name', user.index);//个人主页
router.get('/u/:name/top', user.top);//热门文章
router.get('/u/:name/replies', user.replies);//发表的回复
router.get('/u/:name/setting', auth.userRequired, user.setting);//设置

router.get('/tags/:name', tag.getTagByName);//某个标签
router.get('/tags', tag.index);//所有标签

router.get('/robots.txt', index.robots);
router.get('/tools', index.tools);//常用工具
router.get('/api', index.api);//api接口
router.get('/rss', rss.index);

// github oauth
router.get('/login/github', configMiddleware.github, passport.authenticate('github'));
router.get('/login/github/callback',
  passport.authenticate('github', { failureRedirect: '/signin' }),
  github.callback);
router.get('/login/github/new', github.new);
router.post('/login/github/create', github.create);

module.exports = router;
