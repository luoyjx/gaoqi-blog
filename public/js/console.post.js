$(function () {
  $('.action-top').click(function () {
    var $this = $(this)
    var url = $this.hasClass('active')
      ? '/post/' + $this.data('id') + '/unTop'
      : '/post/' + $this.data('id') + '/top'
    if (confirm('确定顶置此文章?')) {
      $.ajax({
        url: url
      })
      .done(function (result) {
        if (result.success) {
          $this.addClass('active')
          location.reload()
        }
      })
    }
  })
})
