/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/

$(document).ready(function(){


	var repeatData = ['김선겸_tue_16_1_20171203_20180301','김선겸_fri_7_1_20171203_20180301','박신혜_mon_16_1_20171126_20180301']
	var offrepeatData = ['OFF_sun_5_20_20171224_20180301','OFF_sat_16_9_20171209_20180301']


	$('#float_inner1').click(function(){
		scrollToDom($('#calendar'))
	    $('#page-ptadd').fadeIn('fast');
	    $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
	    $('#float_btn_wrap').fadeOut();
	    $('#uptext2').text('PT 일정 등록')
	    $('#page-base').fadeOut();
	    $('#page-base-addstyle').fadeIn();
	    $("#datepicker").datepicker('setDate',null)
	    
	    if($('body').width()<600){
	    	$('#shade3').fadeIn('fast');
		    $('#calendar').hide()
	    }
		    
	})

	$('#float_inner2').click(function(){
		scrollToDom($('#calendar'))
	    $('#page-offadd').fadeIn('fast');
	    $('#uptext2').text('OFF 일정 등록')
	    $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
	    $('#float_btn_wrap').fadeOut();
	    $('#page-base').fadeOut();
	    $('#page-base-addstyle').fadeIn();
	    $("#datepicker_off").datepicker('setDate',null)
	    
	    if($('body').width()<600){
	    	$('#shade3').fadeIn('fast');
		    $('#calendar').hide()
	    }
	})

	$('#upbutton-x').click(function(){
		$('#calendar').show()
	    $('#shade3').fadeOut();
	    $('#shade').hide();
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

  //PC 스타일
  	$('.cancelBtn').click(function(){
	    $('#shade').hide();
	    $('#page-ptadd').fadeOut('fast','swing');
	    $('#page-offadd').fadeOut('fast','swing');
	    $('#float_btn_wrap').fadeIn();
	    $('#float_btn').removeClass('rotate_btn');
	    $('#page-base').fadeIn();
	    $('#page-base-addstyle').fadeOut();
	    $('.submitBtn').removeClass('submitBtnActivated')

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
  //PC 스타일



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
			$('#shade').css({'display':'block'});
			console.log($(this).attr('class-time')); //현재 클릭한 요소의 class-time 요소 값 보기
			                                         //형식예: 2017_10_7_6_00_2_원빈
			console.log($(this).attr('schedule-id'));
			var info = $(this).attr('class-time').split('_')
			var yy=info[0]
			var mm=info[1]
			var dd=info[2]
			var dayobj = new Date(yy,mm-1,dd)
			var dayraw = dayobj.getDay();
			var dayarryKR = ['일','월','화','수','목','금','토']
			var dayarryJP = ['日','月','火','水','木','金','土']
			var dayarryEN = ['Sun','Mon','Tue','Wed','Ths','Fri','Sat']
			switch(Options.language){
				case "Korea" :
				var member = " 회원님의 ";
				var yourplan = "시 일정";
				var day = dayarryKR[dayraw];
				break;
				case "Japan" :
				var member = "様の ";
				var yourplan = "時日程";
				var day = dayarryJP[dayraw];
				break;
				case "English" :
				var member = "'s schedule at ";
				var yourplan = ":00";
				var day = dayarryEN[dayraw];
				break; 
			}
			var infoText = yy+'. '+mm+'. '+dd+' '+'('+day+')'
			var infoText2 = info[6]+member+info[3]+yourplan
			$('#popup_info').text(infoText);
			$('#popup_info2').text(infoText2);
			$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
			$("#id_schedule_id_modify").val($(this).attr('schedule-id')); //shcedule 정보 저장
			$("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
			$("#id_lecture_id_modify").val($(this).attr('data-lectureId')); //lecture id 정보 저장
			schedule_on_off = 1;
		})


	//Off 일정 클릭시 팝업 Start
		$(document).on('click','div.offTime',function(){ //일정을 클릭했을때 팝업 표시
			$("#cal_popup").fadeIn('fast').css({'z-index':'103'});
			$('#shade').css({'display':'block'});
			console.log($(this).attr('off-time')); //현재 클릭한 요소의 class-time 요소 값 보기
			                                         //형식예: 2017_10_7_6_00_2_원빈
			console.log($(this).attr('off-schedule-id'));
			var info = $(this).attr('off-time').split('_')
			var yy=info[0]
			var mm=info[1]
			var dd=info[2]
			var dayobj = new Date(yy,mm-1,dd)
			var dayraw = dayobj.getDay();
			var dayarryKR = ['일','월','화','수','목','금','토']
			var dayarryJP = ['日','月','火','水','木','金','土']
			var dayarryEN = ['Sun','Mon','Tue','Wed','Ths','Fri','Sat']
			switch(Options.language){
				case "Korea" :
				var comment = ""
				var yourplan = "시 OFF 일정";
				var day = dayarryKR[dayraw];
				break;
				case "Japan" :
				var comment = ""
				var yourplan = "時 OFF日程";
				var day = dayarryJP[dayraw];
				break;
				case "English" :
				var comment = "OFF at "
				var yourplan = ":00";
				var day = dayarryEN[dayraw];
				break; 
			}
			var infoText =  yy+'. '+mm+'. '+dd+' '+'('+day+')'
			var infoText2 = comment + info[3]+yourplan
			$('#popup_info').text(infoText);
			$('#popup_info2').text(infoText2);
			$("#id_off_schedule_id").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
			$("#id_off_schedule_id_modify").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
			schedule_on_off = 0;

		})

		$("#btn_close").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup').css('display')=='block'){
				$("#cal_popup").css({'display':'none','z-index':'-2'})
				$('#shade').css({'display':'none'});
			}
		})

		$("#btn_close3").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup3').css('display')=='block'){
				$("#cal_popup3").css({'display':'none','z-index':'-2'})
				$('#shade').css({'display':'none'});
			}
		})

		$("#popup_text4").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup3').css('display')=='block'){
				$("#cal_popup3").css({'display':'none','z-index':'-2'})
				$('#shade').css({'display':'none'});
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

		/*
		$('#popup_text3').click(function(){  //일정 삭제 버튼 클릭
			if(schedule_on_off==1){
				//PT 일정 삭제시
				document.getElementById('daily-pt-delete-form').submit();
			}
			else{
				document.getElementById('daily-off-delete-form').submit();
			}
		})
		*/

	$('#popup_text3').click(function(){
		var $ptdelform = $('#daily-pt-delete-form');
		var $offdelform = $('#daily-off-delete-form');
		if(schedule_on_off==1){
				//PT 일정 삭제시
				//document.getElementById('daily-pt-delete-form').submit();
				$.ajax({
                    url:'/trainer/daily_pt_delete/',
                    type:'POST',
                    data:$ptdelform.serialize(),

                    beforeSend:function(){
                     	deleteBeforeSend();
                    },

                    //보내기후 팝업창 닫기
                    complete:function(){
                    	closeDeletePopup();
                    	deleteCompleteSend();
                      },

                    //통신성공시 처리
                    success:function(){
                      console.log('success')
                      },

                    //통신 실패시 처리
                    error:function(){
                      console.log("error")
                    },
                 })
		}
		else{
				//document.getElementById('daily-off-delete-form').submit();
				$.ajax({
                    url:'/trainer/daily_off_delete/',
                    type:'POST',
                    data:$offdelform.serialize(),

                    beforeSend:function(){
                    	deleteBeforeSend();
                    },

                    //보내기후 팝업창 닫기
                    complete:function(){
                    	closeDeletePopup();
                      	deleteCompleteSend();
                      },

                    //통신성공시 처리
                    success:function(){
                      console.log('success')
                      },

                    //통신 실패시 처리
                    error:function(){
                      console.log("error")
                    },
                 })
		}
	})

	function closeDeletePopup(){
		if($('#cal_popup3').css('display')=='block'){
			$("#cal_popup3").css({'display':'none','z-index':'-2'})
			$('#shade').css({'display':'none','z-index':'100'});
		}
	}

	function deleteBeforeSend(){
		$('html').css("cursor","wait");
        $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
        $('.ajaxloadingPC').show();
        $('#shade').css({'display':'block','z-index':'200'});
	}

	function deleteCompleteSend(){
		$('html').css("cursor","auto");
        $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
        $('.ajaxloadingPC').hide();
        $('#shade').hide();
        alert('complete: 일정 삭제 성공')
	}



	//플로팅 버튼 Start
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
	calTable_Set(1,currentYear,currentPageMonth,currentDate,-14); // 이번주-2
	calTable_Set(2,currentYear,currentPageMonth,currentDate,-7); // 이번주-1
	calTable_Set(3,currentYear,currentPageMonth,currentDate,0); // 이번주
	calTable_Set(4,currentYear,currentPageMonth,currentDate,7); // 이번주+1
	calTable_Set(5,currentYear,currentPageMonth,currentDate,14); // 이번주+2
	dateText();

	DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classTimeArray,"class");
	DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offTimeArray);
	addcurrentTimeIndicator_blackbox()
	//addcurrentTimeIndicator();
	classTime(); //PT수업 시간에 핑크색 박스 표시
	offTime();
	//DBrepeatdata(repeatData,'class')
	//DBrepeatdata(offrepeatData,'off')

