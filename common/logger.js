/**
 * log4js
 * @authors yanjixiong
 * @date    2017-03-01 13:39:39
 */

var log4js = require('log4js');
var config = require('../config');

log4js.configure(config.log);

module.exports = log4js.getLogger('all');