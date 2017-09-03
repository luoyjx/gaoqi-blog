'use strict'

const Promise = require('bluebird')
const Tag = require('../services/tag')
const Post = require('../services/post')
const validator = require('validator')
const filters = require('../common/filters')
const config = require('../config')

/**
 * 查询所有标签信息
 */
exports.index = function * index () {
  const path = this.path
  let page = this.query.page ? parseInt(this.query.page, 10) : 1
  page = page > 0 ? page : 1

  const limit = 20
  const options = { skip: (page - 1) * limit, limit, sort: '-post_count' }

  const [tags, pages] = yield Promise.all([
    Tag.getAllTagsByQuery({}, options)
      .then(function (tags) {
        return Promise.map(tags, function (tag) {
          tag.description = filters.shorter(tag.description, 200)
          return tag
        })
      }),
    Tag.getCountByQuery({})
      .then(function (all_count) {
        return Promise.resolve(Math.ceil(all_count / limit))
      })
  ])

  yield this.render('tag/list', {
    base: path,
    current_page: page,
    pages,
    tags,
    title: '标签 - 第' + page + '页'
  })
}

/**
 * 某个tag的信息
 */
exports.getTagByName = function * getTagByName () {
  const path = this.path
  const page = this.query.page ? parseInt(this.query.page, 10) : 1
  let name = validator.trim(this.params.name)
  name = validator.escape(name)
  const limit = config.list_topic_count

  let errorInfo = ''
  if (name.length === '') {
    errorInfo = 'tag名称不能为空'
  }

  if (errorInfo) {
    this.status = 422
    return yield this.render('notify/notify', { error: errorInfo })
  }

  // post options
  const options = { skip: (page - 1) * limit, limit, sort: '-create_at' }

  const [tag, posts, pages] = yield Promise.all([
    Tag.getTagByName(name),
    Post.getPostsByQuery({ tags: name }, options),
    Post.getCountByQuery({ tags: name })
      .then(function (all_count) {
        return Promise.resolve(Math.ceil(all_count / limit))
      })
  ])

  if (!tag) {
    return yield this.render('notify/notify', { error: '该标签可能已经去了火星' })
  }

  tag.short_desc = filters.shorter(tag.description, 200)

  yield this.render('tag/index', {
    title: name + ' 第' + page + '页',
    tag,
    posts: posts.length === 0 ? [] : posts,
    base: path,
    current_page: page,
    pages
  })
}
