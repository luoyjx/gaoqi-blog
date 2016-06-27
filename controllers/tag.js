/*!
 * tag controller
 */

var Promise = require('bluebird');
var Tag = require('../dao').Tag;
var Post = require('../dao').Post;
var validator = require('validator');
var cutter = require('../common/cutter');
var config = require('../config');

/**
 * 查询所有标签信息
 * @param req
 * @param res
 * @param next
 */
exports.index = function (req, res, next) {
  var path = req.path;
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  page = page > 0 ? page : 1;

  var limit = 20;
  var options = {skip: (page - 1) * limit, limit: limit, sort: '-post_count'};

  Promise
    .all([
      Tag.getAllTagsByQuery({}, options)
        .then(function(tags) {
          return Promise.map(tags, function(tag) {
            tag.description = cutter.shorter(tag.description, 200);
            return tag;
          })
        }),
      Tag.getCountByQuery({})
        .then(function(all_count) {
          return Promise.resolve(Math.ceil(all_count / limit));
        })
    ])
    .spread(function(tags, pages) {
      res.render('tag/list', {
        base: path,
        current_page: page,
        pages: pages,
        tags: tags,
        title: '标签 - 第' + page + '页'
      });
    })
    .catch(function(err) {
      next(err);
    });
};

/**
 * 某个tag的信息
 * @param req
 * @param res
 * @param next
 */
exports.getTagByName = function (req, res, next) {
  var path = req.path;
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  var name = validator.trim(req.params.name);
  name = validator.escape(name);
  var limit = config.list_topic_count;

  var errorInfo = '';
  if (name.length === '') {
    errorInfo = 'tag名称不能为空';
  }

  if (errorInfo) {
    return res.status(422).render('notify/notify', {error: errorInfo});
  }

  // post options
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-create_at'};

  Promise
    .all([
      Tag.getTagByName(name),
      Post.getPostsByQuery({tags: name}, options),
      Post.getCountByQuery({tags: name})
        .then(function(all_count) {
          return Promise.resolve(Math.ceil(all_count / limit));
        })
    ])
    .spread(function(tag, posts, pages) {
      if (!tag) {
        return res.wrapRender('notify/notify', {error: '该标签可能已经去了火星'});
      }

      tag.short_desc = cutter.shorter(tag.description, 200);

      res.wrapRender('tag/index', {
        title: name  + ' 第' + page + '页',
        tag: tag,
        posts: posts.length === 0 ? [] : posts,
        base: path,
        current_page: page,
        pages: pages
      });
    })
    .catch(function(err) {
      next(err);
    });
};
