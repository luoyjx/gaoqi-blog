!window._bd_share_is_recently_loaded && window._bd_share_main.F.module('component/comm_tools', function (e, t) { var n = function () { var e = window.location || document.location || {}; return e.href || '' }; var r = function (e, t) { var n = e.length; var r = ''; for (var i = 1; i <= t; i++) { var s = Math.floor(n * Math.random()); r += e.charAt(s) } return r }; var i = function () { var e = (+(new Date())).toString(36); var t = r('0123456789abcdefghijklmnopqrstuvwxyz', 3); return e + t }; t.getLinkId = i, t.getPageUrl = n })
