function gotoTop(min_height){
  if(browserRedirect() == "phone"){
    return;
  }
  var $goTop = $("#gotoTop");
  $goTop.fadeOut(0);
  $goTop.click(//定义返回顶部点击向上滚动的动画
    function(){$('html,body').animate({scrollTop:0},700);
    }).hover(//为返回顶部增加鼠标进入的反馈效果，用添加删除css类实现
    function(){$(this).addClass("hover");},
    function(){$(this).removeClass("hover");
    });
  //获取页面的最小高度，无传入值则默认为600像素
  min_height = min_height || 600;
  //为窗口的scroll事件绑定处理函数
  $(window).scroll(function(){
    //获取窗口的滚动条的垂直位置
    var s = $(window).scrollTop();
    //当窗口的滚动条的垂直位置大于页面的最小高度时，让返回顶部元素渐现，否则渐隐
    if( s > min_height){
      $("#gotoTop").fadeIn(100);
    }else{
      $("#gotoTop").fadeOut(200);
    }
  });
}
function browserRedirect() {
  var sUserAgent = navigator.userAgent.toLowerCase();
  var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
  var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
  var bIsMidp = sUserAgent.match(/midp/i) == "midp";
  var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
  var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
  var bIsAndroid = sUserAgent.match(/android/i) == "android";
  var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
  var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
  if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
    return "phone";
  } else {
    return "pc";
  }
}

/**
 * 标签关注按钮操作
 */
function tagFollowAction () {
  $('.tagfollow').click(function () {
    var id = $(this).data('id');
    var isFollowed = $(this).hasClass('active');

    $.ajax({
      url: '/api/tags/' + id + '/' + (isFollowed ? 'unFollow' : 'follow'),
      type: 'GET',
      success: function (data) {
        if (data && data.success) {
          console.log('follows  ' + data.data);
        }
      }
    });
  });
}

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
  if(browserRedirect() != "phone"){
    //$('.ad-right').scrollToFixed({ marginTop: 60});
  } else {
    $('nav').scrollToFixed();
  }
  $('.markdown-text a,.reply-list a').attr('target', '_blank');
  var $hm_header = $('.hm-t-header');
  $hm_header.css('padding', 0);
  $hm_header.css('border', 0);
  tagFollowAction();
  // pretty code
  prettyPrint();
  gotoTop();
});



