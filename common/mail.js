var mailer        = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('../config');
var util = require('util');

var transport = mailer.createTransport(smtpTransport(config.mail_opts));
var SITE_ROOT_URL = 'http://' + config.host+(config.port?':'+config.port:config.port);

/**
 * Send an email
 * @param {Object} data 邮件对象
 */
var sendMail = function (data) {
  // 遍历邮件数组，发送每一封邮件，如果有发送失败的，就再压入数组，同时触发mailEvent事件
  transport.sendMail(data, function (err) {
    if (err) {
      // 写为日志
      console.log(err);
    }
    console.log('');
  });
};
exports.sendMail = sendMail;

/**
 * 发送激活通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 */
exports.sendActiveMail = function (who, token, name) {
  var from = util.format('%s <%s>', config.name, config.mail_opts.auth.user);
  var to = who;
  var subject = config.name + ' 帐号激活';
  var html = '<p>您好：' + name + '</p>' +
    '<p>我们收到您在' + config.name + '的注册信息，请点击下面的链接来激活帐户：</p>' +
    '<a href="' + SITE_ROOT_URL + '/active_account?key=' + token + '&name=' + name + '">激活链接</a>' +
    '<p>若您没有在' + config.name + '填写过注册信息，说明有人滥用了您的电子邮箱，请忽略或删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>' + config.name + ' 谨上。</p>';

  exports.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};

/**
 * 发送密码重置通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 */
exports.sendResetPassMail = function (who, token, name) {
  var from = util.format('%s <%s>', config.name, config.mail_opts.auth.user);
  var to = who;
  var subject = config.name + ' 密码重置';
  var html = '<p>您好：' + name + '</p>' +
    '<p>我们收到您在' + config.name + '重置密码的请求，请在24小时内单击下面的链接来重置密码：</p>' +
    '<a href="' + SITE_ROOT_URL + '/reset_pass?key=' + token + '&name=' + name + '">重置密码链接</a>' +
    '<p>若您没有在' + config.name + '填写过注册信息，说明有人滥用了您的电子邮箱，请忽略或删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>' + config.name + ' 谨上。</p>';

  exports.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};

/**
 * 发送回复评论等提醒邮件
 * @param who 目标邮箱
 * @param name 目的用户名
 * @param author 发起的用户名
 * @param post_title 文章标题
 * @param post_id 文章id
 * @param reply_id 评论id
 */
exports.sendNotificationMail = function(who, name, author, post_title, post_id, reply_id) {
  var from = util.format('%s <%s>', config.name, config.mail_opts.auth.user);
  var to = who;
  var subject = author + ' 在主题中提到了您';

  var html = '<div style="height: 100%; background: #444; padding: 80px 0; margin: 0; font-size: 14px; line-height: 1.7; font-family: \'Helvetica Neue\', Arial, sans-serif; color: #444;">' +
    '<center>' +
  '<div style="margin: 0 auto; width: 580px; background: #FFF; box-shadow: 0 0 10px #333; text-align:left;">' +
    '<div style="margin: 0 40px; color: #999; border-bottom: 1px dotted #DDD; padding: 40px 0 30px; font-size: 13px; text-align: center;">'+
    '<a href="' + SITE_ROOT_URL + '" target="_blank" style="text-decoration: none;"><h1 style="color: #3498db;">搞起博客</h1></a>' +
  '</div>' +
  '<div style="padding: 30px 40px 40px;">'+ name +' 您好, <a style="color: #3498db; text-decoration: none;" href="'+ SITE_ROOT_URL +'/u/' + author + '" target="_blank">' + author +  '</a> 在主题中提到您<br><br>'+
  '<div style="border-left: 5px solid #DDD; padding: 0 0 0 24px; color: #888;">' +
    '<a style="color: #3498db; text-decoration: none; font-weight: bold;" href="'+ SITE_ROOT_URL +'/p/' + (reply_id ? [post_id, '#', reply_id].join('') : post_id) + '" target="_blank">' + post_title + '</a></div></div>' +
    '<div style="background: #EEE; border-top: 1px solid #DDD; text-align: center; height: 90px; line-height: 90px;"><a href="'+ SITE_ROOT_URL +'/p/' + (reply_id ? [post_id, '#', reply_id].join('') : post_id) + '" style="padding: 8px 18px; background: #3498db; color: #FFF; text-decoration: none; border-radius: 3px;" target="_blank">查看详情 ➔</a></div></div><br>'+
  '</div>'+
  '</center>'+
  '</div>';

  exports.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};