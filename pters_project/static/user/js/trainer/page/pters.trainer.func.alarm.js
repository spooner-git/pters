class Alarm {
    constructor (targetHTML, instance){
        this.page_name = "alarm";
        this.targetHTML = targetHTML;
        this.instance = instance;

    }

    init (list_type){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;


        this.render_upper_box();
        Alarm_func.read((jsondata) => {
            this.render_list(jsondata, list_type);
            this.render_upper_box();
        });
    }


    //상단을 렌더링
    render_upper_box (){
        if(current_page != this.page_name){
            return false;
        }

        this.search = false;
        let component = this.static_component();
        document.getElementById('alarm_display_panel').innerHTML = component.alarm_upper_box;
    }

    //회원 리스트를 렌더링
    render_list (jsondata, list_type){
        if(current_page != this.page_name){
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
            let end_date_text = DateRobot.to_text(end_date);
            let remain_date = Math.round((new Date(end_date).getTime() - new Date().getTime()) / (1000*60*60*24));
            let remain_alert_text = "";
            if(remain_date < 0){
                remain_alert_text = " <span style='color:#fe4e65;'>지남</span>";
                remain_date = Math.abs(remain_date);
            }

            let onclick = `layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_MEMBER_VIEW}', 100, ${POPUP_FROM_RIGHT}, {'member_id':${member_id}}, ()=>{
                member_view_popup = new Member_view('.popup_member_view', ${member_id}, 'member_view_popup');});`;
            let html = `<article class="member_wrapper" data-member_id="${member_id}" data-name="${member_name}" onclick="${onclick}" style="color:${list_type == "ing" ? "" : '#a3a0a0'}">
                            <div class="alarm_data_u">
                                <img src="/static/common/icon/icon_account.png">
                            </div>                
                            <div class="alarm_data_b">
                                <div class="member_name">${member_name}</div>
                                <div class="member_counts">
                                 ${list_type == "ing" ? member_rem+'회/ '+remain_date+'일'+remain_alert_text+'/ - '+end_date_text+'까지' : '종료됨'}
                                </div>
                            </div>
                        </article>`;
            html_temp.push(html);
        }

        document.querySelector('#member_content_wrap').innerHTML = html_temp.join("");
    }

  

    static_component (){
        return(
            {
                member_upper_box:`  <div class="alarm_upper_box">
                                        <div style="display:inline-block;width:200px;">
                                            <span style="font-size:23px;font-weight:bold;color:#3b3d3d">알림 </span>
                                        </div>
                                    </div>`
                ,
                initial_page:`<div id="alarm_display_panel"></div><div id="alarm_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div>`
            }
        );
    }
}

class Alarm_func{
    static read(callback){
        //알림 리스트 서버에서 불러오기
        $.ajax({
            url:"/trainer/alarm/",
            dataType : 'JSON',
            beforeSend:function (){
                ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function (data){
                console.log(data);
                // let jsondata = JSON.parse(data);
                callback(data);
            },

            //보내기후 팝업창 닫기
            complete:function (){
                ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
            }
        });
    }

    static delete(){

    }
}


