'use strict';
/**
 * tag follow model
 *
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const TagFollowSchema = new Schema({
  user_id: { type: ObjectId, ref: 'User' },
  tag_id: { type: ObjectId, ref: 'Tag' },
  create_at: { type: Date, default: Date.now }
});

mongoose.model('TagFollow', TagFollowSchema);

