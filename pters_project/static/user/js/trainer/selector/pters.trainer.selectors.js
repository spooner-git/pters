//시간 선택 (시작시간, 종료시간)
class TwoTimeSelector{
    constructor(target, instance, user_option){
        this.targetHTML = target;
        this.result_target;

        this.data;
        this.instance = instance;
        this.hour_scroll;
        this.hour2_scroll;
        this.user_scroll_hour = false;
        this.user_scroll_minute = false;
        this.hour_scroll_snapped = 0;

        document.querySelector(this.targetHTML).innerHTML = this.static_component().initial_html;

        this.default_option = {
                                time_start : this.current_year - 100,
                                time_end : this.current_year,
                                init_time1 : 1986,
                                init_time2 : 2
                            }
        if(user_option != undefined){
            //user_option이 들어왔을경우 default_option의 값을 user_option값으로 바꿔준다.
            for(let option in user_option){
                this.default_option[option] = user_option[option];
            }
        }

        this.init();
    }

    init(){
        this.render_time1_list();
        this.render_time2_list();
        this.set_iscroll();
        this.reset();
    }

    reset(result_target1, result_target2, init_hour, init_minute){
        let d = new Date();
        let h = d.getHours();
        let m = d.getMinutes();
        this.go_snap(init_hour == undefined? h : init_hour, init_minute == undefined? m : init_minute);
    }

    render_time1_list(){
        let html_to_join = [];
        let pos = 0;
        for(let i=0; i<24; i++){
            for(let j=0; j<60; j=j+5){
                html_to_join.push(`<li data-spos=${pos}>${i < 10 ? '0'+i : i }:${j < 10 ? '0'+j : j}</li>`);
                pos = pos + 50;
            }
        }

        let html = `
                        <div id="hour_wrap_${this.instance}" class="select_wrapper_child">
                            <ul>
                                <li></li>
                                ${html_to_join.join('')}
                                <li></li>
                            </ul>
                        </div>
                        <div class="selector_unit">시작</div>
                    `
        document.querySelector(`${this.targetHTML} .time_selector_time1_wrap`).innerHTML = html;
    }

    render_time2_list(){
        let html_to_join = [];
        let pos = 0;
        for(let i=0; i<24; i++){
            for(let j=0; j<60; j=j+5){
                html_to_join.push(`<li data-epos=${pos}>${i < 10 ? '0'+i : i }:${j < 10 ? '0'+j : j}</li>`);
                pos = pos + 50;
            }
        }

        let html = `
                        <div id="hour2_wrap_${this.instance}" class="select_wrapper_child">
                            <ul>
                                <li></li>
                                ${html_to_join.join('')}
                                <li></li>
                            </ul>
                        </div>
                        <div class="selector_unit">종료</div>
                    `

        document.querySelector(`${this.targetHTML} .time_selector_time2_wrap`).innerHTML = html;
    }

    set_iscroll(){
        this.hour_scroll = new IScroll(`#hour_wrap_${this.instance}`,{
                            mouseWheel : true,
                            deceleration:0.002,
                            bounce: false
                            // snap: 'li'
                        })
                        //default : 0.0006, 0.01 (no momentum);

        this.hour2_scroll = new IScroll(`#hour2_wrap_${this.instance}`,{
                            mouseWheel : true,
                            deceleration:0.002,
                            bounce: false
                            // snap: 'li'
        })
        this.set_scroll_snap();
    }

    set_scroll_snap(){
        let self = this;
        
        self.hour_scroll.on('scrollEnd', function (){
            if(self.user_scroll_hour == true){
                self.user_scroll_hour = false;
                let posY = this.y;
                let min = posY-posY%50;
                let max = min - 50;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                self.hour_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                $(`${self.targetHTML} li[data-spos="${Math.abs(self.hour_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.targetHTML} li[data-spos="${Math.abs(self.hour_scroll.y)}"]`).css('color', '#1e1e1e');
                self.hour_scroll_snapped = snap;
                self.hour2_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                $(`${self.targetHTML} li[data-epos="${Math.abs(self.hour2_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.targetHTML} li[data-epos="${Math.abs(self.hour2_scroll.y)}"]`).css('color', '#1e1e1e');
            }
        })

        self.hour_scroll.on('beforeScrollStart', function (){
            self.user_scroll_hour = true;
        })

        
        self.hour2_scroll.on('scrollEnd', function (){
            if(self.user_scroll_minute == true){
                self.user_scroll_minute = false;
                let posY = this.y;
                let min = posY-posY%50;
                let max = min - 50;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                if(snap > self.hour_scroll_snapped){
                    self.hour2_scroll.scrollTo(0, self.hour_scroll_snapped, 0, IScroll.utils.ease.bounce);
                    show_error_message('종료시간이 시작시간보다 빠릅니다.')
                }else{
                    self.hour2_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                }
                
                $(`${self.targetHTML} li[data-epos="${Math.abs(self.hour2_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.targetHTML} li[data-epos="${Math.abs(self.hour2_scroll.y)}"]`).css('color', '#1e1e1e');
                
            }
        })

        self.hour2_scroll.on('beforeScrollStart', function (){
            self.user_scroll_minute = true;
        })
    }

