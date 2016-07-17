/*！
 * preinstall tool
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */

var fs = require("fs");
var util = require("util");
var cp = require("../util/cp");

var configFileName = "config.js";
var configDefaultFileName = "config.default.js";
var uploadDirPath = "public/upload";

console.log(util.format("checking \x1b[36m %s \x1b[0m file.", configFileName));

//配置文件configFileName不存在的情况下，根据配置文件模板configDefaultFileName复制一份新的
fs.access(configFileName, fs.F_OK, function(err) {

	if (err) {

		cp(configDefaultFileName, configFileName, function(err) {
			if (err) {
				console.log(err);
			} else {
				console.log(util.format("successfully creat file \x1b[36m %s \x1b[0m .", configFileName));
			}
		});
	} else {
		console.log(util.format("file \x1b[36m %s \x1b[0m exists.", configFileName));
	}
});

console.log(util.format("checking \x1b[36m %s \x1b[0m directory.", uploadDirPath));
fs.access(uploadDirPath, fs.F_OK, function(err) {
	if (err) {
		fs.mkdir(uploadDirPath, function(err) {
			if (err) {
				console.log(util.format("fail to creat directory \x1b[36m %s \x1b[0m .", uploadDirPath));
			} else {
				console.log(util.format("successfully creat directory \x1b[36m %s \x1b[0m .", uploadDirPath));
			}
		});
	} else {
		console.log(util.format("directory \x1b[36m %s \x1b[0m exists.", uploadDirPath));
	}
});
