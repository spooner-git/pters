class My_coupon_box{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_my_coupon_box_toolbox', content:'section_my_coupon_box_content'};
        this.data_sending_now = false;
        

        this.data = {
            
        };

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        my_coupon_box_func.read((data)=>{
            
            this.render_content();
        });
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();my_coupon_box_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right" onclick="my_coupon_box_popup.upper_right_menu();"><span style="color:var(--font-highlight);font-weight: 500;">저장</span></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_my_coupon_box .wrapper_top').style.border = 0;
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
    
    dom_assembly_content(){
        let html =  '<article class="obj_input_box_full">' +
                        this.dom_row_coupon_list() + 
                    '</article>';
        return html;
    }


    dom_row_coupon_list(){
        let demo = [
            {id:1, name:"신규 가입 30일", expiry:"2020-09-30", obtain:"2020-1-1", description:"신규고객: 스탠다드 이용권 지급"},
            {id:2, name:"추천인 보상 7일", expiry:"2020-09-30", obtain:"2020-2-1", description:"유료고객: 기간연장, 신규고객: 스탠다드 이용권 지급"},
            {id:3, name:"생일 축하 30일", expiry:"2020-3-30", obtain:"2020-2-24", description:"유료고객: 기간연장, 신규고객: 스탠다드 이용권 지급"}
        ];
        let html_to_join = [];
        for(let i=0; i<demo.length; i++){
            html_to_join.push(
                this.dom_row_coupon(demo[i])
            );
        }


        return html_to_join.join("");

    }


    dom_row_coupon(data){
        let coupon_id = data.id;
        let coupon_name = data.name;
        let coupon_expiry = data.expiry;
        let coupon_obtain = data.obtain;
        let coupon_description = data.description;

        let content = `<article class="coupon_wrapper">
                        <div style="display:flex;margin-bottom:5px;">
                            <div style="flex:1 1 0;font-size:15px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${coupon_name}</div>
                            <div style="flex-basis:80px;font-size:12px;color:var(--font-sub-normal);font-weight:500;text-align:right;">사용 ${CImg.arrow_right([""], {"vertical-align":"middle"})}</div>
                        </div>
                        <div style="height:18px"><span style='font-size:12px;color:var(--font-sub-dark);letter-spacing:-0.6px;font-weight:normal;vertical-align:top'>${coupon_description}</div>
                        <div style="height:18px"><span style='font-size:12px;color:var(--font-sub-dark);letter-spacing:-0.6px;font-weight:normal;vertical-align:top'>지급일 ${coupon_obtain} / 만료일 ${coupon_expiry}</span></div>
                    </article>
                    `;

        let html = 
        CComp.element(
            "div",
            content,
            null,
            {id:`coupon_${coupon_id}`},
            {type:"click", exe:(e)=>{
                e.stopPropagation();
                show_user_confirm({title:`${coupon_name}<br> 쿠폰을 사용하시겠습니까?`}, ()=>{
                    layer_popup.close_layer_popup();
                    alert(`${coupon_id} ${coupon_name} ${coupon_expiry}쿠폰 사용하기 실행`);
                });
                
            }}
        );
        
        return html;
    }


    dom_row_toolbox(){
        let title = "내 쿠폰";
        let description = "<p style='font-size:14px;font-weight:500;'>적립된 쿠폰 내역입니다.</p>";
        let html = `
        <div class="" style="">
            <div style="display:inline-block;">
                <span style="display:inline-block;font-size:23px;font-weight:bold">
                    ${title}
                    ${description}
                </span>
                <span style="display:none;">${title}</span>
            </div>
        </div>
        `;
        return html;
    }

    send_data(){
        // let auth_inspect = pass_inspector.setting_update();
        // if(auth_inspect.barrier == BLOCKED){
        //     let message = `${auth_inspect.limit_type}`;
        //     show_error_message({title:message});
        //     return false;
        // }
        
        if(this.data_sending_now == true){
            return false;
        }else if(this.data_sending_now == false){
            this.data_sending_now = true;
        }
        let data = {
            
        };
        my_coupon_box_func.activate(data, ()=>{
            this.data_sending_now = false;
            this.set_initial_data();
            show_error_message({title:'쿠폰을 사용하였습니다.'});
        }, ()=>{this.data_sending_now = false;});
    }

    upper_right_menu(){
        this.send_data();
    }
}

class my_coupon_box_func{
    static activate(data, callback, error_callback){
        //my_coupon_box_time_selector_type, my_coupon_box_basic_select_time
        $.ajax({
            url:"/trainer/update_my_coupon_box_setting/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray[0]});
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
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
            }
        });
    }

    static read(callback, error_callback){
        $.ajax({
            url:"/trainer/get_trainer_setting_data/",
            type:'GET',
            dataType : 'JSON',
    
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
                        show_error_message({title:data.messageArray[0]});
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
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
            }
        });
    }
}


