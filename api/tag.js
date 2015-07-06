/*!
 * tag web api
 */
var Tag = require('../dao').Tag;
var validator = require('validator');

/**
 * 根据名称关键字搜索标签
 * @param req
 * @param res
 * @param next
 */
exports.searchTagsByName = function (req, res, next) {
  var name = validator.trim(req.query.q);
  var callback = req.query.callback;
  if (!name) {
    return res.end(callback + '([])');
  }

  var pattern = new RegExp("^.*" + name + ".*$", "igm");
  var options = {limit: 10, sort: '-post_count'};

  Tag.getAllTagsByQuery({name: pattern}, options, function (err, tags) {
    if (err) {
      next(err);
    }
    //数据库中不存在此tag则返回只当前tag名称
    if (tags.length === 0) {
      return res.end(callback + '([{name: "' + name + '"}])');
    }
    //如果tags中不存在当前名称tag则加到第一个元素
    var exists = false;
    var container = [];
    tags.forEach(function (tag) {
      if (tag.name.toLowerCase() == name) {
        exists = true;
      }
      container.push({name: tag.name});
    });
    if (!exists) {
      if (container.length === 10) {
        container.pop();
      }
      container.unshift({name: name});
    }
    return res.end(callback + '(' +JSON.stringify(container) + ')');
  })
};

/**
 * 新增一个tag
 * @param req
 * @param res
 * @param next
 */
exports.addTag = function (req, res, next) {
  var name = validator.trim(req.body.name);
  name = validator.escape(name);
  var description = validator.trim(req.body.description);
  description = validator.escape(description);

  // 验证
  var editError;
  if (name === '') {
    editError = '标题不能是空的';
  }
  // END 验证

  if (editError) {
    res.status(422);
    return res.send({
      error_msg: editError
    });
  }

  //查询是否存在这个tag，不存在则添加
  Tag.getTagByName(name, function (err, tag) {
    if (err) {
      return next(err);
    }
    if (tag) {
      if (description) {
        tag.description = description;
        tag.update_at = new Date();
        tag.save(function (err) {
          if (err) {
            return next(err);
          }
          return res.send({
            success: 1,
            tag_id: tag._id,
            msg: '更新成功'
          });
        });
      } else {
        return res.send({
          error_msg: 'tag已存在'
        });
      }
    } else {
      Tag.newAndSave(name, description, function (err, tag) {
        if (err) {
          next(err);
        }
        res.send({success: 1, tag_id: tag._id});
      });
    }
  });
};

/**
 * 关注标签
 * @param req
 * @param res
 * @param next
 */
exports.follow = function (req, res, next) {
  var user = req.session.user;
  var tag_id = validator.trim(req.params._id);
  if (!user) {
    return res.json({success: 0, msg: '未登录'});
  } else if (!tag_id) {
    return res.status(403).json({success: 0, msg: '未知的标签'})
  }

  res.json({success: 1, msg: '', data: 1});
};

/**
 * 取消关注标签
 * @param req
 * @param res
 * @param next
 */
exports.unFollow = function (req, res, next) {

};