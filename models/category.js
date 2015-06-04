/*!
 * category model
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CategorySchema = new Schema({
  name: {type: String},
  show_name: {type: String},
  description: {type: String}, //描述
  parent_id: {type: ObjectId}, //父分类id
  create_at: {type: Date, default: Date.now},
  update_at: {type: Date, default: Date.now}
});

CategorySchema.index({create_at: -1});
CategorySchema.index({update_at: -1});
CategorySchema.index({name: 1});

mongoose.model('Category', CategorySchema);
