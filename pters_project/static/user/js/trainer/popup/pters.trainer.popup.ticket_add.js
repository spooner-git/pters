class Ticket_add{
    constructor(install_target, instance){
        this.target = {install: install_target, toolbox:'section_ticket_add_toolbox', content:'section_ticket_add_content'};
        this.instance = instance;

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
                memo:null
        };

        this.init();
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

    render_initial(){
        document.querySelector(this.target.install).innerHTML = this.static_component().initial_page;
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_row_toolbox();
    }
    
    render_content(){
        let name = this.dom_row_ticket_name_input();
        let lecture = this.dom_row_lecture_select();
        let lecture_list = this.dom_row_lecture_select_list();
        let count = this.dom_row_ticket_coung_input();
        let price = this.dom_row_ticket_price_input();
        let memo = this.dom_row_ticket_memo_input();

        let html =  '<div class="obj_box_full">'+name+lecture+lecture_list+'</div>' + 
                    // '<div class="obj_box_full">'+count+price+ '</div>' + 
                    '<div class="obj_box_full">'+memo+ '</div>';

        document.getElementById(this.target.content).innerHTML = html;
    }

    dom_row_toolbox(){
        let html = `
        <div class="member_add_upper_box" style="padding-bottom:8px;">
            <div style="display:inline-block;width:200px;">
                <div style="display:inline-block;width:200px;">
                    <span style="font-size:20px;font-weight:bold;">새로운 수강권</span>
                </div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_ticket_name_input(){
        let html = CComponent.create_input_row ('input_ticket_name', this.data.name == null ? '수강권명*' : this.data.name, '/static/common/icon/person_black.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
        });
        return html;
    }

    dom_row_lecture_select(){
        let lecture_text = this.data.lecture_id.length == 0 ? '수업*' : this.data.lecture_name.length+'개 선택됨';
        let html = CComponent.create_row('input_lecture_select', lecture_text, '/static/common/icon/icon_book.png', SHOW, ()=>{ 
            layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                lecture_select = new LectureSelector('#wrapper_box_lecture_select', this, 999);
            });
        });
        return html;
    }

    dom_row_lecture_select_list (){
        let length = this.data.lecture_id.length;
        let html_to_join = [];
        
        for(let i=0; i<length; i++){
            let lecture_id = this.data.lecture_id[i];
            let lecture_name = this.data.lecture_name[i];
            let icon_button_style = null;
            html_to_join.push(
                CComponent.icon_button(lecture_id, lecture_name, null, icon_button_style, ()=>{
                    layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_VIEW, 100, POPUP_FROM_RIGHT, {'lecture_id':lecture_id});
                })
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    dom_row_ticket_coung_input(){
        let html = CComponent.create_input_number_row ('input_ticket_count', this.data.count == null ? '횟수' : this.data.count+'회', '/static/common/icon/icon_rectangle_blank.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.count = user_input_data;
        });
        return html;
    }

    dom_row_ticket_price_input(){
        let html = CComponent.create_input_number_row ('input_ticket_price', this.data.price == null ? '가격' : this.data.price+'원', '/static/common/icon/icon_rectangle_blank.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.price = user_input_data;
        });
        return html;
    }

    dom_row_ticket_memo_input(){
        let html = CComponent.create_input_row ('input_ticket_memo', this.data.memo == null ? '설명' : this.data.memo, '/static/common/icon/icon_note.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        });
        return html;
    }

    send_data(){
        let data = {
                    "ticket_name":this.data.name,
                    "lecture_id_list[]":this.data.lecture_id,
                    // "ticket_effective_days":30,
                    // "ticket_reg_count":this.data.count,
                    // "ticket_price":this.data.price,
                    "ticket_note":this.data.memo,
                    "ticket_week_schedule_enable":7, //주간 수강 제한 횟수
                    "ticket_day_schedule_enable":1  //일일 수강 제한 횟수
        };

        if(this.check_before_send() == false){
            return false;
        }
        
        Ticket_func.create(data, ()=>{
            // layer_popup.close_layer_popup();
            ticket.init();
        });
        layer_popup.close_layer_popup();
    }

    static_component(){
        return {
            initial_page:`<section id="${this.target.toolbox}" class="obj_box_full" style="border:0"></section>
                          <section id="${this.target.content}"></section>`
        };
    }

    check_before_send(){
        if(this.data.name == null){
            show_error_message('수강권명을 입력해주세요');
            return false;
        }
        if(this.data.lecture_id.length == 0){
            show_error_message('포함할 수업을 선택해주세요');
            return false;
        }
        return true;
    }
}