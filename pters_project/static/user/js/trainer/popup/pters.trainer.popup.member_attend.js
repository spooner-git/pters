class Member_attend{
    constructor(install_target, schedule_id, callback){
        this.target = {install : install_target};
        this.schedule_id = schedule_id;
        this.callback = callback;
        this.received_data;
        this.data = {
            id:{name:null, member_id:null, state_cd:null}
        };
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
            let member_id = data.lecture_schedule_data[i].member_id;
            let state = data.lecture_schedule_data[i].state_cd;
            let member_name = data.lecture_schedule_data[i].member_name;
            new_data[member_id] = {name:member_name, member_id:member_id, state_cd:state};
        }

        this.data = new_data;
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/navigate_before_black.png" onclick="layer_popup.close_layer_popup();member_attend.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="">출석 체크</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="member_attend.upper_right_menu();">완료</span></span>`;
        let content =   `<section>${this.dom_list()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
    }

    dom_list(){
        let html_to_join = [];
        let html;
        for(let item in this.data){
            console.log('item', item)
            let data = this.data[item];
            let checked_absence = data.state_cd == "PC" ? 1 : 0;
            let checked_attend = data.state_cd == "PE" ? 1 : 0;
            let location = 'member_attend';
            let member_id = data.member_id;
            let member_name = data.name;
            html = CComponent.select_attend_row (checked_absence, checked_attend, location, member_id, member_name, (add_or_substract)=>{
                switch(add_or_substract){
                case 'check_absence':
                    this.data[member_id].state_cd = SCHEDULE_ABSENCE;
                    break;
                case 'uncheck_absence':
                        this.data[member_id].state_cd = SCHEDULE_NOT_FINISH;
                    break;
                case 'check_attend':
                        this.data[member_id].state_cd = SCHEDULE_FINISH;
                    break;
                case 'uncheck_attend':
                        this.data[member_id].state_cd = SCHEDULE_NOT_FINISH;
                    break;
                }
            });
            html_to_join.push(html);
        }
        return html_to_join.join('');
    }

    request_list (callback){
        Plan_func.read_plan(this.schedule_id, (data)=>{
            this.set_initial_data(data); // 초기값을 미리 셋팅한다.
            callback(data);
        });
    }

    send_data(){
        
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}



