/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/
$(document).ready(function(){



	setInterval(function(){
		ajaxCheckSchedule();
		//todayFinderArrow()
		addcurrentTimeIndicator_blackbox()
	}, 60000)// 자동 ajax 새로고침(일정가져오기)


	function ajaxCheckSchedule(){

            $.ajax({
              url: '/schedule/check_schedule_update/',
			  dataType : 'html',

              beforeSend:function(){
              	//beforeSend();
              },

              success:function(data){
              	var jsondata = JSON.parse(data);
              	if(jsondata.messageArray.length>0){
                  	$('#errorMessageBar').show()
                  	$('#errorMessageText').text(jsondata.messageArray)
                }else{
                	var update_data_changed = jsondata.data_changed;
					if(update_data_changed[0]=="1"){
						ajaxClassTime();
					}
                }
                
			  },

              complete:function(){
              	//completeSend();
              },

              error:function(){
                console.log('server error')
              }
            })
     }

    //회원이름을 클릭했을때 회원정보 팝업을 보여주며 정보를 채워준다.
    $(document).on('click','.memberNameForInfoView',function(){
    	var dbID = $(this).attr('data-dbid')
    	$('.popups').hide()
    	if($('body').width()<600){
    		$('#calendar').css('display','none')
            get_indiv_member_info(dbID)
            get_indiv_repeat_info(dbID);
            get_member_lecture_list(dbID);
            get_member_history_list(dbID);
            shade_index(100)
        }else if($('body').width()>=600){
            get_indiv_member_info(dbID)
            get_indiv_repeat_info(dbID);
            get_member_lecture_list(dbID);
            get_member_history_list(dbID);
            $('#info_shift_base, #info_shift_lecture').show();
            $('#info_shift_schedule, #info_shift_history').hide();
            $('#select_info_shift_lecture').addClass('button_active')
            $('#select_info_shift_schedule, #select_info_shift_history').removeClass('button_active')
        }
    });



	$('#upbutton-x').click(function(){
		$('#calendar').css('height','90%')
	    $('#page-addplan').fadeOut('fast','swing');
	    if($('body').width()<600){
	        $('#calendar').show();
	    }
	    $('#float_btn_wrap').show();
	    $('#float_btn').removeClass('rotate_btn');
	    $('#page-base').fadeIn();
	    $('#page-base-addstyle').fadeOut();

	    $("#membersSelected button").removeClass("dropdown_selected");
	    if(Options.language == "KOR"){
	    	var text1 = '회원명 선택'
	    	var text2 = '선택'
	    }else if(Options.language == "JPN"){
	    	var text1 = '「会員選択」'
	    	var text2 = '「選択」'
	    }else if(Options.language == "ENG"){
	    	var text1 = 'Choose member'
	    	var text2 = 'Choose'
	    }
        $("#membersSelected .btn:first-child").html("<span style='color:#cccccc;'>"+text1+"</span>");
        $("#membersSelected .btn:first-child").val("");
        $("#countsSelected,.countsSelected").text("")
        $("#dateSelector p").removeClass("dropdown_selected");
        $('#timeGraph').hide();
        $("#starttimesSelected button").removeClass("dropdown_selected");
        $("#starttimesSelected .btn:first-child").html("<span style='color:#cccccc;'>"+text2+"</span>");
        $("#starttimesSelected .btn:first-child").val("");
        $("#durationsSelected button").removeClass("dropdown_selected");
        $("#durationsSelected .btn:first-child").html("<span style='color:#cccccc;'>"+text2+"</span>");
        $("#durationsSelected .btn:first-child").val("");
        $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
        $("#starttimes").empty();
        $("#durations").empty();
        $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder')

        $('#page-addplan .dropdown_selected').removeClass('dropdown_selected')
        $('.dateButton').removeClass('dateButton_selected')
        $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate',null)
        $('#repeattypeSelected button, #repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>"+text2+"</span>");
        //$('#page-addplan form input').val('')
        selectedDayGroup = []

        $('._NORMAL_ADD_wrap').css('display','block')
        $('._REPEAT_ADD_wrap').css('display','none')
        $('#timeGraph').css('display','none')
  	})
  //모바일 스타일

  //PC 스타일
  	$('.cancelBtn_mini').click(function(){
  		closeMiniPopup()
  	})
  //PC 스타일

  	

   	function closeMiniPopup(){
   		$("#id_time_duration_off").val("")
	    $('#page-addplan-pc').fadeOut();
	    $('.blankSelected, .blankSelected30').removeClass('blankSelected blankSelected30 blankSelected_addview')
	    $('.submitBtn').removeClass('submitBtnActivated')
	    $('#classDuration_mini #durationsSelected button').removeClass('dropdown_selected')
	    $('#submitBtn_mini').css('background','#282828')
	    $('#memo_mini').val("")

	    $("#membersSelected button").removeClass("dropdown_selected");
	    if(Options.language == "KOR"){
	    	var text1 = '회원명 선택'
	    	var text2 = '선택'
	    }else if(Options.language == "JPN"){
	    	var text1 = '「会員選択」'
	    	var text2 = '「選択」'
	    }else if(Options.language == "ENG"){
	    	var text1 = 'Choose member'
	    	var text2 = 'Choose'
	    }
        $("#membersSelected .btn:first-child").html("<span style='color:#cccccc;'>"+text1+"</span>");
        $("#membersSelected .btn:first-child").val("");
        $("#countsSelected,.countsSelected").text("")
        $("#dateSelector p").removeClass("dropdown_selected");
        $('#timeGraph').hide();
        $("#starttimesSelected button").removeClass("dropdown_selected");
        $("#starttimesSelected .btn:first-child").html("<span style='color:#cccccc;'>"+text2+"</span>");
        $("#starttimesSelected .btn:first-child").val("");
        $("#durationsSelected button").removeClass("dropdown_selected");
        $("#durationsSelected .btn:first-child").html("<span style='color:#cccccc;'>"+text2+"</span>");
        $("#durationsSelected .btn:first-child").val("");
        $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
        $("#starttimes").empty();
        $("#durations").empty();
        $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder')
   	}


	var schedule_on_off = 0; //0 : OFF Schedule / 1 : PT Schedule
	//상단바 터치시 주간달력에 회원명/시간 표시 ON OFF

	


	//스케쥴 클릭시 팝업 Start
	$(document).on('click','div.classTime',function(){ //일정을 클릭했을때 팝업 표시
		toggleGroupParticipantsList('off')
		$('.pt_memo_guide_popup').css('display','block')
		$('#subpopup_addByList_plan, #popup_btn_viewGroupParticipants').hide()
		deleteTypeSelect = ''
		addTypeSelect ='ptadd'
		var dbid = $(this).attr('data-dbid')
		var info = $(this).attr('class-time').split('_')
		var yy=info[0]
		var mm=info[1]
		var dd=info[2]
		var time = info[3]
		if(time == 24){
			var time = 0
		}
		var minute = info[4]
		var classdur = info[5]
		var classdurTime = parseInt(info[5]) + "시간 "
		if(classdur.indexOf('.')){
			var classdurMin = "30분"
		}else{
			var classdurMin = ""
		}
		var dur = '('+classdurTime + classdurMin+')'
		var dayobj = new Date(yy,mm-1,dd)
		var dayraw = dayobj.getDay();
		var dayarryKR = ['일','월','화','수','목','금','토']
		var dayarryJP = ['日','月','火','水','木','金','土']
		var dayarryEN = ['Sun','Mon','Tue','Wed','Ths','Fri','Sat']
		switch(Options.language){
			case "KOR" :
			var member = " 회원님의 ";
			var yourplan = " 일정";
			var day = dayarryKR[dayraw];
			var text = '레슨 일정'
			break;
			case "JPN" :
			var member = "様の ";
			var yourplan = " 日程";
			var day = dayarryJP[dayraw];
			var text = 'PT 日程'
			break;
			case "ENG" :
			var member = "'s schedule at ";
			var yourplan = "";
			var day = dayarryEN[dayraw];
			var text = 'PT Plan'
			break; 
		}
		$('#popup_planinfo_title').text(text)
		$('#popup_btn_complete').css({'color':'#282828','background':'#ffffff'}).val('')
		$('#popup_info3_memo').attr('readonly',true).css({'border':'0'});
		$('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'})
        $('#canvas').hide().css({'border-color':'#282828'})
		$('#canvasWrap').css({'height':'0px'})
		$('#canvasWrap span').hide();

		$('#page-addplan-pc').hide()
		$("#cal_popup_planinfo").fadeIn('fast');
		shade_index(100)
		closeAlarm('pc')

		$('#popup_info3_memo,#popup_info3_memo_modify').show()
		var schedule_finish_check = $(this).attr('data-schedule-check')
		
		
		var infoText = yy+'. '+mm+'. '+dd+' '+'('+day+')'
		var infoText2 = '<span class="memberNameForInfoView" data-dbid="'+dbid+'" data-name="'+info[6]+'" '+'data-schedule-check="'+schedule_finish_check+'">'+info[6]+'</span>'+member+time+':'+minute+yourplan
		var infoText3 = $(this).attr('data-memo')
		if($(this).attr('data-memo') == undefined){
			var infoText3 = ""
		}
		$('#popup_info').text(infoText);
		$('#popup_info2').html(infoText2);
		$('#popup_info3_memo').text(infoText3).val(infoText3)
		$('#cal_popup_planinfo').attr({'schedule_id': $(this).attr('class-schedule-id'),'data-grouptype':'class'})
		$("#id_schedule_id").val($(this).attr('class-schedule-id')); //shcedule 정보 저장
		$("#id_schedule_id_modify").val($(this).attr('class-schedule-id')); //shcedule 정보 저장
		$("#id_schedule_id_finish").val($(this).attr('class-schedule-id')); // shcedule 정보 저장
		$("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_repeat_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_member_name_delete").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_member_name_finish").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_repeat_member_id").val($(this).attr('data-dbid')); //member id 정보 저장
		$("#id_repeat_lecture_id").val($(this).attr('data-lectureId')); //lecture id 정보 저장
		$("#id_lecture_id_modify").val($(this).attr('data-lectureId')); //lecture id 정보 저장
		$("#id_lecture_id_finish").val($(this).attr('data-lectureId')); //lecture id 정보 저장
		if(schedule_finish_check=="0"){
			$("#popup_btn_complete").show()
			$("#popup_text1").css("display","block")
			$("#popup_sign_img").css("display","none")
        }
        else{
			$("#popup_btn_complete").hide()
			$("#popup_text1").css("display","none")
			$("#popup_sign_img").css("display","block")
			$("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('class-schedule-id')+'.png');
		}
		schedule_on_off = 1;
	})
	
	//Off 일정 클릭시 팝업 Start
	$(document).on('click','div.offTime',function(){ //일정을 클릭했을때 팝업 표시
		toggleGroupParticipantsList('off')
		$('.pt_memo_guide_popup').css('display','none')
		$('#subpopup_addByList_plan, #popup_btn_viewGroupParticipants').hide()
		deleteTypeSelect = ''
		addTypeSelect ='ptadd'
		var info = $(this).attr('off-time').split('_')
		var yy=info[0]
		var mm=info[1]
		var dd=info[2]
		var time = info[3]
		if(time == 24){
			var time = 0
		}
		var minute = info[4]
		var dayobj = new Date(yy,mm-1,dd)
		var dayraw = dayobj.getDay();
		var dayarryKR = ['일','월','화','수','목','금','토']
		var dayarryJP = ['日','月','火','水','木','金','土']
		var dayarryEN = ['Sun','Mon','Tue','Wed','Ths','Fri','Sat']
		switch(Options.language){
			case "KOR" :
			var comment = ""
			var yourplan = " OFF 일정";
			var day = dayarryKR[dayraw];
			var text = 'OFF 일정'
			break;
			case "JPN" :
			var comment = ""
			var yourplan = " OFF日程";
			var day = dayarryJP[dayraw];
			var text = 'OFF 日程'
			break;
			case "ENG" :
			var comment = "OFF at "
			var yourplan = "";
			var day = dayarryEN[dayraw];
			var text = 'OFF'
			break; 
		}
		$('#popup_planinfo_title').text(text)
		$('#popup_btn_complete').css({'color':'#282828','background':'#ffffff'}).val('')
		$('#popup_info3_memo').attr('readonly',true).css({'border':'0'});
		$('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'})
        $('#canvas').hide().css({'border-color':'#282828'})
		$('#canvasWrap').css({'height':'0px'})
		$('#canvasWrap span').hide();

		$('#page-addplan-pc').hide()
		//$('.td00').css('background','transparent')
		$("#cal_popup_planinfo").fadeIn('fast');
		$('#popup_info3_memo,#popup_info3_memo_modify').show()
		shade_index(100)
		closeAlarm('pc')

		
		var infoText =  yy+'. '+mm+'. '+dd+' '+'('+day+')'
		var infoText2 = comment + time +':'+minute+ yourplan
		var infoText3 = $(this).attr('data-memo')
		if($(this).attr('data-memo') == undefined){
			var infoText3 = ""
		}
		$('#popup_info').text(infoText);
		$('#popup_info2').text(infoText2);
		$('#popup_info3_memo').text(infoText3).val(infoText3)
		$('#cal_popup_planinfo').attr({'schedule_id':$(this).attr('off-schedule-id'), 'data-grouptype':'off'})
		$("#id_off_schedule_id").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
		$("#id_off_schedule_id_modify").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
		$("#popup_btn_complete").hide()
		$("#popup_sign_img").css("display","none")
		schedule_on_off = 0;
	})

	//스케쥴 클릭시 팝업 Start
	$(document).on('click','div.groupTime',function(e){ //일정을 클릭했을때 팝업 표시
		e.stopPropagation()
		toggleGroupParticipantsList('off')
		$('#subpopup_addByList_plan').hide()
		$('#popup_btn_viewGroupParticipants').show().attr({'data-membernum': $(this).attr('data-membernum'), 
															'data-groupid': $(this).attr('data-groupid'),
															'group-schedule-id':$(this).attr('group-schedule-id'),
															})
		$('.pt_memo_guide_popup').css('display','block')
		deleteTypeSelect = ''
		addTypeSelect ='ptadd'
		var info = $(this).attr('group-time').split('_')
		var yy=info[0]
		var mm=info[1]
		var dd=info[2]
		var time = info[3]
		if(time == 24){
			var time = 0
		}
		var minute = info[4]
		var classdur = info[5]
		var classdurTime = parseInt(info[5]) + "시간 "
		if(classdur.indexOf('.')){
			var classdurMin = "30분"
		}else{
			var classdurMin = ""
		}
		var dur = '('+classdurTime + classdurMin+')'
		var dayobj = new Date(yy,mm-1,dd)
		var dayraw = dayobj.getDay();
		var dayarryKR = ['일','월','화','수','목','금','토']
		var dayarryJP = ['日','月','火','水','木','金','土']
		var dayarryEN = ['Sun','Mon','Tue','Wed','Ths','Fri','Sat']
		switch(Options.language){
			case "KOR" :
			var member = " 회원님의 ";
			var yourplan = " 일정";
			var day = dayarryKR[dayraw];
			var text = '그룹 레슨 일정'
			break;
			case "JPN" :
			var member = "様の ";
			var yourplan = " 日程";
			var day = dayarryJP[dayraw];
			var text = 'PT 日程'
			break;
			case "ENG" :
			var member = "'s schedule at ";
			var yourplan = "";
			var day = dayarryEN[dayraw];
			var text = 'PT Plan'
			break; 
		}
		$('#popup_planinfo_title').text(text)
		$('#popup_btn_complete').css({'color':'#282828','background':'#ffffff'}).val('')
		$('#popup_info3_memo').attr('readonly',true).css({'border':'0'});
		$('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'})
        $('#canvas').hide().css({'border-color':'#282828'})
		$('#canvasWrap').css({'height':'0px'})
		$('#canvasWrap span').hide();

		$('#page-addplan-pc').hide()
		$("#cal_popup_planinfo").fadeIn('fast');
		shade_index(100)
		closeAlarm('pc')

		$('#popup_info3_memo,#popup_info3_memo_modify').show()
		var schedule_finish_check = $(this).attr('data-schedule-check')
		
		
		var infoText = yy+'. '+mm+'. '+dd+' '+'('+day+')'
		var infoText2 = '<span class="memberNameForInfoView" data-name="'+info[6]+'" '+'data-schedule-check="'+schedule_finish_check+'">'+info[6]+'</span>'+member+time+':'+minute+yourplan
		var infoText3 = $(this).attr('data-memo')
		if($(this).attr('data-memo') == undefined){
			var infoText3 = ""
		}
		$('#popup_info').text(infoText);
		//$('#popup_info2').html(infoText2);
		$('#popup_info2').text('[그룹]'+info[6]+' '+time+':'+minute+yourplan)
		$('#popup_info3_memo').text(infoText3).val(infoText3)
		$('#cal_popup_planinfo').attr({'schedule_id': $(this).attr('group-schedule-id'), 'data-grouptype':'group'})
		$("#id_schedule_id").val($(this).attr('group-schedule-id')); //shcedule 정보 저장
		$("#id_schedule_id_modify").val($(this).attr('group-schedule-id')); //shcedule 정보 저장
		$("#id_schedule_id_finish").val($(this).attr('group-schedule-id')); // shcedule 정보 저장
		$("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_repeat_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_member_name_delete").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_member_name_finish").val($(this).attr('data-memberName')); //회원 이름 저장
		$("#id_repeat_member_id").val($(this).attr('data-dbid')); //member id 정보 저장
		$("#id_repeat_lecture_id").val($(this).attr('data-lectureId')); //lecture id 정보 저장
		$("#id_lecture_id_modify").val($(this).attr('data-lectureId')); //lecture id 정보 저장
		$("#id_lecture_id_finish").val($(this).attr('data-lectureId')); //lecture id 정보 저장
		if(schedule_finish_check=="0"){
			$("#popup_btn_complete").show()
			$("#popup_text1").css("display","block")
			$("#popup_sign_img").css("display","none")
        }
        else{
			$("#popup_btn_complete").hide()
			$("#popup_text1").css("display","none")
			$("#popup_sign_img").css("display","block")
			$("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('off-schedule-id')+'.png');
		}
		schedule_on_off = 1;
		
	})

	mini_popup_event()
	 //일정을 클릭해서 나오는 미니 팝업의 이벤트 모음
	function mini_popup_event(){
		//일정 완료 기능 추가 - hk.kim 180106
		var ajax_block_during_complete_weekcal = true
		$("#popup_btn_complete").click(function(){  //일정 완료 버튼 클릭
			
				if($(this).val()!="filled"){
					$('#canvas').show()
					$('#canvasWrap').animate({'height':'200px'},200)
					$('#canvasWrap span').show();
					//$('#cal_popup_planinfo').animate({'top':'15%'},200)
				}else if($(this).val()=="filled"){
					var $pt_finish_form = $('#pt-finish-form');
					var drawCanvas = document.getElementById('canvas');
					var send_data = $pt_finish_form.serializeArray();
					send_data.push({"name":"upload_file", "value":drawCanvas.toDataURL('image/png')})
					if(ajax_block_during_complete_weekcal == true){
						ajax_block_during_complete_weekcal = false
						if(schedule_on_off==1){
							//PT 일정 완료 처리시
							$.ajax({
			                    url:'/schedule/finish_schedule/',
			                    type:'POST',
			                    data:send_data,

			                    beforeSend:function(){
			                    	beforeSend();
			                    },
			                    //통신성공시 처리
			                    success:function(data){
			                    	var jsondata = JSON.parse(data)
			                    	if(jsondata.messageArray.length>0){
					                  	$('#errorMessageBar').show()
					                  	$('#errorMessageText').text(jsondata.messageArray)
					                }else{

										if(jsondata.push_info != ''){
											for (var i=0; i<jsondata.pushArray.length; i++){
                                        		send_push(jsondata.push_server_id, jsondata.pushArray[i], jsondata.push_title[0], jsondata.push_info[0], jsondata.badgeCounterArray[i]);
											}
										}
					                	send_memo()
					                	signImageSend(send_data);
					                    close_info_popup('cal_popup_planinfo')
					                    completeSend();
					                    set_schedule_time(jsondata);
					                }
			                      },

			                    //보내기후 팝업창 닫기
			                    complete:function(){
			                    	ajax_block_during_complete_weekcal = true
			             			$('#popup_btn_complete').css({'color':'#282828','background':'#ffffff'}).val('')
			                    	$('#canvas').hide().css({'border-color':'#282828'})
			                    	$('#canvasWrap span').hide();
									$('#canvasWrap').css({'height':'0px'})
									//$('body').css('overflow-y','overlay');
									shade_index(-100)
			                      },

			                    //통신 실패시 처리
			                    error:function(){
			                    },
			                 })
						}
					}
				}
			
		})

		//일정 삭제 기능 추가 - hk.kim 171007
		$("#popup_btn_delete").click(function(){  //일정 삭제 버튼 클릭
			if($(this).parent('#cal_popup_planinfo').attr('data-grouptype') == "group"){
				deleteTypeSelect = "groupptdelete"
			}else{
				deleteTypeSelect = "ptoffdelete"
			}
			$('#cal_popup_planinfo').hide();
			$('#cal_popup_plandelete').fadeIn('fast');
		})

		//미니 팝업 메모수정
		$('#popup_info3_memo_modify').click(function(){
			if($(this).attr('data-type') == "view"){
				//$('html,body').css({'position':'fixed'})
				$('#popup_info3_memo').attr({'readonly':false}).css({'border':'1px solid #fe4e65'});
				$(this).attr({'src':'/static/user/res/btn-pt-complete.png','data-type':'modify'})
			}else if($(this).attr('data-type') == "modify"){
				//$('html,body').css({'position':'relative'})
				$('#popup_info3_memo').attr({'readonly':true}).css({'border':'0'});
				$(this).attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'})
				send_memo()
			}
		})

		function send_memo(){
			var schedule_id = $('#cal_popup_planinfo').attr('schedule_id');
			var memo = $('#popup_info3_memo').val()
			$.ajax({
	            url:'/schedule/update_memo_schedule/',
	            type:'POST',
	            data:{"schedule_id":schedule_id,"add_memo":memo,"next_page":'/trainer/cal_week'},

	            beforeSend:function(){
	            	//beforeSend();
	            },

	            //통신성공시 처리
	            success:function(data){
	            	
	            },

	            //보내기후 팝업창 닫기
	            complete:function(){
	            	ajaxClassTime()
	            },

	            //통신 실패시 처리
	            error:function(){
	    
	            },
	        })
		}

		//삭제 확인 팝업에서 Yes 눌렀을떄 동작 (PT 반복일정삭제, OFF 반복일정삭제, PT일정 삭제, OFF일정 삭제)
		$('#cal_popup_plandelete').click(function(){console.log(deleteTypeSelect)})
		var ajax_block_during_delete_weekcal = true
		$('#popup_delete_btn_yes').click(function(){
			if(ajax_block_during_delete_weekcal == true){
				ajax_block_during_delete_weekcal = false;
				if(deleteTypeSelect == "repeatoffdelete" || deleteTypeSelect == "repeatptdelete"){ //일정등록창창의 반복일정 삭제
					var repeat_schedule_id = $('#id_repeat_schedule_id_confirm').val();
		            send_repeat_delete_personal(repeat_schedule_id, 'callback', function(jsondata){
				        close_info_popup('cal_popup_plandelete')
			            get_repeat_info($('#cal_popup_repeatconfirm').attr('data-dbid'))
			            set_schedule_time(jsondata)
			            if($('body').width()>=600){
	                		$('#calendar').css('position','relative')	
	                	}
	                	ajax_block_during_delete_weekcal = true
	                })

				}else if(deleteTypeSelect == "repeatgroupptdelete"){
		            var repeat_schedule_id = $('#id_repeat_schedule_id_confirm').val();
		            send_repeat_delete_group(repeat_schedule_id, 'callback', function(){
	            		close_info_popup('cal_popup_plandelete')
	                  	get_repeat_info($('#cal_popup_repeatconfirm').attr('data-groupid'))
	                  	set_schedule_time(jsondata)
	                  	ajax_block_during_delete_weekcal = true;
	                	if($('body').width()>=600){
	                		$('#calendar').css('position','relative')	
	                	}
	                	ajax_block_during_delete_weekcal = true
		            })

				}else if(deleteTypeSelect == "ptoffdelete"){
					if(schedule_on_off==1){
						//PT 일정 삭제시
						send_plan_delete('pt')
					}else{
						//OFF 일정 삭제
						send_plan_delete('off')
					}

				}else if(deleteTypeSelect == "groupptdelete"){
					send_plan_delete('group')
				}
			}
		})
	}

	

	

    function send_push(push_server_id, intance_id, title, message, badge_counter){

			$.ajax({
			  url: 'https://fcm.googleapis.com/fcm/send',
			  type : 'POST',
			  contentType : 'application/json',
			  dataType: 'json',
			   headers : {
					Authorization : 'key=' + push_server_id
				},
				data: JSON.stringify({
					"to": intance_id,
					"notification": {
						"title":title,
						"body":message,
						"badge":badge_counter,
    					"sound": "default"
					}
				}),

			  beforeSend:function(){
				console.log('test_ajax')

			  },

			  success:function(response){
				  console.log(response);
			  },

			  complete:function(){

			  },

			  error:function(){
			  	//alert("Server Error: \nSorry for inconvenience. \nPTERS server is unstable now.")
				console.log(push_server_id)
				console.log(intance_id)
				console.log('server error')
			  }
			})
		}
	
	function signImageSend(send_data){
		$.ajax({
            url:'/schedule/upload_sign_image/',
            type:'POST',
            data:send_data,

            beforeSend:function(){
            	//beforeSend();
            },

            //통신성공시 처리
            success:function(data){
            	var jsondata = JSON.parse(data)
            	if(jsondata.messageArray.length>0){
                  	$('#errorMessageBar').show()
                  	$('#errorMessageText').text(jsondata.messageArray)
                }else{
                	console.log('sign_image_save_success')
                }
              },

            //보내기후 팝업창 닫기
            complete:function(){

              },

            //통신 실패시 처리
            error:function(){
            	alert("Server Error: \nSorry for inconvenience. \nPTERS server is unstable now.")
            	console.log('sign_image_save_fail')
            },
         })
	}

	//PC버전 새로고침 버튼
	$('.ymdText-pc-add-refresh').click(function(){ 
		ajaxClassTime()
	})
	//PC버전 새로고침 버튼



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
	ajaxClassTime(currentYear+'-'+(currentMonth+1)+'-'+currentDate)

	//calTable_Set(1,currentYear,currentPageMonth,currentDate,-14); // 이번주-2
	calTable_Set(1,currentYear,currentPageMonth,currentDate,-7); // 이번주-1
	calTable_Set(2,currentYear,currentPageMonth,currentDate,0); // 이번주
	calTable_Set(3,currentYear,currentPageMonth,currentDate,7); // 이번주+1
	//calTable_Set(5,currentYear,currentPageMonth,currentDate,14); // 이번주+2


	
	
	weekNum_Set_fixed()
	dateText();
	krHoliday()
	reserveAvailable()
	toDay();
	addcurrentTimeIndicator_blackbox()
	todayFinderArrow();	

	draw_time_graph(30,'')
	draw_time_graph(30,'mini')
	
	
	

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
			krHoliday()
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
			krHoliday()
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
			ajaxClassTime()
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
			//var dataforappend = $('.swiper-slide-prev').find('.td00').attr('id').split('_')
			var currentSlideNum = Number($('.swiper-slide-active').attr('id').replace(/slide/gi,''))
			var dataforappend = $('#slide'+(currentSlideNum)).find('.td00').attr('id').split('_')

			var monthforappend = Number(dataforappend[1])-1
			var monthdata = monthforappend
		}
		if(Options.language == "KOR"){
	    	var text1 = "등록된 일정이 없습니다."
	    }else if(Options.language == "JPN"){
	    	var text1 = "登録されている日程がありません"
	    }else if(Options.language == "ENG"){
	    	var text1 = "No Schedule added"
	    }
		var fakeElementForBlankPage = '<div class="fake_for_blankpage"><span>'+text1+'</span></div>'
		//for(var i=0; i<=23; i++){
		for(var i=Options.workStartTime; i<Options.workEndTime; i++){
			var textToAppend = '<div id="'+Year+'_'+Month+'_'+currentDate+'_'+Week+'_'+i+'H'+'_00M'+'" class="time-row">'
			var textToAppend_ = '<div id="'+Year+'_'+Month+'_'+currentDate+'_'+Week+'_'+i+'H'+'_30M'+'" class="time-row time-row30">'
			var divToAppend = $(textToAppend)
			var divToAppend_ = $(textToAppend_)

			switch(currentDay_){
				case 0 :
				var td1 = []
				var td2 = []
				for(z=0; z<=6; z++){
					if(currentDates+z>lastDay[monthdata] && Month+1>12){ //해가 넘어갈때
						td1[z]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
						td2[z]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'30'+' class="td30" data-week='+z+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=0 && Month==1){
						td1[z]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
						td2[z]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30" data-week='+z+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z>lastDay[monthdata]){
						td1[z]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
						td2[z]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[monthdata])+'_'+i+'_'+'30'+' class="td30" data-week='+z+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=lastDay[monthdata] && currentDates+z>0){
						td1[z]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
						td2[z]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30" data-week='+z+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=0){
						if(Month-1<1){
							td1[z]='<div'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
							td2[z]='<div'+' id='+(Year-1)+'_'+(Month-1+12)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30" data-week='+z+'>'+'<div></div>'+'</div>';
						}else{
							td1[z]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[monthdata-1])+'_'+i+'_'+'00'+' class="td00" data-week='+z+'>'+'<div></div>'+'</div>';
							td2[z]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[monthdata-1])+'_'+i+'_'+'30'+' class="td30" data-week='+z+'>'+'<div></div>'+'</div>';
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
						td1[z+1]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
						td2[z+1]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+1)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+1]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
						td2[z+1]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+1)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+1]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
						td2[z+1]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+1)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+1]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
						td2[z+1]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=0){
						td1[z+1]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
						td2[z+1]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+1)+'>'+'<div></div>'+'</div>';
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
						td1[z+2]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
						td2[z+2]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+2)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+2]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
						td2[z+2]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+2)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+2]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
						td2[z+2]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+2)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+2]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
						td2[z+2]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=0){
						td1[z+2]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
						td2[z+2]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+2)+'>'+'<div></div>'+'</div>';
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
						td1[z+3]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
						td2[z+3]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+3)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+3]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
						td2[z+3]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+3)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+3]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
						td2[z+3]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+3)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+3]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
						td2[z+3]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=0){
						td1[z+3]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
						td2[z+3]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+3)+'>'+'<div></div>'+'</div>';
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
						td2[z+4]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30">'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+4]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
						td2[z+4]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+4)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+4]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
						td2[z+4]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+4)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+4]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
						td2[z+4]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=0){
						td1[z+4]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
						td2[z+4]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+4)+'>'+'<div></div>'+'</div>';
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
						td1[z+5]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
						td2[z+5]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+5)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+5]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
						td2[z+5]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+5)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+5]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
						td2[z+5]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+5)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+5]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
						td2[z+5]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=0){
						td1[z+5]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
						td2[z+5]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+5)+'>'+'<div></div>'+'</div>';
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
						td1[z+6]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
						td2[z+6]='<div'+' id='+(Year+1)+'_'+(Month-11)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+6)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=0 && Month==1){
						td1[z+6]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
						td2[z+6]='<div'+' id='+(Year-1)+'_'+(11+Month)+'_'+(currentDates+z+lastDay[11])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+6)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z>lastDay[currentMonth]){
						td1[z+6]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
						td2[z+6]='<div'+' id='+Year+'_'+(Month+1)+'_'+(currentDates+z-lastDay[currentMonth])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+6)+'>'+'<div></div>'+'</div>';	
					}else if(currentDates+z<=lastDay[currentMonth] && currentDates+z>0){
						td1[z+6]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'00'+' class="td00" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
						td2[z+6]='<div'+' id='+Year+'_'+Month+'_'+(currentDates+z)+'_'+i+'_'+'30'+' class="td30" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
					}else if(currentDates+z<=0){
						td1[z+6]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'00'+' class="td00" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
						td2[z+6]='<div'+' id='+Year+'_'+(Month-1)+'_'+(currentDates+z+lastDay[currentMonth-1])+'_'+i+'_'+'30'+' class="td30" data-week='+(z+6)+'>'+'<div></div>'+'</div>';
					}
				}
				var td1_1 = td1.join('')
				var td2_1 = td2.join('')
				break;
			}
			//var td = td1_1+td1_2+td1_3+td1_4+td1_5+td1_6+td1_7+'</tr><tr>'+td2_1+td2_2+td2_3+td2_4+td2_5+td2_6+td2_7+'</tr></tbody></table></div>'
			//var td= td1_1+td2_1+'</div>'
			//var td= td1_1 + '</div>'
			var td00 = td1_1 + '</div>'
			var td30 = td2_1 + '</div>'
			if(i<12){
					toAppend1 = '<div class="slidegap"><span class="_morningday">오전 </span>'+i+'<div></div></div>'+td00
					toAppend2 = '<div class="slidegap"><span class="_morningday">오전 </span>'+i+'<div></div></div>'+td30
			}else{
					toAppend1 = '<div class="slidegap"><span class="_morningday">오후 </span>'+i+'<div></div></div>'+td00
					toAppend2 = '<div class="slidegap"><span class="_morningday">오후 </span>'+i+'<div></div></div>'+td30
			};

			
			if(Options.classDur == 30){
			}else if(Options.classDur == 60){
				$('.time-row').css('border-bottom','0')
			}
			
			var sum = textToAppend+toAppend1+textToAppend_+toAppend2
			slideIndex.append(sum);

		};
		slideIndex.append(fakeElementForBlankPage);
		weekNum_Set(Index)
		time_index_set()
	}; //calTable_Set

	function time_index_set(){
		var start = Options.workStartTime;
		var end = Options.workEndTime;
		var timelist = []

		if(Options.language=="JPN"){
	        var morning = '<span class="JPtext">午前</span>'
	        var afternoon = '<span class="JPtext">午後</span>'
	    }else if(Options.language=="KOR"){
	        var morning = '<span class="KRtext">오전</span>'
	        var afternoon = '<span class="KRtext">오후</span>'
	    }else if(Options.language=="ENG"){
	       	var morning = '<span class="ENtext">AM</span>'
	       	var afternoon = '<span class="ENtext">PM</span>'
	    }	

		for(var i=start; i<=end; i++){
			if(i<12 && i == start){
				timelist.push('<div class="hour" id="hour'+i+'"><span class="morningtext">'+morning+'</span><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>')
			}else if(i==12){
				timelist.push('<div class="hour" id="hour'+i+'"><span class="morningtext">'+afternoon+'</span><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>')
			}else{
				timelist.push('<div class="hour" id="hour'+i+'"><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>')
			}
		}
		$('div.timeindex').html(timelist.join(''))
	}


	function dateText(){
		var yymm = {}
		var yymmarry = []
		for(var i=2; i<=8; i++){
			var dataID = $('.swiper-slide-active div:nth-child(1)').find('.td00:nth-child('+i+')').attr('id').split('_');
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

	function krHoliday(){
		$('.holiday').removeClass('holiday')
		$('.holidayName').text('')
		for(var i=0; i<krHolidayList.length; i++){
			var date_data = date_format_yyyy_m_d_to_yyyymmdd(krHolidayList[i])
			$("#week .weekNum[data-date="+date_data+"]").addClass('holiday');
			$("#week .weekNum[data-date="+date_data+"]").find('.holidayName').text(krHolidayNameList[i])
		};
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
		var swiperPage = $('#slide'+Index+' div:nth-child(1)') 

		for(var i=2; i<=8; i++){		
			var dateID = swiperPage.find('.td00:nth-child('+i+')').attr('id').split('_');
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
			if(Options.language == "KOR"){
	    	var text1 = '일'
		    }else if(Options.language == "JPN"){
		    	var text1 = '日'
		    }else if(Options.language == "ENG"){
		    	var text1 = ''
		    }
			WeekArry[i].html(WeekArryTarget[i]+text1)
			WeekNum[i].attr('data-date', currentPageDateInfo[i])
		}
	}

	function draw_time_graph(option, type){  //type = '' and mini
		if(type == 'mini'){
			var targetHTML =  $('#timeGraph.ptaddbox_mini table')
			var types = "_mini"
		}else{
			var targetHTML =  $('#timeGraph._NORMAL_ADD_timegraph table')
			var types = ''
		}

		var tr1 = []
		var tr2 = []

		if(option == "30"){
			for(var i=Options.workStartTime; i<Options.workEndTime; i++){
				tr1[i] = '<td colspan="2">'+(i)+'</td>'
				tr2[i] = '<td id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00"></td><td id="'+(i)+'g_30'+types+'" class="tdgraph_'+option+' tdgraph30"></td>'
			}
		}else if(option == "60"){
			for(var i=Options.workStartTime; i<Options.workEndTime; i++){
				tr1[i] = '<td>'+(i)+'</td>'
				tr2[i] = '<td id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00"></td>'
			}
		}
		var tbody = '<tbody><tr>'+tr1.join('')+'</tr><tr>'+tr2.join('')+'</tbody>'
		targetHTML.html(tbody)
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
			$("#"+yy+'_'+mm+'_'+dd+'_'+i+'_00' + ",#"+yy+'_'+mm+'_'+dd+'_'+i+'_30').addClass('todaywide')
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
			if(yymmdd<=scan && scan<=Options.availDate+Number(yymmdd)){
				$('#weekNum_'+i).addClass('reserveavailable')
			}else if(scan.substr(0,4)==yy+1 && scan.substr(4,2) == '01' &&scan.substr(6,2)<=Number(dd)+Options.availDate-lastDay[currentMonth]){
				$('#weekNum_'+i).addClass('reserveavailable')
			}
			else if(scan.substr(4,2)== Number(mm)+1 && scan.substr(6,2)<=Number(dd)+Options.availDate-lastDay[currentMonth]){
				$('#weekNum_'+i).addClass('reserveavailable')	
			}else{
				$('#weekNum_'+i).removeClass('reserveavailable')
				
			}
		}
	}


	

	$(document).on('click','.fake_for_blankpage',function(){
		$(this).fadeOut('fast')
	})

	function addcurrentTimeIndicator_blackbox(){ //현재 시간에 밑줄 긋기
		var realTime = new Date()
		var realTimeHour = realTime.getHours();
		var realTimeMin = realTime.getMinutes();
		if($('.today').length && realTimeHour < Options.workEndTime && realTimeHour >= Options.workStartTime){
			$('.currentTimeBlackBox').removeClass('currentTimeBlackBox');
			$('#hour'+realTimeHour).addClass('currentTimeBlackBox');
			var indicator_Location = $('#hour'+realTimeHour).position().top
			var minute_adjust = 45*(realTimeMin/60)
			$('#timeIndicatorBar').css('top',indicator_Location+minute_adjust)
			if(realTimeMin<10){
				var realTimeMin = '0' + realTimeMin
			}
			if(realTimeHour<10){
				var realTimeHour = '0' + realTimeHour
			}
			$('#timeIndicatorBar').fadeIn('fast').html('<span class="timeindicator_rightfloat">'+realTimeHour+':'+realTimeMin+'</span>')
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

    function startTimeSet(){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21];
        startTimeArraySet(); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
        var offOkLen = offAddOkArray.length
        var startTimeList = $('#starttimes,#starttimes_off');
        var timeArray = [];
        if(Options.language == "KOR"){
    		var text1 = '오전 '
    		var text2 = '오후 '
    		var text3 = '시'
	    }else if(Options.language == "JPN"){
	    	var text1 = '午前 '
    		var text2 = '午後 '
    		var text3 = '時'
	    }else if(Options.language == "ENG"){
	    	var text1 = 'AM '
    		var text2 = 'PM '
    		var text3 = ':00'
	    }
        for(var i=0; i<offOkLen; i++){
          var offHour = offAddOkArray[i];
          if(offHour<12){
            var offText = text1
            var offHours = offHour;
          }else if(offHour==24){
            var offText = text1
            var offHours = offHour-12
          }else if(offHour==12){
            var offText = text2
            var offHours = offHour
          }else{
            var offHours = offHour-12
            var offText = text2
          }
          if(offHour.length<2){
            timeArray[i] ='<li><a data-trainingtime="'+'0'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+text3+'</a></li>'
          }else{
            timeArray[i] ='<li><a data-trainingtime="'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+text3+'</a></li>'
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
        if(Options.language == "KOR"){
    		var text1 = '오전'
    		var text2 = '오후'
    		var text3 = '시'
    		var text4 = '시간'
	    }else if(Options.language == "JPN"){
	    	var text1 = '午前'
    		var text2 = '午後'
    		var text3 = '時'
    		var text4 = '時間'
	    }else if(Options.language == "ENG"){
	    	var text1 = 'AM'
    		var text2 = 'PM'
    		var text3 = ':00'
    		var text4 = 'h'
	    }
        if(substr>1){
          var fininfo = Number(selectedTime)+1
          if(fininfo>12){
             if(fininfo==25){
               var fininfo = text1+' 1'
             }else if(fininfo==24){
               var fininfo = text1+ '12'
             }else{
               var fininfo = text2+(fininfo-12)  
             }
           }else if(fininfo==12){
             var fininfo = text2+fininfo  
           }else{
             var fininfo = text1+fininfo
           }
          durTimeList.html('<li><a data-dur="1" class="pointerList">1'+text4+' (~'+fininfo+text3+')'+'</a></li>')
        }else{
          durTimeList.html('')
          for(var j=index; j<=len; j++){
            
            var fininfo = Number(selectedTime)+(j-index+1)
            if(fininfo>12){
              if(fininfo==25){
                var fininfo = text1+' 1'
              }else if(fininfo==24){
                var fininfo = text1+' 12'
              }else{
                var fininfo = text2+(fininfo-12)  
              }
            }else if(fininfo==12){
              var fininfo = text2+fininfo  
            }else{
              var fininfo = text1+fininfo
            }

            if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+text4+'  (~'+fininfo+text3+')'+'</a></li>') 
            }
            else if(offAddOkArray[j-1]== null && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+text4+'  (~'+fininfo+text3+')'+'</a></li>')
            }
            else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+text4+'  (~'+fininfo+text3+')'+'</a></li>')
            }
            else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]>=2){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+text4+'  (~'+fininfo+text3+')'+'</a></li>')
              break;
            }
            else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+text4+'  (~'+fininfo+text3+')'+'</a></li>')
              //break;
            }
            else if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+text4+'  (~'+fininfo+text3+')'+'</a></li>')
            }
            else if(offAddOkArray[j-1]==null && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+text4+'  (~'+fininfo+text3+')'+'</a></li>')
            }
          }
        }
         durTimeList.append('<li><a data-dur="dummy" class="pointerList">'+'<img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;">'+'</a></li>')
    }

});//document(ready)

