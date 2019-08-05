class Plan_view{
    constructor (install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_plan_view_toolbox', content:'section_plan_view_content'};
        this.instance = instance;

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
            schedule_type:null
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
        this.data.date = data.date;
        this.data.date_text = data.text;
        this.render_content();
    }

    get date (){
        return this.data.date;
    }

    set start_time (data){
        this.data.start_time = TimeRobot.to_data(data.data.zone, data.data.hour, data.data.minute).complete;
        this.data.start_time_text = data.text;
        this.render_content();
    }

    get start_time (){
        return this.data.start_time;
    }

    set end_time (data){
        this.data.end_time = TimeRobot.to_data(data.data.zone, data.data.hour, data.data.minute).complete;
        this.data.end_time_text = data.text;
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
            func_set_webkit_overflow_scrolling('.wrapper_middle');
        });
    }

    set_initial_data (data){
        this.data.lecture_id = data.schedule_info[0].lecture_id;
        this.data.lecture_name = data.schedule_info[0].lecture_name;
        this.data.member_id = data.schedule_info[0].lecture_schedule_data.map((it)=>{return `${it.member_id}`;});
        this.data.member_name = data.schedule_info[0].lecture_schedule_data.map((it)=>{return `${it.member_name}`;});
        this.data.member_schedule_id = data.schedule_info[0].lecture_schedule_data.map((it)=>{return `${it.schedule_id}`;});
        this.data.member_schedule_state = data.schedule_info[0].lecture_schedule_data.map((it)=>{return `${it.state_cd}`;});

        if(data.schedule_info[0].schedule_type == 1){
            this.data.member_name = data.schedule_info[0].member_name;
        }
        this.data.date = this.selected_date;
        this.data.date_text = DateRobot.to_text(this.data.date.year, this.data.date.month, this.data.date.date);
        this.data.start_time = data.schedule_info[0].start_time;
        this.data.start_time_text = TimeRobot.to_text(data.schedule_info[0].start_time.split(':')[0], data.schedule_info[0].start_time.split(':')[1]);
        this.data.end_time = data.schedule_info[0].end_time;
        this.data.end_time_text = TimeRobot.to_text(data.schedule_info[0].end_time.split(':')[0], data.schedule_info[0].end_time.split(':')[1]);
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
        let top_left = `<img src="/static/common/icon/navigate_before_black.png" onclick="layer_popup.close_layer_popup();plan_view_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_more_horizontal.png" class="obj_icon_basic" onclick="plan_view_popup.upper_right_menu();"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;padding:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_plan_view .wrapper_top').style.backgroundColor = this.data.lecture_color;
        document.querySelector('.popup_plan_view .wrapper_top').style.border = 0;
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
        if(this.data.schedule_type == 0){
            display = 'none';
        }
        
        let html =  `<div class="obj_box_full" style="display:${display}">`+ CComponent.dom_tag('회원') + member_select_row + member_list_row+'</div>' + 
                    '<div class="obj_box_full">' +  CComponent.dom_tag('일자') + date_select_row + 
                                                    CComponent.dom_tag('진행시간') + start_time_select_row + end_time_select_row + '</div>' +
                    '<div class="obj_box_full">'+ CComponent.dom_tag('메모') + memo_select_row + '</div>';

        return html;
    }

    dom_row_lecture_name (){
        let lecture_name;
        if(this.data.schedule_type == 0){
            lecture_name =`OFF 일정 ${this.data.memo != "" ? '('+this.data.memo+')' : ''}`;
        }else if(this.data.schedule_type == 1){
            lecture_name = this.data.member_name;
        }else if(this.data.schedule_type == 2){
            lecture_name = this.data.lecture_name;
        }

        let html = `
                    <div class="info_popup_title_wrap" style="height:50px;background-color:${this.data.lecture_color}">
                        <div class="info_popup_title" style="display:inline-block;line-height:50px;vertical-align:middle;font-size:18px;font-weight:bold;margin-left:16px;color:${this.data.lecture_font_color}">
                            ${lecture_name}
                        </div>
                    </div>
                    `;
        return html;
    }

    dom_row_member_select (){
        let member_text = this.data.member_id.length == 0 ? '회원*' : this.data.member_id.length+ '/' + this.data.lecture_max_num +' 명';
        let html_member_select = CComponent.create_row('select_member', member_text, '/static/common/icon/icon_member.png', SHOW, ()=>{
            //회원 선택 팝업 열기
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, {'data':null}, ()=>{
                member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.lecture_max_num, {'lecture_id':this.data.lecture_id}, (set_data)=>{
                    this.member = set_data;
                    this.render_content();
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
            let icon_button_style = null;
            html_to_join.push(
                CComponent.icon_button(member_id, member_name, null, icon_button_style, ()=>{
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SIMPLE_VIEW, 100*(400/windowHeight), POPUP_FROM_BOTTOM, {'member_id':member_id}, ()=>{
                        member_simple_view_popup = new Member_simple_view('.popup_member_simple_view', member_id, 'member_simple_view_popup');
                        //회원 간단 정보 팝업 열기
                    });
                })
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    dom_row_date_select (){
        let date_text = this.data.date_text == null ? '날짜*' : this.data.date_text;
        let html = CComponent.create_row('select_date', date_text, '/static/common/icon/icon_cal.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_DATE_SELECTOR, 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.date == null ? this.dates.current_year : this.data.date.year; 
                let month = this.data.date == null ? this.dates.current_month : this.data.date.month;
                let date = this.data.date == null ? this.dates.current_date : this.data.date.date;
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'날짜 선택', data:{year:year, month:month, date:date},  
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.date = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                }});


                // date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'날짜 선택', data:{year:year, month:month, date:date}, 
                //                                                                                 range:{start: this.dates.current_year - 5, end: this.dates.current_year+5},
                //                                                                                 callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                //                                                                                     this.date = object; 
                //                                                                                     //셀렉터에서 선택된 값(object)을 this.dataCenter에 셋팅하고 rerender 한다.
                //                                                                                 }});
            });
        });
        return html;
    }

    dom_row_start_time_select (){
        let start_time_text = this.data.start_time_text == null ? '시작 시각*' : this.data.start_time_text;
        let html = CComponent.create_row('select_start_time', start_time_text, '/static/common/icon/icon_clock.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TIME_SELECTOR, 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //dataCenter의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.data.start_time == null ? this.times.current_zone : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).zone;
                let hour = this.data.start_time == null ? this.times.current_hour : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).hour;
                let minute = this.data.start_time == null ? this.times.current_minute : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector('#wrapper_popup_time_selector_function', null, {myname:'time', title:'시작 시간 선택', data:{zone:zone, hour:hour, minute:minute}, 
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.start_time = object;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.dataCenter에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        return html;
    }

    dom_row_end_time_select (){
        let end_time_text = this.data.end_time_text == null ? '종료 시각*' : this.data.end_time_text;
        let html = CComponent.create_row('select_end_time', end_time_text, '/static/common/icon/icon_clock_white.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TIME_SELECTOR, 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //dataCenter의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.data.end_time == null ? this.times.current_zone : TimeRobot.to_zone(this.data.end_time.split(':')[0], this.data.end_time.split(':')[1]).zone;
                let hour = this.data.end_time == null ? this.times.current_hour : TimeRobot.to_zone(this.data.end_time.split(':')[0], this.data.end_time.split(':')[1]).hour;
                let minute = this.data.end_time == null ? this.times.current_minute : TimeRobot.to_zone(this.data.end_time.split(':')[0], this.data.end_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector('#wrapper_popup_time_selector_function', null, {myname:'time', title:'종 시간 선택', data:{zone:zone, hour:hour, minute:minute}, 
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.end_time = object;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.dataCenter에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        return html;
    }

    dom_row_memo_select (){
        let style = null;
        let html = CComponent.create_input_row ('select_memo', this.data.memo == null ? '' : this.data.memo, '일정 메모', '/static/common/icon/icon_note.png', HIDE, style, false, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        });
        return html;
    }

    request_data (callback){
        Plan_func.read_plan(this.schedule_id, (data)=>{
            this.set_initial_data(data); // 초기값을 미리 셋팅한다.
            callback(data);
        });
    }

    upper_right_menu(){
        let user_option = {
            cancel:{text:"일정 취소", callback:()=>{ show_user_confirm(`정말 ${this.data.schedule_type != "0" ? this.data.lecture_name : 'OFF'} 일정을 취소하시겠습니까?`, ()=>{
                            Plan_func.delete({"schedule_id":this.schedule_id}, ()=>{
                                calendar.init();layer_popup.all_close_layer_popup();
                            });
                            
                        });
                    }
            },
            check:{text:"출석 체크", callback:()=>{
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_ATTEND, 100, POPUP_FROM_RIGHT, null, ()=>{
                        member_attend = new Member_attend('.popup_member_attend', this.schedule_id, (set_data)=>{
                            //출석체크 팝업에서 완료버튼을 눌렀을때 할 행동
                            // this.data = {
                            //     id:{name:null, member_id:null, state_cd:null}
                            // };
                            for(let member in set_data){
                                let member_id = member;
                                let state_cd = set_data[member].state_cd;
                                let member_id_index = this.data.member_id.indexOf(member_id);
                                if(this.data.member_schedule_state[member_id_index] != state_cd){
                                    let send_data = {"schedule_id":this.data.member_schedule_id[member_id_index], "state_cd":state_cd};
                                    Plan_func.status(send_data, ()=>{
                                        this.init();
                                    });
                                }

                            }
                        });
                    });    
                }
            }
        };
        
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(45+50*Object.keys(user_option).length)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    send_data (){
        let data = {"lecture_id":this.data.lecture_id,
                    "start_dt":this.data.date.replace(/\./gi,"-") + ' ' + this.data.start_time,
                    "end_dt":this.data.date.replace(/\./gi,"-") + ' ' + this.data.end_time,
                    "note":this.data.memo, "duplication_enable_flag": 1,
                    "en_dis_type":this.data.schedule_type == "off" ? 0 : 1, "lecture_member_ids":this.data.member_id
        };
        //en_dis_type 0: off일정, 1:레슨일정
        //duplication_enable_flag 0: 중복불허 1:중복허용
        let url;
        url ='/schedule/add_schedule/';

        Plan_func.create(url, data, ()=>{
            layer_popup.close_layer_popup();
            calendar.init();
        });
    }

}