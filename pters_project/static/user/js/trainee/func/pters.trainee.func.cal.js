var date = new Date();
var current_year = date.getFullYear(); //현재 년도
var current_month = date.getMonth(); //달은 0부터 출력해줌 0~11
var current_date = date.getDate();
var current_day = date.getDay(); // 0,1,2,3,4,5,6,7
var current_hour = date.getHours();
var current_minute = date.getMinutes();
var today_yyyy_mm_dd = current_year+'-'+(current_month+1)+'-'+current_date;
var lastday_array = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];      //각 달의 일수
if( (current_year % 4 == 0 && current_year % 100 != 0) || current_year % 400 == 0 ){  //윤년
    lastday_array[1] = 29;
}else{
    lastday_array[1] = 28;
}

var calendar_height = windowHeight - Number($('body').css('padding-top').replace(/px/gi,"")) - 20;
var calendar_toolbox_height = 105;
var calendar_month_day_name_text_height = 40;

// //달력 사용시 커스텀 디자인 적용 가이드
var default_design_options = {"font_color_sunday":"obj_font_color_pters_dark_red",
                              "font_color_saturday":"obj_font_color_light_blue",
                              "font_date_basic":"obj_font_size_12_weight_500",
                              "font_day_names":"obj_font_size_11_weight_normal",
                              "height_week_row":90};

var custom_design_options = {"font_color_sunday":"obj_font_color_light_blue",
                             "font_color_saturday":"obj_font_color_pters_red",
                             "font_date_basic":"obj_font_size_14_weight_normal",
                             "font_day_names":"obj_font_size_16_weight_bold",
                             "height_week_row":50};
var design_options = default_design_options;

// design_options을 init_month_calendar에 아에 적지 않거나, 항목이 비어있는 경우는 기본값으로 스타일을 적용함.
init_month_calendar(today_yyyy_mm_dd, '#calendar');
// init_month_calendar(today_yyyy_mm_dd, '#calendar', custom_design_options);





/*입력된 날짜를 기준으로 월간 달력을 그린다. */
function init_month_calendar(reference_date, targetHTML){
    //referencedate의 형식 yyyy-mm-dd
    draw_month_calendar_table(reference_date, targetHTML);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
    set_touch_move_to_month_calendar(targetHTML);
    init_month_calendar_basic_size();
}

function init_month_calendar_basic_size(){
    //달력을 감싸는 wrapper의 높이를 창크기에 맞춘다. (스크롤링 영역을 달력 안쪽으로만 잡기 위해서)
    $('.content_page').css("overflow-y", "hidden");
    $('#calendar').css({"height":calendar_height});
}

