class CComponent{

    //설정 페이지들에서 자주 사용되는 row 스타일
    static setting_row (id, title, value, onclick){
 
        let html = `<li>
                        <div class="obj_table_raw" id="${id}">
                            <div class="cell_title">${title}</div>
                            <div class="cell_value">${value}</div>
                            <input type="hidden">
                            <div class="cell_icon"><img src="/static/common/icon/navigate_next_black.png" class="obj_icon_basic"></div>
                        </div>
                    </li>`;
        
        $(document).off('click', `#${id}`).on('click', `#${id}`, function(e){
            onclick();
        });

        return html;
    }

    //추가 페이지들에서 자주 사용되는 row 스타일
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
                                <div style="background-color:${color_code}" class="lecture_color_bar">
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