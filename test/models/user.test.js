/* ！
 * user test
 * Copyright(c) 2016 yanjixiong <yjk99@qq.com>
 */
const UserModel = require('../../models').User

describe('test/models/user.test.js', function() {
  it('should return dao avatar url', function() {
    const user = new UserModel({ email: 'yjk99@qq.com' })
  })
})
