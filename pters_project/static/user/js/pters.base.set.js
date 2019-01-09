var date = new Date();
var currentYear = date.getFullYear(); //현재 년도
var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
var currentDate = date.getDate();
var currentDay = date.getDay(); // 0,1,2,3,4,5,6,7
var currentHour = date.getHours();
var currentMinute = date.getMinutes();
var todayYYYYMMDD = Number(date_format_yyyy_m_d_to_yyyymmdd(currentYear+'_'+(currentMonth+1)+'_'+currentDate));
var today_YY_MM_DD = date_format_yyyy_m_d_to_yyyy_mm_dd(currentYear+'_'+(currentMonth+1)+'_'+currentDate, '-');
var today_Y_M_D = currentYear+'-'+(currentMonth+1)+'-'+currentDate;
var lastDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];      //각 달의 일수
if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
    lastDay[1] = 29;
}else{
    lastDay[1] = 28;
}

var multiLanguage = { 'KOR':
    {'DD':'매일', 'WW':'매주', '2W':'격주',
        'SUN':'일요일', 'MON':'월요일', 'TUE':'화요일', 'WED':'수요일', 'THS':'목요일', 'FRI':'금요일', 'SAT':'토요일',
        "WeekSmpl":['일', '월', '화', '수', '목', '금', '토']
    },
    'JPN':
        {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
            'SUN':'日曜日', 'MON':'月曜日', 'TUE':'火曜日', 'WED':'水曜日', 'THS':'木曜日', 'FRI':'金曜日', 'SAT':'土曜日',
            "WeekSmpl":['日', '月', '火', '水', '木', '金', '土']
        },
    'ENG':
        {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
            'SUN':'Sun', 'MON':'Mon', 'TUE':'Tue', 'WED':'Wed', 'THS':'Thr', 'FRI':'Fri', 'SAT':'Sat',
            "WeekSmpl":['Sun', 'Mon', 'Tue', 'Wed', 'Ths', 'Fri', 'Sat']
        }
};


//플로팅 버튼 스크롤시 숨기기 Start
var ts;
var selector_body = $("body");
selector_body.bind("touchstart", function(e){
    ts = e.originalEvent.touches[0].clientY;
});

$(document).on("touchend", 'html', function(e){
    var te = e.originalEvent.changedTouches[0].clientY;
    if(ts>te+5 && $('#mshade').css('z-index')<0){
        downTouchEvent();
    }else if(ts<te-5){
        upTouchEvent();
    }
});
//플로팅 버튼 스크롤시 숨기기 End


$(window).keydown(function(event){
    if((event.which== 13) && ($(event.target)[0]!=$("textarea")[0])) {
      event.preventDefault();
      return false;
    }
});


function beforeSend(use, callback){
    $('#upbutton-check img').attr('src', '/static/user/res/ajax/loading.gif');
    $('.ajaxloadingPC').css('display', 'block');
    if(use == "callback"){
        callback();
    }
}

function completeSend(use, callback){
    $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
    $('.ajaxloadingPC').css('display', 'none');
    if(use == "callback"){
        callback();
    }
}

function upTouchEvent(){
    if($('#mshade').css('z-index')<0){
        $("#float_btn_wrap").show();
    }

}
function downTouchEvent(){
    $("#float_btn_wrap").hide();

}

function sideGoPage(page, menu_name_class){
    // $('.ajaxloadingPC').show();
    // $('#uptext, #uptext2, #uptext3').text(multi_language_set["KOR"][menu_name_class]);
    // closeNav();
    // // $('#shade_caution').show();
    // $('#mobile_page_interaction').css({'transform':'translateX(-100%)'});
    // setTimeout(function(){location.href="/trainer/"+page+'/';}, 180);
    location.href="/trainer/"+page+'/';
}


function shade_index(option){
    var initialbodywidth = window.innerWidth;
    var initialbodyheight = document.documentElement.clientHeight + 100;
    if(initialbodywidth >= 600){
        $('#pshade').css({'width':'100%', 'height':'100%'});
    }else{
        $('#mshade').css({'width':'100%', 'height':initialbodyheight});
    }
    var bodywidth = window.innerWidth;
    if(bodywidth >= 600){
        if(option<0){
            if($('#memberInfoPopup_PC').css('display')=="block" && $('._calmonth').css('display')=="block"){
                $('#pshade').css({'z-index':150, 'display':'block'});
            }else{
                $('#pshade').css({'z-index':option, 'display':'none'});
            }

        }else{
            $('#pshade').css({'z-index':option, 'display':'block'});
        }

    }else if(bodywidth < 600){
        var selector_page_addplan = $('#page-addplan');
        var selector_page_addmember = $('#page_addmember');
        var selector_float_btn_wrap = $('#float_btn_wrap');
        var selector_memberInfoPopup = $('#memberInfoPopup');
        var selector_lectureInfoPopup = $('#popup_lecture_info_mobile');
        if(option<0){
            if(selector_page_addplan.css('display') == 'block'){
                $('#mshade_popup').css({'display':'none', 'z-index':selector_page_addplan.css('z-index')});
            }else if(selector_page_addmember.css('display') == 'block'){
                $('#mshade_popup').css({'display':'none', 'z-index':selector_page_addmember.css('z-index')});
            }else{
                $('#mshade_popup').css({'display':'none', 'z-index':option});
            }
            $('#mshade').css({'display':'none', 'z-index':option});
        }else{
            if(selector_page_addplan.css('display') == 'block'){
                $('#mshade_popup').css({'z-index':selector_page_addplan.css('z-index'), 'display':'block'});
            }
            if(selector_page_addmember.css('display') == 'block'){
                $('#mshade_popup').css({'z-index':selector_page_addmember.css('z-index'), 'display':'block'});
            }
            if(selector_float_btn_wrap.css('display')=='block' && !$('#float_btn').hasClass('rotate_btn')){
                selector_float_btn_wrap.hide();
            }
            if(selector_memberInfoPopup.css('display')=='block'){
                $('#mshade_popup').css({'z-index':selector_memberInfoPopup.css('z-index'), 'display':'block'});
            }
            if(selector_lectureInfoPopup.css('display')=='block'){
                $('#mshade_popup').css({'z-index':selector_lectureInfoPopup.css('z-index'), 'display':'block'});
            }
            if($('#cal_popup_planinfo').css('display')=="block"){
                $('#mshade_popup').css({'display':'none'});
            }
            $('#mshade').css({'z-index':option, 'display':'block'});
        }
    }
}

