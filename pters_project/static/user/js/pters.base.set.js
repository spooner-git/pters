//플로팅 버튼 스크롤시 숨기기 Start
var ts;
$("body").bind("touchstart",function(e){
ts = e.originalEvent.touches[0].clientY;
});

$(document).on("touchend",'html',function(e){
  var te = e.originalEvent.changedTouches[0].clientY;
  if(ts>te+5 && $('#mshade').css('z-index')<0){
      downTouchEvent();
  }else if(ts<te-5){
      upTouchEvent();
  }
});
//플로팅 버튼 스크롤시 숨기기 End

function beforeSend(use, callback){
  if(use == "callback"){
    callback()
  }
  //$('html').css("cursor","wait");
  $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
  $('.ajaxloadingPC').css('display','block')
}

function completeSend(use, callback){
  if(use == "callback"){
    callback()
  }
  //$('html').css("cursor","auto");
  $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
  $('.ajaxloadingPC').css('display','none');
}

function upTouchEvent(){
    if($('#mshade').css('z-index')<0){
      $("#float_btn_wrap").show()
    }

}
function downTouchEvent(){
    $("#float_btn_wrap").fadeOut('fast')

}

function sideGoPage(page){
    //$('.ajaxloadingPC').show()
    location.href="/trainer/"+page+'/'
}

function shade_index(option){
    if($('body').width()>600){
      if(option<0){
        if($('#memberInfoPopup_PC').css('display')=="block" && $('._calmonth').css('display')=="block"){
          $('#pshade').css({'z-index':150,'display':'block'});
        }else{
          $('#pshade').css({'z-index':option,'display':'none'});
        }
        
      }else{
        $('#pshade').css({'z-index':option,'display':'block'});
      }
      
    }else if($('body').width()<=600){
      if(option<0){
        if($('#page-addplan').css('display') == 'block'){
          $('#mshade_popup').css({'z-index':$('#page-addplan').css('z-index'),'display':'none'});
        }else{
          $('#mshade_popup').css({'z-index':option,'display':'none'})
        }
        $('#mshade').css({'z-index':option,'display':'none'});
      }else{
        if($('#page-addplan').css('display') == 'block'){
          $('#mshade_popup').css({'z-index':$('#page-addplan').css('z-index'),'display':'block'});
        }
        if($('#float_btn_wrap').css('display')=='block' && !$('#float_btn').hasClass('rotate_btn')){
          $('#float_btn_wrap').hide()
        }
        if($('#memberInfoPopup').css('display')=='block'){
          $('#mshade_popup').css({'z-index':$('#memberInfoPopup').css('z-index'),'display':'block'});
        }
        if($('#cal_popup_planinfo').css('display')=="block"){
          $('#mshade_popup').css({'display':'none'});
        }
        //$('#mshade').css({'z-index':option,'display':'block'});
        $('#mshade').css({'display':'block'});
      }
    }
}

function close_info_popup(option){
  if(option=="cal_popup_planinfo"){
      $("#"+option).css({'display':'none'})
      $('#groupParticipants').html("")
      toggleGroupParticipantsList('off')
      if($('#pshade').css('z-index')==150 || $('#mshade').css('z-index') == 150){
        shade_index(100)
      }else{
        shade_index(-100)
      }
      //$('body').css('overflow-y','overlay');
  }
  else if(option =="cal_popup_plandelete"){
      $("#"+option).css({'display':'none'})
      console.log('1')
      if($('#pshade').css('z-index')== 200 || $('#mshade').css('z-index') == 200){
        shade_index(100)
      }else{
        shade_index(-100)
      }
      
      //$('body').css('overflow-y','overlay');
  }
  else if(option =="page-addplan"){
      $('#'+option).css('display','none')
      $('#calendar').css('position','relative')
      shade_index(-100)
  }
  else if(option =="cal_popup_repeatconfirm"){
      $('#'+option).css('display','none')
      //$('#calendar').css('position','relative')
      if($('#pshade').css('z-index') == 200 || $('#mshade').css('z-index') == 200){
        shade_index(100)
      }else{
        shade_index(-100)
      }
      if($('body').width()>=600){
          $('#calendar').css('position','relative')
      }else{
          //$('._calmonth').css({'height':'90%','position':'fixed'})
          //$('body').css('overflow-y','overlay');
      }
  }
  else if(option = "cal_popup_plancheck"){
      $('#'+option).css('display','none')
      shade_index(-100)
  }
}

