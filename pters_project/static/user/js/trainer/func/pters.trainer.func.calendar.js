// 달력 관련

class Calendar {
    constructor(targetHTML, instance){
        this.page_name = "calendar";
        this.window_height = window.innerHeight;
        this.pages_height = this.window_height - 102-45;

        this.targetHTML = targetHTML;
        this.subtargetHTML = 'calendar_wrap';
        this.instance = instance;
        
        this.cal_type = "week";
        this.current_page_num = 1;

        this.week_zoomed = false;

        let d = new Date();
        this.today = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;

        this.current_year = d.getFullYear();
        this.current_month = d.getMonth()+1;
        this.current_date = d.getDate();
        this.current_week = Math.ceil( (this.current_date + new Date(this.current_year, this.current_month-1, 1).getDay() )/7 ) - 1;

        this.worktime = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
    }

    init(cal_type){
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page

        this.cal_type = cal_type;
        switch(cal_type){
            case "month":
                this.render_upper_box(cal_type);
                this.render_month_cal( this.current_page_num ,this.current_year, this.current_month);
                this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 31, (jsondata, date) => {
                    if(this.cal_type == cal_type){
                        if(date == `${this.current_year}-${this.current_month}-01`){
                            this.render_month_cal( this.current_page_num, this.current_year, this.current_month, jsondata);
                        }
                    }
                })
                this.toggle_touch_move('on', '#calendar_wrap');
            break;

            case "week":
                this.render_upper_box(cal_type);
                this.render_week_cal(this.current_page_num , this.current_year, this.current_month, this.current_week);
                this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 31, (jsondata, date) => {
                    if(this.cal_type == cal_type){
                        if(date == `${this.current_year}-${this.current_month}-01`){
                            this.render_week_cal( this.current_page_num, this.current_year, this.current_month, this.current_week, jsondata);
                            this.week_schedule_draw(this.current_year, this.current_month, this.current_week, jsondata)
                        }
                    }
                })
                this.toggle_touch_move('on', '#calendar_wrap');
            break;
        }
    }

    get_current_month(){
        return {
            "year": this.current_year, "month": this.current_month
        }
    }

    get_prev_month(){
        let prev_month = this.current_month-1 < 1 ? 12 : this.current_month - 1;
        let year = this.current_month-1 < 1 ? this.current_year-1 : this.current_year;
        return {
            "year":year, "month": prev_month
        }
    }

    get_next_month(){
        let next_month = this.current_month+1 > 12 ? 1 : this.current_month + 1;
        let year = this.current_month+1 > 12 ? this.current_year+1 : this.current_year;
        return {
            "year":year, "month": next_month
        }
    }

    get_current_week(){
        return {
            "year":this.current_year, "month":this.current_month, "week":this.current_week
        }
    }

    get_prev_week(){
        let year = this.current_year;
        let month = this.current_month;
        let week = this.current_week;
        let first_day = new Date(year, month-1, 1).getDay();
        let last_date = new Date(year, month, 0).getDate();
        let week_num_this_month = Math.ceil( (first_day + last_date)/7  );

        let prev_year = year - 1;
        let prev_month = month - 1 < 1 ? 12 : month-1;

        week = week - 1;
        if(week == -1 && first_day == 0){
            week = Math.ceil( ( new Date(prev_month == 12 ? prev_year: year, prev_month-1, 1).getDay() + new Date(prev_month == 12 ? prev_year: year, prev_month, 0).getDate()  )/7 - 1  )
            month = month - 1 < 1 ? 12  : month - 1;
            year = month == 12 ? year - 1 : year;   
        }else if(week == -1 && first_day !=0){
            week = Math.ceil( ( new Date(prev_month == 12 ? prev_year: year, prev_month-1, 1).getDay() + new Date(prev_month == 12 ? prev_year: year, prev_month, 0).getDate()  )/7 - 2  )
            month = month - 1 < 1 ? 12  : month - 1;
            year = month == 12 ? year - 1 : year;      
        }

        return {
            "year":year, "month":month, "week":week
        }
    }

    get_next_week(){
        let year = this.current_year;
        let month = this.current_month;
        let week = this.current_week;
        let first_day = new Date(year, month-1, 1).getDay();
        let last_date = new Date(year, month, 0).getDate();
        let week_num_this_month = Math.ceil( (first_day + last_date)/7  );

        let next_year = year + 1;
        let next_month = month + 1 > 12 ? 1 : month + 1;

        week = week + 1;
        if(week  == week_num_this_month && new Date(year, month, 0).getDay() != 6 ){
            week = 1;
            month = month + 1 > 12 ? 1  : month + 1;
            year = month ==  1 ? year + 1 : year;

        }else if(week == week_num_this_month){
            week = 0;
            month = month + 1 > 12 ? 1  : month + 1;
            year = month ==  1 ? year + 1 : year;

        }
        
        return {
            "year":year, "month":month, "week":week
        }
    }

    go_month(year, month){
        this.current_year = year;
        this.current_month = month;
        this.render_month_cal( this.current_page_num, this.current_year, this.current_month)
        this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 31, (jsondata, date) => {
            if(date == `${this.current_year}-${this.current_month}-01`){
                this.render_month_cal(this.current_page_num, this.current_year, this.current_month, jsondata);
            }
        })
    }

    move_month(direction){
        switch(direction){
            case "next":
                let next = this.get_next_month();
                this.current_year = next.year;
                this.current_month = next.month;

                /*페이지 삽입*/
                this.current_page_num = this.current_page_num + 1;
                this.append_child(this.subtargetHTML, 'div', this.current_page_num)
                /*페이지 삽입*/

                this.render_upper_box("month");
                this.render_month_cal( this.current_page_num, this.current_year, this.current_month)
                this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 31, (jsondata, date) => {
                    if(date == `${this.current_year}-${this.current_month}-01`){
                        this.render_month_cal(this.current_page_num, this.current_year, this.current_month, jsondata);
                    }
                })
            break;

            case "prev":
                let prev = this.get_prev_month();
                this.current_year = prev.year;
                this.current_month = prev.month;

                /*페이지 삽입*/
                this.current_page_num = this.current_page_num - 1;
                this.prepend_child(this.subtargetHTML, 'div', this.current_page_num)
                /*페이지 삽입*/

                this.render_upper_box("month");
                this.render_month_cal(this.current_page_num, this.current_year, this.current_month)
                this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 31, (jsondata, date) => {
                    if(date == `${this.current_year}-${this.current_month}-01`){
                        this.render_month_cal(this.current_page_num, this.current_year, this.current_month, jsondata);
                    }
                })
            break;
        }
    }

    move_week(direction){
        switch(direction){
            case "next":
                let next = this.get_next_week();
                this.current_year = next.year;
                this.current_month = next.month;
                this.current_week = next.week;
                

                /*페이지 삽입*/
                this.current_page_num = this.current_page_num + 1;
                this.append_child(this.subtargetHTML, 'div', this.current_page_num)
                /*페이지 삽입*/

                this.render_upper_box("week");
                this.render_week_cal(this.current_page_num , this.current_year, this.current_month, this.current_week);
                this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 31, (jsondata, date) => {
                    if(date == `${this.current_year}-${this.current_month}-01`){
                        this.render_week_cal( this.current_page_num, this.current_year, this.current_month, this.current_week, jsondata);
                        this.week_schedule_draw(this.current_year, this.current_month, this.current_week, jsondata)
                    }
                })
            break;

            case "prev":
                let prev = this.get_prev_week();
                this.current_year = prev.year;
                this.current_month = prev.month;
                this.current_week = prev.week;
                

                /*페이지 삽입*/
                this.current_page_num = this.current_page_num - 1;
                this.prepend_child(this.subtargetHTML, 'div', this.current_page_num)
                /*페이지 삽입*/

                this.render_upper_box("week");
                this.render_week_cal(this.current_page_num , this.current_year, this.current_month, this.current_week);
                this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 31, (jsondata, date) => {
                    if(date == `${this.current_year}-${this.current_month}-01`){
                        this.render_week_cal( this.current_page_num, this.current_year, this.current_month, this.current_week, jsondata);
                        this.week_schedule_draw(this.current_year, this.current_month, this.current_week, jsondata)
                    }
                })
            break;
        }
    }

    switch_cal_type(){
        switch(this.cal_type){
            case "month":
                this.init("week");
            break;

            case "week":
                this.init("month");
            break;
        }
    }

    render_upper_box(type){
        if(current_page != this.page_name){
            return false;
        }

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
    
    render_month_cal(page, year, month, schedule_data){ //월간 달력 렌더링 (연, 월)
        if(current_page != this.page_name){
            return false;
        }

        if(schedule_data == undefined){
            schedule_data = false;
        }
        let weeks_div = [];
        for(let i=0; i<6; i++){
            weeks_div = [...weeks_div, this.draw_week_line(year, month, i, schedule_data, `${this.instance}.open_popup_plan_view`)];
        }
        document.getElementById(`page${page}`).innerHTML = weeks_div.join('');
        // document.getElementById('cal_display_panel').innerHTML = component.month_cal_upper_box;
        func_set_webkit_overflow_scrolling(`#page${page}`);
    }

    render_week_cal(page ,year, month, week, schedule_data){ //주간 달력 렌더링 (연, 월, 몇번째 주)
        if(current_page != this.page_name){
            return false;
        }

        let data = this.draw_week_line(year, month, week, schedule_data, `${this.instance}.zoom_week_cal`, "week");
        
        document.getElementById(`page${page}`).innerHTML = data;
        // document.getElementById('cal_display_panel').innerHTML = component.week_cal_upper_box;
        func_set_webkit_overflow_scrolling(`#page${page}`);
    }

    open_popup_plan_view(event, year, month, date){
        layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_view', 90, POPUP_FROM_BOTTOM, {'select_date':`${year}-${month}-${date}`})
    }

    zoom_week_cal(event){
        let clicked_number = event.target.dataset.row;

        if(clicked_number == undefined){
            return false;
        }

        if(this.week_zoomed == false){
            for(let i=1; i<=7; i++){
                if(i==clicked_number){
                    Array.from(document.getElementsByClassName(`_week_row_${i}`)).forEach( (el) =>{
                        el.style.width = "100%";
                    })
                    continue;
                }
                Array.from(document.getElementsByClassName(`_week_row_${i}`)).forEach( (el) =>{
                    el.style.display = "none";
                })
                
            }
            this.week_zoomed = true;
            this.toggle_touch_move('off', '#calendar_wrap');
        }else if(this.week_zoomed == true){
            for(let i=1; i<=7; i++){
                if(i==clicked_number){
                    Array.from(document.getElementsByClassName(`_week_row_${i}`)).forEach( (el) =>{
                        el.style.width = "12.5%";
                    })
                    continue;
                }
                Array.from(document.getElementsByClassName(`_week_row_${i}`)).forEach( (el) =>{
                    el.style.display = "table-cell";
                })
            }
            this.week_zoomed = false;
            this.toggle_touch_move('on', '#calendar_wrap');
        }
    }


    get_week_dates(year, month, week){
        const firstday_this_month = (new Date(Number(year), Number(month)-1, 1)).getDay(); // 3
        const lastday_this_month = (new Date(Number(year), Number(month), 0)).getDate(); // 3
        const lastday_prev_month = (new Date(Number(year), Number(month)-1, 0)).getDate();

        const number_of_weeks_this_month = (
                   Math.ceil(
                        (new Date(year, Number(month)-1, 1).getDay() + new Date(year, Number(month), 0).getDate() ) / 7
                   ) 
        )
        if(week >= number_of_weeks_this_month){
            //해당 Week에 대한 정보가 없음
            return false;
        }
        
        let years_of_this_week = [];
        let months_of_this_week = [];
        let dates_of_this_week = [];
        let color_of_this_week = [];
        let date_cache = 1;
        let month_cache;
        let finished = false;
        for(let i=0; i<=week; i++){
            let yearCellsToJoin = [];
            let monthCellsToJoin = [];
            let dateCellsToJoin = [];
            let dateColorClass = [];
            for(let j=0; j<7; j++){
                if(i==0 && j<firstday_this_month){ //첫번째 주일때 처리
                    let _year = Number(month)-1 > 0 ? Number(year) : Number(year) - 1;
                    let _month = Number(month)-1 < 1 ? 12 : Number(month)-1;
                    let _date = lastday_prev_month-j;

                    yearCellsToJoin.unshift(_year);
                    monthCellsToJoin.unshift(_month);
                    dateCellsToJoin.unshift(_date);

                    dateColorClass.unshift(`${_year}-${_month}-${_date}` == this.today ? 'cal_font_color_pink cal_fw_bd' : 'cal_font_color_grey');
                }else if(date_cache > lastday_this_month || month_cache == month + 1){ // 마지막 날짜가 끝난 이후 처리
                    if(date_cache == lastday_this_month+1){
                        date_cache = 1;
                        month_cache = month + 1
                        finished = true;
                    }
                    let _year = Number(month)+1 > 12 ? Number(year)+1 : year;
                    let _month = Number(month)+1 > 12? 1 : Number(month)+1;
                    let _date = date_cache;

                    yearCellsToJoin.push(_year);
                    monthCellsToJoin.push(_month);
                    dateCellsToJoin.push(_date);
                    dateColorClass.push(`${_year}-${_month}-${_date}` == this.today ? 'cal_font_color_pink cal_fw_bd' : 'cal_font_color_grey');
                    date_cache++
                }else{
                    let _year = Number(year);
                    let _month = Number(month);
                    let _date = date_cache;


                    yearCellsToJoin.push(_year);
                    monthCellsToJoin.push(_month);
                    dateCellsToJoin.push(_date);
                    dateColorClass.push(`${_year}-${_month}-${_date}` == this.today ? 'cal_font_color_pink cal_fw_bd' : 'cal_font_color_black');
                    date_cache++;
                }
            }
            years_of_this_week.push(yearCellsToJoin);
            months_of_this_week.push(monthCellsToJoin);
            dates_of_this_week.push(dateCellsToJoin);
            color_of_this_week.push(dateColorClass);
        }
        
        let [year1, year2, year3, year4, year5, year6, year7] = years_of_this_week[week];
        let [month1, month2, month3, month4, month5, month6, month7] = months_of_this_week[week];
        let [date1, date2, date3, date4, date5, date6, date7] = dates_of_this_week[week];
        let [color1, color2, color3, color4, color5, color6, color7] = color_of_this_week[week];
       
        
        return(
               {"year" :  years_of_this_week[week],
                "month" : months_of_this_week[week],
                "date" : dates_of_this_week[week],
                "color" : color_of_this_week[week],
                "full_date" : [
                                [year1, month1, date1], [year2, month2, date2], [year3, month3, date3], [year4, month4, date4], 
                                [year5, month5, date5], [year6, month6, date6], [year7, month7, date7]
                            ]
               }
            )
    }

    draw_week_line(year, month, week, schedule_data, onclick_func, month_or_week){ //(연,월, 몇번째 주, 날짜 클릭 콜백함수 이름)
        let week_dates_info = this.get_week_dates(year, month, week);
        let _year = week_dates_info.year;
        let _month = week_dates_info.month;
        let _date = week_dates_info.date;
        let _color = week_dates_info.color;

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
            schedule_num = [0, 0, 0, 0, 0, 0, 0]
        }

        // let week_html_template = this.week_schedule_draw(year, month, week, schedule_data);

        return(
            week_dates_info == false 
            ? 
            `<div class="cal_week_line">
                <div style="background-image:url('/static/user/res/PTERS_logo_pure.png');background-position:center;background-repeat:no-repeat;background-size:100px;height:30px;"></div>
            </div>`
            :
            `<div class="cal_week_line" style="${month_or_week == "week" ? `position:sticky;position:-webkit-sticky;top:0;background-color:#ffffff;z-index:10` : ""}">
                ${month_or_week == "week" ? `<div class="week_cal_time_text"></div>` : ""}
                <div class="${_color[0]} _week_row_1" data-row="1" onclick="${onclick_func}(event, ${_year[0]}, ${_month[0]}, ${_date[0]})">${_date[0]}<div class="calendar_schedule_display_month ${schedule_num[0]!=0?"has_schedule":""}">${schedule_num[0]!=0?schedule_num[0]:""}</div></div>
                <div class="${_color[1]} _week_row_2" data-row="2" onclick="${onclick_func}(event, ${_year[1]}, ${_month[1]}, ${_date[1]})">${_date[1]}<div class="calendar_schedule_display_month ${schedule_num[1]!=0?"has_schedule":""}">${schedule_num[1]!=0?schedule_num[1]:""}</div></div>
                <div class="${_color[2]} _week_row_3" data-row="3" onclick="${onclick_func}(event, ${_year[2]}, ${_month[2]}, ${_date[2]})">${_date[2]}<div class="calendar_schedule_display_month ${schedule_num[2]!=0?"has_schedule":""}">${schedule_num[2]!=0?schedule_num[2]:""}</div></div>
                <div class="${_color[3]} _week_row_4" data-row="4" onclick="${onclick_func}(event, ${_year[3]}, ${_month[3]}, ${_date[3]})">${_date[3]}<div class="calendar_schedule_display_month ${schedule_num[3]!=0?"has_schedule":""}">${schedule_num[3]!=0?schedule_num[3]:""}</div></div>
                <div class="${_color[4]} _week_row_5" data-row="5" onclick="${onclick_func}(event, ${_year[4]}, ${_month[4]}, ${_date[4]})">${_date[4]}<div class="calendar_schedule_display_month ${schedule_num[4]!=0?"has_schedule":""}">${schedule_num[4]!=0?schedule_num[4]:""}</div></div>
                <div class="${_color[5]} _week_row_6" data-row="6" onclick="${onclick_func}(event, ${_year[5]}, ${_month[5]}, ${_date[5]})">${_date[5]}<div class="calendar_schedule_display_month ${schedule_num[5]!=0?"has_schedule":""}">${schedule_num[5]!=0?schedule_num[5]:""}</div></div>
                <div class="${_color[6]} _week_row_7" data-row="7" onclick="${onclick_func}(event, ${_year[6]}, ${_month[6]}, ${_date[6]})">${_date[6]}<div class="calendar_schedule_display_month ${schedule_num[6]!=0?"has_schedule":""}">${schedule_num[6]!=0?schedule_num[6]:""}</div></div>
            </div>
            ${month_or_week == "week" ? this.week_schedule_draw(year, month, week, schedule_data): ""}`
        )
    }

    week_schedule_draw(year, month, week, schedule_data){
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
                    duplicated_plans(schedule_data[date_to_search]); // daily schedule for duplicated plans;
                    schedules.push(
                        schedule_data[date_to_search].map( (plan) => {
                            let tform_s = time_form(plan.start);
                            let tform_e = time_form(plan.end);

                            let start_hour = tform_s.hour;
                            let start_min = tform_s.minute;
                            let end_hour = tform_e.hour;
                            let end_min = tform_e.minute;

                            let plan_start = {full:`${start_hour < work_start ? work_start : start_hour}:${start_min}`, hour:`${start_hour < work_start ? work_start : start_hour}`, minute:start_min};
                            let plan_end = {full:`${end_hour > work_end ? work_end+1 : end_hour }:${end_min}`, hour:`${end_hour > work_end ? work_end+1 : end_hour }`, minute:end_min};

                            let diff = time_diff(plan_start.full, plan_end.full);

                            let cell_index = plan.duplicated_index;
                            let cell_divide = plan.duplicated_cell;
                            let onclick = `layer_popup.open_layer_popup(${POPUP_AJAX_CALL}, 'popup_calendar_plan_view', 90, ${POPUP_FROM_BOTTOM}, {'select_date':${date_to_search}})`
                            let styles = `width:${100/cell_divide}%;height:${diff.hour*60+60*diff.minute/60}px;top:${(plan_start.hour-work_start)*60 + 60*plan_start.minute/60}px;left:${cell_index*100/cell_divide}%`;
                            return `<div onclick="event.stopPropagation();${onclick}" class="calendar_schedule_display_week" style="${styles}"></div>`;
                        })
                    );
                }else{
                    schedules.push([]);
                }
            }
        }else{
            schedules = [];
        }
        let week_html_template = `
                                <div class="week_row">
                                    <div class="week_cal_time_text">${ (this.worktime.map( (t) => { return `<article>${t}:00</article>` } )).join('') }</div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[0]},${_month[0]},${_date[0]})" class="_week_row_1">${schedules.length > 0 ?  schedules[0].join('') : ""}</div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[1]},${_month[1]},${_date[1]})" class="_week_row_2">${schedules.length > 0 ?  schedules[1].join('') : ""}</div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[2]},${_month[2]},${_date[2]})" class="_week_row_3">${schedules.length > 0 ?  schedules[2].join('') : ""}</div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[3]},${_month[3]},${_date[3]})" class="_week_row_4">${schedules.length > 0 ?  schedules[3].join('') : ""}</div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[4]},${_month[4]},${_date[4]})" class="_week_row_5">${schedules.length > 0 ?  schedules[4].join('') : ""}</div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[5]},${_month[5]},${_date[5]})" class="_week_row_6">${schedules.length > 0 ?  schedules[5].join('') : ""}</div>
                                    <div onclick="${this.instance}.display_user_click(event, ${_year[6]},${_month[6]},${_date[6]})" class="_week_row_7">${schedules.length > 0 ?  schedules[6].join('') : ""}</div>
                                </div>
                                `;
        return week_html_template;
    }

    display_user_click(event, year, month, date){
        $('.week_indicator').remove();

        let pos = event.offsetY;
        let pos_hour = pos/60;
        let offset_hour = pos_hour > Math.floor(pos_hour)+0.5 ? Math.floor(pos_hour) + 0.5 : Math.floor(pos_hour);
        let offset_px = offset_hour * 60;

        let indicator = document.createElement('div');
        indicator.classList.add('week_indicator');
        indicator.style.top = offset_px+'px';
        event.target.appendChild(indicator);

        layer_popup.open_layer_popup(POPUP_AJAX_CALL, 'popup_calendar_plan_view', 90, POPUP_FROM_BOTTOM, {'select_date':`${year}-${month}-${date}`});
    }


    request_schedule_data(date, days, callback){
        let date_ = date;
        let days_ = days;
        if(date_ == undefined){date_ = `${this.current_year}-${this.current_month}-01`}
        if(days_ == undefined){days = 31}

        $.ajax({
            url: '/trainer/get_trainer_schedule/',
            type : 'GET',
            data : {"date":date, "day":days},
            dataType : 'html',

            beforeSend:function(){
                ajax_load_image(SHOW);
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    console.log("에러:" + jsondata.messageArray);
                }else{
                    callback(jsondata, date_);
                    return jsondata;
                }

            },

            complete:function(){
                ajax_load_image(HIDE);
            },

            error:function(){
                console.log('server error');
            }
        });
    }


    static_component(){
        return(
            {
                "month_cal_upper_box":` <div class="cal_upper_box">
                                            <button onclick="${this.instance}.move_month('prev')" style="vertical-align:middle;" hidden>이전</button>
                                            <div style="display:inline-block;width:200px;">
                                                <span class="display_year">${this.current_year}년</span>
                                                <span class="display_month">${this.current_month}월</span>
                                            </div>
                                            <button onclick="${this.instance}.move_month('next')" style="vertical-align:middle;" hidden>다음</button>
                                            <div class="cal_tools_wrap">
                                                <div class="swap_cal" onclick="${this.instance}.switch_cal_type()"></div>
                                                <div class="add_plan"></div>
                                            </div>
                                        </div>
                                        <div class="cal_week_line_dates">
                                            <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
                                        </div>`
                ,
                "week_cal_upper_box":`
                                        <div class="cal_upper_box">
                                            <button onclick="${this.instance}.move_week('prev')" style="vertical-align:middle;" hidden>이전</button>
                                            <div style="display:inline-block;width:200px;">
                                                <span class="display_week">${this.get_week_dates(this.current_year, this.current_month, this.current_week).month[0]}월 ${this.get_week_dates(this.current_year, this.current_month, this.current_week).date[0]}일 - ${this.get_week_dates(this.current_year, this.current_month, this.current_week).month[6]}월 ${this.get_week_dates(this.current_year, this.current_month, this.current_week).date[6]}일</span>
                                            </div>
                                            <button onclick="${this.instance}.move_week('next')" style="vertical-align:middle;" hidden>다음</button>
                                            <div class="cal_tools_wrap">
                                                <div class="swap_cal"  onclick="${this.instance}.switch_cal_type()"></div>
                                                <div class="add_plan"></div>
                                            </div>
                                        </div>
                                        <div class="cal_week_line_dates">
                                            <div class="week_cal_time_text"></div>
                                            <div class="_week_row_1">일</div><div class="_week_row_2">월</div><div class="_week_row_3">화</div>
                                            <div class="_week_row_4">수</div><div class="_week_row_5">목</div><div class="_week_row_6">금</div>
                                            <div class="_week_row_7">토</div>
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
        )
    }


    toggle_touch_move(onoff, input_target_html){
        let ts;
        let tsy;
        let tm;
        let tmy;
        let selector_body = $(input_target_html);
        let x_threshold;
        let y_threshold;
        let swiper_x = false;
        let root_content = document.getElementById(`root_content`);
        if(this.cal_type == "week"){
            x_threshold = 20;
            y_threshold = 200;
        }else if(this.cal_type == "month"){
            x_threshold = 20;
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
                     
                        // if( Math.abs(ts - tm) > x_threshold && Math.abs(ts - tm) > Math.abs(tsy - tmy)  ){
                        if( Math.abs(ts - tm) > Math.abs(tsy - tmy) && swiper_x == false ){
                            $('#root_content').on('touchmove', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            })
                            // root_content.style.overflowY = 'hidden';
                            swiper_x = true;
                        }
                    })

                    selector_body.off("touchend").on("touchend", (e) => {

                        if(swiper_x == true){
                            // root_content.style.overflowY = 'scroll';
                            $('#root_content').off('touchmove');
                            swiper_x = false;
                        }
                        

                        let te = e.originalEvent.changedTouches[0].clientX;
                        let tey = e.originalEvent.changedTouches[0].clientY;
                        // if(Math.abs(tsy - tey) < y_threshold){
                        if( Math.abs(ts - te) > Math.abs(tsy - tey)){
                           if(ts>te+x_threshold){
                                if(this.cal_type == "month"){this.move_month("next");}else if(this.cal_type == "week"){this.move_week("next");}
                            }else if(ts<te-x_threshold){
                                if(this.cal_type == "month"){this.move_month("prev");}else if(this.cal_type == "week"){this.move_week("prev");}
                            }
                        }
                        return true;
                    });
            break;

            case "off":
                    selector_body.off("touchstart").off("touchend").off('touchmove');
            break;
        }
    }

    append_child(target, type, page_num){
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
            },100)
            setTimeout(() => {
                el_prev.parentNode.removeChild(el_prev);
            }, 200)
        }, 0)
    }
    
    prepend_child(target, type, page_num){
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
            },100)
            setTimeout(() => {
                el_prev.parentNode.removeChild(el_prev);
            }, 200)
        }, 0)
    }

}

