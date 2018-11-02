/*jshint esversion: 6 */
$(document).ready(function(){

    //바로 실행
    // get_current_member_list("callback", function(jsondata){
    //     set_member_dropdown_list(jsondata);
    // });
    // get_current_group_list("callback", function(jsondata){
    //     set_group_dropdown_list(jsondata);
    //     //append_dropdown_scroll_arrow("#members_pc", "#members_pc", 0, 0, "", "");
    //     set_list_overflow_scrolling("#members_pc", "#members_pc");
    //     set_list_overflow_scrolling('#durations_mini', '#durations_mini');
    // });
    //
    

    //유저가 터치인지 마우스 사용인지 알아낸다
    var touch_or_mouse = "";
    window.addEventListener('touchstart', function(){
        touch_or_mouse = "touch";
    });
    //유저가 터치인지 마우스 사용인지 알아낸다

    //초기에 미니 timegraph를 채워주기 위한 DBdataprocess
    //DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateData,"graph",classTimeData)
    //DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offDateData,"graph",offTimeData)
    //초기에 미니 timegraph를 채워주기 위한 DBdataprocess

    //var select_all_check = false;
    var date = new Date();
    var currentYear = date.getFullYear(); //현재 년도
    var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
    var currentDate = date.getDate(); //오늘 날짜
    var currentDay = date.getDay(); // 0,1,2,3,4,5,6,7
    var currentHour = date.getHours();
    var currentMinute = date.getMinutes();

    $("#datepicker").datepicker({
        //minDate : 0,
        onSelect : function(curDate, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
            if( curDate != instance.lastVal ){
                $(this).css({
                                        "-webkit-text-fill-color":'#282828'
                            });
                $(this).parent('p').addClass("dropdown_selected");
                var selector_timeGraph = $('#timeGraph');
                var selector_datepicker = $("#datepicker");
                if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
                    $("#id_training_date, #id_training_end_date").val(selector_datepicker.val());
                    if(selector_timeGraph.css('display')=='none'){
                        selector_timeGraph.css('display','block');
                    }
                    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
                    clear_start_dur_dropdown();
                    $('#durations_mini, #durations_mini').html('');
                    $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft');
                    ajaxTimeGraphSet(selector_datepicker.val());
                }else if(addTypeSelect =="offadd"){
                    $("#id_training_date_off, #id_training_end_date_off").val(selector_datepicker.val());
                    if(selector_timeGraph.css('display')=='none'){
                        selector_timeGraph.css('display','block');
                    }
                    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
                    clear_start_dur_dropdown();
                    $('#durations_mini, #durations_mini').html('');
                    $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft');
                    ajaxTimeGraphSet(selector_datepicker.val());
                }
                check_dropdown_selected_addplan();
            }
        }
    });

    function date_validity_check(startdate, enddate, dateText, datepicker_end){
        if( startdate == undefined || startdate.length == 0 ){
            datepicker_end.datepicker('setDate', null);
            show_caution_popup('<p style="color:#fe4e65;">날짜 선택</p>'+
                                '<div style="width:95%;border:1px solid #cccccc;margin:0 auto;padding-top:10px;margin-bottom:10px;">'+
                                    '<p>시작 일자를 먼저 선택해주세요</p>'+
                                '</div>');
        }else if(compare_date2( dateText, startdate ) == false){
            datepicker_end.datepicker('setDate', endOriDate);
            $('#'+$(this).attr('data-type').replace(/lec_/gi, 'form_')).val(endOriDate);
            show_caution_popup('<p style="color:#fe4e65;">종료일자가 시작일자보다 앞섭니다.</p>'+
                                '<div style="width:95%;border:1px solid #cccccc;margin:0 auto;padding-top:10px;margin-bottom:10px;">'+
                                    '<p>종료일자는 시작날짜 이후로 선택해주세요.</p>'+
                                '</div>');
        }
    }



    $("#datepicker_repeat_start").datepicker({
        //minDate : 0,
        onSelect : function(dateText, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
            if( dateText != instance.lastVal ){
                $(this).css({
                                        "-webkit-text-fill-color":'#282828'
                            });
                $(this).parent('p').addClass("dropdown_selected");
                var selector_datepicker_repeat_start = $("#datepicker_repeat_start");
                var selector_datepicker_repeat_end = $("#datepicker_repeat_end");
                var selectedEndDate = selector_datepicker_repeat_end.val();
                if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
                    if(selectedEndDate == undefined || selectedEndDate.length == 0){
                        $("#id_repeat_start_date").val(selector_datepicker_repeat_start.val());
                        $("#id_repeat_end_date").val(selector_datepicker_repeat_end.val());
                        pters_option_inspector("plan_create", "", selector_datepicker_repeat_start.val());
                    }else if(compare_date2(dateText, selectedEndDate)){
                        selector_datepicker_repeat_end.datepicker('setDate', null);
                        $("#id_repeat_end_date").val("");
                    }
                }else if(addTypeSelect == "repeatoffadd"){
                    if(selectedEndDate == undefined || selectedEndDate.length == 0){
                        $("#id_repeat_start_date_off").val(selector_datepicker_repeat_start.val());
                        $("#id_repeat_end_date_off").val(selector_datepicker_repeat_end.val());
                        pters_option_inspector("plan_create", "", selector_datepicker_repeat_start.val());
                    }else if(compare_date2(dateText, selectedEndDate)){
                        selector_datepicker_repeat_end.datepicker('setDate', null);
                        $("#id_repeat_end_date").val("");
                    }
                }
                check_dropdown_selected_addplan();
            }
        }
    });

    $("#datepicker_repeat_end").datepicker({
        //minDate : 0,
        onSelect : function(dateText, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
            if( dateText != instance.lastVal ){
                $(this).css({
                                        "-webkit-text-fill-color":'#282828'
                            });
                $(this).parent('p').addClass("dropdown_selected");
                var selector_datepicker_repeat_start = $("#datepicker_repeat_start");
                var selector_datepicker_repeat_end = $("#datepicker_repeat_end");
                var startSelectedDate = selector_datepicker_repeat_start.val();
                if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
                    if(compare_date2(startSelectedDate, dateText)){
                        selector_datepicker_repeat_end.datepicker('setDate', null);
                        $("#id_repeat_end_date").val("");
                        show_caution_popup('<p style="color:#fe4e65;">종료일자가 시작일자보다 앞섭니다.</p>'+
                                        '<div style="width:95%;border:1px solid #cccccc;margin:0 auto;padding-top:10px;margin-bottom:10px;">'+
                                            '<p>종료일자는 시작날짜 이후로 선택해주세요.</p>'+
                                        '</div>');
                    }else{
                        $("#id_repeat_start_date").val(selector_datepicker_repeat_start.val());
                        $("#id_repeat_end_date").val(selector_datepicker_repeat_end.val());
                        pters_option_inspector("plan_create", "", selector_datepicker_repeat_end.val());
                    }
                }else if(addTypeSelect == "repeatoffadd"){
                    if(compare_date2(startSelectedDate, dateText)){
                        selector_datepicker_repeat_end.datepicker('setDate', null);
                        $("#id_repeat_end_date").val("");
                        show_caution_popup('<p style="color:#fe4e65;">종료일자가 시작일자보다 앞섭니다.</p>'+
                                        '<div style="width:95%;border:1px solid #cccccc;margin:0 auto;padding-top:10px;margin-bottom:10px;">'+
                                            '<p>종료일자는 시작날짜 이후로 선택해주세요.</p>'+
                                        '</div>');
                    }else{
                        $("#id_repeat_start_date_off").val(selector_datepicker_repeat_start.val());
                        $("#id_repeat_end_date_off").val(selector_datepicker_repeat_end.val());
                        pters_option_inspector("plan_create", "", selector_datepicker_repeat_end.val());
                    }
                }
                check_dropdown_selected_addplan();
            }
        }
    });

    //긁어서 일정 추가
    if(bodywidth > 600 && (varUA.match('iphone') ==null && varUA.match('ipad')==null && varUA.match('ipod')==null && varUA.match('android') == null) ){
        $(document).on('mousedown', '.td00, .td30', function(e){
            set_member_group_dropdown_list();

            e.stopPropagation();
            close_planadd_popup_mini();
            $(document).off('mouseup');
            var thisID     = $(this).attr('id');
            var thisIDDate = $(this).attr('id').split('_')[0]+'_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2];
            var thisIDHour = $(this).attr('id').split('_')[3];
            var thisIDMin  = $(this).attr('id').split('_')[4];

            var thisIdDate_ = thisIDDate.replace(/_/gi, '-');
            if( (compare_date2(thisIdDate_, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), thisIdDate_)) && Options.auth_limit == 0 ){
                show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                                </div>`);
            }else{
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
                                $(this).find('div').addClass('blankSelected30');
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

                        $(document).on('mouseup', '#gap', function(){
                            close_planadd_popup_mini();
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
                    if(!$(this).hasClass('_on') && !$next30ID.hasClass('_on') && !$(this).find('div').hasClass('classTime') && !$(this).find('div').hasClass('offTime') && !$(this).find('div').hasClass('groupTime') && 
                        thisIDHour+'-'+thisIDMin != (Options.workEndTime-1)+'-30'){
                        $('.blankSelected').removeClass('blankSelected');
                        $(this).find('div').addClass('blankSelected');

                        $(document).on('mouseover', '.td00, .td30', function(){
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


                        $(document).on('mouseup', '#gap', function(){
                            close_planadd_popup_mini();
                            $('.blankSelected').removeClass('blankSelected');
                        });

                    }
                }
            }
        });
    }
    //긁어서 일정 추가

    //모바일 버전에서 weekcal 클릭해서 일정 추가하기 20180806 test
    var timeIndexY = [];
    var timePlanY = [];
    var timeIndexhour = [];

    function get_timeindex_Y(){
        timeIndexY = [];
        timeIndexhour = [];
        timePlanY = [];
        var timeIndexHeight = $('.hour').height();
        var timeIndexTopLoc = $('.timeindex').offset().top;
        for(var y=Options.workStartTime; y<Options.workEndTime; y++){
            var timeY = $('#hour'+y).offset().top;
            timeIndexY.push(timeY-0.5, timeY + timeIndexHeight/2);
            timeIndexhour.push(time_h_format_to_hh(y)+'_00', time_h_format_to_hh(y)+'_30');
        }
        timeIndexY.push($('#hour'+(Options.workEndTime-1) ).offset().top+$('#hour'+(Options.workEndTime-1) ).height()+0.5);
        //timeIndexhour.push(time_h_format_to_hh(Options.workEndTime-1)+'_00');
        timePlanY.push($('#hour'+(Options.workEndTime-1) ).offset().top+$('#hour'+(Options.workEndTime-1) ).height()+0.5);
    }

    $(document).on('click', '.td00', function(e){
        set_member_group_dropdown_list();

        var thisIDDate = $(this).attr('id').replace(/_/gi, "-");
        if( (compare_date2(thisIDDate, add_date(today_YY_MM_DD, 14))  ||  compare_date2(substract_date(today_YY_MM_DD, -14), thisIDDate)) && Options.auth_limit == 0 ){
                show_caution_popup(`<div style="margin-bottom:10px;">
                                    베이직 기능 이용자께서는 <br>
                                    일정 등록과 취소가 <span style="font-weight:500;">오늘 기준 2주로 제한</span>됩니다. <br><br>
                                    <span style="color:#fe4e65;">프리미엄 이용권</span>으로<br>
                                    <span style="color:#fe4e65;">날짜제한 없이 이용</span>해보세요!
                                </div>`);
        }else{
            get_timeindex_Y();

            var thisOffsetTop = $(this).offset().top;
            //if( (varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null) && bodywidth > 600 ){
            if( (varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null) ){
                close_planadd_popup_mini();
                var blankmark;
                if(Options.classDur == 30){blankmark = 'blankSelected30';}else if(Options.classDur == 60){blankmark = 'blankSelected';}

                var localarray = timeIndexY.slice();
                var localharray = timeIndexhour.slice();
                var localparray = timePlanY.slice();

                var $classTimes = $(this).find('.classTime');
                var $offTimes = $(this).find('.offTime');
                var $groupTimes = $(this).find('.groupTime');

                $classTimes.each(function(){
                    var thisLoc = $(this).offset().top;
                    var thisHeight = $(this).height();
                    var thisInfo = $(this).attr('class-time').split('_');
                    localarray.push(thisLoc, thisLoc+thisHeight);
                    localparray.push(thisLoc, thisLoc+thisHeight);
                    localharray.push(time_h_format_to_hh(thisInfo[3])+'_'+thisInfo[4], time_h_format_to_hh(thisInfo[7])+'_'+thisInfo[8]);
                });

                $offTimes.each(function(){
                    var thisLoc = $(this).offset().top;
                    var thisHeight = $(this).height();
                    var thisInfo = $(this).attr('off-time').split('_');
                    localarray.push(thisLoc, thisLoc+thisHeight);
                    localparray.push(thisLoc, thisLoc+thisHeight);
                    localharray.push(time_h_format_to_hh(thisInfo[3])+'_'+thisInfo[4], time_h_format_to_hh(thisInfo[7])+'_'+thisInfo[8]);
                });

                $groupTimes.each(function(){
                    var thisLoc = $(this).offset().top;
                    var thisHeight = $(this).height();
                    var thisInfo = $(this).attr('group-time').split('_');
                    localarray.push(thisLoc, thisLoc+thisHeight);
                    localparray.push(thisLoc, thisLoc+thisHeight);
                    localharray.push(time_h_format_to_hh(thisInfo[3])+'_'+thisInfo[4], time_h_format_to_hh(thisInfo[7])+'_'+thisInfo[8]);
                });

                $('.'+blankmark).removeClass(blankmark);
                e.stopPropagation();
                var thisID = getThisId(this);
                var thisY = e.pageY;

                localarray.push(thisY);
                localparray.push(thisY);
                var timeIndexY_ = localarray.sort(function(a, b){return a-b;});
                var planIndexY_ = localparray.sort(function(a, b){return a-b;});
                var timeHour = localharray.sort();
                var thisIndex = timeIndexY_.indexOf(thisY);
                var targetY = timeIndexY_[thisIndex-1];
                var targetYLimit = timeIndexY_[thisIndex+1];

                var planNextto = localparray[localparray.indexOf(thisY)+1];

                if( (Options.classDur/30)*targetYLimit - targetY >= Options.classDur*calendarSize){
                    if(planNextto - targetY >= Options.classDur*calendarSize){
                        $(this).find('div.blankbox').addClass(blankmark);
                        $('.'+blankmark).css({'top':targetY - thisOffsetTop-1,'height':Options.classDur*calendarSize+'px'});
                        show_mini_plan_add_popup_tablet(thisID+'_'+timeHour[thisIndex-1], 1);
                        //2018_8_6_0_00
                    }else{
                        console.log('클릭한 곳과 일정간 거리가 너무 짧음');
                    }

                }else{
                    console.log('너무 좁아');
                }
            }
        }
    });

    function getThisId(selector){
        return $(selector).attr('id');
    }
    function show_mini_plan_add_popup_tablet(thisID, dur){
        var durMin = dur*Options.classDur;
        var starttime = time_h_format_to_hh(thisID.split('_')[3])+':'+thisID.split('_')[4];
        $("#id_training_date, #id_training_date_off, #id_training_end_date, #id_training_end_date_off").val(date_format_yyyy_m_d_to_yyyy_mm_dd(thisID.split('_')[0]+'-'+thisID.split('_')[1]+'-'+thisID.split('_')[2], '-'));
        $("#id_training_time, #id_training_time_off").val(starttime);
        $('#id_memo_mini, #id_memo_mini_off').val('');

        if(addTypeSelect == "ptadd"){ //Form 셋팅
            $('#id_training_end_time').val(add_time(starttime, '00:'+durMin));
            $('#id_training_end_time_off').val(add_time(starttime, '00:'+durMin));
        }else if(addTypeSelect == "offadd"){
            $('#id_training_end_time').val(add_time(starttime, '00:'+durMin));
            $('#id_training_end_time_off').val(add_time(starttime, '00:'+durMin));
        }else if(addTypeSelect == "groupptadd" || addTypeSelect == "repeatptadd" || addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatgroupptadd"){
            addTypeSelect = 'ptadd';
            $('#id_training_end_time').val(add_time(starttime, '00:'+durMin));
            $('#id_training_end_time_off').val(add_time(starttime, '00:'+durMin));
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

        $('.typeSelected').removeClass('typeSelected');
        $('#typeSelector_'+addTypeSelect).addClass('typeSelected');
        if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
            $('._MINI_ptadd').css('display','block');
            //$('._MINI_offadd').hide()
        }else if(addTypeSelect == "offadd"){
            //$('._MINI_offadd').show()
            $('._MINI_ptadd').css('display','none');
        }

        var blankbox;
        if(Options.classDur == 30){
            blankbox = 'blankSelected30';
        }else{
            blankbox = 'blankSelected';
        }
        var blankTop = $('.'+blankbox).offset().top;
        var blankLeft = $('.'+blankbox).offset().left;
        var blankWidth = $('.'+blankbox).width();
        var blankHeight = $('.'+blankbox).height();
        var blankRight = blankLeft + blankWidth;
        //$('#page-addplan-pc').show().css({'top':blankTop+'px','left':blankRight+'px'});

        //미니 팝업 위치 보정
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var popupwidth = $('#page-addplan-pc').width();
        var popupheight = $('#page-addplan-pc').height();
        var startTopLoc = $('.'+blankbox).offset().top;
        var startLeftLoc = $('.'+blankbox).offset().left;
        var startWidth = $('.'+blankbox).width();
        var startHeight;
        if(Options.classDur == 60){
            startHeight = $('#'+thisID).height()*2;
        }else if(Options.classDur == 30){
            startHeight = 0;
        }
        var endTopLoc = blankTop + $('.'+blankbox).height();
        var endLeftLoc = blankLeft;
        var endWidth = blankWidth;
        var scrollTop = $(window).scrollTop();
        var weekTopLoc = $('#week').offset().top;
        var weekHeight = $('#week').height();

        var popupRightLoc = endLeftLoc+endWidth+popupwidth;
        var popupBottomLoc = endTopLoc + popupheight;
        if(bodywidth > 600){
            if(popupRightLoc > windowWidth){ //팝업이 오른쪽으로 넘어갔을 때
                if(popupBottomLoc > windowHeight + scrollTop){ //팝업이 아래로 넘어가서 안보일때
                    $('#page-addplan-pc').show().css({'top':endTopLoc -  popupheight, 'left':endLeftLoc - popupwidth});
                    if(endTopLoc - popupheight < weekTopLoc+weekHeight){
                        $('#page-addplan-pc').show().css({'top':endTopLoc -  startHeight, 'left':endLeftLoc - popupwidth});
                    }
                }else if(popupBottomLoc + popupheight > weekTopLoc+weekHeight){ //스크롤을 내려서 팝업이 위로 넘어가서 안보일때
                    $('#page-addplan-pc').show().css({'top':endTopLoc -  startHeight, 'left':endLeftLoc - popupwidth});
                }else{ //그외
                    $('#page-addplan-pc').show().css({'top':endTopLoc - startHeight, 'left':endLeftLoc - popupwidth});
                }
            }else{
                if(popupBottomLoc > windowHeight + scrollTop){ //팝업이 아래로 넘어가서 안보일때
                    $('#page-addplan-pc').show().css({'top':endTopLoc -  popupheight, 'left':endLeftLoc+endWidth});
                    if(endTopLoc - popupheight < weekTopLoc+weekHeight){
                        $('#page-addplan-pc').show().css({'top':endTopLoc -  startHeight, 'left':endLeftLoc+endWidth});
                    }
                }else if(popupBottomLoc + popupheight > weekTopLoc+weekHeight){ //스크롤을 내려서 팝업이 위로 넘어가서 안보일때
                    $('#page-addplan-pc').show().css({'top':endTopLoc -  startHeight, 'left':endLeftLoc+endWidth});
                }else{
                    $('#page-addplan-pc').show().css({'top':endTopLoc - startHeight, 'left':endLeftLoc+endWidth});
                }
            }
        }else if(bodywidth< 600){
            if(popupBottomLoc > windowHeight + scrollTop){  //아래쪽 넘어갈때
                if(blankTop - popupheight < weekTopLoc + weekHeight ){ //위로 넘어갈때
                    $('#page-addplan-pc').show().css({'top':startTopLoc + $('.'+blankbox).height() + 5, 'left':(windowWidth - popupwidth)/2});
                }else{
                    $('#page-addplan-pc').show().css({'top':startTopLoc - popupheight - 10, 'left':(windowWidth - popupwidth)/2});
                }
            }else{ //평상시
                $('#page-addplan-pc').show().css({'top':startTopLoc + $('.'+blankbox).height() + 5, 'left':(windowWidth - popupwidth)/2});
            }
        }
        //미니 팝업 위치 보정

        ajaxTimeGraphSet(date_format_yyyy_m_d_to_yyyy_mm_dd(thisID.split('_')[0]+'-'+thisID.split('_')[1]+'-'+thisID.split('_')[2], '-'), "callback", function(jsondata){
            if($('.add_time_unit').hasClass('checked')){
                durTimeSet(thisID.split('_')[3], thisID.split('_')[4], "mini", 5);
            }else{
                durTimeSet(thisID.split('_')[3], thisID.split('_')[4], "mini", Options.classDur);
            }
        });

        //$('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth});
        check_dropdown_selected_addplan();
    }

    //모바일 버전에서 weekcal 클릭해서 일정 추가하기 test


    function show_mini_plan_add_popup(thisID, dur){
        var durMin = dur*Options.classDur;
        var starttime = time_h_format_to_hh(thisID.split('_')[3])+':'+thisID.split('_')[4];
        $("#id_training_date, #id_training_date_off, #id_training_end_date, #id_training_end_date_off").val(date_format_yyyy_m_d_to_yyyy_mm_dd(thisID.split('_')[0]+'-'+thisID.split('_')[1]+'-'+thisID.split('_')[2], '-'));
        $("#id_training_time, #id_training_time_off").val(starttime);
        $('#id_memo_mini, #id_memo_mini_off').val('');

        if(addTypeSelect == "ptadd"){ //Form 셋팅
            $('#id_training_end_time').val(add_time(starttime, '00:'+durMin));
            $('#id_training_end_time_off').val(add_time(starttime, '00:'+durMin));
        }else if(addTypeSelect == "offadd"){
            $('#id_training_end_time').val(add_time(starttime, '00:'+durMin));
            $('#id_training_end_time_off').val(add_time(starttime, '00:'+durMin));
        }else if(addTypeSelect == "groupptadd" || addTypeSelect == "repeatptadd" || addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatgroupptadd"){
            addTypeSelect = 'ptadd';
            $('#id_training_end_time').val(add_time(starttime, '00:'+durMin));
            $('#id_training_end_time_off').val(add_time(starttime, '00:'+durMin));
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

        $('.typeSelected').removeClass('typeSelected');
        $('#typeSelector_'+addTypeSelect).addClass('typeSelected');
        if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
            $('._MINI_ptadd').css('display', 'block');
            //$('._MINI_offadd').hide()
        }else if(addTypeSelect == "offadd"){
            //$('._MINI_offadd').show()
            $('._MINI_ptadd').css('display', 'none');
        }


        //미니 팝업 위치 보정
        // var windowWidth = $(window).width();
        var windowWidth = $("#calendar").width()+$("#calendar").offset().left;
        var windowHeight = $(window).height();
        var popupwidth = $('#page-addplan-pc').width();
        var popupheight = $('#page-addplan-pc').height();
        var startTopLoc = $('#'+thisID).offset().top;
        var startLeftLoc = $('#'+thisID).offset().left;
        var startWidth = $('#'+thisID).width();
        var startHeight;
        if(Options.classDur == 60){
            startHeight = $('#'+thisID).height()*2;
        }else if(Options.classDur == 30){
            startHeight = 0;
        }
        var endTopLoc = $('#'+endID).offset().top;
        var endLeftLoc = $('#'+endID).offset().left;
        var endWidth = $('#'+endID).width();
        var scrollTop = $(window).scrollTop();
        var weekTopLoc = $('#week').offset().top + Number($('#week').css("padding-top").replace(/px/gi,""));
        var weekHeight = $('#week').height();

        var popupRightLoc = endLeftLoc+endWidth+popupwidth;
        var popupBottomLoc = endTopLoc + popupheight;
        if(popupRightLoc > windowWidth){ //팝업이 오른쪽으로 넘어갔을 때
            if(popupBottomLoc > windowHeight + scrollTop){ //팝업이 아래로 넘어가서 안보일때
                $('#page-addplan-pc').show().css({'top':endTopLoc -  popupheight, 'left':endLeftLoc - popupwidth});
                if(endTopLoc - popupheight < weekTopLoc+weekHeight){
                    $('#page-addplan-pc').show().css({'top':endTopLoc -  startHeight, 'left':endLeftLoc - popupwidth});
                }
            }else if(popupBottomLoc + popupheight > weekTopLoc+weekHeight){ //스크롤을 내려서 팝업이 위로 넘어가서 안보일때
                $('#page-addplan-pc').show().css({'top':endTopLoc -  startHeight, 'left':endLeftLoc - popupwidth});
            }else{ //그외
                $('#page-addplan-pc').show().css({'top':endTopLoc - startHeight, 'left':endLeftLoc - popupwidth});
            }
        }else{
            if(popupBottomLoc > windowHeight + scrollTop){ //팝업이 아래로 넘어가서 안보일때
                $('#page-addplan-pc').show().css({'top':endTopLoc -  popupheight, 'left':endLeftLoc+endWidth});
                if(endTopLoc - popupheight < weekTopLoc+weekHeight){
                    $('#page-addplan-pc').show().css({'top':endTopLoc -  startHeight, 'left':endLeftLoc+endWidth});
                }
            }else if(popupBottomLoc + popupheight > weekTopLoc+weekHeight){ //스크롤을 내려서 팝업이 위로 넘어가서 안보일때
                $('#page-addplan-pc').show().css({'top':endTopLoc -  startHeight, 'left':endLeftLoc+endWidth});
            }else{
                $('#page-addplan-pc').show().css({'top':endTopLoc - startHeight, 'left':endLeftLoc+endWidth});
            }
        }
        //미니 팝업 위치 보정

        ajaxTimeGraphSet(date_format_yyyy_m_d_to_yyyy_mm_dd(thisID.split('_')[0]+'-'+thisID.split('_')[1]+'-'+thisID.split('_')[2], '-'), "callback", function(jsondata){
            if($('.add_time_unit').hasClass('checked')){
                durTimeSet(thisID.split('_')[3], thisID.split('_')[4], "mini", 5);
            }else{
                durTimeSet(thisID.split('_')[3], thisID.split('_')[4], "mini", Options.classDur);
            }
        });

        //$('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth});
        check_dropdown_selected_addplan();
    }

    //shift키 눌러서 일정을 쭉 잡기
    function fill_blankSelected_by_shift_key(thisID, endID){
        // TO - DO
    }


    if($('#calendar').width()<=600){
        $(document).off('mouseup mouseover mousedown', '.td00, .td30');
    }

    $('#typeSelector .toggleBtnWrap').click(function(){
        $('.blankSelected_addview').removeClass('blankSelected blankSelected30 blankSelected_addview');
        $(this).addClass('typeSelected');
        $(this).siblings('.toggleBtnWrap').removeClass('typeSelected');
        if($(this).attr('id').split('_')[1]=="ptadd"){
            $('#memberName_mini, #remainCount_mini').css('display', 'block');
            $('.pt_memo_guide_mini').css('visibility', 'unset');
            if($('#membersSelected_mini button').attr('data-grouptype') == "group"){
                addTypeSelect = "groupptadd";
            }else{
                addTypeSelect = "ptadd";
            }
        }else if($(this).attr('id').split('_')[1]=="offadd"){
            $('#memberName_mini, #remainCount_mini').css('display', 'none');
            $('.pt_memo_guide_mini').css('visibility', 'hidden');
            addTypeSelect = "offadd";
        }
        check_dropdown_selected_addplan();
    });

    $(document).on('click',"#durations_mini li a",function(){
        $("#classDuration_mini #durationsSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-dur'));

        if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){ //Form 셋팅
            //var durationTime_class =  Number($(this).attr('data-dur').replace(/시간/gi,''))*(30/Options.classDur);
            //$("#id_time_duration, #id_time_duration_off").val(durationTime_class);
            $('#id_training_end_time, #id_training_end_time_off').val($(this).attr('data-endtime'));
            planAddView($(this).attr('data-dur'));

        }else if(addTypeSelect == "offadd"){
            //var durationTime = Number($(this).attr('data-dur').replace(/시간/gi,''))*(30/Options.classDur);
            $('#id_training_end_time, #id_training_end_time_off').val($(this).attr('data-endtime'));
            //$("#id_time_duration, #id_time_duration_off").val(durationTime);
            planAddView($(this).attr('data-dur'));
        }
        check_dropdown_selected_addplan();
    });


    $('#memo_mini, #scheduleMemo input').keyup(function(){
        $('#id_memo_mini, #id_memo_mini_off').val($(this).val());
    });


    function planAddView(duration){ //미니팝업으로 진행시간 표기 미리 보기
        /*
        var mi = selectedTime[4];
        var yy = Number(selectedTime[0]);
        var mm = Number(selectedTime[1]);
        var dd = Number(selectedTime[2]);
        var hh = Number(selectedTime[3]);
        var hh_ = Number(selectedTime[3]);
        */
        if( (varUA.match('iphone') !=null || varUA.match('ipad')!=null || varUA.match('ipod')!=null || varUA.match('android') != null)){
            var blankbox;
            if(Options.classDur == 60){
                blankbox = 'blankSelected';
            }else if(Options.classDur == 30){
                blankbox = 'blankSelected30';
            }
            $('.'+blankbox).css({'height':Options.classDur*duration*calendarSize});
        }else{
            var selectedDuration;
            var blankSelected;
            var selector_blankSelected;
            var selector_blankSelected_first_child;
            var selectedTime;
            var selectedTimeID;
            if(Options.classDur == 60){
                selectedDuration = Number(duration);
                blankSelected = 'blankSelected';
                selector_blankSelected = $('.'+blankSelected);
                selector_blankSelected_first_child = $('.'+blankSelected+':first-child');
                selectedTime = selector_blankSelected.parent('div').attr('id').split('_');
                selectedTimeID = selector_blankSelected_first_child.parent('div').attr('id');


                selectedDuration = Number(duration);
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
                for(var i = hh+1; i < hh+selectedDuration; i++){
                    $('#'+yy+'_'+mm+'_'+dd+'_'+i+'_'+mi).find('div').addClass(blankSelected);
                }
            }else if(Options.classDur == 30){
                selectedDuration = Number(duration)/2;
                blankSelected = 'blankSelected30';
                selector_blankSelected = $('.'+blankSelected);
                selector_blankSelected_first_child = $('.'+blankSelected+':first-child');
                selectedTime = selector_blankSelected.parent('div').attr('id').split('_');
                selectedTimeID = selector_blankSelected_first_child.parent('div').attr('id');


                selectedDuration = Number(duration.replace(/시간/gi, ''));
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
                for(var j=hh; j<hh+selectedDuration-1; j++){
                    if(mi == 60 || mi == 0){
                        mi = "00";
                        hh_ = hh_ + 1;
                    }
                    $('#'+yy+'_'+mm+'_'+dd+'_'+hh_+'_'+mi).find('div').addClass(blankSelected);
                    mi = Number(mi) + 30;
                }
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

        var exist_past_reg = [];
        for(var i=0; i<len; i++){
            if(currentStateArray[i] == "IP" && enddateArray[i] != "9999-12-31"){
                if(compare_date2(today_YY_MM_DD, enddateArray[i]) == true ){
                //테스트용 if문 if(compare_date2("2020-12-20", enddateArray[i]) == true ){
                    exist_past_reg.push('<p>'+lecname[i]+': '+'종료일자 '+enddateArray[i]+'</p>');
                }
            }
        }

        var message = exist_past_reg.join('');
        if(exist_past_reg.length > 0){
            show_caution_popup(                                                                            
                                   '<p style="color:#fe4e65;">종료일자가 지난 수강정보가 있는 회원입니다.</p>'+
                                        '<div style="width:95%;border:1px solid #cccccc;margin:0 auto;padding-top:10px;margin-bottom:10px;">'+
                                            message+
                                        '</div>'+
                                    '<p>정확한 데이터 관리를 위해<br>종료일자 변경 및 확인을 해주세요.</p>'
                            );
            //disable_window_scroll();
        }
    }


    $(document).on('click', "#members_pc li a", function(){
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
                    if(jsondata.lectureStateArray[i] == "IP" && jsondata.checkOneToOneArray[i] == "1"){
                        availCount_personal = availCount_personal + Number(jsondata.availCountArray[i]);
                    }
                }
                $("#countsSelected_mini").show().text(availCount_personal);
                member_enddate_check_before_addplan(jsondata);
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
            $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text()).attr('data-grouptype', 'group');
            $('#grouptypenumInfo, #groupInfoSelected').text($(this).attr('data-grouptypecd_nm')+' '+$(this).attr('data-membernum')+'명');
            $("#id_group_id").val($(this).attr('data-groupid'));
        }

        check_dropdown_selected_addplan();
    }); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

    $(document).on('click', "#members_mobile li a", function(){
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
                    if(jsondata.lectureStateArray[i] == "IP" && jsondata.checkOneToOneArray[i] == "1"){
                        availCount_personal = availCount_personal + Number(jsondata.availCountArray[i]);
                    }
                }
                $("#countsSelected").text(availCount_personal);
                member_enddate_check_before_addplan(jsondata);
                check_dropdown_selected_addplan();
            });

            $('#cal_popup_repeatconfirm').attr({'data-lectureid':$(this).attr('data-lectureid'), 'data-dbid':$(this).attr('data-dbid')});
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

            $('#cal_popup_repeatconfirm').attr({'data-lectureid':$(this).attr('data-lectureid'), 'data-groupid':groupid});
            $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text()).attr('data-groupid', groupid);
            $('#grouptypenumInfo').text($(this).attr('data-grouptypecd_nm')+' '+$(this).attr('data-membernum')+'명');
            $("#id_group_id").val(groupid);

            if(grouptypecd == "NORMAL"){
                $('#groupmembersInfo').show();
                get_groupmember_list(groupid, 'callback', function(jsondata){
                    draw_groupMemberList_to_view(jsondata, $('#groupmemberInfo'));
                    if(bodywidth > 600){
                        //$('#page-addplan').animate({'top': $('#page-addplan').offset().top-$('#groupmemberInfo').height()},200);
                        $('#page-addplan').animate({'top':($(window).height()-$('#page-addplan').outerHeight())/2+$(window).scrollTop()},250);
                    }
                    check_dropdown_selected_addplan();
                });
            }else if(grouptypecd == "EMPTY"){
                $('#groupmembersInfo').hide();
                get_groupmember_list(groupid, 'callback', function(jsondata){
                    draw_groupMemberList_to_view(jsondata, $('#groupmemberInfo'));
                    if(bodywidth > 600){
                        //$('#page-addplan').animate({'top': $('#page-addplan').offset().top-$('#groupmemberInfo').height()},200);
                        $('#page-addplan').animate({'top':($(window).height()-$('#page-addplan').outerHeight())/2+$(window).scrollTop()},250);
                    }
                    check_dropdown_selected_addplan();
                });
            }
        }

        check_dropdown_selected_addplan();
        position_absolute_addplan_if_mobile($('#membersSelected'));
    }); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

    $(document).on('click', '#starttimesSelected input', function(e){
        e.stopPropagation();
    });


    $(document).on('click', '#starttimes li a', function(){
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
            durTimeSet(arry[0], arry[1], "class", 5);
        }else{
            durTimeSet(arry[0], arry[1], "class", Options.classDur);
        }

        //진행시간 자동으로 최소 단위 시간으로 Default 셋팅
        var selector_durationsSelected_button = $('#durationsSelected button');
        var selector_durations_li_first_child = $('#durations li:nth-of-type(1) a');
        $("#durationsSelected .btn:first-child").val("").html("<span style='color:#cccccc;'>선택</span>");
        selector_durationsSelected_button.addClass("dropdown_selected").text(selector_durations_li_first_child.text()).val(selector_durations_li_first_child.attr('data-dur')).attr('data-durmin',selector_durations_li_first_child.attr('data-durmin'));
        if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
            var durationTime_class = Number(selector_durationsSelected_button.val())*(30/Options.classDur);
            //$("#id_time_duration").val(durationTime_class);
            $('#id_training_end_time').val(selector_durations_li_first_child.attr('data-endtime'));
            addGraphIndicator(selector_durationsSelected_button.attr('data-durmin'));

        }else if(addTypeSelect == "offadd"){
            var durationTime = Number(selector_durationsSelected_button.val())*(30/Options.classDur);
            //$("#id_time_duration_off").val(durationTime);
            $('#id_training_end_time_off').val(selector_durations_li_first_child.attr('data-endtime'));
            addGraphIndicator(selector_durationsSelected_button.attr('data-durmin'));

        }
        check_dropdown_selected_addplan();
        position_absolute_addplan_if_mobile($('#starttimesSelected'));
    });


    $('button.pters_dropdown_custom').click(function(){ //#membersSelected_mini
        position_fixed_addplan_if_mobile();
        $('#page-base-addstyle').css({'z-index':150});
        if(bodywidth < 600){
            var selector = $(this).siblings('ul');
            $('.pters_dropdown_custom_list').css({'top':($(window).height()-selector.height())/2,
                                                  'left':'50%',
                                                  'transform':'translateX(-50%)'});
            //드랍다운 씹힘현상 해결
            selector.animate({scrollTop : selector.scrollTop()+1}, 10);
            //드랍다운 씹힘현상 해결

            dropdownlist_auto_scroll_to_middle($('#starttimesSelected button'));
            add_scroll_arrow_to_dropdown_list($(this));
        }; 
    });
    $(document).on('click', '.pters_dropdown_custom_list li a', function(){
        $('#page-base-addstyle').css({'z-index':400});
    });

    $(document).on('click', 'div.dropdown-backdrop', function(){
        position_absolute_addplan_if_mobile();
        $('#page-base-addstyle').css({'z-index':400});
    });

    $(document).on('click', "#durations li a", function(){
        $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-dur')).attr('data-durmin', $(this).attr('data-durmin'));
        if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
            var durationTime_class = Number($(this).attr('data-dur'));
            //$("#id_time_duration").val(durationTime_class);
            $('#id_training_end_time').val($(this).attr('data-endtime'));
            addGraphIndicator($(this).attr('data-durmin'));
        }else if(addTypeSelect == "offadd"){
            var durationTime = Number($(this).attr('data-dur'));
            //$("#id_time_duration_off").val(durationTime);
            $('#id_training_end_time_off').val($(this).attr('data-endtime'));
            addGraphIndicator($(this).attr('data-durmin'));
        }
        check_dropdown_selected_addplan();
        position_absolute_addplan_if_mobile($('#durationsSelected'));
    }); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시


    $(document).on('click', '#page-addplan #durationsSelected button', function(){
        if($('#durations li').length == 0){
            $('.dropdown-backdrop').css('display', 'none');
            position_absolute_addplan_if_mobile($('#starttimesSelected'));
        }

        if(bodywidth > 600){
            scrollToDom_custom('#page_addplan_input_wrap', '#durationsSelected');
            //dropdown_height_fit_to_parent('#page_addplan_input_wrap', '#durationsSelected');
        }
    });

    $(document).on('click', '#starttimesSelected button', function(){
        if(bodywidth > 600){
            scrollToDom_custom('#page_addplan_input_wrap', '#starttimesSelected');
            //dropdown_height_fit_to_parent('#page_addplan_input_wrap', '#durationsSelected');
        }
    });


    //드랍다운에서 가속도 스크롤을 같은방향으로 더 튕겼을때 드랍다운 멈추는 형상 해결
    //드랍다운 씹힘현상 해결
    $('.pters_dropdown_custom_list').scroll(function(){
        var scrollHeight = $(this).prop('scrollHeight');
        var popupHeight = $(this).height();
        var scrollLocation = $(this).scrollTop();
        //scrollHeight = popupHeight + scrollLocation(끝)
        if(popupHeight + scrollLocation == scrollHeight){
            $(this).animate({scrollTop : scrollLocation-1}, 10);
        }else if(popupHeight + scrollLocation == popupHeight){
            $(this).animate({scrollTop : scrollLocation+1}, 10);
        }

        // 좌측 스크롤 애로우 보이기
        if(popupHeight + scrollLocation < scrollHeight-30){
            $('.dropdown_scroll_arrow_bottom').css('visibility', 'visible');
        }else{
            $('.dropdown_scroll_arrow_bottom').css('visibility', 'hidden');
        }
        if(scrollLocation > 30){
            $('.dropdown_scroll_arrow_top').css('visibility', 'visible');
        }else{
            $('.dropdown_scroll_arrow_top').css('visibility', 'hidden');
        }
        //좌측 스크롤 애로우 보이기
    });
    //드랍다운 씹힘현상 해결
    //드랍다운에서 가속도 스크롤을 같은방향으로 더 튕겼을때 드랍다운 멈추는 형상 해결

    //드랍다운리스트에서 위 화살표를 누르면 리스트의 맨위로 이동한다.
        $(document).on('click', 'ul img.dropdown_scroll_arrow_top', function(e){
            e.stopPropagation();
            var $thisul = $(this).parents('ul');
            var $thisul_scroll_height = $thisul.prop('scrollHeight');
            var $thisul_display_height = $thisul.height();
            if($(this).css('visibility') == 'visible'){
                $thisul.animate({scrollTop: 0}, 200);
            }
        });
    //드랍다운리스트에서 위 화살표를 누르면 리스트의 맨위로 이동한다.
    //드랍다운리스트에서 아래 화살표를 누르면 리스트의 맨아래로 이동한다.
        $(document).on('click', 'ul img.dropdown_scroll_arrow_bottom', function(e){
            e.stopPropagation();
            var $thisul = $(this).parents('ul');
            var $thisul_scroll_height = $thisul.prop('scrollHeight');
            var $thisul_display_height = $thisul.height();
            if($(this).css('visibility') == 'visible'){
                $thisul.animate({scrollTop: $thisul_scroll_height + $thisul_display_height}, 200);
            }
        });
    //드랍다운리스트에서 아래 화살표를 누르면 리스트의 맨아래로 이동한다.

    //드랍다운 리스트가 창길이보다 2배이상 길면 중간지점으로 이동한다.
    function dropdownlist_auto_scroll_to_middle($dropdown_Button_Selector){
        var $button = $dropdown_Button_Selector;
        var $ul = $dropdown_Button_Selector.siblings('ul');
        var $li = $dropdown_Button_Selector.siblings('ul').find('li');
        var dropdown_list_visible_height = $ul.height();
        var dropdown_list_total_height = $li.length*$li.outerHeight() + $ul.find('div:nth-of-type(1)').height();

        if(dropdown_list_total_height > dropdown_list_visible_height*2){
            $ul.animate({scrollTop: dropdown_list_total_height/2.5}, 200);
        }
    }
    //드랍다운 리스트가 창길이보다 2배이상 길면 중간지점으로 이동한다.

    //드랍다운을 위해 눌렀을때 드랍다운의 사이즈를 파악해서 arrow를 넣는다.
    function add_scroll_arrow_to_dropdown_list($dropdown_Button_Selector){
        var $button = $dropdown_Button_Selector;
        var $ul = $dropdown_Button_Selector.siblings('ul');
        var $li = $dropdown_Button_Selector.siblings('ul').find('li');
        var dropdown_list_visible_height = $ul.height();
        var dropdown_list_total_height = $li.length*$li.outerHeight() + $ul.find('div:nth-of-type(1)').height();

        if(dropdown_list_total_height > dropdown_list_visible_height + 30){
            if($ul.find('div:nth-of-type(1)').find('img').length == 0){
                $ul.find('div:nth-of-type(1)').append(
                                                    '<img src="/static/user/res/btn-today-left.png" class="dropdown_scroll_arrow_top">'+
                                                    '<img src="/static/user/res/btn-today-left.png" class="dropdown_scroll_arrow_bottom">'
                                                 );
            }
        }
        if($('.pters_dropdown_custom_list').scrollTop() < 30 ){
            $('.dropdown_scroll_arrow_top').css('visibility', 'hidden');
        }
    }
    //드랍다운을 위해 눌렀을때 드랍다운의 사이즈를 파악해서 arrow를 넣는다.


    var ajax_block_during_submit = true;
    $("#upbutton-check, #submitBtn_pt, #submitBtn_mini").click(function(e){
        var bodywidth = window.innerWidth;
        var $form;
        var serverURL;
        var serializeArray;
        var sendData;
        e.preventDefault();
        var starttime_to_send;
        var endtime_to_send;
        if(addTypeSelect=="ptadd"){
            $form = $('#pt-add-form');
            serverURL = '/schedule/add_schedule/';
            serializeArray = $form.serializeArray();
            sendData = serializeArray;

            starttime_to_send = $("#id_training_time");
            endtime_to_send = $("id_training_end_time");
        }else if(addTypeSelect=="groupptadd"){
            $form = $('#pt-add-form');
            serverURL = '/schedule/add_group_schedule/';
            serializeArray = $form.serializeArray();
            sendData = serializeArray;

            starttime_to_send = $("#id_training_time");
            endtime_to_send = $("id_training_end_time");
        }else if(addTypeSelect=="offadd"){
            $form = $('#off-add-form');
            serverURL = '/schedule/add_schedule/';
            serializeArray = $form.serializeArray();
            sendData = serializeArray;

            starttime_to_send = $("#id_training_time_off");
            endtime_to_send = $("#id_training_end_time_off");
        }else if(addTypeSelect=="repeatptadd"){
            $form = $('#add-repeat-schedule-form');
            serverURL = '/schedule/add_repeat_schedule/';
            serializeArray = $form.serializeArray();
            sendData = serializeArray;

            starttime_to_send = $("#id_repeat_start_time");
            endtime_to_send = $("#id_repeat_end_time");
        }else if(addTypeSelect=="repeatgroupptadd"){
            $form = $('#add-repeat-schedule-form');
            serverURL = '/schedule/add_group_repeat_schedule/';
            serializeArray = $form.serializeArray();
            sendData = serializeArray;

            starttime_to_send = $("#id_repeat_start_time");
            endtime_to_send = $("#id_repeat_end_time");
        }else if(addTypeSelect=="repeatoffadd"){
            $form = $('#add-off-repeat-schedule-form');
            serverURL = '/schedule/add_repeat_schedule/';
            serializeArray = $form.serializeArray();
            sendData = serializeArray;

            starttime_to_send = $("#id_repeat_start_time_off");
            endtime_to_send = $("#id_repeat_end_time_off");
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

                    beforeSend:function(xhr){
                        beforeSend(); //ajax 로딩 이미지 출력
                        if(starttime_to_send == endtime_to_send){
                            if(xhr != ""){
                                xhr.abort(); // ajax중지
                                alert("에러: 예상치 못한 오류가 발생했습니다. Code:001(starttime==endtime)\n페이지 새로고침 후 다시 이용해주세요.")
                            }
                        }
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
                                draw_repeat_reg_list(jsondata);
                                var total_count = Number(jsondata.repeatScheduleCounterArray[0])+RepeatDuplicationDateArray.length;
                                if(total_count == RepeatDuplicationDateArray.length){
                                    alert('모든 일정이 기존 일정과 겹쳐 등록할 수 있는 일정이 없습니다.\n 일정을 다시 확인 후 등록해주세요.');
                                    completeSend(); //ajax 로딩 이미지 숨기기
                                }else{
                                    var date = '';
                                    for(var i=0; i<RepeatDuplicationDateArray.length; i++){
                                        if(i==0){
                                            date = RepeatDuplicationDateArray[0];
                                        }
                                        else{
                                            date += ','+RepeatDuplicationDateArray[i];
                                        }
                                    }
                                    $('._repeatconfirmQuestion').text('총 '+jsondata.repeatScheduleCounterArray[0]+' 건의 일정이 등록됩니다.');
                                    // $('._repeatconfirmQuestion').text('총 '+total_count+' 건의 일정 중 '+RepeatDuplicationDateArray.length + '건의 일정이 겹칩니다.');
                                    repeat_info = popup_repeat_confirm();
                                    var day_info = repeat_info.day_info;
                                    var dur_info = jsondata.repeat_start_date + '~' + jsondata.repeat_end_date;
                                    // $('#repeat_confirm_day').text(date);
                                    // $('#repeat_confirm_dur').text('중복 항목은 건너뛰고 등록하시겠습니까?');
                                    // $('#repeat_confirm_day').text(day_info);
                                    $('#repeat_confirm_day').text('등록불가 일정을 확인해주세요.');
                                    $('#repeat_confirm_dur').text(dur_info);
                                    $('#id_repeat_schedule_id_confirm').val(repeatArray);
                                    completeSend(); //ajax 로딩 이미지 숨기기
                                    shade_index(200);
                                }
                                check_dropdown_selected_addplan();
                            }else if(RepeatDuplicationDateArray.length==0 && (addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd")){
                                //if(jsondata.repeatScheduleCounterArray[0] == 0){
                                // alert('선택한 회원님의 등록 가능한 횟수가 부족합니다.\n 다시 확인 후 등록해주세요.')
                                //completeSend(); //ajax 로딩 이미지 숨기기
                                //}else{
                                draw_repeat_reg_list(jsondata);
                                repeat_info = popup_repeat_confirm();
                                var day_info = repeat_info.day_info;
                                var dur_info = jsondata.repeat_start_date + '~' + jsondata.repeat_end_date;
                                $('._repeatconfirmQuestion').text('총 '+jsondata.repeatScheduleCounterArray[0]+' 건의 일정이 등록됩니다.');
                                $('#repeat_confirm_day').text(day_info);
                                $('#repeat_confirm_dur').text(dur_info);
                                $('#id_repeat_schedule_id_confirm').val(repeatArray);
                                completeSend(); //ajax 로딩 이미지 숨기기
                                shade_index(200);
                                check_dropdown_selected_addplan();
                                //};
                            }else{
                                if(jsondata.push_lecture_id.length>0){
                                    for(var i=0; i<jsondata.push_lecture_id.length; i++) {
                                        send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i]);
                                    }
                                }

                                super_ajaxClassTime();
                                set_member_group_dropdown_list();
                                
                                close_planadd_popup();
                                close_planadd_popup_mini();
                                enable_window_scroll();
                                completeSend();
                                shade_index(-100);
                                var selector_calendar = $('#calendar');
                                selector_calendar.css('height', '100%');
                                if(bodywidth >= 600){
                                    selector_calendar.css('position', 'relative');
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
                });
            }


        }else{
            if($('#countsSelected').text() == 0){
                //alert('회원님의 남은 예약 가능 횟수가 없습니다.')
            }
            //alert('빠진 항목 체크해봐야함')
            //$('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
        }
    });

    $('#callbtn_repeat_reg_list').click(function(){
        //반복일정 등록 되는 리스트 호출
        $('#repeat_reg_list').show();
        set_list_overflow_scrolling('.repeat_list_wrapper', '#close_repeat_reg_list');
    });
    $(document).on('click', '#close_repeat_reg_list', function(){
        $('#repeat_reg_list').hide();
    });

    function draw_repeat_reg_list(jsondata){
        var targetHTML = $('#repeat_reg_list');
        var duplicatedDate = jsondata.RepeatDuplicationDateArray;
        var successDate = jsondata.RepeatSuccessDateArray;
        var dupli_len = duplicatedDate.length;
        var succ_len = successDate.length;

        var title = `<div id="close_repeat_reg_list">
                            반복일정 등록 리스트
                            <span>닫기</span>
                            <img src="/static/user/res/btn-today-left.png" class="dropdown_scroll_arrow_top">
                            <img src="/static/user/res/btn-today-left.png" class="dropdown_scroll_arrow_bottom" style="bottom:-230px;">
                    </div>
                    <div class="repeat_list_wrapper">`;
        var htmlToJoin = [title];

        for(var i=0; i<dupli_len; i++){
            htmlToJoin.push(
                                `<div class="repeat_reg_list_row repeat_failed_bg">
                                    <div class="repeat_reg_list_cell">${duplicatedDate[i]}</div>
                                    <div class="repeat_reg_list_cell"><img src="/static/user/res/member/icon-x-red.png" title="중복 일정">등록 불가</div>
                                </div>`
                            );
        }


        for(var j=0; j<succ_len; j++){
            htmlToJoin.push(
                                `<div class="repeat_reg_list_row">
                                    <div class="repeat_reg_list_cell">${successDate[j]}</div>
                                    <div class="repeat_reg_list_cell"><img src="/static/user/res/btn-pt-complete.png" title="정상 등록">정상 등록</div>
                                </div>`
                            );
        }
        htmlToJoin.push(`</div>`);
        targetHTML.html(htmlToJoin.join(""));

        //set_list_overflow_scrolling('.repeat_list_wrapper', '#close_repeat_reg_list');
    }


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

            ajaxRepeatConfirmSend('callback', function(){
                check_dropdown_selected_addplan();
            });
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
            ajaxRepeatConfirmSend('callback', function(){
                clear_repeat_add_popup();
                check_dropdown_selected_addplan();
                var id;
                if(addTypeSelect == "repeatgroupptadd"){
                    id = $('#cal_popup_repeatconfirm').attr('data-groupid');
                    get_groupmember_list(id, 'callback', function(jsondata){
                        draw_groupMemberList_to_view(jsondata, $('#groupmemberInfo'));
                    });
                }else{
                    id = $('#cal_popup_repeatconfirm').attr('data-dbid');
                }
                get_repeat_info(id);

                if(addTypeSelect != "repeatoffadd"){
                    $('#members_mobile, #members_pc').html('');
                    get_current_member_list('callback', function(jsondata){
                        set_member_dropdown_list(jsondata);
                        $('#countsSelected').text($('#members_mobile a[data-dbid="'+id+'"]').attr('data-lecturecount'));
                    });

                    get_member_lecture_list(id, 'callback', function(jsondata){
                        var availCount_personal = 0;
                        for(var i= 0; i<jsondata.availCountArray.length; i++){
                            if(jsondata.lectureStateArray[i] == "IP" && jsondata.checkOneToOneArray[i] == "1"){
                                availCount_personal = availCount_personal + Number(jsondata.availCountArray[i]);
                            }
                        }
                        $("#countsSelected").text(availCount_personal);
                    });
                    get_current_group_list('callback', function(jsondata){
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


    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext("2d");


    canvas.addEventListener("mousedown", listener);
    canvas.addEventListener("mousemove", listener);
    canvas.addEventListener("mouseup", listener);
    canvas.addEventListener("mouseout", listener);
    canvas.addEventListener("touchstart", listener);
    canvas.addEventListener("touchmove", listener);
    canvas.addEventListener("touchend", listener);
    canvas.addEventListener("touchcancel", listener);

    $("canvas").attr("width", 324).attr("height", 200);
    $(document).on('click', 'div.classTime, div.plan_raw, div.groupTime, #popup_btn_sign_close', function(){
        ctx.clearRect(0, 0, 324, 300);
        $('#cal_popup').css({'top':'35%'});
    });

    function listener(event){
        var selector_canvas = $('#canvas');
        var selector_pupup_text0_popup_btn_complete =  $('#popup_text0, #popup_btn_sign_complete');
        switch(event.type){
            case "touchstart":
                initDraw(event);
                selector_canvas.css({'border-color':'#fe4e65'});
                selector_pupup_text0_popup_btn_complete.css({'color':'#ffffff', 'background':'#fe4e65'}).val('filled');
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
                selector_pupup_text0_popup_btn_complete.css({'color':'#ffffff', 'background':'#fe4e65'}).val('filled');
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
        var offset_for_canvas__ = $('#canvas').offset();
        if(touch_or_mouse=="touch"){
            x = event.touches[0].pageX - offset_for_canvas__.left;
            y = event.touches[0].pageY - offset_for_canvas__.top;
        }else{
            x = event.pageX - offset_for_canvas__.left;
            y = event.pageY - offset_for_canvas__.top;
        }
        return {X:x, Y:y};
    }
});

function set_member_group_dropdown_list(init){
    var $member_list_dropdown = $('#members_mobile, #members_pc');
    $member_list_dropdown.html('').attr({"data-member":"unload", "data-group":"unload"});
    if(init == "init"){
        get_current_member_list("callback", function(jsondata){
            set_member_dropdown_list(jsondata);
            $member_list_dropdown.attr({"data-member":"loaded"});
        });
        get_current_group_list("callback", function(jsondata){
            $member_list_dropdown.attr({"data-group":"loaded"});
            set_group_dropdown_list(jsondata);
            set_list_overflow_scrolling("#members_pc", "#members_pc");
            set_list_overflow_scrolling('#durations_mini', '#durations_mini');
        });
    }else{
        get_current_member_list("callback", function(jsondata){
            if($member_list_dropdown.attr('data-member') == "unload"){
                $member_list_dropdown.attr('data-member', "loaded");
                set_member_dropdown_list(jsondata);
            }else if($member_list_dropdown.attr('data-member') == "loaded"){
                $member_list_dropdown.find("a[data-grouptype='personal']").parent("li").remove();
                $member_list_dropdown.find("img").parent("div").remove();
                $member_list_dropdown.attr('data-member', "loaded");
                set_member_dropdown_list(jsondata);
            }
        });
        get_current_group_list("callback", function(jsondata){
            if($member_list_dropdown.attr('data-group') == "unload"){
                $member_list_dropdown.attr('data-group', "loaded");
                set_group_dropdown_list(jsondata);
                set_list_overflow_scrolling("#members_pc", "#members_pc");
                set_list_overflow_scrolling('#durations_mini', '#durations_mini');
            }else if($member_list_dropdown.attr('data-group') == "loaded"){
                $member_list_dropdown.find("a[data-grouptype='group']").parent("li").remove();
                $member_list_dropdown.attr('data-group', "loaded");
                set_group_dropdown_list(jsondata);
            }
        });
    }
}


function float_btn_addplan(option){
    if(option == 0){
        if($('#float_btn').attr('data-open') == "closed"){
            $('#float_btn').attr('data-open', 'opened');
            $('#float_inner1').animate({'opacity':'1', 'bottom':'85px'}, 120);
            $('#float_inner2').animate({'opacity':'1', 'bottom':'145px'}, 120);
            $('#float_btn').addClass('rotate_btn');
            shade_index(100);
        }else if($('#float_btn').attr('data-open') == "opened"){
            $('#float_btn').attr('data-open', 'closed');
            $('#float_inner1,#float_inner2').animate({'opacity':'0', 'bottom':'25px'}, 10);
            $('#float_btn').removeClass('rotate_btn');
            shade_index(-100);
        }
        // if($('#pshade').css('display')=="block"){
        //     $('#float_inner1,#float_inner2').animate({'opacity':'0', 'bottom':'25px'}, 10);
        //     $('#float_btn').removeClass('rotate_btn');
        //     shade_index(-100);
        // }

    }else if(option == 1){
        clear_pt_off_add_popup();
        open_pt_off_add_popup('ptadd');
        //set_member_group_dropdown_list();
        ajaxTimeGraphSet(today_YY_MM_DD);
        shade_index(100);
        set_member_group_dropdown_list();
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
    var window_height = $(window).height();
    var selector_page_addplan = $('#page-addplan');
    var selector_datepicker = $('#datepicker');
    var selector_datepicker_repeat_start = $('#datepicker_repeat_start');
    var title_height = 47; //$('#addpopup_pc_label_new').height();
    var buttonwrap_height = 55; //$('#page_addmember .member_info_PC_buttons_wrap').height();

    if(date != undefined){
        selector_datepicker.datepicker('setDate', date);
        selector_datepicker.parent('p').addClass('dropdown_selected');
        selector_datepicker_repeat_start.datepicker('setDate', date);
        selector_datepicker_repeat_start.parent('p').addClass('dropdown_selected');
        selector_datepicker.css('-webkit-text-fill-color','#282828');
        selector_datepicker_repeat_start.css('-webkit-text-fill-color','#282828');
    }else{
        selector_datepicker.datepicker('setDate', currentYear+'-'+(currentMonth+1)+'-'+currentDate);
        selector_datepicker.parent('p').addClass('dropdown_selected');
        selector_datepicker_repeat_start.datepicker('setDate', currentYear+'-'+(currentMonth+1)+'-'+currentDate);
        selector_datepicker_repeat_start.parent('p').addClass('dropdown_selected');
        selector_datepicker.css('-webkit-text-fill-color','#282828');
        selector_datepicker_repeat_start.css('-webkit-text-fill-color','#282828');
    }

    if(option == "ptadd"){
        $('#remainCount, #groupInfo, #groupmembersInfo').css('display','none');
        $('#memberName').css('display', 'block');
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
        $(".pt_memo_guide").css('display', 'none');
    }

    $('#page-addplan-pc').css('display', 'none');
    $('.blankSelected').removeClass('blankSelected');

    if(bodywidth <= 820){
        $('#float_btn_wrap').hide();
        $('#float_btn').attr('data-open', 'closed');
        $('#float_btn').removeClass('rotate_btn');
        $('#float_inner1, #float_inner2').animate({'opacity':'0', 'bottom':'25px'}, 10);
    }
    if(bodywidth <= 600){
        $('#page-base, #float_btn_wrap, #addpopup_pc_label_pt, #addpopup_pc_label_off').hide();
        $('#page-base-addstyle, #page-addplan').show();
        selector_page_addplan.css('top', 50);
        // $('#float_btn').removeClass('rotate_btn');
        // $('#float_inner1, #float_inner2').animate({'opacity':'0', 'bottom':'25px'}, 10);
        $('#calendar').css('height', '0');
        $('#upbutton-x').attr('data-page', 'addplan');
        scrollToDom(selector_page_addplan);
    }else{
        disable_window_scroll();
        $('#page_addplan_input_wrap').css('height', window_height - 100 - title_height - buttonwrap_height);
        var centerLoc = (($(window).height()-selector_page_addplan.outerHeight())/2+$(window).scrollTop());
        selector_page_addplan.show().css({'top':centerLoc,
                                            'left':(($(window).width()-selector_page_addplan.outerWidth())/2+$(window).scrollLeft())
                                            });


        /*selector_page_addplan.css({'display':'block','top':(($(window).height()-selector_page_addplan.outerHeight())/2+$(window).scrollTop()),
            'left':(($(window).width()-selector_page_addplan.outerWidth())/2+$(window).scrollLeft())});*/
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
    $('#timeGraph').css('display', 'none');
    //$('.plan_indicators').html('')

    //시작시간, 진행시간 드랍다운 초기화
    $("#starttimesSelected button, #durationsSelected button").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>선택</span>").val("");
    $("#starttimes, #durations").empty();

    //메모 지우기
    $('#scheduleMemo input').val('').text('');
    $('#id_memo_mini, #id_memo_mini_off').val('');

    //모든 하단 핑크선 지우기
    $('#page-addplan .dropdown_selected').removeClass('dropdown_selected');

    //상단 일반-반복 토글 스위치 초기화
    $('.mode_switch_button_wrap_cal div').removeClass('mode_active');
    $('.mode_switch_button_wrap_cal div:first-child').addClass('mode_active');

    //반복일정 요일선택 버튼 초기화
    selectedDayGroup = [];
    $('.dateButton').removeClass('dateButton_selected');

    //반복일정 시작일자, 종료일자 초기화
    $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate', null);

    //반복빈도, 시작시간, 진행시간 드랍다운 초기화
    $('#repeattypeSelected button, #repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>선택</span>");

    //반복일정 접기
    $('._NORMAL_ADD_wrap').css('display', 'block');
    $('._REPEAT_ADD_wrap').css('display', 'none');
}

function clear_repeat_add_popup(){
    //반복일정 요일선택 버튼 초기화
    selectedDayGroup = [];
    $('.dateButton').removeClass('dateButton_selected');

    //반복일정 시작일자, 종료일자 초기화
    $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate', null);
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
    });
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
    });
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
        member_array_mobile[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;height:auto;">등록된 회원이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
        member_array_pc[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;height:auto;">등록된 회원이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
    }
    member_array_mobile.push('<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>');
    member_array_pc.push('<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>');
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
            if(jsondata.group_type_cd[i]!='ONE_TO_ONE') {
                member_array_mobile.push('<li><a  data-grouptype="group" data-grouptypecd_nm="' + jsondata.group_type_cd_nm[i] + '" data-grouptypecd="' + jsondata.group_type_cd[i] + '" data-groupmembernum="' + jsondata.group_member_num[i] + '" data-membernum="' + jsondata.member_num[i] + '" data-groupid="' + jsondata.group_id[i] + '">[' + jsondata.group_type_cd_nm[i] + '] ' + jsondata.group_name[i] + '</a></li>');
                member_array_pc.push('<li><a  data-grouptype="group" data-grouptypecd_nm="' + jsondata.group_type_cd_nm[i] + '" data-groupmembernum="' + jsondata.group_member_num[i] + '" data-membernum="' + jsondata.member_num[i] + '" data-groupid="' + jsondata.group_id[i] + '">[' + jsondata.group_type_cd_nm[i] + '] ' + jsondata.group_name[i] + '</a></li>');
            }
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

                completeSend(); //ajax 로딩이미지 숨기기

                super_ajaxClassTime('callafter',function(){
                    if(use == "callback"){
                        callback(jsondata);
                    }
                });

            }
        },

        complete:function(){
            ajax_block_during_repeat_confirm = true;
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text("서버 통신 실패-관리자에게 문의해주세요.");
        }
    });
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
        type : 'GET',
        data : {"date":today_form, "day":1}, //월간 46 , 주간 18, 하루 1
        dataType : 'html',

        beforeSend:function(xhr){
            beforeSend();
            pters_option_inspector("plan_create", xhr, today_form);
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
                draw_time_graph(60, '', today_form);
                timeGraphSet("class", "pink", "AddClass", jsondata);  //시간 테이블 채우기
                timeGraphSet("group", "pink", "AddClass", jsondata);
                timeGraphSet("off", "grey", "AddClass", jsondata);
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
    });
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
        type_ = 'GET';
    }else if(addTypeSelect == "groupptadd" || addTypeSelect == "repeatgroupptadd"){
        url_ = '/trainer/get_group_repeat_schedule_list/';
        data_ = {"group_id": dbID};
        fill_option = 'group';
        type_ = 'GET';
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
    });
}


function get_member_repeat_id_in_group_repeat(group_repeat_id, use, callback){
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_group_member_repeat_schedule_list')
    $.ajax({
        url: '/trainer/get_group_member_repeat_schedule_list/',
        type : 'GET',
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
    });
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
            'SUN':'일요일', 'MON':'월요일', 'TUE':'화요일', 'WED':'수요일', 'THS':'목요일', 'FRI':'금요일', 'SAT':'토요일'},
        'JPN':
            {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                'SUN':'日曜日', 'MON':'月曜日', 'TUE':'火曜日', 'WED':'水曜日', 'THS':'木曜日', 'FRI':'金曜日', 'SAT':'土曜日'},
        'ENG':
            {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                'SUN':'Sun', 'MON':'Mon', 'TUE':'Tue', 'WED':'Wed', 'THS':'Thr', 'FRI':'Fri', 'SAT':'Sat'}
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
        if(option == "off"){
            repeat_title = '';
        }
        var repeat_id = repeat_id_array[i];
        var repeat_type = repeat_info_dict['KOR'][repeat_type_array[i]];
        var repeat_start = repeat_start_array[i].replace(/-/gi, ".");
        var repeat_start_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복시작 : </span>";
        var repeat_end_text_small = "<span class='summaryInnerBoxText_Repeatendtext_small'>~</span>";
        var repeat_end_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복종료 : </span>";
        var repeat_end = repeat_end_array[i].replace(/-/gi, ".");
        var repeat_time = Number(repeat_time_array[i].split(':')[0]); // 06 or 18
        var repeat_min = Number(repeat_time_array[i].split(':')[1]);  // 00 or 30
        if(repeat_min == "30"){
            repeat_time = Number(repeat_time_array[i].split(':')[0])+0.5;
        }

        var repeat_start_time = repeat_time_array[i].split(':')[0] +':'+ repeat_time_array[i].split(':')[1];
        var repeat_end_time = repeat_endTime_array[i].split(':')[0] +':'+ repeat_endTime_array[i].split(':')[1];

        var repeat_day =  function(){
            var repeat_day_info_raw = repeat_day_info_raw_array[i].split('/');
            var repeat_day_info = "";
            if(repeat_day_info_raw.length>1){
                for(var j=0; j<repeat_day_info_raw.length; j++){
                    repeat_day_info = repeat_day_info + '/' + repeat_info_dict['KOR'][repeat_day_info_raw[j]].substr(0, 1);
                }
            }else if(repeat_day_info_raw.length == 1){
                repeat_day_info = repeat_info_dict['KOR'][repeat_day_info_raw[0]];
            }
            if(repeat_day_info.substr(0, 1) == '/'){
                repeat_day_info = repeat_day_info.substr(1, repeat_day_info.length);
            }
            return repeat_day_info;
        };
        var summaryInnerBoxText_1 = '<span class="summaryInnerBoxText">'+'<span style="color:#fe4e65;">'+repeat_title+'</span><br><span>'+repeat_type +' '+repeat_day() +' '+repeat_start_time+' ~ '+repeat_end_time+'</span></span>';
        if (dbId == ""){
            summaryInnerBoxText_1 = '<span class="summaryInnerBoxText">'+'<span style="line-height:40px;">'+repeat_type +' '+repeat_day() +' '+repeat_start_time+' ~ '+repeat_end_time+'</span></span>';
        }
        var summaryInnerBoxText_2 = '<span class="summaryInnerBoxText2">'+repeat_start_text+repeat_end_text_small+repeat_start+'</span>';
        var summaryInnerBoxText_3 = '<span class="summaryInnerBoxText3">'+repeat_end_text+repeat_end_text_small+repeat_end+'</span>';
        var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin" data-dbid="'+dbId+'" data-deletetype="'+option+'" data-repeatid="'+repeat_id+'"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>';
        schedulesHTML[i] = '<div class="summaryInnerBox" data-id="'+repeat_id+'">'+summaryInnerBoxText_1+summaryInnerBoxText_2+summaryInnerBoxText_3+deleteButton+'</div>';
    }

    var summaryText = '<span id="summaryText">설정된 반복일정</span>';
    if(schedulesHTML.length>0){
        $('#offRepeatSummary').html(summaryText + schedulesHTML.join('')).show();
    }else{
        $('#offRepeatSummary').hide();
    }
}


function popup_repeat_confirm(){ //반복일정을 서버로 보내기 전 확인 팝업을 보여준다.
    var repeat_info_dict= { 'KOR':
        {'DD':'매일', 'WW':'매주', '2W':'격주',
            'SUN':'일요일', 'MON':'월요일', 'TUE':'화요일', 'WED':'수요일', 'THS':'목요일', 'FRI':'금요일', 'SAT':'토요일'},
        'JPN':
            {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                'SUN':'日曜日', 'MON':'月曜日', 'TUE':'火曜日', 'WED':'水曜日', 'THS':'木曜日', 'FRI':'金曜日', 'SAT':'土曜日'},
        'ENG':
            {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                'SUN':'Sun', 'MON':'Mon', 'TUE':'Tue', 'WED':'Wed', 'THS':'Thr', 'FRI':'Fri', 'SAT':'Sat'}
    };
    $('#cal_popup_repeatconfirm').css('display', 'block');
    shade_index(200);
    var $id_repeat_freq ='';
    // var $id_repeat_start_date = '';
    // var $id_repeat_end_date = '';
    var $id_repeat_day = '';
    if(addTypeSelect == "repeatoffadd"){
        $id_repeat_freq = $('#id_repeat_freq_off');
        // $id_repeat_start_date = $('#id_repeat_start_date_off');
        // $id_repeat_end_date = $('#id_repeat_end_date_off');
        $id_repeat_day = $('#id_repeat_day_off');
    }else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
        $id_repeat_freq = $('#id_repeat_freq');
        // $id_repeat_start_date= $('#id_repeat_start_date');
        // $id_repeat_end_date = $('#id_repeat_end_date');
        $id_repeat_day = $('#id_repeat_day');
    }

    var repeat_type = repeat_info_dict['KOR'][$id_repeat_freq.val()];
    // var repeat_start = $id_repeat_start_date.val().replace(/-/gi,'.');
    // var repeat_end = $id_repeat_end_date.val().replace(/-/gi,'.');
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
        if(repeat_day_info.substr(0, 1) == ','){
            repeat_day_info = repeat_day_info.substr(1, repeat_day_info.length);
        }
        return repeat_day_info;
    };
    var repeat_input_day_info = repeat_type + ' ' + repeat_day();
    // var repeat_input_dur_info = repeat_start + ' ~ ' + repeat_end;
    return {
        day_info : repeat_input_day_info
        // dur_info : repeat_input_dur_info
    };
    locate_this_to_center('#cal_popup_repeatconfirm');
}


$('.add_time_unit').click(function(){
    clear_start_dur_dropdown();
    var $child = $(this).find('div');
    if($(this).hasClass('checked')){
        $(this).removeClass('checked');
        $child.removeClass('ptersCheckboxInner_sm');
        ajaxTimeGraphSet($('#datepicker').val());
    }else{
        $(this).addClass('checked');
        $child.addClass('ptersCheckboxInner_sm');
        ajaxTimeGraphSet($('#datepicker').val());
    }
});


function startTimeArraySet(selecteddate, jsondata, Timeunit){ //offAddOkArray 채우기 : 시작시간 리스트 채우기!!!!
    var option;
    switch(option){
        case "class" :
            option = "";
            break;
        case "mini" :
            option = "_mini";
            break;
    }
    var workStartTime_ = time_h_m_to_hh_mm(`${Options.workStartTime}:00`);
    var workEndTime_ = time_h_m_to_hh_mm(`${Options.workEndTime}:00`);
    if(workEndTime_ == "23:59"){
        workEndTime_ = "24:00";
    }

    var plan_time = [];

    //중복 제거 (그룹 일정때문에 중복으로 들어오는 것들)
    var all_start_date_time;
    var all_end_date_time;
    all_start_date_time = jsondata.classTimeArray_start_date.concat(jsondata.group_schedule_start_datetime);
    all_end_date_time = jsondata.classTimeArray_end_date.concat(jsondata.group_schedule_end_datetime);
    all_start_date_time = all_start_date_time.concat(jsondata.offTimeArray_start_date);
    all_end_date_time = all_end_date_time.concat(jsondata.offTimeArray_end_date);

    var disable_time_array_start_date = remove_duplicate_in_list(all_start_date_time);
    var disable_time_array_end_date = remove_duplicate_in_list(all_end_date_time);
    // calc_and_make_plan_time(disable_time_array_start_date, disable_time_array_end_date);
    for(var i=0; i<disable_time_array_start_date.length; i++){
        var plan_start_date = disable_time_array_start_date[i].split(' ')[0];
        var plan_start_time = disable_time_array_start_date[i].split(' ')[1].split(':')[0]+':'+disable_time_array_start_date[i].split(' ')[1].split(':')[1];
        var plan_end_date = disable_time_array_end_date[i].split(' ')[0];
        var plan_end_time = disable_time_array_end_date[i].split(' ')[1].split(':')[0]+':'+disable_time_array_end_date[i].split(' ')[1].split(':')[1];
        if(plan_start_date == selecteddate){
            plan_time.push(plan_start_time);
        }
        if (plan_end_date == selecteddate && plan_end_time != "00:00") {
            plan_time.push(plan_end_time);
        } else if (plan_end_date == date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(selecteddate, 1), '-') && plan_end_time == "00:00") {
            plan_time.push('24:00');
        }
    }

    // var classTimeArray_start_date = remove_duplicate_in_list(jsondata.classTimeArray_start_date);
    // var classTimeArray_end_date = remove_duplicate_in_list(jsondata.classTimeArray_end_date);
    // var groupTimeArray_start_date_ = remove_duplicate_compared_to(jsondata.group_schedule_start_datetime, classTimeArray_start_date);
    // var groupTimeArray_end_date_ = remove_duplicate_compared_to(jsondata.group_schedule_end_datetime, classTimeArray_end_date);
    // var groupTimeArray_start_date = remove_duplicate_compared_to(groupTimeArray_start_date_, jsondata.offTimeArray_start_date);
    // var groupTimeArray_end_date = remove_duplicate_compared_to(groupTimeArray_end_date_, jsondata.offTimeArray_end_date);

    // calc_and_make_plan_time(classTimeArray_start_date, classTimeArray_end_date);
    // calc_and_make_plan_time(groupTimeArray_start_date, groupTimeArray_end_date);
    // calc_and_make_plan_time(jsondata.offTimeArray_start_date, jsondata.offTimeArray_end_date);

    // function calc_and_make_plan_time(startArray, endArray){
    //     for(var i=0; i<startArray.length; i++){
    //         var plan_start_date = startArray[i].split(' ')[0];
    //         var plan_start_time = startArray[i].split(' ')[1].split(':')[0]+':'+startArray[i].split(' ')[1].split(':')[1];
    //         var plan_end_date = endArray[i].split(' ')[0];
    //         var plan_end_time = endArray[i].split(' ')[1].split(':')[0]+':'+endArray[i].split(' ')[1].split(':')[1];
    //         if(plan_start_date == selecteddate){
    //             plan_time.push(plan_start_time);
    //         }
    //         if (plan_end_date == selecteddate && plan_end_time != "00:00") {
    //             plan_time.push(plan_end_time);
    //         } else if (plan_end_date == date_format_yyyy_m_d_to_yyyy_mm_dd(add_date(selecteddate, 1), '-') && plan_end_time == "00:00") {
    //             plan_time.push('24:00');
    //         }
    //     }
    // }

    //if(plan_time.indexOf("00:00") < 0){
        plan_time.push("00:00");
    //}
    //if(plan_time.indexOf("24:00") < 0){
        plan_time.push("24:00");
    //}

    var sortedlist = plan_time.sort();

    //all_plans = sortedlist;
    //index 사이 1-2, 3-4, 5-6, 7-8, 9-10, 11-12, 13-14
    var semiresult = [];
    for(var p=0; p<sortedlist.length/2; p++){
        var zz = 0;
        //일정 시작시간이 일정 종료시간보다 작으면,
        // if(compare_time(add_time(sortedlist[p*2],'0:'+Number(zz+Timeunit)), add_time(sortedlist[p*2+1],'0:00')) ==false &&
        //     compare_time( add_time(sortedlist[p*2],'0:'+Number(zz+Timeunit)), add_time(workEndTime_ ,'00:00')) == false  ){

        // while 조건 : 검사하는 시작시각이 이미 존재하는 일정의 시작시각보다 작을때 동작
        while(!compare_time(add_time(sortedlist[p*2], '0:'+Number(zz+Timeunit)), add_time(sortedlist[p*2+1], '0:00'))){
            // 업무 시작시각보다 큰 시작사각만 추가
            if( compare_time( workStartTime_, add_time(sortedlist[p*2], '0:'+zz) ) == false){
                // 업무 종료시각 - Timeunit 보다 작은 시작시각만 추가
                if (compare_time( add_time(sortedlist[p*2], '0:'+zz), substract_time(workEndTime_, `00:${Timeunit}`) ) ==false){
                    semiresult.push(add_time(sortedlist[p*2], '0:'+zz));
                }
            }
            // Timeunit 만큼 더해준다.
            zz += 1;
            // 방어 코드
            if(zz>1450){ //하루 24시간 --> 1440분
                alert('예상치 못한 에러가 발생했습니다. \n 관리자에게 문의해주세요.');
                break;
            }

        }

        // }
    }

    //offAddOkArray = []
    if(Timeunit == 60){
        Timeunit = 30;
    }
    var addOkArrayList = [];
    for(var t=0; t<semiresult.length; t++){
        if(Number(semiresult[t].split(':')[1])%Timeunit == 0){                                          //몇분 간격으로 시작시간을 보여줄 것인지?
            addOkArrayList.push(semiresult[t]);
        }
    //     //if(Number(semiresult[t].split(':')[1])%Timeunit == 0){  //몇분 간격으로 시작시간을 보여줄 것인지?
    //     if(selecteddate == currentDate){                                                                   //선택한 날짜가 오늘일 경우
    //         //if(compare_time(semiresult[t], add_time(Options.workEndTime+':00', '00:00')) == false           //업무시간
    //             //&& compare_time(semiresult[t], add_time(Options.workStartTime+':00', '00:00')) ){
    //             if(Number(semiresult[t].split(':')[1])%Timeunit == 0){                                          //몇분 간격으로 시작시간을 보여줄 것인지?
    //                 addOkArrayList.push(semiresult[t]);
    //             }
    //         //}
    //     }else{                                                                                     //선택한 날짜가 오늘이 아닐경우
    //         //if(compare_time(semiresult[t], add_time(Options.workEndTime+':00', '00:00')) == false
    //             //&& compare_time(add_time(Options.workStartTime+':00', '00:00'),semiresult[t]) == false){        //업무시간
    //             if(Number(semiresult[t].split(':')[1])%Timeunit == 0){                                          //몇분 간격으로 시작시간을 보여줄 것인지?
    //                 addOkArrayList.push(semiresult[t]);
    //             }
    //         //}
    //     }
    }
    allplans = [];
    // 업무 시작시각과 종료시각에만 영향 가도록 변경 -> side effect 줄이기 위해
    for(var j=0; j<sortedlist.length; j++){
        if(j==0) {
            // if(sortedlist[j] == "00:00"){
            allplans.push(workStartTime_);
        }else if(j==sortedlist.length-1){
        // }else if(sortedlist[j] == "24:00"){
            allplans.push(workEndTime_);
        }else{
            allplans.push(sortedlist[j]);
        }
    }
    return {"addOkArray":addOkArrayList, "allplans":allplans};
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


function draw_time_graph(option, type, thisDate){  //type = '' and mini
    var thisdate = thisDate;
    var day = new Date(thisDate).getDay();

    var work_start = Options.workStartTime;
    var work_end = Options.workEndTime;
    var work_start_thisday = worktime_extract_hour(Options.worktimeWeekly[day])["start"];
    var work_end_thisday = worktime_extract_hour(Options.worktimeWeekly[day])["end"];

    var targetHTML =  '';
    var types = '';
    if(type == 'mini'){
        targetHTML =  $('#timeGraph.ptaddbox_mini table');
        types = "_mini";
    }else{
        targetHTML =  $('#timeGraph._NORMAL_ADD_timegraph .timegraphtext');
        types = '';
    }

    var tdwidth = (100/(work_end - work_start));
    var tdwidth_ = (100/(work_end - work_start));


    var tr1 = [];
    var tr2 = [];
    var i = work_start;
    if(option == "30"){
        for(var i=0; i<=24; i++){
            var display = "";
            var worktime_disable = "";
            if(i<work_start || i >= work_end){
                var display = 'display:none;';
            }
            if( (i >= work_start && i < work_start_thisday) || ( i <= work_end && i >= work_end_thisday ) ){
                var worktime_disable = "worktime_disable";
            }
            tr1[i] = `<div colspan="2" style="width:${tdwidth_}'%;${display}" class="colspan">${i}</div>`;
            //tr2[i] = '<div id="'+(i)+'g_00'+types+'" class="tdgraph_'+option+' tdgraph00" style="width:'+tdwidth+'%;"></div><div id="'+(i)+'g_30'+types+'" class="tdgraph_'+option+' tdgraph30" style="width:'+tdwidth+'px;"></div>';
            tr2[i] = `<div id="${i}g_00${types}" class="tdgraph_${option} tdgraph00 ${worktime_disable}" style="width:${tdwidth}%;${display}"></div><div id="${i}g_30${types}" class="tdgraph_${option} tdgraph30" style="width:${tdwidth}px;"></div>`;
        }
    }else if(option == "60"){
        for(var i=0; i<=24; i++){
            var display = "";
            var worktime_disable = "";
            if(i<work_start || i >= work_end){
                var display = 'display:none;';
            }
            if( (i >= work_start && i < work_start_thisday) || ( i <= work_end && i >= work_end_thisday ) ){
                var worktime_disable = "worktime_disable";
            }
            tr1[i] = `<div style="width:${tdwidth}%;${display}" class="colspan">${i}</div>`;
            tr2[i] = `<div id="${i}g_00${types}" class="tdgraph_${option} tdgraph00 ${worktime_disable}" style="width:${tdwidth}%;${display}"></div>`;
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
            break;
        case "group" :
            planStartDate = jsondata.group_schedule_start_datetime;
            planEndDate = jsondata.group_schedule_end_datetime;
            planMemberName = jsondata.group_schedule_group_name;
            planScheduleIdArray = jsondata.group_schedule_id;
            planNoteArray = jsondata.group_schedule_note;
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

    date = $('#datepicker').val();
    for(var i=0; i<Arraylength; i++){
        var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
        var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
        var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
        var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
        var planMinute  = Number(planStartDate[i].split(' ')[1].split(':')[1]);
        var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
        var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
        var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];

        if(add_date(planEndDate[i].split(' ')[0], 0) == add_date(planStartDate[i].split(' ')[0], 1) && planEndDate[i].split(' ')[1] == "00:00:00" ){
            planEndHour = "24";
            planEndMin = '00';
        }

        var timegraph_hourwidth;
        var timegraph_houroffset;
        var timegraph_houroffsetb;
        var timegraph_hourendwidth;
        var timegraph_hourendoffset;

        var work_start = add_time(Options.workStartTime+':00', '00:00');
        var work_end = add_time(Options.workEndTime+':00', '00:00');
        var plan_start = add_time(planHour+':'+planMinute, '00:00');
        var plan_end = add_time(planEndHour+':'+planEndMin, '00:00');

        timegraph_hourwidth = $('#'+planHour+'g_00').width();
        timegraph_houroffset = $('#'+planHour+'g_00').position().left + timegraph_hourwidth*(planMinute/60);
        timegraph_houroffsetb = $('#'+planHour+'g_00').position().top;
        timegraph_hourendwidth = $('#'+planEndHour+'g_00').width();
        timegraph_hourendoffset = $('#'+planEndHour+'g_00').position().left + timegraph_hourendwidth*(planEndMin/60);

        var $workstarttime = $(`#${Options.workStartTime}g_00`);
        var $workendtime = $(`#${Options.workEndTime-1}g_00`);
        if(planHour<Options.workStartTime){ //시작시간이 업무시간 전에 있을 경우
            if(planEndHour >= Options.workStartTime && planEndHour < Options.workEndTime){ //종료시간이 업무시간 안에 있을 경우
                timegraph_hourwidth = $workstarttime.width();
                timegraph_houroffset = $workstarttime.position().left;
                timegraph_houroffsetb = $workstarttime.position().top;
                var flag = 'flag1';
            }else if(planEndHour < Options.workStartTime){                                 //종료시간이 업무시간 전에 있을 경우
                //숨김
                continue;
            }else if(planEndHour >= Options.workEndTime){                                    //종료시간이 업무시간 후에 있을 경우
                timegraph_hourwidth = $workstarttime.width();
                timegraph_houroffset = $workstarttime.position().left + timegraph_hourwidth*(planMinute/60);
                timegraph_houroffsetb = $workstarttime.position().top;
                timegraph_hourendwidth = $workendtime.width();
                timegraph_hourendoffset = $workendtime.position().left + timegraph_hourendwidth;
            }
        }else if(planHour >= Options.workStartTime && planHour < Options.workEndTime ){ // 시작시간이 업무시간 내에 있을 경우
            if(planEndHour >= Options.workStartTime && planEndHour < Options.workEndTime){ //종료시간이 업무시간 안에 있을 경우
                //정상 경우
            }else if(planEndHour < Options.workStartTime){                                 //종료시간이 업무시간 전에 있을 경우
                //경우 발생하지 않음
            }else if(planEndHour >= Options.workEndTime){                                    //종료시간이 업무시간 후에 있을 경우
                timegraph_hourendwidth = $workendtime.width();
                timegraph_hourendoffset = $workendtime.position().left + timegraph_hourendwidth;
            }
        }else if(planHour >= Options.workEndTime){                                       //시작시간이 업무시간 후에 있을 경우
            //패스
            continue;
        }


        if(date_format_yyyy_m_d_to_yyyy_mm_dd(planYear+'-'+planMonth+'-'+planDate,'-') == date){
            var planWidth   = timegraph_hourendoffset - timegraph_houroffset;
            var planLoc     = timegraph_houroffset;

            if(type=="class" && jsondata.group_schedule_start_datetime.indexOf(planStartDate[i]) >= 0){

            }else{
                htmlToJoin.push(`<div class="${cssClass}" style="width:${planWidth}px;left:${planLoc}px;top:${timegraph_houroffsetb}px;" data-type="${type}" data-typeg="${Page}"></div>`);
            }
        }
    }
    $tableTarget.append(htmlToJoin.join(''));
}


function durTimeSet(selectedTime, selectedMin, option, Timeunit){ // durAddOkArray 채우기 : 진행 시간 리스트 채우기
    var timelist = remove_duplicate_in_list(allplans);
    var durTimeList;
    var options;
    var plansArray=[];
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
    // 시간이 1:00 로 들어오는 경우 01:00으로 바꿈
    if(selectedTime.length < 2){
        selectedTime = '0'+selectedTime;
    }
    if(selectedMin.length < 2){
        selectedMin = '0' + selectedMin;
    }
    var selected_time = selectedTime + ':' + selectedMin;

    if(timelist.length == 0){
        plansArray = [time_h_m_to_hh_mm(`${Options.workStartTime}:00`), time_h_m_to_hh_mm(`${Options.workEndTime}:00`)];
    }else{
        for(var j=0; j<timelist.length; j++){
            plansArray.push(timelist[j]);
        }
    }

    // 내가 선택한 시작시각이 list에 없는경우 추가
    if(plansArray.indexOf(selected_time) == -1){
        plansArray.push(selected_time);
    }

    var sortedlist = plansArray.sort();
    var index = sortedlist.indexOf(selected_time);

    var zz = Timeunit;
    // var zz = 0;
    durTimeList.html('');

    // while 동작 조건 내가 선택한 시작시각에 진행시각 더한값이 다음 일정 시작시각을 넘지 않는 경우 동작
    // while(add_time(selectedTime+':'+selectedMin, '00:0'+zz) != sortedlist[index+1]){
    while(!compare_time(add_time(selected_time, '00:0'+zz), sortedlist[index+1])){
        // zz++;
        //console.log(zz)
        //console.log(add_time(selectedTime+':'+selectedMin, '00:0'+zz) , sortedlist[index+1])
        // if(zz%Timeunit == 0){ //진행시간을 몇분 단위로 표기할 것인지?
        durTimeList.append('<li><a data-dur="'+zz/Options.classDur+'" data-durmin="'+zz+'" data-endtime="'+add_time(selected_time, '00:0'+zz)+'" class="pointerList">'
            +duration_number_to_hangul_minute(zz)+'  (~ '+add_time(selected_time, '00:0'+zz)+')'+'</a></li>');
        // }
        zz += Timeunit;

        if(zz > 1600){
            alert('예상치 못한 에러가 발생했습니다. \n 관리자에게 문의해주세요.');
            break;
        }
    }

    durTimeList.prepend('<div><a class="pointerList">진행시간 선택</a></div>');
    durTimeList.append('<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>');
}

function addGraphIndicator(durmin){
    if($('.timegraph_display .selectedplan_indi').length == 0){
        $('.timegraph_display').append('<div class="selectedplan_indi"></div>');
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

    $('.selectedplan_indi').css({'top':timegraph_houroffsetb, 'left':planLoc, 'width':planWidth});
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
        for(var i=0; i<=23; i++){
            var time = $('#'+i+'g');
            if(i<=hh+limit){
                time.addClass('greytimegraph');
            }
        }
    }
}

function scrollToIndicator(dom){
    var offset = dom.offset();
    $('body, html').animate({scrollTop : offset.top-180}, 700);
}


function send_push_func(lecture_id, title, message){

    $.ajax({
        url: '/schedule/send_push_to_trainee/',
        type : 'POST',
        dataType: 'html',
        data : {"lecture_id":lecture_id, "title":title, "message":message, "next_page":'/trainer/get_error_info/'},

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
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
    });
}


//그룹..

$(document).on('click', 'img.add_groupmember_plan', function(){
    $('#form_add_member_group_plan_scheduleid').val($(this).attr('group-schedule-id'));
    $('#form_add_member_group_plan_groupid').val($(this).attr('data-groupid'));
    $('#form_add_member_group_plan_max').val($(this).attr('data-membernum'));
    $('#subpopup_addByList_plan').show();
    //get_current_member_list('callback',function(jsondata){draw_groupParticipantsList_to_add(jsondata, $('#subpopup_addByList_whole'))});//전체회원 조회
    var parentPopupHeight = $('#cal_popup_planinfo').height();
    get_groupmember_list($(this).attr('data-groupid'), 'callback', function(jsondata){draw_groupParticipantsList_to_add(jsondata, $('#subpopup_addByList_thisgroup'));
                                                                                        $('#subpopup_addByList_plan').css({'top': (parentPopupHeight-$('#subpopup_addByList_plan').height())/2});
                                                                                        set_pters_scrolling_to_groupmember_add();});//특정그룹회원 목록 조회
});

$(document).on('click', '#close_subpopup_addBylist_plan', function(){
    $('#subpopup_addByList_plan').hide();
});


//그룹 일정에 속한 회원목록을 받아온다.
function get_group_plan_participants(group_schedule_id, callbackoption, callback){
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_group_member_schedule_list')
    $.ajax({
        url: '/trainer/get_group_member_schedule_list/',
        type : 'GET',
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
            }else{
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
    });
}
//그룹 일정에 속한 회원목록을 받아온다.

//그룹에 일정에 속한 회원목록을 그린다. get_group_plan_participants와 같이 쓴다.
function draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id, max){
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
        htmlToJoin.unshift('<div style="margin-top:10px;margin-bottom:10px;"><img src="/static/user/res/floatbtn/btn-plus.png" class="add_groupmember_plan" group-schedule-id="'+group_schedule_id+'" data-groupid="'+group_id+'" data-membernum="'+max+'"></div>');
    }
    target.html(htmlToJoin.join(''));
}
//그룹에 일정에 속한 회원목록을 그린다. get_group_plan_participants와 같이 쓴다.


