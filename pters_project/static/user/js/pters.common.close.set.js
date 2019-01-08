
function closePopup_mobile(buttonname){
    if(buttonname == "upbutton-x"){
        var thisAttr = $("#upbutton-x").attr('data-page');
        if(thisAttr == "addplan"){
            close_planadd_popup_mobile();
        }else if(thisAttr == "memberadd"){
            close_manage_popup('member_add');
            if(bodywidth < 600){
                //$('#calendar').css('display','block')
                $('#calendar').css('height', '100%');
            }
            if($('#popup_ticket_info_mobile').css('display') == "block"){
                $('#page_managemember').css('display', 'none');
                $("#upbutton-x-modify").attr('data-page', 'ticket_info');
                $('#page-base-modifystyle').css('display', 'block');
                $('#page-base').css('display', 'none');
            }
        }else if(thisAttr == "lecture_info"){
            // $('#page_managemember').css('height', '100%');
            // $('#popup_lecture_info_mobile').css({'display':'none'});
            $('#page_managemember').css('display', 'block');
            $(window).scrollTop(current_Scroll_Position);
            $('#popup_lecture_info_mobile').css({'display':'none'});

            $('#page-base').css('display', 'block');
            $('#page-base-modifystyle').css('display', 'none');
        }else if(thisAttr == "ticket_info"){
            $('#page_managemember').css('display', 'block');
            $(window).scrollTop(current_Scroll_Position);
            $('#popup_ticket_info_mobile').css({'display':'none'});

            $('#page-base').css('display', 'block');
            $('#page-base-modifystyle').css('display', 'none');
        }else if(thisAttr == "memberinfo"){
            $('#uptext2').text('수업 정보');
            close_manage_popup('member_info');
            $('#upbutton-x, #upbutton-x-modify').attr('data-page', 'lecture_info');
        }
    }else if(buttonname == "upbutton-x-modify"){
        var bodywidth = window.innerWidth;
        var selector_calendar = $('#calendar');
        $('#uptext3').text('회원 정보');
        $('#uptext-pc-modify').text('회원 정보');
        close_manage_popup('member_info');
        if(bodywidth < 600 && selector_calendar.length != 0){
            selector_calendar.css('display', 'block');
            //selector_calendar.css('height', '100%');
        }
        var thisAttr = $("#upbutton-x-modify").attr('data-page');
        if(thisAttr == "lecture_info"){
            // $('#page_managemember').css('height', '100%');
            // $('#popup_lecture_info_mobile').css({'display':'none'});
            $('#page_managemember').css('display', 'block');
            $(window).scrollTop(current_Scroll_Position);
            $('#popup_lecture_info_mobile').css({'display':'none'});

            $('#page-base').css('display', 'block');
            $('#page-base-modifystyle').css('display', 'none');
        }else if(thisAttr == "ticket_info"){
            $('#page_managemember').css('display', 'block');
            $(window).scrollTop(current_Scroll_Position);
            $('#popup_ticket_info_mobile').css({'display':'none'});
            $('#page-base').css('display', 'block');
            $('#page-base-modifystyle').css('display', 'none');
            if(bodywidth <1000 & bodywidth >600){
                $('#popup_ticket_info_mobile_modify_btn > img').attr('src', '/static/user/res/icon-pencil.png');
                $('#popup_ticket_info_mobile_modify_btn').attr('data-type', 'view')
            }
        }else if(thisAttr == "memberinfo"){
            // $('#page_managemember').css('height', '100%');
            // $('#popup_lecture_info_mobile').css({'display':'none'});
            $('#page_managemember').css('display', 'block');
            $(window).scrollTop(current_Scroll_Position);
            $('#popup_lecture_info_mobile').css({'display':'none'});

            $('#uptext2').text('수업 정보');
            close_manage_popup('member_info');
            $('#upbutton-x, #upbutton-x-modify').attr('data-page', '');
        }
        enable_window_scroll();
    }
    mutex_val = 1;
}

function close_planadd_popup_mini(){
    $('#page-addplan-pc').hide();
    clear_pt_off_add_popup_mini();
}

function clear_pt_off_add_popup_mini(){
    //핑크 버튼 활성화 초기화
    $('#submitBtn_mini').css('background', '#282828');

    //진행시간 선택 핑크 하단선 초기화
    $('#classDuration_mini #durationsSelected button').removeClass('dropdown_selected').html("<span style='color:#cccccc;'>선택</span>").val("");

    //회원 선택 핑크 하단선 초기화
    $("#membersSelected button, #membersSelected_mini button").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>회원/그룹 선택</span><img src='/static/user/res/ajax/loading.gif' alt='' class='ajaxloading_dropdown'>").val("");

    //예약가능 횟수 내용 초기화
    $("#countsSelected,.countsSelected").text("");
    $('#remainCount_mini, #groupInfo_mini').hide();

    //메모 초기화
    $('#addmemo_mini input').val('').text('');

    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
    select_all_check=false;
}


