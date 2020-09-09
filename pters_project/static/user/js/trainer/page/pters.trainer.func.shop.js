class Shop{
    constructor (targetHTML, instance){
        this.page_name = "shop_page_type";
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.shop_length = 0;
        this.shop_ing_length = 0;
        this.shop_end_length = 0;

        this.search = false;
        this.search_value = "";
        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        this.sort_val = SORT_SHOP_NAME;
        this.sort_order_by = SORT_ORDER_ASC;
        this.sort_value_text = '상품명 가나다순';

    }

    init (){
        if(current_page_text != this.page_name){
            return false;
        }
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;

        // if(this.received_data_cache != null){
        //     this.render_shop_list(this.received_data_cache, list_type);
        // }
        this.render_upper_box();
        this.request_shop_list((jsondata) => {
            this.received_data_cache = jsondata;
            this.render_shop_list(jsondata);
            this.render_upper_box();
        });
    }

    reset(){
        if(current_page_text != this.page_name){
            return false;
        }
        this.render_upper_box();
        this.request_shop_list((jsondata) => {
            this.received_data_cache = jsondata;
            this.render_shop_list(jsondata);
            this.render_upper_box();
        });
    }


    //회원 리스트 서버에서 불러오기
    request_shop_list (callback, load_image, async){
        var url = '/trainer/get_shop_ing_list/';
        if(async == undefined){
            async = true;
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
    render_shop_list (jsondata){
        if(current_page_text != this.page_name){
            return false;
        }

        let whole_data, length;

        whole_data = jsondata.current_shop_data;
        length = whole_data.length;
        this.shop_ing_length = length;

        this.shop_length = length;

        let html_temp = [];
        for (let i=0; i<length; i++){
            let data = whole_data[i];
            let shop_id = data.shop_id;
            let shop_name = data.shop_name;
            let shop_price = data.shop_price;
            let onclick = `shop.event_view_shop(${shop_id})`;
            let html = `<article class="shop_wrapper anim_fade_in_vibe_top" data-shop_id="${shop_id}" data-name="${shop_name}" onclick="${onclick}">
                            <div class="shop_data_wrapper">
                                <div class="shop_data_l">
                                </div>                
                                <div class="shop_data_c">
                                    <div class="shop_name">${shop_name}</div>
                                </div>
                                <div class="shop_data_r">
                                    ${UnitRobot.numberWithCommas(shop_price)}원
                                </div>
                            </div>
                        </article>`;
            html_temp.push(html);
        }

        if(html_temp.length == 0){
            html_temp.push(`<div style="font-size:14px;padding:16px;" class="anim_fade_in_vibe_top">등록된 상품이 없습니다.</div>`);
        }
        document.querySelector('#shop_content_wrap').innerHTML = html_temp.join("");
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
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SHOP_ADD, 100, popup_style, null, ()=>{
            shop_add_popup = new Shop_add('.popup_shop_add','shop_add_popup');});
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
        user_options_array.push(`'${SORT_SHOP_NAME+'_'+SORT_ORDER_ASC}':{text:'상품명 가나다순', callback:()=>{shop.sort_val = ${SORT_SHOP_NAME}; shop.sort_order_by= ${SORT_ORDER_ASC}; shop.sort_value_text = '상품명 가나다순';shop.init();layer_popup.close_layer_popup();}}`);
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
                                            <div style="display:inline-block;">상품 </div>
                                            <div style="display:inline-block; color:var(--font-highlight); font-weight:900;">${this.shop_ing_length}</div>
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
            url:'/trainer/add_shop_info/',
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


    static read(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/trainer/get_shop_info/',
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
            url:'/trainer/get_shop_ticket_list/',
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

    static delete(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/trainer/delete_shop_info/',
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
            url:'/trainer/update_shop_info/',
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
    static create_member_shop(data, callback, error_callback){
        $.ajax({
            url:'/trainer/add_member_shop_info/',
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
    static delete_member_shop(data, callback, error_callback){
        //데이터 형태 {"shop_id":""};
        $.ajax({
            url:'/trainer/delete_member_shop_data/',
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

}


/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_SHOP_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_SHOP_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 


