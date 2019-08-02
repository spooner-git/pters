class Member_schedule_history{
    constructor(install_target, target_instance, callback){
        this.target = {install : install_target};
        this.target_instance = target_instance;
        this.callback = callback;
        this.received_data;
        this.data = {
            id: this.target_instance.lecture.id.slice(),
            name: this.target_instance.lecture.name.slice(),
            max: this.target_instance.lecture.max.slice()
        };
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
        html = ;
        html_to_join.push(html);

        return html_to_join.join('');
    }

    request_list (callback){
        let send_data = {"member_id": this.member_id};
        Member_func.read_schedule_list(send_data, (data)=>{
            this.received_data = data.current_lecture_data;
            callback();
        });
    }

    upper_right_menu(){
        this.callback(this.data);
        layer_popup.close_layer_popup();
        this.clear();
    }
}



