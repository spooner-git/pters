
$('#selectBox .btn').click(function(){
    $(this).addClass('active');
    $(this).siblings('.btn').removeClass('active')
    $('#'+$(this).attr('id').replace(/_selector/gi,'_page')).show();
    $('#'+$(this).attr('id').replace(/_selector/gi,'_page')).siblings('.pages').hide();

    if($(this).attr('id').split('_')[0] == 'member'){
        drawChart_Pie(graph_inline_Width_To_Be, graph_inline_Height_To_Be,'bottom' , document.getElementById('chart_div2'));
        drawChart_Pie(graph_inline_Width_To_Be, graph_inline_Height_To_Be,'bottom', document.getElementById('chart_div3'));
        drawChart(graph_Width_To_Be, graph_Height_To_Be, document.getElementById('chart_div4'));
    }
})

$('.view_duration_setter').click(function(){
    $(this).parent('div').siblings('.duration_setter_wrapper').show();
})

$('.month_sel_btn').click(function(){
    $(this).addClass('month_sel_selected')
    $(this).siblings('.month_sel_btn').removeClass('month_sel_selected')
    var thisVal = Number($(this).attr('data-month'));
    var start_date = date_format_yyyy_m_d_to_yyyy_mm_dd(substract_month(currentYear+'-'+(currentMonth+1)+'-'+1, -thisVal),'-')
    var end_date = date_format_yyyy_m_d_to_yyyy_mm_dd(currentYear+'-'+(currentMonth+1)+'-'+1, '-')
    console.log(start_date, end_date)

    $('#call_sales_data_btn').attr({'data-startdate':start_date, 'data-enddate':end_date});
})

$('#call_sales_data_btn').click(function(){
    var start_date = $(this).attr('data-startdate');
    var end_date = $(this).attr('data-enddate');
    console.log(class_id, start_date, end_date)
    ajax_call_sales_data(class_id, start_date, end_date);
})