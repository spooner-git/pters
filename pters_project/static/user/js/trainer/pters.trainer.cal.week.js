/*jshint esversion: 6 */ 
/*달력 만들기

 1. 각달의 일수를 리스트로 만들어 둔다.
 [31,28,31,30,31,30,31,31,30,31,30,31]
 2. 4년마다 2월 윤달(29일)
 year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
 3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

 */
$(document).ready(function(){
    $('#uptext').text("주간 일정");

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

    function send_push(push_server_id, intance_id, title, message, badge_counter){

        $.ajax({
            url: 'https://fcm.googleapis.com/fcm/send',
            type : 'POST',
            contentType : 'application/json',
            dataType: 'json',
            headers : {
                Authorization : 'key=' + push_server_id
            },
            data: JSON.stringify({
                "to": intance_id,
                "notification": {
                    "title":title,
                    "body":message,
                    "badge":badge_counter,
                    "sound": "default"
                }
            }),

            beforeSend:function(){
                console.log('test_ajax');

            },

            success:function(response){
                console.log(response);
            },

            complete:function(){

            },

            error:function(){
                //alert("Server Error: \nSorry for inconvenience. \nPTERS server is unstable now.")
                console.log(push_server_id);
                console.log(intance_id);
                console.log('server error');
            }
        });
    }


    var date = new Date();
    var currentYear = date.getFullYear(); //현재 년도
    var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
    var currentDate = date.getDate(); //오늘 날짜
    var currentDay = date.getDay(); // 0,1,2,3,4,5,6,7
    var currentHour = date.getHours();
    var currentMinute = date.getMinutes();

    var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31];      //각 달의 일수
    if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
        lastDay[1] = 29;
    }else{
        lastDay[1] = 28;
    }

    var weekDay = ['일','월','화','수','목','금','토'];
    var firstDayInfoPrevMonth = new Date(currentYear,currentMonth-1,1);
    var firstDayPrevMonth = firstDayInfoPrevMonth.getDay(); //전달 1일의 요일
    var firstDayInfoNextMonth = new Date(currentYear,currentMonth+1,1);
    var firstDayNextMonth = firstDayInfoNextMonth.getDay(); //다음달 1일의 요일
    var currentPageMonth = currentMonth+1; //현재 달

    var $calendarWidth = $('#calendar').width(); //현재 달력 넓이계산 --> classTime과 offTime 크기조정을 위해

// ############################구동시 실행################################################################################
// ****************************구동시 실행********************************************************************************
    
    /*
    if(bodywidth > 600){
        //week_calendar(today_YY_MM_DD)
        
    }else if(bodywidth<=600){        
        //week_calendar_mobile(today_YY_MM_DD)
    }
    */

    //위 코드를 구동을 원하는 html의 script내에 복사



