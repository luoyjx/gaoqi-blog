/*！
 * index controller test
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */
var should = require('should');
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

  it('should /?tab=program 200', function(done) {
    request.get('/?tab=program').end(function(err, res) {
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

  it('should /tools 200', function(done) {
    request
      .get('/tools')
      .expect(200, function(err, res) {
        res.text.should.containEql('常用工具');
        done(err);
      })
  })

  it('should /frontEndNavigation 200', function(done) {
    request
      .get('/frontEndNavigation')
      .expect(200, function(err, res) {
        res.text.should.containEql('前端导航');
        done(err);
      })
  })

  it('should /api 200', function(done) {
    request
      .get('/api')
      .expect(200, function(err, res) {
        res.text.should.containEql('api接口说明');
        done(err);
      });
  })

});