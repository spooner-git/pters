/*슬라이드 팝업에 대한 동작*/
/* global $, windowHeight, windowWidth */

let layer_popup = (function (){
    let popup_array = [];
    let windowHeight = window.innerHeight;

    function func_open_layer_popup (popup_name, popup_size, animation_type, call_method){

        // $('.content_page').css('overflow-y', 'hidden');

        let $popup_selector;
        let popup_data = {"popup_name":popup_name, "popup_size":popup_size, "animation_type":animation_type, "call_method":call_method};
        //똑같은 팝업 여러개 못뜨도록
        let $popup_name_selector = $(`.${popup_name}`);
        if(animation_type == POPUP_FROM_RIGHT && windowWidth <= 650 && popup_size == 100){
            if(popup_array.length > 0){
                let $last_popup =  $(`.${popup_array[popup_array.length - 1].popup_name}`).parents('.popup_mobile');
                $last_popup.addClass("anim_page_to_left");
                setTimeout(()=>{
                    $last_popup.removeClass("anim_page_to_left");
                }, 300);
            }else{
                $root_content.addClass("anim_page_to_left");
                setTimeout(()=>{
                    $root_content.removeClass("anim_page_to_left");
                }, 300);
            }
        }else if(animation_type == POPUP_FROM_PAGE){
                let $this_popup =  $(`.${popup_data.popup_name}`).parents('.popup_mobile');
                $this_popup.addClass("anim_pulse");
                setTimeout(()=>{
                    $this_popup.removeClass("anim_pulse");
                }, 300);
        }
        

        if($popup_name_selector.length == 1){
            popup_array.push(popup_data);
            $popup_selector = $popup_name_selector.parents('.popup_mobile');
            //왼쪽 오른쪽에서 팝업이 열리는 경우 height 조정을 100%와 동일하도록
            if(animation_type == POPUP_FROM_LEFT || animation_type == POPUP_FROM_RIGHT){
                popup_size = 100;
            }
            //height px 값으로 변환 - top 이 있는 경우 해당 길이 제외
            let popup_height = popup_size * windowHeight / 100 - $popup_name_selector[0].offsetTop;
            //height px 값으로 변환 - bottom 이 있는 경우 해당 길이 제외
            let $popup_wrapper_bottom_selector = $popup_name_selector.siblings('.wrapper_bottom');
            if($popup_wrapper_bottom_selector.length >0){
                popup_height = popup_height - $popup_wrapper_bottom_selector[0].offsetHeight;
            }

            //팝업 height 지정
           if(popup_size != POPUP_SIZE_WINDOW) {
                // $popup_name_selector.css({"height": popup_height + 'px'});
                $popup_name_selector.css({"height": '100%', "display":"flex", "flex-direction":"column"});
            }
            $popup_selector.css({"z-index":100*popup_array.length});
        }
        else{
            let $popup_name_selector = $(`#${popup_name}`);
            $popup_name_selector.remove();
            popup_data = {};
        }

        return popup_data;
    }

    function func_close_layer_popup (){
        let popup_data = {};
        //혹시 있을 pop 에러 방지
        if(popup_array.length > 0){
            // let $popup_selector;
            popup_data = popup_array.pop();
            // $popup_selector = $(`.${popup_data.popup_name}`).parents('.popup_mobile');

            if(popup_data.animation_type == POPUP_FROM_RIGHT && windowWidth <= 650){
                if(popup_array.length > 0){
                    let $last_popup =  $(`.${popup_array[popup_array.length - 1].popup_name}`).parents('.popup_mobile');
                    $last_popup.addClass('anim_page_to_right');
                    setTimeout(()=>{
                        $last_popup.removeClass('anim_page_to_right');
                    }, 300);
                }else{
                    $root_content.addClass('anim_page_to_right');
                    setTimeout(()=>{
                        $root_content.removeClass('anim_page_to_right');
                    }, 300);
                }
            }else if(popup_data.animation_type == POPUP_FROM_PAGE){
                    let $this_popup =  $(`.${popup_data.popup_name}`).parents('.popup_mobile');
                    $this_popup.addClass("anim_pulse");
                    setTimeout(()=>{
                        $this_popup.removeClass("anim_pulse");
                    }, 300);
            }
            
            if(popup_data.call_method == POPUP_AJAX_CALL){
                setTimeout(()=>{
                    let $ajax_popup =  $(`#${popup_data.popup_name}`);
                    $ajax_popup.remove();
                }, 300);
                
            }
        }

        return popup_data;
    }

    function func_all_close_layer_popup (){
        let popup_data = {};
        let popup_len = popup_array.length;
        for(let i=0; i<popup_len; i++){
            popup_data = popup_array.pop();
            let $popup_selector = $(`.${popup_data.popup_name}`).parents('.popup_mobile');
            //팝업이 옆으로 닫히는 애니메이션이 종료된후 해당 팝업의 html을 지운다.
            let $popup_selector_wrap = $(`#${popup_data.popup_name}`);

            func_set_close_popup_animation($popup_selector, popup_data.animation_type);

            setTimeout(function (){
                //$popup_selector.css({"transform": "translateX(100%)", "z-index":-10});
                //$(`#${popup_data.popup_name}`).remove();
                $popup_selector_wrap.remove();
            }, 250);
        }

        // $('.content_page').css('overflow-y', 'auto');
        return popup_data;
    }

    return {
        "open_layer_popup":function(call_method, popup_name, popup_size, animation_type, data, callback){
            // if(func_prevent_double_click_set()) return;

            if(call_method == POPUP_AJAX_CALL){
                func_get_popup_ajax(popup_name, data, ()=>{
                    let func_animation_set = this.animation_set;
                    setTimeout(function(){
                        func_set_popup_position($(`.${popup_name}`).parents('.popup_mobile'), animation_type, popup_size);

                        let popup_data = func_open_layer_popup(popup_name, popup_size, animation_type, call_method);
                        if(popup_data!=undefined && Object.keys(popup_data).length > 0){
                            func_animation_set(OPEN, popup_data);
                        }
                        if(callback != undefined){
                            callback();
                        }
                        
                        // func_prevent_double_click_free();
                    }, 10);
                });
            }else if(call_method==POPUP_BASIC){
                func_set_popup_basic(popup_name, data);
                let func_animation_set = this.animation_set;
                setTimeout(function (){
                    // alert(popup_name);
                    func_set_popup_position($(`.${popup_name}`).parents('.popup_mobile'), animation_type, popup_size);

                    let popup_data = func_open_layer_popup(popup_name, popup_size, animation_type, call_method);
                    if(popup_data!=undefined && Object.keys(popup_data).length > 0){
                        func_animation_set(OPEN, popup_data);
                    }
                    if(callback != undefined){
                        callback();
                    }
                      // func_prevent_double_click_free();
                }, 10);
            }else if(call_method==POPUP_INNER_HTML){
                let func_animation_set = this.animation_set;
                setTimeout(function(){
                    func_set_popup_position($(`.${popup_name}`).parents('.popup_mobile'), animation_type, popup_size);

                    let popup_data = func_open_layer_popup(popup_name, popup_size, animation_type, call_method);
                    if(popup_data!=undefined && Object.keys(popup_data).length > 0){
                        func_animation_set(OPEN, popup_data);
                    }
                    if(callback != undefined){
                        callback();
                    }
                    // func_prevent_double_click_free();
                }, 10);
            }
            // let func_animation_set = this.animation_set;
            // setTimeout(function(){
            //     func_set_popup_position($(`.${popup_name}`).parents('.popup_mobile'), animation_type, popup_size);

            //     let popup_data = func_open_layer_popup(popup_name, popup_size, animation_type);
            //     if(popup_data!=undefined && Object.keys(popup_data).length > 0){
            //         func_animation_set(OPEN, popup_data);
            //     }
            //       // func_prevent_double_click_free();
            // }, 10);
        },

        "close_layer_popup": function () {
            let popup_data = func_close_layer_popup();
            this.animation_set(CLOSE, popup_data);
        },
        "all_close_layer_popup": function () {
            let popup_data = func_all_close_layer_popup();
            this.animation_set(CLOSE, popup_data);
        },

        "animation_set": function (option, popup_data){
            //비어 있는 경우 동작 안되도록 설정;
            if(popup_data==undefined || !Object.keys(popup_data).length){
                location.reload();
            }else{
                // let animation_flag = func_get_animation_flag(popup_data.popup_size);
                let $popup_selector = $(`.${popup_data.popup_name}`).parents('.popup_mobile');
                if(option==OPEN){
                    func_set_open_popup_animation($popup_selector, popup_data.animation_type, popup_data.popup_size);
                }
                else if(option==CLOSE){
                    func_set_close_popup_animation($popup_selector, popup_data.animation_type);
                }
                func_set_shade(popup_array.length, option);
            }
        },

        "stack": popup_array,

        "disable_shade_click_close": function(){
            $('#shade_for_popup_basic').attr('onclick', '');
        },
        
        "enable_shade_click_close": function(){
            $('#shade_for_popup_basic').attr('onclick', 'layer_popup.close_layer_popup()');
        }

    };

}());

