/*!
 * post model
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var config = require('../config');
var _ = require('lodash');

var PostSchema = new Schema({
  title: {type: String},
  description: {type: String},//文章描述
  content: {type: String},
  author_id: {type: ObjectId},
  top: {type: Boolean, default: false},//置顶
  good: {type: Boolean, default: false},//精华
  create_at: {type: Date, default: Date.now},
  update_at: {type: Date, default: Date.now},
  tags: {type: [String]},//标签
  category: {type: String},//分类的name(非show_name)
  reply_count: {type: Number, default: 0},
  recommend_count: {type: Number, default: 0},//推荐
  pv: {type: Number, default: 0},//浏览数
  lock: {type: Boolean, default: false},//违规文章锁定
  enable: {type: Boolean, default: true}//文章软删除时用到
});

PostSchema.index({create_at: -1});
PostSchema.index({update_at: -1});
PostSchema.index({description: 1});
PostSchema.index({author: 1, create_at: -1});
PostSchema.index({pv: -1});
PostSchema.index({recommend_count: -1});
PostSchema.index({reply_count: -1});
PostSchema.index({category: 1});

PostSchema.virtual('categoryName').get(function () {
  var tab  = this.category;
  var pair = _.find(config.tabs, function (_pair) {
    return _pair[0] === tab;
  });

  if (pair) {
    return pair[1];
  } else {
    return '';
  }
});

PostSchema.virtual('categoryColor').get(function () {
  var tab  = this.category;
  var pair = _.find(config.tabs, function (_pair) {
    return _pair[0] === tab;
  });

  if (pair) {
    return pair[2];
  } else {
    return '';
  }
});

mongoose.model('Post', PostSchema);