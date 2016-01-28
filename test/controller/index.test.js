/*！
 * index controller test
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */
var should = require('should');
var config = require('../../config');
var app = require('../../app');
var request = require('supertest')(app);

describe('test/controller/index.test.js', function() {

  it('should / 200', function(done) {
    request.get('/').end(function(err, res) {
      res.status.should.equal(200);
      res.text.should.containEql('热门文章');
      res.text.should.containEql('热门标签');
      done(err);
    });
  });

  it('should /?page=-1 200', function(done) {
    request.get('/?page=-1').end(function(err, res) {
      res.status.should.equal(200);
      res.text.should.containEql('热门文章');
      res.text.should.containEql('热门标签');
      done(err);
    })
  });

  it('should /sitemap.xml 200', function(done) {
    request.get('/sitemap.xml')
      .expect(200, function(err, res) {
        res.text.should.containEql('<urlset');
        done(err);
      });
  })

});