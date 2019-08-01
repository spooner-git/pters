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

    if (contract_type == 'all') {
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
    let limit = new RegExp(event.target.pattern, "gi");
    event.target.value = event.target.value.replace(limit, "");
}

function limit_char_check(event){
    let limit = new RegExp(event.target.pattern, "gi");
    let limit_char_check = false;
    let min_length = event.target.minLength;
    let event_id = event.target.id;
    let confirm_id = event_id+'_confirm';
    let default_confirm_id = event_id+'_default_confirm';
    if(event.target.value.length < Number(min_length)){
        $(`#${confirm_id}`).text('최소 '+min_length+'자 이상 입력');
        $(`#${default_confirm_id}`).css('color', 'black');
    }
    else{
        $(`#${confirm_id}`).text('');
        if(limit.test(event.target.value)){
            $(`#${default_confirm_id}`).css('color', '#fe4e65');
        }else{
            $(`#${default_confirm_id}`).css('color', 'green');
        }
    }

    return limit_char_check
}

function limit_password_check(event){

    let limit = new RegExp(event.target.pattern, "gi");
    let limit_char_check = false;
    let min_length = event.target.minLength;
    let event_id = event.target.id;
    let confirm_id = event_id+'_confirm';
    let default_confirm_id = event_id+'_default_confirm';
    if(event.target.value.length < Number(min_length)){
        $(`#${confirm_id}`).text('최소 '+min_length+'자 이상 입력');
        $(`#${default_confirm_id}`).css('color', 'black');
    }
    else{
        $(`#${confirm_id}`).text('');
        if(limit.test(event.target.value)){
            $(`#${default_confirm_id}`).css('color', '#fe4e65');
        }else{
            if(isNaN(event.target.value)){
                $(`#${default_confirm_id}`).css('color', 'green');
            }else{
                $(`#${default_confirm_id}`).css('color', '#fe4e65');
            }
        }
    }

    document.getElementById('id_password_re').value = '';
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