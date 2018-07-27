$(document).ready(function(){

    //바로 실행
    get_current_member_list();
    get_current_group_list();
    //


    //유저가 터치인지 마우스 사용인지 알아낸다
    var touch_or_mouse = "";
    window.addEventListener('touchstart',function(){
        touch_or_mouse = "touch";
    });
    //유저가 터치인지 마우스 사용인지 알아낸다

    //초기에 미니 timegraph를 채워주기 위한 DBdataprocess
    //DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateData,"graph",classTimeData)
    //DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offDateData,"graph",offTimeData)
    //초기에 미니 timegraph를 채워주기 위한 DBdataprocess


    //var select_all_check = false;
    var offset_for_canvas;

    var date = new Date();
    var currentYear = date.getFullYear(); //현재 년도
    var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
    var currentDate = date.getDate(); //오늘 날짜
    var currentDay = date.getDay(); // 0,1,2,3,4,5,6,7
    var currentHour = date.getHours();
    var currentMinute = date.getMinutes();

    $("#datepicker, #datepicker_repeat_start, #datepicker_repeat_end").datepicker({
        //minDate : 0,
        onSelect : function(curDate, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
            if( curDate != instance.lastVal ){
                $(this).parent('p').addClass("dropdown_selected");
                var selector_timeGraph = $('#timeGraph');
                var selector_datepicker = $("#datepicker");
                var selector_datepicker_repeat_start = $("#datepicker_repeat_start");
                var selector_datepicker_repeat_end = $("#datepicker_repeat_end");
                if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
                    //$("#id_training_date").val($("#datepicker").val()).submit();
                    $("#id_training_date, #id_training_end_date").val(selector_datepicker.val());
                    if(selector_timeGraph.css('display')=='none'){
                        //$('#timeGraph').show(110,"swing");
                        selector_timeGraph.css('display','block');
                    }
                    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
                    clear_start_dur_dropdown();
                    $('#durations_mini, #durations_mini').html('');
                    $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft');
                    ajaxTimeGraphSet(selector_datepicker.val());
                    /*
                     timeGraphSet("class","pink","AddClass", initialJSON);  //시간 테이블 채우기
                     timeGraphSet("group","pink","AddClass", initialJSON);
                     timeGraphSet("off","grey","AddClass", initialJSON)
                     */
                    //startTimeSet('class');
                }
                else if(addTypeSelect =="offadd"){
                    //$("#id_training_date_off").val($("#datepicker").val()).submit();
                    $("#id_training_date_off, #id_training_end_date_off").val(selector_datepicker.val());
                    if(selector_timeGraph.css('display')=='none'){
                        //$('#timeGraph').show(110,"swing");
                        selector_timeGraph.css('display','block');
                    }
                    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
                    clear_start_dur_dropdown();
                    /*ajaxTimeGraphSet($('#datepicker').val(), function(){
                     startTimeSet('class');
                     })*/
                    $('#durations_mini, #durations_mini').html('');
                    $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft');
                    ajaxTimeGraphSet(selector_datepicker.val());
                    /*
                     timeGraphSet("class","pink","AddClass", initialJSON);  //시간 테이블 채우기
                     timeGraphSet("group","pink","AddClass", initialJSON);
                     timeGraphSet("off","grey","AddClass", initialJSON)
                     */
                    //startTimeSet('class');
                }
                else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
                    selector_datepicker_repeat_end.datepicker('option','minDate',selector_datepicker_repeat_start.val());
                    selector_datepicker_repeat_start.datepicker('option','maxDate',selector_datepicker_repeat_end.val());
                    $("#id_repeat_start_date").val(selector_datepicker_repeat_start.val());
                    $("#id_repeat_end_date").val(selector_datepicker_repeat_end.val());
                }
                else if(addTypeSelect == "repeatoffadd"){
                    selector_datepicker_repeat_end.datepicker('option','minDate',selector_datepicker_repeat_start.val());
                    selector_datepicker_repeat_start.datepicker('option','maxDate',selector_datepicker_repeat_end.val());
                    $("#id_repeat_start_date_off").val(selector_datepicker_repeat_start.val());
                    $("#id_repeat_end_date_off").val(selector_datepicker_repeat_end.val());
                }
                check_dropdown_selected_addplan();
            }
        }
    });


    /*
     //직접 진행시간 선택해서 추가
     $(document).on('click','.td00, .td30', function(){ //주간달력 미니 팝업
     closeAlarm('pc')
     if($('._MINI_ptadd').css('display')=='inline'){
     addTypeSelect = 'ptadd'
     var compensate_off = 0
     }else if($('._MINI_ptadd').css('display')=="none"){
     addTypeSelect = 'offadd'
     var compensate_off = +30
     }
     var toploc = $(this).offset().top;
     var leftloc = $(this).offset().left;
     var tdwidth = $(this).width();
     var tdheight = $(this).height();
     var minipopupwidth = 300;
     var minipopupheight = 250;
     var splitID = $(this).attr('id').split('_')
     var weekID = $(this).attr('data-week')


     //minipopup 위치 보정
     if(splitID[3]>=(Options.workEndTime-5)){
     //$('.dropdown_mini').addClass('dropup')
     if(splitID[3]== (Options.workEndTime-1)){
     if(Options.workEndTime - Options.workStartTime < 5){
     var toploc = toploc
     }else{
     var toploc = toploc - minipopupheight + compensate_off
     }
     }else if(splitID[3] <= (Options.workStartTime+3)){
     var toploc = toploc
     }else{
     var toploc = toploc - minipopupheight + compensate_off
     }
     }else{
     $('.dropdown_mini').removeClass('dropup')
     if(weekID==3){
     var toploc = toploc + tdheight
     }else{
     var toploc = toploc + 30
     }
     }

     if(weekID>=4){
     var leftloc = leftloc-300-tdwidth
     }else if(weekID==3){
     var leftloc = leftloc
     }
     //minipopup 위치 보정
     var thisIDSplitArray = $(this).attr('id').split('_')
     if(thisIDSplitArray[4]=="30"){
     var next30ID = '#'+thisIDSplitArray[0]+'_'+thisIDSplitArray[1]+'_'+thisIDSplitArray[2]+'_'+(Number(thisIDSplitArray[3])+1)+'_00'
     }else if(thisIDSplitArray[4]=="00"){
     var next30ID = '#'+thisIDSplitArray[0]+'_'+thisIDSplitArray[1]+'_'+thisIDSplitArray[2]+'_'+thisIDSplitArray[3]+'_30'
     }
     var thisTime = thisIDSplitArray[3] +'_'+ thisIDSplitArray[4]
     //2018_5_13_23_30
     if(Options.classDur == 60){
     if(!$(this).find('div').hasClass('classTime')
     && !$(this).find('div').hasClass('groupTime')
     && !$(this).find('div').hasClass('offTime')
     && $('#page-addplan-pc').css('display','none')
     && !$(next30ID).find('div').hasClass('classTime')
     && !$(next30ID).find('div').hasClass('groupTime')
     && !$(next30ID).find('div').hasClass('offTime')
     && !$(this).hasClass('_on')
     && thisTime!=(Options.workEndTime-1)+'_30'){
     //$('.td00').css('background','transparent')
     closeMiniPopupByChange()
     if(Options.classDur == 30){
     $(this).find('div').addClass('blankSelected30')
     $('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
     }else if(Options.classDur == 60){
     if($(this).attr('id').split('_')[4]=='30'){
     //if(!$('#'+$(this).attr('id').split('_')[0]+'_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2]+'_'+$(this).attr('id').split('_')[3]+'_00').hasClass('_on')){
     //$('#'+$(this).attr('id').split('_')[0]+'_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2]+'_'+$(this).attr('id').split('_')[3]+'_00').find('div').addClass('blankSelected')
     $(this).find('div').addClass('blankSelected')
     $('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
     //}

     }else{
     $(this).find('div').addClass('blankSelected')
     $('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
     //$(this).find('div').addClass('blankSelected30')
     }

     }
     //$('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
     $('.typeSelected').removeClass('typeSelected')
     $('#typeSelector_'+addTypeSelect).addClass('typeSelected')
     if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
     $('._MINI_ptadd').css('display','inline')
     //$('._MINI_offadd').hide()
     }else if(addTypeSelect == "offadd"){
     //$('._MINI_offadd').show()
     $('._MINI_ptadd').css('display','none')
     }
     if(Options.hourunit == 30){
     var tdinfo = $(this).attr('id').split('_');
     var yy = tdinfo[0];
     var mm = tdinfo[1];
     var dd = tdinfo[2];
     var hh = tdinfo[3];
     var min = tdinfo[4];
     //var min = '00'
     //var hh1 = Number(tdinfo[3])+1;
     //var min1 = '00'

     if(min == '00'){
     var hh1 = Number(tdinfo[3])+1;
     var min1 = '00'
     }else if(min == "30"){
     var hh1 = Number(tdinfo[3])+1;
     var min1 = '30'
     }

     var yy0 = tdinfo[0];
     var mm0 = tdinfo[1];
     var dd0 = tdinfo[2];
     if(yy0.length<2){var yy0 = '0'+String(tdinfo[0])};
     if(mm0.length<2){var mm0 = '0'+String(tdinfo[1])};
     if(dd0.length<2){var dd0 = '0'+String(tdinfo[2])};
     if(Options.language == "KOR"){
     var text = yy+'년 '+mm+'월 '+dd+'일 '+hh+':'+min+' ~ '+hh1+':'+ min1
     }else if(Options.language == "JPN"){
     var text = yy+'年 '+mm+'月 '+dd+'日 '+hh+':'+min+' ~ '+hh1+':'+ min1
     }else if(Options.language == "ENG"){
     var text = yy+'. '+mm+'. '+dd+'. '+hh+':'+min+' ~ '+hh1+':'+ min1
     }
     $('#datetext_mini').text(text).val(yy0+'-'+mm0+'-'+dd0)
     $('#durations_mini, #durations_mini').html('')
     $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
     timeGraphSet("class","pink","mini", initialJSON);  //시간 테이블 채우기
     timeGraphSet("group","pink","mini", initialJSON);
     timeGraphSet("off","grey","mini", initialJSON)
     durTimeSet(hh,min,"mini");
     $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
     $("#id_training_time").val(hh+':'+min+'');
     $("#id_time_duration").val(1*(Options.classDur/60))
     $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
     $("#id_training_time_off").val(hh+':'+min+'');

     }else if(Options.hourunit == 60){
     var tdinfo = $(this).attr('id').split('_');
     var yy = tdinfo[0];
     var mm = tdinfo[1];
     var dd = tdinfo[2];
     var hh = tdinfo[3];
     var min = tdinfo[4];
     var hh1 = Number(tdinfo[3])+1;
     var min1 = '00'
     var yy0 = tdinfo[0];
     var mm0 = tdinfo[1];
     var dd0 = tdinfo[2];
     if(yy0.length<2){var yy0 = '0'+String(tdinfo[0])};
     if(mm0.length<2){var mm0 = '0'+String(tdinfo[1])};
     if(dd0.length<2){var dd0 = '0'+String(tdinfo[2])};
     if(Options.language == "KOR"){
     var text = yy+'년 '+mm+'월 '+dd+'일 '+hh+':'+min+' ~ '+hh1+':'+ min1
     }else if(Options.language == "JPN"){
     var text = yy+'年 '+mm+'月 '+dd+'日 '+hh+':'+min+' ~ '+hh1+':'+ min1
     }else if(Options.language == "ENG"){
     var text = yy+'. '+mm+'. '+dd+'. '+hh+':'+min+' ~ '+hh1+':'+ min1
     }
     $('#datetext_mini').text(text).val(yy0+'-'+mm0+'-'+dd0)
     $('#durations_mini, #durations_mini').html('')
     $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
     timeGraphSet("class","pink","mini", initialJSON);  //시간 테이블 채우기
     timeGraphSet("group","pink","mini", initialJSON);
     timeGraphSet("off","grey","mini", initialJSON)
     durTimeSet(hh,min,"mini");
     $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
     $("#id_training_time").val(hh+':'+min+'');
     $("#id_time_duration").val(1*(Options.classDur/30))
     $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
     $("#id_training_time_off").val(hh+':'+min+'');

     }
     }
     }else if(Options.classDur == 30){
     if(!$(this).find('div').hasClass('classTime') && !$(this).find('div').hasClass('groupTime') && !$(this).find('div').hasClass('offTime') && $('#page-addplan-pc').css('display','none')){
     //$('.td00').css('background','transparent')
     closeMiniPopupByChange()
     if(Options.classDur == 30){
     $(this).find('div').addClass('blankSelected30')
     }else if(Options.classDur == 60){
     $(this).find('div').addClass('blankSelected')
     }
     $('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
     $('.typeSelected').removeClass('typeSelected')
     $('#typeSelector_'+addTypeSelect).addClass('typeSelected')
     if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
     $('._MINI_ptadd').css('display','inline')
     //$('._MINI_offadd').hide()
     }else if(addTypeSelect == "offadd"){
     //$('._MINI_offadd').show()
     $('._MINI_ptadd').css('display','none')
     }
     if(Options.hourunit == 30){
     var tdinfo = $(this).attr('id').split('_');
     var yy = tdinfo[0];
     var mm = tdinfo[1];
     var dd = tdinfo[2];
     var hh = tdinfo[3];
     var min = tdinfo[4];
     if(min == '00'){
     var hh1 = Number(tdinfo[3]);
     var min1 = '30'
     }else if(min == "30"){
     var hh1 = Number(tdinfo[3])+1;
     var min1 = '00'
     }
     var yy0 = tdinfo[0];
     var mm0 = tdinfo[1];
     var dd0 = tdinfo[2];
     if(yy0.length<2){var yy0 = '0'+String(tdinfo[0])};
     if(mm0.length<2){var mm0 = '0'+String(tdinfo[1])};
     if(dd0.length<2){var dd0 = '0'+String(tdinfo[2])};
     if(Options.language == "KOR"){
     var text = yy+'년 '+mm+'월 '+dd+'일 '+hh+':'+min+' ~ '+hh1+':'+ min1
     }else if(Options.language == "JPN"){
     var text = yy+'年 '+mm+'月 '+dd+'日 '+hh+':'+min+' ~ '+hh1+':'+ min1
     }else if(Options.language == "ENG"){
     var text = yy+'. '+mm+'. '+dd+'. '+hh+':'+min+' ~ '+hh1+':'+ min1
     }
     $('#datetext_mini').text(text).val(yy0+'-'+mm0+'-'+dd0)
     $('#durations_mini, #durations_mini').html('')
     $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
     timeGraphSet("class","pink","mini", initialJSON);  //시간 테이블 채우기
     timeGraphSet("group","pink","mini", initialJSON);
     timeGraphSet("off","grey","mini", initialJSON)
     durTimeSet(hh,min,"mini");
     $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
     $("#id_training_time").val(hh+':'+min+'');
     $("#id_time_duration").val(1*(Options.classDur/30))
     $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
     $("#id_training_time_off").val(hh+':'+min+'');

     }else if(Options.hourunit == 60){
     var tdinfo = $(this).attr('id').split('_');
     var yy = tdinfo[0];
     var mm = tdinfo[1];
     var dd = tdinfo[2];
     var hh = tdinfo[3];
     var min = tdinfo[4];
     var hh1 = Number(tdinfo[3])+1;
     var min1 = '00'
     var yy0 = tdinfo[0];
     var mm0 = tdinfo[1];
     var dd0 = tdinfo[2];
     if(yy0.length<2){var yy0 = '0'+String(tdinfo[0])};
     if(mm0.length<2){var mm0 = '0'+String(tdinfo[1])};
     if(dd0.length<2){var dd0 = '0'+String(tdinfo[2])};
     if(Options.language == "KOR"){
     var text = yy+'년 '+mm+'월 '+dd+'일 '+hh+':'+min+' ~ '+hh1+':'+ min1
     }else if(Options.language == "JPN"){
     var text = yy+'年 '+mm+'月 '+dd+'日 '+hh+':'+min+' ~ '+hh1+':'+ min1
     }else if(Options.language == "ENG"){
     var text = yy+'. '+mm+'. '+dd+'. '+hh+':'+min+' ~ '+hh1+':'+ min1
     }
     $('#datetext_mini').text(text).val(yy0+'-'+mm0+'-'+dd0)
     $('#durations_mini, #durations_mini').html('')
     $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
     timeGraphSet("class","pink","mini", initialJSON);  //시간 테이블 채우기
     timeGraphSet("group","pink","mini", initialJSON);
     timeGraphSet("off","grey","mini", initialJSON)
     durTimeSet(hh,min,"mini");
     $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
     $("#id_training_time").val(hh+':'+min+'');
     $("#id_time_duration").val(1*(Options.classDur/30))
     $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
     $("#id_training_time_off").val(hh+':'+min+'');

     }
     }
     }
     })
     //직접 진행시간 선택해서 추가
     */

    //긁어서 일정 추가
    $(document).on('mousedown','.td00, .td30', function(e){
        e.stopPropagation();
        closeAddPopup_mini();
        $(document).off('mouseup');
        var thisID     = $(this).attr('id');
        var thisIDDate = $(this).attr('id').split('_')[0]+'_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2];
        var thisIDHour = $(this).attr('id').split('_')[3];
        var thisIDMin  = $(this).attr('id').split('_')[4];


        if(Options.classDur == 30){
            if(!$(this).hasClass('_on') && !$(this).find('div').hasClass('classTime') && !$(this).find('div').hasClass('offTime') && !$(this).find('div').hasClass('groupTime')){
                $('.blankSelected30').removeClass('blankSelected30');
                $(this).find('div').addClass('blankSelected30');
                $(document).on('mouseover','.td00, .td30', function(){
                    var overIDDate = $(this).attr('id').split('_')[0]+'_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2];
                    var overIDHour = $(this).attr('id').split('_')[3];
                    var overIDMin  = $(this).attr('id').split('_')[4];
                    var prevIDHour = overIDHour;
                    var prevIDMin  = '00';
                    var selector_blankSelected30 = $('.blankSelected30');
                    if(overIDMin == '30'){
                        prevIDHour = overIDHour;
                        prevIDMin  = '00';
                    }else if(overIDMin == '00'){
                        prevIDHour = Number(overIDHour)-1;
                        prevIDMin  = '30';
                    }
                    var $prevOvered = $('#'+overIDDate+'_'+prevIDHour+'_'+prevIDMin);

                    if(selector_blankSelected30.length != 0 && thisIDDate == overIDDate && $prevOvered.find('div').hasClass('blankSelected30') && !$(this).hasClass('_on')){
                        $(this).find('div').addClass('blankSelected30')
                    }else if($(this).hasClass('_on')){
                        $(document).off('mouseover');
                        show_mini_plan_add_popup(thisID, selector_blankSelected30.length);
                        check_dropdown_selected_addplan();
                    }
                });

                $(document).on('mouseup', '.td00, .td30', function(){
                    $(document).off('mouseover');
                    if(!$(this).hasClass('_on') && !$(this).find('div').hasClass('classTime') && !$(this).find('div').hasClass('offTime') && !$(this).find('div').hasClass('groupTime')){
                        show_mini_plan_add_popup(thisID, $('.blankSelected30').length);
                    }
                    check_dropdown_selected_addplan();
                });

                $(document).on('mouseup','#gap',function(){
                    closeAddPopup_mini();
                    $('.blankSelected30').removeClass('blankSelected30');
                });
            }
        }else if(Options.classDur == 60){
            var next30IDHour = Number(thisIDHour);
            var next30IDMin  = '30';
            if(thisIDMin == '00'){
                next30IDHour = Number(thisIDHour);
                next30IDMin  = '30';
            }else if(thisIDMin == '30'){
                next30IDHour = Number(thisIDHour) + 1;
                next30IDMin  = '00';
            }
            var $next30ID = $('#'+thisIDDate+'_'+next30IDHour+'_'+next30IDMin);
            if(!$(this).hasClass('_on') && !$next30ID.hasClass('_on') && !$(this).find('div').hasClass('classTime') && !$(this).find('div').hasClass('offTime') && !$(this).find('div').hasClass('groupTime') 
                && thisIDHour+'-'+thisIDMin != (Options.workEndTime-1)+'-30'){
                $('.blankSelected').removeClass('blankSelected');
                $(this).find('div').addClass('blankSelected');

                $(document).on('mouseover','.td00, .td30', function(){
                    var overIDDate = $(this).attr('id').split('_')[0]+'_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2];
                    var overIDHour = $(this).attr('id').split('_')[3];
                    var overIDMin  = $(this).attr('id').split('_')[4];
                    var prevIDHour = Number(overIDHour)-1;
                    var prevIDMin  = '30';
                    var nextIDHour = Number(overIDHour)+1;
                    var nextIDMin  = '00';
                    if(overIDMin == '30'){
                        prevIDHour = Number(overIDHour)-1;
                        prevIDMin  = '30';
                        nextIDHour = Number(overIDHour)+1;
                        nextIDMin  = '00';
                    }else if(overIDMin == '00'){
                        prevIDHour = Number(overIDHour)-1;
                        prevIDMin  = '00';
                        nextIDHour = Number(overIDHour);
                        nextIDMin  = '30';
                    }
                    var $prevOvered = $('#'+overIDDate+'_'+prevIDHour+'_'+prevIDMin);
                    var $nextOvered = $('#'+overIDDate+'_'+nextIDHour+'_'+nextIDMin);
                    var selector_blankSelected = $('.blankSelected');
                    if(selector_blankSelected.length != 0 && thisIDDate == overIDDate && $prevOvered.find('div').hasClass('blankSelected') && !$(this).hasClass('_on') && !$nextOvered.hasClass('_on')){
                        $(this).find('div').addClass('blankSelected');
                    }else if($(this).hasClass('_on')){
                        $(document).off('mouseover');
                        show_mini_plan_add_popup(thisID, selector_blankSelected.length);
                        check_dropdown_selected_addplan();
                    }
                });

                $(document).on('mouseup', '.td00, .td30', function(){
                    $(document).off('mouseover');
                    if(!$(this).hasClass('_on') && !$next30ID.hasClass('_on') && !$(this).find('div').hasClass('classTime') && !$(this).find('div').hasClass('offTime') && !$(this).find('div').hasClass('groupTime')){
                        show_mini_plan_add_popup(thisID, $('.blankSelected').length);
                    }
                    check_dropdown_selected_addplan();
                });


                $(document).on('mouseup','#gap',function(){
                    closeAddPopup_mini();
                    $('.blankSelected').removeClass('blankSelected');
                });

            }
        }
    });
    //긁어서 일정 추가

    function show_mini_plan_add_popup(thisID, dur){
        var durMin = dur*Options.classDur
        var starttime = time_h_format_to_hh(thisID.split('_')[3])+':'+thisID.split('_')[4];
        $("#id_training_date, #id_training_date_off, #id_training_end_date, #id_training_end_date_off").val(date_format_yyyy_m_d_to_yyyy_mm_dd(thisID.split('_')[0]+'-'+thisID.split('_')[1]+'-'+thisID.split('_')[2], '-'));
        $("#id_training_time, #id_training_time_off").val(starttime);

        if(addTypeSelect == "ptadd"){ //Form 셋팅
            $('#id_training_end_time').val(add_time(starttime, '00:'+durMin))
            $('#id_training_end_time_off').val(add_time(starttime, '00:'+durMin))
        }else if(addTypeSelect == "offadd"){
            $('#id_training_end_time').val(add_time(starttime, '00:'+durMin))
            $('#id_training_end_time_off').val(add_time(starttime, '00:'+durMin))
        }else if(addTypeSelect == "groupptadd" || addTypeSelect == "repeatptadd" || addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatgroupptadd"){
            addTypeSelect = 'ptadd'
            $('#id_training_end_time').val(add_time(starttime, '00:'+durMin))
            $('#id_training_end_time_off').val(add_time(starttime, '00:'+durMin))
        }
        //$("#classDuration_mini #durationsSelected button").addClass("dropdown_selected").text(((Options.classDur*Number(dur))/60)+'시간').val(dur);
        $("#classDuration_mini #durationsSelected button").addClass("dropdown_selected").text(duration_number_to_hangul((Options.classDur*Number(dur))/60)).val(dur);

        var endTime = (Number(thisID.split('_')[3])+parseInt((Options.classDur*Number(dur))/60));
        if(endTime == Options.workEndTime){
            endTime = Options.workEndTime-1;
        }

        var endMin;
        var endHour;
        if((Options.classDur*Number(dur))/60 - parseInt((Options.classDur*Number(dur))/60) == 0.5){
            if(thisID.split('_')[4] == "00"){
                endMin = "30";
                endHour = Number(thisID.split('_')[3])+parseInt((Options.classDur*Number(dur))/60);
            }else{
                endMin = "00";
                endHour = Number(thisID.split('_')[3])+parseInt((Options.classDur*Number(dur))/60)+1;
            }
        }else{
            endMin = thisID.split('_')[4];
            endHour = Number(thisID.split('_')[3])+parseInt((Options.classDur*Number(dur))/60);
        }

        var endID = thisID.split('_')[0]+'_'+thisID.split('_')[1]+'_'+thisID.split('_')[2]+'_'+endTime+'_'+thisID.split('_')[4];

        $('#datetext_mini').text(thisID.split('_')[0]+'년 '+
            thisID.split('_')[1]+'월 '+
            thisID.split('_')[2]+'일 '+
            thisID.split('_')[3]+':'+
            thisID.split('_')[4]+'~ '+
            endHour+':'+
            endMin
            //' ('+
            //duration_number_to_hangul((Options.classDur*Number(dur))/60)+')'
        ).val(date_format_yyyy_m_d_to_yyyy_mm_dd(thisID.split('_')[0]+'-'+thisID.split('_')[1]+'-'+thisID.split('_')[2], '-'));

        $('.typeSelected').removeClass('typeSelected')
        $('#typeSelector_'+addTypeSelect).addClass('typeSelected')
        if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
            $('._MINI_ptadd').css('display','inline')
            //$('._MINI_offadd').hide()
        }else if(addTypeSelect == "offadd"){
            //$('._MINI_offadd').show()
            $('._MINI_ptadd').css('display','none')
        }


        //미니 팝업 위치 보정
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var popupwidth = $('#page-addplan-pc').width();
        var popupheight = $('#page-addplan-pc').height();
        var startTopLoc = $('#'+thisID).offset().top;
        var startLeftLoc = $('#'+thisID).offset().left;
        var startWidth = $('#'+thisID).width();
        if(Options.classDur == 60){
            var startHeight = $('#'+thisID).height()*2;
        }else if(Options.classDur == 30){
            var startHeight = 0;
        };
        var endTopLoc = $('#'+endID).offset().top;
        var endLeftLoc = $('#'+endID).offset().left;
        var endWidth = $('#'+endID).width();
        var scrollTop = $(window).scrollTop();
        var weekTopLoc = $('#week').offset().top;
        var weekHeight = $('#week').height();

        var popupRightLoc = endLeftLoc+endWidth+popupwidth;
        var popupBottomLoc = endTopLoc + popupheight;
        if(popupRightLoc > windowWidth){ //팝업이 오른쪽으로 넘어갔을 때
            if(popupBottomLoc > windowHeight + scrollTop){ //팝업이 아래로 넘어가서 안보일때
                $('#page-addplan-pc').show().css({'top':endTopLoc -  popupheight, 'left':endLeftLoc - popupwidth})
            }else if(popupBottomLoc + popupheight > weekTopLoc+weekHeight){ //스크롤을 내려서 팝업이 위로 넘어가서 안보일때
                $('#page-addplan-pc').show().css({'top':endTopLoc -  startHeight, 'left':endLeftLoc - popupwidth})
            }else{ //그외
                $('#page-addplan-pc').show().css({'top':endTopLoc - startHeight, 'left':endLeftLoc - popupwidth})
            }
        }else{
            if(popupBottomLoc > windowHeight + scrollTop){ //팝업이 아래로 넘어가서 안보일때
                $('#page-addplan-pc').show().css({'top':endTopLoc -  popupheight, 'left':endLeftLoc+endWidth})
            }else if(popupBottomLoc + popupheight > weekTopLoc+weekHeight){ //스크롤을 내려서 팝업이 위로 넘어가서 안보일때
                $('#page-addplan-pc').show().css({'top':endTopLoc -  startHeight, 'left':endLeftLoc+endWidth})
            }else{
                $('#page-addplan-pc').show().css({'top':endTopLoc - startHeight, 'left':endLeftLoc+endWidth})
            }
        }
        //미니 팝업 위치 보정

 

        ajaxTimeGraphSet(date_format_yyyy_m_d_to_yyyy_mm_dd(thisID.split('_')[0]+'-'+thisID.split('_')[1]+'-'+thisID.split('_')[2], '-'), "callback", function(jsondata){
            if($('.add_time_unit').hasClass('checked')){
                durTimeSet(thisID.split('_')[3], thisID.split('_')[4],"mini", 5);
            }else{
                durTimeSet(thisID.split('_')[3], thisID.split('_')[4],"mini", Options.classDur);
            }
        });

        //$('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth});
        check_dropdown_selected_addplan()
    }

    //shift키 눌러서 일정을 쭉 잡기
    function fill_blankSelected_by_shift_key(thisID, endID){
        // TO - DO
    }



    if($('#calendar').width()<=600){
        $(document).off('mouseup mouseover mousedown','.td00, .td30');
    }

    $('#typeSelector .toggleBtnWrap').click(function(){
        $('.blankSelected_addview').removeClass('blankSelected blankSelected30 blankSelected_addview');
        $(this).addClass('typeSelected');
        $(this).siblings('.toggleBtnWrap').removeClass('typeSelected');
        if($(this).attr('id').split('_')[1]=="ptadd"){
            $('#memberName_mini, #remainCount_mini').css('display','inline');
            $('.pt_memo_guide_mini').css('visibility','unset');
            if($('#membersSelected_mini button').attr('data-grouptype') == "group"){
                addTypeSelect = "groupptadd";
            }else{
                addTypeSelect = "ptadd";
            }
        }else if($(this).attr('id').split('_')[1]=="offadd"){
            $('#memberName_mini, #remainCount_mini').css('display','none');
            $('.pt_memo_guide_mini').css('visibility','hidden');
            addTypeSelect = "offadd";
        }
        check_dropdown_selected_addplan();
    });

    $(document).on('click',"#durations_mini li a",function(){
        $("#classDuration_mini #durationsSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-dur'));

        if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){ //Form 셋팅
            //var durationTime_class =  Number($(this).attr('data-dur').replace(/시간/gi,''))*(30/Options.classDur);
            //$("#id_time_duration, #id_time_duration_off").val(durationTime_class);
            $('#id_training_end_time, #id_training_end_time_off').val($(this).attr('data-endtime'))
            planAddView($(this).attr('data-dur'));

        }else if(addTypeSelect == "offadd"){
            //var durationTime = Number($(this).attr('data-dur').replace(/시간/gi,''))*(30/Options.classDur);
            $('#id_training_end_time, #id_training_end_time_off').val($(this).attr('data-endtime'))
            //$("#id_time_duration, #id_time_duration_off").val(durationTime);
            planAddView($(this).attr('data-dur'));
        }
        check_dropdown_selected_addplan();
    });


    $('#memo_mini, #scheduleMemo input').keyup(function(){
        $('#id_memo_mini, #id_memo_mini_off').val($(this).val());
    });

    /*
     function planAddView(duration){ //미니팝업으로 진행시간 표기 미리 보기
     if(Options.classDur == 60){
     var selectedDuration = Number(duration)/2
     var blankSelected = 'blankSelected'
     var selectedTime = $('.'+blankSelected).parent('div').attr('id').split('_')
     var mi = selectedTime[4]
     var yy = Number(selectedTime[0])
     var mm = Number(selectedTime[1])
     var dd = Number(selectedTime[2])
     var hh = Number(selectedTime[3])

     $('.blankSelected_addview').removeClass(blankSelected+' blankSelected_addview')
     for(i=hh+1; i<hh+selectedDuration; i++){
     $('#'+yy+'_'+mm+'_'+dd+'_'+i+'_'+mi).find('div').addClass(blankSelected+' blankSelected_addview')
     }
     }else if(Options.classDur == 30){
     var selectedDuration = Number(duration)
     var blankSelected = 'blankSelected30'
     var selectedTime = $('.'+blankSelected).parent('div').attr('id').split('_')
     if(selectedTime[4] == "00"){
     var mi = "30"
     var hh = Number(selectedTime[3])
     }else if(selectedTime[4] =="30"){
     var mi = "00"
     var hh = Number(selectedTime[3])+1
     }
     var yy = Number(selectedTime[0])
     var mm = Number(selectedTime[1])
     var dd = Number(selectedTime[2])
     var hh_ = Number(selectedTime[3])
     $('.blankSelected_addview').removeClass(blankSelected+' blankSelected_addview')
     for(i=hh; i<hh+selectedDuration-1; i++){
     if(mi == 60 || mi == 0){
     var mi = "00"
     var hh_ = hh_ + 1
     }
     $('#'+yy+'_'+mm+'_'+dd+'_'+hh_+'_'+mi).find('div').addClass(blankSelected+' blankSelected_addview')
     mi = Number(mi) + 30
     }
     }
     }
     */

    function planAddView(duration){ //미니팝업으로 진행시간 표기 미리 보기

        /*
        var mi = selectedTime[4];
        var yy = Number(selectedTime[0]);
        var mm = Number(selectedTime[1]);
        var dd = Number(selectedTime[2]);
        var hh = Number(selectedTime[3]);
        var hh_ = Number(selectedTime[3]);
        */
        if(Options.classDur == 60){
            var selectedDuration = Number(duration)/2;
            var blankSelected = 'blankSelected';
            var selector_blankSelected = $('.'+blankSelected);
            var selector_blankSelected_first_child = $('.'+blankSelected+':first-child');
            var selectedTime = selector_blankSelected.parent('div').attr('id').split('_');
            var selectedTimeID = selector_blankSelected_first_child.parent('div').attr('id');


            selectedDuration = Number(duration)/2;
            blankSelected = 'blankSelected';
            selectedTime = selector_blankSelected.parent('div').attr('id').split('_');
            selectedTimeID = selector_blankSelected_first_child.parent('div').attr('id');
            mi = selectedTime[4];
            yy = Number(selectedTime[0]);
            mm = Number(selectedTime[1]);
            dd = Number(selectedTime[2]);
            hh = Number(selectedTime[3]);

            selector_blankSelected.removeClass(blankSelected);
            $('#'+selectedTimeID).find('div').addClass(blankSelected);
            for(i=hh+1; i<hh+selectedDuration; i++){
                $('#'+yy+'_'+mm+'_'+dd+'_'+i+'_'+mi).find('div').addClass(blankSelected);
            }
        }else if(Options.classDur == 30){
            var selectedDuration = Number(duration)/2;
            var blankSelected = 'blankSelected30';
            var selector_blankSelected = $('.'+blankSelected);
            var selector_blankSelected_first_child = $('.'+blankSelected+':first-child');
            var selectedTime = selector_blankSelected.parent('div').attr('id').split('_');
            var selectedTimeID = selector_blankSelected_first_child.parent('div').attr('id');


            selectedDuration = Number(duration.replace(/시간/gi,''));
            blankSelected = 'blankSelected30';
            selectedTime = selector_blankSelected_first_child.parent('div').attr('id').split('_');
            selectedTimeID = selector_blankSelected_first_child.parent('div').attr('id');
            if(selectedTime[4] == "00"){
                mi = "30";
                hh = Number(selectedTime[3]);
            }else if(selectedTime[4] =="30"){
                mi = "00";
                hh = Number(selectedTime[3])+1;
            }
            yy = Number(selectedTime[0]);
            mm = Number(selectedTime[1]);
            dd = Number(selectedTime[2]);
            hh_ = Number(selectedTime[3]);
            selector_blankSelected.removeClass(blankSelected);
            $('#'+selectedTimeID).find('div').addClass(blankSelected);
            for(var i=hh; i<hh+selectedDuration-1; i++){
                if(mi == 60 || mi == 0){
                    mi = "00";
                    hh_ = hh_ + 1;
                }
                $('#'+yy+'_'+mm+'_'+dd+'_'+hh_+'_'+mi).find('div').addClass(blankSelected);
                mi = Number(mi) + 30;
            }
        }
    }

    function closeMiniPopupByChange(){
        $("#id_training_end_time, #id_training_end_time_off").val("");
        $('#page-addplan-pc').hide();
        $('.blankSelected, .blankSelected30').removeClass('blankSelected blankSelected30 blankSelected_addview');
        clear_pt_off_add_popup_mini();
    }

    function member_enddate_check_before_addplan(jsondata){
        var enddateArray = jsondata.endArray;
        var type = jsondata.groupTypeCdArray;
        var currentStateArray = jsondata.lectureStateArray;
        var lecname = jsondata.groupNameArray;
        var len = enddateArray.length;
        
        var most_past_enddate;
        var most_recent_enddate;

        var exist_past_reg = []
        for(var i=0; i<len; i++){
            if(currentStateArray[i] == "IP" && enddateArray[i] != "9999-12-31"){
                if(compare_date2(today_YY_MM_DD, enddateArray[i]) == true ){
                //테스트용 if문 if(compare_date2("2020-12-20", enddateArray[i]) == true ){
                    exist_past_reg.push('<p>'+lecname[i]+': '+'종료일자 '+enddateArray[i]+'</p>')
                }
            }
        }

        var message = exist_past_reg.join('');
        if(exist_past_reg.length > 0){
            $('#base_popup_check_finished_member_notice .caution_message').html(                                                                            
                                                                                   '<p style="color:#fe4e65;">종료일자가 지난 수강정보가 있는 회원입니다.</p>'+
                                                                                        '<div style="width:95%;border:1px solid #cccccc;margin:0 auto;padding-top:10px;margin-bottom:10px;">'+
                                                                                            message+
                                                                                        '</div>'+
                                                                                    '<p>정확한 데이터 관리를 위해<br>종료일자 변경 및 확인을 해주세요.</p>'
                                                                            )
            $('#base_popup_check_finished_member_notice').show();
            $('#shade_caution').show();
            disable_window_scroll();
        }
    }


    $(document).on('click',"#members_pc li a",function(){
        //$('.tdgraph').removeClass('graphindicator')
        if($(this).attr('data-grouptype') == "personal"){
            addTypeSelect = "ptadd";
            $('#remainCount_mini').show();
            $('#groupInfo, #groupmembersInfo, #groupInfo_mini, #groupInfo_mini_text, #groupInfoSelected').hide();
            $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text()).attr('data-grouptype','personal');

            //회원 이름을 클릭했을때, 회원의 수강일정중 1:1 레슨의 예약가능 횟수만을 표기해준다.
            get_member_lecture_list($(this).attr("data-dbid"), 'callback', function(jsondata){
                var availCount_personal = 0;
                for(var i= 0; i<jsondata.availCountArray.length; i++){
                    if(jsondata.lectureStateArray[i] == "IP" && jsondata.groupNameArray[i] == "1:1 레슨"){
                        availCount_personal = availCount_personal + Number(jsondata.availCountArray[i]);
                    }
                }
                $("#countsSelected_mini").show().text(availCount_personal);
                member_enddate_check_before_addplan(jsondata)
                check_dropdown_selected_addplan();
            });

            $('#remainCount_mini_text').css('display','inline-block');
            $("#id_lecture_id").val($(this).attr('data-lectureid'));
            $("#id_member_id").val($(this).attr('data-dbid'));
            $("#id_member_name").val($(this).text());

        }else if($(this).attr('data-grouptype') == "group"){
            addTypeSelect = "groupptadd";
            $('#remainCount_mini, #remainCount_mini_text, #countsSelected_mini').hide();
            $('#groupInfo, #groupmembersInfo, #groupInfo_mini, #groupInfo_mini_text, #groupInfoSelected').show();
            $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text()).attr('data-grouptype','group');
            $('#grouptypenumInfo, #groupInfoSelected').text('('+$(this).attr('data-grouptypecd_nm')+' 정원'+$(this).attr('data-membernum')+'명)');
            $("#id_group_id").val($(this).attr('data-groupid'));
        }

        check_dropdown_selected_addplan();
    }); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

    $(document).on('click',"#members_mobile li a",function(){
        //$('.tdgraph').removeClass('graphindicator')

        if($(this).attr("data-grouptype") == "personal"){
            if($('._NORMAL_ADD_wrap').css('display') == 'block'){
                addTypeSelect = "ptadd";
            }else if($('._REPEAT_ADD_wrap').css('display') == 'block'){
                addTypeSelect = "repeatptadd";
            }
            $('#remainCount').show();
            $('#groupInfo, #groupmembersInfo').hide();
            get_repeat_info($(this).attr('data-dbid'));

            //회원 이름을 클릭했을때, 회원의 수강일정중 1:1 레슨의 예약가능 횟수만을 표기해준다.
            get_member_lecture_list($(this).attr("data-dbid"), 'callback', function(jsondata){
                var availCount_personal = 0;
                for(var i= 0; i<jsondata.availCountArray.length; i++){
                    if(jsondata.lectureStateArray[i] == "IP" && jsondata.groupNameArray[i] == "1:1 레슨"){
                        availCount_personal = availCount_personal + Number(jsondata.availCountArray[i]);
                    }
                }
                $("#countsSelected").text(availCount_personal);
                member_enddate_check_before_addplan(jsondata)
            })

            $('#cal_popup_repeatconfirm').attr({'data-lectureid':$(this).attr('data-lectureid'),'data-dbid':$(this).attr('data-dbid')});
            $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text());
            $("#id_member_id").val($(this).attr('data-dbid'));
            $("#id_lecture_id").val($(this).attr('data-lectureid'));
            $("#id_member_name").val($(this).text());

            if(addTypeSelect == "repeatptadd"){
                $("#id_repeat_member_id").val($(this).attr('data-dbid'));
                $("#id_repeat_lecture_id").val($(this).attr('data-lectureid'));
                $("#id_repeat_member_name").val($(this).text());
            }

        }else if($(this).attr("data-grouptype") == "group"){
            var grouptypecd = $(this).attr('data-grouptypecd');
            var groupid = $(this).attr('data-groupid');

            if($('._NORMAL_ADD_wrap').css('display') == 'block'){
                addTypeSelect = "groupptadd";
            }else if($('._REPEAT_ADD_wrap').css('display') == 'block'){
                addTypeSelect = "repeatgroupptadd";
            }
            $('#remainCount').hide();
            $('#groupInfo').show();


            get_repeat_info(groupid);
            $('#id_repeat_group_id').val(groupid);

            $('#cal_popup_repeatconfirm').attr({'data-lectureid':$(this).attr('data-lectureid'),'data-groupid':groupid});
            $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text());
            $('#grouptypenumInfo').text($(this).attr('data-grouptypecd_nm')+' '+$(this).attr('data-membernum')+'명');
            $("#id_group_id").val(groupid);

            if(grouptypecd == "NORMAL"){
                $('#groupmembersInfo').show()
                get_groupmember_list(groupid, 'callback', function(jsondata){
                    draw_groupMemberList_to_view(jsondata, $('#groupmemberInfo'))
                    if(bodywidth > 600){
                        $('#page-addplan').animate({'top': $('#page-addplan').offset().top-$('#groupmemberInfo').height()},200)
                    }
                });
            }else if(grouptypecd == "EMPTY"){
                $('#groupmembersInfo').hide()
            }
        }

        check_dropdown_selected_addplan();
        position_absolute_addplan_if_mobile($('#membersSelected'));
    }); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

    $(document).on('click', '#starttimesSelected input', function(e){
        e.stopPropagation();
    })

    $(document).on('click','#starttimes li a',function(){
        $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
        $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text());
        /*$(this).parents('ul')
               .siblings('button')
               .addClass("dropdown_selected")
               .val($(this).text())
               .html('<input type="time" class="starttimes_selected" value="'+$(this).text().split(' ')[1]+'" step="'+Options.classDur*60+'">');
        */
        if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd" ){
            $("#id_training_time").val($(this).attr('data-trainingtime'));
        }else if(addTypeSelect == "offadd"){
            $("#id_training_time_off").val($(this).attr('data-trainingtime'));
        }
        var arry = $(this).attr('data-trainingtime').split(':');

        //진행시간 드랍다운리스트 채움
        if($('.add_time_unit').hasClass('checked')){
            durTimeSet(arry[0],arry[1],"class", 5);
        }else{
            durTimeSet(arry[0],arry[1],"class", Options.classDur);
        }
        
        //진행시간 자동으로 최소 단위 시간으로 Default 셋팅
        var selector_durationsSelected_button = $('#durationsSelected button');
        var selector_durations_li_first_child = $('#durations li:nth-of-type(1) a');
        $("#durationsSelected .btn:first-child").val("").html("<span style='color:#cccccc;'>선택</span>");
        selector_durationsSelected_button.addClass("dropdown_selected").text(selector_durations_li_first_child.text()).val(selector_durations_li_first_child.attr('data-dur')).attr('data-durmin',selector_durations_li_first_child.attr('data-durmin'));
        if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
            var durationTime_class = Number(selector_durationsSelected_button.val())*(30/Options.classDur);
            //$("#id_time_duration").val(durationTime_class);
            $('#id_training_end_time').val(selector_durations_li_first_child.attr('data-endtime'))
            addGraphIndicator(selector_durationsSelected_button.attr('data-durmin'));

        }else if(addTypeSelect == "offadd"){
            var durationTime = Number(selector_durationsSelected_button.val())*(30/Options.classDur);
            //$("#id_time_duration_off").val(durationTime);
            $('#id_training_end_time_off').val(selector_durations_li_first_child.attr('data-endtime'))
            addGraphIndicator(selector_durationsSelected_button.attr('data-durmin'));

        }
        check_dropdown_selected_addplan();
        position_absolute_addplan_if_mobile($('#starttimesSelected'));
    });


    $('button.pters_dropdown_custom').click(function(){
        position_fixed_addplan_if_mobile();
        if(bodywidth < 600){
            var selector = $(this).siblings('ul');
            $('.pters_dropdown_custom_list').css({'top':($(window).height()-selector.height())/2,
                                                  'left':'50%',
                                                  'transform':'translateX(-50%)'});
            //드랍다운 씹힘현상 해결
            selector.animate({scrollTop : selector.scrollTop()+1},10)
            //드랍다운 씹힘현상 해결
        }        
    });

    $(document).on('click','div.dropdown-backdrop', function(){
        position_absolute_addplan_if_mobile();
    })


    $(document).on('click',"#durations li a",function(){
        $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-dur')).attr('data-durmin',$(this).attr('data-durmin'));
        if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
            var durationTime_class = Number($(this).attr('data-dur'));
            //$("#id_time_duration").val(durationTime_class);
            $('#id_training_end_time').val($(this).attr('data-endtime'))
            addGraphIndicator($(this).attr('data-durmin'));
        }else if(addTypeSelect == "offadd"){
            var durationTime = Number($(this).attr('data-dur'));
            //$("#id_time_duration_off").val(durationTime);
            $('#id_training_end_time_off').val($(this).attr('data-endtime'))
            addGraphIndicator($(this).attr('data-durmin'));
        }
        check_dropdown_selected_addplan();
        position_absolute_addplan_if_mobile($('#durationsSelected'));
    }); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시


    $(document).on('click','#durationsSelected button',function(e){
        if($('#durations li').length == 0){
            $('.dropdown-backdrop').css('display','none');
            position_absolute_addplan_if_mobile($('#starttimesSelected'));
        }
        $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
    });


    //드랍다운에서 가속도 스크롤을 같은방향으로 더 튕겼을때 드랍다운 멈추는 형상 해결
    //드랍다운 씹힘현상 해결
    $('.pters_dropdown_custom_list').scroll(function(){
        var scrollHeight = $(this).prop('scrollHeight');
        var popupHeight = $(this).height();
        var scrollLocation = $(this).scrollTop();
        //scrollHeight = popupHeight + scrollLocation(끝)
        if(popupHeight + scrollLocation == scrollHeight){
            $(this).animate({scrollTop : scrollLocation-1},10)
        }else if(popupHeight + scrollLocation == popupHeight){
            $(this).animate({scrollTop : scrollLocation+1},10)
        }

        // 좌측 스크롤 애로우 보이기
        if(popupHeight + scrollLocation < scrollHeight-30){
            $('.dropdown_scroll_arrow_bottom').css('visibility','visible')
        }else{
            $('.dropdown_scroll_arrow_bottom').css('visibility','hidden')
        }
        if(scrollLocation > 30){
            $('.dropdown_scroll_arrow_top').css('visibility','visible')
        }else{
            $('.dropdown_scroll_arrow_top').css('visibility','hidden')
        }
        //좌측 스크롤 애로우 보이기
    });
    //드랍다운 씹힘현상 해결
    //드랍다운에서 가속도 스크롤을 같은방향으로 더 튕겼을때 드랍다운 멈추는 형상 해결


    $('button.pters_dropdown_custom').click(function(){
        var $button = $(this);
        var $ul = $(this).siblings('ul');
        var $li = $(this).siblings('ul').find('li');
        var dropdown_list_visible_height = $ul.height();
        var dropdown_list_total_height = $li.length*$li.outerHeight() + $ul.find('div:nth-of-type(1)').height();

        if(dropdown_list_total_height > dropdown_list_visible_height*2){
            $ul.animate({scrollTop: dropdown_list_total_height/2.5},200)
        }
        if(dropdown_list_total_height > dropdown_list_visible_height + 30){
            if($ul.find('div:nth-of-type(1)').find('img').length == 0){
                $ul.find('div:nth-of-type(1)').append(
                                                    '<img src="/static/user/res/btn-today-left.png" class="dropdown_scroll_arrow_top">'+
                                                    '<img src="/static/user/res/btn-today-left.png" class="dropdown_scroll_arrow_bottom">'
                                                 )
            }
        }
        if($('.pters_dropdown_custom_list').scrollTop() < 30 ){
            $('.dropdown_scroll_arrow_top').css('visibility','hidden');
        };
    })


    var ajax_block_during_submit = true;
    $("#upbutton-check, #submitBtn_pt, #submitBtn_mini").click(function(e){
        var bodywidth = window.innerWidth;
        var $form;
        var serverURL;
        var serializeArray;
        var sendData;
        e.preventDefault();
        if(addTypeSelect=="ptadd"){
            $form = $('#pt-add-form');
            serverURL = '/schedule/add_schedule/';
            serializeArray = $form.serializeArray();
            //sendData = send_Data(serializeArray);
            sendData = serializeArray;

        }else if(addTypeSelect=="groupptadd"){
            $form = $('#pt-add-form');
            serverURL = '/schedule/add_group_schedule/';
            serializeArray = $form.serializeArray();
            //sendData = send_Data(serializeArray);
            sendData = serializeArray;

        }else if(addTypeSelect=="offadd"){
            $form = $('#off-add-form');
            serverURL = '/schedule/add_schedule/';
            serializeArray = $form.serializeArray();
            //sendData = send_Data(serializeArray);
            sendData = serializeArray;

        }else if(addTypeSelect=="repeatptadd"){
            $form = $('#add-repeat-schedule-form');
            serverURL = '/schedule/add_repeat_schedule/';
            serializeArray = $form.serializeArray();
            //sendData = send_Data(serializeArray);
            sendData = serializeArray;

        }else if(addTypeSelect=="repeatgroupptadd"){
            $form = $('#add-repeat-schedule-form');
            serverURL = '/schedule/add_group_repeat_schedule/';
            serializeArray = $form.serializeArray();
            //sendData = send_Data(serializeArray);
            sendData = serializeArray;

        }else if(addTypeSelect=="repeatoffadd"){
            $form = $('#add-off-repeat-schedule-form');
            serverURL = '/schedule/add_repeat_schedule/';
            serializeArray = $form.serializeArray();
            //sendData = send_Data(serializeArray);
            sendData = serializeArray;
        }
        if(select_all_check==true){
            //ajax 회원정보 입력된 데이터 송신
            if(ajax_block_during_submit == true){
                ajax_block_during_submit = false;
                //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts(serverURL)
                $.ajax({
                    url: serverURL,
                    type:'POST',
                    data:sendData,
                    dataType : 'html',

                    beforeSend:function(){
                        beforeSend(); //ajax 로딩 이미지 출력
                    },

                    //통신성공시 처리
                    success:function(data){
                        //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
                        var jsondata = JSON.parse(data);
                        initialJSON = jsondata;
                        RepeatDuplicationDateArray = jsondata.RepeatDuplicationDateArray;
                        repeatArray = jsondata.repeatArray;
                        if(jsondata.messageArray.length>0){
                            $('#errorMessageBar').show();
                            $('#errorMessageText').text(jsondata.messageArray);
                        }else{
                            var repeat_info;
                            if(RepeatDuplicationDateArray.length>0 && (addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd")){
                                var total_count = Number(jsondata.repeatScheduleCounterArray[0])+RepeatDuplicationDateArray[0].split('/').length;
                                if(total_count == RepeatDuplicationDateArray[0].split('/').length){
                                    alert('모든 일정이 기존 일정과 겹쳐 등록할 수 있는 일정이 없습니다.\n 일정을 다시 확인 후 등록해주세요.');
                                    completeSend(); //ajax 로딩 이미지 숨기기
                                }else{
                                    var date = RepeatDuplicationDateArray[0].replace(/\//gi,", ");
                                    $('._repeatconfirmQuestion').text('총 '+total_count+' 건의 일정 중 '+RepeatDuplicationDateArray[0].split('/').length + '건의 일정이 겹칩니다.');
                                    repeat_info = popup_repeat_confirm();
                                    $('#repeat_confirm_day').text(RepeatDuplicationDateArray[0].replace(/\//gi,','));
                                    $('#repeat_confirm_dur').text('중복 항목은 건너뛰고 등록하시겠습니까?');
                                    $('#id_repeat_schedule_id_confirm').val(repeatArray);
                                    completeSend(); //ajax 로딩 이미지 숨기기
                                    shade_index(200);
                                }
                            }else if(RepeatDuplicationDateArray.length==0 && (addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd")){
                                //if(jsondata.repeatScheduleCounterArray[0] == 0){
                                // alert('선택한 회원님의 등록 가능한 횟수가 부족합니다.\n 다시 확인 후 등록해주세요.')
                                //completeSend(); //ajax 로딩 이미지 숨기기
                                //}else{
                                repeat_info = popup_repeat_confirm();
                                var day_info = repeat_info.day_info;
                                var dur_info = repeat_info.dur_info;
                                $('._repeatconfirmQuestion').text('총 '+jsondata.repeatScheduleCounterArray[0]+' 건의 일정이 등록됩니다.');
                                $('#repeat_confirm_day').text(day_info);
                                $('#repeat_confirm_dur').text(dur_info);
                                $('#id_repeat_schedule_id_confirm').val(repeatArray);
                                completeSend(); //ajax 로딩 이미지 숨기기
                                shade_index(200);
                                //};
                            }else{
                                if(jsondata.push_lecture_id.length>0){
                                    for(var i=0; i<jsondata.push_lecture_id.length; i++) {
                                        send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i]);
                                    }
                                }
                                
                                super_ajaxClassTime();
                                $('#members_mobile, #members_pc').html('');
                                get_current_member_list();
                                get_current_group_list();

                                closeAddPopup();
                                closeAddPopup_mini();
                                completeSend();
                                shade_index(-100);
                                var selector_calendar = $('#calendar');
                                selector_calendar.css('height','100%');
                                if(bodywidth >= 600){
                                    selector_calendar.css('position','relative');
                                }
                            }
                        }
                    },

                    //보내기후 팝업창 닫기
                    complete:function(){
                        ajax_block_during_submit = true;
                    },

                    //통신 실패시 처리
                    error:function(){
                        $('#errorMessageBar').show();
                        $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
                    }
                })
            }


        }else{
            if($('#countsSelected').text() == 0){
                //alert('회원님의 남은 예약 가능 횟수가 없습니다.')
            }
            console.log('else');
            //alert('빠진 항목 체크해봐야함')
            //$('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
        }
    });

    //OFF반복일정 확인 팝업 "아니오" 눌렀을때 (선택지: 반복 설정 다시 하겠다)
    var ajax_block_during_repeat_confirm = true;
    $('#popup_btn_repeatconfirm_no').click(function(){
        if(ajax_block_during_repeat_confirm == true){
            $('#id_repeat_confirm').val(0);
            /*
             if($('body').width()<600){
             shade_index(-100) //20180430
             $('#calendar').css('height','100%') //20180430
             }
             */
            close_info_popup('cal_popup_repeatconfirm');
            ajaxRepeatConfirmSend();
            check_dropdown_selected_addplan();
        }
    });


    $('#popup_btn_repeatconfirm_yes').click(function(){
        if(ajax_block_during_repeat_confirm == true){
            $('#id_repeat_confirm').val(1);
            /*
             if($('body').width()<600){
             close_info_popup('page-addplan')
             shade_index(-100) //20180430
             $('#calendar').css('height','100%') //20180430
             }
             */
            close_info_popup('cal_popup_repeatconfirm');
            ajaxRepeatConfirmSend('callback',function(){
                clear_repeat_add_popup()
                check_dropdown_selected_addplan()
                var id;
                if(addTypeSelect == "repeatgroupptadd"){
                    id = $('#cal_popup_repeatconfirm').attr('data-groupid');
                }else{
                    id = $('#cal_popup_repeatconfirm').attr('data-dbid');
                }
                get_repeat_info(id);

                if(addTypeSelect != "repeatoffadd"){
                    $('#members_mobile, #members_pc').html('');
                    get_current_member_list('callback',function(jsondata){
                        set_member_dropdown_list(jsondata);
                        $('#countsSelected').text($('#members_mobile a[data-dbid="'+id+'"]').attr('data-lecturecount'));
                    });

                    get_member_lecture_list(id, 'callback', function(jsondata){
                        var availCount_personal = 0;
                        for(var i= 0; i<jsondata.availCountArray.length; i++){
                            if(jsondata.lectureStateArray[i] == "IP" && jsondata.groupNameArray[i] == "1:1 레슨"){
                                availCount_personal = availCount_personal + Number(jsondata.availCountArray[i]);
                            }
                        }
                        $("#countsSelected").text(availCount_personal);
                    });
                    get_current_group_list('callback',function(jsondata){
                        set_group_dropdown_list(jsondata);
                        var selector_members_mobile_a_data_group_id = $('#members_mobile a[data-groupid="'+id+'"]');
                        $('#grouptypenumInfo').text(selector_members_mobile_a_data_group_id.attr('data-grouptypecd_nm') +' '+ selector_members_mobile_a_data_group_id.attr('data-groupmembernum') + ' / ' + selector_members_mobile_a_data_group_id.attr('data-membernum'));
                    });
                }

            });
            check_dropdown_selected_addplan();
        }
    });


    //일정 눌러서 cal_popup_planinfo의 그룹 참석자 버튼
    $('#popup_btn_viewGroupParticipants').click(function(){
        if(toggleGroupParticipants == 'off'){
            toggleGroupParticipantsList('on');
            /*
             var group_id = $(this).attr('data-groupid')
             var max = $(this).attr('data-membernum')
             var group_schedule_id = $(this).attr('group-schedule-id')
             get_group_plan_participants(group_schedule_id,'callback',function(jsondata){draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id, max);completeSend();})
             */
        }else if(toggleGroupParticipants == 'on'){
            toggleGroupParticipantsList('off');
        }
    });


    //일정완료 사인용 캔버스
    var pos = {
        drawable : false,
        x: -1,
        y: -1
    };
    $('#popup_text0, #popup_btn_complete').click(function(){
        setTimeout(function(){offset_for_canvas = $('#canvas').offset();},250);
        //$('body').css({'overflow-y':'hidden'})
        //$('#calendar').css({'position':'fixed'})
    });

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext("2d");


    canvas.addEventListener("mousedown",listener);
    canvas.addEventListener("mousemove",listener);
    canvas.addEventListener("mouseup",listener);
    canvas.addEventListener("mouseout",listener);
    canvas.addEventListener("touchstart",listener);
    canvas.addEventListener("touchmove",listener);
    canvas.addEventListener("touchend",listener);
    canvas.addEventListener("touchcancel",listener);

    $("canvas").attr("width", 324).attr("height", 200);
    $(document).on('click','div.classTime, div.plan_raw, div.groupTime, #popup_btn_sign_close',function(){
        ctx.clearRect(0,0,324,300);
        $('#cal_popup').css({'top':'35%'});
    });

    function listener(event){
        var selector_canvas = $('#canvas');
        var selector_pupup_text0_popup_btn_complete =  $('#popup_text0, #popup_btn_sign_complete');
        switch(event.type){
            case "touchstart":
                initDraw(event);
                selector_canvas.css({'border-color':'#fe4e65'});
                selector_pupup_text0_popup_btn_complete.css({'color':'#ffffff','background':'#fe4e65'}).val('filled');
                break;

            case "touchmove":
                if(pos.drawable){
                    draw(event);
                }
                break;
            case "touchend":
            case "touchcancel":
                finishDraw();
                break;

            case "mousedown":
                initDraw(event);
                selector_canvas.css({'border-color':'#fe4e65'});
                selector_pupup_text0_popup_btn_complete.css({'color':'#ffffff','background':'#fe4e65'}).val('filled');
                break;
            case "mousemove":
                if(pos.drawable){
                    draw(event);
                }
                break;
            case "mouseup":
            case "mouseout":
                finishDraw();
                break;

        }
    }

    function initDraw(event){
        ctx.strokeStyle="#FFFFFF";
        ctx.beginPath();
        pos.drawable = true;
        var coors = getPosition(event);
        pos.x = coors.X;
        pos.y = coors.Y;
        ctx.moveTo(pos.x, pos.y);
    }

    function draw(event){
        ctx.strokeStyle="#FFFFFF";
        event.preventDefault();
        var coors = getPosition(event);
        ctx.lineTo(coors.X, coors.Y);
        pos.x = coors.X;
        pos.y = coors.Y;
        ctx.stroke();
    }

    function finishDraw(){
        pos.drawable = false;
        pos.x = -1;
        pos.y = -1;
    }

    function getPosition(event){
        var x;
        var y;
        if(touch_or_mouse=="touch"){
            x = event.touches[0].pageX - offset_for_canvas.left;
            y = event.touches[0].pageY - offset_for_canvas.top;
        }else{
            x = event.pageX - offset_for_canvas.left;
            y = event.pageY - offset_for_canvas.top;
        }
        return {X:x, Y:y};
    }
});



function float_btn_addplan(option){
    if(option == 0){
        if($('#mshade').css('display')=='none'){
            $('#float_inner1').animate({'opacity':'1','bottom':'85px'},120);
            $('#float_inner2').animate({'opacity':'1','bottom':'145px'},120);
            $('#float_btn').addClass('rotate_btn');
            shade_index(100);
        }else{
            $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
            $('#float_btn').removeClass('rotate_btn');
            shade_index(-100);
        }

    }else if(option == 1){
        clear_pt_off_add_popup();
        open_pt_off_add_popup('ptadd');
        ajaxTimeGraphSet(today_YY_MM_DD);
        shade_index(100);
        //scrollToDom($('#calendar'))

    }else if(option == 2){
        clear_pt_off_add_popup();
        open_pt_off_add_popup('offadd');
        //addTypeSelect = "offadd"
        get_repeat_info("");
        ajaxTimeGraphSet(today_YY_MM_DD);
        shade_index(100);
        //scrollToDom($('#calendar'))
    }
}


function open_pt_off_add_popup(option, date){ //option 'ptadd', 'offadd'
    addTypeSelect = option;
    var bodywidth = window.innerWidth;
    var selector_page_addplan = $('#page-addplan');
    var selector_datepicker = $('#datepicker');
    var selector_datepicker_repeat_start = $('#datepicker_repeat_start');

    if(date != undefined){
        selector_datepicker.datepicker('setDate', date);
        selector_datepicker.parent('p').addClass('dropdown_selected');
        selector_datepicker_repeat_start.datepicker('setDate', date);
        selector_datepicker_repeat_start.parent('p').addClass('dropdown_selected');
    }else{
        selector_datepicker.datepicker('setDate', currentYear+'-'+(currentMonth+1)+'-'+currentDate);
        selector_datepicker.parent('p').addClass('dropdown_selected');
        selector_datepicker_repeat_start.datepicker('setDate', currentYear+'-'+(currentMonth+1)+'-'+currentDate);
        selector_datepicker_repeat_start.parent('p').addClass('dropdown_selected');
    }

    if(option == "ptadd"){
        $('#remainCount, #groupInfo, #groupmembersInfo').css('display','none');
        $('#memberName').css('display','block');
        $('#uptext2').text('레슨 일정 등록');
        $('#id_training_date, #id_training_end_date').val(selector_datepicker.val());
        $('#id_repeat_start_date').val(selector_datepicker_repeat_start.val());
        if(bodywidth > 600){
            $('#addpopup_pc_label_pt').show();
            $('#addpopup_pc_label_off').hide();
        }
        $(".pt_memo_guide").css('display','block');
    }else if(option == "offadd"){
        $('#memberName, #remainCount, #groupInfo, #groupmembersInfo').css('display','none');
        $('#uptext2').text('OFF 일정 등록');
        $('#id_training_date_off, #id_training_end_date_off').val(selector_datepicker.val());
        $('#id_repeat_start_date_off').val(selector_datepicker_repeat_start.val());
        if(bodywidth > 600){
            $('#addpopup_pc_label_off').show();
            $('#addpopup_pc_label_pt').hide();
        }
        $(".pt_memo_guide").css('display','none');
    }

    if(bodywidth <= 600){
        $('#page-base, #float_btn, #addpopup_pc_label_pt, #addpopup_pc_label_off').hide();
        $('#page-base-addstyle, #page-addplan').show();
        selector_page_addplan.css('top',50);
        $('#float_inner1, #float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#calendar').css('height','0');
        $('#upbutton-x').attr('data-page','addplan');
    }else{
        selector_page_addplan.css({'display':'block','top':(($(window).height()-selector_page_addplan.outerHeight())/2+$(window).scrollTop()),
            'left':(($(window).width()-selector_page_addplan.outerWidth())/2+$(window).scrollLeft())});
        $('#page-addplan-pc').css('display','none');
        //disable_window_scroll();
    }

    $('#page-addplan #timeGraph').show();

    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder'); //선택된 시간 반짝이
    /*ajaxTimeGraphSet($('#datepicker').val(), function(){
     startTimeSet('class');
     })*/

    /*
     timeGraphSet("class","pink","AddClass", initialJSON);  //시간 테이블 채우기
     timeGraphSet("group","pink","AddClass", initialJSON);
     timeGraphSet("off","grey","AddClass", initialJSON)
     startTimeSet('class');
     */
}

//PT, OFF추가하는 모바일,PC팝업 선택사항을 초기화
function clear_pt_off_add_popup(){
    //핑크체크를 원래대로 검정 체크로 돌린다(모바일)
    $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
    //submitButton 초기화
    $('#submitBtn_pt').removeClass('submitBtnActivated');

    //회원명 비우기
    $("#membersSelected button").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>회원/그룹/클래스 선택</span><img src='/static/user/res/ajax/loading.gif' alt='' class='ajaxloading_dropdown'>").val("");

    //예약가능 횟수 비우기;
    $("#countsSelected, #countsSelected_mini").text("");
    $('#remainCount_mini, #groupInfo_mini').hide();

    //날짜 비우기
    $("#dateSelector p").removeClass("dropdown_selected");

    //Time 그래프 숨기기
    $('#timeGraph').css('display','none');
    //$('.plan_indicators').html('')

    //시작시간, 진행시간 드랍다운 초기화
    $("#starttimesSelected button, #durationsSelected button").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>선택</span>").val("");
    $("#starttimes, #durations").empty();

    //메모 지우기
    $('#scheduleMemo input').val('').text('');

    //모든 하단 핑크선 지우기
    $('#page-addplan .dropdown_selected').removeClass('dropdown_selected');

    //상단 일반-반복 토글 스위치 초기화
    $('.mode_switch_button_wrap_cal div').removeClass('mode_active');
    $('.mode_switch_button_wrap_cal div:first-child').addClass('mode_active');

    //반복일정 요일선택 버튼 초기화
    selectedDayGroup = [];
    $('.dateButton').removeClass('dateButton_selected');

    //반복일정 시작일자, 종료일자 초기화
    $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate',null);

    //반복빈도, 시작시간, 진행시간 드랍다운 초기화
    $('#repeattypeSelected button, #repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>선택</span>");

    //반복일정 접기
    $('._NORMAL_ADD_wrap').css('display','block');
    $('._REPEAT_ADD_wrap').css('display','none');
}

function clear_repeat_add_popup(){
    //반복일정 요일선택 버튼 초기화
    selectedDayGroup = [];
    $('.dateButton').removeClass('dateButton_selected');

    //반복일정 시작일자, 종료일자 초기화
    $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate',null);
    $('#datepicker_repeat_start').parent('p').removeClass('dropdown_selected');
    $('#datepicker_repeat_end').parent('p').removeClass('dropdown_selected');

    //반복빈도, 시작시간, 진행시간 드랍다운 초기화
    $('#repeattypeSelected button, #repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>선택</span>").removeClass('dropdown_selected');
}


function get_current_member_list(use, callback){
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_member_ing_list')
    $.ajax({
        url: '/trainer/get_member_ing_list/',
        dataType : 'html',

        beforeSend:function(){
            //beforeSend(); //ajax 로딩이미지 출력
            $('#membersSelected span, #membersSelected_mini span').hide();
            $('#membersSelected img.ajaxloading_dropdown, #membersSelected_mini img.ajaxloading_dropdown').show();
        },

        success:function(data){
            //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                if(use == "callback"){
                    callback(jsondata);
                }else{
                    set_member_dropdown_list(jsondata);
                }
            }
        },

        complete:function(){
            //completeSend(); //ajax 로딩이미지 숨기기
            $('#membersSelected span, #membersSelected_mini span').show();
            $('#membersSelected img.ajaxloading_dropdown, #membersSelected_mini img.ajaxloading_dropdown').hide();
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
        }
    })
}


function get_current_group_list(use, callback){
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_group_ing_list')
    $.ajax({
        url: '/trainer/get_group_ing_list/',
        dataType : 'html',

        beforeSend:function(){
            //beforeSend(); //ajax 로딩이미지 출력
            $('#membersSelected span, #membersSelected_mini span').hide();
            $('#membersSelected img.ajaxloading_dropdown, #membersSelected_mini img.ajaxloading_dropdown').show();
        },

        success:function(data){
            //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                if(use == "callback"){
                    callback(jsondata);
                }else{
                    set_group_dropdown_list(jsondata);
                }
            }
        },

        complete:function(){
            //completeSend(); //ajax 로딩이미지 숨기기
            $('#membersSelected span, #membersSelected_mini span').show();
            $('#membersSelected img.ajaxloading_dropdown, #membersSelected_mini img.ajaxloading_dropdown').hide();
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
        }
    })
}

