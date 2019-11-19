class Member_ticket_modify{
    constructor(install_target, data, instance){
        this.target = {install: install_target, toolbox:'section_member_ticket_modify_toolbox', content:'section_member_ticket_modify_content'};
        this.instance = instance;
        this.external_data = data;
        this.form_id = 'id_member_ticket_modify_form';

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
            member_name:null,
            member_ticket_name: null,
            member_ticket_id: null,
            start_date: null,
            start_date_text:null,
            end_date: null,
            end_date_text:null,
            reg_count: null,
            price:null,
            status:null,
            note:null,
            refund_date:null,
            refund_price:null
        };

        this.date_start = 0;
        Setting_reserve_func.read((data)=>{
            let date_start_array = {"SUN":0, "MON":1};
            this.date_start = date_start_array[data.setting_week_start_date];
        });

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
       
        this.init();
    }

    init(){
        // this.render();
        this.set_initial_data();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    set_initial_data (){
        // this.data = this.external_data;
        for(let item in this.external_data){
            if(this.external_data[item] != undefined){
                this.data[item] = this.external_data[item];
            }
        }
        this.render();
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();member_ticket_modify.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>${this.data.member_name}님의 수강권</span></span>`;
        let top_right = `<span class="icon_right" onclick="member_ticket_modify.send_data()"><span style="color:var(--font-highlight);font-weight: 500;" >완료</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_member_ticket_modify .wrapper_top').style.border = 0;
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    dom_assembly_toolbox(){
        // return this.dom_row_toolbox();
        return "";
    }
    
    dom_assembly_content(){

        let status = CComponent.dom_tag('수강권') + this.dom_row_status_input() + 
                    `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>`;
        let refund_date  = CComponent.dom_tag('환불일') + this.dom_row_refund_date_input() +
                    `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>`;
        let refund_price  = CComponent.dom_tag('환불 금액') + this.dom_row_refund_price_input() +
                    `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>`;
        let start  = CComponent.dom_tag('시작일') + this.dom_row_start_input() +
                    `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>`;
        let end    = CComponent.dom_tag('종료일') + this.dom_row_end_input() +
                    `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>`;
        let count  = CComponent.dom_tag('등록 횟수') + this.dom_row_count_input() +
                    `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>`;
        let price  = CComponent.dom_tag('가격') + this.dom_row_price_input() + 
                    `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>`;
        let note = CComponent.dom_tag('특이사항') + this.dom_row_note_input();

        // if(this.data.refund_date == null || this.data.refund_price == null){
        if(this.data.status != "RF"){
            refund_date = "";
            refund_price = "";
        }

        let html =
            '<div class="obj_input_box_full">'
                + status
                + refund_date
                + refund_price
                + count
                + start
                + end
                + price
                + note +
            '</div>';

        return html;
    }

    dom_row_toolbox(){
        let html = "";
        return html;
    }

    dom_row_status_input(){
        let id = 'member_ticket_status_modify';
        let title = this.data.member_ticket_name == null ||this.data.member_ticket_name == 'None' ? '수강권명' : this.data.member_ticket_name;
        let icon = CImg.ticket();
        let icon_r_visible = SHOW;
        let icon_r_text = `상태 (<span style="color:${TICKET_STATUS_COLOR[this.data.status]}">${TICKET_STATUS[this.data.status]}</span>)`;
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let user_option = {
                finish:{text:"종료", callback:()=>{
                    Member_func.ticket_status({"member_ticket_id":this.data.member_ticket_id, "state_cd":"PE", "refund_price":"", "refund_date":""}, ()=>{
                        this.data.status = "PE";
                        this.render_content();
                        try{
                            current_page.init();
                        }catch(e){}
                        try{
                            member_view_popup.init();
                            member_ticket_history.init();
                        }catch(e){}
                    });
                    layer_popup.close_layer_popup();}
                },
                resume:{text:"재개", callback:()=>{
                    Member_func.ticket_status({"member_ticket_id":this.data.member_ticket_id, "state_cd":"IP", "refund_price":"", "refund_date":""}, ()=>{
                        this.data.status = "IP";
                        this.render_content();
                        try{
                            current_page.init();
                        }catch(e){}
                        try{
                            member_view_popup.init();
                            member_ticket_history.init();
                        }catch(e){}
                    });
                    layer_popup.close_layer_popup();}
                },
                refund:{text:"환불", callback:()=>{
                    layer_popup.close_layer_popup();
                    let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_TICKET_REFUND, 100, popup_style, null, ()=>{
                        let start_date = DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date);
                        let external_data = {"member_ticket_id":this.data.member_ticket_id,"state_cd":"RF", "member_ticket_name":this.data.member_ticket_name, "member_ticket_price":this.data.price, "member_ticket_start_date":start_date};
                        member_ticket_refund = new Member_ticket_refund('.popup_member_ticket_refund', external_data, 'member_ticket_refund');
                    });}
                },
                delete:{text:"삭제", callback:()=>{
                    Member_func.ticket_delete({"member_ticket_id":this.data.member_ticket_id}, ()=>{
                        try{
                            current_page.init();
                        }catch(e){}
                        try{
                            member_view_popup.init();
                            member_ticket_history.init();
                        }catch(e){}
                        layer_popup.close_layer_popup();
                    });
                    layer_popup.close_layer_popup();}
                }
            };

            if(this.data.status == "IP"){
                delete user_option.resume;
                delete user_option.delete;
            }else{
                delete user_option.refund;
                delete user_option.finish;
            }

            let options_padding_top_bottom = 16;
            let button_height = 8 + 8 + 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });
        return html;
    }

    dom_row_start_input(){
        let id = 'member_ticket_start_modify';
        let title = this.data.start_date == null ||this.data.start_date == 'None' ? '수강권 시작일' : this.data.start_date_text;
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.start_date.year;
                let month = this.data.start_date.month;
                let date = this.data.start_date.date;
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'일자', data:{year:year, month:month, date:date}, callback_when_set: (object)=>{ 
                    if(this.data.end_date != null){
                        let compare = DateRobot.compare(
                            object.data.year+'-'+object.data.month+'-'+object.data.date, 
                            this.data.end_date.year+'-'+this.data.end_date.month+'-'+this.data.end_date.date
                        );
                        if(compare == true){
                            this.data.end_date = object.data;
                            this.data.end_date_text = object.text;
                        }
                    }
                    this.data.start_date = object.data;
                    this.data.start_date_text = object.text;
                    this.render_content();
                }});
            });
        });
        return html;
    }

    dom_row_end_input(){
        let id = 'member_ticket_end_modify';
        let title = this.data.end_date == null ||this.data.end_date == 'None' ? '입력 해주세요.' : this.data.end_date_text;
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = Number(this.data.end_date.year); 
                let month = Number(this.data.end_date.month);
                let date = Number(this.data.end_date.date);

                let year_min = Number(this.data.start_date.year);
                let month_min = Number(this.data.start_date.month);
                let date_min = Number(this.data.start_date.date);

                if(year == 9999){
                    year = year_min;
                    month = month_min;
                    date = date_min;
                }
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'일자', data:{year:year, month:month, date:date}, min:{year:year_min, month:month_min, date:date_min}, callback_when_set: (object)=>{ 
                    // this.data.end_date = DateRobot.to_yyyymmdd(object.data.year, object.data.month, object.data.date);
                    this.data.end_date = object.data;
                    this.data.end_date_text = object.text;
                    this.render_content();
                }});
            });
        });
        let end_date_simple_input = this.dom_row_end_date_simple_input_machine();
        return html + end_date_simple_input;
    }

    dom_row_end_date_simple_input_machine(){
        let button_style = {"flex":"1 1 0", "padding":"10px 8px", "color":"var(--font-sub-dark)"};

        let button_week_2 = CComponent.button ("button_week_2", "+ 7일", button_style, ()=>{

            let end_date_ = this.data.end_date == null ? this.data.start_date : this.data.end_date;
            let end_date = DateRobot.to_yyyymmdd(end_date_.year, end_date_.month, end_date_.date);
            if(end_date_.year == "9999"){
                end_date = DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date);
            }

            let new_date = DateRobot.add_date(end_date, 7);
            let new_date_year = new_date.split('-')[0];
            let new_date_month = new_date.split('-')[1];
            let new_date_date = new_date.split('-')[2];
            
            this.data.end_date = {year:Number(new_date_year), month:Number(new_date_month), date:Number(new_date_date)};
            this.data.end_date_text = DateRobot.to_text(new_date_year, new_date_month, new_date_date, SHORT);
            this.render_content();
        });

        let button_month_1 = CComponent.button ("button_month_1", "+ 30일", button_style, ()=>{
            
            // let start_date = DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date);
            let end_date_ = this.data.end_date == null ? this.data.start_date : this.data.end_date;
            let end_date = DateRobot.to_yyyymmdd(end_date_.year, end_date_.month, end_date_.date);
            if(end_date_.year == "9999"){
                end_date = DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date);
            }

            let new_date = DateRobot.add_date(end_date, 30);
            let new_date_year = new_date.split('-')[0];
            let new_date_month = new_date.split('-')[1];
            let new_date_date = new_date.split('-')[2];
            
            this.data.end_date = {year:Number(new_date_year), month:Number(new_date_month), date:Number(new_date_date)};
            this.data.end_date_text = DateRobot.to_text(new_date_year, new_date_month, new_date_date, SHORT);
            this.render_content();
        });

        let button_year_1 = CComponent.button ("button_year_1", "+ 1년", button_style, ()=>{

            // let start_date = DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date);
            let end_date_ = this.data.end_date == null ? this.data.start_date : this.data.end_date;
            let end_date = DateRobot.to_yyyymmdd(end_date_.year, end_date_.month, end_date_.date);
            if(end_date_.year == "9999"){
                end_date = DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date);
            }

            let new_date = DateRobot.add_date(end_date, 366);
            let new_date_year = new_date.split('-')[0];
            let new_date_month = new_date.split('-')[1];
            let new_date_date = new_date.split('-')[2];
            
            this.data.end_date = {year:Number(new_date_year), month:Number(new_date_month), date:Number(new_date_date)};
            this.data.end_date_text = DateRobot.to_text(new_date_year, new_date_month, new_date_date, SHORT);
            this.render_content();
        });

        let button_no_duration = CComponent.button ("button_no_duration", "소진 시", button_style, ()=>{
            
            this.data.end_date = {year:9999, month:12, date:31};
            this.data.end_date_text = "소진 시까지";
            this.render_content();
        });

        let button_clear = CComponent.button ("button_clear", "지우기", button_style, ()=>{

            this.data.end_date = this.external_data.end_date;
            this.data.end_date_text = this.external_data.end_date_text;
            this.render_content();
        });
        
        let wrapper_style = "display:flex;padding:0px 0 0px 20px;font-size:12px;";
        let divider_style = "flex-basis:1px;height:20px;margin-top:10px;background-color:var(--bg-light);display:none;";
        let html = `<div style="${wrapper_style}">
                        ${button_week_2} <div style="${divider_style}"></div>
                        ${button_month_1} <div style="${divider_style}"></div>
                        ${button_year_1} <div style="${divider_style}"></div>
                        ${button_no_duration} <div style="${divider_style}"></div>
                        ${button_clear}
                    </div>`;

        return html;
    }

    dom_row_refund_date_input(){
        let id = 'member_ticket_refund_date_modify';
        let title = this.data.refund_date == null ||this.data.refund_date == 'None' ? '환불 일자' : this.data.refund_date_text;
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                // let year = this.data.refund_date.split('-')[0]; 
                // let month = this.data.refund_date.split('-')[1];
                // let date = this.data.refund_date.split('-')[2];

                // let year_min = this.data.start_date.split('-')[0];
                // let month_min = this.data.start_date.split('-')[1];
                // let date_min = this.data.start_date.split('-')[2];
                let year = this.data.refund_date.year; 
                let month = this.data.refund_date.month;
                let date = this.data.refund_date.date;

                let year_min = this.data.start_date.year;
                let month_min = this.data.start_date.month;
                let date_min = this.data.start_date.date;
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'일자', data:{year:year, month:month, date:date}, min:{year:year_min, month:month_min, date:date_min}, callback_when_set: (object)=>{ 
                    // this.data.refund_date = DateRobot.to_yyyymmdd(object.data.year, object.data.month, object.data.date);
                    this.data.refund_date = object.data;
                    this.data.refund_date_text = object.text;
                    this.render_content();
                }});
            });
        });
        return html;
    }

    dom_row_refund_price_input(){
        let unit = '';
        let id = 'member_ticket_refund_price_modify';
        let title = this.data.refund_price == null || this.data.refund_price == 'None' ? '' : UnitRobot.numberWithCommas(this.data.refund_price);
        let placeholder = '환불 금액';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text;
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,15}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.data.refund_price = user_input_data;
            this.render_content();
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_count_input(){
        let unit = '';
        let id = 'member_ticket_count_modify';
        let title = this.data.reg_count == null || this.data.reg_count == 'None' ? '' : this.data.reg_count;
        let placeholder = '등록 횟수';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text;
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,15}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.data.reg_count = user_input_data;

        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_price_input(){
        let unit = '';
        let id = 'member_ticket_price_modify';
        let title = this.data.price == null || this.data.price == 'None' ? '' : UnitRobot.numberWithCommas(this.data.price);
        let placeholder = '가격';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text;
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,15}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.data.price = user_input_data;
            this.render_content();
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_note_input(){
        let id = 'member_ticket_note_modify';
        let title = this.data.note == null || this.data.note == 'None' ? '' :this.data.note;
        let placeholder = '특이사항';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text;
        let style = null;
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,:()\\[\\]\\s\\n 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,3000}";
        let pattern_message = "+ - _ : ()[] . , 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_textarea_row(id, title, placeholder, icon, icon_r_visible, icon_r_text, style, (input_data)=>{
            let user_input_data = input_data;
            this.data.note = user_input_data;
            this.render_content();
        }, pattern, pattern_message, required);
        return html;
    }

    send_data(){
        if(this.check_before_send() == false){
            return false;
        }

        let start_date = DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date);
        let end_date = DateRobot.to_yyyymmdd(this.data.end_date.year, this.data.end_date.month, this.data.end_date.date);
        let refund_date = this.data.refund_date == null ? null : DateRobot.to_yyyymmdd(this.data.refund_date.year, this.data.refund_date.month, this.data.refund_date.date);

        let data = {"member_ticket_id":this.data.member_ticket_id, "note":this.data.note, 
                    "start_date":start_date, "end_date":end_date, 
                    "price":this.data.price, "refund_price":this.data.refund_price, 
                    "refund_date":this.data.refund_date == "None" ? "" : refund_date, "member_ticket_reg_count":this.data.reg_count};
        Member_func.ticket_update(data, ()=>{
            layer_popup.close_layer_popup();
            this.set_initial_data();
            try{
                current_page.init();
            }catch(e){}
            try{
                member_view_popup.init();
                member_ticket_history.init();
            }catch(e){}
        });
    }

    upper_right_menu(){
        
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
            return true;
        }
    }
}