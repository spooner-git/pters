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

    static create_row (id, title, icon, icon_r_visible, onclick){
        
        let html = `<li class="create_row" id="${id}">
                        <div class="obj_table_raw">
                            <div class="cell_title">
                                ${icon != "" ? `<img class="obj_icon_basic" src="${icon}">` : ""} 
                                <span class="cell_text">${title}</span>
                                <input type="hidden">
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} ><img src="/static/common/icon/navigate_next_black.png" class="obj_icon_basic"></div>
                        </div>
                    </li>`;


        $(document).off('click', `#${id}`).on('click', `#${id}`, function(e){
            let prev_data = $(this).find('input').val();
            try{
                if(prev_data.length == 0){
                    prev_data = undefined;
                }
            }catch{

            }
            onclick(prev_data);
        });
        return html;
    }

    static select_lecture_row (multiple_select, checked, lecture_id, lecture_name, color_code, max_member_num, onclick){
        let html = `
                    <li class="select_lecture_row" id="select_lecture_row_${lecture_id}">
                        <div class="obj_table_raw">
                            <div class="cell_lecture_color">
                                <div style="color:${color_code}" class="lecture_color_bar">
                                </div>
                            </div>
                            <div class="cell_lecture_info">
                                <div>${lecture_name}</div>
                                <div>정원 - ${max_member_num} 명</div>
                            </div>
                            <div class="cell_lecture_selected">
                                <img src="/static/common/icon/icon_done.png" class="obj_icon_basic lecture_selected" style="display:${checked == 0 ? 'none' : 'block'}">
                            </div>
                        </div>
                    </li>
                    `;

        if(multiple_select == true){
            $(document).off('click', `#select_lecture_row_${lecture_id}`).on('click', `#select_lecture_row_${lecture_id}`, function(e){
                if($(this).find('.lecture_selected').css('display') == 'none'){
                    $(this).find('.lecture_selected').css('display', 'block');
                    onclick('add');
                }else{
                    $(this).find('.lecture_selected').css('display', 'none');
                    onclick('substract');
                }
            });
        }else if(multiple_select == false){
            $(document).off('click', `#select_lecture_row_${lecture_id}`).on('click', `#select_lecture_row_${lecture_id}`, function(e){
                
                onclick('add_single');
                
            });
        }
        return html;
    }

    static select_member_row (multiple_select, checked, member_id, member_name, member_rem_count, member_expiry, onclick){
        let html = `
                    <li class="select_member_row" id="select_member_row_${member_id}">
                        <div class="obj_table_raw">
                            <div class="cell_member_name">
                                ${member_name}
                            </div>
                            <div class="cell_member_info">
                                잔여 ${member_rem_count}회 / ${member_expiry}까지
                            </div>
                            <div class="cell_member_selected">
                                <img src="/static/common/icon/icon_done.png" class="obj_icon_basic member_selected" style="display:${checked == 0 ? 'none' : 'block'}">
                            </div>
                        </div>
                    </li>
                    `;

        if(multiple_select == true){
            $(document).off('click', `#select_member_row_${member_id}`).on('click', `#select_member_row_${member_id}`, function(e){
                if($(this).find('.member_selected').css('display') == 'none'){
                    $(this).find('.member_selected').css('display', 'block');
                    onclick('add');
                }else{
                    $(this).find('.member_selected').css('display', 'none');
                    onclick('substract');
                }
            });
        }else if(multiple_select == false){
            $(document).off('click', `#select_member_row_${member_id}`).on('click', `#select_member_row_${member_id}`, function(e){
                
                onclick('add_single');
                
            });
        }
        return html;
    }


}