class CComponent{

    //설정 페이지들에서 자주 사용되는 row 스타일
    static setting_row (id, title, value, onclick){
 
        let html = `<li class="setting_row" id="${id}">
                        <div class="obj_table_raw" >
                            <div class="cell_title">${title}</div>
                            <div class="cell_value">${value}</div>
                            <div class="cell_icon"><img src="/static/common/icon/icon_arrow_r_small_black.png" class="obj_icon_basic"></div>
                        </div>
                    </li>`;
        
        $(document).off('click', `#${id}`).on('click', `#${id}`, function(e){
            onclick();
        });
        return html;
    }

    static dom_tag(tag_name, style){
        let html = `<div class="dom_tag" style="${CComponent.data_to_style_code(style)}">${tag_name}</div>`;
        return html;
    }

    static create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick){
        if(icon == NONE){
            icon = '';
        }
        
        let html = `<li class="create_row" id="c_r_${id}" style="${CComponent.data_to_style_code(style)}">
                        <div style="display:flex;">
                            <div class="cell_title" style="${icon == DELETE ? 'display:none' : ''}">
                                ${icon == DELETE ? '' : icon}
                            </div>
                            <div class="cell_content">
                                <div class="cell_text">${title}</div>
                            </div>
                            <div class="cell_icon" ${icon_r_visible == NONE ? "style='display:none'": ''}>
                                <span class="cell_text" ${icon_r_visible == "" || null ? 'style="display:none"' : ''}>${icon_r_text}</span>
                                <img src="/static/common/icon/icon_arrow_r_small_black.png" ${icon_r_visible == HIDE ? 'style="display:none"' : ''}>
                            </div>
                        </div>
                    </li>`;


        $(document).off('click', `#c_r_${id}`).on('click', `#c_r_${id}`, function(e){
            onclick();
        });
        return html;
    }

    //추가 페이지들에서 사용되는 text input row 스타일
    static create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, onfocusout, pattern, pattern_message, required){
        let disable = 'disabled';
        if(disabled == false){
            disable = '';
        }
        let min_max_length = pattern.split('{')[1].replace('}', '').split(',');

        if(icon == NONE){
            icon = '/static/common/icon/icon_gap_black.png';
        }

        let html = `<li class="create_input_row" id="c_i_r_${id}" style="${CComponent.data_to_style_code(style)}">
                        <div style="display:flex;height:100%;">
                            <div class="cell_title" style="display:${icon == DELETE ? 'none' : ''}">
                                <img src="${icon == DELETE ? '' : icon}">
                            </div>
                            <div class="cell_content">
                                <input type="text" class="cell_text" title="${placeholder}" placeholder="${placeholder}" pattern="${pattern}" value="${title}"
                                 onkeyup="limit_char_auto_correction(event.target);" minlength="${min_max_length[0]}" maxlength="${min_max_length[1]}" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" 
                                 data-error-message="${placeholder} : 필수 입력입니다." data-pattern-message="${pattern_message}" data-valid="false" ${disable} ${required}>
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} >
                                ${icon_r_text}
                                <img src="/static/common/icon/icon_arrow_r_small_black.png">
                            </div>
                        </div>
                    </li>`;
        $(document).off('focusin', `#c_i_r_${id}`).on('focusin', `#c_i_r_${id}`, function(e){
            // $(this).find('input').val('');
            $(this).find("input").css("font-family", 'Noto Sans Medium', 'sans-serif');
        });

        $(document).off('focusout', `#c_i_r_${id}`).on('focusout', `#c_i_r_${id}`, function(e){
            $(this).find("input").css("font-family", 'Noto Sans KR', 'sans-serif');
            let user_input_data = e.target.value;
            if(user_input_data.length == 0){
                user_input_data = null;
            }
            onfocusout(user_input_data);
        });
        return html;
    }
    
    //추가 페이지들에서 사용되는 number input row 스타일
    static create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, onfocusout, pattern, pattern_message, required){
        let disable = 'disabled';
        if(disabled == false){
            disable = '';
        }
        let min_max_length = pattern.split('{')[1].replace('}', '').split(',');

        if(icon == NONE){
            icon = '/static/common/icon/icon_gap_black.png';
        }
        let html = `<li class="create_input_row" id="c_i_n_r_${id}" style="${CComponent.data_to_style_code(style)}">
                        <div style="display:flex;height:100%;">
                            <div class="cell_title" style="display:${icon == DELETE ? 'none' : ''}">
                                <img src="${icon == DELETE ? '' : icon}">
                            </div>
                            <div class="cell_content">
                                <input class="cell_text" title="${placeholder}" placeholder="${placeholder}" type="tel" pattern="${pattern}" value="${title}"
                                 onkeyup="limit_char_auto_correction(event.target);" minlength="${min_max_length[0]}" maxlength="${min_max_length[1]}" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" 
                                 data-error-message="${placeholder} : 필수 입력입니다." data-pattern-message="${pattern_message}" data-valid="false" ${disable} ${required}>
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} >
                                ${icon_r_text}
                                <img src="/static/common/icon/icon_arrow_r_small_black.png">
                            </div>
                        </div>
                    </li>`;
        $(document).off('focusin', `#c_i_n_r_${id}`).on('focusin', `#c_i_n_r_${id}`, function(e){
            $(this).find("input").css("font-family", 'Noto Sans Medium', 'sans-serif');
            let current_value = e.target.value;
            let current_num = '';
            if(current_value != 0){
                current_num = current_value.replace(/[^0-9]/gi, "");
            }
            e.target.value = current_num;
        });

        $(document).off('focusout', `#c_i_n_r_${id}`).on('focusout', `#c_i_n_r_${id}`, function(e){
            $(this).find("input").css("font-family", 'Noto Sans KR', 'sans-serif');
            LimitChar.number(`#c_i_n_r_${id} input`);
            let user_input_data = e.target.value;
            if(user_input_data.length == 0){
                user_input_data = null;
            }
            onfocusout(user_input_data);
        });
        return html;
    }

    static create_input_textarea_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, onfocusout, pattern, pattern_message, required){
        if(icon == NONE){
            icon = '/static/common/icon/icon_gap_black.png';
        }
        let min_max_length = pattern.split('{')[1].replace('}', '').split(',');
        let title_sentence_height = title.split('\n').length > 0 ? title.split('\n').length * 25 : 25;
        let html = `<li class="create_input_row create_input_textarea_row" id="c_i_t_r_${id}" style="${CComponent.data_to_style_code(style)}">
                        <div style="height:100%;display:flex;">
                            <div class="cell_title" style="vertical-align:top;display:${icon == DELETE ? 'none' : ''}">
                                <img src="${icon == DELETE ? '' : icon}">
                            </div>
                            <div class="cell_content">
                                <textarea pattern="${pattern}" data-pattern-message="${pattern_message}" wrap="hard"
                                        onkeydown="resize_textarea(this)" onkeyup="resize_textarea(this); limit_char_auto_correction(event.target);"
                                        placeholder="${placeholder}" style="height:100%;min-height:${title_sentence_height}px;resize:none" title="메모" minlength="${min_max_length[0]}" maxlength="${min_max_length[1]}"
                                        data-error-message="${placeholder} : 필수 입력입니다."
                                        spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" data-valid="false" ${required}>${title}</textarea>
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} >
                                ${icon_r_text}
                                <img src="/static/common/icon/icon_arrow_r_small_black.png">
                            </div>
                        </div>
                    </li>`;
        $(document).off('focusin', `#c_i_t_r_${id}`).on('focusin', `#c_i_t_r_${id}`, function(e){
            // $(this).find('textarea').val('');
            $(this).find("textarea").css("font-family", 'Noto Sans Medium', 'sans-serif');
        });

        $(document).off('focusout', `#c_i_t_r_${id}`).on('focusout', `#c_i_t_r_${id}`, function(e){
            $(this).find("textarea").css("font-family", 'Noto Sans KR', 'sans-serif');
            let user_input_data = $(this).find('textarea').val();
            if(user_input_data.length == 0){
                user_input_data = null;
            }
            onfocusout(user_input_data);
        });
        return html;
    }

    static create_input_password_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, onfocusout, pattern, pattern_message, required){
        let disable = 'disabled';
        if(disabled == false){
            disable = '';
        }
        let min_max_length = pattern.split('{')[1].replace('}', '').split(',');

        if(icon == NONE){
            icon = '/static/common/icon/icon_gap_black.png';
        }

        let html = `<li class="create_input_row" id="c_i_p_r_${id}" style="${CComponent.data_to_style_code(style)}">
                        <div class="obj_table_raw">
                            <div class="cell_title" style="display:${icon == DELETE ? 'none' : ''}">
                                <img src="${icon == DELETE ? '': icon}">
                            </div>
                            <div class="cell_content">
                                <input type="password" class="cell_text" title="${placeholder}" placeholder="${placeholder}" pattern="${pattern}" value="${title}"
                                 onkeyup="limit_char_auto_correction(event.target);" minlength="${min_max_length[0]}" maxlength="${min_max_length[1]}" 
                                 data-error-message="${placeholder} : 필수 입력입니다." data-pattern-message="${pattern_message}" data-valid="false" ${disable} ${required}>
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} >
                                ${icon_r_text}
                                <img src="/static/common/icon/icon_arrow_r_small_black.png">
                            </div>
                        </div>
                    </li>`;
        $(document).off('focusin', `#c_i_p_r_${id}`).on('focusin', `#c_i_p_r_${id}`, function(e){
            // $(this).find('input').val('');
        });

        $(document).off('focusout', `#c_i_p_r_${id}`).on('focusout', `#c_i_p_r_${id}`, function(e){
            let user_input_data = e.target.value;
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
                                <div style="display:none">가격 - ${ticket_price}원 / 횟수 - ${ticket_reg_count} / 유효기간 - ${ticket_effective_days}일</div>
                            </div>
                            <div class="cell_ticket_selected">
                                <img src="/static/common/icon/icon_confirm_black.png" class="obj_icon_basic ${checked == 0 ? 'none' : 'ticket_selected'}">
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
    static select_lecture_row (multiple_select, checked, location, lecture_id, lecture_name, color_code, max_member_num, ing_member_num, lecture_state_cd, lecture_time, onclick){
        let html = `
                    <li class="select_lecture_row slr_${location}" id="select_lecture_row_${lecture_id}" ${lecture_state_cd == "end" ? "style='opacity:0.6'": ""}>
                        <div class="obj_table_raw">
                            <div class="cell_lecture_color">
                                <div style="background-color:${color_code}" class="lecture_color_bar">
                                </div>
                            </div>
                            <div class="cell_lecture_info">
                                <div>${lecture_state_cd == "end" ? "(비활성)": ""} ${lecture_name}</div>
                                <div class="lecture_additional_info" ${lecture_state_cd == "end" ? "style='display:none'": ""}>정원: ${max_member_num} 명 / 진행중  ${ing_member_num} 명 / 수업시간 ${lecture_time} 분</div>
                                <div class="lecture_additional_info" ${lecture_state_cd == "ing" ? "style='display:none'": ""}>정원: ${max_member_num} 명 / 수업시간 ${lecture_time} 분</div>
                            </div>
                            <div class="cell_lecture_selected">
                                <img src="/static/common/icon/icon_confirm_black.png" class="obj_icon_basic ${checked == 0 ? 'none' : 'lecture_selected'}">
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
    static select_member_row (multiple_select, checked, location, member_id, member_name, member_avail_count, member_expiry, member_fix_state_cd, member_profile_url, disable_zero_avail_count, onclick){
        let fix_member_check = '';
        if(member_fix_state_cd==FIX){
            fix_member_check = '고정회원';
        }
        let html = `
                    <li class="select_member_row smr_${location}" id="select_member_row_${member_id}" ${disable_zero_avail_count == ON && member_avail_count == 0 && checked == 0? "style='opacity:0.6;'": ""}>
                        <div class="obj_table_raw">
                            <div style="display:table-cell; width:35px; height:35px; padding-right:10px;">
                                <img src="${member_profile_url}" style="width:35px; height:35px; border-radius: 50%;">
                            </div>
                            <div style="display:table-cell; vertical-align: middle;">
                                <div class="cell_member_name">
                                    ${member_name}
                                </div>
                                <div class="cell_member_info">
                                    예약 가능 횟수 - ${member_avail_count}회 / ${member_expiry}까지
                                </div>
                            </div>
                            <div style="display:table-cell; line-height:35px; float:right;">
                                <div class="cell_member_fix">
                                    ${fix_member_check}
                                </div>
                                <div class="cell_member_selected">
                                    <img src="/static/common/icon/icon_confirm_black.png" class="obj_icon_basic ${checked == 0 ? '' : 'member_selected'}">
                                </div>
                            </div>
                        </div>
                    </li>
                    `;

        if(multiple_select > 1){
            $(document).off('click', `#select_member_row_${member_id}`).on('click', `#select_member_row_${member_id}`, function(e){
                if(disable_zero_avail_count == ON && member_avail_count == 0 && checked == 0){
                    return false;
                }
                let member_select_count = $(`.smr_${location} .member_selected`).length;
                if(!$(this).find('.cell_member_selected img').hasClass('member_selected')){
                    if($(`.smr_${location} .member_selected`).length >= multiple_select){
                        show_error_message(`${multiple_select} 명까지 선택할 수 있습니다.`);
                        return false;
                    }
                    $(this).find('.cell_member_selected img').addClass('member_selected');
                    onclick('add');
                    member_select_count++;

                }else{
                    $(this).find('.cell_member_selected img').removeClass('member_selected');
                    onclick('substract');
                    member_select_count--;
                }
                $('#select_member_max_num').text(member_select_count);
            });
        }else if(multiple_select == 1){
            $(document).off('click', `#select_member_row_${member_id}`).on('click', `#select_member_row_${member_id}`, function(e){
                if(disable_zero_avail_count == ON && member_avail_count == 0 && checked == 0){
                    return false;
                }
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
                                <img src="/static/common/icon/icon_confirm_black.png" class="obj_icon_basic ${checked == 0 ? '' : 'color_selected'}">
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
        if(icon == NONE){
            icon = '/static/common/icon/icon_gap_black.png';
        }
        let html = `
                    <li class="select_row sr_${location}" id="select_row_${id}">
                        <div class="obj_table_raw">
                            <div class="cell_select_icon" style="display:${icon == DELETE ? 'none' : ''}">
                               <img src="${icon == DELETE ? '' : icon}" style="height:100%;">
                            </div>
                            <div class="cell_select_title">
                                ${title}
                            </div>
                            <div class="cell_select_selected">
                                <img src="/static/common/icon/icon_confirm_black.png" class="obj_icon_basic ${checked == 0 ? '' : 'option_selected'}">
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
                        <div style="display:flex;">
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
                onclick('uncheck_absence');
            }else{
                onclick('check_absence');
            }
        });

        $(document).off('click', `#${member_id}_attend`).on('click', `#${member_id}_attend`, function(){
            if($(this).find('.pters_checkbox').hasClass('checkbox_selected')){
                onclick('uncheck_attend');
            }else{
                onclick('check_attend');
            }
        });

        return html;
    }

    //회원의 일정 이력에 사용되는 행
    static schedule_history_row (numbering, schedule_id, date, schedule_name, attend_status, memo, callback){
        let html = `<li class="schedule_history_row" id="schedule_history_row_${schedule_id}">`;
        let raw_1 = `<div class="obj_table_raw">
                            <div class="cell_schedule_num">${numbering}</div>
                            <div class="cell_schedule_info">${schedule_name}</div>
                            <div class="cell_schedule_attend" style="color:${SCHEDULE_STATUS_COLOR[attend_status]}">${SCHEDULE_STATUS[attend_status]}</div>
                        </div>`;
        let raw_2 = `<div class="obj_table_raw table_date_info">
                            <div class="cell_schedule_num"></div>
                            <div class="cell_schedule_info">${date}</div>
                        </div>`;
        let raw_3 = `<div class="obj_table_raw table_memo_info">
                            <div class="cell_schedule_num"></div>
                            <div class="cell_schedule_info">${memo}</div>
                        </div>`;
        html += raw_1 + raw_2;
        if(memo != ''){
            html += raw_3;
        }
        html += '</li>';
        $(document).off('click', `#schedule_history_row_${schedule_id}`).on('click', `#schedule_history_row_${schedule_id}`, function(){
            callback();
        });
        return html;
    }

    //회원의 수강권 이력에 사용되는 행
    static ticket_history_row (numbering, ticket_id, date, ticket_name, ticket_price, ticket_refund_price, reg_count, remain_count, avail_count, status_code, note, onclick){
        let status_color = "";
        if(status_code == "IP"){
            status_color = "green";
        }else if(status_code == "RF"){
            status_color = "orange";
        }
        let html = `<li class="ticket_history_row" id="ticket_history_row_${ticket_id}">
                        <div class="obj_table_raw table_basic_info">
                            <div class="cell_ticket_num">${numbering}</div>
                            <div class="cell_ticket_info">${ticket_name}</div>
                            <div class="cell_ticket_attend" style="color:${status_color}">${TICKET_STATUS[status_code]}</div>
                        </div>
                        <div class="obj_table_raw table_date_info">
                            <div class="cell_ticket_num"></div>
                            <div class="cell_ticket_info">등록금액: ${ticket_price} ${status_code == "RF" ? ' 환불금액: -' + ticket_refund_price : ""}</div>
                        </div>
                        <div class="obj_table_raw table_date_info">
                            <div class="cell_ticket_num"></div>
                            <div class="cell_ticket_info">${date}</div>
                        </div>
                        <div class="obj_table_raw table_memo_info">
                            <div class="cell_ticket_num"></div>
                            <div class="cell_ticket_info">등록 ${reg_count} 회 / 잔여횟수 ${remain_count} / 예약가능 ${avail_count}</div>
                        </div>
                        <div class="obj_table_raw table_memo_info" style="color:#ff7184;">
                            <div class="cell_ticket_num"></div>
                            <div class="cell_ticket_info">${note}</div>
                        </div>
                    </li>`;
        $(document).off('click', `#ticket_history_row_${ticket_id}`).on('click', `#ticket_history_row_${ticket_id}`, function(){
            onclick();
        });
        return html;
    }

    

    static no_data_row(text){
        let html = `<li class="no_data_row">
                        <div class="obj_table_raw">
                            <div class="cell_no_data_row_text">
                                
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
            if(onclick!=undefined){
                onclick();
            }
        });
        return html;
    }
    //텍스트만 있는 버튼
    static text_button (id, title, style, onclick){
        let style_code = CComponent.data_to_style_code(style);
        let html = `<span id="text_button_${id}" style="cursor:pointer;padding:3px 0;${style_code}">${title}</span>`;
        
        $(document).off('click', `#text_button_${id}`).on('click', `#text_button_${id}`, function(e){
            if(onclick!=undefined){
                onclick();
            }
        });
        return html;
    }

    //왼쪽에 아이콘과 오른쪽에 텍스트가 있는 버튼
    static icon_button (id, title, url, style, onclick){
        if(url == null){
            url = '/static/common/icon/icon_dissatisfied.png';
        }
        if(url == NONE){
            url = '/static/common/icon/icon_gap_black.png';
        }

        let html = `<div id="icon_button_${id}" style="cursor:pointer;padding:3px 8px;display:inline-block;height:40px;width:auto;${CComponent.data_to_style_code(style)}">
                        <img src="${url == DELETE ? '' :url}" style="width:24px;height:24px;vertical-align:middle;margin-bottom:4px;margin-right:5px;${url == DELETE ? 'display:none': ''}">
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
            url = '/static/common/icon/icon_dissatisfied.png';
        }
        let html = `<div id="image_button_${id}" style="cursor:pointer;padding:3px 8px;display:inline-block;height:40px;width:auto;${CComponent.data_to_style_code(style)}">
                        <img src="${url}" style="width:24px;height:24px;vertical-align:middle;margin-bottom:4px;margin-right:5px;" alt="${title}">
                    </div>`;
        
        $(document).off('click', `#image_button_${id}`).on('click', `#image_button_${id}`, function(e){
            onclick();
        });
        return html;
    }

    static toggle_button (id, power, style, onclick){
        let html = `<div id="toggle_button_${id}" style="${CComponent.data_to_style_code(style)}" class="toggle_button ${power == ON ? 'toggle_button_active': ''}">
                        <div class="toggle_button_ball ${power == ON ? 'toggle_button_ball_active':''}"></div>
                    </div>`;
        
        $(document).off('click', `#toggle_button_${id}`).on('click', `#toggle_button_${id}`, function(e){
            let $this = $(`#toggle_button_${id}`);
            if($this.hasClass('toggle_button_active')){
                onclick(OFF);
            }else{
                onclick(ON);
            }
        });
        return html;
    }

    static radio_button (id, checked, style, onclick){
        let html = `<div id="radio_button_${id}" style="${CComponent.data_to_style_code(style)}" class="radio_button ${checked == ON ? 'radio_button_active': ''}">
                        <div class="radio_button_ball ${checked == ON ? 'radio_button_ball_active':''}"></div>
                    </div>`;
        
        $(document).off('click', `#radio_button_${id}`).on('click', `#radio_button_${id}`, function(e){
            let $this = $(`#radio_button_${id}`);
            if($this.hasClass('radio_button_active')){
                onclick(OFF);
            }else{
                onclick(ON);
            }
        });
        return html;
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

class CImg{
    static blank(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/공백" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"></g>
                    </svg>
                    `;
        return svg;
    }

    static home(ex_class, style){
        let svg = `<svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="cimg_home" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <polygon id="Path-14" fill="var(--img-main)" points="12 4 21 13 21 23 23 23 23 12 12 1 1 12 1 23 3 23 3 13"></polygon>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static calendar(ex_class, style){
        let svg = `<svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}"  width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="cimg_calendar" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" d="M8.00051832,0.5 L8.00051832,2.5 L16.0005183,2.5 L16.0005183,0.5 L18.0005183,0.5 L18.0005183,2.5 L22.5005186,2.5 L22.5010362,21.5054385 C22.5010663,22.6070044 21.5986976,23.5 20.5064204,23.5 L3.49461578,23.5 C2.39298985,23.5 1.4999702,22.5976562 1.5,21.5054385 L1.50051858,2.5 L6.00051832,2.5 L6.00051832,0.5 L8.00051832,0.5 Z M20.4998853,4.5 L3.49988534,4.5 L3.49988534,21.5 L20.4998853,21.5 L20.4998853,4.5 Z M7.99988558,17 C8.55217033,17 8.99988558,17.4477153 8.99988558,18 C8.99988558,18.5522847 8.55217033,19 7.99988558,19 C7.44760083,19 6.99988558,18.5522847 6.99988558,18 C6.99988558,17.4477153 7.44760083,17 7.99988558,17 Z M11.9998856,17 C12.5521703,17 12.9998856,17.4477153 12.9998856,18 C12.9998856,18.5522847 12.5521703,19 11.9998856,19 C11.4476008,19 10.9998856,18.5522847 10.9998856,18 C10.9998856,17.4477153 11.4476008,17 11.9998856,17 Z M15.9998856,17 C16.5521703,17 16.9998856,17.4477153 16.9998856,18 C16.9998856,18.5522847 16.5521703,19 15.9998856,19 C15.4476008,19 14.9998856,18.5522847 14.9998856,18 C14.9998856,17.4477153 15.4476008,17 15.9998856,17 Z M7.99988558,13 C8.55217033,13 8.99988558,13.4477153 8.99988558,14 C8.99988558,14.5522847 8.55217033,15 7.99988558,15 C7.44760083,15 6.99988558,14.5522847 6.99988558,14 C6.99988558,13.4477153 7.44760083,13 7.99988558,13 Z M11.9998856,13 C12.5521703,13 12.9998856,13.4477153 12.9998856,14 C12.9998856,14.5522847 12.5521703,15 11.9998856,15 C11.4476008,15 10.9998856,14.5522847 10.9998856,14 C10.9998856,13.4477153 11.4476008,13 11.9998856,13 Z M15.9998856,13 C16.5521703,13 16.9998856,13.4477153 16.9998856,14 C16.9998856,14.5522847 16.5521703,15 15.9998856,15 C15.4476008,15 14.9998856,14.5522847 14.9998856,14 C14.9998856,13.4477153 15.4476008,13 15.9998856,13 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static member(ex_class, style){
        let svg = `<svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}"  width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="cimg_member" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" d="M11.9910643,3.00003143 C10.3386013,2.99568275 8.99554913,4.33917449 9.00003342,5.99230661 C9.00451676,7.64508415 10.3549209,8.99561996 12.0073398,8.99996853 C13.6609335,9.00432019 15.00445,7.66089511 14.9999666,6.00809626 C14.9954823,4.35494282 13.6447021,3.00438321 11.9910643,3.00003143 Z M11.9990507,11 C9.2427378,11 7,8.75668107 7,6.00023734 C7,3.24331893 9.2427378,1 11.9990507,1 C14.7567875,1 17,3.24331893 17,6.00023734 C17,8.75668107 14.7567875,11 11.9990507,11 Z M6,23 C6,23 6,23 7.5,17 C8.25,14 10.5,14 10.5,14 L13.5,14 C13.5,14 15.75,14 16.5,17 C18,23 18,23 18,23 L20,23 C20,23 20,23 18.5,17 C17.25,12 13.5,12 13.5,12 L10.5,12 C10.5,12 6.75,12 5.5,17 C4,23 4,23 4,23 L6,23 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static notification(ex_class, style){
        let svg = `<svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}"  width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="cimg_notification" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" d="M21,18 L21,20 L3,20 L3,18 L21,18 Z M21,11 L21,13 L3,13 L3,11 L21,11 Z M21,4 L21,6 L3,6 L3,4 L21,4 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static menu(ex_class, style){
        let svg = `<svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}"  width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <defs>
                            <path d="M17.7,16.5 L16,13.5 L16,7.5 C16,7.5 16,3.5 13,3.5 L11,3.5 C8,3.5 8,7.5 8,7.5 L8,13.5 L6.3,16.5 L17.7,16.5 Z M18,13.5 L21,18.5 L3,18.5 L6,13.5 L6,7.5 C6,7.5 6,1.5 11,1.5 L13,1.5 C18,1.5 18,7.5 18,7.5 L18,13.5 Z M11,18.5 L11,19.5733333 C11,20.3911111 11.3333333,20.8 12,20.8 C12.6666667,20.8 13,20.3911111 13,19.5733333 L13,18.5 L11,18.5 Z M9,19.2692308 L9,16.5 L15,16.5 L15,19.2692308 C15,21.4230769 14,22.5 12,22.5 C10,22.5 9,21.4230769 9,19.2692308 Z" id="path-1"></path>
                        </defs>
                        <g id="cimg_menu" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <mask id="mask-2" fill="white">
                                <use xlink:href="#path-1"></use>
                            </mask>
                            <use id="Combined-Shape" fill="var(--img-main)" fill-rule="nonzero" xlink:href="#path-1"></use>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static program(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="cimg_program" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Rectangle-3652" fill="var(--img-main)" d="M4,8 L4,19 L20,19 L20,5 L14.9367499,5 L12.4367499,8 L4,8 Z M2,6 L11.5,6 L14,3 L22,3 L22,19 C22,20.1045695 21.1045695,21 20,21 L4,21 C2.8954305,21 2,20.1045695 2,19 L2,6 L2,6 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static lecture(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/수업/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" d="M20,2 C21.1045695,2 22,2.8954305 22,4 L22,20 C22,21.1045695 21.1045695,22 20,22 L4,22 C2.8954305,22 2,21.1045695 2,20 L2,4 C2,2.8954305 2.8954305,2 4,2 L20,2 Z M9,4 L4,4 L4,20 L20,20 L20,4 L15,4 L15,12 L12,10 L9,12 L9,4 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static ticket(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/수강권/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" d="M21.008845,4 C22.0602587,4 22.9186829,4.81587779 22.9945492,5.85073766 L23,6 L23,10 C23,10 21,10 21,12 C21,13.8623514 22.7336504,13.9905265 22.9727746,13.999348 L23,14 L23,18 C23,19.0617126 22.1877304,19.9188334 21.1574472,19.9945598 L21.008845,20 L2.991155,20 C1.93974127,20 1.08131707,19.1865453 1.00545085,18.1547588 L1,18.0059397 L1,5.99406028 C1,4.94449314 1.81226957,4.08174305 2.84255277,4.00547975 L2.991155,4 L21.008845,4 Z M5,6 L3,6 L3,18 L15,18.0003033 L15,18.0003033 C15,17.4874675 15.3827202,17.0647962 15.8826674,17.007031 L16,17.0003033 C16.5128358,17.0003033 16.9355072,17.3830235 16.9932723,17.8829708 L17,18.0003033 L21,18 L21,15.5 C21,15.5 19,14.9996967 19,12 C19,9.00030331 21,8.5 21,8.5 L21,6 L17,6 C17,6.51283584 16.6172798,6.93550716 16.1173326,6.99327227 L16,7 C15.4477153,7 15,6.55613518 15,6 L11,6.00030331 L11,12 L8,10 L5,12.000303 L5,6 Z M16,14.0003033 C16.5128358,14.0003033 16.9355072,14.3830235 16.9932723,14.8829708 L17,15.0003033 C17,15.5131392 16.6172798,15.9358105 16.1173326,15.9935756 L16,16.0003033 C15.4477153,16.0003033 15,15.5564385 15,15.0003033 C15,14.4874675 15.3827202,14.0647962 15.8826674,14.007031 L16,14.0003033 Z M16,11.0003033 C16.5128358,11.0003033 16.9355072,11.3830235 16.9932723,11.8829708 L17,12.0003033 C17,12.5131392 16.6172798,12.9358105 16.1173326,12.9935756 L16,13.0003033 C15.4477153,13.0003033 15,12.5564385 15,12.0003033 C15,11.4874675 15.3827202,11.0647962 15.8826674,11.007031 L16,11.0003033 Z M16,8 C16.5128358,8 16.9355072,8.38272018 16.9932723,8.88266744 L17,9 C17,9.51283584 16.6172798,9.93550716 16.1173326,9.99327227 L16,10 C15.4477153,10 15,9.55613518 15,9 C15,8.48716416 15.3827202,8.06449284 15.8826674,8.00672773 L16,8 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static statistics(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/통계/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Shape" fill="var(--img-main)" fill-rule="nonzero" d="M2,4 L2,20 C2,21.1045695 2.8954305,22 4,22 L20,22 C21.1045695,22 22,21.1045695 22,20 L22,4 C22,2.8954305 21.1045695,2 20,2 L4,2 C2.8954305,2 2,2.8954305 2,4 Z M20,20 L4,20 L4,4 L20,4 L20,20 Z M7,10 L9.5,10 L9.5,18 L7,18 L7,10 Z M11,7 L13.5,7 L13.5,18 L11,18 L11,7 Z M15,13 L17.5,13 L17.5,18 L15,18 L15,13 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static attend_check(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/출석체크/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" d="M6,6 L6,21.1111111 L18,21.1111111 L18,6 L20,6 L20,21 C20,22.1045695 19.1045695,23 18,23 L6,23 C4.8954305,23 4,22.1045695 4,21 L4,6 L6,6 Z M12.0062383,1 C13.0592846,1 13.9220102,1.8152168 13.9982641,2.85064752 L14.003743,3 L15.0014532,3 C16.1052201,3 17,3.90009892 17,5.00104344 L17,6 L7,6 L7.00415453,5.00104344 C7.00875069,3.89589766 7.91145251,3 9.01102343,3 L10.0087336,3 C10.0087336,1.9456382 10.8165855,1.08183488 11.8562066,1.00548574 L12.0062383,1 Z"></path>
                            <polygon id="Icon" fill="var(--img-highlight)" points="11.1893398 13.9571068 9.06801948 11.8357864 7.65380592 13.25 11.1893398 16.7855339 16.8461941 11.1286797 15.4319805 9.71446609"></polygon>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static setting_calendar(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/업무시간설정2/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" fill-rule="nonzero" d="M19.0274713,13 C19.1300884,13 19.2255793,13.0625 19.2604976,13.1527778 L19.2737523,13.21 L19.4687248,14.53 C19.7073095,14.62 19.9285776,14.738125 20.1368582,14.8759375 L20.34097,15.02 L21.6134219,14.52 C21.716039,14.4866667 21.8257823,14.5088889 21.8951438,14.5808796 L21.9315349,14.63 L22.9577058,16.36 C23.006962,16.448 22.9971108,16.5488 22.9439141,16.62656 L22.8961355,16.68 L21.8083944,17.51 C21.8391795,17.67 21.8494412,17.83 21.8494412,18 C21.8494412,18.1133333 21.8403197,18.2222222 21.8281577,18.3296296 L21.8083944,18.49 L22.9063973,19.32 C22.9802816,19.384 23.0147609,19.48 22.9940733,19.57216 L22.9679675,19.64 L21.9417966,21.37 C21.884331,21.458 21.7874605,21.5012 21.693217,21.49448 L21.6236836,21.48 L20.34097,20.98 C20.148563,21.13 19.9330671,21.2575 19.7074698,21.3667187 L19.4789865,21.47 L19.284014,22.79 C19.2669112,22.89 19.1856726,22.9691667 19.0878063,22.9927778 L19.0274713,23 L16.9751295,23 C16.863961,23 16.774171,22.9375 16.7354521,22.8472222 L16.7185868,22.79 L16.5236143,21.47 C16.2850296,21.38 16.0637615,21.261875 15.8554808,21.1240625 L15.651369,20.98 L14.3789171,21.48 C14.2763,21.5133333 14.1665568,21.4911111 14.0971952,21.4191204 L14.0608042,21.37 L13.0346333,19.64 C12.9853771,19.552 12.9952283,19.4512 13.048425,19.37344 L13.0962035,19.32 L14.1839447,18.49 C14.1634212,18.33 14.1531595,18.17 14.1531595,18 C14.1531595,17.8866667 14.1577203,17.7777778 14.1668418,17.6703704 L14.1839447,17.51 L13.0962035,16.68 C13.0141098,16.616 12.9845561,16.52 13.0075424,16.42784 L13.0346333,16.36 L14.0608042,14.63 C14.1182697,14.542 14.2151403,14.4988 14.3093838,14.50552 L14.3789171,14.52 L15.651369,15.02 C15.8514724,14.87 16.0688923,14.7425 16.2949706,14.6332813 L16.5236143,14.53 L16.7185868,13.21 C16.7356896,13.11 16.8169282,13.0308333 16.9147944,13.0072222 L16.9751295,13 L19.0274713,13 Z M10.99,1 C16.52,1 21,5.48 21,11 L21,11 L19,11 C19,6.58 15.42,3 11,3 C6.58,3 3,6.58 3,11 C3,15.42 6.58,19 11,19 L10.996,18.999 L10.9962516,19.4964598 C10.9948355,20.3933083 10.9930182,20.8889352 10.9907997,20.9833403 L10.99,21 C5.47,21 1,16.52 1,11 C1,5.48 5.47,1 10.99,1 Z M18,16 C16.8933333,16 16,16.8933333 16,18 C16,19.1066667 16.8933333,20 18,20 C19.1066667,20 20,19.1066667 20,18 C20,16.8933333 19.1066667,16 18,16 Z M12.0973939,5 L12.0973939,12 L7.1319694,15.4802507 L6,13.8636309 L10.0973939,11 L10.0973939,5 L12.0973939,5 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static setting_work_time(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/업무시간설정1/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" fill-rule="nonzero" d="M19.0274713,13 C19.1300884,13 19.2255793,13.0625 19.2604976,13.1527778 L19.2737523,13.21 L19.4687248,14.53 C19.7073095,14.62 19.9285776,14.738125 20.1368582,14.8759375 L20.34097,15.02 L21.6134219,14.52 C21.716039,14.4866667 21.8257823,14.5088889 21.8951438,14.5808796 L21.9315349,14.63 L22.9577058,16.36 C23.006962,16.448 22.9971108,16.5488 22.9439141,16.62656 L22.8961355,16.68 L21.8083944,17.51 C21.8391795,17.67 21.8494412,17.83 21.8494412,18 C21.8494412,18.1133333 21.8403197,18.2222222 21.8281577,18.3296296 L21.8083944,18.49 L22.9063973,19.32 C22.9802816,19.384 23.0147609,19.48 22.9940733,19.57216 L22.9679675,19.64 L21.9417966,21.37 C21.884331,21.458 21.7874605,21.5012 21.693217,21.49448 L21.6236836,21.48 L20.34097,20.98 C20.148563,21.13 19.9330671,21.2575 19.7074698,21.3667187 L19.4789865,21.47 L19.284014,22.79 C19.2669112,22.89 19.1856726,22.9691667 19.0878063,22.9927778 L19.0274713,23 L16.9751295,23 C16.863961,23 16.774171,22.9375 16.7354521,22.8472222 L16.7185868,22.79 L16.5236143,21.47 C16.2850296,21.38 16.0637615,21.261875 15.8554808,21.1240625 L15.651369,20.98 L14.3789171,21.48 C14.2763,21.5133333 14.1665568,21.4911111 14.0971952,21.4191204 L14.0608042,21.37 L13.0346333,19.64 C12.9853771,19.552 12.9952283,19.4512 13.048425,19.37344 L13.0962035,19.32 L14.1839447,18.49 C14.1634212,18.33 14.1531595,18.17 14.1531595,18 C14.1531595,17.8866667 14.1577203,17.7777778 14.1668418,17.6703704 L14.1839447,17.51 L13.0962035,16.68 C13.0141098,16.616 12.9845561,16.52 13.0075424,16.42784 L13.0346333,16.36 L14.0608042,14.63 C14.1182697,14.542 14.2151403,14.4988 14.3093838,14.50552 L14.3789171,14.52 L15.651369,15.02 C15.8514724,14.87 16.0688923,14.7425 16.2949706,14.6332813 L16.5236143,14.53 L16.7185868,13.21 C16.7356896,13.11 16.8169282,13.0308333 16.9147944,13.0072222 L16.9751295,13 L19.0274713,13 Z M19.0092049,5 C20.1086907,5 21,5.89826062 21,6.99791312 L21,11 L19,11 L19,7 L3,7 L3,19 L11,18.999 L11,21 L2.99961498,21 C1.89525812,21 1,20.1054862 1,19.0059397 L1,6.99406028 C1,5.8927712 1.89821238,5 2.99079514,5 L19.0092049,5 Z M18,16 C16.8933333,16 16,16.8933333 16,18 C16,19.1066667 16.8933333,20 18,20 C19.1066667,20 20,19.1066667 20,18 C20,16.8933333 19.1066667,16 18,16 Z M13.4952612,1 C14.3263055,1 15,1.66579723 15,2.5 L15,4 L13,4 L13,3 L9,3 L9,4 L7,4 L7,2.5 C7,1.67157288 7.66831553,1 8.50473881,1 L13.4952612,1 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static setting_autocomplete(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/자동완료설정/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <polygon id="Icon" fill="var(--img-highlight)" points="10.0355339 11.7426407 7.91421356 9.62132034 6.5 11.0355339 10.0355339 14.5710678 15.6923882 8.91421356 14.2781746 7.5"></polygon>
                            <path id="Shape" fill="var(--img-main)" fill-rule="nonzero" d="M10.99,1 C5.47,1 1,5.48 1,11 C1,16.52 5.47,21 10.99,21 C10.9966667,21 11,17.6666667 11,11 C17.6666667,11 21,11 21,11 C21,5.48 16.52,1 10.99,1 Z M11,19 C6.58,19 3,15.42 3,11 C3,6.58 6.58,3 11,3 C15.42,3 19,6.58 19,11 C19,11 16.3333333,11 11,11 C11,16.3333333 11,19 11,19 Z"></path>
                            <path id="Combined-Shape" fill="var(--img-main)" fill-rule="nonzero" d="M19.0274713,13 C19.1506118,13 19.2634906,13.09 19.2737523,13.21 L19.2737523,13.21 L19.4687248,14.53 C19.7868377,14.65 20.0741656,14.82 20.34097,15.02 L20.34097,15.02 L21.6134219,14.52 C21.7365624,14.48 21.8699647,14.52 21.9315349,14.63 L21.9315349,14.63 L22.9577058,16.36 C23.0192761,16.47 22.9884909,16.6 22.8961355,16.68 L22.8961355,16.68 L21.8083944,17.51 C21.8391795,17.67 21.8494412,17.83 21.8494412,18 C21.8494412,18.17 21.8289178,18.33 21.8083944,18.49 L21.8083944,18.49 L22.9063973,19.32 C22.9987526,19.4 23.0295378,19.53 22.9679675,19.64 L22.9679675,19.64 L21.9417966,21.37 C21.8699647,21.48 21.7365624,21.52 21.6236836,21.48 L21.6236836,21.48 L20.34097,20.98 C20.0844273,21.18 19.7868377,21.34 19.4789865,21.47 L19.4789865,21.47 L19.284014,22.79 C19.2634906,22.91 19.1506118,23 19.0274713,23 L19.0274713,23 L16.9751295,23 C16.8417273,23 16.7391102,22.91 16.7185868,22.79 L16.7185868,22.79 L16.5236143,21.47 C16.2055013,21.35 15.9181735,21.18 15.651369,20.98 L15.651369,20.98 L14.3789171,21.48 C14.2557766,21.52 14.1223744,21.48 14.0608042,21.37 L14.0608042,21.37 L13.0346333,19.64 C12.973063,19.53 13.0038481,19.4 13.0962035,19.32 L13.0962035,19.32 L14.1839447,18.49 C14.1634212,18.33 14.1531595,18.17 14.1531595,18 C14.1531595,17.83 14.1634212,17.67 14.1839447,17.51 L14.1839447,17.51 L13.0962035,16.68 C12.9935864,16.6 12.973063,16.47 13.0346333,16.36 L13.0346333,16.36 L14.0608042,14.63 C14.1326361,14.52 14.2660383,14.48 14.3789171,14.52 L14.3789171,14.52 L15.651369,15.02 C15.9181735,14.82 16.215763,14.66 16.5236143,14.53 L16.5236143,14.53 L16.7185868,13.21 C16.7391102,13.09 16.851989,13 16.9751295,13 L16.9751295,13 Z M18,16 C16.8933333,16 16,16.8933333 16,18 C16,19.1066667 16.8933333,20 18,20 C19.1066667,20 20,19.1066667 20,18 C20,16.8933333 19.1066667,16 18,16 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static setting_reserve(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/회원예약설정/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" fill-rule="nonzero" d="M18.0272407,13 C18.1298578,13 18.2253487,13.0625 18.260267,13.1527778 L18.2735217,13.21 L18.4684941,14.53 C18.7070789,14.62 18.928347,14.738125 19.1366276,14.8759375 L19.3407394,15.02 L20.6131913,14.52 C20.7158084,14.4866667 20.8255517,14.5088889 20.8949132,14.5808796 L20.9313043,14.63 L21.9574752,16.36 C22.0067314,16.448 21.9968801,16.5488 21.9436834,16.62656 L21.8959049,16.68 L20.8081638,17.51 C20.8389489,17.67 20.8492106,17.83 20.8492106,18 C20.8492106,18.1133333 20.8400891,18.2222222 20.8279271,18.3296296 L20.8081638,18.49 L21.9061666,19.32 C21.9800509,19.384 22.0145303,19.48 21.9938427,19.57216 L21.9677369,19.64 L20.941566,21.37 C20.8841004,21.458 20.7872299,21.5012 20.6929864,21.49448 L20.623453,21.48 L19.3407394,20.98 C19.1483324,21.13 18.9328365,21.2575 18.7072392,21.3667187 L18.4787559,21.47 L18.2837834,22.79 C18.2666805,22.89 18.185442,22.9691667 18.0875757,22.9927778 L18.0272407,23 L15.9748989,23 C15.8637304,23 15.7739404,22.9375 15.7352215,22.8472222 L15.7183562,22.79 L15.5233837,21.47 C15.284799,21.38 15.0635309,21.261875 14.8552502,21.1240625 L14.6511384,20.98 L13.3786865,21.48 C13.2760694,21.5133333 13.1663262,21.4911111 13.0969646,21.4191204 L13.0605735,21.37 L12.0344027,19.64 C11.9851464,19.552 11.9949977,19.4512 12.0481944,19.37344 L12.0959729,19.32 L13.1837141,18.49 C13.1631906,18.33 13.1529289,18.17 13.1529289,18 C13.1529289,17.8866667 13.1574897,17.7777778 13.1666112,17.6703704 L13.1837141,17.51 L12.0959729,16.68 C12.0138792,16.616 11.9843255,16.52 12.0073117,16.42784 L12.0344027,16.36 L13.0605735,14.63 C13.1180391,14.542 13.2149096,14.4988 13.3091532,14.50552 L13.3786865,14.52 L14.6511384,15.02 C14.8512418,14.87 15.0686617,14.7425 15.29474,14.6332813 L15.5233837,14.53 L15.7183562,13.21 C15.735459,13.11 15.8166975,13.0308333 15.9145638,13.0072222 L15.9748989,13 L18.0272407,13 Z M9.99976938,12 L9.99976938,14 L8.49976938,14 C8.49976938,14 6.24976938,14 5.49976938,17 C4.08012653,22.6785714 4.00407423,22.9827806 4,22.9990775 L2,22.9990775 C2.00407423,22.9827806 2.08012653,22.6785714 3.49976938,17 C4.74976938,12 8.49976938,12 8.49976938,12 L8.49976938,12 L9.99976938,12 L9.99976938,12 Z M16.9997694,16 C15.8931027,16 14.9997694,16.8933333 14.9997694,18 C14.9997694,19.1066667 15.8931027,20 16.9997694,20 C18.106436,20 18.9997694,19.1066667 18.9997694,18 C18.9997694,16.8933333 18.106436,16 16.9997694,16 Z M9.99882008,1 C12.7565569,1 14.9997694,3.24331893 14.9997694,6.00023734 C14.9997694,8.75668107 12.7565569,11 9.99882008,11 C7.24250718,11 4.99976938,8.75668107 4.99976938,6.00023734 C4.99976938,3.24331893 7.24250718,1 9.99882008,1 Z M9.99083372,3.00003143 C8.3383707,2.99568275 6.99531851,4.33917449 6.99980281,5.99230661 C7.00428614,7.64508415 8.35469028,8.99561996 10.0071092,8.99996853 C11.6607028,9.00432019 13.0042194,7.66089511 12.999736,6.00809626 C12.9952516,4.35494282 11.6444715,3.00438321 9.99083372,3.00003143 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static setting_notification(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/알림설정/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" fill-rule="nonzero" d="M19.0274713,13 C19.1506118,13 19.2634906,13.09 19.2737523,13.21 L19.2737523,13.21 L19.4687248,14.53 C19.7868377,14.65 20.0741656,14.82 20.34097,15.02 L20.34097,15.02 L21.6134219,14.52 C21.7365624,14.48 21.8699647,14.52 21.9315349,14.63 L21.9315349,14.63 L22.9577058,16.36 C23.0192761,16.47 22.9884909,16.6 22.8961355,16.68 L22.8961355,16.68 L21.8083944,17.51 C21.8391795,17.67 21.8494412,17.83 21.8494412,18 C21.8494412,18.17 21.8289178,18.33 21.8083944,18.49 L21.8083944,18.49 L22.9063973,19.32 C22.9987526,19.4 23.0295378,19.53 22.9679675,19.64 L22.9679675,19.64 L21.9417966,21.37 C21.8699647,21.48 21.7365624,21.52 21.6236836,21.48 L21.6236836,21.48 L20.34097,20.98 C20.0844273,21.18 19.7868377,21.34 19.4789865,21.47 L19.4789865,21.47 L19.284014,22.79 C19.2634906,22.91 19.1506118,23 19.0274713,23 L19.0274713,23 L16.9751295,23 C16.8417273,23 16.7391102,22.91 16.7185868,22.79 L16.7185868,22.79 L16.5236143,21.47 C16.2055013,21.35 15.9181735,21.18 15.651369,20.98 L15.651369,20.98 L14.3789171,21.48 C14.2557766,21.52 14.1223744,21.48 14.0608042,21.37 L14.0608042,21.37 L13.0346333,19.64 C12.973063,19.53 13.0038481,19.4 13.0962035,19.32 L13.0962035,19.32 L14.1839447,18.49 C14.1634212,18.33 14.1531595,18.17 14.1531595,18 C14.1531595,17.83 14.1634212,17.67 14.1839447,17.51 L14.1839447,17.51 L13.0962035,16.68 C12.9935864,16.6 12.973063,16.47 13.0346333,16.36 L13.0346333,16.36 L14.0608042,14.63 C14.1326361,14.52 14.2660383,14.48 14.3789171,14.52 L14.3789171,14.52 L15.651369,15.02 C15.9181735,14.82 16.215763,14.66 16.5236143,14.53 L16.5236143,14.53 L16.7185868,13.21 C16.7391102,13.09 16.851989,13 16.9751295,13 L16.9751295,13 Z M18,16 C16.8933333,16 16,16.8933333 16,18 C16,19.1066667 16.8933333,20 18,20 C19.1066667,20 20,19.1066667 20,18 C20,16.8933333 19.1066667,16 18,16 Z"></path>
                            <path id="Combined-Shape" fill="var(--img-main)" fill-rule="nonzero" d="M11,16 L11,11 L15,11 L15,7 C15,7 15,3 12,3 L10,3 C7,3 7,7 7,7 L7,13 L5.3,16 L11,16 Z M17,11 L11,11 L11,18 L2,18 L5,13 L5,7 C5,7 5,1 10,1 L12,1 C17,1 17,7 17,7 L17,11 Z M10,18 L10,19.0733333 C10,19.8911111 10.3333333,20.3 11,20.3 C11,20.3 11,19.5333333 11,18 L10,18 Z M8,18.7692308 L8,16 L11,16 C11,20 11,22 11,22 C9,22 8,20.9230769 8,18.7692308 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static setting_attend_check(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/출석체크설정/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" fill-rule="nonzero" d="M19.0274713,13 C19.1300884,13 19.2255793,13.0625 19.2604976,13.1527778 L19.2737523,13.21 L19.4687248,14.53 C19.7073095,14.62 19.9285776,14.738125 20.1368582,14.8759375 L20.34097,15.02 L21.6134219,14.52 C21.716039,14.4866667 21.8257823,14.5088889 21.8951438,14.5808796 L21.9315349,14.63 L22.9577058,16.36 C23.006962,16.448 22.9971108,16.5488 22.9439141,16.62656 L22.8961355,16.68 L21.8083944,17.51 C21.8391795,17.67 21.8494412,17.83 21.8494412,18 C21.8494412,18.1133333 21.8403197,18.2222222 21.8281577,18.3296296 L21.8083944,18.49 L22.9063973,19.32 C22.9802816,19.384 23.0147609,19.48 22.9940733,19.57216 L22.9679675,19.64 L21.9417966,21.37 C21.884331,21.458 21.7874605,21.5012 21.693217,21.49448 L21.6236836,21.48 L20.34097,20.98 C20.148563,21.13 19.9330671,21.2575 19.7074698,21.3667187 L19.4789865,21.47 L19.284014,22.79 C19.2669112,22.89 19.1856726,22.9691667 19.0878063,22.9927778 L19.0274713,23 L16.9751295,23 C16.863961,23 16.774171,22.9375 16.7354521,22.8472222 L16.7185868,22.79 L16.5236143,21.47 C16.2850296,21.38 16.0637615,21.261875 15.8554808,21.1240625 L15.651369,20.98 L14.3789171,21.48 C14.2763,21.5133333 14.1665568,21.4911111 14.0971952,21.4191204 L14.0608042,21.37 L13.0346333,19.64 C12.9853771,19.552 12.9952283,19.4512 13.048425,19.37344 L13.0962035,19.32 L14.1839447,18.49 C14.1634212,18.33 14.1531595,18.17 14.1531595,18 C14.1531595,17.8866667 14.1577203,17.7777778 14.1668418,17.6703704 L14.1839447,17.51 L13.0962035,16.68 C13.0141098,16.616 12.9845561,16.52 13.0075424,16.42784 L13.0346333,16.36 L14.0608042,14.63 C14.1182697,14.542 14.2151403,14.4988 14.3093838,14.50552 L14.3789171,14.52 L15.651369,15.02 C15.8514724,14.87 16.0688923,14.7425 16.2949706,14.6332813 L16.5236143,14.53 L16.7185868,13.21 C16.7356896,13.11 16.8169282,13.0308333 16.9147944,13.0072222 L16.9751295,13 L19.0274713,13 Z M4,6 L4,21 L12,21 L12,23 L4,23 C2.8954305,23 2,22.1045695 2,21 L2,6 L4,6 Z M18,16 C16.8933333,16 16,16.8933333 16,18 C16,19.1066667 16.8933333,20 18,20 C19.1066667,20 20,19.1066667 20,18 C20,16.8933333 19.1066667,16 18,16 Z M18,6 L18,11 L16,11 L16,6 L18,6 Z M10.0062383,1 C11.0592846,1 11.9220102,1.8152168 11.9982641,2.85064752 L12.003743,3 L13.0014532,3 C14.1052201,3 15,3.90009892 15,5.00104344 L15,6 L5,6 L5.00415453,5.00104344 C5.00875069,3.89589766 5.91145251,3 7.01102343,3 L8.00873363,3 C8.00873363,1.9456382 8.81658555,1.08183488 9.85620656,1.00548574 L10.0062383,1 Z"></path>
                            <polygon id="Icon" fill="var(--img-highlight)" points="9.03553391 13.2426407 6.91421356 11.1213203 5.5 12.5355339 9.03553391 16.0710678 14.6923882 10.4142136 13.2781746 9"></polygon>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static notice(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/공지사항/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" d="M20,3 C20.5128358,3 20.9355072,3.38604019 20.9932723,3.88337887 L21,4 L21,19.087931 C21,19.2096756 20.9777689,19.330397 20.9344005,19.4441553 C20.7517158,19.9233494 20.2404339,20.1807767 19.7551431,20.0575883 L19.6437756,20.0223314 L12,17.108 L12,18 C12,19.1045695 11.1045695,20 10,20 L7,20 C5.8954305,20 5,19.1045695 5,18 L5,15.5833391 C3.9456382,15.5833391 3.08183488,14.7674613 3.00548574,13.7326015 L3,13.5833391 L3,9.58333912 C3,8.52897733 3.81587779,7.665174 4.85073766,7.58882486 L5,7.58333912 L8,7.58333912 L19.6382755,3.06771495 C19.7536231,3.02296037 19.8762744,3 20,3 Z M7,18 L10,18 L10,16.346 L8,15.5833391 L7,15.583 L7,18 Z M19,5.58333912 L8,9.58333912 L5,9.58333912 L5,13.5833391 L8,13.5833391 L19,17.5833391 L19,5.58333912 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static inquiry(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/이용문의/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" fill-rule="nonzero" d="M20,2 C21.1045695,2 22,2.8954305 22,4 L22,4 L22,16 C22,17.1045695 21.1045695,18 20,18 L20,18 L6,18 L2,22 L2,4 C2,2.8954305 2.8954305,2 4,2 L4,2 Z M20,4 L4,4 L4,18 L6,16 L20,16 L20,4 Z M8,9 C8.55228475,9 9,9.44771525 9,10 C9,10.5522847 8.55228475,11 8,11 C7.44771525,11 7,10.5522847 7,10 C7,9.44771525 7.44771525,9 8,9 Z M12,9 C12.5522847,9 13,9.44771525 13,10 C13,10.5522847 12.5522847,11 12,11 C11.4477153,11 11,10.5522847 11,10 C11,9.44771525 11.4477153,9 12,9 Z M16,9 C16.5522847,9 17,9.44771525 17,10 C17,10.5522847 16.5522847,11 16,11 C15.4477153,11 15,10.5522847 15,10 C15,9.44771525 15.4477153,9 16,9 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

    static help(ex_class, style){
        let svg = ` <svg class="${ex_class}" style="${CComponent.data_to_style_code(style)}" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <g id="아이콘/도움말/5C5859" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <path id="Combined-Shape" fill="var(--img-main)" d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M12,4 C7.59,4 4,7.59 4,12 C4,16.41 7.59,20 12,20 C16.41,20 20,16.41 20,12 C20,7.59 16.41,4 12,4 Z M12,16 C12.5522847,16 13,16.4477153 13,17 C13,17.5522847 12.5522847,18 12,18 C11.4477153,18 11,17.5522847 11,17 C11,16.4477153 11.4477153,16 12,16 Z M12,6 C14.21,6 16,7.79 16,10 C16,12.5 13,12.75 13,15 L13,15 L11,15 C11,11.75 14,12 14,10 C14,8.9 13.1,8 12,8 C10.9,8 10,8.9 10,10 L10,10 L8,10 C8,7.79 9.79,6 12,6 Z"></path>
                        </g>
                    </svg>
                    `;
        return svg;
    }

  


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
    let pattern = event.attributes['pattern'].value;
    let limit_reg_pattern = pattern.replace('[', '[^').split('{')[0];
    let limit = new RegExp(limit_reg_pattern, "gi");
    let min_length = event.attributes['minlength'].value;
    let title = event.attributes['title'].value;
    event.value = event.value.replace(limit, "");
    if(event.value.length < Number(min_length)) {
        event.attributes['data-error-message'].value = title+' : 입력해주세요.';
        event.attributes['data-valid'].value = 'false';
    }else{
        event.attributes['data-error-message'].value = '';
        event.attributes['data-valid'].value = 'true';
    }
}

function limit_char_check(event){
    let pattern = event.attributes['pattern'].value;
    let limit_reg_pattern = pattern.replace('[', '[^').split('{')[0];
    let limit = new RegExp(limit_reg_pattern, "gi");
    let limit_char_check = false;
    let min_length = event.attributes['minlength'].value;
    // let event_id = event.attributes['id'].value;
    let title = event.attributes['title'].value;
    // let confirm_id = event_id+'_confirm';
    // let default_confirm_id = event_id+'_default_confirm';
    if(event.value.length < Number(min_length)){
        event.attributes['data-error-message'].value = title+' : 최소 '+min_length+'자 이상 입력해야합니다.';
        // $(`#${confirm_id}`).text('최소 '+min_length+'자 이상 입력');
        // $(`#${default_confirm_id}`).css('color', 'black');
        event.attributes['data-valid'].value = 'false';
    }
    else{
        // $(`#${confirm_id}`).text('');
        if(limit.test(event.value)){
            event.attributes['data-error-message'].value = title+' : '+event.attributes['data-pattern-message'].value + ' 합니다.';
            // $(`#${default_confirm_id}`).css('color', '#fe4e65');
            event.attributes['data-valid'].value = 'false';
        }else{
            event.attributes['data-error-message'].value = '';
            // $(`#${default_confirm_id}`).css('color', 'green');
            event.attributes['data-valid'].value = 'true';
            limit_char_check = true;
        }
    }
    return limit_char_check;
}

function update_check_registration_form(forms){
    // form 안에 있는 값 검사
    let inputs = forms.elements;
    for(let i=0; i<inputs.length; i++){
        if (inputs[i].nodeName === "INPUT" && (inputs[i].type === "text" || inputs[i].type === "tel")) {
            // Update text input
            if(inputs[i].type === "text"){
                limit_char_check(inputs[i]);
            }
            if(inputs[i].type === "tel"){
                limit_char_auto_correction(inputs[i]);
            }
        }
        else if (inputs[i].nodeName == "TEXTAREA"){
            limit_char_check(inputs[i]);
        }
        // else if(inputs[i].nodeName === "textarea"){
        //     limit_char_check(inputs[i]);
        // }
    }
}

function check_registration_form(forms){
    // form 안에 있는 값 검사
    let inputs = forms.elements;
    let error_info = '';

    for(let i=0; i<inputs.length; i++){
        if (inputs[i].nodeName === "INPUT" && (inputs[i].type === "text" || inputs[i].type === "tel")) {
            // Update text input
            // console.log(inputs[i].getAttribute('title')+':'+inputs[i].getAttribute('data-valid'));
            if((inputs[i].value !=  '' || inputs[i].required) && inputs[i].getAttribute('data-valid') == 'false'){
                error_info = inputs[i].getAttribute('data-error-message');
                break;
            }
        }
        else if (inputs[i].nodeName == "TEXTAREA"){
            if((inputs[i].value !=  '' || inputs[i].required) && inputs[i].getAttribute('data-valid') == 'false'){
                error_info = inputs[i].getAttribute('data-error-message');
                break;
            }
        }
    }
    return error_info;
}
