class Setting_supervisor{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_supervisor_toolbox', content:'section_setting_supervisor_content'};
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
        // Setting_supervisor_func.read((data)=>{
            
        // });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_supervisor_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="setting_supervisor_popup.upper_right_menu();">${CImg.plus()}</span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_supervisor .wrapper_top').style.border = 0;
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
        let html = this.dom_row_shared_members();
        return html;
    }

    dom_row_shared_members(){
        let member_name = "한예슬";
        let member_user_id = "yess0135";
        let member_db_id = "00000000000";

        let auth_schedule = `<div class="shared_member_auth">
                                <div class="auth_title">일정</div>
                                <div class="auth_setting">읽기/추가/수정/삭제</div>
                            </div>`;
        let auth_member = `<div class="shared_member_auth">
                                <div class="auth_title">회원</div>
                                <div class="auth_setting">읽기/추가/수정</div>
                            </div>`;
        let auth_lecture = `<div class="shared_member_auth">
                                <div class="auth_title">수업</div>
                                <div class="auth_setting">읽기</div>
                            </div>`;
        let auth_ticket = `<div class="shared_member_auth">
                                <div class="auth_title">수강권</div>
                                <div class="auth_setting">읽기</div>
                            </div>`;
        let auth_statistics = null;

        let html = `<article class="obj_input_box_full" id="shared_member_row_${member_db_id}">
                        <div class="shared_members_auth_name_wrapper">${member_name} ${member_user_id}</div>
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
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_SUPERVISOR_MEMBER_AUTH, 100, POPUP_FROM_RIGHT, null, ()=>{
                setting_supervisor_member_auth_popup = new Setting_supervisor_member_auth('.popup_setting_supervisor_member_auth', external_data);
            });
        });
        
        return html;
    }


    dom_row_toolbox(){
        let title = "관리자 (공유)";
        let description = `<p style="font-size:12px;font-weight:500;margin-top:5px;color:var(--font-sub-normal)">현재 프로그램에 다른 PTERS 강사를 초대합니다.</p>`;
        let html = `
        <div class="setting_supervisor_upper_box" style="">
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
        // if(this.data_sending_now == true){
        //     return false;
        // }else if(this.data_sending_now == false){
        //     this.data_sending_now = true;
        // }
        // let data = {
        //     "setting_member_supervisor_time_available":'00:00-23:59', //예약 가능 시간대
        //     "setting_member_supervisor_prohibition":this.data.stop_supervisor, // 예약 일시 정지
        //     "setting_member_time_duration":this.data.time_for_private_supervisor.value[0], //개인 수업 예약 시간
        //     "setting_member_start_time": this.data.start_time_for_private_supervisor.value[0], //개인 수업 예약 시작 시각

        //     "setting_member_supervisor_date_available":this.data.available_supervisor_date.value[0], //예약 가능 날짜
        //     "setting_member_supervisor_enable_time":this.data.available_supervisor_time.value[0], //예약 가능 시간
        //     "setting_member_supervisor_cancel_time":this.data.available_cancel_time.value[0] //예약 취소 가능 시간

        // };
        
        // Setting_supervisor_func.update(data, ()=>{
        //     this.data_sending_now = false;
        //     this.set_initial_data();
        //     show_error_message('변경 내용이 저장되었습니다.');
        //     // this.render_content();
        // }, ()=>{this.data_sending_now = false;});
    }

    upper_right_menu(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_SUPERVISOR_MEMBER_SEARCH, 100, popup_style, null, ()=>{
                    setting_supervisor_member_search_popup = new Supervisor_member_search('.popup_setting_supervisor_member_search', 'setting_supervisor_member_search_popup');
        });
    }
}

class Setting_supervisor_func{
    static update(data, callback, error_callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_setting_supervisor/",
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


