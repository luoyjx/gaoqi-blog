var mongoose = require('mongoose')
var config = require('../config')

mongoose.Promise = require('bluebird')
mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message)
    process.exit(1)
  }
})

// models
require('./user')
require('./post')
require('./tag')
require('./reply')
require('./message')
require('./tag_follow')
require('./category')
require('./user_follow')
require('./post_collection')

exports.User = mongoose.model('User')
exports.Post = mongoose.model('Post')
exports.Tag = mongoose.model('Tag')
exports.Reply = mongoose.model('Reply')
exports.Message = mongoose.model('Message')
exports.TagFollow = mongoose.model('TagFollow')
exports.Category = mongoose.model('Category')
exports.UserFollow = mongoose.model('UserFollow')
exports.PostCollection = mongoose.model('PostCollection')
