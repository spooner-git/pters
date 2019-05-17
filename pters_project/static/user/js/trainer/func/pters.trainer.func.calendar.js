// 달력 관련

class Calendar {
    constructor(targetHTML, instance){
        this.targetHTML = targetHTML;
        this.instance = instance;
        this.last_page_num = 2;
        this.first_page_num = 0;

        let d = new Date();
        this.current_year = d.getFullYear();
        this.current_month = d.getMonth()+1;
        this.current_date = d.getDate();

        // this.init();
    }

    init(){
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page
        // $(this.targetHTML).html(
        //     component.initial_page
        // )
        this.render_month_cal( (this.last_page_num+this.first_page_num)/2 ,this.current_year, this.current_month);
    }

    get_current_month(){
        console.log("year", this.current_year, "month", this.current_month)
        return {
            "year": this.current_year, "month": this.current_month
        }
    }

    get_prev_month(){
        let prev_month = this.current_month-1 < 0 ? 12 : this.current_month - 1;
        let year = this.current_month-1 < 1 ? this.current_year-1 : this.current_year;
        console.log("year", year, "month", prev_month)
        return {
            "year":year, "month": prev_month
        }
    }

    get_next_month(){
        let next_month = this.current_month+1 > 12 ? 1 : this.current_month + 1;
        let year = this.current_month+1 > 12 ? this.current_year+1 : this.current_year;
        console.log("year", year, "month", next_month)
        return {
            "year":year, "month": next_month
        }
    }

    move_month(direction){
        switch(direction){
            case "next":
                this.current_year = this.current_month + 1 > 12 ? this.current_year +1 : this.current_year;
                this.current_month = this.current_month +1 > 12 ? 1 : this.current_month + 1;
                this.render_month_cal((this.last_page_num+this.first_page_num)/2, this.current_year, this.current_month)
                // $(this.targetHTML).append(`<div id="page${this.last_page_num+1}"></div>`)
                // this.last_page_num++;
            break;

            case "prev":
                this.current_year = this.current_month - 1 < 1 ? this.current_year - 1 : this.current_year;
                this.current_month = this.current_month - 1 < 1 ? 12 : this.current_month - 1;
                this.render_month_cal((this.last_page_num+this.first_page_num)/2, this.current_year, this.current_month)
                // $(this.targetHTML).prepend(`<div id="page${this.first_page_num-1}"></div>`)
                // this.first_page_num--;
            break;
        }
    }

    move_week(direction){
        switch(direction){
            case "next":
            break;

            case "prev":
            break;
        }
    }

    switch_cal_type(){

    }
    
    render_month_cal(page, year, month){ //월간 달력 렌더링 (연, 월)
        let weeks_div = [];
        for(let i=0; i<6; i++){
            weeks_div = [...weeks_div, this.draw_week_line_for_month_calendar(year, month, i, 'popup_alert_month')];
        }
        let component = this.static_component();
        // $(`#page${page}`).html(component.month_cal_upper_box + weeks_div.join(''));
        document.querySelector(`#page${page}`).innerHTML = component.month_cal_upper_box + weeks_div.join('');
    }

