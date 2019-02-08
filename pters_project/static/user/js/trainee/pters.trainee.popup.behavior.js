let layer_popup = (function(){
    let popup_array = [];
    return function (option, popup_name){
        func_layer_popup(option, popup_name, popup_array);

    }
}());

//Ajax로 팝업 html을 통째로 들고온다.
function func_get_layer_popup_html(popup_name, use, callback){
    $.ajax({
            url: `/trainee/${popup_name}/`,
            type : 'GET',
            dataType : 'html',

            beforeSend:function(xhr){
                if($(`.${popup_name}`).length > 0){
                    xhr.abort();
                    callback();
                }else{
                    ajax_load_image('show');
                }
            },

            success:function(data){
                func_draw_layer_popup_html(data);
                if(use == "callback"){
                    setTimeout(function(){
                        callback();
                    }, 0);
                }
            },

            complete:function(){
                ajax_load_image('hide');
            },

            error:function(){
                console.log('server error');
            }
        });
}

function func_draw_layer_popup_html(data){
    $('body').append(data);
}

function func_layer_popup(option, popup_name, popup_array){
    switch(option){
        case OPEN:

            func_get_layer_popup_html(popup_name, "callback", function(){
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
            });


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
                let $popup = $(`.${popup_name}`).parents('.popup_mobile');
                $popup.css({"transform":"translateX(100%)"});
                //팝업이 옆으로 닫히는 애니메이션이 종료된후 해당 팝업의 html을 지운다.
                setTimeout(function(){
                    $popup.remove();
                }, 300);
                
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
            //팝업이 옆으로 닫히는 애니메이션이 종료된후 해당 팝업의 html을 지운다.
            setTimeout(function(){
                $('.popup_mobile').remove();
            }, 300);
        break;
    }
}
