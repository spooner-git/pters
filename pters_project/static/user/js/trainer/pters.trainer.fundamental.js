// function func_set_webkit_overflow_scrolling(target_selector){
//     if(os == IOS){
//         let $selector = $(target_selector);

//         $selector.off('touchstart').on('touchstart', function(){
//             if($selector.scrollTop() == 0){
//                 $selector.scrollTop(1);
//             }
//         });

//         $selector.off('scroll').scroll(function(e){
//             const popupHeight = $selector.height();
//             const scrollHeight = $selector.prop('scrollHeight');
//             const scrollLocation = $selector.scrollTop();
//             if(scrollHeight >= popupHeight+1){
//                 if(popupHeight + scrollLocation == scrollHeight){
//                     $selector.animate({scrollTop : scrollLocation-1}, 10);
//                 }else if(popupHeight + scrollLocation == popupHeight){
//                     $selector.animate({scrollTop : scrollLocation+1}, 10);
//                 }
//             }
//         });
//     }
// }
function func_set_webkit_overflow_scrolling(target_selector){
    if(os == IOS){
        let $selector = $(target_selector);

        $(document).off('touchstart', target_selector).on('touchstart', target_selector, function(){
            if($selector.scrollTop() == 0){
                $selector.scrollTop(1);
            }
        });

        $(target_selector).off('scroll').on('scroll', function(e){
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

function input_adjust_location_for_android(){
    if(os == ANDROID){
        $(document).on('focus', 'input', function(e){
            let shade = `<div id="input_shade_for_android" style="position:fixed;width:100%;height:100%;top:0;left:0;background-color:#282828;opacity:0.5;z-index:1"></div>`;
            $(this).parents('li').addClass('input_focused');
            $(this).parents('li').parent().append(shade);
        });
    
        $(document).on('focusout', 'input', function(e){
            $(this).parents('li').removeClass('input_focused');
            $('#input_shade_for_android').remove();
        });

        $(document).on('click', '#input_shade_for_android', function(e){
            $(this).parents('li').removeClass('input_focused');
            $('input').blur();
            $(this).remove();
        });

        $(document).on('keypress', 'input', function(e){
            if (e.charCode == 13) {
                e.preventDefault();
                $('#input_shade_for_android').trigger('click');
            }
        });
    }
}

// function test_console(selector){
//     console.log(
//         "selector height:", $(selector).height()
//     );
//     console.log(
//         "selector scrollTop:", $(selector).scrollTop()
//     );
//     console.log(
//         "selector scrollHeight:", $(selector).prop('scrollHeight')
//     );
// }

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
    // 날짜를 Text 로 변환
    static to_text(year, month, date, short){
        year = String(year);
        month = String(month);
        date = String(date);

        // year 값에 전체 날짜 값이 오는 경우 처리
        let year_split = year.split('-');
        if(year_split.length == 3){
            year = year_split[0];
            month = year_split[1];
            date = year_split[2];
        }

        // 요일 확인
        let day = DAYNAME_KR[new Date(year, month-1, date).getDay()];

        // yyyy.mm.dd 형식
        if(short == SHORT){
            return `${year}.${month}.${date} (${day})`;
        }

        // yyyy년 mm월 dd일 (요일 형식
        return `${year}년 ${month}월 ${date}일 (${day})`;
    }

    static to_yyyymmdd(year, month, date){
        let new_year = year;
        let new_month = Number(month) < 10 ? '0'+Number(month) : Number(month);
        let new_date = Number(date) < 10 ? '0'+Number(date) : Number(date);

        return  `${new_year}-${new_month}-${new_date}`;
    }

    static to_split(data){
        if(data == null || data == undefined || data == "None" || data == ""){
            return null;
        }
        let year_split = data.split('-');

        return {year:year_split[0], month:year_split[1], date:year_split[2]};
    }

    // 날짜값 비교
    // true : date_form1 > date_form2
    // false : date_form1 <= date_form2
    static compare(date_form_1, date_form_2){
        let date_form_1_split = date_form_1.split('-');
        let year1 = date_form_1_split[0];
        let month1 = date_form_1_split[1];
        let date1 = date_form_1_split[2];

        let date_form_2_split = date_form_2.split('-');
        let year2 = date_form_2_split[0];
        let month2 = date_form_2_split[1];
        let date2 = date_form_2_split[2];

        if(month1.length < 2){
            month1 = '0'+month1;
        }
        if(month2.length < 2){
            month2 = '0'+month2;
        }
        if(date1.length < 2){
            date1 = '0'+date1;
        }
        if(date2.length < 2){
            date2 = '0'+date2;
        }

        let yyyymmdd1 = Number(`${year1}${month1}${date1}`);
        let yyyymmdd2 = Number(`${year2}${month2}${date2}`);

        if(yyyymmdd1 > yyyymmdd2){
            return true
        }
        return false;
    }

    // 날짜값 차이 계산
    // return : 날짜(date1에서 date2 뺀 값)
    static diff_date(date1, date2){
        // let diff_date_text = "일";
        // if(diff_date < 0){
        //     diff_date_text = "일 지남";
        //     diff_date = Math.abs(diff_date);
        // }
        return Math.round((new Date(date1).getTime() - new Date(date2).getTime()) / (1000*60*60*24));
    }
}

class TimeRobot{
    // 시, 분을 통해 24시간 -> 12시간 형식으로 변경
    // zone : 0(오전), 1(오후)
    static to_zone(hour, minute){
        if(hour == null && minute == null){
            return {zone:null, hour:null, minute:null};
        }
        hour = Number(hour);
        minute = Number(minute);
        let zone;
        let hour_new;
        let minute_new;

        // 12시가 넘는 경우
        hour_new = hour > 12 ? hour - 12 : hour;
        zone = hour >= 12 ? 1 : 0;

        // 0시인 경우 오전 0시로 변환하기
        if(hour == 0){
            zone = 0;
            hour_new = 0;
        }
        // 24시인 경우 오전 12시로 변환하기
        if(hour == 24){
            zone = 0;
            hour_new = 12;
        }
        // 5분 단위 표시를 위해
        minute_new = Math.floor(minute/5)*5;

        return {zone:zone, hour:hour_new, minute:minute_new};
    }

    // 12시간 형식을 24시간 형식으로 변경
    // zone : 0(오전), 1(오후)
    static to_data(zone, hour, minute){
        zone = Number(zone);
        hour = Number(hour);
        minute = Number(minute);

        let hh = zone*12 + hour;
        // 오후 12시의 경우 12가 되기 위해 처리
        if(hour == 12 || hour == 0){
            hh = zone*hour;
        }
        let mm = minute;
        if(zone == 0 && hour == 12 && minute == 0){
            hh = 24;
            mm = 0;
        }
        let result = `${hh}:${mm}`;
        

        return {complete: result, hour:hh, minute:mm};
    }

    // 시간을 Text 로 변환
    static to_text(hour, minute, short){
        // hour 가 시간 전체로 넘어오는 경우
        if(String(hour).split(':').length >= 2){
            minute = hour.split(':')[1];
            hour = hour.split(':')[0];
        }
        hour = Number(hour);
        minute = Number(minute);

        // 24시간제 -> 12시간제로 변경
        let time = TimeRobot.to_zone(Number(hour), Number(minute));
        let zone = time.zone;
        let hh = time.hour;
        let mm = time.minute;

        // zone 이 0 인 경우 오전, 1 인경우 오후
        zone = zone == 0 ? "오전" : "오후";

        if(hour == 0){
            zone = "오전";
            hh = 0;
        }else if(hour == 24 && minute == 0){
            zone = "오전";
            hh = 12;
        }

        // 오전 00:00
        if(short == SHORT){
            if(hh < 10){
                hh = '0'+hh;
            }
            if(mm < 10){
                mm = '0'+mm;
            }
            return `${zone} ${hh}:${mm}`;
        }
        // 분은 자르기
        // if(short != undefined){
        //     return `${zone} ${hh}시`;
        // }

        return `${zone} ${hh}시 ${mm}분`;
    }

    // 24시간제 시간,분 비교하기
    // true : time_data_form1 >= time_data_form2
    // false : time_data_form1 < time_data_form2
    static compare(time_data_form1, time_data_form2){

        let hour1 = Number(time_data_form1.split(':')[0]);
        let minute1 = Number(time_data_form1.split(':')[1]);
        let hour2 = Number(time_data_form2.split(':')[0]);
        let minute2 = Number(time_data_form2.split(':')[1]);

        if(hour1 < hour2){
            return false;
        }
        else if(hour1 > hour2){
            return true;
        }
        else if(hour1 == hour2){
            // 시간이 같은 경우 분이 같거나 크면 true
            // 시간이 같은 경우 분이 작으면 false
            if(minute1 >= minute2){
                return true;
            }else{
                return false;
            }
        }

    }

    // 12시간제 시간,분 비교하기
    // true : zone_form_data1 >= zone_form_data2
    // false : zone_form_data1 < zone_form_data2
    static compare_by_zone(zone_form_data1, zone_form_data2){
        // 포맷 바꾸기
        let time_data_form1 = TimeRobot.to_data(zone_form_data1.zone, zone_form_data1.hour, zone_form_data1.minute).complete;
        let time_data_form2 = TimeRobot.to_data(zone_form_data2.zone, zone_form_data2.hour, zone_form_data2.minute).complete;

        let hour1 = Number(time_data_form1.split(':')[0]);
        let minute1 = Number(time_data_form1.split(':')[1]);
        let hour2 = Number(time_data_form2.split(':')[0]);
        let minute2 = Number(time_data_form2.split(':')[1]);

        if(hour1 < hour2){
            return false;
        }
        else if(hour1 > hour2){
            return true;
        }
        else if(hour1 == hour2){
            // 시간이 같은 경우 분이 같거나 크면 true
            // 시간이 같은 경우 분이 작으면 false
            if(minute1 >= minute2){
                return true;
            }else{
                return false;
            }
        }
    }

    // 시간 더하기 24 시간제
    static add_time(hour, minute, plus_hour, plus_minute){
        hour = Number(hour);
        minute = Number(minute);
        plus_hour = Number(plus_hour);
        plus_minute = Number(plus_minute);
        hour = (hour + plus_hour + parseInt((minute + plus_minute)/60));
        if(hour!=24){
            hour = hour%24;
        }
        return {hour:hour, minute:(minute + plus_minute)%60};
    }

    // 시간 비교하 (시, 분)
    //time1은 time2보다 작아야한다.
    static diff(time1, time2){
        let hour1 = Number(time1.split(':')[0]);
        let minute1 = Number(time1.split(':')[1]);
        let hour2 = Number(time2.split(':')[0]);
        let minute2 = Number(time2.split(':')[1]);

        // 종료 시각이 0:0 인 경우 24:0 으로 변경
        if(hour2 == 0 && minute2 == 0){
            hour2 = 24;
        }
        let hour_diff = hour2 - hour1;
        let min_diff = minute2 - minute1;
        min_diff = hour_diff*60 + min_diff;

        // console.log('hour_diff:'+hour_diff);
        // console.log('min_diff:'+min_diff);
        return {hour : parseInt(min_diff/60), min: min_diff%60};

    }

    // 시간 비교하 (분)
    //time1은 time2보다 작아야한다.
    static diff_min(time1, time2){
        let hour1 = Number(time1.split(':')[0]);
        let minute1 = Number(time1.split(':')[1]);
        let hour2 = Number(time2.split(':')[0]);
        let minute2 = Number(time2.split(':')[1]);

        // 종료 시각이 0:0 인 경우 24:0 으로 변경
        if(hour2 == 0 && minute2 == 0){
            hour2 = 24;
        }

        let hour_diff = hour2 - hour1;
        let min_diff = minute2 - minute1;
        min_diff = hour_diff*60 + min_diff;

        return min_diff;
    }
}


class PassInspector{
    constructor(){
        this.data;
        this.init();
    }
    
    init(){
        this.get_pass((data)=>{
            this.data = data;
        });
    }

    get_pass(callback){
        $.ajax({
            url:"/trainer/get_trainer_auth_data/",
            type:'GET',
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    schedule(selected_date){

    }

    member(){
        let async = false;
        let data;
        member.request_member_list("ing", (data1)=>{
            data = data1;
        }, async);
        let current_member_number = data.current_member_data.length;
        let finish_member_number = data.finish_member_num;
        let total_member = current_member_number + finish_member_number;
        let limit_number = this.data.auth_member_create.limit_num;
        let limit_type = this.data.auth_member_create.limit_type;

        if(total_member >= limit_number){
            return {barrier:BLOCKED, limit_num: limit_number, limit_type: limit_type};
        }
        return {barrier:PASSED};
    }

    lecture(){
        let async = false;
        let data1;
        let data2;
        lecture.request_lecture_list("ing", (d1)=>{
            data1 = d1;
        }, async);
        lecture.request_lecture_list("end", (d2)=>{
            data2 = d2;
        }, async);
        let current_lecture_number = data1.current_lecture_data.length;
        let finish_lecture_number = data2.finish_lecture_data.length;
        let total_number = current_lecture_number + finish_lecture_number;
        let limit_number = this.data.auth_group_create.limit_num;
        let limit_type = this.data.auth_group_create.limit_type;

        if(total_number >= limit_number){
            return {barrier:BLOCKED, limit_num: limit_number, limit_type: limit_type};
        }
        return {barrier:PASSED};
    }

    ticket(){
        let async = false;
        let data1;
        let data2;
        ticket.request_ticket_list("ing", (d1)=>{
            data1 = d1;
        }, async);
        ticket.request_ticket_list("end", (d2)=>{
            data2 = d2;
        }, async);
        let current_ticket_number = data1.current_ticket_data.length;
        let finish_ticket_number = data2.finish_ticket_data.length;
        let total_number = current_ticket_number + finish_ticket_number;
        let limit_number = this.data.auth_package_create.limit_num;
        let limit_type = this.data.auth_package_create.limit_type;

        if(total_number >= limit_number){
            return {barrier:BLOCKED, limit_num: limit_number, limit_type: limit_type};
        }
        return {barrier:PASSED};
    }

    statistics(selected_start_date, selected_end_date){

    }

    program(){
        let async = false;
        let data;
        Program_func.read((d1)=>{
            data = d1;
        }, async);
        let current_program_number = data.program_data.length;
        let limit_number = this.data.auth_program_create.limit_num;
        let limit_type = this.data.auth_program_create.limit_type;

        if(current_program_number >= limit_number){
            return {barrier:BLOCKED, limit_num: limit_number, limit_type: limit_type};
        }
        return {barrier:PASSED};
    }

    settings(){

    }

    ads(){

    }
}

