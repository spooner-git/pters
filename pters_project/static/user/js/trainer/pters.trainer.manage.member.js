$(document).ready(function(){
    /*
    //#####################페이지 들어오면 초기 시작 함수//#####################
        DataFormattingDict('ID');
        DataFormatting('current');
        DataFormatting('finished');
        memberListSet('current','name')
        memberListSet('finished','name')
    //#####################페이지 들어오면 초기 시작 함수//#####################
    */

    $(".btn-group > .btn").click(function(){
 		$(this).addClass("active").siblings().removeClass("active");
	});

    var ts;
    $("body").bind("touchstart",function(e){
    ts = e.originalEvent.touches[0].clientY;
    	});
    $("body").bind("touchend",function(e){
    	var te = e.originalEvent.changedTouches[0].clientY;
    	if(ts>te+5){
    		$("#float_btn").fadeOut()
    	}else if(ts<te-5){
    		$("#float_btn").fadeIn()
    	}
    })


    $('li').click(function(){
        if($('.dropdown').hasClass('open')){
          $('html, body').css('overflow-y','auto')
        }else{
          $('html, body').css('overflow-y','hidden')
        }
    })

////////////신규 회원등록 레이어 팝업 띄우기//////////////////////////////////////////////////////////////
      //플로팅 버튼 Start
    $('#float_btn').click(function(){
      $("#float_btn").animate({opacity:'1'})
      if($('#shade').css('display')=='none'){
        $('#shade').show();
        $('#float_inner1').animate({'opacity':'1','bottom':'85px'},120);
        $('#float_inner2').animate({'opacity':'1','bottom':'145px'},120);
        $('#float_btn').addClass('rotate_btn');
      }else{
        $('#shade').hide();
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn').removeClass('rotate_btn');
      }
    });
    //플로팅 버튼 End

    //플로팅버튼 (아래)
    $('#float_inner1').click(function(){
        $('#page_addmember').fadeIn('fast')
        $('#shade').hide()
        $('#shade3').fadeIn('fast');
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').fadeOut();
        $('#uptext2').text('신규 회원 등록')
        $('#page-base').fadeOut();
        $('#page-base-addstyle').fadeIn();
        scrollToDom($('#page_addmember'))
        if($('body').width()<600){
          $('#page_managemember').hide();
        }

        $('#inputError').css('display','none')
        $('#fast_check').val('0')
        $('#form_birth').val('')
        $('#memberBirthDate, #memberBirthDate_info').html('')
        birth_dropdown_set()

        $('#memberSearchButton').attr('data-type','')
        $('#memberSex .selectboxopt').removeClass('selectbox_disable')
    })

    //PC버전 회원추가 버튼
    $('.ymdText-pc-add').click(function(){
        $('#page_addmember').fadeIn('fast')
        $('#shade').fadeIn('fast');
        $('#uptext2').text('신규 회원 등록')
        $('#page-base').fadeOut();
        $('#page-base-addstyle').fadeIn();
        scrollToDom($('#page_addmember'))

        $('#inputError').css('display','none')
        $('#fast_check').val('0')
        $('#form_birth').val('')
        $('#memberBirthDate, #memberBirthDate_info').html('')
        birth_dropdown_set()

        $('#memberSearchButton').attr('data-type','')
        $('#memberSex .selectboxopt').removeClass('selectbox_disable')
    })

    //플로팅버튼 (위)
    $('#float_inner2').click(function(){
        alert('float_inner2')
        /*
        $('#page_addmember').fadeIn('fast')
        $('#shade').hide()
        $('#shade3').fadeIn('fast');
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').fadeOut();
        $('#uptext2').text('신규 회원 등록')
        $('#page-base').fadeOut();
        $('#page-base-addstyle').fadeIn();
        scrollToDom($('#page_addmember'))
        if($('body').width()<600){
          $('#page_managemember').hide();
        }

        $('#inputError').css('display','none')
        $('#fast_check').val('0')
        $('#form_birth').val('')
        $('#memberBirthDate, #memberBirthDate_info').html('')
        birth_dropdown_set()
        */
    })

    $(document).on('click','#upbutton-x,#upbutton-x-modify,.cancelBtn, ._btn_close_info_PC',function(){
        closePopup()
    })
////////////신규 회원등록 레이어 팝업 띄우기//////////////////////////////////////////////////////////////

    var alignType = "name"
    $('.alignSelect').change(function(){
        if($(this).val()=="회원명 가나다 순"){
            memberListSet('current','name');
            memberListSet('finished','name');
            alignType = 'name'
        }else if($(this).val()=="남은 횟수 많은 순"){
            memberListSet('current','count','yes');
            alignType = 'countH'
        }else if($(this).val()=="남은 횟수 적은 순"){
            memberListSet('current','count');
            alignType = 'countL'
        }else if($(this).val()=="시작 일자 과거 순"){
            memberListSet('current','date');
            memberListSet('finished','date');
            alignType = 'startP'
        }else if($(this).val()=="시작 일자 최근 순"){
            memberListSet('current','date','yes');
            memberListSet('finished','date','yes');
            alignType = 'startR'
        }
    })

//#####################회원정보 팝업 //#####################

    $(document).on('click','tr.memberline',function(){  //회원이름을 클릭했을때 새로운 팝업을 보여주며 정보를 채워준다.
        var userID = $(this).find('._id').attr('data-name');
        if($('body').width()<600){
            open_member_info_popup_mobile(userID)
            get_indiv_repeat_info(userID)
            set_member_lecture_list()
        }else if($('body').width()>=600){
            open_member_info_popup_pc(userID)
            get_indiv_repeat_info(userID)
            set_member_lecture_list()
            $('#info_shift_base, #info_shift_lecture').show()
            $('#info_shift_schedule').hide()
            $('#select_info_shift_lecture').css('color','#fe4e65')
            $('#select_info_shift_schedule').css('color','#282828')
        }
    });

    //PC 회원삭제버튼
    $(document).on('click','img._info_delete',function(e){
        e.stopPropagation()
        var selectedUserId = $(this).parent('td').siblings('._id').text()
        var selectedUserName = $(this).parent('td').siblings('._tdname').text()
        $('#popup_delete_title').text('회원 삭제')
        $('#popup_delete_question').html('<p>정말 '+selectedUserName+' 회원님을 삭제하시겠습니까?<br>삭제하면 복구할 수 없습니다.</p>')

        
        $('#deleteMemberId').val(selectedUserId)
        //$('.confirmPopup').fadeIn('fast');
        $('#cal_popup_plandelete').fadeIn('fast');
        $('#shade3').fadeIn('fast');
    })

    //PC 회원삭제버튼
    $(document).on('click','button._info_delete',function(){
      //$('.confirmPopup').fadeIn('fast');
      $('#cal_popup_plandelete').fadeIn('fast');
      $('#shade3').fadeIn('fast');
    })

    //Mobile 회원삭제버튼
    $('#infoMemberDelete').click(function(){
      //$('.confirmPopup').fadeIn('fast');
      $('#cal_popup_plandelete').fadeIn('fast');
      $('#shade3').fadeIn('fast');
    });

    /* PC 회원정보보기 아이콘
    $(document).on('click','img._info_view',function(e){
        e.stopPropagation()
        var userID = $(this).parent('td').siblings('._id').text()
        if($('body').width()<600){
            open_member_info_popup_mobile(userID)
        }else if($('body').width()>=600){
            open_member_info_popup_pc(userID)
            get_indiv_repeat_info(userID)
            set_member_lecture_list()
            $('#info_shift_base, #info_shift_lecture').show()
            $('#info_shift_schedule').hide()
            $('#select_info_shift_lecture').css('color','#fe4e65')
            $('#select_info_shift_schedule').css('color','#282828')
        }
    })
    */

    /* PC 회원정보수정 아이콘
    $(document).on('click','img._info_modify',function(e){
        e.stopPropagation()
        var userID = $(this).parent('td').siblings('._id').text()
        if($('body').width()<600){
            open_member_info_popup_mobile(userID)
        }else if($('body').width()>=600){
            open_member_info_popup_pc(userID)
            modify_member_info_pc(userID)
            get_indiv_repeat_info(userID)
            set_member_lecture_list()
            $('#memberInfoPopup_PC input').addClass('input_avaiable').attr('disabled',false);
            $('button._info_modify').text('완료').attr('data-type',"modify")
            $('#info_shift_base, #info_shift_lecture').show()
            $('#info_shift_schedule').hide()
            $('#select_info_shift_lecture').css('color','#fe4e65')
            $('#select_info_shift_schedule').css('color','#282828')
        }
    })
    */

    /* PC 회원정보수정 팝업내 버튼
    $(document).on('click','button._info_modify',function(){
      var userID = $('#memberId_info_PC').text()
      var lectureID = $(this).parent('div').attr('data-lecid')
      //modify_member_info_pc(userID)
      if($(this).attr('data-type')=="view"){
        $('#memberInfoPopup_PC input').addClass('input_avaiable').attr('disabled',false);
        $(this).text('완료').attr('data-type',"modify");
      }else if($(this).attr('data-type')=="modify"){
        console.log('수정송신')
        send_member_modified_data_pc()
      }else if($(this).attr('data-type')=="resend"){

      }
    })
    */

    //회원 등록이력 수정 버튼
    $(document).on('click','#memberRegHistory_info_PC img, #memberRegHistory_info img',function(){
        $(this).attr('src','/static/user/res/btn-pt-complete.png')
        if($('#currentMemberList').css('display') == "block"){
          var Data = DB
        }else if($('#finishedMemberList').css('display') == "block"){
           var Data = DBe
        }
        var userID = $('#memberId_info_PC').text()
        if($('body').width()<600){
            var userID = $('#memberId').val()
        }
        var userName = Data[userID].name
        var lectureID = $(this).attr('data-leid')
        $('#form_member_name').val(userName)
        $('#form_lecture_id').val(lectureID)
        if($(this).attr('data-type')=="view"){
            var myRow = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').find('input')
            myRow.addClass('input_avaiable').attr('disabled',false);
            $('#memberRegHistory_info_PC img[data-leid!='+$(this).attr('data-leid')+']').hide()
            $(this).text('완료').attr('data-type',"modify");
        }else if($(this).attr('data-type')=="modify"){
            console.log('수정송신')
            send_member_modified_data_pc()
        }else if($(this).attr('data-type')=="resend"){

        }
    })


    $('#popup_delete_btn_no, #cal_popup_plandelete .popup_close_x_button').click(function(){
      //$('.confirmPopup').fadeOut('fast');
      $('#cal_popup_plandelete').fadeOut('fast');
      $('#shade3').fadeOut('fast');
    });

    $('#select_info_shift_lecture').click(function(){
        $('#info_shift_schedule').hide()
        $('#info_shift_lecture').show()
        $(this).css('color','#fe4e65')
        $(this).siblings('.button_shift_info').css('color','#282828')
    })

    $('#select_info_shift_schedule').click(function(){
        $('#info_shift_lecture').hide()
        $('#info_shift_schedule').show()
        $(this).css('color','#fe4e65')
        $(this).siblings('.button_shift_info').css('color','#282828')
    })

    

    $(document).on('click','div.lectureType_RJ',function(){
        $('.resendPopup').fadeIn('fast').attr({'data-type':'resend','data-leid':$(this).attr('data-leid')});
        show_shadow_reponsively()
    })

    $(document).on('click','div.lectureType_DELETE',function(){
        $('.resendPopup').fadeIn('fast').attr({'data-type':'resend','data-leid':$(this).attr('data-leid')});
        show_shadow_reponsively()
    })

    $(document).on('click','div.lecConnectType_IP',function(){
        $('.lectureStateChangePopup').fadeIn('fast').attr({'data-type':'resend','data-leid':$(this).attr('data-leid')});
        show_shadow_reponsively()
    })

    $(document).on('click','div.lectureType_WAIT, div.lectureType_VIEW',function(){
        $('.lectureConnectStateChangePopup').fadeIn('fast').attr({'data-type':'resend','data-leid':$(this).attr('data-leid')});
        show_shadow_reponsively()
    })




    $('._btn_close_resend_PC, ._btn_close_statechange_PC').click(function(){
       $(this).parents('.popups').fadeOut('fast')
       hide_shadow_responsively()
    })

    $('span.resend').parent('div').click(function(){
        resend_member_reg_data_pc()
        $('.resendPopup').css('display','none')
        $('#shade3').css('display','none')
    })

    $('span.delete_resend').parent('div').click(function(){
        delete_member_reg_data_pc()
        $('.resendPopup').css('display','none')
        hide_shadow_responsively()
    })


    $('span.refund').parent('div').click(function(){
        refund_member_lecture_data()
        $('.lectureStateChangePopup').css('display','none')
        //$('#shade3').css('display','none')
    })

    $('span.cancel_refund').parent('div').click(function(){
        $('.lectureStateChangePopup').css('display','none')
        hide_shadow_responsively()
    })


    $('span.connectchange').parent('div').click(function(){
        var stateCode =  $(this).attr('data-stat')
        disconnect_member_lecture_data(stateCode)
        $('.lectureConnectStateChangePopup').css('display','none')
        //$('#shade3').css('display','none')
    })
    $('span.cancel_connectchange').parent('div').click(function(){
        $('.lectureConnectStateChangePopup').css('display','none')
        hide_shadow_responsively()
    })


    


    //회원 정보팝업의 일정정보내 반복일정 삭제버튼
    $(document).on('click','.deleteBtn',function(){ //일정요약에서 반복일정 오른쪽 화살표 누르면 휴지통 열림
        var $btn = $(this).find('div')
        if($btn.css('width')=='0px'){
          $btn.animate({'width':'40px'},300)
          $btn.find('img').css({'display':'block'})
        $('.deleteBtnBin').not($btn).animate({'width':'0px'},230);
        $('.deleteBtnBin img').not($btn.find('img')).css({'display':'none'})
        }
    })


    $(document).on('click','div.deleteBtnBin',function(){
        var id_info = $(this).parents('div.summaryInnerBox').attr('data-id')
        $('#id_repeat_schedule_id_confirm').val(id_info)
        var repeat_schedule_id = $(this).parents('.summaryInnerBox').attr('data-id')
        $('#cal_popup_plandelete').fadeIn().attr('data-id',repeat_schedule_id)
        $('#shade3').show()
        deleteTypeSelect = 'repeatinfodelete'
    })

    $(document).on('click','.summaryInnerBoxText, .summaryInnerBoxText2',function(){ //반복일정 텍스트 누르면 휴지통 닫힘
        var $btn = $('.deleteBtnBin')
          $btn.animate({'width':'0px'},230)
          $btn.find('img').css({'display':'none'})
    })

    $('#popup_delete_btn_yes').click(function(){
        if(deleteTypeSelect == "repeatinfodelete"){
            var repeat_schedule_id = $(this).parent('#cal_popup_plandelete').attr('data-id')
            $.ajax({
                url:'/schedule/delete_repeat_schedule/',
                type:'POST',
                data:{"repeat_schedule_id" : repeat_schedule_id, "next_page" : '/trainer/cal_day_ajax/'},
                dataType:'html',

                beforeSend:function(){
                    beforeSend()
                },

                //통신성공시 처리
                success:function(data){
                    var jsondata = JSON.parse(data)
                    console.log(jsondata.messageArray)
                    if(jsondata.messageArray.length>0){
                        $('#errorMessageBar').show()
                        $('#errorMessageText').text(jsondata.messageArray)
                    }else{
                        $('#errorMessageBar').hide()
                        $('#errorMessageText').text('')
                        var userID = $('#memberId_info_PC').text()
                        get_indiv_repeat_info(userID)
                        $('#cal_popup_plandelete').css('display','none')
                        deleteTypeSelect = "memberinfodelete"
                        $('#shade3').hide()
                    }
                  },

                //보내기후 팝업창 닫기
                complete:function(){
                    completeSend()
                },

                //통신 실패시 처리
                error:function(){
                    $('#errorMessageBar').show()
                    $('#errorMessageText').text('통신 에러: 관리자 문의')
                },
            })
        }else{
            //$('.confirmPopup').fadeOut('fast');
            $('#cal_popup_plandelete').fadeOut('fast');
            $('#shade3').fadeOut('fast');
            deleteMemberAjax();
        }       
    })
//#####################회원정보 팝업 //#####################



//#####################회원정보 도움말 팝업 //#####################
    $('._regcount, ._remaincount').mouseenter(function(){
        var LOCTOP = $(this).offset().top
        var LOCLEFT = $(this).offset().left
        if($('#currentMemberList').width()>=600){
            $('.instructPopup').fadeIn().css({'top':LOCTOP+40,'left':LOCLEFT})
        };

        if($(this).hasClass('_regcount')){
            $('.instructPopup').text('등록횟수는 회원님께서 계약시 등록하신 횟수를 의미합니다.')
        }else if($(this).hasClass('_remaincount')){
            $('.instructPopup').text('남은횟수는 회원님의 등록횟수에서 현재까지 진행완료된 강의 횟수를 뺀 값을 의미합니다.')
        }
    });

 
    $('#alignBox,.centeralign').mouseenter(function(){
        $('.instructPopup').fadeOut();
    }); 
//#####################회원정보 도움말 팝업 //#####################

    var select_all_check = false;

    $('#memberSearchButton').click(function(){
        var searchID = $('#memberSearch_add').val()
        $.ajax({
            url:'/trainer/get_member_info/',
            type:'POST',
            data: {'id':searchID},
            dataType : 'html',

            beforeSend:function(){
                beforeSend()
            },

            //보내기후 팝업창 닫기
            complete:function(){
                completeSend()
            },

            //통신성공시 처리
            success:function(data){
                var jsondata = JSON.parse(data);
                console.log(jsondata)
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray)
                }else{
                    $('#errorMessageBar').hide()
                    $('#errorMessageText').text('')
                  id_search_memberLastName = jsondata.lastnameInfo;
                  id_search_memberFirstName = jsondata.firstnameInfo;
                  id_search_memberPhone = jsondata.phoneInfo;
                  id_search_memberBirth = jsondata.birthdayInfo + ''; //형식 1999년 02월 08일
                  id_search_memberEmail = jsondata.emailInfo;
                  id_search_memberId = jsondata.idInfo;
                  id_search_memberSex = jsondata.sexInfo;
                  $('#memberSex .selectboxopt').removeClass('selectbox_checked')
                  fill_member_info_by_ID_search();
                  $('#memberSearchButton').attr('data-type','searched')
                  $('#memberSex .selectboxopt').addClass('selectbox_disable')
                }
                
            },

            //통신 실패시 처리
            error:function(){
                $('#errorMessageBar').show()
                $('#errorMessageText').text('아이디를 입력해주세요')
            },
        })
    })

    $("#datepicker_add, #datepicker2_add").datepicker({
        minDate : 0,
        onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
            $(this).addClass("dropdown_selected");
            check_dropdown_selected();
        }
    });

    $("#datepicker_fast").datepicker({
        minDate : 0,
        onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
            $(this).addClass("dropdown_selected");
            autoDateInput();
            check_dropdown_selected();
        }
    });

    $(document).on("focus","input.lec_start_date, input.lec_end_date",function(){
        $(this).datepicker({
            onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
                $('#'+$(this).attr('data-type').replace(/lec_/gi,'form_')).val($(this).val())
                var startDatepicker = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').find('input.lec_start_date')
                var endDatepicker = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').find('input.lec_end_date')
                console.log(startDatepicker.val(), endDatepicker.val())
                $("input.lec_end_date").datepicker('option','minDate',startDatepicker.val())
                $("input.lec_start_date").datepicker('option','maxDate',endDatepicker.val())
            }
        })
    });


    $("#memberEmail_add").keyup(function(){  //이메일 입력시 하단에 핑크선
        if($(this).val().length>8){
            $(this).addClass("dropdown_selected")
            check_dropdown_selected();
        }else{
            $(this).removeClass("dropdown_selected")
            check_dropdown_selected();
        }
        $('#id_email').val($('#memberEmail_add').val())
    })

    $("#memberLastName_add, #memberFirstName_add").keyup(function(){  //이름 입력시 하단에 핑크선
        if($(this).val().length>=1){
            limit_char(this);
            $(this).addClass("dropdown_selected")
            check_dropdown_selected();
        }else{
            limit_char(this);
            $(this).removeClass("dropdown_selected")
            check_dropdown_selected();
        }
        $('#form_name').val($('#memberLastName_add').val()+$('#memberFirstName_add').val())
        $('#add_member_form_first_name').val($('#memberLastName_add').val())
        $('#add_member_form_last_name').val($('#memberFirstName_add').val())
        $('#add_member_form_name').val($('#memberLastName_add').val()+$('#memberFirstName_add').val())
    })

    $(document).on('click','#memberSex .selectboxopt',function(){
        if($('#memberSearchButton').attr('data-type') == "searched"){
        
        }else{
            $(this).addClass('selectbox_checked')
            $(this).siblings().removeClass('selectbox_checked')
            $('#form_sex').attr('value',$(this).attr('value'))
            check_dropdown_selected();
        }
    })

    $(document).on('click','#memberSex_info .selectboxopt',function(){
        if($('#upbutton-modify').attr('data-type') == "modify"){
            $(this).addClass('selectbox_checked')
            $(this).siblings().removeClass('selectbox_checked')
            $('#form_sex_modify').attr('value',$(this).attr('value'))
        }else{

        }
    })

    $("#memberPhone_add").keyup(function(){  //전화번호 입력시 하단에 핑크선
        if($(this).val().length>8){
            limit_char(this);
            $(this).addClass("dropdown_selected")
            check_dropdown_selected();
        }else{
            limit_char(this);
            $(this).removeClass("dropdown_selected")
            check_dropdown_selected();
        }
        $('#id_username').val($('#memberPhone_add').val())
        $('#id_user_id').val($('#memberPhone_add').val())
    })

    $("#memberCount_add").keyup(function(){  //남은횟수 입력시 하단에 핑크선
        if($(this).val().length>0){
            limit_char(this);
            $(this).addClass("dropdown_selected")
            check_dropdown_selected();
        }else{
            limit_char(this);
            $(this).removeClass("dropdown_selected")
            check_dropdown_selected();
        }
    })

    
    //빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////
    $('#btnCallSimple').click(function(){
        $('#manualReg').hide();
        $('#simpleReg').fadeIn('fast');
        $(this).addClass('selectbox_checked')
        $('#btnCallManual').removeClass('selectbox_checked')
        $('p').removeClass("dropdown_selected")
        $('#memberCount_add_fast').removeClass('dropdown_selected')
        $('#datepicker_add,#datepicker2_add,#memberCount_add,#lecturePrice_add_2').val("")
        $('#fast_check').val('0')
        check_dropdown_selected();
    })

    $('#btnCallManual').click(function(){
        $('#simpleReg').hide()
        $('#manualReg').fadeIn('fast');
        $(this).addClass('selectbox_checked')
        $('#btnCallSimple').removeClass('selectbox_checked')
        $('._due div.checked').removeClass('checked ptersCheckboxInner')
        $('._count div.checked').removeClass('checked ptersCheckboxInner')
        $('p').removeClass("dropdown_selected")
        $('#datepicker_fast,#lecturePrice_add,#memberDue_add_2').val("")
        $('#fast_check').val('1')
        check_dropdown_selected();
    })

    $('._due .ptersCheckbox').parent('td').click(function(){
        $('._due div.checked').removeClass('checked ptersCheckboxInner')
        var pterscheckbox = $(this).find('div')
        $(this).find('div:nth-child(1)').addClass('checked')
        pterscheckbox.find('div').addClass('ptersCheckboxInner')
        if($("#datepicker_fast").val()!=""){
            autoDateInput();
        }
    })

    $('._count .ptersCheckbox').parent('td').click(function(){
        $('._count div.checked').removeClass('checked ptersCheckboxInner')
        var pterscheckbox = $(this).find('div')
        $(this).find('div:nth-child(1)').addClass('checked')
        pterscheckbox.find('div').addClass('ptersCheckboxInner')
        $('#memberCount_add_fast').val(pterscheckbox.attr('data-count'))
        $('#memberCount_add_fast').addClass("dropdown_selected")
        check_dropdown_selected();

    })
    //빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////
    $("#upbutton-check, #pcBtn .submitBtn").click(function(){ //회원 등록 폼 작성후 완료버튼 클릭
        var test = $('#id_search_confirm').val();
        var $form2 = $('#add-member-id-form');
        var url2 = '/login/add_member_info_no_email/';
        if(select_all_check==true){
            if(test==0){
                $.ajax({
                    url:'/login/add_member_info_no_email/',
                    type:'POST',
                    data:$form2.serialize(),
                    dataType : 'html',

                    beforeSend:function(){
                      beforeSend()
                    },

                    //보내기후 팝업창 닫기
                    complete:function(){
                        completeSend()
                        //
                    },

                    //통신성공시 처리
                    success:function(data){
                        var jsondata = JSON.parse(data);
                        ajax_received_json_data_member_manage(data);
                        console.log(jsondata.messageArray)
                        if(messageArray.length>0){
                            $('html').css("cursor","auto")
                            $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                            scrollToDom($('#page_addmember'))
                            $('#errorMessageBar').show()
                            $('#errorMessageText').text(messageArray)
                        }else{
                            add_member_form_func();
                            $('#errorMessageBar').hide()
                            $('#errorMessageText').text('')
                        }
                    },

                    //통신 실패시 처리
                    error:function(){
                      $('#errorMessageBar').show()
                      $('#errorMessageText').text('통신 에러: 관리자 문의')
                    },
                })
            }
            else{
                add_member_form_func();
            }
        }else{
            scrollToDom($('#page_addmember'))
            //$('#errorMessageBar').show();
            //$('#errorMessageText').text('모든 필수 정보를 입력해주세요')
            //입력값 확인 메시지 출력 가능
        }
    })

    $('#upbutton-modify, #infoMemberModify').click(function(){ //모바일 회원정보창에서 수정 눌렀을때
        if($(this).attr('data-type') == "view" ){
            $('#uptext3').text('회원 정보 수정');
            $('#uptext-pc-modify').text('회원 정보 수정');
            $(this).find('img').attr('src','/static/user/res/ptadd/btn-complete-checked.png');
            $('#upbutton-modify').attr('data-type','modify')
            $(this).attr('data-type','modify')

            //$('#fast_check').val('2')
            $('#memberName_info').attr('readonly',false);
            $('#memberId').attr('readonly',true);

            $('#birth_year_info, #birth_month_info, #birth_date_info').prop('disabled',false).removeClass('dropdown_birth_info')
            $('#memberEmail_info').attr('readonly',false);
            $('#memberPhone_info').attr('readonly',false);
            $('#comment_info').attr('readonly',false);
            //$('#memberCount_info').attr('readonly',false);
            //$('#datepicker_info').attr('disabled',false).removeClass('input_disabled_color');
            //$('#datepicker2_info').attr('disabled',false).removeClass('input_disabled_color');
            $('#memberMale_info, #memberFemale_info').removeClass('selectbox_disable')

        }else if($(this).attr('data-type') == "modify" ){
            var $form = $('#member-add-form-modify');
            if(select_all_check==false){
               $.ajax({
                    url:'/trainer/update_member_info/',
                    type:'POST',
                    data:$form.serialize(),
                    dataType : 'html',

                    beforeSend:function(){
                        $('html').css("cursor","wait")
                        $('#upbutton-modify img').attr('src','/static/user/res/ajax/loading.gif')
                    },

                    //보내기후 팝업창 닫기
                    complete:function(){

                    },

                    //통신성공시 처리
                    success:function(data){
                        ajax_received_json_data_member_manage(data);
                        console.log(messageArray)
                        if(messageArray.length>0){
                            $('html').css("cursor","auto")
                            $('#upbutton-modify img').attr('src','/static/user/res/ptadd/btn-complete.png')
                            scrollToDom($('#page_addmember'))
                            $('#errorMessageBar').show();
                            $('#errorMessageText').text(messageArray)
                        }
                        else{
                            $('#errorMessageBar').hide()
                            $('#errorMessageText').text('')
                            closePopup()

                            if($('body').width()<600){
                                $('#page_managemember').show();
                            }
                            $('html').css("cursor","auto")
                            $('#upbutton-modify img').attr('src','/static/user/res/ptadd/btn-complete.png')

                            DataFormattingDict('ID');
                            DataFormatting('current');
                            DataFormatting('finished');
                            memberListSet('current','date','yes');
                            memberListSet('finished','date','yes');
                            $('#startR').attr('selected','selected')
                            console.log('success');
                        }
                    },

                    //통신 실패시 처리
                    error:function(){
                        $('#errorMessageBar').show()
                        $('#errorMessageText').text('통신 에러: 관리자 문의')
                    },
              })
            
            }else{
                scrollToDom($('#memberInfoPopup'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text('모든 필수 정보를 입력해주세요')
                //입력값 확인 메시지 출력 가능
            }
        }      
    });


 //작은달력 설정
    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd',
        prevText: '이전 달',
        nextText: '다음 달',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년'
    });
});


