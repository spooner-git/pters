// class Ticket{
//     constructor(targetHTML, instance){
//         this.page_name = 'ticket_page_type';
//         this.targetHTML = targetHTML;
//         this.instance = instance;

//         this.data_length = 0;
//         this.ticket_ing_length = 0;
//         this.ticket_end_length = 0;
//         this.list_type_text = "";
//         this.list_status_type_text = "";
//         this.list_status_type = "ing"; //ing, end

//         this.sort_val = SORT_TICKET_NAME;
//         this.sort_order_by = SORT_ORDER_ASC;
//         this.sort_value_text = '수강권명 가나다순';

//         this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해
//     }

//     init(list_status_type){
//         if(current_page != this.page_name){
//             return false;
//         }

//         let component = this.static_component();
//         document.querySelector(this.targetHTML).innerHTML = component.initial_page;

//         if(list_status_type==undefined){
//             list_status_type = this.list_status_type;
//         }

//         this.list_status_type = list_status_type;

//         if(this.received_data_cache != null){
//             this.render_ticket_list(this.received_data_cache, list_status_type);
//         }
//         this.render_upper_box();
//         this.request_ticket_list(list_status_type, (jsondata) => {
//             this.received_data_cache = jsondata;
//             this.render_ticket_list(jsondata, list_status_type);
//             this.render_upper_box();
//         });

//     }


//     //수강권 리스트 서버에서 불러오기
//     request_ticket_list(status, callback, async){
//         //sort_order_by : ticket_type_seq, ticket_name, ticket_member_many, ticket_member_few, ticket_create_new, ticket_create_old
//         let url;
//         if(status=='ing'){
//             url = '/trainer/get_ticket_ing_list/';
//         }else if (status=='end'){
//             url = '/trainer/get_ticket_end_list/';
//         }
//         if(async == undefined){
//             async = true;
//         }
//         $.ajax({
//             url:url,
//             type:'GET',
//             data: {"sort_val": this.sort_val, "sort_order_by":this.sort_order_by, "keyword":""},
//             dataType : 'JSON',
//             async:async,
    
//             beforeSend:function(){
//                 ajax_load_image(SHOW);
//             },
    
//             //통신성공시 처리
//             success:function(data){
//                 if(data.messageArray != undefined){
//                     if(data.messageArray.length > 0){
//                         show_error_message(data.messageArray[0]);
//                         return false;
//                     }
//                 }
//                 callback(data);
//                 return data;
//             },

//             //보내기후 팝업창 닫기
//             complete:function(){
//                 ajax_load_image(HIDE);
//             },
    
//             //통신 실패시 처리
//             error:function(){
//                 console.log('server error');
//             }
//         })
//     }

//     //상단을 렌더링
//     render_upper_box(){
//         if(current_page != this.page_name){
//             return false;
//         }

//         let component = this.static_component();
//         document.getElementById('ticket_display_panel').innerHTML = component.ticket_upper_box;
//     }

//     //수강권 리스트를 렌더링
//     render_ticket_list(jsondata, list_status_type){

//         if(current_page != this.page_name){
//             return false;
//         }

//         let whole_data, length;

//         if(list_status_type == "ing"){
//             whole_data = jsondata.current_ticket_data;
//             length = whole_data.length;
//             this.ticket_ing_length = length;
//             this.list_status_type_text = "진행중";
//         }else if(list_status_type == "end"){
//             whole_data = jsondata.finish_ticket_data;
//             length = whole_data.length;
//             this.ticket_end_length = length;
//             this.list_status_type_text = "종료";
//         }

//         this.list_type_text = "수강권";
//         this.data_length = length;

