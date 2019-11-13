class Member_schedule_history{
    constructor(install_target, member_id, callback){
        this.target = {install : install_target};
        this.member_id = member_id;
        this.callback = callback;
        this.received_data;
        this.data = null;
        this.sort_val = SORT_MEMBER_TICKET;
        this.init();

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
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();member_schedule_history.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="">일정 이력</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section style="margin-top:8px;">
                            ${this.dom_arrange_select()}
                            ${this.sort_val == SORT_MEMBER_TICKET ? this.dom_list() : this.dom_list_by_time()}
                        </section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_arrange_select(){
        let icon = `<img src="/static/common/icon/icon_arrow_expand_light_grey.png" style="width:24px; height:24px; vertical-align: middle;">`;
        let id = "list_arrange_select";
        let title = this.sort_val == SORT_MEMBER_TICKET ? "수강권별 정렬"+icon : "시간순 정렬"+icon;
        let style = {"color": "#858282", "font-size":"13px", "font-weight":"500"};
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
        console.log(member_ticket_list);
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

            for(let j=length-1; j>=0; j--){
                let data = member_ticket_list[i].schedule_data[j];
                let schedule_id = data.schedule_id;
                let numbering = Number(j+1) + ' 회차';
                let date =  DateRobot.to_text(data.start_dt.split(' ')[0], '', '', SHORT) +' '+ TimeRobot.to_text(data.start_dt.split(' ')[1], '', SHORT) + ' - '+
                            TimeRobot.to_text(data.end_dt.split(' ')[1], '', SHORT);
                let schedule_name = data.lecture_name;
                let attend_status = data.state_cd;
                let memo = data.note;
                html = CComponent.schedule_history_row (numbering, schedule_id, date, schedule_name, attend_status, memo, ()=>{
                    let user_option = {
                        absence:{text:"결석", callback:()=>{Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_ABSENCE}, ()=>{
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
                        attend:{text:"출석", callback:()=>{Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_FINISH}, ()=>{
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

                                                            });layer_popup.close_layer_popup();}},
                        cancel:{text:"일정 취소", callback:()=>{Plan_func.delete({"schedule_id":schedule_id}, ()=>{
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
                    let options_padding_top_bottom = 16;
                    let button_height = 8 + 8 + 52;
                    let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                    let root_content_height = $root_content.height();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                        option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                    });
                });
                html_sub_assembly_to_join.push(html);
            }
            let button_onclick = ()=>{      let $target = $(`#member_schedule_history_${i+1}_list`);
                                                if($target.attr('data-expand') == HIDE){
                                                    $target.attr('data-expand', SHOW);
                                                    $target.show();
                                                }else{
                                                    $target.attr('data-expand', HIDE);
                                                    $target.hide();
                                                }
                                      };
            expand_button = CComponent.text_button(i+1, '접기/펼치기', {"float":"right", "font-size":"12px", "color":"#858282", "font-weight":"500"}, ()=>{button_onclick();});
            expand_status = SHOW;
            expand_style = "block";

            let html_sub_assembly = ` <div id="member_schedule_history_${i+1}">
                                        <div id="member_schedule_history_ticket_${i+1}" style="padding:15px 10px;background-color:#f5f2f3;font-size:14px;font-weight:bold;">
                                            <div>${ticket_name} <span style="color:${TICKET_STATUS_COLOR[ticket_status]};font-size:12px;font-weight:500">(${TICKET_STATUS[ticket_status]})</span> <span style="float:right;">${expand_button}</span></div>
                                            <div style="font-size:12px;color:#3b3b3b;font-weight:500;">
                                                등록 <span style="font-weight:bold;">${ticket_reg_count}</span>회 / 
                                                잔여 <span style="font-weight:bold;">${ticket_rem_count}</span>회 / 
                                                예약가능 <span style="font-weight:bold;">${ticket_avail_count}</span>회</div>
                                            <div style="font-size:12px;color:#3b3b3b;font-weight:500;">${ticket_start_date} - ${ticket_end_date}</div>
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
            let data = this.received_data.member_schedule[i];
            let numbering = i+1;
            let schedule_id = data.schedule_id;
            let date =  DateRobot.to_text(data.start_dt.split(' ')[0], '', '', SHORT) +' '+ TimeRobot.to_text(data.start_dt.split(' ')[1], '', SHORT) + ' - ' +
                            TimeRobot.to_text(data.end_dt.split(' ')[1], '', SHORT);
            let schedule_name = data.lecture_name;
            let attend_status = data.state_cd;
            let memo = data.note;
            let onclick = ()=>{
                let user_option = {
                    absence:{text:"결석", callback:()=>{Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_ABSENCE}, ()=>{
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
                    attend:{text:"출석", callback:()=>{Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_FINISH}, ()=>{
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

                                                        });layer_popup.close_layer_popup();}},
                    cancel:{text:"일정 취소", callback:()=>{Plan_func.delete({"schedule_id":schedule_id}, ()=>{
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
                let options_padding_top_bottom = 16;
                let button_height = 8 + 8 + 52;
                let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                let root_content_height = $root_content.height();
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                    option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                });
            };
            let row = CComponent.schedule_history_row (numbering, schedule_id, date, schedule_name, attend_status, memo, onclick);
            html_to_join.push(row);
        }
        if(html_to_join.length == 0){
            html_to_join.push(`<div style="font-size:14px;padding:16px;">내역이 없습니다.</div>`);
        }
        return html_to_join.join("");
    }

    switch_type(){
        let user_option = {
            by_ticket:{text:"수강권별", callback:()=>{this.sort_val = SORT_MEMBER_TICKET;this.init();layer_popup.close_layer_popup();}},
            by_time:{text:"시간순", callback:()=>{this.sort_val = SORT_SCHEDULE_DT;this.init();layer_popup.close_layer_popup();}}
        };
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    request_list (callback){
        let send_data = {"member_id": this.member_id, "sort_val": this.sort_val};
        Member_func.read_schedule_list_by_ticket(send_data, (data)=>{
            this.received_data = data;
            callback();
        });
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}



