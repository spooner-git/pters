var date = new Date();
var current_year = date.getFullYear(); //현재 년도
var current_month = date.getMonth(); //달은 0부터 출력해줌 0~11
var current_date = date.getDate();
var current_day = date.getDay(); // 0,1,2,3,4,5,6,7
var current_hour = date.getHours();
var current_minute = date.getMinutes();
var today_yyyy_mm_dd = current_year+'/'+(current_month+1)+'/'+current_date;
var lastday_array = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];      //각 달의 일수
if( (current_year % 4 == 0 && current_year % 100 != 0) || current_year % 400 == 0 ){  //윤년
    lastday_array[1] = 29;
}else{
    lastday_array[1] = 28;
}

init_month_calendar(today_yyyy_mm_dd);

/*입력된 날짜를 기준으로 월간 달력을 그린다. */
function init_month_calendar(reference_date){
    //referencedate의 형식 yyyy-mm-dd
    draw_month_calendar_table(reference_date, '#calendar');  //2번 슬라이드에 현재년도, 현재달 달력 채우기
    set_touch_move_to_month_calendar('#calendar');

    //달력을 감싸는 wrapper의 높이를 창크기에 맞춘다. (스크롤링 영역을 달력 안쪽으로만 잡기 위해서)
    var calendar_height = windowHeight - Number($('body').css('padding-top').replace(/px/gi,"")) - 20;
    var calendar_toolbox_height = 105;
    var calendar_month_day_name_text_height = 40;
    $('.content_page').css("overflow-y","hidden");
    $('#calendar').css({"height":calendar_height});
    $('#pters_month_cal_content_wrapper').css({"height":calendar_height - calendar_toolbox_height - calendar_month_day_name_text_height});
}

//선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
function draw_month_calendar_table(reference_date, targetHTML){
    
    var $targetHTML = $(targetHTML);
    var referencedate_split_array = reference_date.split('/');
    var referencedate_year = referencedate_split_array[0];
    var referencedate_month = referencedate_split_array[1];
    var referencedate_date = referencedate_split_array[2];
    if( (referencedate_year % 4 == 0 && referencedate_year % 100 != 0) || referencedate_year % 400 == 0 ){  //윤년
        lastday_array[1] = 29;
    }else{
        lastday_array[1] = 28;
    }
    var fistdate_for_inner_use = new Date(`${referencedate_year}/${referencedate_month}/${'1'}`);
    var prevmonth = new Date(`${referencedate_year}/${referencedate_month}/${'1'}`);
    var nextmonth = new Date(`${referencedate_year}/${referencedate_month}/${lastday_array[referencedate_month-1]}`);


    var current_month_firstdate_day = fistdate_for_inner_use.getDay();

    prevmonth.setDate(0);
    nextmonth.setDate(nextmonth.getDate()+1);

    var prevpage = `${prevmonth.getFullYear()}/${prevmonth.getMonth()+1}/${prevmonth.getDate()}`;
    var nextpage = `${nextmonth.getFullYear()}/${nextmonth.getMonth()+1}/${nextmonth.getDate()}`;

    var month_calendar_upper_tool = `<div id="pters_month_cal_upper_tool_box" style="width:100%;text-align:center;">
                                        <div style="display:inline-block;vertical-align:middle;" id="go_prev_month" onclick="draw_month_calendar_table('${prevpage}', '${targetHTML}')"><</div>
                                        <div style="display:inline-block;vertical-align:middle;"><div>${Number(referencedate_year)}년</div><div>${Number(referencedate_month)}월</div></div>
                                        <div style="display:inline-block;vertical-align:middle;" id="go_next_month" onclick="draw_month_calendar_table('${nextpage}', '${targetHTML}')">></div>
                                    </div>`;
    var month_day_name_text = `<div id="pters_month_cal_day_name_box" style="display:table;width:100%;text-align:center;" class="textbox_size_11_weight_normal"> 
                                <div style="display:table-cell;width:14.28%;" class="font_color_pters_dark_red">일</div>
                                <div style="display:table-cell;width:14.28%;">월</div>
                                <div style="display:table-cell;width:14.28%;">화</div>
                                <div style="display:table-cell;width:14.28%;">수</div>
                                <div style="display:table-cell;width:14.28%;">목</div>
                                <div style="display:table-cell;width:14.28%;">금</div>
                                <div style="display:table-cell;width:14.28%;" class="font_color_light_blue">토</div>  
                               </div>`;

    var htmlToJoin = [];
    var date_cache = 1;
    for(var i=1; i<=6; i++){
        var dateCellsToJoin = [];

        for(var j=0; j<7; j++){
            if(i==1 && j<current_month_firstdate_day){ //첫번째 주일때 처리
                dateCellsToJoin.push(`<div style="display:table-cell;width:14.28%;"></div>`);
            }else if(date_cache > lastday_array[referencedate_month-1]){ // 마지막 날짜가 끝난 이후 처리
                dateCellsToJoin.push(`<div style="display:table-cell;width:14.28%;"></div>`);
            }else{
                var data_date = `${referencedate_year}-${referencedate_month}-${date_cache}`;
                dateCellsToJoin.push(`<div style="display:table-cell;width:14.28%;" data-date="${data_date}" onclick="layer_popup('open', 'popup_calendar_plan_view')"><div>${date_cache}</div></div>`);
                date_cache++;
            }
        }
        var week_row = `<div class="week_row" id="week_row_${i}" style="display:table;width:100%;background-color:white">${dateCellsToJoin.join('')}</div>`;
        htmlToJoin.push(week_row);
    }

    var calendar_assembled = '<div id="pters_month_cal_content_box" class="textbox_size_12_weight_500" style="text-align:center;">'+htmlToJoin.join('')+'</div>'; 

    $targetHTML.html(month_calendar_upper_tool+'<div class="box_full">'+month_day_name_text+'<div id="pters_month_cal_content_wrapper" class="">'+calendar_assembled+'</div></div>');
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

