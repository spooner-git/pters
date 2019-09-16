class Member_ticket_modify{
    constructor(install_target, data, instance){
        this.target = {install: install_target, toolbox:'section_member_ticket_modify_toolbox', content:'section_member_ticket_modify_content'};
        this.instance = instance;
        this.external_data = data;
        this.form_id = 'id_member_ticket_modify_form';

        let d = new Date();
        this.dates = {
            current_year: d.getFullYear(),
            current_month: d.getMonth()+1,
            current_date: d.getDate()
        };
        this.times = {
            current_hour: TimeRobot.to_zone(d.getHours(), d.getMinutes()).hour,
            current_minute: TimeRobot.to_zone(d.getHours(), d.getMinutes()).minute,
            current_zone: TimeRobot.to_zone(d.getHours(), d.getMinutes()).zone
        };

        this.data = {
            ticket_id: null,
            start_date: null,
            end_date: null,
            reg_count: null
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
       
        this.init();
        // this.set_initial_data();
    }

    init(){
        // this.render();
        this.set_initial_data();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    set_initial_data (){
        this.data = this.external_data;
        this.render();
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();member_ticket_modify_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_more_horizontal.png" class="obj_icon_basic" onclick="member_ticket_modify_popup.upper_right_menu();"></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_member_ticket_modify .wrapper_top').style.border = 0;
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    dom_assembly_toolbox(){
        // return this.dom_row_toolbox();
        return "";
    }
    
    dom_assembly_content(){
        let user_id = this.dom_row_member_user_id_input();
        let phone = this.dom_row_member_phone_input();
        let birth = this.dom_row_member_birth_input();
        let sex = this.dom_row_member_sex_input();

        let html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('아이디') + user_id + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('휴대폰 번호') + phone + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('생년월일') + birth + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('성별') + sex +
            '</div>';

        return html;
    }

    dom_row_toolbox(){
        // let id = 'member_name_view';
        // let title = this.data.name == null ? '' : this.data.name;
        // let placeholder = '회원명';
        // let icon = DELETE;
        // let icon_r_visible = HIDE;
        // let icon_r_text;
        // let style = {"font-size":"20px", "font-weight":"bold", "letter-spacing":"-1px", "color":"#3d3b3b"};
        // let disabled = false;
        // let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        // let pattern_message = "공백, + - _ 제외 특수문자는 입력 불가";
        // let required = "required";
        // if(this.data.active == 'True'){
        //     disabled = true;
        // }
        // let sub_html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
        //     let user_input_data = input_data;
        //     this.name = user_input_data;
        //     this.send_data();
        // }, pattern, pattern_message, required);
        
        // let html = `
        // <div class="member_ticket_modify_upper_box">
        //     <div style="display:inline-block;width:100%;">
        //             ${sub_html}
        //     </div>
        // </div>
        // `;
        return html;
    }


    dom_row_member_phone_input(){
        let unit = '';
        let id = 'member_phone_view';
        let title = this.data.phone == null || this.data.phone == 'None' ? '' : this.data.phone;
        let placeholder = '휴대폰 번호';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text;
        let style = null;
        let disabled = false;
        let pattern = "[0-9]{10,11}";
        let pattern_message = "";
        let required = "";
        // if(this.data.connection != 1){
        //     disabled = true;
        // }
        if(this.data.active == 'True'){
            disabled = true;
        }
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.phone = user_input_data;
            this.send_data();
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_member_birth_input(){
        //등록하는 행을 만든다.
        let id = 'input_member_birth';
        let title = this.data.birth == null || this.data.birth == 'None' ? '생년월일' : Object.values(this.data.birth).join('.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.birth == null || this.data.birth == 'None' ? {"color":"#b8b4b4"} : null;
        let disabled = false;
        if(this.data.active == 'True'){
            disabled = true;
        }
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 1986.02.24로 셋팅한다.
                let year = this.data.birth == null ? 1986 : this.data.birth.year; 
                let month = this.data.birth == null ? 2 : this.data.birth.month;
                let date = this.data.birth == null ? 24 : this.data.birth.date;
                
                date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'생년월일', data:{year:year, month:month, date:date},
                                                                                                range:{start: this.dates.current_year - 90, end: this.dates.current_year}, 
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.birth = object; 
                                                                                                    this.send_data();
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
                
            });
        });
        return html;
    }

    dom_row_member_sex_input(){
        let id = 'input_member_sex';
        let title = this.data.sex == null ||this.data.sex == 'None' ? '성별' : SEX_CODE[this.data.sex];
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.sex == null || this.data.sex == 'None' ? {"color":"#b8b4b4"} : null;
        let disabled = false;
        if(this.data.active == 'True'){
            disabled = true;
        }
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            let user_option = {
                                male:{text:"남성", callback:()=>{this.sex = "M";this.send_data();layer_popup.close_layer_popup();}},
                                female:{text:"여성", callback:()=>{this.sex = "W";this.send_data();layer_popup.close_layer_popup();}}
            };

            let options_padding_top_bottom = 16;
            let button_height = 8 + 8 + 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });
        return html;
    }

    dom_row_member_memo_input(){
        let id = 'member_memo_view';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '특이사항';
        let icon = '/static/common/icon/icon_note_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            this.memo = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    send_data(){
        if(this.check_before_send() == false){
            return false;
        }
        let data = {
                    "member_id": this.member_id,
                    "first_name": this.data.name,
                    "phone":this.data.phone == null ? "" : this.data.phone,
                    "birthday": `${this.data.birth != null ? this.data.birth.year+'-'+this.data.birth.month+'-'+this.data.birth.date : ''}`,
                    "sex":this.data.sex == null ? "" : this.data.sex,
                    // "note":this.data.memo,
        };
        Member_func.update(data, ()=>{
            this.set_initial_data();
            member.init();
        });
    }

    upper_right_menu(){
        let user_option = {
            delete:{text:"회원 삭제", callback:()=>{
                    show_user_confirm(`"${this.data.name}" 님 정보를 완전 삭제 하시겠습니까? <br> 다시 복구할 수 없습니다.`, ()=>{
                        Member_func.delete({"member_id":this.member_id}, ()=>{
                            member.init();layer_popup.all_close_layer_popup();
                        });
                    });
                }
            },
            ticket_history:{text:"수강권 이력", callback:()=>{
                    layer_popup.close_layer_popup();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_TICKET_HISTORY, 100, POPUP_FROM_RIGHT, null, ()=>{
                        member_ticket_history = new Member_ticket_history('.popup_member_ticket_history', this.member_id, null);
                    });
                }
            },
            lesson_history:{text:"수업 이력", callback:()=>{
                    layer_popup.close_layer_popup();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_SCHEDULE_HISTORY, 100, POPUP_FROM_RIGHT, null, ()=>{
                        member_schedule_history = new Member_schedule_history('.popup_member_schedule_history', this.member_id, null);
                    });
                }
            }
        };
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    check_before_send(){

        let forms = document.getElementById(`${this.form_id}`);
        update_check_registration_form(forms);
        let error_info = check_registration_form(forms);
        if(error_info != ''){
            show_error_message(error_info);
            return false;
        }
        else{
            return true;
        }
    }
}