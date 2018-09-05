/*달력 만들기

 1. 각달의 일수를 리스트로 만들어 둔다.
 [31,28,31,30,31,30,31,31,30,31,30,31]
 2. 4년마다 2월 윤달(29일)
 year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
 3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

 */

$(document).ready(function(){
    $('#uptext').text("월간 일정")

    //ESC키를 눌러서 팝업 닫기
    $(document).keyup(function(e){
        if(e.keyCode == 27){
            if($('#subpopup_addByList_plan').css('display') == 'block'){
                close_addByList_popup()
            }else{
                if($('#memberInfoPopup_PC').css('display') == "block"){
                    closePopup('member_info_PC')
                }else{
                    close_info_popup('cal_popup_plandelete')
                    close_info_popup('cal_popup_planinfo')
                    close_info_popup('cal_popup_plancheck')
                    close_info_popup('page-addplan')
                }
            }
        }
    })
    //ESC키를 눌러서 팝업 닫기


    var schedule_on_off = 0;


    // setInterval(function(){ajaxCheckSchedule()}, 60000)// 자동 ajax 새로고침(일정가져오기)


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
    $(document).on('click', '.memberNameForInfoView, .groupParticipantsRow span', function(){
        var bodywidth = window.innerWidth;
        var dbID = $(this).attr('data-dbid');
        //$('.popups').hide()
        if(bodywidth < 600){
            $('.popups').hide();
            //$('#calendar').css('display','none')
            $('#calendar').css('height', '0');
            get_indiv_member_info(dbID);
            get_indiv_repeat_info(dbID);
            get_member_lecture_list(dbID);
            get_member_history_list(dbID);
            shade_index(100);
        }else if(bodywidth >= 600){
            get_indiv_member_info(dbID);
            get_indiv_repeat_info(dbID);
            get_member_lecture_list(dbID);
            get_member_history_list(dbID);
            $('.member_info_tool button._info_delete_img').hide();
            $('#info_shift_base, #info_shift_lecture').show();
            $('#info_shift_schedule, #info_shift_history').hide();
            $('#select_info_shift_lecture').addClass('button_active');
            $('#select_info_shift_schedule, #select_info_shift_history').removeClass('button_active');
        }
    });


    $('#upbutton-x').click(function(){
        var bodywidth = window.innerWidth;
        //$('#calendar').css('height','90%')
        if($(this).attr('data-page') == "addplan"){
            $('#page-addplan').css('display','none');
            if(bodywidth < 600){
                //$('#calendar').css('display','block');
                $('#calendar').css('height','100%');
            }
            $('#float_btn_wrap').show();
            $('#float_btn').removeClass('rotate_btn');
            $('#page-base').css('display','block');
            $('#page-base-addstyle').css('display','none');

            var text1 = '회원/그룹/클래스 선택';
            var text2 = '선택';
            if(Options.language == "KOR"){
                text1 = '회원/그룹/클래스 선택';
                text2 = '선택';
            }else if(Options.language == "JPN"){
                text1 = '「会員選択」';
                text2 = '「選択」';
            }else if(Options.language == "ENG"){
                text1 = 'Choose member';
                text2 = 'Choose';
            }
            $('.add_time_unit').removeClass('checked');
            $('.add_time_unit div').removeClass('ptersCheckboxInner_sm');
            $("#membersSelected .btn:first-child").html("<span style='color:#cccccc;'>"+text1+"</span>").val("");
            $("#countsSelected,.countsSelected").text("");
            //$("#dateSelector p").removeClass("dropdown_selected");
            $("#starttimesSelected button").html("<span style='color:#cccccc;'>"+text2+"</span>").val("");
            $("#durationsSelected button").html("<span style='color:#cccccc;'>"+text2+"</span>").val("");
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $("#starttimes, #durations").empty();
            $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');

            $('#page-addplan .dropdown_selected').removeClass('dropdown_selected');
            $('.dateButton').removeClass('dateButton_selected');
            $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate',null);
            $('#repeattypeSelected button, #repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>"+text2+"</span>");
            //$('#page-addplan form input').val('');
            selectedDayGroup = [];

            $('._NORMAL_ADD_wrap').css('display','block');
            $('._REPEAT_ADD_wrap').css('display','none');
            $('#timeGraph').css('display','none');
            shade_index(-100);
        }
    });


    $(document).on('click','#calendar td',function(){
        closeAlarm('pc')
        var thisDate = $(this).attr('data-date');
        var planDate_ = thisDate.replace(/_/gi,"-");
        var info = thisDate.split('_')
        if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                                </div>`)
        }else{
            if(!$(this).hasClass('nextDates') && !$(this).hasClass('prevDates')){
                deleteTypeSelect = ''
                var $cal_popup_plancheck = $('#cal_popup_plancheck');
                //$cal_popup_plancheck.css('display','block');
                $('#float_btn_wrap').hide();
                shade_index(100)

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
                plancheck(yy+'_'+mm+'_'+dd, initialJSON)
                if(bodywidth > 600){
                    $cal_popup_plancheck.css({'display':'block','top':(($(window).height()-$cal_popup_plancheck.outerHeight())/2+$(window).scrollTop()),'left':(($(window).width()-$cal_popup_plancheck.outerWidth())/2+$(window).scrollLeft())});
                }else{
                    $cal_popup_plancheck.css({'display':'block','top':'50%','left':'50%','transform':'translate(-50%, -50%)','position':'fixed'});
                }
                //disable_window_scroll();
                clicked_td_date_info = yy+'_'+mm+'_'+dd
            }


            if($('.plan_raw').height()*$('.plan_raw').length > $('#cal_popup_plancheck').height() ){
                if($('#cal_popup_plancheck > div:first-child').find('.scroll_arrow_top').length == 0){
                    $('#cal_popup_plancheck > div:first-child').append(
                                                        '<img src="/static/user/res/btn-today-left.png" class="scroll_arrow_top">'+
                                                        '<img src="/static/user/res/btn-today-left.png" class="scroll_arrow_bottom">'
                                                     )
                }
                $('.scroll_arrow_top, .scroll_arrow_bottom').css('visibility','visible');
                if($('.popup_inner_month').scrollTop() < 30 ){
                    $('.scroll_arrow_top').css('visibility','hidden');
                };
            }
        }
    })

    $('.popup_inner_month').scroll(function(e){
        e.stopPropagation();
        var scrollHeight = $(this).prop('scrollHeight');
        var popupHeight = $(this).height();
        var scrollLocation = $(this).scrollTop();

        if(popupHeight + scrollLocation == scrollHeight){
            $(this).animate({scrollTop : scrollLocation-1},10)
        }else if(popupHeight + scrollLocation == popupHeight){
            $(this).animate({scrollTop : scrollLocation+1},10)
        }

        // 좌측 스크롤 애로우 보이기
        if(popupHeight + scrollLocation < scrollHeight-30){
            $('.scroll_arrow_bottom').css('visibility','visible')
        }else{
            $('.scroll_arrow_bottom').css('visibility','hidden')
        }
        if(scrollLocation > 30){
            $('.scroll_arrow_top').css('visibility','visible')
        }else{
            $('.scroll_arrow_top').css('visibility','hidden')
        }
        //좌측 스크롤 애로우 보이기
    })

    //드랍다운리스트에서 위 화살표를 누르면 리스트의 맨위로 이동한다.
    $(document).on('click','img.scroll_arrow_top',function(e){
        e.stopPropagation();
        var $thisul = $('.popup_inner_month');
        var $thisul_scroll_height = $thisul.prop('scrollHeight');
        var $thisul_display_height = $thisul.height();
        if($(this).css('visibility') == 'visible'){
            $thisul.animate({scrollTop: 0},200)
        }
    });
    //드랍다운리스트에서 위 화살표를 누르면 리스트의 맨위로 이동한다.
    //드랍다운리스트에서 아래 화살표를 누르면 리스트의 맨아래로 이동한다.
    $(document).on('click','img.scroll_arrow_bottom',function(e){
        e.stopPropagation();
        var $thisul = $('.popup_inner_month');
        var $thisul_scroll_height = $thisul.prop('scrollHeight');
        var $thisul_display_height = $thisul.height();
        if($(this).css('visibility') == 'visible'){
            $thisul.animate({scrollTop: $thisul_scroll_height + $thisul_display_height},200)
        }
    });
    //드랍다운리스트에서 아래 화살표를 누르면 리스트의 맨아래로 이동한다.



    mini_popup_event()
    //일정을 클릭해서 나오는 미니 팝업의 이벤트 모음
    function mini_popup_event(){
        var bodywidth = window.innerWidth;
        //날짜를 클릭해서 나오는 일정들을 클릭했을때
        $(document).on('click','.plan_raw',function(){
            var selectedDate = $('.popup_ymdText').text();
            var thisDate = date_format_to_yyyymmdd(selectedDate,'-');
            if( (compare_date2(thisDate, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), thisDate)) && Options.auth_limit == 0 ){
                show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                                </div>`)
            }else{
                var group_type_name = $(this).attr('data-group-type-cd-name');
                var member = " 회원님의 ";
                var yourplan = " 일정";
                var text = group_type_name+" 일정";
                if(group_type_name == ''){
                    text = "1:1 레슨 일정"
                }
                switch(Options.language){
                    case "JPN" :
                        member = "様の ";
                        yourplan = " 日程";
                        text = 'PT 日程'
                        break;
                    case "ENG" :
                        member = "'s schedule at ";
                        yourplan = "";
                        text = 'PT Plan'
                        break;
                }
                shade_index(150)
                $('#popup_planinfo_title').text(text)
                var schedule_finish_check = $(this).attr('data-schedule-check')
                var dbid = $(this).attr('data-dbid');
                var name = $(this).attr('data-membername')
                //var selectedDate = $('.popup_ymdText').text()
                var selectedTime = $(this).find('.planchecktime').text().split(':')[0]
                var selectedMinute = $(this).find('.planchecktime').text().split(':')[1].split(' - ')[0]
                var selectedETime = $(this).find('.planchecktime').text().split('-')[1].split(':')[0]
                var selectedEMinute = $(this).find('.planchecktime').text().split('-')[1].split(':')[1]
                var selectedPerson = '<span class="memberNameForInfoView" data-dbid="'+dbid+'" data-name="'+$(this).attr('data-membername')+'">'+$(this).find('.plancheckname').text()+'</span>'
                var selectedMemo = $(this).attr('data-memo')
                if($(this).attr('data-memo') == undefined){
                    selectedMemo = ""
                }
                var stime_text = time_format_to_hangul(add_time(selectedTime+':'+selectedMinute,'00:00'));
                var etime_text = time_format_to_hangul(add_time(selectedETime+':'+selectedEMinute,'00:00'));
                //$("#cal_popup_planinfo").css('display','block').attr({'schedule-id':$(this).attr('schedule-id'), 'data-grouptype':$(this).attr('data-grouptype'), 'group_plan_finish_check':$(this).attr('data-schedule-check')})
                $('#popup_info3_memo').attr('readonly',true).css({'border':'0'});
                $('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'})
                $('#popup_info').text(selectedDate);

                $('#popup_info3_memo').text(selectedMemo).val(selectedMemo)

                $('#canvas').css({'border-color':'#282828'});
                $('#canvasWrap').css({'display':'none'});
                $('#inner_shade_planinfo').css('display','none');

                $("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
                $("#id_schedule_id_finish").val($(this).attr('schedule-id')); // shcedule 정보 저장
                $("#id_member_name").val(name); //회원 이름 저장
                $("#id_member_name_delete").val(name); //회원 이름 저장
                $('#id_member_dbid_delete').val(dbid);
                $("#id_member_name_finish").val(name); //회원 이름 저장
                $('#id_member_dbid_finish').val(dbid)
                $('#id_lecture_id_delete').val($(this).attr('data-lectureId'));
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
                    // $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image//spooner_test/'+$(this).attr('schedule-id')+'.png');
                    $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('schedule-id')+'.png');
                    var myImage = document.getElementById("id_sign_img");
                    myImage.onerror = function() {
                        //this.src="";
                        //$("#popup_sign_img").css("display","none")
                        $("#id_sign_img").attr('src','/static/user/res/auto_complete.png');
                    }
                }



                $('#subpopup_addByList_plan').hide()
                if($(this).attr('data-grouptype') == "group"){
                    $('#popup_info2').html('['+group_type_name+']'+name+'<br><span class="popuptimetext">'+stime_text + ' - ' + etime_text+'</span>');
                    $('#popup_btn_viewGroupParticipants').show().attr({'data-membernum': $(this).attr('data-membernum'),
                        'data-groupid': $(this).attr('data-groupid'),
                        'group-schedule-id':$(this).attr('schedule-id'),
                    })
                    //$("#popup_sign_img").css("display","none");
                    //$('#popup_btn_complete, #popup_btn_delete').addClass('disabled_button')
                    if(bodywidth > 600){
                        toggleGroupParticipantsList('on')
                    }else{
                        //$('#popup_btn_complete, #popup_btn_delete').removeClass('disabled_button')
                    }
                    schedule_on_off = 2;
                }else{
                    $('#popup_info2').html(selectedPerson+' 님'+ '<br><span class="popuptimetext">'+stime_text + ' - ' + etime_text+'</span>');
                    $('#popup_btn_viewGroupParticipants').hide()
                    toggleGroupParticipantsList('off')
                    schedule_on_off = 1;
                }
                if(bodywidth > 600){
                    $("#cal_popup_planinfo").css({'display':'block','top':(($(window).height()-$("#cal_popup_planinfo").outerHeight())/2+$(window).scrollTop()),'left':(($(window).width()-$("#cal_popup_planinfo").outerWidth())/2+$(window).scrollLeft())}).attr({'schedule-id':$(this).attr('schedule-id'), 'data-grouptype':$(this).attr('data-grouptype'), 'group_plan_finish_check':$(this).attr('data-schedule-check')});
                }else{
                    $('#cal_popup_planinfo').css({'display':'block','top':'50%','left':'50%','transform':'translate(-50%, -50%)','position':'fixed'}).attr({'schedule-id':$(this).attr('schedule-id'), 'data-grouptype':$(this).attr('data-grouptype'), 'group_plan_finish_check':$(this).attr('data-schedule-check')});
                }
            }
        })

        $(document).on('click','.plan_raw_add',function(){
            var thisDate = date_format_yyyy_m_d_to_yyyy_mm_dd($(this).attr('data-date'),'-');
            if( (compare_date2(thisDate, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), thisDate)) && Options.auth_limit == 0 ){
                show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                                </div>`)
            }else{
                close_info_popup('cal_popup_plancheck')
                clear_pt_off_add_popup()
                open_pt_off_add_popup('ptadd', thisDate)
                ajaxTimeGraphSet(thisDate)
                shade_index(100)
            }

        })


        //plan_raw 클릭해서 나오는 개별일정 [일정완료][일정삭제] 팝업의 X버튼
        $("#btn_close").click(function(){
            if($('#cal_popup_planinfo').css('display')=='block'){
                $("#cal_popup_planinfo").css({'display':'none'})
            }
        })

        //일정 취소 버튼 클릭
        $("#popup_btn_delete").click(function(){
            if(!$(this).hasClass('disabled_button')){
                if($(this).parent('#cal_popup_planinfo').attr('data-grouptype') == "group"){
                    deleteTypeSelect = "groupptdelete";
                }else{
                    deleteTypeSelect = "ptoffdelete";
                }
                shade_index(200);
                //$('#cal_popup_planinfo').hide()
                //$('#cal_popup_plandelete').css('display','block').attr({'schedule-id': $(this).parent('#cal_popup_planinfo').attr('schedule-id')})
                pop_up_delete_confirm( $(this).parent('#cal_popup_planinfo').attr('schedule-id') );
            }
        });

        function pop_up_delete_confirm(schedule_id){
            $('#popup_delete_question').html('정말 일정을 취소하시겠습니까?');
            $('#cal_popup_planinfo').hide();
            $('#cal_popup_plandelete').css('display', 'block').attr({"schedule-id":schedule_id});
        }

        //일정 취소 확인 팝업 아니오 버튼 눌렀을때 팝업 닫기
        $('#popup_delete_btn_no').click(function(){
            if($('#cal_popup_plandelete').css('display')=='block'){
                $("#cal_popup_plandelete").css({'display':'none'});
            }
        });



        //일정삭제 확인 팝업 예 버튼
        //var ajax_block_during_delete_monthcal = true
        $('#popup_delete_btn_yes').click(function(){
            var bodywidth = window.innerWidth;
            //if(ajax_block_during_delete_monthcal == true){
            if(!$(this).hasClass('disabled_button')){
                //ajax_block_during_delete_monthcal = false;
                disable_delete_btns_during_ajax()
                if(deleteTypeSelect == "repeatoffdelete" || deleteTypeSelect == "repeatptdelete"){ //일정등록창창의 반복일정 취소
                    var repeat_schedule_id = $('#id_repeat_schedule_id_confirm').val();
                    send_repeat_delete_personal(repeat_schedule_id, 'callback', function(jsondata){
                        close_info_popup('cal_popup_plandelete')
                        // set_schedule_time(jsondata)
                        ajaxClassTime()
                        get_repeat_info($('#cal_popup_repeatconfirm').attr('data-dbid'))
                        $('#members_mobile, #members_pc').html('');
                        get_current_member_list();
                        get_current_group_list();
                        if(deleteTypeSelect == "repeatptdelete"){
                            get_member_lecture_list($('#cal_popup_plandelete').attr('data-dbid'), 'callback', function (jsondata){
                                var availCount_personal = 0;
                                for (var i = 0; i < jsondata.availCountArray.length; i++) {
                                    if (jsondata.lectureStateArray[i] == "IP" && jsondata.groupNameArray[i] == "1:1 레슨") {
                                        availCount_personal = availCount_personal + Number(jsondata.availCountArray[i]);
                                    }
                                }
                                $("#countsSelected").text(availCount_personal);
                            });
                        }
                        //ajax_block_during_delete_monthcal = true;
                        enable_delete_btns_after_ajax();
                        $('#id_repeat_schedule_id_confirm').val('');
                    });
                }else if(deleteTypeSelect == "repeatgroupptdelete"){
                    var repeat_schedule_id = $('#id_repeat_schedule_id_confirm').val();
                    send_repeat_delete_group(repeat_schedule_id, 'callback', function(){
                        close_info_popup('cal_popup_plandelete');
                        get_repeat_info($('#cal_popup_repeatconfirm').attr('data-groupid'));
                        // set_schedule_time(jsondata)
                        ajaxClassTime();
                        $('#members_mobile, #members_pc').html('');
                        get_current_member_list();
                        get_current_group_list();
                        if(bodywidth >= 600){
                            $('#calendar').css('position', 'relative');
                        }
                        //ajax_block_during_delete_monthcal = true
                        enable_delete_btns_after_ajax();
                    });
                    // get_member_repeat_id_in_group_repeat(repeat_schedule_id, 'callback', function(jsondata){
                    // 	for(var i=0; i<jsondata.repeatScheduleIdArray.length; i++){
                    // 		send_repeat_delete_personal(jsondata.repeatScheduleIdArray[i])
                    // 	}
                    // })
                }else if(deleteTypeSelect == "ptoffdelete"){
                    if(schedule_on_off==1){
                        //PT 일정 취소시
                        var dbid = $('#id_member_dbid_delete').val();
                        var lecture_id = $("#id_lecture_id_delete").val();
                        var member_name = $('#id_member_name_delete').val();
                        var data_prev;
                        get_member_lecture_list(dbid, "callback", function(jsondata){
                            var index = jsondata.lectureIdArray.indexOf(lecture_id);
                            data_prev = jsondata.remCountArray[index];
                            send_plan_delete('pt', 'callback', function(){
                                enable_delete_btns_after_ajax();
                                get_member_lecture_list(dbid, "callback", function(jsondata){
                                    var index = jsondata.lectureIdArray.indexOf(lecture_id);
                                    if(jsondata.remCountArray[index] == "1" && data_prev == "0"){
                                        notice_lecture_status_changed_to_inprogress(jsondata.groupNameArray[index], member_name);
                                    }
                                });
                                $('#members_mobile, #members_pc').html('');
                                get_current_member_list();
                                get_current_group_list();
                            });
                        });
                    }else{
                        //OFF 일정 취소
                        send_plan_delete('off', 'callback', function(){
                            enable_delete_btns_after_ajax();
                        })
                        $('#members_mobile, #members_pc').html('');
                        get_current_member_list();
                        get_current_group_list();
                    }
                    //ajax_block_during_delete_monthcal = true
                }else if(deleteTypeSelect == "groupptdelete"){
                    var group_schedule_id = $(this).parent('#cal_popup_plandelete').attr('schedule-id');
                    // send_plan_delete('group', 'callback', function(){})
                    // get_group_plan_participants(group_schedule_id, 'callback', function(jsondata){
                    // 	for(var i=0; i<jsondata.scheduleIdArray.length; i++){
                    // 		$('#id_member_dbid_delete').val(jsondata.db_id[i])
                    // 		$('#id_schedule_id').val(jsondata.scheduleIdArray[i])
                    // 		if(i == jsondata.scheduleIdArray.length-1){
                    // 			send_plan_delete('pt', 'callback', function(json){
                    // 				// set_schedule_time(json)
                    // 				ajaxClassTime()
                    //  				close_info_popup('cal_popup_plandelete')
                    //  				completeSend();
                    // 			})
                    // 		}else{
                    // 			send_plan_delete('pt', 'callback', function(){})
                    // 		}
                    // 	}
                    // 	if(jsondata.scheduleIdArray.length == 0){
                    // 		ajaxClassTime()
                    //  		close_info_popup('cal_popup_plandelete')
                    //  		completeSend();
                    // 	}
                    // })
                    //ajax_block_during_delete_monthcal = true
                    send_plan_delete('group', 'callback', function(){
                        //ajax_block_during_delete_weekcal = true
                        enable_delete_btns_after_ajax();
                        $('#members_mobile, #members_pc').html('');
                        get_current_member_list();
                        get_current_group_list();
                    });
                }
            }

            function disable_delete_btns_during_ajax(){
                $('#popup_delete_btn_yes, #popup_delete_btn_no').addClass('disabled_button');
                //ajax_block_during_delete_weekcal = false;
            }

            function enable_delete_btns_after_ajax(){
                $('#popup_delete_btn_yes, #popup_delete_btn_no').removeClass('disabled_button');
                //ajax_block_during_delete_weekcal = false;
            }
        })

        //일정 완료 버튼 클릭
        //var ajax_block_during_complete_monthcal = true
        $("#popup_btn_complete").click(function(){  //일정 완료 버튼 클릭
            $('#canvas, #canvasWrap').css('display','block');
            $('#inner_shade_planinfo').css('display','block');
            $("#popup_btn_sign_complete").css({'color':'#282828','background':'#ffffff'}).val('');
            var $popup = $('#cal_popup_planinfo');
            var $signcomplete_button = $('#popup_btn_sign_complete');
            if($popup.attr('data-grouptype') == "class"){
                $signcomplete_button.attr('data-signtype','class');
            }else if($popup.attr('data-grouptype') == "group"){
                $signcomplete_button.attr('data-signtype','group');
            }
            disable_window_scroll();
        });


        $("#popup_btn_sign_complete").click(function(){
            enable_window_scroll();
            if($(this).val()!="filled" && !$(this).hasClass('disabled_button')){
                $('#canvas').show();
                $('#canvasWrap').animate({'height':'200px'}, 200);
                $('#canvasWrap span').show();
                if(schedule_on_off == 2){
                    toggleGroupParticipantsList('on');
                }
            }else if($(this).val()=="filled" && !$(this).hasClass('disabled_button')){
                //ajax_block_during_complete_monthcal = false
                disable_popup_btns_during_ajax();
                if(schedule_on_off == 1){
                    //PT 일정 완료 처리시
                    send_plan_complete('callback', function(json, senddata){
                        send_memo("blank");
                        signImageSend(senddata);
                        close_info_popup('cal_popup_planinfo');
                        completeSend();
                        ajaxClassTime();
                        enable_popup_btns_after_ajax();
                    });

                }else if(schedule_on_off == 2){
                    var len = $('#groupParticipants .groupParticipantsRow').length;
                    $('#id_group_schedule_id_finish').val($('#cal_popup_planinfo').attr('schedule-id'));
                    if(len == 0){
                        send_group_plan_complete('callback', function(json, senddata){
                            send_memo("blank");
                            signImageSend(senddata);
                            completeSend();
                            ajaxClassTime();
                            close_info_popup('cal_popup_planinfo');
                            enable_popup_btns_after_ajax();
                        });

                    }else{
                        send_group_plan_complete('callback', function(json, senddata){
                            send_memo("blank");
                            signImageSend(senddata);
                            completeSend();
                            ajaxClassTime();
                            close_info_popup('cal_popup_planinfo');
                            enable_popup_btns_after_ajax();
                        });
                    }
                }
            }
        });

        $('#popup_btn_sign_close').click(function(){ //사인 창 닫기
            close_sign_popup();
        });

        function close_sign_popup(){
            enable_window_scroll();
            $('#canvasWrap').css('display','none');
            $('#canvas').css({'border-color':'#282828','display':'none'});
            $("#popup_btn_sign_complete").css({'color':'#282828','background':'#ffffff'}).val('');
            $('#inner_shade_planinfo').css('display','none');
        }

        function disable_popup_btns_during_ajax(){
            $("#popup_btn_sign_complete, #popup_btn_delete").addClass('disabled_button');
        }

        function enable_popup_btns_after_ajax(){
            $("#popup_btn_sign_complete, #popup_btn_delete").removeClass('disabled_button');
        }


        //미니 팝업 메모수정
        $('#popup_info3_memo_modify').click(function(){
            if($(this).attr('data-type') == "view"){
                $('#popup_info3_memo').attr('readonly',false).css({'border':'1px solid #fe4e65'});
                $(this).attr({'src':'/static/user/res/btn-pt-complete.png','data-type':'modify'});
            }else if($(this).attr('data-type') == "modify"){
                $('#popup_info3_memo').attr('readonly',true).css({'border':'0'});
                $(this).attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'});
                send_memo()
            }
        })

        function closeAddPlanPopup(){
            $('#page-addplan').css('display','none');
            $('._NORMAL_ADD_wrap').css('display','block');
            $('._REPEAT_ADD_wrap').css('display','none');
            $('#timeGraph').css('display','none');
        }
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
                    "badge": badge_counter,
                    "sound": "default"
                }
            }),

            beforeSend:function(){
                console.log('test_ajax');
            },

            success:function(response){
                console.log(response);
            },

            complete:function(){
            },

            error:function(){
                console.log('server error');
            }
        });
    }

    //PC버전 새로고침 버튼
    $('.ymdText-pc-add-refresh').click(function(){
        ajaxClassTime();
    });
    //PC버전 새로고침 버튼



    $('#ng_popup').click(function(){

        $(this).fadeOut(100);
    });

    function closeDeletePopup(){
        if($('#cal_popup_plandelete').css('display')=='block'){
            $("#cal_popup_plandelete").css({'display':'none'});
        }
        if($('#cal_popup_planinfo').css('display')=='block'){
            $("#cal_popup_planinfo").css({'display':'none'});
        }
    }






//여기서부터 월간 달력 만들기 코드////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    calTable_Set(1,currentYear,currentPageMonth-1); //1번 슬라이드에 현재년도, 현재달 -1 달력채우기
    calTable_Set(2,currentYear,currentPageMonth);  //2번 슬라이드에 현재년도, 현재달 달력 채우기
    calTable_Set(3,currentYear,currentPageMonth+1); //3번 슬라이드에 현재년도, 현재달 +1 달력 채우기
    */
    month_calendar(today_YY_MM_DD);
    $('.swiper-slide-active').css('width', $('#calendar').width());

    /*
    monthText(); //상단에 연, 월 표시
    krHoliday(); //대한민국 공휴일
    draw_time_graph(Options.hourunit,'')
    ajaxClassTime()
    */

    


    //다음페이지로 슬라이드 했을때 액션
    myswiper.on('onSlideNextEnd',function(){
        /*
        ++currentPageMonth;
        if(currentPageMonth+1>12){
            ++currentYear
            currentPageMonth = currentPageMonth - 12;
            slideControl.append();
        }else{
            slideControl.append();
        };
        */
        slideControl.append();
    });

    //이전페이지로 슬라이드 했을때 액션
    myswiper.on('onSlidePrevEnd',function(){
        /*
        --currentPageMonth;
        if(currentPageMonth-1<1){
            --currentYear
            currentPageMonth = currentPageMonth + 12;
            slideControl.prepend();
        }else{
            slideControl.prepend();
        };
        */
        slideControl.prepend();
    });


    //페이지 이동에 대한 액션 클래스
    var slideControl = {
        'append' : function(){ //다음페이지로 넘겼을때
            var selector_swiper_slide_last_child = $('.swiper-slide:last-child');
            var lastdateinfo = selector_swiper_slide_last_child.find('.container-fluid').attr('id').split('_');
            var lastYY = Number(lastdateinfo[1]);
            var lastMM = Number(lastdateinfo[2]);

            myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
            myswiper.appendSlide('<div class="swiper-slide"></div>'); //마지막 슬라이드에 새슬라이드 추가
            //(디버깅용 날짜 표시)myswiper.appendSlide('<div class="swiper-slide">'+currentYear+'년'+Number(currentPageMonth+1)+'월'+' currentPageMonth: '+Number(currentPageMonth+1)+'</div>') //마지막 슬라이드에 새슬라이드 추가
            calTable_Set(3,lastYY,lastMM+1); //새로 추가되는 슬라이드에 달력 채우기
            //dateDisabled();
            monthText();
            krHoliday();
            //availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
            ajaxClassTime();
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
            calTable_Set(1, firstYY, firstMM-1);
            //dateDisabled();
            monthText();
            krHoliday();
            //availableDateIndicator(notAvailableStartTime,notAvailableEndTime);
            ajaxClassTime();
            myswiper.update(); //이전페이지로 넘겼을때

        }
    };


    function dateDisabled(){ //PT 불가일자를 DB로부터 받아서 disabledDates 배열에 넣으면, 날짜 회색 표시
        for(var i=0; i<disabledDates.length; i++){
            $("td[data-date="+disabledDates[i]+"] div").addClass('dateDisabled');
        };
    };

    /*
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
     */


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
});//document(ready)


var clicked_td_date_info;
function ajaxClassTime(use, callfunction){
    var beforeSend_;
    var completeSend_;
    if(use == "callbefore"){
        beforeSend_ = function(){beforeSend('callback', function(){callfunction();})};
        completeSend_ = function(){completeSend()};
    }else if(use == "callafter"){
        beforeSend_ = function(){beforeSend()};
        completeSend_ = function(){completeSend('callback', function(){callfunction();})};
    }else{
        beforeSend_ = function(){beforeSend()};
        completeSend_ = function(){completeSend()};
    }

    var yyyy = $('#yearText').text();
    var mm = $('#monthText').text().replace(/월/gi,"");
    if(mm.length<2){
        var mm = '0' + mm;
    }
    var today_form = yyyy+'-'+ mm +'-'+"01";

    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('ajaxClassTime')
    $.ajax({
        url: '/trainer/get_trainer_schedule/',
        type : 'GET',
        data : {"date":today_form, "day":46},
        dataType : 'html',

        beforeSend:function(){
            beforeSend_();
            $('.ymdText-pc-add-off, .ymdText-pc-add-pt').addClass('disabled_button').attr('onclick', '');
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                set_schedule_time(jsondata);
            }

            completeSend_();

        },

        complete:function(){
            $('.ymdText-pc-add div').removeClass('disabled_button');
            $('.ymdText-pc-add-pt').attr('onclick','float_btn_addplan(1)');
            $('.ymdText-pc-add-off').attr('onclick','float_btn_addplan(2)');
        },

        error:function(){
            console.log('server error');
        }
    })
}

function set_schedule_time(jsondata){
    initialJSON = jsondata;
    classDatesTrainer(jsondata);
    plancheck(clicked_td_date_info, jsondata);
}


function classDatesTrainer(jsondata){
    $('._classTime').html('');
    var planInfo = classInfoProcessed(jsondata);
    var dateResult = planInfo.dateResult;
    var countResult = planInfo.countResult;
    var len = planInfo.dateResult.length;
    for(var i=0; i<len; i++){
        var planDate_ = dateResult[i];
        var yy = dateResult[i].split('-')[0];
        var mm = dateResult[i].split('-')[1];
        var dd = dateResult[i].split('-')[2];
        var omm = String(oriMonth);
        var odd = String(oriDate);
        if(omm.length==1){
            var omm = '0'+oriMonth;
        }
        if(odd.length==1){
            var odd='0'+oriDate;
        }
        var dateTarget = yy+'_'+Number(mm)+'_'+Number(dd);
        if(yy+mm+dd < oriYear+omm+odd){  // 지난 일정은 회색으로, 앞으로 일정은 핑크색으로 표기
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                $("td[data-date="+dateTarget+"]").attr('schedule-id',jsondata.scheduleIdArray[i]);
                $("td[data-date="+dateTarget+"] div._classTime").addClass('balloon_trainer').html('<img src="/static/user/res/icon-cal-mini.png">'+countResult[i])
                $("td[data-date="+dateTarget+"] div._classDate").addClass('greydateMytime');
            }
        }else{
            if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            }else{
                $("td[data-date="+dateTarget+"]").attr('schedule-id',jsondata.scheduleIdArray[i]);
                $("td[data-date="+dateTarget+"] div._classTime").addClass('blackballoon_trainer').html('<img src="/static/user/res/icon-cal-mini.png">'+countResult[i])
                $("td[data-date="+dateTarget+"] div._classDate").addClass('dateMytime');
            }
        }
    };
}

function classInfoProcessed(jsondata){
    var len = jsondata.scheduleIdArray.length;
    var len2 = jsondata.group_schedule_id.length;
    var countResult = [];
    var summaryArray = {};
    var summaryArray_group = {};
    var summaryArrayResult = [];

    var datasum = [];
    for(var i=0; i<len; i++){ //개인일정 객체화로 중복 제거
        summaryArray[jsondata.classTimeArray_start_date[i].split(' ')[0]] = jsondata.classTimeArray_start_date[i].split(' ')[0]
        if(jsondata.group_schedule_start_datetime.indexOf(jsondata.classTimeArray_start_date[i]) == -1){
            datasum.push(jsondata.classTimeArray_start_date[i].split(' ')[0])
        }else{

        }
    }
    for(var i in summaryArray){ //개인일정 중복 제거된 배열
        summaryArrayResult.push(i)
    }


    for(var i=0; i<len2; i++){ //그룹 객체화로 중복 제거
        summaryArray_group[jsondata.group_schedule_start_datetime[i].split(' ')[0]] = jsondata.group_schedule_start_datetime[i].split(' ')[0]
        datasum.push(jsondata.group_schedule_start_datetime[i].split(' ')[0])
    }
    for(var i in summaryArray_group){ //그룹 중복 제거된 배열
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


function plancheck(dateinfo, jsondata){ // //2017_11_21_21_00_1_김선겸_22_00 //dateinfo = 2017_11_5
    var len1 = jsondata.scheduleIdArray.length;
    var len2 = jsondata.group_schedule_id.length;
    var dateplans = []
    // var groupmaxarray = []

    for(var i=0; i<len2; i++){  //시간순 정렬을 위해 'group' 정보를 가공하여 dateplans에 넣는다.
        var grouptype = "group";
        var dbID = '';
        var group_id = jsondata.group_schedule_group_id[i];
        var scheduleID = jsondata.group_schedule_id[i];
        var classLectureID = '';
        var scheduleFinish = jsondata.group_schedule_finish_check[i];
        var memoArray = jsondata.group_schedule_note[i];
        var yy = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[0];
        var mm = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[1];
        var dd = jsondata.group_schedule_start_datetime[i].split(' ')[0].split('-')[2];
        var stime1 = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[0];
        var etime1 = jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[0];
        var sminute = jsondata.group_schedule_start_datetime[i].split(' ')[1].split(':')[1];
        var eminute = jsondata.group_schedule_end_datetime[i].split(' ')[1].split(':')[1];
        var groupmax = jsondata.group_schedule_max_member_num[i];
        var groupcurrent = jsondata.group_schedule_current_member_num[i];
        var groupParticipants = '(' + groupcurrent + '/' + groupmax + ')';
        var name = jsondata.group_schedule_group_name[i]+groupParticipants;
        var group_type_cd_name = jsondata.group_schedule_group_type_cd_name[i];
        if(stime1.length<2){
            var stime1 = '0'+stime1
        }else if(stime1 == '24'){
            var stime1 = '00'
        }
        var stime = stime1+'_'+sminute
        var etime = etime1+'_'+eminute
        var ymd = yy+'_'+Number(mm)+'_'+Number(dd)
        if(ymd == dateinfo){
            dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_'+dbID+'_'+grouptype+'_'+group_id+'_'+group_type_cd_name+'_'+groupmax+'_/'+memoArray)
            // groupmaxarray.push(groupmax)
        }
    }

    for(var i=0; i<len1; i++){  //시간순 정렬을 위해 'class' 정보를 가공하여 dateplans에 넣는다.
        var grouptype = "class"
        var dbID = jsondata.classTimeArray_member_id[i]
        var group_id = ''
        var scheduleID = jsondata.scheduleIdArray[i]
        var classLectureID = jsondata.classArray_lecture_id[i]
        var scheduleFinish = jsondata.scheduleFinishArray[i]
        var memoArray = jsondata.scheduleNoteArray[i]
        var yy = jsondata.classTimeArray_start_date[i].split(' ')[0].split('-')[0]
        var mm = jsondata.classTimeArray_start_date[i].split(' ')[0].split('-')[1]
        var dd = jsondata.classTimeArray_start_date[i].split(' ')[0].split('-')[2]
        var stime1 = jsondata.classTimeArray_start_date[i].split(' ')[1].split(':')[0]
        var etime1 = jsondata.classTimeArray_end_date[i].split(' ')[1].split(':')[0]
        var sminute = jsondata.classTimeArray_start_date[i].split(' ')[1].split(':')[1]
        var eminute = jsondata.classTimeArray_end_date[i].split(' ')[1].split(':')[1]
        var group_type_cd_name = '';
        if(stime1.length<2){
            var stime1 = '0'+stime1
        }else if(stime1 == '24'){
            var stime1 = '00'
        }
        var stime = stime1+'_'+sminute
        var etime = etime1+'_'+eminute
        // var name = '[1:1 레슨]'+jsondata.classTimeArray_member_name[i]
        var name = ''+jsondata.classTimeArray_member_name[i]
        var ymd = yy+'_'+Number(mm)+'_'+Number(dd)
        if(ymd == dateinfo && jsondata.group_schedule_start_datetime.indexOf(jsondata.classTimeArray_start_date[i]) == -1){
            groupmax = 1
            dateplans.push(stime+'_'+etime+'_'+name+'_'+ymd+'_'+scheduleID+'_'+classLectureID+'_'+scheduleFinish+'_'+dbID+'_'+grouptype+'_'+group_id+'_'+group_type_cd_name+'_'+groupmax+'_/'+memoArray)
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
            var name = splited[4];
            // var groupo_type_cd_name = '';
            var textsize = ""
            if(splited[14] != ''){
                name = '['+splited[14]+'] '+splited[4];
            }

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
                htmltojoin.push('<div class="plan_raw" title="완료 된 일정" data-grouptype="'+splited[12]+'" data-groupid="'+splited[13]+'" data-group-type-cd-name="'+splited[14]+'" data-membernum="'+splited[15]+'" data-dbid="'+splited[11]+'" schedule-id="'+splited[8]+'"  data-lectureid="'+splited[9]+'" data-schedule-check="'+splited[10]+'" data-memberName="'+splited[4]+'" data-memo="'+dateplans[i-1].split('_/')[1]+'">'+
                                    '<div class="plancheckmorningday">'+morningday+'</div>'+
                                    '<div class="planchecktime">'+stime+':'+sminute+' - '+etime+':'+eminute+'</div>'+
                                    '<div class="plancheckname"><img src="/static/user/res/btn-pt-complete.png">'+'<p '+textsize+'>'+name+'</p></div>'+
                                '</div>')

            }else if(splited[10] == 0){
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
    htmltojoin.push('<div class="plan_raw_blank plan_raw_add" data-date="'+dateinfo+'"><img src="/static/user/res/floatbtn/btn-plus.png" style="width:20px;cursor:pointer;"></div>')


    $('#cal_popup_plancheck .popup_inner_month').html(htmltojoin.join(''))
}

function send_plan_complete(use, callback){
    var $pt_finish_form = $('#pt-finish-form');
    var drawCanvas = document.getElementById('canvas');
    var send_data = $pt_finish_form.serializeArray();
    send_data.push({"name":"upload_file", "value":drawCanvas.toDataURL('image/png')})
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
                if(jsondata.push_lecture_id.length>0){
                    for(var i=0; i<jsondata.push_lecture_id.length; i++) {
                        send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i])
                    }
                }
                if(use == "callback"){
                    callback(jsondata, send_data)
                }
            }
        },

        //보내기후 팝업창 닫기
        complete:function(){

        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.")
        },
    })
}

function send_group_plan_complete(use, callback){
    var $group_finish_form = $('#group-finish-form');
    var drawCanvas = document.getElementById('canvas');
    var send_data = $group_finish_form.serializeArray();
    send_data.push({"name":"upload_file", "value":drawCanvas.toDataURL('image/png')})
    $.ajax({
        url:'/schedule/finish_group_schedule/',
        type:'POST',
        data: send_data,

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
                if(use == "callback"){
                    callback(jsondata, send_data)
                }
            }

        },

        //보내기후 팝업창 닫기
        complete:function(){

        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.")
        },
    })
}



function send_memo(option){
    var schedule_id = $('#cal_popup_planinfo').attr('schedule-id');
    var memo = $('#popup_info3_memo').val()
    $.ajax({
        url:'/schedule/update_memo_schedule/',
        type:'POST',
        data:{"schedule_id":schedule_id,"add_memo":memo},

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            //beforeSend();
        },

        //통신성공시 처리
        success:function(data){
            if(option == "blank"){

            }else{
                ajaxClassTime()
            }
        },

        //보내기후 팝업창 닫기
        complete:function(){
            //ajaxClassTime()
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.")
        },
    })
}

function signImageSend(send_data){
    $.ajax({
        url:'/schedule/upload_sign_image/',
        type:'POST',
        data:send_data,

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
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
            console.log('sign_image_save_fail')
        },
    })
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

    monthText(); //상단에 연, 월 표시
    krHoliday(); //대한민국 공휴일
    //draw_time_graph(Options.hourunit,'')
    ajaxClassTime()
}
/*
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
    };


    for(var i=1; i<=6; i++){
        $('.swiper-slide:nth-child('+Index+')'+' #week'+i+'_'+Year+'_'+Month).append('<table id="week'+i+Year+Month+'child" class="calendar-style"><tbody><tr></tr></tbody></table>');
    };
    calendarSetting(Year,Month);
}; //calTable_Set
*/

function calTable_Set(Index,Year,Month){ //선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
    if(Month>12){
        var Month = Month-12
        var Year = Year+1
    }else if(Month<1){
        var Month = Month+12
        var Year = Year-1
    }

    var $targetHTML = $('.swiper-slide:nth-child('+Index+')');

    var htmltojoin = [];
    for(var i=1; i<=6; i++){
        var child = '<table id="week'+i+Year+Month+'child" class="calendar-style"><tbody><tr></tr></tbody></table>'
        htmltojoin.push('<div id="week'+i+'_'+Year+'_'+Month+'" class="container-fluid week-style">'+child+'</div>')
    };

    $targetHTML.html(htmltojoin.join(''))

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
    var howmanyWeek6 = $('#week6'+'_'+Year+'_'+Month+' td').length;
    var howmanyWeek5 = $('#week5'+'_'+Year+'_'+Month+' td').length;

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

function ad_month(selector){ // 월간 달력 하단에 광고
    selector.html('<img src="/static/user/res/PTERS_logo.jpg" alt="logo" class="admonth">').css({'text-align':'center'})
}

function krHoliday(){ //대한민국 공휴일 날짜를 빨간색으로 표시
    for(var i=0; i<krHolidayList.length; i++){
        $("td[data-date="+krHolidayList[i]+"]").addClass('holiday');
        $("td[data-date="+krHolidayList[i]+"]").find('.holidayName').text(krHolidayNameList[i])
    };
};

function monthText(){
    var currentYMD = $('.swiper-slide:nth-child(2) div:nth-child(1)').attr('id');
    //currentYMD 형식  ex : week120177
    var textYear = currentYMD.split('_')[1]
    var textMonth = currentYMD.split('_')[2] //7
    $('#yearText, #ymdText-pc-year').text(textYear);
    $('#monthText, #ymdText-pc-month').text(textMonth+'월');
    todayFinderArrow(textYear,textMonth);
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