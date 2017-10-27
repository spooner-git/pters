$(document).ready(function(){
      $('#uptext').text("푸시 알림 설정")
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
      		$(this).find('.switchball').removeClass('switchoff').addClass('switchon')
      		$(this).find('.switchback').addClass('switchon-back')
      		$('#noRegMemberAlarm').show(110,"swing")

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

});