    go_snap(hour, minute){
        let initial_pos = -(Number(hour)*600 + Math.round(Number(minute)/5)*5*10);
        this.hour_scroll.scrollTo(0, initial_pos, 0, IScroll.utils.ease.bounce);
        this.hour2_scroll.scrollTo(0, initial_pos, 0, IScroll.utils.ease.bounce);
        this.hour_scroll_snapped = initial_pos;

        $(`${this.targetHTML} li[data-spos="${Math.abs(this.hour_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.targetHTML} li[data-epos="${Math.abs(this.hour2_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.targetHTML} li[data-spos="${Math.abs(this.hour_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
        $(`${this.targetHTML} li[data-epos="${Math.abs(this.hour2_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
    }

    get_selected_data(){
        let start = $(`${this.targetHTML} li[data-spos="${Math.abs(this.hour_scroll.y)}"]`);
        let end = $(`${this.targetHTML} li[data-epos="${Math.abs(this.hour2_scroll.y)}"]`);

        let start_text = start.text();
        let end_text = end.text();

        return {
            start : start_text,
            end : end_text
        };
    }

    show_selected_time(){
        let result = this.get_selected_data();

        if(result.start == undefined || result.start == ''){
            show_error_message('시작시간 입력을 다시 해주세요.')
        }
        else if(result.end == undefined || result.end == ''){
            show_error_message('종료시간 입력을 다시 해주세요.')
        }
        else{
            show_error_message('시작:' + result.start + ' ~ ' + '종료:'+ result.end)
        }
    }

    set_selected_data(){
        let result = this.get_selected_data();
        $(this.result_target).val(result.start + ' - ' + result.end);
    }

    static_component(){
        return{
            "initial_html":`<div class="time_selector">
                                <div class="time_selector_confirm"><span onclick="${this.instance}.set_selected_data()">확인</span></div>
                                <div class="time_selector_time1_wrap select_wrapper"></div>
                                <div class="time_selector_time2_wrap select_wrapper"></div>
                                <div class="selector_indicator"></div>
                            </div>`
        }
    }
}

//날짜 선택 (년, 월, 일)
class DateSelector{
    constructor (install_target, target_instance, user_option){
        this.target = {install: install_target, result: target_instance};

        // this.data;
        // this.instance = instance;
        this.year_scroll;
        this.month_scroll;
        this.date_scroll;
        this.user_scroll_year = false;
        this.user_scroll_month = false;
        this.user_scroll_date = false;

        let d = new Date();
        this.date = {
            current_year : d.getFullYear(),
            current_month : d.getMonth()+1,
            current_date : d.getDate()
        };

        this.option = {
            myname:null,
            title:null,
            data:{
                year:null, month:null, date:null
            },
            range:{
                start: this.date.current_year - 100,
                end: this.date.current_year
            },
            callback_when_set : ()=>{
                return false;
            }
        };

        this.store = {
            text: null,
            data: {year:null, month:null, date:null}
        };

        if(user_option != undefined){
            //user_option이 들어왔을경우 default_option의 값을 user_option값으로 바꿔준다.
            for(let option in user_option){
                if(user_option[option] != null){
                    this.option[option] = user_option[option];
                }
            }
        }
        this.init();
    }

    set dataset (object){
        this.reset(object);
    }

    get dataset (){
        return this.store;
    }

    init (){
        this.init_html();
        this.render_year_list();
        this.render_month_list();
        this.render_date_list();
        this.set_iscroll();
        this.reset(this.option);
    }


    reset (object){
        let year = object.data.year == null ? this.date.current_year : object.data.year;
        let month = object.data.month == null ? this.date.current_month : object.data.month;
        let date = object.data.date == null ? this.date.current_date : object.data.date;
        this.store.data = {year: year, month:month, date:date};
        this.store.text = DateRobot.to_text(year, month, date);
        
        this.go_snap(year, month, date);
        //값을 저장하고, 스크롤 위치를 들어온 값으로 보낸다.
    }

    init_html (){
        //초기 html 생성
        document.querySelector(this.target.install).innerHTML = this.static_component().initial_html;
    }

    delete (){
        document.querySelector(this.target.install).innerHTML = "";
    }

    render_year_list (){
        let html_to_join = [];
        let pos = 0;
        let range_start = this.option.range.start == null ? this.date.current_year - 100 : this.option.range.start;
        let range_end = this.option.range.end == null ? this.date.current_year : this.option.range.end;
        for(let i=range_start; i<=range_end; i++){
            html_to_join.push(`<li data-ypos=${pos}>${i}</li>`);
            pos = pos + 40;
                       
        }

        let html = `
                        <div id="year_wrap_${this.instance}" class="select_wrapper_child">
                            <ul>
                                <li></li>
                                <li></li>
                                ${html_to_join.join('')}
                                <li></li>
                                <li></li>
                            </ul>
                        </div>
                        <div class="selector_unit">년</div>
                    `;


        document.querySelector(`${this.target.install} .date_selector_year_wrap`).innerHTML = html;
    }

    render_month_list (){
        let html_to_join = [];
        let pos = 0;
        for(let i=1; i<=12; i++){
            html_to_join.push(`<li data-mpos=${pos}>${i}</li>`);
            pos = pos + 40;
        }

        let html = `
                        <div id="month_wrap_${this.instance}" class="select_wrapper_child">
                            <ul>
                                <li></li>
                                <li></li>
                                ${html_to_join.join('')}
                                <li></li>
                                <li></li>
                            </ul>
                        </div>
                        <div class="selector_unit">월</div>
                    `;

        document.querySelector(`${this.target.install} .date_selector_month_wrap`).innerHTML = html;
    }

    render_date_list (){
        let html_to_join = [];
        let pos = 0;
        for(let i=1; i<=31; i++){
            html_to_join.push(`<li data-dpos=${pos}>${i}</li>`);
            pos = pos + 40; 
        }

        let html = `
                        <div id="date_wrap_${this.instance}" class="select_wrapper_child">
                            <ul>
                                <li></li>
                                <li></li>
                                ${html_to_join.join('')}
                                <li></li>
                                <li></li>
                            </ul>
                        </div>
                        <div class="selector_unit">일</div>
                    `;

        document.querySelector(`${this.target.install} .date_selector_date_wrap`).innerHTML = html;
    }

    set_iscroll (){
        this.year_scroll = new IScroll(`#year_wrap_${this.instance}`,{
                            mouseWheel : true,
                            deceleration:0.003,
                            bounce: false
                            // snap: 'li'
                        });

        this.month_scroll = new IScroll(`#month_wrap_${this.instance}`,{
                            mouseWheel : true,
                            deceleration:0.005,
                            bounce: false
                            // snap: 'li'
        });
        this.date_scroll = new IScroll(`#date_wrap_${this.instance}`,{
                            mouseWheel : true,
                            deceleration:0.005,
                            bounce: false
                            // snap: 'li'
        });
        this.set_scroll_snap();
    }

    set_scroll_snap (){
        let self = this;
        
        self.year_scroll.on('scrollEnd', function (){
            if(self.user_scroll_year == true){
                self.user_scroll_year = false;
                let posY = this.y;
                let min = posY-posY%40;
                let max = min - 40;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                self.year_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                $(`${self.target.install} li[data-ypos="${Math.abs(self.year_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.target.install} li[data-ypos="${Math.abs(self.year_scroll.y)}"]`).css('color', '#1e1e1e');
                self.year_scroll_snapped = snap;
            }
        });

        self.year_scroll.on('beforeScrollStart', function (){
            self.user_scroll_year = true;
        });

        
        self.month_scroll.on('scrollEnd', function (){
            if(self.user_scroll_month == true){
                self.user_scroll_month = false;
                let posY = this.y;
                let min = posY-posY%40;
                let max = min - 40;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                
                    
                self.month_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                $(`${self.target.install} li[data-mpos="${Math.abs(self.month_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.target.install} li[data-mpos="${Math.abs(self.month_scroll.y)}"]`).css('color', '#1e1e1e');
                
            }
        });

        self.month_scroll.on('beforeScrollStart', function (){
            self.user_scroll_month = true;
        });

        self.date_scroll.on('scrollEnd', function (){
            if(self.user_scroll_date == true){
                self.user_scroll_date = false;
                let posY = this.y;
                let min = posY-posY%40;
                let max = min - 40;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                
                    
                self.date_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                $(`${self.target.install} li[data-dpos="${Math.abs(self.date_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.target.install} li[data-dpos="${Math.abs(self.date_scroll.y)}"]`).css('color', '#1e1e1e');
                
            }
        });

        self.date_scroll.on('beforeScrollStart', function (){
            self.user_scroll_date = true;
        });
    }

    go_snap (year, month, date){
        let initial_pos_year = (this.option.range.start-year)*40;
        let initial_pos_month = (1-month)*40;
        let initial_pos_date = (1-date)*40;

        this.year_scroll.scrollTo(0, initial_pos_year, 0, IScroll.utils.ease.bounce);
        this.month_scroll.scrollTo(0, initial_pos_month, 0, IScroll.utils.ease.bounce);
        this.date_scroll.scrollTo(0, initial_pos_date, 0, IScroll.utils.ease.bounce);
        // this.hour_scroll_snapped = initial_pos;

        $(`${this.target.install} li[data-ypos="${Math.abs(this.year_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-mpos="${Math.abs(this.month_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-dpos="${Math.abs(this.date_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-ypos="${Math.abs(this.year_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
        $(`${this.target.install} li[data-mpos="${Math.abs(this.month_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
        $(`${this.target.install} li[data-dpos="${Math.abs(this.date_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
    }

    show_selected_date (){
        let year = $(`${this.target.install} li[data-ypos="${Math.abs(this.year_scroll.y)}"]`);
        let month = $(`${this.target.install} li[data-mpos="${Math.abs(this.month_scroll.y)}"]`);
        let date = $(`${this.target.install} li[data-dpos="${Math.abs(this.date_scroll.y)}"]`);

        let year_text = year.text();
        let month_text = month.text();
        let date_text = date.text();

        if(year_text == undefined || year_text == ''){
            show_error_message('[연도]를 다시 선택 해주세요.');
        }
        else if(month_text == undefined || month_text == ''){
            show_error_message('[월]을 다시 선택 해주세요.');
        }else if(date_text == undefined || date_text == ''){
            show_error_message('[일자]를 다시 선택 해주세요.');
        }
        else{
            show_error_message(`${year_text}년 ${month_text}월 ${date_text}일`);
        }
    }

    get_selected_data (){
        let year = $(`${this.target.install} li[data-ypos="${Math.abs(this.year_scroll.y)}"]`);
        let month = $(`${this.target.install} li[data-mpos="${Math.abs(this.month_scroll.y)}"]`);
        let date = $(`${this.target.install} li[data-dpos="${Math.abs(this.date_scroll.y)}"]`);

        let year_text = year.text();
        let month_text = month.text();
        let date_text = date.text();
        let text = DateRobot.to_text(year_text, month_text, date_text);

        return {
            data:{
                year : year_text,
                month : month_text,
                date: date_text
            },
            text: text
        };
    }


    static_component (){
        return{
            "initial_html":
                            `<div class="date_selector">
                                <div class="date_selector_confirm">
                                    <div style="float:left;margin-left:5px;">
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', null, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="date_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', null, ()=>{ this.store = this.get_selected_data();
                                                                                                                    this.option.callback_when_set(this.store); 
                                                                                                                    layer_popup.close_layer_popup();
                                                                                                                })}
                                    </div>
                                </div>
                                <div class="date_selector_year_wrap select_wrapper"></div>
                                <div class="date_selector_month_wrap select_wrapper"></div>
                                <div class="date_selector_date_wrap select_wrapper"></div>
                                <div class="selector_indicator"></div>
                            </div>`
        };
    }
}

//시간 선택 (오전오후, 시, 분)
class TimeSelector{
    constructor(install_target, target_instance, user_option){
        this.target = {install: install_target, result: target_instance};

        // this.data;
        // this.instance = instance;
        this.zone_scroll;
        this.hour_scroll;
        this.minute_scroll;
        this.user_scroll_zone = false;
        this.user_scroll_hour = false;
        this.user_scroll_minute = false;

        this.current_time = TimeRobot.to_zone(new Date().getHours(), new Date().getMinutes());
        this.time = {
            current_zone : this.current_time.zone,
            current_hour : this.current_time.hour,
            current_minute : this.current_time.minute
        };

        this.option = {
            myname:null,
            title:null,
            data:{
                zone:null, hour:null, minute:null
            },
            callback_when_set : ()=>{
                return false;
            }
        };

        this.store = {
            text: null,
            data: {zone:null, hour:null, minute:null}
        };

        if(user_option != undefined){
            //user_option이 들어왔을경우 option의 값을 user_option값으로 바꿔준다.
            for(let option in user_option){
                if(user_option[option] != null){
                    this.option[option] = user_option[option];
                }
            }
        }
        
        this.init();
    }

    set dataset (object){
        this.reset(object);
    }

    get dataset (){
        return this.store;
    }

    init (){
        
        this.init_html();
        this.render_zone_list();
        this.render_hour_list();
        this.render_minute_list();
        this.set_iscroll();
        this.reset(this.option.data);
    }

    reset (object){
        let zone = object.zone == null ? this.time.current_zone : object.zone;
        let hour = object.hour == null ? this.time.current_hour : object.hour;
        let minute = object.minute == null ? this.time.current_minute : object.minute;
        this.store.value = {zone: zone, hour:hour, minute:minute};
        this.store.text = TimeRobot.to_text(TimeRobot.to_data(zone, hour, minute).hour, TimeRobot.to_data(zone, hour, minute).minute);
        
        this.go_snap(zone, hour, minute);
        //값을 저장하고, 스크롤 위치를 들어온 값으로 보낸다.
    }

    init_html (){
        //초기 html 생성
        document.querySelector(this.target.install).innerHTML = this.static_component().initial_html;
    }

    delete (){
        document.querySelector(this.target.install).innerHTML = "";
    }

    render_zone_list (){
        let html = `
                        <div id="zone_wrap_${this.instance}" class="select_wrapper_child">
                            <ul>
                                <li></li>
                                <li></li>
                                <li data-zpos=0 data-zone="0">오전</li>
                                <li data-zpos=40 data-zone="1">오후</li>
                                <li></li>
                                <li></li>
                            </ul>
                        </div>
                        <div class="selector_unit"></div>
                    `;


        document.querySelector(`${this.target.install} .time_selector_zone_wrap`).innerHTML = html;
    }

    render_hour_list (){
        let html_to_join = [];
        let pos = 0;
        for(let i=1; i<=12; i++){
                html_to_join.push(`<li data-hpos=${pos}>${i}</li>`);
                pos = pos + 40;
        }

        let html = `
                        <div id="hour_wrap_${this.instance}" class="select_wrapper_child">
                            <ul>
                                <li></li>
                                <li></li>
                                ${html_to_join.join('')}
                                <li></li>
                                <li></li>
                            </ul>
                        </div>
                        <div class="selector_unit">시</div>
                    `;

        document.querySelector(`${this.target.install} .time_selector_hour_wrap`).innerHTML = html;
    }

    render_minute_list (){
        let html_to_join = [];
        let pos = 0;
        for(let i=0; i<=55; i=i+5){
                html_to_join.push(`<li data-mpos=${pos}>${i}</li>`);
                pos = pos + 40; 
        }

        let html = `
                        <div id="minute_wrap_${this.instance}" class="select_wrapper_child">
                            <ul>
                                <li></li>
                                <li></li>
                                ${html_to_join.join('')}
                                <li></li>
                                <li></li>
                            </ul>
                        </div>
                        <div class="selector_unit">분</div>
                    `;

        document.querySelector(`${this.target.install} .time_selector_minute_wrap`).innerHTML = html;
    }

    set_iscroll (){
        this.zone_scroll = new IScroll(`#zone_wrap_${this.instance}`, {
            mouseWheel : true,
            deceleration:0.005,
            bounce: false
        });

        this.hour_scroll = new IScroll(`#hour_wrap_${this.instance}`, {
            mouseWheel : true,
            deceleration:0.005,
            bounce: false
        });
        this.minute_scroll = new IScroll(`#minute_wrap_${this.instance}`, {
            mouseWheel : true,
            deceleration:0.005,
            bounce: false
        });
        this.set_scroll_snap();
    }

    set_scroll_snap (){
        let self = this;
        
        self.zone_scroll.on('scrollEnd', function (){
            if(self.user_scroll_year == true){
                self.user_scroll_year = false;
                let posY = this.y;
                let min = posY-posY%40;
                let max = min - 40;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                self.zone_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                $(`${self.target.install} li[data-zpos="${Math.abs(self.zone_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.target.install} li[data-zpos="${Math.abs(self.zone_scroll.y)}"]`).css('color', '#1e1e1e');
            }
        });

        self.zone_scroll.on('beforeScrollStart', function (){
            self.user_scroll_year = true;
        });

        
        self.hour_scroll.on('scrollEnd', function (){
            if(self.user_scroll_month == true){
                self.user_scroll_month = false;
                let posY = this.y;
                let min = posY-posY%40;
                let max = min - 40;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                
                    
                self.hour_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                $(`${self.target.install} li[data-hpos="${Math.abs(self.hour_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.target.install} li[data-hpos="${Math.abs(self.hour_scroll.y)}"]`).css('color', '#1e1e1e');
            }
        });

        self.hour_scroll.on('beforeScrollStart', function (){
            self.user_scroll_month = true;
        });

        self.minute_scroll.on('scrollEnd', function (){
            if(self.user_scroll_date == true){
                self.user_scroll_date = false;
                let posY = this.y;
                let min = posY-posY%40;
                let max = min - 40;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                
                    
                self.minute_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                $(`${self.target.install} li[data-mpos="${Math.abs(self.minute_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.target.install} li[data-mpos="${Math.abs(self.minute_scroll.y)}"]`).css('color', '#1e1e1e');
                
            }
        });

        self.minute_scroll.on('beforeScrollStart', function (){
            self.user_scroll_date = true;
        });
    }

    go_snap (zone, hour, minute){
        let initial_pos_zone = (-zone)*40;
        let initial_pos_hour = (1-hour)*40;
        let initial_pos_minute = -(minute)*8;

        this.zone_scroll.scrollTo(0, initial_pos_zone, 0, IScroll.utils.ease.bounce);
        this.hour_scroll.scrollTo(0, initial_pos_hour, 0, IScroll.utils.ease.bounce);
        this.minute_scroll.scrollTo(0, initial_pos_minute, 0, IScroll.utils.ease.bounce);

        $(`${this.target.install} li[data-zpos="${Math.abs(this.zone_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-hpos="${Math.abs(this.hour_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-mpos="${Math.abs(this.minute_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-zpos="${Math.abs(this.zone_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
        $(`${this.target.install} li[data-hpos="${Math.abs(this.hour_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
        $(`${this.target.install} li[data-mpos="${Math.abs(this.minute_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
    }

    get_selected_data (){
        let zone = $(`${this.target.install} li[data-zpos="${Math.abs(this.zone_scroll.y)}"]`);
        let hour = $(`${this.target.install} li[data-hpos="${Math.abs(this.hour_scroll.y)}"]`);
        let minute = $(`${this.target.install} li[data-mpos="${Math.abs(this.minute_scroll.y)}"]`);

        let zone_value = zone.attr('data-zone');
        let zone_text = zone.text();
        let hour_text = hour.text();
        let minute_text = minute.text();

        let data_form = TimeRobot.to_data(zone_value, hour_text, minute_text);
        let text = TimeRobot.to_text(data_form.hour, data_form.minute);

        return {
            data:{
                zone : zone_value,
                hour : hour_text,
                minute: minute_text
            },
            text: text
            
        };
    }


    static_component (){
        return{
            "initial_html":`<div class="time_selector">
                                <div class="time_selector_confirm">
                                    <div style="float:left;margin-left:5px;">
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', null, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="time_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', null, ()=>{this.store = this.get_selected_data();
                                                                                                                    this.option.callback_when_set(this.store); 
                                                                                                                    layer_popup.close_layer_popup(); })}
                                    </div>
                                </div>
                                <div class="time_selector_zone_wrap select_wrapper"></div>
                                <div class="time_selector_hour_wrap select_wrapper"></div>
                                <div class="time_selector_minute_wrap select_wrapper"></div>
                                <div class="selector_indicator"></div>
                            </div>`
        };
    }
}

//싱글 스피너 범용 (Data 받는다)
class SpinSelector{
    //셀렉터가 설치될 Selector, 선택된 값을 전달할곳, 자기 인스턴스, 기타 유저 옵션(데이터값 등)
    constructor (install_target, target_instance, user_option){ // data
        //user_option 데이터 형식
        // {title:'hello', 
        // data: [{name:123, value:123}, {name:234, value:234}, {name:345, value:345}], callback_when_set:()=>{ callback_function(); }}
        
        this.target = {install: install_target, result: target_instance};
        this.page_scroll;
        this.user_scroll_page = false;

        this.option = {
            myname:null,
            title:null, 
            data: null,
            init_page : 0,
            unit:null,
            callback_when_set: ()=>{

            }
        };

        this.store = {
            text: null,
            value: null
        };

        if(user_option != undefined){
            //user_option이 들어왔을경우 option의 값을 user_option값으로 바꿔준다.
            for(let option in user_option){
                this.option[option] = user_option[option];
            }
        }

        this.init();
    }

    set dataset (object){
        this.store.text = object.text;
        this.store.value = object.value;
    }

    get dataset (){
        return this.store;
    }


    init (){
        this.init_html();
        this.render_list();
        this.set_iscroll();
        this.reset();
    }

    init_html (){
        //초기 html 생성
        document.querySelector(this.target.install).innerHTML = this.static_component().initial_html;
    }

    delete (){
        document.querySelector(this.target.install).innerHTML = "";
    }

    reset (page){
        if(page == undefined){
            page = this.option.init_page;
        }
        this.go_snap(page);
    }

    render_list (){
        let html_to_join = [];
        let pos = 0;
        let length = this.option.data.length;
        for(let i=0; i<length; i++){
            html_to_join.push(`<li data-pos=${pos} data-value="${this.option.data[i].value}">${this.option.data[i].name}</li>`);
            pos = pos + 40; 
        }

        let html = `
                        <div id="page_wrap_${this.instance}" class="select_wrapper_child">
                            <ul>
                                <li></li>
                                <li></li>
                                ${html_to_join.join('')}
                                <li></li>
                                <li></li>
                            </ul>
                        </div>
                        <div class="selector_unit">${this.option.unit}</div>
                    `;


        document.querySelector(`${this.target.install} .spin_selector_page_wrap`).innerHTML = html;
    }


    set_iscroll (){
        this.page_scroll = new IScroll(`#page_wrap_${this.instance}`, {
            mouseWheel : true,
            deceleration:0.005,
            bounce: false
        });

        this.set_scroll_snap();
    }

