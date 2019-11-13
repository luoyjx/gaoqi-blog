/**
 * tokenizer test
 * @authors yanjixiong ()
 * @date    2016-12-03 20:53:29
 * @version $Id$
 */

const should = require('should')
const tokenizer = require('../../common/tokenizer')

describe('test/common/tokenizer.test.js', function() {
  describe('tokenize()', function() {
    it('should return a keywords array', function(done) {
      const result = tokenizer.tokenize('这是一个测试的分词程序')
      result.should.be.Array
      done()
    })
  })
})