function show_caution_popup(messageHtml){
    $('#caution_popup .caution_message').html(messageHtml);
    $('#caution_popup').show();
    $('#shade_caution').show();
}

function show_caution_popup_yes_or_no(messageHtml){
    $('#caution_popup_yes_or_no .caution_message').html(messageHtml);
    $('#caution_popup_yes_or_no').show();
    $('#shade_caution').show();
}

function close_caution_popup(){
    $('#caution_popup').hide();
    $('#caution_popup_yes_or_no').hide();
    $('#shade_caution').hide();
    //$('#page-base-addstyle').css('z-index',150);
    //enable_window_scroll();
}


var toggleGroupParticipants = 'off';
function toggleGroupParticipantsList(onoff){
    var selector_grouopParticipants = $('#groupParticipants');
    var selector_popup_btn_viewGroupParticipants = $('#popup_btn_viewGroupParticipants');
    var selector_popup_btn_viewGroupParticipants_img = $('#popup_btn_viewGroupParticipants img');
    switch(onoff){
        case 'on':
            toggleGroupParticipants = 'on';
            //selector_grouopParticipants.animate({'height':'200px'},200);
            //$('#groupParticipants').css('height','200px')
            selector_popup_btn_viewGroupParticipants_img.css('transform', 'rotate(180deg)');
            var group_id = selector_popup_btn_viewGroupParticipants.attr('data-groupid');
            var max = selector_popup_btn_viewGroupParticipants.attr('data-membernum');
            var group_schedule_id = selector_popup_btn_viewGroupParticipants.attr('data-scheduleid');
            $('#popup_btn_complete, #popup_btn_delete').addClass('disabled_button');
            get_group_plan_participants(group_schedule_id, 'callback', function(jsondata){
                $('#popup_btn_complete, #popup_btn_delete').removeClass('disabled_button');
                draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id, max);
                var participants_number = $('div.groupParticipantsRow').length - $('div._type_absence').length;
                $('#groupplan_participants_status').text(
                                                        ' ('+participants_number +
                                                        '/'+
                                                        max+')'
                                                    );
                // selector_grouopParticipants.css({'height':'auto'});
                selector_grouopParticipants.css({'display':'block', 'height':'auto'});
                completeSend();
            });
            break;
        case 'off':
            toggleGroupParticipants = 'off';
            selector_grouopParticipants.css({'display':'none'}).html('');
            selector_popup_btn_viewGroupParticipants_img.css('transform', 'rotate(0deg)');
            break;
    }
}

$(document).ready(function(){

    var thisfilefullname = document.URL.substring(document.URL.lastIndexOf("/") + 1, document.URL.length);

    $("#outer_Sidenav").click(function(){ // When any `div.container` is clicked
        closeNav(); //Sidebar가 열렸을때 회색 영역을 터치해도 Sidebar가 닫힘
    });

    if($('meta[name="upperText"]').attr('content') == "main_trainer"){ //상단바에 텍스트 표시. 각 페이지의 Meta를 읽어와서 upperText를 셋팅
        //	 	  $('#uptext').text(upText[0]); //Main페이지에서는 Peters 표시
        $('.icon-bar').css('background-color', 'white');
        $('#uptext').html(`<img src="/static/user/res/PTERS_logo_site.png" style="height: 22px;margin-left: 10px;">`);
    }else{
        //	  	$('#uptext').text(upText[1]); //그외의 페이지에서는 "이름"+코치님 일정 표기
    }

    $('#alarm button').click(function(){
        var bodywidth = window.innerWidth;
        /*$('#alarm').css('transform','translate(-50%,-200%)');*/
        $('#alarm').css('height', '0');
        if(bodywidth>=600){
            shade_index(-100);
        }else{
            shade_index(-100);
        }
    });
});

function array_element_count(array, wanted){
    var counts = {};
    var len = array.length;
    for(var i=0; i<len; i++){
        counts[array[i]] = 0;
    }
    for(var j=0; j<len; j++){
        counts[array[j]] = counts[array[j]] +1;
    }
    return counts[wanted];
}



