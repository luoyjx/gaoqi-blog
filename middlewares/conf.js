'use strict'

const config = require('../config')

exports.github = function * github (next) {
  if (config.GITHUB_OAUTH.clientID === 'your GITHUB_CLIENT_ID') {
    this.body = 'call the admin to set github oauth.'
    return
  }
  yield next
}
