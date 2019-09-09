class Statistics{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_statistics_list_toolbox', content:'section_statistics_list_content'};

        let d = new Date();
        this.dates = {
            current_year: d.getFullYear(),
            current_month: d.getMonth()+1,
            current_date: d.getDate(),
            current_last_date : new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()
        };
        this.times = {
            current_hour: TimeRobot.to_zone(d.getHours(), d.getMinutes()).hour,
            current_minute: TimeRobot.to_zone(d.getHours(), d.getMinutes()).minute,
            current_zone: TimeRobot.to_zone(d.getHours(), d.getMinutes()).zone
        };

        this.data = {
                sales:{},
                sales_detail:{},
                member:{},
                chart:{
                    sales:{},
                    sales_detail:{},
                    member:{}
                }
        };

        this.init();
        // this.set_initial_data();
    }

 
    init(){
        // this.render();
        this.set_initial_data();
    }

    set_initial_data (){
        // let data = {"start_date":`${this.dates.current_year}-${this.dates.current_month}-1`,
        //             "end_date":`${this.dates.current_year}-${this.dates.current_month}-${this.dates.current_last_date}`};
        let data = {"start_date":`2018-5-1`,
                    "end_date":`2019-4-30`};
        Statistics_func.read("sales", data, (data)=>{
            this.data.sales = data;
            this.data.chart.sales = this.data_convert_for_column_chart();
            this.render();
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`);
        });   
    }

    load_google_chart(){
        // Load the Visualization API and the corechart package.
        google.charts.load('current', {'packages':['corechart']});
    
        // Set a callback to run when the Google Visualization API is loaded.
        google.charts.setOnLoadCallback(this.draw_sales_graph);
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<img src="/static/common/icon/icon_arrow_l_black.png" onclick="layer_popup.close_layer_popup();statistics_popup.clear();" class="obj_icon_prev">`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_statistics .wrapper_top').style.border = 0;
        this.load_google_chart();
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
        let html = this.dom_row_sales_summary() + this.dom_row_sales_graph() + this.dom_row_sales_list();

        return html;
    }

    dom_row_toolbox(){
        let title = "매출 통계";
        let title2 = "회원 통계";
        let html = `
                    <div class="lecture_view_upper_box">
                        <div style="display:inline-block;width:320px;">
                            <div style="display:inline-block;width:100px;font-size:23px;font-weight:bold;text-align:center">
                                ${title}
                            </div>
                            <div style="display:inline-block;background-color:#f5f2f3;width:2px;height:16px;"></div>
                            <div style="display:inline-block;width:100px;font-size:23px;font-weight:bold;text-align:center">
                                ${title2}
                            </div>
                        </div>
                    </div>
                    `;
        return html;
    }

    dom_row_sales_summary(){
        let data = this.data.sales;

        let length = data.month_date.length;
        let start_month_date = data.month_date[0].replace(/-/gi, ".");
        let end_month_date = data.month_date[length-1];
        
        let last_date_of_end_month = new Date(end_month_date.split('-')[0], end_month_date.split('-')[1], 0).getDate();
        let end_month_last_date = `${end_month_date.split('-')[0]}-${end_month_date.split('-')[1]}-${last_date_of_end_month}`;
        end_month_date = end_month_last_date.replace(/-/gi, ".");
        
        let price_sum = MathRobot.array_sum(data.price);
        let refund_sum = MathRobot.array_sum(data.refund_price);

        let total_sales = UnitRobot.numberWithCommas(price_sum - refund_sum);

        let html = `
                    <div style="padding:0 20px 16px 20px;border-bottom:1px solid #f5f2f3;margin-bottom:20px;">
                        <div style="line-height:24px;font-size:15px;font-weight:500;letter-spacing:-0.7px;color:#5c5859;">${start_month_date} - ${end_month_date}</div>
                        <div style="line-height:16px;font-size:16px;font-weight:bold;letter-spacing:-0.7px;color:#fe4e65;">${total_sales} 원</div>
                    </div>
                    `;
        return html;
    }

    dom_row_sales_graph(){
        let html = `<section style="width:95%;text-align:center;margin:0 auto;box-sizing:border-box">
                        <div style="font-size:15px;font-weight:500;letter-spacing:-0.7px;color:#5c5859;">월별 현황</div>
                        <div style="font-size:11px;font-weight:500;letter-spacing:-0.5px;color:#858282;">(단위 / 10,000원)</div>
                        <div id="sales_graph"></div>
                    </section>`;
        return html;
    }

    dom_row_sales_list(){
        let length = this.data.sales.month_date.length;
        let html_to_join = []
        html_to_join.push(`<div class="sales_list_row" style="font-size:11px;">
                                <div class="sales_list_month" style="color:#999696;">기간</div>
                                <div class="sales_list_price" style="color:#999696;">매출액 (환불 포함)</div>
                                <div class="sales_list_detail"></div>
                            </div>`);
        for(let i=length-1; i>=0; i--){
            let date = this.data.sales.month_date[i].split('-');
            let price = Number(this.data.sales.price[i]) - Number(this.data.sales.refund_price[i]);
            let html = `<div class="sales_list_row">
                            <div class="sales_list_month">${date[0]}년 ${date[1]}월</div>
                            <div class="sales_list_price">${UnitRobot.numberWithCommas(price)} 원</div>
                            <div class="sales_list_detail">상세 정보 <img src="/static/common/icon/icon_arrow_r_small_black.png"></div>
                        </div>`;
            html_to_join.push(html);
        }
        return '<section style="border-top:1px solid #f5f2f3;margin-top:20px;">'+html_to_join.join('')+'</section>';
    }

    draw_sales_graph() {
        let chart_data = statistics_popup.data.chart.sales;
        var data = new google.visualization.arrayToDataTable(chart_data);


        var options = {'title': "월별 매출 현황",
            // 'width':windowWidth,
            'height':250,
            'chartArea':{width:'75%', height:'80%'},
             'legend':{position:'none'},
             titlePosition:'none',
             colors:['#fe4e65', '#5d91f7'],
             isStacked: true,
             hAxis: {
                        // viewWindow: {
                        //     min: [7, 30, 0],
                        //     max: [19, 30, 0]
                        // }
                        showTextEvery:1
                    },
            vAxis: {
                        
                        // title: 'Rating (scale of 1-12)'
                    },
            trendlines:{0:{
                            // type:'linear',
                            // type:'exponential',
                            type:'polynomial',
                            color:'blue',
                            lineWidth:3,
                            opacity:0.1,
                            showR2:true,
                            visibleInLegend:false
                            }
                         }
            }
        
  
        var chart = new google.visualization.ColumnChart(
            document.getElementById('sales_graph'));
  
        chart.draw(data, options);
    }

    data_convert_for_column_chart(){
        let new_data = [['Month', 'Sales']];

        let length = this.data.sales.month_date.length;
        for(let i=0; i<length; i++){
            new_data.push(
                [String(Number(this.data.sales.month_date[i].split('-')[1])), (Number(this.data.sales.price[i])-Number(this.data.sales.refund_price[i]))/10000]
            );
        }

        return new_data;
    }

    event_statistics_click(){
        
    }

    upper_right_menu(){
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_statistics_ADD, 100, POPUP_FROM_RIGHT, null, ()=>{
            statistics_add_popup = new statistics_add('.popup_statistics_add');
        });
    }
}

