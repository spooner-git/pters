/**
 * Created by Hyunki on 01/08/2019.
 */


$(document).ready(function() {

});

function check_member_info(){
    // form 안에 있는 값 검사
    let id_check_member_form = document.getElementById("id_check_member_form");
    let inputs = id_check_member_form.elements;
    let error_info = '';

    for(let i=0; i<inputs.length; i++){
        if (inputs[i].nodeName === "INPUT" && (inputs[i].type === "text" || inputs[i].type === "password")) {
            // Update text input
            if(inputs[i].value == ''){
                error_info = inputs[i].getAttribute('title');
                break;
            }
        }
    }
    if(error_info!=''){
        show_error_message(error_info+'를 확인해주세요.');
    }else{
        id_check_member_form.submit();
    }
}

function check_activation_select(activation_type) {
    $('#id_activation_type').val(activation_type);
    if (activation_type == 'phone') {
        $('#group_select_phone_box').attr('class', 'group_select_box_on');
        $('#group_select_email_box').attr('class', 'group_select_box_off');
        $('#group_select_phone_input_box').css('display','block');
        $('#group_select_email_input_box').css('display','none');
        $('#id_email').val("").attr('data-valid', 'false');
        $('#id_activation_code_email').val("").attr('data-valid', 'false');
        $(`#id_activation_button_email`).text('인증').css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
        $(`#id_activation_confirm_button_email`).css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
        $(`#activation_timer_email`).text("");
        $(`#id_activation_confirm_email`).text('');
    } else {
        $('#group_select_phone_box').attr('class', 'group_select_box_off');
        $('#group_select_email_box').attr('class', 'group_select_box_on');
        $('#group_select_phone_input_box').css('display','none');
        $('#group_select_email_input_box').css('display','block');
        $('#id_phone').val("").attr('data-valid', 'false');
        $('#id_activation_code_phone').val("").attr('data-valid', 'false');
        $(`#id_activation_button_phone`).text('인증').css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
        $(`#id_activation_confirm_button_phone`).css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
        $(`#activation_timer_phone`).text("");
        $(`#id_activation_confirm_phone`).text('');
    }
    clearInterval(reset_activation_time_interval);
}

function check_reset_activation_button(event, method){
    let min_length = 9;
    if(method == 'email'){
        min_length = 5;
    }
    if(event.value.length>min_length){
        let id_activation_button = $(`#id_activation_button_${method}`);
        id_activation_button.css({'color':'#fe4e65', 'border':'solid 1px #fe4e65', 'pointer-events':'auto'});
        // id_activation_button.attr('disabled', false);
        event.attributes['data-valid'].value = 'true';
    }
    else{
        let id_activation_button = $(`#id_activation_button_${method}`);
        id_activation_button.css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
        // id_activation_button.attr('disabled', true);
        event.attributes['data-valid'].value = 'false';
    }
}
let reset_activation_timer = 180;
var reset_activation_time_interval;
function reset_activate(method){
    // 인증 버튼 활성화
    $(`#id_activation_confirm_button_${method}`).css({'color':'#fe4e65', 'border':'solid 1px #fe4e65', 'pointer-events':'auto'});

    // 인증 관련 메시지 초기화
    reset_activation_timer = 180;
    if(method=='email'){
        reset_activation_timer = 600;
    }
    let activation_timer_text = parseInt(reset_activation_timer/60)+':00';
    $(`#id_activation_button_${method}`).text('재인증').css({'color':'#fe4e65', 'border':'solid 1px #fe4e65'});
    $(`#id_activation_confirm_${method}`).text(" ").css({'display':'none'});
    $(`#activation_timer_${method}`).text(activation_timer_text).css({'display':'inline-block'});
    let phone_val = '';
    let email_val = '';
    try{
        phone_val = document.getElementById('id_phone').value;
    }
    catch(e){
        phone_val = '';
    }
    try{
        email_val = document.getElementById('id_email').value;
    }
    catch(e){
        email_val = '';
    }
    // 인증 메시지 발송
    $.ajax({
        url:'/login/reset_activate/',
        type:'POST',
        data:{'token':document.getElementById('g-recaptcha-response').value,
              'phone':phone_val,
              'email':email_val,
              'member_id':document.getElementById('id_member_id').value,
              'activation_type':document.getElementById('id_activation_type').value
             },
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },
        //통신성공시 처리
        success:function(data){
            let jsondata = JSON.parse(data);
            if(jsondata.messageArray.length > 0){
                $(`#id_activation_button_${method}`).text('인증').css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
                $(`#id_activation_confirm_button_${method}`).css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
                $(`#activation_timer_${method}`).text("");
                show_error_message(jsondata.messageArray);
            }else{
                show_error_message('인증번호가 발송되었습니다.\n인증번호가 오지 않는 경우 스팸함을 확인해주세요.');
                reset_activation_time_interval = setInterval(function(){
                    reset_activation_timer--;
                    // 시간 종료시 처리
                    if(reset_activation_timer<0){
                        $(`#id_activation_confirm_${method}`).text('인증 시간이 초과되었습니다.').css({'display':'block'}).css('color', '#fe4e65');
                        $(`#id_activation_confirm_button_${method}`).css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
                        clearInterval(reset_activation_time_interval);
                    }else{
                        // 시간 표시
                        let minutes = parseInt(reset_activation_timer/60);
                        let seconds = reset_activation_timer - minutes*60;
                        if(seconds<10){
                            seconds = '0'+seconds;
                        }
                        $(`#activation_timer_${method}`).text(minutes+':'+seconds);
                    }
                }, 1000);
            }
        },
        //보내기후 팝업창 닫기
        complete:function(){

        },
        //통신 실패시 처리
        error:function(){
            show_error_message("에러: 서버 통신 실패");
        }
    });
}

