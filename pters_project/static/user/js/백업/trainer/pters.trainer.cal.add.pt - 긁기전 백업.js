$(document).ready(function(){

      //바로 실행
      get_current_member_list()
      get_current_group_list()
      //


      //유저가 터치인지 마우스 사용인지 알아낸다
      var touch_or_mouse = ""
           window.addEventListener('touchstart',function(){
          touch_or_mouse = "touch"
      })
      //유저가 터치인지 마우스 사용인지 알아낸다

      //초기에 미니 timegraph를 채워주기 위한 DBdataprocess 
      //DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateData,"graph",classTimeData)
      //DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offDateData,"graph",offTimeData)
      //초기에 미니 timegraph를 채워주기 위한 DBdataprocess 


      //var select_all_check = false;
      var offset_for_canvas;

      

      var date = new Date();
      var currentYear = date.getFullYear(); //현재 년도
      var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
      var currentDate = date.getDate(); //오늘 날짜
      var currentDay = date.getDay() // 0,1,2,3,4,5,6,7
      var currentHour = date.getHours();
      var currentMinute = date.getMinutes();

      $("#datepicker, #datepicker_repeat_start, #datepicker_repeat_end").datepicker({
              //minDate : 0,
              onSelect : function(curDate, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
                if( curDate != instance.lastVal ){
                  $(this).parent('p').addClass("dropdown_selected");
                  if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
                      //$("#id_training_date").val($("#datepicker").val()).submit();
                      $("#id_training_date").val($("#datepicker").val());
                      if($('#timeGraph').css('display')=='none'){
                        $('#timeGraph').show(110,"swing");
                      }
                      $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder')
                      clear_start_dur_dropdown()
                      $('#durations_mini, #durations_mini').html('')
                      $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
                      ajaxTimeGraphSet($('#datepicker').val())
                      /*
                      timeGraphSet("class","pink","AddClass", initialJSON);  //시간 테이블 채우기
                      timeGraphSet("group","pink","AddClass", initialJSON);
                      timeGraphSet("off","grey","AddClass", initialJSON)
                      */
                      startTimeSet('class');
                  }
                  else if(addTypeSelect =="offadd"){
                      //$("#id_training_date_off").val($("#datepicker").val()).submit();
                      $("#id_training_date_off").val($("#datepicker").val());
                      if($('#timeGraph').css('display')=='none'){
                        $('#timeGraph').show(110,"swing");
                      }
                      $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder')
                      clear_start_dur_dropdown()
                      /*ajaxTimeGraphSet($('#datepicker').val(), function(){
                        startTimeSet('class');
                        })*/
                      $('#durations_mini, #durations_mini').html('')
                      $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
                      ajaxTimeGraphSet($('#datepicker').val())
                      /*
                      timeGraphSet("class","pink","AddClass", initialJSON);  //시간 테이블 채우기
                      timeGraphSet("group","pink","AddClass", initialJSON);
                      timeGraphSet("off","grey","AddClass", initialJSON)
                      */
                      startTimeSet('class');
                  }
                  else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
                      $("#datepicker_repeat_end").datepicker('option','minDate',$("#datepicker_repeat_start").val())
                      $("#datepicker_repeat_start").datepicker('option','maxDate',$("#datepicker_repeat_end").val())
                      $("#id_repeat_start_date").val($("#datepicker_repeat_start").val());
                      $("#id_repeat_end_date").val($("#datepicker_repeat_end").val());
                  }
                  else if(addTypeSelect == "repeatoffadd"){
                      $("#datepicker_repeat_end").datepicker('option','minDate',$("#datepicker_repeat_start").val())
                      $("#datepicker_repeat_start").datepicker('option','maxDate',$("#datepicker_repeat_end").val())
                      $("#id_repeat_start_date_off").val($("#datepicker_repeat_start").val());
                      $("#id_repeat_end_date_off").val($("#datepicker_repeat_end").val());
                  }
                  check_dropdown_selected_addplan();
                }
              }
      });

      
      $(document).on('click','.td00, .td30',function(){ //주간달력 미니 팝업
            closeAlarm('pc')
            if($('._MINI_ptadd').css('display')=='inline'){
              addTypeSelect = 'ptadd'
              var compensate_off = 0
            }else if($('._MINI_ptadd').css('display')=="none"){
              addTypeSelect = 'offadd'
              var compensate_off = +30
            }
            var toploc = $(this).offset().top;
            var leftloc = $(this).offset().left;
            var tdwidth = $(this).width();
            var tdheight = $(this).height();
            var minipopupwidth = 300;
            var minipopupheight = 250;
            var splitID = $(this).attr('id').split('_')
            var weekID = $(this).attr('data-week')
            
          
            //minipopup 위치 보정
            if(splitID[3]>=(Options.workEndTime-5)){
              //$('.dropdown_mini').addClass('dropup')
              if(splitID[3]== (Options.workEndTime-1)){
                if(Options.workEndTime - Options.workStartTime < 5){
                  var toploc = toploc
                }else{
                  var toploc = toploc - minipopupheight + compensate_off
                }
              }else if(splitID[3] <= (Options.workStartTime+3)){
                var toploc = toploc
              }else{
                var toploc = toploc - minipopupheight + compensate_off
              }
            }else{
              $('.dropdown_mini').removeClass('dropup')
              if(weekID==3){
                var toploc = toploc + tdheight
              }else{
                var toploc = toploc + 30
              }
            }

            if(weekID>=4){
              var leftloc = leftloc-300-tdwidth
            }else if(weekID==3){
              var leftloc = leftloc
            }
            //minipopup 위치 보정
            var thisIDSplitArray = $(this).attr('id').split('_')
            if(thisIDSplitArray[4]=="30"){
              var next30ID = '#'+thisIDSplitArray[0]+'_'+thisIDSplitArray[1]+'_'+thisIDSplitArray[2]+'_'+(Number(thisIDSplitArray[3])+1)+'_00'
            }else if(thisIDSplitArray[4]=="00"){
              var next30ID = '#'+thisIDSplitArray[0]+'_'+thisIDSplitArray[1]+'_'+thisIDSplitArray[2]+'_'+thisIDSplitArray[3]+'_30'
            }
            var thisTime = thisIDSplitArray[3] +'_'+ thisIDSplitArray[4]
            //2018_5_13_23_30
            if(Options.classDur == 60){
                if(!$(this).find('div').hasClass('classTime')
                  && !$(this).find('div').hasClass('groupTime')  
                  && !$(this).find('div').hasClass('offTime') 
                  && $('#page-addplan-pc').css('display','none') 
                  && !$(next30ID).find('div').hasClass('classTime')
                  && !$(next30ID).find('div').hasClass('groupTime') 
                  && !$(next30ID).find('div').hasClass('offTime') 
                  && !$(this).hasClass('_on')
                  && thisTime!=(Options.workEndTime-1)+'_30'){
                  //$('.td00').css('background','transparent')
                  closeMiniPopupByChange()
                  if(Options.classDur == 30){
                    $(this).find('div').addClass('blankSelected30')
                    $('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
                  }else if(Options.classDur == 60){
                    if($(this).attr('id').split('_')[4]=='30'){
                      //if(!$('#'+$(this).attr('id').split('_')[0]+'_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2]+'_'+$(this).attr('id').split('_')[3]+'_00').hasClass('_on')){
                        //$('#'+$(this).attr('id').split('_')[0]+'_'+$(this).attr('id').split('_')[1]+'_'+$(this).attr('id').split('_')[2]+'_'+$(this).attr('id').split('_')[3]+'_00').find('div').addClass('blankSelected')
                        $(this).find('div').addClass('blankSelected')
                        $('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
                      //}
                      
                    }else{
                      $(this).find('div').addClass('blankSelected')
                      $('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
                      //$(this).find('div').addClass('blankSelected30')
                    }
                    
                  }
                  //$('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
                  $('.typeSelected').removeClass('typeSelected')
                  $('#typeSelector_'+addTypeSelect).addClass('typeSelected')
                  if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
                    $('._MINI_ptadd').css('display','inline')
                    //$('._MINI_offadd').hide()
                  }else if(addTypeSelect == "offadd"){
                    //$('._MINI_offadd').show()
                    $('._MINI_ptadd').css('display','none')
                  }
                  if(Options.hourunit == 30){
                      var tdinfo = $(this).attr('id').split('_');
                      var yy = tdinfo[0];
                      var mm = tdinfo[1];
                      var dd = tdinfo[2];
                      var hh = tdinfo[3];
                      var min = tdinfo[4];
                      //var min = '00'
                      //var hh1 = Number(tdinfo[3])+1;
                      //var min1 = '00'
                      
                      if(min == '00'){
                        var hh1 = Number(tdinfo[3])+1;
                        var min1 = '00'
                      }else if(min == "30"){
                        var hh1 = Number(tdinfo[3])+1;
                        var min1 = '30'
                      }
                      
                      var yy0 = tdinfo[0];
                      var mm0 = tdinfo[1];
                      var dd0 = tdinfo[2];
                      if(yy0.length<2){var yy0 = '0'+String(tdinfo[0])};
                      if(mm0.length<2){var mm0 = '0'+String(tdinfo[1])};
                      if(dd0.length<2){var dd0 = '0'+String(tdinfo[2])};
                      if(Options.language == "KOR"){
                        var text = yy+'년 '+mm+'월 '+dd+'일 '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }else if(Options.language == "JPN"){
                        var text = yy+'年 '+mm+'月 '+dd+'日 '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }else if(Options.language == "ENG"){
                        var text = yy+'. '+mm+'. '+dd+'. '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }
                      $('#datetext_mini').text(text).val(yy0+'-'+mm0+'-'+dd0)
                      /*ajaxTimeGraphSet(yy0+'-'+mm0+'-'+dd0, function(){
                        startTimeSet('mini');
                        durTimeSet(hh,min,"mini");})*/
                      $('#durations_mini, #durations_mini').html('')
                      $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
                      timeGraphSet("class","pink","mini", initialJSON);  //시간 테이블 채우기
                      timeGraphSet("group","pink","mini", initialJSON);
                      timeGraphSet("off","grey","mini", initialJSON)
                      durTimeSet(hh,min,"mini");
                      $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time").val(hh+':'+min+':00.000000');
                      $("#id_time_duration").val(1*(Options.classDur/60))
                      $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time_off").val(hh+':'+min+':00.000000');
                      
                  }else if(Options.hourunit == 60){
                      var tdinfo = $(this).attr('id').split('_');
                      var yy = tdinfo[0];
                      var mm = tdinfo[1];
                      var dd = tdinfo[2];
                      var hh = tdinfo[3];
                      var min = tdinfo[4];
                      var hh1 = Number(tdinfo[3])+1;
                      var min1 = '00'
                      var yy0 = tdinfo[0];
                      var mm0 = tdinfo[1];
                      var dd0 = tdinfo[2];
                      if(yy0.length<2){var yy0 = '0'+String(tdinfo[0])};
                      if(mm0.length<2){var mm0 = '0'+String(tdinfo[1])};
                      if(dd0.length<2){var dd0 = '0'+String(tdinfo[2])};
                      if(Options.language == "KOR"){
                        var text = yy+'년 '+mm+'월 '+dd+'일 '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }else if(Options.language == "JPN"){
                        var text = yy+'年 '+mm+'月 '+dd+'日 '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }else if(Options.language == "ENG"){
                        var text = yy+'. '+mm+'. '+dd+'. '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }
                      $('#datetext_mini').text(text).val(yy0+'-'+mm0+'-'+dd0)
                      /*ajaxTimeGraphSet(yy0+'-'+mm0+'-'+dd0, function(){
                        startTimeSet('mini');
                        durTimeSet(hh,min,"mini");})*/
                      $('#durations_mini, #durations_mini').html('')
                      $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
                      timeGraphSet("class","pink","mini", initialJSON);  //시간 테이블 채우기
                      timeGraphSet("group","pink","mini", initialJSON);
                      timeGraphSet("off","grey","mini", initialJSON)
                      durTimeSet(hh,min,"mini");
                      $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time").val(hh+':'+min+':00.000000');
                      $("#id_time_duration").val(1*(Options.classDur/30))
                      $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time_off").val(hh+':'+min+':00.000000');

                  }
                }
            }else if(Options.classDur == 30){
                if(!$(this).find('div').hasClass('classTime') && !$(this).find('div').hasClass('groupTime') && !$(this).find('div').hasClass('offTime') && $('#page-addplan-pc').css('display','none')){
                  //$('.td00').css('background','transparent')
                  closeMiniPopupByChange()
                  if(Options.classDur == 30){
                    $(this).find('div').addClass('blankSelected30')
                  }else if(Options.classDur == 60){
                    $(this).find('div').addClass('blankSelected')
                  }
                  $('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
                  $('.typeSelected').removeClass('typeSelected')
                  $('#typeSelector_'+addTypeSelect).addClass('typeSelected')
                  if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
                    $('._MINI_ptadd').css('display','inline')
                    //$('._MINI_offadd').hide()
                  }else if(addTypeSelect == "offadd"){
                    //$('._MINI_offadd').show()
                    $('._MINI_ptadd').css('display','none')
                  }
                  if(Options.hourunit == 30){
                      var tdinfo = $(this).attr('id').split('_');
                      var yy = tdinfo[0];
                      var mm = tdinfo[1];
                      var dd = tdinfo[2];
                      var hh = tdinfo[3];
                      var min = tdinfo[4];
                      if(min == '00'){
                        var hh1 = Number(tdinfo[3]);
                        var min1 = '30'
                      }else if(min == "30"){
                        var hh1 = Number(tdinfo[3])+1;
                        var min1 = '00'
                      }
                      var yy0 = tdinfo[0];
                      var mm0 = tdinfo[1];
                      var dd0 = tdinfo[2];
                      if(yy0.length<2){var yy0 = '0'+String(tdinfo[0])};
                      if(mm0.length<2){var mm0 = '0'+String(tdinfo[1])};
                      if(dd0.length<2){var dd0 = '0'+String(tdinfo[2])};
                      if(Options.language == "KOR"){
                        var text = yy+'년 '+mm+'월 '+dd+'일 '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }else if(Options.language == "JPN"){
                        var text = yy+'年 '+mm+'月 '+dd+'日 '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }else if(Options.language == "ENG"){
                        var text = yy+'. '+mm+'. '+dd+'. '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }
                      $('#datetext_mini').text(text).val(yy0+'-'+mm0+'-'+dd0)
                      /*ajaxTimeGraphSet(yy0+'-'+mm0+'-'+dd0, function(){
                        startTimeSet('mini');
                        durTimeSet(hh,min,"mini");})*/
                      $('#durations_mini, #durations_mini').html('')
                      $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
                      timeGraphSet("class","pink","mini", initialJSON);  //시간 테이블 채우기
                      timeGraphSet("group","pink","mini", initialJSON);
                      timeGraphSet("off","grey","mini", initialJSON)
                      durTimeSet(hh,min,"mini");
                      $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time").val(hh+':'+min+':00.000000');
                      $("#id_time_duration").val(1*(Options.classDur/30))
                      $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time_off").val(hh+':'+min+':00.000000');
 
                  }else if(Options.hourunit == 60){
                      var tdinfo = $(this).attr('id').split('_');
                      var yy = tdinfo[0];
                      var mm = tdinfo[1];
                      var dd = tdinfo[2];
                      var hh = tdinfo[3];
                      var min = tdinfo[4];
                      var hh1 = Number(tdinfo[3])+1;
                      var min1 = '00'
                      var yy0 = tdinfo[0];
                      var mm0 = tdinfo[1];
                      var dd0 = tdinfo[2];
                      if(yy0.length<2){var yy0 = '0'+String(tdinfo[0])};
                      if(mm0.length<2){var mm0 = '0'+String(tdinfo[1])};
                      if(dd0.length<2){var dd0 = '0'+String(tdinfo[2])};
                      if(Options.language == "KOR"){
                        var text = yy+'년 '+mm+'월 '+dd+'일 '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }else if(Options.language == "JPN"){
                        var text = yy+'年 '+mm+'月 '+dd+'日 '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }else if(Options.language == "ENG"){
                        var text = yy+'. '+mm+'. '+dd+'. '+hh+':'+min+' ~ '+hh1+':'+ min1
                      }
                      $('#datetext_mini').text(text).val(yy0+'-'+mm0+'-'+dd0)
                      /*ajaxTimeGraphSet(yy0+'-'+mm0+'-'+dd0, function(){
                        startTimeSet('mini');
                        durTimeSet(hh,min,"mini");})*/
                      $('#durations_mini, #durations_mini').html('')
                      $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
                      timeGraphSet("class","pink","mini", initialJSON);  //시간 테이블 채우기
                      timeGraphSet("group","pink","mini", initialJSON);
                      timeGraphSet("off","grey","mini", initialJSON)
                      durTimeSet(hh,min,"mini");
                      $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time").val(hh+':'+min+':00.000000');
                      $("#id_time_duration").val(1*(Options.classDur/30))
                      $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time_off").val(hh+':'+min+':00.000000');

                  }
                }
            }   
      })
  
      $('#datetext_mini').click(function(){console.log(addTypeSelect)})

      if($('#calendar').width()<=600){
          $(document).off('click','.td00, .td30')
      }

      $('#typeSelector .toggleBtnWrap').click(function(){
          $('.blankSelected_addview').removeClass('blankSelected blankSelected30 blankSelected_addview')
          $(this).addClass('typeSelected')
          $(this).siblings('.toggleBtnWrap').removeClass('typeSelected')
          if($(this).attr('id').split('_')[1]=="ptadd"){
              $('#memberName_mini, #remainCount_mini').css('display','inline')
              //$('#remainCount_mini').show('fast')
              $("#durationsSelected .btn:first-child").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>"+'선택'+"</span>").val("");
              $("#id_time_duration").val('')
              planAddView($("#id_time_duration").val())
              $('.pt_memo_guide_mini').css('visibility','unset')
              if($('#membersSelected_mini button').attr('data-grouptype') == "group"){
                addTypeSelect = "groupptadd"
              }else{
                addTypeSelect = "ptadd"
              }
          }else if($(this).attr('id').split('_')[1]=="offadd"){
              $('#memberName_mini, #remainCount_mini').css('display','none')
              //$('#remainCount_mini').hide('fast')
              $("#durationsSelected .btn:first-child").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>"+'선택'+"</span>").val("");
              $("#id_time_duration_off").val('')
              planAddView($("#id_time_duration_off").val())  
              $('.pt_memo_guide_mini').css('visibility','hidden')
              addTypeSelect = "offadd"
          }
          
          check_dropdown_selected_addplan();
          //planAddView($("#id_time_duration").val())
      })

      $(document).on('click',"#durations_mini li a",function(){
          $("#classDuration_mini #durationsSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-dur'));
          if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){ //Form 셋팅
            var durationTime_class =  Number($(this).attr('data-dur'))*(30/Options.classDur)
            $("#id_time_duration").val(durationTime_class);
            planAddView($(this).attr('data-dur'));
          }else if(addTypeSelect == "offadd"){
            var durationTime = Number($(this).attr('data-dur'))*(30/Options.classDur)
            $("#id_time_duration_off").val(durationTime);
            planAddView($(this).attr('data-dur'));
          }
          check_dropdown_selected_addplan();
      });


      $('#memo_mini, #scheduleMemo input').keyup(function(){
        $('#id_memo_mini, #id_memo_mini_off').val($(this).val())
      })

      function planAddView(duration){ //미니팝업으로 진행시간 표기 미리 보기
          if(Options.classDur == 60){
            var selectedDuration = Number(duration)/2
            var blankSelected = 'blankSelected'
            var selectedTime = $('.'+blankSelected).parent('div').attr('id').split('_')
            var mi = selectedTime[4]
            var yy = Number(selectedTime[0])
            var mm = Number(selectedTime[1])
            var dd = Number(selectedTime[2])
            var hh = Number(selectedTime[3])
            
            $('.blankSelected_addview').removeClass(blankSelected+' blankSelected_addview')
            for(i=hh+1; i<hh+selectedDuration; i++){
              $('#'+yy+'_'+mm+'_'+dd+'_'+i+'_'+mi).find('div').addClass(blankSelected+' blankSelected_addview')
            }
          }else if(Options.classDur == 30){
            var selectedDuration = Number(duration)
            var blankSelected = 'blankSelected30'
            var selectedTime = $('.'+blankSelected).parent('div').attr('id').split('_')
            if(selectedTime[4] == "00"){
              var mi = "30"
              var hh = Number(selectedTime[3])
            }else if(selectedTime[4] =="30"){
              var mi = "00"
              var hh = Number(selectedTime[3])+1
            }
            var yy = Number(selectedTime[0])
            var mm = Number(selectedTime[1])
            var dd = Number(selectedTime[2])
            var hh_ = Number(selectedTime[3])
            $('.blankSelected_addview').removeClass(blankSelected+' blankSelected_addview')
            for(i=hh; i<hh+selectedDuration-1; i++){
              if(mi == 60 || mi == 0){
                var mi = "00"
                var hh_ = hh_ + 1
              }
              $('#'+yy+'_'+mm+'_'+dd+'_'+hh_+'_'+mi).find('div').addClass(blankSelected+' blankSelected_addview')
              mi = Number(mi) + 30
            }
          }
      }

      function closeMiniPopupByChange(){
        $("#id_time_duration_off").val("")
        $('#page-addplan-pc').fadeOut();
        $('.blankSelected, .blankSelected30').removeClass('blankSelected blankSelected30 blankSelected_addview')
        clear_pt_off_add_popup_mini()
      }



      $(document).on('click',"#members_pc li a",function(){
          //$('.tdgraph').removeClass('graphindicator')
          if($(this).attr('data-grouptype') == "personal"){
            addTypeSelect = "ptadd"
            $('#remainCount_mini').show()
            $('#groupInfo, #groupInfo_mini, #groupInfo_mini_text, #groupInfoSelected').hide()
            $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text()).attr('data-grouptype','personal');

            //회원 이름을 클릭했을때, 회원의 수강일정중 1:1 레슨의 예약가능 횟수만을 표기해준다.
            get_member_lecture_list($(this).attr("data-dbid"), 'callback', function(jsondata){
                var availCount_personal = 0
                console.log('get_member_lecture_list',jsondata)
                for(var i= 0; i<jsondata.availCountArray.length; i++){
                  if(jsondata.lectureStateArray[i] == "IP" && jsondata.groupNameArray[i] == "1:1 레슨"){
                    availCount_personal = availCount_personal + Number(jsondata.availCountArray[i])
                  }
                }
                $("#countsSelected_mini").show().text(availCount_personal);
            })
            
            $('#remainCount_mini_text').css('display','inline-block')
            $("#id_lecture_id").val($(this).attr('data-lectureid'));
            $("#id_member_id").val($(this).attr('data-dbid'));
            $("#id_member_name").val($(this).text());
          }else if($(this).attr('data-grouptype') == "group"){
            addTypeSelect = "groupptadd"
            $('#remainCount_mini, #remainCount_mini_text, #countsSelected_mini').hide()
            $('#groupInfo, #groupInfo_mini, #groupInfo_mini_text, #groupInfoSelected').show()
            $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text()).attr('data-grouptype','group');
            $('#grouptypenumInfo, #groupInfoSelected').text('('+$(this).attr('data-grouptypecd_nm')+' 정원'+$(this).attr('data-membernum')+'명)')
            $("#id_group_id").val($(this).attr('data-groupid'));
          }
          
          check_dropdown_selected_addplan();
  		}); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $(document).on('click',"#members_mobile li a",function(){
          //$('.tdgraph').removeClass('graphindicator')
          if($(this).attr("data-grouptype") == "personal"){
              if($('._NORMAL_ADD_wrap').css('display') == 'block'){
                addTypeSelect = "ptadd"
              }else if($('._REPEAT_ADD_wrap').css('display') == 'block'){
                addTypeSelect = "repeatptadd"
              }
              $('#remainCount').show()
              $('#groupInfo').hide()
              get_repeat_info($(this).attr('data-dbid'))

              //회원 이름을 클릭했을때, 회원의 수강일정중 1:1 레슨의 예약가능 횟수만을 표기해준다.
              get_member_lecture_list($(this).attr("data-dbid"), 'callback', function(jsondata){
                  var availCount_personal = 0
                  for(var i= 0; i<jsondata.availCountArray.length; i++){
                    if(jsondata.lectureStateArray[i] == "IP" && jsondata.groupNameArray[i] == "1:1 레슨"){
                      availCount_personal = availCount_personal + Number(jsondata.availCountArray[i])
                    }
                  }
                  $("#countsSelected").text(availCount_personal);
              })

              $('#cal_popup_repeatconfirm').attr({'data-lectureid':$(this).attr('data-lectureid'),'data-dbid':$(this).attr('data-dbid')})
              $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text());
              $("#id_member_id").val($(this).attr('data-dbid'));
              $("#id_lecture_id").val($(this).attr('data-lectureid'));
              $("#id_member_name").val($(this).text());

              if(addTypeSelect == "repeatptadd"){
                $("#id_repeat_member_id").val($(this).attr('data-dbid'));
                $("#id_repeat_lecture_id").val($(this).attr('data-lectureid'));
                $("#id_repeat_member_name").val($(this).text());
              }

          }else if($(this).attr("data-grouptype") == "group"){

              if($('._NORMAL_ADD_wrap').css('display') == 'block'){
                addTypeSelect = "groupptadd"
              }else if($('._REPEAT_ADD_wrap').css('display') == 'block'){
                addTypeSelect = "repeatgroupptadd"
              }
              $('#remainCount').hide()
              $('#groupInfo').show()
              
              
              get_repeat_info($(this).attr('data-groupid'))
              $('#id_repeat_group_id').val($(this).attr('data-groupid'))

              $('#cal_popup_repeatconfirm').attr({'data-lectureid':$(this).attr('data-lectureid'),'data-groupid':$(this).attr('data-groupid')})
              $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text());
              $('#grouptypenumInfo').text($(this).attr('data-grouptypecd_nm')+' ('+$(this).attr('data-groupmembernum')+' / '+$(this).attr('data-membernum')+')')
              $("#id_group_id").val($(this).attr('data-groupid'));
          }
          
          check_dropdown_selected_addplan();
  		}); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $('#addpopup_pc_label_off').click(function(){
        console.log(addTypeSelect)
      })
      

      $(document).on('click','#starttimes li a',function(){
          $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder')
          $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text());
          if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd" ){
            $("#id_training_time").val($(this).attr('data-trainingtime'));
          }else if(addTypeSelect == "offadd"){
            $("#id_training_time_off").val($(this).attr('data-trainingtime'));
          }else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
            $("#id_repeat_start_time").val($(this).attr('data-trainingtime'));
          }else if(addTypeSelect == "repeatoffadd"){
            $("#id_repeat_start_time_off").val($(this).attr('data-trainingtime'));
          }
          var arry = $(this).attr('data-trainingtime').split(':')
          
          //진행시간 드랍다운리스트 채움
          durTimeSet(arry[0],arry[1],"class");

          //진행시간 자동으로 1시간으로 Default 셋팅
          $("#durationsSelected .btn:first-child").val("").html("<span style='color:#cccccc;'>선택</span>");
          $('#durationsSelected button').addClass("dropdown_selected").text($('#durations li:first-child a').text()).val($('#durations li:first-child a').attr('data-dur'))
          if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
            var durationTime_class = Number($('#durationsSelected button').val())*(30/Options.classDur)
            $("#id_time_duration").val(durationTime_class);
            addGraphIndicator($('#durationsSelected button').val())
          }else if(addTypeSelect == "offadd"){
            var durationTime = Number($('#durationsSelected button').val())*(30/Options.classDur)
            $("#id_time_duration_off").val(durationTime);
            addGraphIndicator($('#durationsSelected button').val())
          }else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
            $("#id_repeat_dur").val($('#durationsSelected button').val());
          }else if(addTypeSelect == "repeatoffadd"){
            $("#id_repeat_dur_off").val($('#durationsSelected button').val());
          }

          check_dropdown_selected_addplan();

      })

      $(document).on('click',"#durations li a, #repeatdurations li a",function(){
          $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-dur'));
          if(addTypeSelect == "ptadd" || addTypeSelect == "groupptadd"){
            var durationTime_class = Number($(this).attr('data-dur'))*(30/Options.classDur)
            $("#id_time_duration").val(durationTime_class);
            addGraphIndicator($(this).attr('data-dur'))
          }else if(addTypeSelect == "offadd"){
            var durationTime = Number($(this).attr('data-dur'))*(30/Options.classDur)
            $("#id_time_duration_off").val(durationTime);
            addGraphIndicator($(this).attr('data-dur'))
          }else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
            $("#id_repeat_dur").val($(this).attr('data-dur'));
          }else if(addTypeSelect == "repeatoffadd"){
            $("#id_repeat_dur_off").val($(this).attr('data-dur'));
          }
          check_dropdown_selected_addplan();
      }); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시


      $(document).on('click','#durationsSelected button',function(){
        $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
      })


      


      var ajax_block_during_submit = true
      $("#upbutton-check, #submitBtn_pt, #submitBtn_mini").click(function(e){
         e.preventDefault();
         if(addTypeSelect=="ptadd"){
            var $form = $('#pt-add-form')
            var serverURL = '/schedule/add_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)

         }else if(addTypeSelect=="groupptadd"){
            var $form = $('#pt-add-form')
            var serverURL = '/schedule/add_group_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)

         }else if(addTypeSelect=="offadd"){
            var $form = $('#off-add-form')
            var serverURL = '/schedule/add_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)

         }else if(addTypeSelect=="repeatptadd"){
            var $form = $('#add-repeat-schedule-form')
            var serverURL = '/schedule/add_repeat_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)

         }else if(addTypeSelect=="repeatgroupptadd"){
            var $form = $('#add-repeat-schedule-form')
            var serverURL = '/schedule/add_group_repeat_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)

         }else if(addTypeSelect=="repeatoffadd"){
            var $form = $('#add-off-repeat-schedule-form')
            var serverURL = '/schedule/add_repeat_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)
         }
         if(select_all_check==true){
             //ajax 회원정보 입력된 데이터 송신
            if(ajax_block_during_submit == true){
                ajax_block_during_submit = false;
                var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts(serverURL)
                console.log(sendData)
                $.ajax({
                    url: serverURL,
                    type:'POST',
                    data:sendData,
                    dataType : 'html',

                    beforeSend:function(){
                        beforeSend(); //ajax 로딩 이미지 출력
                    },

                    //통신성공시 처리
                    success:function(data){
                        TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
                        var jsondata = JSON.parse(data);
                        initialJSON = jsondata
                        RepeatDuplicationDateArray = jsondata.RepeatDuplicationDateArray;
                        repeatArray = jsondata.repeatArray;
                        if(jsondata.messageArray.length>0){
                            $('#errorMessageBar').show();
                            $('#errorMessageText').text(jsondata.messageArray)
                        }else{
                            if(RepeatDuplicationDateArray.length>0 && (addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd")){
                                var total_count = Number(jsondata.repeatScheduleCounterArray[0])+RepeatDuplicationDateArray[0].split('/').length;
                                if(total_count == RepeatDuplicationDateArray[0].split('/').length){
                                    alert('선택한 반복일정과 동일한 일정의 반복일정이 등록 되어있습니다.\n 일정을 다시 확인 후 등록해주세요.')
                                    completeSend(); //ajax 로딩 이미지 숨기기
                                }else{
                                  var date = RepeatDuplicationDateArray[0].replace(/\//gi,", ");
                                  $('._repeatconfirmQuestion').text('총 '+total_count+' 건의 일정 중 '+RepeatDuplicationDateArray[0].split('/').length + '건의 일정이 겹칩니다.');
                                  var repeat_info = popup_repeat_confirm()
                                  $('#repeat_confirm_day').text(RepeatDuplicationDateArray[0].replace(/\//gi,','))
                                  $('#repeat_confirm_dur').text('중복 항목은 건너뛰고 등록하시겠습니까?')
                                  $('#id_repeat_schedule_id_confirm').val(repeatArray)
                                  completeSend(); //ajax 로딩 이미지 숨기기
                                  shade_index(200)
                                }
                            }else if(RepeatDuplicationDateArray.length==0 && (addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd")){
                                //if(jsondata.repeatScheduleCounterArray[0] == 0){
                                   // alert('선택한 회원님의 등록 가능한 횟수가 부족합니다.\n 다시 확인 후 등록해주세요.')
                                    //completeSend(); //ajax 로딩 이미지 숨기기
                                //}else{
                                    var repeat_info = popup_repeat_confirm()
                                    var day_info = repeat_info.day_info
                                    var dur_info = repeat_info.dur_info
                                    $('._repeatconfirmQuestion').text('총 '+jsondata.repeatScheduleCounterArray[0]+' 건의 일정이 등록됩니다.')
                                    $('#repeat_confirm_day').text(day_info)
                                    $('#repeat_confirm_dur').text(dur_info)
                                    $('#id_repeat_schedule_id_confirm').val(repeatArray)
                                    completeSend(); //ajax 로딩 이미지 숨기기
                                    shade_index(200)
                                //}
                            }else{
                                if($('._calweek').length == 1){
                                  scheduleTime('class', jsondata);
                                  scheduleTime('off', jsondata);
                                  scheduleTime('group', jsondata);
                                }
                                else if($('._calmonth').length == 1){
                                  classDatesTrainer(jsondata);
                                }
                                $('#members_mobile, #members_pc').html('')
                                get_current_member_list()
                                get_current_group_list()

                                closeAddPopup()
                                closeAddPopup_mini()
                                completeSend()
                                shade_index(-100)
                                
                                $('#calendar').show().css('height','100%')
                                if($('body').width()>=600){
                                    $('#calendar').css('position','relative')
                                }
                            }
                        }
                    },

                    //보내기후 팝업창 닫기
                    complete:function(){
                      ajax_block_during_submit = true
                    },

                    //통신 실패시 처리
                    error:function(){
                        $('#errorMessageBar').show()
                        $('#errorMessageText').text('통신 에러: 관리자 문의')
                    },
                 })
            }
                 

         }else{
            if($('#countsSelected').text() == 0){
              //alert('회원님의 남은 예약 가능 횟수가 없습니다.')
            }
            console.log('else')
          //alert('빠진 항목 체크해봐야함')
            //$('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
         }
      })

      //OFF반복일정 확인 팝업 "아니오" 눌렀을때 (선택지: 반복 설정 다시 하겠다)
      var ajax_block_during_repeat_confirm = true;
      $('#popup_btn_repeatconfirm_no').click(function(){
        if(ajax_block_during_repeat_confirm == true){
            $('#id_repeat_confirm').val(0);
            if($('body').width()<600){
              shade_index(-100) //20180430
              $('#calendar').show() //20180430
            }
            close_info_popup('cal_popup_repeatconfirm')
            ajaxRepeatConfirmSend();
            check_dropdown_selected_addplan()
        }
      })


      $('#popup_btn_repeatconfirm_yes').click(function(){
        if(ajax_block_during_repeat_confirm == true){
            $('#id_repeat_confirm').val(1);
            if($('body').width()<600){
              close_info_popup('page-addplan')
              shade_index(-100) //20180430
              $('#calendar').show() //20180430
            }
            close_info_popup('cal_popup_repeatconfirm')
            ajaxRepeatConfirmSend('callback',function(){
                if(addTypeSelect == "repeatgroupptadd"){
                  var id = $('#cal_popup_repeatconfirm').attr('data-groupid')
                }else{
                  var id = $('#cal_popup_repeatconfirm').attr('data-dbid')
                }
                get_repeat_info(id)

                $('#members_mobile, #members_pc').html('')
                
                get_current_member_list('callback',function(jsondata){
                  set_member_dropdown_list(jsondata)
                  $('#countsSelected').text($('#members_mobile a[data-dbid="'+id+'"]').attr('data-lecturecount'))
                })
                
                get_member_lecture_list(id, 'callback', function(jsondata){
                    var availCount_personal = 0
                    for(var i= 0; i<jsondata.availCountArray.length; i++){
                      if(jsondata.lectureStateArray[i] == "IP" && jsondata.groupNameArray[i] == "1:1 레슨"){
                        availCount_personal = availCount_personal + Number(jsondata.availCountArray[i])
                      }
                    }
                    $("#countsSelected").text(availCount_personal);
                })
                get_current_group_list('callback',function(jsondata){
                  set_group_dropdown_list(jsondata)
                  $('#grouptypenumInfo').text($('#members_mobile a[data-groupid="'+id+'"]').attr('data-grouptypecd_nm') +' '+ $('#members_mobile a[data-groupid="'+id+'"]').attr('data-groupmembernum') + ' / ' + $('#members_mobile a[data-groupid="'+id+'"]').attr('data-membernum'))
                })
            });
            check_dropdown_selected_addplan()
        }
      })


      //일정 눌러서 cal_popup_planinfo의 그룹 참석자 버튼
      $('#popup_btn_viewGroupParticipants').click(function(){
        if(toggleGroupParticipants == 'off'){
          toggleGroupParticipantsList('on')
          var group_id = $(this).attr('data-groupid')
          var max = $(this).attr('data-membernum')
          var group_schedule_id = $(this).attr('group-schedule-id')
          console.log("group_id:",group_id,"max:",max,"group_schedule_id:",group_schedule_id)
          get_group_plan_participants(group_schedule_id,'callback',function(jsondata){draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id, max);completeSend();})

        }else if(toggleGroupParticipants == 'on'){
          toggleGroupParticipantsList('off')
        }
      })
      

      //일정완료 사인용 캔버스
      var pos = {
        drawable : false,
        x: -1,
        y: -1
      };
      $('#popup_text0, #popup_btn_complete').click(function(){
        setTimeout(function(){offset_for_canvas = $('#canvas').offset();},250)
        //$('body').css({'overflow-y':'hidden'})
        //$('#calendar').css({'position':'fixed'})
      })

      var canvas, ctx;
      var canvas = document.getElementById('canvas')
      var ctx = canvas.getContext("2d");

        canvas.addEventListener("mousedown",listener)
        canvas.addEventListener("mousemove",listener)
        canvas.addEventListener("mouseup",listener)
        canvas.addEventListener("mouseout",listener)
        canvas.addEventListener("touchstart",listener)
        canvas.addEventListener("touchmove",listener)
        canvas.addEventListener("touchend",listener)
        canvas.addEventListener("touchcancel",listener)
      
      $("canvas").attr("width", 324).attr("height", 200);
      $(document).on('click','div.classTime, div.plan_raw, div.groupTime',function(){
        ctx.clearRect(0,0,324,300);
        $('#cal_popup').css({'top':'35%'});
      })

      function listener(event){
        switch(event.type){
          case "touchstart":
              initDraw(event);
              $('#canvas').css({'border-color':'#fe4e65'})
              $('#popup_text0, #popup_btn_complete').css({'color':'#ffffff','background':'#fe4e65'}).val('filled')
              break;

          case "touchmove":
              if(pos.drawable){
                draw(event);
              }
              break;
          case "touchend":
          case "touchcancel":
              finishDraw();
              break;

          case "mousedown":
              initDraw(event);
              $('#canvas').css({'border-color':'#fe4e65'})
              $('#popup_text0, #popup_btn_complete').css({'color':'#ffffff','background':'#fe4e65'}).val('filled')
              break;
          case "mousemove":
              if(pos.drawable){
                draw(event);
              }
              break;
          case "mouseup":
          case "mouseout":
              finishDraw();
              break;

        }
      }

      function initDraw(event){
        ctx.beginPath();
        pos.drawable = true;
        var coors = getPosition(event);
        pos.x = coors.X;
        pos.y = coors.Y;
        ctx.moveTo(pos.x, pos.y);
      }

      function draw(event){
        event.preventDefault()
        var coors = getPosition(event);
        ctx.lineTo(coors.X, coors.Y);
        pos.x = coors.X;
        pos.y = coors.Y;
        ctx.stroke();
      }

      function finishDraw(){
        pos.drawable = false;
        pos.x = -1;
        pos.y = -1;
      }

      function getPosition(event){
        if(touch_or_mouse=="touch"){
          var x = event.touches[0].pageX - offset_for_canvas.left;
          var y = event.touches[0].pageY - offset_for_canvas.top;  
        }else{
          var x = event.pageX - offset_for_canvas.left;
          var y = event.pageY - offset_for_canvas.top;
        }
        return {X:x, Y:y}
      }
});



function float_btn_addplan(option){
    if(option == 0){
        //$("#float_btn").animate({opacity:'1'})
        if($('#mshade').css('display')=='none'){
            //$('#mshade').css({'z-index':100,'display':'block'})
            $('#float_inner1').animate({'opacity':'1','bottom':'85px'},120);
            $('#float_inner2').animate({'opacity':'1','bottom':'145px'},120);
            $('#float_btn').addClass('rotate_btn');
            shade_index(100)
        }else{
            //$('#mshade').css({'z-index':-100,'display':'none'})
            $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
            $('#float_btn').removeClass('rotate_btn');
            shade_index(-100)
        }

    }else if(option == 1){
        clear_pt_off_add_popup()
        open_pt_off_add_popup('ptadd')
        ajaxTimeGraphSet()
        shade_index(100)
        //scrollToDom($('#calendar'))
        
    }else if(option ==2){
        clear_pt_off_add_popup()
        open_pt_off_add_popup('offadd')
        //addTypeSelect = "offadd"
        get_repeat_info("")
        ajaxTimeGraphSet()
        shade_index(100)
        //scrollToDom($('#calendar'))
    }
}

function open_pt_off_add_popup(option){ //option 'ptadd', 'offadd'
    addTypeSelect = option

    $('#datepicker').datepicker('setDate', currentYear+'-'+(currentMonth+1)+'-'+currentDate)
    $('#datepicker').parent('p').addClass('dropdown_selected')
    $('#datepicker_repeat_start').datepicker('setDate', currentYear+'-'+(currentMonth+1)+'-'+currentDate)
    $('#datepicker_repeat_start').parent('p').addClass('dropdown_selected')
    $('#page-addplan #timeGraph').css('display','block')

    if(option == "ptadd"){
        $('#remainCount, #groupInfo').css('display','none');
        $('#memberName').css('display','block');
        $('#uptext2').text('레슨 일정 등록')
        $('#id_training_date').val($('#datepicker').val())
        $('#id_repeat_start_date').val($('#datepicker_repeat_start').val())
        if($('body').width()>600){
          $('#addpopup_pc_label_pt').show()
          $('#addpopup_pc_label_off').hide()
        }
        $(".pt_memo_guide").css('display','block')
    }else if(option == "offadd"){
        $('#memberName, #remainCount, #groupInfo').css('display','none');
        $('#uptext2').text('OFF 일정 등록')
        $('#id_training_date_off').val($('#datepicker').val())
        $('#id_repeat_start_date_off').val($('#datepicker_repeat_start').val())
        if($('body').width()>600){
          $('#addpopup_pc_label_off').show()
          $('#addpopup_pc_label_pt').hide()
        }
        $(".pt_memo_guide").css('display','none')
    }
    
    if($('body').width()<=600){
      $('#page-base').fadeOut();
      $('#page-base-addstyle').fadeIn();
      $('#float_inner1, #float_inner2').animate({'opacity':'0','bottom':'25px'},10);
      $('#float_btn_wrap').fadeOut();
      $('#calendar').hide();
      $('#calendar').css('height','0')
      $('#addpopup_pc_label_pt, #addpopup_pc_label_off').css('display','none')
      $('#page-addplan').fadeIn('fast').css('top',50);
    }else{
      $('#page-addplan').fadeIn('fast').css({'top':(($(window).height()-$('#page-addplan').outerHeight())/2+$(window).scrollTop()),
                                                'left':(($(window).width()-$('#page-addplan').outerWidth())/2+$(window).scrollLeft())})
      $('#page-addplan-pc').css('display','none')
    }

    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder') //선택된 시간 반짝이
    /*ajaxTimeGraphSet($('#datepicker').val(), function(){
        startTimeSet('class');
        })*/
      timeGraphSet("class","pink","AddClass", initialJSON);  //시간 테이블 채우기
      timeGraphSet("group","pink","AddClass", initialJSON);
      timeGraphSet("off","grey","AddClass", initialJSON)
      startTimeSet('class');
}

//PT, OFF추가하는 모바일,PC팝업 선택사항을 초기화
function clear_pt_off_add_popup(){
    //핑크체크를 원래대로 검정 체크로 돌린다(모바일)
    $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
    //submitButton 초기화
    $('#submitBtn_pt').removeClass('submitBtnActivated')

    //회원명 비우기
    $("#membersSelected button").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>회원/그룹 선택</span><img src='/static/user/res/ajax/loading.gif' alt='' class='ajaxloading_dropdown'>").val("");
    

    //예약가능 횟수 비우기
    $("#countsSelected, #countsSelected_mini").text("")
    $('#remainCount_mini, #groupInfo_mini').hide()
    
    //날짜 비우기
    $("#dateSelector p").removeClass("dropdown_selected");

    //Time 그래프 숨기기
    $('#timeGraph').css('display','none')

    //시작시간, 진행시간 드랍다운 초기화
    $("#starttimesSelected button, #durationsSelected button").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>선택</span>").val("");
    $("#starttimes, #durations").empty();

    //메모 지우기
    $('#scheduleMemo input').val('').text('')

    //모든 하단 핑크선 지우기
    $('#page-addplan .dropdown_selected').removeClass('dropdown_selected')
    
    //상단 일반-반복 토글 스위치 초기화
    $('.mode_switch_button_wrap_cal div').removeClass('mode_active')
    $('.mode_switch_button_wrap_cal div:first-child').addClass('mode_active')

    //반복일정 요일선택 버튼 초기화
    selectedDayGroup = []
    $('.dateButton').removeClass('dateButton_selected')

    //반복일정 시작일자, 종료일자 초기화
    $("#datepicker_repeat_start, #datepicker_repeat_end").datepicker('setDate',null)

    //반복빈도, 시작시간, 진행시간 드랍다운 초기화
    $('#repeattypeSelected button, #repeatstarttimesSelected button, #repeatdurationsSelected button').html("<span style='color:#cccccc;'>선택</span>");

    //반복일정 접기
    $('._NORMAL_ADD_wrap').css('display','block')
    $('._REPEAT_ADD_wrap').css('display','none')
}


function get_current_member_list(use, callback){
    var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_member_ing_list')
    $.ajax({
          url: '/trainer/get_member_ing_list/',
          dataType : 'html',

          beforeSend:function(){
              //beforeSend(); //ajax 로딩이미지 출력
              $('#membersSelected span, #membersSelected_mini span').hide()
              $('#membersSelected img.ajaxloading_dropdown, #membersSelected_mini img.ajaxloading_dropdown').show()
          },

          success:function(data){
            TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
              $('#errorMessageBar').show()
              $('#errorMessageText').text(jsondata.messageArray)
            }else{
              if(use == "callback"){
                callback(jsondata)
              }else{
                set_member_dropdown_list(jsondata)
              }
            }
          },

          complete:function(){
            //completeSend(); //ajax 로딩이미지 숨기기
              $('#membersSelected span, #membersSelected_mini span').show()
              $('#membersSelected img.ajaxloading_dropdown, #membersSelected_mini img.ajaxloading_dropdown').hide()
          },

          error:function(){
                $('#errorMessageBar').show()
                $('#errorMessageText').text('통신 에러: 관리자 문의')
          }
        }) 
}


function get_current_group_list(use, callback){
  var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_group_ing_list')
    $.ajax({
          url: '/trainer/get_group_ing_list/',
          dataType : 'html',

          beforeSend:function(){
              //beforeSend(); //ajax 로딩이미지 출력
              $('#membersSelected span, #membersSelected_mini span').hide()
              $('#membersSelected img.ajaxloading_dropdown, #membersSelected_mini img.ajaxloading_dropdown').show()
          },

          success:function(data){
            TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
              $('#errorMessageBar').show()
              $('#errorMessageText').text(jsondata.messageArray)
            }else{
              if(use == "callback"){
                callback(jsondata)
              }else{
                set_group_dropdown_list(jsondata)
              }
            }
          },

          complete:function(){
            //completeSend(); //ajax 로딩이미지 숨기기
              $('#membersSelected span, #membersSelected_mini span').show()
              $('#membersSelected img.ajaxloading_dropdown, #membersSelected_mini img.ajaxloading_dropdown').hide()
          },

          error:function(){
                $('#errorMessageBar').show()
                $('#errorMessageText').text('통신 에러: 관리자 문의')
          }
        })
}

