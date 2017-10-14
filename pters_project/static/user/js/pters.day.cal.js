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

	//날짜 불변
	var dateorigin = new Date();
	var OricurrentYear = dateorigin.getFullYear();
	var OricurrentMonth = dateorigin.getMonth();
	var OricurrentDate = dateorigin.getDate();
	var OricurrentHour = dateorigin.getHours();
	//

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

	var weekDay = ['일','월','화','수','목','금','토'];
	var firstDayInfoPrevMonth = new Date(currentYear,currentMonth-1,1);
	var firstDayPrevMonth = firstDayInfoPrevMonth.getDay(); //전달 1일의 요일
	var firstDayInfoNextMonth = new Date(currentYear,currentMonth+1,1);
	var firstDayNextMonth = firstDayInfoNextMonth.getDay(); //다음달 1일의 요일
	var currentPageMonth = currentMonth+1; //현재 달




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
		};
	});
	

	//페이지 이동에 대한 액션 클래스
	var slideControl = {
		'append' : function(){ //다음페이지로 넘겼을때
			//myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
			//myswiper.appendSlide('<div class="swiper-slide"></div>') //마지막 슬라이드에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.appendSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth+1)+'월'+' currentPageMonth: '+Number(currentPageMonth+1)+'</div>') //마지막 슬라이드에 새슬라이드 추가
			//calTable_Set(3,currentYear,currentPageMonth,currentDate+1); //새로 추가되는 슬라이드에 달력 채우기				alltdRelative(
			dateText();
			//classTime();
			//offTime();
			addcurrentTimeIndicator(); //현재시간 표시
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
			addcurrentTimeIndicator(); //현재시간 표시
			//myswiper.update(); //이전페이지로 넘겼을때
		}
	};

	
	daycal_TableSet();
	DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classTimeArray,"class");
	DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offTimeArray);
	addcurrentTimeIndicator();
	scrollToIndicator();
	classTime(); //PT수업 시간에 핑크색 박스 표시
	offTime();
	dateText();
	
	function daycal_TableSet(){ //일간 달력 각 페이지의 요소들에 id 및 data-time 부여
        var date = new Date();
        var currentYear = date.getFullYear(); //현재 년도
        var currentMonth = date.getMonth()+1; //달은 0부터 출력해줌 0~11
        var currentDate = date.getDate(); //오늘 날짜
        var currentDay = date.getDay(); // 0,1,2,3,4,5,6,7
        var lastDay = new Array(31,28,31,30,31,30,31,31,30,31,30,31);  

       	for(var i=0; i<14; i++){
            var dayAlign = currentDate-6+i
            $('#slide'+i).attr('id',currentYear+'-'+currentMonth+'-'+dayAlign)
        };
        
        for(var j=0; j<=14; j++){
        	var day = currentDate-6+j;
        	for(var i=1; i<=20; i++){
        	$('#'+currentYear+'-'+currentMonth+'-'+day+" div div:nth-child("+i+") table").attr("id",currentYear+'_'+currentMonth+'_'+day+'_'+Number(i+4)+'H')        	
        	$('#'+currentYear+'_'+currentMonth+'_'+day+'_'+Number(i+4)+'H tbody tr:nth-child(1) td:nth-child(2)').attr('data-time',currentYear+'_'+currentMonth+'_'+day+'_'+Number(i+4) +'_'+'00')
        	$('#'+currentYear+'_'+currentMonth+'_'+day+'_'+Number(i+4)+'H tbody tr:nth-child(2) td').attr('data-time',currentYear+'_'+currentMonth+'_'+day+'_'+Number(i+4) +'_'+'30')
        	}	
        }
    }

	function classTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
		var classlen = classTimeArray.length;
		for(var i=0; i<classlen; i++){
			var indexArray = classTimeArray[i]
			var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
			var classStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
			var classDura = datasplit[5];
			var memberName = datasplit[6];
			//schedule-id 추가 (일정 변경 및 삭제를 위함) hk.kim, 171007
			$("td[data-time="+classStart+"] div").addClass('classTime').attr('class-time',indexArray).attr('schedule-id',scheduleIdArray[i]).attr('data-memberName',memberName).css({'height':Number(classDura*30)+'px'});
			$("td[data-time="+classStart+"] div").html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+datasplit[3]+':'+datasplit[4]+'</span>');
		};
	};

	function offTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
		var offlen = offTimeArray.length;
		for(var i=0; i<offlen; i++){
			var indexArray = offTimeArray[i]
			var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
			var offStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
			var offDura = datasplit[5];
			var memberName = datasplit[6];
			$("td[data-time="+offStart+"] div").addClass('offTime').attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).css({'height':Number(offDura*30)+'px'});
			$("td[data-time="+offStart+"] div").html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+datasplit[3]+':'+datasplit[4]+'</span>');	
		};
	};

	function dateText(){ //
		//currentYMD 형식  ex : 2017_8_4_5H
		var index = Number(myswiper.activeIndex)+1;
		var currentYMD = $('.swiper-slide:nth-child('+index+')').attr('id');
		var YMDArray=currentYMD.split('-')
		var textYear = YMDArray[0] //2017
		var textMonth = YMDArray[1]; //8
		var textDate = YMDArray[2]; //4
		var monthEnglish = ['January','February','March','April','May','June','July','August','September','October','November','December']
		var dayEnglish = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
		var dayTodayInfo = new Date(monthEnglish[textMonth-1]+','+textDate+','+textYear);
		var dayToday = dayTodayInfo.getDay();
		var textDay = dayEnglish[dayToday];

		$('#yearText').text(textYear+'년 '+textMonth+'월 '+textDate+'일');
		$('#monthText').text(textDay);
	};

	function addcurrentTimeIndicator(){ //현재 시간에 밑줄 긋기
		var where = '#'+OricurrentYear+'_'+Number(OricurrentMonth+1)+'_'+OricurrentDate+'_'+OricurrentHour+'H'
		if($('.currentTimeBox').length==""){
			$(where).parent('div').append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
		}
	}

	function scrollToIndicator(){
		var offset = $('.currentTimeBox').offset();
		$('html, body').animate({scrollTop : offset.top},1000)
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
    	
    		startSplitArray[5] = String(endSplitArray[3] - startSplitArray[3])
    		if(option=="class"){
    			startSplitArray.push(classTimeArray_member_name[i])	
    			result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+startSplitArray[6]);
    		}else{
    			startSplitArray.push(classTimeArray_member_name[i])	
    			result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+"OFF");		
    		}	
  	    }
	}

});//document(ready)

