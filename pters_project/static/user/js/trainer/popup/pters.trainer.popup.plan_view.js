class Plan_view{
    constructor (install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_plan_view_toolbox', content:'section_plan_view_content'};
        this.instance = instance;
        this.form_id = 'id_plan_view_form';

        this.time_selector = BASIC;

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

        this.if_user_changed_any_information = false;
        this.schedule_id = data_from_external.schedule_id;
        this.selected_date = data_from_external.date;
        this.received_data;
        this.data = {
            lecture_id: [],
            lecture_name: [],
            lecture_max_num: [],
            member_id: [],
            member_name:[],
            member_schedule_id:[],
            member_schedule_state:[],
            date: null,
            date_text: null,
            start_time: null,
            start_time_text: null,
            end_time: null,
            end_time_text: null,
            repeat: [
                {
                    day: null,
                    time: null,
                    repeat_start: null,
                    repeat_end: null
                }
            ],
            memo: "",

            //plan_add 팝업의 data보다 추가된 항목
            lecture_color: null,
            lecture_font_color: null,
            lecture_current_num: null,
            lecture_state_cd: null,
            schedule_type:null,

            duplicate_plan_when_add:[]
        };

        this.work_time = {start_hour:0, end_hour:24};
        this.lecture_minute;
        this.date_start = 0;
    
        this.init();
    }

    set member (data){
        this.data.member_id = data.id;
        this.data.member_name = data.name;
        this.render_content();
    }

    get member (){
        return {id:this.data.member_id, name:this.data.member_name};
    }

    set member_schedule (data){
        this.data.member_schedule_id = data.schedule_id;
        this.data.member_schedule_state = data.schedule_state;
    }

    get member_schedule (){
        return {schedule_id:this.data.member_schedule_id, schedule_state: this.data.member_schedule_state};
    }

    set date (data){
        this.data.date = data.data;
        this.data.date_text = data.text;
        this.render_content();
    }

    get date (){
        return this.data.date;
    }

    set start_time (data){
        this.data.start_time = TimeRobot.to_hhmm(data.data.hour, data.data.minute).complete;
        this.data.start_time_text = data.text + ' 부터';
        this.data.end_time_text = TimeRobot.to_text(this.data.end_time) + ' 까지 <span style="font-size:11px;">('+TimeRobot.diff_min(this.data.start_time, this.data.end_time)+'분 진행)</span>';
        this.render_content();
    }

    get start_time (){
        return this.data.start_time;
    }

    set end_time (data){
        this.data.end_time = TimeRobot.to_hhmm(data.data.hour, data.data.minute).complete;
        this.data.end_time_text = data.text + ' 까지 <span style="font-size:11px;">('+TimeRobot.diff_min(this.data.start_time, this.data.end_time)+'분 진행)</span>';
        this.render_content();
    }

    get end_time (){
        return this.data.end_time;
    }

    set memo (text){
        this.data.memo = text;
        this.render_content();
    }

    get memo (){
        return this.data.memo;
    }

    init (){
        this.request_data(()=>{
            // this.render();
            Setting_reserve_func.read((data)=>{
                this.time_selector = Number(data.setting_calendar_time_selector_type);
                this.lecture_minute = Number(data.setting_calendar_basic_select_time);
                let date_start_array = {"SUN":0, "MON":1};
                this.date_start = date_start_array[data.setting_week_start_date];
                this.work_time = calendar.calc_worktime_display(data);
                this.render();
            });
            Lecture_func.read({"lecture_id": this.data.lecture_id}, (data)=>{
                this.lecture_minute = data.lecture_minute;
            });
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });
    }

    set_initial_data (data){
        this.data.lecture_id = data.schedule_info[0].lecture_id;
        this.data.lecture_name = data.schedule_info[0].lecture_name;
        this.data.member_id = data.schedule_info[0].lecture_schedule_data.map((it)=>{return `${it.member_id}`;});
        this.data.member_id_original = this.data.member_id.slice();
        this.data.member_name = data.schedule_info[0].lecture_schedule_data.map((it)=>{return `${it.member_name}`;});
        this.data.member_schedule_id = data.schedule_info[0].lecture_schedule_data.map((it)=>{return `${it.schedule_id}`;});
        this.data.member_schedule_state = data.schedule_info[0].lecture_schedule_data.map((it)=>{return `${it.state_cd}`;});

        if(data.schedule_info[0].schedule_type == 1){
            this.data.member_id.push(data.schedule_info[0].member_id);
            this.data.member_id_original.push(this.data.member_id);
            this.data.member_name.push(data.schedule_info[0].member_name);
            this.data.member_schedule_id.push(data.schedule_info[0].schedule_id);
            this.data.member_schedule_state.push(data.schedule_info[0].state_cd);
        }
        this.data.date = this.selected_date;
        this.data.date_text = DateRobot.to_text(this.data.date.year, this.data.date.month, this.data.date.date);
        this.data.start_time = data.schedule_info[0].start_time;
        this.data.start_time_text = TimeRobot.to_text(data.schedule_info[0].start_time.split(':')[0], data.schedule_info[0].start_time.split(':')[1])+' 부터';
        this.data.end_time = data.schedule_info[0].end_time;
        this.data.end_time_text = TimeRobot.to_text(data.schedule_info[0].end_time.split(':')[0], data.schedule_info[0].end_time.split(':')[1])+' 까지 <span style="font-size:11px;">('+TimeRobot.diff_min(data.schedule_info[0].start_time, data.schedule_info[0].end_time)+'분 진행)</span>';
        this.data.lecture_color = data.schedule_info[0].lecture_ing_color_cd;
        this.data.lecture_font_color = data.schedule_info[0].lecture_ing_font_color_cd;
        this.data.lecture_max_num = data.schedule_info[0].lecture_max_member_num;
        this.data.lecture_current_num = data.schedule_info[0].lecture_current_member_num;
        this.data.lecture_state_cd = data.schedule_info[0].state_cd;
        this.data.memo = data.schedule_info[0].note;
        this.data.schedule_type = data.schedule_info[0].schedule_type;
    }

    calc_end_time_by_start_time(start_time_, lecture_minute, work_time_end){
        let start_time = {hour:start_time_.split(':')[0], minute:start_time_.split(':')[1]};
        let end_time_hour = TimeRobot.add_time(start_time.hour, start_time.minute, 0, lecture_minute).hour;
        let end_time_min = TimeRobot.add_time(start_time.hour, start_time.minute, 0, lecture_minute).minute;
        if(start_time.hour == 24){
            end_time_hour = 24;
        }
        if(end_time_hour >= work_time_end){
            end_time_min = 0;
        }

        let end_time = TimeRobot.hm_to_hhmm(`${end_time_hour}:${end_time_min}`).complete;
        let end_time_text = TimeRobot.to_text(end_time_hour, end_time_min);
        let hour = TimeRobot.hm_to_hhmm(`${end_time_hour}:${end_time_min}`).hour;
        let minute = TimeRobot.hm_to_hhmm(`${end_time_hour}:${end_time_min}`).minute;

        if(start_time.hour == null && start_time.minute == null){
            end_time = null;
            end_time_text = null;
            hour = null;
            minute = null;
        }

        return {data:end_time, text:end_time_text, hour:hour, minute:minute};
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="plan_view_popup.upper_left_menu();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right">
                            <img src="/static/common/icon/icon_delete_black.png" class="obj_icon_24px" onclick="plan_view_popup.upper_right_menu(0);">
                            <img src="/static/common/icon/icon_attend_check_black.png" class="obj_icon_24px" onclick="plan_view_popup.upper_right_menu(1);" style="display:${this.data.schedule_type == 0 ? 'none': ''};">
                        </span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;background-color:${this.data.lecture_color}">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_plan_view .wrapper_top').style.backgroundColor = this.data.lecture_color;
        document.querySelector('.popup_plan_view .wrapper_top').style.border = 0;
        document.querySelector('.popup_plan_view .wrapper_top').style.paddingTop = '0px';
        document.querySelector('.popup_plan_view .wrapper_top').style.lineHeight = '0px';
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }


    dom_assembly_toolbox (){
        let html = this.dom_row_lecture_name();
        return html;
    }
    
    dom_assembly_content (){
        let member_select_row = this.dom_row_member_select();
        let member_list_row = this.dom_row_member_list();
        let date_select_row = this.dom_row_date_select();
        let start_time_select_row = this.dom_row_start_time_select();
        let end_time_select_row = this.dom_row_end_time_select();
        let classic_time_selector = this.dom_row_classic_time_selector();
        let memo_select_row = this.dom_row_memo_select();

        let display = "";
        if(this.data.schedule_type != 2){ //0: OFF, 1: 개인, 2:그룹
            display = 'none';
        }
        
        let html;
        if(this.time_selector == CLASSIC){
            html =  `<div class="obj_input_box_full" style="display:${display}; border:0;">`+ CComponent.dom_tag('회원') + member_select_row + member_list_row+'</div>' +
                        '<div class="obj_input_box_full">' +  CComponent.dom_tag('일자') + date_select_row +
                                                        CComponent.dom_tag('진행시간') + classic_time_selector + '</div>' +
                        '<div class="obj_input_box_full">'+ CComponent.dom_tag('메모') + memo_select_row + '</div>';
        }else{
            html =  `<div class="obj_input_box_full" style="display:${display}; border:0;">`+ CComponent.dom_tag('회원') + member_select_row + member_list_row+'</div>' +
                        '<div class="obj_input_box_full">' +  CComponent.dom_tag('일자') + date_select_row +
                                                        CComponent.dom_tag('진행시간') + start_time_select_row + end_time_select_row + '</div>' +
                        '<div class="obj_input_box_full">'+ CComponent.dom_tag('메모') + memo_select_row + '</div>';
        }

        return html;
    }

    dom_row_lecture_name (){
        let lecture_name;
        if(this.data.schedule_type == 0){
            lecture_name =`OFF 일정 ${this.data.memo != "" ? '('+this.data.memo+')' : ''}`;
        }else if(this.data.schedule_type == 1){
            lecture_name = this.data.member_name + '<img src="/static/common/icon/icon_arrow_expand_black.png" style="height:17px;">';
            // lecture_name = this.data.lecture_name;
        }else if(this.data.schedule_type == 2){
            lecture_name = this.data.lecture_name;
        }
        
        let id = "plan_view_lecture_name";
        let title = lecture_name;
        let style = null;
        let onclick = ()=>{
            if(this.data.schedule_type != 1){
                return false;
            }
            let user_option = {
                info:{text:"회원 정보", callback:()=>{
                    layer_popup.close_layer_popup();
                    let root_content_height = $root_content.height();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SIMPLE_VIEW, 100*(400/root_content_height), POPUP_FROM_BOTTOM, null, ()=>{
                        member_simple_view_popup = new Member_simple_view('.popup_member_simple_view', this.data.member_id[0], 'member_simple_view_popup');
                        //회원 간단 정보 팝업 열기
                    });
                }},
                schedule_history:{text:"회원 일정 이력", callback:()=>{
                    layer_popup.close_layer_popup();
                    let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_SCHEDULE_HISTORY, 100, popup_style, null, ()=>{
                        member_schedule_history = new Member_schedule_history('.popup_member_schedule_history', this.data.member_id[0], null);
                    });
                }},
                sign_image:{text:"출석 서명 확인", callback:()=>{
                    layer_popup.close_layer_popup();
                    show_error_message(
                        `<img src="https://s3.ap-northeast-2.amazonaws.com/pters-image-master/${this.data.member_schedule_id[0]}.png" style="width:100%;filter:invert(1);" onerror="this.onerror=null;this.src='/static/common/icon/icon_no_signature.png'">`
                    );
                }}
            };

            if(this.data.member_schedule_state[0] != SCHEDULE_FINISH){
                delete user_option.sign_image;
            }

            let options_padding_top_bottom = 16;
            let button_height = 8 + 8 + 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        }
        let text_button = CComponent.text_button(id, title, style, onclick);

        let html = `
                    <div class="info_popup_title_wrap" style="height:24px;background-color:${this.data.lecture_color}">
                        <div class="info_popup_title" style="display:inline-block;width:100%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;line-height:24px;font-size:20px;font-weight:bold;letter-spacing:-1px;color:${this.data.lecture_font_color}">
                            ${text_button}
                        </div>
                    </div>
                    `;
        return html;
    }

    dom_row_member_select (){
        let id = 'select_member';
        let title = this.data.member_id.length == 0 ? '회원*' : this.data.member_id.length+ '/' + this.data.lecture_max_num +' 명';
        let icon = '/static/common/icon/icon_people_black.png';
        let icon_r_visible = SHOW;
        let icon_r_text = "예약 목록";
        let style = null;
        let html_member_select = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            //회원 선택 팝업 열기
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, popup_style, {'data':null}, ()=>{
                let appendix =  {lecture_id:this.data.lecture_id, title:"회원", disable_zero_avail_count:ON, entire_member:SHOW};
                member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.lecture_max_num, appendix, (set_data)=>{
                    this.member = set_data;
                    let changed = this.func_update_member();

                    for(let j=0; j<changed.del.length; j++){
                        let index = this.data.member_id_original.indexOf(changed.del[j]);
                        let member_schedule_id = this.data.member_schedule_id[index];
                        Plan_func.delete({"schedule_id":member_schedule_id, "async":false});
                    }

                    for(let i=0; i<changed.add.length; i++){
                        Plan_func.create('/schedule/add_member_lecture_schedule/', {"member_id":changed.add[i], "schedule_id": this.schedule_id, "async":false}, ()=>{});
                    }

                    if(set_data.id_other.length > 0){ //전체 회원에서 추가한 것이 있을 때
                        for(let i=0; i<set_data.id_other.length; i++){
                            let member_ticket_id = set_data.ticket_id_other[i];
                            let member_id = set_data.id_other[i];
                            Plan_func.create('/schedule/add_other_member_lecture_schedule/', {"member_id":member_id, "member_ticket_id": member_ticket_id, "schedule_id": this.schedule_id, "async":false}, ()=>{}); 
                        }
                    }
                    
                    this.init();
                    try{
                        current_page.init();
                    }catch(e){}
                    // this.render_content();
                });
            });
        });
        let html = html_member_select;

        return html;
    }

    dom_row_member_list (){
        let length = this.data.member_id.length;
        let html_to_join = [];
        
        for(let i=0; i<length; i++){
            let member_id = this.data.member_id[i];
            let member_name = this.data.member_name[i];
            let member_schedule_id = this.data.member_schedule_id[i];
            let icon_button_style = {"padding":"3px 1%", "width":"30%", "overflow":"hidden", "text-overflow":"ellipsis", "white-space":"nowrap", "font-size":"15px", "font-weight":"500", "text-align":"center"};
            let state = this.data.member_schedule_state[i];
            let state_icon_url;
            if(state == SCHEDULE_ABSENCE){
                state_icon_url = '/static/common/icon/icon_x_grey.png';
            }else if(state == SCHEDULE_FINISH){
                state_icon_url = '/static/common/icon/icon_confirm_grey.png';
            }else if(state == SCHEDULE_NOT_FINISH){
                state_icon_url = DELETE;
            }

            html_to_join.push(
                CComponent.icon_button(member_id, member_name, state_icon_url, icon_button_style, ()=>{
                   
                    let user_option = {
                        info:{text:"회원 정보", callback:()=>{
                            layer_popup.close_layer_popup();
                            let root_content_height = $root_content.height();
                            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SIMPLE_VIEW, 100*(400/root_content_height), POPUP_FROM_BOTTOM, {'member_id':member_id}, ()=>{
                                member_simple_view_popup = new Member_simple_view('.popup_member_simple_view', member_id, 'member_simple_view_popup');
                                //회원 간단 정보 팝업 열기
                            });
                        }},
                        schedule_history:{text:"회원 일정 이력", callback:()=>{
                            layer_popup.close_layer_popup();
                            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_SCHEDULE_HISTORY, 100, popup_style, null, ()=>{
                                member_schedule_history = new Member_schedule_history('.popup_member_schedule_history', member_id, null);
                            });
                        }},
                        sign_image:{text:"출석 서명 확인", callback:()=>{
                            layer_popup.close_layer_popup();
                            show_error_message(
                                `<img src="https://s3.ap-northeast-2.amazonaws.com/pters-image-master/${member_schedule_id}.png" style="width:100%;filter:invert(1);" onerror="this.onerror=null;this.src='/static/common/icon/icon_no_signature.png'">`
                            );
                        }}
                    };
                    if(state != SCHEDULE_FINISH){
                        delete user_option.sign_image;
                    }

                    let options_padding_top_bottom = 16;
                    let button_height = 8 + 8 + 52;
                    let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                    let root_content_height = $root_content.height();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                        option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                    });
                })
            );
        }
        let html = `<div style="padding-left:5px;">${html_to_join.join('')}</div>`;

        return html;
    }

    dom_row_date_select (){
        let id = 'select_date';
        let title = this.data.date_text == null ? '일자*' : this.data.date_text;
        let icon = '/static/common/icon/icon_cal_black.png';
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_DATE_SELECTOR, 100*320/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.date == null ? this.dates.current_year : this.data.date.year; 
                let month = this.data.date == null ? this.dates.current_month : this.data.date.month;
                let date = this.data.date == null ? this.dates.current_date : this.data.date.date;
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'일자', data:{year:year, month:month, date:date}, start_day:this.date_start,
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.date = object; 
                                                                                                    this.if_user_changed_any_information = true;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                }});
            });
        });
        return html;
    }

    dom_row_start_time_select (){
        let id = 'select_start_time';
        let title = this.data.start_time_text == null ? '시작 시각*' : this.data.start_time_text;
        let icon = '/static/common/icon/icon_clock_black.png';
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TIME_SELECTOR, 100*255/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.

                let hour = this.data.start_time == null ? this.times.current_hour : this.data.start_time.split(':')[0];
                let minute = this.data.start_time == null ? this.times.current_minute : this.data.start_time.split(':')[1];

                let range_start = this.work_time.start_hour;
                let range_end = this.work_time.end_hour;

                time_selector = new TimeSelector2('#wrapper_popup_time_selector_function', null, {myname:'time', title:'시작 시각', data:{hour:hour, minute:minute}, range:{start:range_start, end:range_end},
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.start_time = object;
                                                                                                    // if(this.data.end_time != null){
                                                                                                    //     let compare = TimeRobot.compare(`${object.data.hour}:${object.data.minute}`, this.data.end_time);
                                                                                                    //     if(compare == true){
                                                                                                    //         this.end_time = object;
                                                                                                    //     }
                                                                                                    // }
                                                                                                    let end_time = this.calc_end_time_by_start_time(this.data.start_time, this.lecture_minute, this.work_time.end_hour);
                                                                                                    let end_time_object = {data:{hour:end_time.hour, minute:end_time.minute}, text:end_time.text};
                                                                                                    this.end_time = end_time_object;
                                                                                                    
                                                                                                    this.check_duplicate_plan_exist((data)=>{
                                                                                                        this.data.duplicate_plan_when_add = data;
                                                                                                        this.render_content();
                                                                                                    });
                                                                                                    this.if_user_changed_any_information = true;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.dataCenter에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        return html;
    }

    dom_row_end_time_select (){
        let id = 'select_end_time';
        let title = this.data.end_time_text == null ? '종료 시각*' : this.data.end_time_text;
        let icon = '/static/common/icon/icon_clock_white.png';
        let icon_r_visible = NONE;
        let icon_r_text = "";
        // let style = null;
        let style = this.data.start_time == this.data.end_time && this.data.end_time != null ? {"color":"#fe4e65"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TIME_SELECTOR, 100*255/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                
                let hour_init = this.data.end_time == null ? this.data.start_time.split(':')[0] : this.data.end_time.split(':')[0];
                let minute_init = this.data.end_time == null ? this.data.start_time.split(':')[1] : this.data.end_time.split(':')[1];

                //유저가 선택할 수 있는 최저 시간을 셋팅한다. 이시간보다 작은값을 선택하려면 메세지를 띄우기 위함
                let hour_min = this.data.start_time.split(':')[0];
                let minute_min = this.data.start_time.split(':')[1];

                let range_start = this.work_time.start_hour;
                let range_end = this.work_time.end_hour;
                
                time_selector = new TimeSelector2('#wrapper_popup_time_selector_function', null, {myname:'time', title:'종료 시각',
                                                                                                data:{hour:hour_init, minute:minute_init}, min:{hour:hour_min, minute:minute_min},
                                                                                                range:{start:range_start, end:range_end},
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.end_time = object;
                                                                                                    this.if_user_changed_any_information = true;
                                                                                                    this.check_duplicate_plan_exist((data)=>{
                                                                                                        this.data.duplicate_plan_when_add = data;
                                                                                                        this.render_content();
                                                                                                    });
                                                                                                    //셀렉터에서 선택된 값(object)을 this.dataCenter에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        let html_duplication_alert = `<div style="font-size:11px;color:#fe4e65;padding-left:45px;box-sizing:border-box;display:${this.data.duplicate_plan_when_add.length == 0 ? 'none' : 'block'}">
                                            ${this.data.duplicate_plan_when_add.length}건 겹치는 일정이 존재합니다.<br>
                                            ${this.data.duplicate_plan_when_add.join('<br/>')}
                                        </div>`;
        return html + html_duplication_alert;
    }

    dom_row_classic_time_selector(){
        let selected_date = DateRobot.to_yyyymmdd(this.selected_date.year, this.selected_date.month, this.selected_date.date);

        let root_content_height = $root_content.height();

        let id = 'classic_time_selector';
        let title = this.data.start_time_text == null ? '시작 시각*' : this.data.start_time_text;
        let icon = '/static/common/icon/icon_clock_white.png';
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = null;
        let callback = ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*300/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                let time_data_temp = calendar.latest_received_data[selected_date];
                let time_data = [];
                for(let i=0; i<time_data_temp.length; i++){ //현재 클릭한 일정이 일정으로 취급되서 선택가능한 시간으로 나오지 않는 현상 수정하기 위함
                    if(time_data_temp[i].start_time != this.data.start_time){
                        time_data.push(time_data_temp[i]);
                    }
                }

                let user_option = {myname:'time', title:'시간 선택', work_time:this.work_time, class_hour:this.lecture_minute, initial:TimeRobot.hm_to_hhmm(this.data.start_time).complete, callback_when_set:(object)=>{
                    this.data.start_time = object.data.start;
                    this.data.start_time_text = object.text.start + ' 부터';
                    this.data.end_time = object.data.end;
                    this.data.end_time_text = object.text.end + ' 까지 <span style="font-size:11px;">('+ object.text.diff +'분 진행)</span>';

                    this.if_user_changed_any_information = true;
                    // this.render_content();
                    this.check_duplicate_plan_exist((data)=>{
                        this.data.duplicate_plan_when_add = data;
                        this.render_content();
                    });
                }};
                time_selector = new TwoTimeSelector("#wrapper_popup_time_selector_function", time_data, user_option);
            });
        };
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, callback);

        let id2 = 'classic_time_selector2';
        let title2 = this.data.end_time_text == null ? '종료 시각*' : this.data.end_time_text;
        let icon2 = '/static/common/icon/icon_clock_white.png';
        let icon_r_visible2 = NONE;
        let icon_r_text2 = "";
        let style2 = null;
        let callback2 = ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*300/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                let time_data_temp = calendar.latest_received_data[selected_date];
                let time_data = [];
                for(let i=0; i<time_data_temp.length; i++){ //현재 클릭한 일정이 일정으로 취급되서 선택가능한 시간으로 나오지 않는 현상 수정하기 위함
                    if(time_data_temp[i].start_time != this.data.start_time){
                        time_data.push(time_data_temp[i]);
                    }
                }

                let user_option = {myname:'time', title:'시간 선택', work_time:this.work_time, class_hour:this.lecture_minute, initial:TimeRobot.hm_to_hhmm(this.data.start_time).complete, callback_when_set:(object)=>{
                    this.data.start_time = object.data.start;
                    this.data.start_time_text = object.text.start + ' 부터';
                    this.data.end_time = object.data.end;
                    this.data.end_time_text = object.text.end + ' 까지 <span style="font-size:11px;">('+ object.text.diff +'분 진행)</span>';

                    this.if_user_changed_any_information = true;
                    // this.render_content();
                    this.check_duplicate_plan_exist((data)=>{
                        this.data.duplicate_plan_when_add = data;
                        this.render_content();
                    });
                }};
                time_selector = new TwoTimeSelector("#wrapper_popup_time_selector_function", time_data, user_option);
            });
        };
        let html2 = CComponent.create_row(id2, title2, icon2, icon_r_visible2, icon_r_text2, style2, callback2);

        let html_duplication_alert = `<div style="font-size:11px;color:#fe4e65;padding-left:45px;box-sizing:border-box;display:${this.data.duplicate_plan_when_add.length == 0 ? 'none' : 'block'}">
                                            ${this.data.duplicate_plan_when_add.length}건 겹치는 일정이 존재합니다.<br>
                                            ${this.data.duplicate_plan_when_add.join('<br/>')}
                                        </div>`;

        return html + html2 + html_duplication_alert;
    }

    dom_row_memo_select (){
        let id = 'select_memo';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '일정 메모';
        let icon = '/static/common/icon/icon_note_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_:+.,\\s\\n 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ : . , 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_textarea_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
            let data_to_send = {"schedule_id": this.schedule_id, "add_memo":this.memo};
            let url_update_memo = '/schedule/update_memo_schedule/';
            Plan_func.update(url_update_memo, data_to_send, ()=>{
                this.init();
                this.if_user_changed_any_information = true;
            });
        }, pattern, pattern_message, required);
        return html;
    }

    request_data (callback){
        Plan_func.read_plan(this.schedule_id, (data)=>{
            this.received_data = data;
            this.set_initial_data(data); // 초기값을 미리 셋팅한다.
            callback(data);
        });
    }

    upper_right_menu(number){
        let user_option = [
            ()=>{ show_user_confirm(`정말 ${this.data.schedule_type != "0" ? this.data.lecture_name : 'OFF'} 일정을 취소하시겠습니까?`, ()=>{
                    Plan_func.delete({"schedule_id":this.schedule_id}, ()=>{
                        try{
                            current_page.init();
                        }catch(e){}
                        layer_popup.all_close_layer_popup();
                    });
                });
            },
            ()=>{
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_ATTEND, 100, popup_style, null, ()=>{
                    member_attend = new Member_attend('.popup_member_attend', this.schedule_id, (data)=>{
                        let schedule = data.schedule;
                        let set_data = data.member_schedule;
                        //출석체크 팝업에서 완료버튼을 눌렀을때 할 행동
                        //개인일정 일때
                        if(this.data.schedule_type == 1){
                            let state_cd = set_data[null].state_cd;
                            let image = set_data[null].image;
                            if(String(image).split(':')[0] == "https"){
                                image = null;
                            }
                            let send_data = {"schedule_id":this.schedule_id, "state_cd":state_cd, "upload_file":image};
                            Plan_func.status(send_data, ()=>{
                                if(state_cd == SCHEDULE_FINISH){
                                    if(send_data.upload_file != null){
                                        Plan_func.upload_sign(send_data, ()=>{
                                            this.init();
                                            try{
                                                current_page.init();
                                            }catch(e){}
                                        });
                                    }else{
                                        this.init();
                                        try{
                                            current_page.init();
                                        }catch(e){}
                                    }
                                }else{
                                    this.init();
                                    try{
                                        current_page.init();
                                    }catch(e){}
                                }
                            });
                            return;
                        }

                        //그룹일정 일때
                        let data_to_send = [];
                        for(let member in set_data){
                            let member_id = member;
                            let state_cd = set_data[member].state_cd;
                            let image = set_data[member].image;
                            let member_id_index = this.data.member_id.indexOf(member_id);
                            //기존대비 상태가 변한 것들만 데이터를 바꿔주기 위함 (결석,완료등 상태가 변하거나, 사인 이미지가 변했을때)
                            // if(this.data.member_schedule_state[member_id_index] != state_cd){
                                if(String(image).split(':')[0] == "https"){
                                    image = null;
                                }
                                let send_data = {"schedule_id":this.data.member_schedule_id[member_id_index], "state_cd":state_cd, "upload_file":image};
                                data_to_send.push(send_data);
                            // }
                        }
                        //일정 껍데기 완료하기
                        data_to_send.push({"schedule_id":String(schedule.schedule_id), "state_cd":schedule.state_cd, "upload_file": null});
                        let length = data_to_send.length;
                        let ajax_send_order = 0;
                        for(let i=0; i<data_to_send.length; i++){
                            Plan_func.status(data_to_send[i], ()=>{
                                //스케쥴을 완료하는 것이면 sing데이터도 보낸다.
                                if(data_to_send[i].state_cd == SCHEDULE_FINISH){ //완료로 바꾸는경우에는 서명 데이터도 보낸다.
                                    if(data_to_send[i].upload_file != null){ // 서명이 비어있지 않으면 서명을 보낸다.
                                        Plan_func.upload_sign(data_to_send[i], ()=>{
                                            ajax_send_order++; // for문이 돌때마다 화면을 재렌더 하지 않고, 마지막에만 렌더하도록
                                            if(ajax_send_order == length){
                                                try{
                                                    current_page.init();
                                                }catch(e){}
                                                try{
                                                    this.init();
                                                }catch(e){}
                                            }
                                        });
                                    }else{  // 서명이 비어있는 경우 서명을 보내지 않는다.
                                        ajax_send_order++; // for문이 돌때마다 화면을 재렌더 하지 않고, 마지막에만 렌더하도록
                                        if(ajax_send_order == length){
                                            try{
                                                current_page.init();
                                            }catch(e){}
                                            try{
                                                this.init();
                                            }catch(e){}
                                        }
                                    }
                                    
                                //스케쥴을 완료하는 것이 아니라, 결석, 미처리로 바꿀때는 sign데이터를 보내지 않는다.
                                }else{
                                    ajax_send_order++; // for문이 돌때마다 화면을 재렌더 하지 않고, 마지막에만 렌더하도록
                                    if(ajax_send_order == length){
                                        try{
                                            current_page.init();
                                        }catch(e){}
                                        try{
                                            this.init();
                                        }catch(e){}
                                    }
                                }
                            });
                        }
                    });
                });
            }   
        ];

        user_option[number]();
    }

    upper_left_menu(){
        if(this.if_user_changed_any_information == true){
            // if(this.send_data() == false){
            //     return false;
            // }
            let user_option = {
                confirm:{text:"변경사항 적용", callback:()=>{this.send_data();layer_popup.close_layer_popup();layer_popup.close_layer_popup();this.clear();}},
                cancel:{text:"아무것도 변경하지 않음", callback:()=>{ layer_popup.close_layer_popup();layer_popup.close_layer_popup();this.clear();}}
            };
            let options_padding_top_bottom = 16;
            let button_height = 8 + 8 + 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        }else{
            layer_popup.close_layer_popup();this.clear();
        }
    }

    send_data (){
        let start_dt = DateRobot.to_yyyymmdd(this.data.date.year, this.data.date.month, this.data.date.date) + ' ' + this.data.start_time;
        let end_dt = DateRobot.to_yyyymmdd(this.data.date.year, this.data.date.month, this.data.date.date) + ' ' + this.data.end_time;
        if(start_dt == end_dt){
            show_error_message("종료 시간을 다시 선택해주세요.");
            return false;
        }

        let schedule_ids = [];
        schedule_ids.push(this.received_data.schedule_info[0].schedule_id);
        for(let i=0; i<this.received_data.schedule_info[0].lecture_schedule_data.length; i++){
            schedule_ids.push(
                this.received_data.schedule_info[0].lecture_schedule_data[i].schedule_id
            );
        }

        let data_to_send = {"schedule_ids[]":schedule_ids, "start_dt":start_dt, "end_dt":end_dt};

        let url = '/schedule/update_schedule/';
        Plan_func.update(url, data_to_send, ()=>{
            try{
                current_page.init();
            }catch(e){}
        });
        
    }

    func_update_member(){
        let members = {};
        let sum_member = this.data.member_id.concat(this.data.member_id_original);
        for(let i=0; i<sum_member.length; i++){
            members[sum_member[i]] = sum_member[i];
        }
        let member_ids = Object.keys(members); //data_original과 data의 member_id들을 중복을 제거하고 합친 결과
        let member_id_to_be_deleted = [];
        let member_id_to_be_added = [];
        for(let j=0; j<member_ids.length; j++){
            if(this.data.member_id_original.indexOf(member_ids[j]) == -1){ //원래 데이터에 없는 member id가 추가되었을 경우
                member_id_to_be_added.push(member_ids[j]);
            }else if(this.data.member_id.indexOf(member_ids[j]) == -1){ //원래 데이터에 있던 member id가 빠진 경우
                member_id_to_be_deleted.push(member_ids[j]);
            }
        }

        return {add:member_id_to_be_added, del:member_id_to_be_deleted};
    }

    check_duplicate_plan_exist(callback){
        let date = DateRobot.to_yyyymmdd(this.data.date.year, this.data.date.month, this.data.date.date);
        let days = 1;
        let start_time = this.data.start_time;
        let end_time = this.data.end_time;

        if(start_time == null || end_time == null){
            console.log("시작시간이나 종료시간이 설정되지 않음");
            return false;
        }
        // if(end_time=='0:0'){
        //     end_time='24:00';
        // }

        let data;
        calendar.request_schedule_data (date, days, (schedules)=>{
            data = schedules[date];
            let who_is_duplicated = [];
            let length = data.length;
            for(let i=0; i<length; i++){
                let plan_schedule_id = data[i].schedule_id;
                if(plan_schedule_id == this.schedule_id){
                    continue;
                }
                let plan_starttime = data[i].start_time;
                let plan_endtime = data[i].end_time;
                if(plan_endtime == "00:00"){
                    plan_endtime = "24:00";
                }
                let plan_name;
                if(data[i].schedule_type == 0 ){
                    plan_name = 'OFF일정 ('+data[i].note+')';
                }else if(data[i].schedule_type == 1){
                    plan_name = data[i].member_name;
                }else if(data[i].schedule_type == 2){
                    plan_name = data[i].lecture_name;
                }

                let check = Plan_calc.know_whether_plans_has_duplicates (start_time, end_time, plan_starttime, plan_endtime);
                if(check > 0){
                    who_is_duplicated.push(`${plan_starttime} - ${plan_endtime} ${plan_name}`);
                }
            }

            let result;
            if(who_is_duplicated.length == 0){
                result = [];
            }
            result = who_is_duplicated;

            callback(result);
        });
    }

    check_before_send(){
   
        return true;
    }
}