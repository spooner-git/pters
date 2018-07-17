$(document).ready(function(){
    //////////////////////////////메뉴들 탭 이동//////////////////////////////////////////////
    $('.main_menu_table_cell').click(function(){
        var thisID = $(this).attr('id');
        $(this).addClass('main_cell_active');
        $(this).siblings('.main_menu_table_cell').removeClass('main_cell_active')
        $('#page_'+thisID).css('display','block');
        $('#page_'+thisID).siblings('div.page_content_wrap').css('display','none')
    })

    $('.page_menu_table_cell').click(function(){
        var thisID = $(this).attr('id');
        $(this).addClass('cell_active');
        $(this).siblings('div.page_menu_table_cell').removeClass('cell_active');
        $('#page_'+thisID).css('display','block');
        $('#page_'+thisID).siblings('div.sub_pages').css('display','none');
    });
    //////////////////////////////메뉴들 탭 이동//////////////////////////////////////////////


    ////////결제방법 변경 버튼
    $(document).on('click','.pay_method_changeButton',function(){
        var payid = $(this).attr('data-payid');
        // alert(payid);
        //To- Do
    })
    // 해지신청
    $(document).on('click','.pay_cancel_Button',function(){
        var payid = $(this).attr('data-customer_uid');
        // alert(payid);
        $('#submit_pay_cancel').attr('data-customer_uid', payid);
        $('#id_customer_uid_cancel').val(payid);
        $('#pay_cancel_confirm_popup').show();
        //To- Do
    });
    // 해지신청 취소
    $(document).on('click','.pay_restart_Button',function(){
        var payid = $(this).attr('data-customer_uid');
        alert(payid);
        // $('#submit_pay_restart').attr('data-customer_uid', payid);
        $('#id_customer_uid_restart').val(payid);
        document.getElementById('restart-period-payment-form').submit();
        //To- Do
    });
        $('#popup_cancel_btn_yes').click(function(e){
            e.stopPropagation();
            $('#pay_cancel_survey').show();
            $('#pay_cancel_confirm_popup').hide();
        });
        $('#popup_cancel_btn_no').click(function(e){
            e.stopPropagation();
            $('#pay_cancel_confirm_popup').hide();
        });

    $('.ptersCheckbox').click(function(){
        $('#submit_pay_cancel').addClass('active');
        $('div.checked').removeClass('checked ptersCheckboxInner');
        var pterscheckbox = $(this).find('div');
        $(this).addClass('checked');
        pterscheckbox.addClass('checked');
        pterscheckbox.addClass('ptersCheckboxInner');
        $('#id_cancel_type').val($(this).siblings("span").text());
    });

    $('#submit_pay_cancel').click(function(){
        if($(this).hasClass('active')){
            var payid = $(this).attr('data-customer_uid');
            var cancel_survey_text_area = $('#cancel_survey_text_area');
            $('#id_cancel_reason').val(cancel_survey_text_area.val());

            // document.getElementById('cancel-period-payment-form').submit();
            // /payment/cancel_period_billing_logic/
        }
    });

});