//진행중 회원, 종료된 회원 리스트 스왑
function shiftMemberList(type){
    if(type == "current"){
        var currentMemberList = $("#currentMemberList");
        var currentMemberNum = $('#currentMemberNum');
        var finishedMemberList = $("#finishedMemberList");
        var finishedMemberNum = $('#finishMemberNum');
        if(currentMemberList.css("display")=="none"){
            finishedMemberList.css("display","none");
            finishedMemberNum.css("display","none");
            currentMemberList.css("display","block");
            currentMemberNum.css("display","block");
        }
    }else if(type == "finished"){
        var currentMemberList = $("#currentMemberList");
        var currentMemberNum = $('#currentMemberNum');
        var finishedMemberList = $("#finishedMemberList");
        var finishedMemberNum = $('#finishMemberNum');
        if(finishedMemberList.css("display")=="none"){
            finishedMemberList.css("display","block");
            finishedMemberNum.css("display","block");
            currentMemberList.css("display","none");
            currentMemberNum.css("display","none");
        }
    }
}

//간편 가격입력
function priceInput(price, type, selector){
    if(selector == 2){
        var select = '_2'
        var loc = "_fast"
    }else if(selector == 1){
        var select = ''
        var loc = ''
    }
    if(type == "sum"){
        var priceInputValue = $('#lecturePrice_add'+select).val().replace(/,/g, "")
        var priceInputValue = price + Number(priceInputValue);
        $('#lecturePrice_add'+select).val(numberWithCommas(priceInputValue)).attr('readonly',true)
        $('#lecturePrice_add_value'+loc).val(priceInputValue)
    }else if(type == "del"){
        $('#lecturePrice_add'+select).val("").attr('readonly',false)
        $('#lecturePrice_add_value'+loc).val(0)
    }
    function numberWithCommas(x) { //천단위 콤마 찍기
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}
//수동 가격입력
$('#lecturePrice_add, #lecturePrice_add_2').keyup(function(){
    var priceInputValue = $(this).val().replace(/,/g, "")
    $(this).val(numberWithCommas(priceInputValue))
})


//생일입력 드랍다운
function birth_dropdown_set(){
    var yearoption = ['<option selected disabled hidden>연도</option>']
    for(var i=2018; i>=1908; i--){
        yearoption.push('<option data-year="'+i+'년'+'">'+i+'년</option>')
    }
    var birth_year_options = yearoption.join('')
    $('#birth_year, #birth_year_info').html(birth_year_options)


    var monthoption = ['<option selected disabled hidden>월</option>']
    for(var i=1; i<=12; i++){
        monthoption.push('<option data-month="'+i+'월'+'">'+i+'월</option>')
    }
    var birth_month_options = monthoption.join('')
    $('#birth_month, #birth_month_info').html(birth_month_options)


    var dateoption = ['<option selected disabled hidden>일</option>']
    for(var i=1; i<=31; i++){
        dateoption.push('<option data-date="'+i+'일'+'">'+i+'일</option>')
    }
    var birth_date_options = dateoption.join('')
    $('#birth_date, #birth_date_info').html(birth_date_options)


    $('#birth_month, #birth_month_info').change(function(){
        var dateoption = ['<option selected disabled hidden>일</option>']
        $('#birth_date, #birth_date_info').html("")
        var lastDay = [31,29,31,30,31,30,31,31,30,31,30,31];
        var month = $(this).val().replace(/월/gi,"")
        for(var i=1; i<=lastDay[month-1]; i++){
            dateoption.push('<option data-date="'+i+'일'+'">'+i+'일</option>')
        }
        var birth_date_options = dateoption.join('')
        $('#birth_date, #birth_date_info').html(birth_date_options)
    })

    $('#birth_year, #birth_month, #birth_date').change(function(){
        $(this).addClass("dropdown_selected")
        $(this).css('color','#282828')
        var year = $('#birth_year').val().replace(/년/gi,"")
        var month = $('#birth_month').val().replace(/월/gi,"")
        var date = $('#birth_date').val().replace(/일/gi,"")
        var birthdata = year+'-'+month+'-'+date
        $('#form_birth').attr('value',birthdata)
    })

    $('#birth_year_info, #birth_month_info, #birth_date_info').change(function(){
        $(this).addClass("dropdown_selected")
        $(this).css('color','#282828')
        var year = $('#birth_year_info').val().replace(/년/gi,"")
        var month = $('#birth_month_info').val().replace(/월/gi,"")
        var date = $('#birth_date_info').val().replace(/일/gi,"")
        var birthdata = year+'-'+month+'-'+date
        $('#form_birth_modify').attr('value',birthdata)
    })
}


//DB데이터를 memberListSet에서 사용가능하도록 가공
function DataFormatting(type){
    switch(type){
        case 'current':
            currentCountList = []
            currentRegcountList = [] //20180115
            currentNameList = []
            currentDateList = []
            var countListResult = currentCountList
            var nameListResult = currentNameList
            var dateListResult = currentDateList

            var nameInfoArray = nameArray
            var dbIdInfoArray = dIdArray
            var idInfoArray = idArray
            var emailInfoArray =emailArray
            var startDateArray = startArray
            var endDateArray = endArray
            var remainCountArray = countArray
            var regCountInfoArray = regCountArray
            var phoneInfoArray = phoneArray
            var contentInfoArray = contentsArray
            var npCountInfoArray = npLectureCountsArray
            var rjCountInfoArray = rjLectureCountsArray
            var yetRegCountInfoArray = yetRegCountArray
            var yetCountInfoArray = yetCountArray
            var len = startArray.length; 
        break;

        case 'finished':
            finishCountList = []
            finishRegcountList = [] //20180115
            finishNameList = []
            finishDateList = []
            var countListResult = finishCountList
            var nameListResult = finishNameList
            var dateListResult = finishDateList

            var nameInfoArray = finishnameArray
            var idInfoArray = finishIdArray
            var dbIdInfoArray = finishDidArray
            var emailInfoArray = finishemailArray
            var startDateArray = finishstartArray
            var endDateArray = finishendArray
            var remainCountArray = finishcountArray
            var regCountInfoArray = finishRegCountArray
            var phoneInfoArray = finishphoneArray
            var contentInfoArray = finishContentsArray
            var npCountInfoArray = finishNpLectureCountsArray
            var rjCountInfoArray = finishRjLectureCountsArray
            var yetRegCountInfoArray = finishYetRegCountArray
            var yetCountInfoArray = finishYetCountArray
            var len = finishstartArray.length; 
        break;
    }

    for(i=0; i<len; i++){
        var date    = date_format_to_yyyymmdd(startDateArray[i],'')
        var enddate = date_format_to_yyyymmdd(endDateArray[i],'')
        //날짜형식을 yyyymmdd 로 맞추기

        var countOri = remainCountArray[i]
        var countFix = count_format_to_nnnn(remainCountArray[i])

        var regcountOri = regCountInfoArray[i]
        var regcountFix = count_format_to_nnnn(regCountInfoArray[i])

        countListResult[i]=countFix+'/'+regcountFix+'/'+nameInfoArray[i]+'/'+idInfoArray[i]+'/'+phoneInfoArray[i]+'/'+contentInfoArray[i]+'/'+date+'/'+enddate+'/'+emailInfoArray[i]+'/'+npCountInfoArray[i]+'/'+rjCountInfoArray[i]+'/'+yetRegCountInfoArray[i]+'/'+yetCountInfoArray[i]+'/'+dbIdInfoArray[i]
        nameListResult[i]=nameInfoArray[i]+'/'+idInfoArray[i]+'/'+phoneInfoArray[i]+'/'+contentInfoArray[i]+'/'+countOri+'/'+regcountOri+'/'+date+'/'+enddate+'/'+emailInfoArray[i]+'/'+npCountInfoArray[i]+'/'+rjCountInfoArray[i]+'/'+yetRegCountInfoArray[i]+'/'+yetCountInfoArray[i]+'/'+dbIdInfoArray[i]
        dateListResult[i]=date+'/'+nameInfoArray[i]+'/'+idInfoArray[i]+'/'+phoneInfoArray[i]+'/'+contentInfoArray[i]+'/'+countOri+'/'+regcountOri+'/'+enddate+'/'+emailInfoArray[i]+'/'+npCountInfoArray[i]+'/'+rjCountInfoArray[i]+'/'+yetRegCountInfoArray[i]+'/'+yetCountInfoArray[i]+'/'+dbIdInfoArray[i]
    }
}

//DB데이터를 사전형태로 만드는 함수
function DataFormattingDict(Option){
    switch(Option){
        case 'name':
            var DBlength = nameArray.length;
            for(var i=0; i<DBlength;i++){
            DB[nameArray[i]] = {'id':idArray[i],
                                'dbId':dIdArray[i],
                                'email':emailArray[i],
                                'count':countArray[i],
                                'regcount':regCountArray[i],
                                'availCount':availCountArray[i], 
                                'phone':phoneArray[i],
                                'contents':contentsArray[i],
                                'start':startArray[i],
                                'end':endArray[i], 
                                'birth':birthdayArray[i], 
                                'sex':sexArray[i],
                                'npCount':npLectureCountsArray[i],
                                'rjCount':rjLectureCountsArray[i],
                                'yetRegCount':yetRegCountArray[i],
                                'yetCount':yetCountArray[i]
                              };
            }
            var DBendlength = finishnameArray.length;
            for(var j=0; j<DBendlength;j++){
            DBe[finishnameArray[j]] = {'id':finishIdArray[j],
                                        'dbId':finishDidArray[j],
                                        'email':finishemailArray[j],
                                        'count':finishcountArray[j],
                                        'regcount':regCountArray[j],
                                        'availCount':finishAvailCountArray[j],
                                        'phone':finishphoneArray[j],
                                        'contents':finishContentsArray[j],
                                        'start':finishstartArray[j],
                                        'end':finishendArray[j], 
                                        'birth':finishbirthdayArray[j], 
                                        'sex':finishsexArray[j] 
                                    };
            }
            $('#currentMemberNum').text("진행중 회원수 : "+DBlength)
            $('#finishMemberNum').text("종료된 회원수 : "+DBendlength)
        break;

        case 'ID':
            var DBlength = idArray.length;
            for(var i=0; i<DBlength;i++){
            DB[idArray[i]] = {'id':idArray[i],
                              'name':nameArray[i],
                              'dbId':dIdArray[i],
                              'email':emailArray[i],
                              'count':countArray[i],
                              'regcount':regCountArray[i],
                              'availCount':availCountArray[i], 
                              'phone':phoneArray[i],
                              'contents':contentsArray[i],
                              'start':startArray[i],
                              'end':endArray[i], 
                              'birth':birthdayArray[i], 
                              'sex':sexArray[i],
                              'npCount':npLectureCountsArray[i],
                              'rjCount':rjLectureCountsArray[i],
                              'yetRegCount':yetRegCountArray[i],
                              'yetCount':yetCountArray[i]
                            };
            }
            var DBendlength = finishIdArray.length;
            for(var j=0; j<DBendlength;j++){
            DBe[finishIdArray[j]] = {'id':finishIdArray[i],
                                    'name':finishnameArray[j], 
                                    'dbId':finishDidArray[j],
                                    'email':finishemailArray[j],
                                    'count':finishcountArray[j],
                                    'regcount':regCountArray[j],
                                    'availCount':finishAvailCountArray[j],
                                    'phone':finishphoneArray[j],
                                    'contents':finishContentsArray[j],
                                    'start':finishstartArray[j],
                                    'end':finishendArray[j], 
                                    'birth':finishbirthdayArray[j], 
                                    'sex':finishsexArray[j] };
            }
            $('#currentMemberNum').text("진행중 회원수 : "+DBlength)
            $('#finishMemberNum').text("종료된 회원수 : "+DBendlength)
        break;
    }
}

//회원목록을 테이블로 화면에 뿌리는 함수
function memberListSet (type,option,Reverse){
    
    var tbodyStart = '<tbody>'
    var tbodyEnd = '</tbody>'
    var tbodyToAppend = $(tbodyStart)

    switch(type){
        case 'current':
            var countList = currentCountList
            var nameList = currentNameList
            var dateList = currentDateList
            var $table = $('#currentMember');
            var $tabletbody = $('#currentMember tbody')
        break;
        case 'finished':
            var countList = finishCountList
            var nameList = finishNameList
            var dateList = finishDateList
            var $table = $('#finishedMember');
            var $tabletbody = $('#finishedMember tbody')
        break;
    }

    if(Reverse == 'yes'){
        var countLists =countList.sort().reverse()
        var nameLists = nameList.sort().reverse()
        var dateLists = dateList.sort().reverse()
    }else{
        var countLists =countList.sort()
        var nameLists = nameList.sort()
        var dateLists = dateList.sort()
    }

    var len = countLists.length;
    var arrayResult = []
    for(var i=0; i<len; i++){
        if(option == "count"){
            var array = countLists[i].split('/');
            var email = array[8];
            var name = array[2];
            var id = array[3];
            var dbId = array[13];
            var contents = array[5];
            var count = array[0];
            var regcount = array[1]
            var starts = array[6];
            var ends = array[7];
            var phoneToEdit = array[4].replace(/-| |/gi,"");
            if(name.length>5){
              var name = array[2].substr(0,5)+'..'
            }
            var npCounts = array[9]
            var rjCounts = array[10]
            var yetRegCounts = array[11]
            var yetCounts = array[12]
        }else if(option == "name"){
            var array = nameLists[i].split('/');
            var email = array[8];
            var name = array[0];
            var id = array[1];
            var dbId = array[13];
            var contents = array[3];
            var count = array[4];
            var regcount = array[5]
            var starts = array[6];
            var ends = array[7];
            var phoneToEdit = array[2].replace(/-| |/gi,"");
            if(name.length>5){
              var name = array[0].substr(0,5)+'..'
            }
            var npCounts = array[9]
            var rjCounts = array[10]
            var yetRegCounts = array[11]
            var yetCounts = array[12]
        }else if(option == "date"){
            var array = dateLists[i].split('/');
            var arrayforemail = dateLists[i].split('/')
            var email = array[8];
            var name = array[1];
            var id = array[2];
            var dbId = array[13];
            var contents = array[4];
            var count = array[5];
            var regcount = array[6];
            var starts = array[0];
            var ends = array[7];
            var phoneToEdit = array[3].replace(/-| |/gi,"");
            if(name.length>5){
              var name = array[1].substr(0,5)+'..'
            }
            var npCounts = array[9]
            var rjCounts = array[10]
            var yetRegCounts = array[11]
            var yetCounts = array[12]
        }
        
        var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
        var end = ends.substr(0,4)+'.'+ends.substr(4,2)+'.'+ends.substr(6,2)
        if(end == "9999.12.31"){
            var end = "소진시까지"
        }

        var newReg = ""
        if(starts.substr(0,4) == currentYear && Number(starts.substr(4,2)) == currentMonth+1){
            var newReg = '<img src="/static/user/res/icon-new.png" title="이번달 신규회원" class="newRegImg">'
        }


        if(phoneToEdit.substr(0,2)=="02"){
            var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
        }else{
            var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
        }

        var npCountImg = ""
        if(npCounts == 0 && rjCounts == 0){
            var npCountImg = '<img src="/static/user/res/icon-link.png" title="연결됨" class="npCountImg_wait">'
        }else if(rjCounts > 0){
            var npCountImg = '<img src="/static/user/res/icon-alert.png" title="연결 취소" class="npCountImg_x">'
        }

        var yetReg = ""
        var yet = ""
        if(yetRegCounts > 0){
            var yetReg = '(+'+yetRegCounts+')'
        }
        if(yetCounts > 0){
            var yet = '(+'+yetCounts+')'
        }

        

        var count = remove_front_zeros(count)
        var regcount = remove_front_zeros(regcount)
        
        var phonenum = '<a class="phonenum" href="tel:'+phone+'">'+phone+'</a>'
        var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms">'+phonenum+'</a>'
        var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>'     
        var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'
        var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제">'
        var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="수정">'
        var pcinfoimage = '<img src="/static/user/res/member/icon-info.png" class="pcmanageicon _info_view" title="정보">'

        //var nametd = '<td class="_tdname" data-name="'+name+'">'+name+nameimage+npCountImg+'</td>'
        var nametd = '<td class="_tdname" data-name="'+name+'">'+newReg+name+npCountImg+'</td>'
        var idtd = '<td class="_id" data-name="'+id+'" data-dbid="'+dbId+'">'+id+'</td>'
        var emailtd = '<td class="_email">'+email+'</td>'
        var regcounttd = '<td class="_regcount">'+regcount+yetReg+'</td>'
        var remaincounttd = '<td class="_remaincount">'+count+yet+'</td>'
        var startdatetd = '<td class="_startdate">'+start+'</td>'
        var enddatetd = '<td class="_finday">'+end+'</td>'
        var mobiletd = '<td class="_contact">'+phoneimage+smsimage+'</td>'
        var pctd = '<td class="_manage">'+pcinfoimage+pceditimage+pcdeleteimage+'</td>'
        var scrolltd = '<td class="forscroll"></td>'

        var td = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+idtd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+scrolltd+'</tr>'
        arrayResult[i] = td
    }

    var resultToAppend = arrayResult.join("")
    var result = tbodyStart + resultToAppend + tbodyEnd
    $tabletbody.remove()
    $table.append(result)
}



//shade 보이기, 숨기기
function hide_shadow_responsively(){
    if($('body').width()>600){
        $('#shade3').css('display','none');
    }else{
        $('#shade').css('display','none');
    }
}

function show_shadow_reponsively(){
    if($('body').width()>600){
        $('#shade3').fadeIn('fast');
    }else{
        $('#shade').fadeIn('fast');
    } 
}

//모든 입력란을 채웠을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
function check_dropdown_selected(){ 
    var emailInput = $("#memberEmail_add");
    var lastnameInput = $("#memberLastName_add");
    var firstnameInput = $("#memberFirstName_add");
    var phoneInput = $("#memberPhone_add");
    var countInput = $("#memberCount_add");
    var startInput = $("#datepicker_add");
    var endInput = $("#datepicker2_add");
    //var sexInput = $('#form_sex').val();
    var sexInput = "임시"

    var countInput_fast = $("#memberCount_add_fast");
    var dateInput_fast = $("#datepicker_fast");

    var fast = $('#fast_check').val()

    if(fast=='1'){
        if((lastnameInput).hasClass("dropdown_selected")==true && (firstnameInput).hasClass("dropdown_selected")==true && (phoneInput).hasClass("dropdown_selected")==true &&(countInput).hasClass("dropdown_selected")==true&&(startInput).hasClass("dropdown_selected")==true&&(endInput).hasClass("dropdown_selected")==true && sexInput.length>0){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('.submitBtn').addClass('submitBtnActivated')
            select_all_check=true;

        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('.submitBtn').removeClass('submitBtnActivated')
            select_all_check=false;
        }
    }
    else{
        if((lastnameInput).hasClass("dropdown_selected")==true && (firstnameInput).hasClass("dropdown_selected")==true && (phoneInput).hasClass("dropdown_selected")==true &&(countInput_fast).hasClass("dropdown_selected")==true&&(dateInput_fast).hasClass("dropdown_selected")==true && sexInput.length>0){
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('.submitBtn').addClass('submitBtnActivated')
            select_all_check=true;

        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('.submitBtn').removeClass('submitBtnActivated')
            select_all_check=false;
        }
    }
}

//빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택
function autoDateInput(){

    /// 빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택///// 
    var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31]
    var selected = $('#datepicker_fast').val();
    var selectedDate = Number(selected.replace(/-/g, ""));
    var selectedD = $('._due div.checked').parent('td').attr('data-check'); // 1,2,3,6,12,99
    var selectedDue = Number(selectedD + '00');
    var finishDate =  selectedDate+selectedDue
    var yy = String(finishDate).substr(0,4);
    var mm = String(finishDate).substr(4,2);
    var dd = String(finishDate).substr(6,2);
      

    if(mm>12){ //해 넘어갈때 날짜처리
        //var finishDate = finishDate + 10000 - 1200
        var yy = Number(yy)+1;
        var mm = Number(mm)-12;
    }
    if(String(mm).length<2){
        var mm = "0"+mm;
    }
      var finishDate = yy +"-"+ mm +"-"+ dd
    if(dd>lastDay[Number(mm)-1]){
        var dd = Number(dd)-lastDay[Number(mm)-1]
        var mm = Number(mm)+1
        if(String(dd).length<2){
          var dd = "0"+dd
        }
        if(String(mm).length<2){
          var mm = "0"+mm
        }
        var finishDate = yy +"-"+ mm +"-"+ dd;
    }
    $('#memberDue_add_2').val(finishDate)
    $('#memberDue_add_2_fast').val(finishDate)
    if(selectedD==99){
        $('#memberDue_add_2').val("소진시까지")
        $('#memberDue_add_2_fast').val("9999-12-31")
    }

    if(selectedD==undefined){
        $('#memberDue_add_2').val("진행기간을 선택해주세요")
    }

    if($('#memberDue_add_2').val()!="진행기간을 선택해주세요" && $('#memberDue_add_2').val()!="" ){
        $('#memberDue_add_2').addClass("dropdown_selected")
    }
    /// 빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택/////
}

