class Member_search {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_member_search_toolbox', content:'section_member_search_content'};

        this.instance = instance;
        this.page_name = 'member_search';
        this.data = {
            member_search_type:{value:[], text:[]},
            member_search_subject:null,
            member_search_content:null
        };

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        this.step = 0;

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    init_data(){
        this.data = {
            search_id:null
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
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_x_black.png" onclick="layer_popup.close_layer_popup();member_search_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;"></span><span style="color:#fe4e65;font-weight: 500;" onclick="member_search_popup.send_data()"></span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_member_search .wrapper_top').style.border = 0;
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
        let search_input = this.dom_row_search_input();
        let search_button = this.dom_row_search_button();
        let reg_button = this.dom_row_reg_button();
        let member_list = this.dom_row_member_list();

        let content = search_input;
        if(this.step == 1){
            content = search_input + member_list;
        }

        let button = this.step == 0 ? search_button : reg_button;

        let assembled = 
                        '<div class="obj_input_box_full" style="border:0">' + content + '</div>' +
                        '<div style="position:absolute;bottom:0;padding:20px;width:100%;box-sizing:border-box;">' + button + '</div>';

        return assembled;
    }

    dom_row_toolbox(){
        let title = "회원 검색";
        let html = `<div class="member_search_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                        </div>
                        <div style="font-size:14px;font-weight:500;color:#5c5859;letter-spacing:-0.65px">회원님의 아이디 또는 휴대폰 번호를 입력해주세요.</div>
                    </div>
                    `;
        return html;
    }

    dom_row_search_button(){
        let id = "dom_row_search_button";
        let title = "검색";
        let style = {"background-color":"#fe4e65", "color":"#ffffff", "height":"50px", "line-height":"50px"};
        if(this.data.search_id == null){
            style = {"background-color":"#cccccc", "color":"#ffffff", "height":"50px", "line-height":"50px"};
        }
        let onclick = ()=>{
            let data = {"search_val":this.data.search_id};
            Member_func.search(data, (data)=>{
                console.log(data);
            });
        };
        let html = CComponent.button (id, title, style, onclick);
        return html;
    }

    dom_row_reg_button(){
        let id = "dom_row_reg_button";
        let title = "등록";
        let style = {"background-color":"#fe4e65", "color":"#ffffff", "height":"50px", "line-height":"50px"};
        let onclick = ()=>{
            alert('등록');
        };
        let html = CComponent.button (id, title, style, onclick);
        return html;
    }

    dom_row_search_input(){
        let id = "member_search_subject_input";
        let title = this.data.search_id == null ? "" : this.data.search_id;
        let placeholder = "아이디 또는 휴대폰 번호 입력";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"padding":"12px 16px", "border":"1px solid #ebe6e6"};
        let disabled = false;
        let onfocusout = (data)=>{
            this.data.search_id = data;
            this.render_content();
        };
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let row = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, onfocusout, pattern, pattern_message, required);
        let html = row;
        return html;
    }

    dom_row_member_list(){

        let checked = OFF;
        let style_radio = {"display":"inline-block"};
        let onclick_radio = ()=>{

        };
        let radio_button = CComponent.radio_button (`radio_dom_row_member_list`, checked, style_radio, onclick_radio);

        // let id = `dom_row_member_list`;
        // let title = `회원명 ${radio_button}`;
        // let icon = '/static/common/icon/icon_account.png';
        // let icon_r_visible = NONE;
        // let icon_r_text = "";
        // let style = null;
        // let onclick = ()=>{

        // }
        // let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);

        let html = `<article style="display: flex;height: 40px;line-height: 40px;padding: 10px 0;">
                        <div style="flex-basis:70px;background-image:url('/static/common/icon/icon_account.png');background-size:contain;background-repeat:no-repeat;"></div>
                        <div style="flex:1 0 0;">회원명</div>
                        <div style="flex-basis:50px;text-align:right;">${radio_button}</div>
                    </article>`;

        return html;
    }


    send_data(){
        let data = {
            "inquire_type":this.data.member_search_type.value[0],
            "inquire_subject":this.data.member_search_subject,
            "inquire_body":this.data.member_search_content,
            "next_page":""
        };

        member_search_func.create(data, ()=>{
            show_error_message("문의를 접수하였습니다.");
            this.init_data();
            member_search.render_content();
            member_search_func.read((data)=>{
                console.log(data);
            });
        });
    }

    go_to_member_search_history(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_member_search_HISTORY, 100, popup_style, null, ()=>{
            member_search_history_popup = new member_search_history('.popup_member_search_history');});
    }

}

class member_search_func {
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