/**
 * Created by Hyunki on 03/03/2019.
 */
/* global $, windowHeight, windowWidth, setting_info, select_date */

/*수강권 정보 열고 닫기*/
$('#id_ticket_detail_expand_in_reserve').attr("data-open", CLOSE);
$(document).off("click", '#id_ticket_detail_expand_in_reserve');

$(document).on("click", '#id_ticket_detail_expand_in_reserve', function(){

    let $this = $(this);
    let option = $this.attr("data-open");
    let wrapper_my_ticket_detail_in_reserve = $('#wrapper_ticket_info');

    switch(option){
        case OPEN:
            $this.attr({"data-open": CLOSE,
                        "src": "/static/common/icon/expand_more_black.png"});
            wrapper_my_ticket_detail_in_reserve.hide();
        break;

        case CLOSE:
            $this.attr({"data-open": OPEN,
                        "src": "/static/common/icon/expand_less_black.png"});
            wrapper_my_ticket_detail_in_reserve.show();
        break;
    }
});

$(document).on("change", "select[title='lecture_select']", function(){
    let $selected_option = $(this).find('option:selected');
    let selected_lecture_id = $selected_option.attr('data-lecture-id');
    $('#form_content_lecture_id').val(selected_lecture_id);
});

$(document).on("change", "select[title='time_select']", function(){
    let $selected_option = $(this).find('option:selected');

    let start = $selected_option.attr('data-start').split(' ');
    let end = $selected_option.attr('data-end').split(' ');

    let start_date = start[0];
    let start_time = start[1];
    let end_date = end[0];
    let end_time = end[1];

    $('#form_content_training_date').val(start_date);
    $('#form_content_training_end_date').val(end_date);
    $('#form_content_training_time').val(start_time);
    $('#form_content_training_end_time').val(end_time);
});






function func_get_ajax_schedule_data_temp(input_reference_date, callback){
    $.ajax({
        url: '/trainee/get_trainee_schedule/',
        type : 'GET',
        data : {"date": input_reference_date, "day":1},
        dataType : 'html',

        beforeSend:function(xhr, settings){
            func_ajax_before_send(xhr, settings, "func_get_ajax_schedule_data_temp");
        },


        success:function(data){
            let jsondata = JSON.parse(data);
            /**
             * @param jsondata.messageArray
             **/
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                callback(jsondata);
            }

            return jsondata;
        },

        complete:function(){
            func_ajax_after_send("func_get_ajax_schedule_data_temp");
        },

        error:function(){
            console.log('server error');
        }
    });
}