var toggleGroupParticipants = 'off'
function toggleGroupParticipantsList(onoff){
  switch(onoff){
    case 'on':
      toggleGroupParticipants = 'on'
      $('#groupParticipants').animate({'height':'200px'},200)
      //$('#groupParticipants').css('height','200px')
      $('#popup_btn_viewGroupParticipants img').css('transform','rotate(180deg)')
      var group_id = $('#popup_btn_viewGroupParticipants').attr('data-groupid')
      var max = $('#popup_btn_viewGroupParticipants').attr('data-membernum')
      var group_schedule_id = $('#popup_btn_viewGroupParticipants').attr('group-schedule-id')
      $('#popup_btn_complete, #popup_btn_delete').addClass('disabled_button')
      get_group_plan_participants(group_schedule_id,'callback',function(jsondata){
        $('#popup_btn_complete, #popup_btn_delete').removeClass('disabled_button')
        draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id, max);
        completeSend();
      })
    break;
    case 'off':
      toggleGroupParticipants = 'off'
      $('#groupParticipants').animate({'height':0},200).html('')
      $('#popup_btn_viewGroupParticipants img').css('transform','rotate(0deg)')
    break;
  }
}


function shade1(option){
  if($('body').width()>600){
    $('#pshade').css({'display':option});  
  }else{
    $('#mshade').css({'display':option});
  }
}

function shade2(option){
  if($('body').width()>600){
    $('#pshade2').css({'display':option}); 
  }else{
    $('#mshade2').css({'display':option});
  }
}

function shade3(option){
  if($('body').width()>600){
    $('#pshade3').css({'display':option}); 
  }else{
    $('#mshade3').css({'display':option});
  }
}

$(document).ready(function(){

    var upText = "PTERS";
    var thisfilefullname = document.URL.substring(document.URL.lastIndexOf("/") + 1, document.URL.length);

     $("#outer_Sidenav").click(function(e){ // When any `div.container` is clicked
           closeNav(); //Sidebar가 열렸을때 회색 영역을 터치해도 Sidebar가 닫힘
      });



	 if($('meta[name="upperText"]').attr('content') == "main_trainer"){ //상단바에 텍스트 표시. 각 페이지의 Meta를 읽어와서 upperText를 셋팅
    //	 	  $('#uptext').text(upText[0]); //Main페이지에서는 Peters 표시
         $('#uptext').text(upText);
      $('.icon-bar').css('background-color','white');
      $('#uptext').css({'color':'#fe4e65','font-size':'16px'});
	 }else{
    //	  	$('#uptext').text(upText[1]); //그외의 페이지에서는 "이름"+코치님 일정 표기
	 };

   if(Options.language == "JPN"){
      $('.__todayplan').text("今日の日程")
      $('.__weekplan').text("日程表")
      $('.__monthplan').text("カレンダー")
      $('.__membermanage').text("会員管理")
      $('.__groupmanage').text("グループ管理")
      $('.__workmanage').text("業務管理")
      $('.__setting').text("設定")
      $('._nameAttach').text("様")
      //$('.pcwhere').text("PTERSトレーニングセンター")
      $('.pclogout').text("ログアウト")
      $('#uptext span').text("様のスケジュール")
      $('.__alarm').text("アラーム")
      $('.__calSelect').text("カレンダー選択")
      $('.__mypage').text("マイページ")
      $('.__help').text("お問い合わせ")

   }else if(Options.language == "ENG"){
      $('.__todayplan').text("Daily")
      $('.__weekplan').text("Schedule")
      $('.__monthplan').text("Calendar")
      $('.__membermanage').text("Members")
      $('.__groupmanage').text("Groups")
      $('.__workmanage').text("Work")
      $('.__setting').text("Settings")
      $('._nameAttach').text("")
      //$('.pcwhere').text("PTERS Traning Center")
      $('.pclogout').text("Logout")
      $('#uptext span').text("'s schedule")
      $('.__alarm').text("Alarm")
      $('.__calSelect').text("Change Cal.")
      $('.__mypage').text("My page")
      $('.__help').text("Help")

   }else if(Options.language == "KOR"){
      $('.__todayplan').text("오늘 일정")
      $('.__weekplan').text("주간 일정")
      $('.__monthplan').text("월간 일정")
      $('.__membermanage').text("회원 관리")
      $('.__groupmanage').text("그룹 관리")
      $('.__workmanage').text("업무 통계")
      $('.__setting').text("설정")
      $('._nameAttach').text("님")
      //$('.pcwhere').text("PTERS 트레이닝센터")
      $('.pclogout').text("로그아웃")
      $('#uptext span').text("님 일정")
      $('.__alarm').text("알림")
      $('.__calSelect').text("클래스 선택")
      $('.__mypage').text("마이페이지")
      $('.__help').text("이용문의")
   }

   /*
   $('.__alarm, #upbutton-alarm').click(function(){
      if($('#alarm-iframe').contents().find(".log_id_array").length == 0){
        $('#alarm_delete').hide()
      }else{
        $('#alarm_delete').show()
      }

      
      if($('body').width()>600){
          shade_index(100)
          $('#alarm').css('height','370px');
      }else{
          shade_index(100)
          $('#alarm').css('height','70%');
      }
      $('#alarm-iframe-div').html('<iframe id="alarm-iframe" src="/trainer/alarm/" width="540" height="305" frameborder="0"></iframe>');
   });
  */  
   $('#alarm button').click(function(){
      /*$('#alarm').css('transform','translate(-50%,-200%)');*/
      $('#alarm').css('height','0');
      if($('body').width()>600){
          shade_index(-100)
      }else{
          shade_index(-100)
      }
   });
});


