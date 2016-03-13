/**
 * config
 */

var path = require('path');

var config = {
  // debug 为 true 时，用于本地调试
  debug: false,

  get mini_assets() {
    return !this.debug;
  }, // 是否启用静态文件的合并压缩，详见视图中的Loader

  title: '首页 - 搞起博客 ',
  name: '搞起博客', // 社区名字
  description: '搞起博客是分享、讨论、交流技术或者个人体会、经验的博客平台。', // 社区的描述
  keywords: '',

  site_logo: 'http://static.gaoqixhb.com/public/img/gaoqi_blog_logo.svg', // default is `name`
  site_icon: '/public/favicon.ico', // 默认没有 favicon, 这里填写网址

  // cdn host，如 http://static.gaoqixhb.com
  site_static_host: 'http://static.gaoqixhb.com', // 静态文件存储域名
  // 资源文件域名,存储css,js 等,也可放置与上面一起,即只使用一个域名
  site_assets_host: 'http://assets.gaoqixhb.com',

  // 社区的域名
  host: 'localhost',
  // 默认的Google tracker ID，自有站点请修改，申请地址：http://www.google.com/analytics/
  google_tracker_id: '',
  // 默认的cnzz tracker ID，自有站点请修改,代码部分嵌入了百度统计，可自行修改
  cnzz_tracker_id: '',

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
  list_topic_count: 20,
  //热门文章显示数量
  list_hot_topic_count: 10,
  //热门标签显示的数量
  list_hot_tag_count: 10,
  //显示最新评论条数
  list_latest_replies_count: 10,

  // 限制发帖时间间隔，单位：毫秒
  post_interval: 2000,

  // RSS配置
  rss: {
    title: '关注前后端技术 - 搞起博客 gaoqixhb.com',
    link: 'http://blog.gaoqixhb.com',
    language: 'zh-cn',
    description: '搞起博客是分享、讨论、交流前后端技术或者个人体会、经验的博客平台。',
    //最多获取的RSS Item数量
    max_rss_items: 30
  },

  // 邮箱配置
  mail_opts: {
    host: 'smtp.gaoqixhb.com',
    port: 25,
    auth: {
      user: 'system@gaoqixhb.com',
      pass: 'xxxx'
    }
  },

  //weibo app key
  weibo_key: 10000000,
  weibo_id: '',

  // admin 可删除话题，编辑标签，设某人为达人，管理员
  admins: { luoyjx: true },

  // github 登陆的配置,需要到github配置授权
  GITHUB_OAUTH: {
    clientID: 'your client id',
    clientSecret: 'your client secret',
    callbackURL: '' //回调的地址 如 http://blog.gaoqixhb.com/login/github/callback
  },
  // 是否允许直接注册（否则只能走 github 的方式）
  allow_sign_up: true,

  // oneapm 是个用来监控网站性能的服务
  oneapm_key: 'your oneapm key',

  //7牛的access信息，用于文件上传
  qn_access: {
    accessKey: 'your access key',
    secretKey: 'your secret key',
    bucket: '', //空间名  如  gaoqixhb
    domain: '' //静态域名 如 gaoqixhb.qiniudn.com
  },

  //文件上传配置
  //注：如果填写 qn_access，则会上传到 7牛，以下配置无效
  upload: {
    path: path.join(__dirname, 'public/upload/'),
    url: '/public/upload/'
  },

  // 分类
  tabs: [
    ['program', '开发', '#5cb85c'],
    ['share', '分享', '#5cb85c'],
    ['chat', '闲聊', '#5cb85c'],
    ['push', '推送', '#5cb85c']
  ]

};

module.exports = config;