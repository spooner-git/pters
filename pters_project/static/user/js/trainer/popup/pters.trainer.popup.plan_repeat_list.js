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
        


        return html;
    }

    dom_sub_assembly_lectures(){
        let html_to_join = [];
        for(let item in this.data.lecture_repeat_schedule_list){
            let data = this.data.lecture_repeat_schedule_list[item];
            let repeat_id = data.repeat_schedule_id;
            let color = data.lecture_ing_color_cd;
            let repeat_name = data.lecture_name;
            let repeat_day = data;
            let repeat_period = data.start_date + ' - ' + data.end_date;
            let repeat_start_time = TimeRobot.to_hhmm(data.start_time.split(':')[0], data.start_time.split(':')[1]);
            let repeat_end_time = TimeRobot.to_hhmm(data.end_time.split(':')[0], data.end_time.split(':')[1]);
            let repeat_time = repeat_start_time + ' - ' + repeat_end_time;

            let html = this.dom_row_repeat_item(repeat_id, color, repeat_name, repeat_day, repeat_period, repeat_time);

            html_to_join.push(html);
        }

        return html_to_join.join("");
    }

    dom_sub_assembly_members(){
        let html_to_join = [];
        let length = this.data.member_repeat_schedule_list.length;
        for(let i=0; i<length; i++){
            let data = this.data.member_repeat_schedule_list;
            let repeat_id = data.repeat_schedule_id;
            let color = '#cccccc';
            let repeat_name = data.member_name;
            let repeat_day = data;
            let repeat_period = data.repeat_start_date + ' - ' + data.repeat_end_date;
            let repeat_start_time = TimeRobot.to_hhmm(data.repeat_start_time.split(':')[0], data.repeat_start_time.split(':')[1]);
            let repeat_end_time = TimeRobot.to_hhmm(data.repeat_end_time.split(':')[0], data.repeat_end_time.split(':')[1]);
            let repeat_time = repeat_start_time + ' - ' + repeat_end_time;

            let html = this.dom_row_repeat_item(repeat_id, color, repeat_name, repeat_day, repeat_period, repeat_time);

            html_to_join.push(html);
        }

        return html_to_join.join("");
    }

    dom_sub_assembly_offs(){
        let html_to_join = [];
        let length = this.data.off_repeat_schedule_data.length;
        for(let i=0; i<length; i++){
            let data = this.data.off_repeat_schedule_data;
            let repeat_id = data.repeat_schedule_id;
            let color = '#282828';
            let repeat_name = "OFF";
            let repeat_day = data;
            let repeat_period = data.start_date + ' - ' + data.end_date;
            let repeat_start_time = TimeRobot.to_hhmm(data.start_time.split(':')[0], data.start_time.split(':')[1]);
            let repeat_end_time = TimeRobot.to_hhmm(data.end_time.split(':')[0], data.end_time.split(':')[1]);
            let repeat_time = repeat_start_time + ' - ' + repeat_end_time;

            let html = this.dom_row_repeat_item(repeat_id, color, repeat_name, repeat_day, repeat_period, repeat_time);

            html_to_join.push(html);
        }

        return html_to_join.join("");
    }


    dom_row_repeat_item(repeat_id, color, repeat_name, repeat_day, repeat_period, repeat_time){
        let html = `<div style="display:flex;width:100%;height:60px;padding:8px 20px;box-sizing:border-box;" id="repeat_item_${repeat_id}">
                        <div style="flex-basis:16px;">
                            <div style="float:left;width:4px;height:32px;background-color:${color}"></div>
                        </div>
                        <div style="flex:1 1 0">
                            <div>${repeat_name}</div>
                            <div>${repeat_day} / ${repeat_time}</div>
                        </div>
                        <div style="flex-basis:30px;">
                            <img src="/static/common/icon/icon_more_horizontal.png" style="width:24px;vertical-align:top;">
                        </div>
                    </div>`;

        return html;
    }

    dom_row_repeat_participants(repeat_id, member_id, member_name, member_photo){
        let html = ``;

        return html;
    }


    dom_row_toolbox(){
        let title = "반복 일정";
        let html = `
        <div class="lecture_view_upper_box" style="">
            <div style="display:inline-block;width:320px;">
                <span style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
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


