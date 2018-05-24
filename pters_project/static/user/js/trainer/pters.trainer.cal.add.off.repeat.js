$(document).ready(function(){

      $('.mode_switch_button').click(function(){
        var pageSelector = $(this).attr('data-page')
        $(this).addClass('mode_active')
        $(this).siblings('.mode_switch_button').removeClass('mode_active')

        if((addTypeSelect == "ptadd" || addTypeSelect == "groupptadd") && pageSelector == 'repeat'){
            repeatStartTimeSet()
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
            check_dropdown_selected()
            //console.log("$('#membersSelected button').val().length",$('#membersSelected button').val().length, $('#membersSelected button').val())
            if($('#membersSelected button').val().length == 0){
              $('#offRepeatSummary').html('').hide()
            }
          }else if(addTypeSelect == "offadd" && pageSelector == 'repeat'){
            repeatStartTimeSet()
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','none')
            $('._REPEAT_ADD_wrap').css('display','block')
            $('._NORMAL_ADD_timegraph').hide()
            /*애니메이션*/
            addTypeSelect = "repeatoffadd"
            deleteTypeSelect = "repeatoffdelete"
            check_dropdown_selected()
            fill_repeat_info('off')
          }else if((addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd") && pageSelector == ''){
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','block')
            $('._REPEAT_ADD_wrap').css('display','none')

            if($('#datepicker').val().length>0){
                $('._NORMAL_ADD_timegraph').show('slow')
            }
            /*애니메이션*/
            if(addTypeSelect == "repeatptadd"){
              addTypeSelect = "ptadd"
            }else if(addTypeSelect == "repeatgroupptadd"){
              addTypeSelect = "groupptadd"
            }
            
            check_dropdown_selected()
          }else if(addTypeSelect == "repeatoffadd" && pageSelector == ''){
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','block')
            $('._REPEAT_ADD_wrap').css('display','none')
            if($('#datepicker').val().length>0){
                $('._NORMAL_ADD_timegraph').show('slow')
            }
            /*애니메이션*/
            addTypeSelect = "offadd"
            check_dropdown_selected()
          }

          else if(pageSelector == "thisgroup"){
            $('#subpopup_addByList_thisgroup').show()
            $('#subpopup_addByList_whole').hide()
          }else if(pageSelector == "whole"){
            $('#subpopup_addByList_whole').show()
            $('#subpopup_addByList_thisgroup').hide()
          }
      })

      /*
      $('#repeatSchedule').click(function(){ //일정추가 팝업에서 반복일정을 누르면 반복일정 관련 메뉴 나타남
          
          if(addTypeSelect == "ptadd"){
            repeatStartTimeSet()
         
            $('._NORMAL_ADD_wrap').css('display','none')
            $('._REPEAT_ADD_wrap').css('display','block')
            $('._NORMAL_ADD_timegraph').hide()
           
            addTypeSelect = "repeatptadd"
            deleteTypeSelect = "repeatptdelete"
            $("#id_repeat_member_id").val($('#id_member_id').val());
            $("#id_repeat_lecture_id").val($('#id_lecture_id').val());
            $("#id_repeat_member_name").val($('#id_member_name').val());
            //$(this).find('.icons-next-button').addClass('rotate_90')
            check_dropdown_selected()
            if($('#membersSelected button').val().length == 0){
              $('#offRepeatSummary').html('').hide()
            }
          }else if(addTypeSelect == "offadd"){
            repeatStartTimeSet()
            
            $('._NORMAL_ADD_wrap').css('display','none')
            $('._REPEAT_ADD_wrap').css('display','block')
            $('._NORMAL_ADD_timegraph').hide()
            
            addTypeSelect = "repeatoffadd"
            deleteTypeSelect = "repeatoffdelete"
            check_dropdown_selected()
            //$(this).find('.icons-next-button').addClass('rotate_90')
            fill_repeat_info('off')
          }else if(addTypeSelect == "repeatptadd"){
            
            $('._NORMAL_ADD_wrap').css('display','block')
            $('._REPEAT_ADD_wrap').css('display','none')

            if($('#datepicker').val().length>0){
                $('._NORMAL_ADD_timegraph').show('slow')
            }
            
            //$(this).find('.icons-next-button').removeClass('rotate_90')
            addTypeSelect = "ptadd"
            check_dropdown_selected()
          }else if(addTypeSelect == "repeatoffadd"){
            
            $('._NORMAL_ADD_wrap').css('display','block')
            $('._REPEAT_ADD_wrap').css('display','none')
            if($('#datepicker').val().length>0){
                $('._NORMAL_ADD_timegraph').show('slow')
            }
            
            //$(this).find('.icons-next-button').removeClass('rotate_90')
            addTypeSelect = "offadd"
            check_dropdown_selected()
          }   
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

          if(Options.classDur == 30){
            for(var i=start; i<end; i++){
              if(i == 24){
                startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오전 '+'12'+'시</a></li><li><a data-trainingtime="'+i+':30:00.000000">오전 '+'12'+'시 30분</a></li>')
              }else if(i<12){
                startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오전 '+i+'시</a></li><li><a data-trainingtime="'+i+':30:00.000000">오전 '+i+'시 30분</a></li>')
              }else if(i>12){
                startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오후 '+(i-12)+'시</a></li><li><a data-trainingtime="'+i+':30:00.000000">오후 '+(i-12)+'시 30분</a></li>')
              }else if(i==12){
                startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오후 '+'12'+'시</a></li><li><a data-trainingtime="'+i+':30:00.000000">오후 '+'12'+'시 30분</a></li>')
              }
            }
          }else if(Options.classDur == 60){
            for(var i=start; i<end; i++){
              /*
              if(i == 24){
                startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오전 '+'12'+'시</a></li>')
              }else if(i<12){
                startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오전 '+i+'시</a></li>')
              }else if(i>12){
                startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오후 '+(i-12)+'시</a></li>')
              }else if(i==12){
                startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오후 '+'12'+'시</a></li>')
              }
              */
              if(i == (end-1)){
                if(i == 24){
                  startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오전 '+'12'+'시</a></li>')
                }else if(i<12){
                  startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오전 '+i+'시</a></li>')
                }else if(i>12){
                  startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오후 '+(i-12)+'시</a></li>')
                }else if(i==12){
                  startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오후 '+'12'+'시</a></li>')
                }
              }else{
                if(i == 24){
                  startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오전 '+'12'+'시</a></li><li><a data-trainingtime="'+i+':30:00.000000">오전 '+'12'+'시 30분</a></li>')
                }else if(i<12){
                  startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오전 '+i+'시</a></li><li><a data-trainingtime="'+i+':30:00.000000">오전 '+i+'시 30분</a></li>')
                }else if(i>12){
                  startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오후 '+(i-12)+'시</a></li><li><a data-trainingtime="'+i+':30:00.000000">오후 '+(i-12)+'시 30분</a></li>')
                }else if(i==12){
                  startTimeList.push('<li><a data-trainingtime="'+i+':00:00.000000">오후 '+'12'+'시</a></li><li><a data-trainingtime="'+i+':30:00.000000">오후 '+'12'+'시 30분</a></li>')
                }
              }
            }
          }

          $('#repeatstarttimes').html(startTimeList.join(''))
          $('#repeatdurations').html('')
      }

      function repeatDurationTimeSet(){
          var start = Options.workStartTime;
          var end   = Options.workEndTime;
          var selectedTime = $('#repeatstarttimesSelected button').val().split(':')[0]
          var selectedMin = $('#repeatstarttimesSelected button').val().split(':')[1]
          var durTimeList = []
          
          if(Options.classDur == 30){
            var tengo=0.5
              if(selectedMin == "30"){
                for(var i=0; i<(end-(selectedTime))*2-1; i++){
                  durTimeList.push('<li><a data-dur="'+(i+1)+'">'+tengo+'시간</a></li>')
                  tengo = tengo + 0.5
                }
              }else if(selectedMin == "00"){
                for(var i=0; i<(end-(selectedTime))*2; i++){
                  durTimeList.push('<li><a data-dur="'+(i+1)+'">'+tengo+'시간</a></li>')
                  tengo = tengo + 0.5
                }
              }
          }else if(Options.classDur == 60){
              //durTimeList.push('<li><a data-dur="'+i*(60/Options.classDur)+'">'+i+'시간</a></li>')  // 9:30  ~ 12:00    10:30, 11:30
              if(selectedMin == "30"){
                for(var i=0; i<(end-(selectedTime))-1; i++){
                  durTimeList.push('<li><a data-dur="'+(i*(60/Options.classDur)+1)+'">'+(i+1)+'시간</a></li>')
                }
              }else if(selectedMin == "00"){
                for(var i=0; i<(end-(selectedTime)); i++){
                  durTimeList.push('<li><a data-dur="'+(i*(60/Options.classDur)+1)+'">'+(i+1)+'시간</a></li>')
                }
              }
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