//특수문자 입력 제한
function limit_char(e){
    var limit =  /[~!@\#$%^&*\()\-=+_'|\:;\"\'\?.,/\\]/gi;
    var temp = $(e).val();
    if(limit.test(temp)){
        $(e).val(temp.replace(limit,""));
    };
};



//회원정보////////////////////////////////////////////////////////
//회원클릭시 회원정보 팝업을 띄우고 내용을 채운다. PC
function open_member_info_popup_pc(userID){
    if($('#currentMemberList').css('display') == "block"){
      var Data = DB
    }else if($('#finishedMemberList').css('display') == "block"){
       var Data = DBe
    }else if($('#calendar').length>0){
        var Data = DB
    }
    $('#memberInfoPopup_PC').fadeIn('fast')
    $('#shade').fadeIn('fast');

    var npCountImg = ""
    /*
    if(Data[userID].npCount > 0){
      var npCountImg = '<span style="font-size:12px;"><img src="/static/user/res/member/icon-np-wait.png" style="width:18px;margin:0 0 5px 3px" title="연결 대기중"> (연결 대기중)</span>'
    }
    */
    
    
    if(Data[userID].npCount == 0 && Data[userID].rjCount == 0){
      var npCountImg = '<span style="font-size:12px;"><img src="/static/user/res/icon-link.png" style="width:18px;margin:0 0 5px 3px" title="연결됨"> (연결됨)</span>'
    }else if(Data[userID].rjCount > 0){
      var npCountImg = '<span style="font-size:12px;"><img src="/static/user/res/icon-alert.png" style="width:11px;margin:0 0 5px 3px" title="연결 취소"> (연결 취소)</span>'
    }

    var yetReg = ""
    var yet = ""
    if(Data[userID].yetRegCount > 0){
      var yetReg = ' ('+Data[userID].yetRegCount+'회 추가 예정)'
    }
    if(Data[userID].yetCount > 0){
      var yet = ' ('+Data[userID].yetCount+'회 추가 예정)'
    }
    


    if(Data[userID].sex == "M"){
      var html = '<img src="/static/user/res/member/icon-male-blue.png">'+Data[userID].name+' 회원님<img src="/static/user/res/member/icon-x-grey.png" id="btn_close_info_PC" class="_btn_close_info_PC" title="닫기">'+npCountImg
      $('#memberInfoPopup_PC_label').html(html)
      $('#form_sex_modify').val('M')
    }else if(Data[userID].sex == "W"){
      var html = '<img src="/static/user/res/member/icon-female-pink.png">'+Data[userID].name+' 회원님<img src="/static/user/res/member/icon-x-grey.png" id="btn_close_info_PC" class="_btn_close_info_PC" title="닫기">'+npCountImg
      $('#memberInfoPopup_PC_label').html(html)
      $('#form_sex_modify').val('W')
    }else{
      var html = '<img src="/static/user/res/member/icon-user.png">'+Data[userID].name+' 회원님<img src="/static/user/res/member/icon-x-grey.png" id="btn_close_info_PC" class="_btn_close_info_PC" title="닫기">'+npCountImg
      $('#memberInfoPopup_PC_label').html(html)
      $('#form_sex_modify').val('')
    }

    $("#memberEmail_add").keyup(function(){  //이메일 입력시 하단에 핑크선
        if($(this).val().length>8){
            $(this).addClass("dropdown_selected")
            check_dropdown_selected();
        }else{
            $(this).removeClass("dropdown_selected")
            check_dropdown_selected();
        }
        $('#id_email').val($('#memberEmail_add').val())
    })

    $("#memberLastName_add, #memberFirstName_add").keyup(function(){  //이름 입력시 하단에 핑크선
        if($(this).val().length>=1){
            limit_char(this);
            $(this).addClass("dropdown_selected")
            check_dropdown_selected();
        }else{
            limit_char(this);
            $(this).removeClass("dropdown_selected")
            check_dropdown_selected();
        }
        $('#form_name').val($('#memberLastName_add').val()+$('#memberFirstName_add').val())
        $('#add_member_form_first_name').val($('#memberFirstName_add').val())
        $('#add_member_form_last_name').val($('#memberLastName_add').val())
        $('#add_member_form_name').val($('#memberLastName_add').val()+$('#memberFirstName_add').val())
    })

    $(document).on('click','#memberSex .selectboxopt',function(){
        if($('#memberSearchButton').attr('data-type') == "searched"){
        
        }else{
            $(this).addClass('selectbox_checked')
            $(this).siblings().removeClass('selectbox_checked')
            $('#form_sex').attr('value',$(this).attr('value'))
            check_dropdown_selected();
        }
    })

    $(document).on('click','#memberSex_info .selectboxopt',function(){
        if($('#upbutton-modify').attr('data-type') == "modify"){
            $(this).addClass('selectbox_checked')
            $(this).siblings().removeClass('selectbox_checked')
            $('#form_sex_modify').attr('value',$(this).attr('value'))
        }else{

        }
    })

    $("#memberPhone_add").keyup(function(){  //전화번호 입력시 하단에 핑크선
        if($(this).val().length>8){
            limit_char(this);
            $(this).addClass("dropdown_selected")
            check_dropdown_selected();
        }else{
            limit_char(this);
            $(this).removeClass("dropdown_selected")
            check_dropdown_selected();
        }
        $('#id_username').val($('#memberPhone_add').val())
        $('#id_user_id').val($('#memberPhone_add').val())
    })

    $("#memberCount_add").keyup(function(){  //남은횟수 입력시 하단에 핑크선
        if($(this).val().length>0){
            limit_char(this);
            $(this).addClass("dropdown_selected")
            check_dropdown_selected();
        }else{
            limit_char(this);
            $(this).removeClass("dropdown_selected")
            check_dropdown_selected();
        }
    })

    



    //빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////
    $('#btnCallSimple').click(function(){
        $('#manualReg').hide();
        $('#simpleReg').fadeIn('fast');
        $(this).addClass('selectbox_checked')
        $('#btnCallManual').removeClass('selectbox_checked')
        $('p').removeClass("dropdown_selected")
        $('#memberCount_add_fast').removeClass('dropdown_selected')
        $('#datepicker_add,#datepicker2_add,#memberCount_add,#lecturePrice_add_2').val("")
        $('#fast_check').val('0')
        check_dropdown_selected();
    })

    $('#btnCallManual').click(function(){
        $('#simpleReg').hide()
        $('#manualReg').fadeIn('fast');
        $(this).addClass('selectbox_checked')
        $('#btnCallSimple').removeClass('selectbox_checked')
        $('._due div.checked').removeClass('checked ptersCheckboxInner')
        $('._count div.checked').removeClass('checked ptersCheckboxInner')
        $('p').removeClass("dropdown_selected")
        $('#datepicker_fast,#lecturePrice_add,#memberDue_add_2').val("")
        $('#fast_check').val('1')
        check_dropdown_selected();
    })

    $('._due .ptersCheckbox').parent('td').click(function(){
        $('._due div.checked').removeClass('checked ptersCheckboxInner')
        var pterscheckbox = $(this).find('div')
        $(this).find('div:nth-child(1)').addClass('checked')
        pterscheckbox.find('div').addClass('ptersCheckboxInner')
        if($("#datepicker_fast").val()!=""){
            autoDateInput();
        }
    })

    $('._count .ptersCheckbox').parent('td').click(function(){
        $('._count div.checked').removeClass('checked ptersCheckboxInner')
        var pterscheckbox = $(this).find('div')
        $(this).find('div:nth-child(1)').addClass('checked')
        pterscheckbox.find('div').addClass('ptersCheckboxInner')
        $('#memberCount_add_fast').val(pterscheckbox.attr('data-count'))
        $('#memberCount_add_fast').addClass("dropdown_selected")
        check_dropdown_selected();

    })

>>>>>>> c7e8e90d781e526f76f56b7bc1e89af51909f01e

    if(Data[userID].email.length==0){
      var email = ''
    }else{
      var email = Data[userID].email
    }
    var birth_year = Data[userID].birth.split(' ')[0]
    var birth_month = Data[userID].birth.split(' ')[1]
    var birth_date = Data[userID].birth.split(' ')[2]
    if(Data[userID].birth == "None"){
      var birth_year = ""
    }
    $('#memberBirth_Year_info_PC').text(Data[userID].birth)
    //$('#memberBirth_Year_info_PC').text(birth_year)
    //$('#memberBirth_Month_info_PC').text(birth_month)
    //$('#memberBirth_Date_info_PC').text(birth_date)
    if(Data[userID].birth != 'None'){
      $('#form_birth_modify').val(birth_year.replace(/년/gi,"-")+birth_month.replace(/월/gi,"-")+birth_date.replace(/일/gi,""))
    }else{
      $('#form_birth_modify').val('')
    }
    
    $('#deleteMemberId').val(userID);
    $('#memberName_info').val(Data[userID].name)
    $('#memberId').text(userID).val(userID).attr('data-dbid',Data[userID].dbId);
    $('#memberId_info_PC').text(userID).attr('data-dbid',Data[userID].dbId);
    $('#memberPhone_info, #memberPhone_info_PC').text(Data[userID].phone).val(Data[userID].phone);
    $('#memberRegCount_info_PC').val(Data[userID].regcount + yetReg).text(Data[userID].regcount + yetReg)
    $('#memberRemainCount_info_PC').val(Data[userID].count + yet).text(Data[userID].count + yet)
    $('#memberAvailCount_info_PC').val(Data[userID].availCount).text(Data[userID].availCount)
    $('#memberFinishCount_info_PC').val(Data[userID].regcount-Data[userID].count).text(Data[userID].regcount-Data[userID].count)
    $('#memberEmail_info, #memberEmail_info_PC').val(email)
    $('#memberStart_info_PC').text(Data[userID].start)
    var end = Data[userID].end
    if(end == "9999년 12월 31일"){
      var end = "소진시까지"
    }else{
      var end = Data[userID].end
    }
    $('#memberEnd_info_PC').text(end)
    $('#comment_info, #memberComment_info_PC').val(Data[userID].contents)
    $('#memberInfoPopup_PC input').removeClass('input_avaiable').attr('disabled',true);
    //$('button._info_modify').text('수정').attr('data-type',"view")
    $('#memberRegHistory_info_PC img').text('수정').attr('data-type',"view")

    $('#inputError_info_PC').css('display','none')
}

//회원클릭시 회원정보 팝업을 띄우고 내용을 채운다. MOBILE
function open_member_info_popup_mobile(userID){
    if($('#currentMemberList').css('display') == "block"){
      var Data = DB
    }else if($('#finishedMemberList').css('display') == "block"){
       var Data = DBe
    }else if($('#calendar').length>0){
        var Data = DB
    }
    birth_dropdown_set()
    $('#float_btn_wrap').fadeOut();
    $('#page-base').fadeOut('fast');
    $('#page-base-modifystyle').fadeIn('fast');
    $('#memberName_info').val(Data[userID].name)
    $('#memberId').val(userID).attr('data-dbid',Data[userID].dbId)
    $('#deleteMemberId').val(userID).attr('data-dbid',Data[userID].dbId)
    $('#memberPhone_info').val(Data[userID].phone);
    $('#comment_info').val(Data[userID].contents);
    $('#memberRegCount_info').val(Data[userID].regcount);
    $('#memberCount_info').val(Data[userID].count);
    $('#memberEmail_info').val(Data[userID].email);
    $('#datepicker_info').val(Data[userID].start);
    $('#datepicker2_info').val(Data[userID].end);

    var dropdown_year_selected = $('#birth_year_info option[data-year='+Data[userID].birth.split(' ')[0]+']')
    var dropdown_month_selected = $('#birth_month_info option[data-month="'+Data[userID].birth.split(' ')[1]+'"]')
    var dropdown_date_selected = $('#birth_date_info option[data-date="'+Data[userID].birth.split(' ')[2]+'"]')
    dropdown_year_selected.prop('selected',true)
    dropdown_month_selected.prop('selected',true)
    dropdown_date_selected.prop('selected',true)

    var npCountImg = ""
    /*
    if(Data[userID].npCount > 0){
      var npCountImg = '<span style="font-size:12px;"><img src="/static/user/res/member/icon-np-wait.png" style="width:18px;margin:0 0 5px 3px" title="연결 대기중"> (연결 대기중)</span>'
    }*/
    if(Data[userID].npCount == 0 && Data[userID].rjCount == 0){
      var npCountImg = '<span style="font-size:12px;"><img src="/static/user/res/icon-link.png" style="width:11px;margin:0 0 5px 3px" title="연결됨"> (연결됨)</span>'
    }
    else if(Data[userID].rjCount > 0){
      var npCountImg = '<span style="font-size:12px;"><img src="/static/user/res/icon-alert.png" style="width:11px;margin:0 0 5px 3px" title="연결 취소"> (연결 취소)</span>'
    }

    $('#npSituationPresent').html(npCountImg)

    $('#memberSex_info .selectbox_checked').removeClass('selectbox_checked');
    if(Data[userID].sex == "M"){
      $('#memberMale_info').addClass('selectbox_checked')
      $('#form_sex_modify').val('M')
    }else if(Data[userID].sex == "W"){
      $('#memberFemale_info').addClass('selectbox_checked')
      $('#form_sex_modify').val('W')
    }
    $('#memberInfoPopup').fadeIn('fast');
    $('#shade3').fadeIn('fast');
    scrollToDom($('#page_managemember'));
    if($('body').width()<600){
      $('#page_managemember').hide();
    }

    $('#inputError_info').css('display','none')
    $('#fast_check').val('0')
    $('#form_birth').val('')
}

modify_member_lec_info_pc()
//회원의 수강정보(등록횟수)를 수정한다.
function modify_member_lec_info_pc(){
    $(document).on('keyup','.lec_reg_count',function(){
        console.log($(this).parent('div').siblings('.lec_rem_count').text())
        var remainCount = $(this).parent('div').siblings('.lec_rem_count').text()
        if(Number($(this).val()) >= Number(remainCount)){
            $(this).css('color','#282828')
            $('#form_lecture_reg_count').val($(this).val())
        }else{
            $(this).css('color','red')
            $('#form_lecture_reg_count').val('')
        }
    })
}

//회원의 수정된 수강정보를 서버로 전송한다.
function send_member_modified_data_pc(){
    var $form = $('#update_member_lecture_info');
    console.log($form.serialize())
       $.ajax({
          url:'/trainer/update_member_lecture_info/',
          type:'POST',
          data:$form.serialize(),
          dataType : 'html',

          beforeSend:function(){
            beforeSend()
          },

          //보내기후 팝업창 닫기
          complete:function(){
            completeSend()
          },

          //통신성공시 처리
          success:function(data){
              ajax_received_json_data_member_manage(data);
              console.log(messageArray)
              if(messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(messageArray)
              }else{
                    $('#errorMessageBar').hide()
                    $('#errorMessageText').text('')
                    DataFormattingDict('ID');
                    DataFormatting('current');
                    DataFormatting('finished');
                    memberListSet('current','date','yes');
                    memberListSet('finished','date','yes');
                    $('#startR').attr('selected','selected')
                    $('#memberRegHistory_info_PC img').attr('src','/static/user/res/icon-pencil.png').show()
                    open_member_info_popup_pc($('#memberId_info_PC').text())
                    console.log('success');
              }
          },

          //통신 실패시 처리
          error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text('통신 에러: 관리자 문의')
          },
      })
}

