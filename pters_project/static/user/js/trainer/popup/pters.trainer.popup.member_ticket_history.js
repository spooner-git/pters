class Member_ticket_history{
    constructor(install_target, member_id, callback){
        this.target = {install : install_target};
        this.member_id = member_id;
        this.callback = callback;
        this.received_data;
        this.data = null;
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
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();member_ticket_history.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="">수강권 이력</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="member_ticket_history.upper_right_menu()">재등록</span></span>`;
        let content =   `<section style="margin-top:8px;">${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list(){

        let html_to_join = [];
        let html;

        let numbering = 0;
        let member_ticket_list = [];
        for(let ticket in this.received_data){
            member_ticket_list.push(this.received_data[ticket]);
        }
        member_ticket_list.sort(function(a, b){
            return a.member_ticket_start_date < b.member_ticket_start_date ? -1 : a.member_ticket_start_date > b.member_ticket_start_date ? 1 : 0;
        });
        for(let i=0; i<member_ticket_list.length; i++){
            numbering++;
            let data = member_ticket_list[i];
            let ticket_id = data.member_ticket_ticket_id;
            let ticket_name = data.member_ticket_name;
            let reg_count = data.member_ticket_reg_count;
            let remain_count = data.member_ticket_rem_count;
            let avail_count = data.member_ticket_avail_count;
            let status = TICKET_STATUS[data.member_ticket_state_cd];
            let date_diff = DateRobot.diff_date(data.member_ticket_end_date, data.member_ticket_start_date);
            let date = DateRobot.to_text(data.member_ticket_start_date, '', '', SHORT) + ' - ' + DateRobot.to_text(data.member_ticket_end_date, '', '', SHORT) + ' ('+date_diff+'일)';
            let onclick = ()=>{
                let user_option = {
                    status:{text:"상태 변경", callback:()=>{
                        this.ticket_status_change_option(ticket_id, data.member_ticket_state_cd);
                    }},
                    start_date:{text:"시작 날짜 변경", callback:()=>{
                        this.ticket_start_date_change_selector(ticket_id, data.member_ticket_start_date);
                    }},
                    end_date:{text:"종료 날짜 변경", callback:()=>{
                        this.ticket_end_date_change_selector(ticket_id, data.member_ticket_end_date);
                    }},
                    reg_count:{text:"등록 횟수 변경", callback:()=>{
                        
                    }}
                };
                let options_padding_top_bottom = 16;
                let button_height = 8 + 8 + 52;
                let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                    option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                });
            };

            html = CComponent.ticket_history_row (numbering, ticket_id, date, ticket_name, reg_count, remain_count, avail_count, status, onclick);

            html_to_join.push(html);

        }
        return html_to_join.reverse().join('');
    }

    request_list (callback){
        let send_data = {"member_id": this.member_id};
        Member_func.read_ticket_list(send_data, (data)=>{
            this.received_data = data;
            callback();
        });
    }

    upper_right_menu(){
        let member_add_initial_data = {member_id: this.member_id};
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_ADD, 100, POPUP_FROM_BOTTOM, null, ()=>{
            member_add_popup = new Member_add('.popup_member_add', member_add_initial_data, 'member_add_popup');});
        if(this.callback != null){
            this.callback(this.data);
        }
        // layer_popup.close_layer_popup();
        // this.clear();
    }

    ticket_status_change_option(ticket_id, status){
        let title = "상태 변경";
        let install_target = "#wrapper_box_custom_select";
        let multiple_select = 1;
        let data = {value:["resume"], text:["재개"]};
        if(status == "IP"){
            data = {value:["complete", "refund"], text:["강제 종료", "환불"]};
        }
        let selected_data = {value:[], text:[]};
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
            custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                layer_popup.close_layer_popup();
                Member_func.ticket_status({"member_ticket_id":ticket_id, "state_cd":set_data.value[0]}, ()=>{
                    this.init();
                });
            });
        });
    }

    ticket_start_date_change_selector(ticket_id, start_date){
        let init_date = {year: start_date.split('-')[0], month: start_date.split('-')[1], date: start_date.split('-')[2]};
        layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
            date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'dateselector', title:'날짜 선택', data:init_date, callback_when_set: (selected_data)=>{
                let date = DateRobot.to_yyyymmdd(selected_data.data.year, selected_data.data.month, selected_data.data.date);
                let data = {"member_ticket_id":ticket_id, "note":"", "start_date":date, "end_date":"", "price":"", "refund_price":"", "refund_date":"", "member_ticket_reg_count":""};
                console.log(data)
                Member_func.ticket_update(data, ()=>{
                    this.init();
                });
                layer_popup.close_layer_popup();
            }});
        });
    }

    ticket_end_date_change_selector(ticket_id, end_date){
        let init_date = {year: end_date.split('-')[0], month: end_date.split('-')[1], date:end_date.split('-'[2])};
        layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
            date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'dateselector', title:'날짜 선택', data:init_date, callback_when_set: (selected_data)=>{
                let date = DateRobot.to_yyyymmdd(selected_data.data.year, selected_data.data.month, selected_data.data.date);
                let data = {"member_ticket_id":ticket_id, "note":"", "start_date":"", "end_date":date, "price":"", "refund_price":"", "refund_date":"", "member_ticket_reg_count":""};
                Member_func.ticket_update(data, ()=>{
                    this.init();
                });
                layer_popup.close_layer_popup();
            }});
        });
    }

    ticket_reg_count_change_input(ticket_id){
        let data = {"member_ticket_id":ticket_id, "note":"", "start_date":"", "end_date":date, "price":"", "refund_price":"", "refund_date":"", "member_ticket_reg_count":""};

        Member_func.ticket_update(data, ()=>{
            this.init();
        });
    }
}






