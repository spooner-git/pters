/*달력 만들기
 1. 각달의 일수를 리스트로 만들어 둔다.
 [31,28,31,30,31,30,31,31,30,31,30,31]
 2. 4년마다 2월 윤달(29일)
 year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
 3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1
 */
$(document).ready(function(){
    var reg_check = 0;
    var click_check = 0;
    //get_trainee_reg_history()

    $(document).keyup(function(e){
        if(e.keyCode == 27){
            close_cal_popup()
            close_reserve_popup()
            close_class_select_popup()
            close_info_popup('cal_popup_plancheck')
        }
    })



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
        if(!$(this).hasClass('disabled_button')){
            var page = $(this).attr('data-page')
            if(page == "personalreserve"){
                $('.'+page).show();
                // //$('.'+page).show();
                // $('#timeGraph').show();
                $('.groupreserve, .classreserve').hide();
                $('._userchecked').removeClass('checked ptersCheckboxInner');

                $('.timegraphtext').html('<div style="width:100%;"><img src="/static/user/res/ajax/loading.gif" style="height:23px;marign:auto;"></div>');
                ajaxTimeGraphSet($('#dateInfo'))
            }else if(page == "groupreserve"){
                $('.'+page).show()
                $('.personalreserve, .classreserve').hide()
            }else if(page == "classreserve"){
                $('.'+page).show()
                $('.personalreserve, .groupreserve').hide()
            }
            $(this).addClass('mode_active')
            $(this).siblings('.mode_switch_button').removeClass('mode_active')
            clear_pt_add_logic_form()
            check_dropdown_selected()
        }

    })

    function clear_pt_add_logic_form(){
        $('#timeGraph td').removeClass('graphindicator_leftborder')
        $("#starttimesSelected .btn:first-child").val('').html('선택<span class="caret"></span>')
        $('#id_group_schedule_id').val('')
        $('#id_time_duration').val('')
        $('#id_training_time').val('')
    }

    // 그룹 일정 선택
    $(document).on('click','#groupTimeSelect .ptersCheckbox',function(){
        if(!$(this).hasClass('disabled_button')){
            $('#id_group_schedule_id').val($(this).attr('group-schedule-id'))
            $('#id_training_time').val($(this).attr('data-time'))
            $('#id_training_end_time').val($(this).attr('data-endtime'))
            $('#id_time_duration').val($(this).attr('data-dur'))


            $('#groupTimeSelect div.checked').removeClass('checked ptersCheckboxInner');
            var pterscheckbox = $(this).find('div');
            $(this).addClass('checked _userchecked');
            pterscheckbox.addClass('ptersCheckboxInner checked _userchecked');
            check_dropdown_selected();
        }
    });
    // 클래스 일정 선택
    $(document).on('click','#classTimeSelect .ptersCheckbox',function(){
        if(!$(this).hasClass('disabled_button')){
            $('#id_group_schedule_id').val($(this).attr('group-schedule-id'))
            $('#id_training_time').val($(this).attr('data-time'))
            $('#id_training_end_time').val($(this).attr('data-endtime'))
            $('#id_time_duration').val($(this).attr('data-dur'))


            $('#classTimeSelect div.checked').removeClass('checked ptersCheckboxInner');
            var pterscheckbox = $(this).find('div');
            $(this).addClass('checked _userchecked');
            pterscheckbox.addClass('ptersCheckboxInner checked _userchecked');
            check_dropdown_selected();
        }
    });

    $(document).on('click','.admonth',function(){
        get_trainee_participate_group()
    });


    $(document).on('click','td',function(){
        var info = $(this).attr('data-date').split('_')
        var yy=info[0]
        var mm=info[1]
        var dd=info[2]
        var dayobj = new Date(yy,mm-1,dd)
        var dayraw = dayobj.getDay();
        var dayarry = ['일','월','화','수','목','금','토']
        var day = dayarry[dayraw];
        var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')'
        clicked_td_date_info = yy+'_'+mm+'_'+dd
        click_check = 0;
        // var time_graph_val = $('#timeGraph');
        // var htmlTojoin = [];
        // htmlTojoin.push('<div class="ptaddboxtext" style="margin-top: 10px;margin-bottom:4px;">예약 가능 시간');
        // htmlTojoin.push('<div class="tdgraph" style="display: inline-block;margin-bottom:1px;margin-left:3px;width:17px;height:9px;border:1px solid #cccccc;background: #ffffff;"></div>');
        // htmlTojoin.push('</div>');
        // htmlTojoin.push('<div class="timegraphtext">');
        // htmlTojoin.push('</div>');
        // htmlTojoin.push('<p style="margin-top:10px;margin-bottom:0;font-size:13px;">- <span class="timeDur_time" style="color:#fe4e65;"></span> 단위로 예약 할 수 있습니다.</p>');
        // htmlTojoin.push('<p style="margin-top:0px;margin-bottom:0;font-size:13px;">- <span class="startTime_time" style="color:#fe4e65;"></span> 예약 할 수 있습니다.</p>');
        // htmlTojoin.push('<p style="margin-top:0px;font-size:13px;">- <span class="cancellimit_time" style="color:#fe4e65;"></span>까지 취소 할 수 있습니다.</p>');
        // time_graph_val.html(htmlTojoin.join(''));

        if(!$(this).hasClass('prevDates') && !$(this).hasClass('nextDates')){
            if($(this).hasClass('notavailable') && !$(this).find('div').hasClass('dateMytime')){
                $('#shade2').css({'display':'block'});
                $('#ng_popup_text').html('<p>현재시간은 일정 예약변경이 불가한 시간입니다.</p><p style="color:#fe4e65;font-size=13px;">예약변경 가능 시간대<br> '+availableStartTime+'시 ~ '+availableEndTime+'시</p>')
                $('#ng_popup').fadeIn(500,function(){ // 팝업[일정은 오늘 날짜 기준 2주앞만 설정 가능합니다.]
                    //$(this).fadeOut(5000)
                })
            }else if($(this).hasClass('notavailable') && $(this).find('div').hasClass('dateMytime')){
                $('.popup_ymdText').html(infoText).attr('data-date',$(this).attr('data-date'))
                $('.cancellimit_time').text(Options.cancellimit+"시간 전")
                $('.timeDur_time').text(duration_number_to_hangul(Options.timeDur*(Options.classDur/60)))
                $('.startTime_time').text(startTime_to_hangul(Options.startTime))
                plancheck(yy+'_'+mm+'_'+dd, initialJSON)
                $('.plan_raw_add').hide()
                shade_index(100)
                 popup_locate_center_of_display('#cal_popup_plancheck');
                adjust_starttime_list_height()
            }else if($(this).hasClass('available')){
                $('.popup_ymdText').html(infoText).attr('data-date',$(this).attr('data-date'))
                $('.cancellimit_time').text(Options.cancellimit+"시간 전")
                $('.timeDur_time').text(duration_number_to_hangul(Options.timeDur*(Options.classDur/60)))
                $('.startTime_time').text(startTime_to_hangul(Options.startTime))
                plancheck(yy+'_'+mm+'_'+dd, initialJSON)
                if($('#countRemainData span:first-child').text() == '0'){
                    $('.plan_raw_add').hide()
                }
                else{
                    $('.plan_raw_add').show()
                }
                shade_index(100);
                popup_locate_center_of_display('#cal_popup_plancheck');
                adjust_starttime_list_height();
            }else{
                $('.popup_ymdText').html(infoText).attr('data-date',$(this).attr('data-date'));
                $('.cancellimit_time').text(Options.cancellimit+"시간 전");
                $('.timeDur_time').text(duration_number_to_hangul(Options.timeDur*(Options.classDur/60)));
                $('.startTime_time').text(startTime_to_hangul(Options.startTime));
                plancheck(yy+'_'+mm+'_'+dd, initialJSON);
                $('.plan_raw_add').hide();
                shade_index(100);
                popup_locate_center_of_display('#cal_popup_plancheck');
                adjust_starttime_list_height();
            }/*else{
             shade_index(100)
             $('#ng_popup_text').html('<p>일정은 오늘 날짜 기준</p><p>'+Options.availDate+'일 앞으로만 설정 가능합니다.</p>')
             $('#ng_popup').fadeIn(500,function(){ // 팝업[일정은 오늘 날짜 기준 2주앞만 설정 가능합니다.]
             //$(this).fadeOut(2800)
             })
            }*/
        }
    })

    function adjust_starttime_list_height(){
        var windowHeight = $(window).innerHeight();
        var scrollHeight = $(window).scrollTop();
        var listBottomLocation = $('#submitBtn').offset().top;
        var list_height_to_be = windowHeight + scrollHeight - listBottomLocation - 15;
        if(list_height_to_be > 300){
            list_height_to_be = 300
        }else if(list_height_to_be < 100){
            list_height_to_be = 100;
        }
        $('#starttimes').css('height',list_height_to_be);
    }


    $(document).on('click','.plan_raw',function(){
        shade_index(150)
        $('#popup_planinfo_title').text('레슨 일정')
        if($('body').width()>600){
            $('#popup_btn_complete').css({'color':'#ffffff','background':'#282828'}).val('')
        }else{
            $('#popup_btn_complete').css({'color':'#282828','background':'#ffffff'}).val('')
        }

        var selectedDate = $('.popup_ymdText').text()
        var selectedDateyyyymmdd = date_format_yyyy_m_d_to_yyyymmdd($('.popup_ymdText').attr('data-date'))
        var todayYYYYMMDD = date_format_yyyy_m_d_to_yyyymmdd(String(oriYear)+'_'+String(oriMonth)+'_'+String(oriDate))
        var selectedTime = $(this).find('.planchecktime').text()
        var selectedPerson = '<span class="memberNameForInfoView" data-dbid="'+$(this).attr('data-dbid')+'" data-name="'+$(this).attr('data-membername')+'">'+$(this).find('.plancheckname').text()+'</span>'
        var selectedMemo = $(this).attr('data-memo')
        if($(this).attr('data-memo') == undefined){
            var selectedMemo = ""
        }
        $("#cal_popup").show().attr({'schedule_id':$(this).attr('schedule-id'), 'data-grouptype':$(this).attr('data-grouptype')})
        $('#popup_info3_memo').attr('readonly',true).css({'border':'0'});
        $('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'})
        $('#popup_info').text(selectedDate);
        $('#popup_info2').html(selectedPerson+'<br>'+ selectedTime);
        $('#popup_info3_memo').text(selectedMemo).val(selectedMemo)

        $("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
        $("#id_schedule_id_finish").val($(this).attr('schedule-id')); // shcedule 정보 저장
        $("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
        $("#id_member_name_delete").val($(this).attr('data-memberName')); //회원 이름 저장
        $("#id_member_name_finish").val($(this).attr('data-memberName')); //회원 이름 저장
        $("#id_lecture_id_finish").val($(this).attr('data-lectureId')); //lecture id 정보 저장

        var schedule_finish_check = $(this).attr('data-schedule-check');

        var currentDate = today_YY_MM_DD;
        var limitdate = date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(currentDate, Options.availDate),'');

        // var availableStartTime = Options.stoptimeStart; //강사가 설정한 예약시작 시간 (시작)
        // var availableEndTime = Options.stoptimeEnd; //강사가 설정한 예약마감 시간 (종료)
        // currentHour
        // if(currentHour>Endtime || currentHour<availableStartTime){

        if(schedule_finish_check=="0"){
            $("#popup_btn_complete").show()
            $("#popup_text1").css("display","block")
            $("#popup_sign_img").css("display","none")
            if((selectedDateyyyymmdd < todayYYYYMMDD) || (selectedDateyyyymmdd >= limitdate) || (currentHour>availableEndTime || currentHour<availableStartTime)){
                $("#popup_text1").css("display","none")
            }
        }
        else{
            $("#popup_btn_complete").hide()
            $("#popup_text1").css("display","none")
            $("#popup_sign_img").css("display","block")
            // $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image//spooner_test/'+$(this).attr('schedule-id')+'.png');
            $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('schedule-id')+'.png');
            var myImage = document.getElementById("id_sign_img");
            myImage.onerror = function() {
                //this.src="";
                $("#popup_sign_img").css("display","none");
            };
        };
        schedule_on_off = 1;

        toggleGroupParticipantsList('off')
        $('#subpopup_addByList_plan').hide();
        if($(this).attr('data-grouptype') == "group"){
            $('#popup_btn_viewGroupParticipants').show().attr({'data-membernum': $(this).attr('data-membernum'),
                'data-groupid': $(this).attr('data-groupid'),
                'group-schedule-id':$(this).attr('schedule-id'),
            });
        }else{
            $('#popup_btn_viewGroupParticipants').hide();
        };
    });


    $(document).on('click','.plan_raw_add',function(){
        $('#groupTimeSelect, #classTimeSelect, .timegraphtext').html('<div style="width:100%;"><img src="/static/user/res/ajax/loading.gif" style="height:23px;marign:auto;"></div>');

        clear_pt_add_logic_form();
        $('#addpopup').show();
        //$('#shade2').css({'display':'block'});
        var info3 = $(this).attr('data-date').split('_');
        var yy=info3[0];
        var mm=info3[1];
        var dd=info3[2];
        var dayobj = new Date(yy,mm-1,dd);
        var dayraw = dayobj.getDay();
        var dayarry = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
        var day = dayarry[dayraw];
        var infoText2 = yy+'년 '+ mm+'월 '+ dd+'일 ' + day;
        $('#popup_info4').text(infoText2);
        $('#dateInfo').attr('data-date',yy+'_'+mm+'_'+dd)
        //timeGraphSet("class","grey");  //시간 테이블 채우기
        //timeGraphSet("off","grey")
        //startTimeSet();  //일정등록 가능한 시작시간 리스트 채우기
        ajaxTimeGraphSet($(this));
        $('#id_training_date, #id_training_end_date').val(yy+'-'+mm+'-'+dd);
    });



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
        $(this).parents('.popups').hide()
    })

    var select_all_check = false;
    //달력 선택된 날짜
    //출력 예시 : Fri Sep 08 2017 00:00:00 GMT+0900 (대한민국 표준시)

    $('#starttimesSelected button').click(function(e){
        
        //e.preventDefault();
        if($('#starttimes').find('li').length == 0){
            e.stopPropagation();
            alert('예약 가능한 시간이 없습니다.')
        }else{

        }
    })

    $(document).on('click','#starttimes li a',function(){
        $("#starttimesSelected button").addClass("dropdown_selected");
        $("#starttimesSelected .btn:first-child").text($(this).text());
        $("#starttimesSelected .btn:first-child").val($(this).text());
        $("#id_training_time").val($(this).attr('data-trainingtime'));
        $("#id_training_end_time").val($(this).attr('data-trainingendtime'));
        $("#id_time_duration").val(Options.timeDur);
        var arry = $(this).attr('data-trainingtime').split(':')
        //durTimeSet(arry[0]);
        addGraphIndicator(Options.classDur*Options.timeDur)
        check_dropdown_selected();
        //var selected_start_time = Number($('td.graphindicator_leftborder').attr('id').replace(/g/gi,""))
        var selected_start_time = Number($(this).attr('data-trainingtime').split(':')[0])
        if(Options.cancellimit <= 12){
            var timetext = substract_time($(this).attr('data-trainingtime').split(':')[0]+':'+$(this).attr('data-trainingtime').split(':')[1], Options.cancellimit+':00')
            //$('.cancellimit_time').text(Options.cancellimit+"시간 전 ("+(selected_start_time-Options.cancellimit)+":00)")
            $('.cancellimit_time').text(Options.cancellimit+"시간 전 ("+timetext+")")
        }else{
            $('.cancellimit_time').text(Options.cancellimit+"시간 전")
        }
    })

    function clear_pt_add_logic_form(){
        $('#timeGraph td').removeClass('graphindicator_leftborder')
        $("#starttimesSelected .btn:first-child").val('').html('선택<span class="caret"></span>')
        $('#id_group_schedule_id').val('')
        $('#id_time_duration').val('')
        $('#id_training_time').val('')
    }

    function check_dropdown_selected(){ // 회원이 PT 예약시 시간, 진행시간을 선택했을때 분홍색으로 버튼 활성화
        var durSelect = $("#durationsSelected button");
        var startSelect = $("#starttimesSelected button")

        var form_date = $('#id_training_date')
        var form_time = $('#id_training_time')
        var form_edate = $('#id_training_end_date')
        var form_etime = $('#id_training_end_time')
        var form_dura = $('#id_time_duration')
        var form_group = $('#id_group_schedule_id')

        if(form_date.val() && form_time.val() && form_edate.val() && form_etime.val() && form_dura.val()){
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
        check_dropdown_selected();
        if(select_all_check==true){
            //document.getElementById('pt-add-form').submit();
            if(ajax_block_during_sending_send_reservation == true){
                ajax_block_during_sending_send_reservation = false;
                send_reservation();
            }
        }else{
            alert('시작 시각을 선택 해주세요.');
            //입력값 확인 메시지 출력 가능
        }
    });

    function send_reservation(){
        click_check = 0
        $.ajax({
            url: '/trainee/add_trainee_schedule/',
            data: $('#pt-add-form').serialize(),
            dataType : 'html',
            type:'POST',

            beforeSend:function(){
                beforeSend();
            },

            success:function(data){
                var jsondata = JSON.parse(data);

                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show()
                    $('#errorMessageText').text(jsondata.messageArray)
                }else{
                    if(jsondata.push_class_id.length>0){
                        for(var i=0; i<jsondata.push_class_id.length; i++) {
                            send_push_func(jsondata.push_class_id[i], jsondata.push_title[i], jsondata.push_message[i])
                        }
                    }
                    ajaxClassTime("this", 46, "callback", function(json){
                        plancheck(clicked_td_date_info, json)
                    });
                    close_reserve_popup()
                }
            },

            complete:function(){
                //completeSend()
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
        $('#id_training_end_date').val('') //add
        $('#id_time_duration').val('') //add
        $('#id_training_time').val('') //add
        $('#id_training_end_time').val('') //add
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
    function send_push_func(class_id, title, message){

        $.ajax({
            url: '/schedule/send_push_to_trainer/',
            type : 'POST',
            dataType: 'html',
            data : {"class_id":class_id, "title":title, "message":message, "next_page":'/trainee/get_trainee_error_info/'},

            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
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

    $("#popup_text1").click(function(){  //일정 취소 버튼 클릭
        if($(this).find("span").hasClass('limited')){
            var clicked = date_format_yyyy_m_d_to_yyyymmdd($('#cal_popup').attr('data-date'))
            var today = date_format_yyyy_m_d_to_yyyymmdd(currentYear+'_'+(currentMonth+1)+'_'+currentDate)
            if(clicked < today){
                alert("지난 일정은 취소가 불가합니다.\n담당 강사에게 직접 문의해주세요")
            }else{
                alert("선택한 일정은 취소가 불가합니다.\n \n시작 "+Options.cancellimit+'시간 이내에는 온라인 취소가 불가합니다.\n \n담당 강사에게 직접 문의해주세요')
            }
        }else{
            $("#cal_popup").hide()
            $("#cal_popup3").show();
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
        click_check = 1
        $.ajax({
            url: '/trainee/delete_trainee_schedule/',
            data: $('#pt-delete-form').serialize(),
            dataType : 'html',
            type:'POST',

            beforeSend:function(){
                beforeSend();
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show()
                    $('#errorMessageText').text(jsondata.messageArray)
                }else{
                    if(jsondata.push_class_id.length>0){
                        for(var i=0; i<jsondata.push_class_id.length; i++) {
                            send_push_func(jsondata.push_class_id[i], jsondata.push_title[i], jsondata.push_message[i])
                        }
                    }
                    close_delete_confirm_popup();
                    close_info_popup('cal_popup_plancheck');
                    ajaxClassTime("this", 46, "callback", function(json){
                        plancheck(clicked_td_date_info, json)
                    });
                }

            },

            complete:function(){
                completeSend()
                ajax_block_during_sending_send_delete = true
            },

            error:function(){
                console.log('server error')
            }
        })
    }


    $("#btn_close").click(function(){  //일정삭제 팝업 X버튼 눌렀을때 팝업 닫기
        close_cal_popup()
    })

    function close_cal_popup(){
        if($('#cal_popup').css('display')=='block'){
            $("#cal_popup").css({'display':'none'})
            shade_index(100)
            $('#popup_text1 span').removeClass('limited')
        }
    }

    function close_class_select_popup(){
        $('#popup_lecture_select').hide()
    }

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
            shade_index(100)
        }
    }

    $('#popup_text4').click(function(){ //일정삭제 확인 팝업 취소버튼 눌렀을때 팝업 닫기
        if($('#cal_popup3').css('display')=='block'){
            $("#cal_popup3").css({'display':'none'})
            shade_index(100)
        }
    })


    $("#btn_close4").click(function(){ //일정예약 상세화면 팝업 X버튼 눌렀을때 팝업 닫기
        close_reserve_popup();
        close_info_popup('cal_popup_plancheck');
    });

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
            $("#addpopup").css({'display':'none'});
            $('#shade2').css({'display':'none'});
        }
        /*
        if(reg_check==0) {
            if ($('#pshade').css('z-index') == 150 || $('#mshade').css('z-index') == 150) {
                shade_index(100)
            } else {
                shade_index(-100)
            }
        }
        */
    }

    $('#ng_popup').click(function(){
        shade_index(-100)
        $(this).fadeOut(100)
    })

    if(reserveOption=="disable"){
        $(document).off('click','td');
        $('#float_btn').hide()
    }



//여기서부터 월간 달력 만들기 코드////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    calTable_Set(1,currentYear,currentPageMonth-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
    calTable_Set(2,currentYear,currentPageMonth);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
    calTable_Set(3,currentYear,currentPageMonth+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기
    */
    month_calendar(today_YY_MM_DD)

    $('.swiper-slide-active').css('width',$('#calendar').width())
    //DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateArray,'member',classStartArray)

    alltdRelative(); //모든 td의 스타일 position을 relative로
    monthText(); //상단에 연, 월 표시
    availableDateIndicator(availableStartTime,availableEndTime);
    krHoliday(); //대한민국 공휴일
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
        }
    });

    //이전페이지로 슬라이드 했을때 액션
    myswiper.on('SlidePrevEnd',function(){
        --currentPageMonth;
        if(currentPageMonth-1<1){
            --currentYear
            currentPageMonth = currentPageMonth + 12;
            slideControl.prepend();
        }else{
            slideControl.prepend();
        }
    });

    //페이지 이동에 대한 액션 클래스
    var slideControl = {
        'append' : function(){ //다음페이지로 넘겼을때
            var selector_swiper_slide_last_child = $('.swiper-slide:last-child');
            var lastdateinfo = selector_swiper_slide_last_child.find('.container-fluid').attr('id').split('_');
            var lastYY = Number(lastdateinfo[1]);
            var lastMM = Number(lastdateinfo[2]);

            myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
            myswiper.appendSlide('<div class="swiper-slide"></div>') //마지막 슬라이드에 새슬라이드 추가
            //(디버깅용 날짜 표시)myswiper.appendSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth+1)+'월'+' currentPageMonth: '+Number(currentPageMonth+1)+'</div>') //마지막 슬라이드에 새슬라이드 추가
            calTable_Set(3,lastYY,lastMM+1); //새로 추가되는 슬라이드에 달력 채우기
            alltdRelative();
            monthText();
            krHoliday();
            availableDateIndicator(availableStartTime,availableEndTime);
            ajaxClassTime("this")
            myswiper.update(); //슬라이드 업데이트

        },

        'prepend' : function(){
            var selector_swiper_slide_first_child = $('.swiper-slide:first-child');
            var firstdateinfo = selector_swiper_slide_first_child.find('.container-fluid').attr('id').split('_');
            var firstYY = Number(firstdateinfo[1]);
            var firstMM = Number(firstdateinfo[2]);

            myswiper.removeSlide(2);
            myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
            //(디버깅용 날짜 표시)myswiper.prependSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth-1)+'월'+' currentPageMonth: '+Number(currentPageMonth-1)+'</div>');
            calTable_Set(1,firstYY,firstMM-1);
            alltdRelative();
            monthText();
            krHoliday();
            availableDateIndicator(availableStartTime,availableEndTime);
            ajaxClassTime("this")
            myswiper.update(); //이전페이지로 넘겼을때
        }
    };

    /*
    function draw_time_graph(option, width, type){  //type = '' and mini

        var targetHTML =  '';
        var types = '';
        if(type == 'mini'){
            targetHTML =  $('#timeGraph.ptaddbox_mini table');
            types = "_mini"
        }else{
            targetHTML =  $('#timeGraph._NORMAL_ADD_timegraph .timegraphtext');
            types = ''
        }

        var tdwidth = 100/(Options.workEndTime-Options.workStartTime);
        var tdwidth_ = 100/(Options.workEndTime-Options.workStartTime);

        var tr1 = [];
        var tr2 = [];
        var i=Options.workStartTime;
        console.log(Options.workStartTime,Options.workEndTime )
        if(option == "30"){
            for(i; i<Options.workEndTime; i++){
                tr1[i] = '<div colspan="2" style="width:'+tdwidth_+'%" class="colspan">'+(i)+'</div>';
                tr2[i] = '<div id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00" style="width:'+tdwidth+'%;"></div><div id="'+(i)+'g_30'+types+'" class="tdgraph_'+option+' tdgraph30" style="width:'+tdwidth+'px;"></div>';
            }
        }else if(option == "60"){
            for(i; i<Options.workEndTime; i++){
                tr1[i] = '<div style="width:'+tdwidth+'%;" class="colspan">'+(i)+'</div>';
                tr2[i] = '<div id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00" style="width:'+tdwidth+'%;"></div>';
            }
        }
        var tbody = '<div>'+tr1.join('')+'</div><div class="timegraph_display">'+tr2.join('');
        targetHTML.html(tbody);
    }
    */
    function draw_time_graph(option, temp, type, thisDate){  //type = '' and mini
        var thisdate = thisDate;
        var day = new Date(thisDate).getDay();

        var work_start = Options.workStartTime;
        var work_end = Options.workEndTime;
        var work_start_thisday = worktime_extract_hour(Options.worktimeWeekly[day])["start"];
        var work_end_thisday = worktime_extract_hour(Options.worktimeWeekly[day])["end"];

        var targetHTML =  '';
        var types = '';
        if(type == 'mini'){
            targetHTML =  $('#timeGraph.ptaddbox_mini table');
            types = "_mini"
        }else{
            targetHTML =  $('#timeGraph._NORMAL_ADD_timegraph .timegraphtext');
            types = ''
        }

        var tdwidth = (100/(work_end - work_start));
        var tdwidth_ = (100/(work_end - work_start));

        var tr1 = [];
        var tr2 = [];
        var i=Options.workStartTime;
        if(option == "30"){
            for(var i=0; i<=24; i++){
                var display = "";
                var worktime_disable = "";
                if(i<Options.workStartTime || i >= Options.workEndTime){
                    var display = 'display:none;'
                }
                if( (i >= work_start && i < work_start_thisday) || ( i <= work_end && i >= work_end_thisday ) ){
                    var worktime_disable = "background-color:#cccccc !important;"
                }
                tr1[i] = `<div colspan="2" style="width:${tdwidth_}'%;${display}" class="colspan">${i}</div>`;
                //tr2[i] = '<div id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00" style="width:'+tdwidth+'%;"></div><div id="'+(i)+'g_30'+types+'" class="tdgraph_'+option+' tdgraph30" style="width:'+tdwidth+'px;"></div>';
                tr2[i] = `<div id="${i}g_00${types}" class="tdgraph_${option} tdgraph00" style="width:${tdwidth}%;${display}${worktime_disable}"></div><div id="${i}g_30${types}" class="tdgraph_${option} tdgraph30" style="width:${tdwidth}px;"></div>`;
            }
        }else if(option == "60"){
            for(var i=0; i<=24; i++){
                var display = "";
                var worktime_disable = "";
                if(i<Options.workStartTime || i >= Options.workEndTime){
                    var display = 'display:none;'
                }
                if( (i >= work_start && i < work_start_thisday) || ( i <= work_end && i >= work_end_thisday ) ){
                    var worktime_disable = "background-color:#cccccc !important;"
                }
                tr1[i] = `<div style="width:${tdwidth}%;${display}" class="colspan">${i}</div>`;
                tr2[i] = `<div id="${i}g_00${types}" class="tdgraph_${option} tdgraph00" style="width:${tdwidth}%;${display}${worktime_disable}"></div>`;
            }
        }
        var tbody = '<div>'+tr1.join('')+'</div><div class="timegraph_display">'+tr2.join('');
        targetHTML.html(tbody);
    }


    function draw_time_group_graph(option, jsondata, dateinfo){
        var day = new Date(date_format_yyyy_m_d_to_yyyy_mm_dd(dateinfo, '-')).getDay();
        var worktime_today = Options.worktimeWeekly[day];
        var work_start = worktime_extract_hour(worktime_today)["start"];
        var work_end = worktime_extract_hour(worktime_today)["end"];
        var targetSelected;
        var $htmlTarget;
        if(option == "group"){
            $htmlTarget = $('#groupTimeSelect');
            targetSelected = "NORMAL"
        }else if(option == "class"){
            $htmlTarget = $('#classTimeSelect');
            targetSelected = "EMPTY"
        }
        var len = jsondata.group_schedule_group_id.length;
        var htmlTojoin = []
        for(var i=0; i<len; i++){
            if(date_format_yyyy_mm_dd_to_yyyy_m_d(jsondata.group_schedule_start_datetime[i].split(' ')[0],'_') == dateinfo){
                //if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){
                    var planYear    = Number(jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[0])
                    var planMonth   = Number(jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[1])
                    var planDate    = Number(jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[2])
                    var planHour    = Number(jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[0])
                    var planMinute  = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[1]
                    var planEDate   = Number(jsondata.group_schedule_end_datetime[i].split(' ')[0].split('-')[2])
                    var planEndHour = Number(jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[0])
                    var planEndMin  = jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[1]
                    var planDura = calc_duration_by_start_end(jsondata.group_schedule_start_datetime[i].split(' ')[0], jsondata.group_schedule_start_datetime[i].split(' ')[1], jsondata.group_schedule_end_datetime[i].split(' ')[0], jsondata.group_schedule_end_datetime[i].split(' ')[1])
                    var grouptypecd = jsondata.group_schedule_type_cd[i];

                    //그룹 일정중 지난시간 일정은 선택 불가능 하도록, 근접예약 방지 옵션 값 적용
                    var disable = ""
                    var myreserve = ""
                    var myreservecheckbox1 = ""
                    var myreservecheckbox2 = ""

                    var selecteddate = date_format_yyyymmdd_to_yyyymmdd_split(jsondata.group_schedule_start_datetime[i].split(' ')[0],'')
                    var today = date_format_yyyy_m_d_to_yyyy_mm_dd(oriYear+'_'+oriMonth+'_'+oriDate,'');

                    var todayandlimitSum = Number(today)+parseInt(Options.limit/24);
                    if(Number(oriDate)+parseInt(Options.limit/24) > lastDay[Number(oriMonth)-1]){
                        todayandlimitSum = date_format_yyyy_m_d_to_yyyy_mm_dd(oriYear+'-'+(Number(oriMonth)+1)+'-'+parseInt(Options.limit/24),'')
                    }


                    ///////////////////////////////////////////////////////////////////그룹 일정 막기 여러가지 경우////////////////////////////////////
                    var fulled = "";
                    if(selecteddate > today && selecteddate < todayandlimitSum){
                        disable = "disabled_button";
                    }else if(selecteddate == today){
                        if(planHour < currentHour + Options.limit +1){
                            disable = "disabled_button";
                        }
                    }
                    //그룹 일정중 지난시간 일정은 선택 불가능 하도록, 근접예약 방지 옵션 값 적용

                    //내 일정중 그룹일정 리스트와 같은 시간 항목이 있으면 그 그룹시간은 비활성화
                    if(jsondata.classTimeArray_start_date.indexOf(jsondata.group_schedule_start_datetime[i]) !=  -1){
                        disable = "disabled_button";
                        myreserve = "<span style='color:#fe4e65'> - 내 예약</span>";
                        myreservecheckbox1 = 'checked ';
                        myreservecheckbox2 = 'ptersCheckboxInner';
                    }

                    //완료된 그룹은 비활성화
                    if(jsondata.group_schedule_finish_check[i] == 1){
                        disable = "disabled_button";
                        fulled = " (종료)";
                    }

                    if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){
                        //var fulled = ""
                    }else if(jsondata.group_schedule_current_member_num[i] == jsondata.group_schedule_max_member_num[i]){
                        disable = "disabled_button";
                        fulled = "(마감)";
                    }
                    ///////////////////////////////////////////////////////////////////그룹 일정 막기 여러가지 경우////////////////////////////////////
                    var starttime = jsondata.group_schedule_start_datetime[i].split(' ')[1];
                    var endtime = jsondata.group_schedule_end_datetime[i].split(' ')[1];

                    if(targetSelected == grouptypecd){
                        if(planHour >= work_start && planHour < work_end){
                            htmlTojoin.push('<div style="line-height:18px;margin-bottom:7px;"><div class="ptersCheckbox '+myreservecheckbox1+disable+'" data-date="'+jsondata.group_schedule_start_datetime[i].split(' ')[0]+
                                '" data-time="'+starttime+'.000000'+
                                '"data-endtime ="'+endtime+'.000000'+
                                '" data-dur="'+planDura+
                                '" group-schedule-id="'+jsondata.group_schedule_id[i]+'"><div class="'+myreservecheckbox1+myreservecheckbox2+'"></div></div><p class="plan_list_row">'+
                                jsondata.group_schedule_start_datetime[i].split(' ')[1].substr(0,5)+' ~ '+
                                jsondata.group_schedule_end_datetime[i].split(' ')[1].substr(0,5) +' : '+
                                jsondata.group_schedule_group_name[i]+' ('+
                                jsondata.group_schedule_current_member_num[i]+'/'+
                                jsondata.group_schedule_max_member_num[i]+
                                ')'+fulled+myreserve+'</p></div>');
                        }
                    }
                //}
            }
        }
        if(htmlTojoin.length == 0){
            htmlTojoin.push('<div style="text-align:center;margin-top:18px;margin-bottom:18px;font-weight:bold;">예약 가능한 일정이 없습니다.</div>')
            if(jsondata.lecture_reg_count[0] == 0){
                $('#submitBtn').hide()
            }
        }else{
            if(jsondata.lecture_reg_count[0] == 0){
                $('#submitBtn').show()
            }
        }
        $htmlTarget.html(htmlTojoin.join(''))

        // 그룹에 예약 가능 일정이 있고 클래스에 예약가능 일정이 없는 경우 submitBtn hide 되는 문제 해결 - hkkim 18.07.30
        if($('.ptersCheckbox').length > 0){
            $('#submitBtn').show()
        }
    }




    function plancheck(dateinfo, jsondata){ // //2017_11_21_21_00_1_김선겸_22_00 //dateinfo = 2017_11_5
        var len1 = jsondata.scheduleIdArray.length;
        var len2 = jsondata.group_schedule_id.length;
        var dateplans = []


        // for(var i=0; i<len2; i++){  //시간순 정렬을 위해 'group' 정보를 가공하여 dateplans에 넣는다.
        //     var grouptype = "group"
        //     var dbID = ''
        //     var group_id = jsondata.group_schedule_group_id[i]
        //     var scheduleID = jsondata.group_schedule_id[i]
        //     var index = jsondata.classTimeArray_start_date.indexOf(jsondata.group_schedule_start_datetime[i])
        //     if(index != -1){
        //         var scheduleID = jsondata.scheduleIdArray[index]
        //     }else{
        //         var scheduleID = ''
        //     }
        //     var classLectureID = ''
        //     var scheduleFinish = jsondata.group_schedule_finish_check[i]
        //     var memoArray = jsondata.group_schedule_note[i]
        //     var yy = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[0]
        //     var mm = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[1]
        //     var dd = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[2]
        //     var stime1 = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[0]
        //     var etime1 = jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[0]
        //     var sminute = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[1]
        //     var eminute = jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[1]
        //     var groupmax = jsondata.group_schedule_max_member_num[i]
        //     var groupcurrent = jsondata.group_schedule_current_member_num[i]
        //     var groupParticipants = '(' + groupcurrent + '/' + groupmax + ')'
        //     var name = '['+jsondata.group_schedule_group_type_cd_name[i]+'] '+jsondata.group_schedule_group_name[i]+groupParticipants
        //     if(stime1.length<2){
        //         var stime1 = '0'+stime1
        //     }else if(stime1 == '24'){
        //         var stime1 = '00'
        //     }
        //     var stime = stime1+'_'+sminute
        //     var etime = etime1+'_'+eminute
        //     var ymd = yy+'_'+Number(mm)+'_'+Number(dd)
        //     if(ymd == dateinfo && jsondata.classTimeArray_start_date.indexOf(jsondata.group_schedule_start_datetime[i]) != -1){
        //         dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_'+dbID+'_'+grouptype+'_'+group_id+'_/'+memoArray)
        //     }
        // }

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
            var groupParticipants = "";
            if(jsondata.schedule_group_max_member_num[i] != "") {
                groupParticipants = '(' + jsondata.schedule_group_current_member_num[i] + '/' + jsondata.schedule_group_max_member_num[i] + ')'
            }
            var name = '['+jsondata.schedule_group_type_cd_name[i]+'] '+jsondata.schedule_group_name[i] + groupParticipants;
            var ymd = yy+'_'+Number(mm)+'_'+Number(dd)
            // if(ymd == dateinfo && jsondata.group_schedule_start_datetime.indexOf(jsondata.classTimeArray_start_date[i]) == -1){
            if(ymd == dateinfo ){
                dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_'+dbID+'_'+grouptype+'_'+group_id+'_/'+memoArray)
            }
        }


        dateplans.sort();
        var htmltojoin = []
        reg_check = dateplans.length;
        if(dateplans.length>0){
            for(var i=1;i<=dateplans.length;i++){
                var splited = dateplans[i-1].split('_')
                var stime = Number(splited[0])
                var sminute = splited[1]
                var etime = Number(splited[2])
                var eminute = splited[3]
                var name = splited[4]
                var textsize = ""

                if(name.length > 12 ){
                    textsize = 'style="font-size:11.5px"'
                }else if(name.length > 9){
                    textsize = 'style="font-size:12px"'
                }


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
                    /*
                    htmltojoin.push('<div class="plan_raw" title="완료 된 일정" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-membernum="'+groupmax+'" data-dbid="'+splited[11]+'" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'">'+
                                        '<span class="plancheckmorningday">'+morningday+'</span>'+
                                        '<span class="planchecktime">'+stime+':'+sminute+' - '+etime+':'+eminute+'</span>'+
                                        '<span class="plancheckname">'+name+'<img src="/static/user/res/btn-pt-complete.png"></span>'+
                                    '</div>')*/
                    htmltojoin.push('<div class="plan_raw" title="완료 된 일정" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-group-type-cd-name="'+splited[14]+'" data-membernum="'+splited[15]+'" data-dbid="'+splited[11]+'" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'">'+
                                        '<div class="plancheckmorningday">'+morningday+'</div>'+
                                        '<div class="planchecktime">'+stime+':'+sminute+' - '+etime+':'+eminute+'</div>'+
                                        '<div class="plancheckname"><img src="/static/user/res/btn-pt-complete.png">'+'<p '+textsize+'>'+name+'</p></div>'+
                                    '</div>')

                }else if(splited[10] == 0){
                    /*
                    htmltojoin.push('<div class="plan_raw" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-membernum="'+groupmax+'" data-dbid="'+splited[11]+'" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'">'+
                                        '<span class="plancheckmorningday">'+morningday+'</span>'+
                                        '<span class="planchecktime">'+stime+':'+sminute+' - '+etime+':'+eminute+'</span>'+
                                        '<span class="plancheckname">'+name+'</span>'+
                                    '</div>')*/
                    htmltojoin.push('<div class="plan_raw" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-group-type-cd-name="'+splited[14]+'" data-membernum="'+splited[15]+'" data-dbid="'+splited[11]+'" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'">'+
                                        '<div class="plancheckmorningday">'+morningday+'</div>'+
                                        '<div class="planchecktime">'+stime+':'+sminute+' - '+etime+':'+eminute+'</div>'+
                                        '<div class="plancheckname"><p '+textsize+'>'+name+'</p></div>'+
                                    '</div>')
                }
            }
        }else{
            htmltojoin.push('<div class="plan_raw_blank">등록된 일정이 없습니다.</div>')
        }
        if(date_format_yyyy_m_d_to_yyyymmdd(dateinfo) >= date_format_yyyy_m_d_to_yyyymmdd(oriYear+'_'+oriMonth+'_'+oriDate)){
            htmltojoin.push('<div class="plan_raw_blank plan_raw_add" data-date="'+dateinfo+'"><img src="/static/user/res/floatbtn/btn-plus.png" style="width:20px;cursor:pointer;"></div>')

        }

        $('#cal_popup_plancheck .popup_inner_month').html(htmltojoin.join(''))
        var countNumber = $('.popup_inner_month .plan_raw').length
        $('#countNum').text(countNumber)
        var todaydate = date_format_yyyy_m_d_to_yyyymmdd(oriYear+'_'+oriMonth+'_'+oriDate);
        var limitdate = date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(oriYear+'-'+oriMonth+'-'+oriDate, Options.availDate),'')
        if(date_format_yyyy_m_d_to_yyyymmdd(dateinfo) >= date_format_yyyy_m_d_to_yyyymmdd(oriYear+'_'+oriMonth+'_'+oriDate) && date_format_yyyy_m_d_to_yyyymmdd(dateinfo) < limitdate){
            // if(dateplans.length==0 && click_check == 0) {
            if(dateplans.length==0 && click_check == 0 && Options.reserve != 1 && $('#countRemainData span:first-child').text()!='0'){
                //close_info_popup('cal_popup_plancheck');
                $('.plan_raw_add').trigger('click');
            }
        }
    }

    var ajaxJSON_cache;
    function ajaxTimeGraphSet(clicked){
        var today_form = date_format_to_yyyymmdd(clicked.attr('data-date'),'-')
        var tablewidth = $('.timegraphtext').width();
        $('.mode_switch_button').addClass('disabled_button');
        $.ajax({
            url: '/trainee/get_trainee_schedule/',
            type : 'GET',
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
                    ajaxJSON_cache = jsondata
                    if($('#timeGraph').length > 0){
                        startTimeSet('class', jsondata, today_form, Options.classDur*Options.timeDur, Options.startTime);  //일정등록 가능한 시작시간 리스트 채우기
                        // var start_time_length = $('#starttimes li:first-child').length;
                        // if(start_time_length==0){
                        //     var time_graph_val = $('#timeGraph');
                        //     var htmlTojoin = [];
                        //     htmlTojoin.push('<div style="text-align:center;margin-top:18px;margin-bottom:18px;font-weight:bold;">예약 가능한 일정이 없습니다.</div>');
                        //     time_graph_val.html(htmlTojoin.join(''));
                        //     $('#offStartTime').hide();
                        //     $('#submitBtn').hide()

                        // }
                        // else{
                        draw_time_graph(60,tablewidth,'',today_form);
                        timeGraphSet("class","grey", "AddClass", jsondata);  //시간 테이블 채우기
                        timeGraphSet("off","grey", "AddClass", jsondata);
                            // $('#offStartTime').show();
                            // $('#submitBtn').show();
                        // }
                    }

                    draw_time_group_graph('group', jsondata, date_format_yyyy_mm_dd_to_yyyy_m_d(today_form,'_'))
                    draw_time_group_graph('class', jsondata, date_format_yyyy_mm_dd_to_yyyy_m_d(today_form,'_'))

                    $('.mode_switch_button').removeClass('disabled_button');
                }

            },

            complete:function(){
            },

            error:function(){
                console.log('server error')
            }
        })
    }



    function timeGraphSet(option, CSStheme, Page, jsondata){ //가능 시간 그래프 채우기
        //1. option인자 : "class", "off"
        //2. CSS테마인자 : "grey", "pink"
        var planStartDate = '';
        var planEndDate = '';
        var planMemberName = '';
        var planScheduleIdArray = '';
        var planNoteArray = '';
        var cssClass = '';
        var cssClass_border = '';
        var datepicker = '';
        var type = option;
        switch(option){
            case "class" :
                planStartDate = jsondata.classTimeArray_start_date;
                planEndDate = jsondata.classTimeArray_end_date;
                planMemberName = jsondata.classTimeArray_member_name;
                planScheduleIdArray = jsondata.scheduleIdArray;
                planNoteArray = jsondata.scheduleNoteArray;
                //$('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
                break;
            case "group" :
                planStartDate = jsondata.group_schedule_start_datetime;
                planEndDate = jsondata.group_schedule_end_datetime;
                planMemberName = jsondata.group_schedule_group_name;
                planScheduleIdArray = jsondata.group_schedule_id;
                planNoteArray = jsondata.group_schedule_note;
                //$('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
                break;
            case "off" :
                planStartDate = jsondata.offTimeArray_start_date;
                planEndDate = jsondata.offTimeArray_end_date;
                break;
        }

        switch(CSStheme){
            case "grey" :
                cssClass = "timegraph_plans_grey_trainee";
                break;
            case "pink" :
                cssClass= "timegraph_plans_pink";
                break;
        }

        switch(Page){
            case "mini" :
                datepicker = $('#datetext_mini');
                option = "_mini";
                break;
            case "AddClass" :
                datepicker = $("#datepicker");
                option = "";
                break;
        }

        var Arraylength = planStartDate.length;
        //var $tableTarget    = $('#timeGraph div.plan_indicators');
        var $tableTarget    = $('#timeGraph div.timegraph_display');
        var workstart = Options.workStartTime;

        var htmlToJoin = [];

        var date = date_format_to_yyyymmdd($('#popup_info4').text(),'-')
        if(date != today_YY_MM_DD){  // 선택한 날짜가 오늘이 아닐 경우 일정을 뿌려준다.
            for(var i=0;i<Arraylength;i++){
                var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
                var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
                var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
                var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
                var planMinute  = Number(planStartDate[i].split(' ')[1].split(':')[1]);
                var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
                var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
                var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];

                //종료 시간이 24:00일경우 서버에서 다음날 00:00으로 보내오기 때문에 포맷을 오늘 24:00로 수정
                if(add_date(planEndDate[i].split(' ')[0],0) == add_date(planStartDate[i].split(' ')[0],1)
                    && planEndDate[i].split(' ')[1] == "00:00:00" ){
                    var planEndHour = "24";
                    var planEndMin = '00'
                }
                //종료 시간이 24:00일경우 서버에서 다음날 00:00으로 보내오기 때문에 포맷을 오늘 24:00로 수정

                var timegraph_hourwidth;
                var timegraph_houroffset;
                var timegraph_houroffsetb;
                var timegraph_hourendwidth;
                var timegraph_hourendoffset;

                var work_start = add_time(Options.workStartTime+':00','00:00');
                var work_end = add_time(Options.workEndTime+':00','00:00');
                var plan_start = add_time(planHour+':'+planMinute,'00:00');
                var plan_end = add_time(planEndHour+':'+planEndMin,'00:00');

                timegraph_hourwidth = $('#'+planHour+'g_00').width();
                timegraph_houroffset = $('#'+planHour+'g_00').position().left + timegraph_hourwidth*(planMinute/60);
                timegraph_houroffsetb = $('#'+planHour+'g_00').position().top;
                timegraph_hourendwidth = $('#'+planEndHour+'g_00').width();
                timegraph_hourendoffset = $('#'+planEndHour+'g_00').position().left + timegraph_hourendwidth*(planEndMin/60);

                var $workstarttime = $(`#${Options.workStartTime}g_00`);
                var $workendtime = $(`#${Options.workEndTime-1}g_00`);
                if(planHour<Options.workStartTime){ //시작시간이 업무시간 전에 있을 경우
                    if(planEndHour >= Options.workStartTime && planEndHour < Options.workEndTime){ //종료시간이 업무시간 안에 있을 경우
                        timegraph_hourwidth = $workstarttime.width();
                        timegraph_houroffset = $workstarttime.position().left
                        timegraph_houroffsetb = $workstarttime.position().top;
                        var flag = 'flag1'
                    }else if(planEndHour < Options.workStartTime){                                 //종료시간이 업무시간 전에 있을 경우
                        //숨김
                        continue;
                    }else if(planEndHour >= Options.workEndTime){                                    //종료시간이 업무시간 후에 있을 경우
                        timegraph_hourwidth = $workstarttime.width();
                        timegraph_houroffset = $workstarttime.position().left + timegraph_hourwidth*(planMinute/60);
                        timegraph_houroffsetb = $workstarttime.position().top;
                        timegraph_hourendwidth = $workendtime.width();
                        timegraph_hourendoffset = $workendtime.position().left + timegraph_hourendwidth
                    }
                }else if(planHour >= Options.workStartTime && planHour < Options.workEndTime ){ // 시작시간이 업무시간 내에 있을 경우
                    if(planEndHour >= Options.workStartTime && planEndHour < Options.workEndTime){ //종료시간이 업무시간 안에 있을 경우
                        //정상 경우
                    }else if(planEndHour < Options.workStartTime){                                 //종료시간이 업무시간 전에 있을 경우
                        //경우 발생하지 않음
                    }else if(planEndHour >= Options.workEndTime){                                    //종료시간이 업무시간 후에 있을 경우
                        timegraph_hourendwidth = $workendtime.width();
                        timegraph_hourendoffset = $workendtime.position().left + timegraph_hourendwidth;
                    }
                }else if(planHour >= Options.workEndTime){                                       //시작시간이 업무시간 후에 있을 경우
                    //패스
                    continue;
                }


                if(date_format_yyyy_m_d_to_yyyy_mm_dd(planYear+'-'+planMonth+'-'+planDate,'-') == date){
                    //var planDura    = calc_duration_by_start_end_2(planStartDate[i].split(' ')[0], planStartDate[i].split(' ')[1], planEndDate[i].split(' ')[0], planEndDate[i].split(' ')[1])

                    var planWidth   = timegraph_hourendoffset - timegraph_houroffset;
                    var planLoc     = timegraph_houroffset;

                    if(type=="class" && jsondata.group_schedule_start_datetime.indexOf(planStartDate[i]) >= 0){

                    }else{
                        htmlToJoin.push('<div class="'+cssClass+'" style="width:'+planWidth+'px;left:'+planLoc+'px;top:'+timegraph_houroffsetb+'px;" data-type="'+type+'" data-typeg="'+Page+'"></div>')
                    }
                }
            }
        }else{  // 선택한 날짜가 오늘일 경우 이미 지난시간은 모두 회색으로 표기하고 근접 예약방지 옵션을 적용한다.
            var limit = add_time(currentHour+':'+currentMinute,'00:'+(Options.limit*60) );

            //근접 예약방지 시간을 현재시간에 더한 값이 업무 종료 시간보다 클경우
            if(compare_time(limit,add_time(Options.workEndTime+':00','00:00'))){
                var timegraph_hourwidth = $('#'+(Options.workEndTime-1)+'g_00').width();
                var timegraph_houroffset = $('#'+Options.workStartTime+'g_00').position().left;
                var timegraph_houroffsetb = $('#'+Options.workStartTime+'g_00').position().top;
                var timegraph_hourendoffset = $('#'+(Options.workEndTime-1)+'g_00').position().left + timegraph_hourwidth

            //근접 예약방지 시간을 현재시간에 더한 값이 업무 시작 시간보다 작을 경우
            }else if(compare_time(limit,add_time(Options.workStartTime+':00','00:00')) == false){
                var timegraph_hourendoffset = 0;
                var timegraph_houroffset = 0;
                var timegraph_houroffset = 0;

            //근접 예약방지 시간을 현재시간에 더한 값이 업무시간 내에 있을 경우
            }else{
                var timegraph_hourwidth = $('#'+Number(limit.split(':')[0])+'g_00').width();
                var timegraph_houroffset = $('#'+Options.workStartTime+'g_00').position().left;
                var timegraph_houroffsetb = $('#'+Options.workStartTime+'g_00').position().top;
                var timegraph_hourendoffset = $('#'+Number(limit.split(':')[0])+'g_00').position().left + timegraph_hourwidth*(Number(limit.split(':')[1])/60)
            }

            var planWidth   = timegraph_hourendoffset - timegraph_houroffset;
            var planLoc     = timegraph_houroffset;

                for(var i=0;i<Arraylength;i++){
                    var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
                    var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
                    var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
                    var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
                    var planMinute  = Number(planStartDate[i].split(' ')[1].split(':')[1]);
                    var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
                    var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
                    var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];

                    //24:00일경우 다음날 00:00 으로 들어오기 때문에
                    if(planEndDate[i].split(' ')[1] == "00:00:00"){
                        var planEndHour = '24'
                        var planEndMin = '00'
                    }
                    //24:00일경우 다음날 00:00 으로 들어오기 때문에

                    if(planHour >= Options.workStartTime && planHour < Options.workEndTime){
                        var timegraph_hourwidth = $('#'+planHour+'g_00').width();
                        var timegraph_houroffset = $('#'+planHour+'g_00').position().left + timegraph_hourwidth*(planMinute/60);
                        var timegraph_houroffsetb = $('#'+planHour+'g_00').position().top;

                        var timegraph_hourendwidth;
                        var timegraph_hourendoffset;

                        if(planEndHour == Options.workEndTime){
                            timegraph_hourendwidth = $('#'+(planEndHour-1)+'g_00').width();
                            timegraph_hourendoffset = $('#'+(planEndHour-1)+'g_00').position().left + timegraph_hourendwidth;
                        }else if(planEndHour > Options.workEndTime){
                            timegraph_hourendwidth = $('#'+(Options.workEndTime-1)+'g_00').width();
                            timegraph_hourendoffset = $('#'+(Options.workEndTime-1)+'g_00').position().left + timegraph_hourendwidth;
                        }else{
                            timegraph_hourendwidth = $('#'+planEndHour+'g_00').width();
                            timegraph_hourendoffset = $('#'+planEndHour+'g_00').position().left + timegraph_hourendwidth*(planEndMin/60);
                        }

                        if(date_format_yyyy_m_d_to_yyyy_mm_dd(planYear+'-'+planMonth+'-'+planDate,'-') == date){
                            //var planDura_    = calc_duration_by_start_end_2(planStartDate[i].split(' ')[0], planStartDate[i].split(' ')[1], planEndDate[i].split(' ')[0], planEndDate[i].split(' ')[1])

                            var planWidth_   = timegraph_hourendoffset - timegraph_houroffset;
                            var planLoc_     = timegraph_houroffset;

                            if(type=="class" && jsondata.group_schedule_start_datetime.indexOf(planStartDate[i]) >= 0){

                            }else{
                                htmlToJoin.push('<div class="'+cssClass+'" style="width:'+planWidth_+'px;left:'+planLoc_+'px;top:'+timegraph_houroffsetb+'px;" data-type="'+type+'" data-typeg="'+Page+'"></div>')
                            }
                        }
                    }
                }



            htmlToJoin.push('<div class="'+cssClass+'" style="width:'+planWidth+'px;left:'+planLoc+'px;top:'+timegraph_houroffsetb+'px;" data-type="'+type+'" data-typeg="'+Page+'"></div>')

        }
        $tableTarget.append(htmlToJoin.join(''))
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
        var today = yy+mm+dd;


        var todayandlimitSum = Number(today)+parseInt(limit/24);
        if(Number(dd)+parseInt(limit/24) > lastDay[Number(mm)-1]){
            var todayandlimitSum = date_format_yyyy_m_d_to_yyyy_mm_dd(yy+'-'+(Number(mm)+1)+'-'+parseInt(limit/24),'')
        }

        if(selecteddate > today && selecteddate < todayandlimitSum){
            for(var i=0;i<=23;i++){
                //var time = $('#'+i+'g')
                //time.addClass('greytimegraph')
                $('#'+i+'g_00').addClass('greytimegraph')
                $('#'+i+'g_30').addClass('greytimegraph_greyleft')
            }
        }else if(selecteddate == today){
            for(var i=0; i<=23; i++){
                //var time = $('#'+i+'g')
                if(i <= hh + limit){
                    //time.addClass('greytimegraph')
                    $('#'+i+'g_00').addClass('greytimegraph')
                    $('#'+i+'g_30').addClass('greytimegraph_greyleft')
                }
            }
        }

    }


    function startTimeArraySet(selecteddate, jsondata, Timeunit, starttimeOption){ //offAddOkArray 채우기 : 시작시간 리스트 채우기!!!!
        switch(option){
            case "class" :
                var option = ""
                break;
            case "mini" :
                var option = "_mini"
                break;
        }
        var thisDay = new Date(selecteddate).getDay();
        var workStartTime_ = time_h_m_to_hh_mm(Options.worktimeWeekly[thisDay].split('-')[0]);
        var workEndTime_ = time_h_m_to_hh_mm(Options.worktimeWeekly[thisDay].split('-')[1]);
        if(workEndTime_ == "23:59"){
            workEndTime_ = "24:00"
        }
        var plan_starttime = {};
        var plan_endtime = {};
        for(var i=0; i<jsondata.classTimeArray_start_date.length; i++){
            if(jsondata.classTimeArray_start_date[i].split(' ')[0] == selecteddate){
                plan_starttime[jsondata.classTimeArray_start_date[i].split(' ')[1]] = ""
            }
            if(jsondata.classTimeArray_end_date[i].split(' ')[0] == selecteddate && jsondata.classTimeArray_end_date[i].split(' ')[1] != "00:00:00"){
                plan_endtime[jsondata.classTimeArray_end_date[i].split(' ')[1]] = ""
            }else if(jsondata.classTimeArray_end_date[i].split(' ')[0] == date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(selecteddate,1),'-') && jsondata.classTimeArray_end_date[i].split(' ')[1] == "00:00:00"){
                plan_endtime['24:00:00'] = ""
            }
        }
        for(var j=0; j<jsondata.group_schedule_start_datetime.length; j++){
            if(jsondata.group_schedule_start_datetime[j].split(' ')[0] == selecteddate){
                plan_starttime[jsondata.group_schedule_start_datetime[j].split(' ')[1]] = ""
            }
            if(jsondata.group_schedule_end_datetime[j].split(' ')[0] == selecteddate && jsondata.group_schedule_end_datetime[j].split(' ')[1] != "00:00:00"){
                plan_endtime[jsondata.group_schedule_end_datetime[j].split(' ')[1]] = ""
            }else if(jsondata.group_schedule_end_datetime[j].split(' ')[0] == date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(selecteddate,1),'-') && jsondata.group_schedule_end_datetime[j].split(' ')[1] == "00:00:00"){
                plan_endtime['24:00:00'] = ""
            }
        }
        for(var j=0; j<jsondata.offTimeArray_start_date.length; j++){
            if(jsondata.offTimeArray_start_date[j].split(' ')[0] == selecteddate){
                plan_starttime[jsondata.offTimeArray_start_date[j].split(' ')[1]] = ""
            }
            if(jsondata.offTimeArray_end_date[j].split(' ')[0] == selecteddate && jsondata.offTimeArray_end_date[j].split(' ')[1] != "00:00:00"){
                plan_endtime[jsondata.offTimeArray_end_date[j].split(' ')[1]] = ""
            }else if(jsondata.offTimeArray_end_date[j].split(' ')[0] == date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(selecteddate,1),'-') && jsondata.offTimeArray_end_date[j].split(' ')[1] == "00:00:00"){
                plan_endtime['24:00:00'] = ""
            }
        }

        var plan_time = [];
        var plan_stime = [];
        var plan_etime = [];

        for(starttime in  plan_starttime){
            var thistime = starttime.split(':')[0]+':'+starttime.split(':')[1];
                                                                                            //workEndTime <= thistime
            if( compare_time(thistime, workStartTime_) == false || compare_time(workEndTime_, thistime) == false ){ // 일정시작시간이 이 시작시간보다 작으면 넣지 않는다.
                
            }else{
                plan_time.push(thistime)
            }
        }
        for(endtime in plan_endtime){
            var thistime = endtime.split(':')[0]+':'+endtime.split(':')[1];
            if( compare_time(thistime, workStartTime_) == false || compare_time(workEndTime_, thistime) == false ){  //일정 종료시간이 시작시간보다 작으면 넣지 않는다.
                
            }else{
                plan_time.push(thistime)
            }
        }

        
        plan_time.push(workEndTime_)
        plan_time.unshift(workStartTime_)

        //var sortedlist = plan_time.sort(function(a,b){return a-b;})
        var sortedlist = plan_time.sort();
        if(sortedlist[0] == workStartTime_ && sortedlist.length%2 == 1){
            sortedlist.unshift(workStartTime_)
        }
        if(sortedlist.length == 2){
            sortedlist = [];
        }
        //all_plans = sortedlist;
        //index 사이 1-2, 3-4, 5-6, 7-8, 9-10, 11-12, 13-14
        var semiresult = []
        for(var p=0; p<sortedlist.length/2; p++){
            var zz = 0;
            //일정 시작시간이 일정 종료시간보다 작으면,
            if(compare_time(add_time(sortedlist[p*2],'0:'+Number(zz+Timeunit)), add_time(sortedlist[p*2+1],'0:00')) ==false &&
                compare_time( add_time(sortedlist[p*2],'0:'+Number(zz+Timeunit)), add_time(workEndTime_ ,'00:00')) == false  ){
                while(add_time(sortedlist[p*2],'0:'+Number(zz+Timeunit)) != add_time(sortedlist[p*2+1],'0:01')){
                    semiresult.push(add_time(sortedlist[p*2],'0:'+zz))
                    zz++
                    if(zz>1450){ //하루 24시간 --> 1440분
                        break;
                    }
                }

            }
        }

        //offAddOkArray = []
        var addOkArrayList = [];
        var currentTime = time_h_m_to_hh_mm(currentHour+':'+currentMinute)
        var currentDate = today_YY_MM_DD;
        for(var t=0; t<semiresult.length; t++){
            //if(Number(semiresult[t].split(':')[1])%Timeunit == 0){  //몇분 간격으로 시작시간을 보여줄 것인지?
            if(selecteddate == currentDate){                                                                   //선택한 날짜가 오늘일 경우
                if(compare_time(semiresult[t], add_time(currentTime, '00:'+(Options.limit*60) ))                      //업무시간
                    && compare_time(semiresult[t], add_time(Options.workEndTime+':00', '00:00')) == false
                    && compare_time(add_time(Options.workStartTime+':00', '00:00'), semiresult[t]) == false ){ //근접예약 금지

                    if(starttimeOption.split('-')[0] == "A"){
                        if(Number(semiresult[t].split(':')[1]) == Number(starttimeOption.split('-')[1])){  //매시간의 몇분을 시작시간을 보여줄 것인지?
                            addOkArrayList.push(semiresult[t])
                        }
                    }else if(starttimeOption.split('-')[0] == "E"){
                        if(Number(semiresult[t].split(':')[1])%Number(starttimeOption.split('-')[1]) == 0){   //몇분 간격으로 시작시간을 보여줄 것인지?
                            addOkArrayList.push(semiresult[t])
                        }
                    }
                }
            }else{                                                                                     //선택한 날짜가 오늘이 아닐경우
                if(compare_time(semiresult[t], add_time(Options.workEndTime+':00', '00:00')) == false
                    && compare_time(add_time(Options.workStartTime+':00', '00:00'),semiresult[t]) == false){        //업무시간

                    if(starttimeOption.split('-')[0] == "A"){
                        if(Number(semiresult[t].split(':')[1]) == Number(starttimeOption.split('-')[1])){  //매시간의 몇분을 시작시간을 보여줄 것인지?
                            addOkArrayList.push(semiresult[t])
                        }
                    }else if(starttimeOption.split('-')[0] == "E"){
                        if(Number(semiresult[t].split(':')[1])%Number(starttimeOption.split('-')[1]) == 0){   //몇분 간격으로 시작시간을 보여줄 것인지?
                            addOkArrayList.push(semiresult[t])
                        }
                    }
                }

            }
        }
        allplans = sortedlist
        return {"addOkArray":addOkArrayList, "allplans":sortedlist}
    }

    var allplans = [];
    function startTimeSet(option, jsondata, selecteddate, Timeunit, starttimeOption){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21]
        var sArraySet =  startTimeArraySet(selecteddate, jsondata, Timeunit, starttimeOption); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
        var addOkArray = sArraySet.addOkArray;
        var options = "";
        switch(option){
            case "class":
                options = "";
                break;
            case "mini":
                options = "_mini";
                break;
        }

        var text1 = '오전 ';
        var text2 = '오후 ';
        var text3 = '시';

        if(Options.language == "JPN"){
            text1 = '午前 ';
            text2 = '午後 ';
            text3 = '時';
        }else if(Options.language == "ENG"){
            text1 = 'AM ';
            text2 = 'PM ';
            text3 = ':00';
        }

        //offAddOkArray =  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12.5, 13, 14, 18.5, 20, 21, 22, 23]
        var offOkLen = addOkArray.length;
        var startTimeList = $('#starttimes'+options);
        var timeArray = [];
        var classDur = Options.classDur*Options.timeDur;
        for(var i=0; i<offOkLen; i++){
            var offHour = addOkArray[i].split(':')[0];
            var offmin = addOkArray[i].split(':')[1];
            var offText = text1; //오전
            var offHours = offHour;
            if(offHour<12){
                offText = text1; //오전
                offHours = offHour;
            }else if(offHour==24){
                offText = text1;
                offHours = offHour-12;
            }else if(offHour==12 || offHour==12.5){
                offText = text2;//오후
                offHours = offHour;
            }else{
                offHours = offHour-12;
                offText = text2;
            }

            var endtime = add_time(addOkArray[i],'00:'+classDur)
            timeArray[i] ='<li><a data-trainingtime="'+addOkArray[i]+'" data-trainingendtime="'+endtime+'" class="pointerList">'+offText+offHour+':'+offmin+'</a></li>';
        }
        timeArray[offOkLen]='<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>';
        var timeArraySum = timeArray.join('');
        startTimeList.html(timeArraySum);
    }

    function addGraphIndicator(durmin){
        if($('.timegraph_display .selectedplan_indi').length == 0){
            $('.timegraph_display').append('<div class="selectedplan_indi"></div>')
        }else{

        }
        
        var starttext = $('#starttimesSelected button').val().split(' ');  //오후 11:30
        var daymorning = starttext[0];
        var planHour = Number(starttext[1].split(':')[0]);
        var planMinute = Number(starttext[1].split(':')[1]);
        var planend = add_time(planHour+':'+planMinute, '00:'+durmin);
        var planEndHour = Number(planend.split(':')[0]);
        var planEndMin  = Number(planend.split(':')[1]);
        var planDura = durmin;
        var workstart = Options.workStartTime;

        var timegraph_hourwidth = $('#'+planHour+'g_00').width();
        var timegraph_houroffset = $('#'+planHour+'g_00').position().left + timegraph_hourwidth*(planMinute/60);
        var timegraph_houroffsetb = $('#'+planHour+'g_00').position().top;

        var timegraph_hourendwidth;
        var timegraph_hourendoffset;

        if(planEndHour == Options.workEndTime){
            timegraph_hourendwidth = $('#'+(planEndHour-1)+'g_00').width();
            timegraph_hourendoffset = $('#'+(planEndHour-1)+'g_00').position().left + timegraph_hourendwidth;
        }else{
            timegraph_hourendwidth = $('#'+planEndHour+'g_00').width();
            timegraph_hourendoffset = $('#'+planEndHour+'g_00').position().left + timegraph_hourendwidth*(planEndMin/60);
        }

        var planWidth   = timegraph_hourendoffset - timegraph_houroffset;
        var planLoc     = timegraph_houroffset;

        $('.selectedplan_indi').css({'top':timegraph_houroffsetb,'left':planLoc,'width':planWidth});
    }

    $(window).resize(function(){
        if($('#addpopup').css('display') == 'block'){
            $('.timegraph_plans_grey_trainee').remove()
            timeGraphSet("class","grey", "AddClass", ajaxJSON_cache);  //시간 테이블 채우기
            timeGraphSet("off","grey", "AddClass", ajaxJSON_cache);
        }


        if($('#addpopup').css('display') == 'block' && $('.selectedplan_indi').length != 0){
            addGraphIndicator(Options.classDur*Options.timeDur);
        }
    })


});//document(ready)





