'use strict'

const Promise = require('bluebird')
const Post = require('../../services/post')
const config = require('config')

module.exports = {
  /**
   * 文章管理首页
   */
  index: function * index () {
    let page = this.query.page ? parseInt(this.query.page, 10) : 1
    page = page > 0 ? page : 1

    const query = {}
    const limit = config.list_topic_count
    const options = { skip: (page - 1) * limit, limit, sort: '-top -update_at' }

    const [posts, count] = yield Promise.all([
      Post.getPostsByQuery(query, options),
      Post.getCountByQuery(query)
    ])

    // 总页数
    const pages = Math.ceil(count / limit)

    yield this.render('console/post/index', {
      posts,
      base: '/',
      current_page: page,
      pages
    })
  }
}
