/*!
 * 上传文件工具类
 */

'use strict'

const Promise = require('bluebird')
const config = require('../config')
const utility = require('utility')
const path = require('path')
const fs = require('fs')
const qn = require('qn')

/**
 * 上传文件到七牛的客户端对象
 *
 */
let qnClient = null
if (config.qn_access && config.qn_access.secretKey !== 'your secret key') {
  qnClient = qn.create(config.qn_access)
}

exports.upload_qiniu = (file, options) => {
  return new Promise((resolve, reject) => {
    qnClient.upload(file, options, (err, result) => {
      if (err) return reject(err)
      return resolve(result)
    })
  })
}

/**
 * 上传文件到本地的function
 * @param file
 * @param options
 */
exports.upload_local = (file, options) => {
  return new Promise((resolve, reject) => {
    const filename = options.filename

    const newFilename =
      utility.md5(filename + String(new Date().getTime())) +
      path.extname(filename)

    const uploadPath = config.upload.path
    const baseUrl = config.upload.url
    const filePath = path.join(uploadPath, newFilename)
    const fileUrl = baseUrl + newFilename

    file.on('end', () => {
      return resolve({
        url: fileUrl
      })
    })

    file.pipe(fs.createWriteStream(filePath))
  })
}

// 如果没有配置七牛则存储在本地
module.exports = qnClient
  ? { upload: exports.upload_qiniu }
  : { upload: exports.upload_local }
