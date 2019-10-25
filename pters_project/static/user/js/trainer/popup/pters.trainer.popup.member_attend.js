class Member_attend{
    constructor(install_target, schedule_id, callback){
        this.target = {install : install_target};
        this.schedule_id = schedule_id;
        this.callback = callback;
        this.received_data;
        this.check_entire = false;
        this.data = {
            id:{name:null, member_id:null, state_cd:null, image:null, schedule_id:null}
        };
        this.lecture_max_num = null;
        this.lecture_current_num = null;
        this.init();
    }

    init(){
        this.request_list(()=>{
            this.render();
        });
    }

    set_initial_data(data_){
        let data = data_.schedule_info[0];
        let length = data.lecture_schedule_data.length;
        let new_data = {};
        for(let i=0; i<length; i++){
            let member_schedule_id = data.lecture_schedule_data[i].schedule_id;
            let member_id = data.lecture_schedule_data[i].member_id;
            let state = data.lecture_schedule_data[i].state_cd;
            let member_name = data.lecture_schedule_data[i].member_name;
            let image_url = `https://s3.ap-northeast-2.amazonaws.com/pters-image-master/${member_schedule_id}.png`;
            if(state != SCHEDULE_FINISH){
                image_url = null;
            }
            new_data[member_id] = {name:member_name, member_id:member_id, state_cd:state, image:image_url};
            //서버로부터 image를 받아오면 image를 null이 아니라 image 주소로
            if(state != SCHEDULE_FINISH){
                this.check_entire = false;
            }
        }
        if(data.schedule_type == 1){
            let state = data_.schedule_info[0].state_cd;
            let image_url = `https://s3.ap-northeast-2.amazonaws.com/pters-image-master/${data.schedule_id}.png`;
            if(state != SCHEDULE_FINISH){
                image_url = null;
            }
            new_data[null] = {name:data.member_name, state_cd:data.state_cd, member_id:null, image:image_url};
            //서버로부터 image를 받아오면 image를 null이 아니라 image 주소로
        }

        this.data = new_data;
        this.lecture_max_num = data.lecture_max_member_num;
        this.lecture_current_num = data.lecture_current_member_num;
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();member_attend.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="">출석 체크</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="member_attend.upper_right_menu();">저장</span></span>`;
        let content =   `<section>${this.dom_row_check_entire()}</section><section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_row_check_entire(){
        let html;
        html = `<div class="obj_table_raw" style="height:52px;padding:0px 20px;box-sizing:border-box;">
                    <div style="display:table-cell;width:150px; height:20px; font-size:11px; font-weight:bold; letter-spacing: -0.5px; color:#858282; vertical-align: middle;">
                        정원(${this.lecture_current_num}/${this.lecture_max_num})
                    </div>
                    <div style="display:table-cell;width:auto;font-size:13px;font-weight:500;text-align:right;vertical-align:middle;cursor:pointer; letter-spacing: -0.5px; color: #858282;" id="check_entire_${this.schedule_id}">
                        <span style="color:#858282">전원 출석</span>
                        ${this.check_entire == true 
                            ? `<div class="pters_checkbox checkbox_selected"><div class="checkbox_selected_inner"></div></div>`
                            : `<div class="pters_checkbox"></div>`
                        }
                    </div>
                </div>
                `;
        $(document).off('click', `#check_entire_${this.schedule_id}`).on('click', `#check_entire_${this.schedule_id}`, ()=>{
            if(this.check_entire == true){
                $(this).find('.pters_checkbox').removeClass('checkbox_selected');
                $(this).html('');
                for(let member in this.data){
                    this.data[member].state_cd = SCHEDULE_NOT_FINISH;
                }
                this.check_entire = false;
            }else{
                $(this).find('.pters_checkbox').addClass('checkbox_selected');
                $(this).find('.pters_checkbox').html('<div class="checkbox_selected_inner"></div>');
                for(let member in this.data){
                    this.data[member].state_cd = SCHEDULE_FINISH;
                }
                this.check_entire = true;
            }
            this.render();
        });
        return html;
    }

    dom_list(){
        let html_to_join = [];
        let html;
        for(let item in this.data){
            let data = this.data[item];
            let checked_absence = data.state_cd == "PC" ? 1 : 0;
            let checked_attend = data.state_cd == "PE" ? 1 : 0;
            let location = 'member_attend';
            let member_id = data.member_id;
            let image = data.image;
            let tag = "";
            // if(image != null && this.check_image_link(image) != false && data.state_cd == SCHEDULE_FINISH){
            if(image != null && data.state_cd == SCHEDULE_FINISH){
                tag = '<div style="position:absolute">' + 
                        '<div style="float:left;background-color:#fe4e65;border:1px solid #fe4e65;border-radius:5px;color:#ffffff;width:20px;height:13px;line-height:13px;font-size:9px;font-weight:normal;margin-right:3px;">서명</div>'+
                        `<img src="${image}" onerror="this.onerror=null;this.src=member_attend.image_error(${item})" style="display:none;">` +
                    '</div>';
            }
            let member_name = tag + data.name;
            html = CComponent.select_attend_row (checked_absence, checked_attend, location, member_id, member_name, (add_or_substract)=>{
                switch(add_or_substract){
                case 'check_absence':
                    this.data[member_id].state_cd = SCHEDULE_ABSENCE;
                    this.check_entire = false;
                    break;
                case 'uncheck_absence':
                        this.data[member_id].state_cd = SCHEDULE_NOT_FINISH;
                        this.check_entire = false;
                    break;
                case 'check_attend':
                        this.open_drawing_board(member_id, ()=>{
                            this.data[member_id].state_cd = SCHEDULE_FINISH;
                            this.check_entire = true;
                            for(let id in this.data){
                                if(this.data[id].state_cd != SCHEDULE_FINISH){
                                    this.check_entire = false;
                                }
                            }
                        });
                    break;
                case 'uncheck_attend':
                        this.data[member_id].state_cd = SCHEDULE_NOT_FINISH;
                        this.check_entire = false;
                    break;
                }
                this.render();
            });
            html_to_join.push(html);
        }
        if(html_to_join.length == 0){
            html_to_join.push(CComponent.no_data_row('일정에 포함된 회원이 없습니다.'));
        }

        return html_to_join.join('');
    }


    image_error(schedule_id){
        this.data[schedule_id].image = null;
        this.render();
    }

    request_list (callback){
        Plan_func.read_plan(this.schedule_id, (data)=>{
            this.set_initial_data(data); // 초기값을 미리 셋팅한다.
            callback(data);
        });
    }

    send_data(){

    }

    open_drawing_board(id, callback){
        //사인창 열기
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_DRAWING_BOARD, 100*315/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
            let data = {    title:"일정 완료 서명",
                            description:"완료 서명을 입력해주세요.",
                            // width: $root_content.width() <= 800 ? $root_content.width() : MAX_WIDTH,
                            width: $root_content.width() <= 500 ? $root_content.width() : 500,
                            height:250,
                            color:{pencil:"#ffffff", paper:"#282828"},
                            border:0,
                            callback:(data)=>{
                                // show_error_message(`<img src="${data}" style="width:100%;filter:invert(1)">`);
                                callback();
                                this.data[id].image = data;
                                this.render();
                            }
                        };
            drawing_board = new DrawingBoard('#wrapper_box_drawing_board', "drawing_board", data);
        });
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}



