/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/
$(document).ready(function(){

	//setInterval(function(){ajaxCheckSchedule()}, 2000)// 자동 ajax 새로고침(일정가져오기)


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
						ajaxClassTime("this");
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


	//플로팅 버튼
	$('#float_btn').click(function(){
		/*if($('#shade').css('z-index')<0){
			$('#shade').css({'background-color':'black','z-index':'8'});
			$('#float_inner1').animate({'opacity':'0.7','bottom':'85px'},120);
			$('#float_inner2').animate({'opacity':'0.7','bottom':'145px'},120);
			$('#float_btn').addClass('rotate_btn');
		}else{
			$('#shade').css({'background-color':'white','z-index':'-1'});
			$('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
			$('#float_btn').removeClass('rotate_btn');
		}*/
	});
	//플로팅 버튼


	//날짜 클릭시 예약화면에서 [1:1레슨/ 그룹레슨] 선택 토글
	$('.mode_switch_button').click(function(){
    	var page = $(this).attr('data-page')
    	if(page == "personalreserve"){
    		$('.'+page).show()
    		$('.groupreserve').hide()
    		$('.groupreserve div.checked').removeClass('checked ptersCheckboxInner');

    	}else if(page == "groupreserve"){
    		$('.'+page).show()
    		$('.personalreserve').hide()
    	}
    	$(this).addClass('mode_active')
    	$(this).siblings('.mode_switch_button').removeClass('mode_active')
    	clear_pt_add_logic_form()
    	check_dropdown_selected()
    })

    function clear_pt_add_logic_form(){
    	$('#timeGraph td').removeClass('graphindicator_leftborder')
		$("#starttimesSelected .btn:first-child").val('').html('선택<span class="caret"></span>')
    	$('#id_group_schedule_id').val('')
    	$('#id_time_duration').val('')
    	$('#id_training_time').val('')
    }

    //등록횟수(빠른입력방식) 선택
    $(document).on('click','#groupTimeSelect .ptersCheckbox',function(){
    	$('#id_group_schedule_id').val($(this).attr('group-schedule-id'))
    	$('#id_training_time').val($(this).attr('data-time'))
    	$('#id_time_duration').val($(this).attr('data-dur'))


    	$('#groupTimeSelect div.checked').removeClass('checked ptersCheckboxInner');
        var pterscheckbox = $(this).find('div');
        $(this).addClass('checked');
        pterscheckbox.addClass('ptersCheckboxInner checked');
        check_dropdown_selected();
    })

    $(document).on('click','.admonth',function(){
    	get_trainee_participate_group()
    })

    

    /*
	$(document).on('click','td',function(){   //날짜에 클릭 이벤트 생성
		$("#popup_sign_img img").attr("src","");
		console.log($(this).attr('schedule-id'))
		$('#cal_popup').attr('data-date',$(this).attr('data-date'))
		if($(this).hasClass('available')){
			$('.cancellimit_time').text(Options.cancellimit+"시간 전")
			if($(this).find('div').hasClass('dateMytime')){
				$("#cal_popup").fadeIn('fast').css({'z-index':'103'});
				$('#shade2').css({'display':'block'});
				var schedule_finish_check = $(this).attr('data-schedule-check')
				var info = $(this).attr('data-date').split('_')
				var info2 = $(this).find(".blackballoon").text().split(':')
				var yy=info[0]
				var mm=info[1]
				var dd=info[2]
				var dayobj = new Date(yy,mm-1,dd)
				var dayraw = dayobj.getDay();
				var dayarry = ['일','월','화','수','목','금','토']
				var day = dayarry[dayraw];

				if(schedule_finish_check == 1){
					var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')';
					var infoText2 = info2[0]+"시 완료 일정";
					$('#popup_info').text(infoText);
					$('#popup_info2').text(infoText2);
					$('#popup_info3_memo').text($(this).find('.memo').text());
					$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
					$("#popup_text1").css("display","none");
					$("#popup_sign_img").css("display","block");
					$("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('schedule-id')+'.png');

				}else{

					if(yy+'_'+mm+'_'+dd == oriYear+'_'+oriMonth+'_'+oriDate && info2[0]<=currentHour+Options.cancellimit){
						var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')'
						var infoText2 = "온라인 취소불가 일정 :"+info2[0]+"시 "+info2[1]+"분"
						$('#popup_info').text(infoText)
						$('#popup_info2').text(infoText2)
						$('#popup_info3_memo').text($(this).find('.memo').text());
						$('#popup_text1 span').addClass("limited")
						$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
						$("#popup_text1").css("display","block");
						$("#popup_sign_img").css("display","none");
						console.log('if디버깅:',info2[0],currentHour,Options.cancellimit)
					}
					else{
						var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')'
						var infoText2 = info2[0]+"시 예약 취소 하시겠습니까?"
						$('#popup_info').text(infoText);
						$('#popup_info2').text(infoText2);
						$('#popup_info3_memo').text($(this).find('.memo').text());
						$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
						$("#popup_text1").css("display","block");
						$("#popup_sign_img").css("display","none");
						console.log('else디버깅:',info2[0],currentHour,Options.cancellimit);
					}
				}
			}else{
				$('#addpopup').fadeIn('fast').css({'z-index':'103'})
				$('#shade2').css({'display':'block'});
				var info3 = $(this).attr('data-date').split('_')
				var yy=info3[0]
				var mm=info3[1]
				var dd=info3[2]
				var dayobj = new Date(yy,mm-1,dd)
				var dayraw = dayobj.getDay();
				var dayarry = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
				var day = dayarry[dayraw];
				var infoText2 = yy+'년 '+ mm+'월 '+ dd+'일 ' + day
				$('#popup_info4').text(infoText2);
				console.log($('#popup_info4').text())
				//timeGraphSet("class","grey");  //시간 테이블 채우기
		        //timeGraphSet("off","grey")
		        //startTimeSet();  //일정등록 가능한 시작시간 리스트 채우기
		        ajaxTimeGraphSet($(this))
				$('#id_training_date').val(yy+'-'+mm+'-'+dd);
			}
		}else if($(this).hasClass('notavailable') && !$(this).find('div').hasClass('dateMytime')){
			$('#shade2').css({'display':'block'});
			$('#ng_popup_text').html('<p>현재시간은 일정 예약이 불가한 시간입니다.</p><p style="color:#fe4e65;font-size=13px;">예약가능 시간대<br> '+availableStartTime+'시 ~ '+availableEndTime+'시</p>')
			$('#ng_popup').fadeIn(500,function(){ // 팝업[일정은 오늘 날짜 기준 2주앞만 설정 가능합니다.]
			//$(this).fadeOut(5000)
			})
		}else if($(this).hasClass('notavailable') && $(this).find('div').hasClass('dateMytime')){
			$("#cal_popup").fadeIn('fast').css({'z-index':'103'});
			$('#shade2').css({'display':'block'});
			console.log($(this).attr('schedule-id'));
			var info = $(this).attr('data-date').split('_')
			var info2 = $(this).find(".blackballoon").text().split(':')
			var yy=info[0]
			var mm=info[1]
			var dd=info[2]
			var dayobj = new Date(yy,mm-1,dd)
			var dayraw = dayobj.getDay();
			var dayarry = ['일','월','화','수','목','금','토']
			var day = dayarry[dayraw];
			if(yy+'_'+mm+'_'+dd == oriYear+'_'+oriMonth+'_'+oriDate && info2[0]<=currentHour+Options.cancellimit){
				var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')'
				var infoText2 = "온라인 취소불가 일정 :"+info2[0]+"시 "+info2[1]+"분"
				$('#popup_info').text(infoText)
				$('#popup_info2').text(infoText2)
				$('#popup_text1 span').addClass("limited")
				$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
			}else{
				var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')'
				var infoText2 = info2[0]+"시에 예약 되어있습니다. <br> (예약 및 취소는 "+availableStartTime+'시 ~ '+availableEndTime+'시에 가능합니다.)'
				$('#popup_info').text(infoText)
				$('#popup_info2').html(infoText2)
				$('#popup_sign_img, #popup_text1').css('display','none')
				$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
			}
		}else if($(this).find('div').hasClass('greydateMytime')){
			$("#cal_popup").fadeIn('fast').css({'z-index':'103'});
			$('#shade2').css({'display':'block'});
			var schedule_finish_check = $(this).attr('data-schedule-check')
			var info = $(this).attr('data-date').split('_')
			var info2 = $(this).find(".balloon").text().split(':')
			var yy=info[0]
			var mm=info[1]
			var dd=info[2]
			var dayobj = new Date(yy,mm-1,dd)
			var dayraw = dayobj.getDay();
			var dayarry = ['일','월','화','수','목','금','토']
			var day = dayarry[dayraw];

			if(schedule_finish_check == 1) {
                var infoText = yy + '년 ' + mm + '월 ' + dd + '일 ' + '(' + day + ')';
                var infoText2 = info2[0] + "시 완료 일정";
                $('#popup_info').text(infoText);
                $('#popup_info2').text(infoText2);
                $('#popup_info3_memo').text($(this).find('.memo').text());
                $("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
                $("#popup_text1").css("display", "none");
                $("#popup_sign_img").css("display", "block");
                $("#id_sign_img").attr('src', 'https://s3.ap-northeast-2.amazonaws.com/pters-image/' + $(this).attr('schedule-id') + '.png');
            }else{
				var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')'
				var infoText2 = '지난 일정'
				var infoText3 = $(this).find('.memo').text()
				$('#popup_info').text(infoText)
				$('#popup_info2').text(infoText2)
				$('#popup_info3_memo').text(infoText3)
				$('#popup_sign_img').hide()
				$('#popup_text1').show()
				$('#popup_text1 span').addClass("limited")
			}
		}else if($(this).hasClass('option_notavailable')){

		}else{
			$('#shade2').css({'display':'block'});
			$('#ng_popup_text').html('<p>일정은 오늘 날짜 기준</p><p>'+Options.availDate+'일 앞으로만 설정 가능합니다.</p>')
			$('#ng_popup').fadeIn(500,function(){ // 팝업[일정은 오늘 날짜 기준 2주앞만 설정 가능합니다.]
			//$(this).fadeOut(2800)
			})
		}
	})
	*/

	$(document).on('click','td',function(){
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
		var countNum = $(this).attr('data-countnum')
		if(countNum == undefined){
			$('#countNum').text(0)
		}
		$('#countNum').text(countNum)
		$('.popup_ymdText').html(infoText)
		plancheck(yy+'_'+mm+'_'+dd, initialJSON)
		clicked_td_date_info = yy+'_'+mm+'_'+dd
	})

	$(document).on('click','.plan_raw',function(){
			shade_index(150)
			$('#popup_planinfo_title').text('레슨 일정')
			if($('body').width()>600){
				$('#popup_btn_complete').css({'color':'#ffffff','background':'#282828'}).val('')
			}else{
				$('#popup_btn_complete').css({'color':'#282828','background':'#ffffff'}).val('')
			}
			
			var selectedDate = $('.popup_ymdText').text()
			var selectedTime = $(this).find('.planchecktime').text().split(':')[0]
			var selectedMinute = $(this).find('.planchecktime').text().split(':')[1].split(' - ')[0]
			var selectedPerson = '<span class="memberNameForInfoView" data-dbid="'+$(this).attr('data-dbid')+'" data-name="'+$(this).attr('data-membername')+'">'+$(this).find('.plancheckname').text()+'</span>'
			var selectedMemo = $(this).attr('data-memo')
			if($(this).attr('data-memo') == undefined){
				var selectedMemo = ""
			}
			$("#cal_popup").fadeIn('fast').attr({'schedule_id':$(this).attr('schedule-id'), 'data-grouptype':$(this).attr('data-grouptype')})
			$('#popup_info3_memo').attr('readonly',true).css({'border':'0'});
			$('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'})
			$('#popup_info').text(selectedDate);
			$('#popup_info2').html(selectedPerson+'의 '+ selectedTime+':'+selectedMinute + ' 일정');
			$('#popup_info3_memo').text(selectedMemo).val(selectedMemo)

			$('#canvas').hide().css({'border-color':'#282828'})
			$('#canvasWrap').css({'height':'0px'})
			$('#canvasWrap span').hide();

			$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
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

			toggleGroupParticipantsList('off')
			$('#subpopup_addByList_plan').hide()
			if($(this).attr('data-grouptype') == "group"){
				$('#popup_btn_viewGroupParticipants').show().attr({'data-membernum': $(this).attr('data-membernum'),
																	'data-groupid': $(this).attr('data-groupid'),
																	'group-schedule-id':$(this).attr('schedule-id'),
																	})
			}else{
				$('#popup_btn_viewGroupParticipants').hide()
			}
	})


	$(document).on('click','.plan_raw_add',function(){
		$('#addpopup').fadeIn('fast')
		$('#shade2').css({'display':'block'});
		var info3 = $(this).attr('data-date').split('_')
		var yy=info3[0]
		var mm=info3[1]
		var dd=info3[2]
		var dayobj = new Date(yy,mm-1,dd)
		var dayraw = dayobj.getDay();
		var dayarry = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
		var day = dayarry[dayraw];
		var infoText2 = yy+'년 '+ mm+'월 '+ dd+'일 ' + day
		$('#popup_info4').text(infoText2);
		//timeGraphSet("class","grey");  //시간 테이블 채우기
        //timeGraphSet("off","grey")
        //startTimeSet();  //일정등록 가능한 시작시간 리스트 채우기
        ajaxTimeGraphSet($(this))
		$('#id_training_date').val(yy+'-'+mm+'-'+dd);
	})

	


	/*
	$(document).on('click','td',function(){   //날짜에 클릭 이벤트 생성
		var toploc = $(this).offset().top;
        var leftloc = $(this).offset().left;
        var tdwidth = $(this).width();
        var tdheight = $(this).height();
		$('#cal_popup_mini_selector').fadeIn().css({'top':toploc-25,'left':leftloc+5})

		$('#cal_popup_mini_selector div').show()
		if($(this).hasClass('available') && !$(this).find('div').hasClass('dateMytime')){
			$('#mini_selector_del').hide()
		}else if($(this).hasClass('available') && $(this).find('div').hasClass('dateMytime')){
			$('#mini_selector_add').hide()
		}else if($(this).hasClass('notavailable') && !$(this).find('div').hasClass('dateMytime')){
			$('#mini_selector_add').hide()
			$('#mini_selector_del').hide()
		}else if($(this).hasClass('notavailable') && $(this).find('div').hasClass('dateMytime')){
			$('#mini_selector_add').hide()
			$('#mini_selector_del').hide()
		}else if($(this).find('div').hasClass('greydateMytime')){
			$('#mini_selector_add').hide()
			$('#mini_selector_del').hide()
		}else{
			$('#mini_selector_add').hide()
			$('#mini_selector_del').hide()
			$('#mini_selector_view').hide()
		}
	})
	*/
	

	$('.button_close_popup').click(function(){
		$(this).parents('.popups').fadeOut('fast')
	})

      var select_all_check = false;
      //달력 선택된 날짜
      //출력 예시 : Fri Sep 08 2017 00:00:00 GMT+0900 (대한민국 표준시)

    $(document).on('click','#starttimes li a',function(){
        $("#starttimesSelected button").addClass("dropdown_selected");
        $("#starttimesSelected .btn:first-child").text($(this).text());
        $("#starttimesSelected .btn:first-child").val($(this).text());
        $("#id_training_time").val($(this).attr('data-trainingtime'));
        $("#id_time_duration").val(1);
        var arry = $(this).attr('data-trainingtime').split(':')
        //durTimeSet(arry[0]);
        addGraphIndicator(1)
        check_dropdown_selected();
        //var selected_start_time = Number($('td.graphindicator_leftborder').attr('id').replace(/g/gi,""))
        var selected_start_time = Number($(this).attr('data-trainingtime').split(':')[0])
        console.log(selected_start_time,Options.cancellimit,';;;;')
        if(Options.cancellimit <= 12){
        	$('.cancellimit_time').text(Options.cancellimit+"시간 전"+(selected_start_time-Options.cancellimit)+":00)")
        }else{
        	$('.cancellimit_time').text(Options.cancellimit+"시간 전")
        }
    })

    function check_dropdown_selected(){ // 회원이 PT 예약시 시간, 진행시간을 선택했을때 분홍색으로 버튼 활성화 
   		var durSelect = $("#durationsSelected button");
       	var startSelect = $("#starttimesSelected button")

       	var form_date = $('#id_training_date')
       	var form_time = $('#id_training_time')
       	var form_dura = $('#id_time_duration')
       	var form_group = $('#id_group_schedule_id')

       	console.log(form_date.val(), form_time.val(), form_dura.val())
       	if(form_date.val() && form_time.val() && form_dura.val()){
       	    $("#submitBtn").addClass('submitBtnActivated');
           	select_all_check=true;
       	}else{
       		$("#submitBtn").removeClass('submitBtnActivated');
       	    select_all_check=false;
    	}


       	/*
    	if((startSelect).hasClass("dropdown_selected")==true){
       	    $("#submitBtn").addClass('submitBtnActivated');
           	select_all_check=true;
       	}else{
       	    select_all_check=false;
    	}
    	*/
    }

    var ajax_block_during_sending_send_reservation = true
    $("#submitBtn").click(function(){
    	check_dropdown_selected()
        if(select_all_check==true){
            //document.getElementById('pt-add-form').submit();
            if(ajax_block_during_sending_send_reservation == true){
            	ajax_block_during_sending_send_reservation = false
            	send_reservation()
            }
        }else{
        	alert('시작 시간을 선택 해주세요.')
            //입력값 확인 메시지 출력 가능
        }
    })

    function send_reservation(){
		$.ajax({
	          url: '/trainee/pt_add_logic/',
	          data: $('#pt-add-form').serialize(),
			  dataType : 'html',
			  type:'POST',

	          beforeSend:function(){
	          	beforeSend();
	          },

	          success:function(data){
	          	var jsondata = JSON.parse(data);
	          	console.log(data)
	          	if(jsondata.messageArray.length>0){
	              	$('#errorMessageBar').show()
	              	$('#errorMessageText').text(jsondata.messageArray)
	            }else{
					for (var i=0; i<jsondata.pushArray.length; i++){
						//send_push(jsondata.push_server_id, jsondata.pushArray[i], jsondata.push_title[0], jsondata.push_info[0], jsondata.badgeCounterArray[i]);
					}
					ajaxClassTime("this");
					close_reserve_popup()
	            }
	            
			  },

	          complete:function(){
	          	completeSend()
	          	ajax_block_during_sending_send_reservation = true
	          },

	          error:function(){
	            console.log('server error')
	          }
        })
    }

    function initialize_member_form(){
    	$('#id_schedule_id').val('') //delete
    	$('#id_training_date').val('') //add
    	$('#id_time_duration').val('') //add
    	$('#id_training_time').val('') //add
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
          	beforeSend();
          },

          success:function(response){
			  console.log(response);
          },

          complete:function(){
          	completeSend();
          },

          error:function(){
            console.log('server error')
          }
        })
    }

    $("#popup_text1").click(function(){  //일정 삭제 버튼 클릭
		if($(this).find("span").hasClass('limited')){
			var clicked = date_format_yyyy_m_d_to_yyyymmdd($('#cal_popup').attr('data-date'))
			var today = date_format_yyyy_m_d_to_yyyymmdd(currentYear+'_'+(currentMonth+1)+'_'+currentDate)
			if(clicked < today){
				alert("지난 일정은 삭제가 불가합니다.\n담당 강사에게 직접 문의해주세요")
			}else{
				alert("선택한 일정은 삭제가 불가합니다.\n \n시작 "+Options.cancellimit+'시간 이내에는 온라인 취소가 불가합니다.\n \n담당 강사에게 직접 문의해주세요')
			}
		}else{
			$("#cal_popup").hide()
			$("#cal_popup3").fadeIn('fast');
			$('#shade2').css({'display':'block'});
		}
	})

    var ajax_block_during_sending_send_delete = true
	$('#popup_text3').click(function(){
		if(ajax_block_during_sending_send_delete == true){
			ajax_block_during_sending_send_delete = false
			send_delete()
		}
		
	})

	function send_delete(){
		$.ajax({
	          url: '/trainee/pt_delete_logic/',
	          data: $('#pt-delete-form').serialize(),
			  dataType : 'html',
			  type:'POST',

	          beforeSend:function(){
	          	//beforeSend();
	          },

	          success:function(data){
	          	console.log('test')
	          	var jsondata = JSON.parse(data);
	          	console.log(jsondata)
	          	if(jsondata.messageArray.length>0){
	              	$('#errorMessageBar').show()
	              	$('#errorMessageText').text(jsondata.messageArray)
	            }else{
					for (var i=0; i<=jsondata.pushArray.length; i++){
						//send_push(jsondata.push_server_id, jsondata.pushArray[i], jsondata.push_title[0], jsondata.push_info[0], jsondata.badgeCounterArray[i]);
					}
					ajaxClassTime("this");
					close_delete_confirm_popup()
	            }
	            
			  },

	          complete:function(){
	          	ajax_block_during_sending_send_delete = true
	          },

	          error:function(){
	            console.log('server error')
	          }
        })
	}


	$("#btn_close").click(function(){  //일정삭제 팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup').css('display')=='block'){
				$("#cal_popup").css({'display':'none'})
				shade_index(100)
				$('#popup_text1 span').removeClass('limited')
			}
	})

	/*
	$("#btn_close2").click(function(){ //일정추가 팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup2').css('display')=='block'){
				$("#cal_popup2").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
	})
	*/

	$("#btn_close3").click(function(){ //일정삭제 확인 팝업 X버튼 눌렀을때 팝업 닫기
		close_delete_confirm_popup()
	})

	function close_delete_confirm_popup(){
		if($('#cal_popup3').css('display')=='block'){
				$("#cal_popup3").css({'display':'none'})
				$('#shade2').css({'display':'none'});
		}
	}

	$('#popup_text4').click(function(){ //일정삭제 확인 팝업 취소버튼 눌렀을때 팝업 닫기
			if($('#cal_popup3').css('display')=='block'){
				$("#cal_popup3").css({'display':'none'})
				shade_index(100)
			}
	})


	$("#btn_close4").click(function(){ //일정예약 상세화면 팝업 X버튼 눌렀을때 팝업 닫기
		close_reserve_popup()
	})

	function close_reserve_popup(){
		$('#timeGraph td').removeClass('graphindicator_leftborder')
		$('#starttimes').remove('li')
		$('#durations').remove('li')
		$("#starttimesSelected button").removeClass("dropdown_selected");
		$("#durationsSelected button").removeClass("dropdown_selected");
		$("#submitBtn").removeClass('submitBtnActivated');		
		$("#starttimesSelected .btn:first-child").val('').html('선택<span class="caret"></span>')
		$("#durationsSelected .btn:first-child").val('').html('선택<span class="caret"></span>')
		if($('#addpopup').css('display')=='block'){
			$("#addpopup").css({'display':'none'})
			$('#shade2').css({'display':'none'});
		}
	}

	$('#ng_popup').click(function(){
		$('#shade2').css({'display':'none'});
		$(this).fadeOut(100)
	})

	if(reserveOption=="disable"){
		$(document).off('click','td');
		$('#float_btn').hide()
	}

