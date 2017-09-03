'use strict'

const UserModel = require('../models').User
const validator = require('validator')

/**
 * 通过accesstoken查找用户
 */
const auth = function * auth (next) {
  let accessToken = this.request.body.accesstoken || this.query.accesstoken
  accessToken = validator.trim(accessToken)
  console.log(accessToken)
  const user = yield UserModel.findOne({ accessToken }).exec()

  if (!user) {
    this.status = 403
    this.body = { error_msg: 'wrong accessToken' }
    return
  }
  this.user = user

  yield next
}

exports.auth = auth
