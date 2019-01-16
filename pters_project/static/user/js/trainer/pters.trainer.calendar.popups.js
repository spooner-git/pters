////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                //일정표에서 공통으로 쓰이는 팝업 관련 이벤트/함수
                                //PTERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////(주간)일정 클릭 이벤트

    var schedule_data_cache;
    var schedule_data_cleared_duplicates_cache;


    var eventstart = 'mouseenter';
    var eventend = 'mouseleave';
    $(document).on(eventstart, 'div._class, div._off, div._group', function(e){
        e.stopPropagation();
        e.preventDefault();
        var thisWidth = $(this).width();
        var thisHeight = $(this).height();
        var thisLeft = $(this).css('left');
        var thisTop = $(this).offset().top;
        var cssthisTop = Number($(this).css('top').replace(/px/gi, ""));
        var thisZindex = $(this).css('z-index');

        var hoverHeight;
        var hoverWidth = thisWidth+2;
        if(thisHeight < 30){
            hoverHeight = 32;
        }else{
            hoverHeight = thisHeight + 2;
        }

        var hoveredBottomLoc = thisTop + hoverHeight;
        var calbottom = $('.timeindex .hour:last-child').offset().top + $('.timeindex .hour:last-child').height();

        var small_plan = 0;
        if(calbottom - thisTop < 25 ){
            $(this).css({'height':hoverHeight, 'z-index':150,  'left':thisLeft-1, 'top': cssthisTop + calbottom - hoveredBottomLoc });
            small_plan = 1;
        }else{
            $(this).css({'height':hoverHeight, 'z-index':150,  'left':thisLeft-1});
        }

        var $memberName = $(this).find('.memberName');
        var $memberTime = $(this).find('.memberTime');
        if($memberName.hasClass('hideelement')){
            $memberName.removeClass('hideelement').addClass('_hided');
            $memberTime.removeClass('hideelement').addClass('_hided');
        }


        $(document).on(eventend, 'div._class, div._off, div._group', function(e){
            if(bodywidth >= 600){
                if(small_plan == 1){
                    $(this).css({'height':thisHeight, 'z-index':thisZindex,  'left':thisLeft, 'top':cssthisTop});
                    small_plan = 0;
                }else{
                    $(this).css({'height':thisHeight, 'z-index':thisZindex,  'left':thisLeft});
                }
           }else{
                if(small_plan == 1){
                    $(this).css({'height':thisHeight, 'z-index':thisZindex,  'left':thisLeft, 'top':cssthisTop});
                }else{
                    $(this).css({'height':thisHeight, 'z-index':thisZindex,  'left':thisLeft});
                }
           }
            if($memberName.hasClass('_hided')){
                $memberName.removeClass('_hided').addClass('hideelement');
                $memberTime.removeClass('_hided').addClass('hideelement');
            }
        });
    });
    

    $(document).on('contextmenu', function(){
        return false;
    });
    $(document).on('mousedown', 'div._class', function(e){
        if(e.which == 3 || e.button == 2){
            var this_schedule_id = $(this).attr('data-scheduleid');
            var start = schedule_data_cache["class"][this_schedule_id]["start_date"];
            var dbid = schedule_data_cache["class"][this_schedule_id]["member_id"];
            var name = schedule_data_cache["class"][this_schedule_id]["member_name"];
            var leid = schedule_data_cache["class"][this_schedule_id]["lecture_id"];
            var thisIdDate_ = start.split(' ')[0];
            //alert('오른쪽 클릭');
            schedule_on_off = 1;
            $('#id_date_info').val(thisIdDate_);
            $("#id_schedule_id").val(this_schedule_id); //shcedule 정보 저장
            $("#id_member_name_delete").val(name); //회원 이름 저장
            $('#id_member_dbid_delete').val(dbid);       //회원 dbid를 저장
            $('#id_lecture_id_delete').val(leid);
            pop_up_delete_confirm({"data-scheduleid":this_schedule_id}, '정말 일정을 취소하시겠습니까?', "callback", function(){$('#cal_popup_planinfo').hide();});
            deleteTypeSelect = "ptoffdelete";
            shade_index(100);
        }
    });
    $(document).on('mousedown', 'div._group', function(e){
        if(e.which == 3 || e.button == 2){
            var this_schedule_id = $(this).attr('data-scheduleid');
            var start = schedule_data_cache["group"][this_schedule_id]["start_date"];
            var name = schedule_data_cache["group"][this_schedule_id]["group_name"];
            var thisIdDate_ = start.split(' ')[0];
            //alert('오른쪽 클릭');
            schedule_on_off = 2;
            $('#id_date_info').val(thisIdDate_);
            $("#id_schedule_id").val(this_schedule_id); //shcedule 정보 저장
            $("#id_member_name_delete").val(name); //회원 이름 저장
            pop_up_delete_confirm({"data-scheduleid":this_schedule_id}, '정말 일정을 취소하시겠습니까?', "callback", function(){$('#cal_popup_planinfo').hide();});
            deleteTypeSelect = "groupptdelete";
            shade_index(100);
        }
    });
    $(document).on('mousedown', 'div._off', function(e){
        if(e.which == 3 || e.button == 2){
            var this_schedule_id = $(this).attr('data-scheduleid');
            var start = schedule_data_cache["off"][this_schedule_id]["start_date"];
            var thisIdDate_ = start.split(' ')[0];
            //alert('오른쪽 클릭');
            schedule_on_off = 0;
            $('#id_date_info_off').val(thisIdDate_);
            $("#id_off_schedule_id").val(this_schedule_id); //shcedule 정보 저장
            pop_up_delete_confirm({"data-scheduleid":this_schedule_id}, '정말 일정을 취소하시겠습니까?', "callback", function(){$('#cal_popup_planinfo').hide();});
            deleteTypeSelect = "ptoffdelete";
            shade_index(100);
        }
    });

    // $(document).on('click', 'div.classTime', function(e){ //일정을 클릭했을때 팝업 표시
    //     e.stopPropagation();
    //     disable_window_scroll();
    //     var info = $(this).attr('class-time').split('_');
    //     var yy=info[0];
    //     var mm=info[1];
    //     var dd=info[2];
    //     var thisIdDate_ = `${yy}-${mm}-${dd}`;
    //     var plancolor = $(this).attr('data-plancolor');
    //     $('#float_btn_wrap').hide();
    //     shade_index(100);
    //     closeAlarm('pc');
    //     toggleGroupParticipantsList('off');
    //     $('.pt_memo_guide_popup').css('display', 'block');
    //     $('#subpopup_addByList_plan, #popup_btn_viewGroupParticipants').hide();
    //     deleteTypeSelect = '';
    //     addTypeSelect ='ptadd';
    //     var dbid = $(this).attr('data-dbid');
    //     var time = info[3];
    //     if(time == 24){
    //         time = 0;
    //     }
    //     var minute = info[4];
    //     var classdur = info[5];
    //     var classdurTime = parseInt(info[5]) + "시간 ";
    //     var classdurMin = "";
    //     if(classdur.indexOf('.')){
    //         classdurMin = "30분";
    //     }else{
    //         classdurMin = "";
    //     }
    //     var dur = '('+classdurTime + classdurMin+')';
    //     var dayobj = new Date(yy, mm-1, dd);
    //     var dayraw = dayobj.getDay();
    //     var dayarryKR = ['일', '월', '화', '수', '목', '금', '토'];
    //     var dayarryJP = ['日', '月', '火', '水', '木', '金', '土'];
    //     var dayarryEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Ths', 'Fri', 'Sat'];

    //     var member = " 님 ";
    //     var yourplan = " 일정";
    //     var day = dayarryKR[dayraw];
    //     var text = '1:1 레슨 일정';
    //     var selector_cal_popup_planinfo = $('#cal_popup_planinfo');
    //     var selector_popup_btn_complete = $('#popup_btn_complete');
    //     var selector_popup_info3_memo = $('#popup_info3_memo');
    //     selector_popup_btn_complete.val('');
    //     // selector_popup_info3_memo.attr('readonly', true).css({'border':'0'});
    //     //selector_popup_info3_memo.attr('readonly', true);
    //     $('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png', 'data-type':'view'});
    //     $('#canvas').hide().css({'border-color':'#282828'});
    //     $('#canvasWrap').css({'display':'none'});
    //     $('#inner_shade_planinfo').css('display', 'none');

    //     $('#page-addplan-pc').hide();
    //     //selector_cal_popup_planinfo.css('display','block');

    //     //shade_index(100)
    //     //closeAlarm('pc')

    //     $('#popup_info3_memo').show();
    //     $('#popup_info3_memo_modify').hide();
    //     var schedule_finish_check = $(this).attr('data-schedule-check');

    //     var infoText = yy+'. '+mm+'. '+dd+' '+'('+day+')';
    //     var stime_text = time_format_add_ampm(time+':'+minute);
    //     var etime_text = time_format_add_ampm(info[7]+':'+info[8]);
    //     var infoText2 = '<span class="memberNameForInfoView" data-dbid="'+dbid+'" data-name="'+info[6]+'" '+'data-schedule-check="'+schedule_finish_check+'">'+
    //                         '<div id="planinfo_plan_color" style="background-color:'+plancolor+'"></div>'+
    //                         '<span id="planinfo_name_text">'+info[6]+'</span>'+
    //                     // '</span>'+member+
    //                     // '<br>'+
    //                     // '<span class="popuptimetext">'+stime_text + ' - ' + etime_text+
    //                     '</span>';
    //     var infoText3 = $(this).attr('data-memo');
    //     if(infoText3.length == 0){
    //         infoText3 = "";
    //         selector_popup_info3_memo.css({"-webkit-text-fill-color":"#cccccc"});
    //     }else{
    //         selector_popup_info3_memo.css({"-webkit-text-fill-color":"#282828"});
    //     }
    //     $('#popup_planinfo_title').html(infoText2);
    //     $('#popup_info').text(infoText+' '+stime_text+' - '+etime_text);
    //     // $('#popup_info2').html(infoText2);
    //     selector_popup_info3_memo.text(infoText3).val(infoText3);
    //     selector_cal_popup_planinfo.attr({'schedule-id': $(this).attr('class-schedule-id'), 
    //                                       'data-grouptype':'class', 'data-date':thisIdDate_,
    //                                       'data-name':$(this).attr('data-memberName'),
    //                                       'data-leid': $(this).attr('data-lectureId'),
    //                                       'data-dbid': $(this).attr('data-dbid')
    //                                   });

    //     $('#id_date_info').val(thisIdDate_);
    //     $("#id_schedule_id").val($(this).attr('class-schedule-id')); //shcedule 정보 저장
    //     $("#id_schedule_id_modify").val($(this).attr('class-schedule-id')); //shcedule 정보 저장
    //     $("#id_schedule_id_finish").val($(this).attr('class-schedule-id')); // shcedule 정보 저장
    //     $("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
    //     $("#id_repeat_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
    //     $("#id_member_name_delete").val($(this).attr('data-memberName')); //회원 이름 저장
    //     $('#id_member_dbid_delete').val($(this).attr('data-dbid'));       //회원 dbid를 저장
    //     $("#id_member_name_finish").val($(this).attr('data-memberName')); //회원 이름 저장
    //     $('#id_member_dbid_finish').val($(this).attr('data-dbid'));//member id 정보 저장
    //     $("#id_repeat_member_id").val($(this).attr('data-dbid')); //member id 정보 저장
    //     $('#id_lecture_id_delete').val($(this).attr('data-lectureId'));
    //     $("#id_repeat_lecture_id").val($(this).attr('data-lectureId')); //lecture id 정보 저장
    //     $("#id_lecture_id_modify").val($(this).attr('data-lectureId')); //lecture id 정보 저장
    //     $("#id_lecture_id_finish").val($(this).attr('data-lectureId')); //lecture id 정보 저장
    //     if(schedule_finish_check=="0"){
    //         selector_popup_btn_complete.show();
    //         $("#popup_text1").css("display", "block");
    //         $("#popup_sign_img").css("display", "none");
    //     }else{
    //         selector_popup_btn_complete.hide();
    //         $("#popup_text1").css("display", "none");
    //         $("#popup_sign_img").css("display", "block");
    //         // $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image//spooner_test/'+$(this).attr('schedule-id')+'.png');
    //         $("#id_sign_img").attr('src', 'https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('class-schedule-id')+'.png');
    //         var myImage = document.getElementById("id_sign_img");
    //         myImage.onerror = function(){
    //             /*this.src="";
    //             */
    //             $("#id_sign_img").attr('src', '/static/user/res/auto_complete.png');
    //            // $("#popup_sign_img").css("display","none");

    //         };
    //     }
    //     schedule_on_off = 1;
    //     if(bodywidth > 600){
    //         selector_cal_popup_planinfo.css({'display':'block', 'top':(($(window).height()-selector_cal_popup_planinfo.outerHeight())/2+$(window).scrollTop()), 'left':(($(window).width()-selector_cal_popup_planinfo.outerWidth())/2+$(window).scrollLeft())});
    //     }else{
    //         selector_cal_popup_planinfo.css({'display':'block', 'top':'50%', 'left':'50%', 'transform':'translate(-50%, -50%)', 'position':'fixed'});
    //     }
    //     //disable_window_scroll();
    
    // });
    $(document).on('click', 'div._class', function(e){ //일정을 클릭했을때 팝업 표시
        e.stopPropagation();
        // disable_window_scroll();
        var this_schedule_id = $(this).attr('data-scheduleid');
        var dbid = schedule_data_cache["class"][this_schedule_id]["member_id"];
        var name = schedule_data_cache["class"][this_schedule_id]["member_name"];
        var start = schedule_data_cache["class"][this_schedule_id]["start_date"];
        var start_date = start.split(' ')[0];
        var start_time = start.split(' ')[1];
        var end = schedule_data_cache["class"][this_schedule_id]["end_date"];
        var end_date = end.split(' ')[0];
        var end_time = end.split(' ')[1];
        var memo = schedule_data_cache["class"][this_schedule_id]["memo"];
        var leid = schedule_data_cache["class"][this_schedule_id]["lecture_id"];
        var finished = schedule_data_cache["class"][this_schedule_id]["finished"];
        var plancolor = "#fbf3bd";
        var selector_cal_popup_planinfo = $('#cal_popup_planinfo');
        var selector_popup_btn_complete = $('#popup_btn_complete');
        var selector_popup_info3_memo = $('#popup_info3_memo');

        $('#float_btn_wrap').hide();
        shade_index(100);
        closeAlarm('pc');
        toggleGroupParticipantsList('off');
        $('.pt_memo_guide_popup').css('display', 'block');
        $('#subpopup_addByList_plan, #popup_btn_viewGroupParticipants').hide();
        deleteTypeSelect = '';
        addTypeSelect ='ptadd';

        var dayobj = new Date(start_date);
        var dayraw = dayobj.getDay();
        var dayarryKR = ['일', '월', '화', '수', '목', '금', '토'];
        var day = dayarryKR[dayraw];

        $('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png', 'data-type':'view'});
        $('#canvas').hide().css({'border-color':'#282828'});
        $('#canvasWrap').css({'display':'none'});
        $('#inner_shade_planinfo').css('display', 'none');

        $('#page-addplan-pc').hide();

        $('#popup_info3_memo_modify').hide();

        var infoText = start_date.replace(/-/gi, ". ")+' '+'('+day+')';
        var stime_text = time_format_add_ampm(start_time);
        var etime_text = time_format_add_ampm(end_time);
        // var infoText2 = '<span class="memberNameForInfoView" data-dbid="'+dbid+'" data-name="'+name+'" '+'data-schedule-check="'+finished+'">'+
        //                     '<div id="planinfo_plan_color" style="background-color:'+plancolor+'"></div>'+
        //                     '<span id="planinfo_name_text">'+name+'</span>'+
        //                 '</span>';
        $('#planinfo_title_wrap').addClass('memberNameForInfoView').attr({'data-dbid': dbid, 'data-name':name});
        // $('#planinfo_type_text, #groupplan_participants_status').hide();
        $('#groupplan_participants_status').hide();
        $('#planinfo_plan_color').css('background-color', plancolor);
        $('#planinfo_type_text').text('1:1.');
        $('#planinfo_name_text').text(name);
        if(memo.length == 0){
            memo = "";
            selector_popup_info3_memo.css({"-webkit-text-fill-color":"#cccccc"});
        }else{
            selector_popup_info3_memo.css({"-webkit-text-fill-color":"#282828"});
        }
        // $('#popup_planinfo_title').html(infoText2);
        $('#popup_info').text(infoText+' '+stime_text+' - '+etime_text);
        // $('#popup_info2').html(infoText2);
        selector_popup_info3_memo.text(memo).val(memo);
        selector_cal_popup_planinfo.attr({'data-scheduleid': this_schedule_id,
                                          'data-grouptype':"personal"
                                      });

        $('#id_date_info').val(start_date);
        $("#id_schedule_id").val(this_schedule_id); //shcedule 정보 저장
        $("#id_schedule_id_modify").val(this_schedule_id); //shcedule 정보 저장
        $("#id_schedule_id_finish").val(this_schedule_id); // shcedule 정보 저장
        $("#id_member_name").val(name); //회원 이름 저장
        $("#id_repeat_member_name").val(name); //회원 이름 저장
        $("#id_member_name_delete").val(name); //회원 이름 저장
        $("#id_member_name_finish").val(name); //회원 이름 저장
        $('#id_member_dbid_delete').val(dbid);       //회원 dbid를 저장
        $('#id_member_dbid_finish').val(dbid);//member id 정보 저장
        $("#id_repeat_member_id").val(dbid); //member id 정보 저장
        $('#id_lecture_id_delete').val(leid);
        $("#id_repeat_lecture_id").val(leid); //lecture id 정보 저장
        $("#id_lecture_id_modify").val(leid); //lecture id 정보 저장
        $("#id_lecture_id_finish").val(leid); //lecture id 정보 저장

        if(finished=="0"){
            selector_popup_btn_complete.show();
            $("#popup_text1").css("display", "block");
            $("#popup_sign_img").css("display", "none");
        }else{
            selector_popup_btn_complete.hide();
            $("#popup_text1").css("display", "none");
            $("#popup_sign_img").css("display", "block");
            // $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image//spooner_test/'+$(this).attr('schedule-id')+'.png');
            $("#id_sign_img").attr('src', 'https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('data-scheduleid')+'.png');
            var myImage = document.getElementById("id_sign_img");
            myImage.onerror = function(){
                /*this.src="";
                */
                $("#id_sign_img").attr('src', '/static/user/res/auto_complete.png');
               // $("#popup_sign_img").css("display","none");

            };
        }

        schedule_on_off = 1;
        if(bodywidth >= 600){
            selector_cal_popup_planinfo.css({'display':'block', 'top':(($(window).height()-selector_cal_popup_planinfo.outerHeight())/2+$(window).scrollTop()), 'left':(($(window).width()-selector_cal_popup_planinfo.outerWidth())/2+$(window).scrollLeft())});
        }else{
            selector_cal_popup_planinfo.css({'display':'block', 'top':'50%', 'left':'50%', 'transform':'translate(-50%, -50%)', 'position':'fixed'});
        }
        disable_window_scroll("remember_scroll");
    });

    //Off 일정 클릭시 팝업 Start
    $(document).on('click', 'div._off', function(e){ //일정을 클릭했을때 팝업 표시
        e.stopPropagation();
        // disable_window_scroll();
        var this_schedule_id = $(this).attr('data-scheduleid');
        var start = schedule_data_cache["off"][this_schedule_id]["start_date"];
        var start_date = start.split(' ')[0];
        var start_time = start.split(' ')[1];
        var end = schedule_data_cache["off"][this_schedule_id]["end_date"];
        var end_date = end.split(' ')[0];
        var end_time = end.split(' ')[1];
        var memo = schedule_data_cache["off"][this_schedule_id]["memo"];
        var plancolor = "#eeeeee";
        var selector_cal_popup_plan_info = $("#cal_popup_planinfo");
        var selector_popup_info3_memo = $('#popup_info3_memo');
        var selector_popup_btn_complete = $("#popup_btn_complete");


        $('#float_btn_wrap').hide();
        shade_index(100);
        closeAlarm('pc');
        toggleGroupParticipantsList('off');
        $('.pt_memo_guide_popup').css('display', 'none');
        $('#subpopup_addByList_plan, #popup_btn_viewGroupParticipants').hide();
        deleteTypeSelect = '';
        addTypeSelect ='ptadd';
        
        var dayobj = new Date(start_date);
        var dayraw = dayobj.getDay();
        var dayarryKR = ['일', '월', '화', '수', '목', '금', '토'];
        var yourplan = " OFF 일정";
        var day = dayarryKR[dayraw];


        $('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png', 'data-type':'view'});
        $('#canvas').hide().css({'border-color':'#282828'});
        $('#canvasWrap').css({'display':'none'});
        $('#inner_shade_planinfo').css('display', 'none');

        $('#page-addplan-pc').hide();

        $('#popup_info3_memo_modify').hide();

        var infoText =  start_date.replace(/-/gi, ". ")+' '+'('+day+')';
        var stime_text = time_format_add_ampm(start_time);
        var etime_text = time_format_add_ampm(end_time);

        // var infoText2 = '<span>'+
        //                     '<div id="planinfo_plan_color" style="background-color:'+plancolor+'"></div>'+yourplan +
        //                 '</span>';
        $('#planinfo_title_wrap').removeClass('memberNameForInfoView');
        $('#planinfo_type_text, #groupplan_participants_status').hide();
        $('#planinfo_plan_color').css('background-color', plancolor);
        $('#planinfo_name_text').text(yourplan);
        if(memo.length == 0){
            memo = "";
            selector_popup_info3_memo.css({"-webkit-text-fill-color":"#cccccc"});
        }else{
            selector_popup_info3_memo.css({"-webkit-text-fill-color":"#282828"});
        }

        // $('#popup_planinfo_title').html(infoText2);
        $('#popup_info').text(infoText+' '+stime_text+' - '+etime_text);
        // $('#popup_info2').html(infoText2);
        selector_popup_info3_memo.text(memo).val(memo);
        selector_cal_popup_plan_info.attr({'data-scheduleid':this_schedule_id,
                                            'data-grouptype':'off'
                                            // 'data-date':thisIdDate_
                                          });

        $('#id_date_info_off').val(start_date);
        $("#id_off_schedule_id").val(this_schedule_id); //shcedule 정보 저장
        $("#id_off_schedule_id_modify").val(this_schedule_id); //shcedule 정보 저장
        selector_popup_btn_complete.hide();
        $("#popup_sign_img").css("display", "none");
        schedule_on_off = 0;

        if(bodywidth >= 600){
            selector_cal_popup_plan_info.css({'display':'block', 'top':(($(window).height()-selector_cal_popup_plan_info.outerHeight())/2+$(window).scrollTop()), 'left':(($(window).width()-selector_cal_popup_plan_info.outerWidth())/2+$(window).scrollLeft())});
        }else{
            selector_cal_popup_plan_info.css({'display':'block', 'top':'50%', 'left':'50%', 'transform':'translate(-50%, -50%)', 'position':'fixed'});
        }
        disable_window_scroll("remember_scroll");

    });

    //스케쥴 클릭시 팝업 Start
    $(document).on('click', 'div._group', function(e){ //일정을 클릭했을때 팝업 표시
        e.stopPropagation();
        // disable_window_scroll();

        var this_schedule_id = $(this).attr('data-scheduleid');
        var groupid = schedule_data_cache["group"][this_schedule_id]["group_id"];
        var name = schedule_data_cache["group"][this_schedule_id]["group_name"];
        var start = schedule_data_cache["group"][this_schedule_id]["start_date"];
        var start_date = start.split(' ')[0];
        var start_time = start.split(' ')[1];
        var end = schedule_data_cache["group"][this_schedule_id]["end_date"];
        var end_date = end.split(' ')[0];
        var end_time = end.split(' ')[1];
        var memo = schedule_data_cache["group"][this_schedule_id]["memo"];
        // var leid = schedule_data_cache["group"][this_schedule_id]["lecture_id"];
        var current_member_num = schedule_data_cache["group"][this_schedule_id]["current_member_num"];
        var max_member_num = schedule_data_cache["group"][this_schedule_id]["max_member_num"];
        var finished = schedule_data_cache["group"][this_schedule_id]["finished"];
        var type_name = schedule_data_cache["group"][this_schedule_id]["type_cd_name"];
        var plancolor = schedule_data_cache["group"][this_schedule_id]["ing_color"];
        var group_type_cd_name = schedule_data_cache["group"][this_schedule_id]["type_cd_name"];
        var selector_cal_popup_planinfo = $('#cal_popup_planinfo');
        var selector_popup_btn_complete = $('#popup_btn_complete');
        var selector_popup_info3_memo = $('#popup_info3_memo');

        e.stopPropagation();
        $('#float_btn_wrap').hide();
        shade_index(100);
        closeAlarm('pc');
        $('#subpopup_addByList_plan').hide();
        $('#popup_btn_viewGroupParticipants').show().attr({'data-membernum': max_member_num,
                                                            'data-groupid': groupid,
                                                            'data-scheduleid':this_schedule_id
        });

        toggleGroupParticipantsList('off');
        $('.pt_memo_guide_popup').css('display', 'block');
        deleteTypeSelect = '';
        addTypeSelect ='ptadd';

        var dayobj = new Date(start_date);
        var dayraw = dayobj.getDay();
        var dayarryKR = ['일', '월', '화', '수', '목', '금', '토'];
        var day = dayarryKR[dayraw];


        $('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png', 'data-type':'view'});
        $('#canvas').hide().css({'border-color':'#282828'});
        $('#canvasWrap').css({'display':'none'});
        $('#inner_shade_planinfo').css('display', 'none');

        $('#page-addplan-pc').hide();

        $('#popup_info3_memo_modify').hide();

        var infoText = start_date.replace(/-/gi, ". ")+' '+'('+day+')';
        var stime_text = time_format_add_ampm(start_time);
        var etime_text = time_format_add_ampm(end_time);
        // var infoText2 = '<span data-name="'+name+'" '+'data-schedule-check="'+finished+'" '+'data-group-type-cd-name="'+type_name+'">'+
        //                     '<div id="planinfo_plan_color" style="background-color:'+plancolor+'"></div>'+
        //                     '<span id="planinfo_type_text">'+type_name+'.</span>'+
        //                     '<span id="planinfo_name_text">'+name+'</span>'+
        //                     '<span id="groupplan_participants_status"> ('+current_member_num+'/'+max_member_num+')</span>'+
        //                 '</span>';
        $('#planinfo_title_wrap').removeClass('memberNameForInfoView');
        $('#planinfo_plan_color').css('background-color', plancolor);
        $('#planinfo_type_text').text(group_type_cd_name+'.');
        $('#planinfo_name_text').text(name);
        $('#groupplan_participants_status').show().text('('+current_member_num+'/'+max_member_num+')');
        if(memo.length == 0){
            memo = "";
            selector_popup_info3_memo.css({"-webkit-text-fill-color":"#cccccc"});
        }else{
            selector_popup_info3_memo.css({"-webkit-text-fill-color":"#282828"});
        }
        $('#groupParticipants_number_in_btn').text(current_member_num);
        // $('#popup_planinfo_title').html(infoText2);
        $('#popup_info').text(infoText+' '+stime_text+' - '+etime_text);
        selector_popup_info3_memo.text(memo).val(memo);

        $('#id_date_info').val(start_date);
        $("#id_schedule_id").val(this_schedule_id); //shcedule 정보 저장
        $("#id_schedule_id_modify").val(this_schedule_id); //shcedule 정보 저장
        $("#id_schedule_id_finish").val(this_schedule_id); // shcedule 정보 저장
        $("#id_member_name").val(name); //회원 이름 저장
        $("#id_repeat_member_name").val(name); //회원 이름 저장
        $("#id_member_name_delete").val(name); //회원 이름 저장
        $("#id_member_name_finish").val(name); //회원 이름 저장

        if(finished=="0"){
            selector_popup_btn_complete.show();
            $("#popup_text1").css("display", "block");
            $("#popup_sign_img").css("display", "none");
        }else{
            selector_cal_popup_planinfo.attr('group_schedule_finish_check', 1);
            selector_popup_btn_complete.hide();
            $("#popup_text1").css("display", "none");
            $("#popup_sign_img").css("display", "block");
            $("#id_sign_img").attr('src', 'https://s3.ap-northeast-2.amazonaws.com/pters-image/'+$(this).attr('data-scheduleid')+'.png');
            var myImage = document.getElementById("id_sign_img");
            myImage.onerror = function() {
                //this.src="";
                $("#id_sign_img").attr('src', '/static/user/res/auto_complete.png');
            };
        }
        schedule_on_off = 2;
        if(bodywidth >= 600){
            selector_cal_popup_planinfo.attr({'data-scheduleid': this_schedule_id,
                                                'data-grouptype':"group"
                                            })
                                        .css({'display':'block', 'top':(($(window).height()-selector_cal_popup_planinfo.outerHeight())/2+$(window).scrollTop()), 'left':(($(window).width()-selector_cal_popup_planinfo.outerWidth())/2+$(window).scrollLeft())});
        }else{
            selector_cal_popup_planinfo.attr({'data-scheduleid': this_schedule_id,
                                                'data-grouptype':"group"
                                             })
                                        .css({'display':'block', 'top':'50%', 'left':'50%', 'transform':'translate(-50%, -50%)', 'position':'fixed'});
        }
        disable_window_scroll("remember_scroll");
    });
