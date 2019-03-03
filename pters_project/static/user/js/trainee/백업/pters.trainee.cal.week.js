/*달력 만들기

 1. 각달의 일수를 리스트로 만들어 둔다.
 [31,28,31,30,31,30,31,31,30,31,30,31]
 2. 4년마다 2월 윤달(29일)
 year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
 3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

 */

$(document).ready(function(){

    var userCheckedHourArray = []
    $('#upbutton-alarm').click(function(){
        var userCheckedHourArray = []
        var checkedLength = $('.ptersCheckboxInner').length
        for(var i=0; i<checkedLength; i++){
            var checkedHour = $('.ptersCheckboxInner').eq(i).attr('data-time')
            var checkedHourarry = $('.ptersCheckboxInner').eq(i).attr('data-time').split('_')
            userCheckedHourArray[i]="  "+checkedHourarry[0]+'년 '+checkedHourarry[1]+'월 '+checkedHourarry[2]+'일 '+checkedHourarry[3]+':'+checkedHourarry[4]
        }
        alert('추가된 시간은 총 '+checkedLength+'건 : '+userCheckedHourArray) //디버깅용
        if(checkedLength>0){
            document.getElementById('pt-add-form').submit();
        }
    })


    $(document).on('click','td',function(){
        var div_ptersCheckbox = $(this).find('div')
        var div_ptersCheckboxInner = div_ptersCheckbox.find('div')
        var date_info = $(this).attr('id')
        if(!div_ptersCheckboxInner.hasClass('ptersCheckboxInner') && !$(this).hasClass('notAvail') && !$(this).hasClass('hour') &&!$(this).hasClass('myClass')){
            duplicateCheck($(this).attr('id'))
            div_ptersCheckbox.addClass('checked')
            div_ptersCheckboxInner.addClass('ptersCheckboxInner').attr('data-time',$(this).attr('id'))
            var add_form = '#pt-add-form'
            var date_form = date_info.split('_')
            var yy=date_form[0]
            var mm=date_form[1]
            var dd=date_form[2]
            var hour=date_form[3]
            var min=date_form[4]
            var pt_size = Number($('#add-pt-count').val())
            //$("#id_schedule_id").val()
            pt_size += 1;
            $("#add-pt-count").val(pt_size);
            $(add_form).append("<input type='hidden' name='training_date[]' id='id_training_date_"+date_info+"' value='"+yy+"-"+mm+"-"+dd+"'>" +
                "<input type='hidden' name='training_time[]' id='id_training_time_"+date_info+"' value='"+hour+":"+min+":00.000000'>" +
                "<input type='hidden' name='time_duration[]' id='id_time_duration_"+date_info+"' value='1'>")

        }else if(div_ptersCheckboxInner.hasClass('ptersCheckboxInner')){
            div_ptersCheckboxInner.removeClass('ptersCheckboxInner')
            div_ptersCheckbox.removeClass('checked')
            dplicateCheckMyClass($(this).attr('id'))
            var delete_input_form1 = '#id_training_date_'+date_info
            var delete_input_form2 = '#id_time_duration_'+date_info
            var delete_input_form3 = '#id_training_time_'+date_info
            $(delete_input_form1).remove()
            $(delete_input_form2).remove()
            $(delete_input_form3).remove()
            var pt_size = Number($('#add-pt-count').val())
            //$("#id_schedule_id").val()
            pt_size -= 1;
            $("#add-pt-count").val(pt_size);
        }
    })

    $('#ymdText').click(function(){
        var checked = $('.ptersCheckbox div')
        checked.removeClass('ptersCheckboxInner')
        $('.ptersCheckbox').removeClass('checked')
    });


    var schedule_on_off = 0; //0 : OFF Schedule / 1 : PT Schedule

    var date = new Date();
    var currentYear = date.getFullYear(); //현재 년도
    var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
    var currentDate = date.getDate(); //오늘 날짜
    var currentDay = date.getDay() // 0,1,2,3,4,5,6,7


    var currentHour = date.getHours();
    var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31];      //각 달의 일수
    if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
        lastDay[1] = 29;
    }else{
        lastDay[1] = 28;
    };

    var weekDay = ['일','월','화','수','목','금','토'];
    var firstDayInfoPrevMonth = new Date(currentYear,currentMonth-1,1);
    var firstDayPrevMonth = firstDayInfoPrevMonth.getDay(); //전달 1일의 요일
    var firstDayInfoNextMonth = new Date(currentYear,currentMonth+1,1);
    var firstDayNextMonth = firstDayInfoNextMonth.getDay(); //다음달 1일의 요일
    var currentPageMonth = currentMonth+1; //현재 달

