class Setting_reserve{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_reserve_toolbox', content:'section_setting_reserve_content'};

        this.data = {
                stop_reserve:OFF,
                time_for_private_reserve:{value:[], text:[]},
                start_time_for_private_reserve:{value:[], text:[]},
                available_reserve_date:{value:[], text:[]},
                available_reserve_time:{value:[], text:[]},
                available_cancel_time:{value:[], text:[]}
        };

        this.init();
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
        let top_left = `<img src="/static/common/icon/navigate_before_black.png" onclick="layer_popup.close_layer_popup();setting_reserve_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_done.png" onclick="setting_reserve_popup.upper_right_menu();" class="obj_icon_prev"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_reserve .wrapper_top').style.border = 0;
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
        let html = this.dom_row_stop_reserve() + 
                    '<article class="obj_input_box_full">' +
                       this.dom_row_time_for_private_reserve() + 
                       this.dom_row_start_time_for_private_reserve() +
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_available_reserve_date() + 
                        this.dom_row_available_reserve_time() + 
                        this.dom_row_available_cancel_time() +
                    '</article>';
        return html;
    }

    dom_row_stop_reserve(){
        let id = `stop_reserve`;
        let power = this.data.stop_reserve;
        let style = null;
        let dayoff_setting = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.stop_reserve = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("stop_reserve_text", '예약 일시 정지', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.7px"}, ()=>{});
        let html = `<article class="obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${dayoff_setting}</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_row_time_for_private_reserve(){
        let id = "time_for_private_reserve";
        let title = "개인 수업 예약 시간";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.time_for_private_reserve.text.length == 0 ? '' : this.data.time_for_private_reserve.text;
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "개인 수업 예약 시간";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = {value:[30, 60, 90, 120, 150, 180, 210, 240, 270, 300], text:["30 분", "1 시간", "1시간 30분", "2 시간", "2 시간 30분", "3 시간", "3 시간 30 분", "4 시간", "4 시간 30 분", "5 시간"]};
            let selected_data = this.data.time_for_private_reserve;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.time_for_private_reserve = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }

    dom_row_start_time_for_private_reserve(){
        let id = "start_time_for_private_reserve";
        let title = "개인 수업 예약 시작 시각";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.start_time_for_private_reserve.text.length == 0 ? '' : this.data.start_time_for_private_reserve.text;
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "개인 수업 예약 시간";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = {value:[1, 2, 3], text:["매시각 정시", "매시각 30분", "매시각 30분 + 정시"]};
            let selected_data = this.data.start_time_for_private_reserve;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.start_time_for_private_reserve = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }

    dom_row_available_reserve_date(){
        let id = "available_reserve_date";
        let title = "예약 가능 날짜";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.available_reserve_date.text.length == 0 ? '' : this.data.available_reserve_date.text;
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "예약 가능 날짜";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = {value:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], text:["1 일전", "2 일전", "3 일전", "4 일전", "5 일전", "6 일전", "7 일전", "8 일전", "9 일전", "10 일전"]};
            let selected_data = this.data.available_reserve_date;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.available_reserve_date = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }

    dom_row_available_reserve_time(){
        let id = "available_reserve_time";
        let title = "예약 가능 시간";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.available_reserve_time.text.length == 0 ? '' : this.data.available_reserve_time.text;
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "예약 가능 시간";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = {value:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 48], text:["1 시간 전", "2 시간 전", "3 시간 전", "4 시간 전", "5 시간 전", "6 시간 전", "7 시간 전", "8 시간 전", "9 시간 전", "10 시간 전", "11 시간 전", "12 시간 전", "24 시간 전", "48시간 전"]};
            let selected_data = this.data.available_reserve_time;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.available_reserve_time = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }

    dom_row_available_cancel_time(){
        let id = "available_cancel_time";
        let title = "예약 취소 가능 시간";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.available_cancel_time.text.length == 0 ? '' : this.data.available_cancel_time.text;
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "예약 취소 가능 시간";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = {value:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 48], text:["1 시간 전", "2 시간 전", "3 시간 전", "4 시간 전", "5 시간 전", "6 시간 전", "7 시간 전", "8 시간 전", "9 시간 전", "10 시간 전", "11 시간 전", "12 시간 전", "24 시간 전", "48시간 전"]};
            let selected_data = this.data.available_cancel_time;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.available_cancel_time = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }

    dom_row_toolbox(){
        let title = "회원 예약 <p style='font-size:14px;font-weight:500;'>회원에게 적용되는 예약 관련 설정입니다.</p>";
        let html = `
        <div class="setting_reserve_upper_box" style="">
            <div style="display:inline-block;width:320px;">
                <div style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
                    ${title}
                </div>
            </div>
        </div>
        `;
        return html;
    }

    art_data(start_time, end_time){
        let merged;
        if(start_time == null && end_time == null){
            merged = `00:00-23:59`;
        }else if(start_time == null && end_time != null){
            merged = `00:00-${end_time}`;
        }else if(start_time != null && end_time == null){
            merged = `${start_time}-23:59`;
        }else{
            merged = start_time + '-' + end_time;
        }

        if(this.data.GENERAL.detail_switch == OFF){
            merged = this.data.GENERAL.start_time + '-' + this.data.GENERAL.end_time;
        }

        return merged;
    }

    send_data(){
        let data = {
            "setting_trainer_work_sun_time_avail":this.art_data(this.data.SUN.start_time, this.data.SUN.end_time),
            "setting_trainer_work_mon_time_avail":this.art_data(this.data.MON.start_time, this.data.MON.end_time),
            "setting_trainer_work_tue_time_avail":this.art_data(this.data.TUE.start_time, this.data.TUE.end_time),
            "setting_trainer_work_wed_time_avail":this.art_data(this.data.WED.start_time, this.data.WED.end_time),
            "setting_trainer_work_ths_time_avail":this.art_data(this.data.THS.start_time, this.data.THS.end_time),
            "setting_trainer_work_fri_time_avail":this.art_data(this.data.FRI.start_time, this.data.FRI.end_time),
            "setting_trainer_work_sat_time_avail":this.art_data(this.data.SAT.start_time, this.data.SAT.end_time)
        };
        
        Setting_reserve_func.update(data, ()=>{
            this.render_content();
        });
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_reserve_func{
    static update(data, callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_setting_basic/",
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

