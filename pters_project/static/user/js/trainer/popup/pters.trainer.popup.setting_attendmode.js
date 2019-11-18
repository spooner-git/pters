class Setting_attendmode{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_attendmode_toolbox', content:'section_setting_attendmode_content'};

        this.data = {
                display_session_start:{text:[], value:[]},
                display_session_end:{text:[], value:[]},
                password:null
        };

        this.data_for_selector = {
            display_session_start : 
                {value:[0, 5, 10, 15, 20, 25, 30], text:["시작 0 분 부터", "시작 5 분 전부터", "시작 10 분 전부터", "시작 15 분 전부터", "시작 20 분 전부터", "시작 25 분 전부터", "시작 30 분 전부터"]},
            display_session_end:
            {value:[0, 5, 10, 15, 20, 25, 30], text:["종료 0 분 후까지", "종료 5 분 후까지", "종료 10 분 후까지", "종료 15 분 후까지", "종료 20 분 후까지", "종료 25 분 후까지", "종료 30 분 후까지"]}
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_attendmode_func.read((data)=>{
            this.data.display_session_start.value[0] = data.setting_attend_class_prev_display_time;
            this.data.display_session_start.text[0] = this.data_for_selector.display_session_start.text[ this.data_for_selector.display_session_start.value.indexOf(data.setting_attend_class_prev_display_time)  ];
            this.data.display_session_end.value[0] = data.setting_attend_class_after_display_time;
            this.data.display_session_end.text[0] = this.data_for_selector.display_session_end.text[ this.data_for_selector.display_session_end.value.indexOf(data.setting_attend_class_after_display_time)  ];
            this.data.password = data.setting_admin_password;
            this.render_content();
        });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_attendmode_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="setting_attendmode_popup.upper_right_menu();">${CImg.confirm()}</span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_attendmode .wrapper_top').style.border = 0;
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
        let html = 
                    '<article class="obj_input_box_full">' +
                       this.dom_row_display_session_start() + 
                       this.dom_row_display_session_end() +
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_set_password() + 
                    '</article>';
        return html;
    }

    dom_row_display_session_start(){
        let id = "display_session_start";
        let title = "수업 시작 표시";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.display_session_start.text.length == 0 ? '' : this.data.display_session_start.text;
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "수업 시작 표시";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = this.data_for_selector.display_session_start;
            let selected_data = this.data.display_session_start;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.display_session_start = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }

    dom_row_display_session_end(){
        let id = "display_session_end";
        let title = "수업 종료 표시";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.display_session_end.text.length == 0 ? '' : this.data.display_session_end.text;
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "수업 종료 표시";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = this.data_for_selector.display_session_end;
            let selected_data = this.data.display_session_end;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.display_session_end = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }

    dom_row_set_password(){
        let id = "set_password";
        let title = "비밀번호 설정";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.password == null ? '설정되지 않음' : this.data.password;
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "비밀번호 설정";
            let install_target = "#wrapper_box_password_4d_input";
            let original_data = "0000";
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PASSWORD_4D_INPUT, 100, popup_style, null, ()=>{
                password_4d_input = new PasswordFourDigitInput(title, install_target, original_data, (set_data)=>{
                    this.data.password = set_data.password;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }


    dom_row_toolbox(){
        let title = "출석 체크 모드 설정";
        let description = "";
        let html = `
        <div class="setting_reserve_upper_box" style="">
            <div style="display:inline-block;">
                <span style="display:inline-block;font-size:23px;font-weight:bold">
                    ${title}
                    ${description}
                </span>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    art_data(start_time, end_time){
        let merged;
        if(start_time == null && end_time == null){
            merged = `00:00-23:59`;
        }else if(start_time == null && end_time != null){
            merged = `00:00-${end_time}`;
        }else if(start_time != null && end_time == null){
            merged = `${start_time}-23:59`;
        }else{
            merged = start_time + '-' + end_time;
        }

        if(this.data.GENERAL.detail_switch == OFF){
            merged = this.data.GENERAL.start_time + '-' + this.data.GENERAL.end_time;
        }

        return merged;
    }

    send_data(){
        let data = {
            "setting_admin_password":this.data.password,
            "setting_attend_class_prev_display_time":this.data.display_session_start.value[0],
            "setting_attend_class_after_display_time":this.data.display_session_end.value[0],
        };
        
        Setting_attendmode_func.update(data, ()=>{
            this.set_initial_data();
            show_error_message('변경 내용이 저장되었습니다.');
            // this.render_content();
        });
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_attendmode_func{
    static update(data, callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_attend_mode_setting/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data); 
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    static read(callback){
        $.ajax({
            url:"/trainer/get_trainer_setting_data/",
            type:'GET',
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }
}