function set_member_dropdown_list(jsondata){
    var memberMobileList = $('#members_mobile');
    var memberPcList = $('#members_pc');
    var memberSize = jsondata.db_id.length;
    var member_array_mobile = [];
    var member_array_pc = [];
    if(memberSize>0){
        for(var i=0; i<memberSize; i++){
            if((jsondata.groupInfoArray[i] != "그룹") && (jsondata.groupInfoArray[i] != "클래스") && (jsondata.groupInfoArray[i] != "그룹/클래스")){
                if(jsondata.lesson_avail_count[i] > 0){
                    member_array_mobile.push('<li><a data-grouptype="personal" data-lectureid="'+jsondata.lecture_id[i]+'" data-lecturecount="'+jsondata.lesson_avail_count[i]+'" data-dbid="'+jsondata.db_id[i]+'">'+jsondata.name[i]+'</a></li>');
                    member_array_pc.push('<li><a data-grouptype="personal" data-lectureid="'+jsondata.lecture_id[i]+'" data-lecturecount="'+jsondata.lesson_avail_count[i]+'" data-dbid="'+jsondata.db_id[i]+'">'+jsondata.name[i]+'</a></li>');
                }
            }
        }
    }else if(memberSize == 0){
        member_array_mobile[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;">등록된 회원이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
        member_array_pc[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;">등록된 회원이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
    }
    member_array_mobile.push('<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>')
    var member_arraySum_mobile = member_array_mobile.join('');
    var member_arraySum_pc = member_array_pc.join('');
    memberMobileList.append(member_arraySum_mobile);
    memberPcList.append(member_arraySum_pc);
}

function set_group_dropdown_list(jsondata){
    var memberMobileList = $('#members_mobile');
    var memberPcList = $('#members_pc');
    var memberSize = jsondata.group_id.length;
    var member_array_mobile = ['<div><a data-grouptype="personal" disabled>회원/그룹/클래스 선택</a></div>'];
    var member_array_pc = [];

    if(memberSize>0){
        for(var i=0; i<memberSize; i++){
            member_array_mobile.push('<li><a  data-grouptype="group" data-grouptypecd_nm="'+jsondata.group_type_cd_nm[i]+ '" data-grouptypecd="'+jsondata.group_type_cd[i] +'" data-groupmembernum="'+jsondata.group_member_num[i]+'" data-membernum="'+jsondata.member_num[i]+'" data-groupid="'+jsondata.group_id[i]+'">['+jsondata.group_type_cd_nm[i]+'] '+jsondata.name[i]+'</a></li>');
            member_array_pc.push('<li><a  data-grouptype="group" data-grouptypecd_nm="'+jsondata.group_type_cd_nm[i]+'" data-groupmembernum="'+jsondata.group_member_num[i]+'" data-membernum="'+jsondata.member_num[i]+'" data-groupid="'+jsondata.group_id[i]+'">['+jsondata.group_type_cd_nm[i]+'] '+jsondata.name[i]+'</a></li>');
        }
    }else if(memberSize == 0){
        //member_array_mobile[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;">등록된 그룹이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
        //member_array_pc[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;">등록된 그룹이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
    }
    var member_arraySum_mobile = member_array_mobile.join('');
    var member_arraySum_pc = member_array_pc.join('');
    memberMobileList.prepend(member_arraySum_mobile);
    memberPcList.prepend(member_arraySum_pc);
}





function ajaxRepeatConfirmSend(use, callback){
    ajax_block_during_repeat_confirm = false;
    var serverURL;
    if(addTypeSelect == "repeatgroupptadd"){
        serverURL = '/schedule/add_group_repeat_schedule_confirm/';
    }else{
        serverURL = '/schedule/add_repeat_schedule_confirm/';
    }
    var $form = $('#confirm-repeat-schedule-form');
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts(serverURL)
    $.ajax({
        url: serverURL,
        type:'POST',
        data: $form.serialize(),
        dataType : 'html',

        beforeSend:function(){
            beforeSend(); //ajax 로딩이미지 출력
        },

        success:function(data){
            //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{

                if(jsondata.push_lecture_id.length>0){
                    for(var i=0; i<jsondata.push_lecture_id.length; i++) {
                        send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i]);
                    }
                }
                super_ajaxClassTime();

                if(use == "callback"){
                    callback(jsondata);
                }
            }
        },

        complete:function(){
            completeSend(); //ajax 로딩이미지 숨기기
            ajax_block_during_repeat_confirm = true;
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
        }
    })
}


