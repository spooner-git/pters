class Trainer_list {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_trainer_list_toolbox', content:'section_trainer_list_content'};

        this.instance = instance;
        this.page_name = 'trainer_list';
        this.data = null;
        this.data_length = 0;
        this.trainer_ing_length = 0;
        this.trainer_end_length = 0;
        this.list_type_text = "";
        this.list_status_type_text = "";
        this.list_status_type = "ing"; //ing, end

        this.search = false;
        this.search_value = "";

        this.sort_val = SORT_TRAINER_NAME;
        this.sort_order_by = SORT_ORDER_ASC;
        this.sort_value_text = '수업명 가나다순';

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해
        this.init();
    }

    init(){
        this.set_initial_data();
    }

    reset(){
        this.request_trainer_list(this.list_status_type, (data)=>{
            this.data = data;
            if(this.list_status_type == "ing"){
                this.data_length = this.data.current_trainer_data.length;
            }else if(this.list_status_type == "end"){
                this.data_length = this.data.finish_trainer_data.length;
            }
            this.render_toolbox();
            this.render_content();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });
    }

    set_initial_data (){
        this.request_trainer_list(this.list_status_type, (data)=>{
            this.data = data;
            if(this.list_status_type == "ing"){
                this.data_length = this.data.current_trainer_data.length;
            }else if(this.list_status_type == "end"){
                this.data_length = this.data.finish_trainer_data.length;
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

        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();trainer_list_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right">
                                <span class=".search_trainer" onclick="${this.instance}.search_tool_visible(event, this)">
                                    ${CImg.search("", {"vertical-align":"middle"})}
                                </span>
                                <span class=".add_trainer" onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_TRAINER_ADD}', 100, ${POPUP_FROM_BOTTOM}, null, ()=>{
                                    trainer_add_popup = new Trainer_add('.popup_trainer_add');});">
                                    ${CImg.plus("", {"vertical-align":"middle"})}
                                </span>
                        </span>`;
        let content =   `<div class="search_bar"></div>
                        <section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_trainer_list .wrapper_top').style.border = 0;
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
            whole_data = this.data.current_trainer_data;
            length = whole_data.length;
            this.trainer_ing_length = length;
            this.list_status_type_text = "진행중";
        }else if(this.list_status_type == "end"){
            whole_data = this.data.finish_trainer_data;
            length = whole_data.length;
            this.trainer_end_length = length;
            this.list_status_type_text = "종료";
        }

        this.list_type_text = "수업";
        this.data_length = length;

        let html_temp = [];
        for(let i=0; i<length; i++){
            let data = whole_data[i];
            let trainer_id = data.trainer_id;
            let trainer_name = data.trainer_name;
            // let trainer_note = data.trainer_note != "" ? data.trainer_note : " - ";
            let trainer_max_member_number = data.trainer_max_num;
            let trainer_member_number = data.trainer_ing_member_num;
            let trainer_class_hour = data.trainer_minute;
            let trainer_ing_bg_color = data.trainer_ing_color_cd;

            
            let onclick = `trainer_list_popup.event_view_trainer(${trainer_id})`;
            let html = `<article class="trainer_wrapper anim_fade_in_vibe_top" data-text="${trainer_name}" data-trainerid="${trainer_id}" onclick="${onclick}" style="color:${this.list_status_type == "ing" ? "" : 'var(--font-inactive)'}">
                            <div>
                                <div class="trainer_data_l">
                                    <div class="trainer_tag" style="background:${this.list_status_type == "ing" ? trainer_ing_bg_color : "var(--font-inactive)"}"></div>
                                </div>
                                <div class="trainer_data_c">
                                    <div class="trainer_name">
                                        ${data.trainer_ticket_list.length > 0 ? "" : CImg.warning(["#fe4e65"], {"vertical-align":"middle", "width":"20px", "height":"20px", "margin-bottom":"4px"})}
                                        ${trainer_name} 
                                    </div>
                                    <div class="trainer_note">
                                        정원 - ${trainer_max_member_number}명 / 수업시간 - ${trainer_class_hour}분
                                    </div>
                                </div>
                                <div class="trainer_data_r">
                                        <div class="trainer_member_number">${this.list_status_type == "ing" ? trainer_member_number+' 명' : ""}</div>
                                </div>
                            </div>
                        </article>`;
            html_temp.push(html);
        }

        return html_temp.join("");
    }

    event_view_trainer(trainer_id){
        let auth_inspect = pass_inspector.trainer_read();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            show_error_message({title:message});
            return false;
        }

        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TRAINER_VIEW, 100, popup_style, {'trainer_id':trainer_id}, ()=>{
            trainer_view_popup = new Trainer_view('.popup_trainer_view', trainer_id, 'trainer_view_popup');
        });
    }

    dom_row_toolbox(){

        // 계속 추가되더라도 동적으로 처리하기 위해 작성 - hkkim 20191001
        let user_options_array = [];
        user_options_array.push(`'${SORT_TRAINER_NAME+'_'+SORT_ORDER_ASC}':{text:'수업명 가나다순', callback:()=>{trainer_list_popup.sort_val = ${SORT_TRAINER_NAME}; trainer_list_popup.sort_order_by= ${SORT_ORDER_ASC}; trainer_list_popup.sort_value_text = '수강권명 가나다순';trainer_list_popup.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TRAINER_MEMBER_COUNT+'_'+SORT_ORDER_ASC}':{text:'참여중 회원 많은 순', callback:()=>{trainer_list_popup.sort_val = '${SORT_TRAINER_MEMBER_COUNT}'; trainer_list_popup.sort_order_by= ${SORT_ORDER_DESC}; trainer_list_popup.sort_value_text = '참여중 회원 많은 순';trainer_list_popup.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TRAINER_MEMBER_COUNT+'_'+SORT_ORDER_DESC}':{text:'참여중 회원 적은 순', callback:()=>{trainer_list_popup.sort_val = '${SORT_TRAINER_MEMBER_COUNT}'; trainer_list_popup.sort_order_by= ${SORT_ORDER_ASC};trainer_list_popup.sort_value_text = '참여중 회원 적은 순';trainer_list_popup.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TRAINER_CAPACITY_COUNT+'_'+SORT_ORDER_ASC}':{text:'정원 많은 순', callback:()=>{trainer_list_popup.sort_val = '${SORT_TRAINER_CAPACITY_COUNT}'; trainer_list_popup.sort_order_by= ${SORT_ORDER_DESC}; trainer_list_popup.sort_value_text = '정원 많은 순';trainer_list_popup.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TRAINER_CAPACITY_COUNT+'_'+SORT_ORDER_DESC}':{text:'정원 적은 순', callback:()=>{trainer_list_popup.sort_val = '${SORT_TRAINER_CAPACITY_COUNT}'; trainer_list_popup.sort_order_by= ${SORT_ORDER_ASC};trainer_list_popup.sort_value_text = '정원 적은 순';trainer_list_popup.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TRAINER_CREATE_DATE+'_'+SORT_ORDER_ASC}':{text:'생성 일자 최근 순', callback:()=>{trainer_list_popup.sort_val = '${SORT_TRAINER_CREATE_DATE}'; trainer_list_popup.sort_order_by= ${SORT_ORDER_DESC};trainer_list_popup.sort_value_text = '생성 일자 최근 순';trainer_list_popup.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_TRAINER_CREATE_DATE+'_'+SORT_ORDER_DESC}':{text:'생성 일자 과거 순', callback:()=>{trainer_list_popup.sort_val = '${SORT_TRAINER_CREATE_DATE}'; trainer_list_popup.sort_order_by= ${SORT_ORDER_ASC};trainer_list_popup.sort_value_text = '생성 일자 과거 순';trainer_list_popup.init();layer_popup.close_layer_popup();}}`);
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

        let title = "수업 ";
        let html = `<div class="trainer_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <div style="display:inline-block; color:var(--font-highlight); font-weight:900;">${this.data_length}</div>
                        </div>
                    </div>
                    <div class="trainer_bottom_tools_wrap">
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
                            ${this.sort_value_text} <img src="/static/common/icon/icon_arrow_expand_light_grey.png" style="width:24px; height:24px; vertical-align: middle;">
                        </div>
                    </div>
                        `;
        return html;
    }

    render_search_tool(type){
        let html = `<input type="text" class="search_input" placeholder="검색" onclick="event.stopPropagation();" onkeyup="${this.instance}.search_by_typing(event)">`;
        if(type == "clear"){
            html = '';
        }
        
        document.querySelector('.search_bar').innerHTML = html;
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
            Array.from(document.getElementsByClassName('trainer_wrapper')).forEach((el)=>{
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
        Array.from(document.getElementsByClassName('trainer_wrapper')).forEach((el)=>{
            let name = el.dataset.text;
            if(name.match(value)){
                el.style.display = 'table';
                // $("#root_content").scrollTop(1);
            }else{
                el.style.display = 'none';
            }
        });
    }

    //수업 리스트 서버에서 불러오기
    request_trainer_list (status, callback, load_image){
        //sort_order_by : trainer_type_seq, trainer_name, trainer_member_many, trainer_member_few, trainer_create_new, trainer_create_old
        let url;
        if(status=='ing'){
            url = '/trainer/get_trainer_ing_list/';
        }else if (status=='end'){
            url = '/trainer/get_trainer_end_list/';
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
            this.init();
            break;

        case "end":
            this.list_status_type = "end";
            this.init();
            break;
        }
    }

}

/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_LECTURE_ADD, POPUP_FROM_BOTTOM,
windowHeight*/ 