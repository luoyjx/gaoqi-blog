/**
 * tokenizer 分词器
 * @authors yanjixiong ()
 * @date    2016-12-03 18:45:16
 * @version $Id$
 */

var nodejieba = require('nodejieba');

/**
 * 分词抽取关键字
 * @param  {[type]} content  需要抽取关键词的内容
 * @param  {[type]} topCount 按权重排序的关键词个数
 * @return {[type]}          [description]
 */
exports.tokenize = function tokenize(content, topCount) {
  return nodejieba.extract(content, topCount || 10);
}