/////////////////////////////////////////////////////////////////////////////////////////////(주간)일정 클릭 이벤트


/////////////////////////////////////////////////////////////////////////////////////////////(월간)일정 클릭 이벤트
    $(document).on('click', '#calendar td', function(){
        closeAlarm('pc');
        var thisDate = $(this).attr('data-date');
        var planDate_ = thisDate.replace(/_/gi, "-");
        $('#id_date_info').val(planDate_);
        var info = thisDate.split('_');
        if( (compare_date2(planDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), planDate_)) && Options.auth_limit == 0 ){
            show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                                </div>`);
        }else{
            if(!$(this).hasClass('nextDates') && !$(this).hasClass('prevDates')){
                deleteTypeSelect = '';
                var $cal_popup_plancheck = $('#cal_popup_plancheck');
                //$cal_popup_plancheck.css('display','block');
                $('#float_btn_wrap').hide();
                shade_index(100);

                var yy=info[0];
                var mm=info[1];
                var dd=info[2];
                var dayobj = new Date(yy, mm-1, dd);
                var dayraw = dayobj.getDay();
                var dayarry = ['일', '월', '화', '수', '목', '금', '토'];
                var day = dayarry[dayraw];
                var infoText = yy+'년 '+mm+'월 '+dd+'일 '+'('+day+')';
                var countNum = $(this).find('._classTime').text();
                $('#countNum').text(countNum);
                $('.popup_ymdText').html(infoText);
                plancheck(yy+'_'+mm+'_'+dd, initialJSON);
                if(bodywidth >= 600){
                    $cal_popup_plancheck.css({'display':'block','top':(($(window).height()-$cal_popup_plancheck.outerHeight())/2+$(window).scrollTop()),'left':(($(window).width()-$cal_popup_plancheck.outerWidth())/2+$(window).scrollLeft())});
                }else{
                    $cal_popup_plancheck.css({'display':'block','top':'50%','left':'50%','transform':'translate(-50%, -50%)','position':'fixed'});
                }
                //disable_window_scroll();
                clicked_td_date_info = yy+'_'+mm+'_'+dd;
            }


            if($('.plan_raw').height()*$('.plan_raw').length > $('#cal_popup_plancheck').height() ){
                if($('#cal_popup_plancheck > div:first-child').find('.scroll_arrow_top').length == 0){
                    $('#cal_popup_plancheck > div:first-child').append(
                                                        '<img src="/static/user/res/btn-today-left.png" class="scroll_arrow_top">'+
                                                        '<img src="/static/user/res/btn-today-left.png" class="scroll_arrow_bottom">'
                                                     );
                }
                $('.scroll_arrow_top, .scroll_arrow_bottom').css('visibility','visible');
                if($('.popup_inner_month').scrollTop() < 30 ){
                    $('.scroll_arrow_top').css('visibility', 'hidden');
                }
            }
            disable_window_scroll();
        }
    });

    $(document).on('click', '.plan_raw', function(){
        enable_window_scroll();
        var selectedDate = $('.popup_ymdText').text();
        var thisDate = date_format_to_yyyymmdd(selectedDate, '-');
        if( (compare_date2(thisDate, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), thisDate)) && Options.auth_limit == 0 ){
            show_caution_popup(`<div style="margin-bottom:10px;">
                                베이직 기능 이용자께서는 <br>
                                일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
                                <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                            </div>`);
        }else{
            var group_type_name = $(this).attr('data-group-type-cd-name');
            var group_type = $(this).attr('data-grouptype');
            var this_schedule_id = $(this).attr('data-scheduleid');
            
            var start = schedule_data_cache[group_type][this_schedule_id]["start_date"];
            var start_date = start.split(' ')[0];
            var start_time = start.split(' ')[1];
            var end = schedule_data_cache[group_type][this_schedule_id]["end_date"];
            var end_date = end.split(' ')[0];
            var end_time = end.split(' ')[1];
            var memo = schedule_data_cache[group_type][this_schedule_id]["memo"];
            var plancolor = "#fbf3bd";
            var finished = schedule_data_cache[group_type][this_schedule_id]["finished"];
            var leid = schedule_data_cache[group_type][this_schedule_id]["lecture_id"];
            // var leid = schedule_data_cache["group"][this_schedule_id]["lecture_id"];
            var groupid;
            var name;
            var dbid;
            if(group_type == "group"){
                groupid = schedule_data_cache[group_type][this_schedule_id]["group_id"];
                name = schedule_data_cache[group_type][this_schedule_id]["group_name"];
                var current_member_num = schedule_data_cache[group_type][this_schedule_id]["current_member_num"];
                var max_member_num = schedule_data_cache[group_type][this_schedule_id]["max_member_num"];
                var type_name = schedule_data_cache[group_type][this_schedule_id]["type_cd_name"];
                plancolor = schedule_data_cache[group_type][this_schedule_id]["ing_color"];
            }else{
                dbid = schedule_data_cache[group_type][this_schedule_id]["member_id"];
                name = schedule_data_cache[group_type][this_schedule_id]["name"];
            }
            

            var selector_cal_popup_planinfo = $('#cal_popup_planinfo');
            var selector_popup_btn_complete = $('#popup_btn_complete');
            var selector_popup_info3_memo = $('#popup_info3_memo');


            var member = " 회원님의 ";
            var yourplan = " 일정";
            var text = group_type_name+" 일정";
            if(group_type_name == ''){
                text = "1:1 레슨 일정";
                group_type_name = '1:1';
            }
            switch(Options.language){
                case "JPN" :
                    member = "様の ";
                    yourplan = " 日程";
                    text = 'PT 日程';
                    break;
                case "ENG" :
                    member = "'s schedule at ";
                    yourplan = "";
                    text = 'PT Plan';
                    break;
            }
            shade_index(150);
            // $('#popup_planinfo_title').text(text);
            var schedule_finish_check = $(this).attr('data-schedule-check');
            var dbid = $(this).attr('data-dbid');
            var name = $(this).attr('data-membername');

            // var selectedPerson = '<span class="memberNameForInfoView" data-dbid="'+dbid+'" data-name="'+$(this).attr('data-membername')+'">'+$(this).find('.plancheckname').text()+'</span>';
            
            
            if(memo.length == 0){
                memo = "";
                selector_popup_info3_memo.css({"-webkit-text-fill-color":"#cccccc"});
            }else{
                selector_popup_info3_memo.css({"-webkit-text-fill-color":"#282828"});
            }
            var dayobj = new Date(start_date);
            var dayraw = dayobj.getDay();
            var dayarryKR = ['일', '월', '화', '수', '목', '금', '토'];
            var day = dayarryKR[dayraw];
            var infoText = start_date.replace(/-/gi, ". ")+' '+'('+day+')';
            var stime_text = time_format_add_ampm(start_time);
            var etime_text = time_format_add_ampm(end_time);

            //$("#cal_popup_planinfo").css('display','block').attr({'schedule-id':$(this).attr('schedule-id'), 'data-grouptype':$(this).attr('data-grouptype'), 'group_plan_finish_check':$(this).attr('data-schedule-check')})
            // $('#popup_info3_memo').attr('readonly', true).css({'border':'0'});
            $('#popup_info3_memo_modify').attr({'src':'/static/user/res/icon-pencil.png', 'data-type':'view'});
            $('#popup_info').text(infoText+' '+stime_text+' - '+etime_text);
            selector_popup_info3_memo.text(memo).val(memo);

            $('#canvas').css({'border-color':'#282828'});
            $('#canvasWrap').css({'display':'none'});
            $('#inner_shade_planinfo').css('display', 'none');

            $("#id_schedule_id").val(this_schedule_id); //shcedule 정보 저장
            $("#id_schedule_id_finish").val(this_schedule_id); // shcedule 정보 저장
            $("#id_member_name").val(name); //회원 이름 저장
            $("#id_member_name_delete").val(name); //회원 이름 저장
            $('#id_member_dbid_delete').val(dbid);
            $("#id_member_name_finish").val(name); //회원 이름 저장
            $('#id_member_dbid_finish').val(dbid);
            $('#id_lecture_id_delete').val(leid);
            $("#id_lecture_id_finish").val(leid); //lecture id 정보 저장


            if(schedule_finish_check=="0"){
                $("#popup_btn_complete").show();
                $("#popup_text1").css("display", "block");
                $("#popup_sign_img").css("display", "none");
            }else{
                $("#popup_btn_complete").hide();
                $("#popup_text1").css("display", "none");
                $("#popup_sign_img").css("display", "block");
                // $("#id_sign_img").attr('src','https://s3.ap-northeast-2.amazonaws.com/pters-image//spooner_test/'+$(this).attr('schedule-id')+'.png');
                $("#id_sign_img").attr('src', 'https://s3.ap-northeast-2.amazonaws.com/pters-image/'+this_schedule_id+'.png');
                var myImage = document.getElementById("id_sign_img");
                myImage.onerror = function() {
                    //this.src="";
                    //$("#popup_sign_img").css("display","none")
                    $("#id_sign_img").attr('src', '/static/user/res/auto_complete.png');
                };
            }


            $('#subpopup_addByList_plan').hide();
            if($(this).attr('data-grouptype') == "group"){
                $('#planinfo_title_wrap').removeClass('memberNameForInfoView');
                $('#planinfo_plan_color').css('background-color', plancolor);
                $('#planinfo_type_text').text(group_type_name+'.');
                $('#planinfo_name_text').text(name);
                $('#groupplan_participants_status').show().text('('+current_member_num+'/'+max_member_num+')');


                // var group_current_member_num =$(this).attr('data-currentmembernum');
                // var group_max_member_num = $(this).attr('data-membernum');
                // var popuptext = '<span data-name="'+name+'" '+'data-schedule-check="'+schedule_finish_check+'" '+'data-group-type-cd-name="'+group_type_name+'">['+group_type_name+'] '+name+'<span id="groupplan_participants_status"> ('+group_current_member_num+'/'+group_max_member_num+')</span> </span>'+'<br><span class="popuptimetext">'+stime_text + ' - ' + etime_text+'</span>';
                $('#groupParticipants_number_in_btn').text(current_member_num);
                // $('#popup_info2').html(popuptext);
                //$('#popup_info2').html('['+group_type_name+']'+name+'<br><span class="popuptimetext">'+stime_text + ' - ' + etime_text+'</span>');
                $('#popup_btn_viewGroupParticipants').show().attr({'data-membernum': max_member_num,
                                                                    'data-groupid': groupid,
                                                                    'data-scheduleid':this_schedule_id
                });
                //$("#popup_sign_img").css("display","none");
                //$('#popup_btn_complete, #popup_btn_delete').addClass('disabled_button')
                if(bodywidth >= 600){
                    toggleGroupParticipantsList('on');
                }else{
                    toggleGroupParticipantsList('off');
                }
                schedule_on_off = 2;
            }else{
                $('#planinfo_title_wrap').addClass('memberNameForInfoView').attr({'data-dbid': dbid, 'data-name':name});
                $('#planinfo_type_text').text(group_type_name+'.');
                // $('#planinfo_type_text, #groupplan_participants_status').hide();
                $('#groupplan_participants_status').hide();
                $('#planinfo_plan_color').css('background-color', plancolor);
                console.log("plancolor", plancolor)
                $('#planinfo_name_text').text(name);

                //$('#popup_info2').html(selectedPerson+' 님'+ '<br><span class="popuptimetext">'+stime_text + ' - ' + etime_text+'</span>');
                $('#popup_btn_viewGroupParticipants').hide();
                toggleGroupParticipantsList('off');
                schedule_on_off = 1;
            }
            if(bodywidth >= 600){
                if($(this).attr('data-grouptype') == "group") {
                    $("#cal_popup_planinfo").css({
                        'display': 'block',
                        'top': (($(window).height() - $("#cal_popup_planinfo").outerHeight()) / 2 + $(window).scrollTop()) - 20,
                        'left': (($(window).width() - $("#cal_popup_planinfo").outerWidth()) / 2 + $(window).scrollLeft())
                    }).attr({
                        'data-scheduleid': this_schedule_id,
                        'data-grouptype': group_type,
                        'group_plan_finish_check': finished
                    });
                }else{
                    $("#cal_popup_planinfo").css({
                        'display': 'block',
                        'top': (($(window).height() - $("#cal_popup_planinfo").outerHeight()) / 2 + $(window).scrollTop()),
                        'left': (($(window).width() - $("#cal_popup_planinfo").outerWidth()) / 2 + $(window).scrollLeft())
                    }).attr({'data-scheduleid': this_schedule_id,
                                          'data-grouptype':'class',
                                          'data-name':name,
                                          // 'data-leid': leid,
                                          'data-dbid': dbid
                    });
                }
            }else{
                if($(this).attr('data-grouptype') == "group") {
                    $('#cal_popup_planinfo').css({
                        'display': 'block',
                        'top': '50%',
                        'left': '50%',
                        'transform': 'translate(-50%, -50%)',
                        'position': 'fixed'
                    }).attr({
                        'data-scheduleid': this_schedule_id,
                        'data-grouptype': group_type,
                        'group_plan_finish_check': finished
                    });
                }else{
                    $('#cal_popup_planinfo').css({
                        'display': 'block',
                        'top': '50%',
                        'left': '50%',
                        'transform': 'translate(-50%, -50%)',
                        'position': 'fixed'
                    }).attr({'data-scheduleid': this_schedule_id,
                                          'data-grouptype':'class',
                                          'data-name': name,
                                          // 'data-leid': leid,
                                          'data-dbid': dbid
                    });
                }
            }
            disable_window_scroll();
        }
    });

    $(document).on('click', '.plan_raw_add', function(){
        var thisDate = date_format_yyyy_m_d_to_yyyy_mm_dd($(this).attr('data-date'),'-');
        // if( (compare_date2(thisDate, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), thisDate)) && Options.auth_limit == 0 ){
        //     show_caution_popup(`<div style="margin-bottom:10px;">
        //                         베이직 기능 이용자께서는 <br>
        //                         일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
        //                         <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
        //                         <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
        //                     </div>`)
        // }else{
        close_info_popup('cal_popup_plancheck');
        clear_pt_off_add_popup();
        open_pt_off_add_popup('ptadd', thisDate);
        set_member_group_dropdown_list();
        ajaxTimeGraphSet(thisDate);
        shade_index(100);
        //}
    });
