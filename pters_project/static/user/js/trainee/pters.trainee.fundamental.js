/*global $ */
$(document).on('change', 'select', function(){
    $(this).removeClass('obj_font_color_light_grey').addClass('.obj_font_color_black');
});

function ajax_load_image(option){
    let $ajax_load_image = $('img.ajax_load_image');
	switch(option){
		case SHOW:
			$ajax_load_image.show();
		break;

		case HIDE:
			$ajax_load_image.hide();
		break;
	}
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie != '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');


function func_set_webkit_overflow_scrolling(target_selector){
    if(os == IOS){
        let $selector = $(target_selector);
        $selector.scrollTop(1);
        $selector.scroll(function(e){
            const popupHeight = $selector.height();
            const scrollHeight = $selector.prop('scrollHeight');
            const scrollLocation = $selector.scrollTop();
            if(scrollHeight > popupHeight+1){
               if(popupHeight + scrollLocation == scrollHeight){
                    $selector.animate({scrollTop : scrollLocation-1}, 10);
                }else if(popupHeight + scrollLocation == popupHeight){
                    $selector.animate({scrollTop : scrollLocation+1}, 10);
                }
            }
            
        });
    }
}

let ajax_name_array = [];
function func_ajax_before_send(xhr, settings, ajax_name, ajax_data){
    let input_ajax_data = JSON.stringify(ajax_data);
    if(ajax_name_array.indexOf(ajax_name+input_ajax_data) == -1){
        ajax_name_array.push(ajax_name+input_ajax_data);
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
        ajax_load_image(SHOW);
    }else{
        xhr.abort();
    }
}

function func_ajax_after_send(ajax_name, ajax_data){
    let input_ajax_data = JSON.stringify(ajax_data);
    let ajax_name_index = ajax_name_array.indexOf(ajax_name+input_ajax_data);
    ajax_name_array.splice(ajax_name_index, 1);
    ajax_load_image(HIDE);
}



/* 피터스 전용 모듈*/

    //pters_func_tab탭
    $(document).on('click', '.func_tab_element', function(e){
        e.preventDefault();
        $(this).siblings('div').removeClass('func_tab_selected');
        $(this).addClass('func_tab_selected');
    });

    //pters_func_radio
    $(document).on('click', '.func_radio_element', function(e){
        console.log('clicked')
        let $wrapper = $(this).parents('.func_radio_wrap');
        let $outer = $(this).find('.func_radio_element_button_outer');
        let $inner = $(this).find('.func_radio_element_button_inner');
        let $element_siblings = $wrapper.find('.func_radio_element_button_inner');

        $outer.find('div').addClass('func_radio_element_button_inner');
        $element_siblings.removeClass('func_radio_element_button_inner');

    });

/* 피터스 전용 모듈*/


function clear_badge_counter(){
    $.ajax({
        url:'/login/clear_badge_counter/',
        type:'POST',
        //dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            //alert('before clear_badge_counter afsavf')
            console.log('before');
        },

        //통신성공시 처리
        success:function(){
            //alert('test')
            console.log('sucess');

        },

        //보내기후 팝업창 닫기
        complete:function(){

        },

        //통신 실패시 처리
        error:function(){
            console.log('error');
            //alert('error clear_badge_counter')
            //console.log('error:clear_badge_counter')
        }
    });
}

function update_push_token(token, device_id) {
    $.ajax({
        url:'/login/add_push_token/',
        type:'POST',
        data:{"token_info":token, "device_id":device_id},

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            //AjaxBeforeSend();
        },

        //통신성공시 처리
        success:function(){
            $('a.text-payment').parent('div').css('display', 'inline-block');
            if(device_id != 'pc') {
                // $('a.text-payment').parent('div').css('display', 'none');
                $('.ads_wrap').css('display', 'none');
                $('.sidebar_div_last2 a').attr('href', '/trainer/help_setting/').attr('target', '');
                // $('#paymentSetting').css('display', 'none');
                $('._company').css('display', 'none');
            }else{
                // $('a.text-payment').parent('div').css('display', 'inline-block');
            }
            console.log('토큰 등록 완료');
        },

        //보내기후 팝업창 닫기
        complete:function(){

        },

        //통신 실패시 처리
        error:function(){

        }
    });
}

function send_push_func(class_id, title, message){

    $.ajax({
        url: '/schedule/send_push_to_trainer/',
        type : 'POST',
        dataType: 'html',
        data : {"class_id":class_id, "title":title, "message":message, "next_page":'/trainee/get_trainee_error_info/'},

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },

        success:function(response){
        },

        complete:function(){
        },

        error:function(){
            console.log('server error')
        }
    })
}