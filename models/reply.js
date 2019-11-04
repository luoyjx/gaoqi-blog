/*!
 * reply model
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId

var ReplySchema = new Schema({
  content: { type: String },
  post_id: { type: ObjectId, ref: 'Post' },
  author_id: { type: ObjectId, ref: 'User' },
  reply_id: { type: ObjectId },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  content_is_html: { type: Boolean }
})

ReplySchema.index({ post_id: 1 })
ReplySchema.index({ author_id: 1, create_at: -1 })

mongoose.model('Reply', ReplySchema)
