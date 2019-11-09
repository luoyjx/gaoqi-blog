/*!
 * controller post
 */

const Bluebird = require('bluebird')
const validator = require('validator')

const { Post, User, Tag, PostCollection } = require('../dao')
const tools = require('../common/tools')
const at = require('../common/at')
const config = require('../config')
const uploader = require('../common/upload')
const cutter = require('../common/cutter')
const render = require('../common/render')
const meta = require('../common/meta')
const twitter = require('../common/twitter')

/**
 * 文章页
 * @param  req
 * @param  res
 * @param  next
 */
exports.index = async (req, res, next) => {
  const postId = req.params._id
  const user = req.session.user
  let twitterMeta = ''

  if (postId.length !== 24) {
    return res.wrapRender('notify/notify', {
      error: '这篇文章好像不在这个星球上了'
    })
  }

  try {
    const [post, author, replies] = await Post.getCompletePost(postId)

    // 其他人或匿名用户访问时增加 PV
    if (user && author && user._id !== author._id) {
      post.pv += 1
      post.save()
    }

    // 格式化时间
    post.frendly_create_at = tools.formatDate(post.create_at, false)
    // 作者
    post.author = author
    // 回复
    post.replies = replies

    twitterMeta = meta.getTwitterMeta(post.category, author, post)

    const hotOptions = {
      limit: 6,
      sort: '-pv'
    }
    const recentOptions = {
      limit: 6,
      sort: '-create_at'
    }

    const [hotPosts, recentPosts, hasCollect] = await Bluebird.all([
      Post.getSimplePosts(hotOptions),
      Post.getSimplePosts(recentOptions),
      req.session.user ? PostCollection.hasCollect(post._id, req.session.user._id) : Promise.resolve(false)
    ])

    res.wrapRender('post/index', {
      title: post.title + ' - ' + post.author.login_name, // 文章名 - 作者名
      description: cutter.shorter(cutter.clearHtml(render.markdown(post.linkedContent)), 100),
      tags: post.tags.join(','),
      post: post,
      recent: recentPosts,
      hots: hotPosts,
      replies: post.replies,
      hasCollect: !!hasCollect, // 转义boolean
      twitterMeta: twitterMeta
    })
  } catch (err) {
    res.wrapRender('notify/notify', {
      error: err
    })
  }
}

/**
 * 跳到创建文章页
 * @param req
 * @param res
 * @param next
 */
exports.showCreate = (req, res, next) => {
  res.render('post/edit', {
    title: '发表文章'
  })
}

/**
 * 保存新文章
 * @param req
 * @param res
 * @param next
 */
exports.create = async (req, res, next) => {
  let category = validator.trim(req.body.category)
  category = validator.escape(category)
  let title = validator.trim(req.body.title)
  title = validator.escape(title) // escape 将html 等特殊符号 标签转义
  const content = validator.trim(req.body.content)
  const tags = validator.trim(req.body.tags)

  let error
  if (category === '') {
    error = '请选择一个分类'
  } else if (title === '') {
    error = '标题不能为空'
  } else if (title.length < 5 || title.length > 100) {
    error = '标题字数在5到100之间'
  } else if (category === '') {
    error = '必须选择一个分类'
  } else if (content === '') {
    error = '文章内容不能为空'
  }

  if (error) {
    return res.status(422).wrapRender('post/edit', {
      edit_error: error,
      title: '发表文章',
      content: content
    })
  } else {
    try {
      let tagsArr = tags ? tags.split(',') : []
      const _post = await Post.newAndSave(title, '', content, req.session.user._id, tagsArr, category)
      const userFind = await User.getUserById(req.session.user._id)

      userFind.score += 5
      userFind.post_count += 1
      userFind.save()
      req.session.user = userFind
      // 发送at消息
      at.sendMessageToMentionUsers(content, _post._id, req.session.user._id, null, req.session.user.login_name, _post.title)

      res.redirect('/p/' + _post._id)

      // send to twitter async
      if (tagsArr.length > 0) {
        tagsArr = tagsArr.filter((tagName) => {
          return !!tagName
        })

        Bluebird.map(tagsArr, async (tagName) => {
          const tag = await Tag.getTagByName(tagName)
          if (!tag) {
            const newTag = await Tag.newAndSave(tagName, '')
            newTag.post_count += 1
            newTag.save()
          } else {
            tag.post_count += 1
            tag.save()
          }
        })
      }

      var status = []
      status.push('[' + tools.getCategoryName(_post.category) + ']')
      status.push(_post.title + ':\n')
      status.push(render.cleanMarkdown(_post.content))
      // 截取50个字
      status = cutter.shorter(status.join(''), 70)
      status += 'https://' + config.host + '/p/' + _post._id + '?from=post_twitter'
      twitter.postStatus(status)
    } catch (err) {
      return next(err)
    }
  }
}

