'use strict'

/**
 * 搜索文章
 */
exports.index = function * index () {
  let q = this.query.q
  q = encodeURIComponent(q)
  this.redirect('https://www.baidu.com/s?wd=site:blog.gaoqixhb.com+' + q)
}
