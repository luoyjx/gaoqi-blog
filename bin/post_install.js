/* ！
 * preinstall tool
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */

const path = require('path')
const mkdirp = require('mkdirp')
const colors = require('colors')

var uploadDirPath = path.resolve(__dirname, '../public/upload')

console.log(`creating "${colors.green(uploadDirPath)}" if not exists`)
mkdirp.sync(uploadDirPath)
