$(document).ready(function(){


     var select_all_check = false;

     /*
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
     */

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
          $('#id_setting_member_reserve_time_prohibition').val(0)

        }else{
          $('#memberDisableSetting').show('fast','swing')
          $('#id_setting_member_reserve_time_prohibition').val($('#timeSelect button').val())
        }
     })

      $('#switch2').click(function(){
        if($(this).find('.switchball').hasClass('switchoff')){
          $('#id_setting_member_reserve_prohibition').val(0)
        }else{
          $('#id_setting_member_reserve_prohibition').val(1)
        }
      })

      function make_available_date_format(){
          var startmorningday = $("#morningdaySelect button").val()
          var endmorningday = $('#morningdaySelect2 button').val()
          var starthour = $('#hourSelect button').val()
          var endhour = $('#hourSelect2 button').val()
          if(startmorningday == "오후"){
            var starthour = Number(starthour) + 12 +':00'
            if(starthour == "24:00"){
              var starthour = "23:59"
            }
          }else if(startmorningday == "오전"){
            var starthour = Number(starthour)+':00'
          }
          if(endmorningday == "오후"){
            var endhour = Number(endhour) + 12 + ':00'
            if(endhour=="24:00"){
              var endhour = "23:59"
            }
          }else if(endmorningday == "오전"){
            var endhour = Number(endhour) + ':00'
          }
          var availableTime = starthour+'-'+endhour
          return availableTime
      }

      $("#ulMorningDay li a").click(function(){
            $("#morningdaySelect button").addClass("dropdown_selected").text($(this).text()).val($(this).text())
            var availableTime = make_available_date_format()
            $('#id_setting_member_available_time').val(availableTime)
            check_dropdown_selected();
      });


      $("#ulMorningDay2 li a").click(function(){
            $("#morningdaySelect2 button").addClass("dropdown_selected").text($(this).text()).val($(this).text());
            var availableTime = make_available_date_format()
            $('#id_setting_member_available_time').val(availableTime)
            check_dropdown_selected();
      });

      $("#ulTimes li a").click(function(){
            $("#hourSelect button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-time'));
            var availableTime = make_available_date_format()
            $('#id_setting_member_available_time').val(availableTime)
            check_dropdown_selected();
      });

      $("#ulTimes2 li a").click(function(){
            $("#hourSelect2 button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-time'));
            var availableTime = make_available_date_format()
            $('#id_setting_member_available_time').val(availableTime)
            check_dropdown_selected();
      });

      $("#ulTimes3 li a").click(function(){
            $("#timeSelect button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-time'));
            $('#id_setting_member_reserve_time_prohibition').val($('#timeSelect button').val())
            check_dropdown_selected();
      });

       $("#upbutton-alarm").click(function(){
         //if(select_all_check==true){
             document.getElementById('update-setting-reserve-form').submit();
         //}else{
             
            //입력값 확인 메시지 출력 가능
         //}
     })

      function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
        var ulMorningDay = $("#morningdaySelect button");
        var ulMorningDay2 = $("#morningdaySelect2 button");
        var ulTimes = $("#hourSelect button");
        var ulTimes2 = $("#hourSelect2 button")
        
        if((ulMorningDay).hasClass("dropdown_selected")==true && (ulMorningDay2).hasClass("dropdown_selected")==true && (ulTimes).hasClass("dropdown_selected")==true && (ulTimes2).hasClass("dropdown_selected")==true){
            $("#upbutton-alarm").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            //select_all_check=true;
        }else{
            //select_all_check=false;
        }
     }

});