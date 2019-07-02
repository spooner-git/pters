class Lecture{
    constructor(targetHTML, instance){
        this.page_name = 'lecture';
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.data_length = 0;
        this.lecture_ing_length = 0;
        this.lecture_end_length = 0;
        this.list_type_text = "";
        this.list_status_type_text = "";
        this.list_status_type = "ing"; //ing, end
    }

    init(list_status_type){
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page

        if(list_status_type==undefined){
            list_status_type = this.list_status_type;
        }

        this.list_status_type = list_status_type;

        this.render_upper_box();
        this.request_lecture_list(list_status_type, (jsondata) => {
            this.render_lecture_list(jsondata, list_status_type);
            this.render_upper_box();
        });

    }


    //수강권 리스트 서버에서 불러오기
    request_lecture_list(status ,callback){
        //sort_order_by : lecture_type_seq, lecture_name, lecture_member_many, lecture_member_few, lecture_create_new, lecture_create_old
        let url;
        if(status=='ing'){
            url = '/trainer/get_group_ing_list/';
        }else if (status=='end'){
            url = '/trainer/get_group_end_list/';
        }
        // else{
        //     url = '/trainer/get_package_list/';
        // }
        let start_time;
        let end_time;
        $.ajax({
            url:url,
            type:'GET',
            // data: {"page": lecture_page_num, "sort_val": lecture_sort_val, "sort_order_by":lecture_sort_order_by, "keyword":lecture_keyword},
            data: {"page": 1, "sort_val": 0, "sort_order_by":0, "keyword":""},
            // dataType : 'html',
    
            beforeSend:function(){
                start_time = performance.now();
                ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function(data){
                console.log(data);
                // var jsondata = JSON.parse(data);
                // if(jsondata.messageArray.length>0){
                //     console.log("에러:" + jsondata.messageArray);
                // }else{
                end_time = performance.now();
                console.log((end_time-start_time)+'ms');
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

        let component = this.static_component();
        document.getElementById('lecture_display_panel').innerHTML = component.lecture_upper_box;
    }

    //수강권 리스트를 렌더링
    render_lecture_list(jsondata, list_status_type){

        if(current_page != this.page_name){
            return false;
        }

        let whole_data, length;

        if(list_status_type == "ing"){
            whole_data = jsondata.current_group_data;
            length = whole_data.length;
            this.lecture_ing_length = length;
            this.list_status_type_text = "진행중";
        }else if(list_status_type == "end"){
            whole_data = jsondata.finish_group_data;
            length = whole_data.length;
            this.lecture_end_length = length;
            this.list_status_type_text = "종료";
        }

        this.list_type_text = "수업";
        this.data_length = length;

        let html_temp = [];
        for(let i=0; i<length; i++){
            let data = whole_data[i];
            let lecture_id = data.group_id;
            let lecture_name = data.group_name;
            let lecture_note = data.group_note != "" ? data.group_note : " - ";
            let lecture_max_member_number = data.group_max_num;
            let lecture_member_number = data.group_ing_member_num;
            // let lecture_packages_included_name = data.group_package_list;
            // let lecture_packages_included_id = data.group_package_id_list;
            // let lecture_packages_included_name_html = lecture_packages_included_name.map(el => `<div>${el}</div>`).join('');

            let onclick = `layer_popup.open_layer_popup(${POPUP_AJAX_CALL}, '${POPUP_ADDRESS_LECTURE_VIEW}', 100, ${POPUP_FROM_RIGHT}, {'lectureid':${lecture_id}});`;
            let html = `<article class="lecture_wrapper" data-lectureid="${lecture_id}" onclick="${onclick}">
                            <div class="lecture_data_l">
                                <div class="lecture_tag_body" style="background:#fe4e65"></div>
                                <div class="lecture_tag_head" style="border-left-color:#fe4e65"></div>
                            </div>
                            <div class="lecture_data_c">
                                <div class="lecture_name">${lecture_name}</div>
                                <div class="lecture_note">정원 - ${lecture_max_member_number}명 / ${lecture_note}</div>
                            </div>
                            <div class="lecture_data_r">
                                <div class="lecture_member_number">${list_status_type == "ing" ? lecture_member_number+'명' : ""}
                                </div>
                            </div>
                        </article>`
            html_temp.push(html);
        }

        document.querySelector('#lecture_content_wrap').innerHTML = html_temp.join("");
        $('#root_content').scrollTop(1);
    }


    //리스트 타입을 스위치
    switch_type(){
        switch(this.list_status_type){
            case "ing":
                this.init("end");
            break;

            case "end":
                this.init("ing");
            break;
        }
    }

    static_component(){
        return(
            {    "lecture_upper_box":`   <div class="lecture_upper_box">
                                            <div style="display:inline-block;width:200px;">
                                                <div style="display:inline-block;width:200px;">
                                                    <span style="font-size:20px;font-weight:bold;">수업 ${this.data_length}</span>
                                                </div>
                                                
                                            </div>
                                            <div class="lecture_tools_wrap">
                                                <div class="swap_list" onclick="${this.instance}.switch_type();"></div>
                                                <div class="search_lecture"></div>
                                                <div class="add_lecture" onclick="layer_popup.open_layer_popup(${POPUP_AJAX_CALL}, '${POPUP_ADDRESS_LECTURE_ADD}', 95, ${POPUP_FROM_BOTTOM}, {'data':null})"></div>
                                            </div>
                                        </div>
                                        <div class="lecture_bottom_tools_wrap">
                                            <div class="list_type_tab_wrap">
                                                <div onclick="${this.instance}.switch_type();" class="${this.list_status_type == "ing" ? "tab_selected" : ""}">활성화</div>
                                                <div onclick="${this.instance}.switch_type();" class="${this.list_status_type == "end" ? "tab_selected" : ""}">비활성화</div>
                                            </div>
                                        </div>
                                            `
                                ,
                "initial_page":`<div id="${this.subtargetHTML}"><div id="lecture_display_panel"></div><div id="lecture_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div></div>`
            }
        )
    }
}