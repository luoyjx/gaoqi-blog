/*!
 * controller post
 */

var validator = require('validator');
var EventProxy = require('eventproxy');
var Post = require('../dao').Post;
var User = require('../dao').User;
var Tag = require('../dao').Tag;
var Reply = require('../dao').Reply;
var tools = require('../common/tools');
var at = require('../common/at');
var config = require('../config');
var uploader = require('../common/upload');
var cache = require('../common/cache');

/**
 * 文章页
 * @param  req
 * @param  res
 * @param  next
 */
exports.index = function (req, res, next) {

  var post_id = req.params._id;
  if (post_id.length !== 24) {
    return res.render('notify/notify', {
      error: '这篇文章好像不在这个星球上了'
    });
  }

  var events = ['post', 'recent', 'hot'];
  var proxy = EventProxy.create(events, function (post, recent_posts, hot_posts) {
    res.render('post/index', {
      title: post.title + ' - ' + post.author.login_name,//文章名 - 作者名
      description: post.description,
      tags: post.tags.join(','),
      post: post,
      recent: recent_posts,
      hots: hot_posts,
      replies: post.replies
    });
  });

  proxy.fail(next);

  Post.getCompletePost(post_id, proxy.done(function (msg, post, author, replies) {
    if (msg) {
      proxy.unbind();
      return res.render('notify/notify', {error: msg});
    }

    post.pv += 1;
    post.save();

    //格式化时间
    post.frendly_create_at = tools.formatDate(post.create_at, false);
    //作者
    post.author = author;
    //回复
    post.replies = replies;

    proxy.emit('post', post);

    var hot_options = {limit: 6, sort: '-pv'};

    Post.getSimplePosts(hot_options, proxy.done('hot'));

    var recent_options = {limit: 6, sort: '-create_at'};

    Post.getSimplePosts(recent_options, proxy.done('recent'));
  }));
};

/**
 * 跳到创建文章页
 * @param req
 * @param res
 * @param next
 */
exports.showCreate = function (req, res, next) {
  res.render('post/edit', {
    title: '发表文章'
  });
};

/**
 * 保存新文章
 * @param req
 * @param res
 * @param next
 */
exports.create = function (req, res, next) {
  var category = validator.trim(req.body.category);
  category = validator.escape(category);
  var title = validator.trim(req.body.title);
  title = validator.escape(title);//escape 将html 等特殊符号 标签转义
  var description = validator.trim(req.body.description);
  description = validator.escape(description);
  var content = validator.trim(req.body.content);
  var tags = validator.trim(req.body.tags);

  var error;
  if (category === '') {
    error = '请选择一个分类';
  } else if (title === '') {
    error = '标题不能为空';
  } else if (title.length < 5 || title.length > 100) {
    error = '标题字数在5到100之间';
  } else if (category === '') {
    error = '必须选择一个分类';
  } else if (description === '') {
    error = '文章描述不能为空';
  } else if (description.length > 300) {
    error = '文章描述字数应在300字符以内';
  } else if (content === '') {
    error = '文章内容不能为空';
  }

  if (error) {
    res.status(422);
    return res.render('post/edit', {
      edit_error: error,
      title: '发表文章',
      content: content
    });
  } else {
    var tagsArr = tags ? tags.split(',') : [];
    var tag_ep = new EventProxy();
    tag_ep.fail(next);

    Post.newAndSave(title, description, content, req.session.user._id, tagsArr, category, function (err, post) {
      if (err) {
        next(err);
      }

      var proxy = new EventProxy();

      proxy.all('score_saved', function () {
        res.redirect('/p/' + post._id);
      });
      proxy.fail(next);
      User.getUserById(req.session.user._id, proxy.done(function (user) {
        user.score += 5;
        user.topic_count += 1;
        user.save();
        req.session.user = user;
        proxy.emit('score_saved');
      }));

      //发送at消息
      at.sendMessageToMentionUsers(content, post._id, req.session.user._id, null, req.session.user.login_name, post.title);
      tag_ep.emit('save_done');
    });

    tag_ep.all('save_done', function () {
      if (tagsArr.length > 0) {
        tagsArr.forEach(function (tagName) {
          tagName = validator.trim(tagName);
          if (tagName) {
            Tag.getTagByName(tagName, function (err, tag) {
              if (!tag) {
                Tag.newAndSave(tagName, '', function (err, newTag) {
                  newTag.post_count += 1;
                  newTag.save();
                });
              } else {
                tag.post_count += 1;
                tag.save();
              }
            });
          }
        });
      }
    });
  }

};

/**
 * 跳转到编辑文章页面
 * @param req
 * @param res
 * @param next
 */