class Statistics_func{
    static read(list, data, callback, async){
        let url;
        switch(list){
            case "sales":
                //data : {'class_id':class_id, 'start_date':start_date, 'end_date':end_date}
                url = '/stats/get_sales_list/';
            break;
            case "sales_detail":
                //data : {'class_id':class_id, 'month_date':month_date}
                url = '/stats/get_sales_info/';
            break;
            case "member":
                //data : {'class_id':class_id, 'start_date':start_date, 'end_date':end_date}
                url = '/stats/get_stats_member_list/';
            break;
        }

        if(async == undefined){
            async = true;
        }
        //프로그램 리스트 서버에서 불러오기
        $.ajax({
            url: url,
            type:'GET',
            data: data,
            dataType : 'JSON',
            async: async,
            
            beforeSend:function (){
                // ajax_load_image(SHOW);
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
                // ajax_load_image(HIDE);
            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
            }
        });
    }

    static update(data, callback){
        //프로그램 추가
        $.ajax({
            url:"/trainer/update_statistics_info/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }

    static delete(data, callback){
        //프로그램 추가
        $.ajax({
            url:"/trainer/delete_statistics_info/",
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings){
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //통신성공시 처리
            success:function (data){
                if(callback != undefined){
                    callback(data);
                }
            },

            //보내기후 팝업창 닫기
            complete:function (){

            },
    
            //통신 실패시 처리
            error:function (){
                console.log('server error');
                show_error_message('통신 오류 발생 \n 잠시후 다시 시도해주세요.');
            }
        });
    }
}

