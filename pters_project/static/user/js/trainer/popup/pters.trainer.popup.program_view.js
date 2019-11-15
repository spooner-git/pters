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
            program_name_by_user:null,
            program_selected:null
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
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    set_initial_data (){
        this.data.program_id = this.external_data.id;
        this.name = this.external_data.name;
        this.category = this.external_data.category;
        this.category_sub = this.external_data.category_sub;
        this.data.program_selected = this.external_data.selected;

        this.init(); 
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="program_view_popup.send_data();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_delete_black.png" class="obj_icon_basic" onclick="program_view_popup.upper_right_menu();"></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_program_view .wrapper_top').style.border = 0;
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
        // let program_name_input_row = this.dom_row_program_name();
        let program_category_select_row = this.dom_row_program_category();
        let program_category_sub_select_row = this.dom_row_program_category_sub();

        let html =  '<div class="obj_box_full">'+  CComponent.dom_tag('분야') + program_category_select_row + program_category_sub_select_row + '</div>';

        return html;
    }

    dom_row_toolbox(){
        let id = 'program_name_edit';
        let title = this.name == null ? '' : this.name;
        let style = {"font-size":"20px", "font-weight":"bold", "padding":"0"};
        let placeholder =  '프로그램명*';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+()\\[\\].,\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "( ) + - _ . ,제외 특수문자는 입력 불가";
        let required = "";
        let sub_html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
        }, pattern, pattern_message, required);

        let html = `
        <div class="program_view_upper_box" style="">
            <div style="display:inline-block;">
                <div style="display:inline-block;font-size:23px;font-weight:bold">
                    ${sub_html}
                </div>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_program_category(){
        let id = 'program_category_select';
        let title = this.category.name.length == 0 ? "분야*" : this.category.name;
        let icon = NONE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CATEGORY_SELECT, 100, popup_style, null, ()=>{
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
        let style = null;
        let multiple_select = 1;
        let upper_category = this.category.code[0];
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            if(upper_category == undefined){
                show_error_message('상위 분야를 먼저 선택해주세요');
                return false;
            }
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CATEGORY_SELECT, 100, popup_style, null, ()=>{
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
            try{
                current_page.init();
            }catch(e){};
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
        if(this.data.program_selected == PROGRAM_SELECTED){
            show_error_message('선택되어 있는 프로그램은 삭제할 수 없습니다.<br>다른 프로그램으로 이동 후 삭제가 가능합니다.')
            return false;
        } 
        show_user_confirm(`"${this.data.program_name}" 프로그램을 삭제 하시겠습니까? <br> 모든 정보가 삭제되며 복구할 수 없습니다.`, ()=>{
            layer_popup.close_layer_popup(); // 확인 팝업 닫기
            Program_func.delete({"class_id":this.data.program_id}, ()=>{
                program_list_popup.init();
                layer_popup.close_layer_popup(); // 프로그램 정보 팝업 닫기 -> 즉, 프로그램 리스트 팝업으로 나가기
            });
        });

        // let user_option = {
        //     delete:{text:"프로그램 삭제", callback:()=>{
        //             if(this.data.program_selected == PROGRAM_SELECTED){
        //                 show_error_message('선택되어 있는 프로그램은 삭제할 수 없습니다.<br>다른 프로그램으로 이동 후 삭제가 가능합니다.')
        //                 return false;
        //             } 
        //             show_user_confirm(`"${this.data.program_name}" 프로그램을 삭제 하시겠습니까? <br> 모든 정보가 삭제되며 복구할 수 없습니다.`, ()=>{
        //                 layer_popup.close_layer_popup(); // 옵션 셀렉터 팝업 닫기
        //                 layer_popup.close_layer_popup(); // 확인 팝업 닫기
        //                 Program_func.delete({"class_id":this.data.program_id}, ()=>{
        //                     program_list_popup.init();
        //                     layer_popup.close_layer_popup(); // 프로그램 정보 팝업 닫기 -> 즉, 프로그램 리스트 팝업으로 나가기
        //                 });
        //             });
        //         }
        //     }
        // };
        // let options_padding_top_bottom = 16;
        // let button_height = 8 + 8 + 52;
        // let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
        //     option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        // });
    }
}