// ############################구동시 실행################################################################################
// ****************************구동시 실행********************************************************************************
    mWeek_calTable_Set(1,currentYear,currentMonth+1,'0W')
    mWeek_calTable_Set(2,currentYear,currentMonth+1,'1L')
    mWeek_calTable_Set(3,currentYear,currentMonth+1,'2L')
    weekNum_Set()

    DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classTimeArray,"class");
    DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offTimeArray);
    addcurrentTimeIndicator();
    scrollToIndicator();
    classTime(); //PT수업시간에 불가 checkbox 선택 불가표기
    offTime(); //본인의 PT시간 이외 시간(다른사람 PT시간 & OFF시간)에 불가 checkbox 선택 불가표기
    pastTime();
    limitTime();
// ****************************구동시 실행********************************************************************************
// ############################구동시 실행################################################################################

    //다음페이지로 슬라이드 했을때 액션
    myswiper.on('SlideNextEnd',function(){
        //slideControl.next();
        weekNum_Set();
    });

    //이전페이지로 슬라이드 했을때 액션
    myswiper.on('SlidePrevEnd',function(){
        //slideControl.prev();
        weekNum_Set();
    });

    //페이지 이동에 대한 액션 클래스
    var slideControl = {
        'append' : function(){ //다음페이지로 넘겼을때
            myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
            myswiper.appendSlide('<div class="swiper-slide"></div>') //마지막 슬라이드에 새슬라이드 추가
            classTime();
            offTime();
            myswiper.update(); //슬라이드 업데이트

        },

        'prepend' : function(){
            myswiper.removeSlide(2);
            myswiper.prependSlide('<div class="swiper-slide"></div>'); //맨앞에 새슬라이드 추가
            classTime();
            offTime();
            myswiper.update(); //이전페이지로 넘겼을때
        },

        'next': function(){

        },

        'prev': function(){

        }
    };



    function mWeek_calTable_Set(Index,Year,Month,Week){
        switch(Week){
            case '2E':
                var W = -14;
                break;
            case '1E':
                var W = -7;
                break;
            case '0W':
                var W = 0;
                break;
            case '1L':
                var W = 5;
                break;
            case '2L':
                var W = 10;
                break;
        }


        var slideIndex = $('#slide'+Index); //Index 시작 1
        var tableArray=[];

        for(var i=5; i<24; i++){
            var tdArray=[]
            for(var j=0; j<5; j++){
                var Dates = currentDate+j+W
                if(Dates>lastDay[currentMonth]){
                    var Dates = Dates-lastDay[currentMonth]
                    var Months=Month+1;
                    if(Months>12){
                        var Months = Months -12
                        var Year = Year +1
                    }
                    tdArray[j]='<td id="'+Year+'_'+Months+'_'+Dates+'_'+i+'_00'+'">'+'<div class="ptersCheckbox"><div></div></div>'+'</td>'
                }else{
                    tdArray[j]='<td id="'+Year+'_'+Month+'_'+Dates+'_'+i+'_00'+'">'+'<div class="ptersCheckbox"><div></div></div>'+'</td>'
                }
            }
            var td=tdArray.join("")
            var hourtd='<td class="hour" id="'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+Week+"_"+i+'H'+'">'+i+':00 - '+(i+1)+':00'+'</td>'
            var tdsum = hourtd + td
            var trtdsum = '<tr>'+tdsum+'</tr>'
            tableArray[i-5]=trtdsum
        }
        var trToAppend = tableArray.join("")
        var tableToAppend = '<table>'+trToAppend+'</table>'
        slideIndex.html(tableToAppend)

    }


    function weekNum_Set(){
        var index = Number(myswiper.activeIndex+1);
        var firstDay = $('#day1')
        var secondDay = $('#day2')
        var thirdDay = $('#day3')
        var fourthDay = $('#day4')
        var fifthDay = $('#day5')
        var WeekArry = [firstDay,secondDay,thirdDay,fourthDay,fifthDay]
        var lastDayThisMonth = lastDay[currentMonth];
        var mmInfoArry = $('#slide'+index+' td:nth-child(2)').attr('id').split('_')
        var month = mmInfoArry[1]
        var Year = mmInfoArry[0]

        for(i=1; i<=5; i++){
            var dateSpan = $('._day'+i)
            var daySpan = $('._day'+i+'date')
            var dateInfoArry = $('#slide'+index+' td:nth-child('+(i+1)+')').attr('id').split('_')
            var yy = dateInfoArry[0]
            var mm = dateInfoArry[1]
            var dd = dateInfoArry[2]
            var dayKor = ['일','월','화','수','목','금','토']
            var ymd = new Date(yy,mm-1,dd);
            var day = ymd.getDay()
            dateSpan.text(dd)
            daySpan.text(dayKor[day])
        }
        $('#yearText').text(Year+'년');
        $('#monthText').text(month+'월');
        toDay();
    }


    function dateText(){ //
        //currentYMD 형식  ex : 2017_8_4_5H
        $('#yearText').text(currentYear+'년');
        $('#monthText').text(currentPageMonth+'월');
    };


    function toDay(){
        for(i=1;i<=7;i++){
            var scan = $('#weekNum_'+i+' span:nth-child(2)')
            var scan_day = $('#weekNum_'+i+' span:nth-child(1)')
            if(scan.text()==currentDate){
                scan.addClass('today')
            }else{
                scan.removeClass('today')
            }
            if(scan_day.text()=='토'){
                scan_day.addClass('satDay')
                scan.addClass('satDay')
            }else if(scan_day.text()=='일'){
                scan_day.addClass('sunDay')
                scan.addClass('sunDay')
            }else{
                scan_day.removeClass('satDay').removeClass('sunDay')
                scan.removeClass('satDay').removeClass('sunDay')
            }
        }
    }


    function classTime(){ //수업정보를 DB로 부터 받아 해당 시간을 예약달력에 불가시간으로 표기
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
            for(var j=0; j<classDura; j++){
                var classStartArr = [classYear,classMonth,classDate,Number(classHour)+j,classMinute]
                var classStart = classStartArr.join("_")
                var tdClassStart = $("#"+classStart+" div");
                tdClassStart.removeClass('ptersCheckbox').addClass('ptersNotAvail');
                tdClassStart.parent('td').addClass('myClass').text("내 일정")
            }
        };
        $('#calendar').css('display','block');
    };

    function offTime(){ //OFF정보를 DB로 부터 받아 해당 시간을 예약달력에 불가시간으로 표기
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
            for(var j=0; j<offDura; j++){
                var offStartArr = [offYear,offMonth,offDate,Number(offHour)+j,offMinute]
                var offStart = offStartArr.join("_")
                var tdOffStart = $("#"+offStart+" div");
                tdOffStart.removeClass('ptersCheckbox').addClass('ptersNotAvail')
                tdOffStart.parent('td').addClass('notAvail')
            }
        };
        $('#calendar').css('display','block');
    };

    function pastTime(){ //현재 이전 시간은 막기
        var len = currentHour
        for(var i=5; i<=len; i++){ //2017_12_15_5_00
            var past = $('#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+i+'_00')
            if(!past.hasClass('myClass')){
                past.addClass('notAvail');
                past.find('div').removeClass('ptersCheckbox').addClass('ptersNotAvail')
            }else{

            }
        }
    }

    function limitTime(){ //현재시간부터 xx시간 이내 예약 불가
        console.log(currentHour+1, Options.limit)

        for(var i=currentHour+1;i<currentHour+1+Options.limit;i++){
            var limit = $('#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+i+'_00')
            limit.addClass('notAvail');
            limit.find('div').removeClass('ptersCheckbox').addClass('ptersNotAvail')
        }
    }


    function addcurrentTimeIndicator(){ //현재 시간에 밑줄 긋기
        var where2 = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+"0W"+"_"+currentHour+'H'
        if($('.currentTimeBox').length==""){
            $(where2).append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
            $(where2).css({'color':'white','background':'transparent'})
        }
    }

    function scrollToIndicator(){
        var offset = $('.currentTimeBox').offset();
        console.log(offset);
        if(currentHour>=5){
            $('#slide1').animate({scrollTop : offset.top -180},500)
        }
    }


    function DBdataProcess(startarray,endarray,result,option){
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
            }else{
                startSplitArray.push(classTimeArray_member_name[i])
                result.push(startSplitArray[0]+"_"+startSplitArray[1]+"_"+startSplitArray[2]+"_"+startSplitArray[3]+"_"+startSplitArray[4]+"_"+startSplitArray[5]+"_"+"OFF"+"_"+endSplitArray[3]+"_"+endSplitArray[4]);
            }
        }
    }

    function duplicateCheck(selector){ // 주간일정에서 이미 "내 일정"이 있는 날의 시간을 선택했을때 알림 출력(이미 선택한 날짜에 일정이 있다. 맞는지 확인하시오.)
        var alreadyExistCount = 0;
        var alreadyExistList =[];
        var alreadyExistMyclass = [];
        var div_ptersCheckbox = $('#'+selector).find('div')
        var div_ptersCheckboxInner = div_ptersCheckbox.find('div')
        for(var i=5; i<24; i++){
            var selectedId = selector.split('_')
            var yy = selectedId[0];
            var mm= selectedId[1];
            var dd= selectedId[2];
            var scanTdId = $('#'+yy+'_'+mm+'_'+dd+'_'+i+'_00')
            if(scanTdId.find('div').hasClass('checked')){
                alreadyExistCount++
                alreadyExistList.push('#'+yy+'_'+mm+'_'+dd+'_'+i+'_00')
            }else if(scanTdId.hasClass('myClass')){
                alreadyExistCount++
                alreadyExistMyclass.push('#'+yy+'_'+mm+'_'+dd+'_'+i+'_00')
            }
        }
        if(alreadyExistCount>0){
            for(var i=0;i<alreadyExistList.length;i++){
                var checkeddiv = $(alreadyExistList[i]+' div')
                var checkboxinnerdiv = $(alreadyExistList[i]+' div div')
                checkboxinnerdiv.removeClass('ptersCheckboxInner')
                checkeddiv.removeClass('checked')
                //alert('선택한 날짜에 이미 일정이 ['+alreadyExistCount+'] 건 존재합니다.')
            }
            for(var j=0;j<alreadyExistMyclass.length;j++){
                var myclassdiv = $(alreadyExistMyclass[j])
                myclassdiv.addClass('myClass_re')
            }
        }
    }

    function dplicateCheckMyClass(selector){
        var div_ptersCheckbox = $('#'+selector).find('div')
        var div_ptersCheckboxInner = div_ptersCheckbox.find('div')
        for(var i=5; i<24; i++){
            var selectedId = selector.split('_')
            var yy = selectedId[0];
            var mm= selectedId[1];
            var dd= selectedId[2];
            var scanTdId = $('#'+yy+'_'+mm+'_'+dd+'_'+i+'_00')
            if(scanTdId.hasClass('myClass_re')){
                scanTdId.removeClass('myClass_re').addClass('myClass')
            }
        }
    }

});//document(ready)

