$(document).ready(function(){


     var select_all_check = false;


     $('#id_setting_member_available_time').val(Options.stoptimeStart+':00-'+Options.stoptimeEnd+':00')
     $('#id_setting_member_reserve_time_prohibition').val(Options.limit)
     $('#id_setting_member_reserve_prohibition').val(Options.reserve)

     
     if(Options.limit>0){ //근접시간 예약 금지 설정
        $('#switch1').find('.switchball').removeClass('switchoff').addClass('switchon')
        $('#switch1').find('.switchback').addClass('switchon-back')
        $('#memberDisableSetting').show()
        $("#timeSelect button").addClass("dropdown_selected").text(Options.limit+"시간 전").val(Options.limit);
     }else if(Options.limit==0){
        $('#switch1').find('.switchball').removeClass('switchon')
        $('#switch1').find('.switchback').removeClass('switchon-back')
     }


     if(Options.reserve==1){ //회원 예약 일시 정지
        $('#switch2').find('.switchball').removeClass('switchoff').addClass('switchon')
        $('#switch2').find('.switchback').addClass('switchon-back')
     }else if(Options.reserve==0){
        $('#switch2').find('.switchball').removeClass('switchon').addClass('switchoff')
        $('#switch2').find('.switchback').removeClass('switchon-back')
     }

     if(Options.stoptimeStart>12){
        var stoptimestart = Number(Options.stoptimeStart)-12
        $("#hourSelect button").addClass("dropdown_selected").text('오후'+stoptimestart+"시").val(Options.stoptimeStart);
     }else{
        $("#hourSelect button").addClass("dropdown_selected").text('오전'+Options.stoptimeStart+"시").val(Options.stoptimeStart);
     }

     if(Options.stoptimeEnd>12){
        var stoptimeend = Number(Options.stoptimeEnd)-12
        $("#hourSelect2 button").addClass("dropdown_selected").text('오후'+stoptimeend+"시").val(Options.stoptimeEnd);
     }else{
        $("#hourSelect2 button").addClass("dropdown_selected").text('오전'+Options.stoptimeEnd+"시").val(Options.stoptimeEnd);
     }


     $('#uptext2').text("예약 허용 시간대 설정")
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
        check_dropdown_selected();
     })

      $('#switch2').click(function(){
        if($(this).find('.switchball').hasClass('switchoff')){
          $('#id_setting_member_reserve_prohibition').val(0)
        }else{
          $('#id_setting_member_reserve_prohibition').val(1)
        }
        check_dropdown_selected();
      })

      /*
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
      */

      function make_available_date_format(){
          var starthour = $('#hourSelect button').val()
          var endhour = $('#hourSelect2 button').val()
          if(starthour == "24"){
            var starthour = "23:59"
          }else{
            var starthour = $('#hourSelect button').val() + ':00'
          }
          if(endhour == "24"){
            var endhour = "23:59"
          }else{
            var endhour = $('#hourSelect2 button').val() + ':00'
          }
          var availableTime = starthour+'-'+endhour
          return availableTime
      }


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






       $("#upbutton-check").click(function(){
         if(select_all_check==true){
             document.getElementById('update-setting-reserve-form').submit();
         }else{
             
            //입력값 확인 메시지 출력 가능
         }
     })
       $('#upbutton-x').click(function(){
          location.href="/trainer/trainer_setting/"
        })

      function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
        var availableTime = $('#id_setting_member_available_time').val()
        var limit = $('#id_setting_member_reserve_time_prohibition').val()
        var reservedisable =  $('#id_setting_member_reserve_prohibition').val()
        console.log(availableTime, limit, reservedisable)
        console.log(stoptime, Options.limit, Options.reserve)
        if(availableTime == stoptime && limit == Options.limit && reservedisable == Options.reserve){
          $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
          select_all_check=false;
          console.log('false')
        }else{
          $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
          select_all_check=true;
          console.log('true')
        }
     }

});