//회원에게 재연결 요청을 전송한다.
function resend_member_reg_data_pc(){
    var userID = $('#memberId_info_PC').text();
    var lectureID = $('.resendPopup').attr('data-leid');
    var userName = DB[userID].name
    $.ajax({
        url:'/trainer/resend_member_lecture_info/', 
        type:'POST',
        data:{"lecture_id":lectureID,"member_name":userName, "next_page":'/trainer/member_manage_ajax/'},
        dataType : 'html',

        beforeSend:function(){
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            ajax_received_json_data_member_manage(data);
            console.log(messageArray)
            if(messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(messageArray)
            }
            else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
              DataFormattingDict('ID');
              DataFormatting('current');
              DataFormatting('finished');
              memberListSet('current','date','yes');
              memberListSet('finished','date','yes');
              $('#startR').attr('selected','selected')
              open_member_info_popup_pc($('#memberId_info_PC').text())
              set_member_lecture_list()
              console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text('통신 에러: 관리자 문의')
        },
    })
}

//회원의 수강정보를 삭제한다.
function delete_member_reg_data_pc(){
    var userID = $('#memberId_info_PC').text();
    var lectureID = $('.resendPopup').attr('data-leid');
    $.ajax({
        url:'/trainer/delete_member_lecture_info/', 
        type:'POST',
        data:{"lecture_id":lectureID,"member_name":DB[userID].name, "next_page":'/trainer/member_manage_ajax/'},
        dataType : 'html',

        beforeSend:function(){
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            ajax_received_json_data_member_manage(data);
            console.log(messageArray)
            if(messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(messageArray)
            }
            else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                DataFormattingDict('ID');
                DataFormatting('current');
                DataFormatting('finished');
                memberListSet('current','date','yes');
                memberListSet('finished','date','yes');
                $('#startR').attr('selected','selected')
                open_member_info_popup_pc($('#memberId_info_PC').text())
                set_member_lecture_list()
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text('통신 에러: 관리자 문의')
        },
    })
}

