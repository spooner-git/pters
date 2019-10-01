class Service_helper {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_helper_list_toolbox', content:'section_helper_list_content'};

        this.instance = instance;
        this.page_name = 'service_helper';
        this.data = null;

        this.swiper;

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        this.swiper_init();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, OFF); // ON, OFF top_menu_effect iphone
    }
        clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">튜토리얼</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="service_helper_popup.close();">닫기</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_service_helper .wrapper_top').style.border = 0;
        // PopupBase.top_menu_effect(this.target.install); ON, OFF top_menu_effect android
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    dom_assembly_toolbox(){
        // return this.dom_row_toolbox();
        return "";
    }

    dom_assembly_content(){
        let content_1 = this.dom_content_1();
        let content_2 = this.dom_content_2();
        let content_3 = this.dom_content_3();
        let content_4 = this.dom_content_4();
        let content_5 = this.dom_content_5();
        let html = `<div class="swiper-container" id="service_helper_content_slide">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide">${content_1}</div>
                            <div class="swiper-slide">${content_2}</div>
                            <div class="swiper-slide">${content_3}</div>
                            <div class="swiper-slide">${content_4}</div>
                            <div class="swiper-slide">${content_5}</div>
                        </div>
                        <div class="swiper-pagination"></div>
                        <div class="swiper-scrollbar"></div>
                    </div>`;

        return html;
    }

    dom_content_1(){
        let html = `<div class="content_image_wrapper">
                        <img src="/static/user/res/demo/1.jpg">
                    </div>`;
        return html;
    }

    dom_content_2(){
        let html = `<div class="content_image_wrapper">
                        <img src="/static/user/res/demo/2.jpg">
                    </div>`;
        return html;
    }

    dom_content_3(){
        let html = `<div class="content_image_wrapper">
                        <img src="/static/user/res/demo/3.jpg">
                    </div>`;
        return html;
    }

    dom_content_4(){
        let html = `<div class="content_image_wrapper">
                        <img src="/static/user/res/demo/4.jpg">
                    </div>`;
        return html;
    }

    dom_content_5(){
        let html = `<div class="content_image_wrapper">
                        <img src="/static/user/res/demo/5.jpg">
                    </div>`;
        return html;
    }

    dom_row_toolbox(){
        let title = "PTERS 이용법";
        let html = `<div class="helper_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <!--<div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>-->
                        </div>
                    </div>
                    `;
        return html;
    }

    swiper_init(){
        this.swiper = new Swiper('#service_helper_content_slide', {
            speed: 400,
            spaceBetween: 100,
            scrollbar: {
                el: '.swiper-scrollbar',
                draggable: true,
            }
        });
    }

    close(){
        let message = `<span style="display:block;font-weight:bold;font-size:15px;margin:0;margin-bottom:8px;">튜토리얼을 종료 하시겠습니까?</span>
                        언제든 다시 볼 수 있습니다.
                       <span style="display:block;color:#fe4e65;margin:0;">( 전체 메뉴 > 튜토리얼 )</span>`;
        show_user_confirm (message, ()=>{
            layer_popup.close_layer_popup(); //컨펌 팝업 닫기
            layer_popup.close_layer_popup(); //튜토리얼 닫기
            service_helper_popup.clear();
        });
    }

}

/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_LECTURE_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 