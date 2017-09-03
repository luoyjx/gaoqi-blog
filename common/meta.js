/**
 * meta tool
 *
 * 网页meta标签
 *
 * @authors yanjixiong
 * @date    2017-02-05 15:01:39
 */

var config = require('../config')
var render = require('./render')
var filters = require('./filters')

/**
 * 生成twitter的head meta信息
 * @param  {[type]} category 分类
 * @param  {[type]} author   作者
 * @param  {[type]} post     文章
 * @return {[type]}          [description]
 */
exports.getTwitterMeta = function getTwitterMeta (category, author, post) {
  var categoryName = ''

  config.tabs.forEach(function (tab) {
    if (tab[0] === category) {
      categoryName = tab[1]
    }
  })

  var meta = [
    '<meta name="twitter:card" content="summary" />',
    '<meta name="twitter:description" content="' + categoryName + ' - @' + author.login_name + ' - ' + filters.shorter(render.cleanMarkdown(post.content), 70) + '" />',
    '<meta name="twitter:title" content=" ' + post.title + ' - ' + config.name + '" />',
    '<meta name="twitter:image" content="' + author.avatar + '" />',
    '<meta name="twitter:site" content="@gaoqi-blog" />',
    '<meta name="twitter:creator" content="@gaoqi-blog" />'
  ]

  return meta.join('\n')
}
