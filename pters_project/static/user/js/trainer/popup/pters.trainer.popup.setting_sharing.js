class Setting_sharing{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_sharing_toolbox', content:'section_setting_sharing_content'};
        this.data_sending_now = false;

        this.data = {
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_sharing_func.read((data)=>{
            this.data = data;
            console.log("data", data);
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_sharing_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="setting_sharing_popup.upper_right_menu();">${CImg.plus()}</span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_sharing .wrapper_top').style.border = 0;
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
        let html_to_join = [];
        for(let user in this.data){
            html_to_join.push(
                this.dom_row_shared_members(this.data[user])
            );
        }
        let html = html_to_join.join("");

        return html;
    }

    dom_row_shared_members(indiv_auth_data){
        let member_name = indiv_auth_data.member_info.member_name;
        let member_user_id = indiv_auth_data.member_info.member_user_id;
        let member_db_id = indiv_auth_data.member_info.member_id;
        let share_status = indiv_auth_data.member_info.auth_cd;

        let auth_plan_create = indiv_auth_data.auth_plan_create == 1 ? "등록" : null;
        let auth_plan_read = indiv_auth_data.auth_plan_read == 1 ? "조회" :  null;
        let auth_plan_update = indiv_auth_data.auth_plan_update == 1 ? "수정" :  null;
        let auth_plan_delete = indiv_auth_data.auth_plan_delete == 1 ? "삭제" :  null;

        let auth_member_create = indiv_auth_data.auth_member_create == 1 ? "등록" :  null;
        let auth_member_read = indiv_auth_data.auth_member_read == 1 ? "조회" :  null;
        let auth_member_update = indiv_auth_data.auth_member_update == 1 ? "수정" :  null;
        let auth_member_delete = indiv_auth_data.auth_member_delete == 1 ? "삭제" :  null;

        let auth_lecture_create = indiv_auth_data.auth_group_create == 1 ? "등록" :  null;
        let auth_lecture_read = indiv_auth_data.auth_group_read == 1 ? "조회" :  null;
        let auth_lecture_update = indiv_auth_data.auth_group_update == 1 ? "수정" :  null;
        let auth_lecture_delete = indiv_auth_data.auth_group_delete == 1 ? "삭제" :  null;

        let auth_ticket_create = indiv_auth_data.auth_package_create == 1 ? "등록" :  null;
        let auth_ticket_read = indiv_auth_data.auth_package_read == 1 ? "조회" :  null;
        let auth_ticket_update = indiv_auth_data.auth_package_update == 1 ? "수정" :  null;
        let auth_ticket_delete = indiv_auth_data.auth_package_delete == 1 ? "삭제" :  null;

        let auth_statistics_read = indiv_auth_data.auth_analytics_read == 1 ? "조회" :  null;

        let auth_setting_read = indiv_auth_data.auth_setting_read == 1 ? "조회" :  null;
        let auth_setting_update = indiv_auth_data.auth_setting_update == 1 ? "수정" :  null;

        let schedule_auth = [auth_plan_create, auth_plan_read, auth_plan_update, auth_plan_delete].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
        let member_auth = [auth_member_create, auth_member_read, auth_member_update, auth_member_delete].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
        let lecture_auth = [auth_lecture_create, auth_lecture_read, auth_lecture_update, auth_lecture_delete].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
        let ticket_auth = [auth_ticket_create, auth_ticket_read, auth_ticket_update, auth_ticket_delete].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
        let statistics_auth = [auth_statistics_read].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
        let setting_auth = [auth_setting_read, auth_setting_update].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});

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
        let auth_setting = `<div class="shared_member_auth" style="${setting_auth.length == 0 ? "display:none" : ""}">
                                <div class="auth_title">설정</div>
                                <div class="auth_setting">
                                    ${setting_auth.join("/")}
                                </div>
                            </div>`;

        let html = `<article class="obj_input_box_full" id="shared_member_row_${member_db_id}">
                        <div class="shared_members_auth_name_wrapper">
                            ${member_name} (${member_user_id})
                            <span style="float:right;font-size:13px;">${AUTH_TYPE_TEXT[share_status]}</span>
                        </div>
                        <div class="shared_members_auth_wrapper">
                            ${auth_schedule == null ? "" : auth_schedule}
                            ${auth_member == null ? "" : auth_member}
                            ${auth_lecture == null ? "" : auth_lecture}
                            ${auth_ticket == null ? "" : auth_ticket}
                            ${auth_statistics == null ? "" : auth_statistics}
                            ${auth_setting == null ? "" : auth_setting}
                        </div>                 
                    </article>`;

        $(document).off('click', `#shared_member_row_${member_db_id}`).on('click', `#shared_member_row_${member_db_id}`, ()=>{
            let external_data = {"db_id":member_db_id, "member_name":member_name, "shared_status": AUTH_TYPE_VIEW};
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_SHARING_MEMBER_AUTH, 100, POPUP_FROM_RIGHT, null, ()=>{
                setting_sharing_member_auth_popup = new Setting_sharing_member_auth('.popup_setting_sharing_member_auth', external_data);
            });
        });
        
        return html;
    }


    dom_row_toolbox(){
        let title = "공유 하기";
        let description = `<p style="font-size:12px;font-weight:500;margin-top:5px;color:var(--font-sub-normal)">현재 프로그램에 다른 PTERS 강사를 초대합니다.</p>`;
        let html = `
        <div class="setting_sharing_upper_box" style="">
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

    }

    upper_right_menu(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_SHARING_MEMBER_SEARCH, 100, popup_style, null, ()=>{
                    setting_sharing_member_search_popup = new Setting_sharing_member_search('.popup_setting_sharing_member_search', 'setting_sharing_member_search_popup');
        });
    }
}

class Setting_sharing_func{
    static update(data, callback, error_callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_setting_sharing/",
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


