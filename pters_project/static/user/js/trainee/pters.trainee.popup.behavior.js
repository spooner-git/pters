/*슬라이드 팝업에 대한 동작*/

let layer_popup = (function(){
    let popup_array = [];

    function func_open_layer_popup(popup_name, popup_size){
        let $popup_selector;
        let popup_data = {};
        //똑같은 팝업 여러개 못뜨도록
        if(popup_array.indexOf(popup_data.popup_name) == -1){
            popup_data = {"popup_name":popup_name, "popup_size":popup_size};
            popup_array.push(popup_data);

            $popup_selector = $(`.${popup_name}`).parents('.popup_mobile');
            if(popup_size==POPUP_SIZE_FULL) {
                $(`.${popup_name}`).css({"height": windowHeight - 95 + 'px', "overflow-y": "auto"});
            }
            $popup_selector.css({"z-index":100*popup_array.length});
        }
        return popup_data;
    }

    function func_close_layer_popup(){
        let popup_data = {};
        //혹시 있을 pop 에러 방지
        if(popup_array.length > 0){
            popup_data = popup_array.pop();
            let $popup_selector = $(`.${popup_data.popup_name}`).parents('.popup_mobile');
            //팝업이 옆으로 닫히는 애니메이션이 종료된후 해당 팝업의 html을 지운다.
            setTimeout(function(){
                $popup_selector.css({"z-index":0});
                $(`#${popup_data.popup_name}`).remove();
            }, 300);
        }
        return popup_data;
    }

    function func_all_close_layer_popup(){
        let popup_data = {};
        let popup_len = popup_array.length;
        for(let i=0; i<popup_len; i++){
            popup_data = popup_array.pop();
            let $popup_selector = $(`.${popup_data.popup_name}`).parents('.popup_mobile');
            //팝업이 옆으로 닫히는 애니메이션이 종료된후 해당 팝업의 html을 지운다.
            setTimeout(function(){
                $popup_selector.css({"transform": "translateX(100%)", "z-index":0});
                $(`#${popup_data.popup_name}`).remove();
            }, 300);
        }
        return popup_data;
    }

    return {
        "open_layer_popup":function(call_method, popup_name, popup_size, data){
            if(call_method == POPUP_AJAX_CALL){
                func_get_popup_ajax(popup_name, data);
            }else if(call_method==POPUP_BASIC){
                func_set_popup_basic(popup_name, data)
            }else if(call_method==POPUP_INNER_HTML){
                // 확인 용도
            }
            console.log(call_method);
            console.log(popup_name);
            console.log(popup_size);

            let func_animation_set = this.animation_set;
            setTimeout(function(){
                let popup_data = func_open_layer_popup(popup_name, popup_size);
                func_animation_set(OPEN, popup_data);
            }, 0);

        },

        "close_layer_popup": function() {
            let popup_data = func_close_layer_popup();
            this.animation_set(CLOSE, popup_data);
        },
        "all_close_layer_popup": function() {
            let popup_data = func_all_close_layer_popup();
            this.animation_set(CLOSE, popup_data);
        },

        "animation_set": function(option, popup_data){
            //비어 있는 경우 동작 안되도록 설정;
            if(popup_data==undefined || !Object.keys(popup_data).length){
                location.reload();
            }else{
                let animation_flag = func_get_animation_flag(popup_data.popup_size);
                let $popup_selector = $(`.${popup_data.popup_name}`).parents('.popup_mobile');
                func_set_popup_animation(option, $popup_selector, popup_array.length, animation_flag);
                if(option==CLOSE || popup_data.popup_size==POPUP_SIZE_WINDOW){
                    func_set_shade(popup_array.length);
                }
            }
        }
    }

}());


//Ajax로 팝업 html을 통째로 들고온다.
function func_get_popup_ajax(popup_name, data){
    $.ajax({
        url: `/trainee/${popup_name}/`,
        type : 'GET',
        data: data,
        dataType : 'html',
        async : false,

        beforeSend:function(xhr, settings){
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            ajax_load_image(SHOW);
        },

        success:function(data){
            $('body').append(`<div id="${popup_name}">${data}</div>`);
        },

        complete:function(){
            ajax_load_image(HIDE);
        },

        error:function(){
            console.log('server error');
        }
    });
}

function func_set_popup_animation(option, $popup_selector, popup_length, animation_flag){
    let animation_info = "";
    if(animation_flag == ANIMATION_ON){
        animation_info = "transform 0.3s ease-in-out";
    }

    switch(option){
        case OPEN:
            //첫 팝업의 경우 옆으로 밀려나도록 보이는 효과
            if(popup_length == 1 && animation_flag == ANIMATION_ON){
                $('nav, .content_page').css({
                    "transform": `translateX(-100%)`,
                    "transition":`${animation_info}`
                });
            }
            $popup_selector.css({
                "transform": `translateX(0%)`,
                "transition":`${animation_info}`
            });
        break;
        case CLOSE:
            //첫 팝업의 경우 옆에서 다시 당겨오도록 보이는 효과
            if(popup_length == 0 && animation_flag == ANIMATION_ON){
                $('nav, .content_page').css({
                    "transform": `translateX(0%)`,
                    "transition":`${animation_info}`
                });
            }
            $popup_selector.css({
                "transform": `translateX(100%)`,
                "transition":`${animation_info}`
            });
        break;
        case ALL_CLOSE:
            if(animation_flag == ANIMATION_ON) {
                $('nav, .content_page').css({
                    "transform": `translateX(0%)`,
                    "transition": `${animation_info}`
                });
            }
        break;
    }
}


function func_set_shade(popup_array_length){
    if(popup_array_length > 0){
        $('#shade_for_popup_basic').css({"display":'block',"z-index":100*popup_array_length-50});
    }
    else{
        $('#shade_for_popup_basic').css({"display":'none',"z-index":0});
    }
}

function func_set_popup_basic(popup_name, data){
    let $popup = $(`.${popup_name}`);
    if(data != undefined && data.popup_comment!=undefined){
        $popup.find('.wrapper_popup_basic_comment').html(data.popup_comment);
    }
    if(data != undefined && data.onclick_function!=undefined){
        $popup.find('.popup_basic_confirm').attr('onclick', data.onclick_function);
    }
}
function func_get_animation_flag(popup_size){
    let animation_flag = ANIMATION_OFF;
    if(popup_size==POPUP_SIZE_FULL){
        animation_flag = ANIMATION_ON;
    }else if(popup_size==POPUP_SIZE_WINDOW){
        animation_flag = ANIMATION_OFF;
    }

    return animation_flag;
}