//Array에서 중복요소 제거
function remove_duplicate_in_list(arraylist){
    var dict_remove_duplicated = {};
    var list_removed_duplicate = [];
    var classlen = arraylist.length;
    for(var i=0; i<classlen; i++){
        dict_remove_duplicated[arraylist[i]] = "";
    }
    for(i in dict_remove_duplicated){
        list_removed_duplicate.push(i);
    }
    return list_removed_duplicate;
}

//Array 두개를 비교해서 중복제거
//compareArray에 없는 targetArray의 값만으로 array를 만들어 출력
function remove_duplicate_compared_to(targetArray, compareArray){
    var len = targetArray.length;
    var resultArray = [];
    for(var i=0; i<len; i++){
        if(compareArray.indexOf(targetArray[i]) == -1 ){
            resultArray.push(targetArray[i]);
        }
    }
    return resultArray;
}

//시간에 AM, PM붙이기
function time_format_add_ampm(time, noAMPM){ // time: 00:00
    var timesplit = time.split(':');
    var hour = Number(timesplit[0]);
    var min = timesplit[1];

    var text;
    var morning_text = "오전";
    var afternoon_text = "오후";
    // if(noAMPM=="kor"){
    //     morning_text = "오전";
    //     afternoon_text = "오후";
    // }
    hour = hour % 24;
    if(hour < 12){
        text = morning_text;
    }else if(hour > 12){
        hour = hour - 12;
        text = afternoon_text;
    }else if(hour == 12){
        text = afternoon_text;
    }
    if(noAMPM == "none"){
        return hour+':'+min;
    }else{
        return text+" "+hour+':'+min;
    }
}

//데이트가 2018-08-23 혹은 20180823 혹은 2018_08_23 혹은 2018-8-23 으로 들어왔을때 2018년 8월 23일 로 출력
function date_format_to_hangul(yyyymmdd){
    var date = yyyymmdd;
    var hangul_result = '';
    var hangul_year = '';
    var hangul_month = '';
    var hangul_date = '';
    if(date.split('-').length==3){ //2018-08-23 or 2018-8-23
        hangul_year = date.split('-')[0];
        hangul_month = date.split('-')[1];
        hangul_date = date.split('-')[2];
        if(hangul_month.substr(0, 1) == '0' && hangul_month.length == 2){
            hangul_month = hangul_month.substr(1, 2);
        }
        if(hangul_date.substr(0, 1) == '0' && hangul_date.length == 2){
            hangul_date = hangul_date.substr(1, 2);
        }
        hangul_result = hangul_year +'년 ' + hangul_month +'월 '+ hangul_date + '일';

    }else if(date.split('_').length==3){ //2018_08_23 or 2018_8_23;
        hangul_year = date.split('_')[0];
        hangul_month = date.split('_')[1];
        hangul_date = date.split('_')[2];
        if(hangul_month.substr(0, 1) == '0' && hangul_month.length == 2){
            hangul_month = hangul_month.substr(1, 2);
        }
        if(hangul_date.substr(0, 1) == '0' && hangul_date.length == 2){
            hangul_date = hangul_date.substr(1, 2);
        }
        hangul_result = hangul_year +'년 ' + hangul_month +'월 '+ hangul_date + '일';

    }else if(date.split('-').length==1 && date.length == 8){ //20180823
        hangul_year = date.substr(0, 4);
        hangul_month = date.substr(4, 2);
        hangul_date = date.substr(6, 2);

        if(hangul_month.substr(0, 1) == '0' && hangul_month.length == 2){
            hangul_month = hangul_month.substr(1, 2);
        }
        if(hangul_date.substr(0, 1) == '0' && hangul_date.length == 2){
            hangul_date = hangul_date.substr(1, 2);
        }
        hangul_result = hangul_year +'년 ' + hangul_month +'월 '+ hangul_date + '일';
    }
    return hangul_result;
}

//데이트가 2018-08-23 10:00:00 을 2018년 8월 23일(수) 10:00
function date_format_to_user_hangul(yyyy_mm_dd, minimize){
    var dates = '';
    var day = '';
    var time = '';
    if(minimize!=undefined){
        dates = yyyy_mm_dd.split(' ')[0].split('-')[0]+'-'+Number(yyyy_mm_dd.split(' ')[0].split('-')[1])+'-'+Number(yyyy_mm_dd.split(' ')[0].split('-')[2]);
        day =  ' ('+multiLanguage[Options.language].WeekSmpl[new Date(yyyy_mm_dd.split(' ')[0]).getDay()]+') ';
        time = yyyy_mm_dd.split(' ')[1].substr(0, 5);
    }else{
        dates = yyyy_mm_dd.split(' ')[0].split('-')[0]+'년 '+Number(yyyy_mm_dd.split(' ')[0].split('-')[1])+'월 '+Number(yyyy_mm_dd.split(' ')[0].split('-')[2])+'일';
        day =  ' ('+multiLanguage[Options.language].WeekSmpl[new Date(yyyy_mm_dd.split(' ')[0]).getDay()]+') ';
        time = yyyy_mm_dd.split(' ')[1].substr(0, 5);
    }

    return dates+day+time;
}