//Ajax로 팝업 html을 통째로 들고온다.
function func_get_popup_ajax (popup_name, data, callback, error_callback){
        $.ajax({
            // url: `/trainer/${popup_name}/`,
            url: `/trainee/${popup_name}/`,
            type: 'GET',
            data: data,
            dataType: 'html',
            // async: false,

            beforeSend: function (xhr, settings) {
                ajax_load_image(SHOW);
                func_ajax_before_send(xhr, settings, popup_name, data);
            },

            success: function (data) {
                $('#content_wrapper').prepend(`<div id="${popup_name}">${data}</div>`);
                callback();
            },

            complete: function () {
                func_ajax_after_send(popup_name, data);
            },

            error: function () {
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
            }
        });
}

function func_set_popup_position ($popup_selector, animation_type, popup_size){
    let translate_x = 0;
    let translate_y = 0;
    let width = 100;
    let height = 100;
    let left = 0;

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    if(windowWidth > 650){
        windowWidth = $root_content.width();
        windowHeight = $root_content.height();
    }
    switch (animation_type) {
        case POPUP_FROM_LEFT:
            translate_x = -windowWidth;
            width = popup_size;
            if(windowWidth > MAX_WIDTH) {
                left = MAX_WIDTH - (windowWidth - popup_size * windowWidth / 100);
                width = MAX_WIDTH * width / windowWidth;
            }
            break;
        case POPUP_FROM_RIGHT:
            console.log("right")
            translate_x = windowWidth;
            width = popup_size;
            if(windowWidth > MAX_WIDTH) {

                /* 계산식 : 왼쪽 공백 크기 + (content 화면 크기 - 팝업 크기) - (animation translate 크기) */
                left = (windowWidth - MAX_WIDTH)/2 + (MAX_WIDTH - MAX_WIDTH*width/100) - (windowWidth - popup_size * windowWidth / 100);

                width = MAX_WIDTH * width / windowWidth;
            }
            break;
        case POPUP_FROM_BOTTOM:
            translate_y = windowHeight;
            height = popup_size;
            if(windowWidth > MAX_WIDTH) {
                left = windowWidth / 2 - MAX_WIDTH/2;
                width = MAX_WIDTH * width / windowWidth;
            }
            break;
        case POPUP_FROM_TOP:
            translate_y = -windowHeight;
            height = popup_size;
            if(windowWidth > MAX_WIDTH) {
                left = windowWidth / 2 - MAX_WIDTH/2;
                width = MAX_WIDTH * width / windowWidth;
            }
            break;
        case POPUP_FROM_PAGE:
            translate_x = 0;
            translate_y = 0;
            break; 
    }
    $popup_selector.css({
        "transform": `translate(${translate_x}px, ${translate_y}px)`,
        "width": `${width}%`,
        "height": `${height}%`,
        "left": `${left}px`
    });

}