//회원 환불 정보를 전송한다.
function refund_member_lecture_data(){
    var userID = $('#memberId_info_PC').text();
    var lectureID = $('.lectureStateChangePopup').attr('data-leid');
    var refund_price = $('div.lectureStateChangePopup.popups input[type="number"]').val()
    var userName = DB[userID].name
    if(refund_price.length>0){
        $.ajax({
                url:'/trainer/refund_member_lecture_info/', 
                type:'POST',
                data:{"lecture_id":lectureID, "member_name":userName, "refund_price": refund_price ,"next_page":'/trainer/member_manage_ajax/'},
                dataType : 'html',

                beforeSend:function(){
                    beforeSend()
                },

                //보내기후 팝업창 닫기
                complete:function(){
                    completeSend()
                },

                //통신성공시 처리
                success:function(data){
                    ajax_received_json_data_member_manage(data);
                    console.log(messageArray)
                    if(messageArray.length>0){
                        $('#errorMessageBar').show();
                        $('#errorMessageText').text(messageArray)
                    }
                    else{
                        $('#errorMessageBar').hide()
                        $('#errorMessageText').text('')
                      DataFormattingDict('ID');
                      DataFormatting('current');
                      DataFormatting('finished');
                      memberListSet('current','date','yes');
                      memberListSet('finished','date','yes');
                      $('#startR').attr('selected','selected')
                      open_member_info_popup_pc($('#memberId_info_PC').text())
                      set_member_lecture_list()

                      $('#shade3').css('display','none')
                      $('div.lectureStateChangePopup.popups input[type="number"]').val('')
                      console.log('success');

                      alert(userName + ' 회원님 환불 처리 되었습니다.')
                    }
                },

                //통신 실패시 처리
                error:function(){
                    $('#errorMessageBar').show()
                    $('#errorMessageText').text('통신 에러: 관리자 문의')
                },
            })
    }else{
        alert('환불 금액을 입력해주세요.')
    }
}

