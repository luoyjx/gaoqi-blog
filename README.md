gaoqi-blog
=

[![build status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]

[travis-image]: https://img.shields.io/travis/luoyjx/gaoqi-blog/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/luoyjx/gaoqi-blog
[coverage-image]: https://img.shields.io/coveralls/luoyjx/gaoqi-blog.svg?style=flat-square
[coverage-url]: https://coveralls.io/r/luoyjx/gaoqi-blog?branch=master
[david-image]: https://img.shields.io/david/luoyjx/gaoqi-blog.svg?style=flat-square
[david-url]: https://david-dm.org/luoyjx/gaoqi-blog
[node-image]: https://img.shields.io/badge/node.js-%3E=_4.1.1-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

基于Node.js的多人博客

* Node.js 4.1.1
* mongodb v2.6(已经迁移到3.0版本的 wiredTiger 引擎，可使用2.6，不影响)
  迁移过程看这里
  http://blog.gaoqixhb.com/p/55cb5fc17c68e69a01af69aa
* redis v2.6.13

# 安装运行

[![Greenkeeper badge](https://badges.greenkeeper.io/luoyjx/gaoqi-blog.svg)](https://greenkeeper.io/)

* 安装上面所需的3个环境
* 安装依赖 `npm install`
* js、css压缩合并 `npm run build`
* 开发环境启动 `npm run dev`
* 生产环境启动 `npm start` 
* 生产环境重启 `npm restart`
* 生产环境快速重启 `make reboot` 
* 访问 `http://localhost:3001`

# test

* `npm test`

# coverage

* `npm run test-cov`

# changelog

## 1.0.5  / 2017-01-04
* 百度分享
* 文章收藏

## 1.0.4  / 2016-12-18
* 关注、取消关注

## 1.0.3  / 2016-12-12
* 关注用户
* 文章收藏
* 页面加载进度条
* statd响应时间监控
* 结巴分词

## 1.0.2  / 2016-11-21
* 样式调整
* 用户信息卡片

## 1.0.1  / 2016-10-25
* 重构config files
* 更新readme
* 移除`Makefile`，全部使用`npm scripts`代替

## 1.0.0  / 2016-10-21
* 界面重构

## 0.0.10 / 2016-7-16
* 升级依赖
* sitemap加入tag
* 补充测试

## 0.0.9 / 2016-6-19
* callback重构为promise实现 #21
* 移除未使用包
* 首页导航样式调整
* 首页文章列表按更新时间排序
* config cdn域名合并为一个域名减少dns解析时间
* 切换到ioredis
* 站点https化(let's Encrypt)
* 去掉文章描述
* tag 样式变得更轻更友好 #31
* 同一分类无需分类标签，可增加一项【全部】分类 #22
* 文章列表样式修改

## 0.0.8 / 2016-3-11
* 分类tag颜色配置
* npm scripts添加build指令来兼容windows
* 升级nodemailer
* <del>用户头像判断</del>

## 0.0.7 / 2016-1-10
* 更新 oneapm@1.2.16
* 添加travis
* 更换bcrypt到bcryptjs
* 删除一些不需要的package依赖

## 0.0.6 / 2015-9-29
* 更新 oneapm npm 模块
* 首页标签旁边连接加上title
* 更新bcrypt 到 0.8.5

## 0.0.5 / 2015-9-13
* 邮件提醒功能

## 0.0.4 / 2015-8-18
* 推送分类
* 消息提醒功能

## 0.0.3 / 2015-8-16
* 修改个人设置
* 修改密码
* 找回密码功能

## 0.0.3 / 2015-7-13
* 个人主页初步成型
* 路径导航

## 0.0.2 / 2015-6-22
* 个人设置原型
* 个人主页原型
* 加入分类
* 修改部分样式

## 0.0.1 / 2015-6-4
* 关注标签，原型
* update package.json
* update readme
* 部分功能完成
* Initial commit


# License
MIT