$('#alarm_delete').click(function(){
    var alarm_size = $('#alarm-iframe').contents().find(".log_id_array").length;
    alert(alarm_size+'건의 알림을 삭제합니다.');
    $('#alarm-iframe').contents().find("#log_id_size").val(alarm_size);
    $('#alarm-iframe').contents().find("#alarm-delete-form").submit();

});

var date = new Date();
var currentYear = date.getFullYear(); //현재 년도
var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
var currentDate = date.getDate();
var currentHour = date.getHours();
var currentMinute = date.getMinutes()
var todayYYYYMMDD = Number(date_format_yyyy_m_d_to_yyyymmdd(currentYear+'_'+(currentMonth+1)+'_'+currentDate))
var multiLanguage = { 'KOR':
                      {'DD':'매일', 'WW':'매주', '2W':'격주',
                       'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일',
                       "WeekSmpl":['일','월','화','수','목','금','토']
                      },
                      'JPN':
                      {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                       'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日',
                       "WeekSmpl":['日','月','火','水','木','金','土']
                      },
                      'ENG':
                      {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                       'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat',
                       "WeekSmpl":['Sun','Mon','Tue','Wed','Ths','Fri','Sat']
                      },
                     }

//데이트가 2018-08-23 혹은 20180823 혹은 2018_08_23 혹은 2018-8-23 으로 들어왔을때 2018년 8월 23일 로 출력
function date_format_to_hangul(yyyymmdd){
      var date = yyyymmdd
      if(date.split('-').length==3){ //2018-08-23 or 2018-8-23
         var hangul_year = date.split('-')[0]
         var hangul_month = date.split('-')[1]
         var hangul_date = date.split('-')[2]
         if(hangul_month.substr(0,1) == '0' && hangul_month.length == 2){
            var hangul_month = hangul_month.substr(1,2)
         }
         if(hangul_date.substr(0,1) == '0' && hangul_date.length == 2){
            var hangul_date = hangul_date.substr(1,2)
         }
         var hangul_result = hangul_year +'년 ' + hangul_month +'월 '+ hangul_date + '일'

      }else if(date.split('_').length==3){ //2018_08_23 or 2018_8_23
         var hangul_year = date.split('_')[0]
         var hangul_month = date.split('_')[1]
         var hangul_date = date.split('_')[2]
         if(hangul_month.substr(0,1) == '0' && hangul_month.length == 2){
            var hangul_month = hangul_month.substr(1,2)
         }
         if(hangul_date.substr(0,1) == '0' && hangul_date.length == 2){
            var hangul_date = hangul_date.substr(1,2)
         }
         var hangul_result = hangul_year +'년 ' + hangul_month +'월 '+ hangul_date + '일'

      }else if(date.split('-').length==1 && date.length == 8){ //20180823
         var hangul_year = date.substr(0,4)
         var hangul_month = date.substr(4,2)
         var hangul_date = date.substr(6,2)
         
         if(hangul_month.substr(0,1) == '0' && hangul_month.length == 2){
            var hangul_month = hangul_month.substr(1,2)
         }
         if(hangul_date.substr(0,1) == '0' && hangul_date.length == 2){
            var hangul_date = hangul_date.substr(1,2)
         }
         var hangul_result = hangul_year +'년 ' + hangul_month +'월 '+ hangul_date + '일'
      }
      return hangul_result
}

