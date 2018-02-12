$(document).ready(function(){

//      var userID = "박재범"
//      var upText = new Array("Pters",userID+" 코치님 일정")
//
    var upText = "PTERS";
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


   if(Options.language == "Japan"){
      $('.__todayplan').text("今日の日程")
      $('.__weekplan').text("日程表")
      $('.__monthplan').text("カレンダー")
      $('.__membermanage').text("会員管理")
      $('.__workmanage').text("業務管理")
      $('.__setting').text("設定")
      $('.pcwho span').text("様")
      $('.pcwhere').text("PTERSトレーニングセンター")
      $('.pclogout').text("ログアウト")
      $('#uptext span').text("様のスケジュール")

      $('.__mypage').text("マイページ")
   }else if(Options.language == "English"){
      $('.__todayplan').text("Daily")
      $('.__weekplan').text("Schedule")
      $('.__monthplan').text("Calendar")
      $('.__membermanage').text("Members")
      $('.__workmanage').text("Work")
      $('.__setting').text("Settings")
      $('.pcwho span').text("")
      $('.pcwhere').text("PTERS Traning Center")
      $('.pclogout').text("Logout")
      $('#uptext span').text("'s schedule")

      $('.__mypage').text("My page")
   }else if(Options.language == "Korea"){
      $('.__todayplan').text("오늘 일정")
      $('.__weekplan').text("주간 일정")
      $('.__monthplan').text("월간 일정")
      $('.__membermanage').text("회원 관리")
      $('.__workmanage').text("업무 통계")
      $('.__setting').text("서비스 설정")
      $('.pcwho span').text("님")
      $('.pcwhere').text("PTERS 트레이닝센터")
      $('.pclogout').text("로그아웃")
      $('#uptext span').text("코치님 일정")

      $('.__mypage').text("마이페이지")
   }
});


















