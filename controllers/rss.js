/*!
 * rss controller
 */
var config = require('../config');
var cache = require('../common/cache');
var convert = require('data2xml')();
var Post = require('../dao/').Post;
var render = require('../common/render');

/**
 * rss输出
 * @param req
 * @param res
 * @param next
 */
exports.index = function (req, res, next) {
  if (!config.rss) {
    res.statusCode = 404;
    return res.send('Please set `rss` in configuration');
  }
  res.contentType('application/xml');
  cache.get('rss', function (err, rss) {
    if (rss) {
      res.send(rss);
    } else {
      var query_opt = {limit: config.rss.max_rss_items, sort: '-create_at'};
      Post.getPostsByQuery({}, query_opt, function (err, posts) {
        if (err) {
          res.statusCode = 500;
          return res.send(' rss error');
        }
        var rss_obj = {
          _attr: { version: '2.0' },
          channel: {
            title: config.rss.title,
            link: config.rss.link,
            language: config.rss.language,
            description: config.rss.description,
            item: []
          }
        };
        posts.forEach(function (post) {
          rss_obj.channel.item.push({
            title: post.title,
            link: config.rss.link + '/p/' + post._id,
            guid: config.rss.link + '/p/' + post._id,
            description: render.markdown(post.content),
            author: post.author.login_name,
            pubDate: post.create_at.toUTCString()
          });
        });
        var rssContent = convert('rss', rss_obj);
        cache.set('rss', rssContent, 1000 * 60 * 5); // 五分钟
        res.send(rssContent);
      });
    }
  });
};