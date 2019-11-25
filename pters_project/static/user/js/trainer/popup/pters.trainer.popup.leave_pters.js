class Leave_pters{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_leave_pters_toolbox', content:'section_leave_pters_content'};

        this.data = {
            cancel_type:null,
            cancel_reason:""
        };

        this.survey_checkbox_data = [
            "이용이 불편해서",
            "장애가 많아서",
            "기능이 부족해서",
            "사용 빈도가 낮아서",
            "이용 요금이 비싸서",
            "타 서비스로 이전",
            "고객 응대 및 지원이 좋지 않아서",
            "기타 사유"
        ];

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();leave_pters_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_leave_pters .wrapper_top').style.border = 0;
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
        let cancel_reason = "";
        if(this.data.cancel_type == 7){
            cancel_reason = this.dom_row_cancel_reason_textarea();
        }
        let html =  '<article class="obj_input_box_full" style="border-bottom:var(--border-article);">' +
                        this.dom_row_cancel_caution() + 
                    '</article>' +
                    '<article class="obj_input_box_full">' +
                        this.dom_assembly_sub_content() +
                        cancel_reason + 
                        this.dom_row_pters_pass_cancel_request_button() +
                    '</article>';

        return html;
    }

    dom_row_cancel_caution(){
        let html = `<div style="font-size:13px;color:var(--font-main);">
                        <p style="margin:0">탈퇴 시 사용한 모든 데이터가 삭제되며, 복구가 불가능합니다.</p>
                    </div>`;
        return html;
    }
    
    dom_assembly_sub_content(){
        let length =this.survey_checkbox_data.length;
        let html_to_join = [];
        for(let i=0; i<length; i++){
            let checkbox_number = i;
            let cancel_type_text = this.survey_checkbox_data[i];
            let html = this.dom_row_cancel_type_checkbox(checkbox_number, cancel_type_text);

            html_to_join.push(html);
        }
        return html_to_join.join("");
    }

    dom_row_cancel_type_checkbox(checkbox_number, cancel_type_text){
        let id = `pters_pass_agreement_checkbox_${checkbox_number}`;
        let checked = this.data.cancel_type != checkbox_number ? OFF : ON;
        let style = {"display":"inline-block", "margin-right":"8px", "vertical-align":"middle"};
        let onclick = ()=>{
            
        };
        let html_checkbox = CComponent.radio_button (id, checked, style, onclick);
        

        let id2 = `pters_pass_agreement_check_${checkbox_number}`;
        let text = `<span style="font-size:14px;font-weight:bold;line-height:30px;">${cancel_type_text}</span>`;
        let title2 = html_checkbox + text;
        let style2 = null;
        let onclick2 = ()=>{
            this.data.cancel_type == checkbox_number ?  this.data.cancel_type = null : this.data.cancel_type = checkbox_number;
            this.render_content();
        };
        let html_assembly = CComponent.text_button (id2, title2, style2, onclick2);


        let html = `<div style="height:30px;line-height:30px;margin:20px 0">` + html_assembly + `</div>`;
        return html;
    }

    dom_row_cancel_reason_textarea(){
        let id = "cancel_reason_textarea";
        let title = "";
        let placeholder = "탈퇴 신청 사유를 입력해주세요.";
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"margin-bottom":"20px", "border":"var(--border-article-dark)", "height":"100px"};
        let onfocusout = (input_data)=>{
            this.data.cancel_reason = input_data;
        };
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_:.,!@#\\s\\n 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ : ! @ # 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_textarea_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, onfocusout, pattern, pattern_message, required);
        return html;
    }


    dom_row_pters_pass_cancel_request_button(){
        let id = "pters_pass_cancel_request_button";
        let title = "탈퇴 신청";
        let style = this.data.cancel_type == null 
            ? {"height":"40px", "line-height":"40px", "padding":"0", "font-size":"14px", "font-weight":"500", "background-color":"var(--bg-light)"} 
            : {"height":"40px", "line-height":"40px", "padding":"0", "font-size":"14px", "font-weight":"500", "background-color":"var(--bg-highlight)", "color":"var(--font-invisible)"};
        let onclick = ()=>{
            if(this.data.cancel_type == null){
                show_error_message("사유를 선택해주세요.");
            }else{
                this.event_excute();
            }
        };
        let html_button = CComponent.button (id, title, style, onclick);
        return html_button;
    }

    event_excute(){
        this.send_data();
    }



    dom_row_toolbox(){
        let title = `회원 탈퇴`;
        let description = ``;
        let html = `
        <div class="leave_pters_upper_box" style="">
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
        let data = {"out_type":this.survey_checkbox_data[this.data.cancel_type], "out_reason":this.data.cancel_reason};
        Leave_pters_func.update(data, ()=>{
            location.href = '/login/logout/';
        });
    }

    upper_right_menu(){
        this.send_data();
    }
}


class Leave_pters_func{
    static update(data, callback){
        $.ajax({
            url:"/login/out_member/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message(data.messageArray[0]);
                        return false;
                    }
                }
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



