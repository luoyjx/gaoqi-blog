/**
 * 分类
 * @authors yanjixiong
 * @date    2016-11-08 09:42:47
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const CategorySchema = new Schema({
  name: { type: String },
  show_name: { type: String },
  parent_id: { type: ObjectId }, // 父级id
  children_ids: { type: [ObjectId] }, // 子节点id
  is_top_level: { type: Boolean, default: false }, // 是否顶级
  desc: { type: String }, // 描述
  avatar: { type: String }, // 分类头像地址
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
})

CategorySchema.index({ create_at: -1 })
CategorySchema.index({ update_at: -1 })
CategorySchema.index({ name: 1 })
CategorySchema.index({ show_name: 1 })
CategorySchema.index({ parent_id: 1 })

mongoose.model('Category', CategorySchema)
