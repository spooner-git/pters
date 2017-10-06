$(document).ready(function(){
      $(".btn-group > .btn").click(function(){
   	  		$(this).addClass("active").siblings().removeClass("active");
		});

      $(".dropdown-menu li a").click(function(){
      		$(".dropdown .btn:first-child").text($(this).text());
      		$(".dropdown .btn:first-child").val($(this).text());

  		 });

      var ts;
		$("body").bind("touchstart",function(e){
		ts = e.originalEvent.touches[0].clientY;
			});
		$("body").bind("touchend",function(e){
			var te = e.originalEvent.changedTouches[0].clientY;
			if(ts>te+5){
				$("#float_btn").animate({opacity:'0'})
			}else if(ts<te-5){
				$("#float_btn").animate({opacity:'1'})
			}
		})


     /* //플로팅 버튼
	$('#float_btn').click(function(){
		if($('#shade').css('z-index')<0){
			$('#shade').css({'background-color':'black','z-index':'8'});
			$('#float_inner1').animate({'opacity':'0.7','bottom':'85px'},120);
			$('#float_inner2').animate({'opacity':'0.7','bottom':'145px'},120);
			$('#float_btn img').addClass('rotate_btn');
		}else{
			$('#shade').css({'background-color':'white','z-index':'-1'});
			$('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
			$('#float_btn img').removeClass('rotate_btn');
		}
	});
	//플로팅 버튼 */
});