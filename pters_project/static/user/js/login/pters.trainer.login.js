$(document).ready(function(){
      $("#idinput").keydown(function(){
      	if($("#idinput input").val().length>1){
      		$("#idimg").attr("src",'/static/user/res/login/icon-user-pink.png')	
      	}else{
      		$("#idimg").attr("src",'/static/user/res/login/icon-user.png')
      	}
      })

      $("#pwinput").keydown(function(){
      	if($("#pwinput input").val().length>1){
      		$("#pwimg").attr("src",'/static/user/res/login/icon-lock-pink.png')	
      	}else{
      		$("#pwimg").attr("src",'/static/user/res/login/icon-lock.png')
      	}
      })
});