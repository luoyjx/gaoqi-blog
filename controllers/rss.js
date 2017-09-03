'use strict'

const config = require('../config')
const cache = require('../common/cache')
const convert = require('data2xml')()
const Post = require('../services/post')
const render = require('../common/render')

/**
 * rss输出
 * @param req
 * @param res
 * @param next
 */
exports.index = function * index () {
  if (!config.rss) {
    this.status = 404
    this.body = 'Please set `rss` in configuration'
    return
  }

  this.type = 'application/xml'

  const rssCache = cache.get('rss')

  if (rssCache) {
    this.body = rssCache
    return
  }

  const query_opt = { limit: config.rss.max_rss_items, sort: '-create_at' }
  const posts = yield Post.getPostsByQuery({}, query_opt)

  const rss_obj = {
    _attr: { version: '2.0' },
    channel: {
      title: config.rss.title,
      link: config.rss.link,
      language: config.rss.language,
      description: config.rss.description,
      item: []
    }
  }

  if (posts) {
    posts.forEach(function (post) {
      rss_obj.channel.item.push({
        title: post.title,
        link: config.rss.link + '/p/' + post._id,
        guid: config.rss.link + '/p/' + post._id,
        description: render.markdown(post.content),
        author: post.author.login_name,
        pubDate: post.create_at.toUTCString()
      })
    })
  }

  const rssContent = convert('rss', rss_obj)

  yield cache.set('rss', rssContent, 60 * 5) // 五分钟

  this.body = rssContent
}
