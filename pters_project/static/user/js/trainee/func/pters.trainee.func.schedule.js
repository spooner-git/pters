function planning_function(){
	return  {
				"create":function(){
					func_create_schedule();
				},
				"update":function(){
					func_update_schedule();
				},
				"delete" : function(){
		    		func_cancel_schedule();
				}
			};
}




function func_cancel_schedule(){
	// $('#form_plan_delete').submit();
	$.ajax({
            url: '/trainee/delete_trainee_schedule/',
            data: $('#form_plan_delete').serialize(),
            dataType : 'html',
            type:'POST',

            beforeSend:function(){

            },

            success:function(data){
            	
            },

            complete:function(){
            	window.location.reload();
            },

            error:function(){
                console.log('server error');
            }
        });

}