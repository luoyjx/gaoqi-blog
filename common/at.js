/* ！
 * at common
 */
var Promise = require('bluebird')
var User = require('../dao').User
var Message = require('./message')
var _ = require('lodash')
var online = require('../middleware/online')
var mail = require('./mail')

/**
 * 从文本中提取出@username 标记的用户名数组
 * @param {String} text 文本内容
 * @return {Array} 用户名数组
 */
var fetchUsers = function (text) {
  var ignoreRegexs = [
    /```.+?```/g, // 去除单行的 ```
    /^```[\s\S]+?^```/gm, // ``` 里面的是 pre 标签内容
    /`[\s\S]+?`/g, // 同一行中，`some code` 中内容也不该被解析
    /^ {4}.*/gm, // 4个空格也是 pre 标签，在这里 . 不会匹配换行
    /\b\S*?@[^\s]*?\..+?\b/g, // somebody@gmail.com 会被去除
    /\[@.+?\]\(\/.+?\)/g // 已经被 link 的 username
  ]

  ignoreRegexs.forEach(function (ignoreRegex) {
    text = text.replace(ignoreRegex, '')
  })

  var results = text.match(/@[a-z0-9\-_]+\b/igm)
  var names = []
  if (results) {
    for (var i = 0, l = results.length; i < l; i++) {
      var s = results[i]
      // remove leading char @
      s = s.slice(1)
      names.push(s)
    }
  }
  names = _.uniq(names)
  return names
}
exports.fetchUsers = fetchUsers

/**
 * 根据文本内容中读取用户，并发送消息给提到的用户
 * Callback:
 * - err, 数据库异常
 * @param {String} text 文本内容
 * @param {String} postId 主题ID
 * @param {String} authorId 作者ID
 * @param {String} reply_id 回复ID
 * @param {String} author 作者用户
 * @param {String} post_title 文章标题
 */
exports.sendMessageToMentionUsers = function (text, postId, authorId, replyId, author, postTitle) {
  return User
    .getUsersByNames(fetchUsers(text))
    .then(function (users) {
      users = users.filter(function (user) {
        return !user._id.equals(authorId)
      })
      return Promise
        .map(users, function (user) {
          Message.sendAtMessage(user._id, authorId, postId, replyId)
          online
            .isOnline(user._id)
            .then(function (flag) {
              if (!flag) {
                mail.sendNotificationMail(user.email, user.login_name, author, postTitle, postId, replyId)
              }
            })
        })
    })
}

/**
 * 根据文本内容，替换为数据库中的数据
 * Callback:
 * - err, 数据库异常
 * - text, 替换后的文本内容
 * @param {String} text 文本内容
 */
exports.linkUsers = function (text) {
  var users = fetchUsers(text)
  for (var i = 0, l = users.length; i < l; i++) {
    var name = users[i]
    text = text.replace(new RegExp('@' + name + '\\b(?!\\])', 'g'), '[@' + name + '](/u/' + name + ')')
  }
  return text
}
