// function planning_function(){
// 	return  {
// 				"create":function(){
// 					func_create_schedule();
// 				},
// 				"update":function(){
// 					func_update_schedule();
// 				},
// 				"delete" : function(){
// 		    		func_cancel_schedule();
// 				}
// 			};
// }

function func_schedule(data, call_method, type){
    if(call_method == CALL_AJAX){
        $.ajax({
            url: `/trainee/${type}_trainee_schedule/`,
            data: data,
            dataType : 'html',
            type:'POST',

            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success:function(result_data){
                let jsondata = JSON.parse(result_data);
                /**
                 * @param jsondata.messageArray
                **/
                let error_message = jsondata.messageArray;
                if(error_message.length>0){
                    layer_popup.close_layer_popup();
                    show_error_message(error_message[0]);
                }else{
                    //성공
                    if(type == ADD){
                        layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_reserve_complete', 100, POPUP_FROM_RIGHT);
                    }else if(type == DELETE){
                        layer_popup.all_close_layer_popup();
                    }

                    month_calendar.draw_month_calendar_schedule(month_calendar.get_current_month());

                }
            },
            complete:function(){

            },

            error:function(){
                console.log('server error');
            }
        });

    }else if(call_method == CALL_PAGE_MOVE){
        $(`#${data}`).submit();
    }
}


function show_error_message(message){
    layer_popup.open_layer_popup(POPUP_BASIC,
                                 'popup_basic_user_confirm',
                                 POPUP_SIZE_WINDOW, POPUP_FROM_PAGE,
                                 {'popup_title':'',
                                  'popup_comment':`${message}`,
                                  'onclick_function':`layer_popup.close_layer_popup()`});
}

