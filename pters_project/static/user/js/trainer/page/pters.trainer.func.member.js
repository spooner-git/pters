class Member{
    constructor(targetHTML, instance){
        this.page_name = 'member';
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.member_length = 0;
        this.member_ing_length = 0;
        this.member_end_length = 0;
        this.member_list_type_text = "";
        this.list_type = "ing";

        this.search = false;
    }

    init(list_type){
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page

        if(list_type==undefined){
            list_type = this.list_type;
        }

        this.list_type = list_type;

        this.render_upper_box();
        this.request_member_list((jsondata) => {
            this.render_member_list(jsondata, list_type);
            this.render_upper_box();
        }, list_type);
    }


    //회원 리스트 서버에서 불러오기
    request_member_list(callback, list_type){
        var start_time;
        var end_time;
        var url;
        console.log(list_type)
        if(list_type == 'ing'){
            url = '/trainer/get_member_ing_list/';
        }else if(list_type == 'end'){
            url = '/trainer/get_member_end_list/';
        }else{
            url = '/trainer/get_member_list';
        }
        $.ajax({
            url:url,
            dataType : 'JSON',
    
            beforeSend:function(){
                ajax_load_image(SHOW);
                start_time = performance.now();
            },
    
            //통신성공시 처리
            success:function(data){
                // var jsondata = JSON.parse(data);
                console.log(data)
                end_time = performance.now();
                // if(jsondata.messageArray.length>0){
                //     console.log("에러:" + jsondata.messageArray);
                // }else{
                    console.log(end_time-start_time+'ms');
                    callback(data);
                    return data;
                // }
            },

            //보내기후 팝업창 닫기
            complete:function(){
                ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function(){
                console.log('server error');
            }
        })
    }


    //상단을 렌더링
    render_upper_box(){
        if(current_page != this.page_name){
            return false;
        }

        this.search = false;
        let component = this.static_component();
        document.getElementById('member_display_panel').innerHTML = component.member_upper_box;
    }

    //회원 리스트를 렌더링
    render_member_list(jsondata, list_type){
        if(current_page != this.page_name){
            return false;
        }
        // let length;
        let render_member_data;


        if(list_type == "ing"){
            this.member_ing_length = Object.keys(jsondata.current_member_data).length;
            this.member_end_length = jsondata.finish_member_num;
            render_member_data = jsondata.current_member_data;
            this.member_list_type_text = "진행중";
        }else if(list_type == "end"){
            this.member_ing_length = jsondata.current_member_num;
            this.member_end_length = Object.keys(jsondata.finish_member_data).length;
            render_member_data = jsondata.finish_member_data;
            this.member_list_type_text = "종료";
        }
        // this.member_length = length;

        let html_temp = [];
        for (let member_info in render_member_data){
            let onclick = `layer_popup.open_layer_popup(${POPUP_AJAX_CALL}, '${POPUP_ADDRESS_MEMBER_VIEW}', 100, ${POPUP_FROM_RIGHT}, {'dbid':${render_member_data[member_info].member_id}});`;
            let html = `<article class="member_wrapper" data-dbid="${render_member_data[member_info].member_id}" data-name="${render_member_data[member_info].member_name}" onclick="${onclick}">
                            <div class="member_data_l">
                                <div class="member_name">${render_member_data[member_info].member_name}</div>
                                <div class="member_counts"> ${render_member_data[member_info].lecture_rem_count} / ${render_member_data[member_info].lecture_reg_count} <span style="font-size:10px;color:#8d8d8d;">(남은 횟수 / 총 등록횟수)</span></div>
                            </div>
                            <div class="member_data_r">
                                <div class="member_phone" onclick="event.stopPropagation();location.href='tel:${render_member_data[member_info].member_phone}'" ${render_member_data[member_info].member_phone == null ? "style='display:none;'" : ""}>
                                    <img src="/static/common/icon/icon_phone.png" class="icon_contact">
                                </div>
                                <div class="member_sms" onclick="event.stopPropagation();location.href='sms:${render_member_data[member_info].member_phone}'" ${render_member_data[member_info].member_phone== null ? "style='display:none;'" : ""}>

                                    <img src="/static/common/icon/icon_message.png" class="icon_contact">
                                </div>
                            </div>
                        </article>`
            html_temp.push(html);
        }

        document.querySelector('#member_content_wrap').innerHTML = html_temp.join("");
        $('#root_content').scrollTop(1);
    }


    //리스트 타입을 스위치
    switch_type(type){
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

    search_member_tool_visible(event){
        event.stopPropagation();
        event.preventDefault();
        switch(this.search){
            case true:
                this.search = false;
                document.getElementsByClassName('search_input')[0].style.transform = 'translateY(-50px)';
                setTimeout(()=>{
                    document.getElementsByClassName('search_input')[0].style.display = 'none';
                },0)
                
                event.target.style.backgroundImage = 'url("/static/common/icon/icon_search.png")';
            break;

            case false:
                this.search = true;
                setTimeout(()=>{
                    document.getElementsByClassName('search_input')[0].style.display = 'block';
                },0)
                document.getElementsByClassName('search_input')[0].style.transform = 'translateY(0)';
                document.getElementsByClassName('search_input')[0].value = '';
                event.target.style.backgroundImage = 'url("/static/common/icon/close_black.png")';
            break;
        }
    }

    search_member_by_typing(event){

        let value = event.target.value;
        Array.from(document.getElementsByClassName('member_wrapper')).forEach((el)=>{
            let name = el.dataset.name;
            if(name.match(value)){
                el.style.display = 'block';
                $('#root_content').scrollTop(1);
            }else{
                el.style.display = 'none';
            }
        })
    }


    static_component(){
        return(
            {    "member_upper_box":`   <div class="member_upper_box">
                                            <div style="display:inline-block;width:200px;">
                                                <span style="font-size:20px;font-weight:bold;">회원 ${this.list_type == "ing" ? this.member_ing_length : this.member_end_length}</span>
                                            </div>
                                            <div class="member_tools_wrap">
                                                <div class="search_member" onclick="${this.instance}.search_member_tool_visible(event);">
                                                    <input type="text" class="search_input" placeholder="검색" onclick="event.stopPropagation();" onkeyup="${this.instance}.search_member_by_typing(event)">
                                                </div>
                                                <div class="add_member" onclick="layer_popup.open_layer_popup(${POPUP_AJAX_CALL}, '${POPUP_ADDRESS_MEMBER_ADD}', 95, ${POPUP_FROM_BOTTOM}, {'data':null})"></div>
                                            </div>
                                        </div>
                                        <div class="member_bottom_tools_wrap">
                                            <div class="list_type_tab_wrap">
                                                <div onclick="${this.instance}.switch_type('ing');" class="${this.list_type == "ing" ? "tab_selected" : ""}">진행중</div>
                                                <div onclick="${this.instance}.switch_type('end');" class="${this.list_type == "end" ? "tab_selected" : ""}">종료</div>
                                            </div>
                                            <div class="list_sort_select_wrap">
                                                <select>
                                                    <option>이름순</option>
                                                    <option>남은 횟수순</option>
                                                    <option>등록 횟수순</option>
                                                </select>
                                            </div>
                                        </div>`
                                ,
                "initial_page":`<div id="member_display_panel"></div><div id="member_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div>`
            }
        )
    }
}