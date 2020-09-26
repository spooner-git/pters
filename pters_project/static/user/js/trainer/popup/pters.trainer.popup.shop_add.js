class Shop_add{
    constructor(install_target, instance){
        this.target = {install: install_target, toolbox:'section_shop_add_toolbox', content:'section_shop_add_content'};
        this.data_sending_now = false;
        this.instance = instance;
        this.form_id = 'id_shop_add_form';

        this.data = {
                name: null,
                price: 0,
                memo: null,
        };

        this.simple_input = {
            price : OFF
        };
        this.init();
    }

    set name(text){
        this.data.name = text;
        this.render_content();
    }

    get name(){
        return this.data.name;
    }

    set price(number){
        this.data.price = number;
        this.render_content();
    }

    get price(){
        return this.data.price;
    }

    set memo(data){
        this.data.memo = data;
        this.render_content();
    }

    get memo(){
        return this.data.memo;
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();shop_add_popup.clear();">${CImg.x()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="shop_add_popup.send_data()"><span style="color:var(--font-highlight);font-weight: 500;">등록</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_shop_add .wrapper_top').style.border = 0;
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
        let name = this.dom_row_shop_name_input();
        let price = this.dom_row_shop_price_input();
        let memo = this.dom_row_shop_memo_input();
        let html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('상품명', null, true) + name + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('가격') + price + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('설명') + memo + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                +'</div>';

        return html;
    }

    dom_row_toolbox(){
        let title = '새로운 상품';
        let html = `<div class="shop_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                    </div>`;
        return html;
    }

    dom_row_shop_name_input(){
        let id = 'input_shop_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '상품명';
        let icon = CImg.members();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,@ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = ". , + - _ @ 제외 특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            this.name = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_shop_price_input(){
        let unit = '원';
        let id = 'ticket_price_view';
        let title = this.data.price == null ? 0 : UnitRobot.numberWithCommas(this.data.price) + unit;
        let placeholder = '0 원';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,8}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{

            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            let user_input_data = input_data;
            this.price = user_input_data;
        }, pattern, pattern_message, required);

        $(document).off('click', `#c_i_n_r_${id}`).on('click', `#c_i_n_r_${id}`, ()=>{
            if(this.simple_input.price == OFF){
                this.simple_input.price = ON;
                this.render_content();
            }
        });

        if(this.simple_input.price == ON){
            html = html + this.dom_row_price_simple_input_machine();
        }

        return html;
    }

    dom_row_price_simple_input_machine(){
        // let button_style = {"flex":"1 1 0", "padding":"10px 8px", "color":"var(--font-sub-normal)"};
        let button_style = {"flex":"1 1 0", "padding":"6px 0px", "color":"var(--font-sub-normal)", "background-color":"var(--bg-light)", "border-radius":"3px"};

        let button_100 = CComponent.button ("button_100", "+ 100만", button_style, ()=>{ this.data.price = Number(this.data.price) + 1000000;this.render_content(); });
        let button_50 = CComponent.button ("button_50", "+ 50만", button_style, ()=>{ this.data.price = Number(this.data.price) + 500000;this.render_content(); });
        let button_10 = CComponent.button ("button_10", "+ 10만", button_style, ()=>{ this.data.price = Number(this.data.price) + 100000;this.render_content(); });
        let button_1 = CComponent.button ("button_1", "+ 1만", button_style, ()=>{ this.data.price = Number(this.data.price) + 10000;this.render_content(); });
        let button_delete = CComponent.button ("button_delete", "지우기", button_style, ()=>{ this.data.price = 0;this.render_content(); });

        // let wrapper_style = "display:flex;padding:0px 0 0px 20px;font-size:12px;";
        // let divider_style = "flex-basis:1px;height:20px;margin-top:10px;background-color:var(--bg-light);display:none;";
        let wrapper_style = "display:flex;padding:0px 0 0px 40px;font-size:12px;";
        let divider_style = "flex-basis:8px;height:20px;margin-top:10px;background-color:var(--bg-invisible);";
        let html = `<div style="${wrapper_style}">
                        ${button_100} <div style="${divider_style}"></div>
                        ${button_50} <div style="${divider_style}"></div>
                        ${button_10} <div style="${divider_style}"></div>
                        ${button_1} <div style="${divider_style}"></div>
                        ${button_delete}
                    </div>`;

        return html;
    }

    dom_row_shop_memo_input(){
        let id = 'input_shop_memo';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '설명';
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
            this.memo = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    send_data(){
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }

        let auth_inspect = pass_inspector.shop_create();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            this.init();
            show_error_message({title:message});
            return false;
        }

        if(this.check_before_send() == false){
            this.data_sending_now = false;
            return false;
        }

        let data_for_new = {
                    "name": this.data.name,
                    "price":this.data.price,
                    "note":this.data.memo,
        };

        Shop_func.create(data_for_new, ()=>{
            this.data_sending_now = false;
            layer_popup.close_layer_popup();
            shop_add_popup.clear();
            try{
                current_page.init();
            }catch(e){}
            try{
                shop_list_popup.init();
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