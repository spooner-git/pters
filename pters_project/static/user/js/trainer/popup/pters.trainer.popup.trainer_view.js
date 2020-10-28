class Trainer_view{
    constructor(install_target, external_data, instance){
        this.target = {install: install_target, toolbox:'section_trainer_view_toolbox', content:'section_trainer_view_content'};
        this.instance = instance;
        this.trainer_id = external_data.trainer_id;
        this.trainer_ing_type = external_data.list_type;
        this.form_id = 'id_trainer_view_form';

        this.if_user_changed_any_information = false;
        this.if_user_changed_auth_any_information = false;

        let d = new Date();
        this.dates = {
            current_year: d.getFullYear(),
            current_month: d.getMonth()+1,
            current_date: d.getDate()
        };
        this.times = {
            current_hour: TimeRobot.to_zone(d.getHours(), d.getMinutes()).hour,
            current_minute: TimeRobot.to_zone(d.getHours(), d.getMinutes()).minute,
            current_zone: TimeRobot.to_zone(d.getHours(), d.getMinutes()).zone
        };

        this.data = {
            name: null,
            user_id: null,
            phone: null,
            birth: null,
            sex: null,
            memo: null,
            email: null,
            profile_img: null,
            program_owner_id: null,

            connection: null,
            active: null,
            repeat: [],
            lecture: []
            // auth: null
        };
        this.data.auth  = {
                schedule:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                member:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                lecture:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                ticket:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                trainer:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                shop:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                notice:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                statistics:{
                    read : OFF
                },
                setting:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
        this.list_type = "basic_info";

        this.init();
        // this.set_initial_data();
    }

    set user_id(text){
        this.data.user_id = text;
    }

    get user_id(){
        return this.data.user_id;
    }

    set name(text){
        this.data.name = text;
        this.render_content();
    }

    get name(){
        return this.data.name;
    }

    set phone(number){
        this.data.phone = number;
        this.render_content();
    }

    get phone(){
        return this.data.phone;
    }

    set birth(data){
        this.data.birth = data.data;
        this.render_content();
    }

    get birth(){
        return this.data.birth;
    }

    set sex(data){
        this.data.sex = data;
        this.render_content();
    }

    get sex(){
        return this.data.sex;
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
        this.set_initial_data();
        // func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    set_initial_data (){
        Trainer_func.read({"trainer_id": this.trainer_id}, (data)=>{
            this.data.user_id = data.trainer_user_id;
            this.data.name = data.trainer_name;
            this.data.phone = data.trainer_phone == "None" || data.trainer_phone == "" ? null : data.trainer_phone;
            this.data.birth = DateRobot.to_split(data.trainer_birthday_dt);
            this.data.sex = data.trainer_sex == "None" || data.trainer_sex == "" ? null : data.trainer_sex;
            this.data.connection = data.trainer_connection_check;
            this.data.active = data.trainer_is_active;
            this.data.email = data.trainer_email;
            this.data.profile_img = data.trainer_profile_url;
            this.data.program_owner_id = data.program.program_program_owner_id;
            Trainer_auth_func.read({"trainer_id":this.trainer_id}, (data)=>{
                let my_auth = data[this.trainer_id];
                if(my_auth != undefined){
                    this.data.auth.schedule.create = my_auth.auth_plan_create != undefined ? my_auth.auth_plan_create : OFF;
                    this.data.auth.schedule.read = my_auth.auth_plan_read != undefined ? my_auth.auth_plan_read : OFF;
                    this.data.auth.schedule.update = my_auth.auth_plan_update != undefined ? my_auth.auth_plan_update : OFF;
                    this.data.auth.schedule.delete = my_auth.auth_plan_delete != undefined ? my_auth.auth_plan_delete : OFF;

                    this.data.auth.member.create = my_auth.auth_member_create != undefined ? my_auth.auth_member_create : OFF;
                    this.data.auth.member.read = my_auth.auth_member_read != undefined ? my_auth.auth_member_read : OFF;
                    this.data.auth.member.update = my_auth.auth_member_update != undefined ? my_auth.auth_member_update : OFF;
                    this.data.auth.member.delete = my_auth.auth_member_delete != undefined ? my_auth.auth_member_delete : OFF;

                    this.data.auth.lecture.create = my_auth.auth_group_create != undefined ? my_auth.auth_group_create : OFF;
                    this.data.auth.lecture.read = my_auth.auth_group_read != undefined ? my_auth.auth_group_read : OFF;
                    this.data.auth.lecture.update = my_auth.auth_group_update != undefined ? my_auth.auth_group_update : OFF;
                    this.data.auth.lecture.delete = my_auth.auth_group_delete != undefined ? my_auth.auth_group_delete : OFF;

                    this.data.auth.ticket.create = my_auth.auth_package_create != undefined ? my_auth.auth_package_create : OFF;
                    this.data.auth.ticket.read = my_auth.auth_package_read != undefined ? my_auth.auth_package_read : OFF;
                    this.data.auth.ticket.update = my_auth.auth_package_update != undefined ? my_auth.auth_package_update : OFF;
                    this.data.auth.ticket.delete = my_auth.auth_package_delete != undefined ? my_auth.auth_package_delete : OFF;

                    this.data.auth.trainer.create = my_auth.auth_trainer_create != undefined ? my_auth.auth_trainer_create : OFF;
                    this.data.auth.trainer.read = my_auth.auth_trainer_read != undefined ? my_auth.auth_trainer_read : OFF;
                    this.data.auth.trainer.update = my_auth.auth_trainer_update != undefined ? my_auth.auth_trainer_update : OFF;
                    this.data.auth.trainer.delete = my_auth.auth_trainer_delete != undefined ? my_auth.auth_trainer_delete : OFF;

                    this.data.auth.shop.create = my_auth.auth_shop_create != undefined ? my_auth.auth_shop_create : OFF;
                    this.data.auth.shop.read = my_auth.auth_shop_read != undefined ? my_auth.auth_shop_read : OFF;
                    this.data.auth.shop.update = my_auth.auth_shop_update != undefined ? my_auth.auth_shop_update : OFF;
                    this.data.auth.shop.delete = my_auth.auth_shop_delete != undefined ? my_auth.auth_shop_delete : OFF;

                    this.data.auth.notice.create = my_auth.auth_notice_create != undefined ? my_auth.auth_notice_create : OFF;
                    this.data.auth.notice.read = my_auth.auth_notice_read != undefined ? my_auth.auth_notice_read : OFF;
                    this.data.auth.notice.update = my_auth.auth_notice_update != undefined ? my_auth.auth_notice_update : OFF;
                    this.data.auth.notice.delete = my_auth.auth_notice_delete != undefined ? my_auth.auth_notice_delete : OFF;

                    this.data.auth.statistics.read = my_auth.auth_analytics_read != undefined ? my_auth.auth_analytics_read : OFF;

                    this.data.auth.setting.create = my_auth.auth_setting_create != undefined ? my_auth.auth_setting_create : OFF;
                    this.data.auth.setting.read = my_auth.auth_setting_read != undefined ? my_auth.auth_setting_read : OFF;
                    this.data.auth.setting.update = my_auth.auth_setting_update != undefined ? my_auth.auth_setting_update : OFF;
                    this.data.auth.setting.delete = my_auth.auth_setting_delete != undefined ? my_auth.auth_setting_delete : OFF;

                }
                Trainer_func.repeat_list(
                    {"trainer_id":this.trainer_id}, (data)=>{
                        let repeat_list = data.trainer_repeat_schedule_data; //array

                        this.data.repeat = repeat_list;

                        Trainer_func.lecture_list(
                            {"trainer_id":this.trainer_id}, (data)=> {
                                this.data.lecture = data.trainer_lecture_data;
                                this.render();
                            });
                    }
                );

            });
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="trainer_view_popup.upper_left_menu();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="trainer_view_popup.upper_right_menu();">${CImg.more()}</span>`;

        console.log(this.trainer_ing_type);
        if(this.trainer_id == this.data.program_owner_id || this.trainer_id == user_id || this.trainer_ing_type == "ing"){
            top_right = '';
        }

        let content =   `<form id="${this.form_id}">
                            <section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                            <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>
                        </form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_trainer_view .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
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
        let top_left = `<span class="icon_left" onclick="trainer_view_popup.upper_left_menu();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="trainer_view_popup.upper_right_menu();">${CImg.more()}</span>`;

        if(this.trainer_id == this.data.program_owner_id || this.trainer_id == user_id || this.trainer_ing_type == "ing"){
            top_right = '';
        }

        return {left: top_left, center:top_center, right:top_right};
    }

    dom_assembly_toolbox(){
        return this.dom_row_toolbox();
    }
    
    dom_assembly_content(){
        let user_id = this.dom_row_trainer_user_id_input();
        let phone = this.dom_row_trainer_phone_input();
        let birth = this.dom_row_trainer_birth_input();
        let sex = this.dom_row_trainer_sex_input();
        let repeat = this.dom_row_repeat();
        let lecture = this.dom_row_lecture();
        let auth = this.dom_row_auth();
        // let memo = this.dom_row_trainer_memo_input();
        let tag_id = this.data.active == 'True' || this.data.active == null ? '아이디' : '아이디 <span style="color:var(--font-highlight);margin-left:3px;">(임시아이디, 비밀번호 0000)</span>';

        let tab_basic_info =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag(tag_id) + user_id + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('휴대폰 번호') + phone + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('생년월일') + birth + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('성별') + sex +
            '</div>';

        let tab_lecture_info =
            '<div class="obj_input_box_full" style="padding-right:18px">' +
                // CComponent.dom_tag('반복 일정', {"padding-left":"0"}) +
                lecture +
            '</div>';

        let tab_repeat_info =
            '<div class="obj_input_box_full" style="padding-right:18px">' +
                // CComponent.dom_tag('반복 일정', {"padding-left":"0"}) +
                repeat +
            '</div>';

        let tab_auth_info =
            '<div class="obj_input_box_full" style="padding-right:18px">' +
                // CComponent.dom_tag('반복 일정', {"padding-left":"0"}) +
                auth +
            '</div>';

        let selected_tab;
        if(this.list_type == "basic_info"){
            selected_tab = tab_basic_info;
        }else if(this.list_type == "repeat_info"){
            selected_tab = tab_repeat_info;
        }else if(this.list_type == "lecture_info"){
            selected_tab = tab_lecture_info;
        }else if(this.list_type == "auth_info"){
            selected_tab = tab_auth_info;
        }

        let html =
            this.dom_row_list_type_tab() +
            selected_tab;            
            
            // '<div class="obj_input_box_full">'
            //     + CComponent.dom_tag('특이사항')  + memo +
            // '</div>';

        return html;
    }

    dom_row_toolbox(){
        let id = 'trainer_name_view';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '강사명';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text;
        let style = {"font-size":"20px", "font-weight":"bold", "letter-spacing":"-1px", "color":"var(--font-main)", "text-align":"center"};
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,@一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = ". , + - _ @ 제외 특수문자는 입력 불가";
        let required = "required";
        if(this.data.active == 'True'){
            disabled = true;
        }
        let sub_html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
            // this.send_data();
            this.if_user_changed_any_information = true;
        }, pattern, pattern_message, required);
        
        let html = `
        <div class="trainer_view_upper_box">
            <div style="padding-top:10px;text-align:center;">
                ${this.dom_row_profile_image()}
            </div>
            <div style="width:100%;">
                    ${sub_html}
            </div>
            <span style="display:none;">${title}</span>
        </div>
        `;
        return html;
    }

    dom_row_list_type_tab(){
        let html = 
        // `<div class="list_type_tab_wrap" style="width:100%;padding-left:45px;text-align:left;box-sizing:border-box;height:auto">
        //     ${CComp.element("div", "기본 정보", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_basic_info", class:`list_tab_content ${this.list_type == "basic_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("basic_info");}})}
        //     ${CComp.element("div", "수강권", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_ticket_info", class:`list_tab_content ${this.list_type == "ticket_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("ticket_info");}})}
        //     ${CComp.element("div", "일정", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_repeat_info", class:`list_tab_content ${this.list_type == "repeat_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("repeat_info");}})}
        // </div>`;
        `<div class="list_type_tab_wrap" style="width:100%;padding-left:45px;text-align:left;box-sizing:border-box;height:auto">
            ${CComp.element("div", "기본 정보", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_basic_info", class:`list_tab_content ${this.list_type == "basic_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("basic_info");}})}
            ${CComp.element("div", "담당 수업", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_lecture_info", class:`list_tab_content ${this.list_type == "lecture_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("lecture_info");}})}
            ${CComp.element("div", "일정", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_repeat_info", class:`list_tab_content ${this.list_type == "repeat_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("repeat_info");}})}
            ${CComp.element("div", "권한", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_auth_info", class:`list_tab_content ${this.list_type == "auth_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("auth_info");}})}
        </div>`;

        if(this.trainer_id == this.data.program_owner_id || this.trainer_id == user_id){
            html =
            `<div class="list_type_tab_wrap" style="width:100%;padding-left:45px;text-align:left;box-sizing:border-box;height:auto">
                ${CComp.element("div", "기본 정보", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_basic_info", class:`list_tab_content ${this.list_type == "basic_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("basic_info");}})}
                ${CComp.element("div", "담당 수업", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_lecture_info", class:`list_tab_content ${this.list_type == "lecture_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("lecture_info");}})}
                ${CComp.element("div", "일정", {"padding":"5px 5px", "text-align":"center"}, {id:"tab_select_repeat_info", class:`list_tab_content ${this.list_type == "repeat_info" ? "tab_selected anim_pulse_strong" : ""}`}, {type:"click", exe:()=>{this.switch_type("repeat_info");}})}
            </div>`;
        }
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

            case "lecture_info":
                this.list_type = "lecture_info";
                this.render();
            break;

            case "repeat_info":
                this.list_type = "repeat_info";
                this.render();
            break;

            case "auth_info":
                this.list_type = "auth_info";
                this.render();
            break;

        }
    }

    dom_row_profile_image(){
        let id = "trainer_profile_image";
        let title = `<img src="${this.data.profile_img}" style="width:100px;height:100px;border-radius:50%;">`;
        if(this.data.profile_img == null){
            title = CImg.blank("", {"width":"100px", "height":"100px"});
        }
        let style = {"height":"auto"};
        let onclick = ()=>{
            let disabled = false;
            if(this.data.active == 'True'){
                disabled = true;
            }
            if(disabled == true){
                let edit_enable = false;
                this.event_edit_photo(edit_enable);
            }else{
                let edit_enable = true;
                this.event_edit_photo(edit_enable);
            }
        };

        let html = CComponent.text_button (id, title, style, onclick);

        return html;
    }

    dom_row_trainer_user_id_input(){
        let onclick;
        if(this.data.connection == CONNECTED ){
            onclick = ()=>{
                let user_option = {
                        connect:{text:"연결 해제", callback:()=>{
                            show_user_confirm ({title:`정말 연결을 해제하시겠습니까?`,
                                                comment:`다시 복구할 수 없습니다. <br/> <span style="color:var(--font-highlight);">관련 수업 및 현시간 이후 일정에서도 담당강사가 본인으로 할당됩니다.<br/>과거 일정은 변경되지 않습니다.<br/>해당 강사는 종료 탭으로 이동됩니다.</span>`
                                                }, ()=>{
                                layer_popup.close_layer_popup();
                                layer_popup.close_layer_popup();
                                let data = {"trainer_id":this.trainer_id, "trainer_auth_cd":AUTH_TYPE_DELETE};
                                Trainer_func.connection(data, ()=>{
                                    this.set_initial_data();
                                    current_page.reset();
                                });
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
        }else if(this.data.connection == CONNECT_WAIT){
            onclick = ()=>{
                let user_option = {
                        connect:{text:"연결 요청 취소", callback:()=>{
                            show_user_confirm ({title:`연결 요청을 취소하겠습니까?`, comment:`해당 강사는 종료 탭으로 이동됩니다.`}, ()=>{
                                layer_popup.close_layer_popup();
                                layer_popup.close_layer_popup();
                                let data = {"trainer_id":this.trainer_id, "trainer_auth_cd":AUTH_TYPE_DELETE};
                                Trainer_func.connection(data, ()=>{
                                    this.set_initial_data();
                                    current_page.reset();
                                });
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
        }else if(this.data.connection == UNCONNECTED){
            onclick = ()=>{
                let user_option = {
                        connect:{text:"연결 요청", callback:()=>{
                            show_user_confirm ({title:`연결 요청을 보내시겠습니까?`}, ()=>{
                                layer_popup.close_layer_popup();
                                layer_popup.close_layer_popup();
                                let data = {"trainer_id":this.trainer_id, "trainer_auth_cd":AUTH_TYPE_WAIT};
                                Trainer_func.connection(data, ()=>{
                                    this.set_initial_data();
                                    current_page.reset();
                                });
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
        }
        let id = 'trainer_user_id_view';
        let title = this.data.user_id == null ? '회원ID' : this.data.user_id;
        // if(this.data.active != 'True'){
        //     title = '(임시 ID) ' + title;
        // }
        let icon = CImg.member_card();
        let icon_r_visible = SHOW;
        let icon_r_text = '';
        let style = null;
        if(this.data.connection == CONNECTED){
            icon_r_text = "<span style='color:green'>연결 중</span>";
        }else if(this.data.connection == CONNECT_WAIT){
            icon_r_text = "<span style='color:orange'>연결 대기</span>";
        }else if(this.data.connection == UNCONNECTED){
            icon_r_text = "<span style='color:#fe4e65'>미연결</span>";
        }

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            onclick();
        });

        if(this.trainer_id == this.data.program_owner_id || this.trainer_id == user_id){
            icon_r_visible = HIDE;
            icon_r_text = '';
            html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            });
        }
        return html;
    }

    dom_row_trainer_phone_input(){
        let id = 'trainer_phone_view';
        let title = this.data.phone == null || this.data.phone == 'None' ? '' : this.data.phone;
        let placeholder = '휴대폰 번호';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text;
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{10,11}";
        let pattern_message = "";
        let required = "";
        // if(this.data.connection != 1){
        //     disabled = true;
        // }
        if(this.data.active == 'True'){
            disabled = true;
        }
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{

            let user_input_data = input_data;
            this.phone = user_input_data;
            // this.send_data();
            this.if_user_changed_any_information = true;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_trainer_birth_input(){
        //등록하는 행을 만든다.
        let id = 'input_trainer_birth';
        let title = this.data.birth == null || this.data.birth == 'None' ? '생년월일' : Object.values(this.data.birth).join('.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.birth == null || this.data.birth == 'None' ? {"color":"var(--font-inactive)"} : null;
        let disabled = false;
        if(this.data.active == 'True'){
            disabled = true;
        }
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용

            if(disabled == true){
                show_error_message({title:"이용 강사님께서 PTERS에 직접 접속하신 이후로는 <br> 타인이 정보를 수정할 수 없습니다."});
                return false;
            }
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 1986.02.24로 셋팅한다.
                let year = this.data.birth == null ? 1986 : this.data.birth.year; 
                let month = this.data.birth == null ? 2 : this.data.birth.month;
                let date = this.data.birth == null ? 24 : this.data.birth.date;
                
                date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'생년월일', data:{year:year, month:month, date:date},
                                                                                                range:{start: this.dates.current_year - 90, end: this.dates.current_year}, 
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.birth = object; 
                                                                                                    // this.send_data();
                                                                                                    this.if_user_changed_any_information = true;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
                
            });
        });
        return html;
    }

    dom_row_trainer_sex_input(){
        let id = 'input_trainer_sex';
        let title = this.data.sex == null ||this.data.sex == 'None' ? '성별' : SEX_CODE[this.data.sex];
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.sex == null || this.data.sex == 'None' ? {"color":"var(--font-inactive)"} : null;
        let disabled = false;
        if(this.data.active == 'True'){
            disabled = true;
        }
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{

            if(disabled == true){
                show_error_message({title:"이용 회원님께서 PTERS에 직접 접속하신 이후로는 <br> 타인이 정보를 수정할 수 없습니다."});
                return false;
            }

            // let user_option = {
            //                     male:{text:"남성", callback:()=>{this.sex = "M";this.send_data();layer_popup.close_layer_popup();}},
            //                     female:{text:"여성", callback:()=>{this.sex = "W";this.send_data();layer_popup.close_layer_popup();}}
            // };

            let user_option = {
                male:{text:"남성", callback:()=>{this.sex = "M";this.if_user_changed_any_information = true;layer_popup.close_layer_popup();}},
                female:{text:"여성", callback:()=>{this.sex = "W";this.if_user_changed_any_information = true;layer_popup.close_layer_popup();}}
            };

            let options_padding_top_bottom = 16;
            // let button_height = 8 + 8 + 52;
            let button_height = 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });
        return html;
    }

    dom_row_trainer_memo_input(){
        let id = 'trainer_memo_view';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '특이사항';
        let icon = CImg.memo();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,:()\\[\\]\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "+ - _ : ()[] . , 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            this.memo = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_repeat(){
        let html_to_join = [];
        let length = this.data.repeat.length;
        for(let i=0; i<length; i++){
            let data = this.data.repeat[i];
            html_to_join.push(
                this.dom_row_repeat_item(
                    data.repeat_schedule_id,
                    data.lecture_ing_color_cd,
                    data.week_info.split('/').map((item)=>{
                        return DAYNAME_MATCH[item];
                    }).join(''),
                    data.lecture_name,
                    data.start_date+' - '+data.end_date,
                    data.start_time+' - '+data.end_time
                )
            );
        }
        html_to_join.unshift(
            `<div style="margin-top:10px;margin-bottom:10px;height:33px;">`+
                // CComp.button("add_new_schedule", `${CImg.plus([""], {"vertical-align":"middle", "margin-bottom":"3px", "margin-right":"2px", "width":"18px"})} 새 일정`, {"font-size":"12px", "float":"left", "padding-left":"0"}, null, ()=>{
                //     let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                //     let data = {
                //         user_selected_date: {year:this.current_year, month:this.current_month, date:this.current_date},
                //         user_selected_time: {hour:this.current_hour, minute:this.current_minute, hour2:this.current_hour, minute2:this.current_minute},
                //         user_selected_plan : {schedule_id:"", date:{year:null, month:null, date:null}}
                //     };
                //     layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PLAN_ADD, 100, popup_style, null, ()=>{
                //         plan_add_popup = new Plan_add('.popup_plan_add', data, "plan_add_popup");
                //     });
                // }) +
                CComp.button("view_schedule_history", `${CImg.history([""], {"vertical-align":"middle", "margin-bottom":"3px", "margin-right":"2px", "width":"18px"})} 일정 이력`, {"font-size":"12px", "float":"left", "padding-left":"0"}, null, ()=>{
                    let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_TRAINER_SCHEDULE_HISTORY, 100, popup_style, null, ()=>{
                        trainer_schedule_history = new Trainer_schedule_history('.popup_trainer_schedule_history', this.trainer_id, null);
                    });
                }) +
            `</div>
            <div>${CComponent.dom_tag('반복 일정', {"padding-left":"0", "padding-top":"0"})}</div>
            ${html_to_join.length == 0 ? `<div style="font-size:12px;color:var(--font-sub-dark);padding:5px;">설정된 반복 일정이 없습니다.</div>` : ""}
            `
        );
        return html_to_join.join("");
    }

    dom_row_repeat_item(repeat_id, color, repeat_name, repeat_day, repeat_period, repeat_time){
        if(repeat_name == '일월화수목금토'){
            repeat_name = '매일';
        }
        let html = `<div id="repeat_item_${repeat_id}" style="display:flex;width:100%;height:60px;padding:8px 0px;box-sizing:border-box;cursor:pointer;">
                        <div style="flex-basis:16px;">
                            <div style="float:left;width:4px;height:100%;background-color:${color}"></div>
                        </div>
                        <div style="flex:1 1 0">
                            <div style="font-size:16px;font-weight:500;letter-spacing:-0.7px;color:var(--font-base);">${repeat_name} ${repeat_time}</div>
                            <div style="font-size:12px;font-weight:500;letter-spacing:-0.5px;color:var(--font-sub-normal);">${repeat_day} / ${repeat_period}</div>
                        </div>
                        <div style="flex-basis:30px;">
                            ${CImg.more("", {"vertical-align":"top"})}
                        </div>
                    </div>`;
        $(document).off('click', `#repeat_item_${repeat_id}`).on('click', `#repeat_item_${repeat_id}`, function(e){
            let user_option = {
                delete:{text:"반복일정 삭제", callback:()=>{
                    layer_popup.close_layer_popup();
                    let message = {
                        title:`정말 ${repeat_name}의 반복 일정을 취소하시겠습니까?`,
                        comment:`${CImg.warning(["#fe4e65"], {"vertical-align":"middle", "margin-bottom":"4px"})}
                                <br>
                                <div style="text-align:center;margin-top:5px;">
                                    하위에 다른 반복일정이 존재할 경우 함께 취소됩니다. <br>
                                    과거일정은 보존되지만, 등록한 미래일정은 취소됩니다.
                                </div>`
                    }
                    show_user_confirm(message, ()=>{
                        layer_popup.close_layer_popup();
                        let inspect = pass_inspector.schedule_delete();
                        if(inspect.barrier == BLOCKED){
                            let message = `${inspect.limit_type}`;
                            show_error_message({title:message});
                            return false;
                        }

                        Loading.show(`${repeat_name}의 반복 일정을 삭제 중입니다.<br>일정이 많은 경우 최대 2~4분까지 소요될 수 있습니다.`);
                        Plan_func.delete_plan_repeat({"repeat_schedule_id":repeat_id}, ()=>{
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
        });

        return html;
    }

    dom_row_lecture(){
        let html_to_join = [];
        let length = this.data.lecture.length;
        for(let i=0; i<length; i++){
            let data = this.data.lecture[i];
            html_to_join.push(
                this.dom_row_lecture_item(
                    data.lecture_id,
                    data.lecture_ing_color_cd,
                    data.lecture_name,
                    data.lecture_max_num,
                    data.lecture_minute
                )
            );
        }
        if(length == 0){
            html_to_join.push(`<div style="font-size:12px;color:var(--font-sub-dark);padding:5px;">담당 수업이 없습니다.</div>`);
        }
        return html_to_join.join("");
    }


    dom_row_lecture_item(lecture_id, color, lecture_name, lecture_max_num, lecture_minute){
        let onclick = `trainer_view_popup.event_view_lecture(${lecture_id})`;
        let html = `<div id="lecture_item_${lecture_id}" onclick="${onclick}" style="display:flex;width:100%;height:60px;padding:8px 0px;box-sizing:border-box;cursor:pointer;">
                        <div style="flex-basis:16px;">
                            <div style="float:left;width:4px;height:100%;background-color:${color}"></div>
                        </div>
                        <div style="flex:1 1 0">
                            <div style="font-size:16px;font-weight:500;letter-spacing:-0.7px;color:var(--font-base);">${lecture_name}</div>
                            <div style="font-size:12px;font-weight:500;letter-spacing:-0.5px;color:var(--font-sub-normal);">정원: ${lecture_max_num} / 수업시간: ${lecture_minute}분</div>
                        </div>
                    </div>`;

        return html;
    }

    dom_row_auth(){
        return this.dom_row_auth_item();
    }


    dom_row_auth_item(){
        let schedule = this.dom_sub_assembly_schedule();
        let member = this.dom_sub_assembly_member();
        let lecture = this.dom_sub_assembly_lecture();
        let ticket = this.dom_sub_assembly_ticket();
        let trainer = this.dom_sub_assembly_trainer();
        let shop = this.dom_sub_assembly_shop();
        let notice = this.dom_sub_assembly_notice();
        let statistics = this.dom_sub_assembly_statistics();
        let settings = this.dom_sub_assembly_setting();

        let html = schedule + member + lecture + ticket + trainer + shop + notice + statistics + settings;

        return html;
    }

    dom_sub_assembly_schedule(){
        let schedule = this.dom_row_share_menu_title("일정", "schedule");
        let schedule_auth_create = this.dom_row_share_menu_auth_toggle("일정", "등록", "schedule", "create");
        let schedule_auth_read = this.dom_row_share_menu_auth_toggle("일정", "조회", "schedule", "read");
        let schedule_auth_update = this.dom_row_share_menu_auth_toggle("일정", "수정", "schedule", "update");
        let schedule_auth_delete = this.dom_row_share_menu_auth_toggle("일정", "삭제", "schedule", "delete");

        let child_assemble = this.data.auth.schedule.read == ON ? schedule_auth_read + schedule_auth_create + schedule_auth_update + schedule_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        schedule + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_member(){
        let member = this.dom_row_share_menu_title("회원", "member");
        let member_auth_create = this.dom_row_share_menu_auth_toggle("회원", "등록", "member", "create");
        let member_auth_read = this.dom_row_share_menu_auth_toggle("회원", "조회", "member", "read");
        let member_auth_update = this.dom_row_share_menu_auth_toggle("회원", "수정", "member", "update");
        let member_auth_delete = this.dom_row_share_menu_auth_toggle("회원", "삭제", "member", "delete");

        let child_assemble = this.data.auth.member.read == ON ? member_auth_read + member_auth_create +  member_auth_update + member_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        member + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_lecture(){
        let lecture = this.dom_row_share_menu_title("수업", "lecture");
        let lecture_auth_create = this.dom_row_share_menu_auth_toggle("수업", "등록", "lecture", "create");
        let lecture_auth_read = this.dom_row_share_menu_auth_toggle("수업", "조회", "lecture", "read");
        let lecture_auth_update = this.dom_row_share_menu_auth_toggle("수업", "수정", "lecture", "update");
        let lecture_auth_delete = this.dom_row_share_menu_auth_toggle("수업", "삭제", "lecture", "delete");

        let child_assemble = this.data.auth.lecture.read == ON ? lecture_auth_read + lecture_auth_create + lecture_auth_update + lecture_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        lecture + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_ticket(){
        let ticket = this.dom_row_share_menu_title("수강권", "ticket");
        let ticket_auth_create = this.dom_row_share_menu_auth_toggle("수강권", "등록", "ticket", "create");
        let ticket_auth_read = this.dom_row_share_menu_auth_toggle("수강권", "조회", "ticket", "read");
        let ticket_auth_update = this.dom_row_share_menu_auth_toggle("수강권", "수정", "ticket", "update");
        let ticket_auth_delete = this.dom_row_share_menu_auth_toggle("수강권", "삭제", "ticket", "delete");

        let child_assemble = this.data.auth.ticket.read == ON ? ticket_auth_read + ticket_auth_create +  ticket_auth_update + ticket_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        ticket + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_trainer(){
        let trainer = this.dom_row_share_menu_title("강사", "trainer");
        let trainer_auth_create = this.dom_row_share_menu_auth_toggle("강사", "등록", "trainer", "create");
        let trainer_auth_read = this.dom_row_share_menu_auth_toggle("강사", "조회", "trainer", "read");
        let trainer_auth_update = this.dom_row_share_menu_auth_toggle("강사", "수정", "trainer", "update");
        let trainer_auth_delete = this.dom_row_share_menu_auth_toggle("강사", "삭제", "trainer", "delete");

        let child_assemble = this.data.auth.trainer.read == ON ? trainer_auth_read + trainer_auth_create +  trainer_auth_update + trainer_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        trainer + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_shop(){
        let shop = this.dom_row_share_menu_title("부가 상품", "shop");
        let shop_auth_create = this.dom_row_share_menu_auth_toggle("부가 상품", "등록", "shop", "create");
        let shop_auth_read = this.dom_row_share_menu_auth_toggle("부가 상품", "조회", "shop", "read");
        let shop_auth_update = this.dom_row_share_menu_auth_toggle("부가 상품", "수정", "shop", "update");
        let shop_auth_delete = this.dom_row_share_menu_auth_toggle("부가 상품", "삭제", "shop", "delete");

        let child_assemble = this.data.auth.shop.read == ON ? shop_auth_read + shop_auth_create +  shop_auth_update + shop_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        shop + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_notice(){
        let notice = this.dom_row_share_menu_title("공지사항", "notice");
        let notice_auth_create = this.dom_row_share_menu_auth_toggle("공지사항", "등록", "notice", "create");
        let notice_auth_read = this.dom_row_share_menu_auth_toggle("공지사항", "조회", "notice", "read");
        let notice_auth_update = this.dom_row_share_menu_auth_toggle("공지사항", "수정", "notice", "update");
        let notice_auth_delete = this.dom_row_share_menu_auth_toggle("공지사항", "삭제", "notice", "delete");

        let child_assemble = this.data.auth.notice.read == ON ? notice_auth_read + notice_auth_create +  notice_auth_update + notice_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        notice + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_statistics(){
        let statistics = this.dom_row_share_menu_title("통계", "statistics");
        let statistics_auth_read = this.dom_row_share_menu_auth_toggle("통계", "보기", "statistics", "read");

        let child_assemble = this.data.auth.statistics.read == ON ? statistics_auth_read : "";

        let html = `<article class="obj_input_box_full">` +
                        statistics + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_setting(){
        let setting = this.dom_row_share_menu_title("설정", "setting");
        // let setting_auth_create = this.dom_row_share_menu_auth_toggle("설정", "등록", "setting", "create");
        let setting_auth_read = this.dom_row_share_menu_auth_toggle("설정", "조회", "setting", "read");
        let setting_auth_update = this.dom_row_share_menu_auth_toggle("설정", "수정", "setting", "update");
        // let setting_auth_delete = this.dom_row_share_menu_auth_toggle("설정", "삭제", "setting", "delete");

        let child_assemble = this.data.auth.setting.read == ON ? setting_auth_read + setting_auth_update  : "";

        let html = `<article class="obj_input_box_full">` +
                        setting + child_assemble +
                    `</article>`;
        return html;
    }

    dom_row_share_menu_title(menu, menu_en){
        let id_toggle = `menu_auth_parent_${menu_en}`;
        let power = this.data.auth[menu_en]["read"];
        let style_toggle = {"float":"right"};
        let menu_lock_goggle = CComponent.toggle_button (id_toggle, power, style_toggle, (data)=>{
                                for(let item in this.data.auth[menu_en]){
                                    this.data.auth[menu_en][item] = data;
                                }
                                this.if_user_changed_auth_any_information = true;
                                this.render_content();
                            });


        let id = `share_menu_name_${menu_en}`;
        let title_description = `<p style="font-size:12px;font-weight:500;margin:0;color:var(--font-sub-normal)">${menu} 메뉴에 관련된 권한 설정입니다.</p>`;
        // let title = `<div style="padding-right:5px;">${menu} ${menu_lock_goggle}</div> ${title_description}`;
        let title = `<div style="padding-right:5px;">${menu} ${menu_lock_goggle}</div>`;
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"cursor":"unset", "height":"auto"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{

        });
        let html = row;
        return html;
    }

    dom_row_share_menu_auth_toggle(menu, auth, menu_en, auth_en){
        let id = `menu_auth_${menu_en}_${auth_en}`;
        let power = this.data.auth[menu_en][auth_en];
        let style = {"transform":"scale(0.8)"};
        let menu_lock_goggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.auth[menu_en][auth_en] = data; // ON or OFF
                                this.if_user_changed_auth_any_information = true;
                                this.render_content();
                            });
        let icon = power == ON ? CImg.unlock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"}) : CImg.lock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"});
        let title = `${icon} ${auth}`;
        let title_row = CComponent.text_button (`${menu_en}_${auth_en}_toggle`, title, {"font-size":"14px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="setting_menu_auth_toggle_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${menu_lock_goggle}</div>
                        </div>
                    </article>`;
        return html;
    }
    event_view_lecture(lecture_id){
        let auth_inspect = pass_inspector.lecture_read();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            this.init();
            show_error_message({title:message});
            return false;
        }
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_SIMPLE_VIEW, 100*(300/root_content_height), POPUP_FROM_BOTTOM, {'lecture_id':lecture_id}, ()=>{
            lecture_simple_view_popup = new Lecture_simple_view('.popup_lecture_simple_view', lecture_id, 'lecture_simple_view_popup');
            //수업 간단 정보 팝업 열기
        });
        // let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_VIEW, 100, popup_style, {'lecture_id':lecture_id}, ()=>{
        //     lecture_view_popup = new Lecture_view('.popup_lecture_view', lecture_id, 'lecture_view_popup');
        // });
    }

    event_edit_photo(edit_enable){
        let user_option = {
            view:{text:"사진 보기", callback:()=>{
                    layer_popup.close_layer_popup();
                    let profile_img = `<img src="${this.data.profile_img}" style="width:100%;">`;
                    show_error_message({title:profile_img});
                }
            },
            change:{text:"프로필 사진 변경", callback:()=>{
                    layer_popup.close_layer_popup();
                    let auth_inspect = pass_inspector.trainer_update();
                    if(auth_inspect.barrier == BLOCKED){
                        let message = `${auth_inspect.limit_type}`;
                        show_error_message({title:message});
                        return false;
                    }

                    let external_data = {trainer_id: this.trainer_id, callback:()=>{this.init();}};
                    let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TRAINER_VIEW_PHOTO_UPDATE, 100, popup_style, null, ()=>{
                        trainer_view_photo_update_popup = new Trainer_view_photo_update('.popup_trainer_view_photo_update', external_data);
                    });
                }
            },
            delete:{text:"프로필 사진 삭제", callback:()=>{
                    layer_popup.close_layer_popup();
                    let auth_inspect = pass_inspector.trainer_update();
                    if(auth_inspect.barrier == BLOCKED){
                        let message = `${auth_inspect.limit_type}`;
                        show_error_message({title:message});
                        return false;
                    }

                    let data = {"trainer_id": this.trainer_id};
                    let self = this;
                    $.ajax({
                        url: '/trainer/delete_trainer_profile_img/',
                        dataType : 'html',
                        data: data,
                        type:'POST',

                        beforeSend: function (xhr, settings) {
                            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                                xhr.setRequestHeader("X-CSRFToken", csrftoken);
                            }
                            // ajax_load_image(SHOW);
                        },

                        success:function(data){
                            let jsondata = JSON.parse(data);
                            check_app_version(jsondata.app_version);
                            if(jsondata.messageArray.length>0){
                                show_error_message({title:jsondata.messageArray});
                                return false;
                            }
                            try{
                                current_page.reset();
                            }catch(e){}
                            try{
                                self.init();
                            }catch(e){}
                        },

                        complete:function(){
                            // ajax_load_image(HIDE);
                        },

                        error:function(){
                            //alert('통신이 불안정합니다.');
                            show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                        }
                    });
                    
                }
            }
        };

        if(edit_enable == false){
            delete user_option.change;
            delete user_option.delete;
        }

        let options_padding_top_bottom = 16;
        // let button_height = 8 + 8 + 52;
        let button_height = 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    send_data(success_callback){
        let auth_inspect = pass_inspector.trainer_update();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            show_error_message({title:message});
            this.set_initial_data();
            return false;
        }

        if(this.check_before_send() == false){
            return false;
        }
        let data = {
                    "trainer_id": this.trainer_id,
                    "first_name": this.data.name,
                    "phone":this.data.phone == null ? "" : this.data.phone,
                    "birthday": `${this.data.birth != null ? DateRobot.to_yyyymmdd(this.data.birth.year, this.data.birth.month, this.data.birth.date) : ''}`,
                    "sex":this.data.sex == null ? "" : this.data.sex,
                    // "note":this.data.memo,
        };

        let data_for_auth = {
            "trainer_id":this.trainer_id,
            "auth_plan_create":this.data.auth.schedule.create,
            "auth_plan_read":this.data.auth.schedule.read,
            "auth_plan_update":this.data.auth.schedule.update,
            "auth_plan_delete":this.data.auth.schedule.delete,

            "auth_member_create":this.data.auth.member.create,
            "auth_member_read":this.data.auth.member.read,
            "auth_member_update":this.data.auth.member.update,
            "auth_member_delete":this.data.auth.member.delete,

            "auth_group_create":this.data.auth.lecture.create,
            "auth_group_read":this.data.auth.lecture.read,
            "auth_group_update":this.data.auth.lecture.update,
            "auth_group_delete":this.data.auth.lecture.delete,

            "auth_package_create":this.data.auth.ticket.create,
            "auth_package_read":this.data.auth.ticket.read,
            "auth_package_update":this.data.auth.ticket.update,
            "auth_package_delete":this.data.auth.ticket.delete,

            "auth_trainer_create":this.data.auth.trainer.create,
            "auth_trainer_read":this.data.auth.trainer.read,
            "auth_trainer_update":this.data.auth.trainer.update,
            "auth_trainer_delete":this.data.auth.trainer.delete,

            "auth_shop_create":this.data.auth.shop.create,
            "auth_shop_read":this.data.auth.shop.read,
            "auth_shop_update":this.data.auth.shop.update,
            "auth_shop_delete":this.data.auth.shop.delete,

            "auth_notice_create":this.data.auth.notice.create,
            "auth_notice_read":this.data.auth.notice.read,
            "auth_notice_update":this.data.auth.notice.update,
            "auth_notice_delete":this.data.auth.notice.delete,

            "auth_analytics_read":this.data.auth.statistics.read,

            "auth_setting_read":this.data.auth.setting.read,
            "auth_setting_update":this.data.auth.setting.update,
        };
        if(this.if_user_changed_any_information==true && this.if_user_changed_auth_any_information==true){
            Trainer_func.update(data, ()=>{
                Trainer_auth_func.update(data_for_auth, ()=>{
                    this.set_initial_data();
                    if(success_callback != undefined){
                        success_callback();
                    }
                    try{
                        current_page.reset();
                    }catch(e){}
                });
            });
        }
        else if(this.if_user_changed_any_information==true && this.if_user_changed_auth_any_information!=true){
            Trainer_func.update(data, ()=>{
                this.set_initial_data();
                if(success_callback != undefined){
                    success_callback();
                }
                try{
                    current_page.reset();
                }catch(e){}
            });
        }
        else if(this.if_user_changed_any_information!=true && this.if_user_changed_auth_any_information==true){
            Trainer_auth_func.update(data_for_auth, ()=>{
                this.set_initial_data();
                if(success_callback != undefined){
                    success_callback();
                }
                try{
                    current_page.reset();
                }catch(e){}
            });
        }

    }

    upper_left_menu(){
        if(this.if_user_changed_any_information == true || this.if_user_changed_auth_any_information == true){
            let inspect = pass_inspector.trainer_update();
            if(inspect.barrier == BLOCKED){
                let message = `${inspect.limit_type}`;
                layer_popup.close_layer_popup();
                this.clear();
                show_error_message({title:message});
                return false;
            }
            
            let user_option = {
                confirm:{text:"변경사항 적용", callback:()=>{this.send_data(()=>{layer_popup.close_layer_popup();layer_popup.close_layer_popup();this.clear();});}},
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
            // recontract:{text:"재등록", callback:()=>{
            //         layer_popup.close_layer_popup();
            //         let member_add_initial_data = {member_id: this.member_id};
            //         layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_ADD, 100, POPUP_FROM_BOTTOM, null, ()=>{
            //             member_add_popup = new Member_add('.popup_member_add', member_add_initial_data, 'member_add_popup');});
            //     }
            // },
            // ticket_history:{text:"수강권 이력", callback:()=>{
            //         layer_popup.close_layer_popup();
            //         let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            //         layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_TICKET_HISTORY, 100, popup_style, null, ()=>{
            //             member_ticket_history = new Member_ticket_history('.popup_member_ticket_history', {member_id:this.member_id, member_name:this.name}, null);
            //         });
            //     }
            // },
            // lesson_history:{text:"일정 이력", callback:()=>{
            //         layer_popup.close_layer_popup();
            //         let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            //         layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_SCHEDULE_HISTORY, 100, popup_style, null, ()=>{
            //             member_schedule_history = new Member_schedule_history('.popup_member_schedule_history', this.member_id, null);
            //         });
            //     }
            // },
            delete:{text:"강사 삭제", callback:()=>{
                    let message = {
                        title:`"${this.data.name}" <br>강사 정보를 삭제 하시겠습니까?`,
                        comment:`다시 복구할 수 없습니다. <br> <span style="color:var(--font-highlight);">관련 수업 및 현시간 이후 일정에서도 담당강사가 본인으로 할당됩니다.<br/>과거 일정은 변경되지 않습니다.</span>`
                    }
                    show_user_confirm(message, ()=>{
                        let auth_inspect = pass_inspector.trainer_delete();
                        if(auth_inspect.barrier == BLOCKED){
                            let message = `${auth_inspect.limit_type}`;
                            show_error_message({title:message});
                            layer_popup.close_layer_popup();
                            return false;
                        }

                        Trainer_func.delete({"trainer_id":this.trainer_id}, ()=>{
                            try{
                                current_page.reset();
                            }catch(e){}
                            layer_popup.all_close_layer_popup();
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


class Trainer_simple_view{
    constructor(install_target, trainer_id, instance){
        this.target = {install: install_target, toolbox:'section_trainer_simple_view_toolbox', content:'section_trainer_simple_view_content', close_button:'section_trainer_simple_view_close_button'};
        this.instance = instance;
        this.trainer_id = trainer_id;

        let d = new Date();
        this.dates = {
            current_year: d.getFullYear(),
            current_month: d.getMonth()+1,
            current_date: d.getDate()
        };
        this.times = {
            current_hour: TimeRobot.to_zone(d.getHours(), d.getMinutes()).hour,
            current_minute: TimeRobot.to_zone(d.getHours(), d.getMinutes()).minute,
            current_zone: TimeRobot.to_zone(d.getHours(), d.getMinutes()).zone
        };

        this.data = {
            user_id:null,
            name: null,
            phone: null,
            birth: null,
            sex: null,
            memo: null,
            email:null,

            connection:null,
            active:null
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
       
        this.init();
        this.set_initial_data();
    }

    init(){
        this.render();
    }

    set_initial_data (){
        Trainer_func.read({"trainer_id": this.trainer_id}, (data)=>{
            this.data.user_id = data.trainer_user_id;
            this.data.name = data.trainer_name;
            this.data.phone = data.trainer_phone;
            this.data.birth = data.trainer_birthday_dt;
            this.data.sex = data.trainer_sex;
            this.data.connection = data.trainer_connection_check;
            this.data.active = data.trainer_is_active;
            this.data.email = data.trainer_email;
            this.render();
        });
    }

    render(){
        let dom_toolbox = this.dom_row_toolbox();
        let dom_content = this.dom_assembly_content();
        let dom_close_button = this.dom_close_button();

        let html = `<section id="${this.target.toolbox}" class="obj_box_full" style="position:sticky;position:-webkit-sticky;top:0;">${dom_toolbox}</section>
                    <section id="${this.target.content}" style="width:100%;height:299px;overflow-y:auto;">${dom_content}</section>
                    <section id="${this.target.close_button}" class="obj_box_full" style="height:48px;">${dom_close_button}</section>`;
        
        document.querySelector(this.target.install).innerHTML = html;
    }
    
    dom_assembly_content(){
        // let name = this.dom_row_trainer_name_input();
        let id = this.dom_row_trainer_user_id();
        let connection = this.dom_row_trainer_connection();
        let phone = this.dom_row_trainer_phone_input();
        let birth = this.dom_row_trainer_birth_input();
        let sex = this.dom_row_trainer_sex_input();
        // let memo = this.dom_row_trainer_memo_input();
        // let ticket = this.dom_row_ticket();

        let html =  '<div class="obj_box_full">'+id+phone+birth+sex+connection+'</div>';
                    // '<div class="obj_box_full" style="border-bottom:0">'+ticket+ '</div>';

        // document.getElementById(this.target.content).innerHTML = html;
        return html;
    }

    dom_row_toolbox(){
        let text_button_style = {"color":"var(--font-highlight)", "font-size":"13px", "font-weight":"500", "padding":"10px 0"};
        let text_button = CComponent.text_button ("detail_user_info", "더보기", text_button_style, ()=>{
            show_user_confirm({title:`작업중이던 항목을 모두 닫고 회원 메뉴로 이동합니다.`}, ()=>{
                layer_popup.all_close_layer_popup();
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TRAINER_VIEW, 100, popup_style, {'trainer_id':this.trainer_id}, ()=>{
                    trainer_view_popup = new Trainer_view('.popup_trainer_view',{'trainer_id':this.trainer_id, "list_type":"ing"}, 'trainer_view_popup');
                });
                sideGoPage("trainer");
            });
        });

        let html = `
        <div style="height:48px;line-height:48px;">
            <div style="float:left;width:auto;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                <span style="font-size:16px;font-weight:500;">
                    ${CImg.member_card("", {"vertical-align":"middle", "margin-bottom":"3px"})}
                    ${this.data.name == null ? '' : this.data.name}
                </span>
            </div>
            <div style="display:inline-block;float:right;width:65px;text-align:right;">
                ${text_button}
            </div>
        </div>
        `;
        return html;
    }

    dom_row_trainer_name_input(){
        let id = 'trainer_name_view';
        let title = this.data.name == null ? '강사명*' : this.data.name;
        let icon = CImg.members();
        let icon_r_text = "";
        let icon_r_visible = HIDE;
        let style = null;
        let onclick = ()=>{alert('연결 되어있음');};
        if(this.data.connection != CONNECTED){
            icon_r_visible = SHOW;
            onclick = ()=>{alert('연결 되어있지 않음');};
        }
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            onclick();
        });
        return html;
    }

    dom_row_trainer_user_id(){
        let id = 'trainer_user_id_view';
        let title = this.data.user_id == null ? '-' : this.data.user_id;
        if(this.data.active == "False"){
            title = "(임시)" + this.data.user_id;
        }
        let icon = DELETE;
        let icon_r_text = "";
        let icon_r_visible = NONE;
        let style = {"flex":"1 1 0", "padding":"8px 0", "font-size":"13px"};
        let onclick = ()=>{

        };
        let html_data = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);

        let html = `<div style="display:flex;">
                        <div style="flex-basis:68px;font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-inactive);line-height:24px;padding:8px 0;">아이디</div>
                        ${html_data}
                    </div>`;
        return html;
    }

    dom_row_trainer_connection(){
        let id = 'trainer_connection_view';
        let title = "";
        if(this.data.connection == CONNECTED){
            title = "<span style='color:green'>연결 중</span>";
        }else if(this.data.connection == CONNECT_WAIT){
            title = "<span style='color:orange'>연결 대기</span>";
        }else if(this.data.connection == UNCONNECTED){
            title = "<span style='color:#fe4e65'>미연결</span>";
        }
        let icon = DELETE;
        let icon_r_text = "";
        let icon_r_visible = NONE;
        let style = {"flex":"1 1 0", "padding":"8px 0", "font-size":"13px"};
        let onclick = ()=>{

        };
        let html_data = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);

        let html = `<div style="display:flex;">
                        <div style="flex-basis:68px;font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-inactive);line-height:24px;padding:8px 0;">연결상태</div>
                        ${html_data}
                    </div>`;
        return html;
    }

    dom_row_trainer_phone_input(){
        
        let id = 'trainer_phone_view';
        let title =  this.data.phone == null || this.data.phone == 'None' || this.data.phone == '' ? '-' : this.data.phone;
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"flex":"1 1 0", "padding":"8px 0", "font-size":"13px"};
        let onclick = ()=>{
            if(this.data.phone == null || this.data.phone == 'None' || this.data.phone == ''){
                return false;
            }

            let user_option = {
                sms:{text:`문자 메세지`, callback:()=>{location.href=`sms:${this.data.phone}`;layer_popup.close_layer_popup();}},
                tel:{text:`전화 걸기`, callback:()=>{location.href=`tel:${this.data.phone}`;layer_popup.close_layer_popup();}},
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
        let html_data = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);

        let html = `<div style="display:flex;">
                        <div style="flex-basis:68px;font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-inactive);line-height:24px;padding:8px 0;">휴대폰 번호</div>
                        ${html_data}
                    </div>`;

        return html;
    }

    dom_row_trainer_birth_input(){
        //등록하는 행을 만든다.
        let unit = '';
        let id = 'trainer_birth_view';
        let title = this.data.birth == null || this.data.birth == 'None' || this.data.birth == '' ? '-' : this.data.birth;
        let placeholder =  '생년월일';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"flex":"1 1 0", "padding":"8px 0", "font-size":"13px"};
        let disabled = true;
        let pattern = "[0-9]{4}-[0-9]{2}-[0-9]{2}";
        let pattern_message = "";
        let required = "";
        let html_data = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.phone = user_input_data;
        }, pattern, pattern_message, required);

        let html = `<div style="display:flex;">
                        <div style="flex-basis:68px;font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-inactive);line-height:24px;padding:8px 0;">생년월일</div>
                        ${html_data}
                    </div>`;

        return html;
    }

    dom_row_trainer_sex_input(){
        let id = 'trainer_sex_view';
        let title = this.data.sex == null || this.data.sex == 'None' || this.data.sex == '' ? '-' : SEX_CODE[this.data.sex];
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"flex": "1 1 0", "padding":"8px 0", "font-size":"13px"};
        let html_data = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            
        });

        let html = `<div style="display:flex;">
                        <div style="flex-basis:68px;font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-inactive);line-height:24px;padding:8px 0;">성별</div>
                        ${html_data}
                    </div>`;

        return html;
    }

    dom_row_trainer_memo_input(){
        let id = 'trainer_memo_view';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '특이사항';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"flex":"1 1 0", "padding":"8px 0", "font-size":"13px"};
        let disabled = true;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,@\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ @ . , 제외 특수문자는 입력 불가";
        let required = "";
        let html_data = CComponent.create_input_row(id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        }, pattern, pattern_message, required);

        let html = `<div style="display:flex;">
                        <div style="flex-basis:68px;font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-inactive);line-height:24px;padding:8px 0;">특이사항</div>
                        ${html_data}
                    </div>`;

        return html;
    }

    dom_close_button(){
        let style = {"display":"block", "height":"48px", "line-height":"48px", "padding":"0"};
        let html = CComponent.button ("close_trainer_simple", "닫기", style, ()=>{
            layer_popup.close_layer_popup();
        });
        return html;
    }

}