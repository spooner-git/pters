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
                lecture_state_cd:[],
                lecture_type_cd:[],
                ticket_effective_days:null,
                count:null,
                price:null,
                memo:null
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

        let html =  '<div class="obj_input_box_full">' + CComponent.dom_tag('수강권명') + name + '</div>' +
                    '<div class="obj_input_box_full">' + CComponent.dom_tag('수업 구성') + lecture + lecture_list + '</div>' +
                    '<div class="obj_input_box_full">' + 
                        CComponent.dom_tag('횟수') + 
                        count + `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>` +
                        CComponent.dom_tag('유효기간') + 
                        period + `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>` +
                        CComponent.dom_tag('가격') + 
                        price + `<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>` +
                    
                    '</div>' +
                    '<div class="obj_input_box_full">' + CComponent.dom_tag('설명') + memo + '</div>';

        // document.getElementById(this.target.content).innerHTML = html;
        return html;
    }

    dom_row_toolbox(){
        let html = `
        <div class="ticket_add_upper_box">
            <div style="display:inline-block;width:200px;">
                <span style="font-size:20px;font-weight:bold;letter-spacing: -0.9px;">새로운 수강권</span>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_ticket_name_input(){
        let id = 'input_ticket_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '수강권명*';
        let icon = CImg.ticket();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = '[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:()\\[\\]\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}';
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
                lecture_select = new LectureSelector('#wrapper_box_lecture_select', this, 999, {'title':'수업'}, (set_data)=>{
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
            let lecture_name = this.data.lecture_name[i];
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
        let placeholder = '횟수';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,4}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let auth_inspect = pass_inspector.ticket_update();
            if(auth_inspect.barrier == BLOCKED){
                let message = `${auth_inspect.limit_type}`;
                this.init();
                show_error_message(message);
                return false;
            }

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
        let title = this.data.price == null ? '' : UnitRobot.numberWithCommas(this.data.price) + unit;
        let placeholder = '가격';
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
                show_error_message(message);
                return false;
            }

            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            let user_input_data = input_data;
            this.price = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_ticket_period_input(){
        let unit = '일';
        let id = 'ticket_ticket_effective_days_view';
        let title = this.data.ticket_effective_days == null ? '' : UnitRobot.numberWithCommas(this.data.ticket_effective_days) + unit;
        let placeholder = '유효 기간';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,4}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let auth_inspect = pass_inspector.ticket_update();
            if(auth_inspect.barrier == BLOCKED){
                let message = `${auth_inspect.limit_type}`;
                this.init();
                show_error_message(message);
                return false;
            }

            if(input_data != '' && input_data != null){
                input_data = Number(input_data);
            }
            let user_input_data = input_data;
            this.period = user_input_data;
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
            show_error_message(message);
            return false;
        }
        
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }

        let inspect = pass_inspector.ticket();
        if(inspect.barrier == BLOCKED){
            // let id = "go_to_shop";
            // let title = "패스 구매";
            // let style = {"display":"inline-block", "background-color":"var(--bg-highlight)", "border-radius":"2px", "margin-top":"15px"};
            // let onclick = ()=>{
            //     layer_popup.all_close_layer_popup();
            //     sideGoPopup("pters_pass_main");
            // };
            // let go_to_shop_button = `<div>${CComponent.button (id, title, style, onclick)}</div>`;

            // show_error_message(`[${inspect.limit_type}] 이용자께서는 수강권을 최대 ${inspect.limit_num}개까지 등록하실 수 있습니다.${go_to_shop_button}`);

            this.data_sending_now = false;
            let message = `[${inspect.limit_type}] 이용자께서는 수강권을 최대 ${inspect.limit_num}개까지 등록하실 수 있습니다.
                            <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까??</p>`;
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
                    "ticket_effective_days":this.data.ticket_effective_days,
                    "ticket_reg_count":this.data.count,
                    "ticket_price":this.data.price,
                    "ticket_note":this.data.memo,
                    "ticket_week_schedule_enable":7, //주간 수강 제한 횟수
                    "ticket_day_schedule_enable":1  //일일 수강 제한 횟수
        };
        
        Ticket_func.create(data, ()=>{
            this.data_sending_now = false;
            // layer_popup.close_layer_popup();
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
        layer_popup.close_layer_popup();
        ticket_add_popup.clear();
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