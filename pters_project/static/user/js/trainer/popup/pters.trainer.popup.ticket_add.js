class Ticket_add{
    constructor(install_target, callback){
        this.target = {install: install_target, toolbox:'section_ticket_add_toolbox', content:'section_ticket_add_content'};
        this.data_sending_now = false;
        this.callback = callback;
        this.form_id = 'id_ticket_add_form';

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
                lecture_type_cd:[],
                ticket_effective_days:null,
                count:null,
                price:null,
                memo:null,
                ticket_day_schedule_enable:null,
                ticket_week_schedule_enable:null,
        };

        this.simple_input = {
            count : OFF,
            price : OFF,
            period : OFF
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

    set lecture(data){
        this.data.lecture_id = data.id;
        this.data.lecture_name = data.name;
        this.data.lecture_max = data.max;
        this.data.lecture_state_cd = data.state_cd;
        this.data.lecture_type_cd = data.type_cd;
        this.data.lecture_color = data.color;
        this.render_content();
    }

    get lecture(){
        return {id:this.data.lecture_id, name:this.data.lecture_name, max:this.data.lecture_max, state_cd:this.data.lecture_state_cd, type_cd:this.data.lecture_type_cd, color:this.data.lecture_color};
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
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();ticket_add_popup.clear();">${CImg.x()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="ticket_add_popup.send_data();"><span style="color:var(--font-highlight);font-weight: 500;">등록</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_ticket_add .wrapper_top').style.border = 0;
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
        let name = this.dom_row_ticket_name_input();
        let lecture = this.dom_row_lecture_select();
        let lecture_list = this.dom_row_lecture_select_list();
        let count = this.dom_row_ticket_count_input();
        let price = this.dom_row_ticket_price_input();
        let period = this.dom_row_ticket_period_input();
        let memo = this.dom_row_ticket_memo_input();
        let max_reserve_number_daily = this.dom_row_reserve_limit_number_daily();
        let max_reserve_number_weekly = this.dom_row_reserve_limit_number_weekly();

        let html =  '<div class="obj_input_box_full">' + CComponent.dom_tag('회원권명', null, true) + name + '</div>' +
                    '<div class="obj_input_box_full">' + CComponent.dom_tag('수업 구성') + lecture + lecture_list + '</div>' +
                    '<div class="obj_input_box_full">' + 
                        CComponent.dom_tag('기본 횟수') + 
                        count + `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>` +
                        CComponent.dom_tag('기본 유효기간') + 
                        period + `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>` +
                        CComponent.dom_tag('기본 가격') + 
                        price + 
                    '</div>' +
                    '<div class="obj_input_box_full">' + 
                        CComponent.dom_tag('하루 최대 예약 횟수') + 
                        max_reserve_number_daily + `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>` +
                        CComponent.dom_tag('주간 최대 예약 횟수') + 
                        max_reserve_number_weekly + 
                    '</div>'  +
                    '<div class="obj_input_box_full">' + CComponent.dom_tag('설명') + memo + '</div>';

        // document.getElementById(this.target.content).innerHTML = html;
        return html;
    }

    dom_row_toolbox(){
        let html = `
        <div class="ticket_add_upper_box">
            <div style="display:inline-block;width:200px;">
                <span style="font-size:20px;font-weight:bold;letter-spacing: -0.9px;">새로운 회원권</span>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_ticket_name_input(){
        let id = 'input_ticket_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '회원권명';
        let icon = CImg.ticket();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = '[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:.,()\\[\\]\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}';
        let pattern_message = "+ - _ : ()[] ., 제외 특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_lecture_select(){
        let id = 'input_lecture_select';
        let title = this.data.lecture_id.length == 0 ? '수업' : this.data.lecture_name.length+'개 선택됨';
        let icon = CImg.lecture();
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = this.data.lecture_id.length == 0 ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_SELECT, 100, popup_style, null, ()=>{
                let appendix = {'title':'수업', lecture_id:this.data.lecture_id, lecture_name:this.data.lecture_name, lecture_state_cd:this.data.lecture_state_cd,
                                max:this.data.lecture_max, type_cd:this.data.lecture_type_cd, color:this.data.lecture_color};
                lecture_select = new LectureSelector('#wrapper_box_lecture_select', this, 999, appendix, (set_data)=>{
                    this.lecture = set_data; //타겟에 선택된 데이터를 set
                    this.render_content();
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
            let lecture_color = this.data.lecture_color[i];
            let lecture_name = `<div style="display:inline-block;width: 4px;height:16px;border-radius:6px;background-color:${lecture_color};margin-right:12px;vertical-align:middle;"></div>` + this.data.lecture_name[i];
            let icon_button_style = {"padding":"3px 1%", "width":"30%", "overflow":"hidden", "text-overflow":"ellipsis", "white-space":"nowrap", "font-size":"15px", "font-weight":"500"};
            let icon = NONE;
            html_to_join.push(
                CComponent.icon_button(lecture_id, lecture_name, icon, icon_button_style, ()=>{
                    let root_content_height = $root_content.height();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_SIMPLE_VIEW, 100*(235/root_content_height), POPUP_FROM_BOTTOM, {'lecture_id':lecture_id}, ()=>{
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
        let title = this.data.count == null ? '' : UnitRobot.numberWithCommas(this.data.count) + unit;
        let placeholder = '0 회';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,4}";
        let pattern_message = "";
        let required = "";

        if(this.data.count >= 99999){
            title = "무제한";
        }

        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let auth_inspect = pass_inspector.ticket_update();
            if(auth_inspect.barrier == BLOCKED){
                let message = `${auth_inspect.limit_type}`;
                this.init();
                show_error_message({title:message});
                return false;
            }

            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            let user_input_data = input_data;
            this.count = user_input_data;
        }, pattern, pattern_message, required);

        $(document).off('click', `#c_i_n_r_${id}`).on('click', `#c_i_n_r_${id}`, ()=>{
            if(this.simple_input.count == OFF){
                this.simple_input.count = ON;
                this.render_content();
            }
        });

        if(this.simple_input.count == ON){
            html = html + this.dom_row_count_simple_input_machine();
        }

        return html;
    }

    dom_row_count_simple_input_machine(){
        // let button_style = {"flex":"1 1 0", "padding":"10px 8px", "color":"var(--font-sub-normal)"};
        let button_style = {"flex":"1 1 0", "padding":"6px 0px", "color":"var(--font-sub-normal)", "background-color":"var(--bg-light)", "border-radius":"3px"};

        let button_limitless = CComponent.button ("button_limitless", "무제한", button_style, ()=>{ this.data.count = 99999;this.render_content(); });
        let button_50 = CComponent.button ("button_50c", "+ 50회", button_style, ()=>{if(this.data.count >= 99999){this.data.count = null;}  this.data.count = Number(this.data.count) + 50;this.render_content(); });
        let button_10 = CComponent.button ("button_10c", "+ 10회", button_style, ()=>{if(this.data.count >= 99999){this.data.count = null;}  this.data.count = Number(this.data.count) + 10;this.render_content(); });
        let button_1 = CComponent.button ("button_1c", "+ 1회", button_style, ()=>{if(this.data.count >= 99999){this.data.count = null;}  this.data.count = Number(this.data.count) + 1;this.render_content(); });
        let button_delete = CComponent.button ("button_delete_c", "지우기", button_style, ()=>{ this.data.count = null;this.render_content(); });
        
        // let wrapper_style = "display:flex;padding:0px 0 0px 20px;font-size:12px;";
        // let divider_style = "flex-basis:1px;height:20px;margin-top:10px;background-color:var(--bg-light);display:none;";
        let wrapper_style = "display:flex;padding:0px 0 0px 40px;font-size:12px;";
        let divider_style = "flex-basis:8px;height:20px;margin-top:10px;background-color:var(--bg-invisible);";
        let html = `<div style="${wrapper_style}">
                        ${button_1} <div style="${divider_style}"></div>
                        ${button_10} <div style="${divider_style}"></div>
                        ${button_50} <div style="${divider_style}"></div>
                        ${button_limitless} <div style="${divider_style}"></div>
                        ${button_delete}
                    </div>`;

        return html;
    }

    dom_row_ticket_price_input(){
        let unit = '원';
        let id = 'ticket_price_view';
        let title = this.data.price == null ? '' : UnitRobot.numberWithCommas(this.data.price) + unit;
        let placeholder = '0 원';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,8}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let auth_inspect = pass_inspector.ticket_update();
            if(auth_inspect.barrier == BLOCKED){
                let message = `${auth_inspect.limit_type}`;
                this.init();
                show_error_message({title:message});
                return false;
            }

            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            let user_input_data = input_data;
            this.price = user_input_data;
        }, pattern, pattern_message, required);

        $(document).off('click', `#c_i_n_r_${id}`).on('click', `#c_i_n_r_${id}`, ()=>{
            if(this.simple_input.price == OFF){
                this.simple_input.price = ON;
                this.render_content();
            }
        });

        if(this.simple_input.price == ON){
            html = html + this.dom_row_price_simple_input_machine();
        }

        return html;
    }

    dom_row_price_simple_input_machine(){
        // let button_style = {"flex":"1 1 0", "padding":"10px 8px", "color":"var(--font-sub-normal)"};
        let button_style = {"flex":"1 1 0", "padding":"6px 0px", "color":"var(--font-sub-normal)", "background-color":"var(--bg-light)", "border-radius":"3px"};

        let button_100 = CComponent.button ("button_100", "+ 100만", button_style, ()=>{ this.data.price = Number(this.data.price) + 1000000;this.render_content(); });
        let button_50 = CComponent.button ("button_50", "+ 50만", button_style, ()=>{ this.data.price = Number(this.data.price) + 500000;this.render_content(); });
        let button_10 = CComponent.button ("button_10", "+ 10만", button_style, ()=>{ this.data.price = Number(this.data.price) + 100000;this.render_content(); });
        let button_1 = CComponent.button ("button_1", "+ 1만", button_style, ()=>{ this.data.price = Number(this.data.price) + 10000;this.render_content(); });
        let button_delete = CComponent.button ("button_delete", "지우기", button_style, ()=>{ this.data.price = null;this.render_content(); });
        
        // let wrapper_style = "display:flex;padding:0px 0 0px 20px;font-size:12px;";
        // let divider_style = "flex-basis:1px;height:20px;margin-top:10px;background-color:var(--bg-light);display:none;";
        let wrapper_style = "display:flex;padding:0px 0 0px 40px;font-size:12px;";
        let divider_style = "flex-basis:8px;height:20px;margin-top:10px;background-color:var(--bg-invisible);";
        let html = `<div style="${wrapper_style}">
                        ${button_100} <div style="${divider_style}"></div>
                        ${button_50} <div style="${divider_style}"></div>
                        ${button_10} <div style="${divider_style}"></div>
                        ${button_1} <div style="${divider_style}"></div>
                        ${button_delete}
                    </div>`;

        return html;
    }

    dom_row_ticket_period_input(){
        let unit = '일';
        let id = 'ticket_ticket_effective_days_view';
        let title = this.data.ticket_effective_days == null ? '' : UnitRobot.numberWithCommas(this.data.ticket_effective_days) + unit;
        let placeholder = '0 일';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,4}";
        let pattern_message = "";
        let required = "";
        if(this.data.ticket_effective_days >= 99999){
            title = "소진 시까지";
        }
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let auth_inspect = pass_inspector.ticket_update();
            if(auth_inspect.barrier == BLOCKED){
                let message = `${auth_inspect.limit_type}`;
                this.init();
                show_error_message({title:message});
                return false;
            }

            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            let user_input_data = input_data;
            this.period = user_input_data;
        }, pattern, pattern_message, required);
        
        $(document).off('click', `#c_i_n_r_${id}`).on('click', `#c_i_n_r_${id}`, ()=>{
            if(this.simple_input.period == OFF){
                this.simple_input.period = ON;
                this.render_content();
            }
        });

        if(this.simple_input.period == ON){
            html = html + this.dom_row_period_simple_input_machine();
        }

        return html;
    }

    dom_row_period_simple_input_machine(){
        // let button_style = {"flex":"1 1 0", "padding":"10px 8px", "color":"var(--font-sub-normal)"};
        let button_style = {"flex":"1 1 0", "padding":"6px 0px", "color":"var(--font-sub-normal)", "background-color":"var(--bg-light)", "border-radius":"3px"};

        let button_limitless_d = CComponent.button ("button_limitless_d", "소진 시", button_style, ()=>{this.data.ticket_effective_days = 99999;this.render_content(); });
        let button_10 = CComponent.button ("button_10d", "+ 10일", button_style, ()=>{if(this.data.ticket_effective_days >= 99999){this.data.ticket_effective_days = null;} this.data.ticket_effective_days = Number(this.data.ticket_effective_days) + 10;this.render_content(); });
        let button_7 = CComponent.button ("button_7d", "+ 7일", button_style, ()=>{if(this.data.ticket_effective_days >= 99999){this.data.ticket_effective_days = null;} this.data.ticket_effective_days = Number(this.data.ticket_effective_days) + 7;this.render_content(); });
        let button_1 = CComponent.button ("button_1d", "+ 1일", button_style, ()=>{if(this.data.ticket_effective_days >= 99999){this.data.ticket_effective_days = null;} this.data.ticket_effective_days = Number(this.data.ticket_effective_days) + 1;this.render_content(); });
        let button_delete = CComponent.button ("button_delete_d", "지우기", button_style, ()=>{ this.data.ticket_effective_days = null;this.render_content(); });
        
        // let wrapper_style = "display:flex;padding:0px 0 0px 20px;font-size:12px;";
        // let divider_style = "flex-basis:1px;height:20px;margin-top:10px;background-color:var(--bg-light);display:none;";
        let wrapper_style = "display:flex;padding:0px 0 0px 40px;font-size:12px;";
        let divider_style = "flex-basis:8px;height:20px;margin-top:10px;background-color:var(--bg-invisible);";
        let html = `<div style="${wrapper_style}">
                        ${button_1} <div style="${divider_style}"></div>
                        ${button_7} <div style="${divider_style}"></div>
                        ${button_10} <div style="${divider_style}"></div>
                        ${button_limitless_d} <div style="${divider_style}"></div>
                        ${button_delete}
                    </div>`;

        return html;
    }

    dom_row_reserve_limit_number_daily(){
        let unit = '회';
        let id = 'reserve_limit_number_daily';
        let title = this.data.ticket_day_schedule_enable == null ? '' : UnitRobot.numberWithCommas(this.data.ticket_day_schedule_enable) + unit;
        let placeholder = `제한 없음`;
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,3}";
        let pattern_message = "";
        let required = "";

        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{

            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }

            let user_input_data = input_data;
            this.data.ticket_day_schedule_enable = user_input_data;
            this.render_content();
        }, pattern, pattern_message, required);

        return html;
    }

    dom_row_reserve_limit_number_weekly(){
        let unit = '회';
        let id = 'reserve_limit_number_weekly';
        let title = this.data.ticket_week_schedule_enable == null ? '' : UnitRobot.numberWithCommas(this.data.ticket_week_schedule_enable) + unit;
        let placeholder = `제한 없음`;
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,3}";
        let pattern_message = "";
        let required = "";

        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{

            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }

            let user_input_data = input_data;
            this.data.ticket_week_schedule_enable = user_input_data;
            this.render_content();
        }, pattern, pattern_message, required);

        return html;
    }

    dom_row_ticket_memo_input(){
        let id = 'input_ticket_memo';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '설명';
        let icon = CImg.memo();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:.,\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ : ., 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    send_data(){
        let auth_inspect = pass_inspector.ticket_create();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            this.init();
            show_error_message({title:message});
            return false;
        }
        
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }

        let inspect = pass_inspector.ticket();
        if(inspect.barrier == BLOCKED){
            this.data_sending_now = false;
            let message = {
                title:`회원권 생성을 완료하지 못했습니다.`,
                comment:`[${inspect.limit_type}] 이용자께서는 회원권을 최대 ${inspect.limit_num}개까지 등록하실 수 있습니다.
                        <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까?</p>`
            };
            show_user_confirm (message, ()=>{
                layer_popup.all_close_layer_popup();
                sideGoPopup("pters_pass_main");
            });

            return false;
        }

        if(this.check_before_send() == false){
            this.data_sending_now = false;
            return false;
        }

        let data = {
                    "ticket_name":this.data.name,
                    "lecture_id_list[]":this.data.lecture_id,
                    "ticket_effective_days":this.data.ticket_effective_days == null ? 0 :this.data.ticket_effective_days,
                    "ticket_reg_count":this.data.count == null ? 0 : this.data.count,
                    "ticket_price":this.data.price == null ? 0 : this.data.price,
                    "ticket_note":this.data.memo,
                    "ticket_week_schedule_enable":this.data.ticket_week_schedule_enable == null ? 99999 : this.data.ticket_week_schedule_enable, //주간 수강 제한 횟수
                    "ticket_day_schedule_enable":this.data.ticket_day_schedule_enable == null ? 99999 : this.data.ticket_day_schedule_enable  //일일 수강 제한 횟수
        };
        
        Ticket_func.create(data, ()=>{
            this.data_sending_now = false;
            // layer_popup.close_layer_popup();
            layer_popup.close_layer_popup();
            ticket_add_popup.clear();
            if(this.callback != undefined){
                this.callback();
            }
            try{
                current_page.init();
            }catch(e){}
            try{
                ticket_list_popup.init();
            }catch(e){}
        }, ()=>{this.data_sending_now = false;});
        // layer_popup.close_layer_popup();
        // ticket_add_popup.clear();
    }

    check_before_send(){
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
}