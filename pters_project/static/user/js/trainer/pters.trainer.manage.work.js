
$('#selectBox .btn').click(function(){
    $(this).addClass('active');
    $(this).siblings('.btn').removeClass('active')
    $('#'+$(this).attr('id').replace(/_selector/gi,'_page')).show();
    $('#'+$(this).attr('id').replace(/_selector/gi,'_page')).siblings('.pages').hide();

    if($(this).attr('id').split('_')[0] == 'member'){
        ajax_call_member_analytics_data(class_id,month_date[0],month_date[month_date.length-1])
        ajax_call_member_monthly_data(class_id, month_date[0], month_date[month_date.length-1])
        ajax_call_complete_monthly_data(class_id, month_date[0], month_date[month_date.length-1])
    }
})

$('.view_duration_setter').click(function(){
    $(this).parent('div').siblings('.duration_setter_wrapper').show();
    $(this).siblings('.month_sel_selected').removeClass('month_sel_selected')
    fill_duration_setter_dropdown();
})

$('.month_sel_btn').click(function(){
    $('.duration_setter_wrapper').hide();
    $(this).addClass('month_sel_selected');
    $(this).siblings('.month_sel_btn').removeClass('month_sel_selected');
    var thisVal = Number($(this).attr('data-month'));
    var start_date = date_format_yyyy_m_d_to_yyyy_mm_dd(substract_month(currentYear+'-'+(currentMonth+1)+'-'+1, -thisVal),'-');
    var end_date = date_format_yyyy_m_d_to_yyyy_mm_dd(currentYear+'-'+(currentMonth+1)+'-'+1, '-');
    if($('#profit_analytics_page').css('display') == "block"){
        $('#call_sales_data_btn').attr({'data-startdate':start_date, 'data-enddate':end_date});
    }else{
        $('#call_member_data_btn').attr({'data-startdate':start_date, 'data-enddate':end_date});
    }
    
});

$('#call_sales_data_btn').click(function(){
    if(Options.auth_limit == 0){
        show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    통계조회를 <span style="font-weight:500;">이번달만 가능</span>합니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">조회기간 제한 없이 이용</span>해보세요!
                                </div>`);
    }else{
        if($('#profit_analytics_page .duration_setter_wrapper').css('display') == 'none'){
            if($(this).attr('data-startdate') != undefined && $(this).attr('data-enddate') != undefined){
                var start_date = $(this).attr('data-startdate');
                var end_date = $(this).attr('data-enddate');
                //if(diff_month(start_date, end_date) > 0){
                    ajax_call_sales_data(class_id, start_date, end_date);
                //}else{
                    //ajax_call_sales_data_onemonth(class_id, start_date)
                //}
            }else{
                alert('기간을 입력 해주세요.')
            }
        }else if($('#profit_analytics_page .duration_setter_wrapper').css('display') == 'block'){
            var start_date = $('#startYear').siblings('button').attr('data-value') + '-' + $('#startMonth').siblings('button').attr('data-value')+'-01';
            var end_date = $('#endYear').siblings('button').attr('data-value') + '-' + $('#endMonth').siblings('button').attr('data-value')+'-01';
            check_dropdown_date_validity(start_date, end_date, function(){
                //if(diff_month(start_date, end_date) > 0 ){
                    ajax_call_sales_data(class_id, start_date, end_date);
                //}else{
                    //ajax_call_sales_data_onemonth(class_id, start_date)
                //}
            });
        }
    };
});


$('#call_member_data_btn').click(function(){
    if(Options.auth_limit == 0){
        show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    통계조회를 <span style="font-weight:500;">이번달만 가능</span>합니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">조회기간 제한 없이 이용</span>해보세요!
                                </div>`)
    }else{
        if($('#member_analytics_page .duration_setter_wrapper').css('display') == 'none'){
            if($(this).attr('data-startdate') != undefined && $(this).attr('data-enddate') != undefined ){
                var start_date = $(this).attr('data-startdate');
                var end_date = $(this).attr('data-enddate');
                ajax_call_member_analytics_data(class_id, start_date, end_date);
                ajax_call_member_monthly_data(class_id, start_date, end_date);
                ajax_call_complete_monthly_data(class_id, start_date, end_date);
            }else{
                alert('기간을 입력 해주세요.');
            }
        }else if($('#member_analytics_page .duration_setter_wrapper').css('display') == 'block'){
            var start_date = $('#startYear_member').siblings('button').attr('data-value') + '-' + $('#startMonth_member').siblings('button').attr('data-value')+'-01';
            var end_date = $('#endYear_member').siblings('button').attr('data-value') + '-' + $('#endMonth_member').siblings('button').attr('data-value')+'-01';
            check_dropdown_date_validity(start_date, end_date, function(){
                ajax_call_member_analytics_data(class_id,start_date, end_date);
                ajax_call_member_monthly_data(class_id, start_date, end_date);
                ajax_call_complete_monthly_data(class_id, start_date, end_date);
            });
        };
    }
});



