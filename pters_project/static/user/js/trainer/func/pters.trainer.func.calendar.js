// 달력 관련

class Calendar {
    constructor(targetHTML, instance){
        this.window_height = window.innerHeight;
        this.pages_height = this.window_height - 102-45;

        this.targetHTML = targetHTML;
        this.subtargetHTML = 'calendar_wrap';
        this.instance = instance;
        
        this.cal_type = "week";
        this.current_page_num = 1;

        let d = new Date();
        this.current_year = d.getFullYear();
        this.current_month = d.getMonth()+1;
        this.current_date = d.getDate();
        this.current_week = Math.ceil( (this.current_date + new Date(this.current_year, this.current_month, 1).getDay() )/7 ) - 1;

        this.worktime = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        console.log("this.current_week", this.current_week)
        // this.init();
    }

    init(cal_type){
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page

        this.cal_type = cal_type;
        switch(cal_type){
            case "month":
                this.render_month_cal( this.current_page_num ,this.current_year, this.current_month);
                this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 31, (jsondata, date) => {
                    if(date == `${this.current_year}-${this.current_month}-01`){
                        this.render_month_cal( this.current_page_num, this.current_year, this.current_month, jsondata);
                    }
                })
                this.toggle_touch_move('on', '#calendar_wrap');
            break;

            case "week":
                this.render_week_cal(this.current_page_num , this.current_year, this.current_month, this.current_week);
                this.request_schedule_data(`${this.current_year}-${this.current_month}-01`, 31, (jsondata, date) => {
                    if(date == `${this.current_year}-${this.current_month}-01`){
                        this.render_week_cal( this.current_page_num, this.current_year, this.current_month, this.current_week, jsondata);
                        this.week_schedule_draw(this.current_year, this.current_month, this.current_week, jsondata)
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
        if(week - 1 < -1){
            week = Math.ceil( ( new Date(prev_month == 12 ? prev_year: year, prev_month-1, 1).getDay() + new Date(prev_month == 12 ? prev_year: year, prev_month, 0).getDate()  )/7 - 1  )
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
        if(week + 1 > week_num_this_month){
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
                console.log(prev)
                

                /*페이지 삽입*/
                this.current_page_num = this.current_page_num - 1;
                this.prepend_child(this.subtargetHTML, 'div', this.current_page_num)
                /*페이지 삽입*/

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
    
    render_month_cal(page, year, month, schedule_data){ //월간 달력 렌더링 (연, 월)
        if(schedule_data == undefined){
            schedule_data = false;
        }
        let weeks_div = [];
        for(let i=0; i<6; i++){
            weeks_div = [...weeks_div, this.draw_week_line(year, month, i, schedule_data,'popup_alert_month')];
        }
        let component = this.static_component();
        document.getElementById(`page${page}`).innerHTML = weeks_div.join('');
        document.getElementById('cal_display_panel').innerHTML = component.month_cal_upper_box;
        func_set_webkit_overflow_scrolling(`#page${page}`);
    }

    render_week_cal(page ,year, month, week, schedule_data){ //주간 달력 렌더링 (연, 월, 몇번째 주)
        let component = this.static_component();
        let data = this.draw_week_line(year, month, week, schedule_data, 'popup_alert_week', "week");
        
        document.getElementById(`page${page}`).innerHTML = data;
        document.getElementById('cal_display_panel').innerHTML = component.week_cal_upper_box;
        func_set_webkit_overflow_scrolling(`#page${page}`);
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
        let finished = false;
        for(let i=0; i<=week; i++){
            let yearCellsToJoin = [];
            let monthCellsToJoin = [];
            let dateCellsToJoin = [];
            let dateColorClass = [];
            for(let j=0; j<7; j++){
                if(i==0 && j<firstday_this_month){ //첫번째 주일때 처리
                    yearCellsToJoin.unshift(Number(month)-1 > 0 ? Number(year) : Number(year) - 1);
                    monthCellsToJoin.unshift(Number(month)-1);
                    dateCellsToJoin.unshift(lastday_prev_month-j);
                    dateColorClass.unshift('cal_font_color_grey');
                }else if(date_cache > lastday_this_month){ // 마지막 날짜가 끝난 이후 처리
                    if(date_cache == lastday_this_month+1){
                        date_cache = 1;
                        finished = true;
                    }
                    yearCellsToJoin.push(Number(month)+1 > 12 ? Number(year)+1 : year);
                    monthCellsToJoin.push(Number(month)+1);
                    dateCellsToJoin.push(date_cache);
                    dateColorClass.push('cal_font_color_grey');
                    date_cache++
                }else{
                    yearCellsToJoin.push(Number(year));
                    monthCellsToJoin.push(Number(month));
                    dateCellsToJoin.push(date_cache);
                    dateColorClass.push( finished == true ? 'cal_font_color_grey' : 'cal_font_color_black');
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

        let week_html_template = this.week_schedule_draw(year, month, week, schedule_data);

        return(
            week_dates_info == false 
            ? 
            `<div class="cal_week_line">
                <div style="background-image:url('/static/user/res/PTERS_logo_pure.png');background-position:center;background-repeat:no-repeat;background-size:100px;height:30px;"></div>
            </div>`
            :
            `<div class="cal_week_line" style="${month_or_week == "week" ? `position:sticky;position:-webkit-sticky;top:0;background-color:#ffffff;z-index:10` : ""}">
                ${month_or_week == "week" ? `<div class="week_cal_time_text">시간</div>` : ""}
                <div class=${_color[0]} onClick="${onclick_func}(${_year[0]}, ${_month[0]}, ${_date[0]})">${_date[0]}<div class="calendar_schedule_display_month ${schedule_num[0]!=0?"has_schedule":""}">${schedule_num[0]!=0?schedule_num[0]:""}</div></div>
                <div class=${_color[1]} onClick="${onclick_func}(${_year[1]}, ${_month[1]}, ${_date[1]})">${_date[1]}<div class="calendar_schedule_display_month ${schedule_num[1]!=0?"has_schedule":""}">${schedule_num[1]!=0?schedule_num[1]:""}</div></div>
                <div class=${_color[2]} onClick="${onclick_func}(${_year[2]}, ${_month[2]}, ${_date[2]})">${_date[2]}<div class="calendar_schedule_display_month ${schedule_num[2]!=0?"has_schedule":""}">${schedule_num[2]!=0?schedule_num[2]:""}</div></div>
                <div class=${_color[3]} onClick="${onclick_func}(${_year[3]}, ${_month[3]}, ${_date[3]})">${_date[3]}<div class="calendar_schedule_display_month ${schedule_num[3]!=0?"has_schedule":""}">${schedule_num[3]!=0?schedule_num[3]:""}</div></div>
                <div class=${_color[4]} onClick="${onclick_func}(${_year[4]}, ${_month[4]}, ${_date[4]})">${_date[4]}<div class="calendar_schedule_display_month ${schedule_num[4]!=0?"has_schedule":""}">${schedule_num[4]!=0?schedule_num[4]:""}</div></div>
                <div class=${_color[5]} onClick="${onclick_func}(${_year[5]}, ${_month[5]}, ${_date[5]})">${_date[5]}<div class="calendar_schedule_display_month ${schedule_num[5]!=0?"has_schedule":""}">${schedule_num[5]!=0?schedule_num[5]:""}</div></div>
                <div class=${_color[6]} onClick="${onclick_func}(${_year[6]}, ${_month[6]}, ${_date[6]})">${_date[6]}<div class="calendar_schedule_display_month ${schedule_num[6]!=0?"has_schedule":""}">${schedule_num[6]!=0?schedule_num[6]:""}</div></div>
            </div>
            ${month_or_week == "week" ? week_html_template: ""}`
        )
    }

    week_schedule_draw(year, month, week, schedule_data){
        let week_dates_info = this.get_week_dates(year, month, week);
        let _year = week_dates_info.year;
        let _month = week_dates_info.month;
        let _date = week_dates_info.date;
        let _color = week_dates_info.color;

        let schedules = [];
        if(schedule_data){
            for(let i=0; i<7; i++){
                if(week_dates_info == false){
                    continue;
                }

                let date_to_search = date_format(`${_year[i]}-${_month[i]}-${_date[i]}`)["yyyy-mm-dd"];
                if(date_to_search in schedule_data){
                    schedules.push(
                            schedule_data[date_to_search].map( (plan) => { 
                                let diff = time_diff(plan.start, plan.end);
                                let tform_s = time_form(plan.start);
                                let styles = `height:${diff.hour*40+diff.minute/60}px;top:${tform_s.hour*40 + tform_s.minute/60}px`;
                                return `<div onclick="alert('${date_to_search} ${plan.start}~${plan.end}')" class="calendar_schedule_display_week" style="${styles}"></div>`;
                             })
                    );
                }else{
                    schedules.push([]);
                }
            }
        }else{
            schedules = [];
        }

        console.log('schedules', schedules)

        
        let week_html_template = `
                                <div class="week_row">
                                    <div>${ (this.worktime.map( (t) => { return `<article>${t}:00</article>` } )).join('') }</div>
                                    <div>${schedules.length > 0 ?  schedules[0].join('') : ""}</div>
                                    <div>${schedules.length > 0 ?  schedules[1].join('') : ""}</div>
                                    <div>${schedules.length > 0 ?  schedules[2].join('') : ""}</div>
                                    <div>${schedules.length > 0 ?  schedules[3].join('') : ""}</div>
                                    <div>${schedules.length > 0 ?  schedules[4].join('') : ""}</div>
                                    <div>${schedules.length > 0 ?  schedules[5].join('') : ""}</div>
                                    <div>${schedules.length > 0 ?  schedules[6].join('') : ""}</div>
                                </div>
                                `;
        return week_html_template;
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
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    console.log("에러:" + jsondata.messageArray);
                }else{
                    callback(jsondata, date_);
                    console.log(jsondata)
                    return jsondata;
                }

            },

            complete:function(){

            },

            error:function(){
                console.log('server error');
            }
        });
    }


    static_component(){
        return(
            {
                "month_cal_upper_box":` <div onclick="${this.instance}.switch_cal_type()"><span class="display_year">${this.current_year}</span><span class="display_month">${this.current_month}</span><img src="/static/common/icon/icon_swap.png"></div>
                                        <div><button onclick="${this.instance}.move_month('prev')">이전</button><button onclick="${this.instance}.move_month('next')">다음</button></div>
                                        <div class="cal_week_line_dates">
                                            <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
                                        </div>`
                ,
                "week_cal_upper_box":`
                                        <div onclick="${this.instance}.switch_cal_type()"><span class="display_year">${this.current_year}</span><span class="display_month">${this.current_month}</span><img src="/static/common/icon/icon_swap.png"></div>
                                        <div><button onclick="${this.instance}.move_week('prev')">이전</button><button onclick="${this.instance}.move_week('next')">다음</button></div>
                                        <div class="cal_week_line_dates">
                                            <div class="week_cal_time_text"></div><div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
                                        </div>`
                                        
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

function popup_alert_month(y, m, d){
    alert(`월간 날짜 클릭 ${y} ${m} ${d}`)
}

function popup_alert_week(y, m, d){
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



