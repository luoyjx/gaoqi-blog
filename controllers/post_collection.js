/**
 * post collection controller
 * @authors yanjixiong ()
 * @date    2016-12-09 22:43:20
 * @version $Id$
 */

const config = require('../config')
const { PostCollection, User } = require('../dao')

/**
 * 查询收藏文章
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getPostCollection = async (req, res, next) => {
  let page = req.query.page ? parseInt(req.query.page) : 1
  page = page > 0 ? page : 1
  const user = req.session.user

  const limit = config.list_topic_count
  const options = { skip: (page - 1) * limit, limit: limit, sort: '-create_at' }

  try {
    const [posts, count] = await PostCollection.getCollectionPostByUser(user._id, options)
    const pages = Math.ceil(count / config.list_topic_count)

    res.render('user/post_collection', {
      current_page: page,
      posts: posts,
      pages: pages,
      base: '/my/post_collection',
      title: '文章收藏'
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

/**
 * 收藏文章
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.create = async (req, res, next) => {
  const postId = req.params._id
  const user = req.session.user

  try {
    await PostCollection.create(postId, user._id)
    await User.incCollectCount(user._id)

    user.collect_post_count++
    req.session.user = res.locals.user = user
    res.wrapSend({ success: 1 })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

/**
 * 取消收藏文章
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.removeById = async (req, res, next) => {
  const postId = req.params._id
  const user = req.session.user

  try {
    await PostCollection.remove(postId, user._id)
    await User.decCollectCount(user._id)
    user.collect_post_count--
    req.session.user = res.locals.user = user
    res.wrapSend({ success: 1 })
  } catch (err) {
    console.log(err)
    next(err)
  }
}