var ajaxJSON_cache;
function ajaxTimeGraphSet(date, use, callback){
    var today_form = date;
    offAddOkArray = []; //OFF 등록 시작 시간 리스트
    durAddOkArray = []; //OFF 등록 시작시간 선택에 따른 진행시간 리스트
    $('#durations_mini, #durations_mini').html('');
    $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft');
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_trainer_schedule')
    $.ajax({
        url: '/trainer/get_trainer_schedule/',
        type : 'POST',
        data : {"date":today_form, "day":1}, //월간 46 , 주간 18, 하루 1
        dataType : 'html',

        beforeSend:function(){
            beforeSend();
        },

        success:function(data){
            //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                //$('.plan_indicators').html('')
                ajaxJSON_cache = jsondata;
                draw_time_graph(60,'');
                timeGraphSet("class","pink","AddClass", jsondata);  //시간 테이블 채우기
                timeGraphSet("group","pink","AddClass", jsondata);
                timeGraphSet("off","grey","AddClass", jsondata);
                //timeGraphSet("class","pink","mini", jsondata);  //시간 테이블 채우기
                //timeGraphSet("group","pink","mini", jsondata);
                //timeGraphSet("off","grey","mini", jsondata);
                if($('.add_time_unit').hasClass('checked')){
                    startTimeSet('class', jsondata, today_form, 5);
                }else{
                    startTimeSet('class', jsondata, today_form, Options.classDur);
                }
                if(use == "callback"){
                    callback(jsondata);
                }
            }

        },

        complete:function(){
            completeSend();
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
        }
    })
}

