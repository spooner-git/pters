class Trainer{
    constructor (targetHTML, instance){
        this.page_name = "trainer_page_type";
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.trainer_length = 0;
        this.trainer_ing_length = 0;
        this.trainer_end_length = 0;
        this.trainer_list_type_text = "";
        this.list_type = "ing";

        this.search = false;
        this.search_value = "";
        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해

        this.sort_val = SORT_TRAINER_NAME;
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
        //     this.render_trainer_list(this.received_data_cache, list_type);
        // }
        this.render_upper_box();
        this.request_trainer_list(list_type, (jsondata) => {
            this.received_data_cache = jsondata;
            this.render_trainer_list(jsondata, list_type);
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
        this.request_trainer_list(list_type, (jsondata) => {
            this.received_data_cache = jsondata;
            this.render_trainer_list(jsondata, list_type);
            this.render_upper_box();
        });
    }


    //회원 리스트 서버에서 불러오기
    request_trainer_list (list_type, callback, load_image, async){
        var url;
        if(async == undefined){
            async = true;
        }
        if(list_type == 'ing'){
            url = '/trainer/get_trainer_ing_list/';
        }else if(list_type == 'end'){
            url = '/trainer/get_trainer_end_list/';
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
        document.getElementById('trainer_display_panel').innerHTML = component.trainer_upper_box;
    }

    //회원 리스트를 렌더링
    render_trainer_list (jsondata, list_type){
        if(current_page_text != this.page_name){
            return false;
        }

        let whole_data, length;

        if(list_type == "ing"){
            whole_data = jsondata.current_trainer_data;
            length = whole_data.length;
            this.trainer_ing_length = length;
            this.trainer_list_type_text = "진행중";
        }else if(list_type == "end"){
            whole_data = jsondata.finish_trainer_data;
            length = whole_data.length;
            this.trainer_end_length = length;
            this.trainer_list_type_text = "종료";
        }

        this.trainer_length = length;

        let html_temp = [];
        for (let i=0; i<length; i++){
            let data = whole_data[i];
            let trainer_id = data.trainer_id;
            let trainer_name = data.trainer_name;
            let trainer_phone = data.trainer_phone;

            let trainer_profile_photo;
            if(data.trainer_profile_url.match('icon_account.png')){
                trainer_profile_photo = CImg.account("", {"width":"36px", "height":"36px"});
            }else{
                trainer_profile_photo = `<img src="${data.trainer_profile_url}">`;
            }

            
            let onclick = `trainer.event_view_trainer(${trainer_id})`;
            let html = `<article class="trainer_wrapper anim_fade_in_vibe_top" data-trainer_id="${trainer_id}" data-name="${trainer_name}" onclick="${onclick}" style="color:${list_type == "ing" ? "" : 'var(--font-inactive)'}">
                            <div class="trainer_data_wrapper">
                                <div class="trainer_data_l">
                                    ${trainer_profile_photo}
                                </div>                
                                <div class="trainer_data_c">
                                    <div class="trainer_name">${trainer_name}</div>
                                    <div class="trainer_counts">
                                        
                                    </div>
                                </div>
                                <div class="trainer_data_r">
                                    <div class="trainer_phone" onclick="event.stopPropagation();location.href='tel:${trainer_phone}'" ${trainer_phone == "None" ? "style='display:none;'" : ""}>
                                        <img src="/static/common/icon/icon_gap_black.png" class="icon_contact">
                                    </div>
                                    <div class="trainer_sms" onclick="event.stopPropagation();location.href='sms:${trainer_phone}'" ${trainer_phone== "None" ? "style='display:none;'" : ""}>

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
        document.querySelector('#trainer_content_wrap').innerHTML = html_temp.join("");
    }

    dom_row_google_adsense(){
        let dom = Ads.row();

        let html = `<article class="trainer_wrapper">   
                            ${dom}
                    </article>`;

        return pass_inspector.data.auth_ads.limit_num != 0 ? html : "";
    }

    render_search_tool(type){
        let html = `<input type="text" class="search_input" placeholder="검색" onclick="event.stopPropagation();" onkeyup="${this.instance}.search_trainer_by_typing(event)">`;
        if(type == "clear"){
            html = '';
        }
        
        document.querySelector('.trainer_search_tool').innerHTML = html;
    }
    
    event_view_trainer(trainer_id){
        let inspect = pass_inspector.trainer_read();
        if(inspect.barrier == BLOCKED){
            let message = `${inspect.limit_type}`;
            show_error_message({title:message});
            return false;
        }

        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TRAINER_VIEW, 100, popup_style, {'trainer_id':trainer_id}, ()=>{
            trainer_view_popup = new Trainer_view('.popup_trainer_view', trainer_id, 'trainer_view_popup');
        });

    }

    event_add_trainer(){
        let user_option = {
            old:{text:"PTERS 아이디가 있는 강사", callback:()=>{
                layer_popup.close_layer_popup();
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TRAINER_SEARCH, 100, popup_style, null, ()=>{

                    trainer_search_popup = new Trainer_search('.popup_trainer_search', null);
                    // trainer_search_popup = new Setting_sharing_member_search('.popup_trainer_search', null, 'trainer_search_popup');
                });
            }},
            new:{text:"새로운 강사", callback:()=>{
                layer_popup.close_layer_popup();
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TRAINER_ADD, 100, popup_style, null, ()=>{
                    trainer_add_popup = new Trainer_add('.popup_trainer_add', null, 'trainer_add_popup');});
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

    search_trainer_tool_visible (event, self){
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

    search_trainer_by_typing (event){
        let value = event.target.value;
        this.search_value = value;
        Array.from(document.getElementsByClassName('trainer_wrapper')).forEach((el)=>{
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
        user_options_array.push(`'${SORT_TRAINER_NAME+'_'+SORT_ORDER_ASC}':{text:'강사명 가나다순', callback:()=>{trainer.sort_val = ${SORT_TRAINER_NAME}; trainer.sort_order_by= ${SORT_ORDER_ASC}; trainer.sort_value_text = '강사명 가나다순';trainer.init();layer_popup.close_layer_popup();}}`);
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
                trainer_upper_box:`   <div class="trainer_upper_box">
                                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                                            <div style="display:inline-block;">강사 </div>
                                            <div style="display:inline-block; color:var(--font-highlight); font-weight:900;">${this.list_type == "ing" ? this.trainer_ing_length : this.trainer_end_length}</div>
                                        </div>
                                        <div class="trainer_tools_wrap">
                                            <div class="search_trainer" onclick="${this.instance}.search_trainer_tool_visible(event, this);">
                                                ${CImg.search()}
                                            </div>
                                            <div class="add_trainer" onclick="${this.instance}.event_add_trainer()">
                                                ${CImg.plus()}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="search_bar"></div>
                                    <div class="trainer_bottom_tools_wrap" style="padding: 6px 16px;">
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
                                    <div id="trainer_display_panel"></div>
                                    <div id="trainer_content_wrap" class=""></div>
                                </div>`
            }
        );
    }
}

class Trainer_func{
    static create(data, callback, error_callback){
        $.ajax({
            url:'/trainer/add_trainer_program_info/',
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
            url:'/login/add_trainer_info_no_email/',
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
            url:'/trainer/add_trainer_ticket_info/',
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
        //데이터 형태 {"trainer_id":""};
        $.ajax({
            url:'/trainer/get_trainer_info/',
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
        //데이터 형태 {"trainer_id":""};
        $.ajax({
            url:'/trainer/get_trainer_ticket_list/',
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

    static read_schedule_list_by_ticket(data, callback, error_callback){
        //데이터 형태 {"trainer_id":""};
        $.ajax({
            url:'/trainer/get_trainer_schedule_all/',
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
        //데이터 형태 {"trainer_id":""};
        $.ajax({
            url:'/trainer/delete_trainer_info/',
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
        //데이터 형태 {"trainer_id":"", "first_name":"", "phone":"", "sex":"", "birthday":""};
        $.ajax({
            url:'/trainer/update_trainer_info/',
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
            url:'/trainer/update_trainer_status_info/',
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
        // {"trainer_id":"", "trainer_auth_cd":""}
        $.ajax({
            url:'/trainer/update_trainer_connection_info/',
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
        // {"trainer_ticket_id":"", "state_cd":"", "refund_price":"", "refund_date":""}
        $.ajax({
            url:'/trainer/update_trainer_ticket_status_info/',
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
    // {"trainer_ticket_id":"", "note":"", "start_date":"", "end_date":"", "price":"", "refund_price":"", "refund_date":"", "trainer_ticket_reg_count":""}
        $.ajax({
            url:'/trainer/update_trainer_ticket_info/',
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
            url:'/trainer/delete_trainer_ticket_info/',
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
            url:'/trainer/add_hold_trainer_ticket_info/',
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
            url:'/trainer/search_trainer_info/',
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
        //데이터 형태 {"trainer_id":""};
        $.ajax({
            url:'/trainer/get_trainer_repeat_schedule/',
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
        //데이터 형태 {"trainer_id":""};
        $.ajax({
            url:'/trainer/get_trainer_lecture_list/',
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
        //데이터 형태 {"trainer_id":""};
        $.ajax({
            url:'/trainer/get_trainer_closed_date/',
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
        //데이터 형태 {"trainer_id":""};
        $.ajax({
            url:'/trainer/get_trainer_closed_date_history/',
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
POPUP_AJAX_CALL, POPUP_ADDRESS_TRAINER_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_TRAINER_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 


