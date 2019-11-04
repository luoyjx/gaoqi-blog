/**
 * 文章页
 * @authors luoyjx (yjk99@qq.com)
 * @date    2016-07-20 21:57:19
 */

$(function () {
  // 删除文章
  $('#delete_post').click(function () {
    var postId = $(this).data('id')
    if (postId && confirm('确定要删除此文章吗？')) {
      $.post('/post/' + postId + '/delete', { _csrf: $('#_csrf').val() }, function (result) {
        if (!result.success) {
          alert(result.message)
        } else {
          location.href = '/'
        }
      })
    }
    return false
  })

  // 编辑器相关
  $('textarea.editor').each(function () {
    var editor = new Editor({
      status: []
    })
    var $el = $(this)

    editor.render(this)
    // 绑定editor
    $(this).data('editor', editor)

    var $input = $(editor.codemirror.display.input)
    $input.keydown(function (event) {
      if (event.keyCode === 13 && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        $el.closest('form').submit()
      }
    })
  })
  // END 编辑器相关

  // 评论
  $('.replies').on('click', '.reply-btn', function (event) {
    var $btn = $(event.currentTarget)
    var editorWrap = $('#reply_form')
    var textarea = editorWrap.find('textarea.editor')
    var user = $btn.closest('.user-info').find('.reply-author').text().trim()
    var editor = textarea.data('editor')
    var cm = editor.codemirror
    cm.focus()
    if (cm.getValue().indexOf('@' + user) < 0) {
      editor.push('@' + user + ' ')
    }
  })

  $('#submit_reply').click(function () {
    var $btn = $(this).button('loading')
  })

  // 收藏文章
  $('.btn-collection').click(function () {
    var $this = $(this)
    var hasCollect = $this.hasClass('active')
    var url = '/post/' + $this.data('id') + (hasCollect ? '/un_collect' : '/collect') + '?_csrf=' + $('#_csrf').val()

    $.ajax({
      url: url
    })
      .done(function (result) {
        if (result.success) {
          if (hasCollect) {
            $this.removeClass('active')
          } else {
            $this.addClass('active')
          }
        }
      })
      .fail(function () {
        alert('收藏出错')
      })
  })
})
