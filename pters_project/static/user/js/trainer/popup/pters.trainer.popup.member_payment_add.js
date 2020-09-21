class Member_Payment_add{
    constructor(install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_member_payment_add_toolbox', content:'section_member_payment_add_content'};
        this.data_sending_now = false;
        this.instance = instance;
        this.data_from_external = data_from_external;
        this.form_id = 'id_member_payment_add_form';

        let d = new Date();
        this.dates = {
            current_year: d.getFullYear(),
            current_month: d.getMonth()+1,
            current_date: d.getDate()
        };

        this.data = {
                member_id: null,
                member_shop_id: null,
                member_ticket_id: null,
                pay_method:{value:["NONE"], text:["선택 안함"]},
                shop_price:0,
                current_price:0,
                payment_price:0,
                refund_price:0,
                note:null,
                pay_date:null,
                pay_date_text:null,
                state_cd: OFF
        };

        if(this.data.pay_date == null){
            this.data.pay_date = {year: this.dates.current_year, month:this.dates.current_month, date:this.dates.current_date};
            this.data.pay_date_text = DateRobot.to_text(this.data.pay_date.year, this.data.pay_date.month, this.data.pay_date.date, SHORT);
        }
        this.date_start = 0;
        Setting_reserve_func.read((data)=>{
            let date_start_array = {"SUN":0, "MON":1};
            this.date_start = date_start_array[data.setting_week_start_date];
        });

        this.simple_input = {
            payment_price : OFF,
            refund_price : OFF
        };
        console.log(this.data_from_external.member_id);
        this.data.member_id = this.data_from_external.member_id;
        this.data.member_ticket_id = this.data_from_external.member_ticket_id;
        this.data.member_shop_id = this.data_from_external.member_shop_id;
        this.data.shop_price = this.data_from_external.shop_price;
        this.data.current_price = this.data_from_external.current_price;
        this.init();
    }

    set shop_price(number){
        this.data.shop_price = number;
        this.render_content();
    }
    get shop_price(){
        return this.data.shop_price;
    }

    set payment_price(number){
        this.data.payment_price = number;
        this.render_content();
    }
    get payment_price(){
        return this.data.payment_price;
    }

    set refund_price(number){
        this.data.refund_price = number;
        this.render_content();
    }
    get refund_price(){
        return this.data.refund_price;
    }

    set note(data){
        this.data.note = data;
        this.render_content();
    }

    get note(){
        return this.data.note;
    }

    set pay_date(data){
        this.data.pay_date = data.data;
        this.data.pay_date_text = data.text;
        this.render_content();
    }

    get pay_date(){
        return this.data.pay_date;
    }
    init(){

        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    set_initial_data(data){
        if(data == null){
            return null;
        }
        this.init();

    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();member_payment_add_popup.clear();">${CImg.x()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="member_payment_add_popup.send_data()"><span style="color:var(--font-highlight);font-weight: 500;">등록</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_member_payment_add .wrapper_top').style.border = 0;
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
        let pay_date = this.dom_row_pay_date_select();
        let current_price = this.dom_row_member_current_price_input();
        let memo = this.dom_row_member_payment_memo_input();
        let payment_price = this.dom_row_member_payment_price_input();
        let pay_method = this.dom_row_shop_pay_method_select();

        let shop_sub_assembly = CComponent.dom_tag('가격 / 기 납부 금액') + current_price + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                              + CComponent.dom_tag('날짜') + pay_date + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                              + CComponent.dom_tag('납부 금액') + payment_price + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                              + CComponent.dom_tag('지불 방법') + pay_method + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                              + CComponent.dom_tag('특이사항') + memo;
        let html =
            '<div class="obj_input_box_full">'
                + shop_sub_assembly +
            '</div>';

        return html;
    }

    dom_row_toolbox(){
        let title = '결제 내역 추가';
        let html = `<div class="member_payment_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                    </div>`;
        return html;
    }

    dom_row_member_current_price_input(){
        let id = 'input_member_current_price';
        let title = UnitRobot.numberWithCommas(this.data.shop_price) + '원 / ' + UnitRobot.numberWithCommas(this.data.current_price) + '원';
        let placeholder = '가격 / 기 납부 금액';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = true;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:.,\\s / 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ : ., 제외 특수문자는 입력 불가";
        let required = false;
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_member_payment_price_input(){
        let unit = '원';
        let id = 'input_payment_price';
        let title = UnitRobot.numberWithCommas(this.data.payment_price);
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

    dom_row_payment_price_simple_input_machine(){
        // let button_style = {"flex":"1 1 0", "padding":"10px 8px", "color":"var(--font-sub-normal)"};
        let button_style = {"flex":"1 1 0", "padding":"6px 0px", "color":"var(--font-sub-normal)", "background-color":"var(--bg-light)", "border-radius":"3px"};
        let button_perfect = CComponent.button ("payment_button_perfect", "완납", button_style, ()=>{ this.data.payment_price = Number(this.data.shop_price) - Number(this.data.current_price);this.render_content(); });
        let button_100 = CComponent.button ("payment_button_100", "+ 100만", button_style, ()=>{ this.data.payment_price = Number(this.data.payment_price) + 1000000;this.render_content(); });
        let button_50 = CComponent.button ("payment_button_50", "+ 50만", button_style, ()=>{ this.data.payment_price = Number(this.data.payment_price) + 500000;this.render_content(); });
        let button_10 = CComponent.button ("payment_button_10", "+ 10만", button_style, ()=>{ this.data.payment_price = Number(this.data.payment_price) + 100000;this.render_content(); });
        let button_1 = CComponent.button ("payment_button_1", "+ 1만", button_style, ()=>{ this.data.payment_price = Number(this.data.payment_price) + 10000;this.render_content(); });
        let button_delete = CComponent.button ("payment_button_delete", "지우기", button_style, ()=>{ this.data.payment_price = 0;this.render_content(); });

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

    dom_row_member_payment_memo_input(){
        let id = 'input_member_payment_memo';
        let title = this.data.note == null ? '' : this.data.note;
        let placeholder = '특이사항';
        let icon = CImg.memo();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:.,\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ : ., 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.note = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_pay_date_select(){
        //등록하는 행을 만든다.
        let id = 'id_pay_date_select';
        let title = this.data.pay_date == null ? '날짜' : this.data.pay_date_text;
        let icon = NONE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = this.data.pay_date == null ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            //행을 클릭했을때 실행할 내용
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.pay_date == null ? this.dates.current_year : this.data.pay_date.year;
                let month = this.data.pay_date == null ? this.dates.current_month : this.data.pay_date.month;
                let date = this.data.pay_date == null ? this.dates.current_date : this.data.pay_date.date;

                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'pay_date', title:'시작일', pay_date:this.date_start,
                                                                                                data:{year:year, month:month, date:date},
                                                                                                // min:{year:year, month:month, date:date},
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.pay_date = object;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                }});
            });
        });
        return html;
    }

    dom_row_shop_pay_method_select(){
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

    send_data(){
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }

        let inspect = pass_inspector.shop();
        if(inspect.barrier == BLOCKED){
            this.data_sending_now = false;
            let message = {
                title:'결제 내역 등록을 완료하지 못했습니다.',
                comment:`[${inspect.limit_type}] 이용자께서는 상품을 최대 ${inspect.limit_num}개 까지 등록하실 수 있습니다.
                        <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까?</p>`
            };
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

        let state_cd = 'NP';
        if(this.data.shop_price <= this.data.current_price + this.data.payment_price){
            state_cd = 'PE';
        }
        else if(this.data.shop_price > this.data.current_price + this.data.payment_price){
            state_cd = 'IP';
        }
        if(this.data.state_cd == ON){
            state_cd = 'RF';
        }
        let data_for_new = {
            "member_id": this.data.member_id,
            "member_shop_id": this.data.member_shop_id,
            "payment_price": this.data.payment_price,
            "refund_price": this.data.refund_price,
            "pay_method": this.data.pay_method.value[0],
            "pay_date":  DateRobot.to_yyyymmdd(this.data.pay_date.year, this.data.pay_date.month, this.data.pay_date.date),
            "note":this.data.note,
            "state_cd": state_cd
        };
        if(this.data.member_ticket_id != null){
            data_for_new = {
                "member_id": this.data.member_id,
                "member_ticket_id": this.data.member_ticket_id,
                "payment_price": this.data.payment_price,
                "refund_price": this.data.refund_price,
                "pay_method": this.data.pay_method.value[0],
                "pay_date":  DateRobot.to_yyyymmdd(this.data.pay_date.year, this.data.pay_date.month, this.data.pay_date.date),
                "note":this.data.note,
                "state_cd": state_cd
            };
        }

        Shop_func.create_member_shop_payment_history(data_for_new, ()=>{
            this.data_sending_now = false;
            layer_popup.close_layer_popup();
            member_payment_add_popup.clear();
            try{
                current_page.init();
            }catch(e){}
            try{
                member_view_popup.init();
            }catch(e){}
            try{
                layer_popup.close_layer_popup();
            }catch(e){}
        }, ()=>{this.data_sending_now = false;});

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
            return true;
        }
    }

}