    set_scroll_snap (){
        let self = this;
        self.page_scroll.on('scrollEnd', function (){
            if(self.user_scroll_page == true){
                self.user_scroll_page = false;
                let posY = this.y;
                let min = posY-posY%40;
                let max = min - 40;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                self.page_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                let $selected = $(`${self.target.install} li[data-pos="${Math.abs(self.page_scroll.y)}"]`);
                $selected.siblings('li').css('color', '#cccccc');
                $selected.css('color', '#1e1e1e');
            }
        });

        self.page_scroll.on('beforeScrollStart', function (){
            self.user_scroll_page = true;
        });
    }

    go_snap (page){
        let initial_pos_page = (-page)*40;
        this.page_scroll.scrollTo(0, initial_pos_page, 0, IScroll.utils.ease.bounce);
        $(`${this.target.install} li[data-pos="${Math.abs(this.page_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-pos="${Math.abs(this.page_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
    }

    get_selected_data (){
        let page = $(`${this.target.install} li[data-pos="${Math.abs(this.page_scroll.y)}"]`);

        return {
            value : page.attr('data-value'),
            text : page.text()
        };
    }

    static_component (){
        return{
            "initial_html":`<div class="spin_selector">
                                <div class="spin_selector_confirm">
                                    <div style="float:left;margin-left:5px;">
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', null, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="span_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', null, ()=>{this.option.callback_when_set(); console.log(this.get_selected_data()) })}
                                    </div>
                                </div>
                                <div class="spin_selector_page_wrap select_wrapper"></div>
                                <div class="selector_indicator"></div>
                            </div>`
        };
    }
}

class OptionSelector{
    constructor(install_target, target_instance, user_option){
        // this.html_target = target;
        // this.instance = instance;

        this.target={
            install:install_target,
            result:target_instance
        };

        this.option = {
            data:null
        };

        this.store = {
            text: null,
            data: null
        };
        this.data = user_option;
        this.init();
    }

    init(){
        this.render_option_list();
    }

    set data(obejct){
        this.option.data = obejct;
        this.render_option_list();
    }

    render_option_list (){
        let html_to_join = [];
        for(let op in this.option.data){
            let option_name = this.option.data[op].text;
            let option_value = op;
            let option_callback = this.option.data[op].callback;
            html_to_join.push(
                CComponent.create_row(option_value, option_name, null, HIDE, ()=>{
                    option_callback();
                })
            );
        }

        document.querySelector(this.target.install).innerHTML = html_to_join.join('');
    }


    //data 형태
    // `{
    //     사과:{value: 'apple', callback: ()=>{console.log('사과 Apple')} }, 
    //     수박:{value: 'water_melon', callback: ()=>{console.log('수박 Water melon')} }, 
    //     바나나:{value: 'banana', callback: ()=>{console.log('바나나 Banana')} }
    // }`;
}

class LectureSelector{
    constructor(install_target, target_instance, multiple_select){
        this.targetHTML = install_target;
        this.target_instance = target_instance;
        this.received_data;
        this.multiple_select = multiple_select;
        this.data = {
            id: this.target_instance.lecture.id,
            name: this.target_instance.lecture.name,
            max: this.target_instance.lecture.max
        };
        this.request_list(()=>{
            this.render_list();
        });
    }