/*
var date = new Date();
var currentYear = date.getFullYear(); //현재 년도
var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
var currentDate = date.getDate(); //오늘 날짜
var currentHour = date.getHours(); //현재시간
var currentMinute = date.getMinutes();
var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31];      //각 달의 일수
if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
    lastDay[1] = 29;
}else{
    lastDay[1] = 28;
}
*/
var currentPageMonth = currentMonth+1; //현재 달
var date2 = new Date();
var oriYear = date.getFullYear();
var oriMonth = date.getMonth()+1;
var oriDate = date.getDate();


var availableStartTime = Options.stoptimeStart; //강사가 설정한 예약시작 시간 (시작)
var availableEndTime = Options.stoptimeEnd; //강사가 설정한 예약마감 시간 (종료)
var reserveOption = Options.reserve;
// var lecture_enable_test = 0;

function ajaxClassTime(referencedate, howmanydates, use, callback){
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
        url: '/trainee/get_trainee_schedule/',
        type : 'GET',
        data : {"date":today_form, "day":date_form},
        dataType : 'html',

        beforeSend:function(){
            beforeSend();
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            initialJSON = jsondata;
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show()
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                var temp_count_text = '';
                var temp_text = '';

                if(jsondata.lecture_reg_count[0] != 0){
                    temp_text +='1:1';
                    temp_count_text += jsondata.lecture_avail_count;
                }
                if(jsondata.group_lecture_reg_count[0] != 0){
                    if(temp_text == ''){
                        temp_text += '그룹';
                        temp_count_text += jsondata.group_lecture_avail_count;

                    }else {
                        temp_text += '/그룹';
                        temp_count_text = temp_count_text+'/'+jsondata.group_lecture_avail_count;
                    }
                }
                if(jsondata.class_lecture_reg_count[0] != 0){
                    if(temp_text == ''){
                        temp_text += '클래스';
                        temp_count_text += jsondata.class_lecture_avail_count;

                    }else {
                        temp_text += '/클래스';
                        temp_count_text = temp_count_text+'/'+jsondata.class_lecture_avail_count;
                    }
                }

                if(temp_text == '') {
                    temp_count_text = '0'
                }
                //     lecture_enable_test = 1;
                // }else{
                //     lecture_enable_test = 0;
                // }

                // if(jsondata.group_lecture_reg_count[0] != 0 && jsondata.lecture_reg_count[0] != 0 && jsondata.class_lecture_reg_count[0] != 0){
                    $('#countRemainData span:first-child').text(temp_count_text);
                    $('#countRemainData span:nth-of-type(2)').text('회 ('+temp_text+')');
                // }
                // else if(jsondata.group_lecture_reg_count[0] != 0){
                //     $('#countRemainData span:first-child').text(jsondata.group_lecture_avail_count)
                //     $('#countRemainData span:nth-of-type(2)').text('회 (그룹)')
                // }
                // else{
                //     $('#countRemainData span:first-child').text(jsondata.lecture_avail_count)
                //     $('#countRemainData span:nth-of-type(2)').text('회 (1:1)')
                // }


                $('.classTime,.offTime').parent().html('<div></div>')
                $('.blackballoon, .balloon').html('')
                $('.blackballoon').removeClass('blackballoon')
                $('.balloon').removeClass('balloon')
                $('.dateMytime').removeClass('dateMytime')
                $('.memo, .greymemo').text('').removeClass('greymemo')
                classDates(jsondata)
                groupDates(jsondata)

                if(use == "callback"){
                    callback(jsondata)
                }
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
    var count_date_info = classInfoProcessed(jsondata)
    var len = jsondata.classTimeArray_start_date.length;
    var already_added = []
    var startdate_dataArray = jsondata.classTimeArray_start_date;
    for(var i=0; i<len; i++){
        var finish = jsondata.scheduleFinishArray[i]
        var memo = jsondata.scheduleNoteArray[i]
        var classDate = date_format_yyyy_mm_dd_to_yyyy_m_d(startdate_dataArray[i].split(' ')[0], '_')
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
        var groupname = " - [";
        if(jsondata.schedule_group_name[i]==""){
            groupname += jsondata.schedule_group_type_cd_name[i]+"]";
        }
        else{
            groupname += jsondata.schedule_group_name[i]+"]";
        }
        // if(jsondata.group_schedule_start_datetime.indexOf(jsondata.classTimeArray_start_date[i]) == -1){
        //     var groupname = " - [1:1 레슨]"
        // }else{
        //     var index = jsondata.group_schedule_start_datetime.indexOf(jsondata.classTimeArray_start_date[i])
        //     var groupname = " - ["+jsondata.group_schedule_group_name[index]+"]"
        // }

        var index = count_date_info.dateResult.indexOf(jsondata.classTimeArray_start_date[i].split(' ')[0])
        var count = count_date_info.countResult[index]

        if(finish == '1'){
            var mobile = '<div class="monthplans_count"><img src="/static/user/res/icon-cal-mini.png">'+count+'</div>'
            var finishImg = '<div class="monthplans"><img src="/static/user/res/btn-pt-complete.png"><span>'+classTime+groupname+'</span></div>'
        }else if(finish == '0'){
            var mobile = '<div class="monthplans_count"><img src="/static/user/res/icon-cal-mini.png">'+count+'</div>'
            var finishImg = '<div class="monthplans"><span>'+classTime+groupname+'</span></div>'
        }

        if(already_added.indexOf(classDate) != -1){ //날짜 밑에 일정 카운트가 여러개 출력되는 것을 방지
            var month_daily_planview = finishImg
        }else{
            var month_daily_planview = finishImg + mobile
        }
        already_added.push(classDate)
        
        
        if(yy+mm+dd < oriYear+omm+odd){  // 지난 일정은 회색으로, 앞으로 일정은 핑크색으로 표기
            $("td[data-date="+classDate+"]").attr({'schedule-id':scheduleIdArray[i]})
            $("td[data-date="+classDate+"]").attr('data-schedule-check',scheduleFinishArray[i])
            $("td[data-date="+classDate+"] div._classDate").addClass('greydateMytime')
            if($("td[data-date="+classDate+"] div._classTime div").length <3){
                $("td[data-date="+classDate+"] div._classTime").addClass('balloon').append(month_daily_planview)
            }else if($("td[data-date="+classDate+"] div._classTime div").length == 3 ){
                $("td[data-date="+classDate+"] div._classTime").append('<div><span class="monthplans">…</span></div>')
            }
        }else{
            $("td[data-date="+classDate+"]").attr({'schedule-id':scheduleIdArray[i]})
            $("td[data-date="+classDate+"]").attr('data-schedule-check',scheduleFinishArray[i])
            $("td[data-date="+classDate+"] div._classDate").addClass('dateMytime')
            if($("td[data-date="+classDate+"] div._classTime div").length <3){
                $("td[data-date="+classDate+"] div._classTime").addClass('blackballoon').append(month_daily_planview)
            }else if($("td[data-date="+classDate+"] div._classTime div").length == 3 ){
                $("td[data-date="+classDate+"] div._classTime").append('<div><span class="monthplans">…</span></div>')
            }
            
        }
        


    }
}

function groupDates(jsondata){	//그룹 PT가 있는 날짜에 표기
    var len = jsondata.group_schedule_id.length;
    for(var i=0; i<len; i++){
        var classDate = date_format_yyyy_mm_dd_to_yyyy_m_d(jsondata.group_schedule_start_datetime[i].split(' ')[0], '_');
        var classDateSplit = date_format_yyyy_mm_dd_to_yyyy_m_d(jsondata.group_schedule_start_datetime[i].split(' ')[0], '_').split('_');
        var classTime = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':');
        var yy = classDateSplit[0];
        var mm = classDateSplit[1];
        var dd = classDateSplit[2];
        var hh = Number(classTime[0]);
        var min = Number(classTime[1]);
        var omm = String(oriMonth)
        var odd = String(oriDate)
        var day = new Date(`${yy}-${mm}-${dd}`).getDay();
        var worktime_today = Options.worktimeWeekly[day];
        var work_start = worktime_extract_hour(worktime_today)["start"];
        var work_end = worktime_extract_hour(worktime_today)["end"];

        if(hh >= work_start && hh < work_end ){
            if(mm.length==1){
                var mm = '0'+classDateSplit[1]
            }
            if(dd.length==1){
                var dd='0'+classDateSplit[2]
            }
            if(omm.length==1){
                var omm = '0'+oriMonth
            }
            if(odd.length==1){
                var odd='0'+oriDate
            }

            var group_plan_indicate = "<img src='/static/user/res/icon-group-setting.png' class='group_plan_indicate'>"
            var group_plan_indicate_past = "<img src='/static/user/res/icon-group-setting.png' class='group_plan_indicate_past'>"

            if(yy+mm+dd < oriYear+omm+odd){  // 지난 일정은 회색으로, 앞으로 일정은 핑크색으로 표기
                if($("td[data-date="+classDate+"] .group_plan_indicate_past").length == 0){
                    $("td[data-date="+classDate+"]").prepend(group_plan_indicate_past)
                }
            }else{
                if($("td[data-date="+classDate+"] .group_plan_indicate").length == 0){
                    $("td[data-date="+classDate+"]").prepend(group_plan_indicate)
                }
            }
        }
    }
}

