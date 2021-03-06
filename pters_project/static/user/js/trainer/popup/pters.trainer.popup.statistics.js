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

        this.tab = "sales"; //member

        this.data = {
                sales:[],
                sales_detail:[],
                member:[],
                chart:{
                    sales:{},
                    sales_detail:{},
                    member:{reg:[], refund:[], contract:[], lesson_complete:[]}
                }
        };

        this.chart_color = {
            axis_text: $('html').hasClass("pters_light_mode") ? "#282828" : "#f5f2f3",
            highlight:"#fe4e65",
            background:"transparent"
        };

        this.target_date_start = DateRobot.add_month(`${this.dates.current_year}-${this.dates.current_month}-1`, -2);
        this.target_date_end = DateRobot.to_yyyymmdd(this.dates.current_year, this.dates.current_month, this.dates.current_last_date);
        let inspect = pass_inspector.statistics(this.target_date_start, this.target_date_end);
        if(inspect.barrier == BLOCKED){
            this.target_date_start = DateRobot.add_month(`${this.dates.current_year}-${this.dates.current_month}-1`, (1 - inspect.limit_num) );
        }

        this.init();
        // this.set_initial_data();

    }

 
    init(){
        // this.render();
        this.render_loading_image();
        this.set_initial_data();
    }

    set_initial_data (){
        let data = {"start_date":this.target_date_start, "end_date":this.target_date_end};
        Statistics_func.read("sales", data, (data)=>{
            this.data.sales = data;
            this.data.chart.sales = this.data_convert_for_column_chart('sales');
            if(this.tab == "sales"){
                this.render();
            }
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });
        Statistics_func.read("member", data, (data)=>{
            this.data.member = data;
            this.data.chart.member.reg = [["유형", "대상"], ["신규 등록", data.total_month_new_reg_member], ["재등록", data.total_month_re_reg_member]];
            this.data.chart.member.refund = [["유형", "대상"], ["전체 환불", data.total_month_all_refund_member], ["부분 환불", data.total_month_part_refund_member]];
            this.data.chart.member.contract = this.data_convert_for_column_chart('contract');
            this.data.chart.member.lesson_complete = this.data_convert_for_column_chart('lesson_complete');
            if(this.tab == "member"){
                this.render();
            }
            func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
        });
    }

    load_google_chart(){
        // Load the Visualization API and the corechart package.
        google.charts.load('current', {'packages':['corechart']});
    
        // Set a callback to run when the Google Visualization API is loaded.
        if(this.tab == "sales"){
            google.charts.setOnLoadCallback(this.draw_sales_graph);
        }else{
            google.charts.setOnLoadCallback(this.draw_reg_status_graph);
            google.charts.setOnLoadCallback(this.draw_refund_status_graph);
            google.charts.setOnLoadCallback(this.draw_contract_status_graph);
            google.charts.setOnLoadCallback(this.draw_lesson_complete_status_graph);
        }
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();statistics_popup.clear();">${CImg.arrow_left()}</span>`;
        let top_center = `<span class="icon_center"><span>&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"></span>`;
        let content =   `<section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_statistics .wrapper_top').style.border = 0;
        PopupBase.top_menu_effect(this.target.install);
        this.load_google_chart();
    }

    render_loading_image(){
        document.querySelector(this.target.install).innerHTML = 
            `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);text-align:center;">
                <img src="/static/common/loading.svg">
                <div style="font-size:12px;color:var(--font-sub-normal);word-break:keep-all">사용자 데이터를 불러오고 있습니다.</div>
            </div>`;
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
        let html;
        if(this.tab == "sales"){
            html = this.dom_row_sales_summary() + this.dom_row_sales_graph() + this.dom_row_sales_list();
        }else if(this.tab == "trainer"){
            html = this.dom_trainer_lesson_complete_status_graph();
        }else if(this.tab == "member"){
            html = this.dom_row_member_summary() + this.dom_reg_status_graph() + this.dom_refund_status_graph() + this.dom_contract_status_graph() + this.dom_lesson_complete_status_graph();
        }

        return html;
    }

    dom_row_toolbox(){
        let title = "매출 통계";
        let title2 = "강사 통계";
        let title3 = "회원 통계";
        let select_title = title;
        if(this.tab == "trainer"){
            select_title = title2;
        }
        else if(this.tab == "member"){
            select_title = title3;
        }
        let html = `
                    <div class="lecture_view_upper_box">
                        <div style="display:inline-block;">
                            <span class="sales_type_select_text_button" style="color:${this.tab=="sales" ? "var(--font-main)" :"var(--font-inactive)"}" onclick="statistics_popup.switch('sales')">
                                ${title}
                            </span>
                            <!--<div style="display:inline-block;background-color:var(--bg-light);width:2px;height:16px;margin:0 10px;"></div>-->
                            <!-- <span class="sales_type_select_text_button" style="color:${this.tab=="trainer" ? "var(--font-main)" :"var(--font-inactive)"}" onclick="statistics_popup.switch('trainer')">-->
                            <!--     ${title2}-->
                            <!-- </span>-->
                            <div style="display:inline-block;background-color:var(--bg-light);width:2px;height:16px;margin:0 10px;"></div>
                            <span class="sales_type_select_text_button" style="color:${this.tab=="member" ? "var(--font-main)" :"var(--font-inactive)"}" onclick="statistics_popup.switch('member')">
                                ${title3}
                            </span>
                            <span style="display:none">${select_title}</span>
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
        let end_month_last_date = DateRobot.to_yyyymmdd(end_month_date.split('-')[0], end_month_date.split('-')[1], last_date_of_end_month);
        end_month_date = end_month_last_date.replace(/-/gi, ".");
        
        let price_sum = MathRobot.array_sum(data.price);
        let refund_sum = MathRobot.array_sum(data.refund_price);

        let total_sales = UnitRobot.numberWithCommas(price_sum - refund_sum);

        let search_button = this.dom_search_button();

        let html = `
                    <div style="padding:0 20px 16px 20px;border-bottom:var(--border-article);margin-bottom:20px;">
                        <div style="line-height:24px;font-size:15px;font-weight:500;letter-spacing:-0.7px;color:var(--font-sub-dark);">
                            <span>${start_month_date} - ${end_month_date}</span>
                            ${search_button}
                        </div>
                        <div style="line-height:16px;font-size:16px;font-weight:bold;letter-spacing:-0.7px;color:var(--font-highlight);">${total_sales} 원</div>
                    </div>
                    `;
        return html;
    }

    dom_search_button(){
        //기간별 조회 버튼
        let id = "statistics_search_button";
        let title = `기간별 조회 ${CImg.arrow_expand("", {"vertical-align":"middle"})}`;
        let style = {"float":"right", "font-size":"13px", "font-weight":"500", "letter-spacing":"-0.6px", "opacity":"0.5"};
        let onclick = ()=>{
            this.event_search_data();  
        };
        let search_button = CComponent.text_button (id, title, style, onclick);
        return search_button;
    }

    dom_row_member_summary(){
        let data = this.data.member;

        let length = data.month_date.length;
        let start_month_date = data.month_date[0].replace(/-/gi, ".");
        let end_month_date = data.month_date[length-1];
        
        let last_date_of_end_month = new Date(end_month_date.split('-')[0], end_month_date.split('-')[1], 0).getDate();
        let end_month_last_date = DateRobot.to_yyyymmdd(end_month_date.split('-')[0], end_month_date.split('-')[1], last_date_of_end_month);
        end_month_date = end_month_last_date.replace(/-/gi, ".");

        let search_button = this.dom_search_button();

        let html = `
                    <div style="padding:0 20px 16px 20px;border-bottom:var(--border-article);margin-bottom:20px;">
                        <div style="line-height:24px;font-size:15px;font-weight:500;letter-spacing:-0.7px;color:var(--font-sub-dark);">
                            <span>${start_month_date} - ${end_month_date}</span>
                            ${search_button}
                        </div>
                    </div>
                    `;
        return html;
    }

    dom_row_sales_graph(){
        let html = `<section style="width:95%;text-align:center;margin:0 auto;box-sizing:border-box">
                        <div style="font-size:15px;font-weight:500;letter-spacing:-0.7px;color:var(--font-sub-dark);">월별 현황</div>
                        <div style="font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-sub-normal);">(단위 / 10,000원)</div>
                        <div id="sales_graph"></div>
                    </section>`;
        return html;
    }

    dom_reg_status_graph(){
        let html = `<section style="width:95%;text-align:left;margin:0 auto;box-sizing:border-box;border-bottom:var(--border-article);padding:30px 0">
                        <div style="font-size:15px;font-weight:500;letter-spacing:-0.7px;color:var(--font-sub-dark);padding:0 16px;">등록 회원 현황</div>
                        <div style="font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-sub-normal);padding:0 16px;">(단위 / 건)</div>
                        <div id="member_reg_graph"></div>
                    </section>`;
        return html;
    }

    dom_refund_status_graph(){
        let html = `<section style="width:95%;text-align:left;margin:0 auto;box-sizing:border-box;border-bottom:var(--border-article);padding:30px 0">
                        <div style="font-size:15px;font-weight:500;letter-spacing:-0.7px;color:var(--font-sub-dark);padding:0 16px;">환불 회원 현황</div>
                        <div style="font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-sub-normal);padding:0 16px;">(단위 / 건)</div>
                        <div id="member_refund_graph"></div>
                    </section>`;
        return html;
    }

    dom_contract_status_graph(){
        let html = `<section style="width:95%;text-align:center;margin:0 auto;box-sizing:border-box;border-bottom:var(--border-article);padding:30px 0">
                        <div style="font-size:15px;font-weight:500;letter-spacing:-0.7px;color:var(--font-sub-dark);">월별 계약 현황</div>
                        <div style="font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-sub-normal);">(단위 / 건)</div>
                        <div id="contract_status_graph"></div>
                    </section>`;
        return html;
    }

    dom_lesson_complete_status_graph(){
        let html = `<section style="width:95%;text-align:center;margin:0 auto;box-sizing:border-box;border-bottom:var(--border-article);padding:30px 0">
                        <div style="font-size:15px;font-weight:500;letter-spacing:-0.7px;color:var(--font-sub-dark);">월별 일정 완료 현황</div>
                        <div style="font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-sub-normal);">(단위 / 건)</div>
                        <div id="lesson_complete_status_graph"></div>
                    </section>`;
        return html;
    }

    dom_trainer_lesson_complete_status_graph(){
        let html = `<section style="width:95%;text-align:center;margin:0 auto;box-sizing:border-box;border-bottom:var(--border-article);padding:30px 0">
                        <div style="font-size:15px;font-weight:500;letter-spacing:-0.7px;color:var(--font-sub-dark);">월별 일정 완료 현황</div>
                        <div style="font-size:11px;font-weight:500;letter-spacing:-0.5px;color:var(--font-sub-normal);">(단위 / 건)</div>
                        <div id="lesson_complete_status_graph"></div>
                    </section>`;
        return html;
    }

    dom_row_sales_list(){
        let length = this.data.sales.month_date.length;
        let html_to_join = [];
        html_to_join.push(`<div class="sales_list_row" style="font-size:11px;">
                                <div class="sales_list_month" style="color:var(--font-inactive);">기간</div>
                                <div class="sales_list_price" style="color:var(--font-inactive);">매출액 (환불 포함)</div>
                                <div class="sales_list_detail"></div>
                            </div>`);
        for(let i=length-1; i>=0; i--){
            let full_date = this.data.sales.month_date[i];
            let date = full_date.split('-');
            let price = Number(this.data.sales.price[i]) - Number(this.data.sales.refund_price[i]);
            let html = `<div class="sales_list_row">
                            <div class="sales_list_month">${date[0]}년 ${date[1]}월</div>
                            <div class="sales_list_price">${UnitRobot.numberWithCommas(price)} 원</div>
                            <div class="sales_list_detail" onclick="statistics_popup.event_detail('${full_date}')">상세 정보 ${CImg.arrow_right("", {"vertical-align":"middle"})}</div>
                        </div>`;
            html_to_join.push(html);
        }
        return '<section style="border-top:var(--border-article);margin-top:20px;">'+html_to_join.join('')+'</section>';
    }

    draw_sales_graph() {
        let chart_data = statistics_popup.data.chart.sales;
        let data = new google.visualization.arrayToDataTable(chart_data);


        let options = {'title': "월별 매출 현황",
            // 'width':windowWidth,
            'height':250,
            'chartArea':{width:'75%', height:'80%'},
             'legend':{position:'none'},
             titlePosition:'none',
             colors:['#fe4e65', '#5d91f7'],
             isStacked: true,
             backgroundColor:statistics_popup.chart_color.background,
             hAxis: {
                        textStyle:{
                            color:statistics_popup.chart_color.axis_text
                        },
                        showTextEvery:1
                    },
            vAxis: {
                        baselineColor:statistics_popup.chart_color.highlight,
                        textStyle:{
                            color:statistics_popup.chart_color.axis_text
                        },
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
            
        };
        
  
            let chart = new google.visualization.ColumnChart(document.getElementById('sales_graph'));
  
        chart.draw(data, options);
    }

    draw_reg_status_graph(){
        let chart_data = statistics_popup.data.chart.member.reg;
        let data = new google.visualization.arrayToDataTable(chart_data);

        if(chart_data[1][1] == 0 && chart_data[2][1] == 0){
            document.getElementById('member_reg_graph').innerHTML = 
            `<div>
                <div style="font-size:13px;font-weight:500;letter-spacing:-0.7px;color:var(--font-sub-dark);padding:40px;">
                    데이터가 없습니다.
                </div>
            </div>`;
            return;
        }

        // Set chart options
        let options = {'title':"회원 등록 현황",
                        // 'width':width,
                        // 'height':height,
                        colors:['#fe4e65', '#5d91f7'],
                        titlePosition:'none',
                        chartArea:{width:'85%', height:'85%'},
                        legend:{position:'right', 'alignment':'center', textStyle:{color:statistics_popup.chart_color.axis_text}},
                        backgroundColor:"transparent",
                        sliceVisibilityThreshold:0,
                        pieSliceText:'value' };

        let chart = new google.visualization.PieChart(document.getElementById('member_reg_graph'));
        chart.draw(data, options);
    }

    draw_refund_status_graph(){
        let chart_data = statistics_popup.data.chart.member.refund;
        let data = new google.visualization.arrayToDataTable(chart_data);

        if(chart_data[1][1] == 0 && chart_data[2][1] == 0){
            document.getElementById('member_refund_graph').innerHTML = 
            `<div>
                <div style="font-size:13px;font-weight:500;letter-spacing:-0.7px;color:var(--font-sub-dark);padding:40px;">
                    데이터가 없습니다.
                </div>
            </div>`;
            return;
        }

        // Set chart options
        let options = {'title':"회원 환불 현황",
                        // 'width':width,
                        // 'height':height,
                        colors:['#fe4e65', '#5d91f7'],
                        titlePosition:'none',
                        chartArea:{width:'85%', height:'85%'},
                        legend:{position:'right', 'alignment':'center', textStyle:{color:statistics_popup.chart_color.axis_text}},
                        backgroundColor:"transparent",
                        sliceVisibilityThreshold:0,
                        pieSliceText:'value' };

        let chart = new google.visualization.PieChart(document.getElementById('member_refund_graph'));
        chart.draw(data, options);
    }

    draw_contract_status_graph(){
        let chart_data = statistics_popup.data.chart.member.contract;
        let data = new google.visualization.arrayToDataTable(chart_data);

        let options = {'title': "월별 계약 현황",
            // 'width':windowWidth,
            'height':250,
            'chartArea':{width:'75%', height:'80%'},
             'legend':{position:'none'},
             titlePosition:'none',
             colors:['#fe4e65', '#5d91f7'],
             isStacked: true,
             backgroundColor: "transparent",
             hAxis: {
                        textStyle:{
                            color:statistics_popup.chart_color.axis_text
                        },
                        showTextEvery:1
                    },
            vAxis: {
                        baselineColor:statistics_popup.chart_color.highlight,
                        textStyle:{
                            color:statistics_popup.chart_color.axis_text
                        }
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
        
  
            let chart = new google.visualization.ColumnChart(document.getElementById('contract_status_graph'));
  
        chart.draw(data, options);
    }

    draw_lesson_complete_status_graph(){
        let chart_data = statistics_popup.data.chart.member.lesson_complete;
        let data = new google.visualization.arrayToDataTable(chart_data);

        let options = {'title': "월별 일정 완료 현황",
            // 'width':windowWidth,
            'height':250,
            'chartArea':{width:'75%', height:'80%'},
             'legend':{position:'none'},
             titlePosition:'none',
             colors:['#fe4e65', '#5d91f7'],
             isStacked: true,
             backgroundColor: "transparent",
             hAxis: {   
                        textStyle:{
                            color:statistics_popup.chart_color.axis_text
                        },
                        showTextEvery:1
                    },
            vAxis: {
                        baselineColor:statistics_popup.chart_color.highlight,
                        textStyle:{
                            color:statistics_popup.chart_color.axis_text
                        }
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
        
  
            let chart = new google.visualization.ColumnChart(document.getElementById('lesson_complete_status_graph'));
  
        chart.draw(data, options);
    }

    data_convert_for_column_chart(type){
        let new_data;
        if(type == "sales"){
            new_data = [['X', '매출 (만원)']];
            let length = this.data.sales.month_date.length;
            for(let i=0; i<length; i++){
                new_data.push(
                    [String(Number(this.data.sales.month_date[i].split('-')[1])), (Number(this.data.sales.price[i])-Number(this.data.sales.refund_price[i]))/10000]
                );
            }
        }else if(type == "contract"){
            new_data = [['Month', '신규 등록', '재등록']];
            let length = this.data.member.month_date.length;
            for(let i=0; i<length; i++){
                new_data.push(
                    [String(Number(this.data.member.month_date[i].split('-')[1])), Number(this.data.member.month_new_reg_member[i]), Number(this.data.member.month_re_reg_member[i])]
                );
            }
        }else if(type == "lesson_complete"){
            new_data = [['Month', '일정 완료']];
            let length = this.data.member.month_date.length;
            for(let i=0; i<length; i++){
                new_data.push(
                    [String(Number(this.data.member.month_date[i].split('-')[1])), Number(this.data.member.finish_schedule_count[i])]
                );
            }
        }   

        return new_data;
       
    }

    event_search_data(){
        let user_option = {
            one:{text:"1 개월", callback:()=>{  
                let date1 = DateRobot.add_month(`${this.dates.current_year}-${this.dates.current_month}-1`, 0);
                let date2 = DateRobot.to_yyyymmdd(this.dates.current_year, this.dates.current_month, this.dates.current_last_date);
                if(this.pass_inspect(date1, date2) == false){
                    return false;
                }
                this.target_date_start = date1;
                this.target_date_end = date2;
                this.init();
                layer_popup.close_layer_popup();}
            },
            three:{text:"3 개월", callback:()=>{  
                let date1 = DateRobot.add_month(`${this.dates.current_year}-${this.dates.current_month}-1`, -2);
                let date2 = DateRobot.to_yyyymmdd(this.dates.current_year, this.dates.current_month, this.dates.current_last_date);
                if(this.pass_inspect(date1, date2) == false){
                    return false;
                }
                this.target_date_start = date1;
                this.target_date_end = date2;
                this.init();
                layer_popup.close_layer_popup();}
            },
            six:{text:"6 개월", callback:()=>{  
                let date1 = DateRobot.add_month(`${this.dates.current_year}-${this.dates.current_month}-1`, -5);
                let date2 = DateRobot.to_yyyymmdd(this.dates.current_year, this.dates.current_month, this.dates.current_last_date);
                if(this.pass_inspect(date1, date2) == false){
                    return false;
                }
                this.target_date_start = date1;
                this.target_date_end = date2;
                this.init();
                layer_popup.close_layer_popup();}
            },
            twelve:{text:"12 개월", callback:()=>{  
                let date1 = DateRobot.add_month(`${this.dates.current_year}-${this.dates.current_month}-1`, -11);
                let date2 = DateRobot.to_yyyymmdd(this.dates.current_year, this.dates.current_month, this.dates.current_last_date);
                if(this.pass_inspect(date1, date2) == false){
                    return false;
                }
                this.target_date_start = date1;
                this.target_date_end = date2;
                this.init();
                layer_popup.close_layer_popup();}
            },
            user:{text:"직접 입력", callback:()=>{  
                    layer_popup.close_layer_popup();
                    let root_content_height = $root_content.height();
                    layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', 100*245/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
                        date_selector = new TwoDateSelector('#wrapper_popup_date_selector_function', null, {myname:'twodateselector', title:'날짜 선택', data:null, callback_when_set: (selected_data)=>{
                            let date_1 = `${selected_data.data1.year}-${selected_data.data1.month}`;
                            let date_2 = `${selected_data.data2.year}-${selected_data.data2.month}`;
                            let diff_month = DateRobot.diff_month(date_1, date_2);
                            if(diff_month < 0){
                                show_error_message({title:"검색 종료일은 시작일보다 빠를 수 없습니다."});
                                return false;
                            }
                            if(diff_month > 11){
                                show_error_message({title:"최대 12개월 단위로 조회가 가능합니다."});
                                return false;
                            }
                            if(this.pass_inspect(date_1, date_2) == false){
                                return false;
                            }
                            // let date1 = date_1;
                            // let date2 = date_2;
                            this.target_date_start = DateRobot.to_yyyymmdd(selected_data.data1.year, selected_data.data1.month, 1);
                            this.target_date_end = DateRobot.to_yyyymmdd(selected_data.data2.year, selected_data.data2.month, 1);
                            this.init();
                            layer_popup.close_layer_popup();
                        }});
                    });
                }
            }
        };
        let options_padding_top_bottom = 16;
        // let button_height = 8 + 8 + 52;
        let button_height = 52;
        let layer_popup_height = options_padding_top_bottom + button_height + 52*Object.keys(user_option).length;
        let root_content_height = $root_content.height();
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_OPTION_SELECTOR, 100*(layer_popup_height)/root_content_height, POPUP_FROM_BOTTOM, null, ()=>{
        option_selector = new OptionSelector('#wrapper_popup_option_selector_function', this, user_option);
        });
    }

    event_detail(month_date){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_STATISTICS_DETAIL, 100, popup_style, null, ()=>{
            statistics_detail_popup = new Statistics_detail('.popup_statistics_detail', month_date, 'statistics_detail_popup');});
    }

    switch(tab){
        this.tab = tab;
        this.render();
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    upper_right_menu(){
        let popup_style = $root_content.width() > 650 ? POPUP_FROM_BOTTOM : POPUP_FROM_RIGHT;
        layer_popup.open_layer_popup(POPUP_BASIC, POPUP_ADDRESS_statistics_ADD, 100, popup_style, null, ()=>{
            statistics_add_popup = new statistics_add('.popup_statistics_add');
        });
    }

    pass_inspect(date1, date2){
        let inspect = pass_inspector.statistics(date1, date2);
        if(inspect.barrier == BLOCKED){
            let message = {
                title:`기간 설정을 완료하지 못했습니다.`,
                comment:`[${inspect.limit_type}] 이용자께서는 최대 ${inspect.limit_num}개월 단위로 조회 하실 수 있습니다.
                        <p style="font-size:14px;font-weight:bold;margin-bottom:0;color:var(--font-highlight);">PTERS패스 상품을 둘러 보시겠습니까?</p>`
            }
            show_user_confirm (message, ()=>{
                layer_popup.all_close_layer_popup();
                sideGoPopup("pters_pass_main");
            });

            return false;
        }
    }
}

class Statistics_func{
    static read(list, data, callback, async, error_callback){
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
        //지점 리스트 서버에서 불러오기
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
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        return false;
                    }
                }
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
                if(error_callback != undefined){
                    error_callback();
                }
                console.log('server error');
            }
        });
    }

    static update(data, callback, error_callback){
        //지점 추가
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

    static delete(data, callback, error_callback){
        //지점 추가
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
}

