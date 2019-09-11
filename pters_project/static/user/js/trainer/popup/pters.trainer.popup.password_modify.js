class Password_modify{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_password_modify_toolbox', content:'section_password_modify_content'};

        this.data = {
            old:null,
            new:null,
            new_re:null,
        };

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        // this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();password_modify_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="password_modify_popup.send_data()">완료</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_password_modify .wrapper_top').style.border = 0;
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
        let password = this.dom_row_password();
        let new_password = this.dom_row_new_password();
        let new_password_confirm = this.dom_row_new_password_confirm();

        let tag_password = CComponent.dom_tag("기존 비밀번호", {"color":"#858282", "padding":"8px 0", "font-weight":"bold"});
        let tag_new_password = CComponent.dom_tag("새로운 비밀번호", {"color":"#858282", "padding":"8px 0", "font-weight":"bold"});
        let tag_new_password_confirm = CComponent.dom_tag("새로운 비밀번호 확인", {"color":"#858282", "padding":"8px 0", "font-weight":"bold"});

        let html =  '<section id="basic_info_wrap">'+ 
                        tag_password + password + 
                        tag_new_password + new_password + 
                        tag_new_password_confirm + new_password_confirm + 
                    '</section>';

        return html;
    }


    dom_row_toolbox(){
        let title = "비밀번호 변경";
        let html = `
        <div class="password_modify_upper_box" style="">
            <div style="display:inline-block;width:320px;">
                <div style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
                    ${title}
                </div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_password(){
        let id = 'old_password';
        let title = this.data.old == null ? '' : this.data.old;
        let placeholder = '기존 비밀번호';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"border":"1px solid #d6d2d2", "border-radius":"4px", "padding":"12px", "margin-bottom":"10px"};
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_password_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            this.data.old = input_data;
            if(this.check_before_send("input") == false){
                this.data.old = null;
            }
            this.render_content();
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_new_password(){
        let id = 'new_password';
        let title = this.data.new == null ? '' : this.data.new;
        let placeholder = '새로운 비밀번호';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"border":"1px solid #d6d2d2", "border-radius":"4px", "padding":"12px", "margin-bottom":"10px"};
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_password_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            this.data.new = input_data;
            if(this.check_before_send("input") == false){
                this.data.new = null;
            }
            this.render_content();
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_new_password_confirm(){
        let id = 'new_password_confirm';
        let title = this.data.new_re == null ? '' : this.data.new_re;
        let placeholder = '새로운 비밀번호 확인';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"border":"1px solid #d6d2d2", "border-radius":"4px", "padding":"12px", "margin-bottom":"10px"};
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_password_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            this.data.new_re = input_data;
            if(this.check_before_send("input") == false){
                this.data.new_re = null;
            }
            this.render_content();
        }, pattern, pattern_message, required);
        return html;
    }


    send_data(){
        if(this.check_before_send("send") == false){
            return false;
        }

        alert("비번 바꾸기 요청")

        // let data = {
        //     "first_name":this.data.name, "phone":this.data.phone, "contents":null, "country":null, "address":null, "sex":null, "birthday":null
        // };

        // password_func.update(data, ()=>{
        //     this.set_initial_data();
        //     password_popup.set_initial_data();
        //     // show_error_message('변경 내용이 저장되었습니다.');
        //     layer_popup.close_layer_popup();
        //     // this.render_content();
        // });
    }

    check_before_send(inspect_type){
        // let forms = document.getElementById(`${this.form_id}`);
        // update_check_registration_form(forms);

        // let error_info = check_registration_form(forms);

        // if(error_info != ''){
        //     show_error_message(error_info);
        //     return false;
        // }
        // else{
            let self = this;
            function send(){
                if(self.data.old == null){
                    show_error_message('기존 비밀번호를 입력 해주세요.');
                    return false;
                }
                if(self.data.new == null){
                    show_error_message('새로운 비밀번호를 입력 해주세요.');
                    return false;
                }
                if(self.data.new_re == null){
                    show_error_message('새로운 비밀번호 확인을 입력 해주세요.');
                    return false;
                }
            }
            function input(){
                if(self.data.new_re != self.data.new && self.data.new_re != null){
                    show_error_message('새로운 비밀번호와 새로운 비밀번호 확인이 맞지 않습니다.');
                    return false;
                }
                if(self.data.new == self.data.old){
                    show_error_message('새로운 비밀번호는 기존 비밀번호와 같을 수 없습니다.');
                    return false;
                }
            }
            
            switch(inspect_type){
                case "all":
                    let send_a = send();
                    let input_a = input();
                    if(send_a == false || input_a == false){
                        return false;
                    }
                break;
                
                case "send":
                    let send_b = send();
                    if(send_b == false){
                        return false;
                    }
                break;

                case "input":
                    let input_c = input();
                    if(input_c == false){
                        return false;
                    }
                break;
            }
            
            return true;
        // }
    }

    upper_right_menu(){
        this.send_data();
    }
}