function classInfoProcessed(jsondata){ //일정 갯수 세기
    var len = jsondata.scheduleIdArray.length;
    var len2 = jsondata.group_schedule_id.length;
    var countResult = [];
    var summaryArray = {};
    var summaryArray_group = {};
    var summaryArrayResult = [];

    var datasum = [];
    for(var i=0; i<len; i++){ //개인일정 객체화로 중복 제거
        summaryArray[jsondata.classTimeArray_start_date[i].split(' ')[0]] = jsondata.classTimeArray_start_date[i].split(' ')[0]
        datasum.push(jsondata.classTimeArray_start_date[i].split(' ')[0])
    }

    for(var i in summaryArray){ //개인일정 중복 제거된 배열
        summaryArrayResult.push(i)
    }

    var len2 = summaryArrayResult.length;
    for(var i=0; i<len2; i++){
        var scan = summaryArrayResult[i]
        countResult[i]=0
        for(var j=0; j<datasum.length; j++){
            if(scan == datasum[j]){
                countResult[i] = countResult[i]+1
            }
        }
    }
    return {"countResult":countResult, "dateResult":summaryArrayResult}
}

function get_trainee_reg_history(use, callback){
    $.ajax({
        url: '/trainee/get_trainee_lecture_list/',
        data:{"class_id":class_id[0], "auth_cd":'VIEW'},
        dataType : 'html',
        type:'GET',

        beforeSend:function(){
            //AjaxBeforeSend();
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show()
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                //draw_trainee_reg_history(jsondata,$('#myRegHistory'))
                if(use == "callback"){
                    callback(jsondata)
                }
                hide_if_dont_have_class_type(jsondata)
            }

        },

        complete:function(){

        },

        error:function(){
            console.log('server error')
        }
    })
}

