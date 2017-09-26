$(document).ready(function(){
      $( "#datepicker" ).datepicker();
      var selected_date = $("#datepicker").datepicker("getDate")
      //달력 선택된 날짜
      //출력 예시 : Fri Sep 08 2017 00:00:00 GMT+0900 (대한민국 표준시)

      $("#members li a").click(function(){
          $("#membersSelected button").addClass("dropdown_selected");
      		$("#membersSelected .btn:first-child").text($(this).text());
      		$("#membersSelected .btn:first-child").val($(this).text());
  		}); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $("#durations li a").click(function(){
          $("#durationsSelected button").addClass("dropdown_selected");
      		$("#durationsSelected .btn:first-child").text($(this).text());
      		$("#durationsSelected .btn:first-child").val($(this).text());
  		}); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $("#starttimes li a").click(function(){
      		$("#starttimesSelected button").addClass("dropdown_selected");
          $("#starttimesSelected .btn:first-child").text($(this).text());
      		$("#starttimesSelected .btn:first-child").val($(this).text());
  		}); //시작시간 드랍다운 박스 - 선택시 선택한 아이템이 표시

      
      $("#datepicker").click(function(){
          $("#datepicker").addClass("dropdown_selected");  
      })


      
      

});