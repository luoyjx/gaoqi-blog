/*！
 * topic model 微信文章
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TopicSchema = new Schema({
  title: {type: String},
  description: {type: String},//文章描述
  category: {type: ObjectId, ref: 'TopicCategory'},//主题分类
  link: {type: String},//原文链接
  account: {type: ObjectId, ref: 'TopicAccount'},//公众号名称
  top: {type: Boolean, default: false},//置顶
  good: {type: Boolean, default: false},//精华
  create_at: {type: Date, default: Date.now},
  update_at: {type: Date, default: Date.now},
  recommend_count: {type: Number, default: 0},//推荐
  pv: {type: Number, default: 0}//浏览数
});

TopicSchema.index({title: 1});
TopicSchema.index({description: 1});
TopicSchema.index({pv: -1});
TopicSchema.index({recommend_count: -1});

mongoose.model('Topic', TopicSchema);