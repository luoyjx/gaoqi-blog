function gotoTop (min_height) {
  if (browserRedirect() == 'phone') {
    return
  }
  var $goTop = $('#gotoTop')
  $goTop.fadeOut(0)
  $goTop.click( // 定义返回顶部点击向上滚动的动画
    function () {
      $('html,body').animate({
        scrollTop: 0
      }, 700)
    }).hover( // 为返回顶部增加鼠标进入的反馈效果，用添加删除css类实现
    function () {
      $(this).addClass('hover')
    },
    function () {
      $(this).removeClass('hover')
    })
  // 获取页面的最小高度，无传入值则默认为600像素
  min_height = min_height || 600
  // 为窗口的scroll事件绑定处理函数
  $(window).scroll(function () {
    // 获取窗口的滚动条的垂直位置
    var s = $(window).scrollTop()
    // 当窗口的滚动条的垂直位置大于页面的最小高度时，让返回顶部元素渐现，否则渐隐
    if (s > min_height) {
      $('#gotoTop').fadeIn(100)
    } else {
      $('#gotoTop').fadeOut(200)
    }
  })
}

function browserRedirect () {
  var sUserAgent = navigator.userAgent.toLowerCase()
  var bIsIpad = sUserAgent.match(/ipad/i) == 'ipad'
  var bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os'
  var bIsMidp = sUserAgent.match(/midp/i) == 'midp'
  var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4'
  var bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb'
  var bIsAndroid = sUserAgent.match(/android/i) == 'android'
  var bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce'
  var bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile'
  if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
    return 'phone'
  } else {
    return 'pc'
  }
}

/**
 * 标签关注按钮操作
 */
function tagFollowAction () {
  $('.tagfollow').click(function () {
    var id = $(this).data('id')
    var isFollowed = $(this).hasClass('active')

    $.ajax({
      url: '/api/tags/' + id + '/' + (isFollowed ? 'unFollow' : 'follow'),
      type: 'GET',
      success: function (data) {
        if (data && data.success) {
          console.log('follows  ' + data.data)
        }
      }
    })
  })
}

$(document).ready(function () {
  NProgress.done()
  $('[data-toggle="tooltip"]').tooltip()
  if (browserRedirect() != 'phone') {
    // $('.ad-right').scrollToFixed({ marginTop: 60});
    $('#bd_share').scrollToFixed({ marginTop: 20 })
  } else {
    $('nav').scrollToFixed()
  }
  $('.markdown-text a,.reply-list a').attr('target', '_blank')
  var $hm_header = $('.hm-t-header')
  $hm_header.css('padding', 0)
  $hm_header.css('border', 0)
  tagFollowAction()
  // pretty code
  prettyPrint()
  gotoTop()

  /**
   *   检测用户注册时填写信息的合法性，提示检测状态，页头信息栏提示具体的错误
   */
  var isAllValid = true
  var alertBox = $('#signup_form').prev()
  var checkValidationOfInput = function (event) {
    var input = $(this)
    var value = input.val()
    var parentOfInput = input.parent().parent()
    var valid = event.data.validator && event.data.validator(value)

    isAllValid = isAllValid && valid
    if (valid) {
      parentOfInput.removeClass('has-error').hasClass('has-success') ||
          parentOfInput.addClass('has-success')
      alertBox.removeClass('alert-danger').addClass('alert-success')
        .children(':last').text(event.data.hint)
    } else {
      parentOfInput.removeClass('has-success').hasClass('has-error') ||
          parentOfInput.addClass('has-error')
      alertBox.removeClass('alert-success').addClass('alert-danger')
        .children(':last').text(event.data.hint)
    }
  }

  // 用户名必须大于等于5个字符
  $('#loginname').blur({
    validator: function (value) {
      if (value.length >= 5) {
        if ((/^[a-zA-Z0-9\-_]+$/i).test(value)) {
          this.hint = '用户名合法'
          return true
        } else {
          this.hint = '用户名只能使用a到z大小写，数字，\\-_'
        }
      } else {
        this.hint = '用户名必须大于5个字符'
      }
      return false
    }
  }, checkValidationOfInput)

  // 密码必须填写，不能为空
  $('#pass').blur({
    validator: function (value) {
      if (!validator.isNull(value)) {
        this.hint = '密码合法'
        return true
      }
      this.hint = '密码必须填写，不能为空'
      return false
    }
  }, checkValidationOfInput)

  // 重复密码必须和密码相同，重复密码必须填写，不能为空
  $('#re_pass').blur({
    validator: function (value) {
      if (!validator.isNull(value)) {
        if ($('#pass').val() === value) {
          this.hint = '重复密码合法'
          return true
        } else {
          this.hint = '重复密码必须和密码相同'
        }
      } else {
        this.hint = '重复密码必须填写，不能为空'
      }
      return false
    }
  }, checkValidationOfInput)

  // 邮箱必须符合EMail格式
  $('#email').blur({
    validator: function (value) {
      if (validator.isEmail(value)) {
        this.hint = '邮箱合法'
        return true
      }
      this.hint = '邮箱必须符合EMail格式'
      return false
    }
  }, checkValidationOfInput)

  // 提交表单前，检测全部用户输入合法性，只有全部合法才提交表单，提示检测状态
  $('#signup_form').submit(function (event) {
    isAllValid = true
    $('#loginname').triggerHandler('blur')
    $('#pass').triggerHandler('blur')
    $('#re_pass').triggerHandler('blur')
    $('#email').triggerHandler('blur')
    return isAllValid
  })
})
