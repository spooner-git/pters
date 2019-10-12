class Lecture_add{
    constructor(install_target, callback){
        this.target = {install: install_target, toolbox:'section_lecture_add_toolbox', content:'section_lecture_add_content'};
        this.callback = callback;
        this.form_id = 'id_lecture_add_form';

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
                time:null,
                capacity:null,
                fixed_member_id:[],
                fixed_member_name:[],
                color_bg:[],
                color_font:[],
                color_name:[],

                ticket_id:[],
                ticket_name:[],

                make_ticket:OFF
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

    set time(text){
        this.data.time = text;
        this.render_content();
    }

    get time(){
        return this.data.time;
    }

    set capacity(number){
        this.data.capacity = number;
        this.render_content();
    }

    get capacity(){
        return this.data.capacity;
    }

    set member(data){
        this.data.fixed_member_id = data.id;
        this.data.fixed_member_name = data.name;
        this.render_content();
    }

    get member(){
        return {id:this.data.fixed_member_id, name:this.data.fixed_member_name};
    }

    set color(data){
        this.data.color_bg = data.bg;
        this.data.color_font = data.font;
        this.data.color_name = data.name;
        this.render_content();
    }

    get color(){
        return {bg:this.data.color_bg, font:this.data.color_font, name:this.data.color_name};
    }

    set ticket(data){
        this.data.ticket_id = data.id;
        this.data.ticket_name = data.name;
        this.render_content();
    }

    get ticket(){
        return {id:this.data.ticket_id, name:this.data.ticket_name, reg_price:[], reg_count:[], effective_days:[]};
    }

 
    init(){
        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_x_black.png" onclick="layer_popup.close_layer_popup();lecture_add_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="lecture_add_popup.send_data();">저장</span></span>`;
        let content =   `<form id="${this.form_id}" onSubmit="return false"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_lecture_add .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    dom_assembly_toolbox(){
        return this.dom_row_toolbox();
    }
    
    dom_assembly_content(){
        let name = this.dom_row_lecture_name_input();
        let time = this.dom_row_lecture_time_input(); //수업 진행시간
        let capacity = this.dom_row_capacity_input();
        let fixed_member = this.dom_row_fiexd_member_select();
        let fixed_member_list = this.dom_row_fixed_member_list();
        let color = this.dom_row_color_select();
        let ticket = this.dom_row_ticket_select();
        let ticket_make = this.dom_row_ticket_make_select();

        let html =  '<div class="obj_input_box_full">'+CComponent.dom_tag('수업명') + name+'</div>' +
                    '<div class="obj_input_box_full">'+CComponent.dom_tag('정원') + capacity + '</div>' +
                    '<div class="obj_input_box_full">'+CComponent.dom_tag('색상 태그')+ color+ '</div>' +
                    '<div class="obj_input_box_full">'+CComponent.dom_tag('생성시 수강권에 추가')+ ticket+ '</div>'
                     + '<div class="obj_input_box_full">'+CComponent.dom_tag('생성시 같은 이름의 수강권을 함께 생성')+ ticket_make+ '</div>';

        return html;
    }

    dom_row_toolbox(){
        let title = "새로운 수업";
        let html = `
        <div class="lecture_add_upper_box">
            <div style="display:inline-block;width:200px;">
                <span style="font-size:20px;font-weight:bold;letter-spacing: -0.9px;" class="popup_toolbox_text">${title}</span>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_lecture_name_input(){
        let id = 'input_lecture_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '수업명*';
        let icon = '/static/common/icon/icon_lecture_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:()[] 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "+ - _ : ()[] 제외 특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            this.name = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_lecture_time_input(){
        let unit = '분';
        let id = 'input_lecture_time';
        let title = this.data.time == null ? '' : this.data.time+unit;
        let placeholder = '진행 시간';
        let icon = '/static/common/icon/icon_clock_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{1,4}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            this.time = input_data;
        }, pattern, pattern_message, required);
        return html;
    }
  
    dom_row_capacity_input(){
        let unit = '명';
        let id = 'input_lecture_capacity';
        let title = this.data.capacity == null ? '' : this.data.capacity+unit;
        let placeholder =  '정원*';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{1,4}";
        let pattern_message = "";
        let required = "required";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            this.capacity = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_fiexd_member_select(){
        let id = 'select_member';
        let title = this.data.fixed_member_name.length == 0 ? '고정 회원' : '고정회원 '+this.data.fixed_member_id.length+'명 선택됨';
        let icon = NONE;
        let icon_r_visible = SHOW;
        let icon_r_text = '고정 회원';
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, (data)=>{
            if(this.data.capacity != null){
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, popup_style, null, ()=>{
                    member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.capacity, {'lecture_id':null, "title":"고정 회원 선택"}, (set_data)=>{
                        this.member = set_data;
                        this.render_content();
                    });
                });
            }else{
                show_error_message('정원을 먼저 입력해주세요.');
            }
        });
        return html;
    }

    dom_row_fixed_member_list (){
        let length = this.data.fixed_member_id.length;
        let html_to_join = [];
        
        for(let i=0; i<length; i++){
            let member_id = this.data.fixed_member_id[i];
            let member_name = this.data.fixed_member_name[i];
            let icon_button_style = null;
            html_to_join.push(
                CComponent.icon_button(member_id, member_name, null, icon_button_style, ()=>{
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SIMPLE_VIEW, 100*(400/windowHeight), POPUP_FROM_BOTTOM, {'member_id':member_id}, ()=>{
                        member_simple_view_popup = new Member_simple_view('.popup_member_simple_view', member_id, 'member_simple_view_popup');
                        //회원 간단 정보 팝업 열기
                    });
                })
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    dom_row_color_select(){
        let id = 'input_color_select';
        let title = this.data.color_name.length == 0 ? '색상 태그' : `<span style="background-color:${this.data.color_bg};color:${this.data.color_font};padding:5px;border-radius:4px;">${this.data.color_name}</span>`;
        let icon = NONE;
        let icon_r_visible = SHOW;
        let icon_r_text = '';
        let style = this.data.color_name.length == 0 ? {"color":"#b8b4b4"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_COLOR_SELECT, 100, popup_style, null, ()=>{
                color_select = new ColorSelector('#wrapper_box_color_select', this, 1, (set_data)=>{
                    this.color = set_data;
                    this.render_content();
                });
            });
        });
        return html;
    }

    dom_row_ticket_select(){
        let id = 'lecture_add_ticket_select';
        let title = this.data.ticket_id.length == 0 ? '수강권' : this.data.ticket_name.join(', ');
        let icon = NONE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = this.data.ticket_id.length == 0 ? {"color":"#b8b4b4"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_SELECT, 100, popup_style, null, ()=>{
                ticket_select = new TicketSelector('#wrapper_box_ticket_select', this, 99, {"title":"수강권 선택"}, (set_data)=>{
                    this.ticket = set_data;
                    // this.render_content();
                });
            });
        });
        return html;
    }

    dom_row_ticket_make_select(){
        let id = "lecture_add_ticket_new";
        let power = this.data.make_ticket;
        let style = {"margin-top":"10px", "margin-left":"40px"};
        let onclick = (on_off)=>{
            this.data.make_ticket = on_off;
            this.render_content();
        };
        let html = CComponent.toggle_button (id, power, style, onclick);
        return html;
    }

    send_date_create_ticket_at_the_same_time(lecture_id){
        let inspect = pass_inspector.ticket();
        if(inspect.barrier == BLOCKED){
            show_error_message(`[${inspect.limit_type}] 이용자께서는 수강권을 최대 ${inspect.limit_num}개까지 등록하실 수 있습니다. 
                                <br> 같은 이름으로 수강권 생성에 실패하였습니다.`);
            return false;
        }

        let data = {
                    "ticket_name":this.data.name,
                    "lecture_id_list[]":[lecture_id],
                    // "ticket_effective_days":30,
                    // "ticket_reg_count":this.data.count,
                    // "ticket_price":this.data.price,
                    "ticket_note":"",
                    "ticket_week_schedule_enable":7, //주간 수강 제한 횟수
                    "ticket_day_schedule_enable":1  //일일 수강 제한 횟수
        };
        
        Ticket_func.create(data, ()=>{

        });
    }

    send_data(){
        let inspect = pass_inspector.lecture();
        if(inspect.barrier == BLOCKED){
            show_error_message(`[${inspect.limit_type}] 이용자께서는 수업을 최대 ${inspect.limit_num}개까지 등록하실 수 있습니다.`);
            return false;
        }

        if(this.check_before_send() == false){
            return false;
        }
        let data = {
            "name":this.data.name,
            "member_num":this.data.capacity,
            "ing_color_cd":this.data.color_bg[0],
            "end_color_cd":"",
            "ing_font_color_cd":this.data.color_font[0],
            "end_font_color_cd":""
        };

        Lecture_func.create(data, (received)=>{
            console.log("received", received);
            //수업추가시 수강권에 바로 집어넣기 - Lecture_func.create에서 서버에서 lecture_id를 반환해줘야함
            for(let i=0; i<this.ticket.id.length; i++){
                let data_to_send = {"ticket_id":this.ticket.id[i], "lecture_id":received.lecture_id};
                console.log(data_to_send);
                Ticket_func.update_lecture(ADD, data_to_send);
                if(this.callback != undefined){
                    this.callback();
                }
            }
            //수업 생성시 같은 이름으로 수강권도 함께 만들기
            if(this.data.make_ticket == ON){ 
                this.send_date_create_ticket_at_the_same_time(received.lecture_id);
            }
            try{
                lecture.init();
                lecture_list_popup.init();
            }catch(e){

            }
        });
        layer_popup.close_layer_popup();
        lecture_add_popup.clear();
    }

    check_before_send(){

        let forms = document.getElementById(`${this.form_id}`);
        update_check_registration_form(forms);
        let error_info = check_registration_form(forms);
        if(error_info != ''){
            show_error_message(error_info);
            return false;
        }
        else{
            if(this.data.capacity <= 1){
                show_error_message('정원은 2명보다 크게 설정해주세요.');
                return false;
            }
            return true;
        }
    }
}