//데이트가 2018-08-23 10:00:00 을 2018년 8월 23일(수) 10:00
function date_format_to_user_hangul(yyyy_mm_dd, minimize){
  if(minimize!=undefined){
    var dates = yyyy_mm_dd.split(' ')[0].split('-')[0]+'-'+Number(yyyy_mm_dd.split(' ')[0].split('-')[1])+'-'+Number(yyyy_mm_dd.split(' ')[0].split('-')[2])
    var day =  ' ('+multiLanguage[Options.language].WeekSmpl[new Date(yyyy_mm_dd.split(' ')[0]).getDay()]+') '
    var time = Number(yyyy_mm_dd.split(' ')[1].substr(0,2))+'시'
  }else{
    var dates = yyyy_mm_dd.split(' ')[0].split('-')[0]+'년 '+Number(yyyy_mm_dd.split(' ')[0].split('-')[1])+'월 '+Number(yyyy_mm_dd.split(' ')[0].split('-')[2])+'일'
    var day =  ' ('+multiLanguage[Options.language].WeekSmpl[new Date(yyyy_mm_dd.split(' ')[0]).getDay()]+') '
    var time = yyyy_mm_dd.split(' ')[1].substr(0,5)
  }
  
  return dates+day+time
}

//2018년 8월 23일 --->> 20180823 , 2018-08-23 등 특수문자 Split형식으로
function date_format_to_yyyymmdd(hanguldate, resultSplit){  
  if(hanguldate!='None'){
    var replaced =  hanguldate.replace(/년 |월 |일|:|_| /gi,'-').split('-')
    var yyyy = String(replaced[0])
    var mm   = String(replaced[1])
    var dd   = String(replaced[2])
    if(mm.length<2){
      var mm = '0' + replaced[1]
    }
    if(dd.length<2){
      var dd = '0' + replaced[2]
    }
    var result = yyyy+resultSplit+mm+resultSplit+dd
  }else{
    var result = '.'
  }
  return result
}


//20180511 을 2018-5-11, 2018/5/11 등 원하는 split
function date_format_yyyymmdd_to_split(yyyymmdd,resultSplit){
  if(String(yyyymmdd).length==8){
    var yyyy = yyyymmdd.substr(0,4)
    var mm = yyyymmdd.substr(4,2)
    var dd = yyyymmdd.substr(6,2)
    var result = yyyy+resultSplit+mm+resultSplit+dd
  }
  return result
}

//2018-05-11등을 2018.05.11, 2018/05/11 등 원하는 split
function date_format_yyyymmdd_to_yyyymmdd_split(yyyymmdd,resultSplit){
    var splitChar = yyyymmdd.substr(4,1)
    var yyyy = yyyymmdd.split(splitChar)[0]
    var mm = yyyymmdd.split(splitChar)[1]
    var dd = yyyymmdd.split(splitChar)[2]
    var result = yyyy+resultSplit+mm+resultSplit+dd
    return result
}

function date_format_yyyy_m_d_to_yyyymmdd(yyyy_m_d){
    var yyyy = String(yyyy_m_d.split('_')[0])
    var mm = String(yyyy_m_d.split('_')[1])
    var dd = String(yyyy_m_d.split('_')[2])
    if(mm.length<2){
      var mm = '0' + String(yyyy_m_d.split('_')[1])
    }
    if(dd.length<2){
      var dd = '0' + String(yyyy_m_d.split('_')[2])
    }
    return yyyy+mm+dd
}

