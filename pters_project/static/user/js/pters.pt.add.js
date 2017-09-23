$(document).ready(function(){
      $( "#datepicker" ).datepicker();

      $(".dropdown-menu li a").click(function(){

      		$(".dropdown .btn:first-child").text($(this).text());
      		$(".dropdown .btn:first-child").val($(this).text());

  		});
});