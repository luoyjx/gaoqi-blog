/*!
 * content cutter
 */

var validator = require('validator');

/**
 * 截短内容
 * @param {String} content 需要被截断的内容
 * @param {Number} length 需要截取的长度
 */
exports.shorter = function (content, length) {
  if (!content) return '';
  content = validator.trim(content) || '';
  var len = content.length;
  var cache = content.substring(0, len);
  var t = 0;
  for (var i = 0; i < length; i++) {
    if (cache.substr(i, 1).match("[\u4e00-\u9fa5]")) {
      t = t + 2;//汉字
    } else {
      t = t + 1;//英文
    }
    if (t > length) {
      break;
    }
  }
  var result = cache.substring(0, t);
  if (len > length) {
    result = result + "...";
  }
  return result;
};

/**
 * 清除html标签
 * @param {String} content 需要被清除的内容
 */
exports.clearHtml = function (content) {

};
