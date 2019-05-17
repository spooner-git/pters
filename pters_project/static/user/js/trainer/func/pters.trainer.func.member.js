class Member{
    constructor(targetHTML, instance){
        this.targetHTML = targetHTML;
        this.instance = instance;
    }

    init(){
        let component = this.static_component();
        document.querySelector(this.targetHTML).innerHTML = component.initial_page
        // $(this.targetHTML).html(
        //     component.initial_page
        // )
        
    }

    static_component(){
        return(
            {
                "initial_page":`<div>회원 페이지!!!!!</div>`
            }
        )
    }
}