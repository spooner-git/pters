class Plan_view{
    constructor(targetHTML_toolbox, targetHTML_u, targetHTML_m, targetHTML_b, data, instance){
        this.instance = instance;
        this.target = {
                        toolbox: targetHTML_toolbox, 
                        upper: targetHTML_u, 
                        middle: targetHTML_m, 
                        bottom: targetHTML_b
                        }

        this.d = new Date();
        this.time = {
            current_year : this.d.getFullYear(),
            current_month : this.d.getMonth(),
            current_date : this.d.getDate(),
            current_hour : TimeRobot.to_zone(this.d.getHours(), this.d.getMinutes()).hour,
            current_minute : TimeRobot.to_zone(this.d.getHours(), this.d.getMinutes()).minute,
            current_zone : TimeRobot.to_zone(this.d.getHours(), this.d.getMinutes()).zone
        }

        this.schedule_id = data.schedule_id;
        this.data_to_send = {
                lecture_id: "",
                lecture_ids: [],
                lecture_name: "",
                lecture_names: [],
                lecture_max_num: "",
                lecture_max_nums: [],
                member_id: "",
                member_ids: [],
                member_name: "",
                member_names:[],
                date: "",
                date_text: null,
                start_time: "",
                start_time_text: null,
                end_time: "",
                end_time_text: null,
                repeat: [
                            {day: "",
                            time: "",
                            repeat_start: "",
                            repeat_end: ""}
                ],
                memo: "",

                //plan_add 팝업의 data_to_send보다 추가된 항목
                lecture_color: null,
                lecture_current_num: null,
                lecture_state_cd: null,
                schedule_type:null
        };
    
        this.init();
    }


    set member(object){
        this.data_to_send.member_id = object.id.join('/');
        this.data_to_send.member_ids = object.id;

        this.data_to_send.member_name = object.name.join('/');
        this.data_to_send.member_names = object.name;

        this.render_upper();
    }

    get member(){
        return this.data_to_send.member_ids;
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

    init(){
        this.request_data((data)=>{
            this.render_test(data);
            this.render_toolbox_upper();
            this.render_upper();
            this.render_middle();
            this.render_bottom();
            this.render_toolbox_bottom();
        });
    }

    render_test(data){
        let datas = data.schedule_info[0];
        let raw_data = [];
        for(let item in datas){
            raw_data.push(
                `<div style="font-size:12px;padding:2px 10px;">
                    <span>${item}</span> : <span>${datas[item]}</span>
                </div>`
            );
        }

        let html = `<div>
                        <p>Raw Data</p>
                        ${raw_data.join('')}
                    </div>`
        document.querySelector('#test').innerHTML = html;
    }


    render_toolbox_upper(){

    }

    render_toolbox_bottom(){

    }

    render_upper(){
        let member_text = this.data_to_send.member_name == "" ? '회원*' : this.data_to_send.member_name;
        let html_member_select = CComponent.create_row('select_member', member_text, '/static/common/icon/icon_member.png', SHOW, (data)=>{
            //회원 선택 팝업 열기
            layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, {'data':null}, ()=>{
                var member_select = new MemberSelector('#wrapper_box_member_select', this, this.data_to_send.lecture_max_num, {'lecture_id':this.data_to_send.lecture_id});
            });
        });
        let html = html_member_select;
        document.querySelector(this.target.upper).innerHTML = html;
    }

    render_middle(){
        let date_text = this.data_to_send.date_text == null ? '날짜*' : this.data_to_send.date_text;
        let html_date_select = CComponent.create_row('select_date', date_text, '/static/common/icon/icon_cal.png', HIDE, (data)=>{ 
            show_error_message('날짜 입력 팝업 출력시켜야함');
        });
        let start_time_text = this.data_to_send.start_time_text == null ? '시작 시각*' : this.data_to_send.start_time_text;
        let html_start_time_select = CComponent.create_row('select_start_time', start_time_text, '/static/common/icon/icon_clock.png', HIDE, (data)=>{ 
            show_error_message('시작시간 입력 팝업 출력시켜야함');
        });
        let end_time_text = this.data_to_send.end_time_text == null ? '종료 시각*' : this.data_to_send.end_time_text;
        let html_end_time_select = CComponent.create_row('select_end_time', end_time_text, '/static/common/icon/icon_clock_white.png', HIDE, (data)=>{ 
            show_error_message('종료시간 입력 팝업 출력시켜야함');
        });

        let html = html_date_select + html_start_time_select + html_end_time_select;
        document.querySelector(this.target.middle).innerHTML = html;
    }

    render_bottom(){
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
        document.querySelector(this.target.bottom).innerHTML = html;
    }

    request_data(callback){
        Plan_func.read_plan(this.schedule_id, (data)=>{
            this.set_initial_data(data); // 초기값을 미리 셋팅한다.
            callback(data);
        })
    }

    set_initial_data(data){
        this.data_to_send.lecture_id = data.schedule_info[0].lecture_id;
        this.data_to_send.lecture_name = data.schedule_info[0].lecture_name;
        this.data_to_send.member_name = data.schedule_info[0].member_name;
        this.data_to_send.start_time = data.schedule_info[0].start_time;
        this.data_to_send.start_time_text = TimeRobot.to_text(data.schedule_info[0].start_time.split(':')[0], data.schedule_info[0].start_time.split(':')[1]);
        this.data_to_send.end_time = data.schedule_info[0].end_time;
        this.data_to_send.end_time_text = TimeRobot.to_text(data.schedule_info[0].end_time.split(':')[0], data.schedule_info[0].end_time.split(':')[1]);
        this.data_to_send.lecture_color = data.schedule_info[0].lecture_ing_color_cd;
        this.data_to_send.lecture_max_num = data.schedule_info[0].lecture_max_member_num;
        this.data_to_send.lecture_current_num = data.schedule_info[0].lecture_current_member_num;
        this.data_to_send.lecture_state_cd = data.schedule_info[0].state_cd;
        this.data_to_send.note = data.schedule_info[0].note;
        this.data_to_send.schedule_type = data.schedule_info[0].schedule_type;
    }

    send_data(){
        let data = {"lecture_id":this.data_to_send.lecture_id,
                    "start_dt":this.data_to_send.date.replace(/\./gi,"-") + ' ' + this.data_to_send.start_time,
                    "end_dt":this.data_to_send.date.replace(/\./gi,"-") + ' ' + this.data_to_send.end_time,
                    "note":this.data_to_send.memo, "duplication_enable_flag": 1,
                    "en_dis_type":this.data_to_send.schedule_type == "off" ? 0 : 1, "lecture_member_ids":this.data_to_send.member_ids
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