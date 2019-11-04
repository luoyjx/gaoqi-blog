/**
 * production config
 * @authors yanjixiong
 * @date    2016-10-25 09:24:13
 */

var path = require('path')

module.exports = {
  // debug 为 true 时，用于本地调试
  debug: process.env.NODE_ENV !== 'production',

  get mini_assets () {
    return !this.debug
  }, // 是否启用静态文件的合并压缩，详见视图中的Loader

  title: '首页 - 搞起博客 ',
  name: '搞起博客', // 社区名字
  description: '搞起博客是分享、讨论、交流技术或者个人体会、经验的博客平台。', // 社区的描述
  keywords: '',

  site_logo: '/public/img/gaoqi_blog_logo.png', // default is `name`
  site_icon: '/public/favicon.ico', // 默认没有 favicon, 这里填写网址

  // cdn host，如 http://static.gaoqixhb.com
  site_static_host: '', // 静态文件存储域名
  site_assets_host: '', // 静态资源域名
  avatar_static_host: '', // 头像静态文件存储域名

  // 社区的域名
  host: '',
  // 默认的Google tracker ID，自有站点请修改，申请地址：http://www.google.com/analytics/
  google_tracker_id: '',
  // 默认的cnzz tracker ID，自有站点请修改,代码部分嵌入了百度统计，可自行修改
  cnzz_tracker_id: '1253178185',

  // mongodb 配置
  db: 'mongodb://127.0.0.1/gaoqi_blog',

  redis_host: '127.0.0.1',
  redis_port: 6379,
  redis_db: 0,

  session_secret: 'gaoqi_blog_secret', // 务必修改
  auth_cookie_name: 'gaoqi_blog',

  // 程序运行的端口
  port: 3001,

  // 话题列表显示的话题数量
  list_topic_count: 40,
  // 热门文章显示数量
  list_hot_topic_count: 10,
  // 热门标签显示的数量
  list_hot_tag_count: 10,
  // 显示最新评论条数
  list_latest_replies_count: 5,

  // 限制发帖时间间隔，单位：毫秒
  post_interval: 2000,

  // RSS配置
  rss: {
    title: '关注前后端技术 - 搞起博客 gaoqixhb.com',
    link: 'http://blog.gaoqixhb.com',
    language: 'zh-cn',
    description: '搞起博客是分享、讨论、交流前后端技术或者个人体会、经验的博客平台。',
    // 最多获取的RSS Item数量
    max_rss_items: 30
  },

  // 邮箱配置
  mail_opts: {
    host: 'smtp.gaoqixhb.com',
    port: 25,
    auth: {
      user: 'system@gaoqixhb.com',
      pass: 'xxxxx'
    }
  },

  // weibo app key
  weibo_key: 10000000,
  weibo_id: '',

  // admin 可删除话题，编辑标签，设某人为达人，管理员
  admins: { luoyjx: true },

  // github 登陆的配置,需要到github配置授权
  GITHUB_OAUTH: {
    clientID: '',
    clientSecret: '',
    callbackURL: 'http://blog.gaoqixhb.com/login/github/callback' // 回调的地址 如 http://blog.gaoqixhb.com/login/github/callback
  },
  // 是否允许直接注册（否则只能走 github 的方式）
  allow_sign_up: true,

  // twitter app keys
  twitter: {
    consumer_key: 'your consumer key',
    consumer_secret: '',
    access_token: '',
    access_token_secret: '',
    timeout_ms: 60 * 1000
  },

  // 7牛的access信息，用于文件上传
  qn_access: {
    accessKey: '',
    secretKey: 'your secret key',
    bucket: 'gaoqixhb', // 空间名  如  gaoqixhb
    origin: '' // 静态域名 如 gaoqixhb.qiniudn.com
  },

  qn_avatar_access: {
    accessKey: '',
    secretKey: 'your secret key',
    bucket: 'gaoqi-avatar', // 空间名  如  gaoqixhb
    origin: '' // 静态域名 如 gaoqixhb.qiniudn.com
  },

  // 文件上传配置
  // 注：如果填写 qn_access，则会上传到 7牛，以下配置无效
  upload: {
    path: path.join(__dirname, 'public/upload/'),
    url: '/public/upload/'
  },

  // 分类
  tabs: [
    ['program', '开发'],
    ['product', '产品'],
    ['interaction', '交互'],
    ['design', '设计'],
    ['share', '分享'],
    ['chat', '闲聊'],
    ['push', '推送']
  ]

}