//2018-05-11 을 2018-5-11
function date_format_yyyy_mm_dd_to_yyyy_m_d(yyyy_mm_dd, resultSplit){
    var splitChar = yyyy_mm_dd.substr(4,1)
    var yyyy = String(yyyy_mm_dd.split(splitChar)[0])
    var mm = Number(yyyy_mm_dd.split(splitChar)[1])
    var dd = Number(yyyy_mm_dd.split(splitChar)[2])

    return yyyy+resultSplit+mm+resultSplit+dd
}



function date_format_yyyy_m_d_to_yyyy_mm_dd(yyyy_m_d,resultSplit){
    if(yyyy_m_d.split('-').length == 3){
      var yyyy = String(yyyy_m_d.split('-')[0])
      var mm = String(yyyy_m_d.split('-')[1])
      var dd = String(yyyy_m_d.split('-')[2])
    }else if(yyyy_m_d.split('_').length == 3){
      var yyyy = String(yyyy_m_d.split('_')[0])
      var mm = String(yyyy_m_d.split('_')[1])
      var dd = String(yyyy_m_d.split('_')[2])
    }

    if(mm.length<2){
      var mm = '0' + mm
    }
    if(dd.length<2){
      var dd = '0' + dd
    }
    return yyyy+resultSplit+mm+resultSplit+dd
}

//10:00:00.000000 --> 오전 10시
function time_format_to_hangul(timedata){
   var time = timedata.split(':')
   var hour = Number(time[0])
   var min = Number(time[1])
   var hourText;
   if(hour>=12){
      if(hour==24){
         var hourText = '오전'
         var hour = 12
      }else if(hour==12){
         var hourText = "오후"
         var hour = 12
      }else{
         var hourText = "오후"
         var hour = hour-12   
      }
   }else{
      var hourText = '오전'
   }

   return hangul_time = hourText + ' ' + hour + '시'
}

function time_h_format_to_hh(time){
  var result = String(time)
  if(String(time).length<2){
    var result = '0' + String(time)
  }
  return result
}

//2018년 3월 29일 3:00 오후 --> 2018년 3월 29일 오후 3:00 
function db_datatimehangul_format_realign(dbhangul){
   var data = dbhangul.split(' ')
   var len = data.length
   var realign = []
   for(var i=0; i<len; i++){
      if(data[i].indexOf('년')!=-1){
         realign[0] = data[i]
      }else if(data[i].indexOf('월')!=-1){
         realign[1] = data[i]
      }else if(data[i].indexOf('일')!=-1){
         realign[2] = data[i]
      }else if(data[i].indexOf('오전')!=-1 || data[i].indexOf('오후')!=-1){
         realign[3] = data[i]
      }else if(data[i].indexOf(':')!=-1){
         realign[4] = data[i]
      }
   }
   return realign.join(' ')
}


function calc_duration_by_start_end(planStartDate, planStartTime, planEndDate, planEndTime){ //반복일정 요약에 진행시간 계산 (시작시간이랑 종료시간으로 구함)
    var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31];      //각 달의 일수
    if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
      lastDay[1] = 29;
    }else{
      lastDay[1] = 28;
    };


    var planYear    = Number(planStartDate.split('-')[0])
    var planMonth   = Number(planStartDate.split('-')[1])
    var planDate    = Number(planStartDate.split('-')[2])
    var planHour    = Number(planStartTime.split(':')[0])
    var planMinute  =        planStartTime.split(':')[1]

    var planEDate   = Number(planEndDate.split('-')[2]) 
    var planEndHour = Number(planEndTime.split(':')[0])
    var planEndMin  =        planEndTime.split(':')[1]

    if(Math.abs(Number(planEndMin) - Number(planMinute)) == 30){  //  01:30 ~ 02:00  01:00 ~ 01:30,,,, 01:00 ~ 05:30, 01:30 ~ 05:00 
        if(planEndHour-planHour == 0){
          var planDura = "0.5"
        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == -30 ){
          var planDura = String((planEndHour-planHour-1))+'.5'
        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == 30){
          var planDura = String((planEndHour-planHour))+'.5'
        }
    }else{
      var planDura = planEndHour - planHour;
    }
    
    //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
    if(planEDate == planDate+1 && planEndHour==planHour){
      var planDura = 24
    }else if(planEDate == planDate+1 && planEndHour == 0){
      var planDura = 24-planHour
    }else if(planDate == lastDay[planMonth-1] && planEDate == 1 && planEndHour == 0){ //달넘어갈때 -23시 표기되던 문제
      var planDura = 24-planHour
    }
    
    /*
    if(planMinute == '00'){
      if(Options.workStartTime>planHour && planDura > Options.workStartTime - planHour){
        
        var planDura = planDura - (Options.workStartTime - planHour) // 2 - (10 - 8)
        var planHour = Options.workStartTime
         //2018_4_22_8_30_2_OFF_10_30 
      }
    }else if(planMinute == '30'){
        //(10>8)  (2>=10-8)
      if(Options.workStartTime>planHour && planDura >= Options.workStartTime - planHour){
        
        var planDura = planDura - (Options.workStartTime - planHour)+0.5 // 2 - (10 - 8)
        var planHour = Options.workStartTime
        var planMinute = '00'
         //2018_4_22_8_30_2_OFF_10_30 
      }
    }
    */

    return planDura
}