//2018년 8월 23일 --->> 20180823 , 2018-08-23 등 특수문자 Split형식으로
function date_format_to_yyyymmdd(hanguldate, resultSplit){
    var result = '';
    var yyyy = '';
    var mm   = '';
    var dd   = '';
    if(hanguldate!='None'){
        var replaced =  hanguldate.replace(/년 |월 |일|:|_| /gi, '-').split('-');
        yyyy = String(replaced[0]);
        mm   = String(replaced[1]);
        dd   = String(replaced[2]);
        if(mm.length<2){
            mm = '0' + replaced[1];
        }
        if(dd.length<2){
            dd = '0' + replaced[2];
        }
        result = yyyy+resultSplit+mm+resultSplit+dd;
    }else{
        result = '.';
    }
    return result;
}


//20180511 을 2018-5-11, 2018/5/11 등 원하는 split
function date_format_yyyymmdd_to_split(yyyymmdd, resultSplit){
    if(String(yyyymmdd).length==8){
        var yyyy = yyyymmdd.substr(0,4);
        var mm = yyyymmdd.substr(4,2);
        var dd = yyyymmdd.substr(6,2);
        var result = yyyy+resultSplit+mm+resultSplit+dd;
    }
    return result;
}

//2018-05-11등을 2018.05.11, 2018/05/11 등 원하는 split
function date_format_yyyymmdd_to_yyyymmdd_split(yyyymmdd, resultSplit){
    var splitChar = yyyymmdd.substr(4,1);
    var yyyy = yyyymmdd.split(splitChar)[0];
    var mm = yyyymmdd.split(splitChar)[1];
    var dd = yyyymmdd.split(splitChar)[2];
    var result = yyyy+resultSplit+mm+resultSplit+dd;
    return result;
}

function date_format_yyyy_m_d_to_yyyymmdd(yyyy_m_d){
    var yyyy = String(yyyy_m_d.split('_')[0]);
    var mm = String(yyyy_m_d.split('_')[1]);
    var dd = String(yyyy_m_d.split('_')[2]);
    if(mm.length<2){
        mm = '0' + String(yyyy_m_d.split('_')[1]);
    }
    if(dd.length<2){
        dd = '0' + String(yyyy_m_d.split('_')[2]);
    }
    return yyyy+mm+dd;
}

//2018-05-11 을 2018-5-11
function date_format_yyyy_mm_dd_to_yyyy_m_d(yyyy_mm_dd, resultSplit){
    var splitChar = yyyy_mm_dd.substr(4, 1);
    var yyyy = String(yyyy_mm_dd.split(splitChar)[0]);
    var mm = Number(yyyy_mm_dd.split(splitChar)[1]);
    var dd = Number(yyyy_mm_dd.split(splitChar)[2]);

    return yyyy+resultSplit+mm+resultSplit+dd;
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

//10:00:00.000000 --> 오전 10시
function time_format_to_hangul(timedata){
    var time = timedata.split(':');
    var hour = Number(time[0]);
    var min = Number(time[1]);
    var hourText;
    if(hour>=12){
        if(hour==24){
            hourText = '오전';
            hour = 12;
        }else if(hour==12){
            hourText = "오후";
            hour = 12;
        }else{
            hourText = "오후";
            hour = hour-12;
        }
    }else{
        hourText = '오전';
    }
    if(min<10){
        min = '0'+min;
    }
    if(hour<10){
        hour = '0'+hour;
    }
    var hangul_time = hourText + ' ' + hour + '시 '+min+'분';

    return hangul_time;
}


//10:00:00.000000 --> 오전 10시
function time_format_to_hangul2(timedata){
    var time = timedata.split(':');
    var hour = Number(time[0]);
    var min = Number(time[1]);
    var hourText;
    if(hour>=12){
        if(hour==24){
            hourText = '오전';
            hour = 12;
        }else if(hour==12){
            hourText = "오후";
            hour = 12;
        }else{
            hourText = "오후";
            //hour = hour-12;
        }
    }else{
        hourText = '오전';
    }
    if(min<10){
        min = '0'+min;
    }
    if(hour<10){
        hour = '0'+hour;
    }
    var hangul_time = hourText + ' ' + hour + ':'+min;
    return hangul_time;
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


function time_h_format_to_hh(time){
    var result = String(time);
    if(String(time).length<2){
        result = '0' + String(time);
    }
    return result;
}

//2018년 3월 29일 3:00 오후 --> 2018년 3월 29일 오후 3:00
function db_datatimehangul_format_realign(dbhangul){
    var data = dbhangul.split(' ');
    var len = data.length;
    var realign = [];
    for(var i=0; i<len; i++){
        if(data[i].indexOf('년')!=-1){
            realign[0] = data[i];
        }else if(data[i].indexOf('월')!=-1){
            realign[1] = data[i];
        }else if(data[i].indexOf('일')!=-1){
            realign[2] = data[i];
        }else if(data[i].indexOf('오전')!=-1 || data[i].indexOf('오후')!=-1){
            realign[3] = data[i];
        }else if(data[i].indexOf(':')!=-1){
            realign[4] = data[i];
        }
    }
    return realign.join(' ');
}


function calc_duration_by_start_end(planStartDate, planStartTime, planEndDate, planEndTime){ //반복일정 요약에 진행시간 계산 (시작시간이랑 종료시간으로 구함)
    var lastDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];      //각 달의 일수
    if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
        lastDay[1] = 29;
    }else{
        lastDay[1] = 28;
    }


    var planYear    = Number(planStartDate.split('-')[0]);
    var planMonth   = Number(planStartDate.split('-')[1]);
    var planDate    = Number(planStartDate.split('-')[2]);
    var planHour    = Number(planStartTime.split(':')[0]);
    var planMinute  =        planStartTime.split(':')[1];

    var planEDate   = Number(planEndDate.split('-')[2]);
    var planEndHour = Number(planEndTime.split(':')[0]);
    var planEndMin  =        planEndTime.split(':')[1];
    var planDura = "0.5";
    if(Math.abs(Number(planEndMin) - Number(planMinute)) == 30){  //  01:30 ~ 02:00  01:00 ~ 01:30,,,, 01:00 ~ 05:30, 01:30 ~ 05:00
        if(planEndHour-planHour == 0){
            planDura = "0.5";
        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == -30 ){
            planDura = String((planEndHour-planHour-1))+'.5';
        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == 30){
            planDura = String((planEndHour-planHour))+'.5';
        }
    }else{
        planDura = planEndHour - planHour;
    }

    //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
    if(planEDate == planDate+1 && planEndHour==planHour){
        planDura = 24;
    }else if(planEDate == planDate+1 && planEndHour == 0){
        planDura = 24-planHour;
    }else if(planDate == lastDay[planMonth-1] && planEDate == 1 && planEndHour == 0){ //달넘어갈때 -23시 표기되던 문제
        planDura = 24-planHour;
    }

    return planDura;//시간단위로 아웃풋
}

