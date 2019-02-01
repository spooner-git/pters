var current_activated_popup_num = 0;
function layer_popup(option, popup_name){
    var $popup = $(`#${popup_name}`);
    switch(option){
        case "open":
            if(current_activated_popup_num == 0){
                $('nav, .content_page').css({"transform":"translateX(-100%)", "transition":"transform 0.3s ease-in-out"});
            }
            current_activated_popup_num++;
            $popup.css({"transform":"translateX(0)", "transition":"transform 0.3s ease-in-out", "z-index":100*current_activated_popup_num});
            $popup.find('.popup_mobile_content').css({"height":windowHeight - 55 + 'px'});
            // $('#pters_mobile_side_menu').css({"transform":"translateX(0)", "transition":"0.5s"});
        break;
        case "close":
            if(current_activated_popup_num == 1){
                $('nav, .content_page').css({"transform":"translateX(0%)", "transition":"transform 0.3s ease-in-out"});
            }
            current_activated_popup_num--;
            $popup.css({"transform":"translateX(100%)"});
        break;
    }
}
