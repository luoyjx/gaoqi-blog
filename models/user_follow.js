/**
 * user follow 
 * @authors yanjixiong ()
 * @date    2016-11-28 22:38:05
 * @version $Id$
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserFollowSchema = new Schema({
  follower_id: {type: ObjectId, ref: 'User'},
  following_id: {type: ObjectId, ref: 'User'},
  create_at: {type: Date, default: Date.now}
});

UserFollowSchema.index({create_at: -1});
UserFollowSchema.index({follower_id: 1, following_id: 1});

mongoose.model('UserFollow', UserFollowSchema);