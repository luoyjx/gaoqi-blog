window._bd_share_main.F.module('component/anticheat', function (e, t, n) { var r = e('base/tangram').T; var i; var s; var o = function (e, t) { var n = r(t).offset(); var i = { left: e.pageX, top: e.pageY }; return { left: Math.floor(i.left - n.left), top: Math.floor(i.top - n.top) } }; var u = function (e, t) { typeof i === 'undefined' && (i = Math.floor(e.pageX), s = Math.floor(e.pageY)); if (t) { var n = o(e, t); r(t).data('over_x', n.left).data('over_y', n.top).data('over_time', +(new Date())) } }; var a = function (e, t) { var n = o(e, t); r(t).data('click_x', n.left).data('click_y', n.top) }; var f = function (e, t, n) { e == 'mouseenter' ? u(t, n) : e == 'mouseclick' && a(t, n) }; var l = function (e) { var t = r(e.__element); var n = e.__buttonType; var o = t.data('over_x') || 0; var u = t.data('over_y') || 0; var a = t.data('click_x'); var f = t.data('click_y'); var l = t.innerWidth(); var c = t.innerHeight(); var h = new Date() - t.data('over_time'); var p = document.body.offsetWidth; var d = document.body.offsetHeight; var v = window.screen.availWidth; var m = window.screen.availHeight; return [i, s, n > 0 ? 1 : 0, o, u, a, f, l, c, n, h, p, d, v, m].join('.') }; t.process = f, t.getSloc = l })
