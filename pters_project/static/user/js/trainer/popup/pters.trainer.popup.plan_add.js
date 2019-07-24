class Plan_add{
    constructor(targetHTML_toolbox, targetHTML_u, targetHTML_m, targetHTML_b, data_from_external, instance){
        this.targetHTML_toolbox = targetHTML_toolbox;
        this.targetHTML_upper = targetHTML_u;
        this.targetHTML_middle = targetHTML_m;
        this.targetHTML_bottom = targetHTML_b;
        this.instance = instance;

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

        this.data_to_send = {
                lecture_id:"",
                lecture_ids:[],
                lecture_name:"",
                lecture_names:[],
                lecture_max_num:"",
                lecture_max_nums:[],
                member_id:"",
                member_ids:[],
                member_name:"",
                member_names:[],
                date: null,
                date_text: null,
                start_time:"",
                start_time_text: null,
                end_time:"",
                end_time_text: null,
                repeat:{
                            day:"",
                            time:"",
                            repeat_start:"",
                            repeat_end:""
                },
                memo:""
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
        this.set_initial_data(data_from_external);
        this.init();
    }


    set member(object){
        this.data_to_send.member_id = object.id.join('/');
        this.data_to_send.member_ids = object.id;

        this.data_to_send.member_name = object.name.join(', ');
        this.data_to_send.member_names = object.name;

        this.render_upper();
    }

    get member(){
        return {id:this.data_to_send.member_ids, name:this.data_to_send.member_names};
    }

    set lecture(object){
        this.data_to_send.lecture_id = object.id.join('/');
        this.data_to_send.lecture_ids = object.id;

        this.data_to_send.lecture_name = object.name.join(', ');
        this.data_to_send.lecture_names = object.name;

        this.data_to_send.lecture_max_num = object.max.join(', ');
        this.data_to_send.lecture_max_nums = object.max;

        this.member = {id:[], name: []}; //수업을 선택했기 때문에, 회원란을 모두 비워준다.

        this.render_upper();
    }

    get lecture(){
        return {id:this.data_to_send.lecture_ids, name:this.data_to_send.lecture_names, max:this.data_to_send.lecture_max_nums};
    }

    set date(object){
        this.data_to_send.date = object.data;
        this.data_to_send.date_text = object.text;
        this.render_middle();
    }

    get date(){
        return this.data_to_send.date;
    }

    set start_time(object){
        this.data_to_send.start_time = TimeRobot.to_data(object.data.zone, object.data.hour, object.data.minute).complete;
        this.data_to_send.start_time_text = object.text;
        this.render_middle();
    }

    get start_time(){
        return this.data_to_send.start_time;
    }

    set end_time(object){
        this.data_to_send.end_time = TimeRobot.to_data(object.data.zone, object.data.hour, object.data.minute).complete;
        this.data_to_send.end_time_text = object.text;
        this.render_middle();
    }

    get end_time(){
        return this.data_to_send.end_time;
    }

    set memo(text){
        this.data_to_send.memo = text;
        this.render_bottom();
    }

    get memo(){
        return this.data_to_send.memo;
    }


    init(type){
        if(type == undefined){
            type = this.list_type;
        }
        this.list_type = type;

        this.render_toolbox();

        if(type == "off"){
            this.render_off_add_set();
        }else if(type == "lesson"){
            this.render_lecture_add_set();
        }
    }

    set_initial_data(data){
        this.user_data = data;
        let user_data_date = this.user_data.user_selected_date;
        this.data_to_send.date = user_data_date.year == null ? null : {year: user_data_date.year, month:user_data_date.month, date:user_data_date.date};
        this.data_to_send.date_text = user_data_date.text;
        
        let user_data_time = this.user_data.user_selected_time;
        this.data_to_send.start_time = user_data_time.hour == null ? null : `${user_data_time.hour}:${user_data_time.minute}`;
        this.data_to_send.start_time_text = user_data_time.text;
        this.data_to_send.end_time = user_data_time.hour2 == null ? null : `${user_data_time.hour2}:${user_data_time.minute2}`;
        this.data_to_send.end_time_text = user_data_time.text2;
    }

    render_toolbox(){
        let component = this.static_component();
        let html = component.plan_add_upper_box;
        document.querySelector(this.targetHTML_toolbox).innerHTML = html;
    }

    render_lecture_add_set(){
        this.render_upper();
        this.render_middle();
        this.render_bottom();
    }

    render_off_add_set(){
        this.render_upper('delete');
        this.render_middle();
        this.render_bottom();
    }

    render_upper(del){
        let lecture_text = this.data_to_send.lecture_name == "" ? '수업*' : this.data_to_send.lecture_name;
        let html_lecture_select = CComponent.create_row('select_lecture', lecture_text, '/static/common/icon/icon_book.png', SHOW, (data)=>{ 
            layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_SELECT, 100, POPUP_FROM_RIGHT, {'member_id':null}, ()=>{
                var lecture_select = new LectureSelector('#wrapper_box_lecture_select', this, 1);
            });
        });
        let member_text = this.data_to_send.member_name == "" ? '회원*' : this.data_to_send.member_name;
        let html_member_select = CComponent.create_row('select_member', member_text, '/static/common/icon/icon_member.png', SHOW, (data)=>{
            if(this.data_to_send.lecture_id != ""){
                layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, {'member_id':null}, ()=>{
                    var member_select = new MemberSelector('#wrapper_box_member_select', this, this.data_to_send.lecture_max_num, {'lecture_id':this.data_to_send.lecture_id});
                });
            }else{
                show_error_message('수업을 먼저 선택해주세요.');
            }
        });
        let html = html_lecture_select + html_member_select;

        if(del != undefined){
            html = "";
        }

        document.querySelector(this.targetHTML_upper).innerHTML = html;
    }

    render_middle(del){
        //등록하는 행을 만든다.
        let date_text = this.data_to_send.date_text == null ? '날짜*' : this.data_to_send.date_text;
        let html_date_select = CComponent.create_row('select_date', date_text, '/static/common/icon/icon_cal.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data_to_send.date == null ? this.dates.current_year : this.data_to_send.date.year; 
                let month = this.data_to_send.date == null ? this.dates.current_month : this.data_to_send.date.month;
                let date = this.data_to_send.date == null ? this.dates.current_date : this.data_to_send.date.date;
                
                date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'날짜 선택', data:{year:year, month:month, date:date}, 
                                                                                                range:{start: this.dates.current_year - 5, end: this.dates.current_year+5}, 
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.date = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });

        let start_time_text = this.data_to_send.start_time_text == null ? '시작 시간*' : this.data_to_send.start_time_text;
        let html_start_select = CComponent.create_row('select_start', start_time_text, '/static/common/icon/icon_clock.png', HIDE, ()=>{ //data : 직전 셋팅값
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.data_to_send.start_time == null ? this.times.current_zone : TimeRobot.to_zone(this.data_to_send.start_time.split(':')[0], this.data_to_send.start_time.split(':')[1]).zone;
                let hour = this.data_to_send.start_time == null ? this.times.current_hour : TimeRobot.to_zone(this.data_to_send.start_time.split(':')[0], this.data_to_send.start_time.split(':')[1]).hour;
                let minute = this.data_to_send.start_time == null ? this.times.current_minute : TimeRobot.to_zone(this.data_to_send.start_time.split(':')[0], this.data_to_send.start_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector('#wrapper_popup_time_selector_function', null, {myname:'time', title:'시작 시간 선택', data:{zone:zone, hour:hour, minute:minute}, 
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.start_time = object;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });

        let end_time_text = this.data_to_send.end_time_text == null ? '종료 시간*' : this.data_to_send.end_time_text;
        let html_end_select = CComponent.create_row('select_end', end_time_text, '/static/common/icon/icon_clock_white.png', HIDE, ()=>{ //data : 직전 셋팅값
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.data_to_send.end_time == null ? this.times.current_zone : TimeRobot.to_zone(this.data_to_send.end_time.split(':')[0], this.data_to_send.end_time.split(':')[1]).zone;
                let hour = this.data_to_send.end_time == null ? this.times.current_hour : TimeRobot.to_zone(this.data_to_send.end_time.split(':')[0], this.data_to_send.end_time.split(':')[1]).hour;
                let minute = this.data_to_send.end_time == null ? this.times.current_minute : TimeRobot.to_zone(this.data_to_send.end_time.split(':')[0], this.data_to_send.end_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector('#wrapper_popup_time_selector_function', null, {myname:'time', title:'종료 시간 선택', data:{zone:zone, hour:hour, minute:minute}, 
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.end_time = object;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        let html_repeat_select = CComponent.create_row('select_repeat', this.data_to_send.repeat.time == "" ? '반복 일정' : this.data_to_send.repeat.day+' '+this.data_to_send.repeat.time, '/static/common/icon/icon_repeat.png', SHOW, (data)=>{ console.log(data);});

        let html = html_date_select + html_start_select + html_end_select + html_repeat_select;

        if(del != undefined){
            html = "";
        }

        document.querySelector(this.targetHTML_middle).innerHTML = html;
    }

    render_bottom(del){
        let html_memo_select = CComponent.create_input_row ('select_memo', this.data_to_send.memo == "" ? '메모' : this.data_to_send.memo, '/static/common/icon/icon_note.png', HIDE, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        });
        let html = html_memo_select;
        if(del != undefined){
            html = "";
        }
        document.querySelector(this.targetHTML_bottom).innerHTML = html;
    }


    switch_type(){
        switch(this.list_type){
            case "lesson":
                this.init("off");
            break;

            case "off":
                this.init("lesson");
            break;
        }
    }

    send_data(){

        let data = {"lecture_id":this.data_to_send.lecture_id,
                    "start_dt": this.data_to_send.date.year+'-'+this.data_to_send.date.month+'-'+this.data_to_send.date.date + ' ' + this.data_to_send.start_time,
                    "end_dt":this.data_to_send.date.year+'-'+this.data_to_send.date.month+'-'+this.data_to_send.date.date + ' ' + this.data_to_send.end_time,
                    "note":this.data_to_send.memo, "duplication_enable_flag": 1,
                    "en_dis_type":this.list_type == "off" ? 0 : 1, "lecture_member_ids":this.data_to_send.member_ids
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


    static_component(){
        return {
            "plan_add_upper_box":`   <div class="plan_add_upper_box">
                                        <div style="display:inline-block;width:200px;">
                                            <div style="display:inline-block;width:200px;">
                                                <span style="font-size:20px;font-weight:bold;">일정 등록</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="plan_add_bottom_tools_wrap">
                                        <div class="list_type_tab_wrap">
                                            <div onclick="${this.instance}.switch_type();" class="${this.list_type == "lesson" ? "tab_selected" : ""}">수업</div>
                                            <div onclick="${this.instance}.switch_type();" class="${this.list_type == "off" ? "tab_selected" : ""}">OFF</div>
                                        </div>
                                    </div>
                                        `
        }
    }
}