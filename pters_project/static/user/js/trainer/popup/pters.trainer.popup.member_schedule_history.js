class Member_schedule_history{
    constructor(install_target, member_id, callback){
        this.target = {install : install_target};
        this.member_id = member_id;
        this.callback = callback;
        this.received_data;
        this.data = null;
        this.init();
    }

    init(){
        this.request_list(()=>{
            this.render();
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/navigate_before_black.png" onclick="layer_popup.close_layer_popup();member_schedule_history.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="">수업 이력</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list(){

        let html_to_join = [];
        let html;

        let item_length = Object.keys(this.received_data).length;
        for(let item in this.received_data){
            let length = this.received_data[item].length;
            let html_sub_assembly_to_join = [];
            let expand_button;
            let expand_status;
            let expand_style;
            for(let i=length-1; i>=0; i--){
                let data = this.received_data[item][i];
                let schedule_id = data.schedule_id;
                let numbering = i;
                let date =  DateRobot.to_text(data.start_dt.split(' ')[0]) +' '+ TimeRobot.to_text(data.start_dt.split(' ')[1]) + ' - '+
                            TimeRobot.to_text(data.end_dt.split(' ')[1]);
                let schedule_name = data.lecture_name;
                let attend_status = SCHEDULE_STATUS[data.state_cd];
                let memo = data.note;
    
                html = CComponent.schedule_history_row (numbering, schedule_id, date, schedule_name, attend_status, memo, ()=>{
                    let user_option = {
                        absence:{text:"결석", callback:()=>{Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_ABSENCE}, ()=>{
                                                                this.init();
                                                                member_view_popup.init();
                                                            });
                                                            layer_popup.close_layer_popup();}},
                        attend:{text:"출석", callback:()=>{Plan_func.status({"schedule_id":schedule_id, "state_cd":SCHEDULE_FINISH}, ()=>{
                                                                this.init();
                                                                member_view_popup.init();
                                                            });layer_popup.close_layer_popup();}},
                        cancel:{text:"취소", callback:()=>{Plan_func.delete({"schedule_id":schedule_id}, ()=>{
                                                            this.init();
                                                            member_view_popup.init();
                                                        });layer_popup.close_layer_popup();}}
                    };
                    layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(45+50*Object.keys(user_option).length)/windowHeight, POPUP_FROM_BOTTOM, null, ()=>{
                        option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
                    });
                });
                html_sub_assembly_to_join.push(html);
            }
            let button_onclick = ()=>{      let $target = $(`#member_schedule_history_${item}_list`);
                                                if($target.attr('data-expand') == HIDE){
                                                    $target.attr('data-expand', SHOW);
                                                    $target.show();
                                                }else{
                                                    $target.attr('data-expand', HIDE);
                                                    $target.hide();
                                                };
                                      }
            expand_button = CComponent.text_button(item, '접기/펼치기', {"float":"right", "font-size":"13px"}, ()=>{button_onclick();});
            //수강권이 두개 이상이면 모두 접어둔다, 1개이면 펴둔다.
            if(item_length >= 2){
                expand_status = HIDE;
                expand_style = "none";
            }else{
                expand_status = SHOW;
                expand_style = "block";
            }
            let html_sub_assembly = `<div id="member_schedule_history_${item}" style="padding:16px;">
                                        <div>${item} ${expand_button}</div>
                                        <div id="member_schedule_history_${item}_list" data-expand="${expand_status}" style="display:${expand_style};">${html_sub_assembly_to_join.join('')}</div>
                                    </div>`;
            html_to_join.push(html_sub_assembly);
        }

        
        
        return html_to_join.join('');
    }

    request_list (callback){
        let send_data = {"member_id": this.member_id};
        Member_func.read_schedule_list_by_ticket(send_data, (data)=>{
            this.received_data = data;
            callback();
        });
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}