//여기서부터 월간 달력 만들기 코드////////////////////////////////////////////////////////////////////////////////////////////////

	calTable_Set(1,currentYear,currentPageMonth-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
	calTable_Set(2,currentYear,currentPageMonth);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
	calTable_Set(3,currentYear,currentPageMonth+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기

	//DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateArray,'member',classStartArray)

	alltdRelative(); //모든 td의 스타일 position을 relative로
	monthText(); //상단에 연, 월 표시
	availableDateIndicator(availableStartTime,availableEndTime);
	krHoliday(); //대한민국 공휴일
	draw_time_graph(Options.hourunit,'')
	ajaxClassTime("this"); //나의 PT일정에 핑크색 동그라미 표시

	//다음페이지로 슬라이드 했을때 액션
	myswiper.on('SlideNextEnd',function(){
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
	myswiper.on('SlidePrevEnd',function(){
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
			alltdRelative();
			monthText();
			krHoliday();
			availableDateIndicator(availableStartTime,availableEndTime);
			ajaxClassTime("this")
			myswiper.update(); //슬라이드 업데이트

		},

		'prepend' : function(){
			myswiper.removeSlide(2);
			myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
			calTable_Set(1,currentYear,currentPageMonth-1);
			alltdRelative();		
			monthText();
			krHoliday();
			availableDateIndicator(availableStartTime,availableEndTime);
			ajaxClassTime("this")
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
		
		console.log(Year,Month)
		calendarSetting(Year,Month);
	}; //calTable_Set


	function calendarSetting(Year,Month){ //캘린더 테이블에 연월에 맞게 날짜 채우기
		console.log(Year,Month)
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
				$('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates"'+' data-date='+Year+'_'+(Month-1)+'_'+j+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>');
			};
		}else if(Month==1){ //1월
			for(var j=31-firstDayCurrentPage+1; j<=31 ;j++){
				$('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates"'+' data-date='+(Year-1)+'_'+(Month+11)+'_'+j+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>');
			};
		}
		
		//2. 첫번째 주 채우기
		for(var i=1; i<=7-firstDayCurrentPage; i++){
			if(i==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표시하기
				$('#week1'+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'<span class="today">TODAY</span>'+'</td>');
			}else{
				$('#week1'+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>');
			}
		};

		//3.현재달에 두번째 주부터 나머지 모두 채우기
		var lastOfweek1 = Number($('#week1'+Year+Month+'child td:last-child span:nth-child(2)').text());
		for(var i=lastOfweek1+1; i<=lastOfweek1+7; i++){
			for(var j=0;j<=4;j++){
				if(Number(i+j*7)==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표기
					$('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+Number(i+j*7) +'>'+'<span class="holidayName"></span>'+'<span>'+Number(i+j*7)+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'<span class="today">TODAY</span>'+'</td>')
				}else if(Number(i+j*7<=lastDay[Month-1])){ //둘째주부터 날짜 모두
					$('#week'+Number(j+2)+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+Number(i+j*7)+'>'+'<span class="holidayName"></span>'+'<span>'+Number(i+j*7)+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>')
				}
			}
		};

		//4. 현재달 마지막에 다음달 첫주 채우기
		var howmanyWeek6 = $('#week6'+Year+Month+' td').length;
		var howmanyWeek5 = $('#week5'+Year+Month+' td').length;

		if(howmanyWeek5<=7 && howmanyWeek6==0){
			for (var i=1; i<=7-howmanyWeek5;i++){
				if(Month<12){
					$('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>')
				}else if(Month==12){
					$('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+(Year+1)+'_'+(Month-11)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>')
				}
			};
			ad_month($('#week6'+Year+Month+'child tbody tr')) //2017.11.08추가 달력이 5주일때, 비어있는 6주차에 광고 입력
		}else if(howmanyWeek6<7 && howmanyWeek6>0){
			for (var i=1; i<=7-howmanyWeek6;i++){
				if(Month<12){
					$('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+Year+'_'+(Month+1)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>')
				}else if(Month==12){
					$('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date='+(Year+1)+'_'+(Month-11)+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>')
				}
			};
		}
		for(i=1;i<=6;i++){
			$('#week'+i+Year+Month+'child td:first-child').css({color:'#d21245'}); //일요일 날짜는 Red 표기
			$('#week'+i+Year+Month+'child td:last-child').css({color:'#115a8e'}); //토요일 날짜는 Blue 표기
		} 
	}; //calendarSetting()

	function alltdRelative(){ //날짜 밑에 동그라미 색상표기를 위해 모든 td의 css 포지션 값 relative로 설정
		$('td').css('position','relative');
	};


	function krHoliday(){ //대한민국 공휴일 날짜를 빨간색으로 표시
		for(var i=0; i<krHolidayList.length; i++){
			$("td[data-date="+krHolidayList[i]+"]").addClass('holiday');
			$("td[data-date="+krHolidayList[i]+"]").find('.holidayName').text(krHolidayNameList[i]);
		};
	};

	function monthText(){
		var currentYMD = $('.swiper-slide:nth-child(2) div:nth-child(1)').attr('id');
		//currentYMD 형식  ex : week120177
		var textYear = currentYMD.substr(5,4); //2017
		var textMonth = currentYMD.substr(9,2); //7
		$('#yearText, #ymdText-pc-year').text(textYear);
		$('#monthText, #ymdText-pc-month').text(textMonth+'월');
	};

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



	function draw_time_group_graph(jsondata, dateinfo){
		var len = jsondata.group_schedule_group_id.length;
		var htmlTojoin = []
		for(var i=0; i<len; i++){
			if(date_format_yyyy_mm_dd_to_yyyy_m_d(jsondata.group_schedule_start_datetime[i].split(' ')[0],'_') == dateinfo){
				if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){


					var planYear    = Number(jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[0])
				    var planMonth   = Number(jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[1])
				    var planDate    = Number(jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[2])
				    var planHour    = Number(jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[0])
				    var planMinute  = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[1]
				    var planEDate   = Number(jsondata.group_schedule_end_datetime[i].split(' ')[0].split('-')[2]) 
				    var planEndHour = Number(jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[0])
				    var planEndMin  = jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[1]
					if(Math.abs(Number(planEndMin) - Number(planMinute)) == 30){  //  01:30 ~ 02:00  01:00 ~ 01:30,,,, 01:00 ~ 05:30, 01:30 ~ 05:00 
				        if(planEndHour-planHour == 0){
				          var planDura = "0.5"
				        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == -30 ){
				          var planDura = String((planEndHour-planHour-1))+'.5'
				        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == 30){
				          var planDura = String((planEndHour-planHour))+'.5'
				        }
				    }else{
				      var planDura = planEndHour - planHour;
				    }
				    
				    //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
				    if(planEDate == planDate+1 && planEndHour==planHour){
				      var planDura = 24
				    }else if(planEDate == planDate+1 && planEndHour == 0){
				      var planDura = 24-planHour
				    }else if(planDate == lastDay[planMonth-1] && planEDate == 1 && planEndHour == 0){ //달넘어갈때 -23시 표기되던 문제
				      var planDura = 24-planHour
				    }


					htmlTojoin.push('<div><div class="ptersCheckbox" data-date="'+jsondata.group_schedule_start_datetime[i].split(' ')[0]+
																	'" data-time="'+jsondata.group_schedule_start_datetime[i].split(' ')[1]+'.000000'+
																	'" data-dur="'+planDura+
																	'" group-schedule-id="'+jsondata.group_schedule_id[i]+'"><div></div></div>'+
																	jsondata.group_schedule_start_datetime[i].split(' ')[1].substr(0,5)+' - ['+
																	jsondata.group_schedule_group_name[i]+'] ('+
																	jsondata.group_schedule_current_member_num[i]+'/'+
																	jsondata.group_schedule_max_member_num[i]+
																	')</div>')
				}
			}
		}
		$('#groupTimeSelect').html(htmlTojoin.join(''))
	}


	function availableDateIndicator(availableStartTime,Endtime){ 
		// 요소설명
		// availableStartTime : 강사가 설정한 '회원이 예약 가능한 시간대 시작시간'
		// availableStartTime : 강사가 설정한 '회원이 예약 가능한 시간대 마감시간'
		if(Options.reserve == 1){
			$('td:not([schedule-id])').addClass('option_notavailable')
			$('.blackballoon').parent('td').addClass('option_notavailable')
		}else{
			if(currentHour<Endtime && currentHour>=availableStartTime){
				var availability = 'available'
			}else{
				var availability = 'notavailable'
			}
			for(i=currentDate;i<=currentDate+Options.availDate;i++){
				if(i>lastDay[oriMonth-1] && oriMonth<12){
				 	$('td[data-date='+oriYear+'_'+(oriMonth+1)+'_'+(i-lastDay[oriMonth-1])+']').addClass(availability)
				}else if(i>lastDay[oriMonth-1] && oriMonth==12){
					$('td[data-date='+(oriYear+1)+'_'+(oriMonth-11)+'_'+(i-lastDay[oriMonth-1])+']').addClass(availability)
				}else{
				 	$('td[data-date='+oriYear+'_'+oriMonth+'_'+i+']').addClass(availability)	
				}
			}
		}
	}

	function ad_month(selector){ // 월간 달력 하단에 광고
		selector.html('<img src="/static/user/res/PTERS_logo.jpg" alt="logo" class="admonth">').css({'text-align':'center'})
	}

	function plancheck(dateinfo, jsondata){ // //2017_11_21_21_00_1_김선겸_22_00 //dateinfo = 2017_11_5
		var len1 = jsondata.scheduleIdArray.length;
		var len2 = jsondata.group_schedule_id.length;
		var dateplans = []


		for(var i=0; i<len2; i++){  //시간순 정렬을 위해 'group' 정보를 가공하여 dateplans에 넣는다.
			var grouptype = "group"
			var dbID = ''
			var group_id = jsondata.group_schedule_group_id[i]
			var scheduleID = jsondata.group_schedule_id[i]
			var classLectureID = ''
			var scheduleFinish = jsondata.group_schedule_finish_check[i]
			var memoArray = jsondata.group_schedule_note[i]
			var yy = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[0]
			var mm = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[1]
			var dd = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[2]
			var stime1 = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[0]
			var etime1 = jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[0]
			var sminute = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[1]
			var eminute = jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[1]
			var groupmax = jsondata.group_schedule_max_member_num[i]
			var groupcurrent = jsondata.group_schedule_current_member_num[i]
			var groupParticipants = '(' + groupcurrent + '/' + groupmax + ')'
			var name = jsondata.group_schedule_group_name[i]+groupParticipants
			if(stime1.length<2){
				var stime1 = '0'+stime1
			}else if(stime1 == '24'){
				var stime1 = '00'
			}
			var stime = stime1+'_'+sminute
			var etime = etime1+'_'+eminute
			var ymd = yy+'_'+Number(mm)+'_'+Number(dd)
			if(ymd == dateinfo){
				dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_'+dbID+'_'+grouptype+'_'+group_id+'_/'+memoArray)
			}
		}

		for(var i=0; i<len1; i++){  //시간순 정렬을 위해 'class' 정보를 가공하여 dateplans에 넣는다.
			var grouptype = "class"
			//var dbID = jsondata.classTimeArray_member_id[i]
			var dbID = ''
			var group_id = ''
			var scheduleID = jsondata.scheduleIdArray[i]
			//var classLectureID = jsondata.classArray_lecture_id[i]
			var classLectureID = ''
			var scheduleFinish = jsondata.scheduleFinishArray[i]
			var memoArray = jsondata.scheduleNoteArray[i]
			var yy = jsondata.classTimeArray_start_date[i].split(' ')[0].split('-')[0]
			var mm = jsondata.classTimeArray_start_date[i].split(' ')[0].split('-')[1]
			var dd = jsondata.classTimeArray_start_date[i].split(' ')[0].split('-')[2]
			var stime1 = jsondata.classTimeArray_start_date[i].split(' ')[1].split(':')[0]
			var etime1 = jsondata.classTimeArray_end_date[i].split(' ')[1].split(':')[0]
			var sminute = jsondata.classTimeArray_start_date[i].split(' ')[1].split(':')[1]
			var eminute = jsondata.classTimeArray_end_date[i].split(' ')[1].split(':')[1]
			if(stime1.length<2){
				var stime1 = '0'+stime1
			}else if(stime1 == '24'){
				var stime1 = '00'
			}
			var stime = stime1+'_'+sminute
			var etime = etime1+'_'+eminute
			var name = "1:1 레슨"
			var ymd = yy+'_'+Number(mm)+'_'+Number(dd)
			if(ymd == dateinfo && jsondata.group_schedule_start_datetime.indexOf(jsondata.classTimeArray_start_date[i]) == -1){
				dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_'+dbID+'_'+grouptype+'_'+group_id+'_/'+memoArray)
			}
		}

		
		dateplans.sort();
		var htmltojoin = []
		if(dateplans.length>0){
			for(var i=1;i<=dateplans.length;i++){
				var splited = dateplans[i-1].split('_')
				var stime = Number(splited[0])
				var sminute = splited[1]
				var etime = Number(splited[2])
				var eminute = splited[3]
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
					htmltojoin.push('<div class="plan_raw" title="완료 된 일정" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-membernum="'+groupmax+'" data-dbid="'+splited[11]+'" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'"><span class="plancheckmorningday">'+morningday+'</span><span class="planchecktime">'+stime+':'+sminute+' - '+etime+':'+eminute+'</span><span class="plancheckname">'+name+'<img src="/static/user/res/btn-pt-complete.png"></span></div>')

				}else if(splited[10] == 0){
					htmltojoin.push('<div class="plan_raw" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-membernum="'+groupmax+'" data-dbid="'+splited[11]+'" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'"><span class="plancheckmorningday">'+morningday+'</span><span class="planchecktime">'+stime+':'+sminute+' - '+etime+':'+eminute+'</span><span class="plancheckname">'+name+'</span></div>')
				}
			}
		}else{
			htmltojoin.push('<div class="plan_raw_blank">등록된 일정이 없습니다.</div>')
		}
		if(date_format_yyyy_m_d_to_yyyymmdd(dateinfo) >= date_format_yyyy_m_d_to_yyyymmdd(oriYear+'_'+oriMonth+'_'+oriDate)){
			htmltojoin.push('<div class="plan_raw_blank plan_raw_add" data-date="'+dateinfo+'"><img src="/static/user/res/floatbtn/btn-plus.png" style="width:20px;cursor:pointer;"></div>')
		}

		$('#cal_popup_plancheck .popup_inner_month').html(htmltojoin.join(''))
	}

    function ajaxTimeGraphSet(clicked){
            var today_form = date_format_to_yyyymmdd(clicked.attr('data-date'),'-')
            $.ajax({
              url: '/trainee/read_trainee_schedule_ajax/',
              type : 'POST',
              data : {"date":today_form, "day":1}, //월간 46 , 주간 18, 하루 1
              dataType : 'html',

              beforeSend:function(){
              },

              success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
	          		$('#errorMessageBar').show()
	                $('#errorMessageText').text(jsondata.messageArray)
	          	}else{
	                timeGraphSet("class","grey", "AddClass", jsondata);  //시간 테이블 채우기
			        timeGraphSet("off","grey", "AddClass", jsondata);
	                startTimeSet('class');  //일정등록 가능한 시작시간 리스트 채우기
	                draw_time_group_graph(jsondata, date_format_yyyy_mm_dd_to_yyyy_m_d(today_form,'_'))
	          	}
                
              },

              complete:function(){
              },

              error:function(){
                console.log('server error')
              }
            }) 
    }

    function timeGraphSet(option,CSStheme, Page, jsondata){ //가능 시간 그래프 채우기
	  //1. option인자 : "class", "off"
	  //2. CSS테마인자 : "grey", "pink"

	  switch(option){
	    case "class" :
	      //var DateDataArray = classDateData;
	      //var TimeDataArray = classTimeData;
	      var planStartDate = jsondata.classTimeArray_start_date;
	      var planEndDate = jsondata.classTimeArray_end_date;
	      //$('.tdgraph_'+Options.hourunit+', .tdgraph_mini').removeClass('greytimegraph').removeClass('pinktimegraph')
	      $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
	    break;
	    case "off" :
	      //var DateDataArray = offDateData;
	      //var TimeDataArray = offTimeData;
	      var planStartDate = jsondata.offTimeArray_start_date;
	      var planEndDate = jsondata.offTimeArray_end_date;
	    break;
	  }

	  switch(CSStheme){
	    case "grey" :
	      var cssClass = "greytimegraph"
	      var cssClass_border = "greytimegraph_greyleft"
	    break;
	    case "pink" :
	      var cssClass= "pinktimegraph"
	      var cssClass_border= "pinktimegraph_pinkleft"
	    break;
	  }

	  switch(Page){
	    case "mini" :
	      var datepicker = $('#datetext_mini')
	      var option = "_mini"
	    break;
	    case "AddClass" :
	      var datepicker = $("#datepicker")
	      var option = "" 
	    break;
	  }

	  var date = datepicker.val();
	  var date = date_format_to_yyyymmdd($('#popup_info4').text(),'-')
	  var Arraylength = planStartDate.length;
	  for(var i=0;i<Arraylength;i++){
	    var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0])
	    var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1])
	    var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2])
	    var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0])
	    var planMinute  = planStartDate[i].split(' ')[1].split(':')[1]
	    var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]) 
	    var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0])
	    var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1]
	    if(planHour == 24){
	      var planHour = 0
	    }
	    if(Math.abs(Number(planEndMin) - Number(planMinute)) == 30){  //  01:30 ~ 02:00  01:00 ~ 01:30,,,, 01:00 ~ 05:30, 01:30 ~ 05:00 
	        if(planEndHour-planHour == 0){
	          var planDura = "0.5"
	        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == -30 ){
	          var planDura = String((planEndHour-planHour-1))+'.5'
	        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == 30){
	          var planDura = String((planEndHour-planHour))+'.5'
	        }
	    }else{
	      var planDura = planEndHour - planHour;
	    }
	    
	    //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
	    if(planEDate == planDate+1 && planEndHour==planHour){
	      var planDura = 24
	    }else if(planEDate == planDate+1 && planEndHour == 0){
	      var planDura = 24-planHour
	    }else if(planDate == lastDay[planMonth-1] && planEDate == 1 && planEndHour == 0){ //달넘어갈때 -23시 표기되던 문제
	      var planDura = 24-planHour
	    }

	    if(planMinute == '00'){
	      if(Options.workStartTime>planHour && planDura > Options.workStartTime - planHour){
	        
	        var planDura = planDura - (Options.workStartTime - planHour) // 2 - (10 - 8)
	        var planHour = Options.workStartTime
	         //2018_4_22_8_30_2_OFF_10_30 
	      }
	    }else if(planMinute == '30'){
	        //(10>8)  (2>=10-8)
	      if(Options.workStartTime>planHour && planDura >= Options.workStartTime - planHour){
	        
	        var planDura = planDura - (Options.workStartTime - planHour)+0.5 // 2 - (10 - 8)
	        var planHour = Options.workStartTime
	        var planMinute = '00'
	         //2018_4_22_8_30_2_OFF_10_30 
	      }
	    }
	    //if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime>=1 && durTime.indexOf('.')==-1){  //수업시간이 1시간 단위 일때 칸 채우기
	        /*
	        for(var j=0; j<durTime; j++){
	          var time = Number(planHour)+j
	          if(j == 0){
	            $('#'+(time)+'g_00'+option).addClass(cssClass)
	            $('#'+(time)+'g_30'+option).addClass(cssClass_border)
	          }else{
	            $('#'+(time)+'g_00'+option + ',#'+(time)+'g_30'+option).addClass(cssClass_border)
	          }
	        }
	        */
	    //}else if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime>0 && durTime.indexOf('.')){ //수업시간이 0.5 단위일때
	      if(date_format_yyyy_m_d_to_yyyy_mm_dd(planYear+'-'+planMonth+'-'+planDate,'-') == date && planDura>0){ //수업시간이 0.5 단위일때
	        var length = parseInt(planDura)
	        if(length == 0){
	          var length = 1;
	        }
	        //for(var j=0; j<length; j++){  // 1_30_1.5
	        var time = Number(planHour)
	        var min = planMinute
	        for(k=0; k<planDura/0.5; k++){
	              if(min == 60){
	              var min = '00'
	              var time = time +1
	            }
	            if(k==0){
	              $('#'+(time)+'g_'+min+option).addClass(cssClass)
	            }else{
	              $('#'+(time)+'g_'+min+option).addClass(cssClass_border)
	            }
	            
	            min = Number(min)+30
	        }      
	    }
	  }
	  

	  /*업무시간 설정 수업시간 30분 단위일때*/
	  if(Options.hourunit == 30){
	    for(var j=0; j<Options.workStartTime; j++){
	      $('#'+j+'g_00'+option).addClass('greytimegraph')
	      $('#'+j+'g_30'+option).addClass('greytimegraph')
	    }

	    for(var t=Options.workEndTime; t<24; t++){
	      $('#'+t+'g_00'+option).addClass('greytimegraph')
	      $('#'+t+'g_30'+option).addClass('greytimegraph')
	    }  
	  }else{
	    /*업무시간 설정*/
	    for(var j=0; j<Options.workStartTime; j++){
	      $('#'+j+'g'+option).addClass('greytimegraph')
	    }
	    for(var t=Options.workEndTime; t<24; t++){
	      $('#'+t+'g'+option).addClass('greytimegraph')
	    }
	    /*업무시간 설정*/
	  }
	  
	  /*업무시간 설정*/

	  //timeGraphLimitSet(Options.limit)
	}

    function timeGraphLimitSet(limit){  //회원달력 전용 timeGraphLimitSet 함수 
        var selecteddatearry = $('#popup_info4').text().replace(/년 |월 |일 |:| /gi,"_").split("_")
        var yy_ = selecteddatearry[0];
        var mm_ = selecteddatearry[1];
        var dd_ = selecteddatearry[2];
        if(mm_.length<2){
        	var mm_ = '0'+mm_
        }
        if(dd_.length<2){
        	var dd_ = '0'+dd_
        }
        var selecteddate = yy_+mm_+dd_
        var date = new Date();
        var yy = date.getFullYear();
        var mm = String(date.getMonth()+1);
        if(mm.length<2){
          var mm = '0'+mm
        }
        var dd = String(date.getDate());
        if(dd.length<2){
          var dd = '0'+dd
        }
        var hh = date.getHours();
        var today = yy+mm+dd
        if(selecteddate>today && selecteddate < Number(today)+parseInt(limit/24)){
          for(var i=0;i<=23;i++){
            var time = $('#'+i+'g')
              time.addClass('greytimegraph')
          }
        }else if(selecteddate==today){
        	for(var i=0;i<=23;i++){
            var time = $('#'+i+'g')
            if(i<=hh+limit){
              time.addClass('greytimegraph')
            }
          }
        }

    }

    function startTimeArraySet(option){ //offAddOkArray 채우기 : 시작시간 리스트 채우기  회원용!!!!
	  switch(option){
	    case "class" :
	    var option = ""
	    break;
	    case "mini" :
	    var option = "_mini"
	    break;
	  }
	  offAddOkArray = []
	  //if(Number(classHourArray[0]) == 60){
	  if(Options.classDur == 60){
	    for(i=Options.workStartTime;i<Options.workEndTime;i++){
	      if(!$('#'+i+'g_00'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_00'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph_greyleft') == true){
	        if(!$('#'+i+'g_30'+option).hasClass('pinktimegraph') && !$('#'+i+'g_30'+option).hasClass('greytimegraph') && !$('#'+i+'g_30'+option).hasClass('pinktimegraph_pinkleft') && !$('#'+i+'g_30'+option).hasClass('greytimegraph_greyleft'))
	        offAddOkArray.push(i);
	      }
	      if(!$('#'+i+'g_30'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_30'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph_greyleft') == true){
	        if($('#'+(i+1)+'g_00'+option).hasClass('pinktimegraph') == true || $('#'+(i+1)+'g_00'+option).hasClass('greytimegraph') == true || $('#'+(i+1)+'g_00'+option).hasClass('pinktimegraph_pinkleft') == true || $('#'+(i+1)+'g_00'+option).hasClass('greytimegraph_greyleft') == true){
	          //
	        }else{
	        	if(i+1 < Options.workEndTime){
	        		//offAddOkArray.push(i+0.5)
	        	}
	          
	        }
	      }
	    }
	  //}else if(Number(classHourArray[0]) == 30){
	  }else if(Options.classDur == 30){
	    for(i=Options.workStartTime;i<Options.workEndTime;i++){
	      if(!$('#'+i+'g_00'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_00'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph_greyleft') == true){
	        offAddOkArray.push(i);
	      }
	      if(!$('#'+i+'g_30'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_30'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph_greyleft') == true){
	        offAddOkArray.push(i+0.5)
	      }
	    }
	  }
	  console.log(offAddOkArray)
	}




	function startTimeSet(option){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21]
	  startTimeArraySet(option); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
	  switch(option){
	    case "class":
	      var options = ""
	    break;
	    case "mini":
	      var options = "_mini"
	    break;
	  }
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

	  //offAddOkArray =  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12.5, 13, 14, 18.5, 20, 21, 22, 23]
	  var offOkLen = offAddOkArray.length
	  var startTimeList = $('#starttimes'+options);
	  var timeArray = [];
	  for(var i=0; i<offOkLen; i++){
	    var offHour = parseInt(offAddOkArray[i]); 
	    var offmin = (offAddOkArray[i]%parseInt(offAddOkArray[i]))*60 // 0 or 30
	    if(offmin == 0 || isNaN(offmin) == true){ //isNaN은 0시 일때 0%0이 NaN으로 나오기 때문에.
	      var offmin = "00"
	    }
	    if(offAddOkArray[i]== 0.5){
	      var offmin = "30"
	    }
	    if(offHour<12){
	      var offText = text1 //오전
	      var offHours = offHour;
	    }else if(offHour==24){
	      var offText = text1
	      var offHours = offHour-12
	    }else if(offHour==12 || offHour==12.5){
	      var offText = text2 //오후
	      var offHours = offHour
	    }else{
	      var offHours = offHour-12
	      var offText = text2
	    }

	    if(Number(offHour) < 10){
	      timeArray[i] ='<li><a data-trainingtime="'+'0'+offHour+':'+offmin+':00.000000" class="pointerList">'+offText+offHours+':'+offmin+'</a></li>' //text3 = :00
	    }else{
	      timeArray[i] ='<li><a data-trainingtime="'+offHour+':'+offmin+':00.000000" class="pointerList">'+offText+offHours+':'+offmin+'</a></li>'
	    }
	  }
	  timeArray[offOkLen]='<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>'
	  var timeArraySum = timeArray.join('')
	  startTimeList.html(timeArraySum)
	}


    function durTimeSet(selectedTime){ // durAddOkArray 채우기 : 진행 시간 리스트 채우기
        var len = offAddOkArray.length;
        var durTimeList = $('#durations')
        var index = offAddOkArray.indexOf(Number(selectedTime));
        var substr = offAddOkArray[index+1]-offAddOkArray[index];
        console.log(index)
        console.log(substr)
        if(substr>1){
          durTimeList.html('<li><a data-dur="1" class="pointerList">1시간</a></li>')
          console.log(index)
        }else{
          durTimeList.html('')
          for(var j=index; j<=len; j++){
            if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>') 
            }else if(offAddOkArray[j-1]== null && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]>=2){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
              break;
            }else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
              //break;
            }else if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }else if(offAddOkArray[j-1]==null && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }
          }
        }
    }

    function addGraphIndicator(datadur){
	  $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
	  var starttext = $('#starttimesSelected button').val().split(' ');  //오후 11:30
	  var daymorning = starttext[0];
	  var starthour = starttext[1].split(':')[0]
	  var startmin = starttext[1].split(':')[1]
	  if(startmin == "30"){
	    var start = Number(starthour)+0.5
	  }else if(startmin == "00"){
	    var start = Number(starthour)
	  }

	  if(daymorning=='오후'||daymorning=='午後'||daymorning=='PM'){
	    if(starthour==12){
	      var starthour = starthour
	    }else{
	      var starthour = Number(starthour)+12  
	    }
	  }else if((daymorning=='오전'||daymorning=='午前'||daymorning=='AM' )&& starthour==12){
	      var starthour = Number(starthour)+12 
	  }

	  var min = startmin
	  var time = Number(starthour)
	  if(Options.classDur == 30){
	    for(var i=0; i<datadur; i++){
	      if(min == 60){
	        var min = '00'
	        var time = time +1
	      }
	      if(i==starthour){
	        $('#'+time+'g_'+min).addClass('graphindicator_leftborder')
	      }else{
	        $('#'+time+'g_'+min).addClass('graphindicator_leftborder')
	      }
	      min = Number(min)+30
	    }
	  }else if(Options.classDur == 60){
	    for(var i=0; i<datadur*2; i++){
	      if(min == 60){
	        var min = '00'
	        var time = time +1
	      }
	      if(i==starthour){
	        $('#'+time+'g_'+min).addClass('graphindicator_leftborder')
	      }else{
	        $('#'+time+'g_'+min).addClass('graphindicator_leftborder')
	      }
	      min = Number(min)+30
	    }
	  }
	  


	  /*
	  var length = parseInt(durTime)
	  if(length == 0){
	    var length = 1;
	  }
	  //for(var j=0; j<length; j++){  // 1_30_1.5
	      var time = Number(targetTime)
	      var min =targetMin
	      for(k=0; k<durTime/0.5; k++){
	            if(min == 60){
	            var min = '00'
	            var time = time +1
	          }
	          if(k==0){
	            $('#'+(time)+'g_'+min+option).addClass(cssClass)
	          }else{
	            $('#'+(time)+'g_'+min+option).addClass(cssClass_border)
	          }
	          
	          min = Number(min)+30
	      }  
	  */

	}


});//document(ready)





