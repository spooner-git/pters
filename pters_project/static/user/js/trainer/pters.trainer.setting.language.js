$(document).ready(function(){

    initial_language_setting_value()
    var select_all_check = false;


    $('ul li a').click(function(){
        $(this).parents('ul').siblings('button').addClass("dropdown_selected").text($(this).text()).val($(this).attr('data-lang'))
        $('#id_setting_language').val($(this).attr('data-lang'))
        console.log($(this).attr('data-lang'))
        check_dropdown_selected();
    })

    $("#upbutton-check").click(function(){
       if(select_all_check==true){
           document.getElementById('update-setting-language-form').submit();
       }else{
           
       }
    })

    $('#upbutton-x').click(function(){
      location.href="/trainer/trainer_setting/"
    })

    function check_dropdown_selected(){ //회원명, 날짜, 진행시간, 시작시간을 모두 선택했을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
      if($('#languageSelect button').val() != Options.language){
          select_all_check=true;
          $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
       }else{
          select_all_check=false;
          $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
       }
    }

    function initial_language_setting_value(){
        var init_value = Options.language;
        var text = $('a[data-lang='+init_value+']').text()
        $('#id_setting_language').val(init_value)
        $('#languageSelect button').addClass("dropdown_selected").text(text).val(init_value)
    }

});