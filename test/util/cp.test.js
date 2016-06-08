var cp = require("../../util/cp");

console.time("async cp config.js");
cp("config.default.js","config.test.js",function(err){
	if(err){
		console.log(err);
	}else{
		console.log("successfully created");
	}
});
console.timeEnd("async cp config.js");
/*
console.time("sync cp config.js");
cp.sync("config.default.js","config.js");
console.timeEnd("sync cp config.js");*/
