class Menu {
    constructor (targetHTML, instance){
        this.page_name = "menu";
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.data = {
            name:null,
            photo:null
        };
    }

    init (){
        if(current_page_text != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;
        this.render();
        this.set_initial_data();
    }


    set_initial_data(){
        Mypage_func.read((data)=>{
            this.data.name = data.trainer_info.member_name;
            this.data.photo = data.trainer_info.member_profile_url;
            this.render_content();
        });
    }

    render(){
        document.getElementById('menu_display_panel').innerHTML = this.dom_assembly_tool_box();
        document.querySelector('#menu_content_wrap').innerHTML = this.dom_assembly_content();
        $root_content.scrollTop(1);
    }

    render_toolbox(){
        document.getElementById('menu_display_panel').innerHTML = this.dom_assembly_tool_box();
    }

    render_content(){
        document.querySelector('#menu_content_wrap').innerHTML = this.dom_assembly_content();
    }

    //상단을 렌더링
    dom_assembly_tool_box (){
        if(current_page_text != this.page_name){
            return false;
        }

        let component = this.static_component();
        return component.menu_upper_box;
    }

    //회원 리스트를 렌더링
    dom_assembly_content (){
        if(current_page_text != this.page_name){
            return false;
        }

        let dom_tag_style = {"font-size":"13px", "color":"var(--font-sub-normal)", "padding-left":"0", "margin-bottom":"8px"};

        let share = shared_program_flag == 0 ? this.dom_menu_setting_sharing() : this.dom_menu_setting_shared();

        let assembly = this.dom_who_i_am() + 
                       CComponent.dom_tag('운영', dom_tag_style) + 
                        this.dom_menu_program() + 
                        this.dom_menu_calendar() + 
                        this.dom_menu_member() + 
                        this.dom_menu_lecture() +
                        this.dom_menu_ticket() + 
                        this.dom_menu_statistics() + 
                        this.dom_menu_attendmode() + 
                       CComponent.dom_tag('설정', dom_tag_style) +
                        share + 
                        this.dom_menu_setting_calendar() + 
                        this.dom_menu_setting_worktime() + 
                        this.dom_menu_setting_autocomplete() +
                        this.dom_menu_setting_reserve() + 
                        this.dom_menu_setting_alarm() + 
                        this.dom_menu_setting_attendmode() +
                        this.dom_menu_setting_menu_access() +
                        this.dom_menu_theme() +
                       CComponent.dom_tag('서비스', dom_tag_style) + 
                        this.dom_menu_pters_pass() + 
                        this.dom_menu_service_notice() + 
                        this.dom_menu_service_faq() +
                        this.dom_menu_service_inquiry() +
                        this.dom_menu_service_about_us();
                        // + this.dom_menu_service_help();
          
        return assembly;
    }

    dom_who_i_am(){
        let member_id = null;
        let member_name = this.data.name == null ? "" : this.data.name;
        let onclick = `${this.instance}.go_to_profile()`;
        let html = `<article class="who_am_i_wrapper" data-member_id="${member_id}" data-name="${member_name}" onclick="${onclick}" style="display:table;width:100%;">
                        <div class="my_data_l" style="display:table-cell;width:38px;vertical-align:middle;">
                            <img src=${this.data.photo == null ? '/static/common/icon/icon_account.png' : this.data.photo} style="width:100%;border-radius:50%;">
                        </div>                
                        <div class="my_data_c" style="display:table-cell;width:auto;padding-left:8px;vertical-align:middle;">
                            <div class="my_name" style="font-size:17px;font-weight:500;">${member_name}</div>
                            <div style="font-size:11px;color:var(--font-sub-normal)">프로필 확인</div>
                        </div>
                    </article>`;
        return html;
    }

    go_to_profile(){
        sideGoPopup("mypage");
        // let popup_style = $root_content.width() > 650 ? POPUP_FROM_TOP : POPUP_FROM_RIGHT;
        // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MYPAGE, 100, popup_style, null, ()=>{mypage_popup = new Mypage('.popup_mypage');});
    }

    dom_menu_program(){
        let id = 'menu_program';
        let title = '프로그램';
        let icon = CImg.program();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("program");
        });
        return html;
    }

    dom_menu_calendar(){
        let id = 'menu_calendar';
        let title = '일정';
        let icon = CImg.calendar();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPage("calendar");
        });
        return html;
    }
    
    dom_menu_member(){
        let id = 'menu_member';
        let title = '회원';
        let icon = CImg.member();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPage("member");
        });
        return html;
    }

    dom_menu_lecture(){
        let id = 'menu_lecture';
        let title = '수업';
        let icon = CImg.lecture();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("lecture");
        });
        return html;
    }

    dom_menu_ticket(){
        let id = 'menu_ticket';
        let title = '수강권';
        let icon = CImg.ticket();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("ticket");
        });
        return html;
    }

    dom_menu_statistics(){
        let id = 'menu_statistics';
        let title = '통계';
        let icon = CImg.statistics();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("statistics");
        });
        return html;
    }

    dom_menu_attendmode(){
        let id = 'menu_attendmode';
        let title = '출석 체크';
        let icon = CImg.attend_check();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPage("attend_mode");
        });
        return html;
    }

    dom_menu_setting_calendar(){
        let id = 'menu_setting_calendar';
        let title = '일정 설정';
        let icon = CImg.setting_calendar();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("setting_calendar");
        });
        return html;
    }

    dom_menu_setting_worktime(){
        let id = 'menu_setting_worktime';
        let title = '업무 시간';
        let icon = CImg.setting_work_time();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("setting_worktime");
        });
        return html;
    }

    dom_menu_setting_autocomplete(){
        let id = 'menu_setting_autocomplete';
        let title = '자동 완료';
        let icon = CImg.setting_autocomplete();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("setting_autocomplete");
        });
        return html;
    }

    dom_menu_setting_reserve(){
        let id = 'menu_setting_reserve';
        let title = '회원 예약';
        let icon = CImg.setting_reserve();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("setting_reserve");
        });
        return html;
    }

    dom_menu_setting_alarm(){
        let id = 'menu_setting_alarm';
        let title = '알림';
        let icon = CImg.setting_notification();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("setting_alarm");
        });
        return html;
    }

    dom_menu_setting_attendmode(){
        let id = 'menu_setting_attendmode';
        let title = '출석 체크 모드 설정';
        let icon = CImg.setting_attend_check();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("setting_attendmode");
        });
        return html;
    }

    dom_menu_theme(){
        let id = 'menu_setting_theme';
        let title = '테마';
        let icon = CImg.arrow_expand();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("setting_theme");
        });
        return html;
    }

    dom_menu_setting_menu_access(){
        let id = 'menu_setting_menu_access';
        let title = '정보 보호';
        let icon = CImg.lock();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("setting_menu_access");
        });
        return html;
    }

    dom_menu_setting_sharing(){
        let id = 'menu_setting_sharing';
        let title = '프로그램 공유';
        let icon = CImg.share();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"color":"red", "font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("setting_sharing");
        });
        return html;
    }

    dom_menu_setting_shared(){
        let id = 'menu_setting_shared';
        let title = '프로그램 공유';
        let icon = CImg.share();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"color":"red", "font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup("setting_shared");
        });
        return html;
    }

    dom_menu_pters_pass(){
        let id = 'menu_pters_pass';
        let title = 'PTERS 패스 구매';
        let icon = CImg.ticket(["var(--img-highlight)"]);
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup('pters_pass_main');
        });
        return html;
    }

    dom_menu_service_notice(){
        let id = 'menu_service_notice';
        let title = '공지사항';
        let icon = CImg.notice();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup('service_notice');
        });
        return html;
    }

    dom_menu_service_inquiry(){
        let id = 'menu_service_inquiry_menu';
        let title = '이용 문의';
        let icon = CImg.inquiry();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup('service_inquiry_menu');
        });
        return html;
    }

    dom_menu_service_faq(){
        let id = 'menu_service_faq_menu';
        let title = '사용법 & 자주묻는 질문';
        let icon = CImg.inquiry();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SERVICE_INQUIRY_FAQ, 100, popup_style, null, ()=>{
                service_inquiry_faq_popup = new Service_inquiry_faq('.popup_service_inquiry_faq');});
        });
        return html;
    }

    dom_menu_service_help(){
        let id = 'menu_service_help';
        let title = '도움말';
        let icon = CImg.help();
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup('helper');
        });
        return html;
    }

    dom_menu_service_about_us(){
        let id = 'menu_about_us';
        let title = 'About us';
        let icon = NONE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPopup('service_about_us');
        });
        return html;
    }
    
    static_component (){
        return(
            {
                menu_upper_box:`   <div class="menu_upper_box">
                                        <div style="display:inline-block;width:200px;">
                                            <span style="font-size:23px;font-weight:bold;color:var(--font-main)">전체</span>
                                        </div>
                                    </div>
                                        `
                ,
                initial_page:`<div id="menu_display_panel"></div><div id="menu_content_wrap" class="pages"></div>`
            }
        );
    }
}


class Setting_func{
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