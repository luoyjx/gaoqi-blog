/*!
 * post dao
 */
var Promise = require('bluebird')
var models = require('../models')
var Post = models.Post
var User = require('./user')
var Reply = require('./reply')
var tools = require('../common/tools')
var at = require('../common/at')

/**
 * 根据id查询一篇文章
 * Callback:
 * - err, 数据库错误
 * - post, 文章信息
 * - author, 作者信息
 * @param {String} id 用户id
 */
exports.getPostById = function (id) {
  var _post

  return Post
    .findOne({ _id: id })
    .exec()
    .then(function (postFind) {
      _post = postFind
      return _post
        ? User.getUserById(_post.author_id)
        : Promise.resolve()
    })
    .then(function (userFind) {
      return Promise.resolve([_post, userFind])
    })
}

/**
 * 获取一篇文章
 * @param {String} id 文章id
 */
exports.getPost = function (id) {
  return Post.findOne({ _id: id }).exec()
}

/**
 * 查询关键词能搜索到的文章数量
 * @param {String} query 搜索关键词
 */
exports.getCountByQuery = function (query) {
  return Post.count(query).exec()
}

/**
 * 取最新的5万条记录，sitemap使用
 */
exports.getLimit5w = function () {
  return Post
    .find({}, '_id', { limit: 50000, sort: '-create_at' })
    .exec()
}

/**
 * 根据查询条件查询文章
 * Callback:
 * - err, 数据库错误
 * - posts, 文章列表
 * @param {string|object} query 关键词
 * @param {Object} opt 搜索选项
 */
exports.getPostsByQuery = function (query, opt) {
  return Post
    .find(query, {}, opt)
    .exec()
    .then(function (postsFind) {
      return Promise.map(postsFind, function (post) {
        return User
          .getUserById(post.author_id)
          .then(function (author) {
            post.author = author
            post.friendly_create_at = tools.formatDate(post.create_at, true)
            post.friendly_update_at = tools.formatDate(post.update_at, true)
            post.friendly_pv = tools.formatPV(post.pv)
            return post
          })
      })
    })
}

/**
 * 根据选项查询简单的文章实体
 * 并不做连接查询
 * @param {Object} options 查询选项
 */
exports.getSimplePosts = function (options) {
  return Post.find({}, { _id: 1, title: 1 }, options).exec()
}

/**
 * 查询最近热门的文章
 * @param query 过滤条件
 */
exports.getNewHot = function (query) {
  return Post
    .find(query)
    .limit(50)
    .sort({ create_at: -1 })
    .select({ _id: 1, title: 1, pv: 1 })
    .exec()
}

/**
 * 获得完整的文章，包括作者、回复
 * Callback:
 * - err, 数据库错误
 * - msg, 错误消息
 * - post, 文章
 * - author, 作者
 * - replies, 文章回复
 * @param post_id
 */
exports.getCompletePost = function (post_id) {
  return Post
    .findOne({ _id: post_id })
    .exec()
    .then(function (postFind) {
      postFind.linkedContent = at.linkUsers(postFind.content)
      return Promise
        .all([
          User.getUserById(postFind.author_id),
          Reply.getRepliesByPostId(postFind._id)
        ])
        .spread(function (userFind, repliesFind) {
          return Promise.resolve([postFind, userFind, repliesFind])
        })
    })
}

/**
 * 将当前文章的回复计数减1，并且更新最后回复的用户，删除回复时用到
 * @param {String} id 文章ID
 */
exports.reduceCount = function (id) {
  return Post
    .findOne({ _id: id })
    .exec()
    .then(function (postFind) {
      postFind.reply_count -= 1
      return postFind.save()
    })
}

/**
 * 创建保存文章
 * @param {String} title 标题
 * @param {String} description 摘要
 * @param {String} content 内容
 * @param {String} author_id 作者id
 * @param {Array} tags 标签
 * @param {String} category 文章分类
 */
exports.newAndSave = function (title, description, content, author_id, tags, category) {
  var post = new Post()
  post.title = title
  post.description = description
  post.content = content
  post.author_id = author_id
  post.tags = tags
  post.category = category
  post.save()
  return Promise.resolve(post)
}

/**
 * 导入文章
 * @param {String} title 标题
 * @param {String} description 摘要
 * @param {String} content 内容
 * @param {String} author_id 作者id
 * @param {Array} tags 标签
 * @param {String} category 文章分类
 * @param {String} id 文章id，在导入时用到
 * @param {Date} create_at 创建时间
 * @param {Number} pv 浏览数
 */
exports.importNew = function (title, description, content, author_id, tags, category, id, create_at, pv) {
  var post = new Post()
  post._id = id
  post.title = title
  post.description = description
  post.content = content
  post.author_id = author_id
  post.tags = tags
  post.category = category
  post.create_at = create_at
  post.update_at = create_at
  post.pv = pv
  post.save()
  return Promise.resolve(post)
}

/**
 * 删除
 * @param {Object} query 过滤条件
 * @returns {*}
 */
exports.remove = function (query) {
  return Post.remove(query)
}

/**
 * 设置置顶
 * @param {[type]} id [description]
 */
exports.setTop = function setTop (id) {
  return Post.update({ _id: id }, { $set: { top: true } })
}
/**
 * 取消置顶
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
exports.cancelTop = function cancelTop (id) {
  return Post.update({ _id: id }, { $set: { top: false } })
}
