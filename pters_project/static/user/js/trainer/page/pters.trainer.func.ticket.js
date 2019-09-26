class Ticket{
    constructor(targetHTML, instance){
        this.page_name = 'ticket';
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.data_length = 0;
        this.ticket_ing_length = 0;
        this.ticket_end_length = 0;
        this.list_type_text = "";
        this.list_status_type_text = "";
        this.list_status_type = "ing"; //ing, end

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해
    }

    init(list_status_type){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;

        if(list_status_type==undefined){
            list_status_type = this.list_status_type;
        }

        this.list_status_type = list_status_type;

        if(this.received_data_cache != null){
            this.render_ticket_list(this.received_data_cache, list_status_type);
        }
        this.render_upper_box();
        this.request_ticket_list(list_status_type, (jsondata) => {
            this.received_data_cache = jsondata;
            this.render_ticket_list(jsondata, list_status_type);
            this.render_upper_box();
        });

    }


    //수강권 리스트 서버에서 불러오기
    request_ticket_list(status, callback, async){
        //sort_order_by : ticket_type_seq, ticket_name, ticket_member_many, ticket_member_few, ticket_create_new, ticket_create_old
        let url;
        if(status=='ing'){
            url = '/trainer/get_ticket_ing_list/';
        }else if (status=='end'){
            url = '/trainer/get_ticket_end_list/';
        }
        if(async == undefined){
            async = true;
        }
        $.ajax({
            url:url,
            type:'GET',
            data: {"page": 1, "sort_val": 0, "sort_order_by":0, "keyword":""},
            dataType : 'JSON',
            async:async,
    
            beforeSend:function(){
                ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function(data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_errow_message(data.messageArray[0]);
                        return false;
                    }
                }
                callback(data);
                return data;
            },

            //보내기후 팝업창 닫기
            complete:function(){
                ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function(){
                console.log('server error');
            }
        })
    }

    //상단을 렌더링
    render_upper_box(){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.getElementById('ticket_display_panel').innerHTML = component.ticket_upper_box;
    }

    //수강권 리스트를 렌더링
    render_ticket_list(jsondata, list_status_type){

        if(current_page != this.page_name){
            return false;
        }

        let whole_data, length;

        if(list_status_type == "ing"){
            whole_data = jsondata.current_ticket_data;
            length = whole_data.length;
            this.ticket_ing_length = length;
            this.list_status_type_text = "진행중";
        }else if(list_status_type == "end"){
            whole_data = jsondata.finish_ticket_data;
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
                                <div class="ticket_lecture_color" style="background-color:${list_status_type == "ing" ? ticket_lectures_color[j]: '#a3a0a0'}"></div>
                                ${ticket_lectures_included_name[j]}
                            </div>`;
                }else if(ticket_lectures_state_cd[j] == STATE_IN_PROGRESS){
                    html = `<div>
                                <div class="ticket_lecture_color" style="background-color:${list_status_type == "ing" ? ticket_lectures_color[j]: '#a3a0a0'}"></div>
                                ${ticket_lectures_included_name[j]}
                            </div>`;
                }
                ticket_lectures_included_name_html.push(html);
            }

            let onclick = `layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_TICKET_VIEW}', 100, ${POPUP_FROM_RIGHT}, {'ticket_id':${ticket_id}}, ()=>{
                ticket_view_popup = new Ticket_view('.popup_ticket_view', ${ticket_id}, 'ticket_view_popup');});`;
            let html = `<article class="ticket_wrapper" data-ticketid="${ticket_id}" onclick="${onclick}" style="opacity:${list_status_type == "ing" ? "1" : '0.6'}">
                            <div class="ticket_data_u">
                                <div class="ticket_name">
                                    ${ticket_name}
                                    <div class="ticket_member_number">
                                        ${list_status_type == "ing" ? ticket_member_number : ticket_end_member_number}명
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

        document.querySelector('#ticket_content_wrap').innerHTML = html_temp.join("");
    }


    //리스트 타입을 스위치
    switch_type(type){
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

    static_component(){
        return(
            {    "ticket_upper_box":`   <div class="ticket_upper_box">
                                            <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                                                <div style="display:inline-block;">수강권 </div>
                                            <!--<div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>-->
                                            </div>
                                            <div class="ticket_tools_wrap">
                                                <div class="search_ticket"></div>
                                                <div class="add_ticket" onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_TICKET_ADD}', 100, ${POPUP_FROM_BOTTOM}, {'select_date':null}, ()=>{
                                                    ticket_add_popup = new Ticket_add('.popup_ticket_add');});"></div>
                                            </div>
                                        </div>
                                        <div class="ticket_bottom_tools_wrap">
                                            <div class="list_type_tab_wrap">
                                                <div onclick="${this.instance}.switch_type('ing');" class="${this.list_status_type == "ing" ? "tab_selected": ""}">활성화</div>
                                                    <div style="width: 2px; height: 12px;background-color: #f5f2f3; margin:8px;"></div>
                                                <div onclick="${this.instance}.switch_type('end');" style="width:48px;" class="${this.list_status_type == "end" ? "tab_selected" : ""}">비활성화</div>
                                            </div>
                                        </div>
                                            `
                                ,
                "initial_page":`<div id="${this.subtargetHTML}"><div id="ticket_display_panel"></div><div id="ticket_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px;padding:0 16px;box-sizing:border-box;"></div></div>`
            }
        );
    }
}

class Ticket_func{
    static create(data, callback){
        $.ajax({
            url:'/trainer/add_ticket_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                callback();
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static read(data, callback){
        //데이터 형태 {"ticket_id":""};
        $.ajax({
            url:'/trainer/get_ticket_info/',
            type:'GET',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                let json = JSON.parse(data);
                callback(json);
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static delete(data, callback){
        //데이터 형태 {"ticket_id":""};
        $.ajax({
            url:'/trainer/delete_ticket_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                callback();
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static update(data, callback){
        //데이터 형태 {"ticket_id":"", "ticket_name":"", "ticket_note":""};
        $.ajax({
            url:'/trainer/update_ticket_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                callback();
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static status(data, callback){
        //데이터 형태 {"ticket_id":"", "state_cd":""};
        $.ajax({
            url:'/trainer/update_ticket_status_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                callback(data);
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static read_member_list(data, callback){
        $.ajax({
            url:'/trainer/get_ticket_ing_member_list/',
            type:'GET',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                let json = JSON.parse(data);
                callback(json);
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static update_lecture(type, data, callback){
        let url;
        if(type == ADD){
            url = '/trainer/add_ticket_lecture_info/';
        }else if(type == DELETE){
            url = '/trainer/delete_ticket_lecture_info/';
        }
        $.ajax({
            url: url,
            type:'POST',
            data: data,
            dataType : 'html',
            async:false,
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                if(callback != undefined){
                    callback();
                }
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }
}