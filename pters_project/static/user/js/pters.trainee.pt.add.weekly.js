/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/

$(document).ready(function(){

	var userCheckedHourArray = []
	$('#upbutton-alarm').click(function(){
		var userCheckedHourArray = []
		var checkedLength = $('.ptersCheckboxInner').length
		for(var i=0; i<checkedLength; i++){
			var checkedHour = $('.ptersCheckboxInner').eq(i).attr('data-time')	
			userCheckedHourArray[i]=checkedHour
		}
		alert('추가된 시간은 총 '+checkedLength+'건'+' Array = ['+userCheckedHourArray+'],') //디버깅용
		if(checkedLength>0){
             document.getElementById('pt-add-form').submit();
		}
	})


	$(document).on('click','.ptersCheckbox',function(){
		var checkBox = $(this).find('div')
		var date_info = $(this).parent('td').attr('id')
		if(!checkBox.hasClass('ptersCheckboxInner')){
			checkBox.addClass('ptersCheckboxInner').attr('data-time',$(this).parent('td').attr('id'))
			var add_form = '#pt-add-form'
			var date_form = date_info.split('_')
			var yy=date_form[0]
			var mm=date_form[1]
			var dd=date_form[2]
			var hour=date_form[3]
			var min=date_form[4]
			var pt_size = '#add-pt-count'
			//$("#id_schedule_id").val()
			$(add_form).append("<input type='hidden' name='training_date[]' id='id_training_date_"+date_info+"' value='"+yy+"-"+mm+"-"+dd+"'>" +
				"<input type='hidden' name='time_duration[]' id='id_time_duration_"+date_info+"' value='"+hour+":"+min+":00.000000'>" +
				"<input type='hidden' name='training_time[]' id='id_training_time_"+date_info+"' value='1'>")

		}else if(checkBox.hasClass('ptersCheckboxInner')){
			checkBox.removeClass('ptersCheckboxInner')
			var delete_input_form1 = '#id_training_date_'+date_info
			var delete_input_form2 = '#id_time_duration_'+date_info
			var delete_input_form3 = '#id_training_time_'+date_info
			$(delete_input_form1).remove()
			$(delete_input_form2).remove()
			$(delete_input_form3).remove()
		}
	})

	$('#ymdText').click(function(){
		var checked = $('.ptersCheckbox div')
		checked.removeClass('ptersCheckboxInner')
	});


	var schedule_on_off = 0; //0 : OFF Schedule / 1 : PT Schedule
	//상단바 터치시 주간달력에 회원명/시간 표시 ON OFF

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
	addcurrentTimeIndicator();
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
			var checkBoxClass = "ptersNotAvail"
			break;
			case '1E':
			var W = -7;
			var checkBoxClass = "ptersNotAvail"
			break;
			case '0W':
			var W = 0;
			var checkBoxClass = "ptersCheckbox"
			break;
			case '1L':
			var W = 7;
			var checkBoxClass = "ptersCheckbox"
			break;
			case '2L':
			var W = 14;
			var checkBoxClass = "ptersCheckbox"
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
						td1[z]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
						
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
						
					}else if(currentDates+z<=0){
						td1[z]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
						
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
						td1[z+1]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+1]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}
					else if(currentDates+z<=0){
						td1[z+1]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
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
						td1[z+2]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+2]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+2]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
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
						td1[z+3]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+3]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+3]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
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
						td1[z+4]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+4]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+4]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
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
						td1[z+5]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+5]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+5]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
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
						td1[z+6]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+6]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+6]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+'>'+'<div class="'+checkBoxClass+'"><div></div></div>'+'</td>';
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
			for(var j=0; j<classDura; j++){
				var classStartArr = [classYear,classMonth,classDate,Number(classHour)+j,classMinute]
				var classStart = classStartArr.join("_")
				var tdClassStart = $("#"+classStart+" div");
				tdClassStart.removeClass('ptersCheckbox')
				tdClassStart.addClass('ptersNotAvail')
			}
			//강사 주간달력용 코드
			//tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*30)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+classHour+':'+classMinute+'</span>');
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
			for(var j=0; j<offDura; j++){
				var offStartArr = [offYear,offMonth,offDate,Number(offHour)+j,offMinute]
				var offStart = offStartArr.join("_")
				var tdOffStart = $("#"+offStart+" div");
				tdOffStart.removeClass('ptersCheckbox')
				tdOffStart.addClass('ptersNotAvail')
			}
			//강사 주간달력용 코드
			//tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*30)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+offHour+':'+offMinute+'</span>');
		};
		$('#calendar').css('display','block');
	};


	function addcurrentTimeIndicator(){ //현재 시간에 밑줄 긋기
		var where2 = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+"0W"+"_"+currentHour+'H'
		if($('.currentTimeBox').length==""){
			$(where2).parent('div').append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
			$(where2).find('.hour').css('color','white')
		}
	}

	function scrollToIndicator(){
		var offset = $('.currentTimeBox').offset();
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

});//document(ready)