//회원의 진행상태 연결해제를 한다.
function disconnect_member_lecture_data(stateCode){
    var userID = $('#memberId_info_PC').text();
    var lectureID = $('.lectureConnectStateChangePopup').attr('data-leid');
    var state = stateCode
        $.ajax({
                url:'/trainer/update_member_lecture_view_info/', 
                type:'POST',
                data:{"lecture_id":lectureID, "member_name":DB[userID].name, "member_view_state_cd": stateCode ,"next_page":'/trainer/member_manage_ajax/'},
                dataType : 'html',

                beforeSend:function(){
                    beforeSend()
                },

                //보내기후 팝업창 닫기
                complete:function(){
                    completeSend()
                },

                //통신성공시 처리
                success:function(data){
                    ajax_received_json_data_member_manage(data);
                    console.log(messageArray)
                    if(messageArray.length>0){
                        $('#errorMessageBar').show();
                        $('#errorMessageText').text(messageArray)
                    }
                    else{
                        $('#errorMessageBar').hide()
                        $('#errorMessageText').text('')
                      DataFormattingDict('ID');
                      DataFormatting('current');
                      DataFormatting('finished');
                      memberListSet('current','date','yes');
                      memberListSet('finished','date','yes');
                      $('#startR').attr('selected','selected')
                      open_member_info_popup_pc($('#memberId_info_PC').text())
                      set_member_lecture_list()

                      $('#shade3').css('display','none')
                      $('div.lectureStateChangePopup.popups input[type="number"]').val('')
                      console.log('success');

                    }
                },

                //통신 실패시 처리
                error:function(){
                    $('#errorMessageBar').show()
                    $('#errorMessageText').text('통신 에러: 관리자 문의')
                },
            })
}

