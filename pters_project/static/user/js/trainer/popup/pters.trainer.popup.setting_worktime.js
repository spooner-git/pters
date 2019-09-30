class Setting_worktime{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_worktime_toolbox', content:'section_setting_worktime_content'};

        this.data = {
                dayoff_visibility: OFF,
                GENERAL:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "detail_switch":OFF
                },
                MON:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":OFF
                },
                TUE:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":OFF
                },
                WED:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":OFF
                },
                THS:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":OFF
                },
                FRI:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":OFF
                },
                SAT:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":OFF
                },
                SUN:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":OFF
                }
        };
        
        this.data_received;

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_worktime_func.read((data)=>{
            this.data_received = data;
            //업무시간 데이터 체크
            let worktime_all_same = true;
            let worktimes = [data.setting_trainer_work_mon_time_avail, data.setting_trainer_work_tue_time_avail,
                             data.setting_trainer_work_wed_time_avail, data.setting_trainer_work_ths_time_avail,
                             data.setting_trainer_work_fri_time_avail, data.setting_trainer_work_sat_time_avail, data.setting_trainer_work_sun_time_avail];
            for(let i=0; i<worktimes.length; i++){
                if(worktimes[0] != worktimes[i]){
                    worktime_all_same = false;
                }
            }
            //업무시간 데이터 체크

            let datas = [this.data.MON, this.data.TUE, this.data.WED, this.data.THS, this.data.FRI, this.data.SAT, this.data.SUN];
            this.data.GENERAL.start_time = worktime_all_same == true ? worktimes[0].split('-')[0] : null;
            this.data.GENERAL.end_time = worktime_all_same == true ? worktimes[0].split('-')[1] : null;
            this.data.GENERAL.start_time_text = worktime_all_same == true ? TimeRobot.to_text(worktimes[0].split('-')[0]): null;
            this.data.GENERAL.end_time_text = worktime_all_same == true ? TimeRobot.to_text(worktimes[0].split('-')[1]) : null;
            this.data.GENERAL.detail_switch = worktime_all_same == true ? OFF : ON;
            this.data.dayoff_visibility = data.setting_holiday_hide;
            for(let j=0; j<datas.length; j++){

                let worktimes_start_hour = Number(worktimes[j].split('-')[0].split(':')[0]);
                let worktimes_start_min = Number(worktimes[j].split('-')[0].split(':')[1]);
                let worktimes_end_hour = Number(worktimes[j].split('-')[1].split(':')[0]);
                let worktimes_end_min = Number(worktimes[j].split('-')[1].split(':')[1]);

                if(worktimes_start_hour == 0 && worktimes_start_min == 0 && worktimes_end_hour == 0 && worktimes_end_min == 0){
                    datas[j].dayoff = ON;
                }
                datas[j].start_time = worktimes[j].split('-')[0];
                datas[j].end_time = worktimes[j].split('-')[1];
                datas[j].start_time_text = TimeRobot.to_text(worktimes[j].split('-')[0]);
                datas[j].end_time_text = TimeRobot.to_text(worktimes[j].split('-')[1]);
            }
            this.render_content();
        });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();setting_worktime_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_confirm_black.png" onclick="setting_worktime_popup.upper_right_menu();" class="obj_icon_prev"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_worktime .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    dom_assembly_toolbox(){
        return this.dom_row_toolbox();
    }
    
    dom_assembly_content(){
        let general_worktime = this.dom_row_general_worktime();
        let dayoff_visibility = this.dom_row_dayoff_visibility();

        let main_assembly = dayoff_visibility + general_worktime;

        let sub_assembly = "";
        if(this.data.GENERAL.detail_switch == ON){
            sub_assembly = this.dom_assembly_sub_content();
        }

        return main_assembly + sub_assembly;
    }

    dom_assembly_sub_content(){
        let day_array = ["MON", "TUE", "WED", "THS", "FRI", "SAT", "SUN"];
        
        let html_to_join = [];
        for(let i=0; i<day_array.length; i++){
            let day = day_array[i];
            let tag = CComponent.dom_tag(DAYNAME_MATCH[day]+'요일', {"font-size":"16px", "font-weight":"bold", "color":"#5c5859", "padding":"0", "height":"52px", "line-height":"52px"});
            let start_time_selector = this.dom_row_start_time_select(day);
            let end_time_selector = this.dom_row_end_time_select(day);
            let id = `worktime_${day}`;
            let power = this.data[day].dayoff;
            let style = null;
            let dayoff_setting = CComponent.toggle_button (id, power, style, (data)=>{
                                    this.data[day].dayoff = data; // ON or OFF
                                    this.render_content();
                                });
            let title_row = CComponent.create_row ('id_null', '휴무', NONE, HIDE, '', null, ()=>{});

            let html = `<article class="setting_worktime_wrapper obj_input_box_full">
                            ${tag}
                            ${power == OFF ? start_time_selector : ""}
                            ${power == OFF ? end_time_selector: ""}
                            <div style="display:table;width:100%;">
                                <div style="display:table-cell;width:auto;">${title_row}</div>
                                <div style="display:table-cell;width:50px;">${dayoff_setting}</div>
                            </div>
                        </article>`;
            html_to_join.push(html);
        }

        return html_to_join.join('');
    }

    dom_row_general_worktime(){
        let start_time_selector = this.dom_row_start_time_select("GENERAL");
        let end_time_selector = this.dom_row_end_time_select("GENERAL");
        let id = "worktime_general";
        let power = this.data.GENERAL.detail_switch;
        let style = null;
        let detail_setting = CComponent.toggle_button (id, power, style, (data)=>{
            this.data.GENERAL.detail_switch = data; // ON or OFF
            if(this.data.GENERAL.start_time == null){
                this.data.GENERAL.start_time = '00:00';
                this.data.GENERAL.start_time_text = TimeRobot.to_text(0, 0);
            }
            if(this.data.GENERAL.end_time == null){
                this.data.GENERAL.end_time = '24:00';
                this.data.GENERAL.end_time_text = TimeRobot.to_text(24, 0);
            }
            this.render_content();
        });
        let title_row = CComponent.create_row('nothing', '요일별 설정', NONE, HIDE, '', null, ()=>{});

        let html = `<article class="setting_worktime_wrapper obj_input_box_full">
                        ${power == OFF ? start_time_selector : ""}
                        ${power == OFF ? end_time_selector : ""}
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;">${title_row}</div>
                            <div style="display:table-cell;width:50px;">${detail_setting}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_dayoff_visibility(){
        let id = "dayoff_visibility";
        let power = this.data.dayoff_visibility;
        let style = null;
        let detail_setting = CComponent.toggle_button (id, power, style, (data)=>{
            this.data.dayoff_visibility = data; // ON or OFF
            this.render_content();
        });
        let title_row = CComponent.create_row('nothing', '달력에서 휴무일 숨기기', NONE, NONE, '', null, ()=>{});

        let html = `<article class="setting_worktime_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;">${title_row}</div>
                            <div style="display:table-cell;width:50px;">${detail_setting}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_start_time_select(day){
        let id = `select_start_${day}`;
        let title = this.data[day].start_time_text == null ? '시작 시각*' : this.data[day].start_time_text;
        let icon = '/static/common/icon/icon_clock_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ //data : 직전 셋팅값
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let zone = this.data[day].start_time == null ? 0  :TimeRobot.to_zone(this.data[day].start_time.split(':')[0], this.data[day].start_time.split(':')[1]).zone;
                let hour = this.data[day].start_time == null ? 0 : TimeRobot.to_zone(this.data[day].start_time.split(':')[0], this.data[day].start_time.split(':')[1]).hour;
                let minute = this.data[day].start_time == null ? 0 :TimeRobot.to_zone(this.data[day].start_time.split(':')[0], this.data[day].start_time.split(':')[1]).minute;
                
                time_selector = new TimeSelector2('#wrapper_popup_time_selector_function', null, {myname:'time', title:'시작 시각', data:{zone:zone, hour:hour, minute:minute},
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.data[day].start_time = TimeRobot.to_data(object.data.zone, object.data.hour, object.data.minute).complete;
                                                                                                    this.data[day].start_time_text = object.text;
                                                                                                    this.render_content();

                                                                                                    if(this.data[day].end_time != null){
                                                                                                        let compare = TimeRobot.compare_by_zone(object.data, TimeRobot.to_zone(this.data[day].end_time.split(':')[0],this.data[day].end_time.split(':')[1]));
                                                                                                        if(compare == true){
                                                                                                            //유저가 선택할 수 있는 최저 시간을 셋팅한다. 이시간보다 작은값을 선택하려면 메세지를 띄우기 위함
                                                                                                            let end_time = TimeRobot.add_time(object.data.hour, object.data.minute, 0, 5);
                                                                                                            let end_time_to_zone = TimeRobot.to_zone(end_time.hour, end_time.minute);
                                                                                                            let end_time_text = TimeRobot.to_text(end_time.hour, end_time.minute);
                                                                                                            this.end_time = {'data':{'zone':end_time_to_zone.zone,'hour':end_time_to_zone.hour, 'minute':end_time_to_zone.minute},
                                                                                                                            'text':end_time_text};
                                                                                                        }
                                                                                                    }
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        return html;
    }

    dom_row_end_time_select(day){
        let id = `select_end_${day}`;
        let title = this.data[day].end_time_text == null ? '종료 시각*' : this.data[day].end_time_text;
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ //data : 직전 셋팅값
            //행을 클릭했을때 실행할 내용
            if(this.data[day].start_time == null){
                show_error_message('시작 시각을 먼저 선택해주세요');
                return false;
            }
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택 시작시간이 빈값이라면 시작 시간으로 셋팅한다.
                let zone = TimeRobot.to_zone(this.data[day].start_time.split(':')[0], this.data[day].start_time.split(':')[1]).zone;
                let hour = TimeRobot.to_zone(this.data[day].start_time.split(':')[0], this.data[day].start_time.split(':')[1]).hour;
                let minute = TimeRobot.to_zone(this.data[day].start_time.split(':')[0], this.data[day].start_time.split(':')[1]).minute;

                //유저가 선택할 수 있는 최저 시간을 셋팅한다. 이시간보다 작은값을 선택하려면 메세지를 띄우기 위함
                let time_min = TimeRobot.add_time(TimeRobot.to_data(zone, hour, minute).hour, TimeRobot.to_data(zone, hour, minute).minute, 1, 0);
                let time_min_type_zone = TimeRobot.to_zone(time_min.hour, time_min.minute);
                let zone_min = time_min_type_zone.zone;
                let zone_hour = time_min_type_zone.hour;
                let zone_minute = time_min_type_zone.minute;

                time_selector = new TimeSelector2('#wrapper_popup_time_selector_function', null, {myname:'time', title:'종료 시각',
                                                                                                data:{zone:zone_min, hour:zone_hour, minute:zone_minute}, min:{zone:zone_min, hour:zone_hour, minute:zone_minute},
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.data[day].end_time = TimeRobot.to_data(object.data.zone, object.data.hour, object.data.minute).complete;
                                                                                                    this.data[day].end_time_text = object.text;
                                                                                                    this.render_content();
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });

        return html;
    }

    dom_row_toolbox(){
        let title = "업무 시간";
        let description = "<p style='font-size:14px;font-weight:500;'>설정된 시간만 일정표에 나타납니다.</p>";
        let html = `
        <div class="setting_worktime_upper_box">
            <div style="display:inline-block;width:320px;">
                <span style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
                    ${title}
                    ${description}
                </span>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    art_data(start_time, end_time){
        let merged;
        if(start_time == null && end_time == null){
            merged = `00:00-24:00`;
        }else if(start_time == null && end_time != null){
            merged = `00:00-${end_time}`;
        }else if(start_time != null && end_time == null){
            merged = `${start_time}-24:00`;
        }else{
            merged = start_time + '-' + end_time;
        }

        if(this.data.GENERAL.detail_switch == OFF){
            merged = this.data.GENERAL.start_time + '-' + this.data.GENERAL.end_time;
            this.data.SUN.dayoff = OFF;
            this.data.MON.dayoff = OFF;
            this.data.TUE.dayoff = OFF;
            this.data.WED.dayoff = OFF;
            this.data.THS.dayoff = OFF;
            this.data.FRI.dayoff = OFF;
            this.data.SAT.dayoff = OFF;
        }

        return merged;
    }

    send_data(){
        let data = {
            "setting_trainer_work_sun_time_avail":this.data.SUN.dayoff == OFF ? this.art_data(this.data.SUN.start_time, this.data.SUN.end_time) : "00:00-00:00",
            "setting_trainer_work_mon_time_avail":this.data.MON.dayoff == OFF ? this.art_data(this.data.MON.start_time, this.data.MON.end_time) : "00:00-00:00",
            "setting_trainer_work_tue_time_avail":this.data.TUE.dayoff == OFF ? this.art_data(this.data.TUE.start_time, this.data.TUE.end_time) : "00:00-00:00",
            "setting_trainer_work_wed_time_avail":this.data.WED.dayoff == OFF ? this.art_data(this.data.WED.start_time, this.data.WED.end_time) : "00:00-00:00",
            "setting_trainer_work_ths_time_avail":this.data.THS.dayoff == OFF ? this.art_data(this.data.THS.start_time, this.data.THS.end_time) : "00:00-00:00",
            "setting_trainer_work_fri_time_avail":this.data.FRI.dayoff == OFF ? this.art_data(this.data.FRI.start_time, this.data.FRI.end_time) : "00:00-00:00",
            "setting_trainer_work_sat_time_avail":this.data.SAT.dayoff == OFF ? this.art_data(this.data.SAT.start_time, this.data.SAT.end_time) : "00:00-00:00",
            "setting_holiday_hide":this.data.dayoff_visibility,
        };
        Setting_worktime_func.update(data, ()=>{
            this.set_initial_data();
            show_error_message('변경 내용이 저장되었습니다.');
        });
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_worktime_func{
    static update(data, callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_setting_work_time/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    static read(callback){
        $.ajax({
            url:"/trainer/get_trainer_setting_data/",
            type:'GET',
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }
}


