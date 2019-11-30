class Pters_pass_shop{
    constructor(install_target, pass_purchase_change){
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
                status:[""],
                product_id:[""],
                merchant_uid:[""]
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
                status:[""],
                paid_date:[""],
                product_id:[""],
                merchant_uid:[""]
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
        let premium_color = `background-color:#362e2e;`;
        let standard_color = `background-color:#d6424e;`;
        let basic_color = `background-color:#fe4e65;`;
        let html =  '<article class="obj_input_box_full">' +
                        `<div class="pters_pass_product_wrapper" style="${basic_color}" onclick="pters_pass_shop_popup.event_buy('basic')">` +
                            this.dom_row_pters_pass_basic() +
                            this.dom_row_pters_pass_basic_explain() +
                        '</div>' +
                        `<div class="pters_pass_product_wrapper" style="${standard_color}" onclick="pters_pass_shop_popup.event_buy('standard')">` +
                            this.dom_row_pters_pass_standard() +
                            this.dom_row_pters_pass_standard_explain() +
                        '</div>' +
                        `<div class="pters_pass_product_wrapper" style="${premium_color}" onclick="pters_pass_shop_popup.event_buy('premium')">` +
                            this.dom_row_pters_pass_premium() +
                            this.dom_row_pters_pass_premium_explain() +
                        '</div>' +
                    '</article>';
        if(os == IOS && user_username =='guest'){
            html =  '<article class="obj_input_box_full">' +
                        `<div class="pters_pass_product_wrapper" style="${premium_color}" onclick="pters_pass_shop_popup.event_buy('premium')">` +
                            this.dom_row_pters_pass_premium() +
                            this.dom_row_pters_pass_premium_explain() +
                        '</div>' +
                    '</article>';
        }
        else if(os == ANDROID && user_username =='guest') {
            html =  '<article class="obj_input_box_full">' +
                        `<div class="pters_pass_product_wrapper" style="${premium_color}" onclick="pters_pass_shop_popup.event_buy('premium')">` +
                            this.dom_row_pters_pass_premium() +
                            this.dom_row_pters_pass_premium_explain() +
                        '</div>' +
                    '</article>';
        }
        if(this.data.pass_purchase_change == PASS_CHANGE){
            if(this.data.next.name[0] != ""){
                html =  '<article class="obj_input_box_full">';
                if(this.data.next.product_id[0] != PASS_PRODUCT.basic.id){
                    html +=
                        `<div class="pters_pass_product_wrapper" style="${basic_color}" onclick="pters_pass_shop_popup.event_buy('basic')">` +
                            this.dom_row_pters_pass_basic() +
                            this.dom_row_pters_pass_basic_explain() +
                        '</div>';
                }
                if(this.data.next.product_id[0] != PASS_PRODUCT.standard.id){
                    html +=
                        `<div class="pters_pass_product_wrapper" style="${standard_color}" onclick="pters_pass_shop_popup.event_buy('standard')">` +
                            this.dom_row_pters_pass_standard() +
                            this.dom_row_pters_pass_standard_explain() +
                        '</div>';
                }
                if(this.data.next.product_id[0] != PASS_PRODUCT.premium.id){
                    html +=
                        `<div class="pters_pass_product_wrapper" style="${premium_color}" onclick="pters_pass_shop_popup.event_buy('premium')">` +
                            this.dom_row_pters_pass_premium() +
                            this.dom_row_pters_pass_premium_explain() +
                        '</div>';
                }

                html += '</article>';
            }
        }
        return html;
    }

    dom_row_pters_pass_premium(){
        let unit = ' / 매월';
        if(user_username =='guest'){
            unit = "/ 30일";
        }
        let id = "pters_pass_premium_ticket";
        let title = `<div style='font-size:12px;font-weight:500;margin-bottom:10px'>프리미엄</div>
                    <span style="font-size:32px;font-weight:900">&#8361; 9,900</span><span style="font-size:13px">${unit}</span>
                    `;
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        if(this.data.pass_purchase_change == PASS_CHANGE) {
            if (this.data.next.name[0] != "") {
                title = `<div style='font-size:12px;font-weight:500;margin-bottom:10px'>프리미엄</div>
                    <div>
                    <span style="font-size:32px;font-weight:900">&#8361; 9,900</span><span style="font-size:13px"> ${unit}</span>
                    </div>
                    <div>
                        <span style="font-size:15px;font-weight:900">${this.check_pass_next_paid_date(9900)} 일부터 결제가 진행됩니다.</span>
                    </div>
                    `;
            }
        }
        // if(device == MOBILE && device_info != 'web' && user_username =='guest'){
        
        let style = {"color":"var(--fundamental-white)", "font-weight":"bold", "height":"auto", "cursor":"unset"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            // this.event_buy("premium");
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
        let title = `<div style='font-size:12px;font-weight:500;margin-bottom:10px'>스탠다드 <div style="float:right;display:inline-block;text-align:center;box-sizing:border-box;width:40px;height:20px;line-height:20px;font-size:11px;border-radius: 12px;font-weight:bold;border:1px solid #ffffff;">추천</div></div>
                    <span style="font-size:32px;font-weight:900">&#8361; 6,900</span><span style="font-size:13px">${unit}</span>
                    `;
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        if(this.data.pass_purchase_change == PASS_CHANGE) {
            if (this.data.next.name[0] != "") {
            title = `<div style='font-size:12px;font-weight:500;margin-bottom:10px'>스탠다드 <div style="float:right;display:inline-block;text-align:center;box-sizing:border-box;width:40px;height:20px;line-height:20px;font-size:11px;border-radius: 12px;font-weight:bold;border:1px solid #ffffff;">추천</div></div>
                    <div>
                    <span style="font-size:32px;font-weight:900">&#8361; 6,900</span><span style="font-size:13px"> ${unit}</span>
                    </div>
                    <div>
                        <span style="font-size:15px;font-weight:900">-> ${this.check_pass_next_paid_date(6900)} 일부터 결제가 진행됩니다.</span>
                    </div>
                    `;
            }
        }
        // if(device == MOBILE && device_info != 'web' && user_username =='guest'){
        
        let style = {"color":"var(--fundamental-white)", "font-weight":"bold", "height":"auto", "cursor":"unset"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            // this.event_buy("standard");
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
        let title = `<div style='font-size:12px;font-weight:500;margin-bottom:10px'>베이직</div>
                    <span style="font-size:32px;font-weight:900">&#8361; 3,900</span><span style="font-size:13px">${unit}</span>
                    `;
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        if(this.data.pass_purchase_change == PASS_CHANGE) {
            if (this.data.next.name[0] != "") {
                title = `<div style='font-size:12px;font-weight:500;margin-bottom:10px'>베이직</div>
                        <div>
                        <span style="font-size:32px;font-weight:900">&#8361; 3,900</span><span style="font-size:13px"> ${unit}</span>
                        </div>
                        <div>
                            <span style="font-size:15px;font-weight:900">-> ${this.check_pass_next_paid_date(3900)} 일부터 결제가 시작됩니다.</span>
                        </div>
                    `;
            }
        }
        let style = {"color":"var(--fundamental-white)", "font-weight":"bold", "height":"auto", "cursor":"unset"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            // this.event_buy("basic");
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

    event_buy(product){
        let pass_purchase_change = this.data.pass_purchase_change;

        if(pass_purchase_change == PASS_CHANGE){
            if(this.data.current.merchant_uid[0] == ""){
                show_error_message('다음 결제일까지 변경이 불가능합니다.');
                return false;
            }
            show_user_confirm ('PTERS 패스 상품을 즉시 변경하시겠습니까? <br/> 변경하시면 다음 결제일까지 변경이 불가능합니다.', ()=>{
                // 정기 결제 + 미래 예약 대기인 경우
                let date = new Date();
                let user_id = home.data.user_id;
                let product_name = PASS_PRODUCT[product].text + ' - 정기 결제 - 1개월';
                let merchant_uid = `m_${user_id}_${PASS_PRODUCT[product].id}_${date.getTime()}`;
                this.request_payment_change(product, product_name, merchant_uid);
            });
        }
        if(pass_purchase_change == PASS_PURCHASE){
            switch(product){
                case "basic":
                        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_SHOP_AGREEMENT, 100, POPUP_FROM_BOTTOM, null, ()=>{
                            pters_pass_shop_agreement_popup = new Pters_pass_shop_agreement('.popup_pters_pass_shop_agreement', "basic", pass_purchase_change);
                        });
                    break;
                case "standard":
                        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_SHOP_AGREEMENT, 100, POPUP_FROM_BOTTOM, null, ()=>{
                            pters_pass_shop_agreement_popup = new Pters_pass_shop_agreement('.popup_pters_pass_shop_agreement', "standard", pass_purchase_change);
                        });
                    break;
                case "premium":
                        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_SHOP_AGREEMENT, 100, POPUP_FROM_BOTTOM, null, ()=>{
                            pters_pass_shop_agreement_popup = new Pters_pass_shop_agreement('.popup_pters_pass_shop_agreement', "premium", pass_purchase_change);
                        });
                    break;
            }
        }
    }


    dom_row_toolbox(){
        let title = "PTERS 패스 구독";
        if(this.data.pass_purchase_change == PASS_CHANGE){
            title = "PTERS 패스 변경";
        }
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

    check_pass_next_paid_date(next_price){
        let d = new Date();
        let today = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        let diff_date = Math.abs(DateRobot.diff_date(today, this.data.current.end_date[0]));
        let product_price = 3900;
        if(PASS_PRODUCT.basic.id==this.data.current.product_id[0]){
            product_price = PASS_PRODUCT.basic.price;
        }
        if(PASS_PRODUCT.standard.id==this.data.current.product_id[0]){
            product_price = PASS_PRODUCT.standard.price;
        }
        if(PASS_PRODUCT.premium.id==this.data.current.product_id[0]){
            product_price = PASS_PRODUCT.premium.price;
        }
        let one_day_current_price = parseInt(product_price/31);
        let one_day_next_price = parseInt(next_price/31);
        let next_paid_date = parseInt(one_day_current_price * diff_date / one_day_next_price);

        return DateRobot.add_date(today, next_paid_date);
    }
    request_payment_change(update_product_name, update_product_full_name, update_merchant_uid){

        let product_id = PASS_PRODUCT[update_product_name].id;
        let price = PASS_PRODUCT[update_product_name].price;

        $.ajax({
            url: "/payment/update_payment_product_info/", // 서비스 웹서버
            method: "POST",
            data: {
                "update_product_id" : product_id,
                "update_product_name" : update_product_full_name,
                "update_product_price" :  price,
                "update_merchant_uid" : update_merchant_uid,
                "update_date" : this.check_pass_next_paid_date(price)},
            dataType: "html",

            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                let msg;
                check_app_version(jsondata.app_version);

                if(jsondata.messageArray.length>0){
                    msg = '결제 정보 변경에 실패했습니다.';
                    msg += '에러내용 : ' + jsondata.messageArray;
                }else {
                    msg = '결제 정보 변경이 완료되었습니다.';
                }
                show_error_message(msg);
                layer_popup.close_layer_popup();
                setTimeout(()=>{
                    window.location.reload(true);
                }, 1000);
                //
            },

            complete:function(){
            },

            error:function(){
                console.log('server error');
            }
        });
    }
}

