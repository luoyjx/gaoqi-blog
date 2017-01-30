/**
 * console post controller
 * @authors luoyjx (yjk99@qq.com)
 * @date    2016-11-07 20:35:51
 */

var Promise = require('bluebird');
var Post = require('../../dao').Post;
var config = require('../../config');

module.exports = {
  /**
   * 文章管理首页
   * @param  {[type]}   req  [description]
   * @param  {[type]}   res  [description]
   * @param  {Function} next [description]
   * @return {[type]}        [description]
   */
  index: function index(req, res, next) {
    var page = req.query.page ? parseInt(req.query.page, 10) : 1;
    page = page > 0 ? page : 1;

    var query = {};

    var limit = config.list_topic_count;
    var options = { skip: (page - 1) * limit, limit: limit, sort: '-update_at'};

    Promise
      .all([
        Post.getPostsByQuery(query, options),
        Post.getCountByQuery(query),
      ])
      .spread(function(posts, count) {
        //总页数
        var pages = Math.ceil(count / limit);

        res.wrapRender('console/post/index', {
          posts: posts,
          base: '/',
          current_page: page,
          pages: pages,
        });
      })
      .catch(function(err) {
        return next(err);
      });

  }
};