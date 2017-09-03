/**
 * redis client
 */
'use strict'

const config = require('../config')
const Redis = require('ioredis')

const client = new Redis({
  port: config.redis_port,
  host: config.redis_host,
  db: config.redis_db,
  dropBufferSupport: true
})

client.on('error', function (err) {
  if (err) {
    console.error('connect to redis error, check your redis config', err)
    process.exit(1)
  }
})

exports = module.exports = client
