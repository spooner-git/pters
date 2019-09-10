class Home{
    constructor(targetHTML, instance){
        this.page_name = 'home';
        this.targetHTML = targetHTML;
        this.instance = instance;
    }

    init(){
        if(current_page != this.page_name){
            return false;
        }

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

        let onclick_test_spinner = `layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_spin_selector', ${100*245/windowHeight}, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
            spinner_selector = new SpinSelector('#wrapper_popup_spin_selector_function', null, 
            {myname:'one_row', title:'스피너 선택',data:[{name:123, value:123}, {name:234, value:234}, {name:345, value:345}, {name:234, value:234}, {name:234, value:234}, {name:234, value:234}], callback_when_set: ()=>{
                console.log('okok');
            }, unit:'개'});
        });`;

        let onclick_test_time = `layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_time_selector', ${100*245/windowHeight}, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
            time_selector = new TimeSelector('#wrapper_popup_time_selector_function', null, {myname:'time', title:'시간 선택',data:null, callback_when_set: ()=>{console.log('시간okok');}});
        });`;

        let onclick_test_date = `layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', ${100*245/windowHeight}, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
            date_selector = new DateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth',title:'날짜 선택',data:null, callback_when_set: ()=>{console.log('시간okok');}});
        });`;

        let onclick_test_two_date = `layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_selector', ${100*245/windowHeight}, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
            date_selector = new TwoDateSelector('#wrapper_popup_date_selector_function', null, {myname:'birth',title:'날짜 선택',data:null, callback_when_set: ()=>{console.log('시간okok');}});
        });`;

        let onclick_test_datepicker = `layer_popup.open_layer_popup(POPUP_BASIC, 'popup_basic_date_picker_selector', ${100*305/windowHeight}, POPUP_FROM_BOTTOM, {'select_date':null}, ()=>{
            date_picker_selector = new DatePickerSelector('#wrapper_popup_date_picker_selector_function', null, {myname:'datepicker',title:'날짜 선택',data:null, callback_when_set: (data)=>{console.log(data);}});
        });`;


        html_temp.push(`<div>${class_center_name}</div>
                    <div>${class_type_name}</div>
                    <div>오늘 일정 ${today_schedule_num}건</div>
                    <div>총 회원수 ${total_member_num}명</div>
                    <div>이번달 신규 ${new_member_num}명</div>
                    <div>종료 임박 ${to_be_ended_member_num}명</div>
                    <button onclick="${onclick_test_spinner}">spin</button>
                    <button onclick="${onclick_test_time}">time</button>
                    <button onclick="${onclick_test_date}">date</button>
                    <button onclick="${onclick_test_two_date}">date2</button>
                    <button onclick="${onclick_test_datepicker}">date</button>
                    <div style="margin-top:50px">
                        <button onclick="location.href='/login/logout/'">로그아웃</button>
                    </div>
                    `);
        
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