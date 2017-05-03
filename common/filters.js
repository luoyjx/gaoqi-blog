/**
 * nunjucks 模板引擎 自定义filters
 * @authors yanjixiong
 * @date    2017-02-21 15:08:46
 */

var moment = require('moment');
moment.locale('zh-cn'); // 使用中文

/**
 * 格式化时间
 * @param  {[type]} date [description]
 * @return {[type]}      [description]
 */
exports.datetime = function datetime(date, friendly) {
  if (friendly) {
    return moment(date).fromNow();
  } else {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }
}

/**
 * 格式化日期
 * @param  {[type]} date [description]
 * @return {[type]}      [description]
 */
exports.date = function date(date) {
  return moment(date).format('YYYY-MM-DD');
}