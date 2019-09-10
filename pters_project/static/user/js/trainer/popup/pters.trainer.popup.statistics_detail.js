class Statistics_detail{
    constructor(install_target, target_month_date){
        this.target = {install: install_target, toolbox:'section_statistics_detail_toolbox', content:'section_statistics_detail_content'};
        this.target_month_date = target_month_date;
        this.target_yyyy_mm = `${target_month_date.split('-')[0]}년 ${target_month_date.split('-')[1]}월`

        this.data = null;

        this.init();
    }

    init(){
        this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        let data = {"month_date": this.target_month_date};
        console.log(this.target_month_date)
        Statistics_func.read("sales_detail", data, (data)=>{
            this.data = data;
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();statistics_detail_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">${this.target_yyyy_mm}</span></span>`;
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
        if(this.data == null){
            let html = `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;">
                            <img src="/static/common/loading.svg">
                            <div style="font-size:12px;color:#858282">사용자 데이터를 불러오고 있습니다.</div>
                        </div>`;
            return html;
        }

        let length = this.data.date.length;
        let html_to_join = [];
        for(let i=0; i<length; i++){
            let date = this.data.date[i].replace(/-/gi, " .");
            let type = this.data.trade_info[i];
            let member = this.data.member_name[i];
            let ticket = this.data.package_name[i];
            let price = UnitRobot.numberWithCommas(this.data.price[i]);

            let html = `
                    <div class="sales_detail_row">
                        <div class="sales_detail_date">${date}</div>
                        <div class="sales_detail_content">
                            ${type}
                            <div>${member}</div>
                            <div>${ticket}</div>
                        </div>
                        <div class="sales_detail_price">
                            ${price} 원
                        </div>
                    </div>
                    `;
            html_to_join.push(html);
        }

        if(html_to_join.length == 0){
            html_to_join[0] = `<div class="sales_detail_row">데이터가 없습니다.</div>`;
        }

        

        return html_to_join.join("");
    }

}

