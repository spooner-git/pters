class TempForError {
    constructor (install_target, instance){
        this.target = {install: install_target, toolbox:'section_temp_for_error_toolbox', content:'section_temp_for_error_content'};

        this.instance = instance;
        this.page_name = 'temp_for_error';
        this.data;
        this.init();
    }

    init(){
        this.set_initial_data();
    }

    set_initial_data (){
        let received_data = [];
        TempForError_func.ajax(
            "/trainer/get_trainer_member_ticket_price_bug_list/",
            "GET",
            "",
            (data)=>{
                for(let ticket in data){
                    received_data.push(
                        data[ticket]
                    );
                }
                this.data = received_data;
                this.render();
            }
        );   
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){

        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();temp_for_error.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<div class="search_bar"></div>
                        <section id="${this.target.toolbox}" class="obj_box_full popup_toolbox" style="border:0;">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;

        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_temp_for_error .wrapper_top').style.border = 0;
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
        let dom = 
        this.data.map((el)=>{
            return this.dom_row_article(el);
        });


        return dom.join("");
    }

    dom_row_article(data){
        let flex_style = `style="display:flex;"`;
        let flex_child1 = `style="flex-basis:60px;color:var(--font-sub-normal);font-size:13px;"`;
        let flex_child2 = `style="flex:1 1 0"`;
        let content = 
            `
                <div ${flex_style}><div ${flex_child1}>회원명</div><div ${flex_child2}>${data.member_name}</div></div>
                <div ${flex_style}><div ${flex_child1}>등록일</div><div ${flex_child2}>${data.member_ticket_reg_dt.split('.')[0]}</div></div>
                <div ${flex_style}><div ${flex_child1}>수강권명</div><div ${flex_child2}>${data.member_ticket_name}</div></div>
                <div ${flex_style}><div ${flex_child1}>가격</div><div ${flex_child2}>${data.member_ticket_price} 원</div></div>
            `;

        let html = 
        `<article style="position:relative;margin:10px 15px;padding:0px 15px;border:1px solid var(--bg-sub-light);border-radius:4px;">`+
            CComponent.create_row(
                `temp_for_error_${data.member_ticket_id}`,
                content,
                DELETE,
                NONE,
                "",
                {height:"auto"},
                ()=>{ //onclick
                    // show_error_message({title:data.member_ticket_id});
                    this.event_popup_member_ticket_info(data.member_ticket_id, data.member_name, data.member_id);
                }
            )+
            `<div style="position:absolute;top:15px;right:15px;color:var(--font-sub-normal);font-size:13px;font-weight:500;">수정 ${CImg.arrow_right([""], {"vertical-align":"middle"})}</div>`
        +'</article>';
        
        return html;
    }

    event_popup_member_ticket_info(member_ticket_id, member_name, member_id){
        TempForError_func.ajax(
            '/trainer/get_member_ticket_info/',
            "GET",
            {"member_ticket_id": member_ticket_id},
            (data)=>{ //callback
                this.open_popup_member_ticket_modify(data[member_ticket_id], member_name, member_id);
            },
            ()=>{ //error_callback

            }
        );
    }

    open_popup_member_ticket_modify(data, member_name, member_id){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_MEMBER_TICKET_MODIFY, 100, popup_style, null, ()=>{
            let external_data = {"member_id":member_id, "member_name":member_name, "member_ticket_id":data.member_ticket_id, "member_ticket_name":data.member_ticket_name, 
                        "start_date": DateRobot.to_split(data.member_ticket_start_date), "start_date_text": DateRobot.to_text(data.member_ticket_start_date, "", "", SHORT),
                        "end_date": DateRobot.to_split(data.member_ticket_end_date), "end_date_text": data.member_ticket_end_date == "9999-12-31" ? "소진 시까지" : DateRobot.to_text(data.member_ticket_end_date, "", "", SHORT),
                        "reg_count":data.member_ticket_reg_count, "price":data.member_ticket_price, "status":data.member_ticket_state_cd,
                        "refund_date": data.member_ticket_refund_date == "None" ? null : DateRobot.to_split(data.member_ticket_refund_date), 
                        "refund_date_text": data.member_ticket_refund_date == "None" ? null : DateRobot.to_text(data.member_ticket_refund_date, "", "", SHORT),
                        "refund_price":data.member_ticket_refund_price, "note":data.member_ticket_note, "pay_method":data.member_ticket_pay_method};
            member_ticket_modify = new Member_ticket_modify('.popup_member_ticket_modify', external_data, 'member_ticket_modify', ()=>{
                this.init();
            });
        });
    }



    dom_row_toolbox(){
        let title = "가격 입력오류 수정";
        let html = `<div class="lecture_upper_box">
                        <div style="display:inline-block;width:100%;font-size:22px;font-weight:bold;color:var(--font-main); letter-spacing: -1px; height:28px;">
                            <span style="display:inline-block;">${title}</span>
                            <span style="display:none;">${title}</span>
                            <div style="display:inline-block; color:var(--font-highlight); font-weight:900;">${this.data.length} 건</div>
                        </div>
                    </div>
                    <div style="font-size:14px;">
                        <p style="margin-bottom:0">2020.2.1 업데이트 이후 회원 등록시 입력하신 가격이 정상적으로 반영되지 않는 문제가 일부 이용자님들께 발생하였습니다.</p>
                        <p style="margin-top:0">고객님께서 입력하신 가격이 아닌 0원이 들어가 있는 데이터를 확인하시고, 수정을 부탁드립니다.</p>
                        <p style="margin:0;">시스템 이용에 불편을 드린 점 고개 숙여 사과드립니다.  - 피터스팀 일동</p>
                    </div>
                        `;
        return html;
    }
}

class TempForError_func{
    static ajax(url, type, data, callback, error_callback){
        $.ajax({
            url:url,
            type: type,
            data: data,
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                // check_app_version(data.app_version);
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
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }
}
