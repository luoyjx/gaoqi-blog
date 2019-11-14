/**
 * twitter helper
 * @authors yanjixiong
 * @date    2017-04-28 21:05:06
 */

'use strict'

const Promise = require('bluebird')
const Twit = require('twit')
const config = require('../config')
let twitterClient = null
if (config.twitter && config.twitter.consumer_key !== 'your consumer key') {
  twitterClient = new Twit(config.twitter)
}
/**
 * 发送一条twitter状态
 * @param  {[type]} content [description]
 * @return {[type]}         [description]
 */
exports.postStatus = content => {
  if (!twitterClient) return Promise.resolve()
  return new Promise((resolve, reject) => {
    twitterClient.post(
      'statuses/update',
      { status: content },
      (err, data, response) => {
        if (err) {
          console.log(err)
          return resolve()
        }
        resolve(data)
      }
    )
  })
}
