class Lecture_view{
    constructor(install_target, lecture_id, instance){
        this.target = {install: install_target, toolbox:'section_lecture_view_toolbox', content:'section_lecture_view_content'};
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
                lecture_state:null
        };

        this.init();
        this.set_initial_data();
    }

    set name(text){
        this.data.name = text;
        // this.render_content();
    }

    get name(){
        return this.data.name;
    }

    set time(text){
        this.data.time = text;
        this.render_content();
    }

    get time(){
        return this.data.time;
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
        // this.render_content();
    }

    get member(){
        return {id:this.data.fixed_member_id, name:this.data.fixed_member_name};
    }

    set color(data){
        this.data.color_bg = data.bg;
        this.data.color_font = data.font;
        this.data.color_name = data.name;
        // this.render_content();
    }

    get color(){
        return {bg:this.data.color_bg, font:this.data.color_font, name:this.data.color_name};
    }

 
    init(){
        this.render();
        func_set_webkit_overflow_scrolling('.wrapper_middle');
    }

    set_initial_data (){
        Lecture_func.read({"lecture_id": this.lecture_id}, (data)=>{
            this.data.name = data.lecture_name;
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
            this.data.memo = data.lecture_note;

            this.data.lecture_state = data.lecture_state_cd;

            this.init();
        });   
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/navigate_before_black.png" onclick="layer_popup.close_layer_popup();lecture_view_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_more_horizontal.png" class="obj_icon_basic" onclick="lecture_view_popup.upper_right_menu();"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_lecture_view .wrapper_top').style.border = 0;
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
        // let time = this.dom_row_lecture_time_input(); //수업 진행시간
        // let name = this.dom_row_lecture_name_input();
        let capacity = this.dom_row_capacity_view();
        let color = this.dom_row_color_view();
        // let reg_mod = this.dom_row_reg_mod_date();
        // let ticket = this.dom_row_ticket();
        let ticket_list = this.dom_row_ticket_list();
        // let member = this.dom_row_member();
        let member_list = this.dom_row_member_list();


        let html =  '<div class="obj_box_full">' + CComponent.dom_tag('정원') + capacity + '</div>' + 
                    '<div class="obj_box_full">' + CComponent.dom_tag('색상 태그') + color +  '</div>' + 
                    '<div class="obj_box_full">' + CComponent.dom_tag(`이 수업을 포함하는 수강권 (${this.data.ticket_id.length} 개)`, {"padding":"0", "color":"#858282"}) + ticket_list + '</div>' + 
                    '<div class="obj_box_full">' + CComponent.dom_tag(`진행중 회원 (${this.data.member_number} 명)`, {"padding":"0", "color":"#858282"}) + member_list + '</div>';

        return html;
    }

    dom_row_toolbox(){
        
        let id = 'lecture_name_view';
        let title = this.data.name == null ? '' : this.data.name;
        let style = {"font-size":"20px", "font-weight":"bold", "padding":"0 28px"};
        if(this.data.lecture_state == STATE_END_PROGRESS){
            style["color"] = "#888888";
            title = title + ' (비활성)';
        }
        let placeholder =  '수업명*';
        let icon = undefined;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let disabled = false;

        let sub_html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
            this.send_data();
        });
        
        let html = `
        <div class="lecture_view_upper_box" style="">
            <div style="display:inline-block;width:320px;">
                <div style="display:inline-block;width:320px;">
                    ${sub_html}
                </div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_capacity_view(){
        let id = 'lecture_capacity_view';
        let title = this.data.capacity == null ? '' : '정원 '+this.data.capacity+'명';
        let placeholder = '정원';
        let icon = '/static/common/icon/icon_member.png';
        let icon_r_visible = SHOW;
        let icon_r_text = CComponent.text_button ('lecture_fixed_member_select', "고정 회원", null, ()=>{
            //고정 인원 선택
            if(this.data.capacity != null){
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                    member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.capacity, {'lecture_id':this.lecture_id, "title":"고정 회원 선택"}, (set_data)=>{
                        this.member = set_data;
                        this.send_data();
                    });
                });
            }else{
                show_error_message('정원을 먼저 입력해주세요.');
            }
        });
        let style = null;
        let disabled = false;
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            if(user_input_data == null){
                user_input_data = this.data.capacity;
            }
            this.capacity = user_input_data;
            this.send_data();
        });
        return html;
    }

    dom_row_color_view(){
        let id = 'color_select_view';
        let title = this.data.color_bg.length == 0 ? '색상 태그' : `<span style="background-color:${this.data.color_bg};color:${this.data.color_font};padding:5px;border-radius:4px;">${COLOR_NAME_CODE[this.data.color_bg]}</span>`;
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, ()=>{ 
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_COLOR_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                color_select = new ColorSelector('#wrapper_box_color_select', this, 1, (set_data)=>{
                    this.color = set_data;
                    this.send_data();
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
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";

        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, ()=>{});
        return html;
    }

    dom_row_ticket_list (){
        let length = this.data.ticket_id.length;
        let html_to_join = [];
        
        for(let i=0; i<length; i++){
            let ticket_id = this.data.ticket_id[i];
            let ticket_name = this.data.ticket_name[i];
            let style = {"display":"block", "font-size":"15px", "font-weight":"500",  "padding":"0", "height":"50px", "line-height":"50px"};
            html_to_join.push(
                CComponent.text_button(ticket_id, ticket_name, style, ()=>{
                    // layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_TICKET_VIEW, 100, POPUP_FROM_RIGHT, {'ticket_id':ticket_id}, ()=>{
                    //     ticket_view_popup = new Ticket_view('.popup_ticket_view', ticket_id, 'ticket_view_popup');
                    // });
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_SIMPLE_VIEW, 100*(254/windowHeight), POPUP_FROM_BOTTOM, {'ticket_id':ticket_id}, ()=>{
                        ticket_simple_view_popup = new Ticket_simple_view('.popup_ticket_simple_view', ticket_id, 'ticket_simple_view_popup');
                        //수강권 간단 정보 팝업 열기
                    });
                })
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    dom_row_member(){
        let id = 'select_member';
        let title = this.data.member_number == null ? '진행중 회원 (0 명)' : '진행중 회원 (' + this.data.member_number+' 명)';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, ()=>{
            //고정 인원 선택
            if(this.data.capacity != null){
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
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
        
        for(let i=0; i<length; i++){
            let member_id = this.data.member[i].member_id;
            let member_name = this.data.member[i].member_name;
            let member_fix = this.data.member[i].member_fix_state_cd;
            let style = {"font-size":"15px", "font-weight":"500", "padding":"0", "height":"50px", "line-height":"50px", "display":"table-cell", "width":"auto", "vertical-align":"middle"};
            let member_fix_indicator = "";
            if(member_fix == FIX){
                member_fix_indicator = '<span style="display:table-cell;width:50px;font-size:11px;font-weight:bold;color:#fe4e65;vertical-align:middle;">고정 회원</span>';
            }
            let member_button = CComponent.text_button (member_id, member_name, style, ()=>{
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SIMPLE_VIEW, 100*(400/windowHeight), POPUP_FROM_BOTTOM, {'member_id':member_id}, ()=>{
                    member_simple_view_popup = new Member_simple_view('.popup_member_simple_view', member_id, 'member_simple_view_popup');
                    //회원 간단 정보 팝업 열기
                });
            });

            html_to_join.push(
                '<div style="display:table;width:100%;">'+member_button + member_fix_indicator+'</div>'
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    send_data(){
        let data = {
            "lecture_id":this.lecture_id,
            "name":this.data.name,
            "member_num":this.data.capacity,
            "ing_color_cd":this.data.color_bg[0],
            "end_color_cd":"",
            "ing_font_color_cd":this.data.color_font[0],
            "end_font_color_cd":"",
        };

        Lecture_func.update(data, ()=>{
            let fixed_unfixed_members = this.func_update_fixed_member();
            let data = {"lecture_id":this.lecture_id, "member_ids[]":fixed_unfixed_members};
            Lecture_func.update_fixed_member(data); //async false 함수

            this.set_initial_data();
            lecture.init();
        });
    }

    upper_right_menu(){
        let user_option = {
            activate:{text:"활성화", callback:()=>{
                    show_user_confirm(`"${this.data.name}" 수업을 활성화 하시겠습니까? <br> 활성화 탭에서 다시 확인할 수 있습니다.`, ()=>{
                        Lecture_func.status({"lecture_id":this.lecture_id, "state_cd":STATE_IN_PROGRESS}, ()=>{
                            lecture.init();
                            layer_popup.all_close_layer_popup();
                        });
                        
                    });
                }   
            },
            deactivate:{text:"비활성화", callback:()=>{
                    show_user_confirm(`"${this.data.name}" 수업을 비활성화 하시겠습니까? <br> 비활성화 탭에서 다시 활성화 할 수 있습니다.`, ()=>{
                        Lecture_func.status({"lecture_id":this.lecture_id, "state_cd":STATE_END_PROGRESS}, ()=>{
                            lecture.init();
                            layer_popup.all_close_layer_popup();
                        });
                        
                    });
                }   
            },
            delete:{text:"삭제", callback:()=>{
                    show_user_confirm(`"${this.data.name}" 수업을 영구 삭제 하시겠습니까? <br> 데이터를 복구할 수 없습니다.`, ()=>{
                        Lecture_func.delete({"lecture_id":this.lecture_id}, ()=>{
                            lecture.init();
                            layer_popup.all_close_layer_popup();
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
        
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(45+50*Object.keys(user_option).length)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
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
        let text_button_style = {"color":"#858282", "font-size":"13px", "font-weight":"500"};
        let text_button = CComponent.text_button ("detail_lecture_info", "더보기", text_button_style, ()=>{
            show_user_confirm(`작업중이던 항목을 모두 닫고 수업 메뉴로 이동합니다.`, ()=>{
                layer_popup.all_close_layer_popup();
                sideGoPage("lecture");
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_VIEW, 100, POPUP_FROM_RIGHT, {'lecture_id':this.lecture_id}, ()=>{
                    lecture_view_popup = new Lecture_view('.popup_lecture_view', this.lecture_id, 'lecture_view_popup');
                });
            });
        });

        let lecture_name = this.data.name == null ? '' : this.data.name;
        if(this.data.ticket_state == STATE_END_PROGRESS){
            lecture_name = `<span style="color:#888888;">${lecture_name}</span><span> (비활성)</span>`;
        }

        let html = `
        <div style="height:48px;line-height:48px;">
            <div style="display:inline-block;float:left;width:275px;">
                <span style="font-size:13px;font-weight:500;">${lecture_name}</span>
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
        let title = this.data.capacity == null ? '정원' : '정원 '+this.data.capacity+' 명';
        let icon = '/static/common/icon/people_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, ()=>{ 
            
        });
        return html;
    }

    dom_row_color_view(){
        let id = 'lecture_color_view';
        let title = this.data.color_bg == null ? '색상명' : `<span style="background-color:${this.data.color_bg};color:${this.data.color_font};padding:5px;border-radius:4px;">${this.data.color_bg}</span>`;
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, ()=>{ 
            
        });
        return html;
    }

    dom_row_member(){
        let id = 'member_number_view';
        let title = this.data.member_number == null ? '진행중인 회원 (0 명)' : '진행중인 회원 ('+this.data.member_number+' 명)';
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, ()=>{});
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