$(document).on('click','.pters_dropdown_custom_list li',function(){
    var selectedValue = $(this).attr('data-value');
    var selectedText  = $(this).text();
    $(this).parent('ul').siblings('button').text(selectedText).attr('data-value', selectedValue);
});


$(document).on('click','.sales_detail_view_btn',function(){
    if($(this).attr('data-power') == "off"){
        $(this).attr('data-power','on')
        ajax_call_sales_detail_data(class_id, $(this).attr('data-date'));
        $(this).find('img').css('transform','rotate(180deg)');
    }else if($(this).attr('data-power') == "on"){
        $(this).attr('data-power','off')
        $('div.table_row_monthly[data-date="'+$(this).attr('data-date')+'"]').html('')
        $(this).find('img').css('transform','rotate(0deg)');
    }
})




function fill_duration_setter_dropdown(){
    var targetYear = $('.year_dropdown');
    var targetMonth = $('.month_dropdown');

    var year = [];
    for(var i=2018; i<=currentYear; i++){
        year.push('<li data-value="'+i+'"><a>'+i+'년</a></li>')
    };

    var month = [];
    for(var j=1; j<=12; j++){
        var mdata = j;
        if(j<10){
            var mdata = '0'+j
        }
        month.push('<li data-value="'+mdata+'"><a>'+j+'월</a></li>')
    }

    targetYear.html(year.join(''));
    targetMonth.html(month.join(''));
};

function check_dropdown_date_validity(date1, date2, success_Callback){
    if($('#profit_analytics_page').css('display') == "block"){
        var startYear = $('#startYear').siblings('button').attr('data-value');
        var startMonth = $('#startMonth').siblings('button').attr('data-value');
        var endYear = $('#endYear').siblings('button').attr('data-value');
        var endMonth = $('#endMonth').siblings('button').attr('data-value');
    }else if($('#member_analytics_page').css('display') == "block"){
        var startYear = $('#startYear_member').siblings('button').attr('data-value');
        var startMonth = $('#startMonth_member').siblings('button').attr('data-value');
        var endYear = $('#endYear_member').siblings('button').attr('data-value');
        var endMonth = $('#endMonth_member').siblings('button').attr('data-value');
    }
    
    if(startYear  && startMonth && endYear && endMonth){
        if(compare_date(date1, date2) == false){
            var zz=0;
            while(date_format_yyyy_m_d_to_yyyy_mm_dd(add_month(date1, zz),'-') != date2){
                zz++;
                if(zz > 13){
                    break;
                }
            }
            if(zz <= 12){
                //검색
                success_Callback();
            }else{
                alert('최대 12개월 단위로 조회가 가능합니다.\n날짜를 다시 입력 해주세요.');
            }
        }else if(compare_date(endYear+'-'+endMonth, startYear+'-'+startMonth) == false){
            alert('시작일자가 종료일보다 최근입니다.\n날짜를 다시 입력 해주세요.');
        }
    }else{
        alert('기간을 입력 해주세요.');
    }
}
