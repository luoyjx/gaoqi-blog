/*!
 * 上传文件工具类
 */

'use strict'

var Promise = require('bluebird')
var config = require('config')
var utility = require('utility')
var path = require('path')
var fs = require('fs')
var qn = require('qn')

/**
 * 上传文件到七牛的客户端对象
 *
 */
var qnClient = null
if (config.qn_access && config.qn_access.secretKey !== 'your secret key') {
  qnClient = qn.create(config.qn_access)
}

exports.upload_qiniu = function (file, options) {
  return new Promise(function (resolve, reject) {
    qnClient.upload(file, options, function (err, result) {
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
exports.upload_local = function (file, options) {
  return new Promise(function (resolve, reject) {
    var filename = options.filename

    var newFilename = utility.md5(filename + String((new Date()).getTime())) +
      path.extname(filename)

    var upload_path = config.upload.path
    var base_url = config.upload.url
    var filePath = path.join(upload_path, newFilename)
    var fileUrl = base_url + newFilename

    file.on('end', function () {
      return resolve({
        url: fileUrl
      })
    })

    file.pipe(fs.createWriteStream(filePath))
  })
}

// 如果没有配置七牛则存储在本地
module.exports = qnClient
  ? {upload: exports.upload_qiniu}
  : {upload: exports.upload_local}
