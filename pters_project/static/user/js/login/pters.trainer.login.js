$(document).ready(function(){
      $("#idinput").change(function(){
      	$("#idimg").attr("src",'{% static "common/res/login/icon-user-pink.png" %}')
      })
});