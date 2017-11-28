/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/

$(document).ready(function(){

	var date = new Date();
	var currentYear = date.getFullYear(); //현재 년도
	var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
	var currentDate = date.getDate(); //오늘 날짜
	var currentHour = date.getHours(); //현재시간
	var lastDay = new Array(31,28,31,30,31,30,31,31,30,31,30,31);      //각 달의 일수
	var currentPageMonth = currentMonth+1; //현재 달
	var date2 = new Date();
	var oriYear = date.getFullYear();
	var oriMonth = date.getMonth()+1;
	var oriDate = date.getDate();

	var notAvailableStartTime = 22; //강사가 설정한 예약불가 시간 (시작)
	var notAvailableEndTime = 8; //강사가 설정한 예약불가 시간 (종료)

	//플로팅 버튼
	$('#float_btn').click(function(){
		/*if($('#shade').css('z-index')<0){
			$('#shade').css({'background-color':'black','z-index':'8'});
			$('#float_inner1').animate({'opacity':'0.7','bottom':'85px'},120);
			$('#float_inner2').animate({'opacity':'0.7','bottom':'145px'},120);
			$('#float_btn').addClass('rotate_btn');
		}else{
			$('#shade').css({'background-color':'white','z-index':'-1'});
			$('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
			$('#float_btn').removeClass('rotate_btn');
		}*/
	});
	//플로팅 버튼

	$(document).on('click','.admonth',function(){
		alert('까꿍~')
	})

	$(document).on('click','td',function(){   //날짜에 클릭 이벤트 생성
		if($(this).hasClass('available')){
			if($(this).find('div').hasClass('dateMytime')){
				$("#cal_popup").fadeIn('fast').css({'z-index':'103'});
				$('#shade2').css({'display':'block'});
				console.log($(this).attr('schedule-id'));
				var info = $(this).attr('data-date').split('_')
				var info2 = $(this).find(".blackballoon").text().split(':')
				var yy=info[0]
				var mm=info[1]
				var dd=info[2]
				var dayobj = new Date(yy,mm-1,dd)
				var dayraw = dayobj.getDay();
				var dayarry = ['일','월','화','수','목','금','토']
				var day = dayarry[dayraw];
				var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')'
				var infoText2 = info2[0]+"시 취소 하시겠습니까?"
				$('#popup_info').text(infoText)
				$('#popup_info2').text(infoText2)
				$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
			}else{
				$('#addpopup').fadeIn('fast').css({'z-index':'103'})
				$('#shade2').css({'display':'block'});
				var info3 = $(this).attr('data-date').split('_')
				var yy=info3[0]
				var mm=info3[1]
				var dd=info3[2]
				var dayobj = new Date(yy,mm-1,dd)
				var dayraw = dayobj.getDay();
				var dayarry = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
				var day = dayarry[dayraw];
				var infoText2 = yy+'년 '+ mm+'월 '+ dd+'일 ' + day
				$('#popup_info4').text(infoText2);
				console.log($('#popup_info4').text())
				timeGraphSet("class","grey");  //시간 테이블 채우기
		        timeGraphSet("off","grey")
		        startTimeSet();  //일정등록 가능한 시작시간 리스트 채우기
				$('#id_training_date').val(yy+'-'+mm+'-'+dd);
			}
		}else if($(this).hasClass('notavailable') && !$(this).find('div').hasClass('dateMytime')){
			$('#shade2').css({'display':'block'});
			$('#ng_popup_text').html('<p>현재시간은 일정 예약이 불가한 시간입니다.</p><p style="color:#fe4e65;font-size=13px;">예약불가 시간대<br> '+notAvailableStartTime+'시 ~ '+notAvailableEndTime+'시</p>')
			$('#ng_popup').fadeIn(500,function(){ // 팝업[일정은 오늘 날짜 기준 2주앞만 설정 가능합니다.]
			//$(this).fadeOut(5000)
			})
		}else if($(this).hasClass('notavailable') && $(this).find('div').hasClass('dateMytime')){
			$("#cal_popup").fadeIn('fast').css({'z-index':'103'});
			$('#shade2').css({'display':'block'});
			console.log($(this).attr('schedule-id'));
			var info = $(this).attr('data-date').split('_')
			var info2 = $(this).find(".blackballoon").text().split(':')
			var yy=info[0]
			var mm=info[1]
			var dd=info[2]
			var dayobj = new Date(yy,mm-1,dd)
			var dayraw = dayobj.getDay();
			var dayarry = ['일','월','화','수','목','금','토']
			var day = dayarry[dayraw];
			var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')'
			var infoText2 = info2[0]+"시 취소 하시겠습니까?"
			$('#popup_info').text(infoText)
			$('#popup_info2').text(infoText2)
			$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
		}else{
			$('#shade2').css({'display':'block'});
			$('#ng_popup_text').html('<p>일정은 오늘 날짜 기준</p><p>2주앞만 설정 가능합니다.</p>')
			$('#ng_popup').fadeIn(500,function(){ // 팝업[일정은 오늘 날짜 기준 2주앞만 설정 가능합니다.]
			//$(this).fadeOut(2800)
			})
		}
	})

	$("#popup_text1").click(function(){  //일정 삭제 버튼 클릭
				//PT 일정 삭제시
				$("#cal_popup").hide().css({'z-index':'-2'})
				$("#cal_popup3").fadeIn('fast').css({'z-index':'103'});
				$('#shade2').css({'display':'block'});
				//var info2 = $(this).attr('data-date').split('_')
				//var infoText2 = info2[0]+'년 '+info2[1]+'월 '+info2[2]+'일 일정 추가'
				//$('#popup_info2').text(infoText2)
	})

	$('#popup_text3').click(function(){
		document.getElementById('pt-delete-form').submit();
	})


/*
	$('#popup_text2').click(function(){ //일정예약 팝업에서 일정예약 버튼을 눌렀을때 예약하는 팝업이 생성
        $('#addpopup').fadeIn().css({'z-index':'103'})
        $('#cal_popup2').hide()
        timeGraphSet("class","grey");  //시간 테이블 채우기
        timeGraphSet("off","grey")
        startTimeSet();  //일정등록 가능한 시작시간 리스트 채우기
      })
*/
      var select_all_check = false;
      //달력 선택된 날짜
      //출력 예시 : Fri Sep 08 2017 00:00:00 GMT+0900 (대한민국 표준시)

      $(document).on('click','#starttimes li a',function(){
          $("#starttimesSelected button").addClass("dropdown_selected");
          $("#starttimesSelected .btn:first-child").text($(this).text());
          $("#starttimesSelected .btn:first-child").val($(this).text());
          $("#id_training_time").val($(this).attr('data-trainingtime'));
          $("#id_time_duration").val(1);
          var arry = $(this).attr('data-trainingtime').split(':')
          //durTimeSet(arry[0]);
          addGraphIndicator(1)
          check_dropdown_selected();
      })

/*
      $(document).on('click',"#durations li a",function(){
          $("#durationsSelected button").addClass("dropdown_selected");
          $("#durationsSelected .btn:first-child").text($(this).text());
          $("#durationsSelected .btn:first-child").val($(this).attr('data-dur'));
          $("#id_time_duration").val($(this).attr('data-dur'));
          check_dropdown_selected();
      }); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시
*/
       function check_dropdown_selected(){ // 회원이 PT 예약시 시간, 진행시간을 선택했을때 분홍색으로 버튼 활성화 
       	 var durSelect = $("#durationsSelected button");
       	 var startSelect = $("#starttimesSelected button")
       		 if((startSelect).hasClass("dropdown_selected")==true){
        	    $("#submitBtn").addClass('submitBtnActivated');
            	select_all_check=true;
        	}else{
           	    select_all_check=false;
       		}
    	 }

      $("#submitBtn").click(function(){
         if(select_all_check==true){
             document.getElementById('pt-add-form').submit();
         }else{
            //입력값 확인 메시지 출력 가능
         }
     })

	$("#btn_close").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup').css('display')=='block'){
				$("#cal_popup").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
	})

	/*
	$("#btn_close2").click(function(){ //일정추가 팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup2').css('display')=='block'){
				$("#cal_popup2").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
	})
	*/

	$("#btn_close3").click(function(){ //일정삭제 확인 팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup3').css('display')=='block'){
				$("#cal_popup3").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
	})

	$('#popup_text4').click(function(){ //일정삭제 확인 팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup3').css('display')=='block'){
				$("#cal_popup3").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
	})


	$("#btn_close4").click(function(){ //일정예약 상세화면 팝업 X버튼 눌렀을때 팝업 닫기
		$('.tdgraph').removeClass('graphindicator')
		$('#starttimes').remove('li')
		$('#durations').remove('li')
		$("#starttimesSelected button").removeClass("dropdown_selected");
		$("#durationsSelected button").removeClass("dropdown_selected");
		$("#submitBtn").removeClass('submitBtnActivated');		
		$("#starttimesSelected .btn:first-child").val('').html('선택<span class="caret"></span>')
		$("#durationsSelected .btn:first-child").val('').html('선택<span class="caret"></span>')
		if($('#addpopup').css('display')=='block'){
			$("#addpopup").css({'display':'none','z-index':'-2'})
			$('#shade2').css({'display':'none'});
		}
	})

	$('#ng_popup').click(function(){
		$('#shade2').css({'display':'none'});
		$(this).fadeOut(100)
	})




