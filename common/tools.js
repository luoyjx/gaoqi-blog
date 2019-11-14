'use strict'

const Promise = require('bluebird')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const config = require('../config')
moment.locale('zh-cn') // 使用中文

// 格式化时间
exports.formatDate = (date, friendly) => {
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
exports.format = (date, formatStr) => {
  date = moment(date)

  return date.format(formatStr)
}

// 超过1000转为k单位
exports.formatPV = pv => {
  if (!isNaN(pv)) {
    if (pv > 10000) {
      // 丢弃小数部分
      return parseInt(pv / 1000) + 'k'
    } else if (pv > 1000) {
      // 保留一位小数
      return Number(pv / 1000).toFixed(1) + 'k'
    } else {
      return pv
    }
  }
  return 0
}

exports.validateId = str => {
  return /^[a-zA-Z0-9\-_]+$/i.test(str)
}

exports.bhash = str => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(str, 10, (err, hashed) => {
      if (err) return reject(err)
      return resolve(hashed)
    })
  })
}

exports.bcompare = (str, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(str, hash, (err, result) => {
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
exports.getCategoryName = category => {
  let categoryName = ''
  config.tabs.forEach(tab => {
    if (tab[0] === category) {
      categoryName = tab[1]
    }
  })
  return categoryName
}
