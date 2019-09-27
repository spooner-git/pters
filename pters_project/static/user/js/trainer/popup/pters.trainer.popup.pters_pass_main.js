class Pters_pass_main{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_pters_pass_main_toolbox', content:'section_pters_pass_main_content'};

        this.data = {
            current:{
                messageArray:[""],
                buyer_email:[""],
                buyer_name:[""],
                card_name:[""],
                channel:[""],
                currency:[""],
                end_date:[""],
                fail_reason:[""],
                merchandise_type_cd:[""],
                mod_dt:[""],
                name:[""],
                pay_method:[""], //card
                payment_type_cd:[""], //PERIOD, SINGLE
                pg_provider:[""],
                price:[""],
                receipt_url:[""],
                start_date:[""],
                status:[""]
                    },
            next:{
                messageArray:[""],
                buyer_email:[""],
                buyer_name:[""],
                card_name:[""],
                channel:[""],
                currency:[""],
                end_date:[""],
                fail_reason:[""],
                merchandise_type_cd:[""],
                mod_dt:[""],
                name:[""],
                pay_method:[""],
                payment_type_cd:[""],
                pg_provider:[""],
                price:[""],
                receipt_url:[""],
                start_date:[""],
                status:[""]
            }
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        Pters_pass_main_func.read('Current', (data)=>{
            this.data.current = data;
            Pters_pass_main_func.read('Next', (data)=>{
                this.data.next = data;
                this.render();
            });
            
        });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();pters_pass_main_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_pters_pass_main .wrapper_top').style.border = 0;
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
        let html =  '<article class="obj_input_box_full">' +
                        this.dom_row_pters_pass_purchase() + 
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_row_payment_info() + 
                        this.dom_row_cancel_pass() + 
                    '</article>';

        return html;
    }


    dom_row_pters_pass_purchase(){
        let id = "pters_pass_purchase";
        let title = "PTERS 패스";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_PAY_INFO, 100, POPUP_FROM_RIGHT, null, ()=>{
                pters_pass_pay_info_popup = new Pters_pass_pay_info('.popup_pters_pass_pay_info');});
        });
        let html = row;
        return html;
    }

    dom_row_payment_info(){
        let id = "pters_pass_purchase";
        let title = "결제 정보";
        let icon = DELETE;
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style = null;
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_PAY_INFO, 100, POPUP_FROM_RIGHT, null, ()=>{
                pters_pass_pay_info_popup = new Pters_pass_pay_info('.popup_pters_pass_pay_info');});
        });
        let html = row;
        return html;
    }

    dom_row_cancel_pass(){
        let id = "pters_pass_cancel";
        let title = "해지 신청";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"color": "#ff001f", "font-weight":"normal"};
        let row = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PTERS_PASS_PAY_INFO, 100, POPUP_FROM_RIGHT, null, ()=>{
                pters_pass_pay_info_popup = new Pters_pass_pay_info('.popup_pters_pass_pay_info');});
        });
        let html = row;
        return html;
    }

    dom_button_go_to_status(){
        let id = "pters_pass_go_to_status";
        let title = "상태 <img src='/static/common/icon/icon_arrow_r_small_black.png' style='width:24px;vertical-align:middle'>";
        let style = {"font-size":"14px", "font-weight":"500", "opacity":"0.6", "letter-spacing":"-0.4px", "float":"right", "line-height":"30px"};
        let onclick = ()=>{
            let user_option = {
                    finish:{text:"종료", callback:()=>{
                        alert('종료');
                        layer_popup.close_layer_popup();
                        
                    }},
                    pause:{text:"일시정지", callback:()=>{
                        alert('일시 정지');
                        layer_popup.close_layer_popup();
                    }}
                };
            let options_padding_top_bottom = 16;
            let button_height = 8 + 8 + 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        };
        let html = CComponent.text_button (id, title, style, onclick);
        return html;
    }


    dom_row_toolbox(){
        // let title_upper = `<span style=" font-size: 12px;display:block;line-height: 5px;color: #7d7d7d;font-weight: 500;">이용중인 PTERS 패스</span>${this.dom_button_go_to_status()}`;
        let title_upper = `<span style=" font-size: 12px;display:block;line-height: 5px;color: #7d7d7d;font-weight: 500;">이용중인 PTERS 패스</span>`;
        let current_pass_name = this.data.current.name[0] == "" ? "무료 이용자" : this.data.current.name[0];
        let title = this.data.current.name.length == 0 ? "" :title_upper + current_pass_name;
        
        let current_start_date = this.data.current.start_date[0].replace(/-/gi, '.');
        let current_end_date = this.data.current.end_date[0].replace(/-/gi, '.');
        let expire_date =  current_start_date + ' - ' + current_end_date;
        let next_pay_date = this.data.next.start_date[0].replace(/-/gi, '.');
        let pay_type = PAY_TYPE_NAME[this.data.next.payment_type_cd[0]];
        let description = `<p style="font-size:13px;letter-spacing:-0.5px;font-weight:500;margin-bottom:0;">
                                <span style="color:#b8b4b4;margin-right:8px;">유효 기간</span>
                                <span style="color:#5c5859;">${expire_date}</span>
                            </p>
                            <p style="font-size:13px;letter-spacing:-0.5px;font-weight:500;margin-top:4px;">
                                <span style="color:#b8b4b4;margin-right:8px;">결제 예정</span>
                                <span style="color:#5c5859">${next_pay_date} ${pay_type}</span>
                            </p>`;
        let html = `
        <div class="pters_pass_main_upper_box" style="">
            <div style="display:inline-block;width:100%;">
                <span style="display:inline-block;width:100%;font-size:23px;font-weight:bold">
                    ${title}
                    ${description}
                </span>
                <span style="display:none">${title}</span>
            </div>
        </div>
        `;
        return html;
    }


    send_data(){
        // let data = {
        //     "setting_member_reserve_time_available":'00:00-23:59', //예약 가능 시간대
        //     "setting_member_reserve_prohibition":this.data.stop_reserve, // 예약 일시 정지
        //     "setting_member_reserve_time_duration":this.data.time_for_private_reserve.value[0], //개인 수업 예약 시간
        //     "setting_member_start_time": this.data.start_time_for_private_reserve.value[0], //개인 수업 예약 시작 시각

        //     "setting_member_reserve_date_available":this.data.available_reserve_date.value[0], //예약 가능 날짜
        //     "setting_member_reserve_time_prohibition":this.data.available_reserve_time.value[0], //예약 가능 시간
        //     "setting_member_cancel_time_prohibition":this.data.available_cancel_time.value[0], //예약 취소 가능 시간
        //     "setting_member_cancel_time":'', //??
            
        // };
        
        // pters_pass_main_func.update(data, ()=>{
        //     this.set_initial_data();
        //     show_error_message('변경 내용이 저장되었습니다.');
        //     // this.render_content();
        // });
    }

    upper_right_menu(){
        this.send_data();
    }
}

class Pters_pass_main_func{
    static update(data, callback){
        //업무 시간 설정
        $.ajax({
            url:"/trainer/update_pters_pass_main/",
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

    static read(what, callback){
        let url;
        switch(what){
            case "Current":
                url = '/payment/get_payment_info/';
            break;
            case "Next":
                url = '/payment/get_payment_schedule_info/';
            break;
            case "Pay_list":
                url = '/payment/get_payment_list/';
            break;
        }
        
        $.ajax({
            url:url,
            type:'GET',
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                data = JSON.parse(data);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_errow_message(data.messageArray[0]);
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
                console.log(data);
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


