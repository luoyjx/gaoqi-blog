'use strict';

const Promise = require('bluebird');
const Message = require('../services/message');

exports.index = function *index() {
  const userId = this.session.user._id;

  const [hasRead, hasNotRead] = yield Promise.all([
    Message.getReadMessagesByUserId(userId),
    Message.getUnreadMessageByUserId(userId)
  ]);

  Message.updateMessagesToRead(userId, hasNotRead);

  let [hasReadDetail, hasNotReadDetail] = yield Promise.all([
    Promise.map(hasRead, function (doc) {
      return Message.getMessageRelations(doc);
    }),
    Promise.map(hasNotRead, function (doc) {
      return Message.getMessageRelations(doc);
    })
  ]);

  hasReadDetail = hasRead.filter(function (doc) {
    return !doc.is_invalid;
  });

  hasNotReadDetail = hasNotRead.filter(function (doc) {
    return !doc.is_invalid;
  });

  yield this.render('message/index', {
    has_read_messages: hasReadDetail,
    hasnot_read_messages: hasNotReadDetail
  });
};
