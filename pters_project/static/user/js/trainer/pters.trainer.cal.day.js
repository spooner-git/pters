$(document).ready(function(){

    $('#float_inner1').click(function(){ //PT추가버튼
        scrollToDom($('body'))
        addTypeSelect = "ptadd"
        $('#memberName,#remainCount').css('display','block');
        $('#page-addplan').fadeIn('fast');
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').fadeOut();

        $('#uptext2').text('레슨 일정 등록')
        $('#page-base').fadeOut();
        $('#page-base-addstyle').fadeIn();
        $("#datepicker").datepicker('setDate',null)

        if($('body').width()<600){
            $('#shade3').fadeIn('fast');
            $('#calendar').css('height','0')
        }else{
            $('#pcaddpopup').show()
            $('#pcaddpopup_off').hide()
        }
    })

    $('#float_inner2').click(function(){ //OFF추가버튼
        scrollToDom($('body'))
        addTypeSelect = "offadd"

        $('#memberName,#remainCount').hide();
        $('#page-addplan').fadeIn('fast');
        $('#uptext2').text('OFF 일정 추가')
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').fadeOut();
        $('#page-base').fadeOut();
        $('#page-base-addstyle').fadeIn();
        $("#datepicker").datepicker('setDate',null)
        if($('body').width()<600){
            $('#shade3').fadeIn('fast');
            $('#calendar').css('height','0')
        }else{
            $('#pcaddpopup').hide()
            $('#pcaddpopup_off').show()
        }
    })

    $('#upbutton-x').click(function(){
        $('#calendar').css('height','90%')
        $('#shade3').fadeOut();
        $('#shade').hide();
        $('#page-addplan').fadeOut('fast','swing');
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
        $('.tdgraph').removeClass('graphindicator')
    })
    //모바일 스타일

    //PC 스타일
    $('.cancelBtn').click(function(){
        $('#shade').hide();
        $('#page-addplan').fadeOut('fast','swing');
        $('#float_btn_wrap').fadeIn();
        $('#float_btn').removeClass('rotate_btn');
        $('#page-base').fadeIn();
        $('#page-base-addstyle').fadeOut();
        $('.submitBtn').removeClass('submitBtnActivated')

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
        $('.tdgraph').removeClass('graphindicator')
    })
    //PC 스타일



    var schedule_on_off = 0; //0 : OFF Schedule / 1 : PT Schedule


        //플로팅 버튼 Start
    $('#float_btn').click(function(){
        //addPtMemberListSet();
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
    });
    //플로팅 버튼 End

    //플로팅 버튼 스크롤시 숨기기 Start
    var ts;
    $("body").bind("touchstart",function(e){
        ts = e.originalEvent.touches[0].clientY;
    });
    $("body").bind("touchend",function(e){
        var te = e.originalEvent.changedTouches[0].clientY;
        if(ts>te+5){
            $("#float_btn").animate({opacity:'0'})
        }else if(ts<te-5){
            $("#float_btn").animate({opacity:'1'})
        }
    });
    //플로팅 버튼 스크롤시 숨기기 End

    var date = new Date();
    var currentYear = date.getFullYear(); //현재 년도
    var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
    var currentDate = date.getDate(); //오늘 날짜
    var currentDay = date.getDay(); // 0,1,2,3,4,5,6,7
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

    //다음페이지로 슬라이드 했을때 액션
    myswiper.on('onSlideNextEnd',function(){
        dateText();
        slideControl.append();

    });

    //이전페이지로 슬라이드 했을때 액션
    myswiper.on('onSlidePrevEnd',function(){
        dateText();
        slideControl.prepend();
    });


    //너무 빠르게 스와이프 하는 것을 방지
    myswiper.on('onSlideChangeStart',function(){
        myswiper.params.onlyExternal = true;
    })

    myswiper.on('onSlideChangeEnd',function(){
        myswiper.params.onlyExternal = false;
    })
    //너무 빠르게 스와이프 하는 것을 방지

    //페이지 이동에 대한 액션 클래스
    var slideControl = {
        'append' : function(){ //다음페이지로 넘겼을때
            var last = Number($('.swiper-slide:last-child').attr('id').replace(/slide/gi,""))
            var lastdateinfo = $('.swiper-slide:last-child').find('div').attr('id').split('_');
            var lastYY = lastdateinfo[1];
            var lastMM = lastdateinfo[2];
            var lastDD = Number(lastdateinfo[3]);
            myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
            myswiper.appendSlide('<div class="swiper-slide" id="slide'+(last+1)+'"></div>') //마지막 슬라이드에 새슬라이드 추가
            calTable_Set(last+1,lastYY,lastMM,lastDD+1); //새로 추가되는 슬라이드에 달력 채우기

        },

        'prepend' : function(){
            var first = Number($('.swiper-slide:first-child').attr('id').replace(/slide/gi,""));
            var firstdateinfo = $('.swiper-slide:first-child').find('div').attr('id').split('_');
            var firstYY = firstdateinfo[1];
            var firstMM = firstdateinfo[2];
            var firstDD = firstdateinfo[3];
            myswiper.removeSlide(4);
            myswiper.prependSlide('<div class="swiper-slide" id="slide'+(first-1)+'"></div>'); //맨앞에 새슬라이드 추가
            calTable_Set(first-1,firstYY,firstMM,firstDD-1);

        }
    };

    //Slide3을 [오늘]로 기준으로 각페이지에 날짜에 맞춰 테이블 생성하기
    for(var i=1;i<=5;i++){
        calTable_Set(i,currentYear,currentPageMonth,currentDate-3+i)
    }
    //Slide3을 [오늘]로 기준으로 각페이지에 날짜에 맞춰 테이블 생성하기

    dateText(); //상단에 연월일요일 표시
    DBdataProcess(classTimeArray_start_date,classTimeArray_end_date,classTimeArray,"class"); //DB로 부터 받는 Class데이터 가공
    DBdataProcess(offTimeArray_start_date,offTimeArray_end_date,offTimeArray,"off"); //DB로 부터 받는 Off 데이터 가공
    //addcurrentTimeIndicator(); //현재 시간에 밑줄 긋기 (구버전)
    addcurrentTimeIndicator_blackbox(); //현재 시간 검은색 Background 표시
    //scrollToIndicator(); //현재 시간으로 스크롤 자동 이동

    /*
    function calTable_Set(Index,Year,Month,Day){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성
        switch(Options.language){
            case "KOR" :
                var morning = "오전";
                var afternoon = "오후";
                break;
            case "JPN" :
                var morning = "午前";
                var afternoon = "午後";
                break;
            case "ENG" :
                var morning = "AM";
                var afternoon = "PM";
                break;
        }

        if(Day>lastDay[Month-1]){
            var Day = Day - lastDay[Month-1]
            Month++
            if(Month>12){
                var Month = Month-12;
                Year++
            }
        }else if(Day<=0){
            var Day = Day + lastDay[11]
            Month--
            if(Month<1){
                var Month = Month + 12;
                Year--
            }
        }




        var slideIndex = $('#slide'+Index);
        for(var i=1; i<=24; i++){
            var textToAppend = '<div id="'+i+'H_'+Year+'_'+Month+'_'+Day+'" class="time-style"'+'>'
            var divToAppend = $(textToAppend)
            //var td1 = '<td'+' id='+Year+'_'+Month+'_'+Day+'_'+(i-1)+'_'+'30'+'>'+'<div></div>'+'</td>'
            //var td2 = '<td'+' id='+Year+'_'+Month+'_'+Day+'_'+i+'_'+'00'+'>'+'<div></div>'+'</td>'
            var td1 = '<td'+' id='+Year+'_'+Month+'_'+Day+'_'+i+'_'+'00'+' class="daytd">'+'<div></div>'+'</td>'
            var td2 = '<td'+' id='+Year+'_'+Month+'_'+Day+'_'+i+'_'+'30'+' class="daytd">'+'<div></div>'+'</td>'
            if(i<12){
                if(i==5){
                    var textToAppend2 = '<table id="'+Year+'_'+Month+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="slidegap" rowspan="2">'+'<span class="morningtext">'+morning+'</span> 0'+i+'.00'+'<div></div></td>'+td1+'</tr></tbody></table></div>';
                }else if(i<10 && i>5){
                    var textToAppend2 = '<table id="'+Year+'_'+Month+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="slidegap" rowspan="2">'+'0'+i+'.00'+'<div></div></td>'+td1+'</tr></tbody></table></div>';
                }else{
                    var textToAppend2 = '<table id="'+Year+'_'+Month+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="slidegap" rowspan="2">'+''+i+'.00'+'<div></div></td>'+td1+'</tr></tbody></table></div>';
                };
            }else{
                if(i==12){
                    var textToAppend2 = '<table id="'+Year+'_'+Month+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="slidegap" rowspan="2">'+'<span class="morningtext">'+afternoon+'</span> '+i+'.00'+'<div></div></td>'+td1+'</tr></tbody></table></div>';
                }else{
                    var textToAppend2 = '<table id="'+Year+'_'+Month+'_'+Day+'_'+i+'H'+'" class="calendar-style"><tbody><tr><td class="slidegap" rowspan="2">'+''+i+'.00'+'<div></div></td>'+td1+'</tr></tbody></table></div>';
                }

            }
            var sum = textToAppend+textToAppend2
            //divToAppend.html(sum)
            //slideIndex.append(divToAppend);
            slideIndex.append(sum);
        };
    }; //calTable_Set
    */

    function calTable_Set(Index,Year,Month,Day){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성
        switch(Options.language){
            case "KOR" :
                var morning = "오전";
                var afternoon = "오후";
                break;
            case "JPN" :
                var morning = "午前";
                var afternoon = "午後";
                break;
            case "ENG" :
                var morning = "AM";
                var afternoon = "PM";
                break;
        }

        var slideIndex = $('#slide'+Index);
        var textToAppend = '<div class="time-style time-row"'+'>'
        var slidegap = '<div class="slidegap_day"></div>'
        var textToAppend2 = '<div id="'+Year+'_'+Month+'_'+Day+'" class="daycal_plan_window"></div>';
        var sum = textToAppend+slidegap+textToAppend2 + '</div>'
        console.log(sum)
        slideIndex.html(sum);
        time_index_set();
        $('.swiper-slide').css('height',$('div.timeindex_day').height())
    }; //calTable_Set


    function time_index_set(){
        var start = Options.workStartTime;
        var end = Options.workEndTime;
        var timelist = [];

        var morning = '<span class="KRtext">오전</span>';
        var afternoon = '<span class="KRtext">오후</span>';
        if(Options.language=="JPN"){
            morning = '<span class="JPtext">午前</span>';
            afternoon = '<span class="JPtext">午後</span>';
        }else if(Options.language=="ENG"){
            morning = '<span class="ENtext">AM</span>';
            afternoon = '<span class="ENtext">PM</span>';
        }

        for(var i=start; i<end; i++){
            if(i<12 && i == start){
                timelist.push('<div class="hour" id="hour'+i+'"><span class="morningtext">'+morning+'</span><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
            }else if(i==12){
                timelist.push('<div class="hour" id="hour'+i+'"><span class="morningtext">'+afternoon+'</span><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
            }else{
                timelist.push('<div class="hour" id="hour'+i+'"><span class="timeindex_time">'+time_h_format_to_hh(i)+':00</span></div>');
            }
        }
        $('div.timeindex_day').html(timelist.join(''));
    }


    function ajaxClassTime(use, callfunction){
        var beforeSend_;
        var completeSend_;
        if(use == "callbefore"){
            beforeSend_ = function(){beforeSend('callback', function(){callfunction();})};
            completeSend_ = function(){completeSend()};
        }else if(use == "callafter"){
            beforeSend_ = function(){beforeSend()};
            completeSend_ = function(){completeSend('callback', function(){callfunction();})};
        }else{
            beforeSend_ = function(){beforeSend()};
            completeSend_ = function(){completeSend()};
        }

        //var $weekNum4 = $('#weekNum_4').attr('data-date');
        //var today_form = $weekNum4.substr(0,4)+'-'+$weekNum4.substr(4,2)+'-'+$weekNum4.substr(6,2);

        $.ajax({
            url: '/trainer/get_trainer_schedule/',
            type : 'POST',
            data : {"date":today_form, "day":3},
            dataType : 'html',

            beforeSend:function(){
                beforeSend_();
                $('.ymdText-pc-add-off, .ymdText-pc-add-pt').addClass('disabled_button').attr('onclick','');
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray);
                }else{
                    set_schedule_time_day(jsondata);
                }

                completeSend_();

                $('.ymdText-pc-add div').removeClass('disabled_button');
                $('.ymdText-pc-add-pt').attr('onclick','float_btn_addplan(1)');
                $('.ymdText-pc-add-off').attr('onclick','float_btn_addplan(2)');

            },

            complete:function(){

            },

            error:function(){
                console.log('server error');
            }
        })
    }


    function set_schedule_time_day(jsondata){
        $('.classTime, .offTime, .groupTime').parent().html('<div></div>');
        $('._on').removeClass('_on');
        initialJSON = jsondata;
        if(bodywidth > 600){
            scheduleTime_day('class', jsondata);
            scheduleTime_day('group', jsondata);
            scheduleTime_day('off', jsondata);
            //fake_show();
        }else if(bodywidth <= 600){
            scheduleTime_day('class', jsondata);
            scheduleTime_day('group', jsondata);
            scheduleTime_day('off', jsondata);
            //scheduleTime_Mobile('class', jsondata);
            //scheduleTime_Mobile('off', jsondata);
            //scheduleTime_Mobile('group', jsondata);
            //fake_show();
        }
    }


    function scheduleTime_day(option, jsondata){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
        var plan = '';
        var planStartDate = '';
        var planGroupStartDate = '';
        var planEndDate = '';
        var planMemberName = '';
        var planScheduleIdArray = '';
        var planNoteArray = '';
        var planScheduleFinishArray = '';
        var planColor = '';
        var planfinished = '';
        var planMemberNum = '';
        var planMemberDbid = '';
        var planGroupid = '';
        var planCode = '';
        switch(option){
            case 'class':
                plan = option;
                planStartDate = jsondata.classTimeArray_start_date;
                planGroupStartDate = jsondata.group_schedule_start_datetime;
                planEndDate = jsondata.classTimeArray_end_date;
                planMemberName = jsondata.classTimeArray_member_name;
                planMemberDbid = jsondata.classTimeArray_member_id;
                planScheduleIdArray = jsondata.scheduleIdArray;
                planNoteArray = jsondata.scheduleNoteArray;
                planScheduleFinishArray = jsondata.scheduleFinishArray;
                planColor = 'classTime';
                planfinished = ' classTime_checked';
                planMemberNum = '';
                planGroupid = '';
                planCode = '';
                break;
            case 'off':
                plan = option;
                planGroupid = '';
                planStartDate = jsondata.offTimeArray_start_date;
                planGroupStartDate = jsondata.group_schedule_start_datetime;
                planEndDate = jsondata.offTimeArray_end_date;
                planScheduleIdArray = jsondata.offScheduleIdArray;
                planScheduleFinishArray = '';
                planNoteArray = jsondata.offScheduleNoteArray;
                planColor = 'offTime';
                planMemberNum = '';
                planMemberDbid = '';
                planCode = '';
                break;
            case 'group':

                plan = option;
                planStartDate = jsondata.group_schedule_start_datetime;
                planGroupStartDate = jsondata.group_schedule_start_datetime;
                planEndDate = jsondata.group_schedule_end_datetime;
                planMemberName = jsondata.group_schedule_group_name;
                planGroupid = jsondata.group_schedule_group_id;
                planScheduleIdArray = jsondata.group_schedule_id;
                planNoteArray = jsondata.group_schedule_note;
                planScheduleFinishArray = jsondata.group_schedule_finish_check;
                planColor = 'groupTime';
                planfinished = ' groupTime_checked';
                planMemberNum = jsondata.group_schedule_max_member_num;
                planMemberDbid = '';
                planCode = '';
                break;
        }

        //2018_4_22_8_30_2_OFF_10_30

        var planheight = 150;
        if($calendarWidth>=600){
            planheight = 150;
        }
        var len = planScheduleIdArray.length;
        for(var i=0; i<len; i++){
            //2018-05-11 10:00:00
            var planYear    = Number(planStartDate[i].split(' ')[0].split('-')[0]);
            var planMonth   = Number(planStartDate[i].split(' ')[0].split('-')[1]);
            var planDate    = Number(planStartDate[i].split(' ')[0].split('-')[2]);
            var planHour    = Number(planStartDate[i].split(' ')[1].split(':')[0]);
            var planMinute  = planStartDate[i].split(' ')[1].split(':')[1];
            var planEDate   = Number(planEndDate[i].split(' ')[0].split('-')[2]);
            var planEndHour = Number(planEndDate[i].split(' ')[1].split(':')[0]);
            var planEndMin  = planEndDate[i].split(' ')[1].split(':')[1];
            var memberName = 'OFF';
            var hourType = '오전';
            if(plan == 'off'){
                if(planNoteArray[i].length > 0){
                    memberName = planNoteArray[i];
                }else{
                    memberName = 'OFF';
                }
            }else{
                memberName  = planMemberName[i];
            }

            if(compare_time(add_time(planHour+':'+planMinute, '00:00'), add_time(Options.workStartTime+':00','00:00')) == false && compare_time(add_time(planEndHour+':'+planEndMin, '00:00'), add_time(Options.workStartTime+':00','00:00')) ){
                planHour = Options.workStartTime;
                planMinute = '00';
            }

            var planDuraMin = calc_duration_by_start_end_2(planStartDate[i].split(' ')[0], add_time(planHour+':'+planMinute,'00:00'), planEndDate[i].split(' ')[0], add_time(planEndHour+':'+planEndMin,'00:00') )
            var planDura = planDuraMin/60;

            if(planHour < 12){
                hourType = '오전';
            }else{
                if(planHour == 24){
                    hourType = '오전';
                }else{
                    hourType = '오후';
                }
            }


            var planArray = [planYear, planMonth, planDate, planHour, planMinute, planDura, memberName, planEndHour, planEndMin];
            //var planStartArr = [planYear, planMonth, planDate, planHour, planMinute];
            var planStartArr = [planYear, planMonth, planDate, planHour, '00'];
            var planStart = planStartArr.join("_");
            var planStartDiv = $("#"+planStart);
            var tdPlanStart = $("#"+planStart+" div");
            var tdPlan = $("#"+planStart);
            tdPlan.parent('div').siblings('.fake_for_blankpage').css('display','none');

            var planColor_ = planColor+planfinished;
            var textcolor = "bluetext";
            var hideornot = 'hideelement';
            if(option != 'off'){
                if(planScheduleFinishArray[i] == 1){
                    planColor_ = planColor+planfinished;
                }else{
                    planColor_ = planColor;
                }
            }else{
                planColor_ = planColor;
            }

            if(jsondata.group_schedule_current_member_num[i] != jsondata.group_schedule_max_member_num[i]){
                textcolor = "bluetext";
            }else{
                textcolor = "";
            }

            //일정이 작아지면 안에 텍스트를 숨긴다
            if(Number(planDura*planheight-1) < 59){
                hideornot = 'hideelement';
            }else{
                hideornot = 'inlineelement';
            }
            //일정이 작아지면 안에 텍스트를 숨긴다

            if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
                if(planStartDiv.find('div['+'class-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                    planStartDiv.append('<div class-time="'+planArray.join('_')+
                                           '" class-schedule-id="'+planScheduleIdArray[i]+
                                           '" data-starttime="'+planStartDate[i]+
                                           '" data-groupid="'+planGroupid[i]+
                                           '" data-membernum="'+planMemberNum[i]+
                                           '" data-memo="'+planNoteArray[i]+
                                           '" data-schedule-check="'+planScheduleFinishArray[i]+
                                           '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                           '" data-dbid="'+planMemberDbid[i]+
                                           '" data-memberName="'+memberName+
                                           '" class="'+planColor_+
                                           '" style="height:'+Number(planDura*planheight-1)+'px;'+
                                                     'top:'+Number(planArray[4])+'px;'+
                                           '">'+
                                                '<span class="memberName">'+planCode+memberName+' </span>'+
                                                '<span class="memberTime">'+ 
                                                    '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+
                                                '</span>'+

                                        '</div>'
                                        )
                    /*
                    planStartDiv.attr('class-time' , planArray.join('_')) //planArray 2018_5_25_10_00_1_스노우_11_00
                                .attr('class-schedule-id' , planScheduleIdArray[i])
                                .attr({'data-starttime':planStartDate[i], 'data-groupid':planGroupid[i],'data-membernum':planMemberNum[i], 'data-memo' : planNoteArray[i],
                                    'data-schedule-check' : planScheduleFinishArray[i], 'data-lectureId' : jsondata.classArray_lecture_id[i], 'data-dbid' : planMemberDbid[i], 'data-memberName' : memberName, })
                                .addClass(planColor_)
                                .css({'height':Number(planDura*planheight-1)+'px', 'top':Number(planArray[4])})
                                .html('<span class="memberName">'+planCode+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>');
                    */
                }

                
            }else if(option == 'group'){
                if(planStartDiv.find('div['+'group-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                    planStartDiv.append('<div group-time="'+planArray.join('_')+
                                           '" group-schedule-id="'+planScheduleIdArray[i]+
                                           '" data-starttime="'+planStartDate[i]+
                                           '" data-groupid="'+planGroupid[i]+
                                           '" data-membernum="'+planMemberNum[i]+
                                           '" data-memo="'+planNoteArray[i]+
                                           '" data-schedule-check="'+planScheduleFinishArray[i]+
                                           '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                           '" data-dbid="'+planMemberDbid[i]+
                                           '" data-memberName="'+memberName+
                                           '" class="'+planColor_+
                                           '" style="height:'+Number(planDura*planheight-1)+'px;'+
                                                     'top:'+Number(planArray[4])+'px;'+
                                           '">'+
                                                '<span class="memberName">'+
                                                        '<p class="groupnametag">'+planCode+memberName+'</p>'+
                                                        '<span class="groupnumstatus '+textcolor+' '+hideornot+'">('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span> '+
                                                        '</span>'+'<span class="memberTime">'+ 
                                                            '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+
                                                '</span>'+

                                        '</div>'
                                        )
     
                }
                /*
                planStartDiv.attr('group-time' , planArray.join('_')) //planArray 2018_5_25_10_00_1_스노우_11_00
                    .attr('group-schedule-id' , planScheduleIdArray[i])
                    .attr({'data-starttime':planStartDate[i], 'data-groupid':planGroupid[i],'data-membernum':planMemberNum[i],'data-memo' : planNoteArray[i],
                        'data-schedule-check' : planScheduleFinishArray[i], 'data-lectureId' : jsondata.classArray_lecture_id[i], 'data-dbid' : planMemberDbid[i], 'data-memberName' : memberName, })
                    .addClass(planColor_)
                    .css({'height':Number(planDura*planheight-1)+'px', 'top':Number(planArray[4])})
                    .html('<span class="memberName">'+'<p class="groupnametag">'+planCode+memberName+'</p>'+'<span class="groupnumstatus '+textcolor+' '+hideornot+'">('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span>'+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>');
                */
            }else if(option == 'off'){
                if(planStartDiv.find('div['+'off-schedule-id='+planScheduleIdArray[i]+']').length == 0){
                    planStartDiv.append('<div off-time="'+planArray.join('_')+
                                           '" off-schedule-id="'+planScheduleIdArray[i]+
                                           '" data-starttime="'+planStartDate[i]+
                                           '" data-groupid="'+planGroupid[i]+
                                           '" data-membernum="'+planMemberNum[i]+
                                           '" data-memo="'+planNoteArray[i]+
                                           '" data-schedule-check="'+planScheduleFinishArray[i]+
                                           '" data-lectureId="'+jsondata.classArray_lecture_id[i]+
                                           '" data-dbid="'+planMemberDbid[i]+
                                           '" data-memberName="'+memberName+
                                           '" class="'+planColor_+
                                           '" style="height:'+Number(planDura*planheight-1)+'px;'+
                                                     'top:'+Number(planArray[4])+'px;'+
                                           '">'+
                                                '<span class="memberName">'+planCode+memberName+' </span>'+
                                                '<span class="memberTime">'+ 
                                                    '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+
                                                '</span>'+
                                        '</div>'
                                        )
     
                }


                /*            
                planStartDiv.attr('off-time' , planArray.join('_')) //planArray 2018_5_25_10_00_1_스노우_11_00
                    .attr('off-schedule-id' , planScheduleIdArray[i])
                    .attr({'data-starttime':planStartDate[i], 'data-groupid':planGroupid[i],'data-membernum':planMemberNum[i],'data-memo' : planNoteArray[i],
                        'data-schedule-check' : planScheduleFinishArray[i], 'data-lectureId' : jsondata.classArray_lecture_id[i], 'data-dbid' : planMemberDbid[i], 'data-memberName' : memberName, })
                    .addClass(planColor_)
                    .css({'height':Number(planDura*planheight-1)+'px', 'top':Number(planArray[4])})
                    .html('<span class="memberName">'+planCode+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>');
                */
            }


            var hhh = Number(planHour);
            var mmm = planMinute;
            /*
            for(var j=0; j<planDura/0.5; j++){
                if(mmm == 60){
                    hhh = hhh + 1;
                    mmm = '00';
                }
                console.log('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm)
                $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm).addClass('_on');
                mmm = Number(mmm) + 30;
            }*/

            var lens = parseInt(planDura)+1
            if(mmm !='00' && mmm != 30){
                mmm = '00'
                lens = parseInt(planDura)+2
            }

            for(var j=0; j<lens; j++){
                if(mmm == 60){
                    hhh = hhh+1;
                    mmm = '00';
                }
                $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm).addClass('_on');
                mmm = Number(mmm) + 30;
            }

        }
    }








    function dateText(){ //
        //currentYMD 형식  ex : 2017_8_4_5H
        var index = Number(myswiper.activeIndex)+1;
        var currentYMD = $('.swiper-slide:nth-child('+index+') div').attr('id');
        if(currentYMD==undefined){
            $('#yearText').text('-');
            $('#monthText').text('-');
        }else{
            var YMDArray=currentYMD.split('_')
            var textYear = YMDArray[1] //2017
            var textMonth = YMDArray[2]; //8
            var textDate = YMDArray[3]; //4
            var monthEnglish = ['January','February','March','April','May','June','July','August','September','October','November','December']
            var dayKorea = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
            var dayJapan = ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日']
            var dayEnglish = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
            var dayTodayInfo = new Date(monthEnglish[textMonth-1]+','+textDate+','+textYear);
            var dayToday = dayTodayInfo.getDay();
            var textDay

            switch(Options.language){
                case "KOR" :
                    var year = "년 ";
                    var month = "월 ";
                    var date = "일 ";
                    var textDay = dayKorea[dayToday];
                    break;
                case "JPN" :
                    var year = "年 ";
                    var month = "月 ";
                    var date = "日 ";
                    var textDay = dayJapan[dayToday];
                    break;
                case "ENG" :
                    var year = ". ";
                    var month = ". ";
                    var date = ". ";
                    var textDay = dayEnglish[dayToday]
                    break;
            }

            $('#yearText').text(textYear+year+textMonth+month+textDate+date).attr('data-ymd',textYear+"_"+textMonth+"_"+textDate);
            $('#monthText').text(textDay);
        }
        todayIndicator();
        todayFinderArrow();
    };

    function todayIndicator(){
        var todayInfo = currentYear+"_"+currentPageMonth+"_"+currentDate
        if($('#yearText').attr('data-ymd')==todayInfo){
            $("#ymdText").addClass('todayindi').removeClass('nottodayindi')
        }else{
            $("#ymdText").removeClass('todayindi').addClass('nottodayindi')
        }
    }

    function todayFinderArrow(){
        var currentMM = String(currentPageMonth);
        var currentDD = String(currentDate);
        if(currentMM.length<2){
            var currentMM = '0'+currentMM
        }
        if(currentDD.length<2){
            var currentDD = '0'+currentDD
        }
        var todayInfo = String(currentYear) + currentMM + currentDD
        var pagedayInfo = $('#yearText').attr('data-ymd').split('_')
        var pageYY = pagedayInfo[0];
        var pageMM = pagedayInfo[1];
        var pageDD = pagedayInfo[2];
        if(pageMM.length<2){
            var pageMM = '0'+pageMM
        }
        if(pageDD.length<2){
            var pageDD = '0'+pageDD
        }
        var viewdayInfo = pageYY + pageMM + pageDD
        if(viewdayInfo>todayInfo){
            $('._pinkarrowbefore').removeClass('setunVisible')
            $('._pinkarrowafter').addClass('setunVisible')
        }else if(viewdayInfo<todayInfo){
            $('._pinkarrowafter').removeClass('setunVisible')
            $('._pinkarrowbefore').addClass('setunVisible')
        }else{
            $('._pinkarrowafter, ._pinkarrowbefore').addClass('setunVisible')
        }
    }

    function addcurrentTimeIndicator(){ //현재 시간에 밑줄 긋기
        var where = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+currentHour+'H'
        var where3 = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+Number(currentHour+1)+'H'
        if($('.currentTimeBox').length==""){
            $(where).parent('div').append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
            $(where3).parent('div').append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
        }
    }

    function addcurrentTimeIndicator_blackbox(){ //현재 시간에 밑줄 긋기
        var where = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+currentHour+'H .hour'
        $(where).addClass('currentTimeBlackBox');

    }

    function scrollToIndicator(){
        var offset = $('.currentTimeBlackBox').offset();
        if(offset!=undefined){
            $('#slide10').animate({scrollTop : offset.top-180},500)
        }
    }

    function scrollToDom(dom){
        var offset = dom.offset();
        $('body, html').animate({scrollTop : offset.top-180},10)
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

    function DBrepeatdata(repeat,option){ // 김선겸_tue_16_1_fri_10_2_20171203_20180301  이름_요일_시작시간_진행시간_시작시간_진행시간_반복시작날짜_반복종료날짜

        switch(option){
            case 'class':
                var cssClass= 'classTime classTime_re'
                var attr = 'class-time'
                break;
            case 'off':
                var cssClass= 'offTime offTime_re'
                var attr = 'off-time'
                break;
        }
        var len = repeat.length;
        for(var j=1; j<=29; j++){
            var page = '#slide'+j;

            for(var i=0; i<len; i++){
                var arry = repeat[i].split('_');
                var who = arry[0];
                var day = arry[1];
                var time = arry[2];
                var dur = arry[3];
                var etime = time + dur
                var start = arry[4];
                var end = arry[5];
                var days = ['','','sun','mon','tue','wed','thr','fri','sat'];

                var loc_ = $(page+' tr td:nth-child('+days.indexOf(day)+')').attr('id') //2017_12_11_5_00
                var loc_a = loc_.split('_')

                var idYear = loc_a[0]
                var idMonth = loc_a[1]
                var idDay = loc_a[2]
                if(idDay.length<2){
                    var idDay = '0'+idDay
                }
                if(idMonth.length<2){
                    var idMonth = '0'+idMonth
                }

                console.log(idYear,idMonth,idDay)


                if(idYear+idMonth+idDay>=start && idYear+idMonth+idDay<=end){
                    if(idDay.substr(0,1)=='0'){
                        var idDay = idDay.substr(1,1);
                    }
                    if(idMonth.substr(0,1)=='0'){
                        var idMonth = idMonth.substr(1,1);
                    }
                    var loc = $('#'+idYear+'_'+idMonth+'_'+idDay+'_'+time+'_00')
                    loc.find('div').attr('data-memberName',who).attr(attr,idYear+'_'+idMonth+'_'+idDay+'_'+time+'_00_'+dur+'_'+who+'_'+etime+'_00').addClass(cssClass).css({'height':Number(dur*30)+'px'}).html('<span class="memberName">'+who+' </span>'+'<span class="memberTime">'+time+':'+'00'+'</span>');
                } //2017_12_13_6_00_1_지창욱_7_00
            }
        }
    }

    function startTimeSet(){   // offAddOkArray의 값을 가져와서 시작시간에 리스트 ex) var offAddOkArray = [5,6,8,11,15,19,21];
        startTimeArraySet(); //DB로 부터 데이터 받아서 선택된 날짜의 offAddOkArray 채우기
        var offOkLen = offAddOkArray.length
        var startTimeList = $('#starttimes,#starttimes_off');
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

});//document(ready)