    render_week_cal(page ,year, month, week){ //주간 달력 렌더링 (연, 월, 몇번째 주)
        let data = this.draw_week_line_for_month_calendar(year, month, week, 'popup_alert_week');
        $(`#page${page}`).html(data);
        document.querySelector(`#page${page}`).innerHTML = data;
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

    draw_week_line_for_month_calendar(year, month, week, onclick_func){ //(연,월, 몇번째 주, 날짜 클릭 콜백함수 이름)
        let week_dates_info = this.get_week_dates(year, month, week);
        let _year = week_dates_info.year;
        let _month = week_dates_info.month;
        let _date = week_dates_info.date;
        let _color = week_dates_info.color;

        let schedule_data = this.dummy_schedule_data_for_test();

        let schedule_num = [];
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

        return(
            week_dates_info == false 
            ? 
            `<div class="cal_week_line">
                <div style="background-image:url('/static/user/res/PTERS_logo_pure.png');background-position:center;background-repeat:no-repeat;background-size:100px;height:30px;"></div>
            </div>`
            :
            `<div class="cal_week_line"">
                <div class=${_color[0]} onClick="${onclick_func}(${_year[0]}, ${_month[0]}, ${_date[0]})">${_date[0]}<div class="calendar_schedule_display_month ${schedule_num[0]!=0?"has_schedule":""}">${schedule_num[0]!=0?schedule_num[0]:""}</div></div>
                <div class=${_color[1]} onClick="${onclick_func}(${_year[1]}, ${_month[1]}, ${_date[1]})">${_date[1]}<div class="calendar_schedule_display_month ${schedule_num[1]!=0?"has_schedule":""}">${schedule_num[1]!=0?schedule_num[1]:""}</div></div>
                <div class=${_color[2]} onClick="${onclick_func}(${_year[2]}, ${_month[2]}, ${_date[2]})">${_date[2]}<div class="calendar_schedule_display_month ${schedule_num[2]!=0?"has_schedule":""}">${schedule_num[2]!=0?schedule_num[2]:""}</div></div>
                <div class=${_color[3]} onClick="${onclick_func}(${_year[3]}, ${_month[3]}, ${_date[3]})">${_date[3]}<div class="calendar_schedule_display_month ${schedule_num[3]!=0?"has_schedule":""}">${schedule_num[3]!=0?schedule_num[3]:""}</div></div>
                <div class=${_color[4]} onClick="${onclick_func}(${_year[4]}, ${_month[4]}, ${_date[4]})">${_date[4]}<div class="calendar_schedule_display_month ${schedule_num[4]!=0?"has_schedule":""}">${schedule_num[4]!=0?schedule_num[4]:""}</div></div>
                <div class=${_color[5]} onClick="${onclick_func}(${_year[5]}, ${_month[5]}, ${_date[5]})">${_date[5]}<div class="calendar_schedule_display_month ${schedule_num[5]!=0?"has_schedule":""}">${schedule_num[5]!=0?schedule_num[5]:""}</div></div>
                <div class=${_color[6]} onClick="${onclick_func}(${_year[6]}, ${_month[6]}, ${_date[6]})">${_date[6]}<div class="calendar_schedule_display_month ${schedule_num[6]!=0?"has_schedule":""}">${schedule_num[6]!=0?schedule_num[6]:""}</div></div>
            </div>`
        )
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
                    console.log(jsondata.messageArray);
                }else{
                    console.log(jsondata);
                    callback();
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
                "month_cal_upper_box":` <div>${this.current_year}-${this.current_month}</div>
                                        <div><button onclick="${this.instance}.move_month('prev')">이전</button><button onclick="${this.instance}.move_month('next')">다음</button></div>
                                        <div class="cal_week_line">
                                            <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
                                        </div>`
                ,
                "week_cal_upper_box":`<div>
                                            <div>시간</div><div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
                                        </div>`
                ,
                "week_time_line":`<div class="week_time_line>
                                    <div>시간</div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                                  </div>
                                  `
                ,
                "initial_page":`<div id="page0"></div><div id="page1"></div><div id="page2"></div>`
            }
        )
    }

    dummy_schedule_data_for_test(){
        return(
            {  "2019-05-07":[ 
                                {"start":"08:00", "end":"09:00", "finished":false, "type":"private"},
                                {"start":"09:00", "end":"10:00", "finished":false, "type":"private"},
                                {"start":"11:00", "end":"12:00", "finished":false, "type":"private"},
                                {"start":"13:00", "end":"14:00", "finished":false, "type":"private"},
                                {"start":"15:00", "end":"16:00", "finished":true, "type":"private"},
                                {"start":"17:00", "end":"18:00", "finished":false, "type":"group", "reserved":5, "max":5},
                                {"start":"19:00", "end":"20:00", "finished":false, "type":"group", "reserved":3, "max":5} 
                            ],
                "2019-05-22":[ 
                                {"start":"08:00", "end":"09:00", "finished":false, "type":"private"},
                                {"start":"11:00", "end":"13:00", "finished":false, "type":"private"} 
                            ],
                "2019-05-24":[ 
                                {"start":"06:00", "end":"08:00", "finished":false, "type":"private"},
                                {"start":"08:00", "end":"11:00", "finished":false, "type":"private"},
                                {"start":"20:00", "end":"21:00", "finished":false, "type":"private"},

                            ],
                            "2019-05-07":[ 
                                {"start":"08:00", "end":"09:00", "finished":false, "type":"private"},
                                {"start":"09:00", "end":"10:00", "finished":false, "type":"private"},
                                {"start":"11:00", "end":"12:00", "finished":false, "type":"private"},
                                {"start":"13:00", "end":"14:00", "finished":false, "type":"private"},
                                {"start":"15:00", "end":"16:00", "finished":true, "type":"private"},
                                {"start":"17:00", "end":"18:00", "finished":false, "type":"group", "reserved":5, "max":5},
                                {"start":"19:00", "end":"20:00", "finished":false, "type":"group", "reserved":3, "max":5} 
                            ],
                "2019-06-05":[ 
                                {"start":"08:00", "end":"09:00", "finished":false, "type":"private"},
                                {"start":"11:00", "end":"13:00", "finished":false, "type":"private"} 
                            ],
                "2019-06-17":[ 
                                {"start":"06:00", "end":"08:00", "finished":false, "type":"private"},
                                {"start":"08:00", "end":"11:00", "finished":false, "type":"private"},
                                {"start":"20:00", "end":"21:00", "finished":false, "type":"private"},

                            ],
            }
        )
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