/**
 * 跳转到编辑文章页面
 * @param req
 * @param res
 * @param next
 */
exports.edit = async (req, res, next) => {
  const postId = req.params._id

  const [post] = await Post.getPostById(postId)
  if (!post) {
    return res.wrapRender('notify/notify', {
      error: '这篇文章从地球上消失了'
    })
  }

  if (!((post.author_id + '') === (req.session.user._id + '') || (req.session.user.is_admin))) {
    return res.wrapRender('notify/notify', {
      error: '大胆！这篇文章岂是你能编辑的？'
    })
  }

  res.wrapRender('post/edit', {
    title: '编辑文章',
    action: 'edit',
    post_id: post._id,
    post_title: post.title,
    content: post.content,
    category: post.category,
    tags: post.tags
  })
}

/**
 * 更新文章信息
 * @param req
 * @param res
 * @param next
 */
exports.update = async (req, res, next) => {
  const postId = req.params._id
  // escape 将 html 等特殊符号 标签转义
  let category = validator.trim(req.body.category)
  category = validator.escape(category)
  let title = validator.trim(req.body.title)
  title = validator.escape(title)
  const content = validator.trim(req.body.content)
  const tags = validator.trim(req.body.tags)
    ? validator.trim(req.body.tags) : ''

  // 验证
  var editError
  if (title === '') {
    editError = '标题不能是空的。'
  } else if (title.length < 5 || title.length > 100) {
    editError = '标题字数太多或太少。'
  } else if (!category) {
    editError = '必须选择一个分类'
  }
  // END 验证

  if (editError) {
    res.status(422)
    return res.wrapRender('post/edit', {
      action: 'edit',
      edit_error: editError,
      post_id: postId,
      content: content
    })
  }

  try {
    const [post] = await Post.getPostById(postId)

    if (!post) {
      return res.wrapRender('notify/notify', {
        error: '这篇文章从地球上消失了'
      })
    }

    // 只有管理员、非管理员但是是本帖发帖用户 二者可用修改本帖
    if (req.session.user.is_admin || ((post.author_id + '') === (req.session.user._id + ''))) {
      // 保存文章
      post.title = title
      post.content = content
      post.category = category
      post.tags = tags.split(',')
      post.update_at = new Date()
      post.save()
    } else {
      return res.wrapRender('notify/notify', {
        error: '这篇文章可不是谁都能编辑的'
      })
    }

    if (!res.headersSent) {
      // 发送at消息
      at.sendMessageToMentionUsers(content, post._id, req.session.user._id, null, req.session.user.login_name, post.title)
      res.redirect('/p/' + post._id)
    }
  } catch (err) {
    next(err)
  }
}

/**
 * 删除文章
 * @param req
 * @param res
 * @param next
 */
exports.delete = async (req, res, next) => {
  const postId = req.params._id

  try {
    const postFind = await Post.getPostById(postId)

    console.log(req.session.user._id)

    if (!req.session.user.is_admin && (postFind.author_id + '') !== (req.session.user._id + '')) {
      return res.status(403).wrapSend({
        success: false,
        message: '这篇文章可不是谁都能删除的'
      })
    }

    if (!postFind) {
      return res.status(422).wrapSend({
        success: false,
        message: '这篇文章从地球上消失了'
      })
    }

    // 数据库删除
    await Post.remove({
      _id: postFind._id
    })

    console.log('delete done')
    res.wrapSend({
      success: true,
      message: '这篇文章已被送到火星上了'
    })
  } catch (err) {
    res.wrapSend({
      success: false,
      message: err.message
    })
  }
}

/**
 * 置顶(管理员等操作)
 * @param req
 * @param res
 * @param next
 */
exports.top = async (req, res, next) => {
  const id = req.params._id

  try {
    await Post.setTop(id)
    res.wrapSend({
      success: true
    })
  } catch (err) {
    res.wrapSend({
      success: false,
      message: err.message
    })
  }
}

/**
 * 取消顶置
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.unTop = async (req, res, next) => {
  const id = req.params._id

  try {
    await Post.cancelTop(id)
    res.wrapSend({
      success: true
    })
  } catch (err) {
    res.wrapSend({
      success: false,
      message: err.message
    })
  }
}

/**
 * 上传文件
 * @param req
 * @param res
 * @param next
 */
exports.upload = function (req, res, next) {
  req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    uploader
      .upload(file, {
        filename: filename
      })
      .then((result) => {
        res.json({
          success: true,
          url: result.url
        })
      })
      .catch((err) => {
        return next(err)
      })
  })

  req.pipe(req.busboy)
}

/**
 * 锁定文章
 * @param req
 * @param res
 * @param next
 */
exports.lock = function (req, res, next) {

}
