/**
 * meta
 * @authors yanjixiong
 * @date    2017-04-28 20:53:52
 */

'use strict'

const config = require('../config')
const render = require('./render')
const cutter = require('./cutter')

/**
 * 生成twitter的head meta信息
 * @param  {[type]} category 分类
 * @param  {[type]} author   作者
 * @param  {[type]} post     文章
 * @return {[type]}          [description]
 */
exports.getTwitterMeta = function getTwitterMeta (category, author, post) {
  let categoryName = ''

  config.tabs.forEach(function (tab) {
    if (tab[0] === category) {
      categoryName = tab[1]
    }
  })

  const meta = [
    '<meta name="twitter:card" content="summary" />',
    '<meta name="twitter:description" content="' + categoryName + ' - @' +
    author.login_name + ' - ' +
    cutter.shorter(render.cleanMarkdown(post.content), 70) + '" />',
    '<meta name="twitter:title" content=" ' + post.title + ' - ' + config.name + '" />',
    '<meta name="twitter:image" content="' + author.avatar + '" />',
    '<meta name="twitter:site" content="@gaoqi-blog" />',
    '<meta name="twitter:creator" content="@gaoqi-blog" />'
  ]

  return meta.join('\n')
}
