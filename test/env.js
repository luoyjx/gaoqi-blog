/* ！
 *
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */

const nock = require('nock')
const redis = require('../common/redis')

nock.enableNetConnect() // 允许真实的网络连接

redis.flushdb() // 清空redis内容
