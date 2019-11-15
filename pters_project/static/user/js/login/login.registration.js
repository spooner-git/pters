/**
 * Created by Hyunki on 01/08/2019.
 */


$(document).ready(function() {

});

function check_group_select(group_type) {
    $('#id_group_type').val(group_type);
    if (group_type == 'trainer') {
        $('#group_select_trainer_box').attr('class', 'group_select_box_on');
        $('#group_select_trainee_box').attr('class', 'group_select_box_off');
    } else {
        $('#group_select_trainer_box').attr('class', 'group_select_box_off');
        $('#group_select_trainee_box').attr('class', 'group_select_box_on');
    }
}

function select_contract(contract_type) {
    let all_contract = $('#all_contract');
    let contract_selector = $(`#${contract_type}`);
    let contract_select_check = $('.contract_select_check');
    let contract_detail_select_check = $('.contract_detail_select_check');
    let policy = $('#policy');
    let privacy = $('#privacy');
    let compare_contract = policy;

    if (policy.selector == contract_selector.selector) {
        compare_contract = privacy;
    } else {
        compare_contract = policy;
    }

    if (contract_type == 'all_contract') {
        if (all_contract.attr('data-valid') == 'false') {
            contract_select_check.attr('data-valid', 'true');
            contract_select_check.text('v');
        } else {
            contract_select_check.attr('data-valid', 'false');
            contract_select_check.text('');
        }
    } else {
        if (contract_selector.attr('data-valid') == 'false') {
            contract_selector.attr('data-valid', 'true');
            contract_selector.text('v');
            if (compare_contract.attr('data-valid') == 'true') {
                all_contract.attr('data-valid', 'true');
                all_contract.text('v');
            }
        } else {
            contract_selector.attr('data-valid', 'false');
            contract_selector.text('');
            all_contract.attr('data-valid', 'false');
            all_contract.text('');
        }
    }
}

function limit_char_auto_correction(event){
    let pattern = event.attributes['pattern'].value;
    let limit_reg_pattern = pattern.replace('[', '[^').split('{')[0];
    let limit = new RegExp(limit_reg_pattern, "gi");
    let min_length = event.attributes['minlength'].value;
    let title = event.attributes['title'].value;
    event.value = event.value.replace(limit, "");
    if(event.value.length < Number(min_length)) {
        event.attributes['data-error-message'].value = title+' : 입력해주세요.';
        event.attributes['data-valid'].value = 'false';
    }else{
        event.attributes['data-error-message'].value = '';
        event.attributes['data-valid'].value = 'true';
    }
}

function limit_char_check(event){
    let limit_reg_pattern = event.pattern.replace('[', '[^').split('{')[0];
    let limit = new RegExp(limit_reg_pattern, "gi");
    let limit_char_check = false;
    let min_length = event.minLength;
    let event_id = event.id;
    let confirm_id = event_id+'_confirm';
    let default_confirm_id = event_id+'_default_confirm';
    if(event.value.length < Number(min_length)){
        $(`#${confirm_id}`).text('최소 '+min_length+'자 이상 입력');
        $(`#${default_confirm_id}`).css('color', 'black');
        event.attributes['data-valid'].value = 'false';
    }
    else{
        $(`#${confirm_id}`).text('');
        if(limit.test(event.value)){
            $(`#${default_confirm_id}`).css('color', '#fe4e65');
            event.attributes['data-valid'].value = 'false';
        }else{
            $(`#${default_confirm_id}`).css('color', 'green');
            event.attributes['data-valid'].value = 'true';
        }
    }

    return limit_char_check
}

function limit_password_check(event){

    let limit_reg_pattern = event.pattern.replace('[', '[^').split('{')[0];
    let limit = new RegExp(limit_reg_pattern, "gi");
    let limit_char_check = false;
    let min_length = event.minLength;
    let event_id = event.id;
    let confirm_id = event_id+'_confirm';
    let default_confirm_id = event_id+'_default_confirm';
    if(event.value.length < Number(min_length)){
        $(`#${confirm_id}`).text('최소 '+min_length+'자 이상 입력');
        $(`#${default_confirm_id}`).css('color', 'black');
        event.attributes['data-valid'].value = 'false';
    }
    else{
        $(`#${confirm_id}`).text('');
        if(limit.test(event.value)){
            $(`#${default_confirm_id}`).css('color', '#fe4e65');
            event.attributes['data-valid'].value = 'false';
        }else{
            if(isNaN(event.value)){
                $(`#${default_confirm_id}`).css('color', 'green');
                event.attributes['data-valid'].value = 'true';
            }else{
                $(`#${default_confirm_id}`).css('color', '#fe4e65');
                event.attributes['data-valid'].value = 'false';
            }
        }
    }
    $('#id_password_re').attr('data-valid', 'false').val("");
    $('#id_password_re_default_confirm').css('color', 'black');
    return limit_char_check
}

