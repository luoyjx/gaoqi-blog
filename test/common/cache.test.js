/**
 * cache test
 * @authors yanjixiong
 * @date    2016-10-11 10:56:59
 */

var cache = require('../../common/cache')

describe('test/common/cache.test.js', function () {
  describe('set()', function () {
    it('should set cache without expire be ok', function (done) {
      cache.set('for', 'bar').then(function () {
        done()
      })
    })
  })
})