function func_set_open_popup_animation ($popup_selector, animation_type, popup_size){
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    if(windowWidth > 650){
        windowWidth = $root_content.width();
        windowHeight = $root_content.height();
    }

    let animation_info = "";
    // if(animation_type != POPUP_FROM_PAGE){
        animation_info = "transform 0.3s ease-in-out";
    // }
    let translate_x = 0;
    let translate_y = 0;
    let popup_size_x = popup_size * windowWidth / 100;
    let popup_size_y = popup_size * windowHeight / 100;

    switch (animation_type) {
        case POPUP_FROM_LEFT:
            break;
        case POPUP_FROM_RIGHT:
            translate_x = windowWidth - popup_size_x;
            break;
        case POPUP_FROM_BOTTOM:
            translate_y = windowHeight - popup_size_y;
            break;
        case POPUP_FROM_TOP:
            break;
        case POPUP_FROM_PAGE:
            break;
    }
    // alert(animation_info);
    $popup_selector.css({
        "transform": `translate(${translate_x}px, ${translate_y}px)`,
        "transition": `${animation_info}`
    });
    if(animation_type==POPUP_FROM_PAGE){
        $popup_selector.fadeIn(200);
    }
    else{
        $popup_selector.css({"visibility":"visible"});
    }

}

function func_set_close_popup_animation ($popup_selector, animation_type){
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    if(windowWidth > 650){
        windowWidth = $root_content.width();
        windowHeight = $root_content.height();
    }

    let animation_info = "";
    // if(animation_type != POPUP_FROM_PAGE){
        animation_info = "transform 0.3s ease-in-out";
    // }
    let translate_x = 0;
    let translate_y = 0;
    switch (animation_type) {
        case POPUP_FROM_LEFT:
            translate_x = - windowWidth;
            break;
        case POPUP_FROM_RIGHT:
            translate_x = windowWidth;
            break;
        case POPUP_FROM_BOTTOM:
            translate_y = windowHeight+60; 
            //안드로이드 크롬이 하단 브라우저 영역을 숨기면서 windowHeight가 늘어나서, 밑에 숨어있던 팝업이 보이는 현상 해결 (60은 navbar 높이)
            break;
        case POPUP_FROM_TOP:
            translate_y = -windowHeight+60;
            //안드로이드 크롬이 하단 브라우저 영역을 숨기면서 windowHeight가 늘어나서, 밑에 숨어있던 팝업이 보이는 현상 해결 (60은 navbar 높이)
            break;
        case POPUP_FROM_PAGE:
            // translate_x = -windowWidth;
            // translate_y = -windowHeight;
            break;
    }
    if(animation_type==POPUP_FROM_PAGE){
        $popup_selector.fadeOut(200);
    }
    else{
        $popup_selector.css({
            "transform": `translate(${translate_x}px, ${translate_y}px)`,
            "transition": `${animation_info}`
        });
        setTimeout(()=>{
            $popup_selector.css({"visibility":"hidden", "z-index":0});
        }, 300);
    }
}