function password_check(event){
    let password_1 = document.getElementById('id_password').value;
    let password_2 = document.getElementById('id_password_re').value;
    if(password_1 == password_2){
        $('#id_password_re_default_confirm').css('color', 'green');
        event.attributes['data-valid'].value = 'true';
    }else{
        $('#id_password_re_default_confirm').css('color', '#fe4e65');
    }

}

// 회원 아이디 중복 검사(with backend)
function check_username(data){
    $.ajax({
        url:'/login/check_member_username/',
        type:'POST',
        data:{"username" : data },
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        },

        //통신성공시 처리
        success:function(data){
            let jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#id_username_confirm').text(jsondata.messageArray).css({'display':'block'});
                $('#id_username').attr('data-valid', 'false');
            }else{
                $('#id_username_confirm').text('');
            }
        },
        //보내기후 팝업창 닫기
        complete:function(){
        },
        //통신 실패시 처리
        error:function(){
            alert("에러: 서버 통신 실패")
        }
    });
}

function check_sms_activation_button(event){
    if(event.value.length>9){
        let id_activation_button = $('#id_activation_button');
        id_activation_button.css({'color':'#fe4e65', 'border':'solid 1px #fe4e65', 'pointer-events':'auto'});
        // id_activation_button.attr('disabled', false);
        event.attributes['data-valid'].value = 'true';
    }
    else{
        let id_activation_button = $('#id_activation_button');
        id_activation_button.css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
        // id_activation_button.attr('disabled', true);
        event.attributes['data-valid'].value = 'false';
    }
}

let activation_timer = 180;
var activation_time_interval;
function activate_sms(){
    // 인증 버튼 활성화
    $('#id_activation_confirm_button').css({'color':'#fe4e65', 'border':'solid 1px #fe4e65', 'pointer-events':'auto'});

    // 인증 관련 메시지 초기화
    $('#id_activation_button').text('재인증').css({'color':'#fe4e65', 'border':'solid 1px #fe4e65'});
    $('#id_activation_confirm').text(" ").css({'display':'none'});
    $('#activation_timer').text('03:00').css({'display':'inline-block'});
    activation_timer = 180;

    // 인증 메시지 발송
    $.ajax({
        url:'/login/activate_sms/',
        type:'POST',
        data:{'token':document.getElementById('g-recaptcha-response').value,
              'phone':document.getElementById('id_phone').value
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
                $('#id_activation_button').text('인증').css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
                $('#id_activation_confirm_button').css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
                $('#activation_timer').text("");
                alert(jsondata.messageArray);
            }else{
                alert('인증번호가 발송되었습니다.');
                activation_time_interval = setInterval(function(){
                    activation_timer--;
                    // 시간 종료시 처리
                    if(activation_timer<0){
                        $('#id_activation_confirm').text('인증 시간이 초과되었습니다.').css({'display':'block'}).css('color', '#fe4e65');
                        $('#id_activation_confirm_button').css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
                        clearInterval(activation_time_interval);
                    }else{
                        // 시간 표시
                        let minutes = parseInt(activation_timer/60);
                        let seconds = activation_timer - minutes*60;
                        if(seconds<10){
                            seconds = '0'+seconds;
                        }
                        $('#activation_timer').text(minutes+':'+seconds);
                    }
                }, 1000);
            }
        },
        //보내기후 팝업창 닫기
        complete:function(){

        },
        //통신 실패시 처리
        error:function(){
            alert("에러: 서버 통신 실패");
        }
    });
}

function check_activation_code(){
    let $id_activation_code = $('#id_activation_code');
    $.ajax({
        url:'/login/activate_sms_confirm/',
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
                $('#id_activation_confirm').text(jsondata.messageArray).css({'display':'block','color':'#fe4e65'});
                $id_activation_code.attr('data-valid', 'false');
            }else{
                clearInterval(activation_time_interval);
                $('#id_activation_button').text('인증').css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
                $('#id_activation_confirm').text('확인').css({'display':'block','color':'green'});
                $('#id_activation_confirm_button').css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2', 'pointer-events':'none'});
                $id_activation_code.attr('data-valid', 'true');
                $('#activation_timer').text("");
                alert('확인되었습니다.');
            }
        },
        complete:function(){

        },
        error:function(){

        }
    });
}

function registration_member_info(forms){
    // form 안에 있는 값 검사
    let inputs = forms.elements;
    let error_info = '';

    if(document.getElementById('all_contract').getAttribute('data-valid') == 'false'){
        error_info = '약관 동의';
    }
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
        alert(error_info+'를 확인해주세요.');
    }else{
        add_member_info();
    }
}

function add_member_info(){
    let $id_add_member_form = $('#id_add_member_form');
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
                alert(error_message);
            }else{
                alert('가입이 완료되었습니다.');
                location.href = $('#id_next_page').val();
            }
        },
        complete:function(){

        },
        error:function(){

        }
    });
}