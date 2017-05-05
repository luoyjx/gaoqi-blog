/**
 * twitter helper
 * @authors yanjixiong 
 * @date    2017-02-06 20:46:19
 */

var Promise = require('bluebird');
var Twit = require('twit');
var config = require('../config');

var twitterClient = null;
if (config.twitter && config.twitter.consumer_key !== 'your consumer key') {
  twitterClient = new Twit(config.twitter);
}

/**
 * 发送一条twitter状态
 * @param  {[type]} content [description]
 * @return {[type]}         [description]
 */
exports.postStatus = function postStatus(content) {
  if (!twitterClient) return Promise.resolve();

  return new Promise(function (resolve, reject) {
    twitterClient.post('statuses/update', { status: content }, function(err, data, response) {
      if (err) {
        console.log(err);
        return resolve();
      }
      resolve(data);
    })
  })
}

