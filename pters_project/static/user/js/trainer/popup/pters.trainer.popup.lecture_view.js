class Lecture_view{
    constructor(install_target, lecture_id, instance){
        this.target = {install: install_target, toolbox:'section_lecture_view_toolbox', content:'section_lecture_view_content'};
        this.instance = instance;
        this.lecture_id = lecture_id;
        this.form_id = 'id_lecture_view_form';

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
                name:null,
                lecture_minute:null,
                capacity:null,
                member_number:null,
                member:[],
                fixed_member_id:[],
                fixed_member_name:[],
                fixed_member_id_original:[],
                color_bg:[],
                color_font:[],
                color_name:[],
                reg_date:null,
                mod_date:null,
                ticket_id:[],
                ticket_name:[],
                ticket_state:[],
                memo:null,
                lecture_state:null,
                lecture_type_cd:null,
                active_ticket_length:null,
                update_this_to_all_plans:null
        };

        this.init();

    }

    set name(text){
        this.data.name = text;
        this.render_content();
    }

    get name(){
        return this.data.name;
    }

    set lecture_minute(text){
        this.data.lecture_minute = text;
        this.render_content();
    }

    get lecture_minute(){
        return this.data.lecture_minute;
    }

    set capacity(number){
        this.data.capacity = number;
        this.render_content();
    }

    get capacity(){
        return this.data.capacity;
    }

    set member(data){
        this.data.fixed_member_id = data.id;
        this.data.fixed_member_name = data.name;
        this.render_content();
    }

    get member(){
        return {id:this.data.fixed_member_id, name:this.data.fixed_member_name};
    }

    set lecture_type_cd(type_cd){
        this.data.lecture_type_cd = type_cd;
        this.render_content();
    }

    get lecture_type_cd(){
        return this.data.lecture_type_cd;
    }

    set color(data){
        this.data.color_bg = data.bg;
        this.data.color_font = data.font;
        this.data.color_name = data.name;
        this.render_content();
    }

    get color(){
        return {bg:this.data.color_bg, font:this.data.color_font, name:this.data.color_name};
    }

 
    init(){
        this.set_initial_data();
    }

    set_initial_data (){
        Lecture_func.read({"lecture_id": this.lecture_id}, (data)=>{
            this.data.name = data.lecture_name;
            this.data.lecture_minute = data.lecture_minute; // lecture_minute 여기
            this.data.capacity = data.lecture_max_num;
            this.data.member_number = data.lecture_ing_member_num;
            this.data.member = data.lecture_member_list;
            this.data.fixed_member_id = data.lecture_member_list.filter((el)=>{return el.member_fix_state_cd == FIX ? true : false;}).map((el)=>{return el.member_id;});
            this.data.fixed_member_id_original = this.data.fixed_member_id.slice(); //나중에 비교를 위해서 복사
            this.data.fixed_member_name = data.lecture_member_list.filter((el)=>{return el.member_fix_state_cd == FIX ? true : false;}).map((el)=>{return el.member_name;});
            this.data.color_bg = [data.lecture_ing_color_cd];
            this.data.color_font = [data.lecture_ing_font_color_cd];
            this.data.reg_date = DateRobot.to_text(data.lecture_reg_dt.split(' ')[0]);
            this.data.mod_date = DateRobot.to_text(data.lecture_mod_dt.split(' ')[0]);
            this.data.ticket_id = data.lecture_ticket_id_list;
            this.data.ticket_name = data.lecture_ticket_list;
            this.data.ticket_state = data.lecture_ticket_state_cd_list;
            this.data.lecture_type_cd = data.lecture_type_cd;
            this.data.memo = data.lecture_note;

            this.data.lecture_state = data.lecture_state_cd;

            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
            // this.init();
        });   
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();lecture_view_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" ${this.data.capacity == 1 && this.data.lecture_type_cd == LECTURE_TYPE_ONE_TO_ONE ? 'style="display:none"' : '' } onclick="lecture_view_popup.upper_right_menu();">${CImg.more()}</span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_lecture_view .wrapper_top').style.border = 0;
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
        let time = this.dom_row_lecture_minute_input(); //수업 진행시간
        // let name = this.dom_row_lecture_name_input();
        let capacity = this.dom_row_capacity_view();
        let color = this.dom_row_color_view();
        let ticket_list = this.dom_row_ticket_list();
        let member_list = this.dom_row_member_list();

        let capacity_assembly = '<div class="obj_input_box_full">' + CComponent.dom_tag('정원') + capacity + '</div>';
        let lecture_lecture_minute = '<div class="obj_input_box_full">' + CComponent.dom_tag('기본 수업 시간') + time + '</div>';
        let color_select_assembly =  '<div class="obj_input_box_full">' + CComponent.dom_tag('색상 태그') + color +  '</div>';
        let ticket_list_assembly = '<div class="obj_input_box_full" style="padding-top:16px;">' + CComponent.dom_tag(`이 수업을 포함하는 수강권 (${this.data.active_ticket_length} 개)`,
                                    {"font-size":"13px", "font-weight":"bold", "letter-spacing":"-0.6px", "padding":"0","padding-bottom":"8px", "color":"#858282", "height":"20px"})
                                    + ticket_list + '</div>';
        let member_list_assembly = '<div class="obj_input_box_full" style="padding-top:20px; border:0;">' + CComponent.dom_tag(`진행중 회원 (${this.data.member_number} 명)`,
        {"font-size":"13px", "font-weight":"bold", "letter-spacing":"-0.6px", "padding":"0","padding-bottom":"8px", "color":"#858282", "height":"20px"})
        + member_list + '</div>';

        if(this.data.lecture_state == STATE_END_PROGRESS){
            ticket_list_assembly = "";
            member_list_assembly = "";
        }

        let html =  capacity_assembly +
                    lecture_lecture_minute +
                    color_select_assembly +
                    ticket_list_assembly +
                    member_list_assembly;

        return html;
    }

    dom_row_toolbox(){
        
        let id = 'lecture_name_view';
        let title = this.data.name == null ? '' : this.data.name;
        let style = {"font-size":"20px", "font-weight":"bold"};
        if(this.data.lecture_state == STATE_END_PROGRESS){
            style["color"] = "#888888";
        }
        let placeholder =  '수업명*';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:()\\[\\]\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "+ - _ :()[] 제외 특수문자는 입력 불가";
        let required = "required";
        let sub_html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
            this.send_data();
        }, pattern, pattern_message, required);
        let one_to_one_lesson_description = this.data.capacity == 1 && this.data.lecture_type_cd == LECTURE_TYPE_ONE_TO_ONE ? "<div style='font-size:11px;color:#888888;'>이 수업은 정원 수정, 비활성화 할 수 없습니다.</div>" : "";
        let html = `
        <div class="lecture_view_upper_box">
            <div style="display:inline-block;width:100%;">
                <span style="position:absolute;top:0;font-size: 12px;display:block;color: #7d7d7d;font-weight: 500;">수업</span>
                ${sub_html}
                ${one_to_one_lesson_description}
            </div>
            <span style="display:none;">${title}</span>
        </div>
        `;
        return html;
    }

    dom_row_capacity_view(){
        let unit = '명';
        let id = 'lecture_capacity_view';
        let title = this.data.capacity == null ? '' : this.data.capacity+unit;
        let placeholder = '정원*';
        let icon = CImg.members();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = true;
        let pattern = "[0-9]{0,4}";
        let pattern_message = "";
        let required = "";

        if(this.data.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE){ //그룹수업이라면
            icon_r_text = CComponent.text_button ('lecture_fixed_member_select', `고정 회원(${this.data.fixed_member_id.length})`, null, ()=>{
                //고정 인원 선택
                if(this.data.capacity != null){
                    let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, popup_style, null, ()=>{
                        member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.capacity, {'lecture_id':this.lecture_id, "title":"고정 회원 선택"}, (set_data)=>{
                            this.member = set_data;
                            this.send_data();
                        });
                    });
                }else{
                    show_error_message('정원을 먼저 입력해주세요.');
                }
            });
            disabled = false;
            required = "required";
            icon_r_visible = SHOW;
        }
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            let user_input_data = input_data;
            if(user_input_data == null){
                user_input_data = this.data.capacity;
            }
            if(user_input_data < this.data.fixed_member_id.length){
                show_error_message("수정하려는 정원보다 고정회원 수가 더 많습니다.");
                this.render_content();
                return;
            }
            this.capacity = user_input_data;
            setTimeout(()=>{
                this.dom_row_option_select_capacity();
            }, 250);
            //안드로이드 키보드가 올라오면서 옵션셀렉터 위치가 상단으로 밀리리 때문에, 키보드가 사라질때 까지 기다렸다가 실행한다.
            
            // this.send_data();
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_option_select_capacity(){
        let user_option = {
            stay:{text:"지난 일정은 변경하지 않음", callback:()=>{this.update_this_to_all_plans = OFF;layer_popup.close_layer_popup();this.send_data();layer_popup.enable_shade_click_close(); }},
            change:{text:"모두 변경", callback:()=>{this.update_this_to_all_plans = ON;layer_popup.close_layer_popup();this.send_data();layer_popup.enable_shade_click_close(); }},
            cancel:{text:"변경 취소", callback:()=>{layer_popup.close_layer_popup();this.init();layer_popup.enable_shade_click_close();}}
        };
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        // let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let layer_popup_height = options_padding_top_bottom + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            layer_popup.disable_shade_click_close();
        });
    }


    dom_row_lecture_minute_input(){
        let id = "lecture_minute_input";
        let title = this.data.lecture_minute == null ? "" : this.data.lecture_minute+'분';
        let placeholder = "5분 단위로 입력";
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let onfocusout = (user_input_data)=>{
            if(Number(user_input_data)%5 != 0){
                show_error_message("기본 수업 시간은 5분 단위로 입력해주세요.");
                this.render_content();
                return false;
            }
            if(Number(user_input_data) <= 0){
                show_error_message("기본 수업 시간은 0분 보다 크게 설정해주세요.");
                this.render_content();
                return false;
            }
            this.data.lecture_minute = user_input_data;
            this.send_data();
        };
        let pattern = "[0-9]{0,4}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, onfocusout, pattern, pattern_message, required);
        return html;
    }

    dom_row_color_view(){
        let id = 'color_select_view';
        let title = this.data.color_bg.length == 0 ? '색상 태그' : `<span style="background-color:${this.data.color_bg};color:${this.data.color_font};padding:5px;border-radius:4px;">${COLOR_NAME_CODE[this.data.color_bg]}</span>`;
        let icon = NONE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_COLOR_SELECT, 100, popup_style, null, ()=>{
                color_select = new ColorSelector('#wrapper_box_color_select', this, 1, (set_data)=>{
                    this.color = set_data;
                    this.dom_row_option_select_capacity();
                    // this.send_data();
                });
            });
        });
        return html;
    }

    dom_row_reg_mod_date(){
        let icon_button_style = {"display":"block", "padding":0, "font-size":"12px"};
        let html1 = CComponent.icon_button('reg_date_view', `등록 ${this.data.reg_date}`, NONE, icon_button_style, ()=>{});
        // let html2 = CComponent.icon_button('mod_date', `수정 ${this.data.ticket_mod_dt}`, NONE, icon_button_style, ()=>{});
        let html = html1;
        return html;
    }

    dom_row_ticket(){
        let id = 'ticket_number_view';
        let title = this.data.ticket_id.length == 0 ? '0 개' : this.data.ticket_id.length+' 개';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{});
        return html;
    }

    dom_row_ticket_list (){
        let length = this.data.ticket_id.length;
        let html_to_join = [];
        let progress_end_ticket = 0;
        for(let i=0; i<length; i++){
            let ticket_id = this.data.ticket_id[i];
            let ticket_name = this.data.ticket_name[i];
            let ticket_state = this.data.ticket_state[i];
            let style = {"display":"block", "font-size":"15px", "font-weight":"500",  "padding":"0", "height":"44px", "line-height":"44px", "letter-spacing":"-0.7px", "overflow":"hidden", "text-overflow":"ellipsis", "white-space":"nowrap"};
            if(ticket_state == STATE_END_PROGRESS){
                progress_end_ticket++;
                style["text-decoration"] = "line-through";
                style["color"] = "#cccccc";
                ticket_name += "(비활성)";
            }
            html_to_join.push(
                CComponent.text_button(ticket_id, ticket_name, style, ()=>{
                    let root_content_height = $root_content.height();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_SIMPLE_VIEW, 100*(251/root_content_height), POPUP_FROM_BOTTOM, {'ticket_id':ticket_id}, ()=>{
                        ticket_simple_view_popup = new Ticket_simple_view('.popup_ticket_simple_view', ticket_id, 'ticket_simple_view_popup');
                        //수강권 간단 정보 팝업 열기
                    });
                })
            );
        }
        this.data.active_ticket_length = length - progress_end_ticket;

        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    dom_row_member(){
        let id = 'select_member';
        let title = this.data.member_number == null ? '진행중 회원 (0 명)' : '진행중 회원 (' + this.data.member_number+' 명)';
        let icon = NONE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            //고정 인원 선택
            if(this.data.capacity != null){
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, popup_style, null, ()=>{
                    member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.capacity, {'lecture_id':this.lecture_id}, (set_data)=>{
                        this.member = set_data;
                        this.send_data();
                    });
                });
            }else{
                show_error_message('정원을 먼저 입력해주세요.');
            }
        });
        return html;
    }

    dom_row_member_list (){
        let length = this.data.member.length;
        let html_to_join = [];
        let root_content_height = $root_content.height();
        for(let i=0; i<length; i++){
            let member_id = this.data.member[i].member_id;
            let member_name = this.data.member[i].member_name;
            let member_fix = this.data.member[i].member_fix_state_cd;
            let member_profile_url = this.data.member[i].member_profile_url;
            let style = {"font-size":"15px", "font-weight":"500", "padding":"0", "height":"44px", "line-height":"44px","color":"", "letter-spacing":"-0.7px", "display":"table-cell", "width":"auto", "vertical-align":"middle"};
            let member_fix_indicator = "";
            if(member_fix == FIX){
                member_fix_indicator = '<span style="display:table-cell;width:50px;font-size:11px;font-weight:bold;color:#fe4e65;vertical-align:middle;">고정 회원</span>';
            }
            let member_button = CComponent.text_button (member_id, member_name, style);

            let member_img = '<div style="display: table-cell; width:40px; vertical-align:bottom;"><img src="'+member_profile_url+'" style="width:30px; height:30px; border-radius: 50%;"></div>';
            html_to_join.push(
                `<div style="display:table;width:100%;" onclick="
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SIMPLE_VIEW, 100*(400/${root_content_height}), POPUP_FROM_BOTTOM, {'member_id':${member_id}},()=>{
                            member_simple_view_popup = new Member_simple_view('.popup_member_simple_view', ${member_id}, 'member_simple_view_popup');
                            //회원 간단 정보 팝업 열기
                    });">
                    ${member_img}
                    <div style="display: table-cell; width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${member_button}</div>
                    <div style="display: table-cell; line-height: 44px; float:right;">${member_fix_indicator}</div>
                 </div>`
            );
        }
        let html = `${html_to_join.join('')}`;

        return html;
    }

    send_data(){
        if(this.check_before_send() == false){
            return false;
        }
        let data = {
            "lecture_id":this.lecture_id,
            "lecture_minute":this.data.lecture_minute,
            "name":this.data.name,
            "member_num":this.data.capacity,
            "ing_color_cd":this.data.color_bg[0],
            "end_color_cd":"",
            "ing_font_color_cd":this.data.color_font[0],
            "end_font_color_cd":"",
            "update_this_to_all_plans":this.update_this_to_all_plans
        };

        Lecture_func.update(data, ()=>{
            let fixed_unfixed_members = this.func_update_fixed_member();
            let data = {"lecture_id":this.lecture_id, "member_ids[]":fixed_unfixed_members};
            Lecture_func.update_fixed_member(data); //async false 함수

            this.set_initial_data();
            try{
                current_page.init();
            }catch(e){}
            try{
                lecture_list_popup.init();
            }catch(e){}
        });
    }

    upper_right_menu(){
        let user_option = {
            activate:{text:"활성화", callback:()=>{
                    show_user_confirm(`"${this.data.name}" <br> 수업을 활성화 하시겠습니까? <br> 활성화 탭에서 다시 확인할 수 있습니다.`, ()=>{
                        let inspect = pass_inspector.lecture();
                        if(inspect.barrier == BLOCKED){
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            show_error_message(`[${inspect.limit_type}] 이용자께서는 진행중 수업을 최대 ${inspect.limit_num}개까지 등록하실 수 있습니다. 
                                                <br> 수업 활성화에 실패했습니다.`);
                            return false;
                        }
                        
                        Lecture_func.status({"lecture_id":this.lecture_id, "state_cd":STATE_IN_PROGRESS}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                lecture_list_popup.init();
                            }catch(e){}
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            layer_popup.close_layer_popup(); //option 팝업 닫기
                            layer_popup.close_layer_popup(); //수업 정보 팝업 닫기
                        });
                        
                    });
                }   
            },
            deactivate:{text:"비활성화", callback:()=>{
                    show_user_confirm(`"${this.data.name}" <br> 수업을 비활성화 하시겠습니까? <br> 비활성화 탭에서 다시 활성화 할 수 있습니다.<br><br>
                                                            <img src="/static/common/icon/icon_stopmark.png" style="width:25px;"><br>
                                                            <span style="color:#fe4e65; font-size:12px;">
                                                            이 수업으로 일정을 등록 할 수 없게 됩니다.<br>
                                                            과거 일정은 완료 처리, 미래 일정은 삭제됩니다. <br>
                                                            이 수업 하나만 포함하는 수강권은 비활성화 됩니다.`, ()=>{
                        Lecture_func.status({"lecture_id":this.lecture_id, "state_cd":STATE_END_PROGRESS}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                lecture_list_popup.init();
                            }catch(e){}
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            layer_popup.close_layer_popup(); //option 팝업 닫기
                            layer_popup.close_layer_popup(); //수업 정보 팝업 닫기
                        });
                        
                    });
                }   
            },
            delete:{text:"삭제", callback:()=>{
                    show_user_confirm(`"${this.data.name}" <br> 수업을 영구 삭제 하시겠습니까? <br> 데이터를 복구할 수 없습니다.<br><br>
                                                            <img src="/static/common/icon/icon_stopmark.png" style="width:25px;"><br>
                                                            <span style="color:#fe4e65; font-size:12px;">이 수업을 포함하는 수강권에서 수업이 삭제됩니다.</span>`, ()=>{
                        Lecture_func.delete({"lecture_id":this.lecture_id}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                lecture_list_popup.init();
                            }catch(e){}
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            layer_popup.close_layer_popup(); //option 팝업 닫기
                            layer_popup.close_layer_popup(); //수업 정보 팝업 닫기
                        });
                    });
                }
            }
        };

        if(this.data.lecture_state == STATE_IN_PROGRESS){
            delete user_option.activate;
            delete user_option.delete;
        }else if(this.data.lecture_state == STATE_END_PROGRESS){
            delete user_option.deactivate;
        }
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    func_update_fixed_member(){
        let members_changed = [];

        let members = {};
        let sum_member = this.data.fixed_member_id.concat(this.data.fixed_member_id_original);
        for(let i=0; i<sum_member.length; i++){
            members[sum_member[i]] = sum_member[i];
        }
        let member_ids = Object.keys(members); //data_original과 data의 lecture_id들을 중복을 제거하고 합친 결과

        let list = this.data.fixed_member_id.slice();
        let list_original = this.data.fixed_member_id_original.slice();

        let filter_forward = member_ids.filter(val => !list.includes(val));
        let filter_reverse = member_ids.filter(val => !list_original.includes(val));

        members_changed = filter_forward.concat(filter_reverse);

        //두개 배열에서 중복되는 요소는 제거하고 하나로 만든다.
        return members_changed;
    }

    check_before_send(){

        let forms = document.getElementById(`${this.form_id}`);
        update_check_registration_form(forms);
        let error_info = check_registration_form(forms);
        console.log(error_info);
        if(error_info != ''){
            show_error_message(error_info);
            return false;
        }
        else{
            if(this.data.capacity <= 1 && this.data.lecture_type_cd != LECTURE_TYPE_ONE_TO_ONE){
                show_error_message('정원은 2명보다 크게 설정해주세요.');
                return false;
            }
            return true;
        }
    }
}

