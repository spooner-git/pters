class Ticket_list {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_ticket_list_toolbox', content:'section_ticket_list_content'};

        this.instance = instance;
        this.page_name = 'ticket_list';
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

        this.toggle_ticket_lectures_display = ON;

        this.init();
    }

    init(){
        this.set_initial_data();
    }

    reset(){
        this.request_ticket_list(this.list_status_type, (data)=>{
            this.data = data;
            if(this.list_status_type == "ing"){
                this.data_length = this.data.current_ticket_data.length;
            }else if(this.list_status_type == "end"){
                this.data_length = this.data.finish_ticket_data.length;
            }
            this.render_toolbox();
            this.render_content();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });
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

        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();ticket_list_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right">
                                <span  onclick="${this.instance}.fold_ticket_lecture_list()">
                                    ${this.toggle_ticket_lectures_display == ON ? CImg.fold("", {"vertical-align":"middle"}) : CImg.unfold("", {"vertical-align":"middle"})}
                                </span>
                                <span class=".search_lecture" onclick="${this.instance}.search_tool_visible(event, this)">
                                    ${CImg.search("", {"vertical-align":"middle"})}
                                </span>
                                <span class=".add_lecture" onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_TICKET_ADD}', 100, ${POPUP_FROM_BOTTOM}, {'select_date':null}, ()=>{
                                    ticket_add_popup = new Ticket_add('.popup_ticket_add');});">
                                    ${CImg.plus("", {"vertical-align":"middle"})}
                                </span>
                        </span>`;
        let content =   `<div class="search_bar"></div>
                        <section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_ticket_list .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
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
            let ticket_price = data.ticket_price;
            let ticket_reg_count = data.ticket_reg_count;
            let ticket_effective_days = data.ticket_effective_days;
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
                    html = `<div style="color:var(--font-domtag);text-decoration:line-through;">
                                <div class="ticket_lecture_color" style="background-color:${this.list_status_type == "ing" ? ticket_lectures_color[j]: 'var(--font-inactive)'}"></div>
                                ${ticket_lectures_included_name[j]}
                            </div>`;
                }else if(ticket_lectures_state_cd[j] == STATE_IN_PROGRESS){
                    html = `<div>
                                <div class="ticket_lecture_color" style="background-color:${this.list_status_type == "ing" ? ticket_lectures_color[j]: 'var(--font-inactive)'}"></div>
                                ${ticket_lectures_included_name[j]}
                            </div>`;
                }
                ticket_lectures_included_name_html.push(html);
            }
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            let onclick = `ticket_list_popup.event_view_ticket(${ticket_id})`;
            let html = `<article class="ticket_wrapper anim_fade_in_vibe_top" data-text="${ticket_name}" data-ticketid="${ticket_id}" onclick="${onclick}" style="opacity:${this.list_status_type == "ing" ? "1" : '0.6'}">
                            <div class="ticket_data_u">
                                <div class="ticket_name">
                                    ${ticket_name}
                                    <div class="ticket_member_number" ${this.list_status_type == "ing" ? "" : 'hidden'}>
                                        ${this.list_status_type == "ing" ? ticket_member_number : ticket_end_member_number}명
                                    </div>
                                </div>
                                <div class="ticket_note">${ticket_note}</div>
                            </div>
                            <div class="ticket_data_m">
                                <div>${ticket_reg_count != 99999 ? ticket_reg_count + " 회" : "횟수 무제한" } / ${ticket_effective_days != 99999 ? ticket_effective_days + " 일간" : "소진시까지"} / ${UnitRobot.numberWithCommas(ticket_price)} 원</div>
                            </div>
                            <div class="ticket_data_b">
                                <div class="ticket_lectures" style="display:${this.toggle_ticket_lectures_display == ON ? "" : "none"}">
                                    ${ticket_lectures_included_name_html.length != 0 ? ticket_lectures_included_name_html.join('') : `<span style='color:var(--font-highlight);'>${CImg.warning(["#fe4e65"], {"vertical-align":"middle", "width":"20px", "height":"20px", "margin-bottom":"4px"})} 포함된 수업이 없습니다.</span>`}
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
        user_options_array.push(`'${SORT_TICKET_NAME+'_'+SORT_ORDER_ASC}':{text:'수강권명 가나다순', callback:()=>{ticket_list_popup.sort_val = ${SORT_TICKET_NAME}; ticket_list_popup.sort_order_by= ${SORT_ORDER_ASC}; ticket_list_popup.sort_value_text = '수강권명 가나다순';ticket_list_popup.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TICKET_MEMBER_COUNT+'_'+SORT_ORDER_ASC}':{text:'참여중 회원 많은 순', callback:()=>{ticket_list_popup.sort_val = '${SORT_TICKET_MEMBER_COUNT}'; ticket_list_popup.sort_order_by= ${SORT_ORDER_DESC}; ticket_list_popup.sort_value_text = '참여중 회원 많은 순';ticket_list_popup.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TICKET_MEMBER_COUNT+'_'+SORT_ORDER_DESC}':{text:'참여중 회원 적은 순', callback:()=>{ticket_list_popup.sort_val = '${SORT_TICKET_MEMBER_COUNT}'; ticket_list_popup.sort_order_by= ${SORT_ORDER_ASC};ticket_list_popup.sort_value_text = '참여중 회원 적은 순';ticket_list_popup.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TICKET_CREATE_DATE+'_'+SORT_ORDER_ASC}':{text:'생성 일자 최근 순', callback:()=>{ticket_list_popup.sort_val = '${SORT_TICKET_CREATE_DATE}'; ticket_list_popup.sort_order_by= ${SORT_ORDER_DESC};ticket_list_popup.sort_value_text = '생성 일자 최근 순';ticket_list_popup.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TICKET_CREATE_DATE+'_'+SORT_ORDER_DESC}':{text:'생성 일자 과거 순', callback:()=>{ticket_list_popup.sort_val = '${SORT_TICKET_CREATE_DATE}'; ticket_list_popup.sort_order_by= ${SORT_ORDER_ASC};ticket_list_popup.sort_value_text = '생성 일자 과거 순';ticket_list_popup.init();layer_popup.close_layer_popup();}}`);
        let user_option = `{`;
        for(let i=0; i<user_options_array.length; i++){
            user_option += user_options_array[i] + ',';
        }
        user_option += `}`;

        let options_padding_top_bottom = 16;
        // let button_height = 8 + 8 + 52;
        let button_height = 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*user_options_array.length;
        let root_content_height = $root_content.height();

        let html = `<div class="ticket_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">수강권 </span>
                            <div style="display:inline-block; color:var(--font-highlight); font-weight:900;">${this.data_length}</div>
                        </div>
                    </div>
                    <div class="ticket_bottom_tools_wrap">
                        <div class="list_type_tab_wrap">
                            <div onclick="${this.instance}.switch_type('ing');" class="list_tab_content ${this.list_status_type == "ing" ? "tab_selected": ""}">활성화</div>
                            <div class="list_tab_divider"></div>
                            <div onclick="${this.instance}.switch_type('end');" class="list_tab_content ${this.list_status_type == "end" ? "tab_selected" : ""}">비활성화</div>
                        </div>
                        <div class="list_sort_select_wrap" 
                        onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_OPTION_SELECTOR}', 100*(${layer_popup_height})/${root_content_height}, ${POPUP_FROM_BOTTOM}, null, ()=>{
                            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, ${user_option}
                            );
                        });">
                            <!--<select>
                                <option>이름순</option>
                                <option>잔여 횟수순</option>
                                <option>등록 횟수순</option>
                            </select>-->
                            ${this.sort_value_text} ${CImg.arrow_expand(["var(--img-sub1)"], {"vertical-align":"middle"})}
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

    event_view_ticket(ticket_id){
        let auth_inspect = pass_inspector.ticket_read();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            show_error_message({title:message});
            return false;
        }

        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_VIEW, 100, popup_style, {'ticket_id':ticket_id}, ()=>{
            ticket_view_popup = new Ticket_view('.popup_ticket_view', ticket_id, 'ticket_view_popup');
        });
    }

    search_tool_visible (event, self){
        event.stopPropagation();
        event.preventDefault();
        switch(this.search){
        case true:
            this.search = false;
            document.getElementsByClassName('search_input')[0].value = this.search_value;
            this.render_search_tool('clear');
            this.search_value = "";
            Array.from(document.getElementsByClassName('ticket_wrapper')).forEach((el)=>{
                $(el).show();
            });
            
            $(self).html(CImg.search("", {"vertical-align":"middle"}));
            break;
        case false:
            this.search = true;
            this.render_search_tool('draw');
            document.getElementsByClassName('search_input')[0].value = this.search_value;
            
            $(self).html(CImg.x("", {"vertical-align":"middle"}));
            break;
        }
    }

    search_by_typing (event){
        let value = event.target.value;
        this.search_value = value;
        Array.from(document.getElementsByClassName('ticket_wrapper')).forEach((el)=>{
            console.log(el.dataset);
            let name = el.dataset.text;
            if(name.match(value)){
                el.style.display = 'block';
                // $("#root_content").scrollTop(1);
            }else{
                el.style.display = 'none';
            }
        });
    }

    fold_ticket_lecture_list(){
        if(this.toggle_ticket_lectures_display == ON){
            this.toggle_ticket_lectures_display = OFF;
        }else{
            this.toggle_ticket_lectures_display = ON;
        }
        this.render();
    }

    //수강권 리스트 서버에서 불러오기
    request_ticket_list (status, callback, load_image){
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

            beforeSend:function (){
                if(load_image == OFF){
                    return;
                }
                // ajax_load_image(SHOW);
            },

            //통신성공시 처리
            success:function (data){
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data); 
                }
                return data;
                // }
            },

            //보내기후 팝업창 닫기
            complete:function (){
                if(load_image == OFF){
                    return;
                }
                // ajax_load_image(HIDE);
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