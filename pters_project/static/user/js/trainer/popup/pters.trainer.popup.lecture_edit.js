class Lecture_edit{
    constructor(install_target, lecture_id, instance){
        this.target = {install: install_target, toolbox:'section_lecture_edit_toolbox', content:'section_lecture_edit_content'};
        this.instance = instance;
        this.lecture_id = lecture_id;

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
                name:null,
                time:null,
                capacity:null,
                fixed_member_id:[],
                fixed_member_name:[],
                color_bg:[],
                color_font:[],
                color_name:[]
        };

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

    set time(text){
        this.data.time = text;
        this.render_content();
    }

    get time(){
        return this.data.time;
    }

    set capacity(number){
        this.data.capacity = number;
        this.render_content();
    }

    get capacity(){
        return this.data.capacity;
    }

    set member(data){
        this.data.fixed_member_id = data.id;
        this.data.fixed_member_name = data.name;
        this.render_content();
    }

    get member(){
        return {id:this.data.fixed_member_id, name:this.data.fixed_member_name};
    }

    set color(data){
        this.data.color_bg = data.bg;
        this.data.color_font = data.font;
        this.data.color_name = data.name;
        this.render_content();
    }

    get color(){
        return {bg:this.data.color_bg, font:this.data.color_font, name:this.data.color_name};
    }

 
    init(){
        this.render_initial();
        this.render_toolbox();
        this.render_content();
    }

    set_initial_data (){
        Lecture_func.read({"lecture_id": this.lecture_id}, (data)=>{
            this.data.name = data.lecture_name;
            this.data.time = null;
            this.data.capacity = data.lecture_max_num;
            this.data.fixed_member_id = data.lecture_member_list.filter((el)=>{return el.member_fix_state_cd == FIX ? true : false;}).map((el)=>{return el.member_id;});
            this.data.fixed_member_name = data.lecture_member_list.filter((el)=>{return el.member_fix_state_cd == FIX ? true : false;}).map((el)=>{return el.member_name;});
            // this.data.color_bg = data.ing_color_cd;
            // this.data.color_font = data.ing_font_color_cd;
            // this.data.color_name = data.ing_color_cd;
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
        let name = this.dom_row_lecture_name_input();
        let time = this.dom_row_lecture_time_input(); //수업 진행시간
        let capacity = this.dom_row_capacity_input();
        let fixed_member = this.dom_row_fiexd_member_select();
        let fixed_member_list = this.dom_row_fixed_member_list();
        let color = this.dom_row_color_select();

        let html =  '<div class="obj_box_full">'+name+'</div>' + 
                    '<div class="obj_box_full">'+capacity+fixed_member+fixed_member_list+ '</div>' + 
                    '<div class="obj_box_full">'+color+ '</div>';

        document.getElementById(this.target.content).innerHTML = html;
    }

    dom_row_toolbox(){
        let html = `
        <div class="member_add_upper_box" style="padding-bottom:8px;">
            <div style="display:inline-block;width:200px;">
                <div style="display:inline-block;width:200px;">
                    <span style="font-size:20px;font-weight:bold;">수업 정보 수정</span>
                </div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_lecture_name_input(){
        let html = CComponent.create_input_row ('input_lecture_name', this.data.name == null ? '수업명*' : this.data.name, '/static/common/icon/icon_book.png', HIDE, (input_data)=>{
            let user_input_data = input_data;
            if(user_input_data == null){
                user_input_data = this.data.name;
            }
            this.name = user_input_data;
        });
        return html;
    }

    dom_row_lecture_time_input(){
        let html = CComponent.create_input_row ('input_lecture_time', this.data.time == null ? '진행 시간*' : this.data.time, '/static/common/icon/icon_clock.png', HIDE, (input_data)=>{
            let user_input_data = input_data;
            this.time = user_input_data;
        });
        return html;
    }

  
    dom_row_capacity_input(){
        let html = CComponent.create_input_number_row ('input_lecture_capacity', this.data.capacity == null ? '정원*' : '정원 '+this.data.capacity+'명', '/static/common/icon/icon_member.png', HIDE, (input_data)=>{
            let user_input_data = input_data;
            if(user_input_data == null){
                user_input_data = this.data.capacity;
            }
            this.capacity = user_input_data;
        });
        return html;
    }

    dom_row_fiexd_member_select(){
        let fixed_member_text = this.data.fixed_member_name.length == 0 ? '고정 회원' : '고정회원 '+this.data.fixed_member_id.length+'명 선택됨';
        let html = CComponent.create_row('select_member', fixed_member_text, '/static/common/icon/icon_rectangle_blank.png', SHOW, (data)=>{
            if(this.data.capacity != null){
                layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                    member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.capacity, {'lecture_id':null});
                });
            }else{
                show_error_message('정원을 먼저 입력해주세요.');
            }
        });
        return html;
    }

    dom_row_fixed_member_list (){
        let length = this.data.fixed_member_id.length;
        let html_to_join = [];
        
        for(let i=0; i<length; i++){
            let member_id = this.data.fixed_member_id[i];
            let member_name = this.data.fixed_member_name[i];
            let icon_button_style = null;
            html_to_join.push(
                CComponent.icon_button(member_id, member_name, null, icon_button_style, ()=>{
                    layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_MEMBER_VIEW, 100, POPUP_FROM_RIGHT, {'member_id':member_id});
                })
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    dom_row_color_select(){
        let color_text = this.data.color_name.length == 0 ? '색상 태그' : `<span style="background-color:${this.data.color_bg};color:${this.data.color_font};padding:5px;border-radius:4px;">${this.data.color_name}</span>`;
        let html = CComponent.create_row('input_color_select', color_text, '/static/common/icon/icon_rectangle_blank.png', SHOW, ()=>{ 
            layer_popup.open_layer_popup(POPUP_AJAX_CALL, POPUP_ADDRESS_COLOR_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                color_select = new ColorSelector('#wrapper_box_color_select', this, 1);
            });
        });
        return html;
    }


    send_data(){

        let data = {
                    "lecture_id":this.lecture_id,
                    "name":this.data.name,
                    "member_num":this.data.capacity,
                    "ing_color_cd":this.data.color_bg,
                    "end_color_cd":"",
                    "ing_font_color_cd":this.data.color_font,
                    "end_font_color_cd":""
        };

        Lecture_func.update(data, ()=>{
            layer_popup.close_layer_popup();
            lecture.init();
        });
    }

    static_component(){
        return {
            initial_page:`<section id="${this.target.toolbox}" class="obj_box_full" style="border:0"></section>
                          <section id="${this.target.content}"></section>`
        };
    }
}