$(document).ready(function(){
      $("#datepicker").datepicker();
      var selected_date = $("#datepicker").datepicker("getDate");
      var select_all_check = false;
      //달력 선택된 날짜
      //출력 예시 : Fri Sep 08 2017 00:00:00 GMT+0900 (대한민국 표준시)

      $("#members li a").click(function(){
          $("#membersSelected button").addClass("dropdown_selected");
      		$("#membersSelected .btn:first-child").text($(this).text());
      		$("#membersSelected .btn:first-child").val($(this).text());
      		$("#countsSelected").text($(this).attr('data-lecturecount'));
      		$("#id_lecture_id").val($(this).attr('data-lectureid'));
            $("#id_member_name").val($(this).text());
          check_dropdown_selected();
  		}); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $("#durations li a").click(function(){
          $("#durationsSelected button").addClass("dropdown_selected");
      		$("#durationsSelected .btn:first-child").text($(this).text());
      		$("#durationsSelected .btn:first-child").val($(this).attr('data-dur'));
            $("#id_time_duration").val($(this).attr('data-dur'));
          check_dropdown_selected();
  		}); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $("#starttimes li a").click(function(){
      		$("#starttimesSelected button").addClass("dropdown_selected");
          $("#starttimesSelected .btn:first-child").text($(this).text());
      		$("#starttimesSelected .btn:first-child").val($(this).text());
              $("#id_training_time").val($(this).attr('data-trainingtime'));
          check_dropdown_selected();
  		}); //시작시간 드랍다운 박스 - 선택시 선택한 아이템이 표시

      
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

     function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
        var memberSelect = $("#membersSelected button");
        var dateSelect = $("#dateSelector p");
        var durSelect = $("#durationsSelected button");
        var startSelect = $("#starttimesSelected button")
        if((memberSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
            $("#upbutton-alarm").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            select_all_check=true;
        }else{
            select_all_check=false;
        }
     }

     $("#upbutton-alarm").click(function(){
         if(select_all_check==true){
             document.getElementById('pt-add-form').submit();
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



});