class Lecture_simple_view{
    constructor(install_target, lecture_id, instance){
        this.target = {install: install_target, toolbox:'section_lecture_simple_view_toolbox', content:'section_simple_lecture_view_content', close_button:'section_lecture_simple_view_close_button'};
        this.instance = instance;
        this.lecture_id = lecture_id;

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
                name:null,
                time:null,
                capacity:null,
                member_number:null,
                member:[],
                color_bg:null,
                color_font:null,
                color_name:null,
                reg_date:null,
                mod_date:null,
                ticket_id:[],
                ticket_name:[],
                ticket_state:[],
                memo:null,
                lecture_state:null
        };

        this.init();
        this.set_initial_data();
    }
 
    init(){
        this.render();
    }

    set_initial_data (){
        Lecture_func.read({"lecture_id": this.lecture_id}, (data)=>{
            this.data.name = data.lecture_name;
            this.data.capacity = data.lecture_max_num;
            this.data.member_number = data.lecture_ing_member_num;
            this.data.member = data.lecture_member_list;
            this.data.color_bg = data.lecture_ing_color_cd;
            this.data.color_font = data.lecture_ing_font_color_cd;
            this.data.reg_date = DateRobot.to_text(data.lecture_reg_dt.split(' ')[0]);
            this.data.mod_date = DateRobot.to_text(data.lecture_mod_dt.split(' ')[0]);
            this.data.ticket_id = data.lecture_ticket_id_list;
            this.data.ticket_name = data.lecture_ticket_list;
            this.data.ticket_state = data.lecture_ticket_state_cd_list;
            this.data.memo = data.lecture_note;

            this.data.lecture_state = data.lecture_state_cd;

            this.init();
        });   
    }

    render(){
        let dom_toolbox = this.dom_row_toolbox();
        let dom_content = this.dom_assembly_content();
        let dom_close_button = this.dom_close_button();

        let html = `<section id="${this.target.toolbox}" class="obj_box_full" style="position:sticky;position:-webkit-sticky;top:0;">${dom_toolbox}</section>
                    <section id="${this.target.content}" style="width:100%;height:auto;overflow-y:auto;">${dom_content}</section>
                    <section id="${this.target.close_button}" class="obj_box_full" style="height:48px;">${dom_close_button}</section>`;

        document.querySelector(this.target.install).innerHTML = html;
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_row_toolbox();
        document.getElementById(this.target.close_button).innerHTML = this.dom_close_button();
    }
    
    dom_assembly_content(){
        // let time = this.dom_row_lecture_time_input(); //수업 진행시간
        // let name = this.dom_row_lecture_name_input();
        let capacity = this.dom_row_capacity_view();
        let color = this.dom_row_color_view();
        let member = this.dom_row_member();

        let html =  '<div class="obj_box_full">'+capacity+color+member+'</div>';

        return html;
    }


    dom_row_toolbox(){
        let text_button_style = {"color":"#fe4e65", "font-size":"13px", "font-weight":"500", "padding":"10px 0"};
        let text_button = CComponent.text_button ("detail_lecture_info", "더보기", text_button_style, ()=>{
            show_user_confirm(`작업중이던 항목을 모두 닫고 수업 메뉴로 이동합니다.`, ()=>{
                layer_popup.all_close_layer_popup();
                if($(window).width() > 650){
                    sideGoPage("lecture_page_type");
                }else{
                    sideGoPopup("lecture");
                }
                
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_VIEW, 100, popup_style, {'lecture_id':this.lecture_id}, ()=>{
                    lecture_view_popup = new Lecture_view('.popup_lecture_view', this.lecture_id, 'lecture_view_popup');
                });
            });
        });

        let lecture_name = this.data.name == null ? '' : this.data.name;
        if(this.data.lecture_state == STATE_END_PROGRESS){
            lecture_name = `<span style="color:#888888;">${lecture_name}</span>`;
        }

        let html = `
        <div style="height:48px;line-height:48px;">
            <div style="float:left;width:auto;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                <span style="font-size:16px;font-weight:bold;">
                    ${CImg.lecture("", {"width":"20px", "vertical-align":"middle", "margin-right":"8px", "margin-bottom":"3px"})}
                    ${lecture_name}
                </span>
            </div>
            <div style="display:inline-block;float:right;width:65px;text-align:right;">
                ${text_button}
            </div>
        </div>
        `;
        return html;
    }

    dom_row_capacity_view(){
        let id = 'lecture_capacity_view';
        let title = this.data.capacity == null ? '' : +this.data.capacity+' 명';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"flex":"1 1 0"};
        let html_data = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            
        });

        let html = `<div style="display:flex;">
                        <div style="flex-basis:68px;font-size:11px;font-weight:500;letter-spacing:-0.5px;color:#b8b4b4;line-height:24px;padding:12px 0;">정원</div>
                        ${html_data}
                    </div>`;

        return html;
    }

    dom_row_color_view(){
        let id = 'lecture_color_view';
        let title = this.data.color_bg == null ? '색상명' : `<span style="background-color:${this.data.color_bg};color:${this.data.color_font};padding:5px;border-radius:4px;">${COLOR_NAME_CODE[this.data.color_bg]}</span>`;
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"flex":"1 1 0"};
        let html_data = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            
        });

        let html = `<div style="display:flex;">
                        <div style="flex-basis:68px;font-size:11px;font-weight:500;letter-spacing:-0.5px;color:#b8b4b4;line-height:24px;padding:12px 0;">색상</div>
                        ${html_data}
                    </div>`;

        return html;
    }

    dom_row_member(){
        let id = 'member_number_view';
        let title = this.data.member_number == null ? '0 명 (진행중)' : +this.data.member_number+' 명 (진행중)';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"flex":"1 1 0"};
        let html_data = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{});

        let html = `<div style="display:flex;">
                        <div style="flex-basis:68px;font-size:11px;font-weight:500;letter-spacing:-0.5px;color:#b8b4b4;line-height:24px;padding:12px 0;">회원수</div>
                        ${html_data}
                    </div>`;

        return html;
    }

    dom_close_button(){
        let style = {"display":"block", "height":"48px", "line-height":"48px", "padding":"0"};
        let html = CComponent.button ("close_member_simple", "닫기", style, ()=>{
            layer_popup.close_layer_popup();
        });
        return html;
    }

}