var date = new Date();
var currentYear = date.getFullYear(); //현재 년도
var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
var currentDate = date.getDate(); //오늘 날짜
var currentHour = date.getHours(); //현재시간
var lastDay = new Array(31,28,31,30,31,30,31,31,30,31,30,31);      //각 달의 일수
var currentPageMonth = currentMonth+1; //현재 달
var date2 = new Date();
var oriYear = date.getFullYear();
var oriMonth = date.getMonth()+1;
var oriDate = date.getDate();

var availableStartTime = Options.stoptimeStart; //강사가 설정한 예약시작 시간 (시작)
var availableEndTime = Options.stoptimeEnd; //강사가 설정한 예약마감 시간 (종료)
var reserveOption = Options.reserve

function ajaxClassTime(referencedate, howmanydates){
	if(referencedate == "this"){
		var yyyy = $('#yearText').text()
		var mm = $('#monthText').text().replace(/월/gi,"")
		if(mm.length<2){
			var mm = '0' + mm
		}
		var today_form = yyyy+'-'+ mm +'-'+"01"
		var date_form = 46
	}else{
		var today_form = referencedate
		var date_form = howmanydates
	}
	
	$.ajax({
	  url: '/trainee/read_trainee_schedule_ajax/',
	  type : 'POST',
	  data : {"date":today_form, "day":date_form},
	  dataType : 'html',

	  beforeSend:function(){
		beforeSend();
	  },

	  success:function(data){
		var jsondata = JSON.parse(data);
		initialJSON = jsondata
		console.log(jsondata)
		if(jsondata.messageArray.length>0){
			$('#errorMessageBar').show()
			$('#errorMessageText').text(jsondata.messageArray)
		}else{
			$('#countRemainData span').text(jsondata.lecture_avail_count)
			$('.classTime,.offTime').parent().html('<div></div>')
			$('.blackballoon, .balloon').html('')
			$('.blackballoon').removeClass('blackballoon')
			$('.balloon').removeClass('balloon')
			$('.dateMytime').removeClass('dateMytime')
			$('.memo, .greymemo').text('').removeClass('greymemo')
			classDates(jsondata)
		}

	  },

	  complete:function(){
		completeSend();
	  },

	  error:function(){
		console.log('server error')
	  }
	})
}

