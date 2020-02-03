class ProgramBoard {
    constructor(install_target, instance){
        this.target = {install: install_target, toolbox:'section_program_board_toolbox', content:'section_program_board_content'};
        this.page_name = "program_board";
        this.instance = instance;
        this.form_id = 'id_program_board_form';

        let d = new Date();
        this.current_year = d.getFullYear();
        this.current_month = d.getMonth()+1;
        this.current_date = d.getDate();
        this.today = DateRobot.to_yyyymmdd(this.current_year, this.current_month, this.current_date);
        this.board_list = null;
        this.data = {
            all:null
        };

        this.sort = "all";

        this.time_interval;
        this.init();
    }

    init(){
        this.set_initial_data();
    }

    set_initial_data (){
        // this.render_loading_image();
        ProgramBoard_func.read_board_list((data)=>{
            this.board_list = data;
            console.log(this.board_list);
            console.log(this.board_list.length);
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
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();program_board_list_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right">
                                <!--<span class=".search_program_board" onclick="${this.instance}.search_tool_visible(event, this)">-->
                                <span class=".search_program_board">
                                    ${CImg.search("", {"vertical-align":"middle"})}
                                </span>
                                <span class=".add_program_board" onclick="program_board_list_popup.event_add_new();
                                // layer_popup.open_layer_popup(${POPUP_BASIC}, '${POPUP_ADDRESS_LECTURE_ADD}', 100, ${POPUP_FROM_BOTTOM}, null, ()=>{
//                                    lecture_add_popup = new Lecture_add('.popup_lecture_add');});
                                    ">
                                    ${CImg.plus("", {"vertical-align":"middle"})}
                                </span>
                        </span>`;
        let content =   `<div class="search_bar"></div>
                        <section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        // let content =   `<div class="search_bar"></div>
        //                 <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_program_board_list .wrapper_top').style.border = 0;
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

    dom_row_toolbox(){
        let options_padding_top_bottom = 16;
        let button_height = 52;
        let title = "공지사항 관리 ";
        let html = `<div class="program_board_upper_box">
                        <div style="display:inline-block;width:200px;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <div style="display:inline-block; color:var(--font-highlight); font-weight:900;"></div>
                        </div>
                    </div>`;
        return html;
    }

    button_sort(){
        let id = "button_sort";
        let title;
        if(this.sort == "all"){
            title = "전체" + CImg.arrow_expand("", {"width":"17px", "height":"17px", "vertical-align":"middle"});
        }else if(this.sort == "program_board"){
            title = "공지만" + CImg.arrow_expand("", {"width":"17px", "height":"17px", "vertical-align":"middle"});
        }
        else if(this.sort == "update_history"){
            title = "업데이트 내역만" + CImg.arrow_expand("", {"width":"17px", "height":"17px", "vertical-align":"middle"});
        }
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
        // for(let item in this.data.all){
        //     let type = this.data.all[item].trainer__type_cd;
        //     if(type != PROGRAM_BOARD && type != PROGRAM_BOARD_UPDATE_HISTORY){
        //         continue;
        //     }
        //
        //     if(this.sort == "program_board"){
        //         if(type != PROGRAM_BOARD){
        //             continue;
        //         }
        //     }else if(this.sort == "update_history"){
        //         if(type != PROGRAM_BOARD_UPDATE_HISTORY){
        //             continue;
        //         }
        //     }
        //
        //     let article = this.dom_row_program_board_article(numbering, this.data.all[item]);
        //     numbering++;
        //     html_to_join.push(article);
        // }
        for(let item in this.board_list){

        }
        if(html_to_join.length == 0){
            html_to_join.push(
                `<p style="font-size:14px;">데이터가 없습니다.</p>`
            );
        }

        let html = '<div class="program_board_article_wrapper">' + html_to_join.join('') + '</div>';


        return html;
    }

    dom_row_program_board_article(numbering, data){

    }

    dom_row_program_board_article(numbering, data){
        let type = data.program_board_type_cd;

        let id = data.program_board_id;
        let title = data.program_board_title;
        let content = data.program_board_contents;
        let target = PROGRAM_BOARD_TARGET[data.program_board_to_member_type_cd];
        let reg_dt = data.program_board_reg_dt;
        let mod_dt = data.program_board_mod_dt;
        let hits = data.program_board_hits; //조회수
        let use = data.program_board_use; //공개여부


        let html = `<article id="program_board_article_${id}" class="program_board_article">
                        <div class="program_board_article_upper">
                            <div class="program_board_article_id">${numbering}</div>
                            <div class="program_board_article_title">${title}</div>
                            <div class="program_board_article_hits">조회수 ${hits}</div>
                        </div>
                        <div class="program_board_article_bottom">
                            <div class=program_board_article_type">${PROGRAM_BOARD_TYPE[type]}</div>
                            <div class="program_board_article_use" style="color:${PROGRAM_BOARD_USE[use].color}">${PROGRAM_BOARD_USE[use].text}</div>
                            <div class="program_board_article_target">${target}</div>
                            <div class="program_board_article_reg_date">${mod_dt.split('T')[0]}  ${mod_dt.split('T')[1].split('.')[0]}</div>
                        </div>
                        <div class="program_board_contents" style="display:none;">
                            <div>
                                ${content}
                            </div>
                            <div style="text-align:right;margin-top:10px;">
                                ${CComponent.button ("program_board_modify_"+id, "수정", {"border":"var(--border-article)", "padding":"12px","display":"inline-block", "width":"100px"}, ()=>{

                                        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, POPUP_FROM_PAGE, null, ()=>{
                                            let external_data = {   title:title, content:content, id:id,
                                                                    category:[
                                                                        {id:"open", title:"공개범위", data: {text:["전체", "강사", "회원"], value:["ALL", "trainer", "trainee"]} },
                                                                        {id:"type", title:"분류", data: {text:["공지", "업데이트 내역"], value:[PROGRAM_BOARD, PROGRAM_BOARD_UPDATE_HISTORY]} },
                                                                        {id:"use", title:"상태", data: {text:["공개", "비공개"], value:[ON, OFF]} }
                                                                    ],
                                                                    category_selected:{
                                                                        open:{text:[target], value:[data.program_board_to_member_type_cd]},
                                                                        type:{text:[PROGRAM_BOARD_TYPE[type] ], value:[type]},
                                                                        use:{text:[PROGRAM_BOARD_USE[use].text], value:[use]}
                                                                    }
                                            };
                                            board_writer = new BoardWriter("공지 수정", '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                                                let data = {"program_board_id":data_written.id, "program_board_type_cd":data_written.category_selected.type.value[0], "title":data_written.title, 
                                                            "contents":data_written.content, "to_member_type_cd":data_written.category_selected.open.value[0],
                                                            "use":data_written.category_selected.use.value[0]};
                                                ProgramBoard_func.update(data, ()=>{
                                                    this.init_content();
                                                });
                                            });

                                        });
                                    })
                                }
                                ${
                                    CComponent.button ("program_board_delete_"+id, "삭제", {"border":"var(--border-article)", "padding":"12px", "display":"inline-block", "width":"100px"}, ()=>{
                                        show_user_confirm(`공지 "${numbering}" 번 글을 완전 삭제 하시겠습니까? <br> 다시 복구할 수 없습니다.`, ()=>{
                                            ProgramBoard_func.delete({"program_board_id":id}, ()=>{
                                                try{
                                                    this.init_content();
                                                }catch(e){}
                                                layer_popup.all_close_layer_popup();
                                            });
                                        });
                                    })
                                }
                            </div>
                        </div>
                    </article>`;
        $(document).off('click', `#program_board_article_${id}`).on('click', `#program_board_article_${id}`, function(){
            let program_board_contents =  $(this).find(".program_board_contents");
            if(program_board_contents.css('display') == 'none'){
                program_board_contents.show();
            }else{
                program_board_contents.hide();
            }
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
            program_board:{text:"공지만", callback:()=>{
                this.sort = "program_board";
                this.render();
                layer_popup.close_layer_popup();
            }},
            update_history:{text:"업데이트 내역만", callback:()=>{
                this.sort = "update_history";
                this.render();
                layer_popup.close_layer_popup();
            }},
        };
        let options_padding_top_bottom = 16;
        let button_height = 8 + 8 + 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    event_add_new(){
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, POPUP_FROM_RIGHT, null, ()=>{
            let external_data = {   
                                        category:[
                                            {id:"open", title:"공개범위", data: {text:["전체", "강사", "회원"], value:["ALL", "trainer", "trainee"]} },
                                            {id:"type", title:"분류", data: {text:["공지", "업데이트 내역"], value:[PROGRAM_BOARD, PROGRAM_BOARD_UPDATE_HISTORY]} },
                                            {id:"use", title:"상태", data: {text:["공개", "비공개"], value:[ON, OFF]} }
                                        ],
                                        category_selected:{
                                            open:{text:[], value:[]},
                                            type:{text:[], value:[]},
                                            use:{text:[], value:[]}
                                        }
            };
            board_writer = new BoardWriter("새 공지사항", '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                let data = {"program_board_type_cd":data_written.category_selected.type.value[0], "title":data_written.title,
                            "contents":data_written.content, "to_member_type_cd":data_written.category_selected.open.value[0],
                            "use":data_written.category_selected.use.value[0]};
                ProgramBoard_func.create(data, ()=>{
                    this.init();
                });
            });
        });
    }

}



class ProgramBoard_func{
    static read_board_list(callback){
        $.ajax({
            url:'/trainer/get_program_board_list/',
            type:'GET',
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings) {
                
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
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
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    static create(data, callback){
        $.ajax({
            url:'/admin_spooner/add_board_info/',
            type:'POST',
            data: data,
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings){
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
                // let data = JSON.parse(received_data);
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }
    static update(data, callback){
        $.ajax({
            url:'/admin_spooner/update_board_info/',
            type:'POST',
            data: data,
            dataType : 'JSON',

            beforeSend:function(xhr, settings){
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
                // let data = JSON.parse(received_data);
                if(callback != undefined){
                    callback(data);
                }
            },

            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }

    static delete(data, callback){
        $.ajax({
            url:'/admin_spooner/delete_board_info/',
            type:'POST',
            data: data,
            dataType : 'JSON',

            beforeSend:function(xhr, settings){
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
                // let data = JSON.parse(received_data);
                if(callback != undefined){
                    callback(data);
                }
            },

            //통신 실패시 처리
            error:function(){
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                // location.reload();
            }
        });
    }
}

