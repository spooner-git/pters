
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