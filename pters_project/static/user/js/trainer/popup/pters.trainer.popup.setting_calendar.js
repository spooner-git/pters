class Setting_calendar{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_calendar_toolbox', content:'section_setting_calendar_content'};
        this.data_sending_now = false;
        this.TIME_INPUT_SELECTOR = {
            0:"기본",
            1:"클래식"
        };

        this.data = {
            start_day:null,
            calendar_time_input_type: {value:[], text:[]},
            calendar_basic_select_time:{value:[], text:[]},
            sing_use:OFF
        };

        this.data_for_selector = {
            calendar_basic_select_time : 
                // {value:[10, 15, 20, 30, 60, 90, 120], text:["10 분", "15 분", "20 분", "30 분", "1 시간", "1시간 30분", "2 시간"]}
                {value:[10, 20, 30, 40, 50, 60], text:["10분", "20분", "30분", "40분", "50분", "1 시간"]}
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_calendar_func.read((data)=>{
            this.data.start_day = data.setting_week_start_date;
            this.data.calendar_time_input_type.value[0] = Number(data.setting_calendar_time_selector_type);
            this.data.calendar_time_input_type.text[0] = this.TIME_INPUT_SELECTOR[Number(data.setting_calendar_time_selector_type)];
            this.data.sing_use = data.setting_schedule_sign_enable;
            let current_calendar_basic_select_time = Number(data.setting_calendar_basic_select_time);

            //수업 기본 시간
            this.data.calendar_basic_select_time.value[0] = current_calendar_basic_select_time;
            this.data.calendar_basic_select_time.text[0] = this.data_for_selector.calendar_basic_select_time.text[ this.data_for_selector.calendar_basic_select_time.value.indexOf(Number(current_calendar_basic_select_time) ) ];

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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_calendar_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="setting_calendar_popup.upper_right_menu();"><span style="color:var(--font-highlight);font-weight: 500;">저장</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_calendar .wrapper_top').style.border = 0;
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
        let html =  '<article class="obj_input_box_full" style="padding-right:10px;">' +
                        this.dom_row_start_day_setting() + 
                    '</article>' +
                    '<article class="obj_input_box_full" style="padding-top:5px;padding-right:10px;">' +
                        this.dom_row_calendar_basic_select_time() + 
                        "<span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>달력 클릭/OFF 일정 클릭시 선택되는 기본 시간입니다.</span>" +
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_sign_use() + 
                        "<span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>출석 처리 시 서명을 입력받을 수 있습니다.</span>" +
                    '</article>' +
                    '<article class="obj_input_box_full" style="padding-top:5px;padding-right:10px;">' +
                    this.dom_row_select_time_input_method() +
                    '</article>';
        return html;
    }

    dom_row_start_day_setting(){
        let day_name = {"SUN": "일요일", "MON": "월요일"};
        let id = "start_day_setting";
        let title = "한 주의 시작요일";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = day_name[this.data.start_day] == null ? "" : day_name[this.data.start_day];
        let style = null;
        let onclick = ()=>{
            let user_option = {
                sunday:{text:"일요일", callback:()=>{
                    this.data.start_day = "SUN";
                    layer_popup.close_layer_popup();
                    this.render_content();
                }},
                monday:{text:"월요일", callback:()=>{
                    this.data.start_day = "MON";
                    layer_popup.close_layer_popup();
                    this.render_content();
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

        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);

        let html = `<article class="setting_worktime_wrapper">
                        ${row}
                    </article>
                    `;
        return html;
    }

    dom_row_calendar_basic_select_time(){
        let id = "calendar_basic_select_time";
        let title = "기본 선택 시간";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.calendar_basic_select_time.text.length == 0 ? '' : this.data.calendar_basic_select_time.text;
        let style = {"height":"auto", "padding-bottom":"0"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "기본 선택 시간";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = this.data_for_selector.calendar_basic_select_time;
            let selected_data = this.data.calendar_basic_select_time;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.calendar_basic_select_time = set_data;
                    this.render_content();
                });
            });
        });
        let html = `<article class="setting_worktime_wrapper">
                        ${row}
                    </article>
                    `;
        return html;
    }

    dom_row_sign_use(){
        let id = `sign_use`;
        let power = this.data.sing_use;
        let style = null;
        let sing_use_toggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.sing_use = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("sing_use_text", '출석 시 서명 입력', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `
                    <div style="display:table;width:100%;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle">${sing_use_toggle}</div>
                    </div>
                   `;
        return html;
    }

    dom_row_select_time_input_method(){
        let id = "calendar_select_time_input_method";
        let title = "시간 입력 방식";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.calendar_time_input_type.text;
        let style = {"height":"auto", "padding-bottom":"0"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "시간 입력 방식";
            let install_target = "#wrapper_box_custom_select";
            let selected_data = this.data.calendar_time_input_type;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
                custom_selector = new TimeInputMethodSelector(title, install_target, selected_data, (set_data)=>{
                    this.data.calendar_time_input_type = set_data;
                    this.render_content();
                });
            });
        });
        let html = `<article class="setting_worktime_wrapper">
                        ${row}
                    </article>
                    `;
        return html;
    }


    dom_row_toolbox(){
        let title = "일정 설정";
        let description = "<p style='font-size:14px;font-weight:500;'>일정 메뉴와 관련된 설정입니다.</p>";
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
            "setting_week_start_date":this.data.start_day,
            "setting_calendar_time_selector_type":this.data.calendar_time_input_type.value[0],
            "setting_calendar_basic_select_time":this.data.calendar_basic_select_time.value[0],
            "setting_schedule_sign_enable": this.data.sing_use
        };
        Setting_calendar_func.update(data, ()=>{
            this.data_sending_now = false;
            this.set_initial_data();
            show_error_message({title:'설정이 저장되었습니다.'});
        }, ()=>{this.data_sending_now = false;});
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_calendar_func{
    static update(data, callback, error_callback){
        //setting_calendar_time_selector_type, setting_calendar_basic_select_time
        $.ajax({
            url:"/trainer/update_setting_calendar_setting/",
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


