class Plan_add{
    constructor(install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_plan_add_toolbox', content:'section_plan_add_content'};
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

        this.data = {
            lecture_id:[],
            lecture_name:[],
            lecture_max_num:[],
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
                    day: null,
                    time: null,
                    repeat_start: null,
                    repeat_end: null
                }
            ,
            memo:""
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
        this.set_initial_data(data_from_external);
        this.init();
    }

    set lecture(data){
        this.data.lecture_id = data.id;
        this.data.lecture_name = data.name;
        this.data.lecture_max_num = data.max;
        this.member = {id:[], name: []}; //수업을 선택했기 때문에, 회원란을 모두 비워준다.
        this.render_content();
    }

    get lecture(){
        return {id:this.data.lecture_id, name:this.data.lecture_name, max:this.data.lecture_max_num};
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
        this.data.start_time_text = data.text;
        this.render_content();
    }

    get start_time(){
        return this.data.start_time;
    }

    set end_time(data){
        this.data.end_time = TimeRobot.to_data(data.data.zone, data.data.hour, data.data.minute).complete;
        this.data.end_time_text = data.text;
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


    init(type){
        if(type == undefined){
            type = this.list_type;
        }
        this.list_type = type;

        this.render_initial();
        this.render_toolbox();
        this.render_content();
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

    render_initial(){
        document.querySelector(this.target.install).innerHTML = this.static_component().initial_page;
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_row_toolbox();
    }
    
    render_content(){
        let lecture_select_row = this.dom_row_lecture_select();
        let member_select_row = this.dom_row_member_select();
        let date_select_row = this.dom_row_date_select();
        let start_time_select_row = this.dom_row_start_time_select();
        let end_time_select_row = this.dom_row_end_time_select();
        let repeat_select_row = this.dom_row_repeat_select();
        let memo_select_row = this.dom_row_memo_select();

        if(this.list_type != "lesson"){
            lecture_select_row = "";
            member_select_row = "";
        }

        let html =  '<div class="obj_box_full">'+lecture_select_row + member_select_row+'</div>' + 
                    '<div class="obj_box_full">' + date_select_row + start_time_select_row + end_time_select_row + repeat_select_row + '</div>' +
                    '<div class="obj_box_full">'+  memo_select_row + '</div>';

        document.getElementById(this.target.content).innerHTML = html;
    }

    dom_row_toolbox(){
        let html = `
        <div class="plan_add_upper_box" style="padding-bottom:8px;">
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
        `;
        return html;
    }

    dom_row_lecture_select(){
        let lecture_text = this.data.lecture_name.length == 0 ? '수업*' : this.data.lecture_name.join(', ');
        let html = CComponent.create_row('select_lecture', lecture_text, '/static/common/icon/icon_book.png', SHOW, (data)=>{ 
            layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_SELECT, 100, POPUP_FROM_RIGHT, {'member_id':null}, ()=>{
                var lecture_select = new LectureSelector('#wrapper_box_lecture_select', this, 1);
            });
        });
        return html;
    }

    dom_row_member_select(){
        let member_text = this.data.member_name.length == 0 ? '회원*' : this.data.member_name.join(', ');
        let html = CComponent.create_row('select_member', member_text, '/static/common/icon/icon_member.png', SHOW, (data)=>{
            if(this.data.lecture_id.length != 0){
                layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, {'member_id':null}, ()=>{
                    var member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.lecture_max_num[0], {'lecture_id':this.data.lecture_id[0]});
                });
            }else{
                show_error_message('수업을 먼저 선택해주세요.');
            }
        });
        return html;
    }

    dom_row_date_select(){
        //등록하는 행을 만든다.
        let date_text = this.data.date_text == null ? '날짜*' : this.data.date_text;
        let html = CComponent.create_row('select_date', date_text, '/static/common/icon/icon_cal.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*305/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

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
                //                                                                                     //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                //                                                                                 }});
                
            });
        });
        return html;
    }

    dom_row_start_time_select(){
        let start_time_text = this.data.start_time_text == null ? '시작 시간*' : this.data.start_time_text;
        let html = CComponent.create_row('select_start', start_time_text, '/static/common/icon/icon_clock.png', HIDE, ()=>{ //data : 직전 셋팅값
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.data.start_time == null ? this.times.current_zone : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).zone;
                let hour = this.data.start_time == null ? this.times.current_hour : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).hour;
                let minute = this.data.start_time == null ? this.times.current_minute : TimeRobot.to_zone(this.data.start_time.split(':')[0], this.data.start_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector('#wrapper_popup_time_selector_function', null, {myname:'time', title:'시작 시간 선택', data:{zone:zone, hour:hour, minute:minute}, 
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.start_time = object;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        return html;
    }

    dom_row_end_time_select(){
        let end_time_text = this.data.end_time_text == null ? '종료 시간*' : this.data.end_time_text;
        let html = CComponent.create_row('select_end', end_time_text, '/static/common/icon/icon_clock_white.png', HIDE, ()=>{ //data : 직전 셋팅값
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.data.end_time == null ? this.times.current_zone : TimeRobot.to_zone(this.data.end_time.split(':')[0], this.data.end_time.split(':')[1]).zone;
                let hour = this.data.end_time == null ? this.times.current_hour : TimeRobot.to_zone(this.data.end_time.split(':')[0], this.data.end_time.split(':')[1]).hour;
                let minute = this.data.end_time == null ? this.times.current_minute : TimeRobot.to_zone(this.data.end_time.split(':')[0], this.data.end_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector('#wrapper_popup_time_selector_function', null, {myname:'time', title:'종료 시간 선택', data:{zone:zone, hour:hour, minute:minute}, 
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.end_time = object;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        return html;
    }

    dom_row_repeat_select(){
        let html = CComponent.create_row('select_repeat', this.data.repeat.time == null ? '반복 일정' : this.data.repeat.day+' '+this.data.repeat.time, '/static/common/icon/icon_repeat.png', SHOW, (data)=>{ console.log(data);});
        return html;
    }

    dom_row_memo_select(){
        let html = CComponent.create_input_row ('select_memo', this.data.memo == "" ? '메모' : this.data.memo, '/static/common/icon/icon_note.png', HIDE, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        });
        return html;
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

        let data = {"lecture_id":this.data.lecture_id[0],
                    "start_dt": this.data.date.year+'-'+this.data.date.month+'-'+this.data.date.date + ' ' + this.data.start_time,
                    "end_dt":this.data.date.year+'-'+this.data.date.month+'-'+this.data.date.date + ' ' + this.data.end_time,
                    "note":this.data.memo, "duplication_enable_flag": 1,
                    "en_dis_type":this.list_type == "off" ? 0 : 1, "lecture_member_ids":this.data.member_id
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
            initial_page:`<section id="${this.target.toolbox}" class="obj_box_full" style="border:0"></section>
                          <section id="${this.target.content}"></section>`
        };
    }
}