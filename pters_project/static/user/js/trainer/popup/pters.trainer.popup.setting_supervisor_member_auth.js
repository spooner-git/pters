class Setting_supervisor_member_auth{
    constructor(install_target, external_data){
        this.target = {install: install_target, toolbox:'section_setting_supervisor_member_auth_toolbox', content:'section_setting_supervisor_member_auth_content'};
        this.data_sending_now = false;
        this.external_data = external_data;
        this.member_name = this.external_data.member_name;
        this.member_db_id = this.external_data.db_id;
        this.shared_status = this.external_data.shared_status;

        this.data = {
                schedule:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                member:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                lecture:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                ticket:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                statistics:{
                    read : OFF
                },
        };

        this.data_received;

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_supervisor_member_auth_func.read((data)=>{
            let my_auth = data[this.member_db_id];

            this.data.schedule.create = my_auth.auth_plan_create != undefined ? my_auth.auth_plan_create : null;
            this.data.schedule.read = my_auth.auth_plan_read != undefined ? my_auth.auth_plan_read : null;
            this.data.schedule.update = my_auth.auth_plan_update != undefined ? my_auth.auth_plan_update : null;
            this.data.schedule.delete = my_auth.auth_plan_delete != undefined ? my_auth.auth_plan_delete : null ;

            this.data.member.create = my_auth.auth_member_create != undefined ? my_auth.auth_member_create : null;
            this.data.member.read = my_auth.auth_member_read != undefined ? my_auth.auth_member_read : null;
            this.data.member.update = my_auth.auth_member_update != undefined ? my_auth.auth_member_update : null;
            this.data.member.delete = my_auth.auth_member_delete != undefined ? my_auth.auth_member_delete : null;

            this.data.lecture.create = my_auth.auth_group_create != undefined ? my_auth.auth_group_create : null;
            this.data.lecture.read = my_auth.auth_group_read != undefined ? my_auth.auth_group_read : null;
            this.data.lecture.update = my_auth.auth_group_update != undefined ? my_auth.auth_group_update : null;
            this.data.lecture.delete = my_auth.auth_group_delete != undefined ? my_auth.auth_group_delete : null;

            this.data.ticket.create = my_auth.auth_package_create != undefined ? my_auth.auth_package_create : null;
            this.data.ticket.read = my_auth.auth_package_read != undefined ? my_auth.auth_package_read : null;
            this.data.ticket.update = my_auth.auth_package_update != undefined ? my_auth.auth_package_update : null;
            this.data.ticket.delete = my_auth.auth_package_delete != undefined ? my_auth.auth_package_delete : null;

            this.data.statistics.read = my_auth.auth_analytics_read != undefined ? my_auth.auth_analytics_read : null;

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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_supervisor_member_auth_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="setting_supervisor_member_auth_popup.upper_right_menu();">${CImg.confirm()}</span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_supervisor_member_auth .wrapper_top').style.border = 0;
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
        let shared_status_button = this.shared_status == AUTH_TYPE_WAIT ? "" : this.dom_button_shared_status();
        let schedule = this.dom_sub_assembly_schedule();
        let member = this.dom_sub_assembly_member();
        let lecture = this.dom_sub_assembly_lecture();
        let ticket = this.dom_sub_assembly_ticket();
        let statistics = this.dom_sub_assembly_statistics();

        let html = schedule + member + lecture + ticket + statistics + `<article class="obj_input_box_full">${shared_status_button}</article>`;

        return html;
    }

    dom_sub_assembly_schedule(){
        let schedule = this.dom_row_share_menu_title("일정", "schedule");
        let schedule_auth_create = this.dom_row_share_menu_auth_toggle("일정", "등록", "schedule", "create");
        let schedule_auth_read = this.dom_row_share_menu_auth_toggle("일정", "조회", "schedule", "read");
        let schedule_auth_update = this.dom_row_share_menu_auth_toggle("일정", "수정", "schedule", "update");
        let schedule_auth_delete = this.dom_row_share_menu_auth_toggle("일정", "삭제", "schedule", "delete");
        
        let child_assemble = this.data.schedule.read == ON ? schedule_auth_read + schedule_auth_create + schedule_auth_update + schedule_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        schedule + child_assemble + 
                    `</article>`;
        return html;
    }

    dom_sub_assembly_member(){
        let member = this.dom_row_share_menu_title("회원", "member");
        let member_auth_create = this.dom_row_share_menu_auth_toggle("회원", "등록", "member", "create");
        let member_auth_read = this.dom_row_share_menu_auth_toggle("회원", "조회", "member", "read");
        let member_auth_update = this.dom_row_share_menu_auth_toggle("회원", "수정", "member", "update");
        let member_auth_delete = this.dom_row_share_menu_auth_toggle("회원", "삭제", "member", "delete");

        let child_assemble = this.data.member.read == ON ? member_auth_read + member_auth_create +  member_auth_update + member_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        member + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_lecture(){
        let lecture = this.dom_row_share_menu_title("수업", "lecture");
        let lecture_auth_create = this.dom_row_share_menu_auth_toggle("수업", "등록", "lecture", "create");
        let lecture_auth_read = this.dom_row_share_menu_auth_toggle("수업", "조회", "lecture", "read");
        let lecture_auth_update = this.dom_row_share_menu_auth_toggle("수업", "수정", "lecture", "update");
        let lecture_auth_delete = this.dom_row_share_menu_auth_toggle("수업", "삭제", "lecture", "delete");

        let child_assemble = this.data.lecture.read == ON ? lecture_auth_read + lecture_auth_create + lecture_auth_update + lecture_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        lecture + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_ticket(){
        let ticket = this.dom_row_share_menu_title("수강권", "ticket");
        let ticket_auth_create = this.dom_row_share_menu_auth_toggle("수강권", "등록", "ticket", "create");
        let ticket_auth_read = this.dom_row_share_menu_auth_toggle("수강권", "조회", "ticket", "read");
        let ticket_auth_update = this.dom_row_share_menu_auth_toggle("수강권", "수정", "ticket", "update");
        let ticket_auth_delete = this.dom_row_share_menu_auth_toggle("수강권", "삭제", "ticket", "delete");

        let child_assemble = this.data.ticket.read == ON ? ticket_auth_read + ticket_auth_create +  ticket_auth_update + ticket_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        ticket + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_statistics(){
        let statistics = this.dom_row_share_menu_title("통계", "statistics");
        let statistics_auth_read = this.dom_row_share_menu_auth_toggle("통계", "보기", "statistics", "read");

        let child_assemble = this.data.statistics.read == ON ? statistics_auth_read : "";

        let html = `<article class="obj_input_box_full">` +
                        statistics + child_assemble +
                    `</article>`;
        return html;
    }


    dom_row_toolbox(){
        let title = `공유자 권한 설정 - ${this.member_name}`;
        let description = `<p style="font-size:13px;font-weight:500;margin-top:5px;color:var(--font-sub-dark)">공유받은 사람의 각종 권한을 설정합니다.</p>`;
        let html = `
        <div class="setting_supervisor_member_auth_upper_box" style="">
            <div style="display:inline-block;">
                <span style="display:inline-block;font-size:23px;font-weight:bold">
                    ${title}
                    ${description}
                </span>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    dom_button_shared_status(){
        let id = null;
        let title = "공유 해제";
        let style = {"font-size":"13px", "font-weight":"500", "background-color":"var(--bg-highlight)", "color":"var(--fundamental-white)", "line-height":"40px"};
        let onclick = ()=>{
            this.event_select_shared_status();
        };
        let html = CComponent.button (id, title, style, onclick);
        return html;
    }

    event_select_shared_status(){
        let user_option = {
            request:{text:"공유 초대", callback:()=>{

            }},
            disconnect:{text:"공유 해제", callback:()=>{
                let message = `정말 ${this.member_name}님과 현재 프로그램 공유를 해제 하시겠습니까?`;
                show_user_confirm (message, ()=>{
                    this.shared_status = AUTH_TYPE_DELETE;
                    this.send_data();
                    layer_popup.close_layer_popup(); //옵션 셀렉터 닫기
                    layer_popup.close_layer_popup(); //권한 설정창 닫기
                });
            }},
        };
        if(this.shared_status == AUTH_TYPE_VIEW || this.shared_status == AUTH_TYPE_WAIT){
            delete user_option["request"];
        }
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    dom_row_share_menu_title(menu, menu_en){
        let id_toggle = `menu_auth_parent_${menu_en}`;
        let power = this.data[menu_en]["read"];
        let style_toggle = {"float":"right"};
        let menu_lock_goggle = CComponent.toggle_button (id_toggle, power, style_toggle, (data)=>{
                                for(let item in this.data[menu_en]){
                                    this.data[menu_en][item] = data;
                                }
                                this.render_content();
                            });


        let id = `share_menu_name_${menu_en}`;
        let title_description = `<p style="font-size:12px;font-weight:500;margin:0;color:var(--font-sub-normal)">${menu} 메뉴에 관련된 권한 설정입니다.</p>`;
        // let title = `<div style="padding-right:5px;">${menu} ${menu_lock_goggle}</div> ${title_description}`;
        let title = `<div style="padding-right:5px;">${menu} ${menu_lock_goggle}</div>`;
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"cursor":"unset", "height":"auto"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            
        });
        let html = row;
        return html;
    }

    dom_row_share_menu_auth_toggle(menu, auth, menu_en, auth_en){
        let id = `menu_auth_${menu_en}_${auth_en}`;
        let power = this.data[menu_en][auth_en];
        let style = {"transform":"scale(0.8)"};
        let menu_lock_goggle = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data[menu_en][auth_en] = data; // ON or OFF
                                this.render_content();
                            });
        let icon = power == ON ? CImg.unlock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"}) : CImg.lock("", {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"});
        let title = `${icon} ${auth}`;
        let title_row = CComponent.text_button (`${menu_en}_${auth_en}_toggle`, title, {"font-size":"14px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let html = `<article class="setting_menu_auth_toggle_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${menu_lock_goggle}</div>
                        </div>
                    </article>`;
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
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }

        let data = {
            "trainer_id": this.member_db_id,
            "auth_cd": this.shared_status,
            "auth_plan_create":this.data.schedule.create,
            "auth_plan_read":this.data.schedule.read,
            "auth_plan_update":this.data.schedule.update,
            "auth_plan_delete":this.data.schedule.delete,

            "auth_member_create":this.data.member.create,
            "auth_member_read":this.data.member.read,
            "auth_member_update":this.data.member.update,
            "auth_member_delete":this.data.member.delete,

            "auth_group_create":this.data.lecture.create,
            "auth_group_read":this.data.lecture.read,
            "auth_group_update":this.data.lecture.update,
            "auth_group_delete":this.data.lecture.delete,

            "auth_package_create":this.data.ticket.create,
            "auth_package_read":this.data.ticket.read,
            "auth_package_update":this.data.ticket.update,
            "auth_package_delete":this.data.ticket.delete,

            "auth_analytics_read":this.data.statistics.read,
        };
        Setting_supervisor_member_auth_func.update(data, ()=>{
            this.data_sending_now = false;
            // this.set_initial_data();
            show_error_message('변경 내용이 저장되었습니다.');
            // this.render_content();
            layer_popup.close_layer_popup();
            setting_supervisor_popup.init();
        }, ()=>{this.data_sending_now = false;});
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_supervisor_member_auth_func{
    static update(data, callback, error_callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_share_program_info/",
            type:'POST',
            data: data,
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

    static read(callback, error_callback){
        $.ajax({
            url:"/trainer/get_share_program_data/",
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


