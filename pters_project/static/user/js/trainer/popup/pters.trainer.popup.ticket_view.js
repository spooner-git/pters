class Ticket_view{
    constructor(install_target, ticket_id, instance){
        this.target = {install: install_target, toolbox:'section_ticket_view_toolbox', content:'section_ticket_view_content'};
        this.instance = instance;
        this.ticket_id = ticket_id;

        let d = new Date();
        this.dates = {
            current_year: d.getFullYear(),
            current_month: d.getMonth()+1,
            current_date: d.getDate()
        };
        this.times = {
            current_hour: TimeRobot.to_zone(d.getHours(), d.getMinutes()).hour,
            current_minute: TimeRobot.to_zone(d.getHours(), d.getMinutes()).minute,
            current_zone: TimeRobot.to_zone(d.getHours(), d.getMinutes()).zone
        };

        this.data = {
            name:null,
            lecture_id:[],
            lecture_name:[],
            lecture_max:[],
            ticket_effective_days:null,
            count:null,
            price:null,
            memo:null,

            ticket_state_cd:null,
            ticket_day_schedule_enable:null,
            ticket_week_schedule_enable:null,

            ticket_reg_dt:null,
            ticket_mod_dt:null,

            member_id:[],
            member_name:[]
        };

        this.init();
        this.set_initial_data();
    }

    set name(text){
        this.data.name = text;
        this.render_content();
    }

    get name(){
        return this.data.name;
    }

    set lecture(data){
        this.data.lecture_id = data.id;
        this.data.lecture_name = data.name;
        this.data.lecture_max = data.max;
        this.render_content();
    }

    get lecture(){
        return {id:this.data.lecture_id, name:this.data.lecture_name, max:this.data.lecture_max};
    }

    set period(text){
        this.data.ticket_effective_days = text;
        this.render_content();
    }

    get period(){
        return this.data.ticket_effective_days;
    }

    set memo(text){
        this.data.memo = text;
        this.render_content();
    }

    get memo(){
        return this.data.memo;
    }
    
    set count(number){
        this.data.count = number;
        this.render_content();
    }

    get count(){
        return this.data._count;
    }

    set price(number){
        this.data.price = number;
        this.render_content();
    }

    get price(){
        return this.data.price;
    }


    init(){
        this.render_initial();
        this.render_toolbox();
        this.render_content();
    }

    set_initial_data (){
        Ticket_func.read({"ticket_id": this.ticket_id}, (data)=>{
            this.data.name = data.ticket_info.ticket_name;
            this.data.lecture_id = data.ticket_info.ticket_lecture_id_list;
            this.data.lecture_name = data.ticket_info.ticket_lecture_list;
            this.data.lecture_max = [];
            this.data.ticket_effective_days = data.ticket_info.ticket_effective_days;
            this.data.count = data.ticket_info.ticket_reg_count;
            this.data.price = data.ticket_info.ticket_price;
            this.data.memo = data.ticket_info.ticket_note;
            
            this.data.ticket_state_cd = data.ticket_info.ticket_state_cd;
            this.data.ticket_day_schedule_enable = data.ticket_info.ticket_day_schedule_enable;
            this.data.ticket_week_schedule_enable = data.ticket_info.ticket_week_schedule_enable;

            this.data.ticket_reg_dt = data.ticket_info.ticket_reg_dt;
            this.data.ticket_mod_dt = data.ticket_info.ticket_mod_dt;
            Ticket_func.read_member_list({"ticket_id":this.ticket_id}, (data)=>{
                this.data.member_id = data.ticket_ing_member_list.map((el)=>{return el.member_id;});
                this.data.member_name = data.ticket_ing_member_list.map((el)=>{return el.member_name;});
                this.init();
            });
        });
    }

    render_initial(){
        document.querySelector(this.target.install).innerHTML = this.static_component().initial_page;
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_row_toolbox();
    }
    
    render_content(){
        let lecture = this.dom_row_lecture_select();
        let lecture_list = this.dom_row_lecture_select_list();
        let count = this.dom_row_ticket_coung_input();
        let price = this.dom_row_ticket_price_input();
        let memo = this.dom_row_ticket_memo_input();
        let reg_mod = this.dom_row_reg_mod_date();
        let member = this.dom_row_member();
        let member_list = this.dom_row_member_list();

        let html =  '<div class="obj_box_full">'+lecture+lecture_list+'</div>' + 
                    '<div class="obj_box_full">'+count+price+ '</div>' + 
                    '<div class="obj_box_full">'+memo+ '</div>' + 
                    '<div class="obj_box_full">'+reg_mod+ '</div>' +
                    '<div class="obj_box_full">'+member+member_list+ '</div>';

        document.getElementById(this.target.content).innerHTML = html;
    }

    dom_row_toolbox(){
        let html = `
        <div class="member_add_upper_box" style="padding-bottom:8px;">
            <div style="display:inline-block;width:320px;">
                <div style="display:inline-block;width:320px;">
                    <span style="font-size:20px;font-weight:bold;">${this.data.name == null ? '' : this.data.name}</span>
                </div>
            </div>
        </div>
        `;
        return html;
    }



    dom_row_lecture_select(){
        let lecture_text = this.data.lecture_id.length == 0 ? '수업*' : this.data.lecture_name.length+'개';
        let html = CComponent.create_row('input_lecture_select', lecture_text, '/static/common/icon/icon_book.png', SHOW, ()=>{ 
            // layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
            //     lecture_select = new LectureSelector('#wrapper_box_lecture_select', this, 999);
            // });
        });
        return html;
    }

    dom_row_lecture_select_list (){
        let length = this.data.lecture_id.length;
        let html_to_join = [];
        
        for(let i=0; i<length; i++){
            let lecture_id = this.data.lecture_id[i];
            let lecture_name = this.data.lecture_name[i];
            let icon_button_style = {"display":"block", "padding":"0", "font-size":"13px"};
            let lecture_name_set = `<div style="display:inline-block;width:10px;height:10px;border-radius:5px;background-color:#fe4e65;margin-right:10px;"></div>${lecture_name}`;
            html_to_join.push(
                CComponent.icon_button (lecture_id, lecture_name_set, NONE, icon_button_style, ()=>{
                    layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_VIEW, 100, POPUP_FROM_RIGHT, {'lecture_id':lecture_id});
                })
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    dom_row_ticket_coung_input(){
        let html = CComponent.create_input_number_row ('input_ticket_count', this.data.count == null ? '횟수' : this.data.count+'회', '/static/common/icon/icon_rectangle_blank.png', HIDE, true, (input_data)=>{
            // let user_input_data = input_data;
            // this.count = user_input_data;
        });
        return html;
    }

    dom_row_ticket_price_input(){
        let html = CComponent.create_input_number_row ('input_ticket_price', this.data.price == null ? '가격' : this.data.price+'원', '/static/common/icon/icon_rectangle_blank.png', HIDE, true, (input_data)=>{
            // let user_input_data = input_data;
            // this.price = user_input_data;
        });
        return html;
    }

    dom_row_ticket_memo_input(){
        let html = CComponent.create_input_row ('input_ticket_memo', this.data.memo == null ? '설명' : this.data.memo, '/static/common/icon/icon_note.png', HIDE, true, (input_data)=>{
            // let user_input_data = input_data;
            // this.memo = user_input_data;
        });
        return html;
    }

    dom_row_reg_mod_date(){
        let icon_button_style = {"display":"block", "padding":0, "font-size":"12px"};
        let html1 = CComponent.icon_button('reg_date', `등록 ${this.data.ticket_reg_dt}`, NONE, icon_button_style, ()=>{});
        // let html2 = CComponent.icon_button('mod_date', `수정 ${this.data.ticket_mod_dt}`, NONE, icon_button_style, ()=>{});
        let html = html1;
        return html;
    }

    dom_row_member(){
        let member_text = this.data.member_id.length == 0 ? '진행중인 회원' : '진행중인 회원 ('+this.data.member_id.length+' 명)';
        let html = CComponent.create_row('ing_member', member_text, '/static/common/icon/icon_rectangle_blank.png', SHOW, ()=>{});
        return html;
    }

    dom_row_member_list (){
        let length = this.data.member_id.length;
        let html_to_join = [];
        
        for(let i=0; i<length; i++){
            let member_id = this.data.member_id[i];
            let member_name = this.data.member_name[i];
            let icon_button_style = {"display":"block", "font-size":"13px", "padding":"0"};
            html_to_join.push(
                CComponent.icon_button(member_id, member_name, NONE, icon_button_style, ()=>{
                    layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_MEMBER_VIEW, 100, POPUP_FROM_RIGHT, {'member_id':member_id});
                })
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }


    send_data(){
        let data = {
                    "ticket_name":this.data.name,
                    "lecture_id_list[]":this.data.lecture_id,
                    "ticket_effective_days":this.data.ticket_effective_days,
                    "ticket_reg_count":this.data.count,
                    "ticket_price":this.data.price,
                    "ticket_note":this.data.memo,
                    "ticket_week_schedule_enable":7, //주간 수강 제한 횟수
                    "ticket_day_schedule_enable":1  //일일 수강 제한 횟수

        };


        Ticket_func.create(data, ()=>{
            layer_popup.close_layer_popup();
            ticket.init();
        });
    }

    static_component(){
        return {
            initial_page:`<section id="${this.target.toolbox}" class="obj_box_full" style="border:0"></section>
                          <section id="${this.target.content}"></section>`
        };
    }
}