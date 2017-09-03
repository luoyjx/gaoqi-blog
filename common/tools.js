'use strict'

var Promise = require('bluebird')
var bcrypt = require('bcryptjs')
var moment = require('moment')
var config = require('config')
moment.locale('zh-cn') // 使用中文

// 格式化时间
exports.formatDate = function (date, friendly) {
  date = moment(date)

  if (friendly) {
    return date.fromNow()
  } else {
    return date.format('YYYY-MM-DD HH:mm')
  }
}

/**
 * 根据给定的格式来格式化
 * @param  {[type]} date      [description]
 * @param  {[type]} formatStr [description]
 * @return {[type]}           [description]
 */
exports.format = function format (date, formatStr) {
  date = moment(date)

  return date.format(formatStr)
}

// 超过1000转为k单位
exports.formatPV = function (pv) {
  if (!isNaN(pv)) {
    if (pv > 10000) {
      // 丢弃小数部分
      return parseInt(pv / 1000) + 'k'
    } else if (pv > 1000) {
      // 保留一位小数
      return new Number(pv / 1000).toFixed(1) + 'k'
    } else {
      return pv
    }
  }
  return 0
}

exports.validateId = function (str) {
  return (/^[a-zA-Z0-9\-_]+$/i).test(str)
}

exports.bhash = function (str) {
  return new Promise(function (resolve, reject) {
    bcrypt.hash(str, 10, function (err, hashed) {
      if (err) return reject(err)
      return resolve(hashed)
    })
  })
}

exports.bcompare = function (str, hash) {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(str, hash, function (err, result) {
      if (err) return reject(err)
      return resolve(result)
    })
  })
}

/**
 * 根据tab获取tab名称
 * @param  {[type]} category [description]
 * @return {[type]}          [description]
 */
exports.getCategoryName = function getCategoryName (category) {
  var categoryName = ''
  config.tabs.forEach(function (tab) {
    if (tab[0] === category) {
      categoryName = tab[1]
    }
  })
  return categoryName
}
