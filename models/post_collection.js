/*!
 * post collection model
 *
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId

var PostCollectionSchema = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  post_id: { type: ObjectId, ref: 'Post' },
  create_at: { type: Date, default: Date.now }
})

PostCollectionSchema.index({ user_id: 1 })

mongoose.model('PostCollection', PostCollectionSchema)
