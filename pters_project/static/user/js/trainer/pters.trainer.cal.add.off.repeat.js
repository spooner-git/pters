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
            deleteTypeSelect = "repeatptdelete"
            $("#id_repeat_member_id").val($('#id_member_id').val());
            $("#id_repeat_lecture_id").val($('#id_lecture_id').val());
            $("#id_repeat_member_name").val($('#id_member_name').val());
            $(this).find('.icons-next-button').addClass('rotate_90')
            check_dropdown_selected()
            if($('#membersSelected button').val().length == 0){
              $('#offRepeatSummary').html('').hide()
            }
            console.log(addTypeSelect,deleteTypeSelect)
          }else if(addTypeSelect == "offadd"){
            repeatStartTimeSet()
            /*애니메이션*/
            $('._NORMAL_ADD_wrap').css('display','none')
            $('._REPEAT_ADD_wrap').css('display','block')
            $('._NORMAL_ADD_timegraph').hide()
            /*애니메이션*/
            $('#uptext2').text('OFF 반복 일정 등록')
            addTypeSelect = "repeatoffadd"
            deleteTypeSelect = "repeatoffdelete"
            check_dropdown_selected()
            $(this).find('.icons-next-button').addClass('rotate_90')
            fill_repeat_info('off')
            console.log(addTypeSelect,deleteTypeSelect)
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
                $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated')
                select_all_check=true;
            }else if($('#page-addplan-pc').css('display')=='block' && (memberSelect).hasClass("dropdown_selected")==true){
                $('#submitBtn_mini').css('background','#fe4e65');
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated')
                $('#submitBtn_mini').css('background','#282828');
                select_all_check=false;
            }
        }else if(addTypeSelect == "offadd"){
            if((dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated')
                select_all_check=true;
            }else if($('#page-addplan-pc').css('display')=='block' && durSelect_mini.hasClass("dropdown_selected")==true){
                $('#submitBtn_mini').css('background','#fe4e65');
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#submitBtn_mini').css('background','#282828');
                $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated')
                select_all_check=false;
            }
        }else if(addTypeSelect == "repeatptadd"){
            if((memberSelect).hasClass("dropdown_selected")==true && (repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated')
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#submitBtn_mini').css('background','#282828');
                $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated')
                select_all_check=false;
            }
            console.log(select_all_check)
        }else if(addTypeSelect == "repeatoffadd"){
          console.log('add_repeat의 checkdropdown')
            if((repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated')
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#submitBtn_mini').css('background','#282828');
                $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated')
                select_all_check=false;
            }
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