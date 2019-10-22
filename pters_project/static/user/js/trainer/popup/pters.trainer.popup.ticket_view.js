class Ticket_view{
    constructor(install_target, ticket_id, instance, readonly){
        this.target = {install: install_target, toolbox:'section_ticket_view_toolbox', content:'section_ticket_view_content'};
        this.instance = instance;
        this.ticket_id = ticket_id;
        this.readonly = readonly;
        this.form_id = 'id_ticket_view_form';

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
            lecture_id:[],
            lecture_id_original:[],
            lecture_name:[],
            lecture_max:[],
            lecture_color:[],
            lecture_state_cd:[],
            lecture_type_cd:[],
            ticket_effective_days:null,
            count:null,
            price:null,
            memo:null,

            ticket_state:null,
            ticket_day_schedule_enable:null,
            ticket_week_schedule_enable:null,

            ticket_reg_dt:null,
            ticket_mod_dt:null,

            member_id:[],
            member_name:[],
            member_profile_url:[]
        };

        this.init();
        this.set_initial_data();
    }

    set name(text){
        this.data.name = text;
        this.render_content();
    }

    get name(){
        return this.data.name;
    }

    set lecture(data){
        this.data.lecture_id = data.id;
        this.data.lecture_name = data.name;
        this.data.lecture_max = data.max;
        this.data.lecture_state_cd = data.state_cd;
        this.data.lecture_type_cd = data.type_cd;
        this.render_content();
    }

    get lecture(){
        return {id:this.data.lecture_id, name:this.data.lecture_name, max:this.data.lecture_max, state_cd:this.data.lecture_state_cd, type_cd:this.data.lecture_type_cd};
    }

    set period(text){
        this.data.ticket_effective_days = text;
        this.render_content();
    }

    get period(){
        return this.data.ticket_effective_days;
    }

    set memo(text){
        this.data.memo = text;
        this.render_content();
    }

    get memo(){
        return this.data.memo;
    }
    
    set count(number){
        this.data.count = number;
        this.render_content();
    }

    get count(){
        return this.data._count;
    }

    set price(number){
        this.data.price = number;
        this.render_content();
    }

    get price(){
        return this.data.price;
    }


    init(){
        this.render();
    }

    set_initial_data (){
        Ticket_func.read({"ticket_id": this.ticket_id}, (data)=>{
            this.data.name = data.ticket_info.ticket_name;
            this.data.lecture_id = data.ticket_info.ticket_lecture_id_list;
            this.data.lecture_id_original = data.ticket_info.ticket_lecture_id_list.slice(); //나중에 data.lecture_id와 비교하기 위해 같은값을 넣어둔다.
            this.data.lecture_name = data.ticket_info.ticket_lecture_list;
            this.data.lecture_max = [];
            this.data.lecture_color = data.ticket_info.ticket_lecture_ing_color_cd_list;
            this.data.lecture_state_cd = data.ticket_info.ticket_lecture_state_cd_list;
            this.data.ticket_effective_days = data.ticket_info.ticket_effective_days;
            this.data.count = data.ticket_info.ticket_reg_count;
            this.data.price = data.ticket_info.ticket_price;
            this.data.memo = data.ticket_info.ticket_note;
            
            this.data.ticket_state = data.ticket_info.ticket_state_cd;
            this.data.ticket_day_schedule_enable = data.ticket_info.ticket_day_schedule_enable;
            this.data.ticket_week_schedule_enable = data.ticket_info.ticket_week_schedule_enable;

            this.data.ticket_reg_dt = data.ticket_info.ticket_reg_dt;
            this.data.ticket_mod_dt = data.ticket_info.ticket_mod_dt;
            Ticket_func.read_member_list({"ticket_id":this.ticket_id}, (data)=>{
                this.data.member_id = data.ticket_ing_member_list.map((el)=>{return el.member_id;});
                this.data.member_name = data.ticket_ing_member_list.map((el)=>{return el.member_name;});
                this.data.member_profile_url = data.ticket_ing_member_list.map((el)=>{return el.member_profile_url;});
                // this.init();
                this.render();
                func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
            });
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();ticket_view_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_more_horizontal.png" class="obj_icon_basic" onclick="ticket_view_popup.upper_right_menu();"></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_ticket_view .wrapper_top').style.border = 0;
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
        let lecture = this.dom_row_lecture_select();
        let lecture_list = this.dom_row_lecture_select_list();
        let memo = this.dom_row_ticket_memo_input();
        // let member = this.dom_row_member();
        let member_list = this.dom_row_member_list();

        let lecture_list_assembly = '<div class="obj_input_box_full">'+CComponent.dom_tag('수업 구성')+lecture+lecture_list+'</div>';
        let ticket_memo_assembly = '<div class="obj_input_box_full">'+CComponent.dom_tag('설명')+memo+ '</div>';
        let ticket_member_list_assembly = '<div class="obj_input_box_full" style="padding-top:16px;">'+CComponent.dom_tag(`수강권 보유 회원 (${this.data.member_id.length} 명)`, 
                                            {"font-size":"13px", "font-weight":"bold", "letter-spacing":"-0.6px", "padding":"0","padding-bottom":"8px", "color":"#858282", "height":"20px"})
                                        +member_list+ '</div>';

        if(this.data.ticket_state == STATE_END_PROGRESS){
            lecture_list_assembly = "";
            ticket_member_list_assembly = "";
        }

        let html =  lecture_list_assembly +
                    ticket_memo_assembly +
                    ticket_member_list_assembly;
        return html;
    }

    dom_row_toolbox(){
        let id = 'ticket_name_view';
        let style = {"font-size":"20px", "font-weight":"bold"};
        let title = this.data.name == null ? '' : this.data.name;
        if(this.data.ticket_state == STATE_END_PROGRESS){
            style["color"] = "#888888";
        }
        let placeholder = '수강권명*';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:()\\[\\] 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "+ - _ : ()[] 제외 특수문자는 입력 불가";
        let required = "required";
        let sub_html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
            this.send_data();
        }, pattern, pattern_message, required);
        
        let html = `
        <div class="member_add_upper_box">
            <div style="display:inline-block;width:100%;">
                <span style="position:absolute;top:0;font-size: 12px;display:block;color: #7d7d7d;font-weight: 500;">수강권</span>
                ${sub_html}
            </div>
            <span style="display:none;">${title}</span>
        </div>
        `;
        return html;
    }

    dom_row_lecture_select(){
        let id = 'lecture_select_view';
        let length_lecture = this.data.lecture_name.length;
        let ing_lecture_length = 0;
        for(let i=0; i<length_lecture; i++){
            if(this.data.lecture_state_cd[i] == STATE_IN_PROGRESS){
                ing_lecture_length++;
            }
        }
        let title = this.data.lecture_id.length == 0 ? '수업*' : ing_lecture_length+'개';
        let icon = '/static/common/icon/icon_lecture_black.png';
        let icon_r_visible = SHOW;
        let icon_r_text = CComponent.text_button ('ticket_lecture_list_view', "수업 목록", null, ()=>{

        });
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_SELECT, 100, popup_style, null, ()=>{
                lecture_select = new LectureSelector('#wrapper_box_lecture_select', this, 999, {'title':'수업'}, (set_data)=>{
                    this.lecture = set_data; //타겟에 선택된 데이터를 set
                    this.send_data();
                });
            });
        });
        return html;
    }

    dom_row_lecture_select_list (){
        let length = this.data.lecture_id.length;
        let html_to_join = [];

        for(let i=0; i<length; i++){
            let lecture_id = this.data.lecture_id[i];
            let lecture_name = this.data.lecture_name[i];
            let lecture_state_cd = this.data.lecture_state_cd[i];
            let lecture_color = this.data.lecture_color[i];
            let text_decoration = (lecture_state_cd == STATE_END_PROGRESS ? 'color:#cccccc; text-decoration:line-through;' : '');
            let icon_button_style = {"display":"block", "padding":"0", "padding-left":"10px", "font-size":"15px",
                                     "font-weight":"500", "height":"50px", "line-height":"50px", "overflow":"hidden", "text-overflow":"ellipsis", "white-space":"nowrap"};

            let lecture_name_set = `<div style="display:inline-block;width: 4px;height:16px;border-radius:6px;background-color:${lecture_color};margin-right:12px;vertical-align:middle;"></div>
                                    <span style="${text_decoration};vertical-align:middle;">${lecture_name}</span>`;
            html_to_join.push(
                CComponent.icon_button (lecture_id, lecture_name_set, NONE, icon_button_style, ()=>{
                    let root_content_height = $root_content.height();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_SIMPLE_VIEW, 100*(247/root_content_height), POPUP_FROM_BOTTOM, {'lecture_id':lecture_id}, ()=>{
                        lecture_simple_view_popup = new Lecture_simple_view('.popup_lecture_simple_view', lecture_id, 'lecture_simple_view_popup');
                        //수업 간단 정보 팝업 열기
                    });
                })
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    dom_row_ticket_count_input(){
        let unit = '회';
        let id = 'ticket_count_view';
        let title = this.data.count == null ? '' : this.data.count+unit;
        let placeholder = '횟수';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = true;
        let pattern = "[0-9]{0,4}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            let user_input_data = input_data;
            this.count = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_ticket_price_input(){
        let unit = '원';
        let id = 'ticket_price_view';
        let title = this.data.price == null ? '' : this.data.price+unit;
        let placeholder = '가격';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = true;
        let pattern = "[0-9]{0,8}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            let user_input_data = input_data;
            this.price = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_ticket_memo_input(){
        let id = 'ticket_memo_view';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '설명';
        let icon = '/static/common/icon/icon_note_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
            this.send_data();
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_reg_mod_date(){
        let icon_button_style = {"display":"block", "padding":0, "font-size":"12px"};
        let html1 = CComponent.icon_button('reg_date_view', `등록 ${this.data.ticket_reg_dt}`, NONE, icon_button_style, ()=>{});
        // let html2 = CComponent.icon_button('mod_date', `수정 ${this.data.ticket_mod_dt}`, NONE, icon_button_style, ()=>{});
        let html = html1;
        return html;
    }

    dom_row_member(){
        // let member_text = this.data.member_id.length == 0 ? '진행중인 회원 (0 명)' : '진행중인 회원 ('+this.data.member_id.length+' 명)';
        // let html = CComponent.create_row('ing_member_view', member_text, '/static/common/icon/icon_rectangle_blank.png', HIDE, ()=>{});
        // return html;
        let id = 'ing_member_view';
        let title = this.data.member_id.length == 0 ? '0 명' : this.data.member_id.length+' 명';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{});
        return html;
    }

    dom_row_member_list (){
        let length = this.data.member_id.length;
        let html_to_join = [];
        
        for(let i=0; i<length; i++){
            let member_id = this.data.member_id[i];
            let member_name = this.data.member_name[i];
            let member_profile_url = this.data.member_profile_url[i];
            let style = {"display":"block", "font-size":"15px", "font-weight":"500", "padding":"0", "height":"44px", "line-height":"44px"};
            let member_button =
                CComponent.text_button(member_id, member_name, style, ()=>{
                    let root_content_height = $root_content.height();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SIMPLE_VIEW, 100*(400/root_content_height), POPUP_FROM_BOTTOM, {'member_id':member_id}, ()=>{
                        member_simple_view_popup = new Member_simple_view('.popup_member_simple_view', member_id, 'member_simple_view_popup');
                        //회원 간단 정보 팝업 열기
                    });
                })
            ;

            let member_img = '<div style="display: table-cell; width:40px; vertical-align:bottom;"><img src="'+member_profile_url+'" style="width:30px; height:30px; border-radius: 50%;"></div>';
            html_to_join.push(
                '<div style="display:table;width:100%;">'+member_img+'<div style="display: table-cell; width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+member_button + '</div><div style="display: table-cell; line-height: 44px; float:right;"></div></div>'
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
                    "ticket_id":this.ticket_id,
                    "ticket_name":this.data.name,
                    "lecture_id_list[]":this.data.lecture_id,
                    "ticket_effective_days":this.data.ticket_effective_days,
                    "ticket_reg_count":this.data.count,
                    "ticket_price":this.data.price,
                    "ticket_note":this.data.memo,
                    "ticket_week_schedule_enable":7, //주간 수강 제한 횟수
                    "ticket_day_schedule_enable":1  //일일 수강 제한 횟수
        };

        Ticket_func.update(data, ()=>{
            let lecture_to_be_update = this.func_update_lecture();
            for(let i=0; i<lecture_to_be_update.add.length; i++){
                let data = {"ticket_id":this.ticket_id, "lecture_id":lecture_to_be_update.add[i]};
                Ticket_func.update_lecture(ADD, data);
            }
            for(let j=0; j<lecture_to_be_update.del.length; j++){
                let data = {"ticket_id":this.ticket_id, "lecture_id":lecture_to_be_update.del[j]};
                Ticket_func.update_lecture(DELETE, data);
            }

            this.set_initial_data();
            try{
                current_page.init();
            }catch(e){}
            try{
                ticket_list_popup.init();
            }catch(e){}
        });
    }

    upper_right_menu(){
        let user_option = {
            activate:{text:"활성화", callback:()=>{
                    show_user_confirm(`"${this.data.name}" <br> 수강권을 활성화 하시겠습니까? <br> 활성화 탭에서 다시 확인할 수 있습니다.`, ()=>{
                        let inspect = pass_inspector.ticket();
                        if(inspect.barrier == BLOCKED){
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            show_error_message(`[${inspect.limit_type}] 이용자께서는 진행중 수강권을 최대 ${inspect.limit_num}개까지 등록하실 수 있습니다. 
                                                <br> 수강권 활성화에 실패했습니다.`);
                            return false;
                        }

                        Ticket_func.status({"ticket_id":this.ticket_id, "state_cd":STATE_IN_PROGRESS}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                ticket_list_popup.init();
                            }catch(e){}
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            layer_popup.close_layer_popup(); //option 팝업 닫기
                            layer_popup.close_layer_popup(); //수강권 정보 팝업 닫기
                        });
                        
                    });
                }   
            },
            deactivate:{text:"비활성화", callback:()=>{
                    show_user_confirm(`"${this.data.name}" <br> 수강권을 비활성화 하시겠습니까?  <br> 비활성화 탭에서 다시 활성화 할 수 있습니다. <br><br>
                                                            <img src="/static/common/icon/icon_stopmark.png" style="width:25px;"><br>
                                                            <span style="color:#fe4e65; font-size:12px;">이 수강권을 가진 회원들에게서 수강권이 삭제됩니다. <br>
                                                            과거 일정은 완료 처리, 미래 일정은 삭제됩니다. <br>
                                                            이 수강권 하나만 가진 회원은 종료탭으로 이동됩니다.</span>`, ()=>{
                        Ticket_func.status({"ticket_id":this.ticket_id, "state_cd":STATE_END_PROGRESS}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                ticket_list_popup.init();
                            }catch(e){}
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            layer_popup.close_layer_popup(); //option 팝업 닫기
                            layer_popup.close_layer_popup(); //수강권 정보 팝업 닫기
                        });
                        
                    });
                }   
            },
            delete:{text:"삭제", callback:()=>{
                    show_user_confirm(`"${this.data.name}" <br> 수강권을 영구 삭제 하시겠습니까? <br> 데이터를 복구할 수 없습니다. <br><br>
                                                            <img src="/static/common/icon/icon_stopmark.png" style="width:25px;"><br>
                                                            <span style="color:#fe4e65; font-size:12px;">수강권과 연결된 수업, 회원에게서 <br>이 수강권과 관련된 정보가 모두 삭제됩니다.</span>`, ()=>{
                        Ticket_func.delete({"ticket_id":this.ticket_id}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                ticket_list_popup.init();
                            }catch(e){}
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            layer_popup.close_layer_popup(); //option 팝업 닫기
                            layer_popup.close_layer_popup(); //수강권 정보 팝업 닫기
                        });
                    });
                }
            }
        };

        if(this.data.ticket_state == STATE_IN_PROGRESS){
            delete user_option.activate;
            delete user_option.delete;
        }else if(this.data.ticket_state == STATE_END_PROGRESS){
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

    func_update_lecture(){
        let lectures = {};
        let sum_lecture = this.data.lecture_id.concat(this.data.lecture_id_original);
        for(let i=0; i<sum_lecture.length; i++){
            lectures[sum_lecture[i]] = sum_lecture[i];
        }
        let lecture_ids = Object.keys(lectures); //data_original과 data의 lecture_id들을 중복을 제거하고 합친 결과
        let lecture_id_to_be_deleted = [];
        let lecture_id_to_be_added = [];
        for(let j=0; j<lecture_ids.length; j++){
            if(this.data.lecture_id_original.indexOf(lecture_ids[j]) == -1){ //원래 데이터에 없는 lecture id가 추가되었을 경우
                lecture_id_to_be_added.push(lecture_ids[j]);
            }else if(this.data.lecture_id.indexOf(lecture_ids[j]) == -1){ //원래 데이터에 있던 lecture id가 빠진 경우
                lecture_id_to_be_deleted.push(lecture_ids[j]);
            }
        }
        return {add:lecture_id_to_be_added, del:lecture_id_to_be_deleted};
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
            return true;
        }
    }
}



