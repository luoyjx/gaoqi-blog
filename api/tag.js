'use strict';

const Tag = require('../services/tag');
const validator = require('validator');

/**
 * 根据名称关键字搜索标签
 * @param req
 * @param res
 * @param next
 */
exports.searchTagsByName = function *searchTagsByName() {
  const name = validator.trim(this.query.q);
  if (!name) {
    this.jsonp = [];
    return;
  }

  const pattern = new RegExp('^.*' + name + '.*$', 'igm');
  const options = { limit: 10, sort: '-post_count' };

  const tags = yield Tag.getAllTagsByQuery({ name: pattern }, options);

  // 数据库中不存在此tag则返回只当前tag名称
  if (tags.length === 0) {
    this.jsonp = [{ name }];
    return;
  }

  // 如果tags中不存在当前名称tag则加到第一个元素
  let exists = false;
  const container = [];
  tags.forEach(function (tag) {
    if (tag.name.toLowerCase() === name) {
      exists = true;
    }
    container.push({ name: tag.name });
  });

  if (!exists) {
    if (container.length === 10) {
      container.pop();
    }
    container.unshift({ name });
  }

  this.jsonp = container;
};

/**
 * 新增一个tag
 */
exports.addTag = function *addTag() {
  let name = validator.trim(this.request.body.name);
  name = validator.escape(name);
  let description = validator.trim(this.request.body.description);
  description = validator.escape(description);

  // 验证
  let editError;
  if (name === '') {
    editError = '标题不能是空的';
  }
  // END 验证

  if (editError) {
    this.status = 422;
    this.body = {
      error_msg: editError
    };
    return;
  }

  // 查询是否存在这个tag，不存在则添加
  const tag = yield Tag.getTagByName(name);

  if (tag) {
    if (description) {
      tag.description = description;
      tag.update_at = new Date();
      yield tag.save();

      this.body = {
        success: 1,
        tag_id: tag._id,
        msg: '更新成功'
      };
      return;
    }

    this.body = {
      error_msg: 'tag已存在'
    };
    return;
  }

  const tagSaved = yield Tag.newAndSave(name, description);
  this.body = { success: 1, tag_id: tagSaved._id };
};

/**
 * 关注标签
 */
exports.follow = function *follow() {
  const user = this.session.user;
  const tagId = validator.trim(this.params._id);
  if (!user) {
    this.body = { success: 0, msg: '未登录' };
    return;
  } else if (!tagId) {
    this.status = 403;
    this.body = { success: 0, msg: '未知的标签' };
  }

  this.body = { success: 1, msg: '', data: 1 };
};

/**
 * 取消关注标签
 */
exports.unFollow = function *unFollow() {

};
