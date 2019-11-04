/*!
 * filter api
 */

var UserModel = require('../models').User
var validator = require('validator')

/**
 * 通过accesstoken查找用户
 * @param req
 * @param res
 * @param next
 */
var auth = function (req, res, next) {
  var accessToken = req.body.accesstoken || req.query.accesstoken
  accessToken = validator.trim(accessToken)
  console.log(accessToken)
  UserModel
    .findOne({ accessToken: accessToken })
    .exec()
    .then(function (user) {
      if (!user) {
        res.status(403)
        return res.send({ error_msg: 'wrong accessToken' })
      }
      req.user = user
      next()
    })
}

exports.auth = auth