//회원의 등록 이력을 서버로부터 받아온다.
function set_member_lecture_list(){
    if($('#memberInfoPopup_PC').css('display')=="block"){
        var userID = $('#memberId_info_PC').text()
        var $regHistory = $('#memberRegHistory_info_PC')
    }else if($('#memberInfoPopup').css('display')=="block"){
        var userID = $('#memberId').val()
        var $regHistory = $('#memberRegHistory_info')
    }
    if($('#currentMemberList').css('display') == "block"){
      var Data = DB
    }else if($('#finishedMemberList').css('display') == "block"){
       var Data = DBe
    }else if($('#calendar').length>0){
        var Data = DB
    }
    var dbId = Data[userID].dbId
    
    $.ajax({
        url:'/trainer/read_lecture_by_class_member_ajax/', 
        type:'POST',
        data:{"member_id":dbId},
        dataType : 'html',

        beforeSend:function(){
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            console.log(data)
            var jsondata = JSON.parse(data);
            console.log(jsondata,'----')
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
               draw_member_lecture_list_table(jsondata,$regHistory) 
            }
            
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text('통신 에러: 관리자 문의')
        },
    })
}

//서버로부터 받아온 회원 등록이력을 회원정보 팝업에 테이블로 그린다.
function draw_member_lecture_list_table(jsondata, targetHTML){
    var $regHistory = targetHTML
    var result_history_html = ['<div><div>시작</div><div>종료</div><div>등록횟수</div><div>남은횟수</div><div>진행상태</div><div>연결상태</div><div>수정</div></div>']
    for(var i=0; i<jsondata.lectureIdArray.length; i++){
        var availcount =  '<div>'+jsondata.availCountArray[i]+'</div>'
        var lectureId =   '<div>'+jsondata.lectureIdArray[i]+'</div>'
        var lectureType = '<div>'+jsondata.lectureStateArray[i]+'</div>'
        var lectureTypeName = '<div class="lectureType_IP" data-leid =" '+jsondata.lectureIdArray[i]+'">'+jsondata.lectureStateNameArray[i]+'</div>'
        var lectureConnectType = '<div class="lectureType_IP" data-leid =" '+jsondata.lectureIdArray[i]+'">'+jsondata.memberViewStateArray[i]+'</div>'
        var lectureConnectTypeName = '<div class="lectureType_IP" data-leid =" '+jsondata.lectureIdArray[i]+'">'+jsondata.memberViewStateNameArray[i]+'</div>'
        var modDateTime = '<div>'+jsondata.modDateTimeArray[i]+'</div>'
        //var regcount =    '<div>'+jsondata.regCountArray[i]+'</div>'
        var regDateTime = '<div>'+jsondata.regDateTimeArray[i]+'</div>'
        var remcount =    '<div class="lec_rem_count">'+jsondata.remCountArray[i]+'</div>'
        //var start = '<div class="regHistoryDateInfo">'+jsondata.startArray[i]+'</div>'
        //var end = '<div class="regHistoryDateInfo">'+jsondata.endArray[i]+'</div>'
        var regcount =    '<div><input class="lec_reg_count" value="'+jsondata.regCountArray[i]+'" disabled></div>'
        var start = '<div><input data-type="lec_start_date" data-leid ="'+jsondata.lectureIdArray[i]+'" class="lec_start_date regHistoryDateInfo" value="'+jsondata.startArray[i]+'" disabled readonly></div>'
        var end = '<div><input data-type="lec_end_date" data-leid ="'+jsondata.lectureIdArray[i]+'" class="lec_end_date regHistoryDateInfo" value="'+jsondata.endArray[i]+'" disabled readonly></div>'
        var modifyActiveBtn = '<div><img src="/static/user/res/icon-pencil.png" data-type="view" data-leid="'+jsondata.lectureIdArray[i]+'"></div>'
        if(jsondata.lectureStateArray[i] == "IP"){ //진행중 IP, 완료 PE, 환불 RF
            var lectureTypeName = '<div class="lecConnectType_IP" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.lectureStateNameArray[i]+'</div>'
        }else if(jsondata.lectureStateArray[i] == "PE"){
            var lectureTypeName = '<div class="lecConnectType_PE" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.lectureStateNameArray[i]+'</div>'
        }else if(jsondata.lectureStateArray[i] == "RF"){
            var lectureTypeName = '<div class="lecConnectType_RF" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.lectureStateNameArray[i]+'</div>'
        }
        if(jsondata.memberViewStateArray[i] == "WAIT"){ // 연결안됨 WAIT, 연결됨 VIEW, 연결취소 DELETE
            var lectureConnectTypeName = '<div class="lectureType_WAIT" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.memberViewStateNameArray[i]+'</div>'
        }else if(jsondata.memberViewStateArray[i] == "DELETE"){
            var lectureConnectTypeName = '<div class="lectureType_DELETE" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.memberViewStateNameArray[i]+'</div>'
        }else if(jsondata.memberViewStateArray[i] == "VIEW"){
            var lectureConnectTypeName = '<div class="lectureType_VIEW" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.memberViewStateNameArray[i]+'</div>'
        }
        result_history_html.push('<div data-leid='+jsondata.lectureIdArray[i]+'>'+start+end+regcount+remcount+lectureTypeName+lectureConnectTypeName+modifyActiveBtn+'</div>')
    }
    var result_history = result_history_html.join('')
    $regHistory.html(result_history)
}
//회원정보////////////////////////////////////////////////////////



//회원등록////////////////////////////////////////////////////////
//회원추가시 아이디 검색하면 해당회원정보를 필드에 채워주기
function fill_member_info_by_ID_search(){
    $('#id_search_confirm').val('1');
    $('#memberLastName_add').val(id_search_memberLastName);
    $('#memberFirstName_add').val(id_search_memberFirstName);
    $('#form_name').val(id_search_memberLastName+id_search_memberFirstName);
    $('#memberPhone_add').val(id_search_memberPhone); 
    $('#memberEmail_add').val(id_search_memberEmail);
    $('#id_user_id').val(id_search_memberId);
    $('.selectboxopt[value='+id_search_memberSex+']').addClass('selectbox_checked')
    var dropdown_year_selected = $('#birth_year option[data-year="'+id_search_memberBirth.split(' ')[0]+'"]');
    var dropdown_month_selected = $('#birth_month option[data-month="'+id_search_memberBirth.split(' ')[1]+'"]');
    var dropdown_date_selected = $('#birth_date option[data-date="'+id_search_memberBirth.split(' ')[2]+'"]');
    dropdown_year_selected.prop('selected',true);
    dropdown_month_selected.prop('selected',true);
    dropdown_date_selected.prop('selected',true);

    $('#memberLastName_add').prop('disabled',true);
    $('#memberFirstName_add').prop('disabled',true);
    $('#memberPhone_add').prop('disabled',true);
    $('#memberEmail_add').prop('disabled',true);
    $('#birth_year').prop('disabled',true);
    $('#birth_month').prop('disabled',true);
    $('#birth_date').prop('disabled',true);
    $('#memberLastName_add').addClass("dropdown_selected");
    $('#memberFirstName_add').addClass("dropdown_selected");
    $('#memberPhone_add').addClass("dropdown_selected");
    $('#memberEmail_add').addClass("dropdown_selected");
    $('#birth_year').addClass('dropdown_selected');
    $('#birth_month').addClass('dropdown_selected');
    $('#birth_date').addClass('dropdown_selected');
} 

