$(document).ready(function(){

      //유저가 터치인지 마우스 사용인지 알아낸다
      var touch_or_mouse = ""
           window.addEventListener('touchstart',function(){
          touch_or_mouse = "touch"
      })
      //유저가 터치인지 마우스 사용인지 알아낸다

      DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateData,"graph",classTimeData)
      DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offDateData,"graph",offTimeData)

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
                  if(addTypeSelect == "ptadd"){
                      //$("#id_training_date").val($("#datepicker").val()).submit();
                      $("#id_training_date").val($("#datepicker").val());
                      if($('#timeGraph').css('display')=='none'){
                        $('#timeGraph').show(110,"swing");
                      }
                      $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder')
                      clear_start_dur_dropdown()
                      ajaxTimeGraphSet()
                  }
                  else if(addTypeSelect =="offadd"){
                      //$("#id_training_date_off").val($("#datepicker").val()).submit();
                      $("#id_training_date_off").val($("#datepicker").val());
                      if($('#timeGraph').css('display')=='none'){
                        $('#timeGraph').show(110,"swing");
                      }
                      $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder')
                      clear_start_dur_dropdown()
                      ajaxTimeGraphSet()
                  }
                  else if(addTypeSelect == "repeatptadd"){
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
                  check_dropdown_selected();
                }
              }
      });

      $(document).on('click','.td00, .td30',function(){ //주간달력 미니 팝업
            closeAlarm('pc')
            if($('._MINI_ptadd').css('display')=='block'){
              addTypeSelect = 'ptadd'
            }else if($('._MINI_ptadd').css('display')=="none"){
              addTypeSelect = 'offadd'
            }
            var toploc = $(this).offset().top;
            var leftloc = $(this).offset().left;
            var tdwidth = $(this).width();
            var tdheight = $(this).height();
            var minipopupwidth = 300;
            var minipopupheight = 131;
            var splitID = $(this).attr('id').split('_')
            var weekID = $(this).attr('data-week')
            //minipopup 위치 보정
            if(splitID[3]>=20){
              $('.dropdown_mini').addClass('dropup')
              if(splitID[3]==24 && weekID!=3){
                var toploc = toploc - tdheight*2
              }else if(weekID==3){
                var toploc = toploc-minipopupheight
              }else{
                var toploc = toploc - tdheight*(24-splitID[3])  
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
              var leftloc = leftloc-tdwidth/2
            }
            //minipopup 위치 보정
            var thisIDSplitArray = $(this).attr('id').split('_')
            if(thisIDSplitArray[4]=="30"){
              var next30ID = '#'+thisIDSplitArray[0]+'_'+thisIDSplitArray[1]+'_'+thisIDSplitArray[2]+'_'+(Number(thisIDSplitArray[3])+1)+'_00'
            }else if(thisIDSplitArray[4]=="00"){
              var next30ID = '#'+thisIDSplitArray[0]+'_'+thisIDSplitArray[1]+'_'+thisIDSplitArray[2]+'_'+thisIDSplitArray[3]+'_30'
            }
            if(Options.classDur == 60){
                if(!$(this).find('div').hasClass('classTime') && !$(this).find('div').hasClass('offTime') && $('#page-addplan-pc').css('display','none') && !$(next30ID).find('div').hasClass('classTime') && !$(next30ID).find('div').hasClass('offTime') && !$(this).hasClass('_on')){
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
                  if(addTypeSelect == "ptadd"){
                    $('._MINI_ptadd').show()
                    //$('._MINI_offadd').hide()
                  }else if(addTypeSelect == "offadd"){
                    //$('._MINI_offadd').show()
                    $('._MINI_ptadd').hide()
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
                      timeGraphSet("class","pink","mini");  //시간 테이블 채우기
                      timeGraphSet("off","grey","mini")
                      startTimeSet("mini");  //일정등록 가능한 시작시간 리스트 채우기
                      $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time").val(hh+':'+min+':00.000000');
                      $("#id_time_duration").val(1*(Options.classDur/60))
                      $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time_off").val(hh+':'+min+':00.000000');
                      //durTimeSet(hh,min,"mini");
                      durTimeSet(hh,min,"mini");
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
                      timeGraphSet("class","pink","mini");  //시간 테이블 채우기
                      timeGraphSet("off","grey","mini")
                      startTimeSet("mini");  //일정등록 가능한 시작시간 리스트 채우기
                      $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time").val(hh+':'+min+':00.000000');
                      $("#id_time_duration").val(1*(Options.classDur/30))
                      $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time_off").val(hh+':'+min+':00.000000');
                      durTimeSet(hh,min,"mini");
                  }
                }
            }else if(Options.classDur == 30){
                if(!$(this).find('div').hasClass('classTime') && !$(this).find('div').hasClass('offTime') && $('#page-addplan-pc').css('display','none')){
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
                  if(addTypeSelect == "ptadd"){
                    $('._MINI_ptadd').show()
                    //$('._MINI_offadd').hide()
                  }else if(addTypeSelect == "offadd"){
                    //$('._MINI_offadd').show()
                    $('._MINI_ptadd').hide()
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
                      timeGraphSet("class","pink","mini");  //시간 테이블 채우기
                      timeGraphSet("off","grey","mini")
                      startTimeSet("mini");  //일정등록 가능한 시작시간 리스트 채우기
                      $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time").val(hh+':'+min+':00.000000');
                      $("#id_time_duration").val(1*(Options.classDur/30))
                      $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time_off").val(hh+':'+min+':00.000000');
                      durTimeSet(hh,min,"mini");
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
                      timeGraphSet("class","pink","mini");  //시간 테이블 채우기
                      timeGraphSet("off","grey","mini")
                      startTimeSet("mini");  //일정등록 가능한 시작시간 리스트 채우기
                      $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time").val(hh+':'+min+':00.000000');
                      $("#id_time_duration").val(1*(Options.classDur/30))
                      $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
                      $("#id_training_time_off").val(hh+':'+min+':00.000000');
                      durTimeSet(hh,min,"mini");
                  }
                }
            }
            
      })

      $('#page-addplan-pc').click(function(){console.log(addTypeSelect)})

      if($('#calendar').width()<=600){
          $(document).off('click','.td00, .td30')
      }

      $('#typeSelector .toggleBtnWrap').click(function(){
          $('.blankSelected_addview').removeClass('blankSelected blankSelected30 blankSelected_addview')
          $(this).addClass('typeSelected')
          $(this).siblings('.toggleBtnWrap').removeClass('typeSelected')
          if($(this).attr('id').split('_')[1]=="ptadd"){
              $('#memberName_mini').css('display','inline')
              $('#remainCount_mini').show('fast')
              $("#durationsSelected .btn:first-child").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>"+'선택'+"</span>").val("");
              $("#id_time_duration").val('')
              planAddView($("#id_time_duration").val())
          }else if($(this).attr('id').split('_')[1]=="offadd"){
              $('#memberName_mini').hide('fast')
              $('#remainCount_mini').hide('fast')
              $("#durationsSelected .btn:first-child").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>"+'선택'+"</span>").val("");
              $("#id_time_duration_off").val('')
              planAddView($("#id_time_duration_off").val())  
          }
          addTypeSelect = $(this).attr('id').split('_')[1]
          check_dropdown_selected();
          //planAddView($("#id_time_duration").val())
      })

      $(document).on('click',"#durations_mini li a",function(){
          $("#classDuration_mini #durationsSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-dur'));
          if(addTypeSelect == "ptadd"){ //Form 셋팅
            var durationTime_class =  Number($(this).attr('data-dur'))*(30/Options.classDur)
            $("#id_time_duration").val(durationTime_class);
            planAddView($(this).attr('data-dur'));
          }else if(addTypeSelect == "offadd"){
            var durationTime = Number($(this).attr('data-dur'))*(30/Options.classDur)
            $("#id_time_duration_off").val(durationTime);
            planAddView($(this).attr('data-dur'));
          }
          check_dropdown_selected();
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
              console.log('#'+yy+'_'+mm+'_'+dd+'_'+hh_+'_'+mi)
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
          $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text());
      		$("#countsSelected,.countsSelected").text($(this).attr('data-lecturecount'));
          $('#remainCount_mini_text').show()
      		$("#id_lecture_id").val($(this).attr('data-lectureid'));
      		$("#id_member_id").val($(this).attr('data-memberid'));
          $("#id_member_name").val($(this).text());
          check_dropdown_selected();
  		}); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $(document).on('click',"#members_mobile li a",function(){
          //$('.tdgraph').removeClass('graphindicator')
          get_repeat_info($(this).attr('data-lectureid'),$(this).attr('data-memberid'))
          $('#cal_popup_repeatconfirm').attr({'data-lectureid':$(this).attr('data-lectureid'),'data-memberid':$(this).attr('data-memberid')})
          $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text());
          check_dropdown_selected();
  		}); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

      

      $(document).on('click','#starttimes li a',function(){
          $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder')
          $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text());
          if(addTypeSelect == "ptadd"){
            $("#id_training_time").val($(this).attr('data-trainingtime'));
          }else if(addTypeSelect == "offadd"){
            $("#id_training_time_off").val($(this).attr('data-trainingtime'));
          }else if(addTypeSelect == "repeatptadd"){
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
          if(addTypeSelect == "ptadd"){
            var durationTime_class = Number($('#durationsSelected button').val())*(30/Options.classDur)
            $("#id_time_duration").val(durationTime_class);
            addGraphIndicator($('#durationsSelected button').val())
          }else if(addTypeSelect == "offadd"){
            var durationTime = Number($('#durationsSelected button').val())*(30/Options.classDur)
            $("#id_time_duration_off").val(durationTime);
            addGraphIndicator($('#durationsSelected button').val())
          }else if(addTypeSelect == "repeatptadd"){
            $("#id_repeat_dur").val($('#durationsSelected button').val());
          }else if(addTypeSelect == "repeatoffadd"){
            $("#id_repeat_dur_off").val($('#durationsSelected button').val());
          }

          check_dropdown_selected();

      })

      $(document).on('click',"#durations li a, #repeatdurations li a",function(){
          $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-dur'));
          if(addTypeSelect == "ptadd"){
            var durationTime_class = Number($(this).attr('data-dur'))*(30/Options.classDur)
            $("#id_time_duration").val(durationTime_class);
            addGraphIndicator($(this).attr('data-dur'))
          }else if(addTypeSelect == "offadd"){
            var durationTime = Number($(this).attr('data-dur'))*(30/Options.classDur)
            $("#id_time_duration_off").val(durationTime);
            addGraphIndicator($(this).attr('data-dur'))
          }else if(addTypeSelect == "repeatptadd"){
            $("#id_repeat_dur").val($(this).attr('data-dur'));
          }else if(addTypeSelect == "repeatoffadd"){
            $("#id_repeat_dur_off").val($(this).attr('data-dur'));
          }
          check_dropdown_selected();
      }); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시


      $(document).on('click','#durationsSelected button',function(){
        $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder');
      })

      $(document).on('click','button',function(){
         //scrollToIndicator($(this))
      })

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

      function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
          console.log('check dropdown')
          var memberSelect = $("#membersSelected button");
          var dateSelect = $("#dateSelector p");
          var durSelect = $("#durationsSelected button");
          var durSelect_mini = $('#classDuration_mini #durationsSelected button')
          var startSelect = $("#starttimesSelected button")

          var repeatSelect = $("#repeattypeSelected button");
          var startSelect_repeat = $('#repeatstarttimesSelected button')
          var durSelect_repeat = $('#repeatdurationsSelected button')
          var dateSelect_repeat_start = $("#datepicker_repeat_start").parent('p');
          var dateSelect_repeat_end = $("#datepicker_repeat_end").parent('p');

          if(addTypeSelect == "ptadd"){
              if((memberSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true && $('#countsSelected').text() != 0){
                  $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                  $('#page-addplan .submitBtn:first-child').addClass('submitBtnActivated')
                  select_all_check=true;
              }else if($('#page-addplan-pc').css('display')=='block' && (memberSelect).hasClass("dropdown_selected")==true && $('#countsSelected').text() != 0 && durSelect_mini.hasClass("dropdown_selected")==true){
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
          }else if(addTypeSelect == "repeatptadd"){
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

      $('#page-addplan').click(function(){
        console.log('page-addplan',select_all_check)
      })

      $("#upbutton-check, #submitBtn_pt, #submitBtn_mini").click(function(e){
         e.preventDefault();
         console.log(select_all_check,0)
         if(addTypeSelect=="ptadd"){
            var $form = $('#pt-add-form')
            var serverURL = '/schedule/add_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)

         }else if(addTypeSelect=="offadd"){
            var $form = $('#off-add-form')
            var serverURL = '/schedule/add_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)

         }else if(addTypeSelect=="repeatptadd"){
          console.log(select_all_check,1)
            var $form = $('#add-repeat-schedule-form')
            var serverURL = '/schedule/add_repeat_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)
         }
         else if(addTypeSelect=="repeatoffadd"){
            var $form = $('#add-off-repeat-schedule-form')
            var serverURL = '/schedule/add_repeat_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)
         }
<<<<<<< HEAD
         console.log(serializeArray)
=======
>>>>>>> 39964615be0ddc6470f603873824c6330d57d80b
         if(select_all_check==true){
             //ajax 회원정보 입력된 데이터 송신
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
                        //ajaxClassTime();
                        var jsondata = JSON.parse(data);
                        console.log(jsondata)
                        RepeatDuplicationDateArray = jsondata.RepeatDuplicationDateArray;
                        repeatArray = jsondata.repeatArray;
                        if(jsondata.messageArray.length>0){
                            $('#errorMessageBar').show();
                            $('#errorMessageText').text(jsondata.messageArray)
                        }else{
                            if(addTypeSelect=="ptadd") {
                                if (jsondata.push_info != '') {
                                    for (var i = 0; i < jsondata.pushArray.length; i++) {
                                        send_push(jsondata.push_server_id, jsondata.pushArray[i], jsondata.push_info[0], jsondata.badgeCounterArray[i]);
                                    }
                                }
                            }
                            if(RepeatDuplicationDateArray.length>0 && (addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatptadd")){
                              var date = RepeatDuplicationDateArray[0].replace(/\//gi,", ");
                                var total_count = Number(jsondata.repeatScheduleCounterArray[0])+RepeatDuplicationDateArray[0].split('/').length;
                              $('._repeatconfirmQuestion').text('선택한 일정 총 '+total_count+' 건 중 '+RepeatDuplicationDateArray[0].split('/').length + '건의 일정이 겹칩니다.');
                              var repeat_info = popup_repeat_confirm()
                              $('#repeat_confirm_day').text(RepeatDuplicationDateArray[0].replace(/\//gi,','))
                              $('#repeat_confirm_dur').text('중복 항목은 건너뛰고 등록하시겠습니까?')
                              $('#id_repeat_schedule_id_confirm').val(repeatArray)
                              completeSend(); //ajax 로딩 이미지 숨기기
                              shade_index(200)
                            }else if(RepeatDuplicationDateArray.length==0 && (addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatptadd")){
                              var repeat_info = popup_repeat_confirm()
                              var day_info = repeat_info.day_info
                              var dur_info = repeat_info.dur_info
                              $('._repeatconfirmQuestion').text('총 '+jsondata.repeatScheduleCounterArray[0]+' 건의 일정이 등록됩니다.')
                              $('#repeat_confirm_day').text(day_info)
                              $('#repeat_confirm_dur').text(dur_info)
                              $('#id_repeat_schedule_id_confirm').val(repeatArray)
                              completeSend(); //ajax 로딩 이미지 숨기기
                              shade_index(200)
                            }else{
                              ajax_received_json_data(jsondata)
                              $('#calendar').show().css('height','100%')
                              if($('body').width()>=600){
                                  $('#calendar').css('position','relative')
                              }
                              closeAddPopup()
                              closeAddPopup_mini()
                              completeSend()
                              shade_index(-100)
                            }
                        }
                    },

                    //보내기후 팝업창 닫기
                    complete:function(){
                      
                    },

                    //통신 실패시 처리
                    error:function(){
                        $('#errorMessageBar').show()
                        $('#errorMessageText').text('통신 에러: 관리자 문의')
                    },
                 })

         }else{
            if($('#countsSelected').text() == 0){
              alert('회원님의 남은 예약 가능 횟수가 없습니다.')
            }
            console.log('else')
          //alert('빠진 항목 체크해봐야함')
            //$('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
         }
      })



      //OFF반복일정 확인 팝업 "아니오" 눌렀을때 (선택지: 반복 설정 다시 하겠다)
      $('#popup_btn_repeatconfirm_no').click(function(){
        $('#id_repeat_confirm').val(0);
        close_info_popup('cal_popup_repeatconfirm')
        ajaxRepeatConfirmSend();
        check_dropdown_selected()
      })

      $('#popup_btn_repeatconfirm_yes').click(function(){
          //addTypeSelect = "ptadd";
          $('#id_repeat_confirm').val(1);
          /*
          if($('body').width>=600){
              $('#calendar').css('position','relative')
          }
          */
          
          //$('.popups').hide();
          //$('#calendar').show().css('height','100%');
          
          if($('body').width()<600){
            close_info_popup('page-addplan')
          }
          close_info_popup('cal_popup_repeatconfirm')
          ajaxRepeatConfirmSend();
          check_dropdown_selected()
          get_repeat_info($('#cal_popup_repeatconfirm').attr('data-lectureid'),$('#cal_popup_repeatconfirm').attr('data-memberid'))
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
      $(document).on('click','div.classTime, div.plan_raw',function(){
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
        shade_index(100)
        scrollToDom($('#calendar'))
        
    }else if(option ==2){
        clear_pt_off_add_popup()
        open_pt_off_add_popup('offadd')
        shade_index(100)
        scrollToDom($('#calendar'))
    }
}

function open_pt_off_add_popup(option){ //option 'ptadd', 'offadd'
    addTypeSelect = option


    if($('body').width()<=600){
      $('#page-base').fadeOut();
      $('#page-base-addstyle').fadeIn();
      $('#float_inner1, #float_inner2').animate({'opacity':'0','bottom':'25px'},10);
      $('#float_btn_wrap').fadeOut();
      $('#calendar').hide();
      $('#calendar').css('height','0')
      $('#addpopup_pc_label_pt, #addpopup_pc_label_off').css('display','none')
    }else{
      $('#calendar').css('position','fixed')
      $('#page-addplan-pc').css('display','none')
    }

    $('#page-addplan').fadeIn('fast');
    $('#datepicker').datepicker('setDate', currentYear+'-'+(currentMonth+1)+'-'+currentDate)
    $('#datepicker').parent('p').addClass('dropdown_selected')
    $('#datepicker_repeat_start').datepicker('setDate', currentYear+'-'+(currentMonth+1)+'-'+currentDate)
    $('#datepicker_repeat_start').parent('p').addClass('dropdown_selected')
    $('#page-addplan #timeGraph').css('display','block')

    if(option == "ptadd"){
        $('#memberName,#remainCount').css('display','block');
        $('#uptext2').text('PT 일정 등록')
        $('#id_training_date').val($('#datepicker').val())
        console.log($('#datepicker').val())
        $('#id_repeat_start_date').val($('#datepicker_repeat_start').val())
        if($('body').width()>600){
          $('#addpopup_pc_label_pt').show()
          $('#addpopup_pc_label_off').hide()
        }
    }else if(option == "offadd"){
        $('#memberName,#remainCount').css('display','none');
        $('#uptext2').text('OFF 일정 등록')
        $('#id_training_date_off').val($('#datepicker').val())
        console.log($('#datepicker').val())
        $('#id_repeat_start_date_off').val($('#datepicker_repeat_start').val())
        if($('body').width()>600){
          $('#addpopup_pc_label_off').show()
          $('#addpopup_pc_label_pt').hide()
        }
    }

    $('.graphindicator_leftborder, graphindicator').removeClass('graphindicator').removeClass('graphindicator_leftborder') //선택된 시간 반짝이
    ajaxTimeGraphSet()
}

//PT, OFF추가하는 모바일,PC팝업 선택사항을 초기화
function clear_pt_off_add_popup(){
    //핑크체크를 원래대로 검정 체크로 돌린다(모바일)
    $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
    //submitButton 초기화
    $('#submitBtn_pt').removeClass('submitBtnActivated')

    //회원명 비우기
    $("#membersSelected button").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>회원명 선택</span>").val("");

    //예약가능 횟수 비우기
    $("#countsSelected,.countsSelected").text("")
    $('#remainCount_mini_text').hide()
    
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

/*
//일정 정보창 닫기
function close_info_popup(option){
  if(option=="cal_popup_planinfo"){
      $("#"+option).css({'display':'none'})
      if($('#pshade').css('z-index')==150 || $('#mshade').css('z-index') == 150){
        shade_index(100)
      }else{
        shade_index(-100)
      }
      //$('body').css('overflow-y','overlay');
  }
  else if(option =="cal_popup_plandelete"){
      $("#"+option).css({'display':'none'})
      console.log($('#pshade').css('z-index'))
      if($('#pshade').css('z-index')==200 || $('#mshade').css('z-index') == 200){
        shade_index(100)
      }else{
        shade_index(-100)
      }
      
      //$('body').css('overflow-y','overlay');
  }
  else if(option =="page-addplan"){
      $('#'+option).css('display','none')
      $('#calendar').css('position','relative')
      shade_index(-100)
  }
  else if(option =="cal_popup_repeatconfirm"){
      $('#'+option).css('display','none')
      //$('#calendar').css('position','relative')
      if($('#pshade').css('z-index') == 200 || $('#mshade').css('z-index') == 200){
        shade_index(100)
      }else{
        shade_index(-100)
      }
      if($('body').width()>=600){
          $('#calendar').css('position','relative')
      }else{
          $('._calmonth').css({'height':'90%','position':'fixed'})
          $('body').css('overflow-y','overlay');
          $('#page-addplan').hide('fast','swing');
          $('#float_btn_wrap').fadeIn();
          $('#float_btn').removeClass('rotate_btn');
          $('#page-base').show();
          $('#page-base-addstyle').hide();
      }
  }
  else if(option = "cal_popup_plancheck"){
      $('#'+option).css('display','none')
      shade_index(-100)
  }
}
*/




//회원 정보 ajax 연동을 위해 구현 - hk.kim 180110
function addPtMemberListSet(){
  var memberMobileList = $('#members_mobile');
  var memberPcList = $('#members_pc');
  var memberSize = memberIdArray.length;
  var member_array_mobile = [];
  var member_array_pc = [];
  memberMobileList.empty();
  memberPcList.empty();
  if(memberSize>0){
    for(var i=0; i<memberSize; i++){
      //member_array[i] = '<li><a data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>';
      member_array_mobile[i] = '<li><a id="member_mobile_'+memberLectureIdArray[i]+'" data-lecturecount="'+memberAvailCountArray[i]+'" data-memberid="'+memberIdArray[i]+'" data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>';
      member_array_pc[i] = '<li><a id="member_pc_'+memberLectureIdArray[i]+'" data-lecturecount="'+memberAvailCountArray[i]+'" data-memberid="'+memberIdArray[i]+'" data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>';
      //memberPcList.append('<li><a data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>');
    //memberMobileList.append('<li><a data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>');
    }
  }else if(memberSize == 0){
      member_array_mobile[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;">등록된 회원이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
      member_array_pc[0] = '<li style="color:#fe4e65;font-weight:bold;font-size:13px;">등록된 회원이 없습니다.<a href="/trainer/member_manage/" style="text-decoration:underline">회원 등록</a></li>';
  }
  
  var member_arraySum_mobile = member_array_mobile.join('');
  var member_arraySum_pc = member_array_pc.join('');
  memberMobileList.html(member_arraySum_mobile);
  memberPcList.html(member_arraySum_pc);
}


function ajaxRepeatConfirmSend(){
            var $form = $('#confirm-repeat-schedule-form')
            var serverURL = '/schedule/add_repeat_schedule_confirm/'
            $.ajax({
              url: serverURL,
              type:'POST',
              data: $form.serialize(),
              dataType : 'html',

              beforeSend:function(){
                  beforeSend(); //ajax 로딩이미지 출력
              },

              success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                  $('#errorMessageBar').show()
                  $('#errorMessageText').text(jsondata.messageArray)
                }else{

                    if(jsondata.push_info != ''){
                        for (var i=0; i<jsondata.pushArray.length; i++){
                            send_push(jsondata.push_server_id, jsondata.pushArray[i], jsondata.push_info[0], jsondata.badgeCounterArray[i]);
                        }
                    }
                  ajax_received_json_data(jsondata)
                }
              },

              complete:function(){
                completeSend(); //ajax 로딩이미지 숨기기
              },

              error:function(){
                    $('#errorMessageBar').show()
                    $('#errorMessageText').text('통신 에러: 관리자 문의')
              }
            })    
      }


function ajaxTimeGraphSet(){
      var today_form = $('#datepicker').val()
      $.ajax({
        url: '/trainer/cal_day_ajax/',
        type : 'POST',
        data : {"date":today_form, "day":7}, //월간 46 , 주간 18, 하루 1
        dataType : 'html',

        beforeSend:function(){
        },

        success:function(data){
          var jsondata = JSON.parse(data);
          if(jsondata.messageArray.length>0){
            $('#errorMessageBar').show()
            $('#errorMessageText').text(jsondata.messageArray)
          }else{
            /*팝업의 timegraph 업데이트*/
            var updatedClassTimeArray_start_date = jsondata.classTimeArray_start_date
            var updatedClassTimeArray_end_date = jsondata.classTimeArray_end_date
            var updatedOffTimeArray_start_date = jsondata.offTimeArray_start_date
            var updatedOffTimeArray_end_date = jsondata.offTimeArray_end_date
            classDateData = []
            classTimeData = []
            offDateData=[]
            offTimeData = []
            offAddOkArray = [] //OFF 등록 시작 시간 리스트
            durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트
            DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateData,"graph",classTimeData)
            DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offDateData,"graph",offTimeData)
            timeGraphSet("class","pink","AddClass");  //시간 테이블 채우기
            timeGraphSet("off","grey","AddClass")
            startTimeSet("class");  //일정등록 가능한 시작시간 리스트 채우기
          }
          
        },

        complete:function(){
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

function ajax_received_json_data(json){
    var jsondata = json
    classTimeArray = [];
    offTimeArray = [];
    
    //월간 달력
    classDateArray = []
    classStartArray = []
    classNameArray = []
    countResult = []
    dateResult = []
    //월간 달력

    classTimeArray_member_name = [];
    classArray_lecture_id = [];
    scheduleIdArray = [];
    offScheduleIdArray = [];
    scheduleFinishArray = [];
    scheduleNoteArray = [];
    offScheduleNoteArray = [];
    memberIdArray = [];
    memberLectureIdArray = [];
    memberNameArray = [];
    memberAvailCountArray = [];
    messageArray = [];
    RepeatDuplicationDateArray = [];
    repeatArray = [];
    offRepeatScheduleIdArray = [];
    offRepeatScheduleTypeArray = [];
    offRepeatScheduleWeekInfoArray = [];
    offRepeatScheduleStartDateArray = [];
    offRepeatScheduleEndDateArray = [];
    offRepeatScheduleStartTimeArray = [];
    offRepeatScheduleTimeDurationArray = [];
    ptRepeatScheduleIdArray = [];
    ptRepeatScheduleTypeArray = [];
    ptRepeatScheduleWeekInfoArray = [];
    ptRepeatScheduleStartDateArray = [];
    ptRepeatScheduleEndDateArray = [];
    ptRepeatScheduleStartTimeArray = [];
    ptRepeatScheduleTimeDurationArray = [];

    var updatedClassTimeArray_start_date = jsondata.classTimeArray_start_date
    var updatedClassTimeArray_end_date = jsondata.classTimeArray_end_date
    var updatedOffTimeArray_start_date = jsondata.offTimeArray_start_date
    var updatedOffTimeArray_end_date = jsondata.offTimeArray_end_date
    classTimeArray_member_name = jsondata.classTimeArray_member_name
    classArray_lecture_id = jsondata.classArray_lecture_id
    scheduleIdArray = jsondata.scheduleIdArray
    offScheduleIdArray = jsondata.offScheduleIdArray
    scheduleFinishArray = jsondata.scheduleFinishArray;
    scheduleNoteArray = jsondata.scheduleNoteArray;
    offScheduleNoteArray = jsondata.offScheduleNoteArray;
    memberIdArray = jsondata.memberIdArray;
    memberLectureIdArray = jsondata.memberLectureIdArray;
    memberNameArray = jsondata.memberNameArray;
    memberAvailCountArray = jsondata.memberAvailCountArray;
    messageArray = jsondata.messageArray;
    RepeatDuplicationDateArray = jsondata.RepeatDuplicationDateArray;
    repeatArray = jsondata.repeatArray;
    offRepeatScheduleIdArray = jsondata.offRepeatScheduleIdArray;
    offRepeatScheduleTypeArray = jsondata.offRepeatScheduleTypeArray;
    offRepeatScheduleWeekInfoArray = jsondata.offRepeatScheduleWeekInfoArray;
    offRepeatScheduleStartDateArray = jsondata.offRepeatScheduleStartDateArray;
    offRepeatScheduleEndDateArray = jsondata.offRepeatScheduleEndDateArray;
    offRepeatScheduleStartTimeArray = jsondata.offRepeatScheduleStartTimeArray;
    offRepeatScheduleTimeDurationArray = jsondata.offRepeatScheduleTimeDurationArray;
    ptRepeatScheduleIdArray = jsondata.ptRepeatScheduleIdArray;
    ptRepeatScheduleTypeArray = jsondata.ptRepeatScheduleTypeArray;
    ptRepeatScheduleWeekInfoArray = jsondata.ptRepeatScheduleWeekInfoArray;
    ptRepeatScheduleStartDateArray = jsondata.ptRepeatScheduleStartDateArray;
    ptRepeatScheduleEndDateArray = jsondata.ptRepeatScheduleEndDateArray;
    ptRepeatScheduleStartTimeArray = jsondata.ptRepeatScheduleStartTimeArray;
    ptRepeatScheduleTimeDurationArray = jsondata.ptRepeatScheduleTimeDurationArray;
    DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classTimeArray,"class");
    DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offTimeArray,"off");
    $('.classTime,.offTime').parent().html('<div></div>')
    $('._on').removeClass('_on')
    classTime();
    offTime();
    addPtMemberListSet();

    /*팝업의 timegraph 업데이트*/
    classDateData = []
    classTimeData = []
    offDateData= []
    offTimeData = []
    offAddOkArray = [] //OFF 등록 시작 시간 리스트
    durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트
    DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateData,"graph",classTimeData)
    DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offDateData,"graph",offTimeData)
    /*팝업의 timegraph 업데이트*/
    
    $('.blankSelected_addview').removeClass('blankSelected blankSelected30')

    //월간 달력
    DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateArray,'member',classStartArray)
    DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classNameArray,'class')
    DBdataProcessMonthTrainer();
    classDatesTrainer();
}

function get_repeat_info(lecture_id, member_id){
    if(addTypeSelect == "repeatptadd" || addTypeSelect == "ptadd"){
      var url_ = '/trainer/read_member_lecture_data_from_schedule/'
      var data_ = {"lecture_id": lecture_id, "member_id": member_id}
      var fill_option = 'class'
      var type_ = 'POST'
    }else if(addTypeSelect == "repeatoffadd"){
      var url_ = '/trainer/get_off_repeat_schedule_ajax/'
      var data_;
      var fill_option = 'off'
      var type_;
    }
    $.ajax({
        url: url_,
        type: type_,
        data: data_,
        dataType : 'html',

        beforeSend:function(){
            beforeSend(); //ajax 로딩이미지 출력
        },

        success:function(data){
           console.log(data,'off?pt?')
           console.log(url_,'url',addTypeSelect,'addTypeSelect')
          var jsondata = JSON.parse(data);
         
          if(jsondata.messageArray.length>0){
              $('#errorMessageBar').show();
              $('#errorMessageText').text(jsondata.messageArray)
          }else{
            if(addTypeSelect == "repeatptadd" || addTypeSelect == "ptadd"){
              ptRepeatScheduleIdArray = jsondata.ptRepeatScheduleIdArray;
              ptRepeatScheduleTypeArray = jsondata.ptRepeatScheduleTypeArray;
              ptRepeatScheduleWeekInfoArray = jsondata.ptRepeatScheduleWeekInfoArray;
              ptRepeatScheduleStartDateArray = jsondata.ptRepeatScheduleStartDateArray;
              ptRepeatScheduleEndDateArray = jsondata.ptRepeatScheduleEndDateArray;
              ptRepeatScheduleStartTimeArray = jsondata.ptRepeatScheduleStartTimeArray;
              ptRepeatScheduleTimeDurationArray = jsondata.ptRepeatScheduleTimeDurationArray;
            }else if(addTypeSelect == "repeatoffadd"){
              offRepeatScheduleIdArray = jsondata.offRepeatScheduleIdArray;
              offRepeatScheduleTypeArray = jsondata.offRepeatScheduleTypeArray;
              offRepeatScheduleWeekInfoArray = jsondata.offRepeatScheduleWeekInfoArray;
              offRepeatScheduleStartDateArray = jsondata.offRepeatScheduleStartDateArray;
              offRepeatScheduleEndDateArray = jsondata.offRepeatScheduleEndDateArray;
              offRepeatScheduleStartTimeArray = jsondata.offRepeatScheduleStartTimeArray;
              offRepeatScheduleTimeDurationArray = jsondata.offRepeatScheduleTimeDurationArray;
            }

            selectedMemberIdArray = jsondata.memberIdArray;
            selectedMemberAvailCountArray = jsondata.memberAvailCountArray;
            selectedMemberLectureIdArray = jsondata.memberLectureIdArray;
            selectedMemberNameArray = jsondata.memberNameArray
            fill_repeat_info(fill_option);
            $("#countsSelected,.countsSelected").text(selectedMemberAvailCountArray[0]);
            if(addTypeSelect == "ptadd"){
              $("#id_member_id").val(selectedMemberIdArray[0]);
              $("#id_lecture_id").val(selectedMemberLectureIdArray[0]);
              $("#id_member_name").val(selectedMemberNameArray[0]);
            }else if(addTypeSelect == "repeatptadd"){
              $("#id_repeat_member_id").val(selectedMemberIdArray[0]);
              $("#id_repeat_lecture_id").val(selectedMemberLectureIdArray[0]);
              $("#id_repeat_member_name").val(selectedMemberNameArray[0]);
            }
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

function fill_repeat_info(option){ //반복일정 요약 채우기
    switch(option){
        case 'class':
          var len = ptRepeatScheduleIdArray.length
          var repeat_id_array = ptRepeatScheduleIdArray
          var repeat_type_array = ptRepeatScheduleTypeArray
          var repeat_day_info_raw_array = ptRepeatScheduleWeekInfoArray
          var repeat_start_array = ptRepeatScheduleStartDateArray
          var repeat_end_array = ptRepeatScheduleEndDateArray
          var repeat_time_array = ptRepeatScheduleStartTimeArray
          var repeat_dur_array = ptRepeatScheduleTimeDurationArray
        break;
        case 'off':
        var len = offRepeatScheduleIdArray.length
        var repeat_id_array = offRepeatScheduleIdArray
        var repeat_type_array = offRepeatScheduleTypeArray
        var repeat_day_info_raw_array = offRepeatScheduleWeekInfoArray
        var repeat_start_array = offRepeatScheduleStartDateArray
        var repeat_end_array = offRepeatScheduleEndDateArray
        var repeat_time_array = offRepeatScheduleStartTimeArray
        var repeat_dur_array = offRepeatScheduleTimeDurationArray
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

      var summaryInnerBoxText_1 = '<span class="summaryInnerBoxText">'+repeat_type +' '+repeat_day() +' '+repeat_start_time+' ~ '+repeat_end_time+' ('+repeat_dur +'시간)</span>'
      var summaryInnerBoxText_2 = '<span class="summaryInnerBoxText2">'+repeat_end_text+repeat_end_text_small+repeat_end+'</span>'
      var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>'
      schedulesHTML[i] = '<div class="summaryInnerBox" data-id="'+repeat_id+'">'+summaryInnerBoxText_1+summaryInnerBoxText_2+deleteButton+'</div>'
    }

    var summaryText = '<span id="summaryText">일정요약</span>'
    console.log(schedulesHTML)
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
    }else if(addTypeSelect == "repeatptadd"){
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


function classTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
    var planheight = 60;
      if($calendarWidth>=600){
        //var planheight = 46;
        var planheight = 58;
    }
    var classlen = classTimeArray.length;
    $('#calendar').css('display','none');
    for(var i=0; i<classlen; i++){
      var indexArray = classTimeArray[i]
      var memoArray = scheduleNoteArray[i]
      var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
      var classYear = datasplit[0]
      var classMonth = datasplit[1]
      var classDate = datasplit[2]
      var classHour = datasplit[3]
      var hourType = ""
      if(classHour == 24){
        var hourType = "오전"
        var classHour = 0
      }else if(classHour < 12){
        var hourType = "오전"
      }else{
        var hourType = "오후"
      }
      var classMinute = datasplit[4]
      var classDura = datasplit[5];
      var memberName = datasplit[6];
      if(memberName.length>3){
        var memberName = memberName.substr(0,3) + ".."
      }
      var classStartArr = [classYear,classMonth,classDate,classHour,classMinute]
      var classStart = classStartArr.join("_")
      var tdClassStart = $("#"+classStart+" div");
      var tdClass = $("#"+classStart);
      tdClass.parent('div').siblings('.fake_for_blankpage').css('display','none')

      if(scheduleFinishArray[i]=="0") {
          tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).attr('data-memo',memoArray).addClass('classTime').css({'height': Number(classDura * planheight + (classDura - 1)) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' +'<p class="hourType">' +hourType+'</p>' + classHour + ':' + classMinute + '</span>');
      }else {
          tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).attr('data-memo',memoArray).addClass('classTime classTime_checked').css({'height': Number(classDura * planheight + (classDura - 1)) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' + '<p class="hourType">' +hourType+'</p>' + classHour + ':' + classMinute + '</span>');
      }
      var hhh = Number(classHour)
      var mmm = classMinute

      for(var j=0; j<classDura/0.5; j++){
        if(mmm == 60){
          hhh = hhh + 1
          mmm = '00'
        }
        $('#'+classYear+'_'+classMonth+'_'+classDate+'_'+hhh+'_'+mmm).addClass('_on')
        mmm = Number(mmm) + 30
      }
    };
    $('#calendar').css('display','block');
};

function offTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
  var planheight = 60;
    if($calendarWidth>=600){
      var planheight = 60;
  }
  var offlen = offTimeArray.length;
  $('#calendar').css('display','none');
  for(var i=0; i<offlen; i++){
    var indexArray = offTimeArray[i]
    var memoArray = offScheduleNoteArray[i]
    var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
    var offYear = datasplit[0]
    var offMonth = datasplit[1]
    var offDate = datasplit[2]
    var offHour = datasplit[3]
    var hourType = ""
    if(offHour==24){
      var hourType = "오전"
      var offHour = 0
    }else if(offHour < 12){
      var hourType = "오전"
    }else{
      var hourType = "오후"
    }
    var offMinute = datasplit[4]
    var offDura = datasplit[5];
    var memberName = datasplit[6];

    if(Options.workStartTime>offHour && offDura > Options.workStartTime - offHour){
      var offHour = Options.workStartTime
      var offDura = offDura - (Options.workStartTime - offHour)
    } //만약 8시~23시까지 OFF로 설정해두고, 업무시간을 9~23시로 했을때 8시에 배치가 안되서 off일정이 안보이는 현상을 해결
    
    var offStartArr = [offYear,offMonth,offDate,offHour,offMinute]
    var offStart = offStartArr.join("_")
    var tdOffStart = $("#"+offStart+" div");
    var tdOff = $("#"+offStart);
    tdOff.parent('div').siblings('.fake_for_blankpage').css('display','none')
    
    tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).attr('data-memo',memoArray).addClass('offTime').css({'height':Number(offDura*planheight-1)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + offHour+':'+offMinute+'</span>');
    
    var hhh = Number(offHour)
    var mmm = offMinute

    for(var j=0; j<offDura/0.5; j++){
      if(mmm == 60){
        hhh = hhh + 1
        mmm = '00'
      }
      $('#'+offYear+'_'+offMonth+'_'+offDate+'_'+hhh+'_'+mmm).addClass('_on')
      mmm = Number(mmm) + 30
    }

  };
  $('#calendar').css('display','block');
};

function beforeSend(){
  $('html').css("cursor","wait");
  $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
  $('.ajaxloadingPC').show();
}

function completeSend(){
  $('html').css("cursor","auto");
  $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
  $('.ajaxloadingPC').hide();
}

function closeAddPopup(){
  $('body').css('overflow-y','overlay');
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
  $("#membersSelected button").removeClass("dropdown_selected").html("<span style='color:#cccccc;'>회원명 선택</span>").val("");

  //예약가능 횟수 내용 초기화
  $("#countsSelected,.countsSelected").text("")
  $('#remainCount_mini_text').hide()

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


function timeGraphSet(option,CSStheme, Page){ //가능 시간 그래프 채우기
  //1. option인자 : "class", "off"
  //2. CSS테마인자 : "grey", "pink"

  switch(option){
    case "class" :
      var DateDataArray = classDateData;
      var TimeDataArray = classTimeData;
      //$('.tdgraph_'+Options.hourunit+', .tdgraph_mini').removeClass('greytimegraph').removeClass('pinktimegraph')
      $('.tdgraph_'+Options.hourunit).removeClass('greytimegraph').removeClass('pinktimegraph').removeClass('pinktimegraph_pinkleft').removeClass('greytimegraph_greyleft')
    break;
    case "off" :
      var DateDataArray = offDateData;
      var TimeDataArray = offTimeData;
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
  var Arraylength = DateDataArray.length;
  for(var i=0;i<Arraylength;i++){
    var splitTimeArray = TimeDataArray[i].split("_")
    var targetTime = splitTimeArray[0]
    var targetMin = splitTimeArray[1]
    if(targetTime == 24){
      var targetTime = 0
    }
    var durTime = splitTimeArray[2]
    console.log(durTime)
    //if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime>=1 && durTime.indexOf('.')==-1){  //수업시간이 1시간 단위 일때 칸 채우기
        /*
        for(var j=0; j<durTime; j++){
          var time = Number(targetTime)+j
          if(j == 0){
            $('#'+(time)+'g_00'+option).addClass(cssClass)
            $('#'+(time)+'g_30'+option).addClass(cssClass_border)
          }else{
            $('#'+(time)+'g_00'+option + ',#'+(time)+'g_30'+option).addClass(cssClass_border)
          }
        }
        */
    //}else if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime>0 && durTime.indexOf('.')){ //수업시간이 0.5 단위일때
      if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime>0){ //수업시간이 0.5 단위일때
        var length = parseInt(durTime)
        if(length == 0){
          var length = 1;
        }
        //for(var j=0; j<length; j++){  // 1_30_1.5
        var time = Number(targetTime)
        var min =targetMin
        for(k=0; k<durTime/0.5; k++){
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
              console.log('#'+i+'g_00'+options,' | ','#'+i+'g_30'+options,' | ','#'+i+'g_00'+options,' | ','#'+i+'g_30'+options)
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

/*
function durTimeSet(selectedTime,selectedMin,option){ // durAddOkArray 채우기 : 진행 시간 리스트 채우기
  switch(option){
    case "class" :
    var durTimeList = $('#durations')
    break;
    case "off" :
    var durTimeList = $('#durations_off')
    break;
    case "mini" :
    var durTimeList = $('#durations_mini')
    break;
  }
  if(Options.language == "KOR"){
    var text1 = '오전'
    var text2 = '오후'
    var text3 = '시'
    var text4 = '시간'
  }else if(Options.language == "JPN"){
    var text1 = '午前'
    var text2 = '午後'
    var text3 = '時'
    var text4 = '時間'
  }else if(Options.language == "ENG"){
    var text1 = 'AM'
    var text2 = 'PM'
    var text3 = ':00'
    var text4 = 'h'
  }
  
  var len = offAddOkArray.length;
  var index = offAddOkArray.indexOf(Number(selectedTime)+Number(selectedMin)/60);
  var substr = offAddOkArray[index+1]-offAddOkArray[index];
  var classDur = Options.classDur/60

  durTimeList.html('')
  var t = 1
  console.log(offAddOkArray)
  //offAddOkArray =  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12.5, 13, 14, 18.5, 20, 21, 22, 23]
  //[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11.5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
  //[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22, 22.5, 23, 23.5]
  console.log(selectedTime,selectedMin)
  for(var j=index; j<len; j++){
      if(classDur == 1){
          var selectedHours = Number(selectedTime)+(j-index+classDur)
          if(selectedHours>12){
            if(selectedHours==24){
              var selectedHours = text1+' 12'
            }else{
              var selectedHours = text2+(selectedHours-12)  
            }
          }else if(selectedHours==12){
              var selectedHours = text2+' '+selectedHours
          }else{
              var selectedHours = text1+' '+selectedHours
          }
          if(offAddOkArray[j+1]-offAddOkArray[j]>1 && offAddOkArray[j+1]-offAddOkArray[j] != 1.5){
              if(selectedMin == "00"){
                durTimeList.append('<li><a data-dur="'+(t)+'" class="pointerList">'+(t)+text4+'  (~ '+selectedHours+':'+selectedMin+')'+'</a></li>')
                break;
              }else if(selectedMin == "30"){
                break;
              }
          }else if(offAddOkArray[j+1]-offAddOkArray[j] == 1.5){
              durTimeList.append('<li><a data-dur="'+(t)+'" class="pointerList">'+'선택 가능한 시간이 없습니다.'+'</a></li>')
              break;
          }else if(offAddOkArray[j+2]-offAddOkArray[j] == 2){
              durTimeList.append('<li><a data-dur="'+(t)+'" class="pointerList">'+'22'+'</a></li>')
              break;
          }else{
              durTimeList.append('<li><a data-dur="'+(t)+'" class="pointerList">'+(t)+text4+'  (~ '+selectedHours+':'+selectedMin+')'+'</a></li>')
          }
      }else if(classDur == 0.5){
          if(selectedMin == '30'){
            var selectedHours = Number(selectedTime)+(t)
          }else if(selectedMin == '00'){
            var selectedHours = Number(selectedTime)+(t)-0.5
          }
          var hour = parseInt(selectedHours)
          if(String(selectedHours).indexOf('.')!=-1){
            var minute = '30'
          }else{
            var minute = '00'
          }

          if(hour>12){
            if(hour==24){
              var hour = text1+' 12'
            }else{
              var hour = text2+(hour-12)  
            }
          }else if(hour==12){
              var hour = text2+' '+hour
          }else{
              var hour = text1+' '+hour
          }
          
          if(offAddOkArray[j+1]-offAddOkArray[j]>0.5){
            console.log(j)
                durTimeList.append('<li><a data-dur="'+(t-0.5)/0.5+'" class="pointerList">'+(t-0.5)+text4+'  (~ '+hour+':'+minute+')'+'</a></li>')
                break;
          }else{
            console.log(j)
              durTimeList.append('<li><a data-dur="'+(t-0.5)/0.5+'" class="pointerList">'+(t-0.5)+text4+'  (~ '+hour+':'+minute+')'+'</a></li>')
          }
      }
      t = t + classDur
  }
   durTimeList.append('<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>')
}*/


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
  


  /*
  var length = parseInt(durTime)
  if(length == 0){
    var length = 1;
  }
  //for(var j=0; j<length; j++){  // 1_30_1.5
      var time = Number(targetTime)
      var min =targetMin
      for(k=0; k<durTime/0.5; k++){
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
  */

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


function DBdataProcessMonthTrainer(){
    var len = classDateArray.length;
    var summaryArray ={}
    var summaryArrayResult = []

    var datasum = []
    for(var i=0; i<len; i++){ //객체화로 중복 제거
      summaryArray[classDateArray[i]] = classDateArray[i]
      datasum[i] = classDateArray[i]+"/"+classTimeArray_member_name[i]
    }
    for(var i in summaryArray){ //중복 제거된 배열
      summaryArrayResult.push(i)
    }

    var len2 = summaryArrayResult.length;

    for(var i=0; i<len2; i++){
      var scan = summaryArrayResult[i]
      countResult[i]=0
      for(var j=0; j<len; j++){
        var datesplit = datasum[j].split('/')
        if(scan == datesplit[0]){
          countResult[i] = countResult[i]+1
        }
      }
    }

    for(var i=0; i<summaryArrayResult.length; i++){
      var splited = summaryArrayResult[i].split("_")
      var yy = splited[0];
      var mm = splited[1];
      var dd = splited[2];
      dateResult[i] = yy+'_'+mm+'_'+dd
    }
}

function classDatesTrainer(){
  $('._classTime').html('')
  for(var i=0; i<dateResult.length; i++){
    var arr = dateResult[i].split('_')
    var yy = arr[0]
    var mm = arr[1]
    var dd = arr[2]
    var omm = String(oriMonth)
    var odd = String(oriDate)
    if(mm.length==1){
      var mm = '0'+arr[1]
    }
    if(dd.length==1){
      var dd='0'+arr[2]
    }
    if(omm.length==1){
      var omm = '0'+oriMonth
    }
    if(odd.length==1){
      var odd='0'+oriDate
    }
    if(yy+mm+dd < oriYear+omm+odd){  // 지난 일정은 회색으로, 앞으로 일정은 핑크색으로 표기
      $("td[data-date="+dateResult[i]+"]").attr('schedule-id',scheduleIdArray[i])
      $("td[data-date="+dateResult[i]+"] div._classTime").addClass('balloon_trainer').html('<img src="/static/user/res/icon-cal-mini.png">'+countResult[i])
      $("td[data-date="+dateResult[i]+"] div._classDate").addClass('greydateMytime')
    }else{
      $("td[data-date="+dateResult[i]+"]").attr('schedule-id',scheduleIdArray[i])
      $("td[data-date="+dateResult[i]+"] div._classTime").addClass('blackballoon_trainer').html('<img src="/static/user/res/icon-cal-mini.png">'+countResult[i])
      $("td[data-date="+dateResult[i]+"] div._classDate").addClass('dateMytime')
    }
  };
}

function send_push(push_server_id, intance_id, message, badge_counter){

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
                "title":"PT 일정 알림",
                "body":message,
                "badge": badge_counter,
                "sound": "default"
            }
        }),

      beforeSend:function(){
        console.log('test_ajax')

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