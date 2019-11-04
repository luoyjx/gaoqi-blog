/*!
 * web router
 */
var express = require('express')

var auth = require('./middleware/auth')
var index = require('./controllers/index')
var user = require('./controllers/users')
var sign = require('./controllers/sign')
var rss = require('./controllers/rss')
var post = require('./controllers/post')
var tag = require('./controllers/tag')
var reply = require('./controllers/reply')
var github = require('./controllers/github')
var message = require('./controllers/message')
var userFollow = require('./controllers/user_follow')
var postCollection = require('./controllers/post_collection')

var consoleIndex = require('./controllers/console/index')
var consolePost = require('./controllers/console/post')

var configMiddleware = require('./middleware/conf')
var passport = require('passport')

var config = require('./config')
var router = express.Router()

router.get('/', index.index)// 首页
router.get('/sitemap.xml', index.sitemap)

router.get('/signin', sign.showLogin)// 跳到登录页面
router.post('/signin', sign.signIn)// 登录
router.get('/signup', sign.showSignup)// 跳到注册页面
router.post('/signup', sign.signup)// 注册
router.get('/active_account', sign.activeUser) // 帐号激活
router.get('/signout', sign.signout)// 退出

router.get('/search_pass', sign.showSearchPass) // 找回密码页面
router.post('/search_pass', sign.updateSearchPass) // 更新密码
router.get('/reset_pass', sign.resetPass) // 进入重置密码页面
router.post('/reset_pass', sign.updatePass) // 更新密码

router.get('/post/create', auth.userRequired, post.showCreate)// 创建文章页面
router.get('/post/:_id/edit', auth.userRequired, post.edit)
router.get('/p/:_id', post.index)// 文章内容页
router.get(/\/post\/(\w+).html/, post.index)// 文章内容页

router.get('/messages', auth.userRequired, message.index)// 消息

router.post('/post/:_id/edit', auth.userRequired, post.update)
router.post('/post/:_id/delete', auth.userRequired, post.delete)
router.post('/post/:_id/lock', auth.adminRequired, post.lock) // 锁定文章
router.get('/post/:_id/top', auth.adminRequired, post.top)// 顶置
router.get('/post/:_id/cancel_top', auth.adminRequired, post.unTop)// 取消顶置
router.post('/post/:_id/good', auth.adminRequired, post.good)// 精华
router.post('/post/:_id/recommend', auth.userRequired, post.recommend)// 推荐
router.post('/post/:_id/unrecommend', auth.userRequired, post.unRecommend)// 取消推荐
router.get('/post/:_id/collect', auth.userRequired, postCollection.create)// 收藏
router.get('/post/:_id/un_collect', auth.userRequired, postCollection.removeById)// 取消收藏
router.post('/post/create', auth.userRequired, post.create)// 新增文章
router.post('/upload', auth.userRequired, post.upload) // 上传图片

router.post('/post/:_id/reply', auth.userRequired, reply.add)// 添加评论

router.get('/u/:name', user.index)// 个人主页
router.get('/u/:name/top', user.top)// 热门文章
router.get('/u/:name/replies', user.replies)// 发表的回复
router.get('/u/:name/setting', auth.userRequired, user.setting)// 设置
router.post('/u/:name/setting/info', auth.userRequired, user.updateSetting)// 修改设置
router.post('/u/:name/setting/pwd', auth.userRequired, user.updatePassword)// 修改密码
router.get('/u/:id/follow', auth.userRequired, userFollow.follow) // 关注用户
router.get('/u/:id/unfollow', auth.userRequired, userFollow.unFollow) // 取消关注

router.get('/my/following', auth.userRequired, userFollow.getFollowUserPost) // 关注用户文章

router.get('/my/post_collection', auth.userRequired, postCollection.getPostCollection) // 用户收藏的文章

router.get('/tags/:name', tag.getTagByName)// 某个标签
router.get('/tags', tag.index)// 所有标签

router.get('/robots.txt', index.robots)
router.get('/frontEndNavigation', index.feNav)// 前端导航
router.get('/tools', index.tools)// 常用工具
router.get('/api', index.api)// api接口
router.get('/rss', rss.index)

// github oauth
router.get('/login/github', configMiddleware.github, passport.authenticate('github'))
router.get('/login/github/callback',
  passport.authenticate('github', { failureRedirect: '/signin' }),
  github.callback)
router.get('/login/github/new', github.new)
router.post('/login/github/create', github.create)

router.get('/console', auth.adminRequired, consoleIndex.index) // 后台首页

router.get('/console/posts', auth.adminRequired, consolePost.index) // 文章管理

module.exports = router
