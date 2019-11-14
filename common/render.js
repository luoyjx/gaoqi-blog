/*!
 * common render
 * markdown语法渲染帮助类
 */

'use strict'

const MarkdownIt = require('markdown-it')
const _ = require('lodash')
const config = require('../config')
const validator = require('validator')
const multiline = require('multiline')
const jsxss = require('xss')

// markdown 默认设置
const md = new MarkdownIt()
md.set({
  html: true, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: false, // Convert '\n' in paragraphs into <br>
  linkify: true, // Autoconvert URL-like text to links
  typographer: true // Enable smartypants and other sweet transforms
})

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]

  let language = (token.params && 'language-' + token.params) || ''
  language = validator.escape(language)

  return (
    '<pre class="prettyprint ' +
    language +
    '">' +
    '<code>' +
    validator.escape(token.content) +
    '</code>' +
    '</pre>'
  )
}

md.renderer.rules.code_block = (tokens, idx /*, options */) => {
  const token = tokens[idx]
  let language = (token.params && 'language-' + token.params) || ''
  language = validator.escape(language)
  return (
    '<pre class="prettyprint ' +
    language +
    '">' +
    '<code>' +
    validator.escape(token.content) +
    '</code>' +
    '</pre>'
  )
}

md.renderer.rules.code_inline = (tokens, idx /*, options */) => {
  return '<code>' + validator.escape(tokens[idx].content) + '</code>'
}

const myxss = new jsxss.FilterXSS({
  onIgnoreTagAttr: (tag, name, value, isWhiteAttr) => {
    // 让 prettyprint 可以工作
    if (tag === 'pre' && name === 'class') {
      return name + '="' + jsxss.escapeAttrValue(value) + '"'
    }
  }
})

exports.markdown = text => {
  return (
    '<div class="markdown-text">' +
    myxss.process(md.render(text || '')) +
    '</div>'
  )
}

/**
 * 静态文件地址
 * @param filePath
 * @returns {*}
 */
exports.staticFile = filePath => {
  if (filePath.indexOf('http') === 0 || filePath.indexOf('//') === 0) {
    return filePath
  }
  return config.site_static_host + filePath
}

exports.multiline = multiline

/**
 * escape用户签名
 */
exports.escapeSignature = signature => {
  return signature
    .split('\n')
    .map(item => {
      return _.escape(item)
    })
    .join('<br>')
}

/**
 * 清除markdown标记
 * @param markdownStr
 */
exports.cleanMarkdown = markdownStr => {
  return (
    markdownStr
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
  )
}
