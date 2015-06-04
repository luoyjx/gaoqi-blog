/*!
 * update tag count
 */

require('../models');
var Tag = require('../models').Tag;
var Post = require('../models').Post;

Post.distinct('tags', {}, function (err, tags) {
  tags.forEach(function (tagName) {
    Tag.findOne({name: tagName}, function (err, tag) {
      if (tag) {
        Post.count({tags: tagName}, function (err, count) {
          console.log(tagName + '  tag count ' + count);
          Tag.update({name: tagName}, {$set: {'post_count': count}}, function (err, result) {
            console.log(tagName + '  updated  result ' + result);
          });
        });
      } else {
        var newTag = new Tag({name: tagName});
        newTag.post_count = 1;
        newTag.save(function (err, tag) {
          console.log('tag save ' + tag._id);
        });
      }
    });
  });
});

