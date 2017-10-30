$(document).ready(function(){

	var schedule_on_off = 0; //0 : OFF Schedule / 1 : PT Schedule

	//스케쥴 클릭시 팝업 Start
		$(document).on('click','div.classTime',function(){ //일정을 클릭했을때 팝업 표시
			$("#cal_popup").show().css({'z-index':'103'});
			$('#shade2').css({'display':'block'});
			console.log($(this).attr('class-time')); //현재 클릭한 요소의 class-time 요소 값 보기
			                                         //형식예: 2017_10_7_6_00_2_원빈
			console.log($(this).attr('schedule-id'));
			var info = $(this).attr('class-time').split('_')
			var infoText = info[6]+' 회원님 '+info[3]+'시 일정'
			$('#popup_info').text(infoText)
			$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
			$("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
			schedule_on_off = 1;

		})

	//Off 일정 클릭시 팝업 Start
		$(document).on('click','div.offTime',function(){ //일정을 클릭했을때 팝업 표시
			$("#cal_popup").show().css({'z-index':'103'});
			$('#shade2').css({'display':'block'});
			console.log($(this).attr('off-time')); //현재 클릭한 요소의 class-time 요소 값 보기
			                                         //형식예: 2017_10_7_6_00_2_원빈
			console.log($(this).attr('off-schedule-id'));
			var info = $(this).attr('off-time').split('_')
			var infoText = info[3]+'시 OFF 일정'
			$('#popup_info').text(infoText)
			$("#id_off_schedule_id").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
			schedule_on_off = 0;

		})

	$("#btn_close").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup').css('display')=='block'){
				$("#cal_popup").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
	})
	//스케쥴 클릭시 팝업 End

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


	//플로팅 버튼 Start
	$('#float_btn').click(function(){
		$("#float_btn").animate({opacity:'1'})
		if($('#shade2').css('display')=='none'){
			$('#shade2').css({'display':'block'});
			$('#float_inner1').animate({'opacity':'0.7','bottom':'85px'},120);
			$('#float_inner2').animate({'opacity':'0.7','bottom':'145px'},120);
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
	var currentDay = date.getDay(); // 0,1,2,3,4,5,6,7
	var currentHour = date.getHours();
	var lastDay = new Array(31,28,31,30,31,30,31,31,30,31,30,31);      //각 달의 일수
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

	//다음페이지로 슬라이드 했을때 액션
	myswiper.on('SlideNextEnd',function(){
		dateText();
		/*
		if(currentDate+1>lastDay[currentPageMonth-1]){ //다음달 넘어갈때
			if(currentPageMonth+1>12){//다음해 넘어갈떄
				slideControl.append();
			}else{
				slideControl.append();
			}
		}else{
			slideControl.append();
		};
		*/
	});

	//이전페이지로 슬라이드 했을때 액션
	myswiper.on('SlidePrevEnd',function(){
		dateText();
		/*
		if(currentDate-1<1){ //전달 넘어갈떄
			if(currentPageMonth-1<1){ //전해로 넘어갈때 	
				slideControl.prepend();
			}else{
				slideControl.prepend();	
			}
		}else{
			slideControl.prepend();	
		};
		*/
	});
	

	//페이지 이동에 대한 액션 클래스
	var slideControl = {
		'append' : function(){ //다음페이지로 넘겼을때
			//myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
			//myswiper.appendSlide('<div class="swiper-slide"></div>') //마지막 슬라이드에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.appendSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth+1)+'월'+' currentPageMonth: '+Number(currentPageMonth+1)+'</div>') //마지막 슬라이드에 새슬라이드 추가
			//calTable_Set(3,currentYear,currentPageMonth,currentDate+1); //새로 추가되는 슬라이드에 달력 채우기
			dateText();
			//classTime();
			//offTime();
			//addcurrentTimeIndicator(); //현재시간 표시
			//myswiper.update(); //슬라이드 업데이트

		},

		'prepend' : function(){
			//myswiper.removeSlide(2);
			//myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
			//calTable_Set(1,currentYear,currentPageMonth,currentDate-1);		
			dateText();
			//classTime();
			//offTime();
			//addcurrentTimeIndicator(); //현재시간 표시
			//myswiper.update(); //이전페이지로 넘겼을때
		}
	};

	//Slide 10번째를 [오늘]로 기준으로 각페이지에 날짜에 맞춰 테이블 생성하기
	var element = 10-currentDate
		if(element>0){
			for(i=1;i<=element;i++){
				calTable_Set(i,currentYear,currentPageMonth-1,lastDay[currentPageMonth-1]-element+i-1)	
			}
			for(i=element+1;i<=23;i++){
				calTable_Set(i,currentYear,currentPageMonth,currentDate-10+i)	
			}
		}else{
			for(i=1;i<=23;i++){
				if(currentDate-10+i-1>lastDay[currentPageMonth]){
					calTable_Set(i,currentYear,currentPageMonth+1,currentDate-10+i-lastDay[currentPageMonth+1])
				}else{
					calTable_Set(i,currentYear,currentPageMonth,currentDate-10+i)	
				}
			}
		}
	//Slide 10번째를 [오늘]로 기준으로 각페이지에 날짜에 맞춰 테이블 생성하기
	
	dateText(); //상단에 연월일요일 표시
	DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classTimeArray,"class"); //DB로 부터 받는 Class데이터 가공
	DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offTimeArray); //DB로 부터 받는 Off 데이터 가공
	//addcurrentTimeIndicator(); //현재 시간에 밑줄 긋기 (구버전)
	//scrollToIndicator(); //현재 시간으로 스크롤 자동 이동
	addcurrentTimeIndicator_blackbox(); //현재 시간 검은색 Background 표시
	classTime(); //PT수업 시간에 핑크색 박스 표시
	offTime(); //Off 시간에 회색 박스 표시

	function calTable_Set(Index,Year,Month,Day){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성
		var slideIndex = $('#slide'+Index);
		for(var i=5; i<=24; i++){
			var textToAppend = '<div id="'+i+'H_'+Year+'_'+Month+'_'+Day+'" class="time-style"'+'>'
			var divToAppend = $(textToAppend)
			//var td1 = '<td'+' id='+Year+'_'+Month+'_'+Day+'_'+(i-1)+'_'+'30'+'>'+'<div></div>'+'</td>'
			//var td2 = '<td'+' id='+Year+'_'+Month+'_'+Day+'_'+i+'_'+'00'+'>'+'<div></div>'+'</td>'
			var td1 = '<td'+' id='+Year+'_'+Month+'_'+Day+'_'+i+'_'+'00'+'>'+'<div></div>'+'</td>'
			var td2 = '<td'+' id='+Year+'_'+Month+'_'+Day+'_'+i+'_'+'30'+'>'+'<div></div>'+'</td>'
			if(i<12){
				if(i<10){
					var textToAppend2 = '<table id="'+Year+'_'+Month+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="hour" rowspan="2">'+'오전 0'+i+'.00'+'<div></div></td>'+td1+'</tr><tr>'+td2+'</tr></tbody></table></div>';		
				}else{
					var textToAppend2 = '<table id="'+Year+'_'+Month+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="hour" rowspan="2">'+'오전 '+i+'.00'+'<div></div></td>'+td1+'</tr><tr>'+td2+'</tr></tbody></table></div>';		
				};
			}else{
				var textToAppend2 = '<table id="'+Year+'_'+Month+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="hour" rowspan="2">'+'오후 '+i+'.00'+'<div></div></td>'+td1+'</tr><tr>'+td2+'</tr></tbody></table></div>';			
			}
			var sum = textToAppend+textToAppend2
			divToAppend.html(sum)
			slideIndex.append(divToAppend);
		};	
	}; //calTable_Set

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
			var classEndHour = datasplit[7];
			var classEndMinute = datasplit[8];
			var classStartArr = [classYear,classMonth,classDate,classHour,classMinute]
			var classStart = classStartArr.join("_")
			//var classStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
			var tdClassStart = $("#"+classStart+" div");
			//schedule-id 추가 (일정 변경 및 삭제를 위함) hk.kim, 171007
			if(Number(classHour)+Number(classDura)==25){	// 오전 1시에 일정이 차있을 경우 일정 박스가 Table 넘어가는 것 픽스
				if(classDura<=3){
					tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35)+'px'}).html('<span class="memberName'+classDura+'">'+memberName+' </span>'+'<span class="memberTime'+classDura+'">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');		
				}else{
					tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
				}
			}else{
				if(classDura<=3){
					tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px'}).html('<span class="memberName'+classDura+'">'+memberName+' </span>'+'<span class="memberTime'+classDura+'">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');		
				}else{
					tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
				}	
			}
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
			var offEndHour = datasplit[7];
			var offEndMinute = datasplit[8];
			var offStartArr = [offYear,offMonth,offDate,offHour,offMinute]
			var offStart = offStartArr.join("_")
			//var offStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
			var tdOffStart = $("#"+offStart+" div");
			if(Number(offHour)+Number(offDura)==25){  // 오전 1시에 일정이 차있을 경우 일정 박스가 Table 넘어가는 것 픽스
				if(offDura<=3){
				tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*35)+'px'}).html('<span class="memberName'+offDura+'">'+memberName+' </span>'+'<span class="offTimeText'+offDura+'">'+offHour+':'+offMinute+' ~ '+offEndHour+':'+offEndMinute+'</span>');			
				}else{
				tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*35)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="offTimeText3">'+offHour+':'+offMinute+' ~ '+offEndHour+':'+offEndMinute+'</span>');
				}
			}else{
				if(offDura<=3){
				tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*35.5)+'px'}).html('<span class="memberName'+offDura+'">'+memberName+' </span>'+'<span class="offTimeText'+offDura+'">'+offHour+':'+offMinute+' ~ '+offEndHour+':'+offEndMinute+'</span>');			
				}else{
				tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*35.5)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="offTimeText3">'+offHour+':'+offMinute+' ~ '+offEndHour+':'+offEndMinute+'</span>');
				}	
			}
		};
		$('#calendar').css('display','block');
	};

	function dateText(){ //
		//currentYMD 형식  ex : 2017_8_4_5H
		var index = Number(myswiper.activeIndex)+1;
		var currentYMD = $('.swiper-slide:nth-child('+index+') div').attr('id');
		var YMDArray=currentYMD.split('_')
		var textYear = YMDArray[1] //2017
		var textMonth = YMDArray[2]; //8
		var textDate = YMDArray[3]; //4
		var monthEnglish = ['January','February','March','April','May','June','July','August','September','October','November','December']
		var dayEnglish = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
		var dayTodayInfo = new Date(monthEnglish[textMonth-1]+','+textDate+','+textYear);
		var dayToday = dayTodayInfo.getDay();
		var textDay = dayEnglish[dayToday];

		$('#yearText').text(textYear+'년 '+textMonth+'월 '+textDate+'일');
		$('#monthText').text(textDay);
	};

	function addcurrentTimeIndicator(){ //현재 시간에 밑줄 긋기
		var where = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+currentHour+'H'
		var where3 = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+Number(currentHour+1)+'H'
		if($('.currentTimeBox').length==""){
			$(where).parent('div').append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
			$(where3).parent('div').append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
		}
	}

	function addcurrentTimeIndicator_blackbox(){ //현재 시간에 밑줄 긋기
		var where = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+currentHour+'H .hour'
		$(where).addClass('currentTimeBlackBox');
		
	}

	function scrollToIndicator(){
		var offset = $('.currentTimeBox').offset();
		$('html, body').animate({scrollTop : offset.top-180},500)
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

});//document(ready)

