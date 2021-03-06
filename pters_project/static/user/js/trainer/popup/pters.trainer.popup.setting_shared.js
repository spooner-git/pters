class Setting_shared{
    constructor(install_target, external_data){
        this.target = {install: install_target, toolbox:'section_setting_shared_toolbox', content:'section_setting_shared_content'};
        this.data_sending_now = false;

        this.program_id = external_data.program_id;
        this.data;

        this.init();
    }

 
    init(){
        // this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_shared_func.read({"class_id":this.program_id}, (data)=>{
            this.data = data;
            this.render();
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_shared_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="setting_shared_popup.event_disconnect();"><span style="color:var(--font-highlight);font-weight: 500;">연결 끊기</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_shared .wrapper_top').style.border = 0;
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
        let html = this.dom_row_shared_members(this.data);
          
        return html;
    }

    dom_row_shared_members(data){

        // let member_name = indiv_auth_data.member_info.member_name;
        // let member_user_id = indiv_auth_data.member_info.member_user_id;
        // let member_db_id = indiv_auth_data.member_info.member_id;

        let auth_plan_create = data.auth_plan_create == 1 ? "등록" : null;
        let auth_plan_read = data.auth_plan_read == 1 ? "조회" :  null;
        let auth_plan_update = data.auth_plan_update == 1 ? "수정" :  null;
        let auth_plan_delete = data.auth_plan_delete == 1 ? "삭제" :  null;

        let auth_member_create = data.auth_member_create == 1 ? "등록" :  null;
        let auth_member_read = data.auth_member_read == 1 ? "조회" :  null;
        let auth_member_update = data.auth_member_update == 1 ? "수정" :  null;
        let auth_member_delete = data.auth_member_delete == 1 ? "삭제" :  null;

        let auth_lecture_create = data.auth_group_create == 1 ? "등록" :  null;
        let auth_lecture_read = data.auth_group_read == 1 ? "조회" :  null;
        let auth_lecture_update = data.auth_group_update == 1 ? "수정" :  null;
        let auth_lecture_delete = data.auth_group_delete == 1 ? "삭제" :  null;

        let auth_ticket_create = data.auth_package_create == 1 ? "등록" :  null;
        let auth_ticket_read = data.auth_package_read == 1 ? "조회" :  null;
        let auth_ticket_update = data.auth_package_update == 1 ? "수정" :  null;
        let auth_ticket_delete = data.auth_package_delete == 1 ? "삭제" :  null;

        let auth_statistics_read = data.auth_analytics_read == 1 ? "조회" :  null;

        let auth_settings_read = data.auth_setting_read == 1 ? "조회" :  null;
        let auth_settings_update = data.auth_setting_update == 1 ? "수정" :  null;

        let schedule_auth = [auth_plan_create, auth_plan_read, auth_plan_update, auth_plan_delete].filter((el)=>{ if(el == null){return false} return true }).map((el)=>{return el});
        let member_auth = [auth_member_create, auth_member_read, auth_member_update, auth_member_delete].filter((el)=>{ if(el == null){return false} return true }).map((el)=>{return el});
        let lecture_auth = [auth_lecture_create, auth_lecture_read, auth_lecture_update, auth_lecture_delete].filter((el)=>{ if(el == null){return false} return true }).map((el)=>{return el});
        let ticket_auth = [auth_ticket_create, auth_ticket_read, auth_ticket_update, auth_ticket_delete].filter((el)=>{ if(el == null){return false} return true }).map((el)=>{return el});
        let statistics_auth = [auth_statistics_read].filter((el)=>{ if(el == null){return false} return true }).map((el)=>{return el});
        let setting_auth = [auth_settings_read, auth_settings_update].filter((el)=>{ if(el == null){return false} return true }).map((el)=>{return el});

        let auth_schedule = `<div class="shared_member_auth" style="${schedule_auth.length == 0 ? "display:none" : ""}">
                                <div class="auth_title">일정</div>
                                <div class="auth_setting">
                                    ${schedule_auth.join("/")}
                                </div>
                            </div>`;
        let auth_member = `<div class="shared_member_auth" style="${member_auth.length == 0 ? "display:none" : ""}">
                                <div class="auth_title">회원</div>
                                <div class="auth_setting">
                                    ${member_auth.join("/")}
                                </div>
                            </div>`;
        let auth_lecture = `<div class="shared_member_auth" style="${lecture_auth.length == 0 ? "display:none" : ""}">
                                <div class="auth_title">수업</div>
                                <div class="auth_setting">
                                    ${lecture_auth.join("/")}
                                </div>
                            </div>`;
        let auth_ticket = `<div class="shared_member_auth" style="${ticket_auth.length == 0 ? "display:none" : ""}">
                                <div class="auth_title">수강권</div>
                                <div class="auth_setting">
                                    ${ticket_auth.join("/")}
                                </div>
                            </div>`;
        let auth_statistics = `<div class="shared_member_auth" style="${statistics_auth.length == 0 ? "display:none" : ""}">
                                <div class="auth_title">통계</div>
                                <div class="auth_setting">
                                    ${statistics_auth.join("/")}
                                </div>
                            </div>`;
        let auth_settings = `<div class="shared_member_auth" style="${setting_auth.length == 0 ? "display:none" : ""}">
                                <div class="auth_title">설정</div>
                                <div class="auth_setting">
                                    ${setting_auth.join("/")}
                                </div>
                            </div>`;

        let html = `<article class="obj_input_box_full">
                        
                        <div class="shared_members_auth_wrapper">
                            ${auth_schedule == null ? "" : auth_schedule}
                            ${auth_member == null ? "" : auth_member}
                            ${auth_lecture == null ? "" : auth_lecture}
                            ${auth_ticket == null ? "" : auth_ticket}
                            ${auth_statistics == null ? "" : auth_statistics}
                            ${auth_settings == null ? "" : auth_settings}
                        </div>                 
                    </article>`;

        // $(document).off('click', `#shared_member_row_${member_db_id}`).on('click', `#shared_member_row_${member_db_id}`, ()=>{
        //     let external_data = {"db_id":member_db_id, "member_name":member_name, "shared_status": AUTH_TYPE_VIEW};
        //     layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_shared_MEMBER_AUTH, 100, POPUP_FROM_RIGHT, null, ()=>{
        //         setting_shared_member_auth_popup = new Setting_shared_member_auth('.popup_setting_shared_member_auth', external_data);
        //     });
        // }); 
        return html;
    }


    dom_row_toolbox(){
        let title = "공유 - 받은 권한";
        let description = `<p style="font-size:12px;font-weight:500;margin-top:5px;color:var(--font-sub-normal)">공유자가 설정한 현재 지점의 내 권한입니다.</p>`;
        let html = `
        <div class="setting_shared_upper_box" style="">
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

    event_disconnect(){
        let message = {
            title:`지점의 공유 연결을 해제합니다.`,
            comment:`다시 연결하려면 지점 소유자에게 요청 해야합니다.`
        };
        show_user_confirm (message, ()=>{
            let data = {"class_id": this.program_id};
            Setting_shared_func.disconnect(data, ()=>{
                location.href = "/trainer/";

                // let current_selected_program_id;
                // program_list_popup.data.program_data.forEach((el)=>{
                //     if(el.program_selected == PROGRAM_SELECTED){
                //         current_selected_program_id = el.program_id;
                //     }
                // });
                
                // if(current_selected_program_id == this.program_id){
                //     location.href = "/trainer/";
                // }else{
                //     layer_popup.close_layer_popup(); // Confirm 팝업 닫기
                //     layer_popup.close_layer_popup(); // 공유 권한 보는 창 닫기
                //     program_list_popup.init();
                // }

                
            }, ()=>{});
        });
        
    }

    send_data(){
        
    }

    upper_right_menu(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_shared_MEMBER_SEARCH, 100, popup_style, null, ()=>{
                    setting_shared_member_search_popup = new shared_member_search('.popup_setting_shared_member_search', 'setting_shared_member_search_popup');
        });
    }
}

class Setting_shared_func{
    static disconnect(data, callback, error_callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/delete_trainer_program_connection/",
            type:'POST',
            data:data,
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

    static read_request(callback, error_callback){
        $.ajax({
            url:"/trainer/get_trainer_program_connection_list/",
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

    static send_accept(data, callback, error_callback){
        // {"class_id":"", "program_connection_check":""}
        $.ajax({
            url:"/trainer/update_trainer_program_connection_info/",
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

    static read(data, callback, error_callback){
        $.ajax({
            url:"/trainer/get_shared_program_data/",
            type:'GET',
            data:data,
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
                        if(error_callback != undefined){
                            error_callback();
                        }
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


