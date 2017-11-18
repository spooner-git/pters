$(document).ready(function(){

     
      var classDateData = []
      var classTimeData = []
      var offDateData=[]
      var offTimeData = []
      var offAddOkArray = [] //OFF 등록 시작 시간 리스트
      var durAddOkArray = [] //OFF 등록 시작시간 선택에 따른 진행시간 리스트

      DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classDateData,"graph",classTimeData)
      DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offDateData,"graph",offTimeData)

      $('#popup_text2').click(function(){ //일정예약 팝업에서 일정예약 버튼을 눌렀을때 예약하는 팝업이 생성
        $('#addpopup').fadeIn().css({'z-index':'103'})
        $('#cal_popup2').hide()
        timeGraphSet("class","grey");  //시간 테이블 채우기
        timeGraphSet("off","grey")
        startTimeSet();  //일정등록 가능한 시작시간 리스트 채우기
      })

      var select_all_check = false;
      //달력 선택된 날짜
      //출력 예시 : Fri Sep 08 2017 00:00:00 GMT+0900 (대한민국 표준시)

      $(document).on('click','#starttimes li a',function(){
          $("#starttimesSelected button").addClass("dropdown_selected");
          $("#starttimesSelected .btn:first-child").text($(this).text());
          $("#starttimesSelected .btn:first-child").val($(this).text());
          $("#id_training_time").val($(this).attr('data-trainingtime'));
          var arry = $(this).attr('data-trainingtime').split(':')
          durTimeSet(arry[0]);
          check_dropdown_selected();
      })

      $(document).on('click',"#durations li a",function(){
          $("#durationsSelected button").addClass("dropdown_selected");
          $("#durationsSelected .btn:first-child").text($(this).text());
          $("#durationsSelected .btn:first-child").val($(this).attr('data-dur'));
          $("#id_time_duration").val($(this).attr('data-dur'));
          check_dropdown_selected();
      }); //진행시간 드랍다운 박스 - 선택시 선택한 아이템이 표시

       function check_dropdown_selected(){ // 회원이 PT 예약시 시간, 진행시간을 선택했을때 분홍색으로 버튼 활성화 
       	 var durSelect = $("#durationsSelected button");
       	 var startSelect = $("#starttimesSelected button")
       		 if((durSelect).hasClass("dropdown_selected")==true &&(startSelect).hasClass("dropdown_selected")==true){
        	    $("#submitBtn").addClass('submitBtnActivated');
            	select_all_check=true;
        	}else{
           	    select_all_check=false;
       		}
    	 }

      $("#submitBtn").click(function(){
         if(select_all_check==true){
             document.getElementById('pt-add-form').submit();
         }else{
            //입력값 확인 메시지 출력 가능
         }
     })

      //작은달력 설정


      function startTimeSet(){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21];
        startTimeArraySet(); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
        var offOkLen = offAddOkArray.length
        var startTimeList = $('#starttimes');
        var timeArray = [];
        for(var i=0; i<offOkLen; i++){
          var offHour = offAddOkArray[i];
          if(offHour<12){
            var offText = '오전'
            var offHours = offHour;
          }else if(offHour==24){
            var offText = '오전'
            var offHours = offHour-12
          }else if(offHour==12){
            var offText = '오후'
            var offHours = offHour
          }else{
            var offHours = offHour-12
            var offText = '오후'
          }
          if(offHour.length<2){
            timeArray[i] ='<li><a data-trainingtime="'+'0'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+'시'+'</a></li>'
          }else{
            timeArray[i] ='<li><a data-trainingtime="'+offHour+':00:00.000000" class="pointerList">'+offText+offHours+'시'+'</a></li>'
          }
        }
        var timeArraySum = timeArray.join('')
        startTimeList.html(timeArraySum)
        console.log(offAddOkArray)
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
          if(startSplitArray[2].length<2){
            result.push(startSplitArray[0]+"-"+startSplitArray[1]+"-0"+startSplitArray[2]); //2017_10_07
            result2.push(startSplitArray[3]+"_"+startSplitArray[4] +"_"+ startSplitArray[5]); //6_00_2  
          }else{
            result.push(startSplitArray[0]+"-"+startSplitArray[1]+"-"+startSplitArray[2]); //2017_10_17
            result2.push(startSplitArray[3]+"_"+startSplitArray[4] +"_"+ startSplitArray[5]); //6_00_2
          }
          
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
        //var date = $("#datepicker").val(); 공용
        var dateArry = $('#popup_info3').text().replace(/년 |월 |일 |일정 추가|:| /gi,"_").split('_') //회원 월간일정 전용 
        var monthD= dateArry[1]
        var dateD = dateArry[2]
        console.log(monthD,dateD)

        if(monthD.length==1){
          var monthD = '0'+dateArry[1]
        }
        if(dateD.length==1){
          var dateD = '0'+dateArry[2]
        }
        var date = dateArry[0]+'-'+monthD+'-'+dateD
        var Arraylength = DateDataArray.length;
        for(var i=0;i<Arraylength;i++){
          var splitTimeArray = TimeDataArray[i].split("_")
          var targetTime = splitTimeArray[0]
          var durTime = splitTimeArray[2]
          if(DateDataArray[i] == date && durTime>1){  //수업시간이 2시간 이상일때 칸 채우기
              for(var j=0; j<durTime; j++){
                var time = Number(targetTime)+j
                $('#'+(time)+'g').addClass(cssClass)
              }
          }else if(DateDataArray[i] == date && durTime==1){ //수업시간이 1시간짜리일때 칸 채우기
              $('#'+targetTime+'g').addClass(cssClass)
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
        console.log(index)
        console.log(substr)
        if(substr>1){
          durTimeList.html('<li><a data-dur="1" class="pointerList">1시간</a></li>')
          console.log(index)
        }else{
          durTimeList.html('')
          for(var j=index; j<=len; j++){
            if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>') 
            }else if(offAddOkArray[j-1]== null && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]==1){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1]-offAddOkArray[j]>=2){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
              break;
            }else if(offAddOkArray[j]-offAddOkArray[j-1]==1 && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
              //break;
            }else if(offAddOkArray[j]-offAddOkArray[j-1]>1 && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }else if(offAddOkArray[j-1]==null && offAddOkArray[j+1] == null){
              durTimeList.append('<li><a data-dur="'+(j-index+1)+'" class="pointerList">'+(j-index+1)+'시간</a></li>')
            }
          }
        }
      }



});



