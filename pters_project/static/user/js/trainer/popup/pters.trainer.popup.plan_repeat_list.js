class Plan_repeat_list{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_plan_repeat_list_toolbox', content:'section_plan_repeat_list_content'};

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
                
        };

        this.init();
    }

 
    init(){
        this.set_initial_data();
    }

    set_initial_data (){
        Plan_func.read_plan_repeat((data)=>{
            this.data = data;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });   
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_x_black.png" onclick="layer_popup.close_layer_popup();plan_repeat_list_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_plan_repeat_list .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    render_loading_image(){
        document.querySelector(this.target.content).innerHTML = 
            `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;">
                <img src="/static/common/loading.svg">
                <div style="font-size:12px;color:#858282">사용자 데이터를 불러오고 있습니다.</div>
            </div>`;
    }

    dom_assembly_toolbox(){
        return this.dom_row_toolbox();
    }
    
    dom_assembly_content(){
        let lectures_list = this.dom_sub_assembly_lectures();
        let members_list = this.dom_sub_assembly_members();
        let offs_list = this.dom_sub_assembly_offs();

        

        let html = lectures_list + members_list + offs_list;

        if(Object.keys(this.data.lecture_repeat_schedule_list).length == 0 && this.data.member_repeat_schedule_list.length == 0 && this.data.off_repeat_schedule_data.length == 0){
            html = `<div style="font-size:14px;letter-spacing:-0.6px;font-weight:500;padding:20px;">
                                    설정된 반복 일정이 없습니다.
                                </div>`;
        }

        return html;
    }

    dom_sub_assembly_lectures(){
        let html_to_join = [];
        for(let item in this.data.lecture_repeat_schedule_list){
            let data = this.data.lecture_repeat_schedule_list[item];
            let repeat_id = data.repeat_schedule_id;
            let color = data.lecture_ing_color_cd;
            let repeat_name = data.lecture_name;
            let repeat_period = data.start_date + ' - ' + data.end_date;
            let repeat_start_time = TimeRobot.to_hhmm(data.start_time.split(':')[0], data.start_time.split(':')[1]).complete;
            let repeat_end_time = TimeRobot.to_hhmm(data.end_time.split(':')[0], data.end_time.split(':')[1]).complete;
            let repeat_time = repeat_start_time + ' - ' + repeat_end_time;
            let repeat_day = data.week_info.split('/').map((item)=>{
                return DAYNAME_MATCH[item];
            }).join('');

            let html_main = this.dom_row_repeat_item(repeat_id, color, repeat_name, repeat_day, repeat_period, repeat_time);


            let length = data.lecture_member_repeat_schedule_list.length;
            let html_to_join_participants = [];
            for(let i=0; i<length; i++){
                let data2 = data.lecture_member_repeat_schedule_list[i];
                let repeat_id = data2.repeat_schedule_id;
                let member_id = data2.member_id;
                let member_name = data2.member_name;
                let member_photo = data2.member_profile_url;
                let html = this.dom_row_repeat_participants(repeat_id, member_id, member_name, member_photo);
                html_to_join_participants.push(html);
            }
            let html_participants = '<div style="margin-bottom:20px;">' + html_to_join_participants.join("") + '</div>';
            if(length == 0){
                html_participants = '';
            }

            let html = html_main + html_participants;

            html_to_join.push(html);
        }

        return html_to_join.join("");
    }

    dom_sub_assembly_members(){
        let html_to_join = [];
        let length = this.data.member_repeat_schedule_list.length;
        for(let i=0; i<length; i++){
            let data = this.data.member_repeat_schedule_list[i];
            let repeat_id = data.repeat_schedule_id;
            let color = data.lecture_ing_color_cd;
            let repeat_name = data.member_name;
            let repeat_period = data.repeat_start_date + ' - ' + data.repeat_end_date;
            let repeat_start_time = TimeRobot.to_hhmm(data.repeat_start_time.split(':')[0], data.repeat_start_time.split(':')[1]).complete;
            let repeat_end_time = TimeRobot.to_hhmm(data.repeat_end_time.split(':')[0], data.repeat_end_time.split(':')[1]).complete;
            let repeat_time = repeat_start_time + ' - ' + repeat_end_time;
            let repeat_day = data.week_info.split('/').map((item)=>{
                return DAYNAME_MATCH[item];
            }).join('');

            let html = this.dom_row_repeat_item(repeat_id, color, repeat_name, repeat_day, repeat_period, repeat_time);

            html_to_join.push(html);
        }

        return html_to_join.join("");
    }

    dom_sub_assembly_offs(){
        let html_to_join = [];
        let length = this.data.off_repeat_schedule_data.length;
        for(let i=0; i<length; i++){
            let data = this.data.off_repeat_schedule_data[i];
            let repeat_id = data.repeat_schedule_id;
            let color = '#282828';
            let repeat_name = "OFF";
            let repeat_period = data.start_date + ' - ' + data.end_date;
            let repeat_start_time = TimeRobot.to_hhmm(data.start_time.split(':')[0], data.start_time.split(':')[1]).complete;
            let repeat_end_time = TimeRobot.to_hhmm(data.end_time.split(':')[0], data.end_time.split(':')[1]).complete;
            let repeat_time = repeat_start_time + ' - ' + repeat_end_time;
            let repeat_day = data.week_info.split('/').map((item)=>{
                return DAYNAME_MATCH[item];
            }).join('');

            let html = this.dom_row_repeat_item(repeat_id, color, repeat_name, repeat_day, repeat_period, repeat_time);

            html_to_join.push(html);
        }

        return html_to_join.join("");
    }


    dom_row_repeat_item(repeat_id, color, repeat_name, repeat_day, repeat_period, repeat_time){
        let html = `<div class="repeat_wrapper" id="repeat_item_${repeat_id}">
                        <div style="flex-basis:16px;">
                            <div style="float:left;width:4px;height:32px;background-color:${color}"></div>
                        </div>
                        <div style="flex:1 1 0">
                            <div style="font-size:16px;font-weight:500;letter-spacing:-0.7px;color:#1f1d1e;">${repeat_name}</div>
                            <div style="font-size:12px;font-weight:500;letter-spacing:-0.5px;color:#858282;">${repeat_day} / ${repeat_time} / ${repeat_period}</div>
                        </div>
                        <div style="flex-basis:30px;">
                            <img src="/static/common/icon/icon_more_horizontal.png" style="width:24px;vertical-align:top;">
                        </div>
                    </div>`;
        $(document).off('click', `#repeat_item_${repeat_id}`).on('click', `#repeat_item_${repeat_id}`, function(e){
            let user_option = {
                delete:{text:"삭제", callback:()=>{
                    layer_popup.close_layer_popup();
                    show_user_confirm(`정말 ${repeat_name}의 반복 일정을 취소하시겠습니까? <br><br>
                                        <img src="/static/common/icon/icon_stopmark.png" style="width:25px;"><br>
                                        <div style="text-align:center;margin-top:5px;">
                                            <span style="color:#fe4e65; font-size:12px;">
                                        하위에 다른 반복일정이 존재할 경우 함께 취소됩니다. <br>
                                        과거일정은 보존되지만, 등록한 미래일정은 취소됩니다.</div>`, ()=>{
                        layer_popup.close_layer_popup();
                        Plan_func.delete_plan_repeat({"repeat_schedule_id":repeat_id}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                this.init();
                            }catch(e){}
                            layer_popup.close_layer_popup();
                        });
                    });
                }}
            };
            let options_padding_top_bottom = 16;
            let button_height = 8 + 8 + 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });

        return html;
    }

    dom_row_repeat_participants(repeat_id, member_id, member_name, member_photo){
        let html = `<div class="repeat_member_wrapper" id="repeat_item_${repeat_id}">
                        <div style="flex-basis:24px;"><img src="${member_photo}" style="border-radius:50%;width:20px;vertical-align:middle;"></div>
                        <div style="flex:1 1 0;font-size:14px;font-weight:500;letter-spacing:-0.6px;color:#3d3b3b;line-height:32px;">${member_name}</div>
                    </div>`;
        $(document).off('click', `#repeat_item_${repeat_id}`).on('click', `#repeat_item_${repeat_id}`, function(e){
            let user_option = {
                delete:{text:"삭제", callback:()=>{
                    layer_popup.close_layer_popup();
                    show_user_confirm(`정말 ${member_name}회원님의 반복 일정을 취소하시겠습니까?`, ()=>{
                        layer_popup.close_layer_popup();
                        Plan_func.delete_plan_repeat({"repeat_schedule_id":repeat_id}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                this.init();
                            }catch(e){}
                            layer_popup.close_layer_popup();
                        });
                    });
                }}
            };
            let options_padding_top_bottom = 16;
            let button_height = 8 + 8 + 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });
        return html;
    }


    dom_row_toolbox(){
        let title = "반복 일정";
        let html = `
        <div class="lecture_view_upper_box" style="">
            <div style="display:inline-block;">
                <span style="display:inline-block;font-size:23px;font-weight:bold">
                    ${title}
                </span>
            </div>
        </div>
        `;
        return html;
    }

    upper_right_menu(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PROGRAM_ADD, 100, popup_style, null, ()=>{
            program_add_popup = new Program_add('.popup_program_add');
        });
    }
}


