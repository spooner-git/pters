
//ajax로 불러오는 html내에 있는 script 파일을 가져와서 실행
function dynamic_added_script_exe(script_url, callback){
    let script = document.createElement("script");
    script.addEventListener("load", function(event) {
        callback();
    });
    script.src = script_url;
    script.async = true;
    document.getElementsByTagName("script")[0].parentNode.appendChild(script);
}


function func_set_webkit_overflow_scrolling(target_selector){
    if(os == IOS){
            let $selector = $(target_selector);
            $selector.scrollTop(1);
            $selector.scroll(function(e){
                const popupHeight = $selector.height();
                const scrollHeight = $selector.prop('scrollHeight');
                const scrollLocation = $selector.scrollTop();
                if(scrollHeight > popupHeight+1){
                if(popupHeight + scrollLocation == scrollHeight){
                        $selector.animate({scrollTop : scrollLocation-1}, 10);
                    }else if(popupHeight + scrollLocation == popupHeight){
                        $selector.animate({scrollTop : scrollLocation+1}, 10);
                    }
                }
                
            });
        }
    }