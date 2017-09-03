'use strict'

const Promise = require('bluebird')
const validator = require('validator')

const at = require('../common/at')
const message = require('../common/message')
const User = require('../services/user')
const Post = require('../services/post')
const Reply = require('../services/reply')

/**
 * 添加回复
 */
exports.add = function * add () {
  const content = this.request.body.r_content
  const post_id = this.params._id
  const reply_id = this.request.body.reply_id

  const str = validator.trim(content)
  if (str === '') {
    this.status = 422
    return yield this.render('notify/notify', { error: '回复内容不能为空！' })
  }

  let _post

  const postFind = yield Post.getPost(post_id)

  if (postFind.lock) {
    this.status = 403
    this.body = '此主题已锁定。'
    return
  }

  const userFind = yield User.getUserById(postFind.author_id)

  const [reply] = yield Promise.all([
    Reply
      .newAndSave(content, post_id, this.session.user._id, reply_id)
      .then(function (reply) {
        // 发送at消息，并防止重复 at 作者
        const newContent = content.replace('@' + userFind.login_name + ' ', '')
        at.sendMessageToMentionUsers(newContent, post_id, this.session.user._id, reply._id, userFind.login_name, _post.title)
        _post.reply_count += 1
        _post.update_at = new Date()
        _post.last_reply_at = new Date()
        _post.last_reply = this.session.user._id
        _post.save()
        return Promise.resolve(reply)
      })
      .then(function (reply) {
        if (_post.author_id.toString() !== this.session.user._id.toString()) {
          message.sendReplyMessage(_post.author_id, this.session.user._id, _post._id, reply._id)
        }
        return Promise.resolve(reply)
      }),
    User
      .getUserById(this.session.user._id)
      .then(function (user) {
        user.score += 5
        user.reply_count += 1
        user.save()
        this.session.user = user
      })
  ])

  this.redirect('/p/' + post_id + '#' + reply._id)
}
