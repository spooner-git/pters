class Member_add{
    constructor(install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_member_add_toolbox', content:'section_member_add_content'};
        this.data_sending_now = false;
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
                ticket_reg_count:[null],
                ticket_price:[null],
                ticket_payment_price:0,
                pay_method:{value:["NONE"], text:["선택 안함"]},
                start_date:null,
                start_date_text:null,
                end_date:null,
                end_date_text:null
        };
        this.date_start = 0;
        Setting_reserve_func.read((data)=>{
            let date_start_array = {"SUN":0, "MON":1};
            this.date_start = date_start_array[data.setting_week_start_date];
        });

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
        this.data.ticket_reg_count = data.reg_count;
        this.data.ticket_price = data.reg_price;
        this.data.ticket_payment_price = data.reg_price;
        //시작일자가 없는 경우 오늘로 셋팅
        if(this.data.start_date == null){
            this.data.start_date = {year: this.dates.current_year, month:this.dates.current_month, date:this.dates.current_date};
            this.data.start_date_text = DateRobot.to_text(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date, SHORT); 
        }
        //종료일자를 수강권의 기본 유효기간 만큼 시작일자에 더한 날짜로
        if(this.data.ticket_effective_days >= 99999){ //수강권 유효날짜가 -1 (소진시까지)
            this.data.end_date = {year:9999, month:12, date:31};
            this.data.end_date_text = "소진 시까지";
        }else{
            let end_date = DateRobot.to_yyyymmdd(this.start_date.year, this.start_date.month, this.start_date.date);
            let new_date = DateRobot.add_date(end_date, data.effective_days[0]);
            let new_date_year = new_date.split('-')[0];
            let new_date_month = new_date.split('-')[1];
            let new_date_date = new_date.split('-')[2];
    
            this.data.end_date = {year:Number(new_date_year), month:Number(new_date_month), date:Number(new_date_date)};
            this.data.end_date_text = DateRobot.to_text(new_date_year, new_date_month, new_date_date, SHORT);
        }

        this.render_content();
    }

    get ticket(){
        return {id:this.data.ticket_id, name:this.data.ticket_name, effective_days: this.data.ticket_effective_days, reg_count:this.data.reg_count, reg_price:this.data.reg_price};
    }

    set reg_count(number){
        this.data.ticket_reg_count = [number];
        this.render_content();
    }

    get reg_count(){
        return this.data.ticket_reg_count;
    }

    set reg_price(number){
        this.data.ticket_price = [number];
        this.render_content();
    }

    get reg_price(){
        return this.data.ticket_price;
    }
    set payment_price(number){
        this.data.ticket_payment_price = number;
        this.render_content();
    }

    get payment_price(){
        return this.data.ticket_payment_price;
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();member_add_popup.clear();">${CImg.x()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="member_add_popup.send_data()"><span style="color:var(--font-highlight);font-weight: 500;">등록</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

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
        let payment_price = this.dom_row_member_payment_price_input();
        let pay_method = this.dom_row_ticket_pay_method_select();

        let ticket_sub_assembly = "";
        if(this.data.ticket_id.length > 0){
            ticket_sub_assembly =  CComponent.dom_tag('횟수') + reg_count + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                                + CComponent.dom_tag('시작일') + start_date + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                                + CComponent.dom_tag('종료일') + end_date + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                                + CComponent.dom_tag('가격') + reg_price + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                                + CComponent.dom_tag('납부 금액') + payment_price + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                                + CComponent.dom_tag('지불 방법') + pay_method + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                                + CComponent.dom_tag('특이사항') + memo;
        }

        let html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('회원명', null, true) + name + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('휴대폰 번호') + phone + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('생년월일') + birth + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('성별') + sex +
            '</div>' +
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('수강권', null, true) + ticket + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + ticket_sub_assembly +
            '</div>';
        
        if(this.data_from_external != null){ // 재등록
            html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('회원명') + name +
            '</div>' +
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('수강권', null, true) + ticket + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + ticket_sub_assembly +
            '</div>';
        }

        return html;
    }

    dom_row_toolbox(){
        let title = this.data_from_external == null ? '새로운 회원' : '등록';
        let html = `<div class="member_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                        <div style="display:table-cell;width:200px;text-align:right; font-size:13px;" onclick="member_add_popup.popup_device_contacts_list();">
                            주소록
                        </div>
                    </div>`;
        if(this.data_from_external != null){
            html = `<div class="member_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                    </div>`;
        }
        if(device_info != 'app'){
            html = `<div class="member_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                    </div>
                    `;
        }
        return html;
    }

    dom_row_member_name_input(){
        let id = 'input_member_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '회원명';
        let icon = CImg.members();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = this.data_from_external == null ? false : true;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,@一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = ". , + - _ @ 제외 특수문자는 입력 불가";
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
        if(this.data_from_external != null){ //재등록일 경우, 전화번호 일부값이 ***로 넘어오기때문에 패턴에 추가
            pattern = "[0-9*]{10,11}";
        }
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
        let style = this.data.birth == null ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            //행을 클릭했을때 실행할 내용
            if(this.data_from_external != null){ //재등록
                show_error_message({title:"재등록 화면에서는 기본정보를 수정할 수 없습니다."});
                return false;
            }

            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

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
        let style = this.data.sex == null ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            if(this.data_from_external != null){
                show_error_message({title:"재등록 화면에서는 기본정보를 수정할 수 없습니다."});
                return false;
            }

            let user_option = {
                                male:{text:"남성", callback:()=>{this.sex = "M";layer_popup.close_layer_popup();}},
                                female:{text:"여성", callback:()=>{this.sex = "W";layer_popup.close_layer_popup();}}
            };
            let options_padding_top_bottom = 16;
            // let button_height = 8 + 8 + 52;
            let button_height = 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
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
        // let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,@\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        // let pattern_message = "+ - _ @ . , 제외 특수문자는 입력 불가";
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,:()\\[\\]\\s\\n 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,3000}";
        let pattern_message = "+ - _ : ()[] . , 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_textarea_row(id, title, placeholder, icon, icon_r_visible, icon_r_text, style, (input_data)=>{
            this.memo = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_ticket_select(){
        let id = 'input_ticket_select';
        let title = this.data.ticket_id.length == 0 ? '수강권' : this.data.ticket_name.join(', ');
        let icon = CImg.ticket();
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = this.data.ticket_id.length == 0 ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_SELECT, 100, popup_style, null, ()=>{
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
        let title = this.data.start_date == null ? '시작일' : this.data.start_date_text;
        let icon = NONE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = this.data.start_date == null ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.start_date == null ? this.dates.current_year : this.data.start_date.year; 
                let month = this.data.start_date == null ? this.dates.current_month : this.data.start_date.month;
                let date = this.data.start_date == null ? this.dates.current_date : this.data.start_date.date;
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'start_date', title:'시작일', start_day:this.date_start,
                                                                                                data:{year:year, month:month, date:date},
                                                                                                // min:{year:year, month:month, date:date},
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    if(this.data.end_date != null){
                                                                                                        //종료일자가 있을때, 선택한 시작일자가 이 종료일자보다 미래이면 종료일을 시작일과 같도록 한다
                                                                                                        // let compare = DateRobot.compare(
                                                                                                        //     object.data.year+'-'+object.data.month+'-'+object.data.date, 
                                                                                                        //     this.data.end_date.year+'-'+this.data.end_date.month+'-'+this.data.end_date.date
                                                                                                        // );
                                                                                                        // if(compare == true){
                                                                                                        //     this.data.end_date = object.data;
                                                                                                        //     this.data.end_date_text = object.text;
                                                                                                        // }
                                                                                                        if(this.data.ticket_effective_days >= 99999){ //수강권 유효날짜가 99999 (소진시까지)
                                                                                                            // this.data.end_date = {year:9999, month:12, date:31};
                                                                                                            // this.data.end_date_text = "소진 시까지";
                                                                                                        }else{
                                                                                                            let end_date = DateRobot.to_yyyymmdd(object.data.year, object.data.month, object.data.date);
                                                                                                            let new_date = DateRobot.add_date(end_date, this.data.ticket_effective_days);
                                                                                                            let new_date_year = new_date.split('-')[0];
                                                                                                            let new_date_month = new_date.split('-')[1];
                                                                                                            let new_date_date = new_date.split('-')[2];
                                                                                                    
                                                                                                            this.data.end_date = {year:Number(new_date_year), month:Number(new_date_month), date:Number(new_date_date)};
                                                                                                            this.data.end_date_text = DateRobot.to_text(new_date_year, new_date_month, new_date_date, SHORT);
                                                                                                        }
                                                                                                    }
                                                                                                    
                                                                                                    this.start_date = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                }});
            });
        });
        return html;
    }

    dom_row_end_date_select(){
        let diff_date = "";
        if(this.data.start_date != null && this.data.end_date != null && this.data.end_date.year != 9999){
            diff_date =  UnitRobot.numberWithCommas(` / 총 ${DateRobot.diff_date(
                                DateRobot.to_yyyymmdd(this.data.end_date.year, this.data.end_date.month, this.data.end_date.date),
                                DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date)
                                
                         )}일`);
        }
        //등록하는 행을 만든다.
        let id = 'end_date_select';
        let title = this.data.end_date == null ? '종료일' : this.data.end_date_text + diff_date;
        let icon = NONE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = this.data.end_date == null ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{

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

                let min = this.data.start_date != null ? {year:this.data.start_date.year, month:this.data.start_date.month, date: this.data.start_date.date} : null;

                if(Number(year) == 9999){
                    year = this.data.start_date.year;
                    month = this.data.start_date.month;
                    date = this.data.start_date.date;
                }

                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'end_date', title:'종료일', start_day: this.date_start,
                                                                                                data:{year:year, month:month, date:date},  
                                                                                                min:min,
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.end_date = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                }});
            });
        });
        let end_date_simple_input = this.dom_row_end_date_simple_input_machine();
        return html + end_date_simple_input;
    }

    dom_row_end_date_simple_input_machine(){
        // let button_style = {"flex":"1 1 0", "padding":"10px 8px", "color":"var(--font-sub-normal)"};
        let button_style = {"flex":"1 1 0", "padding":"6px 0px", "color":"var(--font-sub-normal)", "background-color":"var(--bg-light)", "border-radius":"3px"};

        let button_week_2 = CComponent.button ("button_week_2", "+ 7일", button_style, ()=>{
            if(this.data.start_date == null){
                show_error_message({title:"시작 일자를 먼저 선택해주세요."});
                return;
            }

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
            if(this.data.start_date == null){
                show_error_message({title:"시작 일자를 먼저 선택해주세요."});
                return;
            }
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
            if(this.data.start_date == null){
                show_error_message({title:"시작 일자를 먼저 선택해주세요."});
                return;
            }
            // let start_date = DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date);
            let end_date_ = this.data.end_date == null ? this.data.start_date : this.data.end_date;
            let end_date = DateRobot.to_yyyymmdd(end_date_.year, end_date_.month, end_date_.date);
            if(end_date_.year == "9999"){
                end_date = DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date);
            }

            let new_date = DateRobot.add_date(end_date, 365);
            let new_date_year = new_date.split('-')[0];
            let new_date_month = new_date.split('-')[1];
            let new_date_date = new_date.split('-')[2];
            
            this.data.end_date = {year:Number(new_date_year), month:Number(new_date_month), date:Number(new_date_date)};
            this.data.end_date_text = DateRobot.to_text(new_date_year, new_date_month, new_date_date, SHORT);
            this.render_content();
        });

        let button_no_duration = CComponent.button ("button_no_duration", "소진 시", button_style, ()=>{
            if(this.data.start_date == null){
                show_error_message({title:"시작 일자를 먼저 선택해주세요."});
                return;
            }
            
            this.data.end_date = {year:9999, month:12, date:31};
            this.data.end_date_text = "소진 시까지";
            this.render_content();
        });

        let button_clear = CComponent.button ("button_clear", "지우기", button_style, ()=>{

            this.data.end_date = null;
            this.data.end_date_text = null;
            this.render_content();
        });
        
        // let wrapper_style = "display:flex;padding:0px 0 0px 20px;font-size:12px;";
        // let divider_style = "flex-basis:1px;height:20px;margin-top:10px;background-color:var(--bg-light);display:none;";
        let wrapper_style = "display:flex;padding:0px 0 0px 40px;font-size:12px;";
        let divider_style = "flex-basis:8px;height:20px;margin-top:10px;background-color:var(--bg-invisible);";
        let html = `<div style="${wrapper_style}">
                        ${button_week_2} <div style="${divider_style}"></div>
                        ${button_month_1} <div style="${divider_style}"></div>
                        ${button_year_1} <div style="${divider_style}"></div>
                        ${button_no_duration} <div style="${divider_style}"></div>
                        ${button_clear}
                    </div>`;

        return html;
    }

    dom_row_member_reg_count_input(){
        let unit = '회';
        let id = 'input_reg_count';
        let title = this.data.ticket_reg_count.length == 0 || this.data.ticket_reg_count[0] == null ? '' : this.data.ticket_reg_count[0];
        let placeholder = '횟수';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = false;
        let pattern = "[0-9]{1,4}";
        let pattern_message = "";
        let required = "required";
        
        if(title >= 99999){
            title = "무제한";
            required = "";
        }

        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            this.reg_count = input_data;
        }, pattern, pattern_message, required);

        let count_simple_input = this.dom_row_count_simple_input_machine();
        return html + count_simple_input;
    }

    dom_row_count_simple_input_machine(){
        // let button_style = {"flex":"1 1 0", "padding":"10px 8px", "color":"var(--font-sub-normal)"};
        let button_style = {"flex":"1 1 0", "padding":"6px 0px", "color":"var(--font-sub-normal)", "background-color":"var(--bg-light)", "border-radius":"3px"};

        let button_limitless = CComponent.button ("button_limitless", "무제한", button_style, ()=>{ this.data.ticket_reg_count[0] = 99999;this.render_content(); });
        let button_50 = CComponent.button ("button_50c", "+ 50회", button_style, ()=>{ this.data.ticket_reg_count[0] = Number(this.data.ticket_reg_count[0]) + 50;this.render_content(); });
        let button_10 = CComponent.button ("button_10c", "+ 10회", button_style, ()=>{ this.data.ticket_reg_count[0] = Number(this.data.ticket_reg_count[0]) + 10;this.render_content(); });
        let button_1 = CComponent.button ("button_1c", "+ 1회", button_style, ()=>{ this.data.ticket_reg_count[0] = Number(this.data.ticket_reg_count[0]) + 1;this.render_content(); });
        let button_delete = CComponent.button ("button_delete_c", "지우기", button_style, ()=>{ this.data.ticket_reg_count[0] = null;this.render_content(); });
        
        // let wrapper_style = "display:flex;padding:0px 0 0px 20px;font-size:12px;";
        // let divider_style = "flex-basis:1px;height:20px;margin-top:10px;background-color:var(--bg-light);display:none;";
        let wrapper_style = "display:flex;padding:0px 0 0px 40px;font-size:12px;";
        let divider_style = "flex-basis:8px;height:20px;margin-top:10px;background-color:var(--bg-invisible);";
        let html = `<div style="${wrapper_style}">
                        ${button_1} <div style="${divider_style}"></div>
                        ${button_10} <div style="${divider_style}"></div>
                        ${button_50} <div style="${divider_style}"></div>
                        ${button_limitless} <div style="${divider_style}"></div>
                        ${button_delete}
                    </div>`;

        return html;
    }

    dom_row_member_reg_price_input(){
        let unit = '원';
        let id = 'input_reg_price';
        let title = this.data.ticket_price.length == 0 || this.data.ticket_price[0] == null ? '' : UnitRobot.numberWithCommas(this.data.ticket_price[0]);
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
        
        let price_simple_input = this.dom_row_price_simple_input_machine();
        return html + price_simple_input;
    }

    dom_row_member_payment_price_input(){
        let unit = '원';
        let id = 'input_payment_price';
        let title = UnitRobot.numberWithCommas(this.data.ticket_payment_price);
        let placeholder = '납부 금액';
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
            this.payment_price = input_data;
        }, pattern, pattern_message, required);

        let price_simple_input = this.dom_row_payment_price_simple_input_machine();
        return html + price_simple_input;
    }

    dom_row_price_simple_input_machine(){
        // let button_style = {"flex":"1 1 0", "padding":"10px 8px", "color":"var(--font-sub-normal)"};
        let button_style = {"flex":"1 1 0", "padding":"6px 0px", "color":"var(--font-sub-normal)", "background-color":"var(--bg-light)", "border-radius":"3px"};

        let button_100 = CComponent.button ("button_100", "+ 100만", button_style, ()=>{ this.data.ticket_price[0] = Number(this.data.ticket_price[0]) + 1000000;this.render_content(); });
        let button_50 = CComponent.button ("button_50", "+ 50만", button_style, ()=>{ this.data.ticket_price[0] = Number(this.data.ticket_price[0]) + 500000;this.render_content(); });
        let button_10 = CComponent.button ("button_10", "+ 10만", button_style, ()=>{ this.data.ticket_price[0] = Number(this.data.ticket_price[0]) + 100000;this.render_content(); });
        let button_1 = CComponent.button ("button_1", "+ 1만", button_style, ()=>{ this.data.ticket_price[0] = Number(this.data.ticket_price[0]) + 10000;this.render_content(); });
        let button_delete = CComponent.button ("button_delete", "지우기", button_style, ()=>{ this.data.ticket_price[0] = null;this.render_content(); });
        
        // let wrapper_style = "display:flex;padding:0px 0 0px 20px;font-size:12px;";
        // let divider_style = "flex-basis:1px;height:20px;margin-top:10px;background-color:var(--bg-light);display:none;";
        let wrapper_style = "display:flex;padding:0px 0 0px 40px;font-size:12px;";
        let divider_style = "flex-basis:8px;height:20px;margin-top:10px;background-color:var(--bg-invisible);";
        let html = `<div style="${wrapper_style}">
                        ${button_100} <div style="${divider_style}"></div>
                        ${button_50} <div style="${divider_style}"></div>
                        ${button_10} <div style="${divider_style}"></div>
                        ${button_1} <div style="${divider_style}"></div>
                        ${button_delete}
                    </div>`;

        return html;
    }

    dom_row_payment_price_simple_input_machine(){
        // let button_style = {"flex":"1 1 0", "padding":"10px 8px", "color":"var(--font-sub-normal)"};
        let button_style = {"flex":"1 1 0", "padding":"6px 0px", "color":"var(--font-sub-normal)", "background-color":"var(--bg-light)", "border-radius":"3px"};
        let button_perfect = CComponent.button ("payment_button_perfect", "완납", button_style, ()=>{ this.data.ticket_payment_price = Number(this.data.ticket_price[0]);this.render_content(); });
        let button_100 = CComponent.button ("payment_button_100", "+ 100만", button_style, ()=>{ this.data.ticket_payment_price = Number(this.data.ticket_payment_price) + 1000000;this.render_content(); });
        let button_50 = CComponent.button ("payment_button_50", "+ 50만", button_style, ()=>{ this.data.ticket_payment_price = Number(this.data.ticket_payment_price) + 500000;this.render_content(); });
        let button_10 = CComponent.button ("payment_button_10", "+ 10만", button_style, ()=>{ this.data.ticket_payment_price = Number(this.data.ticket_payment_price) + 100000;this.render_content(); });
        let button_1 = CComponent.button ("payment_button_1", "+ 1만", button_style, ()=>{ this.data.ticket_payment_price = Number(this.data.ticket_payment_price) + 10000;this.render_content(); });
        let button_delete = CComponent.button ("payment_button_delete", "지우기", button_style, ()=>{ this.data.ticket_payment_price = 0;this.render_content(); });

        // let wrapper_style = "display:flex;padding:0px 0 0px 20px;font-size:12px;";
        // let divider_style = "flex-basis:1px;height:20px;margin-top:10px;background-color:var(--bg-light);display:none;";
        let wrapper_style = "display:flex;padding:0px 0 0px 40px;font-size:12px;";
        let divider_style = "flex-basis:8px;height:20px;margin-top:10px;background-color:var(--bg-invisible);";
        let html = `<div style="${wrapper_style}">
                        ${button_perfect} <div style="${divider_style}"></div>
                        ${button_100} <div style="${divider_style}"></div>
                        ${button_50} <div style="${divider_style}"></div>
                        ${button_10} <div style="${divider_style}"></div>
                        ${button_1} <div style="${divider_style}"></div>
                        ${button_delete}
                    </div>`;

        return html;
    }

    dom_row_ticket_pay_method_select(){
        // let option_data = {
        //     value:["NONE", "CASH", "CARD", "TRANS", "CASH+CARD", "CARD+TRANS", "CASH+TRANS"],
        //     text:["선택 안함", "현금", "카드", "계좌이체", "현금 + 카드", "카드 + 계좌 이체", "현금 + 계좌 이체"]
        // };
        let option_data = {
            value:Object.keys(TICKET_PAY_METHOD),
            text:Object.values(TICKET_PAY_METHOD)
        };

        // console.log(Object.keys(TICKET_PAY_METHOD), Object.values(TICKET_PAY_METHOD))

        let id = 'input_ticket_pay_method_select';
        let title = this.data.pay_method.value[0] == "NONE" ? '지불 방법' : this.data.pay_method.text[0];
        let icon = NONE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = this.data.pay_method.value[0] == "NONE" ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            let title = "지불 방법";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = option_data;
            let selected_data = this.data.pay_method;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.pay_method = set_data;
                    this.render_content();
                });
            });
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
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }

        let recontract = this.data_from_external == null ? OFF : ON;
        let inspect = pass_inspector.member(recontract, this.data.member_id);
        if(inspect.barrier == BLOCKED){
            this.data_sending_now = false;
            let message = {
                title:'회원 등록을 완료하지 못했습니다.',
                comment:`[${inspect.limit_type}] 이용자께서는 회원을 최대 ${inspect.limit_num}명까지 등록하실 수 있습니다.
                        <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까?</p>`
            }
            show_user_confirm (message, ()=>{
                layer_popup.all_close_layer_popup();
                sideGoPopup("pters_pass_main");
            });

            return false;
        }

        if(this.check_before_send() == false){
            this.data_sending_now = false;
            return false;
        }

        let data_for_new = {
                    "member_id":this.data.member_id,
                    "first_name": this.data.name,
                    "name":this.data.name,
                    "phone":this.data.phone,
                    "birthday": `${this.data.birth != null ? this.data.birth.year+'-'+this.data.birth.month+'-'+this.data.birth.date : ''}`,
                    "sex":this.data.sex,
                    "contents":this.data.memo,
                    "ticket_id":this.data.ticket_id[0],
                    "start_date": DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date),
                    "end_date":DateRobot.to_yyyymmdd(this.data.end_date.year, this.data.end_date.month, this.data.end_date.date),
                    "counts":this.data.ticket_reg_count[0],
                    "price":this.data.ticket_price[0],
                    "payment_price":this.data.ticket_payment_price,
                    "pay_method":this.data.pay_method.value[0]
        };

        let data_for_re = {
            "member_id":this.data.member_id,
            "contents":this.data.memo,
            "ticket_id":this.data.ticket_id[0],
            "start_date": DateRobot.to_yyyymmdd(this.data.start_date.year, this.data.start_date.month, this.data.start_date.date),
            "end_date":DateRobot.to_yyyymmdd(this.data.end_date.year, this.data.end_date.month, this.data.end_date.date),
            "counts":this.data.ticket_reg_count[0],
            "price":this.data.ticket_price[0],
            "payment_price":this.data.ticket_payment_price,
            "pay_method":this.data.pay_method.value[0]
        };

        if(this.data_from_external == null){ //신규 회원 등록
            Member_func.create_pre(data_for_new, (received)=>{
                data_for_new.member_id = received.user_db_id[0];
                Member_func.create(data_for_new, ()=>{
                    this.data_sending_now = false;
                    try{
                        current_page.init();
                    }catch(e){}
                }, ()=>{this.data_sending_now = false;});
            }, ()=>{this.data_sending_now = false;});
        }else{ // 재등록
            Member_func.create_ticket_re(data_for_re, ()=>{
                // member_ticket_history.init();
                this.data_sending_now = false;
                try{
                    member_view_popup.set_initial_data();
                }catch(e){
                    console.log(e);
                }
                try{
                    current_page.init();
                }catch(e){
                    console.log(e);
                }
            }, ()=>{this.data_sending_now = false;});
        }

        layer_popup.close_layer_popup();
    }

    check_before_send(){
        let forms = document.getElementById(`${this.form_id}`);
        update_check_registration_form(forms);

        let error_info = check_registration_form(forms);

        if(error_info != ''){
            show_error_message({title:error_info});
            return false;
        }
        else{
            if(this.data.ticket_id.length == 0){
                show_error_message({title:'등록할 수강권을 선택 해주세요.'});
                return false;
            }
            if(this.data.start_date == null){
                show_error_message({title:'시작일을 입력 해주세요.'});
                return false;
            }
            if(this.data.end_date == null){
                show_error_message({title:'종료일을 입력 해주세요.'});
                return false;
            }
            if(this.data.ticket_payment_price > this.data.ticket_price[0]){
                show_error_message({title:'수강권 가격보다 납부금액이 많습니다.'});
                return false;
            }
            
            return true;
        }
    }

    popup_device_contacts_list(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_CONTACTS_SELECT, 100, popup_style, {'member_id':null}, ()=>{
            member_contacts_select = new MemberContactsSelector('#wrapper_box_member_contacts_select', this, '주소록', (set_data)=>{
                this.member = set_data;
                this.data.member_id = set_data.member_id;
                this.data.phone = set_data.phone;
                this.data.name = set_data.name;
                this.render_content();
            });
        });
    }
}