function duration_number_to_hangul(number){  // 0.5시간, 1.5시간, 1시간 --> 30분, 1시간 30분, 1시간
  if(number - parseInt(number) == 0.5){
      if(parseInt(number) != 0){
          var number = parseInt(number)+'시간' + ' 30분'
      }else if(parseInt(number) == 0){
          var number = '30분'
      }
  }else{
      var number = number + '시간'
  }
  return number
}


function count_format_to_nnnn(rawData){
  if(rawData == '0'){
    return rawData
  }
  var maxlen = String(rawData).length
  var repeat =  4 - Number(maxlen)
  var data = rawData
  for(var j=0; j<repeat; j++){
    var data = '0'+data
  }
  return data
}

function count_format_to_nnnn_Array(rawDataArray){
  var maxlen = String(Math.max.apply(null, rawDataArray)).length
  var result = []
  for(var i=0;i<rawDataArray.length ;i++){
    var repeat =  Number(maxlen)-Number(String(rawDataArray[i]).length)
    var data = rawDataArray[i]
    for(var j=0; j<repeat; j++){
      var data = '0'+data
    }
    result[i] = data
  }
  return result
}

function remove_front_zeros(rawData){
    var len = String(rawData).length;
    var raw = rawData
    var result;
    if(rawData =='0'){
      return rawData
    }else{
      for(var i=0; i<len; i++){
        if(raw.substr(i,1)!='0'){
          var result = raw.substr(i,len)
          return result
        }
      }
    }
}

/*/////////////////////일정 관련 공통 함수////////////////////////////////*/


/*
function DBdataProcess(startarray,endarray,result,option,result2){ //result2는 option이 member일때만 사용
    //DB데이터 가공
    var classTimeLength = startarray.length
    var startlength = startarray.length;
    var endlength = endarray.length;
    var resultarray = []

    for(i=0;i<classTimeLength; i++){
      var start = startarray[i].replace(/년 |월 |일 |:| /gi,"_");
      var end = endarray[i].replace(/년 |월 |일 |:| /gi,"_");
      var startSplitArray= start.split("_"); 
      var endSplitArray = end.split("_");
      //["2017", "10", "7", "6", "00", "오전"]
 
      if(startSplitArray[5]=="오후" && startSplitArray[3]!=12){
        startSplitArray[3] = String(Number(startSplitArray[3])+12);
      }

      if(endSplitArray[5]=="오후" && endSplitArray[3]!=12){
        endSplitArray[3] = String(Number(endSplitArray[3])+12); 
      }

      if(startSplitArray[5]=="오전" && startSplitArray[3]==12){
        startSplitArray[3] = String(Number(startSplitArray[3])+12); 
      }

      if(endSplitArray[5]=="오전" && endSplitArray[3]==12){
        endSplitArray[3] = String(Number(endSplitArray[3])+12); 
      }
      
      var dura = endSplitArray[3] - startSplitArray[3];  //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
      if(dura>0){
        startSplitArray[5] = String(dura) 
      }else{
        startSplitArray[5] = String(dura+24)
      }

      if(option=="class"){
        startSplitArray.push(classTimeArray_member_name[i]) 
        result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+startSplitArray[6]+"_"+endSplitArray[3]+"_"+endSplitArray[4]);
      }else if(option=="off"){
        startSplitArray.push(classTimeArray_member_name[i]) 
        result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+"OFF"+"_"+endSplitArray[3]+"_"+endSplitArray[4]);   
      }else if(option=="member"){
        result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]);    
        result2.push(startSplitArray[3]+":"+startSplitArray[4]);
      }else if(option=="graph"){
          var mm = startSplitArray[1]
          var dd = startSplitArray[2]
          if(mm.length<2){
            var mm = '0'+startSplitArray[1]
          }
          if(dd.length<2){
            var dd = '0'+startSplitArray[2]
          }
          result.push(startSplitArray[0]+"-"+mm+"-"+dd); //2017_10_7
          result2.push(startSplitArray[3]+"_"+startSplitArray[4] +"_"+ startSplitArray[5]); //6_00_2  
      }
    }
}
*/

