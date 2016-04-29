/*！
 * preinstall tool
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */

var fs = require('fs');
var util = require('util');
var cp = require('cp');
var mkdirp = require('mkdirp');

var configFileName = 'config.js';
var configDefaultFileName = 'config.default.js';
var uploadDirPath = 'public/upload';

console.log(util.format('checking \x1b[36m %s \x1b[0m file.', configFileName));

if (!fs.existsSync(configFileName)) {
  cp.sync(configDefaultFileName, configFileName);
  console.log(util.format('creating file \x1b[36m %s \x1b[0m .', configFileName));
} else {
  console.log(util.format('file \x1b[36m %s \x1b[0m exists.', configFileName));
}

console.log(util.format('checking \x1b[36m %s \x1b[0m directory.', uploadDirPath));

if (!fs.existsSync(uploadDirPath)) {
  mkdirp.sync(uploadDirPath);
  console.log(util.format('creating directory \x1b[36m %s \x1b[0m .', uploadDirPath));
} else {
  console.log(util.format('directory \x1b[36m %s \x1b[0m exists.', uploadDirPath));
}

console.log('PreInstall Task Done.');