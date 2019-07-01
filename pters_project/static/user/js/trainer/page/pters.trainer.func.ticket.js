class Ticket{
    constructor(targetHTML, instance){
        this.page_name = 'ticket';
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.data_length = 0;
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


    //회원 리스트 서버에서 불러오기
    request_ticket_list(status ,callback){
        //sort_order_by : ticket_type_seq, ticket_name, ticket_member_many, ticket_member_few, ticket_create_new, ticket_create_old
        let url;
        if(status=='ing'){
            url = '/trainer/get_group_ing_list/';
        }else if (status=='end'){
            url = '/trainer/get_package_end_list/';
        }else{
            url = '/trainer/get_package_list/';
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
        if(current_page != this.page_name){
            return false;
        }

        let ticket_id, ticket_name, ticket_member_number, ticket_end_member_number, ticket_note, length;

        if(list_status_type == "ing"){
            ticket_id = jsondata.package_id;
            ticket_name = jsondata.package_name;
            // ticket_type_text = jsondata.package_type_cd_nm;
            ticket_member_number = jsondata.package_ing_member_num;
            ticket_end_member_number = jsondata.package_end_member_num;
            ticket_note = jsondata.package_note;
            length = ticket_id.length;
            this.list_status_type_text = "진행중";
        }else if(list_status_type == "end"){
            ticket_id = jsondata.package_id;
            ticket_name = jsondata.package_name;
            // ticket_type_text = jsondata.package_type_cd_nm;
            ticket_member_number = jsondata.package_ing_member_num;
            ticket_end_member_number = jsondata.package_end_member_num;
            ticket_note = jsondata.package_note;
            length = ticket_id.length;
            this.list_status_type_text = "종료";
        }

        this.list_type_text = "수강권";
        this.data_length = length;

        let html_temp = [];
        for(let i=0; i<length; i++){
            let onclick = `layer_popup.open_layer_popup(${POPUP_AJAX_CALL}, '${POPUP_ADDRESS_TICKET_VIEW}', 100, ${POPUP_FROM_RIGHT}, {'ticketid':${ticket_id[i]}});`;
            let html = `<article class="ticket_wrapper" data-ticketid="${ticket_id[i]}" onclick="${onclick}">
                            <div class="ticket_data_u">
                                <div class="ticket_name">${ticket_name[i]}</div>
                                <div class="ticket_note">${ticket_note[i]}</div>
                            </div>
                            <div class="ticket_data_b">
                                <div class="ticket_member_number">${ticket_member_number[i]}명<span style="font-size:10px;color:#8d8d8d;">(현재) </span> <span style="font-size:10px">${ticket_end_member_number[i]}명</span><span style="font-size:10px;color:#8d8d8d;">(종료)</span></div>
                                
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
                                                <span>${this.list_type_text} </span>
                                                <span class="">[${this.list_status_type_text}] ${this.data_length}개</span>
                                            </div>
                                            <div class="ticket_tools_wrap">
                                                <div class="swap_list" onclick="${this.instance}.switch_type();"></div>
                                                <div class="search_ticket"></div>
                                                <div class="add_ticket" onclick="layer_popup.open_layer_popup(${POPUP_AJAX_CALL}, '${POPUP_ADDRESS_TICKET_ADD}', 95, ${POPUP_FROM_BOTTOM}, {'data':null})"></div>
                                            </div>
                                        </div>`
                                ,
                "initial_page":`<div id="${this.subtargetHTML}"><div id="ticket_display_panel"></div><div id="ticket_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div></div>`
            }
        )
    }
}