/*
function DBdataProcess(startarray,endarray,result,option,result2){ //result2는 option이 member일때만 사용
    //DB데이터 가공
    var classTimeLength = startarray.length
    var startlength = startarray.length;
    var endlength = endarray.length;
    var resultarray = []

    //2018-08-15 09:00:00
    for(i=0;i<classTimeLength; i++){
      if(startarray[i].split(' ').length>1){
          var sdate = startarray[i].split(' ')[0].split('-')
          var stime = startarray[i].split(' ')[1].split(':')
      }else{
          var sdate = startarray[i].split(' ')[0].split('-')
          var stime = ''
      }

      if(endarray[i].split(' ').length>1){
          var edate = endarray[i].split(' ')[0].split('-')
          var etime = endarray[i].split(' ')[1].split(':')
      }else{
          var edate = endarray[i].split(' ')[0].split('-')
          var etime = ''
      }

      var sYear = Number(sdate[0])
      var sMonth = Number(sdate[1])
      var sDate = Number(sdate[2])
      var sHour = Number(stime[0])
      var sMinute = stime[1]

      var eYeat = Number(edate[0])
      var eMonth = Number(edate[1])
      var eDate = Number(edate[2])
      var eHour = Number(etime[0])
      var eMinute = etime[1]
      

      //["2017", "10", "7", "6", "00", "오전"]

      if(Math.abs(etime[1] - stime[1]) == 30){  //  01:30 ~ 02:00  01:00 ~ 01:30,,,, 01:00 ~ 05:30, 01:30 ~ 05:00 
          if(etime[0]-stime[0] == 0){
            var dura = "0.5"
          }else if(etime[0] > stime[0] && etime[1]-stime[1] == -30 ){
            var dura = String((etime[0]-stime[0]-1))+'.5'
          }else if(etime[0] > stime[0] && etime[1]-stime[1] == 30){
            var dura = String((etime[0]-stime[0]))+'.5'
          }
      }else{
        var dura = etime[0] - stime[0];
      }
      
      //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
      if(eDate == sDate+1 && eHour==sHour){
        var dura = 24
      }else if(eDate == sDate+1 && eHour == 0){
        var dura = 24-sHour
      }else if(sDate == lastDay[sMonth-1] && eDate == 1 && eHour == 0){ //달넘어갈때 -23시 표기되던 문제
        var dura = 24-sHour
      }

      if(option=="class"){
        result.push(sYear+"_"+sMonth+"_"+sDate+"_"+sHour+"_"+sMinute+"_"+dura+"_"+classTimeArray_member_name[i]+"_"+eHour+"_"+eMinute);
      }else if(option=="off"){
        result.push(sYear+"_"+sMonth+"_"+sDate+"_"+sHour+"_"+sMinute+"_"+dura+"_"+"OFF"+"_"+eHour+"_"+eMinute);   
      }else if(option=="member"){
        result.push(sYear+'_'+sMonth+'_'+sDate);    
        result2.push(sHour+":"+sMinute);
      }else if(option=="graph"){
          result.push(sYear+"-"+sMonth+"-"+sDate); //2017_10_7
          result2.push(sHour+"_"+sMinute +"_"+ dura); //6_00_2  
      }
    }
}
*/

function show_ajax_error_message(){

}

function hide_ajax_error_message(){
  
}

function scrollToDom(dom){
    var offset = dom.offset();
    if(offset != undefined){
      $('body, html').animate({scrollTop : offset.top-180},10)
    }
}


