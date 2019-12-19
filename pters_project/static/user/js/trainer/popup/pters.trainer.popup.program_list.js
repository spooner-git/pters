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

        this.init();
        // this.set_initial_data();
    }

 
    init(){
        this.set_initial_data();
    }

    set_initial_data (){
        Program_func.read((data)=>{
            this.data = data;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });   
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();program_list_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="program_list_popup.upper_right_menu();">${CImg.plus()}</span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_program_list .wrapper_top').style.border = 0;
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
        let html_selected_current_program = [];
        let html_shared_program = [];
        let html_temp = [];
        let length = this.data.program_data.length;

        let shared_program_count = 0;
        let not_selected_program_count = 0;
        for (let i=0; i<length; i++){
            let data = this.data.program_data[i];
            let name = data.program_subject_type_name;
            let id = data.program_id;
            let member_num = data.program_total_member_num;
            let status = data.program_state_cd;
            let selected = data.program_selected;
            let shared = data.shared_program_flag;
            let sharing_member_num = data.share_member_num;
            let category_code = data.program_upper_subject_cd != "" ? data.program_upper_subject_cd : "ETC";
            let category_sub_name = PROGRAM_CATEGORY[category_code].sub_category[data.program_subject_cd].name;
            let category_sub_code = data.program_subject_cd;

            let html = `<article class="program_wrapper" data-program_id="${id}" onclick="program_list_popup.event_program_click(${id}, '${name}', '${category_code}', '${category_sub_code}', '${selected}', '${shared}');">
                            <div class="program_data_u">
                                <div>
                                    <span>${name}</span>
                                    ${sharing_member_num > 0 ? '<span style="font-size:12px;">'+CImg.share("",{"vertical-align":"middle", "width":"20px", "margin-bottom":"3px", "margin-left":"5px"}) + +sharing_member_num+'</span>' :""}
                                </div>
                                <div>
                                    <span>${member_num} 명</span>
                                </div>
                            </div>                
                            <div class="program_data_b">
                                <span>${category_sub_name}</span>
                            </div>
                        </article>`;
            if(selected == PROGRAM_SELECTED){
                html_selected_current_program.push(html);
            }
            
            if(shared == ON){
                html_shared_program.push(html);
                shared_program_count++;
                continue;
            }else{
                html_temp.push(html);
                not_selected_program_count++;
            }
        }

        html_selected_current_program.unshift(CComponent.dom_tag("선택된 프로그램", {"padding":"5px 20px", "font-weight":"bold", "color":"var(--font-highlight)"}));
        html_shared_program.unshift(CComponent.dom_tag(`공유 받은 프로그램 (${shared_program_count})`, {"padding":"5px 20px", "font-weight":"bold", "color":"var(--font-sub-normal)"}));
        html_temp.unshift(CComponent.dom_tag(`내 프로그램 (${not_selected_program_count})`, {"padding":"5px 20px", "font-weight":"bold", "color":"var(--font-sub-normal)"}));


        if(html_shared_program.length == 1){
            html_shared_program.push(this.introduce("shared"));
        }

        let assembly_selected_program = html_selected_current_program.join("") + `<div style="margin-top:20px;"></div>`;
        let assembly_shared_program = html_shared_program.join("") + `<div style="margin-top:20px;"></div>`;
        let assembly_reg_program = html_temp.join("") + `<div style="margin-top:20px;"></div>`;

        let html =  assembly_selected_program +
                    assembly_reg_program +
                    assembly_shared_program;
                    

        return html;
    }

    introduce(type){
        let text;
        switch(type){
            case "shared":
                text = `<article class='program_wrapper'>
                            <p style='font-size:11px;padding:0 5px;margin:0'>다른 PTERS 강사님으로부터 공유 받은 프로그램이 없습니다.</p>
                        </article>`;
            break;
            case "sharing":
                text = `<article class='program_wrapper'>
                            <p style='font-size:11px;padding:0 5px;margin:0'>다른 PTERS 강사님께 내 프로그램을 공유하여, 함께 관리합니다.</p>
                        </article>`;
            break;
        }
        return text;
    }

    dom_row_toolbox(){
        let title = "프로그램";
        let html = `
        <div class="lecture_view_upper_box" style="">
            <div style="display:inline-block;">
                <span style="display:inline-block;font-size:23px;font-weight:bold">
                    ${title}
                </span>
            </div>
        </div>
        `;
        return html;
    }

    event_program_click(id, name, category, category_sub, selected, shared){
        let user_option = {
            goto:{text:"프로그램 이동", callback:()=>{ 
                    window.location.href=`/trainer/select_program_processing/?class_id=${id}&next_page=/trainer/`; 
                }
            },
            edit:{text:"편집", callback:()=>{
                    layer_popup.close_layer_popup();
                    let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PROGRAM_VIEW, 100, popup_style, null, ()=>{
                        let external_data = {   
                                                id:id,
                                                name:name, 
                                                category:{name:[PROGRAM_CATEGORY[category].name], code:[category]}, 
                                                category_sub:{name:[PROGRAM_CATEGORY[category].sub_category[category_sub].name], code:[category_sub]},
                                                selected:selected
                                            };
                        program_view_popup = new Program_view('.popup_program_view', external_data);
                    });
                }
            }
        };
        if(shared == ON){
            delete user_option["edit"];
        }
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    upper_right_menu(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PROGRAM_ADD, 100, popup_style, null, ()=>{
            program_add_popup = new Program_add('.popup_program_add');
        });
    }
}

class Program_func{
    static create(data, callback, error_callback){
        //프로그램 추가
        $.ajax({
            url:"/trainer/add_program_info/",
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
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    static read(callback, error_callback, async){
        if(async == undefined){
            async = true;
        }

        //프로그램 리스트 서버에서 불러오기
        $.ajax({
            url:"/trainer/get_program_list/",
            dataType : 'JSON',
            async: async,
            
            beforeSend:function (){
                // ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function (data){
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
                // ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function (){
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
            }
        });
    }

    static update(data, callback, error_callback){
        //프로그램 추가
        $.ajax({
            url:"/trainer/update_program_info/",
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
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    static delete(data, callback, error_callback){
        //프로그램 추가
        $.ajax({
            url:"/trainer/delete_program_info/",
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
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }
}


