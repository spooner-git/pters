class Notice {
    constructor (targetHTML, instance){
        this.target = {install:targetHTML, toolbox:'section_admin_notice_toolbox', content:'section_admin_notice_content'};
        this.page_name = "notice";
        this.instance = instance;

        let d = new Date();
        this.current_year = d.getFullYear();
        this.current_month = d.getMonth()+1;
        this.current_date = d.getDate();
        this.today = DateRobot.to_yyyymmdd(this.current_year, this.current_month, this.current_date);

        this.data = {
            all:null
        };

        this.sort = "all";

        this.time_interval;
    }

    init (){
        if(current_page != this.page_name){
            return false;
        }
        this.render();
        this.set_initail_data();
    }

    init_content(){
        Notice_func.read_all((data)=>{
            this.data.all = data;
            this.render_content();
        });
    }

    set_initail_data(){
        this.render_loading_image();
        Notice_func.read_all((data)=>{
            this.data.all = data;
            this.render_content();
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        // let top_left = `<span class="icon_left"></span>`;
        // let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">관리자 홈</span></span>`;
        // let top_right = `<span class="icon_right"></span>`;
        let toolbox_style_for_page = `position:sticky;position:-webkit-sticky;height:auto;z-index:10;width:100%;top:0;`;
        let content_style_for_page = `top:unset;left:unset;background-color:unset;position:relative;min-height:667px; padding-top:6px; padding-bottom:20px;`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="${toolbox_style_for_page}">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content" style="${content_style_for_page}">${this.dom_assembly_content()}</section>`;
        
        // let html = PopupBase.base(top_left, top_center, top_right, content, "");
        let html = content;

        document.querySelector(this.target.install).innerHTML = html;
        // document.querySelector('.popup_member_view .wrapper_top').style.border = 0;
        // PopupBase.top_menu_effect(this.target.install);
        // func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    render_loading_image(){
        document.getElementById(this.target.content).innerHTML = 
            `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;">
                <img src="/static/common/loading.svg">
                <div style="font-size:12px;color:var(--font-sub-normal)">사용자 데이터를 불러오고 있습니다.</div>
            </div>`;
    }

    render_toolbox(){
        document.getElementById(this.target.toolbox).innerHTML = this.dom_assembly_toolbox();
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }

    dom_assembly_toolbox(){
        let html = `<div class="notice_upper_box">
                        <div style="display:inline-block;width:auto;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                            <div style="display:inline-block;">
                                공지 & 업데이트 내역
                            </div>
                        </div>
                        ${this.button_sort()}
                        <div style="float:right;width:25px;height:25px;background-image:url('/static/common/icon/icon_plus_pink.png');background-size:contain;" onclick="${this.instance}.event_add_new()">
                        </div>
                    </div>`;
        return html;
    }

    button_sort(){
        let id = "button_sort";
        let title;
        if(this.sort == "all"){
            title = "전체" + CImg.arrow_expand("", {"width":"17px", "height":"17px", "vertical-align":"middle"});
        }else if(this.sort == "notice"){
            title = "공지만" + CImg.arrow_expand("", {"width":"17px", "height":"17px", "vertical-align":"middle"});
        }else if(this.sort == "update_history"){
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
        for(let item in this.data.all){
            let type = this.data.all[item].notice_type_cd;
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

            let article = this.dom_row_notice_article(numbering, this.data.all[item]);
            numbering++;
            html_to_join.push(article);
        }
        if(html_to_join.length == 0){
            html_to_join.push(
                `<p style="font-size:14px;">데이터가 없습니다.</p>`
            );
        }

        let html = '<div class="notice_article_wrapper">' + html_to_join.join('') + '</div>';


        return html;
    }

    dom_row_notice_article(numbering, data){
        let type = data.notice_type_cd;

        let id = data.notice_id;
        let title = data.notice_title;
        let content = data.notice_contents;
        let target = NOTICE_TARGET[data.notice_to_member_type_cd];
        let reg_dt = data.notice_reg_dt;
        let mod_dt = data.notice_mod_dt;
        let hits = data.notice_hits; //조회수
        let use = data.notice_use; //공개여부


        let html = `<article id="notice_article_${id}" class="notice_article">
                        <div class="notice_article_upper">
                            <div class="notice_article_id">${numbering}</div>
                            <div class="notice_article_title">${title}</div>
                            <div class="notice_article_hits">조회수 ${hits}</div>
                        </div>
                        <div class="notice_article_bottom">
                            <div class="notice_article_type">${NOTICE_TYPE[type]}</div>
                            <div class="notice_article_use" style="color:${NOTICE_USE[use].color}">${NOTICE_USE[use].text}</div>
                            <div class="notice_article_target">${target}</div>
                            <div class="notice_article_reg_date">${mod_dt.split('T')[0]}  ${mod_dt.split('T')[1].split('.')[0]}</div>
                        </div>
                        <div class="notice_contents" style="display:none;">
                            <div>
                                ${content}
                            </div>
                            <div style="text-align:right;margin-top:10px;">
                                ${CComponent.button ("notice_modify_"+id, "수정", {"border":"var(--border-article)", "padding":"12px","display":"inline-block", "width":"100px"}, ()=>{

                                        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, POPUP_FROM_PAGE, null, ()=>{
                                            let external_data = {   title:title, content:content, id:id,
                                                                    category:[
                                                                        {id:"open", title:"공개범위", data: {text:["전체", "강사", "회원"], value:["ALL", "trainer", "trainee"]} },
                                                                        {id:"type", title:"분류", data: {text:["공지", "업데이트 내역"], value:[NOTICE, NOTICE_UPDATE_HISTORY]} },
                                                                        {id:"use", title:"상태", data: {text:["공개", "비공개"], value:[ON, OFF]} }
                                                                    ],
                                                                    category_selected:{
                                                                        open:{text:[target], value:[data.notice_to_member_type_cd]},
                                                                        type:{text:[NOTICE_TYPE[type] ], value:[type]},
                                                                        use:{text:[NOTICE_USE[use].text], value:[use]}
                                                                    }
                                            };
                                            board_writer = new BoardWriter("공지 수정", '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                                                let data = {"notice_id":data_written.id, "notice_type_cd":data_written.category_selected.type.value[0], "title":data_written.title, 
                                                            "contents":data_written.content, "to_member_type_cd":data_written.category_selected.open.value[0],
                                                            "use":data_written.category_selected.use.value[0]};
                                                Notice_func.update(data, ()=>{
                                                    this.init_content();
                                                });
                                            });

                                        });
                                    })
                                }
                                ${
                                    CComponent.button ("notice_delete_"+id, "삭제", {"border":"var(--border-article)", "padding":"12px", "display":"inline-block", "width":"100px"}, ()=>{
                                        show_user_confirm(`공지 "${numbering}" 번 글을 완전 삭제 하시겠습니까? <br> 다시 복구할 수 없습니다.`, ()=>{
                                            Notice_func.delete({"notice_id":id}, ()=>{
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
        $(document).off('click', `#notice_article_${id}`).on('click', `#notice_article_${id}`, function(){
            let notice_contents =  $(this).find(".notice_contents");
            if(notice_contents.css('display') == 'none'){
                notice_contents.show();
            }else{
                notice_contents.hide();
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
            notice:{text:"공지만", callback:()=>{ 
                this.sort = "notice";
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
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, POPUP_FROM_PAGE, null, ()=>{
            let external_data = {   
                                        category:[
                                            {id:"open", title:"공개범위", data: {text:["전체", "강사", "회원"], value:["ALL", "trainer", "trainee"]} },
                                            {id:"type", title:"분류", data: {text:["공지", "업데이트 내역"], value:[NOTICE, NOTICE_UPDATE_HISTORY]} },
                                            {id:"use", title:"상태", data: {text:["공개", "비공개"], value:[ON, OFF]} }
                                        ],
                                        category_selected:{
                                            open:{text:[], value:[]},
                                            type:{text:[], value:[]},
                                            use:{text:[], value:[]}
                                        }
            };
            board_writer = new BoardWriter("새 공지사항", '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                let data = {"notice_type_cd":data_written.category_selected.type.value[0], "title":data_written.title, 
                            "contents":data_written.content, "to_member_type_cd":data_written.category_selected.open.value[0],
                            "use":data_written.category_selected.use.value[0]};
                Notice_func.create(data, ()=>{
                    this.init();
                });
            });
        });
    }

}



class Notice_func{
    static read_all(callback){
        $.ajax({
            url:'/admin_spooner/get_notice_all/',
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
            url:'/admin_spooner/add_notice_info/',
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
            url:'/admin_spooner/update_notice_info/',
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
            url:'/admin_spooner/delete_notice_info/',
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