/////////////////////////////////////////////////////////////////////////////////////////////(월간)일정 클릭 이벤트


/////////////////////////////////////////////////////////////////////////////////////////////일정 완료 관련 이벤트
    //일정 완료
    $("#popup_btn_complete").click(function(){  //사인 전 일정 완료 버튼 클릭
        $('#canvas, #canvasWrap').css('display', 'block');
        $('#inner_shade_planinfo').css('display', 'block');
        $("#popup_btn_sign_complete").css({'color':'#282828', 'background':'#ffffff'}).val('');
        var $popup = $('#cal_popup_planinfo');
        var $signcomplete_button = $('#popup_btn_sign_complete');
        if($popup.attr('data-grouptype') == "class"){
            $signcomplete_button.attr('data-signtype', 'class');

            // $('#id_member_dbid_finish').val($popup.attr("data-dbid"));
            // $('#id_member_name_finish').val($popup.attr('data-name'));
            // $('#id_lecture_id_finish').val($popup.attr('data-leid'));
            // $('#id_schedule_id_finish').val($popup.attr('schedule-id'));

        }else if($popup.attr('data-grouptype') == "group"){
            $signcomplete_button.attr('data-signtype', 'group');

            // $('#id_member_dbid_finish').val($popup.attr("data-dbid"));
            // $('#id_member_name_finish').val($popup.attr('data-name'));
            // $('#id_lecture_id_finish').val($popup.attr('data-leid'));
            // $('#id_schedule_id_finish').val($popup.attr('schedule-id'));
        }
        disable_window_scroll();
    });


    $('#popup_btn_sign_complete').click(function(){
        enable_window_scroll();
        if($(this).val()!="filled" && !$(this).hasClass('disabled_button')){
            $('#canvas, #canvasWrap').css('display', 'block');
            if(schedule_on_off == 2){
                toggleGroupParticipantsList('on');
            }
        }else if($(this).val()=="filled" && !$(this).hasClass('disabled_button')){
            disable_popup_btns_during_ajax();
            //ajax_block_during_complete_weekcal = false
            if(schedule_on_off==1){
                //PT 일정 완료 처리시
                $('#id_schedule_state_cd').val("PE");
                send_plan_complete('callback', function(json, senddata){
                    send_memo("blank");
                    signImageSend(senddata);
                    close_info_popup('cal_popup_planinfo');
                    completeSend();
                    super_ajaxClassTime();
                    enable_popup_btns_after_ajax();
                });
            }else if(schedule_on_off == 2){
                var groupOrMember = $('#popup_btn_sign_complete').attr('data-signtype');
                $('#id_group_schedule_id_finish').val($('#cal_popup_planinfo').attr('data-scheduleid'));
                $('#id_group_schedule_state_cd').val("PE");
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
                        close_sign_popup();
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
        //body_position_fixed_unset();
        if(!$(this).hasClass('disabled_button')){
            if($('#cal_popup_planinfo').attr('data-grouptype') == "group"){
                deleteTypeSelect = "groupptdelete";
            }else{
                deleteTypeSelect = "ptoffdelete";
            }
            if($('._calmonth').length>0){
                shade_index(200);
            }
            //$('#popup_delete_title').text('반복 일정 취소');
            pop_up_delete_confirm({"schedule-id":$('#cal_popup_planinfo').attr("schedule-id")}, '정말 일정을 취소하시겠습니까?', "callback", function(){$('#cal_popup_planinfo').hide();})
        }
    });

    function pop_up_delete_confirm(attr, confirm_comment, use, callback){
        $('#popup_delete_question').html(confirm_comment);
        $('#cal_popup_plandelete').css('display', 'block').attr(attr);
        if(use == "callback"){
            callback();
        }
    }
/////////////////////////////////////////////////////////////////////////////////////////////일정 취소 관련 이벤트


/////////////////////////////////////////////////////////////////////////////////////////////메모 송신
    //미니 팝업 메모수정
    $('#popup_info3_memo_modify').click(function(){
        if($(this).attr('data-type') == "view"){
            //$('#popup_info3_memo').attr('readonly', false).css({'border':'1px solid #cccccc'});
            $(this).attr({'src':'/static/user/res/btn-pt-complete.png', 'data-type':'modify'});
        }else if($(this).attr('data-type') == "modify"){
            // $('#popup_info3_memo').attr('readonly', true).css({'border':'0'});
            //$('#popup_info3_memo').attr('readonly', true);
            $(this).attr({'src':'/static/user/res/icon-pencil.png', 'data-type':'view'}).hide();
            send_memo();
        }
    });

    $('#popup_info3_memo').click(function(){
        //$(this).attr('readonly', false).css({'border':'1px solid #cccccc'});
        $('#popup_info3_memo_modify').show().attr({'src':'/static/user/res/btn-pt-complete.png', 'data-type':'modify'});
    });

/////////////////////////////////////////////////////////////////////////////////////////////메모 송신


/////////////////////////////////////////////////////////////////////////////////////////////삭제 확인 팝업
    //삭제 확인 팝업에서 Yes 눌렀을떄 동작 (PT 반복일정취소, OFF 반복일정취소, PT일정 취소, OFF일정 취소)
    $('#popup_delete_btn_yes').click(function(){
        var bodywidth = window.innerWidth;
        if(!$(this).hasClass('disabled_button')){
            disable_delete_btns_during_ajax();
            var repeat_schedule_id  = '';
            if(deleteTypeSelect == "repeatoffdelete" || deleteTypeSelect == "repeatptdelete"){ //일정등록창창의 반복일정 삭제
                repeat_schedule_id = $('#id_repeat_schedule_id_confirm').val();
                send_repeat_delete_personal(repeat_schedule_id, 'callback', function(jsondata){
                    enable_delete_btns_after_ajax();
                    close_info_popup('cal_popup_plandelete');
                    get_repeat_info($('#cal_popup_repeatconfirm').attr('data-dbid'));
                    super_ajaxClassTime();
                    $('#members_mobile, #members_pc').html('');
                    get_current_member_list();
                    get_current_group_list();
                    if(deleteTypeSelect == "repeatptdelete"){
                        get_member_lecture_list($('#cal_popup_plandelete').attr('data-dbid'), 'callback', function(jsondata){
                            var availCount_personal = 0;
                            for (var i = 0; i < jsondata.availCountArray.length; i++) {
                                if (jsondata.lectureStateArray[i] == "IP" && jsondata.checkOneToOneArray[i] == "1"){
                                    availCount_personal = availCount_personal + Number(jsondata.availCountArray[i]);
                                }
                            }
                            $("#countsSelected").text(availCount_personal);
                        });
                    }
                    if(bodywidth >= 600){
                        $('#calendar').css('position', 'relative');
                    }
                    $('#id_repeat_schedule_id_confirm').val('');
                });

            }else if(deleteTypeSelect == "repeatgroupptdelete"){
                repeat_schedule_id = $('#id_repeat_schedule_id_confirm').val();
                send_repeat_delete_group(repeat_schedule_id, 'callback', function(){
                    enable_delete_btns_after_ajax();
                    close_info_popup('cal_popup_plandelete');
                    get_repeat_info($('#cal_popup_repeatconfirm').attr('data-groupid'));
                    super_ajaxClassTime();
                    $('#members_mobile, #members_pc').html('');
                    get_current_member_list();
                    get_current_group_list();
                    if(bodywidth >= 600){
                        $('#calendar').css('position', 'relative');
                    }
                    var groupid = $('#membersSelected button').attr('data-groupid');
                    get_groupmember_list(groupid, 'callback', function(jsondata){
                        draw_groupMemberList_to_view(jsondata, $('#groupmemberInfo'));
                    });
                });
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
                                    if(jsondata.lectureStateArray[index] == "IP") {
                                        notice_lecture_status_changed_to_inprogress(jsondata.groupNameArray[index], member_name);
                                    }
                                }
                            });
                            $('#members_mobile, #members_pc').html('');
                            get_current_member_list();
                            get_current_group_list();
                        });
                    });
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
                send_plan_delete('group', 'callback', function(){
                    //ajax_block_during_delete_weekcal = true
                    enable_delete_btns_after_ajax();
                    $('#members_mobile, #members_pc').html('');
                    get_current_member_list();
                    get_current_group_list();
                });
            }else if(deleteTypeSelect == "absence"){
                $('#id_schedule_state_cd').val("PC");
                send_plan_complete("callback", function(){
                    toggleGroupParticipantsList('on');
                    $('#id_schedule_state_cd').val("");
                    close_info_popup('cal_popup_plandelete');
                    if($('._calmonth').css('display') == "block"){
                        shade_index(150);
                    }
                    enable_delete_btns_after_ajax();
                    super_ajaxClassTime();
                    disable_window_scroll();
                });
            }else if(deleteTypeSelect == "group_absence"){
                $('#id_group_schedule_state_cd').val("PC");
                send_group_plan_complete("callback", function(){
                    toggleGroupParticipantsList('on');
                    $('#id_group_schedule_state_cd').val("");
                    close_info_popup('cal_popup_plandelete');
                    if($('._calmonth').css('display') == "block"){
                        shade_index(150);
                    }
                    enable_delete_btns_after_ajax();
                    super_ajaxClassTime();
                    disable_window_scroll();
                });
            }else if(deleteTypeSelect == "group_member_complete"){
                $('#id_schedule_state_cd').val("PE");
                send_plan_complete("callback", function(){
                    toggleGroupParticipantsList('on');
                    $('#id_schedule_state_cd').val("");
                    close_info_popup('cal_popup_plandelete');
                    if($('._calmonth').css('display') == "block"){
                        shade_index(150);
                    }
                    enable_delete_btns_after_ajax();
                    super_ajaxClassTime();
                    disable_window_scroll();
                });
            }
        }
    });
