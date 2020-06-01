class Trainer_view{
    constructor(install_target, trainer_id, instance){
        this.target = {install: install_target, toolbox:'section_trainer_view_toolbox', content:'section_trainer_view_content'};
        this.instance = instance;
        this.trainer_id = trainer_id;
        this.form_id = 'id_trainer_view_form';

        this.if_user_changed_any_information = false;

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

            connection: null,
            active: null,
            repeat: [],
            lecture: []
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
        // let memo = this.dom_row_trainer_memo_input();
        let tag_id = this.data.active == 'True' || this.data.active == null ? '아이디' : '아이디 <span style="color:var(--font-highlight);margin-left:3px;">(임시아이디, 비밀번호 0000)</span>';

        let tab_basic_info =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag(tag_id) + user_id + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('휴대폰 번호') + phone + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('생년월일') + birth + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('성별') + sex +
            '</div>';

        let tab_repeat_info = 
            '<div class="obj_input_box_full" style="padding-right:18px">' +
                // CComponent.dom_tag('반복 일정', {"padding-left":"0"}) + 
                repeat +
            '</div>';

        let tab_lecture_info =
            '<div class="obj_input_box_full" style="padding-right:18px">' +
                // CComponent.dom_tag('반복 일정', {"padding-left":"0"}) +
                lecture +
            '</div>';

        let selected_tab;
        if(this.list_type == "basic_info"){
            selected_tab = tab_basic_info;
        }else if(this.list_type == "repeat_info"){
            selected_tab = tab_repeat_info;
        }else if(this.list_type == "lecture_info"){
            selected_tab = tab_lecture_info;
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

            case "lecture_info":
                this.list_type = "lecture_info";
                this.render();
            break;

            case "repeat_info":
                this.list_type = "repeat_info";
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
                            show_user_confirm ({title:`정말 연결을 해제하시겠습니까?`}, ()=>{
                                layer_popup.close_layer_popup();
                                layer_popup.close_layer_popup();
                                let data = {"trainer_id":this.trainer_id, "trainer_auth_cd":AUTH_TYPE_DELETE};
                                Trainer_func.connection(data, ()=>{
                                    this.set_initial_data();
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
                            show_user_confirm ({title:`연결 요청을 취소하겠습니까?`}, ()=>{
                                layer_popup.close_layer_popup();
                                layer_popup.close_layer_popup();
                                let data = {"trainer_id":this.trainer_id, "trainer_auth_cd":AUTH_TYPE_DELETE};
                                Trainer_func.connection(data, ()=>{
                                    this.set_initial_data();
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
                                let data = {"trainer_id":this.trainer_id, "trainer_auth_cd":AUTH_TYPE_VIEW};
                                Trainer_func.connection(data, ()=>{
                                    this.set_initial_data();
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
                        trainer_schedule_history = new Member_schedule_history('.popup_trainer_schedule_history', this.trainer_id, null);
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

    event_view_lecture(lecture_id){
        let auth_inspect = pass_inspector.lecture_read();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            show_error_message({title:message});
            return false;
        }

        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_VIEW, 100, popup_style, {'lecture_id':lecture_id}, ()=>{
            lecture_view_popup = new Lecture_view('.popup_lecture_view', lecture_id, 'lecture_view_popup');
        });
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

    upper_left_menu(){
        if(this.if_user_changed_any_information == true){
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
                        comment:`다시 복구할 수 없습니다. <br> <span style="color:var(--font-highlight);">관련 일정/수업에서도 정보가 삭제됩니다.</span>`
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
                    trainer_view_popup = new Trainer_view('.popup_trainer_view', this.trainer_id, 'trainer_view_popup');
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