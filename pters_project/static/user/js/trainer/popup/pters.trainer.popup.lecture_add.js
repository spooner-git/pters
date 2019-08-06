class Lecture_add{
    constructor(install_target, data_from_external, instance){
        this.target = {install: install_target, toolbox:'section_lecture_add_toolbox', content:'section_lecture_add_content'};
        this.instance = instance;

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
        this.render();
        func_set_webkit_overflow_scrolling('.wrapper_middle');
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/close_black.png" onclick="layer_popup.close_layer_popup();lecture_add_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="lecture_add_popup.send_data();">저장</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
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
        let name = this.dom_row_lecture_name_input();
        let time = this.dom_row_lecture_time_input(); //수업 진행시간
        let capacity = this.dom_row_capacity_input();
        let fixed_member = this.dom_row_fiexd_member_select();
        let fixed_member_list = this.dom_row_fixed_member_list();
        let color = this.dom_row_color_select();

        let html =  '<div class="obj_box_full">'+CComponent.dom_tag('수업명') + name+'</div>' + 
                    '<div class="obj_box_full">'+CComponent.dom_tag('정원') + capacity + '</div>' + 
                    '<div class="obj_box_full">'+CComponent.dom_tag('색상')+ color+ '</div>';

        return html;
    }

    dom_row_toolbox(){
        let html = `
        <div class="member_add_upper_box" style="padding-bottom:8px;">
            <div style="display:inline-block;width:200px;">
                <div style="display:inline-block;width:200px;">
                    <span style="font-size:20px;font-weight:bold;">새로운 수업</span>
                </div>
            </div>
        </div>
        `;
        return html;
    }

    dom_row_lecture_name_input(){
        let id = 'input_lecture_name';
        let title = this.data.name == null ? '' : this.data.name;
        let placeholder = '수업명*';
        let icon = '/static/common/icon/icon_book.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.name = user_input_data;
        });
        return html;
    }

    dom_row_lecture_time_input(){
        let id = 'input_lecture_time';
        let title = this.data.time == null ? '' : this.data.time;
        let placeholder = '진행 시간*';
        let icon = '/static/common/icon/icon_clock.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.time = user_input_data;
        });
        return html;
    }

  
    dom_row_capacity_input(){
        let id = 'input_lecture_capacity';
        let title = this.data.capacity == null ? '' : '정원 '+this.data.capacity+'명';
        let placeholder =  '정원*';
        let icon = '/static/common/icon/icon_member.png';
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = null;
        let disabled = false;
        let html = CComponent.create_input_number_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            let user_input_data = input_data;
            this.capacity = user_input_data;
        });
        return html;
    }

    dom_row_fiexd_member_select(){
        let fixed_member_text = this.data.fixed_member_name.length == 0 ? '고정 회원' : '고정회원 '+this.data.fixed_member_id.length+'명 선택됨';
        let html = CComponent.create_row('select_member', fixed_member_text, '/static/common/icon/icon_rectangle_blank.png', SHOW, '고정 회원',(data)=>{
            if(this.data.capacity != null){
                layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                    member_select = new MemberSelector('#wrapper_box_member_select', this, this.data.capacity, {'lecture_id':null, "title":"고정 회원 선택"}, (set_data)=>{
                        this.member = set_data;
                        this.render_content();
                    });
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
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_MEMBER_SIMPLE_VIEW, 100*(400/windowHeight), POPUP_FROM_BOTTOM, {'member_id':member_id}, ()=>{
                        member_simple_view_popup = new Member_simple_view('.popup_member_simple_view', member_id, 'member_simple_view_popup');
                        //회원 간단 정보 팝업 열기
                    });
                })
            );
        }
        let html = `<div>${html_to_join.join('')}</div>`;

        return html;
    }

    dom_row_color_select(){
        let color_text = this.data.color_name.length == 0 ? '색상 태그' : `<span style="background-color:${this.data.color_bg};color:${this.data.color_font};padding:5px;border-radius:4px;">${this.data.color_name}</span>`;
        let html = CComponent.create_row('input_color_select', color_text, '/static/common/icon/icon_rectangle_blank.png', SHOW, '', ()=>{ 
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_COLOR_SELECT, 100, POPUP_FROM_RIGHT, null, ()=>{
                color_select = new ColorSelector('#wrapper_box_color_select', this, 1, (set_data)=>{
                    this.color = set_data;
                    this.render_content();
                });
            });
        });
        return html;
    }


    send_data(){

        let data = {
                    "name":this.data.name,
                    "member_num":this.data.capacity,
                    "ing_color_cd":this.data.color_bg,
                    "end_color_cd":"",
                    "ing_font_color_cd":this.data.color_font,
                    "end_font_color_cd":""
        };

        if(this.check_before_send() == false){
            return false;
        }

        Lecture_func.create(data, ()=>{
            // layer_popup.close_layer_popup();
            lecture.init();
        });
        layer_popup.close_layer_popup();
        lecture_add_popup.clear();
    }

    check_before_send(){
        if(this.data.name == null){
            show_error_message('수업명을 입력해주세요.');
            return false;
        }

        if(this.data.capacity == null){
            show_error_message('정원을 입력해주세요.');
            return false;
        }
        return true;
    }
}