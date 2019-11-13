/*!
 * controller index
 */

const _ = require('lodash')
const Bluebird = require('bluebird')
const xmlbuilder = require('xmlbuilder')
const validator = require('validator')

const { Post, Tag, Reply, User } = require('../services')
const config = require('../config')
const cache = require('../common/cache')

// 站点首页
exports.index = async (req, res, next) => {
  let page = req.query.page ? parseInt(req.query.page, 10) : 1
  page = page > 0 ? page : 1
  const tab = validator.trim(req.query.tab || '')
  let tabName // 分类名

  const query = {}
  if (tab) {
    query.category = tab

    const kv = _.find(config.tabs, kv => {
      return kv[0] === tab
    })

    tabName = kv ? kv[1] + '版块' : ''
  } else {
    tabName = '首页'
  }

  tabName += page > 1 ? ' 第' + page + '页' : ''

  const limit = config.list_topic_count
  const options = { skip: (page - 1) * limit, limit, sort: '-top -update_at' }

  // 取热门标签
  const tagOptions = { limit: config.list_hot_tag_count, sort: '-post_count' }

  // 取最新评论
  const replyQuery = {}
  const replyOptions = {
    limit: config.list_latest_replies_count,
    sort: '-create_at'
  }

  // 最近注册用户
  const usersQuery = { is_active: true }
  const recentRegOptions = { limit: 10, sort: '-create_at' }

  try {
    const { hotPosts, hotTags } = await Bluebird.props({
      hotPostsCache: cache.get('hots' + tab),
      hotTagsCache: cache.get('hot_tags')
    })

    let {
      posts,
      count,
      replies,
      recentReg,
      hots,
      hotsTag
    } = await Bluebird.props({
      posts: Post.getPostsByQuery(query, options),
      count: Post.getCountByQuery(query),
      replies: Reply.getRepliesByQuery(replyQuery, replyOptions),
      recentReg: User.getUsersByQuery(usersQuery, recentRegOptions),
      hots: hotPosts || Post.getNewHot(query),
      hotsTag: hotTags || Tag.getHotTagsByQuery(tagOptions)
    })

    // 总页数
    const pages = Math.ceil(count / limit)
    // 热门文章
    hots = hots.sort((a, b) => {
      // pv排序
      return b.pv - a.pv
    })
    // 取前10条
    hots = Array.prototype.slice.call(hots, 0, 10)
    cache.set('hots' + tab, hots, 60 * 5) // 5分钟
    // 热门标签
    cache.set('hot_tags', hotsTag, 60 * 5) // 5分钟

    res.wrapRender('index', {
      posts: posts || [],
      tab: tab,
      base: '/',
      current_page: page,
      pages: pages || [],
      hots: hots || [],
      tags: hotsTag || [],
      recent_reg: recentReg || [],
      replies: replies || [],
      title: tabName
    })
  } catch (error) {
    return next(error)
  }
}

// 站点地图
exports.sitemap = async (req, res, next) => {
  var urlset = xmlbuilder.create('urlset', {
    version: '1.0',
    encoding: 'UTF-8'
  })
  urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')

  try {
    const sitemapData = await cache.get('sitemap')

    if (sitemapData) return res.type('xml').send(sitemapData)

    const [posts, tags] = await Promise.all([
      Post.getLimit5w(),
      Tag.getAllTagsByQuery({}, { sort: '-post_count' })
    ])

    if (!res.headersSent) {
      posts.forEach(post => {
        urlset
          .ele('url')
          .ele('loc', 'https://' + config.host + '/p/' + post._id)
      })
      tags.forEach(tag => {
        urlset
          .ele('url')
          .ele('loc', 'https://' + config.host + '/tags/' + tag.name)
      })
      var finalData = urlset.end()
      // 缓存
      cache.set('sitemap', finalData, 3600 * 2)
      res.type('xml').send(finalData)
    }
  } catch (error) {
    return next(error)
  }
}

exports.robots = (req, res, next) => {
  res.type('text/plain')
  res.send(`# See http://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file
 #
 # To ban all spiders from the entire site uncomment the next two lines:
 # User-Agent: *
 # allow: /`)
}

/**
 * 工具
 * @param req
 * @param res
 * @param next
 */
exports.tools = (req, res, next) => {
  res.render('static/tools', {
    title: '常用工具'
  })
}

/**
 * 前端导航
 * @param req
 * @param res
 * @param next
 */
exports.feNav = (req, res, next) => {
  res.render('static/fe_nav', {
    title: '前端导航'
  })
}

/**
 * web api接口说明
 * @param req
 * @param res
 * @param next
 */
exports.api = (req, res, next) => {
  res.render('static/api', {
    title: 'api接口说明'
  })
}
