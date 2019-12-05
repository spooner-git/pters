class Setting_theme{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_theme_toolbox', content:'section_setting_theme_content'};
        this.data_sending_now = false;

        this.data = {
            theme: LIGHT
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_theme_func.read((data)=>{
            this.data.theme = data.setting_theme;
            
            this.render_content();
        });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();setting_theme_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="setting_theme_popup.upper_right_menu();">${CImg.confirm()}</span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_theme .wrapper_top').style.border = 0;
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
        let html =  
                    '<article class="obj_input_box_full">' +
                        // this.dom_row_theme_title() +
                        this.dom_row_theme_light() + 
                        this.dom_row_theme_dark() +
                    '</article>';
        return html;
    }

    dom_row_theme_title(){
        
        let id = "theme_title";
        let title = "테마 선택";
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = "";
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            
        });
        let html = `<article class="setting_worktime_wrapper">
                        ${row}
                    </article>
                    `;
        return html;
    }

    dom_row_theme_light(){
        let selected_or_not = this.data.theme == LIGHT ? "selected" : "";
        let html = `<div class="select_wrap ${selected_or_not}" id="input_method_new">
                        <div>
                            <img src="/static/common/img/theme/theme_normal.png">
                        </div>
                        <div class="select_indicator">
                            ${CComponent.check_button("time_input_select_new", this.data.theme == LIGHT ? ON : OFF, {"transform":"scale(1.3)", "display":"inline-block", "margin-right":"5px"}, ()=>{})}
                        </div>
                    </div>`;
        $(document).off('click', '#input_method_new').on('click', '#input_method_new', (e)=>{
            e.stopPropagation();
            this.data.theme = LIGHT; 
            this.render_content();
        });
        return html;
    }

    dom_row_theme_dark(){
        let selected_or_not = this.data.theme == DARK ? "selected" : "";
        let html = `<div class="select_wrap ${selected_or_not}" id="input_method_classic">
                        <div>
                            <img src="/static/common/img/theme/theme_dark.png">
                        </div>
                        <div class="select_indicator">
                            ${CComponent.check_button("time_input_select_classic", this.data.theme == DARK ? ON : OFF, {"transform":"scale(1.3)", "display":"inline-block", "margin-right":"5px"}, ()=>{})}
                        </div>
                    </div>`;
        $(document).off('click', '#input_method_classic').on('click', '#input_method_classic', (e)=>{
            e.stopPropagation();
            this.data.theme = DARK; 
            this.render_content();
        });
        return html;
    }



    dom_row_toolbox(){
        let title = "테마 설정";
        let description = "<p style='font-size:12px;font-weight:500;margin-top:5px;color:var(--font-sub-normal)'>화면 색상 조합과 관련된 설정입니다.</p>";
        let html = `
        <div class="setting_reserve_upper_box" style="">
            <div style="display:inline-block;">
                <span style="display:inline-block;font-size:23px;font-weight:bold">
                    ${title}
                    ${description}
                </span>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    send_data(){
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }

        let data = {
            "theme":this.data.theme
        };
        Setting_theme_func.update(data, ()=>{
            // this.set_initial_data();
            this.data_sending_now = false;
            show_error_message('테마를 변경하여 재실행 됩니다.');
            location.href = '/';
        }, ()=>{this.data_sending_now = false;});
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_theme_func{
    static update(data, callback, error_callback){
        $.ajax({
            url:"/trainer/update_setting_theme/",
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
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    static read(callback, error_callback){
        $.ajax({
            url:"/trainer/get_trainer_setting_data/",
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
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }
}


