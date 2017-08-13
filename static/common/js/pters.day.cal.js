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
	var disabledTime = new Array('2017_8_4_5H_2half','2017_8_4_10H_2half','2017_8_4_11H_1half','2017_8_4_14H_2half','2017_8_4_15H_1half');
	var mytimeTime = new Array('2017_7_5','2017_7_7','2017_7_10','2017_7_12','2017_7_14','2017_7_17','2017_7_19','2017_7_21','2017_7_24','2017_7_26','2017_7_28');
	//2017_8_4_5H_1half
	//2017_8_4_5HR_1half



	calTable_Set(1,currentYear,currentPageMonth,currentDate-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
	calTable_Set(2,currentYear,currentPageMonth,currentDate);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
	calTable_Set(3,currentYear,currentPageMonth,currentDate+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기

	alltdRelative(); //모든 td의 스타일 position을 relative로
	timeDisabled(); //PT 불가 일정에 회색 동그라미 표시
	timeMytime(); //나의 PT일정에 핑크색 동그라미 표시
	dateText(); //상단에 연, 월 표시

	//다음페이지로 슬라이드 했을때 액션
	myswiper.on('SlideNextEnd',function(){
		++currentDate;
		if(currentDate+1>lastDay[currentPageMonth-1]){ //다음달 넘어갈때
			if(currentPageMonth+1>12){//다음해 넘어갈떄
				++currentYear
				currentPageMonth=currentPageMonth-11;
				currentDate=currentDate-lastDay[11];
				slideControl.append();
			}else{
				currentPageMonth++
				currentDate=currentDate-lastDay[currentPageMonth-2];
				slideControl.append();
			}
		}else{
			slideControl.append();
		};
	});

	//이전페이지로 슬라이드 했을때 액션
	myswiper.on('SlidePrevEnd',function(){
		--currentDate;
		if(currentDate-1<1){ //전달 넘어갈떄
			if(currentPageMonth-1<1){ //전해로 넘어갈때 
				--currentYear
				currentPageMonth = currentPageMonth + 11;
				currentDate=currentDate+lastDay[11];
				slideControl.prepend();
			}else{
				currentPageMonth--
				currentDate=currentDate+lastDay[currentPageMonth-1];
				slideControl.prepend();	
			}
		}else{
			slideControl.prepend();	
			console.log(currentDate);
		};
	});
	

	//페이지 이동에 대한 액션 클래스
	var slideControl = {
		'append' : function(){ //다음페이지로 넘겼을때
			myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
			myswiper.appendSlide('<div class="swiper-slide"></div>') //마지막 슬라이드에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.appendSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth+1)+'월'+' currentPageMonth: '+Number(currentPageMonth+1)+'</div>') //마지막 슬라이드에 새슬라이드 추가
			calTable_Set(3,currentYear,currentPageMonth,currentDate+1); //새로 추가되는 슬라이드에 달력 채우기	
			alltdRelative();
			timeDisabled();
			timeMytime();
			dateText();
			myswiper.update(); //슬라이드 업데이트

		},

		'prepend' : function(){
			myswiper.removeSlide(2);
			myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
			calTable_Set(1,currentYear,currentPageMonth,currentDate-1);
			alltdRelative();		
			timeDisabled();
			timeMytime();
			dateText();
			myswiper.update(); //이전페이지로 넘겼을때
		}
	};

	
	function calTable_Set(Index,Year,Month,Day){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성
		for(var i=5; i<=24; i++){
			$('.swiper-slide:nth-child('+Index+')').append('<div id="'+i+'H_'+Year+'_'+Month+'_'+Day+'" class="container-fluid time-style" style="top: '+Number(10*i-30)+'%">')
		};

		for(var i=5; i<=24; i++){
			$('.swiper-slide:nth-child('+Index+')'+' #'+i+'H_'+Year+'_'+Month+'_'+Day).append('<table id="'+Year+'_'+Month+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="hour" rowspan="2">'+i+'시'+'</td></tr><tr></tr></tbody></table>');
		};

		for(var i=5; i<=24; i++){
		$('#'+Year+'_'+Month+'_'+Day+'_'+i+'H'+' tbody tr:nth-child(1)').append('<td'+' data-time='+Year+'_'+Month+'_'+Day+'_'+i+'H'+'_1half'+'>'+'</td>'+'<td'+' data-time-range='+Year+'_'+Month+'_'+Day+'_'+i+'HR'+'_1half'+'>'+'</td>');
		$('#'+Year+'_'+Month+'_'+Day+'_'+i+'H'+' tbody tr:nth-child(2)').append('<td'+' data-time='+Year+'_'+Month+'_'+Day+'_'+i+'H'+'_2half'+'>'+'</td>'+'<td'+' data-time-range='+Year+'_'+Month+'_'+Day+'_'+i+'HR'+'_2half'+'>'+'</td>');
		};
	}; //calTable_Set




	function alltdRelative(){ //날짜 밑에 동그라미 색상표기를 위해 모든 td의 css 포지션 값 relative로 설정
		$('td').css('position','relative');
	};
	
	function timeDisabled(){ //PT 불가일자를 DB로부터 받아서 disabledDates 배열에 넣으면, 날짜 회색 표시
		for(var i=0; i<disabledTime.length; i++){
			$("td[data-time="+disabledTime[i]+"]").attr('class','dateDisabled');
		};  
	};

	function timeMytime(){ //나의 PT 날짜를 DB로부터 받아서 mytimeDates 배열에 넣으면, 날짜 핑크 표시
		for(var i=0; i<mytimeTime.length; i++){
			$("td[data-time="+mytimeTime[i]+"] div").attr('class','dateMytime');
		};
	};

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



});//document(ready)

