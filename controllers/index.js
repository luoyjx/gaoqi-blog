/*!
 * controller index
 */

const _ = require('lodash');
const Bluebird = require('bluebird');
const xmlbuilder = require('xmlbuilder');
const multiline = require('multiline');
const validator = require('validator');

const { Post, Tag, Reply, User } = require('../dao');
const config = require('../config');
const cache = require('../common/cache');

//站点首页
exports.index = async (req, res, next) => {
  let page = req.query.page ? parseInt(req.query.page, 10) : 1;
  page = page > 0 ? page : 1;
  const tab = validator.trim(req.query.tab || '');
  let tabName; // 分类名

  const query = {};
  if (tab) {
    query.category = tab;

    const kv = _.find(config.tabs, function(kv) {
      return kv[0] === tab;
    });

    tabName = kv ? kv[1] + '版块' : '';
  } else {
    tabName = '首页';
  }

  tabName += page > 1
    ? ' 第' + page + '页'
    : '';

  const limit = config.list_topic_count;
  const options = { skip: (page - 1) * limit, limit, sort: '-top -update_at' };

  //取热门标签
  const tag_options = { limit: config.list_hot_tag_count, sort: '-post_count' };

  //取最新评论
  const reply_query = {};
  const reply_options = { limit: config.list_latest_replies_count, sort: '-create_at' };

  //最近注册用户
  const users_query = { is_active: true };
  const recent_reg_options = { limit: 10, sort: '-create_at' };

  try {
    const [hotPosts, hotTags] = await Promise.all([
      cache.get('hots' + tab),
      cache.get('hot_tags')
    ])

    const arr = [
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

    const [posts, count, replies, recentReg, hotPosts, hotTags] = Promise.all(arr);

    //总页数
    const pages = Math.ceil(count / limit);
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
  } catch (error) {
    return next(error);
  }
};

//站点地图
exports.sitemap = function (req, res, next) {
  var urlset = xmlbuilder.create('urlset', {version: '1.0', encoding: 'UTF-8'});
  urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  cache
    .get('sitemap')
    .then(function(sitemapData) {
      if (sitemapData) return res.type('xml').send(sitemapData);

      return Promise
        .all([
          Post.getLimit5w(),
          Tag.getAllTagsByQuery({}, {sort: '-post_count'})
        ]);
    })
    .spread(function(posts, tags) {
      if (!res.headersSent) {
        posts.forEach(function (post) {
          urlset.ele('url').ele('loc', 'https://' + config.host + '/p/' + post._id);
        });
        tags.forEach(function(tag) {
          urlset.ele('url').ele('loc', 'https://' + config.host + '/tags/' + tag.name);
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
  res.send(multiline(function () {/*
 # See http://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file
 #
 # To ban all spiders from the entire site uncomment the next two lines:
 # User-Agent: *
 # allow: /
 */}));
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