// ****************************구동시 실행********************************************************************************
// ############################구동시 실행################################################################################

    //다음페이지로 슬라이드 했을때 액션
    myswiper.on('onSlideNextEnd',function(){
        closeAddPopup_mini();
        slideControl.append();
        weekNum_Set_fixed();
        toDay();
        addcurrentTimeIndicator_blackbox();
        dateText();
        reserveAvailable();
        todayFinderArrow();
        //krHoliday();

    });

    //이전페이지로 슬라이드 했을때 액션
    myswiper.on('onSlidePrevEnd',function(){
        closeAddPopup_mini();
        slideControl.prepend();
        weekNum_Set_fixed();
        toDay();
        addcurrentTimeIndicator_blackbox();
        dateText();
        reserveAvailable();
        todayFinderArrow();
        //krHoliday();

    });




    //페이지 이동에 대한 액션 클래스
    var slideControl = {
        'append' : function(){ //다음페이지로 넘겼을때
            var selector_swiper_slide_last_child = $('.swiper-slide:last-child');
            var lastdateinfo = selector_swiper_slide_last_child.find('.td00').attr('id').split('_');
            var last = Number(selector_swiper_slide_last_child.attr('id').replace(/slide/gi,""));
            var lastYY = Number(lastdateinfo[0]);
            var lastMM = Number(lastdateinfo[1]);
            var lastDD = Number(lastdateinfo[2]);
            myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
            myswiper.appendSlide('<div class="swiper-slide" id="slide'+(last+1)+'"></div>'); //마지막 슬라이드에 새슬라이드 추가
            if(bodywidth > 600){
                if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null){
                    calTable_Set_Mobile(last+1,lastYY,lastMM,lastDD,7,0); //새로 추가되는 슬라이드에 달력 채우기
                    if($('#hidetoggle').attr('data-type') == '1'){
                        $('.td00, .td30').css({'background':'unset',
                                              'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                              'background-size':'60px '+ ($('.hour').height()+1)+'px'});
                    }
                }else{
                    calTable_Set(last+1,lastYY,lastMM,lastDD,7,0); //새로 추가되는 슬라이드에 달력 채우기
                    if($('#hidetoggle').attr('data-type') == '1'){
                        $('.td00, .td30').css({'background':'unset',
                                           'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                            'background-size':'60px '+$('.td00').height()+'px'});
                    }
                }
            }else if(bodywidth<=600){
                calTable_Set_Mobile(last+1,lastYY,lastMM,lastDD,7,0); //새로 추가되는 슬라이드에 달력 채우기
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
            var first = Number(selector_swiper_slide_first_child.attr('id').replace(/slide/gi,""));
            var firstYY = Number(firstdateinfo[0]);
            var firstMM = Number(firstdateinfo[1]);
            var firstDD = Number(firstdateinfo[2]);
            myswiper.removeSlide(4);
            myswiper.prependSlide('<div class="swiper-slide" id="slide'+(first-1)+'"></div>'); //맨앞에 새슬라이드 추가
            if(bodywidth > 600){
                if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null){
                    calTable_Set_Mobile(first-1,firstYY,firstMM,firstDD,-7,0);
                    if($('#hidetoggle').attr('data-type') == '1'){
                        $('.td00, .td30').css({'background':'unset',
                                              'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                              'background-size':'60px '+ ($('.hour').height()+1)+'px'});
                    }
                }else{
                    calTable_Set(first-1,firstYY,firstMM,firstDD,-7,0);
                    if($('#hidetoggle').attr('data-type') == '1'){
                        $('.td00, .td30').css({'background':'unset',
                                           'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                            'background-size':'60px '+$('.td00').height()+'px'});
                    }
                }
                
            }else if(bodywidth<=600){
                calTable_Set_Mobile(first-1,firstYY,firstMM,firstDD,-7,0);
                if($('#hidetoggle').attr('data-type') == '1'){
                    $('.td00, .td30').css({'background':'unset',
                                          'background-image':'url("/static/user/res/calendar_hour_day2.png")',
                                          'background-size':'60px '+ ($('.hour').height()+1)+'px'});
                }
            }
            
            ajaxClassTime();
        }
    };

});//document(ready)



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
    var page1 = $('.swiper-slide:nth-of-type(1)');
    var page2 = $('.swiper-slide:nth-of-type(2)');
    var page3 = $('.swiper-slide:nth-of-type(3)');

    var page1_id_num = $('.swiper-slide:nth-of-type(1)').attr('id').replace(/slide/gi,'');
    var page2_id_num = $('.swiper-slide:nth-of-type(2)').attr('id').replace(/slide/gi,'');
    var page3_id_num = $('.swiper-slide:nth-of-type(3)').attr('id').replace(/slide/gi,'');

    page1.html('');
    page2.html('');
    page3.html('');

    var year = Number(referencedate.split('-')[0]);
    var month = Number(referencedate.split('-')[1]);
    var date = Number(referencedate.split('-')[2]);
    //calTable_Set(1,year,month,currentDate,-14); // 이번주-2
    calTable_Set(page1_id_num,year,month,date,-7); // 이번주-1
    calTable_Set(page2_id_num,year,month,date,0); // 이번주
    calTable_Set(page3_id_num,year,month,date,7); // 이번주+1
    //calTable_Set(5,year,month,currentDate,14); // 이번주+2

    $('.swiper-slide-active').css('width',$('#week').width());
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
    $('div.timeindex').css('height','auto');

    var page1 = $('.swiper-slide:nth-of-type(1)');
    var page2 = $('.swiper-slide:nth-of-type(2)');
    var page3 = $('.swiper-slide:nth-of-type(3)');

    var page1_id_num = $('.swiper-slide:nth-of-type(1)').attr('id').replace(/slide/gi,'');
    var page2_id_num = $('.swiper-slide:nth-of-type(2)').attr('id').replace(/slide/gi,'');
    var page3_id_num = $('.swiper-slide:nth-of-type(3)').attr('id').replace(/slide/gi,'');

    page1.html('');
    page2.html('');
    page3.html('');

    var year = Number(referencedate.split('-')[0]);
    var month = Number(referencedate.split('-')[1]);
    var date = Number(referencedate.split('-')[2]);
    calTable_Set_Mobile(page1_id_num,year,month,date,-7); // 이번주-1
    calTable_Set_Mobile(page2_id_num,year,month,date,0); // 이번주
    calTable_Set_Mobile(page3_id_num,year,month,date,7); // 이번주+1

    $('.swiper-slide-active').css('width',$('#week').width());
    weekNum_Set_fixed();
    dateText();
    //krHoliday();
    reserveAvailable();
    toDay();
    addcurrentTimeIndicator_blackbox();
    todayFinderArrow();
    ajaxClassTime();
}


function calTable_Set(Index,Year,Month,Dates,Week,append){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성
    //Week 선택자 2E, 1E, 0W, 1L, 2L
    //주간달력 상단표시줄 (요일, 날짜, Today표식)

    //weekTable(Index)
    var W = Week;
    var slideIndex = $('#slide'+Index);
    var currentDates = Number(Dates)+W;
    var dateinfo = new Date(Year,Month-1,currentDates);
    var currentDay_ = dateinfo.getDay();
    var monthdata = currentMonth;

    if(append==0){

        currentDay = 0;
        //var dataforappend = $('.swiper-slide-prev').find('.td00').attr('id').split('_')
        var currentSlideNum = Number($('.swiper-slide-active').attr('id').replace(/slide/gi,''));
        var dataforappend = $('#slide'+(currentSlideNum)).find('.td00').attr('id').split('_');

        // var monthforappend = Number(dataforappend[1])-1;
        monthdata = Number(dataforappend[1])-1;
    }
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

                    if(currentDates+z>lastDay[monthdata] && Month+1>12){ //해가 넘어갈때
                        if( (Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[monthdata]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        td2[z]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0 && Month==1){
                        if( (Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        td2[z]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z>lastDay[monthdata]){
                        if( Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[monthdata]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        td2[z]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=lastDay[monthdata] && currentDates+z>0){
                        if( Year+'_'+Month+'_'+(currentDates+z) == today_date){todaywide="todaywide";}else{todaywide = "";}
                        td1[z]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        td2[z]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                    }else if(currentDates+z<=0){
                        if(Month-1<1){
                            if( (Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                            td1[z]='<div'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                            td2[z]='<div'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        }else{
                            if( Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[monthdata-1]) == today_date){todaywide="todaywide";}else{todaywide = "";}
                            td1[z]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[monthdata-1])+'_'+i+'_'+'00'+' class="td00 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                            td2[z]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[monthdata-1])+'_'+i+'_'+'30'+' class="td30 '+todaywide+worktime_disabling+'" data-week='+z+'>'+'<div></div>'+'</div>';
                        }
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
            $('.time-row').css('border-bottom','0');
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

function calTable_Set_Mobile(Index,Year,Month,Dates,Week,append){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성
    //Week 선택자 2E, 1E, 0W, 1L, 2L
    //주간달력 상단표시줄 (요일, 날짜, Today표식)

    //weekTable(Index)

    var W = Week;
    var slideIndex = $('#slide'+Index);
    var currentDates = Number(Dates)+W;
    var dateinfo = new Date(Year,Month-1,currentDates);
    var currentDay_ = dateinfo.getDay();
    var monthdata = currentMonth;

    if(append==0){

        currentDay = 0;
        //var dataforappend = $('.swiper-slide-prev').find('.td00').attr('id').split('_')
        var currentSlideNum = Number($('.swiper-slide-active').attr('id').replace(/slide/gi,''));
        var dataforappend = $('#slide'+(currentSlideNum)).find('.td00').attr('id').split('_');

        // var monthforappend = Number(dataforappend[1])-1;
        monthdata = Number(dataforappend[1])-1;
    }
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
    var td_style = ' style="background:#f7f7f7;background-size:60px 60px;background-image:url(/static/user/res/calendar_hour.png);cursor:default" ';

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
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;



                if(currentDates+z>lastDay[monthdata] && Month+1>12){ //해가 넘어갈때
                    td1[z]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[monthdata])+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[monthdata]){
                    td1[z]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[monthdata])+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[monthdata] && currentDates+z>0){
                    td1[z]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    if(Month-1<1){
                        td1[z]='<div'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                    }else{
                        td1[z]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[monthdata-1])+' class="td00"'+td_style+' data-week='+z+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
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
                                          </div>`
                workend_disabling = `<div style="position:absolute;
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`

                if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                    td1[z+1]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+1)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+1]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+1)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[currentMonth]){
                    td1[z+1]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+1)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                    td1[z+1]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+1)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    td1[z+1]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+' class="td00"'+td_style+' data-week='+(z+1)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
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
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;

                if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                    td1[z+2]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+2)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+2]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+2)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[currentMonth]){
                    td1[z+2]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+2)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                    td1[z+2]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+2)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    td1[z+2]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+' class="td00"'+td_style+' data-week='+(z+2)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
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
                    time_disable_end = endtime
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
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;

                if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                    td1[z+3]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+3)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+3]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+3)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[currentMonth]){
                    td1[z+3]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+3)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                    td1[z+3]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+3)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    td1[z+3]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+' class="td00"'+td_style+' data-week='+(z+3)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
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
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;

                if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                    td1[z+4]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+4)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+4]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+4)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[currentMonth]){
                    td1[z+4]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+4)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                    td1[z+4]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+4)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    td1[z+4]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+' class="td00"'+td_style+' data-week='+(z+4)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
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
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;

                if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                    td1[z+5]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+5)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+5]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+5)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[currentMonth]){
                    td1[z+5]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+5)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                    td1[z+5]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+5)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    td1[z+5]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+' class="td00"'+td_style+' data-week='+(z+5)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
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
                                                      top:${$(`#hour${time_disable_end}`).position().top + $(`#hour${time_disable_end}`).height() }px;
                                                      width:100%;
                                                      height:${ hour_lastcell.position().top- $(`#hour${time_disable_end}`).position().top  }px;
                                                      opacity:0.8;" 
                                                      class="worktime_disable">
                                          </div>`;

                if(currentDates+z>lastDay[currentMonth] && Month+1>12){
                    td1[z+6]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+6)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0 && Month==1){
                    td1[z+6]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+' class="td00"'+td_style+' data-week='+(z+6)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z>lastDay[currentMonth]){
                    td1[z+6]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+' class="td00"'+td_style+' data-week='+(z+6)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
                    td1[z+6]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+' class="td00"'+td_style+' data-week='+(z+6)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
                }else if(currentDates+z<=0){
                    td1[z+6]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+' class="td00"'+td_style+' data-week='+(z+6)+'>'+'<div class="blankbox"></div>'+workstart_disabling+workend_disabling+'</div>';
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
    
    $('.swiper-slide').css('height',$('div.timeindex').height());
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
        if(i<12 && i == work_startTime){
            timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="morningtext">'+morning+'</span><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
        }else if(i==12){
            timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="morningtext">'+afternoon+'</span><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
        }else{
            timelist.push('<div class="hour" id="hour'+i+'" style="height:'+size*60+'px;"><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
        }
    }
    $('div.timeindex').html(timelist.join(''));
}

function dateText(){
    var yymm = {};
    var yymmarry = [];
    /*
    for(var i=2; i<=8; i++){
        var dataID = $('.swiper-slide-active div:nth-child(1)').find('.td00:nth-child('+i+')').attr('id').split('_');
        var yy = dataID[0];
        var mm = dataID[1];
        yymm[yy+'_'+mm] = 'data';
    }
    for(i in yymm){
        yymmarry.push(i);
    }*/

    yymmarry = [$('#weekNum_1').attr('data-date'), $('#weekNum_7').attr('data-date')];
    //연도, 월 셋팅
    if(yymmarry.length>1){  // [2017_12, 2018_1] ,,  [2018_1, 2018_2]
        /*
        var yymm1 = yymmarry[0].split('_');
        var yymm2 = yymmarry[1].split('_');
        var yy1 = yymm1[0];
        var mm1 = yymm1[1];
        var yy2 = yymm2[0];
        var mm2 = yymm2[1];
        */

        var yy1 = yymmarry[0].substr(0,4);
        var mm1 = Number(yymmarry[0].substr(4,2));
        var yy2 = yymmarry[1].substr(0,4);
        var mm2 = Number(yymmarry[1].substr(4,2));


        if(yy1==yy2){
            if(mm1 == mm2){
                $('#yearText').text(yy1+'년');
                $('#monthText').text(mm1+'월');
            }else{
                $('#yearText').text(yy1+'년');
                $('#monthText').text(mm1+'/'+mm2+'월');
            }
            $('#ymdText-pc-month-start').text(mm1+'월');
            $('#ymdText-pc-month-end').text(mm2+'월');
        }else if(yy1!=yy2){
            $('#yearText').text(yy1+'/'+yy2+'년');
            $('#monthText').text(mm1+'/'+mm2+'월');
            $('#ymdText-pc-month-start').text(mm1+'월');
            $('#ymdText-pc-month-end').text(mm2+'월');
        }
    }else{
        yymm = yymmarry[0].split('_');
        $('#yearText').text(yymm[0]+'년');
        $('#monthText').text(yymm[1]+'월');
        $('#ymdText-pc-month-start').text(yymm[1]+'월');
        $('#ymdText-pc-month-end').text('');
    }

    //일자 셋팅
    var dd_weekstart = $('#weekNum_1').attr('data-date').substr(6,2);
    var dd_weekend = $('#weekNum_7').attr('data-date').substr(6,2);
    if(dd_weekstart.substr(0,1)=='0'){
        dd_weekstart = dd_weekstart.substr(1,1);
    }
    if(dd_weekend.substr(0,1)=='0'){
        dd_weekend = dd_weekend.substr(1,1);
    }
    $('#ymdText-pc-date-start').text(dd_weekstart+'일');
    $('#ymdText-pc-date-end').text(dd_weekend+'일');
}

function krHoliday(){
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
    var WeekArry = [Sunday_date,Monday_date,Tuesday_date,Wednesday_date,Thursday_date,Friday_date,Saturday_date];
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
        $('#slide'+Index+' #weekNum_'+Number(i-1)).attr('data-date',yy+mm+dd);
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

    var WeekArry = [sunday,monday,tuesday,wednesday,thursday,friday,saturday];
    var WeekArryTarget = [Sunday_date,Monday_date,Tuesday_date,Wednesday_date,Thursday_date,Friday_date,Saturday_date];
    var WeekNum = [weekNum_1,weekNum_2,weekNum_3,weekNum_4,weekNum_5,weekNum_6,weekNum_7];

    $('.holidayName').text('');
    $('.holiday').removeClass('holiday');

    for(i=0; i<7;i++){
        var text1 = '일';
        if(Options.language == "JPN"){
            text1 = '日';
        }else if(Options.language == "ENG"){
            text1 = '';
        }
        WeekArry[i].html(WeekArryTarget[i]+text1);

        var date_yyyy_m_d = date_format_yyyy_mm_dd_to_yyyy_m_d(date_format_yyyymmdd_to_split(currentPageDateInfo[i],'_'),'_');

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
        selector_timeIndicatorBar.css('top',indicator_Location+minute_adjust);
        if(realTimeMin<10){
            realTimeMin = '0' + realTimeMin;
        }
        if(realTimeHour<10){
            realTimeHour = '0' + realTimeHour;
        }

        selector_timeIndicatorBar.css('visibility','visible').html('<span class="timeindicator_rightfloat">'+realTimeHour+':'+realTimeMin+'</span>');
    }else{
        $('.hour').removeClass('currentTimeBlackBox');
        selector_timeIndicatorBar.css('visibility','hidden');
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

    for(i=1;i<=7;i++){
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
            $('#weekNum_'+i+' span:nth-child(1)').addClass('today').html('TODAY');
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
    var ymdArry = [yy,mm,dd];
    var yymmdd = ymdArry.join('');
    for(var i=1;i<=7;i++){
        var scan = $('#weekNum_'+i).attr('data-date');
        if(yymmdd<=scan && scan<Options.availDate+Number(yymmdd)){
            $('#weekNum_'+i).addClass('reserveavailable');
        }else if(scan.substr(0,4)==yy+1 && scan.substr(4,2) == '01' &&scan.substr(6,2)<Number(dd)+Options.availDate-lastDay[currentMonth]){
            $('#weekNum_'+i).addClass('reserveavailable');
        }
        else if(scan.substr(4,2)== Number(mm)+1 && scan.substr(6,2)<Number(dd)+Options.availDate-lastDay[currentMonth]){
            $('#weekNum_'+i).addClass('reserveavailable');
        }else{
            $('#weekNum_'+i).removeClass('reserveavailable');

        }
    }
}





function fake_show(){
    //var faketarget = selector.parent('div').siblings('.fake_for_blankpage')
    var selector_swiper_slide_active = $('.swiper-slide-active');
    if(selector_swiper_slide_active.find('.classTime').length == 0 && selector_swiper_slide_active.find('.offTime').length == 0 && selector_swiper_slide_active.find('.groupTime').length == 0){
        selector_swiper_slide_active.find('.fake_for_blankpage').css('display','block');
    }else{
        selector_swiper_slide_active.find('.fake_for_blankpage').css('display','none');
    }
    /*else if($('.swiper-slide-active').find('.classTime').length == 0 && $('.swiper-slide-active').find('.offTime').length == 0){
     $('.swiper-slide-active').find('.fake_for_blankpage').css('display','block')
     }*/
}



function scheduleTime(option, jsondata, size){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
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
            planMemberNum = jsondata.group_schedule_max_member_num;
            planMemberDbid = '';
            planCode = '';
            planGroupClassName = jsondata.group_schedule_group_type_cd_name;
            break;
    }

    //2018_4_22_8_30_2_OFF_10_30

    var planheight = 60*size;
    var len = planScheduleIdArray.length;
    for(var i=0; i<len; i++){
        //2018-05-11 10:00:00
        var planDate_   = planStartDate[i].split(' ')[0];
        var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
        var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
        var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
        var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
        var planMinute  = planStartDate[i].split(' ')[1].split(':')[1];
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
        if(compare_time(planHour+':'+planMinute, Options.workStartTime+':00') == false && compare_time(planEndHour+':'+planEndMin, Options.workStartTime+':00') ){
            planHour = Options.workStartTime;
            planMinute = '00';
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
        //var planStartArr = [planYear, planMonth, planDate, planHour, planMinute];
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
        tdPlan.parent('div').siblings('.fake_for_blankpage').css('display','none');

        var planColor_ = planColor+planfinished;
        var textcolor = "bluetext";
        var hideornot = 'hideelement';
        if(option != 'off'){
            if(planScheduleFinishArray[i] == 1){
                planColor_ = planColor+planfinished;
            }else{
                planColor_ = planColor;
            }
        }else{
            planColor_ = planColor;
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

        var planLocation = Number(planArray[4])*size;
        if(timeoffset >=30){
            planLocation = Number(planArray[4])*size-30*size;
        }
        var planHeight = Number(planDura*planheight-1);

        //이미 설정한 일정이 업무종료 시간보다 넘어가서 끝날때 끝을 깔끔하게 업무종료시간에 맞춘다.
        
        //if(planStartDiv.length>0){
          //  var timLocation = planStartDiv.offset().top + planLocation;
            //var calBottomLoc = $('.swiper-slide-active').offset().top + $('.swiper-slide-active').height();
            //if(timLocation + planHeight > calBottomLoc){
              //  var planHeight = calBottomLoc - timLocation;
            //}
        //}
        //이미 설정한 일정이 업무종료 시간보다 넘어가서 끝날때 끝을 깔끔하게 업무종료시간에 맞춘다.


        if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
            if(planStartDiv.find('div['+'class-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
                }else{
                    planStartDiv.append('<div class-time="'+planArray.join('_')+
                                           '" class-schedule-id="'+planScheduleIdArray[i]+
                                           '" data-starttime="'+planStartDate[i]+
                                           '" data-groupid="'+planGroupid[i]+
                                           '" data-membernum="'+planMemberNum[i]+
                                           '" data-memo="'+planNoteArray[i]+
                                           '" data-schedule-check="'+planScheduleFinishArray[i]+
                                           '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                           '" data-dbid="'+planMemberDbid[i]+
                                           '" data-memberName="'+memberName+
                                           '" class="'+planColor_+
                                           '" style="height:'+planHeight+'px;'+
                                                     'top:'+planLocation+'px;'+
                                           '">'+
                                                '<span class="memberName '+hideornot+'">'+
                                                    '<p class="groupnametag">'+planCode+memberName+'</p>'+
                                                ' </span>'+
                                                '<span class="memberTime '+hideornot+'">'+ 
                                                    '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+
                                                '</span>'+

                                        '</div>'
                                        );
                }
            } 
        }else if(option == 'group'){
            if(planStartDiv.find('div['+'group-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
                }else{
                    planStartDiv.append('<div group-time="'+planArray.join('_')+
                                           '" group-schedule-id="'+planScheduleIdArray[i]+
                                           '" data-starttime="'+planStartDate[i]+
                                           '" data-groupid="'+planGroupid[i]+
                                           '" data-current-membernum="'+jsondata.group_schedule_current_member_num[i]+
                                           '" data-membernum="'+planMemberNum[i]+
                                           '" data-memo="'+planNoteArray[i]+
                                           '" data-schedule-check="'+planScheduleFinishArray[i]+
                                           '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                           '" data-dbid="'+planMemberDbid[i]+
                                           '" data-memberName="'+memberName+
                                           '" data-group-type-cd-name="'+planGroupClassName[i]+
                                           '" class="'+planColor_+
                                           '" style="height:'+planHeight+'px;'+
                                                     'top:'+planLocation+'px;'+
                                           '">'+
                                                '<span class="memberName '+hideornot+'">'+
                                                        '<p class="groupnametag">'+planCode+memberName+'</p>'+
                                                        groupstatus+
                                                '</span>'+
                                                '<span class="memberTime '+hideornot+'">'+ 
                                                        '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+
                                                '</span>'+

                                        '</div>'
                                        );
                }
            }
        }else if(option == 'off'){
            if(planStartDiv.find('div['+'off-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
                }else{
                    planStartDiv.append('<div off-time="'+planArray.join('_')+
                                           '" off-schedule-id="'+planScheduleIdArray[i]+
                                           '" data-starttime="'+planStartDate[i]+
                                           '" data-groupid="'+planGroupid[i]+
                                           '" data-membernum="'+planMemberNum[i]+
                                           '" data-memo="'+planNoteArray[i]+
                                           '" data-schedule-check="'+planScheduleFinishArray[i]+
                                           '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                           '" data-dbid="'+planMemberDbid[i]+
                                           '" data-memberName="'+memberName+
                                           '" class="'+planColor_+
                                           '" style="height:'+planHeight+'px;'+
                                                     'top:'+planLocation+'px;'+
                                           '">'+
                                                '<span class="memberName '+hideornot+'">'+
                                                    '<p class="groupnametag">'+planCode+memberName+'</p>'+
                                                ' </span>'+
                                                '<span class="memberTime '+hideornot+'">'+ 
                                                    '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+
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



function scheduleTime_Mobile(option, jsondata, size){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
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
        var planMinute  = planStartDate[i].split(' ')[1].split(':')[1];
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
        var planStartArr = [planYear, planMonth, planDate];
        var planStart = planStartArr.join("_");
        //var tdPlanStart = $("#"+planStart+" div"); //2018_7_8
        var tdPlan = $("#"+planStart);
        //tdPlan.parent('div').siblings('.fake_for_blankpage').css('display','none');

        var planColor_ = planColor+planfinished;
        var textcolor = "bluetext";
        var hideornot = 'hideelement';
        if(option != 'off'){
            if(planScheduleFinishArray[i] == 1){
                planColor_ = planColor+planfinished;
            }else{
                planColor_ = planColor;
            }
        }else{
            planColor_ = planColor;
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
            if(bodywidth>600){
                memberTimeHide = 'inlineelement';
            }
        }else{
            hideornot = 'inlineelement';
            memberTimeHide = "hideelement";
            groupstatus = '<span class="groupnumstatus '+textcolor+'">'+'('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span>';
            if(bodywidth>600){
                memberTimeHide = 'inlineelement';
            }
        }

        


        var planLocation = (60*(planHour-Options.workStartTime)+60*planMinute/60)*size;

        var innerNameTag;
        if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                innerNameTag = '<span class="memberName '+hideornot+'">'+'<p class="groupnametag">'+planCode+memberName+'</p>'+' </span>'+'<span class="memberTime '+memberTimeHide+'">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>';
                planhtml = '<div class-time="'+planArray.join('_')+
                            '" class-schedule-id="'+planScheduleIdArray[i]+
                            '" data-starttime="'+planStartDate[i]+
                            '" data-groupid="'+planGroupid[i]+
                            '" data-membernum="'+planMemberNum[i]+
                            '" data-memo="'+planNoteArray[i]+
                            '" data-schedule-check="'+planScheduleFinishArray[i]+
                            '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                            '" data-dbid="'+planMemberDbid[i]+
                            '" data-memberName="'+memberName+
                            '" class="'+planColor_+
                            '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+
                            '">'+
                                innerNameTag+
                           '</div>';
                date_sorted[planStart].push(planhtml);
            }
        }else if(option == 'group'){
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                innerNameTag = '<span class="memberName '+hideornot+'">'+'<p class="groupnametag">'+planCode+memberName+'</p>'+groupstatus+' </span>'+'<span class="memberTime '+memberTimeHide+'">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>';
                planhtml = '<div group-time="'+planArray.join('_')+
                            '" group-schedule-id="'+planScheduleIdArray[i]+
                            '" data-starttime="'+planStartDate[i]+
                            '" data-groupid="'+planGroupid[i]+
                            '" data-current-membernum="'+jsondata.group_schedule_current_member_num[i]+
                            '" data-membernum="'+planMemberNum[i]+
                            '" data-memo="'+planNoteArray[i]+
                            '" data-schedule-check="'+planScheduleFinishArray[i]+
                            '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                            '" data-dbid="'+planMemberDbid[i]+
                            '" data-memberName="'+memberName+
                            '" data-group-type-cd-name="'+planGroupClassName[i]+
                            '" class="'+planColor_+
                            '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+
                            '">'+
                                innerNameTag+
                           '</div>';
                date_sorted[planStart].push(planhtml);
            }
        }else if(option == 'off'){
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                innerNameTag = '<span class="memberName '+hideornot+'">'+'<p class="groupnametag">'+planCode+memberName+'</p>'+' </span>'+'<span class="memberTime '+memberTimeHide+'">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>';
                planhtml = '<div off-time="'+planArray.join('_')+
                            '" off-schedule-id="'+planScheduleIdArray[i]+
                            '" data-starttime="'+planStartDate[i]+
                            '" data-groupid="'+planGroupid[i]+
                            '" data-membernum="'+planMemberNum[i]+
                            '" data-memo="'+planNoteArray[i]+
                            '" data-schedule-check="'+planScheduleFinishArray[i]+
                            '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                            '" data-dbid="'+planMemberDbid[i]+
                            '" data-memberName="'+memberName+
                            '" class="'+planColor_+
                            '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+
                            '">'+
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

function ajaxClassTime(use, callfunction){
    var beforeSend_;
    var completeSend_;
    if(use == "callbefore"){
        beforeSend_ = function(){beforeSend('callback', function(){callfunction();});};
        completeSend_ = function(){completeSend();};
    }else if(use == "callafter"){
        beforeSend_ = function(){beforeSend();};
        completeSend_ = function(){completeSend('callback', function(){callfunction();});};
    }else{
        beforeSend_ = function(){beforeSend();};
        completeSend_ = function(){completeSend();};
    }

    var $weekNum4 = $('#weekNum_4').attr('data-date');
    var today_form = $weekNum4.substr(0,4)+'-'+$weekNum4.substr(4,2)+'-'+$weekNum4.substr(6,2);

    //=var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_trainer_schedule/')
    $.ajax({
        url: '/trainer/get_trainer_schedule/',
        type : 'GET',
        data : {"date":today_form, "day":18},
        dataType : 'html',

        beforeSend:function(){
            beforeSend_();
            // console.log(getTimeStamp());
            $('.ymdText-pc-add-off, .ymdText-pc-add-pt').addClass('disabled_button').attr('onclick','');
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                set_schedule_time(jsondata);
            }

            completeSend_();

            $('.ymdText-pc-add div').removeClass('disabled_button');
            $('.ymdText-pc-add-pt').attr('onclick','float_btn_addplan(1)');
            $('.ymdText-pc-add-off').attr('onclick','float_btn_addplan(2)');
        },

        complete:function(){

        },

        error:function(){
            console.log('server error');
        }
    });
}
// function getTimeStamp() {
//   var d = new Date();
//   var s =
//     leadingZeros(d.getFullYear(), 4) + '-' +
//     leadingZeros(d.getMonth() + 1, 2) + '-' +
//     leadingZeros(d.getDate(), 2) + ' ' +
//
//     leadingZeros(d.getHours(), 2) + ':' +
//     leadingZeros(d.getMinutes(), 2) + ':' +
//     leadingZeros(d.getSeconds(), 2)+ ':' +
//         d.getMilliseconds();
//
//   return s;
// }
//
// function leadingZeros(n, digits) {
//   var zero = '';
//   n = n.toString();
//
//   if (n.length < digits) {
//     for (i = 0; i < digits - n.length; i++)
//       zero += '0';
//   }
//   return zero + n;
// }



function set_schedule_time(jsondata){
    //$('.classTime, .offTime, .groupTime').parent().html('<div class="blankbox"></div>');
    $('.classTime, .offTime, .groupTime').remove();
    $('._on').removeClass('_on');
    initialJSON = jsondata;
    if(bodywidth > 600){
        if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null){
            scheduleTime_Mobile('class', jsondata, calendarSize);
            scheduleTime_Mobile('off', jsondata, calendarSize);
            scheduleTime_Mobile('group', jsondata, calendarSize);
            //get_timeindex_Y();
        }else{
            scheduleTime('class', jsondata, calendarSize);
            scheduleTime('off', jsondata, calendarSize);
            scheduleTime('group', jsondata, calendarSize);
            fake_show();
        }
    }else if(bodywidth <= 600){
        scheduleTime_Mobile('class', jsondata, calendarSize);
        scheduleTime_Mobile('off', jsondata, calendarSize);
        scheduleTime_Mobile('group', jsondata, calendarSize);
        //fake_show();
    }
}