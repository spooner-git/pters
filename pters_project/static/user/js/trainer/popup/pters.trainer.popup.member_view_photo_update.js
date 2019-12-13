class Member_view_photo_update{
    constructor(install_target, external_data){
        this.target = {install: install_target, toolbox:'section_member_view_photo_update_toolbox', content:'section_member_view_photo_update_content'};
        this.form_id = 'id_member_view_photo_update_form';

        this.data = {
            src:null,
            file:null,
            member_id: external_data.member_id
        };
        this.uploadCrop;
        this.user_file;
        
        this.orientation;

        // this.init();
        this.set_initial_data();
    }


    init(){
        this.render();
        this.event_croppie();
        $('#upload').trigger('click');
        func_set_webkit_overflow_scrolling(`${this.target.install} .wrapper_middle`, ON);
    }

    set_initial_data (){
        this.init(); 
    }

    clear(){
        setTimeout(()=>{
            document.querySelector(this.target.install).innerHTML = "";
        }, 300);
    }

    render(){
        let top_left = `<span class="icon_left" onclick="layer_popup.close_layer_popup();member_view_photo_update_popup.clear();">${CImg.x()}</span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">프로필 이미지 선택</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:var(--font-highlight);font-weight: 500;" onclick="member_view_photo_update_popup.upper_right_menu()">등록</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_member_view_photo_update .wrapper_top').style.border = 0;
        document.querySelector('.popup_member_view_photo_update .obj_input_box_full').style.height = windowHeight - 60 - 65+'px';
        PopupBase.top_menu_effect(this.target.install);
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
        let croppie = this.dom_row_croppie();
        let html =  '<div class="obj_input_box_full">' +  croppie  + '</div>';

        return html;
    }

    dom_row_toolbox(){
        // let title = "프로필 이미지 업로드";
        // let html = `
        // <div class="member_view_photo_update_upper_box" style="">
        //     <div style="display:inline-block;width:320px;">
        //         <span style="display:inline-block;width:320px;font-size:23px;font-weight:bold">
        //             ${title}
        //         </span>
        //         <span style="display:none;">${title}</span>
        //     </div>
        // </div>
        // `;
        let html = "";
        return html;
    }

    dom_row_croppie(){
        let html = `<div class="upload-result" style="display:none;">result</div>
                    <div style="display:none;"><img id="result"></div>
                    <div id="upload-croppie"></div>
                    <input type="file" id="upload" value="Choose a file" accept="image/*" style="width:0">
                    <!--<input type="file" id="upload" value="Choose a file" accept="image/*" style="visibility:hidden">-->

                    ${this.dom_row_rotate_button()}

                    `;
        return html;
    }

    dom_row_rotate_button(){
        let id = "image_rotate_button";
        let title = "";
        let url = CImg.repeat("", {"vertical-align":"middle"});
        let style = {"padding":"3px 15px"};
        let onclick= ()=>{
            this.event_croppie_rotate();
        };
        let html = CComponent.icon_button (id, title, url, style, onclick);
        return html;
    }

    event_croppie(){
        this.uploadCrop;
        let self = this;

		this.uploadCrop = $('#upload-croppie').croppie({
			viewport: {
				width: 300,
				height: 300
				// type: 'circle'
            },
            enableOrientation: true,
            enableExif: true,
        });

		$('#upload').on('change', function(){ self.readFile(this); });
		$('.upload-result').on('click', function(){
			self.uploadCrop.croppie('result', {
				type: 'base64',
				size: 'viewport',
                format: 'png'
			}).then(function (resp) {
                // $('#result').attr('src', resp);
                self.data.src = resp;
                self.data.file = resp;
                self.send_data();
			});
		});
    }

    event_croppie_rotate(){
        // this.uploadCrop.croppie('rotate', 90);
        if(this.orientation == undefined || this.orientation == 1){
            this.orientation = 6; //시계방향 90도
        }else if(this.orientation == 6){
            this.orientation = 3; // 180도
        }else if(this.orientation == 3){
            this.orientation = 8; //반시계 90도
        }else if(this.orientation == 8){
            this.orientation = 1; //원래대로
        }

        this.uploadCrop.croppie('bind', {
            url:this.user_file,
            orientation: this.orientation
        });
    }

    readFile(input) {
        if (input.files && input.files[0]) {
           var reader = new FileReader();
           let self = this;
           reader.onload = function (e) {
               self.user_file = e.target.result;
               $('.upload-croppie').addClass('ready');
               self.uploadCrop.croppie('bind', {
                   url: e.target.result
               }).then(function(){
                   console.log('jQuery bind complete');
               });
               
           }
           // self.data.file = input.files[0];
           reader.readAsDataURL(input.files[0]);
       }
       else {
        //    swal("Sorry - you're browser doesn't support the FileReader API");
       }
   }

    send_data(){
        let data = {"photo": this.data.src};
        show_user_confirm(`<img src="${this.data.src}" style="width:100%;border-radius:50%;">`,  ()=>{
                            let form_data = new FormData();
                            form_data.append('profile_img_file', this.data.file);
                            form_data.append('member_id', this.data.member_id);
                            $.ajax({
                                url: '/update_member_profile_img/',
                                data: form_data,
                                dataType : 'html',
                                type:'POST',
                                processData: false,
                                contentType: false,
                                enctype:'multipart/form-data',

                                beforeSend: function (xhr, settings) {
                                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                                        xhr.setRequestHeader("X-CSRFToken", csrftoken);
                                    }
                                    ajax_load_image(SHOW);
                                },

                                success:function(data){
                                    let jsondata = JSON.parse(data);
                                    check_app_version(data.app_version);
                                    if(jsondata.messageArray.length>0){
                                        show_error_message(jsondata.messageArray);
                                        return false;
                                    }

                                    layer_popup.close_layer_popup(); // confirm 팝업 닫기
                                    layer_popup.close_layer_popup(); // 사진 조절 팝업 닫기
                                    
                                    try{
                                        current_page.init();
                                    }catch(e){}
                                    try{
                                        this.external_data.callback();
                                    }catch(e){}
                                },

                                complete:function(){
                                    ajax_load_image(HIDE);
                                },

                                error:function(){
                                    //alert('통신이 불안정합니다.');
                                    show_error_message('통신이 불안정합니다.');
                                }
                            });
                        });
         
        // let data = {
        //             "center_id":"", 
        //             "subject_cd":this.data.program_category_sub_code[0],
        //             "subject_detail_nm":this.data.program_name,
        //             "start_date":"", "end_date":"", 
        //             "class_hour":60, "start_hour_unit":1, "class_member_num":1
        // };

        // Program_func.create(data, ()=>{
        //     program_list_popup.init();
        //     this.clear();
        //     layer_popup.close_layer_popup();
        // });
    }


    upper_right_menu(){
        $('.upload-result').trigger('click');
        // this.send_data();
    }
}
