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
      $('.__workmanage').text("業務管理")
      $('.__setting').text("設定")
      $('.pcwho span').text("様")
      $('.pcwhere').text("PTERSトレーニングセンター")
      $('.pclogout').text("ログアウト")
      $('#uptext span').text("様のスケジュール")
      $('.__alarm').text("アラーム")
      $('.__calSelect').text("カレンダー選択")
      $('.__mypage').text("マイページ")

   }else if(Options.language == "ENG"){
      $('.__todayplan').text("Daily")
      $('.__weekplan').text("Schedule")
      $('.__monthplan').text("Calendar")
      $('.__membermanage').text("Members")
      $('.__workmanage').text("Work")
      $('.__setting').text("Settings")
      $('.pcwho span').text("")
      $('.pcwhere').text("PTERS Traning Center")
      $('.pclogout').text("Logout")
      $('#uptext span').text("'s schedule")
      $('.__alarm').text("Alarm")
      $('.__calSelect').text("Change Cal.")
      $('.__mypage').text("My page")

   }else if(Options.language == "KOR"){
      $('.__todayplan').text("오늘 일정")
      $('.__weekplan').text("주간 일정")
      $('.__monthplan').text("월간 일정")
      $('.__membermanage').text("회원 관리")
      $('.__workmanage').text("업무 통계")
      $('.__setting').text("서비스 설정")
      $('.pcwho span').text("님")
      $('.pcwhere').text("PTERS 트레이닝센터")
      $('.pclogout').text("로그아웃")
      $('#uptext span').text("코치님 일정")
      $('.__alarm').text("알림")
      $('.__calSelect').text("강의관리")
      $('.__mypage').text("마이페이지")
   }


   $('.__alarm').click(function(){
      $('#alarm').css('transform','translate(-50%,0%)')
      $('#shade3').css('display','block')
   })

   $('#alarm button').click(function(){
      $('#alarm').css('transform','translate(-50%,-200%)')
      $('#shade3').css('display','none')
   })





});

var date = new Date();
var currentYear = date.getFullYear(); //현재 년도
var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11


//데이트가 2018-08-23 혹은 20180823 혹은 2018_08_23 혹은 2018-8-23 으로 들어왔을때 2018년 8월 23일 로 출력
function date_format_to_hangul(yyyymmdd){   
      console.log(yyyymmdd)
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

function date_format_yyyymmdd_to_split(yyyymmdd,resultSplit){
  if(String(yyyymmdd).length==8){
    var yyyy = yyyymmdd.substr(0,4)
    var mm = yyyymmdd.substr(4,2)
    var dd = yyyymmdd.substr(6,2)
    var result = yyyy+resultSplit+mm+resultSplit+dd
  }
  return result
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


function scrollToDom(dom){
    var offset = dom.offset();
    $('body, html').animate({scrollTop : offset.top-180},10)
}















