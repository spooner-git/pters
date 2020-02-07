class Home {
    constructor (targetHTML, instance){
        this.page_name = "home";
        this.targetHTML = targetHTML;
        this.instance = instance;

        let d = new Date();
        this.current_year = d.getFullYear();
        this.current_month = d.getMonth()+1;
        this.current_date = d.getDate();
        this.current_day = d.getDay();
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

        this.received_data = {
            program:null, schedule:null, member:null, statistics:null
        };

        this.setting_data_cache = null;
    }

    init (){
        if(current_page_text != this.page_name){
            return false;
        }

        this.set_current_date();

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;

        this.render_loading_image();
        this.render_upper_box();
        this.render_content();
    }

    set_current_date(){
        let d = new Date();
        this.current_year = d.getFullYear();
        this.current_month = d.getMonth()+1;
        this.current_date = d.getDate();
        this.current_day = d.getDay();
        this.today = DateRobot.to_yyyymmdd(this.current_year, this.current_month, this.current_date);
    }

    //상단을 렌더링
    render_upper_box (){
        Mypage_func.read((data)=>{
            if(current_page_text != this.page_name){
                return false;
            }
            this.data.user_id = data.trainer_info.member_id;
            this.data.user_name = data.trainer_info.member_name;
            this.data.user_photo = data.trainer_info.member_profile_url;
            let component = this.static_component();
            document.getElementById('home_display_panel').innerHTML = component.home_upper_box;
        });
    }

    render_loading_image(){
        document.querySelector("#home_content_wrap").innerHTML = 
            `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;">
                <img src="/static/common/loading.svg">
                <div style="font-size:12px;color:var(--font-sub-normal);word-break:keep-all">${TEXT.message.loading[language]}</div>
            </div>`;
    }

    //회원 리스트를 렌더링
    render_content (){
        // let today_plan;

        let current_date;
        let program_dom;
        let plan_dom;
        let end_alert_dom;
        let sales_summary_dom;
        let my_pters_pass_dom;

        Setting_menu_access_func.read((data)=>{
            this.setting_data_cache = data;
            let menu_lock_statistics = data.setting_trainer_statistics_lock;
        
            Program_func.read((data)=>{
                this.received_data.program = data;
                let program = this.dom_row_program(data);
                program_dom = '<div class="contents anim_fade_in_vibe_top">' + program + '</div>';

                calendar.request_schedule_data (this.today, 1, (data)=>{
                    this.received_data.schedule = data;
                    let today_plan = this.dom_row_today_plan(data);
                    plan_dom = '<div class="contents anim_fade_in_vibe_top">' + today_plan + '</div>';

                    member.request_member_list("ing", (data)=>{
                        this.received_data.member = data;
                        let end_alert = this.dom_row_end_alert(data);
                        end_alert_dom = '<div class="contents anim_fade_in_vibe_top">' + end_alert + '</div>';

                        Statistics_func.read("sales", {"start_date":this.today, "end_date":this.today}, (data)=>{
                            this.received_data.statistics = data;
                            if(current_page_text != this.page_name){
                                return false;
                            }
                            let locked = menu_lock_statistics;
                            let sales_summary = this.dom_row_sales_this_month(data, locked);
                            sales_summary_dom = '<div class="contents anim_fade_in_vibe_top">' + sales_summary + '</div>';
                            if(pass_inspector.statistics_read().barrier == BLOCKED){
                                sales_summary_dom = "";
                            }


                            my_pters_pass_dom = '<div class="contents anim_fade_in_vibe_top">' + this.dom_row_my_pters_pass() + '</div>';
                            current_date = '<div class="contents anim_fade_in_vibe_top">' + this.dom_row_current_date() + '</div>';

                            let html = current_date + program_dom + plan_dom + end_alert_dom + sales_summary_dom;
                            document.querySelector('#home_content_wrap').innerHTML = html;
                            // $('#root_content').scrollTop(0);
                        });
                    }, OFF);
                }, OFF);
            });
        });
    }

    render_content_offline (){
        // let today_plan;

        let current_date_dom;
        let program_dom;
        let plan_dom;
        let end_alert_dom;
        let sales_summary_dom;

        let data = this.received_data;

        let current_date = this.dom_row_current_date();
        current_date_dom = '<div class="contents">' + current_date + '</div>';

        let program = this.dom_row_program(data.program);
        program_dom = '<div class="contents">' + program + '</div>';

        let today_plan = this.dom_row_today_plan(data.schedule);
        plan_dom = '<div class="contents">' + today_plan + '</div>';

        let end_alert = this.dom_row_end_alert(data.member);
        end_alert_dom = '<div class="contents">' + end_alert + '</div>';

        let sales_summary = this.dom_row_sales_this_month(data.statistics, this.setting_data_cache.setting_trainer_statistics_lock);
        sales_summary_dom = '<div class="contents">' + sales_summary + '</div>';

        let my_pters_pass_dom;
        my_pters_pass_dom = '<div class="contents">' + this.dom_row_my_pters_pass() + '</div>';
                        
        let html = current_date_dom + program_dom + plan_dom + end_alert_dom + sales_summary_dom;
        document.querySelector('#home_content_wrap').innerHTML = html;
    }

    dom_row_current_date(){

        let id = "home_current_date";
        let title = `${this.current_year}${TEXT.unit.year[language]} ${this.current_month}${TEXT.unit.month[language]} ${this.current_date}${TEXT.unit.date[language]} (${DAYNAME_KR[this.current_day]})`;
        let icon = DELETE;
        let icon_r_visible = NONE;
        let icon_r_text = ``;
        let style = {"font-size":"15px", "font-weight":"bold"};
        let onclick = ()=>{
            sideGoPage("calendar");
        };
        let my_pters_pass = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        let dom = `<article class="my_pters_pass_wrapper">
                        ${my_pters_pass}
                    </article>`;
        return dom;
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
            let icon_r_text = `${TEXT.word.change[language]} ${CImg.arrow_right(["var(--img-sub1)"], {"vertical-align":"middle"})}`;
            let style = {"font-size":"15px", "font-weight":"bold"};
            let onclick = ()=>{
                let inspect = pass_inspector.program_read();
                if(inspect.barrier == BLOCKED){
                    let message = `${inspect.limit_type}`;
                    show_error_message({title:message});
                    return false;
                }
                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PROGRAM_LIST, 100, popup_style, null, ()=>{
                    program_list_popup = new Program_list('.popup_program_list');});
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

    dom_row_my_pters_pass(){
        let html_to_join = [];


        let id = "home_my_pters_pass";
        let title = TEXT.word.my_using_pters_pass[language];
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = `${pass_inspector.data.auth_member_create.limit_type} ${CImg.arrow_right(["var(--img-sub1)"], {"vertical-align":"middle"})}`;
        let style = {"font-size":"13px", "font-weight":"bold"};
        let onclick = ()=>{
            sideGoPopup("pters_pass_main");
        };
        let my_pters_pass = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        let dom = `<article class="my_pters_pass_wrapper">
                        ${my_pters_pass}
                    </article>`;
        html_to_join.push(dom);
        


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
                participants = TEXT.word.private[language];   
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
                                    <span style="font-size:13px;">${TEXT.word.today_no_plans[language]}</span>
                                </article>`);
        }

        let id = "home_today_plan_expand_button";
        let title = this.view.today_plan == OPEN 
            ? '접기 '+ CImg.arrow_expand(["var(--img-sub1)"], {"transform":"rotate(180deg)", "width":"17px", "vertical-align":"middle", "margin-bottom":"2px"}) 
            : '펼치기 ' + CImg.arrow_expand(["var(--img-sub1)"], {"width":"17px", "vertical-align":"middle", "margin-bottom":"2px"});
        let style = {"float":"right", "padding":"0", "font-size":"12px", "font-weight":"500", "color":"var(--font-sub-normal)"};
        let onclick = ()=>{
            if(this.view.today_plan == OPEN){
                this.view.today_plan = CLOSE;
                this.render_content_offline();
                // $(`#${id}_target`).hide();
            }else{
                this.view.today_plan = OPEN;
                this.render_content_offline();
                // $(`#${id}_target`).show();
            }
        };
        let expand_button = CComponent.text_button (id, title, style, onclick);
        

        let section_title = `<article class="today_plan_wrapper" style="font-weight:bold;font-size:15px;letter-spacing: -0.7px;display:block;">
                                <span style="margin-right:5px;">${TEXT.word.today_plans[language]}</span> <span style="color:var(--font-highlight);font-size:17px;"> ${length-off_plan_number}</span>
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
            let reg_count = data.current_member_data[i].member_ticket_reg_count;
            if(diff_date > 7 && rem_count > 3){
                passed_number++;
                continue;
            }
            let member_id = data.current_member_data[i].member_id;
            let end_info;

            let date_limit_text = diff_date + ` ${TEXT.unit.date_text[language]} ${TEXT.word.date_left[language]}`;
            let date_info =  date_limit_text;
            if(end_date == "9999-12-31"){
                date_limit_text = TEXT.word.date_limitless[language];
                date_info = date_limit_text;
            }
            if(diff_date < 0){
                date_info = Math.abs(diff_date) + ` ${TEXT.unit.date_text[language]} ${TEXT.word.date_passed[language]}`;
            }
            let rem_info = `${TEXT.word.rem[language]} ${rem_count}${TEXT.unit.count[language]}`;

            if(reg_count >= 99999){
                rem_info = TEXT.word.count_limitless[language];
            }

            if(rem_count <= 3){
                rem_info = `<span style='color:#ff0022;'>${rem_info}</span>`;
            }
            if(diff_date <= 7){
                date_info = `<span style='color:#ff0022;'>${date_info}</span>`;
            }
            end_info = rem_info + ' / ' + date_info;
            if(rem_count <= 3 && diff_date <= 7){
                end_info = `<span style='color:#ff0022;'>${rem_info} / ${date_info}</span>`;
            }

            let id = `home_end_alert_${member_id}`;
            let title = data.current_member_data[i].member_name;
            let icon = `<img src="${data.current_member_data[i].member_profile_url}">`;
            let icon_r_visible = HIDE;
            let icon_r_text = `<span style="font-size:12px;font-weight:500;letter-spacing:-0.5px;">${end_info}</span>`;
            let style = {"font-size":"14px", "padding":"12px 0"};
            let onclick = ()=>{
                let inspect = pass_inspector.member_read();
                if(inspect.barrier == BLOCKED){
                    let message = `${inspect.limit_type}`;
                    show_error_message({title:message});
                    return false;
                }

                let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_VIEW, 100, popup_style, null, ()=>{
                    member_view_popup = new Member_view('.popup_member_view', member_id, 'member_view_popup');});
            };

            let end_alert_member = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
            let dom = `<article class="end_alert_wrapper">
                            ${end_alert_member}
                        </article>`;
            html_to_join.push(dom);
        }

        let id = "home_end_alert_expand_button";
        let title = this.view.end_alert == OPEN 
            ? TEXT.word.hide[language] +  CImg.arrow_expand(["var(--img-sub1)"], {"transform":"rotate(180deg)", "width":"17px", "vertical-align":"middle", "margin-bottom":"2px"}) 
            : TEXT.word.show[language] + CImg.arrow_expand(["var(--img-sub1)"], {"width":"17px", "vertical-align":"middle", "margin-bottom":"2px"});
        let style = {"float":"right", "padding":"0", "font-size":"12px", "font-weight":"500", "color":"var(--font-sub-normal)"};
        let onclick = ()=>{
            if(this.view.end_alert == OPEN){
                this.view.end_alert = CLOSE;
                this.render_content_offline();
                // $(`#${id}_target`).hide();
            }else{
                this.view.end_alert = OPEN;
                this.render_content_offline();
                // $(`#${id}_target`).show();
            }
        };
        let expand_button = CComponent.text_button (id, title, style, onclick);

        let section_title =  `<article class="today_plan_wrapper" style="font-weight:bold;font-size:15px;letter-spacing: -0.7px;display:block;">
                                <span style="margin-right:5px;">${TEXT.word.expiration_alert[language]}</span> 
                                <span style="color:var(--font-highlight);font-size:17px;"> ${length-passed_number}</span>
                                ${length-passed_number > 0 ? expand_button : ""}
                            </article>`;
        
        let html = section_title + `<div id="${id}_target" ${this.view.end_alert == CLOSE ? "style=display:none;" : ""}>`+ html_to_join.join("") + '</div>';
        return html;
    }

    dom_row_sales_this_month(data, data_lock){
        let html_to_join = [];

        let id = "home_sales_summary";
        let title = TEXT.word.sales_of_this_month[language];
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = `${UnitRobot.numberWithCommas(Number(data.price[0]) - Number(data.refund_price[0]))} ${TEXT.unit.money[language]} ${CImg.arrow_right(["var(--img-sub1)"], {"vertical-align":"middle"})}`;
        if(data_lock == ON){
            icon_r_text = `${CImg.lock(["var(--img-sub1)"], {"vertical-align":"middle"})} ${CImg.arrow_right(["var(--img-sub1)"], {"vertical-align":"middle"})}`;
        }
        let style = {"font-size":"15px", "font-weight":"bold"};
        let onclick = ()=>{
            let inspect = pass_inspector.statistics_read();
            if(inspect.barrier == BLOCKED){
                let message = `${inspect.limit_type}`;
                show_error_message({title:message});
                return false;
            }
            
            if(data_lock == ON){
                Setting_menu_access_func.locked_menu(()=>{
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_STATISTICS, 100, POPUP_FROM_RIGHT, null, ()=>{
                                                    statistics_popup = new Statistics('.popup_statistics');});
                });
            }else{
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_STATISTICS, 100, POPUP_FROM_RIGHT, null, ()=>{
                    statistics_popup = new Statistics('.popup_statistics');});
            }
        };
        let sales_data = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, onclick);
        let dom = `<article class="sales_wrapper">
                        ${sales_data}
                    </article>`;
        html_to_join.push(dom);
        
        let html = html_to_join.join("");
        return html;
    }

    dom_row_google_adsense(){
        let dom = Ads.row();

        let html = `<div class="contents">
                        <article class="sales_wrapper" style="padding:0">
                            ${dom}
                        </article>
                    </div>`;
        
        return pass_inspector.data.auth_ads.limit_num != 0 ? html : "";
    }

    popup_plan_view(schedule_id){
        let inspect = pass_inspector.schedule_read();
        if(inspect.barrier == BLOCKED){
            let message = `${inspect.limit_type}`;
            show_error_message({title:message});
            return false;
        }

        let user_selected_plan = {schedule_id:schedule_id, date:{year:this.current_year, month:this.current_month, date:this.current_date}};
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PLAN_VIEW, 100, popup_style, null, ()=>{
            plan_view_popup = new Plan_view('.popup_plan_view', user_selected_plan, "plan_view_popup");
        });
    }

    go_to_profile(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_TOP : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MYPAGE, 100, popup_style, null, ()=>{mypage_popup = new Mypage('.popup_mypage');});
    }

    static_component (){
        return(
            {
                home_upper_box:`   <div class="home_upper_box">
                                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                                            <div style="display:inline-block;">${this.data.user_name} </div>
                                        </div>
                                        <div class="home_right_button" onclick="${this.instance}.go_to_profile()"><img src="${this.data.user_photo}"></div>
                                    </div>
                                    `
                ,
                initial_page:`<div style="height:100%;">
                                <div id="home_display_panel"></div>
                                <div id="home_content_wrap" class="pages"></div>
                            </div>`
            }
        );
    }
}

class Home_func{
    static read(data, callback, error_callback){
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
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
                
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
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


