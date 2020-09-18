class Trainer_add{
    constructor(install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_trainer_add_toolbox', content:'section_trainer_add_content'};
        this.data_sending_now = false;
        this.instance = instance;
        this.data_from_external = data_from_external;
        this.form_id = 'id_trainer_add_form';
        //data_from_external이 null이면 신규강사등록, trainer_id 값이 들어오면 재등록

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
                trainer_id:null, //재등록시에만 사용하는 값
                name: null,
                phone: null,
                birth: null,
                sex: null,
                trainer_auth:{},
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
        this.set_initial_data(this.data_from_external);
        this.init();
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

    init(){
        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    set_initial_data(data){
        if(data == null){
            return null;
        }

        // Trainer_func.read(data, (received)=>{
            this.data.name = data.trainer_name;
            // alert(received.trainer_name)
            this.data.trainer_id = data.trainer_id;
            // this.data.phone = received.trainer_phone == "None" ? null : received.trainer_phone;
            // this.data.birth = received.trainer_birthday_dt == "None" ? null : DateRobot.to_split(received.trainer_birthday_dt);
            // this.data.sex = received.trainer_sex == "None" ? null :  received.trainer_sex;
            this.init();
        // });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();trainer_add_popup.clear();">${CImg.x()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="trainer_add_popup.send_data()"><span style="color:var(--font-highlight);font-weight: 500;">등록</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_trainer_add .wrapper_top').style.border = 0;
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
        let name = this.dom_row_trainer_name_input();
        let phone = this.dom_row_trainer_phone_input();
        let birth = this.dom_row_trainer_birth_input();
        let sex = this.dom_row_trainer_sex_input();
        let trainer_auth = this.dom_row_trainer_auth();
        // let trainer_auth_list = this.dom_row_trainer_auth_list();
        let html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('강사명', null, true) + name + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('휴대폰 번호') + phone + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('생년월일') + birth + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                + CComponent.dom_tag('성별') + sex + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'
                +'</div>' +
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('권한', null, true) + trainer_auth + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'+
            '</div>';

        if(this.data_from_external != null){ // 재등록
            html =
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('강사명') + name +
            '</div>' +
            '<div class="obj_input_box_full">'
                + CComponent.dom_tag('권한', null, true) + trainer_auth + '<div class="gap" style="margin-left:42px; border-top:var(--border-article); margin-top:4px; margin-bottom:4px;"></div>'+
            '</div>';
        }

        return html;
    }

    dom_row_toolbox(){
        let title = this.data_from_external == null ? '새로운 강사' : '등록';
        let html = `<div class="trainer_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                        <div style="display:table-cell;width:200px;text-align:right; font-size:13px;" onclick="trainer_add_popup.popup_device_contacts_list();">
                            주소록
                        </div>
                    </div>`;
        if(this.data_from_external != null){
            html = `<div class="trainer_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                    </div>`;
        }
        if(device_info != 'app'){
            html = `<div class="trainer_add_upper_box" style="display:table;">
                        <div style="display:table-cell;width:200px;">
                            <span style="font-size:20px;font-weight:bold; letter-spacing: -0.9px; color: var(--font-main);">
                                ${title}
                            </span>
                        </div>
                    </div>
                    `;
        }
        return html;
    }

    dom_row_trainer_name_input(){
        let id = 'input_trainer_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '강사명';
        let icon = CImg.members();
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = this.data_from_external == null ? false : true;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\-_+.,@一-龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = ". , + - _ @ 제외 특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            this.name = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_trainer_phone_input(){
        let unit = '';
        let id = 'input_trainer_phone';
        let title = this.data.phone == null ? '' : this.data.phone;
        let placeholder = '휴대폰 번호';
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let input_disabled = this.data_from_external == null ? false : true;
        let pattern = "[0-9]{10,11}";
        if(this.data_from_external != null){ //재등록일 경우, 전화번호 일부값이 ***로 넘어오기때문에 패턴에 추가
            pattern = "[0-9*]{10,11}";
        }
        let pattern_message = "";
        let required = "";
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, input_disabled, (input_data)=>{
            this.phone = input_data;
        }, pattern, pattern_message, required);
        return html;
    }

    dom_row_trainer_birth_input(){
        //등록하는 행을 만든다.
        let id = 'input_trainer_birth';
        let title = this.data.birth == null ? '생년월일' : Object.values(this.data.birth).join('.');
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.birth == null ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            //행을 클릭했을때 실행할 내용
            if(this.data_from_external != null){ //재등록
                show_error_message({title:"재등록 화면에서는 기본정보를 수정할 수 없습니다."});
                return false;
            }

            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/root_content_height, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.birth == null ? 1986 : this.data.birth.year; 
                let month = this.data.birth == null ? 2 : this.data.birth.month;
                let date = this.data.birth == null ? 24 : this.data.birth.date;
                
                date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'생년월일', data:{year:year, month:month, date:date},
                                                                                                range:{start: this.dates.current_year - 90, end: this.dates.current_year}, 
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.birth = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
                
            });
        });
        return html;
    }

    dom_row_trainer_sex_input(){
        let id = 'input_trainer_sex';
        let title = '성별';
        if(this.data.sex != null){
            if(this.data.sex=='M'){
                title = "남성";
            }
            else{
                title = "여성";
            }
        }
        let icon = NONE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = this.data.sex == null ? {"color":"var(--font-inactive)"} : null;
        let html = CComponent.create_row (id, title, icon, icon_r_visible, icon_r_text, style, ()=>{
            if(this.data_from_external != null){
                show_error_message({title:"재등록 화면에서는 기본정보를 수정할 수 없습니다."});
                return false;
            }

            let user_option = {
                                male:{text:"남성", callback:()=>{this.sex = "M";layer_popup.close_layer_popup();}},
                                female:{text:"여성", callback:()=>{this.sex = "W";layer_popup.close_layer_popup();}}
            };
            let options_padding_top_bottom = 16;
            // let button_height = 8 + 8 + 52;
            let button_height = 52;
            let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
            let root_content_height = $root_content.height();
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });
        return html;
    }

    dom_row_trainer_auth(){
        let id = 'input_trainer_auth';
        let title = '허용 권한';
        let icon = CImg.ticket();
        let icon_r_visible = SHOW;
        let icon_r_text = "";
        let style ={"color":"var(--font-inactive)", "height":"auto"};
        if(Object.keys(this.data.trainer_auth).length > 0) {
            title = this.dom_row_trainer_auth_list();
        }
        let html = CComponent.create_row(id, title, icon, icon_r_visible, icon_r_text, style, ()=>{ 
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TRAINER_AUTH, 100, popup_style, null, ()=>{
                trainer_auth_popup = new Trainer_auth('.popup_trainer_auth',
                    {"title":"허용 권한 선택", "trainer_auth":this.data.trainer_auth}, (set_data)=>{
                    this.data.trainer_auth = set_data;
                    this.render_content();
                });
            });
        });
        return html;
    }

    dom_row_trainer_auth_list(){
        let html = "";
        if(Object.keys(this.data.trainer_auth).length > 0) {
            let auth_plan_create = this.data.trainer_auth.auth_plan_create == 1 ? "등록" : null;
            let auth_plan_read = this.data.trainer_auth.auth_plan_read == 1 ? "조회" :  null;
            let auth_plan_update = this.data.trainer_auth.auth_plan_update == 1 ? "수정" :  null;
            let auth_plan_delete = this.data.trainer_auth.auth_plan_delete == 1 ? "삭제" :  null;

            let auth_member_create = this.data.trainer_auth.auth_member_create == 1 ? "등록" :  null;
            let auth_member_read = this.data.trainer_auth.auth_member_read == 1 ? "조회" :  null;
            let auth_member_update = this.data.trainer_auth.auth_member_update == 1 ? "수정" :  null;
            let auth_member_delete = this.data.trainer_auth.auth_member_delete == 1 ? "삭제" :  null;

            let auth_lecture_create = this.data.trainer_auth.auth_group_create == 1 ? "등록" :  null;
            let auth_lecture_read = this.data.trainer_auth.auth_group_read == 1 ? "조회" :  null;
            let auth_lecture_update = this.data.trainer_auth.auth_group_update == 1 ? "수정" :  null;
            let auth_lecture_delete = this.data.trainer_auth.auth_group_delete == 1 ? "삭제" :  null;

            let auth_ticket_create = this.data.trainer_auth.auth_package_create == 1 ? "등록" :  null;
            let auth_ticket_read = this.data.trainer_auth.auth_package_read == 1 ? "조회" :  null;
            let auth_ticket_update = this.data.trainer_auth.auth_package_update == 1 ? "수정" :  null;
            let auth_ticket_delete = this.data.trainer_auth.auth_package_delete == 1 ? "삭제" :  null;

            let auth_trainer_create = this.data.trainer_auth.auth_trainer_create == 1 ? "등록" :  null;
            let auth_trainer_read = this.data.trainer_auth.auth_trainer_read == 1 ? "조회" :  null;
            let auth_trainer_update = this.data.trainer_auth.auth_trainer_update == 1 ? "수정" :  null;
            let auth_trainer_delete = this.data.trainer_auth.auth_trainer_delete == 1 ? "삭제" :  null;

            let auth_notice_create = this.data.trainer_auth.auth_notice_create == 1 ? "등록" :  null;
            let auth_notice_read = this.data.trainer_auth.auth_notice_read == 1 ? "조회" :  null;
            let auth_notice_update = this.data.trainer_auth.auth_notice_update == 1 ? "수정" :  null;
            let auth_notice_delete = this.data.trainer_auth.auth_notice_delete == 1 ? "삭제" :  null;

            let auth_statistics_read = this.data.trainer_auth.auth_analytics_read == 1 ? "조회" :  null;

            let auth_setting_read = this.data.trainer_auth.auth_setting_read == 1 ? "조회" :  null;
            let auth_setting_update = this.data.trainer_auth.auth_setting_update == 1 ? "수정" :  null;

            let schedule_auth = [auth_plan_create, auth_plan_read, auth_plan_update, auth_plan_delete].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
            let member_auth = [auth_member_create, auth_member_read, auth_member_update, auth_member_delete].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
            let lecture_auth = [auth_lecture_create, auth_lecture_read, auth_lecture_update, auth_lecture_delete].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
            let ticket_auth = [auth_ticket_create, auth_ticket_read, auth_ticket_update, auth_ticket_delete].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
            let trainer_auth = [auth_trainer_create, auth_trainer_read, auth_trainer_update, auth_trainer_delete].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
            let notice_auth = [auth_notice_create, auth_notice_read, auth_notice_update, auth_notice_delete].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
            let statistics_auth = [auth_statistics_read].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
            let setting_auth = [auth_setting_read, auth_setting_update].filter((el)=>{ if(el == null){return false;} return true; }).map((el)=>{return el;});
            let auth_schedule = `<div class="trainer_auth">
                                    <div class="auth_title">일정</div>
                                    <div class="auth_setting">
                                        ${schedule_auth.length == 0 ? "권한 없음" : schedule_auth.join("/")}
                                    </div>
                                </div>`;
            let auth_member = `<div class="trainer_auth">
                                    <div class="auth_title">회원</div>
                                    <div class="auth_setting">
                                        ${member_auth.length == 0 ? "권한 없음" : member_auth.join("/")}
                                    </div>
                                </div>`;
            let auth_lecture = `<div class="trainer_auth">
                                    <div class="auth_title">수업</div>
                                    <div class="auth_setting">
                                        ${lecture_auth.length == 0 ? "권한 없음" : lecture_auth.join("/")}
                                    </div>
                                </div>`;
            let auth_ticket = `<div class="trainer_auth">
                                    <div class="auth_title">수강권</div>
                                    <div class="auth_setting">
                                        ${ticket_auth.length == 0 ? "권한 없음" : ticket_auth.join("/")}
                                    </div>
                                </div>`;
            let auth_trainer = `<div class="trainer_auth">
                                    <div class="auth_title">강사</div>
                                    <div class="auth_setting">
                                        ${trainer_auth.length == 0 ? "권한 없음" : trainer_auth.join("/")}
                                    </div>
                                </div>`;
            let auth_notice= `<div class="trainer_auth">
                                    <div class="auth_title">공지사항</div>
                                    <div class="auth_setting">
                                        ${notice_auth.length == 0 ? "권한 없음" : notice_auth.join("/")}
                                    </div>
                                </div>`;
            let auth_statistics = `<div class="trainer_auth">
                                    <div class="auth_title">통계</div>
                                    <div class="auth_setting">
                                        ${statistics_auth.length == 0 ? "권한 없음" : statistics_auth.join("/")}
                                    </div>
                                </div>`;
            let auth_setting = `<div class="trainer_auth">
                                    <div class="auth_title">설정</div>
                                    <div class="auth_setting">
                                        ${setting_auth.length == 0 ? "권한 없음" : setting_auth.join("/")}
                                    </div>
                                </div>`;

            html = `<article class="obj_input_box_full" id="trainer_auth_row" style="border-top:0px;">
                        <div class="trainer_auth_wrapper">
                            ${auth_schedule == null ? "" : auth_schedule}
                            ${auth_member == null ? "" : auth_member}
                            ${auth_lecture == null ? "" : auth_lecture}
                            ${auth_ticket == null ? "" : auth_ticket}
                            ${auth_trainer == null ? "" : auth_trainer}
                            ${auth_notice == null ? "" : auth_notice}
                            ${auth_statistics == null ? "" : auth_statistics}
                            ${auth_setting == null ? "" : auth_setting}
                        </div>                 
                    </article>`;
        }
        return html;
    }

    switch_type(){
        switch(this.list_type){
            case "lesson":
                this.init("off");
            break;

            case "off":
                this.init("lesson");
            break;
        }
    }

    send_data(){
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }
        if(Object.keys(this.data.trainer_auth).length == 0){
            show_error_message({title:"허용 권한을 선택해주세요."});
            return false;
        }

        let recontract = this.data_from_external == null ? OFF : ON;
        let inspect = pass_inspector.trainer();
        if(inspect.barrier == BLOCKED){
            this.data_sending_now = false;
            let message = {
                title:'강사 등록을 완료하지 못했습니다.',
                comment:`[${inspect.limit_type}] 이용자께서는 강사을 최대 ${inspect.limit_num}명까지 등록하실 수 있습니다.
                        <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까?</p>`
            };
            show_user_confirm (message, ()=>{
                layer_popup.all_close_layer_popup();
                sideGoPopup("pters_pass_main");
            });

            return false;
        }

        if(this.check_before_send() == false){
            this.data_sending_now = false;
            return false;
        }

        let data_for_new = {
                    "trainer_id":this.data.trainer_id,
                    "first_name": this.data.name,
                    "name":this.data.name,
                    "phone":this.data.phone,
                    "birthday": `${this.data.birth != null ? this.data.birth.year+'-'+this.data.birth.month+'-'+this.data.birth.date : ''}`,
                    "sex":this.data.sex,
                    "auth_cd": AUTH_TYPE_VIEW,
                    "auth_plan_create":this.data.trainer_auth.auth_plan_create,
                    "auth_plan_read":this.data.trainer_auth.auth_plan_read,
                    "auth_plan_update":this.data.trainer_auth.auth_plan_update,
                    "auth_plan_delete":this.data.trainer_auth.auth_plan_delete,

                    "auth_member_create":this.data.trainer_auth.auth_member_create,
                    "auth_member_read":this.data.trainer_auth.auth_member_read,
                    "auth_member_update":this.data.trainer_auth.auth_member_update,
                    "auth_member_delete":this.data.trainer_auth.auth_member_delete,

                    "auth_group_create":this.data.trainer_auth.auth_group_create,
                    "auth_group_read":this.data.trainer_auth.auth_group_read,
                    "auth_group_update":this.data.trainer_auth.auth_group_update,
                    "auth_group_delete":this.data.trainer_auth.auth_group_delete,

                    "auth_package_create":this.data.trainer_auth.auth_package_create,
                    "auth_package_read":this.data.trainer_auth.auth_package_read,
                    "auth_package_update":this.data.trainer_auth.auth_package_update,
                    "auth_package_delete":this.data.trainer_auth.auth_package_delete,

                    "auth_trainer_create":this.data.trainer_auth.auth_trainer_create,
                    "auth_trainer_read":this.data.trainer_auth.auth_trainer_read,
                    "auth_trainer_update":this.data.trainer_auth.auth_trainer_update,
                    "auth_trainer_delete":this.data.trainer_auth.auth_trainer_delete,

                    "auth_shop_create":this.data.trainer_auth.auth_shop_create,
                    "auth_shop_read":this.data.trainer_auth.auth_shop_read,
                    "auth_shop_update":this.data.trainer_auth.auth_shop_update,
                    "auth_shop_delete":this.data.trainer_auth.auth_shop_delete,

                    "auth_notice_create":this.data.trainer_auth.auth_notice_create,
                    "auth_notice_read":this.data.trainer_auth.auth_notice_read,
                    "auth_notice_update":this.data.trainer_auth.auth_notice_update,
                    "auth_notice_delete":this.data.trainer_auth.auth_notice_delete,

                    "auth_analytics_read":this.data.trainer_auth.auth_analytics_read,

                    "auth_setting_read":this.data.trainer_auth.auth_setting_read,
                    "auth_setting_update":this.data.trainer_auth.auth_setting_update,
        };

        let data_for_re = {
            "trainer_id":this.data.trainer_id,
            "auth_cd": AUTH_TYPE_WAIT,
            "auth_plan_create":this.data.trainer_auth.auth_plan_create,
            "auth_plan_read":this.data.trainer_auth.auth_plan_read,
            "auth_plan_update":this.data.trainer_auth.auth_plan_update,
            "auth_plan_delete":this.data.trainer_auth.auth_plan_delete,

            "auth_member_create":this.data.trainer_auth.auth_member_create,
            "auth_member_read":this.data.trainer_auth.auth_member_read,
            "auth_member_update":this.data.trainer_auth.auth_member_update,
            "auth_member_delete":this.data.trainer_auth.auth_member_delete,

            "auth_group_create":this.data.trainer_auth.auth_group_create,
            "auth_group_read":this.data.trainer_auth.auth_group_read,
            "auth_group_update":this.data.trainer_auth.auth_group_update,
            "auth_group_delete":this.data.trainer_auth.auth_group_delete,

            "auth_package_create":this.data.trainer_auth.auth_package_create,
            "auth_package_read":this.data.trainer_auth.auth_package_read,
            "auth_package_update":this.data.trainer_auth.auth_package_update,
            "auth_package_delete":this.data.trainer_auth.auth_package_delete,

            "auth_trainer_create":this.data.trainer_auth.auth_trainer_create,
            "auth_trainer_read":this.data.trainer_auth.auth_trainer_read,
            "auth_trainer_update":this.data.trainer_auth.auth_trainer_update,
            "auth_trainer_delete":this.data.trainer_auth.auth_trainer_delete,

            "auth_notice_create":this.data.trainer_auth.auth_notice_create,
            "auth_notice_read":this.data.trainer_auth.auth_notice_read,
            "auth_notice_update":this.data.trainer_auth.auth_notice_update,
            "auth_notice_delete":this.data.trainer_auth.auth_notice_delete,

            "auth_analytics_read":this.data.trainer_auth.auth_analytics_read,

            "auth_setting_read":this.data.trainer_auth.auth_setting_read,
            "auth_setting_update":this.data.trainer_auth.auth_setting_update,
        };

        if(this.data_from_external == null){ //신규 강사 등록
            Trainer_func.create_pre(data_for_new, (received)=>{
                data_for_new.trainer_id = received.user_db_id[0];
                Trainer_func.create(data_for_new, ()=>{
                    this.data_sending_now = false;
                    try{
                        current_page.init();
                    }catch(e){}
                }, ()=>{this.data_sending_now = false;});
            }, ()=>{this.data_sending_now = false;});
        }else{ // 재등록
            Trainer_func.create(data_for_re, ()=>{
                // trainer_ticket_history.init();
                this.data_sending_now = false;
                try{
                    trainer_view_popup.set_initial_data();
                }catch(e){
                    console.log(e);
                }
                try{
                    current_page.init();
                }catch(e){
                    console.log(e);
                }
            }, ()=>{this.data_sending_now = false;});
        }

        layer_popup.close_layer_popup();
    }

    check_before_send(){
        let forms = document.getElementById(`${this.form_id}`);
        update_check_registration_form(forms);

        let error_info = check_registration_form(forms);

        if(error_info != ''){
            show_error_message({title:error_info});
            return false;
        }
        else{
            return true;
        }
    }

    popup_device_contacts_list(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_TRAINER_CONTACTS_SELECT, 100, popup_style, {'trainer_id':null}, ()=>{
            trainer_contacts_select = new MemberContactsSelector('#wrapper_box_trainer_contacts_select', this, '주소록', (set_data)=>{
                this.trainer = set_data;
                this.data.trainer_id = set_data.trainer_id;
                this.data.phone = set_data.phone;
                this.data.name = set_data.name;
                this.render_content();
            });
        });
    }
}