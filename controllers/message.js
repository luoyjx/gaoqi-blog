/*!
 * 消息 controller
 */

const Bluebird = require('bluebird')
const { Message } = require('../dao')

exports.index = async (req, res, next) => {
  const userId = req.session.user._id

  const [hasRead, hasNotRead] = await Bluebird.all([
    Message.getReadMessagesByUserId(userId),
    Message.getUnreadMessageByUserId(userId)
  ])

  // update async
  Message.updateMessagesToRead(userId, hasNotRead)

  let [hasReadMsgs, hasNotReadMsgs] = await Bluebird.all([
    Bluebird.map(hasRead, (doc) => { return Message.getMessageRelations(doc) }),
    Bluebird.map(hasNotRead, (doc) => { return Message.getMessageRelations(doc) })
  ])

  hasReadMsgs = hasReadMsgs.filter(function (doc) {
    return !doc.is_invalid
  })
  hasNotReadMsgs = hasNotReadMsgs.filter(function (doc) {
    return !doc.is_invalid
  })

  res.render('message/index', {
    has_read_messages: hasReadMsgs,
    hasnot_read_messages: hasNotReadMsgs
  })
}
