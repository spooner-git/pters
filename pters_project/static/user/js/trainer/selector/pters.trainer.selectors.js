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

// var time_select_popup = new TwoTimeSelector('.wrapper_popup_time_selector_function', "time_select_popup");
// time_select_popup.init();

//하단에서 올라오는 옵션 선택 팝업
class OptionSelector{
    constructor(target, instance){
        this.html_target = target;
        this.instance = instance;
        this.data;
    }

    reset (option_data){
        this.data = option_data;
        this.render_option_list();
    }

    render_option_list (){
        // let length = Object.keys(this.data).length;
        let $target = $(this.html_target);
        let html_to_join = [];
        for(let option in this.data){
            let option_name = option;
            let option_value = this.data[option].value;
            html_to_join.push(
                `
                <div id="option_select_${option_value}" class="wrapper_popup_basic_buttons obj_font_bg_black_white option_select" style="border-radius:5px;margin-bottom:5px;">
                    ${option_name}
                </div>
                `
            );
        }
        this.attach_events();
        document.querySelector(this.html_target).innerHTML = html_to_join.join('');
    }

    attach_events (){
        // $("option_select").off('click');
        for(let option in this.data){
            let option_value = this.data[option].value;
            let option_callback = this.data[option].callback;

            $(document).off('click', `#option_select_${option_value}`).on('click', `#option_select_${option_value}`, function (){
                layer_popup.close_layer_popup(POPUP_SIZE_WINDOW);
                option_callback();
            });

        }
    }


    open (option_data){
        this.reset(option_data);
        let option_length = Object.keys(this.data).length;
        let button_height = 45;
        let popup_height = 100*(button_height*(option_length+4))/windowHeight;
        layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_user_select_multi', popup_height, POPUP_FROM_BOTTOM);
    }

    //data 형태
    // `{
    //     사과:{value: 'apple', callback: ()=>{console.log('사과 Apple')} }, 
    //     수박:{value: 'water_melon', callback: ()=>{console.log('수박 Water melon')} }, 
    //     바나나:{value: 'banana', callback: ()=>{console.log('바나나 Banana')} }
    // }`;


}