function init_month_calendar_size(){
    $('#pters_month_cal_content_wrapper').css({"height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height,
                                                "max-height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height - 3});
}

//선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
function draw_month_calendar_table(reference_date, targetHTML){
    var $targetHTML = $(targetHTML);
    var referencedate_split_array = reference_date.split('-');
    var referencedate_year = referencedate_split_array[0];
    var referencedate_month = referencedate_split_array[1];
    var referencedate_date = referencedate_split_array[2];
    if( (referencedate_year % 4 == 0 && referencedate_year % 100 != 0) || referencedate_year % 400 == 0 ){  //윤년
        lastday_array[1] = 29;
    }else{
        lastday_array[1] = 28;
    }
    var current_month_firstdate_day = new Date(`${referencedate_year}`,`${referencedate_month}`,`${'1'}`).getDay();
    var prev_next_month = get_prev_next_month(referencedate_year, referencedate_month);
    var prev_page = prev_next_month["prev"];
    var next_page = prev_next_month["next"];

    //달력의 상단의 연월 표기
    var month_calendar_upper_tool = `<div id="pters_month_cal_upper_tool_box">
                                        <div id="go_prev_month" onclick="draw_month_calendar_table('${prev_page}', '${targetHTML}')"> <img src="/static/user/res/icon-setting-arrow.png"> </div>
                                        <div style="display:inline-block;vertical-align:middle;"><div id="pters_month_cal_tool_year_text" class="obj_font_size_12_weight_500">${Number(referencedate_year)}년</div><div id="pters_month_cal_tool_month_text" class="obj_font_size_20_weight_bold">${Number(referencedate_month)}월</div></div>
                                        <div id="go_next_month" onclick="draw_month_calendar_table('${next_page}', '${targetHTML}')"> <img src="/static/user/res/icon-setting-arrow.png"> </div>
                                    </div>`;
    
    //달력의 월화수목금 표기를 만드는 부분
    var month_day_name_text = `<div id="pters_month_cal_day_name_box" class="obj_table_raw ${design_options["font_day_names"]}"> 
                                <div class="obj_table_cell_x7 ${design_options["font_color_sunday"]}">일</div>
                                <div class="obj_table_cell_x7">월</div>
                                <div class="obj_table_cell_x7">화</div>
                                <div class="obj_table_cell_x7">수</div>
                                <div class="obj_table_cell_x7">목</div>
                                <div class="obj_table_cell_x7">금</div>
                                <div class="obj_table_cell_x7 ${design_options["font_color_saturday"]}">토</div>  
                               </div>`;

    //달력의 날짜를 만드는 부분
    var htmlToJoin = [];
    var date_cache = 1;
    for(var i=1; i<=6; i++){
        var dateCellsToJoin = [];

        for(var j=0; j<7; j++){
            var data_date = `${referencedate_year}-${referencedate_month}-${date_cache}`;
            var font_color = "";
            if(j == 0){
                font_color = design_options["font_color_sunday"];
            }else if(j == 6){
                font_color = design_options["font_color_saturday"];
            }

            if(i==1 && j<current_month_firstdate_day){ //첫번째 주일때 처리
                dateCellsToJoin.push(`<div class="obj_table_cell_x7"></div>`);
            }else if(date_cache > lastday_array[referencedate_month-1]){ // 마지막 날짜가 끝난 이후 처리
                dateCellsToJoin.push(`<div class="obj_table_cell_x7"></div>`);
            }else{
                dateCellsToJoin.push(`<div class="obj_table_cell_x7" data-date="${data_date}" onclick="layer_popup('open', 'popup_calendar_plan_view')"><div class="${font_color}">${date_cache}</div></div>`);
                date_cache++;
            }
        }

        var week_row = `<div class="obj_table_raw" id="week_row_${i}" style="height:${design_options["height_week_row"]}px">${dateCellsToJoin.join('')}</div>`;
        htmlToJoin.push(week_row);

    }

    var calendar_assembled = `<div id="pters_month_cal_content_box" class="${design_options["font_date_basic"]}">`+htmlToJoin.join('')+'</div>';

    //달력의 하단 숫자부분만 스크롤 되고, 연월일, 월화수목 표기는 스크롤 되지 않도록 사이즈를 조절한다.
    var inner_height = calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height+'px';
    var inner_max_height = calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height - 3 +'px';

    //상단의 연월 표기, 일월화수목 표기, 달력숫자를 합쳐서 화면에 그린다.
    $targetHTML.html(month_calendar_upper_tool+'<div class="obj_box_full">'+month_day_name_text+'<div id="pters_month_cal_content_wrapper" style="height:'+inner_height+'; max-height:'+inner_max_height+';">'+calendar_assembled+'</div></div>');
}

function get_prev_next_month(reference_date_year, reference_date_month){
    //입력받은 년월을 기준으로, (연도/다음달/다음달의 마지막일), (연도/전달/전달의 1일) 를 구해서 출력해준다.
    var prev_month = new Date(`${reference_date_year}`,`${reference_date_month}`,`${'01'}`);
    var next_month = new Date(`${reference_date_year}`,`${reference_date_month}`,`${lastday_array[reference_date_month-1]}`);

    prev_month.setDate(0);
    next_month.setDate(next_month.getDate()+1);

    var prev_page = `${prev_month.getFullYear()}-${prev_month.getMonth()+1}-${prev_month.getDate()}`;
    var next_page = `${next_month.getFullYear()}-${next_month.getMonth()+1}-${next_month.getDate()}`;

    return {"next":next_page, "prev":prev_page};
}

function move_month(direction){
    $(`#go_${direction}_month`).trigger('click');
}

function set_touch_move_to_month_calendar(){
    var ts;
    var tsy;
    var selector_body = $('body');
    selector_body.bind("touchstart", function(e){
        ts = e.originalEvent.touches[0].clientX;
        tsy = e.originalEvent.touches[0].clientY;
    });

    $(document).on("touchend", 'html', function(e){
        var te = e.originalEvent.changedTouches[0].clientX;
        var tey = e.originalEvent.changedTouches[0].clientY;
        if(Math.abs(tsy - tey) < 100){
           if(ts>te+20){
                move_month("next");
            }else if(ts<te-20){
                move_month("prev");
            } 
        }
    });
}

