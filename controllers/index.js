/*!
 * controller index
 */

var Promise = require('bluebird');
var xmlbuilder = require('xmlbuilder');
var multiline = require('multiline');
var validator = require('validator');
var _ = require('lodash');
var Post = require('../dao').Post;
var Tag = require('../dao').Tag;
var Reply = require('../dao').Reply;
var User = require('../dao').User;
var config = require('../config');
var cache = require('../common/cache');

//站点首页
exports.index = function (req, res, next) {
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  page = page > 0 ? page : 1;
  var tab = validator.trim(req.query.tab);
  var tabName;//分类名

  var query = {};
  if (tab) {
    query.category = tab;
    var kv = _.find(config.tabs, function(kv) {
      return kv[0] === tab;
    });
    tabName = kv ? kv[1] + '版块' : '';
  } else {
    tabName = '首页';
  }
  tabName += page > 1
    ? ' 第' + page + '页'
    : '';

  var limit = config.list_topic_count;
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-update_at'};

  //取热门标签
  var tag_options = {limit: config.list_hot_tag_count, sort: '-post_count'};

  //取最新评论
  var reply_query = {};
  var reply_options = {limit: config.list_latest_replies_count, sort: '-create_at'};

  //最近注册用户
  var users_query = {is_active: true};
  var recent_reg_options = {limit: 10, sort: '-create_at'};

  Promise
    .all([
      cache.get('hots' + tab),
      cache.get('hot_tags')
    ])
    .spread(function(hotPosts, hotTags) {
      var arr = [
        Post.getPostsByQuery(query, options),
        Post.getCountByQuery(query),
        Reply.getRepliesByQuery(reply_query, reply_options),
        User.getUsersByQuery(users_query, recent_reg_options),
      ];
      if (hotPosts) {
        arr.push(Promise.resolve(hotPosts));
      } else {
        arr.push(Post.getNewHot(query));
      }
      if (hotTags) {
        arr.push(Promise.resolve(hotTags));
      } else {
        arr.push(Tag.getHotTagsByQuery(tag_options));
      }

      return Promise.all(arr);
    })
    .spread(function(posts, count, replies, recentReg, hotPosts, hotTags) {
      //总页数
      var pages = Math.ceil(count / limit);
      //热门文章
      hotPosts = hotPosts.sort(function sortFn(a, b) {
        //pv排序
        return b.pv - a.pv;
      });
      //取前10条
      hotPosts = Array.prototype.slice.call(hotPosts, 0, 10);
      cache.set('hots' + tab, hotPosts, 60 * 5);//5分钟
      //热门标签
      cache.set('hot_tags', hotTags, 60 * 5);//5分钟

      res.wrapRender('index', {
        posts: posts,
        tab: tab,
        base: '/',
        current_page: page,
        pages: pages,
        hots: hotPosts,
        tags: hotTags,
        recent_reg: recentReg,
        replies: replies,
        title: tabName
      });
    })
    .catch(function(err) {
      return next(err);
    });
};

//站点地图
exports.sitemap = function (req, res, next) {
  var urlset = xmlbuilder.create('urlset', {version: '1.0', encoding: 'UTF-8'});
  urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  cache
    .get('sitemap')
    .then(function(sitemapData) {
      if (sitemapData) return res.type('xml').send(sitemapData);
      return Post.getLimit5w();
    })
    .then(function(posts) {
      if (!res.headersSent) {
        posts.forEach(function (post) {
          urlset.ele('url').ele('loc', 'https://blog.gaoqixhb.com/p/' + post._id);
        });
        var sitemapData = urlset.end();
        // 缓存
        cache.set('sitemap', sitemapData, 3600 * 2);
        res.type('xml').send(sitemapData);
      }
    })
    .catch(function(err) {
      return next(err);
    });
};

exports.robots = function (req, res, next) {
  res.type('text/plain');
  res.send(multiline(function () {;
    /*
     # See http://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file
     #
     # To ban all spiders from the entire site uncomment the next two lines:
      User-Agent: *
      allow: /
     */
  }));
};

/**
 * 工具
 * @param req
 * @param res
 * @param next
 */
exports.tools = function (req, res, next) {
  res.render('static/tools', {
    title: '常用工具'
  });
};

/**
 * 前端导航
 * @param req
 * @param res
 * @param next
 */
exports.feNav = function(req, res, next) {
  res.render('static/fe_nav', {
    title: '前端导航'
  });
};

/**
 * web api接口说明
 * @param req
 * @param res
 * @param next
 */
exports.api = function (req, res, next) {
  res.render('static/api', {
    title: 'api接口说明'
  });
};
