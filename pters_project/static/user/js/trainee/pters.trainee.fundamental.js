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

let double_click = false;
function func_prevent_double_click_set(){
    if(double_click == true){
        return true;
    }else{
        double_click = true;
        return false;
    }
}

function func_prevent_double_click_free(){
    double_click = false;
}
