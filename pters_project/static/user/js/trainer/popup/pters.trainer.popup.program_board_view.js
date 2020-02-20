class ProgramBoard_view{
    constructor(install_target, program_board_id, instance){
        this.target = {install: install_target, toolbox:'section_program_board_view_toolbox', content:'section_program_board_view_content'};
        this.instance = instance;
        this.program_board_id = program_board_id;
        this.form_id = 'id_program_board_view_form';
        this.if_user_changed_any_information = false;

        this.data = {
            name:null,
            note:null,
            board_type_cd:[],
            board_type_cd_name:[],
            use:ON
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
        this.set_initial_data();
    }

    set_initial_data (){
        ProgramBoard_func.read({"program_board_id": this.program_board_id}, (data)=>{
            this.data.name = data.program_board_name;
            this.data.note = data.program_board_note;
            this.data.board_type_cd = data.program_board_type_cd;
            this.data.board_type_cd_name = PROGRAM_BOARD_TYPE[this.data.program_board_type_cd];
            this.data.use = data.program_board_use;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="program_board_view_popup.upper_left_menu();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="program_board_view_popup.upper_right_menu();">${CImg.more()}</span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_program_board_view .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
        document.querySelector(`${this.target.install} .wrapper_top`).innerHTML = PopupBase.wrapper_top(this.dom_wrapper_top().left, this.dom_wrapper_top().center, this.dom_wrapper_top().right);
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    dom_wrapper_top(){
        let top_left = `<span class="icon_left" onclick="program_board_view_popup.upper_left_menu();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="program_board_view_popup.upper_right_menu();">${CImg.more()}</span>`;
        return {left: top_left, center:top_center, right:top_right};
    }

    dom_assembly_toolbox(){
        return this.dom_row_toolbox();
    }
    
    dom_assembly_content(){
        let board_type = this.dom_row_board_type_view();
        let note = this.dom_row_program_board_note_view();

        let html =  '<div class="obj_input_box_full">'+CComponent.dom_tag('게시판 종류')+ board_type+ '</div>' +
                    '<div class="obj_input_box_full">'+CComponent.dom_tag('설명') + note + '</div>';

        return html;
    }

    dom_row_toolbox(){
        
        let id = 'program_board_name_view';
        let title = this.data.name == null ? '' : this.data.name;
        let style = {"font-size":"20px", "font-weight":"bold"};
        if(this.data.use == OFF){
            style["color"] = "var(--font-sub-normal)";
        }
        let placeholder =  '게시판명*';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+:()\\[\\]\\s 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "+ - _ :()[] 제외 특수문자는 입력 불가";
        let required = "required";
        let sub_html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let auth_inspect = pass_inspector.program_board_update();
            if(auth_inspect.barrier == BLOCKED){
                let message = `${auth_inspect.limit_type}`;
                this.init();
                show_error_message({title:message});
                return false;
            }

            let user_input_data = input_data;
            this.name = user_input_data;
            this.send_data();
        }, pattern, pattern_message, required);
        let html = `
        <div class="program_board_view_upper_box">
            <div style="display:inline-block;width:100%;">
                <span style="position:absolute;top:0;font-size: 12px;display:block;color: var(--font-sub-normal);font-weight: 500;">게시판</span>
                ${sub_html}
            </div>
            <span style="display:none;">${title}</span>
        </div>
        `;
        return html;
    }

    dom_row_board_type_view(){
        let id = 'input_board_type_view';
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
            //this.if_user_changed_any_information = true;
        });
        return html;
    }
    dom_row_program_board_note_view(){
        let id = 'input_program_board_note';
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
            this.if_user_changed_any_information = true;
        }, pattern, pattern_message, required);
        return html;
    }



    send_data(){
        if(this.check_before_send() == false){
            return false;
        }
        let data = {
            "program_board_id":this.program_board_id,
            "board_type_cd":this.data.board_type_cd,
            "name":this.data.name,
            "note":this.data.note
        };

        ProgramBoard_func.update(data, ()=>{
            this.set_initial_data();
            try{
                current_page.init();
            }catch(e){}
            try{
                program_board_list_popup.init();
            }catch(e){}
        });
    }

    upper_left_menu(){
        if(this.if_user_changed_any_information == true){
            let inspect = pass_inspector.program_board_update();
            if(inspect.barrier == BLOCKED){
                let message = `${inspect.limit_type}`;
                layer_popup.close_layer_popup();
                this.clear();
                show_error_message({title:message});
                return false;
            }

            let user_option = {
                confirm:{text:"변경사항 적용", callback:()=>{this.send_data();layer_popup.close_layer_popup();layer_popup.close_layer_popup();this.clear();}},
                cancel:{text:"아무것도 변경하지 않음", callback:()=>{ layer_popup.close_layer_popup();layer_popup.close_layer_popup();this.clear();}}
            };
            let options_padding_top_bottom = 16;
            // let button_height = 8 + 8 + 52;
            let button_height = 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        }else{
            layer_popup.close_layer_popup();this.clear();
        }
    }

    upper_right_menu(){
        let user_option = {
            activate:{text:"활성화", callback:()=>{
                    let auth_inspect = pass_inspector.program_board_update();
                    if(auth_inspect.barrier == BLOCKED){
                        let message = `${auth_inspect.limit_type}`;
                        this.init();
                        show_error_message({title:message});
                        return false;
                    }
                    let message = {
                                    title:`"${this.data.name}" 게시판을 활성화 하시겠습니까?`,
                                    comment:'활성화 탭에서 다시 확인할 수 있습니다.'
                    };
                    show_user_confirm(message, ()=>{
                        let inspect = pass_inspector.program_board();
                        if(inspect.barrier == BLOCKED){

                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            let message = {
                                title:'게시판을 활성화 하지 못했습니다.',
                                comment:`[${inspect.limit_type}] 이용자께서는 진행중 게시판을 최대 ${inspect.limit_num}개까지 등록하실 수 있습니다. 
                                        <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까?</p>`
                            };
                            show_user_confirm (message, ()=>{
                                layer_popup.all_close_layer_popup();
                                sideGoPopup("pters_pass_main");
                            });
                                                
                            
                            return false;
                        }
                        ProgramBoard_func.update({"program_board_id":this.program_board_id, "use":ON}, ()=>{
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
                    let auth_inspect = pass_inspector.program_board_update();
                    if(auth_inspect.barrier == BLOCKED){
                        let message = `${auth_inspect.limit_type}`;
                        this.init();
                        show_error_message({title:message});
                        return false;
                    }
                    let message = {
                        title:`"${this.data.name}" <br>게시판을 비활성화 하시겠습니까?`,
                        comment:`<img src="/static/common/icon/icon_stopmark.png" style="width:25px;"><br>
                                <span style="color:var(--font-highlight); font-size:12px;">
                                이 게시판에 게시글을 등록 할 수 없게 됩니다.<br>
                                회원들이 더 이상 게시글을 확인할수 없습니다.</span>`
                    }
                    show_user_confirm(message, ()=>{
                        ProgramBoard_func.update({"program_board_id":this.program_board_id, "use":OFF}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                program_board_list_popup.init();
                            }catch(e){}
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            layer_popup.close_layer_popup(); //option 팝업 닫기
                            layer_popup.close_layer_popup(); //수업 정보 팝업 닫기
                        });
                        
                    });
                }   
            },
            delete:{text:"삭제", callback:()=>{
                    let auth_inspect = pass_inspector.program_board_delete();
                    if(auth_inspect.barrier == BLOCKED){
                        let message = `${auth_inspect.limit_type}`;
                        this.init();
                        show_error_message({title:message});
                        return false;
                    }
                    let message = {
                        title:`"${this.data.name}" <br> 게시판을 영구 삭제 하시겠습니까?`,
                        comment:`데이터를 복구할 수 없습니다.<br><br>
                                <img src="/static/common/icon/icon_stopmark.png" style="width:25px;"><br>
                                <span style="color:var(--font-highlight); font-size:12px;">이 게시판에 등록된 게시글이 삭제됩니다.</span>`
                    }
                    show_user_confirm(message, ()=>{
                        ProgramBoard_func.delete({"program_board_id":this.program_board_id}, ()=>{
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                program_board_list_popup.init();
                            }catch(e){}
                            layer_popup.close_layer_popup(); //confirm팝업 닫기
                            layer_popup.close_layer_popup(); //option 팝업 닫기
                            layer_popup.close_layer_popup(); //게시판 정보 팝업 닫기
                        });
                    });
                }
            }
        };

        if(this.data.program_board_state == STATE_IN_PROGRESS){
            delete user_option.activate;
            delete user_option.delete;
        }else if(this.data.program_board_state == STATE_END_PROGRESS){
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
        let member_ids = Object.keys(members); //data_original과 data의 program_board_id들을 중복을 제거하고 합친 결과

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

        if(error_info != ''){
            show_error_message({title:error_info});
            return false;
        }
        else{
            if(this.data.capacity <= 1 && this.data.program_board_type_cd != program_board_TYPE_ONE_TO_ONE){
                show_error_message({title:'정원은 2명보다 크게 설정해주세요.'});
                return false;
            }
            return true;
        }
    }

}
