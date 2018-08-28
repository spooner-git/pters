////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                //일정표에서 공통으로 쓰이는 팝업 관련 이벤트/함수
                                //PTERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////일정 클릭 이벤트
    //if(bodywidth > 600){
        var eventstart = 'mouseenter'
        var eventend = 'mouseleave'
    //}else{
        //var eventstart = 'touchstart'
        //var eventend = 'touchend'
    //}

    $(document).on(eventstart,'div.classTime, div.offTime, div.groupTime',function(e){
        e.stopPropagation();
        e.preventDefault();
        var thisWidth = $(this).width();
        var thisHeight = $(this).height();
        var thisTop = $(this).offset().top;
        var cssthisTop = Number($(this).css('top').replace(/px/gi,""))
        var thisZindex = $(this).css('z-index');

        var hoverHeight;
        var hoverWidth = thisWidth+2;
        if(thisHeight < 30){
            var hoverHeight = 32;
        }else{
            var hoverHeight = thisHeight + 2;
        }

        var hoveredBottomLoc = thisTop + hoverHeight;
        var calbottom = $('.timeindex .hour:last-child').offset().top + $('.timeindex .hour:last-child').height();

        var small_plan = 0;
        if(calbottom - thisTop < 25 ){
            $(this).css({'height':hoverHeight, 'width':hoverWidth, 'z-index':150, 'border':'2px solid #fe4e65', 'left':0, 'top': cssthisTop + calbottom - hoveredBottomLoc });
            small_plan = 1;
        }else{
            $(this).css({'height':hoverHeight, 'width':hoverWidth, 'z-index':150, 'border':'2px solid #fe4e65', 'left':0});
        }

        var $memberName = $(this).find('.memberName');
        var $memberTime = $(this).find('.memberTime');
        if($memberName.hasClass('hideelement')){
            $memberName.removeClass('hideelement').addClass('_hided');
            $memberTime.removeClass('hideelement').addClass('_hided');
        }


        $(document).on(eventend,'div.classTime, div.offTime, div.groupTime',function(e){
            if(bodywidth > 600){
                if(small_plan == 1){
                    $(this).css({'height':thisHeight, 'width':'99%', 'z-index':thisZindex, 'border':'0', 'left':1, 'top':cssthisTop});
                    small_plan = 0;
                }else{
                    $(this).css({'height':thisHeight, 'width':'99%', 'z-index':thisZindex, 'border':'0', 'left':1}); 
                }
           }else{
                if(small_plan == 1){
                    $(this).css({'height':thisHeight, 'width':'99%', 'z-index':thisZindex, 'border':'0', 'top':cssthisTop}); 
                }else{
                    $(this).css({'height':thisHeight, 'width':'99%', 'z-index':thisZindex, 'border':'0'}); 
                }
                
           }
            
            if($memberName.hasClass('_hided')){
                $memberName.removeClass('_hided').addClass('hideelement');
                $memberTime.removeClass('_hided').addClass('hideelement');
            }
        })
    })



    $(document).on('click','div.classTime',function(e){ //일정을 클릭했을때 팝업 표시
        e.stopPropagation();
        var info = $(this).attr('class-time').split('_');
        var yy=info[0];
        var mm=info[1];
        var dd=info[2];
        var thisIdDate_ = `${yy}-${mm}-${dd}`;
        if( (compare_date2(thisIdDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), thisIdDate_)) && Options.auth_limit == 0 ){
                show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                                </div>`)
        }else{
            $('#float_btn_wrap').hide();
            shade_index(100);
            closeAlarm('pc');
            toggleGroupParticipantsList('off');
            $('.pt_memo_guide_popup').css('display','block');
            $('#subpopup_addByList_plan, #popup_btn_viewGroupParticipants').hide();
            deleteTypeSelect = '';
            addTypeSelect ='ptadd';
            var dbid = $(this).attr('data-dbid');
            var time = info[3];
            if(time == 24){
                time = 0;
            }
            var minute = info[4];
            var classdur = info[5];
            var classdurTime = parseInt(info[5]) + "시간 ";
            var classdurMin = "";
            if(classdur.indexOf('.')){
                classdurMin = "30분";
            }else{
                classdurMin = "";
            }
            var dur = '('+classdurTime + classdurMin+')';
            var dayobj = new Date(yy,mm-1,dd);
            var dayraw = dayobj.getDay();
            var dayarryKR = ['일','월','화','수','목','금','토'];
            var dayarryJP = ['日','月','火','水','木','金','土'];
            var dayarryEN = ['Sun','Mon','Tue','Wed','Ths','Fri','Sat'];

            var member = " 님 ";
            var yourplan = " 일정";
            var day = dayarryKR[dayraw];
            var text = '1:1 레슨 일정';
            switch(Options.language){
                case "JPN" :
                    member = "様の ";
                    yourplan = " 日程";
                    day = dayarryJP[dayraw];
                    text = 'PT 日程';
                    break;
                case "ENG" :
                    member = "'s schedule at ";
                    yourplan = "";
                    day = dayarryEN[dayraw];
                    text = 'PT Plan';
                    break;
            }
            var selector_cal_popup_planinfo = $('#cal_popup_planinfo');
            var selector_popup_btn_complete = $('#popup_btn_complete');
            var selector_popup_info3_memo = $('#popup_info3_memo');
            $('#popup_planinfo_title').text(text);
            selector_popup_btn_complete.css({'color':'#282828','background':'#ffffff'}).val('');
            selector_popup_info3_memo.attr('readonly',true).css({'border':'0'});
            $('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'});
            $('#canvas').hide().css({'border-color':'#282828'});
            $('#canvasWrap').css({'display':'none'});
            $('#inner_shade_planinfo').css('display','none');

            $('#page-addplan-pc').hide();
            //selector_cal_popup_planinfo.css('display','block');
            
            //shade_index(100)
            //closeAlarm('pc')

            $('#popup_info3_memo,#popup_info3_memo_modify').show();
            var schedule_finish_check = $(this).attr('data-schedule-check');

            var infoText = yy+'. '+mm+'. '+dd+' '+'('+day+')';
            var stime_text = time_format_to_hangul(add_time(time+':'+minute,'00:00'));
            var etime_text = time_format_to_hangul(add_time(info[7]+':'+info[8],'00:00'));
            var infoText2 = '<span class="memberNameForInfoView" data-dbid="'+dbid+'" data-name="'+info[6]+'" '+'data-schedule-check="'+schedule_finish_check+'">'+info[6]+'</span>'+member+'<br><span class="popuptimetext">'+stime_text + ' - ' + etime_text+'</span>';
            var infoText3 = $(this).attr('data-memo');
            if($(this).attr('data-memo') == undefined){
                infoText3 = "";
            }
            $('#popup_info').text(infoText);
            $('#popup_info2').html(infoText2);
            selector_popup_info3_memo.text(infoText3).val(infoText3);
            selector_cal_popup_planinfo.attr({'schedule-id': $(this).attr('class-schedule-id'),'data-grouptype':'class'});
            $("#id_schedule_id").val($(this).attr('class-schedule-id')); //shcedule 정보 저장
            $("#id_schedule_id_modify").val($(this).attr('class-schedule-id')); //shcedule 정보 저장
            $("#id_schedule_id_finish").val($(this).attr('class-schedule-id')); // shcedule 정보 저장
            $("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
            $("#id_repeat_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
            $("#id_member_name_delete").val($(this).attr('data-memberName')); //회원 이름 저장
            $('#id_member_dbid_delete').val($(this).attr('data-dbid'));       //회원 dbid를 저장
            $("#id_member_name_finish").val($(this).attr('data-memberName')); //회원 이름 저장
            $('#id_member_dbid_finish').val($(this).attr('data-dbid'));//member id 정보 저장
            $("#id_repeat_member_id").val($(this).attr('data-dbid')); //member id 정보 저장
            $("#id_repeat_lecture_id").val($(this).attr('data-lectureId')); //lecture id 정보 저장
            $("#id_lecture_id_modify").val($(this).attr('data-lectureId')); //lecture id 정보 저장
            $("#id_lecture_id_finish").val($(this).attr('data-lectureId')); //lecture id 정보 저장
            if(schedule_finish_check=="0"){
                selector_popup_btn_complete.show();
                $("#popup_text1").css("display","block");
                $("#popup_sign_img").css("display","none");
            }
            else{
                selector_popup_btn_complete.hide();
                $("#popup_text1").css("display","none");
                $("#popup_sign_img").css("display","block");
                // $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image//spooner_test/'+$(this).attr('schedule-id')+'.png');
                $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('class-schedule-id')+'.png');
                var myImage = document.getElementById("id_sign_img");
                myImage.onerror = function(){
                    /*this.src="";
                    */
                    $("#id_sign_img").attr('src','/static/user/res/auto_complete.png');
                   // $("#popup_sign_img").css("display","none");

                }
            }
            schedule_on_off = 1;
            if(bodywidth > 600){
                selector_cal_popup_planinfo.css({'display':'block','top':(($(window).height()-selector_cal_popup_planinfo.outerHeight())/2+$(window).scrollTop()),'left':(($(window).width()-selector_cal_popup_planinfo.outerWidth())/2+$(window).scrollLeft())});
            }else{
                selector_cal_popup_planinfo.css({'display':'block','top':'50%','left':'50%','transform':'translate(-50%, -50%)','position':'fixed'});
            }
            //disable_window_scroll();
        }
    });

    //Off 일정 클릭시 팝업 Start
    $(document).on('click','div.offTime',function(e){ //일정을 클릭했을때 팝업 표시
        e.stopPropagation();
        var info = $(this).attr('off-time').split('_');
        var yy=info[0];
        var mm=info[1];
        var dd=info[2];
        var thisIdDate_ = `${yy}-${mm}-${dd}`;
        if( (compare_date2(thisIdDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), thisIdDate_)) && Options.auth_limit == 0 ){
                show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                                </div>`)
        }else{
            $('#float_btn_wrap').hide();
            shade_index(100);
            closeAlarm('pc');
            toggleGroupParticipantsList('off');
            $('.pt_memo_guide_popup').css('display','none');
            $('#subpopup_addByList_plan, #popup_btn_viewGroupParticipants').hide();
            deleteTypeSelect = '';
            addTypeSelect ='ptadd';
            var time = info[3];
            if(time == 24){
                time = 0;
            }
            var minute = info[4];
            var dayobj = new Date(yy,mm-1,dd);
            var dayraw = dayobj.getDay();
            var dayarryKR = ['일','월','화','수','목','금','토'];
            var dayarryJP = ['日','月','火','水','木','金','土'];
            var dayarryEN = ['Sun','Mon','Tue','Wed','Ths','Fri','Sat'];

            var comment = "";
            var yourplan = " OFF 일정";
            var day = dayarryKR[dayraw];
            var text = 'OFF 일정';
            switch(Options.language){
                case "JPN" :
                    comment = "";
                    yourplan = " OFF日程";
                    day = dayarryJP[dayraw];
                    text = 'OFF 日程';
                    break;
                case "ENG" :
                    comment = "OFF at ";
                    yourplan = "";
                    day = dayarryEN[dayraw];
                    text = 'OFF';
                    break;
            }
            var selector_cal_popup_plan_info = $("#cal_popup_planinfo");
            var selector_popup_info3_memo = $('#popup_info3_memo');
            var selector_popup_btn_complete = $("#popup_btn_complete");
            $('#popup_planinfo_title').text(text);
            selector_popup_btn_complete.css({'color':'#282828','background':'#ffffff'}).val('');
            selector_popup_info3_memo.attr('readonly',true).css({'border':'0'});
            $('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'});
            $('#canvas').hide().css({'border-color':'#282828'});
            $('#canvasWrap').css({'display':'none'});
            $('#inner_shade_planinfo').css('display','none');

            $('#page-addplan-pc').hide();
            //$('.td00').css('background','transparent')
            //selector_cal_popup_plan_info.css('display','block');
            

            $('#popup_info3_memo,#popup_info3_memo_modify').show();

            var infoText =  yy+'. '+mm+'. '+dd+' '+'('+day+')';
            var stime_text = time_format_to_hangul(add_time(time+':'+minute,'00:00'));
            var etime_text = time_format_to_hangul(add_time(info[7]+':'+info[8],'00:00'));

            var infoText2 = '<span>'+yourplan +'</span><br><span class="popuptimetext">'+stime_text + ' - ' + etime_text+'</span>';
            var infoText3 = $(this).attr('data-memo');
            if($(this).attr('data-memo') == undefined){
                infoText3 = "";
            }
            $('#popup_info').text(infoText);
            $('#popup_info2').html(infoText2);
            selector_popup_info3_memo.text(infoText3).val(infoText3);
            selector_cal_popup_plan_info.attr({'schedule-id':$(this).attr('off-schedule-id'), 'data-grouptype':'off'});
            $("#id_off_schedule_id").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
            $("#id_off_schedule_id_modify").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
            selector_popup_btn_complete.hide();
            $("#popup_sign_img").css("display","none");
            schedule_on_off = 0;

            if(bodywidth > 600){
                selector_cal_popup_plan_info.css({'display':'block','top':(($(window).height()-selector_cal_popup_plan_info.outerHeight())/2+$(window).scrollTop()),'left':(($(window).width()-selector_cal_popup_plan_info.outerWidth())/2+$(window).scrollLeft())});
            }else{
                selector_cal_popup_plan_info.css({'display':'block','top':'50%','left':'50%','transform':'translate(-50%, -50%)','position':'fixed'});
            }
            //disable_window_scroll();
        }
    });

    //스케쥴 클릭시 팝업 Start
    $(document).on('click','div.groupTime',function(e){ //일정을 클릭했을때 팝업 표시
        e.stopPropagation();
        var info = $(this).attr('group-time').split('_');
        var yy=info[0];
        var mm=info[1];
        var dd=info[2];
        var thisIdDate_ = `${yy}-${mm}-${dd}`;
        if( (compare_date2(thisIdDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), thisIdDate_)) && Options.auth_limit == 0 ){
                show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                                </div>`)
        }else{
            var bodywidth = window.innerWidth;
            var group_class_type_name = $(this).attr('data-group-type-cd-name');
            e.stopPropagation();
            $('#float_btn_wrap').hide();
            shade_index(100);
            closeAlarm('pc');
            $('#subpopup_addByList_plan').hide();
            $('#popup_btn_viewGroupParticipants').show().attr({'data-membernum': $(this).attr('data-membernum'),
                'data-groupid': $(this).attr('data-groupid'),
                'group-schedule-id':$(this).attr('group-schedule-id')
            });
            if(bodywidth > 600){
                toggleGroupParticipantsList('on');
            }else{
                //$('#popup_btn_complete, #popup_btn_delete').removeClass('disabled_button')
            }
            $('.pt_memo_guide_popup').css('display','block');
            deleteTypeSelect = '';
            addTypeSelect ='ptadd';
            
            var time = info[3];
            if(time == 24){
                time = 0;
            }
            var minute = info[4];
            var classdur = info[5];
            var classdurTime = parseInt(info[5]) + "시간 ";
            var classdurMin = "";
            if(classdur.indexOf('.')){
                classdurMin = "30분";
            }else{
                classdurMin = "";
            }
            var dur = '('+classdurTime + classdurMin+')';
            var dayobj = new Date(yy,mm-1,dd);
            var dayraw = dayobj.getDay();
            var dayarryKR = ['일','월','화','수','목','금','토'];
            var dayarryJP = ['日','月','火','水','木','金','土'];
            var dayarryEN = ['Sun','Mon','Tue','Wed','Ths','Fri','Sat'];
            var member = " 님의 ";
            var yourplan = " 일정";
            var day = dayarryKR[dayraw];
            var text = group_class_type_name+' 일정';
            switch(Options.language){
                case "JPN" :
                    member = "様の ";
                    yourplan = " 日程";
                    day = dayarryJP[dayraw];
                    text = 'PT 日程';
                    break;
                case "ENG" :
                    member = "'s schedule at ";
                    yourplan = "";
                    day = dayarryEN[dayraw];
                    text = 'PT Plan';
                    break;
            }
            var selector_cal_popup_plan_info = $("#cal_popup_planinfo");
            var selector_popup_info3_memo = $('#popup_info3_memo');
            var selector_popup_btn_complete = $("#popup_btn_complete");
            $('#popup_planinfo_title').text(text);
            selector_popup_btn_complete.css({'color':'#282828','background':'#ffffff'}).val('');
            selector_popup_info3_memo.attr('readonly',true).css({'border':'0'});
            $('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'});
            $('#canvas').hide().css({'border-color':'#282828'});
            $('#canvasWrap').css({'display':'none'});
            $('#inner_shade_planinfo').css('display','none');

            $('#page-addplan-pc').hide();
            //selector_cal_popup_plan_info.css('display','block').attr({'schedule-id': $(this).attr('group-schedule-id'), 'data-grouptype':'group', 'group_plan_finish_check': $(this).attr('data-schedule-check') });
            

            $('#popup_info3_memo,#popup_info3_memo_modify').show();
            var schedule_finish_check = $(this).attr('data-schedule-check');
            var group_current_member_num = $(this).attr('data-current-membernum');
            var group_max_member_num = $(this).attr('data-membernum');

            var infoText = yy+'. '+mm+'. '+dd+' '+'('+day+')';
            var stime_text = time_format_to_hangul(add_time(time+':'+minute,'00:00'));
            var etime_text = time_format_to_hangul(add_time(info[7]+':'+info[8],'00:00'));
            var infoText2 = '<span data-name="'+info[6]+'" '+'data-schedule-check="'+schedule_finish_check+'" '+'data-group-type-cd-name="'+group_class_type_name+'">['+group_class_type_name+'] '+info[6]+' ('+group_current_member_num+'/'+group_max_member_num+')</span>'+'<br><span class="popuptimetext">'+stime_text + ' - ' + etime_text+'</span>';
            var infoText3 = $(this).attr('data-memo');
            if($(this).attr('data-memo') == undefined){
                infoText3 = "";
            }
            $('#popup_info').text(infoText);
            //$('#popup_info2').html(infoText2);
            $('#popup_info2').html(infoText2);

            selector_popup_info3_memo.text(infoText3).val(infoText3);

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
                selector_popup_btn_complete.show();
                $("#popup_text1").css("display","block");
                $("#popup_sign_img").css("display","none");
            }
            else{
                selector_cal_popup_plan_info.attr('group_schedule_finish_check',1);
                selector_popup_btn_complete.hide();
                $("#popup_text1").css("display","none");
                $("#popup_sign_img").css("display","block");
                // $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image//spooner_test/'+$(this).attr('schedule-id')+'.png');
                $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('group-schedule-id')+'.png');
                var myImage = document.getElementById("id_sign_img");
                myImage.onerror = function() {
                    //this.src="";
                    $("#id_sign_img").attr('src','/static/user/res/auto_complete.png');
                }
            }
            schedule_on_off = 2;
            //$('#popup_btn_complete, #popup_btn_delete').addClass('disabled_button')
            if(bodywidth > 600){
                selector_cal_popup_plan_info.attr({'schedule-id': $(this).attr('group-schedule-id'), 'data-grouptype':'group', 'group_plan_finish_check': $(this).attr('data-schedule-check')}).css({'display':'block','top':(($(window).height()-selector_cal_popup_plan_info.outerHeight())/2+$(window).scrollTop()),'left':(($(window).width()-selector_cal_popup_plan_info.outerWidth())/2+$(window).scrollLeft())});
            }else{
                selector_cal_popup_plan_info.attr({'schedule-id': $(this).attr('group-schedule-id'), 'data-grouptype':'group', 'group_plan_finish_check': $(this).attr('data-schedule-check')}).css({'display':'block','top':'50%','left':'50%','transform':'translate(-50%, -50%)','position':'fixed'});
            }
            //disable_window_scroll();
        }
    });
/////////////////////////////////////////////////////////////////////////////////////////////일정 클릭 이벤트



/////////////////////////////////////////////////////////////////////////////////////////////일정 완료 관련 이벤트
    //일정 완료
    $("#popup_btn_complete").click(function(){  //사인 전 일정 완료 버튼 클릭
        body_position_fixed_unset();
        $('#canvas, #canvasWrap').css('display','block');
        $('#inner_shade_planinfo').css('display','block');
        $("#popup_btn_sign_complete").css({'color':'#282828','background':'#ffffff'}).val('');
        var $popup = $('#cal_popup_planinfo');
        var $signcomplete_button = $('#popup_btn_sign_complete');
        if($popup.attr('data-grouptype') == "class"){
            $signcomplete_button.attr('data-signtype','class')
        }else if($popup.attr('data-grouptype') == "group"){
            $signcomplete_button.attr('data-signtype','group')
        }
        disable_window_scroll();
    });


    $('#popup_btn_sign_complete').click(function(){
        enable_window_scroll()
        if($(this).val()!="filled" && !$(this).hasClass('disabled_button')){
            $('#canvas, #canvasWrap').css('display','block');
            if(schedule_on_off == 2){
                toggleGroupParticipantsList('on');
            }
        }else if($(this).val()=="filled" && !$(this).hasClass('disabled_button')){
            disable_popup_btns_during_ajax();
            //ajax_block_during_complete_weekcal = false
            if(schedule_on_off==1){
                //PT 일정 완료 처리시
                send_plan_complete('callback',function(json, senddata){
                    send_memo("blank");
                    signImageSend(senddata);
                    close_info_popup('cal_popup_planinfo');
                    completeSend();
                    super_ajaxClassTime();
                    enable_popup_btns_after_ajax();
                })
            }else if(schedule_on_off == 2){
                var groupOrMember = $('#popup_btn_sign_complete').attr('data-signtype');
                $('#id_group_schedule_id_finish').val($('#cal_popup_planinfo').attr('schedule-id'));
                if(groupOrMember == 'group'){
                    send_group_plan_complete('callback', function(json, senddata){
                        send_memo("blank");
                        signImageSend(senddata);
                        completeSend();
                        super_ajaxClassTime();
                        close_info_popup('cal_popup_planinfo');
                        enable_popup_btns_after_ajax();
                    });

                }else if(groupOrMember == 'groupmember'){
                    send_group_plan_complete('callback', function(json, senddata){
                        send_memo("blank");
                        signImageSend(senddata);
                        completeSend();
                        super_ajaxClassTime();
                        close_sign_popup()
                        enable_popup_btns_after_ajax();
                    });
                }
            }
        }//사인 후 일정 완료 버튼 클릭
    });


    $('#popup_btn_sign_close').click(function(){ //사인 창 닫기
        close_sign_popup();
    });
/////////////////////////////////////////////////////////////////////////////////////////////일정 완료 관련 이벤트



/////////////////////////////////////////////////////////////////////////////////////////////일정 취소 관련 이벤트
    //일정 취소
    $("#popup_btn_delete").click(function(){  //일정 취소 버튼 클릭
        body_position_fixed_unset();
        if(!$(this).hasClass('disabled_button')){
            if($(this).parent('#cal_popup_planinfo').attr('data-grouptype') == "group"){
                deleteTypeSelect = "groupptdelete";
            }else{
                deleteTypeSelect = "ptoffdelete";
            }
            $('#cal_popup_planinfo').hide();
            $('#cal_popup_plandelete').css('display','block').attr({"schedule-id":$(this).parent('#cal_popup_planinfo').attr("schedule-id")});
        }
    });
/////////////////////////////////////////////////////////////////////////////////////////////일정 취소 관련 이벤트



/////////////////////////////////////////////////////////////////////////////////////////////메모 송신
    //미니 팝업 메모수정
    $('#popup_info3_memo_modify').click(function(){
        if($(this).attr('data-type') == "view"){
            body_position_fixed_set();
            //$('html,body').css({'position':'fixed'})
            $('#popup_info3_memo').attr('readonly',false).css({'border':'1px solid #fe4e65'});
            $(this).attr({'src':'/static/user/res/btn-pt-complete.png','data-type':'modify'});
        }else if($(this).attr('data-type') == "modify"){
            body_position_fixed_unset();
            //$('html,body').css({'position':'relative'})
            $('#popup_info3_memo').attr('readonly',true).css({'border':'0'});
            $(this).attr({'src':'/static/user/res/icon-pencil.png','data-type':'view'});
            send_memo();
        }
    });
/////////////////////////////////////////////////////////////////////////////////////////////메모 송신



/////////////////////////////////////////////////////////////////////////////////////////////삭제 확인 팝업
    //삭제 확인 팝업에서 Yes 눌렀을떄 동작 (PT 반복일정취소, OFF 반복일정취소, PT일정 취소, OFF일정 취소)
    $('#popup_delete_btn_yes').click(function(){
        var bodywidth = window.innerWidth;
        //if(ajax_block_during_delete_weekcal == true){
        if(!$(this).hasClass('disabled_button')){
            //ajax_block_during_delete_weekcal = false;
            disable_delete_btns_during_ajax();
            var repeat_schedule_id  = '';
            if(deleteTypeSelect == "repeatoffdelete" || deleteTypeSelect == "repeatptdelete"){ //일정등록창창의 반복일정 삭제
                repeat_schedule_id = $('#id_repeat_schedule_id_confirm').val();
                send_repeat_delete_personal(repeat_schedule_id, 'callback', function(jsondata){
                    //ajax_block_during_delete_weekcal = true
                    enable_delete_btns_after_ajax();
                    close_info_popup('cal_popup_plandelete');
                    get_repeat_info($('#cal_popup_repeatconfirm').attr('data-dbid'));
                    // set_schedule_time(jsondata)
                    super_ajaxClassTime();
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
                    if(bodywidth >= 600){
                        $('#calendar').css('position','relative');
                    }
                })

            }else if(deleteTypeSelect == "repeatgroupptdelete"){
                repeat_schedule_id = $('#id_repeat_schedule_id_confirm').val();
                send_repeat_delete_group(repeat_schedule_id, 'callback', function(){
                    //ajax_block_during_delete_weekcal = true
                    enable_delete_btns_after_ajax();
                    close_info_popup('cal_popup_plandelete');
                    get_repeat_info($('#cal_popup_repeatconfirm').attr('data-groupid'));
                    // set_schedule_time(jsondata)
                    super_ajaxClassTime();
                    $('#members_mobile, #members_pc').html('');
                    get_current_member_list();
                    get_current_group_list();
                    if(bodywidth >= 600){
                        $('#calendar').css('position','relative');
                    }
                    var groupid = $('#membersSelected button').attr('data-groupid');
                    get_groupmember_list(groupid, 'callback', function(jsondata){
                        draw_groupMemberList_to_view(jsondata, $('#groupmemberInfo'))
                    });
                });

                // get_member_repeat_id_in_group_repeat(repeat_schedule_id, 'callback', function(jsondata){
                //  for(var i=0; i<jsondata.repeatScheduleIdArray.length; i++){
                //      send_repeat_delete_personal(jsondata.repeatScheduleIdArray[i])
                //  }
                // })

            }else if(deleteTypeSelect == "ptoffdelete"){
                if(schedule_on_off==1){
                    //PT 일정 삭제시
                    send_plan_delete('pt', 'callback', function(){
                        //ajax_block_during_delete_weekcal = true
                        enable_delete_btns_after_ajax();
                    });
                    $('#members_mobile, #members_pc').html('');
                    get_current_member_list();
                    get_current_group_list();
                }else{
                    //OFF 일정 삭제
                    send_plan_delete('off', 'callback', function(){
                        //ajax_block_during_delete_weekcal = true
                        enable_delete_btns_after_ajax();
                    });
                    $('#members_mobile, #members_pc').html('');
                    get_current_member_list();
                    get_current_group_list();
                }
            }else if(deleteTypeSelect == "groupptdelete"){
                // var group_schedule_id = $(this).parent('#cal_popup_plandelete').attr('schedule-id');
                // get_group_plan_participants(group_schedule_id, 'callback', function(jsondata){
                //  for(var i=0; i<jsondata.scheduleIdArray.length; i++){
                //      $('#id_member_dbid_delete').val(jsondata.db_id[i])
                //      $('#id_schedule_id').val(jsondata.scheduleIdArray[i])
                //      send_plan_delete('pt', 'callback', function(){
                //          if(i == jsondata.scheduleIdArray.length-1){
                //              super_ajaxClassTime();
                //                // set_schedule_time(jsondata)
                //                close_info_popup('cal_popup_plandelete')
                //                if($('._calmonth').length == 1){
                //                  shade_index(100)
                //                }else if($('._calweek').length == 1){
                //                  shade_index(-100)
                //                }
                //          }else{
                //              super_ajaxClassTime();
                //          }
                //      })
                //  }
                // })
                send_plan_delete('group', 'callback', function(){
                    //ajax_block_during_delete_weekcal = true
                    enable_delete_btns_after_ajax();
                    $('#members_mobile, #members_pc').html('')
                    get_current_member_list();
                    get_current_group_list();
                })
            }
        }
    });
/////////////////////////////////////////////////////////////////////////////////////////////삭제 확인 팝업



/////////////////////////////////////////////////////////////////////////////////////////////이름 눌러 회원 정보 팝업 띄우기
    //회원이름을 클릭했을때 회원정보 팝업을 보여주며 정보를 채워준다.
    $(document).on('click','.memberNameForInfoView, .groupParticipantsRow span',function(){
        body_position_fixed_unset();
        var bodywidth = window.innerWidth;
        var dbID = $(this).attr('data-dbid');
        $('.popups').hide();
        if(bodywidth < 600){
            beforeSend();
            //$('#calendar').css('display','none')
            $('#calendar').css('height','0');

            get_indiv_member_info(dbID);
            get_indiv_repeat_info(dbID);
            get_member_lecture_list(dbID);
            get_member_history_list(dbID);
            shade_index(100);
            enable_window_scroll();
        }else if(bodywidth >= 600){
            get_indiv_member_info(dbID);
            get_indiv_repeat_info(dbID);
            get_member_lecture_list(dbID);
            get_member_history_list(dbID);
            $('#info_shift_base, #info_shift_lecture').show();
            $('#info_shift_schedule, #info_shift_history').hide();
            $('#select_info_shift_lecture').addClass('button_active');
            $('#select_info_shift_schedule, #select_info_shift_history').removeClass('button_active');
        }
    });
/////////////////////////////////////////////////////////////////////////////////////////////이름 눌러 회원 정보 팝업 띄우기


/////////////////////////////////////////////////////////////////////////////////////////////일정 등록 팝업 닫기 (모바일/PC)
    //모바일 스타일
    $('#upbutton-x').click(function(){
        var bodywidth = window.innerWidth;
        //$('#calendar').css('height','90%')
        if($(this).attr('data-page') == "addplan"){
            $('#page-addplan').css('display','none');
            if(bodywidth < 600){
                //$('#calendar').css('display','block');
                $('#calendar').css('height','100%')
            }
            $('#float_btn_wrap').show().removeClass('rotate_btn');
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
    //모바일 스타일

    //PC 스타일 (일정 등록 미니 팝업 닫기)
    $('.cancelBtn_mini').click(function(){
        closeMiniPopup();
    });
        function closeMiniPopup(){
            $("#id_time_duration_off").val("");
            $('#page-addplan-pc').hide();
            $('.blankSelected, .blankSelected30').removeClass('blankSelected blankSelected30 blankSelected_addview');
            $('.submitBtn').removeClass('submitBtnActivated');
            $('#classDuration_mini #durationsSelected button').removeClass('dropdown_selected');
            $('#submitBtn_mini').css('background','#282828');
            $('#memo_mini').val("");

            $("#membersSelected button").removeClass("dropdown_selected");
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
            var selector_memberSelected_btn_first_child = $("#membersSelected .btn:first-child");
            var selector_starttimesSelected_btn_first_child = $("#starttimesSelected .btn:first-child");
            var selector_durationSelected_btn_first_child = $("#durationsSelected .btn:first-child");
            selector_memberSelected_btn_first_child.html("<span style='color:#cccccc;'>"+text1+"</span>");
            selector_memberSelected_btn_first_child.val("");
            $("#countsSelected,.countsSelected").text("");
            $("#dateSelector p").removeClass("dropdown_selected");
            $('#timeGraph').hide();
            $("#starttimesSelected button").removeClass("dropdown_selected");
            selector_starttimesSelected_btn_first_child.html("<span style='color:#cccccc;'>"+text2+"</span>");
            selector_starttimesSelected_btn_first_child.val("");
            $("#durationsSelected button").removeClass("dropdown_selected");
            selector_durationSelected_btn_first_child.html("<span style='color:#cccccc;'>"+text2+"</span>");
            selector_durationSelected_btn_first_child.val("");
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $("#starttimes").empty();
            $("#durations").empty();
            $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
        }
    //PC 스타일 (일정 등록 미니 팝업 닫기)
/////////////////////////////////////////////////////////////////////////////////////////////일정 등록 팝업 닫기 (모바일/PC)




/////////////////////////////////////////////////////////////////////////////////////////////부가 기능
    //ESC키를 눌러서 팝업 닫기
    $(document).keyup(function(e){
        if(e.keyCode == 27){
            if($('#subpopup_addByList_plan').css('display') == 'block'){
                close_addByList_popup();
            }else{
                closeMiniPopup();
                close_info_popup('cal_popup_plandelete');
                close_info_popup('cal_popup_planinfo');
                close_info_popup('page-addplan');
                closePopup('member_info_PC');
            }
        }
    });
    //ESC키를 눌러서 팝업 닫기



    //PC버전 새로고침 버튼
    $('.ymdText-pc-add-refresh').click(function(){
        super_ajaxClassTime();
    });
    //PC버전 새로고침 버튼

    //일정 없음 안내 팝업 닫기
    $(document).on('click','.fake_for_blankpage',function(){
        $(this).fadeOut('fast');
    });
    //일정 없음 안내 팝업 닫기
/////////////////////////////////////////////////////////////////////////////////////////////부가 기능



/////////////////////////////////////////////////////////////////////////////////////////////함수 모음
    function send_plan_complete(use, callback){
        var $pt_finish_form = $('#pt-finish-form');
        var drawCanvas = document.getElementById('canvas');
        var send_data = $pt_finish_form.serializeArray();
        send_data.push({"name":"upload_file", "value":drawCanvas.toDataURL('image/png')});
        $.ajax({
            url:'/schedule/finish_schedule/',
            type:'POST',
            data:send_data,

            beforeSend:function(){
                beforeSend();
            },
            //통신성공시 처리
            success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray);
                }else{
                    if(jsondata.push_lecture_id.length>0){
                        for(var i=0; i<jsondata.push_lecture_id.length; i++) {
                            send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i]);
                        }
                    }
                    if(use == "callback"){
                        callback(jsondata, send_data);
                    }
                }
                console.log('success222');
            },

            //보내기후 팝업창 닫기
            complete:function(){

            },

            //통신 실패시 처리
            error:function(){
            }
        })
    }

    function send_group_plan_complete(use, callback){
        var $group_finish_form = $('#group-finish-form');
        var drawCanvas = document.getElementById('canvas');
        var send_data = $group_finish_form.serializeArray();
        send_data.push({"name":"upload_file", "value":drawCanvas.toDataURL('image/png')});
        $.ajax({
            url:'/schedule/finish_group_schedule/',
            type:'POST',
            data: send_data,

            beforeSend:function(){
                beforeSend();
            },
            //통신성공시 처리
            success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray);
                }else{
                    if(jsondata.push_lecture_id.length>0){
                        for(var i=0; i<jsondata.push_lecture_id.length; i++) {
                            send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i]);
                        }
                    }
                    if(use == "callback"){
                        callback(jsondata, send_data);
                    }
                }
            },

            //보내기후 팝업창 닫기
            complete:function(){

            },

            //통신 실패시 처리
            error:function(){
            }
        })
    }

    function send_memo(option){
        var schedule_id = $('#cal_popup_planinfo').attr('schedule-id');
        var memo = $('#popup_info3_memo').val();
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
            success:function(){
                if(option == "blank"){

                }else{
                    super_ajaxClassTime();
                }
            },

            //보내기후 팝업창 닫기
            complete:function(){
                //super_ajaxClassTime()
            },

            //통신 실패시 처리
            error:function(){

            }
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
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray);
                }else{
                    console.log('sign_image_save_success');
                }
            },

            //보내기후 팝업창 닫기
            complete:function(){

            },

            //통신 실패시 처리
            error:function(){
                alert("Server Error: \nSorry for inconvenience. \nPTERS server is unstable now.");
                console.log('sign_image_save_fail');
            }
        })
    }

    function close_sign_popup(){
        enable_window_scroll();
        $('#canvasWrap').css('display','none');
        $('#canvas').css({'border-color':'#282828','display':'none'});
        $("#popup_btn_sign_complete").css({'color':'#282828','background':'#ffffff'}).val('');
        $('#inner_shade_planinfo').css('display','none');//사인 창 닫기 함수
    };

    function disable_popup_btns_during_ajax(){ //일정 팝업의 [일정취소, 일정완료] 버튼 잠금
        $("#popup_btn_sign_complete, #popup_btn_delete").addClass('disabled_button');
    };

    function enable_popup_btns_after_ajax(){ //일정 팝업의 [일정취소, 일정완료] 버튼 잠금해제
        $("#popup_btn_sign_complete, #popup_btn_delete").removeClass('disabled_button');
    };

    function disable_delete_btns_during_ajax(){ //일정 삭제 팝업의 [예, 아니요] 버튼 잠금
        $('#popup_delete_btn_yes, #popup_delete_btn_no').addClass('disabled_button');
        //ajax_block_during_delete_weekcal = false;
    };

    function enable_delete_btns_after_ajax(){ //일정 삭제 팝업의 [예, 아니요] 버튼 잠금해제
        $('#popup_delete_btn_yes, #popup_delete_btn_no').removeClass('disabled_button');
        //ajax_block_during_delete_weekcal = false;
    };

    function super_ajaxClassTime(){
        var selector_calendar = $('#calendar');
        if(selector_calendar.hasClass('_calmonth')){
            ajaxClassTime();
        }else if(selector_calendar.hasClass('_calweek')){
            ajaxClassTime();
        }else if(selector_calendar.hasClass('_calday')){
            ajaxClassTime_day();
        }
    }
/////////////////////////////////////////////////////////////////////////////////////////////함수 모음





