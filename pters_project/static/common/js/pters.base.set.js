$(document).ready(function(){

//      var userID = "박재범"
//      var upText = new Array("Pters",userID+" 코치님 일정")
//
    var upText = "Pters";
    var thisfilefullname = document.URL.substring(document.URL.lastIndexOf("/") + 1, document.URL.length);

     $("#outer_Sidenav").click(function(e){ // When any `div.container` is clicked
           closeNav(); //Sidebar가 열렸을때 회색 영역을 터치해도 Sidebar가 닫힘
      });
//     $('#user_name').text(userID+"코치님"); //Sidebar 상단 유저 이름
//     $('#welcome').text("안녕하세요!") //Sidebar 상단 유저 이름 아래 인사 메시지


	 if($('meta[name="upperText"]').attr('content') == "main_trainer"){ //상단바에 텍스트 표시. 각 페이지의 Meta를 읽어와서 upperText를 셋팅
//	 	  $('#uptext').text(upText[0]); //Main페이지에서는 Peters 표시
         $('#uptext').text(upText);
      $('.icon-bar').css('background-color','white');
      $('#uptext').css({'color':'#fe4e65','font-size':'16px'});
	 }else{
//	  	$('#uptext').text(upText[1]); //그외의 페이지에서는 "이름"+코치님 일정 표기

	 };
});


