var option_select_popup = new OptionSelector('#option_wrap', 'option_select_popup');


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

        this.data_to_send = {
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
        return this.data_to_send;
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
        this.data_to_send.data = {year: year, month:month, date:date};
        this.data_to_send.text = DateRobot.to_text(year, month, date);
        
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
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="date_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', ()=>{ this.data_to_send = this.get_selected_data();
                                                                                                                    this.option.callback_when_set(this.data_to_send); 
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

// var date_select_popup = new DateSelector('.wrapper_popup_date_selector_function', "date_select_popup");


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

        this.data_to_send = {
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
        return this.data_to_send;
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
        this.data_to_send.value = {zone: zone, hour:hour, minute:minute};
        this.data_to_send.text = TimeRobot.to_text(TimeRobot.to_data(zone, hour, minute).hour, TimeRobot.to_data(zone, hour, minute).minute);
        
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
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="time_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', ()=>{this.data_to_send = this.get_selected_data();
                                                                                                                    this.option.callback_when_set(this.data_to_send); 
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

        this.data_to_send = {
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
        this.data_to_send.text = object.text;
        this.data_to_send.value = object.value;
    }

    get dataset (){
        return this.data_to_send;
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
                                        ${CComponent.text_button(this.option.myname+'_cancel_button', '취소', ()=>{layer_popup.close_layer_popup();})}
                                    </div>
                                    <span class="span_selector_title">${this.option.title}</span>
                                    <div style="float:right;margin-right:5px;color:#fe4e65;">
                                        ${CComponent.text_button(this.option.myname+'_confirm_button', '확인', ()=>{this.option.callback_when_set(); console.log(this.get_selected_data()) })}
                                    </div>
                                </div>
                                <div class="spin_selector_page_wrap select_wrapper"></div>
                                <div class="selector_indicator"></div>
                            </div>`
        };
    }
}

class LectureSelector{
    constructor(install_target, target_instance, multiple_select){
        this.targetHTML = install_target;
        this.target_instance = target_instance;
        this.data;
        this.callback;
        this.multiple_select = multiple_select;
        this.data_to_set = {
            id: [],
            name: [],
            max: []
        };
        this.request_list(()=>{
            this.render_list();
        });
    }

    render_list(){
        let html_to_join = [];
        let length = this.data.length;
        if(length == 0){
            html_to_join.push(CComponent.no_data_row('수업 목록이 비어있습니다.'));
        }
        for(let i=0; i<length; i++){
            let data = this.data[i];
            let lecture_id = data.lecture_id;
            let lecture_name = data.lecture_name;
            let lecture_color_code = "#fe4e65";
            let lecture_max_num = data.lecture_max_num;
            let checked = this.target_instance.lecture.indexOf(lecture_id) >= 0 ? 1 : 0;
            let html =CComponent.select_lecture_row(
                this.multiple_select, checked, lecture_id, lecture_name, lecture_color_code, lecture_max_num, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data_to_set.id.push(lecture_id);
                        this.data_to_set.name.push(lecture_name);
                        this.data_to_set.max.push(lecture_max_num);
                    }else if(add_or_substract == "substract"){
                        this.data_to_set.id.splice(this.data_to_set.id.indexOf(lecture_id), 1);
                        this.data_to_set.name.splice(this.data_to_set.name.indexOf(lecture_name), 1);
                        this.data_to_set.max.splice(this.data_to_set.name.indexOf(lecture_name), 1);
                    }else if(add_or_substract == "add_single"){
                        this.data_to_set.id = [];
                        this.data_to_set.name = [];
                        this.data_to_set.max = [];
                        this.data_to_set.id.push(lecture_id);
                        this.data_to_set.name.push(lecture_name);
                        this.data_to_set.max.push(lecture_max_num);
                    }

                    this.target_instance.lecture = this.data_to_set; //타겟에 선택된 데이터를 set

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
            this.data = data.current_lecture_data;
            callback();
        });
    }
}

class MemberSelector{
    constructor(install_target, target_instance, multiple_select, appendix){
        this.targetHTML = install_target;
        this.target_instance = target_instance;
        this.data;
        this.appendix = appendix;
        this.callback;
        this.multiple_select = multiple_select;
        this.data_to_set = {
            id: [],
            name: []
        };
        this.request_list(()=>{
            this.render_list();
        });
    }

    render_list (){
        let html_to_join = [];
        let length = this.data.length;
        if(length == 0){
            html_to_join.push(CComponent.no_data_row('목록이 비어있습니다.'));
        }
        for(let i=0; i<length; i++){
            let data = this.data[i];
            let member_id = data.member_id;
            let member_name = data.member_name;
            let member_rem_count = data.member_ticket_rem_count;
            let member_avail_count = data.member_ticket_avail_count;
            let member_expiry = data.end_date;
            let checked = this.target_instance.member.indexOf(member_id) >= 0 ? 1 : 0; //타겟이 이미 가진 회원 데이터를 get
            let html = CComponent.select_member_row (
                this.multiple_select, checked, member_id, member_name, member_avail_count, member_expiry, (add_or_substract)=>{
                    if(add_or_substract == "add"){
                        this.data_to_set.id.push(member_id);
                        this.data_to_set.name.push(member_name);
                    }else if(add_or_substract == "substract"){
                        this.data_to_set.id.splice(this.data_to_set.id.indexOf(member_id), 1);
                        this.data_to_set.name.splice(this.data_to_set.name.indexOf(member_name), 1);
                    }else if(add_or_substract == "add_single"){
                        this.data_to_set.id = [];
                        this.data_to_set.name = [];
                        this.data_to_set.id.push(member_id);
                        this.data_to_set.name.push(member_name);
                    }
                    
                    this.target_instance.member = this.data_to_set; //타겟에 선택된 데이터를 set
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
                this.data = data.current_member_data;
                callback();
                show_error_message('수업 정보를 확인할 수 없어, 전체 진행중 회원목록을 가져옵니다.');
            });
        }else{
            let data = {"lecture_id": this.appendix.lecture_id};
            Lecture_func.read_lecture_members(data, (data)=>{
                this.data = data.lecture_ing_member_list;
                callback();
            });
        }
    }
}