/////////////////////////////////////////////////////////////////////////////////////////////삭제 확인 팝업


/////////////////////////////////////////////////////////////////////////////////////////////이름 눌러 회원 정보 팝업 띄우기
    //회원이름을 클릭했을때 회원정보 팝업을 보여주며 정보를 채워준다.
    $(document).on('click', '.memberNameForInfoView, .groupParticipantsRow span.go_member_info_window', function(e){
        e.stopPropagation();
        //body_position_fixed_unset();
        var bodywidth = window.innerWidth;
        var dbID = $(this).attr('data-dbid');
        var member_name = $(this).attr('data-name');
        $('.popups').hide();
        if(bodywidth < 600){
            // current_Scroll_Position = $(document).scrollTop();
            // console.log(current_Scroll_Position, 'qqqqq');
            beforeSend();
            $('#calendar').css('display', 'none');
            //$('#calendar').css('height', '0');
            get_indiv_member_info(dbID);
            get_member_lecture_list(dbID);
            // get_indiv_repeat_info(dbID);
            // get_member_history_list(dbID);
            $('#uptext3').text(member_name);
            $('#page-base-addstyle').hide();
            $('#page-base-modifystyle').show();

            $('#mobile_basic_info, #mobile_lecture_info').show();
            $('#mobile_repeat_info, #mobile_history_info').hide();
            $('#select_info_shift_lecture_mobile').addClass('button_active');
            $('#select_info_shift_schedule_mobile, #select_info_shift_history_mobile').removeClass('button_active');

            shade_index(100);
        }else if(bodywidth >= 600){
            get_indiv_member_info(dbID);
            get_member_lecture_list(dbID);
            // get_indiv_repeat_info(dbID);
            // get_member_history_list(dbID);
            $('.member_info_tool button._info_delete_img').hide();
            $('#info_shift_base, #info_shift_lecture').show();
            $('#info_shift_schedule, #info_shift_history').hide();
            $('#select_info_shift_lecture').addClass('button_active');
            $('#select_info_shift_schedule, #select_info_shift_history').removeClass('button_active');
            if($('._calmonth').length > 0){
                shade_index(100);
            }
        }
    });
