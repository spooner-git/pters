$(document).ready(function(){

      var Options = {
                        "limit": 1, // 현재시간으로부터 몇시간뒤에 일정 추가가능하게 할지 셋팅
                    }

/*     
      var classDateData = []
      var classTimeData = []
      var offDateData=[]
      var offTimeData = []
      var offAddOkArray = [] //OFF 등록 시작 시간 리스트
      var durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트
*/
      DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateData,"graph",classTimeData)
      DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offDateData,"graph",offTimeData)


    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd',
        prevText: '이전 달',
        nextText: '다음 달',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년',
    });

      $("#datepicker_off").datepicker({
          minDate : 0,
          onSelect : function(curDate, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
            if( curDate != instance.lastVal ){
              $("#dateSelector_off p").addClass("dropdown_selected");
              $("#id_training_date_off").val($("#datepicker_off").val()).submit();
              if($('#timeGraph_off').css('display')=='none'){
                $('#timeGraph_off').show(110,"swing");
              }
              timeGraphSet("class","grey");  //시간 테이블 채우기
              timeGraphSet("off","grey")
              $('.tdgraph').removeClass('graphindicator')
              startTimeSet();  //일정등록 가능한 시작시간 리스트 채우기
              check_dropdown_selected();
            }
          }
      });

      var select_all_check = false;
      //달력 선택된 날짜
      //출력 예시 : Fri Sep 08 2017 00:00:00 GMT+0900 (대한민국 표준시)

      $(document).on('click','#starttimes_off li a',function(){
          $('.tdgraph').removeClass('graphindicator')
          $("#starttimesSelected_off button").addClass("dropdown_selected");
          $("#starttimesSelected_off .btn:first-child").text($(this).text());
          $("#starttimesSelected_off .btn:first-child").val($(this).text());
          $("#id_training_time_off").val($(this).attr('data-trainingtime'));
          var arry = $(this).attr('data-trainingtime').split(':')
          durTimeSet(arry[0]);
          $("#durationsSelected_off button").removeClass("dropdown_selected");
          $("#durationsSelected_off .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
          $("#durationsSelected_off .btn:first-child").val("");
          check_dropdown_selected();
      })

      $(document).on('click',"#durations_off li a",function(){
          $("#durationsSelected_off button").addClass("dropdown_selected");
          $("#durationsSelected_off .btn:first-child").text($(this).text());
          $("#durationsSelected_off .btn:first-child").val($(this).attr('data-dur'));
          $("#id_time_duration_off").val($(this).attr('data-dur'));
          check_dropdown_selected();
          addGraphIndicator($(this).attr('data-dur'))
      }); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $(document).on('click','#durationsSelected_off button',function(){
        $('.tdgraph').removeClass('graphindicator');
      })

      $(document).on('click','button',function(){
         //scrollToIndicator($(this))
      })

       function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
       	 //var memberSelect = $("#membersSelected button");
       	 var dateSelect = $("#dateSelector_off p");
       	 var durSelect = $("#durationsSelected_off button");
       	 var startSelect = $("#starttimesSelected_off button")
       		 if((dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
        	    $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            	$('.submitBtn').addClass('submitBtnActivated')
              select_all_check=true;
        	}else{
              $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
           	  $('.submitBtn').removeClass('submitBtnActivated')
              select_all_check=false;
       		}
    	 }

      $("#upbutton-check, #submitBtn_off").click(function(){
        var $form = $('#off-add-form')
        
         if(select_all_check==true){
             //document.getElementById('off-add-form').submit();
            //ajax 회원정보 입력된 데이터 송신
                 $.ajax({
                    url:'/trainer/add_off_logic/',
                    type:'POST',
                    data:$form.serialize(),

                    beforeSend:function(){
                      beforeSend_off();
                    },

                    //통신성공시 처리
                    success:function(){
                      $('#calendar').css('height','100%')
                      completeSend_off();
                      closeAddPopup_off();
                      ajaxClassTime();
                    },

                    //보내기후 팝업창 닫기
                    complete:function(){
                      
                    },

                    //통신 실패시 처리
                    error:function(){
                      alert("error: 서버와 통신 실패")
                    },
                 })
         }else{
            //$('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
         }
     })

      function ajaxClassTime(){
      
            $.ajax({
              url: '/trainer/get_trainer_schedule',
              dataType : 'html',

              beforeSend:function(){
                  beforeSend_off();
              },

              success:function(data){
                var jsondata = JSON.parse(data);
                classTimeArray = [];
                offTimeArray = [];
                classTimeArray_member_name = [];
                classArray_lecture_id = [];
                scheduleIdArray = [];
                offScheduleIdArray = [];
                var updatedClassTimeArray_start_date = jsondata.classTimeArray_start_date
                var updatedClassTimeArray_end_date = jsondata.classTimeArray_end_date
                var updatedOffTimeArray_start_date = jsondata.offTimeArray_start_date
                var updatedOffTimeArray_end_date = jsondata.offTimeArray_end_date
                classTimeArray_member_name = jsondata.classTimeArray_member_name
                classArray_lecture_id = jsondata.classArray_lecture_id
                scheduleIdArray = jsondata.scheduleIdArray
                offScheduleIdArray = jsondata.offScheduleIdArray
                DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classTimeArray,"class");
                DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offTimeArray,"off");
                $('.classTime,.offTime').parent().html('<div></div>')
                classTime();
                offTime();

                /*팝업의 timegraph 업데이트*/
                classDateData = []
                classTimeData = []
                offDateData=[]
                offTimeData = []
                offAddOkArray = [] //OFF 등록 시작 시간 리스트
                durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트
                DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateData,"graph",classTimeData)
                DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offDateData,"graph",offTimeData)
              },

              complete:function(){
                completeSend_off();
                
              },

              error:function(){
                console.log('server error')
              }
            })    
     }

     function classTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
      var location = $('meta[name="description"]').attr('content')
      switch(location){
        case "daycal" :
          var classlen = classTimeArray.length;
          $('#calendar').css('display','none');
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
            //schedule-id 추가 (일정 변경 및 삭제를 위함) hk.kim, 171007
            if(Number(classHour)+Number(classDura)==25){  // 오전 1시에 일정이 차있을 경우 일정 박스가 Table 넘어가는 것 픽스
              if(classDura<=3){
                tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35)+'px'}).html('<span class="memberName'+classDura+'">'+memberName+' </span>'+'<span class="memberTime'+classDura+'">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
              }else{
                tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
              }
            }else{
              if(classDura<=3){
                tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px'}).html('<span class="memberName'+classDura+'">'+memberName+' </span>'+'<span class="memberTime'+classDura+'">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
              }else{
                tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
              }
            }
          };
          $('#calendar').css('display','block');
        break;

        case "weekcal" :
          var planheight = 30;
          var $calendarWidth = $('#calendar').width(); //현재 달력 넓이계산 --> classTime과 offTime 크기조정을 위해
          if($calendarWidth>=600){
            var planheight = 45;
          }
          var classlen = classTimeArray.length;
          $('#calendar').css('display','none');
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
          if(memberName.length>3){
            var memberName = memberName.substr(0,3) + ".."
          }
          var classStartArr = [classYear,classMonth,classDate,classHour,classMinute]
          var classStart = classStartArr.join("_")
          //var classStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
          var tdClassStart = $("#"+classStart+" div");
          //schedule-id 추가 (일정 변경 및 삭제를 위함) hk.kim, 171007
          
          tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*planheight-1)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+classHour+':'+classMinute+'</span>');
           };
          $('#calendar').css('display','block');
          break;
      }
     };

     function offTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
      var location = $('meta[name="description"]').attr('content')
      switch(location){
        case "daycal":
            var offlen = offTimeArray.length;
            $('#calendar').css('display','none');
            for(var i=0; i<offlen; i++){
              var indexArray = offTimeArray[i]
              var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
              var offYear = datasplit[0]
              var offMonth = datasplit[1]
              var offDate = datasplit[2]
              var offHour = datasplit[3]
              var offMinute = datasplit[4]
              var offDura = datasplit[5];
              var memberName = datasplit[6];
              var offEndHour = datasplit[7];
              var offEndMinute = datasplit[8];
              var offStartArr = [offYear,offMonth,offDate,offHour,offMinute]
              var offStart = offStartArr.join("_")
              //var offStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
              var tdOffStart = $("#"+offStart+" div");
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
            $('#calendar').css('display','block');
        break;
        
        case "weekcal":
            var planheight = 30;
            var $calendarWidth = $('#calendar').width(); //현재 달력 넓이계산 --> classTime과 offTime 크기조정을 위해
            if($calendarWidth>=600){
              var planheight = 45;
            }
            var offlen = offTimeArray.length;
            $('#calendar').css('display','none');
            for(var i=0; i<offlen; i++){
              var indexArray = offTimeArray[i]
              var datasplit = indexArray.split('_');  //2017_8_15_6_00_3
              var offYear = datasplit[0]
              var offMonth = datasplit[1]
              var offDate = datasplit[2]
              var offHour = datasplit[3]
              var offMinute = datasplit[4]
              var offDura = datasplit[5];
              var memberName = datasplit[6];
              var offStartArr = [offYear,offMonth,offDate,offHour,offMinute]
              var offStart = offStartArr.join("_")
              //var offStart = datasplit[0]+'_'+datasplit[1]+'_'+datasplit[2]+'_'+datasplit[3]+'_'+datasplit[4];
              var tdOffStart = $("#"+offStart+" div");
              
              tdOffStart.attr('off-time',indexArray).attr('off-schedule-id',offScheduleIdArray[i]).addClass('offTime').css({'height':Number(offDura*planheight-1)+'px'}).html('<span class="memberName">'+memberName+' </span>'+'<span class="memberTime">'+offHour+':'+offMinute+'</span>');
            };
            $('#calendar').css('display','block');
        break;
      }
     };

      function beforeSend_off(){
        // $('html').css("cursor","wait");
        $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
        $('.ajaxloadingPC').show();
        $('#shade').css({'z-index':'200'});
     }

     function completeSend_off(){
        //$('html').css("cursor","auto");
        $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
        $('.ajaxloadingPC').hide();
        $('#shade').css({'z-index':'100'});
        $('#shade').hide();
        //$('#calendar').show();
        
     }

      function closeAddPopup_off(){
        $('body').css('overflow-y','overlay')
        $('#shade3').hide();
        $('#page-ptadd').hide('fast','swing');
        $('#page-offadd').hide('fast','swing');
        $('#float_btn_wrap').fadeIn();
        $('#float_btn').removeClass('rotate_btn');
        $('#page-base').fadeIn();
        $('#page-base-addstyle').hide();
        $('.submitBtn').removeClass('submitBtnActivated');

        $("#membersSelected button").removeClass("dropdown_selected");
        $("#membersSelected .btn:first-child").html("<span style='color:#cccccc;'>회원명 선택</span>");
        $("#membersSelected .btn:first-child").val("");
        $("#countsSelected").text("")
        $("#dateSelector p").removeClass("dropdown_selected");
        $('#timeGraph').hide();
        $("#starttimesSelected button").removeClass("dropdown_selected");
        $("#starttimesSelected .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
        $("#starttimesSelected .btn:first-child").val("");
        $("#durationsSelected button").removeClass("dropdown_selected");
        $("#durationsSelected .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
        $("#durationsSelected .btn:first-child").val("");
        $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
        $("#starttimes").empty();
        $("#durations").empty();

        $("#dateSelector_off p").removeClass("dropdown_selected");
        $('#timeGraph_off').hide();
        $("#starttimesSelected_off button").removeClass("dropdown_selected");
        $("#starttimesSelected_off .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
        $("#starttimesSelected_off .btn:first-child").val("");
        $("#durationsSelected_off button").removeClass("dropdown_selected");
        $("#durationsSelected_off .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
        $("#durationsSelected_off .btn:first-child").val("");
        $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
        $("#starttimes_off").empty();
        $("#durations_off").empty();
     }


      function startTimeSet(){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21];
        startTimeArraySet(); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
        var offOkLen = offAddOkArray.length
        var startTimeList = $('#starttimes_off');
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
        timeArray[offOkLen]='<li><a data-trainingtime="dummy" class="pointerList">'+'<img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;">'+'</a></li>'
        var timeArraySum = timeArray.join('')
        startTimeList.html(timeArraySum)
      }


      function DBdataProcess(startarray,endarray,result,option,result2){ //result2는 option이 member일때만 사용
      //DB데이터 가공
        var classTimeLength = startarray.length
        var startlength = startarray.length;
        var endlength = endarray.length;
        var resultarray = []

        for(i=0;i<classTimeLength; i++){
          var start = startarray[i].replace(/년 |월 |일 |:| /gi,"_");
          var end = endarray[i].replace(/년 |월 |일 |:| /gi,"_");
          var startSplitArray= start.split("_"); 
          var endSplitArray = end.split("_");
          //["2017", "10", "7", "6", "00", "오전"]
     
          if(startSplitArray[5]=="오후" && startSplitArray[3]!=12){
            startSplitArray[3] = String(Number(startSplitArray[3])+12);
          }

          if(endSplitArray[5]=="오후" && endSplitArray[3]!=12){
            endSplitArray[3] = String(Number(endSplitArray[3])+12); 
          }

          if(startSplitArray[5]=="오전" && startSplitArray[3]==12){
            startSplitArray[3] = String(Number(startSplitArray[3])+12); 
          }

          if(endSplitArray[5]=="오전" && endSplitArray[3]==12){
            endSplitArray[3] = String(Number(endSplitArray[3])+12); 
          }
          
          var dura = endSplitArray[3] - startSplitArray[3];  //오전 12시 표시 일정 표시 안되는 버그 픽스 17.10.30
          if(dura>0){
            startSplitArray[5] = String(dura) 
          }else{
            startSplitArray[5] = String(dura+24)
          }

          if(option=="class"){
            startSplitArray.push(classTimeArray_member_name[i]) 
            result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+startSplitArray[6]+"_"+endSplitArray[3]+"_"+endSplitArray[4]);
          }else if(option=="off"){
            startSplitArray.push(classTimeArray_member_name[i]) 
            result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+"OFF"+"_"+endSplitArray[3]+"_"+endSplitArray[4]);   
          }else if(option=="member"){
            result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]);    
            result2.push(startSplitArray[3]+":"+startSplitArray[4]);
          }else if(option=="graph"){
            var mm = startSplitArray[1]
              var dd = startSplitArray[2]
              if(mm.length<2){
                var mm = '0'+startSplitArray[1]
              }
              if(dd.length<2){
                var dd = '0'+startSplitArray[2]
              }
              result.push(startSplitArray[0]+"-"+mm+"-"+dd); //2017_10_7
              result2.push(startSplitArray[3]+"_"+startSplitArray[4] +"_"+ startSplitArray[5]); //6_00_2  
            
          }
        }
      }

      /*
      function timeGraphSet(option,CSStheme){ //가능 시간 그래프 채우기

        //1. option인자 : "class", "off"
        //2. CSS테마인자 : "grey", "pink"

        switch(option){
          case "class" :
          var DateDataArray = classDateData;
          var TimeDataArray = classTimeData;
          $('.tdgraph').removeClass('greytimegraph').removeClass('pinktimegraph')  
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
        var date = $("#datepicker_off").val();
        var Arraylength = DateDataArray.length;
        for(var i=0;i<Arraylength;i++){
          var splitTimeArray = TimeDataArray[i].split("_")
          var targetTime = splitTimeArray[0]
          var durTime = splitTimeArray[2]
          if(DateDataArray[i] == date && durTime>1){  //수업시간이 2시간 이상일때 칸 채우기
              for(var j=0; j<durTime; j++){
                var time = Number(targetTime)+j
                $('#'+(time)+'g_off').addClass(cssClass)
              }
          }else if(DateDataArray[i] == date && durTime==1){ //수업시간이 1시간짜리일때 칸 채우기
              $('#'+targetTime+'g_off').addClass(cssClass)
          }
        }
        //timeGraphLimitSet(Options.limit)
      }

      function timeGraphLimitSet(limit){
        var selecteddate = $("#datepicker_off").val();
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
        console.log(selecteddate,today)
        if(selecteddate==today){
          for(var i=5;i<=24;i++){
            var time = $('#'+i+'g_off')
            if(i<=hh+limit){
              time.addClass('greytimegraph')
            }
          }
        }
      }


      function startTimeArraySet(){ //offAddOkArray 채우기 : 시작시간 리스트 채우기
        offAddOkArray = []
        for(i=5;i<=24;i++){
          if(!$('#'+i+'g_off').hasClass('pinktimegraph') == true && !$('#'+i+'g_off').hasClass('greytimegraph') == true){
            offAddOkArray.push(i);
          }
        }
      }

      function durTimeSet(selectedTime){ // durAddOkArray 채우기 : 진행 시간 리스트 채우기
        var len = offAddOkArray.length;
        var durTimeList = $('#durations_off')
        var index = offAddOkArray.indexOf(Number(selectedTime));
        var substr = offAddOkArray[index+1]-offAddOkArray[index];
        if(substr>1){

          var fininfo = (Number(selectedTime)+1)
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
        durTimeList.append('<li><a data-dur="dummy" class="pointerList">'+'<img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;">'+'</a></li>')
      }
      */

      function addGraphIndicator(datadur){
        $('.tdgraph').removeClass('graphindicator')
        var starttext = $('#starttimesSelected_off button').val().split(' ');
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
        console.log(durnum)
        var finnum = Number(startnum)+Number(durnum)
        console.log(startnum, durnum,finnum)
        for(var i=startnum; i<finnum; i++){
          $('#'+i+'g_off').addClass('graphindicator')

        }
      }

      function scrollToIndicator(dom){
        var offset = dom.offset();
        console.log(offset)
          $('body, html').animate({scrollTop : offset.top-180},700)
      }


});



