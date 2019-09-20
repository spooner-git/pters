class Plan_add{
    constructor(install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_plan_add_toolbox', content:'section_plan_add_content'};
        this.instance = instance;
        this.form_id = 'id_plan_add_form';

        this.list_type = "lesson";

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
            lecture_id:[],
            lecture_name:[],
            lecture_max_num:[],
            lecture_state_cd:[],
            lecture_type_cd:[],
            member_id:[],
            member_name:[],
            date: null,
            date_text: null,
            start_time:"",
            start_time_text: null,
            end_time:"",
            end_time_text: null,
            repeat: 
                {
                    power: OFF,
                    day: [],
                    repeat_end: {year:null, month:null, date:null}
                }
            ,
            memo:"",

            duplicate_plan_when_add:[]
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
        this.set_initial_data(data_from_external);
        this.init();
    }

    set lecture(data){
        this.data.lecture_id = data.id;
        this.data.lecture_name = data.name;
        this.data.lecture_max_num = data.max;
        this.data.lecture_state_cd = data.state_cd;
        this.data.lecture_type_cd = data.type_cd;
        this.member = {id:[], name: []}; //수업을 선택했기 때문에, 회원란을 모두 비워준다.
        this.render_content();
    }

    get lecture(){
        return {id:this.data.lecture_id, name:this.data.lecture_name, max:this.data.lecture_max_num, state_cd:this.data.lecture_state_cd, type_cd:this.data.lecture_type_cd};
    }


    set member(data){
        this.data.member_id = data.id;
        this.data.member_name = data.name;
        this.render_content();
    }

    get member(){
        return {id:this.data.member_id, name:this.data.member_name};
    }

    set date(data){
        this.data.date = data.data;
        this.data.date_text = data.text;
        this.render_content();
    }

    get date(){
        return this.data.date;
    }

    set start_time(data){
        this.data.start_time = TimeRobot.to_data(data.data.zone, data.data.hour, data.data.minute).complete;
        this.data.start_time_text = data.text + ' 부터';
        this.render_content();
    }

    get start_time(){
        return this.data.start_time;
    }

    set end_time(data){
        console.log(data);
        this.data.end_time = TimeRobot.to_data(data.data.zone, data.data.hour, data.data.minute).complete;
        this.data.end_time_text = data.text + ' 까지 ('+TimeRobot.diff_min(this.data.start_time, this.data.end_time)+'분 진행)';
        this.render_content();
    }

    get end_time(){
        return this.data.end_time;
    }

    set memo(text){
        this.data.memo = text;
        this.render_content();
    }

    get memo(){
        return this.data.memo;
    }

    set repeat(data){
        this.data.repeat = data;
    }

    get repeat(){
        return this.data.repeat;
    }


    init(type){
        if(type == undefined){
            type = this.list_type;
        }
        this.list_type = type;

        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    set_initial_data(data){
        this.user_data = data;
        let user_data_date = this.user_data.user_selected_date;
        this.data.date = user_data_date.year == null ? null : {year: user_data_date.year, month:user_data_date.month, date:user_data_date.date};
        this.data.date_text = user_data_date.text;
        
        let user_data_time = this.user_data.user_selected_time;
        this.data.start_time = user_data_time.hour == null ? null : `${user_data_time.hour}:${user_data_time.minute}`;
        this.data.start_time_text = user_data_time.text;
        this.data.end_time = user_data_time.hour2 == null ? null : `${user_data_time.hour2}:${user_data_time.minute2}`;
        this.data.end_time_text = user_data_time.text2;
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_x_black.png" onclick="layer_popup.close_layer_popup();plan_add_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="plan_add_popup.send_data()">등록</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");
        
        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_plan_add .wrapper_top').style.border = 0;
        // document.querySelector('.popup_plan_add .wrapper_top').style.paddingTop = '20px';
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
        let lecture_select_row = this.dom_row_lecture_select();
        let member_select_row = this.dom_row_member_select();
        let date_select_row = this.dom_row_date_select();
        let start_time_select_row = this.dom_row_start_time_select();
        let end_time_select_row = this.dom_row_end_time_select();
        let repeat_select_row = this.dom_row_repeat_select();
        let memo_select_row = this.dom_row_memo_select();

        let display = "";
        if(this.list_type != "lesson"){
            display = 'none';
        }

        let html =  `<div class="obj_input_box_full" style="display:${display}">` + CComponent.dom_tag('수업') + lecture_select_row + '</div>' +
                    `<div class="obj_input_box_full" style="display:${display}">` + CComponent.dom_tag('회원') + member_select_row+'</div>' +
                    '<div class="obj_input_box_full">' +  CComponent.dom_tag('일자') + date_select_row + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>' +
                                                    CComponent.dom_tag('진행 시간') + start_time_select_row + end_time_select_row +  '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>' +
                                                    CComponent.dom_tag('반복') + repeat_select_row + '</div>' +
                    '<div class="obj_input_box_full">'+  CComponent.dom_tag('메모') + memo_select_row + '</div>';

        return html;
    }

    dom_row_toolbox(){
        let title = "새로운 일정";
        let html = `
        <div class="plan_add_upper_box">
            <div style="display:inline-block;width:200px;">
                <div style="display:inline-block;width:200px;">
                    <span style="font-size:20px;font-weight:bold;">${title}</span>
                    <span style="display:none;">${title}</span>
                </div>
            </div>
        </div>
        <div class="plan_add_bottom_tools_wrap">
            <div class="list_type_tab_wrap">
                <div onclick="${this.instance}.switch_type('lesson');" class="${this.list_type == "lesson" ? "tab_selected" : ""}">수업</div>
                <div onclick="${this.instance}.switch_type('off');" class="${this.list_type == "off" ? "tab_selected" : ""}">OFF</div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_lecture_select(){
        let id = 'select_lecture';
        let title = this.data.lecture_name.length == 0 ? '수업*' : this.data.lecture_name.join(', ');
        let icon = '/static/common/icon/icon_lecture_black.png';
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_SELECT, 100, POPUP_FROM_RIGHT, {'member_id':null}, ()=>{
                lecture_select = new LectureSelector('#wrapper_box_lecture_select', this, 1, {'title':'수업'}, (set_data)=>{
                    //수업을 추가
                    this.lecture = set_data;

                    //수업에 속한 고정회원들을 추가
                    Lecture_func.read({"lecture_id": set_data.id[0]}, (data)=>{
                        let member_length = data.lecture_member_list.length;
                        let data_to_set = {id:[], name:[]};
                        for(let i=0; i<member_length; i++){
                            let member_data = data.lecture_member_list[i];
                            if(member_data.member_fix_state_cd == FIX){
                                data_to_set.id.push(member_data.member_id);
                                data_to_set.name.push(member_data.member_name);
                            }
                        }
                        this.member = data_to_set;
                    });
                });
            });
        });
        return html;
    }

    dom_row_member_select(){
        let id = 'select_member';
        let title = this.data.member_name.length == 0 ? '회원*' : this.data.member_name.join(', ');
        let icon = '/static/common/icon/icon_people_black.png';
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            if(this.data.lecture_id.length != 0){
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, {'member_id':null}, ()=>{
                    member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.lecture_max_num[0], {'lecture_id':this.data.lecture_id[0], "title":"회원"}, (set_data)=>{
                        this.member = set_data;
                        this.render_content();
                    });
                });
            }else{
                show_error_message('수업을 먼저 선택해주세요.');
            }
        });
        return html;
    }

    dom_row_date_select(){
        //등록하는 행을 만든다.
        let id = 'select_date';
        let title = this.data.date_text == null ? '일자*' : this.data.date_text;
        let icon = '/static/common/icon/icon_cal_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*305/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.date == null ? this.dates.current_year : this.data.date.year; 
                let month = this.data.date == null ? this.dates.current_month : this.data.date.month;
                let date = this.data.date == null ? this.dates.current_date : this.data.date.date;
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'일자', data:{year:year, month:month, date:date},
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.date = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                }});

                // date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'날짜 선택', data:{year:year, month:month, date:date}, 
                //                                                                                 range:{start: this.dates.current_year - 5, end: this.dates.current_year+5}, 
                //                                                                                 callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                //                                                                                     this.date = object; 
                //                                                                                     //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                //                                                                                 }});
                
            });
        });
        return html;
    }

    dom_row_start_time_select(){
        let id = 'select_start';
        let title = this.data.start_time_text == null ? '시작 시각*' : this.data.start_time_text;
        let icon = '/static/common/icon/icon_clock_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ //data : 직전 셋팅값
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.data.start_time == null ? this.times.current_zone : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).zone;
                let hour = this.data.start_time == null ? this.times.current_hour : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).hour;
                let minute = this.data.start_time == null ? this.times.current_minute : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector2('#wrapper_popup_time_selector_function', null, {myname:'time', title:'시작 시각', data:{zone:zone, hour:hour, minute:minute},
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.start_time = object;
                                                                                                    if(this.data.end_time != null){
                                                                                                        let compare = TimeRobot.compare_by_zone(object.data, TimeRobot.to_zone(this.data.end_time.split(':')[0],this.data.end_time.split(':')[1]));
                                                                                                        if(compare == true){
                                                                                                            //유저가 선택할 수 있는 최저 시간을 셋팅한다. 이시간보다 작은값을 선택하려면 메세지를 띄우기 위함
                                                                                                            let end_time = TimeRobot.add_time(object.data.hour, object.data.minute, 0, 5);
                                                                                                            let end_time_to_zone = TimeRobot.to_zone(end_time.hour, end_time.minute);
                                                                                                            let end_time_text = TimeRobot.to_text(end_time.hour, end_time.minute);
                                                                                                            this.end_time = {'data':{'zone':end_time_to_zone.zone,'hour':end_time_to_zone.hour, 'minute':end_time_to_zone.minute},
                                                                                                                            'text':end_time_text};
                                                                                                        }
                                                                                                    }
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        return html;
    }

    dom_row_end_time_select(){
        let id = 'select_end';
        let title = this.data.end_time_text == null ? '종료 시각*' : this.data.end_time_text;
        let icon = '/static/common/icon/icon_clock_white.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ //data : 직전 셋팅값
            //행을 클릭했을때 실행할 내용
            if(this.data.start_time == null){
                show_error_message('시작 시각을 먼저 선택해주세요');
                return false;
            }
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).zone;
                let hour = TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).hour;
                let minute = TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).minute;

                //유저가 선택할 수 있는 최저 시간을 셋팅한다. 이시간보다 작은값을 선택하려면 메세지를 띄우기 위함
                let time_min = TimeRobot.add_time(TimeRobot.to_data(zone, hour, minute).hour, TimeRobot.to_data(zone, hour, minute).minute, 0, 5);
                let time_min_type_zone = TimeRobot.to_zone(time_min.hour, time_min.minute);
                let zone_min = time_min_type_zone.zone;
                let zone_hour = time_min_type_zone.hour;
                let zone_minute = time_min_type_zone.minute;
                console.log(zone_min, zone_hour, zone_minute)

                time_selector = new TimeSelector2('#wrapper_popup_time_selector_function', null, {myname:'time', title:'종료 시각',
                                                                                                data:{zone:zone_min, hour:zone_hour, minute:zone_minute}, min:{zone:zone_min, hour:zone_hour, minute:zone_minute},
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.end_time = object;
                                                                                                    this.check_duplicate_plan_exist((data)=>{
                                                                                                        this.data.duplicate_plan_when_add = data;
                                                                                                        this.render_content();
                                                                                                    });
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });

        let html_duplication_alert = `<div style="font-size:11px;color:#fe4e65;padding-left:45px;box-sizing:border-box;display:${this.data.duplicate_plan_when_add.length == 0 ? 'none' : 'block'}">
                                            ${this.data.duplicate_plan_when_add.length}건 겹치는 일정이 존재합니다.<br>
                                            ${this.data.duplicate_plan_when_add.join('<br/>')}
                                        </div>`;
        return html + html_duplication_alert;
    }

    dom_row_repeat_select(){
        let repeat_end_date_in_text = '<span style="font-size:10px; font-weight:500;letter-spacing: -1px;color: #1f1d1e;">'+DateRobot.to_text(this.data.repeat.repeat_end.year, this.data.repeat.repeat_end.month, this.data.repeat.repeat_end.date)+' 까지</span>';
        let id = 'select_repeat';
        let repeat_title = this.data.repeat.day.map((el)=>{return DAYNAME_MATCH[el];}).join(', ');
        if(this.data.repeat.day.length==7){
            repeat_title = '매일';
        }
        let title =this.data.repeat.power == OFF ? '반복 일정' : repeat_title +' / '+ repeat_end_date_in_text;
        let icon = '/static/common/icon/icon_repeat_black.png';
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_REPEAT_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                repeat_select = new RepeatSelector('#wrapper_box_repeat_select', this, this.data.date, (set_data)=>{
                    this.repeat = set_data;
                    this.render_content();
                });
            });
        });
        return html;
    }

    dom_row_memo_select(){
        let id = 'select_memo';
        let title = this.data.memo == "" ? '' : this.data.memo;
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
            if(user_input_data != null){
                this.memo = user_input_data;
            }
        }, pattern, pattern_message, required);
        return html;
    }

    switch_type(type){
        if(type == this.list_type){
            return false;
        }
        switch(type){
            case "lesson":
                this.init("lesson");
            break;

            case "off":
                this.init("off");
            break;
        }
    }

    send_data(){
        if(this.check_before_send() == false){
            return false;
        }

        let data = {"lecture_id":this.data.lecture_id[0],
                    "start_dt": this.data.date.year+'-'+this.data.date.month+'-'+this.data.date.date + ' ' + this.data.start_time,
                    "end_dt":this.data.date.year+'-'+this.data.date.month+'-'+this.data.date.date + ' ' + this.data.end_time,
                    "note":this.data.memo, "duplication_enable_flag": 1,
                    "en_dis_type":this.list_type == "off" ? 0 : 1, "member_ids":this.data.member_id,

                    //repeat 관련
                    "repeat_freq":"WW", 
                    "repeat_start_date":this.data.date.year+'-'+this.data.date.month+'-'+this.data.date.date,
                    "repeat_end_date":this.data.repeat.repeat_end.year+'-'+this.data.repeat.repeat_end.month+'-'+this.data.repeat.repeat_end.date,
                    "repeat_start_time":this.data.start_time, "repeat_end_time":this.data.end_time, "repeat_day":this.data.repeat.day.join('/')
        };
        
        //en_dis_type 0: off일정, 1:레슨일정
        //duplication_enable_flag 0: 중복불허 1:중복허용
        if(this.data.repeat.power == OFF){
            let pass_inspect = this.pass_inspect(this.data.date.year+'-'+this.data.date.month+'-'+this.data.date.date);
            if(pass_inspect == false){
                return false;
            }

            let url ='/schedule/add_schedule/';
            Plan_func.create(url, data, ()=>{
                layer_popup.close_layer_popup();
                calendar.init_no_new();
            });
            
        }else if(this.data.repeat.power == ON){
            let pass_inspect = this.pass_inspect(this.data.repeat.repeat_end.year+'-'+this.data.repeat.repeat_end.month+'-'+this.data.repeat.repeat_end.date);
            if(pass_inspect == false){
                return false;
            }

            let url = '/schedule/add_repeat_schedule/';
            let confirm_url = '/schedule/add_repeat_schedule_confirm/';
            
            Plan_func.create(url, data, (received)=>{
                let repeat_schedule_id = received.repeatArray[0];
                let repeat_confirm = 1;
                let confirm_data = {"repeat_schedule_id":repeat_schedule_id, "repeat_confirm":repeat_confirm, "member_ids":this.data.member_id};
                Plan_func.create(confirm_url, confirm_data, ()=>{
                    layer_popup.close_layer_popup();
                    calendar.init_no_new();
                });
            });
        }   
    }

    check_duplicate_plan_exist(callback){
        if(this.data.date == null){
            return false;
        }

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
            //입력하고자하는 날짜에 일정이 전혀 존재하지 않을때 처리
            if(data == undefined){
                return callback([]);
            }
            
            let who_is_duplicated = [];
            let length = data.length;
            for(let i=0; i<length; i++){
                let plan_schedule_id = data[i].schedule_id;
                if(plan_schedule_id == this.schedule_id){
                    continue;
                }
                let plan_starttime = data[i].start_time;
                let plan_endtime = data[i].end_time;
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
        let forms = document.getElementById(`${this.form_id}`);
        update_check_registration_form(forms);

        let error_info = check_registration_form(forms);

        if(error_info != ''){
            show_error_message(error_info);
            return false;
        }
        else{
            if(this.list_type == 'lesson'){
                if(this.data.lecture_name.length == 0){
                    show_error_message('수업을 선택 해주세요.');
                    return false;
                }
                if(this.data.lecture_type_cd[0] == LECTURE_TYPE_ONE_TO_ONE){
                    if(this.data.member_name.length == 0){
                        show_error_message('회원을 선택 해주세요.');
                        return false;
                    }
                }
            }
            if(this.data.date_text == null){
                show_error_message('날짜를 선택 해주세요.');
                return false;
            }
            if(this.data.start_time_text == null){
                show_error_message('시작 시각을 선택 해주세요.');
                return false;
            }
            if(this.data.end_time_text == null){
                show_error_message('종료 시각을 선택 해주세요.');
                return false;
            }
            console.log(this.data.repeat);
            if(this.data.repeat.power == ON){
                if(this.data.repeat.day.length == 0){
                    show_error_message('반복일정 요일을 선택 해주세요.');
                    return false;
                }
                if(this.data.repeat.repeat_end.date==null){
                    show_error_message('반복일정 종료일을 선택 해주세요.');
                    return false;
                }
            }
            return true;
        }
    }

    pass_inspect(selected_date){
        let inspect = pass_inspector.schedule(selected_date);
        if(inspect.barrier == BLOCKED){
            show_error_message(`[${inspect.limit_type}] 이용자께서는 오늘 기준 전/후 ${inspect.limit_num}일간 일정 관리 하실 수 있습니다.`);
            return false;
        }
    }
}