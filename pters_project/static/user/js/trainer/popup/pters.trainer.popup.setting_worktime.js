class Setting_worktime{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_worktime_toolbox', content:'section_setting_worktime_content'};

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

        this.data = {
                GENERAL:{
                    "start_time":null, "end_time":null, "detail_switch":ON
                },
                MON:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":0
                },
                TUE:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":0
                },
                WED:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":0
                },
                THS:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":0
                },
                FRI:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":0
                },
                SAT:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":0
                },
                SUN:{
                    "start_time":null, "end_time":null, 
                    "start_time_text":null, "end_time_text":null,
                    "dayoff":0
                }
                
        };

        this.init();
        // this.set_initial_data();
    }

 
    init(){
        this.set_initial_data();
    }

    set_initial_data (){
        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/navigate_before_black.png" onclick="layer_popup.close_layer_popup();program_list_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_worktime .wrapper_top').style.border = 0;
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
        let start_time_selector = this.dom_row_start_time_select("GENERAL");
        let end_time_selector = this.dom_row_end_time_select("GENERAL");
        let detail_setting = "작업중";

        let html = `<article class="setting_worktime_wrapper obj_input_box_full">
                        ${start_time_selector}
                        ${end_time_selector}
                        ${detail_setting}
                    </article>`;

        let sub_assembly = "";
        if(this.data.GENERAL.detail_switch == ON){
            sub_assembly = this.dom_assembly_sub_content();
        }

        return html + sub_assembly;
    }

    dom_assembly_sub_content(){
        let day_array = ["MON", "TUE", "WED", "THS", "FRI", "SAT", "SUN"];
        
        let html_to_join = [];
        for(let i=0; i<day_array.length; i++){
            let tag = CComponent.dom_tag(DAYNAME_MATCH[day_array[i]]+'요일', {"font-size":"16px", "font-weight":"bold", "color":"#5c5859", "padding":"0", "height":"52px", "line-height":"52px"});
            let start_time_selector = this.dom_row_start_time_select(day_array[i]);
            let end_time_selector = this.dom_row_end_time_select(day_array[i]);
            let detail_setting = "휴무 설정";
            let html = `<article class="setting_worktime_wrapper obj_input_box_full">
                            ${tag}
                            ${start_time_selector}
                            ${end_time_selector}
                            ${detail_setting}
                        </article>`;
            html_to_join.push(html);
        }

        return html_to_join.join('');
    }


    dom_row_start_time_select(day){
        console.log(day)
        let id = `select_start_${day}`;
        let title = this.data[day].start_time_text == null ? '시작 시각*' : this.data[day].start_time_text;
        let icon = '/static/common/icon/icon_clock.png';
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
                                                                                                    this.render();

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
        let icon = '/static/common/icon/icon_clock_white.png';
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
                                                                                                    this.render();
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });

        return html;
    }





    dom_row_toolbox(){
        let title = "업무 시간 <p style='font-size:14px;font-weight:500;'>설정된 시간만 일정표에 나타납니다.</p>";
        let html = `
        <div class="setting_worktime_upper_box" style="">
            <div style="display:inline-block;width:320px;">
                <div style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
                    ${title}
                </div>
            </div>
        </div>
        `;
        return html;
    }

    // event_program_click(id, name, category, category_sub, selected){
    //     let user_option = {
    //         goto:{text:"프로그램 이동", callback:()=>{ 
    //                 window.location.href=`/trainer/select_program_processing/?class_id=${id}&next_page=/trainer/`; 
    //             }
    //         },
    //         edit:{text:"편집", callback:()=>{
    //                 layer_popup.close_layer_popup();
    //                 layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PROGRAM_VIEW, 100, POPUP_FROM_RIGHT, null, ()=>{
    //                     let external_data = {   
    //                                             id:id,
    //                                             name:name, 
    //                                             category:{name:[PROGRAM_CATEGORY[category].name], code:[category]}, 
    //                                             category_sub:{name:[PROGRAM_CATEGORY[category].sub_category[category_sub].name], code:[category_sub]},
    //                                             selected:selected
    //                                         };
    //                     program_view_popup = new Program_view('.popup_program_view', external_data);
    //                 });
    //             }
    //         }
    //     };
    //     let options_padding_top_bottom = 16;
    //     let button_height = 8 + 8 + 52;
    //     let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
    //     layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
    //         option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
    //     });
    // }

    // upper_right_menu(){
    //     layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PROGRAM_ADD, 100, POPUP_FROM_RIGHT, null, ()=>{
    //         program_add_popup = new Program_add('.popup_program_add');
    //     });
    // }
}

class Setting_worktime_func{
    static create(data, callback){
        //프로그램 추가
        $.ajax({
            url:"/trainer/add_program_info/",
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
        //프로그램 리스트 서버에서 불러오기
        $.ajax({
            url:"/trainer/get_program_list/",
            dataType : 'JSON',
            beforeSend:function (){
                // ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function (data){
                console.log(data);
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){
                // ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
            }
        });
    }

    static update(data, callback){
        //프로그램 추가
        $.ajax({
            url:"/trainer/update_program_info/",
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

    static delete(data, callback){
        //프로그램 추가
        $.ajax({
            url:"/trainer/delete_program_info/",
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
}


