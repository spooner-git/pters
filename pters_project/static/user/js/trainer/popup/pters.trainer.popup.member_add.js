class Member_add{
    constructor(install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_member_add_toolbox', content:'section_member_add_content'};
        this.instance = instance;
        this.data_from_external = data_from_external;
        this.form_id = 'id_member_add_form';
        //data_from_external이 null이면 신규회원등록, member_id 값이 들어오면 재등록

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
                member_id:null, //재등록시에만 사용하는 값
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
        this.set_initial_data(this.data_from_external);
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


    init(){
        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    set_initial_data(data){
        if(data == null){
            return null;
        }

        Member_func.read(data, (received)=>{
            this.data.name = received.member_name;
            this.data.member_id = received.member_id;
            this.data.phone = received.member_phone == "None" ? null : received.member_phone;
            this.data.birth = received.member_birthday_dt == "None" ? null : DateRobot.to_split(received.member_birthday_dt);
            this.data.sex = received.member_sex == "None" ? null :  received.member_sex;
            this.init();
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_x_black.png" onclick="layer_popup.close_layer_popup();member_add_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="member_add_popup.send_data()">등록</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "", this.instance);

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_member_add .wrapper_top').style.border = 0;
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
        let name = this.dom_row_member_name_input();
        let phone = this.dom_row_member_phone_input();
        let birth = this.dom_row_member_birth_input();
        let sex = this.dom_row_member_sex_input();
        let memo = this.dom_row_member_memo_input();
        let ticket = this.dom_row_ticket_select();
        let start_date = this.dom_row_start_date_select();
        let end_date = this.dom_row_end_date_select();
        let reg_count = this.dom_row_member_reg_count_input();
        let reg_price = this.dom_row_member_reg_price_input();

        let html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('회원명') + name + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('휴대폰 번호') + phone + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('생년월일') + birth + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('성별') + sex +
            '</div>' +
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('수강권') + ticket + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('시작일') + start_date + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('종료일') + end_date + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('횟수') + reg_count + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('가격') + reg_price + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('특이사항') + memo +
            '</div>';

        return html;
    }

    dom_row_toolbox(){
        let title = this.data_from_external == null ? '새로운 회원' : '재등록';
        let html = `
        <div class="member_add_upper_box">
            <div style="display:inline-block;width:200px;">
                <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: #3d3b3b;">
                    ${title}
                </span>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_member_name_input(){
        let id = 'input_member_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '회원명*';
        let icon = '/static/common/icon/icon_people_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = this.data_from_external == null ? false : true;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "공백, + - _ 제외 특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            this.name = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_member_phone_input(){
        let unit = '';
        let id = 'input_member_phone';
        let title = this.data.phone == null ? '' : this.data.phone;
        let placeholder = '휴대폰 번호';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = this.data_from_external == null ? false : true;
        let pattern = "[0-9]{10,11}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            this.phone = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_member_birth_input(){
        //등록하는 행을 만든다.
        let id = 'input_member_birth';
        let title = this.data.birth == null ? '생년월일' : Object.values(this.data.birth).join('.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.birth == null ? {"color":"#b8b4b4"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            //행을 클릭했을때 실행할 내용
            if(this.data_from_external != null){
                return false;
            }

            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.birth == null ? 1986 : this.data.birth.year; 
                let month = this.data.birth == null ? 2 : this.data.birth.month;
                let date = this.data.birth == null ? 24 : this.data.birth.date;
                
                date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'생년월일', data:{year:year, month:month, date:date},
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
        let id = 'input_member_sex';
        let title = '성별';
        if(this.data.sex != null){
            if(this.data.sex=='M'){
                title = "남성";
            }
            else{
                title = "여성";
            }
        }
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.sex == null ? {"color":"#b8b4b4"} : null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            if(this.data_from_external != null){
                return false;
            }

            let user_option = {
                                male:{text:"남성", callback:()=>{this.sex = "M";layer_popup.close_layer_popup();}},
                                female:{text:"여성", callback:()=>{this.sex = "W";layer_popup.close_layer_popup();}}
            };
            let options_padding_top_bottom = 16;
            let button_height = 8 + 8 + 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });
        return html;
    }

    dom_row_member_memo_input(){
        let id = 'input_member_memo';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '특이사항';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            this.memo = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_ticket_select(){
        let id = 'input_ticket_select';
        let title = this.data.ticket_id.length == 0 ? '수강권*' : this.data.ticket_name.join(', ');
        let icon = '/static/common/icon/icon_ticket_black.png';
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = this.data.ticket_id.length == 0 ? {"color":"#b8b4b4"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                ticket_select = new TicketSelector('#wrapper_box_ticket_select', this, 1, {"title":"수강권 선택"}, (set_data)=>{
                    this.ticket = set_data;
                    // this.render_content();
                });
            });
        });
        return html;
    }

    dom_row_start_date_select(){
        //등록하는 행을 만든다.
        let id = 'start_date_select';
        let title = this.data.start_date == null ? '시작일*' : this.data.start_date_text;
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.start_date == null ? {"color":"#b8b4b4"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*305/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.start_date == null ? this.dates.current_year : this.data.start_date.year; 
                let month = this.data.start_date == null ? this.dates.current_month : this.data.start_date.month;
                let date = this.data.start_date == null ? this.dates.current_date : this.data.start_date.date;
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'start_date', title:'시작일',
                                                                                                data:{year:year, month:month, date:date},
                                                                                                // min:{year:year, month:month, date:date},
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
        let id = 'end_date_select';
        let title = this.data.end_date == null ? '종료일*' : this.data.end_date_text;
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.end_date == null ? {"color":"#b8b4b4"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*305/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{

                let year;
                let month;
                let date;
                //시작일자가 입력되어있다면 시작일자가 있는달을 그린다.
                if(this.data.end_date != null){
                    year = this.data.end_date.year;
                    month = this.data.end_date.month;
                    date = this.data.end_date.date;
                }else if(this.data.end_date == null){
                    if(this.data.start_date != null){
                        year = this.data.start_date.year;
                        month = this.data.start_date.month;
                        date = this.data.start_date.date;
                    }else{
                        year = this.dates.current_year;
                        month = this.dates.current_month;
                        date = this.dates.current_year;
                    }
                }

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                // let year = this.data.end_date == null ? this.dates.current_year : this.data.end_date.year; 
                // let month = this.data.end_date == null ? this.dates.current_month : this.data.end_date.month;
                // let date = this.data.end_date == null ? this.dates.current_date : this.data.end_date.date;    
                
                let min = this.data.start_date != null ? {year:this.data.start_date.year, month:this.data.start_date.month, date: this.data.start_date.date} : null;

                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'end_date', title:'종료일',
                                                                                                data:{year:year, month:month, date:date},  
                                                                                                min:min,
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.end_date = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                }});
            });
        });
        return html;
    }

    dom_row_member_reg_count_input(){
        let unit = '회';
        let id = 'input_reg_count';
        let title = this.data.ticket_reg_count == null ? '' : this.data.ticket_reg_count;
        let placeholder = '횟수*';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = false;
        let pattern = "[0-9]{1,4}";
        let pattern_message = "";
        let required = "required";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            this.reg_count = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_member_reg_price_input(){
        let unit = '원';
        let id = 'input_reg_price';
        let title = this.data.ticket_price == null ? '' : UnitRobot.numberWithCommas(this.data.ticket_price);
        let placeholder = '가격';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = false;
        let pattern = "[0-9]{0,8}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            this.reg_price = input_data;
        }, pattern, pattern_message, required);
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
        let inspect = pass_inspector.member();
        if(inspect.barrier == BLOCKED){
            show_error_message(`[${inspect.limit_type}] 이용자께서는 회원을 최대 ${inspect.limit_num}명까지 등록하실 수 있습니다.`);
            return false;
        }

        if(this.check_before_send() == false){
            return false;
        }

        let data = {
                    "member_id":this.data.member_id,
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

        if(this.data_from_external == null){ //신규 회원 등록
            Member_func.create_pre(data, (received)=>{
                data.member_id = received.user_db_id[0];
                Member_func.create(data, ()=>{
                    // layer_popup.close_layer_popup();
                    member.init();
                });
            });
        }else{ // 재등록
            Member_func.create_ticket_re(data, ()=>{
                member_view_popup.set_initial_data();
                member_ticket_history.init();
            });
        }

        
        layer_popup.close_layer_popup();
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
            if(this.data.start_date == null){
                show_error_message('시작일을 입력 해주세요.');
                return false;
            }
            if(this.data.end_date == null){
                show_error_message('종료일을 입력 해주세요.');
                return false;
            }
            if(this.data.ticket_id.length == 0){
                show_error_message('등록할 수강권을 선택 해주세요.');
                return false;
            }
            return true;
        }
    }
}