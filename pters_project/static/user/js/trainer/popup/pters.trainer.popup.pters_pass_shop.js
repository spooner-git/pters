class Pters_pass_shop{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_pters_pass_shop_toolbox', content:'section_pters_pass_shop_content'};

        this.data = {
            current:{
                messageArray:[""],
                buyer_email:[""],
                buyer_name:[""],
                card_name:[""],
                channel:[""],
                currency:[""],
                end_date:[""],
                fail_reason:[""],
                merchandise_type_cd:[""],
                mod_dt:[""],
                name:[""],
                pay_method:[""], //card
                payment_type_cd:[""], //PERIOD, SINGLE
                pg_provider:[""],
                price:[""],
                receipt_url:[""],
                start_date:[""],
                status:[""]
            },
            next:{
                messageArray:[""],
                buyer_email:[""],
                buyer_name:[""],
                card_name:[""],
                channel:[""],
                currency:[""],
                end_date:[""],
                fail_reason:[""],
                merchandise_type_cd:[""],
                mod_dt:[""],
                name:[""],
                pay_method:[""],
                payment_type_cd:[""],
                pg_provider:[""],
                price:[""],
                receipt_url:[""],
                start_date:[""],
                status:[""]
            }
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Pters_pass_func.read('Current', (data)=>{
            this.data.current = data;
            Pters_pass_func.read('Next', (data)=>{
                this.data.next = data;
                this.render();
            });
            
        });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();pters_pass_shop_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_pters_pass_shop .wrapper_top').style.border = 0;
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
        let html =  '<article class="obj_input_box_full">' +
                        this.dom_row_pters_pass_standard() + 
                    '</article>'

        return html;
    }


    // dom_row_pters_pass_standard(){
    //     let id = "pters_pass_standard_ticket";
    //     let title = "스탠다드 이용권";
    //     let icon = DELETE;
    //     let icon_r_visible = SHOW;
    //     let icon_r_text = "";
    //     let style = null;
    //     let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
    //         let date = new Date();
    //         let payment_date = DateRobot.to_yyyymmdd(date.getFullYear(), date.getMonth()+1, date.getDate());
    //         let user_id = home.data.user_id;
    //         let user_name = home.data.user_name;
    //         let user_email = home.data.user_email;
    //         let name = PASS_PRODUCT["standard"].text;
    //         let pay_method = CARD;
    //         let payment_type_cd = PERIOD;
    //         let product_id = PASS_PRODUCT["standard"].id;
    //         let price = PASS_PRODUCT["standard"].price;
    //         let period_month = 1;
    //         let merchant_uid = `m_${user_id}_${product_id}_${date.getTime()}`;
    //         let customer_uid = `c_${user_id}_${product_id}_${date.getTime()}`;

    //         let callback = (data)=>{
    //             // 결제에 따른 이용권 기간 안내
    //             let confirm_message = data.next_start_date[0]+" ~ "+data.next_end_date[0]+" 이용권 결제를 진행하시겠습니까?";
    //             if(payment_date != data.next_start_date[0]){
    //                 if(payment_type_cd == PERIOD){
    //                     confirm_message = data.next_start_date[0]+" ~ "+data.next_end_date[0]+" 이용권 결제를 예약하시겠습니까? \n" +
    //                                         "실제 결제는 "+data.next_start_date[0]+"에 진행됩니다.";
    //                 }
    //             }

    //             // 이용권 결제 confirm ok 하는 경우 결제 수행
    //             show_user_confirm (confirm_message, ()=>{
    //                 // 정기 결제 + 미래 예약 대기인 경우
    //                 if(payment_date != data.next_start_date[0]){
    //                     if(payment_type_cd == PERIOD){
    //                         price = 0;
    //                     }
    //                 }
    //                 layer_popup.close_layer_popup();
    //                 Pters_pass_func.request_payment(name, user_email, user_name, pay_method, payment_type_cd, price, merchant_uid, customer_uid);
    //             });
    //         };

    //         Pters_pass_func.ready_payment();
    //         Pters_pass_func.check_payment(name, pay_method, payment_type_cd, product_id, price, period_month, merchant_uid, customer_uid, callback);
    //     });

    //     let html = row;
    //     return html;
    // }

    dom_row_pters_pass_standard(){
        let id = "pters_pass_standard_ticket";
        let title = "스탠다드 이용권";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_SHOP_AGREEMENT, 100, POPUP_FROM_BOTTOM, null, ()=>{
                pters_pass_shop_agreement_popup = new Pters_pass_shop_agreement('.popup_pters_pass_shop_agreement');});
        });

        let html = row;
        return html;
    }


    dom_row_toolbox(){
        let title = "PTERS 패스 상품";
        
        let description = ``;
        let html = `
        <div class="pters_pass_shop_upper_box" style="">
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
        //     "setting_member_reserve_time_duration":this.data.time_for_private_reserve.value[0], //개인 수업 예약 시간
        //     "setting_member_start_time": this.data.start_time_for_private_reserve.value[0], //개인 수업 예약 시작 시각

        //     "setting_member_reserve_date_available":this.data.available_reserve_date.value[0], //예약 가능 날짜
        //     "setting_member_reserve_time_prohibition":this.data.available_reserve_time.value[0], //예약 가능 시간
        //     "setting_member_cancel_time_prohibition":this.data.available_cancel_time.value[0], //예약 취소 가능 시간
        //     "setting_member_cancel_time":'', //??
            
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