//기본 정보 팝업 닫기
//cal_popup_planinfo
//cal_popup_plandelete
//cal_popup_repeatconfirm
//cal_popup_plancheck
function close_info_popup(option){
    var bodywidth = window.innerWidth;
    body_position_fixed_unset();
    if(option=="cal_popup_planinfo"){
        $("#"+option).css({'display':'none'});
        $('#groupParticipants').html("");
        toggleGroupParticipantsList('off');
        if($('#pshade').css('z-index')==150 || $('#mshade').css('z-index') == 150){
            shade_index(100);
        }else{
            shade_index(-100);
        }
        if($('._calweek').length != 0){
            enable_window_scroll();
        }
        //$('body').css('overflow-y','overlay');
    }else if(option =="cal_popup_plandelete"){
        $("#"+option).css({'display':'none'});
        if($('#pshade').css('z-index')== 200 || $('#mshade').css('z-index') == 200){
            shade_index(100);
        }else if($('#pshade').css('z-index')== 300 || $('#mshade').css('z-index') == 300){
            shade_index(100);
        }else{
            shade_index(-100);
        }

        if($('._calmonth').css('display') == "block" && $('#cal_popup_planinfo').css('display') == "block"){
            shade_index(150);
        }


        if($('#cal_popup_planinfo').css('display') == "block"){

        }else{
            enable_window_scroll();
        }
        //$('body').css('overflow-y','overlay');
    }else if(option =="cal_popup_repeatconfirm"){
        $('#'+option).css('display', 'none');
        //$('#calendar').css('position','relative')
        if($('#pshade').css('z-index') == 200 || $('#mshade').css('z-index') == 200){
            shade_index(100);
        }else{
            shade_index(-100);
        }
        if(bodywidth>=600){
            $('#calendar').css('position', 'relative');
        }else{
            //$('._calmonth').css({'height':'90%','position':'fixed'})
            //$('body').css('overflow-y','overlay');
        }
        //enable_window_scroll();
    }else if(option == "cal_popup_plancheck"){
        $('#'+option).css('display', 'none');
        shade_index(-100);
        enable_window_scroll();
    }
}
//기본 정보 팝업 닫기


//일정추가 팝업 닫기 (pc)
function close_planadd_popup(){
    $('#page-addplan').css('display', 'none');
    $('#calendar').css('position', 'relative');
    $('.add_time_unit, .allow_all_time').removeClass('checked');
    $('.add_time_unit div,  .allow_all_time div').removeClass('ptersCheckboxInner_sm');
    shade_index(-100);
    enable_window_scroll();
    if(bodywidth<=820){
        $('#float_btn_wrap').show();
        $('#float_btn').removeClass('rotate_btn');
    }
    if(bodywidth<600){
        $('#calendar').css('height', '100%');
        $('#page-base').css('display', 'block');
        $('#page-base-addstyle').css('display', 'none');
    }
    $("#id_repeat_duplication_enable_flag").val('0');
    $("#id_repeat_off_duplication_enable_flag").val('0');
    $("#id_pt_duplication_enable_flag").val('0');
    $("#id_off_duplication_enable_flag").val('0');
}
//일정추가 팝업 닫기 (pc)

