/**
 * Created by Hyunki on 01/08/2019.
 */

let did_scroll; // 스크롤시에 사용자가 스크롤했다는 것을 알림
let delta = 4; // 스크롤시 감도 (낮으면 자주 발생)
let last_scroll_top = 0; // 마지막 스크롤된 위치 저장

$(document).ready(function() {

    // 스크롤 이벤트 처리
    $('#root_content').scroll(function () {
        // 중복되지 않도록 semaphore
        did_scroll = true;
        if (did_scroll) {
            checkScrolled();
        }
        did_scroll = false;
    });
    $('#id_username').focusout(function(){
        check_username($(this).val());
    });

});

// 스크롤 방향을 검사해서 회원가입 명칭 띄워주기
function checkScrolled() {
    let current_scroll_top = $('#root_content').scrollTop();
    // 스크롤 변화량이 delta 값이 넘지 않으면 return
    if (Math.abs(last_scroll_top - current_scroll_top) < delta) {
        return;
    }

    if (current_scroll_top > last_scroll_top) {
        // 스크롤 다운(아래로)
        if (current_scroll_top > 10) {
            $('.registration_title').css('display', 'table-cell');
            $('.registration_content_title').css('display', 'none');
        }
    } else {
        // 스크롤 다운(위로)
        if (current_scroll_top < 24) {
            $('.registration_title').css('display', 'none');
            $('.registration_content_title').css('display', 'block');
        }
    }
    last_scroll_top = current_scroll_top;
}

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
        if (all_contract.attr('data-check') == 'false') {
            contract_select_check.attr('data-check', 'true');
            contract_select_check.text('v');
        } else {
            contract_select_check.attr('data-check', 'false');
            contract_select_check.text('');
        }
    } else {
        if (contract_selector.attr('data-check') == 'false') {
            contract_selector.attr('data-check', 'true');
            contract_selector.text('v');
            if (compare_contract.attr('data-check') == 'true') {
                all_contract.attr('data-check', 'true');
                all_contract.text('v');
            }
        } else {
            contract_selector.attr('data-check', 'false');
            contract_selector.text('');
            all_contract.attr('data-check', 'false');
            all_contract.text('');
        }
    }
}

function limit_char_auto_correction(event){
    let limit_reg_pattern = event.target.pattern.replace('[', '[^').split('{')[0];
    let limit = new RegExp(limit_reg_pattern, "gi");
    event.target.value = event.target.value.replace(limit, "");
}

function limit_char_check(event){
    let limit_reg_pattern = event.target.pattern.replace('[', '[^').split('{')[0];
    let limit = new RegExp(limit_reg_pattern, "gi");
    console.log(limit);
    let limit_char_check = false;
    let min_length = event.target.minLength;
    let event_id = event.target.id;
    let confirm_id = event_id+'_confirm';
    let default_confirm_id = event_id+'_default_confirm';
    if(event.target.value.length < Number(min_length)){
        $(`#${confirm_id}`).text('최소 '+min_length+'자 이상 입력');
        $(`#${default_confirm_id}`).css('color', 'black');
        event.target.attributes['data-valid'].value = 'false';
    }
    else{
        $(`#${confirm_id}`).text('');
        if(limit.test(event.target.value)){
            console.log('no');
            $(`#${default_confirm_id}`).css('color', '#fe4e65');
            event.target.attributes['data-valid'].value = 'false';
        }else{
            console.log('ok');
            $(`#${default_confirm_id}`).css('color', 'green');
            event.target.attributes['data-valid'].value = 'true';
        }
    }

    return limit_char_check
}

function limit_password_check(event){

    let limit_reg_pattern = event.target.pattern.replace('[', '[^').split('{')[0];
    let limit = new RegExp(limit_reg_pattern, "gi");
    let limit_char_check = false;
    let min_length = event.target.minLength;
    let event_id = event.target.id;
    let confirm_id = event_id+'_confirm';
    let default_confirm_id = event_id+'_default_confirm';
    if(event.target.value.length < Number(min_length)){
        $(`#${confirm_id}`).text('최소 '+min_length+'자 이상 입력');
        $(`#${default_confirm_id}`).css('color', 'black');
        event.target.attributes['data-valid'].value = 'false';
    }
    else{
        $(`#${confirm_id}`).text('');
        if(limit.test(event.target.value)){
            $(`#${default_confirm_id}`).css('color', '#fe4e65');
            event.target.attributes['data-valid'].value = 'false';
        }else{
            if(isNaN(event.target.value)){
                $(`#${default_confirm_id}`).css('color', 'green');
                event.target.attributes['data-valid'].value = 'true';
            }else{
                $(`#${default_confirm_id}`).css('color', '#fe4e65');
                event.target.attributes['data-valid'].value = 'false';
            }
        }
    }
    document.getElementById('id_password_re').value = '';
    $('#id_password_re_default_confirm').css('color', 'black');
    return limit_char_check
}

function password_check(){
    let password_1 = document.getElementById('id_password').value;
    let password_2 = document.getElementById('id_password_re').value;
    if(password_1 == password_2){
        $('#id_password_re_default_confirm').css('color', 'green');
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

function check_sms_auth_button(event){
    if(event.target.value.length>10){
        let id_auth_button = $('#id_auth_button');
        id_auth_button.css({'color':'#fe4e65', 'border':'solid 1px #fe4e65'});
        id_auth_button.attr({'disabled': false, 'data-valid':'true'});
    }
    else{
        let id_auth_button = $('#id_auth_button');
        id_auth_button.css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2'});
        id_auth_button.attr({'disabled': true, 'data-valid':'false'});
    }
}

let activation_timer = 180;
var auth_time_interval;
function activate_sms(){
    // 인증 버튼 활성화
    $('#id_activation_button').attr('disabled', false).css({'color':'#fe4e65', 'border':'solid 1px #fe4e65'});

    // 인증 관련 메시지 초기화
    $('#id_auth_button').text('재인증').css({'color':'#fe4e65', 'border':'solid 1px #fe4e65'});
    $('#id_activation_confirm').text(" ").css({'display':'none'});
    $('#auth_timer').text('03:00').css({'display':'inline-block'});
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
                alert(jsondata.messageArray);
            }else{
                alert('인증번호가 발송되었습니다.');
                auth_time_interval = setInterval(function(){
                    activation_timer--;
                    // 시간 종료시 처리
                    if(activation_timer<0){
                        $('#id_activation_confirm').text('인증 시간이 초과되었습니다.').css({'display':'block'}).css('color', '#fe4e65');
                        $('#id_activation_button').attr('disabled', true).css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2'});
                        clearInterval(auth_time_interval);
                    }else{
                        // 시간 표시
                        let minutes = parseInt(activation_timer/60);
                        let seconds = activation_timer - minutes*60;
                        if(seconds<10){
                            seconds = '0'+seconds;
                        }
                        $('#auth_timer').text(minutes+':'+seconds);
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
                clearInterval(auth_time_interval);
                alert('인증이 완료되었습니다.');
                $('#id_auth_button').text('인증').attr('disabled', true).css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2'});
                $('#id_activation_confirm').text('인증 완료').css({'display':'block','color':'green'});
                $('#id_activation_button').attr('disabled', true).css({'color':'#b8b4b4', 'border':'solid 1px #d6d2d2'});
                $id_activation_code.attr('data-valid', 'true');
                $('#auth_timer').text("");
            }
        },
        complete:function(){

        },
        error:function(){

        }
    });
}