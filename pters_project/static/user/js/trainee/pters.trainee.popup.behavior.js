var popup_array = [];
function layer_popup(option, popup_name){
    switch(option){
        case "open":
            var $popup = $(`#${popup_name}`);
            if(popup_array.length == 0){
                $('nav, .content_page').css({"transform":"translateX(-100%)", "transition":"transform 0.3s ease-in-out"});
            }
            if(popup_array.indexOf(popup_name) == -1){
                popup_array.push(popup_name);
            }
            $popup.css({"transform":"translateX(0)", "transition":"transform 0.3s ease-in-out", "z-index":100*popup_array.length});
            $popup.find('.popup_mobile_content').css({"height":windowHeight - 55 + 'px', "overflow-y":"auto"});
        break;
        case "close":
            if(popup_array.length == 1){
                $('nav, .content_page').css({"transform":"translateX(0%)", "transition":"transform 0.3s ease-in-out"});
            }
            popup_name = popup_array.pop();
            var $popup = $(`#${popup_name}`);
            $popup.css({"transform":"translateX(100%)"});
        break;
        case "all_close":
            $('nav, .content_page').css({"transform":"translateX(0%)", "transition":"transform 0.3s ease-in-out"});
            var len = popup_array.length;
            for(var i=0; i<len; i++){
                $(`#${popup_array[i]}`).css({"transform":"translateX(100%)"});
            }
            popup_array = [];
        break;
    }
}
