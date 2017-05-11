'use strict';
/**
 * log4js
 * @authors yanjixiong
 * @date    2017-03-01 13:39:39
 */

const log4js = require('log4js');
const config = require('../config');

log4js.configure(config.log);

module.exports = log4js.getLogger('all');
