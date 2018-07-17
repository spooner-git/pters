$(document).ready(function(){

    $('.mode_switch_button').click(function(){
        var pageSelector = $(this).attr('data-page')
        $(this).addClass('mode_active')
        $(this).siblings('.mode_switch_button').removeClass('mode_active')

        if((addTypeSelect == "ptadd" || addTypeSelect == "groupptadd") && pageSelector == 'repeat'){
            if($('.repeatadd_time_unit').hasClass('checked')){
                repeatStartTimeSet(5)
            }else{
                repeatStartTimeSet(Options.classDur)
            }
            
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','none')
            $('._REPEAT_ADD_wrap').css('display','block')
            $('._NORMAL_ADD_timegraph').hide()
            /*애니메이션*/
            if(addTypeSelect == "ptadd"){
                addTypeSelect = "repeatptadd"
                deleteTypeSelect = "repeatptdelete"
            }else if(addTypeSelect == "groupptadd"){
                addTypeSelect = "repeatgroupptadd"
                deleteTypeSelect = "repeatgroupptdelete"
            }
            $("#id_repeat_member_id").val($('#id_member_id').val());
            $("#id_repeat_lecture_id").val($('#id_lecture_id').val());
            $("#id_repeat_member_name").val($('#id_member_name').val());
            check_dropdown_selected_addplan()
            //console.log("$('#membersSelected button').val().length",$('#membersSelected button').val().length, $('#membersSelected button').val())
            if($('#membersSelected button').val().length == 0){
                $('#offRepeatSummary').html('').hide()
            }
        }else if(addTypeSelect == "offadd" && pageSelector == 'repeat'){
            if($('.repeatadd_time_unit').hasClass('checked')){
                repeatStartTimeSet(5)
            }else{
                repeatStartTimeSet(Options.classDur)
            }
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','none')
            $('._REPEAT_ADD_wrap').css('display','block')
            $('._NORMAL_ADD_timegraph').hide()
            /*애니메이션*/
            addTypeSelect = "repeatoffadd"
            deleteTypeSelect = "repeatoffdelete"
            check_dropdown_selected_addplan()
        }else if((addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd") && pageSelector == ''){
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','block')
            $('._REPEAT_ADD_wrap').css('display','none')

            if($('#datepicker').val().length>0){
                $('._NORMAL_ADD_timegraph').css('display','block')
            }
            /*애니메이션*/
            if(addTypeSelect == "repeatptadd"){
                addTypeSelect = "ptadd"
            }else if(addTypeSelect == "repeatgroupptadd"){
                addTypeSelect = "groupptadd"
            }

            check_dropdown_selected_addplan()
        }else if(addTypeSelect == "repeatoffadd" && pageSelector == ''){
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','block')
            $('._REPEAT_ADD_wrap').css('display','none')
            if($('#datepicker').val().length>0){
                $('._NORMAL_ADD_timegraph').css('display','block')
            }
            /*애니메이션*/
            addTypeSelect = "offadd"
            check_dropdown_selected_addplan()
        }

        else if(pageSelector == "thisgroup"){
            $('#subpopup_addByList_thisgroup').show()
            $('#subpopup_addByList_whole').hide()
        }else if(pageSelector == "whole"){
            $('#subpopup_addByList_whole').show()
            $('#subpopup_addByList_thisgroup').hide()
        }
    })


    $(document).on('click','.summaryInnerBoxText, .summaryInnerBoxText2',function(){ //반복일정 텍스트 누르면 휴지통 닫힘
        var $btn = $('.deleteBtnBin')
        $btn.animate({'width':'0px'},230)
        $btn.find('img').css({'display':'none'})
    })


    $("#repeats li a").click(function(){ //반복 빈도 드랍다운 박스 - 선택시 선택한 아이템이 표시
        if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
            $("#repeattypeSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-repeat'));
            $("#id_repeat_freq").val($(this).attr('data-repeat'));
        }else if(addTypeSelect == "repeatoffadd"){
            $("#repeattypeSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-repeat'));
            $("#id_repeat_freq_off").val($(this).attr('data-repeat'));
        }

        check_dropdown_selected_addplan();
    });

    $(document).on('click', '#repeatstarttimes li a',function(){
        $('.tdgraph').removeClass('graphindicator')
        $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-trainingtime'));
        if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
            $("#id_repeat_start_time").val($(this).attr('data-trainingtime'));
        }else if(addTypeSelect == "repeatoffadd"){
            $("#id_repeat_start_time_off").val($(this).attr('data-trainingtime'));
        }
        var time = $(this).attr('data-trainingtime').split(':');
        var selectedTime = time[0]+':'+time[1];
        //durTimeSet(time[0],"class");
        $("#durationsSelected button").removeClass("dropdown_selected");
        $("#durationsSelected .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
        $("#durationsSelected .btn:first-child").val("");
        check_dropdown_selected_addplan();

        if($('.repeatadd_time_unit').hasClass('checked')){
            repeatDurationTimeSet(selectedTime, 5)
        }else{
            repeatDurationTimeSet(selectedTime, Options.classDur);
        };
    })


    $('.repeatadd_time_unit').click(function(){
        clear_repeat_start_dur_dropdown();
        var $child = $(this).find('div');
        if($(this).hasClass('checked')){
            $(this).removeClass('checked');
            $child.removeClass('ptersCheckboxInner_sm');
            repeatStartTimeSet(Options.classDur)
        }else{
            $(this).addClass('checked');
            $child.addClass('ptersCheckboxInner_sm');
            repeatStartTimeSet(5);
        }
    })

    function repeatStartTimeSet(Timeunit){
        var start = Options.workStartTime;
        var end   = Options.workEndTime;
        var startTimeList = [];

        var zz = 0;
        while(add_time(start+':00', '00:0'+zz) < add_time(end+':00','00:00')){
            var time = add_time(start+':00', '00:0'+zz);
            var timehangul = time_format_to_hangul2(add_time(start+':00', '00:0'+zz));
            startTimeList.push('<li><a data-trainingtime="'+time+':00.000000">'+timehangul+'</a></li>');
            zz++;
        };

        var semiresult = [];
        for(var t=0; t<startTimeList.length; t++){
            if(Number(startTimeList[t].split(':')[1])%Timeunit == 0){  //몇분 간격으로 시작시간을 보여줄 것인지?
                semiresult.push(startTimeList[t]);
            };
        };
        
        $('#repeatstarttimes').html(semiresult.join(''));
        $('#repeatdurations').html('');
    };

    function repeatDurationTimeSet(selectedTime, Timeunit){
        var start = Options.workStartTime;
        var end   = Options.workEndTime;
        //var selectedTime = $('#repeatstarttimesSelected button').val().split(':')[0]
        //var selectedMin = $('#repeatstarttimesSelected button').val().split(':')[1]
        var selectedHour = selectedTime.split(':')[0];
        var selectedMin = selectedTime.split(':')[1];
        var durTimeList = [];

        var dur = 1;
        while(add_time(selectedTime,'00:0'+dur) != add_time(end+':00','00:01')){
            var durTimes = add_time(selectedTime,'00:0'+dur);
            if(durTimes.split(':')[1]%Timeunit == 0){
                durTimeList.push('<li><a data-dur="'+dur/Options.classDur+'">'+duration_number_to_hangul_minute(dur)+' (~'+durTimes+')</a></li>')
            };
            dur++;
        };

        $('#repeatdurations').html(durTimeList.join(''));
    };


    $('.dateButton').click(function(){ // 반복일정 요일선택 (월/화/수/목/금/토/일)
        var selectedDay = $(this).attr('data-date')
        if(!$(this).hasClass('dateButton_selected')){
            $(this).addClass('dateButton_selected')
            selectedDayGroup.push(selectedDay)
        }else{
            $(this).removeClass('dateButton_selected')
            index = selectedDayGroup.indexOf(selectedDay)
            if(index != -1){
                selectedDayGroup.splice(index,1)
            }
        }
        if(addTypeSelect == "repeatptadd"  || addTypeSelect == "repeatgroupptadd"){
            $('#id_repeat_day').val(selectedDayGroup.sort().join("/").replace(/[0-9]_/gi,''))
        }else if(addTypeSelect == "repeatoffadd"){
            $('#id_repeat_day_off').val(selectedDayGroup.sort().join("/").replace(/[0-9]_/gi,''))
        }
        console.log($('#id_repeat_day_off').val())
        check_dropdown_selected_addplan();
    })

    $("#submitBtn").click(function(){
        if(select_all_check==true){
            document.getElementById('add-repeat-schedule-form').submit();
        }else{
            //$('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
        }
    })


    /*미니달력 관련*/
    $("#datepicker_repeat_start").datepicker({
        minDate : 0,

    });
    $("#datepicker_repeat_end").datepicker({
        minDate : 0,
    });

    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd',
        prevText: '이전 달',
        nextText: '다음 달',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년'
    });
    /*미니달력 관련*/

});