function calc_duration_by_start_end_2(planStartDate, planStartTime, planEndDate, planEndTime){ //반복일정 요약에 진행시간 계산 (시작시간이랑 종료시간으로 구함) // 분단위로 아웃풋
    var lastDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];      //각 달의 일수
    if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
        lastDay[1] = 29;
    }else{
        lastDay[1] = 28;
    }

    var planYear    = Number(planStartDate.split('-')[0]);
    var planMonth   = Number(planStartDate.split('-')[1]);
    var planDate    = Number(planStartDate.split('-')[2]);
    var planHour    = Number(planStartTime.split(':')[0]);
    var planMinute  = Number(planStartTime.split(':')[1]);

    var planETime = planEndTime;
    if(planEndTime == "00:00:00"){
        planETime = "24:00";
    }
    var planEDate   = Number(planEndDate.split('-')[2]);
    var planEndHour = Number(planETime.split(':')[0]);
    var planEndMin  = Number(planETime.split(':')[1]);

    var duraMin = (planEndHour-planHour)*60 + (planEndMin-planMinute);

    // while(add_time(planStartTime.split(':')[0]+':'+planStartTime.split(':')[1], '00:0'+duraMin) != planETime.split(':')[0]+':'+planETime.split(':')[1]){
    //     duraMin++;
    //     if(duraMin > 1440){
    //         break;
    //     }
    // }

    return duraMin;
}

function duration_number_to_hangul(number){  // 0.5시간, 1.5시간, 1시간 --> 30분, 1시간 30분, 1시간
    if(number - parseInt(number) == 0.5){
        if(parseInt(number) != 0){
            number = parseInt(number)+'시간' + ' 30분';
        }else if(parseInt(number) == 0){
            number = '30분';
        }
    }else{
        number = number + '시간';
    }
    return number;
}

function duration_number_to_hangul_minute(minute){
    var nums_result;
    if(minute < 60){
        nums_result = minute + ' 분';
    }else if(minute%60 == 0){
        nums_result = minute/60+' 시간';
    }else { //125
        nums_result = parseInt(minute/60)+ ' 시간 '+ (minute-60*parseInt(minute/60)) + '분';
    }
    return nums_result;
}


function count_format_to_nnnn(rawData){
    if(rawData == '0'){
        return rawData;
    }
    var maxlen = String(rawData).length;
    var repeat =  4 - Number(maxlen);
    var data = rawData;
    for(var j=0; j<repeat; j++){
        data = '0'+data;
    }
    return data;
}

function count_format_to_nnnn_Array(rawDataArray){
    var maxlen = String(Math.max.apply(null, rawDataArray)).length;
    var result = [];
    for(var i=0; i<rawDataArray.length; i++){
        var repeat =  Number(maxlen)-Number(String(rawDataArray[i]).length);
        var data = rawDataArray[i];
        for(var j=0; j<repeat; j++){
            data = '0'+data;
        }
        result[i] = data;
    }
    return result;
}

function remove_front_zeros(rawData){
    var len = String(rawData).length;
    var raw = rawData;
    var result;
    if(rawData =='0'){
        return rawData;
    }else{
        for(var i=0; i<len; i++){
            if(raw.substr(i,1)!='0'){
                result = raw.substr(i,len);
                return result;
            }
        }
    }
}

function startTime_to_hangul(options_starttime){
    var type = options_starttime.split('-')[0];
    var time = options_starttime.split('-')[1];
    var type_text;
    var time_text;
    if(type == 'A'){
        type_text = '매 ';
        if(time == '0'){
            time_text = '정시에';
        }else{
            time_text = '시각 '+time+'분에';
        }
    }else if(type == "E"){
        type_text = '';
        time_text = time+'분 간격으로';
    }

    return type_text+time_text;
}


