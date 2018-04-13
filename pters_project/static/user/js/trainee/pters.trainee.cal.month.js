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

	$(document).on('click','.admonth',function(){
		alert('까꿍~')
	})


	$(document).on('click','td',function(){   //날짜에 클릭 이벤트 생성
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
				console.log('if디버깅:',info2[0],currentHour,Options.cancellimit)
			}else{
				var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')'
				var infoText2 = info2[0]+"시 예약 취소 하시겠습니까?"
				$('#popup_info').text(infoText)
				$('#popup_info2').text(infoText2)
				$("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
				console.log('else디버깅:',info2[0],currentHour,Options.cancellimit)
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
        var selected_start_time = Number($('td.graphindicator').attr('id').replace(/g/gi,""))
        $('.cancellimit_time').text(Options.cancellimit+"시간 전("+(selected_start_time-Options.cancellimit)+":00)")
    })

    function check_dropdown_selected(){ // 회원이 PT 예약시 시간, 진행시간을 선택했을때 분홍색으로 버튼 활성화 
   		var durSelect = $("#durationsSelected button");
       	var startSelect = $("#starttimesSelected button")
    	if((startSelect).hasClass("dropdown_selected")==true){
       	    $("#submitBtn").addClass('submitBtnActivated');
           	select_all_check=true;
       	}else{
       	    select_all_check=false;
    	}
    }

    $("#submitBtn").click(function(){
        if(select_all_check==true){
            //document.getElementById('pt-add-form').submit();
        	send_reservation()
        }else{
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
	          	//AjaxBeforeSend();
	          },

	          success:function(data){
	          	var jsondata = JSON.parse(data);
	          	console.log(data)
	          	if(jsondata.messageArray.length>0){
	              	$('#errorMessageBar').show()
	              	$('#errorMessageText').text(jsondata.messageArray)
	            }else{
					for (var i=0; i<jsondata.pushArray.length; i++){
						send_push(jsondata.push_server_id, jsondata.pushArray[i], jsondata.push_info[0]);
					}
					ajaxClassTime();
					close_reserve_popup()
	            }
	            
			  },

	          complete:function(){
	          	
	          },

	          error:function(){
	            console.log('server error')
	          }
        })
    }

	function send_push(push_server_id, intance_id, message){

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
					"sound": "default"
            	}
            }),

          beforeSend:function(){
          	console.log('test_ajax')
          	AjaxBeforeSend();
          },

          success:function(response){
			  console.log(response);
          },

          complete:function(){
          	AjaxCompleteSend();
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
			$("#cal_popup").hide().css({'z-index':'-2'})
			$("#cal_popup3").fadeIn('fast').css({'z-index':'103'});
			$('#shade2').css({'display':'block'});
		}
	})

	$('#popup_text3').click(function(){
		//document.getElementById('pt-delete-form').submit();
		send_delete()
	})

	function send_delete(){
		$.ajax({
	          url: '/trainee/pt_delete_logic/',
	          data: $('#pt-delete-form').serialize(),
			  dataType : 'html',
			  type:'POST',

	          beforeSend:function(){
	          	//AjaxBeforeSend();
	          },

	          success:function(data){
	          	var jsondata = JSON.parse(data);
	          	if(jsondata.messageArray.length>0){
	              	$('#errorMessageBar').show()
	              	$('#errorMessageText').text(jsondata.messageArray)
	            }else{
					for (var i=0; i<=jsondata.pushArray.length; i++){
						send_push(jsondata.push_server_id, jsondata.pushArray[i], jsondata.push_info[0]);
					}
					ajaxClassTime();
					close_delete_confirm_popup()
	            }
	            
			  },

	          complete:function(){
	          	
	          },

	          error:function(){
	            console.log('server error')
	          }
        })
	}


	$("#btn_close").click(function(){  //일정삭제 팝업 X버튼 눌렀을때 팝업 닫기
			if($('#cal_popup').css('display')=='block'){
				$("#cal_popup").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
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
				$("#cal_popup3").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
		}
	}

	$('#popup_text4').click(function(){ //일정삭제 확인 팝업 취소버튼 눌렀을때 팝업 닫기
			if($('#cal_popup3').css('display')=='block'){
				$("#cal_popup3").css({'display':'none','z-index':'-2'})
				$('#shade2').css({'display':'none'});
			}
	})


	$("#btn_close4").click(function(){ //일정예약 상세화면 팝업 X버튼 눌렀을때 팝업 닫기
		close_reserve_popup()
	})

	function close_reserve_popup(){
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

	DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateArray,'member',classStartArray)

	alltdRelative(); //모든 td의 스타일 position을 relative로
	//dateDisabled(); //PT 불가 일정에 회색 동그라미 표시
	classDates(); //나의 PT일정에 핑크색 동그라미 표시
	monthText(); //상단에 연, 월 표시
	availableDateIndicator(availableStartTime,availableEndTime);
	krHoliday(); //대한민국 공휴일

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
			//dateDisabled();
			classDates();
			monthText();
			krHoliday();
			availableDateIndicator(availableStartTime,availableEndTime);
			ajaxClassTime()
			myswiper.update(); //슬라이드 업데이트

		},

		'prepend' : function(){
			myswiper.removeSlide(2);
			myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
			//(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
			calTable_Set(1,currentYear,currentPageMonth-1);
			alltdRelative();		
			//dateDisabled();
			classDates();
			monthText();
			krHoliday();
			availableDateIndicator(availableStartTime,availableEndTime);
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

	function dateDisabled(){ //PT 불가일자를 DB로부터 받아서 disabledDates 배열에 넣으면, 날짜 회색 표시
		for(var i=0; i<disabledDates.length; i++){
			$("td[data-date="+disabledDates[i]+"] div").addClass('dateDisabled');
		};
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

	//일정변경 가능 날짜에 표기 (CSS Class 붙이기)
	function availableDateIndicator(availableStartTime,Endtime){ 
		// 요소설명
		// availableStartTime : 강사가 설정한 '회원이 예약 가능한 시간대 시작시간'
		// availableStartTime : 강사가 설정한 '회원이 예약 가능한 시간대 마감시간'
		if(Options.reserve == 1){
			$('td:not([schedule-id])').addClass('option_notavailable')
			$('.blackballoon').parent('td').addClass('option_notavailable')
		}else{
			if(currentHour<Endtime && currentHour>=availableStartTime){
				for(i=currentDate;i<currentDate+Options.availDate;i++){
					if(i>lastDay[oriMonth-1] && oriMonth<12){
					 	$('td[data-date='+oriYear+'_'+(oriMonth+1)+'_'+(i-lastDay[oriMonth-1])+']').addClass('available')
					}else if(i>lastDay[oriMonth-1] && oriMonth==12){
						$('td[data-date='+(oriYear+1)+'_'+(oriMonth-11)+'_'+(i-lastDay[oriMonth-1])+']').addClass('available')
					}else{
					 	$('td[data-date='+oriYear+'_'+oriMonth+'_'+i+']').addClass('available')
					}
				}
			}else{
				for(i=currentDate;i<currentDate+Options.availDate;i++){
					if(i>lastDay[oriMonth-1] && oriMonth<12){
					 	$('td[data-date='+oriYear+'_'+(oriMonth+1)+'_'+(i-lastDay[oriMonth-1])+']').addClass('notavailable')
					}else if(i>lastDay[oriMonth-1] && oriMonth==12){
						$('td[data-date='+(oriYear+1)+'_'+(oriMonth-11)+'_'+(i-lastDay[oriMonth-1])+']').addClass('notavailable')
					}else{
					 	$('td[data-date='+oriYear+'_'+oriMonth+'_'+i+']').addClass('notavailable')	
					}
				}
			}	
		}
	}

	function ad_month(selector){ // 월간 달력 하단에 광고
		selector.html('<img src="/static/user/res/PTERS_logo.jpg" alt="logo" class="admonth">').css({'text-align':'center'})
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
	          		/*팝업의 timegraph 업데이트*/
	                var updatedClassTimeArray_start_date = jsondata.classTimeArray_start_date
	                var updatedClassTimeArray_end_date = jsondata.classTimeArray_end_date
	                var updatedOffTimeArray_start_date = jsondata.offTimeArray_start_date
	                var updatedOffTimeArray_end_date = jsondata.offTimeArray_end_date
	                classDateData = []
	                classTimeData = []
	                offDateData=[]
	                offTimeData = []
	                offAddOkArray = [] //OFF 등록 시작 시간 리스트
	                durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트
	                DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateData,"graph",classTimeData)
	                DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offDateData,"graph",offTimeData)
	                timeGraphSet("class","grey", "AddClass");  //시간 테이블 채우기
			        timeGraphSet("off","grey", "AddClass")
	                startTimeSet();  //일정등록 가능한 시작시간 리스트 채우기
	          	}
                
              },

              complete:function(){
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


	function startTimeSet(){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21];
        startTimeArraySet(); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
        var offOkLen = offAddOkArray.length
        var startTimeList = $('#starttimes');
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
        var timeArraySum = timeArray.join('')
        startTimeList.html(timeArraySum)
        console.log(offAddOkArray)
    }


    function timeGraphSet(option, CSStheme, Page){ //가능 시간 그래프 채우기
        //1. option인자 : "class", "off"
        //2. CSS테마인자 : "grey", "pink"

        switch(option){
          case "class" :
          var DateDataArray = classDateData;
          var TimeDataArray = classTimeData;
          $('.tdgraph').removeClass('greytimegraph').removeClass('pinktimegraph')  
          break;
          case "off" :
          var DateDataArray = offDateData;
          var TimeDataArray = offTimeData;
          break;
        }

        switch(CSStheme){
          case "grey" :
          var cssClass = "greytimegraph"
          break;
          case "pink" :
          var cssClass= "pinktimegraph"
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
        //var date = $("#datepicker").val(); 공용
        var dateArry = $('#popup_info4').text().replace(/년 |월 |일 |일정 추가|:| /gi,"_").split('_') //회원 월간일정 전용 
        var monthD= dateArry[1]
        var dateD = dateArry[2]

        if(monthD.length==1){
          var monthD = '0'+dateArry[1]
        }
        if(dateD.length==1){
          var dateD = '0'+dateArry[2]
        }
        var date = dateArry[0]+'-'+monthD+'-'+dateD
        var Arraylength = DateDataArray.length;
        for(var i=0;i<Arraylength;i++){
          var splitTimeArray = TimeDataArray[i].split("_")
          var targetTime = splitTimeArray[0]
          if(targetTime == 24){
          	var targetTime = 0
          }
          var durTime = splitTimeArray[2]
          console.log(DateDataArray[i],date)
          if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime>1){  //수업시간이 2시간 이상일때 칸 채우기
              for(var j=0; j<durTime; j++){
                var time = Number(targetTime)+j
                $('#'+(time)+'g').addClass(cssClass)
              }
          }else if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime==1){ //수업시간이 1시간짜리일때 칸 채우기
              $('#'+targetTime+'g').addClass(cssClass)
          }
        }

        /*업무시간 설정*/
        for(var j=0; j<Options.workStartTime; j++){
          $('#'+j+'g'+option).addClass('greytimegraph')
        }
        for(var t=Options.workEndTime; t<24; t++){
          $('#'+t+'g'+option).addClass('greytimegraph')
        }
        /*업무시간 설정*/


        timeGraphLimitSet(Options.limit)
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



    function startTimeArraySet(){ //offAddOkArray 채우기 : 시작시간 리스트 채우기
        offAddOkArray = []
        for(i=0;i<=23;i++){
          if(!$('#'+i+'g').hasClass('pinktimegraph') == true && !$('#'+i+'g').hasClass('greytimegraph') == true){
            offAddOkArray.push(i);
          }
        }
        console.log(offAddOkArray)
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
        $('.tdgraph').removeClass('graphindicator');
        var starttext = $('#starttimesSelected button').val().split(' ');
        var daymorning = starttext[0];
        var startnum = starttext[1].replace(/시/gi,"")
        if(daymorning=='오후'){
          if(startnum==12){
            var startnum = startnum
          }else{
            var startnum = Number(startnum)+12  
          }
        }else if(daymorning=='오전' && startnum==12){
            var startnum = Number(startnum)+12 
        }
        var durnum = datadur
        console.log(durnum)
        var finnum = Number(startnum)+Number(durnum)
        console.log(startnum, durnum,finnum)
        for(var i=startnum; i<finnum; i++){
          $('#'+i+'g').addClass('graphindicator')
        }
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

function ajaxClassTime(){

	var yyyy = $('#yearText').text()
	var mm = $('#monthText').text().replace(/월/gi,"")
	if(mm.length<2){
		var mm = '0' + mm
	}
	var today_form = yyyy+'-'+ mm +'-'+"01"

	$.ajax({
	  url: '/trainee/read_trainee_schedule_ajax/',
	  type : 'POST',
	  data : {"date":today_form, "day":46},
	  dataType : 'html',

	  beforeSend:function(){
		AjaxBeforeSend();
	  },

	  success:function(data){
		var jsondata = JSON.parse(data);
		if(jsondata.messageArray.length>0){
			$('#errorMessageBar').show()
			$('#errorMessageText').text(jsondata.messageArray)
		}else{
			classTimeArray_start_date = []
			classTimeArray_end_date = []
			scheduleIdArray = []
			scheduleFinishArray = []
			scheduleNoteArray = []
			classTimeArray_member_name = []
			offTimeArray_start_date = []
			offTimeArray_end_date = []
			classDateArray = []
			classStartArray = []


			classTimeArray_start_date = jsondata.classTimeArray_start_date
			classTimeArray_end_date = jsondata.classTimeArray_end_date
			classTimeArray_start_date = jsondata.classTimeArray_start_date
			classTimeArray_end_date = jsondata.classTimeArray_end_date
			scheduleIdArray = jsondata.scheduleIdArray
			scheduleFinishArray = jsondata.scheduleFinishArray
			scheduleNoteArray = jsondata.scheduleNoteArray
			classTimeArray_member_name = jsondata.classTimeArray_member_name
			offTimeArray_start_date = jsondata.offTimeArray_start_date
			offTimeArray_end_date = jsondata.offTimeArray_end_date

			$('#countRemainData span').text(jsondata.lecture_avail_count)

			DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateArray,'member',classStartArray)
			$('.classTime,.offTime').parent().html('<div></div>')
			$('.blackballoon, .balloon').html('')
			$('.blackballoon').removeClass('blackballoon')
			$('.balloon').removeClass('balloon')
			$('.dateMytime').removeClass('dateMytime')
			$('.memo, .greymemo').text('').removeClass('greymemo')
			classDates()
		}

	  },

	  complete:function(){
		AjaxCompleteSend();
	  },

	  error:function(){
		console.log('server error')
	  }
	})
}

