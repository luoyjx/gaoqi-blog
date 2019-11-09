/**
 * console post controller
 * @authors luoyjx (yjk99@qq.com)
 * @date    2016-11-07 20:35:51
 */

const Bluebird = require('bluebird')
const { Post } = require('../../services')
const config = require('../../config')

module.exports = {
  /**
   * 文章管理首页
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  index: async (req, res, next) => {
    let page = req.query.page ? parseInt(req.query.page, 10) : 1
    page = page > 0 ? page : 1

    const query = {}

    const limit = config.list_topic_count
    const options = { skip: (page - 1) * limit, limit: limit, sort: '-top -update_at' }

    try {
      const [posts, count] = await Bluebird.all([
        Post.getPostsByQuery(query, options),
        Post.getCountByQuery(query)
      ])

      // 总页数
      const pages = Math.ceil(count / limit)

      res.wrapRender('console/post/index', {
        posts: posts,
        base: '/',
        current_page: page,
        pages: pages
      })
    } catch (error) {
      next(error)
    }
  }
}
