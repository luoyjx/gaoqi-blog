/*!
 * controller post
 */

var Promise = require('bluebird');
var validator = require('validator');
var Post = require('../dao').Post;
var User = require('../dao').User;
var Tag = require('../dao').Tag;
var Reply = require('../dao').Reply;
var tools = require('../common/tools');
var at = require('../common/at');
var config = require('../config');
var uploader = require('../common/upload');
var cache = require('../common/cache');
var cutter = require('../common/cutter');
var render = require('../common/render');

/**
 * 文章页
 * @param  req
 * @param  res
 * @param  next
 */
exports.index = function(req, res, next) {
  var post_id = req.params._id;

  if (post_id.length !== 24) {
    return res.wrapRender('notify/notify', {
      error: '这篇文章好像不在这个星球上了'
    });
  }

  Post
    .getCompletePost(post_id)
    .spread(function(post, author, replies) {
      post.pv += 1;
      post.save();
      //格式化时间
      post.frendly_create_at = tools.formatDate(post.create_at, false);
      //作者
      post.author = author;
      //回复
      post.replies = replies;

      var hot_options = {
        limit: 6,
        sort: '-pv'
      };
      var recent_options = {
        limit: 6,
        sort: '-create_at'
      };

      return Promise
        .all([
          Promise.resolve(post),
          Post.getSimplePosts(hot_options),
          Post.getSimplePosts(recent_options)
        ]);
    })
    .spread(function(post, hotPosts, recentPosts) {
      res.wrapRender('post/index', {
        title: post.title + ' - ' + post.author.login_name, //文章名 - 作者名
        description: cutter.shorter(cutter.clearHtml(render.markdown(post.linkedContent)), 100),
        tags: post.tags.join(','),
        post: post,
        recent: recentPosts,
        hots: hotPosts,
        replies: post.replies
      });
    })
    .catch(function(err) {
      res.wrapRender('notify/notify', {
        error: err
      });
    })
};

/**
 * 跳到创建文章页
 * @param req
 * @param res
 * @param next
 */
exports.showCreate = function(req, res, next) {
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
exports.create = function(req, res, next) {
  var category = validator.trim(req.body.category);
  category = validator.escape(category);
  var title = validator.trim(req.body.title);
  title = validator.escape(title); //escape 将html 等特殊符号 标签转义
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
  } else if (content === '') {
    error = '文章内容不能为空';
  }

  if (error) {
    return res.status(422).wrapRender('post/edit', {
      edit_error: error,
      title: '发表文章',
      content: content
    });
  } else {
    var tagsArr = tags ? tags.split(',') : [];
    var _post;
    Post
      .newAndSave(title, '', content, req.session.user._id, tagsArr, category)
      .then(function(postSaved) {
        _post = postSaved;

        return User.getUserById(req.session.user._id);
      })
      .then(function(userFind) {
        userFind.score += 5;
        userFind.topic_count += 1;
        userFind.save();
        req.session.user = userFind;
        //发送at消息
        at.sendMessageToMentionUsers(content, _post._id, req.session.user._id, null, req.session.user.login_name, _post.title);
      })
      .then(function() {
        res.redirect('/p/' + _post._id);
      })
      .then(function() {
        if (tagsArr.length > 0) {
          tagsArr = tagsArr.filter(function(tagName) {
            return !!tagName;
          });

          Promise.map(tagsArr, function(tagName) {
            Tag.getTagByName(tagName, function(err, tag) {
              if (!tag) {
                Tag
                  .newAndSave(tagName, '')
                  .then(function(newTag) {
                    newTag.post_count += 1;
                    newTag.save();
                  });
              } else {
                tag.post_count += 1;
                tag.save();
              }
            });
          });
        }
      })
      .catch(function(err) {
        return next(err);
      });
  }
};

/**
 * 跳转到编辑文章页面
 * @param req
 * @param res
 * @param next
 */
exports.edit = function(req, res, next) {
  var post_id = req.params._id;

  Post
    .getPostById(post_id)
    .spread(function(post, author) {
      if (!post) return res.wrapRender('notify/notify', {
        error: '这篇文章从地球上消失了'
      });

      if (!((post.author_id + '') === (req.session.user._id + '') || (req.session.user.is_admin))) {
        return res.wrapRender('notify/notify', {
          error: '大胆！这篇文章岂是你能编辑的？'
        });
      }

      res.wrapRender('post/edit', {
        title: '编辑文章',
        action: 'edit',
        post_id: post._id,
        post_title: post.title,
        content: post.content,
        category: post.category,
        tags: post.tags
      });
    })
};

