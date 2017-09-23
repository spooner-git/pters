$(document).ready(function(){
      $( "#datepicker" ).datepicker();

      $("#members li a").click(function(){
      		$("#membersSelected .btn:first-child").text($(this).text());
      		$("#membersSelected .btn:first-child").val($(this).text());
  		});

      $("#durations li a").click(function(){
      		$("#durationsSelected .btn:first-child").text($(this).text());
      		$("#durationsSelected .btn:first-child").val($(this).text());
  		});

      $("#starttimes li a").click(function(){
      		$("#starttimesSelected .btn:first-child").text($(this).text());
      		$("#starttimesSelected .btn:first-child").val($(this).text());
  		});

});