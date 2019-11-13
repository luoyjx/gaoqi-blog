/*!
 * tag web api
 */
const validator = require('validator')
const Tag = require('../services').Tag

/**
 * 根据名称关键字搜索标签
 * @param req
 * @param res
 * @param next
 */
exports.searchTagsByName = async (req, res, next) => {
  const name = validator.trim(req.query.q)
  const callback = req.query.callback
  if (!name) {
    return res.end(callback + '([])')
  }

  const pattern = new RegExp('^.*' + name + '.*$', 'igm')
  const options = { limit: 10, sort: '-post_count' }

  try {
    const tags = await Tag.getAllTagsByQuery({ name: pattern }, options)

    // 数据库中不存在此tag则返回只当前tag名称
    if (tags.length === 0) {
      return res.end(callback + '([{name: "' + name + '"}])')
    }
    // 如果tags中不存在当前名称tag则加到第一个元素
    let exists = false
    const container = []

    tags.forEach(tag => {
      if (tag.name.toLowerCase() === name) {
        exists = true
      }
      container.push({ name: tag.name })
    })

    if (!exists) {
      if (container.length === 10) {
        container.pop()
      }
      container.unshift({ name: name })
    }

    res.end(callback + '(' + JSON.stringify(container) + ')')
  } catch (error) {
    next(error)
  }
}

/**
 * 新增一个tag
 * @param req
 * @param res
 * @param next
 */
exports.addTag = async (req, res, next) => {
  let name = validator.trim(req.body.name)
  name = validator.escape(name)
  let description = validator.trim(req.body.description)
  description = validator.escape(description)

  // 验证
  let editError
  if (name === '') {
    editError = '标题不能是空的'
  }
  // END 验证

  if (editError) {
    res.status(422)
    return res.wrapSend({
      error_msg: editError
    })
  }

  try {
    // 查询是否存在这个tag，不存在则添加
    const tag = await Tag.getTagByName(name)

    if (tag) {
      if (description) {
        tag.description = description
        tag.update_at = new Date()
        tag.save()
        return res.wrapSend({
          success: 1,
          tag_id: tag._id,
          msg: '更新成功'
        })
      } else {
        return res.wrapSend({
          error_msg: 'tag已存在'
        })
      }
    } else {
      const tag = await Tag.newAndSave(name, description)
      res.wrapSend({ success: 1, tag_id: tag._id })
    }
  } catch (error) {
    next(error)
  }
}

/**
 * 关注标签
 * @param req
 * @param res
 * @param next
 */
exports.follow = (req, res, next) => {
  const user = req.session.user
  const tagId = validator.trim(req.params._id)
  if (!user) {
    return res.json({ success: 0, msg: '未登录' })
  } else if (!tagId) {
    return res.status(403).json({ success: 0, msg: '未知的标签' })
  }

  res.json({ success: 1, msg: '', data: 1 })
}

/**
 * 取消关注标签
 * @param req
 * @param res
 * @param next
 */
exports.unFollow = (req, res, next) => {}
