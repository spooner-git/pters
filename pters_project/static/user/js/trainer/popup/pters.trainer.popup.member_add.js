class Member_add{
    constructor(install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_member_add_toolbox', content:'section_member_add_content'};
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
                name: null,
                phone: null,
                birth: null,
                sex: null,
                memo: null,
                ticket_id:[],
                ticket_name:[],
                ticket_effective_days:[],
                ticket_reg_count:null,
                ticket_price:null,
                start_date:null,
                start_date_text:null,
                end_date:null,
                end_date_text:null
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
        this.set_initial_data(data_from_external);
        this.init();
    }

    set name(text){
        this.data.name = text;
        this.render_content();
    }

    get name(){
        return this.data.name;
    }

    set phone(number){
        this.data.phone = number;
        this.render_content();
    }

    get phone(){
        return this.data.phone;
    }

    set birth(data){
        this.data.birth = data.data;
        this.render_content();
    }

    get birth(){
        return this.data.birth;
    }

    set sex(data){
        this.data.sex = data;
        this.render_content();
    }

    get sex(){
        return this.data.sex;
    }

    set start_date(data){
        this.data.start_date = data.data;
        this.data.start_date_text = data.text;
        this.render_content();
    }

    get start_date(){
        return this.data.start_date;
    }

    set end_date(data){
        this.data.end_date = data.data;
        this.data.end_date_text = data.text;
        this.render_content();
    }

    get end_date(){
        return this.data.end_date;
    }


    set memo(text){
        this.data.memo = text;
        this.render_content();
    }

    get memo(){
        return this.data.memo;
    }

    set ticket(data){
        this.data.ticket_id = data.id;
        this.data.ticket_name = data.name;
        this.data.ticket_effective_days = data.effective_days;
        this.render_content();
    }

    get ticket(){
        return {id:this.data.ticket_id, name:this.data.ticket_name, effective_days: this.data.ticket_effective_days};
    }

    set reg_count(number){
        this.data.ticket_reg_count = number;
        this.render_content();
    }

    get reg_count(){
        return this.data.ticket_reg_count;
    }

    set reg_price(number){
        this.data.ticket_price = number;
        this.render_content();
    }

    get reg_price(){
        return this.data.ticket_price;
    }


    init(type){
        // if(type == undefined){
        //     type = this.list_type;
        // }
        // this.list_type = type;

        // this.render_initial();
        // this.render_toolbox();
        // this.render_content();
        this.render();
    }

    set_initial_data(data){
        if(data == null){
            return null;
        }
        this.user_data = data;
        let user_data_date = this.user_data.user_selected_date;
        this.data.date = user_data_date.year == null ? null : {year: user_data_date.year, month:user_data_date.month, date:user_data_date.date};
        this.data.date_text = user_data_date.text;
        
        let user_data_time = this.user_data.user_selected_time;
        this.data.start_time = user_data_time.hour == null ? null : `${user_data_time.hour}:${user_data_time.minute}`;
        this.data.start_time_text = user_data_time.text;
        this.data.end_time = user_data_time.hour2 == null ? null : `${user_data_time.hour2}:${user_data_time.minute2}`;
        this.data.end_time_text = user_data_time.text2;
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/close_black.png" onclick="layer_popup.close_layer_popup();member_add_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="member_add_popup.send_data()">등록</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
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
        let name = this.dom_row_member_name_input();
        let phone = this.dom_row_member_phone_input();
        let birth = this.dom_row_member_birth_input();
        let sex = this.dom_row_member_sex_input();
        let memo = this.dom_row_member_memo_input();
        let ticket = this.dom_row_ticket_select();
        let start_date = this.dom_row_start_date_select();
        let end_date = this.dom_row_end_date_select();
        let reg_count = this.dom_row_member_reg_coung_input();
        let reg_price = this.dom_row_member_reg_price_input();

        let html =  '<div class="obj_box_full">'+name+phone+birth+sex+memo+'</div>' + 
                    '<div class="obj_box_full">'+ticket + start_date+end_date+reg_count+reg_price+ '</div>';

        return html;
    }

    dom_row_toolbox(){
        let html = `
        <div class="member_add_upper_box" style="padding-bottom:8px;">
            <div style="display:inline-block;width:200px;">
                <div style="display:inline-block;width:200px;">
                    <span style="font-size:20px;font-weight:bold;">회원 등록</span>
                </div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_member_name_input(){
        let html = CComponent.create_input_row ('input_member_name', this.data.name == null ? '회원명*' : this.data.name, '/static/common/icon/person_black.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
        });
        return html;
    }

    dom_row_member_phone_input(){
        let html = CComponent.create_input_number_row ('input_member_phone', this.data.phone == null ? '휴대폰 번호*' : this.data.phone, '/static/common/icon/icon_smartphone.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.phone = user_input_data;
        });
        return html;
    }

    dom_row_member_birth_input(){
        //등록하는 행을 만든다.
        let birth_text = this.data.birth == null ? '생년월일' : Object.values(this.data.birth).join('.');
        let html = CComponent.create_row('input_member_birth', birth_text, '/static/common/icon/icon_cake.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.birth == null ? 1986 : this.data.birth.year; 
                let month = this.data.birth == null ? 2 : this.data.birth.month;
                let date = this.data.birth == null ? 24 : this.data.birth.date;
                
                date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'생년월일 선택', data:{year:year, month:month, date:date}, 
                                                                                                range:{start: this.dates.current_year - 90, end: this.dates.current_year}, 
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.birth = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
                
            });
        });
        return html;
    }

    dom_row_member_sex_input(){
        let html = CComponent.create_row ('input_member_sex', this.data.sex == null ? '성별' : this.data.sex, '/static/common/icon/person_black.png', HIDE, (input_data)=>{
            let user_option = {
                                male:{text:"남성", callback:()=>{this.sex = "M";layer_popup.close_layer_popup();}},
                                female:{text:"여성", callback:()=>{this.sex = "W";layer_popup.close_layer_popup();}}
            };
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(45+50*Object.keys(user_option).length)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                var option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });
        return html;
    }

    dom_row_member_memo_input(){
        let html = CComponent.create_input_row ('input_member_memo', this.data.memo == null ? '특이사항' : this.data.memo, '/static/common/icon/icon_note.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        });
        return html;
    }

    dom_row_ticket_select(){
        let ticket_text = this.data.ticket_id.length == 0 ? '수강권*' : this.data.ticket_name.join(', ');
        let html = CComponent.create_row('input_ticket_select', ticket_text, '/static/common/icon/icon_rectangle_blank.png', SHOW, ()=>{ 
            layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_TICKET_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                var ticket_select = new TicketSelector('#wrapper_box_ticket_select', this, 1);
            });
        });
        return html;
    }

    dom_row_start_date_select(){
        //등록하는 행을 만든다.
        let start_date_text = this.data.start_date == null ? '시작일*' : this.data.start_date_text;
        let html = CComponent.create_row('start_date_select', start_date_text, '/static/common/icon/icon_rectangle_blank.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*305/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.start_date == null ? this.dates.current_year : this.data.start_date.year; 
                let month = this.data.start_date == null ? this.dates.current_month : this.data.start_date.month;
                let date = this.data.start_date == null ? this.dates.current_date : this.data.start_date.date;
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'start_date', title:'시작일 선택', data:{year:year, month:month, date:date},  
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.start_date = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                }});
            });
        });
        return html;
    }

    dom_row_end_date_select(){
        //등록하는 행을 만든다.
        let end_date_text = this.data.end_date == null ? '종료일*' : this.data.end_date_text;
        let html = CComponent.create_row('end_date_select', end_date_text, '/static/common/icon/icon_rectangle_blank.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*305/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.end_date == null ? this.dates.current_year : this.data.end_date.year; 
                let month = this.data.end_date == null ? this.dates.current_month : this.data.end_date.month;
                let date = this.data.end_date == null ? this.dates.current_date : this.data.end_date;
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'end_date', title:'종료일 선택', data:{year:year, month:month, date:date},  
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.end_date = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                }});
            });
        });
        return html;
    }

    dom_row_member_reg_coung_input(){
        let html = CComponent.create_input_number_row ('input_reg_count', this.data.ticket_reg_count == null ? '횟수*' : this.data.ticket_reg_count+'회', '/static/common/icon/icon_rectangle_blank.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.reg_count = user_input_data;
        });
        return html;
    }

    dom_row_member_reg_price_input(){
        let html = CComponent.create_input_number_row ('input_reg_price', this.data.ticket_price == null ? '가격' : this.data.ticket_price+'원', '/static/common/icon/icon_rectangle_blank.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.reg_price = user_input_data;
        });
        return html;
    }




    switch_type(){
        switch(this.list_type){
            case "lesson":
                this.init("off");
            break;

            case "off":
                this.init("lesson");
            break;
        }
    }

    send_data(){
        if(this.check_before_send() == false){
            return false;
        }

        let data = {
                    "member_id":null,
                    "first_name": this.data.name,
                    "name":this.data.name,
                    "phone":this.data.phone,
                    "birthday": `${this.data.birth != null ? this.data.birth.year+'-'+this.data.birth.month+'-'+this.data.birth.date : ''}`,
                    "sex":this.data.sex,
                    "contents":this.data.memo,
                    "ticket_id":this.data.ticket_id[0],
                    "start_date": `${this.data.start_date.year}-${this.data.start_date.month}-${this.data.start_date.date}`,
                    "end_date":`${this.data.end_date.year}-${this.data.end_date.month}-${this.data.end_date.date}`,
                    "counts":this.data.ticket_reg_count,
                    "price":this.data.ticket_price
        };

        Member_func.create_pre(data, (received)=>{
            data.member_id = received.user_db_id[0];
            Member_func.create(data, ()=>{
                // layer_popup.close_layer_popup();
                member.init();
            });
        });
        layer_popup.close_layer_popup();
    }

    check_before_send(){
        if(this.data.name == null){
            show_error_message('회원명을 입력 해주세요.');
            return false;
        }
        if(this.data.phone == null){
            show_error_message('휴대폰 번호를 입력 해주세요.');
            return false;
        }
        if(this.data.ticket_id.length == 0){
            show_error_message('등록할 수강권을 선택 해주세요.');
            return false;
        }
        if(this.data.start_date == null){
            show_error_message('시작일을 입력 해주세요.');
            return false;
        }
        if(this.data.end_date == null){
            show_error_message('종료일을 입력 해주세요.');
            return false;
        }
        if(this.data.ticket_reg_count == null){
            show_error_message('등록 횟수를 입력 해주세요.');
            return false;
        }
        // if(this.data.ticket_price == null){
        //     show_error_message('등록 금액을 선택 해주세요.');
        // }
        return true;
    }
}