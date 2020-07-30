/**
 * Created by Hyunki on 03/03/2019.
 */
/* global $, windowHeight, windowWidth, setting_info, select_date */

/*수강권 정보 열고 닫기*/
$('#id_ticket_detail_expand_in_reserve').attr("data-open", CLOSE);
$(document).off("click", '#id_ticket_detail_expand_in_reserve');

$(document).on("click", '#id_ticket_detail_expand_in_reserve', function(){

    let $this = $(this);
    let option = $this.attr("data-open");
    let wrapper_my_ticket_detail_in_reserve = $('#wrapper_ticket_info');

    switch(option){
        case OPEN:
            $this.attr({"data-open": CLOSE,
                        "src": "/static/common/icon/member_icon_expand_more_black.png"});
            wrapper_my_ticket_detail_in_reserve.hide();
        break;

        case CLOSE:
            $this.attr({"data-open": OPEN,
                        "src": "/static/common/icon/member_icon_expand_less_black.png"});
            wrapper_my_ticket_detail_in_reserve.show();
        break;
    }
});

$(document).on("change", "select[title='member_ticket_select']", function(){
    let $selected_option = $(this).find('option:selected');
    let selected_member_ticket_id = $selected_option.attr('data-member_ticket-id');
    $('#form_content_member_ticket_id').val(selected_member_ticket_id);
});

$(document).on("change", "select[title='time_select']", function(){
    let $selected_option = $(this).find('option:selected');

    let start = $selected_option.attr('data-start').split(' ');
    let end = $selected_option.attr('data-end').split(' ');

    let start_date = start[0];
    let start_time = start[1];
    let end_date = end[0];
    let end_time = end[1];

    $('#form_content_training_date').val(start_date);
    $('#form_content_training_end_date').val(end_date);
    $('#form_content_training_time').val(start_time);
    $('#form_content_training_end_time').val(end_time);
});


//그룹수업 시간 선택시, 다른 그룹에 선택되어있는 라디오버튼은 해제 한다.
$(document).on('click', '.func_radio_element', function(){
    //그룹수업 시간 선택시, 다른 그룹에 선택되어있는 라디오버튼은 해제 한다.
    let this_lecture_id = $(this).attr('data-lecture-schedule-id');
    let this_date = $(this).attr('data-date');
    let this_time = $(this).attr('data-start-time');
    let this_end_time = $(this).attr('data-end-time');
    $(this).parents('.obj_box_full').siblings('.obj_box_full').find('.func_radio_element_button_inner').removeClass('func_radio_element_button_inner');
    $('#form_content_lecture_schedule_id').val(this_lecture_id);
    $('#form_content_training_date').val(this_date);
    $('#form_content_training_time').val(this_time);
    $('#form_content_training_end_date').val(this_date);
    $('#form_content_training_end_time').val(this_end_time);
});

$(document).on('click', '.func_tab_element', function(){
    //그룹 라디오 버튼 해제
    $('.func_radio_element_button_inner').removeClass('func_radio_element_button_inner');
    //개인 드랍다운 첫번째 요소로 초기화
    let $time_select_dropdown = $('#reserve_form_personal select');
    $time_select_dropdown.removeClass('obj_font_color_black').addClass('obj_font_color_light_grey');
    $time_select_dropdown.find('option:nth-of-type(1)').prop('selected', true);

    $('#form_plan_add').find('input').val('');
    let this_type = $(this).attr('data-tab');
    let $target_to_show = $(`#reserve_form_${this_type}`);
    let $target_to_hide = $target_to_show.siblings('._target_link_to_tab');
    $target_to_show.show();
    $target_to_hide.hide();
});





function func_get_ajax_schedule_data_temp(input_reference_date, callback){
    let ajax_url = '/trainee/get_trainee_schedule/';
    let ajax_data = {"date": input_reference_date, "day":1};
    $.ajax({
        url: ajax_url,
        type : 'GET',
        data : ajax_data,
        dataType : 'html',

        beforeSend:function(xhr, settings){
            func_ajax_before_send(xhr, settings, ajax_url, ajax_data);
        },


        success:function(data){
            let jsondata = JSON.parse(data);
            /**
             * @param jsondata.messageArray
             **/
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                callback(jsondata);
            }

            return jsondata;
        },

        complete:function(){
            func_ajax_after_send(ajax_url, ajax_data);
        },

        error:function(){
            console.log('server error');
        }
    });
}

