/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/

$(document).ready(function(){

	$('#float_inner1').click(function(){
	    $('#page-ptadd').fadeIn('fast');
	    $('#shade3').fadeIn('fast');
	    $('#shade2').hide();
	    $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
	    $('#float_btn_wrap').fadeOut();
	    $('#uptext2').text('PT 일정 등록')
	    $('#page-base').fadeOut();
	    $('#page-base-addstyle').fadeIn();
	    $("#datepicker").datepicker('setDate',null)
	})

	$('#float_inner2').click(function(){
	    $('#page-offadd').fadeIn('fast');
	    $('#shade3').fadeIn('fast');
	    $('#shade2').hide();
	    $('#uptext2').text('OFF 일정 등록')
	    $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
	    $('#float_btn_wrap').fadeOut();
	    $('#page-base').fadeOut();
	    $('#page-base-addstyle').fadeIn();
	    $("#datepicker_off").datepicker('setDate',null)
	})

	$('#upbutton-x').click(function(){
	    $('#shade3').fadeOut();
	    $('#page-ptadd').fadeOut('fast','swing');
	    $('#page-offadd').fadeOut('fast','swing');
	    $('#float_btn_wrap').fadeIn();
	    $('#float_btn').removeClass('rotate_btn');
	    $('#page-base').fadeIn();
	    $('#page-base-addstyle').fadeOut();

	    $("#membersSelected button").removeClass("dropdown_selected");
        $("#membersSelected .btn:first-child").html("<span style='color:#cccccc;'>회원명 선택</span>");
        $("#membersSelected .btn:first-child").val("");
        $("#countsSelected").text("")
        $("#dateSelector p").removeClass("dropdown_selected");
        $('#timeGraph').hide();
        $("#starttimesSelected button").removeClass("dropdown_selected");
        $("#starttimesSelected .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
        $("#starttimesSelected .btn:first-child").val("");
        $("#durationsSelected button").removeClass("dropdown_selected");
        $("#durationsSelected .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
        $("#durationsSelected .btn:first-child").val("");
        $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
        $("#starttimes").empty();
        $("#durations").empty();

        $("#dateSelector_off p").removeClass("dropdown_selected");
        $('#timeGraph_off').hide();
        $("#starttimesSelected_off button").removeClass("dropdown_selected");
        $("#starttimesSelected_off .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
        $("#starttimesSelected_off .btn:first-child").val("");
        $("#durationsSelected_off button").removeClass("dropdown_selected");
        $("#durationsSelected_off .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
        $("#durationsSelected_off .btn:first-child").val("");
        $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
  		$("#starttimes_off").empty();
        $("#durations_off").empty();

        $('.tdgraph').removeClass('graphindicator')

  	})
  //모바일 스타일

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
			$("#cal_popup").fadeIn('fast').css({'z-index':'103'});
			$('#shade2').css({'display':'block'});
			console.log($(this).attr('class-time')); //현재 클릭한 요소의 class-time 요소 값 보기
			                                         //형식예: 2017_10_7_6_00_2_원빈
			console.log($(this).attr('schedule-id'));
			var info = $(this).attr('class-time').split('_')
			var yy=info[0]
			var mm=info[1]
			var dd=info[2]
			var dayobj = new Date(yy,mm-1,dd)
			var dayraw = dayobj.getDay();
			var dayarry = ['일','월','화','수','목','금','토']
			var day = dayarry[dayraw];
			var infoText =  yy+'. '+mm+'. '+dd+' '+'('+day+')'
			var infoText2 =  info[6]+' 회원님 '+info[3]+'시 일정'
			$('#popup_info').text(infoText)
			$('#popup_info2').text(infoText2)
			$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
			$("#id_schedule_id_modify").val($(this).attr('schedule-id')); //shcedule 정보 저장
			$("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
			$("#id_lecture_id_modify").val($(this).attr('data-lectureId')); //lecture id 정보 저장
			schedule_on_off = 1;

		})

	//Off 일정 클릭시 팝업 Start
		$(document).on('click','div.offTime',function(){ //일정을 클릭했을때 팝업 표시
			$("#cal_popup").fadeIn('fast').css({'z-index':'103'});
			$('#shade2').css({'display':'block'});
			console.log($(this).attr('off-time')); //현재 클릭한 요소의 class-time 요소 값 보기
			                                         //형식예: 2017_10_7_6_00_2_원빈
			console.log($(this).attr('off-schedule-id'));
			var info = $(this).attr('off-time').split('_')
			var yy=info[0]
			var mm=info[1]
			var dd=info[2]
			var dayobj = new Date(yy,mm-1,dd)
			var dayraw = dayobj.getDay();
			var dayarry = ['일','월','화','수','목','금','토']
			var day = dayarry[dayraw];
			var infoText =  yy+'. '+mm+'. '+dd+' '+'('+day+')'
			var infoText2 = info[3]+'시 OFF 일정'
			$('#popup_info').text(infoText)
			$('#popup_info2').text(infoText2)
			$("#id_off_schedule_id").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
			$("#id_off_schedule_id_modify").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
			schedule_on_off = 0;

		})

		$("#btn_close").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup').css('display')=='block'){
				$("#cal_popup").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
		})

		$("#btn_close3").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup3').css('display')=='block'){
				$("#cal_popup3").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
		})

		$("#popup_text4").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup3').css('display')=='block'){
				$("#cal_popup3").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
		})


		//스케쥴 클릭시 팝업 End
		//일정 변경 기능 추가 - hk.kim 171007
		$("#popup_text1").click(function(){  //일정 변경 버튼 클릭
				if(schedule_on_off==1){
					//PT 일정 변경시
					document.getElementById('pt-modify-form').submit();
				}
				else{
					document.getElementById('off-modify-form').submit();
				}
		})
		//일정 삭제 기능 추가 - hk.kim 171007
		$("#popup_text2").click(function(){  //일정 삭제 버튼 클릭
			$('#cal_popup').hide().css({'z-index':'-2'});
			$('#cal_popup3').fadeIn('fast').css({'z-index':'103'});
		})

		$('#popup_text3').click(function(){  //일정 삭제 버튼 클릭
			if(schedule_on_off==1){
				//PT 일정 삭제시
				document.getElementById('daily-pt-delete-form').submit();
			}
			else{
				document.getElementById('daily-off-delete-form').submit();
			}
		})



	//플로팅 버튼 Start
	$('#float_btn').click(function(){
		$("#float_btn").animate({opacity:'1'})
		if($('#shade2').css('display')=='none'){
			$('#shade2').css({'display':'block'});
			$('#float_inner1').animate({'opacity':'1','bottom':'85px'},120);
			$('#float_inner2').animate({'opacity':'1','bottom':'145px'},120);
			$('#float_btn').addClass('rotate_btn');
		}else{
			$('#shade2').css({'display':'none'});
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
	var currentDay = date.getDay() // 0,1,2,3,4,5,6,7
	var currentHour = date.getHours();
	var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31];      //각 달의 일수
	if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
			lastDay[1] = 29;
		}else{
			lastDay[1] = 28;
		};

	var weekDay = ['일','월','화','수','목','금','토'];
	var firstDayInfoPrevMonth = new Date(currentYear,currentMonth-1,1);
	var firstDayPrevMonth = firstDayInfoPrevMonth.getDay(); //전달 1일의 요일
	var firstDayInfoNextMonth = new Date(currentYear,currentMonth+1,1);
	var firstDayNextMonth = firstDayInfoNextMonth.getDay(); //다음달 1일의 요일
	var currentPageMonth = currentMonth+1; //현재 달

// ############################구동시 실행################################################################################
// ****************************구동시 실행********************************************************************************
	calTable_Set(2,currentYear,currentPageMonth,'0W'); //3번 슬라이드에 현재달, 현재주 채우기 0W : 0 Week
	calTable_Set(3,currentYear,currentPageMonth,'1L'); //4번 슬라이드에 현재달, 현재주 +1 달력채우기 1L : 1 Week Later
	calTable_Set(4,currentYear,currentPageMonth,'2L'); //5번 슬라이드에 현재달, 현재주 +2 달력채우기 2L : 2 Week Later
	calTable_Set(0,currentYear,currentPageMonth,'2E'); //1번 슬라이드에 현재달, 현재주 -2 달력채우기 2E : 2 Week Early
	calTable_Set(1,currentYear,currentPageMonth,'1E');  //2번 슬라이드에 현재달, 현재주 -1 채우기 1E : 1 Week Early
	weekNum_Set()

	DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classTimeArray,"class");
	DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offTimeArray);
	addcurrentTimeIndicator_blackbox()
	//addcurrentTimeIndicator();
	scrollToIndicator();
	classTime(); //PT수업 시간에 핑크색 박스 표시
	offTime();