exports.edit = function (req, res, next) {
  var post_id = req.params._id;
  var proxy = new EventProxy();
  var events = ['post'];

  proxy.assign(events, function (post) {
    res.render('post/edit', {
      title: '编辑文章',
      action: 'edit',
      post_id: post._id,
      post_title: post.title,
      description: post.description,
      content: post.content,
      category: post.category,
      tags: post.tags
    });
  });

  Post.getPostById(post_id, function (err, post, author) {
    if (!post) {
      return res.render('notify/notify', {error: '这篇文章从地球上消失了'});
    }
    if (String(post.author_id) === String(req.session.user._id) || req.session.user.is_admin) {
      proxy.emit('post', post);
    } else {
      return res.render('notify/notify', {error: '大胆！这篇文章岂是你能编辑的？'});
    }
  });
};

/**
 * 更新文章信息
 * @param req
 * @param res
 * @param next
 */
exports.update = function (req, res, next) {
  var post_id = req.params._id;
  //escape 将html 等特殊符号 标签转义
  var category = validator.trim(req.body.category);
  category = validator.escape(category);
  var title = validator.trim(req.body.title);
  title = validator.escape(title);
  var description = validator.trim(req.body.description);
  description = validator.escape(description);
  var content = validator.trim(req.body.content);
  var tags = validator.trim(req.body.tags) ?
    validator.trim(req.body.tags) : '';

  Post.getPostById(post_id, function (err, post, author) {
    if (!post) {
      res.render('notify/notify', {error: '这篇文章从地球上消失了'});
      return;
    }

    if (post.author_id.equals(req.session.user._id) || req.session.user.is_admin) {
      // 验证
      var editError;
      if (title === '') {
        editError = '标题不能是空的。';
      } else if (title.length < 5 || title.length > 100) {
        editError = '标题字数太多或太少。';
      } else if (!category) {
        editError = '必须选择一个分类';
      }
      // END 验证

      if (editError) {
        res.status(422);
        return res.render('post/edit', {
          action: 'edit',
          edit_error: editError,
          topic_id: post._id,
          content: content
        });
      }

      //保存文章
      post.title = title;
      post.description = description;
      post.content = content;
      post.category = category;
      post.tags = tags.split(',');
      post.update_at = new Date();
      post.save(function (err) {
        if (err) {
          return next(err);
        }
        //发送at消息
        at.sendMessageToMentionUsers(content, post._id, req.session.user._id, null, req.session.user.login_name, post.title);
        res.redirect('/p/' + post._id);
      });

    } else {
      res.render('notify/notify', {error: '这篇文章可不是谁都能编辑的'});
    }
  });
};

/**
 * 删除文章
 * @param req
 * @param res
 * @param next
 */
exports.delete = function (req, res, next) {
  var post_id = req.params._id;

  Post.getPostById(post_id, function (err, post) {
    if (err) {
      return res.send({ success: false, message: err.message });
    }
    if (!req.session.user.is_admin && !(post.author_id.equals(req.session.user._id))) {
      res.status(403);
      return res.send({success: false, message: '这篇文章可不是谁都能删除的'});
    }
    if (!post) {
      res.status(422);
      return res.send({ success: false, message: '这篇文章从地球上消失了' });
    }
//    //使用软删除方式
//    post.enable = false;
//    post.save(function(err){
//      if(err){
//        return res.send({ success: false, message: err.message });
//      }
//      res.send({ success: true, message: '文章已被删除' });
//    });
    //数据库删除
    post.remove(function (err) {
      if (err) {
        return res.send({ success: false, message: err.message });
      }
      res.send({ success: true, message: '这篇文章已被送到火星上了' });
    });
  });

};

/**
 * 置顶(管理员等操作)
 * @param req
 * @param res
 * @param next
 */
exports.top = function (req, res, next) {

};

/**
 * 推荐文章(用户操作)
 * @param req
 * @param res
 * @param next
 */
exports.recommend = function (req, res, next) {
  var post_id = validator.trim(req.params._id);


};

/**
 * 取消推荐
 * @param req
 * @param res
 * @param next
 */
exports.unRecommend = function unRecommend(req, res, next) {
  var post_id = validator.trim(req.params._id);
};

/**
 * 加精(管理员等做此操作)
 * @param req
 * @param res
 * @param next
 */
exports.good = function (req, res, next) {

};

/**
 * 收藏文章
 * @param req
 * @param res
 * @param next
 */
exports.collect = function (req, res, next) {

};

/**
 * 取消收藏文章
 * @param req
 * @param res
 * @param next
 */
exports.unCollect = function (req, res, next) {

};

/**
 * 锁定文章
 * @param req
 * @param res
 * @param next
 */
exports.lock = function (req, res, next) {

};

/**
 * 上传文件
 * @param req
 * @param res
 * @param next
 */
exports.upload = function (req, res, next) {
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    uploader.upload(file, {filename: filename}, function (err, result) {
      if (err) {
        return next(err);
      }
      res.json({
        success: true,
        url: result.url
      });
    });
  });

  req.pipe(req.busboy);
};