//일정추가 팝업 닫기 (mobile)
function close_planadd_popup_mobile(){
    $('#page-addplan').css('display', 'none');
    if(bodywidth < 600){
        //$('#calendar').css('display','block');
        $('#calendar').css('height', '100%');
    }
    $('#float_btn_wrap').show().removeClass('rotate_btn');
    $('#page-base').css('display', 'block');
    $('#page-base-addstyle').css('display', 'none');

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
    $('.add_time_unit, .allow_all_time').removeClass('checked');
    $('.add_time_unit div, .allow_all_time div').removeClass('ptersCheckboxInner_sm');
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
    $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate', null);
    $('#repeattypeSelected button, #repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>"+text2+"</span>");
    //$('#page-addplan form input').val('');
    selectedDayGroup = [];

    $('._NORMAL_ADD_wrap').css('display', 'block');
    $('._REPEAT_ADD_wrap').css('display', 'none');
    $('#timeGraph').css('display', 'none');
    $("#id_repeat_duplication_enable_flag").val('0');
    $("#id_repeat_off_duplication_enable_flag").val('0');
    $("#id_pt_duplication_enable_flag").val('0');
    $("#id_off_duplication_enable_flag").val('0');
    shade_index(-100);
}
//일정추가 팝업 닫기 (mobile)


//회원 정보 관련(회원정보, 회원정보pc, 회원추가, 그룹/클래스추가) 팝업 닫기
function close_manage_popup(option){
    mutex_val = 1;
    lecture_mutex_val = 1;
    ticket_mutex_val = 1;
    var bodywidth = window.innerWidth;
    var text = '회원 정보 조회';
    if(Options.language == "JPN"){
        text = 'メンバー情報';
    }else if(Options.language == "ENG"){
        text = 'Member Info.';
    }
    if(option == 'member_info'){
        $('#memberRegHistory_info_PC, #memberRepeat_info_PC, #memberLectureHistory_info_PC').html('');
        hide_this();
        if(bodywidth < 600){
            // $('#page_managemember').css({'height':'100%'});
            $('#page_managemember').css({'display':'block'});
            $(window).scrollTop(current_Scroll_Position);
            base_show();
            base_modify_hide();
        }
        float_btn_show();

        function float_btn_show(){
            $('#float_btn_wrap').show();
            $('#float_btn').removeClass('rotate_btn');
        }

        function base_show(){
            $('#page-base').css('display', 'block');
        }

        function base_modify_hide(){
            $('#page-base-modifystyle').css('display', 'none');
        }
        var selector_upbutton_modify = $('#upbutton-modify');
        selector_upbutton_modify.find('img').attr({'src':'/static/user/res/icon-pencil.png'});
        selector_upbutton_modify.attr({'data-type':'view'});
        $('#uptext-pc-modify').text(text);

        function hide_this(){
            $('#memberInfoPopup').removeClass('display_block');
            if($('#mshade').css('z-index')==150){
                shade_index(150);
            }else{
                shade_index(-100);
            }
        }

        $('#memberRegHistory_info').html("");
        $('#memberRepeat_info').html("");
        $('#memberLectureHistory_info').html("");

        hide_plandelete();
        close_others();

        function hide_plandelete(){
            $('#cal_popup_plandelete').css('display','none');
        }

        function close_others(){
            if($('._calmonth').css('display')=="block"){
                close_info_popup('cal_popup_plancheck');
                close_info_popup('cal_popup_planinfo');
            }
            $('span.mobile_title_popup').remove();
        }
    }else if(option == 'member_info_PC'){
        $('body').css('overflow-y','auto');
        $('#memberRegHistory_info_PC, #memberRepeat_info_PC, #memberLectureHistory_info_PC').html('');
        $('#memberInfoPopup_PC').removeClass('display_block');
        if($('#pshade').css('z-index')==150 || $('#mshade').css('z-index') == 150){

        }else{
            shade_index(-100);
        }
        $('span.mobile_title_popup').remove();
    }else if(option == 'member_add'){
        $('body').css('overflow-y', 'auto');
        var selector_float_btn_member_add = $('#float_btn');
        if(bodywidth < 600){
            //$('#page_managemember').show();
            //$('#page_managemember').css({'height':'100%'});
            $('#page_managemember').css({'display':'block'});
            $(window).scrollTop(current_Scroll_Position);
            $('#page-base').css('display','block');
            $('#page-base-addstyle').css('display','none');
            $('#float_btn_wrap').show();
            selector_float_btn_member_add.removeClass('rotate_btn');
        }
        $('#page_addmember').css('display','none');
        selector_float_btn_member_add.css('display','block');
        $('#page_addmember_input_wrap .buttonGroup button').removeClass('disabled_button');
        $('.ptaddbox input,#memberDue_add_2, .ptaddbox textarea').val("");
        var selector_birth_year_month_date = $('#birth_year, #birth_month, #birth_date');
        selector_birth_year_month_date.find('option:first').prop('selected', true);
        selector_birth_year_month_date.css('color', '#cccccc');
        if($('#memberInfoPopup_PC').css('display')=="block"){
            shade_index(100);
        }else if($('#mshade').css('z-index')==150){
            shade_index(150);
        }
        else{
            shade_index(-100);
        }
        $('#subpopup_addByList, #subpopup_addBySearch').hide();
    }else if(option == 'group_add'){
        var selector_float_btn_group_add = $('#float_btn');
        if(bodywidth<600){
            //$('#page_managemember').show();
            //$('#page_managemember').css({'height':'100%'});
            $('#page_managemember').css({'display':'block'});
            $(window).scrollTop(current_Scroll_Position);
            $('#page-base').css('display', 'block');
            $('#page-base-addstyle').css('display','none');
            $('#float_btn_wrap').show();
            selector_float_btn_group_add.removeClass('rotate_btn');
        }
        $('#page_addgroup').css('display','block');
        selector_float_btn_group_add.css('display','block');
        $('.ptaddbox input,#memberDue_add_2, .ptaddbox textarea').val("");
        if($('#memberInfoPopup_PC').css('display')=="block"){
            shade_index(100);
        }else if($('#mshade').css('z-index')==150){
            shade_index(150);
        }
        else{
            shade_index(-100);
        }
    }
}
//회원 정보 관련(회원정보, 회원정보pc, 회원추가, 그룹/클래스추가) 팝업 닫기
