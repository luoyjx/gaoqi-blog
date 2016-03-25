/*!
 * controller index
 */
var eventproxy = require('eventproxy');
var Post = require('../dao').Post;
var Tag = require('../dao').Tag;
var Reply = require('../dao').Reply;
var User = require('../dao').User;
var config = require('../config');
var cache = require('../common/cache');
var xmlbuilder = require('xmlbuilder');
var multiline = require('multiline');
var validator = require('validator');
var _ = require('lodash');

//站点首页
exports.index = function (req, res, next) {
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  page = page > 0 ? page : 1;
  var tab = validator.trim(req.query.tab);
  var proxy = new eventproxy();
  var tabName;//分类名

  proxy.fail(next);
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

  var limit = config.list_topic_count;
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-create_at'};

  Post.getPostsByQuery(query, options, proxy.done('posts'));

  Post.getCountByQuery(query, proxy.done('pages', function (all_count) {
    var pages = Math.ceil(all_count / limit);
    proxy.emit('pages', pages);
  }));

  //取热门文章
  var hot_options = {limit: config.list_hot_topic_count, sort: '-pv'};

  cache.get('hots' + tab, proxy.done(function (hots) {
    if (hots) {
      proxy.emit('hots', hots);
    } else {
      Post.getNewHot(query, proxy.done('hots', function (hots) {
        //pv排序
        hots = hots.sort(function sortFn(a, b) {
          return b.pv - a.pv;
        });
        //取前10条
        hots = Array.prototype.slice.call(hots, 0, 10);
        cache.set('hots' + tab, hots, 1000 * 60 * 5);//5分钟
        return hots;
      }));
    }
  }));

  //取热门标签
  var tag_options = {limit: config.list_hot_tag_count, sort: '-post_count'};

  cache.get('hot_tags', proxy.done(function (tags) {
    if (tags) {
      proxy.emit('tags', tags);
    } else {
      Tag.getHotTagsByQuery(tag_options, proxy.done('tags', function (tags) {
        cache.set('hot_tags', tags, 1000 * 60 * 5);//5分钟
        return tags;
      }));
    }
  }));

  //取最新评论
  var reply_query = {};
  var reply_options = {limit: config.list_latest_replies_count, sort: '-create_at'};

  Reply.getRepliesByQuery(reply_query, reply_options, proxy.done('latest_replies'));

  //最近注册用户
  var users_query = {is_active: true};
  var recent_reg_options = {limit: 10, sort: '-create_at'};

  User.getUsersByQuery(users_query, recent_reg_options, proxy.done('recent_reg'));

  proxy.assign(['posts', 'hots', 'tags', 'latest_replies', 'recent_reg', 'pages'],
    function (posts, hots, tags, replies, recent_reg, pages) {

      res.render('index', {
        posts: posts,
        tab: tab,
        base: '/',
        current_page: page,
        pages: pages,
        hots: hots,
        tags: tags,
        recent_reg: recent_reg,
        replies: replies,
        title: tabName
      });
    });
};

//站点地图
exports.sitemap = function (req, res, next) {
  var urlset = xmlbuilder.create('urlset',
    {version: '1.0', encoding: 'UTF-8'});
  urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  var ep = new eventproxy();
  ep.fail(next);

  ep.all('sitemap', function (sitemap) {
    res.type('xml');
    res.send(sitemap);
  });

  cache.get('sitemap', ep.done(function (sitemapData) {
    if (sitemapData) {
      ep.emit('sitemap', sitemapData);
    } else {
      Post.getLimit5w(function (err, posts) {
        if (err) {
          return next(err);
        }
        posts.forEach(function (post) {
          urlset.ele('url').ele('loc', 'http://blog.gaoqixhb.com/p/' + post._id);
        });

        var sitemapData = urlset.end();
        // 缓存一天
        cache.set('sitemap', sitemapData, 1000 * 3600 * 2);
        ep.emit('sitemap', sitemapData);
      });
    }
  }));
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