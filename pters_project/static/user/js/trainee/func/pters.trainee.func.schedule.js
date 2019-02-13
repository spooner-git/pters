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
                if(jsondata.messageArray.length>0){
                    alert(jsondata.messageArray);
                    layer_popup.close_layer_popup();
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

