class Setting_menu_access{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_menu_access_toolbox', content:'section_setting_menu_access_content'};
        this.data_sending_now = false;

        this.data = {
            password:null,
            menu_lock:{
                program:OFF,
                schedule:OFF,
                member:OFF,
                lecture:OFF,
                ticket:OFF,
                statistics:OFF,
                attend_mode_out:OFF
            }
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_menu_access_func.read((data)=>{
            this.data.password = data.setting_admin_password;
            this.data.menu_lock.attend_mode_out = data.setting_trainer_attend_mode_out_lock;
            this.data.menu_lock.statistics = data.setting_trainer_statistics_lock;
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_menu_access_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="setting_menu_access_popup.upper_right_menu();">${CImg.confirm()}</span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_menu_access .wrapper_top').style.border = 0;
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
                        this.dom_row_set_password() + 
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_menu_lock_title() +
                        // this.dom_row_menu_lock_program() +
                        // this.dom_row_menu_lock_schedule() + 
                        // this.dom_row_menu_lock_member() +
                        // this.dom_row_menu_lock_lecture() +
                        // this.dom_row_menu_lock_ticket() +
                        this.dom_row_menu_lock_statistics() +
                        this.dom_row_menu_lock_attend_mode_out() +
                        // this.dom_test_button() + 
                    '</article>';
        return html;
    }

    dom_row_menu_lock_title(){
        let id = "menu_lock_title";
        let title_description = `<p style="font-size:12px;font-weight:500;margin:0;color:var(--font-sub-normal)">접근 시 잠금 해제 비밀번호를 입력 해야합니다.</p>`;
        let title = `잠금 ${title_description}`;
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"cursor":"unset", "height":"auto"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            
        });
        let html = row;
        return html;
    }

