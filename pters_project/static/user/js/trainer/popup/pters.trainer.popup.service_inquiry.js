class Service_inquiry {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_inquiry_list_toolbox', content:'section_inquiry_list_content'};

        this.instance = instance;
        this.page_name = 'service_inquiry';
        this.data = {
            inquiry_type:{value:[], text:[]},
            inquiry_subject:null,
            inquiry_content:null
        };

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    init_data(){
        this.data = {
            inquiry_type:{value:[], text:[]},
            inquiry_subject:null,
            inquiry_content:null
        };
    }

    set_initial_data (){
        this.render_content();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }
        clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();service_inquiry_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;"></span><span style="color:#fe4e65;font-weight: 500;" onclick="service_inquiry_popup.send_data()">보내기</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_service_inquiry .wrapper_top').style.border = 0;
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
        let type_select = this.dom_row_type_select();
        let subject_input = this.dom_row_subject_input();
        let inquiry_input = this.dom_row_inquiry_input();

        let assembled = '<div class="obj_input_box_full">' + type_select + '</div>' + 
                        '<div class="obj_input_box_full">' + subject_input + '</div>'+
                        '<div class="obj_input_box_full">' + inquiry_input + '</div>';

        return assembled;
    }

    dom_row_toolbox(){
        let title = "문의 작성";
        let html = `<div class="inquiry_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <!--<div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>-->
                        </div>
                        <div style="font-size:14px;font-weight:500;color:#5c5859;letter-spacing:-0.65px">아래 양식을 작성하면 등록하신 이메일로 답변드립니다.</div>
                    </div>
                    `;
        return html;
    }

    dom_row_type_select(){
        let id = "inquiry_type";
        let title = this.data.inquiry_type.text.length == 0 ? '문의 유형' : this.data.inquiry_type.text;
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = '';
        let style = this.data.inquiry_type.text.length == 0 ? {"color":"#b8b4b4"} : null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "문의 유형";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = {value:["USAGE", "SUGGEST", "ERROR", "OTHER"], text:["사용문의", "기능 제안", "기능 오류", "기타"]};
            let selected_data = this.data.inquiry_type;
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, popup_style, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.inquiry_type = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }

    dom_row_subject_input(){
        let id = "inquiry_subject_input";
        let title = this.data.inquiry_subject == null ? "" : this.data.inquiry_subject;
        let placeholder = "제목";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let onfocusout = (data)=>{
            this.data.inquiry_subject = data;
            this.render_content();
        };
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let row = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, onfocusout, pattern, pattern_message, required);
        let html = row;
        return html;
    }

    dom_row_inquiry_input(){
        let id = "inquiry_content_textarea";
        let title = this.data.inquiry_content == null ? "" : this.data.inquiry_content;
        let placeholder = "내용";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = '';
        let onfocusout = (data)=>{
            this.data.inquiry_content = data;
            this.render_content();
        };
        let style = {"height":`${windowHeight - 61 - 82 - 69 - 69 - 12 - 16 - 28}px`};
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_:+\\n一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ : 제외 특수문자는 입력 불가";
        let required = "";
        let row = CComponent.create_input_textarea_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, onfocusout, pattern, pattern_message, required);
        let html = row;
        return html;
    }

    send_data(){
        let data = {
            "inquire_type":this.data.inquiry_type.value[0],
            "inquire_subject":this.data.inquiry_subject,
            "inquire_body":this.data.inquiry_content,
            "next_page":""
        };

        Service_inquiry_func.create(data, ()=>{
            // show_error_message("문의를 접수했습니다.");
            // this.init_data();
            // Service_inquiry.render_content();
            // Service_inquiry_func.read((data)=>{
            //     console.log(data);
            // });
            layer_popup.close_layer_popup();
            this.go_to_inquiry_history();
        });
    }

    go_to_inquiry_history(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SERVICE_INQUIRY_HISTORY, 100, popup_style, null, ()=>{
            service_inquiry_history_popup = new Service_inquiry_history('.popup_service_inquiry_history');});
    }

}

class Service_inquiry_func {
    static create (data, callback){
        $.ajax({
            url : "/board/add_qa_info/",
            type:'POST',
            data: data,
            dataType : 'json',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
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
    
            //통신 실패시 처리
            error:function(data){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }

    static read (callback){
        $.ajax({
            url: '/board/get_qa_list/',
            type: 'GET',
            dataType : 'html',

            beforeSend:function(){
                
            },

            success:function(data_){
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

            complete:function(){
               
            },

            error:function(){
                console.log('server error');
            }
        });
    }

    static read_check (callback){
        $.ajax({
            url: '/board/clear_qa_list/',
            type: 'GET',
            dataType : 'html',

            beforeSend:function(){
                
            },

            success:function(data_){
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

            complete:function(){
               
            },

            error:function(){
                console.log('server error');
            }
        });
    }

    static read_inquiry_answer(data, callback){
        $.ajax({
            url:'/board/get_qa_comment_list/',
            data:data,
            type:'GET',
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings) {
                
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
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
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }
}

/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_LECTURE_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 