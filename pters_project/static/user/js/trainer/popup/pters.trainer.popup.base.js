class PopupBase{
    static base(top_left, top_center, top_right, content, bottom){
            let html = `
                        <div class="wrapper_top">
                            ${top_left}
                            ${top_center}
                            ${top_right}
                        </div>
                        <div class="wrapper_middle" style="height:${windowHeight-55}px;overflow-y:auto">
                            ${content}
                        </div>
                        <div class="wrapper_bottom">
                            ${bottom}
                        </div>
                        `;
                return html;
    }
}