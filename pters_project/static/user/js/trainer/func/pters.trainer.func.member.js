class Member{
    constructor(targetHTML, instance){
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.member_length = 0;
        this.member_list_type = "";
    }

    init(){
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page

        this.render_upper_box();
        this.request_member_list((jsondata) => {
            this.render_member_list(jsondata);
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
    render_member_list(jsondata, type){
        let db_id = jsondata.dIdArray;
        let name = jsondata.nameArray;
        let reg_count = jsondata.regCountArray;
        let rem_count = jsondata.countArray;
        let avl_count = jsondata.availCountArray;
        let phone = jsondata.phoneArray;
        let length = jsondata.dIdArray.length;

        this.member_length = length;
        this.member_list_type = "진행중";

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





    static_component(){
        return(
            {    "member_upper_box":`   <div class="member_upper_box">
                                            <div style="display:inline-block;width:200px;">
                                                <span class="">[${this.member_list_type}] ${this.member_length}명</span>
                                            </div>
                                            <div class="member_tools_wrap">
                                                <div class="swap_list" onclick="alert('swap list 함수')"></div>
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