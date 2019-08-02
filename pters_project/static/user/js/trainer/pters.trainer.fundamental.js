
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

        $selector.off('touchstart').on('touchstart', function(){
            if($selector.scrollTop() == 0){
                $selector.scrollTop(1);
            }
        });

        $selector.off('scroll').scroll(function(e){
            const popupHeight = $selector.height();
            const scrollHeight = $selector.prop('scrollHeight');
            const scrollLocation = $selector.scrollTop();
            if(scrollHeight >= popupHeight+1){
                if(popupHeight + scrollLocation == scrollHeight){
                    $selector.animate({scrollTop : scrollLocation-1}, 10);
                }else if(popupHeight + scrollLocation == popupHeight){
                    $selector.animate({scrollTop : scrollLocation+1}, 10);
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


class DateRobot{
    static to_text(year, month, date){
        year = String(year);
        month = String(month);
        date = String(date);
        if(year.split('-').length == 3){
            date = year.split('-')[2];
            month = year.split('-')[1];
            year = year.split('-')[0];
        }
        let day = DAYNAME_KR[new Date(year, month-1, date).getDay()];

        return `${year}년 ${month}월 ${date}일 (${day})`;
    }

    static to_split(data){
        if(data == null || data == undefined || data == "None" || data == ""){
            return null;
        }
        let split = data.split('-');
        let year = split[0];
        let month = split[1];
        let date = split[2];

        return {year:year, month:month, date:date};
    }
}

class TimeRobot{
    static to_zone(hour, minute){
        if(hour == null && minute == null){
            return {zone:null, hour:null, minute:null};
        }
        hour = Number(hour);
        minute = Number(minute);
        let zone;
        let hour_new;
        let minute_new;
        
        hour_new = hour > 12 ? hour - 12 : hour;
        zone = hour >= 12 ? 1 : 0;

        if(hour == 24 || hour == 0){
            zone = 0;
            hour_new = 12;
        }
        
        minute_new = Math.floor(minute/5)*5;

        return {zone:zone, hour:hour_new, minute:minute_new};
    }

    static to_data(zone, hour, minute){
        zone = Number(zone);
        hour = Number(hour);
        minute = Number(minute);
        let hh = zone*12 + hour;
        if(hour == 12){
            hh = zone*hour;
        }
        let mm = minute;
        let result = `${hh}:${mm}`;

        return {complete: result, hour:hh, minute:mm};
    }

    static to_text(hour, minute, short){
        if(String(hour).split(':').length == 3){
            minute = hour.split(':')[1];
            hour = hour.split(':')[0];
        }

        hour = Number(hour);
        minute = Number(minute);
        let time = TimeRobot.to_zone(Number(hour), Number(minute) );
        let zone = time.zone;
        let hh = time.hour;
        let mm = time.minute;
        
        zone = zone == 0 ? "오전" : "오후";

        let result = `${zone} ${hh}시 ${mm}분`;
        if(short != undefined){
            result = `${zone} ${hh}시`;
        }

        return result;
    }

    static compare(object1, object2){

    }

    static add_time(hour, minute, plus_hour, plus_minute){
        var shour = hour;
        var smin = minute;
        var addhour = plus_hour;
        var addmin = plus_minute;
        var resultHour;
        var resultMin;
        var hourplus;
        

        if(smin + addmin >= 60){
            if(shour + addhour >= 24){  // 23 + 4 --> 3
                if(shour + addhour == 24){
                    resultHour = 25;
                }else{
                    resultHour = addhour - (24-shour);
                }
                resultMin = smin + addmin - 60;
            }else if(shour + addhour < 24){
                hourplus = parseInt((smin + addmin)/60);
                resultHour = shour + addhour + hourplus;
                resultMin = (smin + addmin)%60;
            }
        }else if(smin + addmin < 60){
            if(shour + addhour >= 24){  //23 + 1 --> 00
                if(shour + addhour == 24){
                    resultHour = 24;
                }else{
                    resultHour = (shour + addhour) - 24;
                }
                resultMin = smin + addmin;
            }else if(shour + addhour < 24){
                resultHour = shour + addhour;
                resultMin = smin + addmin;
            }
        }

        return {hour:resultHour, minute:resultMin}
    }
}

