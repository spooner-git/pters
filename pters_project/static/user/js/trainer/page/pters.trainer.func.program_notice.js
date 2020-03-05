class ProgramNotice {
    constructor(install_target, instance){
        this.target = {install: install_target, toolbox:'section_program_notice_toolbox', content:'section_program_notice_content'};
        this.page_name = "program_notice_page_type";
        this.instance = instance;
        this.form_id = 'id_program_notice_form';
        this.list_status_type = "ing"; //ing, end

        let d = new Date();
        this.current_year = d.getFullYear();
        this.current_month = d.getMonth()+1;
        this.current_date = d.getDate();
        this.today = DateRobot.to_yyyymmdd(this.current_year, this.current_month, this.current_date);
        this.notice_list = {
            program_notice_id: null,
            name: null,
            note: null
        };
        this.data = {
            all:null
        };

        this.sort = "all";

        // this.time_interval;
        this.init();
    }

    init(){
        if(current_page_text != this.page_name){
            return false;
        }
        this.set_initial_data();
    }

    set_initial_data (){
        // this.render_loading_image();
        ProgramNotice_func.read_all({}, (data)=>{
            this.data.all = data;
            // this.notice_list = data;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        }, ()=>{this.data_sending_now = false;layer_popup.close_layer_popup();program_notice_list_popup.clear();},()=>{}, true);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){

        let html = `<div>
                        <div id="program_notice_display_panel">
                            ${this.dom_assembly_toolbox()}
                        </div>
                        <div id="program_notice_content_wrap" class="">
                            ${this.dom_assembly_content()}
                        </div>
                    </div>`;

        document.querySelector(this.target.install).innerHTML = html;

        // let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();program_notice_list_popup.clear();">${CImg.arrow_left()}</span>`;
        // let top_center = `<span class="icon_center">프로그램 공지사항</span>`;
        // let top_right = `<span class="icon_right">
        //                     <span class=".add_program_notice" onclick="${this.instance}.event_add_new();">
        //                         ${CImg.plus("", {"vertical-align":"middle"})}
        //                     </span>
        //                 </span>`;
        // let content =   `<section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        //
        // let html = PopupBase.base(top_left, top_center, top_right, content, "");
        //
        // document.querySelector(this.target.install).innerHTML = html;
        // document.querySelector('.popup_program_notice_list .wrapper_top').style.border = 0;
        // PopupBase.top_menu_effect(this.target.install);
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

    dom_row_toolbox(){
        // let options_padding_top_bottom = 16;
        // let button_height = 52;
        let title = "공지사항";
        let html = `<div class="program_notice_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <div style="display:inline-block; color:var(--font-highlight); font-weight:900;"></div>
                        </div>
                        <div class="program_notice_tools_wrap">
                            <div class="search_program_notice" onclick="${this.instance}.search_tool_visible(event, this);">
                                ${CImg.search()}
                            </div>
                            <div class="add_program_notice" onclick="${this.instance}.event_add_new()">
                                ${CImg.plus()}
                            </div>
                        </div>
                    </div>`;
        return html;
    }

    button_sort(){
        let id = "button_sort";
        let title;
        if(this.sort == "all"){
            title = "전체" + CImg.arrow_expand("", {"width":"17px", "height":"17px", "vertical-align":"middle"});
        }
        // else if(this.sort == "program_notice"){
        //     title = "공지만" + CImg.arrow_expand("", {"width":"17px", "height":"17px", "vertical-align":"middle"});
        // }
        // else if(this.sort == "update_history"){
        //     title = "업데이트 내역만" + CImg.arrow_expand("", {"width":"17px", "height":"17px", "vertical-align":"middle"});
        // }
        let style = {"font-size":"13px", "color":"var(--font-sub-normal)", "margin-left":"20px"};
        let onclick = ()=>{
            this.event_sort();
        };
        let html = CComponent.text_button (id, title, style, onclick);
        return html;
    }

    dom_assembly_content(){
        let html_to_join = [];
        let numbering = 1;
        for(let item in this.data.all){
            let type = this.data.all[item].program_notice_type_cd;
            if(type != NOTICE && type != NOTICE_UPDATE_HISTORY){
                continue;
            }

            if(this.sort == "notice"){
                if(type != NOTICE){
                    continue;
                }
            }else if(this.sort == "update_history"){
                if(type != NOTICE_UPDATE_HISTORY){
                    continue;
                }
            }

            let article = this.dom_row_program_notice_article(numbering, this.data.all[item]);
            numbering++;
            html_to_join.push(article);
        }
        if(html_to_join.length == 0){
            html_to_join.push(
                `<p style="font-size:14px;padding:16px">데이터가 없습니다.</p>`
            );
        }

        let html = '<div class="program_notice_article_wrapper">' + html_to_join.join('') + '</div>';

        return html;
    }

    dom_row_program_notice_article(numbering, data){
        let type = data.program_notice_type_cd;

        let id = data.program_notice_id;
        let title = data.program_notice_title;
        let content = data.program_notice_contents;
        let to_member_type_cd = data.program_notice_to_member_type_cd;
        // let target = PROGRAM_BOARD_TARGET[data.program_notice_to_member_type_cd];
        let reg_dt = data.program_notice_reg_dt;
        let mod_dt = data.program_notice_mod_dt;
        let reg_member_name = data.program_notice_reg_member_name;
        let reg_date = reg_dt.split(' ')[0];
        let hits = data.program_notice_hits; //조회수
        let use = data.program_notice_use; //공개여부

        let html = `<article id="program_notice_article_${id}" class="program_notice_article anim_fade_in_vibe_top">
                        <div style="display:table; width:100%;">
                            <div style="display:table-row;">
                                <div class="program_notice_article_id" style="width:5%;display:table-cell;vertical-align:middle;">
                                    ${numbering}
                                </div>
                                <div style="width:60%;display:table-cell;">
                                    <div class="program_notice_article_upper">
                                        <div class="program_notice_article_title">${title}</div>
                                    </div>
                                    <div class="program_notice_article_bottom">
                                        <div class="program_notice_article_reg_date">등록일:${reg_date}, 조회수:${hits}</div>
                                    </div>
                                </div>
                                <div style="width:15%;min-width:70px;display:table-cell;vertical-align:middle;">
                                    <div class="program_notice_article_upper">
                                        <div class="program_notice_article_use" style="color:${PROGRAM_BOARD_USE[use].color}">${PROGRAM_BOARD_USE[use].text}</div>
                                    </div>
                                    <div class="program_notice_article_bottom">
                                        <div class="program_notice_article_use">(${PROGRAM_BOARD_TARGET[to_member_type_cd]})</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>`;
        $(document).off('click', `#program_notice_article_${id}`).on('click', `#program_notice_article_${id}`, ()=>{
            // let program_notice_contents =  $(this).find(".program_notice_contents");
            // if(program_notice_contents.css('display') == 'none'){
            //     program_notice_contents.show();
            // }else{
            //     program_notice_contents.hide();
            // }
            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER_UPDATE, 100, popup_style, null, ()=>{
                let external_data = {   title:title, content:content, id:id, reg_dt:reg_dt, mod_dt:mod_dt,reg_member_name:reg_member_name,
                                        category:[
                                            {id:"use", title:"공개 여부", data: {text:["공개", "비공개"], value:[ON, OFF]} },
                                            {id:"to_member_type_cd", title:"공지 대상", data: {text:["전체 회원", "진행중 회원", "종료된 회원"], value:["trainee", "ing_trainee", "end_trainee"]} },
                                            {id:"push_use", title:"푸시 알림", data: {text:["미알림", "알림"], value:[OFF, ON]} }
                                        ],
                                        category_selected:{
                                            use:{text:[PROGRAM_BOARD_USE[use].text], value:[use]},
                                            to_member_type_cd:{text:[PROGRAM_BOARD_TARGET[to_member_type_cd]], value:[to_member_type_cd]},
                                            push_use:{text:[], value:[]}
                                        },
                                        new_check:false
                };
                board_writer = new BoardWriter("공지 수정", '.popup_board_writer_update', 'board_writer', external_data, (data_written)=>{
                    let data = {"program_notice_id":data_written.id, "notice_type_cd":NOTICE, "title":data_written.title,
                                "contents":data_written.content, "to_member_type_cd":data_written.category_selected.to_member_type_cd.value[0],
                                "push_use":data_written.category_selected.push_use.value[0],
                                "use":data_written.category_selected.use.value[0]};
                    ProgramNotice_func.update(data, ()=>{
                        this.init();
                    });
                });
            });

        });

        return html;
    }

    event_sort(){
        let user_option = {
            all:{text:"전체", callback:()=>{
                this.sort = "all";
                this.render();
                layer_popup.close_layer_popup();
            }},
            // program_notice:{text:"공지만", callback:()=>{
            //     this.sort = "program_notice";
            //     this.render();
            //     layer_popup.close_layer_popup();
            // }},
            // update_history:{text:"업데이트 내역만", callback:()=>{
            //     this.sort = "update_history";
            //     this.render();
            //     layer_popup.close_layer_popup();
            // }},
        };
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, popup_style, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    event_add_new(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, popup_style, null, ()=>{
            let external_data = {
                                        category:[
                                            {id:"use", title:"공개 여부", data: {text:["공개", "비공개"], value:[ON, OFF]} },
                                            {id:"to_member_type_cd", title:"공개 대상", data: {text:["전체 회원", "진행중 회원", "종료된 회원"], value:["trainee", "ing_trainee", "end_trainee"]} },
                                            {id:"push_use", title:"푸시 알림", data: {text:["미알림", "알림"], value:[OFF, ON]} }
                                        ],
                                        category_selected:{
                                            use:{text:[], value:[]},
                                            to_member_type_cd:{text:[], value:[]},
                                            push_use:{text:[], value:[]}
                                        },
                                        new_check:true
            };
            board_writer = new BoardWriter("새 공지사항", '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                let data = {"notice_type_cd": NOTICE, "title":data_written.title,
                            "contents":data_written.content, "to_member_type_cd":data_written.category_selected.to_member_type_cd.value[0],
                            "push_use":data_written.category_selected.push_use.value[0],
                            "use":data_written.category_selected.use.value[0]};
                ProgramNotice_func.create(data, ()=>{
                    this.init();
                });
            });
        });
    }

}




