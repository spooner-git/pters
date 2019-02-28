// 달력 관련
function pters_month_calendar(calendar_name, calendar_options){
    const default_design_options = {"font_color_sunday":["obj_font_color_pters_dark_red"],
                                  "font_color_saturday":["obj_font_color_light_blue"],
                                  "font_date_basic":["obj_font_size_12_weight_500"],
                                  "font_day_names":["obj_font_size_11_weight_normal"],
                                  "height_week_row":[50]};

    const default_targetHTML = '#calendar';

    if(calendar_options.target_html == undefined){
        calendar_options.target_html = default_targetHTML;
    }
    if(calendar_options.design_options == undefined){
        calendar_options.design_options = default_design_options;
    }
    let design_options = calendar_options.design_options;

    const calendar_height = $(window).height() - parseInt($('body').css('padding-top'), 10) - 5;
    const calendar_toolbox_height = 61;
    const calendar_month_day_name_text_height = 40;
    const calendar_timeline_toolbox_height = 35;

    let last_day_array = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];      //각 달의 일수
    let date = new Date();
    let current_year = date.getFullYear(); //현재 년도
    let current_month = date.getMonth(); //달은 0부터 출력해줌 0~11
    let current_date = date.getDate();
    let today_yyyy_mm_dd = current_year+'-'+(current_month+1)+'-'+current_date;
    let reference_date = today_yyyy_mm_dd;

    function func_month_calendar_basic_size(calendar_height){
        //달력을 감싸는 wrapper의 높이를 창크기에 맞춘다. (스크롤링 영역을 달력 안쪽으로만 잡기 위해서)
        // $('.content_page').css("overflow-y", "hidden");
        $('.pters_calendar').css({"height":calendar_height});
    }

    function func_draw_month_calendar_size(calendar_height, calendar_toolbox_height, calendar_month_day_name_text_height){
        // $('.pters_month_cal_content_box').css({"height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height,
        //                                        "max-height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height - 3});
        $('.pters_month_cal_content_box').css({"height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height,
                                               "max-height":300});
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

        //달력의 상단의 연월 표기
        // let month_calendar_upper_tool = `<div class="pters_month_cal_upper_tool_box">
        //                                     <div id="${calendar_name}_go_prev_month" class="next_prev_month">
        //                                         <img src="/static/common/icon/navigate_before_black.png" class="obj_icon_basic"> 
        //                                     </div>
        //                                     <div class="pters_month_cal_tool_date_text">
                                                
        //                                         <div class="obj_font_size_20_weight_bold">
        //                                             ${Number(reference_date_year)}년 ${Number(reference_date_month)}월
        //                                         </div>
        //                                     </div>
        //                                     <div id="${calendar_name}_go_next_month" class="next_prev_month">
        //                                         <img src="/static/common/icon/navigate_next_black.png" class="obj_icon_basic">
        //                                     </div>
        //                                 </div>`;
        let month_calendar_upper_tool = `<div class="pters_month_cal_upper_tool_box">
                                            <div id="${calendar_name}_go_prev_month" class="next_prev_month" style="display:none;">
                                                <img src="/static/common/icon/navigate_before_black.png" class="obj_icon_basic"> 
                                            </div>
                                            <div class="pters_month_cal_tool_date_text">
                                                
                                                <div class="obj_font_size_20_weight_bold">
                                                    ${Number(reference_date_year)}년 ${Number(reference_date_month)}월
                                                </div>
                                            </div>
                                            <div id="${calendar_name}_go_next_month" class="next_prev_month" style="display:none;">
                                                <img src="/static/common/icon/navigate_next_black.png" class="obj_icon_basic">
                                            </div>
                                            <div class="expand_button ${calendar_name}_expand_button">
                                                <img src="/static/common/icon/expand_more_black.png" class="obj_icon_basic">
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
                                               onclick="layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_view', 90, POPUP_FROM_BOTTOM, {'select_date':'${data_date}'})">
                                               <div class="${font_color}">${date_cache}</div>
                                               <div id="calendar_plan_cell_${data_date}"></div>
                                          </div>`);
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


        let timeline_calendar_upper_tool = `<div class="pters_timeline_cal_upper_tool_box obj_font_size_13_weight_500 obj_font_color_light_grey">
                                                <div class="pters_timeline_cal_type_text selected">전체</div>
                                                <div class="pters_timeline_cal_type_text">예약 완료</div>
                                                <div class="pters_timeline_cal_type_text">예약 대기</div>
                                                <div class="pters_timeline_cal_type_text">반복 일정</div>
                                                <div></div>
                                            </div>`;


        let time_line_height = calendar_height  - calendar_toolbox_height - calendar_month_day_name_text_height - 300 - calendar_timeline_toolbox_height;
        //상단의 연월 표기, 일월화수목 표기, 달력숫자를 합쳐서 화면에 그린다.
        $targetHTML.html(`${month_calendar_upper_tool}
                         <div class="obj_box_full ${calendar_name}_wrapper_month_cal">
                            ${month_day_name_text}${calendar_assembled}
                         </div>
                         ${timeline_calendar_upper_tool}
                         <div class="obj_box_full wrapper_cal_timeline" style="height:${time_line_height}px">
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
                func_draw_schedule_data(jsondata);
            });
        });
        $('#'+next_id).click(function(){
            calendar_variable.draw_month_calendar_table(func_get_next_month(reference_year, reference_month),
                                                        design_options);
            func_get_ajax_schedule_data(reference_date, "callback", function(jsondata){
                func_draw_schedule_data(jsondata);
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
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
                //beforeSend();
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
                    if(use == "callback"){
                        callback(jsondata);
                    }
                }
                func_set_avail_date(jsondata.avail_date_data);
                func_draw_schedule_timeline_data(jsondata);
            },

            complete:function(){
                //completeSend();
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
        }
        let $first_day = $(`${temp_array.shift()}`);
        $first_day.siblings('div').css({'height':'20px', 'width':'20px', 'border-radius':'50%', 'background-color':'#000000', 'margin':'0 auto', 'color':'#ffffff'});
        $first_day.parent('.obj_table_cell_x7').css({'background-color': 'rgba(0, 0, 0, 0.1)', 'border-top-left-radius':'5px', 'border-bottom-left-radius':'5px'});
        $(`${temp_array.pop()}`).parent('.obj_table_cell_x7').css({'background-color': 'rgba(0, 0, 0, 0.1)', 'border-top-right-radius':'5px', 'border-bottom-right-radius':'5px'});
        $(`${temp_array.join(', ')}`).parent('.obj_table_cell_x7').css('background-color', 'rgba(0, 0, 0, 0.1)');
    }

    /**
     * @param jsondata                              schedule json data object.
     * @param jsondata.classTimeArray_start_date    시작 시각.
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
            $(`#calendar_plan_cell_${date}`).html(`<div class="schedule_marking"></div>`);
        }
        for(let date_group in schedule_number_dic["group"]){
            $(`#calendar_plan_cell_${date_group}`).html(`<div class="schedule_marking_group"></div>`);
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

                temp_array.push(
                                    `
                                    <div class="obj_table_raw" data-scheduleid=${schedule_id}>
                                        <div class="obj_table_cell_x2">
                                            <img src=""><span class="obj_font_size_14_weight_normal">${schedule_name}</span><div class="obj_tag obj_font_bg_trans_pink obj_font_size_16_weight_bold">예약 타입</div>
                                        </div>
                                        <div class="obj_table_cell_x2 obj_font_size_14_weight_500">${schedule_time_start}~${schedule_time_end}</div>
                                    </div>
                                    `
                                );
            }
            html_to_join_array.push(
                                        `
                                        <div class="timeline_element_date" onclick="layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_view', 90, POPUP_FROM_BOTTOM, {'select_date':'${date}'})">
                                            <div class="timeline_date_text obj_font_size_11_weight_bold">${date_format(date)["yyyy.mm.dd"]}</div>
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
    }

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
            if(schedule_name.length == 0){
                schedule_name = "개인 레슨";
            }
            dic[json.classTimeArray_start_date[j].split(' ')[0]].push(schedule_name+' / '+schedule_start_time+' / '+schedule_end_time+' / '+schedule_id);
        }
        return dic;
    }

    function func_set_scrolling_to_timeline(target_selector){
        func_set_webkit_overflow_scrolling(target_selector);
    }

    function func_set_expand_function(){
        $(document).on('click', `.${calendar_name}_expand_button`, function(){
            let original_height;
            let expand_height;
            func_time_line_wide_view($(this).attr('data-open'));
        });
    }

    function func_time_line_wide_view(type){
        switch(type){
            case SHOW:
                $(`.${calendar_name}_expand_button`).attr('data-open', HIDE);
                $(`.${calendar_name}_wrapper_month_cal`).show();
                $('.wrapper_cal_timeline').css('height', `${original_height}px`);
            break;

            case HIDE:
                $(`.${calendar_name}_expand_button`).attr('data-open', SHOW);
                $(`.${calendar_name}_wrapper_month_cal`).hide();
                $('.wrapper_cal_timeline').css('height', `${expand_height}px`);
            break;

            case undefined:
                original_height = parseInt($('.wrapper_cal_timeline').css('height'));
                expand_height = calendar_height - calendar_toolbox_height - calendar_timeline_toolbox_height;
                console.log(calendar_height, calendar_toolbox_height, calendar_timeline_toolbox_height)
                $(`.${calendar_name}_expand_button`).attr('data-open', SHOW);
                $(`.${calendar_name}_wrapper_month_cal`).hide();
                $('.wrapper_cal_timeline').css('height', `${expand_height}px`);
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
            func_draw_month_calendar_table(today_yyyy_mm_dd);
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
                input_reference_date = today_yyyy_mm_dd;
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
                console.log('여기', jsondata)
                func_draw_schedule_data(jsondata);
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
