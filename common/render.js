/*!
 * common render
 * markdown语法渲染帮助类
 */

'use strict'

var MarkdownIt = require('markdown-it')
var _ = require('lodash')
var config = require('../config')
var validator = require('validator')
var multiline = require('multiline')
var jsxss = require('xss')

// markdown 默认设置
var md = new MarkdownIt()
md.set({
  html: true, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: false, // Convert '\n' in paragraphs into <br>
  linkify: true, // Autoconvert URL-like text to links
  typographer: true // Enable smartypants and other sweet transforms
})

md.renderer.rules.fence = function (tokens, idx) {
  var token = tokens[idx]

  var language = (token.params && ('language-' + token.params)) || ''
  language = validator.escape(language)

  return '<pre class="prettyprint ' + language + '">' +
    '<code>' + validator.escape(token.content) + '</code>' +
    '</pre>'
}

md.renderer.rules.code_block = function (tokens, idx /*, options */) {
  var token = tokens[idx]
  var language = (token.params && ('language-' + token.params)) || ''
  language = validator.escape(language)
  return '<pre class="prettyprint ' + language + '">' +
    '<code>' + validator.escape(token.content) + '</code>' +
    '</pre>'
}

md.renderer.rules.code_inline = function (tokens, idx /*, options */) {
  return '<code>' + validator.escape(tokens[idx].content) + '</code>'
}

var myxss = new jsxss.FilterXSS({
  onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
    // 让 prettyprint 可以工作
    if (tag === 'pre' && name === 'class') {
      return name + '="' + jsxss.escapeAttrValue(value) + '"'
    }
  }
})

exports.markdown = function (text) {
  return '<div class="markdown-text">' + myxss.process(md.render(text || '')) + '</div>'
}

/**
 * 静态文件地址
 * @param filePath
 * @returns {*}
 */
exports.staticFile = function (filePath) {
  if (filePath.indexOf('http') === 0 || filePath.indexOf('//') === 0) {
    return filePath
  }
  return config.site_static_host + filePath
}

exports.multiline = multiline

/**
 * escape用户签名
 */
exports.escapeSignature = function (signature) {
  return signature.split('\n').map(function (item) {
    return _.escape(item)
  }).join('<br>')
}

/**
 * 清除markdown标记
 * @param markdownStr
 */
exports.cleanMarkdown = function (markdownStr) {
  return markdownStr
    .replace(/^([\s\t]*)([*\-+]|\d\.)\s+/gm, '$1')
    // Remove HTML tags
    .replace(/<(.*?)>/g, '$1')
    // Remove setext-style headers
    .replace(/^[=-]{2,}\s*$/g, '')
    // Remove footnotes?
    .replace(/\[\^.+?\](: .*?$)?/g, '')
    .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
    // Remove images
    .replace(/!\[.*?\][[(].*?[\])]/g, '[图片]')
    // Remove inline links
    .replace(/\[(.*?)\][[(].*?[\])]/g, '$1')
    // Remove reference-style links?
    .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
    // Remove atx-style headers
    .replace(/^#{1,6}\s*([^#]*)\s*(#{1,6})?/gm, '$1')
    .replace(/([*_]{1,2})(\S.*?\S)\1/g, '$2')
    .replace(/(`{3,})(.*?)\1/gm, '$2')
    .replace(/^-{3,}\s*$/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\n{2,}/g, '\n\n')
}
