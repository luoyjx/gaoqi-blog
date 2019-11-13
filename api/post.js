/*!
 * post web api
 */

const validator = require('validator')
const Post = require('../services').Post
const User = require('../services').User
const Tag = require('../services').Tag
const html2md = require('html2markdown')

/**
 * 通过api接口添加文章
 * @param req
 * @param res
 * @param next
 */
exports.create = async (req, res, next) => {
  let category = validator.trim(req.body.category)
  category = validator.escape(category)
  let title = validator.trim(req.body.title)
  title = validator.escape(title) // escape 将html 等特殊符号 标签转义
  let description = validator.trim(req.body.description)
  description = validator.escape(description)
  let content = validator.trim(req.body.content)
  const tags = validator.trim(req.body.tags)
  const isHtml = isNaN(validator.trim(req.body.is_html))
    ? 1
    : parseInt(validator.trim(req.body.is_html)) // 文章内容是否为html，是则转换为markdown

  // 验证
  let editError
  if (title === '') {
    editError = '标题不能是空的。'
  } else if (title.length < 5 || title.length > 100) {
    editError = '标题字数太多或太少。'
  } else if (category === '') {
    editError = '必须选择一个分类，没有可用unknown'
  } else if (description === '') {
    editError = '描述不能为空，字数在300字以内'
  } else if (content === '') {
    editError = '内容不可为空'
  }
  // END 验证

  if (editError) {
    res.status(422)
    return res.wrapSend({
      error_msg: editError
    })
  }

  let tagArr = tags ? tags.split(',') : []
  content = isHtml === 1 ? html2md(content) : content // 转换html成markdown格式

  try {
    const post = await Post.newAndSave(
      title,
      description,
      content,
      req.user._id,
      tagArr,
      category
    )
    const user = await User.getUserById(req.user.id)
    user.score += 5
    user.post_count += 1
    user.save()
    req.user = user

    res.wrapSend({
      success: 1,
      post_id: post._id
    })

    tagArr = tagArr.length > 0 ? tagArr : []
    tagArr.forEach(tag => {
      Tag.newAndSave(tag, '')
    })
  } catch (error) {
    next(error)
  }
}
