class Menu {
    constructor (targetHTML, instance){
        this.page_name = "menu";
        this.targetHTML = targetHTML;
        this.instance = instance;
    }

    init (){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;

        this.render();
    }

    render(){
        document.getElementById('menu_display_panel').innerHTML = this.dom_assembly_tool_box();
        document.querySelector('#menu_content_wrap').innerHTML = this.dom_assembly_content();
    }

    //상단을 렌더링
    dom_assembly_tool_box (){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        return component.menu_upper_box;
    }

    //회원 리스트를 렌더링
    dom_assembly_content (){
        if(current_page != this.page_name){
            return false;
        }
        let dom_tag_style = {"font-size":"13px", "color":"#858282", "padding-left":"0", "margin-bottom":"8px"};

        let assembly = this.dom_who_i_am() + 
                       CComponent.dom_tag('운영', dom_tag_style) + 
                        this.dom_menu_program() + 
                        this.dom_menu_calendar() + 
                        this.dom_menu_member() + 
                        this.dom_menu_lecture() +
                        this.dom_menu_ticket() + 
                        this.dom_menu_statistics() + 
                       CComponent.dom_tag('설정', dom_tag_style) + 
                        this.dom_menu_setting_worktime() + 
                        this.dom_menu_setting_autocomplete() +
                        this.dom_menu_setting_reserve() + 
                        this.dom_menu_setting_alarm() + 
                        this.dom_menu_setting_attendmode() + 
                       CComponent.dom_tag('서비스', dom_tag_style) + 
                        this.dom_menu_service_notice() + 
                        this.dom_menu_service_inquiry() + 
                        this.dom_menu_service_help();
          
        return assembly;
    }

    dom_who_i_am(){
        let member_id = null;
        let member_name = "회원명 임시";
        let onclick = `alert('회원 정보로 이동')`;
        let html = `<article class="who_am_i_wrapper" data-member_id="${member_id}" data-name="${member_name}" onclick="${onclick}" style="display:table;width:100%;">
                        <div class="my_data_l" style="display:table-cell;width:38px;vertical-align:middle;">
                            <img src="/static/common/icon/icon_account.png" style="width:100%;">
                        </div>                
                        <div class="my_data_c" style="display:table-cell;width:auto;padding-left:8px;vertical-align:middle;">
                            <div class="my_name" style="font-size:17px;font-weight:500;">${member_name}</div>
                            <div style="font-size:11px;color:#858282">프로필 확인</div>
                        </div>
                    </article>`;
        return html;
    }

    dom_menu_program(){
        let id = 'menu_program';
        let title = '프로그램';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPage("program");
        });
        return html;
    }

    dom_menu_calendar(){
        let id = 'menu_calendar';
        let title = '일정';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
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
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
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
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPage("lecture");
        });
        return html;
    }

    dom_menu_ticket(){
        let id = 'menu_ticket';
        let title = '수강권';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPage("ticket");
        });
        return html;
    }

    dom_menu_statistics(){
        let id = 'menu_statistics';
        let title = '통계';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{

        });
        return html;
    }

    dom_menu_setting_worktime(){
        let id = 'menu_setting_worktime';
        let title = '업무 시간';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{

        });
        return html;
    }

    dom_menu_setting_autocomplete(){
        let id = 'menu_setting_autocomplete';
        let title = '자동 완료';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{

        });
        return html;
    }

    dom_menu_setting_reserve(){
        let id = 'menu_setting_reserve';
        let title = '회원 예약';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{

        });
        return html;
    }

    dom_menu_setting_alarm(){
        let id = 'menu_setting_alarm';
        let title = '알림';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPage("alarm");
        });
        return html;
    }

    dom_menu_setting_attendmode(){
        let id = 'menu_setting_attendmode';
        let title = '출석 체크 (Beta)';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            sideGoPage("attend_mode");
        });
        return html;
    }

    dom_menu_service_notice(){
        let id = 'menu_service_notice';
        let title = '공지사항';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{

        });
        return html;
    }

    dom_menu_service_inquiry(){
        let id = 'menu_service_inquiry';
        let title = '이용 문의';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{

        });
        return html;
    }

    dom_menu_service_help(){
        let id = 'menu_service_help';
        let title = '도움말';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"font-size":"17px", "padding":"13px 0"};
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{

        });
        return html;
    }



    static_component (){
        return(
            {
                menu_upper_box:`   <div class="menu_upper_box">
                                        <div style="display:inline-block;width:200px;">
                                            <span style="font-size:23px;font-weight:bold;color:#3b3b3b">전체</span>
                                        </div>
                                    </div>
                                        `
                ,
                initial_page:`<div id="menu_display_panel"></div><div id="menu_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px; padding:8px 16px 20px 16px;box-sizing:border-box"></div>`
            }
        );
    }
}


class old_Menu{
    constructor(targetHTML, instance){
        this.page_name = 'menu';
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.menu_items = { 
            program: {visible: true, name:"프로그램"},   
            alarm: {visible: true, name:"알림"}, 
            ticket: {visible: true, name:"수강권"},
            lecture: {visible: true, name:"수업"},
            attend_mode: {visible: true, name:"출석체크 모드"},
            statistics: {visible: true, name:"통계"},
            settings: {visible: true, name:"설정"},
            pters_pass: {visible: true, name:"PTERS 패스"},
            store: {visible: true, name:"스토어"},
            notice: {visible: true, name:"PTERS 공지"}
        };

        this.user_options = {store: {visible :false}, notice: {visible :false}};
    }

    init(){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;
        this.render_upper_box();
        this.render_menu();
        setTimeout(()=>{$root_content.scrollTop(0);}, 50) 
    }

    render_upper_box(){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.getElementById('menu_display_panel').innerHTML = component.menu_upper_box;
    }

    render_menu(options){
        if(options != undefined){
            for(let item in options){
                this.menu_items[item].visible= options[item].visible;
            }
        }

        let html_temp = [];
        for(let el in this.menu_items){
            let item_el = this.menu_items[el];
            if(item_el.visible == false){
                continue;
            }

            html_temp.push(`<div class="menu_element_wrap" onclick="sideGoPage('${el}', this)">
                                <img src="/static/common/icon/icon_more.png">
                                <span>${item_el.name}</span>
                            </div>`)
        }
        
        document.querySelector('#menu_content_wrap').innerHTML = html_temp.join("");
    }


    static_component(){
        return(
            {   "menu_upper_box":`<div class="menu_upper_box">
                                    <div style="display:inline-block;width:200px;">
                                        <span style="font-size:20px;font-weight:bold;">전체</span>
                                    </div>
                                </div>
                                `
                ,
                "initial_page":`<div id="menu_display_panel"></div><div id="menu_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div>`
            }
        );
    }
}