//참석자에서 + 버튼을 눌렀을때 회원 리스트 불러오기
function draw_groupParticipantsList_to_add(jsondata, targetHTML){
    var len = jsondata.db_id.length;
    var htmlToJoin = ['<div class="list_addByList listTitle_addByList" style="border-color:#ffffff;text-align:center;">내 리스트에서 추가</div>'+'<div class="list_addByList listTitle_addByList"><div>'+'회원명(ID)'+'</div>'+'<div>'+'연락처'+'</div>'+'<div>추가</div>'+'</div>'];
    var addedCount = 0;

    for(var i=1; i<=len; i++){
        if($('#groupParticipants div.groupParticipantsRow[data-dbid="'+jsondata.db_id[i-1]+'"]').length == 0){
            addedCount++;
            var sexInfo = '<img src="/static/user/res/member/icon-sex-'+jsondata.sex[i-1]+'.png">';
            htmlToJoin[i] = '<div class="list_addByList_padding list_addByList" data-lastname="'+jsondata.last_name[i-1]+
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
        htmlToJoin.push("<div class='list_addByList_padding list_addByList' style='margin-top:30px;margin-bottom:30px;border:0'>소속된 회원이 없습니다.</div>");
    }
    if(addedCount == 0){
        htmlToJoin.push("<div class='list_addByList_padding list_addByList' style='margin-top:30px;margin-bottom:30px;border:0'>일정 등록 가능한  회원이 없습니다.</div>");
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
        htmlToJoin.push("<div class='list_viewByList' style='margin-top:30px;margin-bottom:30px;border:0'>소속된 회원이 없습니다.</div>");
    }
    if(addedCount == 0){
        htmlToJoin.push("<div class='list_viewByList' style='margin-top:30px;margin-bottom:30px;border:0'>일정 등록 가능한  회원이 없습니다.</div>");
    }
    htmlToJoin.push("<div style='text-align:center;'><img src='/static/user/res/PTERS_logo_pure.png' style='width:50px;margin-top:3px;opacity:0.3;'></div>");
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
                enable_group_member_add_after_ajax();
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
                    get_group_plan_participants(sendData[2]["value"], 'callback', function(d){draw_groupParticipantsList_to_popup(d, sendData[5]["value"], sendData[2]["value"], sendData[6]["value"]);});
                    alert('일정 참석자 정상 등록되었습니다.');
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
}


//그룹/클래스 일정내에서 그룹원을 일정에 추가할때
function set_pters_scrolling_to_groupmember_add($selector){ //subpopup_addByList_thisgroup or subpopup_addByList_whole
    append_dropdown_scroll_arrow('#subpopup_addByList_plan #subpopup_addByList_thisgroup', '#subpopup_addByList_plan .mode_switch_button_wrap_cal', 25, -420, 'left:0;', 'left:0;');
    set_list_overflow_scrolling('#subpopup_addByList_plan #subpopup_addByList_thisgroup', '#subpopup_addByList_plan .mode_switch_button_wrap_cal');
}


$(document).on('click', '.group_member_cancel', function(){
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
        }
        get_group_plan_participants(group_schedule_id, 'callback', function(jsondata){
            draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id, max);
            $('#groupplan_participants_status').text(
                                                        ' ('+$('div.groupParticipantsRow').length +
                                                        '/'+
                                                        max+')'
                                                    );
        });
    });
});


