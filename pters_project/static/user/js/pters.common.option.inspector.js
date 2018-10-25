console.log(auth_type_cd)
function pters_option_inspector(option_type, xhr, option_element){
    //option_element는 date나, 회원숫자 등
    //옵션 값 auth_option_limit == 1 일경우, 다양한 옵션을 건다.
    //if(auth_type_cd.auth_option_limit == 1){
        var lock_date;

        var limit_num = 0;
        var limit_type = '';
        var auth_type_name = 'auth_'+option_type;

        if(auth_type_cd[auth_type_name] != undefined){
            limit_num = auth_type_cd[auth_type_name].limit_num;
            limit_type = auth_type_cd[auth_type_name].limit_type;
        }
        else{
            limit_num = 0;
            limit_type = auth_product_type_name;
        }

        //일정
        if(option_type == "plan_create"){
            var selected_date = option_element;
            var lock_date = limit_num;
            if((compare_date2(add_date(today_YY_MM_DD, lock_date), selected_date) == false  ||  compare_date2(selected_date, substract_date(today_YY_MM_DD, -lock_date)) == false)){
                show_caution_popup(function_lock_message("plan", lock_date, "일정 등록", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                }

                completeSend(); // ajax 로딩 이미지 숨기기

                if($('#page-addplan-pc').css('display') == "block"){
                    closeMiniPopup();
                }
                $(this).css({
                                        "-webkit-text-fill-color":'#282828'
                            });
                $(this).parent('p').addClass("dropdown_selected");
                var selector_timeGraph = $('#timeGraph');
                var selector_datepicker = $("#datepicker");
                var selector_datepicker_repeat_start = $("#datepicker_repeat_start");
                var selector_datepicker_repeat_end = $("#datepicker_repeat_end");
                if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
                    selector_datepicker.datepicker("setDate", today_YY_MM_DD);
                    //$("#id_training_date").val($("#datepicker").val()).submit();
                    $("#id_training_date, #id_training_end_date").val(selector_datepicker.val());
                    if(selector_timeGraph.css('display')=='none'){
                        selector_timeGraph.css('display', 'block');
                    }
                    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
                    clear_start_dur_dropdown();
                    $('#durations_mini, #durations_mini').html('');
                    $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft');
                    ajaxTimeGraphSet(selector_datepicker.val());
                }else if(addTypeSelect =="offadd"){
                    selector_datepicker.datepicker("setDate", today_YY_MM_DD);
                    $("#id_training_date_off, #id_training_end_date_off").val(selector_datepicker.val());
                    if(selector_timeGraph.css('display')=='none'){
                        selector_timeGraph.css('display','block');
                    }
                    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
                    clear_start_dur_dropdown();
                    $('#durations_mini, #durations_mini').html('');
                    $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft');
                    ajaxTimeGraphSet(selector_datepicker.val());
                }else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
                    selector_datepicker_repeat_start.datepicker("setDate", today_YY_MM_DD);
                    selector_datepicker_repeat_end.datepicker("setDate", null);
                    $("#id_repeat_start_date").val(selector_datepicker_repeat_start.val());
                    $("#id_repeat_end_date").val(selector_datepicker_repeat_end.val());
                    //pters_option_inspector("", selector_datepicker_repeat_start.val());
                }else if(addTypeSelect == "repeatoffadd"){
                    selector_datepicker_repeat_start.datepicker("setDate", today_YY_MM_DD);
                    selector_datepicker_repeat_end.datepicker("setDate", null);
                    $("#id_repeat_start_date_off").val(selector_datepicker_repeat_start.val());
                    $("#id_repeat_end_date_off").val(selector_datepicker_repeat_end.val());
                    //pters_option_inspector("", selector_datepicker_repeat_start.val());
                }
                check_dropdown_selected_addplan();
            }
        }else if(option_type == "plan_delete"){
            var selected_date = option_element;
            var lock_date = limit_num;
            if((compare_date2(add_date(today_YY_MM_DD, lock_date), selected_date) == false  ||  compare_date2(selected_date, substract_date(today_YY_MM_DD, -lock_date)) == false)){
                show_caution_popup(function_lock_message("plan", lock_date, "일정 삭제", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                }

                completeSend(); // ajax 로딩 이미지 숨기기

                if($('#page-addplan-pc').css('display') == "block"){
                    closeMiniPopup();
                }
                enable_delete_btns_after_ajax();
                close_info_popup('cal_popup_plandelete');
            }
        }else if(option_type == "plan_read"){
        }else if(option_type == "plan_update"){
        }

        //회원관리
        else if(option_type == "member_create"){
            var current_member_num = option_element;
            if(current_member_num >= limit_num){
                show_caution_popup(function_lock_message("create", limit_num, "회원 등록", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                }
            }
        }else if(option_type == "member_delete" ){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("delete", 1, "회원 삭제", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                }
            }
        }else if(option_type == "member_read"){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("read", 1, "상세 정보 조회", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    close_manage_popup('member_info_PC');
                    close_manage_popup('member_info');
                }
            }
        }else if(option_type == "member_update"){
            if(limit_num == 0){
                var dbID = option_element;
                show_caution_popup(function_lock_message("read", 1, "회원 정보 수정", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    get_indiv_member_info(dbID);
                    get_indiv_repeat_info(dbID);
                    get_member_lecture_list(dbID);
                    get_member_history_list(dbID);
                }
            }
        }

        //그룹관리
        else if(option_type == "group_create"){
            var current_group_num = option_element;
            if(current_group_num >= limit_num){
                show_caution_popup(function_lock_message("create", limit_num, "그룹 추가", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                }
            }
        }else if(option_type == "group_delete"){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("delete", 1, "삭제", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    enable_delete_btns_after_ajax();
                }
            }
        }else if(option_type == "group_read"){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("delete", 1, "그룹/클래스 인원 조회", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    $("div.groupWrap").removeClass('groupWrap_selected');
                    $('.groupMembersWrap_selected').removeClass('groupMembersWrap_selected').hide();
                    smart_refresh_member_group_class_list();
                }
            }
        }else if(option_type == "group_update"){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("delete", "", "수정", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    smart_refresh_member_group_class_list();
                }
            }
        }

        //그룹/클래스원 추가 뺴기
        else if(option_type == "groupmember_create"){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("delete", 1, "그룹원 추가", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    enable_delete_btns_after_ajax();
                }
            }
        }else if(option_type == "groupmember_delete"){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("delete", 1, "인원 수정", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    enable_delete_btns_after_ajax();
                }
            }
        //클래스 관리
        }else if(option_type == "class_create"){
            var current_class_num = option_element;
            if(current_class_num >= limit_num){
                show_caution_popup(function_lock_message("create", limit_num, "클래스 추가", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                }
            }
        }else if(option_type == "class_delete"){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("delete", 1, "인원 수정", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    enable_delete_btns_after_ajax();
                }
            }
        }else if(option_type == "class_read"){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("delete", "", "조회", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    $("div.groupWrap").removeClass('groupWrap_selected');
                    $('.groupMembersWrap_selected').removeClass('groupMembersWrap_selected').hide();
                    smart_refresh_member_group_class_list();
                }
            }
        }else if(option_type == "class_update"){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("plan", 1, "수정", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    smart_refresh_member_group_class_list();
                }
            }
        }
        
        //패키지 관리
        else if(option_type == "package_create"){
        }else if(option_type == "package_delete"){
        }else if(option_type == "package_read"){
        }else if(option_type == "package_update"){
        }
        
        //통계
        else if(option_type == "analytics_create"){
        }else if(option_type == "analytics_delete"){
        }else if(option_type == "analytics_read"){
            var diffmonth = option_element;
            if(diffmonth >= limit_num){
                show_caution_popup(function_lock_message("analytics_read", limit_num, "통계 조회", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                }
            }
        }else if(option_type == "analytics_update"){
        }

        //프로그램
        else if(option_type == "program_create"){
            // if(auth_type_cd.auth_program_create.limit_num > 0){
                var current_program_num = option_element;
                if(current_program_num >= limit_num){
                    show_caution_popup(function_lock_message("create", limit_num, "프로그램 생성", limit_type));
                }else{
                    location.href='/trainer/add_class/?cancel_redirect_url=/trainer/class_setting/';
                }
            // }else if(auth_type_cd.auth_program_create.active == 0){
            //     location.href='/trainer/add_class/?cancel_redirect_url=/trainer/class_setting/'
            // }
        }else if(option_type == "program_delete"){
            if(limit_num == 0){
                show_caution_popup(function_lock_message("delete", 1, "프로그램 삭제", limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                    $('#popup_delete_btn_no, .popup_close_x_button').parents('.popups').hide();
                    shade_index(-100);
                    $("#popup_delete_btn_yes").off();
                    $('#popup_delete_btn_no, .popup_close_x_button').off();
                }
            }
        }else if(option_type == "program_read"){
        }else if(option_type == "program_update"){
            var $this = option_element;
            if(limit_num == 0){
                show_caution_popup(function_lock_message("delete", 1, "프로그램명 수정", limit_type));
            }else if(limit_num > 0){
                if(!$this.hasClass('disabled_button')){
                    var $thiscancel = $this.siblings('._icon_cancel');
                    var $thisdel =  $this.siblings('._icon_del');
                    var $thissend = $this.siblings('._icon_send');
                    $('img._icon_modify, img._icon_del').addClass('disabled_button');
                    $this.css('display', 'none');
                    $thisdel.css('display', 'none');
                    $thissend.css('display', 'inline-block');
                    $thiscancel.css('display', 'inline-block');
                    $this.parent('div').siblings('.table_lecture_name').find('input').css('display', 'block');
                }
            }
        }
    //}
    //옵션 값 auth_option_limit == 1 일경우, 다양한 옵션을 건다.
}

function function_lock_message(function_type, number, option_type, user_type){ //auth_type_cd_lock_date
    var type_text = option_type;
    var message;
    // var free_message = "<p>[권한 없음]</p>";
    // var free_message1 = "";
    // if(user_type == 1){
    //     free_message = "무료 이용자께서는 <br>";
    //     free_message1 = `<span style="color:#fe4e65;">이용권</span> 구매로<br><span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!`;
    // }
    var free_message = `${user_type}이용자 께서는 <br>`;
    var free_message1 = `<span style="color:#fe4e65;">추가 이용권</span>으로<br><span style="color:#fe4e65;">제한 없이 </span>이용 해보세요!
                        <div id="go_to_purchase" onclick="location.href=/payment/">구매 하러 가기</div>`;


    if(number == 0){
        message = `<div style="margin-bottom:10px;">
                    ${free_message}
                    기능 이용이  <span style="font-weight:500;"> 제한</span>됩니다. <br><br>
                    ${free_message1}
                </div>`;
    }else{
        if(function_type == "plan"){
            var lock_date = number;
            message = `<div style="margin-bottom:10px;">
                            ${free_message}
                            <span style="font-weight:500;">${type_text}</span> 이용이 <span style="font-weight:500;">오늘 기준 ${lock_date}일로 제한</span>됩니다. <br><br>
                            ${free_message1}
                        </div>`;

        }else if(function_type == "create"){
            var limit_member_num = number;
            message = `<div style="margin-bottom:10px;">
                        ${free_message}
                        <span style="font-weight:500;">${type_text}</span> 이용이  <span style="font-weight:500;"> ${limit_member_num}건으로 제한</span>됩니다. <br><br>
                        ${free_message1}
                    </div>`;
        }else if(function_type == "delete"){
            var limit_member_num = number;
            message = `<div style="margin-bottom:10px;">
                        ${free_message}
                        <span style="font-weight:500;">${type_text}</span> 이용이  <span style="font-weight:500;"> 제한</span>됩니다. <br><br>
                        ${free_message1}
                    </div>`;
        }else if(function_type == "read"){
            var limit_member_num = number;
            message = `<div style="margin-bottom:10px;">
                        ${free_message}
                        <span style="font-weight:500;">${type_text}</span> 이용이  <span style="font-weight:500;"> 제한</span>됩니다. <br><br>
                        ${free_message1}
                    </div>`;
        }else if(function_type == "analytics_read"){
            var limit_member_num = number;
            message = `<div style="margin-bottom:10px;">
                        ${free_message}
                        <span style="font-weight:500;">${type_text}</span> 이용이  <span style="font-weight:500;">${limit_member_num}개월 단위로 제한</span>됩니다. <br><br>
                        ${free_message1}
                    </div>`;
        }
    }
    return message;
}


function show_free_member_use_guide(view_page){
    var $popup = $('#free_member_use_guide');
    if(view_page == "plan"){
        if(auth_type_cd.auth_plan_create.limit_type == "무료"){
            $popup.show().text(`(${auth_type_cd.auth_plan_create.limit_type}이용자) 일정등록/삭제: 오늘 기준 앞뒤 ${auth_type_cd.auth_plan_create.limit_num}일까지 가능`);
        }
    }else if(view_page == "member_manage"){
        if(auth_type_cd.auth_member_create.limit_type == "무료"){
            $popup.show().text(`(${auth_type_cd.auth_member_create.limit_type}이용자) 회원등록: 최대 ${auth_type_cd.auth_member_create.limit_num}명 등록 가능(진행중`);
        }
    }else if(view_page == "lecture_manage"){
        if(auth_type_cd.auth_group_create.limit_type == "무료"){
            $popup.show().text(`(${auth_type_cd.auth_group_create.limit_type}이용자) 그룹,클래스등록: 최대 ${auth_type_cd.auth_group_create.limit_num}개씩 등록 가능(진행중`);
        }
    }else if(view_page == "analytics"){
        if(auth_type_cd.auth_analytics_read.limit_type == "무료"){
            $popup.show().text(`(${auth_type_cd.auth_analytics_read.limit_type}이용자) 통계: ${auth_type_cd.auth_analytics_read.limit_num}개월씩 조회 가능`);
        }
    }else if(view_page == "program"){
        if(auth_type_cd.auth_program_create.limit_type == "무료"){
            $popup.show().text(`(${auth_type_cd.auth_program_create.limit_type}이용자) 프로그램: 최대 ${auth_type_cd.auth_program_create.limit_num}개 생성 가능`);
        }
    }
}