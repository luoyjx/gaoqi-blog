'use strict'
/**
 * 消息 model
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

/*
 * type:
 * reply: xx 回复了你的话题
 * reply2: xx 在话题中回复了你
 * follow: xx 关注了你
 * at: xx ＠了你
 */

const MessageSchema = new Schema({
  type: { type: String },
  master_id: { type: ObjectId },
  author_id: { type: ObjectId },
  post_id: { type: ObjectId },
  reply_id: { type: ObjectId },
  has_read: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
})

MessageSchema.index({ master_id: 1, has_read: -1, create_at: -1 })

mongoose.model('Message', MessageSchema)