    dom_row_menu_lock_program(){
        let id = `menu_lock_program`;
        let power = this.data.menu_lock.program;
        let style = null;
        let menu_lock_goggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.menu_lock.program = data; // ON or OFF
                                this.render_content();
                            });
        let icon = power == ON ? CImg.lock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"}) : CImg.unlock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"});
        let title = `${icon} 프로그램`;
        let title_row = CComponent.text_button ("program_lock_toggle", title, {"font-size":"14px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="setting_menu_lock_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${menu_lock_goggle}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_menu_lock_schedule(){
        let id = `menu_lock_schedule`;
        let power = this.data.menu_lock.schedule;
        let style = null;
        let menu_lock_goggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.menu_lock.schedule = data; // ON or OFF
                                this.render_content();
                            });
        let icon = power == ON ? CImg.lock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"}) : CImg.unlock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"});
        let title = `${icon} 일정`;
        let title_row = CComponent.text_button ("schedule_lock_toggle", title, {"font-size":"14px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="setting_menu_lock_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${menu_lock_goggle}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_menu_lock_member(){
        let id = `menu_lock_member`;
        let power = this.data.menu_lock.member;
        let style = null;
        let menu_lock_goggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.menu_lock.member = data; // ON or OFF
                                this.render_content();
                            });
        let icon = power == ON ? CImg.lock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"}) : CImg.unlock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"});
        let title = `${icon} 회원`;
        let title_row = CComponent.text_button ("member_lock_toggle", title, {"font-size":"14px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="setting_menu_lock_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${menu_lock_goggle}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_menu_lock_lecture(){
        let id = `menu_lock_lecture`;
        let power = this.data.menu_lock.lecture;
        let style = null;
        let menu_lock_goggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.menu_lock.lecture = data; // ON or OFF
                                this.render_content();
                            });
        let icon = power == ON ? CImg.lock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"}) : CImg.unlock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"});
        let title = `${icon} 수업`;
        let title_row = CComponent.text_button ("lecture_lock_toggle", title, {"font-size":"14px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="setting_menu_lock_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${menu_lock_goggle}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_menu_lock_ticket(){
        let id = `menu_lock_ticket`;
        let power = this.data.menu_lock.ticket;
        let style = null;
        let menu_lock_goggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.menu_lock.ticket = data; // ON or OFF
                                this.render_content();
                            });
        let icon = power == ON ? CImg.lock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"}) : CImg.unlock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"});
        let title = `${icon} 수강권`;
        let title_row = CComponent.text_button ("ticket_lock_toggle", title, {"font-size":"14px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="setting_menu_lock_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${menu_lock_goggle}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_menu_lock_statistics(){
        let id = `menu_lock_statistics`;
        let power = this.data.menu_lock.statistics;
        let style = null;
        let menu_lock_goggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.menu_lock.statistics = data; // ON or OFF
                                this.render_content();
                            });
        let icon = power == ON ? CImg.lock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"}) : CImg.unlock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"});
        let title = `${icon} 통계 정보 조회`;
        let title_row = CComponent.text_button ("statistics_lock_toggle", title, {"font-size":"14px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="setting_menu_lock_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${menu_lock_goggle}</div>
                        </div>
                    </article>`;
        return html;
    }
    dom_row_menu_lock_attend_mode_out(){
        let id = `menu_lock_attend_mode_out`;
        let power = this.data.menu_lock.attend_mode_out;
        let style = null;
        let menu_lock_goggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.menu_lock.attend_mode_out = data; // ON or OFF
                                this.render_content();
                            });
        let icon = power == ON ? CImg.lock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"}) : CImg.unlock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"});
        let title = `${icon} 출석체크 모드 종료 시 비밀번호 입력`;
        let title_row = CComponent.text_button ("statistics_lock_toggle", title, {"font-size":"14px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="setting_menu_lock_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${menu_lock_goggle}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_menu_lock_attendmode(){
        let id = `menu_lock_attendmode`;
        let power = this.data.menu_lock.attendmode;
        let style = null;
        let menu_lock_goggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.menu_lock.attendmode = data; // ON or OFF
                                this.render_content();
                            });
        let icon = power == ON ? CImg.lock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"}) : CImg.unlock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"});
        let title = `${icon} 출석 체크 모드 나가기`;
        let title_row = CComponent.text_button ("attendmode_lock_toggle", title, {"font-size":"14px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="setting_menu_lock_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${menu_lock_goggle}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_set_password(){
        let id = "set_password";
        let title_description = `<p style="font-size:12px;font-weight:500;margin:0;color:var(--font-sub-normal)">잠금 해제시 사용</p>`;
        let title = `잠금 해제 비밀번호 설정 ${title_description}`;
        let icon = DELETE;
        let icon_r_visible = SHOW;
        // let icon_r_text = this.data.password == null ? '설정되지 않음' : "";
        let icon_r_text = "";
        let style = {"height":"auto", "padding-bottom": "0"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "잠금 해제 비밀번호 설정";
            let install_target = "#wrapper_box_password_4d_input";
            let original_data = this.data.password == null ? "0000" : this.data.password;
            // let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            let popup_style = POPUP_FROM_TOP;
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
        let title = "정보 보호";
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
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }

        let data = {
            "setting_admin_password":this.data.password,
            "setting_trainer_statistics_lock":this.data.menu_lock.statistics,
            "setting_trainer_attend_mode_out_lock":this.data.menu_lock.attend_mode_out
        };
        
        Setting_menu_access_func.update(data, ()=>{
            this.data_sending_now = false;
            this.set_initial_data();
            show_error_message('변경 내용이 저장되었습니다.');
            // this.render_content();
        });
    }

    upper_right_menu(){
        this.send_data();
    }

   
}

class Setting_menu_access_func{
    static update(data, callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_setting_access_lock/",
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

    static locked_menu(callback){
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, 'popup_password_4d_input', 100*300/root_content_height, POPUP_FROM_TOP, null, ()=>{
            Setting_menu_access_func.read((data)=>{
                let password = data.setting_admin_password;
                let title = "비밀번호 입력";
                let install_target = "#wrapper_box_password_4d_input";
                let original_data = password == null || password == undefined || password == "" ? "0000" : password;
                password_input = new PasswordInput(title, install_target, original_data, ()=>{
                    callback();
                });
            });
        });
    }
}


