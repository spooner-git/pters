function pters_option_inspector(option_type, xhr, option_element){
    //option_element는 date나, 회원숫자 등
    //옵션 값 auth_option_limit == 1 일경우, 다양한 옵션을 건다.
    if(Options.auth.auth_option_limit == 1){
        var lock_date;

        //일정
        if(      option_type == "plan_create"    && Options.auth.auth_plan_create.active == 1){
            var selected_date = option_element;
            var lock_date = Options.auth.auth_plan_create.limit_num;
            if((compare_date2(add_date(today_YY_MM_DD, lock_date), selected_date) == false  ||  compare_date2(selected_date, substract_date(today_YY_MM_DD, -lock_date)) == false)){
                show_caution_popup(function_lock_message("plan", lock_date, "일정 등록", Options.auth.auth_plan_create.limit_type));
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
                    pters_option_inspector("", selector_datepicker_repeat_start.val());
                }else if(addTypeSelect == "repeatoffadd"){
                    selector_datepicker_repeat_start.datepicker("setDate", today_YY_MM_DD);
                    selector_datepicker_repeat_end.datepicker("setDate", null);
                    $("#id_repeat_start_date_off").val(selector_datepicker_repeat_start.val());
                    $("#id_repeat_end_date_off").val(selector_datepicker_repeat_end.val());
                    pters_option_inspector("", selector_datepicker_repeat_start.val());
                }
                check_dropdown_selected_addplan();
            }
        }else if(option_type == "plan_delete"    && Options.auth.auth_plan_delete.active == 1){
            var selected_date = option_element;
            var lock_date = Options.auth.auth_plan_delete.limit_num;
            if((compare_date2(add_date(today_YY_MM_DD, lock_date), selected_date) == false  ||  compare_date2(selected_date, substract_date(today_YY_MM_DD, -lock_date)) == false)){
                show_caution_popup(function_lock_message("plan", lock_date, "일정 삭제", Options.auth.auth_plan_delete.limit_type));
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
        }else if(option_type == "plan_read"      && Options.auth.auth_plan_read.active == 1){
        }else if(option_type == "plan_update"    && Options.auth.auth_plan_update.active == 1){
        }

        //회원관리
        else if(option_type == "member_create"  && Options.auth.auth_member_create.active == 1){
            var current_member_num = option_element;
            if(current_member_num >= Options.auth.auth_member_create.limit_num){
                show_caution_popup(function_lock_message("member_create", Options.auth.auth_member_create.limit_num, "회원 등록", Options.auth.auth_member_create.limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                }
            }
        }else if(option_type == "member_delete"  && Options.auth.auth_member_delete.active == 1){
            show_caution_popup(function_lock_message("member_delete", 1, "회원 삭제", Options.auth.auth_member_delete.limit_type));
            if(xhr != ""){
                xhr.abort(); // ajax중지
                completeSend(); // ajax 로딩 이미지 숨기기
            }
        }else if(option_type == "member_read"    && Options.auth.auth_member_read.active == 1){
            show_caution_popup(function_lock_message("member_read", 1, "상세 정보 조회", Options.auth.auth_member_read.limit_type));
            if(xhr != ""){
                xhr.abort(); // ajax중지
                completeSend(); // ajax 로딩 이미지 숨기기
                close_manage_popup('member_info_PC');
                close_manage_popup('member_info');
            }
        }else if(option_type == "member_update"  && Options.auth.auth_member_update.active == 1){
            var dbID = option_element;
            show_caution_popup(function_lock_message("member_read", 1, "회원 정보 수정", Options.auth.auth_member_update.limit_type));
            if(xhr != ""){
                xhr.abort(); // ajax중지
                completeSend(); // ajax 로딩 이미지 숨기기
                get_indiv_member_info(dbID);
                get_indiv_repeat_info(dbID);
                get_member_lecture_list(dbID);
                get_member_history_list(dbID);
            }
        }

        //그룹관리
        else if(option_type == "group_create"   && Options.auth.auth_group_create.active == 1){
            var current_group_num = option_element;
            if(current_group_num >= Options.auth.auth_group_create.limit_num){
                show_caution_popup(function_lock_message("member_create", Options.auth.auth_group_create.limit_num, "그룹 추가", Options.auth.auth_group_create.limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                }
            }
        }else if(option_type == "group_delete"   && Options.auth.auth_group_delete.active == 1){
            show_caution_popup(function_lock_message("member_delete", "", "삭제", Options.auth.auth_group_delete.limit_type));
            if(xhr != ""){
                xhr.abort(); // ajax중지
                completeSend(); // ajax 로딩 이미지 숨기기
                enable_delete_btns_after_ajax();
            }
        }else if(option_type == "group_read"     && Options.auth.auth_group_read.active == 1){
        }else if(option_type == "group_update"   && Options.auth.auth_group_update.active == 1){
        }

        //그룹/클래스원 추가 뺴기
        else if(option_type == "groupmember_create" && Options.auth.auth_groupmember_create.active == 1){
            show_caution_popup(function_lock_message("member_delete", 1, "그룹원 추가", Options.auth.auth_groupmember_create.limit_type));
            if(xhr != ""){
                xhr.abort(); // ajax중지
                completeSend(); // ajax 로딩 이미지 숨기기
                enable_delete_btns_after_ajax();
            }
        }else if(option_type == "groupmember_delete" && Options.auth.auth_groupmember_delete.active == 1){
            show_caution_popup(function_lock_message("member_delete", 1, "인원 수정", Options.auth.auth_groupmember_delete.limit_type));
            if(xhr != ""){
                xhr.abort(); // ajax중지
                completeSend(); // ajax 로딩 이미지 숨기기
                enable_delete_btns_after_ajax();
            }

        //클래스 관리
        }else if(option_type == "class_create"   && Options.auth.auth_class_create.active == 1){
            var current_class_num = option_element;
            if(current_class_num >= Options.auth.auth_class_create.limit_num){
                show_caution_popup(function_lock_message("member_create", Options.auth.auth_class_create.limit_num, "클래스 추가", Options.auth.auth_class_create.limit_type));
                if(xhr != ""){
                    xhr.abort(); // ajax중지
                    completeSend(); // ajax 로딩 이미지 숨기기
                }
            }
        }else if(option_type == "class_delete"   && Options.auth.auth_class_delete.active == 1){
            show_caution_popup(function_lock_message("member_delete", 1, "인원 수정", Options.auth.auth_class_delete.limit_type));
            if(xhr != ""){
                xhr.abort(); // ajax중지
                completeSend(); // ajax 로딩 이미지 숨기기
                enable_delete_btns_after_ajax();
            }
        }else if(option_type == "class_read"     && Options.auth.auth_class_read.active == 1){
        }else if(option_type == "class_update"   && Options.auth.auth_class_update.active == 1){
        }
        
        //패키지 관리
        else if(option_type == "package_create"   && Options.auth.auth_package_create.active == 1){
        }else if(option_type == "package_delete"   && Options.auth.auth_package_delete.active == 1){
        }else if(option_type == "package_read"     && Options.auth.auth_package_read.active == 1){
        }else if(option_type == "package_update"   && Options.auth.auth_package_update.active == 1){
        }
        
        //통계
        else if(option_type == "analytics_create"   && Options.auth.auth_analytics_create.active == 1){
        }else if(option_type == "analytics_delete"   && Options.auth.auth_analytics_delete.active == 1){
        }else if(option_type == "analytics_read"     && Options.auth.auth_analytics_read.active == 1){
        }else if(option_type == "analytics_update"   && Options.auth.auth_analytics_update.active == 1){
        }

        //프로그램
        else if(option_type == "program_create" && Options.auth.auth_program_create.active == 1){
        }else if(option_type == "program_delete" && Options.auth.auth_program_delete.active == 1){
        }else if(option_type == "program_read"   && Options.auth.auth_program_read.active == 1){
        }else if(option_type == "program_update" && Options.auth.auth_program_update.active == 1){
        }
    }
    //옵션 값 auth_option_limit == 1 일경우, 다양한 옵션을 건다.
}

function function_lock_message(function_type, number, option_type, free_comment_on_off){ //Options.auth_lock_date
    var type_text = option_type;
    var message;
    var free_message = "<p>[권한 없음]</p>";
    var free_message1 = "";
    if(free_comment_on_off == 1){
        free_message = "무료 이용자께서는 <br>";
        free_message1 = `<span style="color:#fe4e65;">이용권</span> 구매로<br><span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!`;
    }


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

        }else if(function_type == "member_create"){
            var limit_member_num = number;
            message = `<div style="margin-bottom:10px;">
                        ${free_message}
                        <span style="font-weight:500;">${type_text}</span> 이용이  <span style="font-weight:500;"> ${limit_member_num}건으로 제한</span>됩니다. <br><br>
                        ${free_message1}
                    </div>`;
        }else if(function_type == "member_delete"){
            var limit_member_num = number;
            message = `<div style="margin-bottom:10px;">
                        ${free_message}
                        <span style="font-weight:500;">${type_text}</span> 이용이  <span style="font-weight:500;"> 제한</span>됩니다. <br><br>
                        ${free_message1}
                    </div>`;
        }else if(function_type == "member_read"){
            var limit_member_num = number;
            message = `<div style="margin-bottom:10px;">
                        ${free_message}
                        <span style="font-weight:500;">${type_text}</span> 이용이  <span style="font-weight:500;"> 제한</span>됩니다. <br><br>
                        ${free_message1}
                    </div>`;
        }
    }
    return message;
}