/////////////////////////////////////////////////////////////////////////////////////////////이름 눌러 회원 정보 팝업 띄우기


/////////////////////////////////////////////////////////////////////////////////////////////일정 등록 팝업 닫기 (모바일/PC)
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
        $('#submitBtn_mini').css('background', '#282828');
        $('#memo_mini').val("");

        $("#membersSelected button").removeClass("dropdown_selected");
        var text1 = '회원/그룹 선택';
        var text2 = '선택';
        if(Options.language == "KOR"){
            text1 = '회원/그룹 선택';
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
                close_info_popup('cal_popup_plancheck');
                close_planadd_popup();
                close_manage_popup('member_info_PC');
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
    $(document).on('click', '.fake_for_blankpage', function(){
        $(this).fadeOut('fast');
    });
    //일정 없음 안내 팝업 닫기
/////////////////////////////////////////////////////////////////////////////////////////////부가 기능


/////////////////////////////////////////////////////////////////////////////////////////////함수 모음
    function ajaxClassTime(use, callfunction){
        var beforeSend_;
        var completeSend_;
        if(use == "callbefore"){
            beforeSend_ = function(){beforeSend('callback', function(){callfunction();});};
            completeSend_ = function(){completeSend();};
        }else if(use == "callafter"){
            beforeSend_ = function(){beforeSend();};
            completeSend_ = function(){completeSend('callback', function(){callfunction();});};
        }else{
            beforeSend_ = function(){beforeSend();};
            completeSend_ = function(){completeSend();};
        }
        var today_form = '';
        var searchdate = '';
        var calendar;
        if($('._calweek').length >0){
            calendar = "week";
        }else if($('._calmonth').length >0){
            calendar = "month";
        }

        if(calendar == "week"){
            var $weekNum4 = $('#weekNum_4').attr('data-date');
            today_form = $weekNum4.substr(0, 4)+'-'+$weekNum4.substr(4, 2)+'-'+$weekNum4.substr(6, 2);
            searchdate = 18;
        }else if(calendar == "month"){
            var yyyy = $('#yearText').attr('data-year');
            var mm = $('#yearText').attr('data-month');
            if(mm.length<2){
                mm = '0' + mm;
            }
            today_form = yyyy+'-'+ mm +'-'+"01";
            searchdate = 46;
        }
        // var start_time = '';
        // var end_time = '';
        $.ajax({
            url: '/trainer/get_trainer_schedule/',
            type : 'GET',
            data : {"date":today_form, "day":searchdate},
            dataType : 'html',

            beforeSend:function(){
                beforeSend_();

                // start_time = performance.now();
                // console.log(getTimeStamp());
                $('.ymdText-pc-add-off, .ymdText-pc-add-pt').addClass('disabled_button').attr('onclick', '');
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                // end_time = performance.now();
                // console.log(end_time-start_time + 'ms');
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray);
                }else{
                    schedule_data_cache = schedule_jsondata_to_dict(jsondata);
                    set_schedule_time(calendar, jsondata);
                }

                completeSend_();

                $('.ymdText-pc-add div').removeClass('disabled_button');
                $('.ymdText-pc-add-pt').attr('onclick', 'float_btn_addplan(1)');
                $('.ymdText-pc-add-off').attr('onclick', 'float_btn_addplan(2)');

            },

            complete:function(){

            },

            error:function(){
                console.log('server error');
            }
        });
    }

    function set_schedule_time(calendar, jsondata){
        if(calendar == "week"){
            $('._class, ._off, ._group').remove();
            $('._on').removeClass('_on');
            initialJSON = jsondata;
            var duplicate_check;
            if(bodywidth >= 600){
                if(varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null){
                    exist_check_dic = {};
                    duplicate_check = know_duplicated_plans(jsondata).result;
                    scheduleTime_Mobile('class', jsondata, calendarSize, duplicate_check);
                    scheduleTime_Mobile('off', jsondata, calendarSize, duplicate_check);
                    scheduleTime_Mobile('group', jsondata, calendarSize, duplicate_check);
                }else{
                    duplicate_check = know_duplicated_plans(jsondata).result;
                    scheduleTime('class', jsondata, calendarSize, duplicate_check);
                    scheduleTime('off', jsondata, calendarSize, duplicate_check);
                    scheduleTime('group', jsondata, calendarSize, duplicate_check);
                    fake_show();
                }
            }else if(bodywidth < 600){
                exist_check_dic = {};
                duplicate_check = know_duplicated_plans(jsondata).result;
                scheduleTime_Mobile('class', jsondata, calendarSize, duplicate_check);
                scheduleTime_Mobile('off', jsondata, calendarSize, duplicate_check);
                scheduleTime_Mobile('group', jsondata, calendarSize, duplicate_check);
            }
        }else if(calendar == "month"){
            initialJSON = jsondata;
            classDatesTrainer(jsondata);
            plancheck(clicked_td_date_info, jsondata);
        }
    }


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
                // if(send_data[4].value.length == 0){
                //     xhr.abort(); // ajax중지
                //     alert("에러발생: ID값이 지정되지 않았습니다. 다시 시도해주세요.\n 현재 페이지가 자동으로 새로 고침됩니다.");
                //     window.location.reload();
                // }
            },
            //통신성공시 처리
            success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray);
                    enable_popup_btns_after_ajax();
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
        });
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
                    enable_popup_btns_after_ajax();
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
        });
    }

    function send_memo(option){
        var schedule_id = $('#cal_popup_planinfo').attr('data-scheduleid');
        var memo = $('#popup_info3_memo').val();
        $.ajax({
            url:'/schedule/update_memo_schedule/',
            type:'POST',
            data:{"schedule_id":schedule_id, "add_memo":memo},

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
        });
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
        });
    }

    function close_sign_popup(){
        enable_window_scroll();
        $('#canvasWrap').css('display','none');
        $('#canvas').css({'border-color':'#282828','display':'none'});
        $("#popup_btn_sign_complete").css({'color':'#282828','background':'#ffffff'}).val('');
        $('#inner_shade_planinfo').css('display','none');//사인 창 닫기 함수
    }

    function disable_popup_btns_during_ajax(){ //일정 팝업의 [일정취소, 일정완료] 버튼 잠금
        $("#popup_btn_sign_complete, #popup_btn_delete").addClass('disabled_button');
    }

    function enable_popup_btns_after_ajax(){ //일정 팝업의 [일정취소, 일정완료] 버튼 잠금해제
        $("#popup_btn_sign_complete, #popup_btn_delete").removeClass('disabled_button');
    }

    function disable_delete_btns_during_ajax(){ //일정 삭제 팝업의 [예, 아니요] 버튼 잠금
        $('#popup_delete_btn_yes, #popup_delete_btn_no').addClass('disabled_button');
        //ajax_block_during_delete_weekcal = false;
    }

    function enable_delete_btns_after_ajax(){ //일정 삭제 팝업의 [예, 아니요] 버튼 잠금해제
        $('#popup_delete_btn_yes, #popup_delete_btn_no').removeClass('disabled_button');
        //ajax_block_during_delete_weekcal = false;
    }

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


/////////////////////////////////////////////////////////////////////////////////////////////푸시 함수
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

            },

            success:function(response){

            },

            complete:function(){

            },

            error:function(){

            }
        });
    }
/////////////////////////////////////////////////////////////////////////////////////////////푸시 함수

