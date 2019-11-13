/*!
 * filter api
 */

const UserModel = require('../models').User
const validator = require('validator')

/**
 * 通过accesstoken查找用户
 * @param req
 * @param res
 * @param next
 */
const auth = async (req, res, next) => {
  let accessToken = req.body.accesstoken || req.query.accesstoken
  accessToken = validator.trim(accessToken)
  console.log(accessToken)
  const user = await UserModel.findOne({ accessToken: accessToken }).exec()

  if (!user) {
    res.status(403)
    return res.send({ error_msg: 'wrong accessToken' })
  }
  req.user = user
  next()
}

exports.auth = auth