let object_time = new Date();
let currentTime = time_h_m_to_hh_mm(object_time.getHours()+':'+object_time.getMinutes());
let currentDate = date_format_yyyy_m_d_to_yyyy_mm_dd(`${object_time.getFullYear()}-${object_time.getMonth()+1}-${object_time.getDate()}`, '-');

function func_start_time_calc(selected_date, schedule_json, setting_info, one_to_one_lecture_time_duration, lecture_start_time){ //offAddOkArray 채우기 : 시작시간 리스트 채우기!!!!
    //let allplans = [];
    let plan_time = [];

    let selected_date_split = selected_date.split('-');
    let this_year = selected_date_split[0];
    let this_month = selected_date_split[1];
    let this_date = selected_date_split[2];
    let thisDay = new Date(this_year, Number(this_month)-1, this_date).getDay();


    let workStartTime_ = time_h_m_to_hh_mm(setting_info.setting_trainer_work_time_available[thisDay].split('-')[0]);
    let workEndTime_ = time_h_m_to_hh_mm(setting_info.setting_trainer_work_time_available[thisDay].split('-')[1]);
    if(workEndTime_ == "23:59"){
        workEndTime_ = "24:00";
    }
    // 사용 x
    // let all_start_date_time;
    // let all_end_date_time;
    // all_start_date_time = schedule_json.classTimeArray_start_date.concat(schedule_json.lecture_schedule_start_datetime);
    // all_end_date_time = schedule_json.classTimeArray_end_date.concat(schedule_json.lecture_schedule_end_datetime);
    // all_start_date_time = all_start_date_time.concat(schedule_json.offTimeArray_start_date);
    // all_end_date_time = all_end_date_time.concat(schedule_json.offTimeArray_end_date);

    let clear_result = clear_duplicated_date_time(schedule_json, selected_date);
    //중복일정시 Test
    let disable_time_array_start_date = clear_result.clear_start_array;
    let disable_time_array_end_date = clear_result.clear_end_array;
    // let disable_time_array_start_date = remove_duplicate_in_list(all_start_date_time);
    // let disable_time_array_end_date = remove_duplicate_in_list(all_end_date_time);

    for(let i=0; i<disable_time_array_start_date.length; i++){
        let plan_start_datetime_split = disable_time_array_start_date[i].split(' ');
        let plan_start_time_split = plan_start_datetime_split[1].split(':');
        let plan_end_datetime_split = disable_time_array_end_date[i].split(' ');
        let plan_end_time_split = plan_end_datetime_split[1].split(':');

        let plan_start_date = plan_start_datetime_split[0];
        let plan_start_time = plan_start_time_split[0]+':'+plan_start_time_split[1];
        let plan_end_date = plan_end_datetime_split[0];
        let plan_end_time = plan_end_time_split[0]+':'+plan_end_time_split[1];
        if(plan_start_date == selected_date){
            plan_time.push(plan_start_time);
        }
        if (plan_end_date == selected_date && plan_end_time != "00:00") {
            plan_time.push(plan_end_time);
        } else if (plan_end_date == date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(selected_date, 1), '-') && plan_end_time == "00:00") {
            plan_time.push('24:00');
        }
    }


    //if(plan_time.indexOf("00:00") < 0){
        plan_time.push("00:00");
    //}
    //if(plan_time.indexOf("24:00") < 0){
        plan_time.push("24:00");
    //}

    let sortedlist = plan_time.sort();

    //all_plans = sortedlist;
    //index 사이 1-2, 3-4, 5-6, 7-8, 9-10, 11-12, 13-14
    let semiresult = [];
    let time_unit;
    // if(Number(setting_info.setting_member_time_duration < 10)){
    //     time_unit = Number(setting_info.class_hour)*Number(setting_info.setting_member_time_duration);
    // }else{
        time_unit = Number(one_to_one_lecture_time_duration);
    // }
    for(let p=0; p<sortedlist.length/2; p++){
        let zz = 0;
        //일정 시작시간이 일정 종료시간보다 작으면,
        // if(compare_time(add_time(sortedlist[p*2],'0:'+Number(zz+time_unit)), add_time(sortedlist[p*2+1],'0:00')) ==false &&
        //     compare_time( add_time(sortedlist[p*2],'0:'+Number(zz+time_unit)), add_time(workEndTime_ ,'00:00')) == false  ){

        // while 조건 : 검사하는 시작시각이 이미 존재하는 일정의 시작시각보다 작을때 동작
        while(!compare_time(add_time(sortedlist[p*2], '0:'+Number(zz+time_unit)), add_time(sortedlist[p*2+1], '0:00'))){
            // 업무 시작시각보다 큰 시작사각만 추가
            if( compare_time( workStartTime_, add_time(sortedlist[p*2], '0:'+zz) ) == false){
                // 업무 종료시각 - time_unit 보다 작은 시작시각만 추가
                if (compare_time( add_time(sortedlist[p*2], '0:'+zz), substract_time(workEndTime_, `00:${time_unit}`) ) ==false){
                    semiresult.push(add_time(sortedlist[p*2], '0:'+zz));
                }
            }
            // time_unit 만큼 더해준다.
            zz += 1;
            // 방어 코드
            if(zz>1450){ //하루 24시간 --> 1440분
                alert('예상치 못한 에러가 발생했습니다. \n 관리자에게 문의해주세요.');
                break;
            }
        }
        // }
    }

    //offAddOkArray = []
    let addOkArrayList = [];
    let start_option = lecture_start_time;
    for(let t=0; t<semiresult.length; t++){
        //if(Number(semiresult[t].split(':')[1])%time_unit == 0){  //몇분 간격으로 시작시간을 보여줄 것인지?
        if(selected_date == currentDate){                                                                   //선택한 날짜가 오늘일 경우
            if(compare_time(semiresult[t], add_time(currentTime, '00:'+(setting_info.setting_member_reserve_enable_time) ))                      //업무시간
                && compare_time(semiresult[t], add_time(workEndTime_, '00:00')) == false
                && compare_time(add_time(workStartTime_, '00:00'), semiresult[t]) == false
                && workStartTime_ != workEndTime_ ){ //근접예약 금지

                if(start_option.split('-')[0] == "A"){
                    if(Number(semiresult[t].split(':')[1]) == Number(start_option.split('-')[1])){  //매시간의 몇분을 시작시간을 보여줄 것인지?
                        addOkArrayList.push(semiresult[t]);
                    }
                }else if(start_option.split('-')[0] == "E"){
                    if(Number(semiresult[t].split(':')[1])%Number(start_option.split('-')[1]) == 0){   //몇분 간격으로 시작시간을 보여줄 것인지?
                        addOkArrayList.push(semiresult[t]);
                    }
                }
            }
        }else{                                                                                     //선택한 날짜가 오늘이 아닐경우
            if(compare_time(semiresult[t], add_time(workEndTime_, '00:00')) == false
                && compare_time(add_time(workStartTime_, '00:00'), semiresult[t]) == false
                && workStartTime_ != workEndTime_){        //업무시간
                let starttimeOption_split = start_option.split('-');
                if(starttimeOption_split[0] == "A"){
                    if(Number(semiresult[t].split(':')[1]) == Number(starttimeOption_split[1])){  //매시간의 몇분을 시작시간을 보여줄 것인지?
                        addOkArrayList.push(semiresult[t]);
                    }
                }else if(starttimeOption_split[0] == "E"){
                    if(Number(semiresult[t].split(':')[1])%Number(starttimeOption_split[1]) == 0){   //몇분 간격으로 시작시간을 보여줄 것인지?
                        addOkArrayList.push(semiresult[t]);
                    }
                }
            }
        }
    }
    // for(let j=0; j<sortedlist.length; j++){
    //     if(j==0) {
    //         // if(sortedlist[j] == "00:00"){
    //         allplans.push(workStartTime_);
    //     }else if(j==sortedlist.length-1){
    //     // }else if(sortedlist[j] == "24:00"){
    //         allplans.push(workEndTime_);
    //     }else{
    //         allplans.push(sortedlist[j]);
    //     }
    // }
    // return {"addOkArray":addOkArrayList, "allplans":sortedlist};
    return {"addOkArray":addOkArrayList};
}


