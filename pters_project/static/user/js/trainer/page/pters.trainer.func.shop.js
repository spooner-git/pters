class Shop{
    constructor (targetHTML, instance){
        this.page_name = "shop_page_type";
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.shop_length = 0;
        this.shop_ing_length = 0;
        this.shop_end_length = 0;
        this.shop_list_type_text = "";
        this.list_type = "ing";

        this.search = false;
        this.search_value = "";
        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        this.sort_val = SORT_SHOP_NAME;
        this.sort_order_by = SORT_ORDER_ASC;
        this.sort_value_text = '강사명 가나다순';

    }

    init (list_type){
        if(current_page_text != this.page_name){
            return false;
        }
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;

        if(list_type == undefined){
            list_type = this.list_type;
        }

        this.list_type = list_type;

        // if(this.received_data_cache != null){
        //     this.render_shop_list(this.received_data_cache, list_type);
        // }
        this.render_upper_box();
        this.request_shop_list(list_type, (jsondata) => {
            this.received_data_cache = jsondata;
            this.render_shop_list(jsondata, list_type);
            this.render_upper_box();
        });
    }

    reset(list_type){
        if(current_page_text != this.page_name){
            return false;
        }

        if(list_type == undefined){
            list_type = this.list_type;
        }

        this.list_type = list_type;

        this.render_upper_box();
        this.request_shop_list(list_type, (jsondata) => {
            this.received_data_cache = jsondata;
            this.render_shop_list(jsondata, list_type);
            this.render_upper_box();
        });
    }


    //회원 리스트 서버에서 불러오기
    request_shop_list (list_type, callback, load_image, async){
        var url;
        if(async == undefined){
            async = true;
        }
        if(list_type == 'ing'){
            url = '/shop/get_shop_ing_list/';
        }else if(list_type == 'end'){
            url = '/shop/get_shop_end_list/';
        }
        $.ajax({
            url:url,
            dataType : 'JSON',
            async:async,
            data: {'sort_val':this.sort_val, 'sort_order_by':this.sort_order_by, "keyword":""},
    
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


    //상단을 렌더링
    render_upper_box (){
        if(current_page_text != this.page_name){
            return false;
        }

        this.search = false;
        let component = this.static_component();
        document.getElementById('shop_display_panel').innerHTML = component.shop_upper_box;
    }

    //회원 리스트를 렌더링
    render_shop_list (jsondata, list_type){
        if(current_page_text != this.page_name){
            return false;
        }

        let whole_data, length;

        if(list_type == "ing"){
            whole_data = jsondata.current_shop_data;
            length = whole_data.length;
            this.shop_ing_length = length;
            this.shop_list_type_text = "진행중";
        }else if(list_type == "end"){
            whole_data = jsondata.finish_shop_data;
            length = whole_data.length;
            this.shop_end_length = length;
            this.shop_list_type_text = "종료";
        }

        this.shop_length = length;

        let html_temp = [];
        let shop_id = user_id;
        let shop_name = user_name;
        let shop_profile_photo;
        if(user_profile_url.match('icon_account.png')){
            shop_profile_photo = CImg.account("", {"width":"36px", "height":"36px"});
        }else{
            shop_profile_photo = `<img src="${user_profile_url}">`;
        }
        let onclick = `shop.event_view_shop(${shop_id})`;
        let html = `<article class="shop_wrapper anim_fade_in_vibe_top" data-shop_id="${shop_id}" data-name="${shop_name}" onclick="${onclick}" style="color:${list_type == "ing" ? "" : 'var(--font-inactive)'}">
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
        if(list_type == "ing") {
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
            let html = `<article class="shop_wrapper anim_fade_in_vibe_top" data-shop_id="${shop_id}" data-name="${shop_name}" onclick="${onclick}" style="color:${list_type == "ing" ? "" : 'var(--font-inactive)'}">
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
        document.querySelector('#shop_content_wrap').innerHTML = html_temp.join("");
    }

    dom_row_google_adsense(){
        let dom = Ads.row();

        let html = `<article class="shop_wrapper">   
                            ${dom}
                    </article>`;

        return pass_inspector.data.auth_ads.limit_num != 0 ? html : "";
    }

    render_search_tool(type){
        let html = `<input type="text" class="search_input" placeholder="검색" onclick="event.stopPropagation();" onkeyup="${this.instance}.search_shop_by_typing(event)">`;
        if(type == "clear"){
            html = '';
        }
        
        document.querySelector('.shop_search_tool').innerHTML = html;
    }
    
    event_view_shop(shop_id){
        let inspect = pass_inspector.shop_read();
        if(inspect.barrier == BLOCKED){
            let message = `${inspect.limit_type}`;
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

                    shop_search_popup = new Shop_search('.popup_shop_search', null);
                    // shop_search_popup = new Setting_sharing_member_search('.popup_shop_search', null, 'shop_search_popup');
                });
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

    search_shop_tool_visible (event, self){
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

            $(self).html(CImg.search());
            break;
        case false:
            this.search = true;
            this.render_search_tool('draw');
            document.getElementsByClassName('search_input')[0].value = this.search_value;
            
            $(self).html(CImg.x());
            break;
        }
    }

    search_shop_by_typing (event){
        let value = event.target.value;
        this.search_value = value;
        Array.from(document.getElementsByClassName('shop_wrapper')).forEach((el)=>{
            let name = el.dataset.name;
            if(name.match(value)){
                // el.style.display = 'block';
                $(el).show();
                // $("#root_content").scrollTop(1);
            }else{
                $(el).hide();
                // el.style.display = 'none';
            }
        });
    }

    static_component (){
        // 계속 추가되더라도 동적으로 처리하기 위해 작성 - hkkim 20191001
        let user_options_array = [];
        user_options_array.push(`'${SORT_SHOP_NAME+'_'+SORT_ORDER_ASC}':{text:'강사명 가나다순', callback:()=>{shop.sort_val = ${SORT_SHOP_NAME}; shop.sort_order_by= ${SORT_ORDER_ASC}; shop.sort_value_text = '강사명 가나다순';shop.init();layer_popup.close_layer_popup();}}`);
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

        return(
            {
                shop_upper_box:`   <div class="shop_upper_box">
                                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                                            <div style="display:inline-block;">강사 </div>
                                            <div style="display:inline-block; color:var(--font-highlight); font-weight:900;">${this.list_type == "ing" ? this.shop_ing_length + 1 : this.shop_end_length}</div>
                                        </div>
                                        <div class="shop_tools_wrap">
                                            <div class="search_shop" onclick="${this.instance}.search_shop_tool_visible(event, this);">
                                                ${CImg.search()}
                                            </div>
                                            <div class="add_shop" onclick="${this.instance}.event_add_shop()">
                                                ${CImg.plus()}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="search_bar"></div>
                                    <div class="shop_bottom_tools_wrap" style="padding: 6px 16px;">
                                        <div class="list_type_tab_wrap">
                                            <div onclick="${this.instance}.switch_type('ing');" class="list_tab_content ${this.list_type == "ing" ? "tab_selected": ""}">진행중</div>
                                            <div class="list_tab_divider"></div>
                                            <div onclick="${this.instance}.switch_type('end');" class="list_tab_content ${this.list_type == "end" ? "tab_selected" : ""}">종료</div>
                                        </div>
                                        <div class="list_sort_select_wrap" 
                                        onclick="layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_OPTION_SELECTOR}', 100*(${layer_popup_height})/${root_content_height}, ${POPUP_FROM_BOTTOM}, null, ()=>{
                                            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, ${user_option}
                                            );
                                        });">
                                            ${this.sort_value_text} ${CImg.arrow_expand(["var(--img-sub1)"], {"vertical-align":"middle", "margin-bottom":"3px", "width":"20px"})}
                                        </div>
                                    </div>
                                    `
                ,
                initial_page:` <div>
                                    <div id="shop_display_panel"></div>
                                    <div id="shop_content_wrap" class=""></div>
                                </div>`
            }
        );
    }
}

class Shop_func{
    static create(data, callback, error_callback){
        $.ajax({
            url:'/shop/add_shop_program_info/',
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
            success:function(data_){
                let data = JSON.parse(data_);
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
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static create_pre(data, callback, error_callback){
        $.ajax({
            url:'/login/add_shop_info_no_email/',
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
    
            success:function(data_){
                let data = JSON.parse(data_);
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
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }
    
    static create_ticket_re(data, callback, error_callback){
        $.ajax({
            url:'/shop/add_shop_ticket_info/',
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
    
            success:function(data_){
                let data = JSON.parse(data_);
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
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static read(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/shop/get_shop_info/',
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
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data); 
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static read_ticket_list(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/shop/get_shop_ticket_list/',
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
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data); 
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static read_schedule_list(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/shop/get_lecture_shop_schedule_all/',
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
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data); 
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static delete(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/shop/delete_shop_info/',
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
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data); 
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static update(data, callback, error_callback, success_error_callback){
        //데이터 형태 {"shop_id":"", "first_name":"", "phone":"", "sex":"", "birthday":""};
        $.ajax({
            url:'/shop/update_shop_info/',
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
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback();
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static status(data, callback, error_callback){
        //데이터 형태 {"ticket_id":"", "state_cd":""};
        $.ajax({
            url:'/shop/update_shop_status_info/',
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
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);  
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static connection(data, callback, error_callback){
        // {"shop_id":"", "shop_auth_cd":""}
        $.ajax({
            url:'/shop/update_shop_connection_info/',
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
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data); 
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                // location.reload();
            }
        });
    }

    static ticket_status(data, callback, error_callback){
        // {"shop_ticket_id":"", "state_cd":"", "refund_price":"", "refund_date":""}
        $.ajax({
            url:'/shop/update_shop_ticket_status_info/',
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
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },

            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                // location.reload();
            }
        });
    }

    static ticket_update(data, callback, error_callback){
    // {"shop_ticket_id":"", "note":"", "start_date":"", "end_date":"", "price":"", "refund_price":"", "refund_date":"", "shop_ticket_reg_count":""}
        $.ajax({
            url:'/shop/update_shop_ticket_info/',
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
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },

            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                // location.reload();
            }
        });
    }

    static ticket_delete(data, callback, error_callback){
        $.ajax({
            url:'/shop/delete_shop_ticket_info/',
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
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },

            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                // location.reload();
            }
        });
    }

    static ticket_add_hold(data, callback, error_callback){
        $.ajax({
            url:'/shop/add_hold_shop_ticket_info/',
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
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },

            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                // location.reload();
            }
        });
    }

    static search(data, callback, error_callback){
        $.ajax({
            url:'/shop/search_shop_info/',
            type:'GET',
            data: data,
            dataType : 'JSON',

            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
                // ajax_load_image(SHOW);
            },

            //보내기후 팝업창 닫기
            complete:function(){
                // ajax_load_image(HIDE);
            },

            //통신성공시 처리
            success:function(data){
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
            },

            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                // location.reload();
            }
        });
    }

    static repeat_list(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/shop/get_shop_repeat_schedule/',
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
            success:function(data_){
                let data = JSON.parse(data_);
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
            },
    
            //통신 실패시 처리
            error:function(data){
                if(error_callback != undefined){
                    error_callback(data);
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                // location.reload();
            }
        });
    }

    static lecture_list(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/shop/get_shop_lecture_list/',
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
            success:function(data_){
                let data = JSON.parse(data_);
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
            },

            //통신 실패시 처리
            error:function(data){
                if(error_callback != undefined){
                    error_callback(data);
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                // location.reload();
            }
        });
    }

    static closed_date_list(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/shop/get_shop_closed_date/',
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
            success:function(data_){
                let data = JSON.parse(data_);
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
            },

            //통신 실패시 처리
            error:function(data){
                if(error_callback != undefined){
                    error_callback(data);
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                // location.reload();
            }
        });
    }
    static closed_date_list_history(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/shop/get_shop_closed_date_history/',
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
            success:function(data_){
                let data = JSON.parse(data_);
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
            },

            //통신 실패시 처리
            error:function(data){
                if(error_callback != undefined){
                    error_callback(data);
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                // location.reload();
            }
        });
    }
}


/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_SHOP_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_SHOP_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 


