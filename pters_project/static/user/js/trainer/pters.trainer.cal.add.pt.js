$(document).ready(function(){

      var Options = {
                        "limit": 1, // 현재시간으로부터 몇시간뒤에 일정 추가가능하게 할지 셋팅
                    }

      var classDateData = []
      var classTimeData = []
      var offDateData=[]
      var offTimeData = []
      var offAddOkArray = [] //OFF 등록 시작 시간 리스트
      var durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트

      DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateData,"graph",classTimeData)
      DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offDateData,"graph",offTimeData)

      //모바일 스타일

      console.log(classDateData)


  $("#datepicker").datepicker({
        minDate : 0,
          onSelect : function(curDate, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
            if( curDate != instance.lastVal ){
              $("#dateSelector p").addClass("dropdown_selected");
              $("#id_training_date").val($("#datepicker").val()).submit();
              if($('#timeGraph').css('display')=='none'){
                $('#timeGraph').show(110,"swing");
              }
              $('.tdgraph').removeClass('graphindicator')
              timeGraphSet("class","grey");  //시간 테이블 채우기
              timeGraphSet("off","grey")
              startTimeSet();  //일정등록 가능한 시작시간 리스트 채우기
              check_dropdown_selected();
            }
          }
      });



      var select_all_check = false;
      //달력 선택된 날짜
      //출력 예시 : Fri Sep 08 2017 00:00:00 GMT+0900 (대한민국 표준시)

      $("#members li a").click(function(){
          //$('.tdgraph').removeClass('graphindicator')
          $("#membersSelected button").addClass("dropdown_selected");
      		$("#membersSelected .btn:first-child").text($(this).text());
      		$("#membersSelected .btn:first-child").val($(this).text());
      		$("#countsSelected").text($(this).attr('data-lecturecount'));
      		$("#id_lecture_id").val($(this).attr('data-lectureid'));
          $("#id_member_name").val($(this).text());
          check_dropdown_selected();
  		}); //회원명 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $(document).on('click','#starttimes li a',function(){
          $('.tdgraph').removeClass('graphindicator')
          $("#starttimesSelected button").addClass("dropdown_selected");
          $("#starttimesSelected .btn:first-child").text($(this).text());
          $("#starttimesSelected .btn:first-child").val($(this).text());
          $("#id_training_time").val($(this).attr('data-trainingtime'));
          var arry = $(this).attr('data-trainingtime').split(':')
          console.log(arry)
          durTimeSet(arry[0]);
          $("#durationsSelected button").removeClass("dropdown_selected");
          $("#durationsSelected .btn:first-child").html("<span style='color:#cccccc;'>선택</span>");
          $("#durationsSelected .btn:first-child").val("");
          check_dropdown_selected();
      })

      $(document).on('click',"#durations li a",function(){
          $("#durationsSelected button").addClass("dropdown_selected");
          $("#durationsSelected .btn:first-child").text($(this).text());
          $("#durationsSelected .btn:first-child").val($(this).attr('data-dur'));
          $("#id_time_duration").val($(this).attr('data-dur'));
          check_dropdown_selected();
          addGraphIndicator($(this).attr('data-dur'))
      }); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시

      $(document).on('click','#durationsSelected button',function(){
        $('.tdgraph').removeClass('graphindicator');
      })

      $(document).on('click','button',function(){
         //scrollToIndicator($(this))
      })


     function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
        var memberSelect = $("#membersSelected button");
        var dateSelect = $("#dateSelector p");
        var durSelect = $("#durationsSelected button");
        var startSelect = $("#starttimesSelected button")
        if((memberSelect).hasClass("dropdown_selected")==true && (dateSelect).hasClass("dropdown_selected")==true && (durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('.submitBtn').addClass('submitBtnActivated')
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('.submitBtn').removeClass('submitBtnActivated')
            select_all_check=false;
        }
     }

     $("#upbutton-check, .submitBtn").click(function(){
        var $form = $('#pt-add-form')
         if(select_all_check==true){
             //document.getElementById('pt-add-form').submit();
             //ajax 회원정보 입력된 데이터 송신

                  

                 $.ajax({
                    url:'/trainer/add_pt_logic/',
                    type:'POST',
                    data:$form.serialize(),

                    beforeSend:function(){
                      $('html').css("cursor","wait")
                      $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif')
                    },

                    //보내기후 팝업창 닫기
                    complete:function(){
                      closeAddPopup()
                      $('#calendar').show()
                      $('#shade2').hide();
                      $('html').css("cursor","auto")
                      $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                      alert('complete: PT 일정 정상 등록')
                      },

                    //통신성공시 처리
                    success:function(){
                      console.log('success')
                      },

                    //통신 실패시 처리
                    error:function(){
                      alert("error : 서버와 통신 실패")
                    },
                 })

         }else{
            //$('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
         }
     })


     function ajaxClassTime(){
      console.log('ajax receiving')
            $.ajax({
              url:'/static/user/scheduleDB.html',
              dataType : 'html',
              success:function(data){
                console.log(data)
                DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classTimeArray,"class");
                classTime();
              }

            })
          
     }

     function closeAddPopup(){
        $('body').css('overflow-y','overlay')
        $('#shade3').fadeOut();
        $('#page-ptadd').fadeOut('fast','swing');
        $('#page-offadd').fadeOut('fast','swing');
        $('#float_btn_wrap').fadeIn();
        $('#float_btn').removeClass('rotate_btn');
        $('#page-base').fadeIn();
        $('#page-base-addstyle').fadeOut();

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


     //작은달력 설정
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
        yearSuffix: '년'
    });


      function startTimeSet(){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21];
        startTimeArraySet(); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
        var offOkLen = offAddOkArray.length
        var startTimeList = $('#starttimes');
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
        var date = $("#datepicker").val();
        var Arraylength = DateDataArray.length;
        for(var i=0;i<Arraylength;i++){
          var splitTimeArray = TimeDataArray[i].split("_")
          var targetTime = splitTimeArray[0]
          var durTime = splitTimeArray[2]
          console.log(DateDataArray[i],date)
          if(DateDataArray[i] == date && durTime>1){  //수업시간이 2시간 이상일때 칸 채우기
              for(var j=0; j<durTime; j++){
                var time = Number(targetTime)+j
                $('#'+(time)+'g').addClass(cssClass)
              }
          }else if(DateDataArray[i] == date && durTime==1){ //수업시간이 1시간짜리일때 칸 채우기
              $('#'+targetTime+'g').addClass(cssClass)
          }
        }
        timeGraphLimitSet(Options.limit)
      }

      function timeGraphLimitSet(limit){
        var selecteddate = $("#datepicker").val();
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
            var time = $('#'+i+'g')
            if(i<=hh+limit){
              time.addClass('greytimegraph')
            }
          }
        }
      }

      function startTimeArraySet(){ //offAddOkArray 채우기 : 시작시간 리스트 채우기
        offAddOkArray = []
        for(i=5;i<=24;i++){
          if(!$('#'+i+'g').hasClass('pinktimegraph') == true && !$('#'+i+'g').hasClass('greytimegraph') == true){
            offAddOkArray.push(i);
          }
        }
      }

      function durTimeSet(selectedTime){ // durAddOkArray 채우기 : 진행 시간 리스트 채우기
        var len = offAddOkArray.length;
        var durTimeList = $('#durations')
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
         durTimeList.append('<li><a data-dur="dummy" class="pointerList">'+'<img src="/static/user/res/PTERS_logo.jpg" style="height:17px;opacity:0.3;">'+'</a></li>')
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
        console.log(durnum)
        var finnum = Number(startnum)+Number(durnum)
        console.log(startnum, durnum,finnum)
        for(var i=startnum; i<finnum; i++){
          $('#'+i+'g').addClass('graphindicator')
        }
      }

      function scrollToIndicator(dom){
        var offset = dom.offset();
        console.log(offset)
          $('body, html').animate({scrollTop : offset.top-180},700)
      }
});