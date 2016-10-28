/**
 * cutter test
 * @authors yanjixiong
 * @date    2016-10-11 10:30:06
 */

var should = require('should');
var cutter = require('../../common/cutter');

describe('test/common/cutter.test.js', function() {
  describe('shorter()', function() {
    it('should return 10 chars with 20chars to 10chars', function(done) {
      var result = cutter.shorter('abcdeabcdeabcdeabcde', 10);
      result.length.should.equal(13);
      done();
    })

    it('should return 10 chinese words with 20 chinese words to 10 chinese words', function(done) {
      var result = cutter.shorter('啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊', 10);
      result.length.should.equal(13);
      done();
    })

    it('should return "" with "" ', function(done) {
      var result = cutter.shorter('', 10);
      result.length.should.equal(0);
      done();
    })
  })
});