function clear_start_dur_dropdown(){
    $('#starttimesSelected button').val('').text('').html("<span style='color:#cccccc;'>선택</span>").removeClass('dropdown_selected');
    $('#durationsSelected button').val('').text('').html("<span style='color:#cccccc;'>선택</span>").removeClass('dropdown_selected');
    $('#durations').html('');
}

function clear_repeat_start_dur_dropdown(){
    //시작시간, 진행시간 드랍다운 초기화
    $('#repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>선택</span>").removeClass('dropdown_selected');
}


function get_repeat_info(dbID){
    var url_;
    var data_;
    var fill_option;
    var type_;
    if(addTypeSelect == "repeatptadd" || addTypeSelect == "ptadd"){
        //var url_ = '/trainer/read_member_lecture_data_from_schedule/'
        url_ = '/trainer/get_member_repeat_schedule/';
        data_ = {"member_id": dbID};
        fill_option = 'class';
        type_ = 'POST';
    }else if(addTypeSelect == "groupptadd" || addTypeSelect == "repeatgroupptadd"){
        url_ = '/trainer/get_group_repeat_schedule_list/';
        data_ = {"group_id": dbID};
        fill_option = 'group';
        type_ = 'POST';
    }else if(addTypeSelect == "offadd" || addTypeSelect == "repeatoffadd"){
        url_ = '/trainer/get_off_repeat_schedule/';
        // data_;
        fill_option = 'off';
        // type_;
    }
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts(url_)
    $.ajax({
        url: url_,
        type: type_,
        data: data_,
        dataType : 'html',

        beforeSend:function(){
            beforeSend(); //ajax 로딩이미지 출력
        },

        success:function(data){
            //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                selectedMemberIdArray = jsondata.memberIdArray;
                selectedMemberAvailCountArray = jsondata.memberAvailCountArray;
                selectedMemberLectureIdArray = jsondata.memberLectureIdArray;
                selectedMemberNameArray = jsondata.memberNameArray;
                fill_repeat_info(dbID, jsondata, fill_option);
            }
        },

        complete:function(){
            completeSend(); //ajax 로딩이미지 숨기기
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
        }
    })
}


function get_member_repeat_id_in_group_repeat(group_repeat_id, use, callback){
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_group_member_repeat_schedule_list')
    $.ajax({
        url: '/trainer/get_group_member_repeat_schedule_list/',
        type : 'POST',
        data : {"group_repeat_schedule_id":group_repeat_id},
        dataType : 'html',

        beforeSend:function(){
            beforeSend();
        },

        success:function(data){
            //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                if(use == "callback"){
                    callback(jsondata);
                }
            }
        },

        complete:function(){
            completeSend();
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
        }
    })
}

