var fs = require("fs"),
	MAX_BUFFER = 1024,
	util = require("util");

exports = module.exports = function(src, dest) {

	fs.access(src, fs.F_OK, function(err) {

		if (err) {
			console.log(err);
			console.log(util.format('file \x1b[36m %s \x1b[0m not exists.', src));
		} else {

			fs.readFile(src, function(err, data) {

				if (err) {
					console.log(err);
				} else {
					fs.writeFile(dest, data, function(err) {
						if (err) {
							console.log(err);
						} else{
							console.log(util.format("creating file \x1b[36m %s \x1b[0m .", dest));
						}

					});
				}
			});
		}
	});
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