function set_member_dropdown_list(jsondata){
  console.log("set_member_dropdown_list:", jsondata)
    var memberMobileList = $('#members_mobile');
    var memberPcList = $('#members_pc');
    var memberSize = jsondata.db_id.length;
    var member_array_mobile = [];
    var member_array_pc = [];
    if(memberSize>0){
      for(var i=0; i<memberSize; i++){
        if((jsondata.groupInfoArray[i] != "그룹") && (jsondata.groupInfoArray[i] != "클래스") && (jsondata.groupInfoArray[i] != "그룹/클래스")){
          member_array_mobile[i] = '<li><a data-grouptype="personal" data-lectureid="'+jsondata.lecture_id[i]+'" data-lecturecount="'+jsondata.avail_count[i]+'" data-dbid="'+jsondata.db_id[i]+'">'+jsondata.name[i]+'</a></li>';
          member_array_pc[i] = '<li><a data-grouptype="personal" data-lectureid="'+jsondata.lecture_id[i]+'" data-lecturecount="'+jsondata.avail_count[i]+'" data-dbid="'+jsondata.db_id[i]+'">'+jsondata.name[i]+'</a></li>';
        }
      }
    }else if(memberSize == 0){
        member_array_mobile[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;">등록된 회원이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
        member_array_pc[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;">등록된 회원이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
    }
    var member_arraySum_mobile = member_array_mobile.join('');
    var member_arraySum_pc = member_array_pc.join('');
    memberMobileList.append(member_arraySum_mobile);
    memberPcList.append(member_arraySum_pc);
}

function set_group_dropdown_list(jsondata){
    var memberMobileList = $('#members_mobile');
    var memberPcList = $('#members_pc');
    var memberSize = jsondata.group_id.length;
    var member_array_mobile = [];
    var member_array_pc = [];
    if(memberSize>0){
      for(var i=0; i<memberSize; i++){
        member_array_mobile[i] = '<li><a  data-grouptype="group" data-grouptypecd_nm="'+jsondata.group_type_cd_nm[i]+'" data-groupmembernum="'+jsondata.group_member_num[i]+'" data-membernum="'+jsondata.member_num[i]+'" data-groupid="'+jsondata.group_id[i]+'">['+jsondata.group_type_cd_nm[i]+'] '+jsondata.group_name[i]+'</a></li>';
        member_array_pc[i] = '<li><a  data-grouptype="group" data-grouptypecd_nm="'+jsondata.group_type_cd_nm[i]+'" data-groupmembernum="'+jsondata.group_member_num[i]+'" data-membernum="'+jsondata.member_num[i]+'" data-groupid="'+jsondata.group_id[i]+'">['+jsondata.group_type_cd_nm[i]+'] '+jsondata.group_name[i]+'</a></li>';
      }
    }else if(memberSize == 0){
        //member_array_mobile[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;">등록된 그룹이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
        //member_array_pc[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;">등록된 그룹이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
    }
    var member_arraySum_mobile = member_array_mobile.join('');
    var member_arraySum_pc = member_array_pc.join('');
    memberMobileList.prepend(member_arraySum_mobile);
    memberPcList.prepend(member_arraySum_pc);
}





function ajaxRepeatConfirmSend(use, callback){
      ajax_block_during_repeat_confirm = false
      if(addTypeSelect == "repeatgroupptadd"){
        var serverURL = '/schedule/add_group_repeat_schedule_confirm/'
      }else{
        var serverURL = '/schedule/add_repeat_schedule_confirm/'
      }
      var $form = $('#confirm-repeat-schedule-form')
      var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts(serverURL)
      $.ajax({
        url: serverURL,
        type:'POST',
        data: $form.serialize(),
        dataType : 'html',

        beforeSend:function(){
            beforeSend(); //ajax 로딩이미지 출력
        },

        success:function(data){
          TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
          var jsondata = JSON.parse(data);
          console.log('ajaxRepeatConfirmSend',jsondata)
          if(jsondata.messageArray.length>0){
            $('#errorMessageBar').show()
            $('#errorMessageText').text(jsondata.messageArray)
          }else{
            set_schedule_time(jsondata)
            if(use == "callback"){
              callback(jsondata)
            }
          }
        },

        complete:function(){
          completeSend(); //ajax 로딩이미지 숨기기
          ajax_block_during_repeat_confirm = true
        },

        error:function(){
              $('#errorMessageBar').show()
              $('#errorMessageText').text('통신 에러: 관리자 문의')
        }
      })    
}


function ajaxTimeGraphSet(date, use, callback){
      var today_form = date
      offAddOkArray = [] //OFF 등록 시작 시간 리스트
      durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트
      $('#durations_mini, #durations_mini').html('')
      $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
      var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_trainer_schedule')
      $.ajax({
        url: '/trainer/get_trainer_schedule/',
        type : 'GET',
        data : {"date":today_form, "day":1}, //월간 46 , 주간 18, 하루 1
        dataType : 'html',

        beforeSend:function(){
          beforeSend()
        },

        success:function(data){
          TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
          var jsondata = JSON.parse(data);
          if(jsondata.messageArray.length>0){
            $('#errorMessageBar').show()
            $('#errorMessageText').text(jsondata.messageArray)
          }else{
            timeGraphSet("class","pink","AddClass", jsondata);  //시간 테이블 채우기
            timeGraphSet("group","pink","AddClass", initialJSON);
            timeGraphSet("off","grey","AddClass", jsondata)
            timeGraphSet("class","pink","mini", jsondata);  //시간 테이블 채우기
            timeGraphSet("group","pink","mini", initialJSON);
            timeGraphSet("off","grey","mini", jsondata)
            if(use == "callback"){
              callback()
            }
          }
          
        },

        complete:function(){
          completeSend()
        },

        error:function(){
          $('#errorMessageBar').show()
          $('#errorMessageText').text('통신 에러: 관리자 문의')
        }
      }) 
}

function clear_start_dur_dropdown(){
  $('#starttimesSelected button').val('').text('').html("<span style='color:#cccccc;'>선택</span>").removeClass('dropdown_selected')
  $('#durationsSelected button').val('').text('').html("<span style='color:#cccccc;'>선택</span>").removeClass('dropdown_selected')
  $('#durations').html('')
}


function get_repeat_info(dbID){
    if(addTypeSelect == "repeatptadd" || addTypeSelect == "ptadd"){
      //var url_ = '/trainer/read_member_lecture_data_from_schedule/'
      var url_ = '/trainer/get_member_repeat_schedule/'
      var data_ = {"member_id": dbID}
      var fill_option = 'class'
      var type_ = 'GET'
    }else if(addTypeSelect == "groupptadd" || addTypeSelect == "repeatgroupptadd"){
      var url_ = '/trainer/get_group_repeat_schedule_list/'
      var data_ = {"group_id": dbID}
      var fill_option = 'group'
      var type_ = 'GET'
    }else if(addTypeSelect == "offadd" || addTypeSelect == "repeatoffadd"){
      var url_ = '/trainer/get_off_repeat_schedule/'
      var data_;
      var fill_option = 'off'
      var type_;
    }
    var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts(url_)
    $.ajax({
        url: url_,
        type: type_,
        data: data_,
        dataType : 'html',

        beforeSend:function(){
            beforeSend(); //ajax 로딩이미지 출력
        },

        success:function(data){
          console.log(data)
          TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
          var jsondata = JSON.parse(data);
          console.log('fill_repeat_info',jsondata)
          if(jsondata.messageArray.length>0){
              $('#errorMessageBar').show();
              $('#errorMessageText').text(jsondata.messageArray)
          }else{
            selectedMemberIdArray = jsondata.memberIdArray;
            selectedMemberAvailCountArray = jsondata.memberAvailCountArray;
            selectedMemberLectureIdArray = jsondata.memberLectureIdArray;
            selectedMemberNameArray = jsondata.memberNameArray
            fill_repeat_info(dbID, jsondata, fill_option);
          }
        },

        complete:function(){
          completeSend(); //ajax 로딩이미지 숨기기
        },

        error:function(){
          $('#errorMessageBar').show()
          $('#errorMessageText').text('통신 에러: 관리자 문의----')
        }
      })
}


$('#week').click(function(){
  get_member_repeat_id_in_group_repeat('809')
  console.log('test, test')
})


function get_member_repeat_id_in_group_repeat(group_repeat_id, use, callback){
    var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_group_member_repeat_schedule_list')
    $.ajax({
        url: '/trainer/get_group_member_repeat_schedule_list/',
        type : 'GET',
        data : {"group_repeat_schedule_id":group_repeat_id}, 
        dataType : 'html',

        beforeSend:function(){
          beforeSend()
        },

        success:function(data){
          TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
          var jsondata = JSON.parse(data);
          console.log(jsondata)
          if(jsondata.messageArray.length>0){
            $('#errorMessageBar').show()
            $('#errorMessageText').text(jsondata.messageArray)
          }else{
            if(use == "callback"){
              callback(jsondata)
            }
          }
        },

        complete:function(){
          completeSend()
        },

        error:function(){
          $('#errorMessageBar').show()
          $('#errorMessageText').text('통신 에러: 관리자 문의')
        }
      })
}

function fill_repeat_info(dbID, jsondata, option){ //반복일정 요약 채우기
  console.log('fill_repeat_info--add',jsondata)
    switch(option){
        case 'class':
          var len = jsondata.ptRepeatScheduleIdArray.length
          var dbId = dbID
          var repeat_id_array = jsondata.ptRepeatScheduleIdArray
          var repeat_type_array = jsondata.ptRepeatScheduleTypeArray
          var repeat_day_info_raw_array = jsondata.ptRepeatScheduleWeekInfoArray
          var repeat_start_array = jsondata.ptRepeatScheduleStartDateArray
          var repeat_end_array = jsondata.ptRepeatScheduleEndDateArray
          var repeat_time_array = jsondata.ptRepeatScheduleStartTimeArray
          var repeat_dur_array = jsondata.ptRepeatScheduleTimeDurationArray
          var repeat_group_name = jsondata.ptRepeatScheduleGroupNameArray
          var repeat_title = ""
        break;
        case 'off':
          var len = jsondata.offRepeatScheduleIdArray.length
          var dbId = ""
          var repeat_id_array = jsondata.offRepeatScheduleIdArray
          var repeat_type_array = jsondata.offRepeatScheduleTypeArray
          var repeat_day_info_raw_array = jsondata.offRepeatScheduleWeekInfoArray
          var repeat_start_array = jsondata.offRepeatScheduleStartDateArray
          var repeat_end_array = jsondata.offRepeatScheduleEndDateArray
          var repeat_time_array = jsondata.offRepeatScheduleStartTimeArray
          var repeat_dur_array = jsondata.offRepeatScheduleTimeDurationArray
          var repeat_group_name = []
          var repeat_title = ""
        break;
        case 'group':
          var len = jsondata.repeatScheduleIdArray.length
          var dbId = ""
          var repeat_id_array = jsondata.repeatScheduleIdArray
          var repeat_type_array = jsondata.repeatScheduleTypeArray
          var repeat_day_info_raw_array = jsondata.repeatScheduleWeekInfoArray
          var repeat_start_array = jsondata.repeatScheduleStartDateArray
          var repeat_end_array = jsondata.repeatScheduleEndDateArray
          var repeat_time_array = jsondata.repeatScheduleStartTimeArray
          var repeat_dur_array = jsondata.repeatScheduleTimeDurationArray
          var repeat_group_name = []
          var repeat_title = "[그룹]"
        break;
    }
    var repeat_info_dict= { 'KOR':
                            {'DD':'매일', 'WW':'매주', '2W':'격주',
                             'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일'},
                            'JAP':
                            {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                             'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日'},
                            'JAP':
                            {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                             'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat'}
                           }
    var schedulesHTML = []
    for(var i=0; i<len; i++){
      if(repeat_group_name[i] != 0 && option != "off"){
        var repeat_title = "[그룹]"
      }

      var repeat_id = repeat_id_array[i]
      var repeat_type = repeat_info_dict['KOR'][repeat_type_array[i]]
      var repeat_start = repeat_start_array[i].replace(/-/gi,".");
      var repeat_end_text_small = "<span class='summaryInnerBoxText_Repeatendtext_small'>~</span>"
      var repeat_end_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복종료 : </span>"
      var repeat_end = repeat_end_array[i].replace(/-/gi,".");
      var repeat_time = Number(repeat_time_array[i].split(':')[0]) // 06 or 18
      var repeat_min = Number(repeat_time_array[i].split(':')[1])  // 00 or 30
      if(repeat_min == "30"){
        var repeat_time = Number(repeat_time_array[i].split(':')[0])+0.5
      }
      var repeat_dur = Number(repeat_dur_array[i])/(60/Options.classDur)
      var repeat_sum = Number(repeat_time) + Number(repeat_dur)

      var repeat_end_time_hour = parseInt(repeat_sum)
      if(parseInt(repeat_sum)<10){
        var repeat_end_time_hour = '0'+parseInt(repeat_sum)
      }
      if((repeat_sum%parseInt(repeat_sum))*60 == 0){
        var repeat_end_time_min = '00'
      }else if((repeat_sum%parseInt(repeat_sum))*60 == 30){
        var repeat_end_time_min = '30'
      }
    
      var repeat_start_time = repeat_time_array[i].split(':')[0] +':'+ repeat_time_array[i].split(':')[1]
      var repeat_end_time = repeat_end_time_hour + ':' + repeat_end_time_min

      


      var repeat_day =  function(){
                          var repeat_day_info_raw = repeat_day_info_raw_array[i].split('/')
                          var repeat_day_info = ""
                          if(repeat_day_info_raw.length>1){
                              for(var j=0; j<repeat_day_info_raw.length; j++){
                                  var repeat_day_info = repeat_day_info + '/' + repeat_info_dict['KOR'][repeat_day_info_raw[j]].substr(0,1)
                              }
                          }else if(repeat_day_info_raw.length == 1){
                              var repeat_day_info = repeat_info_dict['KOR'][repeat_day_info_raw[0]]
                          }
                          if(repeat_day_info.substr(0,1) == '/'){
                              var repeat_day_info = repeat_day_info.substr(1,repeat_day_info.length)
                          }
                            return repeat_day_info
                        };

      var summaryInnerBoxText_1 = '<span class="summaryInnerBoxText">'+'<span style="color:#fe4e65;">'+repeat_title+'</span>'+repeat_type +' '+repeat_day() +' '+repeat_start_time+' ~ '+repeat_end_time+' ('+repeat_dur +'시간)</span>'
      var summaryInnerBoxText_2 = '<span class="summaryInnerBoxText2">'+repeat_end_text+repeat_end_text_small+repeat_end+'</span>'
      var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin" data-dbid="'+dbId+'" data-deletetype="'+option+'" data-repeatid="'+repeat_id+'"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>'
      schedulesHTML[i] = '<div class="summaryInnerBox" data-id="'+repeat_id+'">'+summaryInnerBoxText_1+summaryInnerBoxText_2+deleteButton+'</div>'
    }

    var summaryText = '<span id="summaryText">일정요약</span>'
    if(schedulesHTML.length>0){
      $('#offRepeatSummary').html(summaryText + schedulesHTML.join('')).show()
    }else{
      $('#offRepeatSummary').hide()
    }
}


function popup_repeat_confirm(){ //반복일정을 서버로 보내기 전 확인 팝업을 보여준다.
    var repeat_info_dict= { 'KOR':
                          {'DD':'매일', 'WW':'매주', '2W':'격주',
                           'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일'},
                          'JAP':
                          {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                           'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日'},
                          'JAP':
                          {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                           'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat'}
                         }
    $('#cal_popup_repeatconfirm').fadeIn('fast')
    shade_index(200)
    if(addTypeSelect == "repeatoffadd"){
      var $id_repeat_freq = $('#id_repeat_freq_off')
      var $id_repeat_start_date = $('#id_repeat_start_date_off')
      var $id_repeat_end_date = $('#id_repeat_end_date_off')
      var $id_repeat_day = $('#id_repeat_day_off')
    }else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
      var $id_repeat_freq = $('#id_repeat_freq')
      var $id_repeat_start_date= $('#id_repeat_start_date')
      var $id_repeat_end_date = $('#id_repeat_end_date')
      var $id_repeat_day = $('#id_repeat_day')
    }

    var repeat_type = repeat_info_dict['KOR'][$id_repeat_freq.val()]
    var repeat_start = $id_repeat_start_date.val().replace(/-/gi,'.')
    var repeat_end = $id_repeat_end_date.val().replace(/-/gi,'.')
    var repeat_day = function(){
                        var repeat_day_info_raw = $id_repeat_day.val().split('/')
                        var repeat_day_info = ""
                        if(repeat_day_info_raw.length>1){
                          for(var j=0; j<repeat_day_info_raw.length; j++){
                              var repeat_day_info = repeat_day_info + ',' + repeat_info_dict['KOR'][repeat_day_info_raw[j]]
                          }
                        }else if(repeat_day_info_raw.length == 1){
                          var repeat_day_info = repeat_info_dict['KOR'][repeat_day_info_raw[0]]
                        }
                        if(repeat_day_info.substr(0,1) == ','){
                          var repeat_day_info = repeat_day_info.substr(1,repeat_day_info.length)
                        }
                        return repeat_day_info
                    };
    var repeat_input_day_info = repeat_type + ' ' + repeat_day()
    var repeat_input_dur_info = repeat_start + ' ~ ' + repeat_end
    return {
            day_info : repeat_input_day_info,
            dur_info : repeat_input_dur_info
          }
}


function scheduleTime(option, jsondata){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
  $('.blankSelected_addview').removeClass('blankSelected blankSelected30')
  switch(option){
    case 'class':
      var plan = option
      var planStartDate = jsondata.classTimeArray_start_date;
      var planGroupStartDate = jsondata.group_schedule_start_datetime;
      var planEndDate = jsondata.classTimeArray_end_date;
      var planMemberName = jsondata.classTimeArray_member_name;
      var planMemberDbid = jsondata.classTimeArray_member_id;
      var planScheduleIdArray = jsondata.scheduleIdArray;
      var planNoteArray = jsondata.scheduleNoteArray;
      var planScheduleFinishArray = jsondata.scheduleFinishArray;
      var planColor = 'classTime'
      var planfinished = ' classTime_checked'
      var planMemberNum = ''
      var planGroupid = ''
      var planCode = ''
    break;
    case 'off':
      var plan = option;
      var planGroupid = ''
      var planStartDate = jsondata.offTimeArray_start_date;
      var planGroupStartDate = jsondata.group_schedule_start_datetime;
      var planEndDate = jsondata.offTimeArray_end_date;
      var planScheduleIdArray = jsondata.offScheduleIdArray;
      var planScheduleFinishArray = ''
      var planNoteArray = jsondata.offScheduleNoteArray;
      var planColor = 'offTime'
      var planMemberNum = ''
      var planMemberDbid = ''
      var planCode = ''
    break;
    case 'group':

      var plan = option
      var planStartDate = jsondata.group_schedule_start_datetime;
      var planGroupStartDate = jsondata.group_schedule_start_datetime;
      var planEndDate = jsondata.group_schedule_end_datetime;
      var planMemberName = jsondata.group_schedule_group_name;
      var planGroupid = jsondata.group_schedule_group_id;
      var planScheduleIdArray = jsondata.group_schedule_id;
      var planNoteArray = jsondata.group_schedule_note;
      var planScheduleFinishArray = jsondata.group_schedule_finish_check;
      var planColor = 'groupTime'
      var planfinished = ' groupTime_checked'
      var planMemberNum = jsondata.group_schedule_max_member_num;
      var planMemberDbid = ''
      var planCode = ''
    break;
  }

  //2018_4_22_8_30_2_OFF_10_30 

  var planheight = 60;
    if($calendarWidth>=600){
      var planheight = 60;
  }
  var len = planScheduleIdArray.length;
  for(var i=0; i<len; i++){
    //2018-05-11 10:00:00
    var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0])
    var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1])
    var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2])
    var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0])
    var planMinute  = planStartDate[i].split(' ')[1].split(':')[1]
    var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]) 
    var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0])
    var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1]
    if(plan == 'off'){
      var memberName = 'OFF'
    }else{
      var memberName  = planMemberName[i]
    }
    

    if(Math.abs(Number(planEndMin) - Number(planMinute)) == 30){  //  01:30 ~ 02:00  01:00 ~ 01:30,,,, 01:00 ~ 05:30, 01:30 ~ 05:00 
        if(planEndHour-planHour == 0){
          var planDura = "0.5"
        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == -30 ){
          var planDura = String((planEndHour-planHour-1))+'.5'
        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == 30){
          var planDura = String((planEndHour-planHour))+'.5'
        }
    }else{
      var planDura = planEndHour - planHour;
    }
    
    //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
    if(planEDate == planDate+1 && planEndHour==planHour){
      var planDura = 24
    }else if(planEDate == planDate+1 && planEndHour == 0){
      var planDura = 24-planHour
    }else if(planDate == lastDay[planMonth-1] && planEDate == 1 && planEndHour == 0){ //달넘어갈때 -23시 표기되던 문제
      var planDura = 24-planHour
    }

    if(planMinute == '00'){
      if(Options.workStartTime>planHour && planDura > Options.workStartTime - planHour){
        
        var planDura = planDura - (Options.workStartTime - planHour) // 2 - (10 - 8)
        var planHour = Options.workStartTime
         //2018_4_22_8_30_2_OFF_10_30 
      }
    }else if(planMinute == '30'){
        //(10>8)  (2>=10-8)
      if(Options.workStartTime>planHour && planDura >= Options.workStartTime - planHour){
        
        var planDura = planDura - (Options.workStartTime - planHour)+0.5 // 2 - (10 - 8)
        var planHour = Options.workStartTime
        var planMinute = '00'
         //2018_4_22_8_30_2_OFF_10_30 
      }
    }
    if(planHour < 12){
      var hourType = '오전'
    }else{
      if(planHour == 24){
        var hourType = '오전'
      }else{
        var hourType = '오후'
      }
    }

    var planArray = [planYear, planMonth, planDate, planHour, planMinute, planDura, memberName, planEndHour, planEndMin]
    var planStartArr = [planYear, planMonth, planDate, planHour, planMinute]
    var planStart = planStartArr.join("_")
    var tdPlanStart = $("#"+planStart+" div");
    var tdPlan = $("#"+planStart);
    tdPlan.parent('div').siblings('.fake_for_blankpage').css('display','none')

    if(option != 'off'){
      if(planScheduleFinishArray[i] == 1){
        var planColor_ = planColor+planfinished
      }else{
        var planColor_ = planColor
      }
    }else{
      var planColor_ = planColor
    }

    if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){
      var textcolor = "bluetext"
    }else{
      var textcolor = ""
    }



    if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
       tdPlanStart.attr(option + '-time' , planArray.join('_')) //planArray 2018_5_25_10_00_1_스노우_11_00
              .attr(option+'-schedule-id' , planScheduleIdArray[i])
              .attr({'data-starttime':planStartDate[i], 'data-groupid':planGroupid[i],'data-membernum':planMemberNum[i], 'data-memo' : planNoteArray[i], 
                    'data-schedule-check' : planScheduleFinishArray[i], 'data-lectureId' : jsondata.classArray_lecture_id[i], 'data-dbid' : planMemberDbid[i], 'data-memberName' : memberName, })
              .addClass(planColor_)
              .css({'height':Number(planDura*planheight-1)+'px'})
              .html('<span class="memberName">'+planCode+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>');    
    }else if(option == 'group'){
       tdPlanStart.attr(option + '-time' , planArray.join('_')) //planArray 2018_5_25_10_00_1_스노우_11_00
              .attr(option+'-schedule-id' , planScheduleIdArray[i])
              .attr({'data-starttime':planStartDate[i], 'data-groupid':planGroupid[i],'data-membernum':planMemberNum[i],'data-memo' : planNoteArray[i],
                    'data-schedule-check' : planScheduleFinishArray[i], 'data-lectureId' : jsondata.classArray_lecture_id[i], 'data-dbid' : planMemberDbid[i], 'data-memberName' : memberName, })
              .addClass(planColor_)
              .css({'height':Number(planDura*planheight-1)+'px'})
              .html('<span class="memberName">'+'<p class="groupnametag">'+planCode+memberName+'</p>'+'<span class="groupnumstatus '+textcolor+'">('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span>'+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>');    
    }else if(option == 'off'){
       tdPlanStart.attr(option + '-time' , planArray.join('_')) //planArray 2018_5_25_10_00_1_스노우_11_00
              .attr(option+'-schedule-id' , planScheduleIdArray[i])
              .attr({'data-starttime':planStartDate[i], 'data-groupid':planGroupid[i],'data-membernum':planMemberNum[i],'data-memo' : planNoteArray[i],
                    'data-schedule-check' : planScheduleFinishArray[i], 'data-lectureId' : jsondata.classArray_lecture_id[i], 'data-dbid' : planMemberDbid[i], 'data-memberName' : memberName, })
              .addClass(planColor_)
              .css({'height':Number(planDura*planheight-1)+'px'})
              .html('<span class="memberName">'+planCode+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>');    
    }
   

    var hhh = Number(planHour)
    var mmm = planMinute

    for(var j=0; j<planDura/0.5; j++){
      if(mmm == 60){
        hhh = hhh + 1
        mmm = '00'
      }
      $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm).addClass('_on')
      mmm = Number(mmm) + 30
    }

  };
};



