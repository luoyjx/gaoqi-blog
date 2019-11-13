/**
 * tools test
 * @authors yanjixiong
 * @date    2016-10-11 13:36:22
 */

const should = require('should')
const tools = require('../../common/tools')

let strHashed = ''

describe('test/common/tools.test.js', function() {
  describe('formatDate()', function() {
    it('should return friendly', function(done) {
      const date = new Date()
      setTimeout(function() {
        const friendlyDate = tools.formatDate(date, true)
        friendlyDate.should.containEql('前')
        done()
      }, 1000)
    })

    it('should return friendly', function(done) {
      const date = new Date()
      setTimeout(function() {
        const friendlyDate = tools.formatDate(date)
        friendlyDate.should.containEql('-')
        friendlyDate.should.containEql(':')
        done()
      }, 1000)
    })
  })

  describe('formatPV()', function() {
    it('should return 0 with NaN', function(done) {
      const result = tools.formatPV('aaaa')
      result.should.equal(0)
      done()
    })

    it('should return contains `k` with 20000', function(done) {
      const result = tools.formatPV(20000)
      result.should.containEql('k')
      result.should.not.containEql('.')
      done()
    })

    it('should return contains `k` and `.` with 2000', function(done) {
      const result = tools.formatPV(2000)
      result.should.containEql('k')
      result.should.containEql('.')
      done()
    })

    it('should return origin value with 200', function(done) {
      const result = tools.formatPV(200)
      result.should.equal(200)
      done()
    })
  })

  describe('validateId()', function() {
    it('should return true with valid id', function(done) {
      const result = tools.validateId('abc123')
      result.should.be.ok
      done()
    })

    it('should return false with invalid id', function(done) {
      const result = tools.validateId('@#$%^&*(')
      result.should.not.be.ok
      done()
    })
  })

  describe('bhash()', function() {
    it('should bhash be ok', function(done) {
      tools.bhash('实业误国，炒房兴邦').then(function(hashed) {
        strHashed = hashed
        done()
      })
    })
  })

  describe('bcompare()', function() {
    it('should bcompare be ok', function(done) {
      tools.bcompare('实业误国，炒房兴邦', strHashed).then(function() {
        done()
      })
    })
  })
})