function classDates(){ //나의 PT 날짜를 DB로부터 받아서 mytimeDates 배열에 넣으면, 날짜 핑크 표시
	console.log(classDateArray)
	for(var i=0; i<classDateArray.length; i++){
		var finish = scheduleFinishArray[i]
		var memo = scheduleNoteArray[i]
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

		var classTime = classStartArray[i]
		if(classTime == "24:00"){
			var classTime = "00:00"
		}

		if(finish == '1'){
			var finishImg = '<span>'+classTime+'</span><img src="/static/user/res/btn-pt-complete.png">'
		}else if(finish == '0'){
			var finishImg = '<span>'+classTime+'</span>'
		}

		if(yy+mm+dd < oriYear+omm+odd){  // 지난 일정은 회색으로, 앞으로 일정은 핑크색으로 표기
			$("td[data-date="+classDateArray[i]+"]").attr('schedule-id',scheduleIdArray[i])
			$("td[data-date="+classDateArray[i]+"]").attr('data-schedule-check',scheduleFinishArray[i])
			$("td[data-date="+classDateArray[i]+"] div._classDate").addClass('greydateMytime')
			$("td[data-date="+classDateArray[i]+"] div._classTime").addClass('balloon').html(finishImg)
			$("td[data-date="+classDateArray[i]+"] div.memo").addClass('greymemo').text(memo)
		}else{
			$("td[data-date="+classDateArray[i]+"]").attr('schedule-id',scheduleIdArray[i])
			$("td[data-date="+classDateArray[i]+"]").attr('data-schedule-check',scheduleFinishArray[i])
			$("td[data-date="+classDateArray[i]+"] div._classDate").addClass('dateMytime')
			$("td[data-date="+classDateArray[i]+"] div._classTime").addClass('blackballoon').html(finishImg)
			$("td[data-date="+classDateArray[i]+"] div.memo").text(memo)
		}
	};
};


function AjaxBeforeSend(){
	$('html').css("cursor","wait");
	$('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
	$('.ajaxloadingPC').show();
}

function AjaxCompleteSend(){
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

