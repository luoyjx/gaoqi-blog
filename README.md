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

暂时没有考虑windows部署,因为部分模块需要编译，linux下较方便
windows下需要安装VS express

* Node.js v0.12.1 (实际环境是iojs 4.1.1)
* mongodb v2.6(已经迁移到3.0版本的 wiredTiger 引擎，可使用2.6，不影响)
  迁移过程看这里
  http://blog.gaoqixhb.com/p/55cb5fc17c68e69a01af69aa
* redis v2.6.13

## 安装运行

* 安装上面所需的3个环境
* `make install` 把依赖安装上
* 如果`config.js`中debug 未设置为true，则需要`make build`，压缩合并一下js、css文件
* 使用`node app.js`运行，推荐`pm2`管理应用进程，安装后使用`make start`
* `make restart`重新编译重启，`make reboot`直接重启
* 浏览`http://localhost:3001`

## 版本日志
* [history](https://github.com/luoyjx/gaoqi-blog/blob/master/History.md)

## License
MIT
