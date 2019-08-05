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

    static dom_tag(tag_name){
        let html = `<div class="dom_tag">${tag_name}</div>`;
        return html;
    }

    //추가 페이지들에서 자주 사용되는 row 스타일
    static create_row (id, title, icon, icon_r_visible, onclick){
        if(icon == null){
            icon = '/static/common/icon/icon_dissatisfied.png';
        }
        if(icon == NONE){
            icon = '/static/common/icon/menu_white.png';
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
    static create_input_row (id, title, placeholder, icon, icon_r_visible, style, disabled, onfocusout){
        let disable = 'disabled';
        if(disabled == false){
            disable = '';
        }

        let html = `<li class="create_input_row" id="c_i_r_${id}" style="${CComponent.data_to_style_code(style)}">
                        <div class="obj_table_raw">
                            <div class="cell_title" style="display:${icon == undefined ? 'none' : ''}">
                                ${icon != null ? `<img src="${icon}">` : ""} 
                            </div>
                            <div class="cell_content">
                                <input type="text" class="cell_text" placeholder="${placeholder}" value="${title}" ${disable}>
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} ><img src="/static/common/icon/navigate_next_black.png"></div>
                        </div>
                    </li>`;
        $(document).off('focusin', `#c_i_r_${id}`).on('focusin', `#c_i_r_${id}`, function(e){
            // $(this).find('input').val('');
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
    static create_input_number_row (id, title, placeholder, icon, icon_r_visible, style, disabled, onfocusout){
        let disable = 'disabled';
        if(disabled == false){
            disable = '';
        }
        
        let html = `<li class="create_input_row" id="c_i_n_r_${id}" style="${CComponent.data_to_style_code(style)}">
                        <div class="obj_table_raw">
                            <div class="cell_title" style="display:${icon == undefined ? 'none' : ''}">
                                ${icon != null ? `<img src="${icon}">` : ""} 
                            </div>
                            <div class="cell_content">
                                <input class="cell_text" placeholder="${placeholder}" type="tel" value="${title}" ${disable}>
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} ><img src="/static/common/icon/navigate_next_black.png"></div>
                        </div>
                    </li>`;
        $(document).off('focusin', `#c_i_n_r_${id}`).on('focusin', `#c_i_n_r_${id}`, function(e){
            let current_value = $(this).find('input').val();
            $(this).find('input').val(Number(current_value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣,]/gi, "") ));
        });

        $(document).off('focusout', `#c_i_n_r_${id}`).on('focusout', `#c_i_n_r_${id}`, function(e){
            LimitChar.number(`#c_i_n_r_${id} input`);
            let user_input_data = $(`#c_i_n_r_${id} input`).val();
            if(user_input_data.length == 0){
                user_input_data = null;
            }else{
                user_input_data = Number(user_input_data);
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
    static select_ticket_row (multiple_select, checked, location, ticket_id, ticket_name, ticket_price, ticket_reg_count, ticket_effective_days, onclick){
        let html = `
                    <li class="select_ticket_row str_${location}" id="select_ticket_row_${ticket_id}">
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
                    if($(`.str_${location} .ticket_selected`).length >= multiple_select){
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
    static select_lecture_row (multiple_select, checked, location, lecture_id, lecture_name, color_code, max_member_num, ing_member_num,onclick){
        let html = `
                    <li class="select_lecture_row slr_${location}" id="select_lecture_row_${lecture_id}">
                        <div class="obj_table_raw">
                            <div class="cell_lecture_color">
                                <div style="background-color:${color_code}" class="lecture_color_bar">
                                </div>
                            </div>
                            <div class="cell_lecture_info">
                                <div>${lecture_name}</div>
                                <div class="lecture_additional_info">정원 - ${max_member_num} 명 / 진행중 - ${ing_member_num} 명</div>
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
                    if($(`.slr_${location} .lecture_selected`).length >= multiple_select){
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
    static select_member_row (multiple_select, checked, location, member_id, member_name, member_avail_count, member_expiry, onclick){

        let html = `
                    <li class="select_member_row smr_${location}" id="select_member_row_${member_id}">
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
                    if($(`.smr_${location} .member_selected`).length >= multiple_select){
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

    //색상 선택 팝업에 사용되는 행
    static select_color_row (multiple_select, checked, location, bg_code, font_code, color_name, onclick){
        let color_bg_code_without_sharp = bg_code.replace('#', '');

        let html = `
                    <li class="select_color_row scr_${location}" id="select_color_row_${color_bg_code_without_sharp}">
                        <div class="obj_table_raw">
                            <div class="cell_color_name">
                                <div style="width:20px;height:20px;border-radius:4px;background-color:${bg_code}"></div>
                            </div>
                            <div class="cell_color_info">
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
                if(!$(this).find('.cell_color_selected img').hasClass('color_selected')){
                    if($(`.scr_${location} .color_selected`).length >= multiple_select){
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

    //일반(이미지 없음) 선택 팝업에 사용되는 행
    static select_row (multiple_select, checked, location, id, title, icon, onclick){
        let html = `
                    <li class="select_row sr_${location}" id="select_row_${id}">
                        <div class="obj_table_raw">
                            <div class="cell_select_icon">
                                ${icon != null ? `<img src="${icon}">` : ""} 
                            </div>
                            <div class="cell_select_title">
                                ${title}
                            </div>
                            <div class="cell_select_selected">
                                <img src="/static/common/icon/icon_done.png" class="obj_icon_basic ${checked == 0 ? '' : 'option_selected'}">
                            </div>
                        </div>
                    </li>
                    `;

        if(multiple_select > 1){
            $(document).off('click', `#select_row_${id}`).on('click', `#select_row_${id}`, function(e){
                if(!$(this).find('.cell_select_selected img').hasClass('option_selected')){
                    if($(`.sr_${location} .option_selected`).length >= multiple_select){
                        show_error_message(`${multiple_select} 개까지 선택할 수 있습니다.`);
                        return false;
                    }
                    $(this).find('.cell_select_selected img').addClass('option_selected');
                    onclick('add');
                }else{
                    $(this).find('.cell_select_selected img').removeClass('option_selected');
                    onclick('substract');
                }
            });
        }else if(multiple_select == 1){
            $(document).off('click', `#select_row_${id}`).on('click', `#select_row_${id}`, function(e){
                if( !$(this).find('.cell_select_selected img').hasClass('option_selected') ){
                    onclick('add_single');
                }else{
                    return false;
                }
            });
        }
        return html;
    }

    //출석 체크 팝업에 사용되는 행
    static select_attend_row (checked_absence, checked_attend, location, member_id, member_name, onclick){
        let html = `
                    <li class="select_attend_row sar_${location}" id="sar_${member_id}">
                        <div class="obj_table_raw">
                            <div class="cell_member_name">
                                <span>${member_name}</span>
                            </div>
                            <div class="cell_attend_select">
                                <div id="${member_id}_absence">
                                    <span>결석</span>
                                    ${checked_absence == 1 
                                        ? `<div class="pters_checkbox checkbox_selected"><div class="checkbox_selected_inner"></div></div>`
                                        : `<div class="pters_checkbox"></div>`
                                    }
                                </div>
                                <div id="${member_id}_attend">
                                    <span>출석</span>
                                    ${checked_attend == 1 
                                        ? `<div class="pters_checkbox checkbox_selected"><div class="checkbox_selected_inner"></div></div>`
                                        : `<div class="pters_checkbox"></div>`
                                    }
                                </div>
                            </div>
                        </div>
                    </li>
                    `;

        $(document).off('click', `#${member_id}_absence`).on('click', `#${member_id}_absence`, function(){
            if($(this).find('.pters_checkbox').hasClass('checkbox_selected')){
                $(this).find('.pters_checkbox').removeClass('checkbox_selected');
                $(this).find('.pters_checkbox').html('');
                onclick('uncheck_absence');
            }else{
                $(this).find('.pters_checkbox').addClass('checkbox_selected');
                $(this).find('.pters_checkbox').html('<div class="checkbox_selected_inner"></div>');
                $(`#${member_id}_attend`).find('.pters_checkbox').removeClass('checkbox_selected');
                $(`#${member_id}_attend`).find('.pters_checkbox').html('');
                onclick('check_absence');
            }
        });

        $(document).off('click', `#${member_id}_attend`).on('click', `#${member_id}_attend`, function(){
            if($(this).find('.pters_checkbox').hasClass('checkbox_selected')){
                $(this).find('.pters_checkbox').removeClass('checkbox_selected');
                $(this).find('.pters_checkbox').html('');
                onclick('uncheck_attend');
            }else{
                $(this).find('.pters_checkbox').addClass('checkbox_selected');
                $(this).find('.pters_checkbox').html('<div class="checkbox_selected_inner"></div>');
                $(`#${member_id}_absence`).find('.pters_checkbox').removeClass('checkbox_selected');
                $(`#${member_id}_absence`).find('.pters_checkbox').html('');
                onclick('check_attend');
            }
        });

        return html;
    }

    //회원의 일정 이력에 사용되는 행
    static schedule_history_row (numbering, schedule_id, date, schedule_name, attend_status, memo){
        let html = `<li class="schedule_history_row" id="schedule_history_row_${schedule_id}">
                        <div class="obj_table_raw">
                            <div class="cell_schedule_num">${numbering}</div>
                            <div class="cell_schedule_info">${schedule_name}</div>
                            <div class="cell_schedule_attend">${attend_status}</div>
                        </div>
                        <div class="obj_table_raw table_date_info">
                            <div class="cell_schedule_num"></div>
                            <div class="cell_schedule_info">${date}</div>
                        </div>
                        <div class="obj_table_raw table_memo_info">
                            <div class="cell_schedule_num"></div>
                            <div class="cell_schedule_info">${memo}</div>
                        </div>
                    </li>`;
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

    //버튼
    static button (id, title, style, onclick){
        let style_code = CComponent.data_to_style_code(style);
        let html = `<div id="button_${id}" style="text-align:center;cursor:pointer;padding:3px 8px;${style_code}">${title}</div>`;
        
        $(document).off('click', `#button_${id}`).on('click', `#button_${id}`, function(e){
            onclick();
        });
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
        if(url == NONE){
            url = '/static/common/icon/menu_white.png';
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

    //스타일 코드를 인라인스타일 스타일 코드로 변환시켜주는 함수
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


class LimitChar{
    static number(selector){
        var limit =  /[^0-9,]/gi;
        var temp = $(selector).val();
        if(limit.test(temp)){
            $(selector).val(temp.replace(limit, ""));
            show_error_message("숫자만 입력하실 수 있습니다.");
        }
    }

    static text(selector){
        var limit =  /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]/gi;
        var temp = $(selector).val();
        if(limit.test(temp)){
            $(selector).val(temp.replace(limit, ""));
            show_error_message("- 와 _ 를 제외한 특수문자는 입력하실 수 없습니다.");
        }
    }
}

function limit_char_auto_correction(event){
    let limit_reg_pattern = event.target.pattern.replace('[', '[^');
    let limit = new RegExp(limit_reg_pattern, "gi");
    event.target.value = event.target.value.replace(limit, "");
}

function limit_char_check(event){

    let limit_reg_pattern = event.target.pattern.replace('[', '[^');
    let limit = new RegExp(limit_reg_pattern, "gi");
    let limit_char_check = false;
    let min_length = event.target.minLength;
    let event_id = event.target.id;
    let confirm_id = event_id+'_confirm';
    let default_confirm_id = event_id+'_default_confirm';
    if(event.target.value.length < Number(min_length)){
        $(`#${confirm_id}`).text('최소 '+min_length+'자 이상 입력');
        $(`#${default_confirm_id}`).css('color', 'black');
    }
    else{
        $(`#${confirm_id}`).text('');
        if(limit.test(event.target.value)){
            $(`#${default_confirm_id}`).css('color', '#fe4e65');
        }else{
            $(`#${default_confirm_id}`).css('color', 'green');
        }
    }

    return limit_char_check
}
