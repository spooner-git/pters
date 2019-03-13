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
        $selector.scroll(function(){
            const popupHeight = $selector.height();
            const scrollHeight = $selector.prop('scrollHeight');
            const scrollLocation = $selector.scrollTop();
            if(popupHeight + scrollLocation == scrollHeight){
                $selector.animate({scrollTop : scrollLocation-1}, 10);
            }else if(popupHeight + scrollLocation == popupHeight){
                $selector.animate({scrollTop : scrollLocation+1}, 10);
            }
        });
    }
}

let ajax_name_array = [];
function func_ajax_before_send(xhr, settings, ajax_name){
    if(ajax_name_array.indexOf(ajax_name)==-1){
        ajax_name_array.push(ajax_name);
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
        ajax_load_image(SHOW);
    }else{
        xhr.abort();
    }
}

function func_ajax_after_send(ajax_name){
    let ajax_name_index = ajax_name_array.indexOf(ajax_name);
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
