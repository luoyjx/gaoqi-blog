/*！
 * topic category model 主题分类
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TopicCategorySchema = new Schema({
  name: {type: String},//分类名称
  create_at: {type: Date, default: Date.now},
  update_at: {type: Date, default: Date.now}
});

TopicCategorySchema.index({name: 1});
TopicCategorySchema.index({create_at: -1});

mongoose.model('TopicCategory', TopicCategorySchema);