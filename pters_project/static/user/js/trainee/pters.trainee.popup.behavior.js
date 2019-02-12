/*슬라이드 팝업에 대한 동작*/
let layer_popup = (function(){
    let popup_array = [];
    return function (option, popup_name, call_method, data){
        if(call_method == AJAX_CALL){
            func_get_layer_popup_html(popup_name, data);
        }
        setTimeout(function(){
            func_layer_popup(option, popup_name, popup_array);
        }, 0);
    }
}());

//Ajax로 팝업 html을 통째로 들고온다.
function func_get_layer_popup_html(popup_name, data){
    console.log(popup_name, data)
    $.ajax({
        url: `/trainee/${popup_name}/`,
        type : 'GET',
        data: data,
        dataType : 'html',
        async : false,

        beforeSend:function(){
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


function func_layer_popup(option, popup_name, popup_array){
    switch(option){
        case OPEN:
            //첫 팝업의 경우 옆으로 밀려나도록 보이는 효과
            if(popup_array.length == 0){
                func_popup_animation(CLOSE, $('nav, .content_page'), -100);
            }
            //똑같은 팝업 여러개 못뜨도록
            if(popup_array.indexOf(popup_name) == -1){
                popup_array.push(popup_name);
                let $parent = $(`.${popup_name}`).parents('.popup_mobile');
                $parent.css({"z-index":100*popup_array.length});
                func_popup_animation(option, $parent, 0);
                $(`.${popup_name}`).css({"height":windowHeight - 95 + 'px', "overflow-y":"auto"});
            }

        break;
        case CLOSE:
            //혹시 있을 pop 에러 방지
            if(popup_array.length > 0){
                popup_name = popup_array.pop();
                //첫 팝업의 경우 옆에서 다시 당겨오도록 보이는 효과 , side 제외
                if(popup_array.length == 0){
                    func_popup_animation(OPEN, $('nav, .content_page'), 0);
                }
                let $parent = $(`.${popup_name}`).parents('.popup_mobile');

                func_popup_animation(option, $parent, 100);
                //팝업이 옆으로 닫히는 애니메이션이 종료된후 해당 팝업의 html을 지운다.
                setTimeout(function(){
                    $(`#${popup_name}`).remove();
                }, 300);
            }
        break;
        case ALL_CLOSE:
            let popup_len = popup_array.length;
            for(let i=0; i<popup_len; i++){
                popup_name = popup_array.pop();
                $(`.${popup_name}`).parents('.popup_mobile').css({"transform":"translateX(100%)"});
                //팝업이 옆으로 닫히는 애니메이션이 종료된후 해당 팝업의 html을 지운다.
                setTimeout(function(){
                    $(`#${popup_name}`).remove();
                }, 300);
            }
            //팝업 전부 닫고 옆에서 다시 당겨오도록 보이는 효과 , side 제외
            $('nav, .content_page').css({
                "transform": "translateX(0%)",
                "transition": "transform 0.3s ease-in-out"
            });
        break;
    }
}

function func_popup_animation(option, $popup_name, slide_amount){
    let $popup = $popup_name;
    switch(option){
        case OPEN:
            $popup.css({
                "transform": `translateX(${slide_amount})`,
                "transition":"transform 0.3s ease-in-out"
                // "z-index":100*popup_array.length
            });
        break;
        case CLOSE:
            $popup.css({
                "transform": `translateX(${slide_amount}%)`,
                "transition":"transform 0.3s ease-in-out"
            });
        break;
    }
}




/*베이직 팝업에 대한 동작*/
let layer_popup_basic = (function(){
    let popup_array = [];
    return function(option, popup_name, popup_comment, onclick_function){
        func_layer_popup_basic(option, popup_name, popup_comment, onclick_function);
    }
}());


function func_layer_popup_basic(option, popup_name, popup_comment, onclick_function){
    let $popup = $(`.${popup_name}`);
    switch(option){
        case OPEN:
            $('body').append(`<div class="shade_for_popup_basic" style="position:fixed;top:0;height:${windowHeight}px;width:${windowWidth}px;background-color:#282828;opacity:0.5;z-index:1499;"></div>`);
            $popup.find('.wrapper_popup_basic_comment').html(popup_comment);
            $popup.find('.popup_basic_confirm').attr('onclick', onclick_function);
            $popup.show();
        break;

        case CLOSE:
            $('.shade_for_popup_basic').remove();
            $popup.find('.wrapper_popup_basic_comment').html('');
            $popup.find('.popup_basic_confirm').attr('onclick', '');
            $popup.hide();
        break;
    }
}
