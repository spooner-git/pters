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

            let html = `<li class="plan_daily_record_li">
                            <div class="plan_daily_record_member_row">
                                <div class="plan_daily_record_member_row_name">${schedule_name}</div>
                                <div class="plan_daily_record_member_row_tools">
                                    ${CComponent.button(`daily_record_write_${schedule_id}`, "작성", button_style, ()=>{this.event_write(schedule_id, schedule_name);})}
                                    ${CComponent.button(`daily_record_edit_${schedule_id}`, "편집", button_style, ()=>{this.event_edit(schedule_id, schedule_name);})}
                                    ${CComponent.button(`daily_record_delete_${schedule_id}`, "삭제", button_style, ()=>{this.event_delete(schedule_id, schedule_name);})}
                                </div>
                            </div>
                        </li>`;   


            html_to_join.push(html);
        }
        if(html_to_join.length == 0){
            html_to_join.push(CComponent.no_data_row('작성할 일지가 없습니다.'));
        }

        return html_to_join.join('');
    }

    event_write(schedule_id, schedule_name){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_BOARD_WRITER, 100, popup_style, null, ()=>{
            let external_data = {   title:"",
                                    id:schedule_id,
                                    visibility:{title:HIDE},
                                    upper_html:this.upper_html_caution()
            };
            board_writer = new BoardWriter(`${schedule_name} 일지 작성`, '.popup_board_writer', 'board_writer', external_data, (data_written)=>{
                let data = {"schedule_id":data_written.id, "title":data_written.title,
                            "contents":data_written.content};
                console.log("일지 작성 내용", data);
                // Qna_func.create(data, ()=>{
                //     this.init_content();
                //     update_admin_side_bar();
                // });
            });
        });
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



