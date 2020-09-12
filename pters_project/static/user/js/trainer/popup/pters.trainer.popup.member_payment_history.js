class Member_payment_history{
    constructor(install_target, member_id, callback){
        this.target = {install : install_target};
        this.member_id = member_id;
        this.callback = callback;
        this.received_data;
        this.data = null;
        // this.page = 1;
        this.sort_val = SORT_SHOP_START_DT;

        this.page_loading_ing = false;
        this.this_page = 1;
        this.max_page;

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
        let top_center = `<span class="icon_center"><span id="">상품 이력</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content;
        content = `<section style="margin-top:8px;" id="list_wrap">
                        ${this.dom_arrange_select()}
                        ${this.dom_list_by_time(data)}
                    </section>`;

        let wrapper_middle_content = this.dom_list_content_wrap(content);
        let html = PopupBase.base(top_left, top_center, top_right, wrapper_middle_content.dom, "");

        document.querySelector(this.target.install).innerHTML = html;
        wrapper_middle_content.install();
    }

    dom_arrange_select(){
        let icon = CImg.arrow_expand(['var(--img-sub1)'], {"vertical-align":"middle"});
        let id = "list_arrange_select";
        let title = "시간순 정렬"+icon;
        let style = {"color": "var(--font-sub-normal)", "font-size":"13px", "font-weight":"500"};
        let onclick = ()=>{
            this.switch_type();
        };
        let dom = CComponent.text_button (id, title, style, onclick);

        let html = `<div style="text-align:right;padding:5px 10px 10px 10px;">
                        ${dom}
                    </div>`;

        return html;
    }

    dom_list_content_wrap(content){
        let wrap_id = "list_by_time_wrap";
        let html = 
            CComp.scroll_container(
                "div",
                `${content}`,
                {height:"100%", "overflow-y":"auto"},
                {id:wrap_id}
            );
        let manual_event_install = ()=>{
            CComp.scroll_container_event_install(wrap_id, ()=>{
                if(this.page_loading_ing == true){
                    return false;
                }
                if(this.this_page == this.max_page){
                    return false;
                }

                this.page_loading_ing = true;
                this.append_loading_image(ON);
                this.this_page++;
                let send_data = {"member_id": this.member_id, "sort_val": this.sort_val, "page": this.this_page};
                Member_func.member_payment_list_history(send_data, (data)=>{
                    this.append_loading_image(OFF);
                    this.append_list(data);
                    this.page_loading_ing = false;
                });
            });
        };
        return {
            dom:html,
            install:()=>{
                manual_event_install();
            }
        };
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
            let numbering = data.member_payment_idx + '.';
            // let numbering = Number(i+1) + ' 회차';
            let member_payment_id = data.member_payment_id;
            let start_date =  DateRobot.to_text(data.start_date, '', '', SHORT);
            let payment_status = MEMBER_PAYMENT_STATUS[data.state_cd];
            let memo = data.note;
            let shop_name = data.shop_name;
            let shop_price = data.shop_price;
            let onclick = ()=>{
                let user_option = {

                    detail:{text:"결제 내역 상세 보기", callback:()=>{
                        layer_popup.close_layer_popup();
                        // 상세 결제 내역 띄우기
                    }},
                    delete:{text:"상품 구매 내역 삭제", callback:()=>{
                        layer_popup.close_layer_popup();

                        let message = {
                            title:`정말 선택하신 상품 구매 내역을 취소하시겠습니까?`,
                            comment:`${CImg.warning(["#fe4e65"], {"vertical-align":"middle", "margin-bottom":"4px"})}
                                    <br>
                                    <div style="text-align:center;margin-top:5px; color:var(--font-highlight);">
                                        회원님의 구매 내역이 일괄 삭제 됩니다.(매출 내역에서 제외됩니다.)
                                    </div>`
                        };
                        show_user_confirm(message, ()=>{
                            layer_popup.close_layer_popup();
                            Loading.show(`${shop_name} 상품 구매 내역을 삭제 중입니다.<br>최대 2~4분까지 소요될 수 있습니다.`);
                            Shop_func.delete_member_payment({"member_payment_id":member_payment_id}, ()=>{
                                Loading.hide();
                                try{
                                    current_page.init();
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
            let row = CComponent.member_payment_history_row (numbering, member_payment_id, start_date, shop_name, shop_price, payment_status, memo, onclick);
            html_to_join.push(row);
        }
        if(html_to_join.length == 0){
            html_to_join.push(`<div style="font-size:14px;padding:16px;">내역이 없습니다.</div>`);
        }
        return html_to_join.join("");
    }

    append_list (data){
        let content = this.dom_list_by_time(data);
        $(`#list_wrap`).append(content);
    }

    append_loading_image(power){
        switch(power){
            case ON:
                $("#list_wrap").append(
                    `<div style="text-align:center;padding-bottom:60px" id="append_loading_image">
                        <img src="/static/common/loading.svg">
                        <div style="font-size:12px;color:var(--font-sub-normal);word-break:keep-all">사용자 데이터를 불러오고 있습니다.</div>
                    </div>`);
                break;
            case OFF:
                $("#append_loading_image").remove();
                break;
        }
    }

    switch_type(){
        let user_option = {
            by_time:{text:"시간순 정렬", callback:()=>{this.sort_val = SORT_SHOP_START_DT;this.init();layer_popup.close_layer_popup();}}
        };
        let options_padding_top_bottom = 16;
        // let button_height = 8 + 8 + 52;
        let button_height = 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    request_list (callback){
        let send_data = {"member_id": this.member_id, "day":'', "sort_val": this.sort_val, "page": this.this_page};
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
                this.this_page = data.this_page;
                this.max_page = data.max_page;
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