function reset_check_activation_code(method){
    let $id_activation_code = $(`#id_activation_code_${method}`);
    $.ajax({
        url:'/login/reset_activate_confirm/',
        type:'POST',
        data: {'user_activation_code': $id_activation_code.val()},
        dataType : 'html',

        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },

        //통신성공시 처리
        success:function(data){
            let jsondata = JSON.parse(data);
            if(jsondata.messageArray.length > 0){
                $(`#id_activation_confirm_${method}`).text(jsondata.messageArray).css({'display':'block','color':'#fe4e65'});
                $id_activation_code.attr('data-valid', 'false');
            }else{
                clearInterval(reset_activation_time_interval);
                $(`#id_activation_button_${method}`).text('인증').css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
                $(`#id_activation_confirm_${method}`).text('확인').css({'display':'block','color':'green'});
                $(`#id_activation_confirm_button_${method}`).css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
                $id_activation_code.attr('data-valid', 'true');
                $(`#activation_timer_${method}`).text("");
                show_error_message('확인되었습니다.');
            }
        },
        complete:function(){

        },
        error:function(){

        }
    });
}


function check_reset_password2(){
    // form 안에 있는 값 검사
    let id_reset_password_member_form = document.getElementById("id_reset_password_member_form");
    let error_info = '';
    let activation_type = document.getElementById('id_activation_type').value;
    if($(`#id_activation_code_${activation_type}`).attr('data-valid')=='false'){
        error_info = '인증을 해주세요.';
    }
    if($(`#id_${activation_type}`).attr('data-valid')=='false'){
        if(activation_type=='phone'){
            error_info = '휴대폰 번호를 '
        }else if(activation_type=='email'){
            error_info = '이메일을 '
        }
        error_info += '입력해주세요.';
    }
    if(error_info!=''){
        show_error_message(error_info);
    }else{
        id_reset_password_member_form.submit();
    }
}

function back_to_reset_password2(){
    // form 안에 있는 값 검사
    document.getElementById("id_reset_password2_form").submit();
}

function reset_password_member(){
    // form 안에 있는 값 검사
    let inputs = document.getElementById("id_reset_password_member_form").elements;
    let error_info = '';
    for(let i=0; i<inputs.length; i++){
        if (inputs[i].nodeName === "INPUT" && (inputs[i].type === "text" || inputs[i].type === "password")) {
            // Update text input
            if(inputs[i].getAttribute('data-valid') == 'false'){
                error_info = inputs[i].getAttribute('title');
                break;
            }
        }
    }
    if(error_info!=''){
        show_error_message(error_info+'를 확인해주세요.');
    }else{
        reset_password_member_info();
    }
}

function reset_password_member_info(){
    let $id_add_member_form = $('#id_reset_password_member_form');
    $.ajax({
        url:$id_add_member_form.attr('action'),
        type:$id_add_member_form.attr('method'),
        data: $id_add_member_form.serializeArray(),
        dataType : 'html',

        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },

        //통신성공시 처리
        success:function(data){
            let jsondata = JSON.parse(data);
            if(jsondata.messageArray.length > 0){
                let error_message = '';
                for(let i=0; i<jsondata.messageArray.length; i++){
                    error_message += jsondata.messageArray[i] + '<br/>';
                }
                show_error_message(error_message);
            }else{
                show_error_message('비밀번호 변경이 완료되었습니다.');
                location.href = $('#id_next_page').val();
            }
        },
        complete:function(){

        },
        error:function(){

        }
    });
}