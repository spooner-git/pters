class Setting_shared{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_shared_toolbox', content:'section_setting_shared_content'};
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
        // Setting_shared_func.read((data)=>{
        //     console.log("asdf",data);
        //     this.data = data;
        // });
        
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_shared_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="setting_shared_popup.upper_right_menu();">${CImg.plus()}</span>`;
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

        let schedule_auth = [auth_plan_create, auth_plan_read, auth_plan_update, auth_plan_delete];
        let member_auth = [auth_member_create, auth_member_read, auth_member_update, auth_member_delete];
        let lecture_auth = [auth_lecture_create, auth_lecture_read, auth_lecture_update, auth_lecture_delete];
        let ticket_auth = [auth_ticket_create, auth_ticket_read, auth_ticket_update, auth_ticket_delete];
        let statistics_auth = [auth_statistics_read];

        let auth_schedule = `<div class="shared_member_auth">
                                <div class="auth_title">일정</div>
                                <div class="auth_setting">
                                    ${schedule_auth.filter((el)=>{ if(el == null){return false} return true }).map((el)=>{return el}).join("/")}
                                </div>
                            </div>`;
        let auth_member = `<div class="shared_member_auth">
                                <div class="auth_title">회원</div>
                                <div class="auth_setting">
                                    ${member_auth.filter((el)=>{ if(el == null){return false} return true }).map((el)=>{return el}).join("/")}
                                </div>
                            </div>`;
        let auth_lecture = `<div class="shared_member_auth">
                                <div class="auth_title">수업</div>
                                <div class="auth_setting">
                                    ${lecture_auth.filter((el)=>{ if(el == null){return false} return true }).map((el)=>{return el}).join("/")}
                                </div>
                            </div>`;
        let auth_ticket = `<div class="shared_member_auth">
                                <div class="auth_title">수강권</div>
                                <div class="auth_setting">
                                    ${ticket_auth.filter((el)=>{ if(el == null){return false} return true }).map((el)=>{return el}).join("/")}
                                </div>
                            </div>`;
        let auth_statistics = `<div class="shared_member_auth">
                                <div class="auth_title">통계</div>
                                <div class="auth_setting">
                                    ${statistics_auth.join("/")}
                                </div>
                            </div>`;

        let html = `<article class="obj_input_box_full" id="shared_member_row_${member_db_id}">
                        <div class="shared_members_auth_name_wrapper">${member_name} (${member_user_id})</div>
                        <div class="shared_members_auth_wrapper">
                            ${auth_schedule == null ? "" : auth_schedule}
                            ${auth_member == null ? "" : auth_member}
                            ${auth_lecture == null ? "" : auth_lecture}
                            ${auth_ticket == null ? "" : auth_ticket}
                            ${auth_statistics == null ? "" : auth_statistics}
                        </div>                 
                    </article>`;

        $(document).off('click', `#shared_member_row_${member_db_id}`).on('click', `#shared_member_row_${member_db_id}`, ()=>{
            let external_data = {"db_id":member_db_id, "member_name":member_name, "shared_status": AUTH_TYPE_VIEW};
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_shared_MEMBER_AUTH, 100, POPUP_FROM_RIGHT, null, ()=>{
                setting_shared_member_auth_popup = new Setting_shared_member_auth('.popup_setting_shared_member_auth', external_data);
            });
        });
        
        return html;
    }


    dom_row_toolbox(){
        let title = "공유 - 받은 권한";
        let description = `<p style="font-size:12px;font-weight:500;margin-top:5px;color:var(--font-sub-normal)">공유자가 설정한 현재 프로그램의 내 권한입니다.</p>`;
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
    static update(data, callback, error_callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_setting_shared/",
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


