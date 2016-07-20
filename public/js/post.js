(function() {
  var editor = new Editor();
  editor.render($('.editor')[0]);
  $('#create_topic_form').on('submit', function(e) {
    var tags = '';
    $('input.select-tag').each(function(index, item) {
      tags += (tags === '') ? item.value : ',' + item.value;
    });
    $('#tags').val(tags);
  });

  $('#tag_autocomplete').autocomplete('/api/tag/search', {
    dataType: "jsonp", //json类型
    parse: function(data) {
      return $.map(data, function(row) {
        return {
          data: row,
          value: row.name,
          result: row.name
        }
      });
    },
    formatItem: function(item) {
      return item;
    },
    highlight: function(value, term) {
      return value.name.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
    }
  }).result(function(e, item) {
    var $tags = $('.select-tag'),
      tagHtml = [
        '<div class="col-md-3 tag-col-gutter-vertical">',
        '<div class="input-group">',
        '<input type="text" class="form-control select-tag input-sm" id="exampleInputAmount" placeholder="" disabled="disabled" value="' + item.name + '">',
        '<a class="input-group-addon tag-close" href="javascript:void(0);">&times;</a>',
        '</div>',
        '</div>'
      ].join("");

    if ($tags) {
      var hasSameTag = false;
      $.each($tags, function(index, tag) {
        if (tag.value == item.name) {
          hasSameTag = true;
        }
      });
      if (hasSameTag) {
        $('#tag_autocomplete').val('');
        return;
      }
    }

    var tag = new Tag(item.name);
    tag.open();
    $('#tag_autocomplete').val('');
  });

  //点击标签右边的关闭按钮删除标签
  $(".tag-close").on("click", function(event) {
    var tagGroup = Tag.getTagGroup()
    $(this).parent().parent().remove();

    if (tagGroup.children().length === 0) {
      tagGroup.remove();
      Tag.setTagGroup(null);  // 所有标签共享的标签组失效，下次添加标签重新创建
    }
  });

  /*
    标签对象
   */
  var Tag = null;
  (function() {

    var TAG_TEMPLET = [
        '<div class="col-md-3 tag-col-gutter-vertical">',
        '<div class="input-group">',
        '<input type="text" class="form-control select-tag input-sm" placeholder="" disabled="disabled" value="">',
        '<a class="input-group-addon tag-close" href="javascript:void(0);">&times;</a>',
        '</div>',
        '</div>'
      ].join(""),
      tagGroup = ($('#tagGroup').length !== 0 && $('#tagGroup')) || null;

    Tag = function(name) {
      var tagName = name,
        tagObj = $(TAG_TEMPLET);

      tagObj.find('input').val(tagName);

      this.getTagObj = function() {
        return tagObj;
      }
      this.getTagName = function() {
        return tagName;
      }
      this.setTagName = function(name) {
        tagName = name;
      }
      this.setTagObj = function(o) {
        tagObj = o;
      }

      return this;
    }
    Tag.getTagTemplet = function() {
      return TAG_TEMPLET;
    }
    Tag.getTagGroup = function() {
      return tagGroup;
    }
    Tag.setTagGroup = function(tg) {
      tagGroup = tg;
    }
    Tag.prototype = {
      constructor: Tag,
      open: function() {

        if (!tagGroup)
        //检测放置标签的id为tagGroup标签组，不存在创建它
          tagGroup = ($('#tagGroup').length && $('#tagGroup')) ||
          $('<div class="form-group" id="tagGroup"></div>').insertBefore($('input[name="tags"]'));

        this.addTagToGroup();

        this.getTagObj().find('.tag-close').on("click", function() {
          var tagGroup = Tag.getTagGroup()
          $(this).parent().parent().remove();

          if (tagGroup.children().length === 0) {
            tagGroup.remove();
            Tag.setTagGroup(null);
          }
        });
      },

      /*
        插入标签tag到标签组tag-group中，没有标签组tag-group则创建它
       */
      addTagToGroup: function() {
        tagGroup.append(this.getTagObj());
      }
    };
    return Tag;
  })();
})();