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

        this.time_interval;
    }

    init (){
        if(current_page != this.page_name){
            return false;
        }
        this.render();
        this.set_initail_data();
    }

    set_initail_data(){
        this.render_loading_image();
        Notice_func.read_all((data)=>{
            this.data.all = data;
            this.render_content();
            console.log(data);
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
                <div style="font-size:12px;color:#858282">사용자 데이터를 불러오고 있습니다.</div>
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
                        <div style="display:inline-block;width:auto;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <div style="display:inline-block;">공지사항 관리</div>
                        </div>
                    </div>`;
        return html;
    }

    dom_assembly_content(){
        
        let html_to_join = [];
        for(let item in this.data.all){
            let article = this.dom_row_notice_article(this.data.all[item]);
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

    dom_row_notice_article(data){
        let type = data.notice_type_cd;
        if(type != NOTICE){
            return "";
        }
        
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
                            <div class="notice_article_id">${id}</div>
                            <div class="notice_article_title">${title}</div>
                            <div class="notice_article_hits">조회수 ${hits}</div>
                        </div>
                        <div class="notice_article_bottom">
                            <div class="notice_article_use" style="color:${NOTICE_USE[use].color}">${NOTICE_USE[use].text}</div>
                            <div class="notice_article_target">${target}</div>
                            <div class="notice_article_reg_date">${reg_dt.split('T')[0]}  ${reg_dt.split('T')[1]}</div>
                        </div>
                        <div class="notice_contents" style="display:none;">
                            <div>
                                ${content}
                            </div>
                            <div style="text-align:right;margin-top:10px;">
                                ${CComponent.button ("notice_modify_"+id, "수정", {"border":"1px solid #e8e8e8", "padding":"12px","display":"inline-block", "width":"100px"}, ()=>{
                                        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_NOTICE_DETAIL, 100, POPUP_FROM_PAGE, null, ()=>{
                                            notice_detail_popup = new notice_detail('.popup_notice_detail', id, this.data);});
                                    })
                                }
                                ${CComponent.button ("notice_delete_"+id, "삭제", {"border":"1px solid #e8e8e8", "padding":"12px","display":"inline-block", "width":"100px"}, ()=>{
                                        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_NOTICE_DETAIL, 100, POPUP_FROM_PAGE, null, ()=>{
                                            notice_detail_popup = new notice_detail('.popup_notice_detail', id, this.data);});
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
}