function beforeSend(){
  // $('html').css("cursor","wait");
  $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
  $('.ajaxloadingPC').show();
}

function completeSend(){
  //$('html').css("cursor","auto");
  $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
  $('.ajaxloadingPC').hide();
}

function closeAddPopup(){
  //$('body').css('overflow-y','overlay');
  $('#page-addplan').hide('fast','swing');
  $('#float_btn_wrap').fadeIn();
  $('#float_btn').removeClass('rotate_btn');
  $('#page-base').show();
  $('#page-base-addstyle').hide();
}

function closeAddPopup_mini(){
  $('#page-addplan-pc').fadeOut();
  clear_pt_off_add_popup_mini()
}

function clear_pt_off_add_popup_mini(){
  //핑크 버튼 활성화 초기화
  $('#submitBtn_mini').css('background','#282828')

  //진행시간 선택 핑크 하단선 초기화
  $('#classDuration_mini #durationsSelected button').removeClass('dropdown_selected').html("<span style='color:#cccccc;'>선택</span>").val("");

  //회원 선택 핑크 하단선 초기화
  $("#membersSelected button, #membersSelected_mini button").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>회원/그룹 선택</span><img src='/static/user/res/ajax/loading.gif' alt='' class='ajaxloading_dropdown'>").val("");

  //예약가능 횟수 내용 초기화
  $("#countsSelected,.countsSelected").text("")
  $('#remainCount_mini, #groupInfo_mini').hide()

  //메모 초기화
  $('#addmemo_mini input').val('').text('')

  $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder')
  select_all_check=false;
}

