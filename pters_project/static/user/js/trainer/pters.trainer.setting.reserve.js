$(document).ready(function(){


     var select_all_check = false;

     if(Options.rsvDisableSet=="on"){
        $('#switch1').find('.switchball').removeClass('switchoff').addClass('switchon')
        $('#switch1').find('.switchback').addClass('switchon-back')
        $('#memberDisableSetting').show()
        $("#timeSelect button").addClass("dropdown_selected").text(Options.limit+"시간 전").val(Options.limit);
     }else if(Options.rsvDisableSet=="off"){
        $('#switch1').find('.switchball').removeClass('switchon')
        $('#switch1').find('.switchback').removeClass('switchon-back')
     }

     if(Options.reserve=="enable"){
        $('#switch2').find('.switchball').removeClass('switchoff').addClass('switchon')
        $('#switch2').find('.switchback').addClass('switchon-back')
     }else if(Options.reserve=="disable"){
        $('#switch2').find('.switchball').removeClass('switchon').addClass('switchoff')
        $('#switch2').find('.switchback').removeClass('switchon-back')
     }

     if(Options.stoptimeEnd>12){
        var stoptimeend = Number(Options.stoptimeEnd)-12
        $("#morningdaySelect button").addClass("dropdown_selected").text("오후").val("오후");
        $("#hourSelect button").addClass("dropdown_selected").text(stoptimeend+"시").val(Options.stoptimeEnd);
     }else{
        $("#morningdaySelect button").addClass("dropdown_selected").text("오전").val("오전");
        $("#hourSelect button").addClass("dropdown_selected").text(Options.stoptimeEnd+"시").val(Options.stoptimeEnd);
     }

     if(Options.stoptimeStart>12){
        var stoptimestart = Number(Options.stoptimeStart)-12
        console.log(stoptimestart)
        $("#morningdaySelect2 button").addClass("dropdown_selected").text("오후").val("오후");
        $("#hourSelect2 button").addClass("dropdown_selected").text(stoptimestart+"시").val(Options.stoptimeStart);
     }else{
        $("#morningdaySelect2 button").addClass("dropdown_selected").text("오전").val("오전");
        $("#hourSelect2 button").addClass("dropdown_selected").text(Options.stoptimeStart+"시").val(Options.stoptimeStart);
     }

     $('#uptext').text("예약 허용 시간대 설정")
     $('.pters_switch').click(function(){
       	if($(this).find('.switchball').hasClass('switchoff')){
       		$(this).find('.switchball').removeClass('switchoff').addClass('switchon')
       		$(this).find('.switchback').addClass('switchon-back')
       	}else{
       		$(this).find('.switchball').removeClass('switchon').addClass('switchoff')
       		$(this).find('.switchback').removeClass('switchon-back')
       	}
     })

     $('#switch1').click(function(){
        if($(this).find('.switchball').hasClass('switchoff')){
          $('#memberDisableSetting').hide('fast','swing')
          Options.rsvDisableSet = 'off'
          console.log(Options.rsvDisableSet)
        }else{
          $('#memberDisableSetting').show('fast','swing')
          Options.rsvDisableSet = 'on'
          console.log(Options.rsvDisableSet)
        }
     })

      $('#switch2').click(function(){
        if($(this).find('.switchball').hasClass('switchoff')){
          Options.reserve = 'disable'
          console.log(Options.reserve)
        }else{
          Options.reserve = 'enable'
          console.log(Options.reserve)
        }
      })

      $("#ulMorningDay li a").click(function(){
            $("#morningdaySelect button").addClass("dropdown_selected").text($(this).text()).val($(this).text())
            check_dropdown_selected();
      });


      $("#ulMorningDay2 li a").click(function(){
            $("#morningdaySelect2 button").addClass("dropdown_selected").text($(this).text()).val($(this).text());
            check_dropdown_selected();
      });

      $("#ulTimes li a").click(function(){
            $("#hourSelect button").addClass("dropdown_selected").text($(this).text()).val($(this).text());
            check_dropdown_selected();

            if($("#morningdaySelect button").val()=="오전"){
              Options.stoptimeEnd = $(this).attr('data-dur');
            }else if($("#morningdaySelect button").val()=="오후"){
              Options.stoptimeEnd = 12 + Number($(this).attr('data-dur'));
            }
            console.log(Options.stoptimeEnd)
      });

      $("#ulTimes2 li a").click(function(){
            $("#hourSelect2 button").addClass("dropdown_selected").text($(this).text()).val($(this).text());
            check_dropdown_selected();
            if($("#morningdaySelect2 button").val()=="오전"){
              Options.stoptimeStart = $(this).attr('data-dur');
            }else if($("#morningdaySelect2 button").val()=="오후"){
              Options.stoptimeStart = 12 + Number($(this).attr('data-dur'));
            }
            console.log(Options.stoptimeStart)
      });

      $("#ulTimes3 li a").click(function(){
            $("#timeSelect button").addClass("dropdown_selected").text($(this).text()).val($(this).text());
            check_dropdown_selected();
            Options.limit =  $(this).attr('data-dur');
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
        }else{
            select_all_check=false;
        }
     }

});