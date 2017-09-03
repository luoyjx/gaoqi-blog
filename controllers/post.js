'use strict'

const Promise = require('bluebird')
const validator = require('validator')
const config = require('config')
const Post = require('../services/post')
const User = require('../services/user')
const Tag = require('../services/tag')
const PostCollection = require('../services/post_collection')
const tools = require('../common/tools')
const at = require('../common/at')
const uploader = require('../common/upload')
const filters = require('../common/filters')
const render = require('../common/render')
const meta = require('../common/meta')
const twitter = require('../common/twitter')

/**
 * 文章页
 */
exports.index = function * index () {
  const post_id = this.params._id
  let twitterMeta = ''

  if (post_id.length !== 24) {
    return yield this.render('notify/notify', {
      error: '这篇文章好像不在这个星球上了'
    })
  }

  const [post, author, replies] = Post.getCompletePost(post_id)

  post.pv += 1
  post.save()
  // 格式化时间
  post.frendly_create_at = tools.formatDate(post.create_at, false)
  // 作者
  post.author = author
  // 回复
  post.replies = replies

  twitterMeta = meta.getTwitterMeta(post.category, author, post)

  const hot_options = {
    limit: 6,
    sort: '-pv'
  }
  const recent_options = {
    limit: 6,
    sort: '-create_at'
  }

  const [hotPosts, recentPosts, hasCollect] = yield Promise.all([
    Post.getSimplePosts(hot_options),
    Post.getSimplePosts(recent_options),
    this.session.user ? PostCollection.hasCollect(post._id, this.session.user._id) : Promise.resolve(false)
  ])

  yield this.render('post/index', {
    title: post.title + ' - ' + post.author.login_name, // 文章名 - 作者名
    description: filters.shorter(filters.clearHtml(render.markdown(post.linkedContent)), 100),
    tags: post.tags.join(','),
    post,
    recent: recentPosts,
    hots: hotPosts,
    replies: post.replies,
    hasCollect: !!hasCollect, // 转义boolean
    twitterMeta
  })
}

/**
 * 跳到创建文章页
 */
exports.showCreate = function * showCreate () {
  yield this.render('post/edit', {
    title: '发表文章'
  })
}

/**
 * 保存新文章
 */
exports.create = function * create () {
  let category = validator.trim(this.request.body.category)
  category = validator.escape(category)
  let title = validator.trim(this.request.body.title)
  title = validator.escape(title) // escape 将html 等特殊符号 标签转义
  const content = validator.trim(this.request.body.content)
  const tags = validator.trim(this.request.body.tags)

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
    this.status = 422
    return yield this.render('post/edit', {
      edit_error: error,
      title: '发表文章',
      content
    })
  }

  let tagsArr = tags ? tags.split(',') : []
  const postSaved = yield Post.newAndSave(title, '', content, this.session.user._id, tagsArr, category)
  const userFind = yield User.getUserById(this.session.user._id)
  userFind.score += 5
  userFind.post_count += 1
  userFind.save()
  this.session.user = userFind
  // 发送at消息
  at.sendMessageToMentionUsers(content, postSaved._id, this.session.user._id, null, this.session.user.login_name, postSaved.title)
  this.redirect('/p/' + postSaved._id)

  if (tagsArr.length > 0) {
    tagsArr = tagsArr.filter((tagName) => {
      return !!tagName
    })

    yield Promise.map(tagsArr, function (tagName) {
      return Tag
        .getTagByName(tagName)
        .then(function (tag) {
          if (!tag) {
            Tag
              .newAndSave(tagName, '')
              .then(function (newTag) {
                newTag.post_count += 1
                newTag.save()
              })
          } else {
            tag.post_count += 1
            tag.save()
          }
        })
    })
  }

  let status = []
  status.push('[' + tools.getCategoryName(postSaved.category) + ']')
  status.push(postSaved.title + ':\n')
  status.push(render.cleanMarkdown(postSaved.content))
  // 截取50个字
  status = filters.shorter(status.join(''), 70)
  status += 'https://' + config.host + '/p/' + postSaved._id + '?from=post_twitter'

  twitter.postStatus(status)
}

/**
 * 跳转到编辑文章页面
 */
