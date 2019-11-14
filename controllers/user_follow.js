/**
 * user follow controller
 * @authors yanjixiong ()
 * @date    2016-12-08 11:55:40
 * @version $Id$
 */

const Bluebird = require('bluebird')
const _ = require('lodash')
const validator = require('validator')

const { User, UserFollow, Post } = require('../services')
const config = require('../config')

/**
 * 关注用户的文章
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getFollowUserPost = async (req, res, next) => {
  let page = req.query.page ? parseInt(req.query.page, 10) : 1
  page = page > 0 ? page : 1
  const user = req.session.user
  let followIds = []
  const limit = config.list_topic_count

  try {
    const follows = await UserFollow.getByFollower(user._id)

    followIds = _.map(follows, 'following_id')

    const postQuery = { author_id: { $in: followIds } }
    const postOptions = {
      skip: (page - 1) * limit,
      limit: limit,
      sort: '-update_at'
    }

    const [posts, count] = await Bluebird.all([
      Post.getPostsByQuery(postQuery, postOptions),
      Post.getCountByQuery(postQuery)
    ])

    // 总页数
    const pages = Math.ceil(count / limit)

    res.render('user/user_follow', {
      pages: pages,
      current_page: page,
      posts: posts,
      base: '/my/following',
      title: '我的关注'
    })
  } catch (err) {
    console.error('getFollowUserPost error: ', err)
    next(err)
  }
}

/**
 * 关注
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.follow = async (req, res, next) => {
  const followingId = validator.trim(req.params.id)
  const referer = req.headers.referer

  try {
    await UserFollow.follow(followingId, req.session.user._id)
    await User.incFollowingCount(req.session.user._id)

    const user = req.session.user
    user.following_count++
    req.session.user = res.locals.user = user

    res.redirect(referer)
  } catch (error) {
    next(error)
  }
}

/**
 * 取消关注
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.unFollow = async (req, res, next) => {
  const followingId = validator.trim(req.params.id)
  const referer = req.headers.referer

  try {
    await UserFollow.unFollow(followingId, req.session.user._id)
    await User.decFollowingCount(req.session.user._id)

    const user = req.session.user
    user.following_count--
    req.session.user = res.locals.user = user
    res.redirect(referer)
  } catch (error) {
    next(error)
  }
}
