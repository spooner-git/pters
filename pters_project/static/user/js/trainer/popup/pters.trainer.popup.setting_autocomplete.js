class Setting_autocomplete{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_setting_autocomplete_toolbox', content:'section_setting_autocomplete_content'};

        this.data = {
                plan:{
                    switch : OFF,
                    complete_type : SCHEDULE_FINISH // SCHEDULE_FINISH, SCHEDULE_ABSENCE
                },
                member:{
                    switch : OFF
                }
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Setting_autocomplete_func.read((data)=>{
            this.data.plan.switch = data.setting_schedule_auto_finish == OFF ? OFF : ON;
            this.data.plan.complete_type = data.setting_schedule_auto_finish;
            this.data.member.switch = data.setting_member_ticket_auto_finish;
            this.render_content();
        });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();setting_autocomplete_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_confirm_black.png" onclick="setting_autocomplete_popup.upper_right_menu();" class="obj_icon_prev"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_setting_autocomplete .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
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
        let row_autocomplete_plan = this.dom_row_plan_autocomplete();
        let row_autocomplete_member= this.dom_row_member_autocomplete();

        let row_autocomplete_plan_type = "";
        if(this.data.plan.switch == ON){
            row_autocomplete_plan_type = this.dom_row_plan_autocomplete_type();
        }

        let html = row_autocomplete_plan + row_autocomplete_plan_type + row_autocomplete_member;

        return html;
    }

    dom_row_toolbox(){
        let title = "자동 완료";
        let html = `
        <div class="setting_autocomplete_upper_box" style="">
            <div style="display:inline-block;width:320px;">
                <span style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
                    ${title}
                </span>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_plan_autocomplete(){
        let id = `autocomplete_plan_power`;
        let power = this.data.plan.switch;
        let style = null;
        let dayoff_setting = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.plan.switch = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("ntd", '일정 자동 완료', {"font-size":"18px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let explain_row = CComponent.text_button ('123123', '시간이 지난 일정을 자동 처리합니다.', {"font-size":"12px", "letter-spacing":"-0.6px"}, ()=>{});
        let html = `<article class="setting_autocomplete_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${dayoff_setting}</div>
                        </div>
                        ${explain_row}
                    </article>`;
        return html;
    }

    dom_row_plan_autocomplete_type(){
        let html = `<article class="setting_autocomplete_wrapper obj_input_box_full" style="border-top:1px solid #f2f2f2;border-bottom:1px solid #f2f2f2">`+
                    this.dom_row_plan_autocomplete_type_attend() + 
                    this.dom_row_plan_autocomplete_type_absence() + 
                    this.dom_row_plan_autocomplete_type_cancel() +
                    `</article>`;
        return html;
    }

    dom_row_plan_autocomplete_type_attend(){
        let complete_type = this.data.plan.complete_type;
        let id = 'checkbox_attend';
        let checked = complete_type == AUTOCOMPLETE_ATTEND ? ON : OFF;
        let style = {"display":"inline-block"};
        let checkbox = CComponent.radio_button (id, checked, style, (data)=>{
            if(data == ON){
                this.data.plan.complete_type = AUTOCOMPLETE_ATTEND;
                this.render_content();
            }
        });

        let title = CComponent.text_button ("ntd", '출석', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.7px"}, ()=>{});
        
        let html = `<div style="display:table;width:100%;height:52px;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle;text-align:right;">${checkbox}</div>
                    </div>`;
        return html;
    }

    dom_row_plan_autocomplete_type_absence(){
        let complete_type = this.data.plan.complete_type;
        let id = 'checkbox_absence';
        let checked = complete_type == AUTOCOMPLETE_ABSENCE ? ON : OFF;
        let style = {"display":"inline-block"};
        let checkbox = CComponent.radio_button (id, checked, style, (data)=>{
            if(data == ON){
                this.data.plan.complete_type = AUTOCOMPLETE_ABSENCE;
                this.render_content();
            }
        });

        let title = CComponent.text_button ("ntd", '결석 (횟수 차감됨)', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.7px"}, ()=>{});
        
        let html = `<div style="display:table;width:100%;height:52px;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle;text-align:right;">${checkbox}</div>
                    </div>`;
        return html;
    }

    dom_row_plan_autocomplete_type_cancel(){
        let complete_type = this.data.plan.complete_type;
        let id = 'checkbox_cancel';
        let checked = complete_type == AUTOCOMPLETE_CANCEL ? ON : OFF;
        let style = {"display":"inline-block"};
        let checkbox = CComponent.radio_button (id, checked, style, (data)=>{
            if(data == ON){
                this.data.plan.complete_type = AUTOCOMPLETE_CANCEL;
                this.render_content();
            }
        });

        let title = CComponent.text_button ("ntd", '취소 (횟수 차감 되지 않음)', {"font-size":"15px", "font-weight":"500", "letter-spacing":"-0.7px"}, ()=>{});
        
        let html = `<div style="display:table;width:100%;height:52px;">
                        <div style="display:table-cell;width:auto;vertical-align:middle">${title}</div>
                        <div style="display:table-cell;width:50px;vertical-align:middle;text-align:right;">${checkbox}</div>
                    </div>`;
        return html;
    }


    dom_row_member_autocomplete(){
        let id = `autocomplete_member_power`;
        let power = this.data.member.switch;
        let style = null;
        let dayoff_setting = CComponent.toggle_button (id, power, style, (data)=>{
                                this.data.member.switch = data; // ON or OFF
                                this.render_content();
                            });
        let title_row = CComponent.text_button ("ntd", '회원 자동 완료', {"font-size":"18px", "font-weight":"500", "letter-spacing":"-0.8px"}, ()=>{});
        let explain_row = CComponent.text_button ('123123', '등록시 입력한 종료일이 지나면 종료처리합니다.', {"font-size":"12px", "letter-spacing":"-0.6px"}, ()=>{});

        let html = `<article class="setting_autocomplete_wrapper obj_input_box_full">
                        <div style="display:table;width:100%;">
                            <div style="display:table-cell;width:auto;vertical-align:middle">${title_row}</div>
                            <div style="display:table-cell;width:50px;vertical-align:middle">${dayoff_setting}</div>
                        </div>
                        ${explain_row}
                    </article>`;
        return html;
    }

    art_data(start_time, end_time){
        let merged;
        if(start_time == null && end_time == null){
            merged = `00:00-23:59`;
        }else if(start_time == null && end_time != null){
            merged = `00:00-${end_time}`;
        }else if(start_time != null && end_time == null){
            merged = `${start_time}-23:59`;
        }else{
            merged = start_time + '-' + end_time;
        }

        if(this.data.GENERAL.detail_switch == OFF){
            merged = this.data.GENERAL.start_time + '-' + this.data.GENERAL.end_time;
        }

        return merged;
    }

    send_data(){
        let data = {
            "setting_schedule_auto_finish": this.data.plan.switch == OFF ? OFF : this.data.plan.complete_type,
            "setting_lecture_auto_finish":this.data.member.switch
        };

        Setting_autocomplete_func.update(data, ()=>{
            this.set_initial_data();
            show_error_message('변경 내용이 저장되었습니다.');
            // this.render_content();
        });
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Setting_autocomplete_func{
    static update(data, callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_setting_basic/",
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

    static read(callback){
        $.ajax({
            url:"/trainer/get_trainer_setting_data/",
            type:'GET',
            dataType : 'JSON',
    
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