function send_plan_delete(option, callbackoption, callback){
    var $form;
    var serializeArray;
    var sendData;
    var url_;
    var selected_date;
    if(option == "pt"){
        $form = $('#daily-pt-delete-form');
        serializeArray = $form.serializeArray();
        url_ = '/schedule/delete_schedule/';
        selected_date = $('#id_date_info').val();
    }else if(option == "off"){
        $form = $('#daily-off-delete-form');
        serializeArray = $form.serializeArray();
        url_ = '/schedule/delete_schedule/';
        selected_date = $('#id_date_info_off').val();
    }else if(option == "group"){
        $form = $('#daily-pt-delete-form');
        $('#id_schedule_id').val($('#cal_popup_plandelete').attr('schedule-id'));
        serializeArray = $form.serializeArray();
        url_ = '/schedule/delete_group_schedule/';
        selected_date = $('#id_date_info').val();
    }
    //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts(url_)
    $.ajax({
        url: url_,
        type:'POST',
        data: serializeArray, //sendData,

        beforeSend:function(xhr){
            beforeSend();
            pters_option_inspector("plan_delete", xhr, selected_date);
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
    });
}


function check_dropdown_selected_addplan(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
    var memberSelect = $("#membersSelected button");
    var memberSelect_mini = $('#membersSelected_mini button');
    var dateSelect = $("#dateSelector p");
    var durSelect = $("#durationsSelected button");
    var durSelect_mini = $('#classDuration_mini #durationsSelected button');
    var startSelect = $("#starttimesSelected button");

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
            $('#submitBtn_mini').css('background', '#fe4e65');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated');
            $('#submitBtn_mini').css('background', '#282828');
            select_all_check=false;
        }
    }else if(addTypeSelect == "groupptadd"){
        if((memberSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated');
            select_all_check=true;
        }else if($('#page-addplan-pc').css('display')=='block' && (memberSelect_mini).hasClass("dropdown_selected")==true && durSelect_mini.hasClass("dropdown_selected")==true){
            $('#submitBtn_mini').css('background', '#fe4e65');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated');
            $('#submitBtn_mini').css('background', '#282828');
            select_all_check=false;
        }
    }else if(addTypeSelect == "offadd"){
        if($('#page-addplan-pc').css('display')!='block' && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true && (startSelect).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated');
            select_all_check=true;
        }else if($('#page-addplan-pc').css('display')=='block' && durSelect_mini.hasClass("dropdown_selected")==true){
            $('#submitBtn_mini').css('background', '#fe4e65');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#submitBtn_mini').css('background', '#282828');
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
            $('#submitBtn_mini').css('background', '#282828');
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
            $('#submitBtn_mini').css('background', '#282828');
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated');
            select_all_check=false;
        }
    }
}


