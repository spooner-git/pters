$(document).ready(function(){

    $("#idinput").keyup(function(){
        if($("#idinput input").val().length>0){
            $("#idimg").attr("src",'/static/user/res/login/icon-user-pink.png')
        }else{
            $("#idimg").attr("src",'/static/user/res/login/icon-user.png')
        }
    })

    $("#pwinput").keyup(function(){
        if($("#pwinput input").val().length>0){
            $("#pwimg").attr("src",'/static/user/res/login/icon-lock-pink.png')
        }else{
            $("#pwimg").attr("src",'/static/user/res/login/icon-lock.png')
        }
    })
});