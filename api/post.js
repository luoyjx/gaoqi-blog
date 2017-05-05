'use strict';

const validator = require('validator');
const Post = require('../services/post');
const User = require('../services/user');
const Tag = require('../services/tag');
const html2md = require('html2markdown');

/**
 * 通过api接口添加文章
 * @param req
 * @param res
 * @param next
 */
exports.create = function *create() {
  let category = validator.trim(this.request.body.category);
  category = validator.escape(category);
  let title = validator.trim(this.request.body.title);
  title = validator.escape(title); // escape 将html 等特殊符号 标签转义
  let description = validator.trim(this.request.body.description);
  description = validator.escape(description);
  let content = validator.trim(this.request.body.content);
  const tags = validator.trim(this.request.body.tags);
  const isHtml = isNaN(validator.trim(this.request.body.is_html)) ?
    1 : parseInt(validator.trim(this.request.body.is_html), 10); // 文章内容是否为html，是则转换为markdown

  // 验证
  let editError;
  if (title === '') {
    editError = '标题不能是空的。';
  } else if (title.length < 5 || title.length > 100) {
    editError = '标题字数太多或太少。';
  } else if (category === '') {
    editError = '必须选择一个分类，没有可用unknown';
  } else if (description === '') {
    editError = '描述不能为空，字数在300字以内';
  } else if (content === '') {
    editError = '内容不可为空';
  }
  // END 验证

  if (editError) {
    this.status = 422;
    this.body = {
      error_msg: editError
    };
    return;
  }

  let tagArr = tags ? tags.split(',') : [];
  content = isHtml === 1 ? html2md(content) : content; // 转换html成markdown格式

  const post = yield Post.newAndSave(title, description, content, this.user._id, tagArr, category);
  const user = yield User.getUserById(this.user._id);

  user.score += 5;
  user.post_count += 1;
  user.save();
  this.user = user;
  this.body = {
    success: 1,
    post_id: post._id
  };

  tagArr = tagArr.length > 0 ? tagArr : [];
  tagArr.forEach(function (tag) {
    Tag.newAndSave(tag, '');
  });
};
