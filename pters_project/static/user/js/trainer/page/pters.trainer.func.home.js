class Home {
    constructor (targetHTML, instance){
        this.page_name = "home";
        this.targetHTML = targetHTML;
        this.instance = instance;

        let d = new Date();
        this.current_year = d.getFullYear();
        this.current_month = d.getMonth()+1;
        this.current_date = d.getDate();
        this.today = DateRobot.to_yyyymmdd(this.current_year, this.current_month, this.current_date);

        this.data = {
            user_id : '',
            user_name : '',
            user_photo : '/static/common/icon/icon_account.png',
            user_email : '',
            user_phone : '',
            program : '',
        };

        this.view = {
            today_plan: OPEN,
            end_alert: OPEN
        };

        this.received_data_cache = null; // 재랜더링시 스크롤 위치를 기억하도록 먼저 이전 데이터를 그려주기 위해
    }

    init (){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;

        // this.render_loading_image();
        this.render_upper_box();
        this.render_content();
    }

    //상단을 렌더링
    render_upper_box (){
        Mypage_func.read((data)=>{
            this.data.user_id = data.trainer_info.member_id;
            this.data.user_name = data.trainer_info.member_name;
            this.data.user_photo = data.trainer_info.member_profile_url;
            let component = this.static_component();
            document.getElementById('home_display_panel').innerHTML = component.home_upper_box;
        });
    }

    //회원 리스트를 렌더링
    render_content (){
        // let today_plan;

        let program_dom;
        let plan_dom;
        let end_alert_dom;
        let sales_summary_dom;

        Program_func.read((data)=>{
            let program = this.dom_row_program(data);
            program_dom = '<div class="contents">' + program + '</div>';

            calendar.request_schedule_data (this.today, 1, (data)=>{
                let today_plan = this.dom_row_today_plan(data);
                plan_dom = '<div class="contents">' + today_plan + '</div>';

                member.request_member_list("ing", (data)=>{
                    let end_alert = this.dom_row_end_alert(data);
                    end_alert_dom = '<div class="contents">' + end_alert + '</div>';

                    Statistics_func.read("sales", {"start_date":this.today, "end_date":this.today}, (data)=>{
                        let sales_summary = this.dom_row_sales_this_month(data);
                        sales_summary_dom = '<div class="contents">' + sales_summary + '</div>';
                        
                        let html = program_dom + plan_dom + end_alert_dom + sales_summary_dom;
                        document.querySelector('#home_content_wrap').innerHTML = html;

                    });
                });
            });
        });
    }

    dom_row_program(data){
        let html_to_join = [];

        let programs = data.program_data;
        let length = programs.length;
        for(let i=0; i<length; i++){
            if(programs[i].program_selected == PROGRAM_NOT_SELECTED){
                continue;
            }
            let id = "home_selected_program";
            let title = programs[i].program_subject_type_name;
            let icon = DELETE;
            let icon_r_visible = HIDE;
            let icon_r_text = "변경 <img src='/static/common/icon/icon_arrow_r_small_grey.png' style='width: 25px;vertical-align: middle;'>";
            let style = {"font-size":"15px", "font-weight":"bold"};
            let onclick = ()=>{
                sideGoPage("program");
            };
            let selected_program = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
            let dom = `<article class="program_wrapper">
                            ${selected_program}
                        </article>`;
            html_to_join.push(dom);
        }


        let html = html_to_join.join("");
        return html;
    }

    dom_row_today_plan(data){
        let date = this.today;
        //받아온 데이터에 아무것도 없을 경우
        if(Object.keys(data).length == 0){
            data[date] = [];
        }
        //받아온 데이터에 오늘이 없을 경우
        if(Object.keys(data).indexOf(date) == -1){
            data[date] = [];
        }
        let plans = data[date];

        let length = plans.length;
        let off_plan_number = 0;
        let html_to_join = [];
        for(let i=0; i<length; i++){
            if(plans[i].schedule_type == 0){
                off_plan_number++;
                continue;
            }
            let status = plans[i].state_cd;
            let type = plans[i].schedule_type;
            let participants = plans[i].lecture_current_member_num + '/' + plans[i].lecture_max_member_num;
            if(type == 1){
                participants = "개인";   
            }
            let lecture_color = plans[i].lecture_ing_color_cd;
            let dom = `<article class="today_plan_wrapper" onclick="${this.instance}.popup_plan_view(${plans[i].schedule_id})" ${status != SCHEDULE_NOT_FINISH ? "style='opacity:0.7'":""}>
                            <div>${plans[i].start_time} - ${plans[i].end_time}</div>
                            <div ${status != SCHEDULE_NOT_FINISH ? "style='text-decoration:line-through;'":""}><div class="today_plan_lecture_color" style="background-color:${lecture_color}"></div>${plans[i].lecture_name == "" ? plans[i].member_name : plans[i].lecture_name}</div>
                            <div>${participants}</div>
                        </article>`;

            html_to_join.push(dom);
        }
        
        if(html_to_join.length == 0){
            html_to_join.push(`<article class="today_plan_wrapper">
                                    <span style="font-size:13px;">오늘 일정이 없습니다.</span>
                                </article>`);
        }

        let id = "home_today_plan_expand_button";
        let title = "접기/펼치기";
        let style = {"float":"right", "padding":"0", "font-size":"12px", "font-weight":"500", "color":"#858282"};
        let onclick = ()=>{
            if(this.view.today_plan == OPEN){
                this.view.today_plan = CLOSE;
                $(`#${id}_target`).hide();
            }else{
                this.view.today_plan = OPEN;
                $(`#${id}_target`).show();
            }
        };
        let expand_button = CComponent.text_button (id, title, style, onclick);
        

        let section_title = `<article class="today_plan_wrapper" style="font-weight:bold;font-size:15px;letter-spacing: -0.7px;display:block;">
                                <span style="margin-right:5px;">오늘의 일정</span> <span style="color:#fe4e65;font-size:17px;"> ${length-off_plan_number}</span>
                                ${length > 0 ? expand_button : ""}
                            </article>`;
     
        
        let html = section_title + `<div id="${id}_target" ${this.view.today_plan == CLOSE ? "style=display:none;" : ""}>`+ html_to_join.join("")+'</div>';
        return html;
    }

    dom_row_end_alert(data){
        let html_to_join = [];
        let length = data.current_member_data.length;

        let passed_number = 0;
        for(let i=0; i<length; i++){
            let end_date = data.current_member_data[i].end_date;
            let diff_date = DateRobot.diff_date(end_date, this.today);
            let rem_count = data.current_member_data[i].member_ticket_rem_count;
            if(diff_date > 7 && rem_count > 3){
                passed_number++;
                continue;
            }
            let member_id = data.current_member_data[i].member_id;
            let end_info;
            if(diff_date <= 7 && rem_count > 3){
                end_info = diff_date + ' 일';
                if(diff_date < 0){
                    end_info = Math.abs(diff_date) + ' 일 지남';
                }
            }else if(diff_date > 7 && rem_count <= 3){
                end_info = rem_count + ' 회';
            }else{
                let date_info =  diff_date + ' 일';
                if(diff_date < 0){
                    date_info = Math.abs(diff_date) + ' 일 지남';
                }
                end_info = rem_count + '  회 / ' + date_info;
                
            };
            
            let id = `home_end_alert_${member_id}`;
            let title = data.current_member_data[i].member_name;
            let icon = DELETE;
            let icon_r_visible = HIDE;
            let icon_r_text = `<span style="color:#ff0022;font-size:12px;font-weight:500;letter-spacing:-0.5px;">${end_info}</span>`;
            let style = {"font-size":"14px", "padding":"12px 0"};
            let onclick = ()=>{
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_VIEW, 100, POPUP_FROM_RIGHT, null, ()=>{
                    member_view_popup = new Member_view('.popup_member_view', member_id, 'member_view_popup');});
            };

            let end_alert_member = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
            let dom = `<article class="end_alert_wrapper">
                            ${end_alert_member}
                        </article>`;
            html_to_join.push(dom);
        }

        let id = "home_end_alert_expand_button";
        let title = "접기/펼치기";
        let style = {"float":"right", "padding":"0", "font-size":"12px", "font-weight":"500", "color":"#858282"};
        let onclick = ()=>{
            if(this.view.end_alert == OPEN){
                this.view.end_alert = CLOSE;
                $(`#${id}_target`).hide();
            }else{
                this.view.end_alert = OPEN;
                $(`#${id}_target`).show();
            }
        };
        let expand_button = CComponent.text_button (id, title, style, onclick);

        let section_title =  `<article class="today_plan_wrapper" style="font-weight:bold;font-size:15px;letter-spacing: -0.7px;display:block;">
                                <span style="margin-right:5px;">종료 임박 회원</span> 
                                <span style="color:#fe4e65;font-size:17px;"> ${length-passed_number}</span>
                                ${length-passed_number > 0 ? expand_button : ""}
                            </article>`;
        
        let html = section_title + `<div id="${id}_target" ${this.view.end_alert == CLOSE ? "style=display:none;" : ""}>`+ html_to_join.join("") + '</div>';
        return html;
    }

    dom_row_sales_this_month(data){
        let html_to_join = [];

        let id = "home_sales_summary";
        let title = "이번달 매출";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = `${UnitRobot.numberWithCommas(Number(data.price[0]) - Number(data.refund_price[0]))} 원 <img src='/static/common/icon/icon_arrow_r_small_grey.png' style='width: 25px;vertical-align: middle;'>`;
        let style = {"font-size":"15px", "font-weight":"bold"};
        let onclick = ()=>{
            sideGoPage("statistics");
        };
        let sales_data = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        let dom = `<article class="sales_wrapper">
                        ${sales_data}
                    </article>`;
        html_to_join.push(dom);
        
        let html = html_to_join.join("");
        return html;
    }


    //회원 리스트 서버에서 불러오기
    request_home (callback, async){
        var url;
        if(async == undefined){
            async = true;
        }
        $.ajax({
            url:url,
            dataType : 'JSON',
            async:async,
    
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
                if(callback != undefined){
                    callback(data);
                }
                return data;
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

    popup_plan_view(schedule_id){
        let user_selected_plan = {schedule_id:schedule_id, date:{year:this.current_year, month:this.current_month, date:this.current_date}};
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PLAN_VIEW, 100, POPUP_FROM_RIGHT, null, ()=>{
            plan_view_popup = new Plan_view('.popup_plan_view', user_selected_plan, "plan_view_popup");
        });
    }

    go_to_profile(){
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MYPAGE, 100, POPUP_FROM_RIGHT, null, ()=>{mypage_popup = new Mypage('.popup_mypage');});
    }

    static_component (){
        return(
            {
                home_upper_box:`   <div class="home_upper_box">
                                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                                            <div style="display:inline-block;">${this.data.user_name} </div>
                                        </div>
                                        <div class="home_right_button" onclick="${this.instance}.go_to_profile()"><img src="${this.data.user_photo}"></div>
                                    </div>
                                    `
                ,
                initial_page:`<div id="home_display_panel"></div>
                                <div id="home_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px; padding-top:6px; padding-bottom:20px;"></div>`
            }
        );
    }
}

class Home_func{
    static read(data, callback){
        //데이터 형태 {"home_id":""};
        $.ajax({
            url:'/trainer/get_home_info/',
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
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
                callback(data);
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }
}

/* global $, 
ajax_load_image, 
SHOW, HIDE, 
current_page, 
POPUP_AJAX_CALL, POPUP_ADDRESS_home_VIEW, POPUP_FROM_RIGHT, POPUP_ADDRESS_home_ADD, POPUP_FROM_BOTTOM, 
windowHeight*/ 


