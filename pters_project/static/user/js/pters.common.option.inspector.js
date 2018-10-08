function pters_option_inspector(option_type, xhr, date){
    //옵션 값 auth_option_limit == 1 일경우, 다양한 옵션을 건다.
    if(Options.auth.auth_option_limit == 1){
        var selected_date = date;
        var lock_date;
        if(      option_type == "plan_create"    && Options.auth.auth_plan_create[0] == 1){
            var lock_date = Options.auth.auth_plan_create[1];
            if((compare_date2(add_date(today_YY_MM_DD, lock_date), selected_date) == false  ||  compare_date2(selected_date, substract_date(today_YY_MM_DD, -lock_date)) == false)){
                show_caution_popup(function_lock_message(lock_date, "일정 등록"));
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
                        selector_timeGraph.css('display','block');
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
        }else if(option_type == "plan_delete"    && Options.auth.auth_plan_delete[0] == 1){
            var lock_date = Options.auth.auth_plan_delete[1];
            if((compare_date2(add_date(today_YY_MM_DD, lock_date), selected_date) == false  ||  compare_date2(selected_date, substract_date(today_YY_MM_DD, -lock_date)) == false)){
                show_caution_popup(function_lock_message(lock_date, "일정 삭제"));
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
        }else if(option_type == "plan_read"      && Options.auth.auth_plan_read == 1){

        }else if(option_type == "plan_update"    && Options.auth.auth_plan_update == 1){



        }else if(option_type == "member_create"  && Options.auth.auth_member_create == 1){

        }else if(option_type == "member_delete"  && Options.auth.auth_member_delete == 1){

        }else if(option_type == "member_read"    && Options.auth.auth_member_read == 1){

        }else if(option_type == "member_update"  && Options.auth.auth_member_update == 1){



        }else if(option_type == "group_create"   && Options.auth.auth_group_create == 1){

        }else if(option_type == "group_delete"   && Options.auth.auth_group_delete == 1){

        }else if(option_type == "group_read"     && Options.auth.auth_group_read == 1){

        }else if(option_type == "group_update"   && Options.auth.auth_group_update == 1){



        }else if(option_type == "class_create"   && Options.auth.auth_class_create == 1){

        }else if(option_type == "class_delete"   && Options.auth.auth_class_delete == 1){

        }else if(option_type == "class_read"     && Options.auth.auth_class_read == 1){

        }else if(option_type == "class_update"   && Options.auth.auth_class_update == 1){



        }else if(option_type == "package_create"   && Options.auth.auth_package_create == 1){

        }else if(option_type == "package_delete"   && Options.auth.auth_package_delete == 1){

        }else if(option_type == "package_read"     && Options.auth.auth_package_read == 1){

        }else if(option_type == "package_update"   && Options.auth.auth_package_update == 1){



        }else if(option_type == "analytics_create"   && Options.auth.auth_analytics_create == 1){

        }else if(option_type == "analytics_delete"   && Options.auth.auth_analytics_delete == 1){

        }else if(option_type == "analytics_read"     && Options.auth.auth_analytics_read == 1){

        }else if(option_type == "analytics_update"   && Options.auth.auth_analytics_update == 1){



        }else if(option_type == "program_create" && Options.auth.auth_program_create == 1){

        }else if(option_type == "program_delete" && Options.auth.auth_program_delete == 1){

        }else if(option_type == "program_read"   && Options.auth.auth_program_read == 1){

        }else if(option_type == "program_update" && Options.auth.auth_program_update == 1){

        }
    }
    //옵션 값 auth_option_limit == 1 일경우, 다양한 옵션을 건다.

    function function_lock_message(lock_date, option_type){ //Options.auth_lock_date
        var type_text = option_type;
        var message;
        if(lock_date > 0){
            message = `<div style="margin-bottom:10px;">
                            무료 이용자께서는 <br>
                            <span style="font-weight:500;">${type_text}</span> 이용이 <span style="font-weight:500;">오늘 기준 ${lock_date}일로 제한</span>됩니다. <br><br>
                            <span style="color:#fe4e65;">이용권</span> 구매로<br>
                            <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                        </div>`;
        }else if(lock_date == 0){
            message = `<div style="margin-bottom:10px;">
                            무료 이용자께서는 <br>
                            기능 이용이  <span style="font-weight:500;"> 제한</span>됩니다. <br><br>
                            <span style="color:#fe4e65;">이용권</span> 구매로<br>
                            <span style="color:#fe4e65;">제한 없이 이용</span>해보세요!
                        </div>`;
        }
        return message;
    }
}
