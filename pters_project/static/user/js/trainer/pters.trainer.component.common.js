class CComponent{

    static setting_row (id, title, value, click_type, color, delete_highlight, onclick){
        if(color == true){
            value = `<div style="display:inline-block;width:25px;height:25px;border-radius: 3px;background-color:${value};vertical-align: middle;margin-bottom:4px;"></div>`;
        }

        let button_style = "";
        if(delete_highlight == true){
            button_style = "obj_font_bg_coral_white";
        }

        let html = `<li class="${button_style}">
                        <div class="obj_table_raw">
                            <div class="cell_title">${title}</div>
                            <div class="cell_value" id="${id}" data-click="${click_type}">${value}</div>
                            <div class="cell_icon"><img src="/static/common/icon/navigate_next_black.png" class="obj_icon_basic"></div>
                        </div>
                    </li>`;
        
        // $(document).off('click', `#${id}`).on('click', `#${id}`, function(e){
        //     // let cell_value = $(this).find('.cell_value').text();
        //     console.log('클릭setting_row');
        //     onclick('clicked_crea_row_from_common_component');
        // });

        return html;
    }

    static create_row (id, title, value, onclick, icon){
        
        let html = `<li class="create_row" id="${id}">
                        <div class="obj_table_raw">
                            <div class="cell_title">
                                ${icon != undefined ? `<img class="obj_icon_basic" src="${icon}">` : ""} ${title}
                            </div>
                            <div class="cell_value">${value}</div>
                            <div class="cell_icon"><img src="/static/common/icon/navigate_next_black.png" class="obj_icon_basic"></div>
                        </div>
                    </li>`;


        $(document).off('click', `#${id}`).on('click', `#${id}`, function(e){
            let cell_value = $(this).find('.cell_value').text();
            onclick('clicked_crea_row_from_common_component');
        });
        return html;
    }

}