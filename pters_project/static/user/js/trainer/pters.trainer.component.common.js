class CComponent{

    //설정 페이지들에서 자주 사용되는 row 스타일
    static setting_row (id, title, value, onclick){
 
        let html = `<li class="setting_row" id="${id}">
                        <div class="obj_table_raw" >
                            <div class="cell_title">${title}</div>
                            <div class="cell_value">${value}</div>
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
        if(icon == null){
            icon = '/static/common/icon/icon_dissatisfied.png';
        }
        
        let html = `<li class="create_row" id="c_r_${id}">
                        <div class="obj_table_raw">
                            <div class="cell_title">
                                ${icon != "" ? `<img src="${icon}">` : ""} 
                                <span class="cell_text">${title}</span>
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} ><img src="/static/common/icon/navigate_next_black.png"></div>
                        </div>
                    </li>`;


        $(document).off('click', `#c_r_${id}`).on('click', `#c_r_${id}`, function(e){
            onclick();
        });
        return html;
    }

    //추가 페이지들에서 사용되는 text input row 스타일
    static create_input_row (id, title, icon, icon_r_visible, onfocusout){
        
        let html = `<li class="create_input_row" id="c_i_r_${id}">
                        <div class="obj_table_raw">
                            <div class="cell_title">
                                ${icon != null ? `<img src="${icon}">` : ""} 
                            </div>
                            <div class="cell_content">
                                <input class="cell_text" placeholder="${title}" value="${title}">
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} ><img src="/static/common/icon/navigate_next_black.png"></div>
                        </div>
                    </li>`;
        $(document).off('focusin', `#c_i_r_${id}`).on('focusin', `#c_i_r_${id}`, function(e){
            $(this).find('input').val('');
        });

        $(document).off('focusout', `#c_i_r_${id}`).on('focusout', `#c_i_r_${id}`, function(e){
            let user_input_data = $(this).find('input').val();
            if(user_input_data.length == 0){
                user_input_data = null;
            }
            onfocusout(user_input_data);
        });
        return html;
    }
    
    //추가 페이지들에서 사용되는 number input row 스타일
    static create_input_number_row (id, title, icon, icon_r_visible, onfocusout){
        
        let html = `<li class="create_input_row" id="c_i_n_r_${id}">
                        <div class="obj_table_raw">
                            <div class="cell_title">
                                ${icon != null ? `<img src="${icon}">` : ""} 
                            </div>
                            <div class="cell_content">
                                <input class="cell_text" placeholder="${title}" type="tel" value="${title}">
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} ><img src="/static/common/icon/navigate_next_black.png"></div>
                        </div>
                    </li>`;
        $(document).off('focusin', `#c_i_n_r_${id}`).on('focusin', `#c_i_n_r_${id}`, function(e){
            $(this).find('input').val('');
        });

        $(document).off('focusout', `#c_i_n_r_${id}`).on('focusout', `#c_i_n_r_${id}`, function(e){
            let user_input_data = $(this).find('input').val();
            if(user_input_data.length == 0){
                user_input_data = null;
            }
            onfocusout(user_input_data);
        });
        return html;
    }

    static create_input_textarea_row (id, title, icon, icon_r_visible, onfocusout){
        
        let html = `<li class="create_input_row create_input_textarea_row" id="c_i_t_r_${id}">
                        <div class="obj_table_raw">
                            <div class="cell_title">
                                ${icon != null ? `<img src="${icon}">` : ""} 
                            </div>
                            <div class="cell_content">
                                <textarea class="cell_text" placeholder="${title}" value="${title}"></textarea>
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} ><img src="/static/common/icon/navigate_next_black.png"></div>
                        </div>
                    </li>`;
        $(document).off('focusin', `#c_i_t_r_${id}`).on('focusin', `#c_i_t_r_${id}`, function(e){
            $(this).find('textarea').val('');
        });

        $(document).off('focusout', `#c_i_t_r_${id}`).on('focusout', `#c_i_t_r_${id}`, function(e){
            let user_input_data = $(this).find('textarea').val();
            if(user_input_data.length == 0){
                user_input_data = null;
            }
            onfocusout(user_input_data);
        });
        return html;
    }

    //수강권 선택 팝업에 사용되는 행
    static select_ticket_row (multiple_select, checked, ticket_id, ticket_name, ticket_price, ticket_reg_count, ticket_effective_days, onclick){
        let html = `
                    <li class="select_ticket_row" id="select_ticket_row_${ticket_id}">
                        <div class="obj_table_raw">
                            <div class="cell_ticket_color">
                                
                            </div>
                            <div class="cell_ticket_info">
                                <div>${ticket_name}</div>
                                <div>가격 - ${ticket_price}원 / 횟수 - ${ticket_reg_count} / 유효기간 - ${ticket_effective_days}일</div>
                            </div>
                            <div class="cell_ticket_selected">
                                <img src="/static/common/icon/icon_done.png" class="obj_icon_basic ${checked == 0 ? 'none' : 'ticket_selected'}">
                            </div>
                        </div>
                    </li>
                    `;

        if(multiple_select > 1){
            $(document).off('click', `#select_ticket_row_${ticket_id}`).on('click', `#select_ticket_row_${ticket_id}`, function(e){
                if(!$(this).find('.cell_ticket_selected img').hasClass('ticket_selected')){
                    if($('.ticket_selected').length >= multiple_select){
                        show_error_message(`${multiple_select} 개까지 선택할 수 있습니다.`);
                        return false;
                    }
                    $(this).find('.cell_ticket_selected img').addClass('ticket_selected');
                    onclick('add');
                }else{
                    $(this).find('.cell_ticket_selected img').removeClass('ticket_selected');
                    onclick('substract');
                }
            });
        }else if(multiple_select == 1){
            $(document).off('click', `#select_ticket_row_${ticket_id}`).on('click', `#select_ticket_row_${ticket_id}`, function(e){
                
                onclick('add_single');
                
            });
        }
        return html;
    }

    //수업 선택 팝업에 사용되는 행
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
                                <img src="/static/common/icon/icon_done.png" class="obj_icon_basic ${checked == 0 ? 'none' : 'lecture_selected'}">
                            </div>
                        </div>
                    </li>
                    `;

        if(multiple_select > 1){
            $(document).off('click', `#select_lecture_row_${lecture_id}`).on('click', `#select_lecture_row_${lecture_id}`, function(e){
                if(!$(this).find('.cell_lecture_selected img').hasClass('lecture_selected')){
                    if($('.lecture_selected').length >= multiple_select){
                        show_error_message(`${multiple_select} 개까지 선택할 수 있습니다.`);
                        return false;
                    }
                    $(this).find('.cell_lecture_selected img').addClass('lecture_selected');
                    onclick('add');
                }else{
                    $(this).find('.cell_lecture_selected img').removeClass('lecture_selected');
                    onclick('substract');
                }
            });
        }else if(multiple_select == 1){
            $(document).off('click', `#select_lecture_row_${lecture_id}`).on('click', `#select_lecture_row_${lecture_id}`, function(e){
                
                onclick('add_single');
                
            });
        }
        return html;
    }

    //회원 선택 팝업에 사용되는 행
    static select_member_row (multiple_select, checked, member_id, member_name, member_avail_count, member_expiry, onclick){

        let html = `
                    <li class="select_member_row" id="select_member_row_${member_id}">
                        <div class="obj_table_raw">
                            <div class="cell_member_name">
                                ${member_name}
                            </div>
                            <div class="cell_member_info">
                                잔여 ${member_avail_count}회 / ${member_expiry}까지
                            </div>
                            <div class="cell_member_selected">
                                <img src="/static/common/icon/icon_done.png" class="obj_icon_basic ${checked == 0 ? '' : 'member_selected'}">
                            </div>
                        </div>
                    </li>
                    `;

        if(multiple_select > 1){
            $(document).off('click', `#select_member_row_${member_id}`).on('click', `#select_member_row_${member_id}`, function(e){
                if(!$(this).find('.cell_member_selected img').hasClass('member_selected')){
                    if($('.member_selected').length >= multiple_select){
                        show_error_message(`${multiple_select} 명까지 선택할 수 있습니다.`);
                        return false;
                    }
                    $(this).find('.cell_member_selected img').addClass('member_selected');
                    onclick('add');
                }else{
                    $(this).find('.cell_member_selected img').removeClass('member_selected');
                    onclick('substract');
                }
            });
        }else if(multiple_select == 1){
            $(document).off('click', `#select_member_row_${member_id}`).on('click', `#select_member_row_${member_id}`, function(e){
                
                onclick('add_single');
                
            });
        }
        return html;
    }

    //회원 선택 팝업에 사용되는 행
    static select_color_row (multiple_select, checked, bg_code, font_code, color_name, onclick){
        let color_bg_code_without_sharp = bg_code.replace('#', '');

        let html = `
                    <li class="select_color_row" id="select_color_row_${color_bg_code_without_sharp}">
                        <div class="obj_table_raw">
                            <div class="cell_color_name">
                                
                            </div>
                            <div class="cell_color_info" style="color:${font_code};background-color:${bg_code};">
                                ${color_name}
                            </div>
                            <div class="cell_color_selected">
                                <img src="/static/common/icon/icon_done.png" class="obj_icon_basic ${checked == 0 ? '' : 'color_selected'}">
                            </div>
                        </div>
                    </li>
                    `;

        if(multiple_select > 1){
            $(document).off('click', `#select_color_row_${color_bg_code_without_sharp}`).on('click', `#select_color_row_${color_bg_code_without_sharp}`, function(e){
                console.log('?')
                if(!$(this).find('.cell_color_selected img').hasClass('color_selected')){
                    if($('.color_selected').length >= multiple_select){
                        show_error_message(`${multiple_select} 개까지 선택할 수 있습니다.`);
                        return false;
                    }
                    $(this).find('.cell_color_selected img').addClass('color_selected');
                    onclick('add');
                }else{
                    $(this).find('.cell_color_selected img').removeClass('color_selected');
                    onclick('substract');
                }
            });
        }else if(multiple_select == 1){
            $(document).off('click', `#select_color_row_${color_bg_code_without_sharp}`).on('click', `#select_color_row_${color_bg_code_without_sharp}`, function(e){
                
                onclick('add_single');
                
            });
        }
        return html;
    }

    static no_data_row(text){
        let html = `<li class="no_data_row">
                        <div class="obj_table_raw">
                            <div class="cell_no_data_row_text">
                                <img src="/static/common/icon/icon_dissatisfied.png">
                                ${text}
                            </div>
                        </div>
                    </li>`;
        return html;
    }

    //텍스트만 있는 버튼
    static text_button (id, title, style, onclick){
        let style_code = CComponent.data_to_style_code(style);
        let html = `<span id="text_button_${id}" style="cursor:pointer;padding:3px 8px;${style_code}">${title}</span>`;
        
        $(document).off('click', `#text_button_${id}`).on('click', `#text_button_${id}`, function(e){
            onclick();
        });
        return html;
    }

    //왼쪽에 아이콘과 오른쪽에 텍스트가 있는 버튼
    static icon_button (id, title, url, style, onclick){
        if(url == null){
            url = '/static/common/icon/icon_account.png';
        }
        let html = `<div id="icon_button_${id}" style="cursor:pointer;padding:3px 8px;display:inline-block;height:40px;width:auto;${CComponent.data_to_style_code(style)}">
                        <img src="${url}" style="width:24px;height:24px;vertical-align:middle;margin-bottom:4px;margin-right:5px;">
                        <span style="line-height:40px;">${title}</span>
                    </div>`;
        
        $(document).off('click', `#icon_button_${id}`).on('click', `#icon_button_${id}`, function(e){
            onclick();
        });
        return html;
    }

    //이미지만 있는 버튼
    static image_button (id, title, url, style, onclick){
        if(url == null){
            url = '/static/common/icon/icon_account.png';
        }
        let html = `<div id="image_button_${id}" style="cursor:pointer;padding:3px 8px;display:inline-block;height:40px;width:auto;${CComponent.data_to_style_code(style)}">
                        <img src="${url}" style="width:24px;height:24px;vertical-align:middle;margin-bottom:4px;margin-right:5px;" alt="${title}">
                    </div>`;
        
        $(document).off('click', `#image_button_${id}`).on('click', `#image_button_${id}`, function(e){
            onclick();
        });
        return html;
    }


    static data_to_style_code(data){
        if(data == null){
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