function classDates(jsondata){ //나의 PT 날짜를 DB로부터 받아서 mytimeDates 배열에 넣으면, 날짜 핑크 표시
	$('div._classTime').html('')
	var len = jsondata.classTimeArray_start_date.length;
	for(var i=0; i<len; i++){
		var finish = jsondata.scheduleFinishArray[i]
		var memo = jsondata.scheduleNoteArray[i]


		var classDate = date_format_yyyy_mm_dd_to_yyyy_m_d(jsondata.classTimeArray_start_date[i].split(' ')[0], '_')
		var arr = classDate.split('_')
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

		var classTime = jsondata.classTimeArray_start_date[i].split(' ')[1].substr(0,5)
		if(classTime == "24:00"){
			var classTime = "00:00"
		}

		if(jsondata.group_schedule_start_datetime.indexOf(jsondata.classTimeArray_start_date[i]) == -1){
			var groupname = " - [1:1 레슨]"
		}else{
			var index = jsondata.group_schedule_start_datetime.indexOf(jsondata.classTimeArray_start_date[i])
			var groupname = " - ["+jsondata.group_schedule_group_name[index]+"]"
		}

		if(finish == '1'){
			var finishImg = '<div><span>'+classTime+groupname+'</span><img src="/static/user/res/btn-pt-complete.png"></div>'
		}else if(finish == '0'){
			var finishImg = '<div><span>'+classTime+groupname+'</span></div>'
		}

		if(yy+mm+dd < oriYear+omm+odd){  // 지난 일정은 회색으로, 앞으로 일정은 핑크색으로 표기
			console.log($("td[data-date="+classDate+"]").attr('data-countnum'))
			if($("td[data-date="+classDate+"]").attr('data-countnum') == undefined){
				var countnum = 0
			}else{
				var countnum = Number($("td[data-date="+classDate+"]").attr('data-countnum'))
			}
			plancount =  countnum + 1;

			$("td[data-date="+classDate+"]").attr({'schedule-id':scheduleIdArray[i],'data-countnum':plancount})
			$("td[data-date="+classDate+"]").attr('data-schedule-check',scheduleFinishArray[i])
			$("td[data-date="+classDate+"] div._classDate").addClass('greydateMytime')
			if($("td[data-date="+classDate+"] div._classTime div").length <3){
				$("td[data-date="+classDate+"] div._classTime").addClass('balloon').append(finishImg)
			}else{
				$("td[data-date="+classDate+"] div._classTime").append('<div><span>…</span></div>')
			}
			
			//$("td[data-date="+classDate+"] div.memo").addClass('greymemo').text(memo)
		}else{
			console.log($("td[data-date="+classDate+"]").attr('data-countnum'))
			if($("td[data-date="+classDate+"]").attr('data-countnum') == undefined){
				var countnum = 0
			}else{
				var countnum = Number($("td[data-date="+classDate+"]").attr('data-countnum'))
			}
			plancount =  countnum + 1;
			$("td[data-date="+classDate+"]").attr({'schedule-id':scheduleIdArray[i],'data-countnum':plancount})
			$("td[data-date="+classDate+"]").attr('data-schedule-check',scheduleFinishArray[i])
			$("td[data-date="+classDate+"] div._classDate").addClass('dateMytime')
			if($("td[data-date="+classDate+"] div._classTime div").length <3){
				$("td[data-date="+classDate+"] div._classTime").addClass('blackballoon').append(finishImg)
			}else{
				$("td[data-date="+classDate+"] div._classTime").append('<div><span>…</span></div>')
			}
			//$("td[data-date="+classDate+"] div.memo").text(memo)
		}
		
	};
};



function beforeSend(){
	$('html').css("cursor","wait");
	$('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
	$('.ajaxloadingPC').show();
}

function completeSend(){
	$('html').css("cursor","auto");
	$('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
	$('.ajaxloadingPC').hide();
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

