/**
 * tokenizer test
 * @authors yanjixiong ()
 * @date    2016-12-03 20:53:29
 * @version $Id$
 */

var should = require('should')
var tokenizer = require('../../common/tokenizer')

describe('test/common/tokenizer.test.js', function () {
  describe('tokenize()', function () {
    it('should return a keywords array', function (done) {
      var result = tokenizer.tokenize('这是一个测试的分词程序')
      result.should.be.Array
      done()
    })
  })
})