function func_start_time_dom_draw(target_html, selected_date, schedule_json, setting_info, one_to_one_lecture_time_duration, lecture_start_time){
    // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) let offAddOkArray = [5,6,8,11,15,19,21]
    console.log(schedule_json);
    let sArraySet =  func_start_time_calc(selected_date, schedule_json, setting_info, one_to_one_lecture_time_duration, lecture_start_time); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
    let addOkArray = sArraySet.addOkArray;
    let $target_html = $(target_html);

    let text1 = '오전 ';
    let text2 = '오후 ';

    let offOkLen = addOkArray.length;
    let timeArray = [];
    let classDur;
    // if(setting_info.setting_member_time_duration < 10){
    //     classDur = setting_info.class_hour*setting_info.setting_member_time_duration;
    // }else{
        classDur = one_to_one_lecture_time_duration;
    // }
    for(let i=0; i<offOkLen; i++){
        let offHour = addOkArray[i].split(':')[0];
        let offmin = addOkArray[i].split(':')[1];
        let offText = text1; //오전
        let offHours = offHour;
        if(offHour<12){
            offText = text1; //오전
            offHours = offHour;
        }else if(offHour==24){
            offText = text1;
            offHours = offHour-12;
        }else if(offHour==12 || offHour==12.5){
            offText = text2;//오후
            offHours = offHour;
        }else{
            offHours = offHour-12;
            offText = text2;
        }

        let endtime = add_time(addOkArray[i], '00:'+classDur);
        let time_text= offText+offHour+':'+offmin+' ~ '+endtime;
        timeArray[i] ='<option data-start="'+selected_date+' '+addOkArray[i]+'" data-end="'+selected_date+' '+endtime+'">'+time_text+'</option>';
    }
    if(timeArray.length == 0){
        timeArray.unshift('<option selected disabled>예약 가능 시간이 없습니다.</option>');
    }else{
        timeArray.unshift('<option selected disabled>예약 시간 선택</option>');
    }
    let timeArraySum = timeArray.join('');
    $target_html.html(timeArraySum);
}

