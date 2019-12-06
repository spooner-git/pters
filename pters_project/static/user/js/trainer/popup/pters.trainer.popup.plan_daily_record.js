class Plan_daily_record{
    constructor(install_target, schedule_id, callback){
        this.target = {install : install_target};
        this.schedule_id = schedule_id;
        this.callback = callback;
        this.received_data;

        this.data = [];
        
        this.init();
    }

    init(){
        this.request_list(()=>{
            this.render();
        });
    }

    set_initial_data(data_){
        this.data = [];
        let data = data_.schedule_info[0];
        let schedule_type = data.schedule_type;
        if(schedule_type == 0){
            return;
        }

        if(schedule_type == 1){
            this.data.push(
                {schedule_id: data.schedule_id, schedule_name: data.member_name, state_cd: data.state_cd}
            );
        }else if(schedule_type == 2){
            let length = data.lecture_schedule_data.length;
            let data_ = data.lecture_schedule_data;
            for(let i=0; i<length; i++){
                this.data.push(
                    {schedule_id: data_[i].schedule_id, schedule_name: data_[i].member_name, state_cd: data_[i].state_cd}
                );
            }
        }
    }

    request_list (callback){
        Plan_func.read_plan(this.schedule_id, (data)=>{
            this.set_initial_data(data); // 초기값을 미리 셋팅한다.
            callback(data);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();plan_daily_record_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>일지</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:var(--font-highlight);font-weight: 500;"></span></span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list(){
        let html_to_join = [];
        let length = this.data.length;
        let button_style = {"padding":"0 10px", "display":"inline-block"};
        for(let i=0; i<length; i++){
            let schedule_name = this.data[i].schedule_name;
            let schedule_id = this.data[i].schedule_id;
            let state_cd = this.data[i].state_cd;
            let attend_icon = "";
            if(state_cd == SCHEDULE_FINISH){
                attend_icon = CImg.confirm(["green"], {"vertical-align":"middle", "margin-bottom":"3px"});
            }else if(state_cd == SCHEDULE_ABSENCE){
                attend_icon = CImg.x(["#ff0022"], {"vertical-align":"middle", "margin-bottom":"3px"});
            }

            // let html = `<li class="plan_daily_record_li">
            //                 <div class="plan_daily_record_member_row">
            //                     <div class="plan_daily_record_member_row_name">${schedule_name} ${attend_icon}</div>
            //                     <div class="plan_daily_record_member_row_tools">
            //                         ${CComponent.button(`daily_record_write_${schedule_id}`, "작성", button_style, ()=>{this.event_write(schedule_id, schedule_name);})}
            //                         ${CComponent.button(`daily_record_read_${schedule_id}`, "보기", button_style, ()=>{this.event_read(schedule_id, schedule_name);})}
            //                         ${CComponent.button(`daily_record_delete_${schedule_id}`, "삭제", button_style, ()=>{this.event_delete(schedule_id, schedule_name);})}
            //                     </div>
            //                 </div>
            //             </li>`;  
            let html = `<li class="plan_daily_record_li">
                            <div class="plan_daily_record_member_row">
                                <div class="plan_daily_record_member_row_name">${schedule_name} ${attend_icon}</div>
                                <div class="plan_daily_record_member_row_tools">
                                    ${CComponent.button(`daily_record_write_${schedule_id}`, CImg.pencil("", {"vertical-align":"middle", "margin-bottom":"3px;"}), button_style, ()=>{this.event_write(schedule_id, schedule_name);})}
                                </div>
                            </div>
                        </li>`;   


            html_to_join.push(html);
        }

        if(html_to_join.length == 0){
            html_to_join.push(CComponent.no_data_row('작성할 일지가 없습니다.'));
        }else{
            let schedule_id_array = this.data.map((el)=>{return el.schedule_id});
            let schedule_name_array = this.data.map((el)=>{return el.schedule_name});
            html_to_join.unshift(`<li class="plan_daily_record_li">
                                    <div class="plan_daily_record_member_row">
                                        <div class="plan_daily_record_member_row_name">일괄 작성</div>
                                        <div class="plan_daily_record_member_row_tools">
                                            ${CComponent.button(`daily_record_write_all`, CImg.pencil("", {"vertical-align":"middle", "margin-bottom":"3px;"}), button_style, ()=>{this.event_write_all(schedule_id_array, schedule_name_array);})}
                                        </div>
                                    </div>
                                </li>`)
        }

        return html_to_join.join('');
    }

    event_write_all(schedule_id_array, schedule_name_array){
        Plan_daily_record_func.write_article_all(schedule_id_array, schedule_name_array)
    }

    event_write(schedule_id, schedule_name){
        Plan_daily_record_func.write_artice(schedule_id, schedule_name, ()=>{
            this.init();
        });
    }

    event_read(schedule_id, schedule_name){
        Plan_daily_record_func.read_article(schedule_id, schedule_name);
    }

    event_delete(schedule_id, schedule_name, callback){
        Plan_daily_record_func.delete_article(schedule_id, schedule_name);
    }

    upper_html_caution(){
        let html = `<div style="padding:20px 10px;font-size:13px;color:var(--font-highlight)">
                        ※ 일지는 해당 회원님께서 확인하실 수 있습니다.
                    </div>`;
        return html;
    }

    
    send_data(){

    }


    upper_right_menu(){
        this.callback({member_schedule: this.data, schedule:this.schedule});
        layer_popup.close_layer_popup();
        this.clear();
    }
}


class Plan_daily_record_func{
    static write_article_all(schedule_id_array, schedule_name_array){
        let upperhtml = `<div style="padding:20px 10px;font-size:13px;">
                            <div style="color:var(--font-main);font-size:15px;">일지 작성 대상: ${schedule_name_array.join(", ")}</div>
                            <div style="color:var(--font-highlight)">일지는 해당 회원님께서 확인하실 수 있습니다.</div>
                            <div>이미지는 자동 리사이즈 되어 업로드 되며, 최대 2장까지 첨부 가능합니다.</div>
                            <div style="font-size:11px;">${pass_inspector.data.auth_ads.limit_type == "무료"
                                ? "(피터스 패스 이용 고객께서만 이미지를 첨부 하실 수 있습니다.)" 
                                : "" }
                            </div>
                        </div>`;
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, popup_style, null, ()=>{
                let external_data = {   
                                    title:"",
                                    content:"",
                                    schedule_id:null,
                                    is_member_view: 1,
                                    visibility:{title:HIDE},
                                    upper_html:upperhtml
                };

                board_writer = new BoardWriter_for_daily_record(`일괄 일지 작성`, '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                    //작성 중 첨부해서 서버에 업로드된 전체 이미지 목록 + 과거 올렸던 이미지 목록
                    let images_uploaded = data_written.images
                    
                    //업로드 된 이미지 중 작성 중 삭제한 이미지를 서버에서 지운다.
                    for(let image in images_uploaded){
                        if(data_written.content.match(image) != null){
                            continue;
                        }
                        //작성한 글 내용에 upload된 이미지가 없다면, 서버에서도 지운다.
                        let data = {"content_img_file_name":image};
                        Plan_daily_record_func.delete_image_from_server(data, ()=>{console.log("서버에서 지우자", image);});
                        delete images_uploaded[image];
                    }

                    //작성한 글을 서버 저장한다.
                    for(let i=0; i<schedule_id_array.length; i++){
                        //원래 작성되었던 글을 지운다. (이미지를 서버에서 날리기 위해)
                        Plan_daily_record_func.delete({"schedule_id":schedule_id_array[i]}, ()=>{
                            let data = {"schedule_id":schedule_id_array[i], "img_list":JSON.stringify(images_uploaded), "title":"",
                                    "contents":data_written.content, "is_member_view":data_written.is_member_view};
                            Plan_daily_record_func.create(data, ()=>{
                                if(i == schedule_id_array - 1){
                                    show_error_message("일괄 일지 등록이 정상적으로 완료 되었습니다.")
                                }
                            });
                        });
                    }
                });
        });
    }


    static write_artice(schedule_id, schedule_name, callback, error_callback){
        let upperhtml = `<div style="padding:20px 10px;font-size:13px;">
                            <div style="color:var(--font-highlight)">일지는 해당 회원님께서 확인하실 수 있습니다.</div>
                            <div>이미지는 자동 리사이즈 되어 업로드 되며, 최대 2장까지 첨부 가능합니다.</div>
                            <div style="font-size:11px;">${pass_inspector.data.auth_ads.limit_type == "무료"
                                ? "(피터스 패스 이용 고객께서만 이미지를 첨부 하실 수 있습니다.)" 
                                : "" }
                            </div>
                        </div>`;
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, popup_style, null, ()=>{
            Plan_daily_record_func.read({"schedule_id":schedule_id}, (data)=>{
                let content = Object.keys(data).length == 0 ? "" : data.daily_record_contents;
                let img_list = Object.keys(data).length == 0 ? null : data.daily_record_img_list;
                let external_data = {   
                                    title:"",
                                    content:content,
                                    schedule_id:schedule_id,
                                    is_member_view: 1,
                                    visibility:{title:HIDE},
                                    upper_html:upperhtml
                };

                board_writer = new BoardWriter_for_daily_record(`${schedule_name} 일지 작성`, '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                    //작성 중 첨부해서 서버에 업로드된 전체 이미지 목록 + 과거 올렸던 이미지 목록
                    let img_aleady_uploaded_before = img_list == null ? "" : JSON.parse(img_list);
                    let images_uploaded = img_list == null ? data_written.images  : {...data_written.images, ...img_aleady_uploaded_before};
                    
                    //업로드 된 이미지 중 작성 중 삭제한 이미지를 서버에서 지운다.
                    for(let image in images_uploaded){
                        if(data_written.content.match(image) != null){
                            continue;
                        }
                        //작성한 글 내용에 upload된 이미지가 없다면, 서버에서도 지운다.
                        let data = {"content_img_file_name":image};
                        Plan_daily_record_func.delete_image_from_server(data, ()=>{console.log("서버에서 지우자", image);});
                        delete images_uploaded[image];
                    }

                    //작성한 글을 서버 저장한다.
                    let data = {"schedule_id":data_written.schedule_id, "img_list":JSON.stringify(images_uploaded), "title":"",
                                "contents":data_written.content, "is_member_view":data_written.is_member_view};
                    Plan_daily_record_func.create(data, ()=>{
                        // this.init();
                        if(callback != undefined){
                            callback(); 
                        } 
                    }, ()=>{
                        if(error_callback != undefined){
                            error_callback(); 
                        } 
                    });
                });
            });
        });
    }

    static read_article(schedule_id, schedule_name){
        Plan_daily_record_func.read({"schedule_id":schedule_id}, (data)=>{
            let daily_record_id = Object.keys(data).length == 0 ? null : data.daily_record_id;
            let daily_record_title = Object.keys(data).length == 0 ? null : data.daily_record_title;
            let daily_record_content = Object.keys(data).length == 0 ? null : data.daily_record_contents;
            let daily_record_is_member_view = Object.keys(data).length == 0 ? null : data.daily_record_is_member_view;


            let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_BOTTOM;
            layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_READER, 100, popup_style, null, ()=>{
                let data = {
                    title:daily_record_title, content:daily_record_content, date:null
                };
                board_reader = new BoardReader(`${schedule_name} 일지`, '.popup_board_reader', "board_reader", data);
            });
        });
    }

    static delete_article(schedule_id, schedule_name, callback, error_callback){
        show_user_confirm(`정말 [${schedule_name}] 일지를 삭제 하시겠습니까?`, ()=>{
            layer_popup.close_layer_popup();
            Plan_daily_record_func.delete({"schedule_id":schedule_id}, ()=>{
                show_error_message("정상적으로 일지가 삭제 되었습니다.");
                if(callback != undefined){
                    callback();
                }
            }, ()=>{
                if(error_callback != undefined){
                    error_callback(); 
                }
            });
        });
    }

    static create(data, callback, error_callback){
        // {"schedule_id":"", "title":"", "contents":"", "is_member_view":""}
        $.ajax({
            url:"/schedule/add_daily_record_info/",
            type:'POST',
            data: data,
            dataType : 'json',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
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

    static read(data, callback, error_callback){
        // {"schedule_id":""}
        $.ajax({
            url:"/schedule/get_daily_record_info/",
            type:'GET',
            data: data,
            dataType : 'json',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
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

    static update(data, callback, error_callback){
        // {"schedule_id":"", "title":"", "contents":"", "is_member_view":""}
        $.ajax({
            url:"/schedule/update_daily_record_info/",
            type:'POST',
            data: data,
            dataType : 'json',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
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
        // {"daily_record_id":""}
        $.ajax({
            url:"/schedule/delete_daily_record_info/",
            type:'POST',
            data: data,
            dataType : 'json',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
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

    static upload_image_to_server(data, callback, error_callback){
        // {"content_img_file":"", "content_img_file_name":"", "schedule_id":""}
        $.ajax({
            url:"/schedule/update_daily_record_content_img/",
            type:'POST',
            data: data,
            dataType : 'json',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
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

    static delete_image_from_server(data, callback, error_callback){
        // {"content_img_file_name":""}
        $.ajax({
            url:"/schedule/delete_daily_record_content_img/",
            type:'POST',
            data: data,
            dataType : 'json',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        console.log(data.messageArray)
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


