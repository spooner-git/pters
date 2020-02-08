class Member_ticket_history{
    constructor(install_target, data, callback){
        this.target = {install : install_target};
        this.member_id = data.member_id;
        this.member_name = data.member_name;
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();member_ticket_history.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>등록 이력</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
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
        for(let i=0; i<member_ticket_list.length; i++){
            numbering++;
            let data = member_ticket_list[i];
            let member_ticket_id = data.member_ticket_id;
            let ticket_name = data.member_ticket_name;
            let ticket_start_date = data.member_ticket_start_date;
            let ticket_end_date = data.member_ticket_end_date;
            let reg_count = data.member_ticket_reg_count;
            let ticket_price = data.member_ticket_price;
            let ticket_pay_method = data.member_ticket_pay_method;
            let ticket_refund_price = data.member_ticket_refund_price;
            let remain_count = data.member_ticket_rem_count;
            let avail_count = data.member_ticket_avail_count;
            let status_code = data.member_ticket_state_cd;
            let status = TICKET_STATUS[data.member_ticket_state_cd];
            let note = data.member_ticket_note;
            let refund_date = data.member_ticket_refund_date == "" || data.member_ticket_refund_date == "None" ? null : data.member_ticket_refund_date;
            let refund_price = data.member_ticket_refund_price == "" ? null : data.member_ticket_refund_price;
            let date_diff = DateRobot.diff_date(data.member_ticket_end_date, data.member_ticket_start_date) + 1;
            let date = DateRobot.to_text(data.member_ticket_start_date, '', '', SHORT) + ' - ' + DateRobot.to_text(data.member_ticket_end_date, '', '', SHORT) + ' ('+UnitRobot.numberWithCommas(date_diff)+'일)';
            if(data.member_ticket_end_date == "9999-12-31"){
                date = DateRobot.to_text(data.member_ticket_start_date, '', '', SHORT) + ' - ' + '소진 시까지';
            }
            let onclick = ()=>{
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_TICKET_MODIFY, 100, popup_style, null, ()=>{
                    let data = {"member_id":this.member_id, "member_name":this.member_name, "member_ticket_id":member_ticket_id, "member_ticket_name":ticket_name, 
                                "start_date": DateRobot.to_split(ticket_start_date), "start_date_text": DateRobot.to_text(ticket_start_date, "", "", SHORT),
                                "end_date": DateRobot.to_split(ticket_end_date), "end_date_text": ticket_end_date == "9999-12-31" ? "소진 시까지" : DateRobot.to_text(ticket_end_date, "", "", SHORT),
                                "reg_count":reg_count, "price":ticket_price, "status":status_code,
                                "refund_date":refund_date == null ? null : DateRobot.to_split(refund_date), 
                                "refund_date_text": refund_date == null? null : DateRobot.to_text(refund_date, "", "", SHORT),
                                "refund_price":refund_price, "note":note, "pay_method":ticket_pay_method};
                    member_ticket_modify = new Member_ticket_modify('.popup_member_ticket_modify', data, 'member_ticket_modify');
                });
            };

            html = CComponent.ticket_history_row (numbering, member_ticket_id, date, ticket_name, TICKET_PAY_METHOD[ticket_pay_method], UnitRobot.numberWithCommas(ticket_price), UnitRobot.numberWithCommas(ticket_refund_price), reg_count, remain_count, avail_count, status_code, note, onclick);

            html_to_join.push(html);
        }
        if(html_to_join.length == 0){
            html_to_join.push(`<div style="font-size:14px;padding:16px;">내역이 없습니다.</div>`);
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
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
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
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'dateselector', title:'날짜 선택', data:init_date, callback_when_set: (selected_data)=>{
                let date = DateRobot.to_yyyymmdd(selected_data.data.year, selected_data.data.month, selected_data.data.date);
                let data = {"member_ticket_id":ticket_id, "note":"", "start_date":date, "end_date":"", "price":"", "refund_price":"", "refund_date":"", "member_ticket_reg_count":""};
                Member_func.ticket_update(data, ()=>{
                    this.init();
                });
                layer_popup.close_layer_popup();
            }});
        });
    }

    ticket_end_date_change_selector(ticket_id, end_date){
        let init_date = {year: end_date.split('-')[0], month: end_date.split('-')[1], date:end_date.split('-'[2])};
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
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






