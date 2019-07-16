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
    }

    init(list_status_type){
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page

        if(list_status_type==undefined){
            list_status_type = this.list_status_type;
        }

        this.list_status_type = list_status_type;

        this.render_upper_box();
        this.request_ticket_list(list_status_type, (jsondata) => {
            this.render_ticket_list(jsondata, list_status_type);
            this.render_upper_box();
        });

    }


    //수강권 리스트 서버에서 불러오기
    request_ticket_list(status ,callback){
        //sort_order_by : ticket_type_seq, ticket_name, ticket_member_many, ticket_member_few, ticket_create_new, ticket_create_old
        let url;
        if(status=='ing'){
            url = '/trainer/get_ticket_ing_list/';
        }else if (status=='end'){
            url = '/trainer/get_ticket_end_list/';
        }
        let start_time;
        let end_time;
        $.ajax({
            url:url,
            type:'GET',
            // data: {"page": ticket_page_num, "sort_val": ticket_sort_val, "sort_order_by":ticket_sort_order_by, "keyword":ticket_keyword},
            data: {"page": 1, "sort_val": 0, "sort_order_by":0, "keyword":""},
            // dataType : 'html',
    
            beforeSend:function(){
                start_time = performance.now();
                ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function(data){
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

        console.log(jsondata)

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
            let ticket_lectures_included_name_html = ticket_lectures_included_name.map(el => `<div>${el}</div>`).join('');

            let onclick = `layer_popup.open_layer_popup(${POPUP_AJAX_CALL}, '${POPUP_ADDRESS_TICKET_VIEW}', 100, ${POPUP_FROM_RIGHT}, {'ticket_id':${ticket_id}});`;
            let html = `<article class="ticket_wrapper" data-ticketid="${ticket_id}" onclick="${onclick}">
                            <div class="ticket_data_u">
                                <div class="ticket_name">${ticket_name}</div>
                                <div class="ticket_note">${ticket_note}</div>
                            </div>
                            <div class="ticket_data_b">
                                <div class="ticket_member_number_wrap">
                                    <div class="ticket_data_title">회원</div>
                                    <div class="ticket_member_number">
                                        ${list_status_type == "ing" ? ticket_member_number : ticket_end_member_number}명
                                    </div>
                                </div>
                                
                                <div class="ticket_lectures_wrap">
                                    <div class="ticket_data_title">포함된 수업</div>
                                    <div class="ticket_lectures">
                                        ${ticket_lectures_included_name_html}
                                    </div>
                                </div>
                            </div>
                        </article>`
            html_temp.push(html);
        }

        document.querySelector('#ticket_content_wrap').innerHTML = html_temp.join("");
        $('#root_content').scrollTop(1);
    }


    //리스트 타입을 스위치
    switch_type(){
        switch(this.list_status_type){
            case "ing":
                this.init("end");
            break;

            case "end":
                this.init("ing");
            break;
        }
    }

    static_component(){
        return(
            {    "ticket_upper_box":`   <div class="ticket_upper_box">
                                            <div style="display:inline-block;width:200px;">
                                                <div style="display:inline-block;width:200px;">
                                                    <span style="font-size:20px;font-weight:bold;">수강권 ${this.data_length}</span>
                                                </div>
                                                
                                            </div>
                                            <div class="ticket_tools_wrap">
                                                <div class="swap_list" onclick="${this.instance}.switch_type();"></div>
                                                <div class="search_ticket"></div>
                                                <div class="add_ticket" onclick="layer_popup.open_layer_popup(${POPUP_AJAX_CALL}, '${POPUP_ADDRESS_TICKET_ADD}', 95, ${POPUP_FROM_BOTTOM}, {'data':null})"></div>
                                            </div>
                                        </div>
                                        <div class="ticket_bottom_tools_wrap">
                                            <div class="list_type_tab_wrap">
                                                <div onclick="${this.instance}.switch_type();" class="${this.list_status_type == "ing" ? "tab_selected" : ""}">활성화</div>
                                                <div onclick="${this.instance}.switch_type();" class="${this.list_status_type == "end" ? "tab_selected" : ""}">비활성화</div>
                                            </div>
                                        </div>
                                            `
                                ,
                "initial_page":`<div id="${this.subtargetHTML}"><div id="ticket_display_panel"></div><div id="ticket_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div></div>`
            }
        )
    }
}

class Ticket_func{
    static create(data, callback){
        //데이터 형태 {"ticket_name":"", "ticket_note":"", "ticket_list":[""]};
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
            }
        });
    }
}