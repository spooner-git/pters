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
 		var todayplantext = "오늘의 일정"
 	}else if(Options.language=="Japan"){
 		var monthtext = "月 "
 		var yeartext = "年 "
 		var datetext = currentDayJP[currentDayinfo]
 		var todayplantext = "今日の日程"
 	}else if(Options.language=="English"){
 		var monthtext = ", "
 		var yeartext = " "
 		var datetext = currentDayEN[currentDayinfo]
 		var todayplantext = "Today's Lecture"
 	}

	$('.center_box_day p').text(currentDate+','+datetext); //일, 요일 표시
	$('.center_box_monthyear p').text(currentYear+yeartext+(Number(currentMonth)+1)+monthtext); //월, 연도 표시
	$('.center_box_plan p').text(todayplantext)

	$(window).scroll(function(){
		var navLoc = $('#pcver').offset().top;
		console.log(navLoc)
		if(navLoc > 1){
			$('#pcver').css({'background':'#101010'})
		}else{
			$('#pcver').css({'background':'transparent'})
		}
	})

	$('.bottomfooter1').find('img').attr('src','/static/user/res/spooner.png')

});

