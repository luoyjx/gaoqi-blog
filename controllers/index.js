'use strict';

const Promise = require('bluebird');
const xmlbuilder = require('xmlbuilder');
const validator = require('validator');
const _ = require('lodash');
const Post = require('../services/post');
const Tag = require('../services/tag');
const Reply = require('../services/reply');
const User = require('../services/user');
const config = require('../config');
const cache = require('../common/cache');

// 站点首页
exports.index = function *index() {
  let page = this.query.page ? parseInt(this.query.page, 10) : 1;
  page = page > 0 ? page : 1;
  const tab = validator.trim(this.query.tab || '');
  let tabName; // 分类名

  const query = {};
  if (tab) {
    query.category = tab;
    const kv = _.find(config.tabs, (kv) => kv[0] === tab);
    tabName = kv ? kv[1] + '版块' : '';
  } else {
    tabName = '首页';
  }
  tabName += page > 1
    ? ' 第' + page + '页'
    : '';

  const limit = config.list_topic_count;
  const options = { skip: (page - 1) * limit, limit, sort: '-top -update_at' };

  // 取热门标签
  const tag_options = { limit: config.list_hot_tag_count, sort: '-post_count' };

  // 取最新评论
  const reply_query = {};
  const reply_options = { limit: config.list_latest_replies_count, sort: '-create_at' };

  // 最近注册用户
  const users_query = { is_active: true };
  const recent_reg_options = { limit: 10, sort: '-create_at' };

  const [hotPostsCache, hotTagsCache] = yield Promise.all([
    cache.get('hots' + tab),
    cache.get('hot_tags')
  ]);

  const arr = [
    Post.getPostsByQuery(query, options),
    Post.getCountByQuery(query),
    Reply.getRepliesByQuery(reply_query, reply_options),
    User.getUsersByQuery(users_query, recent_reg_options)
  ];

  if (hotPostsCache) {
    arr.push(Promise.resolve(hotPostsCache));
  } else {
    arr.push(Post.getNewHot(query));
  }
  if (hotTagsCache) {
    arr.push(Promise.resolve(hotTagsCache));
  } else {
    arr.push(Tag.getHotTagsByQuery(tag_options));
  }

  const [posts, count, replies, recentReg, hotPosts, hotTags] = Promise.all(arr);
  // 总页数
  const pages = Math.ceil(count / limit);
  // 热门文章
  let hotPostsSorted = hotPosts.sort(function sortFn(a, b) {
    // pv排序
    return b.pv - a.pv;
  });
  // 取前10条
  hotPostsSorted = Array.prototype.slice.call(hotPosts, 0, 10);

  // 缓存热门文章和标签
  yield Promise.all([
    cache.set('hots' + tab, hotPosts, 60 * 5), // 5分钟
    cache.set('hot_tags', hotTags, 60 * 5) // 5分钟
  ]);

  yield this.render('index', {
    posts,
    tab,
    base: '/',
    current_page: page,
    pages,
    hots: hotPostsSorted,
    tags: hotTags,
    recent_reg: recentReg,
    replies,
    title: tabName
  });
};

// 站点地图
exports.sitemap = function *sitemap() {
  const urlset = xmlbuilder.create('urlset', { version: '1.0', encoding: 'UTF-8' });
  urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  const sitemapCache = yield cache.get('sitemap');

  if (sitemapCache) {
    this.type = 'xml';
    this.body = sitemapCache;
    return;
  }

  const [posts, tags] = yield Promise.all([
    Post.getLimit5w(),
    Tag.getAllTagsByQuery({}, { sort: '-post_count' })
  ]);

  posts.forEach(function (post) {
    urlset.ele('url').ele('loc', 'https://' + config.host + '/p/' + post._id);
  });
  tags.forEach(function (tag) {
    urlset.ele('url').ele('loc', 'https://' + config.host + '/tags/' + tag.name);
  });
  const sitemapData = urlset.end();
  // 缓存
  yield cache.set('sitemap', sitemapData, 3600 * 2);

  this.type = 'xml';
  this.body = sitemapData;
};

exports.robots = function *robots() {
  this.type = 'text/plain';
  this.body = `
  /*
  # See http://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file
  #
  # To ban all spiders from the entire site uncomment the next two lines:
  # User-Agent: *
  # allow: /
  */`;
};

/**
 * 工具
 * @param req
 * @param res
 * @param next
 */
exports.tools = function *tools() {
  yield this.render('static/tools', {
    title: '常用工具'
  });
};

/**
 * 前端导航
 * @param req
 * @param res
 * @param next
 */
exports.feNav = function *feNav() {
  yield this.render('static/fe_nav', {
    title: '前端导航'
  });
};

/**
 * web api接口说明
 * @param req
 * @param res
 * @param next
 */
exports.api = function *api() {
  yield this.render('static/api', {
    title: 'api接口说明'
  });
};
