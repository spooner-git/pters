class My_coupon_box{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_my_coupon_box_toolbox', content:'section_my_coupon_box_content'};
        this.data_sending_now = false;
        

        this.data = {
            promotion_code:null
        };

        this.tab = "coupon";

        this.init();
    }

 
    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        My_coupon_box_func.read((data)=>{
            
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
        let html =  `<article class="obj_input_box_full">
                        ${
                            this.tab == "coupon"
                            ? this.dom_row_coupon_list()
                            : this.dom_row_promotion_code_input()
                        }
                    </article>`;
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

    dom_row_promotion_code_input(){
        let input = CComp.element("div", this.element_promotion_code_input(), {"flex":"1 1 0"});
        let button = CComp.element("div", this.element_promotion_code_confirm_button(), {"flex-basis":"80px", "padding-left":"10px"} );

        let html = 
        CComp.container(
            "div",
            input + button,
            {"display":"flex"}
        );
        return html;
    }

    element_promotion_code_input(){
        let id = 'promotion_code_input';
        let title = "";
        let placeholder = '코드 입력';
        let icon = DELETE;
        let icon_r_visible = HIDE;
        let icon_r_text = "";
        let style = {"border":"var(--border-article-dark)", "border-radius":"4px", "padding":"12px", "margin-bottom":"10px"};
        let disabled = false;
        let pattern = "[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9龠々ぁ-んーァ-ヾ\u318D\u119E\u11A2\u2022\u2025a\u00B7\uFE55]{1,20}";
        let pattern_message = "특수문자는 입력 불가";
        let required = "required";
        let html = CComponent.create_input_row (id, title, placeholder, icon, icon_r_visible, icon_r_text, style, disabled, (input_data)=>{
            this.data.promotion_code = input_data;
            
        }, pattern, pattern_message, required);
        return html;
    }

    element_promotion_code_confirm_button(){
        let html = 
        CComp.button(
            "promotion_code_confirm",
            "확인",
            {"border":"var(--border-article-dark)", "border-radius":"4px", "padding":"12px 0", "height":"28px", "line-height":"28px"},
            null,
            ()=>{
                if(this.data.promotion_code != null){
                    My_coupon_box_func.promotion_code_check(this.data.promotion_code, (data)=>{
                        console.log(data);
                        show_user_confirm(
                            {title:`[${data.product_name}] 쿠폰`, comment:`이 쿠폰을 내 쿠폰함에 보관하겠습니까?`},
                            ()=>{
                                layer_popup.close_layer_popup();
                                show_error_message({title:"내 쿠폰에서 확인해주세요"});
                            }
                        );
                    });
                }else{
                    show_error_message(
                        {title:"정확한 프로모션 코드를 입력해주세요."}
                    );
                }
                
            }
        );
        return html;
    }


    dom_row_toolbox(){

        let title_text = "내 쿠폰";
        let description1 = "<p style='font-size:14px;font-weight:500;'>적립된 쿠폰 내역입니다.</p>";
        let title2_text = "프로모션 코드";
        let description2 = "<p style='font-size:14px;font-weight:500;'>프로모션 코드를 입력해 쿠폰을 수령합니다.</p>";
        let title = 
        CComp.element(
            "span",
            title_text,
            {"color":this.tab == "coupon" ? "var(--font-main)" : "var(--font-inactive)"},
            {id:"tab_select_coupon", class:"sales_type_select_text_button"},
            {
                type:"click",
                exe:()=>{
                    this.switch("coupon");
                }
            }
        );

        let title2 = 
        CComp.element(
            "span",
            title2_text,
            {"color":this.tab == "promotion_code" ? "var(--font-main)" : "var(--font-inactive)"},
            {id:"tab_select_promotion_code", class:"sales_type_select_text_button"},
            {
                type:"click",
                exe:()=>{
                    this.switch("promotion_code");
                }
            }
        );


        let html = `
                    <div class="lecture_view_upper_box">
                        <div style="display:inline-block;">
                            ${title}
                            <div style="display:inline-block;background-color:var(--bg-light);width:2px;height:16px;margin:0 10px;"></div>
                            ${title2}
                            <span style="display:none">${this.tab=="coupon"? "매출 통계" : "회원 통계"}</span>
                            ${this.tab == "coupon" ? description1 : description2}
                        </div>
                    </div>
                    `;
        return html;
    }

    switch(tab){
        this.tab = tab;
        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
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
        My_coupon_box_func.activate(data, ()=>{
            this.data_sending_now = false;
            this.set_initial_data();
            show_error_message({title:'쿠폰을 사용하였습니다.'});
        }, ()=>{this.data_sending_now = false;});
    }

    upper_right_menu(){
        this.send_data();
    }
}


class My_coupon_box_func{
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

    static promotion_code_check(promotion_code, callback){
        $.ajax({
            url: "/payment/get_coupon_product_info/",
            method: "GET",
            data: {
                "coupon_cd": promotion_code
            },
            dataType: "html",
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            success:function(data){
                var jsondata = JSON.parse(data);
                let msg;
                check_app_version(jsondata.app_version);
    
                if(jsondata.messageArray.length>0){
                    this.coupon_html = "";
                    msg = jsondata.messageArray;
                    show_error_message({title:msg});
                }else {
                    callback(jsondata);
                }
            },
    
            complete:function(){
            },
    
            error:function(){
                console.log('server error');
            }
        });
    }
}


