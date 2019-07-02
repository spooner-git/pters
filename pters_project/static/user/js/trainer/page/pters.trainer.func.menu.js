class Menu{
    constructor(targetHTML, instance){
        this.page_name = 'menu';
        this.targetHTML = targetHTML;
        this.instance = instance;
    }

    init(){
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page

        this.menu_items = {    
                                ticket: {visible: true, name:"수강권"},
                                lecture: {visible: true, name:"수업"},
                                statistics: {visible: true, name:"통계"},
                                settings: {visible: true, name:"설정"},
                                pters_pass: {visible: true, name:"PTERS 패스"},
                                store: {visible: true, name:"스토어"},
                                notice: {visible: true, name:"PTERS 공지"}
                            }

        let user_options = {store: {visible :false}, notice: {visible :false}};
        this.render_upper_box();
        this.render_menu();
    }

    render_upper_box(){
        if(current_page != this.page_name){
            return false;
        }

        let component = this.static_component();
        document.getElementById('menu_display_panel').innerHTML = component.menu_upper_box;
    }

    render_menu(options){
        if(options != undefined){
            for(let item in options){
                this.menu_items[item].visible= options[item].visible;
            }
        }

        let html_temp = [];
        for(let el in this.menu_items){
            let item_el = this.menu_items[el];
            if(item_el.visible == false){
                continue;
            }

            html_temp.push(`<div class="menu_element_wrap" onclick="sideGoPage('${el}', this)">
                                <img src="/static/common/icon/icon_more.png">
                                <span>${item_el.name}</span>
                            </div>`)
        }
        
        document.querySelector('#menu_content_wrap').innerHTML = html_temp.join("");
    }


    static_component(){
        return(
            {   "menu_upper_box":`<div class="menu_upper_box">
                                    <div style="display:inline-block;width:200px;">
                                        <span style="font-size:20px;font-weight:bold;">전체</span>
                                    </div>
                                </div>
                                `
                ,
                "initial_page":`<div id="menu_display_panel"></div><div id="menu_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;min-height:${windowHeight}px"></div>`
                // "initial_page":`<div id="menu_display_panel"></div><div id="menu_content_wrap" class="pages" style="top:unset;left:unset;background-color:unset;position:relative;"></div>`
            }
        )
    }
}