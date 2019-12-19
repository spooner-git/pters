class Setting_reserve{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_reserve_toolbox', content:'section_setting_reserve_content'};
        this.data_sending_now = false;

        this.data = {
                stop_reserve:OFF,
                time_for_private_reserve:{value:[], text:[]},
                start_time_for_private_reserve:{value:[], text:[]},
                available_reserve_date:{value:[], text:[]},
                available_reserve_time:{value:[], text:[]},
                available_cancel_time:{value:[], text:[]}
        };

        this.data_for_selector = {
            time_for_private_reserve : 
                {value:[10, 15, 20, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300], text:["10분", "15분", "20분", "30분", "1시간", "1시간 30분", "2시간", "2시간 30분", "3시간", "3시간 30분", "4시간", "4시간 30분", "5시간"]},
            start_time_for_private_reserve:
                {value:["A-0", "A-30", "E-10", "E-15", "E-20", "E-30"], text:["매시각 정시", "매시각 30분", "10분 마다", "15분 마다", "20분 마다", "30분 마다"]},
            available_reserve_date:
                {value:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], text:["당일까지", "1일 전부터", "2일 전부터", "3일 전부터", "4일 전부터", "5일 전부터", "6일 전부터", "7일 전부터", "8일 전부터", "9일 전부터", "10일 전부터", "11일 전부터", "12일 전부터", "13일 전부터", "14일 전부터"]},
            available_reserve_time:
                {value:[0, 30, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 1440, 2880], text:["설정 안함", "30분전", "1시간 전", "2시간 전", "3시간 전", "4시간 전", "5시간 전", "6시간 전", "7시간 전", "8시간 전", "9시간 전", "10시간 전", "11시간 전", "12시간 전", "24시간 전", "48시간 전"]},
            available_cancel_time:
                {value:[0, 30, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 1440, 2880], text:["설정 안함", "30분전", "1시간 전", "2시간 전", "3시간 전", "4시간 전", "5시간 전", "6시간 전", "7시간 전", "8시간 전", "9시간 전", "10시간 전", "11시간 전", "12시간 전", "24시간 전", "48시간 전"]}
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_reserve_func.read((data)=>{
            this.data.stop_reserve = data.setting_member_reserve_prohibition;
            // this.data.time_for_private_reserve.value[0] = data.setting_member_time_duration;
            // this.data.time_for_private_reserve.text[0] = this.data_for_selector.time_for_private_reserve.text[ this.data_for_selector.time_for_private_reserve.value.indexOf(Number(data.setting_member_time_duration) ) ];

            this.data.start_time_for_private_reserve.value[0] = data.setting_member_start_time;
            this.data.start_time_for_private_reserve.text[0] = this.data_for_selector.start_time_for_private_reserve.text[ this.data_for_selector.start_time_for_private_reserve.value.indexOf(data.setting_member_start_time) ];

            this.data.available_reserve_date.value[0] = data.setting_member_reserve_date_available;
            this.data.available_reserve_date.text[0] = this.data_for_selector.available_reserve_date.text[ this.data_for_selector.available_reserve_date.value.indexOf(Number(data.setting_member_reserve_date_available) ) ];

            this.data.available_reserve_time.value[0] = data.setting_member_reserve_enable_time;
            this.data.available_reserve_time.text[0] = this.data_for_selector.available_reserve_time.text[ this.data_for_selector.available_reserve_time.value.indexOf(Number(data.setting_member_reserve_enable_time) ) ];

            this.data.available_cancel_time.value[0] = data.setting_member_reserve_cancel_time;
            this.data.available_cancel_time.text[0] = this.data_for_selector.available_cancel_time.text[ this.data_for_selector.available_cancel_time.value.indexOf(Number(data.setting_member_reserve_cancel_time) ) ];
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_reserve_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="setting_reserve_popup.upper_right_menu();">${CImg.confirm()}</span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_reserve .wrapper_top').style.border = 0;
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
        // let html = this.dom_row_stop_reserve() + 
        //             '<article class="obj_input_box_full">' +
        //                this.dom_row_time_for_private_reserve() + 
        //                this.dom_row_start_time_for_private_reserve() +
        //             '</article>' +
        //             '<article class="obj_input_box_full">' +
        //                 this.dom_row_available_reserve_date() + 
        //                 this.dom_row_available_reserve_time() + 
        //                 this.dom_row_available_cancel_time() +
        //             '</article>';
        let html = this.dom_row_stop_reserve() + 
                    '<article class="obj_input_box_full" style="padding-top:5px;">' +
                       this.dom_row_start_time_for_private_reserve() +
                       "<span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>수강 회원님께서 선택 가능한 시작 시각</span>" + 
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_available_reserve_date() + 
                        this.dom_row_available_reserve_time() + 
                        this.dom_row_available_cancel_time() +
                    '</article>';
        if(this.data.stop_reserve == ON){
            html = this.dom_row_stop_reserve();
        }
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
            let data = this.data_for_selector.time_for_private_reserve;
            let selected_data = this.data.time_for_private_reserve;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
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
        let style = {"height":"auto", "padding-bottom":"0"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "개인 수업 예약 시간";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = this.data_for_selector.start_time_for_private_reserve;
            let selected_data = this.data.start_time_for_private_reserve;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
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
            let data = this.data_for_selector.available_reserve_date;
            let selected_data = this.data.available_reserve_date;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
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
            let data = this.data_for_selector.available_reserve_time;
            let selected_data = this.data.available_reserve_time;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
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
            let data = this.data_for_selector.available_cancel_time;
            let selected_data = this.data.available_cancel_time;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
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
        let title = "회원 예약";
        let description = "<p style='font-size:14px;font-weight:500;'>회원에게 적용되는 예약 관련 설정입니다.</p>";
        let html = `
        <div class="setting_reserve_upper_box" style="">
            <div style="display:inline-block;">
                <span style="display:inline-block;font-size:23px;font-weight:bold">
                    ${title}
                    ${description}
                </span>
                <span style="display:none">${title}</span>
            </div>
        </div>
        `;
        return html;
    }


    send_data(){
        let auth_inspect = pass_inspector.setting_update();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            layer_popup.close_layer_popup();
            show_error_message(message);
            return false;
        }
        
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }
        let data = {
            "setting_member_reserve_time_available":'00:00-23:59', //예약 가능 시간대
            "setting_member_reserve_prohibition":this.data.stop_reserve, // 예약 일시 정지
            "setting_member_time_duration":this.data.time_for_private_reserve.value[0], //개인 수업 예약 시간
            "setting_member_start_time": this.data.start_time_for_private_reserve.value[0], //개인 수업 예약 시작 시각

            "setting_member_reserve_date_available":this.data.available_reserve_date.value[0], //예약 가능 날짜
            "setting_member_reserve_enable_time":this.data.available_reserve_time.value[0], //예약 가능 시간
            "setting_member_reserve_cancel_time":this.data.available_cancel_time.value[0] //예약 취소 가능 시간

        };
        
        Setting_reserve_func.update(data, ()=>{
            this.data_sending_now = false;
            this.set_initial_data();
            show_error_message('변경 내용이 저장되었습니다.');
            // this.render_content();
        }, ()=>{this.data_sending_now = false;});
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_reserve_func{
    static update(data, callback, error_callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_setting_reserve/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
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
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    static read(callback, error_callback){
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
                check_app_version(data.app_version);
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
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }
}


