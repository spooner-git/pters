class Page_QA{
    constructor(target){
        this.target = {install : target};
        this.data;
    }

    init(){
        this.set_initial_data();
    }

    set_initial_data(){
        this.render_loading();
        Admin.read_qa((data)=>{
            this.data = data;
            this.render_content();
        });
    }

    render_loading(){
        let html = `
                <div class="page_loading_image">
                    <img src=/static/common/loading.svg alt="">
                    <p style="margin:0;margin-top:10px;">데이터를 불러오는 중입니다.</p>
                </div>`;
        document.querySelector(this.target.install).innerHTML = html;
    }


    render_content(){
        let html_to_join = [];
        for(let item in this.data){
            let html = this.dom_row_qa_article(this.data[item]);
            html_to_join.push(html);
        }
        
        let result = `<div class="qa_article_wrapper">` + html_to_join.join("") + `</div>`;

        document.querySelector(this.target.install).innerHTML = result;
    }

    dom_row_qa_article(data){
        let type = data.qa_type_cd;
        let title = data.qa_title;
        let status = data.qa_status_type_cd;
        let qa_id = data.qa_id;
        let qa_member_name = data.qa_member_name;
        let qa_member_email = data.qa_email_address;
        let qa_reg_date = data.qa_reg_dt;
        let qa_mod_date = data.qa_mod_dt;
        let html = `
            <article class="qa_article_row" id="qa_article_${qa_id}">
                <div class="qa_number">${qa_id}</div>
                <div class="qa_type">${type}</div>
                <div class="qa_title">${title}</div>
                <div class="qa_member">${qa_member_name}<br><span style="font-size:11px;color:#cccccc;">${qa_member_email}</span></div>
                <div class="qa_reg_date">${qa_reg_date.split('T')[0] }<br>${qa_reg_date.split('T')[1]}</div>
                <div class="qa_status">${status}</div>
            </article>
                    `;
        $(document).on('click', `#qa_article_${qa_id}`, ()=>{
            alert(qa_id);
        });
        return html;
    }
}



class Admin{
    static read_notice(){
        // $.ajax({
        //     url:'/admin_spooner/get_qa_all/',
        //     type:'GET',
        //     data: data,
        //     dataType : 'JSON',
    
        //     beforeSend:function(xhr, settings) {
        //         if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
        //             xhr.setRequestHeader("X-CSRFToken", csrftoken);
        //         }
        //     },
    
        //     //보내기후 팝업창 닫기
        //     complete:function(){
                
        //     },
    
        //     //통신성공시 처리
        //     success:function(data){
        //         if(data.messageArray != undefined){
        //             if(data.messageArray.length > 0){
        //                 alert(data.messageArray[0]);
        //                 return false;
        //             }
        //         }
        //         callback(data);
        //     },
    
        //     //통신 실패시 처리
        //     error:function(){
        //         alert('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
        //         location.reload();
        //     }
        // });
    }

    static write_notice(){

    }

    
    static read_qa(callback){
        $.ajax({
            url:'/admin_spooner/get_qa_all/',
            type:'GET',
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings) {
                // if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                //     xhr.setRequestHeader("X-CSRFToken", csrftoken);
                // }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        alert(data.messageArray[0]);
                        return false;
                    }
                }
                callback(data);
            },
    
            //통신 실패시 처리
            error:function(){
                alert('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
                location.reload();
            }
        });
    }

    static write_qa(){

    }

    static read_faq(){

    }

    static write_faq(){

    }

}