class Program_view{
    constructor(install_target, external_data){
        this.target = {install: install_target, toolbox:'section_program_view_toolbox', content:'section_program_view_content'};
        this.form_id = 'id_program_view_form';
        this.external_data = external_data;

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
            program_id:null,
            program_name:null,
            program_category:[],
            program_category_code:[],
            program_category_sub:[],
            program_category_sub_code:[],
            program_name_by_user:null
        };

        this.init();
        this.set_initial_data();
    }

    set name(data){
        this.data.program_name = data;
    }

    set category(data){
        this.data.program_category = data.name;
        this.data.program_category_code = data.code;
    }

    set category_sub(data){
        this.data.program_category_sub = data.name;
        this.data.program_category_sub_code = data.code;
    }

    get name(){
        return this.data.program_name;
    }

    get category(){
        return {name:this.data.program_category, code:this.data.program_category_code};
    }

    get category_sub(){
        return {name:this.data.program_category_sub, code:this.data.program_category_sub_code};
    }

    init(){
        this.render();
        func_set_webkit_overflow_scrolling('.wrapper_middle');
    }

    set_initial_data (){
        this.data.program_id = this.external_data.id;
        this.name = this.external_data.name;
        this.category = this.external_data.category;
        this.category_sub = this.external_data.category_sub;

        this.init(); 
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/close_black.png" onclick="layer_popup.close_layer_popup();program_view_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="program_view_popup.upper_right_menu()">완료</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_program_view .wrapper_top').style.border = 0;
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
        // let program_name_input_row = this.dom_row_program_name();
        let program_category_select_row = this.dom_row_program_category();
        let program_category_sub_select_row = this.dom_row_program_category_sub();

        let html =  '<div class="obj_box_full">'+  CComponent.dom_tag('분야') + program_category_select_row + program_category_sub_select_row + '</div>';

        return html;
    }

    dom_row_toolbox(){
        let id = 'program_name_edit';
        let title = this.name == null ? '' : this.name;
        let style = {"font-size":"20px", "font-weight":"bold"};
        let placeholder =  '프로그램명*';
        let icon = undefined;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+\(\)\[\]\>\< 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let sub_html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
        }, pattern, pattern_message, required);

        let html = `
        <div class="program_view_upper_box" style="">
            <div style="display:inline-block;width:320px;">
                <div style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
                    ${sub_html}
                </div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_program_category(){
        let id = 'program_category_select';
        let title = this.category.name.length == 0 ? "분야*" : this.category.name;
        let icon = '/static/common/icon/icon_rectangle_blank.png';
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CATEGORY_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                let multiple_select = 1;
                let upper_category = null;
                category_select = new CategorySelector('#wrapper_box_category_select', this, multiple_select, upper_category, (set_data)=>{
                    if(this.category.code != set_data.code){
                        this.category_sub = {name:[], code:[]};
                    }
                    this.category = set_data;
                    this.render_content();
                });
            });
        });
        return html;
    }

    dom_row_program_category_sub(){
        let id = 'program_category_sub_select';
        let title = this.category_sub.name.length == 0 ? "상세 분야*" : this.category_sub.name;
        let icon = NONE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let multiple_select = 1;
        let upper_category = this.category.code[0];
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, ()=>{
            if(upper_category == undefined){
                show_error_message('상위 분야를 먼저 선택해주세요');
                return false;
            }
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CATEGORY_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                category_select = new CategorySelector('#wrapper_box_category_select', this, multiple_select, upper_category, (set_data)=>{
                    this.category_sub = set_data;
                    this.render_content();
                });
            });
        });
        return html;
    }

    send_data(){
        if(this.check_before_send() == false){
            return false;
        }
        let data = {
                    "class_id":this.data.program_id, 
                    "subject_cd":this.data.program_category_sub_code[0],
                    "subject_detail_nm":this.data.program_name,
                    "start_date":"", "end_date":"", 
                    "class_hour":60, "start_hour_unit":1, "class_member_num":1
        };

        Program_func.update(data, ()=>{
            program_list_popup.init();
            this.clear();
            layer_popup.close_layer_popup();
        });
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
            if(this.data.program_category_code.length==0){
                show_error_message('분야를 선택해주세요.');
                return false;
            }
            if(this.data.program_category_sub_code.length==0){
                show_error_message('상세 분야를 선택해주세요.');
                return false;
            }
            return true;
        }
    }

    upper_right_menu(){
        this.send_data();
    }
}
