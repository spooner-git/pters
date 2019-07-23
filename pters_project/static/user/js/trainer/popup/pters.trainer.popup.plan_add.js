class Plan_add{
    constructor(targetHTML_toolbox, targetHTML_u, targetHTML_m, targetHTML_b, data_from_external, instance){
        this.targetHTML_toolbox = targetHTML_toolbox;
        this.targetHTML_upper = targetHTML_u;
        this.targetHTML_middle = targetHTML_m;
        this.targetHTML_bottom = targetHTML_b;
        this.instance = instance;

        this.list_type = "lesson";

        let d = new Date();
        this.current_year = d.getFullYear();
        this.current_month = d.getMonth();
        this.current_date = d.getDate();
        this.current_hour = TimeRobot.to_zone(d.getHours(), d.getMinutes()).hour;
        this.current_minute = TimeRobot.to_zone(d.getHours(), d.getMinutes()).minute;
        this.current_zone = TimeRobot.to_zone(d.getHours(), d.getMinutes()).zone;

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
                date:"",
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
        this.user_data = data_from_external;
        let user_data_date = this.user_data.user_selected_date;
        this.data_to_send.date = user_data_date.year == null ? null : `${user_data_date.year}.${user_data_date.month}.${user_data_date.date}`;
        this.data_to_send.date_text = user_data_date.text;
        
        let user_data_time = this.user_data.user_selected_time;
        this.data_to_send.start_time = user_data_time.hour == null ? null : `${user_data_time.hour}:${user_data_time.minute}`;
        this.data_to_send.start_time_text = user_data_time.text;
        this.data_to_send.end_time = user_data_time.hour2 == null ? null : `${user_data_time.hour2}:${user_data_time.minute2}`;
        this.data_to_send.end_time_text = user_data_time.text2;
        
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
        return this.data_to_send.member_ids;
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
        return this.data_to_send.lecture_id;
    }

    set date(object){
        this.data_to_send.date = object.date;
        this.data_to_send.date_text = object.text;
        this.render_middle();
    }

    get date(){
        return this.data_to_send.date;
    }

    set start_time(object){
        this.data_to_send.start_time = object.time;
        this.data_to_send.start_time_text = object.text;
        this.render_middle();
    }

    get start_time(){
        return this.data_to_send.start_time;
    }

    set end_time(object){
        this.data_to_send.end_time = object.time;
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
        let html_date_select = CComponent.create_row('select_date', date_text, '/static/common/icon/icon_cal.png', HIDE, (data)=>{ 
            //행을 클릭했을때 실행할 내용
            let date_select_on_plan_add = new DateSelector('#date_select_on_plan_add', '#select_date .cell_text', "date_select_on_plan_add", {
                                                                    year_start : this.current_year - 5,
                                                                    year_end : this.current_year + 5,
                                                                    init_year : data != undefined ? data.split('.')[0] : this.user_data.user_selected_date.year,
                                                                    init_month : data != undefined ? data.split('.')[1] : this.user_data.user_selected_date.month,
                                                                    init_date : data != undefined ? data.split('.')[2] : this.user_data.user_selected_date.date,
                                                                    //DateSelector에서 값을 정했을때 실행할 함수
                                                                    callback_when_set : (data)=>{
                                                                        //data는 DateSelector의 set_selected_data로부터 넘어온 유저의 선택값
                                                                        //DateSelector에서 선택된 값을 서버에 보낼 값에 저장한다.
                                                                        this.data_to_send.date = data.data;
                                                                        this.data_to_send.date_text = data.data_text;
                                                                    }
                                                                });
        }) +`<div id="date_select_on_plan_add"></div>`;

        let start_time_text = this.data_to_send.start_time_text == null ? '시작 시간*' : this.data_to_send.start_time_text;
        let html_start_select = CComponent.create_row('select_start', start_time_text, '/static/common/icon/icon_clock.png', HIDE, (data)=>{ //data : 직전 셋팅값
            let user_selected_time = this.user_data.user_selected_time;
            let init_zone = data != undefined ? data.split('.')[0] : TimeRobot.to_zone(user_selected_time.hour, user_selected_time.minute).zone;
            let init_hour = data != undefined ? data.split('.')[1] : TimeRobot.to_zone(user_selected_time.hour, user_selected_time.minute).hour;
            let init_minute = data != undefined ? data.split('.')[2] : TimeRobot.to_zone(user_selected_time.hour, user_selected_time.minute).minute;
            let time_start_select_on_plan_add = new TimeSelector('#time_start_select_on_plan_add', '#select_start .cell_text', "time_start_select_on_plan_add", {
                                                                    init_zone : init_zone,
                                                                    init_hour : init_hour,
                                                                    init_minute : init_minute,
                                                                    callback_when_set : (data)=>{
                                                                        let prev_zone = Number(data.data.split('.')[0]);
                                                                        let prev_hour = Number(data.data.split('.')[1]);
                                                                        let prev_minute = Number(data.data.split('.')[2]);
                                                                        let result = TimeRobot.to_data(prev_zone, prev_hour, prev_minute);

                                                                        if(this.data_to_send.end_time != null){
                                                                            let end_hour = this.data_to_send.end_time.split(':')[0];
                                                                            let end_min = this.data_to_send.end_time.split(':')[1];
                                                                            if(result.hour > end_hour){
                                                                                show_error_message('시작시각은 종료시각보다 클 수 없습니다.1');
                                                                                time_start_select_on_plan_add.reset(init_zone, init_hour, init_minute);
                                                                                return false;
                                                                            }
                                                                            if(result.hour == end_hour){
                                                                                if(result.minute >= end_min){
                                                                                    show_error_message('시작시각은 종료시각보다 클 수 없습니다.2');
                                                                                    time_start_select_on_plan_add.reset(init_zone, init_hour, init_minute);
                                                                                    return false;
                                                                                }
                                                                            }
                                                                        }

                                                                        time_start_select_on_plan_add.delete();
                                                                        this.data_to_send.start_time = result.complete;
                                                                        this.data_to_send.start_time_text = data.data_text;
                                                                    }
                                                                });
            })  +`<div id="time_start_select_on_plan_add"></div>`;

        let end_time_text = this.data_to_send.end_time_text == null ? '종료 시간*' : this.data_to_send.end_time_text;
        let html_end_select = CComponent.create_row('select_end', end_time_text, '/static/common/icon/icon_clock_white.png', HIDE, (data)=>{ //data : 직전 셋팅값
            let user_selected_time = this.user_data.user_selected_time;
            let init_zone = data != undefined ? data.split('.')[0] : TimeRobot.to_zone(user_selected_time.hour2, user_selected_time.minute2).zone;
            let init_hour = data != undefined ? data.split('.')[1] : TimeRobot.to_zone(user_selected_time.hour2, user_selected_time.minute2).hour;
            let init_minute = data != undefined ? data.split('.')[2] : TimeRobot.to_zone(user_selected_time.hour2, user_selected_time.minute2).minute;
            let time_end_select_on_plan_add = new TimeSelector('#time_end_select_on_plan_add', '#select_end .cell_text', "time_end_select_on_plan_add", {
                                                                    init_zone : init_zone,
                                                                    init_hour : init_hour,
                                                                    init_minute : init_minute,
                                                                    callback_when_set : (data)=>{
                                                                        let prev_zone = Number(data.data.split('.')[0]);
                                                                        let prev_hour = Number(data.data.split('.')[1]);
                                                                        let prev_minute = Number(data.data.split('.')[2]);
                                                                        let result = TimeRobot.to_data(prev_zone, prev_hour, prev_minute);

                                                                        if(this.data_to_send.start_time != null){
                                                                            let start_hour = this.data_to_send.start_time.split(':')[0];
                                                                            let start_min = this.data_to_send.start_time.split(':')[1];
                                                                            if(result.hour < start_hour){
                                                                                show_error_message('종료시각은 시작시각보다 작을 수 없습니다.');
                                                                                time_end_select_on_plan_add.reset(init_zone, init_hour, init_minute);
                                                                                return false;
                                                                            }
                                                                            if(result.hour == start_hour){
                                                                                if(result.minute <= start_min){
                                                                                    show_error_message('종료시각은 시작시각보다 작을 수 없습니다.');
                                                                                    time_end_select_on_plan_add.reset(init_zone, init_hour, init_minute);
                                                                                    return false;
                                                                                }
                                                                            }
                                                                        }
                                                                        time_end_select_on_plan_add.delete();
                                                                        this.data_to_send.end_time = result.complete == "0:0" ? "23:59" : result.complete;
                                                                        this.data_to_send.end_time_text = data.data_text;
                                                                    }
                                                                });
        })  +`<div id="time_end_select_on_plan_add"></div>`;
        let html_repeat_select = CComponent.create_row('select_repeat', this.data_to_send.repeat.time == "" ? '반복 일정' : this.data_to_send.repeat.day+' '+this.data_to_send.repeat.time, '/static/common/icon/icon_repeat.png', SHOW, (data)=>{ console.log(data);});

        let html = html_date_select + html_start_select + html_end_select + html_repeat_select;

        if(del != undefined){
            html = "";
        }

        document.querySelector(this.targetHTML_middle).innerHTML = html;
    }

    render_bottom(del){
        //메모 입력 행을 생성한다. 메모입력 행을 클릭했을때 실행할 함수를 전달한다.
        let html_memo_select = CComponent.create_row('select_memo', this.data_to_send.memo == "" ? '메모' : this.data_to_send.memo, '/static/common/icon/icon_note.png', HIDE, (data)=>{ 
            let memo_row = event.target; //event.target은 메모 행
            show_user_input_popup("text", memo_row.innerText, ()=>{  //메모행을 클릭했을때 실행될 함수. 메모행에서 입력후 확인을 눌렀을때 실행할 함수를 전달한다.
                //메모행에서 입력후 확인을 눌렀을때, 입력값을 저장한다. 
                let user_input = $(event.target).parent().siblings('div').find('.popup_basic_user_input_data').val(); //event.target은 메모행의 확인버튼
                $(memo_row).find('.cell_text').text(user_input);
                $(memo_row).find('.cell_text').siblings('input').val(user_input);

                this.data_to_send.memo = user_input;
            })
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
                    "start_dt":this.data_to_send.date.replace(/\./gi,"-") + ' ' + this.data_to_send.start_time,
                    "end_dt":this.data_to_send.date.replace(/\./gi,"-") + ' ' + this.data_to_send.end_time,
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