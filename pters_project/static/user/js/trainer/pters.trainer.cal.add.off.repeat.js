$(document).ready(function(){

      $('#repeatSchedule').click(function(){ //일정추가 팝업에서 반복일정을 누르면 반복일정 관련 메뉴 나타남
          
          if(addTypeSelect == "ptadd"){
            
            $('._NORMAL_ADD, ._NORMAL_ADD_timegraph').hide('slow')
            $('._REPEAT_ADD').show('slow')
            $('#uptext2').text('PT 반복 일정 등록')
            addTypeSelect = "repeatptadd"
            $("#id_repeat_lecture_id").val($('#id_lecture_id').val());
            $("#id_repeat_member_name").val($('#id_member_name').val());
            $(this).find('.icons-next-button').addClass('rotate_90')
            check_dropdown_selected()
            fill_repeat_info_off()
            console.log(addTypeSelect)
          }else if(addTypeSelect == "offadd"){
            
            $('._NORMAL_ADD, ._NORMAL_ADD_timegraph').hide('slow')
            $('._REPEAT_ADD').show('slow')
            $('#uptext2').text('OFF 반복 일정 등록')
            addTypeSelect = "repeatoffadd"
            check_dropdown_selected()
            $(this).find('.icons-next-button').addClass('rotate_90')
            fill_repeat_info_off()
            console.log(addTypeSelect)
          }else if(addTypeSelect == "repeatptadd"){
            
            $('._NORMAL_ADD').show('slow')
            $('._REPEAT_ADD').hide('slow')
            if($('#datepicker').val().length>0){
                $('._NORMAL_ADD_timegraph').show('slow')
            }
            $(this).find('.icons-next-button').removeClass('rotate_90')
            addTypeSelect = "ptadd"
            check_dropdown_selected()
            console.log(addTypeSelect)
          }else if(addTypeSelect == "repeatoffadd"){
            
            $('._NORMAL_ADD').show('slow')
            $('._REPEAT_ADD').hide('slow')
            if($('#datepicker').val().length>0){
                $('._NORMAL_ADD_timegraph').show('slow')
            }
            $(this).find('.icons-next-button').removeClass('rotate_90')
            addTypeSelect = "offadd"
            check_dropdown_selected()
            console.log(addTypeSelect)
          }   
      })


      var select_all_check = false;

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
        $('#cal_popup_plandelete').fadeIn()
        $('#shade').show()
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
                $('.submitBtn').addClass('submitBtnActivated')
                select_all_check=true;
            }else if($('#page-addplan-pc').css('display')=='block' && (memberSelect).hasClass("dropdown_selected")==true){
                $('#submitBtn_mini').css('background','#fe4e65');
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('.submitBtn').removeClass('submitBtnActivated')
                $('#submitBtn_mini').css('background','#282828');
                select_all_check=false;
            }
        }else if(addTypeSelect == "offadd"){
            if((dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('.submitBtn').addClass('submitBtnActivated')
                select_all_check=true;
            }else if($('#page-addplan-pc').css('display')=='block' && durSelect_mini.hasClass("dropdown_selected")==true){
                $('#submitBtn_mini').css('background','#fe4e65');
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#submitBtn_mini').css('background','#282828');
                $('.submitBtn').removeClass('submitBtnActivated')
                select_all_check=false;
            }
        }else if(addTypeSelect == "repeatptadd"){
            if((memberSelect).hasClass("dropdown_selected")==true && (repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('.submitBtn').addClass('submitBtnActivated')
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#submitBtn_mini').css('background','#282828');
                $('.submitBtn').removeClass('submitBtnActivated')
                select_all_check=false;
            }
        }else if(addTypeSelect == "repeatoffadd"){
            if((repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('.submitBtn').addClass('submitBtnActivated')
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#submitBtn_mini').css('background','#282828');
                $('.submitBtn').removeClass('submitBtnActivated')
                select_all_check=false;
            }
        }
      }

    function fill_repeat_info_off(){ //반복일정 요약 채우기
      var len = offRepeatScheduleTypeArray.length
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
        var repeat_id = offRepeatScheduleIdArray[i]
        var repeat_type = repeat_info_dict['KOR'][offRepeatScheduleTypeArray[i]]
        var repeat_start = offRepeatScheduleStartDateArray[i].replace(/-/gi,".");
        var repeat_end_text_small = "<span class='summaryInnerBoxText_Repeatendtext_small'>~</span>"
        var repeat_end_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복종료 : </span>"
        var repeat_end = offRepeatScheduleEndDateArray[i].replace(/-/gi,".");
        var repeat_time = Number(offRepeatScheduleStartTimeArray[i].split(':')[0])+0
        var repeat_dur = offRepeatScheduleTimeDurationArray[i]
        var repeat_sum = Number(repeat_time) + Number(repeat_dur)
        var repeat_day = function(){
          var repeat_day_info_raw = offRepeatScheduleWeekInfoArray[i].split('/')
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
      $('#offRepeatSummary').html(summaryText + schedulesHTML.join(''))
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