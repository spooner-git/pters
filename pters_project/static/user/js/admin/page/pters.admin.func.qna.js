class Qna {
    constructor (targetHTML, instance){
        this.target = {install:targetHTML, toolbox:'section_admin_qna_toolbox', content:'section_admin_qna_content'};
        this.page_name = "qna";
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
        Qna_func.read_all((data)=>{
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
        let html = `<div class="qna_upper_box">
                        <div style="display:inline-block;width:auto;font-size:22px;font-weight:bold;color:#3b3b3b; letter-spacing: -1px; height:28px;">
                            <div style="display:inline-block;">문의(Q&A) 관리</div>
                        </div>
                    </div>`;
        return html;
    }

    dom_assembly_content(){
        
        let html_to_join = [];
        for(let item in this.data.all){
            let article = this.dom_row_qna_article(this.data.all[item]);
            html_to_join.push(article);
        }
        if(html_to_join.length == 0){
            html_to_join.push(
                `<p style="font-size:14px;">데이터가 없습니다.</p>`
            );
        }

        let html = '<div class="qa_article_wrapper">' + html_to_join.join('') + '</div>';


        return html;
    }

    dom_row_qna_article(data){
        let qa_id = data.qa_id;
        let qa_type = data.qa_type_cd;
        let qa_title = data.qa_title;
        let qa_contents = data.qa_contents;
        let member_name = data.qa_member_name; 
        let member_email = data.qa_email_address;
        let qa_reg_date = data.qa_reg_dt;
        let qa_status = data.qa_status_type_cd;
        let alert_style = qa_status == "QA_WAIT" ? "style='background-color:#fe4e6513'" : "";
        let alert_text_style = qa_status == "QA_WAIT" ? "style='color:#fe4e65;font-weight:bold'" : "";
        let html = `<article id="qa_article_${qa_id}" class="qa_article" ${alert_style}>
                        <div class="qa_article_upper">
                            <div class="qa_article_id">${qa_id}</div>
                            <div class="qa_article_title">${qa_title}</div>
                        </div>
                        <div class="qa_article_bottom">
                            <div class="qa_article_type">${qa_type}</div>
                            <div class="qa_article_member_name">${member_name}</div>
                            <div class="qa_article_reg_date">${qa_reg_date.split('T')[0]}  ${qa_reg_date.split('T')[1]}</div>
                            <div class="qa_article_status" ${alert_text_style}>${QA_STATUS[qa_status]}</div>
                        </div>
                        <div class="qa_contents" style="display:none;">
                            <div>
                                <p style="margin-top:0">${member_email}</p>
                                ${qa_contents}
                            </div>
                            <div>
                                <div>${CComponent.button ("qa_answer_"+qa_id, "답변", {"border":"1px solid #e8e8e8", "padding":"12px"}, ()=>{
                                        let data = {id:qa_id, title:qa_title, content:qa_contents, type:qa_type, name: member_name, email: member_email, reg_date: qa_reg_date, status: qa_status};
                                        this.event_open_board_writer(data);
                                    })
                                    }
                                </div>
                            </div>
                        </div>
                    </article>`;
        $(document).off('click', `#qa_article_${qa_id}`).on('click', `#qa_article_${qa_id}`, function(){
            let qa_contents =  $(this).find(".qa_contents");
            if(qa_contents.css('display') == 'none'){
                qa_contents.show();
            }else{
                qa_contents.hide();
            }
        });
        
        return html;
    }

    event_open_board_writer(data){
        let style_parent = "display:flex;font-size:14px;padding:5px 0";
        let style_child_1 = "flex-basis:80px;font-weight:bold;";
        let style_child_2 = "flex:1 1 0";
        let upper_html_of_board_writer = 
        `<div style="padding:16px;">
        <div style="${style_parent}"><div style="${style_child_1}">DB ID</div><div style="${style_child_2}">${data.id}</div></div>
        <div style="${style_parent}"><div style="${style_child_1}">회원명</div><div style="${style_child_2}">${data.name} (${data.email})</div></div>
        <div style="${style_parent}"><div style="${style_child_1}">유형</div><div style="${style_child_2}">${data.type}</div></div>
        <div style="${style_parent}"><div style="${style_child_1}">제목</div><div style="${style_child_2}">${data.title}</div></div>
        <div style="${style_parent}"><div style="${style_child_1}">내용</div><div style="${style_child_2}">${data.content}</div></div>
        </div>
        `;

        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, POPUP_FROM_PAGE, null, ()=>{
            

            let data_for_answer = {qa_id: data.id};
            Qna_func.read_answer(data_for_answer, (answer)=>{
                console.log(answer);
                let external_data = {       
                                        upper_html:upper_html_of_board_writer, content: answer,
                                        id:data.id,
                                        visibility:{title:HIDE},
                                        category:[
                                            {id:"status", title:"상태 변경", data: {text:["완료", "대기"], value:["QA_COMPLETE", "QA_WAIT"]} }
                                        ],
                                        category_selected:{
                                            status:{text:[QA_STATUS[data.status]], value:[data.status]},
                                            type:{text:['Q&A 답변'], value:['QNA_COMMENT']}
                                        }
                };

                if(answer != null){ //새로 답변을 등록할때
                    board_writer = new BoardWriter("QnA", '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                        let data = {"qa_id":data_written.id, "status_type_cd":data_written.category_selected.status.value[0], "title":data_written.title,
                                    "contents":data_written.content};
                        Qna_func.create(data, ()=>{
                            this.init();
                        });
                    });
                }else{ // 답변을 수정할 때
                    board_writer = new BoardWriter("QnA", '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                        let data = {"qa_comment_id":data_written.id, "status_type_cd":data_written.category_selected.status.value[0], "title":data_written.title,
                                    "contents":data_written.content};
                        Qna_func.update(data, ()=>{
                            this.init();
                        });
                    });
                }
            });


            
        });
    }


}



class Qna_func{
    static read_all(callback){
        $.ajax({
            url:'/admin_spooner/get_qa_all/',
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

    static read_answer(data, callback){
        $.ajax({
            url:'/board/get_qa_comment_list/',
            data:data,
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

    static create(data, callback){
        $.ajax({
            url:'/admin_spooner/add_qa_comment_info/',
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
            url:'/admin_spooner/update_qa_comment_info/',
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

