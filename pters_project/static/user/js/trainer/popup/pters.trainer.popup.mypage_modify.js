class Mypage_modify{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_mypage_modify_toolbox', content:'section_mypage_modify_content'};

        this.data = {
            db_id:null,
            user_id:null,
            name:null,
            phone:null,
            email:null,
            sex:null,
            birth:null,
            phone_is_active:DEACTIVATE,
            photo:'/static/common/icon/icon_account.png',
        };

        this.auth_phone = {
            phone : null,
            request_status : false,
            number_get : null,
            valid_time_count : 180,
            valid_time_count_func : null
        };

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Mypage_func.read((data)=>{
            this.data.db_id = data.trainer_info.member_id;
            this.data.user_id = data.trainer_info.member_user_id;
            this.data.name = data.trainer_info.member_name;
            this.data.email = data.trainer_info.member_email;
            this.data.sex = data.trainer_info.member_sex;
            this.data.birth = data.trainer_info.member_birthday_dt;
            this.data.phone_is_active = data.trainer_info.member_phone_is_active;
            this.auth_phone.phone = data.trainer_info.member_phone;

            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });
        
    }

    clear(){
        setTimeout(()=>{
            this.auth_phone.valid_time_count = 180;
            this.auth_phone.request_status = false;
            clearInterval(this.auth_phone.valid_time_count_func);
            document.querySelector(this.target.install).innerHTML = "";
        }, 1000);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();mypage_modify_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="mypage_modify_popup.send_data()"><span style="color:var(--font-highlight);font-weight: 500;">등록</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_mypage_modify .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    render_phone_auth_count(){
        // let auth_phone = this.dom_row_my_phone_auth_number() + this.dom_button_auth_confirm_phone();
        // if(this.auth_phone.request_status == false){
        //     // auth_phone = "";
        // }
        let minutes = parseInt(this.auth_phone.valid_time_count/60);
        let seconds = parseInt(this.auth_phone.valid_time_count%60);
        if(seconds<10){
            seconds = '0'+seconds;
        }
        $('#activation_timer').text(minutes+':'+seconds);
    }

    dom_assembly_toolbox(){
        return this.dom_row_toolbox();
    }
    
    dom_assembly_content(){
        let my_name = this.dom_row_my_name();
        let my_phone = '<div style="height:60px">' + this.dom_row_my_phone() + this.dom_button_auth_request_phone() + '</div>';
        let auth_phone = '<div id="auth_phone_number_input" style="height:60px">' + this.dom_row_my_phone_auth_number() + this.dom_button_auth_confirm_phone() +'</div>';
        // let my_phone = '';
        // if(this.auth_phone.phone_is_active == DEACTIVATE){
        //     my_phone = '<div style="height:60px">' + this.dom_row_my_phone() + this.dom_button_auth_request_phone() + '</div>';
        // }else{
        //     my_phone = '<div style="height:60px">' + this.dom_row_my_phone() +
        //                 '<div id="button_auth_request_my_phone" ' +
        //                 'style="background-color:#fe4e65; color:#ffffff; text-align:center;cursor:pointer;padding:3px 8px;' +
        //                 '       float:right; border:1px solid #fe4e65;border-radius:4px;font-size:13px;height:50px;' +
        //                 '       line-height:50px;width:60px;padding:0;box-sizing:border-box;vertical-align:top">' +
        //                 '인증완료</div>' +
        //                 '</div>';
        // }
        //
        // let auth_phone = '';
        // if(this.auth_phone.phone_is_active == DEACTIVATE){
        //     auth_phone = '<div id="auth_phone_number_input" style="height:60px">' + this.dom_row_my_phone_auth_number() + this.dom_button_auth_confirm_phone() +'</div>';
        // }
        let my_email = this.dom_row_my_email();
        if(this.auth_phone.request_status == false){
            // auth_phone = "";
        }
        

        let tag_my_name = CComponent.dom_tag("이름", {"color":"var(--font-sub-normal)", "padding":"8px 0", "font-weight":"bold"});
        let tag_my_phone = CComponent.dom_tag("휴대폰 번호", {"color":"var(--font-sub-normal)", "padding":"8px 0", "font-weight":"bold"});
        let tag_my_email = CComponent.dom_tag("이메일 주소", {"color":"var(--font-sub-normal)", "padding":"8px 0", "font-weight":"bold"});

        let html =  '<section id="basic_info_wrap">'+ 
                        tag_my_name + my_name + 
                        tag_my_phone + my_phone + auth_phone + 
                        tag_my_email + my_email + '</section>';

        return html;
    }


    dom_row_toolbox(){
        let title = "프로필 수정";
        let html = `
        <div class="mypage_modify_upper_box" style="">
            <div style="display:inline-block;">
                <span style="display:inline-block;font-size:23px;font-weight:bold">
                    ${title}
                </span>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_my_name(){
        let id = 'modify_my_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '이름';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"border":"var(--border-article-dark)", "border-radius":"4px", "padding":"12px", "margin-bottom":"10px"};
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,@一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = ". , + - _ @ 제외 특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            this.data.name = input_data;
            this.render_content();
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_my_phone(){
        let id = 'modify_my_phone';
        let title = this.auth_phone.phone == null ? '' : this.auth_phone.phone;
        let placeholder = '휴대폰 번호';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"border":"var(--border-article-dark)", "border-radius":"4px", "padding":"12px", "margin-bottom":"10px", "display":"inline-block", "width":"180px"};
        let input_disabled = this.data_from_external == null ? false : true;
        let pattern = "[0-9]{10,11}";
        let pattern_message = "";
        let required = "required";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            this.auth_phone.phone = input_data;
            this.render_content();
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_my_phone_auth_number(){
        let id = 'my_auth_number_phone';
        let title = this.auth_phone.number_get == null ? '' : this.auth_phone.number_get;
        let minutes = parseInt(this.auth_phone.valid_time_count/60);
        let seconds = parseInt(this.auth_phone.valid_time_count%60);
        if(seconds<10){
            seconds = '0'+seconds;
        }
        let placeholder = '인증 번호 ';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = minutes + ':' + seconds;
        let style = {"padding":"12px", "width":"70%"};
        let input_disabled = this.data_from_external == null ? false : true;
        let pattern = "[0-9]{1,5}";
        let pattern_message = "";
        let required = "required";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            this.auth_phone.number_get = input_data;
            this.render_content();
        }, pattern, pattern_message, required);
        html = '<div style="border:var(--border-article-dark); display:inline-block; width:200px;position:relative">'
                    + html
                    + '<div id="activation_timer" style="position:absolute;top:50%;transform:translateY(-50%);right:0;display: inline-block; margin-right: 12px; text-align:right; width:20%;color:var(--font-sub-normal)">'+icon_r_text+'</div>' +
               '</div>';
        return html;
    }

    dom_button_auth_request_phone(){
        let id = "auth_request_my_phone";
        let title = "인증";
        let style = {"float":"right", "border":"var(--border-article-dark)", "border-radius":"4px", "font-size":"13px", "height":"50px", "line-height":"50px", "width":"60px", "padding":"0", "box-sizing":"border-box", "vertical-align":"top"};
        let onclick = ()=>{
            let data = {'token':'', 'phone':this.auth_phone.phone};
            Phone_auth_func.request_auth_number(data, (jsondata)=>{
                    if(jsondata.messageArray.length > 0){
                        show_error_message({title:jsondata.messageArray});
                        return false;
                    }
                    show_error_message({title:"인증번호를 확인해주세요."});
                    this.auth_phone.valid_time_count = 180;
                    this.auth_phone.request_status = true;
                    this.render_content();

                    this.auth_phone.valid_time_count_func = setInterval(()=>{
                        if(this.auth_phone.valid_time_count == 0){
                            this.auth_phone.request_status = false;
                            clearInterval(this.auth_phone.valid_time_count_func);
                            this.render_content();
                            return false;
                        }
                        this.auth_phone.valid_time_count --;
                        this.render_phone_auth_count();
                    }, 1000);
                }
            );
        };
        let html = CComponent.button (id, title, style, onclick);
        return html;
    }

    dom_button_auth_confirm_phone(){
        let id = "auth_confirm_my_phone";
        let title = "확인";
        let style = {"float":"right", "border":"var(--border-article-dark)", "border-radius":"4px", "font-size":"13px", "height":"50px", "line-height":"50px", "width":"60px", "padding":"0", "box-sizing":"border-box", "vertical-align":"top", "color":"var(--font-highlight)"};
        let onclick = ()=>{
            let data = {'user_activation_code': this.auth_phone.number_get, 'phone': this.auth_phone.phone};
            Phone_auth_func.send_auth_number(data, (data)=>{
                if(data.messageArray.length > 0){
                    show_error_message({title:data.messageArray});
                }else{
                    clearInterval(this.auth_phone.valid_time_count_func);
                    $('#activation_timer').text('');
                    show_error_message({title:"휴대폰 번호가 변경되었습니다"});
                }
            });
        };
        let html = CComponent.button (id, title, style, onclick);
        return html;
    }

    dom_row_my_email(){
        let id = 'modify_my_email';
        let title = this.data.email == null ? '' : this.data.email;
        let placeholder = '이메일';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"border":"var(--border-article-dark)", "border-radius":"4px", "padding":"12px", "margin-bottom":"10px"};
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9@.一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            this.data.email = input_data;
            this.render_content();
        }, pattern, pattern_message, required);
        return html;
    }


    send_data(){
        if(this.check_before_send() == false){
            return false;
        }

        let data = {
            "first_name":this.data.name, "contents":null, "country":null, "address":null, "sex":null, "birthday":null, "email":this.data.email
        };

        Mypage_func.update(data, ()=>{
            try{
                current_page.init();
            }catch(e){}
            try{
                pc_top_toolbar_user_info_update();
                mypage_popup.set_initial_data();
            }catch(e){}

            layer_popup.close_layer_popup();
        });
    }

    check_before_send(){
        // let forms = document.getElementById(`${this.form_id}`);
        // update_check_registration_form(forms);

        // let error_info = check_registration_form(forms);

        // if(error_info != ''){
        //     show_error_message({title:error_info});
        //     return false;
        // }
        // else{
            if(this.data.name == null){
                show_error_message({title:'이름을 입력 해주세요.'});
                return false;
            }
            // if(this.auth_phone.phone == null){
            //     show_error_message({title:'휴대폰 번호를 입력 해주세요.'});
            //     return false;
            // }
            // if(this.data.email == null){
            //     show_error_message({title:'이메일을 선택 해주세요.'});
            //     return false;
            // }
            return true;
        // }
    }

    upper_right_menu(){
        this.send_data();
    }
}

