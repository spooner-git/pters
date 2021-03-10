class Statistics_detail{
    constructor(install_target, target_month_date){
        this.target = {install: install_target, toolbox:'section_statistics_detail_toolbox', content:'section_statistics_detail_content'};
        this.target_month_date = target_month_date;
        this.target_yyyy_mm = `${target_month_date.split('-')[0]}년 ${target_month_date.split('-')[1]}월`;

        this.data = null;
        this.sort_val = SORT_ALL_STATISTICS;
        this.init();
        this.render();
    }

    init(){
        this.set_initial_data();
    }

    set_initial_data (){
        let data = {"month_date": this.target_month_date, "sort_val":this.sort_val};
        Statistics_func.read("sales_detail", data, (data)=>{
            this.data = data;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();statistics_detail_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">${this.target_yyyy_mm}</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content = `<section id="${this.target.content}" class="popup_content">
                            ${this.dom_arrange_select()}
                            ${this.dom_assembly_content()}
                        </section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_statistics_detail .wrapper_top').style.border = 0;

    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }
    
    dom_assembly_content(){
        let html =  this.dom_row_sales_data();
        return html;
    }

    dom_arrange_select(){
        let icon = CImg.arrow_expand(['var(--img-sub1)'], {"vertical-align":"middle"});
        let id = "list_arrange_select";
        let title = "전체"+icon;
        if(this.sort_val == SORT_NONE_STATISTICS){
            title = "결제수단 미입력"+icon;
        }
        else if(this.sort_val == SORT_CASH_STATISTICS){
            title = "현금"+icon;
        }
        else if(this.sort_val == SORT_TRANS_STATISTICS){
            title = "계좌이체"+icon;
        }
        else if(this.sort_val == SORT_CARD_STATISTICS){
            title = "카드"+icon;
        }
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

    switch_type(){
        let user_option = {
            by_total:{text:"전체", callback:()=>{this.sort_val = SORT_ALL_STATISTICS;this.init();layer_popup.close_layer_popup();}},
            by_none:{text:"결제수단 미입력", callback:()=>{this.sort_val = SORT_NONE_STATISTICS;this.init();layer_popup.close_layer_popup();}},
            by_cash:{text:"현금", callback:()=>{this.sort_val = SORT_CASH_STATISTICS;this.init();layer_popup.close_layer_popup();}},
            by_trans:{text:"계좌이체", callback:()=>{this.sort_val = SORT_TRANS_STATISTICS;this.init();layer_popup.close_layer_popup();}},
            by_card:{text:"카드", callback:()=>{this.sort_val = SORT_CARD_STATISTICS;this.init();layer_popup.close_layer_popup();}}
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
    dom_row_sales_data(){
        if(this.data == null){
            let html = `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;">
                            <img src="/static/common/loading.svg">
                            <div style="font-size:12px;color:var(--font-sub-normal);word-break:keep-all">사용자 데이터를 불러오고 있습니다.</div>
                        </div>`;
            return html;
        }

        let length = this.data.date.length;
        let html_to_join = [];

        let _new = 0;
        let _new_num = 0;
        let _re = 0;
        let _re_num = 0;
        let _refund = 0;
        let _refund_num = 0;
        

        for(let i=0; i<length; i++){
            let date = this.data.date[i].replace(/-/gi, " .");
            let type = this.data.trade_info[i];
            let type_cd = this.data.trade_type[i];
            let member = this.data.member_name[i];
            let ticket = this.data.package_name[i];
            let pay_method = this.data.pay_method[i];
            let price = UnitRobot.numberWithCommas(this.data.price[i]);

            if(type_cd == 0){
                _new += Number(this.data.price[i]);
                _new_num += 1;
            }else if(type_cd == 1){
                _re += Number(this.data.price[i]);
                _re_num += 1;
            }else if(type_cd == 2 || type_cd == 3){
                _refund += Number(this.data.price[i]);
                _refund_num += 1;
            }

            let html = `
                    <div class="sales_detail_row">
                        <div class="sales_detail_date">${date}</div>
                        <div class="sales_detail_content">
                            ${type} - ${ticket}
                            <div>${member}</div>
                            <div></div>
                        </div>
                        <div class="sales_detail_price" ${type_cd == 2 || type_cd == 3 ? "style='color:var(--font-highlight)'" : ""}>
                            ${type_cd == 2 || type_cd == 3 ? "-" : ""} ${price} 원
                            <div style="color:var(--font-sub-normal)">${TICKET_PAY_METHOD[pay_method]}</div>
                        </div>
                    </div>
                    `;
            html_to_join.push(html);
        }

        if(html_to_join.length > 0){
            let title_style = `flex-basis:60px;font-weight:500`;
            let number_style = `flex-basis:100px;text-align:left;font-size:13px`;
            let price_style = `flex:1;text-align:right;font-weight:500`;
            html_to_join.unshift(
                `<div style="padding:10px 20px;font-size:14px;box-shadow:var(--box-shadow-article);margin-bottom:10px;">
                    <div style="display:flex">
                        <div style=${title_style}>수강권</div><div style="${number_style}">${_new_num} 건</div><div style="${price_style}">${UnitRobot.numberWithCommas(_new)} 원</div>
                    </div>
                    <div style="display:flex">
                        <div style=${title_style}>부가 상품</div><div style="${number_style}">${_re_num} 건</div><div style="${price_style}">${UnitRobot.numberWithCommas(_re)} 원</div>
                    </div>
                    <div style="display:flex">
                        <div style=${title_style}>환불</div><div style="${number_style}">${_refund_num} 건</div><div style="${price_style};color:#fe4e65">-${UnitRobot.numberWithCommas(_refund)} 원</div>
                    </div>
                    <div style="display:flex;border-top:1px solid var(--bg-light);margin-top:4px;padding-top:4px">
                        <div style=${title_style}>총계</div><div style="${price_style};font-weight:bold;">${UnitRobot.numberWithCommas(_new + _re - _refund)} 원</div>
                    </div>
                </div>`
            );
        }

        if(html_to_join.length == 0){
            html_to_join[0] = `<div class="sales_detail_row">데이터가 없습니다.</div>`;
        }


        return html_to_join.join("");
    }

    // open_type_selector(){
    //     let user_option = {
    //         old:{text:"PTERS 아이디가 있는 회원", callback:()=>{
    //             layer_popup.close_layer_popup();
    //             let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
    //             layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SEARCH, 100, popup_style, null, ()=>{
    //                 member_search_popup = new Member_search('.popup_member_search', null, 'member_search_popup');});
    //         }},
    //         new:{text:"새로운 회원", callback:()=>{
    //             layer_popup.close_layer_popup();
    //             let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
    //             layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_ADD, 100, popup_style, null, ()=>{
    //                 member_add_popup = new Member_add('.popup_member_add', null, 'member_add_popup');});
    //         }}
    //     };
    //     let options_padding_top_bottom = 16;
    //     // let button_height = 8 + 8 + 52;
    //     let button_height = 52;
    //     let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
    //     let root_content_height = $root_content.height();
    //     layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
    //         option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
    //     });
    // }

}

