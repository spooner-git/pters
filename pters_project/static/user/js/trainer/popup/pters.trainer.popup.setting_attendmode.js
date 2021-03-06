class Setting_attendmode{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_attendmode_toolbox', content:'section_setting_attendmode_content'};
        this.data_sending_now = false;

        this.data = {
                display_session_start:{text:[], value:[]},
                display_session_end:{text:[], value:[]},
                setting_attend_mode_max_num_view_available:ON,
                password:null
        };

        this.data_for_selector = {
            display_session_start :
                {value:[0, 5, 10, 15, 20, 25, 30], text:["시작 0분 전부터", "시작 5분 전부터", "시작 10분 전부터", "시작 15분 전부터", "시작 20분 전부터", "시작 25분 전부터", "시작 30분 전부터"]},
            display_session_end:
            {value:[0, 5, 10, 15, 20, 25, 30], text:["종료 0분 후까지", "종료 5분 후까지", "종료 10분 후까지", "종료 15분 후까지", "종료 20분 후까지", "종료 25분 후까지", "종료 30분 후까지"]}
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
            this.data.setting_attend_mode_max_num_view_available = data.setting_attend_mode_max_num_view_available;
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
        // let top_right = `<span class="icon_right" onclick="setting_attendmode_popup.upper_right_menu();">${CImg.confirm()}</span>`;
        let top_right = `<span class="icon_right" onclick="setting_attendmode_popup.upper_right_menu();"><span style="color:var(--font-highlight);font-weight: 500;">저장</span></span>`;
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
                    '</article>'+
                    '<article class="obj_input_box_full">' +
                        this.dom_row_capacity_visible() +
                        "<span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>출석체크 모드에서 회원님들이 정원/출석/예약 숫자를 볼 수 있습니다.</span>" +
                    '</article>';
                    // '<article class="obj_input_box_full">' +
                    //     this.dom_row_set_password() +
                    // '</article>';
        return html;
    }

    dom_row_display_session_start(){
        let id = "display_session_start";
        let title = "출석체크 시작 시간";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.display_session_start.text.length == 0 ? '' : this.data.display_session_start.text;
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "출석체크 시작 시간";
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
        let title = "출석체크 종료 시간";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.display_session_end.text.length == 0 ? '' : this.data.display_session_end.text;
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "출석체크 종료 시간";
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

    dom_row_capacity_visible(){
        let id = `capacity_visible`;
        let power = this.data.setting_attend_mode_max_num_view_available;
        let style = null;
        let capacity_visible_toggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.setting_attend_mode_max_num_view_available = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("capacity_visible_text", '[정원/출석/예약] 숫자 표기', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `
                    <div style="display:table;width:100%;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle">${capacity_visible_toggle}</div>
                    </div>
                   `;
        return html;
    }

    dom_row_set_password(){
        let id = "set_password";
        let title_description = `<p style="font-size:12px;font-weight:500;margin:0;color:var(--font-sub-normal)">출석 체크 모드와 통계 잠금에서 사용</p>`;
        let title = `관리자 비밀번호 설정 ${title_description}`;
        let icon = DELETE;
        let icon_r_visible = SHOW;
        // let icon_r_text = this.data.password == null ? '설정되지 않음' : "";
        let icon_r_text = "";
        let style = {"height":"auto", "padding-bottom": "0"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "관리자 비밀번호 설정";
            let install_target = "#wrapper_box_password_4d_input";
            let original_data = this.data.password == null ? "0000" : this.data.password;
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
        let auth_inspect = pass_inspector.setting_update();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            show_error_message({title:message});
            return false;
        }
        
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }

        let data = {
            "setting_admin_password":this.data.password,
            "setting_attend_class_prev_display_time":this.data.display_session_start.value[0],
            "setting_attend_class_after_display_time":this.data.display_session_end.value[0],
            "setting_attend_mode_max_num_view_available":this.data.setting_attend_mode_max_num_view_available,
        };
        
        Setting_attendmode_func.update(data, ()=>{
            this.data_sending_now = false;
            this.set_initial_data();
            show_error_message({title:'설정이 저장되었습니다.'});
            // this.render_content();
        }, ()=>{this.data_sending_now = false;});
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_attendmode_func{
    static update(data, callback, error_callback){
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
                        show_error_message({title:data.messageArray[0]});
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
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
            }
        });
    }

    static read(callback, error_callback){
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
                        show_error_message({title:data.messageArray[0]});
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
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
            }
        });
    }
}