function hide_if_dont_have_class_type(jsondata){
    var len = jsondata.groupTypeCdArray.length;
    var groupCount = 0;
    var personalCount = 0;
    for(var i=0; i<len; i++){
        if((jsondata.groupTypeCdArray[i] == "EMPTY" || jsondata.groupTypeCdArray[i] == "NORMAL") && jsondata.lectureStateArray[i] == "IP"){
            groupCount++
        }else if(jsondata.groupTypeCdArray[i] == "" && jsondata.lectureStateArray[i] == "IP"){
            personalCount++
        }
    }

    if(groupCount > 0 && personalCount == 0){
        $('.groupreserve').show()
        $('.personalreserve').hide()
        $('div.mode_switch_button[data-page="groupreserve"]').show().addClass('mode_active')
        $('div.mode_switch_button[data-page="personalreserve"]').hide()
    }else if(groupCount == 0 && personalCount > 0){
        $('.groupreserve').hide()
        $('.personalreserve').show()
        $('div.mode_switch_button[data-page="groupreserve"]').hide()
        $('div.mode_switch_button[data-page="personalreserve"]').show().addClass('mode_active')
    }else if(groupCount > 0 && personalCount > 0){

    }
}



// function clear_badge_counter(){
//     $.ajax({
//         url:'/login/clear_badge_counter/',
//         type:'POST',
//         //dataType : 'html',
//
//         beforeSend:function(){
//             //alert('before clear_badge_counter afsavf')
//             console.log('before')
//         },
//
//         //통신성공시 처리
//         success:function(){
//             //alert('test')
//             console.log('sucess')
//
//         },
//
//         //보내기후 팝업창 닫기
//         complete:function(){
//
//         },
//
//         //통신 실패시 처리
//         error:function(){
//             console.log('error')
//             //alert('error clear_badge_counter')
//             //console.log('error:clear_badge_counter')
//         },
//     })
// }