Array.prototype.insert = function(index, item){
    this.splice(index, 0, item);
};

/*/////////////////////일정 관련 공통 함수////////////////////////////////*/


function scrollToDom(dom){
    if(dom != undefined){
        var offset = dom.offset();
        if(offset != undefined){
            $('body, html').animate({scrollTop : offset.top-180}, 10);
        }
    }
}

function scrollToDom_custom(parentselector, dom){
    if($(dom) != undefined){
        var offset = $(dom).offset();
        if(offset != undefined){
            $(parentselector).animate({scrollTop : offset.top}, 10);
        }
    }
}

function disable_window_scroll(){
    if(bodywidth < 600){
       //$('#calendar').css('position', 'fixed');
       $('html, body').css({
                            "position": "relative"
                            });
    }else{
        $('body').css('overflow-y', 'hidden');
    }

    // $('body, #calendar').on('scroll touchmove mousewheel', function(e){
    //     e.preventDefault();
    //     e.stopPropagation();
    //     return false;
    // });
}

function enable_window_scroll(){
    if(bodywidth < 600){
       //$('#calendar').css('position','relative');
       $('html, body').css({
                            "position": "unset"
                            });
    }else{
        $('body').css('overflow-y', 'unset');
    }

    //$('body, #calendar').off('scroll touchmove mousewheel');
}

function sumarray(array){
    var result = 0;
    for(var i=0; i<array.length; i++){
        result = result+Number(array[i]);
    }
    return result;
}

//알림창에 얼마전에 뜬 알람인지 계산
function date_calculator(yyyy_mm_dd_hh_mm_ss){
    var yyyymmdd = Number(date_format_yyyy_m_d_to_yyyy_mm_dd(yyyy_mm_dd_hh_mm_ss.split(' ')[0], ''));
    var yyyy = Number(yyyy_mm_dd_hh_mm_ss.split(' ')[0].split('-')[0]);
    var mm = Number(yyyy_mm_dd_hh_mm_ss.split(' ')[0].split('-')[1]);
    var dd = Number(yyyy_mm_dd_hh_mm_ss.split(' ')[0].split('-')[2]);
    var hh = Number(yyyy_mm_dd_hh_mm_ss.split(' ')[1].split(':')[0]);
    var mms = Number(yyyy_mm_dd_hh_mm_ss.split(' ')[1].split(':')[1]);
    var today = Number(todayYYYYMMDD);
    var lastDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];      //각 달의 일수
    var message = '';
    if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
        lastDay[1] = 29;
    }else{
        lastDay[1] = 28;
    }
    if(todayYYYYMMDD - yyyymmdd >= 1){ // 하루이상 지났을 때
        if(currentYear - yyyy >= 1){
            message = (currentYear - yyyy) + ' 년 전';
        }else if(currentYear - yyyy == 0){
            if((currentMonth+1)-mm == 1){
                message = (lastDay[mm-1] - dd + currentDate) + '일 전';
            }else if((currentMonth+1)-mm > 1){
                message = ((currentMonth+1)-mm) + '달 전';
            }else if((currentMonth+1)-mm == 0){
                message = (currentDate - dd) + ' 일 전';
            }
        }
    }else if(todayYYYYMMDD - yyyymmdd == 0){ // 하루가 지나지 않았을 때
        if(currentHour - hh >= 1){
            message = (currentHour - hh) + ' 시간 전';
        }else if(currentHour - hh == 0){
            message = (currentMinute - mms) + ' 분 전';
        }
    }
    return message;
}
//

//알림창에 변동된 일정 정보를 알아보기 쉽게
function alarm_change_easy_read(data){ // data : 2018-04-11 02:00:00/2018-04-11 03:00:00
    var dateInfo = data.split(' ')[0];
    var startTime = Number(data.split(' ')[1].split(':')[0]);
    var endTime = Number(data.split(' ')[2].split(':')[0]);
    var timeDiff = endTime - startTime;
    return date_format_to_user_hangul(data.split('/')[0]) + ' ~ ' + data.split(' ')[2].substr(0, 5) + ' (' + timeDiff + ' 시간)';
}


///////////////////////////////////////////////////여기서부터 회원모드!!///////////////////////////////////////////////////
function get_trainee_participate_group(use, callback){
    $.ajax({
        url: '/trainee/get_trainee_group_ing_list/',
        //data: $('#pt-add-form').serialize(),
        dataType : 'html',
        type:'GET',

        beforeSend:function(){
            beforeSend();
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                if(use == "callback"){
                    callback(jsondata);
                }

                //ajaxClassTime();
                //close_reserve_popup()
            }

        },

        complete:function(){
            completeSend();
        },

        error:function(){
            console.log('server error');
        }
    });
}


///////////////////////////////////////////////////여기서부터 회원모드!!///////////////////////////////////////////////////




///////////////////////////////////////////////////AJAX 속도측정테스트 코드///////////////////////////////////////////////////
function TEST_CODE_FOR_AJAX_TIMER_starts(yourMessage){
    console.log('S************************************** Ajax Sending Start......'+yourMessage);
    var testtimer = 0;
    var testtime = setInterval(function(){
        testtimer = testtimer+0.5;
        // console.log('Waiting for receiving JSON Data......'+testtimer+'second from Request......'+yourMessage);
    },500);
    return {"func":testtime, "message":yourMessage};
}

function TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER){
    clearInterval(AJAXTESTTIMER["func"]);
    console.log('E************************************** Ajax Data Receiving COMPLETE.....JSON.parse() END......'+AJAXTESTTIMER["message"]);
}
///////////////////////////////////////////////////AJAX 속도측정테스트 코드///////////////////////////////////////////////////


var bodywidth = selector_body.width();
/*
$(window).resize(function(){
    bodywidth = window.innerWidth;
})
*/

if(class_background_img_url.length == 0){
    $('#ymdText, #upperImg').css('background-image',"url(/static/user/res/main/bg-image-basic-ymdText.png)");
}else{
    $('#ymdText, #upperImg').css('background-image',"url('"+class_background_img_url[2].replace(/\)/gi,"")+"')");
}

function numberWithCommas(x) { //천단위 콤마 찍기
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

set_drag_drop_action_to_DOM('#page-addplan');
set_drag_drop_action_to_DOM('#cal_popup_planinfo');
set_drag_drop_action_to_DOM('#cal_popup_plancheck');
set_drag_drop_action_to_DOM('#page_addmember');
set_drag_drop_action_to_DOM('#memberInfoPopup_PC');
///////////////skkim test//////////////////드래그앤 드랍 함수

function set_drag_drop_action_to_DOM(targetSelector){
    //if(bodywidth > 600 && (varUA.match('iphone') !=null && varUA.match('ipad')!=null && varUA.match('ipod')!=null && varUA.match('android') != null ) ){
    if(bodywidth >= 600 ){
        var click_state = 0;
        $(targetSelector).mousedown(function(event){
            //event.stopPropagation();
            click_state = 0;
            var click_time = setTimeout(function(){
                                                        var this_ori_top = Number($this.css('top').replace(/px/gi, ""));
                                                        var this_ori_left = Number($this.css('left').replace(/px/gi, ""));
                                                        click_state = 1;
                                                        $this.animate({
                                                                    "left": this_ori_left + 5 + "px",
                                                                    "top": this_ori_top - 5 + "px"
                                                        }, 70, function(){
                                                            $this.animate({
                                                                    "left": this_ori_left + "px",
                                                                    "top": this_ori_top + "px"
                                                            }, 70);
                                                            $this.css({'box-shadow':'1px 1px 20px 3px #fe4e65'});
                                                        });
                                                    }, 500);
            var $this = $(this);
            $this.mouseup(function(){
                $this.css({'box-shadow':'unset'});
                clearTimeout(click_time);
            });

            $this.mouseleave(function(){
                $this.css({'box-shadow':'unset'});
            });

            var thisOriX = $this.offset().left;
            var thisOriY = $this.offset().top;

            var oriX = event.pageX;
            var oriY = event.pageY;

            $(document).on('mousemove', 'body', function(e){
                if(click_state == 1){
                    e.stopPropagation();
                    var moveX = e.pageX;
                    var moveY = e.pageY;

                    var diffX = oriX - moveX;
                    var diffY = oriY - moveY;

                    var resultX = thisOriX - diffX;
                    var resultY = thisOriY - diffY;

                    if(Math.abs(diffX) > 10 || Math.abs(diffY) > 10){
                        $this.css({'box-shadow':'1px 1px 20px 3px #fe4e65'});
                    }

                    $(targetSelector).css({'top':resultY+'px', 'left':resultX+'px'});
                    $(document).on('mouseup click', 'body', function(){
                        $(document).off('mousemove');
                    });
                }
            });


            $(document).on('click mouseup',
                            targetSelector+ ' textarea,'+
                            targetSelector+ ' button,'+
                            targetSelector+ ' input,'+
                            targetSelector+ ' table,'+
                            targetSelector+ ' span,'+
                            targetSelector+ ' div,'+
                            targetSelector+ ' img,'+
                            targetSelector+ ' td,'+
                            targetSelector+ ' tr,'+
                            targetSelector+ ' p'
                            , function(){
                $(document).off('mousemove');
            });
            $(document).on('mousedown mousemove',
                            targetSelector+ ' canvas'
                            , function(){
                $(document).off('mousemove');
            });
        });
    }
}

//set_drag_drop_action_to_DOM_partial('#page-addplan',{grabHeight:'40px', grabWidth:'40px'});
//set_drag_drop_action_to_DOM_partial('#cal_popup_planinfo',{grabHeight:'40px', grabWidth:'40px'});
//set_drag_drop_action_to_DOM_partial('#cal_popup_plancheck',{grabHeight:'40px', grabWidth:'40px'});
function set_drag_drop_action_to_DOM_partial(targetSelector, options){
    var $target = $(targetSelector);
    var $drag_bar = $(targetSelector+' .drag_drop_target');
    set_hover_behavior_to_drag_drop_target('.drag_drop_target');

    if(options == undefined){
        var options = {
                        'grabHeight':'50px',
                        'grabWidth': '100%',
                        'grabZindex':'100',
                        'grabTop':'0',
                        'grabLeft':'0',
                        'grabPosition':'absolute'
                   };
    }else{
        if(options.grabPosition==undefined){
            options.grabPosition = 'absolute';
        }
        if(options.grabWidth==undefined)
            {options.grabWidth = '100%';
        }
        if(options.grabHeight==undefined)
            {options.grabHeight = '50px';
        }
        if(options.grabTop==undefined)
            {options.grabTop = '0';
        }
        if(options.grabLeft==undefined)
            {options.grabLeft = '0';
        }
        if(options.grabZindex==undefined)
            {options.grabZindex = '100';
        }
    }

    if(bodywidth >= 600){
        $(targetSelector).append('<div class="drag_drop_target" ' +
            'style="position:${options.grabPosition}; width:${options.grabWidth}; height:${options.grabHeight}; top:${options.grabTop}; left:${options.grabLeft}; z-index:${options.grabZindex}"> ' +
            '</div>');

        $(document).on('mousedown', targetSelector+' .drag_drop_target', function(event){
            $target.css({'box-shadow':'1px 1px 5px 1px #fe4e65'});

            $(document).on('mouseup', targetSelector+' .drag_drop_target', function(event){
                $target.css({'box-shadow':'unset'});
            });

            $(document).on('mouseleave', targetSelector+' .drag_drop_target', function(event){
                $target.css({'box-shadow':'unset'});
            });

            var thisOriX = $(this).offset().left;
            var thisOriY = $(this).offset().top;

            var oriX = event.pageX;
            var oriY = event.pageY;

            $(document).on('mousemove', 'body', function(e){
                var moveX = e.pageX;
                var moveY = e.pageY;

                var diffX = oriX - moveX;
                var diffY = oriY - moveY;

                var resultX;
                var resultY;

                var resultX = thisOriX - diffX;
                var resultY = thisOriY - diffY;

                $target.css({'top':resultY+'px','left':resultX+'px'});
                $(document).on('mouseup click', 'body', function(){
                    $(document).off('mousemove');
                });
            });
        });
    }
}

function set_hover_behavior_to_drag_drop_target(drag_drop_target){
    var $target = $(drag_drop_target);
    $(document).on('mouseover', drag_drop_target, function(){
        $(this).css({'background':'transparent', 'border':'1px solid #fe4e65'});
    });
    $(document).on('mouseout', drag_drop_target, function(){
        $(this).css({'background':'transparent', 'border-color':'transparent'});
    });
}

///////////////skkim test//////////////////드래그앤 드랍 함수


function clear_badge_counter(){
    $.ajax({
        url:'/login/clear_badge_counter/',
        type:'POST',
        //dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            //alert('before clear_badge_counter afsavf')
            console.log('before');
        },

        //통신성공시 처리
        success:function(){
            //alert('test')
            console.log('sucess');

        },

        //보내기후 팝업창 닫기
        complete:function(){

        },

        //통신 실패시 처리
        error:function(){
            console.log('error');
            //alert('error clear_badge_counter')
            //console.log('error:clear_badge_counter')
        }
    });
}

