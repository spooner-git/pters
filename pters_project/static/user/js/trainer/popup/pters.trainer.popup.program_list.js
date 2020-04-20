// class Program_list{
//     constructor(install_target){
//         this.target = {install: install_target, toolbox:'section_program_list_toolbox', content:'section_program_list_content'};

//         let d = new Date();
//         this.dates = {
//             current_year: d.getFullYear(),
//             current_month: d.getMonth()+1,
//             current_date: d.getDate()
//         };
//         this.times = {
//             current_hour: TimeRobot.to_zone(d.getHours(), d.getMinutes()).hour,
//             current_minute: TimeRobot.to_zone(d.getHours(), d.getMinutes()).minute,
//             current_zone: TimeRobot.to_zone(d.getHours(), d.getMinutes()).zone
//         };

//         this.data = {
                
//         };

//         this.init();
//         // this.set_initial_data();
//     }

 
//     init(){
//         this.set_initial_data();
//     }

//     set_initial_data (){
//         Program_func.read((data)=>{
//             this.data = data;
//             this.render();
//             func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
//         });   
//     }

//     clear(){
//         setTimeout(()=>{
//             document.querySelector(this.target.install).innerHTML = "";
//         }, 300);
//     }

//     render(){
//         let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();program_list_popup.clear();">${CImg.arrow_left()}</span>`;
//         let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
//         let top_right = `<span class="icon_right" onclick="program_list_popup.upper_right_menu();">${CImg.plus()}</span>`;
//         let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
//                         <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
//         let html = PopupBase.base(top_left, top_center, top_right, content, "");

//         document.querySelector(this.target.install).innerHTML = html;
//         document.querySelector('.popup_program_list .wrapper_top').style.border = 0;
//         PopupBase.top_menu_effect(this.target.install);
//     }

//     render_toolbox(){
//         document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
//     }

//     render_content(){
//         document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
//     }

//     dom_assembly_toolbox(){
//         return this.dom_row_toolbox();
//     }
    
//     dom_assembly_content(){
//         let html_selected_current_program = [];
//         let html_shared_program = [];
//         let html_temp = [];
//         let length = this.data.program_data.length;

//         let shared_program_count = 0;
//         let not_selected_program_count = 0;
//         for (let i=0; i<length; i++){
//             let data = this.data.program_data[i];
//             let name = data.program_subject_type_name;
//             let id = data.program_id;
//             let member_num = data.program_total_member_num;
//             let status = data.program_state_cd;
//             let selected = data.program_selected;
//             let shared = data.shared_program_flag;
//             let sharing_member_num = data.share_member_num;
//             let category_code = data.program_upper_subject_cd != "" ? data.program_upper_subject_cd : "ETC";
//             let category_sub_name = PROGRAM_CATEGORY[category_code].sub_category[data.program_subject_cd].name;
//             let category_sub_code = data.program_subject_cd;

//             let html = `<article class="program_wrapper anim_fade_in_vibe_top" data-program_id="${id}" onclick="program_list_popup.event_program_click(${id}, '${name}', '${category_code}', '${category_sub_code}', '${selected}', '${shared}');">
//                             <div class="program_data_u">
//                                 <div>
//                                     <span>${name}</span>
//                                     ${sharing_member_num > 0 ? '<span style="font-size:12px;">'+CImg.share("",{"vertical-align":"middle", "width":"20px", "margin-bottom":"3px", "margin-left":"5px"}) + +sharing_member_num+'</span>' :""}
//                                 </div>
//                                 <div>
//                                     <span>${member_num} ${TEXT.unit.person[language]}</span>
//                                 </div>
//                             </div>                
//                             <div class="program_data_b">
//                                 <span>${category_sub_name}</span>
//                             </div>
//                         </article>`;
//             if(selected == PROGRAM_SELECTED){
//                 html_selected_current_program.push(html);
//             }
            
//             if(shared == ON){
//                 html_shared_program.push(html);
//                 shared_program_count++;
//                 continue;
//             }else{
//                 html_temp.push(html);
//                 not_selected_program_count++;
//             }
//         }

