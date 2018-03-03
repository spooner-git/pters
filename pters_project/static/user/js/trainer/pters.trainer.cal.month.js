/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/

$(document).ready(function(){



	var notAvailableStartTime = 22; //강사가 설정한 예약불가 시간 (시작)
	var notAvailableEndTime = 8; //강사가 설정한 예약불가 시간 (종료)

	$('#float_btn').click(function(){
		$("#float_btn").animate({opacity:'1'})
		if($('#shade').css('display')=='none'){
			$('#shade').show();
			$('#float_inner1').animate({'opacity':'1','bottom':'85px'},120);
			$('#float_inner2').animate({'opacity':'1','bottom':'145px'},120);
			$('#float_btn').addClass('rotate_btn');
		}else{
			$('#shade').hide();
			$('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
			$('#float_btn').removeClass('rotate_btn');
		}
	});

	//플로팅 버튼
	$('#float_inner1, .ymdText-pc-add-pt').click(function(){ //PT추가버튼
		scrollToDom($('#calendar'))
		addTypeSelect = "ptadd"
		$('#memberName,#remainCount').css('display','block');
	    $('#page-addplan').fadeIn('fast');
	    if($('body').width()<600){
	        $('#calendar').hide();
	    }
	    $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
	    $('#float_btn_wrap').fadeOut();
	    $('#uptext2').text('PT 일정 등록')
	    $('#page-base').fadeOut();
	    $('#page-base-addstyle').fadeIn();
	    $("#datepicker").datepicker('setDate',null)
	    
	    if($('body').width()<600){
	    	$('#shade3').fadeIn('fast');
		    $('#calendar').css('height','0')
		    $('#pcaddpopup,#pcaddpopup_off').css('display','none')
	    }else{
	    	$('#pcaddpopup').show()
			$('#pcaddpopup_off').hide()
	    }
	    if($(this).hasClass('ymdText-pc-add-pt')){
	    	$('#shade').fadeIn('fast')
	    }
	})

	$('#float_inner2, .ymdText-pc-add-off').click(function(){ //OFF추가버튼
		scrollToDom($('#calendar'))
		addTypeSelect = "offadd"
		$('#memberName,#remainCount').css('display','none');
	    $('#page-addplan').fadeIn('fast');
	    if($('body').width()<600){
	        $('#calendar').hide();
	    }
	    $('#uptext2').text('OFF 일정 등록')
	    $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
	    $('#float_btn_wrap').fadeOut();
	    $('#page-base').fadeOut();
	    $('#page-base-addstyle').fadeIn();
	    $("#datepicker").datepicker('setDate',null)
	    
	    if($('body').width()<600){
	    	$('#shade3').fadeIn('fast');
		    $('#calendar').css('height','0')
		    $('#pcaddpopup,#pcaddpopup_off').css('display','none')
	    }else{
	    	$('#pcaddpopup').hide()
	    	$('#pcaddpopup_off').show()
	    }

	    if($(this).hasClass('ymdText-pc-add-off')){
	    	$('#shade').fadeIn('fast')
	    }
	})

	$('#upbutton-x').click(function(){
		$('#calendar').css('height','90%')
	    $('#shade3').fadeOut();
	    $('#shade').hide();
	    $('#page-addplan').fadeOut('fast','swing');
	    if($('body').width()<600){
	        $('#calendar').show();
	    }
	    $('#float_btn_wrap').fadeIn();
	    $('#float_btn').removeClass('rotate_btn');
	    $('#page-base').fadeIn();
	    $('#page-base-addstyle').fadeOut();

	    $("#membersSelected button").removeClass("dropdown_selected");
        $("#membersSelected .btn:first-child").html("<span style='color:#cccccc;'>회원명 선택</span>");
        $("#membersSelected .btn:first-child").val("");
        $("#countsSelected,.countsSelected").text("")
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
        $('.tdgraph').removeClass('graphindicator')
  	})

	$(document).on('click','.admonth',function(){
		alert('까꿍~')
	})

	var clicked_td_date_info;
	$(document).on('click','#calendar td',function(){
		if(!$(this).hasClass('nextDates') && !$(this).hasClass('prevDates')){
			$('#cal_popup_plancheck').fadeIn('fast');
			$('#shade').css({'display':'block'});
			var info = $(this).attr('data-date').split('_')
			var yy=info[0]
			var mm=info[1]
			var dd=info[2]
			var dayobj = new Date(yy,mm-1,dd)
			var dayraw = dayobj.getDay();
			var dayarry = ['일','월','화','수','목','금','토']
			var day = dayarry[dayraw];
			var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')'
			var countNum = $(this).find('._classTime').text()
			$('#countNum').text(countNum)
			$('.popup_ymdText').html(infoText)
			plancheck(yy+'_'+mm+'_'+dd)
			clicked_td_date_info = yy+'_'+mm+'_'+dd
		}
	})

	$('#cal_popup_plancheck .btn_close_popup').click(function(){
		$('#cal_popup_plancheck').fadeOut('fast');
		$('#shade').css({'display':'none'});
	})

	$(document).on('click','.plan_raw',function(){
		$('#popup_btn_complete').css({'color':'#333','background':'#ffffff'}).val('')
		var selectedDate = $('.popup_ymdText').text()
		var selectedTime = $(this).find('.planchecktime').text().split(':')[0]
		var selectedPerson = $(this).find('.plancheckname').text()
		$("#cal_popup_planinfo").fadeIn('fast')
		$('#shade').css('z-index','155') //원래는 z-index가 100
		$('#popup_info').text(selectedDate);
		$('#popup_info2').text(selectedPerson+'의 '+ selectedTime + '시 일정');

		$('#canvas').hide().css({'border-color':'#282828'})
		$('#canvasWrap').css({'height':'0px'})
		$('#canvasWrap span').hide();

		$("#id_schedule_id_delete").val($(this).attr('schedule-id')); //shcedule 정보 저장
		$("#id_schedule_id_finish").val($(this).attr('schedule-id')); // shcedule 정보 저장
		$("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_member_name_delete").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_member_name_finish").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_lecture_id_finish").val($(this).attr('data-lectureId')); //lecture id 정보 저장

		var schedule_finish_check = $(this).attr('data-schedule-check')
		if(schedule_finish_check=="0"){
			$("#popup_btn_complete").css("display","block")
        }
        else{
			$("#popup_btn_complete").css("display","none")
		}
		schedule_on_off = 1;
	})

	$("#btn_close").click(function(){  //plan_raw 클릭해서 나오는 개별일정 [일정완료][일정삭제] 팝업의 X버튼
			if($('#cal_popup_planinfo').css('display')=='block'){
				$("#cal_popup_planinfo").css({'display':'none'})
				$('#shade').css({'z-index':'100'});
			}
	})

	var schedule_on_off = 0;

	$("#popup_btn_complete").click(function(){  //일정 완료 버튼 클릭

		if($(this).val()!="filled"){
			$('#canvas').show()
			$('#canvasWrap').animate({'height':'200px'},200)
			$('#canvasWrap span').show();
		}else if($(this).val()=="filled"){
			var $pt_finish_form = $('#pt-finish-form');
			if(schedule_on_off==1){
				//PT 일정 완료 처리시
				$.ajax({
                    url:'/trainer/finish_schedule/',
                    type:'POST',
                    data:$pt_finish_form.serialize(),


                    beforeSend:function(){
                      deleteBeforeSend();
                    },

                    //통신성공시 처리
                    success:function(){
                      closeDeletePopup();
                      deleteCompleteSend();
                      ajaxClassTime()
                      },

                    //보내기후 팝업창 닫기
                    complete:function(){
             			$('#popup_btn_complete').css({'color':'#333','background':'#ffffff'}).val('')
                    	$('#canvas').hide().css({'border-color':'#282828'})
                    	$('#canvasWrap span').hide();
						$('#canvasWrap').css({'height':'0px'})
						$('body').css('overflow-y','overlay');
                      },

                    //통신 실패시 처리
                    error:function(){
                    },
                 })
			}
		}
	})

	//PC버전 새로고침 버튼
	$('.ymdText-pc-add-refresh').click(function(){ 
		ajaxClassTime()
	})
	//PC버전 새로고침 버튼


	//일정 삭제 기능 추가 - hk.kim 171007
	$("#popup_btn_delete").click(function(){  //일정 삭제 버튼 클릭
		$('#cal_popup_planinfo').hide()
		$('#cal_popup_plandelete').fadeIn('fast')
	})

	$('#popup_btn_delete_yes').click(function(){
		var $ptdelform = $('#daily-pt-delete-form');
		var $offdelform = $('#daily-off-delete-form');
		$('body').css('overflow-y','overlay');
		if(schedule_on_off==1){
				//PT 일정 삭제시
				$.ajax({
                    url:'/trainer/delete_schedule/',
                    type:'POST',
                    data:$ptdelform.serialize(),

                    beforeSend:function(){
                     	deleteBeforeSend();
                    },

                    //통신성공시 처리
                    success:function(){
                      closeDeletePopup();
                      deleteCompleteSend();
                      ajaxClassTime()
                      //fake_show()
                      console.log('success')
                      },

                    //보내기후 팝업창 닫기
                    complete:function(){
                    	
                      },

                    //통신 실패시 처리
                    error:function(){
                      console.log("error")
                    },
                 })
		}
		else{
				$.ajax({
                    url:'/trainer/delete_schedule/',
                    type:'POST',
                    data:$offdelform.serialize(),

                    beforeSend:function(){
                    	deleteBeforeSend();
                    },

                    //통신성공시 처리
                    success:function(){
                      closeDeletePopup();
                      deleteCompleteSend();
                      ajaxClassTime()
                      //fake_show()
                      console.log('success')
                      },

                     //보내기후 팝업창 닫기
                    complete:function(){
                      	
                      },

                    //통신 실패시 처리
                    error:function(){
                      console.log("error")
                    },
                 })
		}
	})




	$('#btn_close3, #popup_btn_delete_no').click(function(){ //일정삭제 확인 팝업 아니오 버튼 눌렀을때 팝업 닫기
			if($('#cal_popup_plandelete').css('display')=='block'){
				$("#cal_popup_plandelete").css({'display':'none'})
				$('#shade').css({'z-index':'100'});
			}
	})


	$("#btn_close4").click(function(){ //일정예약 상세화면 팝업 X버튼 눌렀을때 팝업 닫기
		$('.tdgraph').removeClass('graphindicator')
		$('#starttimes').remove('li')
		$('#durations').remove('li')
		$("#starttimesSelected button").removeClass("dropdown_selected");
		$("#durationsSelected button").removeClass("dropdown_selected");
		$("#submitBtn").removeClass('submitBtnActivated');		
		$("#starttimesSelected .btn:first-child").val('').html('선택<span class="caret"></span>')
		$("#durationsSelected .btn:first-child").val('').html('선택<span class="caret"></span>')
		if($('#addpopup').css('display')=='block'){
			$("#addpopup").css({'display':'none','z-index':'-2'})
			$('#shade2').css({'display':'none'});
		}
	})

	$('#ng_popup').click(function(){
		$('#shade2').css({'display':'none'});
		$(this).fadeOut(100)
	})

	function closeDeletePopup(){
		$("#cal_popup_plandelete, #cal_popup_planinfo").css({'display':'none'})
		$("#shade").css({'z-index':'100'})
	}

	function deleteBeforeSend(){
		$('html').css("cursor","wait");
        //$('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
        $('.ajaxloadingPC').show();

	}

	function deleteCompleteSend(){
		$('html').css("cursor","auto");
        //$('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
        $('.ajaxloadingPC').hide();

	}

	function ajaxClassTime(){
            $.ajax({
              url: '/trainer/cal_day_ajax',
              dataType : 'html',

              beforeSend:function(){
              	deleteBeforeSend();
              },

              success:function(data){
              	var jsondata = JSON.parse(data);
                classDateArray = []
                classStartArray = []
                classNameArray = []
                countResult = []
                dateResult = []
                
                classTimeArray_member_name = [];
                classArray_lecture_id = [];
                scheduleIdArray = [];
                offScheduleIdArray = [];
                scheduleFinishArray = [];
                memberLectureIdArray = [];
                memberNameArray = [];
                memberAvailCountArray = [];
                messageArray = [];
                dateMessageArray = [];
                repeatArray= [];
			    offRepeatScheduleTypeArray = [];
			    offRepeatScheduleWeekInforray = [];
			    offRepeatScheduleStartDateArray = [];
			    offRepeatScheduleEndDateArray = [];
                var updatedClassTimeArray_start_date = jsondata.classTimeArray_start_date
                var updatedClassTimeArray_end_date = jsondata.classTimeArray_end_date
                var updatedOffTimeArray_start_date = jsondata.offTimeArray_start_date
                var updatedOffTimeArray_end_date = jsondata.offTimeArray_end_date
                classTimeArray_member_name = jsondata.classTimeArray_member_name
                classArray_lecture_id = jsondata.classArray_lecture_id
                scheduleIdArray = jsondata.scheduleIdArray
                offScheduleIdArray = jsondata.offScheduleIdArray
                scheduleFinishArray = jsondata.scheduleFinishArray;
                memberLectureIdArray = jsondata.memberLectureIdArray;
                memberNameArray = jsondata.memberNameArray;
                memberAvailCountArray = jsondata.memberAvailCountArray;
                messageArray = jsondata.messageArray;
                dateMessageArray = jsondata.dateMessageArray;
                repeatArray= jsondata.repeatArray;
			    offRepeatScheduleTypeArray = jsondata.offRepeatScheduleTypeArray;
			    offRepeatScheduleWeekInforray = jsondata.offRepeatScheduleWeekInforray;
			    offRepeatScheduleStartDateArray = jsondata.offRepeatScheduleStartDateArray;
			    offRepeatScheduleEndDateArray = jsondata.offRepeatScheduleEndDateArray;

                /*팝업의 timegraph 업데이트*/
                classDateData = []
                classTimeData = []
                offDateData=[]
                offTimeData = []
                offAddOkArray = [] //OFF 등록 시작 시간 리스트
                durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트
                DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateData,"graph",classTimeData)
                DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offDateData,"graph",offTimeData)
                /*팝업의 timegraph 업데이트*/

                DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateArray,'member',classStartArray)
				DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classNameArray,'class')
                DBdataProcessMonthTrainer();
       			
                classDatesTrainer();
                plancheck(clicked_td_date_info)
                var countNum = $('.plan_raw').length
				$('#countNum').text(countNum)
              },

              complete:function(){
              	deleteCompleteSend();
              },

              error:function(){
                console.log('server error')
              }
            })    
     }


