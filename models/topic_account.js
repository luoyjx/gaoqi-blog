/*！
 * 主题的公众号链接
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TopicAccountSchema = new Schema({
  name: {type: String},//公众号名称
  link: {type: String},//公众号搜狗链接
  create_at: {type: Date, default: Date.now},
  update_at: {type: Date, default: Date.now}
});

TopicAccountSchema.index({name: 1});
TopicAccountSchema.index({create_at: -1});

mongoose.model('TopicAccount', TopicAccountSchema);