function super_ajaxClassTime(use, callback){
    var selector_calendar = $('#calendar');
    if(selector_calendar.hasClass('_calmonth')){
        ajaxClassTime(use, callback);
    }else if(selector_calendar.hasClass('_calweek')){
        ajaxClassTime(use, callback);
    }else if(selector_calendar.hasClass('_calday')){
        ajaxClassTime_day();
    }
}


function position_fixed_addplan_if_mobile(){
    if(bodywidth < 600 && $('#page-addplan-pc').css('display')== "none"){
        $('#page-addplan').css('position', 'fixed');
        $('.dropdown-backdrop').css('height', $('#mshade_popup').height()+'px');
        setTimeout(function(){$('.dropdown-backdrop').css('height', $('#mshade_popup').height()+'px');}, 1);
    }
}
function position_absolute_addplan_if_mobile(scrolltoDom){
    if(bodywidth < 600){
        $('#page-addplan').css('position', 'absolute');
        scrollToDom(scrolltoDom);
    }
}


$(window).resize(function(){
    //Timegraph에 일정과 OFF표기를 반응형으로\
    if($('#page-addplan').css('display') == 'block'){
        $('.timegraph_plans_pink, .timegraph_plans_grey').remove();
        timeGraphSet("class", "pink", "AddClass", ajaxJSON_cache);
        timeGraphSet("group", "pink", "AddClass", ajaxJSON_cache);
        timeGraphSet("off", "grey", "AddClass", ajaxJSON_cache);
    }
    //Timegraph에 일정과 OFF표기를 반응형으로

    //Timegraph에 현재 선택된 일정 깜빡이 크기를 반응형으로
    if($('#page-addplan').css('display') == 'block' && $('.selectedplan_indi').length != 0){
        addGraphIndicator($('#durationsSelected button').attr('data-durmin'));
    }
    //Timegraph에 현재 선택된 일정 깜빡이 크기를 반응형으로

});

