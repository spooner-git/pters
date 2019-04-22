// 달력 관련
/* global $, windowHeight, windowWidth, setting_info */
function pters_month_calendar(calendar_name, calendar_options){
    const default_design_options = {"font_color_sunday":["obj_font_color_pters_dark_red"],
                                  "font_color_saturday":["obj_font_color_light_blue"],
                                  "font_date_basic":["obj_font_size_12_weight_500"],
                                  "font_day_names":["obj_font_size_11_weight_normal"],
                                  "height_week_row":[50],
                                  "move_buttons":"none",
                                  "expand_buttons": ""};

    const default_targetHTML = '#calendar';

    if(calendar_options.target_html == undefined){
        calendar_options.target_html = default_targetHTML;
    }
    if(calendar_options.design_options == undefined){
        calendar_options.design_options = default_design_options;
    }
    let design_options = calendar_options.design_options;

    const nav_height = parseInt($('body').css('padding-top'), 10);
    const calendar_height = $(window).height() - nav_height - 5;
    const calendar_toolbox_height = 61;
    const calendar_month_day_name_text_height = 40;
    const calendar_timeline_toolbox_height = 35;
    const calendar_month_week_row_total_height = design_options["height_week_row"]*6;
    const calendar_month_inner_height = calendar_month_week_row_total_height+30;

    let last_day_array = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];      //각 달의 일수
    let date = new Date();
    let current_year = date.getFullYear(); //현재 년도
    let current_month = date.getMonth(); //달은 0부터 출력해줌 0~11
    let current_date = date.getDate();
    let today_yyyy_m_d = current_year+'-'+(current_month+1)+'-'+current_date;
    let reference_date = today_yyyy_m_d;
    let original_height;
    let expand_height;

    function func_month_calendar_basic_size(calendar_height){
        //달력을 감싸는 wrapper의 높이를 창크기에 맞춘다. (스크롤링 영역을 달력 안쪽으로만 잡기 위해서)
        // $('.content_page').css("overflow-y", "hidden");
        $('.pters_calendar').css({"height":calendar_height});
    }

    function func_draw_month_calendar_size(calendar_height, calendar_toolbox_height, calendar_month_day_name_text_height){
        // $('.pters_month_cal_content_box').css({"height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height,
        //                                        "max-height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height - 3});

        // $('.pters_month_cal_content_box').css({"height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height,
        //                                        "max-height":300});
        $('.pters_month_cal_content_box').css({"max-height":calendar_month_week_row_total_height+"px"});
    }

    function func_get_month_end_day (input_year, input_month){
        if( (input_year % 4 == 0 && input_year % 100 != 0) || input_year % 400 == 0 ){  //윤년
            last_day_array[1] = 29;
        }else{
            last_day_array[1] = 28;
        }
        return last_day_array[input_month-1];
    }

    function func_get_prev_month(input_year, input_month){
        //입력받은 년월을 기준으로 (연도/전달/전달의 마지막일) 를 구해서 출력해준다.
        let prev_month = new Date(`${input_year}`,`${input_month-1}`,`${'1'}`);
        prev_month.setDate(0);
        return `${prev_month.getFullYear()}-${prev_month.getMonth()+1}-${prev_month.getDate()}`;
    }

    function func_get_next_month(input_year, input_month){
        //입력받은 년월을 기준으로 (연도/다음달/다음달의 1일) 를 구해서 출력해준다.
        let reference_month_last_day = func_get_month_end_day(input_year, input_month);
        let next_month = new Date(`${input_year}`,`${input_month-1}`,`${reference_month_last_day}`);
        next_month.setDate(next_month.getDate()+1);

        return `${next_month.getFullYear()}-${next_month.getMonth()+1}-${next_month.getDate()}`;
    }

    //선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
    function func_draw_month_calendar_table(input_reference_date){
        let targetHTML = calendar_options.target_html;
        let $targetHTML = $(targetHTML);
        let reference_date_split_array = input_reference_date.split('-');
        let reference_date_year = reference_date_split_array[0];
        let reference_date_month = reference_date_split_array[1];
        let reference_date_month_last_day = func_get_month_end_day(reference_date_year, reference_date_month);

        let current_month_first_date_day = new Date(`${reference_date_year}`,`${reference_date_month-1}`,`${'1'}`).getDay();

        let month_calendar_upper_tool = `<div class="pters_month_cal_upper_tool_box">
                                            <div id="${calendar_name}_go_prev_month" class="next_prev_month" style="display:${design_options.move_buttons};">
                                                <img src="/static/common/icon/navigate_before_black.png" class="obj_icon_basic"> 
                                            </div>
                                            <div class="pters_month_cal_tool_date_text">
                                                
                                                <div class="obj_font_size_15_weight_bold">
                                                    ${Number(reference_date_year)}년 ${Number(reference_date_month)}월
                                                </div>
                                            </div>
                                            <div class="expand_button ${calendar_name}_expand_button" style="display:${design_options.expand_buttons};">
                                                <img src="/static/common/icon/expand_more_black.png" class="obj_icon_basic">
                                            </div>
                                            <div id="${calendar_name}_go_next_month" class="next_prev_month" style="display:${design_options.move_buttons};">
                                                <img src="/static/common/icon/navigate_next_black.png" class="obj_icon_basic">
                                            </div>
                                            <div class="help_calendar_indicator obj_font_size_10_weight_500">
                                                <div style="background-color:rgba(255, 59, 68, 0.07)">개인 수업 예약</div>
                                                <div style="background-color:rgba(255, 59, 68, 0.38)">그룹 수업 예약</div>
                                            </div>
                                        </div>`;

        //달력의 월화수목금 표기를 만드는 부분
        let month_day_name_text = `<div class="pters_month_cal_day_name_box obj_table_raw ${design_options["font_day_names"]}"> 
                                    <div class="obj_table_cell_x7 ${design_options["font_color_sunday"]}">일</div>
                                    <div class="obj_table_cell_x7">월</div>
                                    <div class="obj_table_cell_x7">화</div>
                                    <div class="obj_table_cell_x7">수</div>
                                    <div class="obj_table_cell_x7">목</div>
                                    <div class="obj_table_cell_x7">금</div>
                                    <div class="obj_table_cell_x7 ${design_options["font_color_saturday"]}">토</div>  
                                   </div>`;

        //달력의 날짜를 만드는 부분
        let htmlToJoin = [];
        let date_cache = 1;
        for(let i=0; i<6; i++){
            let dateCellsToJoin = [];

            for(let j=0; j<7; j++){
                let data_date = date_format(`${reference_date_year}-${reference_date_month}-${date_cache}`)["yyyy-mm-dd"];
                let font_color = "";
                if(j == 0){
                    font_color = design_options["font_color_sunday"];
                }else if(j == 6){
                    font_color = design_options["font_color_saturday"];
                }

                if(i==0 && j<current_month_first_date_day){ //첫번째 주일때 처리
                    dateCellsToJoin.push(`<div class="obj_table_cell_x7"></div>`);
                }else if(date_cache > reference_date_month_last_day){ // 마지막 날짜가 끝난 이후 처리
                    dateCellsToJoin.push(`<div class="obj_table_cell_x7"></div>`);
                }else{
                    dateCellsToJoin.push(`<div class="obj_table_cell_x7" data-date="${data_date}"
                                               id="calendar_cell_${data_date}">
                                               <div id="calendar_group_plan_cell_${data_date}" class="group_plan_indicator"></div>
                                               <div class="calendar_date_number ${font_color}">${date_cache}</div>
                                               <div id="calendar_plan_cell_${data_date}" class="plan_cell" style="height:${design_options["height_week_row"]-6-20-1}px"></div>
                                          </div>`);
                    // dateCellsToJoin.push(`<div class="obj_table_cell_x7 month_date" data-date="${data_date}">
                    //                            <div id="calendar_group_plan_cell_${data_date}" class="group_plan_indicator"></div>
                    //                            <div class="calendar_date_number ${font_color}">${date_cache}</div>
                    //                            <div id="calendar_plan_cell_${data_date}"></div>
                    //                       </div>`);
                    date_cache++;
                }
            }

            let week_row = `<div class="obj_table_raw" id="week_row_${i}" style="height:${design_options["height_week_row"]}px">
                                ${dateCellsToJoin.join('')}
                            </div>`;
            htmlToJoin.push(week_row);

        }

        let calendar_assembled = `<div class="pters_month_cal_content_box ${design_options["font_date_basic"]}">`+htmlToJoin.join('')+'</div>';

        //달력의 하단 숫자부분만 스크롤 되고, 연월일, 월화수목 표기는 스크롤 되지 않도록 사이즈를 조절한다.


        // let timeline_calendar_upper_tool = `<div class="pters_timeline_cal_upper_tool_box obj_font_size_13_weight_500 obj_font_color_light_grey">
        //                                         <div class="pters_timeline_cal_type_text selected">전체</div>
        //                                         <div class="pters_timeline_cal_type_text">예약 완료</div>
        //                                         <div class="pters_timeline_cal_type_text">예약 대기</div>
        //                                         <div class="pters_timeline_cal_type_text">반복 일정</div>
        //                                         <div></div>
        //                                     </div>`;
        let timeline_calendar_upper_tool = `<div class="pters_timeline_cal_upper_tool_box pters_timeline_cal_upper_tool_box_${calendar_name} obj_font_size_13_weight_500 obj_font_color_light_grey">
                                                <div class="pters_timeline_cal_type_text selected">전체 일정</div>
                                                <div></div>
                                            </div>`;


        let time_line_height = calendar_height  - calendar_toolbox_height - calendar_month_day_name_text_height - calendar_month_week_row_total_height - calendar_timeline_toolbox_height;
        time_line_height = time_line_height + "px";
        //상단의 연월 표기, 일월화수목 표기, 달력숫자를 합쳐서 화면에 그린다.
        $targetHTML.html(`${month_calendar_upper_tool}
                         <div class="obj_box_full ${calendar_name}_wrapper_month_cal">
                            ${month_day_name_text}${calendar_assembled}
                         </div>
                         ${timeline_calendar_upper_tool}
                         <div class="obj_box_full wrapper_cal_timeline" style="height:${time_line_height}">
                         </div>`);

    }

    function func_set_prev_next_month_button(calendar_variable){
        let reference_date_split_array = reference_date.split('-');
        let reference_year = reference_date_split_array[0];
        let reference_month = reference_date_split_array[1];
        let inner_calendar_name = calendar_name;
        let prev_id = inner_calendar_name + "_go_prev_month";
        let next_id = inner_calendar_name + "_go_next_month";
        $('#'+prev_id).click(function(){
            calendar_variable.draw_month_calendar_table(func_get_prev_month(reference_year, reference_month),
                                                        design_options);
            func_get_ajax_schedule_data(reference_date, "callback", function(jsondata){
                func_set_avail_date(jsondata.avail_date_data);
                func_draw_schedule_data(jsondata);
                func_draw_schedule_timeline_data(jsondata);
                func_set_timeline_to_today_or_near();
            });
        });
        $('#'+next_id).click(function(){
            calendar_variable.draw_month_calendar_table(func_get_next_month(reference_year, reference_month),
                                                        design_options);
            func_get_ajax_schedule_data(reference_date, "callback", function(jsondata){
                func_set_avail_date(jsondata.avail_date_data);
                func_draw_schedule_data(jsondata);
                func_draw_schedule_timeline_data(jsondata);
                func_set_timeline_to_today_or_near();
            });
        });
    }


    function func_move_month(direction){
        if( $(`.${calendar_name}_wrapper_month_cal`).css('display') == "block"){
            $(`#${calendar_name}_go_${direction}_month`).trigger('click');
        }
    }

    function func_set_touch_move_to_month_calendar(input_target_html){
        let ts;
        let tsy;
        let selector_body = $(input_target_html);
        selector_body.bind("touchstart", function(e){
            ts = e.originalEvent.touches[0].clientX;
            tsy = e.originalEvent.touches[0].clientY;
        });

        /**
         * @param e.originalEvent.changedTouches 터치 변화.
         */
        selector_body.bind("touchend", function(e){
            let te = e.originalEvent.changedTouches[0].clientX;
            let tey = e.originalEvent.changedTouches[0].clientY;
            if(Math.abs(tsy - tey) < 100){
               if(ts>te+50){
                    func_move_month("next");
                }else if(ts<te-50){
                    func_move_month("prev");
                }
            }
        });
    }


    //일정 표기 관련
    function func_get_ajax_schedule_data(input_reference_date, use, callback){
        $.ajax({
            url: '/trainee/get_trainee_schedule/',
            type : 'GET',
            data : {"date": input_reference_date, "day":31},
            dataType : 'html',

            beforeSend:function(xhr, settings){
                func_ajax_before_send(xhr, settings, "func_get_ajax_schedule_data");
            },

            success:function(data){
                let jsondata = JSON.parse(data);
                /**
                 * @param jsondata.messageArray
                 * @param jsondata.avail_date_data
                 **/
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray);
                }else{
                    if(use == "callback"){
                        callback(jsondata);
                    }
                    // func_draw_schedule_timeline_data(jsondata);
                }
                
            },

            complete:function(){
                func_ajax_after_send("func_get_ajax_schedule_data");
            },

            error:function(){
                console.log('server error');
            }
        });
    }

    function func_set_avail_date(avail_date_array){
        let length = avail_date_array.length;
        let temp_array = [];
        for(let i=0; i<length; i++){
            temp_array.push(`#calendar_plan_cell_${avail_date_array[i]}`);
            $(`#calendar_plan_cell_${avail_date_array[i]}`).parent('.obj_table_cell_x7').css('background-color', 'rgba(255, 59, 68, 0.07)').attr('onclick', `layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_reserve', 90, POPUP_FROM_BOTTOM, {'select_date':'${avail_date_array[i]}'})`);
        }
        let $first_day = $(`${temp_array.shift()}`);
        $first_day.siblings('div.calendar_date_number').css({'height':'20px', 'width':'20px', 'border-radius':'50%', 'background-color':'#ff4b4b', 'margin':'0 auto', 'color':'#ffffff'});
        $first_day.parent('.obj_table_cell_x7').css({'background-color': 'rgba(255, 59, 68, 0.07)'});
        // $first_day.parent('.obj_table_cell_x7').css({'background-color': 'rgba(0, 0, 0, 0.1)', 'border-top-left-radius':'5px', 'border-bottom-left-radius':'5px'});
        // $(`${temp_array.pop()}`).parent('.obj_table_cell_x7').css({'background-color': 'rgba(0, 0, 0, 0.1)', 'border-top-right-radius':'5px', 'border-bottom-right-radius':'5px'});
        // $(`${temp_array.join(', ')}`).parent('.obj_table_cell_x7').css('background-color', 'rgba(255, 59, 68, 0.07)').attr('onclick', `"layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_reserve', 90, POPUP_FROM_BOTTOM, {'select_date':'${temp_array.join(', ')}'})"`);
    }

    /**
     * @param jsondata                              schedule json data object.
     * @param jsondata.classTimeArray_start_date    시작 시각.
     * @param jsondata.group_schedule_start_datetime 그룹 스케쥴 시작 시각
     */
    function func_draw_schedule_data(jsondata){
        $('.schedule_marking, .schedule_marking_group').remove();
        let schedule_number_dic = {"general":{}, "group":{}};
        let date_cache = [];
        let date_cache_group = [];
        let len = jsondata.classTimeArray_start_date.length;
        let len2 = jsondata.group_schedule_start_datetime.length;
        for(let i=0; i<len; i++){
            let date = jsondata.classTimeArray_start_date[i].split(' ')[0];
            date_cache.push(date);
            schedule_number_dic["general"][date] = 0;
        }
        for(let j=0; j<len2; j++){
            let date_group = jsondata.group_schedule_start_datetime[j].split(' ')[0];
            date_cache_group.push(date_group);
            schedule_number_dic["group"][date_group] = 0;
        }

        for(let date in schedule_number_dic["general"]){
            $(`#calendar_cell_${date}`).attr('onclick', `layer_popup.open_layer_popup(${POPUP_AJAX_CALL}, 'popup_calendar_plan_view', 90, ${POPUP_FROM_BOTTOM}, {'select_date':'${date}'})`);
            $(`#calendar_plan_cell_${date}`).html(`<div class="schedule_marking"></div>`);
        }
        for(let date_group in schedule_number_dic["group"]){
            // $(`#calendar_plan_cell_${date_group}`).html(`<div class="schedule_marking_group"></div>`);
            $(`#calendar_group_plan_cell_${date_group}`).css('background-color', 'rgba(255, 59, 68, 0.38)');
        }
    }
    //일정 표기 관련

    function func_draw_schedule_timeline_data(jsondata){

        let data_dic_form = func_make_schedule_data_for_timeline(jsondata);
        let $target_html = $('.wrapper_cal_timeline');
        let html_to_join_array = [];

        let reference_month = Number(reference_date.split('-')[1]);

        for(let date in data_dic_form){
            let date_month = Number(date.split('-')[1]);
            if(date_month != reference_month){
                continue;
            }
            let temp_array = [];
            let len = data_dic_form[date].length;
            for(let i=0; i<len; i++){
                let split = data_dic_form[date][i].split(' / ');
                let schedule_name = split[0];
                let schedule_time_start = split[1].substr(0, 5);
                let schedule_time_end = split[2].substr(0, 5);
                let schedule_id = split[3];
                let schedule_finish = split[4];
                let schedule_repeat_id = split[5];
                let schedule_type = '개별일정';
                let schedule_finish_tag;
                if(schedule_finish==SCHEDULE_NOT_FINISH){
                    schedule_finish = '예약 완료';
                    schedule_finish_tag = "obj_font_bg_coral_trans";
                }
                else if(schedule_finish==SCHEDULE_FINISH){
                    schedule_finish = '참석 완료';
                    schedule_finish_tag = "obj_font_bg_white_coral";
                }
                else if(schedule_finish==SCHEDULE_ABSENCE){
                    schedule_finish = '결석';
                    schedule_finish_tag = "obj_font_bg_white_grey";
                }
                if(schedule_repeat_id != 'None'){
                    schedule_type = '반복일정';
                    schedule_finish_tag = "obj_font_bg_coral_trans";
                }

                temp_array.push(`<div class="obj_table_raw" data-scheduleid=${schedule_id}>
                                    <div class="obj_table_cell_x2">
                                            <img src=""><span class="obj_font_size_14_weight_normal">${schedule_name}</span><div class="obj_tag ${schedule_finish_tag} obj_font_size_16_weight_bold">${schedule_finish}</div>
                                        </div>
                                        <div class="obj_table_cell_x2 obj_font_size_14_weight_500">${schedule_time_start}~${schedule_time_end}</div>
                                    </div>
                                    `
                                );
            }
            html_to_join_array.push(
                                        `
                                        <div class="timeline_element_date" onclick="layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_view', 90, POPUP_FROM_BOTTOM, {'select_date':'${date}'})">
                                            <div class="timeline_date_text obj_font_size_11_weight_bold" id="timeline_${date}">${date_format(date)["yyyy.mm.dd"]}</div>
                                            ${temp_array.join('')}
                                        </div>
                                        `
                                    );

        }
        if(html_to_join_array.length == 0){
            html_to_join_array.push(
                                        `
                                        <div class="obj_box_full" style="height:70px;text-align:center;margin-top:5px;">
                                            <div class="obj_font_size_12_weight_500 obj_font_color_dark_grey" style="line-height:70px;">일정이 없습니다.</div>
                                        </div>
                                        `
                                    );
        }
        let html = html_to_join_array.join('');

        $target_html.html(html);
        func_set_scrolling_to_timeline('.wrapper_cal_timeline');
        //func_set_month_date_button_for_timeline();
    }

    function func_set_timeline_to_today_or_near(){
        let timeline_date_text_loc_array = {};
        // let len = $('.timeline_date_text').length;
        // each 빼는 방법 고려해보기
        let timeline_date_length = 0;
        $('.timeline_date_text').each(function(){
            timeline_date_length++;
            let id = $(this).attr('id');
            timeline_date_text_loc_array[id] = $(this).offset().top - nav_height -calendar_toolbox_height - calendar_month_inner_height - calendar_timeline_toolbox_height;
        });


        let today_yyyy_mm_dd = date_format(today_yyyy_m_d)["yyyy-mm-dd"];
        let if_today_has_schedule = $(`#calendar_cell_${today_yyyy_mm_dd} .schedule_marking`).length;
        if(if_today_has_schedule > 0){
            let desire_date_position =  timeline_date_text_loc_array[`timeline_${today_yyyy_mm_dd}`];
            $('.wrapper_cal_timeline').animate( { scrollTop : desire_date_position }, function(){
                $('.wrapper_cal_timeline').animate( { scrollTop : desire_date_position }, 100 );
            });
        }else{
            if(timeline_date_length == 0){
                return;
            }else{

                //오늘 날짜부터 하나씩 더하면서 일정이 있는 가장 가까운 날짜 찾기
                let plus_scan = 0;
                let date_for_scan = today_yyyy_mm_dd;
                while($(`#timeline_${date_for_scan}`).length == 0){
                    date_for_scan = date_format(`${current_year}-${current_month+1}-${current_date+plus_scan}`)["yyyy-mm-dd"];
                    plus_scan++;
                    if(plus_scan > 31){
                        date_for_scan = today_yyyy_mm_dd;
                        break;
                    }
                }

                //오늘 날짜부터 하나씩 빼면서 일정이 있는 가장 가까운 날짜 찾기
                let minus_scan = 0;
                while($(`#timeline_${date_for_scan}`).length == 0){
                    minus_scan--;
                    date_for_scan = date_format(`${current_year}-${current_month+1}-${current_date+minus_scan}`)["yyyy-mm-dd"];
                    if(minus_scan < -31){
                        date_for_scan = today_yyyy_mm_dd;
                        break;
                    }
                }

                if(date_for_scan != today_yyyy_mm_dd){
                    let desire_date_position =  timeline_date_text_loc_array[`timeline_${date_for_scan}`];
                    $('.wrapper_cal_timeline').animate( { scrollTop : desire_date_position }, function(){
                        $('.wrapper_cal_timeline').animate( { scrollTop : desire_date_position }, 100 );
                    });
                }

            }
        }
    }

    /**
     * @param jsondata                              schedule json data object.
     * @param jsondata.classTimeArray_start_date    시작 시각.
     * @param jsondata.classTimeArray_end_date 종료 시각
     * @param jsondata.scheduleIdArray 스케쥴 ID
     * @param jsondata.schedule_group_name 스케쥴 그룹 명
     */
    function func_make_schedule_data_for_timeline(jsondata){
        let json = jsondata;
        let len = json.classTimeArray_start_date.length;
        let dic = {};
        for(let i=0; i<len; i++){
            dic[json.classTimeArray_start_date[i].split(' ')[0]] = [];
        }
        for(let j=0; j<len; j++){
            let schedule_start_time = json.classTimeArray_start_date[j].split(' ')[1];
            let schedule_end_time = json.classTimeArray_end_date[j].split(' ')[1];
            let schedule_id = json.scheduleIdArray[j];
            let schedule_name = json.schedule_group_name[j];
            let schedule_finish = json.scheduleFinishArray[j];
            let schedule_repeat_id = json.class_repeat_schedule_id[j];
            if(schedule_name.length == 0){
                schedule_name = "개인 레슨";
            }
            dic[json.classTimeArray_start_date[j].split(' ')[0]].push(schedule_name+' / '+schedule_start_time+' / '+schedule_end_time+' / '+schedule_id+' / '+schedule_finish+' / '+schedule_repeat_id);
        }
        return dic;
    }

    function func_set_month_date_button_for_timeline(){
        let timeline_date_text_loc_array = {};
        // let len = $('.timeline_date_text').length;
        // each 빼는 방법 고려해보기
        $('.timeline_date_text').each(function(){
            let id = $(this).attr('id');
            timeline_date_text_loc_array[id] = $(this).offset().top - nav_height -calendar_toolbox_height - calendar_month_inner_height - calendar_timeline_toolbox_height;
        });

        $('.month_date').off();
        $('.month_date').click(function(){
            let cliked_date = $(this).attr('data-date');
            let if_this_has_schedule = $(this).find('.schedule_marking').length;
            if(if_this_has_schedule > 0){
                let desire_date_position =  timeline_date_text_loc_array[`timeline_${cliked_date}`];
                $('.wrapper_cal_timeline').animate( { scrollTop : desire_date_position }, function(){
                    $('.wrapper_cal_timeline').animate( { scrollTop : desire_date_position }, 100 );
                });
            }else{
                console.log('month_date_click_check');
                layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_view', 90, POPUP_FROM_BOTTOM, {'select_date':`${cliked_date}`});
            }
        });
    }

    function func_set_scrolling_to_timeline(target_selector){
        func_set_webkit_overflow_scrolling(target_selector);
    }

    function func_set_expand_function(){
        let calendar_month_height = $(`.${calendar_name}_wrapper_month_cal`).height();
        $(document).on('click', `.${calendar_name}_expand_button, .pters_timeline_cal_upper_tool_box_${calendar_name}`, function(){
            let data = $(`.${calendar_name}_expand_button`).attr('data-open');
            // let original_height;
            // let expand_height;
            func_time_line_wide_view(data, calendar_month_height);
        });
    }

    function func_time_line_wide_view(type, calendar_month_height){
        let $calendar_name_expand_button = $(`.${calendar_name}_expand_button`);
        let $calendar_name_expand_button_img = $(`.${calendar_name}_expand_button`).find('img');
        let $calendar_name_wrapper_month_cal = $(`.${calendar_name}_wrapper_month_cal`);
        
        let $wrapper_cal_timeline = $('.wrapper_cal_timeline');
        switch(type){
            case SHOW:
                $calendar_name_expand_button.attr('data-open', HIDE);
                $calendar_name_expand_button_img.attr('src', '/static/common/icon/expand_more_black.png');
                // $calendar_name_wrapper_month_cal.show();
                $calendar_name_wrapper_month_cal.animate({'height': `${calendar_month_height}px`}, 200);
                $wrapper_cal_timeline.css('height', `${original_height}px`);
            break;

            case HIDE:
                $calendar_name_expand_button.attr('data-open', SHOW);
                $calendar_name_expand_button_img.attr('src', '/static/common/icon/expand_less_black.png');
                // $calendar_name_wrapper_month_cal.hide();
                $calendar_name_wrapper_month_cal.animate({height: 0}, 200);
                $wrapper_cal_timeline.css('height', `${expand_height}px`);
            break;

            case undefined:
                original_height = parseInt($wrapper_cal_timeline.css('height'));
                expand_height = calendar_height - calendar_toolbox_height - calendar_timeline_toolbox_height;

                $calendar_name_expand_button.attr('data-open', SHOW);
                $calendar_name_expand_button_img.attr('src', '/static/common/icon/expand_less_black.png');
                // $calendar_name_wrapper_month_cal.hide();
                $calendar_name_wrapper_month_cal.animate({height: 0}, 200);
                $wrapper_cal_timeline.css('height', `${expand_height}px`);
        }
    }

    


    return {
        "set_calendar_name": function(input_calendar_name){
            //특수 문자 제외 필요
            if(input_calendar_name!=undefined){
                calendar_name = input_calendar_name;
            }
            this.draw_month_calendar_table(reference_date);
        },
        "get_calendar_name": function() {
            return calendar_name;
        },
        "init_month_calendar_table":function(){
            func_draw_month_calendar_table(today_yyyy_m_d);
            func_draw_month_calendar_size(calendar_height, calendar_toolbox_height, calendar_month_day_name_text_height);
            func_month_calendar_basic_size(calendar_height);
            func_set_touch_move_to_month_calendar(calendar_options.target_html);
            func_set_prev_next_month_button(this);
            func_set_expand_function(this);
        },
        "get_design_options": function() {
            return design_options;
        },
        "set_design_options": function(input_design_options){
            if(input_design_options==undefined){
                input_design_options = default_design_options;
            }
            design_options = input_design_options;
            this.draw_month_calendar_table(reference_date);
        },
        "get_reference_date": function(){
            return reference_date;
        },
        "draw_month_calendar_table":function (input_reference_date) {

            if(input_reference_date==undefined){
                input_reference_date = today_yyyy_m_d;
            }
            reference_date = input_reference_date;
            func_draw_month_calendar_table(input_reference_date);
            func_draw_month_calendar_size(calendar_height, calendar_toolbox_height, calendar_month_day_name_text_height);
            func_set_prev_next_month_button(this);
        },
        "draw_month_calendar_schedule":function(input_reference_date){
            if(input_reference_date==undefined){
                input_reference_date = current_year+'-'+(current_month+1)+'-'+1;
            }
            func_get_ajax_schedule_data(input_reference_date, "callback", function(jsondata){
                func_set_avail_date(jsondata.avail_date_data);
                func_draw_schedule_data(jsondata);
                func_draw_schedule_timeline_data(jsondata);
                func_set_timeline_to_today_or_near();
            });
        },
        "get_current_month":function(){
            return reference_date;
        }
    };
}


function date_format(date){
    let date_raw = date.replace(/[-_., ]/gi,"-").split('-');
    let yyyy = date_raw[0];
    let m = Number(date_raw[1]);
    let d = Number(date_raw[2]);
    let mm = date_raw[1];
    let dd = date_raw[2];

    if(m<10){
        mm = '0'+m
    }
    if(d<10){
        dd = '0'+d
    }

    return{
            "yyyy-mm-dd":`${yyyy}-${mm}-${dd}`,
            "yyyy-m-d":`${yyyy}-${m}-${d}`,

            "yyyy.mm.dd":`${yyyy}.${mm}.${dd}`,
            "yyyy.m.d":`${yyyy}.${m}.${d}`,

            "yyyy_mm_dd":`${yyyy}_${mm}_${dd}`,
            "yyyy_m_d":`${yyyy}_${m}_${d}`,

            "yyyy/mm/dd":`${yyyy}/${mm}/${dd}`,
            "yyyy/m/d":`${yyyy}/${m}/${d}`
    };
}