//         html_selected_current_program.unshift(CComponent.dom_tag(TEXT.word.selected_program[language], {"padding":"5px 20px", "font-weight":"bold", "color":"var(--font-highlight)"}));
//         html_shared_program.unshift(CComponent.dom_tag(`${TEXT.word.shared_program[language]} (${shared_program_count})`, {"padding":"5px 20px", "font-weight":"bold", "color":"var(--font-sub-normal)"}));
//         html_temp.unshift(CComponent.dom_tag(`${TEXT.word.my_program[language]} (${not_selected_program_count})`, {"padding":"5px 20px", "font-weight":"bold", "color":"var(--font-sub-normal)"}));

//         if(html_shared_program.length == 1){
//             html_shared_program.push(this.introduce("shared"));
//         }

//         let assembly_selected_program = html_selected_current_program.join("") + `<div style="margin-top:20px;"></div>`;
//         let assembly_shared_program = html_shared_program.join("") + `<div style="margin-top:20px;"></div>`;
//         let assembly_reg_program = html_temp.join("") + `<div style="margin-top:20px;"></div>`;

//         let html =  assembly_selected_program +
//                     assembly_reg_program +
//                     assembly_shared_program;
                    

//         return html;
//     }

//     introduce(type){
//         let text;
//         switch(type){
//             case "shared":
//                 text = `<article class='program_wrapper'>
//                             <p style='font-size:11px;padding:0 5px;margin:0'>${TEXT.word.no_shared_programs[language]}</p>
//                         </article>`;
//             break;
//             case "sharing":
//                 text = `<article class='program_wrapper'>
//                             <p style='font-size:11px;padding:0 5px;margin:0'>${TEXT.word.sharing_my_programs[language]}</p>
//                         </article>`;
//             break;
//         }
//         return text;
//     }

//     dom_row_toolbox(){
//         let title = TEXT.word.program[language];
//         let html = `
//         <div class="lecture_view_upper_box" style="">
//             <div style="display:inline-block;">
//                 <span style="display:inline-block;font-size:23px;font-weight:bold">
//                     ${title}
//                 </span>
//             </div>
//         </div>
//         `;
//         return html;
//     }

//     event_program_click(id, name, category, category_sub, selected, shared){
//         let user_option = {
//             goto:{text:`${TEXT.word.program[language]} ${TEXT.word.move[language]}`, callback:()=>{ 
//                     window.location.href=`/trainer/select_program_processing/?class_id=${id}&next_page=/trainer/`; 
//                 }
//             },
//             edit:{text:TEXT.word.edit[language], callback:()=>{
//                     layer_popup.close_layer_popup();
//                     let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
//                     layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PROGRAM_VIEW, 100, popup_style, null, ()=>{
//                         let external_data = {   
//                                                 id:id,
//                                                 name:name, 
//                                                 category:{name:[PROGRAM_CATEGORY[category].name], code:[category]}, 
//                                                 category_sub:{name:[PROGRAM_CATEGORY[category].sub_category[category_sub].name], code:[category_sub]},
//                                                 selected:selected
//                                             };
//                         program_view_popup = new Program_view('.popup_program_view', external_data);
//                     });
//                 }
//             },
//             sharing:{text:`${TEXT.word.program[language]} ${TEXT.word.share[language]}`, callback:()=>{ 
//                     layer_popup.close_layer_popup();
//                     layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_SHARING, 100, POPUP_FROM_RIGHT, null, ()=>{
//                         setting_sharing_popup = new Setting_sharing('.popup_setting_sharing', {program_id:id});});
//                 }
//             },
//             shared:{text:`${TEXT.word.program[language]} ${TEXT.word.share[language]} ${TEXT.word.auth[language]}`, callback:()=>{ 
//                     layer_popup.close_layer_popup();
//                     layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_SHARED, 100, POPUP_FROM_RIGHT, null, ()=>{
//                         setting_shared_popup = new Setting_shared('.popup_setting_shared', {program_id:id});});
//                 }
//             }
//         };
//         if(shared == ON){
//             delete user_option["edit"];
//             delete user_option["sharing"];
//         }else{
//             delete user_option["shared"];
//         }
//         // if(selected == "NOT_SELECTED"){
//         //     delete user_option["sharing"];
//         // }
//         let options_padding_top_bottom = 16;
//         // let button_height = 8 + 8 + 52;
//         let button_height = 52;
//         let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
//         let root_content_height = $root_content.height();
//         layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
//             option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
//         });
//     }

