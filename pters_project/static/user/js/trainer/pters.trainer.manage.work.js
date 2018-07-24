
$('#selectBox .btn').click(function(){
    $(this).addClass('active');
    $(this).siblings('.btn').removeClass('active')
    $('#'+$(this).attr('id').replace(/_selector/gi,'_page')).show();
    $('#'+$(this).attr('id').replace(/_selector/gi,'_page')).siblings('.pages').hide();

    if($(this).attr('id').split('_')[0] == 'member'){
        drawChart_Pie(graph_inline_Width_To_Be, graph_inline_Height_To_Be,'bottom' , document.getElementById('chart_div2'));
        drawChart_Pie(graph_inline_Width_To_Be, graph_inline_Height_To_Be,'bottom', document.getElementById('chart_div3'));
        drawChart(graph_Width_To_Be, graph_Height_To_Be, document.getElementById('chart_div4'), datas_convert_to_addRows(month_date, price, refund_price));
    }
})

$('.view_duration_setter').click(function(){
    $(this).parent('div').siblings('.duration_setter_wrapper').show();
    fill_duration_setter_dropdown();
})

$('.month_sel_btn').click(function(){
    $('.duration_setter_wrapper').hide();
    $(this).addClass('month_sel_selected');
    $(this).siblings('.month_sel_btn').removeClass('month_sel_selected');
    var thisVal = Number($(this).attr('data-month'));
    var start_date = date_format_yyyy_m_d_to_yyyy_mm_dd(substract_month(currentYear+'-'+(currentMonth+1)+'-'+1, -thisVal),'-');
    var end_date = date_format_yyyy_m_d_to_yyyy_mm_dd(currentYear+'-'+(currentMonth+1)+'-'+1, '-');

    $('#call_sales_data_btn').attr({'data-startdate':start_date, 'data-enddate':end_date});
});

$('#call_sales_data_btn').click(function(){
    if($('.duration_setter_wrapper').css('display') == 'none'){
        var start_date = $(this).attr('data-startdate');
        var end_date = $(this).attr('data-enddate');
        ajax_call_sales_data(class_id, start_date, end_date);

    }else if($('.duration_setter_wrapper').css('display') == 'block'){
        var start_date = $('#startYear').siblings('button').attr('data-value') + '-' + $('#startMonth').siblings('button').attr('data-value')+'-01';
        var end_date = $('#endYear').siblings('button').attr('data-value') + '-' + $('#endMonth').siblings('button').attr('data-value')+'-01';
        check_dropdown_date_validity(start_date, end_date, function(){
            ajax_call_sales_data(class_id, start_date, end_date);
        });
    };
});

$(document).on('click','.pters_dropdown_custom_list li',function(){
    var selectedValue = $(this).attr('data-value');
    var selectedText  = $(this).text();
    $(this).parent('ul').siblings('button').text(selectedText).attr('data-value', selectedValue);
});



function fill_duration_setter_dropdown(){
    var targetYear = $('.year_dropdown');
    var targetMonth = $('.month_dropdown');

    var year = [];
    for(var i=2018; i<=currentYear; i++){
        year.push('<li data-value="'+i+'">'+i+'년</li>')
    };

    var month = [];
    for(var j=1; j<=12; j++){
        var mdata = j;
        if(j<10){
            var mdata = '0'+j
        }
        month.push('<li data-value="'+mdata+'">'+j+'월</li>')
    }

    targetYear.html(year.join(''));
    targetMonth.html(month.join(''));
};

function check_dropdown_date_validity(date1, date2, success_Callback){
    var startYear = $('#startYear').siblings('button').attr('data-value');
    var startMonth = $('#startMonth').siblings('button').attr('data-value');
    var endYear = $('#endYear').siblings('button').attr('data-value');
    var endMonth = $('#endMonth').siblings('button').attr('data-value');

    if(startYear && startMonth && endYear && endMonth){
        if(compare_date(date2, date1) == true ){
            var zz=0;
            while(date_format_yyyy_m_d_to_yyyy_mm_dd(add_month(date1, zz),'-') != date2){
                zz++
                if(zz > 13){
                    break;
                }
            }
            if(zz <= 12){
                //검색
                success_Callback();
            }else{
                alert('최대 12개월 단위로 조회가 가능합니다.\n날짜를 다시 입력해주세요.')
            }
        }else if(compare_date(endYear+'-'+endMonth, startYear+'-'+startMonth) == false){
            alert('시작일자가 종료일보다 최근입니다.\n날짜를 다시 입력해주세요.')
        }
    }
};
