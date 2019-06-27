class Home{
    constructor(targetHTML, instance){
        this.page_name = 'home';
        this.targetHTML = targetHTML;
        this.instance = instance;
    }

    init(){
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page

        
        this.render_upper_box();
        this.render_menu();
    }

    render_upper_box(){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.getElementById('home_display_panel').innerHTML = component.home_upper_box;
    }

    render_menu(){
        let html_temp = [];
        let time_select_popup = `layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', POPUP_SIZE_WINDOW, POPUP_FROM_PAGE,
        {'popup_title':'', 'popup_comment':'시간 선택 팝업',
        'onclick_function':null})`;

        html_temp.push(`<div>${class_center_name}</div>
                    <div>${class_type_name}</div>
                    <div>오늘 일정 ${today_schedule_num}건</div>
                    <div>총 회원수 ${total_member_num}명</div>
                    <div>이번달 신규 ${new_member_num}명</div>
                    <div>종료 임박 ${to_be_ended_member_num}명</div>
                    <button onclick="event.preventDefault();${time_select_popup}">시간 선택 임시</button>`)
        
        document.querySelector('#home_content_wrap').innerHTML = html_temp.join("");
    }


    static_component(){
        return(
            {   "home_upper_box":`<div class="home_upper_box">
                                    <div style="display:inline-block;width:200px;">
                                        <span style="font-size:20px;font-weight:bold;">홈</span>
                                    </div>
                                </div>
                                `
                ,
                "initial_page":`<div id="home_display_panel"></div><div id="home_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div>`
            }
        )
    }
}