/*jshint esversion: 6 */
/*달력 만들기

 1. 각달의 일수를 리스트로 만들어 둔다.
 [31,28,31,30,31,30,31,31,30,31,30,31]
 2. 4년마다 2월 윤달(29일)
 year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
 3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1

 */

//테스트 코드 (모바일 달력 확대)
var calendar_mobile_zoom = 0;
$('#week .weekNum').click(function(){
    console.log("calendar_device_type", calendar_device_type,"calendar_mobile_zoom", calendar_mobile_zoom)
    if(calendar_device_type == "mobile"){
        if(calendar_mobile_zoom == 0){
            calendar_zoom(this, "zoom");
        }else{
            calendar_zoom(this, "unzoom");
        }
    }
});

function calendar_zoom(selector, zoom){
    if(calendar_device_type == "mobile"){
        // if(zoom == "zoom" && calendar_mobile_zoom == 0){
        //     var index = Number($(selector).attr("id").split('_')[1])+1;
        //     var $visible_row = $(`div.swiper-slide-active .td00:nth-of-type(${index})`);

        //     $visible_row.siblings('.td00').css('display', 'none');
        //     $(selector).siblings('.weekNum').css('display', 'none');
        //     $visible_row.css('width', `90%`).addClass('_zoomed');
        //     $(selector).css('width', `90%`).addClass('_zoomed');
        //     calendar_mobile_zoom = 1;
        // }else if(zoom == "unzoom" && calendar_mobile_zoom == 1){
        //     var index = Number($(selector).attr("id").split('_')[1])+1;
        //     var $visible_row = $(`div.swiper-slide-active .td00:nth-of-type(${index})`);

        //     $visible_row.siblings('.td00').css('display', 'table-cell');
        //     $(selector).siblings('.weekNum').css('display', 'table-cell');
        //     $visible_row.css('width', `12.5%`).removeClass('_zoomed');
        //     $(selector).css('width', `12.5%`).removeClass('_zoomed');
        //     calendar_mobile_zoom = 0;
        // }
        if(zoom == "zoom"){
            var index = Number($(selector).attr("id").split('_')[1])+1;
            var $visible_row = $(`div.swiper-slide-active .td00:nth-of-type(${index})`);

            $visible_row.siblings('.td00').css('display', 'none');
            $(selector).siblings('.weekNum').css('display', 'none');
            $visible_row.css('width', `90%`).addClass('_zoomed');
            $(selector).css('width', `90%`).addClass('_zoomed');
            calendar_mobile_zoom = 1;
        }else if(zoom == "unzoom"){
            var index = Number($(selector).attr("id").split('_')[1])+1;
            var $visible_row = $(`div.swiper-slide-active .td00:nth-of-type(${index})`);

            $visible_row.siblings('.td00').css('display', 'table-cell');
            $(selector).siblings('.weekNum').css('display', 'table-cell');
            $visible_row.css('width', `12.5%`).removeClass('_zoomed');
            $(selector).css('width', `12.5%`).removeClass('_zoomed');
            calendar_mobile_zoom = 0;
        }
    }
}

//테스트 코드 (모바일 달력 확대)



