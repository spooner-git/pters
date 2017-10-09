/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/

$(document).ready(function(){

	var schedule_on_off = 0; //0 : OFF Schedule / 1 : PT Schedule

	//상단바 터치시 주간달력에 회원명/시간 표시 ON OFF

	$('#ymdText').click(function(){
		var memberName = $(".memberName");
		var memberTime = $(".memberTime");
		if(memberName.css('display')!='none'){
			memberName.css('display','none')
			memberTime.css('display','none')
		}else{
			memberName.css('display','block')
			memberTime.css('display','block')
		};
	});
	//

	//스케쥴 클릭시 팝업 Start
		$(document).on('click','div.classTime',function(){ //일정을 클릭했을때 팝업 표시
			$("#cal_popup").css({'display':'block','z-index':'40'});
			$('#shade').css({'background-color':'black','z-index':'15'});
			console.log($(this).attr('class-time')); //현재 클릭한 요소의 class-time 요소 값 보기
			                                         //형식예: 2017_10_7_6_00_2_원빈
			console.log($(this).attr('schedule-id'));
			$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
			$("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
			schedule_on_off = 1;

		})

	//Off 일정 클릭시 팝업 Start
		$(document).on('click','div.offTime',function(){ //일정을 클릭했을때 팝업 표시
			$("#cal_popup").css({'display':'block','z-index':'40'});
			$('#shade').css({'background-color':'black','z-index':'15'});
			console.log($(this).attr('off-time')); //현재 클릭한 요소의 class-time 요소 값 보기
			                                         //형식예: 2017_10_7_6_00_2_원빈
			console.log($(this).attr('off-schedule-id'));
			$("#id_off_schedule_id").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
			schedule_on_off = 0;

		})


		//일정 삭제 기능 추가 - hk.kim 171007
		$("#popup_text2").click(function(){  //일정 삭제 버튼 클릭
			if(schedule_on_off==1){
				//PT 일정 삭제시
				document.getElementById('daily-pt-delete-form').submit();
			}
			else{
				document.getElementById('daily-off-delete-form').submit();
			}
		})

		$("#btn_close").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup').css('display')=='block'){
				$("#cal_popup").css({'display':'none','z-index':'-2'})
				$('#shade').css({'background-color':'white','z-index':'-1'});
			}
		})
	//스케쥴 클릭시 팝업 End



	//플로팅 버튼 Start
	$('#float_btn').click(function(){
		if($('#shade').css('z-index')<0){
			$('#shade').css({'background-color':'black','z-index':'8'});
			$('#float_inner1').animate({'opacity':'0.7','bottom':'85px'},120);
			$('#float_inner2').animate({'opacity':'0.7','bottom':'145px'},120);
			$('#float_btn').addClass('rotate_btn');
		}else{
			$('#shade').css({'background-color':'white','z-index':'-1'});
			$('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
			$('#float_btn').removeClass('rotate_btn');
		}
	});
	//플로팅 버튼 End

	//플로팅 버튼 스크롤시 숨기기 Start
		var ts;
			$("body").bind("touchstart",function(e){
			ts = e.originalEvent.touches[0].clientY;
				});
			$("body").bind("touchend",function(e){
				var te = e.originalEvent.changedTouches[0].clientY;
				if(ts>te+5){
					$("#float_btn").animate({opacity:'0'})
				}else if(ts<te-5){
					$("#float_btn").animate({opacity:'1'})
				}
			});
	//플로팅 버튼 스크롤시 숨기기 End

	var date = new Date();
	var currentYear = date.getFullYear(); //현재 년도
	var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
	var currentDate = date.getDate(); //오늘 날짜
	var currentDay = date.getDay(); // 0,1,2,3,4,5,6,7
	var lastDay = new Array(31,28,31,30,31,30,31,31,30,31,30,31);      //각 달의 일수
	if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
			lastDay[1] = 29;
		}else{
			lastDay[1] = 28;
		};

	var weekDay = new Array('일','월','화','수','목','금','토');
	var firstDayInfoPrevMonth = new Date(currentYear,currentMonth-1,1);
	var firstDayPrevMonth = firstDayInfoPrevMonth.getDay(); //전달 1일의 요일
	var firstDayInfoNextMonth = new Date(currentYear,currentMonth+1,1);
	var firstDayNextMonth = firstDayInfoNextMonth.getDay(); //다음달 1일의 요일
	var currentPageMonth = currentMonth+1; //현재 달

	calTable_Set(2,currentYear,currentPageMonth,'0W'); //3번 슬라이드에 현재달, 현재주 채우기
	calTable_Set(3,currentYear,currentPageMonth,'1W'); //4번 슬라이드에 현재달, 현재주 +1 달력채우기
	calTable_Set(4,currentYear,currentPageMonth,'2W'); //5번 슬라이드에 현재달, 현재주 +2 달력채우기
	calTable_Set(0,currentYear,currentPageMonth,'W2'); //1번 슬라이드에 현재달, 현재주 -2 달력채우기
	calTable_Set(1,currentYear,currentPageMonth,'W1');  //2번 슬라이드에 현재달, 현재주 -1 채우기

	alltdRelative(); //모든 td의 스타일 position을 relative로
	dateText();
	classTime(); //PT수업 시간에 핑크색 박스 표시
	offTime();
	

	//다음페이지로 슬라이드 했을때 액션
	myswiper.on('SlideNextEnd',function(){
			slideControl.next();
			dateText();
	});

	//이전페이지로 슬라이드 했을때 액션
	myswiper.on('SlidePrevEnd',function(){
			slideControl.prev();
			dateText();	
	});

	//페이지 이동에 대한 액션 클래스
	var slideControl = {
		'append' : function(){ //다음페이지로 넘겼을때
			myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
			myswiper.appendSlide('<div class="swiper-slide"></div>') //마지막 슬라이드에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.appendSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth+1)+'월'+' currentPageMonth: '+Number(currentPageMonth+1)+'</div>') //마지막 슬라이드에 새슬라이드 추가
			calTable_Set(3,currentYear,currentPageMonth,currentDate+1); //새로 추가되는 슬라이드에 달력 채우기	
			alltdRelative();
			classTime();
			offTime();
			myswiper.update(); //슬라이드 업데이트

		},

		'prepend' : function(){
			myswiper.removeSlide(2);
			myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
			calTable_Set(1,currentYear,currentPageMonth,currentDate-1);
			alltdRelative();		
			classTime();
			offTime();
			myswiper.update(); //이전페이지로 넘겼을때
		},

		'next': function(){
			alltdRelative();
			classTime();
			offTime();
			myswiper.update(); //슬라이드 업데이트
		},

		'prev': function(){
			alltdRelative();		
			classTime();
			offTime();
			myswiper.update(); //이전페이지로 넘겼을때
		}
	};

	
	function calTable_Set(Index,Year,Month,Day){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성

		//주간달력 상단표시줄 (요일, 날짜, Today표식)
		$('#slide'+Index).append('<div id="week" class="time-style"><table class="calendar-style"><tbody><tr id="weekText"></tr></tbody></table></div>')
		for(var i=0; i<=7; i++){
			if(i==0){
				$('#slide'+Index+ ' #weekText').append("<td class='hour'><span></span><span></span><span></span></td>")	
			}else{
				var weekUpperText = "<td id='weekNum_"+i+"'><span class='weekToday-style' id='weekToday_"+ i + "'></span><span class='weekToday-style'></span><span></span></td>"
				$('#slide'+Index+ ' #weekText').append(weekUpperText);
			};
		};

		weekNum_Set()


		for(var i=5; i<=24; i++){
			$('#slide'+Index).append('<div id="'+i+'H_'+Year+'_'+Month+'_'+currentDate+'_'+Day+'" class="time-style" style="top: '+Number(10*i-30)+'%">')
		};

		for(var i=5; i<=24; i++){
				if(i<10){
					$('#slide'+Index+' #'+i+'H_'+Year+'_'+Month+'_'+currentDate+'_'+Day).append('<table id="'+Year+'_'+Month+'_'+currentDate+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="hour" rowspan="2">'+'0'+i+'<div></div></td></tr><tr></tr></tbody></table>');		
				}else{
					$('#slide'+Index+' #'+i+'H_'+Year+'_'+Month+'_'+currentDate+'_'+Day).append('<table id="'+Year+'_'+Month+'_'+currentDate+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="hour" rowspan="2">'+i+'<div></div></td></tr><tr></tr></tbody></table>');		
				};
		};

		for(var i=5; i<=24; i++){
			for(var j=0; j<=6;j++){
				var slidevalue = $('#slide'+Index+' #weekNum_'+Number(j+1)+' span:nth-child(3)').text();
				$('#'+Year+'_'+Month+'_'+currentDate+'_'+Day+'_'+i+'H'+' tbody tr:nth-child(1)').append('<td'+' data-time='+Year+'_'+Month+'_'+slidevalue+'_'+(i-1)+'_'+'30'+'>'+'<div></div>'+'</td>');
				$('#'+Year+'_'+Month+'_'+currentDate+'_'+Day+'_'+i+'H'+' tbody tr:nth-child(2)').append('<td'+' data-time='+Year+'_'+Month+'_'+slidevalue+'_'+i+'_'+'00'+'>'+'<div></div>'+'</td>');
			};
		};



	}; //calTable_Set


	function weekNum_Set(){
		var currentDayLoc = Number(currentDay+1)
		
		var dayKorean = new Array('일','월','화','수','목','금','토')
		for(var i=1; i<=7; i++){
			for(var j=0;j<=4;j++){
				$('#slide'+j+' #weekNum_'+i+' span:nth-child(2)').html(dayKorean[i-1]);			
			}
		}
		
		


		$('#slide2 #weekNum_'+currentDayLoc+' span:nth-child(3)').html(currentDate);
		if(currentDayLoc==1){
			for(i=1; i<=6; i++){
				$('#slide2 #weekNum_'+i+' span:nth-child(3)').html('<span>'+Number(currentDate+i)+'</span>');
			};
		}else if(currentDayLoc==2){
			$('#slide2 #weekNum_'+1+' span:nth-child(3)').html(Number(currentDate-1));
			for(i=1; i<=5; i++){
				$('#slide2 #weekNum_'+Number(i+2)+' span:nth-child(3)').html(Number(currentDate+i));
			};
		}else if(currentDayLoc==3){
			$('#slide2 #weekNum_'+1+' span:nth-child(3)').html(Number(currentDate-2));
			$('#slide2 #weekNum_'+2+' span:nth-child(3)').html(Number(currentDate-1));
			for(i=1; i<=4; i++){
				$('#slide2 #weekNum_'+Number(i+3)+' span:nth-child(3)').html(Number(currentDate+i));
			};
		}else if(currentDayLoc==4){
			for(i=1; i<=3; i++){
				$('#slide2 #weekNum_'+i+' span:nth-child(3)').html(Number(currentDate-4+i));
			};
			for(i=1; i<=3; i++){
				$('#slide2 #weekNum_'+Number(i+4)+' span:nth-child(3)').html(Number(currentDate+i));
			};
		}else if(currentDayLoc==5){
			for(i=1; i<=4; i++){
				$('#slide2 #weekNum_'+i+' span:nth-child(3)').html(Number(currentDate-5+i));
			};
			for(i=1; i<=2; i++){
				$('#slide2 #weekNum_'+Number(i+5)+' span:nth-child(3)').html(Number(currentDate+i));
			};
		}else if(currentDayLoc==6){
			for(i=1; i<=5; i++){
				$('#slide2 #weekNum_'+i+' span:nth-child(3)').html(Number(currentDate-6+i));
			};
			$('#slide2 #weekNum_'+7+' span:nth-child(3)').html(Number(currentDate+1));
		}else if(currentDayLoc==7){
			for(i=1; i<=6; i++){
				$('#slide2 #weekNum_'+i+' span:nth-child(3)').html(Number(currentDate-7+i));
			};	
		}

		for(var i=1; i<=7; i++){ //-2W 채우기
			var slide2value = Number($('#slide2 #weekNum_'+i+' span:nth-child(3)').text());
			if(slide2value-14<=0){
				$('#slide0 #weekNum_'+i+' span:nth-child(3)').html(slide2value-14+lastDay[currentMonth-1]);
			}else{
				$('#slide0 #weekNum_'+i+' span:nth-child(3)').html(slide2value-14);	
			}			
		}

		for(var i=1; i<=7; i++){ //-1W 채우기
			var slide2value = Number($('#slide2 #weekNum_'+i+' span:nth-child(3)').text());
			if(slide2value-7<=0){
				$('#slide1 #weekNum_'+i+' span:nth-child(3)').html(slide2value-7+lastDay[currentMonth-1]);	
			}else{
				$('#slide1 #weekNum_'+i+' span:nth-child(3)').html(slide2value-7);
			}
			
		}

		for(var i=1; i<=7; i++){ //+1W 채우기
			var slide2value = Number($('#slide2 #weekNum_'+i+' span:nth-child(3)').text());
			if(slide2value+7>lastDay[currentMonth]){
				$('#slide3 #weekNum_'+i+' span:nth-child(3)').html(slide2value+7-lastDay[currentMonth]);				
			}else{
				$('#slide3 #weekNum_'+i+' span:nth-child(3)').html(slide2value+7);
			}
		}

		for(var i=1; i<=7; i++){ //+2W 채우기
			var slide2value = Number($('#slide2 #weekNum_'+i+' span:nth-child(3)').text());
			if(slide2value+14>lastDay[currentMonth]){
				$('#slide4 #weekNum_'+i+' span:nth-child(3)').html(slide2value+14-lastDay[currentMonth]);				
			}else{
				$('#slide4 #weekNum_'+i+' span:nth-child(3)').html(slide2value+14);
			}
		}

		for(i=1;i<=7;i++){
		var scan = $('#slide2 #weekNum_'+i+' span:nth-child(3)').text()
			if(scan==currentDate){
				$('#slide2 #weekNum_'+i+' span:nth-child(1)').addClass('today')
				$('#slide2 #weekNum_'+i+' span:nth-child(1)').html('TODAY')
				$('#slide2 #weekNum_'+i+' span:nth-child(3)').addClass('today-Number')
			}
		}


	}


	function alltdRelative(){ //날짜 밑에 동그라미 색상표기를 위해 모든 td의 css 포지션 값 relative로 설정
		$('td').css('position','relative');
	};

	function classTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
		for(var i=0; i<classTimeArray.length; i++){
			var datasplit = classTimeArray[i].split('_');  //2017_8_15_6_00_3
			var classStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
			var classDura = datasplit[5];
			var memberName = datasplit[6];
			//schedule-id 추가 (일정 변경 및 삭제를 위함) hk.kim, 171007
			$("td[data-time="+classStart+"] div").addClass('classTime').attr('class-time',classTimeArray[i]).attr('schedule-id',scheduleIdArray[i]).attr('data-memberName',memberName).css({'height':Number(classDura*30)+'px'});
			$("td[data-time="+classStart+"] div").html('<span>'+memberName+' </span>'+'<span>'+datasplit[3]+':'+datasplit[4]+'</span>');
			$("td[data-time="+classStart+"] div span:first-child").addClass('memberName');
			$("td[data-time="+classStart+"] div span:nth-child(2)").addClass('memberTime');
		};
	};

	function offTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
		for(var i=0; i<offTimeArray.length; i++){
			var datasplit = offTimeArray[i].split('_');  //2017_8_15_6_00_3
			var offStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
			var offDura = datasplit[5];
			var memberName = datasplit[6];
			$("td[data-time="+offStart+"] div").addClass('offTime').attr('off-time',offTimeArray[i]).attr('off-schedule-id',offScheduleIdArray[i]).css({'height':Number(offDura*30)+'px'});
			$("td[data-time="+offStart+"] div").html('<span>'+memberName+' </span>'+'<span>'+datasplit[3]+':'+datasplit[4]+'</span>');	
			$("td[data-time="+offStart+"] div span:first-child").addClass('memberName');
			$("td[data-time="+offStart+"] div span:nth-child(2)").addClass('memberTime');

		};
	};

	function dateText(){ //
		//currentYMD 형식  ex : 2017_8_4_5H
		$('#yearText').text(currentYear+'년');
		$('#monthText').text(currentPageMonth+'월');
	};


	/*
	function dateText(){ //
		//currentYMD 형식  ex : 2017_8_4_5H
		var currentYMD = $('.swiper-slide:nth-child(2) div:nth-child(1) table').attr('id');
		var YMDArray=currentYMD.split('_')
		var textYear = YMDArray[0] //2017
		var textMonth = YMDArray[1]; //8
		var textDate = YMDArray[2]; //4
		var monthEnglish = new Array('January','February','March','April','May','June','July','August','September','October','November','December')
		var dayEnglish = new Array('일요일','월요일','화요일','수요일','목요일','금요일','토요일')
		var dayTodayInfo = new Date(monthEnglish[textMonth-1]+','+textDate+','+textYear);
		var dayToday = dayTodayInfo.getDay();
		var textDay = dayEnglish[dayToday];

		$('#yearText').text(textYear+'년 '+textMonth+'월 '+textDate+'일');
		$('#monthText').text(textDay);
	};
    */



});//document(ready)

