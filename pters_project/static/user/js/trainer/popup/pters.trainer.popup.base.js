class PopupBase{
    static base(top_left, top_center, top_right, content, bottom){
            let html = `
                        <div class="wrapper_top">
                            ${top_left}
                            ${top_center}
                            ${top_right}
                        </div>
                        ${content}
                        <div class="wrapper_bottom">
                            ${bottom}
                        </div>
                        `;
                return html;
    }

    //<img src="/static/common/icon/close_black.png" onclick="layer_popup.close_layer_popup()" class="obj_icon_x">
}