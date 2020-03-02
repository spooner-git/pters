class Setting_alarm_personal{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_alarm_personal_toolbox', content:'section_setting_alarm_personal_content'};
        this.data_sending_now = false;

        this.data = {
            push_to_me: OFF,
            setting_change_all: OFF,
            setting_schedule_alarm_minute:{value:[], text:[]}
        };

        this.data_for_selector = {
            setting_schedule_alarm_minute:
                {value:[-1, 0, 5, 10, 15, 20, 30, 60, 120, 1440, 2880], text:["설정 안함", "시작", "5분전", "10분전", "15분전", "20분전", "30분전", "1시간 전", "2시간 전", "1일 전", "2일 전"]}
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_alarm_personal_func.read((data)=>{
            this.data.push_to_me = data.setting_from_trainee_lesson_alarm;
            this.data.setting_schedule_alarm_minute.value[0] = data.setting_schedule_alarm_minute;
            this.data.setting_schedule_alarm_minute.text[0] = this.data_for_selector.setting_schedule_alarm_minute.text[ this.data_for_selector.setting_schedule_alarm_minute.value.indexOf(Number(data.setting_schedule_alarm_minute) ) ];
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_alarm_personal_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        // let top_right = `<span class="icon_right" onclick="setting_alarm_personal_popup.upper_right_menu();">${CImg.confirm()}</span>`;
        let top_right = `<span class="icon_right" onclick="setting_alarm_personal_popup.upper_right_menu();"><span style="color:var(--font-highlight);font-weight: 500;">저장</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_alarm_personal .wrapper_top').style.border = 0;
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

        let html = this.dom_row_push_to_me() +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_setting_schedule_alarm_minute_input() +
                       // "<span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>일정 시작전 PUSH 알림</span>"+
                    '</article>';
        return html;
    }

    dom_row_toolbox(){
        let title = "알림";
        let html = `
        <div class="setting_autocomplete_upper_box" style="">
            <div style="display:inline-block;">
                <span style="display:inline-block;font-size:23px;font-weight:bold">
                    ${title}
                </span>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    // dom_row_push_to_member(){
    //     let id = `push_to_member`;
    //     let power = this.data.push_to_member;
    //     let style = null;
    //     let push_to_member_toggle = CComponent.toggle_button (id, power, style, (data)=>{
    //                             this.data.push_to_member = data; // ON or OFF
    //                             this.render_content();
    //                         });
    //     let title_row = CComponent.text_button ("ntd", '(회원에게) 일정 변경 알림', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
    //     let html = `<article class="obj_input_box_full">
    //                     <div style="display:table;width:100%;">
    //                         <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
    //                         <div style="display:table-cell;width:50px;vertical-align:middle">${push_to_member_toggle}</div>
    //                     </div>
    //                 </article>`;
    //     return html;
    // }

    dom_row_push_to_me(){
        let id = `push_to_me`;
        let power = this.data.push_to_me;
        let style = null;
        let push_to_me_toggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.push_to_me = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("ntd", '(나에게) 현재 프로그램 PUSH 알림', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${push_to_me_toggle}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_setting_schedule_alarm_minute_input(){
        let id = "setting_schedule_alarm_minute";
        let title = "일정 시작전 PUSH 알림";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.setting_schedule_alarm_minute.text.length == 0 ? '' : this.data.setting_schedule_alarm_minute.text;
        let style = {"padding-bottom":"0", "padding-top":"24px;", "padding-right":"10px"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "PUSH 알림 시간";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = this.data_for_selector.setting_schedule_alarm_minute;
            let selected_data = this.data.setting_schedule_alarm_minute;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.setting_schedule_alarm_minute = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
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
            "setting_from_trainee_lesson_alarm":this.data.push_to_me,
            "setting_schedule_alarm_minute":this.data.setting_schedule_alarm_minute.value[0]
        };
        
        Setting_alarm_personal_func.update(data, ()=>{
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

class Setting_alarm_personal_func{
    static update(data, callback, error_callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_setting_push_to_me/",
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