// function func_lecture_time_dom_draw(target_html, selected_date, schedule_json, setting_info){
//     console.log(schedule_json)
//     func_lecture_wrapper_dom_draw(target_html, selected_date, schedule_json, setting_info)
//     let $target_html = $(target_html);
//     let html_to_join = [];
//     let len = schedule_json.lecture_schedule_lecture_id.length;
//     for(let i=0; i<len; i++){
//         let start_split = schedule_json.lecture_schedule_start_datetime[i].split(' ');
//         let end_split = schedule_json.lecture_schedule_end_datetime[i].split(' ');
//         let this_schedule_start_date = start_split[0];
//         let this_schedule_start_time = start_split[1].substr(0,5);
//         let this_schedule_end_date = end_split[0];
//         let this_schedule_end_time = end_split[1].substr(0,5);

//         let this_schedule_lectureid = schedule_json.lecture_schedule_id[i];
//         let this_schedule_particiants = schedule_json.lecture_schedule_current_member_num[i];
//         let this_schedule_max_participants = schedule_json.lecture_schedule_max_member_num[i];



//         if(this_schedule_start_date == selected_date){
//             html_to_join.push(`<div class="func_radio_element obj_font_size_14_weight_500" data-lecture-schedule-id="${this_schedule_lectureid}">
//                                     <div class="func_radio_element_title">${this_schedule_start_time} ~ ${this_schedule_end_time} (${this_schedule_particiants}/${this_schedule_max_participants}명)</div>
//                                     <div class="func_radio_element_button"><div class="func_radio_element_button_outer"><div class=""></div></div></div>
//                                 </div>`);
//         }
//     }
//     $target_html.html(html_to_join.join(''));
// }
/*
function func_lecture_time_dom_draw(target_html, selected_date, schedule_json, setting_info){

    console.log(schedule_json);
    let $target_html = $(target_html);
    let lecture_ids = schedule_json.lecture_schedule_lecture_id;
    let lecture_names = schedule_json.lecture_schedule_lecture_name;
    let lecture_dic = {};
    let len =lecture_ids.length;
    for(let i=0; i<len; i++){
        lecture_dic[lecture_ids[i]] = lecture_names[i];
    }

    let html_to_join_final = [];
    for(let lecture_id in lecture_dic){
        let html_to_join = [];
        let len = schedule_json.lecture_schedule_lecture_id.length;
        let this_schedule_member_ticket_avail_count = 0;

        for(let i=0; i<len; i++){
            let start_split = schedule_json.lecture_schedule_start_datetime[i].split(' ');
            let end_split = schedule_json.lecture_schedule_end_datetime[i].split(' ');
            let this_schedule_start_date = start_split[0];
            let this_schedule_start_time = start_split[1].substr(0, 5);
            let this_schedule_end_date = end_split[0];
            let this_schedule_end_time = end_split[1].substr(0, 5);

            let this_schedule_lectureid = schedule_json.lecture_schedule_lecture_id[i];
            let this_schedule_lecture_schedule_id = schedule_json.lecture_schedule_id[i];
            let this_schedule_particiants = schedule_json.lecture_schedule_current_member_num[i];
            let this_schedule_max_participants = schedule_json.lecture_schedule_max_member_num[i];


            if(this_schedule_start_date == selected_date && this_schedule_lectureid == lecture_id){
                html_to_join.push(`<div class="func_radio_element obj_font_size_14_weight_500" data-lecture-schedule-id="${this_schedule_lecture_schedule_id}" data-date="${this_schedule_start_date}" data-start-time="${this_schedule_start_time}" data-end-time="${this_schedule_end_time}">
                                        <div class="func_radio_element_title">${this_schedule_start_time} ~ ${this_schedule_end_time} (${this_schedule_particiants}/${this_schedule_max_participants}명)</div>
                                        <div class="func_radio_element_button"><div class="func_radio_element_button_outer"><div class=""></div></div></div>
                                    </div>`);
                this_schedule_member_ticket_avail_count = schedule_json.lecture_member_ticket_avail_count[i];
            }
        }

        if(html_to_join.length > 0){
            let wrap = `<div class="obj_box_full">
                            <div class="obj_table_raw wrapper_ticket_info">
                                <div class="wrapper_ticket_icon_personal obj_table_cell_x3"><img src="/static/common/icon/people_black.png"></div>
                                <div class="wrapper_ticket_name obj_table_cell_x3 obj_font_size_15_weight_normal "> ${lecture_dic[lecture_id]}</div>
                                <div class="wrapper_ticket_reserve_avail_count obj_table_cell_x3 obj_font_size_12_weight_normal">(예약 가능: ${this_schedule_member_ticket_avail_count} 번)</div>
                            </div>
                            <div class="wrapper_reserve_form_data">
                                <div class="func_radio_wrap wrapper_lecture_reserve_select">
                                    ${html_to_join.join('')}
                                </div>
                            </div>
                            <div class="wrapper_reserve_caution obj_font_size_11_weight_500 obj_font_color_grey">
                                <p><span class="obj_font_color_pters_red">수업 시작 ${setting_info.setting_member_reserve_enable_time/60}시간 전까지 예약</span> 할 수 있습니다.</p>
                                <p><span class="obj_font_color_pters_red">수업 시작 ${setting_info.setting_member_reserve_cancel_time/60}시간 전까지 취소</span> 할 수 있습니다.</p>
                            </div>
                        </div>`;
            html_to_join_final.push(wrap);
        }
    }

    $target_html.html(html_to_join_final.join(''));
}
*/
