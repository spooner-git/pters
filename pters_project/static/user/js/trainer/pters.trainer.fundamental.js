
//ajax로 불러오는 html내에 있는 script 파일을 가져와서 실행
function dynamic_added_script_exe(script_url, callback){
    let script = document.createElement("script");
    script.addEventListener("load", function(event) {
        callback();
    });
    script.src = script_url;
    script.async = true;
    document.getElementsByTagName("script")[0].parentNode.appendChild(script);
}


function func_set_webkit_overflow_scrolling(target_selector){
    if(os == IOS){
            let $selector = $(target_selector);
            $selector.scrollTop(1);
            $selector.off('scroll').scroll(function(e){
                const popupHeight = $selector.height();
                const scrollHeight = $selector.prop('scrollHeight');
                const scrollLocation = $selector.scrollTop();
                if(scrollHeight > popupHeight+1){
                    // if(popupHeight + scrollLocation == scrollHeight){
                    //      $selector.animate({scrollTop : scrollLocation-1}, 10);
                    // }else if(popupHeight + scrollLocation == popupHeight){
                    //      $selector.animate({scrollTop : scrollLocation+1}, 10);
                    // }
                    if(popupHeight + scrollLocation >= scrollHeight){
                        // $selector.animate({scrollTop : scrollLocation-1}, 10);
                        $selector.scrollTop(scrollLocation-1);
                    }else if(popupHeight + scrollLocation <= popupHeight){
                        $selector.scrollTop(1);
                    }
                }
                
            });
        }
}


function ajax_load_image(option){
    let $ajax_load_image = $('img.ajax_loading_image');
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

