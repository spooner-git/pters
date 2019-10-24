class Service_inquiry_faq {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_inquiry_faq_list_toolbox', content:'section_inquiry_faq_list_content'};

        this.instance = instance;
        this.page_name = 'service_inquiry_faq';
        this.data = null;
        this.data_length = 0;

        this.tab = "manual";

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        this.init();
    }

    init(){
        // this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        // this.render_content();
        this.request_faq_list((data)=>{
            this.data = data.notice_data;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });
    }
    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();service_inquiry_faq_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_service_inquiry_faq .wrapper_top').style.border = 0;
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
        let length = this.data.length;
        let html_temp = [];
        for(let i=0; i <length ; i++){
            let notice_type_cd = this.data[i].notice_type_cd;
            if(this.tab == "manual"){
                if(notice_type_cd != NOTICE_USAGE){
                    continue;
                }
            }else if(this.tab == "faq"){
                if(notice_type_cd != NOTICE_FAQ){
                    continue;
                }
            }

            let id = this.data[i].notice_id;
            let notice_type_cd_name = this.data[i].notice_type_cd_name;
            let title = this.data[i].notice_title;
            let html = `<article class="inquiry_faq_wrapper" onclick="service_inquiry_faq_popup.open_detail(${id})">
                            <div class="inquiry_faq_type">${notice_type_cd_name}</div>
                            <div class="inquiry_faq_subject">${title}</div>
                        </article>`;
            html_temp.push(html);
        }

        return html_temp.join("");
    }

    // dom_row_toolbox(){
    //     let title = "자주 묻는 질문 & 사용법";
    //     let html = `<div class="inquiry_faq_upper_box">
    //                     <div style="display:inline-block;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
    //                         <span style="display:inline-block;">${title}</span>
    //                         <span style="display:none;">${title}</span>
    //                         <!--<div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>-->
    //                     </div>
    //                 </div>
    //                 `;
    //     return html;
    // }

    dom_row_toolbox(){
        let title = "사용법";
        let title2 = "자주 묻는 질문";
        let html = `
                    <div class="lecture_view_upper_box">
                        <div style="display:inline-block;width:320px;">
                            <span class="sales_type_select_text_button" style="color:${this.tab=="manual" ? "#3d3b3b" :"#b8b4b4"}" onclick="service_inquiry_faq_popup.switch('manual')">
                                ${title}
                            </span>
                            <div style="display:inline-block;background-color:#f5f2f3;width:2px;height:16px;margin:0 10px;"></div>
                            <span class="sales_type_select_text_button" style="color:${this.tab=="faq" ? "#3d3b3b" :"#b8b4b4"}" onclick="service_inquiry_faq_popup.switch('faq')">
                                ${title2}
                            </span>
                            <span style="display:none">${this.tab=="manual"? "사용법" : "자주 묻는 질문"}</span>
                        </div>
                    </div>
                    `;
        return html;
    }

    switch(tab){
        this.tab = tab;
        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    open_detail(id){
        let length = this.data.length;
        let title = null;
        let content = null;
        let date = null;
        for(let i=0; i<length; i++){
            let current_loop = this.data[i];
            let notice_id = current_loop.notice_id;
            if(notice_id == id){
                title = current_loop.notice_title;
                content = current_loop.notice_contents;
                date = current_loop.notice_reg_dt;
            }
        }

        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_READER, 100, popup_style, null, ()=>{
            let data = {
                title:title, content:content, date:date
            };
            board_reader = new BoardReader("FAQ", '.popup_board_reader', "board_reader", data);});
    }


    //수강권 리스트 서버에서 불러오기
    request_faq_list (callback){
        let url = '/board/get_notice_list/';

        $.ajax({
            url:url,
            type:'GET',
            data: {"notice_type": [NOTICE_FAQ, NOTICE_USAGE]},
            dataType : 'JSON',
    
            beforeSend:function (){
                ajax_load_image(SHOW);
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
                return data;
                // }
            },

            //보내기후 팝업창 닫기
            complete:function (){
                ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function (){
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