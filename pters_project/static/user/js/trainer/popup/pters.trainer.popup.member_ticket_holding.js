class Member_ticket_holding{
    constructor(install_target, data, instance){

        this.target = {install: install_target, toolbox:'section_member_ticket_holding_toolbox', content:'section_member_ticket_holding_content'};
        this.instance = instance;
        this.external_data = data;
        this.form_id = 'id_member_ticket_holding_form';

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
            member_ticket_id: null,
            member_ticket_name: null,
            member_ticket_start_date: null,
            member_ticket_end_date: null,
            holding_price: 0,
            holding_start_date: null,
            holding_end_date: null,
            holding_extension_flag: ON,
            note: ""
        };

        this.date_start = 0;
        Setting_reserve_func.read((data)=>{
            let date_start_array = {"SUN":0, "MON":1};
            this.date_start = date_start_array[data.setting_week_start_date];
        });

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
       
        this.init();
        // this.set_initial_data();
    }

    init(){
        // this.render();
        this.set_initial_data();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    set_initial_data (){
        this.data.member_ticket_id = this.external_data.member_ticket_id;
        this.data.holding_start_date = DateRobot.to_yyyymmdd(this.dates.current_year, this.dates.current_month, this.dates.current_date);
        this.data.holding_end_date = DateRobot.to_yyyymmdd(this.dates.current_year, this.dates.current_month, this.dates.current_date);
        this.data.member_ticket_name = this.external_data.member_ticket_name;
        this.data.member_ticket_start_date = this.external_data.member_ticket_start_date;
        this.data.member_ticket_end_date = this.external_data.member_ticket_end_date;
        this.render();
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();member_ticket_holding.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="member_ticket_holding.send_data()"><span style="color:var(--font-highlight);font-weight: 500;">완료</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_member_ticket_holding .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
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

        let holding_start_date = this.dom_row_holding_start_date_input();
        let holding_end_date = this.dom_row_holding_end_date_input();
        let holding_price  = this.dom_row_holding_price_input();
        let holding_ticket    = this.dom_row_holding_ticket_input();
        let holding_note = this.dom_row_holding_note_input();
        let holding_extension_flag = this.dom_row_holding_extension_select();

        let html =
            '<div class="obj_input_box_full">'+
                CComponent.dom_tag('일시정지 시작일') + holding_start_date +
                CComponent.dom_tag('일시정지 종료일') + holding_end_date +
                CComponent.dom_tag('특이사항') + holding_note +
                CComponent.dom_tag('자동 기간 연장') + holding_extension_flag +
                    // `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>`+
                // + CComponent.dom_tag('일시정지 금액') + holding_price +
            '</div>'
                + holding_ticket;

        return html;
    }

    dom_row_toolbox(){
        let title = "수강권 일시정지";
        let html = `<div class="">
                        <div style="display:inline-block;padding-left:60px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">${title}</span>
                            <p style="font-size:11px;color:var(--font-sub-dark);margin:12px 0;">일시정지 시작일부터 종료일까지는 회원님의 예약이 불가능합니다.</p>
                            <span style="display:none;">${title}</span>
                        </div>
                    </div>
                    `;
        return html;
    }

    dom_row_holding_start_date_input(){
        let id = 'member_ticket_start_holding';
        let title = this.data.holding_start_date == null ||this.data.holding_start_date == 'None' ? '일시정지 시작일' : this.data.holding_start_date.replace(/-/gi, '.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.holding_start_date == null ? this.dates.current_year : Number(this.data.holding_start_date.split('-')[0]);
                let month = this.data.holding_start_date == null ? this.dates.current_month : Number(this.data.holding_start_date.split('-')[1]);
                let date = this.data.holding_start_date == null ? this.dates.current_date : Number(this.data.holding_start_date.split('-')[2]);

                let year_min = Number(this.data.member_ticket_start_date.split('-')[0]);
                let month_min = Number(this.data.member_ticket_start_date.split('-')[1]);
                let date_min = Number(this.data.member_ticket_start_date.split('-')[2]);
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'holding_start_date', title:'일시정지 시작일', data:{year:year, month:month, date:date}, min:{year:year_min, month:month_min, date:date_min},callback_when_set: (object)=>{
                    this.data.holding_start_date = DateRobot.to_yyyymmdd(object.data.year, object.data.month, object.data.date);
                    if(this.data.holding_start_date > this.data.holding_end_date){
                        this.data.holding_end_date = DateRobot.to_yyyymmdd(object.data.year, object.data.month, object.data.date);
                    }
                    this.render_content();
                }});
            });
        });
        return html;
    }

    dom_row_holding_end_date_input(){
        let id = 'member_ticket_end_holding';
        let title = this.data.holding_end_date == null ||this.data.holding_end_date == 'None' ? '일시정지 종료일' : this.data.holding_end_date.replace(/-/gi, '.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.holding_end_date == null ? this.dates.current_year : Number(this.data.holding_end_date.split('-')[0]);
                let month = this.data.holding_end_date == null ? this.dates.current_month : Number(this.data.holding_end_date.split('-')[1]);
                let date = this.data.holding_end_date == null ? this.dates.current_date : Number(this.data.holding_end_date.split('-')[2]);
                let year_min = Number(this.data.holding_start_date.split('-')[0]);
                let month_min = Number(this.data.holding_start_date.split('-')[1]);
                let date_min = Number(this.data.holding_start_date.split('-')[2]);

                if(year == 9999){
                    year = year_min;
                    month = month_min;
                    date = date_min;
                }

                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'holding_end_date', title:'일시정지 종료일', data:{year:year, month:month, date:date}, min:{year:year_min, month:month_min, date:date_min},callback_when_set: (object)=>{
                    this.data.holding_end_date = DateRobot.to_yyyymmdd(object.data.year, object.data.month, object.data.date);
                    this.render_content();
                }});
            });
        });
        return html;
    }

    dom_row_holding_note_input(){
        let id = 'member_ticket_note_holding';
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

    dom_row_holding_extension_select(){
        let id = "member_ticket_extension_select";
        let power = this.data.holding_extension_flag;
        let style = {"margin-top":"10px", "margin-left":"40px"};
        let onclick = (on_off)=>{
            this.data.holding_extension_flag = on_off;
            this.render_content();
        };
        let html = CComponent.toggle_button (id, power, style, onclick);
        return html;
    }

    dom_row_holding_price_input(){
        let unit = '';
        let id = 'member_ticket_price_holding';
        let title = this.data.holding_price == null || this.data.holding_price == 'None' ? '' : UnitRobot.numberWithCommas(this.data.holding_price);
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
            
            this.data.holding_price = user_input_data;
            this.render_content();
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_holding_ticket_input(){
        let html = `<div style="display:table;width:100%;font-size:11px;font-weight:500;padding-left:60px;box-sizing:border-box;">
                        <div style="display:table-cell;color:var(--font-sub-normal);width:56px;">수강권명</div>
                        <div style="display:table-cell;color:var(--font-highlight);width:auto;">${this.data.member_ticket_name}</div>
                    </div>
                    <div style="display:table;width:100%;font-size:11px;font-weight:500;padding-left:60px;box-sizing:border-box;">
                        <div style="display:table-cell;color:var(--font-sub-normal);width:56px;">기간</div>
                        <div style="display:table-cell;color:var(--font-highlight);width:auto;">${this.data.member_ticket_start_date} ~ ${this.data.member_ticket_end_date}</div>
                    </div>`;
        return html;
    }

    send_data(){
        if(this.check_before_send() == false){
            return false;
        }
        let data = {"member_ticket_id":this.data.member_ticket_id, "note":this.data.note,
            "price":this.data.holding_price, "start_date":this.data.holding_start_date, "end_date":this.data.holding_end_date, "extension_flag":this.data.holding_extension_flag};

        Member_func.ticket_add_hold(data, ()=>{
            this.set_initial_data();
            try{
                current_page.init();
            }catch(e){}
            try{
                layer_popup.close_layer_popup();
                member_view_popup.init();
                member_ticket_history.init();
            }catch(e){}
            layer_popup.close_layer_popup();
        });
    }

    upper_right_menu(){
        
    }

    check_before_send(){
        if(this.data.member_ticket_id == null){
            return false;
        }else if(this.data.holding_start_date == null){
            show_error_message({title:"일시정지 시작일을 선택해주세요."});
            return false;
        }else if(this.data.holding_end_date == null){
            show_error_message({title:"일시정지 종료일을 선택해주세요."});
            return false;
        }

        let forms = document.getElementById(`${this.form_id}`);
        update_check_registration_form(forms);
        let error_info = check_registration_form(forms);
        if(error_info != ''){
            show_error_message({title:error_info});
            return false;
        }
        else{
            return true;
        }
    }
}