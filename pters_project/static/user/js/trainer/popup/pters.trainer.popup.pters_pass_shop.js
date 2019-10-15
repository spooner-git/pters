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
                        '<div class="pters_pass_product_wrapper">' +
                            this.dom_row_pters_pass_standard() + 
                            this.dom_row_pters_pass_standard_explain() +
                        '</div>' +
                        '<div class="pters_pass_product_wrapper">' +
                            this.dom_row_pters_pass_light() + 
                            this.dom_row_pters_pass_light_explain() +
                        '</div>' +
                    '</article>';

        return html;
    }

    dom_row_pters_pass_standard(){
        let id = "pters_pass_standard_ticket";
        let title = "스탠다드 이용권";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = "구매 9,900원";
        let style = {"color":"#fe4e65", "font-weight":"bold", "border-bottom":"1px solid #e8e8e8"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_SHOP_AGREEMENT, 100, POPUP_FROM_BOTTOM, null, ()=>{
                pters_pass_shop_agreement_popup = new Pters_pass_shop_agreement('.popup_pters_pass_shop_agreement');});
        });

        let html = row;
        return html;
    }

    dom_row_pters_pass_standard_explain(){
        let html = `<article class="pters_pass_explain_wrapper">
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">일정</div>
                            <div class="product_explain_row_detail">매일 오늘 기준 전후 1년 등록, 취소</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">회원</div>
                            <div class="product_explain_row_detail">500명</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">수업</div>
                            <div class="product_explain_row_detail">200개</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">수강권</div>
                            <div class="product_explain_row_detail">400개</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">통계</div>
                            <div class="product_explain_row_detail">1년 단위 조회 가능</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">프로그램</div>
                            <div class="product_explain_row_detail">10개</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">설정</div>
                            <div class="product_explain_row_detail">제한 없음</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_pters_pass_light(){
        let id = "pters_pass_standard_ticket";
        let title = "라이트 이용권";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = "구매 4,400원";
        let style = {"color":"#22a900", "font-weight":"bold", "border-bottom":"1px solid #e8e8e8"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_SHOP_AGREEMENT, 100, POPUP_FROM_BOTTOM, null, ()=>{
                pters_pass_shop_agreement_popup = new Pters_pass_shop_agreement('.popup_pters_pass_shop_agreement');});
        });

        let html = row;
        return html;
    }

    dom_row_pters_pass_light_explain(){
        let html = `<article class="pters_pass_explain_wrapper">
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">일정</div>
                            <div class="product_explain_row_detail">매일 오늘 기준 전후 1개월 등록, 취소</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">회원</div>
                            <div class="product_explain_row_detail">50명</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">수업</div>
                            <div class="product_explain_row_detail">20개</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">수강권</div>
                            <div class="product_explain_row_detail">40개</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">통계</div>
                            <div class="product_explain_row_detail">1년 단위 조회 가능</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">프로그램</div>
                            <div class="product_explain_row_detail">3개</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">설정</div>
                            <div class="product_explain_row_detail">제한 없음</div>
                        </div>
                    </article>`;
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

