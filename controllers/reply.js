/*!
 * reply controller
 */

const Bluebird = require('bluebird')
const validator = require('validator')

const at = require('../common/at')
const message = require('../common/message')
const { User, Post, Reply } = require('../services')

/**
 * 添加回复
 */
exports.add = async (req, res, next) => {
  const content = req.body.r_content
  const postId = req.params._id
  const replyId = req.body.reply_id

  const str = validator.trim(content)
  if (str === '') {
    res.status(422)
    return res.render('notify/notify', { error: '回复内容不能为空！' })
  }

  try {
    const _post = await Post.getPost(postId)

    if (_post.lock) {
      return res.status(403).wrapSend('此主题已锁定。')
    }

    const userFind = await User.getUserById(_post.author_id)
    const [reply] = await Bluebird.all([
      Reply.newAndSave(content, postId, req.session.user._id, replyId)
        .then(function (reply) {
          // 发送at消息，并防止重复 at 作者
          const newContent = content.replace('@' + userFind.login_name + ' ', '')
          at.sendMessageToMentionUsers(newContent, postId, req.session.user._id, reply._id, userFind.login_name, _post.title)
          _post.reply_count += 1
          _post.update_at = new Date()
          _post.last_reply_at = new Date()
          _post.last_reply = req.session.user._id
          _post.save()
          return Promise.resolve(reply)
        })
        .then(function (reply) {
          if (_post.author_id.toString() !== req.session.user._id.toString()) {
            message.sendReplyMessage(_post.author_id, req.session.user._id, _post._id, reply._id)
          }
          return Promise.resolve(reply)
        }),
      User.getUserById(req.session.user._id)
        .then(function (user) {
          user.score += 5
          user.reply_count += 1
          user.save()
          req.session.user = user
        })
    ])

    res.redirect('/p/' + postId + '#' + reply._id)
  } catch (err) {
    next(err)
  }
}
