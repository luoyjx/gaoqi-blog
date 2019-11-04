gaoqi-blog
=

[![build status][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/luoyjx/gaoqi-blog.svg)](https://greenkeeper.io/)

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

[changelog](changelog.md)

# License
MIT
