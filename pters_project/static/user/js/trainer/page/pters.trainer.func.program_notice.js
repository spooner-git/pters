class ProgramNotice_func{
    static create(data, callback, error_callback){
        $.ajax({
            url:'/trainer/add_program_notice_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        if(error_callback != undefined){
                            error_callback();
                        }
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static read(data, callback, error_callback){
        //데이터 형태 {"ticket_id":""};
        $.ajax({
            url:'/trainer/get_program_notice_info/',
            type:'GET',
            data: data,
            dataType : 'JSON',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data){
                check_app_version(data.app_version);
                // let data = JSON.parse(data_);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        if(error_callback != undefined){
                            error_callback();
                        }
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }
    static read_all(data, callback, error_callback){
        //데이터 형태 {"ticket_id":""};
        $.ajax({
            url:'/trainer/get_program_notice_list/',
            type:'GET',
            dataType : 'JSON',

            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },

            //보내기후 팝업창 닫기
            complete:function(){

            },

            //통신성공시 처리
            success:function(data){
                check_app_version(data.app_version);
                // let data = JSON.parse(data_);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        if(error_callback != undefined){
                            error_callback();
                        }
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },

            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }


    static delete(data, callback, error_callback){
        //데이터 형태 {"ticket_id":""};
        $.ajax({
            url:'/trainer/delete_program_notice_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        if(error_callback != undefined){
                            error_callback();
                        }
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }

    static update(data, callback, error_callback){
        //데이터 형태 {"ticket_id":"", "ticket_name":"", "ticket_note":""};
        $.ajax({
            url:'/trainer/update_program_notice_info/',
            type:'POST',
            data: data,
            dataType : 'html',
    
            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
    
            //보내기후 팝업창 닫기
            complete:function(){
                
            },
    
            //통신성공시 처리
            success:function(data_){
                let data = JSON.parse(data_);
                check_app_version(data.app_version);
                if(data.messageArray != undefined){
                    if(data.messageArray.length > 0){
                        show_error_message({title:data.messageArray});
                        if(error_callback != undefined){
                            error_callback();
                        }
                        return false;
                    }
                }
                if(callback != undefined){
                    callback(data);
                }
            },
    
            //통신 실패시 처리
            error:function(){
                if(error_callback != undefined){
                    error_callback();
                }
                show_error_message({title:'통신 오류 발생', comment:'잠시후 다시 시도해주세요.'});
                location.reload();
            }
        });
    }


}