/////////////////////////////////////달력 공통//////////////////////////////////
$('#ymdText').click(function(e){
    if(bodywidth < 600 && calendar_mobile_zoom == 0){
        e.stopPropagation();
        var $calendar = $('#calendar');
        var current_calendar_type;
        if($calendar.hasClass('_calweek')){
            current_calendar_type = "week";
        }else if($calendar.hasClass('_calmonth')){
            current_calendar_type = "month";
        }

        if(current_calendar_type == "month"){
            $.cookie('calendar_selected_last', 'week', {expires : 30});
            $('#hidetoggle').show();
            var $ymdData = $('#ymdText-pc-year');
            var yyyy_mm_dd;
            var dd2_lastday = lastDay[Number($ymdData.attr('data-month'))-1];
            var ymd1 = `${$ymdData.attr('data-year')}-${$ymdData.attr('data-month')}-01`;
            var ymd2 = `${$ymdData.attr('data-year')}-${$ymdData.attr('data-month')}-${dd2_lastday}`;
            if( compare_date2(ymd1, today_YY_MM_DD) == false && compare_date2( today_YY_MM_DD, ymd2 ) == false ){
                yyyy_mm_dd = today_YY_MM_DD;
            }else{
                yyyy_mm_dd = date_format_yyyy_m_d_to_yyyy_mm_dd(ymd1, '-');
            }

            $calendar.removeClass('_calmonth');
            $('div.timeindex').css('display', 'block');
            week_calendar_mobile(yyyy_mm_dd);
            calendar_device_type = "mobile";
            $('#timeIndicatorBar').css('display', 'block');
            $('#week').css('display', 'table');
            $('#date').css('display', 'none');
            if(calendarSize == 3){
                $('.td00, .td30').css({'background':'unset',
                                              'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                              'background-size':'60px '+ ($('.hour').height()+1)+'px'});
            }else if(calendarSize == 1){
                $('.td00, .td30').css({'background':'#f7f7f7',
                                           'background-image':'url("/static/user/res/calendar_hour.png")',
                                            'background-size':'60px 60px'});
            }
            //}
        }else if(current_calendar_type == "week"){
            // $(window).scrollTop(0);
            $.cookie('calendar_selected_last', 'month', {expires : 30});
            $('#hidetoggle').hide();
            var $ymdText_start = $('#ymdText-pc-month-start');
            var $ymdText_end = $('#ymdText-pc-month-end');
            var $ymdText_day_start = $('#ymdText-pc-date-start');
            var $ymdText_day_end = $('#ymdText-pc-date-end');
            var yyyy_mm_dd;
            var yyyy_1 = $ymdText_start.attr('data-year');
            var yyyy_2 = $ymdText_end.attr('data-year');
            var mm1    = $ymdText_start.attr('data-month');
            var mm2    = $ymdText_end.attr('data-month');
            var dd1    = $ymdText_day_start.attr('data-date');
            var dd2    = $ymdText_day_end.attr('data-date');
            var ymd1 = `${yyyy_1}-${mm1}-${dd1}`;
            var ymd2 = `${yyyy_2}-${mm2}-${dd2}`;
            if( compare_date2(ymd1, today_YY_MM_DD) == false && compare_date2( today_YY_MM_DD, ymd2 ) == false ){
                yyyy_mm_dd = today_YY_MM_DD;
            }else{
                yyyy_mm_dd = date_format_yyyy_m_d_to_yyyy_mm_dd(`${yyyy_2}-${mm2}-${dd2}`, '-');
            }
            $calendar.removeClass('_calweek');
            month_calendar(yyyy_mm_dd);
            calendar_device_type = "mobile";
            $('#week').css('display', 'none');
            $('div.timeindex, #timeIndicatorBar').css('display', 'none');
            $('#date').css('display', 'block');
            $('.swiper-slide-active').css('width', $('#calendar').width());
            $('#ymdText_monthcal').css('display', 'inline-block');
            $('#ymdText_weekcal').css('display', 'none');
        }
    }else if(bodywidth < 600 && calendar_mobile_zoom > 0){
        calendar_zoom("#week ._zoomed", "unzoom");
    }
});

$('#change_to_weekcal').click(function(e){
    if(calendar_select == "month"){
        $.cookie('calendar_selected_last', 'week', {expires : 30});
        $('#hidetoggle').show();
        calendar_select = "week";
        e.stopPropagation();
        var $calendar = $('#calendar');
        var $ymdData = $('#ymdText-pc-year');
        var yyyy_mm_dd;
        var dd2_lastday = lastDay[Number($ymdData.attr('data-month'))-1];
        var ymd1 = `${$ymdData.attr('data-year')}-${$ymdData.attr('data-month')}-01`;
        var ymd2 = `${$ymdData.attr('data-year')}-${$ymdData.attr('data-month')}-${dd2_lastday}`;
        if( compare_date2(ymd1, today_YY_MM_DD) == false && compare_date2( today_YY_MM_DD, ymd2 ) == false ){
            yyyy_mm_dd = today_YY_MM_DD;
        }else{
            yyyy_mm_dd = date_format_yyyy_m_d_to_yyyy_mm_dd(ymd1, '-');
        }
        $calendar.removeClass('_calmonth');
        $('#week').css('display', 'table');
        $('div.timeindex, #timeIndicatorBar').css('display', 'block');
        $('#date').css('display', 'none');
        if(bodywidth >= 600){
            if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null){
                week_calendar_mobile(yyyy_mm_dd);
            }else{
                week_calendar(yyyy_mm_dd);
            }
            $('#ymdText_weekcal').css('display', 'inline-block');
            $('#ymdText_monthcal').css('display', 'none');
        }else if(bodywidth<600){
            week_calendar_mobile(yyyy_mm_dd);
        }
    }
});

$('#change_to_monthcal').click(function(e){
    if(calendar_select == "week"){
        calendar_zoom("#week ._zoomed", "unzoom");
        $.cookie('calendar_selected_last', 'month', {expires : 30});
        hidetoggle_on_off("off");
        $('#hidetoggle').hide();
        calendar_select = "month";
        e.stopPropagation();
        var $calendar = $('#calendar');

        var $ymdText_start = $('#ymdText-pc-month-start');
        var $ymdText_end = $('#ymdText-pc-month-end');
        var $ymdText_day_start = $('#ymdText-pc-date-start');
        var $ymdText_day_end = $('#ymdText-pc-date-end');
        var yyyy_mm_dd;
        var yyyy_1 = $ymdText_start.attr('data-year');
        var yyyy_2 = $ymdText_end.attr('data-year');
        var mm1    = $ymdText_start.attr('data-month');
        var mm2    = $ymdText_end.attr('data-month');
        var dd1    = $ymdText_day_start.attr('data-date');
        var dd2    = $ymdText_day_end.attr('data-date');
        var ymd1 = `${yyyy_1}-${mm1}-${dd1}`;
        var ymd2 = `${yyyy_2}-${mm2}-${dd2}`;
        if( compare_date2(ymd1, today_YY_MM_DD) == false && compare_date2( today_YY_MM_DD, ymd2 ) == false ){
            yyyy_mm_dd = today_YY_MM_DD;
        }else{
            yyyy_mm_dd = date_format_yyyy_m_d_to_yyyy_mm_dd(`${yyyy_2}-${mm2}-${dd2}`, '-');
        }
        $calendar.removeClass('_calweek');
        $('#week').css('display', 'none');
        $('div.timeindex, #timeIndicatorBar').css('display', 'none');
        $('#date').css('display', 'block');
        month_calendar(yyyy_mm_dd);
        $('.swiper-slide-active').css('width', $('#calendar').width());
        $('#ymdText_monthcal').css('display', 'inline-block');
        $('#ymdText_weekcal').css('display', 'none');
    }
});


//다음페이지로 슬라이드 했을때 액션

myswiper.on('onSlideNextEnd', function(){
    if($('._calweek').length > 0){
        close_planadd_popup_mini();
        slideControl.week.append();
        weekNum_Set_fixed();
        toDay();
        addcurrentTimeIndicator_blackbox();
        dateText();
        reserveAvailable();
        todayFinderArrow();
        //krHoliday();
    }else if($('._calmonth').length > 0){
        slideControl.month.append();
    }
});

//이전페이지로 슬라이드 했을때 액션
myswiper.on('onSlidePrevEnd', function(){
    if($('._calweek').length > 0){
        close_planadd_popup_mini();
        slideControl.week.prepend();
        weekNum_Set_fixed();
        toDay();
        addcurrentTimeIndicator_blackbox();
        dateText();
        reserveAvailable();
        todayFinderArrow();
        //krHoliday();
    }else if($('._calmonth').length > 0){
        slideControl.month.prepend();
    }
});

//페이지 이동에 대한 액션 클래스
var slideControl = {'week':{
                        'append' : function(){ //다음페이지로 넘겼을때
                            var selector_swiper_slide_last_child = $('.swiper-slide:last-child');
                            var lastdateinfo = selector_swiper_slide_last_child.find('.td00').attr('id').split('_');
                            var last = Number(selector_swiper_slide_last_child.attr('id').replace(/slide/gi, ""));
                            var lastYY = Number(lastdateinfo[0]);
                            var lastMM = Number(lastdateinfo[1]);
                            var lastDD = Number(lastdateinfo[2]);
                            myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
                            myswiper.appendSlide('<div class="swiper-slide" id="slide'+(last+1)+'"></div>'); //마지막 슬라이드에 새슬라이드 추가
                            if(bodywidth >= 600){
                                if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null){
                                    calTable_Set_Week_Mobile(last+1, lastYY, lastMM, lastDD, 7, 0); //새로 추가되는 슬라이드에 달력 채우기
                                    if($('#hidetoggle').attr('data-type') == '1'){
                                        $('.td00, .td30').css({'background':'unset',
                                                              'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                                              'background-size':'60px '+ ($('.hour').height()+1)+'px'});
                                    }
                                }else{
                                    calTable_Set_Week(last+1, lastYY, lastMM, lastDD, 7, 0); //새로 추가되는 슬라이드에 달력 채우기
                                    if($('#hidetoggle').attr('data-type') == '1'){
                                        $('.td00, .td30').css({'background':'unset',
                                                           'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                                            'background-size':'60px '+$('.td00').height()+'px'});
                                    }
                                }
                            }else if(bodywidth<600){
                                calTable_Set_Week_Mobile(last+1, lastYY, lastMM, lastDD, 7, 0); //새로 추가되는 슬라이드에 달력 채우기
                                if($('#hidetoggle').attr('data-type') == '1'){
                                    $('.td00, .td30').css({'background':'unset',
                                                          'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                                          'background-size':'60px '+ ($('.hour').height()+1)+'px'});
                                }
                            }
                            ajaxClassTime();
                        },
                        'prepend' : function(){
                            var selector_swiper_slide_first_child = $('.swiper-slide:first-child');
                            var firstdateinfo = selector_swiper_slide_first_child.find('.td00').attr('id').split('_');
                            var first = Number(selector_swiper_slide_first_child.attr('id').replace(/slide/gi, ""));
                            var firstYY = Number(firstdateinfo[0]);
                            var firstMM = Number(firstdateinfo[1]);
                            var firstDD = Number(firstdateinfo[2]);
                            myswiper.removeSlide(2);
                            myswiper.prependSlide('<div class="swiper-slide" id="slide'+(first-1)+'"></div>'); //맨앞에 새슬라이드 추가
                            if(bodywidth >= 600){
                                if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null){
                                    calTable_Set_Week_Mobile(first-1, firstYY, firstMM, firstDD, -7, 0);
                                    if($('#hidetoggle').attr('data-type') == '1'){
                                        $('.td00, .td30').css({'background':'unset',
                                                              'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                                              'background-size':'60px '+ ($('.hour').height()+1)+'px'});
                                    }
                                }else{
                                    calTable_Set_Week(first-1, firstYY, firstMM, firstDD, -7, 0);
                                    if($('#hidetoggle').attr('data-type') == '1'){
                                        $('.td00, .td30').css({'background':'unset',
                                                           'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                                            'background-size':'60px '+$('.td00').height()+'px'});
                                    }
                                }

                            }else if(bodywidth<600){
                                calTable_Set_Week_Mobile(first-1, firstYY, firstMM, firstDD, -7, 0);
                                if($('#hidetoggle').attr('data-type') == '1'){
                                    $('.td00, .td30').css({'background':'unset',
                                                          'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                                          'background-size':'60px '+ ($('.hour').height()+1)+'px'});
                                }
                            }

                            ajaxClassTime();
                        }
                    },
                    'month':{
                        'append' : function(){ //다음페이지로 넘겼을때
                            var selector_swiper_slide_last_child = $('.swiper-slide:last-child');
                            var lastdateinfo = selector_swiper_slide_last_child.find('.container-fluid').attr('id').split('_');
                            var last = Number(selector_swiper_slide_last_child.attr('id').replace(/slide/gi, ""));
                            var lastYY = Number(lastdateinfo[1]);
                            var lastMM = Number(lastdateinfo[2]);

                            myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
                            //myswiper.appendSlide('<div class="swiper-slide"></div>'); //마지막 슬라이드에 새슬라이드 추가
                            myswiper.appendSlide('<div class="swiper-slide" id="slide'+(last+1)+'"></div>'); //마지막 슬라이드에 새슬라이드 추가
                            //(디버깅용 날짜 표시)myswiper.appendSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth+1)+'월'+' currentPageMonth: '+Number(currentPageMonth+1)+'</div>') //마지막 슬라이드에 새슬라이드 추가
                            calTable_Set_Month(3, lastYY, lastMM+1); //새로 추가되는 슬라이드에 달력 채우기
                            //dateDisabled();
                            monthText();
                            krHoliday_month();
                            //availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
                            ajaxClassTime();
                            myswiper.update(); //슬라이드 업데이트
                        },
                        'prepend' : function(){
                            var selector_swiper_slide_first_child = $('.swiper-slide:first-child');
                            var firstdateinfo = selector_swiper_slide_first_child.find('.container-fluid').attr('id').split('_');
                            var first = Number(selector_swiper_slide_first_child.attr('id').replace(/slide/gi, ""));
                            var firstYY = Number(firstdateinfo[1]);
                            var firstMM = Number(firstdateinfo[2]);

                            myswiper.removeSlide(2);
                            //myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
                            myswiper.prependSlide('<div class="swiper-slide" id="slide'+(first-1)+'"></div>'); //맨앞에 새슬라이드 추가
                            //(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
                            calTable_Set_Month(1, firstYY, firstMM-1);
                            //dateDisabled();
                            monthText();
                            krHoliday_month();
                            //availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
                            ajaxClassTime();
                            myswiper.update(); //이전페이지로 넘겼을때
                        }
                    }
};

/////////////////////////////////////달력 공통//////////////////////////////////


$('#uptext').text("일정");

setInterval(function(){
    // ajaxCheckSchedule();
    //todayFinderArrow();
    addcurrentTimeIndicator_blackbox();
}, 60000);// 자동 ajax 새로고침(일정가져오기)

function ajaxCheckSchedule(){

    $.ajax({
        url: '/schedule/check_schedule_update/',
        dataType : 'html',

        beforeSend:function(){
            //beforeSend();
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            // console.log(jsondata)
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                var update_data_changed = jsondata.data_changed;
                if(update_data_changed[0]=="1"){
                    ajaxClassTime();
                }
            }

        },

        complete:function(){
            //completeSend();
        },

        error:function(){
            console.log('server error');
        }
    });
}

var schedule_on_off = 0; //0 : OFF Schedule / 1 : PT Schedule
//상단바 터치시 주간달력에 회원명/시간 표시 ON OFF

var firstDayInfoPrevMonth = new Date(currentYear, currentMonth-1, 1);
var firstDayPrevMonth = firstDayInfoPrevMonth.getDay(); //전달 1일의 요일
var firstDayInfoNextMonth = new Date(currentYear, currentMonth+1, 1);
var firstDayNextMonth = firstDayInfoNextMonth.getDay(); //다음달 1일의 요일
var currentPageMonth = currentMonth+1; //현재 달

var $calendarWidth = $('#calendar').width(); //현재 달력 넓이계산 --> classTime과 offTime 크기조정을 위해


//작은달력 설정
$.datepicker.setDefaults({
    dateFormat: 'yy-mm-dd',
    prevText: '이전 달',
    nextText: '다음 달',
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일', '월', '화', '수', '목', '금', '토'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
    showMonthAfterYear: true,
    yearSuffix: '년'
});


function week_calendar(referencedate){
    $('#calendar').addClass('_calweek');
    var $page1 = $('.swiper-slide:nth-of-type(1)');
    var $page2 = $('.swiper-slide:nth-of-type(2)');
    var $page3 = $('.swiper-slide:nth-of-type(3)');

    var page1_id_num = $page1.attr('id').replace(/slide/gi, '');
    var page2_id_num = $page2.attr('id').replace(/slide/gi, '');
    var page3_id_num = $page3.attr('id').replace(/slide/gi, '');

    $page1.html('');
    $page2.html('');
    $page3.html('');
    var reference_date_split = referencedate.split('-');
    var year = Number(reference_date_split[0]);
    var month = Number(reference_date_split[1]);
    var date = Number(reference_date_split[2]);
    //calTable_Set(1,year,month,currentDate,-14); // 이번주-2
    calTable_Set_Week(page1_id_num, year, month, date, -7); // 이번주-1
    calTable_Set_Week(page2_id_num, year, month, date, 0); // 이번주
    calTable_Set_Week(page3_id_num, year, month, date, 7); // 이번주+1
    //calTable_Set(5,year,month,currentDate,14); // 이번주+2

    $('.swiper-slide-active').css('width', $('#week').width());
    weekNum_Set_fixed();
    dateText();
    //krHoliday();
    reserveAvailable();
    toDay();
    addcurrentTimeIndicator_blackbox();
    todayFinderArrow();
    ajaxClassTime();
}

function week_calendar_mobile(referencedate){
    time_index_set(calendarSize);
    $('div.timeindex').css('height', 'auto');

    $('#calendar').addClass('_calweek');
    var page1 = $('.swiper-slide:nth-of-type(1)');
    var page2 = $('.swiper-slide:nth-of-type(2)');
    var page3 = $('.swiper-slide:nth-of-type(3)');

    var page1_id_num = $('.swiper-slide:nth-of-type(1)').attr('id').replace(/slide/gi, '');
    var page2_id_num = $('.swiper-slide:nth-of-type(2)').attr('id').replace(/slide/gi, '');
    var page3_id_num = $('.swiper-slide:nth-of-type(3)').attr('id').replace(/slide/gi, '');

    page1.html('');
    page2.html('');
    page3.html('');

    var year = Number(referencedate.split('-')[0]);
    var month = Number(referencedate.split('-')[1]);
    var date = Number(referencedate.split('-')[2]);
    calTable_Set_Week_Mobile(page1_id_num, year, month, date, -7); // 이번주-1
    calTable_Set_Week_Mobile(page2_id_num, year, month, date, 0); // 이번주
    calTable_Set_Week_Mobile(page3_id_num, year, month, date, 7); // 이번주+1

    $('.swiper-slide-active').css({'width': $('#week').width()});
    weekNum_Set_fixed();
    dateText();
    //krHoliday();
    reserveAvailable();
    toDay();
    addcurrentTimeIndicator_blackbox();
    todayFinderArrow();
    ajaxClassTime();
}

function calTable_Set_Week(Index, Year, Month, Dates, Week, append){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성
    //Week 선택자 2E, 1E, 0W, 1L, 2L
    //주간달력 상단표시줄 (요일, 날짜, Today표식)

    //weekTable(Index)
    var W = Week;
    var slideIndex = $('#slide'+Index);
    var currentDates = Number(Dates)+W;
    var currentMonth = Month-1;
    var dateinfo = new Date(Year, Month-1, currentDates);
    var currentDay_ = dateinfo.getDay();

    var text1 = "등록된 일정이 없습니다.";
    if(Options.language == "JPN"){
        text1 = "登録されている日程がありません";
    }else if(Options.language == "ENG"){
        text1 = "No Schedule added";
    }
    var fakeElementForBlankPage = '<div class="fake_for_blankpage"><span>'+text1+'</span></div>';
    //for(var i=0; i<=23; i++){

    var tableHTML = [];
    var yy = String(currentYear);
    var mm = String(currentPageMonth);
    var dd = String(currentDate);
    var today_date = yy+'_'+mm+'_'+dd;
    var work_startTime = Options.workStartTime;
    var work_endTime = Options.workEndTime;

    for(var i=work_startTime; i<work_endTime; i++){
        var textToAppend = '<div id="'+Year+'_'+Month+'_'+currentDate+'_'+Week+'_'+i+'H'+'_00M'+'" class="time-row" style="height:'+(30*calendarSize)+'px;">';
        var textToAppend_ = '<div id="'+Year+'_'+Month+'_'+currentDate+'_'+Week+'_'+i+'H'+'_30M'+'" class="time-row time-row30" style="height:'+(30*calendarSize)+'px;">';
        var divToAppend = $(textToAppend);
        var divToAppend_ = $(textToAppend_);
        var td1_1 = '';
        var td2_1 = '';
        var td1 = [];
        var td2 = [];
        var z = 0;

        var worktime_option = Options.worktimeWeekly;
        var starttime = worktime_extract_hour(worktime_option[z])["start"];
        var endtime = worktime_extract_hour(worktime_option[z])["end"];
        var worktime_disabling;
        var todaywide;

        switch(currentDay_){
            case 0 :
                td1 = [];
                td2 = [];
                for(z=0; z<=6; z++){
                    worktime_option = Options.worktimeWeekly;
                    starttime = worktime_extract_hour(worktime_option[z])["start"];
                    endtime = worktime_extract_hour(worktime_option[z])["end"];

                    if( i < starttime || i >= endtime  ){
                        worktime_disabling = " worktime_disable";
                    }else{
                        worktime_disabling = "";
                    }

                    if(currentDates+z>lastDay[currentMonth] && Month+1>12){ //해가 넘어갈때
                        if( (Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        td2[z]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0 && Month==1){
                        if( (Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        td2[z]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z>lastDay[currentMonth]){
                        if( Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        td2[z]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                        if( Year+'_'+Month+'_'+(currentDates+z) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        td2[z]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0){
                        // if(Month-1<1){
                        //     if( (Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        //     td1[z]='<div'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        //     td2[z]='<div'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        // }else{
                            if( Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                            td1[z]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                            td2[z]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        // }
                    }
                }
                td1_1 = td1.join('');
                td2_1 = td2.join('');
                break;

            case 1 :
                td1 = [];
                td2 = [];
                for(z=-1; z<=5; z++){
                    worktime_option = Options.worktimeWeekly;
                    starttime = worktime_extract_hour(worktime_option[z+1])["start"];
                    endtime = worktime_extract_hour(worktime_option[z+1])["end"];
                    if( i < starttime || i >= endtime  ){
                        worktime_disabling = " worktime_disable";
                    }else{
                        worktime_disabling = "";
                    }
                    if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                        if( (Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+1]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
                        td2[z+1]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0 && Month==1){
                        if( (Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+1]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
                        td2[z+1]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z>lastDay[currentMonth]){
                        if( Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+1]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
                        td2[z+1]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                        if( Year+'_'+Month+'_'+(currentDates+z) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+1]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
                        td2[z+1]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0){
                        if( Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+1]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
                        td2[z+1]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
                    }
                }
                td1_1 = td1.join('');
                td2_1 = td2.join('');
                break;

            case 2 :
                td1 = [];
                td2 = [];
                for(z=-2; z<=4; z++){
                    worktime_option = Options.worktimeWeekly;
                    starttime = worktime_extract_hour(worktime_option[z+2])["start"];
                    endtime = worktime_extract_hour(worktime_option[z+2])["end"];
                    if( i < starttime || i >= endtime  ){
                        worktime_disabling = " worktime_disable";
                    }else{
                        worktime_disabling = "";
                    }
                    if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                        if( (Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+2]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
                        td2[z+2]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0 && Month==1){
                        if( (Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+2]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
                        td2[z+2]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z>lastDay[currentMonth]){
                        if( Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+2]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
                        td2[z+2]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                        if( Year+'_'+Month+'_'+(currentDates+z) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+2]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
                        td2[z+2]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0){
                        if( Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+2]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
                        td2[z+2]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
                    }
                }
                td1_1 = td1.join('');
                td2_1 = td2.join('');
                break;

            case 3 :
                td1 = [];
                td2 = [];
                for(z=-3; z<=3; z++){
                    worktime_option = Options.worktimeWeekly;
                    starttime = worktime_extract_hour(worktime_option[z+3])["start"];
                    endtime = worktime_extract_hour(worktime_option[z+3])["end"];
                    if( i < starttime || i >= endtime  ){
                        worktime_disabling = " worktime_disable";
                    }else{
                        worktime_disabling = "";
                    }
                    if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                        if( (Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+3]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
                        td2[z+3]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0 && Month==1){
                        if( (Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+3]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
                        td2[z+3]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z>lastDay[currentMonth]){
                        if( Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+3]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
                        td2[z+3]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                        if( Year+'_'+Month+'_'+(currentDates+z) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+3]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
                        td2[z+3]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0){
                        if( Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+3]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
                        td2[z+3]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
                    }
                }
                td1_1 = td1.join('');
                td2_1 = td2.join('');
                break;

            case 4 :
                td1 = [];
                td2 = [];
                for(z=-4; z<=2; z++){
                    worktime_option = Options.worktimeWeekly;
                    starttime = worktime_extract_hour(worktime_option[z+4])["start"];
                    endtime = worktime_extract_hour(worktime_option[z+4])["end"];
                    if( i < starttime || i >= endtime  ){
                        worktime_disabling = " worktime_disable";
                    }else{
                        worktime_disabling = "";
                    }
                    if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                        if( (Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+4]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
                        td2[z+4]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'">'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0 && Month==1){
                        if( (Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+4]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
                        td2[z+4]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z>lastDay[currentMonth]){
                        if( Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+4]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
                        td2[z+4]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                        if( Year+'_'+Month+'_'+(currentDates+z) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+4]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
                        td2[z+4]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0){
                        if( Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+4]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
                        td2[z+4]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
                    }
                }
                td1_1 = td1.join('');
                td2_1 = td2.join('');
                break;

            case 5 :
                td1 = [];
                td2 = [];
                for(z=-5; z<=1; z++){
                    worktime_option = Options.worktimeWeekly;
                    starttime = worktime_extract_hour(worktime_option[z+5])["start"];
                    endtime = worktime_extract_hour(worktime_option[z+5])["end"];
                    if( i < starttime || i >= endtime  ){
                        worktime_disabling = " worktime_disable";
                    }else{
                        worktime_disabling = "";
                    }
                    if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                        if( (Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+5]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
                        td2[z+5]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0 && Month==1){
                        if( (Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+5]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
                        td2[z+5]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z>lastDay[currentMonth]){
                        if( Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+5]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
                        td2[z+5]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                        if( Year+'_'+Month+'_'+(currentDates+z) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+5]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
                        td2[z+5]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0){
                        if( Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+5]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
                        td2[z+5]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
                    }
                }
                td1_1 = td1.join('');
                td2_1 = td2.join('');
                break;

            case 6 :
                td1 = [];
                td2 = [];
                for(z=-6; z<=0; z++){
                    worktime_option = Options.worktimeWeekly;
                    starttime = worktime_extract_hour(worktime_option[z+6])["start"];
                    endtime = worktime_extract_hour(worktime_option[z+6])["end"];
                    if( i < starttime || i >= endtime  ){
                        worktime_disabling = " worktime_disable";
                    }else{
                        worktime_disabling = "";
                    }
                    if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                        if( (Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+6]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
                        td2[z+6]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0 && Month==1){
                        if( (Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+6]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
                        td2[z+6]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z>lastDay[currentMonth]){
                        if( Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+6]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
                        td2[z+6]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                        if( Year+'_'+Month+'_'+(currentDates+z) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+6]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
                        td2[z+6]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0){
                        if( Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z+6]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
                        td2[z+6]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
                    }
                }
                td1_1 = td1.join('');
                td2_1 = td2.join('');
                break;
        }
        //var td = td1_1+td1_2+td1_3+td1_4+td1_5+td1_6+td1_7+'</tr><tr>'+td2_1+td2_2+td2_3+td2_4+td2_5+td2_6+td2_7+'</tr></tbody></table></div>'
        //var td= td1_1+td2_1+'</div>'
        //var td= td1_1 + '</div>'
        var td00 = td1_1 + '</div>';
        var td30 = td2_1 + '</div>';
        var toAppend1;
        var toAppend2;
        if(i<12){
            toAppend1 = '<div class="slidegap"><span class="_morningday">오전 </span>'+i+'<div></div></div>'+td00;
            toAppend2 = '<div class="slidegap"><span class="_morningday">오전 </span>'+i+'<div></div></div>'+td30;
        }else{
            toAppend1 = '<div class="slidegap"><span class="_morningday">오후 </span>'+i+'<div></div></div>'+td00;
            toAppend2 = '<div class="slidegap"><span class="_morningday">오후 </span>'+i+'<div></div></div>'+td30;
        }


        if(Options.classDur == 30){
        }else if(Options.classDur == 60){
            $('.time-row').css('border-bottom', '0');
        }

        var sum = textToAppend+toAppend1+textToAppend_+toAppend2;
        //slideIndex.append(sum);
        tableHTML.push(sum);

    }
    slideIndex.html(tableHTML.join(''));
    slideIndex.append(fakeElementForBlankPage);
    //weekNum_Set(Index);
    time_index_set(calendarSize);
} //calTable_Set

function calTable_Set_Week_Mobile(Index, Year, Month, Dates, Week, append){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성
    //Week 선택자 2E, 1E, 0W, 1L, 2L
    //주간달력 상단표시줄 (요일, 날짜, Today표식)
    //weekTable(Index)

    var W = Week;
    var slideIndex = $('#slide'+Index);
    var currentDates = Number(Dates)+W;
    var dateinfo = new Date(Year, Month-1, currentDates);
    var currentDay_ = dateinfo.getDay();
    // var monthdata = currentMonth;
    var MonthforLastDay = Month - 1;

    // if(append==0){

    //     currentDay = 0;
    //     //var dataforappend = $('.swiper-slide-prev').find('.td00').attr('id').split('_')
    //     var currentSlideNum = Number($('.swiper-slide-active').attr('id').replace(/slide/gi, ''));
    //     var dataforappend = $('#slide'+(currentSlideNum)).find('.td00').attr('id').split('_');

    //     // var monthforappend = Number(dataforappend[1])-1;
    //     monthdata = Number(dataforappend[1])-1;
    // }
    var text1 = "등록된 일정이 없습니다.";
    if(Options.language == "JPN"){
        text1 = "登録されている日程がありません";
    }else if(Options.language == "ENG"){
        text1 = "No Schedule added";
    }
    var fakeElementForBlankPage = '<div class="fake_for_blankpage"><span>'+text1+'</span></div>';
    //for(var i=0; i<=23; i++){

    var tableHTML = [];
    var textToAppend = '<div id="'+Year+'_'+Month+'_'+currentDate+'_'+Week+'_'+i+'H'+'_00M'+'" class="time-row" style="height:100%;border:unset;background-color:#f7f7f7;">';
    var divToAppend = $(textToAppend);
    var td1_1;
    var td1 = [];
    var z = 0;
    var i = Options.workStartTime;
    var td_style = ' style="background:#ffffff;background-size:60px 60px;background-image:url(/static/user/res/calendar_hour.png);cursor:default" ';

    var worktime_option;
    var starttime;
    var endtime;
    var time_disable_start;
    var time_disable_end;

    var hour_firstcell;
    var hour_lastcell;
    var workstart_disabling;
    var workend_disabling;

    switch(currentDay_){
        case 0 :
            td1 = [];
            for(z=0; z<=6; z++){
                worktime_option = Options.worktimeWeekly;
                starttime = worktime_extract_maxmin(worktime_option).min;
                endtime = worktime_extract_maxmin(worktime_option).max-1;

                time_disable_start = worktime_extract_hour(worktime_option[z])["start"];
                time_disable_end = worktime_extract_hour(worktime_option[z])["end"]-1;

                if(time_disable_start < starttime){
                    time_disable_start = starttime+1;
                }
                if(time_disable_end == -1 || time_disable_end == 0){
                    time_disable_end = starttime;
                }

                if(time_disable_end >= endtime){
                    time_disable_end = endtime;
                }

                hour_firstcell = $('.timeindex div.hour:first-child');
                hour_lastcell = $('.timeindex div.hour:last-child');

                workstart_disabling = `<div style="position:absolute;
                                                      top:${hour_firstcell.position().top}px;
                                                      width:100%;
                                                      height:${ $(`#hour${time_disable_start}`).position().top - hour_firstcell.position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;
                workend_disabling = `<div style="position:absolute;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;


                if(currentDates+z>lastDay[MonthforLastDay] && Month+1>12){ //해가 넘어갈때
                    td1[z]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[MonthforLastDay]){
                    td1[z]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[MonthforLastDay] && currentDates+z>0){
                    td1[z]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    if(Month-1<1){
                        td1[z]='<div'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                    }else{
                        td1[z]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[MonthforLastDay-1])+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                    }
                }
            }
            td1_1 = td1.join('');
            break;

        case 1 :
            td1 = [];
            for(z=-1; z<=5; z++){
                worktime_option = Options.worktimeWeekly;
                starttime = worktime_extract_maxmin(worktime_option).min;
                endtime = worktime_extract_maxmin(worktime_option).max-1;

                time_disable_start = worktime_extract_hour(worktime_option[z+1])["start"];
                time_disable_end = worktime_extract_hour(worktime_option[z+1])["end"]-1;

                if(time_disable_start < starttime){
                    time_disable_start = starttime+1;
                }
                if(time_disable_end == -1 || time_disable_end == 0){
                    time_disable_end = starttime;
                }

                if(time_disable_end >= endtime){
                    time_disable_end = endtime;
                }


                hour_firstcell = $('.timeindex div.hour:first-child');
                hour_lastcell = $('.timeindex div.hour:last-child');

                workstart_disabling = `<div style="position:absolute;
                                                      top:${hour_firstcell.position().top}px;
                                                      width:100%;
                                                      height:${ $(`#hour${time_disable_start}`).position().top - hour_firstcell.position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;
                workend_disabling = `<div style="position:absolute;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;

                if(currentDates+z>lastDay[MonthforLastDay] && Month+1>12){
                    td1[z+1]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+1)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+1]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+1)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[MonthforLastDay]){
                    td1[z+1]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+1)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[MonthforLastDay] && currentDates+z>0){
                    td1[z+1]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+1)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    td1[z+1]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[MonthforLastDay-1])+' class="td00"'+td_style+' data-week='+(z+1)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }
            }
            td1_1 = td1.join('');
            break;

        case 2 :
            td1 = [];
            for(z=-2; z<=4; z++){
                worktime_option = Options.worktimeWeekly;
                starttime = worktime_extract_maxmin(worktime_option).min;
                endtime = worktime_extract_maxmin(worktime_option).max-1;

                time_disable_start = worktime_extract_hour(worktime_option[z+2])["start"];
                time_disable_end = worktime_extract_hour(worktime_option[z+2])["end"]-1;

                if(time_disable_start < starttime){
                    time_disable_start = starttime+1;
                }
                if(time_disable_end == -1 || time_disable_end == 0){
                    time_disable_end = starttime;
                }

                if(time_disable_end >= endtime){
                    time_disable_end = endtime;
                }


                hour_firstcell = $('.timeindex div.hour:first-child');
                hour_lastcell = $('.timeindex div.hour:last-child');

                workstart_disabling = `<div style="position:absolute;
                                                      top:${hour_firstcell.position().top}px;
                                                      width:100%;
                                                      height:${ $(`#hour${time_disable_start}`).position().top - hour_firstcell.position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;
                workend_disabling = `<div style="position:absolute;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;

                if(currentDates+z>lastDay[MonthforLastDay] && Month+1>12){
                    td1[z+2]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+2)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+2]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+2)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[MonthforLastDay]){
                    td1[z+2]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+2)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[MonthforLastDay] && currentDates+z>0){
                    td1[z+2]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+2)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    td1[z+2]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[MonthforLastDay-1])+' class="td00"'+td_style+' data-week='+(z+2)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }
            }
            td1_1 = td1.join('');
            break;

        case 3 :
            td1 = [];
            for(z=-3; z<=3; z++){
                worktime_option = Options.worktimeWeekly;
                starttime = worktime_extract_maxmin(worktime_option).min;
                endtime = worktime_extract_maxmin(worktime_option).max-1;

                time_disable_start = worktime_extract_hour(worktime_option[z+3])["start"];
                time_disable_end = worktime_extract_hour(worktime_option[z+3])["end"]-1;

                if(time_disable_start < starttime){
                    time_disable_start = starttime+1;
                }
                if(time_disable_end == -1 || time_disable_end == 0){
                    time_disable_end = starttime;
                }

                if(time_disable_end >= endtime){
                    time_disable_end = endtime;
                }

                hour_firstcell = $('.timeindex div.hour:first-child');
                hour_lastcell = $('.timeindex div.hour:last-child');



                workstart_disabling = `<div style="position:absolute;
                                                      top:${hour_firstcell.position().top}px;
                                                      width:100%;
                                                      height:${ $(`#hour${time_disable_start}`).position().top - hour_firstcell.position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;
                workend_disabling = `<div style="position:absolute;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;


                if(currentDates+z>lastDay[MonthforLastDay] && Month+1>12){
                    td1[z+3]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+3)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+3]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+3)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[MonthforLastDay]){
                    td1[z+3]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+3)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[MonthforLastDay] && currentDates+z>0){
                    td1[z+3]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+3)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    td1[z+3]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[MonthforLastDay-1])+' class="td00"'+td_style+' data-week='+(z+3)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }
            }
            td1_1 = td1.join('');
            break;

        case 4 :
            td1 = [];
            for(z=-4; z<=2; z++){
                worktime_option = Options.worktimeWeekly;
                starttime = worktime_extract_maxmin(worktime_option).min;
                endtime = worktime_extract_maxmin(worktime_option).max-1;

                time_disable_start = worktime_extract_hour(worktime_option[z+4])["start"];
                time_disable_end = worktime_extract_hour(worktime_option[z+4])["end"]-1;

                if(time_disable_start < starttime){
                    time_disable_start = starttime+1;
                }
                if(time_disable_end == -1 || time_disable_end == 0){
                    time_disable_end = starttime;
                }

                if(time_disable_end >= endtime){
                    time_disable_end = endtime;
                }


                hour_firstcell = $('.timeindex div.hour:first-child');
                hour_lastcell = $('.timeindex div.hour:last-child');

                workstart_disabling = `<div style="position:absolute;
                                                      top:${hour_firstcell.position().top}px;
                                                      width:100%;
                                                      height:${ $(`#hour${time_disable_start}`).position().top - hour_firstcell.position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;
                workend_disabling = `<div style="position:absolute;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;

                if(currentDates+z>lastDay[MonthforLastDay] && Month+1>12){
                    td1[z+4]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+4)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+4]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+4)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[MonthforLastDay]){
                    td1[z+4]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+4)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[MonthforLastDay] && currentDates+z>0){
                    td1[z+4]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+4)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    td1[z+4]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[MonthforLastDay-1])+' class="td00"'+td_style+' data-week='+(z+4)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }
            }
            td1_1 = td1.join('');
            break;

        case 5 :
            td1 = [];
            for(z=-5; z<=1; z++){
                worktime_option = Options.worktimeWeekly;
                starttime = worktime_extract_maxmin(worktime_option).min;
                endtime = worktime_extract_maxmin(worktime_option).max-1;

                time_disable_start = worktime_extract_hour(worktime_option[z+5])["start"];
                time_disable_end = worktime_extract_hour(worktime_option[z+5])["end"]-1;

                if(time_disable_start < starttime){
                    time_disable_start = starttime+1;
                }
                if(time_disable_end == -1 || time_disable_end == 0){
                    time_disable_end = starttime;
                }

                if(time_disable_end >= endtime){
                    time_disable_end = endtime;
                }


                hour_firstcell = $('.timeindex div.hour:first-child');
                hour_lastcell = $('.timeindex div.hour:last-child');

                workstart_disabling = `<div style="position:absolute;
                                                      top:${hour_firstcell.position().top}px;
                                                      width:100%;
                                                      height:${ $(`#hour${time_disable_start}`).position().top - hour_firstcell.position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;
                workend_disabling = `<div style="position:absolute;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;

                if(currentDates+z>lastDay[MonthforLastDay] && Month+1>12){
                    td1[z+5]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+5)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+5]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+5)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                
                }else if(currentDates+z>lastDay[MonthforLastDay]){
                    td1[z+5]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+5)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                
                }else if(currentDates+z<=lastDay[MonthforLastDay] && currentDates+z>0){
                    td1[z+5]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+5)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                
                }else if(currentDates+z<=0){
                    td1[z+5]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[MonthforLastDay-1])+' class="td00"'+td_style+' data-week='+(z+5)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                
                }
            }
            td1_1 = td1.join('');
            break;

        case 6 :
            td1 = [];
            for(z=-6; z<=0; z++){
                worktime_option = Options.worktimeWeekly;
                starttime = worktime_extract_maxmin(worktime_option).min;
                endtime = worktime_extract_maxmin(worktime_option).max-1;

                time_disable_start = worktime_extract_hour(worktime_option[z+6])["start"];
                time_disable_end = worktime_extract_hour(worktime_option[z+6])["end"]-1;

                if(time_disable_start < starttime){
                    time_disable_start = starttime+1;
                }
                if(time_disable_end == -1 || time_disable_end == 0){
                    time_disable_end = starttime;
                }

                if(time_disable_end >= endtime){
                    time_disable_end = endtime;
                }

                hour_firstcell = $('.timeindex div.hour:first-child');
                hour_lastcell = $('.timeindex div.hour:last-child');

                workstart_disabling = `<div style="position:absolute;
                                                      top:${hour_firstcell.position().top}px;
                                                      width:100%;
                                                      height:${ $(`#hour${time_disable_start}`).position().top - hour_firstcell.position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;
                workend_disabling = `<div style="position:absolute;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;

                if(currentDates+z>lastDay[MonthforLastDay] && Month+1>12){

                    td1[z+6]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+6)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){

                    td1[z+6]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+6)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[MonthforLastDay]){

                    td1[z+6]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[MonthforLastDay])+' class="td00"'+td_style+' data-week='+(z+6)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[MonthforLastDay] && currentDates+z>0){

                    td1[z+6]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+6)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){

                    td1[z+6]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[MonthforLastDay-1])+' class="td00"'+td_style+' data-week='+(z+6)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }
            }
            td1_1 = td1.join('');
            break;
    }

    var td00 = td1_1 + '</div>';
    var toAppend1;
    if(i<12){
        toAppend1 = '<div class="slidegap"><span class="_morningday"></span>'+i+'<div></div></div>'+td00;
        //toAppend2 = '<div class="slidegap"><span class="_morningday">오전 </span>'+i+'<div></div></div>'+td30;
    }else{
        toAppend1 = '<div class="slidegap"><span class="_morningday"></span>'+i+'<div></div></div>'+td00;
        //toAppend2 = '<div class="slidegap"><span class="_morningday">오후 </span>'+i+'<div></div></div>'+td30;
    }


    if(Options.classDur == 30){
    }else if(Options.classDur == 60){
        $('.time-row').css('border-bottom','0');
    }


    var sum = textToAppend+toAppend1;
    tableHTML.push(sum);


    slideIndex.html(tableHTML.join(''));
    //slideIndex.append(fakeElementForBlankPage);
    //weekNum_Set(Index);

    $('.swiper-slide').css('height', $('div.timeindex').height());
} //calTable_Set

function time_index_set(size){
    var start = Options.workStartTime;
    var end = Options.workEndTime;

    var work_startTime = Options.workStartTime;
    var work_endTime = Options.workEndTime;

    var timelist = [];

    var morning = '<span class="KRtext">오전</span>';
    var afternoon = '<span class="KRtext">오후</span>';
    if(Options.language=="JPN"){
        morning = '<span class="JPtext">午前</span>';
        afternoon = '<span class="JPtext">午後</span>';
    }else if(Options.language=="ENG"){
        morning = '<span class="ENtext">AM</span>';
        afternoon = '<span class="ENtext">PM</span>';
    }

    for(var i=work_startTime; i<work_endTime; i++){
        // if(i<12 && i == work_startTime){
        //     timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="morningtext">'+morning+'</span><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
        // }else if(i==12){
        //     timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="morningtext">'+afternoon+'</span><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
        // }else if(i>12){
        //     timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="timeindex_time">'+time_h_format_to_hh(i-12)+':00</span></div>');
        // }else{
        //     timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
        // }
        // if(i<12 && i == work_startTime){
        //     timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="morningtext">'+morning+'</span><span class="timeindex_time">'+i+':00</span></div>');
        // }else if(i==12){
        //     timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="morningtext">'+afternoon+'</span><span class="timeindex_time">'+i+':00</span></div>');
        // }else if(i>12){
        //     timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="morningtext">'+afternoon+'</span><span class="timeindex_time">'+(i-12)+':00</span></div>');
        // }else{
        //     timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="morningtext">'+morning+'</span><span class="timeindex_time">'+i+':00</span></div>');
        // }
        if(i<12 && i == work_startTime){
            timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="morningtext">'+morning+'</span><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
        }else if(i==12){
            timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="morningtext">'+afternoon+'</span><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
        }else if(i>12){
            timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
        }else{
            timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
        }
    }
    $('div.timeindex').html(timelist.join(''));
}

function dateText(){
    var yymm = {};
    var yymmarry = [];
    yymmarry = [$('#weekNum_1').attr('data-date'), $('#weekNum_7').attr('data-date')];
    //연도, 월 셋팅
    if(yymmarry.length>1){  // [2017_12, 2018_1] ,,  [2018_1, 2018_2]
        var yy1 = yymmarry[0].substr(0, 4);
        var mm1 = Number(yymmarry[0].substr(4, 2));
        var yy2 = yymmarry[1].substr(0, 4);
        var mm2 = Number(yymmarry[1].substr(4, 2));
        if(yy1==yy2){
            if(mm1 == mm2){
                $('#yearText').text(yy1+'년');
                $('#monthText').text(mm1+'월');
            }else{
                $('#yearText').text(yy1+'년');
                $('#monthText').text(mm1+'/'+mm2+'월');
            }
            $('#ymdText-pc-month-start').text(mm1+'월').attr({'data-year': yy1, 'data-month':mm1});
            $('#ymdText-pc-month-end').text(mm2+'월').attr({'data-year': yy2, 'data-month':mm2});
        }else if(yy1!=yy2){
            $('#yearText').text(yy1+'/'+yy2+'년');
            $('#monthText').text(mm1+'/'+mm2+'월');
            $('#ymdText-pc-month-start').text(mm1+'월').attr({'data-year': yy1, 'data-month':mm1});
            $('#ymdText-pc-month-end').text(mm2+'월').attr({'data-year': yy2, 'data-month':mm2});
        }
    }else{
        yymm = yymmarry[0].split('_');
        $('#yearText').text(yymm[0]+'년');
        $('#monthText').text(yymm[1]+'월');
        $('#ymdText-pc-month-start').text(yymm[1]+'월');
        $('#ymdText-pc-month-end').text('');
    }

    //일자 셋팅
    var dd_weekstart = $('#weekNum_1').attr('data-date').substr(6, 2);
    var dd_weekend = $('#weekNum_7').attr('data-date').substr(6, 2);
    if(dd_weekstart.substr(0, 1)=='0'){
        dd_weekstart = dd_weekstart.substr(1, 1);
    }
    if(dd_weekend.substr(0, 1)=='0'){
        dd_weekend = dd_weekend.substr(1, 1);
    }
    $('#ymdText-pc-date-start').text(dd_weekstart+'일').attr('data-date', dd_weekstart);
    $('#ymdText-pc-date-end').text(dd_weekend+'일').attr('data-date', dd_weekend);
}

function krHoliday_week(){
    $('.holiday').removeClass('holiday');
    $('.holidayName').text('');
    for(var i=0; i<krHolidayList.length; i++){
        var date_data = date_format_yyyy_m_d_to_yyyymmdd(krHolidayList[i]);
        var selector_week_weekNum_data_date = $("#week .weekNum[data-date="+date_data+"]");
        selector_week_weekNum_data_date.addClass('holiday');
        selector_week_weekNum_data_date.find('.holidayName').text(krHolidayNameList[i]);
    }
}

function weekNum_Set(Index){
    var index = Number(myswiper.activeIndex+1);
    var Sunday_date = $('#slide'+Index+' #sunDate');
    var Monday_date = $('#slide'+Index+' #monDate');
    var Tuesday_date = $('#slide'+Index+' #tueDate');
    var Wednesday_date = $('#slide'+Index+' #wedDate');
    var Thursday_date = $('#slide'+Index+' #thrDate');
    var Friday_date = $('#slide'+Index+' #friDate');
    var Saturday_date = $('#slide'+Index+' #satDate');
    var WeekArry = [Sunday_date, Monday_date, Tuesday_date, Wednesday_date, Thursday_date, Friday_date, Saturday_date];
    var lastDayThisMonth = lastDay[currentMonth];
    var swiperPage = $('#slide'+Index+' div:nth-child(1)');

    for(var i=2; i<=8; i++){
        var dateID = swiperPage.find('.td00:nth-child('+i+')').attr('id').split('_');
        var yy = dateID[0];
        var mm = dateID[1];
        var dd = dateID[2];
        WeekArry[i-2].html(dd);
        if(mm.length<2){
            mm = '0'+dateID[1];
        }
        if(dd.length<2){
            dd = '0'+dateID[2];
        }
        $('#slide'+Index+' #weekNum_'+Number(i-1)).attr('data-date', yy+mm+dd);
    }

    //toDay();
    //reserveAvailable();
}

function weekNum_Set_fixed(){
    var weekNum_1 = $('#weekNum_1');
    var weekNum_2 = $('#weekNum_2');
    var weekNum_3 = $('#weekNum_3');
    var weekNum_4 = $('#weekNum_4');
    var weekNum_5 = $('#weekNum_5');
    var weekNum_6 = $('#weekNum_6');
    var weekNum_7 = $('#weekNum_7');

    var sunday = $('#sunDate');
    var monday = $('#monDate');
    var tuesday = $('#tueDate');
    var wednesday = $('#wedDate');
    var thursday = $('#thrDate');
    var friday = $('#friDate');
    var saturday = $('#satDate');

    var $sunday = $('.swiper-slide-active'+' div.td00:nth-child(2)');
    var $monday = $('.swiper-slide-active'+' div.td00:nth-child(3)');
    var $tuesday = $('.swiper-slide-active'+' div.td00:nth-child(4)');
    var $wednesday = $('.swiper-slide-active'+' div.td00:nth-child(5)');
    var $thursday = $('.swiper-slide-active'+' div.td00:nth-child(6)');
    var $friday = $('.swiper-slide-active'+' div.td00:nth-child(7)');
    var $saturday = $('.swiper-slide-active'+' div.td00:nth-child(8)');

    var selectorArry = [$sunday, $monday, $tuesday, $wednesday, $thursday, $friday, $saturday];

    var Sunday_date = $sunday.attr('id').split('_')[2];
    var Monday_date = $monday.attr('id').split('_')[2];
    var Tuesday_date = $tuesday.attr('id').split('_')[2];
    var Wednesday_date = $wednesday.attr('id').split('_')[2];
    var Thursday_date = $thursday.attr('id').split('_')[2];
    var Friday_date = $friday.attr('id').split('_')[2];
    var Saturday_date = $saturday.attr('id').split('_')[2];

    var currentPageDateInfo = [];
    var i;
    for (i=0; i<=6; i++){
        var selector_swiper_slide_active_div = selectorArry[i];
        var yy = selector_swiper_slide_active_div.attr('id').split('_')[0];
        var mm = selector_swiper_slide_active_div.attr('id').split('_')[1];
        var dd = selector_swiper_slide_active_div.attr('id').split('_')[2];
        if(mm.length<2){
            mm = '0' + mm;
        }
        if(dd.length<2){
            dd = '0' + dd;
        }
        currentPageDateInfo[i] = yy+mm+dd;
    }

    var WeekArry = [sunday, monday, tuesday, wednesday, thursday, friday, saturday];
    var WeekArryTarget = [Sunday_date, Monday_date, Tuesday_date, Wednesday_date, Thursday_date, Friday_date, Saturday_date];
    var WeekNum = [weekNum_1, weekNum_2, weekNum_3, weekNum_4, weekNum_5, weekNum_6, weekNum_7];

    $('.holidayName').text('');
    $('.holiday').removeClass('holiday');

    for(i=0; i<7;i++){
        
        WeekArry[i].html(WeekArryTarget[i]);

        var date_yyyy_m_d = date_format_yyyy_mm_dd_to_yyyy_m_d(date_format_yyyymmdd_to_split(currentPageDateInfo[i], '_'), '_');

        if(krHolidayList.indexOf(date_yyyy_m_d) != -1){
            WeekNum[i].attr('data-date', currentPageDateInfo[i]).addClass('holiday');
            WeekNum[i].find('.holidayName').text( krHolidayNameList[krHolidayList.indexOf(date_yyyy_m_d)]  );
        }else{
            WeekNum[i].attr('data-date', currentPageDateInfo[i]);
        }
    }
}

function todayFinderArrow(){
    var currentMM = String(currentPageMonth);
    var currentDD = String(currentDate);
    if(currentMM.length<2){
        currentMM = '0'+currentMM;
    }
    if(currentDD.length<2){
        currentDD = '0'+currentDD;
    }
    var todayInfo = String(currentYear) + currentMM + currentDD;
    var viewdayInfomin = $('#weekNum_1').attr('data-date');
    var viewdayInfomax = $('#weekNum_7').attr('data-date');

    if(viewdayInfomax>=todayInfo && viewdayInfomin<=todayInfo){
        $('._pinkarrowbefore, ._pinkarrowafter').addClass('setunVisible');
        $("#ymdText").addClass('todayindi').removeClass('nottodayindi');
    }else if(todayInfo>viewdayInfomax && todayInfo>viewdayInfomin){
        $('._pinkarrowafter').removeClass('setunVisible');
        $('._pinkarrowbefore').addClass('setunVisible');
        $("#ymdText").removeClass('todayindi').addClass('nottodayindi');
    }else if(todayInfo<viewdayInfomax && todayInfo<viewdayInfomin){
        $('._pinkarrowafter').addClass('setunVisible');
        $('._pinkarrowbefore').removeClass('setunVisible');
        $("#ymdText").removeClass('todayindi').addClass('nottodayindi');
    }
}

function addcurrentTimeIndicator_blackbox(){ //현재 시간에 밑줄 긋기
    var realTime = new Date();
    var realTimeHour = realTime.getHours();
    var realTimeMin = realTime.getMinutes();
    var selector_timeIndicatorBar = $('#timeIndicatorBar');
    if($('.today').length && realTimeHour < Options.workEndTime && realTimeHour >= Options.workStartTime){
        var selector_hour_realTimeHour = $('#hour'+realTimeHour);
        $('.currentTimeBlackBox').removeClass('currentTimeBlackBox');
        selector_hour_realTimeHour.addClass('currentTimeBlackBox');
        var indicator_Location = selector_hour_realTimeHour.position().top;
        var minute_adjust = 45*(realTimeMin/60);
        selector_timeIndicatorBar.css('top', indicator_Location+minute_adjust);
        if(realTimeMin<10){
            realTimeMin = '0' + realTimeMin;
        }
        if(realTimeHour<10){
            realTimeHour = '0' + realTimeHour;
        }
        var ampm_time = time_format_add_ampm(realTimeHour+':'+realTimeMin);
        selector_timeIndicatorBar.css('visibility', 'visible').html('<span class="timeindicator_rightfloat">'+ampm_time+'</span>');
    }else{
        $('.hour').removeClass('currentTimeBlackBox');
        selector_timeIndicatorBar.css('visibility', 'hidden');
    }
}

function toDay(){
    var yy = String(currentYear);
    var dd = String(currentDate);
    var mm = String(currentPageMonth);
    var i;
    /*
    for(i=0;i<=23;i++){
        $("#"+yy+'_'+mm+'_'+dd+'_'+i+'_00' + ",#"+yy+'_'+mm+'_'+dd+'_'+i+'_30').addClass('todaywide');
    }*/

    for(i=1; i<=7; i++){
        var scan = $('#weekNum_'+i).attr('data-date');
        if(mm.length<2){
            mm = '0'+mm;
        }
        if(dd.length<2){
            dd = '0'+dd;
        }
        if(scan == yy+mm+dd){
            if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null){
            }else{
                $('#weekNum_'+i).addClass('todaywide');
            }
            // $('#weekNum_'+i+' span:nth-child(1)').addClass('today').html('TODAY');
            $('#weekNum_'+i+' span:nth-child(1)').addClass('today');
            $('#weekNum_'+i+' span:nth-child(3)').addClass('today-Number');

        }else{
            if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null){
            }else{
                $('#weekNum_'+i).removeClass('todaywide');
            }
            $('#weekNum_'+i+' span:nth-child(1)').removeClass('today').html('');
            $('#weekNum_'+i+' span:nth-child(3)').removeClass('today-Number');
        }
    }
}

function reserveAvailable(){
    var yy = currentYear;
    var mm = String(currentPageMonth);
    var dd = String(currentDate);
    if(mm.length<2){
        mm = '0'+mm;
    }
    if(dd.length<2){
        dd = '0'+dd;
    }
    var ymdArry = [yy, mm, dd];
    var yymmdd = ymdArry.join('');
    for(var i=1; i<=7; i++){
        var scan = $('#weekNum_'+i).attr('data-date');
        if(yymmdd<=scan && scan<Options.availDate+Number(yymmdd)){
            $('#weekNum_'+i).addClass('reserveavailable');
        }else if(scan.substr(0, 4)==yy+1 && scan.substr(4, 2) == '01' &&scan.substr(6, 2)<Number(dd)+Options.availDate-lastDay[currentMonth]){
            $('#weekNum_'+i).addClass('reserveavailable');
        }else if(scan.substr(4, 2)== Number(mm)+1 && scan.substr(6, 2)<Number(dd)+Options.availDate-lastDay[currentMonth]){
            $('#weekNum_'+i).addClass('reserveavailable');
        }else{
            $('#weekNum_'+i).removeClass('reserveavailable');

        }
    }
}

function fake_show(){
    //var faketarget = selector.parent('div').siblings('.fake_for_blankpage')
    var selector_swiper_slide_active = $('.swiper-slide-active');
    if(selector_swiper_slide_active.find('._class').length == 0 && selector_swiper_slide_active.find('._off').length == 0 && selector_swiper_slide_active.find('._group').length == 0){
        selector_swiper_slide_active.find('.fake_for_blankpage').css('display', 'block');
    }else{
        selector_swiper_slide_active.find('.fake_for_blankpage').css('display', 'none');
    }
    /*else if($('.swiper-slide-active').find('.classTime').length == 0 && $('.swiper-slide-active').find('.offTime').length == 0){
     $('.swiper-slide-active').find('.fake_for_blankpage').css('display','block')
     }*/
}

function scheduleTime(option, jsondata, size, duplicate_check){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
    //중복일정 ㅇㄷ
    // var duplicate_check = know_duplicated_plans(jsondata).result;
    //중복일정 ㅇㄷ  

    $('.blankSelected_addview').removeClass('blankSelected blankSelected30');
    $('.blankSelected30').removeClass('blankSelected30');
    $('.blankSelected').removeClass('blankSelected');
    var plan = '';
    var planStartDate = '';
    var planGroupStartDate = '';
    var planEndDate = '';
    var planMemberName = '';
    var planScheduleIdArray = '';
    var planNoteArray = '';
    var planScheduleFinishArray = '';
    var planColor = '';
    var planfinished = '';
    var planMemberNum = '';
    var planMemberDbid = '';
    var planGroupid = '';
    var planCode = '';
    var planGroupClassName = '';
    var plancolor_ing_bg_cd = "";
    var plancolor_ing_font_cd = "";
    var plancolor_end_bg_cd = "";
    var plancolor_end_font_cd = "";
    switch(option){
        case 'class':
            plan = option;
            planStartDate = jsondata.classTimeArray_start_date;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.classTimeArray_end_date;
            planMemberName = jsondata.classTimeArray_member_name;
            planMemberDbid = jsondata.classTimeArray_member_id;
            planScheduleIdArray = jsondata.scheduleIdArray;
            planNoteArray = jsondata.scheduleNoteArray;
            planScheduleFinishArray = jsondata.scheduleFinishArray;
            planColor = 'classTime';
            planfinished = ' classTime_checked';
            plancolor_ing_bg_cd = "#fbf3bd";
            plancolor_ing_font_cd = "#282828";
            plancolor_end_bg_cd = "#d2d1cf";
            plancolor_end_font_cd = "#282828";
            planMemberNum = '';
            planGroupid = '';
            planCode = '';
            break;
        case 'off':
            plan = option;
            planGroupid = '';
            planStartDate = jsondata.offTimeArray_start_date;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.offTimeArray_end_date;
            planScheduleIdArray = jsondata.offScheduleIdArray;
            planScheduleFinishArray = '';
            planNoteArray = jsondata.offScheduleNoteArray;
            planColor = 'offTime';
            plancolor_ing_bg_cd = "#eeeeee";
            plancolor_ing_font_cd = "#282828";
            plancolor_end_bg_cd = "#eeeeee";
            plancolor_end_font_cd = "282828";
            planMemberNum = '';
            planMemberDbid = '';
            planCode = '';
            break;
        case 'group':

            plan = option;
            planStartDate = jsondata.group_schedule_start_datetime;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.group_schedule_end_datetime;
            planMemberName = jsondata.group_schedule_group_name;
            planGroupid = jsondata.group_schedule_group_id;
            planScheduleIdArray = jsondata.group_schedule_id;
            planNoteArray = jsondata.group_schedule_note;
            planScheduleFinishArray = jsondata.group_schedule_finish_check;
            planColor = 'groupTime';
            planfinished = ' groupTime_checked';
            plancolor_ing_bg_cd = jsondata.group_schedule_ing_color_cd;
            plancolor_ing_font_cd = jsondata.group_schedule_ing_font_color_cd;
            plancolor_end_bg_cd = jsondata.group_schedule_end_color_cd;
            plancolor_end_font_cd = jsondata.group_schedule_end_font_color_cd;

            planMemberNum = jsondata.group_schedule_max_member_num;
            planMemberDbid = '';
            planCode = '';
            planGroupClassName = jsondata.group_schedule_group_type_cd_name;
            break;
    }

    //2018_4_22_8_30_2_OFF_10_30

    var planheight = 60*size;
    var len = planScheduleIdArray.length;
    var duplicated_samedate_sametime = 0;
    for(var i=0; i<len; i++){
        //2018-05-11 10:00:00
        var planDate_   = planStartDate[i].split(' ')[0];
        var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
        var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
        var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
        var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
        var planOriHour = planHour;
        var planMinute  = planStartDate[i].split(' ')[1].split(':')[1];
        var planOriMinute = planMinute;
        var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
        var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
        var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];
        var memberName = 'OFF';
        var hourType = '오전';
        if(plan == 'off'){
            if(planNoteArray[i].length > 0){
                memberName = planNoteArray[i];
            }else{
                memberName = 'OFF';
            }
        }else{
            memberName  = planMemberName[i];
        }

        //24:00일경우 다음날 00:00 으로 들어오기 때문에
        if(planEndDate[i].split(' ')[1] == "00:00:00"){
            planEndHour = '24';
            planEndMin = '00';
        }
        //24:00일경우 다음날 00:00 으로 들어오기 때문에

        //일정시작시간이 업무시작시간보다 작고, 종료시간은 업무 시작시간보다 큰 경우//
        var check_plan = 0;
        var temp_planHour = planHour;
        var temp_planMinute = planMinute;
        if(compare_time(planHour+':'+planMinute, Options.workStartTime+':00') == false && compare_time(planEndHour+':'+planEndMin, Options.workStartTime+':00') ){
            planHour = Options.workStartTime;
            planMinute = '00';
            check_plan = 1;
        }
        //일정시작시간이 업무시작시간보다 작고, 종료시간은 업무 시작시간보다 큰 경우//


        //일정시작시간이 업무시작시간보다 작고, 종료시간은 업무 종료시간보다 큰 경우//
        if(Options.workStartTime > planHour  && planEndHour >= Options.workEndTime ){
            planHour = Options.workStartTime;
            planMinute = '00';
        }
        //일정시작시간이 업무시작시간보다 작고, 종료시간은 업무 종료시간보다 큰 경우//

        var planDuraMin = calc_duration_by_start_end_2(planYear+'-'+planMonth+'-'+planDate, planHour+':'+planMinute, planEndDate[i].split(' ')[0], planEndHour+':'+planEndMin );
        var planDura = planDuraMin/60;

        if(planHour < 12){
            hourType = '오전';
        }else{
            if(planHour == 24){
                hourType = '오전';
            }else{
                hourType = '오후';
            }
        }


        var planArray = [planYear, planMonth, planDate, planHour, planMinute, planDura, memberName, planEndHour, planEndMin];
        var planArrayForTag = [planYear, planMonth, planDate, planOriHour, planOriMinute, planDura, memberName, planEndHour, planEndMin];
        var timeoffset = '00';
        if(planMinute>=30){
            timeoffset = '30';
        }
        var planStartArr = [planYear, planMonth, planDate, planHour, timeoffset];
        var planStart = planStartArr.join("_");
        var planStartDiv = $("#"+planStart);

        //var planStartDiv = $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+Options.workStartTime+'_00') //2018_8_5_0_00

        var tdPlanStart = $("#"+planStart+" div");
        var tdPlan = $("#"+planStart);
        tdPlan.parent('div').siblings('.fake_for_blankpage').css('display', 'none');

        var schedule_user_color = 'background-color:'+plancolor_ing_bg_cd[i]+';'+'color:'+plancolor_ing_font_cd[i]+';';
        var planColor_ = planColor+planfinished;
        var textcolor = "bluetext";
        var hideornot = 'hideelement';
        var finished_style;
        if(option == 'group'){
            if(planScheduleFinishArray[i] == 0){
                finished_style = "";
                schedule_user_color = 'background-color:'+plancolor_ing_bg_cd[i]+';'+'color:'+plancolor_ing_font_cd[i]+';';
            }else{
                schedule_user_color = 'background-color:'+plancolor_end_bg_cd[i]+';'+'color:'+plancolor_end_font_cd[i]+';';
                finished_style = "style='text-decoration:line-through;'";
            }
        }else if(option == "class"){
            if(planScheduleFinishArray[i] == 0){
                finished_style = "";
                schedule_user_color = 'background-color:'+plancolor_ing_bg_cd+';'+'color:'+plancolor_ing_font_cd+';';
            }else{
                schedule_user_color = 'background-color:'+plancolor_end_bg_cd+';'+'color:'+plancolor_end_font_cd+';';
                finished_style = "style='text-decoration:line-through;'";
            }
        }else if(option == 'off'){
            schedule_user_color = 'background-color:'+plancolor_ing_bg_cd+';'+'color:'+plancolor_ing_font_cd+';';
        }

        if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){
            textcolor = "bluetext";
        }else{
            textcolor = "";
        }

        var groupstatus;
        if(Number(planDura*planheight-1) < 29){
            hideornot = 'hideelement';
            groupstatus="";
        }else if(Number(planDura*planheight-1) < 47){
            hideornot = 'inlineelement';
            groupstatus="";
        }else{
            hideornot = 'inlineelement';
            groupstatus = '<span class="groupnumstatus '+textcolor+'">'+'('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span>';
        }

        var planLocation = Number(planArray[4])*size+1;
        if(timeoffset >=30){
            planLocation = Number(planArray[4])*size-30*size+1;
        }
        //var planHeight = Number(planDura*planheight-1);
        var planHeight = Number(planDura*planheight-3);

        //중복일정 ㅇㄷ
        var planWidth;
        var planLeft;
        var calc;
        var time_hide = "";
        if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]] != undefined){
            var exist_check = $(`div[data-plantime="${planStartDate[i]+' ~ '+planEndDate[i]}"]`).length;
            planWidth = (100/(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][exist_check][1])).toFixed(1);
            calc = duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][exist_check][0];
            planLeft = (calc)*100;

            if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][exist_check][1] > 1){
                time_hide = "style=visibility:hidden;";
                groupstatus="";
            }
        }
        //중복일정 ㅇㄷ

        //이미 설정한 일정이 업무종료 시간보다 넘어가서 끝날때 끝을 깔끔하게 업무종료시간에 맞춘다.

        //if(planStartDiv.length>0){
          //  var timLocation = planStartDiv.offset().top + planLocation;
            //var calBottomLoc = $('.swiper-slide-active').offset().top + $('.swiper-slide-active').height();
            //if(timLocation + planHeight > calBottomLoc){
              //  var planHeight = calBottomLoc - timLocation;
            //}
        //}
        //이미 설정한 일정이 업무종료 시간보다 넘어가서 끝날때 끝을 깔끔하게 업무종료시간에 맞춘다.

        // if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
        if(option == 'class' && jsondata.group_schedule_id.indexOf(jsondata.class_group_schedule_id[i]) == -1){
                if(planStartDiv.find('div['+'class-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                    if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
                    }else{
                        if(check_plan==1){
                            planHour = temp_planHour;
                            planMinute = temp_planMinute;

                        }
                        planStartDiv.append('<div'+
                                               // '" data-plancolor="'+plancolor_ing_bg_cd+
                                               ' data-scheduleid="'+planScheduleIdArray[i]+
                                               // '" data-starttime="'+planStartDate[i]+
                                               // '" data-endtime="'+planEndDate[i]+
                                               '" data-plantime="'+planStartDate[i]+' ~ '+planEndDate[i]+
                                               // '" data-groupid="'+planGroupid[i]+
                                               // '" data-membernum="'+planMemberNum[i]+
                                               // '" data-memo="'+planNoteArray[i]+
                                               //'" data-schedule-check="'+planScheduleFinishArray[i]+
                                               // '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                               // '" data-dbid="'+planMemberDbid[i]+
                                               // '" data-memberName="'+memberName+
                                               // '" class="'+planColor_+
                                               '" class="_class'+
                                               '" style="position:absolute;z-index:100;height:'+planHeight+'px;'+
                                                         'top:'+planLocation+'px;'+
                                                         schedule_user_color+
                                                         //중복일정 ㅇㄷ
                                                         //'left:'+planLeft+'%;'+
                                                         'transform:translateX('+planLeft+'%);'+
                                                         'width:'+planWidth+'%'+
                                               '">'+
                                                    '<span class="memberName '+hideornot+'">'+
                                                        '<p class="groupnametag" '+finished_style+'>'+planCode+memberName+'</p>'+
                                                    ' </span>'+
                                                    '<span class="memberTime '+hideornot+'" '+time_hide+'>'+
                                                        '<p class="hourType">' +hourType+'</p>' + time_format_add_ampm(planHour+':'+planMinute ,"none")+
                                                    '</span>'+

                                            '</div>'
                                            );
                    }
                }
        }else if(option == 'group'){
            if(planStartDiv.find('div['+'group-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
                }else{
                    if(check_plan==1){
                        planHour = temp_planHour;
                        planMinute = temp_planMinute;
                    }
                    planStartDiv.append('<div '+
                                           // '" data-plancolor="'+plancolor_ing_bg_cd[i]+
                                           ' data-scheduleid="'+planScheduleIdArray[i]+
                                           // '" data-starttime="'+planStartDate[i]+
                                           // '" data-endtime="'+planEndDate[i]+
                                           '" data-plantime="'+planStartDate[i]+' ~ '+planEndDate[i]+
                                           // '" data-groupid="'+planGroupid[i]+
                                           // '" data-current-membernum="'+jsondata.group_schedule_current_member_num[i]+
                                           // '" data-membernum="'+planMemberNum[i]+
                                           // '" data-memo="'+planNoteArray[i]+
                                           // '" data-schedule-check="'+planScheduleFinishArray[i]+
                                           // '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                           // '" data-dbid="'+planMemberDbid[i]+
                                           // '" data-memberName="'+memberName+
                                           // '" data-group-type-cd-name="'+planGroupClassName[i]+
                                           // '" class="'+planColor_+
                                           '" class="_group'+
                                           '" style="position:absolute;z-index:100;height:'+planHeight+'px;'+
                                                     'top:'+planLocation+'px;'+
                                                     schedule_user_color+
                                                     //중복일정 ㅇㄷ
                                                     //'left:'+planLeft+'%;'+
                                                     'transform:translateX('+planLeft+'%);'+
                                                     'width:'+planWidth+'%'+
                                           '">'+
                                                '<span class="memberName '+hideornot+'">'+
                                                        '<p class="groupnametag" '+finished_style+'>'+planCode+memberName+'</p>'+
                                                        groupstatus+
                                                '</span>'+
                                                '<span class="memberTime '+hideornot+'" '+time_hide+'>'+
                                                        '<p class="hourType">' +hourType+'</p>' + time_format_add_ampm(planHour+':'+planMinute ,"none")+
                                                '</span>'+

                                        '</div>'
                                        );
                }
            }
        }else if(option == 'off'){
            if(planStartDiv.find('div['+'off-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
                }else{
                    if(check_plan==1){
                        planHour = temp_planHour;
                        planMinute = temp_planMinute;
                    }
                    planStartDiv.append('<div '+
                                           // '" data-plancolor="'+plancolor_ing_bg_cd+
                                           ' data-scheduleid="'+planScheduleIdArray[i]+
                                           // '" data-starttime="'+planStartDate[i]+
                                           // '" data-endtime="'+planEndDate[i]+
                                           '" data-plantime="'+planStartDate[i]+' ~ '+planEndDate[i]+
                                           // '" data-groupid="'+planGroupid[i]+
                                           // '" data-membernum="'+planMemberNum[i]+
                                           // '" data-memo="'+planNoteArray[i]+
                                           // '" data-schedule-check="'+planScheduleFinishArray[i]+
                                           // '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                           // '" data-dbid="'+planMemberDbid[i]+
                                           // '" data-memberName="'+memberName+
                                           // '" class="'+planColor_+
                                           '" class="_off'+
                                           '" style="position:absolute;z-index:100;height:'+planHeight+'px;'+
                                                     'top:'+planLocation+'px;'+
                                                     schedule_user_color+
                                                     //중복일정 ㅇㄷ
                                                     //'left:'+planLeft+'%;'+
                                                     'transform:translateX('+planLeft+'%);'+
                                                     'width:'+planWidth+'%'+
                                           '">'+
                                                '<span class="memberName '+hideornot+'">'+
                                                    '<p class="groupnametag">'+planCode+memberName+'</p>'+
                                                ' </span>'+
                                                '<span class="memberTime '+hideornot+'" '+time_hide+'>'+
                                                    '<p class="hourType">' +hourType+'</p>' + time_format_add_ampm(planHour+':'+planMinute ,"none")+
                                                '</span>'+
                                        '</div>'
                                        );
                }
            }
        }


        // 미니 팝업 클릭 불가 영역인 _on 클래스를 달력에 추가하기 위한 작업

            var diffHour = planEndHour - planHour;  // 13:30 - 11:00  = 2/30    13:00 - 11:30 = 1/30
            var diffMin = planEndMin - planMinute;

            var diff = diff_time(planHour+':'+planMinute, planEndHour+':'+planEndMin);
            var lenn = Math.ceil(diff/30);

            if(Number(planEndMin) !=0 && Number(planEndMin)%30 && Number(planMinute) !=0 && Number(planMinute)%30){
                if(diff > 30){
                    if(planEndHour != planHour && planEndMin - planMinute <= 0 ){
                        if(planMinute < 30 && planEndMin < 30){
                            lenn = lenn + (planEndHour - planHour);
                        }else if(planMinute > 30 && planEndMin < 30){
                            lenn = lenn;
                        }else{
                            lenn = lenn + (planEndHour - planHour);
                        }
                    }else if(planEndHour != planHour && planEndMin - planMinute > 0 ){
                        lenn = lenn;
                    }
                }else if(diff <= 30){
                    if(planEndHour != planHour){
                        lenn = lenn + (planEndHour - planHour);
                    }else if(planEndHour == planHour ){
                        if(planEndMin - planMinute <= 0){
                            lenn = lenn + 1;
                        }else if(planEndMin - planMinute > 0){
                            if(planEndMin > 30 && planMinute < 30){
                                lenn = lenn + 1;
                            }else if(planEndMin > 30 && planMinute > 30){
                                lenn = lenn;
                            }else if(planEndMin < 30 && planMinute < 30){
                                lenn = lenn;
                            }
                        }
                    }
                }
            }


            var hhh = Number(planHour);
            var mmm;
            if(planMinute < 30){
                mmm = '00';
            }else{
                mmm = '30';
            }

            for(var j=0; j<lenn; j++){
                if(mmm == 60){
                    hhh = hhh+1;
                    mmm = '00';
                }
                $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm).addClass('_on');
                mmm = Number(mmm) + 30;
            }
        // 미니 팝업 클릭 불가 영역인 _on 클래스를 달력에 추가하기 위한 작업
    }
}

var exist_check_dic = {};
// function scheduleTime_Mobile(option, jsondata, size, duplicate_check){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
//     //중복일정 ㅇㄷ
//     //var duplicate_check = know_duplicated_plans(jsondata).result;
//     //중복일정 ㅇㄷ  
//     console.log("여기", schedule_data_cache)

//     var plan = '';
//     var planStartDate = '';
//     var planGroupStartDate = '';
//     var planEndDate = '';
//     var planMemberName = '';
//     var planScheduleIdArray = '';
//     var planNoteArray = '';
//     var planScheduleFinishArray = '';
//     var planColor = '';
//     var planfinished = '';
//     var planMemberNum = '';
//     var planMemberDbid = '';
//     var planGroupid = '';
//     var planCode = '';
//     var planGroupClassName = '';
//     var plancolor_ing_bg_cd = "";
//     var plancolor_ing_font_cd = "";
//     var plancolor_end_bg_cd = "";
//     var plancolor_end_font_cd = "";
//     switch(option){
//         case 'class':
//             plan = option;
//             planStartDate = jsondata.classTimeArray_start_date;
//             planGroupStartDate = jsondata.group_schedule_start_datetime;
//             planEndDate = jsondata.classTimeArray_end_date;
//             planMemberName = jsondata.classTimeArray_member_name;
//             planMemberDbid = jsondata.classTimeArray_member_id;
//             planScheduleIdArray = jsondata.scheduleIdArray;
//             planNoteArray = jsondata.scheduleNoteArray;
//             planScheduleFinishArray = jsondata.scheduleFinishArray;
//             planColor = 'classTime';
//             plancolor_ing_bg_cd = "#fbf3bd";
//             plancolor_ing_font_cd = "";
//             plancolor_end_bg_cd = "";
//             plancolor_end_font_cd = "";
//             planfinished = ' classTime_checked';
//             planMemberNum = '';
//             planGroupid = '';
//             planCode = '';
//             break;
//         case 'off':
//             plan = option;
//             planGroupid = '';
//             planStartDate = jsondata.offTimeArray_start_date;
//             planGroupStartDate = jsondata.group_schedule_start_datetime;
//             planEndDate = jsondata.offTimeArray_end_date;
//             planScheduleIdArray = jsondata.offScheduleIdArray;
//             planScheduleFinishArray = '';
//             planNoteArray = jsondata.offScheduleNoteArray;
//             planColor = 'offTime';
//             plancolor_ing_bg_cd = "#eeeeee";
//             plancolor_ing_font_cd = "";
//             plancolor_end_bg_cd = "";
//             plancolor_end_font_cd = "";
//             planMemberNum = '';
//             planMemberDbid = '';
//             planCode = '';
//             break;
//         case 'group':

//             plan = option;
//             planStartDate = jsondata.group_schedule_start_datetime;
//             planGroupStartDate = jsondata.group_schedule_start_datetime;
//             planEndDate = jsondata.group_schedule_end_datetime;
//             planMemberName = jsondata.group_schedule_group_name;
//             planGroupid = jsondata.group_schedule_group_id;
//             planScheduleIdArray = jsondata.group_schedule_id;
//             planNoteArray = jsondata.group_schedule_note;
//             planScheduleFinishArray = jsondata.group_schedule_finish_check;
//             planColor = 'groupTime';
//             planfinished = ' groupTime_checked';
//             plancolor_ing_bg_cd = jsondata.group_schedule_ing_color_cd;
//             plancolor_ing_font_cd = jsondata.group_schedule_ing_font_color_cd;
//             plancolor_end_bg_cd = jsondata.group_schedule_end_color_cd;
//             plancolor_end_font_cd = jsondata.group_schedule_end_font_color_cd;
//             planMemberNum = jsondata.group_schedule_max_member_num;
//             planMemberDbid = '';
//             planCode = '';
//             planGroupClassName = jsondata.group_schedule_group_type_cd_name;
//             break;
//     }

//     //2018_4_22_8_30_2_OFF_10_30

//     var planheight = 60*size;
//     var len = planScheduleIdArray.length;

//     var date_sorted = {};

//     for(var j=0; j<len; j++){
//         var planYYYY    = Number(planStartDate[j].split(' ')[0].split('-')[0]);
//         var planMM   = Number(planStartDate[j].split(' ')[0].split('-')[1]);
//         var planDD    = Number(planStartDate[j].split(' ')[0].split('-')[2]);
//         date_sorted[planYYYY+'_'+planMM+'_'+planDD] = [];
//     }

//     for(var i=0; i<len; i++){
//         //2018-05-11 10:00:00
//         var planDate_ = planStartDate[i].split(' ')[0];
//         var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
//         var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
//         var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
//         var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
//         var planOriHour = planHour;
//         var planMinute  = planStartDate[i].split(' ')[1].split(':')[1];
//         var planOriMinute = planMinute;
//         var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
//         var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
//         var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];
//         var memberName = 'OFF';
//         var planDura = "0.5";
//         var hourType = '오전';
//         if(plan == 'off'){
//             if(planNoteArray[i].length > 0){
//                 memberName = planNoteArray[i];
//             }else{
//                 memberName = 'OFF';
//             }
//         }else{
//             memberName  = planMemberName[i];
//         }

//         //24:00일경우 다음날 00:00 으로 들어오기 때문에
//         if(planEndDate[i].split(' ')[1] == "00:00:00"){
//             planEndHour = '24';
//             planEndMin = '00';
//         }
//         //24:00일경우 다음날 00:00 으로 들어오기 때문에


//         if(compare_time(add_time(planHour+':'+planMinute, '00:00'), add_time(Options.workStartTime+':00','00:00')) == false && compare_time(add_time(planEndHour+':'+planEndMin, '00:00'), add_time(Options.workStartTime+':00','00:00')) ){
//             planHour = Options.workStartTime;
//             planMinute = '00';
//         }

//         var planDuraMin = calc_duration_by_start_end_2(planStartDate[i].split(' ')[0], add_time(planHour+':'+planMinute,'00:00'), planEndDate[i].split(' ')[0], add_time(planEndHour+':'+planEndMin,'00:00') );
//         planDura = planDuraMin/60;


//         if(planHour < 12){
//             hourType = '오전';
//         }else{
//             if(planHour == 24){
//                 hourType = '오전';
//             }else{
//                 hourType = '오후';
//             }
//         }

//         var planArray = [planYear, planMonth, planDate, planHour, planMinute, planDura, memberName, planEndHour, planEndMin];
//         var planArrayForTag = [planYear, planMonth, planDate, planOriHour, planOriMinute, planDura, memberName, planEndHour, planEndMin];
//         var planStartArr = [planYear, planMonth, planDate];
//         var planStart = planStartArr.join("_");
//         //var tdPlanStart = $("#"+planStart+" div"); //2018_7_8
//         var tdPlan = $("#"+planStart);
//         //tdPlan.parent('div').siblings('.fake_for_blankpage').css('display','none');

//         var group_user_color = 'background-color:'+plancolor_ing_bg_cd[i]+';'+'color:'+plancolor_ing_font_cd[i]+';';
//         var planColor_ = planColor+planfinished;
//         var textcolor = "bluetext";
//         var hideornot = 'hideelement';
//         var finished_style;
//         if(option != 'off'){
//             if(planScheduleFinishArray[i] == 0){
//                 planColor_ = planColor;
//                 finished_style = "";
//             }else{
//                 planColor_ = planColor+planfinished;
//                 group_user_color = 'background-color:'+plancolor_end_bg_cd[i]+';'+'color:'+plancolor_end_font_cd[i]+';';
//                 finished_style = "style='text-decoration:line-through;'";
//             }
//         }else{
//             planColor_ = planColor;
//         }

//         if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){
//             textcolor = "bluetext";
//         }else{
//             textcolor = "";
//         }

//         var memberTimeHide;
//         var groupstatus;
//         if(Number(planDura*planheight-1) < 29){
//             hideornot = 'hideelement';
//             memberTimeHide = "hideelement";
//             groupstatus="";
//         }else if(Number(planDura*planheight-1) < 47){
//             hideornot = 'inlineelement';
//             memberTimeHide = "hideelement";
//             groupstatus="";
//             if(bodywidth>600){
//                 memberTimeHide = 'inlineelement';
//             }
//         }else{
//             hideornot = 'inlineelement';
//             memberTimeHide = "hideelement";
//             groupstatus = '<span class="groupnumstatus '+textcolor+'">'+'('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span>';
//             if(bodywidth>600){
//                 memberTimeHide = 'inlineelement';
//             }
//         }

//         //중복일정 ㅇㄷ
//         // var planWidth;
//         // var planLeft;
//         // if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]] != undefined){
//         //     // planWidth = 100/(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][1]);
//         //     // planLeft = (duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0])*100;
//         //     var exist_check = $(`div[data-starttime="${planStartDate[i]}"]`).length;
//         //     var regExp = /`data-starttime="${planStartDate[i]}"`/gi;
//         //     if(date_sorted[planStart].join(" ").match(`data-starttime="${planStartDate[i]}"`) != null){
//         //         exist_check = date_sorted[planStart].join(" ").match(`data-starttime="${planStartDate[i]}"`).length;
//         //     }

//         //     planWidth = (100/(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][1])).toFixed(1);
            
//         //     // if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][2] > 1){
//         //     //     if(exist_check == 0){
//         //     //         planLeft = (duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0])*100+(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0]- exist_check+1);
//         //     //     }else{
//         //     //         planLeft = (duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][2]-exist_check)*100+(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0]- exist_check+1);
//         //     //     }
//         //     // }else{
//         //     //     planLeft = (duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0])*100+(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0]- exist_check+1);
//         //     // }
//         //     var calc;
//         //     if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][2] > 1){
//         //         calc = duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0]- exist_check;
//         //     }else{
//         //         calc = duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0];
//         //     }
//         //     if(calc == -1){
//         //         calc = 0;
//         //     }
            
//         //     //planLeft = (calc)*100+(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0]- exist_check+1);
//         //     planLeft = (calc)*100;
//         //     if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][1] > 1){
//         //         groupstatus="";
//         //     }
//         // }
//         var planWidth;
//         var planLeft;
//         var calc;
//         var exist_check;
//         if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]] != undefined){
//             if(option == "class" && jsondata.group_schedule_id.indexOf(jsondata.class_group_schedule_id[i]) > 0){

                
//             }else{
//                 if(exist_check_dic[planStartDate[i]+' ~ '+planEndDate[i]] == undefined){
//                     exist_check_dic[planStartDate[i]+' ~ '+planEndDate[i]] = 0;
//                 }
//                 exist_check = exist_check_dic[planStartDate[i]+' ~ '+planEndDate[i]];
//                 if(exist_check < duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]].length){
//                     planWidth = (100/(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][exist_check][1])).toFixed(1);
//                     calc = duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][exist_check][0];
//                     planLeft = (calc)*100;

//                     if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][exist_check][1] > 1){
//                         groupstatus="";
//                     }
//                     exist_check_dic[planStartDate[i]+' ~ '+planEndDate[i]]++;
//                 }
//             }
//         }
//         //중복일정 ㅇㄷ


//         var planLocation = (60*(planHour-Options.workStartTime)+60*planMinute/60)*size;

//         var innerNameTag;
//         //if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
//         if(option == 'class' && jsondata.group_schedule_id.indexOf(jsondata.class_group_schedule_id[i]) == -1){
//             if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
//             }else{
//                 innerNameTag = '<span class="memberName '+hideornot+'">'+'<p class="groupnametag" '+finished_style+'>'+planCode+memberName+'</p>'+' </span>'+'<span class="memberTime '+memberTimeHide+'">'+ '<p class="hourType">' +hourType+'</p>' + time_format_add_ampm(planHour+':'+planMinute ,"none")+'</span>';
//                 planhtml = '<div class-time="'+planArrayForTag.join('_')+
//                             '" class-schedule-id="'+planScheduleIdArray[i]+
//                             '" data-plancolor="'+plancolor_ing_bg_cd+
//                             '" data-starttime="'+planStartDate[i]+
//                             '" data-plantime="'+planStartDate[i]+' ~ '+planEndDate[i]+
//                             '" data-groupid="'+planGroupid[i]+
//                             '" data-membernum="'+planMemberNum[i]+
//                             '" data-memo="'+planNoteArray[i]+
//                             '" data-schedule-check="'+planScheduleFinishArray[i]+
//                             '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
//                             '" data-dbid="'+planMemberDbid[i]+
//                             '" data-memberName="'+memberName+
//                             '" class="'+planColor_+
//                             '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+
//                                                     //'left:'+planLeft+'%;'+
//                                                     'transform:translateX('+planLeft+'%);'+
//                                                      'width:'+planWidth+'%'+
//                             '">'+
//                                 innerNameTag+
//                            '</div>';
//                 date_sorted[planStart].push(planhtml);
//             }
//         }else if(option == 'group'){
//             if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
//             }else{
//                 innerNameTag = '<span class="memberName '+hideornot+'">'+'<p class="groupnametag" '+finished_style+'>'+planCode+memberName+'</p>'+groupstatus+' </span>'+'<span class="memberTime '+memberTimeHide+'">'+ '<p class="hourType">' +hourType+'</p>' + time_format_add_ampm(planHour+':'+planMinute ,"none")+'</span>';
//                 planhtml = '<div group-time="'+planArrayForTag.join('_')+
//                             '" group-schedule-id="'+planScheduleIdArray[i]+
//                             '" data-plancolor="'+plancolor_ing_bg_cd[i]+
//                             '" data-starttime="'+planStartDate[i]+
//                             '" data-plantime="'+planStartDate[i]+' ~ '+planEndDate[i]+
//                             '" data-groupid="'+planGroupid[i]+
//                             '" data-current-membernum="'+jsondata.group_schedule_current_member_num[i]+
//                             '" data-membernum="'+planMemberNum[i]+
//                             '" data-memo="'+planNoteArray[i]+
//                             '" data-schedule-check="'+planScheduleFinishArray[i]+
//                             '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
//                             '" data-dbid="'+planMemberDbid[i]+
//                             '" data-memberName="'+memberName+
//                             '" data-group-type-cd-name="'+planGroupClassName[i]+
//                             '" class="'+planColor_+
//                             '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+group_user_color+
//                                                     //'left:'+planLeft+'%;'+
//                                                     'transform:translateX('+planLeft+'%);'+
//                                                      'width:'+planWidth+'%'+
//                             '">'+
//                                 innerNameTag+
//                            '</div>';
//                 date_sorted[planStart].push(planhtml);
//             }
//         }else if(option == 'off'){
//             if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
//             }else{
//                 innerNameTag = '<span class="memberName '+hideornot+'">'+'<p class="groupnametag">'+planCode+memberName+'</p>'+' </span>'+'<span class="memberTime '+memberTimeHide+'">'+ '<p class="hourType">' +hourType+'</p>' + time_format_add_ampm(planHour+':'+planMinute ,"none")+'</span>';
//                 planhtml = '<div off-time="'+planArrayForTag.join('_')+
//                             '" off-schedule-id="'+planScheduleIdArray[i]+
//                             '" data-plancolor="'+plancolor_ing_bg_cd+
//                             '" data-starttime="'+planStartDate[i]+
//                             '" data-plantime="'+planStartDate[i]+' ~ '+planEndDate[i]+
//                             '" data-groupid="'+planGroupid[i]+
//                             '" data-membernum="'+planMemberNum[i]+
//                             '" data-memo="'+planNoteArray[i]+
//                             '" data-schedule-check="'+planScheduleFinishArray[i]+
//                             '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
//                             '" data-dbid="'+planMemberDbid[i]+
//                             '" data-memberName="'+memberName+
//                             '" class="'+planColor_+
//                             '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+
//                                                     //'left:'+planLeft+'%;'+
//                                                     'transform:translateX('+planLeft+'%);'+
//                                                      'width:'+planWidth+'%'+
//                             '">'+
//                                 innerNameTag+
//                            '</div>';
//                 date_sorted[planStart].push(planhtml);
//             }
//         }

//         /*
//         var hhh = Number(planHour);
//         var mmm = planMinute;

//         for(var j=0; j<planDura/0.5; j++){
//             if(mmm == 60){
//                 hhh = hhh + 1;
//                 mmm = '00';
//             }
//             $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm).addClass('_on');
//             mmm = Number(mmm) + 30;
//         }
//         */
//     }

//     for(var date in date_sorted){
//         if( $('#'+date).find(`.${planColor}`).length == 0 ){
//             $('#'+date).append(date_sorted[date].join(''));
//         }
//     }
// }
function scheduleTime_Mobile(option, jsondata, size, duplicate_check){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
    //중복일정 ㅇㄷ
    //var duplicate_check = know_duplicated_plans(jsondata).result;
    //중복일정 ㅇㄷ

    var plan = '';
    var planStartDate = '';
    var planGroupStartDate = '';
    var planEndDate = '';
    var planMemberName = '';
    var planScheduleIdArray = '';
    var planNoteArray = '';
    var planScheduleFinishArray = '';
    var planColor = '';
    var planfinished = '';
    var planMemberNum = '';
    var planMemberDbid = '';
    var planGroupid = '';
    var planCode = '';
    var planGroupClassName = '';
    var plancolor_ing_bg_cd = "";
    var plancolor_ing_font_cd = "";
    var plancolor_end_bg_cd = "";
    var plancolor_end_font_cd = "";
    switch(option){
        case 'class':
            plan = option;
            planStartDate = jsondata.classTimeArray_start_date;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.classTimeArray_end_date;
            planMemberName = jsondata.classTimeArray_member_name;
            planMemberDbid = jsondata.classTimeArray_member_id;
            planScheduleIdArray = jsondata.scheduleIdArray;
            planNoteArray = jsondata.scheduleNoteArray;
            planScheduleFinishArray = jsondata.scheduleFinishArray;
            planColor = 'classTime';
            plancolor_ing_bg_cd = "#fbf3bd";
            plancolor_ing_font_cd = "#282828";
            plancolor_end_bg_cd = "#d2d1cf";
            plancolor_end_font_cd = "#282828";
            planfinished = ' classTime_checked';
            planMemberNum = '';
            planGroupid = '';
            planCode = '';
            break;
        case 'off':
            plan = option;
            planGroupid = '';
            planStartDate = jsondata.offTimeArray_start_date;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.offTimeArray_end_date;
            planScheduleIdArray = jsondata.offScheduleIdArray;
            planScheduleFinishArray = '';
            planNoteArray = jsondata.offScheduleNoteArray;
            planColor = 'offTime';
            plancolor_ing_bg_cd = "#eeeeee";
            plancolor_ing_font_cd = "#282828";
            plancolor_end_bg_cd = "#eeeeee";
            plancolor_end_font_cd = "#282828";
            planMemberNum = '';
            planMemberDbid = '';
            planCode = '';
            break;
        case 'group':

            plan = option;
            planStartDate = jsondata.group_schedule_start_datetime;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.group_schedule_end_datetime;
            planMemberName = jsondata.group_schedule_group_name;
            planGroupid = jsondata.group_schedule_group_id;
            planScheduleIdArray = jsondata.group_schedule_id;
            planNoteArray = jsondata.group_schedule_note;
            planScheduleFinishArray = jsondata.group_schedule_finish_check;
            planColor = 'groupTime';
            planfinished = ' groupTime_checked';
            plancolor_ing_bg_cd = jsondata.group_schedule_ing_color_cd;
            plancolor_ing_font_cd = jsondata.group_schedule_ing_font_color_cd;
            plancolor_end_bg_cd = jsondata.group_schedule_end_color_cd;
            plancolor_end_font_cd = jsondata.group_schedule_end_font_color_cd;
            planMemberNum = jsondata.group_schedule_max_member_num;
            planMemberDbid = '';
            planCode = '';
            planGroupClassName = jsondata.group_schedule_group_type_cd_name;
            break;
    }

    //2018_4_22_8_30_2_OFF_10_30

    var planheight = 60*size;
    var len = planScheduleIdArray.length;

    var date_sorted = {};

    for(var j=0; j<len; j++){
        var planYYYY    = Number(planStartDate[j].split(' ')[0].split('-')[0]);
        var planMM   = Number(planStartDate[j].split(' ')[0].split('-')[1]);
        var planDD    = Number(planStartDate[j].split(' ')[0].split('-')[2]);
        date_sorted[planYYYY+'_'+planMM+'_'+planDD] = [];
    }

    for(var i=0; i<len; i++){
        //2018-05-11 10:00:00
        var planDate_ = planStartDate[i].split(' ')[0];
        var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
        var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
        var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
        var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
        var planOriHour = planHour;
        var planMinute  = planStartDate[i].split(' ')[1].split(':')[1];
        var planOriMinute = planMinute;
        var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
        var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
        var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];
        var memberName = 'OFF';
        var planDura = "0.5";
        var hourType = '오전';
        if(plan == 'off'){
            if(planNoteArray[i].length > 0){
                memberName = planNoteArray[i];
            }else{
                memberName = 'OFF';
            }
        }else{
            memberName  = planMemberName[i];
        }

        //24:00일경우 다음날 00:00 으로 들어오기 때문에
        if(planEndDate[i].split(' ')[1] == "00:00:00"){
            planEndHour = '24';
            planEndMin = '00';
        }
        //24:00일경우 다음날 00:00 으로 들어오기 때문에


        if(compare_time(add_time(planHour+':'+planMinute, '00:00'), add_time(Options.workStartTime+':00','00:00')) == false && compare_time(add_time(planEndHour+':'+planEndMin, '00:00'), add_time(Options.workStartTime+':00','00:00')) ){
            planHour = Options.workStartTime;
            planMinute = '00';
        }

        var planDuraMin = calc_duration_by_start_end_2(planStartDate[i].split(' ')[0], add_time(planHour+':'+planMinute,'00:00'), planEndDate[i].split(' ')[0], add_time(planEndHour+':'+planEndMin,'00:00') );
        planDura = planDuraMin/60;


        if(planHour < 12){
            hourType = '오전';
        }else{
            if(planHour == 24){
                hourType = '오전';
            }else{
                hourType = '오후';
            }
        }

        var planArray = [planYear, planMonth, planDate, planHour, planMinute, planDura, memberName, planEndHour, planEndMin];
        var planArrayForTag = [planYear, planMonth, planDate, planOriHour, planOriMinute, planDura, memberName, planEndHour, planEndMin];
        var planStartArr = [planYear, planMonth, planDate];
        var planStart = planStartArr.join("_");
        //var tdPlanStart = $("#"+planStart+" div"); //2018_7_8
        var tdPlan = $("#"+planStart);
        //tdPlan.parent('div').siblings('.fake_for_blankpage').css('display','none');

        var schedule_user_color;
        var textcolor = "bluetext";
        var hideornot = 'hideelement';
        var finished_style;
        if(option == 'group'){
            if(planScheduleFinishArray[i] == 0){
                finished_style = "";
                schedule_user_color = 'background-color:'+plancolor_ing_bg_cd[i]+';'+'color:'+plancolor_ing_font_cd[i]+';';
            }else{
                schedule_user_color = 'background-color:'+plancolor_end_bg_cd[i]+';'+'color:'+plancolor_end_font_cd[i]+';';
                finished_style = "style='text-decoration:line-through;'";
            }
        }else if(option == "class"){
            if(planScheduleFinishArray[i] == 0){
                finished_style = "";
                schedule_user_color = 'background-color:'+plancolor_ing_bg_cd+';'+'color:'+plancolor_ing_font_cd+';';
            }else{
                schedule_user_color = 'background-color:'+plancolor_end_bg_cd+';'+'color:'+plancolor_end_font_cd+';';
                finished_style = "style='text-decoration:line-through;'";
            }
        }else if(option == 'off'){
            schedule_user_color = 'background-color:'+plancolor_ing_bg_cd+';'+'color:'+plancolor_ing_font_cd+';';
        }

        if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){
            textcolor = "bluetext";
        }else{
            textcolor = "";
        }

        var memberTimeHide;
        var groupstatus;
        if(Number(planDura*planheight-1) < 29){
            hideornot = 'hideelement';
            memberTimeHide = "hideelement";
            groupstatus="";
        }else if(Number(planDura*planheight-1) < 47){
            hideornot = 'inlineelement';
            memberTimeHide = "hideelement";
            groupstatus="";
            if(bodywidth>=600){
                memberTimeHide = 'inlineelement';
            }
        }else{
            hideornot = 'inlineelement';
            memberTimeHide = "hideelement";
            groupstatus = '<span class="groupnumstatus '+textcolor+'">'+'('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span>';
            if(bodywidth>=600){
                memberTimeHide = 'inlineelement';
            }
        }

        //중복일정 ㅇㄷ
        // var planWidth;
        // var planLeft;
        // if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]] != undefined){
        //     // planWidth = 100/(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][1]);
        //     // planLeft = (duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0])*100;
        //     var exist_check = $(`div[data-starttime="${planStartDate[i]}"]`).length;
        //     var regExp = /`data-starttime="${planStartDate[i]}"`/gi;
        //     if(date_sorted[planStart].join(" ").match(`data-starttime="${planStartDate[i]}"`) != null){
        //         exist_check = date_sorted[planStart].join(" ").match(`data-starttime="${planStartDate[i]}"`).length;
        //     }

        //     planWidth = (100/(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][1])).toFixed(1);
            
        //     // if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][2] > 1){
        //     //     if(exist_check == 0){
        //     //         planLeft = (duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0])*100+(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0]- exist_check+1);
        //     //     }else{
        //     //         planLeft = (duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][2]-exist_check)*100+(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0]- exist_check+1);
        //     //     }
        //     // }else{
        //     //     planLeft = (duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0])*100+(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0]- exist_check+1);
        //     // }
        //     var calc;
        //     if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][2] > 1){
        //         calc = duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0]- exist_check;
        //     }else{
        //         calc = duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0];
        //     }
        //     if(calc == -1){
        //         calc = 0;
        //     }
            
        //     //planLeft = (calc)*100+(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][0]- exist_check+1);
        //     planLeft = (calc)*100;
        //     if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][1] > 1){
        //         groupstatus="";
        //     }
        // }
        var planWidth;
        var planLeft;
        var calc;
        var exist_check;
        var time_hide = "";
        if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]] != undefined){
            if(option == "class" && jsondata.group_schedule_id.indexOf(jsondata.class_group_schedule_id[i]) >= 0){

            }else{
                if(exist_check_dic[planStartDate[i]+' ~ '+planEndDate[i]] == undefined){
                    exist_check_dic[planStartDate[i]+' ~ '+planEndDate[i]] = 0;
                }
                exist_check = exist_check_dic[planStartDate[i]+' ~ '+planEndDate[i]];
                if(exist_check < duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]].length){
                    planWidth = (100/(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][exist_check][1])).toFixed(1);
                    calc = duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][exist_check][0];
                    planLeft = (calc)*100;

                    if(duplicate_check[planStartDate[i]+' ~ '+planEndDate[i]][exist_check][1] > 1){
                        groupstatus="";
                        time_hide = "style=visibility:hidden;";
                    }
                    exist_check_dic[planStartDate[i]+' ~ '+planEndDate[i]]++;

                }
            }
        }
        //중복일정 ㅇㄷ


        var planLocation = (60*(planHour-Options.workStartTime)+60*planMinute/60)*size;

        var innerNameTag;
        //if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
        if(option == 'class' && jsondata.group_schedule_id.indexOf(jsondata.class_group_schedule_id[i]) == -1){
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                innerNameTag = '<span class="memberName '+hideornot+'">'+'<p class="groupnametag" '+finished_style+'>'+planCode+memberName+'</p>'+' </span>'+'<span class="memberTime '+memberTimeHide+'" '+time_hide+'>'+ '<p class="hourType">' +hourType+'</p>' + time_format_add_ampm(planHour+':'+planMinute ,"none")+'</span>';
                planhtml = '<div'+
                            ' data-scheduleid="'+planScheduleIdArray[i]+
                            '" style="position:absolute;z-index:150;height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+schedule_user_color+
                                                    //'left:'+planLeft+'%;'+
                                                    'transform:translateX('+planLeft+'%);'+
                                                     'width:'+planWidth+'%'+
                            '" class="_class">'+
                                innerNameTag+
                           '</div>';
                date_sorted[planStart].push(planhtml);
            }
        }else if(option == 'group'){
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                innerNameTag = '<span class="memberName '+hideornot+'">'+'<p class="groupnametag" '+finished_style+'>'+planCode+memberName+'</p>'+groupstatus+' </span>'+'<span class="memberTime '+memberTimeHide+'" '+time_hide+'>'+ '<p class="hourType">' +hourType+'</p>' + time_format_add_ampm(planHour+':'+planMinute ,"none")+'</span>';
                planhtml = '<div'+
                            ' data-scheduleid="'+planScheduleIdArray[i]+
                            '" style="position:absolute;z-index:150;height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+schedule_user_color+
                                                    //'left:'+planLeft+'%;'+
                                                    'transform:translateX('+planLeft+'%);'+
                                                     'width:'+planWidth+'%'+
                            '" class="_group">'+
                                innerNameTag+
                           '</div>';
                date_sorted[planStart].push(planhtml);
            }
        }else if(option == 'off'){
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                innerNameTag = '<span class="memberName '+hideornot+'">'+'<p class="groupnametag">'+planCode+memberName+'</p>'+' </span>'+'<span class="memberTime '+memberTimeHide+'" '+time_hide+'>'+ '<p class="hourType">' +hourType+'</p>' + time_format_add_ampm(planHour+':'+planMinute ,"none")+'</span>';
                planhtml = '<div'+
                            ' data-scheduleid="'+planScheduleIdArray[i]+
                            '" style="position:absolute;z-index:150;height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+schedule_user_color+
                                                    //'left:'+planLeft+'%;'+
                                                    'transform:translateX('+planLeft+'%);'+
                                                     'width:'+planWidth+'%'+
                            '" class="_off">'+
                                innerNameTag+
                           '</div>';
                date_sorted[planStart].push(planhtml);
            }
        }

        /*
        var hhh = Number(planHour);
        var mmm = planMinute;

        for(var j=0; j<planDura/0.5; j++){
            if(mmm == 60){
                hhh = hhh + 1;
                mmm = '00';
            }
            $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm).addClass('_on');
            mmm = Number(mmm) + 30;
        }
        */
    }

    for(var date in date_sorted){
        if( $('#'+date).find(`.${planColor}`).length == 0 ){
            $('#'+date).append(date_sorted[date].join(''));
        }
    }
}


function schedule_jsondata_to_dict(jsondata){
    var len1 = jsondata.scheduleIdArray.length;
    var result = {"class":{}, "group":{}, "off":{}};
    for(var j=0; j<len1; j++){
        result["class"][jsondata.scheduleIdArray[j]] = {};
        // result["group"][jsondata.group_schedule_id[j]] = {};
        // result["off"][jsondata.offScheduleIdArray[j]] = {};
        result["class"][jsondata.scheduleIdArray[j]]["lecture_id"] = jsondata.classArray_lecture_id[j];
        result["class"][jsondata.scheduleIdArray[j]]["member_id"] = jsondata.classTimeArray_member_id[j];
        result["class"][jsondata.scheduleIdArray[j]]["member_name"] = jsondata.classTimeArray_member_name[j];
        result["class"][jsondata.scheduleIdArray[j]]["start_date"] = jsondata.classTimeArray_start_date[j];
        result["class"][jsondata.scheduleIdArray[j]]["end_date"] = jsondata.classTimeArray_end_date[j];
        result["class"][jsondata.scheduleIdArray[j]]["class_group_schedule_id"] = jsondata.class_group_schedule_id[j];
        result["class"][jsondata.scheduleIdArray[j]]["finished"] = jsondata.scheduleFinishArray[j];
        result["class"][jsondata.scheduleIdArray[j]]["memo"] = jsondata.scheduleNoteArray[j];
        result["class"][jsondata.scheduleIdArray[j]]["permission"] = jsondata.schedulePermissionStateArray[j];
        result["class"][jsondata.scheduleIdArray[j]]["idx"] = jsondata.scheduleIdxArray[j];
    }

    var len2 = jsondata.group_schedule_id.length;
    for(var g=0; g<len2; g++){
        result["group"][jsondata.group_schedule_id[g]] = {};
        result["group"][jsondata.group_schedule_id[g]]["group_id"] = jsondata.group_schedule_group_id[g];
        result["group"][jsondata.group_schedule_id[g]]["group_name"] = jsondata.group_schedule_group_name[g];
        result["group"][jsondata.group_schedule_id[g]]["start_date"] = jsondata.group_schedule_start_datetime[g];
        result["group"][jsondata.group_schedule_id[g]]["end_date"] = jsondata.group_schedule_end_datetime[g];
        result["group"][jsondata.group_schedule_id[g]]["type_cd_name"] = jsondata.group_schedule_group_type_cd_name[g];
        result["group"][jsondata.group_schedule_id[g]]["current_member_num"] = jsondata.group_schedule_current_member_num[g];
        result["group"][jsondata.group_schedule_id[g]]["max_member_num"] = jsondata.group_schedule_max_member_num[g];
        result["group"][jsondata.group_schedule_id[g]]["memo"] = jsondata.group_schedule_note[g];
        result["group"][jsondata.group_schedule_id[g]]["finished"] = jsondata.group_schedule_finish_check[g];
        result["group"][jsondata.group_schedule_id[g]]["ing_color"] = jsondata.group_schedule_ing_color_cd[g];
        result["group"][jsondata.group_schedule_id[g]]["ing_color_font"] = jsondata.group_schedule_ing_font_color_cd[g];
        result["group"][jsondata.group_schedule_id[g]]["end_color"] = jsondata.group_schedule_end_color_cd[g];
        result["group"][jsondata.group_schedule_id[g]]["end_color_font"] = jsondata.group_schedule_end_font_color_cd[g];
    }

    var len3 = jsondata.offScheduleIdArray.length;
    for(var f=0; f<len3; f++){
        result["off"][jsondata.offScheduleIdArray[f]] = {};
        result["off"][jsondata.offScheduleIdArray[f]]["start_date"] = jsondata.offTimeArray_start_date[f];
        result["off"][jsondata.offScheduleIdArray[f]]["end_date"] = jsondata.offTimeArray_end_date[f];
        result["off"][jsondata.offScheduleIdArray[f]]["memo"] = jsondata.offScheduleNoteArray[f];
    }

    // console.log("result", result);
    return result;
}

//중복일정 계산하기
// function know_duplicated_plans(jsondata){
//     var testArray_start = jsondata.group_schedule_start_datetime.concat(jsondata.offTimeArray_start_date);
//     var testArray_end = jsondata.group_schedule_end_datetime.concat(jsondata.offTimeArray_end_date);
//     var classlen = jsondata.classTimeArray_start_date.length;
//     for(var i=0; i<classlen; i++){
//         if(jsondata.group_schedule_id.indexOf(jsondata.class_group_schedule_id[i]) == -1 ){
//             testArray_start.push(jsondata.classTimeArray_start_date[i]);
//             testArray_end.push(jsondata.classTimeArray_end_date[i]);    
//         }
//     }


//     var duplicate_num = [];
//     var duplicate_dic = {};

//     //console.log("testArray_start",testArray_start)

//     var len1 = testArray_start.length;
//     var len2 = testArray_end.length;
//     for(var i=0; i<len1; i++){
//         var plan = testArray_start[i].split(' ');
//         var date = plan[0];
//         var time = plan[1];
//         var endplan = testArray_end[i].split(' ');
//         var enddate = endplan[0];
//         var endtime = endplan[1];
//         var duplicated = 0;

//         duplicate_dic[testArray_start[i]+' ~ '+testArray_end[i]] = [];

//         for(var j=0; j<len1; j++){
//             var plan_c = testArray_start[j].split(' ');
//             var date_c = plan_c[0];
//             var time_c = plan_c[1];
//             var endplan_c = testArray_end[j].split(' ');
//             var enddate_c = endplan_c[0];
//             var endtime_c = endplan_c[1];
//             if(date_c == date){
//                 //겹치는 걸 센다.
//                 if( compare_time(time_c, time) && compare_time(endtime, endtime_c)  ){  //비교대상 시간이 비교시간안에 쏙 들어갈때
//                     duplicate_dic[testArray_start[i]+' ~ '+testArray_end[i]].push(testArray_start[j]+' ~ '+testArray_end[j]);
//                     duplicated++;
//                 }else if( compare_time(time, time_c) == false && compare_time(endtime, time_c)  ){ //비교 대상 시간의 시작시간이 비교시간안에 들어가 있을때
//                     duplicate_dic[testArray_start[i]+' ~ '+testArray_end[i]].push(testArray_start[j]+' ~ '+testArray_end[j]);
//                     duplicated++;
//                 }else if( compare_time(endtime_c, time) && compare_time(endtime_c, endtime) == false ){ //비교 대상 시간의 종료시간이 비교 시간 안에 들어가 있을때
//                     duplicate_dic[testArray_start[i]+' ~ '+testArray_end[i]].push(testArray_start[j]+' ~ '+testArray_end[j]);
//                     duplicated++;
//                 }else if( compare_time(time_c, time) == false && compare_time(endtime, endtime_c) == false ){ //비교 대상 시간이 비교시간을 완전히 감쌀때
//                     duplicate_dic[testArray_start[i]+' ~ '+testArray_end[i]].push(testArray_start[j]+' ~ '+testArray_end[j]);
//                     duplicated++;
//                 }else if(time == time_c && endtime == endtime_c){ //비교 대상 시간이 똑같을 때
//                     duplicate_dic[testArray_start[i]+' ~ '+testArray_end[i]].push(testArray_start[j]+' ~ '+testArray_end[j]);
//                     duplicated++;
//                 }
//             }
//         }
//         duplicate_num.push(duplicated);
//     }
//     // for(var plan_o in duplicate_dic){
//     //     var planlength = duplicate_dic[plan_o].length;
//     //     for(var plans in duplicate_dic){
//     //         if(duplicate_dic[plans].indexOf(plan_o) >= 0 && planlength < duplicate_dic[plans].length ){
//     //             // delete duplicate_dic[plan_o];
//     //         }
//     //     }
//     // }

//     for(var plan_oo in duplicate_dic){
//         var length = duplicate_dic[plan_oo].length;
//         for(var planss in duplicate_dic){
//             if(duplicate_dic[planss].indexOf(plan_oo) >=0){
//                 for(var t=0; t<length; t++){
//                     if(duplicate_dic[planss].indexOf(duplicate_dic[plan_oo][t]) == -1){
//                         duplicate_dic[planss].push(duplicate_dic[plan_oo][t]);
//                     }
//                 }
//             }
//         }
//     }


//     var result = {};
//     for(var plan_ in duplicate_dic){
//         var len = duplicate_dic[plan_].length;
//         var array_sorted = duplicate_dic[plan_].sort();
//         var array_sorted_split = array_sorted.join(' ~ ').split(' ~ ');
//         for(var i=0; i<len; i++){
//             result[array_sorted[i]] = [i, len, array_element_count(array_sorted, array_sorted[i])];
//         }
//     }
//     console.log("duplicate_dic",duplicate_dic);
//     console.log("result", result)
//     return {"num":duplicate_num, "dic":duplicate_dic, "result":result};
// }

function know_duplicated_plans(jsondata){
    // 1:1 일정 / 그룹 일정 / OFF 일정 합치기
    var testArray_start = jsondata.group_schedule_start_datetime.concat(jsondata.offTimeArray_start_date);
    var testArray_end = jsondata.group_schedule_end_datetime.concat(jsondata.offTimeArray_end_date);
    var classlen = jsondata.classTimeArray_start_date.length;
    for(var i=0; i<classlen; i++){
        if(jsondata.group_schedule_id.indexOf(jsondata.class_group_schedule_id[i]) == -1 ){
            testArray_start.push(jsondata.classTimeArray_start_date[i]);
            testArray_end.push(jsondata.classTimeArray_end_date[i]);
        }
    }

    var duplicate_num = [];
    var duplicate_dic = {};

    //중복일정을 큰 덩어리로 가져오기
    var clear_result = clear_duplicated_date_time(jsondata, "");
    schedule_data_cleared_duplicates_cache = clear_result;

    var clear_start_date = clear_result.clear_start_array;
    var clear_end_date = clear_result.clear_end_array;

    var len1 = clear_start_date.length;
    var len2 = testArray_start.length;

    for(var i=0; i<len1; i++){

        var duplicated = 0;

        var plan = clear_start_date[i].split(' ');
        var date = plan[0];
        var time = plan[1];

        // 종료 날짜 / 시각
        var endplan = clear_end_date[i].split(' ');
        var enddate = endplan[0];
        var endtime = endplan[1];

        duplicate_dic[clear_start_date[i]+' ~ '+clear_end_date[i]] = [];

        // 중복 검사
        for(var j=0; j<len2; j++){

            // 시작 날짜 / 시각
            var plan_c = testArray_start[j].split(' ');
            var date_c = plan_c[0];
            var time_c = plan_c[1];

            // 종료 날짜 / 시각
            var endplan_c = testArray_end[j].split(' ');
            var enddate_c = endplan_c[0];
            var endtime_c = endplan_c[1];

            // ~ 24:00:00 일정 처리
            if(endtime_c == "00:00:00"){
                // 날짜 하루 빼기 수정(사용 x) - hkkim 20190108
                enddate_c = date_c;
                endtime_c = "24:00:00";
            }
            // 같은 날짜인 경우
           if(date_c == date){
                //겹치는 걸 센다.
                var duplication_type = know_whether_plans_has_duplicates(time, endtime, time_c, endtime_c);
                if(duplication_type > 0) { //겹칠때
                    // duplicate_dic[clear_start_date[i]+' ~ '+clear_end_date[i]].push(testArray_start[j]+' ~ ' + enddate_c + ' ' + endtime_c);
                    duplicate_dic[clear_start_date[i]+' ~ '+clear_end_date[i]].push(testArray_start[j]+' ~ '+testArray_end[j]);
                    duplicated++;
                }
            }
        }
        duplicate_num.push(duplicated);
    }
    var result = {};

    //겹치지 않는 합쳐진 일정
    for(var plan_ in duplicate_dic){
        var temp_index = [];
        var temp_celldivide;

        // 겹치는 일정 sorting
        var array_sorted = duplicate_dic[plan_].sort();

        for(var t=0; t<array_sorted.length; t++){
            // console.log("temp_index", temp_index)
            // 기본값 셋팅
            var ref = array_sorted[t];
            if(t == 0){
                temp_index[t] = 0; //가장 첫번째 값은 항상 왼쪽 첫번째로 고정 위치
                continue;
            }
            var check_duplication = false;
            // 비교 대상 확인
            for(var r=0; r<array_sorted.length; r++){
                var comp = array_sorted[r];
                if(t == r){
                    break;
                }

                var ref_start_time = ref.split(' ~ ')[0].split(' ')[1];
                var ref_end_time = ref.split(' ~ ')[1].split(' ')[1];
                var comp_start_time = comp.split(' ~ ')[0].split(' ')[1];
                var comp_end_time = comp.split(' ~ ')[1].split(' ')[1];

                if(ref_end_time == "00:00:00"){
                    ref_end_time = "24:00:00";
                }
                if(comp_end_time == "00:00:00"){
                    comp_end_time = "24:00:00";
                }
                var duplication_type = know_whether_plans_has_duplicates(ref_start_time, ref_end_time,
                                                                         comp_start_time, comp_end_time);

                if(duplication_type > 0){ //겹칠때
                    check_duplication = true;
                }else{ //겹치지 않을때
                    // 지금 비교 조건에서는 겹치지 않았지만 정말 들어갈수 있는지 전체 array에서 검사
                    //이 인덱스(위치)와 같은 값을 갖는 다른 시간대가 있는지 검사
                    var howmany = array_element_count(temp_index, temp_index[r]);
                    var index_move = 0;
                    var check_ = 0;
                    //같은 위치에 있는 일정들 검사 (같은 위치지만 시간이 다르면 겹치지 않을 수 있으므로)
                    for(var z=0; z<howmany; z++){
                        var index_loc = temp_index.indexOf(temp_index[r], index_move);
                        index_move = index_loc+1;

                        if(t != index_loc){

                            var ref_start_time = array_sorted[t].split(' ~ ')[0].split(' ')[1];
                            var ref_end_time = array_sorted[t].split(' ~ ')[1].split(' ')[1];
                            var comp_start_time = array_sorted[index_loc].split(' ~ ')[0].split(' ')[1];
                            var comp_end_time = array_sorted[index_loc].split(' ~ ')[1].split(' ')[1];

                            if(ref_end_time == "00:00:00"){
                                ref_end_time = "24:00:00";
                            }
                            if(comp_end_time == "00:00:00"){
                                comp_end_time = "24:00:00";
                            }
                            var duplication_type_ = know_whether_plans_has_duplicates(ref_start_time, ref_end_time,
                                                                                      comp_start_time, comp_end_time);
                            if(duplication_type_ > 0){
                                check_++;
                            }else{
                                continue;
                            }
                        }
                    }
                    if(check_ > 0){ //겹치는게 존재
                        check_duplication = true;
                    }else{ //겹치는게 없음
                        temp_index[t] = temp_index[r];
                        break;
                    }
                }

                if(check_duplication == true){
                    var temp_array = [];
                    for(var i=0; i<=r; i++){
                        temp_array.push(temp_index[i]);
                    }
                    temp_index[t] = Math.max.apply(null, temp_array)+1;
                }
            }

        }

        temp_celldivide = Math.max.apply(null, temp_index) +1;

        for(var z=0; z<array_sorted.length; z++){
            result[array_sorted[z]] = [];
        }

        for(var v=0; v<array_sorted.length; v++){
            result[array_sorted[v]].push([temp_index[v], temp_celldivide]);
        }
    }

    // console.log("duplicate_dic",duplicate_dic);
    // console.log("result", result)
    // console.log({"num":duplicate_num, "dic":duplicate_dic, "result":result});

    return {"num":duplicate_num, "dic":duplicate_dic, "result":result};
}
//중복일정 계산하기


//월간 일정 ㅇㄷ
//월간 일정 ㅇㄷ
var clicked_td_date_info;
var schedule_on_off = 0;


$('.popup_inner_month').scroll(function(e){
    e.stopPropagation();
    var scrollHeight = $(this).prop('scrollHeight');
    var popupHeight = $(this).height();
    var scrollLocation = $(this).scrollTop();

    if(popupHeight + scrollLocation == scrollHeight){
        $(this).animate({scrollTop : scrollLocation-1}, 10);
    }else if(popupHeight + scrollLocation == popupHeight){
        $(this).animate({scrollTop : scrollLocation+1}, 10);
    }

    // 좌측 스크롤 애로우 보이기
    if(popupHeight + scrollLocation < scrollHeight-30){
        $('.scroll_arrow_bottom').css('visibility', 'visible');
    }else{
        $('.scroll_arrow_bottom').css('visibility', 'hidden');
    }
    if(scrollLocation > 30){
        $('.scroll_arrow_top').css('visibility', 'visible');
    }else{
        $('.scroll_arrow_top').css('visibility', 'hidden');
    }
    //좌측 스크롤 애로우 보이기
});

//드랍다운리스트에서 위 화살표를 누르면 리스트의 맨위로 이동한다.
$(document).on('click', 'img.scroll_arrow_top', function(e){
    e.stopPropagation();
    var $thisul = $('.popup_inner_month');
    var $thisul_scroll_height = $thisul.prop('scrollHeight');
    var $thisul_display_height = $thisul.height();
    if($(this).css('visibility') == 'visible'){
        $thisul.animate({scrollTop: 0}, 200);
    }
});
//드랍다운리스트에서 위 화살표를 누르면 리스트의 맨위로 이동한다.
//드랍다운리스트에서 아래 화살표를 누르면 리스트의 맨아래로 이동한다.
$(document).on('click', 'img.scroll_arrow_bottom', function(e){
    e.stopPropagation();
    var $thisul = $('.popup_inner_month');
    var $thisul_scroll_height = $thisul.prop('scrollHeight');
    var $thisul_display_height = $thisul.height();
    if($(this).css('visibility') == 'visible'){
        $thisul.animate({scrollTop: $thisul_scroll_height + $thisul_display_height}, 200);
    }
});
//드랍다운리스트에서 아래 화살표를 누르면 리스트의 맨아래로 이동한다.


//여기서부터 월간 달력 만들기 코드////////////////////////////////////////////////////////////////////////////////////////////////

//초기실행코드 month_calendar(today_YY_MM_DD);
//초기실행코드 $('.swiper-slide-active').css('width', $('#calendar').width());


function classDatesTrainer(jsondata){
    $('._classTime').html('');
    var planInfo = classInfoProcessed(jsondata);
    var dateResult = planInfo.dateResult;
    var countResult = planInfo.countResult;
    var len = planInfo.dateResult.length;
    for(var i=0; i<len; i++){
        var planDate_ = dateResult[i];
        var yy = dateResult[i].split('-')[0];
        var mm = dateResult[i].split('-')[1];
        var dd = dateResult[i].split('-')[2];
        var omm = String(oriMonth);
        var odd = String(oriDate);
        if(omm.length==1){
            var omm = '0'+oriMonth;
        }
        if(odd.length==1){
            var odd='0'+oriDate;
        }
        var dateTarget = yy+'_'+Number(mm)+'_'+Number(dd);
        if(yy+mm+dd < oriYear+omm+odd){  // 지난 일정은 회색으로, 앞으로 일정은 핑크색으로 표기
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                $("td[data-date="+dateTarget+"]").attr('schedule-id', jsondata.scheduleIdArray[i]);
                $("td[data-date="+dateTarget+"] div._classTime").addClass('balloon_trainer').html('<img src="/static/user/res/icon-cal-mini.png">'+countResult[i])
                $("td[data-date="+dateTarget+"] div._classDate").addClass('greydateMytime');
            }
        }else{
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                $("td[data-date="+dateTarget+"]").attr('schedule-id', jsondata.scheduleIdArray[i]);
                $("td[data-date="+dateTarget+"] div._classTime").addClass('blackballoon_trainer').html('<img src="/static/user/res/icon-cal-mini.png">'+countResult[i])
                $("td[data-date="+dateTarget+"] div._classDate").addClass('dateMytime');
            }
        }
    }
}

function classInfoProcessed(jsondata){
    var len = jsondata.scheduleIdArray.length;
    var len2 = jsondata.group_schedule_id.length;
    var countResult = [];
    var summaryArray = {};
    var summaryArray_group = {};
    var summaryArrayResult = [];

    var datasum = [];
    for(var i=0; i<len; i++){ //개인일정 객체화로 중복 제거
        summaryArray[jsondata.classTimeArray_start_date[i].split(' ')[0]] = jsondata.classTimeArray_start_date[i].split(' ')[0];
        if(jsondata.group_schedule_start_datetime.indexOf(jsondata.classTimeArray_start_date[i]) == -1){
            datasum.push(jsondata.classTimeArray_start_date[i].split(' ')[0]);
        }else{

        }
    }
    for(var i in summaryArray){ //개인일정 중복 제거된 배열
        summaryArrayResult.push(i);
    }


    for(var i=0; i<len2; i++){ //그룹 객체화로 중복 제거
        summaryArray_group[jsondata.group_schedule_start_datetime[i].split(' ')[0]] = jsondata.group_schedule_start_datetime[i].split(' ')[0]
        datasum.push(jsondata.group_schedule_start_datetime[i].split(' ')[0]);
    }
    for(var i in summaryArray_group){ //그룹 중복 제거된 배열
        summaryArrayResult.push(i);
    }


    var len2 = summaryArrayResult.length;

    for(var i=0; i<len2; i++){
        var scan = summaryArrayResult[i];
        countResult[i]=0;
        for(var j=0; j<datasum.length; j++){
            if(scan == datasum[j]){
                countResult[i] = countResult[i]+1;
            }
        }
    }

    return {"countResult":countResult, "dateResult":summaryArrayResult};
}

function plancheck(dateinfo, jsondata){ // //2017_11_21_21_00_1_김선겸_22_00 //dateinfo = 2017_11_5
    var len1 = jsondata.scheduleIdArray.length;
    var len2 = jsondata.group_schedule_id.length;
    var dateplans = [];
    // var groupmaxarray = []

    for(var i=0; i<len2; i++){  //시간순 정렬을 위해 'group' 정보를 가공하여 dateplans에 넣는다.
        var grouptype = "group";
        var dbID = '';
        var group_id = jsondata.group_schedule_group_id[i];
        var scheduleID = jsondata.group_schedule_id[i];
        var classLectureID = '';
        var scheduleFinish = jsondata.group_schedule_finish_check[i];
        var memoArray = jsondata.group_schedule_note[i];
        var yy = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[0];
        var mm = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[1];
        var dd = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[2];
        var stime1 = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[0];
        var etime1 = jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[0];
        var sminute = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[1];
        var eminute = jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[1];
        var groupmax = jsondata.group_schedule_max_member_num[i];
        var groupcurrent = jsondata.group_schedule_current_member_num[i];
        var groupParticipants = '(' + groupcurrent + '/' + groupmax + ')';
        var name = jsondata.group_schedule_group_name[i];
        var group_type_cd_name = jsondata.group_schedule_group_type_cd_name[i];
        if(stime1.length<2){
            var stime1 = '0'+stime1;
        }else if(stime1 == '24'){
            var stime1 = '00';
        }
        var stime = stime1+'_'+sminute;
        var etime = etime1+'_'+eminute;
        var ymd = yy+'_'+Number(mm)+'_'+Number(dd);
        if(ymd == dateinfo){
            dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_'+dbID+'_'+grouptype+'_'+group_id+'_'+group_type_cd_name+'_'+groupmax+'_'+groupcurrent+'_/'+memoArray)
            // groupmaxarray.push(groupmax)
        }
    }

    for(var i=0; i<len1; i++){  //시간순 정렬을 위해 'class' 정보를 가공하여 dateplans에 넣는다.
        var grouptype = "class";
        var dbID = jsondata.classTimeArray_member_id[i];
        var group_id = '';
        var scheduleID = jsondata.scheduleIdArray[i];
        var classLectureID = jsondata.classArray_lecture_id[i];
        var scheduleFinish = jsondata.scheduleFinishArray[i];
        var memoArray = jsondata.scheduleNoteArray[i];
        var yy = jsondata.classTimeArray_start_date[i].split(' ')[0].split('-')[0];
        var mm = jsondata.classTimeArray_start_date[i].split(' ')[0].split('-')[1];
        var dd = jsondata.classTimeArray_start_date[i].split(' ')[0].split('-')[2];
        var stime1 = jsondata.classTimeArray_start_date[i].split(' ')[1].split(':')[0];
        var etime1 = jsondata.classTimeArray_end_date[i].split(' ')[1].split(':')[0];
        var sminute = jsondata.classTimeArray_start_date[i].split(' ')[1].split(':')[1];
        var eminute = jsondata.classTimeArray_end_date[i].split(' ')[1].split(':')[1];
        var group_type_cd_name = '';
        if(stime1.length<2){
            var stime1 = '0'+stime1;
        }else if(stime1 == '24'){
            var stime1 = '00';
        }
        var stime = stime1+'_'+sminute;
        var etime = etime1+'_'+eminute;
        // var name = '[1:1 레슨]'+jsondata.classTimeArray_member_name[i]
        var name = ''+jsondata.classTimeArray_member_name[i];
        var ymd = yy+'_'+Number(mm)+'_'+Number(dd);
        if(ymd == dateinfo && jsondata.group_schedule_start_datetime.indexOf(jsondata.classTimeArray_start_date[i]) == -1){
            groupmax = 1;
            groupcurrent = 1;
            dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_'+dbID+'_'+grouptype+'_'+group_id+'_'+group_type_cd_name+'_'+groupmax+'_'+groupcurrent+'_/'+memoArray)
        }
    }


    dateplans.sort();
    var htmltojoin = [];
    if(dateplans.length>0){
        for(var i=1; i<=dateplans.length; i++){
            var splited = dateplans[i-1].split('_');
            var stime = Number(splited[0]);
            var sminute = splited[1];
            var etime = Number(splited[2]);
            var eminute = splited[3];
            var groupmaxnum = splited[15];
            var groupcurrent = splited[16];
            if(splited[12] == "group"){
                name = '['+splited[14]+'] ' + splited[4] + '('+groupcurrent+'/'+groupmaxnum+')';
            }else{
                name = splited[4];
            }
            // var groupo_type_cd_name = '';
            var textsize = "";

            if(name.length > 12 ){
                textsize = 'style="font-size:11.5px"';
            }else if(name.length > 9){
                textsize = 'style="font-size:12px"';
            }

            var morningday = "";
            if(stime==0 & dateplans[i-2]==undefined){
                var morningday = "오전";
            }else if(stime<12 & dateplans[i-2]==undefined){
                var morningday = "오전";
            }else if(stime>=12 && dateplans[i-2]!=undefined){
                var splitedprev = dateplans[i-2].split('_');
                if(splitedprev[0]<12){
                    var morningday = "오후";
                }
            }else if(stime>=12 && dateplans[i-2]==undefined){
                var morningday = "오후";
            }
            if(splited[10]==1){
                htmltojoin.push('<div class="plan_raw" title="완료 된 일정" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-group-type-cd-name="'+splited[14]+'" data-currentmembernum="'+groupcurrent+'" data-membernum="'+groupmaxnum+'" data-dbid="'+splited[11]+'" data-scheduleid="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'">'+
                                    '<div class="plancheckmorningday">'+morningday+'</div>'+
                                    '<div class="planchecktime">'+time_format_add_ampm(stime+':'+sminute, "none")+' - '+time_format_add_ampm(etime+':'+eminute, "none")+'</div>'+
                                    '<div class="plancheckname"><img src="/static/user/res/btn-pt-complete.png">'+'<p '+textsize+'>'+name+'</p></div>'+
                                '</div>');

            }else if(splited[10] == 0){
                htmltojoin.push('<div class="plan_raw" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-group-type-cd-name="'+splited[14]+'" data-currentmembernum="'+groupcurrent+'" data-membernum="'+groupmaxnum+'" data-dbid="'+splited[11]+'" data-scheduleid="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'">'+
                                    '<div class="plancheckmorningday">'+morningday+'</div>'+
                                    '<div class="planchecktime">'+time_format_add_ampm(stime+':'+sminute, "none")+' - '+time_format_add_ampm(etime+':'+eminute, "none")+'</div>'+
                                    '<div class="plancheckname"><p '+textsize+'>'+name+'</p></div>'+
                                '</div>');
            }
        }
    }else{
        htmltojoin.push('<div class="plan_raw_blank">등록된 일정이 없습니다.</div>');

    }
    htmltojoin.push('<div class="plan_raw_blank plan_raw_add" data-date="'+dateinfo+'"><img src="/static/user/res/floatbtn/btn-plus.png" style="width:20px;cursor:pointer;"></div>')


    $('#cal_popup_plancheck .popup_inner_month').html(htmltojoin.join(''));
}

function month_calendar(referencedate){
    $('#calendar').addClass('_calmonth');
    var page1 = $('.swiper-slide:nth-of-type(1)');
    var page2 = $('.swiper-slide:nth-of-type(2)');
    var page3 = $('.swiper-slide:nth-of-type(3)');

    page1.html('');
    page2.html('');
    page3.html('');

    var year = Number(referencedate.split('-')[0]);
    var month = Number(referencedate.split('-')[1]);
    calTable_Set_Month(1, year, month-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
    calTable_Set_Month(2, year, month);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
    calTable_Set_Month(3, year, month+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기

    monthText(); //상단에 연, 월 표시
    krHoliday_month(); //대한민국 공휴일
    //draw_time_graph(Options.hourunit,'')
    ajaxClassTime();
}

function calTable_Set_Month(Index, Year, Month){ //선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
    if(Month>12){
        var Month = Month-12;
        var Year = Year+1;
    }else if(Month<1){
        var Month = Month+12;
        var Year = Year-1;
    }

    var $targetHTML = $('.swiper-slide:nth-child('+Index+')');

    var htmltojoin = [];
    for(var i=1; i<=6; i++){
        var child = '<table id="week'+i+Year+Month+'child" class="calendar-style"><tbody><tr></tr></tbody></table>';
        htmltojoin.push('<div id="week'+i+'_'+Year+'_'+Month+'" class="container-fluid week-style">'+child+'</div>');
    };

    $targetHTML.html(htmltojoin.join(''));

    calendarSetting(Year, Month);
    //if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null){
       $('.swiper-slide').css('height', "auto");
    //}
}; //calTable_Set


function calendarSetting(Year, Month){ //캘린더 테이블에 연월에 맞게 날짜 채우기
    var currentPageFirstDayInfo = new Date(Year, Month-1, 1); //현재달의 1일에 대한 연월일시간등 전체 정보
    var firstDayCurrentPage = currentPageFirstDayInfo.getDay(); //현재달 1일의 요일

    if( (Year % 4 == 0 && Year % 100 != 0) || Year % 400 == 0 ){  //윤년
        lastDay[1] = 29;
    }else{
        lastDay[1] = 28;
    }


    //1. 현재달에 전달 마지막 부분 채우기
    if(Month>1){ //2~12월
        for(var j=lastDay[Month-2]-firstDayCurrentPage+1; j<=lastDay[Month-2]; j++){
            $('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates" data-date='+Year+'_'+(Month-1)+'_'+j+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
        };
    }else if(Month==1){ //1월
        for(var j=31-firstDayCurrentPage+1; j<=31; j++){
            $('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates" data-date='+(Year-1)+'_'+(Month+11)+'_'+j+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
        };
    }

    //2. 첫번째 주 채우기
    for(var i=1; i<=7-firstDayCurrentPage; i++){
        if(i==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표시하기
            $('#week1'+Year+Month+'child tbody tr').append('<td data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'<span class="today">TODAY</span>'+'</td>');
        }else{
            $('#week1'+Year+Month+'child tbody tr').append('<td data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
        }
    };

    //3.현재달에 두번째 주부터 나머지 모두 채우기
    var lastOfweek1 = Number($('#week1'+Year+Month+'child td:last-child span:nth-child(2)').text());
    for(var i=lastOfweek1+1; i<=lastOfweek1+7; i++){
        for(var j=0;j<=4;j++){
            if(Number(i+j*7)==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표기
                $('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td data-date='+Year+'_'+Month+'_'+Number(i+j*7) +'>'+'<span class="holidayName"></span>'+'<span>'+Number(i+j*7)+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'<span class="today">TODAY</span>'+'</td>')
            }else if(Number(i+j*7<=lastDay[Month-1])){ //둘째주부터 날짜 모두
                $('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td data-date='+Year+'_'+Month+'_'+Number(i+j*7)+'>'+'<span class="holidayName"></span>'+'<span>'+Number(i+j*7)+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
            }
        }
    };

    //4. 현재달 마지막에 다음달 첫주 채우기
    var howmanyWeek6 = $('#week6'+'_'+Year+'_'+Month+' td').length;
    var howmanyWeek5 = $('#week5'+'_'+Year+'_'+Month+' td').length;

    if(howmanyWeek5<=7 && howmanyWeek6==0){
        for (var i=1; i<=7-howmanyWeek5; i++){
            if(Month<12){
                $('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates" data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
            }else if(Month==12){
                $('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates" data-date='+(Year+1)+'_'+(Month-11)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
            }
        };
        ad_month($('#week6'+Year+Month+'child tbody tr')) //2017.11.08추가 달력이 5주일때, 비어있는 6주차에 광고 입력
    }else if(howmanyWeek6<7 && howmanyWeek6>0){
        for (var i=1; i<=7-howmanyWeek6; i++){
            if(Month<12){
                $('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates" data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
            }else if(Month==12){
                $('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates" data-date='+(Year+1)+'_'+(Month-11)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
            }
        };
    }
    for(i=1; i<=6; i++){
        $('#week'+i+Year+Month+'child td:first-child').addClass('tdsunday'); //일요일 날짜는 Red 표기
        $('#week'+i+Year+Month+'child td:last-child').addClass('tdsaturday'); //토요일 날짜는 Blue 표기
    }
}; //calendarSetting()


function krHoliday_month(){ //대한민국 공휴일 날짜를 빨간색으로 표시
    for(var i=0; i<krHolidayList.length; i++){
        $("td[data-date="+krHolidayList[i]+"]").addClass('holiday');
        $("td[data-date="+krHolidayList[i]+"]").find('.holidayName').text(krHolidayNameList[i]);
    };
};

function monthText(){
    var currentYMD = $('.swiper-slide:nth-child(2) div:nth-child(1)').attr('id');
    //currentYMD 형식  ex : week120177
    var textYear = currentYMD.split('_')[1];
    var textMonth = currentYMD.split('_')[2]; //7
    $('#yearText, #ymdText-pc-year').text(textYear+'년').attr({'data-year':textYear, 'data-month':textMonth});
    $('#monthText, #ymdText-pc-month').text(textMonth+'월');
    todayFinderArrow_month(textYear, textMonth);
};

function draw_time_graph(option, type){  //type = '' and mini
    if(type == 'mini'){
        var targetHTML =  $('#timeGraph.ptaddbox_mini table');
        var types = "_mini";
    }else{
        var targetHTML =  $('#timeGraph._NORMAL_ADD_timegraph table');
        var types = '';
    }

    var tr1 = [];
    var tr2 = [];

    if(option == "30"){
        for(var i=Options.workStartTime; i<Options.workEndTime; i++){
            tr1[i] = '<td colspan="2">'+(i)+'</td>';
            tr2[i] = '<td id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00"></td><td id="'+(i)+'g_30'+types+'" class="tdgraph_'+option+' tdgraph30"></td>'
        }
    }else if(option == "60"){
        for(var i=Options.workStartTime; i<Options.workEndTime; i++){
            tr1[i] = '<td>'+(i)+'</td>';
            tr2[i] = '<td id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00"></td>';
        }
    }
    var tbody = '<tbody><tr>'+tr1.join('')+'</tr><tr>'+tr2.join('')+'</tbody>';
    targetHTML.html(tbody);
}

function todayFinderArrow_month(Year, Month){
    var currentYY = String(oriYear);
    var pageYY = String(Year);
    var currentMM = String(oriMonth);
    var pageMM = String(Month);
    if(currentMM.length<2){
        var currentMM = '0'+currentMM;
    }
    if(pageMM.length<2){
        var pageMM = '0'+pageMM;
    }
    var todayInfo = currentYY + currentMM;
    var pageInfo = pageYY + pageMM;

    if(todayInfo<pageInfo){
        $('._pinkarrowafter').addClass('setunVisible');
        $('._pinkarrowbefore').removeClass('setunVisible');
        $("#ymdText").removeClass('todayindi').addClass('nottodayindi');
    }else if(todayInfo>pageInfo){
        $('._pinkarrowafter').removeClass('setunVisible');
        $('._pinkarrowbefore').addClass('setunVisible');
        $("#ymdText").removeClass('todayindi').addClass('nottodayindi');
    }else{
        $('._pinkarrowbefore, ._pinkarrowafter').addClass('setunVisible');
        $("#ymdText").addClass('todayindi').removeClass('nottodayindi');
    }
}

function ad_month(selector){ // 월간 달력 하단에 광고
    selector.html('<img src="/static/user/res/PTERS_logo.jpg" alt="logo" class="admonth">').css({'text-align':'center'});
}
