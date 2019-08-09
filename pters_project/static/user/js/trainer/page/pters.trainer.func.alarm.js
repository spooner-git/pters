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


        let html_temp = [];
        for (let i=0; i<length; i++){
            
            let html = `<article class="member_wrapper" data-member_id="${member_id}" data-name="${member_name}" style="color:${list_type == "ing" ? "" : '#a3a0a0'}">
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
                if(callback != undefined){
                    callback(data);
                }
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