//작은달력 설정
$.datepicker.setDefaults({
  dateFormat: 'yy-mm-dd',
  prevText: '이전 달',
  nextText: '다음 달',
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
  showMonthAfterYear: true,
  yearSuffix: '년',
});

/*
var toggleGroupParticipants = 'off'
function toggleGroupParticipantsList(onoff){
	switch(onoff){
		case 'on':
			toggleGroupParticipants = 'on'
			$('#groupParticipants').animate({'height':'200px'},200)
			$('#popup_btn_viewGroupParticipants img').css('transform','rotate(180deg)')
		break;
		case 'off':
			toggleGroupParticipants = 'off'
			$('#groupParticipants').animate({'height':0},200)
			$('#popup_btn_viewGroupParticipants img').css('transform','rotate(0deg)')
		break;
	}
}
*/



function fake_show(){
	//var faketarget = selector.parent('div').siblings('.fake_for_blankpage')
	if($('.swiper-slide-active').find('.classTime').length == 1 && $('.swiper-slide-active').find('.offTime').length == 0){
		$('.swiper-slide-active').find('.fake_for_blankpage').css('display','block')
	}else if($('.swiper-slide-active').find('.classTime').length == 0 && $('.swiper-slide-active').find('.offTime').length == 1){
		$('.swiper-slide-active').find('.fake_for_blankpage').css('display','block')
	}
}



