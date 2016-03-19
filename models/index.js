var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

//models
require('./user');
require('./post');
require('./tag');
require('./reply');
require('./message');
require('./tag_follow');
require('./topic');
require('./topic_account');
require('./topic_category');

exports.User = mongoose.model('User');
exports.Post = mongoose.model('Post');
exports.Tag = mongoose.model('Tag');
exports.Reply = mongoose.model('Reply');
exports.Message = mongoose.model('Message');
exports.TagFollow = mongoose.model('TagFollow');
exports.Topic = mongoose.model('Topic');
exports.TopicAccount = mongoose.model('TopicAccount');
exports.TopicCategory = mongoose.model('TopicCategory');