/* ！
 * app test
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */
var request = require('supertest')
var should = require('should')
var app = require('../app')
var config = require('../config')

describe('test/app.test.js', function () {
  it('should / status 200', function (done) {
    request(app).get('/').end(function (err, res) {
      res.status.should.equal(200)
      res.text.should.containEql(config.description)
      done()
    })
  })
})
