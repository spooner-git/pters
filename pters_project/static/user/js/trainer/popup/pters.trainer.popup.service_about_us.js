class Service_about_us {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_about_us_list_toolbox', content:'section_about_us_list_content'};

        this.instance = instance;
        this.page_name = 'service_about_us';
        this.data = {
            about_us_type:{value:[], text:[]},
            about_us_subject:null,
            about_us_content:null
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
            about_us_type:{value:[], text:[]},
            about_us_subject:null,
            about_us_content:null
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();service_about_us_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;"></span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_service_about_us .wrapper_top').style.border = 0;
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
       
        let team = this.dom_row_team();
        let contact = this.dom_row_contact();
        let business_info = this.dom_row_business_info();

        let assembled = '<div class="obj_input_box_full">' + team + '</div>'+
                        '<div class="obj_input_box_full">' + contact + '</div>' +
                        '<div class="obj_input_box_full">' + business_info + '</div>';

        return assembled;
    }

    dom_row_toolbox(){
        let title = `About us <p style="font-size:14px;font-weight:500;">PTERS 팀</p>`;
        let html = `<div class="about_us_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                        </div>
                        <div style="font-size:14px;font-weight:500;color:#5c5859;letter-spacing:-0.65px"></div>
                    </div>
                    `;
        return html;
    }

    dom_row_team(){
        let html = `
                        <div>
                            <span class="about_us_tag">대표</span><span class="about_us_name">김선겸</span>
                            <span class="about_us_tag">CTO</span><span class="about_us_name">김현기</span>
                            <span class="about_us_tag">디자인</span><span class="about_us_name">손 욱</span>
                        </div>
                        <div>
                            <div><span class="about_us_tag">대표 자문</span><span class="about_us_name">박상혁 골프 프로님</span></div>
                            <div><span class="about_us_tag">자문</span><span class="about_us_name">목동 서울 플루트 김민아 원장님</span></div>
                            <div><span class="about_us_tag">자문</span><span class="about_us_name">Bns발레 강현화 대표님</span></div>
                        </div>
                    `;

        return html;
    }

    dom_row_contact(){
        let html = `<div>
                        <div class="about_us_tag">문의</div>
                        <div class="about_us_name">전화: 070-8816-1010 (응대 시간: 평일 10:00 ~ 18:00, 13:00 ~ 14:00 점심시간)</div>
                        <div class="about_us_name">메일: support@pters.co.kr</div>
                        <div class="about_us_name">주소: 서울시 동작구 보라매로 5가길 7, 820</div>
                    </div>`;
        return html;
    }

    dom_row_business_info(){
        let html = `<div>
                        <div class="about_us_tag">사업자 정보</div>
                        <div class="about_us_name">사업자 등록번호: 463-56-00284</div>
                        <div class="about_us_name">통신판매업 신고: 2017-서울동작-0672</div>
                    </div>`;
        return html;
    }

    send_data(){
       
    }


}

/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_LECTURE_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 