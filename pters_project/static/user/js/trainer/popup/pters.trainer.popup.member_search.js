class Member_search {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_member_search_toolbox', content:'section_member_search_content'};

        this.instance = instance;
        this.page_name = 'member_search';
        this.data = {
            searched_data : [],
            search_id:null,
            selected_member_id:null
        };

        this.step = 0;

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        this.render_content();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear_data(){
        this.step = 0;
        this.data.searched_data = [];
        this.data.search_id = null;
        this.data.selected_member_id = null;
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

    render_loading_image(){
        document.querySelector("#section_member_search_content").innerHTML = 
            `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;">
                <img src="/static/common/loading.svg">
                <div style="font-size:12px;color:#858282">검색중...</div>
            </div>`;
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
        let reset_button = this.dom_row_reset_button();
        let member_list = this.dom_row_member_list();

        let content = search_input;
        let button = this.step == 0 ? search_button : reg_button + reset_button;
        if(this.step == 1 || this.step == 2){
            content = search_input + member_list;
        }

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
            if(this.data.search_id == null){
                show_error_message("검색 조건을 입력해주세요.");
                return false;
            }
            this.render_loading_image();
            let data = {"search_val":this.data.search_id};
            Member_func.search(data, (data)=>{
                this.data.searched_data = data.member_list;
                this.step = 1;
                this.render_content();
            });
        };
        let html = CComponent.button (id, title, style, onclick);
        return html;
    }

    dom_row_reg_button(){
        let id = "dom_row_reg_button";
        let title = "등록";
        let style = {"background-color":"#fe4e65", "color":"#ffffff", "height":"50px", "line-height":"50px"};
        if(this.data.selected_member_id == null){
            style = {"background-color":"#cccccc", "color":"#ffffff", "height":"50px", "line-height":"50px"};
        }
        let onclick = ()=>{
            if(this.data.selected_member_id == null){
                show_error_message('회원을 선택해주세요.');
                return false;
            }
            layer_popup.close_layer_popup();
            this.clear();
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_ADD, 100, popup_style, null, ()=>{
                member_add_popup = new Member_add('.popup_member_add', {member_id: this.data.selected_member_id}, 'member_add_popup');});
        };
        let html = CComponent.button (id, title, style, onclick);
        return html;
    }

    dom_row_reset_button(){
        let id = "dom_row_reset_button";
        let title = "재검색";
        let style = {"background-color":"#ffffff", "height":"48px", "line-height":"48px", "margin-top":"10px", 'border':"1px solid #ebe6e6"};
        let onclick = ()=>{
            if(this.data.search_id == null){
                show_error_message("검색 조건을 입력해주세요.");
                return false;
            }
            this.render_loading_image();
            let data = {"search_val":this.data.search_id};
            Member_func.search(data, (data)=>{
                this.data.searched_data = data.member_list;
                this.step = 1;
                this.render_content();
            });
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
        let style = {"border":"1px solid #ebe6e6"};
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

        let length = this.data.searched_data.length;
        let html_to_join = [];
        for(let i=0; i<length; i++){
            let data = this.data.searched_data[i];
            let checked = this.data.selected_member_id == data.member_id ? ON : OFF;
            let style_radio = {"display":"inline-block"};
            let onclick_radio = ()=>{

            };
            let radio_button = CComponent.radio_button (`radio_dom_row_member_list`, checked, style_radio, onclick_radio);

            let html = `<article style="display: flex;height: 40px;line-height: 40px;padding: 10px 0;" id="member_searched_${data.member_id}">
                            <div style="flex-basis:70px;background-image:url('${data.member_profile_url}');background-size:contain;background-repeat:no-repeat;"></div>
                            <div style="flex:1 0 0;">${data.member_name} <span style="font-size:12px;color:#858282">(${data.member_phone})</span></div>
                            <div style="flex-basis:50px;text-align:right;">${radio_button}</div>
                        </article>`;
            
            $(document).off('click', `#member_searched_${data.member_id}`).on('click', `#member_searched_${data.member_id}`, ()=>{
                this.step = 2;
                this.data.selected_member_id = data.member_id;
                this.render_content();
            });

            html_to_join.push(html);
        }

        if(html_to_join.length == 0){
            html_to_join.push('<p style="font-size:14px;font-weight:500;color:#858282;">검색된 결과가 없습니다.</p>');
        }
        

        return html_to_join.join("");
    }

    dom_row_loading_image(){
        let html = 
                    `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;">
                        <img src="/static/common/loading.svg">
                        <div style="font-size:12px;color:#858282">사용자 데이터를 불러오고 있습니다.</div>
                    </div>`;
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
            show_error_message("문의를 접수했습니다.");
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
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray);
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
            url: '/board/get_qa_list/',
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
            url: '/board/clear_qa_list/',
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