//     upper_right_menu(){
//         let popup_style = POPUP_FROM_BOTTOM;
//         layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PROGRAM_ADD, 100, popup_style, null, ()=>{
//             program_add_popup = new Program_add('.popup_program_add');
//         });
//     }
// }

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

        this.shared_programs = {

        }

        this.init();
        // this.set_initial_data();
    }

 
    init(){
        this.set_initial_data();
    }

    set_initial_data (){
        Program_func.read((data)=>{
            this.data = data;
            this.shared_programs = {};
            data.program_data.forEach((program)=>{
                if(program.shared_program_flag == OFF){
                    return;
                }
                let owner_id = program.program_program_owner_id; //여기 바꿀것 name을 ID로
                let program_name = program.program_subject_type_name;
                let program_id = program.program_id;
                if(this.shared_programs[owner_id] == undefined){
                    this.shared_programs[owner_id] = {display:HIDE, list_name:[program_name], list_id:[program_id]};
                }else{
                    this.shared_programs[owner_id].list_name.push(program_name);
                    this.shared_programs[owner_id].list_id.push(program_id);
                }
            });


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
        let html_shared_program_sort = {};
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
            let owner_name = data.program_program_owner_name;
            let owner_id = data.program_program_owner_id;
            let category_code = data.program_upper_subject_cd != "" ? data.program_upper_subject_cd : "ETC";
            let category_code_name = data.program_upper_subject_type_name;
            let category_sub_name = data.program_subject_cd_name;
            let category_sub_code = data.program_subject_cd;

            let html = `<article class="program_wrapper " data-program_id="${id}" onclick="event.stopPropagation();program_list_popup.event_program_click(${id}, '${name}', '${category_code_name}', '${category_sub_name}', '${category_code}', '${category_sub_code}', '${selected}', '${shared}');">
                            <div class="program_data_u">
                                <div>
                                    <span>${name}</span>
                                    ${sharing_member_num > 0 ? '<span style="font-size:12px;">'+CImg.share("",{"vertical-align":"middle", "width":"20px", "margin-bottom":"3px", "margin-left":"5px"}) + +sharing_member_num+'</span>' :""}
                                </div>
                                <div>
                                    <span>${member_num} ${TEXT.unit.person[language]}</span>
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
                if(html_shared_program_sort[owner_id] == undefined){
                    html_shared_program_sort[owner_id] = {html:[html], owner_name:owner_name};
                    
                }else{
                    html_shared_program_sort[owner_id].html.push(html);
                }
                // html_shared_program.push(html);
                shared_program_count++;
                continue;
            }else{
                html_temp.push(html);
                not_selected_program_count++;
            }
        }

        let html_shared_program = [];
        for(let owner_id in html_shared_program_sort){
            let program_list_from_the_owner =  html_shared_program_sort[owner_id].html;
            let program_owner_name = html_shared_program_sort[owner_id].owner_name;
            let content = `<div style="padding:10px 0 10px 20px">
                            <div>
                                <span style="font-weight:bold">${program_owner_name} (${program_list_from_the_owner.length})</span> 
                                <span style="float:right;margin-right:15px;">${this.shared_programs[owner_id].display == SHOW ? CImg.arrow_expand([""], {"transform":"rotate(180deg)"}) : CImg.arrow_expand() }</span>
                            </div>
                            <div style="display:${this.shared_programs[owner_id].display == SHOW ? "block" : "none"};padding-top:10px;">
                                ${program_list_from_the_owner.join("")}
                            </div>
                        </div>`;
            let html = 
            CComp.container(
                "div",
                content,
                null,
                {id:`shared_programs_from_${owner_id}`},
                {
                    type:"click", exe:()=>{
                        console.log("sk")
                        this.shared_programs[owner_id].display == SHOW ? this.shared_programs[owner_id].display = HIDE : this.shared_programs[owner_id].display = SHOW;
                        this.render_content();
                    }
                }
            );
            html_shared_program.push(html);
        }



        html_selected_current_program.unshift(CComponent.dom_tag(TEXT.word.selected_program[language], {"padding":"5px 20px", "font-weight":"bold", "color":"var(--font-highlight)"}));
        html_shared_program.unshift(CComponent.dom_tag(`${TEXT.word.shared_program[language]} (${shared_program_count})`, {"padding":"5px 20px", "font-weight":"bold", "color":"var(--font-sub-normal)"}));
        html_temp.unshift(CComponent.dom_tag(`${TEXT.word.my_program[language]} (${not_selected_program_count})`, {"padding":"5px 20px", "font-weight":"bold", "color":"var(--font-sub-normal)"}));

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
                            <p style='font-size:11px;padding:0 5px;margin:0'>${TEXT.word.no_shared_programs[language]}</p>
                        </article>`;
            break;
            case "sharing":
                text = `<article class='program_wrapper'>
                            <p style='font-size:11px;padding:0 5px;margin:0'>${TEXT.word.sharing_my_programs[language]}</p>
                        </article>`;
            break;
        }
        return text;
    }

    dom_row_toolbox(){
        let title = TEXT.word.program[language];
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

    event_program_click(id, name, category_code_name, category_sub_name, category, category_sub, selected, shared){
        let user_option = {
            goto:{text:`${TEXT.word.program[language]} ${TEXT.word.move[language]}`, callback:()=>{ 
                    window.location.href=`/trainer/select_program_processing/?class_id=${id}&next_page=/trainer/`; 
                }
            },
            edit:{text:TEXT.word.edit[language], callback:()=>{
                    layer_popup.close_layer_popup();
                    let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PROGRAM_VIEW, 100, popup_style, null, ()=>{
                        let external_data = {   
                                                id:id,
                                                name:name, 
                                                category:{name:[category_code_name], code:[category]},
                                                category_sub:{name:[category_sub_name], code:[category_sub]},
                                                selected:selected
                                            };
                        program_view_popup = new Program_view('.popup_program_view', external_data);
                    });
                }
            },
            sharing:{text:`${TEXT.word.program[language]} ${TEXT.word.share[language]}`, callback:()=>{ 
                    layer_popup.close_layer_popup();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_SHARING, 100, POPUP_FROM_RIGHT, null, ()=>{
                        setting_sharing_popup = new Setting_sharing('.popup_setting_sharing', {program_id:id});});
                }
            },
            shared:{text:`${TEXT.word.program[language]} ${TEXT.word.share[language]} ${TEXT.word.auth[language]}`, callback:()=>{ 
                    layer_popup.close_layer_popup();
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_SETTING_SHARED, 100, POPUP_FROM_RIGHT, null, ()=>{
                        setting_shared_popup = new Setting_shared('.popup_setting_shared', {program_id:id});});
                }
            }
        };
        if(shared == ON){
            delete user_option["edit"];
            delete user_option["sharing"];
        }else{
            delete user_option["shared"];
        }
        // if(selected == "NOT_SELECTED"){
        //     delete user_option["sharing"];
        // }
        let options_padding_top_bottom = 16;
        // let button_height = 8 + 8 + 52;
        let button_height = 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    upper_right_menu(){
        let popup_style = POPUP_FROM_BOTTOM;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_PROGRAM_ADD, 100, popup_style, null, ()=>{
            program_add_popup = new Program_add('.popup_program_add');
        });
    }
}

class Program_func{
    static create(data, callback, error_callback){
        //지점 추가
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
                        show_error_message({title:data.messageArray[0]});
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
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
            }
        });
    }

    static read(callback, error_callback, async){
        if(async == undefined){
            async = true;
        }

        //지점 리스트 서버에서 불러오기
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
                        show_error_message({title:data.messageArray[0]});
                        return false;
                    }
                }
                let select_check = false;
                for(let i=0; i<data.program_data.length; i++){
                    if(data.program_data[i].program_selected == PROGRAM_SELECTED){
                        select_check = true;
                    }
                }
                if(!select_check){
                    let message = {
                        title:`지점의 공유 연결 해제 되었습니다.`,
                        comment:`다시 연결하려면 지점 소유자에게 요청 해야합니다.`
                    };
                    show_error_message (message);
                    location.href = '/trainer/refresh_trainer_page/';
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
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
            }
        });
    }

    static update(data, callback, error_callback){
        //지점 추가
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
                        show_error_message({title:data.messageArray[0]});
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
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
            }
        });
    }

    static delete(data, callback, error_callback){
        //지점 추가
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
                        show_error_message({title:data.messageArray[0]});
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
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
            }
        });
    }
}


