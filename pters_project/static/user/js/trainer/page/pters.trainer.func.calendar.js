// 달력 관련

class Calendar {
    constructor (targetHTML, instance){
        this.page_name = "calendar";
        this.window_height = window.innerHeight;
        this.pages_height = this.window_height - 102-45;
        this.page_init = false;

        this.targetHTML = targetHTML;
        this.subtargetHTML = 'calendar_wrap';
        this.instance = instance;
        
        this.date_start = 1; //시작을 월요일부터 옵션을 위한 코드
        this.cal_type = "week";
        this.current_page_num = 1;

        this.week_zoomed = {
            activate : false,
            target_row : null,
            vertical:{
                activate : false
            }
        };

        let d = new Date();
        this.today = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;

        this.current_year = d.getFullYear();
        this.current_month = d.getMonth()+1;
        this.current_date = d.getDate();
        this.first_day_of_the_date = new Date(this.current_year, this.current_month-1, 1).getDay();
        if(this.date_start == 1){
            if(this.first_day_of_the_date == 0){
                this.first_day_of_the_date = 6;
            }else{
                this.first_day_of_the_date--;
            }
        }
        this.current_week = Math.ceil( (this.current_date +  this.first_day_of_the_date)/7 ) - 1;
        
        this.current_hour = d.getHours() > 12 ? d.getHours() - 12 : d.getHours();
        this.current_minute = Math.floor(d.getMinutes()/5)*5;
        
        this.work_time_info = {full:null, calc:null};
        this.worktime = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        this.dayoff = [];

        this.user_data = {
            user_selected_date: {year:this.current_year, month:this.current_month, date:this.current_date},
            user_selected_time: {hour:this.current_hour, minute:this.current_minute, hour2:this.current_hour, minute2:this.current_minute},
            user_selected_plan : {schedule_id:"", date:{year:null, month:null, date:null}}
        };

        let interval = setInterval(()=>{
            // let realtime = new Date();
            // let realtime_today = `${realtime.getFullYear()}-${realtime.getMonth()+1}-${realtime.getDate()}`;
            // if(this.today != realtime_today){
            //     window.location.reload();
            // }
            if(this.page_name == current_page){
                this.relocate_current_time_indicator();
            }else{
                clearInterval(interval);
            }
            
        }, 60000);//60000

        this.long_touch = OFF;
        this.long_touch_schedule_id;
        this.touch_timer = 0;
        this.touch_sense;
        this.long_touch_target = null;

        this.latest_received_data;
    }

    get selected_plan(){
        return this.user_data.user_selected_plan;
    }

    //다른페이지에서 접근했을때 처음에 달력을 위해 필요한 최상위 컨테이너를 포함하여 초기화한다.
    init_new (cal_type){
        // if(current_page != this.page_name){
        //     return false;
        // }

        this.today = `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`;

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;
        this.mode_to_plan_change(OFF);
        Setting_reserve_func.read((data)=>{
            this.work_time_info.full = data;
            this.dayoff_hide = data.setting_holiday_hide;
            let date_start_array = {"SUN":0, "MON":1};
            this.date_start = date_start_array[data.setting_week_start_date];
            let work_time = this.calc_worktime_display(data);
            this.work_time_info.calc = work_time;
            this.worktime = [];
            for(let i=work_time.start_hour; i<work_time.end_hour; i++){
                this.worktime.push(i);
            }
            this.dayoff = work_time.dayoff;
            this.init(cal_type);
        });
    }

    //달력에 필요한 최상위 컨테이너가 이미 있는 상태에서 컨테이너 내용(달력)을 재초기화 할때 사용한다.
    init(cal_type){
        // if(current_page != this.page_name){
        //     return false;
        // }
        if(cal_type == undefined){
            cal_type = this.cal_type;
        }
        this.cal_type = cal_type;
        switch(cal_type){
        case "month":
            this.render_upper_box(cal_type);
            this.render_month_cal( this.current_page_num, this.current_year, this.current_month);
            this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 36, (jsondata, date) => {
                this.latest_received_data = jsondata;
                if(this.cal_type == cal_type){
                    if(date == `${this.current_year}-${this.current_month}-01`){
                        this.render_month_cal( this.current_page_num, this.current_year, this.current_month, jsondata);
                    }
                }
            });
            this.toggle_touch_move('on', '#calendar_wrap');
            break;

        case "week":
            this.render_upper_box(cal_type);
            // this.render_week_cal(this.current_page_num, this.current_year, this.current_month, this.current_week);
            
            //일일 일정표에서 일정을 등록했을때, 다시 렌더링시에도 일일 일정으로 표시해주도록
            if(this.week_zoomed.target_row != null && this.week_zoomed.activate == true){
                this.week_zoomed.activate = false;
                this.zoom_week_cal();
            }

            if(this.week_zoomed.vertical.activate == true){
                this.week_zoomed.vertical.activate = false;
                this.zoom_week_cal_vertical();
            }

            this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 36, (jsondata, date) => {
                this.latest_received_data = jsondata;
                if(this.cal_type == cal_type){
                    if(date == `${this.current_year}-${this.current_month}-01`){
                        this.render_week_cal( this.current_page_num, this.current_year, this.current_month, this.current_week, jsondata);
                        // this.week_schedule_draw(this.current_year, this.current_month, this.current_week, jsondata);
                        //일일 일정표에서 일정을 등록했을때, 다시 렌더링시에도 일일 일정으로 표시해주도록
                        if(this.week_zoomed.target_row != null && this.week_zoomed.activate == true){
                            this.week_zoomed.activate = false;
                            this.zoom_week_cal();
                        }

                        if(this.week_zoomed.vertical.activate == true){
                            this.week_zoomed.vertical.activate = false;
                            this.zoom_week_cal_vertical();
                        }
                    }
                }
            });
            