function fill_repeat_info(dbID, jsondata, option){ //반복일정 요약 채우기
    var len;
    var dbId;
    var repeat_id_array;
    var repeat_type_array;
    var repeat_day_info_raw_array;
    var repeat_start_array;
    var repeat_end_array;
    var repeat_time_array;
    var repeat_endTime_array;
    var repeat_dur_array;
    var repeat_group_name_array;
    var repeat_group_name;
    var repeat_title_array;
    var repeat_title;

    switch(option){
        case 'class':
            len = jsondata.ptRepeatScheduleIdArray.length;
            dbId = dbID;
            repeat_id_array = jsondata.ptRepeatScheduleIdArray;
            repeat_type_array = jsondata.ptRepeatScheduleTypeArray;
            repeat_day_info_raw_array = jsondata.ptRepeatScheduleWeekInfoArray;
            repeat_start_array = jsondata.ptRepeatScheduleStartDateArray;
            repeat_end_array = jsondata.ptRepeatScheduleEndDateArray;
            repeat_time_array = jsondata.ptRepeatScheduleStartTimeArray;
            repeat_endTime_array = jsondata.ptRepeatScheduleEndTimeArray;
            repeat_dur_array = jsondata.ptRepeatScheduleTimeDurationArray;
            repeat_group_name_array = jsondata.ptRepeatScheduleGroupNameArray;
            repeat_title_array = jsondata.ptRepeatScheduleGroupTypeCdNameArray;
            break;
        case 'off':
            len = jsondata.offRepeatScheduleIdArray.length;
            dbId = "";
            repeat_id_array = jsondata.offRepeatScheduleIdArray;
            repeat_type_array = jsondata.offRepeatScheduleTypeArray;
            repeat_day_info_raw_array = jsondata.offRepeatScheduleWeekInfoArray;
            repeat_start_array = jsondata.offRepeatScheduleStartDateArray;
            repeat_end_array = jsondata.offRepeatScheduleEndDateArray;
            repeat_time_array = jsondata.offRepeatScheduleStartTimeArray;
            repeat_endTime_array = jsondata.offRepeatScheduleEndTimeArray;
            repeat_dur_array = jsondata.offRepeatScheduleTimeDurationArray;
            repeat_group_name_array = [];
            repeat_title_array = "";
            break;
        case 'group':
            len = jsondata.repeatScheduleIdArray.length;
            dbId = "";
            repeat_id_array = jsondata.repeatScheduleIdArray;
            repeat_type_array = jsondata.repeatScheduleTypeArray;
            repeat_day_info_raw_array = jsondata.repeatScheduleWeekInfoArray;
            repeat_start_array = jsondata.repeatScheduleStartDateArray;
            repeat_end_array = jsondata.repeatScheduleEndDateArray;
            repeat_time_array = jsondata.repeatScheduleStartTimeArray;
            repeat_endTime_array = jsondata.repeatScheduleEndTimeArray;
            repeat_dur_array = jsondata.repeatScheduleTimeDurationArray;
            repeat_group_name_array = jsondata.repeatScheduleGroupNameArray;
            repeat_title_array = jsondata.repeatScheduleGroupTypeNameArray;
            break;
    }
    var repeat_info_dict= { 'KOR':
        {'DD':'매일', 'WW':'매주', '2W':'격주',
            'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일'},
        'JPN':
            {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日'},
        'ENG':
            {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat'}
    };
    var schedulesHTML = [];
    for(var i=0; i<len; i++){
        // if(repeat_group_name[i] != 0 && option != "off") {
        if(option != "off"){
            repeat_title = "[" + repeat_title_array[i] + "]";
        }
        // else{
        //     repeat_title = "";
        // }
        if(option == "class") {
            repeat_title += ' ' + repeat_group_name_array[i];
        }
        var repeat_id = repeat_id_array[i];
        var repeat_type = repeat_info_dict['KOR'][repeat_type_array[i]];
        var repeat_start = repeat_start_array[i].replace(/-/gi,".");
        var repeat_start_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복시작 : </span>";
        var repeat_end_text_small = "<span class='summaryInnerBoxText_Repeatendtext_small'>~</span>";
        var repeat_end_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복종료 : </span>";
        var repeat_end = repeat_end_array[i].replace(/-/gi,".");
        var repeat_time = Number(repeat_time_array[i].split(':')[0]); // 06 or 18
        var repeat_min = Number(repeat_time_array[i].split(':')[1]);  // 00 or 30
        if(repeat_min == "30"){
            repeat_time = Number(repeat_time_array[i].split(':')[0])+0.5;
        }

        var repeat_dur = calc_duration_by_start_end(repeat_start_array[i], repeat_time_array[i], repeat_end_array[i], repeat_endTime_array[i]);
        if(repeat_dur - parseInt(repeat_dur) == 0.5){
            if(parseInt(repeat_dur) != 0){
                repeat_dur = parseInt(repeat_dur)+'시간' + ' 30분';
            }else if(parseInt(repeat_dur) == 0){
                repeat_dur = '30분';
            }
        }else{
            repeat_dur = repeat_dur + '시간';
        }

        //var repeat_dur = Number(repeat_dur_array[i])/(60/Options.classDur)
        var repeat_sum = Number(repeat_time) + Number(repeat_dur);


        var repeat_end_time_hour = parseInt(repeat_sum);
        if(parseInt(repeat_sum)<10){
            repeat_end_time_hour = '0'+parseInt(repeat_sum);
        }
        var repeat_end_time_min = '00';
        if((repeat_sum%parseInt(repeat_sum))*60 == 0){
            repeat_end_time_min = '00';
        }else if((repeat_sum%parseInt(repeat_sum))*60 == 30){
            repeat_end_time_min = '30';
        }

        var repeat_start_time = repeat_time_array[i].split(':')[0] +':'+ repeat_time_array[i].split(':')[1];
        var repeat_end_time = repeat_endTime_array[i].split(':')[0] +':'+ repeat_endTime_array[i].split(':')[1];

        var repeat_day =  function(){
            var repeat_day_info_raw = repeat_day_info_raw_array[i].split('/');
            var repeat_day_info = "";
            if(repeat_day_info_raw.length>1){
                for(var j=0; j<repeat_day_info_raw.length; j++){
                    repeat_day_info = repeat_day_info + '/' + repeat_info_dict['KOR'][repeat_day_info_raw[j]].substr(0,1);
                }
            }else if(repeat_day_info_raw.length == 1){
                repeat_day_info = repeat_info_dict['KOR'][repeat_day_info_raw[0]];
            }
            if(repeat_day_info.substr(0,1) == '/'){
                repeat_day_info = repeat_day_info.substr(1,repeat_day_info.length);
            }
            return repeat_day_info;
        };

        var summaryInnerBoxText_1 = '<span class="summaryInnerBoxText">'+'<span style="color:#fe4e65;">'+repeat_title+'</span>'+repeat_type +' '+repeat_day() +' '+repeat_start_time+' ~ '+repeat_end_time+' ('+repeat_dur+')</span>';
        var summaryInnerBoxText_2 = '<span class="summaryInnerBoxText2">'+repeat_start_text+repeat_end_text_small+repeat_start+'</span>';
        var summaryInnerBoxText_3 = '<span class="summaryInnerBoxText3">'+repeat_end_text+repeat_end_text_small+repeat_end+'</span>';
        var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin" data-dbid="'+dbId+'" data-deletetype="'+option+'" data-repeatid="'+repeat_id+'"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>';
        schedulesHTML[i] = '<div class="summaryInnerBox" data-id="'+repeat_id+'">'+summaryInnerBoxText_1+summaryInnerBoxText_2+summaryInnerBoxText_3+deleteButton+'</div>';
    }

    var summaryText = '<span id="summaryText">일정요약</span>';
    if(schedulesHTML.length>0){
        $('#offRepeatSummary').html(summaryText + schedulesHTML.join('')).show();
    }else{
        $('#offRepeatSummary').hide();
    }
}


function popup_repeat_confirm(){ //반복일정을 서버로 보내기 전 확인 팝업을 보여준다.
    var repeat_info_dict= { 'KOR':
        {'DD':'매일', 'WW':'매주', '2W':'격주',
            'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일'},
        'JPN':
            {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日'},
        'ENG':
            {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat'}
    };
    $('#cal_popup_repeatconfirm').css('display','block');
    shade_index(200);
    var $id_repeat_freq ='';
    var $id_repeat_start_date = '';
    var $id_repeat_end_date = '';
    var $id_repeat_day = '';
    if(addTypeSelect == "repeatoffadd"){
        $id_repeat_freq = $('#id_repeat_freq_off');
        $id_repeat_start_date = $('#id_repeat_start_date_off');
        $id_repeat_end_date = $('#id_repeat_end_date_off');
        $id_repeat_day = $('#id_repeat_day_off');
    }else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
        $id_repeat_freq = $('#id_repeat_freq');
        $id_repeat_start_date= $('#id_repeat_start_date');
        $id_repeat_end_date = $('#id_repeat_end_date');
        $id_repeat_day = $('#id_repeat_day');
    }

    var repeat_type = repeat_info_dict['KOR'][$id_repeat_freq.val()];
    var repeat_start = $id_repeat_start_date.val().replace(/-/gi,'.');
    var repeat_end = $id_repeat_end_date.val().replace(/-/gi,'.');
    var repeat_day = function(){
        var repeat_day_info_raw = $id_repeat_day.val().split('/');
        var repeat_day_info = "";
        if(repeat_day_info_raw.length>1){
            for(var j=0; j<repeat_day_info_raw.length; j++){
                repeat_day_info = repeat_day_info + ',' + repeat_info_dict['KOR'][repeat_day_info_raw[j]];
            }
        }else if(repeat_day_info_raw.length == 1){
            repeat_day_info = repeat_info_dict['KOR'][repeat_day_info_raw[0]];
        }
        if(repeat_day_info.substr(0,1) == ','){
            repeat_day_info = repeat_day_info.substr(1,repeat_day_info.length);
        }
        return repeat_day_info;
    };
    var repeat_input_day_info = repeat_type + ' ' + repeat_day();
    var repeat_input_dur_info = repeat_start + ' ~ ' + repeat_end;
    return {
        day_info : repeat_input_day_info,
        dur_info : repeat_input_dur_info
    };
}


function scheduleTime(option, jsondata, size){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
    $('.blankSelected_addview').removeClass('blankSelected blankSelected30');
    $('.blankSelected30').removeClass('blankSelected30');
    $('.blankSelected').removeClass('blankSelected');
    var plan = '';
    var planStartDate = '';
    var planGroupStartDate = '';
    var planEndDate = '';
    var planMemberName = '';
    var planScheduleIdArray = '';
    var planNoteArray = '';
    var planScheduleFinishArray = '';
    var planColor = '';
    var planfinished = '';
    var planMemberNum = '';
    var planMemberDbid = '';
    var planGroupid = '';
    var planCode = '';
    var planGroupClassName = '';
    switch(option){
        case 'class':
            plan = option;
            planStartDate = jsondata.classTimeArray_start_date;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.classTimeArray_end_date;
            planMemberName = jsondata.classTimeArray_member_name;
            planMemberDbid = jsondata.classTimeArray_member_id;
            planScheduleIdArray = jsondata.scheduleIdArray;
            planNoteArray = jsondata.scheduleNoteArray;
            planScheduleFinishArray = jsondata.scheduleFinishArray;
            planColor = 'classTime';
            planfinished = ' classTime_checked';
            planMemberNum = '';
            planGroupid = '';
            planCode = '';
            break;
        case 'off':
            plan = option;
            planGroupid = '';
            planStartDate = jsondata.offTimeArray_start_date;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.offTimeArray_end_date;
            planScheduleIdArray = jsondata.offScheduleIdArray;
            planScheduleFinishArray = '';
            planNoteArray = jsondata.offScheduleNoteArray;
            planColor = 'offTime';
            planMemberNum = '';
            planMemberDbid = '';
            planCode = '';
            break;
        case 'group':

            plan = option;
            planStartDate = jsondata.group_schedule_start_datetime;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.group_schedule_end_datetime;
            planMemberName = jsondata.group_schedule_group_name;
            planGroupid = jsondata.group_schedule_group_id;
            planScheduleIdArray = jsondata.group_schedule_id;
            planNoteArray = jsondata.group_schedule_note;
            planScheduleFinishArray = jsondata.group_schedule_finish_check;
            planColor = 'groupTime';
            planfinished = ' groupTime_checked';
            planMemberNum = jsondata.group_schedule_max_member_num;
            planMemberDbid = '';
            planCode = '';
            planGroupClassName = jsondata.group_schedule_group_type_cd_name;
            break;
    }

    //2018_4_22_8_30_2_OFF_10_30

    var planheight = 60*size;
    var len = planScheduleIdArray.length;
    for(var i=0; i<len; i++){
        //2018-05-11 10:00:00
        var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
        var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
        var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
        var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
        var planMinute  = planStartDate[i].split(' ')[1].split(':')[1];
        var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
        var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
        var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];
        var memberName = 'OFF';
        var hourType = '오전';
        if(plan == 'off'){
            if(planNoteArray[i].length > 0){
                memberName = planNoteArray[i];
            }else{
                memberName = 'OFF';
            }
        }else{
            memberName  = planMemberName[i];
        }

        //24:00일경우 다음날 00:00 으로 들어오기 때문에
        if(planEndDate[i].split(' ')[1] == "00:00:00"){
            var planEndHour = '24'
            var planEndMin = '00'
        }
        //24:00일경우 다음날 00:00 으로 들어오기 때문에

        //일정시작시간이 업무시작시간보다 작고, 종료시간은 업무 시작시간보다 큰 경우//
        if(compare_time(add_time(planHour+':'+planMinute, '00:00'), add_time(Options.workStartTime+':00','00:00')) == false && compare_time(add_time(planEndHour+':'+planEndMin, '00:00'), add_time(Options.workStartTime+':00','00:00')) ){
            planHour = Options.workStartTime;
            planMinute = '00';
        }
        //일정시작시간이 업무시작시간보다 작고, 종료시간은 업무 시작시간보다 큰 경우//

        var planDuraMin = calc_duration_by_start_end_2(planStartDate[i].split(' ')[0], add_time(planHour+':'+planMinute,'00:00'), planEndDate[i].split(' ')[0], add_time(planEndHour+':'+planEndMin,'00:00') )
        var planDura = planDuraMin/60;

        if(planHour < 12){
            hourType = '오전';
        }else{
            if(planHour == 24){
                hourType = '오전';
            }else{
                hourType = '오후';
            }
        }


        var planArray = [planYear, planMonth, planDate, planHour, planMinute, planDura, memberName, planEndHour, planEndMin];
        //var planStartArr = [planYear, planMonth, planDate, planHour, planMinute];
        var timeoffset = '00';
        if(planMinute>=30){
            timeoffset = '30'
        }
        var planStartArr = [planYear, planMonth, planDate, planHour, timeoffset];
        var planStart = planStartArr.join("_");
        var planStartDiv = $("#"+planStart);
        var tdPlanStart = $("#"+planStart+" div");
        var tdPlan = $("#"+planStart);
        tdPlan.parent('div').siblings('.fake_for_blankpage').css('display','none');

        var planColor_ = planColor+planfinished;
        var textcolor = "bluetext";
        var hideornot = 'hideelement';
        if(option != 'off'){
            if(planScheduleFinishArray[i] == 1){
                planColor_ = planColor+planfinished;
            }else{
                planColor_ = planColor;
            }
        }else{
            planColor_ = planColor;
        }

        if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){
            textcolor = "bluetext";
        }else{
            textcolor = "";
        }

        if(Number(planDura*planheight-1) < 29){
            hideornot = 'hideelement';
            var groupstatus=""
        }else if(Number(planDura*planheight-1) < 47){
            hideornot = 'inlineelement';
            var groupstatus=""
        }else{
            hideornot = 'inlineelement';
            var groupstatus = '<span class="groupnumstatus '+textcolor+'">'+'('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span>'
        }

        var planLocation = Number(planArray[4])*size;
        if(timeoffset >=30){
            planLocation = Number(planArray[4])*size-30*size
        }
        var planHeight = Number(planDura*planheight-1);

        //이미 설정한 일정이 업무종료 시간보다 넘어가서 끝날때 끝을 깔끔하게 업무종료시간에 맞춘다.
        if(planStartDiv.length>0){
            var timLocation = planStartDiv.offset().top + planLocation;
            var calBottomLoc = $('.swiper-slide-active').offset().top + $('.swiper-slide-active').height();
            if(timLocation + planHeight > calBottomLoc){
                var planHeight = calBottomLoc - timLocation;
            }
        }
        //이미 설정한 일정이 업무종료 시간보다 넘어가서 끝날때 끝을 깔끔하게 업무종료시간에 맞춘다.


        if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
            if(planStartDiv.find('div['+'class-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                planStartDiv.append('<div class-time="'+planArray.join('_')+
                                       '" class-schedule-id="'+planScheduleIdArray[i]+
                                       '" data-starttime="'+planStartDate[i]+
                                       '" data-groupid="'+planGroupid[i]+
                                       '" data-membernum="'+planMemberNum[i]+
                                       '" data-memo="'+planNoteArray[i]+
                                       '" data-schedule-check="'+planScheduleFinishArray[i]+
                                       '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                       '" data-dbid="'+planMemberDbid[i]+
                                       '" data-memberName="'+memberName+
                                       '" class="'+planColor_+
                                       '" style="height:'+planHeight+'px;'+
                                                 'top:'+planLocation+'px;'+
                                       '">'+
                                            '<span class="memberName '+hideornot+'">'+planCode+memberName+' </span>'+
                                            '<span class="memberTime '+hideornot+'">'+ 
                                                '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+
                                            '</span>'+

                                    '</div>'
                                    )
            }

            
        }else if(option == 'group'){
            if(planStartDiv.find('div['+'group-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                planStartDiv.append('<div group-time="'+planArray.join('_')+
                                       '" group-schedule-id="'+planScheduleIdArray[i]+
                                       '" data-starttime="'+planStartDate[i]+
                                       '" data-groupid="'+planGroupid[i]+
                                       '" data-membernum="'+planMemberNum[i]+
                                       '" data-memo="'+planNoteArray[i]+
                                       '" data-schedule-check="'+planScheduleFinishArray[i]+
                                       '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                       '" data-dbid="'+planMemberDbid[i]+
                                       '" data-memberName="'+memberName+
                                       '" data-group-type-cd-name="'+planGroupClassName[i]+
                                       '" class="'+planColor_+
                                       '" style="height:'+planHeight+'px;'+
                                                 'top:'+planLocation+'px;'+
                                       '">'+
                                            '<span class="memberName '+hideornot+'">'+
                                                    '<p class="groupnametag">'+planCode+memberName+'</p>'+
                                                    groupstatus+
                                                    '</span>'+'<span class="memberTime">'+ 
                                                        '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+
                                            '</span>'+

                                    '</div>'
                                    )
 
            }
        }else if(option == 'off'){
            if(planStartDiv.find('div['+'off-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                planStartDiv.append('<div off-time="'+planArray.join('_')+
                                       '" off-schedule-id="'+planScheduleIdArray[i]+
                                       '" data-starttime="'+planStartDate[i]+
                                       '" data-groupid="'+planGroupid[i]+
                                       '" data-membernum="'+planMemberNum[i]+
                                       '" data-memo="'+planNoteArray[i]+
                                       '" data-schedule-check="'+planScheduleFinishArray[i]+
                                       '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                       '" data-dbid="'+planMemberDbid[i]+
                                       '" data-memberName="'+memberName+
                                       '" class="'+planColor_+
                                       '" style="height:'+planHeight+'px;'+
                                                 'top:'+planLocation+'px;'+
                                       '">'+
                                            '<span class="memberName '+hideornot+'">'+planCode+memberName+' </span>'+
                                            '<span class="memberTime '+hideornot+'">'+ 
                                                '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+
                                            '</span>'+
                                    '</div>'
                                    )
 
            }
        }


        // 미니 팝업 클릭 불가 영역인 _on 클래스를 달력에 추가하기 위한 작업
        var sMinute;
        var eMinute;
        if(planMinute >= 30 && planEndMin >= 30){ // 7:40 ~ 8:40
            sMinute = '30';
            eMinute = planEndMin;
        }else if(planMinute < 30 && planEndMin >= 30){ // 7:15 ~ 8:40
            sMinute = '00';
            eMinute =  planEndMin;
        }else if(planMinute >= 30 && planEndMin < 30 && planEndMin > 0){ // 7:40 ~ 8:15
            sMinute = '30'
            eMinute = '01';
        }else if(planMinute >= 30 && planEndMin < 30 && planEndMin == 0){ // 7:40 ~ 8:15
            sMinute = '30'
            eMinute = '00';
        }else if(planMinute < 30 && planEndMin < 30 && planEndMin > 0){ // 7:15 ~ 8:15
            sMinute = '00'
            eMinute = '01'
        }else if(planMinute < 30 && planEndMin < 30 && planEndMin == 0){ // 7:15 ~ 8:15
            sMinute = '00'
            eMinute = '00'
        }

        var zz = 0;
        var lenn = 0;
        while(add_time(planHour+':'+sMinute, '00:'+zz) != add_time(planEndHour+':'+eMinute, '00:00')){
            if(add_time(planHour+':'+sMinute, '00:'+zz).split(':')[1] == '30' || add_time(planHour+':'+sMinute, '00:'+zz).split(':')[1] == '00'){
                lenn++
            }
            zz++
        }
        

        var hhh = Number(planHour);
        var mmm;
        if(planMinute < 30){
            mmm = '00'
        }else{
            mmm = '30'
        }

        for(var j=0; j<lenn; j++){
            if(mmm == 60){
                hhh = hhh+1;
                mmm = '00';
            }
            $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm).addClass('_on');
            mmm = Number(mmm) + 30;
        }
        // 미니 팝업 클릭 불가 영역인 _on 클래스를 달력에 추가하기 위한 작업
    }
}

/*
function scheduleTime(option, jsondata){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
    $('.blankSelected_addview').removeClass('blankSelected blankSelected30');
    $('.blankSelected30').removeClass('blankSelected30');
    $('.blankSelected').removeClass('blankSelected');
    var plan = '';
    var planStartDate = '';
    var planGroupStartDate = '';
    var planEndDate = '';
    var planMemberName = '';
    var planScheduleIdArray = '';
    var planNoteArray = '';
    var planScheduleFinishArray = '';
    var planColor = '';
    var planfinished = '';
    var planMemberNum = '';
    var planMemberDbid = '';
    var planGroupid = '';
    var planCode = '';
    switch(option){
        case 'class':
            plan = option;
            planStartDate = jsondata.classTimeArray_start_date;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.classTimeArray_end_date;
            planMemberName = jsondata.classTimeArray_member_name;
            planMemberDbid = jsondata.classTimeArray_member_id;
            planScheduleIdArray = jsondata.scheduleIdArray;
            planNoteArray = jsondata.scheduleNoteArray;
            planScheduleFinishArray = jsondata.scheduleFinishArray;
            planColor = 'classTime';
            planfinished = ' classTime_checked';
            planMemberNum = '';
            planGroupid = '';
            planCode = '';
            break;
        case 'off':
            plan = option;
            planGroupid = '';
            planStartDate = jsondata.offTimeArray_start_date;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.offTimeArray_end_date;
            planScheduleIdArray = jsondata.offScheduleIdArray;
            planScheduleFinishArray = '';
            planNoteArray = jsondata.offScheduleNoteArray;
            planColor = 'offTime';
            planMemberNum = '';
            planMemberDbid = '';
            planCode = '';
            console.log('scheduleTime("off")',jsondata);
            break;
        case 'group':

            plan = option;
            planStartDate = jsondata.group_schedule_start_datetime;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.group_schedule_end_datetime;
            planMemberName = jsondata.group_schedule_group_name;
            planGroupid = jsondata.group_schedule_group_id;
            planScheduleIdArray = jsondata.group_schedule_id;
            planNoteArray = jsondata.group_schedule_note;
            planScheduleFinishArray = jsondata.group_schedule_finish_check;
            planColor = 'groupTime';
            planfinished = ' groupTime_checked';
            planMemberNum = jsondata.group_schedule_max_member_num;
            planMemberDbid = '';
            planCode = '';
            break;
    }

    //2018_4_22_8_30_2_OFF_10_30

    var planheight = 60;
    if($calendarWidth>=600){
        planheight = 60;
    }
    var len = planScheduleIdArray.length;
    for(var i=0; i<len; i++){
        //2018-05-11 10:00:00
        var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
        var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
        var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
        var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
        var planMinute  = planStartDate[i].split(' ')[1].split(':')[1];
        var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
        var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
        var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];
        var memberName = 'OFF';
        var planDura = "0.5";
        var hourType = '오전';
        if(plan == 'off'){
            if(planNoteArray[i].length > 0){
                memberName = planNoteArray[i];
            }else{
                memberName = 'OFF';
            }
        }else{
            memberName  = planMemberName[i];
        }


        if(Math.abs(Number(planEndMin) - Number(planMinute)) == 30){  //  01:30 ~ 02:00  01:00 ~ 01:30,,,, 01:00 ~ 05:30, 01:30 ~ 05:00
            if(planEndHour-planHour == 0){
                planDura = "0.5";
            }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == -30 ){
                planDura = String((planEndHour-planHour-1))+'.5';
            }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == 30){
                planDura = String((planEndHour-planHour))+'.5';
            }
        }else{
            planDura = planEndHour - planHour;
        }

        //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
        if(planEDate == planDate+1 && planEndHour==planHour){
            planDura = 24;
        }else if(planEDate == planDate+1 && planEndHour == 0){
            planDura = 24-planHour;
        }else if(planDate == lastDay[planMonth-1] && planEDate == 1 && planEndHour == 0){ //달넘어갈때 -23시 표기되던 문제
            planDura = 24-planHour;
        }

        if(planMinute == '00'){
            if(Options.workStartTime>planHour && planDura > Options.workStartTime - planHour){

                planDura = planDura - (Options.workStartTime - planHour); // 2 - (10 - 8)
                planHour = Options.workStartTime;
                //2018_4_22_8_30_2_OFF_10_30
            }
        }else if(planMinute == '30'){
            //(10>8)  (2>=10-8)
            if(Options.workStartTime>planHour && planDura >= Options.workStartTime - planHour){

                planDura = planDura - (Options.workStartTime - planHour)+0.5; // 2 - (10 - 8)
                planHour = Options.workStartTime;
                planMinute = '00';
                //2018_4_22_8_30_2_OFF_10_30
            }
        }


        if(planHour < 12){
            hourType = '오전';
        }else{
            if(planHour == 24){
                hourType = '오전';
            }else{
                hourType = '오후';
            }
        }

        var planArray = [planYear, planMonth, planDate, planHour, planMinute, planDura, memberName, planEndHour, planEndMin];
        var planStartArr = [planYear, planMonth, planDate, planHour, planMinute];
        var planStart = planStartArr.join("_");
        var tdPlanStart = $("#"+planStart+" div");
        var tdPlan = $("#"+planStart);
        tdPlan.parent('div').siblings('.fake_for_blankpage').css('display','none');

        var planColor_ = planColor+planfinished;
        var textcolor = "bluetext";
        var hideornot = 'hideelement';
        if(option != 'off'){
            if(planScheduleFinishArray[i] == 1){
                planColor_ = planColor+planfinished;
            }else{
                planColor_ = planColor;
            }
        }else{
            planColor_ = planColor;
        }

        if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){
            textcolor = "bluetext";
        }else{
            textcolor = "";
        }

        if(Number(planDura*planheight-1) < 59){
            hideornot = 'hideelement';
        }else{
            hideornot = 'inlineelement';
        }



        if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
            tdPlanStart.attr(option + '-time' , planArray.join('_')) //planArray 2018_5_25_10_00_1_스노우_11_00
                .attr(option+'-schedule-id' , planScheduleIdArray[i])
                .attr({'data-starttime':planStartDate[i], 'data-groupid':planGroupid[i],'data-membernum':planMemberNum[i], 'data-memo' : planNoteArray[i],
                    'data-schedule-check' : planScheduleFinishArray[i], 'data-lectureId' : jsondata.classArray_lecture_id[i], 'data-dbid' : planMemberDbid[i], 'data-memberName' : memberName, })
                .addClass(planColor_)
                .css({'height':Number(planDura*planheight-1)+'px'})
                .html('<span class="memberName">'+planCode+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>');
        }else if(option == 'group'){
            tdPlanStart.attr(option + '-time' , planArray.join('_')) //planArray 2018_5_25_10_00_1_스노우_11_00
                .attr(option+'-schedule-id' , planScheduleIdArray[i])
                .attr({'data-starttime':planStartDate[i], 'data-groupid':planGroupid[i],'data-membernum':planMemberNum[i],'data-memo' : planNoteArray[i],
                    'data-schedule-check' : planScheduleFinishArray[i], 'data-lectureId' : jsondata.classArray_lecture_id[i], 'data-dbid' : planMemberDbid[i], 'data-memberName' : memberName, })
                .addClass(planColor_)
                .css({'height':Number(planDura*planheight-1)+'px'})
                .html('<span class="memberName">'+'<p class="groupnametag">'+planCode+memberName+'</p>'+'<span class="groupnumstatus '+textcolor+' '+hideornot+'">('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span>'+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>');
        }else if(option == 'off'){
            tdPlanStart.attr(option + '-time' , planArray.join('_')) //planArray 2018_5_25_10_00_1_스노우_11_00
                .attr(option+'-schedule-id' , planScheduleIdArray[i])
                .attr({'data-starttime':planStartDate[i], 'data-groupid':planGroupid[i],'data-membernum':planMemberNum[i],'data-memo' : planNoteArray[i],
                    'data-schedule-check' : planScheduleFinishArray[i], 'data-lectureId' : jsondata.classArray_lecture_id[i], 'data-dbid' : planMemberDbid[i], 'data-memberName' : memberName, })
                .addClass(planColor_)
                .css({'height':Number(planDura*planheight-1)+'px'})
                .html('<span class="memberName">'+planCode+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>');
        }


        var hhh = Number(planHour);
        var mmm = planMinute;

        for(var j=0; j<planDura/0.5; j++){
            if(mmm == 60){
                hhh = hhh + 1;
                mmm = '00';
            }
            $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm).addClass('_on');
            mmm = Number(mmm) + 30;
        }

    }
}*/

