var current_activated_popup_num = 0;
function layer_popup(option, popup_name){
    var $popup = $(`#${popup_name}`);
    switch(option){
        case "open":
            current_activated_popup_num++;
            $popup.css({"transform":"translateX(0)", "transition":"transform 0.3s ease-in-out", "z-index":100*current_activated_popup_num});
            $popup.find('.popup_mobile_content').css({"height":windowHeight - 55 + 'px'});

            $('nav, .content_page').css({"transform":"translateX(-100%)", "transition":"transform 0.3s ease-in-out"});

            // $('#pters_mobile_side_menu').css({"transform":"translateX(0)", "transition":"0.5s"});
        break;
        case "close":
            current_activated_popup_num--;
            $popup.css({"transform":"translateX(100%)"});
            $('nav, .content_page').css({"transform":"translateX(0%)", "transition":"transform 0.3s ease-in-out"});
        break;
    }
}
