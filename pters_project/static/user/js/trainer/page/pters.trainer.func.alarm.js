class Alarm {
    constructor (targetHTML, instance){
        this.page_name = "alarm";
        this.targetHTML = targetHTML;
        this.instance = instance;

        this.data;
        this.paging = 0;
    }

    init (){
        // if(current_page != this.page_name){
        //     return false;
        // }

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;


        this.render_upper_box();
        Alarm_func.read((jsondata) => {
            // this.render_list(jsondata);
            this.data = this.dom_list(jsondata);
            this.render_list(this.data);
            this.render_upper_box();
            $root_content.scrollTop(1);
        });
    }


    //상단을 렌더링
    render_upper_box (){
        // if(current_page != this.page_name){
        //     return false;
        // }

        this.search = false;
        let component = this.static_component();
        document.getElementById('alarm_display_panel').innerHTML = component.alarm_upper_box;
    }

    //회원 리스트를 렌더링
    render_list (data){
        // if(current_page != this.page_name){
        //     return false;
        // }

        let page_data = data.slice(this.paging*40, (this.paging*40)+40);
        let node = document.createElement("div");
        node.setAttribute('id', `alarm_paging_${this.paging}`);
        document.querySelector('#alarm_content_wrap').appendChild(node);

        let node2 = document.createElement("div");
        node2.setAttribute('id', `alarm_paging_${this.paging + 1}`);
        document.querySelector('#alarm_content_wrap').appendChild(node2);

        let more = `<div style="text-align:center;font-size:12px;font-weight:500;height:30px;line-height:30px;background-color:#f5f5f5;" onclick="alarm.render_more();">더 보기</div>`;
        if(page_data.length < 40){
            more = "";
        }

        document.querySelector(`#alarm_paging_${this.paging}`).innerHTML = page_data.join("");
        document.querySelector(`#alarm_paging_${this.paging+1}`).innerHTML = more;
    }

    render_more (){
        this.paging++;
        this.render_list(this.data);
    }

    dom_list (jsondata){
        let html_temp = [];
        for(let date in jsondata){
            let length = jsondata[date].length;
            for (let i=0; i<length; i++){
                let data = jsondata[date][i];
                let alarm_id = data.alarm_id;
                let alarm_from = data.alarm_from_member_name;
                let alarm_to = data.alarm_to_member_name;
                let alarm_what = data.alarm_info;
                let alarm_how = data.alarm_how;
                let alarm_time_ago = data.time_ago;
                let read_check = data.read_check;
                let html = `<article class="alarm_wrapper" data-alarm_id="${alarm_id}" style="background-color:${read_check == 1 ? "" : '#ffe8eb'}">
                                <div class="alarm_data_u">
                                    <div>
                                        <img src="/static/common/icon/icon_gap_black.png" style="float:left;margin-right:16px;">
                                    </div>
                                    <div>
                                        <span>${alarm_how}</span>
                                    </div>
                                    <div>
                                        <span style="float:right;color:#b8b4b4;font-size:11px;">${alarm_time_ago}</span>
                                    </div>
                                </div>                
                                <div class="alarm_data_b">
                                    <div></div>
                                    <div>
                                        <span>${alarm_from}님이 ${alarm_to != "" ? alarm_to+'님의' :''} ${alarm_what}을 ${alarm_how} 하였습니다.</span>
                                    </div>
                                </div>
                            </article>`;
                html_temp.push(html);
            }
        }
        if(html_temp.length == 0){
            html_temp.push(`<article class="alarm_wrapper">   
                                <div>
                                    <span>새로운 알림이 없습니다.</span>
                                </div>
                            </article>`);
        }

        return html_temp;
    }


    static_component (){
        return(
            {
                alarm_upper_box:`  <div class="alarm_upper_box">
                                        <div style="display:inline-block;width:200px;">
                                            <span style="font-size:23px;font-weight:bold;color:#3b3d3d">알림 </span>
                                        </div>
                                    </div>`
                ,
                initial_page:`<div>
                                <div id="alarm_display_panel"></div>
                                <div id="alarm_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:calc(100% - 68px)"></div>
                                </div>`
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
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
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


