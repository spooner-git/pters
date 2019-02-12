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
    if(call_method==POPUP_AJAX_CALL){
        $.ajax({
            url: '/trainee/delete_trainee_schedule/',
            data: data,
            dataType : 'html',
            type:'POST',

            beforeSend:function(){

            },

            success:function(data){

            },

            complete:function(){
            },

            error:function(){
                console.log('server error');
            }
        });
    }else if(call_method==POPUP_INNER_HTML){
	    $('#form_plan_delete').submit();
    }
}

