class Mypage{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_mypage_toolbox', content:'section_mypage_content'};

        this.data = {
            db_id:null,
            user_id:null,
            name:null,
            phone:null,
            email:null,
            sex:null,
            birth:null,
            photo:'/static/common/icon/icon_account.png'
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
            this.data.phone = data.trainer_info.member_phone;
            this.data.email = data.trainer_info.member_email;
            this.data.sex = data.trainer_info.member_sex;
            this.data.birth = data.trainer_info.member_birthday_dt;
            this.data.photo = data.trainer_info.member_profile_url;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });
        
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();mypage_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>${this.data.name == null ? '' : this.data.name}님의 프로필</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_mypage .wrapper_top').style.border = 0;
        // PopupBase.top_menu_effect(this.target.install);
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
        let my_id = this.dom_row_my_id();
        let my_name = this.dom_row_my_name();
        let my_phone = this.dom_row_my_phone();
        let my_email = this.dom_row_my_email();
        let my_pass = this.dom_row_my_pass();
        let profile_change = this.dom_row_profile_change();
        let password_change = this.dom_row_password_change();
        let leave_pters = this.dom_row_leave_pters();
        let logout = this.dom_row_logout();


        let html =  '<section id="basic_info_wrap">'+ my_id + my_name + my_phone + my_email + '</section>' + 
                    '<section id="pass_info_wrap">'+ my_pass + '</section>' + 
                    '<section id="edit_info_wrap">'+ profile_change + password_change + leave_pters + logout + '</section>';


        return html;
    }

    dom_row_toolbox(){
        let title = `<img src=${this.data.photo == null ? '/static/common/icon/icon_account.png' : this.data.photo} style='width:100%;border-radius:50%'>`;
        let html = `
        <div class="mypage_upper_box" style="text-align:center;">
            <div style="display:inline-block;">
                <div class="photo_wrap" onclick="mypage_popup.event_edit_photo();">
                    ${title}
                </div>
                <span style="display:none;">${this.data.name == null ? '나의 프로필' : this.data.name}님의 프로필</span>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_my_id(){
        let id = "my_id";
        let title = "아이디";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = this.data.user_id;
        let style = null;
        let onclick = ()=>{

        };

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_my_name(){
        let id = "my_name";
        let title = "이름";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = this.data.name;
        let style = null;
        let onclick = ()=>{

        };

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_my_phone(){
        let id = "my_phone";
        let title = "휴대폰 번호";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = this.data.phone;
        let style = null;
        let onclick = ()=>{

        };

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_my_email(){
        let id = "my_email";
        let title = "이메일 주소";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = this.data.email;
        let style = null;
        let onclick = ()=>{

        };

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_my_pass(){
        let id = "my_pass";
        let title = "PTERS 패스";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = `${pass_inspector.data.auth_plan_create.limit_type}`;
        let style = null;
        let onclick = ()=>{
            sideGoPopup('pters_pass_main');
        };

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_profile_change(){
        let id = "profile_change";
        let title = "프로필 수정";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let onclick = ()=>{
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MYPAGE_MODIFY, 100, popup_style, null, ()=>{
                mypage_modify_popup = new Mypage_modify('.popup_mypage_modify', 'mypage_modify_popup');});
        };

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_password_change(){
        let id = "password_change";
        let title = "비밀번호 변경";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let onclick = ()=>{
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PASSWORD_MODIFY, 100, popup_style, null, ()=>{
                password_modify_popup = new Password_modify('.popup_password_modify', 'password_modify_popup');});
        };

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_leave_pters(){
        let id = "leave_pters";
        let title = "회원 탈퇴";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let onclick = ()=>{
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LEAVE_PTERS, 100, popup_style, null, ()=>{
                leave_pters_popup = new Leave_pters('.popup_leave_pters', 'leave_pters_popup');
            });
        };

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }


    dom_row_logout(){
        let id = "logout";
        let title = "로그아웃";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"color":"#ff001f"};
        let onclick = ()=>{
            location.href='/login/logout/';
        };

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    event_edit_photo(){
        let user_option = {
            change:{text:"프로필 사진 변경", callback:()=>{
                    // show_error_message("기능을 준비중입니다.");
                    layer_popup.close_layer_popup();
                    let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MYPAGE_PHOTO_UPDATE, 100, popup_style, null, ()=>{
                        mypage_photo_update_popup = new Mypage_photo_update('.popup_mypage_photo_update', 'mypage_photo_update_popup');
                    });
                }
            },
            delete:{text:"프로필 사진 삭제", callback:()=>{
                    // show_error_message("기능을 준비중입니다.");
                    $.ajax({
                        url: '/delete_profile_img/',
                        dataType : 'html',
                        type:'POST',

                        beforeSend: function (xhr, settings) {
                            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                                xhr.setRequestHeader("X-CSRFToken", csrftoken);
                            }
                            ajax_load_image(SHOW);
                        },

                        success:function(data){
                            check_app_version(data);
                            let jsondata = JSON.parse(data);
                            if(jsondata.messageArray.length>0){
                                show_error_message(jsondata.messageArray);
                                return false;
                            }
                            try{
                                current_page.init();
                            }catch(e){}
                            try{
                                pc_top_toolbar_user_info_update();
                                mypage_popup.init();
                            }catch(e){}
                        },

                        complete:function(){
                            ajax_load_image(HIDE);
                        },

                        error:function(){
                            //alert('통신이 불안정합니다.');
                            show_error_message('통신이 불안정합니다.');
                        }
                    });
                    layer_popup.close_layer_popup();
                }
            }
        };
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }


    send_data(){
        let data = {
            "first_name":null, "phone":null, "contents":null, "country":null, "address":null, "sex":null, "birthday":null
        };
        Mypage_func.update(data, ()=>{
            this.set_initial_data();
            show_error_message('변경 내용이 저장되었습니다.');
            // this.render_content();
        });
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Mypage_func{
    static update(data, callback){
        //first_name, phone, contents, country, address, sex, birthday
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_trainer_info/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data); 
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    static read(callback){
        $.ajax({
            url:"/trainer/get_trainer_info/",
            type:'GET',
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }
}


