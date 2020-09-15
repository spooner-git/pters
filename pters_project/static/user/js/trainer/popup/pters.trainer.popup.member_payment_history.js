class Member_payment_history{
    constructor(install_target, member_ticket_id, member_shop_id, callback){
        this.target = {install : install_target};
        this.member_ticket_id = member_ticket_id;
        this.member_shop_id = member_shop_id;
        this.callback = callback;
        this.received_data;
        this.data = null;
        // this.page = 1;

        this.init();

        this.expand = null;
        this.expand_monthly = null;
    }

    init(){
        this.request_list((data)=>{
            this.render(data);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(data){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();member_payment_history.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span id="">결제 내역</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content;
        content = `<section style="margin-top:8px;" id="list_wrap">
                        ${this.dom_list_by_time(data)}
                    </section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list_by_time(received_data){
        let length = 0;
        if(received_data.member_payment_list != undefined){
            length = received_data.member_payment_list.length;
        }
        let html_to_join = [];
        for(let i=0; i<length; i++){
        // for(let i=0; i<length; i++){
            let data = received_data.member_payment_list[i];
            let numbering = data.member_payment_history_idx + '.';
            // let numbering = Number(i+1) + ' 회차';
            let member_payment_id = data.member_payment_history_id;
            let pay_date =  DateRobot.to_text(data.pay_date, '', '', SHORT);
            let memo = data.note;
            let pay_price = data.payment_price;
            let pay_method = TICKET_PAY_METHOD[data.pay_method];
            let payment_status = '납부';
            if(data.refund_price > 0){
                pay_price = data.refund_price;
                payment_status = '환불';
                pay_method = '';
            }
            let onclick = ()=>{
                let user_option = {
                    delete:{text:"결제 내역 삭제", callback:()=>{
                        layer_popup.close_layer_popup();
                        let message = {
                            title:`정말 선택하신 결제 내역을 삭제하시겠습니까?`,
                            comment:`${CImg.warning(["#fe4e65"], {"vertical-align":"middle", "margin-bottom":"4px"})}
                                    <br>
                                    <div style="text-align:center;margin-top:5px; color:var(--font-highlight);">
                                        회원님의 구매 내역이 삭제 됩니다.(매출 내역에서 제외됩니다.)
                                    </div>`
                        };
                        show_user_confirm(message, ()=>{
                            layer_popup.close_layer_popup();
                            Loading.show(`구매 내역을 삭제 중입니다.<br>최대 2~4분까지 소요될 수 있습니다.`);
                            Shop_func.delete_member_payment_history({"member_payment_history_id":member_payment_id}, ()=>{
                                Loading.hide();
                                try{
                                    current_page.init();
                                }catch(e){}
                                try{
                                    member_view_popup.init();
                                }catch(e){}
                                try{
                                    layer_popup.close_layer_popup();
                                }catch(e){}
                                try{
                                    this.init();
                                }catch(e){}
                                layer_popup.close_layer_popup();
                            }, ()=>{Loading.hide();});
                        });
                    }}
                };
                let options_padding_top_bottom = 16;
                // let button_height = 8 + 8 + 52;
                let button_height = 52;
                let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                let root_content_height = $root_content.height();
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                    option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                });
            };
            let row = CComponent.member_payment_history_row (numbering, member_payment_id, payment_status, pay_date, pay_price, pay_method, memo, onclick);
            html_to_join.push(row);
        }
        if(html_to_join.length == 0){
            html_to_join.push(`<div style="font-size:14px;padding:16px;">내역이 없습니다.</div>`);
        }
        return html_to_join.join("");
    }

    request_list (callback){
        let send_data = {"member_ticket_id": this.member_ticket_id, "member_shop_id":this.member_shop_id,
                         "day":''};
        // Member_func.closed_date_list_history(send_data, (data)=>{
        //     // let demo = {max_page: 5, this_page:1};
        //     this.this_page = data.this_page;
        //     this.max_page = data.max_page;
        //
        //     this.received_data = data;
        //     callback(data);
        // });

        Member_func.member_payment_list_history(
            send_data, (data)=> {
                console.log(data.member_payment_list);
                // this.data.member_payment_data = data.member_payment_list;
                this.received_data = data;
                callback(data);
        });
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}



