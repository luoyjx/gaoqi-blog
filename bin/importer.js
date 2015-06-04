/*!
 * import post from old db
 */
require('../models');
var Post = require('../dao').Post;
var Tag = require('../dao').Tag;
var MongoClient = require('mongodb').MongoClient;
var html2md = require('html2markdown');
var validator = require('validator');
var cutter = require('../common/cutter');

var idMap = {
  'luoyjx': '5512bd83490e4446650a8681',
  'xiaoyeshen': '5544518af81d8dee09b10150'
};

/**
 * replica set 连接写法
 * mongodb://host1:port1,host2:port2,host3:port3/dbname
 */
var connUrl = 'mongodb://blog:blogGaoqixhb2014@127.0.0.1:27017/blog';
MongoClient.connect(connUrl, {}, function (err, mongo) {
  if (err) {
    console.log(err.message);
  }
  ;
  //读取 posts 集合
  mongo.collection('posts', function (err, collection) {
    if (err) {
      console.log(err.message);
    }
    //返回只包含 name、time、title 属性的文档组成的存档数组
    collection.find({}, {}).sort({
      time: -1
    }).toArray(function (err, docs) {
        if (err) {
          console.log(err.message);
        }

        docs.forEach(function (doc) {
          var content = doc.post.replace(/<[^>]*>/g, '');
          var description = cutter.shorter(content, 200);

          var tags = doc.tags ? doc.tags.filter(function (tag) {
            return validator.trim(tag);
          }) : [];
          Post.importNew(doc.title, description, html2md(doc.post), idMap[doc.name],
            tags, 'unknown', doc._id, doc.time.date, doc.pv, function (err, post) {
              if (err) {
                console.log(err.message);
                console.log('error id' + doc._id);
              }
              console.log(post._id);
              if (tags.length > 0) {
                tags.forEach(function (tag) {
                  tag = validator.trim(tag);
                  if (tag) {
                    var query = {name: tag};
                    var update = {"$inc": {"post_count": 1}};
                    var options = {upsert: true};
                    Tag.upsert(query, update, options, function (err, t) {
                      if (err) {
                        console.log(err.message);
                      }
                      console.log(t);
                    });
                  }
                });
              }
            });
        });

      });
  });
});
