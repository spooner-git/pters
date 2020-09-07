class Shop_add{
    constructor(install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_shop_add_toolbox', content:'section_shop_add_content'};
        this.data_sending_now = false;
        this.instance = instance;
        this.data_from_external = data_from_external;
        this.form_id = 'id_shop_add_form';
        //data_from_external이 null이면 신규강사등록, shop_id 값이 들어오면 재등록

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
                shop_id:null, //재등록시에만 사용하는 값
                name: null,
                phone: null,
                birth: null,
                sex: null,
                shop_auth:{},
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
        this.set_initial_data(this.data_from_external);
        this.init();
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

    init(){
        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    set_initial_data(data){
        if(data == null){
            return null;
        }

        // Shop_func.read(data, (received)=>{
            this.data.name = data.shop_name;
            // alert(received.shop_name)
            this.data.shop_id = data.shop_id;
            // this.data.phone = received.shop_phone == "None" ? null : received.shop_phone;
            // this.data.birth = received.shop_birthday_dt == "None" ? null : DateRobot.to_split(received.shop_birthday_dt);
            // this.data.sex = received.shop_sex == "None" ? null :  received.shop_sex;
            this.init();
        // });
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
        let phone = this.dom_row_shop_phone_input();
        let birth = this.dom_row_shop_birth_input();
        let sex = this.dom_row_shop_sex_input();
        let shop_auth = this.dom_row_shop_auth();
        // let shop_auth_list = this.dom_row_shop_auth_list();
        let html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('강사명', null, true) + name + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('휴대폰 번호') + phone + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('생년월일') + birth + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('성별') + sex + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                +'</div>' +
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('권한', null, true) + shop_auth + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'+
            '</div>';

        if(this.data_from_external != null){ // 재등록
            html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('강사명') + name +
            '</div>' +
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('권한', null, true) + shop_auth + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'+
            '</div>';
        }

        return html;
    }

    dom_row_toolbox(){
        let title = this.data_from_external == null ? '새로운 강사' : '등록';
        let html = `<div class="shop_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                        <div style="display:table-cell;width:200px;text-align:right; font-size:13px;" onclick="shop_add_popup.popup_device_contacts_list();">
                            주소록
                        </div>
                    </div>`;
        if(this.data_from_external != null){
            html = `<div class="shop_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                    </div>`;
        }
        if(device_info != 'app'){
            html = `<div class="shop_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                    </div>
                    `;
        }
        return html;
    }

    dom_row_shop_name_input(){
        let id = 'input_shop_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '강사명';
        let icon = CImg.members();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = this.data_from_external == null ? false : true;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,@一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = ". , + - _ @ 제외 특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            this.name = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_shop_phone_input(){
        let unit = '';
        let id = 'input_shop_phone';
        let title = this.data.phone == null ? '' : this.data.phone;
        let placeholder = '휴대폰 번호';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = this.data_from_external == null ? false : true;
        let pattern = "[0-9]{10,11}";
        if(this.data_from_external != null){ //재등록일 경우, 전화번호 일부값이 ***로 넘어오기때문에 패턴에 추가
            pattern = "[0-9*]{10,11}";
        }
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            this.phone = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_shop_birth_input(){
        //등록하는 행을 만든다.
        let id = 'input_shop_birth';
        let title = this.data.birth == null ? '생년월일' : Object.values(this.data.birth).join('.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.birth == null ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            //행을 클릭했을때 실행할 내용
            if(this.data_from_external != null){ //재등록
                show_error_message({title:"재등록 화면에서는 기본정보를 수정할 수 없습니다."});
                return false;
            }

            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.birth == null ? 1986 : this.data.birth.year; 
                let month = this.data.birth == null ? 2 : this.data.birth.month;
                let date = this.data.birth == null ? 24 : this.data.birth.date;
                
                date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'생년월일', data:{year:year, month:month, date:date},
                                                                                                range:{start: this.dates.current_year - 90, end: this.dates.current_year}, 
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.birth = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
                
            });
        });
        return html;
    }

    dom_row_shop_sex_input(){
        let id = 'input_shop_sex';
        let title = '성별';
        if(this.data.sex != null){
            if(this.data.sex=='M'){
                title = "남성";
            }
            else{
                title = "여성";
            }
        }
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.sex == null ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            if(this.data_from_external != null){
                show_error_message({title:"재등록 화면에서는 기본정보를 수정할 수 없습니다."});
                return false;
            }

            let user_option = {
                                male:{text:"남성", callback:()=>{this.sex = "M";layer_popup.close_layer_popup();}},
                                female:{text:"여성", callback:()=>{this.sex = "W";layer_popup.close_layer_popup();}}
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


    switch_type(){
        switch(this.list_type){
            case "lesson":
                this.init("off");
            break;

            case "off":
                this.init("lesson");
            break;
        }
    }

    send_data(){
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }
        if(Object.keys(this.data.shop_auth).length == 0){
            show_error_message({title:"허용 권한을 선택해주세요."});
            return false;
        }

        let recontract = this.data_from_external == null ? OFF : ON;
        let inspect = pass_inspector.shop();
        if(inspect.barrier == BLOCKED){
            this.data_sending_now = false;
            let message = {
                title:'강사 등록을 완료하지 못했습니다.',
                comment:`[${inspect.limit_type}] 이용자께서는 강사을 최대 ${inspect.limit_num}명까지 등록하실 수 있습니다.
                        <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까?</p>`
            };
            show_user_confirm (message, ()=>{
                layer_popup.all_close_layer_popup();
                sideGoPopup("pters_pass_main");
            });

            return false;
        }

        if(this.check_before_send() == false){
            this.data_sending_now = false;
            return false;
        }

        let data_for_new = {
                    "shop_id":this.data.shop_id,
                    "first_name": this.data.name,
                    "name":this.data.name,
                    "phone":this.data.phone,
                    "birthday": `${this.data.birth != null ? this.data.birth.year+'-'+this.data.birth.month+'-'+this.data.birth.date : ''}`,
                    "sex":this.data.sex,
                    "auth_cd": AUTH_TYPE_VIEW,
                    "auth_plan_create":this.data.shop_auth.auth_plan_create,
                    "auth_plan_read":this.data.shop_auth.auth_plan_read,
                    "auth_plan_update":this.data.shop_auth.auth_plan_update,
                    "auth_plan_delete":this.data.shop_auth.auth_plan_delete,

                    "auth_member_create":this.data.shop_auth.auth_member_create,
                    "auth_member_read":this.data.shop_auth.auth_member_read,
                    "auth_member_update":this.data.shop_auth.auth_member_update,
                    "auth_member_delete":this.data.shop_auth.auth_member_delete,

                    "auth_group_create":this.data.shop_auth.auth_group_create,
                    "auth_group_read":this.data.shop_auth.auth_group_read,
                    "auth_group_update":this.data.shop_auth.auth_group_update,
                    "auth_group_delete":this.data.shop_auth.auth_group_delete,

                    "auth_package_create":this.data.shop_auth.auth_package_create,
                    "auth_package_read":this.data.shop_auth.auth_package_read,
                    "auth_package_update":this.data.shop_auth.auth_package_update,
                    "auth_package_delete":this.data.shop_auth.auth_package_delete,

                    "auth_shop_create":this.data.shop_auth.auth_shop_create,
                    "auth_shop_read":this.data.shop_auth.auth_shop_read,
                    "auth_shop_update":this.data.shop_auth.auth_shop_update,
                    "auth_shop_delete":this.data.shop_auth.auth_shop_delete,

                    "auth_notice_create":this.data.shop_auth.auth_notice_create,
                    "auth_notice_read":this.data.shop_auth.auth_notice_read,
                    "auth_notice_update":this.data.shop_auth.auth_notice_update,
                    "auth_notice_delete":this.data.shop_auth.auth_notice_delete,

                    "auth_analytics_read":this.data.shop_auth.auth_analytics_read,

                    "auth_setting_read":this.data.shop_auth.auth_setting_read,
                    "auth_setting_update":this.data.shop_auth.auth_setting_update,
        };

        let data_for_re = {
            "shop_id":this.data.shop_id,
            "auth_cd": AUTH_TYPE_WAIT,
            "auth_plan_create":this.data.shop_auth.auth_plan_create,
            "auth_plan_read":this.data.shop_auth.auth_plan_read,
            "auth_plan_update":this.data.shop_auth.auth_plan_update,
            "auth_plan_delete":this.data.shop_auth.auth_plan_delete,

            "auth_member_create":this.data.shop_auth.auth_member_create,
            "auth_member_read":this.data.shop_auth.auth_member_read,
            "auth_member_update":this.data.shop_auth.auth_member_update,
            "auth_member_delete":this.data.shop_auth.auth_member_delete,

            "auth_group_create":this.data.shop_auth.auth_group_create,
            "auth_group_read":this.data.shop_auth.auth_group_read,
            "auth_group_update":this.data.shop_auth.auth_group_update,
            "auth_group_delete":this.data.shop_auth.auth_group_delete,

            "auth_package_create":this.data.shop_auth.auth_package_create,
            "auth_package_read":this.data.shop_auth.auth_package_read,
            "auth_package_update":this.data.shop_auth.auth_package_update,
            "auth_package_delete":this.data.shop_auth.auth_package_delete,

            "auth_shop_create":this.data.shop_auth.auth_shop_create,
            "auth_shop_read":this.data.shop_auth.auth_shop_read,
            "auth_shop_update":this.data.shop_auth.auth_shop_update,
            "auth_shop_delete":this.data.shop_auth.auth_shop_delete,

            "auth_notice_create":this.data.shop_auth.auth_notice_create,
            "auth_notice_read":this.data.shop_auth.auth_notice_read,
            "auth_notice_update":this.data.shop_auth.auth_notice_update,
            "auth_notice_delete":this.data.shop_auth.auth_notice_delete,

            "auth_analytics_read":this.data.shop_auth.auth_analytics_read,

            "auth_setting_read":this.data.shop_auth.auth_setting_read,
            "auth_setting_update":this.data.shop_auth.auth_setting_update,
        };

        if(this.data_from_external == null){ //신규 강사 등록
            Shop_func.create_pre(data_for_new, (received)=>{
                data_for_new.shop_id = received.user_db_id[0];
                Shop_func.create(data_for_new, ()=>{
                    this.data_sending_now = false;
                    try{
                        current_page.init();
                    }catch(e){}
                }, ()=>{this.data_sending_now = false;});
            }, ()=>{this.data_sending_now = false;});
        }else{ // 재등록
            Shop_func.create(data_for_re, ()=>{
                // shop_ticket_history.init();
                this.data_sending_now = false;
                try{
                    shop_view_popup.set_initial_data();
                }catch(e){
                    console.log(e);
                }
                try{
                    current_page.init();
                }catch(e){
                    console.log(e);
                }
            }, ()=>{this.data_sending_now = false;});
        }

        layer_popup.close_layer_popup();
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

    popup_device_contacts_list(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SHOP_CONTACTS_SELECT, 100, popup_style, {'shop_id':null}, ()=>{
            shop_contacts_select = new MemberContactsSelector('#wrapper_box_shop_contacts_select', this, '주소록', (set_data)=>{
                this.shop = set_data;
                this.data.shop_id = set_data.shop_id;
                this.data.phone = set_data.phone;
                this.data.name = set_data.name;
                this.render_content();
            });
        });
    }
}