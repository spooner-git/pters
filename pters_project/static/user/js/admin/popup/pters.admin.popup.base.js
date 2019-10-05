class PopupBase{
    static base(top_left, top_center, top_right, content, bottom){
        // let windowHeight = window.innerHeight;
        windowHeight = $root_content.height();
        let html = `
                    <div class="wrapper_top">
                        ${top_left}
                        ${top_center}
                        ${top_right}
                    </div>
                    <div class="wrapper_middle" style="height:${windowHeight-66}px;">
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
}