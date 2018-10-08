function pters_option_inspector_(xhr, date){
	//옵션 값 auth_option_limit == 1 일경우, 다양한 옵션을 건다.
	if(Options.auth_option_limit == 1){
		var selected_date = date;
		if((compare_date2(selected_date, add_date(today_YY_MM_DD, 7))  ||  compare_date2(substract_date(today_YY_MM_DD, -7), selected_date))){
			show_caution_popup(`<div style="margin-bottom:10px;">
                                    무료 이용자께서는 <br>
                                    일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 7일로 제한</span>됩니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                                </div>`);
			if(xhr != ""){
				xhr.abort(); // ajax중지
			}
			
			completeSend(); // ajax 로딩 이미지 숨기기
			if($('#page-addplan-pc').css('display') == "block"){
				closeMiniPopup();
			}

			if($('#page-addplan').css('display') == "block"){
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

		}
	}
	//옵션 값 auth_option_limit == 1 일경우, 다양한 옵션을 건다.

}


function pters_option_inspector(option_type, xhr, date){
    //옵션 값 auth_option_limit == 1 일경우, 다양한 옵션을 건다.
    if(Options.auth.auth_option_limit == 1){
        var selected_date = date;
        var lock_date = Options.auth.auth_lock_date;
        if((compare_date2(add_date(today_YY_MM_DD, lock_date), selected_date) == false  ||  compare_date2(selected_date, substract_date(today_YY_MM_DD, -lock_date)) == false)){
            show_caution_popup(function_lock_message(lock_date));
            if(xhr != ""){
                xhr.abort(); // ajax중지
            }

            completeSend(); // ajax 로딩 이미지 숨기기

            if($('#page-addplan-pc').css('display') == "block"){
                closeMiniPopup();
            }

            // if($('#page-addplan').css('display') == "block"){
            if(option_type == "plan_add"){
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
            }else if(option_type == "plan_delete"){

            }else if(option_type == "plan_view"){

            }else if(option_type == "member_add"){

            }else if(option_type == "member_delete"){

            }else if(option_type == "member_view"){

            }else if(option_type == "group_add"){

            }else if(option_type == "group_delete"){

            }else if(option_type == "group_view"){

            }else if(option_type == "class_add"){

            }else if(option_type == "class_delete"){

            }else if(option_type == "class_view"){

            }else if(option_type == "program_add"){

            }else if(option_type == "program_delete"){

            }
        }
    }
    //옵션 값 auth_option_limit == 1 일경우, 다양한 옵션을 건다.

    function function_lock_message(lock_date){ //Options.auth_lock_date
        var message;
        if(lock_date > 0){
            message =  `<div style="margin-bottom:10px;">
                                무료 이용자께서는 <br>
                                기능 이용이 <span style="font-weight:500;">오늘 기준 ${lock_date}일로 제한</span>됩니다. <br><br>
                                <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                            </div>`;
        }else if(lock_date == 0){
            message = `<div style="margin-bottom:10px;">
                                        무료 이용자께서는 <br>
                                        기능 이용이  <span style="font-weight:500;"> 제한</span>됩니다. <br><br>
                                        <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                        <span style="color:#fe4e65;">제한 없이 이용</span>해보세요!
                                    </div>`;
        }
        return message;
    }
}