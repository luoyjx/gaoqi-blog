var fs = require("fs"),
	MAX_BUFFER = 1024,
	util = require("util");

exports = module.exports = function(src, dest,callBack) {

	var readStream = fs.createReadStream(src),
		writeStream = fs.createWriteStream(dest);

	readStream.on("error",done);
	writeStream.on("error",done);
	writeStream.on("close",done);
	readStream.pipe(writeStream);

	function done(err){
		if(err){
			clear();
		}
		if(typeof callBack === "function")
			callBack(err);
	}

	/*
		当readStream或者writeStream有错误发生时，清理已经生成的目标文件
	*/
	function clear(){

		fs.unlink(writeStream.path,function(){
			console.log("delete the created "+ writeStream.path );
		});
	}
};

/**
    复制src到dest
*/
exports.sync = function(src, dest) {

	try {
		fs.accessSync(src);
	} catch (e) {
		throw new Error(util.format('file \x1b[36m %s \x1b[0m not exists.', src));
	}

	var buffer = new Buffer(MAX_BUFFER);
	var bytesRead = MAX_BUFFER;
	var pos = 0;
	var read = fs.openSync(src, 'r');
	var write = fs.openSync(dest, 'w');

	while (MAX_BUFFER == bytesRead) {
		bytesRead = fs.readSync(read, buffer, 0, MAX_BUFFER, pos);
		fs.writeSync(write, buffer, 0, bytesRead);
		pos += bytesRead;
	}

	fs.closeSync(read);
	fs.closeSync(write);
};