class Setting_calendar{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_calendar_toolbox', content:'section_setting_calendar_content'};

        this.data = {
            start_day:null,
            calendar_time_input_type: BASIC,
            calendar_basic_select_time:{value:[], text:[]},
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
            this.data.calendar_time_input_type = Number(data.setting_calendar_time_selector_type);
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
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();setting_calendar_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_confirm_black.png" onclick="setting_calendar_popup.upper_right_menu();" class="obj_icon_prev"></span>`;
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
        let html =  '<article class="obj_input_box_full" style="padding:0;">' +
                        this.dom_row_start_day_setting() + 
                    '</article>' +
                    '<article class="obj_input_box_full" style="padding-top:5px;">' +
                        this.dom_row_calendar_basic_select_time() + 
                        "<span style='font-size:12px;color:#3b3b3b;letter-spacing:-0.6px;font-weight:normal'>달력 클릭/OFF 일정 클릭시 선택되는 기본 시간입니다.</span>" +
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_calendar_title() +
                        this.dom_row_calendar_time_input_type_new() + 
                        this.dom_row_calendar_time_input_type_classic() +
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
            let button_height = 8 + 8 + 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        };

        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);

        let html = `<article class="setting_worktime_wrapper obj_input_box_full" style="padding-right:10px;">
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

    dom_row_calendar_title(){
        
        let id = "calendar_title";
        let title = "시간 입력 방식";
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            
        });
        let html = `<article class="setting_worktime_wrapper">
                        ${row}
                    </article>
                    `;
        return html;
    }

    dom_row_calendar_time_input_type_new(){
        let selected_or_not = this.data.calendar_time_input_type == BASIC ? "selected" : "";
        let html = `<div class="select_wrap ${selected_or_not}" id="input_method_new">
                        <div class="select_indicator">
                            ${CComponent.radio_button("time_input_select_new", this.data.calendar_time_input_type == BASIC ? ON : OFF, {"transform":"scale(1.2)", "display":"inline-block", "margin-right":"5px"}, ()=>{})}
                            <span>기본</span>
                            <p>시작과 종료시간을 각각 상세하게 설정 합니다. <br>겹치는 일정을 상관없이 모두 표기해 줍니다.</p>
                        </div>
                        <div>
                            <img src="/static/common/img/time_input_method/calendar_time_input_type_new.png?v2">
                        </div>
                    </div>`;
        $(document).off('click', '#input_method_new').on('click', '#input_method_new', (e)=>{
            e.stopPropagation();
            this.data.calendar_time_input_type = BASIC; 
            this.render_content();
        });
        return html;
    }

    dom_row_calendar_time_input_type_classic(){
        let selected_or_not = this.data.calendar_time_input_type == CLASSIC ? "selected" : "";
        let html = `<div class="select_wrap ${selected_or_not}" id="input_method_classic">
                        <div class="select_indicator">
                            ${CComponent.radio_button("time_input_select_classic", this.data.calendar_time_input_type == CLASSIC ? ON : OFF, {"transform":"scale(1.2)", "display":"inline-block", "margin-right":"5px"}, ()=>{})}
                            <span>클래식</span><span style="color:#fe4e65;font-size:11px;"> (베타)</span>
                            <p>시작과 종료시각을 한번에 설정 합니다. <br>겹치는 일정은 필터링 할 수 있습니다.</p>
                        </div>
                        <div>
                            <img src="/static/common/img/time_input_method/calendar_time_input_type_classic.png?v2">
                        </div>
                    </div>`;
        $(document).off('click', '#input_method_classic').on('click', '#input_method_classic', (e)=>{
            e.stopPropagation();
            this.data.calendar_time_input_type = CLASSIC; 
            this.render_content();
        });
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
        let data = {
            "setting_week_start_date":this.data.start_day,
            "setting_calendar_time_selector_type":this.data.calendar_time_input_type,
            "setting_calendar_basic_select_time":this.data.calendar_basic_select_time.value[0]
        };
        Setting_calendar_func.update(data, ()=>{
            this.set_initial_data();
            show_error_message('변경 내용이 저장되었습니다.');
        });
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_calendar_func{
    static update(data, callback){
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