exports.edit = function * edit () {
  const post_id = this.params._id

  const [post] = Post.getPostById(post_id)
  if (!post) {
    return yield this.render('notify/notify', {
      error: '这篇文章从地球上消失了'
    })
  }

  if (!((post.author_id + '') === (this.session.user._id + '') || (this.session.user.is_admin))) {
    return yield this.render('notify/notify', {
      error: '大胆！这篇文章岂是你能编辑的？'
    })
  }

  yield this.render('post/edit', {
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
 */
exports.update = function * update () {
  const post_id = this.params._id
  // escape 将html 等特殊符号 标签转义
  let category = validator.trim(this.request.body.category)
  category = validator.escape(category)
  let title = validator.trim(this.request.body.title)
  title = validator.escape(title)
  const content = validator.trim(this.request.body.content)
  const tags = validator.trim(this.request.body.tags)
    ? validator.trim(this.request.body.tags) : ''

  // 验证
  let editError
  if (title === '') {
    editError = '标题不能是空的。'
  } else if (title.length < 5 || title.length > 100) {
    editError = '标题字数太多或太少。'
  } else if (!category) {
    editError = '必须选择一个分类'
  }
  // END 验证

  if (editError) {
    this.status = 422
    return yield this.wrapRender('post/edit', {
      action: 'edit',
      edit_error: editError,
      post_id,
      content
    })
  }

  const [post] = Post.getPostById(post_id)

  if (!post) {
    return yield this.render('notify/notify', {
      error: '这篇文章从地球上消失了'
    })
  }

  // 只有管理员、非管理员但是是本帖发帖用户 二者可用修改本帖
  if (this.session.user.is_admin || ((post.author_id + '') === (this.session.user._id + ''))) {
    // 保存文章
    post.title = title
    post.content = content
    post.category = category
    post.tags = tags.split(',')
    post.update_at = new Date()
    post.save()
  } else {
    return yield this.render('notify/notify', {
      error: '这篇文章可不是谁都能编辑的'
    })
  }

  // 发送at消息
  at.sendMessageToMentionUsers(content, post._id, this.session.user._id, null, this.session.user.login_name, post.title)
  this.redirect('/p/' + post._id)
}

/**
 * 删除文章
 */
exports.remove = function * remove () {
  const post_id = this.params._id

  const postFind = Post.getPostById(post_id)

  if (!this.session.user.is_admin && (postFind.author_id + '') !== (this.session.user._id + '')) {
    this.status = 403
    this.body = {
      success: false,
      message: '这篇文章可不是谁都能删除的'
    }
    return
  }

  if (!postFind) {
    this.status = 422
    this.body = {
      success: false,
      message: '这篇文章从地球上消失了'
    }
    return
  }

  //    //使用软删除方式
  //    post.enable = false;
  //    post.save(function(err){
  //      if(err){
  //        return res.send({ success: false, message: err.message });
  //      }
  //      res.send({ success: true, message: '文章已被删除' });
  //    });
  // 数据库删除
  yield Post.remove({ _id: postFind._id })
  console.log('delete done')
  this.body = {
    success: true,
    message: '这篇文章已被送到火星上了'
  }
}

/**
 * 置顶(管理员等操作)
 */
exports.top = function * top () {
  const id = this.params._id

  yield Post.setTop(id)

  this.body = {
    success: true
  }
}

/**
 * 取消顶置
 */
exports.unTop = function * unTop () {
  const id = this.params._id

  yield Post.cancelTop(id)

  this.body = {
    success: true
  }
}

/**
 * 推荐文章(用户操作)
 */
exports.recommend = function * recommend () {

}

/**
 * 取消推荐
 */
exports.unRecommend = function * unRecommend () {

}

/**
 * 加精(管理员等做此操作)
 */
exports.good = function * good () {

}

/**
 * 锁定文章
 */
exports.lock = function * lock () {

}

/**
 * 上传文件
 */
exports.upload = function * upload () {
  req.busboy.on('file', function (fieldname, file, filename) {
    uploader
      .upload(file, {
        filename
      })
      .then(function (result) {
        res.json({
          success: true,
          url: result.url
        })
      })
      .catch(function (err) {
        return next(err)
      })
  })

  req.pipe(req.busboy)
}
