/**
 * wrap middleware
 * Created by yanjixiong <yanjixiong@mye.hk> on 2016/5/24 0024.
 */

exports = module.exports = {
  render: function(req, res, next) {
    res.wrapRender = function wrap(view, options) {
      if (res.headersSent) return;
      res.render(view, options);
    };
    next()
  },

  send: function(req, res, next) {
    res.wrapSend = function wrap(data) {
      if (res.headersSent) return;
      res.send(data);
    };
    next()
  }
};

