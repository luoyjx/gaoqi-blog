/*!
 * user model
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
  name: {type: String},
  login_name: {type: String},
  pwd: {type: String},
  email: {type: String},
  url: {type: String},//个人网站
  location: {type: String},
  signature: {type: String},//签名?
  weibo: {type: String},
  avatar: {type: String}, //头像
  github_id: {type: String},
  github_username: {type: String},
  github_accessToken: {type: String},
  is_lock: {type: Boolean, default: false}, //锁定

  create_at: {type: Date, default: Date.now},
  update_at: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: false},//是否激活

  score: { type: Number, default: 0 },
  is_star: {type: Boolean, default: false},//活跃
  post_count: { type: Number, default: 0 },
  reply_count: { type: Number, default: 0 },
  follower_count: { type: Number, default: 0 },
  following_count: { type: Number, default: 0 },
  collect_tag_count: { type: Number, default: 0 },
  collect_post_count: { type: Number, default: 0 },

  retrieve_time: {type: Number},
  retrieve_key: {type: String},

  accessToken: {type: String}
});

UserSchema.index({login_name: 1}, {unique: true});
UserSchema.index({email: 1}, {unique: true});
UserSchema.index({score: -1});
UserSchema.index({post_count: -1});
UserSchema.index({reply_count: -1});
UserSchema.index({github_id: 1});
UserSchema.index({accessToken: 1});

mongoose.model('User', UserSchema);