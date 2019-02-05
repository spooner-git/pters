let layer_popup = (function(){
    let popup_array = [];
    return function (option, popup_name){
        func_layer_popup(option, popup_name, popup_array);
    }
}());

function func_layer_popup(option, popup_name, popup_array){
    switch(option){
        case "open":
            //첫 팝업의 경우 옆으로 밀려나도록 보이는 효과
            if(popup_array.length == 0 && popup_name != "pters_mobile_side_menu"){
                $('nav, .content_page').css({
                    "transform":"translateX(-100%)",
                    "transition":"transform 0.3s ease-in-out"
                });
            }
            //똑같은 팝업 여러개 못뜨도록
            if(popup_array.indexOf(popup_name) == -1){
                popup_array.push(popup_name);
                $(`#${popup_name}`).css({
                    "transform":"translateX(0)",
                    "transition":"transform 0.3s ease-in-out",
                    "z-index":100*popup_array.length
                });
            }
        break;
        case "close":
            //혹시 있을 pop 에러 방지
            if(popup_array.length > 0){
                popup_name = popup_array.pop();
                //첫 팝업의 경우 옆에서 다시 당겨오도록 보이는 효과 , side 제외
                if(popup_array.length == 0 && popup_name != "pters_mobile_side_menu"){
                    $('nav, .content_page').css({
                        "transform":"translateX(0%)",
                        "transition":"transform 0.3s ease-in-out"
                    });
                }
                $(`#${popup_name}`).css({"transform":"translateX(100%)"});
            }
        break;
        case "all_close":
            let popup_len = popup_array.length;
            for(let i=0; i<popup_len; i++){
                popup_name = popup_array.pop();
                $(`#${popup_name}`).css({"transform":"translateX(100%)"});
            }
            //팝업 전부 닫고 옆에서 다시 당겨오도록 보이는 효과 , side 제외
            if(popup_name != "pters_mobile_side_menu") {
                $('nav, .content_page').css({
                    "transform": "translateX(0%)",
                    "transition": "transform 0.3s ease-in-out"
                });
            }
        break;
    }
}
