'use strict';
/**
 * app router
 * @authors yanjixiong
 * @date    2017-02-20 09:25:08
 */

const router = require('koa-router')();
const index = require('./controllers/index');
const manage = require('./controllers/console/index');
const adminArticle = require('./controllers/console/article');
const adminCategory = require('./controllers/console/category');
const adminUser = require('./controllers/console/user');
const adminLink = require('./controllers/console/link');
const adminLinkGroup = require('./controllers/console/link_group');
const adminRole = require('./controllers/console/role');

const upload = require('./controllers/upload');

const auth = require('./middlewares/auth');

// routes definition
router.get('/', index.index);
router.get('/newestArticles', index.newestArticles);
router.get('/price', index.price);
router.get('/services', index.services);
router.get('/userAssistant', index.userAssistant);
router.get('/userCenter', index.userCenter);
router.get('/news', index.news);
router.get('/detail/:id', index.detail);

router.get('/console', manage.index);
router.get('/console/login', manage.showLogin);
router.post('/console/login', manage.login);
router.get('/console/logout', auth.userRequired, manage.logout);

router.get('/console/articles', auth.userRequired, adminArticle.list);
router.get('/console/articles/verify', auth.userRequired, adminArticle.verifyList);
router.get('/console/articles/create', auth.userRequired, adminArticle.create);
router.get('/console/articles/:id', adminArticle.show);
router.post('/console/articles/save', auth.userRequired, adminArticle.save);
router.post('/console/articles/verified', auth.userRequiredApi, adminArticle.verifiedByIds);
router.get('/console/articles/:id/edit', auth.userRequired, adminArticle.edit);
router.post('/console/articles/:id/update', auth.userRequired, adminArticle.update);
router.get('/console/articles/:id/remove', auth.userRequiredApi, adminArticle.remove);
router.get('/console/articles/:id/cancelVerified', auth.userRequiredApi, adminArticle.cancelVerified);
router.get('/console/articles/:id/top', auth.userRequiredApi, adminArticle.top);
router.get('/console/articles/:id/cancelTop', auth.userRequiredApi, adminArticle.cancelTop);

router.get('/console/categories', auth.userRequired, adminCategory.list);
router.post('/console/categories/save', auth.userRequiredApi, adminCategory.save);
router.post('/console/categories/:id/update', auth.userRequiredApi, adminCategory.update);
router.get('/console/categories/:id/remove', auth.userRequiredApi, adminCategory.removeById);

router.get('/console/users', auth.userRequired, adminUser.list);
router.get('/console/users/create', auth.userRequired, adminUser.create);
router.post('/console/users/save', auth.userRequired, adminUser.save);
router.get('/console/users/:id/edit', auth.userRequired, adminUser.edit);
router.post('/console/users/:id/update', auth.userRequired, adminUser.update);
router.post('/console/users/remove', auth.userRequiredApi, adminUser.removeByIds);
router.post('/console/users/authorizeBatch', auth.userRequiredApi, adminUser.authorize);
router.get('/console/users/:name/isExsist', auth.userRequiredApi, adminUser.isExsist);

router.get('/console/links', auth.userRequired, adminLink.list);
router.get('/console/links/create', auth.userRequired, adminLink.create);
router.post('/console/links/save', auth.userRequired, adminLink.save);
router.get('/console/links/:id/edit', auth.userRequired, adminLink.edit);
router.post('/console/links/:id/update', auth.userRequired, adminLink.update);
router.get('/console/links/:id/remove', auth.userRequiredApi, adminLink.removeById);

router.get('/console/linkGroups', auth.userRequired, adminLinkGroup.list);
router.get('/console/linkGroups/create', auth.userRequired, adminLinkGroup.create);
router.post('/console/linkGroups/save', auth.userRequired, adminLinkGroup.save);
router.get('/console/linkGroups/:id/edit', auth.userRequired, adminLinkGroup.edit);
router.post('/console/linkGroups/:id/update', auth.userRequired, adminLinkGroup.update);
router.get('/console/linkGroups/:id/remove', auth.userRequiredApi, adminLinkGroup.removeById);

router.post('/console/linkGroupItems/save', auth.userRequiredApi, adminLinkGroup.createGroupItem);
router.post('/console/linkGroupItems/:id/update', auth.userRequiredApi, adminLinkGroup.updateGroupItem);
router.get('/console/linkGroupItems/:id/remove', auth.userRequiredApi, adminLinkGroup.removeGroupItem);
router.get('/console/linkGroupItems/:id/enable', auth.userRequiredApi, adminLinkGroup.enableGroupItem);
router.get('/console/linkGroupItems/:id/disable', auth.userRequiredApi, adminLinkGroup.disableGroupItem);

router.get('/console/roles', auth.userRequired, adminRole.list);
router.get('/console/roles/create', auth.userRequired, adminRole.create);
router.post('/console/roles/save', auth.userRequired, adminRole.save);
router.get('/console/roles/:id/edit', auth.userRequired, adminRole.edit);
router.post('/console/roles/:id/update', auth.userRequired, adminRole.update);
router.get('/console/roles/:id/remove', auth.userRequiredApi, adminRole.removeById);
router.get('/console/roles/:name/isExsist', auth.userRequiredApi, adminRole.isExists);

router.post('/upload', auth.userRequiredApi, upload.upload);

module.exports = router;
