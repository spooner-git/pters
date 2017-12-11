$(document).ready(function(){

	var date = new Date();
	var currentYear = date.getFullYear(); //현재 년도
	var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
	var currentDate = date.getDate(); //오늘 날짜 
	var currentDayinfo = date.getDay(); //오늘 요일
 	var currentDay = ['일','월','화','수','목','금','토']
 	var currentDayJP = ['日','月','火','水','木','金','土']
 	var currentDayEN = ['SUN','MON','TUE','WED','THR','FRI','SAT']


 	var monthtext
 	var yeartext
 	var datetext
 	var todayplantext

 	if(Options.language=="Korea"){
 		var monthtext = "월 ";
 		var yeartext = "년 ";
 		var datetext = currentDay[currentDayinfo]
 		var todayplantext = "오늘의 일정수"
 	}else if(Options.language=="Japan"){
 		var monthtext = "月 "
 		var yeartext = "年 "
 		var datetext = currentDayJP[currentDayinfo]
 		var todayplantext = "今日の日程数"
 	}else if(Options.language=="English"){
 		var monthtext = ", "
 		var yeartext = " "
 		var datetext = currentDayEN[currentDayinfo]
 		var todayplantext = "Today's Lecture count"
 	}

	$('.center_box_day p').text(currentDate+','+datetext); //일, 요일 표시
	$('.center_box_monthyear p').text(currentMonth+1+monthtext+currentYear+yeartext); //월, 연도 표시
	$('.center_box_plan p').text(todayplantext)


});

