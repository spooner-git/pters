// function planning_function(){
// 	return  {
// 				"create":function(){
// 					func_create_schedule();
// 				},
// 				"update":function(){
// 					func_update_schedule();
// 				},
// 				"delete" : function(){
// 		    		func_cancel_schedule();
// 				}
// 			};
// }

function func_schedule(data, call_method, type){
    if(call_method == CALL_AJAX){
        console.log(data)
        $.ajax({
            url: `/trainee/${type}_trainee_schedule/`,
            data: data,
            dataType : 'html',
            type:'POST',

            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success:function(result_data){
                console.log(result_data)
                let jsondata = JSON.parse(result_data);
                /**
                 * @param jsondata.messageArray
                **/
                let error_message = jsondata.messageArray;
                if(error_message.length>0){
                    layer_popup.close_layer_popup();
                    show_error_message(error_message[0]);
                }else{
                    //성공
                    if(type == ADD){
                        layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_reserve_complete', 90, POPUP_FROM_BOTTOM);
                    }else if(type == DELETE){
                        layer_popup.all_close_layer_popup();
                    }

                    month_calendar.draw_month_calendar_schedule(month_calendar.get_current_month());

                }
            },
            complete:function(){

            },

            error:function(){
                console.log('server error');
            }
        });

    }else if(call_method == CALL_PAGE_MOVE){
        $(`#${data}`).submit();
    }
}


function show_error_message(message){
    layer_popup.open_layer_popup(POPUP_BASIC,
                                 'popup_basic_user_confirm',
                                 POPUP_SIZE_WINDOW, POPUP_FROM_PAGE,
                                 {'popup_title':'',
                                  'popup_comment':`${message}`,
                                  'onclick_function':`layer_popup.close_layer_popup()`});
}




