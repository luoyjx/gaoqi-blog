/**
 * user follow
 * @authors yanjixiong ()
 * @date    2016-11-28 22:38:05
 * @version $Id$
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const UserFollowSchema = new Schema({
  follower_id: { type: ObjectId, ref: 'User' },
  following_id: { type: ObjectId, ref: 'User' },
  create_at: { type: Date, default: Date.now }
})

UserFollowSchema.index({ create_at: -1 })
UserFollowSchema.index({ follower_id: 1, following_id: 1 })

mongoose.model('UserFollow', UserFollowSchema)
