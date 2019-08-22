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
        let top_left = `<img src="/static/common/icon/navigate_before_black.png" onclick="layer_popup.close_layer_popup();member_ticket_history.clear();" class="obj_icon_prev">`;
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

            html = CComponent.ticket_history_row (numbering, ticket_id, date, ticket_name, reg_count, remain_count, avail_count, status);

            html_to_join.push(html);

        }
        // for(let item in this.received_data){
        //     numbering++;
        //     let data = this.received_data[item];
        //     let ticket_id = data.member_ticket_ticket_id;
        //     let ticket_name = data.member_ticket_name;
        //     let reg_count = data.member_ticket_reg_count;
        //     let remain_count = data.member_ticket_rem_count;
        //     let avail_count = data.member_ticket_avail_count;
        //     let status = TICKET_STATUS[data.member_ticket_state_cd];
        //     let date_diff = DateRobot.diff_date(data.member_ticket_end_date, data.member_ticket_start_date);
        //     let date = DateRobot.to_text(data.member_ticket_start_date) + ' - ' + DateRobot.to_text(data.member_ticket_end_date) + ' ('+date_diff+'일)';
        //
        //     html = CComponent.ticket_history_row (numbering, ticket_id, date, ticket_name, reg_count, remain_count, avail_count, status);
        //
        //     html_to_join.push(html);
        // }

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
}



