class Member{
    constructor(targetHTML, instance){
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.member_length = 0;
        this.member_list_type_text = "";
        this.list_type = "ongoing";
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
        });
    }


    //회원 리스트 서버에서 불러오기
    request_member_list(callback){
        $.ajax({
            url:'/trainer/get_member_list/',
            dataType : 'html',
    
            beforeSend:function(){
                ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    console.log("에러:" + jsondata.messageArray);
                }else{
                    callback(jsondata);
                    return jsondata;
                }
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
        let component = this.static_component();
        document.getElementById('member_display_panel').innerHTML = component.member_upper_box;
    }

    //회원 리스트를 렌더링
    render_member_list(jsondata, list_type){

        let db_id, name, reg_count, rem_count, avl_count, phone, length;

        if(list_type == "ongoing"){
            db_id = jsondata.dIdArray;
            name = jsondata.nameArray;
            reg_count = jsondata.regCountArray;
            rem_count = jsondata.countArray;
            avl_count = jsondata.availCountArray;
            phone = jsondata.phoneArray;
            length = jsondata.dIdArray.length;
            this.member_list_type_text = "진행중";
        }else if(list_type == "ended"){
            db_id = jsondata.finishDidArray;
            name = jsondata.finishnameArray;
            reg_count = jsondata.finishRegCountArray;
            rem_count = jsondata.finishcountArray;
            avl_count = jsondata.finishAvailCountArray;
            phone = jsondata.finishphoneArray;
            length = jsondata.finishDidArray.length;
            this.member_list_type_text = "종료";
        }

        console.log(db_id)

        this.member_length = length;

        let html_temp = [];
        for(let i=0; i<length; i++){
            let html = `<article class="member_wrapper" data-dbid="${db_id[i]}" onclick="alert('${name[i]} (ID:${db_id[i]})')">
                            <div class="member_data_l">
                                <div class="member_name">${name[i]}</div>
                                <div class="member_counts"> ${rem_count[i]} / ${reg_count[i]} <span style="font-size:10px;color:#8d8d8d;">(남은 횟수 / 총 등록횟수)</span></div>
                            </div>
                            <div class="member_data_r">
                                <div class="member_phone" onclick="event.stopPropagation();location.href='tel:${phone[i]}'" ${phone[i] == "" ? "style='display:none;'" : ""}>
                                    <img src="/static/common/icon/icon_phone.png" class="icon_contact">
                                </div>
                                <div class="member_sms" onclick="event.stopPropagation();location.href='sms:${phone[i]}'" ${phone[i] == "" ? "style='display:none;'" : ""}>
                                    <img src="/static/common/icon/icon_message.png" class="icon_contact">
                                </div>
                            </div>
                        </article>`
            html_temp.push(html);
        }

        document.querySelector('#content_wrap').innerHTML = html_temp.join("");
        $('#root_content').scrollTop(1);
    }


    switch_type(){
        switch(this.list_type){
            case "ongoing":
                this.init("ended");
            break;

            case "ended":
                this.init("ongoing");
            break;
        }
    }





    static_component(){
        return(
            {    "member_upper_box":`   <div class="member_upper_box">
                                            <div style="display:inline-block;width:200px;">
                                                <span>회원 리스트 </span>
                                                <span class="">[${this.member_list_type_text}] ${this.member_length}명</span>
                                            </div>
                                            <div class="member_tools_wrap">
                                                <div class="swap_list" onclick="${this.instance}.switch_type();"></div>
                                                <div class="search_member"></div>
                                                <div class="add_member"></div>
                                            </div>
                                        </div>`
                                ,
                "initial_page":`<div id="${this.subtargetHTML}"><div id="member_display_panel"></div><div id="content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div></div>`
            }
        )
    }
}