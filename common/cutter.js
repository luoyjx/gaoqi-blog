/*!
 * content cutter
 */

const validator = require('validator')

/**
 * 截短内容
 * @param {String} content 需要被截断的内容
 * @param {Number} length 需要截取的长度
 */
exports.shorter = (content, length) => {
  if (!content) return ''
  content = validator.trim(content) || ''
  const len = content.length
  const cache = content.substring(0, len)
  let t = 0
  for (let i = 0; i < length; i++) {
    if (cache.substr(i, 1).match('[\u4e00-\u9fa5]')) {
      if (t + 2 > length) break
      t = t + 2 // 汉字
    } else {
      if (t + 1 > length) break
      t = t + 1 // 英文
    }
  }
  let result = cache.substring(0, t)
  if (len > length) {
    result = result + '...'
  }
  return result
}

/**
 * 清除html标签
 * @param {String} content 需要被清除的内容
 */
exports.clearHtml = content => {
  return content
}
