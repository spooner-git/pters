class Program_list{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_program_list_toolbox', content:'section_program_list_content'};

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
                
        };

        // this.init();
        this.set_initial_data();
    }

 
    init(){
        this.render();
        func_set_webkit_overflow_scrolling('.wrapper_middle');
    }

    set_initial_data (){
        Program_func.read((data)=>{
            console.log(data)
            this.data = data;
            console.log(this.data)
            this.init();
        });   
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/navigate_before_black.png" onclick="layer_popup.close_layer_popup();program_list_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><img src="/static/common/icon/icon_add.png" class="obj_icon_basic" onclick="program_list_popup.upper_right_menu();"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_program_list .wrapper_top').style.border = 0;
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
        let html_selected_current_program = [CComponent.dom_tag("선택된 프로그램", {"padding":"5px 20px", "font-weight":"bold", "color":"#fe4e65"})];
        let html_temp = [CComponent.dom_tag('등록된 프로그램', {"padding":"5px 20px", "font-weight":"bold", "color":"#858282"})];
        let length = this.data.program_data.length;
        for (let i=0; i<length; i++){
            let data = this.data.program_data[i];
            let name = data.program_subject_type_name;
            let id = data.program_id;
            let member_num = data.program_total_member_num;
            let status = data.program_state_cd;
            let selected = data.program_selected;
            let category = data.program_subject_type_name;

            let html = `<article class="program_wrapper" data-program_id="${id}" onclick="window.location.href='/trainer/select_program_processing/?class_id=${id}&next_page=/trainer/'">
                            <div class="program_data_u">
                                <div>
                                    <span>${name}</span>
                                </div>
                                <div>
                                    <span>${member_num} 명</span>
                                </div>
                            </div>                
                            <div class="program_data_b">
                                <span>${category}</span>
                            </div>
                        </article>`;
            if(selected == PROGRAM_SELECTED){
                html_selected_current_program.push(html);
            }else{
                html_temp.push(html);
            }
        }
        
        let html = html_selected_current_program.join("") + `<div style="margin-top:20px;"></div>` + html_temp.join("");

        return html;
    }

    dom_row_toolbox(){
        let title = "프로그램";
        let html = `
        <div class="lecture_view_upper_box" style="">
            <div style="display:inline-block;width:320px;">
                <div style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
                    ${title}
                </div>
            </div>
        </div>
        `;
        return html;
    }

    upper_right_menu(){
        alert('프로그램 추가 팝업 생성');
        // layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(45+50*Object.keys(user_option).length)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
        //     option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        // });
    }
}

class Program {
    constructor (targetHTML, instance){
        this.page_name = "program";
        this.targetHTML = targetHTML;
        this.instance = instance;
    }

    init (){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;

        this.render_upper_box();
        Program_func.read((jsondata) => {
            this.render_list(jsondata);
            this.render_upper_box();
        });
    }

    //상단을 렌더링
    render_upper_box (){
        if(current_page != this.page_name){
            return false;
        }

        this.search = false;
        let component = this.static_component();
        document.getElementById('program_display_panel').innerHTML = component.program_upper_box;
    }

    //회원 리스트를 렌더링
    render_list (jsondata){
        if(current_page != this.page_name){
            return false;
        }

        let html_selected_current_program = [CComponent.dom_tag("선택된 프로그램", {"padding":"5px 20px", "font-weight":"bold", "color":"#fe4e65"})];
        let html_temp = [CComponent.dom_tag('등록된 프로그램', {"padding":"5px 20px", "font-weight":"bold", "color":"#858282"})];
        let length = jsondata.program_data.length;
        for (let i=0; i<length; i++){
            let data = jsondata.program_data[i];
            let name = data.program_subject_type_name;
            let id = data.program_id;
            let member_num = data.program_total_member_num;
            let status = data.program_state_cd;
            let selected = data.program_selected;
            let category = data.program_subject_type_name;

            let html = `<article class="program_wrapper" data-program_id="${id}">
                            <div class="program_data_u">
                                <div>
                                    <span>${name}</span>
                                </div>
                                <div>
                                    <span>${member_num} 명</span>
                                </div>
                            </div>                
                            <div class="program_data_b">
                                <span>${category}</span>
                            </div>
                        </article>`;
            if(selected == PROGRAM_SELECTED){
                html_selected_current_program.push(html);
            }else{
                html_temp.push(html);
            }
        }
        
        document.querySelector('#program_content_wrap').innerHTML = html_selected_current_program.join("") +
                                                                    `<div style="margin-top:20px;"></div>`+
                                                                     html_temp.join("");
    }

    static_component (){
        return(
            {
                program_upper_box:`    <div class="program_upper_box">
                                        <div style="display:inline-block;width:200px;">
                                            <div style="display:inline-block;width:200px;">
                                                <span style="font-size:23px;font-weight:bold;color:#3b3d3d">프로그램 </span>
                                            </div>
                                        </div>
                                        <div class="program_tools_wrap">
                                            <div class="search_program"></div>
                                            <div class="add_program"></div>
                                        </div>
                                </div>`
                ,
                initial_page:`<div id="program_display_panel"></div><div id="program_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div>`
            }
        );
    }
}

class Program_func{
    static create(){

    }

    static read(callback){
        //프로그램 리스트 서버에서 불러오기
        $.ajax({
            url:"/trainer/get_program_list/",
            dataType : 'JSON',
            beforeSend:function (){
                ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function (data){
                console.log(data);
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){
                ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
            }
        });
    }

    static update(){

    }

    static delete(){

    }
}