//여기서부터 월간 달력 만들기 코드////////////////////////////////////////////////////////////////////////////////////////////////

	calTable_Set(1,currentYear,currentPageMonth-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
	calTable_Set(2,currentYear,currentPageMonth);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
	calTable_Set(3,currentYear,currentPageMonth+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기

	DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateArray,'member',classStartArray)
	DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classNameArray,'class')
	DBdataProcessMonthTrainer(); //트레이너 월간일정에서 날짜별 PT갯수 표기를 위함

	//dateDisabled(); //PT 불가 일정에 회색 동그라미 표시
	//classDates(); //나의 PT일정에 핑크색 동그라미 표시
	classDatesTrainer(); // 트레이너 월간일정에 핑크색 동그라미 표시하고 PT 갯수 표기
	addPtMemberListSet()


	monthText(); //상단에 연, 월 표시
	//availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
	krHoliday(); //대한민국 공휴일


	//다음페이지로 슬라이드 했을때 액션
	myswiper.on('onSlideNextEnd',function(){
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
	myswiper.on('onSlidePrevEnd',function(){
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
			//dateDisabled();
			//classDates();
			classDatesTrainer();
			monthText();
			krHoliday();
			//availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
			myswiper.update(); //슬라이드 업데이트

		},

		'prepend' : function(){
			myswiper.removeSlide(2);
			myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
			calTable_Set(1,currentYear,currentPageMonth-1);	
			//dateDisabled();
			//classDates();
			classDatesTrainer();
			monthText();
			krHoliday();
			//availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
			myswiper.update(); //이전페이지로 넘겼을때

		}
	};

	
	function calTable_Set(Index,Year,Month){ //선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
		if(Month>12){
            var Month = Month-12
            var Year = Year+1
        }else if(Month<1){
            var Month = Month+12
            var Year = Year-1
        }

		for(var i=1; i<=6; i++){
			$('.swiper-slide:nth-child('+Index+')').append('<div id="week'+i+Year+Month+'" class="container-fluid week-style">')
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
				$('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates"'+' data-date='+Year+'_'+(Month-1)+'_'+j+'>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
			};
		}else if(Month==1){ //1월
			for(var j=31-firstDayCurrentPage+1; j<=31 ;j++){
				$('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates"'+' data-date='+(Year-1)+'_'+(Month+11)+'_'+j+'>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
			};
		}
		
		//2. 첫번째 주 채우기
		for(var i=1; i<=7-firstDayCurrentPage; i++){
			if(i==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표시하기
				$('#week1'+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'<span class="today">TODAY</span>'+'</td>');
			}else{
				$('#week1'+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
			}
		};

		//3.현재달에 두번째 주부터 나머지 모두 채우기
		var lastOfweek1 = Number($('#week1'+Year+Month+'child td:last-child span:first-child').text());
		for(var i=lastOfweek1+1; i<=lastOfweek1+7; i++){
			for(var j=0;j<=4;j++){
				if(Number(i+j*7)==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표기
					$('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+Number(i+j*7) +'>'+'<span>'+Number(i+j*7)+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'<span class="today">TODAY</span>'+'</td>')
				}else if(Number(i+j*7<=lastDay[Month-1])){ //둘째주부터 날짜 모두
					$('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+Number(i+j*7)+'>'+'<span>'+Number(i+j*7)+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}
			}
		};

		//4. 현재달 마지막에 다음달 첫주 채우기
		var howmanyWeek6 = $('#week6'+Year+Month+' td').length;
		var howmanyWeek5 = $('#week5'+Year+Month+' td').length;

		if(howmanyWeek5<=7 && howmanyWeek6==0){
			for (var i=1; i<=7-howmanyWeek5;i++){
				if(Month<12){
					$('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}else if(Month==12){
					$('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+(Year+1)+'_'+(Month-11)+'_'+i+'>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}
			};
			ad_month($('#week6'+Year+Month+'child tbody tr')) //2017.11.08추가 달력이 5주일때, 비어있는 6주차에 광고 입력
		}else if(howmanyWeek6<7 && howmanyWeek6>0){
			for (var i=1; i<=7-howmanyWeek6;i++){
				if(Month<12){
					$('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}else if(Month==12){
					$('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+(Year+1)+'_'+(Month-11)+'_'+i+'>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}
			};
		}
		for(i=1;i<=6;i++){
			$('#week'+i+Year+Month+'child td:first-child').css({color:'#d21245'}); //일요일 날짜는 Red 표기
			$('#week'+i+Year+Month+'child td:last-child').css({color:'#115a8e'}); //토요일 날짜는 Blue 표기
		} 
	}; //calendarSetting()

	function dateDisabled(){ //PT 불가일자를 DB로부터 받아서 disabledDates 배열에 넣으면, 날짜 회색 표시
		for(var i=0; i<disabledDates.length; i++){
			$("td[data-date="+disabledDates[i]+"] div").addClass('dateDisabled');
		};
	};

	function classDates(){ //나의 PT 날짜를 DB로부터 받아서 mytimeDates 배열에 넣으면, 날짜 핑크 표시
		for(var i=0; i<classDateArray.length; i++){
			var arr = classDateArray[i].split('_')
			var yy = arr[0]
			var mm = arr[1]
			var dd = arr[2]
			var omm = String(oriMonth)
			var odd = String(oriDate)
			if(mm.length==1){
				var mm = '0'+arr[1]
			}
			if(dd.length==1){
				var dd='0'+arr[2]
			}
			if(omm.length==1){
				var omm = '0'+oriMonth
			}
			if(odd.length==1){
				var odd='0'+oriDate
			}

			if(yy+mm+dd < oriYear+omm+odd){  // 지난 일정은 회색으로, 앞으로 일정은 핑크색으로 표기
				$("td[data-date="+classDateArray[i]+"]").attr('schedule-id',scheduleIdArray[i])
				$("td[data-date="+classDateArray[i]+"] div._classDate").addClass('greydateMytime')
				$("td[data-date="+classDateArray[i]+"] div._classTime").addClass('balloon').text(classStartArray[i])
			}else{
				$("td[data-date="+classDateArray[i]+"]").attr('schedule-id',scheduleIdArray[i])
				$("td[data-date="+classDateArray[i]+"] div._classDate").addClass('dateMytime')
				$("td[data-date="+classDateArray[i]+"] div._classTime").addClass('blackballoon').text(classStartArray[i])
			}
		};
	};

	function classDatesTrainer(){
		$('._classTime').html('')
		for(var i=0; i<dateResult.length; i++){
			var arr = dateResult[i].split('_')
			var yy = arr[0]
			var mm = arr[1]
			var dd = arr[2]
			var omm = String(oriMonth)
			var odd = String(oriDate)
			if(mm.length==1){
				var mm = '0'+arr[1]
			}
			if(dd.length==1){
				var dd='0'+arr[2]
			}
			if(omm.length==1){
				var omm = '0'+oriMonth
			}
			if(odd.length==1){
				var odd='0'+oriDate
			}
			if(yy+mm+dd < oriYear+omm+odd){  // 지난 일정은 회색으로, 앞으로 일정은 핑크색으로 표기
				$("td[data-date="+dateResult[i]+"]").attr('schedule-id',scheduleIdArray[i])
				$("td[data-date="+dateResult[i]+"] div._classTime").addClass('balloon_trainer').html('<img src="/static/user/res/icon-cal-mini.png">'+countResult[i])
				$("td[data-date="+dateResult[i]+"] div._classDate").addClass('greydateMytime')
			}else{
				$("td[data-date="+dateResult[i]+"]").attr('schedule-id',scheduleIdArray[i])
				$("td[data-date="+dateResult[i]+"] div._classTime").addClass('blackballoon_trainer').html('<img src="/static/user/res/icon-cal-mini.png">'+countResult[i])
				$("td[data-date="+dateResult[i]+"] div._classDate").addClass('dateMytime')
			}
		};
	}

	function krHoliday(){ //대한민국 공휴일 날짜를 빨간색으로 표시
		for(var i=0; i<krHolidayList.length; i++){
			$("td[data-date="+krHolidayList[i]+"]").addClass('holiday');
		};
	};

	function monthText(){
		var currentYMD = $('.swiper-slide:nth-child(2) div:nth-child(1)').attr('id');
		//currentYMD 형식  ex : week120177
		var textYear = currentYMD.substr(5,4); //2017
		var textMonth = currentYMD.substr(9,2); //7
		$('#yearText, #ymdText-pc-year').text(textYear);
		$('#monthText, #ymdText-pc-month').text(textMonth+'월');
		todayFinderArrow(textYear,textMonth);
	};

	function todayFinderArrow(Year,Month){
		var currentYY = String(oriYear)
		var pageYY = String(Year)
		var currentMM = String(oriMonth);
		var pageMM = String(Month)
		if(currentMM.length<2){
			var currentMM = '0'+currentMM
		}
		if(pageMM.length<2){
			var pageMM = '0'+pageMM
		}
		var todayInfo = currentYY + currentMM
		var pageInfo = pageYY + pageMM

		if(todayInfo<pageInfo){
			$('._pinkarrowafter').addClass('setunVisible')
			$('._pinkarrowbefore').removeClass('setunVisible')
			$("#ymdText").removeClass('todayindi').addClass('nottodayindi')
		}else if(todayInfo>pageInfo){
			$('._pinkarrowafter').removeClass('setunVisible')
			$('._pinkarrowbefore').addClass('setunVisible')
			$("#ymdText").removeClass('todayindi').addClass('nottodayindi')
		}else{
			$('._pinkarrowbefore, ._pinkarrowafter').addClass('setunVisible')
			$("#ymdText").addClass('todayindi').removeClass('nottodayindi')
		}
	}

	//일정변경 가능 날짜에 표기 (CSS Class 붙이기)
	function availableDateIndicator(not_AvailableStartTime,Endtime){ 
	// 요소설명
	// not_AvailableStartTime : 강사가 설정한 '회원이 예약 불가능한 시간대 시작시간'
	// not_AvailableStartTime : 강사가 설정한 '회원이 예약 불가능한 시간대 종료시간'
	// ex : 밤 22시 ~ 익일 새벽 6시까지 일정 설정 불가 (24시간제로 입력)
	//Start : 17, End : 6 current: 14
		if(currentHour<Endtime || currentHour>=not_AvailableStartTime){
			for(i=currentDate;i<=currentDate+14;i++){
				if(i>lastDay[oriMonth-1] && oriMonth<12){
				 	$('td[data-date='+oriYear+'_'+(oriMonth+1)+'_'+(i-lastDay[oriMonth-1])+']').addClass('notavailable')
				}else if(i>lastDay[oriMonth-1] && oriMonth==12){
					$('td[data-date='+(oriYear+1)+'_'+(oriMonth-11)+'_'+(i-lastDay[oriMonth-1])+']').addClass('notavailable')
				}else{
				 	$('td[data-date='+oriYear+'_'+oriMonth+'_'+i+']').addClass('notavailable')
				}
			}
		}else{
			for(i=currentDate;i<=currentDate+14;i++){
				if(i>lastDay[oriMonth-1] && oriMonth<12){
				 	$('td[data-date='+oriYear+'_'+(oriMonth+1)+'_'+(i-lastDay[oriMonth-1])+']').addClass('available')
				}else if(i>lastDay[oriMonth-1] && oriMonth==12){
					$('td[data-date='+(oriYear+1)+'_'+(oriMonth-11)+'_'+(i-lastDay[oriMonth-1])+']').addClass('available')
				}else{
				 	$('td[data-date='+oriYear+'_'+oriMonth+'_'+i+']').addClass('available')	
				}
			}
		}	
	}
	//일정변경 가능 날짜에 표기 (CSS Class 붙이기)


	

	function DBdataProcessMonthTrainer(){
		var len = classDateArray.length;
		var summaryArray ={}
		var summaryArrayResult = []

		var datasum = []
		for(var i=0; i<len; i++){ //객체화로 중복 제거
			summaryArray[classDateArray[i]] = classDateArray[i]
			datasum[i] = classDateArray[i]+"/"+classTimeArray_member_name[i]
		}
		for(var i in summaryArray){ //중복 제거된 배열
			summaryArrayResult.push(i)
		}

		var len2 = summaryArrayResult.length;

		for(var i=0; i<len2; i++){
			var scan = summaryArrayResult[i]
			countResult[i]=0
			for(var j=0; j<len; j++){
				var datesplit = datasum[j].split('/')
				if(scan == datesplit[0]){
					countResult[i] = countResult[i]+1
				}
			}
		}

		for(var i=0; i<summaryArrayResult.length; i++){
			var splited = summaryArrayResult[i].split("_")
			var yy = splited[0];
			var mm = splited[1];
			var dd = splited[2];
			dateResult[i] = yy+'_'+mm+'_'+dd
		}
	}


	function ad_month(selector){ // 월간 달력 하단에 광고
		selector.html('<img src="/static/user/res/PTERS_logo.jpg" alt="logo" class="admonth">').css({'text-align':'center'})
	}

	function plancheck(dateinfo){ // //2017_11_21_21_00_1_김선겸_22_00 //dateinfo = 2017_11_5
		var len = classNameArray.length;
		var dateplans = []
		for(var i=0; i<len; i++){
			var splited = classNameArray[i].split('_');
			var scheduleID = scheduleIdArray[i]
			var classLectureID = classArray_lecture_id[i]
			var scheduleFinish = scheduleFinishArray[i]
			var yy = splited[0]
			var mm = splited[1]
			var dd = splited[2]
			var stime1 = splited[3]
			if(stime1.length<2){
				var stime1 = '0'+stime1
			}else if(stime1 == '24'){
				var stime1 = '00'
			}
			var stime = stime1+'_'+splited[4]
			var etime = splited[7]+'_'+splited[8]
			var name = splited[6]
			var ymd = yy+'_'+mm+'_'+dd
			if(ymd==dateinfo){
				dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish)
			}
		}
		dateplans.sort();
		var htmltojoin = []
		if(dateplans.length>0){
			for(var i=1;i<=dateplans.length;i++){
				var splited = dateplans[i-1].split('_')
				var stime = splited[0]
				if(stime.substr(0,1)=='0'){
					var stime = stime.substr(1,1)
				}
				var etime = splited[2]
				var name = splited[4]+" 회원님"
				var morningday = ""
				if(stime==0 & dateplans[i-2]==undefined){
					var morningday = "오전"
				}else if(stime<12 & dateplans[i-2]==undefined){
					var morningday = "오전"
				}else if(stime>=12 && dateplans[i-2]!=undefined){
					var splitedprev = dateplans[i-2].split('_')
					if(splitedprev[0]<12){
						var morningday = "오후"	
					}
				}else if(stime>=12 && dateplans[i-2]==undefined){
					var morningday = "오후"
				}

				if(splited[10]==1){
					htmltojoin.push('<div class="plan_raw" title="완료 된 일정" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'"><span class="plancheckmorningday">'+morningday+'</span><span class="planchecktime">'+stime+':00 - '+etime+':00'+'</span><span class="plancheckname">'+name+'<img src="/static/user/res/btn-pt-complete.png"></span></div>')

				}else if(splited[10] == 0){
					htmltojoin.push('<div class="plan_raw" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'"><span class="plancheckmorningday">'+morningday+'</span><span class="planchecktime">'+stime+':00 - '+etime+':00'+'</span><span class="plancheckname">'+name+'</span></div>')
				}
			}
		}else{
			htmltojoin.push('<div class="plan_raw_blank">등록된 일정이 없습니다.</div>')

		}
		
		$('#cal_popup_plancheck .popup_inner').html(htmltojoin.join(''))
	}

    function DBdataProcess(startarray,endarray,result,option,result2){ //result2는 option이 member일때만 사용
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
	        }else if(option=="off"){
	          startSplitArray.push(classTimeArray_member_name[i]) 
	          result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+"OFF"+"_"+endSplitArray[3]+"_"+endSplitArray[4]);   
	        }else if(option=="member"){
	          result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]);    
	          result2.push(startSplitArray[3]+":"+startSplitArray[4]);
	        }else if(option=="graph"){
	          	var mm = startSplitArray[1]
	            var dd = startSplitArray[2]
	            if(mm.length<2){
	              var mm = '0'+startSplitArray[1]
	            }
	            if(dd.length<2){
	              var dd = '0'+startSplitArray[2]
	            }
	            result.push(startSplitArray[0]+"-"+mm+"-"+dd); //2017_10_7
	            result2.push(startSplitArray[3]+"_"+startSplitArray[4] +"_"+ startSplitArray[5]); //6_00_2  
	          
	        }
        }
     }

      function scrollToDom(dom){
        var offset = dom.offset();
        $('body, html').animate({scrollTop : offset.top-180},10)
      }

      function addPtMemberListSet(){
        var memberMobileList = $('#members_mobile');
        var memberPcList = $('#members_pc');
        var memberSize = memberLectureIdArray.length;
        var member_array_mobile = [];
        var member_array_pc = [];
        memberMobileList.empty();
        memberPcList.empty();
        for(var i=0; i<memberSize; i++){
        	//member_array[i] = '<li><a data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>';
			member_array_mobile[i] = '<li><a id="member_mobile_'+memberLectureIdArray[i]+'" data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>';
        	member_array_pc[i] = '<li><a id="member_pc_'+memberLectureIdArray[i]+'" data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>';
        	//memberPcList.append('<li><a data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>');
			//memberMobileList.append('<li><a data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>');

        }
        var member_arraySum_mobile = member_array_mobile.join('');
		var member_arraySum_pc = member_array_pc.join('');
        memberMobileList.html(member_arraySum_mobile);
        memberPcList.html(member_arraySum_pc);
	}


});//document(ready)