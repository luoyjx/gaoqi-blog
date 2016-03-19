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
  weixin_name: {type: String}//微信号
});

TopicAccountSchema.index({name: 1});
TopicAccountSchema.index({weixin_name: 1});

mongoose.model('TopicAccount', TopicAccountSchema);