            this.toggle_touch_move('on', '#calendar_wrap');
            break;
        }
    }

    calc_worktime_display(data){
        let datas = [data.setting_trainer_work_sun_time_avail, data.setting_trainer_work_mon_time_avail, data.setting_trainer_work_tue_time_avail,
            data.setting_trainer_work_wed_time_avail, data.setting_trainer_work_ths_time_avail, data.setting_trainer_work_fri_time_avail,
            data.setting_trainer_work_sat_time_avail];
        if(this.date_start == 1){
            datas = [data.setting_trainer_work_mon_time_avail, data.setting_trainer_work_tue_time_avail, data.setting_trainer_work_wed_time_avail, 
            data.setting_trainer_work_ths_time_avail, data.setting_trainer_work_fri_time_avail, data.setting_trainer_work_sat_time_avail, 
            data.setting_trainer_work_sun_time_avail];
        }
        
        let length = datas.length;
        let start_time_temp;
        let end_time_temp;
        let dayoff_temp = [];
        for(let i=0; i<length; i++){
            let start_time = datas[i].split('-')[0];
            let end_time = datas[i].split('-')[1];
            //시작시간과 종료시간이 같으면 휴무일
            if(start_time == end_time){
                dayoff_temp.push(i);
                continue;
            }

            if(start_time_temp == undefined){
                start_time_temp = start_time;
            }
            if(end_time_temp == undefined){
                end_time_temp = end_time;
            }

            let start_time_compare = TimeRobot.compare(start_time, start_time_temp); // start_time_temp는 datas 값중 가장 작은(시간)값
            let end_time_compare = TimeRobot.compare(end_time, end_time_temp); // end_time_temp는 datas 값중 가장 큰(시간)값

            if(start_time_compare == false){
                start_time_temp = start_time;
            }
            if(end_time_compare == true){
                end_time_temp = end_time;
            }
        }
        let start_time_hour = Number(start_time_temp.split(':')[0]);
        let start_time_minute = Number(start_time_temp.split(':')[1]);
        let end_time_hour = Number(end_time_temp.split(':')[0]);
        let end_time_minute = Number(end_time_temp.split(':')[1]);
        if(end_time_minute > 0){
            end_time_hour++;
        }
        
        let start_time = start_time_hour + ':00';
        let end_time = end_time_hour + ':00';
        
        // let result = {complete:`${start_time_temp}:${end_time_temp}`, start:start_time_temp, end:end_time_temp, start_hour:Number(start_time_temp.split(':')[0]), end_hour:Number(end_time_temp.split(':')[0]), dayoff:dayoff_temp};
        let result = {
                        complete:`${start_time}:${end_time}`, 
                        start:start_time, 
                        end:end_time,
                        start_hour:start_time_hour, 
                        end_hour:end_time_hour,
                        dayoff:dayoff_temp
                    };

        return result;
    }

    get_current_month (){
        return {
            "year": this.current_year, "month": this.current_month
        };
    }

    get_prev_month (){
        let prev_month = this.current_month-1 < 1 ? 12 : this.current_month - 1;
        let year = this.current_month-1 < 1 ? this.current_year-1 : this.current_year;
        let week = this.current_week > this.get_week_number(year, prev_month) ? this.get_week_number(year, prev_month) : this.current_week;
        
        return {
            "year":year, "month": prev_month, "week":week
        };
    }

    get_next_month (){
        let next_month = this.current_month+1 > 12 ? 1 : this.current_month + 1;
        let year = this.current_month+1 > 12 ? this.current_year+1 : this.current_year;
        let week = this.current_week > this.get_week_number(year, next_month) ? this.get_week_number(year, next_month) : this.current_week;

        return {
            "year":year, "month": next_month, "week": week
        };
    }

    get_week_number (year, month){
        let first_day = new Date(year, month-1, 1).getDay();
        if(this.date_start == 1){
            if(first_day == 0){
                first_day = 6;
            }else{
                first_day--;
            }
        }
        let last_date = new Date(year, month, 0).getDate();
        let week_num_this_month = Math.ceil( (first_day + last_date)/7  ) - 1;
        
        return week_num_this_month;
    }

    get_current_week (){
        return {
            "year":this.current_year, "month":this.current_month, "week":this.current_week
        };
    }

    get_prev_week (){
        let year = this.current_year;
        let month = this.current_month;
        let week = this.current_week;
        let first_day = new Date(year, month-1, 1).getDay();
        // let last_date = new Date(year, month, 0).getDate();

        //시작을 월요일부터 옵션을 위한 코드
        if(this.date_start == 1){
            if(first_day == 0){
                first_day = 6;
            }else{
                first_day--;
            }
        }
        //시작을 월요일부터 옵션을 위한 코드

        let prev_month = month - 1 < 1 ? 12 : month-1;
        let prev_year = prev_month == 12 ?year - 1 : year;

        week = week - 1;
        if(week == -1 && first_day == 0){
            week = this.get_week_number(prev_year, prev_month);
            month = month - 1 < 1 ? 12  : month - 1;
            year = month == 12 ? year - 1 : year;   

        }else if(week == -1 && first_day !=0){
            week = this.get_week_number(prev_year, prev_month) - 1;
            month = month - 1 < 1 ? 12  : month - 1;
            year = month == 12 ? year - 1 : year;      

        }

        let result = {"year":year, "month":month, "week":week};
        return result;
    }

    get_next_week (){
        let year = this.current_year;
        let month = this.current_month;
        let week = this.current_week;
        let first_day_of_next_month = new Date(year, month, 1).getDay();

        //시작을 월요일부터 옵션을 위한 코드
        if(this.date_start == 1){
            if(first_day_of_next_month == 0){
                first_day_of_next_month = 6;
            }else{
                first_day_of_next_month--;
            }
            // if(last_day_of_next_month != 5){
            //     last_day_of_next_month--;
            // }
        }
        //시작을 월요일부터 옵션을 위한 코드

        let week_num_this_month = this.get_week_number(year, month);

        week = week + 1;
        if(week  == week_num_this_month+1 && first_day_of_next_month != 0 ){
            week = 1;
            month = month + 1 > 12 ? 1  : month + 1;
            year = month ==  1 ? year + 1 : year;

        }else if(week == week_num_this_month+1){
            week = 0;
            month = month + 1 > 12 ? 1  : month + 1;
            year = month ==  1 ? year + 1 : year;
        }

        
        return {
            "year":year, "month":month, "week":week
        };
    }

    go_month (year, month){
        if(year == undefined && month == undefined){
            year = new Date().getFullYear();
            month = new Date().getMonth()+1;
        }
        this.current_year = year;
        this.current_month = month;
        this.render_upper_box("month");
        this.render_month_cal( this.current_page_num, this.current_year, this.current_month);
        this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 36, (jsondata, date) => {
            this.latest_received_data = jsondata;
            if(date == `${this.current_year}-${this.current_month}-01`){
                this.render_month_cal(this.current_page_num, this.current_year, this.current_month, jsondata);
            }
        });

    }

    go_week (year, month, date){
        this.cal_type = "week";
        let week;
        if(year == undefined && month == undefined && date == undefined){
            year = new Date().getFullYear();
            month = new Date().getMonth()+1;
            date = new Date().getDate();
        }

        this.current_year = year;
        this.current_month = month;
        this.current_date = date;
        let first_day_of_the_date = new Date(year, month-1, 1).getDay();
        if(this.date_start == 1){
            if(first_day_of_the_date == 0){
                first_day_of_the_date = 6;
            }else{
                first_day_of_the_date--;
            }
        }
        this.current_week = Math.ceil( (date + first_day_of_the_date )/7 ) - 1;

        this.render_upper_box("week");
        this.render_week_cal(this.current_page_num, this.current_year, this.current_month, this.current_week);
        
        //일일 일정표에서 일정을 등록했을때, 다시 렌더링시에도 일일 일정으로 표시해주도록
        if(this.week_zoomed.target_row != null && this.week_zoomed.activate == true){
            this.week_zoomed.activate = false;
            // this.week_zoomed.target_row = new Date(year, month-1, date).getDay()+1;
            this.zoom_week_cal();
        }

        if(this.week_zoomed.vertical.activate == true){
            this.week_zoomed.vertical.activate = false;
            this.zoom_week_cal_vertical();
        }

        this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 36, (jsondata, date) => {
            this.latest_received_data = jsondata;
            if(date == `${this.current_year}-${this.current_month}-01`){
                this.render_week_cal( this.current_page_num, this.current_year, this.current_month, this.current_week, jsondata);

                //일일 일정표에서 일정을 등록했을때, 다시 렌더링시에도 일일 일정으로 표시해주도록
                if(this.week_zoomed.target_row != null && this.week_zoomed.activate == true){
                    this.week_zoomed.activate = false;
                    this.zoom_week_cal();
                }

                if(this.week_zoomed.vertical.activate == true){
                    this.week_zoomed.vertical.activate = false;
                    this.zoom_week_cal_vertical();
                }
                
            }
        });
    }

    move_month (direction){
        switch(direction){
        case "next":
            let next = this.get_next_month();
            this.current_year = next.year;
            this.current_month = next.month;
            this.current_week = next.week;

            /*스와이프 애니메이션*/
            if(os == IOS){
                this.current_page_num = this.current_page_num + 1;
                this.append_child(this.subtargetHTML, 'div', this.current_page_num);
            }
            /*스와이프 애니메이션*/

            this.render_upper_box("month");
            this.render_month_cal( this.current_page_num, this.current_year, this.current_month);
            this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 36, (jsondata, date) => {
                this.latest_received_data = jsondata;
                if(date == `${this.current_year}-${this.current_month}-01`){
                    this.render_month_cal(this.current_page_num, this.current_year, this.current_month, jsondata);
                }
            });
            break;

        case "prev":
            let prev = this.get_prev_month();
            this.current_year = prev.year;
            this.current_month = prev.month;
            this.current_week = prev.week;

            /*스와이프 애니메이션*/
            if(os == IOS){
                this.current_page_num = this.current_page_num - 1;
                this.prepend_child(this.subtargetHTML, 'div', this.current_page_num);
            }
            /*스와이프 애니메이션*/

            this.render_upper_box("month");
            this.render_month_cal(this.current_page_num, this.current_year, this.current_month);
            this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 36, (jsondata, date) => {
                this.latest_received_data = jsondata;
                if(date == `${this.current_year}-${this.current_month}-01`){
                    this.render_month_cal(this.current_page_num, this.current_year, this.current_month, jsondata);
                }
            });
            break;
        }
    }

    move_week (direction){
        switch(direction){
        case "next":
            let next = this.get_next_week();
            this.current_year = next.year;
            this.current_month = next.month;
            this.current_week = next.week;
            

            /*스와이프 애니메이션*/
            if(os == IOS){
                this.current_page_num = this.current_page_num + 1;
                this.append_child(this.subtargetHTML, 'div', this.current_page_num);
            }
            /*스와이프 애니메이션*/

            this.render_upper_box("week");
            this.render_week_cal(this.current_page_num, this.current_year, this.current_month, this.current_week);
            if(this.week_zoomed.vertical.activate == true){
                this.week_zoomed.vertical.activate = false;
                this.zoom_week_cal_vertical();
            }
            this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 36, (jsondata, date) => {
                this.latest_received_data = jsondata;
                if(date == `${this.current_year}-${this.current_month}-01`){
                    this.render_week_cal( this.current_page_num, this.current_year, this.current_month, this.current_week, jsondata);
                    if(this.week_zoomed.vertical.activate == true){
                        this.week_zoomed.vertical.activate = false;
                        this.zoom_week_cal_vertical();
                    }
                }
            });
            break;

        case "prev":
            let prev = this.get_prev_week();
            this.current_year = prev.year;
            this.current_month = prev.month;
            this.current_week = prev.week;
            

            /*스와이프 애니메이션*/
            if(os == IOS){
                this.current_page_num = this.current_page_num - 1;
                this.prepend_child(this.subtargetHTML, 'div', this.current_page_num);
            }
            /*스와이프 애니메이션*/

            this.render_upper_box("week");
            this.render_week_cal(this.current_page_num, this.current_year, this.current_month, this.current_week);
            if(this.week_zoomed.vertical.activate == true){
                this.week_zoomed.vertical.activate = false;
                this.zoom_week_cal_vertical();
            }
            this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 36, (jsondata, date) => {
                this.latest_received_data = jsondata;
                if(date == `${this.current_year}-${this.current_month}-01`){
                    this.render_week_cal( this.current_page_num, this.current_year, this.current_month, this.current_week, jsondata);
                    if(this.week_zoomed.vertical.activate == true){
                        this.week_zoomed.vertical.activate = false;
                        this.zoom_week_cal_vertical();
                    }
                }
            });
            break;
        }
    }

    switch_cal_type (){

        let user_option = {
            month:{text:"월간 달력", callback:()=>{this.init("month");layer_popup.close_layer_popup();}},
            week:{text:"주간 달력", callback:()=>{this.init("week");layer_popup.close_layer_popup();}},
            plans:{text:"일정 리스트", callback:()=>{layer_popup.close_layer_popup();}},
            repeat:{text:"반복 일정 리스트", callback:()=>{
                layer_popup.close_layer_popup();
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PLAN_REPEAT_LIST, 100, popup_style, null, ()=>{
                    plan_repeat_list_popup = new Plan_repeat_list('.popup_plan_repeat_list');
                });
            }},
        };
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    render_upper_box (type){
        // if(current_page != this.page_name){
        //     return false;
        // }

        let component = this.static_component();
        switch(type){
        case "month":
            document.getElementById('cal_display_panel').innerHTML = component.month_cal_upper_box;
            break;
        case "week":
            document.getElementById('cal_display_panel').innerHTML = component.week_cal_upper_box;
            break;
        }
    }
    
    render_month_cal (page, year, month, schedule_data){ //월간 달력 렌더링 (연, 월)
        // if(current_page != this.page_name){
        //     return false;
        // }

        if(schedule_data == undefined){
            schedule_data = false;
        }
        let weeks_div = [`<div class="cal_week_line_dates" style="margin-top:4px; border:0;">
                            ${this.date_start == 0 
                            ?
                                '<div class="no_border obj_font_color_sunday_red">일</div><div class="no_border">월</div><div class="no_border">화</div><div class="no_border">수</div><div class="no_border">목</div><div class="no_border">금</div><div class="no_border obj_font_color_saturday_blue">토</div>'
                            :
                                '<div class="no_border">월</div><div class="no_border">화</div><div class="no_border">수</div><div class="no_border">목</div><div class="no_border">금</div><div class="no_border obj_font_color_saturday_blue">토</div><div class="no_border obj_font_color_sunday_red">일</div>'
                            }
                          </div>
                          <div style="margin-top:4px; border-bottom:1px solid #f5f2f3;"></div>`];

        let margin = 34;
        let row_height = (this.window_height - 60 - 31 - 45 - margin)/6;

        for(let i=0; i<6; i++){
            weeks_div = [...weeks_div, this.draw_week_line(year, month, i, schedule_data, 'month', row_height)];
        }
        document.getElementById(`page${page}`).innerHTML = weeks_div.join('');
        func_set_webkit_overflow_scrolling(`#page${page}`);
    }

    render_week_cal (page, year, month, week, schedule_data){ //주간 달력 렌더링 (연, 월, 몇번째 주)
        // if(current_page != this.page_name){
        //     return false;
        // }
        let data = this.draw_week_line(year, month, week, schedule_data, "week");
        

        document.getElementById(`page${page}`).innerHTML =  data;
        func_set_webkit_overflow_scrolling(`#page${page}`);

        this.relocate_current_time_indicator();
    }

    zoom_week_cal (context){
        let clicked_number = context != undefined ? context.dataset.row : this.week_zoomed.target_row;


        if(clicked_number == undefined){
            return false;
        }

        if(this.week_zoomed.activate == false){
            for(let i=1; i<=7; i++){
                if(i==clicked_number){
                    continue;
                }
                Array.from(document.getElementsByClassName(`_week_row_${i}`)).forEach( (el) =>{
                    el.style.display = "none";
                });
            }
            
            this.week_zoomed.activate = true;
            this.week_zoomed.target_row = clicked_number;
            this.toggle_touch_move('off', '#calendar_wrap');
        }else if(this.week_zoomed.activate == true){
            for(let i=1; i<=7; i++){
                if(i==clicked_number){
                    continue;
                }
                Array.from(document.getElementsByClassName(`_week_row_${i}`)).forEach( (el) =>{
                    if(this.dayoff_hide == 1){
                        if(this.dayoff.indexOf(i-1) == -1){
                            el.style.display = "block";
                        }
                    }else{
                        el.style.display = "block";
                    }
                });
            }
            
            this.week_zoomed.activate = false;
            this.week_zoomed.target_row = clicked_number;
            this.toggle_touch_move('on', '#calendar_wrap');
        }
    }

    zoom_week_cal_vertical (){
        $('.week_indicator').remove();
        if(this.week_zoomed.vertical.activate == false){
            this.week_zoomed.vertical.activate = true;
            $('.week_rows article').css('height', '180px');
            $('#week_zoom_vertical_button').css({'background-image':'url(/static/common/icon/icon_zoom_out_black.png)'});
            $('.week_rows > .week_row').css({'background-image': 'url(/static/user/res/new/calendar_hour_long2.png?v)', 'background-size': '30px 180px'});
        }else if(this.week_zoomed.vertical.activate == true){
            this.week_zoomed.vertical.activate = false;
            $('.week_rows article').css('height', '60px');
            $('#week_zoom_vertical_button').css({'background-image':'url(/static/common/icon/icon_zoom_in_black.png)'});
            $('.week_rows > .week_row').css({'background-image': 'url(/static/user/res/new/calendar_hour_short.png?v2)', 'background-size': '30px 60px'});
        }
        this.relocate_current_time_indicator();
    }

    get_week_dates (year, month, week){
        let firstday_this_month = (new Date(Number(year), Number(month)-1, 1)).getDay(); // 3
        let lastday_this_month = (new Date(Number(year), Number(month), 0)).getDate(); // 3
        let lastday_prev_month = (new Date(Number(year), Number(month)-1, 0)).getDate();

        //시작을 월요일부터 옵션을 위한 코드
        if(this.date_start == 1){
            if(firstday_this_month == 0){
                firstday_this_month = 6;
            }else{
                firstday_this_month--;
            }
        }

        const number_of_weeks_this_month = (
            // Math.ceil(
            //     (new Date(year, Number(month)-1, 1).getDay() + new Date(year, Number(month), 0).getDate() ) / 7
            // )
            Math.ceil(
                (firstday_this_month + lastday_this_month) / 7
            )
        );
        if(week >= number_of_weeks_this_month){
            //해당 Week에 대한 정보가 없음
            return false;
        }
        
        let years_of_this_week = [];
        let months_of_this_week = [];
        let dates_of_this_week = [];
        // let color_of_this_week = [];
        let date_cache = 1;
        let month_cache;
        let finished = false;
        for(let i=0; i<=week; i++){
            let yearCellsToJoin = [];
            let monthCellsToJoin = [];
            let dateCellsToJoin = [];
            // let dateColorClass = [];
            for(let j=0; j<7; j++){
                if(i==0 && j<firstday_this_month){ //첫번째 주일때 처리
                    let _year = Number(month)-1 > 0 ? Number(year) : Number(year) - 1;
                    let _month = Number(month)-1 < 1 ? 12 : Number(month)-1;
                    let _date = lastday_prev_month-j;

                    yearCellsToJoin.unshift(_year);
                    monthCellsToJoin.unshift(_month);
                    dateCellsToJoin.unshift(_date);

                    // dateColorClass.unshift(`${_year}-${_month}-${_date}` == this.today ? 'cal_font_color_pink cal_fw_bd' : 'cal_font_color_grey');
                }else if(date_cache > lastday_this_month || month_cache == month + 1){ // 마지막 날짜가 끝난 이후 처리
                    if(date_cache == lastday_this_month+1){
                        date_cache = 1;
                        month_cache = month + 1;
                        finished = true;
                    }
                    let _year = Number(month)+1 > 12 ? Number(year)+1 : year;
                    let _month = Number(month)+1 > 12? 1 : Number(month)+1;
                    let _date = date_cache;

                    yearCellsToJoin.push(_year);
                    monthCellsToJoin.push(_month);
                    dateCellsToJoin.push(_date);
                    // dateColorClass.push(`${_year}-${_month}-${_date}` == this.today ? 'cal_font_color_pink cal_fw_bd' : 'cal_font_color_grey');
                    date_cache++;
                }else{
                    let _year = Number(year);
                    let _month = Number(month);
                    let _date = date_cache;


                    yearCellsToJoin.push(_year);
                    monthCellsToJoin.push(_month);
                    dateCellsToJoin.push(_date);
                    // dateColorClass.push(`${_year}-${_month}-${_date}` == this.today ? 'cal_font_color_pink cal_fw_bd' : 'cal_font_color_black');
                    date_cache++;
                }
            }
            years_of_this_week.push(yearCellsToJoin);
            months_of_this_week.push(monthCellsToJoin);
            dates_of_this_week.push(dateCellsToJoin);
            // color_of_this_week.push(dateColorClass);
        }
        
        let [year1, year2, year3, year4, year5, year6, year7] = years_of_this_week[week];
        let [month1, month2, month3, month4, month5, month6, month7] = months_of_this_week[week];
        let [date1, date2, date3, date4, date5, date6, date7] = dates_of_this_week[week];
        // let [color1, color2, color3, color4, color5, color6, color7] = color_of_this_week[week];
       
        
        return(
            {
                "year" :  years_of_this_week[week],
                "month" : months_of_this_week[week],
                "date" : dates_of_this_week[week],
                // "color" : color_of_this_week[week],
                "full_date" : [
                    [year1, month1, date1], [year2, month2, date2], [year3, month3, date3], [year4, month4, date4], 
                    [year5, month5, date5], [year6, month6, date6], [year7, month7, date7]
                ]
            }
        );
    }

    draw_week_line (year, month, week, schedule_data, month_or_week, row_height){ //(연,월, 몇번째 주, 날짜 클릭 콜백함수 이름)
        let week_dates_info = this.get_week_dates(year, month, week);
        let _year = week_dates_info.year;
        let _month = week_dates_info.month;
        let _date = week_dates_info.date;
        // let _color = week_dates_info.color;

        let schedule_num = [];
        if(schedule_data){
            for(let i=0; i<7; i++){
                if(week_dates_info == false){
                    continue;
                }

                let date_to_search = date_format(`${_year[i]}-${_month[i]}-${_date[i]}`)["yyyy-mm-dd"];
                if(date_to_search in schedule_data){
                    schedule_num.push(schedule_data[date_to_search].length);
                }else{
                    schedule_num.push(0);
                }
            }
        }else{
            schedule_num = [0, 0, 0, 0, 0, 0, 0];
        }

        let height_style = row_height == undefined ? "" : `style='height:${row_height}px'`;
        
        let dates_to_join = [];

        if(week_dates_info == false){
            dates_to_join.push(
                `<div class="cal_week_line">
                    <div style="background-image:url('/static/user/res/PTERS_logo_pure.png');background-position:center;background-repeat:no-repeat;background-size:100px;height:30px;"></div>
                </div>`
            );
        }else{
            for(let i=0; i<7; i++){
                
                let schedule_number_display = month_or_week == "week" ? "no_display" : "calendar_schedule_display_month";
                let has_schedule = schedule_num[i]!=0 ? "has_schedule" : "";
                let schedule_date = schedule_num[i]!=0?schedule_num[i]+' 개':"";
                
                let sunday = "";
                let saturday = "";
                let border_style = "";
                let today_marking = "";
                let today_text_style = "";
                border_style = month_or_week == "week" ? "no_border" : "";

                
                if(this.date_start == 0){
                    if(i == 0){
                        border_style = "no_border";
                        sunday = "obj_font_color_sunday_red";
                    }
                    if(i == 6){
                        saturday = "obj_font_color_saturday_blue";
                    }
                }else if(this.date_start == 1){ //시작을 월요일부터 옵션을 위한 코드
                    if(i == 0){
                        border_style = "no_border";
                    }
                    if(i == 5){
                        sunday = "obj_font_color_saturday_blue";
                    }
                    if(i == 6){
                        saturday = "obj_font_color_sunday_red";
                    }
                }
                
                
                if(`${_year[i]}-${_month[i]}-${_date[i]}` == this.today){
                    today_marking = `<div class="today_marking" style="${month_or_week == "week" ? '' : 'top:8%; width:20px; height:20px; border-radius:12px;'}"></div>`;
                    today_text_style = 'color:#fe4e65;font-weight:bold;';
                }
                
                let onclick = month_or_week == "week" ? `${this.instance}.zoom_week_cal(this, ${_year[i]}, ${_month[i]}, ${_date[i]})` : `;calendar.week_zoomed.activate = true;calendar.week_zoomed.target_row = this.dataset.row;${this.instance}.go_week(${_year[i]}, ${_month[i]}, ${_date[i]});`;

                dates_to_join.push(
                    `
                    <div ${height_style} class="${saturday} ${sunday} ${border_style} _week_row_${i+1}" data-row="${i+1}" ${this.dayoff.indexOf(i) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""} onclick="event.stopPropagation();${onclick}">
                        <span style="${today_text_style}">${_date[i]}</span>
                        <div class="${schedule_number_display} ${has_schedule}">${schedule_date}</div>
                        ${today_marking}
                    </div>
                    `
                );
            }
        }

        let result_html = dates_to_join.join("");
        // let week_date_name_data = this.static_component().week_cal_upper_box_date_tool;
        let day_names = `<div class="_week_row_1 obj_font_color_sunday_red" ${this.dayoff.indexOf(0) != -1 && this.dayoff_hide == 1? "style=display:none": ""}>일</div>
                        <div class="_week_row_2" ${this.dayoff.indexOf(1) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>월</div>
                        <div class="_week_row_3" ${this.dayoff.indexOf(2) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>화</div>
                        <div class="_week_row_4" ${this.dayoff.indexOf(3) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>수</div>
                        <div class="_week_row_5" ${this.dayoff.indexOf(4) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>목</div>
                        <div class="_week_row_6" ${this.dayoff.indexOf(5) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>금</div>
                        <div class="_week_row_7 obj_font_color_saturday_blue" ${this.dayoff.indexOf(6) != -1 && this.dayoff_hide == 1? "style=display:none": ""}>토</div>`;
        if(this.date_start == 1){
            day_names = `<div class="_week_row_1" ${this.dayoff.indexOf(0) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>월</div>
                        <div class="_week_row_2" ${this.dayoff.indexOf(1) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>화</div>
                        <div class="_week_row_3" ${this.dayoff.indexOf(2) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>수</div>
                        <div class="_week_row_4" ${this.dayoff.indexOf(3) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>목</div>
                        <div class="_week_row_5" ${this.dayoff.indexOf(4) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>금</div>
                        <div class="_week_row_6 obj_font_color_saturday_blue" ${this.dayoff.indexOf(5) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>토</div>
                        <div class="_week_row_7 obj_font_color_sunday_red" ${this.dayoff.indexOf(6) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>일</div>`;
        }
        let week_date_name_data = `<div class="cal_week_line_dates" style="border-bottom:0;font-size:11px;">
                                        <div class="week_cal_time_text"></div>
                                        ${day_names}
                                    </div>`;

        return(
            week_dates_info == false 
                ? 
                result_html
                :
                `<div class="${month_or_week == "week" ? "week_upper_float_tool" :""}" style="${month_or_week == "month" ? 'border-bottom:1px solid #f5f2f3':''}">
                    ${month_or_week == "week" ? `<div id="week_zoom_vertical_button" onclick="${this.instance}.zoom_week_cal_vertical()"></div>` : ""}
                    ${month_or_week == "week" ? week_date_name_data : ""}
                    <div class="cal_week_line" style="${month_or_week == "week" ? `height:20px;line-height:20px;font-size:15px;font-weight:500;margin-top:8px;` : ""}">
                        ${month_or_week == "week" ? `<div class="week_cal_time_text"></div>` : ""}
                        ${result_html}
                    </div>
                </div>
                ${month_or_week == "week" ? this.week_schedule_draw(year, month, week, schedule_data): ""}`
        );
    }

    week_schedule_draw (year, month, week, schedule_data){
        let week_dates_info = this.get_week_dates(year, month, week);
        let _year = week_dates_info.year;
        let _month = week_dates_info.month;
        let _date = week_dates_info.date;
        let _color = week_dates_info.color;

        let work_start = this.worktime[0];
        let work_end = this.worktime[this.worktime.length - 1];

        let schedules = [];
        if(schedule_data){
            for(let i=0; i<7; i++){
                if(week_dates_info == false){
                    continue;
                }
                let date_to_search = date_format(`${_year[i]}-${_month[i]}-${_date[i]}`)["yyyy-mm-dd"];
                if(date_to_search in schedule_data){
                    schedule_data[date_to_search] = duplicated_plans(schedule_data[date_to_search]); // daily schedule for duplicated plans;
                    schedules.push(
                        schedule_data[date_to_search].map( (plan) => {
                            // 0 : off, 1: 1:1, 2: group
                            let plan_name, plan_status_color, plan_font_style;
                            if(plan.schedule_type == 0){
                                plan_status_color = '#d2d1cf';
                                plan_name = plan.note != "" ? plan.note : "OFF" ;
                                plan_font_style = '';
                            }else if(plan.schedule_type == 1){
                                plan_status_color = plan.lecture_ing_color_cd;
                                plan_name = plan.member_name;
                                plan_font_style = `color:${plan.lecture_ing_font_color_cd};`;
                            }else if(plan.schedule_type == 2){
                                plan_status_color = plan.lecture_ing_color_cd;
                                plan_name = plan.lecture_name;
                                plan_font_style = `color:${plan.lecture_ing_font_color_cd};`;
                            }

                            if(plan.state_cd != "NP"){
                                plan_status_color = '#d2d1cf';
                                plan_font_style = 'color:#282828;';
                                plan_font_style+='text-decoration:line-through;text-decoration-color:#00000054;';
                            }

                            let plan_start_split = plan.start_time.split(':');
                            let plan_end_split = plan.end_time.split(':');
                            let start_hour = plan_start_split[0];
                            let start_min = plan_start_split[1];
                            let end_hour = plan_end_split[0];
                            let end_min = plan_end_split[1];

                            let plan_start = {full:`${start_hour < work_start ? work_start : start_hour}:${start_min}`, hour:`${start_hour < work_start ? work_start : start_hour}`, minute:`${start_hour < work_start ? 0 : start_min}`};
                            let plan_end = {full:`${end_hour > work_end ? work_end+1 : end_hour }:${end_min}`, hour:`${end_hour > work_end ? work_end+1 : end_hour }`, minute:end_min};

                            let diff = TimeRobot.diff(plan_start.full, plan_end.full);

                            let cell_index = plan.duplicated_index;
                            let cell_divide = plan.duplicated_cell;

                            let display = "";
                            // if( (start_hour <= work_start && end_hour <= work_start) || start_hour >= work_end + 1){
                            if( (TimeRobot.compare(work_start+':00', start_hour+':'+start_min) == true && TimeRobot.compare(work_start+':00', end_hour+':'+end_min) == true) || start_hour >= work_end + 1){
                                display = "none";
                            }
                            
                            let onclick = `${this.instance}.open_popup_plan_view(event, ${plan.schedule_id}, ${_year[i]},${_month[i]},${_date[i]})`;

                            //일정 표기 관련 계산
                            let height = 100*(diff.hour*60+60*diff.min/60)/(this.worktime.length*60);
                            let top = 100*( (plan_start.hour-work_start)*60 + 60*plan_start.minute/60 )/(this.worktime.length*60);
                            
                            let styles = `width:${100/cell_divide}%;height:${height}%;top:${top}%;left:${cell_index*100/cell_divide}%;background-color:${plan_status_color};${plan_font_style};display:${display}`;
                            let long_touch_active = this.long_touch_schedule_id == plan.schedule_id ? "long_touch_active" : "";
                            let go_behind =  "";
                            if(this.long_touch == ON && this.long_touch_schedule_id != plan.schedule_id){
                                go_behind = "go_behind";
                            }

                            return `<div data-scheduleid="${plan.schedule_id}" onclick="event.stopPropagation();${onclick}" class="calendar_schedule_display_week ${long_touch_active} ${go_behind}" 
                                        style="${styles}" ontouchstart="${this.instance}.longtouchstart(event, ()=>{})" ontouchend="${this.instance}.longtouchend(event)">
                                        ${plan_name}
                                    </div>`;
                        })
                    );
                }else{
                    schedules.push([]);
                }
            }
        }else{
            schedules = [];
        }

        let work_time_dom = this.dom_disabled_work_time();

        let week_html_template = `
                                <div class="week_rows">
                                    <div class="week_cal_time_text" onclick="${this.instance}.zoom_week_cal_vertical()">
                                        <div id="current_time_indicator" style="width:1024px;"><div></div></div>
                                        ${ (this.worktime.map( (t) => { return `<article><span>${TimeRobot.to_text(t, 0, 'short')}</span></article>`; } )).join('') }
                                    </div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[0]},${_month[0]},${_date[0]})" class="_week_row_1 week_row" ${this.dayoff.indexOf(0) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>
                                        ${work_time_dom[0] == undefined ? "" : work_time_dom[0]}
                                        ${schedules.length > 0 ?  schedules[0].join('') : ""}
                                    </div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[1]},${_month[1]},${_date[1]})" class="_week_row_2 week_row" ${this.dayoff.indexOf(1) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>
                                        ${work_time_dom[1] == undefined ? "" : work_time_dom[1]}
                                        ${schedules.length > 0 ?  schedules[1].join('') : ""}
                                    </div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[2]},${_month[2]},${_date[2]})" class="_week_row_3 week_row" ${this.dayoff.indexOf(2) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>
                                        ${work_time_dom[2] == undefined ? "" : work_time_dom[2]}
                                        ${schedules.length > 0 ?  schedules[2].join('') : ""}
                                    </div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[3]},${_month[3]},${_date[3]})" class="_week_row_4 week_row" ${this.dayoff.indexOf(3) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>
                                        ${work_time_dom[3] == undefined ? "" : work_time_dom[3]}
                                        ${schedules.length > 0 ?  schedules[3].join('') : ""}
                                    </div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[4]},${_month[4]},${_date[4]})" class="_week_row_5 week_row" ${this.dayoff.indexOf(4) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>
                                        ${work_time_dom[4] == undefined ? "" : work_time_dom[4]}
                                        ${schedules.length > 0 ?  schedules[4].join('') : ""}
                                    </div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[5]},${_month[5]},${_date[5]})" class="_week_row_6 week_row" ${this.dayoff.indexOf(5) != -1  && this.dayoff_hide == 1 ? "style=display:none": ""}>
                                        ${work_time_dom[5] == undefined ? "" : work_time_dom[5]}
                                        ${schedules.length > 0 ?  schedules[5].join('') : ""}
                                    </div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[6]},${_month[6]},${_date[6]})" class="_week_row_7 week_row" ${this.dayoff.indexOf(6) != -1  && this.dayoff_hide == 1? "style=display:none": ""}>
                                        ${work_time_dom[6] == undefined ? "" : work_time_dom[6]}
                                        ${schedules.length > 0 ?  schedules[6].join('') : ""}
                                    </div>
                                </div>
                                `;
        return week_html_template;
    }

    display_user_click (event, year, month, date){
        
        $('.week_indicator').remove();

        let pos = event.offsetY;
        let pos_hour = pos/60 + this.worktime[0];
        let offset_hour = pos_hour > Math.floor(pos_hour)+0.5 ? Math.floor(pos_hour) + 0.5 : Math.floor(pos_hour);
        let offset_px = (offset_hour - this.worktime[0]) * 60;
        let indicator = document.createElement('div');
        let hour = Math.floor(offset_hour);
        let minute = 60*(offset_hour - hour);
        let period_min = 30;

        indicator.classList.add('week_indicator');
        indicator.style.top = offset_px+'px';
        indicator.setAttribute('onclick', "event.stopPropagation();$('.week_indicator').remove()");
        event.target.appendChild(indicator);

        if(this.week_zoomed.vertical.activate == true){
            hour = Math.floor(offset_hour/3);
            minute = Math.round((offset_hour/3 - (Math.floor(offset_hour/3)))*60);
            period_min = 10;
        }
        
        

        //현재 클릭한 곳의 연월일, 시분 데이터
        this.user_data.user_selected_date.year = year;
        this.user_data.user_selected_date.month = month;
        this.user_data.user_selected_date.date = date;
        this.user_data.user_selected_date.day = DAYNAME_KR[new Date(year, month, date).getDay()];
        this.user_data.user_selected_date.text = DateRobot.to_text(year, month, date);
        this.user_data.user_selected_time.hour = hour;
        this.user_data.user_selected_time.minute = minute;
        this.user_data.user_selected_time.hour2 = TimeRobot.add_time(hour, minute, 0, period_min).hour;
        this.user_data.user_selected_time.minute2 = TimeRobot.add_time(hour, minute, 0, period_min).minute;
        this.user_data.user_selected_time.text = TimeRobot.to_text(hour, minute)+' 부터';
        this.user_data.user_selected_time.text2 = TimeRobot.to_text(this.user_data.user_selected_time.hour2, this.user_data.user_selected_time.minute2)+
            ' 까지 ('+TimeRobot.diff_min(hour+':'+minute, this.user_data.user_selected_time.hour2 +':'+this.user_data.user_selected_time.minute2)+'분 진행)';

        //롱터치 일정 변경
        if(this.long_touch == ON){
            // let end_dt = `${year}-${month}-${date} ${TimeRobot.add_time(hour, minute, 0, period_min).hour}:${TimeRobot.add_time(hour, minute, 0, period_min).minute}`;
            Plan_func.read_plan(this.long_touch_schedule_id, (received)=>{
                let start_dt = `${year}-${month}-${date} ${TimeRobot.to_hhmm(hour, minute).complete}`;
                let diff = TimeRobot.diff(received.schedule_info[0].start_time, received.schedule_info[0].end_time);
                let diff_hour = TimeRobot.add_time(hour, minute, diff.hour, diff.min).hour;
                let diff_minute = TimeRobot.add_time(hour, minute, diff.hour, diff.min).minute;
                let end_dt = `${year}-${month}-${date} ${TimeRobot.to_hhmm(diff_hour, diff_minute).complete}`;
                this.simple_plan_change(received, start_dt, end_dt);
            });

            return false;
        }

        //일반 일정 등록
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PLAN_ADD, 100, popup_style, {'select_date':null}, ()=>{
            plan_add_popup = new Plan_add('.popup_plan_add', this.user_data, "plan_add_popup");
        });
    }

    dom_disabled_work_time(){
        let work_time_dom = [];
        if(this.work_time_info.full != null){
            let work_time_list = [   
                            this.work_time_info.full.setting_trainer_work_sun_time_avail, this.work_time_info.full.setting_trainer_work_mon_time_avail, this.work_time_info.full.setting_trainer_work_tue_time_avail,
                            this.work_time_info.full.setting_trainer_work_wed_time_avail, this.work_time_info.full.setting_trainer_work_ths_time_avail, this.work_time_info.full.setting_trainer_work_fri_time_avail,
                            this.work_time_info.full.setting_trainer_work_sat_time_avail
                        ];
            if(this.date_start == 1){
            work_time_list = [   
                            this.work_time_info.full.setting_trainer_work_mon_time_avail, this.work_time_info.full.setting_trainer_work_tue_time_avail,
                            this.work_time_info.full.setting_trainer_work_wed_time_avail, this.work_time_info.full.setting_trainer_work_ths_time_avail, this.work_time_info.full.setting_trainer_work_fri_time_avail,
                            this.work_time_info.full.setting_trainer_work_sat_time_avail, this.work_time_info.full.setting_trainer_work_sun_time_avail
                        ];
            }
            
            for(let i=0; i<work_time_list.length; i++){
                // 일정 표기 관련 계산
                let daily_work_start = work_time_list[i].split('-')[0]; //해당 요일의 업무 시작시간
                let daily_work_end = work_time_list[i].split('-')[1]; //해당 요일의 업무 종료시간
                let general_work_start = this.work_time_info.calc.start; //전체 요일로 계산된 업무 시간
                let general_work_end = this.work_time_info.calc.end; // 전체 요일로 계산된 업무 종료 시간

                let height_start = 100*( TimeRobot.diff(general_work_start, daily_work_start).hour*60 + TimeRobot.diff(general_work_start, daily_work_start).min)/(this.worktime.length*60);
                if(general_work_start != daily_work_start && height_start == 100){ // 업무시간 00:00 - 24:00가 TimeRobot.diff에서 24로 표기되어서 모든시간이 disabled되어버리는 현상보정
                    height_start = 0;
                }
                let top_start = 0;
                // let top_start = 100*( TimeRobot.diff(general_work_start, daily_work_end).hour*60 + TimeRobot.diff(general_work_start, daily_work_end).min)/(this.worktime.length*60);

                let height_end = 100*( TimeRobot.diff(daily_work_end, general_work_end).hour*60 + TimeRobot.diff(daily_work_end, general_work_end).min)/(this.worktime.length*60);
                let top_end = 100*( TimeRobot.diff(general_work_start, daily_work_end).hour*60 + TimeRobot.diff(general_work_start, daily_work_end).min)/(this.worktime.length*60);

                if(daily_work_start == daily_work_end){
                    height_start = 100;
                    top_start  = 0;
                    height_end = 0;
                    top_end = 0;
                }

                let styles_start = `width:100%;height:${height_start}%;top:${top_start}%;`;
                let styles_end = `width:100%;height:${height_end}%;top:${top_end}%;`;
                let html = `<div style="${styles_start}" class="work_time_disabled"></div>
                             <div style="${styles_end}" class="work_time_disabled"></div>`;
                work_time_dom.push(html);
            }
        }
        return work_time_dom;
    }

    open_popup_plan_view (event, schedule_id, year, month, date){
        if(this.long_touch == ON){
            return false;
        }
        this.user_data.user_selected_plan.schedule_id = schedule_id;
        this.user_data.user_selected_plan.date.year = year;
        this.user_data.user_selected_plan.date.month = month;
        this.user_data.user_selected_plan.date.date = date;
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PLAN_VIEW, 100, popup_style, {'schedule_id':schedule_id}, ()=>{
            plan_view_popup = new Plan_view('.popup_plan_view', this.user_data.user_selected_plan, "plan_view_popup");
        });
    }

    longtouchstart(event, callback){
        event.stopPropagation();
        if(this.long_touch == OFF){
            this.touch_sense = setInterval(()=>{this.touch_timer+= 100;
                                        if(this.touch_timer >= 900){
                                            this.mode_to_plan_change(ON, event);
                                            if(callback != undefined){
                                                callback();
                                            }
                                            clearInterval(this.touch_sense);
                                            this.touch_timer = 0;
                                        }
                                }, 100);
        }
    }

    longtouchend(event){
        event.stopPropagation();
        if(this.touch_timer < 900){
            clearInterval(this.touch_sense);
            this.touch_timer = 0;
            return false;
        }

        clearInterval(this.touch_sense);
        this.touch_timer = 0;
    }

    mode_to_plan_change(switching, event){
        switch(switching){
            case ON:
                this.long_touch = ON;
                this.long_touch_target = event;
                this.long_touch_schedule_id = event.target.dataset.scheduleid;
                $('#debug_toolbar').show().html(`<span style="margin-left:10px;line-height:60px;font-size:14px;">일정 변경을 위해 원하는 곳을 터치해주세요.</span>
                                                <button style="float:right;width:70px;height:40px;margin:10px;border-radius:4px;background-color:#ffffff;border:1px solid #cccccc;" onclick="calendar.mode_to_plan_change(OFF)">취소</button>`)
                                          .css({"height":"60px", "line-height":"60px;"});
                this.render_upper_box(this.cal_type);
                this.render_week_cal( this.current_page_num, this.current_year, this.current_month, this.current_week, this.latest_received_data);

                break;
            case OFF:
                this.long_touch = OFF;
                $('#debug_toolbar').hide();
                this.long_touch_target = null;
                this.long_touch_schedule_id = null;
                this.render_upper_box(this.cal_type);
                this.render_week_cal( this.current_page_num, this.current_year, this.current_month, this.current_week, this.latest_received_data);
                break;
        }
    }

    simple_plan_change(data, start_dt, end_dt){
        let schedule_ids = [];
        schedule_ids.push(data.schedule_info[0].schedule_id);
        for(let i=0; i<data.schedule_info[0].lecture_schedule_data.length; i++){
            schedule_ids.push(
                data.schedule_info[0].lecture_schedule_data[i].schedule_id
            );
        }

        let data_to_send = {"schedule_ids[]":schedule_ids, "start_dt":start_dt, "end_dt":end_dt};

        let url = '/schedule/update_schedule/';
        Plan_func.update(url, data_to_send, ()=>{
            this.mode_to_plan_change(OFF);
            this.init();
        });
    }


    add_plan_button (){
        //현재 클릭한 곳의 연월일, 시분 데이터
        this.user_data.user_selected_date.year = null;
        this.user_data.user_selected_date.month = null;
        this.user_data.user_selected_date.date = null;
        this.user_data.user_selected_date.text = null;
        this.user_data.user_selected_time.hour = null;
        this.user_data.user_selected_time.minute = null;
        this.user_data.user_selected_time.hour2 = null;
        this.user_data.user_selected_time.minute2 = null;
        this.user_data.user_selected_time.text = null;
        this.user_data.user_selected_time.text2 = null;
        
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PLAN_ADD, 100, popup_style, {'select_date':null}, ()=>{
            plan_add_popup = new Plan_add('.popup_plan_add', this.user_data, "plan_add_popup");
        });
    }

    relocate_current_time_indicator(){
        let indicator = document.getElementById('current_time_indicator');

        let hour = new Date().getHours() - this.worktime[0]; 
        let min = new Date().getMinutes();

        if(new Date().getHours() >= this.worktime[this.worktime.length-1] ){
            hour = 0;
            indicator.style.display = "none";
            return false;
        }

        let pos_y = hour * 60 + min;

        if(this.week_zoomed.vertical.activate == true){
            pos_y = pos_y * 3;
        }

        if(indicator != undefined){
            indicator.style.top = `${pos_y}px`;
        }
    }

    request_schedule_data (date, days, callback, async){
        let date_ = date;
        let days_ = days;
        if(date_ == undefined){date_ = `${this.current_year}-${this.current_month}-01`;}
        if(days_ == undefined){days_ = 31;}
        if(async == undefined){
            async = true;
        }

        $.ajax({
            url: '/trainer/get_trainer_schedule_all/',
            type : 'GET',
            data : {"date":date_, "day":days_},
            dataType: "JSON",
            async: async,

            beforeSend:function (){
                ajax_load_image(SHOW);
            },
            success:function (data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray);
                        return false;
                    }
                }
                callback(data, date_);
                return data;
            },

            complete:function (){
                ajax_load_image(HIDE);
            },

            error:function (){
                console.log('server error');
            }
        });
    }


    static_component (){
        return(
            {
                "month_cal_upper_box":` <div class="cal_upper_box">
                                            <div style="display:inline-block;width:200px;font-size:23px;font-weight:bold;color:#3b3d3d;" onclick="${this.instance}.switch_cal_type()">
                                                <span class="display_year">${this.current_year}년</span>
                                                <span class="display_month">${this.current_month}월</span>
                                                <div class="swap_cal"></div>
                                            </div>
                                            <div class="cal_tools_wrap">
                                                <div class="go_today" onclick="${this.instance}.go_month()"></div>
                                                <div class="add_plan" onclick="${this.instance}.add_plan_button()"></div>
                                            </div>
                                            <div class="cal_pc_tools_wrap">
                                                ${CComponent.text_button ("calendar_month_prev", "<img src='/static/common/icon/icon_arrow_l_black.png' style='width:28px;vertical-align:top'>", null, ()=>{this.move_month('prev');})}
                                                ${CComponent.text_button ("calendar_month_next", "<img src='/static/common/icon/icon_arrow_l_black.png' style='width:28px;vertical-align:top;transform:rotate(180deg)'>", null, ()=>{this.move_month('next');})}
                                            </div>
                                        </div>
                                        `
                ,
                "week_cal_upper_box":`
                                        <div class="cal_upper_box">
                                            <div style="display:inline-block;width:245px;font-size:23px;font-weight:bold;color:#3b3d3d;" onclick="${this.instance}.switch_cal_type()">
                                                <span class="display_week">${this.get_week_dates(this.current_year, this.current_month, this.current_week) ? this.get_week_dates(this.current_year, this.current_month, this.current_week).month[0] :null}월 
                                                                           ${this.get_week_dates(this.current_year, this.current_month, this.current_week) ? this.get_week_dates(this.current_year, this.current_month, this.current_week).date[0] :null}일 - 
                                                                           ${this.get_week_dates(this.current_year, this.current_month, this.current_week) ? this.get_week_dates(this.current_year, this.current_month, this.current_week).month[6]: null}월 
                                                                           ${this.get_week_dates(this.current_year, this.current_month, this.current_week) ? this.get_week_dates(this.current_year, this.current_month, this.current_week).date[6]: null}일
                                                </span>
                                                <div class="swap_cal"></div>
                                            </div>
                                            <div class="cal_tools_wrap">
                                                <div class="go_today" onclick="${this.instance}.go_week()"></div>
                                                <div class="add_plan" onclick="${this.instance}.add_plan_button()"></div>
                                            </div>
                                            <div class="cal_pc_tools_wrap">
                                                ${CComponent.text_button ("calendar_week_prev", "<img src='/static/common/icon/icon_arrow_l_black.png' style='width:28px;vertical-align:top'>", null, ()=>{this.move_week('prev');})}
                                                ${CComponent.text_button ("calendar_week_next", "<img src='/static/common/icon/icon_arrow_l_black.png' style='width:28px;vertical-align:top;transform:rotate(180deg)'>", null, ()=>{this.move_week('next');})}
                                            </div>
                                        </div>
                                        `             
                ,
                "week_cal_upper_box_date_tool":`
                    <div class="cal_week_line_dates" style="border-bottom:0;font-size:11px;">
                        <div class="week_cal_time_text"></div>
                        ${this.date_start == 0  //시작을 월요일부터 옵션을 위한 코드
                            ? '<div class="_week_row_1 obj_font_color_sunday_red">일</div><div class="_week_row_2">월</div><div class="_week_row_3">화</div><div class="_week_row_4">수</div><div class="_week_row_5">목</div><div class="_week_row_6">금</div><div class="_week_row_7 obj_font_color_saturday_blue">토</div>'
                            : '<div class="_week_row_1">월</div><div class="_week_row_2">화</div><div class="_week_row_3">수</div><div class="_week_row_4">목</div><div class="_week_row_5">금</div><div class="_week_row_6 obj_font_color_saturday_blue">토</div><div class="_week_row_7 obj_font_color_sunday_red">일</div>'}   
                    </div>
                    `
                ,
                "week_time_line":`<div class="week_time_line>
                                    <div>시간</div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                                  </div>
                                  `
                ,
                "initial_page":`<div id="${this.subtargetHTML}"><div id="cal_display_panel"><span></span></div><div id="page${this.current_page_num}" class="pages" style="left:0px;"></div></div>`
            }
        );
    }


    toggle_touch_move (onoff, input_target_html){
        let ts;
        let tsy;
        let tm;
        let tmy;
        let selector_body = $(input_target_html);
        let x_threshold;
        let y_threshold;
        let swiper_x = false;
        if(this.cal_type == "week"){
            x_threshold = 80;
            y_threshold = 200;
        }else if(this.cal_type == "month"){
            x_threshold = 80;
            y_threshold = 200;
        }

        switch(onoff){
        case "on":
            selector_body.off("touchstart").on("touchstart", (e) => {
                ts = e.originalEvent.touches[0].clientX;
                tsy = e.originalEvent.touches[0].clientY;
            });

            selector_body.off('touchmove').on('touchmove', (e) => {
                tm = e.originalEvent.touches[0].clientX;
                tmy = e.originalEvent.touches[0].clientY;


                // if( Math.abs(ts - tm) > Math.abs(tsy - tmy) && swiper_x == false ){
                if( Math.abs(ts - tm) > Math.abs(tsy - tmy)){
                    if(swiper_x == false){
                        $('#root_content').on('touchmove', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        });
                        swiper_x = true;
                    }
                    
                    
                    if(ts - tm>x_threshold){
                        if(this.cal_type == "month"){this.move_month("next");}else if(this.cal_type == "week"){this.move_week("next");}
                        if(swiper_x == true){
                            $('#root_content').off('touchmove');
                            swiper_x = false;
                        }
                    }else if(ts - tm<-x_threshold){
                        if(this.cal_type == "month"){this.move_month("prev");}else if(this.cal_type == "week"){this.move_week("prev");}
                        if(swiper_x == true){
                            $('#root_content').off('touchmove');
                            swiper_x = false;
                        }
                    }
                    // selector_body.off("touchstart").off("touchend").off('touchmove');

                    
                }
            });

            //아이폰에서 touchmove를 threshold보다 작게했을때 상하스크롤이 locking되는 현상 방지
            selector_body.off("touchend").on("touchend", (e) => {

                if(swiper_x == true){
                    $('#root_content').off('touchmove');
                    swiper_x = false;
                }

                // let te = e.originalEvent.changedTouches[0].clientX;
                // let tey = e.originalEvent.changedTouches[0].clientY;

                // if( Math.abs(ts - te) > Math.abs(tsy - tey)){
                //     if(ts>te+x_threshold){
                //         if(this.cal_type == "month"){this.move_month("next");}else if(this.cal_type == "week"){this.move_week("next");}
                //     }else if(ts<te-x_threshold){
                //         if(this.cal_type == "month"){this.move_month("prev");}else if(this.cal_type == "week"){this.move_week("prev");}
                //     }
                // }
                // return true;
            });
            break;

        case "off":
            selector_body.off("touchstart").off("touchend").off('touchmove');
            break;
        }
    }

    append_child (target, type, page_num){
        let el = document.createElement(type);
        el.id = `page${page_num}`;
        el.style.transform = 'translateX(100%)';
        el.classList.add('pages');
        document.getElementById(target).appendChild(el);
    
        let el_prev = document.getElementById(`page${page_num-1}`);
        
        this.toggle_touch_move('off', '#calendar_wrap');
        setTimeout(() => {
            el.style.transform = 'translateX(0)';
            el_prev.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                this.toggle_touch_move('on', '#calendar_wrap');
            }, 100);
            setTimeout(() => {
                el_prev.parentNode.removeChild(el_prev);
            }, 200);
        }, 0);
    }
    
    prepend_child (target, type, page_num){
        let el = document.createElement(type);
        el.id = `page${page_num}`;
        el.style.transform = 'translateX(-100%)';
        el.classList.add('pages');
        let _target = document.getElementById(target);
        _target.insertBefore(el, _target.childNodes[0]);
    
        let el_prev = document.getElementById(`page${page_num+1}`);
        
        this.toggle_touch_move('off', '#calendar_wrap');
        setTimeout(() => {
            el.style.transform = 'translateX(0)';
            el_prev.style.transform = 'translateX(100%)';
            setTimeout(() => {
                this.toggle_touch_move('on', '#calendar_wrap');
            }, 100);
            setTimeout(() => {
                el_prev.parentNode.removeChild(el_prev);
            }, 200);
        }, 0);
    }
}


