class Member_ticket_modify{
    constructor(install_target, data, instance){
        this.target = {install: install_target, toolbox:'section_member_ticket_modify_toolbox', content:'section_member_ticket_modify_content'};
        this.instance = instance;
        this.external_data = data;
        this.form_id = 'id_member_ticket_modify_form';

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
            member_name:null,
            member_ticket_name: null,
            member_ticket_id: null,
            start_date: null,
            end_date: null,
            reg_count: null,
            price:null,
            status:null
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
       
        this.init();
        // this.set_initial_data();
    }

    init(){
        // this.render();
        this.set_initial_data();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    set_initial_data (){
        this.data = this.external_data;
        this.render();
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();member_ticket_modify.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">${this.data.member_name}님의 수강권</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="member_ticket_modify.send_data()">완료</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_member_ticket_modify .wrapper_top').style.border = 0;
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    dom_assembly_toolbox(){
        // return this.dom_row_toolbox();
        return "";
    }
    
    dom_assembly_content(){

        let status = this.dom_row_status_input();
        let start  = this.dom_row_start_input();
        let end    = this.dom_row_end_input();
        let count  = this.dom_row_count_input();
        let price  = this.dom_row_price_input();

        let html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('수강권') + status + 
                    `<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>`
                + CComponent.dom_tag('시작일') + start +
                    `<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>`
                + CComponent.dom_tag('진행 기간') + end + 
                    `<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>`
                + CComponent.dom_tag('횟수') + count +
                    `<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>`
                + CComponent.dom_tag('가격') + price +
            '</div>';

        return html;
    }

    dom_row_toolbox(){
        let html = "";
        return html;
    }

    dom_row_status_input(){
        let id = 'member_ticket_status_modify';
        let title = this.data.member_ticket_name == null ||this.data.member_ticket_name == 'None' ? '수강권명' : this.data.member_ticket_name;
        let icon = '/static/common/icon/icon_ticket_black.png';
        let icon_r_visible = SHOW;
        let icon_r_text = `상태 (${TICKET_STATUS[this.data.status]})`;
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let user_option = {
                finish:{text:"종료", callback:()=>{
                    Member_func.ticket_status({"member_ticket_id":this.data.member_ticket_id, "state_cd":"PE", "refund_price":"", "refund_date":""}, ()=>{
                        this.data.status = "PE";
                        this.render_content();
                        try{
                            member_ticket_modify.init();
                        }catch(e){
                            console.log(e);
                        }
                        member.init();
                    });
                    layer_popup.close_layer_popup();}
                },
                resume:{text:"재개", callback:()=>{
                    Member_func.ticket_status({"member_ticket_id":this.data.member_ticket_id, "state_cd":"IP", "refund_price":"", "refund_date":""}, ()=>{
                        this.data.status = "IP";
                        try{
                            member_ticket_modify.init();
                        }catch(e){
                            console.log(e);
                        }
                        this.render_content();
                    });
                    layer_popup.close_layer_popup();}
                },
                refund:{text:"환불", callback:()=>{
                    layer_popup.close_layer_popup();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_TICKET_REFUND, 100, POPUP_FROM_RIGHT, null, ()=>{
                        let external_data = {"member_ticket_id":this.data.member_ticket_id, "member_ticket_name":this.data.member_ticket_name, "member_ticket_price":this.data.price};
                        member_ticket_refund = new Member_ticket_refund('.popup_member_ticket_refund', external_data, 'member_ticket_refund');
                    });}
                },
                delete:{text:"삭제", callback:()=>{
                    Member_func.ticket_delete({"member_ticket_id":this.data.member_ticket_id}, ()=>{
                        try{
                            member_ticket_modify.init();
                        }catch(e){
                            console.log(e);
                        }
                        layer_popup.close_layer_popup();
                    });
                    layer_popup.close_layer_popup();}
                }
            };

            if(this.data.status == "IP"){
                delete user_option.resume;
                delete user_option.delete;
            }else{
                delete user_option.refund;
                delete user_option.finish;
            }

            let options_padding_top_bottom = 16;
            let button_height = 8 + 8 + 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });
        return html;
    }

    dom_row_start_input(){
        let id = 'member_ticket_start_modify';
        let title = this.data.start_date == null ||this.data.start_date == 'None' ? '수강권 시작일' : this.data.start_date.replace(/-/gi, '.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*305/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.start_date.split('-')[0]; 
                let month = this.data.start_date.split('-')[1];
                let date = this.data.start_date.split('-')[2];
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'일자', data:{year:year, month:month, date:date}, callback_when_set: (object)=>{ 
                    this.data.start_date = `${object.data.year}-${object.data.month}-${object.data.date}`;
                }});
            });
        });
        return html;
    }

    dom_row_end_input(){
        let id = 'member_ticket_end_modify';
        let title = this.data.end_date == null ||this.data.end_date == 'None' ? '수강권 종료일' : this.data.end_date.replace(/-/gi, '.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*305/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.end_date.split('-')[0]; 
                let month = this.data.end_date.split('-')[1];
                let date = this.data.end_date.split('-')[2];
                
                date_selector = new DatePickerSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'일자', data:{year:year, month:month, date:date}, callback_when_set: (object)=>{ 
                    this.data.end_date = `${object.data.year}-${object.data.month}-${object.data.date}`;
                }});
            });
        });
        return html;
    }

    dom_row_count_input(){
        let unit = '';
        let id = 'member_ticket_count_modify';
        let title = this.data.reg_count == null || this.data.reg_count == 'None' ? '' : this.data.reg_count;
        let placeholder = '등록 횟수';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text;
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,15}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.data.reg_count = user_input_data;

        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_price_input(){
        let unit = '';
        let id = 'member_ticket_price_modify';
        let title = this.data.price == null || this.data.price == 'None' ? '' : this.data.price;
        let placeholder = '가격';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text;
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{0,15}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.data.price = user_input_data;

        }, pattern, pattern_message, required);
        return html;
    }

    send_data(){
        if(this.check_before_send() == false){
            return false;
        }
        let data = {"member_ticket_id":this.data.member_ticket_id, "note":"", "start_date":this.data.start_date, "end_date":this.data.end_date, 
                    "price":this.data.price, "refund_price":"", "refund_date":"", "member_ticket_reg_count":this.data.reg_count};

        Member_func.ticket_update(data, ()=>{
            this.set_initial_data();
            member.init();
        });
    }

    upper_right_menu(){
        
    }

    check_before_send(){
        let forms = document.getElementById(`${this.form_id}`);
        update_check_registration_form(forms);
        let error_info = check_registration_form(forms);
        if(error_info != ''){
            show_error_message(error_info);
            return false;
        }
        else{
            return true;
        }
    }
}