function startTimeArraySet(option){ //offAddOkArray 채우기 : 시작시간 리스트 채우기
  switch(option){
    case "class" :
    var option = ""
    break;
    case "mini" :
    var option = "_mini"
    break;
  }
  offAddOkArray = []
  if(Options.classDur == 60){
    for(i=Options.workStartTime;i<Options.workEndTime;i++){
      // 1시간 단위일때도 시작일자 리스트는 30분단위로 세밀하게 보여주기
      /*
      if(!$('#'+i+'g_00'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_00'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph_greyleft') == true){
        if($('#'+i+'g_30'+option).hasClass('pinktimegraph') == true || $('#'+i+'g_30'+option).hasClass('greytimegraph') == true || $('#'+i+'g_30'+option).hasClass('pinktimegraph_pinkleft') == true || $('#'+i+'g_30'+option).hasClass('greytimegraph_greyleft') == true){

        }else{
          offAddOkArray.push(i);
        }
        
      }else if(!$('#'+i+'g_30'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_30'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph_greyleft') == true){
        if($('#'+(i+1)+'g_00'+option).hasClass('pinktimegraph') == true || $('#'+(i+1)+'g_00'+option).hasClass('greytimegraph') == true || $('#'+(i+1)+'g_00'+option).hasClass('pinktimegraph_pinkleft') == true || $('#'+(i+1)+'g_00'+option).hasClass('greytimegraph_greyleft') == true){
          //
        }else{
          offAddOkArray.push(i+0.5)  
        }
      }
      */

      if(!$('#'+i+'g_00'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_00'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph_greyleft') == true){
        if($('#'+i+'g_30'+option).hasClass('pinktimegraph') == true || $('#'+i+'g_30'+option).hasClass('greytimegraph') == true || $('#'+i+'g_30'+option).hasClass('pinktimegraph_pinkleft') == true || $('#'+i+'g_30'+option).hasClass('greytimegraph_greyleft') == true){

        }else{
          offAddOkArray.push(i);
        }
        
      }
      if(!$('#'+i+'g_30'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_30'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph_greyleft') == true){
        if(i != (Options.workEndTime)-1 && (!$('#'+(i+1)+'g_00'+option).hasClass('pinktimegraph') == true && !$('#'+(i+1)+'g_00'+option).hasClass('greytimegraph') == true && !$('#'+(i+1)+'g_00'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+(i+1)+'g_00'+option).hasClass('greytimegraph_greyleft') == true)){
          offAddOkArray.push(i+0.5)  
        }else{
          
        }
      }
      

      /*
      if(!$('#'+i+'g_00'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_00'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph_greyleft') == true &&
        !$('#'+i+'g_30'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_30'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph_greyleft') == true){
        offAddOkArray.push(i);
      }
      */

    }
  }else if(Options.classDur == 30){
    for(i=Options.workStartTime;i<Options.workEndTime;i++){
      if(!$('#'+i+'g_00'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_00'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_00'+option).hasClass('greytimegraph_greyleft') == true){
        offAddOkArray.push(i);
      }
      if(!$('#'+i+'g_30'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph') == true && !$('#'+i+'g_30'+option).hasClass('pinktimegraph_pinkleft') == true && !$('#'+i+'g_30'+option).hasClass('greytimegraph_greyleft') == true){
        offAddOkArray.push(i+0.5)
      }
    }
  }
}


function startTimeSet(option){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21]
  startTimeArraySet(option); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
  switch(option){
    case "class":
      var options = ""
    break;
    case "mini":
      var options = "_mini"
    break;
  }
  if(Options.language == "KOR"){
    var text1 = '오전 '
    var text2 = '오후 '
    var text3 = '시'
  }else if(Options.language == "JPN"){
    var text1 = '午前 '
    var text2 = '午後 '
    var text3 = '時'
  }else if(Options.language == "ENG"){
    var text1 = 'AM '
    var text2 = 'PM '
    var text3 = ':00'
  }

  //offAddOkArray =  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12.5, 13, 14, 18.5, 20, 21, 22, 23]
  var offOkLen = offAddOkArray.length
  var startTimeList = $('#starttimes'+options);
  var timeArray = [];
  for(var i=0; i<offOkLen; i++){
    var offHour = parseInt(offAddOkArray[i]); 
    var offmin = (offAddOkArray[i]%parseInt(offAddOkArray[i]))*60 // 0 or 30
    if(offmin == 0 || isNaN(offmin) == true){ //isNaN은 0시 일때 0%0이 NaN으로 나오기 때문에.
      var offmin = "00"
    }
    if(offAddOkArray[i]== 0.5){
      var offmin = "30"
    }
    if(offHour<12){
      var offText = text1 //오전
      var offHours = offHour;
    }else if(offHour==24){
      var offText = text1
      var offHours = offHour-12
    }else if(offHour==12 || offHour==12.5){
      var offText = text2 //오후
      var offHours = offHour
    }else{
      var offHours = offHour-12
      var offText = text2
    }

    if(offHour.length<2){
      timeArray[i] ='<li><a data-trainingtime="'+'0'+offHour+':'+offmin+':00.000000" class="pointerList">'+offText+offHours+':'+offmin+'</a></li>' //text3 = :00
    }else{
      timeArray[i] ='<li><a data-trainingtime="'+offHour+':'+offmin+':00.000000" class="pointerList">'+offText+offHours+':'+offmin+'</a></li>'
    }
  }
  timeArray[offOkLen]='<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>'
  var timeArraySum = timeArray.join('')
  startTimeList.html(timeArraySum)
}


