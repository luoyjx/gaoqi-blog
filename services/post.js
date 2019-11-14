/*!
 * post dao
 */
const Promise = require('bluebird')
const models = require('../models')
const Post = models.Post
const User = require('./user')
const Reply = require('./reply')
const tools = require('../common/tools')
const at = require('../common/at')

/**
 * 根据id查询一篇文章
 * Callback:
 * - err, 数据库错误
 * - post, 文章信息
 * - author, 作者信息
 * @param {String} id 用户id
 */
exports.getPostById = async id => {
  const post = await Post.findOne({ _id: id }).exec()
  const userFind = post ? User.getUserById(post.author_id) : undefined
  return [post, userFind]
}

/**
 * 获取一篇文章
 * @param {String} id 文章id
 */
exports.getPost = id => {
  return Post.findOne({ _id: id }).exec()
}

/**
 * 查询关键词能搜索到的文章数量
 * @param {String} query 搜索关键词
 */
exports.getCountByQuery = query => {
  return Post.count(query).exec()
}

/**
 * 取最新的5万条记录，sitemap使用
 */
exports.getLimit5w = () => {
  return Post.find({}, '_id', { limit: 50000, sort: '-create_at' }).exec()
}

/**
 * 根据查询条件查询文章
 * Callback:
 * - err, 数据库错误
 * - posts, 文章列表
 * @param {string|object} query 关键词
 * @param {Object} opt 搜索选项
 */
exports.getPostsByQuery = async (query, opt) => {
  const postsFind = await Post.find(query, {}, opt).exec()
  return Promise.map(postsFind, async post => {
    const author = await User.getUserById(post.author_id)
    post.author = author
    post.friendly_create_at = tools.formatDate(post.create_at, true)
    post.friendly_update_at = tools.formatDate(post.update_at, true)
    post.friendly_pv = tools.formatPV(post.pv)
    return post
  })
}

/**
 * 根据选项查询简单的文章实体
 * 并不做连接查询
 * @param {Object} options 查询选项
 */
exports.getSimplePosts = options => {
  return Post.find({}, { _id: 1, title: 1 }, options).exec()
}

/**
 * 查询最近热门的文章
 * @param query 过滤条件
 */
exports.getNewHot = query => {
  return Post.find(query)
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
 * @param postId
 */
exports.getCompletePost = async postId => {
  const postFind = await Post.findOne({ _id: postId }).exec()
  postFind.linkedContent = at.linkUsers(postFind.content)
  const [userFind, repliesFind] = await Promise.all([
    User.getUserById(postFind.author_id),
    Reply.getRepliesByPostId(postFind._id)
  ])
  return [postFind, userFind, repliesFind]
}

/**
 * 将当前文章的回复计数减1，并且更新最后回复的用户，删除回复时用到
 * @param {String} id 文章ID
 */
exports.reduceCount = async id => {
  const postFind = await Post.findOne({ _id: id }).exec()
  postFind.reply_count -= 1
  return postFind.save()
}

/**
 * 创建保存文章
 * @param {String} title 标题
 * @param {String} description 摘要
 * @param {String} content 内容
 * @param {String} authorId 作者id
 * @param {Array} tags 标签
 * @param {String} category 文章分类
 */
exports.newAndSave = (
  title,
  description,
  content,
  authorId,
  tags,
  category
) => {
  const post = new Post()
  post.title = title
  post.description = description
  post.content = content
  post.author_id = authorId
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
 * @param {String} authorId 作者id
 * @param {Array} tags 标签
 * @param {String} category 文章分类
 * @param {String} id 文章id，在导入时用到
 * @param {Date} create_at 创建时间
 * @param {Number} pv 浏览数
 */
exports.importNew = (
  title,
  description,
  content,
  authorId,
  tags,
  category,
  id,
  createAt,
  pv
) => {
  const post = new Post()
  post._id = id
  post.title = title
  post.description = description
  post.content = content
  post.author_id = authorId
  post.tags = tags
  post.category = category
  post.create_at = createAt
  post.update_at = createAt
  post.pv = pv
  post.save()
  return Promise.resolve(post)
}

/**
 * 删除
 * @param {Object} query 过滤条件
 * @returns {*}
 */
exports.remove = query => {
  return Post.remove(query)
}

/**
 * 设置置顶
 * @param {[type]} id [description]
 */
exports.setTop = id => {
  return Post.update({ _id: id }, { $set: { top: true } })
}
/**
 * 取消置顶
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
exports.cancelTop = id => {
  return Post.update({ _id: id }, { $set: { top: false } })
}
