/* ！
 * user test
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */
var UserModel = require('../../models').User

describe('test/models/user.test.js', function () {
  it('should return dao avatar url', function () {
    var user = new UserModel({ email: 'yjk99@qq.com' })
  })
})
