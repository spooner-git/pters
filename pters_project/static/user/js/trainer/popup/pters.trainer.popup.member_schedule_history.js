class Member_schedule_history{
    constructor(install_target, member_id, callback){
        this.target = {install : install_target};
        this.member_id = member_id;
        this.callback = callback;
        this.received_data;
        this.data = null;
        this.settings = {
            sign_use:OFF
        };
        this.page = 1;
        this.sort_val = SORT_SCHEDULE_DT;
        this.init();

        this.expand = null;
        this.expand_monthly = null;
    }

    init(){
        this.request_list(()=>{
            this.render();
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();member_schedule_history.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span id="">일정 이력</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content;
        if(this.sort_val == SORT_SCHEDULE_DT){
            content = `<section style="margin-top:8px;">
                            ${this.dom_arrange_select()}
                            ${this.dom_list_by_time()}
                        </section>`;
        }
        else if(this.sort_val == SORT_SCHEDULE_MONTHLY){
            content = `<section style="margin-top:8px;">
                            ${this.dom_arrange_select()}
                            ${this.dom_list_by_monthly()}
                        </section>`;
        }
        else if(this.sort_val == SORT_MEMBER_TICKET){
            content =   `<section style="margin-top:8px;">
                            ${this.dom_arrange_select()}
                            ${this.dom_list()}
                        </section>`;
        }
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_arrange_select(){
        let icon = CImg.arrow_expand(['var(--img-sub1)'], {"vertical-align":"middle"});
        let id = "list_arrange_select";
        let title = "시간순 정렬"+icon;
        if(this.sort_val == SORT_SCHEDULE_MONTHLY){
            title = "월별 정렬"+icon;
        }
        else if(this.sort_val == SORT_MEMBER_TICKET){
            title = "수강권별 정렬"+icon;
        }
        let style = {"color": "var(--font-sub-normal)", "font-size":"13px", "font-weight":"500"};
        let onclick = ()=>{
            this.switch_type();
        };
        let dom = CComponent.text_button (id, title, style, onclick);

        let html = `<div style="text-align:right;padding:5px 10px 10px 10px;">
                        ${dom}
                    </div>`;

        return html;
    }

    dom_list(){
        let html_to_join = [];
        let html;

        let item_length = Object.keys(this.received_data).length;

        let member_ticket_list = [];
        for(let ticket in this.received_data){
            member_ticket_list.push(this.received_data[ticket]);
        }
        member_ticket_list.sort(function(a, b){
            let return_val = 0;
            if(a.member_ticket_start_date < b.member_ticket_start_date){
              return_val = -1;
            }
            else if(a.member_ticket_start_date > b.member_ticket_start_date){
                return_val = 1;
            }
            else{
                if(a.member_ticket_end_date < b.member_ticket_end_date) {
                    return_val = -1;
                }
                else if(a.member_ticket_end_date > b.member_ticket_end_date){
                    return_val = 1;
                }
                else{
                    if(a.member_ticket_reg_dt < b.member_ticket_reg_dt) {
                        return_val = -1;
                    }
                    else if(a.member_ticket_reg_dt > b.member_ticket_reg_dt) {
                        return_val = 1;
                    }
                }
            }
            return return_val;
        });

        if(this.expand == null){
            this.expand = {};
            for(let i=member_ticket_list.length-1; i>=0; i--){
                this.expand[i+1] = SHOW;
            }
        }

        for(let i=member_ticket_list.length-1; i>=0; i--){
            let length = member_ticket_list[i].schedule_data.length;
            let html_sub_assembly_to_join = [];
            let expand_button;
            let expand_status;
            let expand_style;
            let ticket_name = member_ticket_list[i].member_ticket_name;
            let ticket_reg_count = member_ticket_list[i].member_ticket_reg_count;
            let ticket_rem_count = member_ticket_list[i].member_ticket_rem_count;
            let ticket_avail_count = member_ticket_list[i].member_ticket_avail_count;
            let ticket_status = member_ticket_list[i].member_ticket_state_cd;
            let ticket_start_date = DateRobot.to_text(member_ticket_list[i].member_ticket_start_date.split('-')[0],
                                                        member_ticket_list[i].member_ticket_start_date.split('-')[1],
                                                        member_ticket_list[i].member_ticket_start_date.split('-')[2],
                                                        SHORT);
            let ticket_end_date =  DateRobot.to_text(member_ticket_list[i].member_ticket_end_date.split('-')[0],
                                                        member_ticket_list[i].member_ticket_end_date.split('-')[1],
                                                        member_ticket_list[i].member_ticket_end_date.split('-')[2],
                                                        SHORT);
            if(member_ticket_list[i].member_ticket_end_date == "9999-12-31"){
                ticket_end_date = "소진 시까지";
            }

            for(let j=length-1; j>=0; j--){
                let data = member_ticket_list[i].schedule_data[j];
                let schedule_id = data.schedule_id;
                let numbering = Number(j+1) + ' 회차';
                let date =  DateRobot.to_text(data.start_dt.split(' ')[0], '', '', SHORT) +' '+ TimeRobot.to_text(data.start_dt.split(' ')[1], '', SHORT) + ' - '+
                            TimeRobot.to_text(data.end_dt.split(' ')[1], '', SHORT);
                let schedule_name = data.lecture_name;
                let attend_status = data.state_cd;
                let permission_status = data.permission_state_cd;
                let memo = data.note;
                let daily_record_id = data.daily_record_id;
                html = CComponent.schedule_history_row (numbering, schedule_id, date, schedule_name, attend_status, permission_status, memo, daily_record_id, this.settings.sign_use, ()=>{
                    let user_option = {
                        daily_record:{text:"일지", callback:()=>{
                            let inspect = pass_inspector.schedule_update();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            layer_popup.close_layer_popup();
                            Plan_daily_record_func.write_artice(schedule_id, schedule_name, ()=>{
                                this.init();
                                // show_error_message({title:`[${schedule_name}] 일지 변경사항이 저장 되었습니다.`});
                            }, ()=>{
                                show_error_message({title:`<span style="color:var(--font-highlight)">일지 변경사항 저장에 실패 하였습니다.</span>`});
                            });
                        }},
                        absence:{text:"결석", callback:()=>{
                            let inspect = pass_inspector.schedule_update();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_ABSENCE}, ()=>{
                                this.init();
                                try{
                                    member_view_popup.init();
                                }catch(e){}
                                try{
                                    plan_view_popup.init();
                                }catch(e){}
                                try{
                                    current_page.init();
                                }catch(e){}

                            });
                            layer_popup.close_layer_popup();}},
                        attend:{text:"출석", callback:()=>{
                            let inspect = pass_inspector.schedule_update();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            if(this.settings.sign_use == ON){
                                this.open_drawing_board((image)=>{ //출석시 사인 입력 옵션 활성화시
                                    let send_data = {"schedule_id":schedule_id, "state_cd":SCHEDULE_FINISH, "upload_file":image};
                                    Plan_func.status(send_data, ()=>{
                                        Plan_func.upload_sign(send_data, ()=>{
                                            this.init();
                                            try{
                                                member_view_popup.init();
                                            }catch(e){}
                                            try{
                                                plan_view_popup.init();
                                            }catch(e){}
                                            try{
                                                current_page.init();
                                            }catch(e){}
                                        });
                                    });
                                    layer_popup.close_layer_popup();
                                });
                            }else{
                                Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_FINISH}, ()=>{
                                    this.init();
                                    try{
                                        member_view_popup.init();
                                    }catch(e){}
                                    try{
                                        plan_view_popup.init();
                                    }catch(e){}
                                    try{
                                        current_page.init();
                                    }catch(e){}

                                });layer_popup.close_layer_popup();
                            }
                        }},
                        permission_approve:{text:"예약 확정", callback:()=>{
                            layer_popup.close_layer_popup();
                            let confirm_message = {title:"예약 상태 변경", comment:"<span style='color:var(--font-highlight);'>예약 확정 하시겠습니까?</span>"};
                            show_user_confirm (confirm_message, ()=>{
                                layer_popup.close_layer_popup();
                                let inspect = pass_inspector.schedule_update();
                                if(inspect.barrier == BLOCKED){
                                    let message = `${inspect.limit_type}`;
                                    // layer_popup.close_layer_popup();
                                    show_error_message({title:message});
                                    return false;
                                }
                                let send_data = {"schedule_id":schedule_id, "permission_state_cd":SCHEDULE_APPROVE};
                                Plan_func.permission_status(send_data, ()=>{
                                    this.init();
                                    try{
                                        member_view_popup.init();
                                    }catch(e){}
                                    try{
                                        plan_view_popup.init();
                                    }catch(e){}
                                    try{
                                        current_page.init();
                                    }catch(e){}
                                });
                            });
                        }},
                        permission_wait:{text:"대기 예약", callback:()=>{
                            layer_popup.close_layer_popup();
                            let confirm_message = {title:"예약 상태 변경", comment:"<span style='color:var(--font-highlight);'>대기 예약으로 변경 하시겠습니까?</span>"};
                            show_user_confirm (confirm_message, ()=>{
                                layer_popup.close_layer_popup();
                                let inspect = pass_inspector.schedule_update();
                                if(inspect.barrier == BLOCKED){
                                    let message = `${inspect.limit_type}`;
                                    // layer_popup.close_layer_popup();
                                    show_error_message({title:message});
                                    return false;
                                }
                                let send_data = {"schedule_id":schedule_id, "permission_state_cd":SCHEDULE_WAIT};
                                Plan_func.permission_status(send_data, ()=>{
                                    this.init();
                                    try{
                                        member_view_popup.init();
                                    }catch(e){}
                                    try{
                                        plan_view_popup.init();
                                    }catch(e){}
                                    try{
                                        current_page.init();
                                    }catch(e){}
                                });
                            });
                        }},
                        cancel:{text:"일정 취소", callback:()=>{
                            let inspect = pass_inspector.schedule_delete();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            Plan_func.delete({"schedule_id":schedule_id}, ()=>{
                                this.init();
                                try{
                                    member_view_popup.init();
                                }catch(e){}
                                try{
                                    plan_view_popup.init();
                                }catch(e){}
                                try{
                                    current_page.init();
                                }catch(e){}
                            });layer_popup.close_layer_popup();}}
                    };
                    if(permission_status == SCHEDULE_APPROVE){
                        delete user_option.permission_approve;
                    }
                    if(permission_status == SCHEDULE_WAIT){
                        delete user_option.permission_wait;
                    }
                    if(attend_status == SCHEDULE_FINISH || attend_status == SCHEDULE_ABSENCE){
                        delete user_option.permission_wait;
                    }
                    let options_padding_top_bottom = 16;
                    // let button_height = 8 + 8 + 52;
                    let button_height = 52;
                    let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                    let root_content_height = $root_content.height();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                        option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                    });
                });
                html_sub_assembly_to_join.push(html);
            }

            let button_onclick = ()=>{   
                                        if(this.expand[i+1] == SHOW){
                                            this.expand[i+1] = HIDE;
                                            this.render();
                                        }else if(this.expand[i+1] == HIDE){
                                            this.expand[i+1] = SHOW;
                                            this.render();
                                        }
                                      };
            let button_title = this.expand[i+1] == SHOW
                ? "접기" + CImg.arrow_expand(["var(--img-sub1)"], {"transform":"rotate(180deg)", "width":"17px", "vertical-align":"middle", "margin-bottom":"2px"}) 
                : "펼치기" + CImg.arrow_expand(["var(--img-sub1)"], {"width":"17px", "vertical-align":"middle", "margin-bottom":"2px"});
            expand_button = CComponent.text_button(i+1, button_title, {"float":"right", "font-size":"12px", "color":"var(--font-sub-normal)", "font-weight":"500"}, ()=>{button_onclick();});
            expand_style = this.expand[i+1] == SHOW ? "block" : "none";

            let html_sub_assembly = ` <div id="member_schedule_history_${i+1}">
                                        <div id="member_schedule_history_ticket_${i+1}" style="padding:15px 10px;background-color:var(--bg-light);font-size:14px;font-weight:bold;">
                                            <div>${ticket_name} <span style="color:${TICKET_STATUS_COLOR[ticket_status]};font-size:12px;font-weight:500">(${TICKET_STATUS[ticket_status]})</span> <span style="float:right;">${expand_button}</span></div>
                                            <div style="font-size:12px;color:var(--font-main);font-weight:500;">
                                                등록 <span style="font-weight:bold;">${ticket_reg_count >= 99999 ? "무제한" : ticket_reg_count + '회'}</span> / 
                                                잔여 <span style="font-weight:bold;">${ticket_reg_count >= 99999 ? "무제한" : ticket_rem_count + '회'}</span> / 
                                                예약가능 <span style="font-weight:bold;">${ticket_reg_count >= 99999 ? "무제한" : ticket_avail_count + '회'}</span></div>
                                            <div style="font-size:12px;color:var(--font-main);font-weight:500;">${ticket_start_date} - ${ticket_end_date}</div>
                                        </div>
                                        <div id="member_schedule_history_${i+1}_list" data-expand="${expand_status}" style="display:${expand_style};">
                                            ${html_sub_assembly_to_join.join('')}
                                        </div>
                                     </div>`;
            html_to_join.push(html_sub_assembly);
        }

        if(member_ticket_list.length == 0){
            html_to_join.push(`<div style="font-size:14px;padding:16px;">내역이 없습니다.</div>`);
        }
        
        return html_to_join.join('');
    }

    dom_list_by_time(){
        let length = this.received_data.member_schedule.length;
        let html_to_join = [];
        for(let i=length-1; i>=0; i--){
        // for(let i=0; i<length; i++){
            let data = this.received_data.member_schedule[i];
            // let numbering = data.schedule_idx + ' 회차';
            let numbering = Number(i+1) + ' 회차';
            let schedule_id = data.schedule_id;
            let date =  DateRobot.to_text(data.start_dt.split(' ')[0], '', '', SHORT) +' '+ TimeRobot.to_text(data.start_dt.split(' ')[1], '', SHORT) + ' - ' +
                            TimeRobot.to_text(data.end_dt.split(' ')[1], '', SHORT);
            let schedule_name = data.lecture_name;
            let attend_status = data.state_cd;
            let permission_status = data.permission_state_cd;
            let memo = data.note;
            let daily_record_id = data.daily_record_id;
            let onclick = ()=>{
                let user_option = {
                    daily_record:{text:"일지", callback:()=>{
                        let inspect = pass_inspector.schedule_update();
                        if(inspect.barrier == BLOCKED){
                            let message = `${inspect.limit_type}`;
                            // layer_popup.close_layer_popup();
                            show_error_message({title:message});
                            return false;
                        }
                        layer_popup.close_layer_popup();
                        Plan_daily_record_func.write_artice(schedule_id, schedule_name, ()=>{
                            this.init();
                            // show_error_message({title:`[${schedule_name}] 일지 변경사항이 저장 되었습니다.`});
                        }, ()=>{
                            show_error_message({title:`<span style="color:var(--font-highlight)">일지 변경사항 저장에 실패 하였습니다.</span>`});
                        });
                    }},
                    absence:{text:"결석", callback:()=>{

                        let inspect = pass_inspector.schedule_update();
                        if(inspect.barrier == BLOCKED){
                            let message = `${inspect.limit_type}`;
                            // layer_popup.close_layer_popup();
                            show_error_message({title:message});
                            return false;
                        }
                        Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_ABSENCE}, ()=>{
                            this.init();
                            try{
                                member_view_popup.init();
                            }catch(e){}
                            try{
                                plan_view_popup.init();
                            }catch(e){}
                            try{
                                current_page.init();
                            }catch(e){}

                        });
                        layer_popup.close_layer_popup();}},
                    attend:{text:"출석", callback:()=>{

                            let inspect = pass_inspector.schedule_update();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            if(this.settings.sign_use == ON){
                                this.open_drawing_board((image)=>{ //출석시 사인 입력 옵션 활성화시
                                    let send_data = {"schedule_id":schedule_id, "state_cd":SCHEDULE_FINISH, "upload_file":image};
                                    Plan_func.status(send_data, ()=>{
                                        Plan_func.upload_sign(send_data, ()=>{
                                            this.init();
                                            try{
                                                member_view_popup.init();
                                            }catch(e){}
                                            try{
                                                plan_view_popup.init();
                                            }catch(e){}
                                            try{
                                                current_page.init();
                                            }catch(e){}
                                        });
                                    });
                                    layer_popup.close_layer_popup();
                                });
                            }else{
                                Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_FINISH}, ()=>{
                                    this.init();
                                    try{
                                        member_view_popup.init();
                                    }catch(e){}
                                    try{
                                        plan_view_popup.init();
                                    }catch(e){}
                                    try{
                                        current_page.init();
                                    }catch(e){}

                                });layer_popup.close_layer_popup();
                            }
                        }},
                    permission_approve:{text:"예약 확정", callback:()=>{
                        layer_popup.close_layer_popup();
                        let confirm_message = {title:"예약 상태 변경", comment:"<span style='color:var(--font-highlight);'>예약 확정 하시겠습니까?</span>"};
                        show_user_confirm (confirm_message, ()=>{
                            layer_popup.close_layer_popup();
                            let inspect = pass_inspector.schedule_update();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            let send_data = {"schedule_id":schedule_id, "permission_state_cd":SCHEDULE_APPROVE};
                            Plan_func.permission_status(send_data, ()=>{
                                this.init();
                                try{
                                    member_view_popup.init();
                                }catch(e){}
                                try{
                                    plan_view_popup.init();
                                }catch(e){}
                                try{
                                    current_page.init();
                                }catch(e){}
                            });
                        });
                    }},
                    permission_wait:{text:"대기 예약", callback:()=>{
                        layer_popup.close_layer_popup();
                        let confirm_message = {title:"예약 상태 변경", comment:"<span style='color:var(--font-highlight);'>대기 예약으로 변경 하시겠습니까?</span>"};
                        show_user_confirm (confirm_message, ()=>{
                            layer_popup.close_layer_popup();
                            let inspect = pass_inspector.schedule_update();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            let send_data = {"schedule_id":schedule_id, "permission_state_cd":SCHEDULE_WAIT};
                            Plan_func.permission_status(send_data, ()=>{
                                this.init();
                                try{
                                    member_view_popup.init();
                                }catch(e){}
                                try{
                                    plan_view_popup.init();
                                }catch(e){}
                                try{
                                    current_page.init();
                                }catch(e){}
                            });
                        });
                    }},
                    cancel:{text:"일정 취소", callback:()=>{

                        let inspect = pass_inspector.schedule_delete();
                        if(inspect.barrier == BLOCKED){
                            let message = `${inspect.limit_type}`;
                            // layer_popup.close_layer_popup();
                            show_error_message({title:message});
                            return false;
                        }
                        Plan_func.delete({"schedule_id":schedule_id}, ()=>{
                            this.init();
                            try{
                                member_view_popup.init();
                            }catch(e){}
                            try{
                                plan_view_popup.init();
                            }catch(e){}
                            try{
                                current_page.init();
                            }catch(e){}

                        });layer_popup.close_layer_popup();}}
                };
                if(permission_status == SCHEDULE_APPROVE){
                    delete user_option.permission_approve;
                }
                if(permission_status == SCHEDULE_WAIT){
                    delete user_option.permission_wait;
                }
                if(attend_status == SCHEDULE_FINISH || attend_status == SCHEDULE_ABSENCE){
                    delete user_option.permission_wait;
                }
                let options_padding_top_bottom = 16;
                // let button_height = 8 + 8 + 52;
                let button_height = 52;
                let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                let root_content_height = $root_content.height();
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                    option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                });
            };
            let row = CComponent.schedule_history_row (numbering, schedule_id, date, schedule_name, attend_status, permission_status, memo, daily_record_id, this.settings.sign_use, onclick);
            html_to_join.push(row);
        }
        if(html_to_join.length == 0){
            html_to_join.push(`<div style="font-size:14px;padding:16px;">내역이 없습니다.</div>`);
        }
        return html_to_join.join("");
    }

    dom_list_by_monthly(){
        let html_to_join = [];
        let html;

        let item_length = Object.keys(this.received_data).length;

        let member_monthly_list = [];
        for(let month_num in this.received_data){

            member_monthly_list.push(this.received_data[month_num]);
        }
        member_monthly_list.sort(function(a, b){
            let return_val = 0;
            if(a.month_num < b.month_num){
              return_val = -1;
            }
            else if(a.month_num > b.month_num){
                return_val = 1;
            }
            return return_val;
        });
        if(this.expand_monthly == null){
            this.expand_monthly = {};
            for(let i=member_monthly_list.length-1; i>=0; i--){
                this.expand_monthly[i+1] = SHOW;
            }
        }
        for(let i=member_monthly_list.length-1; i>=0; i--){
            let length = member_monthly_list[i].schedule_data.length;
            let html_sub_assembly_to_join = [];
            let expand_button;
            let expand_status;
            let expand_style;
            let month_num_split = member_monthly_list[i].month_num.split('-');
            let month_num = month_num_split[0]+'년 ' + month_num_split[1] + '월 ';

            for(let j=length-1; j>=0; j--){
                let data = member_monthly_list[i].schedule_data[j];
                let schedule_id = data.schedule_id;
                let numbering = Number(j+1) + ' 회차';
                // let numbering = data.schedule_idx + ' 회차';
                let date =  DateRobot.to_text(data.start_dt.split(' ')[0], '', '', SHORT) +' '+ TimeRobot.to_text(data.start_dt.split(' ')[1], '', SHORT) + ' - '+
                            TimeRobot.to_text(data.end_dt.split(' ')[1], '', SHORT);
                let schedule_name = data.lecture_name;
                let attend_status = data.state_cd;
                let permission_status = data.permission_state_cd;
                let memo = data.note;
                let daily_record_id = data.daily_record_id;
                html = CComponent.schedule_history_row (numbering, schedule_id, date, schedule_name, attend_status, permission_status, memo, daily_record_id, this.settings.sign_use, ()=>{
                    let user_option = {
                        daily_record:{text:"일지", callback:()=>{
                            let inspect = pass_inspector.schedule_update();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            layer_popup.close_layer_popup();
                            Plan_daily_record_func.write_artice(schedule_id, schedule_name, ()=>{
                                this.init();
                                // show_error_message({title:`[${schedule_name}] 일지 변경사항이 저장 되었습니다.`});
                            }, ()=>{
                                show_error_message({title:`<span style="color:var(--font-highlight)">일지 변경사항 저장에 실패 하였습니다.</span>`});
                            });
                        }},
                        absence:{text:"결석", callback:()=>{

                            let inspect = pass_inspector.schedule_update();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_ABSENCE}, ()=>{
                                this.init();
                                try{
                                    member_view_popup.init();
                                }catch(e){}
                                try{
                                    plan_view_popup.init();
                                }catch(e){}
                                try{
                                    current_page.init();
                                }catch(e){}

                            });
                            layer_popup.close_layer_popup();}},
                        attend:{text:"출석", callback:()=>{

                            let inspect = pass_inspector.schedule_update();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            if(this.settings.sign_use == ON){
                                this.open_drawing_board((image)=>{ //출석시 사인 입력 옵션 활성화시
                                    let send_data = {"schedule_id":schedule_id, "state_cd":SCHEDULE_FINISH, "upload_file":image};
                                    Plan_func.status(send_data, ()=>{
                                        Plan_func.upload_sign(send_data, ()=>{
                                            this.init();
                                            try{
                                                member_view_popup.init();
                                            }catch(e){}
                                            try{
                                                plan_view_popup.init();
                                            }catch(e){}
                                            try{
                                                current_page.init();
                                            }catch(e){}
                                        });
                                    });
                                    layer_popup.close_layer_popup();
                                });
                            }else{
                                Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_FINISH}, ()=>{
                                    this.init();
                                    try{
                                        member_view_popup.init();
                                    }catch(e){}
                                    try{
                                        plan_view_popup.init();
                                    }catch(e){}
                                    try{
                                        current_page.init();
                                    }catch(e){}

                                });layer_popup.close_layer_popup();
                            }
                        }},
                        permission_approve:{text:"예약 확정", callback:()=>{
                            layer_popup.close_layer_popup();
                            let confirm_message = {title:"예약 상태 변경", comment:"<span style='color:var(--font-highlight);'>예약 확정 하시겠습니까?</span>"};
                            show_user_confirm (confirm_message, ()=>{
                                layer_popup.close_layer_popup();
                                let inspect = pass_inspector.schedule_update();
                                if(inspect.barrier == BLOCKED){
                                    let message = `${inspect.limit_type}`;
                                    // layer_popup.close_layer_popup();
                                    show_error_message({title:message});
                                    return false;
                                }
                                let send_data = {"schedule_id":schedule_id, "permission_state_cd":SCHEDULE_APPROVE};
                                Plan_func.permission_status(send_data, ()=>{
                                    this.init();
                                    try{
                                        member_view_popup.init();
                                    }catch(e){}
                                    try{
                                        plan_view_popup.init();
                                    }catch(e){}
                                    try{
                                        current_page.init();
                                    }catch(e){}
                                });
                            });
                        }},
                        permission_wait:{text:"대기 예약", callback:()=>{
                            layer_popup.close_layer_popup();
                            let confirm_message = {title:"예약 상태 변경", comment:"<span style='color:var(--font-highlight);'>대기 예약로 변경 하시겠습니까?</span>"};
                            show_user_confirm (confirm_message, ()=>{
                                layer_popup.close_layer_popup();
                                let inspect = pass_inspector.schedule_update();
                                if(inspect.barrier == BLOCKED){
                                    let message = `${inspect.limit_type}`;
                                    // layer_popup.close_layer_popup();
                                    show_error_message({title:message});
                                    return false;
                                }
                                let send_data = {"schedule_id":schedule_id, "permission_state_cd":SCHEDULE_WAIT};
                                Plan_func.permission_status(send_data, ()=>{
                                    this.init();
                                    try{
                                        member_view_popup.init();
                                    }catch(e){}
                                    try{
                                        plan_view_popup.init();
                                    }catch(e){}
                                    try{
                                        current_page.init();
                                    }catch(e){}
                                });
                            });
                        }},
                        cancel:{text:"일정 취소", callback:()=>{

                            let inspect = pass_inspector.schedule_delete();
                            if(inspect.barrier == BLOCKED){
                                let message = `${inspect.limit_type}`;
                                // layer_popup.close_layer_popup();
                                show_error_message({title:message});
                                return false;
                            }
                            Plan_func.delete({"schedule_id":schedule_id}, ()=>{
                            this.init();
                            try{
                                member_view_popup.init();
                            }catch(e){}
                            try{
                                plan_view_popup.init();
                            }catch(e){}
                            try{
                                current_page.init();
                            }catch(e){}

                        });layer_popup.close_layer_popup();}}
                    };
                    if(permission_status == SCHEDULE_APPROVE){
                        delete user_option.permission_approve;
                    }
                    if(permission_status == SCHEDULE_WAIT){
                        delete user_option.permission_wait;
                    }
                    if(attend_status == SCHEDULE_FINISH || attend_status == SCHEDULE_ABSENCE){
                        delete user_option.permission_wait;
                    }
                    let options_padding_top_bottom = 16;
                    // let button_height = 8 + 8 + 52;
                    let button_height = 52;
                    let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                    let root_content_height = $root_content.height();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                        option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                    });
                });
                html_sub_assembly_to_join.push(html);
            }

            let button_onclick = ()=>{
                                        if(this.expand_monthly[i+1] == SHOW){
                                            this.expand_monthly[i+1] = HIDE;
                                            this.render();
                                        }else if(this.expand_monthly[i+1] == HIDE){
                                            this.expand_monthly[i+1] = SHOW;
                                            this.render();
                                        }
                                      };
            let button_title = this.expand_monthly[i+1] == SHOW
                ? "접기" + CImg.arrow_expand(["var(--img-sub1)"], {"transform":"rotate(180deg)", "width":"17px", "vertical-align":"middle", "margin-bottom":"2px"})
                : "펼치기" + CImg.arrow_expand(["var(--img-sub1)"], {"width":"17px", "vertical-align":"middle", "margin-bottom":"2px"});
            expand_button = CComponent.text_button(i+1, button_title, {"float":"right", "font-size":"12px", "color":"var(--font-sub-normal)", "font-weight":"500"}, ()=>{button_onclick();});
            expand_style = this.expand_monthly[i+1] == SHOW ? "block" : "none";

            let html_sub_assembly = ` <div id="member_schedule_history_month_${i+1}">
                                        <div id="member_schedule_history_monthly_${i+1}" style="padding:15px 10px;background-color:var(--bg-light);font-size:14px;font-weight:bold;">
                                            <div>${month_num} <span style="float:right;">${expand_button}</span></div>
                                            
                                        </div>
                                        <div id="member_schedule_history_month_${i+1}_list" data-expand="${expand_status}" style="display:${expand_style};">
                                            ${html_sub_assembly_to_join.join('')}
                                        </div>
                                     </div>`;
            html_to_join.push(html_sub_assembly);
        }

        if(member_monthly_list.length == 0){
            html_to_join.push(`<div style="font-size:14px;padding:16px;">내역이 없습니다.</div>`);
        }

        return html_to_join.join('');
    }

    open_drawing_board(callback){
        //사인창 열기
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_DRAWING_BOARD, 100*315/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            let data = {    title:"일정 완료 서명",
                            description:"완료 서명을 입력해주세요.",
                            width: $root_content.width() <= 500 ? $root_content.width() : 500,
                            height:250,
                            color:{pencil:"#ffffff", paper:"#282828"},
                            border:0,
                            callback:(data)=>{
                                callback(data);
                            }
                        };
            drawing_board = new DrawingBoard('#wrapper_box_drawing_board', "drawing_board", data);
        });
    }

    switch_type(){
        let user_option = {
            by_time:{text:"시간순 정렬", callback:()=>{this.sort_val = SORT_SCHEDULE_DT;this.init();layer_popup.close_layer_popup();}},
            by_monthly:{text:"월별 정렬", callback:()=>{this.sort_val = SORT_SCHEDULE_MONTHLY;this.init();layer_popup.close_layer_popup();}},
            by_ticket:{text:"수강권별 정렬", callback:()=>{this.sort_val = SORT_MEMBER_TICKET;this.init();layer_popup.close_layer_popup();}}
        };
        let options_padding_top_bottom = 16;
        // let button_height = 8 + 8 + 52;
        let button_height = 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    request_list (callback){
        Setting_calendar_func.read((settings)=>{
            this.settings.sign_use = settings.setting_schedule_sign_enable;
            let send_data = {"member_id": this.member_id, "sort_val": this.sort_val, "page": this.page};
            Member_func.read_schedule_list_by_ticket(send_data, (data)=>{
                this.received_data = data;
                callback();
            });
        });
        
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}



