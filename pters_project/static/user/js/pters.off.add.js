$(document).ready(function(){
      $("#datepicker").datepicker({
          onSelect : function(curDate, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
            if( curDate != instance.lastVal ){
              $("#dateSelector p").addClass("dropdown_selected");
              $("#id_training_date").val($("#datepicker").val()).submit();

              startTimeSet();  //일정등록 가능한 시작시간 리스트 채우기
              check_dropdown_selected();
            }
          }
      });

      var select_all_check = false;
      //달력 선택된 날짜
      //출력 예시 : Fri Sep 08 2017 00:00:00 GMT+0900 (대한민국 표준시)
      
      $("#durations li a").click(function(){
          $("#durationsSelected button").addClass("dropdown_selected");
      		$("#durationsSelected .btn:first-child").text($(this).text());
      		$("#durationsSelected .btn:first-child").val($(this).attr('data-dur'));
            $("#id_time_duration").val($(this).attr('data-dur'));
          check_dropdown_selected();
  		}); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $(document).on('click','#starttimes li a',function(){
          $("#starttimesSelected button").addClass("dropdown_selected");
          $("#starttimesSelected .btn:first-child").text($(this).text());
          $("#starttimesSelected .btn:first-child").val($(this).text());
          $("#id_training_time").val($(this).attr('data-trainingtime'));
          check_dropdown_selected();
      })

       function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
       	 var memberSelect = $("#membersSelected button");
       	 var dateSelect = $("#dateSelector p");
       	 var durSelect = $("#durationsSelected button");
       	 var startSelect = $("#starttimesSelected button")
       		 if((dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
        	    $("#upbutton-alarm").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            	select_all_check=true;
        	}else{
           	    select_all_check=false;
       		}
    	 }

      $("#upbutton-alarm").click(function(){
         if(select_all_check==true){
             document.getElementById('off-add-form').submit();
         }else{
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

      function startTimeSet(){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21];
        var offOkLen = offAddOkArray.length
        var startTimeList = $('#starttimes');
        var timeArray = [];
        for(var i=0; i<offOkLen; i++){
          var offHour = offAddOkArray[i];
          if(offHour>12){
            var offText = '오후'
            var offHours = offHour - 12;
          }else{
            var offHours = offHour
            var offText = '오전'
          }
          if(offHour.length<2){
            timeArray[i] ='<li><a data-trainingtime="'+'0'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+'시'+'</a></li>'
          }else{
            timeArray[i] ='<li><a data-trainingtime="'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+'시'+'</a></li>'
          }
        }
        var timeArraySum = timeArray.join('')
        startTimeList.html(timeArraySum)
      }
});