//새로운 회원 정보 서버로 보내 등록하기
function add_member_form_func(){
    var $form = $('#member-add-form-new');
    $.ajax({
        url:'/trainer/add_member_info/',
        type:'POST',
        data:$form.serialize(),
        dataType : 'html',

        beforeSend:function(){
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            ajax_received_json_data_member_manage(data);
            console.log(jsondata.messageArray)
            if(messageArray.length>0){
                $('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                closePopup()
                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                $('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')

                DataFormattingDict('ID');
                DataFormatting('current');
                DataFormatting('finished');
                memberListSet('current','date','yes');
                memberListSet('finished','date','yes');
                $('#startR').attr('selected','selected')
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text('통신 에러: 관리자 문의')
        },
     })
}

//회원을 삭제 요청을 서버로 보낸다.
function deleteMemberAjax(){
    var $form = $('#member-delete-form');
    $.ajax({
        url: '/trainer/delete_member_info/',
        type:'POST',
        data:$form.serialize(),
        dataType : 'html',

        beforeSend:function(){
            beforeSend();
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            ajax_received_json_data_member_manage(data);
            console.log(jsondata.messageArray)
            if(messageArray.length>0){
                $('html').css("cursor","auto")
                $('#upbutton-modify img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(messageArray)
            }
            else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                closePopup()

                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                $('html').css("cursor","auto")
                $('#upbutton-modify img').attr('src','/static/user/res/ptadd/btn-complete.png')

                DataFormattingDict('ID');
                DataFormatting('current');
                DataFormatting('finished');
                $('#startR').attr('selected','selected')
                switch(alignType){
                  case 'name':
                        memberListSet ('current','name')
                        memberListSet('finished','name');
                        $('#name').attr('selected','selected')
                  break;
                  case 'countH':
                        memberListSet('current','count','yes');
                        memberListSet('finished','count','yes');
                        $('#countH').attr('selected','selected')
                  break;
                  case 'countL':
                        memberListSet('current','count');
                        memberListSet('finished','count');
                        $('#countL').attr('selected','selected')
                  break;
                  case 'startP':
                        memberListSet('current','date');
                        memberListSet('finished','date');
                        $('#startP').attr('selected','selected')
                  break;
                  case 'startR':
                        memberListSet('current','date','yes');
                        memberListSet('finished','date','yes');
                        $('#startR').attr('selected','selected')
                  break;
                  case 'recent':
                        memberListSet('current','date','yes');
                        memberListSet('finished','date','yes');
                        $('#recent').attr('selected','selected')
                  break;
                }
                console.log('success');
            }
        },

        complete:function(){
            completeSend();
        },

        error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text('통신 에러: 관리자 문의')
        }
    })
}

//ajax 받아온 데이터
function ajax_received_json_data_member_manage(data){
    var jsondata = JSON.parse(data);
    dIdArray = [];
    idArray = [];
    nameArray =[];
    phoneArray = [];
    contentsArray = [];
    countArray = [];
    startArray = [];
    modifyDateArray = [];
    emailArray = [];
    endArray = [];
    regCountArray = [];
    availCountArray = [];
    birthdayArray = [];
    sexArray = [];
    emailActiveArray = [];
    lectureCountsArray = [];
    npLectureCountsArray = [];
    rjLectureCountsArray = [];
    yetCountArray = []
    yetRegCountArray = []

    finishDidArray = [];
    finishIdArray = [];
    finishnameArray =[];
    finishphoneArray = [];
    finishContentsArray = [];
    finishcountArray = [];
    finishstartArray = [];
    finishmodifyDateArray = [];
    finishemailArray = [];
    finishendArray = [];
    finishLectureCountsArray = [];
    finishNpLectureCountsArray = [];
    finishRjLectureCountsArray = [];
    finishYetCountArray = []
    finishYetRegCountArray = []

    finishRegCountArray = [];
    finishAvailCountArray = [];
    finishbirthdayArray = [];
    finishsexArray = [];

    finishEmailActiveArray = [];
    messageArray = [];

    dIdArray = jsondata.dIdArray;
    idArray = jsondata.idArray;
    nameArray =jsondata.nameArray;
    phoneArray = jsondata.phoneArray;
    contentsArray = jsondata.contentsArray;
    countArray = jsondata.countArray;
    startArray = jsondata.startArray;
    modifyDateArray = jsondata.modifyDateArray;
    emailArray = jsondata.emailArray;
    endArray = jsondata.endArray;
    regCountArray = jsondata.regCountArray;
    availCountArray = jsondata.availCountArray;
    emailActiveArray = jsondata.emailActiveArray;
    lectureCountsArray = jsondata.lectureCountsArray;
    npLectureCountsArray = jsondata.npLectureCountsArray;
    rjLectureCountsArray = jsondata.rjLectureCountsArray;
    yetCountArray = jsondata.yetCountArray
    yetRegCountArray = jsondata.yetRegCountArray

    finishDidArray = jsondata.finishDidArray;
    finishIdArray = jsondata.finishIdArray;
    finishnameArray = jsondata.finishnameArray;
    finishphoneArray = jsondata.finishphoneArray;
    finishContentsArray = jsondata.finishContentsArray;
    finishcountArray = jsondata.finishcountArray;
    finishstartArray = jsondata.finishstartArray;
    finishmodifyDateArray = jsondata.finishmodifyDateArray;
    finishemailArray = jsondata.finishemailArray;
    finishendArray = jsondata.finishendArray;
    finishLectureCountsArray = jsondata.finishLectureCountsArray;
    finishNpLectureCountsArray = jsondata.finishNpLectureCountsArray;
    finishRjLectureCountsArray = jsondata.finishRjLectureCountsArray;
    finishYetCountArray = jsondata.finishYetCountArray;
    finishYetRegCountArray = jsondata.finishYetRegCountArray;

    finishRegCountArray = jsondata.finishRegCountArray;
    finishAvailCountArray = jsondata.finishAvailCountArray;

    finishEmailActiveArray = jsondata.finishEmailActiveArray;
    //처리 필요 - hk.kim 180110
    birthdayArray = jsondata.birthdayArray;
    finishbirthdayArray = jsondata.finishbirthdayArray;
    sexArray = jsondata.sexArray;
    finishsexArray = jsondata.finishsexArray;
    messageArray = jsondata.messageArray;
}

//여러종류의 팝업을 닫는다.
function closePopup(){
    if($('#memberInfoPopup').css('display')=='block'){ //회원정보팝업 모바일버전 띄웠을때 x눌렀을 경우
        //if($('body').width()<600){
        $('#page_managemember').show();
        $('#float_btn_wrap').show();
        $('#float_btn').removeClass('rotate_btn');
        //}
        $('#page-base').fadeIn('fast');
        $('#page-base-modifystyle').fadeOut('fast');
        $('#upbutton-modify, #infoMemberModify').find('img').attr('src','/static/user/res/member/icon-edit.png');
        $('#upbutton-modify, #infoMemberModify').attr('data-type','view')
        $('#uptext-pc-modify').text('회원 정보 조회')

        $('#memberInfoPopup').fadeOut('fast')
        $('#memberName_info').attr('readonly',true)
        $('#memberId').attr('readonly',true);

        $('#birth_year_info, #birth_month_info, #birth_date_info').prop('disabled',true).addClass('dropdown_birth_info')
        $('#memberMale_info, #memberFemale_info').addClass('selectbox_disable')

        $('#memberEmail_info').attr('readonly',true);
        $('#memberPhone_info').attr('readonly',true);
        $('#comment_info').attr('readonly',true);
        //$('#memberCount_info').attr('readonly',true);
        //$('#datepicker_info').attr('disabled',true).addClass('input_disabled_color');
        //$('#datepicker2_info').attr('disabled',true).addClass('input_disabled_color');
        //$('.confirmPopup').fadeOut('fast');
        $('#cal_popup_plandelete').fadeOut('fast')
        $('#shade3').fadeOut('fast');
    }else if($('#memberInfoPopup_PC').css('display')=="block"){             //회원정보팝업 PC버전 띄웠을때 x눌렀을 경우
        $('#memberInfoPopup_PC').fadeOut('fast')
         $('#shade').fadeOut('fast');
    }else{                                          //회원등록팝업 띄웠을때 x눌렀을 경우
        if($('body').width()<600){
            $('#page_managemember').show();
            $('#float_btn_wrap').show();
            $('#float_btn').removeClass('rotate_btn');
        }
        $('#page_addmember').fadeOut('fast');
        $('#shade3').fadeOut('fast');
        $('#shade').fadeOut('fast');
        $('#float_btn').fadeIn('fast');
        $('#page-base').fadeIn();
        $('#page-base-addstyle').fadeOut();

        $('.ptaddbox input,#memberDue_add_2').val("");
        $('#birth_year, #birth_month, #birth_date').find('option:first').prop('selected', true)
        $('#birth_year, #birth_month, #birth_date').css('color','#cccccc')
    }
    // hk.kim 180313
    $('#id_search_confirm').val('0');
    $('#memberLastName_add').prop('disabled',false);
    $('#memberFirstName_add').prop('disabled',false);
    $('#memberPhone_add').prop('disabled',false);
    $('#memberEmail_add').prop('disabled',false);
    $('#birth_year').prop('disabled',false);
    $('#birth_month').prop('disabled',false);
    $('#birth_date').prop('disabled',false);

    $('.dropdown_selected').removeClass('dropdown_selected')
    $('.checked').removeClass('checked')
    $('.ptersCheckboxInner').removeClass('ptersCheckboxInner')
    $('#memberSex div').removeClass('selectbox_checked')
    $('.submitBtnActivated').removeClass('submitBtnActivated')
};

//서버로부터 회원의 반복일정 정보를 받아온다.
function get_indiv_repeat_info(userID){
    if($('#currentMemberList').css('display') == "block"){
      var Data = DB
    }else if($('#finishedMemberList').css('display') == "block"){
       var Data = DBe
    }else if($('#calendar').length>0){
        var Data = DB
    }
    var dbId = Data[userID].dbId
    $.ajax({
              url: '/trainer/read_member_lecture_data/',
              type:'POST',
              data: {"member_id": dbId},
              dataType : 'html',

              beforeSend:function(){
                  //beforeSend(); //ajax 로딩이미지 출력
                  console.log('test')
              },

              success:function(data){
                  console.log(data)
                var jsondata = JSON.parse(data);
                console.log(jsondata.messageArray)
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show()
                    $('#errorMessageText').text(jsondata.messageArray)
                }else{
                    $('#errorMessageBar').hide()
                    $('#errorMessageText').text('')
                    ptRepeatScheduleIdArray = jsondata.ptRepeatScheduleIdArray;
                    ptRepeatScheduleTypeArray = jsondata.ptRepeatScheduleTypeArray;
                    ptRepeatScheduleWeekInfoArray = jsondata.ptRepeatScheduleWeekInfoArray;
                    ptRepeatScheduleStartDateArray = jsondata.ptRepeatScheduleStartDateArray;
                    ptRepeatScheduleEndDateArray = jsondata.ptRepeatScheduleEndDateArray;
                    ptRepeatScheduleStartTimeArray = jsondata.ptRepeatScheduleStartTimeArray;
                    ptRepeatScheduleTimeDurationArray = jsondata.ptRepeatScheduleTimeDurationArray;
                    selectedMemberIdArray = jsondata.memberIdArray;
                    selectedMemberAvailCountArray = jsondata.memberAvailCountArray;
                    selectedMemberLectureIdArray = jsondata.memberLectureIdArray;
                    selectedMemberNameArray = jsondata.memberNameArray
                    set_indiv_repeat_info()
                }
                
                
              },

              complete:function(){
                //completeSend(); //ajax 로딩이미지 숨기기
              },

              error:function(){
                $('#errorMessageBar').show()
                $('#errorMessageText').text('통신 에러: 관리자 문의')
              }
        })
}

//서버로부터 받아온 반복일정을 회원정보 팝업에 그린다.
function set_indiv_repeat_info(){
    var repeat_info_dict= { 'KOR':
                              {'DD':'매일', 'WW':'매주', '2W':'격주',
                               'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일'},
                              'JAP':
                              {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                               'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日'},
                              'JAP':
                              {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                               'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat'}
                             }
    var len = ptRepeatScheduleIdArray.length
    var repeat_id_array = ptRepeatScheduleIdArray
    var repeat_type_array = ptRepeatScheduleTypeArray
    var repeat_day_info_raw_array = ptRepeatScheduleWeekInfoArray
    var repeat_start_array = ptRepeatScheduleStartDateArray
    var repeat_end_array = ptRepeatScheduleEndDateArray
    var repeat_time_array = ptRepeatScheduleStartTimeArray
    var repeat_dur_array = ptRepeatScheduleTimeDurationArray

    var schedulesHTML = []
    for(var i=0; i<ptRepeatScheduleIdArray.length; i++){
        var repeat_id = repeat_id_array[i]
        var repeat_type = repeat_info_dict['KOR'][repeat_type_array[i]]
        var repeat_start = repeat_start_array[i].replace(/-/gi,".");
        var repeat_start_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복 : </span>"
        //var repeat_end_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복종료 : </span>"
        var repeat_end_text = ""
        var repeat_end = repeat_end_array[i].replace(/-/gi,".");
        var repeat_time = Number(repeat_time_array[i].split(':')[0])+0
        var repeat_dur = repeat_dur_array[i]
        var repeat_sum = Number(repeat_time) + Number(repeat_dur)
        var repeat_day =  function(){
                            var repeat_day_info_raw = repeat_day_info_raw_array[i].split('/')
                            var repeat_day_info = ""
                            if(repeat_day_info_raw.length>1){
                                for(var j=0; j<repeat_day_info_raw.length; j++){
                                    var repeat_day_info = repeat_day_info + '/' + repeat_info_dict['KOR'][repeat_day_info_raw[j]].substr(0,1)
                                }
                            }else if(repeat_day_info_raw.length == 1){
                                var repeat_day_info = repeat_info_dict['KOR'][repeat_day_info_raw[0]]
                            }
                            if(repeat_day_info.substr(0,1) == '/'){
                                var repeat_day_info = repeat_day_info.substr(1,repeat_day_info.length)
                            }
                              return repeat_day_info
                          };
        var summaryInnerBoxText_1 = '<p class="summaryInnerBoxText">'+repeat_type +' '+repeat_day() +' '+repeat_time+' ~ '+repeat_sum+'시 ('+repeat_dur +'시간)'+'</p>'
        var summaryInnerBoxText_2 = '<p class="summaryInnerBoxText">'+repeat_start_text+repeat_start+' ~ '+repeat_end_text+repeat_end+'</p>'
        var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>'
        schedulesHTML[i] = '<div class="summaryInnerBox" data-id="'+repeat_id+'">'+summaryInnerBoxText_1+summaryInnerBoxText_2+deleteButton+'</div>'
    }
    $('#memberRepeat_info_PC').html(schedulesHTML.join(''))
}
//회원등록////////////////////////////////////////////////////////


//ajax 로딩이미지 표기
function beforeSend(){
    $('html').css("cursor","wait");
    $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
    $('.ajaxloadingPC').show();
}

//ajax 로딩이미지 숨기기
function completeSend(){
    $('html').css("cursor","auto");
    $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
    $('.ajaxloadingPC').hide();
    //$('#shade').hide();
    //$('#calendar').show();
    //alert('complete: 일정 정상 등록')
}