function scheduleTime_Mobile(option, jsondata, size){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
    var plan = '';
    var planStartDate = '';
    var planGroupStartDate = '';
    var planEndDate = '';
    var planMemberName = '';
    var planScheduleIdArray = '';
    var planNoteArray = '';
    var planScheduleFinishArray = '';
    var planColor = '';
    var planfinished = '';
    var planMemberNum = '';
    var planMemberDbid = '';
    var planGroupid = '';
    var planCode = '';
    var planGroupClassName = '';
    switch(option){
        case 'class':
            plan = option;
            planStartDate = jsondata.classTimeArray_start_date;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.classTimeArray_end_date;
            planMemberName = jsondata.classTimeArray_member_name;
            planMemberDbid = jsondata.classTimeArray_member_id;
            planScheduleIdArray = jsondata.scheduleIdArray;
            planNoteArray = jsondata.scheduleNoteArray;
            planScheduleFinishArray = jsondata.scheduleFinishArray;
            planColor = 'classTime';
            planfinished = ' classTime_checked';
            planMemberNum = '';
            planGroupid = '';
            planCode = '';
            break;
        case 'off':
            plan = option;
            planGroupid = '';
            planStartDate = jsondata.offTimeArray_start_date;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.offTimeArray_end_date;
            planScheduleIdArray = jsondata.offScheduleIdArray;
            planScheduleFinishArray = '';
            planNoteArray = jsondata.offScheduleNoteArray;
            planColor = 'offTime';
            planMemberNum = '';
            planMemberDbid = '';
            planCode = '';
            break;
        case 'group':

            plan = option;
            planStartDate = jsondata.group_schedule_start_datetime;
            planGroupStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.group_schedule_end_datetime;
            planMemberName = jsondata.group_schedule_group_name;
            planGroupid = jsondata.group_schedule_group_id;
            planScheduleIdArray = jsondata.group_schedule_id;
            planNoteArray = jsondata.group_schedule_note;
            planScheduleFinishArray = jsondata.group_schedule_finish_check;
            planColor = 'groupTime';
            planfinished = ' groupTime_checked';
            planMemberNum = jsondata.group_schedule_max_member_num;
            planMemberDbid = '';
            planCode = '';
            planGroupClassName = jsondata.group_schedule_group_type_cd_name;
            break;
    }

    //2018_4_22_8_30_2_OFF_10_30

    var planheight = 60*size;
    var len = planScheduleIdArray.length;

    var date_sorted = {};

    for(var j=0; j<len; j++){
        var planYear    = Number(planStartDate[j].split(' ')[0].split('-')[0]);
        var planMonth   = Number(planStartDate[j].split(' ')[0].split('-')[1]);
        var planDate    = Number(planStartDate[j].split(' ')[0].split('-')[2]);
        date_sorted[planYear+'_'+planMonth+'_'+planDate] = []
    }

    for(var i=0; i<len; i++){
        //2018-05-11 10:00:00
        var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
        var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
        var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
        var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
        var planMinute  = planStartDate[i].split(' ')[1].split(':')[1];
        var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
        var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
        var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];
        var memberName = 'OFF';
        var planDura = "0.5";
        var hourType = '오전';
        if(plan == 'off'){
            if(planNoteArray[i].length > 0){
                memberName = planNoteArray[i];
            }else{
                memberName = 'OFF';
            }
        }else{
            memberName  = planMemberName[i];
        }

        //24:00일경우 다음날 00:00 으로 들어오기 때문에
        if(planEndDate[i].split(' ')[1] == "00:00:00"){
            var planEndHour = '24'
            var planEndMin = '00'
        }
        //24:00일경우 다음날 00:00 으로 들어오기 때문에


        if(compare_time(add_time(planHour+':'+planMinute, '00:00'), add_time(Options.workStartTime+':00','00:00')) == false && compare_time(add_time(planEndHour+':'+planEndMin, '00:00'), add_time(Options.workStartTime+':00','00:00')) ){
            planHour = Options.workStartTime;
            planMinute = '00';
        }

        var planDuraMin = calc_duration_by_start_end_2(planStartDate[i].split(' ')[0], add_time(planHour+':'+planMinute,'00:00'), planEndDate[i].split(' ')[0], add_time(planEndHour+':'+planEndMin,'00:00') )
        var planDura = planDuraMin/60;



        if(planHour < 12){
            hourType = '오전';
        }else{
            if(planHour == 24){
                hourType = '오전';
            }else{
                hourType = '오후';
            }
        }

        var planArray = [planYear, planMonth, planDate, planHour, planMinute, planDura, memberName, planEndHour, planEndMin];
        var planStartArr = [planYear, planMonth, planDate];
        var planStart = planStartArr.join("_");
        var tdPlanStart = $("#"+planStart+" div"); //2018_7_8
        var tdPlan = $("#"+planStart);
        //tdPlan.parent('div').siblings('.fake_for_blankpage').css('display','none');

        var planColor_ = planColor+planfinished;
        var textcolor = "bluetext";
        var hideornot = 'hideelement';
        if(option != 'off'){
            if(planScheduleFinishArray[i] == 1){
                planColor_ = planColor+planfinished;
            }else{
                planColor_ = planColor;
            }
        }else{
            planColor_ = planColor;
        }

        if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){
            textcolor = "bluetext";
        }else{
            textcolor = "";
        }

        if(Number(planDura*planheight-1) < 29){
            hideornot = 'hideelement';
            var groupstatus=""
        }else if(Number(planDura*planheight-1) < 47){
            hideornot = 'inlineelement';
            var groupstatus=""
        }else{
            hideornot = 'inlineelement';
            var groupstatus = '<span class="groupnumstatus '+textcolor+'">'+'('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span>'
        }


        var planLocation = (60*(planHour-Options.workStartTime)+60*planMinute/60)*size;

        if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
            var innerNameTag = '<span class="memberName '+hideornot+'">'+planCode+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>'
            planhtml = '<div class-time="'+planArray.join('_')+
                        '" class-schedule-id="'+planScheduleIdArray[i]+
                        '" data-starttime="'+planStartDate[i]+
                        '" data-groupid="'+planGroupid[i]+
                        '" data-membernum="'+planMemberNum[i]+
                        '" data-memo="'+planNoteArray[i]+
                        '" data-schedule-check="'+planScheduleFinishArray[i]+
                        '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                        '" data-dbid="'+planMemberDbid[i]+
                        '" data-memberName="'+memberName+
                        '" class="'+planColor_+
                        '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+
                        '">'+
                            innerNameTag+
                       '</div>'
            date_sorted[planStart].push(planhtml)
        }else if(option == 'group'){
            var innerNameTag = '<span class="memberName '+hideornot+'">'+'<p class="groupnametag">'+planCode+memberName+'</p>'+groupstatus+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>';
            planhtml = '<div group-time="'+planArray.join('_')+
                        '" group-schedule-id="'+planScheduleIdArray[i]+
                        '" data-starttime="'+planStartDate[i]+
                        '" data-groupid="'+planGroupid[i]+
                        '" data-membernum="'+planMemberNum[i]+
                        '" data-memo="'+planNoteArray[i]+
                        '" data-schedule-check="'+planScheduleFinishArray[i]+
                        '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                        '" data-dbid="'+planMemberDbid[i]+
                        '" data-memberName="'+memberName+
                        '" data-group-type-cd-name="'+planGroupClassName[i]+
                        '" class="'+planColor_+
                        '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+
                        '">'+
                            innerNameTag+
                       '</div>'
            date_sorted[planStart].push(planhtml)
        }else if(option == 'off'){
            var innerNameTag = '<span class="memberName '+hideornot+'">'+planCode+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>';
            planhtml = '<div off-time="'+planArray.join('_')+
                        '" off-schedule-id="'+planScheduleIdArray[i]+
                        '" data-starttime="'+planStartDate[i]+
                        '" data-groupid="'+planGroupid[i]+
                        '" data-membernum="'+planMemberNum[i]+
                        '" data-memo="'+planNoteArray[i]+
                        '" data-schedule-check="'+planScheduleFinishArray[i]+
                        '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                        '" data-dbid="'+planMemberDbid[i]+
                        '" data-memberName="'+memberName+
                        '" class="'+planColor_+
                        '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+planLocation+'px;'+
                        '">'+
                            innerNameTag+
                       '</div>'
            date_sorted[planStart].push(planhtml)
        }

        /*
        var hhh = Number(planHour);
        var mmm = planMinute;

        for(var j=0; j<planDura/0.5; j++){
            if(mmm == 60){
                hhh = hhh + 1;
                mmm = '00';
            }
            $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm).addClass('_on');
            mmm = Number(mmm) + 30;
        }
        */
    }
    for(date in date_sorted){
        $('#'+date).append(date_sorted[date].join(''))
    }
}



function closeAddPopup(){
    //$('body').css('overflow-y','overlay');
    $('#page-addplan').hide('fast','swing');
    if(bodywidth<=600){
        $('#float_btn').fadeIn('fast').removeClass('rotate_btn');
        $('#page-base').show();
        $('#page-base-addstyle').hide();
    }
}

function closeAddPopup_mini(){
    $('#page-addplan-pc').hide();
    clear_pt_off_add_popup_mini();
}

function clear_pt_off_add_popup_mini(){
    //핑크 버튼 활성화 초기화
    $('#submitBtn_mini').css('background','#282828');

    //진행시간 선택 핑크 하단선 초기화
    $('#classDuration_mini #durationsSelected button').removeClass('dropdown_selected').html("<span style='color:#cccccc;'>선택</span>").val("");

    //회원 선택 핑크 하단선 초기화
    $("#membersSelected button, #membersSelected_mini button").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>회원/그룹/클래스 선택</span><img src='/static/user/res/ajax/loading.gif' alt='' class='ajaxloading_dropdown'>").val("");

    //예약가능 횟수 내용 초기화
    $("#countsSelected,.countsSelected").text("");
    $('#remainCount_mini, #groupInfo_mini').hide();

    //메모 초기화
    $('#addmemo_mini input').val('').text('');

    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
    select_all_check=false;
}

/*
function startTimeArraySet(option){ //offAddOkArray 채우기 : 시작시간 리스트 채우기
    switch(option){
        case "class" :
            option = "";
            break;
        case "mini" :
            option = "_mini";
            break;
    }
    offAddOkArray = [];
    var i;
    var selector_g_00_option;
    var selector_g_30_option;
    if(Options.classDur == 60){
        for(i=Options.workStartTime;i<Options.workEndTime;i++){
            selector_g_00_option = $('#'+i+'g_00'+option);
            selector_g_30_option = $('#'+i+'g_30'+option);
            if(!selector_g_00_option.hasClass('pinktimegraph') == true && !selector_g_00_option.hasClass('greytimegraph') == true && !selector_g_00_option.hasClass('pinktimegraph_pinkleft') == true && !selector_g_00_option.hasClass('greytimegraph_greyleft') == true){
                if(selector_g_30_option.hasClass('pinktimegraph') == true || selector_g_30_option.hasClass('greytimegraph') == true || selector_g_30_option.hasClass('pinktimegraph_pinkleft') == true || selector_g_30_option.hasClass('greytimegraph_greyleft') == true){

                }else{
                    offAddOkArray.push(i);
                }

            }
            if(!selector_g_30_option.hasClass('pinktimegraph') == true && !selector_g_30_option.hasClass('greytimegraph') == true && !selector_g_30_option.hasClass('pinktimegraph_pinkleft') == true && !selector_g_30_option.hasClass('greytimegraph_greyleft') == true){
                if(i != (Options.workEndTime)-1 && (!selector_g_00_option.hasClass('pinktimegraph') == true && !selector_g_00_option.hasClass('greytimegraph') == true && !selector_g_00_option.hasClass('pinktimegraph_pinkleft') == true && !selector_g_00_option.hasClass('greytimegraph_greyleft') == true)){
                    offAddOkArray.push(i+0.5);
                }else{

                }
            }
        }
    }else if(Options.classDur == 30){
        for(i=Options.workStartTime;i<Options.workEndTime;i++){
            selector_g_00_option = $('#'+i+'g_00'+option);
            selector_g_30_option = $('#'+i+'g_30'+option);
            if(!selector_g_00_option.hasClass('pinktimegraph') == true && !selector_g_00_option.hasClass('greytimegraph') == true && !selector_g_00_option.hasClass('pinktimegraph_pinkleft') == true && !selector_g_00_option.hasClass('greytimegraph_greyleft') == true){
                offAddOkArray.push(i);
            }
            if(!selector_g_30_option.hasClass('pinktimegraph') == true && !selector_g_30_option.hasClass('greytimegraph') == true && !selector_g_30_option.hasClass('pinktimegraph_pinkleft') == true && !selector_g_30_option.hasClass('greytimegraph_greyleft') == true){
                offAddOkArray.push(i+0.5);
            }
        }
    }
}
*/


$('.add_time_unit').click(function(){
    clear_start_dur_dropdown();
    var $child = $(this).find('div')
    if($(this).hasClass('checked')){
        $(this).removeClass('checked');
        $child.removeClass('ptersCheckboxInner_sm');
        ajaxTimeGraphSet($('#datepicker').val());
    }else{
        $(this).addClass('checked');
        $child.addClass('ptersCheckboxInner_sm');
        ajaxTimeGraphSet($('#datepicker').val());
    }
})


function startTimeArraySet(selecteddate, jsondata, Timeunit){ //offAddOkArray 채우기 : 시작시간 리스트 채우기!!!!
    switch(option){
        case "class" :
            var option = ""
            break;
        case "mini" :
            var option = "_mini"
            break;
    }
    var plan_starttime = {};
    var plan_endtime = {};
    for(var i=0; i<jsondata.classTimeArray_start_date.length; i++){
        if(jsondata.classTimeArray_start_date[i].split(' ')[0] == selecteddate){
            plan_starttime[jsondata.classTimeArray_start_date[i].split(' ')[1]] = ""
        }
        if(jsondata.classTimeArray_end_date[i].split(' ')[0] == selecteddate && jsondata.classTimeArray_end_date[i].split(' ')[1] != "00:00:00"){
            plan_endtime[jsondata.classTimeArray_end_date[i].split(' ')[1]] = ""
        }else if(jsondata.classTimeArray_end_date[i].split(' ')[0] == date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(selecteddate,1),'-') && jsondata.classTimeArray_end_date[i].split(' ')[1] == "00:00:00"){
            plan_endtime['24:00:00'] = ""
        }
    }
    for(var j=0; j<jsondata.group_schedule_start_datetime.length; j++){
        if(jsondata.group_schedule_start_datetime[j].split(' ')[0] == selecteddate){
            plan_starttime[jsondata.group_schedule_start_datetime[j].split(' ')[1]] = ""
        }
        if(jsondata.group_schedule_end_datetime[j].split(' ')[0] == selecteddate && jsondata.group_schedule_end_datetime[j].split(' ')[1] != "00:00:00" ){
            plan_endtime[jsondata.group_schedule_end_datetime[j].split(' ')[1]] = ""
        }else if(jsondata.group_schedule_end_datetime[j].split(' ')[0] == date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(selecteddate,1),'-') && jsondata.group_schedule_end_datetime[j].split(' ')[1] == "00:00:00"){
            plan_endtime['24:00:00'] = ""
        }
    }
    for(var j=0; j<jsondata.offTimeArray_start_date.length; j++){
        if(jsondata.offTimeArray_start_date[j].split(' ')[0] == selecteddate){
            plan_starttime[jsondata.offTimeArray_start_date[j].split(' ')[1]] = ""
        }
        if(jsondata.offTimeArray_end_date[j].split(' ')[0] == selecteddate && jsondata.offTimeArray_end_date[j].split(' ')[1] != "00:00:00" ){
            plan_endtime[jsondata.offTimeArray_end_date[j].split(' ')[1]] = ""
        }else if(jsondata.offTimeArray_end_date[j].split(' ')[0] == date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(selecteddate,1),'-') && jsondata.offTimeArray_end_date[j].split(' ')[1] == "00:00:00"){
            plan_endtime['24:00:00'] = ""
        }
    }

    var plan_time = [];
    var plan_stime = [];
    var plan_etime = [];


    for(starttime in  plan_starttime){
        plan_time.push(starttime.split(':')[0]+':'+starttime.split(':')[1])
    }
    for(endtime in plan_endtime){
        plan_time.push(endtime.split(':')[0]+':'+endtime.split(':')[1])
    }

    var workStartTime_ = time_h_m_to_hh_mm(worktime.split('-')[0]);
    var workEndTime_ = time_h_m_to_hh_mm(worktime.split('-')[1]);
    if(workEndTime_ == "23:59"){
        workEndTime_ = "24:00"
    }

    plan_time.push(workEndTime_)
    plan_time.unshift(workStartTime_)

    //var sortedlist = plan_time.sort(function(a,b){return a-b;})
    var sortedlist = plan_time.sort();
    //all_plans = sortedlist;
    //index 사이 1-2, 3-4, 5-6, 7-8, 9-10, 11-12, 13-14
    var semiresult = []
    for(var p=0; p<sortedlist.length/2; p++){
        var zz = 0;
        //일정 시작시간이 일정 종료시간보다 작으면,
        if(compare_time(add_time(sortedlist[p*2],'0:'+Number(zz+Timeunit)), add_time(sortedlist[p*2+1],'0:00')) ==false && 
            compare_time( add_time(sortedlist[p*2],'0:'+Number(zz+Timeunit)), add_time(workEndTime_ ,'00:00')) == false  ){
            while(add_time(sortedlist[p*2],'0:'+Number(zz+Timeunit)) != add_time(sortedlist[p*2+1],'0:01')){
                semiresult.push(add_time(sortedlist[p*2],'0:'+zz))
                zz++
                if(zz>1450){ //하루 24시간 --> 1440분
                    break;
                }
            }

        }
    }
    

    //offAddOkArray = []
    if(Timeunit == 60){
        Timeunit = 30;
    }

    var addOkArrayList = [];
    for(var t=0; t<semiresult.length; t++){
        //if(Number(semiresult[t].split(':')[1])%Timeunit == 0){  //몇분 간격으로 시작시간을 보여줄 것인지?
        if(selecteddate == currentDate){                                                                   //선택한 날짜가 오늘일 경우 
            if(compare_time(semiresult[t], add_time(Options.workEndTime+':00', '00:00')) == false           //업무시간
                && compare_time(semiresult[t], add_time(Options.workStartTime+':00', '00:00')) ){              
                if(Number(semiresult[t].split(':')[1])%Timeunit == 0){                                          //몇분 간격으로 시작시간을 보여줄 것인지?
                    addOkArrayList.push(semiresult[t])
                }
            }
        }else{                                                                                     //선택한 날짜가 오늘이 아닐경우
            if(compare_time(semiresult[t], add_time(Options.workEndTime+':00', '00:00')) == false 
                && compare_time(add_time(Options.workStartTime+':00', '00:00'),semiresult[t]) == false){        //업무시간
                if(Number(semiresult[t].split(':')[1])%Timeunit == 0){                                          //몇분 간격으로 시작시간을 보여줄 것인지?
                    addOkArrayList.push(semiresult[t])
                }
            }
        }
    }

    allplans = sortedlist
    return {"addOkArray":addOkArrayList, "allplans":sortedlist}
}





