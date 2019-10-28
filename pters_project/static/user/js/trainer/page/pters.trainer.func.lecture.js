class Lecture {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_lecture_list_toolbox', content:'section_lecture_list_content'};

        this.instance = instance;
        this.page_name = 'lecture_page_type';
        
        this.data = null;
        this.data_length = 0;
        this.lecture_ing_length = 0;
        this.lecture_end_length = 0;
        this.list_type_text = "";
        this.list_status_type_text = "";
        this.list_status_type = "ing"; //ing, end

        this.search = false;
        this.search_value = "";

        this.sort_val = SORT_LECTURE_NAME;
        this.sort_order_by = SORT_ORDER_ASC;
        this.sort_value_text = '수업명 가나다순';

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해
    }

    init(){
        if(current_page_text != this.page_name){
            return false;
        }

        this.set_initial_data();
    }

    set_initial_data (){
        this.request_lecture_list(this.list_status_type, (data)=>{
            if(current_page_text != this.page_name){
                return false;
            }
            this.data = data;
            if(this.list_status_type == "ing"){
                this.data_length = this.data.current_lecture_data.length;
            }else if(this.list_status_type == "end"){
                this.data_length = this.data.finish_lecture_data.length;
            }
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, OFF);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){

        // let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();lecture_list_popup.clear();" class="obj_icon_prev"></span>`;
        // let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        // let top_right = `<span class="icon_right">
        //                         <img src="/static/common/icon/icon_search_black.png" class="obj_icon_24px" style="padding-right:12px;" onclick="${this.instance}.search_tool_visible(event);">
        //                         <img src="/static/common/icon/icon_plus_pink.png" class="obj_icon_24px" onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_LECTURE_ADD}', 100, ${POPUP_FROM_BOTTOM}, {'select_date':null}, ()=>{
        //                             lecture_add_popup = new Lecture_add('.popup_lecture_add');});">
        //                 </span>`;
        // let content =   `<div class="search_bar"></div>
        //                 <section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
        //                 <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        // let html = PopupBase.base(top_left, top_center, top_right, content, "");

        let html = `<div>
                        
                        <div id="lecture_display_panel">
                            ${this.dom_assembly_toolbox()}
                        </div>
                        <div id="lecture_content_wrap" class="pages">
                            ${this.dom_assembly_content()}
                        </div>
                    </div>`;

        document.querySelector(this.target.install).innerHTML = html;
        // document.querySelector('.popup_lecture_list .wrapper_top').style.border = 0;
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
            whole_data = this.data.current_lecture_data;
            length = whole_data.length;
            this.lecture_ing_length = length;
            this.list_status_type_text = "진행중";
        }else if(this.list_status_type == "end"){
            whole_data = this.data.finish_lecture_data;
            length = whole_data.length;
            this.lecture_end_length = length;
            this.list_status_type_text = "종료";
        }

        this.list_type_text = "수업";
        this.data_length = length;

        let html_temp = [];
        for(let i=0; i<length; i++){
            let data = whole_data[i];
            let lecture_id = data.lecture_id;
            let lecture_name = data.lecture_name;
            // let lecture_note = data.lecture_note != "" ? data.lecture_note : " - ";
            let lecture_max_member_number = data.lecture_max_num;
            let lecture_member_number = data.lecture_ing_member_num;
            let lecture_class_hour = 60;
            let lecture_ing_bg_color = data.lecture_ing_color_cd;

            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            let onclick = `layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_LECTURE_VIEW}', 100, ${popup_style}, {'lecture_id':${lecture_id}}, ()=>{
                lecture_view_popup = new Lecture_view('.popup_lecture_view', ${lecture_id}, 'lecture_view_popup');});`;
            let html = `<article class="lecture_wrapper" data-text="${lecture_name}" data-lectureid="${lecture_id}" onclick="${onclick}" style="color:${this.list_status_type == "ing" ? "" : '#a3a0a0'}">
                            <div>
                                <div class="lecture_data_l">
                                    <div class="lecture_tag" style="background:${this.list_status_type == "ing" ? lecture_ing_bg_color : "#a3a0a0"}"></div>
                                </div>
                                <div class="lecture_data_c">
                                    <div class="lecture_name">
                                        ${lecture_name} 
                                    </div>
                                    <div class="lecture_note">
                                        정원 - ${lecture_max_member_number}명 / 수업시간 - ${lecture_class_hour}분
                                    </div>
                                </div>
                                <div class="lecture_data_r">
                                        <div class="lecture_member_number">${this.list_status_type == "ing" ? lecture_member_number+' 명' : ""}</div>
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
        user_options_array.push(`'${SORT_LECTURE_NAME+'_'+SORT_ORDER_ASC}':{text:'수업명 가나다순', callback:()=>{${this.instance}.sort_val = '${SORT_LECTURE_NAME}'; ${this.instance}.sort_order_by= ${SORT_ORDER_ASC}; ${this.instance}.sort_value_text = '수강권명 가나다순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_LECTURE_MEMBER_COUNT+'_'+SORT_ORDER_ASC}':{text:'참여중 회원 많은 순', callback:()=>{${this.instance}.sort_val = '${SORT_LECTURE_MEMBER_COUNT}'; ${this.instance}.sort_order_by= ${SORT_ORDER_DESC}; ${this.instance}.sort_value_text = '참여중 회원 많은 순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_LECTURE_MEMBER_COUNT+'_'+SORT_ORDER_DESC}':{text:'참여중 회원 적은 순', callback:()=>{${this.instance}.sort_val = '${SORT_LECTURE_MEMBER_COUNT}'; ${this.instance}.sort_order_by= ${SORT_ORDER_ASC};${this.instance}.sort_value_text = '참여중 회원 적은 순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_LECTURE_CAPACITY_COUNT+'_'+SORT_ORDER_ASC}':{text:'정원 많은 순', callback:()=>{${this.instance}.sort_val = '${SORT_LECTURE_CAPACITY_COUNT}'; ${this.instance}.sort_order_by= ${SORT_ORDER_DESC}; ${this.instance}.sort_value_text = '정원 많은 순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_LECTURE_CAPACITY_COUNT+'_'+SORT_ORDER_DESC}':{text:'정원 적은 순', callback:()=>{${this.instance}.sort_val = '${SORT_LECTURE_CAPACITY_COUNT}'; ${this.instance}.sort_order_by= ${SORT_ORDER_ASC};${this.instance}.sort_value_text = '정원 적은 순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_LECTURE_CREATE_DATE+'_'+SORT_ORDER_ASC}':{text:'생성 일자 최근 순', callback:()=>{${this.instance}.sort_val = '${SORT_LECTURE_CREATE_DATE}'; ${this.instance}.sort_order_by= ${SORT_ORDER_DESC};${this.instance}.sort_value_text = '생성 일자 최근 순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_LECTURE_CREATE_DATE+'_'+SORT_ORDER_DESC}':{text:'생성 일자 과거 순', callback:()=>{${this.instance}.sort_val = '${SORT_LECTURE_CREATE_DATE}'; ${this.instance}.sort_order_by= ${SORT_ORDER_ASC};${this.instance}.sort_value_text = '생성 일자 과거 순';${this.instance}.init();layer_popup.close_layer_popup();}}`);
        let user_option = `{`;
        for(let i=0; i<user_options_array.length; i++){
            user_option += user_options_array[i] + ',';
        }
        user_option += `}`;

        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*user_options_array.length;
        let root_content_height = $root_content.height();

        let title = "수업 ";
        let html = `<div class="lecture_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <div style="display:inline-block; color:#fe4e65; font-weight:900;">${this.data_length}</div>
                        </div>
                        <div class="lecture_tools_wrap">
                            <div class="search_lecture" onclick="${this.instance}.search_tool_visible(event);">
                            </div>
                            <div class="add_lecture" onclick="${this.instance}.event_add_lecture()"></div>
                        </div>
                    </div>
                    <div class="search_bar"></div>
                    <div class="lecture_bottom_tools_wrap" style="padding: 6px 16px;">
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

    search_tool_visible (event){
        event.stopPropagation();
        event.preventDefault();
        switch(this.search){
        case true:
            this.search = false;
            document.getElementsByClassName('search_input')[0].value = this.search_value;
            this.render_search_tool('clear');
            this.search_value = "";
            Array.from(document.getElementsByClassName('lecture_wrapper')).forEach((el)=>{
                $(el).show();
            });
            // event.target.src = '/static/common/icon/icon_search_black.png';
            event.target.style.backgroundImage = 'url("/static/common/icon/icon_search_black.png")';
            break;
        case false:
            this.search = true;
            this.render_search_tool('draw');
            document.getElementsByClassName('search_input')[0].value = this.search_value;
            
            // event.target.src = '/static/common/icon/icon_x_black.png';
            event.target.style.backgroundImage = 'url("/static/common/icon/icon_x_black.png")';
            break;
        }
    }

    search_by_typing (event){
        let value = event.target.value;
        this.search_value = value;
        Array.from(document.getElementsByClassName('lecture_wrapper')).forEach((el)=>{
            let name = el.dataset.text;
            if(name.match(value)){
                $(el).show();
                // el.style.display = 'table';
                // $("#root_content").scrollTop(1);
            }else{
                $(el).hide();
                // el.style.display = 'none';
            }
        });
    }

    //수업 리스트 서버에서 불러오기
    request_lecture_list (status, callback, load_image, async){
        //sort_order_by : lecture_type_seq, lecture_name, lecture_member_many, lecture_member_few, lecture_create_new, lecture_create_old
        let url;
        if(status=='ing'){
            url = '/trainer/get_lecture_ing_list/';
        }else if (status=='end'){
            url = '/trainer/get_lecture_end_list/';
        }

        $.ajax({
            url:url,
            type:'GET',
            data: {"sort_val": this.sort_val, "sort_order_by":this.sort_order_by, "keyword":""},
            dataType : 'JSON',
            async: async,
    
            beforeSend:function (){
                if(load_image == OFF){
                    return;
                }
                ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function (data){
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
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
                ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
            }
        });
    }

    event_add_lecture(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_ADD, 100, popup_style, null, ()=>{
            lecture_add_popup = new Lecture_add('.popup_lecture_add');});
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


class Lecture_func{
    static create(data, callback){
        //데이터 형태 {"member_num":"", "name":"", "note":"", "ing_color_cd":"", "end_color_cd":"", "ing_font_color_cd":"", "end_font_color_cd":""};

        $.ajax({
            url:'/trainer/add_lecture_info/',
            type:'POST',
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
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
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
        //데이터 형태 {"lecture_id":""};
        $.ajax({
            url:'/trainer/get_lecture_info/',
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
                check_app_version(data.app_version);
                // let data = JSON.parse(data_);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
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

    static delete(data, callback){
        //데이터 형태 {"lecture_id":""};
        $.ajax({
            url:'/trainer/delete_lecture_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(data){
            },
    
            //통신성공시 처리
            success:function(data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
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

    static update(data, callback){
        //데이터 형태 {"lecture_id":"", "member_num":"", "name":"", "note":"", "ing_color_cd":"", "end_color_cd":"", "ing_font_color_cd":"", "end_font_color_cd":""};


        $.ajax({
            url:'/trainer/update_lecture_info/',
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
            success:function(data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
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

    static status(data, callback){
        //데이터 형태 {"lecture_id":"", "state_cd":""};
        $.ajax({
            url:'/trainer/update_lecture_status_info/',
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
            success:function(data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
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

    static read_lecture_members(data, callback){
        //데이터 형태 {"lecture_id":""};
        $.ajax({
            url:'/trainer/get_lecture_ing_member_list/',
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
                check_app_version(data.app_version);
                // let data = JSON.parse(data_);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
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

    static update_fixed_member(data, callback){
        // lecture_id, member_id
        $.ajax({
            url:'/trainer/update_fix_lecture_member/',
            type:'POST',
            data: data,
            dataType: 'html',
            async: false,
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
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
}

/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_LECTURE_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 