function popup_alert_month(event, y, m, d){
    alert(`월간 날짜 클릭 ${y} ${m} ${d}`)
}

function popup_alert_week(event, y, m, d){
    alert(`주간 날짜 클릭 ${y} ${m} ${d}`)
}

function date_format(date){
    let date_raw = date.replace(/[-_., ]/gi,"-").split('-');
    let yyyy = date_raw[0];
    let m = Number(date_raw[1]);
    let d = Number(date_raw[2]);
    let mm = date_raw[1];
    let dd = date_raw[2];

    if(m<10){
        mm = '0'+m
    }
    if(d<10){
        dd = '0'+d
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

function time_form(_time1){
    let time1 = _time1.split(':');

    let hh1 = Number(time1[0]);
    let mm1 = Number(time1[1]);

    return {hour: hh1, minute: mm1};
}

function time_diff(_time1, _time2){
    // _time2는 항상 _time1보다 뒤의 시간이어야 한다.

    let time1 = _time1.split(':');
    let time2 = _time2.split(':');

    let hh1 = Number(time1[0]);
    let mm1 = Number(time1[1]);
    let hh2 = Number(time2[0]);
    let mm2 = Number(time2[1]);

    let hh_diff = hh2 - hh1;
    let mm_diff = mm2 - mm1;

    if(mm_diff < 0){
        hh_diff = hh_diff - 1;
        mm_diff = mm_diff + 60; 
    }

    return {hour: hh_diff, minute: mm_diff};
}


// 중복일정 관련 함수
// 중복일정 관련 함수
function clear_duplicated_time(jsondata){
    //중복 제거 (그룹 일정때문에 중복으로 들어오는 것들)
    // var all_start_date_time = jsondata.group_schedule_start_datetime.concat(jsondata.offTimeArray_start_date);
    // var all_end_date_time = jsondata.group_schedule_end_datetime.concat(jsondata.offTimeArray_end_date);
    // var classlen = jsondata.classTimeArray_start_date.length;
    // for(var i=0; i<classlen; i++){
    //     if(jsondata.class_group_schedule_id[i] == "None"){
    //         all_start_date_time.push(jsondata.classTimeArray_start_date[i]);
    //         all_end_date_time.push(jsondata.classTimeArray_end_date[i]);
    //     }
    // }

    let all_start_date_time = [];
    let all_end_date_time = [];

    jsondata.forEach( (plan) => {
        all_start_date_time.push(plan.start);
        all_end_date_time.push(plan.end);
    })

    var disable_time_array_start_date = all_start_date_time;
    var disable_time_array_end_date = all_end_date_time;

    //중복일정시 Test
    var new_disable_time_array_start_date = [];
    var new_disable_time_array_end_date =[];
    for(var n=0; n<disable_time_array_start_date.length; n++){
        if(disable_time_array_end_date[n] == "00:00"){
            disable_time_array_end_date[n] = "24:00";
        }
        new_disable_time_array_start_date.push(disable_time_array_start_date[n]);
        new_disable_time_array_end_date.push(disable_time_array_end_date[n]);
    }
    var check_duplication = true; // 시작시 중복이 있다고 가정
    var resultStart_Array = new_disable_time_array_start_date; // 시작시각 결과 값
    var resultEnd_Array = new_disable_time_array_end_date; // 종료시각 결과 값
    var error_check = 0; //에러 방지 코드

    while(check_duplication){ // 중복된 값이 있는지 체크 (최대 3번 돌아감)
        error_check++;
        check_duplication = false; // 중복된 값이 없다고 초기값 셋팅

        var temp_resultStart_Array = resultStart_Array; //중복 검사를 위해 중복 걸러진 시작 값 셋팅
        var temp_resultEnd_Array = resultEnd_Array; //중복 검사를 위해 중복 걸러진 종료 값 셋팅
        resultStart_Array = []; // 시작시각 결과 값 비우기
        resultEnd_Array = []; // 종료시각 결과 값 비우기

        //중복 걸러진 시작값 갯수 기준으로 시작
        var temp_result_start_array_length = temp_resultStart_Array.length;
        for(var i=0; i<temp_result_start_array_length; i++){
            //비교 대상 셋팅
            var s_time = temp_resultStart_Array[i];
            var e_time = temp_resultEnd_Array[i];
            var start_time_temp = temp_resultStart_Array[i];
            var end_time_temp = temp_resultEnd_Array[i];

            // 비교 대상은 중복 걸러진 시작값중 자신 제외한 모든 값
            for(var j=0; j<temp_result_start_array_length; j++){
                if(i==j){//자기 자신인 경우 제외 (중복 체크가 되어버림)
                    continue;
                }
                var s_time_compare = temp_resultStart_Array[j];
                var e_time_compare = temp_resultEnd_Array[j];

                // 중복 체크후 합치기 (일정 같은 경우 포함)

                if (know_whether_plans_has_duplicates(s_time, e_time, s_time_compare, e_time_compare) > 0) {
                    var merged_time = compare_times_to_merge_min_max(start_time_temp, end_time_temp, temp_resultStart_Array[j], temp_resultEnd_Array[j]);
                    start_time_temp = merged_time.start;
                    end_time_temp = merged_time.end;
                    check_duplication = true; // 중복된 값 체크
                }

            }

            //시작 시각과 종료시각이 같은 일정이 있는지 확인
            var check_equal_time = false;
            var start_time_temp_index = resultStart_Array.indexOf(start_time_temp);
            if(start_time_temp_index != -1){
                if(resultEnd_Array[start_time_temp_index]==end_time_temp){
                    check_equal_time = true;
                }
            }
            //시작 시각과 종료시각이 같은 일정이 없으면 결과값에 추가
            if(!check_equal_time){
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

function know_whether_plans_has_duplicates(starttime, endtime, starttime_compare, endtime_compare){
    if( compare_time(starttime_compare, starttime) && compare_time(endtime, endtime_compare)  ){  //비교대상 시간이 비교시간안에 쏙 들어갈때
        return 1;
    }else if( compare_time(starttime, starttime_compare) == false  && compare_time(endtime, starttime_compare) && compare_time(endtime, endtime_compare) == false){ //비교 대상 시간의 시작시간이 비교시간안에 들어가 있을때
        return 2;
    }else if( compare_time(starttime_compare, starttime) == false && compare_time(endtime_compare, starttime) && compare_time(endtime_compare, endtime) == false){ //비교 대상 시간의 종료시간이 비교 시간 안에 들어가 있을때
        return 3;
    }else if( compare_time(starttime, starttime_compare) && compare_time(endtime_compare, endtime) ){ //비교 대상 시간이 비교시간을 완전히 감쌀때
        return 4;
    }else if(starttime == starttime_compare && endtime == endtime_compare){
        return 5;
    }else{
       return 0;
    }
}

function compare_time(time1, time2){
	var hour1 = time1.split(':')[0];
	var min1  = time1.split(':')[1];
	var hour2 = time2.split(':')[0];
	var min2  = time2.split(':')[1];

	var time1_num = hour1+min1;
	var time2_num = hour2+min2;

	if(Number(time1_num) > Number(time2_num) ){
		return true;
	}else{
		return false;
	}
}

function compare_times_to_merge_min_max(stime1, etime1, stime2, etime2){
    var timearray = [stime1, stime2, etime1, etime2];
    var stime_new;
    var etime_new;
    timearray.sort();

    stime_new = timearray[0];
    etime_new = timearray[3];

    return {"start":`${stime_new}`, "end":`${etime_new}`}
}

function array_element_count(array, wanted){
    var counts = {};
    var len = array.length;
    for(var i=0; i<len; i++){
        counts[array[i]] = 0;
    }
    for(var j=0; j<len; j++){
        counts[array[j]] = counts[array[j]] +1;
    }
    return counts[wanted];
}

function duplicated_plans(jsondata){
    // 1:1 일정 / 그룹 일정 / OFF 일정 합치기
    // var testArray_start = jsondata.group_schedule_start_datetime.concat(jsondata.offTimeArray_start_date);
    // var testArray_end = jsondata.group_schedule_end_datetime.concat(jsondata.offTimeArray_end_date);
    // var classlen = jsondata.classTimeArray_start_date.length;
    // for(var i=0; i<classlen; i++){
    //     if(jsondata.group_schedule_id.indexOf(jsondata.class_group_schedule_id[i]) == -1 ){
    //         testArray_start.push(jsondata.classTimeArray_start_date[i]);
    //         testArray_end.push(jsondata.classTimeArray_end_date[i]);
    //     }
    // }
    let result_data = [...jsondata];

    let testArray_start = [];
    let testArray_end = [];

    jsondata.forEach( (plan) => {
        testArray_start.push(plan.start);
        testArray_end.push(plan.end);
    })

    var duplicate_dic = {};

    //중복일정을 큰 덩어리로 가져오기
    var clear_result = clear_duplicated_time(jsondata);
    schedule_data_cleared_duplicates_cache = clear_result;

    var clear_start_date = clear_result.clear_start_array;
    var clear_end_date = clear_result.clear_end_array;

    var len1 = clear_start_date.length;
    var len2 = testArray_start.length;

    for(var i=0; i<len1; i++){

        var duplicated = 0;

        var time = clear_start_date[i];

        // 종료 날짜 / 시각
        var endtime = clear_end_date[i];

        duplicate_dic[time+' ~ '+endtime] = [];

        // 중복 검사
        for(var j=0; j<len2; j++){

            // 시작 날짜 / 시각
            var time_c = testArray_start[j];

            // 종료 날짜 / 시각
            var endtime_c = testArray_end[j];

            // ~ 24:00:00 일정 처리
            if(endtime_c == "00:00"){
                // 날짜 하루 빼기 수정(사용 x) - hkkim 20190108
                endtime_c = "24:00";
            }
            
            //겹치는 걸 센다.
            var duplication_type = know_whether_plans_has_duplicates(time, endtime, time_c, endtime_c);
            if(duplication_type > 0) { //겹칠때
                duplicate_dic[clear_start_date[i]+' ~ '+clear_end_date[i]].push(testArray_start[j]+' ~ '+testArray_end[j]);
                duplicated++;
            }
            
        }
    }
    var result = {};

    //겹치지 않는 합쳐진 일정
    let pp = 0;
    for(var plan_ in duplicate_dic){
        var temp_index = [];
        var temp_celldivide;

        // 겹치는 일정 sorting
        var array_sorted = duplicate_dic[plan_].sort();

        for(var t=0; t<array_sorted.length; t++){
            // 기본값 셋팅
            var ref = array_sorted[t];
            if(t == 0){
                temp_index[t] = 0; //가장 첫번째 값은 항상 왼쪽 첫번째로 고정 위치
                continue;
            }
            var check_duplication = false;
            // 비교 대상 확인
            for(var r=0; r<array_sorted.length; r++){
                var comp = array_sorted[r];
                if(t == r){
                    break;
                }
                var ref_split = ref.split(' ~ ');
                var ref_start_time = ref_split[0];
                var ref_end_time = ref_split[1];
                var comp_split = comp.split(' ~ ');
                var comp_start_time = comp_split[0];
                var comp_end_time = comp_split[1];

                if(ref_end_time == "00:00"){
                    ref_end_time = "24:00";
                }
                if(comp_end_time == "00:00"){
                    comp_end_time = "24:00";
                }
                var duplication_type = know_whether_plans_has_duplicates(ref_start_time, ref_end_time,
                                                                         comp_start_time, comp_end_time);

                if(duplication_type > 0){ //겹칠때
                    check_duplication = true;
                }else{ //겹치지 않을때
                    // 지금 비교 조건에서는 겹치지 않았지만 정말 들어갈수 있는지 전체 array에서 검사
                    //이 인덱스(위치)와 같은 값을 갖는 다른 시간대가 있는지 검사
                    var howmany = array_element_count(temp_index, temp_index[r]);
                    var index_move = 0;
                    var check_ = 0;
                    //같은 위치에 있는 일정들 검사 (같은 위치지만 시간이 다르면 겹치지 않을 수 있으므로)
                    for(var z=0; z<howmany; z++){
                        var index_loc = temp_index.indexOf(temp_index[r], index_move);
                        index_move = index_loc+1;

                        if(t != index_loc){

                            var ref_split = array_sorted[t].split(' ~ ');
                            var ref_start_time = ref_split[0];
                            var ref_end_time = ref_split[1];

                            var comp_split = array_sorted[index_loc].split(' ~ ');
                            var comp_start_time = comp_split[0];
                            var comp_end_time = comp_split[1];

                            if(ref_end_time == "00:00"){
                                ref_end_time = "24:00";
                            }
                            if(comp_end_time == "00:00"){
                                comp_end_time = "24:00";
                            }
                            var duplication_type_ = know_whether_plans_has_duplicates(ref_start_time, ref_end_time,
                                                                                      comp_start_time, comp_end_time);
                            if(duplication_type_ > 0){
                                check_++;
                            }else{
                                continue;
                            }
                        }
                    }
                    if(check_ > 0){ //겹치는게 존재
                        check_duplication = true;
                    }else{ //겹치는게 없음
                        temp_index[t] = temp_index[r];
                        break;
                    }
                }

                if(check_duplication == true){
                    var temp_array = [];
                    for(var i=0; i<=r; i++){
                        temp_array.push(temp_index[i]);
                    }
                    temp_index[t] = Math.max.apply(null, temp_array)+1;
                }
            }
        }

        temp_celldivide = Math.max.apply(null, temp_index) +1;

        for(let p=0; p<temp_index.length; p++){
            result_data[pp].duplicated_index = temp_index[p]
            result_data[pp].duplicated_cell = temp_celldivide
            pp++
        }
        
    }

    return result_data;
}
// 중복일정 관련 함수
// 중복일정 관련 함수



