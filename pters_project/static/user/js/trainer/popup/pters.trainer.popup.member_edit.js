class Member_edit{
    constructor(install_target, member_id, instance){
        this.target = {install: install_target, toolbox:'section_member_edit_toolbox', content:'section_member_edit_content'};
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
        };

        //팝업의 날짜, 시간등의 입력란을 미리 외부에서 온 데이터로 채워서 보여준다.
        this.init();
        this.set_initial_data();
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
        this.render_initial();
        this.render_toolbox();
        this.render_content();
    }

    set_initial_data(){
        Member_func.read({"member_id": this.member_id}, (data)=>{
            console.log(data);
            this.data.name = data.member_name;
            this.data.phone = data.member_phone != "None" ? data.member_phone : null;
            this.data.birth = data.member_birtday_dt != "None" ? data.member_birtday_dt : null;
            this.data.sex = data.member_sex != "None" ? data.member_sex : null;
            this.data.memo = null;
            this.init();
        });
    }

    render_initial(){
        document.querySelector(this.target.install).innerHTML = this.static_component().initial_page;
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_row_toolbox();
    }
    
    render_content(){
        let name = this.dom_row_member_name_input();
        let phone = this.dom_row_member_phone_input();
        let birth = this.dom_row_member_birth_input();
        let sex = this.dom_row_member_sex_input();
        let memo = this.dom_row_member_memo_input();
        let html =  '<div class="obj_box_full">'+name+phone+birth+sex+memo+'</div>';

        document.getElementById(this.target.content).innerHTML = html;
    }

    dom_row_toolbox(){
        let html = `
        <div class="member_add_upper_box" style="padding-bottom:8px;">
            <div style="display:inline-block;width:200px;">
                <div style="display:inline-block;width:200px;">
                    <span style="font-size:20px;font-weight:bold;">회원 정보 수정</span>
                </div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_member_name_input(){
        let html = CComponent.create_input_row ('input_member_name', this.data.name == null ? '회원명*' : this.data.name, '/static/common/icon/person_black.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
        });
        return html;
    }

    dom_row_member_phone_input(){
        let html = CComponent.create_input_number_row ('input_member_phone', this.data.phone == null ? '휴대폰 번호*' : this.data.phone, '/static/common/icon/icon_smartphone.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.phone = user_input_data;
        });
        return html;
    }

    dom_row_member_birth_input(){
        //등록하는 행을 만든다.
        let birth_text = this.data.birth == null ? '생년월일' : Object.values(this.data.birth).join('.');
        let html = CComponent.create_row('input_member_birth', birth_text, '/static/common/icon/icon_cake.png', HIDE, ()=>{ 
            //행을 클릭했을때 실행할 내용
            layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/windowHeight, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{

                //data_to_send의 선택날짜가 빈값이라면 오늘로 셋팅한다.
                let year = this.data.birth == null ? 1986 : this.data.birth.year; 
                let month = this.data.birth == null ? 2 : this.data.birth.month;
                let date = this.data.birth == null ? 24 : this.data.birth.date;
                
                date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth', title:'생년월일 선택', data:{year:year, month:month, date:date}, 
                                                                                                range:{start: this.dates.current_year - 90, end: this.dates.current_year}, 
                                                                                                callback_when_set: (object)=>{ //날짜 선택 팝업에서 "확인"버튼을 눌렀을때 실행될 내용
                                                                                                    this.birth = object; 
                                                                                                    //셀렉터에서 선택된 값(object)을 this.data_to_send에 셋팅하고 rerender 한다.
                                                                                                }});
                
            });
        });
        return html;
    }

    dom_row_member_sex_input(){
        let html = CComponent.create_row ('input_member_sex', this.data.sex == null ? '성별' : this.data.sex, '/static/common/icon/person_black.png', HIDE, (input_data)=>{
            let user_option = {
                                male:{text:"남성", callback:()=>{this.sex = "M";layer_popup.close_layer_popup();}},
                                female:{text:"여성", callback:()=>{this.sex = "W";layer_popup.close_layer_popup();}}
            };
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(45+50*Object.keys(user_option).length)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                var option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
            });
        });
        return html;
    }

    dom_row_member_memo_input(){
        let html = CComponent.create_input_row ('input_member_memo', this.data.memo == null ? '특이사항' : this.data.memo, '/static/common/icon/icon_note.png', HIDE, false, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        });
        return html;
    }


    send_data(){

        let data = {
                    "member_id": this.member_id,
                    "first_name": this.data.name,
                    "name":this.data.name,
                    "phone":this.data.phone,
                    "birthday": `${this.data.birth != null ? this.data.birth.year+'-'+this.data.birth.month+'-'+this.data.birth.date : ''}`,
                    "sex":this.data.sex,
                    "contents":this.data.memo,
        };

        Member_func.update(data, ()=>{
            layer_popup.close_layer_popup();
            member_view_popup.set_initial_data();
            member.init();
        });
    }

    static_component(){
        return {
            initial_page:`<section id="${this.target.toolbox}" class="obj_box_full" style="border:0"></section>
                          <section id="${this.target.content}"></section>`
        };
    }
}