class Lecture_add_repeat{
    constructor(install_target, data, instance){

        this.target = {install: install_target, toolbox:'section_lecture_add_repeat_toolbox', content:'section_lecture_add_repeat_content'};
        this.instance = instance;
        this.external_data = data;
        this.form_id = 'id_lecture_add_repeat_form';

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
            lecture_repeat_schedule_id: null,
            lecture_name: null,
            lecture_max_num:1,
            lecture_repeat_start_date: null,
            lecture_repeat_end_date: null,
            lecture_id: null,
            member_id:[],
            member_name:[],
            repeat_counter: 0,
            note: ""
        };

        this.date_start = 0;
        Setting_reserve_func.read((data)=>{
            let date_start_array = {"SUN":0, "MON":1};
            this.date_start = date_start_array[data.setting_week_start_date];
        });

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
       
        this.init();
        // this.set_initial_data();
    }


    set member(data){
        this.data.member_id = data.id;
        this.data.member_name = data.name;
        this.render_content();
    }

    get member(){
        return {id:this.data.member_id, name:this.data.member_name};
    }

    init(){
        // this.render();
        this.set_initial_data();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    set_initial_data (){
        this.data.lecture_repeat_schedule_id = this.external_data.lecture_repeat_schedule_id;
        this.data.lecture_name = this.external_data.lecture_name;
        this.data.lecture_id = this.external_data.lecture_id;
        this.data.lecture_max_num = this.external_data.lecture_max_num;
        this.data.lecture_repeat_start_date = this.external_data.lecture_repeat_start_date;
        this.data.lecture_repeat_end_date = this.external_data.lecture_repeat_end_date;
        this.render();
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();lecture_add_repeat.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="lecture_add_repeat.send_data()"><span style="color:var(--font-highlight);font-weight: 500;">완료</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_lecture_add_repeat .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
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

        let lecture_repeat_member  = this.dom_row_repeat_member_select();
        let lecture_repeat_start_date = this.dom_row_lecture_repeat_start_date_input();
        let lecture_repeat_end_date = this.dom_row_lecture_repeat_end_date_input();

        let html =
            '<div class="obj_input_box_full">'+
                CComponent.dom_tag('회원') + lecture_repeat_member +
            '</div>'+
            '<div class="obj_input_box_full">'+
                CComponent.dom_tag('반복일정 시작일') + lecture_repeat_start_date +
                CComponent.dom_tag('반복일정 종료일') + lecture_repeat_end_date +
                    // `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>`+
                // + CComponent.dom_tag('일시정지 금액') + holding_price +
            '</div>'
                // + holding_ticket;

        return html;
    }

    dom_row_toolbox(){
        let title = "반복일정 추가";
        let html = `<div style="display:inline-block;">
                        <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">${title}</span>
                        <p style="font-size:11px;color:var(--font-sub-dark);margin:12px 0;">기존 수업 반복일정에 회원님을 추가합니다.</p>
                        <span style="display:none;">${title}</span>
                    </div>
                    `;
        return html;
    }

    dom_row_lecture_repeat_start_date_input(){
        let id = 'lecture_repeat_start_date';
        let title = this.data.lecture_repeat_start_date == null ||this.data.lecture_repeat_start_date == 'None' ? '반복일정 시작일' : this.data.lecture_repeat_start_date.replace(/-/gi, '.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.lecture_repeat_start_date == null ? this.dates.current_year : Number(this.data.lecture_repeat_start_date.split('-')[0]);
                let month = this.data.lecture_repeat_start_date == null ? this.dates.current_month : Number(this.data.lecture_repeat_start_date.split('-')[1]);
                let date = this.data.lecture_repeat_start_date == null ? this.dates.current_date : Number(this.data.lecture_repeat_start_date.split('-')[2]);

                let year_min = Number(this.data.lecture_repeat_start_date.split('-')[0]);
                let month_min = Number(this.data.lecture_repeat_start_date.split('-')[1]);
                let date_min = Number(this.data.lecture_repeat_start_date.split('-')[2]);
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'lecture_repeat_start_date', title:'반복일정 시작일', data:{year:year, month:month, date:date}, min:{year:year_min, month:month_min, date:date_min},callback_when_set: (object)=>{
                    this.data.lecture_repeat_start_date = DateRobot.to_yyyymmdd(object.data.year, object.data.month, object.data.date);
                    if(this.data.lecture_repeat_start_date > this.data.lecture_repeat_end_date){
                        this.data.lecture_repeat_end_date = DateRobot.to_yyyymmdd(object.data.year, object.data.month, object.data.date);
                    }
                    this.render_content();
                }});
            });
        });
        return html;
    }

    dom_row_lecture_repeat_end_date_input(){
        let id = 'lecture_repeat_end_date';
        let title = this.data.lecture_repeat_end_date == null ||this.data.lecture_repeat_end_date == 'None' ? '반복일정 종료일' : this.data.lecture_repeat_end_date.replace(/-/gi, '.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*320/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.lecture_repeat_end_date == null ? this.dates.current_year : Number(this.data.lecture_repeat_end_date.split('-')[0]);
                let month = this.data.lecture_repeat_end_date == null ? this.dates.current_month : Number(this.data.lecture_repeat_end_date.split('-')[1]);
                let date = this.data.lecture_repeat_end_date == null ? this.dates.current_date : Number(this.data.lecture_repeat_end_date.split('-')[2]);
                let year_min = Number(this.data.lecture_repeat_start_date.split('-')[0]);
                let month_min = Number(this.data.lecture_repeat_start_date.split('-')[1]);
                let date_min = Number(this.data.lecture_repeat_start_date.split('-')[2]);

                if(year == 9999){
                    year = year_min;
                    month = month_min;
                    date = date_min;
                }

                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'lecture_repeat_end_date', title:'반복일정 종료일', data:{year:year, month:month, date:date}, min:{year:year_min, month:month_min, date:date_min},callback_when_set: (object)=>{
                    this.data.lecture_repeat_end_date = DateRobot.to_yyyymmdd(object.data.year, object.data.month, object.data.date);
                    this.render_content();
                }});
            });
        });
        return html;
    }

    dom_row_repeat_member_select(){
        let id = 'repeat_select_member';
        let title = this.data.member_name.length == 0 ? '회원' : this.data.member_name.join(', ');
        let icon = CImg.members();
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = this.data.member_name.length == 0 ? {"color":"var(--font-inactive)", "height":"auto"} : {"height":"auto"};
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            if(this.data.lecture_id != null){
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, popup_style, {'member_id':null}, ()=>{
                    let appendix = {lecture_id:this.data.lecture_id, title:"회원", disable_zero_avail_count:ON, entire_member:NONE, member_id:this.data.member_id, member_name:this.data.member_name};
                    member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.lecture_max_num, appendix, (set_data)=>{

                        this.member = set_data;
                        this.render_content();
                    });
                });
            }else{
                show_error_message({title:'수업을 먼저 선택해주세요.'});
            }
        });
        return html;
    }

    send_data(){
        let auth_inspect = pass_inspector.schedule_create();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            layer_popup.close_layer_popup();
            show_error_message({title:message});
            return false;
        }
        let inspect_date = DateRobot.to_yyyymmdd(this.data.lecture_repeat_end_date.year, this.data.lecture_repeat_end_date.month, this.data.lecture_repeat_end_date.date);
        let pass_inspect = this.pass_inspect(inspect_date);
        if(pass_inspect == false){
            return false;
        }

        if(this.check_before_send() == false){
            return false;
        }
        let data = {"repeat_schedule_id":this.data.lecture_repeat_schedule_id, "member_ids":this.data.member_id,
                    "repeat_start_date":this.data.lecture_repeat_start_date, "repeat_end_date":this.data.lecture_repeat_end_date};

        Loading.show("반복 일정을 배치중입니다.<br>일정이 많은 경우 최대 2~4분까지 소요될 수 있습니다.");
        Plan_func.add_member_repeat_schedule_to_lecture_schedule(data, ()=>{
            Loading.hide();
            layer_popup.close_layer_popup();
            current_page.init();
            lecture_view_popup.init();
        }, ()=>{Loading.hide();});

    }

    upper_right_menu(){
        
    }

    check_before_send(){
        if(this.data.lecture_repeat_schedule_id == null){
            return false;
        }else if(this.data.member_id.length == 0){
            show_error_message({title:'회원을 선택해주세요.'});
            return false;
        }else if(this.data.lecture_repeat_start_date == null){
            show_error_message({title:"반복일정 시작일을 선택해주세요."});
            return false;
        }else if(this.data.lecture_repeat_end_date == null){
            show_error_message({title:"반복일정 종료일을 선택해주세요."});
            return false;
        }

        let forms = document.getElementById(`${this.form_id}`);
        update_check_registration_form(forms);
        let error_info = check_registration_form(forms);
        if(error_info != ''){
            show_error_message({title:error_info});
            return false;
        }
        else{
            return true;
        }
    }

    pass_inspect(selected_date){
        let inspect = pass_inspector.schedule(selected_date);
        if(inspect.barrier == BLOCKED){
            let message = {
                title:"일정 등록을 완료하지 못했습니다.",
                comment:`[${inspect.limit_type}] 이용자께서는 오늘 기준 전/후 ${inspect.limit_num}일간 일정 관리 하실 수 있습니다.
                        <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까?</p>`
            };
            show_user_confirm (message, ()=>{
                layer_popup.close_layer_popup();
                sideGoPopup("pters_pass_main");
            });
            return false;
        }
    }
}