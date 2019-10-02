class Member_view{
    constructor(install_target, member_id, instance){
        this.target = {install: install_target, toolbox:'section_member_view_toolbox', content:'section_member_view_content'};
        this.instance = instance;
        this.member_id = member_id;
        this.form_id = 'id_member_view_form';

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
            name: null,
            user_id:null,
            phone: null,
            birth: null,
            sex: null,
            memo: null,
            email:null,

            connection:null,
            active:null,

            ticket:
                [
                    {
                        ticket_id:[],
                        member_ticket_id:null,
                        ticket_name:null,
                        ticket_effective_days:null,
                        ticket_reg_count:null,
                        ticket_rem_count:null,
                        ticket_price:null,
                        ticket_state:null,
                        start_date:null,
                        start_date_text:null,
                        end_date:null,
                        end_date_text:null,
                        lecture_id:[],
                        lecture_name:[],
                        lecture_state:[],
                        lecture_color:[],
                    }
                ]
                
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
       
        this.init();
        // this.set_initial_data();
    }

    set user_id(text){
        this.data.user_id = text;
    }

    get user_id(){
        return this.data.user_id;
    }

    set name(text){
        this.data.name = text;
        this.render_content();
    }

    get name(){
        return this.data.name;
    }

    set phone(number){
        this.data.phone = number;
        this.render_content();
    }

    get phone(){
        return this.data.phone;
    }

    set birth(data){
        this.data.birth = data.data;
        this.render_content();
    }

    get birth(){
        return this.data.birth;
    }

    set sex(data){
        this.data.sex = data;
        this.render_content();
    }

    get sex(){
        return this.data.sex;
    }

    set start_date(data){
        this.data.start_date = data.data;
        this.data.start_date_text = data.text;
        this.render_content();
    }

    get start_date(){
        return this.data.start_date;
    }

    set end_date(data){
        this.data.end_date = data.data;
        this.data.end_date_text = data.text;
        this.render_content();
    }

    get end_date(){
        return this.data.end_date;
    }


    set memo(text){
        this.data.memo = text;
        this.render_content();
    }

    get memo(){
        return this.data.memo;
    }

    set ticket(data){
        this.data.ticket_id = data.id;
        this.data.ticket_name = data.name;
        this.data.ticket_effective_days = data.effective_days;
        this.render_content();
    }

    get ticket(){
        return {id:this.data.ticket_id, name:this.data.ticket_name, effective_days: this.data.ticket_effective_days};
    }

    set reg_count(number){
        this.data.ticket_reg_count = number;
        this.render_content();
    }

    get reg_count(){
        return this.data.ticket_reg_count;
    }

    set reg_price(number){
        this.data.ticket_price = number;
        this.render_content();
    }

    get reg_price(){
        return this.data.ticket_price;
    }


    init(){
        this.render();
        this.set_initial_data();
        // func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
    }

    set_initial_data (){
        Member_func.read({"member_id": this.member_id}, (data)=>{
            this.data.user_id = data.member_user_id;
            this.data.name = data.member_name;
            this.data.phone = data.member_phone == "None" || data.member_phone == "" ? null : data.member_phone;
            this.data.birth = DateRobot.to_split(data.member_birthday_dt);
            this.data.sex = data.member_sex == "None" || data.member_sex == "" ? null : data.member_sex;
            this.data.connection = data.member_connection_check;
            this.data.active = data.member_is_active;
            this.data.email = data.member_email;


            Member_func.read_ticket_list({"member_id":this.member_id}, (data)=>{
                let ticket_list = data;
                this.data.ticket = [];
                let member_ticket_list = [];
                for(let ticket in ticket_list){
                    member_ticket_list.push(ticket_list[ticket]);
                }
                member_ticket_list.sort(function(a, b){
                    return a.member_ticket_start_date > b.member_ticket_start_date ? -1 : a.member_ticket_start_date < b.member_ticket_start_date ? 1 : 0;
                });
                for(let i=0; i<member_ticket_list.length; i++){
                    if(member_ticket_list[i].member_ticket_state_cd != 'IP'){
                        continue;
                    }
                    let ticket_rem_count_of_this_member = member_ticket_list[i].member_ticket_rem_count;
                    let ticket_reg_count_of_this_member = member_ticket_list[i].member_ticket_reg_count;
                    let ticket_reg_price_of_this_member = member_ticket_list[i].member_ticket_price;
                    let ticket_reg_date_of_this_member = member_ticket_list[i].member_ticket_start_date;
                    let ticket_end_date_of_this_member = member_ticket_list[i].member_ticket_end_date;
                    let ticket_remain_date = Math.round((new Date(ticket_end_date_of_this_member).getTime() - new Date().getTime()) / (1000*60*60*24));
                    let ticket_remain_alert_text = "";
                    if(ticket_remain_date < 0){
                        ticket_remain_alert_text = " 지남";
                        ticket_remain_date = Math.abs(ticket_remain_date);
                    }

                    // Ticket_func.read({"ticket_id": ticket_list[ticket].member_ticket_ticket_id}, (data)=>{
                        let ticket_of_member = {
                                            ticket_id:member_ticket_list[i].ticket_id,
                                            ticket_name:member_ticket_list[i].member_ticket_name,
                                            ticket_effective_days:member_ticket_list[i].ticket_effective_days,
                                            ticket_reg_count:ticket_reg_count_of_this_member,
                                            ticket_rem_count:ticket_rem_count_of_this_member,
                                            ticket_price:ticket_reg_price_of_this_member,
                                            ticket_state:member_ticket_list[i].ticket_state_cd,
                                            member_ticket_id:member_ticket_list[i].member_ticket_id,
                                            start_date:ticket_reg_date_of_this_member,
                                            start_date_text:DateRobot.to_text(ticket_reg_date_of_this_member, '', '', SHORT),
                                            end_date:ticket_end_date_of_this_member,
                                            end_date_text:ticket_remain_date+'일'+ ticket_remain_alert_text +'/ '+DateRobot.to_text(ticket_end_date_of_this_member, '', '', SHORT)+' 까지',
                                            lecture_id:member_ticket_list[i].ticket_lecture_id_list,
                                            lecture_name:member_ticket_list[i].ticket_lecture_list,
                                            lecture_state:member_ticket_list[i].ticket_lecture_state_cd_list,
                                            lecture_color:member_ticket_list[i].ticket_lecture_ing_color_cd_list,
                                        };
                        this.data.ticket.push(ticket_of_member);

                        // this.init();
                    // });
                }
                this.render();
            });
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();member_view_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_more_horizontal.png" class="obj_icon_basic" onclick="member_view_popup.upper_right_menu();"></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_member_view .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
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
        let user_id = this.dom_row_member_user_id_input();
        let phone = this.dom_row_member_phone_input();
        let birth = this.dom_row_member_birth_input();
        let sex = this.dom_row_member_sex_input();
        let ticket = this.dom_row_ticket();
        // let memo = this.dom_row_member_memo_input();

        let html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('아이디') + user_id + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('휴대폰 번호') + phone + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('생년월일') + birth + '<div class="gap" style="margin-left:42px; border-top:1px solid #f5f2f3; margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('성별') + sex +
            '</div>' +
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('진행중인 수강권') + ticket +
            '</div>';
            // '<div class="obj_input_box_full">'
            //     + CComponent.dom_tag('특이사항')  + memo +
            // '</div>';

        return html;
    }

    dom_row_toolbox(){
        let id = 'member_name_view';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '회원명';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text;
        let style = {"font-size":"20px", "font-weight":"bold", "letter-spacing":"-1px", "color":"#3d3b3b"};
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "공백, + - _ 제외 특수문자는 입력 불가";
        let required = "required";
        if(this.data.active == 'True'){
            disabled = true;
        }
        let sub_html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
            this.send_data();
        }, pattern, pattern_message, required);
        
        let html = `
        <div class="member_view_upper_box">
            <div style="display:inline-block;width:100%;">
                    ${sub_html}
            </div>
            <span style="display:none;">${title}</span>
        </div>
        `;
        return html;
    }

    dom_row_member_user_id_input(){
        let onclick;
        if(this.data.connection == CONNECTED ){
            onclick = ()=>{
                let user_option = {
                        connect:{text:"연결 해제", callback:()=>{
                            layer_popup.close_layer_popup();
                            let data = {"member_id":this.member_id, "member_auth_cd":AUTH_TYPE_DELETE};
                            Member_func.connection(data, ()=>{
                                this.set_initial_data();
                            });
                        }}
                    };
                let options_padding_top_bottom = 16;
                let button_height = 8 + 8 + 52;
                let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                    option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                });
            };
        }else if(this.data.connection == CONNECT_WAIT){
            onclick = ()=>{
                let user_option = {
                        connect:{text:"연결 요청 취소", callback:()=>{
                            layer_popup.close_layer_popup();
                            let data = {"member_id":this.member_id, "member_auth_cd":AUTH_TYPE_DELETE};
                            Member_func.connection(data, ()=>{
                                this.set_initial_data();
                            });
                        }}
                    };
                let options_padding_top_bottom = 16;
                let button_height = 8 + 8 + 52;
                let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                    option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                });
            };
        }else if(this.data.connection == UNCONNECTED){
            onclick = ()=>{
                let user_option = {
                        connect:{text:"연결 요청", callback:()=>{
                            layer_popup.close_layer_popup();
                            let data = {"member_id":this.member_id, "member_auth_cd":AUTH_TYPE_VIEW};
                            Member_func.connection(data, ()=>{
                                this.set_initial_data();
                            });
                        }}
                    };
                let options_padding_top_bottom = 16;
                let button_height = 8 + 8 + 52;
                let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                    option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                });
            };
        }
        let id = 'member_user_id_view';
        let title = this.data.user_id == null ? '회원ID' : this.data.user_id;
        let icon = '/static/common/icon/icon_member_card_black.png';
        let icon_r_visible = SHOW;
        let icon_r_text = '';
        let style = null;
        if(this.data.connection == CONNECTED){
            icon_r_text = "<span style='color:green'>연결 중</span>";
        }else if(this.data.connection == CONNECT_WAIT){
            icon_r_text = "<span style='color:orange'>연결 대기</span>";
        }else if(this.data.connection == UNCONNECTED){
            icon_r_text = "<span style='color:#fe4e65'>미연결</span>";
        }
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            onclick();
        });
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

    dom_row_ticket(){
        let ticket_length = this.data.ticket.length;
        let html_to_join = [];
        for(let i=0; i<ticket_length; i++){
            let ticket_name = this.data.ticket[i].ticket_name;
            let ticket_id =  this.data.ticket[i].ticket_id;
            let member_ticket_id =  this.data.ticket[i].member_ticket_id;
            let ticket_start_date =  this.data.ticket[i].start_date;
            let ticket_end_date =  this.data.ticket[i].end_date;
            let ticket_reg_count =  this.data.ticket[i].ticket_reg_count;
            let ticket_price =  this.data.ticket[i].ticket_price;
            if(this.data.ticket[i].ticket_state == STATE_END_PROGRESS){
                ticket_name = `<span style="color:#888888;">${this.data.ticket[i].ticket_name}</span><span style="font-size:13px;"> (비활성)</span>`;
            }
            //티켓 이름 표기 부분
            let id = `input_ticket_select_${i}`;
            let title = this.data.ticket[i].ticket_id.length == 0 ? '' : ticket_name;
            let icon = '/static/common/icon/icon_ticket_black.png';
            let icon_r_visible = SHOW;
            let icon_r_text = "";
            let style = null;
            let html_ticket_name = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_TICKET_MODIFY, 100, POPUP_FROM_RIGHT, null, ()=>{
                    let data = {"member_name":this.name, "member_ticket_id":member_ticket_id, "member_ticket_name":ticket_name, "start_date": ticket_start_date, "end_date": ticket_end_date, "reg_count":ticket_reg_count, "price":ticket_price, "status":"IP"};
                    member_ticket_modify = new Member_ticket_modify('.popup_member_ticket_modify', data, 'member_ticket_modify');
                });

                // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_SIMPLE_VIEW, 100*(258/windowHeight), POPUP_FROM_BOTTOM, {'ticket_id':ticket_id}, ()=>{
                //     ticket_simple_view_popup = new Ticket_simple_view('.popup_ticket_simple_view', ticket_id, 'ticket_simple_view_popup');
                //     //수강권 간단 정보 팝업 열기
                // });
            });

            //티켓내 수업 리스트 표기 부분
            let length = this.data.ticket[i].lecture_id.length;
            let html_to_join_lecture_list = [];
            for(let j=0; j<length; j++){
                let lecture_id = this.data.ticket[i].lecture_id[j];
                let lecture_name = this.data.ticket[i].lecture_name[j];
                let lecture_color = this.data.ticket[i].lecture_color[j];
                let icon_button_style = {"display":"block", "padding":"12px 0 12px 42px", "font-size":"13px", "height":"24px", "line-height":"24px"};
                let lecture_name_set = `<div style="display:inline-block;width:4px;height:16px;border-radius: 8px;background-color:${lecture_color};margin-right:10px;margin-top:4px;"></div>
                                        <div style="display:inline-block;vertical-align:top;">${lecture_name}</div>`;
                let html_lecture_list_info = CComponent.text_button (lecture_id, lecture_name_set, icon_button_style, ()=>{
                    // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_VIEW, 100, POPUP_FROM_RIGHT, {'lecture_id':lecture_id}, ()=>{
                    //     lecture_view_popup = new Lecture_view('.popup_lecture_view', lecture_id, 'lecture_view_popup');
                    // });
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_LECTURE_SIMPLE_VIEW, 100*(258/windowHeight), POPUP_FROM_BOTTOM, {'lecture_id':lecture_id}, ()=>{
                        lecture_simple_view_popup = new Lecture_simple_view('.popup_lecture_simple_view', lecture_id, 'lecture_simple_view_popup');
                        //수업 간단 정보 팝업 열기
                    });
                });

                html_to_join_lecture_list.push(html_lecture_list_info);
            }
            //티켓내 남은횟수, 남은 기간 표기 부분
            let icon_button_style_remain_count_info = {"display":"block", "padding":"6px 0 0 38px", "font-size":"11px", "font-weight":"500", "color":"#858282", "height":"16px"};
            let icon_button_style_remain_data_info = {"display":"block", "padding":"4px 0 12px 38px", "font-size":"11px", "font-weight":"500", "color":"#858282", "height":"16px"};
            let html_remain_info = CComponent.text_button('reg_count', `남은 횟수  <span style="font-size:11px; font-weight:bold; color:#fe4e65; margin-left:8px;">${this.data.ticket[i].ticket_rem_count}회</span>`, icon_button_style_remain_count_info, ()=>{}) +
                                    CComponent.text_button('reg_date', `남은 기간 <span style="font-size:11px; font-weight:bold; color:#fe4e65; margin-left:8px;">${this.data.ticket[i].end_date_text}</span>`, icon_button_style_remain_data_info, ()=>{});
            let html_ticket_lecture_list = `<div>${html_to_join_lecture_list.join('')}</div>`;

            html_to_join.push(html_ticket_name + html_ticket_lecture_list + html_remain_info);
        }
        let html = html_to_join.join('');

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
            
            // deactivate:{text:"비활성화", callback:()=>{
            //         show_user_confirm(`"${this.data.name}" 님을 비활성화 하시겠습니까? <br> 비활성화 탭에서 확인할 수 있습니다.`, ()=>{
            //             alert('작업중');
                        
            //         });
            //     }
            // },
            // activate:{text:"활성화", callback:()=>{
            //         show_user_confirm(`"${this.data.name}" 님을 다시 활성화 하시겠습니까?`, ()=>{
            //             alert('작업중');
            //         });
            //     }
            // },
            recontract:{text:"재등록", callback:()=>{
                    layer_popup.close_layer_popup();
                    let member_add_initial_data = {member_id: this.member_id};
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_ADD, 100, POPUP_FROM_BOTTOM, null, ()=>{
                        member_add_popup = new Member_add('.popup_member_add', member_add_initial_data, 'member_add_popup');});
                }
            },
            ticket_history:{text:"수강권 이력", callback:()=>{
                    layer_popup.close_layer_popup();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_TICKET_HISTORY, 100, POPUP_FROM_RIGHT, null, ()=>{
                        member_ticket_history = new Member_ticket_history('.popup_member_ticket_history', {member_id:this.member_id, member_name:this.name}, null);
                    });
                }
            },
            lesson_history:{text:"수업 이력", callback:()=>{
                    layer_popup.close_layer_popup();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_SCHEDULE_HISTORY, 100, POPUP_FROM_RIGHT, null, ()=>{
                        member_schedule_history = new Member_schedule_history('.popup_member_schedule_history', this.member_id, null);
                    });
                }
            },
            delete:{text:"회원 삭제", callback:()=>{
                    show_user_confirm(`"${this.data.name}" 님 정보를 완전 삭제 하시겠습니까? <br> 다시 복구할 수 없습니다.`, ()=>{
                        Member_func.delete({"member_id":this.member_id}, ()=>{
                            member.init();layer_popup.all_close_layer_popup();
                        });
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
        console.log(error_info);
        if(error_info != ''){
            show_error_message(error_info);
            return false;
        }
        else{
            return true;
        }
    }
}


class Member_simple_view{
    constructor(install_target, member_id, instance){
        this.target = {install: install_target, toolbox:'section_member_simple_view_toolbox', content:'section_member_simple_view_content', close_button:'section_member_simple_view_close_button'};
        this.instance = instance;
        this.member_id = member_id;

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
            name: null,
            phone: null,
            birth: null,
            sex: null,
            memo: null,
            email:null,

            connection:null,
            active:null,

            ticket:
                [
                    {
                        ticket_id:[],
                        ticket_name:null,
                        ticket_effective_days:null,
                        ticket_reg_count:null,
                        ticket_rem_count:null,
                        ticket_price:null,
                        ticket_state:null,
                        member_ticket_id:null,
                        start_date:null,
                        start_date_text:null,
                        end_date:null,
                        end_date_text:null,
                        lecture_id:[],
                        lecture_name:[],
                        lecture_state:[]
                    }
                ]
                
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
       
        this.init();
        this.set_initial_data();
    }

    init(){
        this.render();
    }

    set_initial_data (){
        Member_func.read({"member_id": this.member_id}, (data)=>{
            this.data.name = data.member_name;
            this.data.phone = data.member_phone;
            this.data.birth = data.member_birthday_dt;
            this.data.sex = data.member_sex;
            this.data.connection = data.member_connection_check;
            this.data.active = data.member_is_active;
            this.data.email = data.member_email;


            Member_func.read_ticket_list({"member_id":this.member_id}, (data)=>{
                let ticket_list = data;
                this.data.ticket = [];
                let member_ticket_list = [];
                for(let ticket in ticket_list){
                    member_ticket_list.push(ticket_list[ticket]);
                }
                member_ticket_list.sort(function(a, b){
                    return a.member_ticket_start_date > b.member_ticket_start_date ? -1 : a.member_ticket_start_date < b.member_ticket_start_date ? 1 : 0;
                });
                for(let i=0; i<member_ticket_list.length; i++){
                    if(member_ticket_list[i].member_ticket_state_cd != 'IP'){
                        continue;
                    }
                    let ticket_rem_count_of_this_member = member_ticket_list[i].member_ticket_rem_count;
                    let ticket_reg_count_of_this_member = member_ticket_list[i].member_ticket_reg_count;
                    let ticket_reg_price_of_this_member = member_ticket_list[i].member_ticket_price;
                    let ticket_reg_date_of_this_member = member_ticket_list[i].member_ticket_start_date;
                    let ticket_end_date_of_this_member = member_ticket_list[i].member_ticket_end_date;
                    let ticket_remain_date = Math.round((new Date(ticket_end_date_of_this_member).getTime() - new Date().getTime()) / (1000*60*60*24));
                    let ticket_remain_alert_text = "";
                    if(ticket_remain_date < 0){
                        ticket_remain_alert_text = " 지남";
                        ticket_remain_date = Math.abs(ticket_remain_date);
                    }

                    // Ticket_func.read({"ticket_id": ticket_list[ticket].member_ticket_ticket_id}, (data)=>{
                        let ticket_of_member = {
                                            ticket_id:member_ticket_list[i].ticket_id,
                                            ticket_name:member_ticket_list[i].member_ticket_name,
                                            ticket_effective_days:member_ticket_list[i].ticket_effective_days,
                                            ticket_reg_count:ticket_reg_count_of_this_member,
                                            ticket_rem_count:ticket_rem_count_of_this_member,
                                            ticket_price:ticket_reg_price_of_this_member,
                                            ticket_state:member_ticket_list[i].ticket_state_cd,
                                            start_date:ticket_reg_date_of_this_member,
                                            start_date_text:DateRobot.to_text(ticket_reg_date_of_this_member, '', '', SHORT),
                                            end_date:ticket_end_date_of_this_member,
                                            end_date_text:ticket_remain_date+'일'+ ticket_remain_alert_text +'/ '+DateRobot.to_text(ticket_end_date_of_this_member, '', '', SHORT)+' 까지',
                                            lecture_id:member_ticket_list[i].ticket_lecture_id_list,
                                            lecture_name:member_ticket_list[i].ticket_lecture_list,
                                            lecture_state:member_ticket_list[i].ticket_lecture_state_cd_list,
                                            lecture_color:member_ticket_list[i].ticket_lecture_ing_color_cd_list,
                                        };
                        this.data.ticket.push(ticket_of_member);

                        // this.init();
                    // });
                }
                this.render();
            });
        });
    }

    render(){
        let dom_toolbox = this.dom_row_toolbox();
        let dom_content = this.dom_assembly_content();
        let dom_close_button = this.dom_close_button();

        let html = `<section id="${this.target.toolbox}" class="obj_box_full" style="position:sticky;position:-webkit-sticky;top:0;">${dom_toolbox}</section>
                    <section id="${this.target.content}" style="width:100%;height:299px;overflow-y:auto;">${dom_content}</section>
                    <section id="${this.target.close_button}" class="obj_box_full" style="height:48px;">${dom_close_button}</section>`;
        
        document.querySelector(this.target.install).innerHTML = html;
    }
    
    dom_assembly_content(){
        // let name = this.dom_row_member_name_input();
        let phone = this.dom_row_member_phone_input();
        let birth = this.dom_row_member_birth_input();
        let sex = this.dom_row_member_sex_input();
        let memo = this.dom_row_member_memo_input();
        let ticket = this.dom_row_ticket();

        let html =  '<div class="obj_box_full">'+phone+birth+sex+memo+'</div>' +
                    '<div class="obj_box_full">'+ticket+ '</div>';

        // document.getElementById(this.target.content).innerHTML = html;
        return html;
    }

    dom_row_toolbox(){
        let text_button_style = {"color":"#858282", "font-size":"13px", "font-weight":"500"};
        let text_button = CComponent.text_button ("detail_user_info", "더보기", text_button_style, ()=>{
            show_user_confirm(`작업중이던 항목을 모두 닫고 회원 메뉴로 이동합니다.`, ()=>{
                layer_popup.all_close_layer_popup();
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_VIEW, 100, POPUP_FROM_RIGHT, {'member_id':this.member_id}, ()=>{
                    member_view_popup = new Member_view('.popup_member_view', this.member_id, 'member_view_popup');
                });
                sideGoPage("member");
            });
        });

        let html = `
        <div style="height:48px;line-height:48px;">
            <div style="float:left;width:auto;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                <span style="font-size:13px;font-weight:500;">${this.data.name == null ? '' : this.data.name}</span>
            </div>
            <div style="display:inline-block;float:right;width:65px;text-align:right;">
                ${text_button}
            </div>
        </div>
        `;
        return html;
    }

    dom_row_member_name_input(){
        let id = 'member_name_view';
        let title = this.data.name == null ? '회원명*' : this.data.name;
        let icon = '/static/common/icon/icon_people_black.png';
        let icon_r_text = "";
        let icon_r_visible = HIDE;
        let style = null;
        let onclick = ()=>{alert('연결 되어있음');};
        if(this.data.connection != CONNECTED){
            icon_r_visible = SHOW;
            onclick = ()=>{alert('연결 되어있지 않음');};
        }
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            onclick();
        });
        return html;
    }

    dom_row_member_phone_input(){
        let unit = '';
        let id = 'member_phone_view';
        let title =  this.data.phone == null || this.data.phone == 'None' || this.data.phone == '' ? '휴대폰 번호' : this.data.phone;
        let placeholder = '휴대폰 번호';
        let icon = '/static/common/icon/icon_member_card_black.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = true;
        let pattern = "[0-9]{10,11}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.phone = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_member_birth_input(){
        //등록하는 행을 만든다.
        let unit = '';
        let id = 'member_birth_view';
        let title = this.data.birth == null || this.data.birth == 'None' || this.data.birth == '' ? '생년월일' : this.data.birth;
        let placeholder =  '생년월일';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = true;
        let pattern = "[0-9]{4}-[0-9]{2}-[0-9]{2}";
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.phone = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_member_sex_input(){
        let id = 'member_sex_view';
        let title = this.data.sex == null || this.data.sex == 'None' || this.data.sex == '' ? '성별' : SEX_CODE[this.data.sex];
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            
        });
        return html;
    }

    dom_row_member_memo_input(){
        let id = 'member_memo_view';
        let title = this.data.memo == null ? '' : this.data.memo;
        let placeholder = '특이사항';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = true;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+ 一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{0,255}";
        let pattern_message = "+ - _ 제외 특수문자는 입력 불가";
        let required = "";
        let html = CComponent.create_input_row(id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_ticket(){
        let ticket_length = this.data.ticket.length;

        let html_to_join = [];
        for(let i=0; i<ticket_length; i++){
            let ticket_name = this.data.ticket[i].ticket_name;
            if(this.data.ticket[i].ticket_state == STATE_END_PROGRESS){
                ticket_name = `<span style="color:#888888;">${this.data.ticket[i].ticket_name}</span><span style="font-size:13px;"> (비활성)</span>`;
            }

            //티켓 이름 표기 부분
            let id = `input_ticket_select_${i}`;
            let title = this.data.ticket[i].ticket_id.length == 0 ? '' : ticket_name;
            let icon = '/static/common/icon/icon_ticket_black.png';
            let icon_r_visible = SHOW;
            let icon_r_text = "";
            let style = null;
            let html_ticket_name = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
                let ticket_id =  this.data.ticket[i].ticket_id;
                // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_VIEW, 100, POPUP_FROM_RIGHT, {'ticket_id':ticket_id}, ()=>{
                //     ticket_view_popup = new Ticket_view('.popup_ticket_view', ticket_id, 'ticket_view_popup');
                // });
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TICKET_SIMPLE_VIEW, 100*(258/windowHeight), POPUP_FROM_BOTTOM, {'ticket_id':ticket_id}, ()=>{
                    ticket_simple_view_popup = new Ticket_simple_view('.popup_ticket_simple_view', ticket_id, 'ticket_simple_view_popup');
                    //회원 간단 정보 팝업 열기
                });
            });

            
            //티켓내 남은횟수, 남은 기간 표기 부분
            let icon_button_style_remain_count_info = {"display":"block", "padding":0, "font-size":"12px", "height":"20px"};
            let icon_button_style_remain_data_info = {"display":"block", "padding":0, "font-size":"12px"};
            let html_remain_info = CComponent.icon_button('reg_count', `남은 횟수  <span style="color:#fe4e65">${this.data.ticket[i].ticket_rem_count}</span>`, NONE, icon_button_style_remain_count_info, ()=>{}) + 
                                    CComponent.icon_button('reg_date', `남은 기간 <span style="color:#fe4e65">${this.data.ticket[i].end_date_text}</span>`, NONE, icon_button_style_remain_data_info, ()=>{});

            html_to_join.push(html_ticket_name + html_remain_info);
        }
        let html = html_to_join.join('');

        return html;
    }

    dom_close_button(){
        let style = {"display":"block", "height":"48px", "line-height":"48px", "padding":"0"};
        let html = CComponent.button ("close_member_simple", "닫기", style, ()=>{
            layer_popup.close_layer_popup();
        });
        return html;
    }

}