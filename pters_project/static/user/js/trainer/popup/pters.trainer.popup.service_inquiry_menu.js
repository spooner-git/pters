class Service_inquiry_menu {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_inquiry_menu_list_toolbox', content:'section_inquiry_menu_list_content'};

        this.instance = instance;
        this.page_name = 'service_inquiry_menu';
        this.data = {
            inquiry_menu_type:{value:[], text:[]},
            inquiry_menu_subject:null,
            inquiry_menu_content:null
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
            inquiry_menu_type:{value:[], text:[]},
            inquiry_menu_subject:null,
            inquiry_menu_content:null
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
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();service_inquiry_menu_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;"></span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_service_inquiry_menu .wrapper_top').style.border = 0;
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
        let faq = this.dom_row_faq();
        let history = this.dom_row_my_inquiry();
        let write = this.dom_row_new_inquiry();

        let assembled = '<div class="obj_input_box_full">' + faq + '</div>' + 
                        '<div class="obj_input_box_full">' + history + '</div>'+
                        '<div class="obj_input_box_full">' + write + '</div>';

        return assembled;
    }

    dom_row_toolbox(){
        let title = "이용 문의 ";
        let html = `<div class="inquiry_menu_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <!--<div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>-->
                        </div>
                        <div style="font-size:14px;font-weight:500;color:#5c5859;letter-spacing:-0.65px"></div>
                    </div>
                    `;
        return html;
    }

    dom_row_faq(){
        let id = "inquiry_menu_new_inquiry";
        let title = "자주 묻는 질문 & 사용방법";
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = '';
        let style = null;
        let onclick = ()=>{
            // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SERVICE_INQUIRY, 100, POPUP_FROM_RIGHT, null, ()=>{
            //     service_inquiry_popup = new Service_inquiry('.popup_service_inquiry');});
            alert('Hi')
        };
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_my_inquiry(){
        let id = "inquiry_menu_inquiry_history";
        let title = "내 문의 내역";
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = '';
        let style = null;
        let onclick = ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SERVICE_INQUIRY_HISTORY, 100, POPUP_FROM_RIGHT, null, ()=>{
                service_inquiry_history_popup = new Service_inquiry_history('.popup_service_inquiry_history');});
        };
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    dom_row_new_inquiry(){
        let id = "inquiry_menu_new_inquiry";
        let title = "문의 하기";
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = '';
        let style = null;
        let onclick = ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SERVICE_INQUIRY, 100, POPUP_FROM_RIGHT, null, ()=>{
                service_inquiry_popup = new Service_inquiry('.popup_service_inquiry');});
        };
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        return html;
    }

    send_data(){
        let data = {
            "inquire_type":this.data.inquiry_menu_type.value[0],
            "inquire_subject":this.data.inquiry_menu_subject,
            "inquire_body":this.data.inquiry_menu_content,
            "next_page":""
        };

        Service_inquiry_menu_func.create(data, ()=>{
            show_error_message("문의를 접수하였습니다.");
            this.init_data();
            Service_inquiry_menu.render_content();
            Service_inquiry_menu_func.read((data)=>{
                console.log(data);
            });
        });
    }

    go_to_inquiry_menu_history(){
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SERVICE_inquiry_menu_HISTORY, 100, POPUP_FROM_RIGHT, null, ()=>{
            service_inquiry_menu_history_popup = new Service_inquiry_menu_history('.popup_service_inquiry_menu_history');});
    }

}

class Service_inquiry_menu_func {
    static create (data, callback){
        $.ajax({
            url : "/board/add_question_info/",
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
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
                callback(data);
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
            url: '/board/get_question_list/',
            type: 'GET',
            dataType : 'html',

            beforeSend:function(){
                
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                if(callback != undefined){
                    callback(jsondata);
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
            url: '/board/clear_question_list/',
            type: 'GET',
            dataType : 'html',

            beforeSend:function(){
                
            },

            success:function(data){
                var jsondata = JSON.parse(data);
                if(callback != undefined){
                    callback(jsondata);
                }
            },

            complete:function(){
               
            },

            error:function(){
                console.log('server error');
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