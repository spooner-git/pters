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

        this.sort_val = SORT_MEMBER_NAME;
        this.sort_order_by = SORT_ORDER_ASC;
        this.sort_value_text = '회원명 가나다순';

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

        if(this.received_data_cache != null){
            this.render_member_list(this.received_data_cache, list_type);
        }
        this.render_upper_box();
        this.request_member_list(list_type, (jsondata) => {
            this.received_data_cache = jsondata;
            this.render_member_list(jsondata, list_type);
            this.render_upper_box();
            Ads.active();
        });
    }


    //회원 리스트 서버에서 불러오기
    request_member_list (list_type, callback, load_image, async){
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
            data: {'sort_val':this.sort_val, 'sort_order_by':this.sort_order_by, "keyword":""},
    
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


    //상단을 렌더링
    render_upper_box (){
        if(current_page_text != this.page_name){
            return false;
        }

        this.search = false;
        let component = this.static_component();
        document.getElementById('member_display_panel').innerHTML = component.member_upper_box;
    }

    //회원 리스트를 렌더링
    render_member_list (jsondata, list_type){
        if(current_page_text != this.page_name){
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

            let remain_count_text = '잔여 '+member_rem+'회';
            end_date_text = '-'+end_date_text+' ('+remain_date+'일)';
            let member_counts_text;

            if(end_date == "9999-12-31"){
                end_date_text = '소진 시까지';
            }
            if(remain_date < 0){
                end_date_text = Math.abs(remain_date) + '일 지남';
            }

            if(member_rem <= 3){
                remain_count_text = `<span style='color:#ff0022;'>${remain_count_text}</span>`;
            }
            if(remain_date <= 7){
                end_date_text = `<span style='color:#ff0022;'>${end_date_text}</span>`;
            }

            if(list_type=="ing"){
                member_counts_text = remain_count_text + ' / ' + end_date_text;
                if(member_rem <= 3 && remain_date <= 7){
                    member_counts_text = `<span style='color:#ff0022;'>${remain_count_text} / ${end_date_text}</span>`;
                }
            }else{
                member_counts_text = '종료됨';
            }

            
            let member_profile_photo;
            if(data.member_profile_url.match('icon_account.png')){
                member_profile_photo = CImg.account("", {"width":"36px", "height":"36px"});
            }else{
                member_profile_photo = `<img src="${data.member_profile_url}">`;
            }

            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            let onclick = `layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_MEMBER_VIEW}', 100, ${popup_style}, {'member_id':${member_id}}, ()=>{
                member_view_popup = new Member_view('.popup_member_view', ${member_id}, 'member_view_popup');});`;
            let html = `<article class="member_wrapper" data-member_id="${member_id}" data-name="${member_name}" onclick="${onclick}" style="color:${list_type == "ing" ? "" : 'var(--font-inactive)'}">
                            <div class="member_data_wrapper">
                                <div class="member_data_l">
                                    ${member_profile_photo}
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
                            </div>
                        </article>`;
            html_temp.push(html);
        }

        html_temp.push(this.dom_row_google_adsense());

        if(html_temp.length == 0){
            html_temp.push(`<div style="font-size:14px;padding:16px;">등록된 회원이 없습니다.</div>`);
        }

        document.querySelector('#member_content_wrap').innerHTML = html_temp.join("");
    }

    dom_row_google_adsense(){
        let dom = Ads.row();

        let html = `<article class="member_wrapper">   
                            ${dom}
                    </article>`;

        return pass_inspector.data.auth_ads.limit_num != 0 ? html : "";
    }

    render_search_tool(type){
        let html = `<input type="text" class="search_input" placeholder="검색" onclick="event.stopPropagation();" onkeyup="${this.instance}.search_member_by_typing(event)">`;
        if(type == "clear"){
            html = '';
        }
        
        document.querySelector('.member_search_tool').innerHTML = html;
    }

    event_add_member(){
        let user_option = {
            old:{text:"PTERS 아이디가 있는 회원", callback:()=>{
                layer_popup.close_layer_popup();
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SEARCH, 100, popup_style, null, ()=>{
                    member_search_popup = new Member_search('.popup_member_search', null, 'member_search_popup');});
            }},
            new:{text:"새로운 회원", callback:()=>{
                layer_popup.close_layer_popup();
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_ADD, 100, popup_style, null, ()=>{
                    member_add_popup = new Member_add('.popup_member_add', null, 'member_add_popup');});
            }}
        };
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
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

    search_member_tool_visible (event, self){
        event.stopPropagation();
        event.preventDefault();
        switch(this.search){
        case true:
            this.search = false;
            document.getElementsByClassName('search_input')[0].value = this.search_value;
            this.render_search_tool('clear');
            this.search_value = "";
            Array.from(document.getElementsByClassName('member_wrapper')).forEach((el)=>{
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

    search_member_by_typing (event){
        let value = event.target.value;
        this.search_value = value;
        Array.from(document.getElementsByClassName('member_wrapper')).forEach((el)=>{
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
        user_options_array.push(`'${SORT_MEMBER_NAME+'_'+SORT_ORDER_ASC}':{text:'회원명 가나다순', callback:()=>{member.sort_val = ${SORT_MEMBER_NAME}; member.sort_order_by= ${SORT_ORDER_ASC}; member.sort_value_text = '회원명 가나다순';member.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_REG_COUNT+'_'+SORT_ORDER_ASC}':{text:'등록 횟수 많은 순', callback:()=>{member.sort_val = '${SORT_REG_COUNT}'; member.sort_order_by= ${SORT_ORDER_DESC}; member.sort_value_text = '등록 횟수 많은 순';member.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_REG_COUNT+'_'+SORT_ORDER_DESC}':{text:'등록 횟수 적은 순', callback:()=>{member.sort_val = '${SORT_REG_COUNT}'; member.sort_order_by= ${SORT_ORDER_ASC};member.sort_value_text = '등록 횟수 적은 순';member.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_REMAIN_COUNT+'_'+SORT_ORDER_ASC}':{text:'잔여 횟수 많은 순', callback:()=>{member.sort_val = '${SORT_REMAIN_COUNT}'; member.sort_order_by= ${SORT_ORDER_DESC};member.sort_value_text = '잔여 횟수 많은 순';member.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_REMAIN_COUNT+'_'+SORT_ORDER_DESC}':{text:'잔여 횟수 적은 순', callback:()=>{member.sort_val = '${SORT_REMAIN_COUNT}'; member.sort_order_by= ${SORT_ORDER_ASC};member.sort_value_text = '잔여 횟수 적은 순';member.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_START_DATE+'_'+SORT_ORDER_ASC}':{text:'시작 일자 최근 순', callback:()=>{member.sort_val = '${SORT_START_DATE}'; member.sort_order_by= ${SORT_ORDER_DESC};member.sort_value_text = '시작 일자 최근 순';member.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_START_DATE+'_'+SORT_ORDER_DESC}':{text:'시작 일자 과거 순', callback:()=>{member.sort_val = '${SORT_START_DATE}'; member.sort_order_by= ${SORT_ORDER_ASC};member.sort_value_text = '시작 일자 과거 순';member.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_END_DATE+'_'+SORT_ORDER_ASC}':{text:'남은 일자 많은 순', callback:()=>{member.sort_val = '${SORT_END_DATE}'; member.sort_order_by= ${SORT_ORDER_DESC};member.sort_value_text = '남은 일자 많은 순';member.init();layer_popup.close_layer_popup();}}`);
        user_options_array.push(`'${SORT_END_DATE+'_'+SORT_ORDER_DESC}':{text:'남은 일자 적은 순', callback:()=>{member.sort_val = '${SORT_END_DATE}'; member.sort_order_by= ${SORT_ORDER_ASC};member.sort_value_text = '남은 일자 적은 순';member.init();layer_popup.close_layer_popup();}}`);
        let user_option = `{`;
        for(let i=0; i<user_options_array.length; i++){
            user_option += user_options_array[i] + ',';
        }
        user_option += `}`;

        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*user_options_array.length;
        let root_content_height = $root_content.height();

        return(
            {
                member_upper_box:`   <div class="member_upper_box">
                                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                                            <div style="display:inline-block;">회원 </div>
                                            <div style="display:inline-block; color:var(--font-highlight); font-weight:900;">${this.list_type == "ing" ? this.member_ing_length : this.member_end_length}</div>
                                        </div>
                                        <div class="member_tools_wrap">
                                            <div class="search_member" onclick="${this.instance}.search_member_tool_visible(event, this);">
                                                ${CImg.search()}
                                            </div>
                                            <div class="add_member" onclick="${this.instance}.event_add_member()">
                                                ${CImg.plus()}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="member_search_tool"></div>
                                    <div class="member_bottom_tools_wrap">
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
                                    <div id="member_display_panel"></div>
                                    <div id="member_content_wrap" class="pages"></div>
                                </div>`
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

    static read_schedule_list_by_ticket(data, callback){
        //데이터 형태 {"member_id":""};
        $.ajax({
            url:'/trainer/get_member_schedule_all/',
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
                console.log(data);
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
                // location.reload();
            }
        });
    }

    static search(data, callback){
        $.ajax({
            url:'/trainer/search_member_info/',
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


