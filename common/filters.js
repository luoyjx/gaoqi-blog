'use strict';
/**
 * nunjucks 模板引擎 自定义filters
 * @authors yanjixiong
 * @date    2017-02-21 15:08:46
 */

const validator = require('validator');
const moment = require('moment');
moment.locale('zh-cn'); // 使用中文

/**
 * 格式化时间
 * @param  {[type]} date [description]
 * @return {[type]}      [description]
 */
exports.datetime = function datetime(date, friendly) {
  if (friendly) {
    return moment(date).fromNow();
  }
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 格式化日期
 * @param  {[type]} date [description]
 * @return {[type]}      [description]
 */
exports.date = function date(date) {
  return moment(date).format('YYYY-MM-DD');
};

/**
 * 截短内容
 * @param {String} content 需要被截断的内容
 * @param {Number} length 需要截取的长度
 */
exports.shorter = function (content, length) {
  if (!content) {
    return '';
  }
  content = validator.trim(content) || '';
  const len = content.length;
  const cache = content.substring(0, len);
  let t = 0;
  for (let i = 0; i < length; i++) {
    if (cache.substr(i, 1).match('[\u4e00-\u9fa5]')) {
      if (t + 2 > length) {
        break;
      }
      t = t + 2; // 汉字
    } else {
      if (t + 1 > length) {
        break;
      }
      t = t + 1; // 英文
    }
  }
  let result = cache.substring(0, t);
  if (len > length) {
    result = result + '...';
  }
  return result;
};

/**
 * 清除html标签
 * @param {String} content 需要被清除的内容
 */
exports.clearHtml = function (content) {
  return content;
};

/**
 * 清除markdown标记
 * @param markdownStr
 */
exports.cleanMarkdown = function cleanMarkdown(markdownStr) {
  return markdownStr
    .replace(/^([\s\t]*)([\*\-\+]|\d\.)\s+/gm, '$1')
    // Remove HTML tags
    .replace(/<(.*?)>/g, '$1')
    // Remove setext-style headers
    .replace(/^[=\-]{2,}\s*$/g, '')
    // Remove footnotes?
    .replace(/\[\^.+?\](\: .*?$)?/g, '')
    .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
    // Remove images
    .replace(/\!\[.*?\][\[\(].*?[\]\)]/g, '[图片]')
    // Remove inline links
    .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
    // Remove reference-style links?
    .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
    // Remove atx-style headers
    .replace(/^\#{1,6}\s*([^#]*)\s*(\#{1,6})?/gm, '$1')
    .replace(/([\*_]{1,2})(\S.*?\S)\1/g, '$2')
    .replace(/(`{3,})(.*?)\1/gm, '$2')
    .replace(/^-{3,}\s*$/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\n{2,}/g, '\n\n');
};
