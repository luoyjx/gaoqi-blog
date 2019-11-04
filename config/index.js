/**
 * config index
 * @authors yanjixiong
 * @date    2016-10-25 09:23:33
 */

var env = process.env.NODE_ENV === 'production' ? 'production' : 'development'

console.log('load %s config', env)

module.exports = require('./env/' + env)
