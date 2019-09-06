class Service_inquiry {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_inquiry_list_toolbox', content:'section_inquiry_list_content'};

        this.instance = instance;
        this.page_name = 'service_inquiry';
        this.data = {
            inquiry_type:{value:[], text:[]},
            inquiry_subject:null,
            inquiry_content:null
        };

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        
        this.render_content();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }
        clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();service_inquiry_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="service_inquiry_popup.send_data()">보내기</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_service_inquiry .wrapper_top').style.border = 0;
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
        let type_select = this.dom_row_type_select();
        let subject_input = this.dom_row_subject_input();
        let inquiry_input = this.dom_row_inquiry_input();

        let assembled = '<div class="obj_input_box_full">' + type_select + '</div>' + 
                        '<div class="obj_input_box_full">' + subject_input + '</div>'+
                        '<div class="obj_input_box_full">' + inquiry_input + '</div>';

        return assembled;
    }

    dom_row_toolbox(){
        let html = `<div class="inquiry_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <div style="display:inline-block;">이용 문의 </div>
                            <!--<div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>-->
                        </div>
                        <div style="font-size:14px;font-weight:500;color:#5c5859;letter-spacing:-0.65px">아래 양식을 작성하면 등록하신 이메일로 답변드립니다.</div>
                    </div>
                    `;
        return html;
    }

    dom_row_type_select(){
        let id = "inquiry_type";
        let title = this.data.inquiry_type.text.length == 0 ? '문의 유형' : this.data.inquiry_type.text;
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = '';
        let style = this.data.inquiry_type.text.length == 0 ? {"color":"#b8b4b4"} : null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let title = "문의 유형";
            let install_target = "#wrapper_box_custom_select";
            let multiple_select = 1;
            let data = {value:[1, 2, 3, 4], text:["사용문의", "기능 제안", "기능 오류", "기타"]};
            let selected_data = this.data.inquiry_type;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_CUSTOM_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                custom_selector = new CustomSelector(title, install_target, multiple_select, data, selected_data, (set_data)=>{
                    this.data.inquiry_type = set_data;
                    this.render_content();
                });
            });
        });
        let html = row;
        return html;
    }

    dom_row_subject_input(){
        let id = "inquiry_subject_input";
        let title = this.data.inquiry_subject == null ? "" : this.data.inquiry_subject;
        let placeholder = "제목";
        let icon = undefined;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let onfocusout = (data)=>{
            this.data.inquiry_subject = data;
            this.render_content();
        };
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let row = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, onfocusout, pattern, pattern_message, required);
        let html = row;
        return html;
    }

    dom_row_inquiry_input(){
        let id = "inquiry_content_textarea";
        let title = this.data.inquiry_content == null ? "" : this.data.inquiry_content;
        let placeholder = "내용";
        let icon = undefined;
        let icon_r_visible = HIDE;
        let icon_r_text = '';
        let onfocusout = (data)=>{
            console.log(data)
            this.data.inquiry_content = data;
            this.render_content();
        };
        let style = null;
        let row = CComponent.create_input_textarea_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, onfocusout);
        let html = row;
        return html;
    }

    send_data(){
        alert('보내기');
    }


    //수강권 리스트 서버에서 불러오기
    request_lecture_list (status, callback){
        //sort_order_by : lecture_type_seq, lecture_name, lecture_member_many, lecture_member_few, lecture_create_new, lecture_create_old
        let url;
        if(status=='ing'){
            url = '/trainer/get_lecture_ing_list/';
        }else if (status=='end'){
            url = '/trainer/get_lecture_end_list/';
        }
        // else{
        //     url = '/trainer/get_package_list/';
        // }
        let start_time;
        let end_time;
        $.ajax({
            url:url,
            type:'GET',
            // data: {"page": lecture_page_num, "sort_val": lecture_sort_val, "sort_order_by":lecture_sort_order_by, "keyword":lecture_keyword},
            data: {"page": 1, "sort_val": 0, "sort_order_by":0, "keyword":""},
            // dataType : 'html',
    
            beforeSend:function (){
                start_time = performance.now();
                ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function (data){
                // console.log(data);
                // var jsondata = JSON.parse(data);
                // if(jsondata.messageArray.length>0){
                //     console.log("에러:" + jsondata.messageArray);
                // }else{
                end_time = performance.now();
                console.log((end_time-start_time)+'ms');
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