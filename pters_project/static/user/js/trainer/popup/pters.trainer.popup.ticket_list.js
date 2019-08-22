class Ticket_list {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_ticket_list_toolbox', content:'section_ticket_list_content'};

        this.instance = instance;
        this.page_name = 'ticket';
        this.data = null;
        this.data_length = 0;
        this.ticket_ing_length = 0;
        this.ticket_end_length = 0;
        this.list_type_text = "";
        this.list_status_type_text = "";
        this.list_status_type = "ing"; //ing, end

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해
        this.init(this.list_status_type);
    }

    init(list_status_type){
        this.list_status_type = list_status_type;
        this.set_initial_data();
    }

    set_initial_data (){
        this.request_ticket_list(this.list_status_type, (data)=>{
            this.data = data;
            if(this.list_status_type == "ing"){
                this.data_length = this.data.current_ticket_data.length;
            }else if(this.list_status_type == "end"){
                this.data_length = this.data.finish_ticket_data.length;
            }
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });
    }
        clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){

        let top_left = `<img src="/static/common/icon/navigate_before_black.png" onclick="layer_popup.close_layer_popup();ticket_list_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right">
                                <img src="/static/common/icon/icon_search.png" class="obj_icon_28px" style="padding-right:12px;">
                                <img src="/static/common/icon/icon_add.png" class="obj_icon_28px" onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_TICKET_ADD}', 100, ${POPUP_FROM_BOTTOM}, {'select_date':null}, ()=>{
                                    ticket_add_popup = new Ticket_add('.popup_ticket_add');});">
                        </span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_ticket_list .wrapper_top').style.border = 0;
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
        this.received_data_cache = this.data;

        let whole_data, length;

        if(this.list_status_type == "ing"){
            whole_data = this.data.current_ticket_data;
            length = whole_data.length;
            this.ticket_ing_length = length;
            this.list_status_type_text = "진행중";
        }else if(this.list_status_type == "end"){
            whole_data = this.data.finish_ticket_data;
            length = whole_data.length;
            this.ticket_end_length = length;
            this.list_status_type_text = "종료";
        }

        this.list_type_text = "수강권";
        this.data_length = length;

        let html_temp = [];
        for(let i=0; i<length; i++){
            let data = whole_data[i];
            let ticket_id = data.ticket_id;
            let ticket_name = data.ticket_name;
            let ticket_note = data.ticket_note != undefined ? data.ticket_note : "";
            let ticket_member_number = data.ticket_ing_member_num;
            let ticket_end_member_number = data.ticket_end_member_num;
            let ticket_lectures_included_name = data.ticket_lecture_list;
            let ticket_lectures_state_cd = data.ticket_lecture_state_cd_list;
            let ticket_lectures_included_name_html = [];
            let ticket_lectures_color = data.ticket_lecture_ing_color_cd_list;
            let length_lecture = ticket_lectures_included_name.length;
            for(let j=0; j<length_lecture; j++){
                let html;
                if(ticket_lectures_state_cd[j] == STATE_END_PROGRESS){
                    html = `<div style="color:#cccccc;text-decoration:line-through;">
                                <div class="ticket_lecture_color" style="background-color:${this.list_status_type == "ing" ? ticket_lectures_color[j]: '#a3a0a0'}"></div>
                                ${ticket_lectures_included_name[j]}
                            </div>`;
                }else if(ticket_lectures_state_cd[j] == STATE_IN_PROGRESS){
                    html = `<div>
                                <div class="ticket_lecture_color" style="background-color:${this.list_status_type == "ing" ? ticket_lectures_color[j]: '#a3a0a0'}"></div>
                                ${ticket_lectures_included_name[j]}
                            </div>`;
                }
                ticket_lectures_included_name_html.push(html);
            }

            let onclick = `layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_TICKET_VIEW}', 100, ${POPUP_FROM_RIGHT}, {'ticket_id':${ticket_id}}, ()=>{
                ticket_view_popup = new Ticket_view('.popup_ticket_view', ${ticket_id}, 'ticket_view_popup');});`;
            let html = `<article class="ticket_wrapper" data-ticketid="${ticket_id}" onclick="${onclick}" style="opacity:${this.list_status_type == "ing" ? "1" : '0.6'}">
                            <div class="ticket_data_u">
                                <div class="ticket_name">
                                    ${ticket_name}
                                    <div class="ticket_member_number">
                                        ${this.list_status_type == "ing" ? ticket_member_number : ticket_end_member_number}명
                                    </div>
                                </div>
                                <div class="ticket_note">${ticket_note}</div>
                            </div>
                            <div class="ticket_data_b">
                                <div class="ticket_lectures">
                                    ${ticket_lectures_included_name_html.join('')}
                                </div>
                            </div>
                        </article>`;
            html_temp.push(html);
        }

        return html_temp.join("");
    }

    dom_row_toolbox(){
        let html = `<div class="ticket_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <div style="display:inline-block;">수강권 </div>
                            <!--<div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>-->
                        </div>
                    </div>
                    <div class="ticket_bottom_tools_wrap">
                        <div class="list_type_tab_wrap">
                            <div onclick="${this.instance}.switch_type('ing');" class="${this.list_status_type == "ing" ? "tab_selected": ""}">활성화</div>
                                <div style="width: 2px; height: 12px;background-color: #f5f2f3; margin:8px;"></div>
                            <div onclick="${this.instance}.switch_type('end');" style="width:48px;" class="${this.list_status_type == "end" ? "tab_selected" : ""}">비활성화</div>
                        </div>
                    </div> `;
        return html;
    }


    //수강권 리스트 서버에서 불러오기
    request_ticket_list (status, callback){
        //sort_order_by : ticket_type_seq, ticket_name, ticket_member_many, ticket_member_few, ticket_create_new, ticket_create_old
        let url;
        if(status=='ing'){
            url = '/trainer/get_ticket_ing_list/';
        }else if (status=='end'){
            url = '/trainer/get_ticket_end_list/';
        }
        // else{
        //     url = '/trainer/get_package_list/';
        // }
        let start_time;
        let end_time;
        $.ajax({
            url:url,
            type:'GET',
            // data: {"page": ticket_page_num, "sort_val": ticket_sort_val, "sort_order_by":ticket_sort_order_by, "keyword":ticket_keyword},
            data: {"page": 1, "sort_val": 0, "sort_order_by":0, "keyword":""},
            // dataType : 'html',

            beforeSend:function (){
                start_time = performance.now();
                ajax_load_image(SHOW);
            },

            //통신성공시 처리
            success:function (data){
                console.log(data);
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


    //리스트 타입을 스위치
    switch_type (type){
        this.received_data_cache = null;
        if(type == this.list_status_type){
            return false;
        }
        switch(type){
        case "ing":
            this.init("ing");
            break;

        case "end":
            this.init("end");
            break;
        }
    }

}