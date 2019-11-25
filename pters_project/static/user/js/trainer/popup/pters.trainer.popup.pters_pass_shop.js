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
                func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
            });
            
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();pters_pass_shop_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
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
                        '<div class="pters_pass_product_wrapper" style="background-color:#ff8595;">' +
                            this.dom_row_pters_pass_basic() +
                            this.dom_row_pters_pass_basic_explain() +
                        '</div>' +
                        '<div class="pters_pass_product_wrapper" style="background-color:#fe4e65;">' +
                            this.dom_row_pters_pass_standard() +
                            this.dom_row_pters_pass_standard_explain() +
                        '</div>' +
                        '<div class="pters_pass_product_wrapper" style="background-color:#000000;">' +
                            this.dom_row_pters_pass_premium() +
                            this.dom_row_pters_pass_premium_explain() +
                        '</div>' +
                    '</article>';
        return html;
    }

    dom_row_pters_pass_premium(){
        let unit = ' / 매월';
        if(user_username =='guest'){
            unit = "/ 30일";
        }
        let id = "pters_pass_premium_ticket";
        let title = `<span style='font-size:12px;font-weight:500'>프리미엄</span><br>
                    <span style="font-size:32px;font-weight:900">&#8361; 9,900</span><span style="font-size:13px">${unit}</span>`;
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = '<span style="color:var(--fundamental-white)">구매</span> ' + CImg.arrow_right(["var(--fundamental-white)"], {"vertical-align":"middle"});

        // if(device == MOBILE && device_info != 'web' && user_username =='guest'){
        
        let style = {"color":"var(--fundamental-white)", "font-weight":"bold", "height":"auto"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_SHOP_AGREEMENT, 100, POPUP_FROM_BOTTOM, null, ()=>{
                pters_pass_shop_agreement_popup = new Pters_pass_shop_agreement('.popup_pters_pass_shop_agreement', "premium");});
        });

        let html = row;
        return html;
    }

    dom_row_pters_pass_premium_explain(){
        let html = `<article class="pters_pass_explain_wrapper">
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 일정</div>
                            <div class="product_explain_row_detail">매일 오늘 기준 전후 1년 등록, 취소</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 회원</div>
                            <div class="product_explain_row_detail">500명</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 통계</div>
                            <div class="product_explain_row_detail">1년 단위 조회 가능</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 프로그램</div>
                            <div class="product_explain_row_detail">10개</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 설정</div>
                            <div class="product_explain_row_detail">제한 없음</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_pters_pass_standard(){
        let unit = ' / 매월';
        if(user_username =='guest'){
            unit = "/ 30일";
        }
        let id = "pters_pass_standard_ticket";
        let title = `<span style='font-size:12px;font-weight:500'>스탠다드</span><br>
                    <span style="font-size:32px;font-weight:900">&#8361; 6,900</span><span style="font-size:13px">${unit}</span>`;
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = '<span style="color:var(--fundamental-white)">구매</span> ' + CImg.arrow_right(["var(--fundamental-white)"], {"vertical-align":"middle"});

        // if(device == MOBILE && device_info != 'web' && user_username =='guest'){
        
        let style = {"color":"var(--fundamental-white)", "font-weight":"bold", "height":"auto"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_SHOP_AGREEMENT, 100, POPUP_FROM_BOTTOM, null, ()=>{
                pters_pass_shop_agreement_popup = new Pters_pass_shop_agreement('.popup_pters_pass_shop_agreement', "standard");});
        });

        let html = row;
        return html;
    }

    dom_row_pters_pass_standard_explain(){
        let html = `<article class="pters_pass_explain_wrapper">
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 일정</div>
                            <div class="product_explain_row_detail">매일 오늘 기준 전후 1년 등록, 취소</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 회원</div>
                            <div class="product_explain_row_detail">100명</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 통계</div>
                            <div class="product_explain_row_detail">1년 단위 조회 가능</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 프로그램</div>
                            <div class="product_explain_row_detail">5개</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 설정</div>
                            <div class="product_explain_row_detail">제한 없음</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_pters_pass_basic(){
        let unit = ' / 매월';
        if(user_username =='guest'){
            unit = "/ 30일";
        }
        let id = "pters_pass_basic_ticket";
        let title = `<span style='font-size:12px;font-weight:500'>베이직</span><br>
                    <span style="font-size:32px;font-weight:900">&#8361; 3,900</span><span style="font-size:13px">${unit}</span>`;
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = '<span style="color:var(--fundamental-white)">구매</span> ' + CImg.arrow_right(["var(--fundamental-white)"], {"vertical-align":"middle"});
        
        let style = {"color":"var(--fundamental-white)", "font-weight":"bold", "height":"auto"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_SHOP_AGREEMENT, 100, POPUP_FROM_BOTTOM, null, ()=>{
                pters_pass_shop_agreement_popup = new Pters_pass_shop_agreement('.popup_pters_pass_shop_agreement', "basic");});
        });

        let html = row;
        return html;
    }

    dom_row_pters_pass_basic_explain(){
        let html = `<article class="pters_pass_explain_wrapper">
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 일정</div>
                            <div class="product_explain_row_detail">매일 오늘 기준 전후 31일 등록, 취소</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 회원</div>
                            <div class="product_explain_row_detail">30명</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 통계</div>
                            <div class="product_explain_row_detail">3개월 단위 조회 가능</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 프로그램</div>
                            <div class="product_explain_row_detail">2개</div>
                        </div>
                        <div class="product_explain_row">
                            <div class="product_explain_row_title">${CImg.confirm(["var(--fundamental-white)"], {"vertical-align":"middle", "width":"17px", "margin-right":"5px"})} 설정</div>
                            <div class="product_explain_row_detail">제한 없음</div>
                        </div>
                    </article>`;
        return html;
    }


    dom_row_toolbox(){
        let title = "PTERS 패스 구독";
        
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

