/*!
 * post collection model
 *
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TagFollowSchema = new Schema({
  user_id: { type: ObjectId },
  tag_id: { type: ObjectId },
  create_at: { type: Date, default: Date.now }
});

mongoose.model('TagFollow', TagFollowSchema);

