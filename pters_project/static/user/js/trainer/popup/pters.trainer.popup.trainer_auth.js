class Trainer_auth{
    constructor(install_target, external_data){
        this.target = {install: install_target, toolbox:'section_trainer_auth_toolbox', content:'section_trainer_auth_content'};
        this.data_sending_now = false;
        this.external_data = external_data;
        this.trainer_name = this.external_data.trainer_name;
        this.trainer_db_id = this.external_data.db_id;
        this.shared_status = this.external_data.shared_status;
        this.current_shared_status = null;
        this.program_id = this.external_data.program_id;

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
                trainer:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                notice:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
                },
                statistics:{
                    read : OFF
                },
                setting:{
                    create:OFF,
                    read:OFF,
                    update:OFF,
                    delete:OFF
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
        Trainer_auth_func.read({"class_id": this.program_id}, (data)=>{
            let my_auth = data[this.trainer_db_id];
            
            if(my_auth != undefined){
                this.data.schedule.create = my_auth.auth_plan_create != undefined ? my_auth.auth_plan_create : OFF;
                this.data.schedule.read = my_auth.auth_plan_read != undefined ? my_auth.auth_plan_read : OFF;
                this.data.schedule.update = my_auth.auth_plan_update != undefined ? my_auth.auth_plan_update : OFF;
                this.data.schedule.delete = my_auth.auth_plan_delete != undefined ? my_auth.auth_plan_delete : OFF;

                this.data.member.create = my_auth.auth_member_create != undefined ? my_auth.auth_member_create : OFF;
                this.data.member.read = my_auth.auth_member_read != undefined ? my_auth.auth_member_read : OFF;
                this.data.member.update = my_auth.auth_member_update != undefined ? my_auth.auth_member_update : OFF;
                this.data.member.delete = my_auth.auth_member_delete != undefined ? my_auth.auth_member_delete : OFF;

                this.data.lecture.create = my_auth.auth_group_create != undefined ? my_auth.auth_group_create : OFF;
                this.data.lecture.read = my_auth.auth_group_read != undefined ? my_auth.auth_group_read : OFF;
                this.data.lecture.update = my_auth.auth_group_update != undefined ? my_auth.auth_group_update : OFF;
                this.data.lecture.delete = my_auth.auth_group_delete != undefined ? my_auth.auth_group_delete : OFF;

                this.data.ticket.create = my_auth.auth_package_create != undefined ? my_auth.auth_package_create : OFF;
                this.data.ticket.read = my_auth.auth_package_read != undefined ? my_auth.auth_package_read : OFF;
                this.data.ticket.update = my_auth.auth_package_update != undefined ? my_auth.auth_package_update : OFF;
                this.data.ticket.delete = my_auth.auth_package_delete != undefined ? my_auth.auth_package_delete : OFF;

                this.data.trainer.create = my_auth.auth_trainer_create != undefined ? my_auth.auth_trainer_create : OFF;
                this.data.trainer.read = my_auth.auth_trainer_read != undefined ? my_auth.auth_trainer_read : OFF;
                this.data.trainer.update = my_auth.auth_trainer_update != undefined ? my_auth.auth_trainer_update : OFF;
                this.data.trainer.delete = my_auth.auth_trainer_delete != undefined ? my_auth.auth_trainer_delete : OFF;

                this.data.notice.create = my_auth.auth_notice_create != undefined ? my_auth.auth_notice_create : OFF;
                this.data.notice.read = my_auth.auth_notice_read != undefined ? my_auth.auth_notice_read : OFF;
                this.data.notice.update = my_auth.auth_notice_update != undefined ? my_auth.auth_notice_update : OFF;
                this.data.notice.delete = my_auth.auth_notice_delete != undefined ? my_auth.auth_notice_delete : OFF;

                this.data.statistics.read = my_auth.auth_analytics_read != undefined ? my_auth.auth_analytics_read : OFF;

                this.data.setting.create = my_auth.auth_setting_create != undefined ? my_auth.auth_setting_create : OFF;
                this.data.setting.read = my_auth.auth_setting_read != undefined ? my_auth.auth_setting_read : OFF;
                this.data.setting.update = my_auth.auth_setting_update != undefined ? my_auth.auth_setting_update : OFF;
                this.data.setting.delete = my_auth.auth_setting_delete != undefined ? my_auth.auth_setting_delete : OFF;

                this.shared_status = my_auth.trainer_info.auth_cd;
                this.current_shared_status = my_auth.trainer_info.auth_cd;
            }
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();trainer_auth_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="trainer_auth_popup.upper_right_menu();">${CImg.confirm()}</span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_trainer_auth .wrapper_top').style.border = 0;
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
        let shared_status_button = this.current_shared_status == null ? "" : this.dom_button_shared_status();
        let schedule = this.dom_sub_assembly_schedule();
        let member = this.dom_sub_assembly_member();
        let lecture = this.dom_sub_assembly_lecture();
        let ticket = this.dom_sub_assembly_ticket();
        let trainer = this.dom_sub_assembly_trainer();
        let notice = this.dom_sub_assembly_notice();
        let statistics = this.dom_sub_assembly_statistics();
        let settings = this.dom_sub_assembly_setting();

        let html = schedule + member + lecture + ticket + trainer + notice + statistics + settings + `<article class="obj_input_box_full">${shared_status_button}</article>`;

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


    dom_sub_assembly_trainer(){
        let trainer = this.dom_row_share_menu_title("강사", "trainer");
        let trainer_auth_create = this.dom_row_share_menu_auth_toggle("강사", "등록", "trainer", "create");
        let trainer_auth_read = this.dom_row_share_menu_auth_toggle("강사", "조회", "trainer", "read");
        let trainer_auth_update = this.dom_row_share_menu_auth_toggle("강사", "수정", "trainer", "update");
        let trainer_auth_delete = this.dom_row_share_menu_auth_toggle("강사", "삭제", "trainer", "delete");

        let child_assemble = this.data.trainer.read == ON ? trainer_auth_read + trainer_auth_create +  trainer_auth_update + trainer_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        trainer + child_assemble +
                    `</article>`;
        return html;
    }

    dom_sub_assembly_notice(){
        let notice = this.dom_row_share_menu_title("공지사항", "notice");
        let notice_auth_create = this.dom_row_share_menu_auth_toggle("공지사항", "등록", "notice", "create");
        let notice_auth_read = this.dom_row_share_menu_auth_toggle("공지사항", "조회", "notice", "read");
        let notice_auth_update = this.dom_row_share_menu_auth_toggle("공지사항", "수정", "notice", "update");
        let notice_auth_delete = this.dom_row_share_menu_auth_toggle("공지사항", "삭제", "notice", "delete");

        let child_assemble = this.data.notice.read == ON ? notice_auth_read + notice_auth_create +  notice_auth_update + notice_auth_delete : "";

        let html = `<article class="obj_input_box_full">` +
                        notice + child_assemble +
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

    dom_sub_assembly_setting(){
        let setting = this.dom_row_share_menu_title("설정", "setting");
        // let setting_auth_create = this.dom_row_share_menu_auth_toggle("설정", "등록", "setting", "create");
        let setting_auth_read = this.dom_row_share_menu_auth_toggle("설정", "조회", "setting", "read");
        let setting_auth_update = this.dom_row_share_menu_auth_toggle("설정", "수정", "setting", "update");
        // let setting_auth_delete = this.dom_row_share_menu_auth_toggle("설정", "삭제", "setting", "delete");

        let child_assemble = this.data.setting.read == ON ? setting_auth_read + setting_auth_update  : "";

        let html = `<article class="obj_input_box_full">` +
                        setting + child_assemble +
                    `</article>`;
        return html;
    }


    dom_row_toolbox(){
        let title = `강사 권한 설정 - ${this.trainer_name}`;
        let description = `<p style="font-size:13px;font-weight:500;margin-top:5px;color:var(--font-sub-dark)">강사의 각종 권한을 설정합니다.</p>`;
        let html = `
        <div class="trainer_auth_upper_box" style="">
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
        let title = "권한 설정";
        let style = {"font-size":"13px", "font-weight":"500", "background-color":"var(--bg-highlight)", "color":"var(--fundamental-white)", "line-height":"40px"};
        let onclick = ()=>{
            this.event_select_shared_status(`${this.trainer_name}님의 현재 지점 ${title}을 설정 하시겠습니까?`);
        };
        let html = CComponent.button (id, title, style, onclick);
        return html;
    }

    event_select_shared_status(title_message){
        // let user_option = {
        //     request:{text:"공유 초대", callback:()=>{

        //     }},
        //     disconnect:{text:"공유 해제", callback:()=>{
        //         let message = {
        //             title:`정말 ${this.member_name}님과 현재 지점 공유를 해제 하시겠습니까?`
        //         };
        //         show_user_confirm (message, ()=>{
        //             this.shared_status = AUTH_TYPE_DELETE;
        //             this.send_data();
        //             layer_popup.close_layer_popup(); //옵션 셀렉터 닫기
        //             layer_popup.close_layer_popup(); //권한 설정창 닫기
        //         });
        //     }},
        // };
        // if(this.shared_status == AUTH_TYPE_VIEW || this.shared_status == AUTH_TYPE_WAIT){
        //     delete user_option["request"];
        // }
        // let options_padding_top_bottom = 16;
        // // let button_height = 8 + 8 + 52;
        // let button_height = 52;
        // let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        // let root_content_height = $root_content.height();
        // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
        //     option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        // });
        let message = {
            title:title_message
        };
        // this.shared_status = AUTH_TYPE_DELETE;
        show_user_confirm (message, ()=>{
            this.shared_status = AUTH_TYPE_DELETE;
            this.send_data();
            layer_popup.close_layer_popup(); //옵션 셀렉터 닫기
            // layer_popup.close_layer_popup(); //권한 설정창 닫기
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
        let auth_cd = this.shared_status;
        
        // if(this.current_shared_status==AUTH_TYPE_DELETE){
        //     auth_cd = AUTH_TYPE_WAIT;
        // }
        let data = {
            "class_id":this.program_id,
            "trainer_id": this.trainer_db_id,
            "auth_cd": auth_cd,
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

            "auth_trainer_create":this.data.trainer.create,
            "auth_trainer_read":this.data.trainer.read,
            "auth_trainer_update":this.data.trainer.update,
            "auth_trainer_delete":this.data.trainer.delete,

            "auth_notice_create":this.data.notice.create,
            "auth_notice_read":this.data.notice.read,
            "auth_notice_update":this.data.notice.update,
            "auth_notice_delete":this.data.notice.delete,

            "auth_analytics_read":this.data.statistics.read,

            "auth_setting_read":this.data.setting.read,
            "auth_setting_update":this.data.setting.update,
        };
        Trainer_auth_func.update(data, ()=>{
            this.data_sending_now = false;
            // this.set_initial_data();
            show_error_message({title:'변경 내용이 저장되었습니다.'});
            // this.render_content();
            layer_popup.close_layer_popup();
            setting_sharing_popup.init();
            program_list_popup.init();
            this.current_shared_status = auth_cd;
        }, ()=>{this.data_sending_now = false;});
    }

    upper_right_menu(){
        if(this.shared_status == AUTH_TYPE_DELETE){
            this.shared_status = AUTH_TYPE_WAIT;
        }
        this.send_data();
    }
}

class Trainer_auth_func{
    static update(data, callback, error_callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/add_trainer_program_info/",
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

    static read(data, callback, error_callback){
        $.ajax({
            url:"/trainer/get_trainer_program_data/",
            type: 'GET',
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


