/* ！
 * app test
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */
const request = require('supertest')
const should = require('should')
const app = require('../app')
const config = require('../config')

describe('test/app.test.js', function() {
  it('should / status 200', function(done) {
    request(app)
      .get('/')
      .end(function(err, res) {
        res.status.should.equal(200)
        res.text.should.containEql(config.description)
        done()
      })
  })
})
