/**
 * rss.test.js
 * @authors luoyjx (yjk99@qq.com)
 * @date    2016-07-16 18:31:56
 */

const app = require('../../app')
const request = require('supertest')(app)
const should = require('should')

describe('test/controller/rss.test.js', function() {
  it('should /rss 200', function(done) {
    request
      .get('/rss')
      .expect(200)
      .end(function(err, res) {
        res.text.should.containEql('<channel>')
        done(err)
      })
  })
})