// ****************************구동시 실행********************************************************************************
// ############################구동시 실행################################################################################

	//다음페이지로 슬라이드 했을때 액션
	myswiper.on('SlideNextEnd',function(){
			//slideControl.next();
			weekNum_Set();	
	});

	//이전페이지로 슬라이드 했을때 액션
	myswiper.on('SlidePrevEnd',function(){
			//slideControl.prev();
			weekNum_Set();
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
			//alltdRelative();
			//classTime();
			//offTime();
			//myswiper.update(); //슬라이드 업데이트
		},

		'prev': function(){
			//alltdRelative();		
			//classTime();
			//offTime();
			//myswiper.update(); //이전페이지로 넘겼을때
		}
	};

	function calTable_Set(Index,Year,Month,Week){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성 
		//Week 선택자 2E, 1E, 0W, 1L, 2L
		switch(Week){
			case '2E':
			var W = -14;
			break;
			case '1E':
			var W = -7;
			break;
			case '0W':
			var W = 0;
			break;
			case '1L':
			var W = 7;
			break;
			case '2L':
			var W = 14;
			break;
		}
		//주간달력 상단표시줄 (요일, 날짜, Today표식)
		var slideIndex = $('#slide'+Index);
		var currentDates = currentDate+W;
		for(var i=5; i<=24; i++){
			var textToAppend = '<div id="'+i+'H_'+Year+'_'+Month+'_'+currentDate+'_'+Week+'" class="time-style" style="top: '+'">'
			var divToAppend = $(textToAppend)
			//var slidevalue = $('#slide'+Index+' #weekNum_'+Number(j+1)+' span:nth-child(3)').text();
			var slidevalue = "test"

			//var td1= '<td'+' data-time='+Year+'_'+Month+'_'+slidevalue+'_'+(i-1)+'_'+'30'+'>'+'<div></div>'+'</td>';
			//var td2= '<td'+' data-time='+Year+'_'+Month+'_'+slidevalue+'_'+i+'_'+'00'+'>'+'<div></div>'+'</td>';

			switch(currentDay){
				case 0 :
				var td1 = []
				var td2 = []
				for(z=0; z<=6; z++){
					if(currentDates+z>lastDay[currentMonth]){
						td1[z]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				var td2_1 = td2.join('')
				break;

				case 1 :
				var td1 = []
				var td2 = []
				for(z=-1; z<=5; z++){
					if(currentDates+z>lastDay[currentMonth]){
						td1[z+1]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+1]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+1]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+1]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
					else if(currentDates+z<=0){
						td1[z+1]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+1]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				var td2_1 = td2.join('')
				break;

				case 2 :
				var td1 = []
				var td2 = []
				for(z=-2; z<=4; z++){
					if(currentDates+z>lastDay[currentMonth]){
						td1[z+2]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+2]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+2]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+2]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+2]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+2]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				var td2_1 = td2.join('')
				break;
				
				case 3 :
				var td1 = []
				var td2 = []
				for(z=-3; z<=3; z++){
					if(currentDates+z>lastDay[currentMonth]){
						td1[z+3]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+3]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+3]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+3]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+3]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+3]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				var td2_1 = td2.join('')
				break;

				case 4 :				
				var td1 = []
				var td2 = []
				for(z=-4; z<=2; z++){
					if(currentDates+z>lastDay[currentMonth]){
						td1[z+4]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+4]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+4]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+4]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+4]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+4]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				var td2_1 = td2.join('')
				break;
				
				case 5 :				
				var td1 = []
				var td2 = []
				for(z=-5; z<=1; z++){
					if(currentDates+z>lastDay[currentMonth]){
						td1[z+5]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+5]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+5]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+5]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+5]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+5]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				var td2_1 = td2.join('')
				break;
				
				case 6 :				
				var td1 = []
				var td2 = []
				for(z=-6; z<=0; z++){
					if(currentDates+z>lastDay[currentMonth]){
						td1[z+6]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+6]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+6]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+6]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+6]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+6]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				var td2_1 = td2.join('')
				break;
			}
			//var td = td1_1+td1_2+td1_3+td1_4+td1_5+td1_6+td1_7+'</tr><tr>'+td2_1+td2_2+td2_3+td2_4+td2_5+td2_6+td2_7+'</tr></tbody></table></div>'
			var td= td1_1+'</tr><tr>'+td2_1+'</tr></tbody></table></div>'
			if(i<10){
					textToAppend2 = '<table id="'+Year+'_'+Month+'_'+currentDate+'_'+Week+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="hour" rowspan="2">'+'0'+i+'<div></div></td>'+td
			}else{
					textToAppend2 = '<table id="'+Year+'_'+Month+'_'+currentDate+'_'+Week+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="hour" rowspan="2">'+i+'<div></div></td>'+td
			};
			var sum = textToAppend+textToAppend2
			divToAppend.html(sum)
			slideIndex.append(divToAppend);
		};
	}; //calTable_Set


	
	function weekNum_Set(){
		var index = Number(myswiper.activeIndex+1);
		var Sunday_date = $('#sunDate')
		var Monday_date = $('#monDate')
		var Tuesday_date = $('#tueDate')
		var Wednesday_date = $('#wedDate')
		var Thursday_date = $('#thrDate')
		var Friday_date = $('#friDate')
		var Saturday_date = $('#satDate')
		var WeekArry = [Sunday_date,Monday_date,Tuesday_date,Wednesday_date,Thursday_date,Friday_date,Saturday_date]
		var lastDayThisMonth = lastDay[currentMonth];
		var swiperPage = $('.swiper-slide:nth-child('+index+') div:first-child') 
		/*
		for(var i=0; i<7; i++){
			var dateID = swiperPage.find('td:nth-child(2)').attr('id').split('_');
			var firstDate = Number(dateID[2])
			if(firstDate+i<=lastDayThisMonth){
				WeekArry[i].html(firstDate+i)	
			}else{
				WeekArry[i].html(firstDate+i-lastDayThisMonth)
			}
		}
		*/
		for(var i=2; i<=8; i++){
			var dateID = swiperPage.find('td:nth-child('+i+')').attr('id').split('_');
			WeekArry[i-2].html(dateID[2])
		}


		$('#yearText').text(currentYear+'년');
		$('#monthText').text(dateID[1]+'월');
		toDay();
	}

	function dateText(){ //
		//currentYMD 형식  ex : 2017_8_4_5H
		$('#yearText').text(currentYear+'년');
		$('#monthText').text(currentPageMonth+'월');
	};

	function toDay(){
		for(i=1;i<=7;i++){
		var scan = $('#weekNum_'+i+' span:nth-child(3)').text()
			if(scan==currentDate){
				$('#weekNum_'+i+' span:nth-child(1)').addClass('today').html('TODAY')
				$('#weekNum_'+i+' span:nth-child(3)').addClass('today-Number')
			}else{
				$('#weekNum_'+i+' span:nth-child(1)').removeClass('today').html('')
				$('#weekNum_'+i+' span:nth-child(3)').removeClass('today-Number')
			}
		}
	}


	function classTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
		var classlen = classTimeArray.length;
		$('#calendar').css('display','none');
		for(var i=0; i<classlen; i++){
			var indexArray = classTimeArray[i]
			var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
			var classYear = datasplit[0]
			var classMonth = datasplit[1]
			var classDate = datasplit[2]
			var classHour = datasplit[3]
			var classMinute = datasplit[4]
			var classDura = datasplit[5];
			var memberName = datasplit[6];
			if(memberName.length>3){
				var memberName = memberName.substr(0,3) + ".."
			}
			var classStartArr = [classYear,classMonth,classDate,classHour,classMinute]
			var classStart = classStartArr.join("_")
			//var classStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
			var tdClassStart = $("#"+classStart+" div");
			//schedule-id 추가 (일정 변경 및 삭제를 위함) hk.kim, 171007
			tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*30)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+classHour+':'+classMinute+'</span>');
		};
		$('#calendar').css('display','block');
	};

	function offTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
		var offlen = offTimeArray.length;
		$('#calendar').css('display','none');
		for(var i=0; i<offlen; i++){
			var indexArray = offTimeArray[i]
			var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
			var offYear = datasplit[0]
			var offMonth = datasplit[1]
			var offDate = datasplit[2]
			var offHour = datasplit[3]
			var offMinute = datasplit[4]
			var offDura = datasplit[5];
			var memberName = datasplit[6];
			var offStartArr = [offYear,offMonth,offDate,offHour,offMinute]
			var offStart = offStartArr.join("_")
			//var offStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
			var tdOffStart = $("#"+offStart+" div");
			tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*30)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+offHour+':'+offMinute+'</span>');
		};
		$('#calendar').css('display','block');
	};


	/*
	function addcurrentTimeIndicator(){ //현재 시간에 밑줄 긋기
		var where2 = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+"0W"+"_"+currentHour+'H'
		//var where3 = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+"0W"+"_"+(currentHour+1)+'H'
		if($('.currentTimeBox').length==""){
			$(where2).parent('div').append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
			//$(where3).parent('div').append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
		}
	}
	*/

	function addcurrentTimeIndicator_blackbox(){ //현재 시간에 밑줄 긋기
		var where = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+'0W'+'_'+currentHour+'H .hour'
		$(where).addClass('currentTimeBlackBox');
		
	}

	function scrollToIndicator(){
		var offset = $('.currentTimeBlackBox').offset();
		console.log(offset)
		if(currentHour>=5){
			$('#slide2').animate({scrollTop : offset.top -180},500)
		}
	}


	function DBdataProcess(startarray,endarray,result,option){
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
    		}else{
    			startSplitArray.push(classTimeArray_member_name[i])	
    			result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+"OFF"+"_"+endSplitArray[3]+"_"+endSplitArray[4]);		
    		}	
  	    }
	}

/*
	//ajax////////////////////////////////////////////////////////////////////////////////////////////////////////
	//연월 표기하는 상단 바를 눌렀을때 수업시간을 불러와서 표기한다.
          $('#ymdText').click(function(){
            $.ajax({
              url:'/static/user/js/ajax/dblist.js',
              dataType : 'script',
              success:function(data){
                var classTimeArray_start_date=[]
                var classTimeArray_start_date = JSON.parse(data)
                var jdata = JSON.parse(data)
                for(i=0;i<jdata.length;i++){
                  classTimeArray_start_date.push(jdata[i])
                }
                DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classTimeArray,"class");
                classTime();
              }

            })
          })

	//ajax////////////////////////////////////////////////////////////////////////////////////////////////////////          
*/

});//document(ready)

