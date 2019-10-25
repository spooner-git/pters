$(document).ready(function(){

    var repeatData = ['김선겸_tue_16_1_20171203_20180301','김선겸_fri_7_1_20171203_20180301','박신혜_mon_16_1_20171126_20180301'];
    var offrepeatData = ['OFF_sun_5_20_20171224_20180301','OFF_sat_16_9_20171209_20180301'];

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

    //스케쥴 클릭시 팝업 Start
    $(document).on('click','div.classTime',function(){ //일정을 클릭했을때 팝업 표시
        $("#cal_popup").fadeIn('fast').css({'z-index':'103'});
        $('#shade').css({'display':'block'});
        console.log($(this).attr('class-time')); //현재 클릭한 요소의 class-time 요소 값 보기
                                                 //형식예: 2017_10_7_6_00_2_원빈
        console.log($(this).attr('schedule-id'));
        console.log('data-schedule-check::'+$(this).attr('data-schedule-check'))
        var schedule_finish_check = $(this).attr('data-schedule-check')
        var info = $(this).attr('class-time').split('_')
        var yy=info[0]
        var mm=info[1]
        var dd=info[2]
        var dayobj = new Date(yy,mm-1,dd)
        var dayraw = dayobj.getDay();
        var dayarryKR = ['일','월','화','수','목','금','토']
        var dayarryJP = ['日','月','火','水','木','金','土']
        var dayarryEN = ['Sun','Mon','Tue','Wed','Ths','Fri','Sat']
        switch(Options.language){
            case "KOR" :
                var member = " 회원님의 ";
                var yourplan = "시 일정";
                var day = dayarryKR[dayraw];
                break;
            case "JPN" :
                var member = "様の ";
                var yourplan = "時日程";
                var day = dayarryJP[dayraw];
                break;
            case "ENG" :
                var member = "'s schedule at ";
                var yourplan = ":00";
                var day = dayarryEN[dayraw];
                break;
        }
        var infoText = yy+'. '+mm+'. '+dd+' '+'('+day+')'
        var infoText2 = info[6]+member+info[3]+yourplan
        $('#popup_info').text(infoText);
        $('#popup_info2').text(infoText2);
        $("#id_schedule_id").val($(this).attr('schedule-id')); //shcedule 정보 저장
        $("#id_schedule_id_modify").val($(this).attr('schedule-id')); //shcedule 정보 저장
        $("#id_schedule_id_finish").val($(this).attr('schedule-id')); // shcedule 정보 저장
        $("#id_member_name").val($(this).attr('data-memberName')); //회원 이름 저장
        $("#id_member_name_delete").val($(this).attr('data-memberName')); //회원 이름 저장
        $("#id_member_name_finish").val($(this).attr('data-memberName')); //회원 이름 저장
        $("#id_lecture_id_modify").val($(this).attr('data-lectureId')); //lecture id 정보 저장
        $("#id_lecture_id_finish").val($(this).attr('data-lectureId')); //lecture id 정보 저장
        if(schedule_finish_check=="0"){
            $("#popup_text0").css("display","block")
            $("#popup_text1").css("display","block")
        }
        else{
            $("#popup_text0").css("display","none")
            $("#popup_text1").css("display","none")
        }
        schedule_on_off = 1;
    })


    //Off 일정 클릭시 팝업 Start
    $(document).on('click','div.offTime',function(){ //일정을 클릭했을때 팝업 표시
        $("#cal_popup").fadeIn('fast').css({'z-index':'103'});
        $('#shade').css({'display':'block'});
        console.log($(this).attr('off-time')); //현재 클릭한 요소의 class-time 요소 값 보기
        //형식예: 2017_10_7_6_00_2_원빈
        console.log($(this).attr('off-schedule-id'));
        var info = $(this).attr('off-time').split('_')
        var yy=info[0]
        var mm=info[1]
        var dd=info[2]
        var dayobj = new Date(yy,mm-1,dd)
        var dayraw = dayobj.getDay();
        var dayarryKR = ['일','월','화','수','목','금','토']
        var dayarryJP = ['日','月','火','水','木','金','土']
        var dayarryEN = ['Sun','Mon','Tue','Wed','Ths','Fri','Sat']
        switch(Options.language){
            case "KOR" :
                var comment = ""
                var yourplan = "시 OFF 일정";
                var day = dayarryKR[dayraw];
                break;
            case "JPN" :
                var comment = ""
                var yourplan = "時 OFF日程";
                var day = dayarryJP[dayraw];
                break;
            case "ENG" :
                var comment = "OFF at "
                var yourplan = ":00";
                var day = dayarryEN[dayraw];
                break;
        }
        var infoText =  yy+'. '+mm+'. '+dd+' '+'('+day+')'
        var infoText2 = comment + info[3]+yourplan
        $('#popup_info').text(infoText);
        $('#popup_info2').text(infoText2);
        $("#id_off_schedule_id").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
        $("#id_off_schedule_id_modify").val($(this).attr('off-schedule-id')); //shcedule 정보 저장
        $("#popup_text0").css("display","none")
        schedule_on_off = 0;

    })

    $("#btn_close").click(function(){  //팝업 X버튼 눌렀을때 팝업 닫기
        if($('#cal_popup').css('display')=='block'){
            $("#cal_popup").css({'display':'none','z-index':'-2'})
            $('#shade').css({'display':'none'});
        }
    })

    $('#btn_close3').click(function(){
        if($('#cal_popup3').css('display')=='block'){
            $("#cal_popup3").css({'display':'none','z-index':'-2'})
            $('#shade').css({'display':'none'});
        }
    })

    $('#popup_text4').click(function(){
        if($('#cal_popup3').css('display')=='block'){
            $("#cal_popup3").css({'display':'none','z-index':'-2'})
            $('#shade').css({'display':'none'});
        }
    })

    //스케쥴 클릭시 팝업 End

    //일정 완료 기능 추가 - hk.kim 180106
    $("#popup_text0").click(function(){  //일정 변경 버튼 클릭
        var $pt_finish_form = $('#pt-finish-form');
        if(schedule_on_off==1){
            //PT 일정 완료 처리시
            $.ajax({
                url:'/schedule/finish_schedule/',
                type:'POST',
                data:$pt_finish_form.serialize(),


                beforeSend:function(){
                    deleteBeforeSend();
                },

                //통신성공시 처리
                success:function(){
                    closeDeletePopup();
                    deleteCompleteSend();
                    ajaxClassTime()
                },

                //보내기후 팝업창 닫기
                complete:function(){

                },

                //통신 실패시 처리
                error:function(){
                    console.log("error")
                },
            })
        }
    })

    //일정 변경 기능 추가 - hk.kim 171007
    $("#popup_text1").click(function(){  //일정 변경 버튼 클릭
        if(schedule_on_off==1){
            //PT 일정 변경시
            document.getElementById('pt-modify-form').submit();
        }
        else{
            document.getElementById('off-modify-form').submit();
        }
    })

    //일정 삭제 기능 취소 - hk.kim 171007
    $("#popup_text2").click(function(){  //일정 취소 버튼 클릭
        $('#cal_popup').hide().css({'z-index':'-2'})
        $('#cal_popup3').fadeIn('fast').css({'z-index':'103'})
    })

    $('#popup_text3').click(function(){
        var $ptdelform = $('#daily-pt-delete-form');
        var $offdelform = $('#daily-off-delete-form');
        if(schedule_on_off==1){
            //PT 일정 취소시
            $.ajax({
                url:'/schedule/delete_schedule/',
                type:'POST',
                data:$ptdelform.serialize(),

                beforeSend:function(){
                    deleteBeforeSend();
                },

                //통신성공시 처리
                success:function(){
                    closeDeletePopup();
                    deleteCompleteSend();
                    ajaxClassTime()
                    console.log('success')
                },

                //보내기후 팝업창 닫기
                complete:function(){

                },

                //통신 실패시 처리
                error:function(){
                    console.log("error")
                },
            })
        }
        else{
            $.ajax({
                url:'/schedule/delete_schedule/',
                type:'POST',
                data:$offdelform.serialize(),

                beforeSend:function(){
                    deleteBeforeSend();
                },

                //통신성공시 처리
                success:function(){
                    closeDeletePopup();
                    deleteCompleteSend();
                    ajaxClassTime()
                    console.log('success')
                },

                //보내기후 팝업창 닫기
                complete:function(){

                },

                //통신 실패시 처리
                error:function(){
                    console.log("error")
                },
            })
        }
    })

    function ajaxClassTime(){

        $.ajax({
            url: '/trainer/get_trainer_schedule',
            dataType : 'html',

            beforeSend:function(){
                deleteBeforeSend();
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                classTimeArray = [];
                offTimeArray = [];
                classTimeArray_member_name = [];
                classArray_lecture_id = [];
                scheduleIdArray = [];
                offScheduleIdArray = [];
                scheduleFinishArray = [];
                scheduleNoteArray = [];
                memberIdArray = [];
                memberLectureIdArray = [];
                memberNameArray = [];
                memberAvailCountArray = [];
                messageArray = [];
                RepeatDuplicationDateArray = [];
                repeatArray= [];
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
                var updatedClassTimeArray_start_date = jsondata.classTimeArray_start_date;
                var updatedClassTimeArray_end_date = jsondata.classTimeArray_end_date;
                var updatedOffTimeArray_start_date = jsondata.offTimeArray_start_date;
                var updatedOffTimeArray_end_date = jsondata.offTimeArray_end_date;
                classTimeArray_member_name = jsondata.classTimeArray_member_name;
                classArray_lecture_id = jsondata.classArray_lecture_id;
                scheduleIdArray = jsondata.scheduleIdArray;
                offScheduleIdArray = jsondata.offScheduleIdArray;
                scheduleFinishArray = jsondata.scheduleFinishArray;
                scheduleNoteArray = jsondata.scheduleNoteArray;
                memberIdArray = jsondata.memberIdArray;
                memberLectureIdArray = jsondata.memberLectureIdArray;
                memberNameArray = jsondata.memberNameArray;
                memberAvailCountArray = jsondata.memberAvailCountArray;
                messageArray = jsondata.messageArray;
                RepeatDuplicationDateArray = jsondata.RepeatDuplicationDateArray;
                repeatArray= jsondata.repeatArray;
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
                $('.classTime,.offTime').parent().html('<div></div>');
                classTime();
                offTime();
                addPtMemberListSet();

				/*팝업의 timegraph 업데이트*/
                classDateData = [];
                classTimeData = [];
                offDateData=[];
                offTimeData = [];
                offAddOkArray = []; //OFF 등록 시작 시간 리스트
                durAddOkArray = []; //OFF 등록 시작시간 선택에 따른 진행시간 리스트
                DBdataProcess(updatedClassTimeArray_start_date,updatedClassTimeArray_end_date,classDateData,"graph",classTimeData)
                DBdataProcess(updatedOffTimeArray_start_date,updatedOffTimeArray_end_date,offDateData,"graph",offTimeData)
            },

            complete:function(){
                deleteCompleteSend();
            },

            error:function(){
                console.log('server error')
            }
        })
    }


    function closeDeletePopup(){
        if($('#cal_popup3').css('display')=='block'){
            $("#cal_popup3").css({'display':'none','z-index':'-2'})
            $('#shade').css({'display':'none','z-index':'100'});
        }
        if($('#cal_popup').css('display')=='block'){
            $("#cal_popup").css({'display':'none','z-index':'-2'})
            $('#shade').css({'display':'none','z-index':'100'});
        }
    }

    function deleteBeforeSend(){
        // $('html').css("cursor","wait");
        $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
        $('.ajaxloadingPC').show();
        $('#shade').css({'display':'block','z-index':'200'});
    }

    function deleteCompleteSend(){
        //$('html').css("cursor","auto");
        $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
        $('.ajaxloadingPC').hide();
        $('#shade').css({'display':'none','z-index':'100'});
        //alert('complete: 일정 취소 성공')
    }

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

    //아래로 스크롤중 스와이프 했을때, jquery.swipe에서 stopPropagation Error발생하여 스와이프 불가하는 현상 방지
    //스크롤중 swipe 기능막고, 스크롤 종료감지하여 종료 20ms 이후에 swipe 기능 살려주는 함수
    $(window).scroll(function(){
        myswiper.params.onlyExternal = true;
        clearTimeout($.data(this,"scrollCheck"));
        console.log('scrolling')

        var ymdTextLoc = $('#pcver').offset().top;
        if(ymdTextLoc>10){
            $('body').css('padding-top','0')
            $('#page-base').fadeOut('linear')
        }else if(ymdTextLoc<10){
            $('body').css('padding-top','50px')
            $('#page-base').show('linear')
        }

        $.data(this,"scrollCheck",setTimeout(function(){
            myswiper.params.onlyExternal = false;
            console.log('stop')
        },20))
    })

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
            classTime();
            offTime();
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
            classTime();
            offTime();
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
    classTime(); //PT수업 시간에 핑크색 박스 표시
    offTime(); //Off 시간에 회색 박스 표시
    addPtMemberListSet();

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


    function classTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
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
            if(Number(classHour)+Number(classDura)==25){	// 오전 1시에 일정이 차있을 경우 일정 박스가 Table 넘어가는 것 픽스
                if(classDura<=3){
                    if(scheduleFinishArray[i]=="0") {
                        tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-schedule-check', scheduleFinishArray[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('classTime').css({'height': Number(classDura * 35) + 'px'}).html('<span class="memberName' + classDura + '">' + memberName + ' </span>' + '<span class="memberTime' + classDura + '">' + classHour + ':' + classMinute + ' ~ ' + classEndHour + ':' + classEndMinute + '</span>');
                    }else{
                        tdClassStart.attr('schedule-id', scheduleIdArray[i]).attr('data-lectureId', classArray_lecture_id[i]).attr('data-schedule-check', scheduleFinishArray[i]).attr('data-memberName', memberName).attr('class-time', indexArray).addClass('class').css({'height': Number(classDura * 35) + 'px','background-color':'#338c14','border-color':'#338c14'}).html('<span class="memberName' + classDura + '">' + memberName + ' </span>' + '<span class="memberTime' + classDura + '">' + classHour + ':' + classMinute + ' ~ ' + classEndHour + ':' + classEndMinute + '</span>');
                    }
                }else{
                    if(scheduleFinishArray[i]=="0") {
                        tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
                    }else{
                        tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35)+'px','background-color':'#338c14','border-color':'#338c14'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
                    }
                }
            }else{
                if(classDura<=3){
                    if(scheduleFinishArray[i]=="0") {
                        tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px'}).html('<span class="memberName'+classDura+'">'+memberName+' </span>'+'<span class="memberTime'+classDura+'">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
                    }else{
                        tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px','background-color':'#338c14','border-color':'#338c14'}).html('<span class="memberName'+classDura+'">'+memberName+' </span>'+'<span class="memberTime'+classDura+'">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
                    }
                }else{
                    if(scheduleFinishArray[i]=="0") {
                        tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
                    }else{
                        tdClassStart.attr('schedule-id',scheduleIdArray[i]).attr('data-lectureId',classArray_lecture_id[i]).attr('data-schedule-check',scheduleFinishArray[i]).attr('data-memberName',memberName).attr('class-time',indexArray).addClass('classTime').css({'height':Number(classDura*35.5)+'px','background-color':'#338c14','border-color':'#338c14'}).html('<span class="memberName3">'+memberName+' </span>'+'<span class="memberTime3">'+classHour+':'+classMinute+' ~ '+classEndHour+':'+classEndMinute+'</span>');
                    }

                }
            }
        };
        $('#calendar').css('display','block');
    };

    function offTime(){ //수업정보를 DB로 부터 받아 해당 시간을 하루달력에 핑크색으로 표기
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
    };

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

