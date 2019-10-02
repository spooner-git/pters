class Service_inquiry_faq {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_inquiry_faq_list_toolbox', content:'section_inquiry_faq_list_content'};

        this.instance = instance;
        this.page_name = 'service_inquiry_faq';
        this.data = null;
        this.data_length = 0;

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        // this.temp_data_for_test = {
        //     data:[  {type:"사용법", subject:"회원 등록하기", id:1}, {type:"사용법", subject:"수업 등록하기", id:1}, {type:"사용법", subject:"수강권 등록하기", id:1},
        //             {type:"사용법", subject:"일정 등록하기", id:1},
        //             {type:"사용법", subject:"수강 회원님과 연결하여 사용하기", id:2}, {type:"사용법", subject:"기존 회원 재등록 하기", id:6},
        //             {type:"자주 묻는 질문", subject:"결제 방법에는 무엇이 있나요?", id:5}, {type:"자주 묻는 질문", subject:"프로그램이 무엇인가요?", id:3},
        //             {type:"자주 묻는 질문", subject:"달력에 일부 요일이 보이지 않아요", id:7}
        //         ]
        // };


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
        console.log('length::'+length);
        let html_temp = [];
        for(let i=0; i <length ; i++){
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

    dom_row_toolbox(){
        let title = "자주 묻는 질문 & 사용법";
        let html = `<div class="inquiry_faq_upper_box">
                        <div style="display:inline-block;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <!--<div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>-->
                        </div>
                    </div>
                    `;
        return html;
    }

    open_detail(id){
        alert(id+' 공지사항 내용');
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
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
                callback(data);
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