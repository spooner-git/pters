class Shop_view{
    constructor(install_target, shop_id, instance, readonly){
        this.target = {install: install_target, toolbox:'section_shop_view_toolbox', content:'section_shop_view_content'};
        this.data_sending_now = false;
        this.instance = instance;
        this.shop_id = shop_id;
        this.readonly = readonly;
        this.form_id = 'id_shop_view_form';

        this.if_user_changed_any_information = false;

        this.data = {
            name:null,
            price:null,
            memo:null,
            reg_dt:null,
            mod_dt:null
        };

        this.simple_input = {
            price : OFF
        };

        this.list_type = "basic_info";

        this.init();
        this.set_initial_data();
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

    set memo(text){
        this.data.memo = text;
        this.render_content();
    }

    get memo(){
        return this.data.memo;
    }


    init(){
        this.render();
    }

    set_initial_data (){
        Shop_func.read({"shop_id": this.shop_id}, (data)=>{
            console.log(data);
            this.data.name = data.shop_name;
            this.data.price = data.shop_price;
            this.data.memo = data.shop_note;
            this.data.reg_dt = data.shop_reg_dt;
            this.data.mod_dt = data.shop_mod_dt;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="shop_view_popup.upper_left_menu();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="shop_view_popup.upper_right_menu();">${CImg.more()}</span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_shop_view .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
        document.querySelector(`${this.target.install} .wrapper_top`).innerHTML = PopupBase.wrapper_top(this.dom_wrapper_top().left, this.dom_wrapper_top().center, this.dom_wrapper_top().right);
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    dom_wrapper_top(){
        let top_left = `<span class="icon_left" onclick="shop_view_popup.upper_left_menu();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="shop_view_popup.upper_right_menu();">${CImg.more()}</span>`;
        return {left: top_left, center:top_center, right:top_right};
    }

    dom_assembly_toolbox(){
        return this.dom_row_toolbox();
    }
    
    dom_assembly_content(){
        let basic_price = this.dom_row_shop_price_input();
        let memo = this.dom_row_shop_memo_input();
        let shop_basic_info_assembly = '<div class="obj_input_box_full">'+
                                                CComponent.dom_tag('가격') + basic_price +
                                        '</div>';
        let shop_memo_assembly = '<div class="obj_input_box_full">'+CComponent.dom_tag('설명')+memo+ '</div>';

        let tab_basic_info = shop_basic_info_assembly + shop_memo_assembly;

        // let tab_reserve_info =
        //     shop_additional_setting_assembly;

        let selected_tab;
        if(this.list_type == "basic_info"){
            selected_tab = tab_basic_info;
        }


        let html =  
            this.dom_row_list_type_tab() +
            selected_tab;

        return html;
    }

    dom_row_toolbox(){
        let id = 'shop_name_view';
        let style = {"font-size":"20px", "font-weight":"bold"};
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '부가 상품명*';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let disabled = false;
        let pattern = '[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:.,()\\[\\]\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}';
        let pattern_message = "+ - _ : ()[] 제외 특수문자는 입력 불가";
        let required = "required";
        let sub_html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
            this.if_user_changed_any_information = true;
        }, pattern, pattern_message, required);
        let html = `
        <div class="member_add_upper_box">
            <div style="display:inline-block;width:100%;">
                <span style="position:absolute;top:0;font-size: 12px;display:block;color: var(--font-sub-normal);font-weight: 500;">부가 상품</span>
                ${sub_html}
            </div>
            <span style="display:none;">${title}</span>
        </div>
        `;
        return html;
    }

    dom_row_list_type_tab(){
        let html = 
        `<div class="list_type_tab_wrap" style="width:100%;padding-left:45px;text-align:left;box-sizing:border-box;height:auto">
            ${CComp.element("div", "기본 정보", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_basic_info", class:`list_tab_content ${this.list_type == "basic_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("basic_info");}})}
        </div>`;
        return html;
    }

    switch_type(type){
        if(type == this.list_type){
            return false;
        }
        switch(type){
            case "basic_info":
                this.list_type = "basic_info";
                this.render();
            break;

        }
    }

    dom_row_lecture_select(){
        let id = 'lecture_select_view';
        let length_lecture = this.data.lecture_name.length;
        let ing_lecture_length = 0;
        for(let i=0; i<length_lecture; i++){
            if(this.data.lecture_state_cd[i] == STATE_IN_PROGRESS){
                ing_lecture_length++;
            }
        }
        let title = this.data.lecture_id.length == 0  && this.data.name != null ? `<span style="color:var(--font-highlight);">${CImg.warning(["#fe4e65"], {"vertical-align":"middle", "width":"20px", "height":"20px", "margin-bottom":"4px"})}포함된 수업이 없습니다.</span>` : ing_lecture_length+'개';
        let icon = CImg.lecture();
        let icon_r_visible = SHOW;
        let icon_r_text = CComponent.text_button ('shop_lecture_list_view', "수업 목록", null, ()=>{

        });
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let auth_inspect = pass_inspector.shop_update();
            if(auth_inspect.barrier == BLOCKED){
                let message = `${auth_inspect.limit_type}`;
                this.init();
                show_error_message({title:message});
                return false;
            }

            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_SELECT, 100, popup_style, null, ()=>{
                let appendix = {'title':'수업', lecture_id:this.data.lecture_id, lecture_name:this.data.lecture_name, lecture_state_cd:this.data.lecture_state_cd,
                                max:this.data.lecture_max, type_cd:this.data.lecture_type_cd, color:this.data.lecture_color,
                                main_trainer_id:this.data.main_trainer_id, main_trainer_name:this.data.main_trainer_name};
                lecture_select = new LectureSelector('#wrapper_box_lecture_select', this, 999, appendix, (set_data)=>{
                    this.lecture = set_data; //타겟에 선택된 데이터를 set
                    // this.send_data(); wait_here_testing
                    this.if_user_changed_any_information = true;
                });
            });
        });
        return html;
    }

    dom_row_shop_price_input(){
        let unit = '원';
        let id = 'shop_price_view';
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
            let auth_inspect = pass_inspector.shop_update();
            if(auth_inspect.barrier == BLOCKED){
                let message = `${auth_inspect.limit_type}`;
                this.init();
                show_error_message({title:message});
                return false;
            }

            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            let user_input_data = input_data;
            this.price = user_input_data;
            // this.send_data(); wait_here_testing
            this.if_user_changed_any_information = true;
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

        let button_100 = CComponent.button ("button_100", "+ 100만", button_style, ()=>{ this.data.price = Number(this.data.price) + 1000000;this.render_content(); this.if_user_changed_any_information = true;});
        let button_50 = CComponent.button ("button_50", "+ 50만", button_style, ()=>{ this.data.price = Number(this.data.price) + 500000;this.render_content(); this.if_user_changed_any_information = true;});
        let button_10 = CComponent.button ("button_10", "+ 10만", button_style, ()=>{ this.data.price = Number(this.data.price) + 100000;this.render_content(); this.if_user_changed_any_information = true;});
        let button_1 = CComponent.button ("button_1", "+ 1만", button_style, ()=>{ this.data.price = Number(this.data.price) + 10000;this.render_content(); this.if_user_changed_any_information = true;});
        let button_delete = CComponent.button ("button_delete", "지우기", button_style, ()=>{ this.data.price = null;this.render_content(); this.if_user_changed_any_information = true;});
        
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
        let id = 'shop_memo_view';
        let title = this.data.memo == null || this.data.memo == " " ? '' : this.data.memo;
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
            let auth_inspect = pass_inspector.shop_update();
            if(auth_inspect.barrier == BLOCKED){
                let message = `${auth_inspect.limit_type}`;
                this.init();
                show_error_message({title:message});
                return false;
            }

            let user_input_data = input_data;
            this.memo = user_input_data;
            // this.send_data(); wait_here_testing
            this.if_user_changed_any_information = true;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_reg_mod_date(){
        let icon_button_style = {"display":"block", "padding":0, "font-size":"12px"};
        let html1 = CComponent.icon_button('reg_date_view', `등록 ${this.data.shop_reg_dt}`, NONE, icon_button_style, ()=>{});
        // let html2 = CComponent.icon_button('mod_date', `수정 ${this.data.shop_mod_dt}`, NONE, icon_button_style, ()=>{});
        let html = html1;
        return html;
    }

    send_data(){
        if(this.check_before_send() == false){
            return false;
        }
        let data = {
                    "shop_id":this.shop_id,
                    "name":this.data.name,
                    "price":this.data.price == null ? 0 :this.data.price,
                    "note":this.data.memo
        };

        Shop_func.update(data, ()=>{
            this.set_initial_data();
            try{
                current_page.init();
            }catch(e){}
            try{
                shop_list_popup.reset();
            }catch(e){}
        });
    }

    upper_left_menu(){
        if(this.if_user_changed_any_information == true){
            let inspect = pass_inspector.shop_update();
            if(inspect.barrier == BLOCKED){
                let message = `${inspect.limit_type}`;
                layer_popup.close_layer_popup();
                this.clear();
                show_error_message({title:message});
                return false;
            }
            
            let user_option = {
                confirm:{text:"변경사항 적용", callback:()=>{this.send_data();layer_popup.close_layer_popup();layer_popup.close_layer_popup();this.clear();}},
                cancel:{text:"아무것도 변경하지 않음", callback:()=>{ layer_popup.close_layer_popup();layer_popup.close_layer_popup();this.clear();}}
            };
            let options_padding_top_bottom = 16;
            // let button_height = 8 + 8 + 52;
            let button_height = 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        }else{
            layer_popup.close_layer_popup();this.clear();
        }
    }

    upper_right_menu(){
        let user_option = {
            delete:{text:"삭제", callback:()=>{
                    let auth_inspect = pass_inspector.shop_delete();
                    if(auth_inspect.barrier == BLOCKED){
                        let message = `${auth_inspect.limit_type}`;
                        this.init();
                        show_error_message({title:message});
                        return false;
                    }
                    let message = {
                        title:`"${this.data.name}" <br> 부가 상품을 영구 삭제 하시겠습니까?`,
                        comment:`데이터를 복구할 수 없습니다. <br><br>
                                ${CImg.warning(["#fe4e65"], {"vertical-align":"middle", "margin-bottom":"4px"})}
                                `
                    };
                    show_user_confirm(message, ()=>{
                        Shop_func.delete({"shop_id":this.shop_id}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                ticket_list_popup.reset();
                            }catch(e){}
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            layer_popup.close_layer_popup(); //option 팝업 닫기
                            layer_popup.close_layer_popup(); //상품 정보 팝업 닫기
                        });
                    });
                }
            }
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



class Shop_simple_view{
    constructor(install_target, shop_id, instance, readonly){
        this.target = {install: install_target, toolbox:'section_shop_view_toolbox', content:'section_shop_view_content', close_button:'section_shop_simple_view_close_button'};
        this.instance = instance;
        this.shop_id = shop_id;
        this.readonly = readonly;

        this.data = {
            name:null,
            price:null,
            memo:null,
            reg_dt:null,
            mod_dt:null,
        };

        this.init();
        this.set_initial_data();
    }

    init(){
        this.render();
    }

    set_initial_data (){
        Shop_func.read({"shop_id": this.shop_id}, (data)=>{
            this.data.name = data.shop_name;
            this.data.price = data.shop_price;
            this.data.memo = data.shop_note;

            this.data.reg_dt = data.shop_reg_dt;
            this.data.mod_dt = data.shop_mod_dt;

        });
    }

    render(){
        let dom_toolbox = this.dom_row_toolbox();
        let dom_content = this.dom_assembly_content();
        let dom_close_button = this.dom_close_button();

        let html = `<section id="${this.target.toolbox}" class="obj_box_full" style="position:sticky;position:-webkit-sticky;top:0;">${dom_toolbox}</section>
                    <section id="${this.target.content}" style="width:100%;height:auto;overflow-y:auto;">${dom_content}</section>
                    <section id="${this.target.close_button}" class="obj_box_full" style="height:48px;">${dom_close_button}</section>`;
        document.querySelector(this.target.install).innerHTML = html;
    }

    
    dom_assembly_content(){
        let memo = this.dom_row_shop_memo_input();

        let html =  '<div class="obj_box_full">'+memo+'</div>';

        return html;
    }

    dom_row_toolbox(){
        let text_button_style = {"color":"var(--font-highlight)", "font-size":"13px", "font-weight":"500", "padding":"10px 0"};
        let text_button = CComponent.text_button ("detail_shop_info", "더보기", text_button_style, ()=>{
            show_user_confirm({title:`작업중이던 항목을 모두 닫고 부가 상품 메뉴로 이동합니다.`}, ()=>{
                layer_popup.all_close_layer_popup();
                if($(window).width() > 650){
                    sideGoPage("shop_page_type");
                }else{
                    sideGoPopup("shop");
                }
                
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SHOP_VIEW, 100, popup_style, {'shop_id':this.shop_id} ,()=>{
                    shop_view_popup = new Shop_view('.popup_shop_view', this.shop_id, 'shop_view_popup');
                });
            });
        });

        let shop_name = this.data.name == null ? '' : this.data.name;

        let html = `
        <div style="height:48px;line-height:48px;">
            <div style="float:left;width:auto;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                <span style="font-size:16px;font-weight:bold;">
                    ${CImg.shop("", {"width":"20px", "vertical-align":"middle", "margin-right":"8px", "margin-bottom":"3px"})}
                    ${shop_name}
                </span>
            </div>
            <div style="display:inline-block;float:right;width:65px;text-align:right;">
                ${text_button}
            </div>
        </div>
        `;
        return html;
    }

    dom_row_shop_memo_input(){
        let id = 'shop_memo_view';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '설명';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"flex":"1 1 0"};
        let disabled = true;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:.,\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ : ., 제외 특수문자는 입력 불가";
        let required = "";
        console.log(title);
        let html_data = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            
        }, pattern, pattern_message, required);

        let html = `<div style="display:flex;">
                        <div style="flex-basis:68px;font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-inactive);line-height:24px;padding:12px 0;">설명</div>
                        ${html_data}
                    </div>`;

        return html;
    }

    dom_close_button(){
        let style = {"display":"block", "height":"48px", "line-height":"48px", "padding":"0"};
        let html = CComponent.button ("close_member_simple", "닫기", style, ()=>{
            layer_popup.close_layer_popup();
        });
        return html;
    }

    
}