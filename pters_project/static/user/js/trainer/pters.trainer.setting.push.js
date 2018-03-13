$(document).ready(function(){
      $('#uptext2').text("푸시 알림 설정")
      $('#switch1').click(function(){
      	if($(this).find('.switchball').hasClass('switchoff')){
      		$(this).find('.switchball').removeClass('switchoff').addClass('switchon')
      		$(this).find('.switchback').addClass('switchon-back')
      		$('#pushTimeSet').show(110,"swing")

      	}else{
      		$(this).find('.switchball').removeClass('switchon').addClass('switchoff')
      		$(this).find('.switchback').removeClass('switchon-back')
      		$('#pushTimeSet').hide(150,"swing")
      	}
      })

      $('#switch2').click(function(){
      	if($(this).find('.switchball').hasClass('switchoff')){
      		$(this).find('.switchball').removeClass('switchoff').addClass('switchon');
      		$(this).find('.switchback').addClass('switchon-back');
      		$('#noRegMemberAlarm').show(110,"swing");

      	}else{
      		$(this).find('.switchball').removeClass('switchon').addClass('switchoff')
      		$(this).find('.switchback').removeClass('switchon-back')
      		$('#noRegMemberAlarm').hide(150,"swing")
      	}
      })

      $('#switch3').click(function(){
      	if($(this).find('.switchball').hasClass('switchoff')){
      		$(this).find('.switchball').removeClass('switchoff').addClass('switchon')
      		$(this).find('.switchback').addClass('switchon-back')
      		$('#changedPlanAlarmSet').show(110,"swing")

      	}else{
      		$(this).find('.switchball').removeClass('switchon').addClass('switchoff')
      		$(this).find('.switchback').removeClass('switchon-back')
      		$('#changedPlanAlarmSet').hide(150,"swing")
      	}
      })

      $('#switch4').click(function(){
      	if($(this).find('.switchball').hasClass('switchoff')){
      		$(this).find('.switchball').removeClass('switchoff').addClass('switchon')
      		$(this).find('.switchback').addClass('switchon-back')
      		$('#urgentAlarmSet').show(110,"swing")

      	}else{
      		$(this).find('.switchball').removeClass('switchon').addClass('switchoff')
      		$(this).find('.switchback').removeClass('switchon-back')
      		$('#urgentAlarmSet').hide(150,"swing")
      	}
      })

      var select_all_check = false;


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

      $("#ulnoRegMember li a").click(function(){
            $("#noRegMemberAlarmSelect button").addClass("dropdown_selected");
            $("#noRegMemberAlarmSelect .btn:first-child").text($(this).text());
            $("#noRegMemberAlarmSelect .btn:first-child").val($(this).text());
            check_dropdown_selected();
      });

      $("#ulchangedPlan li a").click(function(){
            $("#changedPlanAlarmSelect button").addClass("dropdown_selected");
            $("#changedPlanAlarmSelect .btn:first-child").text($(this).text());
            $("#changedPlanAlarmSelect .btn:first-child").val($(this).text());
            check_dropdown_selected();
      });

      $("#ulurgentDay li a").click(function(){
            $("#urgentMemberAlarmSelect button").addClass("dropdown_selected");
            $("#urgentMemberAlarmSelect .btn:first-child").text($(this).text());
            $("#urgentMemberAlarmSelect .btn:first-child").val($(this).text());
            check_dropdown_selected();
      });

      $("#ulurgentMember li a").click(function(){
            $("#urgentMemberAlarmWhenSelect button").addClass("dropdown_selected");
            $("#urgentMemberAlarmWhenSelect .btn:first-child").text($(this).text());
            $("#urgentMemberAlarmWhenSelect .btn:first-child").val($(this).text());
            check_dropdown_selected();
      });

       $("#upbutton-check").click(function(){
         //if(select_all_check==true){
             document.getElementById('update-setting-push-form').submit();
         //}else{

            //입력값 확인 메시지 출력 가능
         //}
     })

       $('#upbutton-x').click(function(){
          location.href="/trainer/trainer_setting/"
        })

      function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
        var ulMorningDay = $("#morningdaySelect button");
        var ulMorningDay2 = $("#morningdaySelect2 button");
        var ulTimes = $("#hourSelect button");
        var ulTimes2 = $("#hourSelect2 button")
        var ulnoRegMember = $("#noRegMemberAlarmSelect button");
        var ulchangedPlan = $("#changedPlanAlarmSelect button");
        var ulurgentDay = $("#urgentMemberAlarmSelect button");
        var ulurgentMember = $("#urgentMemberAlarmWhenSelect button")
        if((ulMorningDay).hasClass("dropdown_selected")==true && (ulMorningDay2).hasClass("dropdown_selected")==true && (ulTimes).hasClass("dropdown_selected")==true && (ulTimes2).hasClass("dropdown_selected")==true && (ulnoRegMember).hasClass("dropdown_selected")==true && (ulchangedPlan).hasClass("dropdown_selected")==true && (ulurgentDay).hasClass("dropdown_selected")==true &&(ulurgentMember).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            select_all_check=true;
            console.log('checked')
        }else{
            select_all_check=false;
        }
     }

});