//         let html_temp = [];
//         for(let i=0; i<length; i++){
//             let data = whole_data[i];
//             let ticket_id = data.ticket_id;
//             let ticket_name = data.ticket_name;
//             let ticket_note = data.ticket_note != undefined ? data.ticket_note : "";
//             let ticket_member_number = data.ticket_ing_member_num;
//             let ticket_end_member_number = data.ticket_end_member_num;
//             let ticket_lectures_included_name = data.ticket_lecture_list;
//             let ticket_lectures_state_cd = data.ticket_lecture_state_cd_list;
//             let ticket_lectures_included_name_html = [];
//             let ticket_lectures_color = data.ticket_lecture_ing_color_cd_list;
//             let length_lecture = ticket_lectures_included_name.length;
//             for(let j=0; j<length_lecture; j++){
//                 let html;
//                 if(ticket_lectures_state_cd[j] == STATE_END_PROGRESS){
//                     html = `<div style="color:#cccccc;text-decoration:line-through;">
//                                 <div class="ticket_lecture_color" style="background-color:${list_status_type == "ing" ? ticket_lectures_color[j]: '#a3a0a0'}"></div>
//                                 ${ticket_lectures_included_name[j]}
//                             </div>`;
//                 }else if(ticket_lectures_state_cd[j] == STATE_IN_PROGRESS){
//                     html = `<div>
//                                 <div class="ticket_lecture_color" style="background-color:${list_status_type == "ing" ? ticket_lectures_color[j]: '#a3a0a0'}"></div>
//                                 ${ticket_lectures_included_name[j]}
//                             </div>`;
//                 }
//                 ticket_lectures_included_name_html.push(html);
//             }

//             let onclick = `layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_TICKET_VIEW}', 100, ${POPUP_FROM_RIGHT}, {'ticket_id':${ticket_id}}, ()=>{
//                 ticket_view_popup = new Ticket_view('.popup_ticket_view', ${ticket_id}, 'ticket_view_popup');});`;
//             let html = `<article class="ticket_wrapper" data-ticketid="${ticket_id}" onclick="${onclick}" style="opacity:${list_status_type == "ing" ? "1" : '0.6'}">
//                             <div class="ticket_data_u">
//                                 <div class="ticket_name">
//                                     ${ticket_name}
//                                     <div class="ticket_member_number">
//                                         ${list_status_type == "ing" ? ticket_member_number : ticket_end_member_number}명
//                                     </div>
//                                 </div>
//                                 <div class="ticket_note">${ticket_note}</div>
//                             </div>
//                             <div class="ticket_data_b">
//                                 <div class="ticket_lectures">
//                                     ${ticket_lectures_included_name_html.join('')}
//                                 </div>
//                             </div>
//                         </article>`;
//             html_temp.push(html);
//         }

//         document.querySelector('#ticket_content_wrap').innerHTML = html_temp.join("");
//     }


//     //리스트 타입을 스위치
//     switch_type(type){
//         this.received_data_cache = null;
//         if(type == this.list_status_type){
//             return false;
//         }
//         switch(type){
//             case "ing":
//                 this.init("ing");
//             break;

//             case "end":
//                 this.init("end");
//             break;
//         }
//     }

//     static_component(){
//         return(
//             {    "ticket_upper_box":`   <div class="ticket_upper_box">
//                                             <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
//                                                 <div style="display:inline-block;">수강권 </div>
//                                             <!--<div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>-->
//                                             </div>
//                                             <div class="ticket_tools_wrap">
//                                                 <div class="search_ticket"></div>
//                                                 <div class="add_ticket" onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_TICKET_ADD}', 100, ${POPUP_FROM_BOTTOM}, {'select_date':null}, ()=>{
//                                                     ticket_add_popup = new Ticket_add('.popup_ticket_add');});"></div>
//                                             </div>
//                                         </div>
//                                         <div class="ticket_bottom_tools_wrap">
//                                             <div class="list_type_tab_wrap">
//                                                 <div onclick="${this.instance}.switch_type('ing');" class="${this.list_status_type == "ing" ? "tab_selected": ""}">활성화</div>
//                                                     <div style="width: 2px; height: 12px;background-color: #f5f2f3; margin:8px;"></div>
//                                                 <div onclick="${this.instance}.switch_type('end');" style="width:48px;" class="${this.list_status_type == "end" ? "tab_selected" : ""}">비활성화</div>
//                                             </div>
//                                         </div>
//                                             `
//                                 ,
//                 "initial_page":`<div id="${this.subtargetHTML}"><div id="ticket_display_panel"></div><div id="ticket_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px;padding:0 16px;box-sizing:border-box;"></div></div>`
//             }
//         );
//     }
// }

