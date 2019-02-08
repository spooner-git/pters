let layer_popup = (function(){
    let popup_array = [];
    return function (option, popup_name){
        // func_get_layer_popup_html(popup_name, "callback", function(){
            func_layer_popup(option, popup_name, popup_array);
        // })
    }
}());

//Ajax로 팝업 html을 통째로 들고온다.
function func_get_layer_popup_html(popup_name, use, callback){
    $.ajax({
            url: `/trainee/popup/trainee_${popup_name}/`,
            type : 'GET',
            // data : {"date": input_reference_date, "day":31},
            dataType : 'html',

            beforeSend:function(){
                //beforeSend();
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    // $('#errorMessageBar').show();
                    // $('#errorMessageText').text(jsondata.messageArray);
                }else{
                    if(use == "callback"){
                        callback(jsondata);
                    }
                }

            },

            complete:function(){
                //completeSend();
            },

            error:function(){
                console.log('server error');
            }
        });
}

function func_layer_popup(option, popup_name, popup_array){
    switch(option){
        case OPEN:
            //첫 팝업의 경우 옆으로 밀려나도록 보이는 효과
            if(popup_array.length == 0){
                $('nav, .content_page').css({
                    "transform":"translateX(-100%)",
                    "transition":"transform 0.3s ease-in-out"
                });
            }
            //똑같은 팝업 여러개 못뜨도록
            if(popup_array.indexOf(popup_name) == -1){
                popup_array.push(popup_name);
                $(`.${popup_name}`).parents('.popup_mobile').css({
                    "transform":"translateX(0)",
                    "transition":"transform 0.3s ease-in-out",
                    "z-index":100*popup_array.length
                });
                $(`.${popup_name}`).css({"height":windowHeight - 95 + 'px', "overflow-y":"auto"});
            }
        break;
        case CLOSE:
            //혹시 있을 pop 에러 방지
            if(popup_array.length > 0){
                popup_name = popup_array.pop();
                //첫 팝업의 경우 옆에서 다시 당겨오도록 보이는 효과 , side 제외
                if(popup_array.length == 0){
                    $('nav, .content_page').css({
                        "transform":"translateX(0%)",
                        "transition":"transform 0.3s ease-in-out"
                    });
                }
                $(`.${popup_name}`).parents('.popup_mobile').css({"transform":"translateX(100%)"});
            }
        break;
        case ALL_CLOSE:
            let popup_len = popup_array.length;
            for(let i=0; i<popup_len; i++){
                popup_name = popup_array.pop();
                $(`.${popup_name}`).parents('.popup_mobile').css({"transform":"translateX(100%)"});
            }
            //팝업 전부 닫고 옆에서 다시 당겨오도록 보이는 효과 , side 제외
            $('nav, .content_page').css({
                "transform": "translateX(0%)",
                "transition": "transform 0.3s ease-in-out"
            });
        break;
    }
}
