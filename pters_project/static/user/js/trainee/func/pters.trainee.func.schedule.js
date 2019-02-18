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

function func_cancel_schedule(data, call_method){

    if(call_method==CALL_AJAX){
        $.ajax({
            url: '/trainee/delete_trainee_schedule/',
            data: $(`#${data}`).serialize(),
            dataType : 'html',
            type:'POST',

            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success:function(result_data){
                let jsondata = JSON.parse(result_data);
                let error_message = jsondata.messageArray;
                if(error_message.length>0){
                    // alert(jsondata.messageArray);
                    // layer_popup.close_layer_popup();
                    layer_popup.open_layer_popup(POPUP_BASIC,
                                         'popup_basic_user_confirm',
                                         POPUP_SIZE_WINDOW,
                                         {'popup_title':'',
                                          'popup_comment':`${error_message}`,
                                          'onclick_function':`layer_popup.close_layer_popup()`});
                }else{
                    //성공
                }
            },
            complete:function(){

            },

            error:function(){
                console.log('server error');
            }
        });

    }else if(call_method==CALL_PAGE_MOVE){
        $(`#${data}`).submit();
    }
}

function func_add_schedule(data, call_method){
    if(call_method==CALL_AJAX){
        $.ajax({
            url: '/trainee/add_trainee_schedule/',
            data: $(`#${data}`).serialize(),
            dataType : 'html',
            type:'POST',

            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success:function(result_data){
                let jsondata = JSON.parse(result_data);
                let error_message = jsondata.messageArray;
                if(error_message.length>0){
                    layer_popup.open_layer_popup(POPUP_BASIC,
                                         'popup_basic_user_confirm',
                                         POPUP_SIZE_WINDOW,
                                         {'popup_title':'',
                                          'popup_comment':`${error_message}`,
                                          'onclick_function':`layer_popup.close_layer_popup()`});
                }else{
                    layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_reserve_complete', 100, POPUP_FROM_RIGHT);
                    //성공
                }
            },
            complete:function(){

            },

            error:function(){
                console.log('server error');
            }
        });

    }else if(call_method==CALL_PAGE_MOVE){
        $(`#${data}`).submit();
    }
}