class Ticket{
    constructor(install_target, instance){
        this.target = {install: install_target, toolbox:'section_ticket_list_toolbox', content:'section_ticket_list_content'};

        this.instance = instance;
        this.page_name = 'ticket_page_type';
        this.data = null;
        this.data_length = 0;
        this.ticket_ing_length = 0;
        this.ticket_end_length = 0;
        this.list_type_text = "";
        this.list_status_type_text = "";
        this.list_status_type = "ing"; //ing, end

        this.search = false;
        this.search_value = "";

        this.sort_val = SORT_TICKET_NAME;
        this.sort_order_by = SORT_ORDER_ASC;
        this.sort_value_text = '수강권명 가나다순';

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해
    }

    init(){
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
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });
    }
    
    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        // let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();${this.instance}.clear();" class="obj_icon_prev"></span>`;
        // let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        // let top_right = `<span class="icon_right">
        //                         <img src="/static/common/icon/icon_search_black.png" class="obj_icon_24px" style="padding-right:12px;" onclick="${this.instance}.search_tool_visible(event);">
        //                         <img src="/static/common/icon/icon_plus_pink.png" class="obj_icon_24px" onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_TICKET_ADD}', 100, ${POPUP_FROM_BOTTOM}, {'select_date':null}, ()=>{
        //                             ticket_add_popup = new Ticket_add('.popup_ticket_add');});">
        //                 </span>`;
        // let content =   `<div class="search_bar"></div>
        //                 <section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
        //                 <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        // let html = PopupBase.base(top_left, top_center, top_right, content, "");

        let html = `<div id="${this.subtargetHTML}">
                        <div id="ticket_display_panel">
                            ${this.dom_assembly_toolbox()}
                        </div>
                        <div id="ticket_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px;padding:0 16px;box-sizing:border-box;">
                            ${this.dom_assembly_content()}
                        </div>
                    </div>`;

        document.querySelector(this.target.install).innerHTML = html;
        // document.querySelector('.popup_ticket_list .wrapper_top').style.border = 0;
        // PopupBase.top_menu_effect(this.target.install);
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

            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            let onclick = `layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_TICKET_VIEW}', 100, ${popup_style}, {'ticket_id':${ticket_id}}, ()=>{
                ticket_view_popup = new Ticket_view('.popup_ticket_view', ${ticket_id}, 'ticket_view_popup');});`;
            let html = `<article class="ticket_wrapper" data-text="${ticket_name}" data-ticketid="${ticket_id}" onclick="${onclick}" style="opacity:${this.list_status_type == "ing" ? "1" : '0.6'}">
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

        // 계속 추가되더라도 동적으로 처리하기 위해 작성 - hkkim 20191001
        let user_options_array = [];
        user_options_array.push(`'${SORT_TICKET_NAME+'_'+SORT_ORDER_ASC}':{text:'수강권명 가나다순', callback:()=>{${this.instance}.sort_val = ${SORT_TICKET_NAME}; ${this.instance}.sort_order_by= ${SORT_ORDER_ASC}; ${this.instance}.sort_value_text = '수강권명 가나다순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TICKET_MEMBER_COUNT+'_'+SORT_ORDER_ASC}':{text:'참여중 회원 많은 순', callback:()=>{${this.instance}.sort_val = '${SORT_TICKET_MEMBER_COUNT}'; ${this.instance}.sort_order_by= ${SORT_ORDER_DESC}; ${this.instance}.sort_value_text = '참여중 회원 많은 순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TICKET_MEMBER_COUNT+'_'+SORT_ORDER_DESC}':{text:'참여중 회원 적은 순', callback:()=>{${this.instance}.sort_val = '${SORT_TICKET_MEMBER_COUNT}'; ${this.instance}.sort_order_by= ${SORT_ORDER_ASC};${this.instance}.sort_value_text = '참여중 회원 적은 순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TICKET_CREATE_DATE+'_'+SORT_ORDER_ASC}':{text:'생성 일자 최근 순', callback:()=>{${this.instance}.sort_val = '${SORT_TICKET_CREATE_DATE}'; ${this.instance}.sort_order_by= ${SORT_ORDER_DESC};${this.instance}.sort_value_text = '생성 일자 최근 순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TICKET_CREATE_DATE+'_'+SORT_ORDER_DESC}':{text:'생성 일자 과거 순', callback:()=>{${this.instance}.sort_val = '${SORT_TICKET_CREATE_DATE}'; ${this.instance}.sort_order_by= ${SORT_ORDER_ASC};${this.instance}.sort_value_text = '생성 일자 과거 순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        let user_option = `{`;
        for(let i=0; i<user_options_array.length; i++){
            user_option += user_options_array[i] + ',';
        }
        user_option += `}`;

        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*user_options_array.length;
        let root_content_height = $root_content.height();

        let html = `<div class="ticket_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">수강권 </span>
                            <div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>
                        </div>
                        <div class="ticket_tools_wrap">
                            <div class="search_ticket" onclick="${this.instance}.search_tool_visible(event);">
                            </div>
                            <div class="add_ticket" onclick="${this.instance}.event_add_ticket()"></div>
                        </div>
                    </div>
                    <div class="search_bar"></div>
                    <div class="ticket_bottom_tools_wrap">
                        <div class="list_type_tab_wrap">
                            <div onclick="${this.instance}.switch_type('ing');" class="${this.list_status_type == "ing" ? "tab_selected": ""}">활성화</div>
                                <div style="width: 2px; height: 12px;background-color: #f5f2f3; margin:8px;"></div>
                            <div onclick="${this.instance}.switch_type('end');" style="width:48px;" class="${this.list_status_type == "end" ? "tab_selected" : ""}">비활성화</div>
                        </div>
                        <div class="list_sort_select_wrap" 
                        onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_OPTION_SELECTOR}', 100*(${layer_popup_height})/${root_content_height}, ${POPUP_FROM_BOTTOM}, null, ()=>{
                            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, ${user_option}
                            );
                        });">
                            <!--<select>
                                <option>이름순</option>
                                <option>남은 횟수순</option>
                                <option>등록 횟수순</option>
                            </select>-->
                            ${this.sort_value_text} <img src="/static/common/icon/icon_arrow_expand_light_grey.png" style="width:24px; height:24px; vertical-align: middle;">
                        </div>
                    </div> `;
        return html;
    }

    render_search_tool(type){
        let html = `<input type="text" class="search_input" placeholder="검색" onclick="event.stopPropagation();" onkeyup="${this.instance}.search_by_typing(event)">`;
        if(type == "clear"){
            html = '';
        }
        
        document.querySelector('.search_bar').innerHTML = html;
    }

    search_tool_visible (event){
        event.stopPropagation();
        event.preventDefault();
        switch(this.search){
        case true:
            this.search = false;
            document.getElementsByClassName('search_input')[0].value = this.search_value;
            this.render_search_tool('clear');
            event.target.src = '/static/common/icon/icon_search_black.png';
            break;
        case false:
            this.search = true;
            this.render_search_tool('draw');
            document.getElementsByClassName('search_input')[0].value = this.search_value;
            
            event.target.src = '/static/common/icon/icon_x_black.png';
            break;
        }
    }

    search_by_typing (event){
        let value = event.target.value;
        this.search_value = value;
        Array.from(document.getElementsByClassName('ticket_wrapper')).forEach((el)=>{
            let name = el.dataset.text;
            if(name.match(value)){
                el.style.display = 'block';
                // $("#root_content").scrollTop(1);
            }else{
                el.style.display = 'none';
            }
        });
    }

    //수강권 리스트 서버에서 불러오기
    request_ticket_list (status, callback, async){
        //sort_order_by : ticket_type_seq, ticket_name, ticket_member_many, ticket_member_few, ticket_create_new, ticket_create_old
        let url;
        if(status=='ing'){
            url = '/trainer/get_ticket_ing_list/';
        }else if (status=='end'){
            url = '/trainer/get_ticket_end_list/';
        }

        $.ajax({
            url:url,
            type:'GET',
            data: {"sort_val": this.sort_val, "sort_order_by":this.sort_order_by, "keyword":""},
            dataType : 'JSON',
            async: async,

            beforeSend:function (){
                ajax_load_image(SHOW);
            },

            //통신성공시 처리
            success:function (data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
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

    event_add_ticket(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_ADD, 100, popup_style, null, ()=>{
            ticket_add_popup = new Ticket_add('.popup_ticket_add');});
    }

    //리스트 타입을 스위치
    switch_type (type){
        this.received_data_cache = null;
        if(type == this.list_status_type){
            return false;
        }
        switch(type){
        case "ing":
            this.list_status_type = "ing";
            this.init("ing");
            break;

        case "end":
            this.list_status_type = "end";
            this.init("end");
            break;
        }
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