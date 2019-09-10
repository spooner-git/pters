class Mypage{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_mypage_toolbox', content:'section_mypage_content'};

        this.data = {
            
        };

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Mypage_func.read((data)=>{
            console.log(data);
            this.render_content();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });
        
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();mypage_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">${''}님의 프로필</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_confirm_black.png" onclick="mypage_popup.upper_right_menu();" class="obj_icon_prev"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_mypage .wrapper_top').style.border = 0;
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
        let logout = this.dom_row_logout();


        let html =  my_id + my_name + my_phone + my_email + 
                    my_pass + 
                    profile_change + password_change + logout;


        return html + sub_assembly;
    }


    dom_row_toolbox(){
        let title = "<img src='/static/common/icon/icon_account.png' style='width:100px;margin:0 auto;'>";
        let html = `
        <div class="mypage_upper_box" style="text-align:center;">
            <div style="display:inline-block;width:320px;">
                <div style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
                    ${title}
                </div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_my_id(){
        let id = "my_id";
        let title = "아이디";
        let icon = undefined;
        let icon_r_visible = HIDE;
        let icon_r_text = "%user_id%";
        let style = null;
        let onclick = ()=>{

        }

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_my_name(){
        let id = "my_name";
        let title = "이름";
        let icon = undefined;
        let icon_r_visible = HIDE;
        let icon_r_text = "%user_name%";
        let style = null;
        let onclick = ()=>{

        }

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_my_phone(){
        let id = "my_phone";
        let title = "휴대폰 번호";
        let icon = undefined;
        let icon_r_visible = HIDE;
        let icon_r_text = "%user_phone%";
        let style = null;
        let onclick = ()=>{

        }

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_my_email(){
        let id = "my_email";
        let title = "이메일 주소";
        let icon = undefined;
        let icon_r_visible = HIDE;
        let icon_r_text = "%user_email%";
        let style = null;
        let onclick = ()=>{

        }

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_my_pass(){
        let id = "my_pass";
        let title = "PTERS 패스";
        let icon = undefined;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let onclick = ()=>{
            alert('패스로 이동');
        }

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_profile_change(){
        let id = "profile_change";
        let title = "프로필 수정";
        let icon = undefined;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let onclick = ()=>{
            alert("프로필 수정으로 이동");
        }

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_password_change(){
        let id = "password_change";
        let title = "비밀번호 변경";
        let icon = undefined;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let onclick = ()=>{

        }

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_logout(){
        let id = "logout";
        let title = "로그아웃";
        let icon = undefined;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"color":"#ff001f"};
        let onclick = ()=>{
            alert("로그아웃");
        }

        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
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
            success:function (data){
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


