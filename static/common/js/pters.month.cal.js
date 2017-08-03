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
	var krHolidayList = new Array('_1_1','_3_1','_4_8','_5_5','_6_6','_8_15','_10_3','_10_9','_12_25') //대한민국 공휴일 (구정, 추석 제외)

	var weekDay = new Array('일','월','화','수','목','금','토');
	var firstDayInfoPrevMonth = new Date(currentYear,currentMonth-1,1);
	var firstDayPrevMonth = firstDayInfoPrevMonth.getDay();
	var firstDayInfoNextMonth = new Date(currentYear,currentMonth+1,1);
	var firstDayNextMonth = firstDayInfoNextMonth.getDay();
	var currentPageMonth = currentMonth+1; //현재 달
	var disabledDates = new Array('2017_7_3','2017_7_11','2017_7_20','2017_7_25','2017_7_31','2017_8_2','2017_8_13','2017_8_21');
	var mytimeDates = new Array('2017_7_5','2017_7_7','2017_7_10','2017_7_12','2017_7_14','2017_7_17','2017_7_19','2017_7_21','2017_7_24','2017_7_26','2017_7_28','2017_8_3','2017_8_11','2017_8_20','2017_8_30');


	//currentPageMonth = 1,2,3,4,5,6,7,8,9,10,11,12

	//달력 슬라이드 초기 셋팅 3개달 (전달, 이번달, 다음달)
	//(디버깅용 날짜 표시)$('.swiper-slide:nth-child(1)').text(currentYear+'년'+Number(currentPageMonth-1)+' currentPageMonth: '+Number(currentPageMonth-1)+'월');
	//(디버깅용 날짜 표시)$('.swiper-slide:nth-child(2)').text(currentYear+'년'+currentPageMonth+' currentPageMonth: '+currentPageMonth+'월');
	//(디버깅용 날짜 표시)$('.swiper-slide:nth-child(3)').text(currentYear+'년'+Number(currentPageMonth+1)+' currentPageMonth: '+Number(currentPageMonth+1)+'월');
	calTable_Set(1,currentYear,currentPageMonth-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
	calTable_Set(2,currentYear,currentPageMonth);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
	calTable_Set(3,currentYear,currentPageMonth+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기

	alltdRelative(); //모든 td의 스타일 position을 relative로
	dateDisabled(); //PT 불가 일정에 회색 동그라미 표시
	dateMytime(); //나의 PT일정에 핑크색 동그라미 표시
	monthText(); //상단에 연, 월 표시
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
			dateDisabled();
			dateMytime();
			monthText();
			krHoliday();
			myswiper.update(); //슬라이드 업데이트

		},

		'prepend' : function(){
			myswiper.removeSlide(2);
			myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
			calTable_Set(1,currentYear,currentPageMonth-1);
			alltdRelative();		
			dateDisabled();
			dateMytime();
			monthText();
			krHoliday();
			myswiper.update(); //이전페이지로 넘겼을때
		}
	};

	
	function calTable_Set(Index,Year,Month){ //선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
		for(var i=1; i<=6; i++){
			$('.swiper-slide:nth-child('+Index+')').append('<div id="week'+i+Year+Month+'" class="container-fluid week-style" style="top: '+Number(10+10*i)+'%">')
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
				$('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates"'+' data-date='+Year+'_'+(Month-1)+'_'+j+'>'+'<span>'+j+'</span>'+'<div>'+'</div>'+'</td>');
			};
		}else if(Month==1){ //1월
			for(var j=31-firstDayCurrentPage+1; j<=31 ;j++){
				$('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates"'+' data-date='+Year+'_'+(Month-1)+'_'+j+'>'+'<span>'+j+'</span>'+'<div>'+'</div>'+'</td>');
			};
		}
		
		//2. 첫번째 주 채우기
		for(var i=1; i<=7-firstDayCurrentPage; i++){
			if(i==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표시하기
				$('#week1'+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+i+'>'+'<span>'+i+'</span>'+'<div>'+'</div>'+'<span class="today">TODAY</span>'+'</td>');
			}else{
				$('#week1'+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+i+'>'+'<span>'+i+'</span>'+'<div>'+'</div>'+'</td>');
			}
		};

		//3.현재달에 두번째 주부터 나머지 모두 채우기
		var lastOfweek1 = Number($('#week1'+Year+Month+'child td:last-child').text());
		for(var i=lastOfweek1+1; i<=lastOfweek1+7; i++){
			for(var j=0;j<=4;j++){
				if(Number(i+j*7)==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표기
					$('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+Number(i+j*7) +'>'+'<span>'+Number(i+j*7)+'</span>'+'<div>'+'</div>'+'<span class="today">TODAY</span>'+'</td>')
				}else if(Number(i+j*7<=lastDay[Month-1])){ //둘째주부터 날짜 모두
					$('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+Number(i+j*7)+'>'+'<span>'+Number(i+j*7)+'</span>'+'<div>'+'</div>'+'</td>')
				}
			}
		};

		//4. 현재달 마지막에 다음달 첫주 채우기
		var howmanyWeek6 = $('#week6'+Year+Month+' td').length;
		var howmanyWeek5 = $('#week5'+Year+Month+' td').length;

		if(howmanyWeek5<7){
			for (var i=1; i<=7-howmanyWeek5;i++){
			$('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span>'+i+'</span>'+'<div>'+'</div>'+'</td>')
			};	
		}else if(howmanyWeek6<7 && howmanyWeek6>0){
			for (var i=1; i<=7-howmanyWeek6;i++){
			$('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span>'+i+'</span>'+'<div>'+'</div>'+'</td>')
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
			$("td[data-date="+disabledDates[i]+"] div").attr('class','dateDisabled');
		};  
	};

	function dateMytime(){ //나의 PT 날짜를 DB로부터 받아서 mytimeDates 배열에 넣으면, 날짜 핑크 표시
		for(var i=0; i<mytimeDates.length; i++){
			$("td[data-date="+mytimeDates[i]+"] div").attr('class','dateMytime');
		};
	};

	function krHoliday(){ //대한민국 공휴일 날짜를 빨간색으로 표시
		for(var i=0; i<krHolidayList.length; i++){
			$("td[data-date$="+krHolidayList[i]+"]").attr('style','color:red');
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



});//document(ready)


//2017.07.22 업데이트 내역
//2월->1월->2월->3월 이동할때 제대로 표기가 되지 않던것을 수정
//SlideNextEnd와 SlidePrevEnd안에서 해가 넘어가는 로직을 수정함
//각 일마다 Data를 부여. DB로 넘겨주는 데이터 (data-date속성. ex: 2017_7_31, 2017_11_1)  언더바'_'로 슬라이싱 해서 사용할 것
//
//2017.07.23 업데이트 내역
//각 날짜를 td 밑에 <span>태그에 넣고, <span>태그 동일 레벨에 <div>태그를 가지도록 수정
//나의 PT날짜와 PT불가일정에 각각 핑크색, 회색 동그라미 표시하는 함수 추가
//나의 PT날짜와 PT불가 일정을 DB로부터 받아서 mytimeDates, disabledDates 배열에 넣으면
//각 해당 날짜에 회색 or 핑크색 동그라미 표기함
//
//2017.07.24 업데이트 내역
//monthText함수 추가 : 맨위에 연, 월을 표기하는 태그를 생성/업데이트 하는 함수
//css 달력 디자인 반영
//css 달력 디자인 반영위한 html 구조 수정
//2017.07.25 업데이트 내역
//html에서 상단 img와 달력 컨테이너가 겹치는 것 해결(absolute로 설정하면 부모가 height를 0을 가짐)
//2017.07.26 업데이트 내역
//해가 넘어가서 1월의 첫주에 12월 마지막주 일자가 표시가 안되는 것 해결 
//2017.07.27 업데이트 내역
//윤달 기능 적용
//2017.08.01
//첫번째 주에 Today가 있을때 출력이 되지 않던 문제 해결
//이유: 첫번째주에서 조건문을 빠트림..
//
//2018.8.3
//대한민국 공휴일 표기(krHoliday함수)
//음력인 구정연휴와 추석연휴는 업데이트 필요함
