/**
 * mail test
 * @authors yanjixiong
 * @date    2016-10-11 11:44:12
 */

var mail = require('../../common/mail');

describe('test/common/mail.js', function() {
  describe('sendActiveMail()', function() {
    it('should sendActiveMail be ok ', function(done) {
      mail.sendActiveMail('foo@bar.com', 'test_token', 'jack');
      done();
    })
  })

  describe('sendResetPassMail()', function() {
    it('should sendResetPassMail be ok ', function(done) {
      mail.sendResetPassMail('foo@bar.com', 'test_token', 'jack');
      done();
    })
  })

  describe('sendNotificationMail()', function() {
    it('should sendNotificationMail be ok ', function(done) {
      mail.sendNotificationMail('foo@bar.com', 'lilei', 'hanmeimei', '英语一', 'test_post_id', 'test_reply_id');
      done();
    })
  })
})