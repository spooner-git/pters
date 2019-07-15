class CComponent{

    static setting_row (id, title, value, click_type, color){
        if(color == true){
            value = `<div style="display:inline-block;width:25px;height:25px;border-radius: 3px;background-color:${value};vertical-align: middle;margin-bottom:4px;"></div>`;
        }


        let html = `<li class="">
                        <div class="obj_table_raw">
                            <div class="cell_title">${title}</div>
                            <div class="cell_value" id="${id}" data-click="${click_type}">${value}</div>
                            <div class="cell_icon"><img src="/static/common/icon/navigate_next_black.png" class="obj_icon_basic"></div>
                        </div>
                    </li>`;

        return html;
    }

}