/*!
 * web rest api
 */
var express = require('express')
var tag = require('./api/tag')
var post = require('./api/post')
var filter = require('./api/filter')

var router = express.Router()

router.get('/tag/search', tag.searchTagsByName)// 搜索标签
router.get('/tags/:_id/follow', tag.follow)// 关注标签
router.get('/tags/:_id/unfollow', tag.unFollow)// 取消关注标签
router.post('/tag/add', filter.auth, tag.addTag)

router.post('/post/add', filter.auth, post.create)// 添加文章

module.exports = router
