$(document).ready(function(){

	var date = new Date();
	var currentYear = date.getFullYear(); //현재 년도
	var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
	var currentDate = date.getDate(); //오늘 날짜 
	var currentDayinfo = date.getDay(); //오늘 요일
 	var currentDay = new Array('일','월','화','수','목','금','토')

 	var plan = "오늘의 수업 일정";
 	var num = 5;
 	var gun = "건"

 	var totalMember = 38;
 	var requestNum = 3;
 	var finishMember = 8;


	$('.icon-bar').css('background-color','white');
	$('#uptext').css({'color':'#fe4e65','font-size':'16px'});
	$('.center_box_day p').text(currentDate+','+currentDay[currentDayinfo]); //일, 요일 표시
	$('.center_box_monthyear p').text(currentMonth+1+'월 '+currentYear+'년'); //월, 연도 표시

	$('.center_box_plan p').text(plan);
	$('.center_box_gun a').text(num);

	$('#total_member').text(totalMember);
	$('#request_num').text(requestNum);
	$('#finish_member').text(finishMember);


});