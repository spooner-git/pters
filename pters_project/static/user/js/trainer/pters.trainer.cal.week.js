/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/

$(document).ready(function(){

	//setInterval(function(){ajaxClassTime()},60000)// 자동 ajax 새로고침(일정가져오기)

	$('#float_inner1, .ymdText-pc-add-pt').click(function(){ //PT추가버튼
		scrollToDom($('#calendar'))
		addTypeSelect = "ptadd"
		$('#memberName,#remainCount').css('display','block');
	    $('#page-addplan').fadeIn('fast');
	    $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
	    $('#float_btn_wrap').fadeOut();
	    $('#uptext2').text('PT 일정 등록')
	    $('#page-base').fadeOut();
	    $('#page-base-addstyle').fadeIn();
	    $("#datepicker").datepicker('setDate',null)
	    
	    if($('body').width()<600){
	    	$('#calendar').hide();
	        $('#shade').hide()
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
	    $('#uptext2').text('OFF 일정 등록')
	    $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
	    $('#float_btn_wrap').fadeOut();
	    $('#page-base').fadeOut();
	    $('#page-base-addstyle').fadeIn();
	    $("#datepicker").datepicker('setDate',null)
	    
	    if($('body').width()<600){
	    	$('#calendar').hide();
	        $('#shade').hide()
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
	    $('#float_btn_wrap').show();
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

        $('#page-addplan .dropdown_selected').removeClass('dropdown_selected')
        $('.dateButton').removeClass('dateButton_selected')
        $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate',null)
        $('#repeattypeSelected button, #repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>선택</span>");
        //$('#page-addplan form input').val('')
        selectedDayGroup = []

        $('._NORMAL_ADD').css('display','block')
        $('._REPEAT_ADD').css('display','none')
        $('#timeGraph').css('display','none')
  	})
  //모바일 스타일

  //PC 스타일
  	$('.cancelBtn').click(function(){
	    $('#shade').hide();
	    $('#page-addplan').fadeOut('fast','swing');
	    if($('body').width()<600){
	        $('#calendar').show();
	    }
	    $('#float_btn_wrap').show();
	    $('#float_btn').removeClass('rotate_btn');
	    $('#page-base').fadeIn();
	    $('#page-base-addstyle').fadeOut();
	    $('.submitBtn').removeClass('submitBtnActivated')

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

        $('#page-addplan .dropdown_selected').removeClass('dropdown_selected')
        $('.dateButton').removeClass('dateButton_selected')
        $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate',null)
        $('#repeattypeSelected button, #repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>선택</span>");
        //$('#page-addplan form input').val('')
        selectedDayGroup = []

        $('._NORMAL_ADD').css('display','block')
        $('._REPEAT_ADD').css('display','none')
        $('#timeGraph').css('display','none')
  	})

  	$('.cancelBtn_mini').click(function(){
  		closeMiniPopup()
  	})
  //PC 스타일

   function closeMiniPopup(){
   		$("#id_time_duration_off").val("")
	    $('#page-addplan-pc').fadeOut();
	    $('.td00').find('div').removeClass('blankSelected blankSelected_addview')
	    $('.submitBtn').removeClass('submitBtnActivated')
	    $('#classDuration_mini #durationsSelected button').removeClass('dropdown_selected')
	    $('#submitBtn_mini').css('background','#282828')
	    $('#memo_mini').val("")

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
   }


	var schedule_on_off = 0; //0 : OFF Schedule / 1 : PT Schedule
	//상단바 터치시 주간달력에 회원명/시간 표시 ON OFF

	/*
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
	*/

	//스케쥴 클릭시 팝업 Start
	$(document).on('click','div.classTime',function(){ //일정을 클릭했을때 팝업 표시
		
		$('#popup_btn_complete').css({'color':'#333','background':'#ffffff'}).val('')
        $('#canvas').hide().css({'border-color':'#282828'})
		$('#canvasWrap').css({'height':'0px'})
		$('#canvasWrap span').hide();

		$('#page-addplan-pc').hide()
		$("#cal_popup_planinfo").fadeIn('fast');
		$('#shade').css({'display':'block'});
		var schedule_finish_check = $(this).attr('data-schedule-check')
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
		$("#id_schedule_id_finish").val($(this).attr('schedule-id')); // shcedule 정보 저장
		$("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_repeat_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_member_name_delete").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_member_name_finish").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_repeat_lecture_id").val($(this).attr('data-lectureId')); //lecture id 정보 저장
		$("#id_lecture_id_modify").val($(this).attr('data-lectureId')); //lecture id 정보 저장
		$("#id_lecture_id_finish").val($(this).attr('data-lectureId')); //lecture id 정보 저장
		if(schedule_finish_check=="0"){
			$("#popup_btn_complete").css("display","block")
			$("#popup_text1").css("display","block")
        }
        else{
			$("#popup_btn_complete").css("display","none")
			$("#popup_text1").css("display","none")
		}
		schedule_on_off = 1;
	})
	

	//Off 일정 클릭시 팝업 Start
	$(document).on('click','div.offTime',function(){ //일정을 클릭했을때 팝업 표시
		$('#page-addplan-pc').hide()
		//$('.td00').css('background','transparent')
		$("#cal_popup_planinfo").fadeIn('fast');
		$('#shade').css({'display':'block'});
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
		$("#popup_btn_complete").css("display","none")
		schedule_on_off = 0;
	})

	$("#btn_close").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
		if($('#cal_popup_planinfo').css('display')=='block'){
			$("#cal_popup_planinfo").css({'display':'none'})
			$('#shade').css({'display':'none'});
			$('body').css('overflow-y','overlay');
		}
	})

	$("#btn_close3, #popup_btn_delete_no").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
		if($('#cal_popup_plandelete').css('display')=='block'){
			$("#cal_popup_plandelete").css({'display':'none'})
			$('#shade').css({'display':'none'});
			$('body').css('overflow-y','overlay');
		}
	})


//일정 완료 기능 추가 - hk.kim 180106
	$("#popup_btn_complete").click(function(){  //일정 완료 버튼 클릭

		if($(this).val()!="filled"){
			$('#canvas').show()
			$('#canvasWrap').animate({'height':'200px'},200)
			$('#canvasWrap span').show();
			//$('#cal_popup_planinfo').animate({'top':'15%'},200)
		}else if($(this).val()=="filled"){
			var $pt_finish_form = $('#pt-finish-form');
			if(schedule_on_off==1){
				//PT 일정 완료 처리시
				$.ajax({
                    url:'/schedule/finish_schedule/',
                    type:'POST',
                    data:$pt_finish_form.serialize(),


                    beforeSend:function(){
                    	deleteBeforeSend();
                    },

                    //통신성공시 처리
                    success:function(){
                      closeDeletePopup();
                      deleteCompleteSend();
                      ajaxClassTime();
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
	$("#popup_btn_delete").click(function(){  //일정 삭제 버튼 클릭
		$('#cal_popup_planinfo').hide();
		$('#cal_popup_plandelete').fadeIn('fast');
	})


	$('#popup_btn_delete_yes').click(function(){
		if(addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatptadd"){
			$.ajax({
                url:'/schedule/delete_repeat_schedule/',
                type:'POST',
                data:{"repeat_schedule_id" : $('#id_repeat_schedule_id_confirm').val(), "next_page" : '/trainer/cal_day_ajax/'},
                dataType:'html',

                beforeSend:function(){
                 	deleteBeforeSend();
                },

                //통신성공시 처리
                success:function(data){
                  var jsondata = JSON.parse(data);
                  closeDeletePopup();
                  ajax_received_json_data(jsondata)
                  deleteCompleteSend();
                  },

                //보내기후 팝업창 닫기
                complete:function(){
                	$('#id_repeat_schedule_id_confirm').val('')
                	fill_repeat_info_off()
                  },

                //통신 실패시 처리
                error:function(){
                  alert("에러: 서버 통신 실패")
                  closeDeletePopup();
                  deleteCompleteSend();
                },
            })
		}else{
			var $ptdelform = $('#daily-pt-delete-form');
			var $offdelform = $('#daily-off-delete-form');
			$('body').css('overflow-y','overlay');
			if(schedule_on_off==1){
				//PT 일정 삭제시
				$.ajax({
                    url:'/schedule/delete_schedule/',
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
                      fake_show()
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
			}else{
				$.ajax({
                    url:'/schedule/delete_schedule/',
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
                      fake_show()
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
		}		
	})


	function ajaxClassTime(){

			var $weekNum4 = $('#weekNum_4').attr('data-date')
			var today_form = $weekNum4.substr(0,4)+'-'+$weekNum4.substr(4,2)+'-'+$weekNum4.substr(6,2)

            $.ajax({
              url: '/trainer/cal_day_ajax/',
              type : 'POST',
			  data : {"date":today_form, "day":18},
			  dataType : 'html',

              beforeSend:function(){
              	deleteBeforeSend();
              },

              success:function(data){
              	var jsondata = JSON.parse(data);
                classTimeArray = [];
                offTimeArray = [];
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
                offRepeatScheduleIdArray = [];
                offRepeatScheduleTypeArray = [];
				offRepeatScheduleWeekInfoArray = [];
				offRepeatScheduleStartDateArray = [];
				offRepeatScheduleEndDateArray = [];
			    offRepeatScheduleStartTimeArray = [];
			    offRepeatScheduleTimeDurationArray = [];

                ptRepeatScheduleIdArray = [];
                ptRepeatScheduleTypeArray = [];
				ptRepeatScheduleWeekInfoArray = [];
				ptRepeatScheduleStartDateArray = [];
				ptRepeatScheduleEndDateArray = [];
			    ptRepeatScheduleStartTimeArray = [];
			    ptRepeatScheduleTimeDurationArray = [];
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
                repeatArray = jsondata.repeatArray;
                offRepeatScheduleIdArray = jsondata.offRepeatScheduleIdArray;
			    offRepeatScheduleTypeArray = jsondata.offRepeatScheduleTypeArray;
			    offRepeatScheduleWeekInfoArray = jsondata.offRepeatScheduleWeekInfoArray;
			    offRepeatScheduleStartDateArray = jsondata.offRepeatScheduleStartDateArray;
			    offRepeatScheduleEndDateArray = jsondata.offRepeatScheduleEndDateArray;
			    offRepeatScheduleStartTimeArray = jsondata.offRepeatScheduleStartTimeArray;
			    offRepeatScheduleTimeDurationArray = jsondata.offRepeatScheduleTimeDurationArray;
                ptRepeatScheduleIdArray = jsondata.ptRepeatScheduleIdArray;
			    ptRepeatScheduleTypeArray = jsondata.ptRepeatScheduleTypeArray;
			    ptRepeatScheduleWeekInfoArray = jsondata.ptRepeatScheduleWeekInfoArray;
			    ptRepeatScheduleStartDateArray = jsondata.ptRepeatScheduleStartDateArray;
			    ptRepeatScheduleEndDateArray = jsondata.ptRepeatScheduleEndDateArray;
			    ptRepeatScheduleStartTimeArray = jsondata.ptRepeatScheduleStartTimeArray;
			    ptRepeatScheduleTimeDurationArray = jsondata.ptRepeatScheduleTimeDurationArray;
                DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classTimeArray,"class");
                DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offTimeArray,"off");
                $('.classTime,.offTime').parent().html('<div></div>')
                classTime();
                offTime();
               	addPtMemberListSet();

                /*팝업의 timegraph 업데이트*/
                classDateData = []
                classTimeData = []
                offDateData=[]
                offTimeData = []
                offAddOkArray = [] //OFF 등록 시작 시간 리스트
                durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트
                DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateData,"graph",classTimeData)
                DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offDateData,"graph",offTimeData)
              },

              complete:function(){
              	deleteCompleteSend();
              },

              error:function(){
                console.log('server error')
              }
            })    
     }

     function ajax_received_json_data(json){
          var jsondata = json
          classTimeArray = [];
          offTimeArray = [];
          
          //월간 달력
          classDateArray = []
          classStartArray = []
          classNameArray = []
          countResult = []
          dateResult = []
          //월간 달력

          classTimeArray_member_name = [];
          classArray_lecture_id = [];
          scheduleIdArray = [];
          offScheduleIdArray = [];
          scheduleFinishArray = [];
          memberLectureIdArray = [];
          memberNameArray = [];
          memberAvailCountArray = [];
          messageArray = [];
          //dateMessageArray = [];
          repeatArray = [];
          offRepeatScheduleIdArray = [];
          offRepeatScheduleTypeArray = [];
          offRepeatScheduleWeekInfoArray = [];
          offRepeatScheduleStartDateArray = [];
          offRepeatScheduleEndDateArray = [];
          offRepeatScheduleStartTimeArray = [];
          offRepeatScheduleTimeDurationArray = [];
          ptRepeatScheduleIdArray = [];
          ptRepeatScheduleTypeArray = [];
          ptRepeatScheduleWeekInfoArray = [];
          ptRepeatScheduleStartDateArray = [];
          ptRepeatScheduleEndDateArray = [];
          ptRepeatScheduleStartTimeArray = [];
          ptRepeatScheduleTimeDurationArray = [];

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
          repeatArray = jsondata.repeatArray;
          offRepeatScheduleIdArray = jsondata.offRepeatScheduleIdArray;
          offRepeatScheduleTypeArray = jsondata.offRepeatScheduleTypeArray;
          offRepeatScheduleWeekInfoArray = jsondata.offRepeatScheduleWeekInfoArray;
          offRepeatScheduleStartDateArray = jsondata.offRepeatScheduleStartDateArray;
          offRepeatScheduleEndDateArray = jsondata.offRepeatScheduleEndDateArray;
          offRepeatScheduleStartTimeArray = jsondata.offRepeatScheduleStartTimeArray;
          offRepeatScheduleTimeDurationArray = jsondata.offRepeatScheduleTimeDurationArray;
          ptRepeatScheduleIdArray = jsondata.ptRepeatScheduleIdArray;
          ptRepeatScheduleTypeArray = jsondata.ptRepeatScheduleTypeArray;
          ptRepeatScheduleWeekInfoArray = jsondata.ptRepeatScheduleWeekInfoArray;
          ptRepeatScheduleStartDateArray = jsondata.ptRepeatScheduleStartDateArray;
          ptRepeatScheduleEndDateArray = jsondata.ptRepeatScheduleEndDateArray;
          ptRepeatScheduleStartTimeArray = jsondata.ptRepeatScheduleStartTimeArray;
          ptRepeatScheduleTimeDurationArray = jsondata.ptRepeatScheduleTimeDurationArray;
          DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classTimeArray,"class");
          DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offTimeArray,"off");
          $('.classTime,.offTime').parent().html('<div></div>')
          classTime();
          offTime();
          addPtMemberListSet();

          /*팝업의 timegraph 업데이트*/
          classDateData = []
          classTimeData = []
          offDateData= []
          offTimeData = []
          offAddOkArray = [] //OFF 등록 시작 시간 리스트
          durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트
          DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateData,"graph",classTimeData)
          DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offDateData,"graph",offTimeData)
          /*팝업의 timegraph 업데이트*/
          
          $('.blankSelected_addview').removeClass('blankSelected')

          //월간 달력
          //DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateArray,'member',classStartArray)
          //DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classNameArray,'class')
          //DBdataProcessMonthTrainer();
          //classDatesTrainer();
      }

	function closeDeletePopup(){
		if($('#cal_popup_plandelete').css('display')=='block'){
			$("#cal_popup_plandelete").css({'display':'none'})
			$('#shade').css({'display':'none'});
		}
		if($('#cal_popup_planinfo').css('display')=='block'){
			$("#cal_popup_planinfo").css({'display':'none'})
			$('#shade').css({'display':'none'});
		}
	}

	function deleteBeforeSend(){
		$('html').css("cursor","wait");
        $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
        $('.ajaxloadingPC').show();
        //$('#shade').css({'display':'block'});
	}

	function deleteCompleteSend(){
		$('html').css("cursor","auto");
        $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
        $('.ajaxloadingPC').hide();
        //$('#shade').css({'display':'none'});
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
	var currentMinute = date.getMinutes();

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

	var $calendarWidth = $('#calendar').width(); //현재 달력 넓이계산 --> classTime과 offTime 크기조정을 위해

// ############################구동시 실행################################################################################
// ****************************구동시 실행********************************************************************************
	calTable_Set(1,currentYear,currentPageMonth,currentDate,-14); // 이번주-2
	calTable_Set(2,currentYear,currentPageMonth,currentDate,-7); // 이번주-1
	calTable_Set(3,currentYear,currentPageMonth,currentDate,0); // 이번주
	calTable_Set(4,currentYear,currentPageMonth,currentDate,7); // 이번주+1
	calTable_Set(5,currentYear,currentPageMonth,currentDate,14); // 이번주+2

	DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classTimeArray,"class");
	DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offTimeArray,"off");
	//addcurrentTimeIndicator();
	classTime(); //PT수업 시간에 핑크색 박스 표시
	offTime();
	addPtMemberListSet();
	//DBrepeatdata(repeatData,'class')
	//DBrepeatdata(offrepeatData,'off')
	weekNum_Set_fixed()
	dateText();
	reserveAvailable()
	toDay();
	addcurrentTimeIndicator_blackbox()
	todayFinderArrow();	



// ****************************구동시 실행********************************************************************************
// ############################구동시 실행################################################################################

	//다음페이지로 슬라이드 했을때 액션
	myswiper.on('onSlideNextEnd',function(){
			slideControl.append();
			weekNum_Set_fixed()
			toDay();
			addcurrentTimeIndicator_blackbox()	
			dateText();
			reserveAvailable()
			todayFinderArrow();	
	});

	//이전페이지로 슬라이드 했을때 액션
	myswiper.on('onSlidePrevEnd',function(){
			slideControl.prepend();
			weekNum_Set_fixed()
			toDay();
			addcurrentTimeIndicator_blackbox()
			dateText();
			reserveAvailable()
			todayFinderArrow();			
	});

	
	//너무 빠르게 스와이프 하는 것을 방지
	/*
	myswiper.on('onTransitionStart',function(){
		myswiper.params.onlyExternal = true;
	})

	myswiper.on('onTransitionEnd',function(){
		setTimeout(function(){
			myswiper.params.onlyExternal = false;
		}, 400)
		
	})
	*/

	
	//너무 빠르게 스와이프 하는 것을 방지

	//아래로 스크롤중 스와이프 했을때, jquery.swipe에서 stopPropagation Error발생하여 스와이프 불가하는 현상 방지
	//스크롤중 swipe 기능막고, 스크롤 종료감지하여 종료 20ms 이후에 swipe 기능 살려주는 함수 
	

	$('.swiper-container').on('scroll touchmove mousewheel',function(event){
		event.stopPropagation();
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
			//classTime();
			//offTime();
			ajaxClassTime()
			
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
			ajaxClassTime()
			//classTime();
			//offTime();
			//classTime_Active('prev')
			//offTime_Active('prev')
			
			//DBrepeatdata(repeatData,'class')
			//DBrepeatdata(offrepeatData,'off')
		},
	};



	function calTable_Set(Index,Year,Month,Dates,Week,append){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성 
		//Week 선택자 2E, 1E, 0W, 1L, 2L
		//주간달력 상단표시줄 (요일, 날짜, Today표식)
		
		//weekTable(Index)

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

		var fakeElementForBlankPage = '<div class="fake_for_blankpage"><span>등록된 일정이 없습니다.</span></div>'
		for(var i=0; i<=23; i++){
			var textToAppend = '<div id="'+Year+'_'+Month+'_'+currentDate+'_'+Week+'_'+i+'H'+'" class="time-row">'
			var divToAppend = $(textToAppend)

			switch(currentDay_){
				case 0 :
				var td1 = []
				var td2 = []
				for(z=0; z<=6; z++){
					if(currentDates+z>lastDay[monthdata] && Month+1>12){ //해가 넘어갈때
						td1[z]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=0 && Month==1){
						td1[z]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z>lastDay[monthdata]){
						td1[z]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=lastDay[monthdata] && currentDates+z>0){
						td1[z]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=0){
						if(Month-1<1){
							td1[z]='<div'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
						}else{
							td1[z]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[monthdata-1])+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
						}
					}
				}
				var td1_1 = td1.join('')
				//var td2_1 = td2.join('')
				break;

				case 1 :
				var td1 = []
				var td2 = []
				for(z=-1; z<=5; z++){
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+1]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
						//td2[z+1]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+1]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
						//td2[z+1]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+1]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
						//td2[z+1]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+1]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
						//td2[z+1]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
					else if(currentDates+z<=0){
						td1[z+1]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
						//td2[z+1]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				//var td2_1 = td2.join('')
				break;

				case 2 :
				var td1 = []
				var td2 = []
				for(z=-2; z<=4; z++){
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+2]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
						//td2[z+2]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+2]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
						//td2[z+2]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+2]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
						//td2[z+2]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+2]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
						//td2[z+2]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+2]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
						//td2[z+2]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				//var td2_1 = td2.join('')
				break;
				
				case 3 :
				var td1 = []
				var td2 = []
				for(z=-3; z<=3; z++){
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+3]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
						//td2[z+3]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+3]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
						//td2[z+3]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+3]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
						//td2[z+3]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+3]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
						//td2[z+3]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+3]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
						//td2[z+3]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
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
						td1[z+4]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
						//td2[z+4]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+4]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
						//td2[z+4]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+4]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
						//td2[z+4]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+4]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
						//td2[z+4]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+4]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
						//td2[z+4]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				//var td2_1 = td2.join('')
				break;
				
				case 5 :				
				var td1 = []
				var td2 = []
				for(z=-5; z<=1; z++){
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+5]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
						//td2[z+5]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+5]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
						//td2[z+5]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+5]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
						//td2[z+5]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+5]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
						//td2[z+5]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+5]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
						//td2[z+5]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				//var td2_1 = td2.join('')
				break;
				
				case 6 :				
				var td1 = []
				var td2 = []
				for(z=-6; z<=0; z++){
					if(currentDates+z>lastDay[currentMonth] && Month+1>12){
						td1[z+6]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
						//td2[z+6]='<td'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+6]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
						//td2[z+6]='<td'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+6]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
						//td2[z+6]='<td'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+6]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
						//td2[z+6]='<td'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}else if(currentDates+z<=0){
						td1[z+6]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
						//td2[z+6]='<td'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</td>';
					}
				}
				var td1_1 = td1.join('')
				//var td2_1 = td2.join('')
				break;
			}
			//var td = td1_1+td1_2+td1_3+td1_4+td1_5+td1_6+td1_7+'</tr><tr>'+td2_1+td2_2+td2_3+td2_4+td2_5+td2_6+td2_7+'</tr></tbody></table></div>'
			//var td= td1_1+'</tr><tr>'+td2_1+'</tr></tbody></table></div>'
			var td= td1_1 + '</div>'
			if(i<12){
					textToAppend2 = '<div class="slidegap">'+'<span class="_morningday">오전 </span>'+i+'<div></div></div>'+td
			}else{
					textToAppend2 = '<div class="slidegap">'+'<span class="_morningday">오후 </span>'+i+'<div></div></div>'+td
			};
			var sum = textToAppend+textToAppend2
			slideIndex.append(sum);
		};
		slideIndex.append(fakeElementForBlankPage);
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

		//연도, 월 셋팅
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
				$('#ymdText-pc-month-start').text(mm1+'월')
				$('#ymdText-pc-month-end').text(mm2+'월')
			}else if(yy1!=yy2){
				$('#yearText').text(yy1+'/'+yy2+'년');
				$('#monthText').text(mm1+'/'+mm2+'월')
			}
		}else{
			var yymm = yymmarry[0].split('_')
			$('#yearText').text(yymm[0]+'년');
			$('#monthText').text(yymm[1]+'월');
			$('#ymdText-pc-month-start').text(yymm[1]+'월')
			$('#ymdText-pc-month-end').text('')
		}

		//일자 셋팅
		var dd_weekstart = $('#weekNum_1').attr('data-date').substr(6,2)
		var dd_weekend = $('#weekNum_7').attr('data-date').substr(6,2)
		if(dd_weekstart.substr(0,1)=='0'){
			var dd_weekstart = dd_weekstart.substr(1,1)
		}
		if(dd_weekend.substr(0,1)=='0'){
			var dd_weekend = dd_weekend.substr(1,1)
		}
		$('#ymdText-pc-date-start').text(dd_weekstart+'일')
		$('#ymdText-pc-date-end').text(dd_weekend+'일')

	}

	
	function weekNum_Set(Index){
		var index = Number(myswiper.activeIndex+1);
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
			var dateID = swiperPage.find('.td00:nth-child('+i+')').attr('id').split('_');
			//console.log(dateID)
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

		//toDay();
		//reserveAvailable();
	}

	function weekNum_Set_fixed(){

		var weekNum_1 = $('#weekNum_1')
		var weekNum_2 = $('#weekNum_2')
		var weekNum_3 = $('#weekNum_3')
		var weekNum_4 = $('#weekNum_4')
		var weekNum_5 = $('#weekNum_5')
		var weekNum_6 = $('#weekNum_6')
		var weekNum_7 = $('#weekNum_7')

		var sunday = $('#sunDate')
		var monday = $('#monDate')
		var tuesday = $('#tueDate')
		var wednesday = $('#wedDate')
		var thursday = $('#thrDate')
		var friday = $('#friDate')
		var saturday = $('#satDate')

		var Sunday_date = $('.swiper-slide-active'+' div.td00:nth-child(2)').attr('id').split('_')[2]
		var Monday_date = $('.swiper-slide-active'+' div.td00:nth-child(3)').attr('id').split('_')[2]
		var Tuesday_date = $('.swiper-slide-active'+' div.td00:nth-child(4)').attr('id').split('_')[2]
		var Wednesday_date = $('.swiper-slide-active'+' div.td00:nth-child(5)').attr('id').split('_')[2]
		var Thursday_date = $('.swiper-slide-active'+' div.td00:nth-child(6)').attr('id').split('_')[2]
		var Friday_date = $('.swiper-slide-active'+' div.td00:nth-child(7)').attr('id').split('_')[2]
		var Saturday_date = $('.swiper-slide-active'+' div.td00:nth-child(8)').attr('id').split('_')[2]

		var currentPageDateInfo = []
		for (var i=2; i<=8; i++){
			var yy = $('.swiper-slide-active'+' div.td00:nth-child('+i+')').attr('id').split('_')[0]
			var mm = $('.swiper-slide-active'+' div.td00:nth-child('+i+')').attr('id').split('_')[1]
			if(mm.length<2){
				var mm = '0' + mm
			}
			var dd = $('.swiper-slide-active'+' div.td00:nth-child('+i+')').attr('id').split('_')[2]
			if(dd.length<2){
				var dd = '0' + dd
			}
			var yymmdd = yy+mm+dd
			currentPageDateInfo[i-2] = yymmdd
		}

		var WeekArry = [sunday,monday,tuesday,wednesday,thursday,friday,saturday]
		var WeekArryTarget = [Sunday_date,Monday_date,Tuesday_date,Wednesday_date,Thursday_date,Friday_date,Saturday_date]
		var WeekNum = [weekNum_1,weekNum_2,weekNum_3,weekNum_4,weekNum_5,weekNum_6,weekNum_7]

		for(var i=0; i<7;i++){
			WeekArry[i].html(WeekArryTarget[i]+'일')
			WeekNum[i].attr('data-date', currentPageDateInfo[i])
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
		var todayInfo = String(currentYear) + currentMM + currentDD
		var viewdayInfomin = $('#weekNum_1').attr('data-date');
		var viewdayInfomax = $('#weekNum_7').attr('data-date');

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

	function toDay(){
		var yy = String(currentYear)
		var dd = String(currentDate)
		var mm = String(currentPageMonth)
		for(var i=0;i<=23;i++){
			$("#"+yy+'_'+mm+'_'+dd+'_'+i+'_00').addClass('todaywide')
		}

		for(var i=1;i<=7;i++){
			var scan = $('#weekNum_'+i).attr('data-date')
			if(mm.length<2){
				var mm = '0'+mm
			}
			if(dd.length<2){
				var dd = '0'+dd
			}
			if(scan == yy+mm+dd){
				$('#weekNum_'+i).addClass('todaywide')
				$('#weekNum_'+i+' span:nth-child(1)').addClass('today').html('TODAY')
				$('#weekNum_'+i+' span:nth-child(3)').addClass('today-Number')
			}else{
				$('#weekNum_'+i).removeClass('todaywide')
				$('#weekNum_'+i+' span:nth-child(1)').removeClass('today').html('')
				$('#weekNum_'+i+' span:nth-child(3)').removeClass('today-Number')
			}
		}
	}

	function reserveAvailable(){
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
		var scan = $('#weekNum_'+i).attr('data-date')
			if(yymmdd<=scan && scan<=14+Number(yymmdd)){
				$('#weekNum_'+i).addClass('reserveavailable')
			}else if(scan.substr(0,4)==yy+1 && scan.substr(4,2) == '01' &&scan.substr(6,2)<=Number(dd)+14-lastDay[currentMonth]){
				$('#weekNum_'+i).addClass('reserveavailable')
			}
			else if(scan.substr(4,2)== Number(mm)+1 && scan.substr(6,2)<=Number(dd)+14-lastDay[currentMonth]){
				$('#weekNum_'+i).addClass('reserveavailable')	
			}else{
				$('#weekNum_'+i).removeClass('reserveavailable')
				
			}
		}
	}

	function classTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
		var planheight = 30;
			if($calendarWidth>=600){
				//var planheight = 46;
				var planheight = 43;
		}
		var classlen = classTimeArray.length;
		$('#calendar').css('display','none');
		for(var i=0; i<classlen; i++){
			var indexArray = classTimeArray[i]
			var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
			var classYear = datasplit[0]
			var classMonth = datasplit[1]
			var classDate = datasplit[2]
			var classHour = datasplit[3]
			var hourType = ""
			if(classHour == 24){
				var hourType = "오전"
				var classHour = 0
			}else if(classHour < 12){
				var hourType = "오전"
			}else{
				var hourType = "오후"
			}
			var classMinute = datasplit[4]
			var classDura = datasplit[5];
			var memberName = datasplit[6];
			if(memberName.length>3){
				var memberName = memberName.substr(0,3) + ".."
			}
			var classStartArr = [classYear,classMonth,classDate,classHour,classMinute]
			var classStart = classStartArr.join("_")
			var tdClassStart = $("#"+classStart+" div");
			var tdClass = $("#"+classStart);
			tdClass.parent('div').siblings('.fake_for_blankpage').css('display','none')

			if(scheduleFinishArray[i]=="0") {
                tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('classTime').css({'height': Number(classDura * planheight - 1) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' +'<p class="hourType">' +hourType+'</p>' + classHour + ':' + classMinute + '</span>');
            }else {
                tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('classTime classTime_checked').css({'height': Number(classDura * planheight - 1) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' + '<p class="hourType">' +hourType+'</p>' + classHour + ':' + classMinute + '</span>');
            }
		};
		$('#calendar').css('display','block');
	};

	function offTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
		var planheight = 30;
			if($calendarWidth>=600){
				var planheight = 46;
		}
		var offlen = offTimeArray.length;
		$('#calendar').css('display','none');
		for(var i=0; i<offlen; i++){
			var indexArray = offTimeArray[i]
			var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
			var offYear = datasplit[0]
			var offMonth = datasplit[1]
			var offDate = datasplit[2]
			var offHour = datasplit[3]
			var hourType = ""
			if(offHour==24){
				var hourType = "오전"
				var offHour = 0
			}else if(offHour < 12){
				var hourType = "오전"
			}else{
				var hourType = "오후"
			}
			var offMinute = datasplit[4]
			var offDura = datasplit[5];
			var memberName = datasplit[6];
			var offStartArr = [offYear,offMonth,offDate,offHour,offMinute]
			var offStart = offStartArr.join("_")
			//var offStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
			var tdOffStart = $("#"+offStart+" div");
			var tdOff = $("#"+offStart);
			tdOff.parent('div').siblings('.fake_for_blankpage').css('display','none')
			
			tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*planheight-1)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + offHour+':'+offMinute+'</span>');
		};
		$('#calendar').css('display','block');
	};


	function classTime_Active(option){
		var planheight = 30;
		if($calendarWidth>=600){
			var planheight = 43;
		}

		switch(option){
			case 'next' :
				var slideToCalc = $('.swiper-slide:last-child')
				var lastpagedateinfo = slideToCalc.find('.td00').attr('id').split('_');
				var addfunction = function(){
					if(classDateAdd >= lastpagelastdate){	
						var classStartArr = [classYear,datasplit[1],datasplit[2],classHour,classMinute]
						var classStart = classStartArr.join("_")
						var tdClassStart = $("#"+classStart+" div");
						var tdClass = $("#"+classStart);
						tdClass.parent('div').siblings('.fake_for_blankpage').css('display','none')

						//schedule-id 추가 (일정 변경 및 삭제를 위함) hk.kim, 171007
						if(scheduleFinishArray[i]=="0") {
			                tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('classTime').css({'height': Number(classDura * planheight - 1) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' + '<p class="hourType">' +hourType+'</p>' + classHour + ':' + classMinute + '</span>');
			            }else {
			                tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('classTime classTime_checked').css({'height': Number(classDura * planheight - 1) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' + '<p class="hourType">' +hourType+'</p>' + classHour + ':' + classMinute + '</span>');
			            }
					}
				}
			break;
			case 'prev' :
				var slideToCalc = $('.swiper-slide:first-child')
				var lastpagedateinfo = slideToCalc.find('.td00:last-child').attr('id').split('_');
				var addfunction = function(){
					if(classDateAdd <= lastpagelastdate){	
						var classStartArr = [classYear,datasplit[1],datasplit[2],classHour,classMinute]
						var classStart = classStartArr.join("_")
						var tdClassStart = $("#"+classStart+" div");
						var tdClass = $("#"+classStart);
						tdClass.parent('div').siblings('.fake_for_blankpage').css('display','none')
						//schedule-id 추가 (일정 변경 및 삭제를 위함) hk.kim, 171007
						if(scheduleFinishArray[i]=="0") {
			                tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('classTime').css({'height': Number(classDura * planheight - 1) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' + '<p class="hourType">' +hourType+'</p>' + classHour + ':' + classMinute + '</span>');
			            }else {
			                tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('classTime classTime_checked').css({'height': Number(classDura * planheight - 1) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' + '<p class="hourType">' +hourType+'</p>' +classHour + ':' + classMinute + '</span>');
			            	
			            }
					}
				}
			break;
		}

		var yy = lastpagedateinfo[0]
		var mm = lastpagedateinfo[1]
		var dd = lastpagedateinfo[2]
		if(mm.length<2){
			var mm = '0'+ lastpagedateinfo[1]
		}
		if(dd.length<2){
			var dd = '0'+ lastpagedateinfo[2]
		}
		var lastpagelastdate = yy+mm+dd //마지막 페이지 마지막 날짜 정보 20170121

		var classlen = classTimeArray.length;
		var class_Next = []
		for(var i=0; i<classlen; i++){
			var indexArray = classTimeArray[i]
			var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
			var classYear = datasplit[0]
			var classMonth = datasplit[1]
			if(classMonth.length<2){
				var classMonth = '0'+classMonth
			}
			var classDate = datasplit[2]
			if(classDate.length<2){
				var classDate = '0'+classDate
			}
			var classHour = datasplit[3]
			if(classHour == 24){
				var hourType = "오전"
				var classHour = 0
			}else if(classHour < 12){
				var hourType = "오전"
			}else{
				var hourType = "오후"
			}
			var classMinute = datasplit[4]
			var classDura = datasplit[5];
			var memberName = datasplit[6];
			if(memberName.length>3){
				var memberName = memberName.substr(0,3) + ".."
			}

			var classDateAdd = classYear+classMonth+classDate
			addfunction();
		};


	}


	function offTime_Active(option){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
		var planheight = 30;
			if($calendarWidth>=600){
				var planheight = 46;
		}

		switch(option){
			case 'next' :
				var slideToCalc = $('.swiper-slide:last-child')
				var lastpagedateinfo = slideToCalc.find('.td00').attr('id').split('_');
				var addfunction = function(){
					if(offDateAdd >= lastpagelastdate){	
						var offStartArr = [offYear,datasplit[1],datasplit[2],offHour,offMinute]
						var offStart = offStartArr.join("_")
						var tdOffStart = $("#"+offStart+" div");
						var tdOff = $("#"+offStart);
						tdOff.parent('div').siblings('.fake_for_blankpage').css('display','none')
						tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*planheight-1)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + offHour+':'+offMinute+'</span>');
					}
				}
			break;
			case 'prev' :
				var slideToCalc = $('.swiper-slide:first-child')
				var lastpagedateinfo = slideToCalc.find('.td00:last-child').attr('id').split('_');
				var addfunction = function(){
					if(offDateAdd <= lastpagelastdate){	
						var offStartArr = [offYear,datasplit[1],datasplit[2],offHour,offMinute]
						var offStart = offStartArr.join("_")
						var tdClassStart = $("#"+offStart+" div");
						var tdOff = $("#"+offStart);
						tdOff.parent('div').siblings('.fake_for_blankpage').css('display','none')

						tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*planheight-1)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' +offHour+':'+offMinute+'</span>');
					}
				}
			break;
		}

		var yy = lastpagedateinfo[0]
		var mm = lastpagedateinfo[1]
		var dd = lastpagedateinfo[2]
		if(mm.length<2){
			var mm = '0'+ lastpagedateinfo[1]
		}
		if(dd.length<2){
			var dd = '0'+ lastpagedateinfo[2]
		}
		var lastpagelastdate = yy+mm+dd //마지막 페이지 마지막 날짜 정보 20170121

		var offlen = offTimeArray.length;
		for(var i=0; i<offlen; i++){
			var indexArray = offTimeArray[i]
			var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
			var offYear = datasplit[0]
			var offMonth = datasplit[1]
			if(offMonth.length<2){
				var offMonth = '0'+datasplit[1]
			}
			var offDate = datasplit[2]
			if(offDate.length<2){
				var offDate = '0'+datasplit[2]
			}
			var offHour = datasplit[3]
			if(offHour==24){
				var hourType = "오전"
				var offHour = 0
			}else if(offHour < 12){
				var hourType = "오전"
			}else{
				var hourType = "오후"
			}
			var offMinute = datasplit[4]
			var offDura = datasplit[5];
			var memberName = datasplit[6];
			var offStartArr = [offYear,datasplit[1],datasplit[2],offHour,offMinute]
			var offStart = offStartArr.join("_")
			var tdOffStart = $("#"+offStart+" div");

			var offDateAdd = offYear+offMonth+offDate
			addfunction()
			};
	};

	function fake_show(){
		//var faketarget = selector.parent('div').siblings('.fake_for_blankpage')
		if($('.swiper-slide-active').find('.classTime').length == 1 && $('.swiper-slide-active').find('.offTime').length == 0){
			$('.swiper-slide-active').find('.fake_for_blankpage').css('display','block')
		}else if($('.swiper-slide-active').find('.classTime').length == 0 && $('.swiper-slide-active').find('.offTime').length == 1){
			$('.swiper-slide-active').find('.fake_for_blankpage').css('display','block')
		}
	}

	$(document).on('click','.fake_for_blankpage',function(){
		$(this).fadeOut('fast')
	})

	function addcurrentTimeIndicator_blackbox(){ //현재 시간에 밑줄 긋기
		if($('.today').length){
			$('#hour'+currentHour).addClass('currentTimeBlackBox');
			var indicator_Location = $('#hour'+currentHour).position().top
			var minute_adjust = 45*(currentMinute/60)
			$('#timeIndicatorBar').css('top',indicator_Location+minute_adjust)
			$('#timeIndicatorBar').fadeIn('fast')
		}else{
			$('.hour').removeClass('currentTimeBlackBox');
			$('#timeIndicatorBar').fadeOut('fast')
		}
	}

	function scrollToIndicator(){
		var offset = $('.currentTimeBlackBox').offset();
		if(currentHour>=5){
			$('#slide2').animate({scrollTop : offset.top -180},500)
		}
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


    function startTimeSet(){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21];
        startTimeArraySet(); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
        var offOkLen = offAddOkArray.length
        var startTimeList = $('#starttimes,#starttimes_off');
        var timeArray = [];
        for(var i=0; i<offOkLen; i++){
          var offHour = offAddOkArray[i];
          if(offHour<12){
            var offText = '오전 '
            var offHours = offHour;
          }else if(offHour==24){
            var offText = '오전 '
            var offHours = offHour-12
          }else if(offHour==12){
            var offText = '오후 '
            var offHours = offHour
          }else{
            var offHours = offHour-12
            var offText = '오후 '
          }
          if(offHour.length<2){
            timeArray[i] ='<li><a data-trainingtime="'+'0'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+'시'+'</a></li>'
          }else{
            timeArray[i] ='<li><a data-trainingtime="'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+'시'+'</a></li>'
          }
        }
        timeArray[offOkLen]='<li><a data-trainingtime="dummy" class="pointerList">'+'<img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;">'+'</a></li>'
        var timeArraySum = timeArray.join('')
        startTimeList.html(timeArraySum)
      }

    function startTimeArraySet(){ //offAddOkArray 채우기 : 시작시간 리스트 채우기
        offAddOkArray = []
        for(i=0;i<=23;i++){
          if(!$('#'+i+'g').hasClass('pinktimegraph') == true && !$('#'+i+'g').hasClass('greytimegraph') == true){
            offAddOkArray.push(i);
          }
        }
    }


    function durTimeSet(selectedTime){ // durAddOkArray 채우기 : 진행 시간 리스트 채우기
        var len = offAddOkArray.length;
        var durTimeList = $('#durations')
        var index = offAddOkArray.indexOf(Number(selectedTime));
        var substr = offAddOkArray[index+1]-offAddOkArray[index];
       if(substr>1){
          var fininfo = Number(selectedTime)+1
          if(fininfo>12){
             if(fininfo==25){
               var fininfo = '오전 1'
             }else if(fininfo==24){
               var fininfo = '오전 12'
             }else{
               var fininfo = '오후'+(fininfo-12)  
             }
           }else if(fininfo==12){
             var fininfo = '오후'+fininfo  
           }else{
             var fininfo = '오전'+fininfo
           }
          durTimeList.html('<li><a data-dur="1" class="pointerList">1시간'+' (~'+fininfo+'시)'+'</a></li>')
        }else{
          durTimeList.html('')
          for(var j=index; j<=len; j++){
            
            var fininfo = Number(selectedTime)+(j-index+1)
            if(fininfo>12){
              if(fininfo==25){
                var fininfo = '오전 1'
              }else if(fininfo==24){
                var fininfo = '오전 12'
              }else{
                var fininfo = '오후'+(fininfo-12)  
              }
            }else if(fininfo==12){
              var fininfo = '오후'+fininfo  
            }else{
              var fininfo = '오전'+fininfo
            }

            if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>') 
            }
            else if(offAddOkArray[j-1]== null && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
            }
            else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
            }
            else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]>=2){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
              break;
            }
            else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
              //break;
            }
            else if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
            }
            else if(offAddOkArray[j-1]==null && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
            }
          }
        }
         durTimeList.append('<li><a data-dur="dummy" class="pointerList">'+'<img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;">'+'</a></li>')
    }

//회원 정보 ajax 연동을 위해 구현 - hk.kim 180110
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

	function fill_repeat_info_off(){ //반복일정 요약 채우기
      var len = offRepeatScheduleTypeArray.length
      var repeat_info_dict= { 'KOR':
                              {'DD':'매일', 'WW':'매주', '2W':'격주',
                               'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일'},
                              'JAP':
                              {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                               'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日'},
                              'JAP':
                              {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                               'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat'}
                             }
      var schedulesHTML = []
      for(var i=0; i<len; i++){
        var repeat_id = offRepeatScheduleIdArray[i]
        var repeat_type = repeat_info_dict['KOR'][offRepeatScheduleTypeArray[i]]
        var repeat_start = offRepeatScheduleStartDateArray[i].replace(/-/gi,".");
        var repeat_end = '반복종료 : ' + offRepeatScheduleEndDateArray[i].replace(/-/gi,".");
        var repeat_time = Number(offRepeatScheduleStartTimeArray[i].split(':')[0])+0
        var repeat_dur = offRepeatScheduleTimeDurationArray[i]
        var repeat_sum = Number(repeat_time) + Number(repeat_dur)
        var repeat_day = function(){
          var repeat_day_info_raw = offRepeatScheduleWeekInfoArray[i].split('/')
          var repeat_day_info = ""
          if(repeat_day_info_raw.length>1){
            for(var j=0; j<repeat_day_info_raw.length; j++){
                var repeat_day_info = repeat_day_info + '/' + repeat_info_dict['KOR'][repeat_day_info_raw[j]].substr(0,1)
            }
          }else if(repeat_day_info_raw.length == 1){
            var repeat_day_info = repeat_info_dict['KOR'][repeat_day_info_raw[0]]
          }
          if(repeat_day_info.substr(0,1) == '/'){
            var repeat_day_info = repeat_day_info.substr(1,repeat_day_info.length)
          }
          
          return repeat_day_info
        };

        var summaryInnerBoxText_1 = '<span class="summaryInnerBoxText">'+repeat_type +' '+repeat_day() +' '+repeat_time+' ~ '+repeat_sum+'시 ('+repeat_dur +'시간)</span>'
        var summaryInnerBoxText_2 = '<span class="summaryInnerBoxText2">'+repeat_end+'</span>'
        var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>'
        schedulesHTML[i] = '<div class="summaryInnerBox" data-id="'+repeat_id+'">'+summaryInnerBoxText_1+summaryInnerBoxText_2+deleteButton+'</div>'
      }

      var summaryText = '<span id="summaryText">일정요약</span>'
      $('#offRepeatSummary').html(summaryText + schedulesHTML.join(''))
    }

});//document(ready)

