
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