class Plan_view{
    constructor (target_html, data, instance){
        this.instance = instance;
        this.target = {
            initial_page: target_html,
            toolbox: '#wrapper_box_plan_view_toolbox', 
            upper: '#wrapper_box_plan_view_upper', 
            middle: '#wrapper_box_plan_view_middle', 
            bottom: '#wrapper_box_plan_view_bottom'
        };

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

        this.schedule_id = data.schedule_id;
        this.store = {
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
                {
                    day: "",
                    time: "",
                    repeat_start: "",
                    repeat_end: ""
                }
            ],
            memo: "",

            //plan_add 팝업의 dataCenter보다 추가된 항목
            lecture_color: null,
            lecture_current_num: null,
            lecture_state_cd: null,
            schedule_type:null
        };
    
        this.init();
    }


    set member (object){
        this.store.member_id = object.id.join('/');
        this.store.member_ids = object.id;

        this.store.member_name = object.name.join(', ');
        this.store.member_names = object.name;

        this.render_upper();
    }

    get member (){
        return {id:this.store.member_ids, name:this.store.member_names};
    }

    set date (object){
        this.store.date = object.date;
        this.store.date_text = object.text;
        this.render_middle();
    }

    get date (){
        return this.store.date;
    }

    set start_time (object){
        this.store.start_time = object.time;
        this.store.start_time_text = object.text;
        this.render_middle();
    }

    get start_time (){
        return this.store.start_time;
    }

    set end_time (object){
        this.store.end_time = object.time;
        this.store.end_time_text = object.text;
        this.render_middle();
    }

    get end_time (){
        return this.store.end_time;
    }

    set memo (text){
        this.store.memo = text;
        this.render_bottom();
    }

    get memo (){
        return this.store.memo;
    }

    init (){
        let component = this.static_component();
        document.querySelector(this.target.initial_page).innerHTML = component.initial_page;

        this.request_data((data)=>{
            this.render_toolbox();
            if(data.schedule_info[0].schedule_type != 0){
                this.render_upper();
            }
            this.render_middle();
            this.render_bottom();
        });

        this.set_additional_button_event();
    }


    render_toolbox (){
        document.querySelector('.wrapper_top').style.backgroundColor = this.store.lecture_color;
        let html = this.dom_row_lecture_name();
        document.querySelector(this.target.toolbox).innerHTML = html;
    }

    render_upper (del){
        let html = this.dom_row_member_select() + this.dom_row_member_list();
        if(del != undefined){
            html = "";
        }
        document.querySelector(this.target.upper).innerHTML = html;
    }

    render_middle (del){
        let date_text = this.store.date_text == null ? '날짜*' : this.store.date_text;
        let html_date_select = CComponent.create_row('select_date', date_text, '/static/common/icon/icon_cal.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_DATE_SELECTOR, 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //dataCenter의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.store.date == null ? this.dates.current_year : this.store.date.year; 
                let month = this.store.date == null ? this.dates.current_month : this.store.date.month;
                let date = this.store.date == null ? this.dates.current_date : this.store.date.date;
                
                date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'날짜 선택', data:{year:year, month:month, date:date}, 
                                                                                                range:{start: this.dates.current_year - 5, end: this.dates.current_year+5}, 
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.date = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.dataCenter에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        let start_time_text = this.store.start_time_text == null ? '시작 시각*' : this.store.start_time_text;
        let html_start_time_select = CComponent.create_row('select_start_time', start_time_text, '/static/common/icon/icon_clock.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TIME_SELECTOR, 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //dataCenter의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.store.start_time == null ? this.times.current_zone : TimeRobot.to_zone(this.store.start_time.split(':')[0], this.store.start_time.split(':')[1]).zone;
                let hour = this.store.start_time == null ? this.times.current_hour : TimeRobot.to_zone(this.store.start_time.split(':')[0], this.store.start_time.split(':')[1]).hour;
                let minute = this.store.start_time == null ? this.times.current_minute : TimeRobot.to_zone(this.store.start_time.split(':')[0], this.store.start_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector('#wrapper_popup_time_selector_function', null, {myname:'time', title:'시작 시간 선택', data:{zone:zone, hour:hour, minute:minute}, 
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.start_time = object;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.dataCenter에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        let end_time_text = this.store.end_time_text == null ? '종료 시각*' : this.store.end_time_text;
        let html_end_time_select = CComponent.create_row('select_end_time', end_time_text, '/static/common/icon/icon_clock_white.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TIME_SELECTOR, 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //dataCenter의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.store.end_time == null ? this.times.current_zone : TimeRobot.to_zone(this.store.end_time.split(':')[0], this.store.end_time.split(':')[1]).zone;
                let hour = this.store.end_time == null ? this.times.current_hour : TimeRobot.to_zone(this.store.end_time.split(':')[0], this.store.end_time.split(':')[1]).hour;
                let minute = this.store.end_time == null ? this.times.current_minute : TimeRobot.to_zone(this.store.end_time.split(':')[0], this.store.end_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector('#wrapper_popup_time_selector_function', null, {myname:'time', title:'종 시간 선택', data:{zone:zone, hour:hour, minute:minute}, 
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.end_time = object;
                                                                                                    //셀렉터에서 선택된 값(object)을 this.dataCenter에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });

        let html = html_date_select + html_start_time_select + html_end_time_select;
        if(del != undefined){
            html = "";
        }
        document.querySelector(this.target.middle).innerHTML = html;
    }

    render_bottom (del){
        //메모 입력 행을 생성한다. 메모입력 행을 클릭했을때 실행할 함수를 전달한다.
        let html_memo_select = CComponent.create_input_row ('select_memo', this.store.memo == "" ? '메모' : this.store.memo, '/static/common/icon/icon_note.png', HIDE, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        });
        let html = html_memo_select;
        if(del != undefined){
            html = "";
        }
        document.querySelector(this.target.bottom).innerHTML = html;
    }

    dom_row_lecture_name (){
        let lecture_name;
        if(this.store.schedule_type == 0){
            lecture_name =`OFF 일정 ${this.store.memo != "" ? '('+this.store.memo+')' : ''}`;
        }else if(this.store.schedule_type == 1){
            lecture_name = this.store.member_name;
        }else if(this.store.schedule_type == 2){
            lecture_name = this.store.lecture_name;
        }

        let html = `
                    <div class="info_popup_title_wrap" style="height:50px;background-color:${this.store.lecture_color}">
                        <div class="info_popup_title" style="display:inline-block;line-height:50px;vertical-align:middle;font-size:18px;font-weight:bold;margin-left:16px;">
                            ${lecture_name}
                        </div>
                    </div>
                    `;
        return html;
    }

    dom_row_member_select (){
        let member_text = this.store.member_ids.length == 0 ? '회원*' : this.store.member_ids.length+ '/' + this.store.lecture_max_num +' 명';
        let html_member_select = CComponent.create_row('select_member', member_text, '/static/common/icon/icon_member.png', SHOW, ()=>{
            //회원 선택 팝업 열기
            layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, {'data':null}, ()=>{
                var member_select = new MemberSelector('#wrapper_box_member_select', this, this.store.lecture_max_num, {'lecture_id':this.store.lecture_id});
            });
        });
        let html = html_member_select;

        return html;
    }

    dom_row_member_list (){
        let length = this.store.member_ids.length;
        let html_to_join = [];
        
        for(let i=0; i<length; i++){
            let member_id = this.store.member_ids[i];
            let member_name = this.store.member_names[i];
            let icon_button_style = null;
            html_to_join.push(
                CComponent.icon_button(member_id, member_name, null, icon_button_style, ()=>{
                    layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_MEMBER_VIEW, 100, POPUP_FROM_RIGHT, {'member_id':member_id});
                })
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    request_data (callback){
        Plan_func.read_plan(this.schedule_id, (data)=>{
            this.set_initial_data(data); // 초기값을 미리 셋팅한다.
            callback(data);
        });
    }

    set_initial_data (data){
        this.store.lecture_id = data.schedule_info[0].lecture_id;
        this.store.lecture_name = data.schedule_info[0].lecture_name;
        this.store.member_name = data.schedule_info[0].member_name;
        this.store.start_time = data.schedule_info[0].start_time;
        this.store.start_time_text = TimeRobot.to_text(data.schedule_info[0].start_time.split(':')[0], data.schedule_info[0].start_time.split(':')[1]);
        this.store.end_time = data.schedule_info[0].end_time;
        this.store.end_time_text = TimeRobot.to_text(data.schedule_info[0].end_time.split(':')[0], data.schedule_info[0].end_time.split(':')[1]);
        this.store.lecture_color = data.schedule_info[0].lecture_ing_color_cd;
        this.store.lecture_max_num = data.schedule_info[0].lecture_max_member_num;
        this.store.lecture_current_num = data.schedule_info[0].lecture_current_member_num;
        this.store.lecture_state_cd = data.schedule_info[0].state_cd;
        this.store.memo = data.schedule_info[0].note;
        this.store.schedule_type = data.schedule_info[0].schedule_type;
    }

    set_additional_button_event (){
        document.querySelector('#popup_plan_view_additional_act').addEventListener('click', ()=>{
            let user_option = {
                cancel:{text:"일정 취소", callback:()=>{ show_user_confirm(`정말 ${this.store.lecture_name} 일정을 취소하시겠습니까?`, ()=>{
                                                            Plan_func.delete({"schedule_id":this.schedule_id});calendar.init();layer_popup.all_close_layer_popup();
                                                         });
                                                      }
                            },
                check:{text:"출석 체크", callback:()=>{alert('출석 체크');}
                            },
            };
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(45+50*Object.keys(user_option).length)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                var option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });
    }

    send_data (){
        let data = {"lecture_id":this.store.lecture_id,
                    "start_dt":this.store.date.replace(/\./gi,"-") + ' ' + this.store.start_time,
                    "end_dt":this.store.date.replace(/\./gi,"-") + ' ' + this.store.end_time,
                    "note":this.store.memo, "duplication_enable_flag": 1,
                    "en_dis_type":this.store.schedule_type == "off" ? 0 : 1, "lecture_member_ids":this.store.member_ids
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

    static_component (){
        return {initial_page : `
                        <section id="wrapper_box_plan_view_toolbox">
                            <!-- 수업명 표기 -->
                        </section>

                        <section id="wrapper_box_plan_view_upper" class="obj_box_full">
                            <!-- 회원명 -->
                        </section>

                        <section id="wrapper_box_plan_view_middle" class="obj_box_full">
                            <!-- 날짜, 시작시간, 종료시간, 반복일정 -->
                        </section>

                        <section id="wrapper_box_plan_view_bottom" class="obj_box_full">
                            <!-- 메모 -->
                        </section>

                        <section id="wrapper_box_plan_view_toolbox_bottom" class="obj_box_full">
                            <!-- 수정, 등록 일자 표기 -->
                        </section>`
        };
    }

}