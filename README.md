# gaoqi-blog
基于Node.js的多人博客

暂时没有考虑windows部署,因为部分模块需要编译，linux下较方便
windows下需要安装VS express

* Node.js v0.12.1 (实际环境是iojs 2.3.3)
* mongodb v2.6(已经迁移到3.0版本的 wiredTiger 引擎)
* redis v2.6.13

## 安装运行

* 安装上面所需的3个环境
* `make install` 把依赖安装上
* 如果`config.js`中debug 未设置为true，则需要`make build`，压缩合并一下js、css文件
* 使用`node app.js`运行，推荐`pm2`管理应用进程，`npm i -g pm2` 安装后使用`make start`
* `make restart`重新编译重启，`make reboot`直接重启
* 浏览`http://localhost:3001`