class Plan_func{
    static create(url, data, callback){
        //데이터 형태 {"member_id":"", "contents":"", "counts":"", "price":"", "start_date":"", "end_date":"", "class_id":"", "package_id":""};
        let async = true;
        if(data.async != undefined){
            async = data.async;
        }
        $.ajax({
            // url:'/schedule/add_schedule/',
            url : url,
            type:'POST',
            data: data,
            dataType : 'JSON',
            async: async,
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray);
                        return false;
                    }
                }
                callback(data);
            },
    
            //통신 실패시 처리
            error:function(data){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }

    static read(date, days, callback){
        let date_ = date;
        let days_ = days;
        if(date_ == undefined){date_ = `${this.current_year}-${this.current_month}-01`;}
        if(days_ == undefined){days_ = 31;}

        $.ajax({
            url: '/trainer/get_trainer_schedule_all/',
            type : 'GET',
            data : {"date":date_, "day":days_},
            dataType: "JSON",

            beforeSend:function (){
                ajax_load_image(SHOW);
            },
            success:function (data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray);
                        return false;
                    }
                }
                callback(data, date_);
                return data;
            },

            complete:function (){
                ajax_load_image(HIDE);
            },

            error:function (){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }

    static read_plan(schedule_id, callback){
        
        $.ajax({
            url: '/trainer/get_trainer_schedule_info/',
            type : 'GET',
            data : {"schedule_id":schedule_id},
            dataType: "JSON",

            beforeSend:function (){
                ajax_load_image(SHOW);
            },
            success:function (data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
                return data;
            },

            complete:function (){
                ajax_load_image(HIDE);
            },

            error:function (){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }

    static delete(data, callback){
        //데이터 형태 {"schedule_id":""};
        let async = true;
        if(data.async != undefined){
            async = data.async;
        }
        $.ajax({
            url:'/schedule/delete_schedule/',
            type:'POST',
            data: data,
            dataType : 'JSON',
            async: async,
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback();
                }
                
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }

    static update(url, data, callback){
        let async = true;
        if(data.async != undefined){
            async = data.async;
        }
        $.ajax({
            url:url,
            type:'POST',
            data: data,
            dataType : 'JSON',
            async: async,
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback();
                }
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }

    static status(data, callback){
        //데이터 형태 {"schedule_id":"", "state_cd":""};
        let async = true;
        if(data.async != undefined){
            async = data.async;
        }
        $.ajax({
            url:'/schedule/update_schedule_state_cd/',
            type:'POST',
            data: data,
            dataType : 'JSON',
            async: async,
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray);
                        return false;
                    }
                }
                callback(data);
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }

    static read_plan_repeat(callback){
        $.ajax({
            url: '/trainer/get_repeat_schedule_all/',
            type : 'GET',
            // data : {"date":date_, "day":days_},
            dataType: "JSON",

            beforeSend:function (){
                ajax_load_image(SHOW);
            },
            success:function (data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },

            complete:function (){
                ajax_load_image(HIDE);
            },

            error:function (){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }

    static delete_plan_repeat(data, callback){
        console.log(data);
        $.ajax({
            url:'/schedule/delete_repeat_schedule/',
            type:'POST',
            data: data,
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback();
                }
                
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }
}




function date_format (date){
    let date_raw = date.replace(/[-_., ]/gi, "-").split('-');
    let yyyy = date_raw[0];
    let m = Number(date_raw[1]);
    let d = Number(date_raw[2]);
    let mm = date_raw[1];
    let dd = date_raw[2];

    if(m<10){
        mm = '0'+m;
    }
    if(d<10){
        dd = '0'+d;
    }

    return{
        "yyyy-mm-dd":`${yyyy}-${mm}-${dd}`,
        "yyyy-m-d":`${yyyy}-${m}-${d}`,

        "yyyy.mm.dd":`${yyyy}.${mm}.${dd}`,
        "yyyy.m.d":`${yyyy}.${m}.${d}`,

        "yyyy_mm_dd":`${yyyy}_${mm}_${dd}`,
        "yyyy_m_d":`${yyyy}_${m}_${d}`,

        "yyyy/mm/dd":`${yyyy}/${mm}/${dd}`,
        "yyyy/m/d":`${yyyy}/${m}/${d}`
    };
}

// 중복일정 관련 함수 - 겹치지 않는 큰 일정으로 만들기
function clear_duplicated_time (resultStart_Array, resultEnd_Array){

    let check_duplication = true; // 시작시 중복이 있다고 가정
    let error_check = 0; //에러 방지 코드

    while(check_duplication){ // 중복된 값이 있는지 체크 (최대 3번 돌아감)
        error_check++;
        check_duplication = false; // 중복된 값이 없다고 초기값 셋팅

        let temp_resultStart_Array = resultStart_Array; //중복 검사를 위해 중복 걸러진 시작 값 셋팅
        let temp_resultEnd_Array = resultEnd_Array; //중복 검사를 위해 중복 걸러진 종료 값 셋팅
        resultStart_Array = []; // 시작시각 결과 값 비우기
        resultEnd_Array = []; // 종료시각 결과 값 비우기

        //중복 걸러진 시작값 갯수 기준으로 시작
        let temp_result_start_array_length = temp_resultStart_Array.length;
        for(let i=0; i<temp_result_start_array_length; i++){
            //비교 대상 셋팅

            let start_time_temp = temp_resultStart_Array[i];
            let end_time_temp = temp_resultEnd_Array[i];

            // 비교 대상은 중복 걸러진 시작값중 자신 제외한 모든 값
            for(let j=0; j<temp_result_start_array_length; j++){
                //자기 자신인 경우 제외 (중복 체크가 되어버림)
                if(i==j){
                    continue;
                }
                // 중복 체크후 합치기 (일정 같은 경우 포함)
                if (know_whether_plans_has_duplicates(temp_resultStart_Array[i], temp_resultEnd_Array[i], temp_resultStart_Array[j], temp_resultEnd_Array[j]) > 0) {
                    let time_array = [start_time_temp, end_time_temp, temp_resultStart_Array[j], temp_resultEnd_Array[j]];
                    time_array.sort();
                    start_time_temp = time_array[0];
                    end_time_temp = time_array[3];
                    check_duplication = true; // 중복된 값 체크
                }

            }
            //시작 시각과 종료시각이 같은 일정이 있는지 확인
            let start_time_temp_index = resultStart_Array.indexOf(start_time_temp);
            if(start_time_temp_index == -1 || resultEnd_Array[start_time_temp_index]!=end_time_temp){
                //시작 시각과 종료시각이 같은 일정이 없으면 결과값에 추가
                resultStart_Array.push(start_time_temp);
                resultEnd_Array.push(end_time_temp);
            }
        }
        // 혹시 모를 에러 방지 코드
        if(error_check>1000){
            console.log('error 발생 : ');
            break;
        }
    }
    return {"clear_start_array":resultStart_Array, "clear_end_array":resultEnd_Array};
}


function know_whether_plans_has_duplicates(start_time, end_time, start_time_compare, end_time_compare){
    if(start_time == start_time_compare && end_time == end_time_compare){
        // 완전히 같은 경우
        // a=b a'=b'
        return 5;
    }
    else if(TimeRobot.compare(start_time_compare, start_time) && TimeRobot.compare(end_time, end_time_compare)){
        // 비교대상 시간이 비교시간안에 쏙 들어갈때
        // a < b < b' < a'
        return 1;
    }
    else if(TimeRobot.compare(start_time_compare, start_time) && TimeRobot.compare(start_time_compare, end_time)==false && TimeRobot.compare(end_time_compare, end_time)){
        // 비교대상 시간의 시작시간이 비교시간 안에 들어가 있을때
        // a <= b < a' <= b'
        return 2;
    }
    else if(TimeRobot.compare(start_time, start_time_compare) && TimeRobot.compare(start_time, end_time_compare)==false && TimeRobot.compare(end_time, end_time_compare)){
        //비교 대상 시간의 종료시간이 비교 시간 안에 들어가 있을때
        // b <= a < b' <= a'
        return 3;
    }
    else if(TimeRobot.compare(start_time, start_time_compare) && TimeRobot.compare(end_time_compare, end_time)){
        //비교 대상 시간이 비교시간을 완전히 감쌀때
        // b < a < a' < b'
        return 4;
    }
    else {
        //비교 대상 시간이 비교시간과 겹치지 않을때
        return 0;
    }
}

function compare_time (time1, time2){
    var hour1 = Number(time1.split(':')[0]);
    var min1  = Number(time1.split(':')[1]);
    var hour2 = Number(time2.split(':')[0]);
    var min2  = Number(time2.split(':')[1]);
    if(hour1 < 10){
        hour1 = '0' + hour1;
    }
    if(min1 < 10){
        min1 = '0' + min1;
    }
    if(hour2 < 10){
        hour2 = '0' + hour2;
    }
    if(min2 < 10){
        min2 = '0' + min2;
    }

    var time1_num = `${hour1}${min1}`;
    var time2_num = `${hour2}${min2}`;

    if(Number(time1_num) > Number(time2_num) ){
        return true;
    }else{
        return false;
    }
}

// function compare_time (time1, time2){
//     var hour1 = time1.split(':')[0];
//     var min1  = time1.split(':')[1];
//     var hour2 = time2.split(':')[0];
//     var min2  = time2.split(':')[1];
//
//     var time1_num = hour1+min1;
//     var time2_num = hour2+min2;
//
//     if(Number(time1_num) > Number(time2_num) ){
//         return true;
//     }else{
//         return false;
//     }
// }

// function compare_times_to_merge_min_max (stime1, etime1, stime2, etime2){
//     var timearray = [stime1, stime2, etime1, etime2];
//     var stime_new;
//     var etime_new;
//     timearray.sort();
//
//     stime_new = timearray[0];
//     etime_new = timearray[3];
//
//     return {"start":`${stime_new}`, "end":`${etime_new}`};
// }

function array_element_count (array, wanted){
    let counts = {};
    let len = array.length;
    for(let i=0; i<len; i++){
        counts[array[i]] = 0;
    }
    for(let j=0; j<len; j++){
        counts[array[j]] = counts[array[j]] +1;
    }
    return counts[wanted];
}

function duplicated_plans (jsondata){
    // 1:1 일정 / 그룹 일정 / OFF 일정 합치기
    let result_data = [...jsondata];
    let start_array = [];
    let end_array = [];
    let duplicate_dic = {};

    jsondata.forEach((plan) => {
        let start_time = plan.start_time;
        let end_time = plan.end_time;
        if(end_time== "00:00"){
            end_time = "24:00";
        }
        start_array.push(start_time);
        end_array.push(end_time);
    });

    //중복일정을 큰 덩어리로 가져오기
    let clear_result = clear_duplicated_time(start_array, end_array);
    let clear_start_date = clear_result.clear_start_array;
    let clear_end_date = clear_result.clear_end_array;

    for(let i=0; i<clear_start_date.length; i++){
        duplicate_dic[clear_start_date[i]+' ~ '+clear_end_date[i]] = [];
        // 중복 검사
        for(let j=0; j<start_array.length; j++){
            //겹치는 dict 를 만든다.
            if(know_whether_plans_has_duplicates(clear_start_date[i], clear_end_date[i], start_array[j], end_array[j]) > 0){
                duplicate_dic[clear_start_date[i]+' ~ '+clear_end_date[i]].push(start_array[j]+' ~ '+end_array[j]);
            }
        }
    }

    //겹치지 않는 합쳐진 일정
    let pp = 0;
    for(let plan in duplicate_dic){
        let temp_index = [];
        let temp_cell_divide;

        // 겹치는 일정 sorting
        let array_sorted = duplicate_dic[plan].sort();

        for(let i=0; i<array_sorted.length; i++){
            // 기본값 셋팅
            if(i == 0){
                temp_index[i] = 0; //가장 첫번째 값은 항상 왼쪽 첫번째로 고정 위치
                continue;
            }
            let check_duplication = false;
            // 비교 대상 확인
            for(let j=0; j<array_sorted.length; j++){
                if(i == j){
                    break;
                }
                let ref_split = array_sorted[i].split(' ~ ');
                let comp_split = array_sorted[j].split(' ~ ');

                if(know_whether_plans_has_duplicates(ref_split[0], ref_split[1], comp_split[0], comp_split[1]) > 0){ //겹칠때
                    check_duplication = true;
                }else{ //겹치지 않을때
                    let index_move = 0;
                    let check = 0;
                    // 지금 비교 조건에서는 겹치지 않았지만 정말 들어갈수 있는지 전체 array 에서 검사
                    //이 인덱스(위치)와 같은 값을 갖는 다른 시간대가 있는지 검사
                    //같은 위치에 있는 일정들 검사 (같은 위치지만 시간이 다르면 겹치지 않을 수 있으므로)
                    for(let z=0; z<array_element_count(temp_index, temp_index[j]); z++){
                        let index_loc = temp_index.indexOf(temp_index[j], index_move);
                        index_move = index_loc + 1;
                        if(i != index_loc){

                            // let ref_split = array_sorted[i].split(' ~ ');
                            let comp_split = array_sorted[index_loc].split(' ~ ');

                            if(know_whether_plans_has_duplicates(ref_split[0], ref_split[1], comp_split[0], comp_split[1]) > 0){
                                check++;
                            }
                        }
                    }
                    if(check > 0){ //겹치는게 존재
                        check_duplication = true;
                    }else{ //겹치는게 없음
                        temp_index[i] = temp_index[j];
                        break;
                    }
                }

                if(check_duplication == true){
                    let temp_array = [];
                    for(let k=0; k<=j; k++){
                        temp_array.push(temp_index[k]);
                    }
                    temp_index[i] = Math.max.apply(null, temp_array)+1;
                }
            }
        }

        temp_cell_divide = Math.max.apply(null, temp_index) +1;

        for(let p=0; p<temp_index.length; p++){
            result_data[pp].duplicated_index = temp_index[p];
            result_data[pp].duplicated_cell = temp_cell_divide;
            pp++;
        }
    }
    return result_data;
}
// 중복일정 관련 함수
// 중복일정 관련 함수





/* global $, ajax_load_image, SHOW, HIDE, current_page,  func_set_webkit_overflow_scrolling, 
layer_popup, POPUP_AJAX_CALL, POPUP_ADDRESS_PLAN_VIEW, POPUP_ADDRESS_PLAN_ADD, POPUP_FROM_BOTTOM*/


