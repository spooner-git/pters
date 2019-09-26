class Plan_view{
    constructor (install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_plan_view_toolbox', content:'section_plan_view_content'};
        this.instance = instance;
        this.form_id = 'id_plan_view_form';

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
        this.data.start_time = TimeRobot.to_data(data.data.zone, data.data.hour, data.data.minute).complete;
        this.data.start_time_text = data.text + ' 부터';
        this.render_content();
    }

    get start_time (){
        return this.data.start_time;
    }

    set end_time (data){
        this.data.end_time = TimeRobot.to_data(data.data.zone, data.data.hour, data.data.minute).complete;
        this.data.end_time_text = data.text + ' 까지 ('+TimeRobot.diff_min(this.data.start_time, this.data.end_time)+'분 진행)';
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
            this.render();
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
            this.data.member_schedule_state.push(data.schedule_info[0].state_cd);
        }
        this.data.date = this.selected_date;
        this.data.date_text = DateRobot.to_text(this.data.date.year, this.data.date.month, this.data.date.date);
        this.data.start_time = data.schedule_info[0].start_time;
        this.data.start_time_text = TimeRobot.to_text(data.schedule_info[0].start_time.split(':')[0], data.schedule_info[0].start_time.split(':')[1])+' 부터';
        this.data.end_time = data.schedule_info[0].end_time;
        this.data.end_time_text = TimeRobot.to_text(data.schedule_info[0].end_time.split(':')[0], data.schedule_info[0].end_time.split(':')[1])+' 까지 ('+TimeRobot.diff_min(data.schedule_info[0].start_time, data.schedule_info[0].end_time)+'분 진행)';
        this.data.lecture_color = data.schedule_info[0].lecture_ing_color_cd;
        this.data.lecture_font_color = data.schedule_info[0].lecture_ing_font_color_cd;
        this.data.lecture_max_num = data.schedule_info[0].lecture_max_member_num;
        this.data.lecture_current_num = data.schedule_info[0].lecture_current_member_num;
        this.data.lecture_state_cd = data.schedule_info[0].state_cd;
        this.data.memo = data.schedule_info[0].note;
        this.data.schedule_type = data.schedule_info[0].schedule_type;
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
                            <img src="/static/common/icon/icon_attend_check_black.png" class="obj_icon_24px" onclick="plan_view_popup.upper_right_menu(1);" style="display:${this.data.schedule_type == 0 ? 'none': ''};margin-left:20px">
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
        let memo_select_row = this.dom_row_memo_select();

        let display = "";
        if(this.data.schedule_type != 2){ //0: OFF, 1: 개인, 2:그룹
            display = 'none';
        }
        
        let html =  `<div class="obj_input_box_full" style="display:${display}; border:0;">`+ CComponent.dom_tag('회원') + member_select_row + member_list_row+'</div>' +
                    '<div class="obj_input_box_full">' +  CComponent.dom_tag('일자') + date_select_row +
                                                    CComponent.dom_tag('진행시간') + start_time_select_row + end_time_select_row + '</div>' +
                    '<div class="obj_input_box_full">'+ CComponent.dom_tag('메모') + memo_select_row + '</div>';

        return html;
    }

    dom_row_lecture_name (){
        let lecture_name;
        if(this.data.schedule_type == 0){
            lecture_name =`OFF 일정 ${this.data.memo != "" ? '('+this.data.memo+')' : ''}`;
        }else if(this.data.schedule_type == 1){
            lecture_name = this.data.member_name;
            // lecture_name = this.data.lecture_name;
        }else if(this.data.schedule_type == 2){
            lecture_name = this.data.lecture_name;
        }

        let html = `
                    <div class="info_popup_title_wrap" style="height:24px;background-color:${this.data.lecture_color}">
                        <div class="info_popup_title" style="display:inline-block;line-height:24px;font-size:20px;font-weight:bold;letter-spacing:-1px;color:${this.data.lecture_font_color}">
                            ${lecture_name}
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
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, {'data':null}, ()=>{
                member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.lecture_max_num, {'lecture_id':this.data.lecture_id, "title":"회원"}, (set_data)=>{
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
                    
                    this.init();
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
            let icon_button_style = {"padding":"3px 1%", "width":"30%", "overflow":"hidden", "text-overflow":"ellipsis", "white-space":"nowrap", "font-size":"15px", "font-weight":"500"};
            let state = this.data.member_schedule_state[i];
            let state_icon_url;
            if(state == SCHEDULE_ABSENCE){
                state_icon_url = '/static/common/icon/icon_x_grey.png';
            }else if(state == SCHEDULE_FINISH){
                state_icon_url = '/static/common/icon/icon_confirm_grey.png';
            }else if(state == SCHEDULE_NOT_FINISH){
                state_icon_url = NONE;
            }

            html_to_join.push(
                CComponent.icon_button(member_id, member_name, state_icon_url, icon_button_style, ()=>{
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SIMPLE_VIEW, 100*(400/windowHeight), POPUP_FROM_BOTTOM, {'member_id':member_id}, ()=>{
                        member_simple_view_popup = new Member_simple_view('.popup_member_simple_view', member_id, 'member_simple_view_popup');
                        //회원 간단 정보 팝업 열기
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
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_DATE_SELECTOR, 100*305/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.date == null ? this.dates.current_year : this.data.date.year; 
                let month = this.data.date == null ? this.dates.current_month : this.data.date.month;
                let date = this.data.date == null ? this.dates.current_date : this.data.date.date;
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'일자', data:{year:year, month:month, date:date},
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
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TIME_SELECTOR, 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //dataCenter의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.data.start_time == null ? this.times.current_zone : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).zone;
                let hour = this.data.start_time == null ? this.times.current_hour : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).hour;
                let minute = this.data.start_time == null ? this.times.current_minute : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector2('#wrapper_popup_time_selector_function', null, {myname:'time', title:'시작 시각', data:{zone:zone, hour:hour, minute:minute},
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.start_time = object;
                                                                                                    if(this.data.end_time != null){
                                                                                                        let compare = TimeRobot.compare_by_zone(object.data, TimeRobot.to_zone(this.data.end_time.split(':')[0],this.data.end_time.split(':')[1]));
                                                                                                        if(compare == true){
                                                                                                            this.end_time = object;
                                                                                                        }
                                                                                                    }
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
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TIME_SELECTOR, 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let start_zone = TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).zone;
                let start_hour = TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).hour;
                let start_minute = TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).minute;

                //유저가 선택할 수 있는 최저 시간을 셋팅한다. 이시간보다 작은값을 선택하려면 메세지를 띄우기 위함
                let time_min = TimeRobot.add_time(TimeRobot.to_data(start_zone, start_hour, start_minute).hour, TimeRobot.to_data(start_zone, start_hour, start_minute).minute, 0, 5);
                let time_min_type_zone = TimeRobot.to_zone(time_min.hour, time_min.minute);
                let zone_min = time_min_type_zone.zone;
                let zone_hour = time_min_type_zone.hour;
                let zone_minute = time_min_type_zone.minute;

                let zone = this.data.end_time == null ? zone_min : TimeRobot.to_zone(this.data.end_time.split(':')[0], this.data.end_time.split(':')[1]).zone;
                let hour = this.data.end_time == null ? zone_min : TimeRobot.to_zone(this.data.end_time.split(':')[0], this.data.end_time.split(':')[1]).hour;
                let minute = this.data.end_time == null ? zone_min : TimeRobot.to_zone(this.data.end_time.split(':')[0], this.data.end_time.split(':')[1]).minute;


                time_selector = new TimeSelector2('#wrapper_popup_time_selector_function', null, {myname:'time', title:'종료 시각',
                                                                                                data:{zone:zone, hour:hour, minute:minute}, min:{zone:zone_min, hour:zone_hour, minute:zone_minute},
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

    dom_row_memo_select (){
        let id = 'select_memo';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '일정 메모';
        let icon = '/static/common/icon/icon_note_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
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
                            calendar.init_no_new();
                            home.init();
                        }catch(e){
                            console.log(e)
                        }
                        layer_popup.all_close_layer_popup();
                    });
                });
            },
            ()=>{
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_ATTEND, 100, POPUP_FROM_RIGHT, null, ()=>{
                    member_attend = new Member_attend('.popup_member_attend', this.schedule_id, (set_data)=>{
                        //출석체크 팝업에서 완료버튼을 눌렀을때 할 행동
                        if(this.data.schedule_type == 1){
                            let state_cd = set_data[null].state_cd;
                            let send_data = {"schedule_id":this.schedule_id, "state_cd":state_cd};
                            Plan_func.status(send_data, ()=>{
                                this.init();
                                try{
                                    calendar.init_no_new();
                                    home.init();
                                }catch(e){
                                    console.log(e)
                                }
                            });
                        }
                        let data_to_send = [];
                        for(let member in set_data){
                            let member_id = member;
                            let state_cd = set_data[member].state_cd;
                            let member_id_index = this.data.member_id.indexOf(member_id);
                            if(this.data.member_schedule_state[member_id_index] != state_cd){
                                let send_data = {"schedule_id":this.data.member_schedule_id[member_id_index], "state_cd":state_cd};
                                data_to_send.push(send_data);
                            }
                        }
                        let length = data_to_send.length;
                        let ajax_send_order = 0;
                        for(let i=0; i<data_to_send.length; i++){
                            Plan_func.status(data_to_send[i], ()=>{
                                ajax_send_order++;
                                if(ajax_send_order == length){
                                    try{
                                        this.init();
                                        calendar.init_no_new();
                                        home.init();
                                    }catch(e){
                                        console.log(e);
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
            //날짜, 시작시간, 종료시간이 바뀌었을 경우 변경 데이터를 전송한다.
            // layer_popup.close_layer_popup();this.clear();
            this.send_data();
        }
        layer_popup.close_layer_popup();this.clear();
    }

    send_data (){
        if(this.check_before_send() == false){
            return false;
        }
        let data1 = {"schedule_id": this.schedule_id};
        let data2 = {"lecture_id": this.data.schedule_type == 0 ? "" : this.data.lecture_id,
                    "start_dt": this.data.date.year+'-'+this.data.date.month+'-'+this.data.date.date + ' ' + this.data.start_time,
                    "end_dt":this.data.date.year+'-'+this.data.date.month+'-'+this.data.date.date + ' ' + this.data.end_time,
                    "note":this.data.memo, "duplication_enable_flag": 1,
                    "en_dis_type":this.data.schedule_type == 2 ? 1 : this.data.schedule_type, "member_ids":this.data.member_id
        };
        //en_dis_type 0: off일정, 1:레슨일정
        //duplication_enable_flag 0: 중복불허 1:중복허용
        
        Plan_func.delete(data1, ()=>{ //일정을 지운다.
            let url_to_create_new_schedule ='/schedule/add_schedule/';
            Plan_func.create(url_to_create_new_schedule, data2, ()=>{ //일정을 새로 등록한다.
                try{
                    calendar.init_no_new();
                    home.init();
                }catch(e){
                    console.log(e)
                }
            });
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

                let check = know_whether_plans_has_duplicates (start_time, end_time, plan_starttime, plan_endtime);
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
    //     let forms = document.getElementById(`${this.form_id}`);
    //     update_check_registration_form(forms);
    //
    //     let error_info = check_registration_form(forms);
    //
    //     if(error_info != ''){
    //         show_error_message(error_info);
    //         return false;
    //     }
    //     else{
    //         if(this.list_type == 'lesson'){
    //             if(this.data.lecture_name.length == 0){
    //                 show_error_message('수업을 선택 해주세요.');
    //                 return false;
    //             }
    //             if(this.data.lecture_type_cd[0] == LECTURE_TYPE_ONE_TO_ONE){
    //                 if(this.data.member_name.length == 0){
    //                     show_error_message('회원을 선택 해주세요.');
    //                     return false;
    //                 }
    //             }
    //         }
    //         if(this.data.date_text == null){
    //             show_error_message('날짜를 선택 해주세요.');
    //             return false;
    //         }
    //         if(this.data.start_time_text == null){
    //             show_error_message('시작 시간을 선택 해주세요.');
    //             return false;
    //         }
    //         if(this.data.end_time_text == null){
    //             show_error_message('종료 시간을 선택 해주세요.');
    //             return false;
    //         }
    //         return true;
    //     }
        return true;
    }
}