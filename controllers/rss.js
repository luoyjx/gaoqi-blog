/*!
 * rss controller
 */

const config = require('../config');
const convert = require('data2xml')();

const { Post } = require('../dao/');
const render = require('../common/render');
const cache = require('../common/cache');

/**
 * rss输出
 * @param req
 * @param res
 * @param next
 */
exports.index = async (req, res, next) => {
  if (!config.rss) {
    res.statusCode = 404;
    return res.send('Please set `rss` in configuration');
  }
  res.contentType('application/xml');

  try {
    const rss = await cache.get('rss')

    if (rss) {
      res.wrapSend(rss);
      return next();
    }

    const query_opt = {limit: config.rss.max_rss_items, sort: '-create_at'};
    const posts = (await Post.getPostsByQuery({}, query_opt)) || [];

    const rss_obj = {
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
    cache.set('rss', rssContent, 60 * 5); // 五分钟
    res.wrapSend(rssContent);
  } catch (error) {
    res.status(500).wrapSend(' rss error');
  }
};