    render_list(){
        let html_to_join = [];
        let length = this.received_data.length;
        if(length == 0){
            html_to_join.push(CComponent.no_data_row('수업 목록이 비어있습니다.'));
        }
        for(let i=0; i<length; i++){
            let data = this.received_data[i];
            let lecture_id = data.lecture_id;
            let lecture_name = data.lecture_name;
            let lecture_color_code = "#fe4e65";
            let lecture_max_num = data.lecture_max_num;
            let checked = this.target_instance.lecture.id.indexOf(lecture_id) >= 0 ? 1 : 0;
            let html = CComponent.select_lecture_row(
                this.multiple_select, checked, lecture_id, lecture_name, lecture_color_code, lecture_max_num, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data.id.push(lecture_id);
                        this.data.name.push(lecture_name);
                        this.data.max.push(lecture_max_num);
                    }else if(add_or_substract == "substract"){
                        this.data.id.splice(this.data.id.indexOf(lecture_id), 1);
                        this.data.name.splice(this.data.name.indexOf(lecture_name), 1);
                        this.data.max.splice(this.data.name.indexOf(lecture_name), 1);
                    }else if(add_or_substract == "add_single"){
                        this.data.id = [];
                        this.data.name = [];
                        this.data.max = [];
                        this.data.id.push(lecture_id);
                        this.data.name.push(lecture_name);
                        this.data.max.push(lecture_max_num);
                    }

                    this.target_instance.lecture = this.data; //타겟에 선택된 데이터를 set

                    if(this.multiple_select == 1){
                        layer_popup.close_layer_popup();
                    }
                }  

                    
            );
            html_to_join.push(html);
        }

