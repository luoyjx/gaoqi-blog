/**
 * statsd middlewares
 * @authors yanjixiong ()
 * @date    2016-12-08 14:49:35
 * @version $Id$
 */

var _ = require('lodash')
var Lynx = require('lynx')

/**
 * 响应时间
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
exports.responseTime = function responseTime (options) {
  options = _.assign({
    requestKey: 'express',
    host: '127.0.0.1',
    port: 8125
  }, options)

  var client = options.client || new Lynx(options.host, options.port, options)

  return function (req, res, next) {
    var startTime = new Date().getTime()

    function sendStats () {
      var key = options.requestKey
      key = key || ''

      // 响应时间
      var duration = new Date().getTime() - startTime
      client.timing([key, 'response'].join('.'), duration)

      cleanup()
    }

    // 清楚添加的listeners
    function cleanup () {
      res.removeListener('finish', sendStats)
      res.removeListener('error', cleanup)
      res.removeListener('close', cleanup)
    }

    // 添加listeners
    res.once('finish', sendStats)
    res.once('error', cleanup)
    res.once('close', cleanup)

    if (next) {
      next()
    }
  }
}
