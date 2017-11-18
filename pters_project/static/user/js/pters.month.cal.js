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
	var lastDay = new Array(31,28,31,30,31,30,31,31,30,31,30,31);      //각 달의 일수
	var currentPageMonth = currentMonth+1; //현재 달
	var date2 = new Date();
	var oriYear = date.getFullYear();
	var oriMonth = date.getMonth()+1;
	var oriDate = date.getDate();


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
				//console.log($(this).attr('off-time')); //현재 클릭한 요소의 class-time 요소 값 보기
					                                         //형식예: 2017_10_7_6_00_2_원빈
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
				var infoText2 = info2[0]+"시 일정을 삭제 하시겠습니까?"
				$('#popup_info').text(infoText)
				$('#popup_info2').text(infoText2)
				$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
				//$("#id_off_schedule_id_modify").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
				//schedule_on_off = 0;
			}else{
				$("#cal_popup2").fadeIn('fast').css({'z-index':'103'});
				$('#shade2').css({'display':'block'});
				var info3 = $(this).attr('data-date').split('_')
				var yy=info3[0]
				var mm=info3[1]
				var dd=info3[2]
				var dayobj = new Date(yy,mm-1,dd)
				var dayraw = dayobj.getDay();
				var dayarry = ['일','월','화','수','목','금','토']
				var day = dayarry[dayraw];
				var infoText2 = yy+'년 '+ mm+'월 '+ dd+'일 ' +'('+day+')'+' 일정 추가'
				$('#popup_info3').text(infoText2);
				$('#id_training_date').val(yy+'-'+mm+'-'+dd);
				//$("#id_off_schedule_id").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
				//$("#id_off_schedule_id_modify").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
				//schedule_on_off = 1;
			}
		}else{
			$('#ng_popup').fadeIn(1000,function(){ // 팝업[일정은 오늘 날짜 기준 2주앞만 설정 가능합니다.]
			$(this).fadeOut(2500)
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
	$("#popup_text1").click(function(){  //일정 변경 버튼 클릭
        if(schedule_on_off==0){
            //PT 일정 변경시
            document.getElementById('pt-modify-form').submit();
        }
         else{
            document.getElementById('off-modify-form').submit();
        }
    })

    $("#popup_text2").click(function(){  //일정 삭제 버튼 클릭
        if(schedule_on_off==0){
            //PT 일정 삭제시
            document.getElementById('daily-pt-delete-form').submit();
        }
         else{
            document.getElementById('daily-off-delete-form').submit();
        }
    })

    $("#popup_text3").click(function(){  //일정 추가 버튼 클릭
        if(schedule_on_off==1){
            //PT 일정 삭제시
            document.getElementById('daily-pt-delete-form').submit();
        }
         else{
            document.getElementById('daily-off-delete-form').submit();
        }
    })
*/


	$("#btn_close").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup').css('display')=='block'){
				$("#cal_popup").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
	})

	$("#btn_close2").click(function(){ //일정추가 팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup2').css('display')=='block'){
				$("#cal_popup2").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
	})

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




//여기서부터 월간 달력 만들기 코드////////////////////////////////////////////////////////////////////////////////////////////////

	calTable_Set(1,currentYear,currentPageMonth-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
	calTable_Set(2,currentYear,currentPageMonth);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
	calTable_Set(3,currentYear,currentPageMonth+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기

	DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateArray,'member',classStartArray)

	alltdRelative(); //모든 td의 스타일 position을 relative로
	//dateDisabled(); //PT 불가 일정에 회색 동그라미 표시
	classDates(); //나의 PT일정에 핑크색 동그라미 표시
	monthText(); //상단에 연, 월 표시
	availableDateIndicator();
	krHoliday(); //대한민국 공휴일



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
			availableDateIndicator();
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
			availableDateIndicator();
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
	function availableDateIndicator(){
		for(i=currentDate;i<=currentDate+14;i++){
			if(i>lastDay[oriMonth]){
			 $('td[data-date='+currentYear+'_'+(oriMonth+1)+'_'+(i-lastDay[oriMonth])+']').addClass('available')
			}else{
			 $('td[data-date='+currentYear+'_'+oriMonth+'_'+i+']').addClass('available')
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

});//document(ready)