        document.querySelector(this.targetHTML).innerHTML = html_to_join.join('');
    }

    request_list (callback){
        lecture.request_lecture_list("ing", (data)=>{
            this.received_data = data.current_lecture_data;
            callback();
        });
    }
}

class MemberSelector{
    constructor(install_target, target_instance, multiple_select, appendix){
        this.targetHTML = install_target;
        this.target_instance = target_instance;
        this.received_data;
        this.appendix = appendix;
        this.multiple_select = multiple_select;
        this.data = {
            id: [],
            name: []
        };
        this.data.id = this.target_instance.member.id;
        this.data.name = this.target_instance.member.name;
        this.request_list(()=>{
            this.render_list();
        });
    }

    render_list (){
        let html_to_join = [];
        let length = this.received_data.length;
        if(length == 0){
            html_to_join.push(CComponent.no_data_row('목록이 비어있습니다.'));
        }
        for(let i=0; i<length; i++){
            let data = this.received_data[i];
            let member_id = data.member_id;
            let member_name = data.member_name;
            // let member_rem_count = data.member_ticket_rem_count;
            let member_avail_count = data.member_ticket_avail_count;
            let member_expiry = data.end_date;
            let checked = this.target_instance.member.id.indexOf(member_id) >= 0 ? 1 : 0; //타겟이 이미 가진 회원 데이터를 get
            let html = CComponent.select_member_row (
                this.multiple_select, checked, member_id, member_name, member_avail_count, member_expiry, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data.id.push(member_id);
                        this.data.name.push(member_name);
                    }else if(add_or_substract == "substract"){
                        this.data.id.splice(this.data.id.indexOf(member_id), 1);
                        this.data.name.splice(this.data.name.indexOf(member_name), 1);
                    }else if(add_or_substract == "add_single"){
                        this.data.id = [];
                        this.data.name = [];
                        this.data.id.push(member_id);
                        this.data.name.push(member_name);
                    }

                    this.target_instance.member = this.data; //타겟에 선택된 데이터를 set

                    if(this.multiple_select == 1){
                        layer_popup.close_layer_popup();
                    }
                        
                }  
            );
            html_to_join.push(html);
        }

        document.querySelector(this.targetHTML).innerHTML = html_to_join.join('');
    }

    request_list (callback){
        //Lecture_id를 클래스가 전달받은 경우, 해당 lecture에 속한 회원 리스트를 받아온다.
        //Lecture_id를 클래스가 받지 못한 경우, 모든 진행 회원 리스트를 받아온다.
        if(this.appendix.lecture_id == undefined){
            member.request_member_list("ing", (data)=>{
                this.received_data = data.current_member_data;
                callback();
                show_error_message('수업 정보를 확인할 수 없어, 전체 진행중 회원목록을 가져옵니다.');
            });
        }else{
            let data = {"lecture_id": this.appendix.lecture_id};
            Lecture_func.read_lecture_members(data, (data)=>{
                this.received_data = data.lecture_ing_member_list;
                callback();
            });
        }
    }
}

