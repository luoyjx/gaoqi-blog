/*!
 * controller index
 */
var eventproxy = require('eventproxy');
var Post = require('../dao').Post;
var Tag = require('../dao').Tag;
var config = require('../config');
var cache = require('../common/cache');
var xmlbuilder = require('xmlbuilder');
var multiline = require('multiline');
var validator = require('validator');

//站点首页
exports.index = function (req, res, next) {
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  page = page > 0 ? page : 1;
  var tab = validator.trim(req.query.tab);
  var proxy = new eventproxy();

  proxy.fail(next);
  var query = {};
  if (tab) {
    query.category = tab;
  }

  var limit = config.list_topic_count;
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-create_at'};

  //取文章
//  cache.get('posts-' + page, proxy.done(function (posts) {
//    if (posts) {
//      proxy.emit('posts', posts);
//    } else {
//      Post.getPostsByQuery(query, options, proxy.done('posts', function (posts) {
//        cache.set('posts-' + page, posts, 1000 * 60 * 5);//5分钟
//        return posts;
//      }));
//    }
//  }));

  Post.getPostsByQuery(query, options, proxy.done('posts'));

//  cache.get('pages', proxy.done(function (pages) {
//      if (pages) {
//        proxy.emit('pages', pages);
//      } else {
//      Post.getCountByQuery(query, proxy.done('pages', function (all_count) {
//        var pages = Math.ceil(all_count / limit);
//        cache.set('pages', pages, 60);//1分钟
//        proxy.emit('pages', pages);
//      }));
//    }
//  }));

  Post.getCountByQuery(query, proxy.done('pages', function (all_count) {
    var pages = Math.ceil(all_count / limit);
    proxy.emit('pages', pages);
  }));

  var hot_options = {limit: config.list_hot_topic_count, sort: '-pv'};

  //取热门文章
  cache.get('hots', proxy.done(function (hots) {
    if (hots) {
      proxy.emit('hots', hots);
    } else {
      Post.getHotPosts(hot_options, proxy.done('hots', function (hots) {
        cache.set('hots', hots, 1000 * 60 * 5);//5分钟
        return hots;
      }));
    }
  }));

  var tag_options = {limit: config.list_hot_tag_count, sort: '-post_count'};

  //取热门标签
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

  proxy.assign(['posts', 'hots', 'tags', 'pages'],
    function (posts, hots, tags, pages) {
      res.render('index', {
        posts: posts,
        tab: tab,
        base: '/',
        current_page: page,
        pages: pages,
        hots: hots,
        tags: tags,
        title: '首页'
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
     # User-Agent: *
     # Disallow: /
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