//여기서부터 월간 달력 만들기 코드////////////////////////////////////////////////////////////////////////////////////////////////

	calTable_Set(1,currentYear,currentPageMonth-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
	calTable_Set(2,currentYear,currentPageMonth);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
	calTable_Set(3,currentYear,currentPageMonth+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기

	DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateArray,'member',classStartArray)

	alltdRelative(); //모든 td의 스타일 position을 relative로
	//dateDisabled(); //PT 불가 일정에 회색 동그라미 표시
	classDates(); //나의 PT일정에 핑크색 동그라미 표시
	monthText(); //상단에 연, 월 표시
	availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
	krHoliday(); //대한민국 공휴일

	console.log(currentHour)


	//다음페이지로 슬라이드 했을때 액션
	myswiper.on('SlideNextEnd',function(){
		++currentPageMonth;
		if(currentPageMonth+1>12){
			++currentYear
			currentPageMonth = currentPageMonth - 12;
			slideControl.append();
		}else{
			slideControl.append();
		};
	})

	//이전페이지로 슬라이드 했을때 액션
	myswiper.on('SlidePrevEnd',function(){
		--currentPageMonth;
		if(currentPageMonth-1<1){
			--currentYear
			currentPageMonth = currentPageMonth + 12;
			slideControl.prepend();
		}else{
			slideControl.prepend();
		};
	})
	
	//페이지 이동에 대한 액션 클래스
	var slideControl = {
		'append' : function(){ //다음페이지로 넘겼을때
			myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
			myswiper.appendSlide('<div class="swiper-slide"></div>') //마지막 슬라이드에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.appendSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth+1)+'월'+' currentPageMonth: '+Number(currentPageMonth+1)+'</div>') //마지막 슬라이드에 새슬라이드 추가
			calTable_Set(3,currentYear,currentPageMonth+1); //새로 추가되는 슬라이드에 달력 채우기	
			alltdRelative();
			//dateDisabled();
			classDates();
			monthText();
			krHoliday();
			availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
			myswiper.update(); //슬라이드 업데이트

		},

		'prepend' : function(){
			myswiper.removeSlide(2);
			myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
			calTable_Set(1,currentYear,currentPageMonth-1);
			alltdRelative();		
			//dateDisabled();
			classDates();
			monthText();
			krHoliday();
			availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
			myswiper.update(); //이전페이지로 넘겼을때
		}
	};

	
	function calTable_Set(Index,Year,Month){ //선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
		for(var i=1; i<=6; i++){
			$('.swiper-slide:nth-child('+Index+')').append('<div id="week'+i+Year+Month+'" class="container-fluid week-style">')
		};


		for(var i=1; i<=6; i++){
			$('.swiper-slide:nth-child('+Index+')'+' #week'+i+Year+Month).append('<table id="week'+i+Year+Month+'child" class="calendar-style"><tbody><tr></tr></tbody></table>');
		};

		calendarSetting(Year,Month);
	}; //calTable_Set


	function calendarSetting(Year,Month){ //캘린더 테이블에 연월에 맞게 날짜 채우기
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
				$('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates"'+' data-date='+Year+'_'+(Month-1)+'_'+j+'>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
			};
		}else if(Month==1){ //1월
			for(var j=31-firstDayCurrentPage+1; j<=31 ;j++){
				$('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates"'+' data-date='+Year+'_'+(Month-1)+'_'+j+'>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
			};
		}
		
		//2. 첫번째 주 채우기
		for(var i=1; i<=7-firstDayCurrentPage; i++){
			if(i==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표시하기
				$('#week1'+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'<span class="today">TODAY</span>'+'</td>');
			}else{
				$('#week1'+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
			}
		};

		//3.현재달에 두번째 주부터 나머지 모두 채우기
		var lastOfweek1 = Number($('#week1'+Year+Month+'child td:last-child span:first-child').text());
		for(var i=lastOfweek1+1; i<=lastOfweek1+7; i++){
			for(var j=0;j<=4;j++){
				if(Number(i+j*7)==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표기
					$('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+Number(i+j*7) +'>'+'<span>'+Number(i+j*7)+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'<span class="today">TODAY</span>'+'</td>')
				}else if(Number(i+j*7<=lastDay[Month-1])){ //둘째주부터 날짜 모두
					$('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+Number(i+j*7)+'>'+'<span>'+Number(i+j*7)+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}
			}
		};

		//4. 현재달 마지막에 다음달 첫주 채우기
		var howmanyWeek6 = $('#week6'+Year+Month+' td').length;
		var howmanyWeek5 = $('#week5'+Year+Month+' td').length;

		if(howmanyWeek5<=7 && howmanyWeek6==0){
			for (var i=1; i<=7-howmanyWeek5;i++){
			$('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
			};
			ad_month($('#week6'+Year+Month+'child tbody tr')) //2017.11.08추가 달력이 5주일때, 비어있는 6주차에 광고 입력
		}else if(howmanyWeek6<7 && howmanyWeek6>0){
			for (var i=1; i<=7-howmanyWeek6;i++){
			$('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
			};
		}
		for(i=1;i<=6;i++){
			$('#week'+i+Year+Month+'child td:first-child').css({color:'red'}); //일요일 날짜는 빨갛게 표기
		} 
	}; //calendarSetting()

	function alltdRelative(){ //날짜 밑에 동그라미 색상표기를 위해 모든 td의 css 포지션 값 relative로 설정
		$('td').css('position','relative');
	};

	function dateDisabled(){ //PT 불가일자를 DB로부터 받아서 disabledDates 배열에 넣으면, 날짜 회색 표시
		for(var i=0; i<disabledDates.length; i++){
			$("td[data-date="+disabledDates[i]+"] div").addClass('dateDisabled');
		};
	};

	function classDates(){ //나의 PT 날짜를 DB로부터 받아서 mytimeDates 배열에 넣으면, 날짜 핑크 표시
		for(var i=0; i<classDateArray.length; i++){
			var arr = classDateArray[i].split('_')
			var yy = arr[0]
			var mm = arr[1]
			var dd = arr[2]
			var omm = String(oriMonth)
			var odd = String(oriDate)
			if(mm.length==1){
				var mm = '0'+arr[1]
			}
			if(dd.length==1){
				var dd='0'+arr[2]
			}
			if(omm.length==1){
				var omm = '0'+oriMonth
			}
			if(odd.length==1){
				var odd='0'+oriDate
			}

			if(yy+mm+dd < oriYear+omm+odd){  // 지난 일정은 회색으로, 앞으로 일정은 핑크색으로 표기
				$("td[data-date="+classDateArray[i]+"]").attr('schedule-id',scheduleIdArray[i])
				$("td[data-date="+classDateArray[i]+"] div._classDate").addClass('greydateMytime')
				$("td[data-date="+classDateArray[i]+"] div._classTime").addClass('balloon').text(classStartArray[i])
			}else{
				$("td[data-date="+classDateArray[i]+"]").attr('schedule-id',scheduleIdArray[i])
				$("td[data-date="+classDateArray[i]+"] div._classDate").addClass('dateMytime')
				$("td[data-date="+classDateArray[i]+"] div._classTime").addClass('blackballoon').text(classStartArray[i])
			}
		};
	};

	function krHoliday(){ //대한민국 공휴일 날짜를 빨간색으로 표시
		for(var i=0; i<krHolidayList.length; i++){
			$("td[data-date$="+krHolidayList[i]+"]").addClass('holiday');
		};
	};

	function monthText(){
		var currentYMD = $('.swiper-slide:nth-child(2) div:nth-child(1)').attr('id');
		//currentYMD 형식  ex : week120177
		var textYear = currentYMD.substr(5,4); //2017
		var textMonth = currentYMD.substr(9,2); //7
		$('#yearText').text(textYear);
		$('#monthText').text(textMonth+'월');
	};

	//일정변경 가능 날짜에 표기 (CSS Class 붙이기)
	function availableDateIndicator(not_AvailableStartTime,Endtime){ 
	// 요소설명
	// not_AvailableStartTime : 강사가 설정한 '회원이 예약 불가능한 시간대 시작시간'
	// not_AvailableStartTime : 강사가 설정한 '회원이 예약 불가능한 시간대 종료시간'
	// ex : 밤 22시 ~ 익일 새벽 6시까지 일정 설정 불가 (24시간제로 입력)
	//Start : 17, End : 6 current: 14
		if(currentHour<Endtime || currentHour>=not_AvailableStartTime){
			for(i=currentDate;i<=currentDate+14;i++){
				if(i>lastDay[oriMonth]){
				 $('td[data-date='+currentYear+'_'+(oriMonth+1)+'_'+(i-lastDay[oriMonth])+']').addClass('notavailable')
				}else{
				 $('td[data-date='+currentYear+'_'+oriMonth+'_'+i+']').addClass('notavailable')
				}
			}
		}else{
			for(i=currentDate;i<=currentDate+14;i++){
				if(i>lastDay[oriMonth]){
				 $('td[data-date='+currentYear+'_'+(oriMonth+1)+'_'+(i-lastDay[oriMonth])+']').addClass('available')
				}else{
				 $('td[data-date='+currentYear+'_'+oriMonth+'_'+i+']').addClass('available')
				}
			}
		}
		
	}
	//일정변경 가능 날짜에 표기 (CSS Class 붙이기)

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

    		var memberClassDur = endSplitArray[3] - startSplitArray[3]
    	
    		startSplitArray[5] = String(endSplitArray[3] - startSplitArray[3])
    		if(option=="class"){
    			startSplitArray.push(classTimeArray_member_name[i])	
    			result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+startSplitArray[6]+"_"+endSplitArray[3]+"_"+endSplitArray[4]);
    		}else if(option=="off"){
    			startSplitArray.push(classTimeArray_member_name[i])	
    			result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+"OFF"+"_"+endSplitArray[3]+"_"+endSplitArray[4]);		
    		}else if(option=="member"){
    			result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]);		
    			result2.push(startSplitArray[3]+":"+startSplitArray[4]);
    		}	
  	    }
	}

	function ad_month(selector){ // 월간 달력 하단에 광고
		selector.html('<img src="/static/user/res/PTERS_logo.jpg" alt="logo" class="admonth">')	
	}





	//////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////
	//일정 추가관련//

	var classDateData = []
    var classTimeData = []
    var offDateData=[]
    var offTimeData = []
    var offAddOkArray = [] //OFF 등록 시작 시간 리스트
    var durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트

    DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateData,"graph",classTimeData)
    DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offDateData,"graph",offTimeData)



	function startTimeSet(){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21];
        startTimeArraySet(); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
        var offOkLen = offAddOkArray.length
        var startTimeList = $('#starttimes');
        var timeArray = [];
        for(var i=0; i<offOkLen; i++){
          var offHour = offAddOkArray[i];
          if(offHour<12){
            var offText = '오전 '
            var offHours = offHour;
          }else if(offHour==24){
            var offText = '오전 '
            var offHours = offHour-12
          }else if(offHour==12){
            var offText = '오후 '
            var offHours = offHour
          }else{
            var offHours = offHour-12
            var offText = '오후 '
          }
          if(offHour.length<2){
            timeArray[i] ='<li><a data-trainingtime="'+'0'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+'시'+'</a></li>'
          }else{
            timeArray[i] ='<li><a data-trainingtime="'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+'시'+'</a></li>'
          }
        }
        var timeArraySum = timeArray.join('')
        startTimeList.html(timeArraySum)
        console.log(offAddOkArray)
      }

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
          if(startSplitArray[2].length<2){
            result.push(startSplitArray[0]+"-"+startSplitArray[1]+"-0"+startSplitArray[2]); //2017_10_07
            result2.push(startSplitArray[3]+"_"+startSplitArray[4] +"_"+ startSplitArray[5]); //6_00_2  
          }else{
            result.push(startSplitArray[0]+"-"+startSplitArray[1]+"-"+startSplitArray[2]); //2017_10_17
            result2.push(startSplitArray[3]+"_"+startSplitArray[4] +"_"+ startSplitArray[5]); //6_00_2
          }
          
        }
        }
     }

    function timeGraphSet(option,CSStheme){ //가능 시간 그래프 채우기
        //1. option인자 : "class", "off"
        //2. CSS테마인자 : "grey", "pink"

        switch(option){
          case "class" :
          var DateDataArray = classDateData;
          var TimeDataArray = classTimeData;
          $('.tdgraph').removeClass('greytimegraph').removeClass('pinktimegraph')  
          break;
          case "off" :
          var DateDataArray = offDateData;
          var TimeDataArray = offTimeData;
          break;
        }

        switch(CSStheme){
          case "grey" :
          var cssClass = "greytimegraph"
          break;
          case "pink" :
          var cssClass= "pinktimegraph"
          break;
        }
        //var date = $("#datepicker").val(); 공용
        var dateArry = $('#popup_info4').text().replace(/년 |월 |일 |일정 추가|:| /gi,"_").split('_') //회원 월간일정 전용 
        var monthD= dateArry[1]
        var dateD = dateArry[2]

        if(monthD.length==1){
          var monthD = '0'+dateArry[1]
        }
        if(dateD.length==1){
          var dateD = '0'+dateArry[2]
        }
        var date = dateArry[0]+'-'+monthD+'-'+dateD
        var Arraylength = DateDataArray.length;
        for(var i=0;i<Arraylength;i++){
          var splitTimeArray = TimeDataArray[i].split("_")
          var targetTime = splitTimeArray[0]
          var durTime = splitTimeArray[2]
          if(DateDataArray[i] == date && durTime>1){  //수업시간이 2시간 이상일때 칸 채우기
              for(var j=0; j<durTime; j++){
                var time = Number(targetTime)+j
                $('#'+(time)+'g').addClass(cssClass)
              }
          }else if(DateDataArray[i] == date && durTime==1){ //수업시간이 1시간짜리일때 칸 채우기
              $('#'+targetTime+'g').addClass(cssClass)
          }
        }
      }



    function startTimeArraySet(){ //offAddOkArray 채우기 : 시작시간 리스트 채우기
        offAddOkArray = []
        for(i=5;i<=24;i++){
          if(!$('#'+i+'g').hasClass('pinktimegraph') == true && !$('#'+i+'g').hasClass('greytimegraph') == true){
            offAddOkArray.push(i);
          }
        }
      }

      function durTimeSet(selectedTime){ // durAddOkArray 채우기 : 진행 시간 리스트 채우기
        var len = offAddOkArray.length;
        var durTimeList = $('#durations')
        var index = offAddOkArray.indexOf(Number(selectedTime));
        var substr = offAddOkArray[index+1]-offAddOkArray[index];
        console.log(index)
        console.log(substr)
        if(substr>1){
          durTimeList.html('<li><a data-dur="1" class="pointerList">1시간</a></li>')
          console.log(index)
        }else{
          durTimeList.html('')
          for(var j=index; j<=len; j++){
            if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>') 
            }else if(offAddOkArray[j-1]== null && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]>=2){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
              break;
            }else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
              //break;
            }else if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }else if(offAddOkArray[j-1]==null && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }
          }
        }
      }

      function addGraphIndicator(datadur){
        $('.tdgraph').removeClass('graphindicator');
        var starttext = $('#starttimesSelected button').val().split(' ');
        var daymorning = starttext[0];
        var startnum = starttext[1].replace(/시/gi,"")
        if(daymorning=='오후'){
          if(startnum==12){
            var startnum = startnum
          }else{
            var startnum = Number(startnum)+12  
          }
        }else if(daymorning=='오전' && startnum==12){
            var startnum = Number(startnum)+12 
        }
        var durnum = datadur
        console.log(durnum)
        var finnum = Number(startnum)+Number(durnum)
        console.log(startnum, durnum,finnum)
        for(var i=startnum; i<finnum; i++){
          $('#'+i+'g').addClass('graphindicator')
        }
      }


});//document(ready)