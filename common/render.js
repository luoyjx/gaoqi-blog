/**
 * common render
 * markdown语法渲染帮助类
 */

'use strict';

const MarkdownIt = require('markdown-it');
const _ = require('lodash');
const config = require('../config');
const validator = require('validator');
const multiline = require('multiline');
const jsxss = require('xss');

// markdown 默认设置
const md = new MarkdownIt();
md.set({
  html: true,        // Enable HTML tags in source
  xhtmlOut: false,        // Use '/' to close single tags (<br />)
  breaks: false,        // Convert '\n' in paragraphs into <br>
  linkify: true,        // Autoconvert URL-like text to links
  typographer: true        // Enable smartypants and other sweet transforms
});

md.renderer.rules.fence = function (tokens, idx) {
  const token = tokens[idx];

  let language = token.params && ('language-' + token.params) || '';
  language = validator.escape(language);

  return '<pre class="prettyprint ' + language + '">'
    + '<code>' + validator.escape(token.content) + '</code>'
    + '</pre>';
};

md.renderer.rules.code_block = function (tokens, idx /* , options*/) {
  const token = tokens[idx];
  let language = token.params && ('language-' + token.params) || '';
  language = validator.escape(language);
  return '<pre class="prettyprint ' + language + '">'
    + '<code>' + validator.escape(token.content) + '</code>'
    + '</pre>';
};

md.renderer.rules.code_inline = function (tokens, idx /* , options*/) {
  return '<code>' + validator.escape(tokens[idx].content) + '</code>';
};

const myxss = new jsxss.FilterXSS({
  onIgnoreTagAttr(tag, name, value) {
    // 让 prettyprint 可以工作
    if (tag === 'pre' && name === 'class') {
      return name + '="' + jsxss.escapeAttrValue(value) + '"';
    }
  }
});

exports.markdown = function (text) {
  return '<div class="markdown-text">' + myxss.process(md.render(text || '')) + '</div>';
};

/**
 * 静态文件地址
 * @param filePath
 * @returns {*}
 */
exports.staticFile = function (filePath) {
  if (filePath.indexOf('http') === 0 || filePath.indexOf('//') === 0) {
    return filePath;
  }
  return config.site_static_host + filePath;
};

exports.multiline = multiline;

/**
 * escape用户签名
 */
exports.escapeSignature = function escapeSignature(signature) {
  return signature.split('\n').map((item) => {
    return _.escape(item);
  }).join('<br>');
};
