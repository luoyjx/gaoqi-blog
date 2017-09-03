'use strict'
/**
 * post collection model
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const PostCollectionSchema = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  post_id: { type: ObjectId, ref: 'Post' },
  create_at: { type: Date, default: Date.now }
})

PostCollectionSchema.index({ user_id: 1 })

mongoose.model('PostCollection', PostCollectionSchema)