function update_push_token(token, device_id) {
    $.ajax({
        url:'/login/add_push_token/',
        type:'POST',
        data:{"token_info":token, "device_id":device_id},

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            //AjaxBeforeSend();
        },

        //통신성공시 처리
        success:function(){
            $('a.text-payment').parent('div').css('display', 'inline-block');
            if(device_id != 'pc') {
                // $('a.text-payment').parent('div').css('display', 'none');
                $('.ads_wrap').css('display', 'none');
                $('.sidebar_div_last2 a').attr('href', '/trainer/help_setting/').attr('target', '');
                // $('#paymentSetting').css('display', 'none');
                $('._company').css('display', 'none');
            }else{
                // $('a.text-payment').parent('div').css('display', 'inline-block');
            }
            console.log('토큰 등록 완료');
        },

        //보내기후 팝업창 닫기
        complete:function(){

        },

        //통신 실패시 처리
        error:function(){

        }
    });
}


function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function body_position_fixed_set(){
    if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null){
        $('html, body').addClass('bodyfixed');
    }
}
function body_position_fixed_unset(){
    if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null){
        $('html, body').removeClass('bodyfixed');
    }
}


//특수문자 입력 제한
function limit_char(e){
    //var limit =  /[\[\]~!@\#$%^&*\()\-=+_'|\:;\"\'\?.,/\\＠§※☆★○●◎◇◆□■△▲▽▼→←↑↓↔〓◁◀▷▶♤♠♡♥♧♣⊙◈▣◐◑▒▤▥▨▧▦▩♨☏☎☜☞¶†‡↕↗↙↖↘♭♩♪♬㉿㈜№㏇™㏂㏘℡]/gi;
    var limit =  /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]/gi; //\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55
    var temp = $(e).val();
    if(limit.test(temp)){
        $(e).val(temp.replace(limit, ""));
        alert("이름에 - 와 _ 를 제외한 특수문자는 입력하실 수 없습니다.");
    }
}

function limit_char_only_number(e){
    // var limit =  /[~!@\#$%^&*\()\-=+_'|\:;\"\'\?.,/\\]/gi;
    var limit =  /[^0-9\,]/gi;
    var temp = $(e).val();
    if(limit.test(temp)){
        $(e).val(temp.replace(limit, ""));
        alert("숫자만 입력하실 수 있습니다.");
    }
}

Array.prototype.insert = function(index, item){
    this.splice(index, 0, item);
};