function month_calendar(referencedate){
    var page1 = $('.swiper-slide:nth-of-type(1)');
    var page2 = $('.swiper-slide:nth-of-type(2)');
    var page3 = $('.swiper-slide:nth-of-type(3)');

    page1.html('')
    page2.html('')
    page3.html('')

    var year = Number(referencedate.split('-')[0]);
    var month = Number(referencedate.split('-')[1]);
    calTable_Set(1,year,month-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
    calTable_Set(2,year,month);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
    calTable_Set(3,year,month+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기
}


function krHoliday(){ //대한민국 공휴일 날짜를 빨간색으로 표시
    for(var i=0; i<krHolidayList.length; i++){
        $("td[data-date="+krHolidayList[i]+"]").addClass('holiday');
        $("td[data-date="+krHolidayList[i]+"]").find('.holidayName').text(krHolidayNameList[i]);
    }
}

function monthText(){
    var currentYMD = $('.swiper-slide:nth-child(2) div:nth-child(1)').attr('id');
    //currentYMD 형식  ex : week120177
    var textYear = currentYMD.split('_')[1]
    var textMonth = currentYMD.split('_')[2]
    $('#yearText, #ymdText-pc-year').text(textYear);
    $('#monthText, #ymdText-pc-month').text(textMonth+'월');
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
        for(i=currentDate;i<currentDate+Options.availDate;i++){
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

function alltdRelative(){ //날짜 밑에 동그라미 색상표기를 위해 모든 td의 css 포지션 값 relative로 설정
    $('td').css('position','relative');
}


function calTable_Set(Index,Year,Month){ //선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
    if(Month>12){
        var Month = Month-12
        var Year = Year+1
    }else if(Month<1){
        var Month = Month+12
        var Year = Year-1
    }

    for(var i=1; i<=6; i++){
        $('.swiper-slide:nth-child('+Index+')').append('<div id="week'+i+'_'+Year+'_'+Month+'" class="container-fluid week-style">')
    }


    for(var i=1; i<=6; i++){
        $('.swiper-slide:nth-child('+Index+')'+' #week'+i+'_'+Year+'_'+Month).append('<table id="week'+i+Year+Month+'child" class="calendar-style"><tbody><tr></tr></tbody></table>');
    }

    calendarSetting(Year,Month);
} //calTable_Set


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
            $('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates"'+' data-date="'+Year+'_'+(Month-1)+'_'+j+'_past">'+'<span class="holidayName"></span>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>');
        }
    }else if(Month==1){ //1월
        for(var j=31-firstDayCurrentPage+1; j<=31 ;j++){
            $('#week1'+Year+Month+'child tbody tr').append('<td class="prevDates"'+' data-date="'+(Year-1)+'_'+(Month+11)+'_'+j+'+past">'+'<span class="holidayName"></span>'+'<span class="dateNum">'+j+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>');
        }
    }

    //2. 첫번째 주 채우기
    for(var i=1; i<=7-firstDayCurrentPage; i++){
        if(i==currentDate && Month==date.getMonth()+1 && currentYear==date.getFullYear()){ //오늘 날짜 진하게 표시하기
            $('#week1'+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'<span class="today">TODAY</span>'+'</td>');
        }else{
            $('#week1'+Year+Month+'child tbody tr').append('<td'+' data-date='+Year+'_'+Month+'_'+i+'>'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>');
        }
    }

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
    }

    //4. 현재달 마지막에 다음달 첫주 채우기
    var howmanyWeek6 = $('#week6'+'_'+Year+'_'+Month+' td').length;
    var howmanyWeek5 = $('#week5'+'_'+Year+'_'+Month+' td').length;

    if(howmanyWeek5<=7 && howmanyWeek6==0){
        for (var i=1; i<=7-howmanyWeek5;i++){
            if(Month<12){
                $('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date="'+Year+'_'+(Month+1)+'_'+i+'_next">'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>')
            }else if(Month==12){
                $('#week5'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date="'+(Year+1)+'_'+(Month-11)+'_'+i+'_next">'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>')
            }
        }
        ad_month($('#week6'+Year+Month+'child tbody tr')) //2017.11.08추가 달력이 5주일때, 비어있는 6주차에 광고 입력
    }else if(howmanyWeek6<7 && howmanyWeek6>0){
        for (var i=1; i<=7-howmanyWeek6;i++){
            if(Month<12){
                $('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date="'+Year+'_'+(Month+1)+'_'+i+'_next">'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>')
            }else if(Month==12){
                $('#week6'+Year+Month+'child tbody tr').append('<td class="nextDates"'+' data-date="'+(Year+1)+'_'+(Month-11)+'_'+i+'_next">'+'<span class="holidayName"></span>'+'<span class="dateNum">'+i+'</span>'+'<div class="_classDate">'+'</div>'+'<div class="_classTime"></div><div class="memo"></div>'+'</td>')
            }
        }
    }
    for(i=1;i<=6;i++){
        $('#week'+i+Year+Month+'child td:first-child').css({color:'#d21245'}); //일요일 날짜는 Red 표기
        $('#week'+i+Year+Month+'child td:last-child').css({color:'#115a8e'}); //토요일 날짜는 Blue 표기
    }
} //calendarSetting()