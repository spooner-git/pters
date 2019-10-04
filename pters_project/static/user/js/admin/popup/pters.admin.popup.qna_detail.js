class Qna_detail {
    constructor (install_target, qna_id, data){
        this.target = {install: install_target, toolbox:'section_qna_detail_toolbox', content:'section_qna_detail_content'};

        this.page_name = 'qna_detail';
        this.data = data;
        this.qna_id = qna_id;

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

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_x_black.png" onclick="layer_popup.close_layer_popup();qna_detail_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="alert('저장하기 실행')">저장</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_qna_detail .wrapper_top').style.border = 0;
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
        
        let data = this.data.all[this.qna_id];
        let member_id = data.qa_member_id;
        let member_name = data.qa_member_name;
        let member_email = data.qa_email_address;
        let type = data.qa_type_cd;
        let title = data.qa_title;
        let content = data.qa_contents;
        let reg_dt = data.qa_reg_dt;
        let mod_dt = data.qa_mod_dt;
        let status = QA_STATUS[data.qa_status_type_cd];

        let info = `<article class="qna_detail_info_wrapper">
                        <div class="qna_user_info">
                            <div class="info_wrapper">
                                <div>이용자명</div><div>${member_name} (member_id: ${member_id})</div>
                            </div>
                            <div class="info_wrapper">
                                <div>E-mail</div><div>${member_email}</div>
                            </div>
                        </div>
                        <div class="qna_time_info">
                            <div class="info_wrapper">
                                <div>최초 등록</div><div>${reg_dt}</div>
                            </div>
                            <div class="info_wrapper">
                                <div>수정 시간</div><div>${mod_dt}</div>
                            </div>
                        </div>
                        <div class="qna_info">
                            <div class="info_wrapper">
                                <div>상태</div><div>${status}</div>
                            </div>
                        </div>
                    </article>
                    <article class="qna_detail_content_wrapper">
                        <div class="info_wrapper">
                            <div>타입</div><div>${type}</div>
                        </div>
                        <div class="info_wrapper">
                            <div>제목</div><div>${title}</div>
                        </div>
                        <div class="info_wrapper">
                            <div>내용</div><div>${content}</div>
                        </div>
                    </article>`;
        
        let textarea = '<article class="qna_detail_answer_wrapper">' + this.dom_answer_textarea() + '</article>';
        let html = info + textarea;

        return html;
    }

    dom_answer_textarea(){
        let id = "answer_textarea";
        let title = "";
        let placeholder = "답변 입력";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"height":"350px", "border":"1px solid #cccccc;", "padding": "10px"};
        let onfocusout = ()=>{

        };

        let html = CComponent.create_input_textarea_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, onfocusout);
        return html;
    }

    dom_row_toolbox(){
        let title = "Q&A 상세";
        let html = `<div class="qna_detail_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                        </div>
                    </div>
                    `;
        return html;
    }

}

/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_LECTURE_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 