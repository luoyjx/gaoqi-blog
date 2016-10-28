/**
 * at test
 * @authors yanjixiong
 * @date    2016-10-11 11:02:10
 */

var should = require('should');
var at = require('../../common/at');

describe('test/common/at.test.js', function() {
  describe('fetchUsers()', function() {
    it('should return a names array', function(done) {
      var names = at.fetchUsers('@foo @bar')
      names.should.be.Array;
      done();
    })
  })

  describe('linkUsers()', function() {
    it('should return text contains `/u/` path ', function(done) {
      var result = at.linkUsers('@foo @bar');
      result.should.containEql('/u/');
      done();
    })
  })
})