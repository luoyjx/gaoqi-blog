(function () {
  var editor = new Editor()
  editor.render($('.editor')[0])
  $('#create_topic_form').on('submit', function (e) {
    var tags = ''
    $('input.select-tag').each(function (index, item) {
      tags += (tags === '') ? item.value : ',' + item.value
    })
    $('#tags').val(tags)
  })
  $('#tag_autocomplete').autocomplete('/api/tag/search', {
    dataType: 'jsonp', // json类型
    parse: function (data) {
      return $.map(data, function (row) {
        return {
          data: row,
          value: row.name,
          result: row.name
        }
      })
    },
    formatItem: function (item) {
      return item
    },
    highlight: function (value, term) {
      return value.name.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, '\\$1') + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<strong>$1</strong>')
    }
  }).result(function (e, item) {
    var $tags = $('.select-tag')
    if ($tags) {
      var hasSameTag = false
      $.each($tags, function (index, tag) {
        if (tag.value == item.name) {
          hasSameTag = true
        }
      })
      if (hasSameTag) {
        $('#tag_autocomplete').val('')
        return
      }
    }
    var tagHtml = [
      '<div class="form-group">',
      '<div class="input-group">',
      '<input type="text" class="form-control select-tag input-sm" id="exampleInputAmount" placeholder="" disabled="disabled" value="' + item.name + '">',
      '<a class="input-group-addon tagClose" href="javascript:void(0);">&times;</a>',
      '</div>',
      '</div>'
    ].join('')
    $(tagHtml).appendTo('.input-tags')
    $('#tag_autocomplete').val('')
    $('.tagClose').click(function () {
      $(this).parent().parent().remove()
    })
  })
})()
