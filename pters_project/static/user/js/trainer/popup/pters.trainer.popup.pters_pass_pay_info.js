class Pters_pass_pay_info{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_pters_pass_pay_info_toolbox', content:'section_pters_pass_pay_info_content'};

        this.data = {
            current:{
                product_name:[""],
                card_name:[""],
                pay_method:[""],
                start_date:[""],
                payment_type_cd:[""],
                customer_uid:[""],
            },
            history:null
        };


        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Pters_pass_func.read('Current', (data)=>{
            this.data.current.product_name = data.name;
            this.data.current.card_name = data.card_name;
            this.data.current.pay_method = data.pay_method;
            this.data.current.start_date = data.start_date;
            this.data.current.payment_type_cd = data.payment_type_cd;
            this.data.current.customer_uid = data.customer_uid;
            Pters_pass_func.read('Pay_list', (data)=>{
                this.data.history = data;
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
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();pters_pass_pay_info_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_pters_pass_pay_info .wrapper_top').style.border = 0;
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
        let html =  `<section class="obj_input_box_full" style="border-top:  1px solid #f2f2f2;margin-top: 20px;padding-top: 0;border-bottom: 1px solid #f2f2f2;padding-bottom: 20px;">` +
                        this.dom_row_pay_method() + 
                    '</section>' +
                    `<section class="obj_input_box_full" style="padding-top: 0;padding-bottom: 20px;border:0">` +
                        this.dom_row_pay_history() + 
                    '</section>';

        return html;
    }

    
    


    dom_loading_image(){
        let html = 
            `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;">
                <img src="/static/common/loading.svg">
                
            </div>`;
        return html;
    }


    dom_row_pay_method(){
        let id = "pters_pass_pay_method";
        let card_name = this.data.current.card_name[0];
        let pay_date_info = ``;
        if(this.data.current.payment_type_cd[0] == "PERIOD"){
            pay_date_info = `<span style="display:block;font-size:12px;color:#5c5859">매월 ${this.data.current.start_date[0].split('-')[2]} 일 결제</span>`;
        }else if(this.data.current.payment_type_cd[0] == "SINGLE"){
            pay_date_info = `<span style="display:block;font-size:12px;color:#5c5859">1회권 결제</span>`;
        }
        if(this.data.current.pay_method == 'iap'){
            card_name = '인앱결제';
            pay_date_info = `1회권 결제`;
        }
        let title = `${card_name} ${pay_date_info}`;
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = "변경";
        let style = {"line-height":"20px"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let date = new Date();
            let current_customer_uid = this.data.current.customer_uid[0];
            let product_id = this.data.current.customer_uid[0].split('-')[2];
            let new_merchant_uid = `m_${home.data.user_id}_${product_id}_${date.getTime()}`;
            let new_customer_uid = `c_${home.data.user_id}_${product_id}_${date.getTime()}`;
            let callback = (data)=>{
                let product_name = this.data.current.product_name[0];
                let pay_method = this.data.current.pay_method[0];
                let start_date = data.next_start_date[0];
                let period_month = 1;
                let price = data.price[0];
                Pters_pass_func.request_payment_update(product_name, pay_method, product_id, start_date, current_customer_uid, period_month, price, new_merchant_uid, new_customer_uid)
            };

            Pters_pass_func.ready_payment();
            Pters_pass_func.check_payment_for_update(current_customer_uid, product_id, new_merchant_uid, new_customer_uid, callback);
        });
        let html = row;
        return html;
    }

    dom_row_pay_history(){
        let html;
        if(this.data.history == null){
            return html = this.dom_loading_image();
        }

        let length = this.data.history.name.length;
        let html_to_join = [];
        for(let i=0; i<length; i++){
            let pass_name = this.data.history.name[i].split(' - ')[0];
            let pass_type = PAY_TYPE_NAME[this.data.history.payment_type_cd[i]];
            let pay_date = this.data.history.start_date[i].replace(/-/gi, ' .');
            let pay_method = this.data.history.pay_method[i];
            let pay_price = this.data.history.price[i];
            let pay_status = this.data.history.status[i];
            let pay_failed_reason = this.data.history.fail_reason[i];

            let html = `<article class="pay_history_wrapper">
                            <div class="pay_history_title">${pass_name} (${pass_type})</div>
                            <div>
                                <div class="pass_article_detail_row">
                                    <div>결제일</div><div>${pay_date}</div>
                                </div>
                                <div class="pass_article_detail_row">
                                    <div>결제수단</div><div>${PAY_METHOD[pay_method]}</div>
                                </div>
                                <div class="pass_article_detail_row">
                                    <div>금액</div><div>${UnitRobot.numberWithCommas(pay_price)}원 (부가세 포함)</div>
                                </div>
                                <div class="pass_article_detail_row">
                                    <div>상태</div><div style="color:#fe4e65;font-weight:bold;">${pay_status != "failed" ? PAY_STATUS[pay_status] : PAY_STATUS[pay_status]+' '+ pay_failed_reason}</div>
                                </div>
                            </div>
                        </article>`;
            html_to_join.push(html);
        }

        html_to_join.unshift(
            CComponent.dom_tag(`결제 내역 (${length} 건)`, {"color":"#5c5859", "padding-left":"0", "font-size":"11px", "font-weight":"bold", "margin-top":"16px"})
        );

        html = html_to_join.join("");
        
        return html;
    }



    dom_row_toolbox(){
        let title = '결제 정보';
        let description = ``;
        let html = `
        <div class="pters_pass_pay_info_upper_box" style="">
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
        
        // pters_pass_pay_info_func.update(data, ()=>{
        //     this.set_initial_data();
        //     show_error_message('변경 내용이 저장되었습니다.');
        //     // this.render_content();
        // });
    }

    upper_right_menu(){
        this.send_data();
    }
}
