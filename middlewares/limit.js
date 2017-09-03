'use strict'

const config = require('../config')

// 发帖时间间隔，为毫秒
let POST_INTERVAL = config.post_interval
if (!(POST_INTERVAL > 0)) {
  POST_INTERVAL = 0
}
const DISABLE_POST_INTERVAL = POST_INTERVAL <= 0

/**
 * 发帖/评论时间间隔限制
 */
exports.postInterval = function * postInterval (next) {
  if (DISABLE_POST_INTERVAL) {
    return yield next
  }
  if (isNaN(this.session.lastPostTimestamp)) {
    this.session.lastPostTimestamp = Date.now()
    return next()
  }
  if (Date.now() - this.session.lastPostTimestamp < POST_INTERVAL) {
    const ERROR_MSG = '您的回复速度太快。'
    return yield this.render('notify/notify', { error: ERROR_MSG })
  }

  this.session.lastPostTimestamp = Date.now()

  yield next
}
