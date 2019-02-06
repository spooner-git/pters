// 달력 관련
function pters_month_calendar(calendar_name, calendar_options){
    const default_design_options = {"font_color_sunday":["obj_font_color_pters_dark_red"],
                                  "font_color_saturday":["obj_font_color_light_blue"],
                                  "font_date_basic":["obj_font_size_12_weight_500"],
                                  "font_day_names":["obj_font_size_11_weight_normal"],
                                  "height_week_row":[90]};

    const default_targetHTML = '#calendar';

    if(calendar_options.target_html == undefined){
        calendar_options.target_html = default_targetHTML;
    }
    if(calendar_options.design_option == undefined){
        calendar_options.design_option = default_design_options;
    }

    let targetHTML = calendar_options.target_html;
    let design_options = calendar_options.design_option;

    const calendar_height = windowHeight - parseInt($('body').css('padding-top'), 10) - 20;
    const calendar_toolbox_height = 105;
    const calendar_month_day_name_text_height = 40;

    let last_day_array = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];      //각 달의 일수
    let date = new Date();
    let current_year = date.getFullYear(); //현재 년도
    let current_month = date.getMonth(); //달은 0부터 출력해줌 0~11
    let current_date = date.getDate();
    let today_yyyy_mm_dd = current_year+'-'+(current_month+1)+'-'+current_date;

    function func_month_calendar_basic_size(calendar_height){
        //달력을 감싸는 wrapper의 높이를 창크기에 맞춘다. (스크롤링 영역을 달력 안쪽으로만 잡기 위해서)
        // $('.content_page').css("overflow-y", "hidden");
        $('#calendar').css({"height":calendar_height});
    }

    function func_draw_month_calendar_size(calendar_height, calendar_toolbox_height, calendar_month_day_name_text_height){
        $('#pters_month_cal_content_box').css({"height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height,
                                               "max-height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height - 3});
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
        //입력받은 년월을 기준으로 (연도/전달/전달의 1일) 를 구해서 출력해준다.
        let prev_month = new Date(`${input_year}`,`${input_month-1}`,`${'1'}`);
        prev_month.setDate(0);

        return `${prev_month.getFullYear()}-${prev_month.getMonth()+1}-${prev_month.getDate()}`;
    }

    function func_get_next_month(input_year, input_month){
        //입력받은 년월을 기준으로 (연도/다음달/다음달의 마지막일) 를 구해서 출력해준다.
        let reference_month_last_day = func_get_month_end_day(input_year, input_month);
        let next_month = new Date(`${input_year}`,`${input_month-1}`,`${reference_month_last_day}`);
        next_month.setDate(next_month.getDate()+1);

        return `${next_month.getFullYear()}-${next_month.getMonth()+1}-${next_month.getDate()}`;
    }

    //선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
    function func_draw_month_calendar_table(reference_date, targetHTML, design_options){
        let $targetHTML = $(targetHTML);
        let reference_date_split_array = reference_date.split('-');
        let reference_date_year = reference_date_split_array[0];
        let reference_date_month = reference_date_split_array[1];
        let reference_date_month_last_day = func_get_month_end_day(reference_date_year, reference_date_month);

        let current_month_first_date_day = new Date(`${reference_date_year}`,`${reference_date_month-1}`,`${'1'}`).getDay();

        //달력의 상단의 연월 표기
        let month_calendar_upper_tool = `<div class="pters_month_cal_upper_tool_box">
                                            <div id="${calendar_name}_go_prev_month" class="go_prev_month">
                                                <img src="/static/user/res/icon-setting-arrow.png"> 
                                            </div>
                                            <div style="display:inline-block;vertical-align:middle;">
                                                <div class="pters_month_cal_tool_year_text obj_font_size_12_weight_500">
                                                    ${Number(reference_date_year)}년
                                                </div>
                                                <div class="pters_month_cal_tool_month_text obj_font_size_20_weight_bold">
                                                    ${Number(reference_date_month)}월
                                                </div>
                                            </div>
                                            <div id="${calendar_name}_go_next_month" class="go_next_month">
                                                <img src="/static/user/res/icon-setting-arrow.png">
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
        for(let i=0; i<7; i++){
            let dateCellsToJoin = [];

            for(let j=0; j<7; j++){
                let data_date = `${reference_date_year}-${reference_date_month}-${date_cache}`;
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
                                               onclick="layer_popup('open', 'popup_calendar_plan_view')">
                                               <div class="${font_color}">${date_cache}</div>
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
        // var inner_height = calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height+'px';
        // var inner_max_height = calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height - 3 +'px';

        //상단의 연월 표기, 일월화수목 표기, 달력숫자를 합쳐서 화면에 그린다.
        $targetHTML.html(month_calendar_upper_tool+'<div class="obj_box_full">'+month_day_name_text+calendar_assembled+'</div>');

    }

    function func_set_prev_next_month_button(calendar_variable){
        let reference_date = calendar_variable.reference_date;
        let reference_date_split_array = reference_date.split('-');
        let reference_year = reference_date_split_array[0];
        let reference_month = reference_date_split_array[1];
        let prev_id = calendar_variable.calendar_name + "_go_prev_month";
        let next_id = calendar_variable.calendar_name + "_go_next_month";

        $('#'+prev_id).click(function(){
            calendar_variable.draw_month_calendar_table(func_get_prev_month(reference_year, reference_month),
                                                        calendar_variable.calendar_options.target_html,
                                                        calendar_variable.calendar_options.design_option);
        });
        $('#'+next_id).click(function(){
            calendar_variable.draw_month_calendar_table(func_get_next_month(reference_year, reference_month),
                                                        calendar_variable.calendar_options.target_html,
                                                        calendar_variable.calendar_options.design_option);
        });
    }


    function func_move_month(direction){
        $(`#${calendar_name}_go_${direction}_month`).trigger('click');
    }

    function func_set_touch_move_to_month_calendar(){
        let ts;
        let tsy;
        let selector_body = $(targetHTML);
        selector_body.bind("touchstart", function(e){
            ts = e.originalEvent.touches[0].clientX;
            tsy = e.originalEvent.touches[0].clientY;
        });

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
        // $(document).on("touchend", 'html', function(e){
        //     var te = e.originalEvent.changedTouches[0].clientX;
        //     var tey = e.originalEvent.changedTouches[0].clientY;
        //     if(Math.abs(tsy - tey) < 100){
        //        if(ts>te+20){
        //             move_month("next");
        //         }else if(ts<te-20){
        //             move_month("prev");
        //         }
        //     }
        // });
    }



    return {
        "calendar_name": calendar_name,
        "init_month_calendar_table":function(){
            func_draw_month_calendar_table(today_yyyy_mm_dd, targetHTML, design_options);
            func_draw_month_calendar_size(calendar_height, calendar_toolbox_height, calendar_month_day_name_text_height);
            func_month_calendar_basic_size(calendar_height);
            func_set_touch_move_to_month_calendar(targetHTML);
            func_set_prev_next_month_button(this);
        },
        "calendar_options": calendar_options,
        "reference_date": today_yyyy_mm_dd,
        "draw_month_calendar_table":function (reference_date, targetHTML, design_options) {
            if(reference_date==undefined){
                reference_date = today_yyyy_mm_dd;
            }
            if(targetHTML==undefined){
                targetHTML = default_targetHTML;
            }
            func_draw_month_calendar_table(reference_date, targetHTML, design_options);
            func_draw_month_calendar_size(calendar_height, calendar_toolbox_height, calendar_month_day_name_text_height);
            this.reference_date = reference_date;
            func_set_prev_next_month_button(this);
        }
    };
}
