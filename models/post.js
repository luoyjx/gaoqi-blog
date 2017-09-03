'use strict'
/**
 * post model
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const config = require('config')
const _ = require('lodash')

const PostSchema = new Schema({
  title: { type: String },
  description: { type: String }, // 文章描述
  content: { type: String },
  author_id: { type: ObjectId },
  top: { type: Boolean, default: false }, // 置顶
  good: { type: Boolean, default: false }, // 精华
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  tags: { type: [String] }, // 标签
  category: { type: String }, // 分类的name(非show_name)
  reply_count: { type: Number, default: 0 },
  recommend_count: { type: Number, default: 0 }, // 推荐
  last_reply: { type: ObjectId },
  last_reply_at: { type: Date, default: Date.now },
  pv: { type: Number, default: 0 }, // 浏览数
  lock: { type: Boolean, default: false }, // 违规文章锁定
  enable: { type: Boolean, default: true } // 文章软删除时用到
})

PostSchema.index({ author: 1, create_at: -1 })
PostSchema.index({ top: -1, update_at: -1 })
PostSchema.index({ pv: -1 })
PostSchema.index({ recommend_count: -1 })
PostSchema.index({ reply_count: -1 })
PostSchema.index({ category: 1 })

PostSchema.virtual('categoryName').get(function () {
  const tab = this.category
  const pair = _.find(config.tabs, function (_pair) {
    return _pair[0] === tab
  })

  if (pair) {
    return pair[1]
  }

  return ''
})

mongoose.model('Post', PostSchema)
