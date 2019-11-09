/*!
 * tag controller
 */

const Bluebird = require('bluebird')
const validator = require('validator')

const { Tag, Post } = require('../dao')
const cutter = require('../common/cutter')
const config = require('../config')

/**
 * 查询所有标签信息
 * @param req
 * @param res
 * @param next
 */
exports.index = async (req, res, next) => {
  const path = req.path
  let page = req.query.page ? parseInt(req.query.page, 10) : 1
  page = page > 0 ? page : 1

  const limit = 20
  const options = { skip: (page - 1) * limit, limit: limit, sort: '-post_count' }

  try {
    const [tags, pages] = await Bluebird.all([
      Tag.getAllTagsByQuery({}, options)
        .then((tags) => {
          return Promise.map(tags, (tag) => {
            tag.description = cutter.shorter(tag.description, 200)
            return tag
          })
        }),
      Tag.getCountByQuery({})
        .then((allCount) => {
          return Promise.resolve(Math.ceil(allCount / limit))
        })
    ])

    res.render('tag/list', {
      base: path,
      current_page: page,
      pages: pages,
      tags: tags,
      title: '标签 - 第' + page + '页'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 某个tag的信息
 * @param req
 * @param res
 * @param next
 */
exports.getTagByName = async (req, res, next) => {
  const path = req.path
  const page = req.query.page ? parseInt(req.query.page, 10) : 1
  let name = validator.trim(req.params.name)
  name = validator.escape(name)
  const limit = config.list_topic_count

  let errorInfo = ''
  if (name.length === '') {
    errorInfo = 'tag名称不能为空'
  }

  if (errorInfo) {
    return res.status(422).render('notify/notify', { error: errorInfo })
  }

  // post options
  const options = { skip: (page - 1) * limit, limit: limit, sort: '-create_at' }

  try {
    const [tag, posts, pages] = await Bluebird.all([
      Tag.getTagByName(name),
      Post.getPostsByQuery({ tags: name }, options),
      Post.getCountByQuery({ tags: name })
        .then(function (allCount) {
          return Promise.resolve(Math.ceil(allCount / limit))
        })
    ])

    if (!tag) {
      return res.wrapRender('notify/notify', { error: '该标签可能已经去了火星' })
    }

    tag.short_desc = cutter.shorter(tag.description, 200)

    res.wrapRender('tag/index', {
      title: name + ' 第' + page + '页',
      tag: tag,
      posts: posts.length === 0 ? [] : posts,
      base: path,
      current_page: page,
      pages: pages
    })
  } catch (error) {
    next(error)
  }
}
