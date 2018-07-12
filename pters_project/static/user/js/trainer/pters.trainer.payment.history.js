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
        $('#page_'+thisID).siblings('div.sub_pages').css('display','none')
    })
    //////////////////////////////메뉴들 탭 이동//////////////////////////////////////////////


    ////////결제방법 변경 버튼
    $(document).on('click','.pay_method_changeButton',function(){
        var payid = $(this).attr('data-payid');
        alert(payid)
        //To- Do
    })
});