function ajaxClassTime(reference){
		if(reference){

		}else{
			var $weekNum4 = $('#weekNum_4').attr('data-date')
			var today_form = $weekNum4.substr(0,4)+'-'+$weekNum4.substr(4,2)+'-'+$weekNum4.substr(6,2)
		}
		
		$.ajax({
		  url: '/trainer/cal_day_ajax/',
		  type : 'POST',
		  data : {"date":today_form, "day":14},
		  dataType : 'html',

		  beforeSend:function(){
			beforeSend();
			$('.ymdText-pc-add-off, .ymdText-pc-add-pt').addClass('disabled_button').attr('onclick','')
		  },

		  success:function(data){
			var jsondata = JSON.parse(data);
			if(jsondata.messageArray.length>0){
				$('#errorMessageBar').show()
				$('#errorMessageText').text(jsondata.messageArray)
			}else{
				set_schedule_time(jsondata)
			}

		  },

		  complete:function(){
			completeSend();
			$('.ymdText-pc-add div').removeClass('disabled_button')
			$('.ymdText-pc-add-pt').attr('onclick','float_btn_addplan(1)')
			$('.ymdText-pc-add-off').attr('onclick','float_btn_addplan(2)')
		  },

		  error:function(){
			console.log('server error')
		  }
		})
}

function set_schedule_time(jsondata){
	$('.classTime, .offTime, .groupTime').parent().html('<div></div>')
	$('._on').removeClass('_on')
	initialJSON = jsondata;
	scheduleTime('class', jsondata)
	scheduleTime('off', jsondata)
	scheduleTime('group', jsondata);
	fake_show()
}



function clear_badge_counter(){
    $.ajax({
            url:'/login/clear_badge_counter/',
            type:'POST',
		    //dataType : 'html',

            beforeSend:function(){
                //alert('before clear_badge_counter afsavf')
                console.log('before')
            },

            //통신성공시 처리
            success:function(){
                //alert('test')
                console.log('sucess')

              },

             //보내기후 팝업창 닫기
            complete:function(){

              },

            //통신 실패시 처리
            error:function(){
                console.log('error')
                //alert('error clear_badge_counter')
                //console.log('error:clear_badge_counter')
            },
        })
}
