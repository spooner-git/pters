$(document).ready(function(){

    var date = new Date();
    var currentYear = date.getFullYear(); //현재 년도
    var currentMonth = date.getMonth(); //달은 0부터 출력해줌 0~11
    var currentDate = date.getDate(); //오늘 날짜
    var currentDayinfo = date.getDay(); //오늘 요일
    var currentDay = ['일','월','화','수','목','금','토']
    var currentDayJP = ['日','月','火','水','木','金','土']
    var currentDayEN = ['SUN','MON','TUE','WED','THR','FRI','SAT']


    var monthtext
    var yeartext
    var datetext
    var todayplantext

    if(Options.language=="KOR"){
        var monthtext = "월 ";
        var yeartext = "년 ";
        var datetext = currentDay[currentDayinfo]
        var todayplantext = "오늘의 일정"
    }else if(Options.language=="JPN"){
        var monthtext = "月 "
        var yeartext = "年 "
        var datetext = currentDayJP[currentDayinfo]
        var todayplantext = "今日の日程"
    }else if(Options.language=="ENG"){
        var monthtext = ", "
        var yeartext = " "
        var datetext = currentDayEN[currentDayinfo]
        var todayplantext = "Today's Lecture"
    }

    $('.center_box_day p').text(currentDate+','+datetext); //일, 요일 표시
    $('.center_box_monthyear p').text(currentYear+yeartext+(Number(currentMonth)+1)+monthtext); //월, 연도 표시
    $('.center_box_plan p').text(todayplantext)

    $(window).scroll(function(){
        var navLoc = $('#pcver').offset().top;
        console.log(navLoc)
        if(navLoc > 1){
            $('#pcver').css({'background':'#101010'})
        }else{
            $('#pcver').css({'background':'transparent'})
        }
    })


    $('#loginInfo').find('img:nth-of-type(2)').attr('src','/static/user/res/icon-name-w.png')
    $('.bottomfooter2').find('img').attr('src','/static/user/res/spooner.png')
    $('.bottomfooter3').find('img').attr('src','/static/user/res/spooner.png')

    var bodywidth = $('body').width()
    /*
    if(class_name.match(/발레/)　|| class_name.match(/ballet/) ||class_name.match(/バレエ/)){
        $('body').addClass('bg_ballet')
    }else if(class_name.match(/요가/) || class_name.match(/Yoga/) || class_name.match(/ヨガ/)){
        $('body').addClass('bg_yoga')
    }else if(class_name.match(/웨이트/)|| class_name.match(/PT/) || class_name.match(/피티/) ){
        $('body').addClass('bg_weight')
    }else if(class_name.match(/필라테스/)|| class_name.match(/pilates/) || class_name.match(/기구필라테스/) ){
        $('body').addClass('bg_pilates')
    }else if(class_name.match(/당구/)|| class_name.match(/billiard/) || class_name.match(/ビリヤード/) ){
        $('body').addClass('bg_billiard')
    }else if(class_name.match(/골프/)|| class_name.match(/golf/) || class_name.match(/ゴルフ/) ){
        $('body').addClass('bg_golf')
    }else{
        $('body').addClass('bg_brick')
    }
    */

    /*
    if(class_code.match(/BL/)){
        $('body').addClass('bg_ballet')
    }else if(class_code.match(/YG/)){
        $('body').addClass('bg_yoga')
    }else if(class_code.match(/WT/)){
        $('body').addClass('bg_weight')
    }else if(class_code.match(/PI/)){
        $('body').addClass('bg_pilates')
    }else if(class_code.match(/BILLIARD/)){
        $('body').addClass('bg_billiard')
    }else if(class_code.match(/GOLF/)){
        $('body').addClass('bg_golf')
    }else{
        $('body').addClass('bg_basic')
    }
    */

    var width_size = window.outerWidth;
    if(class_background_img_url.length == 0){
        if(width_size > 600){
            $('html').css('background-image',"url(/static/user/res/main/bg-image-basic2-pc.jpg)");
        }else{
            $('html').css('background-image',"url(/static/user/res/main/bg-image-basic2-mobile.jpg)");
        }

        $(window).resize(function(){
            var width_size = window.outerWidth;
            if(width_size > 600){
                $('html').css('background-image',"url(/static/user/res/main/bg-image-basic2-pc.jpg)");
            }else{
                $('html').css('background-image',"url(/static/user/res/main/bg-image-basic2-mobile.jpg)");
            }
        })
    }else{
        if(width_size > 600){
            $('html').css('background-image',"url('"+class_background_img_url[0].replace(/\)/gi,"")+"')");
        }else{
            $('html').css('background-image',"url('"+class_background_img_url[1].replace(/\)/gi,"")+"')");
        }

        $(window).resize(function(){
            var width_size = window.outerWidth;
            if(width_size > 600){
                $('html').css('background-image',"url('"+class_background_img_url[0].replace(/\)/gi,"")+"')");
            }else{
                $('html').css('background-image',"url('"+class_background_img_url[1].replace(/\)/gi,"")+"')");
            }
        });
    }



});