class DatePickerSelector{
    constructor (install_target, target_instance, user_option){
        this.target = {install: install_target, result: target_instance};

        let d = new Date();
        this.date = {
            current_year : d.getFullYear(),
            current_month : d.getMonth()+1,
            current_date : d.getDate(),
            current_day : d.getDay()
        };

        this.option = {
            myname:null,
            title:null,
            data:{
                year:this.date.current_year, month:this.date.current_month, date:this.date.current_date
            },
            callback_when_set : ()=>{
                return false;
            }
        };


        this.store = {
            text: null,
            data: {year:null, month:null, date:null}
        };

        if(user_option != undefined){
            //user_option이 들어왔을경우 default_option의 값을 user_option값으로 바꿔준다.
            for(let option in user_option){
                if(user_option[option] != null){
                    this.option[option] = user_option[option];
                }
            }
        }
        this.init();
    }

    set dataset (object){
        let year = object.data.year == null ? this.date.current_year : object.data.year; // 값이 들어왔으면 값대로, 아니면 현재값으로
        let month = object.data.month == null ? this.date.current_month : object.data.month;
        let date = object.data.date == null ? this.date.current_date : object.data.date;
        this.store.data = {year: year, month:month, date:date};
        this.store.text = DateRobot.to_text(year, month, date);
    }

