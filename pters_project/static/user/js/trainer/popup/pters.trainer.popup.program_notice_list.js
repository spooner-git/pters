class ProgramNotice_list {
    constructor(install_target, instance){
        this.target = {install: install_target, toolbox:'section_program_notice_toolbox', content:'section_program_notice_content'};
        this.page_name = "program_notice";
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
        this.set_initial_data();
    }

    set_initial_data (){
        // this.render_loading_image();
        ProgramNotice_func.read_all({}, (data)=>{
            this.data.all = data;
            // this.notice_list = data;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        }, ()=>{this.data_sending_now = false;layer_popup.close_layer_popup();program_notice_list_popup.clear();});
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();program_notice_list_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center">프로그램 공지사항</span>`;
        let top_right = `<span class="icon_right">
                            <span class=".add_program_notice" onclick="${this.instance}.event_add_new();">
                                ${CImg.plus("", {"vertical-align":"middle"})}
                            </span>
                        </span>`;
        let content =   `<section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_program_notice_list .wrapper_top').style.border = 0;
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
        // let options_padding_top_bottom = 16;
        // let button_height = 52;
        let title = "프로그램 공지사항";
        let html = `<div class="program_notice_upper_box">
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
                `<p style="font-size:14px;">데이터가 없습니다.</p>`
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
        let target = PROGRAM_BOARD_TARGET[data.program_notice_to_member_type_cd];
        let reg_dt = data.program_notice_reg_dt;
        let mod_dt = data.program_notice_mod_dt;
        let reg_member_name = data.program_notice_reg_member_name;
        let reg_date = reg_dt.split(' ')[0];
        let hits = data.program_notice_hits; //조회수
        let use = data.program_notice_use; //공개여부


        let html = `<article id="program_notice_article_${id}" class="program_notice_article">
                        <div style="display:table; width:100%;">
                            <div style="display:table-row;">
                                <div class="program_notice_article_id" style="width:5%;display:table-cell;vertical-align:middle;">
                                    ${numbering}
                                </div>
                                <div style="width:80%;display:table-cell;padding-left:10px;">
                                    <div class="program_notice_article_upper">
                                        <div class="program_notice_article_title">${title}</div>
                                    </div>
                                    <div class="program_notice_article_bottom">
                                        <div class="program_notice_article_reg_date">등록일:${reg_date}, 조회수:${hits}</div>
                                    </div>
                                </div>
                                <div style="width:10%;display:table-cell;vertical-align:middle;">
                                        <div class="program_notice_article_use" style="color:${PROGRAM_BOARD_USE[use].color}">${PROGRAM_BOARD_USE[use].text}</div>
                                </div>
                            </div>
                        </div>
                    </article>`;
        $(document).off('click', `#program_notice_article_${id}`).on('click', `#program_notice_article_${id}`, function(){
            // let program_notice_contents =  $(this).find(".program_notice_contents");
            // if(program_notice_contents.css('display') == 'none'){
            //     program_notice_contents.show();
            // }else{
            //     program_notice_contents.hide();
            // }
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, POPUP_FROM_BOTTOM, null, ()=>{
                let external_data = {   title:title, content:content, id:id, reg_dt:reg_dt, mod_dt:mod_dt,reg_member_name:reg_member_name,
                                        category:[
                                            {id:"use", title:"공개 여부", data: {text:["공개", "비공개"], value:[ON, OFF]} }
                                        ],
                                        category_selected:{
                                            use:{text:[PROGRAM_BOARD_USE[use].text], value:[use]}
                                        },
                                        new_check:false
                };
                board_writer = new BoardWriter("공지 수정", '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                    let data = {"program_notice_id":data_written.id, "notice_type_cd":NOTICE, "title":data_written.title,
                                "contents":data_written.content, "to_member_type_cd":'trainee',
                                "use":data_written.category_selected.use.value[0]};
                    ProgramNotice_func.update(data, ()=>{
                        program_notice_list_popup.init();
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
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    event_add_new(){
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, POPUP_FROM_RIGHT, null, ()=>{
            let external_data = {   
                                        category:[
                                            {id:"use", title:"공개 여부", data: {text:["공개", "비공개"], value:[ON, OFF]} }
                                        ],
                                        category_selected:{
                                            use:{text:[], value:[]}
                                        },
                                        new_check:true
            };
            board_writer = new BoardWriter("새 공지사항", '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                let data = {"notice_type_cd": NOTICE, "title":data_written.title,
                            "contents":data_written.content, "to_member_type_cd":'trainee',
                            "use":data_written.category_selected.use.value[0]};
                ProgramNotice_func.create(data, ()=>{
                    this.init();
                });
            });
        });
    }

}