var allplans = [];
function startTimeSet(option, jsondata, selecteddate, Timeunit){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21]
    var sArraySet =  startTimeArraySet(selecteddate, jsondata, Timeunit); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
    var addOkArray = sArraySet.addOkArray;
    var options = "";
    switch(option){
        case "class":
            options = "";
            break;
        case "mini":
            options = "_mini";
            break;
    }

    var text1 = '오전 ';
    var text2 = '오후 ';
    var text3 = '시';

    if(Options.language == "JPN"){
        text1 = '午前 ';
        text2 = '午後 ';
        text3 = '時';
    }else if(Options.language == "ENG"){
        text1 = 'AM ';
        text2 = 'PM ';
        text3 = ':00';
    }

    //offAddOkArray =  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12.5, 13, 14, 18.5, 20, 21, 22, 23]
    var offOkLen = addOkArray.length;
    var startTimeList = $('#starttimes'+options);
    var timeArray = ['<div><a class="pointerList">시작 시각 선택</a></div>'];
    for(var i=0; i<offOkLen; i++){
        var offHour = addOkArray[i].split(':')[0];
        var offmin = addOkArray[i].split(':')[1];
        var offText = text1; //오전
        var offHours = offHour;
        if(offHour<12){
            offText = text1; //오전
            offHours = offHour;
        }else if(offHour==24){
            offText = text1;
            offHours = offHour-12;
        }else if(offHour==12 || offHour==12.5){
            offText = text2;//오후
            offHours = offHour;
        }else{
            offHours = offHour-12;
            offText = text2;
        }

        timeArray.push('<li><a data-trainingtime="'+addOkArray[i]+'" class="pointerList">'+offText+offHour+':'+offmin+'</a></li>');
    }
    timeArray[offOkLen+1]='<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>';
    var timeArraySum = timeArray.join('');
    startTimeList.html(timeArraySum);
}

/*
function timeGraphSet(option, CSStheme, Page, jsondata){ //가능 시간 그래프 채우기
    //1. option인자 : "class", "off"
    //2. CSS테마인자 : "grey", "pink"
    var planStartDate = '';
    var planEndDate = '';
    var planMemberName = '';
    var planScheduleIdArray = '';
    var planNoteArray = '';
    var cssClass = '';
    var cssClass_border = '';
    var datepicker = '';
    switch(option){
        case "class" :
            planStartDate = jsondata.classTimeArray_start_date;
            planEndDate = jsondata.classTimeArray_end_date;
            planMemberName = jsondata.classTimeArray_member_name;
            planScheduleIdArray = jsondata.scheduleIdArray;
            planNoteArray = jsondata.scheduleNoteArray;
            //$('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
            break;
        case "group" :
            planStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.group_schedule_end_datetime;
            planMemberName = jsondata.group_schedule_group_name;
            planScheduleIdArray = jsondata.group_schedule_id;
            planNoteArray = jsondata.group_schedule_note;
            //$('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
            break;
        case "off" :
            planStartDate = jsondata.offTimeArray_start_date;
            planEndDate = jsondata.offTimeArray_end_date;
            planScheduleIdArray = jsondata.offScheduleIdArray;
            planNoteArray = jsondata.offScheduleNoteArray;
            break;
    }

    switch(CSStheme){
        case "grey" :
            cssClass = "greytimegraph";
            cssClass_border = "greytimegraph_greyleft";
            break;
        case "pink" :
            cssClass= "pinktimegraph";
            cssClass_border= "pinktimegraph_pinkleft";
            break;
    }

    switch(Page){
        case "mini" :
            datepicker = $('#datetext_mini');
            option = "_mini";
            break;
        case "AddClass" :
            datepicker = $("#datepicker");
            option = "";
            break;
    }


    var date = datepicker.val();
    var Arraylength = planScheduleIdArray.length;
    for(var i=0;i<Arraylength;i++){
        var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
        var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
        var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
        var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
        var planMinute  = planStartDate[i].split(' ')[1].split(':')[1];
        var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
        var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
        var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];
        var planDura = "0.5";
        if(planHour == 24){
            planHour = 0;
        }
        if(Math.abs(Number(planEndMin) - Number(planMinute)) == 30){  //  01:30 ~ 02:00  01:00 ~ 01:30,,,, 01:00 ~ 05:30, 01:30 ~ 05:00
            if(planEndHour-planHour == 0){
                planDura = "0.5";
            }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == -30 ){
                planDura = String((planEndHour-planHour-1))+'.5';
            }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == 30){
                planDura = String((planEndHour-planHour))+'.5';
            }
        }else{
            planDura = planEndHour - planHour;
        }

        //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
        if(planEDate == planDate+1 && planEndHour==planHour){
            planDura = 24;
        }else if(planEDate == planDate+1 && planEndHour == 0){
            planDura = 24-planHour;
        }else if(planDate == lastDay[planMonth-1] && planEDate == 1 && planEndHour == 0){ //달넘어갈때 -23시 표기되던 문제
            planDura = 24-planHour;
        }

        if(planMinute == '00'){
            if(Options.workStartTime>planHour && planDura > Options.workStartTime - planHour){

                planDura = planDura - (Options.workStartTime - planHour); // 2 - (10 - 8)
                planHour = Options.workStartTime;
                //2018_4_22_8_30_2_OFF_10_30
            }
        }else if(planMinute == '30'){
            //(10>8)  (2>=10-8)
            if(Options.workStartTime>planHour && planDura >= Options.workStartTime - planHour){

                planDura = planDura - (Options.workStartTime - planHour)+0.5; // 2 - (10 - 8)
                planHour = Options.workStartTime;
                planMinute = '00';
                //2018_4_22_8_30_2_OFF_10_30
            }
        }
        if(date_format_yyyy_m_d_to_yyyy_mm_dd(planYear+'-'+planMonth+'-'+planDate,'-') == date && planDura>0){ //수업시간이 0.5 단위일때
            var length = parseInt(planDura);
            if(length == 0){
                length = 1;
            }
            //for(var j=0; j<length; j++){  // 1_30_1.5
            var time = Number(planHour);
            var min = planMinute;
            for(var k=0; k<planDura/0.5; k++){
                if(min == 60){
                    min = '00';
                    time = time +1;
                }
                if(k==0){
                    $('#'+(time)+'g_'+min+option).addClass(cssClass);
                }else{
                    $('#'+(time)+'g_'+min+option).addClass(cssClass_border);
                }

                min = Number(min)+30;
            }
        }
    }


    //업무시간 설정 수업시간 30분 단위일때
    var j = 0;
    var t = Options.workEndTime;
    if(Options.hourunit == 30){
        for(j=0; j<Options.workStartTime; j++){
            $('#'+j+'g_00'+option).addClass('greytimegraph');
            $('#'+j+'g_30'+option).addClass('greytimegraph');
        }


        for(t=Options.workEndTime; t<24; t++){
            $('#'+t+'g_00'+option).addClass('greytimegraph');
            $('#'+t+'g_30'+option).addClass('greytimegraph');
        }
    }else{
        //업무시간 설정
        for(j=0; j<Options.workStartTime; j++){
            $('#'+j+'g'+option).addClass('greytimegraph');
        }
        for(t=Options.workEndTime; t<24; t++){
            $('#'+t+'g'+option).addClass('greytimegraph');
        }
        //업무시간 설정
    }

        //업무시간 설정

    //timeGraphLimitSet(Options.limit)
}*/

/*
function draw_time_graph(option, type){  //type = '' and mini

    var targetHTML =  '';
    var types = '';
    if(type == 'mini'){
        targetHTML =  $('#timeGraph.ptaddbox_mini table');
        types = "_mini"
    }else{
        targetHTML =  $('#timeGraph._NORMAL_ADD_timegraph .timegraphtext');
        types = ''
    }

    var tablewidth = $('.timegraphtext').width()-10;
    //var tdwidth = (tablewidth/((Options.workEndTime-Options.workStartTime)*2))-1
    //var tdwidth_ = (tablewidth/((Options.workEndTime-Options.workStartTime)))-2.5

    var tdwidth = (tablewidth/(Options.workEndTime-Options.workStartTime));
    var tdwidth_ = (tablewidth/(Options.workEndTime-Options.workStartTime));


    var tr1 = [];
    var tr2 = [];
    var i=Options.workStartTime;
    if(option == "30"){
        for(i; i<Options.workEndTime; i++){
            tr1[i] = '<div colspan="2" style="width:'+tdwidth_+'px" class="colspan">'+(i)+'</div>';
            tr2[i] = '<div id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00" style="width:'+tdwidth+'px;"></div><div id="'+(i)+'g_30'+types+'" class="tdgraph_'+option+' tdgraph30" style="width:'+tdwidth+'px;"></div>';
        }
    }else if(option == "60"){
        for(i; i<Options.workEndTime; i++){
            tr1[i] = '<div style="width:'+tdwidth+'px;" class="colspan">'+(i)+'</div>';
            tr2[i] = '<div id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00" style="width:'+tdwidth+'px;"></div>';
        }
    }
    var tbody = '<div>'+tr1.join('')+'</div><div class="timegraph_display">'+tr2.join('');
    targetHTML.html(tbody);
}
*/

function draw_time_graph(option, type){  //type = '' and mini

    var targetHTML =  '';
    var types = '';
    if(type == 'mini'){
        targetHTML =  $('#timeGraph.ptaddbox_mini table');
        types = "_mini"
    }else{
        targetHTML =  $('#timeGraph._NORMAL_ADD_timegraph .timegraphtext');
        types = ''
    }


    var tdwidth = (100/(Options.workEndTime-Options.workStartTime));
    var tdwidth_ = (100/(Options.workEndTime-Options.workStartTime));

    var tr1 = [];
    var tr2 = [];
    var i=Options.workStartTime;
    if(option == "30"){
        for(i; i<Options.workEndTime; i++){
            tr1[i] = '<div colspan="2" style="width:'+tdwidth_+'%" class="colspan">'+(i)+'</div>';
            tr2[i] = '<div id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00" style="width:'+tdwidth+'%;"></div><div id="'+(i)+'g_30'+types+'" class="tdgraph_'+option+' tdgraph30" style="width:'+tdwidth+'px;"></div>';
        }
    }else if(option == "60"){
        for(i; i<Options.workEndTime; i++){
            tr1[i] = '<div style="width:'+tdwidth+'%;" class="colspan">'+(i)+'</div>';
            tr2[i] = '<div id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00" style="width:'+tdwidth+'%;"></div>';
        }
    }
    var tbody = '<div>'+tr1.join('')+'</div><div class="timegraph_display">'+tr2.join('');
    targetHTML.html(tbody);
}

function timeGraphSet(option, CSStheme, Page, jsondata){ //가능 시간 그래프 채우기
    
    //1. option인자 : "class", "off"
    //2. CSS테마인자 : "grey", "pink"
    var planStartDate = '';
    var planEndDate = '';
    var planMemberName = '';
    var planScheduleIdArray = '';
    var planNoteArray = '';
    var cssClass = '';
    var cssClass_border = '';
    var datepicker = '';
    var type = option;
    switch(option){
        case "class" :
            planStartDate = jsondata.classTimeArray_start_date;
            planEndDate = jsondata.classTimeArray_end_date;
            planMemberName = jsondata.classTimeArray_member_name;
            planScheduleIdArray = jsondata.scheduleIdArray;
            planNoteArray = jsondata.scheduleNoteArray;
            //$('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
            break;
        case "group" :
            planStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.group_schedule_end_datetime;
            planMemberName = jsondata.group_schedule_group_name;
            planScheduleIdArray = jsondata.group_schedule_id;
            planNoteArray = jsondata.group_schedule_note;
            //$('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
            break;
        case "off" :
            planStartDate = jsondata.offTimeArray_start_date;
            planEndDate = jsondata.offTimeArray_end_date;
            planScheduleIdArray = jsondata.offScheduleIdArray;
            planNoteArray = jsondata.offScheduleNoteArray;
            break;
    }

    switch(CSStheme){
        case "grey" :
            cssClass = "timegraph_plans_grey";
            break;
        case "pink" :
            cssClass= "timegraph_plans_pink";
            break;
    }

    switch(Page){
        case "mini" :
            datepicker = $('#datetext_mini');
            option = "_mini";
            break;
        case "AddClass" :
            datepicker = $("#datepicker");
            option = "";
            break;
    }

 
    var date = datepicker.val();
    var Arraylength = planScheduleIdArray.length;
    //var $tableTarget    = $('#timeGraph div.plan_indicators');
    var $tableTarget    = $('#timeGraph div.timegraph_display');
    var workstart = Options.workStartTime;
    
    var htmlToJoin = [];

    var date = $('#datepicker').val();
    for(var i=0;i<Arraylength;i++){
        var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
        var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
        var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
        var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
        var planMinute  = Number(planStartDate[i].split(' ')[1].split(':')[1]);
        var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
        var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
        var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];

        if(add_date(planEndDate[i].split(' ')[0],0) == add_date(planStartDate[i].split(' ')[0],1) 
            && planEndDate[i].split(' ')[1] == "00:00:00" ){
            var planEndHour = "24";
            var planEndMin = '00'
        }

        var timegraph_hourwidth;
        var timegraph_houroffset;
        var timegraph_houroffsetb;
        var timegraph_hourendwidth;
        var timegraph_hourendoffset;

        var work_start = add_time(Options.workStartTime+':00','00:00');
        var work_end = add_time(Options.workEndTime+':00','00:00');
        var plan_start = add_time(planHour+':'+planMinute,'00:00');
        var plan_end = add_time(planEndHour+':'+planEndMin,'00:00');
        // 업무시간내 위치하지 않아서(넘어가서) 보이지 않는 일정들에 대한 처리
        if(compare_time(plan_start, work_start) == false        //시작시간이 업무시간과 같거나 전에 있고, 종료시간이 업무종료시간과 같거나 업무시간 내에 위치
          && compare_time(plan_end, work_start) 
          && compare_time(plan_end, work_end) ==false)
        { 
            timegraph_hourwidth = $('#'+Options.workStartTime+'g_00').width();
            timegraph_houroffset = $('#'+Options.workStartTime+'g_00').position().left + timegraph_hourwidth*(planMinute/60);
            timegraph_houroffsetb = $('#'+Options.workStartTime+'g_00').position().top;
            if(planEndHour == Options.workEndTime){
                var planEndHour = Options.workEndTime -1;
                var planEndMin = 60;
            }else{
                var planEndHour = planEndHour;
            }

            timegraph_hourendwidth = $('#'+planEndHour+'g_00').width();
            timegraph_hourendoffset = $('#'+planEndHour+'g_00').position().left + timegraph_hourendwidth*(planEndMin/60);

        }else if(compare_time(plan_start, work_start) == false  //시작시간이 업무시간 전에 있고, 종료시간도 업무시간 전
               && compare_time(plan_end, work_start) == false ){
            continue;

        }else if(compare_time(plan_start, work_start)           //시작시간이 업무시간내에 있고, 종료시간이 업무시간 밖에 위치
               && compare_time(plan_start, work_end) == false
               && compare_time(work_end, plan_end) == false){
            
            timegraph_hourwidth = $('#'+planHour+'g_00').width();
            timegraph_houroffset = $('#'+planHour+'g_00').position().left + timegraph_hourwidth*(planMinute/60);
            timegraph_houroffsetb = $('#'+planHour+'g_00').position().top;
            timegraph_hourendwidth = $('#'+(Options.workEndTime-1)+'g_00').width();
            timegraph_hourendoffset = $('#'+(Options.workEndTime-1)+'g_00').position().left + timegraph_hourendwidth;

        }else if( compare_time(plan_start, work_end) == false   // 시작시간이 업무시간 전에 있고, 종료시간이 업무시간 밖에 위치
               && compare_time(plan_end, work_end)){
            
            timegraph_hourwidth = $('#'+Options.workStartTime+'g_00').width();
            timegraph_houroffset = $('#'+Options.workStartTime+'g_00').position().left + timegraph_hourwidth*(planMinute/60);
            timegraph_houroffsetb = $('#'+Options.workStartTime+'g_00').position().top;
            timegraph_hourendwidth = $('#'+(Options.workEndTime-1)+'g_00').width();
            timegraph_hourendoffset = $('#'+(Options.workEndTime-1)+'g_00').position().left + timegraph_hourendwidth;

        }else if( compare_time(plan_start, work_end)            // 시작시간이 업무종료 후에 있고, 종료시간이 업무시간 후에 위치
               && compare_time(plan_end, work_end) ){

        }else{                                                   //시작시간과 종료시간 모두 업무시간에 위치
            timegraph_hourwidth = $('#'+planHour+'g_00').width();
            timegraph_houroffset = $('#'+planHour+'g_00').position().left + timegraph_hourwidth*(planMinute/60);
            timegraph_houroffsetb = $('#'+planHour+'g_00').position().top;
            timegraph_hourendwidth = $('#'+planEndHour+'g_00').width();
            timegraph_hourendoffset = $('#'+planEndHour+'g_00').position().left + timegraph_hourendwidth*(planEndMin/60);
        }
        // 업무시간내 위치하지 않아서(넘어가서) 보이지 않는 일정들에 대한 처리



        if(date_format_yyyy_m_d_to_yyyy_mm_dd(planYear+'-'+planMonth+'-'+planDate,'-') == date){
            //var planDura    = calc_duration_by_start_end_2(planStartDate[i].split(' ')[0], planStartDate[i].split(' ')[1], planEndDate[i].split(' ')[0], planEndDate[i].split(' ')[1])
            var planWidth   = timegraph_hourendoffset - timegraph_houroffset;
            var planLoc     = timegraph_houroffset;

            if(type=="class" && jsondata.group_schedule_start_datetime.indexOf(planStartDate[i]) >= 0){
                
            }else{
                htmlToJoin.push('<div class="'+cssClass+'" style="width:'+planWidth+'px;left:'+planLoc+'px;top:'+timegraph_houroffsetb+'px;" data-type="'+type+'" data-typeg="'+Page+'"></div>')
            }
        }
    }
    $tableTarget.append(htmlToJoin.join(''))
}


function durTimeSet(selectedTime,selectedMin,option, Timeunit){ // durAddOkArray 채우기 : 진행 시간 리스트 채우기
    var durTimeList;
    var options;
    switch(option){
        case "class" :
            durTimeList = $('#durations');
            options = "";
            break;
        case "off" :
            durTimeList = $('#durations_off');
            options = "";
            break;
        case "mini" :
            durTimeList = $('#durations_mini');
            options = "_mini";
            break;
    }
    if(selectedTime.length < 2){
        selectedTime = '0'+selectedTime;
    }
    if(selectedMin.length < 2){
        selectedMin = '0' + selectedMin;
    }

    var plansArray=[];
    for(var j=0; j<allplans.length;j++){
        plansArray.push(allplans[j])
    };

    if(plansArray.indexOf(selectedTime+':'+selectedMin) == -1){
        plansArray.push(selectedTime+':'+selectedMin);
    }
    var sortedlist = plansArray.sort();
    var index = sortedlist.indexOf(selectedTime+':'+selectedMin);

    var zz = 0
    durTimeList.html('');

    while(add_time(selectedTime+':'+selectedMin, '00:0'+zz) != sortedlist[index+1]){
        zz++
        if(zz%Timeunit == 0){ //진행시간을 몇분 단위로 표기할 것인지?
            durTimeList.append('<li><a data-dur="'+zz/Options.classDur+'" data-durmin="'+zz+'" data-endtime="'+add_time(selectedTime+':'+selectedMin, '00:0'+zz)+'" class="pointerList">'+duration_number_to_hangul_minute(zz)+'  (~ '+add_time(selectedTime+':'+selectedMin, '00:0'+zz)+')'+'</a></li>')
        }
    }
    
    durTimeList.prepend('<div><a class="pointerList">진행시간 선택</a></div>')
    durTimeList.append('<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>');
}

/*
function send_Data(serializeArray){
    var today_form;
    var selector_calendar = $('#calendar');
    if(selector_calendar.hasClass('_calmonth')){
        var yyyy = $('#yearText').text().replace(/년/gi,"");
        var mm = $('#monthText').text().replace(/월/gi,"");
        if(mm.length<2){
            mm = '0' + mm;
        }
        today_form = yyyy+'-'+ mm +'-'+"01";
    }else if(selector_calendar.hasClass('_calweek')){
        var $weekNum4 = $('#weekNum_4').attr('data-date');
        today_form = $weekNum4.substr(0,4)+'-'+$weekNum4.substr(4,2)+'-'+$weekNum4.substr(6,2);
    }else if(selector_calendar.hasClass('._calday')){

    }
    serializeArray.push({"name":"date", "value":today_form});
    serializeArray.push({"name":"day", "value":46});
    // var sendData = serializeArray;
    return serializeArray;
}
*/



