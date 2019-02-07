
function pters_trainee_program(target_html){


    function func_ajax_get_trainee_program_list(use, callback){
        $.ajax({
            url: '/trainee/get_trainee_class_list/',
            dataType : 'html',
            type:'GET',

            beforeSend:function(){
                // beforeSend();
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    // $('#errorMessageBar').show();
                    // $('#errorMessageText').text(jsondata.messageArray);
                }else{
                    if(use == "callback"){
                        callback(jsondata);
                    }
                    console.log("ajax_get_trainee_program_list", jsondata)
                }
            },

            complete:function(){
                // completeSend();
            },

            error:function(){
                console.log('server error');
            }
        });
    }

    function func_draw_trainee_program_list(jsondata){
        let $target = $(target_html);
        let html_to_add_cache = [];
        let len = jsondata.classIdArray.length;
        for(let i=0; i<len; i++){
            html_to_add_cache.push(
                                    `
                                    <div class="obj_box_card">
                                        <div class="wrapper_program_name obj_font_size_16_weight_bold">${jsondata.classInfoArray[i]}</div>
                                        <div class="wrapper_ticket_count_info obj_font_size_11_weight_normal obj_font_color_grey">
                                            수업이 <span class="obj_font_color_pters_red">${jsondata.lectureCountsArray[i]}번</span> 남았습니다.
                                        </div>
                                        <div class="wrapper_teacher_info obj_table_raw">
                                            <div class="obj_box_photo obj_table_cell_x2"></div>
                                            <div class="wrapper_teacher_name obj_table_cell_x2 obj_font_size_12_weight_500">${jsondata.trainerNameArray[i]} 강사</div>
                                        </div>
                                    </div>
                                    `
                                  );
        }
        if(len%2 != 0){
            html_to_add_cache.push(
                                    `
                                    <div class="obj_box_card" style="height:137px;vertical-align:top;">
                                        <img src="/static/user/res/PTERS_logo_pure.png" style="width: 50%;">
                                    </div>
                                    `
                                  );
        }

        $target.html(html_to_add_cache.join(""));
    }

    return {
                "get_program_list":function(){
                    func_ajax_get_trainee_program_list();
                },
                "draw_program_list":function(){
                    func_ajax_get_trainee_program_list("callback", function(jsondata){
                        func_draw_trainee_program_list(jsondata);
                    });
                }
           };
}



