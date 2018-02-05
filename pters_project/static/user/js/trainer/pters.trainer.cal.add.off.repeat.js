$(document).ready(function(){
      $( "#datepicker" ).datepicker({
        minDate : 0,
      });
      $( "#datepicker2" ).datepicker({
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
          $("#repeattypeSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-repeat'));
          $("#id_repeat_freq").val($(this).attr('data-repeat'));
          check_dropdown_selected();
      }); //반복 빈도 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $("#starttimes li a").click(function(){
          $("#starttimesSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).text());
          $("#id_repeat_starttime").val($(this).attr('data-trainingtime'));
          check_dropdown_selected();
      }); //시작시간 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $("#durations li a").click(function(){
          $("#durationsSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-dur'));
          $("#id_repeat_dur").val($(this).attr('data-dur'));
          check_dropdown_selected();
  		}); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시


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
          $('#id_repeat_day').val(selectedDayGroup.join("/"))
      })


      $("#datepicker").change(function(){
          if($("#datepicker").val() != '') {
              $("#dateSelector p").addClass("dropdown_selected");
              $("#id_training_date").val($("#datepicker").val());
              check_dropdown_selected();
          }
          else{
              $("#dateSelector p").removeClass("dropdown_selected");
              $("#id_training_date").val('');
              check_dropdown_selected();
          }
      })

      $("#datepicker2").change(function(){
          if($("#datepicker2").val() != '') {
              $("#dateSelector2 p").addClass("dropdown_selected");
              $("#id_training_date").val($("#datepicker2").val());
              check_dropdown_selected();
          }
          else{
              $("#dateSelector2 p").removeClass("dropdown_selected");
              $("#id_training_date").val('');
              check_dropdown_selected();
          }
      })

       function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->핑크색)
       	 var repeatSelect = $("#repeattypeSelected button");
       	 var dateSelect = $("#dateSelector p");
         var dateSelect2 = $("#dateSelector2 p");
       	 var durSelect = $("#durationsSelected button");
       	 var startSelect = $("#starttimesSelected button")
       		 if((repeatSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (dateSelect2).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
        	    $("#upbutton-alarm").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            	$('#submitBtn').addClass('submitBtnActivated');
              select_all_check=true;
        	}else{
           	    select_all_check=false;
       		}
    	 }

    $("#upbutton-alarm").click(function(){
         if(select_all_check==true){
             document.getElementById('off-add-form').submit();
         }else{
            //$('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
         }
     })
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