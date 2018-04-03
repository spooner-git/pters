$(document).ready(function(){

      //유저가 터치인지 마우스 사용인지 알아낸다
      var touch_or_mouse = ""
           window.addEventListener('touchstart',function(){
          touch_or_mouse = "touch"
      })
      //유저가 터치인지 마우스 사용인지 알아낸다

      DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateData,"graph",classTimeData)
      DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offDateData,"graph",offTimeData)

      var select_all_check = false;
      var offset_for_canvas;

      var date = new Date();
      var currentYear = date.getFullYear(); //현재 년도
      var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
      var currentDate = date.getDate(); //오늘 날짜
      var currentDay = date.getDay() // 0,1,2,3,4,5,6,7
      var currentHour = date.getHours();
      var currentMinute = date.getMinutes();

      $("#datepicker, #datepicker_repeat_start, #datepicker_repeat_end").datepicker({
              minDate : 0,
              onSelect : function(curDate, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
                if( curDate != instance.lastVal ){
                  $(this).parent('p').addClass("dropdown_selected");
                  if(addTypeSelect == "ptadd"){
                      //$("#id_training_date").val($("#datepicker").val()).submit();
                      $("#id_training_date").val($("#datepicker").val());
                      if($('#timeGraph').css('display')=='none'){
                        $('#timeGraph').show(110,"swing");
                      }
                      $('.tdgraph').removeClass('graphindicator')
                      clear_start_dur_dropdown()
                      ajaxTimeGraphSet()
                  }
                  else if(addTypeSelect =="offadd"){
                      //$("#id_training_date_off").val($("#datepicker").val()).submit();
                      $("#id_training_date_off").val($("#datepicker").val());
                      if($('#timeGraph').css('display')=='none'){
                        $('#timeGraph').show(110,"swing");
                      }
                      $('.tdgraph').removeClass('graphindicator')
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

      $(document).on('click','.td00',function(){ //주간달력 미니 팝업
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

            if(!$(this).find('div').hasClass('classTime') && !$(this).find('div').hasClass('offTime') && $('#page-addplan-pc').css('display','none')){
              $('.td00').css('background','transparent')
              closeMiniPopupByChange()
              $(this).find('div').addClass('blankSelected')
              $('#page-addplan-pc').fadeIn().css({'top':toploc,'left':leftloc+tdwidth})
              $('.typeSelected').removeClass('typeSelected')
              $('#typeSelector_'+addTypeSelect).addClass('typeSelected')
              if(addTypeSelect == "ptadd"){
                $('._MINI_ptadd').show()
                $('._MINI_offadd').hide()
              }else if(addTypeSelect == "offadd"){
                $('._MINI_offadd').show()
                $('._MINI_ptadd').hide()
              }
              var tdinfo = $(this).attr('id').split('_');
              var yy = tdinfo[0];
              var mm = tdinfo[1];
              var dd = tdinfo[2];
              var hh = tdinfo[3];
              var hh1 = Number(tdinfo[3])+1;
              var yy0 = tdinfo[0];
              var mm0 = tdinfo[1];
              var dd0 = tdinfo[2];
              if(yy0.length<2){var yy0 = '0'+String(tdinfo[0])};
              if(mm0.length<2){var mm0 = '0'+String(tdinfo[1])};
              if(dd0.length<2){var dd0 = '0'+String(tdinfo[2])};
              $('#datetext_mini').text(yy+'년 '+mm+'월 '+dd+'일 '+hh+':00 ~ '+hh1+':00').val(yy0+'-'+mm0+'-'+dd0)
              timeGraphSet("class","pink","mini");  //시간 테이블 채우기
              timeGraphSet("off","grey","mini")
              startTimeSet("mini");  //일정등록 가능한 시작시간 리스트 채우기
              $("#id_training_date").val(yy0+'-'+mm0+'-'+dd0)
              $("#id_training_time").val(hh+':00:00.000000');
              $("#id_time_duration").val(1)
              $("#id_training_date_off").val(yy0+'-'+mm0+'-'+dd0)
              $("#id_training_time_off").val(hh+':00:00.000000');
              durTimeSet(hh,"mini");
            }
      })

      if($('#calendar').width()<=600){
          $(document).off('click','.td00')
      }

      $('#typeSelector .toggleBtnWrap').click(function(){
          $('.blankSelected_addview').removeClass('blankSelected blankSelected_addview')
          $(this).addClass('typeSelected')
          $(this).siblings('.toggleBtnWrap').removeClass('typeSelected')
          if($(this).attr('id').split('_')[1]=="ptadd"){
              $('#classDuration_mini').hide('fast',function(){
                  $('#memberName_mini').css('display','inline')
                  $('#remainCount_mini').show('fast')
              })
              planAddView($("#id_time_duration").val())
          }else if($(this).attr('id').split('_')[1]=="offadd"){
              $('#memberName_mini').hide('fast')
              $('#remainCount_mini').hide('fast',function(){
                  $('#classDuration_mini').show('fast')
              })
              planAddView($("#id_time_duration_off").val())  
          }
          addTypeSelect = $(this).attr('id').split('_')[1]
          check_dropdown_selected();
          planAddView($("#id_time_duration").val())
      })

      $(document).on('click',"#durations_mini li a",function(){
          $("#classDuration_mini #durationsSelected button").addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-dur'));
          if(addTypeSelect == "ptadd"){ //Form 셋팅
            $("#id_time_duration").val($(this).attr('data-dur'));
            planAddView($(this).attr('data-dur'));
          }else if(addTypeSelect == "offadd"){
            $("#id_time_duration_off").val($(this).attr('data-dur'));
            planAddView($(this).attr('data-dur'));
          }
          check_dropdown_selected();
      });

      $('#memo_mini, #scheduleMemo input').keyup(function(){
        $('#id_memo_mini, #id_memo_mini_off').val($(this).val())
      })

      function planAddView(duration){ //미니팝업으로 진행시간 표기 미리 보기
          var selectedDuration = Number(duration)
          var selectedTime = $('.blankSelected').parent('.td00').attr('id').split('_')
          var yy = Number(selectedTime[0])
          var mm = Number(selectedTime[1])
          var dd = Number(selectedTime[2])
          var hh = Number(selectedTime[3])
          var mi = "00"
          $('.blankSelected_addview').removeClass('blankSelected blankSelected_addview')
          for(i=hh+1; i<hh+selectedDuration; i++){
            $('#'+yy+'_'+mm+'_'+dd+'_'+i+'_'+mi).find('div').addClass('blankSelected blankSelected_addview')
          }
      }

      function closeMiniPopupByChange(){
        $("#id_time_duration_off").val("")
        $('#page-addplan-pc').fadeOut();
        $('.td00').find('div').removeClass('blankSelected blankSelected_addview')
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
          $.ajax({
              url: '/trainer/read_member_lecture_data_from_schedule/',
              type:'POST',
              data: {"lecture_id": $(this).attr('data-lectureid'), "member_id": $(this).attr('data-memberid')},
              dataType : 'html',

              beforeSend:function(){
                  beforeSend(); //ajax 로딩이미지 출력
              },

              success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray)
                }else{
                  ptRepeatScheduleIdArray = jsondata.ptRepeatScheduleIdArray;
                  ptRepeatScheduleTypeArray = jsondata.ptRepeatScheduleTypeArray;
                  ptRepeatScheduleWeekInfoArray = jsondata.ptRepeatScheduleWeekInfoArray;
                  ptRepeatScheduleStartDateArray = jsondata.ptRepeatScheduleStartDateArray;
                  ptRepeatScheduleEndDateArray = jsondata.ptRepeatScheduleEndDateArray;
                  ptRepeatScheduleStartTimeArray = jsondata.ptRepeatScheduleStartTimeArray;
                  ptRepeatScheduleTimeDurationArray = jsondata.ptRepeatScheduleTimeDurationArray;
                  selectedMemberIdArray = jsondata.memberIdArray;
                  selectedMemberAvailCountArray = jsondata.memberAvailCountArray;
                  selectedMemberLectureIdArray = jsondata.memberLectureIdArray;
                  selectedMemberNameArray = jsondata.memberNameArray
                  fill_repeat_info('class');
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
                $('#errorMessageText').text('통신 에러: 관리자 문의')
              }
            })  
          $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).text());
          check_dropdown_selected();
  		}); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

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
            var repeat_time = Number(repeat_time_array[i].split(':')[0])+0
            var repeat_dur = repeat_dur_array[i]
            var repeat_sum = Number(repeat_time) + Number(repeat_dur)
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

            var summaryInnerBoxText_1 = '<span class="summaryInnerBoxText">'+repeat_type +' '+repeat_day() +' '+repeat_time+' ~ '+repeat_sum+'시 ('+repeat_dur +'시간)</span>'
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

      $(document).on('click','#starttimes li a',function(){
          $('.tdgraph').removeClass('graphindicator')
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
          durTimeSet(arry[0],"class");

          //진행시간 자동으로 1시간으로 Default 셋팅
          $("#durationsSelected .btn:first-child").val("").html("<span style='color:#cccccc;'>선택</span>");
          $('#durationsSelected button').addClass("dropdown_selected").text($('#durations li:first-child a').text()).val($('#durations li:first-child a').attr('data-dur'))
          if(addTypeSelect == "ptadd"){
            $("#id_time_duration").val($('#durationsSelected button').val());
            addGraphIndicator($('#durationsSelected button').val())
          }else if(addTypeSelect == "offadd"){
            console.log($('#durationsSelected button').val())
            $("#id_time_duration_off").val($('#durationsSelected button').val());
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
            $("#id_time_duration").val($(this).attr('data-dur'));
            addGraphIndicator($(this).attr('data-dur'))
          }else if(addTypeSelect == "offadd"){
            $("#id_time_duration_off").val($(this).attr('data-dur'));
            addGraphIndicator($(this).attr('data-dur'))
          }else if(addTypeSelect == "repeatptadd"){
            $("#id_repeat_dur").val($(this).attr('data-dur'));
          }else if(addTypeSelect == "repeatoffadd"){
            $("#id_repeat_dur_off").val($(this).attr('data-dur'));
          }
          check_dropdown_selected();
      }); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시


      $(document).on('click','#durationsSelected button',function(){
        $('.tdgraph').removeClass('graphindicator');
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
              if((memberSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
                  $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                  $('.submitBtn').addClass('submitBtnActivated')
                  select_all_check=true;
              }else if($('#page-addplan-pc').css('display')=='block' && (memberSelect).hasClass("dropdown_selected")==true){
                  $('#submitBtn_mini').css('background','#fe4e65');
                  select_all_check=true;
              }else{
                  $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                  $('.submitBtn').removeClass('submitBtnActivated')
                  $('#submitBtn_mini').css('background','#282828');
                  select_all_check=false;
              }
          }else if(addTypeSelect == "offadd"){
              if((dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true && (startSelect).hasClass("dropdown_selected")==true){
                  $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                  $('.submitBtn').addClass('submitBtnActivated')
                  select_all_check=true;
              }else if($('#page-addplan-pc').css('display')=='block' && durSelect_mini.hasClass("dropdown_selected")==true){
                  $('#submitBtn_mini').css('background','#fe4e65');
                  select_all_check=true;
              }else{
                  $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                  $('#submitBtn_mini').css('background','#282828');
                  $('.submitBtn').removeClass('submitBtnActivated')
                  select_all_check=false;
              }
          }else if(addTypeSelect == "repeatptadd"){
              if((memberSelect).hasClass("dropdown_selected")==true && (repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
                  $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                  $('.submitBtn').addClass('submitBtnActivated')
                  select_all_check=true;
              }else{
                  $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                  $('#submitBtn_mini').css('background','#282828');
                  $('.submitBtn').removeClass('submitBtnActivated')
                  select_all_check=false;
              }
          }else if(addTypeSelect == "repeatoffadd"){
              if((repeatSelect).hasClass("dropdown_selected")==true && (dateSelect_repeat_start).hasClass("dropdown_selected")==true && (dateSelect_repeat_end).hasClass("dropdown_selected")==true && (durSelect_repeat).hasClass("dropdown_selected")==true &&(startSelect_repeat).hasClass("dropdown_selected")==true){
                  $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                  $('.submitBtn').addClass('submitBtnActivated')
                  select_all_check=true;
              }else{
                  $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                  $('#submitBtn_mini').css('background','#282828');
                  $('.submitBtn').removeClass('submitBtnActivated')
                  select_all_check=false;
              }
          }
      }



      $("#upbutton-check, #submitBtn_pt, #submitBtn_mini").click(function(e){
         e.preventDefault();
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
            var $form = $('#add-repeat-schedule-form')
            var serverURL = '/schedule/add_repeat_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)
             console.log('test')
         }
         else if(addTypeSelect=="repeatoffadd"){
            var $form = $('#add-off-repeat-schedule-form')
            var serverURL = '/schedule/add_repeat_schedule/'
            var serializeArray = $form.serializeArray();
            var sendData = send_Data(serializeArray)
         }
        
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
                            if(RepeatDuplicationDateArray.length>0 && (addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatptadd")){
                              var date = RepeatDuplicationDateArray[0].replace(/\//gi,", ");
                                var total_count = Number(jsondata.repeatScheduleCounterArray[0])+RepeatDuplicationDateArray[0].split('/').length;
                              $('._repeatconfirmQuestion').text('선택한 일정 총 '+total_count+' 건 중 '+RepeatDuplicationDateArray[0].split('/').length + '건의 일정이 겹칩니다.');
                              var repeat_info = popup_repeat_confirm()
                              $('#repeat_confirm_day').text(RepeatDuplicationDateArray[0].replace(/\//gi,','))
                              $('#repeat_confirm_dur').text('중복 항목은 건너뛰고 등록하시겠습니까?')
                              $('#id_repeat_schedule_id_confirm').val(repeatArray)
                              completeSend(); //ajax 로딩 이미지 숨기기
                              $('#shade3').show()
                            }else if(RepeatDuplicationDateArray.length==0 && (addTypeSelect == "repeatoffadd" || addTypeSelect == "repeatptadd")){
                              var repeat_info = popup_repeat_confirm()
                              var day_info = repeat_info.day_info
                              var dur_info = repeat_info.dur_info
                              $('._repeatconfirmQuestion').text('총 '+jsondata.repeatScheduleCounterArray[0]+' 건의 일정이 등록됩니다.')
                              $('#repeat_confirm_day').text(day_info)
                              $('#repeat_confirm_dur').text(dur_info)
                              $('#id_repeat_schedule_id_confirm').val(repeatArray)
                              completeSend(); //ajax 로딩 이미지 숨기기
                              $('#shade3').show()
                            }else{
                              ajax_received_json_data(jsondata)
                              $('#calendar').show().css('height','100%')
                              if($('body').width()>=600){
                                  $('#calendar').css('position','relative')
                              }
                              closeAddPopup()
                              closeAddPopup_mini()
                              completeSend()
                              $('#shade').hide()
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
          alert('빠진 항목 체크해봐야함')
            //$('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
         }
      })

      //OFF반복일정 확인 팝업 "아니오" 눌렀을때 (선택지: 반복 설정 다시 하겠다)
      $('#btn_close_repeatconfirm, #popup_btn_repeatconfim_no').click(function(){
        $('#id_repeat_confirm').val(0);
        $('#cal_popup_repeatconfirm').fadeOut('fast');
        $('#shade3, #cal_popup_repeatconfirm').hide()
        ajaxRepeatConfirmSend();
      })
      
      //OFF반복일정 확인 팝업 "예" 눌렀을때 (선택지: 중복 무시하고 반복 넣겠다)
      $('#popup_btn_repeatconfirm_yes').click(function(){
        addTypeSelect = "ptadd"
        if($('body').width()>=600){
            $('#calendar').css('position','relative')
        }
        $('#id_repeat_confirm').val(1);
        $('#cal_popup_repeatconfirm').fadeOut('fast');
        $('#shade, #shade3, .popups').hide()
        $('#calendar').show().css('height','100%');
        ajaxRepeatConfirmSend();
        closeAddPopup();
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
        $("#float_btn").animate({opacity:'1'})
        if($('#shade').css('display')=='none'){
            $('#shade').show();
            $('#float_inner1').animate({'opacity':'1','bottom':'85px'},120);
            $('#float_inner2').animate({'opacity':'1','bottom':'145px'},120);
            $('#float_btn').addClass('rotate_btn');
        }else{
            $('#shade').hide();
            $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
            $('#float_btn').removeClass('rotate_btn');
        }

    }else if(option == 1){
        clear_pt_off_add_popup()
        scrollToDom($('#calendar'))
        addTypeSelect = "ptadd"
        $('#memberName,#remainCount').css('display','block');
        $('#page-addplan').fadeIn('fast');
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').fadeOut();
        $('#uptext2').text('PT 일정 등록')
        $('#page-base').fadeOut();
        $('#page-base-addstyle').fadeIn();
        //$("#datepicker").datepicker('setDate',null)

        $('#datepicker').datepicker('setDate', currentYear+'-'+currentMonth+'-'+currentDate)
        $('#datepicker').parent('p').addClass('dropdown_selected')
        $('#datepicker_repeat_start').datepicker('setDate', currentYear+'-'+currentMonth+'-'+currentDate)
        $('#datepicker_repeat_start').parent('p').addClass('dropdown_selected')
        $('#id_training_date').val($('#datepicker').val())
        $('#id_repeat_start_date_off').val($('#datepicker_repeat_start').val())
        if($('#timeGraph').css('display')=='none'){
          $('#timeGraph').show(110,"swing");
        }
        $('.tdgraph').removeClass('graphindicator')
        ajaxTimeGraphSet()

        if($('body').width()<600){
          $('#calendar').hide();
            $('#shade').hide()
          $('#shade3').fadeIn('fast');
          $('#calendar').css('height','0')
          $('#pcaddpopup,#pcaddpopup_off').css('display','none')
        }else{
          $('#calendar').css('position','fixed')
          $('#pcaddpopup').show()
          $('#shade').show()
        $('#pcaddpopup_off').hide()
        }
        if($(this).hasClass('ymdText-pc-add-pt')){
          $('#shade').fadeIn('fast')
        }
        
    }else if(option ==2){
        clear_pt_off_add_popup()
        scrollToDom($('#calendar'))
        addTypeSelect = "offadd"
        $('#memberName,#remainCount').css('display','none');
        $('#page-addplan').fadeIn('fast');
        $('#uptext2').text('OFF 일정 등록')
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').fadeOut();
        $('#page-base').fadeOut();
        $('#page-base-addstyle').fadeIn();
        //$("#datepicker").datepicker('setDate',null)

        $('#datepicker').datepicker('setDate', currentYear+'-'+currentMonth+'-'+currentDate)
        $('#datepicker').parent('p').addClass('dropdown_selected')
        $('#datepicker_repeat_start').datepicker('setDate', currentYear+'-'+currentMonth+'-'+currentDate)
        $('#datepicker_repeat_start').parent('p').addClass('dropdown_selected')
        $('#id_training_date_off').val($('#datepicker').val())
        $('#id_repeat_start_date_off').val($('#datepicker_repeat_start').val())
        if($('#timeGraph').css('display')=='none'){
          $('#timeGraph').show(110,"swing");
        }
        $('.tdgraph').removeClass('graphindicator')
        ajaxTimeGraphSet()

        if($('body').width()<600){
          $('#calendar').hide();
            $('#shade').hide()
          $('#shade3').fadeIn('fast');
          $('#calendar').css('height','0')
          $('#pcaddpopup,#pcaddpopup_off').css('display','none')
        }else{
          $('#calendar').css('position','fixed')
          $('#pcaddpopup').hide()
          $('#pcaddpopup_off').show()
          $('#shade').show()
        }

        if($(this).hasClass('ymdText-pc-add-off')){
          $('#shade').fadeIn('fast')
        }
    }
}

//회원 정보 ajax 연동을 위해 구현 - hk.kim 180110
function addPtMemberListSet(){
  var memberMobileList = $('#members_mobile');
  var memberPcList = $('#members_pc');
  var memberSize = memberIdArray.length;
  var member_array_mobile = [];
  var member_array_pc = [];
  memberMobileList.empty();
  memberPcList.empty();
  for(var i=0; i<memberSize; i++){
    //member_array[i] = '<li><a data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>';
    member_array_mobile[i] = '<li><a id="member_mobile_'+memberLectureIdArray[i]+'" data-lecturecount="'+memberAvailCountArray[i]+'" data-memberid="'+memberIdArray[i]+'" data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>';
    member_array_pc[i] = '<li><a id="member_pc_'+memberLectureIdArray[i]+'" data-lecturecount="'+memberAvailCountArray[i]+'" data-memberid="'+memberIdArray[i]+'" data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>';
    //memberPcList.append('<li><a data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>');
  //memberMobileList.append('<li><a data-lecturecount="'+memberAvailCountArray[i]+'"data-lectureid='+memberLectureIdArray[i]+'>'+memberNameArray[i]+'</a></li>');

  }
  var member_arraySum_mobile = member_array_mobile.join('');
  var member_arraySum_pc = member_array_pc.join('');
  memberMobileList.html(member_arraySum_mobile);
  memberPcList.html(member_arraySum_pc);
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

function ajaxClassTime(){
      $.ajax({
        url: '/trainer/cal_day_ajax',
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
        data : {"date":today_form, "day":1}, //월간 46 , 주간 18, 하루 1
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
    
    $('.blankSelected_addview').removeClass('blankSelected')

    //월간 달력
    DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateArray,'member',classStartArray)
    DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classNameArray,'class')
    DBdataProcessMonthTrainer();
    classDatesTrainer();
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
    $('#shade3').show()
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

/*
function classTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
  var location = $('meta[name="description"]').attr('content')
  switch(location){
    case "daycal" :
      var classlen = classTimeArray.length;
      //$('#calendar').css('display','none');
      for(var i=0; i<classlen; i++){
        var indexArray = classTimeArray[i]
        var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
        var classYear = datasplit[0]
        var classMonth = datasplit[1]
        var classDate = datasplit[2]
        var classHour = datasplit[3]
        var classMinute = datasplit[4]
        var classDura = datasplit[5];
        var memberName = datasplit[6];
        var classEndHour = datasplit[7];
        var classEndMinute = datasplit[8];
        var classStartArr = [classYear,classMonth,classDate,classHour,classMinute]
        var classStart = classStartArr.join("_")
        //var classStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
        var tdClassStart = $("#"+classStart+" div");
        var tdClass = $("#"+classStart);
        tdClass.parent('div').siblings('.fake_for_blankpage').css('display','none')
        //schedule-id 추가 (일정 변경 및 삭제를 위함) hk.kim, 171007
        if(Number(classHour)+Number(classDura)==25){  // 오전 1시에 일정이 차있을 경우 일정 박스가 Table 넘어가는 것 픽스
            if(classDura<=3){
              if(scheduleFinishArray[i]=="0") {
                tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-schedule-check', scheduleFinishArray[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('classTime').css({'height': Number(classDura * 35) + 'px'}).html('<span class="memberName' + classDura + '">' + memberName + ' </span>' + '<span class="memberTime' + classDura + '">' + classHour + ':' + classMinute + ' ~ ' + classEndHour + ':' + classEndMinute + '</span>');
              }else{
                tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-schedule-check', scheduleFinishArray[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('classTime').css({'height': Number(classDura * 35) + 'px'}).css('background-color','#282828').html('<span class="memberName' + classDura + '">' + memberName + ' </span>' + '<span class="memberTime' + classDura + '">' + classHour + ':' + classMinute + ' ~ ' + classEndHour + ':' + classEndMinute + '</span>');
              }
            }else{
              if(scheduleFinishArray[i]=="0") {
                tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
              }else{
                tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35)+'px'}).css('background-color','#282828').html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
              }
            }
          }else{
            if(classDura<=3){
              if(scheduleFinishArray[i]=="0") {
                tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px'}).html('<span class="memberName'+classDura+'">'+memberName+' </span>'+'<span class="memberTime'+classDura+'">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
              }else{
                tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px'}).css('background-color','#282828').html('<span class="memberName'+classDura+'">'+memberName+' </span>'+'<span class="memberTime'+classDura+'">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
              }
            }else{
              if(scheduleFinishArray[i]=="0") {
                tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
              }else{
                tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px'}).css('background-color','#282828').html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
              }

            }
          }
       };
      //$('#calendar').css('display','block');
    break;

    case "weekcal" :
      var planheight = 30;
      var $calendarWidth = $('#calendar').width(); //현재 달력 넓이계산 --> classTime과 offTime 크기조정을 위해
      if($calendarWidth>=600){
        var planheight = 43;
      }
      var classlen = classTimeArray.length;
      //$('#calendar').css('display','none');
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
        //var classStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
        var tdClassStart = $("#"+classStart+" div");
        var tdClass = $("#"+classStart);
        tdClass.parent('div').siblings('.fake_for_blankpage').css('display','none')
        //schedule-id 추가 (일정 변경 및 삭제를 위함) hk.kim, 171007
        
        //tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*planheight-1)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+classHour+':'+classMinute+'</span>');
        if(scheduleFinishArray[i]=="0") {
           tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).attr('data-memo',memoArray).addClass('classTime').css({'height': Number(classDura * planheight - 1) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' + '<p class="hourType">' +hourType+'</p>' + classHour + ':' + classMinute + '</span>');
        }else {
           tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('classTime classTime_checked').css({'height': Number(classDura * planheight - 1) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' + '<p class="hourType">' +hourType+'</p>' +classHour + ':' + classMinute + '</span>');
        }
      };
      //$('#calendar').css('display','block');
      break;
  }
};

function offTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
  var location = $('meta[name="description"]').attr('content')
  switch(location){
    case "daycal":
        var offlen = offTimeArray.length;
        //$('#calendar').css('display','none');
        for(var i=0; i<offlen; i++){
          var indexArray = offTimeArray[i]
          var memoArray = scheduleNoteArray[i]
          var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
          var offYear = datasplit[0]
          var offMonth = datasplit[1]
          var offDate = datasplit[2]
          var offHour = datasplit[3]
          var hourType = ""
          var offMinute = datasplit[4]
          var offDura = datasplit[5];
          var memberName = datasplit[6];
          var offEndHour = datasplit[7];
          var offEndMinute = datasplit[8];
          var offStartArr = [offYear,offMonth,offDate,offHour,offMinute]
          var offStart = offStartArr.join("_")
          //var offStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
          var tdOffStart = $("#"+offStart+" div");
          var tdOff = $("#"+offStart);
          tdOff.parent('div').siblings('.fake_for_blankpage').css('display','none')
          if(Number(offHour)+Number(offDura)==25){  // 오전 1시에 일정이 차있을 경우 일정 박스가 Table 넘어가는 것 픽스
            if(offDura<=3){
            tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*35)+'px'}).html('<span class="memberName'+offDura+'">'+memberName+' </span>'+'<span class="offTimeText'+offDura+'">'+offHour+':'+offMinute+' ~ '+offEndHour+':'+offEndMinute+'</span>');      
            }else{
            tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*35)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="offTimeText3">'+offHour+':'+offMinute+' ~ '+offEndHour+':'+offEndMinute+'</span>');
            }
          }else{
            if(offDura<=3){
            tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*35.5)+'px'}).html('<span class="memberName'+offDura+'">'+memberName+' </span>'+'<span class="offTimeText'+offDura+'">'+offHour+':'+offMinute+' ~ '+offEndHour+':'+offEndMinute+'</span>');      
            }else{
            tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*35.5)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="offTimeText3">'+offHour+':'+offMinute+' ~ '+offEndHour+':'+offEndMinute+'</span>');
            } 
          }
        };
        //$('#calendar').css('display','block');
    break;
    
    case "weekcal":
        var planheight = 30;
        var $calendarWidth = $('#calendar').width(); //현재 달력 넓이계산 --> classTime과 offTime 크기조정을 위해
        if($calendarWidth>=600){
          var planheight = 46;
        }
        var offlen = offTimeArray.length;
        //$('#calendar').css('display','none');
        for(var i=0; i<offlen; i++){
          var indexArray = offTimeArray[i]
          var memoArray = offScheduleNoteArray[i]
          var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
          var offYear = datasplit[0]
          var offMonth = datasplit[1]
          var offDate = datasplit[2]
          var offHour = datasplit[3]
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
          var offStartArr = [offYear,offMonth,offDate,offHour,offMinute]
          var offStart = offStartArr.join("_")
          //var offStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
          var tdOffStart = $("#"+offStart+" div");
          var tdOff = $("#"+offStart);
          tdOff.parent('div').siblings('.fake_for_blankpage').css('display','none')
          
          tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).attr('data-memo',memoArray).addClass('offTime').css({'height':Number(offDura*planheight-1)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + offHour+':'+offMinute+'</span>');
        };
        //$('#calendar').css('display','block');
    break;
  }
}
*/

function classTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
    var planheight = 30;
      if($calendarWidth>=600){
        //var planheight = 46;
        var planheight = 43;
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
                tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).attr('data-memo',memoArray).addClass('classTime').css({'height': Number(classDura * planheight - 1) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' +'<p class="hourType">' +hourType+'</p>' + classHour + ':' + classMinute + '</span>');
            }else {
                tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-memberName', memberName).attr('class-time', indexArray).attr('data-memo',memoArray).addClass('classTime classTime_checked').css({'height': Number(classDura * planheight - 1) + 'px'}).html('<span class="memberName">' + memberName + ' </span>' + '<span class="memberTime">' + '<p class="hourType">' +hourType+'</p>' + classHour + ':' + classMinute + '</span>');
            }
    };
    $('#calendar').css('display','block');
};

function offTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
  var planheight = 30;
    if($calendarWidth>=600){
      var planheight = 46;
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
  };
  $('#calendar').css('display','block');
};

function beforeSend(){
  $('#shade3').show();
  $('html').css("cursor","wait");
  $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
  $('.ajaxloadingPC').show();
}

function completeSend(){
  $('html').css("cursor","auto");
  $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
  $('.ajaxloadingPC').hide();
  $('#shade3').hide();
}

function closeAddPopup(){
  $('body').css('overflow-y','overlay');
  $('#shade3').hide();
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

  $('.tdgraph').removeClass('graphindicator')
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
  for(i=0;i<=23;i++){
    if(!$('#'+i+'g'+option).hasClass('pinktimegraph') == true && !$('#'+i+'g'+option).hasClass('greytimegraph') == true){
      offAddOkArray.push(i);
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

  var offOkLen = offAddOkArray.length
  var startTimeList = $('#starttimes'+options);
  var timeArray = [];
  for(var i=0; i<offOkLen; i++){
    var offHour = offAddOkArray[i];
    if(offHour<12){
      var offText = '오전 '
      var offHours = offHour;
    }else if(offHour==24){
      var offText = '오전 '
      var offHours = offHour-12
    }else if(offHour==12){
      var offText = '오후 '
      var offHours = offHour
    }else{
      var offHours = offHour-12
      var offText = '오후 '
    }
    if(offHour.length<2){
      timeArray[i] ='<li><a data-trainingtime="'+'0'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+'시'+'</a></li>'
    }else{
      timeArray[i] ='<li><a data-trainingtime="'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+'시'+'</a></li>'
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
    $('.tdgraph,.tdgraph_mini').removeClass('greytimegraph').removeClass('pinktimegraph')  
    break;
    case "off" :
      var DateDataArray = offDateData;
      var TimeDataArray = offTimeData;
    break;
  }

  switch(CSStheme){
    case "grey" :
      var cssClass = "greytimegraph"
    break;
    case "pink" :
      var cssClass= "pinktimegraph"
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
    if(targetTime == 24){
      var targetTime = 0
    }
    var durTime = splitTimeArray[2]
    if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime>1){  //수업시간이 2시간 이상일때 칸 채우기
        for(var j=0; j<durTime; j++){
          var time = Number(targetTime)+j
          $('#'+(time)+'g'+option).addClass(cssClass)
        }
    }else if(date_format_yyyy_m_d_to_yyyy_mm_dd(DateDataArray[i],'-') == date && durTime==1){ //수업시간이 1시간짜리일때 칸 채우기
        $('#'+targetTime+'g'+option).addClass(cssClass)
    }
  }
  
  /*업무시간 설정*/
  for(var j=0; j<Options.workStartTime; j++){
    $('#'+j+'g'+option).addClass('greytimegraph')
  }
  for(var t=Options.workEndTime; t<24; t++){
    $('#'+t+'g'+option).addClass('greytimegraph')
  }
  /*업무시간 설정*/

  //timeGraphLimitSet(Options.limit)
}

function durTimeSet(selectedTime,option){ // durAddOkArray 채우기 : 진행 시간 리스트 채우기
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
  var len = offAddOkArray.length;
  var index = offAddOkArray.indexOf(Number(selectedTime));
  var substr = offAddOkArray[index+1]-offAddOkArray[index];
 if(substr>1){
    var fininfo = Number(selectedTime)+1
    if(fininfo>12){
       if(fininfo==25){
         var fininfo = '오전 1'
       }else if(fininfo==24){
         var fininfo = '오전 12'
       }else{
         var fininfo = '오후'+(fininfo-12)  
       }
     }else if(fininfo==12){
       var fininfo = '오후'+fininfo  
     }else{
       var fininfo = '오전'+fininfo
     }
    durTimeList.html('<li><a data-dur="1" class="pointerList">1시간'+' (~'+fininfo+'시)'+'</a></li>')
  
  }else{

    durTimeList.html('')
    for(var j=index; j<=len; j++){
      
      var fininfo = Number(selectedTime)+(j-index+1)
      if(fininfo>12){
        if(fininfo==25){
          var fininfo = '오전 1'
        }else if(fininfo==24){
          var fininfo = '오전 12'
        }else{
          var fininfo = '오후'+(fininfo-12)  
        }
      }else if(fininfo==12){
        var fininfo = '오후'+fininfo  
      }else{
        var fininfo = '오전'+fininfo
      }

      if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
        durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>') 
      }
      else if(offAddOkArray[j-1]== null && offAddOkArray[j+1]-offAddOkArray[j]==1){
        durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
      }
      else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
        durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
      }
      else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]>=2){
        durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
        break;
      }
      else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1] == null){
        durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
        //break;
      }
      else if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1] == null){
        durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
      }
      else if(offAddOkArray[j-1]==null && offAddOkArray[j+1] == null){
        durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간'+'  (~'+fininfo+'시)'+'</a></li>')
      }
    }
  }
   durTimeList.append('<div><img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;"></div>')
}

function addGraphIndicator(datadur){
  $('.tdgraph').removeClass('graphindicator');
  var starttext = $('#starttimesSelected button').val().split(' ');
  var daymorning = starttext[0];
  var startnum = starttext[1].replace(/시/gi,"")
  if(daymorning=='오후'){
    if(startnum==12){
      var startnum = startnum
    }else{
      var startnum = Number(startnum)+12  
    }
  }else if(daymorning=='오전' && startnum==12){
      var startnum = Number(startnum)+12 
  }
  var durnum = datadur
  var finnum = Number(startnum)+Number(durnum)
  for(var i=startnum; i<finnum; i++){
    $('#'+i+'g').addClass('graphindicator')
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

