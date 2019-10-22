class Service_notice {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_notice_list_toolbox', content:'section_notice_list_content'};

        this.instance = instance;
        this.page_name = 'service_notice';
        this.data = null;
        this.data_length = 0;

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        this.init();
    }

    init(){
        // this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        // this.render_content();
        this.request_notice_list((data)=>{
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
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();service_notice_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_service_notice .wrapper_top').style.border = 0;
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
        for(let i=0; i <length; i++){
            let notice_id = this.data[i].notice_id;
            let notice_title = this.data[i].notice_title;
            let notice_mod_date =  this.data[i].notice_mod_dt.split(' ')[0];
            let date_format_split = notice_mod_date.split('-');
            let date_text = DateRobot.to_text(date_format_split[0], date_format_split[1], date_format_split[2]);
            let html = `<article class="notice_wrapper" onclick="service_notice_popup.open_detail(${notice_id})">
                            <div class="notice_subject">${notice_title}</div>
                            <div class="notice_date">${date_text}</div>
                        </article>`;
            html_temp.push(html);
        }

        return html_temp.join("");
    }

    dom_row_toolbox(){
        let title = "PTERS 공지사항 ";
        let html = `<div class="notice_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <!--<div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>-->
                        </div>
                    </div>
                    `;
        return html;
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
                date = current_loop.notice_mod_dt;
            }
        }

        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_READER, 100, popup_style, null, ()=>{
            let data = {
                title:title, content:content, date:date
            };
            board_reader = new BoardReader("공지", '.popup_board_reader', "board_reader", data);});
    }


    //수강권 리스트 서버에서 불러오기
    request_notice_list (callback){
        let url = '/board/get_notice_list/';

        $.ajax({
            url:url,
            type:'GET',
            data: {"notice_type": [NOTICE]},
            dataType : 'JSON',
    
            beforeSend:function (){
                ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function (data){
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