$(document).ready(function(){

      $('#repeatSchedule').click(function(){
          $('._NORMAL_ADD').hide('slow')
          $('._REPEAT_ADD').show('slow')
          if(addTypeSelect == "ptadd"){
            $('#uptext2').text('PT 반복 일정 등록')
            addTypeSelect = "repeatptadd"
            $("#id_repeat_lecture_id").val($('#id_lecture_id').val());
            $("#id_repeat_member_name").val($('id_member_name').text());
          }else if(addTypeSelect == "offadd"){
            $('#uptext2').text('OFF 반복 일정 등록')
            addTypeSelect = "repeatoffadd"
          }
      })


      $( "#datepicker_repeat_start" ).datepicker({
        minDate : 0,
      });
      $( "#datepicker_repeat_end" ).datepicker({
        minDate : 0,
      });
      var select_all_check = false;
      //달력 선택된 날짜
      //출력 예시 : Fri Sep 08 2017 00:00:00 GMT+0900 (대한민국 표준시)
      $('#inputError').fadeIn('slow')

      $('span.deleteBtn').click(function(){ //일정요약에서 반복일정 오른쪽 화살표 누르면 휴지통 열림
        var btn = $(this).find('div')
        if(btn.css('width')=='0px'){
          btn.animate({'width':'40px'},300)
          btn.find('img').css({'display':'block'})
        $('.deleteBtnBin').not(btn).animate({'width':'0px'},230);
        $('.deleteBtnBin img').not(btn.find('img')).css({'display':'none'})
        }
      })

      $('div.deleteBtnBin img').click(function(){
        $(this).parents('.summaryInnerBox').hide('fast','swing',function(){$(this).parents('.summaryInnerBox').detach()});
      })

      $('.summaryInnerBoxText').click(function(){ //매주 월요일 오전 11시 누르면 휴지통 닫힘
        var btn = $('.deleteBtnBin')
          btn.animate({'width':'0px'},230)
          btn.find('img').css({'display':'none'})
      })

      $('.summaryInnerBoxText2').click(function(){ // 반복종료 :2017.12.31 누르면 휴지통 닫힘
        var btn = $('.deleteBtnBin')
          btn.animate({'width':'0px'},230)
          btn.find('img').css({'display':'none'})
      })

      $("#repeats li a").click(function(){
        if(addTypeSelect == "repeatptadd"){
          $("#repeattypeSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-repeat'));
          $("#id_repeat_freq").val($(this).attr('data-repeat'));
        }else if(addTypeSelect == "repeatoffadd"){
          $("#repeattypeSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-repeat'));
          $("#id_repeat_freq_off").val($(this).attr('data-repeat'));
        }
          
          check_dropdown_selected();
      }); //반복 빈도 드랍다운 박스 - 선택시 선택한 아이템이 표시


      var selectedDayGroup = []
      $('.dateButton').click(function(){
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
          console.log(selectedDayGroup.join("/"))
          if(addTypeSelect == "repeatptadd"){
            $('#id_repeat_day').val(selectedDayGroup.join("/"))
          }else if(addTypeSelect == "repeatoffadd"){
            $('#id_repeat_day_off').val(selectedDayGroup.join("/"))
          }
          
      })


      $("#datepicker_repeat_start").change(function(){
          if($("#datepicker_repeat_start").val() != '') {
              $("#dateSelector p").addClass("dropdown_selected");
              if(addTypeSelect == "repeatptadd"){
                $("#id_repeat_start_date").val($("#datepicker_repeat_start").val());  
              }else if(addTypeSelect == "repeatoffadd"){
                $("#id_repeat_start_date_off").val($("#datepicker_repeat_start").val());
              }
              check_dropdown_selected();
          }
          else{
              $("#dateSelector p").removeClass("dropdown_selected");
              if(addTypeSelect == "repeatptadd"){
                $("#id_repeat_start_date").val('');
              }else if(addTypeSelect == "repeatoffadd"){
                $("#id_repeat_start_date_off").val('');
              }
              check_dropdown_selected();
          }
      })

      $("#datepicker_repeat_end").change(function(){
          if($("#datepicker_repeat_end").val() != '') {
              $("#dateSelector2 p").addClass("dropdown_selected");
              if(addTypeSelect == "repeatptadd"){
                $("#id_repeat_end_date").val($("#datepicker_repeat_end").val());
              }else if(addTypeSelect == "repeatoffadd"){
                $("#id_repeat_end_date_off").val($("#datepicker_repeat_end").val());
              }
              check_dropdown_selected();
          }
          else{
              $("#dateSelector2 p").removeClass("dropdown_selected");
              if(addTypeSelect == "repeatptadd"){
                $("#id_repeat_end_date").val('');
              }else if(addTypeSelect == "repeatoffadd"){
                $("#id_repeat_end_date_off").val('');
              }
              
              check_dropdown_selected();
          }
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
        var durSelect_mini = $('#classDuration_mini #durationsSelected button')

        var repeatSelect = $("#repeattypeSelected button");
        var startSelect_repeat = $('#repeatstarttimesSelected button')
        var durSelect_repeat = $('#repeatdurationsSelected button')
        var dateSelect_repeat_start = $("#datepicker_repeat_start").parent('p');
        var dateSelect_repeat_end = $("#datepicker_repeat_end").parent('p');

       if(addTypeSelect == "repeatptadd"){
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







      //작은달력 설정
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
});