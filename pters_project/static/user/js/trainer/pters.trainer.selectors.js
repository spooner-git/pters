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

        self.hour_scroll.on('scrollStart', function (){
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
                    show_error_message('종료 시각이 시작 시각보다 빠릅니다.')
                }else{
                    self.hour2_scroll.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                }
                
                $(`${self.targetHTML} li[data-epos="${Math.abs(self.hour2_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.targetHTML} li[data-epos="${Math.abs(self.hour2_scroll.y)}"]`).css('color', '#1e1e1e');
                
            }
        })

        self.hour2_scroll.on('scrollStart', function (){
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
            show_error_message('시작 시각 입력을 다시 해주세요.')
        }
        else if(result.end == undefined || result.end == ''){
            show_error_message('종료 시각 입력을 다시 해주세요.')
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

        self.year_scroll.on('scrollStart', function (){
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

        self.month_scroll.on('scrollStart', function (){
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

        self.date_scroll.on('scrollStart', function (){
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
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', {"padding":"10px 20px"}, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="date_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', {"padding":"10px 20px"}, ()=>{ this.store = this.get_selected_data();
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

//날짜 선택 (년, 월, 일)
class TwoDateSelector{
    constructor (install_target, target_instance, user_option){
        this.target = {install: install_target, result: target_instance};

        // this.data;
        // this.instance = instance;
        this.year_scroll;
        this.month_scroll;
        this.year_scroll2;
        this.month_scroll2;

        this.user_scroll_year = false;
        this.user_scroll_month = false;
        this.user_scroll_year2 = false;
        this.user_scroll_month2 = false;

        let d = new Date();
        this.date = {
            current_year : d.getFullYear(),
            current_month : d.getMonth()+1,
            current_date : d.getDate()
        };

        this.option = {
            myname:null,
            title:null,
            data1:{
                year:null, month:null
            },
            data2:{
                year:null, month:null
            },
            range1:{
                start: 2018,
                end: this.date.current_year
            },
            range2:{
                start: 2018,
                end: this.date.current_year
            },
            callback_when_set : ()=>{
                return false;
            }
        };

        this.store = {
            text1: null,
            text2: null,
            data1: {year:null, month:null},
            data2: {year:null, month:null}
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
        this.render_year_list2();
        this.render_month_list2();
        this.set_iscroll();
        this.reset(this.option);
    }


    reset (object){
        let year = object.data1.year == null ? this.date.current_year : object.data1.year;
        let month = object.data1.month == null ? this.date.current_month : object.data1.month;
        
        this.store.data1 = {year: year, month:month};
        this.store.data2 = {year: year, month:month};
        this.store.text1 = DateRobot.to_text(year, month);
        this.store.text2 = DateRobot.to_text(year, month);
        
        this.go_snap(year, month);
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
        let range_start = this.option.range1.start == null ? this.date.current_year - 100 : this.option.range1.start;
        let range_end = this.option.range1.end == null ? this.date.current_year : this.option.range1.end;
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


        document.querySelector(`${this.target.install} .two_date_selector_year_wrap`).innerHTML = html;
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

        document.querySelector(`${this.target.install} .two_date_selector_month_wrap`).innerHTML = html;
    }

    render_year_list2 (){
        let html_to_join = [];
        let pos = 0;
        let range_start = this.option.range2.start == null ? this.date.current_year - 100 : this.option.range2.start;
        let range_end = this.option.range2.end == null ? this.date.current_year : this.option.range2.end;
        for(let i=range_start; i<=range_end; i++){
            html_to_join.push(`<li data-ypos2=${pos}>${i}</li>`);
            pos = pos + 40;
                       
        }

        let html = `
                        <div id="year_wrap_${this.instance}2" class="select_wrapper_child">
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


        document.querySelector(`${this.target.install} .two_date_selector_year_wrap2`).innerHTML = html;
    }

    render_month_list2 (){
        let html_to_join = [];
        let pos = 0;
        for(let i=1; i<=12; i++){
            html_to_join.push(`<li data-mpos2=${pos}>${i}</li>`);
            pos = pos + 40;
        }

        let html = `
                        <div id="month_wrap_${this.instance}2" class="select_wrapper_child">
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

        document.querySelector(`${this.target.install} .two_date_selector_month_wrap2`).innerHTML = html;
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
        this.year_scroll2 = new IScroll(`#year_wrap_${this.instance}2`,{
            mouseWheel : true,
            deceleration:0.003,
            bounce: false
            // snap: 'li'
        });
        this.month_scroll2 = new IScroll(`#month_wrap_${this.instance}2`,{
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

        self.year_scroll.on('scrollStart', function (){
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

        self.month_scroll.on('scrollStart', function (){
            self.user_scroll_month = true;
        });


        self.year_scroll2.on('scrollEnd', function (){
            if(self.user_scroll_year2 == true){
                self.user_scroll_year2 = false;
                let posY = this.y;
                let min = posY-posY%40;
                let max = min - 40;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                self.year_scroll2.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                $(`${self.target.install} li[data-ypos2="${Math.abs(self.year_scroll2.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.target.install} li[data-ypos2="${Math.abs(self.year_scroll2.y)}"]`).css('color', '#1e1e1e');
                self.year_scroll_snapped = snap;
            }
        });

        self.year_scroll2.on('scrollStart', function (){
            self.user_scroll_year2 = true;
        });

        
        self.month_scroll2.on('scrollEnd', function (){
            if(self.user_scroll_month2 == true){
                self.user_scroll_month2 = false;
                let posY = this.y;
                let min = posY-posY%40;
                let max = min - 40;

                let snap;
                
                if(Math.abs(posY - max) < Math.abs(posY - min)){
                    snap = max;
                }else{
                    snap = min;
                }
                
                    
                self.month_scroll2.scrollTo(0, snap, 0, IScroll.utils.ease.bounce);
                $(`${self.target.install} li[data-mpos2="${Math.abs(self.month_scroll2.y)}"]`).siblings('li').css('color', '#cccccc');
                $(`${self.target.install} li[data-mpos2="${Math.abs(self.month_scroll2.y)}"]`).css('color', '#1e1e1e');
                
            }
        });

        self.month_scroll2.on('scrollStart', function (){
            self.user_scroll_month2 = true;
        });
        
    }

    go_snap (year, month){
        let initial_pos_year = (this.option.range1.start-year)*40;
        let initial_pos_month = (1-month)*40;

        this.year_scroll.scrollTo(0, initial_pos_year, 0, IScroll.utils.ease.bounce);
        this.month_scroll.scrollTo(0, initial_pos_month, 0, IScroll.utils.ease.bounce);

        $(`${this.target.install} li[data-ypos="${Math.abs(this.year_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-mpos="${Math.abs(this.month_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-ypos="${Math.abs(this.year_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
        $(`${this.target.install} li[data-mpos="${Math.abs(this.month_scroll.y)}"]`).siblings('li').css('color', '#cccccc');

        let initial_pos_year2 = (this.option.range1.start-year)*40;
        let initial_pos_month2 = (1-month)*40;

        this.year_scroll2.scrollTo(0, initial_pos_year2, 0, IScroll.utils.ease.bounce);
        this.month_scroll2.scrollTo(0, initial_pos_month2, 0, IScroll.utils.ease.bounce);

        $(`${this.target.install} li[data-ypos2="${Math.abs(this.year_scroll2.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-mpos2="${Math.abs(this.month_scroll2.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-ypos2="${Math.abs(this.year_scroll2.y)}"]`).siblings('li').css('color', '#cccccc');
        $(`${this.target.install} li[data-mpos2="${Math.abs(this.month_scroll2.y)}"]`).siblings('li').css('color', '#cccccc');
        
    }

    show_selected_date (){
        let year = $(`${this.target.install} li[data-ypos="${Math.abs(this.year_scroll.y)}"]`);
        let month = $(`${this.target.install} li[data-mpos="${Math.abs(this.month_scroll.y)}"]`);
        let year2 = $(`${this.target.install} li[data-ypos2="${Math.abs(this.year_scroll2.y)}"]`);
        let month2 = $(`${this.target.install} li[data-mpos2="${Math.abs(this.month_scroll2.y)}"]`);

        let year_text = year.text();
        let month_text = month.text();
        let year_text2 = year2.text();
        let month_text2 = month2.text();

        if(year_text == undefined || year_text == ''){
            show_error_message('[연도]를 다시 선택 해주세요.');
        }
        else if(month_text == undefined || month_text == ''){
            show_error_message('[월]을 다시 선택 해주세요.');
        }else if(date_text == undefined || date_text == ''){
            show_error_message('[일자]를 다시 선택 해주세요.');
        }
        else{
            show_error_message(`${year_text}년 ${month_text}월 - ${year_text2}년 ${month_text2}월`);
        }
    }

    get_selected_data (){
        let year = $(`${this.target.install} li[data-ypos="${Math.abs(this.year_scroll.y)}"]`);
        let month = $(`${this.target.install} li[data-mpos="${Math.abs(this.month_scroll.y)}"]`);
        let year2 = $(`${this.target.install} li[data-ypos2="${Math.abs(this.year_scroll2.y)}"]`);
        let month2 = $(`${this.target.install} li[data-mpos2="${Math.abs(this.month_scroll2.y)}"]`);

        let year_text = year.text();
        let month_text = month.text();
        let year_text2 = year2.text();
        let month_text2 = month2.text();
        let text = DateRobot.to_text(year_text, month_text);
        let text2 = DateRobot.to_text(year_text2, month_text2);

        return {
            data1:{
                year : year_text,
                month : month_text,
            },
            data2:{
                year : year_text2,
                month : month_text2,
            },
            text1: text,
            text2: text2
        };
    }


    static_component (){
        return{
            "initial_html":
                            `<div class="date_selector2">
                                <div class="date_selector_confirm">
                                    <div style="float:left;margin-left:5px;">
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', {"padding":"10px 20px"}, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="date_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', {"padding":"10px 20px"}, ()=>{ this.store = this.get_selected_data();
                                                                                                                    this.option.callback_when_set(this.store); 
                                                                                                                    // layer_popup.close_layer_popup();
                                                                                                                })}
                                    </div>
                                </div>
                                <div class="two_date_selector_year_wrap select_wrapper"></div>
                                <div class="two_date_selector_month_wrap select_wrapper"></div>
                                <div style="display:inline-block;margin:0 5%;"></div>
                                <div class="two_date_selector_year_wrap2 select_wrapper"></div>
                                <div class="two_date_selector_month_wrap2 select_wrapper"></div>
                                <div class="selector_indicator" style="font-weight:bold;"> - </div>
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
            min:null,
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
                if(self.check_minimum_time() == false){
                    document.querySelector('.selector_indicator').style.backgroundColor = '#fe4e6547';
                }else{
                    document.querySelector('.selector_indicator').style.backgroundColor = 'unset';
                }
            }
        });

        self.zone_scroll.on('scrollStart', function (){
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

                if(self.check_minimum_time() == false){
                    document.querySelector('.selector_indicator').style.backgroundColor = '#fe4e6547';
                }else{
                    document.querySelector('.selector_indicator').style.backgroundColor = 'unset';
                }
            }
        });

        self.hour_scroll.on('scrollStart', function (){
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
                
                if(self.check_minimum_time() == false){
                    document.querySelector('.selector_indicator').style.backgroundColor = '#fe4e6547';
                }else{
                    document.querySelector('.selector_indicator').style.backgroundColor = 'unset';
                }
            }
        });

        self.minute_scroll.on('scrollStart', function (){
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
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', {"padding":"10px 20px"}, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="time_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', {"padding":"10px 20px"}, ()=>{this.upper_right_button();})}
                                    </div>
                                </div>
                                <div class="time_selector_zone_wrap select_wrapper"></div>
                                <div class="time_selector_hour_wrap select_wrapper"></div>
                                <div class="time_selector_minute_wrap select_wrapper"></div>
                                <div class="selector_indicator"></div>
                            </div>`
        };
    }

    check_minimum_time(){
        if(this.option.min != null){
            let selected_time_data_form = TimeRobot.to_data(this.get_selected_data().data.zone, this.get_selected_data().data.hour, this.get_selected_data().data.minute).complete;
            let min_time_data_form = TimeRobot.to_data(this.option.min.zone, this.option.min.hour, this.option.min.minute).complete;
            if(selected_time_data_form == '0:0'){
                selected_time_data_form = '24:00';
            }
            console.log(selected_time_data_form, min_time_data_form, TimeRobot.compare(selected_time_data_form, min_time_data_form));

            let time_compare = TimeRobot.compare(selected_time_data_form, min_time_data_form); // >= 일경우 true;
            if(time_compare == false){
                // show_error_message('종료시간은 시작시간보다 작을 수 없습니다.');
                return false;
            }
        }
        return true;
    }

    upper_right_button(){
        let minimum_check = this.check_minimum_time();
        if(minimum_check == false){
            show_error_message('종료 시각은 시작 시각보다 작을 수 없습니다.');
            return false;
        }

        this.store = this.get_selected_data();
        this.option.callback_when_set(this.store); 
        layer_popup.close_layer_popup();
    }

}

//시간 선택 (오전오후, 시, 분)
class TimeSelector2{
    constructor(install_target, target_instance, user_option){
        this.target = {install: install_target, result: target_instance};

        this.hour_scroll;
        this.minute_scroll;
        this.user_scroll_hour = false;
        this.user_scroll_minute = false;

        this.time = {
            current_hour : new Date().getHours(),
            current_minute : Math.floor((new Date().getMinutes())/5)*5
        };

        this.option = {
            myname:null,
            title:null,
            data:{
                hour:null, minute:null
            },
            min:null,
            range:{start:0, end:24},
            callback_when_set : ()=>{
                return false;
            }
        };

        this.store = {
            text: null,
            data: {hour:null, minute:null}
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
        let initial_set_time_data = {hour:this.option.data.hour, minute:this.option.data.minute};
        this.init_html();
        this.render_hour_list();
        this.render_minute_list(initial_set_time_data.hour >= this.option.range.end ? 5 : 60);
        this.set_iscroll();
        this.reset(this.option.data);
    }

    reset (object){
        let hour = object.hour == null ? this.time.current_hour : object.hour;
        let minute = object.minute == null ? this.time.current_minute : object.minute;

        //미리 셋팅되어있어야하는 값이 업무시간 외의 시간에 있을 경우
        if((hour >= this.option.range.end && minute > 0) || hour < this.option.range.start){
            hour = this.option.range.end;
            minute = 0;
        }

        this.store.value = {hour:hour, minute:minute};
        this.store.text = TimeRobot.to_text(hour, minute);
        
        let hour_data = hour - this.option.range.start;
        let minute_data = minute;

        this.go_snap(hour_data, minute_data);
        //값을 저장하고, 스크롤 위치를 들어온 값으로 보낸다.
    }

    init_html (){
        //초기 html 생성
        document.querySelector(this.target.install).innerHTML = this.static_component().initial_html;
    }

    delete (){
        document.querySelector(this.target.install).innerHTML = "";
    }


    render_hour_list (){
        let html_to_join = [];
        let pos = 0;
        let hour_range_start = this.option.range.start;
        let hour_range_end = this.option.range.end;
    
        for(let i=hour_range_start; i<=hour_range_end; i++){
                let morningday;
                let time_for_user;
                if(i < 12 || i == 24){
                    morningday = "오전";
                    time_for_user = i;
                    if(i == 24){
                        time_for_user = 12;
                    }
                }else if(i >= 12){
                    morningday = "오후";
                    time_for_user = i - 12;
                    if(i == 12){
                        time_for_user = 12;
                    }
                }

                html_to_join.push(`<li data-hpos=${pos} data-hour="${i}"><span style="margin-right:16px;">${morningday}</span>${time_for_user}</li>`);
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

    render_minute_list (minute_end){
        let html_to_join = [];
        let pos = 0;
        if(minute_end == undefined){
            minute_end = 60;
        }
        for(let i=0; i<minute_end; i=i+5){
                html_to_join.push(`<li data-mpos=${pos} data-min="${i}">${i}</li>`);
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
        this.hour_scroll = new IScroll(`#hour_wrap_${this.instance}`, {
            mouseWheel : true,
            deceleration:0.005,
            bounce: false,
        });
        
        this.minute_scroll = new IScroll(`#minute_wrap_${this.instance}`, {
            mouseWheel : true,
            deceleration:0.005,
            bounce: false,
        });

        this.set_scroll_snap();
    }

    set_iscroll_minute(){
        this.minute_scroll = new IScroll(`#minute_wrap_${this.instance}`, {
            mouseWheel : true,
            deceleration:0.005,
            bounce: false,
        });
        this.set_scroll_snap();
    }

    set_scroll_snap (){
        let self = this;
        self.hour_scroll.on('scrollEnd', function (){
            if(self.user_scroll_hour == true){
                self.user_scroll_hour = false;
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

                let hour = self.get_selected_data().data.hour;
                if(hour >= self.option.range.end){
                    // self.minute_end = 5;
                    self.render_minute_list(5);
                    self.set_iscroll_minute();
                    self.go_snap(hour - self.option.range.start, 0);
                }else{
                    // self.minute_end = 60;
                    self.render_minute_list();
                    self.set_iscroll_minute();
                    self.go_snap(hour - self.option.range.start, 0);
                }

                let data_check = self.check_minimum_time();
                if(data_check != true){
                    document.querySelector('.selector_indicator').style.backgroundColor = '#fe4e6547';
                }else{
                    document.querySelector('.selector_indicator').style.backgroundColor = 'unset';
                }
            }
        });

        self.hour_scroll.on('scrollStart', function (){
            self.user_scroll_hour = true;
        });

        self.minute_scroll.on('scrollEnd', function (){
            if(self.user_scroll_minute == true){
                self.user_scroll_minute = false;
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
                
                let data_check = self.check_minimum_time();
                if(data_check != true){
                    document.querySelector('.selector_indicator').style.backgroundColor = '#fe4e6547';
                }else{
                    document.querySelector('.selector_indicator').style.backgroundColor = 'unset';
                }
            }
        });

        self.minute_scroll.on('scrollStart', function (){
            self.user_scroll_minute = true;
        });
    }

    go_snap (hour, minute){
        let initial_pos_hour = (-hour)*40;
        let initial_pos_minute = -(minute)*8;

        this.hour_scroll.scrollTo(0, initial_pos_hour, 0, IScroll.utils.ease.bounce);
        this.minute_scroll.scrollTo(0, initial_pos_minute, 0, IScroll.utils.ease.bounce);

        $(`${this.target.install} li[data-hpos="${Math.abs(this.hour_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-mpos="${Math.abs(this.minute_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-hpos="${Math.abs(this.hour_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
        $(`${this.target.install} li[data-mpos="${Math.abs(this.minute_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
    }

    get_selected_data (){
        let hour = $(`${this.target.install} li[data-hpos="${Math.abs(this.hour_scroll.y)}"]`);
        let minute = $(`${this.target.install} li[data-mpos="${Math.abs(this.minute_scroll.y)}"]`);

        let hour_text = Number(hour.attr('data-hour'));
        let minute_text = Number(minute.attr('data-min'));
        if(hour_text < 10){
            hour_text = '0' + hour_text;
        }
        if(minute_text < 10){
            minute_text = '0' + minute_text;
        }

        let text = TimeRobot.to_text(hour_text, minute_text);

        return {
            data:{
                hour : hour_text,
                minute: minute_text
            },
            text: text,
            
        };
    }


    static_component (){
        return{
            "initial_html":`<div class="time_selector">
                                <div class="time_selector_confirm">
                                    <div style="float:left;margin-left:5px;">
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', {"padding":"10px 20px"}, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="time_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', {"padding":"10px 20px"}, ()=>{this.upper_right_button();})}
                                    </div>
                                </div>
                                <div class="time_selector_hour_wrap select_wrapper"></div>
                                <div class="time_selector_minute_wrap select_wrapper"></div>
                                <div class="selector_indicator"></div>
                            </div>`
        };
    }

    check_minimum_time(){
        if(this.option.min != null){
            let selected_time = `${this.get_selected_data().data.hour}:${this.get_selected_data().data.minute}`;
            let min_time = `${this.option.min.hour}:${this.option.min.minute}`;

            //24시 00분 보다 큰 24시 05분등을 입력하지 못하게 막는다
            if(this.get_selected_data().data.hour == 24 && this.get_selected_data().data.minute > 0){
                return {message:"입력할 수 없는 시간입니다."};
            }

            let time_compare = TimeRobot.compare(min_time, selected_time); // >= 일경우 true;
            if(time_compare == true){
                return {message:"종료시간은 시작시간보다 커야 합니다."};
            }
        }else{
            //24시 00분 보다 큰 24시 05분등을 입력하지 못하게 막는다
            if(this.get_selected_data().data.hour == 24 && this.get_selected_data().data.minute > 0){
                return {message:"입력할 수 없는 시간입니다."};
            }
        }
        return true;
    }

    upper_right_button(){
        let minimum_check = this.check_minimum_time();
        if(minimum_check != true){
            show_error_message(minimum_check.message);
            return false;
        }

        this.store = this.get_selected_data();
        this.option.callback_when_set(this.store); 
        layer_popup.close_layer_popup();
    }

}

//시간 선택 (오전오후, 시, 분)
class TimeSelector3{
    constructor(install_target, target_instance, user_option){
        this.target = {install: install_target, result: target_instance};

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
            min:null,
            range:{start:0, end:24},
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
        let initial_set_time_data = TimeRobot.to_data(this.option.data.zone, this.option.data.hour, this.option.data.minute);
        this.init_html();
        this.render_hour_list();
        this.render_minute_list(initial_set_time_data.hour >= this.option.range.end ? 5 : 60);
        this.set_iscroll();
        this.reset(this.option.data);
    }

    reset (object){
        let zone = object.zone == null ? this.time.current_zone : object.zone;
        let hour = object.hour == null ? this.time.current_hour : object.hour;
        let minute = object.minute == null ? this.time.current_minute : object.minute;

        let time_data = TimeRobot.to_data(zone, hour, minute);
        //미리 셋팅되어있어야하는 값이 업무시간 외의 시간에 있을 경우
        if((time_data.hour > this.option.range.end && time_data.minute > 0) || time_data.hour < this.option.range.start){
            let time_zone = TimeRobot.to_zone(this.option.range.start, minute);
            zone = time_zone.zone;
            hour = time_zone.hour;
        }

        this.store.value = {zone: zone, hour:hour, minute:minute};
        this.store.text = TimeRobot.to_text(TimeRobot.to_data(zone, hour, minute).hour, TimeRobot.to_data(zone, hour, minute).minute);
        
        let hour_data = TimeRobot.to_data(zone, hour, minute).hour - this.option.range.start;
        let minute_data = TimeRobot.to_data(zone, hour, minute).minute;

        this.go_snap(hour_data, minute_data);
        //값을 저장하고, 스크롤 위치를 들어온 값으로 보낸다.
    }

    init_html (){
        //초기 html 생성
        document.querySelector(this.target.install).innerHTML = this.static_component().initial_html;
    }

    delete (){
        document.querySelector(this.target.install).innerHTML = "";
    }


    render_hour_list (){
        let html_to_join = [];
        let pos = 0;
        let hour_range_start = this.option.range.start;
        let hour_range_end = this.option.range.end;
    
        for(let i=hour_range_start; i<=hour_range_end; i++){
                let morningday;
                let time_for_user;
                if(i < 12 || i == 24){
                    morningday = "오전";
                    time_for_user = i;
                    if(i == 24){
                        time_for_user = 12;
                    }
                }else if(i >= 12){
                    morningday = "오후";
                    time_for_user = i - 12;
                    if(i == 12){
                        time_for_user = 12;
                    }
                }

                html_to_join.push(`<li data-hpos=${pos} data-hour="${i}"><span style="margin-right:16px;">${morningday}</span>${time_for_user}</li>`);
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

    render_minute_list (minute_end){
        let html_to_join = [];
        let pos = 0;
        if(minute_end == undefined){
            minute_end = 60;
        }
        for(let i=0; i<minute_end; i=i+5){
                html_to_join.push(`<li data-mpos=${pos} data-min="${i}">${i}</li>`);
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
        this.hour_scroll = new IScroll(`#hour_wrap_${this.instance}`, {
            mouseWheel : true,
            deceleration:0.005,
            bounce: false,
        });
        
        this.minute_scroll = new IScroll(`#minute_wrap_${this.instance}`, {
            mouseWheel : true,
            deceleration:0.005,
            bounce: false,
        });

        this.set_scroll_snap();
    }

    set_iscroll_minute(){
        this.minute_scroll = new IScroll(`#minute_wrap_${this.instance}`, {
            mouseWheel : true,
            deceleration:0.005,
            bounce: false,
        });
        this.set_scroll_snap();
    }

    set_scroll_snap (){
        let self = this;
        self.hour_scroll.on('scrollEnd', function (){
            if(self.user_scroll_hour == true){
                self.user_scroll_hour = false;
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

                let hour = self.get_selected_data().data.hour_data;
                if(hour >= self.option.range.end){
                    // self.minute_end = 5;
                    self.render_minute_list(5);
                    self.set_iscroll_minute();
                    self.go_snap(hour - self.option.range.start, 0);
                    console.log("go_snap", hour, 0)
                }else{
                    // self.minute_end = 60;
                    self.render_minute_list();
                    self.set_iscroll_minute();
                    self.go_snap(hour - self.option.range.start, 0);
                    console.log("go_snap", hour, 0)
                }

                let data_check = self.check_minimum_time();
                if(data_check != true){
                    document.querySelector('.selector_indicator').style.backgroundColor = '#fe4e6547';
                }else{
                    document.querySelector('.selector_indicator').style.backgroundColor = 'unset';
                }
            }
        });

        self.hour_scroll.on('scrollStart', function (){
            self.user_scroll_hour = true;
        });

        self.minute_scroll.on('scrollEnd', function (){
            if(self.user_scroll_minute == true){
                self.user_scroll_minute = false;
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
                
                let data_check = self.check_minimum_time();
                if(data_check != true){
                    document.querySelector('.selector_indicator').style.backgroundColor = '#fe4e6547';
                }else{
                    document.querySelector('.selector_indicator').style.backgroundColor = 'unset';
                }
            }
        });

        self.minute_scroll.on('scrollStart', function (){
            self.user_scroll_minute = true;
        });
    }

    go_snap (hour, minute){
        let initial_pos_hour = (-hour)*40;
        let initial_pos_minute = -(minute)*8;

        this.hour_scroll.scrollTo(0, initial_pos_hour, 0, IScroll.utils.ease.bounce);
        this.minute_scroll.scrollTo(0, initial_pos_minute, 0, IScroll.utils.ease.bounce);

        $(`${this.target.install} li[data-hpos="${Math.abs(this.hour_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-mpos="${Math.abs(this.minute_scroll.y)}"]`).css('color', '#1e1e1e');
        $(`${this.target.install} li[data-hpos="${Math.abs(this.hour_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
        $(`${this.target.install} li[data-mpos="${Math.abs(this.minute_scroll.y)}"]`).siblings('li').css('color', '#cccccc');
    }

    get_selected_data (){
        let hour = $(`${this.target.install} li[data-hpos="${Math.abs(this.hour_scroll.y)}"]`);
        let minute = $(`${this.target.install} li[data-mpos="${Math.abs(this.minute_scroll.y)}"]`);

        let hour_text = hour.attr('data-hour');
        let minute_text = minute.attr('data-min');

        let zone_form = TimeRobot.to_zone(hour_text, minute_text);
        let text = TimeRobot.to_text(hour_text, minute_text);

        return {
            data:{
                zone : zone_form.zone,
                hour : zone_form.hour,
                minute: zone_form.minute,
                hour_data: hour_text,
                minute_data: minute_text
            },
            text: text,
            
        };
    }


    static_component (){
        return{
            "initial_html":`<div class="time_selector">
                                <div class="time_selector_confirm">
                                    <div style="float:left;margin-left:5px;">
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', {"padding":"10px 20px"}, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="time_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', {"padding":"10px 20px"}, ()=>{this.upper_right_button();})}
                                    </div>
                                </div>
                                <div class="time_selector_hour_wrap select_wrapper"></div>
                                <div class="time_selector_minute_wrap select_wrapper"></div>
                                <div class="selector_indicator"></div>
                            </div>`
        };
    }

    check_minimum_time(){
        if(this.option.min != null){
            let selected_time_data_form = TimeRobot.to_data(this.get_selected_data().data.zone, this.get_selected_data().data.hour, this.get_selected_data().data.minute).complete;
            let min_time_data_form = TimeRobot.to_data(this.option.min.zone, this.option.min.hour, this.option.min.minute).complete;
            // if(selected_time_data_form == '0:0'){
            //     selected_time_data_form = '24:00';
            // }

            //24시 00분 보다 큰 24시 05분등을 입력하지 못하게 막는다
            if(this.get_selected_data().data.zone == 0 && this.get_selected_data().data.hour == 12 && this.get_selected_data().data.minute > 0){
                return {message:"입력할 수 없는 시간입니다."};
            }

            let time_compare = TimeRobot.compare(selected_time_data_form, min_time_data_form); // > 일경우 true;
            if(time_compare == false){
                // show_error_message('종료시간은 시작시간보다 작을 수 없습니다.');
                return {message:"종료시간은 시작시간보다 작을 수 없습니다."};
            }
        }else{
            let selected_time_data_form = TimeRobot.to_data(this.get_selected_data().data.zone, this.get_selected_data().data.hour, this.get_selected_data().data.minute).complete;
            //24시 00분 보다 큰 24시 05분등을 입력하지 못하게 막는다
            if(this.get_selected_data().data.zone == 0 && this.get_selected_data().data.hour == 12 && this.get_selected_data().data.minute > 0){
                return {message:"입력할 수 없는 시간입니다."};
            }
        }
        return true;
    }

    upper_right_button(){
        let minimum_check = this.check_minimum_time();
        if(minimum_check != true){
            show_error_message(minimum_check.message);
            return false;
        }

        this.store = this.get_selected_data();
        this.option.callback_when_set(this.store); 
        layer_popup.close_layer_popup();
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

        self.page_scroll.on('scrollStart', function (){
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
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', {"padding":"10px 20px"}, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="span_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', {"padding":"10px 20px"}, ()=>{this.option.callback_when_set();})}
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

            let id = option_value;
            let title = option_name;
            let icon = DELETE;
            let icon_r_visible = HIDE;
            let icon_r_text = "";
            let style = {"padding-top":"14px", "padding-bottom":"14px"};
            html_to_join.push(
                CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
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

class TicketSelector{
    constructor(install_target, target_instance, multiple_select, appendix, callback){
        // this.targetHTML = install_target;
        this.target = {install : install_target};
        this.target_instance = target_instance;
        this.unique_instance = install_target.replace(/#./gi, "");
        this.callback = callback;
        this.appendix = appendix;
        this.received_data;
        this.multiple_select = multiple_select;
        this.data = {
            id: this.target_instance.ticket.id,
            name: this.target_instance.ticket.name,
            reg_price: this.target_instance.ticket.reg_price,
            reg_count: this.target_instance.ticket.reg_count,
            effective_days : this.target_instance.ticket.effective_days
        };
        this.init();
    }

    init(){
        this.request_list(()=>{
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();ticket_select.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="">${this.appendix.title == null ? '$nbsp;' :this.appendix.title}</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="ticket_select.upper_right_menu();">완료</span></span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list(){
        let html_to_join = [];
        let length = this.received_data.length;
        if(length == 0){
            html_to_join.push(CComponent.no_data_row('수업 목록이 비어있습니다.'));
        }
        for(let i=0; i<length; i++){
            let data = this.received_data[i];
            let ticket_id = data.ticket_id;
            let ticket_name = data.ticket_name;
            let ticket_reg_price = data.ticket_price;
            let ticket_reg_count = data.ticket_reg_count;
            let ticket_effective_days = data.ticket_effective_days;
            let checked = this.target_instance.ticket.id.indexOf(ticket_id) >= 0 ? 1 : 0;
            let html = CComponent.select_ticket_row(
                this.multiple_select, checked, this.unique_instance, ticket_id, ticket_name, ticket_reg_price, ticket_reg_count, ticket_effective_days, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data.id.push(ticket_id);
                        this.data.name.push(ticket_name);
                        this.data.reg_price.push(ticket_reg_price);
                        this.data.reg_count.push(ticket_reg_count);
                        this.data.effective_days.push(ticket_effective_days);
                    }else if(add_or_substract == "substract"){
                        this.data.id.splice(this.data.id.indexOf(ticket_id), 1);
                        this.data.name.splice(this.data.id.indexOf(ticket_id), 1);
                        this.data.reg_price.splice(this.data.id.indexOf(ticket_id), 1);
                        this.data.reg_count.splice(this.data.id.indexOf(ticket_id), 1);
                        this.data.effective_days.splice(this.data.id.indexOf(ticket_id), 1);
                    }else if(add_or_substract == "add_single"){
                        this.data.id = [];
                        this.data.name = [];
                        this.data.reg_price = [];
                        this.data.reg_count = [];
                        this.data.effective_days = [];
                        this.data.id.push(ticket_id);
                        this.data.name.push(ticket_name);
                        this.data.reg_price.push(ticket_reg_price);
                        this.data.reg_count.push(ticket_reg_count);
                        this.data.effective_days.push(ticket_effective_days);
                    }

                    // this.target_instance.ticket = this.data; //타겟에 선택된 데이터를 set
                    
                    if(this.multiple_select == 1){
                        this.upper_right_menu();
                    }
                }  
            );
            if(checked > 0){
                html_to_join.unshift(html);
            }else{
                html_to_join.push(html);
            }
        }
        if(this.appendix.new_add == SHOW){
            let dom_add_new_ticket = this.dom_add_new_ticket();
            html_to_join.unshift(dom_add_new_ticket);
        }
        // document.querySelector(this.targetHTML).innerHTML = html_to_join.join('');
        return html_to_join.join('');
    }

    dom_add_new_ticket(){
        let id = "add_new_ticket";
        let title = "새로운 수강권 생성";
        let icon = '/static/common/icon/icon_plus_pink.png';
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = {"padding":"15px 16px", "border-bottom":"1px solid #cccccc"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_ADD, 100, POPUP_FROM_BOTTOM, null, ()=>{
                ticket_add_popup = new Ticket_add('.popup_ticket_add', ()=>{
                    this.init();
                    return false;
                });
            });
        });

        return html;
    }

    request_list (callback){
        ticket.request_ticket_list("ing", (data)=>{
            this.received_data = data.current_ticket_data;
            callback();
        });
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}

class LectureSelector{
    constructor(install_target, target_instance, multiple_select, appendix, callback){
        this.target = {install : install_target};
        this.target_instance = target_instance;
        this.unique_instance = install_target.replace(/#./gi, "");
        this.callback = callback;
        this.received_data;
        this.appendix = appendix;
        this.multiple_select = multiple_select;
        this.data = {
            id: this.target_instance.lecture.id.slice(),
            name: this.target_instance.lecture.name.slice(),
            state_cd: this.target_instance.lecture.state_cd.slice(),
            max: this.target_instance.lecture.max.slice(),
            type_cd: this.target_instance.lecture.type_cd.slice()
        };
        this.init();
    }

    init(){
        this.request_list(()=>{
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();lecture_select.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="">${this.appendix.title}</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="lecture_select.upper_right_menu();">완료</span></span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list(){
        let html_to_join = [];
        let length = this.received_data.length;
        if(length == 0){
            html_to_join.push(CComponent.no_data_row('수업 목록이 비어있습니다.'));
        }
        for(let i=0; i<length; i++){
            let data = this.received_data[i];
            let lecture_id = data.lecture_id;
            let lecture_name = data.lecture_name;
            let lecture_color_code = data.lecture_ing_color_cd;
            let lecture_max_num = data.lecture_max_num;
            let lecture_state_cd = data.lecture_state_cd;
            let lecture_type_cd = data.lecture_type_cd;
            let lecture_ing_member_num = data.lecture_ing_member_num;
            let checked = this.target_instance.lecture.id.indexOf(lecture_id) >= 0 ? 1 : 0;
            let html = CComponent.select_lecture_row(
                this.multiple_select, checked, this.unique_instance, lecture_id, lecture_name, lecture_color_code, lecture_max_num, lecture_ing_member_num, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data.id.push(lecture_id);
                        this.data.name.push(lecture_name);
                        this.data.max.push(lecture_max_num);
                        this.data.state_cd.push(lecture_state_cd);
                        this.data.type_cd.push(lecture_type_cd);
                    }else if(add_or_substract == "substract"){
                        this.data.id.splice(this.data.id.indexOf(lecture_id), 1);
                        this.data.name.splice(this.data.id.indexOf(lecture_id), 1); // 이름으로 찾기 x, 고유한 ID로
                        this.data.max.splice(this.data.id.indexOf(lecture_id), 1); // 이름으로 찾기 x, 고유한 ID로
                        this.data.state_cd.splice(this.data.id.indexOf(lecture_id), 1); // 이름으로 찾기 x, 고유한 ID로
                        this.data.type_cd.splice(this.data.id.indexOf(lecture_id), 1); // 이름으로 찾기 x, 고유한 ID로
                    }else if(add_or_substract == "add_single"){
                        this.data.id = [];
                        this.data.name = [];
                        this.data.max = [];
                        this.data.state_cd = [];
                        this.data.type_cd = [];
                        this.data.id.push(lecture_id);
                        this.data.name.push(lecture_name);
                        this.data.max.push(lecture_max_num);
                        this.data.state_cd.push(lecture_state_cd);
                        this.data.type_cd.push(lecture_type_cd);
                    }

                    // this.target_instance.lecture = this.data;

                    if(this.multiple_select == 1){
                        this.upper_right_menu();
                    }
                }    
            );
            if(checked > 0){
                html_to_join.unshift(html);
            }else{
                html_to_join.push(html);
            }
        }
        if(this.appendix.new_add == SHOW){
            let dom_add_new_lecture = this.dom_add_new_lecture();
            html_to_join.unshift(dom_add_new_lecture);
        }
        // document.querySelector(this.targetHTML).innerHTML = html_to_join.join('');
        return html_to_join.join('');
    }

    dom_add_new_lecture(){
        let id = "add_new_lecture";
        let title = "새로운 수업 생성";
        let icon = '/static/common/icon/icon_plus_pink.png';
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = {"padding":"15px 16px", "border-bottom":"1px solid #cccccc"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_ADD, 100, POPUP_FROM_BOTTOM, null, ()=>{
                lecture_add_popup = new Lecture_add('.popup_lecture_add', ()=>{
                    this.init();
                    return false;
                });
            });
        });

        return html;
    }

    request_list (callback){
        lecture.request_lecture_list("ing", (data)=>{
            this.received_data = data.current_lecture_data;
            callback();
        });
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}

class MemberSelector{
    constructor(install_target, target_instance, multiple_select, appendix, callback){
        this.target = {install:install_target};
        this.target_instance = target_instance;
        this.unique_instance = install_target.replace(/#./gi, "");
        this.received_data;
        this.callback = callback;
        this.appendix = appendix;
        this.multiple_select = multiple_select;
        this.data = {
            id: [],
            name: []
        };
        this.data.id = this.target_instance.member.id;
        this.data.name = this.target_instance.member.name;
        this.init();
    }

    init(){
        this.request_list(()=>{
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();member_select.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="">${this.appendix.title}</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="member_select.upper_right_menu();">완료</span></span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list (){
        let html_to_join = [];
        let length = this.received_data.length;
        let select_member_num = 0;
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
            let member_fix_state_cd = data.member_fix_state_cd;
            let member_profile_url = data.member_profile_url;
            let checked = this.target_instance.member.id.indexOf(member_id) >= 0 ? 1 : 0; //타겟이 이미 가진 회원 데이터를 get
            // if(this.appendix.disable_zero_avail_count == ON && member_avail_count == 0){
            //     checked = 0;
            // }
            let html = CComponent.select_member_row (
                this.multiple_select, checked, this.unique_instance, member_id, member_name, member_avail_count, member_expiry, member_fix_state_cd, member_profile_url, this.appendix.disable_zero_avail_count, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data.id.push(member_id);
                        this.data.name.push(member_name);
                    }else if(add_or_substract == "substract"){
                        this.data.id.splice(this.data.id.indexOf(member_id), 1);
                        this.data.name.splice(this.data.id.indexOf(member_id), 1);
                    }else if(add_or_substract == "add_single"){
                        this.data.id = [];
                        this.data.name = [];
                        this.data.id.push(member_id);
                        this.data.name.push(member_name);
                    }
                    if(this.multiple_select == 1){
                        this.upper_right_menu();
                    }
                        
                }  
            );
            if(checked!=0){
                select_member_num++;
            }
            if(checked > 0){
                html_to_join.unshift(html);
            }else{
                html_to_join.push(html);
            }
        }
        html_to_join.unshift(`<div class="select_member_max_num" >정원 (<span id="select_member_max_num">${select_member_num}</span>/${this.multiple_select}명) </div>`);

        // document.querySelector(this.targetHTML).innerHTML = html_to_join.join('');
        return html_to_join.join('');
    }

    request_list (callback){
        //Lecture_id를 클래스가 전달받은 경우, 해당 lecture에 속한 회원 리스트를 받아온다.
        //Lecture_id를 클래스가 받지 못한 경우, 모든 진행 회원 리스트를 받아온다.
        if(this.appendix == undefined){
            member.request_member_list("ing", (data)=>{
                this.received_data = data.current_member_data;
                callback();
                show_error_message('수업 정보를 확인할 수 없어, 전체 진행중 회원목록을 가져옵니다.');
            });
        }else if(this.appendix.lecture_id == null){
            member.request_member_list("ing", (data)=>{
                this.received_data = data.current_member_data;
                callback();
            });
        }else{
            let data = {"lecture_id": this.appendix.lecture_id};
            Lecture_func.read_lecture_members(data, (data)=>{
                this.received_data = data.lecture_ing_member_list;
                callback();
            });
        }
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}

class ColorSelector{
    constructor(install_target, target_instance, multiple_select, callback){
        this.target = {install:install_target};
        this.target_instance = target_instance;
        this.unique_instance = install_target.replace(/#./gi, "");
        this.callback = callback;
        this.received_data;
        this.multiple_select = multiple_select;
        this.data = {
            bg: [],
            font:[],
            name: []
        };
        this.data.bg = this.target_instance.color.bg;
        this.data.font = this.target_instance.color.font;
        this.data.name = this.target_instance.color.name;
        this.init();
    }

    init(){
        this.request_list(()=>{
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();color_select.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="color_select.upper_right_menu();">완료</span></span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list (){
        let html_to_join = [];
        let length = this.received_data.length;
        if(length == 0){
            html_to_join.push(CComponent.no_data_row('목록이 비어있습니다.'));
        }
        for(let i=0; i<length; i++){
            let data = this.received_data[i];
            let bg_code = data.color_code;
            let font_code = data.color_font_code;
            let name = COLOR_NAME_CODE[data.color_code];
            let checked = this.target_instance.color.bg.indexOf(bg_code) >= 0 ? 1 : 0; //타겟이 이미 가진 색상 데이터를 get
            let html = CComponent.select_color_row (
                this.multiple_select, checked, this.unique_instance, bg_code, font_code, name, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data.bg.push(bg_code);
                        this.data.font.push(font_code);
                        this.data.name.push(name);
                    }else if(add_or_substract == "substract"){
                        this.data.bg.splice(this.data.name.indexOf(name), 1);
                        this.data.font.splice(this.data.name.indexOf(name), 1);
                        this.data.name.splice(this.data.name.indexOf(name), 1);
                    }else if(add_or_substract == "add_single"){
                        this.data.bg = [];
                        this.data.font = [];
                        this.data.name = [];
                        this.data.bg.push(bg_code);
                        this.data.font.push(font_code);
                        this.data.name.push(name);
                    }

                    // this.target_instance.color = this.data; //타겟에 선택된 데이터를 set

                    if(this.multiple_select == 1){
                        this.upper_right_menu();
                    }
                        
                }  
            );
            html_to_join.push(html);
        }

        // document.querySelector(this.target.install).innerHTML = html_to_join.join('');
        return html_to_join.join('');
    }

    request_list (callback){
        let color_data = [
            {color_code:"#fbf3bd", color_font_code:"#282828"},
            {color_code:"#dbe6f7", color_font_code:"#282828"},
            {color_code:"#ffd3d9", color_font_code:"#282828"},
            {color_code:"#ffe3c2", color_font_code:"#282828"},
            {color_code:"#ceeac4", color_font_code:"#282828"},
            {color_code:"#d8d6ff", color_font_code:"#282828"},
            {color_code:"#ead8f2", color_font_code:"#282828"},
            {color_code:"#d9c3ab", color_font_code:"#282828"}
        ];
        this.received_data = color_data;
        callback();
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
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
            min:null,
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

        this.data = {
            year: this.option.data.year, month:this.option.data.month, date:this.option.data.date
        };

        this.init();
    }

    set dataset (object){
        let year = object.data.year == null ? this.date.current_year : object.data.year; // 값이 들어왔으면 값대로, 아니면 현재값으로
        let month = object.data.month == null ? this.date.current_month : object.data.month;
        let date = object.data.date == null ? this.date.current_date : object.data.date;
        this.store.data = {year: year, month:month, date:date};
        this.store.text = DateRobot.to_text(year, month, date, SHORT);
    }

    get dataset (){
        return this.store;
    }

    next(){
        let next_year = this.data.month+1 > 12 ? this.data.year +1 :  this.data.year;
        let next_month = this.data.month+1 > 12 ? 1 : this.data.month + 1;

        this.data.year = next_year;
        this.data.month = next_month;
        this.render_datepicker();
    }

    prev(){
        let prev_year = this.data.month-1 == 0 ? this.data.year -1 :  this.data.year;
        let prev_month = this.data.month-1 == 0 ? 12 : this.data.month - 1;

        this.data.year = prev_year;
        this.data.month = prev_month;
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
        let reference_date_year = this.data.year;
        let reference_date_month = this.data.month;
        let reference_date_date = this.data.date;
        let reference_date_month_last_day = new Date(reference_date_year, reference_date_month, 0).getDate();
        let current_month_first_date_day = new Date(reference_date_year, reference_date_month-1, 1).getDay();

        //달력의 상단 표기 부분 (년월표기, 버튼)
        let month_calendar_upper_tool = `<div class="pters_month_cal_upper_tool_box" style="text-align:center;height:30px;">
                                            <div class="pters_month_cal_tool_date_text">
                                                <div class="obj_font_size_15_weight_bold">
                                                    ${CComponent.image_button('date_picker_prev', '뒤로', '/static/common/icon/icon_circle_arrow_l_pink.png', null, ()=>{this.prev();})}
                                                    ${Number(reference_date_year)}년 ${Number(reference_date_month)}월
                                                    ${CComponent.image_button('date_picker_next', '앞으로', '/static/common/icon/icon_circle_arrow_r_pink.png', null, ()=>{this.next();})}
                                                </div>
                                            </div>
                                        </div>`;

        //달력의 월화수목금 표기를 만드는 부분
        let month_day_name_text = `<div class="pters_month_cal_day_name_box obj_table_raw obj_font_size_11_weight_500" style="text-align:center;margin-bottom:10px;"> 
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
                let date_compare = false;
                if(this.option.min != null){
                    date_compare = DateRobot.compare(`${this.option.min.year}-${this.option.min.month}-${this.option.min.date}`, data_date);
                    if(date_compare == true){
                        //날짜가 min date보다 전 일경우
                    }
                }

                let font_color = "";
                let today_style = "";
                let date = date_cache;
                if(j == 0){
                    font_color = 'color:#ff3333;';
                }else if(j == 6){
                    font_color = 'color:#3392ff;';
                }else{
                    font_color = 'color:#5c5859;';
                }
                if(date_compare == true){
                    font_color = 'color:#cccccc';
                }

                //오늘 날짜 표기
                if(this.date.current_year == reference_date_year && this.date.current_month == reference_date_month && this.date.current_date == date_cache){
                    date = `<div style="display:inline-block;height:25px;width:25px;line-height:26px;border-radius:50%;background-color:#fe4e65;">${date_cache}</div>
                            <div style="position: absolute;top: -15px;left: 50%;color: #fe4e65;font-size: 10px;transform: translateX(-50%);">Today</div>`;
                    today_style = 'color:#ffffff;position:relative';
                }else if(reference_date_year == this.option.data.year && reference_date_month == this.option.data.month && date_cache == this.option.data.date){
                    date = `<div style="display:inline-block;height:25px;width:25px;line-height:26px;border-radius:50%;background-color:#4747ff;">${date_cache}</div>
                            <div style="position: absolute;top: -15px;left: 50%;color: #4747ff;font-size: 10px;transform: translateX(-50%);">선택</div>`;
                    today_style = 'color:#ffffff;position:relative';
                }

                if(i==0 && j<current_month_first_date_day){ //첫번째 주일때 처리
                    dateCellsToJoin.push(`<div class="obj_table_cell_x7"></div>`);
                }else if(date_cache > reference_date_month_last_day){ // 마지막 날짜가 끝난 이후 처리
                    dateCellsToJoin.push(`<div class="obj_table_cell_x7"></div>`);
                }else{
                    dateCellsToJoin.push(`<div class="obj_table_cell_x7 obj_font_size_13_weight_500" data-date="${data_date}" id="calendar_cell_${data_date}"" style="cursor:pointer;">
                                               <div class="calendar_date_number" style="${font_color}${today_style}">${date}</div>
                                          </div>`);
                    $(document).off('click', `#calendar_cell_${data_date}`).on('click', `#calendar_cell_${data_date}`, ()=>{
                        if(date_compare != true){
                            let date = Number(data_date.split('-')[2]);
                            this.dataset = {data:{year:reference_date_year, month:reference_date_month, date}};
                            this.option.callback_when_set(this.store); 
                            layer_popup.close_layer_popup();
                        }else{
                            show_error_message('종료일은 시작일보다 빠를수 없습니다.');
                        }
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
                                                                <div class="obj_box_full" style="border:0">
                                                                ${month_day_name_text}${calendar_assembled}
                                                                </div>`;
    }



    static_component (){
        return{
            "initial_html":
                            `<div class="date_selector">
                                <div class="date_selector_confirm">
                                    <div style="position:absolute;margin-left:5px;">
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', {"padding":"10px 20px"}, ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="date_selector_title">${this.option.title}</span>
                                </div>
                                <div class="date_picker_selector_wrap"></div>
                            </div>`
        };
    }
}

class RepeatSelector{
    constructor(install_target, target_instance, data_from_external, callback){
        this.target = {install:install_target};
        this.target_instance = target_instance;
        this.unique_instance = install_target.replace(/#./gi, "");
        this.data_from_external = data_from_external;
        this.callback = callback;

        let d = new Date();
        this.dates = {
            current_year: d.getFullYear(),
            current_month: d.getMonth()+1,
            current_date: d.getDate()
        };

        this.data = {
            power: OFF,
            day: [],
            repeat_end: {year:null, month:null, date:null}
        };
        
        this.init();
        this.set_initial_data();
    }

    set power(data){
        this.data.power = data;
        this.render();
    }

    set day(selected_array){
        this.data.day = selected_array;
        this.render();
    }

    get day(){
        return this.data.day;
    }

    set end_date(data){
        this.data.repeat_end = data;
        this.render();
    }

    init(){
        this.render();
    }

    set_initial_data(){
        this.data = this.target_instance.repeat;
        this.init();
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="repeat_select.upper_right_menu();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="">반복 일정</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;">&nbsp;</span></span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list (){
        let day = this.dom_row_day_select_button();
        let end = this.dom_row_end_date_select_button();
        let power = this.dom_row_repeat_power();

        let html = day + end + '<div class="gap" style="border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>' + power;
        return html;
    }

    dom_row_repeat_power(){
        let multiple_select = 1;
        let checked = this.data.power == OFF ? 1 : 0; //타겟이 이미 가진 색상 데이터를 get
        let id = "repeat_power";
        let title = "반복 안함";
        let icon = NONE;
        let html = CComponent.select_row (multiple_select, checked, this.unique_instance, id, title, icon, ()=>{   
                this.power = OFF;
                this.day = [];
                this.end_date = {year:null, month:null, date:null};
            }  
        );
        return html;
    }

    dom_row_day_select_button(){
        let id = 'select_day';
        let title = this.data.day.length == 0 ? '요일 지정' : this.data.day.map((el)=>{return DAYNAME_MATCH[el];}).join(', ');
        let icon = NONE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_day_select', 100, popup_style, null, ()=>{
                day_select = new DaySelector('#wrapper_box_day_select', this, 7, (set_data)=>{
                    this.day = set_data.day;
                    if(set_data.day.length > 0){
                        this.power = ON;
                    }
                });
            });
        });
        return html;
    }

    dom_row_end_date_select_button(){
        let id = 'select_end_date';
        let title = this.data.repeat_end.year == null ? '반복 종료일' : DateRobot.to_text(this.data.repeat_end.year, this.data.repeat_end.month, this.data.repeat_end.date)+' 까지';
        let icon = NONE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'repeat_end_date', title:'반복 종료일', min:this.data_from_external,
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.end_date = object.data; 
                                                                                                    this.power = ON;
                }});
            });
        });
        return html;
    }

    upper_right_menu(){
        if(this.data.power == OFF){
            this.data.day = [];
            this.data.repeat_end = {year:null, month:null, date:null};
        }else{
            if(this.data.day.length == 0){
                show_error_message("반복 요일을 선택 해주세요.");
                return false;
            }
            if(this.data.repeat_end.year == null){
                show_error_message("반복 종료일을 선택 해주세요.");
                return false;
            }
        }

        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}

class DaySelector{
    constructor(install_target, target_instance, multiple_select, callback){
        this.target = {install:install_target};
        this.target_instance = target_instance;
        this.unique_instance = install_target.replace(/#./gi,"");
        this.callback = callback;
        this.received_data;
        this.multiple_select = multiple_select;
        this.data = {
            day:[]
        };
        this.init();
        this.set_initial_data();
    }


    init(){
        this.render();
    }

    set_initial_data(){
        this.data.day = this.target_instance.day;
        this.init();
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="day_select.upper_right_menu();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="day_select.upper_right_menu();">완료</span></span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list (){
        let html_to_join = [];
        for(let i=0; i<7; i++){
            let checked = this.data.day.indexOf(DAYNAME_EN_SHORT[i]) != -1 ? 1 : 0; //타겟이 이미 가진 데이터를 get
            let id = `day_${i}`;
            let title = DAYNAME_KR[i]+'요일';
            let icon = NONE;
            let html = CComponent.select_row (this.multiple_select, checked, this.unique_instance, id, title, icon, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data.day.push(DAYNAME_EN_SHORT[i]);
                        this.render();
                    }else if(add_or_substract == "substract"){
                        this.data.day.splice(this.data.day.indexOf(DAYNAME_EN_SHORT[i]), 1);
                        this.render();
                    }else if(add_or_substract == "add_single"){
                        this.data.day = [DAYNAME_EN_SHORT[i]];
                        this.upper_right_menu();
                    }
                }  
            );
            html_to_join.push(html);
        }


        return html_to_join.join('');
    }

    request_list (callback){
        // this.received_data = color_data;
        // callback();
    }

    arrange_day_names(){
        // ["TUE", "SUN", "MON", ];
        let days = ["MON", "TUE", "WED", "THS", "FRI", "SAT", "SUN"];
        let news = [];
        for(let i=0; i<days.length; i++){
            let search = this.data.day.indexOf(days[i]);
            if(search != -1){
                news.push(days[i]);
            }
        }
        return news;
    }

    upper_right_menu(){
        this.data.day = this.arrange_day_names();
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}

class CategorySelector{
    constructor(install_target, target_instance, multiple_select, upper_category, callback){
        this.target = {install:install_target};
        this.target_instance = target_instance;
        this.unique_instance = install_target.replace(/#./gi, "");
        this.upper_category = upper_category;
        this.callback = callback;
        this.received_data;
        this.multiple_select = multiple_select;
        this.data = {
            name:[],
            code:[]
        };
        this.init();
        this.set_initial_data();
    }


    init(){
        this.render();
    }

    set_initial_data(){
        this.data.name = this.target_instance.category.name;
        this.data.code = this.target_instance.category.code;
        this.init();
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="category_select.upper_right_menu();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="category_select.upper_right_menu();">완료</span></span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list (){
        let category_to_be_drawn = this.upper_category == null ? PROGRAM_CATEGORY : PROGRAM_CATEGORY[this.upper_category].sub_category;
        let html_to_join = [];
        for(let item in category_to_be_drawn){
            let checked = this.data.code.indexOf(item) != -1 ? 1 : 0; //타겟이 이미 가진 데이터를 get
            let id = `category_${item}`;
            let multiple_select = this.multiple_select;
            let title = category_to_be_drawn[item].name;
            let location = this.unique_instance;
            let icon = NONE;
            let html = CComponent.select_row (multiple_select, checked, location, id, title, icon, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data.name.push(category_to_be_drawn[item].name);
                        this.data.code.push(item);
                        this.render();
                    }else if(add_or_substract == "substract"){
                        this.data.name.splice(this.data.code.indexOf(item, 1));
                        this.data.code.splice(this.data.code.indexOf(item, 1));
                        this.render();
                    }else if(add_or_substract == "add_single"){
                        this.data.name = [category_to_be_drawn[item].name];
                        this.data.code = [item];
                        this.upper_right_menu();
                    }
                }  
            );
            html_to_join.push(html);
        }


        return html_to_join.join('');
    }

    request_list (callback){
        // this.received_data = color_data;
        // callback();
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}

class CustomSelector{
    constructor(title, install_target, multiple_select, data, selected_data, callback){
        this.title = title;
        this.target = {install:install_target};
        this.unique_instance = install_target.replace(/#./gi, "");
        this.callback = callback;
        this.full_data = data;
        this.selected_data = selected_data;
        this.multiple_select = multiple_select;
        this.data = {
            value:[],
            text:[]
        };
        this.init();
        this.set_initial_data();
    }

    init(){
        this.render();
    }

    set_initial_data(){
        this.data.value = this.selected_data.value;
        this.data.text = this.selected_data.text;
        this.init();
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="custom_selector.upper_right_menu();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center">
                            <span id="">${this.title}</span>
                          </span>`;
        let top_right = `<span class="icon_right">
                            <span style="color:#fe4e65;font-weight: 500;" onclick="custom_selector.upper_right_menu();">${this.multiple_select == 1 ? '' : '완료'}</span>
                        </span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list (){
        let html_to_join = [];
        let length = this.full_data.value.length;
        for(let i=0; i<length; i++){
            let checked = this.data.value.indexOf(this.full_data.value[i]) != -1 ? 1 : 0; //타겟이 이미 가진 데이터를 get
            let id = `custom_selector_${this.unique_instance}_${i}`;
            let title = this.full_data.text[i];
            let icon = NONE;
            let html = CComponent.select_row (this.multiple_select, checked, this.unique_instance, id, title, icon, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data.value.push(this.full_data.value[i]);
                        this.data.text.push(this.full_data.text[i]);
                        this.render();
                    }else if(add_or_substract == "substract"){
                        this.data.value.splice(this.data.value.indexOf(this.full_data.value[i]), 1);
                        this.data.text.splice(this.data.text.indexOf(this.full_data.value[i]), 1);
                        this.render();
                    }else if(add_or_substract == "add_single"){
                        this.data.value = [this.full_data.value[i]];
                        this.data.text = [this.full_data.text[i]];
                        this.upper_right_menu();
                    }
                }  
            );
            html_to_join.push(html);
        }


        return html_to_join.join('');
    }

    request_list (callback){
        // this.received_data = color_data;
        // callback();
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}

class PasswordFourDigitInput{
    constructor(title, install_target, original_data, callback){
        this.title = title;
        this.target = {install:install_target};
        this.unique_instance = install_target.replace(/#./gi, "");
        this.callback = callback;
        this.original_data = original_data;
        this.data = {
            password:null
        };
        this.init();
        this.set_initial_data();
    }

    init(){
        this.render();
    }

    set_initial_data(){
        this.data.password = this.original_data;
        this.init();
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="password_4d_input.upper_right_menu();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center">
                            <span id="">${this.title}</span>
                          </span>`;
        let top_right = `<span class="icon_right">
                            <span style="color:#fe4e65;font-weight: 500;" onclick="password_4d_input.upper_right_menu();">완료</span>
                        </span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list (){
        let html = this.dom_row_input() + 
                    `<div style="font-size:12px;color:#5c5859;text-align:center;">초기 비밀번호는 0000입니다.<br>암호화 되어 저장되지 않으므로 일상적인 번호로 하세요.</div>`;

        return html;
    }

    dom_row_input(){
        let html = `<div style="margin:40px 0;">
                        <div style="text-align:center;">
                            <input id="password_4d_input_field" type="tel" maxlength=4 style="-webkit-appearance:none;border:0;background-color:unset;width:260px;letter-spacing:33px;font-size:40px;font-weight:500;text-align:left;margin:0 auto;padding-left:37px;box-sizing:border-box" value="${this.data.password}">
                        </div>
                        <div style="height:2px;width:220px;text-align:center;margin:0 auto">
                            <div id="password_digit_1" class="password_4d_input_bar"></div>
                            <div id="password_digit_2" class="password_4d_input_bar"></div>
                            <div id="password_digit_3" class="password_4d_input_bar"></div>
                            <div id="password_digit_4" class="password_4d_input_bar"></div>
                        </div>
                    </div>`;
        let self = this;
        $(document).off('focusout', '#password_4d_input_field').on('focusout', '#password_4d_input_field', function(e){
            let user_input_data = e.target.value;
            self.data.password = user_input_data;
        });
        return html;
    }

    request_list (callback){
        // this.received_data = color_data;
        // callback();
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}

class BoardWriter{
    constructor(title, install_target, instance, data, callback){
        this.title = title;
        this.target = {install:install_target, instance:instance, upper_html:"section_board_writer_upper_html", category_selector:"section_board_writer_category_selector", content_writer:"section_board_writer_content_writer"};
        this.callback = callback;
        this.external_data = data;
        this.data = {
            title:null,
            content:null,
            category:[
                
            ],
            category_selected:{
                
            }
        };
        // this.init();
        this.set_initial_data();
        this.init();
    }

    init(){
        this.render();
    }

    set_initial_data(){
        for(let item in this.external_data){
            if(this.external_data[item] != undefined){
                this.data[item] = this.external_data[item];
            }
        }
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="${this.target.instance}.close();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center">
                            <span id="">${this.title}</span>
                          </span>`;
        let top_right = `<span class="icon_right">
                            <span style="color:#fe4e65;font-weight: 500;" onclick="${this.target.instance}.upper_right_menu();">저장</span>
                        </span>`;
        let content =   `<section id="${this.target.upper_html}">${this.data.upper_html != null ? this.data.upper_html : ""}</section>`+
                        `<section id="${this.target.category_selector}">${this.dom_assembly_category()}</section>`+
                        `<section id="${this.target.content_writer}">${this.dom_content_assembly()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        this.init_summernote();
    }

    render_upper_html(){
        let html = this.data.upper_html != null ? this.data.upper_html : ""
        document.getElementById(this.target.upper_html).innerHTML = html;
    }

    render_category_selector(){
        let html = this.dom_assembly_category();
        document.getElementById(this.target.category_selector).innerHTML = html;
    }

    render_content_writer(){
        let html = this.dom_content_assembly();
        document.getElementById(this.target.content_writer).innerHTML = html;
    }

    dom_content_assembly (){
        // let upper_html = this.data.upper_html != null ? this.data.upper_html : "";
        let title_input = `<div class="obj_input_box_full" style="padding:8px 16px;">`+ this.dom_row_subject_input() + `</div>`;
        let content_input = `<div class="obj_input_box_full">` + this.dom_row_content_input() + `</div>`;
        // let category = this.dom_assembly_category();
        let bottom_html = this.data.bottom_html != null ? this.data.bottom_html : "";

        if(this.data.visibility.title == HIDE){
            title_input = "";
        }
        if(this.data.visibility.content == HIDE){
            content_input = "";
        }

        let html =  
                    title_input + 
                    content_input +
                    bottom_html;

        return html;
    }

    dom_assembly_category(){
        let length = this.data.category.length;
        let html_to_join = [];
        for(let i=0; i<length; i++){
            let html = this.dom_row_category(this.data.category[i]);
            html_to_join.push(html);
        }
        return html_to_join.join("");
    }

    dom_row_subject_input(){
        let id = "dom_row_subject_input";
        let title = this.data.title != null ? this.data.title : "";
        let placeholder = "제목";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let onfocusout = (data)=>{
            this.data.title = data;
            // this.render_content();
        };
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let row = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, onfocusout, pattern, pattern_message, required);
        let html = row;
        return html;
    }

    dom_row_content_input(){
        let row = `<div id="board_writer_content_input"></div>`;
        let html = row;
        return html;
    }

    dom_row_category(data){
        let category_id = data.id;
        let category_title = data.title;
        let category_data = data.data;

        let id = `dom_row_category_${category_id}`;
        let title = category_title;
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.category_selected[category_id].text.length == 0 ? '' : this.data.category_selected[category_id].text;
        // let style = {"display":"inline-block", 'padding':"16px", "padding-right":"0", "width":"43%", "min-width":"170px", "max-width":"208px", "font-size":"14px"};
        let style = {"display":"inline-block", 'padding':"16px", "padding-right":"0", "width":"43%", "min-width":"300px", "max-width":"320px", "font-size":"14px"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = category_title;
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = category_data;
            let selected_data = this.data.category_selected[category_id];
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.category_selected[category_id] = set_data;
                    this.render_category_selector();
                });
            });
        });
        let html = row;
        return html;
    }

    init_summernote(){
        let popup_width = $root_content.width();
        let category_width = 320;
        let category_row_number = this.data.category.length / Math.floor(popup_width/category_width);

        let wrapper_top_height = 60;
        let category_height = 61 * category_row_number;
        let title_input_height = 65;
        let summer_note_toolbar_height = 42;
        let summer_note_textarea_padding = 32;
        let wrapper_bottom_padding_height = 60;

        let summer_note_textarea_height = $root_content.height() - wrapper_top_height - category_height - title_input_height - summer_note_toolbar_height -summer_note_textarea_padding - wrapper_bottom_padding_height;

        let summernote_attachment = {"name":[], "size":[]};
        $(`#board_writer_content_input`).summernote({
            minHeight: 150,
            maxHeight:summer_note_textarea_height,
            fontSizes:['12', '14', '16'],
            placeholder: "내용을 입력해주세요.",
            tabsize: 2,
            lang: 'ko-KR',
            toolbar: [
                ['style', ['bold', 'italic', 'underline', 'clear']],
                // ['fontsize', ['fontsize']],
                ['color', ['color']],
                ['insert', ['picture', 'video']],
                ['para', ['paragraph']],
                ['table', ['table']],
            ],
            focus: false,
            // fontSize: 14,
            maximumImageFileSize: 10485760,
            callbacks:{
                onImageUpload: function(files) {
                    if(board_writer.data.category_selected['type'].text.length == 0){
                        show_error_message('게시글 분류부터 선택해주세요.');
                        return false;
                    }
                    // upload image to server and create imgNode...
                    let img_error_flag = false;
                    for (let i = files.length - 1; i >= 0; i--) {
                        if(files[i].size > 10485760){
                            show_error_message('이미지는 최대 10mb까지 업로드 가능합니다.');
                            img_error_flag = true;
                            break;
                        }
                    }
                    if(!img_error_flag){
                        for (let i = files.length - 1; i >= 0; i--) {
                            summernote_attachment["name"].push(files[i].name);
                            summernote_attachment["size"].push(files[i].size/1024000);
                            board_writer.update_content_img(files[i]);
                        }
                    }
                }
            },
        });
        if(this.data.content == "" || this.data.content == null){
            this.data.content = " "
        }

        $(`#board_writer_content_input`).summernote('code', this.data.content);
        $('.note-editable').blur();
    }

    update_content_img(file){
        let date = new Date();
        let content_img_file_name = file.name+'_'+file.lastModified+'_'+date.getTime();
        let form_data = new FormData();
        form_data.append('content_img_file', file);
        form_data.append('content_img_file_name', file.lastModified+'_'+file.name);
        form_data.append('board_type_cd', this.data.category_selected['type'].value);
        $.ajax({
            url: '/trainer/update_trainer_board_content_img/',
            data: form_data,
            dataType : 'JSON',
            type:'POST',
            processData: false,
            contentType: false,
            enctype:'multipart/form-data',

            beforeSend: function (xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
                ajax_load_image(SHOW);
            },

            success:function(data){
                if(data.messageArray != undefined) {
                    if (data.messageArray.length > 0) {
                        show_error_message(data.messageArray);
                        return false;
                    }
                }
                $('#board_writer_content_input').summernote('insertImage', jsondata.img_url);
            },

            complete:function(){
                ajax_load_image(HIDE);
            },

            error:function(){
                //alert('통신이 불안정합니다.');
                show_error_message('통신이 불안정합니다.');
            }
        });
    }

    request_list (callback){
        // this.received_data = color_data;
        // callback();
    }

    close(){
        this.clear();
        layer_popup.close_layer_popup();
    }

    upper_right_menu(){
        let content_value = $('#board_writer_content_input').summernote('code');
        this.data.content = content_value;

        if(this.data.title == null){
            show_error_message("제목을 입력해주세요.");
            return false;
        }
        if(this.data.content.length <= 1 && this.data.visibility.content != HIDE){
            show_error_message("내용을 입력해주세요.");
            return false;
        }
        if(this.data.category.length > 0){
            let selected_value_ok = true;
            for(let item in this.data.category_selected){
                if(this.data.category_selected[item].value.length == 0){
                    selected_value_ok = false;
                }
            }
            if(selected_value_ok == false){
                show_error_message("카테고리를 선택해주세요.")
                return false;
            }
        }

        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}

class BoardReader{
    constructor(title, install_target, instance, data){
        this.title = title;
        this.target = {install:install_target, instance:instance};
        this.external_data = data;
        this.data = {
            title:null,
            content:null,
            date:null,
            writer:null,
            status:null,
            type:null,

            answer_title:null,
            answer_content:null,
            answer_date:null,
            answer_writer:null,
            andwer_type:null
        };
        this.set_initial_data();
        this.init();
    }

    init(){
        this.render();
    }

    set_initial_data(){
        for(let item in this.external_data){
            if(this.external_data[item] != undefined){
                this.data[item] = this.external_data[item];
            }
        }
        // this.data.title = this.external_data.title != null ? this.external_data.title : null;
        // this.data.content = this.external_data.content != null ? this.external_data.content : null;
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="${this.target.instance}.upper_right_menu();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center">
                            <span id="">${this.title}</span>
                          </span>`;
        let top_right = `<span class="icon_right">
                        </span>`;
        let content =   `<section>${this.dom_assembly()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_assembly (){
        let title = this.dom_row_title();
        let content = this.dom_row_content();
        let answer = this.dom_assemble_answer();
        if(this.data.answer_title == null && this.data.answer_content == null){
            answer = "";
        }

        let html = `<div style="padding:20px;">`+ title + `</div>` + 
                    `<div style="padding:20px;">` + content + `</div>` +
                    answer;

        return html;
    }

    dom_row_title(){
        let date = this.data.date == null ? "" : this.data.date;
        if(date != null){
            let date_info_split = date.split(' ')[0];
            let date_info = date_info_split.split('-');
            let date_text = DateRobot.to_text(date_info[0], date_info[1], date_info[2]);
            let time_info_split = date.split(' ')[1];
            let time_text = TimeRobot.to_text(time_info_split.split(':')[0] ,time_info_split.split(':')[1]);
            date = date_text + '  ' + time_text;
        }

        let html = `<div style="font-size:20px;font-weight:bold;color:#3d3b3b;letter-spacing:-0.9px;">
                        <span>${this.data.type == null ? "" : '['+this.data.type+']'}</span> 
                        ${this.data.title == null ? "" : this.data.title} 
                        <span style="float:right;font-size:13px;letter-spacing:-0.6px">${this.data.status == null ? "" : this.data.status}</span>
                        <div style="font-size:12px;font-weight:500;letter-spacing:-0.6px;color:#858282;">${date}</div>
                    </div>`;
        return html;
    }

    dom_row_content(){
        let html = `<div style="font-size:15px;font-weight:500;letter-spacing:-0.6px;color:#5c5859;" id="board_reader_content">
                        ${this.data.content == null ? "" : this.data.content}
                    </div>`;
        $(document).off('click', '#board_reader_content img').on('click', '#board_reader_content img', function(){
            let board_reader_content_width = $('#board_reader_content').width();
            if($(this).hasClass('zoomed') == false){
                let original_size = 100*$(this).width()/board_reader_content_width + '%';
                $(this).css({'transition':'0.4s', 'width':"100%"});
                $(this).addClass('zoomed');
                $(this).attr('data-oriwidth', original_size);
            }else{
                let original_size = $(this).attr('data-oriwidth');
                $(this).css({'width':original_size});
                $(this).removeClass('zoomed');
            }
        });
        return html;
    }

    dom_assemble_answer(){
        let title = this.dom_row_answer_title();
        let content = this.dom_row_answer_content();

        let html = `<div class="obj_input_box_full" style="padding:20px 20px 20px 40px;">` + title + content + `</div>`;
        return html;
    }

    dom_row_answer_title(){
        let date = this.data.answer_date == null ? "" : this.data.answer_date;
        if(date != ""){
            let date_info_split = date.split(' ')[0];
            let date_info = date_info_split.split('-');
            let date_text = DateRobot.to_text(date_info[0], date_info[1], date_info[2]);
            let time_info_split = date.split(' ')[1];
            let time_text = TimeRobot.to_text(time_info_split.split(':')[0] ,time_info_split.split(':')[1]);
            date = date_text + '  ' + time_text;
        }

        let html = `<div style="font-size:16px;font-weight:bold;color:#3d3b3b;letter-spacing:-0.9px;margin-bottom:40px;">
                        답글 : ${this.data.answer_title == null ? "" : this.data.answer_title}
                        <div style="font-size:12px;font-weight:500;letter-spacing:#858282;color:#858282;">${date}</div>
                    </div>`;
        return html;
    }

    dom_row_answer_content(){
        let html = `<div style="font-size:15px;font-weight:500;letter-spacing:-0.6px;color:#5c5859;">
                        ${this.data.answer_content == null ? "" : this.data.answer_content}
                    </div>`;
        return html;
    }


    request_list (callback){
    }

    upper_right_menu(){
        layer_popup.close_layer_popup();
        this.clear();
    }
}


class DrawingBoard{
    constructor(install_target, instance, data){
        this.target = {install: install_target, canvas: "#canvas"};
        this.instance = instance;
        this.external_data = data;

        this.data = {
            title:null,
            description:null,
            color:{
                pencil:"#282828",
                paper:"#ffffff"
            },
            width:"320",
            height:"200",
            border:0,
            callback:()=>{}
        }
        this.user_input_status = OFF;

        this.pos = {
            drawable : false,
            x: -1,
            y: -1
        };
        
        this.ctx;

        //유저가 터치인지 마우스 사용인지 알아낸다
        this.touch_or_mouse = "";

        this.set_initial_data();
        this.init();
    }

    init(){
        this.render();
        this.init_canvas();
    }

    init_canvas(){
        let canvas = document.querySelector(this.target.canvas);
        this.ctx = canvas.getContext("2d");
        this.ctx.clearRect(0, 0, this.data.width, this.data.height);
        canvas.addEventListener("mousedown", this.listener);
        canvas.addEventListener("mousemove", this.listener);
        canvas.addEventListener("mouseup", this.listener);
        canvas.addEventListener("mouseout", this.listener);
        canvas.addEventListener("touchstart", this.listener);
        canvas.addEventListener("touchmove", this.listener);
        canvas.addEventListener("touchend", this.listener);
        canvas.addEventListener("touchcancel", this.listener);
    }

    set_initial_data(){
        for(let item in this.external_data){
            if(this.external_data[item] != undefined){
                this.data[item] = this.external_data[item];
            }
        }
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_x_black.png" onclick="${this.instance}.close();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center">
                            <span id="">${this.data.title}</span>
                          </span>`;
        let top_right = `<span class="icon_right">
                            <span style="color:#fe4e65;font-weight: 500;" onclick="${this.instance}.upper_right_menu();">완료</span>
                        </span>`;
        let content =   `<section>${this.dom_assembly()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_assembly (){
        let title = `<div style="padding:20px;">`+ this.dom_row_title() + `</div>`;
        let content = `<div style="background-color:${this.data.color.paper}">` + this.dom_row_content() + `</div>`;

        let html =  content;

        return html;
    }

    dom_row_title(){
        let html = `<div style="font-size:20px;font-weight:bold;color:#3d3b3b;letter-spacing:-0.9px;">
                        ${this.data.title}
                    </div>`;
        return html;
    }

    dom_row_content(){
        let html = `<div style="position:relative;margin:0 auto;width:${this.data.width}px;height:${this.data.height}px;border:1px solid ${this.user_input_status == ON ? '#fe4e65' : '#cccccc'}">
                        <div style="position:absolute;width:100%;top:0;left:0;text-align:center;font-size:13px;font-weight:normal;letter-spacing:-0.6px;opacity:0.8;color:${this.data.color.pencil};">${this.data.description}</div>
                        <canvas id="canvas" width="${this.data.width}" height="${this.data.height}" style="border:${this.data.border};background-color:${this.data.color.paper}">
                        </canvas>
                    </div>`;
        return html;
    }

    request_list (callback){

    }

    listener(event){
        let self = drawing_board;
        switch(event.type){
            case "touchstart":
                self.touch_or_mouse = "touch";
                self.initDraw(event);
                self.user_input_status = ON;
                break;
    
            case "touchmove":
                if(self.pos.drawable){
                    self.draw(event);
                }
                break;
            case "touchend":
            case "touchcancel":
                self.finishDraw();
                break;
    
            case "mousedown":
                self.initDraw(event);
                self.user_input_status = ON;
                break;
            case "mousemove":
                if(self.pos.drawable){
                    self.draw(event);
                }
                break;
            case "mouseup":
            case "mouseout":
                self.finishDraw();
                break;
        }
    }
    
    initDraw(event){
        this.ctx.strokeStyle = this.data.color.pencil;
        this.ctx.beginPath();
        this.pos.drawable = true;
        var coors = this.getPosition(event);
        this.pos.x = coors.X;
        this.pos.y = coors.Y;
        this.ctx.moveTo(this.pos.x, this.pos.y);
    }
    
    draw(event){
        this.ctx.strokeStyle = this.data.color.pencil;
        event.preventDefault();
        var coors = this.getPosition(event);
        this.ctx.lineTo(coors.X, coors.Y);
        this.pos.x = coors.X;
        this.pos.y = coors.Y;
        this.ctx.stroke();
    }
    
    finishDraw(){
        this.pos.drawable = false;
        this.pos.x = -1;
        this.pos.y = -1;
    }
    
    getPosition(event){
        var x;
        var y;
        // var offset_for_canvas__ = $(this.target.canvas).offset();
        var offset_for_canvas__ = $(this.target.canvas).offset();
        if(this.touch_or_mouse=="touch"){
            x = event.touches[0].pageX - offset_for_canvas__.left;
            y = event.touches[0].pageY - offset_for_canvas__.top;
        }else{
            x = event.pageX - offset_for_canvas__.left;
            y = event.pageY - offset_for_canvas__.top;
        }
        return {X:x, Y:y};
    }
    
    close(){
        layer_popup.close_layer_popup();
        this.clear();
    }

    upper_right_menu(){
        let image = document.getElementById('canvas').toDataURL('image/png');
        this.data.callback(image);
        layer_popup.close_layer_popup();
        this.clear();
    }
}

