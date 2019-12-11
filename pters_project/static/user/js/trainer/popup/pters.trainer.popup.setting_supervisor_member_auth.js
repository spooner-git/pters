class Setting_supervisor_member_auth{
    constructor(install_target, external_data){
        this.target = {install: install_target, toolbox:'section_setting_supervisor_member_auth_toolbox', content:'section_setting_supervisor_member_auth_content'};
        this.data_sending_now = false;
        this.external_data = external_data;
        this.member_db_id = this.external_data.db_id;

        this.data = {
                schedule:{
                    create:ON,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                member:{
                    create:OFF,
                    read:OFF,
                    update:ON,
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
        // Setting_supervisor_member_auth_func.read((data)=>{
        // });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
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
        let schedule = this.dom_sub_assembly_schedule();
        let member = this.dom_sub_assembly_member();
        let lecture = this.dom_sub_assembly_lecture();
        let ticket = this.dom_sub_assembly_ticket();
        let statistics = this.dom_sub_assembly_statistics();

        let html = schedule + member + lecture + ticket + statistics;

        return html;
    }

    dom_sub_assembly_schedule(){
        let schedule = this.dom_row_share_menu_title("일정", "schedule");
        let schedule_auth_create = this.dom_row_share_menu_auth_toggle("일정", "등록", "schedule", "create");
        let schedule_auth_read = this.dom_row_share_menu_auth_toggle("일정", "보기", "schedule", "read");
        let schedule_auth_update = this.dom_row_share_menu_auth_toggle("일정", "수정", "schedule", "update");
        let schedule_auth_delete = this.dom_row_share_menu_auth_toggle("일정", "삭제", "schedule", "delete");

        let html = `<article class="obj_input_box_full">` +
                        schedule + schedule_auth_create + schedule_auth_read + schedule_auth_update + schedule_auth_delete +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_member(){
        let member = this.dom_row_share_menu_title("회원", "member");
        let member_auth_create = this.dom_row_share_menu_auth_toggle("회원", "등록", "member", "create");
        let member_auth_read = this.dom_row_share_menu_auth_toggle("회원", "보기", "member", "read");
        let member_auth_update = this.dom_row_share_menu_auth_toggle("회원", "수정", "member", "update");
        let member_auth_delete = this.dom_row_share_menu_auth_toggle("회원", "삭제", "member", "delete");

        let html = `<article class="obj_input_box_full">` +
                        member + member_auth_create + member_auth_read + member_auth_update + member_auth_delete +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_lecture(){
        let lecture = this.dom_row_share_menu_title("수업", "lecture");
        let lecture_auth_create = this.dom_row_share_menu_auth_toggle("수업", "등록", "lecture", "create");
        let lecture_auth_read = this.dom_row_share_menu_auth_toggle("수업", "보기", "lecture", "read");
        let lecture_auth_update = this.dom_row_share_menu_auth_toggle("수업", "수정", "lecture", "update");
        let lecture_auth_delete = this.dom_row_share_menu_auth_toggle("수업", "삭제", "lecture", "delete");

        let html = `<article class="obj_input_box_full">` +
                        lecture + lecture_auth_create + lecture_auth_read + lecture_auth_update + lecture_auth_delete +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_ticket(){
        let ticket = this.dom_row_share_menu_title("수강권", "ticket");
        let ticket_auth_create = this.dom_row_share_menu_auth_toggle("수강권", "등록", "ticket", "create");
        let ticket_auth_read = this.dom_row_share_menu_auth_toggle("수강권", "보기", "ticket", "read");
        let ticket_auth_update = this.dom_row_share_menu_auth_toggle("수강권", "수정", "ticket", "update");
        let ticket_auth_delete = this.dom_row_share_menu_auth_toggle("수강권", "삭제", "ticket", "delete");

        let html = `<article class="obj_input_box_full">` +
                        ticket + ticket_auth_create + ticket_auth_read + ticket_auth_update + ticket_auth_delete +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_statistics(){
        let statistics = this.dom_row_share_menu_title("통계", "statistics");
        // let statistics_auth_create = this.dom_row_share_menu_auth_toggle("통계", "등록", "statistics", "create");
        let statistics_auth_read = this.dom_row_share_menu_auth_toggle("통계", "보기", "statistics", "read");
        // let statistics_auth_update = this.dom_row_share_menu_auth_toggle("통계", "수정", "statistics", "update");
        // let statistics_auth_delete = this.dom_row_share_menu_auth_toggle("통계", "삭제", "statistics", "delete");

        let html = `<article class="obj_input_box_full">` +
                        statistics + statistics_auth_read +
                    `</article>`;
        return html;
    }


    dom_row_toolbox(){
        let title = `공유자 권한 설정 - ${this.external_data.member_name}`;
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

    dom_row_share_menu_title(name, en_name){
        let id = `share_menu_name_${en_name}`;
        let title_description = `<p style="font-size:12px;font-weight:500;margin:0;color:var(--font-sub-normal)">${name} 메뉴에 관련된 권한 설정입니다.</p>`;
        let title = `${name} ${title_description}`;
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
        let style = null;
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
            "setting_schedule_auto_finish": this.data.plan.switch == OFF ? OFF : this.data.plan.complete_type,
            "setting_member_ticket_auto_finish":this.data.member.switch
        };

        Setting_supervisor_member_auth_func.update(data, ()=>{
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

class Setting_supervisor_member_auth_func{
    static update(data, callback, error_callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_setting_auto_complete/",
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


