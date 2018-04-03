$(document).ready(function(){

      $('#repeatSchedule').click(function(){ //일정추가 팝업에서 반복일정을 누르면 반복일정 관련 메뉴 나타남
          
          if(addTypeSelect == "ptadd"){
            repeatStartTimeSet()
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','none')
            $('._REPEAT_ADD_wrap').css('display','block')
            $('._NORMAL_ADD_timegraph').hide()
            /*애니메이션*/
            $('#uptext2').text('PT 반복 일정 등록')
            addTypeSelect = "repeatptadd"
            $("#id_repeat_member_id").val($('#id_member_id').val());
            $("#id_repeat_lecture_id").val($('#id_lecture_id').val());
            $("#id_repeat_member_name").val($('#id_member_name').val());
            $(this).find('.icons-next-button').addClass('rotate_90')
            check_dropdown_selected()
            if($('#membersSelected button').val().length == 0){
              $('#offRepeatSummary').html('').hide()
            }
            console.log(addTypeSelect)
          }else if(addTypeSelect == "offadd"){
            repeatStartTimeSet()
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','none')
            $('._REPEAT_ADD_wrap').css('display','block')
            $('._NORMAL_ADD_timegraph').hide()
            /*애니메이션*/
            $('#uptext2').text('OFF 반복 일정 등록')
            addTypeSelect = "repeatoffadd"
            check_dropdown_selected()
            $(this).find('.icons-next-button').addClass('rotate_90')
            fill_repeat_info('off')
            console.log(addTypeSelect)
          }else if(addTypeSelect == "repeatptadd"){
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','block')
            $('._REPEAT_ADD_wrap').css('display','none')

            if($('#datepicker').val().length>0){
                $('._NORMAL_ADD_timegraph').show('slow')
            }
            /*애니메이션*/
            $(this).find('.icons-next-button').removeClass('rotate_90')
            addTypeSelect = "ptadd"
            check_dropdown_selected()
            console.log(addTypeSelect)
          }else if(addTypeSelect == "repeatoffadd"){
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','block')
            $('._REPEAT_ADD_wrap').css('display','none')
            if($('#datepicker').val().length>0){
                $('._NORMAL_ADD_timegraph').show('slow')
            }
            /*애니메이션*/
            $(this).find('.icons-next-button').removeClass('rotate_90')
            addTypeSelect = "offadd"
            check_dropdown_selected()
            console.log(addTypeSelect)
          }   
      })


      var select_all_check = false;

/*
      $(document).on('click','.deleteBtn',function(){ //일정요약에서 반복일정 오른쪽 화살표 누르면 휴지통 열림
        var $btn = $(this).find('div')
        if($btn.css('width')=='0px'){
          $btn.animate({'width':'40px'},300)
          $btn.find('img').css({'display':'block'})
        $('.deleteBtnBin').not($btn).animate({'width':'0px'},230);
        $('.deleteBtnBin img').not($btn.find('img')).css({'display':'none'})
        }
      })

      
      $(document).on('click','div.deleteBtnBin',function(){
        var id_info = $(this).parents('div.summaryInnerBox').attr('data-id')
        $('#id_repeat_schedule_id_confirm').val(id_info)
        var repeat_schedule_id = $(this).parents('.summaryInnerBox').attr('data-id')
        $('#cal_popup_plandelete').fadeIn().attr('data-id',repeat_schedule_id)
        $('#shade3').show()
      })
*/


      $(document).on('click','.summaryInnerBoxText, .summaryInnerBoxText2',function(){ //반복일정 텍스트 누르면 휴지통 닫힘
        var $btn = $('.deleteBtnBin')
          $btn.animate({'width':'0px'},230)
          $btn.find('img').css({'display':'none'})
      })


      $("#repeats li a").click(function(){ //반복 빈도 드랍다운 박스 - 선택시 선택한 아이템이 표시
        if(addTypeSelect == "repeatptadd"){
          $("#repeattypeSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-repeat'));
          $("#id_repeat_freq").val($(this).attr('data-repeat'));
        }else if(addTypeSelect == "repeatoffadd"){
          $("#repeattypeSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-repeat'));
          $("#id_repeat_freq_off").val($(this).attr('data-repeat'));
        }
          
          check_dropdown_selected();
      }); 

      $(document).on('click', '#repeatstarttimes li a',function(){
          $('.tdgraph').removeClass('graphindicator')
          $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-trainingtime'));
          if(addTypeSelect == "repeatptadd"){
            $("#id_repeat_start_time").val($(this).attr('data-trainingtime'));
          }else if(addTypeSelect == "repeatoffadd"){
            $("#id_repeat_start_time_off").val($(this).attr('data-trainingtime'));
          }
          var time = $(this).attr('data-trainingtime').split(':')
          //durTimeSet(time[0],"class");
          $("#durationsSelected button").removeClass("dropdown_selected");
          $("#durationsSelected .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
          $("#durationsSelected .btn:first-child").val("");
          check_dropdown_selected();
          repeatDurationTimeSet()
      })

      function repeatStartTimeSet(){
          var start = Options.workStartTime;
          var end   = Options.workEndTime;
          var startTimeList = []
          for(var i=start; i<end; i++){
            if(i == 24){
              startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오전 '+'12'+'시</a></li>')
            }else if(i<12){
              startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오전 '+i+'시</a></li>')
            }else if(i>12){
              startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오후 '+(i-12)+'시</a></li>')
            }else if(i==12){
              startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오후 '+'12'+'시</a></li>')
            }
          }
          $('#repeatstarttimes').html(startTimeList.join(''))
          $('#repeatdurations').html('')
      }

      function repeatDurationTimeSet(){
          var start = Options.workStartTime;
          var end   = Options.workEndTime;
          var selectedTime = $('#repeatstarttimesSelected button').val().split(':')[0]
          var durTimeList = []
          for(var i=1; i<=end-(selectedTime); i++){
              durTimeList.push('<li><a data-dur="'+i+'">'+i+'시간</a></li>')
          }
          $('#repeatdurations').html(durTimeList.join(''))
      }


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
          if(addTypeSelect == "repeatptadd"){
            $('#id_repeat_day').val(selectedDayGroup.sort().join("/").replace(/[0-9]_/gi,''))
          }else if(addTypeSelect == "repeatoffadd"){
            $('#id_repeat_day_off').val(selectedDayGroup.sort().join("/").replace(/[0-9]_/gi,''))
          }
          console.log($('#id_repeat_day_off').val())
          check_dropdown_selected();
      })

    $("#submitBtn").click(function(){
         if(select_all_check==true){
             document.getElementById('add-repeat-schedule-form').submit();
         }else{
            //$('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
         }
     })

    
    function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
        var memberSelect = $("#membersSelected button");
        var dateSelect = $("#dateSelector p");
        var durSelect = $("#durationsSelected button");
        var durSelect_mini = $('#classDuration_mini #durationsSelected button')
        var startSelect = $("#starttimesSelected button")

        var repeatSelect = $("#repeattypeSelected button");
        var startSelect_repeat = $('#repeatstarttimesSelected button')
        var durSelect_repeat = $('#repeatdurationsSelected button')
        var dateSelect_repeat_start = $("#datepicker_repeat_start").parent('p');
        var dateSelect_repeat_end = $("#datepicker_repeat_end").parent('p');

        if(addTypeSelect == "ptadd"){
            if((memberSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page-addplan .submitBtn').addClass('submitBtnActivated')
                select_all_check=true;
            }else if($('#page-addplan-pc').css('display')=='block' && (memberSelect).hasClass("dropdown_selected")==true){
                $('#submitBtn_mini').css('background','#fe4e65');
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#page-addplan .submitBtn').removeClass('submitBtnActivated')
                $('#submitBtn_mini').css('background','#282828');
                select_all_check=false;
            }
        }else if(addTypeSelect == "offadd"){
            if((dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page-addplan .submitBtn').addClass('submitBtnActivated')
                select_all_check=true;
            }else if($('#page-addplan-pc').css('display')=='block' && durSelect_mini.hasClass("dropdown_selected")==true){
                $('#submitBtn_mini').css('background','#fe4e65');
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#submitBtn_mini').css('background','#282828');
                $('#page-addplan .submitBtn').removeClass('submitBtnActivated')
                select_all_check=false;
            }
        }else if(addTypeSelect == "repeatptadd"){
            if((memberSelect).hasClass("dropdown_selected")==true && (repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page-addplan .submitBtn').addClass('submitBtnActivated')
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#submitBtn_mini').css('background','#282828');
                $('#page-addplan .submitBtn').removeClass('submitBtnActivated')
                select_all_check=false;
            }
            console.log(select_all_check)
        }else if(addTypeSelect == "repeatoffadd"){
          console.log('add_repeat의 checkdropdown')
            if((repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page-addplan .submitBtn').addClass('submitBtnActivated')
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#submitBtn_mini').css('background','#282828');
                $('#page-addplan .submitBtn').removeClass('submitBtnActivated')
                select_all_check=false;
            }
        }
    }


    function fill_repeat_info(option){ //반복일정 요약 채우기
          switch(option){
              case 'class':
                var len = ptRepeatScheduleIdArray.length
                var repeat_id_array = ptRepeatScheduleIdArray
                var repeat_type_array = ptRepeatScheduleTypeArray
                var repeat_day_info_raw_array = ptRepeatScheduleWeekInfoArray
                var repeat_start_array = ptRepeatScheduleStartDateArray
                var repeat_end_array = ptRepeatScheduleEndDateArray
                var repeat_time_array = ptRepeatScheduleStartTimeArray
                var repeat_dur_array = ptRepeatScheduleTimeDurationArray
              break;
              case 'off':
              var len = offRepeatScheduleIdArray.length
              var repeat_id_array = offRepeatScheduleIdArray
              var repeat_type_array = offRepeatScheduleTypeArray
              var repeat_day_info_raw_array = offRepeatScheduleWeekInfoArray
              var repeat_start_array = offRepeatScheduleStartDateArray
              var repeat_end_array = offRepeatScheduleEndDateArray
              var repeat_time_array = offRepeatScheduleStartTimeArray
              var repeat_dur_array = offRepeatScheduleTimeDurationArray
              break;
          }
          var repeat_info_dict= { 'KOR':
                                  {'DD':'매일', 'WW':'매주', '2W':'격주',
                                   'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일'},
                                  'JAP':
                                  {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                                   'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日'},
                                  'JAP':
                                  {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                                   'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat'}
                                 }
          var schedulesHTML = []
          for(var i=0; i<len; i++){
            var repeat_id = repeat_id_array[i]
            var repeat_type = repeat_info_dict['KOR'][repeat_type_array[i]]
            var repeat_start = repeat_start_array[i].replace(/-/gi,".");
            var repeat_end_text_small = "<span class='summaryInnerBoxText_Repeatendtext_small'>~</span>"
            var repeat_end_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복종료 : </span>"
            var repeat_end = repeat_end_array[i].replace(/-/gi,".");
            var repeat_time = Number(repeat_time_array[i].split(':')[0])+0
            var repeat_dur = repeat_dur_array[i]
            var repeat_sum = Number(repeat_time) + Number(repeat_dur)
            var repeat_day =  function(){
                                var repeat_day_info_raw = repeat_day_info_raw_array[i].split('/')
                                var repeat_day_info = ""
                                if(repeat_day_info_raw.length>1){
                                    for(var j=0; j<repeat_day_info_raw.length; j++){
                                        var repeat_day_info = repeat_day_info + '/' + repeat_info_dict['KOR'][repeat_day_info_raw[j]].substr(0,1)
                                    }
                                }else if(repeat_day_info_raw.length == 1){
                                    var repeat_day_info = repeat_info_dict['KOR'][repeat_day_info_raw[0]]
                                }
                                if(repeat_day_info.substr(0,1) == '/'){
                                    var repeat_day_info = repeat_day_info.substr(1,repeat_day_info.length)
                                }
                                  return repeat_day_info
                              };

            var summaryInnerBoxText_1 = '<span class="summaryInnerBoxText">'+repeat_type +' '+repeat_day() +' '+repeat_time+' ~ '+repeat_sum+'시 ('+repeat_dur +'시간)</span>'
            var summaryInnerBoxText_2 = '<span class="summaryInnerBoxText2">'+repeat_end_text+repeat_end_text_small+repeat_end+'</span>'
            var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>'
            schedulesHTML[i] = '<div class="summaryInnerBox" data-id="'+repeat_id+'">'+summaryInnerBoxText_1+summaryInnerBoxText_2+deleteButton+'</div>'
          }

          var summaryText = '<span id="summaryText">일정요약</span>'
          if(schedulesHTML.length>0){
            $('#offRepeatSummary').html(summaryText + schedulesHTML.join('')).show()
          }else{
            $('#offRepeatSummary').hide()
          }
          
        }



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