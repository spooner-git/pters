class PopupBase{
    static base(top_left, top_center, top_right, content, bottom){


        let html = `
                    <div class="wrapper_top">
                        ${top_left}
                        ${top_center}
                        ${top_right}
                    </div>
                    <div class="wrapper_middle">
                        ${content}
                    </div>
                    <div class="wrapper_bottom">
                        ${bottom}
                    </div>
                    `;
        return html;
    }

    static top_menu_effect(install_target){
        if(os != IOS){
            $(`${install_target} .wrapper_middle`).off('scroll').on('scroll', function(e){
                let scroll_position = $(this).scrollTop();
                let menu_text = $(`${install_target} .popup_toolbox span:last-child`).text();
                if(scroll_position > 30){
                    $(`${install_target} .icon_center > span`).html(menu_text);
                    // $(`${install_target} .popup_toolbox`).hide();
                    $(`${install_target} .popup_toolbox`).css('visibility', 'hidden');
                }else{
                    $(`${install_target} .icon_center > span`).html('&nbsp;');
                    // $(`${install_target} .popup_toolbox`).show();
                    $(`${install_target} .popup_toolbox`).css('visibility', 'visible');
                }
            });
        }
    }

    static top_menu_effect_iphone(context, install_target){
        let scroll_position = $(context).scrollTop();
        let menu_text = $(`${install_target} .popup_toolbox span:last-child`).text();
        if(scroll_position > 30){
            $(`${install_target} .icon_center > span`).html(menu_text);
            // $(`${install_target} .popup_toolbox`).hide();
            $(`${install_target} .popup_toolbox`).css('visibility', 'hidden');
        }else{
            $(`${install_target} .icon_center > span`).html('&nbsp;');
            // $(`${install_target} .popup_toolbox`).show();
            $(`${install_target} .popup_toolbox`).css('visibility', 'visible');
        }
    }

    //스타일 코드를 인라인스타일 스타일 코드로 변환시켜주는 함수
    static data_to_style_code(data){
        if(data == null || data == undefined){
            return "";
        }
        let style_to_join = [];
        for(let item in data){
            style_to_join.push( `${item}:${data[item]}` );
        }

        let style_code = style_to_join.join(';');
        return style_code;
    }
}