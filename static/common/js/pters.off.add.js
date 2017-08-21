$(document).ready(function(){
      $( "#datepicker" ).datepicker();
      $( "#datepicker2" ).datepicker();
      $(".btn-group > .btn").click(function(){
   	  		$(this).addClass("active").siblings().removeClass("active");
		});
});