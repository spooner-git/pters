class Setting_attendmode{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_attendmode_toolbox', content:'section_setting_attendmode_content'};

        this.data = {
                display_session_start:{text:[], value:[]},
                display_session_end:{text:[], value:[]},
                password:null
        };

        this.init();
    }

 
    init(){
        this.set_initial_data();
    }

    set_initial_data (){
        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/navigate_before_black.png" onclick="layer_popup.close_layer_popup();setting_attendmode_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_done.png" onclick="setting_attendmode_popup.upper_right_menu();" class="obj_icon_prev"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_attendmode .wrapper_top').style.border = 0;
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
            let data = {value:[0, 5, 10, 15, 20, 25, 30], text:["0 분전", "5 분전", "10 분전", "15 분전", "20 분전", "25 분전", "30 분전"]};
            let selected_data = this.data.display_session_start;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
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
            let data = {value:[0, 5, 10, 15, 20, 25, 30], text:["0 분전", "5 분전", "10 분전", "15 분전", "20 분전", "25 분전", "30 분전"]};
            let selected_data = this.data.display_session_end;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
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
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PASSWORD_4D_INPUT, 100, POPUP_FROM_RIGHT, null, ()=>{
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
        let html = `
        <div class="setting_reserve_upper_box" style="">
            <div style="display:inline-block;width:320px;">
                <div style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
                    ${title}
                </div>
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
            "setting_trainer_work_sun_time_avail":this.art_data(this.data.SUN.start_time, this.data.SUN.end_time),
            "setting_trainer_work_mon_time_avail":this.art_data(this.data.MON.start_time, this.data.MON.end_time),
            "setting_trainer_work_tue_time_avail":this.art_data(this.data.TUE.start_time, this.data.TUE.end_time),
            "setting_trainer_work_wed_time_avail":this.art_data(this.data.WED.start_time, this.data.WED.end_time),
            "setting_trainer_work_ths_time_avail":this.art_data(this.data.THS.start_time, this.data.THS.end_time),
            "setting_trainer_work_fri_time_avail":this.art_data(this.data.FRI.start_time, this.data.FRI.end_time),
            "setting_trainer_work_sat_time_avail":this.art_data(this.data.SAT.start_time, this.data.SAT.end_time)
        };
        
        Setting_reserve_func.update(data, ()=>{
            this.render_content();
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
            url:"/trainer/update_setting_basic/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
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


