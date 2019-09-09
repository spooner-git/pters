class Statistics{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_statistics_list_toolbox', content:'section_statistics_list_content'};

        let d = new Date();
        this.dates = {
            current_year: d.getFullYear(),
            current_month: d.getMonth()+1,
            current_date: d.getDate(),
            current_last_date : new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()
        };
        this.times = {
            current_hour: TimeRobot.to_zone(d.getHours(), d.getMinutes()).hour,
            current_minute: TimeRobot.to_zone(d.getHours(), d.getMinutes()).minute,
            current_zone: TimeRobot.to_zone(d.getHours(), d.getMinutes()).zone
        };

        this.data = {
                
        };

        this.init();
        // this.set_initial_data();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        let data = {"start_date":`${this.dates.current_year}-${this.dates.current_month}-1`,
                    "end_date":`${this.dates.current_year}-${this.dates.current_month}-${this.dates.current_last_date}`};
        Statistics_func.read("sales", data, (data)=>{
            this.data = data;
            this.render_content();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });   
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();statistics_list_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_plus_pink.png" class="obj_icon_basic" onclick="statistics_list_popup.upper_right_menu();"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_statistics .wrapper_top').style.border = 0;
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    dom_assembly_toolbox(){
        return this.dom_row_toolbox();
    }
    
    dom_assembly_content(){
        let html = "content_assembly";

        return html;
    }

    dom_row_toolbox(){
        let title = "매출 통계";
        let title2 = "회원 통계";
        let html = `
                    <div class="lecture_view_upper_box" style="">
                        <div style="display:inline-block;width:320px;">
                            <div style="display:inline-block;width:100px;font-size:23px;font-weight:bold">
                                ${title}
                            </div>
                            <div style="background-color:#f5f2f3;width:2px;height:16px;vertical-align:middle;margin:0 8px;"></div>
                            <div style="display:inline-block;width:100px;font-size:23px;font-weight:bold">
                                ${title2}
                            </div>
                        </div>
                    </div>
                    `;
        return html;
    }

    event_statistics_click(){
        
    }

    upper_right_menu(){
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_statistics_ADD, 100, POPUP_FROM_RIGHT, null, ()=>{
            statistics_add_popup = new statistics_add('.popup_statistics_add');
        });
    }
}

class Statistics_func{
    static read(list, data, callback, async){
        let url;
        switch(list){
            case "sales":
                //data : {'class_id':class_id, 'start_date':start_date, 'end_date':end_date}
                url = '/stats/get_sales_list/';
            break;
            case "sales_detail":
                //data : {'class_id':class_id, 'month_date':month_date}
                url = '/stats/get_sales_info/';
            break;
            case "member":
                //data : {'class_id':class_id, 'start_date':start_date, 'end_date':end_date}
                url = '/stats/get_stats_member_list/';
            break;
        }

        if(async == undefined){
            async = true;
        }
        //프로그램 리스트 서버에서 불러오기
        $.ajax({
            url: url,
            type:'GET',
            data: data,
            dataType : 'JSON',
            async: async,
            
            beforeSend:function (){
                // ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function (data){
                console.log(data);
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){
                // ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
            }
        });
    }

    static update(data, callback){
        //프로그램 추가
        $.ajax({
            url:"/trainer/update_statistics_info/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    static delete(data, callback){
        //프로그램 추가
        $.ajax({
            url:"/trainer/delete_statistics_info/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }
}

