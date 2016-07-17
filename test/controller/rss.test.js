/**
 * rss.test.js
 * @authors luoyjx (yjk99@qq.com)
 * @date    2016-07-16 18:31:56
 */

var app = require('../../app');
var request = require('supertest')(app);
var should = require('should');

describe('test/controller/rss.test.js', function() {
	it('should /rss 200', function() {
		request
			.get('/rss')
			.expect(200)
			.end(function(err, res) {
				res.text.should.containEql('<channel>');
				done(err);
			})
	});
});