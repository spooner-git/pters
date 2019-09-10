class Statistics_detail{
    constructor(install_target, target_month_date){
        this.target = {install: install_target, toolbox:'section_statistics_detail_toolbox', content:'section_statistics_detail_content'};
        this.target_month_date = target_month_date;

        this.data = {};

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        let data = {"month_date": this.target_month_date};
        // Statistics_func.read("sales_detail", data, (data)=>{
            this.data = data;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        // });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();statistics_detail_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">${"0000년 00월"}</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_statistics_detail .wrapper_top').style.border = 0;
    }

    render_content(){
        document.getElementById(this.target.content).innerHTML = this.dom_assembly_content();
    }
    
    dom_assembly_content(){
        let html =  this.dom_row_sales_data();
        return html;
    }

    dom_row_sales_data(){
        let length = 10;
        let html_to_join = [];
        for(let i=0; i<length; i++){
            let html = `
                    <div class="sales_detail_row">
                        <div class="sales_detail_date">${"0000. 00. 00"}</div>
                        <div class="sales_detail_content">
                            ${"거래 구분"}
                            <div>${"회원명"}</div>
                            <div>${"수강권명"}</div>
                        </div>
                        <div class="sales_detail_price">
                            ${"000,000,000"} 원
                        </div>
                    </div>
                    `;
            html_to_join.push(html);
        }

        

        return html_to_join.join("");
    }

}