    get dataset (){
        return this.store;
    }

    next(){
        let next_year = this.option.data.month+1 > 12 ? this.option.data.year +1 :  this.option.data.year;
        let next_month = this.option.data.month+1 > 12 ? 1 : this.option.data.month + 1;

        this.option.data.year = next_year;
        this.option.data.month = next_month;
        this.render_datepicker();
    }

    prev(){
        let prev_year = this.option.data.month-1 == 0 ? this.option.data.year -1 :  this.option.data.year;
        let prev_month = this.option.data.month-1 == 0 ? 12 : this.option.data.month - 1;

        this.option.data.year = prev_year;
        this.option.data.month = prev_month;
        this.render_datepicker();
    }


    init (){
        this.init_html();
        this.render_datepicker();
    }

    init_html (){
        //초기 html 생성
        document.querySelector(this.target.install).innerHTML = this.static_component().initial_html;
    }

    delete (){
        document.querySelector(this.target.install).innerHTML = "";
    }

    render_datepicker(){
        let reference_date_year = this.option.data.year;
        let reference_date_month = this.option.data.month;
        let reference_date_date = this.option.data.date;
        let reference_date_month_last_day = new Date(reference_date_year, reference_date_month, 0).getDate();
        let current_month_first_date_day = new Date(reference_date_year, reference_date_month-1, 1).getDay();

        //달력의 상단 표기 부분 (년월표기, 버튼)
        let month_calendar_upper_tool = `<div class="pters_month_cal_upper_tool_box" style="text-align:center;height:30px;">
                                            <div class="pters_month_cal_tool_date_text">
                                                <div class="obj_font_size_15_weight_bold">
                                                    ${CComponent.image_button('date_picker_prev', '뒤로', '/static/common/icon/navigate_before_black.png', null, ()=>{this.prev();})}
                                                    ${Number(reference_date_year)}년 ${Number(reference_date_month)}월
                                                    ${CComponent.image_button('date_picker_next', '앞으로', '/static/common/icon/navigate_next_black.png', null, ()=>{this.next();})}
                                                </div>
                                            </div>
                                        </div>`;

        //달력의 월화수목금 표기를 만드는 부분
        let month_day_name_text = `<div class="pters_month_cal_day_name_box obj_table_raw" style="text-align:center;"> 
                                    <div class="obj_table_cell_x7">일</div>
                                    <div class="obj_table_cell_x7">월</div>
                                    <div class="obj_table_cell_x7">화</div>
                                    <div class="obj_table_cell_x7">수</div>
                                    <div class="obj_table_cell_x7">목</div>
                                    <div class="obj_table_cell_x7">금</div>
                                    <div class="obj_table_cell_x7">토</div>  
                                   </div>`;

        //달력의 날짜를 만드는 부분
        let htmlToJoin = [];
        let date_cache = 1;
        for(let i=0; i<6; i++){
            let dateCellsToJoin = [];

            for(let j=0; j<7; j++){
                let data_date = date_format(`${reference_date_year}-${reference_date_month}-${date_cache}`)["yyyy-mm-dd"];
                let font_color = "";
                let today_style = "";
                let date = date_cache;
                if(j == 0){
                    font_color = 'color:red;';
                }else if(j == 6){
                    font_color = 'color:blue;';
                }

                if(this.date.current_year == reference_date_year && this.date.current_month == reference_date_month && this.date.current_date == date_cache){
                    date = `<div style="display:inline-block;height:25px;width:25px;line-height:26px;border-radius:50%;background-color:#fe4e65;">${date_cache}</div>
                            <div style="position: absolute;top: -15px;left: 50%;color: #fe4e65;font-size: 10px;transform: translateX(-50%);">Today</div>`;
                    today_style = 'color:#ffffff;position:relative';
                }

                if(i==0 && j<current_month_first_date_day){ //첫번째 주일때 처리
                    dateCellsToJoin.push(`<div class="obj_table_cell_x7"></div>`);
                }else if(date_cache > reference_date_month_last_day){ // 마지막 날짜가 끝난 이후 처리
                    dateCellsToJoin.push(`<div class="obj_table_cell_x7"></div>`);
                }else{
                    dateCellsToJoin.push(`<div class="obj_table_cell_x7" data-date="${data_date}" id="calendar_cell_${data_date}"" style="cursor:pointer;">
                                               <div class="calendar_date_number" style="${font_color}${today_style}">${date}</div>
                                          </div>`);

                    $(document).off('click', `#calendar_cell_${data_date}`).on('click', `#calendar_cell_${data_date}`, ()=>{
                        let date = Number(data_date.split('-')[2]);
                        this.dataset = {data:{year:reference_date_year, month:reference_date_month, date}};
                        this.option.callback_when_set(this.store); 
                        layer_popup.close_layer_popup();
                    });
                    date_cache++;
                }
            }

            let week_row = `<div class="obj_table_raw" id="week_row_${i}" style="height:35px">
                                ${dateCellsToJoin.join('')}
                            </div>`;
            htmlToJoin.push(week_row);

        }

        let calendar_assembled = `<div class="pters_month_cal_content_box" style="text-align:center;">`+htmlToJoin.join('')+'</div>';



        //상단의 연월 표기, 일월화수목 표기, 달력숫자를 합쳐서 화면에 그린다.
        document.querySelector(`${this.target.install} .date_picker_selector_wrap`).innerHTML = `${month_calendar_upper_tool}
                                                                <div class="obj_box_full">
                                                                ${month_day_name_text}${calendar_assembled}
                                                                </div>`;
    }



    static_component (){
        return{
            "initial_html":
                            `<div class="date_selector">
                                <div class="date_selector_confirm">
                                    <div style="position:absolute;margin-left:5px;">
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', null, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="date_selector_title">${this.option.title}</span>
                                </div>
                                <div class="date_picker_selector_wrap"></div>
                            </div>`
        };
    }
}