function timeGraphSet(option, CSStheme, Page, jsondata){ //가능 시간 그래프 채우기
  //1. option인자 : "class", "off"
  //2. CSS테마인자 : "grey", "pink"
  switch(option){
    case "class" :
      var planStartDate = jsondata.classTimeArray_start_date
      var planEndDate = jsondata.classTimeArray_end_date
      var planMemberName = jsondata.classTimeArray_member_name
      var planScheduleIdArray = jsondata.scheduleIdArray
      var planNoteArray = jsondata.scheduleNoteArray
      //$('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
    break;
    case "group" :
      var planStartDate = jsondata.group_schedule_start_datetime
      var planEndDate = jsondata.group_schedule_end_datetime
      var planMemberName = jsondata.group_schedule_group_name
      var planScheduleIdArray = jsondata.group_schedule_id
      var planNoteArray = jsondata.group_schedule_note
      //$('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
    break;
    case "off" :
      var planStartDate = jsondata.offTimeArray_start_date
      var planEndDate = jsondata.offTimeArray_end_date
      var planScheduleIdArray = jsondata.offScheduleIdArray
      var planNoteArray = jsondata.offScheduleNoteArray
    break;
  }

  switch(CSStheme){
    case "grey" :
      var cssClass = "greytimegraph"
      var cssClass_border = "greytimegraph_greyleft"
    break;
    case "pink" :
      var cssClass= "pinktimegraph"
      var cssClass_border= "pinktimegraph_pinkleft"
    break;
  }

  switch(Page){
    case "mini" :
      var datepicker = $('#datetext_mini')
      var option = "_mini"
    break;
    case "AddClass" :
      var datepicker = $("#datepicker")
      var option = "" 
    break;
  }


  var date = datepicker.val();
  var Arraylength = planScheduleIdArray.length;
  for(var i=0;i<Arraylength;i++){
    var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0])
    var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1])
    var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2])
    var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0])
    var planMinute  = planStartDate[i].split(' ')[1].split(':')[1]
    var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]) 
    var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0])
    var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1]
    if(planHour == 24){
      var planHour = 0
    }
    if(Math.abs(Number(planEndMin) - Number(planMinute)) == 30){  //  01:30 ~ 02:00  01:00 ~ 01:30,,,, 01:00 ~ 05:30, 01:30 ~ 05:00 
        if(planEndHour-planHour == 0){
          var planDura = "0.5"
        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == -30 ){
          var planDura = String((planEndHour-planHour-1))+'.5'
        }else if(planEndHour > planHour && Number(planEndMin)-Number(planMinute) == 30){
          var planDura = String((planEndHour-planHour))+'.5'
        }
    }else{
      var planDura = planEndHour - planHour;
    }
    
    //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
    if(planEDate == planDate+1 && planEndHour==planHour){
      var planDura = 24
    }else if(planEDate == planDate+1 && planEndHour == 0){
      var planDura = 24-planHour
    }else if(planDate == lastDay[planMonth-1] && planEDate == 1 && planEndHour == 0){ //달넘어갈때 -23시 표기되던 문제
      var planDura = 24-planHour
    }

    if(planMinute == '00'){
      if(Options.workStartTime>planHour && planDura > Options.workStartTime - planHour){
        
        var planDura = planDura - (Options.workStartTime - planHour) // 2 - (10 - 8)
        var planHour = Options.workStartTime
         //2018_4_22_8_30_2_OFF_10_30 
      }
    }else if(planMinute == '30'){
        //(10>8)  (2>=10-8)
      if(Options.workStartTime>planHour && planDura >= Options.workStartTime - planHour){
        
        var planDura = planDura - (Options.workStartTime - planHour)+0.5 // 2 - (10 - 8)
        var planHour = Options.workStartTime
        var planMinute = '00'
         //2018_4_22_8_30_2_OFF_10_30 
      }
    }
    //if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime>=1 && durTime.indexOf('.')==-1){  //수업시간이 1시간 단위 일때 칸 채우기
        /*
        for(var j=0; j<durTime; j++){
          var time = Number(planHour)+j
          if(j == 0){
            $('#'+(time)+'g_00'+option).addClass(cssClass)
            $('#'+(time)+'g_30'+option).addClass(cssClass_border)
          }else{
            $('#'+(time)+'g_00'+option + ',#'+(time)+'g_30'+option).addClass(cssClass_border)
          }
        }
        */
    //}else if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime>0 && durTime.indexOf('.')){ //수업시간이 0.5 단위일때
      if(date_format_yyyy_m_d_to_yyyy_mm_dd(planYear+'-'+planMonth+'-'+planDate,'-') == date && planDura>0){ //수업시간이 0.5 단위일때
        var length = parseInt(planDura)
        if(length == 0){
          var length = 1;
        }
        //for(var j=0; j<length; j++){  // 1_30_1.5
        var time = Number(planHour)
        var min = planMinute
        for(k=0; k<planDura/0.5; k++){
              if(min == 60){
              var min = '00'
              var time = time +1
            }
            if(k==0){
              $('#'+(time)+'g_'+min+option).addClass(cssClass)
            }else{
              $('#'+(time)+'g_'+min+option).addClass(cssClass_border)
            }
            
            min = Number(min)+30
        }      
    }
  }
  

  /*업무시간 설정 수업시간 30분 단위일때*/
  if(Options.hourunit == 30){
    for(var j=0; j<Options.workStartTime; j++){
      $('#'+j+'g_00'+option).addClass('greytimegraph')
      $('#'+j+'g_30'+option).addClass('greytimegraph')
    }


    for(var t=Options.workEndTime; t<24; t++){
      $('#'+t+'g_00'+option).addClass('greytimegraph')
      $('#'+t+'g_30'+option).addClass('greytimegraph')
    }  
  }else{
    /*업무시간 설정*/
    for(var j=0; j<Options.workStartTime; j++){
      $('#'+j+'g'+option).addClass('greytimegraph')
    }
    for(var t=Options.workEndTime; t<24; t++){
      $('#'+t+'g'+option).addClass('greytimegraph')
    }
    /*업무시간 설정*/
  }
  
  /*업무시간 설정*/

  //timeGraphLimitSet(Options.limit)
}

