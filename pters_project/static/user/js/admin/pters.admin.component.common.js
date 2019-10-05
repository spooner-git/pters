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

    //추가 페이지들에서 자주 사용되는 row 스타일
    static create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick){
        // if(icon == null){
        //     icon = '/static/common/icon/icon_dissatisfied.png';
        // }
        if(icon == NONE){
            icon = '/static/common/icon/icon_gap_black.png';
        }
        
        let html = `<li class="create_row" id="c_r_${id}" style="${CComponent.data_to_style_code(style)}">
                        <div class="obj_table_raw">
                            <div class="cell_title">
                                ${icon == DELETE ? "" : `<img src="${icon}">`} 
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
                        <div class="obj_table_raw">
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
        });

        $(document).off('focusout', `#c_i_r_${id}`).on('focusout', `#c_i_r_${id}`, function(e){
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
                        <div class="obj_table_raw">
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
            let current_value = e.target.value;
            let current_num = '';
            if(current_value != 0){
                current_num = current_value.replace(/[^0-9]/gi, "");
            }
            e.target.value = current_num;
        });

        $(document).off('focusout', `#c_i_n_r_${id}`).on('focusout', `#c_i_n_r_${id}`, function(e){
            LimitChar.number(`#c_i_n_r_${id} input`);
            let user_input_data = e.target.value;
            if(user_input_data.length == 0){
                user_input_data = null;
            }
            onfocusout(user_input_data);
        });
        return html;
    }

    static create_input_textarea_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, onfocusout){
        if(icon == NONE){
            icon = '/static/common/icon/icon_gap_black.png';
        }
        let html = `<li class="create_input_row create_input_textarea_row" id="c_i_t_r_${id}" style="${CComponent.data_to_style_code(style)}">
                        <div class="obj_table_raw" style="height:100%">
                            <div class="cell_title" style="display:${icon == DELETE ? 'none' : ''}">
                                <img src="${icon == DELETE ? '' : icon}">
                            </div>
                            <div class="cell_content">
                                <textarea class="cell_text" placeholder="${placeholder}" value="${title}" style="height:100%;" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">${title}</textarea>
                            </div>
                            <div class="cell_icon" ${icon_r_visible == HIDE ? 'style="display:none"' : ''} >
                                ${icon_r_text}
                                <img src="/static/common/icon/icon_arrow_r_small_black.png">
                            </div>
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
    static select_lecture_row (multiple_select, checked, location, lecture_id, lecture_name, color_code, max_member_num, ing_member_num, onclick){
        let html = `
                    <li class="select_lecture_row slr_${location}" id="select_lecture_row_${lecture_id}">
                        <div class="obj_table_raw">
                            <div class="cell_lecture_color">
                                <div style="background-color:${color_code}" class="lecture_color_bar">
                                </div>
                            </div>
                            <div class="cell_lecture_info">
                                <div>${lecture_name}</div>
                                <div class="lecture_additional_info">정원: ${max_member_num} 명 / 진행중  ${ing_member_num} 명</div>
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
    static select_member_row (multiple_select, checked, location, member_id, member_name, member_avail_count, member_expiry, member_fix_state_cd, disable_zero_avail_count, onclick){
        let fix_member_check = '';
        if(member_fix_state_cd==FIX){
            fix_member_check = '고정회원';
        }
        let html = `
                    <li class="select_member_row smr_${location}" id="select_member_row_${member_id}" ${disable_zero_avail_count == ON && member_avail_count == 0? "style='opacity:0.6;'": ""}>
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
                if(disable_zero_avail_count == ON && member_avail_count == 0){
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
                if(disable_zero_avail_count == ON && member_avail_count == 0){
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
                            <div class="cell_schedule_attend">${attend_status}</div>
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
    static ticket_history_row (numbering, ticket_id, date, ticket_name, reg_count, remain_count, avail_count, status, onclick){
        let html = `<li class="ticket_history_row" id="ticket_history_row_${ticket_id}">
                        <div class="obj_table_raw table_basic_info">
                            <div class="cell_ticket_num">${numbering}</div>
                            <div class="cell_ticket_info">${ticket_name}</div>
                            <div class="cell_ticket_attend">${status}</div>
                        </div>
                        <div class="obj_table_raw table_date_info">
                            <div class="cell_ticket_num"></div>
                            <div class="cell_ticket_info">${date}</div>
                        </div>
                        <div class="obj_table_raw table_memo_info">
                            <div class="cell_ticket_num"></div>
                            <div class="cell_ticket_info">등록 ${reg_count} 회 / 출석완료 ${reg_count-avail_count} / 예약가능 ${avail_count}</div>
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
            e.stopPropagation();
            onclick();
        });
        return html;
    }
    //텍스트만 있는 버튼
    static text_button (id, title, style, onclick){
        let style_code = CComponent.data_to_style_code(style);
        let html = `<span id="text_button_${id}" style="cursor:pointer;padding:3px 0;${style_code}">${title}</span>`;
        
        $(document).off('click', `#text_button_${id}`).on('click', `#text_button_${id}`, function(e){
            e.stopPropagation();
            onclick();
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
                        <img src="${url}" style="width:24px;height:24px;vertical-align:middle;margin-bottom:4px;margin-right:5px;${url == DELETE ? 'display:none': ''}">
                        <span style="line-height:40px;">${title}</span>
                    </div>`;
        
        $(document).off('click', `#icon_button_${id}`).on('click', `#icon_button_${id}`, function(e){
            e.stopPropagation();
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
            e.stopPropagation();
            onclick();
        });
        return html;
    }

    static toggle_button (id, power, style, onclick){
        let html = `<div id="toggle_button_${id}" style="${CComponent.data_to_style_code(style)}" class="toggle_button ${power == ON ? 'toggle_button_active': ''}">
                        <div class="toggle_button_ball ${power == ON ? 'toggle_button_ball_active':''}"></div>
                    </div>`;
        
        $(document).off('click', `#toggle_button_${id}`).on('click', `#toggle_button_${id}`, function(e){
            e.stopPropagation();
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
    let limit_reg_pattern = event.pattern.replace('[', '[^').split('{')[0];
    let limit = new RegExp(limit_reg_pattern, "gi");
    let min_length = event.minLength;
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
    let limit_reg_pattern = event.pattern.replace('[', '[^').split('{')[0];
    let limit = new RegExp(limit_reg_pattern, "gi");
    let limit_char_check = false;
    let min_length = event.minLength;
    let event_id = event.id;
    let title = event.attributes['title'].value;
    let confirm_id = event_id+'_confirm';
    let default_confirm_id = event_id+'_default_confirm';
    if(event.value.length < Number(min_length)){
        event.attributes['data-error-message'].value = title+' : 최소 '+min_length+'자 이상 입력해야합니다.';
        // $(`#${confirm_id}`).text('최소 '+min_length+'자 이상 입력');
        // $(`#${default_confirm_id}`).css('color', 'black');
        event.attributes['data-valid'].value = 'false';
    }
    else{
        $(`#${confirm_id}`).text('');
        if(limit.test(event.value)){
            event.attributes['data-error-message'].value = title+' : '+event.attributes['data-pattern-message'].value + ' 합니다.';
            // $(`#${default_confirm_id}`).css('color', '#fe4e65');
            event.attributes['data-valid'].value = 'false';
        }else{
            event.attributes['data-error-message'].value = '';
            // $(`#${default_confirm_id}`).css('color', 'green');
            event.attributes['data-valid'].value = 'true';
        }
    }

    console.log(limit_char_check);

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
    }
}

function check_registration_form(forms){
    // form 안에 있는 값 검사
    let inputs = forms.elements;
    let error_info = '';

    for(let i=0; i<inputs.length; i++){
        if (inputs[i].nodeName === "INPUT" && (inputs[i].type === "text" || inputs[i].type === "tel")) {
            // Update text input
            console.log(inputs[i].getAttribute('title')+':'+inputs[i].getAttribute('data-valid'));
            if((inputs[i].value !=  '' || inputs[i].required) && inputs[i].getAttribute('data-valid') == 'false'){
                error_info = inputs[i].getAttribute('data-error-message');
                break;
            }
        }
    }
    return error_info;
}
