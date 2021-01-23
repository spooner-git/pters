class Setting_reserve{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_reserve_toolbox', content:'section_setting_reserve_content'};
        this.data_sending_now = false;

        this.data = {
                setting_member_reserve_time_available:'00:00-23:59',
                start_avail_time:null,
                end_avail_time:null,
                start_avail_time_text:null,
                end_avail_time_text:null,
                stop_reserve:OFF,
                time_for_private_reserve:{value:[], text:[]},
                // start_time_for_private_reserve:{value:[], text:[]},
                available_reserve_date:{value:[], text:[]},
                available_reserve_time:{value:[], text:[]},
                available_cancel_time:{value:[], text:[]},
                capacity_visible:ON,
                main_trainer_visible:ON,
                disable_schedule_visible:OFF,
                setting_member_private_class_auto_permission:ON,
                setting_member_public_class_auto_permission:ON,
                setting_member_public_class_wait_member_num:0,
                wait_schedule_auto_cancel_time:{value:[], text:[]},
                setting_single_lecture_duplicate:OFF
        };

        this.data_for_selector = {
            time_for_private_reserve : 
                {value:[10, 15, 20, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300], text:["10분", "15분", "20분", "30분", "1시간", "1시간 30분", "2시간", "2시간 30분", "3시간", "3시간 30분", "4시간", "4시간 30분", "5시간"]},
            // start_time_for_private_reserve:
            //     {value:["A-0", "A-30", "E-10", "E-15", "E-20", "E-30"], text:["매시각 정시", "매시각 30분", "10분 마다", "15분 마다", "20분 마다", "30분 마다"]},
            available_reserve_date:
                {value:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], text:["당일까지", "1일 전부터", "2일 전부터", "3일 전부터", "4일 전부터", "5일 전부터", "6일 전부터", "7일 전부터", "8일 전부터", "9일 전부터", "10일 전부터", "11일 전부터", "12일 전부터", "13일 전부터", "14일 전부터"]},
            available_reserve_time:
                {value:[0, 30, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 1440, 2880], text:["설정 안함", "30분전", "1시간 전", "2시간 전", "3시간 전", "4시간 전", "5시간 전", "6시간 전", "7시간 전", "8시간 전", "9시간 전", "10시간 전", "11시간 전", "12시간 전", "24시간 전", "48시간 전"]},
            available_cancel_time:
                {value:[0, 30, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 1440, 2880], text:["설정 안함", "30분전", "1시간 전", "2시간 전", "3시간 전", "4시간 전", "5시간 전", "6시간 전", "7시간 전", "8시간 전", "9시간 전", "10시간 전", "11시간 전", "12시간 전", "24시간 전", "48시간 전"]},
            wait_schedule_auto_cancel_time:
                {value:[0, 30, 60, 120, 180, 360, 720, 1440], text:["설정 안함", "30분전", "1시간 전", "2시간 전", "3시간 전", "6시간 전", "12시간 전", "1일 전"]}
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_reserve_func.read((data)=>{
            this.data.setting_member_reserve_time_available = data.setting_member_reserve_time_available;
            this.data.start_avail_time = this.data.setting_member_reserve_time_available.split('-')[0];
            this.data.end_avail_time = this.data.setting_member_reserve_time_available.split('-')[1];
            if(this.data.end_avail_time == "23:59") this.data.end_avail_time = "24:00";
            this.data.start_avail_time_text = TimeRobot.to_text(this.data.start_avail_time);
            this.data.end_avail_time_text = TimeRobot.to_text(this.data.end_avail_time);
            console.log(this.data.setting_member_reserve_time_available);
            console.log(this.data.start_avail_time);
            console.log(this.data.end_avail_time);
            console.log(this.data.start_avail_time_text);
            console.log(this.data.end_avail_time_text);
            this.data.stop_reserve = data.setting_member_reserve_prohibition;

            // this.data.start_time_for_private_reserve.value[0] = data.setting_member_start_time;
            // this.data.start_time_for_private_reserve.text[0] = this.data_for_selector.start_time_for_private_reserve.text[ this.data_for_selector.start_time_for_private_reserve.value.indexOf(data.setting_member_start_time) ];

            this.data.available_reserve_date.value[0] = data.setting_member_reserve_date_available;
            this.data.available_reserve_date.text[0] = this.data_for_selector.available_reserve_date.text[ this.data_for_selector.available_reserve_date.value.indexOf(Number(data.setting_member_reserve_date_available) ) ];

            this.data.available_reserve_time.value[0] = data.setting_member_reserve_enable_time;
            this.data.available_reserve_time.text[0] = this.data_for_selector.available_reserve_time.text[ this.data_for_selector.available_reserve_time.value.indexOf(Number(data.setting_member_reserve_enable_time) ) ];

            this.data.available_cancel_time.value[0] = data.setting_member_reserve_cancel_time;
            this.data.available_cancel_time.text[0] = this.data_for_selector.available_cancel_time.text[ this.data_for_selector.available_cancel_time.value.indexOf(Number(data.setting_member_reserve_cancel_time) ) ];

            this.data.capacity_visible = data.setting_member_lecture_max_num_view_available;
            this.data.main_trainer_visible = data.setting_member_lecture_main_trainer_view_available;
            this.data.disable_schedule_visible = data.setting_member_disable_schedule_visible;
            
            this.data.setting_member_private_class_auto_permission = data.setting_member_private_class_auto_permission;
            this.data.setting_member_public_class_auto_permission = data.setting_member_public_class_auto_permission;
            this.data.setting_member_public_class_wait_member_num = data.setting_member_public_class_wait_member_num;

            this.data.wait_schedule_auto_cancel_time.value[0] = data.setting_member_wait_schedule_auto_cancel_time;
            this.data.wait_schedule_auto_cancel_time.text[0] = this.data_for_selector.wait_schedule_auto_cancel_time.text[ this.data_for_selector.wait_schedule_auto_cancel_time.value.indexOf(Number(data.setting_member_wait_schedule_auto_cancel_time) ) ];
            this.data.setting_single_lecture_duplicate = data.setting_single_lecture_duplicate;

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
        // let top_right = `<span class="icon_right" onclick="setting_reserve_popup.upper_right_menu();">${CImg.confirm()}</span>`;
        let top_right = `<span class="icon_right" onclick="setting_reserve_popup.upper_right_menu();"><span style="color:var(--font-highlight);font-weight: 500;">저장</span></span>`;
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
                    // '<article class="obj_input_box_full" style="padding-top:5px;">' +
                    //    this.dom_row_start_time_for_private_reserve() +
                    //    "<span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>수강 회원님께서 선택 가능한 시작 시각</span>" +
                    // '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_available_reserve_date() + 
                        this.dom_row_available_reserve_time() + 
                        this.dom_row_available_cancel_time() +
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_reserve_avail_time() +
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_capacity_visible() +
                        "<div style=\"margin-bottom:15px;\"><span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>이용 회원님께서 예약시 일정의 현재 참석자와 정원 숫자를 볼 수 있습니다.</span></div>" +
                        this.dom_row_main_trainer_visible() +
                        "<div style=\"margin-bottom:15px;\"><span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>이용 회원님께서 예약시 일정의 담당 강사를 볼 수 있습니다.</span></div>" +
                        // this.dom_row_disable_schedule_visible() +
                        // "<div><span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>이용 회원님께서 예약시 예약 가능한 일정만 볼 수 있습니다.</span></div>" +
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_single_class_duplicate() +
                       "<div style=\"margin-bottom:15px;\"><span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>회원님이 같은 시간에 여러 개인 수업을 예약할수 있습니다.</span></div>" +
                        this.dom_row_member_private_class_auto_permission() +
                       "<div style=\"margin-bottom:15px;\"><span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>기능을 꺼두면 이용 회원님께서 예약시 대기 예약으로만 등록됩니다.</span></div>" +
                        this.dom_row_member_public_class_auto_permission() +
                       "<div><span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>기능을 꺼두면 이용 회원님께서 예약시 대기 예약으로만 등록됩니다.</span></div>" +
                        this.dom_row_member_public_class_wait_member_num() +
                       "<div><span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>수업 정원 초과시 대기 예약으로 등록됩니다.</span></div>" +
                        this.dom_row_wait_schedule_auto_cancel_time() +
                       "<div><span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>수업 시작전 대기 예약이 자동 취소되는 시간을 선택할수 있습니다.</span></div>" +
                    '</article>';
        if(this.data.stop_reserve == ON){
            html = this.dom_row_stop_reserve();
            // html = this.dom_row_stop_reserve() +
            //         '<article class="obj_input_box_full">' +
            //             this.dom_row_capacity_visible() +
            //             "<span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>이용 회원님께서 예약 시 일정의 현재 참석자와 정원 숫자를 볼 수 있습니다.</span>" +
            //             this.dom_row_main_trainer_visible() +
            //             "<span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>이용 회원님께서 예약시 일정의 담당 강사를 볼 수 있습니다.</span>" +
            //         '</article>';
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
        let title_row = CComponent.text_button ("stop_reserve_text", '회원 예약 기능 정지', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.7px"}, ()=>{});
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

    dom_row_capacity_visible(){
        let id = `capacity_visible`;
        let power = this.data.capacity_visible;
        let style = null;
        let capacity_visible_toggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.capacity_visible = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("capacity_visible_text", '일정의 [참석자 수/정원] 표기', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `
                    <div style="display:table;width:100%;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle">${capacity_visible_toggle}</div>
                    </div>
                   `;
        return html;
    }

    dom_row_main_trainer_visible(){
        let id = `main_trainer_visible`;
        let power = this.data.main_trainer_visible;
        let style = null;
        let main_trainer_visible_toggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.main_trainer_visible = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("main_trainer_visible_text", '일정의 [담당 강사] 표기', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `
                    <div style="display:table;width:100%;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle">${main_trainer_visible_toggle}</div>
                    </div>
                   `;
        return html;
    }

    dom_row_disable_schedule_visible(){
        let id = `disable_schedule_visible`;
        let power = this.data.disable_schedule_visible;
        let style = null;
        let disable_schedule_visible_toggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.disable_schedule_visible = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("disable_schedule_visible_text", '예약 가능 일정만 표기', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `
                    <div style="display:table;width:100%;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle">${disable_schedule_visible_toggle}</div>
                    </div>
                   `;
        return html;
    }
    dom_row_member_private_class_auto_permission(){
        let id = `member_private_class_auto_permission`;
        let power = this.data.setting_member_private_class_auto_permission;
        let style = null;
        let member_private_class_auto_permission_toggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.setting_member_private_class_auto_permission = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("setting_member_private_class_auto_permission_text", '개인 수업 예약시 자동 확정', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `
                    <div style="display:table;width:100%;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle">${member_private_class_auto_permission_toggle}</div>
                    </div>
                   `;
        return html;
    }
    dom_row_member_public_class_auto_permission(){
        let id = `member_public_class_auto_permission`;
        let power = this.data.setting_member_public_class_auto_permission;
        let style = null;
        let member_public_class_auto_permission_toggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.setting_member_public_class_auto_permission = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("setting_member_public_class_auto_permission_text", '그룹 수업 예약시 자동 확정', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `
                    <div style="display:table;width:100%;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle">${member_public_class_auto_permission_toggle}</div>
                    </div>
                   `;
        return html;
    }
    dom_row_member_public_class_wait_member_num(){
        // let id = `member_public_class_wait_member_num`;
        // let power = this.data.setting_member_public_class_wait_member_num;
        // let style = null;
        // let member_public_class_auto_permission_toggle = CComponent.toggle_button (id, power, style, (data)=>{
        //                         this.data.setting_member_public_class_wait_member_num = data; // ON or OFF
        //                         this.render_content();
        //                     });
        //
        // return html;
        let id = "member_public_class_wait_member_num";
        let title = this.data.setting_member_public_class_wait_member_num == 0 ? "" : this.data.setting_member_public_class_wait_member_num+'명';
        let placeholder = "0명";
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"text-align":"right", "padding-bottom":"0", "padding-top":"24px;", "padding-right":"10px"};
        let disabled = false;
        let onfocusout = (user_input_data)=>{
            if(user_input_data==null){
                user_input_data = 0;
            }
            if(Number(user_input_data) < 0){
                show_error_message({title:"대기 허용 정원은 0명 이상 설정해주세요."});
                this.render_content();
                return false;
            }
            this.data.setting_member_public_class_wait_member_num = user_input_data;
            this.render_content();
            // console.log(user_input_data)
        };
        let pattern = "[0-9]{0,4}";
        let pattern_message = "";
        let required = "";
        let title_row = CComponent.text_button ("member_public_class_wait_member_num", '그룹 수업 대기 허용 정원', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let member_public_class_wait_member_num_row = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, onfocusout, pattern, pattern_message, required);
        let html = `
            <div style="display:table;width:100%;">
                <div style="display:table-cell;width:auto;vertical-align:bottom">${title_row}</div>
                <div style="display:table-cell;width:150px;vertical-align:middle">${member_public_class_wait_member_num_row}</div>
            </div>
           `;
        return html;
    }

    dom_row_wait_schedule_auto_cancel_time(){
        let id = "wait_schedule_auto_cancel_time";
        let title = "대기 예약 자동 취소 시간";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = this.data.wait_schedule_auto_cancel_time.text.length == 0 ? '' : this.data.wait_schedule_auto_cancel_time.text;
        let style = {"padding-bottom":"0", "padding-top":"24px;"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "대기 예약 자동 취소 시간";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = this.data_for_selector.wait_schedule_auto_cancel_time;
            let selected_data = this.data.wait_schedule_auto_cancel_time;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.wait_schedule_auto_cancel_time = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }

    dom_row_single_class_duplicate(){
        let id = `single_class_duplicate`;
        let power = this.data.setting_single_lecture_duplicate;
        let style = null;
        let single_lecture_duplicate_toggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.setting_single_lecture_duplicate = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("single_lecture_duplicate_text", '개인 수업 중복 예약', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `
                    <div style="display:table;width:100%;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle">${single_lecture_duplicate_toggle}</div>
                    </div>
                   `;
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

    dom_row_reserve_avail_time(){
        let html_to_join = [];
        let title_row = CComponent.text_button ("setting_avail_time_text", '예약 허용 시간대', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let start_time_selector = this.dom_row_start_time_select();
        let end_time_selector = this.dom_row_end_time_select();
        let id = `reserve_avail_time`;
        let style = null;
        let html = `${title_row} 
                    <div style=\"margin-bottom:15px;\"><span style='font-size:12px;color:var(--font-main);letter-spacing:-0.6px;font-weight:normal'>설정한 시간에만 예약이 가능합니다.</span></div>
                    ${start_time_selector}
                    ${end_time_selector}`;
        html_to_join.push(html);

        return html_to_join.join('');

    }
    dom_row_start_time_select(){
        let id = `select_start_avail_time`;
        let title = this.data.start_avail_time_text == null ? '시작 시각*' : this.data.start_avail_time_text;
        let icon = CImg.time();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ //data : 직전 셋팅값
            //행을 클릭했을때 실행할 내용
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*255/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{

                //data의 선택 시작시간이 빈값이라면 현재 시간으로 셋팅한다.
                let hour = this.data.start_avail_time == null ? 0 : this.data.start_avail_time.split(':')[0];
                let minute = this.data.start_avail_time == null ? 0 : this.data.start_avail_time.split(':')[1];

                time_selector = new TimeSelector2('#wrapper_popup_time_selector_function', null, {myname:'time', title:'시작 시각', data:{hour:hour, minute:minute},
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.data.start_avail_time = TimeRobot.to_hhmm(object.data.hour, object.data.minute).complete;
                                                                                                    this.data.start_avail_time_text = object.text;
                                                                                                    this.render_content();

                                                                                                    if(this.data.end_avail_time != null){
                                                                                                        let compare = TimeRobot.compare(`${object.data.hour}:${object.data.minute}`, this.data.end_avail_time);
                                                                                                        if(compare == true){
                                                                                                            //유저가 선택할 수 있는 최저 시간을 셋팅한다. 이시간보다 작은값을 선택하려면 메세지를 띄우기 위함
                                                                                                            this.data.end_avail_time = TimeRobot.to_hhmm(object.data.hour, object.data.minute).complete;
                                                                                                            this.data.end_avail_time_text = object.text;
                                                                                                            this.render_content();
                                                                                                        }
                                                                                                    }
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });
        return html;
    }

    dom_row_end_time_select(){
        let id = `select_end_avail_time`;
        let title = this.data.end_avail_time_text == null ? '종료 시각*' : this.data.end_avail_time_text;
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.start_avail_time == this.data.end_avail_time && this.data.end_avail_time != null ? {"color":"var(--font-highlight)"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ //data : 직전 셋팅값
            //행을 클릭했을때 실행할 내용
            if(this.data.start_avail_time == null){
                show_error_message({title:'시작 시각을 먼저 선택해주세요'});
                return false;
            }
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', 100*255/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{

                //data_to_send의 선택 시작시간이 빈값이라면 시작 시간으로 셋팅한다.
                let hour_init = this.data.end_avail_time == null ? this.data[day].start_avail_time.split(':')[0] : this.data.end_avail_time.split(':')[0];
                let minute_init = this.data.end_avail_time == null ? this.data[day].start_avail_time.split(':')[1] : this.data.end_avail_time.split(':')[1];

                //유저가 선택할 수 있는 최저 시간을 셋팅한다. 이시간보다 작은값을 선택하려면 메세지를 띄우기 위함
                let hour_min = this.data.start_avail_time.split(':')[0];
                let minute_min = this.data.start_avail_time.split(':')[1];

                time_selector = new TimeSelector2('#wrapper_popup_time_selector_function', null, {myname:'time', title:'종료 시각',
                                                                                                data:{hour:hour_init, minute:minute_init}, min:{hour:hour_min, minute:minute_min},
                                                                                                callback_when_set: (object)=>{
                                                                                                    this.data.end_avail_time = TimeRobot.to_hhmm(object.data.hour, object.data.minute).complete;
                                                                                                    this.data.end_avail_time_text = object.text;
                                                                                                    this.render_content();
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
            });
        });

        return html;
    }


    art_data(start_time, end_time){
        let merged;
        if(end_time == '24:00'){
            end_time = '23:59';
        }
        if(start_time == null && end_time == null){
            merged = `00:00-23:59`;
        }else if(start_time == null && end_time != null){
            merged = `00:00-${end_time}`;
        }else if(start_time != null && end_time == null){
            merged = `${start_time}-23:59`;
        }else{
            merged = start_time + '-' + end_time;
        }

        return merged;
    }

    send_data(){
        let auth_inspect = pass_inspector.setting_update();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            show_error_message({title:message});
            return false;
        }
        
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }
        let data = {

            "setting_member_reserve_time_available": this.art_data(this.data.start_avail_time, this.data.end_avail_time) , //예약 가능 시간대
            "setting_member_reserve_prohibition":this.data.stop_reserve, // 예약 일시 정지
            // "setting_member_time_duration":this.data.time_for_private_reserve.value[0], //개인 수업 예약 시간
            // "setting_member_start_time": this.data.start_time_for_private_reserve.value[0], //개인 수업 예약 시작 시각

            "setting_member_reserve_date_available":this.data.available_reserve_date.value[0], //예약 가능 날짜
            "setting_member_reserve_enable_time":this.data.available_reserve_time.value[0], //예약 가능 시간
            "setting_member_reserve_cancel_time":this.data.available_cancel_time.value[0], //예약 취소 가능 시간
            "setting_member_lecture_max_num_view_available":this.data.capacity_visible, // 현재 참석자/정원 보이기
            "setting_member_lecture_main_trainer_view_available":this.data.main_trainer_visible, // 현재 담당 강사 보이기
            "setting_member_disable_schedule_visible":this.data.disable_schedule_visible, // 예약 가능 일정만 보이기
            "setting_single_lecture_duplicate":this.data.setting_single_lecture_duplicate,

            "setting_member_private_class_auto_permission":this.data.setting_member_private_class_auto_permission, // 개인 수업 예약 자동 수락 기능
            "setting_member_public_class_auto_permission":this.data.setting_member_public_class_auto_permission, // 그룹 수업 예약 자동 수락 기능
            "setting_member_public_class_wait_member_num":this.data.setting_member_public_class_wait_member_num,
            "setting_member_wait_schedule_auto_cancel_time": this.data.wait_schedule_auto_cancel_time.value[0]
        };
        
        Setting_reserve_func.update(data, ()=>{
            this.data_sending_now = false;
            this.set_initial_data();
            show_error_message({title:'설정이 저장되었습니다.'});
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
                        show_error_message({title:data.messageArray[0]});
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
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
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
                        show_error_message({title:data.messageArray[0]});
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
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
            }
        });
    }
}