function durTimeSet(selectedTime,selectedMin,option){ // durAddOkArray 채우기 : 진행 시간 리스트 채우기
  switch(option){
    case "class" :
    var durTimeList = $('#durations')
    var options = ""
    break;
    case "off" :
    var durTimeList = $('#durations_off')
    var options = ""
    break;
    case "mini" :
    var durTimeList = $('#durations_mini')
    var options = "_mini"
    break;
  }
 
  var len = offAddOkArray.length;
  var index = offAddOkArray.indexOf(Number(selectedTime)+Number(selectedMin)/60);
  var substr = offAddOkArray[index+1]-offAddOkArray[index];
  var classDur = Options.classDur/60

  durTimeList.html('')

  var t=1
  var tt= 0.5
  Loop1: for(var i=selectedTime; i<Options.workEndTime; i++){  //9:30 [10:30] 11_00(grey)   9:00 9:30 10:00
      if(Options.classDur == 60){
          if( i!=selectedTime && ($('#'+i+'g_00'+options).hasClass('greytimegraph') || $('#'+i+'g_30'+options).hasClass('greytimegraph') || $('#'+i+'g_00'+options).hasClass('pinktimegraph') || $('#'+i+'g_30'+options).hasClass('pinktimegraph'))){
              //console.log('#'+i+'g_00'+options,' | ','#'+i+'g_30'+options,' | ','#'+i+'g_00'+options,' | ','#'+i+'g_30'+options)
              break Loop1;
          }else{
              var mins = Number(selectedMin)+30
              var Num = Number(i)
              if(mins == 0 || mins == "60"){
                var mins = "00"
                var Num = (Number(i)+1)
              }

              
              // 더 상세하게 설정. 8:00, 8:30, 9:00, 9:30  1시간 단위일때도 30분단위로 리스트 채워주기
              if($('#'+Num+'g_'+(mins)+options).hasClass('greytimegraph')  || $('#'+Num+'g_'+(mins)+options).hasClass('pinktimegraph')){
                break;
              }else{
                if((Number(i)+1) == Options.workEndTime && selectedMin== '30'){
                    break;
                }else{
                  durTimeList.append('<li><a data-dur="'+(t)*2+'" class="pointerList">'+(t)+'시간  (~ '+(Number(i)+1)+':'+selectedMin+')'+'</a></li>')
                }
                
              }
              
              
              /*
              if($('#'+Num+'g_'+'00'+options).hasClass('greytimegraph')  || $('#'+Num+'g_'+'00'+options).hasClass('pinktimegraph')   ){
                break;
              }else{
                durTimeList.append('<li><a data-dur="'+(t)*2+'" class="pointerList">'+(t)+'시간  (~ '+(Number(i)+1)+':00'+')'+'</a></li>')
              }
              */
              t++
          }
      }else if(Options.classDur == 30){  // 0 30  // 30 0 
          if(selectedMin == "00"){
            for(var z=1; z<=2; z++){
              var nums = Number(i)
              var mins = 30*z // 30 60
              if(mins == 60){
                var mins = "00"
                var nums = Number(i)+1
              }
              var $nextTime = $('#'+nums+'g_'+mins+options)
              if($nextTime.hasClass('greytimegraph') || $nextTime.hasClass('pinktimegraph')){
                durTimeList.append('<li><a data-dur="'+(tt)*2+'" class="pointerList">'+(tt)+'시간  (~ '+nums+':'+mins+')'+'</a></li>')
                break Loop1;
              }else{
                durTimeList.append('<li><a data-dur="'+(tt)*2+'" class="pointerList">'+(tt)+'시간  (~ '+nums+':'+mins+')'+'</a></li>')
              }

              tt = tt+0.5
            }
          }else if(selectedMin == "30"){
            for(var z=2; z>=1; z--){
              var mins = 30*z  //60 30
              if(mins == 60){
                var mins = "00"
              }
              var $nextTime = $('#'+(Number(i)+1)+'g_'+mins+options)
              if($nextTime.hasClass('greytimegraph') || $nextTime.hasClass('pinktimegraph')){
                durTimeList.append('<li><a data-dur="'+(tt)*2+'" class="pointerList">'+(tt)+'시간  (~ '+(Number(i)+1)+':'+mins+')'+'</a></li>')
                break Loop1;
              }else{
                if(Options.workEndTime == (Number(i)+1) && mins == "30"){

                }else{
                  durTimeList.append('<li><a data-dur="'+(tt)*2+'" class="pointerList">'+(tt)+'시간  (~ '+(Number(i)+1)+':'+mins+')'+'</a></li>')
                }
              }
              tt = tt+0.5
            }
          }   
      }
  }
  durTimeList.append('<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>')    
}

