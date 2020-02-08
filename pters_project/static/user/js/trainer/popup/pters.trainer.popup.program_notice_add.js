class ProgramNotice_add{
    constructor(install_target, callback){
        this.target = {install: install_target, toolbox:'section_program_notice_add_toolbox', content:'section_program_notice_add_content'};
        this.data_sending_now = false;
        this.callback = callback;
        this.form_id = 'id_program_notice_add_form';

        this.data = {
            name:null,
            note:null,
            board_type_cd:[],
            board_type_cd_name:[]
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

    set note(text){
        this.data.note = text;
        this.render_content();
    }

    get note(){
        return this.data.note;
    }

    set board_type(data){
        this.data.board_type_cd = data.board_type_cd;
        this.data.board_type_cd_name = data.board_type_cd_name;
        this.render_content();
    }

    get board_type(){
        return {board_type_cd:this.data.board_type_cd, board_type_cd_name:this.data.board_type_cd_name};
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();program_notice_add_popup.clear();">${CImg.x()}</span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="program_notice_add_popup.send_data();"><span style="color:var(--font-highlight);font-weight: 500;">등록</span></span>`;
        let content =   `<form id="${this.form_id}" onSubmit="return false"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_program_notice_add .wrapper_top').style.border = 0;
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
        let board_type = this.dom_row_board_type_select();
        let name = this.dom_row_program_notice_name_input();
        let note = this.dom_row_program_notice_note_input();

        let html =  '<div class="obj_input_box_full">'+CComponent.dom_tag('게시판 종류')+ board_type+ '</div>' +
                    '<div class="obj_input_box_full">'+CComponent.dom_tag('게시판명') + name+'</div>' +
                    '<div class="obj_input_box_full">'+CComponent.dom_tag('설명') + note + '</div>';

        return html;
    }

    dom_row_toolbox(){
        let title = "새로운 게시판";
        let html = `
        <div class="program_notice_add_upper_box">
            <div style="display:inline-block;width:200px;">
                <span style="font-size:20px;font-weight:bold;letter-spacing: -0.9px;" class="popup_toolbox_text">${title}</span>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_board_type_select(){
        let id = 'input_board_type_select';
        // let title = this.data.board_type_cd.length == 0 ? '게시판 종류' : `<span style="padding:5px;border-radius:4px;">${this.data.board_type_cd_name}</span>`;
        this.data.board_type_cd = PROGRAM_BOARD;
        this.data.board_type_cd_name = PROGRAM_BOARD_TYPE[this.data.board_type_cd];

        let title = `<span style="padding:5px;border-radius:4px;">${this.data.board_type_cd_name}</span>`;
        let icon = NONE;
        let icon_r_visible = SHOW;
        let icon_r_text = '';
        // let style = this.data.board_type_cd.length == 0 ? {"color":"var(--font-inactive)"} : null;
        let style = null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            alert('다른 게시판 종류는 준비중입니다.');
            // let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_COLOR_SELECT, 100, popup_style, null, ()=>{
                // color_select = new BoardTypeSelector('#wrapper_box_color_select', this, 1, (set_data)=>{
                //     this.data.board_type_cd = set_data.board_type_cd;
                //     this.data.board_type_cd_name = set_data.board_type_cd_name;
                //     this.render_content();
                // });
            // });
        });
        return html;
    }

    dom_row_program_notice_name_input(){
        let id = 'input_program_notice_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '게시판명*';
        let icon = CImg.program_notice();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:()\\[\\]\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "+ - _ : ()[] 제외 특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            this.name = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_program_notice_note_input(){
        let id = 'input_program_notice_note';
        let title = this.data.note == null ? '' : this.data.note;
        let placeholder = '설명';
        let icon = CImg.memo();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,:()\\[\\]\\s\\n 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,3000}";
        let pattern_message = "+ - _ : ()[] . , 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_textarea_row(id, title, placeholder, icon, icon_r_visible, icon_r_text, style, (input_data)=>{
            this.note = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    send_data(){
        let auth_inspect = pass_inspector.program_notice_create();
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
        
        let inspect = pass_inspector.program_notice();
        if(inspect.barrier == BLOCKED){
            this.data_sending_now = false;
            let message = {
                            title:`게시판 생성을 완료하지 못하였습니다.`,
                            comment:`[${inspect.limit_type}] 이용자께서는 게시판을 최대 ${inspect.limit_num}개까지 등록하실 수 있습니다.
                                    <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까?</p>`
            }
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
            "board_type_cd":this.data.board_type_cd[0],
            "to_member_type_cd": 'trainee',
            "comment_available": OFF,
            "anonymous_available": OFF,
            "important_flag": OFF,
            "auth_type_cd": AUTH_TYPE_VIEW,
            "push_status": OFF,
            "name":this.data.name,
            "note": this.data.note
        };

        ProgramNotice_func.create(data, (received)=>{
            this.data_sending_now = false;
            try{
                current_page.init();
            }catch(e){}
            try{
                program_notice_list_popup.init();
            }catch(e){}
        }, ()=>{this.data_sending_now = false;});
        layer_popup.close_layer_popup();
        program_notice_add_popup.clear();
    }

    check_before_send(){

        let forms = document.getElementById(`${this.form_id}`);
        update_check_registration_form(forms);
        let error_info = check_registration_form(forms);
        if(error_info != ''){
            show_error_message({title:error_info});
            return false;
        }
    }
}