class Mypage_photo_update{
    constructor(install_target){
        this.target = {install: install_target, toolbox:'section_mypage_photo_update_toolbox', content:'section_mypage_photo_update_content'};
        this.form_id = 'id_mypage_photo_update_form';


        this.data = {
            src:null,
            file:null
        };
        this.uploadCrop;

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
        let top_left = `<span class="icon_left"><img src="/static/common/icon/icon_x_black.png" onclick="layer_popup.close_layer_popup();mypage_photo_update_popup.clear();" class="obj_icon_prev"></span>`;
        let top_center = `<span class="icon_center"><span id="ticket_name_in_popup">&nbsp;</span></span>`;
        let top_right = `<span class="icon_right"><span style="color:#fe4e65;font-weight: 500;" onclick="mypage_photo_update_popup.upper_right_menu()">등록</span></span>`;
        let content =   `<form id="${this.form_id}"><section id="${this.target.toolbox}" class="obj_box_full popup_toolbox">${this.dom_assembly_toolbox()}</section>
                        <section id="${this.target.content}" class="popup_content">${this.dom_assembly_content()}</section></form>`;
        
        let html = PopupBase.base(top_left, top_center, top_right, content, "");

        document.querySelector(this.target.install).innerHTML = html;
        document.querySelector('.popup_mypage_photo_update .wrapper_top').style.border = 0;
        document.querySelector('.popup_mypage_photo_update .obj_input_box_full').style.height = windowHeight - 60 - 65+'px';
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
        // <div class="mypage_photo_update_upper_box" style="">
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
                    <input type="file" id="upload" value="Choose a file" accept="image/*" style="visibility:hidden">
                    `;
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
			enableExif: true
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

    readFile(input) {
        if (input.files && input.files[0]) {
           var reader = new FileReader();
           let self = this;
           reader.onload = function (e) {
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
                            $.ajax({
                                url: '/trainer/update_trainer_profile_img/',
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
                                    let jsondata = $.parseJSON(data);
                                    if(jsondata.messageArray.length>0){
                                        //alert(jsondata.messageArray);
                                        show_error_message(jsondata.messageArray);
                                    }
                                    layer_popup.close_layer_popup(); // confirm 팝업 닫기
                                    layer_popup.close_layer_popup(); // 사진 조절 팝업 닫기
                                    try{
                                        mypage_popup.init();
                                    }catch(e){
                                        console.log(e);
                                    }
                                    try{
                                        home.init();
                                    }catch(e){
                                        console.log(e);
                                    }
                                    try{
                                        menu.init();
                                    }catch(e){
                                        console.log(e);
                                    }
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
