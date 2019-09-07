class Service_notice {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_notice_list_toolbox', content:'section_notice_list_content'};

        this.instance = instance;
        this.page_name = 'service_notice';
        this.data = null;
        this.data_length = 0;

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        this.temp_data_for_test = {
            data:[{date:"2019-9-1", subject:"테스트 공지사항 입력 제목1", id:1}, {date:"2019-9-2", subject:"테스트 공지사항 입력 제목2", id:2}, {date:"2019-9-3", subject:"테스트 공지사항 입력 제목3", id:3},
                    {date:"2019-9-4", subject:"테스트 공지사항 입력 제목4", id:4},{date:"2019-9-5", subject:"테스트 공지사항 입력 제목5", id:5}, {date:"2019-9-5", subject:"테스트 공지사항 입력 제목6", id:6}]
        }


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
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();service_notice_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_service_notice .wrapper_top').style.border = 0;
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
        let length = this.temp_data_for_test.data.length;
        let html_temp = [];
        for(let i=length-1; i >= 0; i--){
            let id = this.temp_data_for_test.data[i].id;
            let subject = this.temp_data_for_test.data[i].subject;
            let date_format_split = this.temp_data_for_test.data[i].date.split('-');
            let date_text = DateRobot.to_text(date_format_split[0], date_format_split[1], date_format_split[2]);
            let html = `<article class="notice_wrapper" onclick="service_notice_popup.open_detail(${id})">
                            <div class="notice_subject">${subject}</div>
                            <div class="notice_date">${date_text}</div>
                        </article>`;
            html_temp.push(html);
        }

        return html_temp.join("");
    }

    dom_row_toolbox(){
        let html = `<div class="notice_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <div style="display:inline-block;">PTERS 공지사항 </div>
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