/*
function addGraphIndicator(datadur){
    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
    var starttext = $('#starttimesSelected button').val().split(' ');  //오후 11:30
    var daymorning = starttext[0];
    var starthour = starttext[1].split(':')[0];
    var startmin = starttext[1].split(':')[1];
    var start;
    if(startmin == "30"){
        start = Number(starthour)+0.5;
    }else if(startmin == "00"){
        start = Number(starthour);
    }

    if(daymorning=='오후'||daymorning=='午後'||daymorning=='PM'){
        if(starthour==12){
            // starthour = starthour;
        }else{
            starthour = Number(starthour)+12;
        }
    }else if((daymorning=='오전'||daymorning=='午前'||daymorning=='AM' )&& starthour==12){
        starthour = Number(starthour)+12;
    }

    var min = startmin;
    var time = Number(starthour);
    var i=0;
    if(Options.classDur == 30){
        for(i=0; i<datadur; i++){
            if(min == 60){
                min = '00';
                time = time +1;
            }
            if(i==starthour){
                $('#'+time+'g_'+min).addClass('graphindicator_leftborder');
            }else{
                $('#'+time+'g_'+min).addClass('graphindicator_leftborder');
            }
            min = Number(min)+30;
        }
    }else if(Options.classDur == 60){
        for(i=0; i<datadur; i++){
            if(min == 60){
                min = '00';
                time = time +1;
            }
            if(i==starthour){
                $('#'+time+'g_'+min).addClass('graphindicator_leftborder');
            }else{
                $('#'+time+'g_'+min).addClass('graphindicator_leftborder');
            }
            min = Number(min)+30;
        }
    }

}*/

function addGraphIndicator(durmin){
    if($('.timegraph_display .selectedplan_indi').length == 0){
        $('.timegraph_display').append('<div class="selectedplan_indi"></div>')
    }else{

    }
    
    var starttext = $('#starttimesSelected button').val().split(' ');  //오후 11:30
    var daymorning = starttext[0];
    var planHour = Number(starttext[1].split(':')[0]);
    var planMinute = Number(starttext[1].split(':')[1]);
    var planend = add_time(planHour+':'+planMinute, '00:'+durmin);
    var planEndHour = Number(planend.split(':')[0]);
    var planEndMin  = Number(planend.split(':')[1]);
    var planDura = durmin;
    var workstart = Options.workStartTime;
    

    var timegraph_hourwidth = $('#'+planHour+'g_00').width();
    var timegraph_houroffset = $('#'+planHour+'g_00').position().left + timegraph_hourwidth*(planMinute/60);
    var timegraph_houroffsetb = $('#'+planHour+'g_00').position().top;

    var timegraph_hourendwidth;
    var timegraph_hourendoffset;

    if(planEndHour == Options.workEndTime){
        timegraph_hourendwidth = $('#'+(planEndHour-1)+'g_00').width();
        timegraph_hourendoffset = $('#'+(planEndHour-1)+'g_00').position().left + timegraph_hourendwidth;
    }else{
        timegraph_hourendwidth = $('#'+planEndHour+'g_00').width();
        timegraph_hourendoffset = $('#'+planEndHour+'g_00').position().left + timegraph_hourendwidth*(planEndMin/60);
    }



    var planWidth   = timegraph_hourendoffset - timegraph_houroffset;
    var planLoc     = timegraph_houroffset;

    $('.selectedplan_indi').css({'top':timegraph_houroffsetb,'left':planLoc,'width':planWidth});
}

function timeGraphLimitSet(limit){ //현재시간 이전시간, 강사가 설정한 근접 예약 불가 시간 설정
    var selecteddate = datepicker.val();
    var date = new Date();
    var yy = date.getFullYear();
    var mm = String(date.getMonth()+1);
    var dd = String(date.getDate());
    if(mm.length<2){
        mm = '0'+mm;
    }
    if(dd.length<2){
        dd = '0'+dd;
    }
    var hh = date.getHours();
    var today = yy+'-'+mm+'-'+dd;
    if(selecteddate==today){
        for(var i=0;i<=23;i++){
            var time = $('#'+i+'g');
            if(i<=hh+limit){
                time.addClass('greytimegraph');
            }
        }
    }
}

function scrollToIndicator(dom){
    var offset = dom.offset();
    $('body, html').animate({scrollTop : offset.top-180},700);
}


function send_push_func(lecture_id, title, message){

    $.ajax({
        url: '/schedule/send_push_to_trainee/',
        type : 'POST',
        dataType: 'html',
        data : {"lecture_id":lecture_id, "title":title, "message":message, "next_page":'/trainer/get_error_info/'},

        beforeSend:function(){
            beforeSend();
        },

        success:function(response){
            console.log(response);
        },

        complete:function(){
            completeSend();
        },

        error:function(){
            console.log('server error');
        }
    })
}


//그룹..

$(document).on('click','img.add_groupmember_plan',function(){
    $('#form_add_member_group_plan_scheduleid').val($(this).attr('group-schedule-id'));
    $('#form_add_member_group_plan_groupid').val($(this).attr('data-groupid')) ;
    $('#form_add_member_group_plan_max').val($(this).attr('data-membernum')) ;
    $('#subpopup_addByList_plan').show();
    get_current_member_list('callback',function(jsondata){draw_groupParticipantsList_to_add(jsondata, $('#subpopup_addByList_whole'))});//전체회원 조회
    get_groupmember_list($(this).attr('data-groupid'), 'callback', function(jsondata){draw_groupParticipantsList_to_add(jsondata, $('#subpopup_addByList_thisgroup'))});//특정그룹회원 목록 조회
});

$(document).on('click','#subpopup_addByList_plan .listTitle_addByList span',function(){
    $('#subpopup_addByList_plan').hide();
});


//그룹 일정에 속한 회원목록을 받아온다.
function get_group_plan_participants(group_schedule_id, callbackoption , callback){
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_group_member_schedule_list')
    $.ajax({
        url: '/trainer/get_group_member_schedule_list/',
        type : 'POST',
        dataType: 'html',
        data: {"group_schedule_id": group_schedule_id},

        beforeSend:function(){
            beforeSend();
        },

        success:function(data){
            //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER);
            var jsondata = JSON.parse(data);

            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }
            else{
                if(callbackoption == "callback"){
                    callback(jsondata);
                }
            }
        },

        complete:function(){
            //completeSend()
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
        }
    })
}
//그룹 일정에 속한 회원목록을 받아온다.

//그룹에 일정에 속한 회원목록을 그린다. get_group_plan_participants와 같이 쓴다.
function draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id ,max){
    var target = $('#groupParticipants');
    var htmlToJoin = [];
    var jsonlen = jsondata.db_id.length;
    var jsondata_db_id = jsondata.db_id;
    var jsondata_scheduleIdArray = jsondata.scheduleIdArray;
    var jsondata_classArray_lecture_id = jsondata.classArray_lecture_id;
    var jsondata_scheduleFinishArray = jsondata.scheduleFinishArray;
    var jsondata_sexArray = jsondata.sexArray;


    for(var i=0; i<jsonlen; i++){
        var htmlstart = '<div class="groupParticipantsRow" data-dbid="'+jsondata_db_id[i]+'" schedule-id="'+jsondata_scheduleIdArray[i]+'" data-leid="'+jsondata_classArray_lecture_id[i]+'">';
        //var sex = '<img src="/static/user/res/member/icon-sex-'+jsondata.sex[i]+'.png">'
        var finishcheck = jsondata_scheduleFinishArray[i];
        var finish = '';
        if(finishcheck == 1){
            finish = '(완료)';
        }else if(finishcheck == 0){
            finish = '';
        }
        var sex = '<img src="/static/user/res/member/icon-sex-'+jsondata_sexArray[i]+'.png">';
        var name = '<span data-dbid="'+jsondata_db_id[i]+'">'+jsondata.name[i]+finish+'</span>';
        var xbutton = '<img src="/static/user/res/member/icon-x-red.png" class="group_member_cancel" data-dbid="'+jsondata_db_id[i]+'" group-schedule-id="'+group_schedule_id+'" data-groupid="'+group_id+'" data-max="'+max+'" schedule-id="'+jsondata_scheduleIdArray[i]+'">';
        var htmlend = '</div>';
        htmlToJoin.push(htmlstart+sex+name+xbutton+htmlend);
    }
    if(jsonlen < max){
        htmlToJoin.push('<div style="margin-top:10px;margin-bottom:10px;"><img src="/static/user/res/floatbtn/btn-plus.png" class="add_groupmember_plan" group-schedule-id="'+group_schedule_id+'" data-groupid="'+group_id+'" data-membernum="'+max+'"></div>');
    }
    target.html(htmlToJoin.join(''));
}
//그룹에 일정에 속한 회원목록을 그린다. get_group_plan_participants와 같이 쓴다.


//참석자에서 + 버튼을 눌렀을때 회원 리스트 불러오기
function draw_groupParticipantsList_to_add(jsondata, targetHTML){
    var len = jsondata.db_id.length;
    var htmlToJoin = ['<div class="list_addByList listTitle_addByList" style="border-color:#ffffff;text-align:center;">내 리스트에서 추가<span>닫기</span></div>'+'<div class="list_addByList listTitle_addByList"><div>'+'회원명(ID)'+'</div>'+'<div>'+'연락처'+'</div>'+'<div>추가</div>'+'</div>'];
    var addedCount = 0;
    for(var i=1; i<=len; i++){
        if($('#groupParticipants div.groupParticipantsRow[data-dbid="'+jsondata.db_id[i-1]+'"]').length == 0){
            addedCount++;
            var sexInfo = '<img src="/static/user/res/member/icon-sex-'+jsondata.sex[i-1]+'.png">';
            htmlToJoin[i] = '<div class="list_addByList" data-lastname="'+jsondata.last_name[i-1]+
                '" data-firstname="'+jsondata.first_name[i-1]+
                '" data-dbid="'+jsondata.db_id[i-1]+
                '" data-id="'+jsondata.member_id[i-1]+
                '" data-sex="'+jsondata.sex[i-1]+
                '" data-phone="'+jsondata.phone[i-1]+
                '"><div data-dbid="'+jsondata.db_id[i-1]+'">'+
                //sexInfo+jsondata.name[i-1]+' (ID: '+jsondata.member_id[i-1]+')'+'</div>'+
                sexInfo+jsondata.name[i-1]+'</div>'+
                '<div>'+jsondata.phone[i-1]+'</div>'+'<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>';
        }
    }
    if(len == 0){
        htmlToJoin.push("<div class='list_addByList' style='margin-top:30px;margin-bottom:30px;border:0'>그룹에 소속된 회원이 없습니다.</div>");
    }
    if(addedCount == 0){
        htmlToJoin.push("<div class='list_addByList' style='margin-top:30px;margin-bottom:30px;border:0'>추가 가능한  회원이 없습니다.</div>");
    }

    var html = htmlToJoin.join('');
    targetHTML.html(html);
}
//참석자에서 + 버튼을 눌렀을때 회원 리스트 불러오기

//일정 등록시 그룹 선택시 그룹원 정보를 보여준다.
function draw_groupMemberList_to_view(jsondata, targetHTML){
    var len = jsondata.db_id.length;
    var htmlToJoin = ['<div class="list_viewByList listTitle_viewByList"><div style="padding-left:20px;">'+'회원명'+'</div>'+'<div>'+'예약 가능'+'</div>'+'<div>남은 횟수</div>'+'</div>'];
    var addedCount = 0;
    for(var i=1; i<=len; i++){
        if($('#groupParticipants div.groupParticipantsRow[data-dbid="'+jsondata.db_id[i-1]+'"]').length == 0){
            addedCount++;
            var sexInfo = '<img src="/static/user/res/member/icon-sex-'+jsondata.sex[i-1]+'.png">';
            htmlToJoin[i] = '<div class="list_viewByList" data-lastname="'+jsondata.last_name[i-1]+
                '" data-firstname="'+jsondata.first_name[i-1]+
                '" data-dbid="'+jsondata.db_id[i-1]+
                '" data-id="'+jsondata.member_id[i-1]+
                '" data-sex="'+jsondata.sex[i-1]+
                '" data-phone="'+jsondata.phone[i-1]+
                '"><div data-dbid="'+jsondata.db_id[i-1]+'">'+
                //sexInfo+jsondata.name[i-1]+' (ID: '+jsondata.member_id[i-1]+')'+'</div>'+
                sexInfo+jsondata.name[i-1]+'</div>'+
                '<div>'+jsondata.avail_count[i-1]+'</div>'+
                '<div>'+jsondata.rem_count[i-1]+'</div>'+
                '</div>';
        }
    }
    if(len == 0){
        htmlToJoin.push("<div class='list_viewByList' style='margin-top:30px;margin-bottom:30px;border:0'>그룹에 소속된 회원이 없습니다.</div>");
    }
    if(addedCount == 0){
        htmlToJoin.push("<div class='list_viewByList' style='margin-top:30px;margin-bottom:30px;border:0'>추가 가능한  회원이 없습니다.</div>");
    }
    htmlToJoin.push("<div style='text-align:center;'><img src='/static/user/res/PTERS_logo_pure.png' style='width:50px;margin-top:3px;opacity:0.3;'></div>")
    var html = htmlToJoin.join('');
    targetHTML.html(html);
}
//일정 등록시 그룹 선택시 그룹원 정보를 보여준다.


//[리스트에서 추가]를 눌러 나온 팝업의 리스트에서 + 버튼을 누르면 회원 추가란으로 해당회원을 보낸다.
//그룹일정에 참석자 추가 img.add_listedMember(플러스버튼)을 누르면 호출된다.
function send_add_groupmember_plan(use, callback){
    //var $form = $('#add_groupmember-plan-form').serializeArray();
    //var sendData = send_Data($form);
    var sendData = $('#add_groupmember-plan-form').serializeArray();
    
    $.ajax({
        url: '/schedule/add_member_group_schedule/',
        type : 'POST',
        dataType: 'html',
        data: sendData,

        beforeSend:function(){
            beforeSend();
        },

        success:function(data){
            //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                if(jsondata.push_lecture_id.length>0){
                    for(var i=0; i<jsondata.push_lecture_id.length; i++) {
                        send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i]);
                    }
                }
                if(use == 'callback'){
                    callback(jsondata);
                }else{
                    if(bodywidth>600){
                        scheduleTime('class', jsondata, calendarSize);
                        scheduleTime('off', jsondata, calendarSize);
                        scheduleTime('group', jsondata, calendarSize);
                    }else{
                        scheduleTime_Mobile('class', jsondata, calendarSize);
                        scheduleTime_Mobile('off', jsondata, calendarSize);
                        scheduleTime_Mobile('group', jsondata, calendarSize);
                    }
                    get_group_plan_participants(sendData[2]["value"],'callback', function(d){draw_groupParticipantsList_to_popup(d, sendData[5]["value"], sendData[2]["value"], sendData[6]["value"])});
                    alert('그룹일정 참석자 정상 등록되었습니다.');
                }
            }
        },

        complete:function(){
            completeSend();
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
        }
    });
};


$(document).on('click','.group_member_cancel',function(){
    $('#id_schedule_id').val($(this).attr('schedule-id'));
    $('#id_member_dbid_delete').val($(this).attr('data-dbid'));
    var group_id = $(this).attr('data-groupid');
    var group_schedule_id = $(this).attr('group-schedule-id');
    var max = $(this).attr('data-max');
    send_plan_delete('pt', 'callback', function(){
        super_ajaxClassTime();

        if($('._calmonth').length > 0){
            shade_index(150);
        }else if($('._calweek').length > 0){
            shade_index(100);
        };
        get_group_plan_participants(group_schedule_id,'callback',function(jsondata){
            draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id, max);
        });
    });
});



function send_plan_delete(option, callbackoption, callback){
    var $form;
    var serializeArray;
    var sendData;
    var url_;
    if(option == "pt"){
        $form = $('#daily-pt-delete-form');
        serializeArray = $form.serializeArray();
        //sendData = send_Data(serializeArray);
        url_ = '/schedule/delete_schedule/';
    }else if(option == "off"){
        $form = $('#daily-off-delete-form');
        serializeArray = $form.serializeArray();
        //sendData = send_Data(serializeArray);
        url_ = '/schedule/delete_schedule/';
    }else if(option == "group"){
        $form = $('#daily-pt-delete-form');
        $('#id_schedule_id').val($('#cal_popup_plandelete').attr('schedule-id'));
        serializeArray = $form.serializeArray();
        //sendData = send_Data(serializeArray);
        url_ = '/schedule/delete_group_schedule/';
    }
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts(url_)
    $.ajax({
        url: url_,
        type:'POST',
        data: serializeArray,//sendData,

        beforeSend:function(){
            beforeSend();
        },

        //통신성공시 처리
        success:function(data){
            //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                if(jsondata.push_lecture_id.length>0){
                    for(var i=0; i<jsondata.push_lecture_id.length; i++) {
                        send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i]);
                    }
                }
                if(callbackoption == 'callback'){
                    super_ajaxClassTime();
                    // set_schedule_time(jsondata)
                    close_info_popup('cal_popup_plandelete');
                    if($('._calmonth').length == 1){
                        shade_index(100);
                    }else if($('._calweek').length == 1){
                        shade_index(-100);
                    }
                    callback(jsondata);
                }else{
                    super_ajaxClassTime();
                    // set_schedule_time(jsondata)
                    close_info_popup('cal_popup_plandelete');
                    if($('._calmonth').length == 1){
                        shade_index(100);
                    }else if($('._calweek').length == 1){
                        shade_index(-100);
                    }
                    //completeSend();
                }

            }
        },

        //보내기후 팝업창 닫기
        complete:function(){

        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
        }
    })
}


function check_dropdown_selected_addplan(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
    var memberSelect = $("#membersSelected button");
    var memberSelect_mini = $('#membersSelected_mini button');
    var dateSelect = $("#dateSelector p");
    var durSelect = $("#durationsSelected button");
    var durSelect_mini = $('#classDuration_mini #durationsSelected button');
    var startSelect = $("#starttimesSelected button")

    var repeatSelect = $("#repeattypeSelected button");
    var startSelect_repeat = $('#repeatstarttimesSelected button');
    var durSelect_repeat = $('#repeatdurationsSelected button');
    var dateSelect_repeat_start = $("#datepicker_repeat_start").parent('p');
    var dateSelect_repeat_end = $("#datepicker_repeat_end").parent('p');

    if(addTypeSelect == "ptadd"){

        if($('#page-addplan-pc').css('display')!='block' && (memberSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated');
            select_all_check=true;
        }else if($('#page-addplan-pc').css('display')=='block' && (memberSelect_mini).hasClass("dropdown_selected")==true && $('#countsSelected_mini').text() != 0 && durSelect_mini.hasClass("dropdown_selected")==true){
            $('#submitBtn_mini').css('background','#fe4e65');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated');
            $('#submitBtn_mini').css('background','#282828');
            select_all_check=false;
        }
    }else if(addTypeSelect == "groupptadd"){
        if((memberSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated');
            select_all_check=true;
        }else if($('#page-addplan-pc').css('display')=='block' && (memberSelect_mini).hasClass("dropdown_selected")==true && durSelect_mini.hasClass("dropdown_selected")==true){
            $('#submitBtn_mini').css('background','#fe4e65');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated');
            $('#submitBtn_mini').css('background','#282828');
            select_all_check=false;
        }
    }else if(addTypeSelect == "offadd"){
        if($('#page-addplan-pc').css('display')!='block' && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true && (startSelect).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated');
            select_all_check=true;
        }else if($('#page-addplan-pc').css('display')=='block' && durSelect_mini.hasClass("dropdown_selected")==true){
            $('#submitBtn_mini').css('background','#fe4e65');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#submitBtn_mini').css('background','#282828');
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated');
            select_all_check=false;
        }
    }else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
        if((memberSelect).hasClass("dropdown_selected")==true && (repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#submitBtn_mini').css('background','#282828');
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated');
            select_all_check=false;
        }
    }else if(addTypeSelect == "repeatoffadd"){
        if((repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#submitBtn_mini').css('background','#282828');
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated');
            select_all_check=false;
        };
    };
};



function super_ajaxClassTime(){
    var selector_calendar = $('#calendar');
    if(selector_calendar.hasClass('_calmonth')){
        ajaxClassTime();
    }else if(selector_calendar.hasClass('_calweek')){
        ajaxClassTime();
    }else if(selector_calendar.hasClass('_calday')){
        ajaxClassTime_day();
    };
};


function position_fixed_addplan_if_mobile(){
    if(bodywidth < 600){
        $('#page-addplan').css('position','fixed');
        $('.dropdown-backdrop').css('height',$('#mshade_popup').height()+'px');
        setTimeout(function(){$('.dropdown-backdrop').css('height',$('#mshade_popup').height()+'px');},1)
    };
};
function position_absolute_addplan_if_mobile(scrolltoDom){
    if(bodywidth < 600){
        $('#page-addplan').css('position','absolute');
        scrollToDom(scrolltoDom);
    };
};


$(window).resize(function(){
    //Timegraph에 일정과 OFF표기를 반응형으로\
    if($('#page-addplan').css('display') == 'block'){
        $('.timegraph_plans_pink, .timegraph_plans_grey').remove();
        timeGraphSet("class","pink","AddClass", ajaxJSON_cache);
        timeGraphSet("group","pink","AddClass", ajaxJSON_cache);
        timeGraphSet("off","grey","AddClass", ajaxJSON_cache);
    }    
    //Timegraph에 일정과 OFF표기를 반응형으로

    //Timegraph에 현재 선택된 일정 깜빡이 크기를 반응형으로
    if($('#page-addplan').css('display') == 'block' && $('.selectedplan_indi').length != 0){
        addGraphIndicator($('#durationsSelected button').attr('data-durmin'));
    };
    //Timegraph에 현재 선택된 일정 깜빡이 크기를 반응형으로

});