class ProgramNotice_func{
    static create(data, callback, error_callback){

        let auth_inspect = pass_inspector.program_notice_create();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            // this.init();
            show_error_message({title:message});
            return false;
        }

        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }

        let inspect = pass_inspector.program_notice();
        if(inspect.barrier == BLOCKED){
            this.data_sending_now = false;
            let message = {
                            title:`공지사항 등록을 완료하지 못하였습니다.`,
                            comment:`[${inspect.limit_type}] 이용자께서는 공지사항을 최대 ${inspect.limit_num}개까지 등록하실 수 있습니다.
                                    <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까?</p>`
            }
            show_user_confirm (message, ()=>{
                layer_popup.all_close_layer_popup();
                sideGoPopup("pters_pass_main");
            });

            return false;
        }
        $.ajax({
            url:'/trainer/add_program_notice_info/',
            type:'POST',
            data: data,
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                // console.log(data_);
                // let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        if(error_callback != undefined){
                            error_callback();
                        }
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static read(data, callback, error_callback){
        //데이터 형태 {"ticket_id":""};
        $.ajax({
            url:'/trainer/get_program_notice_info/',
            type:'GET',
            data: data,
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                check_app_version(data.app_version);
                // let data = JSON.parse(data_);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        if(error_callback != undefined){
                            error_callback();
                        }
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }
    static read_all(data, callback, error_callback, async){
        //데이터 형태 {"ticket_id":""};
        $.ajax({
            url:'/trainer/get_program_notice_list/',
            type:'GET',
            dataType : 'JSON',
            async: async,

            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },

            //보내기후 팝업창 닫기
            complete:function(){

            },

            //통신성공시 처리
            success:function(data){
                check_app_version(data.app_version);
                // let data = JSON.parse(data_);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        if(error_callback != undefined){
                            error_callback();
                        }
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },

            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }


    static delete(data, callback, error_callback){
        let auth_inspect = pass_inspector.program_notice_delete();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            // this.init();
            layer_popup.close_layer_popup();
            show_error_message({title:message});
            return false;
        }
        //데이터 형태 {"ticket_id":""};
        $.ajax({
            url:'/trainer/delete_program_notice_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        if(error_callback != undefined){
                            error_callback();
                        }
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static update(data, callback, error_callback){
        //데이터 형태 {"ticket_id":"", "ticket_name":"", "ticket_note":""};
        let auth_inspect = pass_inspector.program_notice_update();
        if(auth_inspect.barrier == BLOCKED){
            let message = `${auth_inspect.limit_type}`;
            // this.init();
            show_error_message({title:message});
            return false;
        }
        $.ajax({
            url:'/trainer/update_program_notice_info/',
            type:'POST',
            data: data,
            dataType : 'json',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                // let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        if(error_callback != undefined){
                            error_callback();
                        }
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }


}