function send_Data(serializeArray){
    if($('#calendar').hasClass('_calmonth')){
      var yyyy = $('#yearText').text().replace(/년/gi,"")
      var mm = $('#monthText').text().replace(/월/gi,"")
      if(mm.length<2){
        var mm = '0' + mm
      }
      var today_form = yyyy+'-'+ mm +'-'+"01"
    }else if($('#calendar').hasClass('_calweek')){
      var $weekNum4 = $('#weekNum_4').attr('data-date')
      var today_form = $weekNum4.substr(0,4)+'-'+$weekNum4.substr(4,2)+'-'+$weekNum4.substr(6,2)
    }
    serializeArray.push({"name":"date", "value":today_form})
    serializeArray.push({"name":"day", "value":46})
    var sendData = serializeArray
    return sendData
}



function addGraphIndicator(datadur){
  $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
  var starttext = $('#starttimesSelected button').val().split(' ');  //오후 11:30
  var daymorning = starttext[0];
  var starthour = starttext[1].split(':')[0]
  var startmin = starttext[1].split(':')[1]
  if(startmin == "30"){
    var start = Number(starthour)+0.5
  }else if(startmin == "00"){
    var start = Number(starthour)
  }

  if(daymorning=='오후'||daymorning=='午後'||daymorning=='PM'){
    if(starthour==12){
      var starthour = starthour
    }else{
      var starthour = Number(starthour)+12  
    }
  }else if((daymorning=='오전'||daymorning=='午前'||daymorning=='AM' )&& starthour==12){
      var starthour = Number(starthour)+12 
  }

  var min = startmin
  var time = Number(starthour)
  if(Options.classDur == 30){
    for(var i=0; i<datadur; i++){
      if(min == 60){
        var min = '00'
        var time = time +1
      }
      if(i==starthour){
        $('#'+time+'g_'+min).addClass('graphindicator_leftborder')
      }else{
        $('#'+time+'g_'+min).addClass('graphindicator_leftborder')
      }
      min = Number(min)+30
    }
  }else if(Options.classDur == 60){
    for(var i=0; i<datadur; i++){
      if(min == 60){
        var min = '00'
        var time = time +1
      }
      if(i==starthour){
        $('#'+time+'g_'+min).addClass('graphindicator_leftborder')
      }else{
        $('#'+time+'g_'+min).addClass('graphindicator_leftborder')
      }
      min = Number(min)+30
    }
  }

}

