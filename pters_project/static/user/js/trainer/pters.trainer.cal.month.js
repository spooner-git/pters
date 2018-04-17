/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/

$(document).ready(function(){

	var schedule_on_off = 0;


	setInterval(function(){ajaxCheckSchedule()}, 60000)// 자동 ajax 새로고침(일정가져오기)


	function ajaxCheckSchedule(){

            $.ajax({
              url: '/schedule/check_schedule_update/',
			  dataType : 'html',

              beforeSend:function(){
              	//AjaxBeforeSend();
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
              	//AjaxCompleteSend();
              },

              error:function(){
                console.log('server error')
              }
            })
    }

    //회원이름을 클릭했을때 회원정보 팝업을 보여주며 정보를 채워준다.
    $(document).on('click','.memberNameForInfoView',function(){
    	var clickedName = $(this).attr('data-name')
    	var scheduleComplete = $(this).attr('data-schedule-check')
    	$.ajax({
              url: '/trainer/member_manage_ajax/',
			  dataType : 'html',

              beforeSend:function(){
              	//AjaxBeforeSend();
              },

              success:function(data){
              	ajax_received_json_data_member_manage(data)
              	var jsondata = JSON.parse(data)
              	DB=[]
              	DBe=[]
              	DataFormattingDict('name');
		        if(jsondata.nameArray.indexOf(clickedName)!=-1){
		    		var Data = DB
		    	}else if(jsondata.finishnameArray.indexOf(clickedName)!=-1){
		    		var Data = DBe
		    	}
		        var userID = Data[clickedName].id
		        DataFormattingDict('ID');
		        if($('body').width()<600){
		            open_member_info_popup_mobile(userID,jsondata)
		            get_indiv_repeat_info(userID,jsondata)
		            set_member_lecture_list(jsondata)
		            set_member_history_list(jsondata)
		        }else if($('body').width()>=600){
		            open_member_info_popup_pc(userID,jsondata)
		            get_indiv_repeat_info(userID,jsondata)
		            set_member_lecture_list(jsondata)
		            set_member_history_list(jsondata)
		            $('#info_shift_base, #info_shift_lecture').show()
		            $('#info_shift_schedule, #info_shift_history').hide()
		            $('#select_info_shift_lecture').addClass('button_active')
		            $('#select_info_shift_schedule, #select_info_shift_history').removeClass('button_active')
		        }
			  },

              complete:function(){
              	//AjaxCompleteSend();
              },

              error:function(){
                console.log('server error')
              }
        })	
    });


	$('#upbutton-x').click(function(){
		$('#calendar').css('height','90%')
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

        $('#page-addplan .dropdown_selected').removeClass('dropdown_selected')
        $('.dateButton').removeClass('dateButton_selected')
        $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate',null)
        $('#repeattypeSelected button, #repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>선택</span>");
        //$('#page-addplan form input').val('')
        selectedDayGroup = []

        $('._NORMAL_ADD_wrap').css('display','block')
        $('._REPEAT_ADD_wrap').css('display','none')
        $('#timeGraph').css('display','none')
  	})


	
	$(document).on('click','#calendar td',function(){
		closeAlarm('pc')
		if(!$(this).hasClass('nextDates') && !$(this).hasClass('prevDates')){
			deleteTypeSelect = ''
			$('#cal_popup_plancheck').fadeIn('fast');
			shade_index(100)
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

	mini_popup_event()
	//일정을 클릭해서 나오는 미니 팝업의 이벤트 모음
	function mini_popup_event(){
		//날짜를 클릭해서 나오는 일정들을 클릭했을때
		$(document).on('click','.plan_raw',function(){
			shade_index(150)
			$('#popup_planinfo_title').text('PT 일정')
			if($('body').width()>600){
				$('#popup_btn_complete').css({'color':'#ffffff','background':'#282828'}).val('')
			}else{
				$('#popup_btn_complete').css({'color':'#282828','background':'#ffffff'}).val('')
			}
			
			var selectedDate = $('.popup_ymdText').text()
			var selectedTime = $(this).find('.planchecktime').text().split(':')[0]
			var selectedPerson = '<span class="memberNameForInfoView" data-name="'+$(this).attr('data-membername')+'">'+$(this).find('.plancheckname').text()+'</span>'
			var selectedMemo = $(this).attr('data-memo')
			if($(this).attr('data-memo') == undefined){
				var selectedMemo = ""
			}
			$("#cal_popup_planinfo").fadeIn('fast').attr('schedule_id',$(this).attr('schedule-id'))
			$('#popup_info3_memo').attr('readonly',true).css({'border':'0'});
			$('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'})
			$('#popup_info').text(selectedDate);
			$('#popup_info2').html(selectedPerson+'의 '+ selectedTime + '시 일정');
			$('#popup_info3_memo').text(selectedMemo).val(selectedMemo)

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
				$("#popup_btn_complete").show()
				$("#popup_text1").css("display","block")
				$("#popup_sign_img").css("display","none")
			}
			else{
				$("#popup_btn_complete").hide()
				$("#popup_text1").css("display","none")
				$("#popup_sign_img").css("display","block")
				$("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('schedule-id')+'.png');
			}
			schedule_on_off = 1;
		})

		//plan_raw 클릭해서 나오는 개별일정 [일정완료][일정삭제] 팝업의 X버튼
		$("#btn_close").click(function(){  
			if($('#cal_popup_planinfo').css('display')=='block'){
				$("#cal_popup_planinfo").css({'display':'none'})
			}
		})

		//일정 삭제 버튼 클릭
		$("#popup_btn_delete").click(function(){
			shade_index(200)
			$('#cal_popup_planinfo').hide()
			$('#cal_popup_plandelete').fadeIn('fast')
		})

		//일정삭제 확인 팝업 아니오 버튼 눌렀을때 팝업 닫기
		$('#popup_delete_btn_no').click(function(){ 
			if($('#cal_popup_plandelete').css('display')=='block'){
				$("#cal_popup_plandelete").css({'display':'none'})
			}
		})

		function closeAddPlanPopup(){
	  	  	$('#page-addplan').fadeOut('fast','swing')
	      	$('._NORMAL_ADD_wrap').css('display','block')
	      	$('._REPEAT_ADD_wrap').css('display','none')
	      	$('#timeGraph').css('display','none')
	  	}

		//일정삭제 확인 팝업 예 버튼
		$('#popup_delete_btn_yes').click(function(){
			console.log(deleteTypeSelect)
			if(deleteTypeSelect == "repeatoffdelete" || deleteTypeSelect == "repeatptdelete"){ //일정등록창창의 반복일정 삭제
				$.ajax({
	                url:'/schedule/delete_repeat_schedule/',
	                type:'POST',
	                data:{"repeat_schedule_id" : $('#id_repeat_schedule_id_confirm').val(), "next_page" : '/trainer/cal_day_ajax/'},
	                dataType:'html',

	                beforeSend:function(){
	                 	AjaxBeforeSend();
	                },

	                //통신성공시 처리
	                success:function(data){
		                  var jsondata = JSON.parse(data);
		                  if(jsondata.messageArray.length>0){
			              		$('#errorMessageBar').show()
			               		$('#errorMessageText').text(jsondata.messageArray)
				          }else{

								if(jsondata.push_info != ''){
									for (var i=0; i<jsondata.pushArray.length; i++){
										send_push(jsondata.push_server_id, jsondata.pushArray[i], jsondata.push_info[0], jsondata.badgeCounterArray[i]);
									}
								}
				           	close_info_popup('cal_popup_plandelete')
		                  	get_repeat_info($('#cal_popup_repeatconfirm').attr('data-lectureid'),$('#cal_popup_repeatconfirm').attr('data-memberid'))
		                  	ajax_received_json_data(jsondata)
		                  	AjaxCompleteSend();
				          }
	                  },

	                //보내기후 팝업창 닫기
	                complete:function(){
	                	$('#id_repeat_schedule_id_confirm').val('')
	                	//fill_repeat_info_off()
	                  },

	                //통신 실패시 처리
	                error:function(){
	                  alert("에러: 서버 통신 실패")
	                  close_info_popup('cal_popup_plandelete')
	                  get_repeat_info($('#cal_popup_repeatconfirm').attr('data-lectureid'),$('#cal_popup_repeatconfirm').attr('data-memberid'))
	                  AjaxCompleteSend();
	                },
	            })
			}else if(deleteTypeSelect=='repeatinfodelete' && $('#memberInfoPopup_PC').css('display')=="block"){ //회원정보창의 반복일정 삭제
				console.log('repeatinfodelete')
				var repeat_schedule_id = $(this).parent('#cal_popup_plandelete').attr('data-id')
				$.ajax({
	                url:'/schedule/delete_repeat_schedule/',
	                type:'POST',
	                data:{"repeat_schedule_id" : $('#id_repeat_schedule_id_confirm').val(), "next_page" : '/trainer/member_manage_ajax/'},
	                dataType:'html',

	                beforeSend:function(){
	                 	AjaxBeforeSend();
	                },

	                //통신성공시 처리
	                success:function(data){
		                  var jsondata = JSON.parse(data);
		                  if(jsondata.messageArray.length>0){
			                  	$('#errorMessageBar').show()
			                  	$('#errorMessageText').text(jsondata.messageArray)
				          }else{

								if(jsondata.push_info != ''){
									for (var i=0; i<jsondata.pushArray.length; i++){
										send_push(jsondata.push_server_id, jsondata.pushArray[i], jsondata.push_info[0], jsondata.badgeCounterArray[i]);
									}
								}
		                  		var userID = $('#memberId_info_PC').text()
		                  		open_member_info_popup_pc(userID,jsondata)
		                  		get_indiv_repeat_info(userID,jsondata)
		                  		set_member_lecture_list(jsondata)
                        		set_member_history_list(jsondata)
		                  		closeDeletePopup();
			                  	closeAddPlanPopup();
			                  	AjaxCompleteSend();
			                  	ajaxClassTime()			                  	
				          }
	                  },

	                //보내기후 팝업창 닫기
	                complete:function(){
	                	if($('body').width()>=600){
	                		$('#calendar').css('position','relative')	
	                	}
	                	//deleteTypeSelect = ''
	  					addTypeSelect = 'ptadd'
	                  },

	                //통신 실패시 처리
	                error:function(){
	                  alert("에러: 서버 통신 실패")
	                  closeDeletePopup();
	                  closeAddPlanPopup()
	                  AjaxCompleteSend();
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
	                     	AjaxBeforeSend();
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
										send_push(jsondata.push_server_id, jsondata.pushArray[i], jsondata.push_info[0], jsondata.badgeCounterArray[i]);
									}
								}
				          		close_info_popup('cal_popup_plandelete')
		                      	AjaxCompleteSend();
		                      	ajaxClassTime()
		                      	//fake_show()
		                      	console.log('success')
				          	}
	                      },

	                    //보내기후 팝업창 닫기
	                    complete:function(){
	                    	shade_index(100)
	                      },

	                    //통신 실패시 처리
	                    error:function(){
	                      console.log("error")
	                    },
	                 })
				}
				else{
					$.ajax({
	                    url:'/schedule/delete_schedule/',
	                    type:'POST',
	                    data:$offdelform.serialize(),

	                    beforeSend:function(){
	                    	AjaxBeforeSend();
	                    },

	                    //통신성공시 처리
	                    success:function(data){
	                    	var jsondata = JSON.parse(data)
	                    	if(jsondata.messageArray.length>0){
			              		$('#errorMessageBar').show()
			               		$('#errorMessageText').text(jsondata.messageArray)
				          	}else{
				          		close_info_popup('cal_popup_plandelete')
			                    AjaxCompleteSend();
			                    ajaxClassTime()
			                    //fake_show()
			                    console.log('success')
				          	}
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

		//일정 완료 버튼 클릭
		$("#popup_btn_complete").click(function(){  
			if($(this).val()!="filled"){
				$('#canvas').show()
				$('#canvasWrap').animate({'height':'200px'},200)
				$('#canvasWrap span').show();
			}else if($(this).val()=="filled"){
				var $pt_finish_form = $('#pt-finish-form');
				var drawCanvas = document.getElementById('canvas');
				var send_data = $pt_finish_form.serializeArray();
				send_data.push({"name":"upload_file", "value":drawCanvas.toDataURL('image/png')})
				if(schedule_on_off==1){
					//PT 일정 완료 처리시
					send_memo()
					$.ajax({
	                    url:'/schedule/finish_schedule/',
	                    type:'POST',
	                    data:$pt_finish_form.serialize(),


	                    beforeSend:function(){
	                      AjaxBeforeSend();
	                    },

	                    //통신성공시 처리
	                    success:function(data){
	                    	var jsondata = JSON.parse(data)
	                    	if(jsondata.messageArray.length>0){
			                  	$('#errorMessageBar').show()
			                  	$('#errorMessageText').text(jsondata.messageArray)
				          	}else{
				          		signImageSend(send_data);
				          		close_info_popup('cal_popup_planinfo')
			                    AjaxCompleteSend();
			                    ajaxClassTime()
			                    //send_memo()
				          	}
	                      },

	                    //보내기후 팝업창 닫기
	                    complete:function(){
	             			if($('body').width()>600){
								$('#popup_btn_complete').css({'color':'#ffffff','background':'#282828'}).val('')
							}else{
								$('#popup_btn_complete').css({'color':'#282828','background':'#ffffff'}).val('')
							}
	                    	$('#canvas').hide().css({'border-color':'#282828'})
	                    	$('#canvasWrap span').hide();
							$('#canvasWrap').css({'height':'0px'})
							$('body').css('overflow-y','overlay');
							shade_index(100)
	                      },

	                    //통신 실패시 처리
	                    error:function(){
	                    },
	                })
				}
			}
		})

		//미니 팝업 메모수정
		$('#popup_info3_memo_modify').click(function(){
			if($(this).attr('data-type') == "view"){
				$('#popup_info3_memo').attr('readonly',false).css({'border':'1px solid #fe4e65'});
				$(this).attr({'src':'/static/user/res/btn-pt-complete.png','data-type':'modify'})
			}else if($(this).attr('data-type') == "modify"){
				$('#popup_info3_memo').attr('readonly',true).css({'border':'0'});
				$(this).attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'})
				send_memo()
			}
		})
	}

	function send_memo(){
		var schedule_id = $('#cal_popup_planinfo').attr('schedule_id');
		var memo = $('#popup_info3_memo').val()
		console.log(schedule_id,memo)
		$.ajax({
            url:'/schedule/update_memo_schedule/',
            type:'POST',
            data:{"schedule_id":schedule_id,"add_memo":memo,"next_page":'/trainer/cal_week'},

            beforeSend:function(){
            	//AjaxBeforeSend();
            },

            //통신성공시 처리
            success:function(data){
            	console.log(data)
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

	function send_push(push_server_id, intance_id, message, badge_counter){

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
            		"title":"회원 일정 알림",
					"body":message,
					"badge": badge_counter,
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
            console.log('server error')
          }
        })
    }

	//PC버전 새로고침 버튼
	$('.ymdText-pc-add-refresh').click(function(){ 
		ajaxClassTime()
	})
	//PC버전 새로고침 버튼



	$('#ng_popup').click(function(){

		$(this).fadeOut(100)
	})

	function closeDeletePopup(){
		if($('#cal_popup_plandelete').css('display')=='block'){
			$("#cal_popup_plandelete").css({'display':'none'})
		}
		if($('#cal_popup_planinfo').css('display')=='block'){
			$("#cal_popup_planinfo").css({'display':'none'})
		}
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
		scheduleNoteArray = [];
		memberIdArray = [];
		memberLectureIdArray = [];
		memberNameArray = [];
		memberAvailCountArray = [];
		messageArray = [];
		RepeatDuplicationDateArray = [];
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
		scheduleNoteArray = jsondata.scheduleNoteArray;
		memberIdArray = jsondata.memberIdArray;
		memberLectureIdArray = jsondata.memberLectureIdArray;
		memberNameArray = jsondata.memberNameArray;
		memberAvailCountArray = jsondata.memberAvailCountArray;
		messageArray = jsondata.messageArray;
		RepeatDuplicationDateArray = jsondata.RepeatDuplicationDateArray;
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

		DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateArray,'member',classStartArray)
		DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classNameArray,'class')
		DBdataProcessMonthTrainer();
		classDatesTrainer();
		plancheck(clicked_td_date_info)
        var countNum = $('.plan_raw').length
		$('#countNum').text(countNum)
	}

	function signImageSend(send_data){
		$.ajax({
            url:'/schedule/upload_sign_image/',
            type:'POST',
            data:send_data,

            beforeSend:function(){
            	//AjaxBeforeSend();
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
            	console.log('sign_image_save_fail')
            },
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
			classDatesTrainer();
			monthText();
			krHoliday();
			//availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
			ajaxClassTime()
			myswiper.update(); //슬라이드 업데이트

		},

		'prepend' : function(){
			myswiper.removeSlide(2);
			myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
			calTable_Set(1,currentYear,currentPageMonth-1);	
			//dateDisabled();
			classDatesTrainer();
			monthText();
			krHoliday();
			//availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
			ajaxClassTime()
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
				$('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates" data-date='+Year+'_'+(Month-1)+'_'+j+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
			};
		}else if(Month==1){ //1월
			for(var j=31-firstDayCurrentPage+1; j<=31 ;j++){
				$('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates" data-date='+(Year-1)+'_'+(Month+11)+'_'+j+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
			};
		}
		
		//2. 첫번째 주 채우기
		for(var i=1; i<=7-firstDayCurrentPage; i++){
			if(i==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표시하기
				$('#week1'+Year+Month+'child tbody tr').append('<td data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'<span class="today">TODAY</span>'+'</td>');
			}else{
				$('#week1'+Year+Month+'child tbody tr').append('<td data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>');
			}
		};

		//3.현재달에 두번째 주부터 나머지 모두 채우기
		var lastOfweek1 = Number($('#week1'+Year+Month+'child td:last-child span:nth-child(2)').text());
		for(var i=lastOfweek1+1; i<=lastOfweek1+7; i++){
			for(var j=0;j<=4;j++){
				if(Number(i+j*7)==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표기
					$('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td data-date='+Year+'_'+Month+'_'+Number(i+j*7) +'>'+'<span class="holidayName"></span>'+'<span>'+Number(i+j*7)+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'<span class="today">TODAY</span>'+'</td>')
				}else if(Number(i+j*7<=lastDay[Month-1])){ //둘째주부터 날짜 모두
					$('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td data-date='+Year+'_'+Month+'_'+Number(i+j*7)+'>'+'<span class="holidayName"></span>'+'<span>'+Number(i+j*7)+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}
			}
		};

		//4. 현재달 마지막에 다음달 첫주 채우기
		var howmanyWeek6 = $('#week6'+Year+Month+' td').length;
		var howmanyWeek5 = $('#week5'+Year+Month+' td').length;

		if(howmanyWeek5<=7 && howmanyWeek6==0){
			for (var i=1; i<=7-howmanyWeek5;i++){
				if(Month<12){
					$('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates" data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}else if(Month==12){
					$('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates" data-date='+(Year+1)+'_'+(Month-11)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}
			};
			ad_month($('#week6'+Year+Month+'child tbody tr')) //2017.11.08추가 달력이 5주일때, 비어있는 6주차에 광고 입력
		}else if(howmanyWeek6<7 && howmanyWeek6>0){
			for (var i=1; i<=7-howmanyWeek6;i++){
				if(Month<12){
					$('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates" data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}else if(Month==12){
					$('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates" data-date='+(Year+1)+'_'+(Month-11)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div>'+'</td>')
				}
			};
		}
		for(i=1;i<=6;i++){
			$('#week'+i+Year+Month+'child td:first-child').addClass('tdsunday'); //일요일 날짜는 Red 표기
			$('#week'+i+Year+Month+'child td:last-child').addClass('tdsaturday'); //토요일 날짜는 Blue 표기
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



	function krHoliday(){ //대한민국 공휴일 날짜를 빨간색으로 표시
		for(var i=0; i<krHolidayList.length; i++){
			$("td[data-date="+krHolidayList[i]+"]").addClass('holiday');
			$("td[data-date="+krHolidayList[i]+"]").find('.holidayName').text(krHolidayNameList[i])
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


	



	function ad_month(selector){ // 월간 달력 하단에 광고
		selector.html('<img src="/static/user/res/PTERS_logo.jpg" alt="logo" class="admonth">').css({'text-align':'center'})
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




var clicked_td_date_info;
function ajaxClassTime(){
		var yyyy = $('#yearText').text()
		var mm = $('#monthText').text().replace(/월/gi,"")
		if(mm.length<2){
			var mm = '0' + mm
		}
		var today_form = yyyy+'-'+ mm +'-'+"01"

		$.ajax({
		  url: '/trainer/cal_day_ajax/',
		  type : 'POST',
		  data : {"date":today_form, "day":46},
		  dataType : 'html',

		  beforeSend:function(){
			//AjaxBeforeSend();
		  },

		  success:function(data){
			var jsondata = JSON.parse(data);
			if(jsondata.messageArray.length>0){
				$('#errorMessageBar').show()
				$('#errorMessageText').text(jsondata.messageArray)
			}else{
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
				scheduleNoteArray = [];
				memberIdArray = [];
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
				scheduleNoteArray = jsondata.scheduleNoteArray;
				memberIdArray = jsondata.memberIdArray;
				memberLectureIdArray = jsondata.memberLectureIdArray;
				memberNameArray = jsondata.memberNameArray;
				memberAvailCountArray = jsondata.memberAvailCountArray;
				messageArray = jsondata.messageArray;
				dateMessageArray = jsondata.dateMessageArray;
				repeatArray= jsondata.repeatArray;
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
			}

		  },

		  complete:function(){
			//AjaxCompleteSend();
		  },

		  error:function(){
			console.log('server error')
		  }
		})
 }


function AjaxBeforeSend(){
	$('html').css("cursor","wait");
	//$('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
	$('.ajaxloadingPC').show();

}

function AjaxCompleteSend(){
	$('html').css("cursor","auto");
	//$('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
	$('.ajaxloadingPC').hide();

}

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

function plancheck(dateinfo){ // //2017_11_21_21_00_1_김선겸_22_00 //dateinfo = 2017_11_5
	var len = classNameArray.length;
	var dateplans = []
	for(var i=0; i<len; i++){
		var splited = classNameArray[i].split('_');
		var scheduleID = scheduleIdArray[i]
		var classLectureID = classArray_lecture_id[i]
		var scheduleFinish = scheduleFinishArray[i]
		var memoArray = scheduleNoteArray[i]
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
			dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_/'+memoArray)
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
			var name = splited[4]
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
				htmltojoin.push('<div class="plan_raw" title="완료 된 일정" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'"><span class="plancheckmorningday">'+morningday+'</span><span class="planchecktime">'+stime+':00 - '+etime+':00'+'</span><span class="plancheckname">'+name+'<img src="/static/user/res/btn-pt-complete.png"></span></div>')

			}else if(splited[10] == 0){
				htmltojoin.push('<div class="plan_raw" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'"><span class="plancheckmorningday">'+morningday+'</span><span class="planchecktime">'+stime+':00 - '+etime+':00'+'</span><span class="plancheckname">'+name+'</span></div>')
			}
		}
	}else{
		htmltojoin.push('<div class="plan_raw_blank">등록된 일정이 없습니다.</div>')

	}

	$('#cal_popup_plancheck .popup_inner_month').html(htmltojoin.join(''))
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
