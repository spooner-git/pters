class Pters_pass_shop_agreement{
    constructor(install_target, product_name, pass_purchase_change){
        this.target = {install: install_target, toolbox:'section_pters_pass_shop_agreement_toolbox', content:'section_pters_pass_shop_agreement_content'};

        this.data = {
            product_name: product_name,
            page:1,
            agreement:OFF,
            pay_method:{
                card:OFF
            },
            pass_purchase_change: pass_purchase_change

        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        // Pters_pass_func.read('Current', (data)=>{
        //     this.data.current = data;
        //     Pters_pass_func.read('Next', (data)=>{
        //         this.data.next = data;
        //         this.render();
        //     });
            
        // });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();pters_pass_shop_agreement_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_pters_pass_shop_agreement .wrapper_top').style.border = 0;
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
        let page1 =  '<article class="obj_input_box_full">' +
                        this.dom_row_pters_pass_agreement_view() + 
                        this.dom_row_pters_pass_agreement_checkbox() + 
                        this.dom_row_pters_pass_button_go_to_page_2() +
                    '</article>';
        let page2 = '<article class="obj_input_box_full">' +
                        this.dom_row_pters_pass_pay_method_checkbox() + 
                        this.dom_row_pters_pass_button_go_to_pay() + 
                        this.dom_row_pters_pass_caution_view() + 
                    '</article>';
        let html = page1;
        if(this.data.page == 2){
            html = page2;
        }

        return html;
    }

    dom_row_pters_pass_agreement_view(){
        let html_agreement = payment_agreement.agreement.KR;
        let html = `<div class="agreement_wrapper">
                        ${html_agreement}
                    </div>`;
        return html;
    }

    dom_row_pters_pass_agreement_checkbox(){
        let id = "pters_pass_agreement_checkbox";
        let checked = this.data.agreement;
        let style = {"display":"inline-block", "margin-right":"8px", "vertical-align":"middle"};
        let onclick = (checked)=>{
            // this.data.agreement = checked;
            // this.render_content();
        };
        let html_checkbox = CComponent.radio_button (id, checked, style, onclick);
        let text = `<span style="font-size:14px;font-weight:bold;line-height:30px;">약관에 동의합니다.</span>`;


        let id2 = "pters_pass_agreement_check";
        let title2 = html_checkbox + text;
        let style2 = null;
        let onclick2 = ()=>{
            this.data.agreement == ON ? this.data.agreement = OFF : this.data.agreement = ON;
            this.render_content();
        };
        let html_assembly = CComponent.text_button (id2, title2, style2, onclick2);


        let html = `<div style="height:30px;line-height:30px;margin:20px 0">` + html_assembly + `</div>`;
        return html;
    }


    dom_row_pters_pass_button_go_to_page_2(){
        let id = "pters_pass_button_go_to_page_2";
        let title = "다음";
        let style = this.data.agreement == OFF 
            ? {"height":"40px", "line-height":"40px", "padding":"0", "font-size":"14px", "font-weight":"500", "background-color":"var(--bg-light)"} 
            : {"height":"40px", "line-height":"40px", "padding":"0", "font-size":"14px", "font-weight":"500", "background-color":"var(--bg-highlight)", "color":"var(--font-invisible)"};
        let onclick = ()=>{
            if(this.data.agreement == OFF){
                show_error_message("약관 동의 후 결제를 진행 할 수 있습니다.");
            }else{
                this.data.page = 2;
                this.render();
            }
        };
        let html_button = CComponent.button (id, title, style, onclick);
        return html_button;
    }

    dom_row_pters_pass_pay_method_checkbox(){
        let id = "pters_pass_pay_method_checkbox";
        let checked = this.data.pay_method.card;
        let style = {"display":"inline-block", "margin-right":"8px", "vertical-align":"middle"};
        let onclick = (checked)=>{
            this.data.pay_method.card = checked;
            this.render_content();
        };
        let html_checkbox = CComponent.radio_button (id, checked, style, onclick);

        let text = `<span style="font-size:14px;font-weight:bold;line-height:30px;">신용카드</span>`;
        // if(device == MOBILE && device_info != 'web' && user_username =='guest'){
        if(user_username =='guest'){
            text = `<span style="font-size:14px;font-weight:bold;line-height:30px;">인앱결제</span>`;
        }
        let id2 = "pters_pass_pay_method_card";
        let title2 = html_checkbox + text;
        let style2 = null;
        let onclick2 = ()=>{
            this.data.pay_method.card == ON ? this.data.pay_method.card = OFF : this.data.pay_method.card = ON;
            this.render_content();
        };
        let html_assembly = CComponent.text_button (id2, title2, style2, onclick2);

        let html = `<div style="height:30px;line-height:30px;margin:20px 0">` + html_assembly + `</div>`;
        return html;
    }

    dom_row_pters_pass_button_go_to_pay(){
        let id = "pters_pass_button_go_to_pay";
        let title = "결제";
        let style= this.data.pay_method.card == OFF
            ? {"height":"40px", "line-height":"40px", "padding":"0", "font-size":"14px", "font-weight":"500", "background-color":"var(--bg-light)"} 
            : {"height":"40px", "line-height":"40px", "padding":"0", "font-size":"14px", "font-weight":"500", "background-color":"var(--bg-highlight)", "color":"var(--font-invisible)"};
        let onclick = ()=>{
            if(this.data.pay_method.card == OFF){
                show_error_message("결제 수단을 선택 해주세요.");
            }else{
                //결제 다날 띄우기
                layer_popup.close_layer_popup();
                this.event_pters_pass_pay();
            }
        };
        let html_button = CComponent.button (id, title, style, onclick);
        return html_button;
    }

    dom_row_pters_pass_caution_view(){
        let html_caution = payment_agreement.caution.KR;
        let html = `<div class="caution_wrapper">
                        ${html_caution}
                    </div>`;
        return html;
    }


    event_pters_pass_pay(){
        let date = new Date();
        let payment_date = DateRobot.to_yyyymmdd(date.getFullYear(), date.getMonth()+1, date.getDate());
        let user_id = home.data.user_id;
        let user_name = home.data.user_name;
        let user_email = home.data.user_email;
        let product_name = PASS_PRODUCT[this.data.product_name].text + ' - 정기 결제 - 1개월';
        let pay_method = CARD;
        let payment_type_cd = PERIOD;
        // if(device == MOBILE && device_info != 'web' && user_username =='guest'){
        if(user_username =='guest'){
            payment_type_cd = SINGLE;
            product_name = PASS_PRODUCT[this.data.product_name].text + ' - 30일';
        }
        let product_id = PASS_PRODUCT[this.data.product_name].id;
        let price = PASS_PRODUCT[this.data.product_name].price;
        let period_month = 1;
        let merchant_uid = `m_${user_id}_${product_id}_${date.getTime()}`;
        let customer_uid = `c_${user_id}_${product_id}_${date.getTime()}`;

        let callback = (data)=>{
            // 결제에 따른 이용권 기간 안내
            let confirm_message = data.next_start_date[0]+" ~ "+data.next_end_date[0]+" 이용권 결제를 진행하시겠습니까?";
            if(payment_date != data.next_start_date[0]){
                if(payment_type_cd == PERIOD){
                    confirm_message = data.next_start_date[0]+" ~ "+data.next_end_date[0]+" 이용권 결제를 예약하시겠습니까? \n" +
                                        "실제 결제는 "+data.next_payment_date[0]+"에 진행됩니다.";
                }
            }

            // 이용권 결제 confirm ok 하는 경우 결제 수행
            show_user_confirm (confirm_message, ()=>{
                // 정기 결제 + 미래 예약 대기인 경우
                if(payment_date != data.next_start_date[0]){
                    if(payment_type_cd == PERIOD){
                        price = 0;
                    }
                }
                layer_popup.close_layer_popup();
                Pters_pass_func.request_payment(product_name, user_email, user_name, pay_method, payment_type_cd, price, merchant_uid, customer_uid, product_id);
            });
        };

        Pters_pass_func.ready_payment();
        Pters_pass_func.check_payment(product_name, pay_method, payment_type_cd, product_id, price, period_month, merchant_uid, customer_uid, callback);

    }


    dom_row_toolbox(){
        let step_text_array = ["약관 동의", "결제 수단"];
        let title = `결제 진행 (${this.data.page}. ${step_text_array[this.data.page-1]})`;
        
        let description = ``;
        let html = `
        <div class="pters_pass_shop_agreement_upper_box" style="">
            <div style="display:inline-block;width:100%;">
                <span style="display:inline-block;width:100%;font-size:23px;font-weight:bold">
                    ${title}
                    ${description}
                </span>
                <span style="display:none">${title}</span>
            </div>
        </div>
        `;
        return html;
    }


    send_data(){
        // let data = {
        //     "setting_member_reserve_time_available":'00:00-23:59', //예약 가능 시간대
        //     "setting_member_reserve_prohibition":this.data.stop_reserve, // 예약 일시 정지
        //     "setting_member_time_duration":this.data.time_for_private_reserve.value[0], //개인 수업 예약 시간
        //     "setting_member_start_time": this.data.start_time_for_private_reserve.value[0], //개인 수업 예약 시작 시각

        //     "setting_member_reserve_date_available":this.data.available_reserve_date.value[0], //예약 가능 날짜
        //     "setting_member_reserve_enable_time":this.data.available_reserve_time.value[0], //예약 가능 시간
        //     "setting_member_reserve_cancel_time":this.data.available_cancel_time.value[0], //예약 취소 가능 시간
            
        // };
        
        // Pters_pass_func.update(data, ()=>{
        //     this.set_initial_data();
        //     show_error_message('변경 내용이 저장되었습니다.');
        //     // this.render_content();
        // });
    }

    upper_right_menu(){
        this.send_data();
    }
}

