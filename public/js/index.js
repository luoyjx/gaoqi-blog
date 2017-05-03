/**
 * Created by Administrator on 2017/3/2 0002.
 */
$(document).ready(function(){
    var req = new XMLHttpRequest();
    req.open("get", "/newestArticles", true);
    req.send();
    req.onreadystatechange = function (categoryName,id) {
        if (req.readyState == 4&&req.status == 200) {
            var text = req.responseText;
            var json = JSON.parse(text);
//        console.log(json)
            var categoryList = json.data;
//        console.log(categoryList);
            for(var i=0;i<categoryList.length;i++){
                var categoryName = categoryList[i].category.name;
                var categoryId=categoryList[i].category.id;
                var articleList = categoryList[i].articles;
//            var article_id= categoryList[j].articles[0].category_id;
                var id = categoryList[i].articles[0].id;
                $(".newsUl").append("<li><img src='/images/img/news01.jpg'/><p class='newsP1' >"+categoryName+"</p><ul class='tittleUl' categoryId="+categoryId+"></ul></li>");
                    for (var k = 0;k<articleList.length;k++){
                        var content = articleList[k].title;
                        var article_id= categoryList[i].articles[k].category_id;
                        var id =categoryList[i].articles[k].id;
                        var dateTime = articleList[k].update_time;
                        if(article_id==categoryId){
                            $(".tittleUl").eq(i).append("<li><a href='/detail/"+id+"' article_id='"+id+"'>"+content+"</a></li>");
                        }
                    }
                }
        }
    };
})