class Ticket_simple_view{
    constructor(install_target, ticket_id, instance, readonly){
        this.target = {install: install_target, toolbox:'section_ticket_view_toolbox', content:'section_ticket_view_content', close_button:'section_ticket_simple_view_close_button'};
        this.instance = instance;
        this.ticket_id = ticket_id;
        this.readonly = readonly;

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
            lecture_id:[],
            lecture_name:[],
            lecture_max:[],
            lecture_color:[],
            lecture_state_cd:[],
            ticket_effective_days:null,
            count:null,
            price:null,
            memo:null,

            ticket_state:null,
            ticket_day_schedule_enable:null,
            ticket_week_schedule_enable:null,

            ticket_reg_dt:null,
            ticket_mod_dt:null,

            member_id:[],
            member_name:[],
            member_profile_url:[]
        };

        this.init();
        this.set_initial_data();
    }

    init(){
        this.render();
    }

    set_initial_data (){
        Ticket_func.read({"ticket_id": this.ticket_id}, (data)=>{
            this.data.name = data.ticket_info.ticket_name;
            this.data.lecture_id = data.ticket_info.ticket_lecture_id_list;
            this.data.lecture_name = data.ticket_info.ticket_lecture_list;
            this.data.lecture_state_cd = data.ticket_info.ticket_lecture_state_cd_list;
            this.data.lecture_max = [];
            this.data.lecture_color = data.ticket_info.ticket_lecture_ing_color_cd_list;
            this.data.ticket_effective_days = data.ticket_info.ticket_effective_days;
            this.data.count = data.ticket_info.ticket_reg_count;
            this.data.price = data.ticket_info.ticket_price;
            this.data.memo = data.ticket_info.ticket_note;
            
            this.data.ticket_state = data.ticket_info.ticket_state_cd;
            this.data.ticket_day_schedule_enable = data.ticket_info.ticket_day_schedule_enable;
            this.data.ticket_week_schedule_enable = data.ticket_info.ticket_week_schedule_enable;

            this.data.ticket_reg_dt = data.ticket_info.ticket_reg_dt;
            this.data.ticket_mod_dt = data.ticket_info.ticket_mod_dt;
            Ticket_func.read_member_list({"ticket_id":this.ticket_id}, (data)=>{
                this.data.member_id = data.ticket_ing_member_list.map((el)=>{return el.member_id;});
                this.data.member_name = data.ticket_ing_member_list.map((el)=>{return el.member_name;});
                this.data.member_profile_url = data.ticket_ing_member_list.map((el)=>{return el.member_profile_url;});
                this.init();
            });
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

    
    dom_assembly_content(){
        let lecture = this.dom_row_lecture_select();
        let memo = this.dom_row_ticket_memo_input();
        let member = this.dom_row_member();

        let html =  '<div class="obj_box_full">'+lecture+member+memo+'</div>';

        return html;
    }

    dom_row_toolbox(){
        let text_button_style = {"color":"#858282", "font-size":"13px", "font-weight":"500"};
        let text_button = CComponent.text_button ("detail_ticket_info", "더보기", text_button_style, ()=>{
            show_user_confirm(`작업중이던 항목을 모두 닫고 수강권 메뉴로 이동합니다.`, ()=>{
                layer_popup.all_close_layer_popup();
                sideGoPage("ticket");
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_VIEW, 100, popup_style, {'ticket_id':this.ticket_id} ,()=>{
                    ticket_view_popup = new Ticket_view('.popup_ticket_view', this.ticket_id, 'ticket_view_popup');
                });
            });
        });

        let ticket_name = this.data.name == null ? '' : this.data.name;
        if(this.data.ticket_state == STATE_END_PROGRESS){
            ticket_name = `<span style="color:#888888;">${ticket_name}</span>`;
        }

        let html = `
        <div style="height:48px;line-height:48px;">
            <div style="float:left;width:auto;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                <span style="font-size:13px;font-weight:500;">${ticket_name}</span>
            </div>
            <div style="display:inline-block;float:right;width:65px;text-align:right;">
                ${text_button}
            </div>
        </div>
        `;
        return html;
    }

    dom_row_lecture_select(){
        let id = 'lecture_select_view';
        let length_lecture = this.data.lecture_name.length;
        let ing_lecture_length = 0;
        for(let i=0; i<length_lecture; i++){
            if(this.data.lecture_state_cd[i] == STATE_IN_PROGRESS){
                ing_lecture_length++;
            }
        }
        let title = this.data.lecture_id.length == 0 ? '수업 0개' : ing_lecture_length+'개';
        let icon = '/static/common/icon/icon_lecture_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            // let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_SELECT, 100, popup_style, null, ()=>{
            //     lecture_select = new LectureSelector('#wrapper_box_lecture_select', this, 999);
            // });
        });
        return html;
    }

    dom_row_ticket_memo_input(){
        let id = 'ticket_memo_view';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '설명';
        let icon = '/static/common/icon/icon_note_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = true;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            // let user_input_data = input_data;
            // this.memo = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }


    dom_row_member(){
        let id = 'ing_member_view';
        let title = this.data.member_id.length == 0 ? '진행중인 회원 (0 명)' : '진행중인 회원 ('+this.data.member_id.length+' 명)';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{});
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