/**
 * user home
 * @authors yanjixiong ()
 * @date    2016-12-18 20:08:10
 * @version $Id$
 */

$(function () {
  $('#btnFollow').click(function () {
    var $this = $(this)
    var hasFollow = $this.hasClass('btn-cancel')
    var id = $this.data('id')

    if (!id) {
      return alert('此用户无效')
    }

    $this.addClass('disabled')

    var url = hasFollow
      ? '/u/' + id + '/unfollow'
      : '/u/' + id + '/follow?'
    url = url + '?t=' + new Date().getTime()

    location.href = url
  })
})
