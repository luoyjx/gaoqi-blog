/*!
 * tag controller
 */

var EventProxy = require('eventproxy');
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

  var proxy = new EventProxy();
  var events = ['tags', 'pages'];

  proxy.assign(events, function (tags, pages) {

    res.render('tag/list', {
      base: path,
      current_page: page,
      pages: pages,
      tags: tags,
      title: '全部标签'
    });
  });
  proxy.fail(next);

  var limit = 20;
  var options = {skip: (page - 1) * limit, limit: limit, sort: '-post_count'};

  Tag.getAllTagsByQuery({}, options, proxy.done('tags', function (tags) {
    tags = tags && tags.length > 0 ? tags : [];
    tags.forEach(function (tag) {
      tag.description = cutter.shorter(tag.description, 200);
    });
    return tags;
  }));

  Tag.getCountByQuery({}, proxy.done('pages', function (all_count) {
    return Math.ceil(all_count / limit);
  }));

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

  var proxy = new EventProxy();
  var events = ['tag', 'posts', 'pages'];

  proxy.assign(events, function (tag, posts, pages) {
    res.render('tag/index', {
      title: name,
      tag: tag,
      posts: posts.length === 0 ? [] : posts,
      base: path,
      current_page: page,
      pages: pages
    });
  });
  proxy.fail(next);

  var errorInfo = '';
  if (name.length === '') {
    errorInfo = 'tag名称不能为空';
  }

  if (errorInfo) {
    res.status(422);
    return res.render('notify/notify', {error: errorInfo});
  }

  Tag.getTagByName(name, proxy.done(function (tag) {
    if (!tag) {
      proxy.unbind();
      return res.render('notify/notify', {error: '该标签可能已经去了火星'});
    } else {
      tag.short_desc = cutter.shorter(tag.description, 200);
    }
    proxy.emit('tag', tag);
  }));

  var options = { skip: (page - 1) * limit, limit: limit, sort: '-create_at'};

  Post.getPostsByQuery({tags: name}, options, proxy.done(function (posts) {
    if (posts.length === 0) {
      return proxy.emit('posts', []);
    }
    proxy.emit('posts', posts);
  }));

  Post.getCountByQuery({tags: name}, proxy.done(function (allCount) {
    var pages = Math.ceil(allCount / limit);
    proxy.emit('pages', pages);
  }));
};
