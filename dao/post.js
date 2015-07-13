/*!
 * post dao
 */
var EventProxy = require('eventproxy');
var models = require('../models');
var Post = models.Post;
var User = require('./user');
var Reply = require('./reply');
var tools = require('../common/tools');
var _ = require('lodash');

/**
 * 根据id查询一篇文章
 * Callback:
 * - err, 数据库错误
 * - post, 文章信息
 * - author, 作者信息
 * @param {String} id 用户id
 * @param {Function} callback 回调函数
 */
exports.getPostById = function (id, callback) {
  var proxy = new EventProxy();
  var events = ['post', 'author'];

  proxy.assign(events,function (post, author) {
    if (!author) {
      return callback(null, null, null);
    }
    return callback(null, post, author);
  }).fail(callback);

  Post.findOne({_id: id}, proxy.done(function (post) {
    if (!post) {
      proxy.emit('post', null);
      proxy.emit('author', null);
      return;
    }
    proxy.emit('post', post);

    User.getUserById(post.author_id, proxy.done('author'));
  }));
};

/**
 * 获取一篇文章
 * Callback:
 * - err, 数据库错误
 * - post, 文章信息
 * @param {String} id 文章id
 * @param {Function} callback 回调函数
 */
exports.getPost = function (id, callback) {
  Post.findOne({_id: id}, callback);
};

/**
 * 查询关键词能搜索到的文章数量
 * Callback:
 * - err, 数据库错
 * - count, 文章数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
  Post.count(query, callback);
};

/**
 * 取最新的5万条记录，sitemap使用
 * @param {Function} callback 回调函数
 */
exports.getLimit5w = function (callback) {
  Post.find({}, '_id', {limit: 50000, sort: '-create_at'}, callback);
};

/**
 * 根据查询条件查询文章
 * Callback:
 * - err, 数据库错误
 * - posts, 文章列表
 * @param {String} query 关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getPostsByQuery = function (query, opt, callback) {
  Post.find(query, {}, opt, function (err, posts) {
    if (err) {
      return callback(err);
    }
    if (posts.length === 0) {
      return callback(null, []);
    }

    var proxy = new EventProxy();
    proxy.after('post_ready', posts.length, function (posts) {
      return callback(null, posts);
    });
    proxy.fail(callback);


    posts.forEach(function(post, i){
      User.getUserById(post.author_id, proxy.group('post_ready', function(author){
        //post = post.toObject();
        post.author = author;
        post.friendly_create_at = tools.formatDate(post.create_at, true);
        post.friendly_pv = tools.formatPV(post.pv);
        return post;
      }));
    })
  });
};

/**
 * 根据选项查询热门文章
 * Callback:
 * - err, 数据库错误
 * - posts, 热门文章
 * @param {Object} options 查询选项
 * @param {Function} callback 回调函数
 */
exports.getHotPosts = function (options, callback) {
  Post.find({}, {_id: 1, title: 1}, options, function (err, posts) {
    if (err) {
      return callback(err);
    }
    if (posts.length === 0) {
      return callback(null, []);
    }
    callback(null, posts);
  });
};

/**
 * 获得完整的文章，包括作者、回复
 * Callback:
 * - err, 数据库错误
 * - msg, 错误消息
 * - post, 文章
 * - author, 作者
 * - replies, 文章回复
 * @param post_id
 * @param callback
 */
exports.getCompletePost = function (post_id, callback) {
  var proxy = new EventProxy();
  var events = ['post', 'author', 'replies'];

  proxy.all(events,function (post, author, replies) {
    callback(null, '', post, author, replies);
  }).fail(callback);

  Post.findOne({_id: post_id}, proxy.done(function (post) {
    if (!post) {
      proxy.unbind();
      return callback(null, '这篇文章从地球上消失了');
    }
    proxy.emit('post', post);

    //at其他用户解析

    User.getUserById(post.author_id, proxy.done(function (author) {
      if (!author) {
        proxy.unbind();
        return callback(null, '这篇文章的作者已经从地球上消失了');
      }
      proxy.emit('author', author);
    }));

    Reply.getRepliesByPostId(post._id, proxy.done('replies'));
  }));

};

/**
 * 创建保存文章
 * @param {String} title 标题
 * @param {String} description 摘要
 * @param {String} content 内容
 * @param {String} author_id 作者id
 * @param {Array} tags 标签
 * @param {String} category 文章分类
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function (title, description, content, author_id, tags, category, callback) {
  var post = new Post();
  post.title = title;
  post.description = description;
  post.content = content;
  post.author_id = author_id;
  post.tags = tags;
  post.category = category;
  post.save(callback);
};

/**
 * 导入文章
 * @param {String} title 标题
 * @param {String} description 摘要
 * @param {String} content 内容
 * @param {String} author_id 作者id
 * @param {Array} tags 标签
 * @param {String} category 文章分类
 * @param {String} id 文章id，在导入时用到
 * @param {Date} create_at 创建时间
 * @param {Number} pv 浏览数
 * @param {Function} callback 回调函数
 */
exports.importNew = function (title, description, content, author_id, tags, category, id, create_at, pv, callback) {
  var post = new Post();
  post._id = id;
  post.title = title;
  post.description = description;
  post.content = content;
  post.author_id = author_id;
  post.tags = tags;
  post.category = category;
  post.create_at = create_at;
  post.update_at = create_at;
  post.pv = pv;
  post.save(callback);
};