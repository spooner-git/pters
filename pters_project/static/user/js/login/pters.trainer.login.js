$(document).ready(function(){

    $("#idinput").keyup(function(){
        if($("#idinput input").val().length>0){
            $("#idimg").attr("src",'/static/user/res/login/icon-user-pink.png')
        }else{
            $("#idimg").attr("src",'/static/user/res/login/icon-user.png')
        }
    })

    $("#pwinput").keyup(function(){
        if($("#pwinput input").val().length>0){
            $("#pwimg").attr("src",'/static/user/res/login/icon-lock-pink.png')
        }else{
            $("#pwimg").attr("src",'/static/user/res/login/icon-lock.png')
        }
    })
});


function delete_token(device_id){
    $.ajax({
        url:'/login/delete_push_token/',
        type:'POST',
        data:{"device_id": device_id},

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            //AjaxBeforeSend();
        },

        //통신성공시 처리
        success:function(){
            console.log('토큰 삭제 완료')
        },

        //보내기후 팝업창 닫기
        complete:function(){

        },

        //통신 실패시 처리
        error:function(){

        }
    });
}


function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');