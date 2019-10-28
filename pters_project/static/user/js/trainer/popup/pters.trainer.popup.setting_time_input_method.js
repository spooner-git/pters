class Setting_time_input_method{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_time_input_method_toolbox', content:'section_setting_time_input_method_content'};

        this.data = {
            time_input_method: 0
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        // Setting_time_input_method_func.read((data)=>{
        //     this.data.time_input_method = data;
        //     this.render_content();
        // });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();setting_time_input_method_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_confirm_black.png" onclick="setting_time_input_method_popup.upper_right_menu();" class="obj_icon_prev"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_time_input_method .wrapper_top').style.border = 0;
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
                       this.dom_row_time_input_method_new() + 
                       this.dom_row_time_input_method_classic() +
                    '</article>';
        return html;
    }

    dom_row_time_input_method_new(){
        let selected_or_not = this.data.time_input_method == 0 ? "selected" : "";
        let html = `<div class="select_wrap ${selected_or_not}" id="input_method_new">
                        <div class="select_indicator">
                            ${CComponent.radio_button("time_input_select_new", this.data.time_input_method == 0 ? ON : OFF, {"transform":"scale(1.2)", "display":"inline-block", "margin-right":"5px"}, ()=>{})}
                            <span>기본</span>
                            <p>시작과 종료시간을 각각 상세하게 설정 합니다. <br>겹치는 일정을 상관없이 모두 표기해 줍니다.</p>
                        </div>
                        <div>
                            <img src="/static/common/img/time_input_method/time_input_method_new.png">
                        </div>
                    </div>`;
        $(document).off('click', '#input_method_new').on('click', '#input_method_new', (e)=>{
            e.stopPropagation();
            this.data.time_input_method = 0; 
            this.render_content();
        });
        return html;
    }

    dom_row_time_input_method_classic(){
        let selected_or_not = this.data.time_input_method == 1 ? "selected" : "";
        let html = `<div class="select_wrap ${selected_or_not}" id="input_method_classic">
                        <div class="select_indicator">
                            ${CComponent.radio_button("time_input_select_classic", this.data.time_input_method == 1 ? ON : OFF, {"transform":"scale(1.2)", "display":"inline-block", "margin-right":"5px"}, ()=>{})}
                            <span>클래식</span>
                            <p>시작과 종료시각을 한번에 설정 합니다. <br>겹치는 일정은 필터링 할 수 있습니다.</p>
                        </div>
                        <div>
                            <img src="/static/common/img/time_input_method/time_input_method_classic.png">
                        </div>
                    </div>`;
        $(document).off('click', '#input_method_classic').on('click', '#input_method_classic', (e)=>{
            e.stopPropagation();
            this.data.time_input_method = 1; 
            this.render_content();
        });
        return html;
    }



    dom_row_toolbox(){
        let title = "시간 입력 방식 설정";
        let description = "<p style='font-size:14px;font-weight:500;'>일정 입력 시 사용할 입력 방식을 선택해주세요.</p>";
        let html = `
        <div class="setting_reserve_upper_box" style="">
            <div style="display:inline-block;width:320px;">
                <span style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
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
        let data = {
            "setting_time_input_method":this.data.time_input_method
        };
        
        // Setting_time_input_method_func.update(data, ()=>{
        //     this.set_initial_data();
        //     show_error_message('변경 내용이 저장되었습니다.');
        // });
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_time_input_method_func{
    static update(data, callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_attend_mode_setting/",
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
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }
}


