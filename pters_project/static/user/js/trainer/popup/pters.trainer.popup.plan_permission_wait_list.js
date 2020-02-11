class Plan_permission_wait_list{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_plan_permission_wait_list_toolbox', content:'section_plan_permission_wait_list_content'};

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
        Plan_func.read_plan_permission_wait((data)=>{
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();plan_permission_wait_list_popup.clear();">${CImg.x()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_plan_permission_wait_list .wrapper_top').style.border = 0;
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
                <div style="font-size:12px;color:var(--font-sub-normal);word-break:keep-all">사용자 데이터를 불러오고 있습니다.</div>
            </div>`;
    }

    dom_assembly_toolbox(){
        return this.dom_row_toolbox();
    }
    
    dom_assembly_content(){
        let members_list = this.dom_sub_assembly_members();

        let html = members_list;

        if(Object.keys(this.data.permission_wait_schedule).length == 0){
            html = `<div style="font-size:14px;letter-spacing:-0.6px;font-weight:500;padding:20px;">
                        예약 대기 일정이 없습니다.
                    </div>`;
        }

        return html;
    }


    dom_sub_assembly_members(){
        let html_to_join = [];
        let length = Object.keys(this.data.permission_wait_schedule).length;
        for(let i=0; i<length; i++){
            let data = this.data.permission_wait_schedule[i];
            let schedule_id = data.schedule_id;
            let color = data.lecture_ing_color_cd;
            let lecture_name = data.lecture_name
            let member_name = data.member_name;
            let permission_state_cd = data.permission_state_cd;
            let schedule_date = data.schedule_date;
            let schedule_time = data.schedule_time;
            let schedule_reg_dt = data.reg_dt;
            let html = this.dom_row_permission_wait_item(schedule_id, color, lecture_name, member_name, schedule_date, schedule_time, schedule_reg_dt, permission_state_cd);

            html_to_join.push(html);
        }

        return html_to_join.join("");
    }

    dom_row_permission_wait_item(schedule_id, color, lecture_name, member_name, schedule_date, schedule_time, schedule_reg_dt, permission_state_cd){
        let html = `<div class="permission_wait_wrapper" id="permission_wait_item_${schedule_id}">
                        <div style="flex-basis:16px;">
                            <div style="float:left;width:4px;height:62px;background-color:${color}"></div>
                        </div>
                        <div style="flex:1 1 0">
                            <div style="font-size:16px;font-weight:500;letter-spacing:-0.7px;color:var(--font-base);">${lecture_name} - ${member_name}</div>
                            <div style="font-size:14px;font-weight:500;letter-spacing:-0.5px;color:var(--font-base);">${schedule_date} ${schedule_time}</div>
                            <div style="font-size:12px;font-weight:500;letter-spacing:-0.5px;color:var(--font-sub-normal);">등록 : ${schedule_reg_dt.split('.')[0]}</div>
                        </div>
                        <div style="flex-basis:30px;">
                            ${CImg.more("", {"height":"64px"})}
                        </div>
                    </div>`;
        $(document).off('click', `#permission_wait_item_${schedule_id}`).on('click', `#permission_wait_item_${schedule_id}`, function(e){
            let user_option = {
                delete:{text:"예약 취소", callback:()=>{
                    show_user_confirm({title:`정말 ${lecture_name}-${member_name}님 일정을 취소하시겠습니까?`}, ()=>{
                    let inspect = pass_inspector.schedule_delete();
                    if(inspect.barrier == BLOCKED){
                        let message = `${inspect.limit_type}`;
                        layer_popup.close_layer_popup();
                        show_error_message({title:message});
                        return false;
                    }

                    Plan_func.delete({"schedule_id":schedule_id}, ()=>{
                        plan_permission_wait_list_popup.init();
                        try{
                            current_page.init();
                        }catch(e){}
                        layer_popup.all_close_layer_popup();
                    });
                });
                }},
                permission_approve:{text:"예약 승인", callback:()=>{
                    layer_popup.close_layer_popup();
                    let confirm_message = {title:"예약 상태 변경", comment:"<span style='color:var(--font-highlight);'>예약 승인 하시겠습니까?</span>"};
                    show_user_confirm (confirm_message, ()=>{
                        layer_popup.close_layer_popup();
                        let inspect = pass_inspector.schedule_update();
                        if(inspect.barrier == BLOCKED){
                            let message = `${inspect.limit_type}`;
                            // layer_popup.close_layer_popup();
                            show_error_message({title:message});
                            return false;
                        }
                        let send_data = {"schedule_id":schedule_id, "permission_state_cd":SCHEDULE_APPROVE};
                        Plan_func.permission_status(send_data, ()=>{
                            plan_permission_wait_list_popup.init();
                            // try{
                            //     current_page.init();
                            // }catch(e){}
                        });
                    });
                }},
                permission_wait:{text:"예약 대기", callback:()=>{
                    layer_popup.close_layer_popup();
                    let confirm_message = {title:"예약 상태 변경", comment:"<span style='color:var(--font-highlight);'>예약 대기로 변경 하시겠습니까?</span>"};
                    show_user_confirm (confirm_message, ()=>{
                        layer_popup.close_layer_popup();
                        let inspect = pass_inspector.schedule_update();
                        if(inspect.barrier == BLOCKED){
                            let message = `${inspect.limit_type}`;
                            // layer_popup.close_layer_popup();
                            show_error_message({title:message});
                            return false;
                        }
                        let send_data = {"schedule_id":schedule_id, "permission_state_cd":SCHEDULE_WAIT};
                        Plan_func.permission_status(send_data, ()=>{
                            plan_permission_wait_list_popup.init();
                            // try{
                            //     current_page.init();
                            // }catch(e){}
                        });
                    });
                }}
            };
            if(permission_state_cd == SCHEDULE_APPROVE){
                delete user_option.permission_approve;
            }
            if(permission_state_cd == SCHEDULE_WAIT){
                delete user_option.permission_wait;
            }
            let options_padding_top_bottom = 16;
            // let button_height = 8 + 8 + 52;
            let button_height = 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });

        return html;
    }

    dom_row_toolbox(){
        let title = "예약 대기 일정";
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