// ****************************구동시 실행********************************************************************************
// ############################구동시 실행################################################################################

	//다음페이지로 슬라이드 했을때 액션
	myswiper.on('SlideNextEnd',function(){
			slideControl.append();
			dateText();
			//weekNum_Set();	
	});

	//이전페이지로 슬라이드 했을때 액션
	myswiper.on('SlidePrevEnd',function(){
			slideControl.prepend();
			dateText();
			//weekNum_Set();
	});

	//페이지 이동에 대한 액션 클래스
	var slideControl = {
		'append' : function(){ //다음페이지로 넘겼을때
			var lastdateinfo = $('.swiper-slide:last-child').find('.td00').attr('id').split('_');
			var last = Number($('.swiper-slide:last-child').attr('id').replace(/slide/gi,""))
			var lastYY = Number(lastdateinfo[0]);
			var lastMM = Number(lastdateinfo[1]);
			var lastDD = Number(lastdateinfo[2]);
			myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
			myswiper.appendSlide('<div class="swiper-slide" id="slide'+(last+1)+'"></div>') //마지막 슬라이드에 새슬라이드 추가
			calTable_Set(last+1,lastYY,lastMM,lastDD,7,0); //새로 추가되는 슬라이드에 달력 채우기	
			classTime();
			offTime();
			//DBrepeatdata(repeatData,'class')
			//DBrepeatdata(offrepeatData,'off')
		},

		'prepend' : function(){
			var firstdateinfo = $('.swiper-slide:first-child').find('.td00').attr('id').split('_');
			var first = Number($('.swiper-slide:first-child').attr('id').replace(/slide/gi,""));
			var firstYY = Number(firstdateinfo[0]);
			var firstMM = Number(firstdateinfo[1]);
			var firstDD = Number(firstdateinfo[2]);
			myswiper.removeSlide(4);
			myswiper.prependSlide('<div class="swiper-slide" id="slide'+(first-1)+'"></div>'); //맨앞에 새슬라이드 추가
			calTable_Set(first-1,firstYY,firstMM,firstDD,-7,0);		
			classTime();
			offTime();
			//DBrepeatdata(repeatData,'class')
			//DBrepeatdata(offrepeatData,'off')
		},
	};



	function calTable_Set(Index,Year,Month,Dates,Week,append){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성 
		//Week 선택자 2E, 1E, 0W, 1L, 2L
		//주간달력 상단표시줄 (요일, 날짜, Today표식)
		weekTable(Index)

		var W = Week
		var slideIndex = $('#slide'+Index);
		var currentDates = Number(Dates)+W;
		var dateinfo = new Date(Year,Month-1,currentDates);
		var currentDay_ = dateinfo.getDay()
		var monthdata = currentMonth

		if(append==0){
			var currentDay_ = 0;
			var dataforappend = $('.swiper-slide-prev').find('.td00').attr('id').split('_')
			var monthforappend = Number(dataforappend[1])-1
			var monthdata = monthforappend
		}

		for(var i=5; i<=24; i++){
			var textToAppend = '<div id="'+i+'H_'+Year+'_'+Month+'_'+currentDate+'_'+Week+'" class="time-style">'
			var divToAppend = $(textToAppend)
			var slidevalue = "test"

			switch(currentDay_){
				case 0 :
				var td1 = []
				var td2 = []
				for(z=0; z<=6; z++){
					if(currentDates+z>lastDay[monthdata] && Month+1>12){ //해가 넘어갈때
						td1[z]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[monthdata]){
						td1[z]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=lastDay[monthdata] && currentDates+z>0){
						td1[z]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						if(Month-1<1){
							td1[z]='<td'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
							td2[z]='<td'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
						}else{
							td1[z]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[monthdata-1])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
							td2[z]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[monthdata-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
						}
					}
				}
				var td1_1 = td1.join('')
				var td2_1 = td2.join('')
				break;

				case 1 :
				var td1 = []
				var td2 = []
				for(z=-1; z<=5; z++){
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+1]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+1]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+1]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+1]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
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
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+2]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+2]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+2]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+2]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
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
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+3]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+3]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+3]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+3]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
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
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+4]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+4]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+4]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+4]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
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
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+5]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+5]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+5]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+5]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
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
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+6]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+6]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+6]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00">'+'<div></div>'+'</td>';
						td2[z+6]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
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
			if(i<12){
					textToAppend2 = '<table id="'+Year+'_'+Month+'_'+currentDate+'_'+Week+'_'+i+'H'+'" class="calendar-style weektable"><tbody><tr><td class="slidegap" rowspan="2">'+'<span class="_morningday">오전 </span>'+i+'<div></div></td>'+td
			}else{
					textToAppend2 = '<table id="'+Year+'_'+Month+'_'+currentDate+'_'+Week+'_'+i+'H'+'" class="calendar-style weektable"><tbody><tr><td class="slidegap" rowspan="2">'+'<span class="_morningday">오후 </span>'+i+'<div></div></td>'+td
			};
			var sum = textToAppend+textToAppend2
			slideIndex.append(sum);
		};
		weekNum_Set(Index)
	}; //calTable_Set

	function dateText(){
		var yymm = {}
		var yymmarry = []
		for(var i=2; i<=8; i++){
			var dataID = $('.swiper-slide-active div:nth-child(2)').find('.td00:nth-child('+i+')').attr('id').split('_');
			var yy = dataID[0];
			var mm = dataID[1];
			yymm[yy+'_'+mm] = 'data' 
		}
		for(i in yymm){
			yymmarry.push(i)
		}

		if(yymmarry.length>1){  // [2017_12, 2018_1] ,,  [2018_1, 2018_2]
			var yymm1 = yymmarry[0].split('_')
			var yymm2 = yymmarry[1].split('_')
			var yy1 = yymm1[0]
			var mm1 = yymm1[1]
			var yy2 = yymm2[0]
			var mm2 = yymm2[1]
			if(yy1==yy2){
				$('#yearText').text(yy1+'년');
				$('#monthText').text(mm1+'/'+mm2+'월')
			}else if(yy1!=yy2){
				$('#yearText').text(yy1+'/'+yy2+'년');
				$('#monthText').text(mm1+'/'+mm2+'월')
			}
		}else{
			var yymm = yymmarry[0].split('_')
			$('#yearText').text(yymm[0]+'년');
			$('#monthText').text(yymm[1]+'월');
		}
	}

	
	function weekNum_Set(Index){
		//var index = Number(myswiper.activeIndex+1);
		var Sunday_date = $('#slide'+Index+' #sunDate')
		var Monday_date = $('#slide'+Index+' #monDate')
		var Tuesday_date = $('#slide'+Index+' #tueDate')
		var Wednesday_date = $('#slide'+Index+' #wedDate')
		var Thursday_date = $('#slide'+Index+' #thrDate')
		var Friday_date = $('#slide'+Index+' #friDate')
		var Saturday_date = $('#slide'+Index+' #satDate')
		var WeekArry = [Sunday_date,Monday_date,Tuesday_date,Wednesday_date,Thursday_date,Friday_date,Saturday_date]
		var lastDayThisMonth = lastDay[currentMonth];
		var swiperPage = $('#slide'+Index+' div:nth-child(2)') 

		for(var i=2; i<=8; i++){			
			var dateID = swiperPage.find('td:nth-child('+i+')').attr('id').split('_');
			var yy = dateID[0];
			var mm = dateID[1];
			var dd = dateID[2];
			WeekArry[i-2].html(dd);
			if(mm.length<2){
				var mm = '0'+dateID[1]
			}
			if(dd.length<2){
				var dd = '0'+dateID[2]
			}
			$('#slide'+Index+' #weekNum_'+Number(i-1)).attr('data-date',yy+mm+dd)
		}

		toDay(Index);
		reserveAvailable(Index);
		todayFinderArrow();
	}

	function weekTable(Index){
		var slideIndex = $('#slide'+Index);
		var div = '<div id="week" class="time-style wrap"><table class="calendar-style"><tbody><tr id="weekText">'
		var tdgap = '<td class="slidegap" style="background:#f4f4f4;"><span></span><span></span></td>'
		var tdSun = '<td id="weekNum_1"><span class="weekToday-style"></span><span class="weekToday-style" style="color: #d21245;">일</span><span id="sunDate" class="weekToday-style" style="color:#d21245;"></span></td>'
		var tdMon = '<td id="weekNum_2"><span class="weekToday-style"></span><span class="weekToday-style">월</span><span id="monDate" class="weekToday-style"></span></td>'
		var tdTue = '<td id="weekNum_3"><span class="weekToday-style"></span><span class="weekToday-style">화</span><span id="tueDate" class="weekToday-style"></span></td>'
		var tdWed = ' <td id="weekNum_4"><span class="weekToday-style"></span><span class="weekToday-style">수</span><span id="wedDate" class="weekToday-style"></span></td>'
		var tdThr = '<td id="weekNum_5"><span class="weekToday-style"></span><span class="weekToday-style">목</span><span id="thrDate" class="weekToday-style"></span></td>'
		var tdFri = '<td id="weekNum_6"><span class="weekToday-style"></span><span class="weekToday-style">금</span><span id="friDate" class="weekToday-style"></span></td>'
		var tdSat = ' <td id="weekNum_7"><span class="weekToday-style"></span><span class="weekToday-style" style="color: #115a8e;">토</span><span id="satDate" class="weekToday-style" style="color: #115a8e;"></span></td>'
		var divfin = '</tr></tbody></table></div>'
		var combine = div+tdgap+tdSun+tdMon+tdTue+tdWed+tdThr+tdFri+tdSat+divfin
		slideIndex.append(combine)
	}

	function toDay(Index){
		for(i=1;i<=7;i++){
		var scan = $('#slide'+Index+' #weekNum_'+i).attr('data-date')
			var yy = String(currentYear)
			var dd = String(currentDate)
			var mm = String(currentPageMonth)

			console.log(dd.length,mm.length)
			if(mm.length<2){
				var mm = '0'+mm
			}
			if(dd.length<2){
				var dd = '0'+dd
			}
			console.log(scan, yy+mm+dd)
			if(scan == yy+mm+dd){
				$('#slide'+Index+' #weekNum_'+i+' span:nth-child(1)').addClass('today').html('TODAY')
				$('#slide'+Index+' #weekNum_'+i+' span:nth-child(3)').addClass('today-Number')
			}else{
				$('#slide'+Index+' #weekNum_'+i+' span:nth-child(1)').removeClass('today').html('')
				$('#slide'+Index+' #weekNum_'+i+' span:nth-child(3)').removeClass('today-Number')
			}
		}
	}

	function todayFinderArrow(){
		var currentMM = String(currentPageMonth);
		var currentDD = String(currentDate);
		if(currentMM.length<2){
			var currentMM = '0'+currentMM
		}
		if(currentDD.length<2){
			var currentDD = '0'+currentDD
		}
		console.log(currentMM, currentDD)
		var todayInfo = String(currentYear) + currentMM + currentDD
		var viewdayInfomin = $('.swiper-slide-active'+' #weekNum_1').attr('data-date');
		var viewdayInfomax = $('.swiper-slide-active'+' #weekNum_7').attr('data-date');

		if(viewdayInfomax>=todayInfo && viewdayInfomin<=todayInfo){
			$('._pinkarrowbefore, ._pinkarrowafter').addClass('setunVisible')
			$("#ymdText").addClass('todayindi').removeClass('nottodayindi')
		}else if(todayInfo>viewdayInfomax && todayInfo>viewdayInfomin){
			$('._pinkarrowafter').removeClass('setunVisible')
			$('._pinkarrowbefore').addClass('setunVisible')
			$("#ymdText").removeClass('todayindi').addClass('nottodayindi')
		}else if(todayInfo<viewdayInfomax && todayInfo<viewdayInfomin){
			$('._pinkarrowafter').addClass('setunVisible')
			$('._pinkarrowbefore').removeClass('setunVisible')
			$("#ymdText").removeClass('todayindi').addClass('nottodayindi')
		}
	}


	function reserveAvailable(Index){
		var yy = currentYear;
		var mm = String(currentPageMonth);
		var dd = String(currentDate);
		if(mm.length<2){
			var mm = '0'+mm
		}
		if(dd.length<2){
			var dd = '0'+dd
		}
		var ymdArry = [yy,mm,dd]
		var yymmdd = ymdArry.join('')
		for(i=1;i<=7;i++){
		var scan = $('#slide'+Index+' #weekNum_'+i).attr('data-date')
			if(yymmdd<=scan && scan<=14+Number(yymmdd)){
				$('#slide'+Index+' #weekNum_'+i).addClass('reserveavailable')
				
			}else if(scan.substr(0,4)==yy+1 && scan.substr(4,2) == '01' &&scan.substr(6,2)<=Number(dd)+14-lastDay[currentMonth]){
				$('#slide'+Index+' #weekNum_'+i).addClass('reserveavailable')
			}
			else if(scan.substr(4,2) > mm && scan.substr(6,2)<=Number(dd)+14-lastDay[currentMonth]){
				$('#slide'+Index+' #weekNum_'+i).addClass('reserveavailable')
				
			}else{
				$('#slide'+Index+' #weekNum_'+i).removeClass('reserveavailable')
				
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
			var planheight = 30;
			if($(window).width()>=600){
				var planheight = 45;
			}
			tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*planheight)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+classHour+':'+classMinute+'</span>');
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
			var planheight = 30;
			if($(window).width()>=600){
				var planheight = 45;
			}
			tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*planheight)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+offHour+':'+offMinute+'</span>');
		};
		$('#calendar').css('display','block');
	};


	function addcurrentTimeIndicator_blackbox(){ //현재 시간에 밑줄 긋기
		var where = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+'0W'+'_'+currentHour+'H .hour'
		$(where).addClass('currentTimeBlackBox');
		
	}

	function scrollToIndicator(){
		var offset = $('.currentTimeBlackBox').offset();
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



	

	function DBrepeatdata(repeat,option){ // 김선겸_tue_16_1_fri_10_2_20171203_20180301  이름_요일_시작시간_진행시간_시작시간_진행시간_반복시작날짜_반복종료날짜
		
		switch(option){
			case 'class':
			var cssClass= 'classTime classTime_re'
			var attr = 'class-time'
			break;
			case 'off':
			var cssClass= 'offTime offTime_re'
			var attr = 'off-time'
			break;
		}
			var len = repeat.length;
		for(var j=0; j<=5; j++){
			var page = '#slide'+j;


			for(var i=0; i<len; i++){
				var arry = repeat[i].split('_');
				var who = arry[0];
				var day = arry[1];
				var time = arry[2];
				var dur = arry[3];
				var etime = time + dur
				var start = arry[4];
				var end = arry[5];
				var days = ['','','sun','mon','tue','wed','thr','fri','sat'];

				var loc_ = $(page+' tr td:nth-child('+days.indexOf(day)+')').attr('id') //2017_12_11_5_00		
				var loc_a = loc_.split('_')

				var idYear = loc_a[0]
				var idMonth = loc_a[1]
				var idDay = loc_a[2]
				if(idDay.length<2){
					var idDay = '0'+idDay
				}
				if(idMonth.length<2){
					var idMonth = '0'+idMonth
				}

				
				if(idYear+idMonth+idDay>=start && idYear+idMonth+idDay<=end){
					if(idDay.substr(0,1)=='0'){
						var idDay = idDay.substr(1,1);
					}
					if(idMonth.substr(0,1)=='0'){
						var idMonth = idMonth.substr(1,1);
					}
					var loc = $('#'+idYear+'_'+idMonth+'_'+idDay+'_'+time+'_00')
					loc.find('div').attr('data-memberName',who).attr(attr,idYear+'_'+idMonth+'_'+idDay+'_'+time+'_00_'+dur+'_'+who+'_'+etime+'_00').addClass(cssClass).css({'height':Number(dur*30)+'px'}).html('<span class="memberName">'+who+' </span>'+'<span class="memberTime">'+time+':'+'00'+'</span>');
					} //2017_12_13_6_00_1_지창욱_7_00
				}
		}
	}

	function scrollToDom(dom){
        var offset = dom.offset();
        $('body, html').animate({scrollTop : offset.top-180},10)
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

