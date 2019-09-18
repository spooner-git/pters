class Member {
    constructor (targetHTML, instance){
        this.page_name = "member";
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.member_length = 0;
        this.member_ing_length = 0;
        this.member_end_length = 0;
        this.member_list_type_text = "";
        this.list_type = "ing";

        this.search = false;
        this.search_value = "";

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해
    }

    init (list_type){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;

        if(list_type == undefined){
            list_type = this.list_type;
        }

        this.list_type = list_type;

        if(this.received_data_cache != null){
            this.render_member_list(this.received_data_cache, list_type);
        }
        this.render_upper_box();
        this.request_member_list(list_type, (jsondata) => {
            this.received_data_cache = jsondata;
            this.render_member_list(jsondata, list_type);
            this.render_upper_box();
        });
    }


    //회원 리스트 서버에서 불러오기
    request_member_list (list_type, callback, async){
        var start_time;
        var end_time;
        var url;
        if(async == undefined){
            async = true;
        }
        if(list_type == 'ing'){
            url = '/trainer/get_member_ing_list/';
        }else if(list_type == 'end'){
            url = '/trainer/get_member_end_list/';
        }
        $.ajax({
            url:url,
            dataType : 'JSON',
            async:async,
    
            beforeSend:function (){
                ajax_load_image(SHOW);
                start_time = performance.now();
            },
    
            //통신성공시 처리
            success:function (data){
                // var jsondata = JSON.parse(data);
                end_time = performance.now();
                // if(jsondata.messageArray.length>0){
                //     console.log("에러:" + jsondata.messageArray);
                // }else{
                console.log(end_time-start_time+'ms');
                if(callback != undefined){
                    callback(data);
                }
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


    //상단을 렌더링
    render_upper_box (){
        if(current_page != this.page_name){
            return false;
        }

        this.search = false;
        let component = this.static_component();
        document.getElementById('member_display_panel').innerHTML = component.member_upper_box;
    }

    //회원 리스트를 렌더링
    render_member_list (jsondata, list_type){
        if(current_page != this.page_name){
            return false;
        }

        let whole_data, length;

        if(list_type == "ing"){
            whole_data = jsondata.current_member_data;
            length = whole_data.length;
            this.member_ing_length = length;
            this.member_list_type_text = "진행중";
        }else if(list_type == "end"){
            whole_data = jsondata.finish_member_data;
            length = whole_data.length;
            this.member_end_length = length;
            this.member_list_type_text = "종료";
        }

        this.member_length = length;

        let html_temp = [];
        for (let i=0; i<length; i++){
            let data = whole_data[i];
            let member_id = data.member_id;
            let member_name = data.member_name;
            let member_phone = data.member_phone;
            let member_reg = data.member_ticket_reg_count;
            let member_rem = data.member_ticket_rem_count;
            let end_date = data.end_date;
            let end_date_text = DateRobot.to_text(end_date, '', '', SHORT);
            let remain_date = Math.round((new Date(end_date).getTime() - new Date().getTime()) / (1000*60*60*24));
            let member_counts_text = list_type == "ing" ? member_rem+'회 / '+remain_date+'일 / - '+end_date_text+' 까지' : '종료됨';
            if(remain_date < 0 && list_type == "ing"){
                member_counts_text = "<span style='color:#fe4e65;'>"+Math.abs(remain_date) +"일 지남</span>";
            }

            let onclick = `layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_MEMBER_VIEW}', 100, ${POPUP_FROM_RIGHT}, {'member_id':${member_id}}, ()=>{
                member_view_popup = new Member_view('.popup_member_view', ${member_id}, 'member_view_popup');});`;
            let html = `<article class="member_wrapper" data-member_id="${member_id}" data-name="${member_name}" onclick="${onclick}" style="color:${list_type == "ing" ? "" : '#a3a0a0'}">
                            <div class="member_data_l">
                                <img src="/static/common/icon/tab_bar/icon_member_off.png">
                            </div>                
                            <div class="member_data_c">
                                <div class="member_name">${member_name}</div>
                                <div class="member_counts">
                                    ${member_counts_text}
                                </div>
                            </div>
                            <div class="member_data_r">
                                <div class="member_phone" onclick="event.stopPropagation();location.href='tel:${member_phone}'" ${member_phone == "None" ? "style='display:none;'" : ""}>
                                    <img src="/static/common/icon/icon_gap_black.png" class="icon_contact">
                                </div>
                                <div class="member_sms" onclick="event.stopPropagation();location.href='sms:${member_phone}'" ${member_phone== "None" ? "style='display:none;'" : ""}>

                                    <img src="/static/common/icon/icon_gap_black.png" class="icon_contact">
                                </div>
                            </div>
                        </article>`;
            html_temp.push(html);
        }

        if(html_temp.length == 0){
            html_temp.push(`<div style="font-size:14px;padding:16px;">등록된 회원이 없습니다.</div>`);
        }

        document.querySelector('#member_content_wrap').innerHTML = html_temp.join("");
    }

    render_search_tool(type){
        let html = `<input type="text" class="search_input" placeholder="검색" onclick="event.stopPropagation();" onkeyup="${this.instance}.search_member_by_typing(event)">`;
        if(type == "clear"){
            html = '';
        }
        
        document.querySelector('.member_search_tool').innerHTML = html;
    }


    //리스트 타입을 스위치
    switch_type (type){
        this.received_data_cache = null;
        // console.log(context);
        if(type == this.list_type){
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

    search_member_tool_visible (event){
        event.stopPropagation();
        event.preventDefault();
        switch(this.search){
        case true:
            this.search = false;
            document.getElementsByClassName('search_input')[0].value = this.search_value;
            this.render_search_tool('clear');
            event.target.style.backgroundImage = 'url("/static/common/icon/icon_search_black.png")';
            break;
        case false:
            this.search = true;
            this.render_search_tool('draw');
            document.getElementsByClassName('search_input')[0].value = this.search_value;
            
            event.target.style.backgroundImage = 'url("/static/common/icon/icon_x_black.png")';
            break;
        }
    }

    search_member_by_typing (event){
        let value = event.target.value;
        this.search_value = value;
        Array.from(document.getElementsByClassName('member_wrapper')).forEach((el)=>{
            let name = el.dataset.name;
            if(name.match(value)){
                el.style.display = 'block';
                // $("#root_content").scrollTop(1);
            }else{
                el.style.display = 'none';
            }
        });
    }

    static_component (){
        return(
            {
                member_upper_box:`   <div class="member_upper_box">
                                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                                            <div style="display:inline-block;">회원 </div>
                                            <div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.list_type == "ing" ? this.member_ing_length : this.member_end_length}</div>
                                        </div>
                                        <div class="member_tools_wrap">
                                            <div class="search_member" onclick="${this.instance}.search_member_tool_visible(event);">
                                            </div>
                                            <div class="add_member" onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_MEMBER_ADD}', 100, ${POPUP_FROM_BOTTOM}, {'select_date':null}, ()=>{
                                                member_add_popup = new Member_add('.popup_member_add', null, 'member_add_popup');});"></div>
                                        </div>
                                    </div>
                                    <div class="member_search_tool"></div>
                                    <div class="member_bottom_tools_wrap">
                                        <div class="list_type_tab_wrap">
                                            <div onclick="${this.instance}.switch_type('ing');" class="${this.list_type == "ing" ? "tab_selected": ""}">진행중</div>
                                            <div style="width: 2px; height: 12px;background-color: #f5f2f3; margin:8px;"></div>
                                            <div onclick="${this.instance}.switch_type('end');" style="width:24px;" class="${this.list_type == "end" ? "tab_selected" : ""}">종료</div>
                                        </div>
                                        <div class="list_sort_select_wrap">
                                            <select>
                                                <option>이름순</option>
                                                <option>남은 횟수순</option>
                                                <option>등록 횟수순</option>
                                            </select>
                                        </div>
                                    </div>
                                    `
                ,
                initial_page:`<div id="member_display_panel"></div>
                                <div id="member_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px; padding-top:6px; padding-bottom:20px;"></div>`
            }
        );
    }
}

class Member_func{
    static create(data, callback){
        $.ajax({
            url:'/trainer/add_member_ticket_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(received_data){
                let data = JSON.parse(received_data);
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static create_pre(data, callback){
        $.ajax({
            url:'/login/add_member_info_no_email/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            complete:function(){
            },
    
            success:function(received_data){
                let data = JSON.parse(received_data);
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }
    
    static create_ticket_re(data, callback){
        $.ajax({
            url:'/trainer/add_member_ticket_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            complete:function(){
            },
    
            success:function(received_data){
                let data = JSON.parse(received_data);
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static read(data, callback){
        //데이터 형태 {"member_id":""};
        $.ajax({
            url:'/trainer/get_member_info/',
            type:'GET',
            data: data,
            dataType : 'JSON',
    
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
                // let json = JSON.parse(data);
                callback(data);
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static read_ticket_list(data, callback){
        //데이터 형태 {"member_id":""};
        $.ajax({
            url:'/trainer/get_member_ticket_list/',
            type:'GET',
            data: data,
            dataType : 'JSON',
    
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
                // let json = JSON.parse(data);
                callback(data);
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static read_schedule_list_by_ticket(data, callback){
        //데이터 형태 {"member_id":""};
        $.ajax({
            url:'/trainer/get_member_schedule_all/',
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
        //데이터 형태 {"member_id":""};
        $.ajax({
            url:'/trainer/delete_member_info/',
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
        //데이터 형태 {"member_id":"", "first_name":"", "phone":"", "sex":"", "birthday":""};
        $.ajax({
            url:'/trainer/update_member_info/',
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
            url:'/trainer/update_member_status_info/',
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

    static connection(data, callback){
        // {"member_id":"", "member_auth_cd":""}
        $.ajax({
            url:'/trainer/update_member_connection_info/',
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
                // location.reload();
            }
        });
    }

    static ticket_status(data, callback){
        // {"member_ticket_id":"", "state_cd":"", "refund_price":"", "refund_date":""}
        $.ajax({
            url:'/trainer/update_member_ticket_status_info/',
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
                // location.reload();
            }
        });
    }

    static ticket_update(data, callback){
    // {"member_ticket_id":"", "note":"", "start_date":"", "end_date":"", "price":"", "refund_price":"", "refund_date":"", "member_ticket_reg_count":""}
        $.ajax({
            url:'/trainer/update_member_ticket_info/',
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
                // location.reload();
            }
        });
    }

    static ticket_delete(data, callback){
        $.ajax({
            url:'/trainer/delete_member_ticket_info/',
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
                // location.reload();
            }
        });
    }
    
}

/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_MEMBER_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_MEMBER_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 


