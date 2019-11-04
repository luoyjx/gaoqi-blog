/**
 * message test
 * @authors yanjixiong
 * @date    2016-10-11 11:51:50
 */

var should = require('should');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var message = require('../../common/message');

describe('test/common/message.test.js', function() {
  describe('sendReplyMessage()', function() {
    it('should sendReplyMessage be ok', function(done) {
      message
        .sendReplyMessage(ObjectId(), ObjectId(), ObjectId(), ObjectId())
        .then(function(message) {
          message.should.not.be.Null;
          done();
        })
        .catch(done);
    })
  })

  describe('sendAtMessage()', function() {
    it('should sendAtMessage be ok', function(done) {
      message
        .sendAtMessage(ObjectId(), ObjectId(), ObjectId(), ObjectId())
        .then(function(message) {
          message.should.not.be.Null;
          done();
        })
        .catch(done);
    })
  })
})