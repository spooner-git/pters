$(document).ready(function(){

    $('#uptext').text('강의 금액 설정')
    $('#ten input').change(function(){
        var feeTenTimes = $('#ten input').val();
        var tenOneTime = numberWithCommas(feeTenTimes/10);
        $('#tenOneTime').text('(1회당 '+tenOneTime+' 원)').fadeIn('slow')
    })

    $('#twenty input').change(function(){
        var feeTwentyTimes = $('#twenty input').val();
        var twentyOneTime = numberWithCommas(feeTwentyTimes/20);
        $('#twentyOneTime').text('(1회당 '+twentyOneTime+' 원)').fadeIn('slow')
    })

    $('#thirty input').change(function(){
        var feeThirtyTimes = $('#thirty input').val();
        var thirtyOneTime = numberWithCommas(feeThirtyTimes/30);
        $('#thirtyOneTime').text('(1회당 '+thirtyOneTime+' 원)').fadeIn('slow')
    })

    $('#fourty input').change(function(){
        var feeFourtyTimes = $('#fourty input').val();
        var fourtyOneTime = numberWithCommas(feeFourtyTimes/40);
        $('#fourtyOneTime').text('(1회당 '+fourtyOneTime+' 원)').fadeIn('slow')
    })

    $('#fifty input').change(function(){
        var feeFiftyTimes = $('#fifty input').val();
        var fiftyOneTime = numberWithCommas(feeFiftyTimes/50);
        $('#fiftyOneTime').text('(1회당 '+fiftyOneTime+' 원)').fadeIn('slow')
    })

    $('#one input').change(function(){
        var feeOneTimes = $('#one input').val();
        var crossTen = numberWithCommas(feeOneTimes*10)
        var crossTwenty = numberWithCommas(feeOneTimes*20)
        var crossThirty = numberWithCommas(feeOneTimes*30)
        $('#oneTime').text('(10회 '+crossTen+' 원)').fadeIn('slow');
        $('#oneTime1').text('(20회 '+crossTwenty+' 원)').fadeIn('slow');
        $('#oneTime2').text('(30회 '+crossThirty+' 원)').fadeIn('slow');
    })



    $('#moreBtn').click(function(){
        if($('#fourty').css('display')=='none'){
            $('#fourty, #fifty').fadeIn('fast');
            $(this).find('img').addClass('imgRotate');
        }else{
            $('#fourty input, #fifty input').val('')
            $('#fourtyOneTime, #fiftyOneTime').text('')
            $('#fourty').fadeOut('fast');
            $('#fifty').fadeOut('fast');
            $(this).find('img').removeClass('imgRotate');
        }
    })

    $('#switch').click(function(){
        if($(this).find('.switchball').hasClass('switchoff')){
            $(this).find('.switchball').removeClass('switchoff').addClass('switchon')
            $(this).find('.switchback').addClass('switchon-back')
            //스위치 온 동작
            $('#ten input,#twenty input,#thirty input,#fourty input,#fifty input').attr({'readonly':true,'placeholder':'-'}).addClass('inputdisabled')
            $('#one').fadeIn('fast')

            //스위치 온 동작
        }else{
            $(this).find('.switchball').removeClass('switchon').addClass('switchoff')
            $(this).find('.switchback').removeClass('switchon-back')
            //스위치 오프 동작

            $('#ten input,#twenty input,#thirty input,#fourty input,#fifty input').attr({'readonly':false,'placeholder':''}).removeClass('inputdisabled')
            $('#one').fadeOut('fast')
            $('#one input').val('')
            $('#oneTime, #oneTime1, #oneTime2').text('').hide()
            //스위치 오프 동작
        }
    })


    function numberWithCommas(x) { //천단위 콤마 찍기
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

});