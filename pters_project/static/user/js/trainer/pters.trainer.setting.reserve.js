$(document).ready(function(){


     var select_all_check = false;
      
      $('#uptext').text("예약 허용 시간대 설정")
      $('#switch').click(function(){
      	if($(this).find('.switchball').hasClass('switchoff')){
      		$(this).find('.switchball').removeClass('switchoff').addClass('switchon')
      		$(this).find('.switchback').addClass('switchon-back')

      	}else{
      		$(this).find('.switchball').removeClass('switchon').addClass('switchoff')
      		$(this).find('.switchback').removeClass('switchon-back')
      	}
      })

      $("#ulMorningDay li a").click(function(){
            $("#morningdaySelect button").addClass("dropdown_selected");
            $("#morningdaySelect .btn:first-child").text($(this).text());
            $("#morningdaySelect .btn:first-child").val($(this).text());
            check_dropdown_selected();
      });


      $("#ulMorningDay2 li a").click(function(){
            $("#morningdaySelect2 button").addClass("dropdown_selected");
            $("#morningdaySelect2 .btn:first-child").text($(this).text());
            $("#morningdaySelect2 .btn:first-child").val($(this).text());
            check_dropdown_selected();
      });

      $("#ulTimes li a").click(function(){
            $("#hourSelect button").addClass("dropdown_selected");
            $("#hourSelect .btn:first-child").text($(this).text());
            $("#hourSelect .btn:first-child").val($(this).text());
            check_dropdown_selected();
      });

      $("#ulTimes2 li a").click(function(){
            $("#hourSelect2 button").addClass("dropdown_selected");
            $("#hourSelect2 .btn:first-child").text($(this).text());
            $("#hourSelect2 .btn:first-child").val($(this).text());
            check_dropdown_selected();
      });

       $("#upbutton-alarm").click(function(){
         if(select_all_check==true){
             document.getElementById('pt-add-form').submit();
         }else{
             
            //입력값 확인 메시지 출력 가능
         }
     })


      function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
        var ulMorningDay = $("#morningdaySelect button");
        var ulMorningDay2 = $("#morningdaySelect2 button");
        var ulTimes = $("#hourSelect button");
        var ulTimes2 = $("#hourSelect2 button")
        
        if((ulMorningDay).hasClass("dropdown_selected")==true && (ulMorningDay2).hasClass("dropdown_selected")==true && (ulTimes).hasClass("dropdown_selected")==true && (ulTimes2).hasClass("dropdown_selected")==true){
            $("#upbutton-alarm").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            select_all_check=true;
            console.log('checked')
        }else{
            select_all_check=false;
        }
     }

});