function func_set_shade (popup_array_length, open_or_close){
    if(popup_array_length > 0){
        $('#shade_for_popup_basic').css({"display":'block', "z-index":100*popup_array_length-50});
        if(open_or_close == OPEN){
            $('#shade_for_popup_preventing_touch').css({"display":'block', "z-index":100*popup_array_length-50-1});
        }else if(open_or_close == CLOSE){
            setTimeout(()=>{
                $('#shade_for_popup_preventing_touch').css({"display":'block', "z-index":100*popup_array_length-50-1});
            }, 300);
        }  
    }
    else{
        $('#shade_for_popup_basic').css({"display":'none', "z-index":0});
        setTimeout(()=>{
            $('#shade_for_popup_preventing_touch').css({"display":'none', "z-index":0});
        }, 400);
    }
}



/**
 * @param popup_name            basic 팝업 이름
 * @param data                  basic 팝업에 들어갈 data object.
 * @param data.popup_title      basic 팝업에 들어갈 제목.
 * @param data.popup_comment    basic 팝업에 들어갈 내용.
 * @param data.onclick_function basic 팝업 확인 버튼에 연결되는 onclick 함수.
 */
function func_set_popup_basic (popup_name, data){
    let $popup = $(`.${popup_name}`);
    // if(data != undefined && data.popup_comment!=undefined && data.popup_title!=undefined){
    if(data != undefined){
        $popup.find('.wrapper_popup_basic_comment').html(`<div>
                                                            <p class="popup_title" style="display:${data.popup_title==undefined ? 'none': ''}">${data.popup_title}</p>
                                                            <p class="popup_comment" style="display:${data.popup_comment==undefined ? 'none': ''}">${data.popup_comment}</p>
                                                        </div>`);
    }
    if(data != undefined && data.onclick_function!=undefined){
        $popup.find('.popup_basic_confirm').off('click').click(function(){
            data.onclick_function();
        });
    }
}

function show_error_message (message){
    layer_popup.open_layer_popup(POPUP_BASIC,
                                 'popup_basic_user_confirm',
                                 POPUP_SIZE_WINDOW, POPUP_FROM_PAGE,
                                 {'popup_title':message.title,
                                  'popup_comment':message.comment,
                                  'onclick_function':()=>{layer_popup.close_layer_popup(POPUP_SIZE_WINDOW);}});
}

function show_user_confirm (message, callback){
    layer_popup.open_layer_popup(POPUP_BASIC,
                                 'popup_basic_user_select',
                                 POPUP_SIZE_WINDOW, POPUP_FROM_PAGE,
                                 {'popup_title':message.title,
                                  'popup_comment':message.comment,
                                  'onclick_function':()=>{callback();}});
}


class Loading{
    static show(message){
        Loading.install(message);
    }

    static hide(){
        Loading.remove();
    }

    static install(message){
        if(message == undefined){
            message = `사용자 데이터의 중요 작업을 진행합니다.<br>데이터가 많은 경우 최대 2~4분까지 소요될 수 있습니다.`;
        }

        let message_dom = 
            `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;color:var(--fundamental-white);width:100%;max-width:250px;background-color:black;border-radius:10px;padding:20px 10px;">
                <img src="/static/common/loading.svg">
                <div style="font-size:12px;color:var(--fundamental-white);word-break:keep-all">${message}</div>
            </div>`;

        let style = `position:fixed;width:100%;height:100%;top:0;left:0;background-color:var(--bg-for-only-shade);opacity:0.8;z-index:1500;`;
        if($('#loading_image').length == 0){
            $('body').append(
                `<div id="loading_image" style="${style}">
                    <div>
                        ${message_dom}
                    </div>
                </div>`
            );
        }
    }

    static remove(){
        if($('#loading_image').length != 0){
            $('#loading_image').remove();
        }
    }
}