//알림창에 얼마전에 뜬 알람인지 계산
function date_calculator(yyyy_mm_dd_hh_mm_ss){
    var yyyymmdd = Number(date_format_yyyy_m_d_to_yyyy_mm_dd(yyyy_mm_dd_hh_mm_ss.split(' ')[0],''))
    var yyyy = Number(yyyy_mm_dd_hh_mm_ss.split(' ')[0].split('-')[0])
    var mm = Number(yyyy_mm_dd_hh_mm_ss.split(' ')[0].split('-')[1])
    var dd = Number(yyyy_mm_dd_hh_mm_ss.split(' ')[0].split('-')[2])
    var hh = Number(yyyy_mm_dd_hh_mm_ss.split(' ')[1].split(':')[0])
    var mms = Number(yyyy_mm_dd_hh_mm_ss.split(' ')[1].split(':')[1])
    var today = Number(todayYYYYMMDD)

    var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31];      //각 달의 일수
    if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
        lastDay[1] = 29;
    }else{
        lastDay[1] = 28;
    };
    if(todayYYYYMMDD - yyyymmdd >= 1){ // 하루이상 지났을 때
        if(currentYear - yyyy >= 1){
            var message = (currentYear - yyyy) + ' 년 전'
        }else if(currentYear - yyyy == 0){
            if((currentMonth+1)-mm == 1){
                var message = (lastDay[mm-1] - dd + currentDate) + '일 전'
            }else if((currentMonth+1)-mm > 1){
                var message = ((currentMont+1)-mm) + '달 전'
            }else if((currentMonth+1)-mm == 0){
                var message = (currentDate - dd) + ' 일 전'
            }
        }
    }else if(todayYYYYMMDD - yyyymmdd == 0){ // 하루가 지나지 않았을 때
        if(currentHour - hh >= 1){
            var message = (currentHour - hh) + ' 시간 전'
        }else if(currentHour - hh == 0){
            var message = (currentMinute - mms) + ' 분 전'
        }
    }
    return message
}
//

//알림창에 변동된 일정 정보를 알아보기 쉽게
function alarm_change_easy_read(data){ // data : 2018-04-11 02:00:00/2018-04-11 03:00:00
  var dateInfo = data.split(' ')[0]
  var startTime = Number(data.split(' ')[1].split(':')[0])
  var endTime = Number(data.split(' ')[2].split(':')[0])
  var timeDiff = endTime - startTime
  var result = date_format_to_user_hangul(data.split('/')[0])+ ' ~ ' + data.split(' ')[2].substr(0,5) + ' (' +timeDiff+' 시간)' 
  return result
}






///////////////////////////////////////////////////여기서부터 회원모드!!///////////////////////////////////////////////////
function get_trainee_participate_group(use, callback){
  $.ajax({
        url: '/trainee/get_trainee_group_ing_list/',
        //data: $('#pt-add-form').serialize(),
    dataType : 'html',
    //type:'POST',

        beforeSend:function(){
          beforeSend();
        },

        success:function(data){
          var jsondata = JSON.parse(data);
          console.log('get_trainee_group_ing_list',jsondata)
          if(jsondata.messageArray.length>0){
              $('#errorMessageBar').show()
              $('#errorMessageText').text(jsondata.messageArray)
          }else{
            if(use == "callback"){
              callback(jsondata)
            }

            //ajaxClassTime();
            //close_reserve_popup()
          }
          
    },

        complete:function(){
          completeSend()
        },

        error:function(){
          console.log('server error')
        }
    })
}


///////////////////////////////////////////////////여기서부터 회원모드!!///////////////////////////////////////////////////




///////////////////////////////////////////////////AJAX 속도측정테스트 코드///////////////////////////////////////////////////
function TEST_CODE_FOR_AJAX_TIMER_starts(yourMessage){
  console.log('S************************************** Ajax Sending Start......'+yourMessage)
  var testtimer = 0
  var testtime = setInterval(function(){
            testtimer = testtimer+0.5
            console.log('Waiting for receiving JSON Data......'+testtimer+'second from Request......'+yourMessage)
          },500)
  return {"func":testtime, "message":yourMessage}
}

function TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER){
  clearInterval(AJAXTESTTIMER["func"])
  console.log('E************************************** Ajax Data Receiving COMPLETE.....JSON.parse() END......'+AJAXTESTTIMER["message"])
}
///////////////////////////////////////////////////AJAX 속도측정테스트 코드///////////////////////////////////////////////////
