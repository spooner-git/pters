/*달력 만들기

 1. 각달의 일수를 리스트로 만들어 둔다.
 [31,28,31,30,31,30,31,31,30,31,30,31]
 2. 4년마다 2월 윤달(29일)
 year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
 3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1

 */


$('#uptext').text("월간 일정");

//ESC키를 눌러서 팝업 닫기
$(document).keyup(function(e){
    if(e.keyCode == 27){
        if($('#subpopup_addByList_plan').css('display') == 'block'){
            close_addByList_popup();
        }else{
            if($('#memberInfoPopup_PC').css('display') == "block"){
                closePopup('member_info_PC');
            }else{
                close_info_popup('cal_popup_plandelete');
                close_info_popup('cal_popup_planinfo');
                close_info_popup('cal_popup_plancheck');
                close_info_popup('page-addplan');
            }
        }
    }
});
//ESC키를 눌러서 팝업 닫기

var clicked_td_date_info;
var schedule_on_off = 0;


// setInterval(function(){ajaxCheckSchedule()}, 60000)// 자동 ajax 새로고침(일정가져오기)


function ajaxCheckSchedule(){

    $.ajax({
        url: '/schedule/check_schedule_update/',
        dataType : 'html',
        async: false,

        beforeSend:function(){
            //beforeSend();
        },

        success:function(data){
            var jsondata = JSON.parse(data);
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

//회원이름을 클릭했을때 회원정보 팝업을 보여주며 정보를 채워준다.
$(document).on('click', '.memberNameForInfoView, .groupParticipantsRow span', function(){
    var bodywidth = window.innerWidth;
    var dbID = $(this).attr('data-dbid');
    //$('.popups').hide()
    if(bodywidth < 600){
        $('.popups').hide();
        //$('#calendar').css('display','none')
        $('#calendar').css('height', '0');
        get_indiv_member_info(dbID);
        get_indiv_repeat_info(dbID);
        get_member_lecture_list(dbID);
        get_member_history_list(dbID);
        shade_index(100);
    }else if(bodywidth >= 600){
        get_indiv_member_info(dbID);
        get_indiv_repeat_info(dbID);
        get_member_lecture_list(dbID);
        get_member_history_list(dbID);
        $('.member_info_tool button._info_delete_img').hide();
        $('#info_shift_base, #info_shift_lecture').show();
        $('#info_shift_schedule, #info_shift_history').hide();
        $('#select_info_shift_lecture').addClass('button_active');
        $('#select_info_shift_schedule, #select_info_shift_history').removeClass('button_active');
    }
});

$('.popup_inner_month').scroll(function(e){
    e.stopPropagation();
    var scrollHeight = $(this).prop('scrollHeight');
    var popupHeight = $(this).height();
    var scrollLocation = $(this).scrollTop();

    if(popupHeight + scrollLocation == scrollHeight){
        $(this).animate({scrollTop : scrollLocation-1},10);
    }else if(popupHeight + scrollLocation == popupHeight){
        $(this).animate({scrollTop : scrollLocation+1},10);
    }

    // 좌측 스크롤 애로우 보이기
    if(popupHeight + scrollLocation < scrollHeight-30){
        $('.scroll_arrow_bottom').css('visibility','visible');
    }else{
        $('.scroll_arrow_bottom').css('visibility','hidden');
    }
    if(scrollLocation > 30){
        $('.scroll_arrow_top').css('visibility','visible');
    }else{
        $('.scroll_arrow_top').css('visibility','hidden');
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
        $thisul.animate({scrollTop: 0},200)
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
        $thisul.animate({scrollTop: $thisul_scroll_height + $thisul_display_height},200)
    }
});
//드랍다운리스트에서 아래 화살표를 누르면 리스트의 맨아래로 이동한다.


//여기서부터 월간 달력 만들기 코드////////////////////////////////////////////////////////////////////////////////////////////////
month_calendar(today_YY_MM_DD);
$('.swiper-slide-active').css('width', $('#calendar').width());

//다음페이지로 슬라이드 했을때 액션
myswiper.on('onSlideNextEnd', function(){
    /*
    ++currentPageMonth;
    if(currentPageMonth+1>12){
        ++currentYear
        currentPageMonth = currentPageMonth - 12;
        slideControl.append();
    }else{
        slideControl.append();
    };
    */
    slideControl.append();
});

//이전페이지로 슬라이드 했을때 액션
myswiper.on('onSlidePrevEnd', function(){
    /*
    --currentPageMonth;
    if(currentPageMonth-1<1){
        --currentYear
        currentPageMonth = currentPageMonth + 12;
        slideControl.prepend();
    }else{
        slideControl.prepend();
    };
    */
    slideControl.prepend();
});


//페이지 이동에 대한 액션 클래스
var slideControl = {
    'append' : function(){ //다음페이지로 넘겼을때
        var selector_swiper_slide_last_child = $('.swiper-slide:last-child');
        var lastdateinfo = selector_swiper_slide_last_child.find('.container-fluid').attr('id').split('_');
        var lastYY = Number(lastdateinfo[1]);
        var lastMM = Number(lastdateinfo[2]);

        myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
        myswiper.appendSlide('<div class="swiper-slide"></div>'); //마지막 슬라이드에 새슬라이드 추가
        //(디버깅용 날짜 표시)myswiper.appendSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth+1)+'월'+' currentPageMonth: '+Number(currentPageMonth+1)+'</div>') //마지막 슬라이드에 새슬라이드 추가
        calTable_Set(3, lastYY, lastMM+1); //새로 추가되는 슬라이드에 달력 채우기
        //dateDisabled();
        monthText();
        krHoliday();
        //availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
        ajaxClassTime();
        myswiper.update(); //슬라이드 업데이트

    },

    'prepend' : function(){
        var selector_swiper_slide_first_child = $('.swiper-slide:first-child');
        var firstdateinfo = selector_swiper_slide_first_child.find('.container-fluid').attr('id').split('_');
        var firstYY = Number(firstdateinfo[1]);
        var firstMM = Number(firstdateinfo[2]);

        myswiper.removeSlide(2);
        myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
        //(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
        calTable_Set(1, firstYY, firstMM-1);
        //dateDisabled();
        monthText();
        krHoliday();
        //availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
        ajaxClassTime();
        myswiper.update(); //이전페이지로 넘겼을때

    }
};

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
                $("td[data-date="+dateTarget+"]").attr('schedule-id',jsondata.scheduleIdArray[i]);
                $("td[data-date="+dateTarget+"] div._classTime").addClass('balloon_trainer').html('<img src="/static/user/res/icon-cal-mini.png">'+countResult[i])
                $("td[data-date="+dateTarget+"] div._classDate").addClass('greydateMytime');
            }
        }else{
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                $("td[data-date="+dateTarget+"]").attr('schedule-id',jsondata.scheduleIdArray[i]);
                $("td[data-date="+dateTarget+"] div._classTime").addClass('blackballoon_trainer').html('<img src="/static/user/res/icon-cal-mini.png">'+countResult[i])
                $("td[data-date="+dateTarget+"] div._classDate").addClass('dateMytime');
            }
        }
    };
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
        summaryArray[jsondata.classTimeArray_start_date[i].split(' ')[0]] = jsondata.classTimeArray_start_date[i].split(' ')[0]
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
        var name = jsondata.group_schedule_group_name[i]+groupParticipants;
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
            dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_'+dbID+'_'+grouptype+'_'+group_id+'_'+group_type_cd_name+'_'+groupmax+'_/'+memoArray)
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
            groupmax = 1
            dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_'+dbID+'_'+grouptype+'_'+group_id+'_'+group_type_cd_name+'_'+groupmax+'_/'+memoArray)
        }
    }


    dateplans.sort();
    var htmltojoin = []
    if(dateplans.length>0){
        for(var i=1; i<=dateplans.length; i++){
            var splited = dateplans[i-1].split('_');
            var stime = Number(splited[0]);
            var sminute = splited[1];
            var etime = Number(splited[2]);
            var eminute = splited[3];
            var name = splited[4];
            // var groupo_type_cd_name = '';
            var textsize = "";
            if(splited[14] != ''){
                name = '['+splited[14]+'] '+splited[4];
            }

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
                htmltojoin.push('<div class="plan_raw" title="완료 된 일정" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-group-type-cd-name="'+splited[14]+'" data-membernum="'+splited[15]+'" data-dbid="'+splited[11]+'" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'">'+
                                    '<div class="plancheckmorningday">'+morningday+'</div>'+
                                    '<div class="planchecktime">'+stime+':'+sminute+' - '+etime+':'+eminute+'</div>'+
                                    '<div class="plancheckname"><img src="/static/user/res/btn-pt-complete.png">'+'<p '+textsize+'>'+name+'</p></div>'+
                                '</div>');

            }else if(splited[10] == 0){
                htmltojoin.push('<div class="plan_raw" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-group-type-cd-name="'+splited[14]+'" data-membernum="'+splited[15]+'" data-dbid="'+splited[11]+'" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'">'+
                                    '<div class="plancheckmorningday">'+morningday+'</div>'+
                                    '<div class="planchecktime">'+stime+':'+sminute+' - '+etime+':'+eminute+'</div>'+
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
    var page1 = $('.swiper-slide:nth-of-type(1)');
    var page2 = $('.swiper-slide:nth-of-type(2)');
    var page3 = $('.swiper-slide:nth-of-type(3)');

    page1.html('');
    page2.html('');
    page3.html('');

    var year = Number(referencedate.split('-')[0]);
    var month = Number(referencedate.split('-')[1]);
    calTable_Set(1, year, month-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
    calTable_Set(2, year, month);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
    calTable_Set(3, year, month+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기

    monthText(); //상단에 연, 월 표시
    krHoliday(); //대한민국 공휴일
    //draw_time_graph(Options.hourunit,'')
    ajaxClassTime();
}

function calTable_Set(Index, Year, Month){ //선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
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
        var child = '<table id="week'+i+Year+Month+'child" class="calendar-style"><tbody><tr></tr></tbody></table>'
        htmltojoin.push('<div id="week'+i+'_'+Year+'_'+Month+'" class="container-fluid week-style">'+child+'</div>')
    };

    $targetHTML.html(htmltojoin.join(''));

    calendarSetting(Year, Month);
}; //calTable_Set

function calendarSetting(Year, Month){ //캘린더 테이블에 연월에 맞게 날짜 채우기
    var currentPageFirstDayInfo = new Date(Year,Month-1,1); //현재달의 1일에 대한 연월일시간등 전체 정보
    var firstDayCurrentPage = currentPageFirstDayInfo.getDay(); //현재달 1일의 요일

    if( (Year % 4 == 0 && Year % 100 != 0) || Year % 400 == 0 ){  //윤년
        lastDay[1] = 29;
    }else{
        lastDay[1] = 28;
    }


    //1. 현재달에 전달 마지막 부분 채우기
    if(Month>1){ //2~12월
        for(var j=lastDay[Month-2]-firstDayCurrentPage+1; j<=lastDay[Month-2] ;j++){
            $('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates" data-date='+Year+'_'+(Month-1)+'_'+j+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
        };
    }else if(Month==1){ //1월
        for(var j=31-firstDayCurrentPage+1; j<=31 ;j++){
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
        ad_month($('#week6'+Year+Month+'child tbody tr')); //2017.11.08추가 달력이 5주일때, 비어있는 6주차에 광고 입력
    }else if(howmanyWeek6<7 && howmanyWeek6>0){
        for (var i=1; i<=7-howmanyWeek6; i++){
            if(Month<12){
                $('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates" data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
            }else if(Month==12){
                $('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates" data-date='+(Year+1)+'_'+(Month-11)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
            }
        };
    }
    for(i=1;i<=6;i++){
        $('#week'+i+Year+Month+'child td:first-child').addClass('tdsunday'); //일요일 날짜는 Red 표기
        $('#week'+i+Year+Month+'child td:last-child').addClass('tdsaturday'); //토요일 날짜는 Blue 표기
    }
}; //calendarSetting()

function krHoliday(){ //대한민국 공휴일 날짜를 빨간색으로 표시
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
    $('#yearText, #ymdText-pc-year').text(textYear);
    $('#monthText, #ymdText-pc-month').text(textMonth+'월');
    todayFinderArrow(textYear,textMonth);
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
            tr2[i] = '<td id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00"></td><td id="'+(i)+'g_30'+types+'" class="tdgraph_'+option+' tdgraph30"></td>';
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

function todayFinderArrow(Year, Month){
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
    selector.html('<img src="/static/user/res/PTERS_logo.jpg" alt="logo" class="admonth">').css({'text-align':'center'})
}
