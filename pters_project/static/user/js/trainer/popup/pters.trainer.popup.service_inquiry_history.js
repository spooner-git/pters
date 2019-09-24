class Service_inquiry_history {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_inquiry_history_list_toolbox', content:'section_inquiry_history_list_content'};

        this.instance = instance;
        this.page_name = 'service_inquiry_history';
        this.data = {
            inquiry_history_type:{value:[], text:[]},
            inquiry_history_subject:null,
            inquiry_history_content:null
        };

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        

        this.init();
    }

    init(){
        // this.render();
        this.render_loading_image();
        this.set_initial_data();
    }

    init_data(){
        this.data = {
            title:[],
            contents: [],
            email_address: [],
            qa_type_cd: [],
            qa_type_cd_name: [],
            question_id: [],
            reg_dt: [],
            mod_dt: [],
            status_type_cd: [],
            status_type_cd_name: []
        };
    }

    set_initial_data (){
        Service_inquiry_func.read((data)=>{
            this.data = data;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        })
    }
    
    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();service_inquiry_history_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;"></span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;border-bottom:1px solid #f5f2f3;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_service_inquiry_history .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
    }

    render_loading_image(){
        document.querySelector(this.target.install).innerHTML = 
            `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;">
                <img src="/static/common/loading.svg">
                <div style="font-size:12px;color:#858282">사용자 데이터를 불러오고 있습니다.</div>
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
        let length = this.data.question_id.length;
        let html_temp = [];
        for(let i=length-1; i >= 0; i--){
            let id = this.data.question_id[i];
            let title = this.data.title[i];
            let qa_type = this.data.qa_type_cd_name[i];
            let status_type = this.data.status_type_cd_name[i];

            let reg_date = this.data.reg_dt[i].replace(/-/gi, ' .');
            let html = `<article class="inquiry_wrapper" onclick="service_inquiry_history_popup.open_detail(${id})">
                            <div class="inquiry_subject">
                                <span class="inquiry_qa_type">${qa_type} </span>
                                <span class="inquiry_title">${title}</span>
                                <span class="inquiry_status">${status_type}</span>
                            </div>
                            <div class="inquiry_date">${reg_date}</div>
                        </article>`;
            html_temp.push(html);
        }

        return html_temp.join("");
    }

    dom_row_toolbox(){
        let title = "내 문의 내역 ";
        let html = `<div class="inquiry_history_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                        </div>
                        <div style="font-size:14px;font-weight:500;color:#5c5859;letter-spacing:-0.65px">나의 문의 내역입니다.</div>
                    </div>
                    `;
        return html;
    }

    open_detail(question_id){
        alert("question_id: ", question_id);
        console.log(question_id)
    }

    send_data(){
        // let data = {
        //     "inquire_type":this.data.inquiry_history_type.value[0],
        //     "inquire_subject":this.data.inquiry_history_subject,
        //     "inquire_body":this.data.inquiry_history_content,
        //     "next_page":""
        // };

        // Service_inquiry_history_func.create(data, ()=>{
        //     show_error_message("문의를 접수하였습니다.");
        //     this.init_data();
        //     Service_inquiry_history.render_content();
        //     Service_inquiry_history_func.read((data)=>{
        //         console.log(data);
        //     });
        // });
    }
}

/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_LECTURE_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 