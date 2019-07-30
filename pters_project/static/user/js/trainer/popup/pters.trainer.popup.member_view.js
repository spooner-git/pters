class Member_view{
    constructor(install_target, member_id, instance){
        this.target = {install: install_target, toolbox:'section_member_view_toolbox', content:'section_member_view_content'};
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
                        ticket_price:null,
                        start_date:null,
                        start_date_text:null,
                        end_date:null,
                        end_date_text:null,
                        lecture_id:[],
                        lecture_name:[],
                        lecture_state:[],
                    }
                ]
                
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
                for(let ticket in ticket_list){
                    let ticket_reg_count_of_this_member = ticket_list[ticket].member_ticket_reg_count;
                    let ticket_reg_price_of_this_member = ticket_list[ticket].member_ticket_price;
                    let ticket_reg_date_of_this_member = ticket_list[ticket].member_ticket_start_date;
                    let ticket_end_date_of_this_member = ticket_list[ticket].member_ticket_end_date;
                    let ticket_remain_date = Math.round((new Date(ticket_end_date_of_this_member).getTime() - new Date().getTime()) / (1000*60*60*24));
                    let ticket_remain_alert_text = "";
                    if(ticket_remain_date < 0){
                        ticket_remain_alert_text = " 지남";
                        ticket_remain_date = Math.abs(ticket_remain_date);
                    }

                    Ticket_func.read({"ticket_id": ticket_list[ticket].member_ticket_ticket_id}, (data)=>{
                        let ticket_of_member = {
                                            ticket_id:data.ticket_info.ticket_id,
                                            ticket_name:data.ticket_info.ticket_name,
                                            ticket_effective_days:data.ticket_info.ticket_effective_days,
                                            ticket_reg_count:ticket_reg_count_of_this_member,
                                            ticket_price:ticket_reg_price_of_this_member,
                                            start_date:ticket_reg_date_of_this_member,
                                            start_date_text:DateRobot.to_text(ticket_reg_date_of_this_member),
                                            end_date:ticket_end_date_of_this_member,
                                            end_date_text:ticket_remain_date+'일'+ ticket_remain_alert_text +'/ '+DateRobot.to_text(ticket_end_date_of_this_member)+' 까지',
                                            lecture_id:data.ticket_info.ticket_lecture_id_list,
                                            lecture_name:data.ticket_info.ticket_lecture_list,
                                            lecture_state:data.ticket_info.ticket_lecture_state_cd_list,
                                        }
                        this.data.ticket.push(ticket_of_member);

                        this.init();
                    });
                }
            });
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
        let ticket = this.dom_row_ticket();

        let html =  '<div class="obj_box_full">'+name+phone+birth+sex+memo+'</div>' + 
                    '<div class="obj_box_full">'+ticket+ '</div>';

        document.getElementById(this.target.content).innerHTML = html;
    }

    dom_row_toolbox(){
        let html = `
        <div class="member_add_upper_box" style="padding-bottom:8px;">
            <div style="display:inline-block;width:200px;">
                <div style="display:inline-block;width:200px;">
                    <span style="font-size:20px;font-weight:bold;">${this.data.name == null ? '' : this.data.name}</span>
                </div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_member_name_input(){
        let icon_r_visible = HIDE;
        let onclick = ()=>{alert('연결 되어있음');};
        if(this.data.connection != 1){
            icon_r_visible = SHOW;
            onclick = ()=>{alert('연결 되어있지 않음');};
        }
        let html = CComponent.create_row ('member_name', this.data.name == null ? '회원명*' : this.data.name, '/static/common/icon/person_black.png', SHOW, ()=>{
            onclick();
        });
        return html;
    }

    dom_row_member_phone_input(){
        let html = CComponent.create_input_number_row ('member_phone', this.data.phone == null ? '휴대폰 번호*' : this.data.phone, '/static/common/icon/icon_smartphone.png', HIDE, true, (input_data)=>{
            let user_input_data = input_data;
            this.phone = user_input_data;
        });
        return html;
    }

    dom_row_member_birth_input(){
        //등록하는 행을 만든다.
        let html = CComponent.create_input_number_row ('member_birth', this.data.birth == null ? '생년월일' : this.data.phone, '/static/common/icon/icon_cake.png', HIDE, true, (input_data)=>{
            let user_input_data = input_data;
            this.phone = user_input_data;
        });
        return html;
    }

    dom_row_member_sex_input(){
        let html = CComponent.create_row ('input_member_sex', this.data.sex == null ? '성별' : this.data.sex, '/static/common/icon/person_black.png', HIDE, ()=>{
            
        });
        return html;
    }

    dom_row_member_memo_input(){
        let html = CComponent.create_input_row ('input_member_memo', this.data.memo == null ? '특이사항' : this.data.memo, '/static/common/icon/icon_note.png', HIDE, true, (input_data)=>{
            let user_input_data = input_data;
            this.memo = user_input_data;
        });
        return html;
    }


    dom_row_ticket(){
        let ticket_length = this.data.ticket.length;

        let html_to_join = [];
        for(let i=0; i<ticket_length; i++){
            console.log(this.data.ticket[i].ticket_id)

            //티켓 이름 표기 부분
            let ticket_text = this.data.ticket[i].ticket_id.length == 0 ? '수강권*' : this.data.ticket[i].ticket_name;
            let html_ticket_name = CComponent.create_row(`input_ticket_select_${i}`, ticket_text, '/static/common/icon/icon_rectangle_blank.png', SHOW, ()=>{ 
                let ticket_id =  this.data.ticket[i].ticket_id;
                layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_TICKET_VIEW, 100, POPUP_FROM_RIGHT, {'ticket_id':ticket_id}, ()=>{
                    ticket_view_popup = new Ticket_view('.popup_ticket_view', ticket_id, 'ticket_view_popup');
                });
            });

            //티켓내 수업 리스트 표기 부분
            let length = this.data.ticket[i].lecture_id.length;
            let html_to_join_lecture_list = [];
            
            for(let j=0; j<length; j++){
                let lecture_id = this.data.ticket[i].lecture_id[j];
                let lecture_name = this.data.ticket[i].lecture_name[j];
                let icon_button_style = {"display":"block", "padding":"0", "font-size":"13px"};
                let lecture_name_set = `<div style="display:inline-block;width:10px;height:10px;border-radius:5px;background-color:#fe4e65;margin-right:10px;"></div>${lecture_name}`;
                let html_lecture_list_info = CComponent.icon_button (lecture_id, lecture_name_set, NONE, icon_button_style, ()=>{
                    layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_LECTURE_VIEW, 100, POPUP_FROM_RIGHT, {'lecture_id':lecture_id}, ()=>{
                        lecture_view_popup = new Lecture_view('.popup_lecture_view', lecture_id, 'lecture_view_popup');
                    });
                });

                html_to_join_lecture_list.push(html_lecture_list_info);
            }
            //티켓내 남은횟수, 남은 기간 표기 부분
            let icon_button_style_remain_count_info = {"display":"block", "padding":0, "font-size":"12px", "height":"20px"};
            let icon_button_style_remain_data_info = {"display":"block", "padding":0, "font-size":"12px"};
            let html_remain_info = CComponent.icon_button('reg_count', `남은 횟수  <span style="color:#fe4e65">정보없음</span>`, NONE, icon_button_style_remain_count_info, ()=>{}) + 
                                    CComponent.icon_button('reg_date', `남은 기간 <span style="color:#fe4e65">${this.data.ticket[i].end_date_text}</span>`, NONE, icon_button_style_remain_data_info, ()=>{});
            let html_ticket_lecture_list = `<div>${html_to_join_lecture_list.join('')}</div>`;

            html_to_join.push(html_ticket_name + html_ticket_lecture_list + html_remain_info);
        }
        let html = html_to_join.join('');

        return html;
    }



    send_data(){


    }

    static_component(){
        return {
            initial_page:`<section id="${this.target.toolbox}" class="obj_box_full" style="border:0"></section>
                          <section id="${this.target.content}"></section>`
        };
    }
}