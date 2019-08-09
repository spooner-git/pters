class Program {
    constructor (targetHTML, instance){
        this.page_name = "program";
        this.targetHTML = targetHTML;
        this.instance = instance;
    }

    init (){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page;

        this.render_upper_box();
        Program_func.read((jsondata) => {
            this.render_list(jsondata);
            this.render_upper_box();
        });
    }

    //상단을 렌더링
    render_upper_box (){
        if(current_page != this.page_name){
            return false;
        }

        this.search = false;
        let component = this.static_component();
        document.getElementById('program_display_panel').innerHTML = component.program_upper_box;
    }

    //회원 리스트를 렌더링
    render_list (jsondata){
        if(current_page != this.page_name){
            return false;
        }

        let html_temp = [CComponent.dom_tag('등록된 프로그램', {"padding":"5px 20px", "font-weight":"bold", "color":"#858282"})];
        let html_selected_current_program = [CComponent.dom_tag("선택된 프로그램", {"padding":"5px 20px", "font-weight":"bold", "color":"#fe4e65"})];
        let length = jsondata.program_data.length;
        for (let i=0; i<length; i++){
            let data = jsondata.program_data[i];
            let name = data.program_subject_type_name;
            let id = data.program_id;
            let member_num = data.program_total_member_num;
            let status = data.program_state_cd;

            let html = `<article class="program_wrapper" data-program_id="${id}">
                            <div class="program_data_u">
                                <div>
                                    <span>${name}</span>
                                </div>
                                <div>
                                    <span>${member_num} 명</span>
                                </div>
                            </div>                
                            <div class="program_data_b">
                                <span>${id}</span>
                            </div>
                        </article>`;
            html_temp.push(html);
        }
        
        document.querySelector('#program_content_wrap').innerHTML = html_temp.join("");
    }

    static_component (){
        return(
            {
                program_upper_box:`    <div class="program_upper_box">
                                        <div style="display:inline-block;width:200px;">
                                            <div style="display:inline-block;width:200px;">
                                                <span style="font-size:23px;font-weight:bold;color:#3b3d3d">프로그램 </span>
                                            </div>
                                        </div>
                                        <div class="program_tools_wrap">
                                            <div class="search_program"></div>
                                            <div class="add_program"></div>
                                        </div>
                                </div>`
                ,
                initial_page:`<div id="program_display_panel"></div><div id="program_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div>`
            }
        );
    }
}

class Program_func{
    static create(){

    }

    static read(callback){
        //프로그램 리스트 서버에서 불러오기
        $.ajax({
            url:"/trainer/get_program_list/",
            dataType : 'JSON',
            beforeSend:function (){
                ajax_load_image(SHOW);
            },
    
            //통신성공시 처리
            success:function (data){
                console.log(data);
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){
                ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
            }
        });
    }

    static update(){

    }

    static delete(){

    }
}