/**
 * 更新文章信息
 * @param req
 * @param res
 * @param next
 */
exports.update = function(req, res, next) {
  var post_id = req.params._id;
  //escape 将html 等特殊符号 标签转义
  var category = validator.trim(req.body.category);
  category = validator.escape(category);
  var title = validator.trim(req.body.title);
  title = validator.escape(title);
  var content = validator.trim(req.body.content);
  var tags = validator.trim(req.body.tags) ?
    validator.trim(req.body.tags) : '';

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
    return res.wrapRender('post/edit', {
      action: 'edit',
      edit_error: editError,
      post_id: post_id,
      content: content
    });
  }

  Post
    .getPostById(post_id)
    .spread(function(post, author) {
      if (!post) return res.wrapRender('notify/notify', {
        error: '这篇文章从地球上消失了'
      });

      // 只有管理员、非管理员但是是本帖发帖用户 二者可用修改本帖
      if (req.session.user.is_admin || ((post.author_id + '') === (req.session.user._id + ''))) {

        //保存文章
        post.title = title;
        post.content = content;
        post.category = category;
        post.tags = tags.split(',');
        post.update_at = new Date();
        post.save();
      } else {
        return res.wrapRender('notify/notify', {
          error: '这篇文章可不是谁都能编辑的'
        });
      }

      return Promise.resolve(post);
    })
    .then(function(postSaved) {
      if (!res.headersSent) {
        //发送at消息
        at.sendMessageToMentionUsers(content, postSaved._id, req.session.user._id, null, req.session.user.login_name, postSaved.title);
        res.redirect('/p/' + postSaved._id);
      }
    })
    .catch(function(err) {
      next(err);
    });
};

/**
 * 删除文章
 * @param req
 * @param res
 * @param next
 */
exports.delete = function(req, res, next) {
  var post_id = req.params._id;

  Post
    .getPostById(post_id)
    .spread(function(postFind) {
      console.log(postFind);
      console.log(req.session.user._id);
      if (!req.session.user.is_admin && (postFind.author_id + '') !== (req.session.user._id + '')) {
        return res.status(403).wrapSend({
          success: false,
          message: '这篇文章可不是谁都能删除的'
        });
      }
      if (!postFind) {
        return res.status(422).wrapSend({
          success: false,
          message: '这篇文章从地球上消失了'
        });
      }

      //    //使用软删除方式
      //    post.enable = false;
      //    post.save(function(err){
      //      if(err){
      //        return res.send({ success: false, message: err.message });
      //      }
      //      res.send({ success: true, message: '文章已被删除' });
      //    });
      console.log('delete');
      //数据库删除
      Post
        .remove({
          _id: postFind._id
        })
        .then(function() {
          console.log('delete done');
          res.wrapSend({
            success: true,
            message: '这篇文章已被送到火星上了'
          });
        });
    })
    .catch(function(err) {
      res.wrapSend({
        success: false,
        message: err.message
      });
    })

};

/**
 * 置顶(管理员等操作)
 * @param req
 * @param res
 * @param next
 */
exports.top = function(req, res, next) {

};

/**
 * 推荐文章(用户操作)
 * @param req
 * @param res
 * @param next
 */
exports.recommend = function(req, res, next) {
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
exports.good = function(req, res, next) {

};

/**
 * 收藏文章
 * @param req
 * @param res
 * @param next
 */
exports.collect = function(req, res, next) {

};

/**
 * 取消收藏文章
 * @param req
 * @param res
 * @param next
 */
exports.unCollect = function(req, res, next) {

};

/**
 * 锁定文章
 * @param req
 * @param res
 * @param next
 */
exports.lock = function(req, res, next) {

};

/**
 * 上传文件
 * @param req
 * @param res
 * @param next
 */
exports.upload = function(req, res, next) {
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    uploader
      .upload(file, {
        filename: filename
      })
      .then(function(result) {
        res.json({
          success: true,
          url: result.url
        });
      })
      .catch(function(err) {
        return next(err);
      });
  });

  req.pipe(req.busboy);
};