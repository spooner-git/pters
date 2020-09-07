class Shop_list {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_shop_list_toolbox', content:'section_shop_list_content'};

        this.instance = instance;
        this.page_name = 'shop_list';
        this.data = null;
        this.data_length = 0;
        this.shop_ing_length = 0;
        this.shop_end_length = 0;
        this.list_type_text = "";
        this.list_status_type_text = "";
        this.list_status_type = "ing"; //ing, end

        this.search = false;
        this.search_value = "";

        this.sort_val = SORT_SHOP_NAME;
        this.sort_order_by = SORT_ORDER_ASC;
        this.sort_value_text = '강사명 가나다순';

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해
        this.init();
    }

    init(){
        this.set_initial_data();
    }

    reset(){
        this.request_shop_list(this.list_status_type, (data)=>{
            this.data = data;
            if(this.list_status_type == "ing"){
                this.data_length = this.data.current_shop_data.length;
            }else if(this.list_status_type == "end"){
                this.data_length = this.data.finish_shop_data.length;
            }
            this.render_toolbox();
            this.render_content();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });
    }

    set_initial_data (){
        this.request_shop_list(this.list_status_type, (data)=>{
            this.data = data;
            if(this.list_status_type == "ing"){
                this.data_length = this.data.current_shop_data.length;
            }else if(this.list_status_type == "end"){
                this.data_length = this.data.finish_shop_data.length;
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

        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();shop_list_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right">
                                <span class=".search_shop" onclick="${this.instance}.search_tool_visible(event, this)">
                                    ${CImg.search("", {"vertical-align":"middle"})}
                                </span>
                                <span class=".add_shop" onclick="${this.instance}.event_add_shop();">
                                    ${CImg.plus("", {"vertical-align":"middle"})}
                                </span>
                        </span>`;
        let content =   `<div class="search_bar"></div>
                        <section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_shop_list .wrapper_top').style.border = 0;
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
            whole_data = this.data.current_shop_data;
            length = whole_data.length;
            this.shop_ing_length = length;
            this.shop_list_type_text = "진행중";
        }else if(this.list_status_type == "end"){
            whole_data = this.data.finish_shop_data;
            length = whole_data.length;
            this.shop_end_length = length;
            this.shop_list_type_text = "종료";
        }

        this.shop_length = length;

        let html_temp = [];

        let shop_id = user_id;
        let shop_name = user_name;
        // let shop_phone;

        let shop_profile_photo;
        if(user_profile_url.match('icon_account.png')){
            shop_profile_photo = CImg.account("", {"width":"36px", "height":"36px"});
        }else{
            shop_profile_photo = `<img src="${user_profile_url}">`;
        }


        let onclick = `shop.event_view_shop(${shop_id})`;
        let html = `<article class="shop_wrapper anim_fade_in_vibe_top" data-shop_id="${shop_id}" data-name="${shop_name}" onclick="${onclick}" style="color:${this.list_status_type == "ing" ? "" : 'var(--font-inactive)'}">
                        <div class="shop_data_wrapper">
                            <div class="shop_data_l">
                                ${shop_profile_photo}
                            </div>                
                            <div class="shop_data_c">
                                <div class="shop_name">${shop_name}</div>
                                <div class="shop_counts">
                                    
                                </div>
                            </div>
                            <div class="shop_data_r">
                                <div class="shop_phone" onclick="event.stopPropagation();">
                                    <img src="/static/common/icon/icon_gap_black.png" class="icon_contact">
                                </div>
                                <div class="shop_sms" onclick="event.stopPropagation();">

                                    <img src="/static/common/icon/icon_gap_black.png" class="icon_contact">
                                </div>
                            </div>
                        </div>
                    </article>`;
        if(this.list_status_type == "ing") {
            html_temp.push(html);
        }
        for (let i=0; i<length; i++){
            let data = whole_data[i];
            let shop_id = data.shop_id;
            let shop_name = data.shop_name;
            let shop_phone = data.shop_phone;

            let shop_profile_photo;
            if(data.shop_profile_url.match('icon_account.png')){
                shop_profile_photo = CImg.account("", {"width":"36px", "height":"36px"});
            }else{
                shop_profile_photo = `<img src="${data.shop_profile_url}">`;
            }


            let onclick = `shop.event_view_shop(${shop_id})`;
            let html = `<article class="shop_wrapper anim_fade_in_vibe_top" data-shop_id="${shop_id}" data-name="${shop_name}" onclick="${onclick}" style="color:${this.list_status_type == "ing" ? "" : 'var(--font-inactive)'}">
                            <div class="shop_data_wrapper">
                                <div class="shop_data_l">
                                    ${shop_profile_photo}
                                </div>                
                                <div class="shop_data_c">
                                    <div class="shop_name">${shop_name}</div>
                                    <div class="shop_counts">
                                        
                                    </div>
                                </div>
                                <div class="shop_data_r">
                                    <div class="shop_phone" onclick="event.stopPropagation();location.href='tel:${shop_phone}'" ${shop_phone == "None" ? "style='display:none;'" : ""}>
                                        <img src="/static/common/icon/icon_gap_black.png" class="icon_contact">
                                    </div>
                                    <div class="shop_sms" onclick="event.stopPropagation();location.href='sms:${shop_phone}'" ${shop_phone== "None" ? "style='display:none;'" : ""}>

                                        <img src="/static/common/icon/icon_gap_black.png" class="icon_contact">
                                    </div>
                                </div>
                            </div>
                        </article>`;
            html_temp.push(html);
        }

        if(html_temp.length == 0){
            html_temp.push(`<div style="font-size:14px;padding:16px;" class="anim_fade_in_vibe_top">등록된 강사가 없습니다.</div>`);
        }

        return html_temp.join("");
    }

    event_view_shop(shop_id){
        let auth_inspect = pass_inspector.shop_read();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            show_error_message({title:message});
            return false;
        }

        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SHOP_VIEW, 100, popup_style, {'shop_id':shop_id}, ()=>{
            shop_view_popup = new Shop_view('.popup_shop_view', shop_id, 'shop_view_popup');
        });
    }

    event_add_shop(){
        let user_option = {
            old:{text:"PTERS 아이디가 있는 강사", callback:()=>{
                layer_popup.close_layer_popup();
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SHOP_SEARCH, 100, popup_style, null, ()=>{
                    shop_search_popup = new Shop_search('.popup_shop_search', null);});
            }},
            new:{text:"새로운 강사", callback:()=>{
                layer_popup.close_layer_popup();
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SHOP_ADD, 100, popup_style, null, ()=>{
                    shop_add_popup = new Shop_add('.popup_shop_add', null, 'shop_add_popup');});
            }}
        };
        let options_padding_top_bottom = 16;
        // let button_height = 8 + 8 + 52;
        let button_height = 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    dom_row_toolbox(){

        // 계속 추가되더라도 동적으로 처리하기 위해 작성 - hkkim 20191001
        let user_options_array = [];
        user_options_array.push(`'${SORT_SHOP_NAME+'_'+SORT_ORDER_ASC}':{text:'강사명 가나다순', callback:()=>{shop_list_popup.sort_val = ${SORT_SHOP_NAME}; shop_list_popup.sort_order_by= ${SORT_ORDER_ASC}; shop_list_popup.sort_value_text = '강사명 가나다순';shop_list_popup.init();layer_popup.close_layer_popup();}}`);
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

        let title = "상품";
        let html = `<div class="shop_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <div style="display:inline-block; color:var(--font-highlight); font-weight:900;">${this.data_length + 1}</div>
                        </div>
                    </div>
                    <div class="shop_bottom_tools_wrap">
                        <div class="list_type_tab_wrap">
                            <div onclick="${this.instance}.switch_type('ing');" class="list_tab_content ${this.list_status_type == "ing" ? "tab_selected": ""}">진행중</div>
                            <div class="list_tab_divider"></div>
                            <div onclick="${this.instance}.switch_type('end');" class="list_tab_content ${this.list_status_type == "end" ? "tab_selected" : ""}">종료 </div>
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
            Array.from(document.getElementsByClassName('shop_wrapper')).forEach((el)=>{
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
        Array.from(document.getElementsByClassName('shop_wrapper')).forEach((el)=>{
            let name = el.dataset.text;
            if(name.match(value)){
                el.style.display = 'table';
                // $("#root_content").scrollTop(1);
            }else{
                el.style.display = 'none';
            }
        });
    }

    //강사 리스트 서버에서 불러오기
    request_shop_list (status, callback, load_image){
        //sort_order_by : shop_type_seq, shop_name, shop_member_many, shop_member_few, shop_create_new, shop_create_old
        let url;
        if(status=='ing'){
            url = '/shop/get_shop_ing_list/';
        }else if (status=='end'){
            url = '/shop/get_shop_end_list/';
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