function timeGraphLimitSet(limit){ //현재시간 이전시간, 강사가 설정한 근접 예약 불가 시간 설정
  var selecteddate = datepicker.val();
  var date = new Date();
  var yy = date.getFullYear();
  var mm = String(date.getMonth()+1);
  if(mm.length<2){
    var mm = '0'+mm
  }
  var dd = String(date.getDate());
  if(dd.length<2){
    var dd = '0'+dd
  }
  var hh = date.getHours();
  var today = yy+'-'+mm+'-'+dd
  if(selecteddate==today){
    for(var i=0;i<=23;i++){
      var time = $('#'+i+'g')
      if(i<=hh+limit){
        time.addClass('greytimegraph')
      }
    }
  }
}

function scrollToIndicator(dom){
  var offset = dom.offset();
    $('body, html').animate({scrollTop : offset.top-180},700)
}




function send_push(push_server_id, intance_id,title, message, badge_counter){

    $.ajax({
      url: 'https://fcm.googleapis.com/fcm/send',
      type : 'POST',
      contentType : 'application/json',
      dataType: 'json',
       headers : {
            Authorization : 'key=' + push_server_id
        },
        data: JSON.stringify({
            "to": intance_id,
            "notification": {
                "title":title,
                "body":message,
                "badge": badge_counter,
                "sound": "default"
            }
        }),

      beforeSend:function(){

      },

      success:function(response){
          console.log(response);
      },

      complete:function(){

      },

      error:function(){
        console.log(push_server_id)
        console.log(intance_id)
        console.log('server error')
      }
    })
}



//그룹..

$(document).on('click','img.add_groupmember_plan',function(){
    $('#form_add_member_group_plan_scheduleid').val($(this).attr('group-schedule-id'))
    $('#form_add_member_group_plan_groupid').val($(this).attr('data-groupid')) 
    $('#form_add_member_group_plan_max').val($(this).attr('data-membernum')) 
    $('#subpopup_addByList_plan').show()
    get_current_member_list('callback',function(jsondata){draw_groupParticipantsList_to_add(jsondata, $('#subpopup_addByList_whole'))})//전체회원 조회
    get_groupmember_list($(this).attr('data-groupid'), 'callback', function(jsondata){draw_groupParticipantsList_to_add(jsondata, $('#subpopup_addByList_thisgroup'))})//특정그룹회원 목록 조회
})

$(document).on('click','#subpopup_addByList_plan .listTitle_addByList span',function(){
    $('#subpopup_addByList_plan').hide()
})


//그룹 일정에 속한 회원목록을 받아온다.
function get_group_plan_participants(group_schedule_id, callbackoption , callback){
    var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_group_member_schedule_list')
    $.ajax({
        url: '/trainer/get_group_member_schedule_list/',
        type : 'GET',
        dataType: 'html',
        data: {"group_schedule_id": group_schedule_id},

        beforeSend:function(){
          beforeSend();
        },

        success:function(data){
            TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER);
            var jsondata = JSON.parse(data);
            console.log('get_group_plan_participants',jsondata)
            if(callbackoption == "callback"){
              callback(jsondata)
            }
        },

        complete:function(){
          //completeSend()
        },

        error:function(){
          console.log('server error')
        }
      })
}
//그룹 일정에 속한 회원목록을 받아온다.

//그룹에 일정에 속한 회원목록을 그린다. get_group_plan_participants와 같이 쓴다.
function draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id ,max){
    console.log('draw_groupParticipantsList_to_popup',jsondata)
    var target = $('#groupParticipants')
    var htmlToJoin = []
    for(var i=0; i<jsondata.db_id.length; i++){
      var htmlstart = '<div class="groupParticipantsRow" data-dbid="'+jsondata.db_id[i]+'" schedule-id="'+jsondata.scheduleIdArray[i]+'" data-leid="'+jsondata.classArray_lecture_id[i]+'">'
      //var sex = '<img src="/static/user/res/member/icon-sex-'+jsondata.sex[i]+'.png">'
      var finishcheck = jsondata.scheduleFinishArray[i]
      if(finishcheck == 1){
        var finish = '(완료)'
      }else if(finishcheck == 0){
        var finish = ''
      }
      var sex = '<img src="/static/user/res/member/icon-sex-'+jsondata.sexArray[i]+'.png">'
      var name = '<span data-dbid="'+jsondata.db_id[i]+'">'+jsondata.name[i]+finish+'</span>'
      var xbutton = '<img src="/static/user/res/member/icon-x-red.png" class="group_member_cancel" group-schedule-id="'+group_schedule_id+'" data-groupid="'+group_id+'" data-max="'+max+'" schedule-id="'+jsondata.scheduleIdArray[i]+'">'
      var htmlend = '</div>'
      htmlToJoin.push(htmlstart+sex+name+xbutton+htmlend)
    }
    if(jsondata.db_id.length < max){
      htmlToJoin.push('<div style="margin-top:10px;margin-bottom:10px;"><img src="/static/user/res/floatbtn/btn-plus.png" class="add_groupmember_plan" group-schedule-id="'+group_schedule_id+'" data-groupid="'+group_id+'" data-membernum="'+max+'"></div>')
    }
    target.html(htmlToJoin.join(''))
}
//그룹에 일정에 속한 회원목록을 그린다. get_group_plan_participants와 같이 쓴다.


//참석자에서 + 버튼을 눌렀을때 회원 리스트 불러오기
function draw_groupParticipantsList_to_add(jsondata, targetHTML){
    var len = jsondata.db_id.length;
    var htmlToJoin = ['<div class="list_addByList listTitle_addByList" style="border-color:#ffffff;text-align:center;">내 리스트에서 추가<span>닫기</span></div>'+'<div class="list_addByList listTitle_addByList"><div>'+'회원명(ID)'+'</div>'+'<div>'+'연락처'+'</div>'+'<div>추가</div>'+'</div>']
    for(var i=1; i<=len; i++){
        var sexInfo = '<img src="/static/user/res/member/icon-sex-'+jsondata.sex[i-1]+'.png">'
        htmlToJoin[i] = '<div class="list_addByList" data-lastname="'+jsondata.last_name[i-1]+'" data-firstname="'+jsondata.first_name[i-1]+'" data-dbid="'+jsondata.db_id[i-1]+'" data-id="'+jsondata.member_id[i-1]+'" data-sex="'+jsondata.sex[i-1]+'" data-phone="'+jsondata.phone[i-1]+'"><div data-dbid="'+jsondata.db_id[i-1]+'">'+sexInfo+jsondata.name[i-1]+' (ID: '+jsondata.member_id[i-1]+')'+'</div>'+'<div>'+jsondata.phone[i-1]+'</div>'+'<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>'
    }
    if(len == 0){
      htmlToJoin.push("<div class='list_addByList'>해당하는 회원이 없습니다.</div>")
    }
    var html = htmlToJoin.join('')
    targetHTML.html(html)
}
//참석자에서 + 버튼을 눌렀을때 회원 리스트 불러오기


//[리스트에서 추가]를 눌러 나온 팝업의 리스트에서 + 버튼을 누르면 회원 추가란으로 해당회원을 보낸다.
//그룹일정에 참석자 추가 img.add_listedMember(플러스버튼)을 누르면 호출된다.
function send_add_groupmember_plan(){
    var $form = $('#add_groupmember-plan-form').serializeArray()
    var sendData = send_Data($form)
    var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/schedule/add_member_group_schedule')
     $.ajax({
      url: '/schedule/add_member_group_schedule/',
      type : 'POST',
      dataType: 'html',
      data: sendData,

      beforeSend:function(){
        beforeSend()
      },

      success:function(data){
          TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
          var jsondata = JSON.parse(data)
            if(jsondata.messageArray.length>0){
              $('#errorMessageBar').show()
              $('#errorMessageText').text(jsondata.messageArray)
            }else{
              scheduleTime('class', jsondata)
              scheduleTime('off', jsondata)
              scheduleTime('group', jsondata)
              get_group_plan_participants(sendData[2]["value"],'callback', function(d){draw_groupParticipantsList_to_popup(d, sendData[5]["value"], sendData[2]["value"], sendData[6]["value"])})
              alert('일정 참석자 정상 등록되었습니다.')
            }
      },

      complete:function(){
        completeSend()
      },

      error:function(){
        console.log('server error')
      }
    })
}


$(document).on('click','.group_member_cancel',function(){
    $('#id_schedule_id').val($(this).attr('schedule-id'))
    var group_id = $(this).attr('data-groupid');
    var group_schedule_id = $(this).attr('group-schedule-id')
    var max = $(this).attr('data-max')
    console.log('groupmember_cancel:',group_id,group_schedule_id,max)
    send_plan_delete('pt', 'callback', function(){
        get_group_plan_participants(group_schedule_id,'callback',
          function(jsondata){draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id, max)
          })
    })
})



function send_plan_delete(option, callbackoption, callback){
  if(option == "pt"){
    var $form = $('#daily-pt-delete-form');
    var serializeArray = $form.serializeArray();
    var sendData = send_Data(serializeArray)
    var url_ = '/schedule/delete_schedule/'
  }else if(option == "off"){
    var $form = $('#daily-off-delete-form');
    var serializeArray = $form.serializeArray();
      var sendData = send_Data(serializeArray)
    var url_ = '/schedule/delete_schedule/'
  }else if(option == "group"){
    var $form = $('#daily-pt-delete-form');
    var serializeArray = $form.serializeArray();
      var sendData = send_Data(serializeArray)
    var url_ = '/schedule/delete_group_schedule/'
  }
  var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts(url_)
  $.ajax({
            url: url_,
            type:'POST',
            data: sendData,

            beforeSend:function(){
              beforeSend();
            },

            //통신성공시 처리
            success:function(data){
                TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
                var jsondata = JSON.parse(data)
                console.log('send_plan_delete',jsondata)
                if(jsondata.messageArray.length>0){
                      $('#errorMessageBar').show()
                      $('#errorMessageText').text(jsondata.messageArray)
                }else{
                    set_schedule_time(jsondata)
                    console.log('success')
                    if(callbackoption == 'callback'){
                      callback(jsondata)
                    }else{
                      close_info_popup('cal_popup_plandelete')
                      if($('._calmonth').length == 1){

                      }else if($('._calweek').length == 1){
                        shade_index(-100)
                      }
                    }
                }
              },

            //보내기후 팝업창 닫기
            complete:function(){
                completeSend();
              },

            //통신 실패시 처리
            error:function(){
              alert("Server Error: \nSorry for inconvenience. \nPTERS server is unstable now.")
              console.log("error")
            },
        })
}


function check_dropdown_selected_addplan(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
    var memberSelect = $("#membersSelected button");
    var memberSelect_mini = $('#membersSelected_mini button')
    var dateSelect = $("#dateSelector p");
    var durSelect = $("#durationsSelected button");
    var durSelect_mini = $('#classDuration_mini #durationsSelected button')
    var startSelect = $("#starttimesSelected button")

    var repeatSelect = $("#repeattypeSelected button");
    var startSelect_repeat = $('#repeatstarttimesSelected button')
    var durSelect_repeat = $('#repeatdurationsSelected button')
    var dateSelect_repeat_start = $("#datepicker_repeat_start").parent('p');
    var dateSelect_repeat_end = $("#datepicker_repeat_end").parent('p');

    console.log('addTypeSelect check_dropdown_selected',addTypeSelect)

    if(addTypeSelect == "ptadd"){
        if((memberSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true && $('#countsSelected').text() != 0){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated')
            select_all_check=true;
        }else if($('#page-addplan-pc').css('display')=='block' && (memberSelect_mini).hasClass("dropdown_selected")==true && $('#countsSelected_mini').text() != 0 && durSelect_mini.hasClass("dropdown_selected")==true){
            $('#submitBtn_mini').css('background','#fe4e65');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated')
            $('#submitBtn_mini').css('background','#282828');
            select_all_check=false;
        }
    }else if(addTypeSelect == "groupptadd"){
        if((memberSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated')
            select_all_check=true;
        }else if($('#page-addplan-pc').css('display')=='block' && (memberSelect_mini).hasClass("dropdown_selected")==true && durSelect_mini.hasClass("dropdown_selected")==true){
            $('#submitBtn_mini').css('background','#fe4e65');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated')
            $('#submitBtn_mini').css('background','#282828');
            select_all_check=false;
        }
    }else if(addTypeSelect == "offadd"){
        if((dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true && (startSelect).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated')
            select_all_check=true;
        }else if($('#page-addplan-pc').css('display')=='block' && durSelect_mini.hasClass("dropdown_selected")==true){
            $('#submitBtn_mini').css('background','#fe4e65');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#submitBtn_mini').css('background','#282828');
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated')
            select_all_check=false;
        }
    }else if(addTypeSelect == "repeatptadd" || addTypeSelect == "repeatgroupptadd"){
      console.log('체크드랍다운 repeatptadd, repeatgroupptadd')
        if((memberSelect).hasClass("dropdown_selected")==true && (repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated')
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#submitBtn_mini').css('background','#282828');
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated')
            select_all_check=false;
        }
    }else if(addTypeSelect == "repeatoffadd"){
      console.log('체크드랍다운 repeatoffadd')
        if((repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated')
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#submitBtn_mini').css('background','#282828');
            $('#page-addplan .submitBtn:first-child').removeClass('submitBtnActivated')
            select_all_check=false;
        }
    }
}
