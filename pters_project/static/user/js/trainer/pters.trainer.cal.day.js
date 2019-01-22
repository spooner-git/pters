$(document).ready(function(){

    /*
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
    */

    var schedule_on_off = 0; //0 : OFF Schedule / 1 : PT Schedule

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
        dateText_day();
        slideControl.append();

    });

    //이전페이지로 슬라이드 했을때 액션
    myswiper.on('onSlidePrevEnd',function(){
        dateText_day();
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
            var lastYY = Number(lastdateinfo[1]);
            var lastMM = Number(lastdateinfo[2]);
            var lastDD = Number(lastdateinfo[3]);
            myswiper.removeSlide(0); //맨 앞장 슬라이드 지우기
            myswiper.appendSlide('<div class="swiper-slide" id="slide'+(last+1)+'"></div>') //마지막 슬라이드에 새슬라이드 추가

            var thisday = date_format_yyyy_m_d_to_yyyy_mm_dd(lastYY+'_'+lastMM+'_'+lastDD, '-');
            var a_day_later = add_date(thisday,1).split('-')
            var t_year = Number(a_day_later[0]);
            var t_month = Number(a_day_later[1]);
            var t_date  = Number(a_day_later[2]);

            calTable_Set_day(last+1,t_year,t_month,t_date); //새로 추가되는 슬라이드에 달력 채우기
            ajaxClassTime_day();
        },

        'prepend' : function(){
            var first = Number($('.swiper-slide:first-child').attr('id').replace(/slide/gi,""));
            var firstdateinfo = $('.swiper-slide:first-child').find('div').attr('id').split('_');
            var firstYY = firstdateinfo[1];
            var firstMM = firstdateinfo[2];
            var firstDD = firstdateinfo[3];
            myswiper.removeSlide(4);
            myswiper.prependSlide('<div class="swiper-slide" id="slide'+(first-1)+'"></div>'); //맨앞에 새슬라이드 추가

            var thisday = date_format_yyyy_m_d_to_yyyy_mm_dd(firstYY+'_'+firstMM+'_'+firstDD, '-');
            var a_day_early = substract_date(thisday,-1).split('-')
            var y_year = Number(a_day_early[0]);
            var y_month = Number(a_day_early[1]);
            var y_date  = Number(a_day_early[2]);

            calTable_Set_day(first-1,y_year,y_month,y_date);
            ajaxClassTime_day();
        }
    };

    day_calendar(today_YY_MM_DD)
    ajaxClassTime_day();
    dateText_day(); //상단에 연월일요일 표시
    //addcurrentTimeIndicator_blackbox(); //현재 시간 검은색 Background 표시
});//document(ready)

    function day_calendar(referencedate){
        var page1 = $('.swiper-slide:nth-of-type(1)');
        var page2 = $('.swiper-slide:nth-of-type(2)');
        var page3 = $('.swiper-slide:nth-of-type(3)');

        var page1_id_num = $('.swiper-slide:nth-of-type(1)').attr('id').replace(/slide/gi,'');
        var page2_id_num = $('.swiper-slide:nth-of-type(2)').attr('id').replace(/slide/gi,'');
        var page3_id_num = $('.swiper-slide:nth-of-type(3)').attr('id').replace(/slide/gi,'');

        page1.html('')
        page2.html('')
        page3.html('')

        var year = Number(referencedate.split('-')[0]);
        var month = Number(referencedate.split('-')[1]);
        var date = Number(referencedate.split('-')[2]);

        var yesterday = substract_date(referencedate, -1).split('-');
        var tomorrow  = add_date(referencedate, 1).split('-');

        var y_year = yesterday[0];
        var y_month = yesterday[1];
        var y_date = yesterday[2];
        var t_year = tomorrow[0];
        var t_month = tomorrow[1];
        var t_date = tomorrow[2]; 

        calTable_Set_day(page1_id_num,y_year,y_month,y_date)
        calTable_Set_day(page2_id_num,year,month,date)
        calTable_Set_day(page3_id_num,t_year,t_month,t_date)

        $('.swiper-slide-active').css('width',$('#week').width())
        dateText_day();
        //addcurrentTimeIndicator_blackbox();
        ajaxClassTime_day();
    }

    function day_calendar_mobile(referencedate){
        var page1 = $('.swiper-slide:nth-of-type(1)');
        var page2 = $('.swiper-slide:nth-of-type(2)');
        var page3 = $('.swiper-slide:nth-of-type(3)');

        var page1_id_num = $('.swiper-slide:nth-of-type(1)').attr('id').replace(/slide/gi,'');
        var page2_id_num = $('.swiper-slide:nth-of-type(2)').attr('id').replace(/slide/gi,'');
        var page3_id_num = $('.swiper-slide:nth-of-type(3)').attr('id').replace(/slide/gi,'');

        page1.html('')
        page2.html('')
        page3.html('')

        var year = Number(referencedate.split('-')[0]);
        var month = Number(referencedate.split('-')[1]);
        var date = Number(referencedate.split('-')[2]);

        var yesterday = substract_date(referencedate, -1).split('-');
        var tomorrow  = add_date(referencedate, 1).split('-');

        var y_year = yesterday[0];
        var y_month = yesterday[1];
        var y_date = yesterday[2];
        var t_year = tomorrow[0];
        var t_month = tomorrow[1];
        var t_date = tomorrow[2]; 

        calTable_Set_day(page1_id_num,y_year,y_month,y_date)
        calTable_Set_day(page2_id_num,year,month,date)
        calTable_Set_day(page3_id_num,t_year,t_month,t_date)

        $('.swiper-slide-active').css('width',$('#week').width())
        dateText_day();
        //addcurrentTimeIndicator_blackbox();
        ajaxClassTime_day();
    }



    function calTable_Set_day(Index,Year,Month,Day){ //선택한 Index를 가지는 슬라이드에 시간 테이블을 생성
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
        var textToAppend = '<div id="'+'wrap_'+Year+'_'+Month+'_'+Day+'" class="time-style time-row"'+'>'
        var slidegap = '<div class="slidegap_day"></div>'
        var textToAppend2 = '<div id="'+Year+'_'+Month+'_'+Day+'" class="daycal_plan_window"></div>';
        var sum = textToAppend+slidegap+textToAppend2 + '</div>'
        slideIndex.html(sum);
        time_index_set_day();
        $('.swiper-slide').css('height',$('div.timeindex_day').height())
    }; //calTable_Set


    function time_index_set_day(){
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

    function ajaxClassTime_day(use, callfunction){
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

        var activedate = $('.swiper-slide-active').find('div').attr('id').split('_')
        var today_form = date_format_yyyy_m_d_to_yyyy_mm_dd(activedate[1]+'-'+activedate[2]+'-'+activedate[3],'-')
        $.ajax({
            url: '/trainer/get_trainer_schedule/',
            type : 'GET',
            data : {"date":today_form, "day":5},
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
        if(bodywidth >= 600){
            scheduleTime_day('class', jsondata);
            scheduleTime_day('group', jsondata);
            scheduleTime_day('off', jsondata);
            //fake_show();
        }else if(bodywidth < 600){
            scheduleTime_day_Mobile('class', jsondata);
            scheduleTime_day_Mobile('group', jsondata);
            scheduleTime_day_Mobile('off', jsondata);
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
        if(bodywidth>=600){
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
            var planStartArr = [planYear, planMonth, planDate];
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


    function scheduleTime_day_Mobile(option, jsondata){ // 그룹 수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
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
        var len = planScheduleIdArray.length;

        var date_sorted = {};

        for(var j=0; j<len; j++){
            var planYear    = Number(planStartDate[j].split(' ')[0].split('-')[0]);
            var planMonth   = Number(planStartDate[j].split(' ')[0].split('-')[1]);
            var planDate    = Number(planStartDate[j].split(' ')[0].split('-')[2]);
            date_sorted[planYear+'_'+planMonth+'_'+planDate] = []
        }

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
            var planDura = "0.5";
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
            var planStartArr = [planYear, planMonth, planDate];
            var planStart = planStartArr.join("_");
            var tdPlanStart = $("#"+planStart+" div"); //2018_7_8
            var tdPlan = $("#"+planStart);
            //tdPlan.parent('div').siblings('.fake_for_blankpage').css('display','none');

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

            if(Number(planDura*planheight-1) < 59){
                hideornot = 'hideelement';
            }else{
                hideornot = 'inlineelement';
            }



            if(option == 'class' && planGroupStartDate.indexOf(planStartDate[i]) == -1){
                var innerNameTag = '<span class="memberName">'+planCode+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>'
                planhtml = '<div class-time="'+planArray.join('_')+
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
                            '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+(planheight*(planHour-Options.workStartTime)+planheight*planMinute/60)+'px;'+
                            '">'+
                                innerNameTag+
                           '</div>'
                date_sorted[planStart].push(planhtml)
            }else if(option == 'group'){
                var innerNameTag = '<span class="memberName">'+'<p class="groupnametag">'+planCode+memberName+'</p>'+'<span class="groupnumstatus '+textcolor+' '+hideornot+'">('+jsondata.group_schedule_current_member_num[i]+'/'+jsondata.group_schedule_max_member_num[i]+') </span>'+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>';
                planhtml = '<div group-time="'+planArray.join('_')+
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
                            '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+(planheight*(planHour-Options.workStartTime)+planheight*planMinute/60)+'px;'+
                            '">'+
                                innerNameTag+
                           '</div>'
                date_sorted[planStart].push(planhtml)
            }else if(option == 'off'){
                var innerNameTag = '<span class="memberName">'+planCode+memberName+' </span>'+'<span class="memberTime">'+ '<p class="hourType">' +hourType+'</p>' + planHour+':'+planMinute+'</span>';
                planhtml = '<div off-time="'+planArray.join('_')+
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
                            '" style="height:'+Number(planDura*planheight-1)+'px;'+'top:'+(planheight*(planHour-Options.workStartTime)+planheight*planMinute/60)+'px;'+
                            '">'+
                                innerNameTag+
                           '</div>'
                date_sorted[planStart].push(planhtml)
            }

            /*
            var hhh = Number(planHour);
            var mmm = planMinute;

            for(var j=0; j<planDura/0.5; j++){
                if(mmm == 60){
                    hhh = hhh + 1;
                    mmm = '00';
                }
                $('#'+planYear+'_'+planMonth+'_'+planDate+'_'+hhh+'_'+mmm).addClass('_on');
                mmm = Number(mmm) + 30;
            }
            */
        }
        for(date in date_sorted){
            $('#'+date).append(date_sorted[date].join(''))
        }
    }

    function dateText_day(){ //
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
        todayFinderArrow_day();
    };

    function todayFinderArrow_day(){
        var todayInfo1 = date_format_yyyy_mm_dd_to_yyyy_m_d(today_YY_MM_DD,'_');
        if($('#yearText').attr('data-ymd')==todayInfo1){
            $("#ymdText").addClass('todayindi').removeClass('nottodayindi');
        }else{
            $("#ymdText").removeClass('todayindi').addClass('nottodayindi');
        }

        var todayInfo = today_YY_MM_DD;
        var viewdayInfo = date_format_yyyy_m_d_to_yyyy_mm_dd($('#yearText').attr('data-ymd'),'-');
        if(viewdayInfo>todayInfo){
            $('._pinkarrowbefore').removeClass('setunVisible');
            $('._pinkarrowafter').addClass('setunVisible')
        }else if(viewdayInfo<todayInfo){
            $('._pinkarrowafter').removeClass('setunVisible');
            $('._pinkarrowbefore').addClass('setunVisible');
        }else{
            $('._pinkarrowafter, ._pinkarrowbefore').addClass('setunVisible');
        }
    }

    function addcurrentTimeIndicator_day(){ //현재 시간에 밑줄 긋기
        var where = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+currentHour+'H'
        var where3 = '#'+currentYear+'_'+currentPageMonth+'_'+currentDate+'_'+Number(currentHour+1)+'H'
        if($('.currentTimeBox').length==""){
            $(where).parent('div').append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
            $(where3).parent('div').append("<div class='currentTimeBox'><div class='currentTimeIndicator'></div><div class='currentTimeLine'></div></div>")
        }
    }

    function addcurrentTimeIndicator_blackbox_day(){ //현재 시간에 밑줄 긋기
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