//예약 팝업 드랍다운을 채워주기 위해 들어온 예전 함수들
    function clear_duplicated_date_time(jsondata, selecteddate){
        //중복 제거 (그룹 일정때문에 중복으로 들어오는 것들)
        var all_start_date_time = jsondata.group_schedule_start_datetime.concat(jsondata.offTimeArray_start_date);
        var all_end_date_time = jsondata.group_schedule_end_datetime.concat(jsondata.offTimeArray_end_date);
        var classlen = jsondata.classTimeArray_start_date.length;
        for(var i=0; i<classlen; i++){
            if(jsondata.class_group_schedule_id[i] == "None"){
                all_start_date_time.push(jsondata.classTimeArray_start_date[i]);
                all_end_date_time.push(jsondata.classTimeArray_end_date[i]);
            }
        }

        var disable_time_array_start_date = all_start_date_time;
        var disable_time_array_end_date = all_end_date_time;

        //중복일정시 Test
        var new_disable_time_array_start_date = [];
        var new_disable_time_array_end_date =[];
        for(var n=0; n<disable_time_array_start_date.length; n++){
            if(disable_time_array_end_date[n].split(" ")[1] == "00:00:00"){
                disable_time_array_end_date[n] = disable_time_array_start_date[n].split(" ")[0] + " 24:00:00";
            }
            new_disable_time_array_start_date.push(disable_time_array_start_date[n]);
            new_disable_time_array_end_date.push(disable_time_array_end_date[n]);
        }
        var check_duplication = true; // 시작시 중복이 있다고 가정
        var resultStart_Array = new_disable_time_array_start_date; // 시작시각 결과 값
        var resultEnd_Array = new_disable_time_array_end_date; // 종료시각 결과 값
        var error_check = 0; //에러 방지 코드

        while(check_duplication){ // 중복된 값이 있는지 체크 (최대 3번 돌아감)
            error_check++;
            check_duplication = false; // 중복된 값이 없다고 초기값 셋팅

            var temp_resultStart_Array = resultStart_Array; //중복 검사를 위해 중복 걸러진 시작 값 셋팅
            var temp_resultEnd_Array = resultEnd_Array; //중복 검사를 위해 중복 걸러진 종료 값 셋팅
            resultStart_Array = []; // 시작시각 결과 값 비우기
            resultEnd_Array = []; // 종료시각 결과 값 비우기

            //중복 걸러진 시작값 갯수 기준으로 시작
            var temp_result_start_array_length = temp_resultStart_Array.length;
            for(var i=0; i<temp_result_start_array_length; i++){
                //비교 대상 셋팅
                var s_split = temp_resultStart_Array[i].split(' ');
                var e_split = temp_resultEnd_Array[i].split(' ');
                var s_date = s_split[0];
                var e_date = e_split[0];
                var s_time = s_split[1];
                var e_time = e_split[1];
                if(selecteddate != ""){
                    if(s_date == e_date && s_date == selecteddate && e_date == selecteddate){ //선택한 날짜인 경우만 체크
                        var start_time_temp = temp_resultStart_Array[i];
                        var end_time_temp = temp_resultEnd_Array[i];

                        // 비교 대상은 중복 걸러진 시작값중 자신 제외한 모든 값
                        for(var j=0; j<temp_result_start_array_length; j++){
                            if(i==j){//자기 자신인 경우 제외 (중복 체크가 되어버림)
                                continue;
                            }
                            var s_split_compare = temp_resultStart_Array[j].split(' ');
                            var e_split_compare = temp_resultEnd_Array[j].split(' ');
                            var s_date_compare = s_split_compare[0];
                            var e_date_compare = e_split_compare[0];
                            var s_time_compare = s_split_compare[1];
                            var e_time_compare = e_split_compare[1];

                            // 중복 체크후 합치기 (일정 같은 경우 포함)
                            if(e_date==e_date_compare) {
                                if (know_whether_plans_has_duplicates(s_time, e_time, s_time_compare, e_time_compare) > 0) {
                                    var merged_time = compare_times_to_merge_min_max(start_time_temp, end_time_temp, temp_resultStart_Array[j], temp_resultEnd_Array[j]);
                                    start_time_temp = merged_time.start;
                                    end_time_temp = merged_time.end;
                                    check_duplication = true; // 중복된 값 체크
                                }
                            }
                        }

                        //시작 시각과 종료시각이 같은 일정이 있는지 확인
                        var check_equal_time = false;
                        var start_time_temp_index = resultStart_Array.indexOf(start_time_temp);
                        if(start_time_temp_index != -1){
                            if(resultEnd_Array[start_time_temp_index]==end_time_temp){
                                check_equal_time = true;
                            }
                        }
                        //시작 시각과 종료시각이 같은 일정이 없으면 결과값에 추가
                        if(!check_equal_time){
                            resultStart_Array.push(start_time_temp);
                            resultEnd_Array.push(end_time_temp);
                        }
                    }
                }
                else{
                    var start_time_temp = temp_resultStart_Array[i];
                    var end_time_temp = temp_resultEnd_Array[i];

                    // 비교 대상은 중복 걸러진 시작값중 자신 제외한 모든 값
                    for(var j=0; j<temp_result_start_array_length; j++){
                        if(i==j){//자기 자신인 경우 제외 (중복 체크가 되어버림)
                            continue;
                        }
                        var s_split_compare = temp_resultStart_Array[j].split(' ');
                        var e_split_compare = temp_resultEnd_Array[j].split(' ');
                        var s_date_compare = s_split_compare[0];
                        var e_date_compare = e_split_compare[0];
                        var s_time_compare = s_split_compare[1];
                        var e_time_compare = e_split_compare[1];
                        if(e_date==e_date_compare){
                        // 중복 체크후 합치기 (일정 같은 경우 포함)
                            if(know_whether_plans_has_duplicates(s_time, e_time, s_time_compare, e_time_compare) > 0){
                                var merged_time = compare_times_to_merge_min_max(start_time_temp, end_time_temp, temp_resultStart_Array[j], temp_resultEnd_Array[j]);
                                start_time_temp = merged_time.start;
                                end_time_temp = merged_time.end;
                                check_duplication = true; // 중복된 값 체크
                            }
                        }
                    }

                    //시작 시각과 종료시각이 같은 일정이 있는지 확인
                    var check_equal_time = false;
                    var start_time_temp_index = resultStart_Array.indexOf(start_time_temp);
                    if(start_time_temp_index != -1){
                        if(resultEnd_Array[start_time_temp_index]==end_time_temp){
                            check_equal_time = true;
                        }
                    }
                    //시작 시각과 종료시각이 같은 일정이 없으면 결과값에 추가
                    if(!check_equal_time){
                        resultStart_Array.push(start_time_temp);
                        resultEnd_Array.push(end_time_temp);

                    }
                }
            }
            // 혹시 모를 에러 방지 코드
            if(error_check>1000){
                console.log('error 발생 : ');
                break;
            }
        }

        return {"clear_start_array":resultStart_Array, "clear_end_array":resultEnd_Array};
    }

    function know_whether_plans_has_duplicates(starttime, endtime, starttime_compare, endtime_compare){
        if( compare_time(starttime_compare, starttime) && compare_time(endtime, endtime_compare)  ){  //비교대상 시간이 비교시간안에 쏙 들어갈때
            return 1;
        }else if( compare_time(starttime, starttime_compare) == false  && compare_time(endtime, starttime_compare) && compare_time(endtime, endtime_compare) == false){ //비교 대상 시간의 시작시간이 비교시간안에 들어가 있을때
            return 2;
        }else if( compare_time(starttime_compare, starttime) == false && compare_time(endtime_compare, starttime) && compare_time(endtime_compare, endtime) == false){ //비교 대상 시간의 종료시간이 비교 시간 안에 들어가 있을때
            return 3;
        }else if( compare_time(starttime, starttime_compare) && compare_time(endtime_compare, endtime) ){ //비교 대상 시간이 비교시간을 완전히 감쌀때
            return 4;
        }else if(starttime == starttime_compare && endtime == endtime_compare){
            return 5;
        }else{
           return 0;
        }
    }

    function compare_times_to_merge_min_max(s_date, e_date, s_date2, e_date2){
        var s_date_split = s_date.split(' ');
        var s_date2_split = s_date2.split(' ');
        var e_date_split = e_date.split(' ');
        var e_date2_split = e_date2.split(' ');
        var sdate1 = s_date_split[0];
        var sdate2 = s_date2_split[0];
        var edate1 = e_date_split[0];
        var edate2 = e_date2_split[0];
        var stime1 = (s_date_split[1]);
        var stime2 = (s_date2_split[1]);
        var etime1 = (e_date_split[1]);
        var etime2 = (e_date2_split[1]);
        var timearray = [stime1, stime2, etime1, etime2];
        var stime_new;
        var etime_new;
        timearray.sort();
        if(sdate1 == sdate2 && edate1 == edate2){
            stime_new = timearray[0];
            etime_new = timearray[3];

            return {"start":`${sdate1} ${stime_new}`, "end":`${edate1} ${etime_new}`}
        }else{
            console.log("날짜 값이 다릅니다.");
            return false
        }
    }

    function time_h_m_to_hh_mm(time){
        var hour = Number(time.split(':')[0]);
        var min = Number(time.split(':')[1]);
        if(hour < 10){
            hour = '0' + Number(time.split(':')[0]);
        }
        if(min < 10){
            min = '0' + Number(time.split(':')[1]);
        }
        return hour + ':' + min;
    }

    function add_time(starttime, addvalue){
        var starttimeSplit = starttime.split(':');
        var addvalueSplit = addvalue.split(':');
        var shour = Number(starttimeSplit[0]);
        var smin = Number(starttimeSplit[1]);
        var addhour = Number(addvalueSplit[0]);
        var addmin = Number(addvalueSplit[1]);

        if(smin + addmin >= 60){
            if(shour + addhour >= 24){  // 23 + 4 --> 3
                if(shour + addhour == 24){
                    var resultHour = 25;
                }else{
                    var resultHour = addhour - (24-shour);
                }
                var resultMin = smin + addmin - 60;
            }else if(shour + addhour < 24){
                var hourplus = parseInt((smin + addmin)/60);
                var resultHour = shour + addhour + hourplus;
                var resultMin = (smin + addmin)%60;
            }
        }else if(smin + addmin < 60){
            if(shour + addhour >= 24){  //23 + 1 --> 00
                if(shour + addhour == 24){
                    var resultHour = 24;
                }else{
                    var resultHour = (shour + addhour) - 24;
                }
                var resultMin = smin + addmin;
            }else if(shour + addhour < 24){
                var resultHour = shour + addhour;
                var resultMin = smin + addmin;
            }
        }

        if(resultHour<10){
            var resultHour = '0' + resultHour;
        }
        if(resultMin<10){
            var resultMin = '0' + resultMin;
        }


        return resultHour + ":" + resultMin;
    }

    function substract_time(starttime, subvalue){
        var shour = Number(starttime.split(':')[0]);
        var smin = Number(starttime.split(':')[1]);
        var subhour = Number(subvalue.split(':')[0]);
        var submin = Number(subvalue.split(':')[1]);
        if(submin > 60){
            subhour = subhour + parseInt(submin/60);
            submin = submin%60;
        }

        if(smin - submin >= 0){
            if(shour - subhour >= 0){
                var resultHour = shour - subhour;
                var resultMin = smin - submin;
            }else if(shour - subhour < 0){
                var resultHour = 24 + (shour - subhour);
                var resultMin = smin - submin;
            }

        }else if(smin - submin < 0){
            if(shour - subhour > 0){
                var resultHour = shour - subhour - 1;
                var resultMin = smin + (60 - submin);
                // var hourminus = parseInt( (submin + smin)/60 );
                // var resultHour = shour - subhour - hourminus - 1;
                // var resultMin = (smin - submin)%60;
                // if(resultMin < 0){
                //  resultMin = 60 + resultMin;
                // }

            }else if(shour - subhour <= 0){
                var resultHour = 24 + (shour - subhour) - 1;
                var resultMin = smin + (60 - submin);
                // var hourminus = parseInt( (smin - submin)/60 );
                // var resultHour = shour - subhour + hourminus - 1;
                // var resultMin = (smin - submin)%60;
                // if(resultMin < 0){
                //  resultMin = 60 + resultMin;
                // }
            }
        }

        if(resultHour<10){
            var resultHour = '0' + resultHour;
        }
        if(resultMin<10){
            var resultMin = '0' + resultMin;
        }


        return resultHour + ":" + resultMin;
    }

    function compare_time(time1, time2){
        var hour1 = time1.split(':')[0];
        var min1  = time1.split(':')[1];
        var hour2 = time2.split(':')[0];
        var min2  = time2.split(':')[1];

        var time1_num = hour1+min1;
        var time2_num = hour2+min2;

        if(Number(time1_num) > Number(time2_num) ){
            return true;
        }else{
            return false;
        }
    }

    function date_format_yyyy_m_d_to_yyyy_mm_dd(yyyy_m_d, resultSplit){
        var yyyy = '';
        var mm = '';
        var dd = '';
        if(yyyy_m_d.split('-').length == 3){
            yyyy = String(yyyy_m_d.split('-')[0]);
            mm = String(yyyy_m_d.split('-')[1]);
            dd = String(yyyy_m_d.split('-')[2]);
        }else if(yyyy_m_d.split('_').length == 3){
            yyyy = String(yyyy_m_d.split('_')[0]);
            mm = String(yyyy_m_d.split('_')[1]);
            dd = String(yyyy_m_d.split('_')[2]);
        }

        if(mm.length<2){
            mm = '0' + mm;
        }
        if(dd.length<2){
            dd = '0' + dd;
        }
        return yyyy+resultSplit+mm+resultSplit+dd;
    }
//예약 팝업 드랍다운을 채워주기 위해 들어온 예전 함수들

