/**
 * auth middleware
 * @authors yanjixiong
 * @date    2017-03-01 09:21:56
 */

/**
 * 需要登录
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
exports.userRequired = function* userRequired(next) {
  if (!this.session.user) { 
    return this.redirect('/console/login');
  }

  yield next;
}

/**
 * api 需要登录请求
 * @yield {[type]}   [description]
 */
exports.userRequiredApi = function* userRequiredApi(next) {
  if (!this.session.user) { 
    this.status = 401;
    return this.body = {
      success: false,
      message: '请先登录后进行操作'
    }
  }

  yield next;
}