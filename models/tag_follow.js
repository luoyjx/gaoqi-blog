/*!
 * tag follow model
 *
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId

var TagFollowSchema = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  tag_id: { type: ObjectId, ref: 'Tag' },
  create_at: { type: Date, default: Date.now }
})

mongoose.model('TagFollow', TagFollowSchema)
