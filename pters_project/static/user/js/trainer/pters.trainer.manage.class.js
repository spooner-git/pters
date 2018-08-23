$(document).ready(function(){

    //ESC키를 눌러서 팝업 닫기
    $(document).keyup(function(e){
        if(e.keyCode == 27){
            if($('#memberInfoPopup_PC').css('display') == 'block'){
                closePopup('member_info_PC')
            }else{
                close_info_popup('cal_popup_plandelete')
                closePopup('member_add')
            }
        }
    })
    //ESC키를 눌러서 팝업 닫기

    $(document).on('click','.phonesms',function(e){
        e.stopPropagation();
    })

    $('form button').click(function(e){
        e.preventDefault()
    })
    var db_id_flag = 0;
    var user_id_flag = 1;
    var filter = "win16|win32|win64|mac|macintel";
    var platform_check;
    var browser_check;
    var agent = navigator.userAgent.toLowerCase();
    if ( navigator.platform ) {
        if ( filter.indexOf( navigator.platform.toLowerCase() ) < 0 ) {
            //mobile
            platform_check = 'mobile'
        }
        else {
            //pc
            platform_check = 'pc'
        }
    }

    if (agent.indexOf("safari") != -1) {
        browser_check = 'safari'
    }
    if (agent.indexOf("chrome") != -1) {
        browser_check = 'chrome'
    }
    if (agent.indexOf("firefox") != -1) {
        browser_check = 'firefox'
    }

    $(".btn-group > .btn").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
    });

    $('.list_switch').click(function(){
        $(this).addClass("list_switch_selected").siblings().removeClass("list_switch_selected")
    })




    $('li').click(function(){
        if($('#calendar').length==0){
            if($('.dropdown').hasClass('open')){
                $('html, body').css('overflow-y','auto');
            }else{
                $('html, body').css('overflow-y','hidden');
            }
        }
    })

////////////신규 회원등록 레이어 팝업 띄우기//////////////////////////////////////////////////////////////
    $(document).on('click','#upbutton-x-modify',function(){
        var bodywidth = window.innerWidth;
        var selector_calendar = $('#calendar');
        closePopup('member_info');
        /*
        if($('body').width()<600){
            $('#calendar').css('display','block')
        }
        */
    })

    $(document).on('click','#upbutton-x',function(){
        closePopup('member_add');
        /*
        if($('body').width()<600){
            $('#calendar').css('display','block')
        }
        */
    })
////////////신규 회원등록 레이어 팝업 띄우기//////////////////////////////////////////////////////////////

    $('.alignSelect').change(function(){
        //var jsondata = global_json
        if($(this).val()=="회원명 가나다 순" || $(this).val()=="名前順" || $(this).val()=="Name" ){
            get_member_ing_list("callback",function(jsondata){
                memberListSet('current','name','no',jsondata);
            })
            get_member_end_list("callback",function(jsondata){
                memberListSet('finished','name','no',jsondata);
            })
            alignType = 'name'
        }else if($(this).val()=="남은 횟수 많은 순" || $(this).val()=="残り回数が多い" || $(this).val()=="Remain Count(H)"){
            get_member_ing_list("callback",function(jsondata){
                memberListSet('current','count','yes',jsondata);
            })
            alignType = 'countH'
        }else if($(this).val()=="남은 횟수 적은 순" || $(this).val()=="残り回数が少ない" || $(this).val()=="Remain Count(L)"){
            get_member_ing_list("callback",function(jsondata){
                memberListSet('current','count','no',jsondata);
            })
            alignType = 'countL'
        }else if($(this).val()=="시작 일자 과거 순" || $(this).val()=="開始が過去" || $(this).val()=="Start Date(P)"){
            get_member_ing_list("callback",function(jsondata){
                memberListSet('current','date','no',jsondata);
            })
            get_member_end_list("callback",function(jsondata){
                memberListSet('finished','date','no',jsondata);
            })
            alignType = 'startP'
        }else if($(this).val()=="시작 일자 최근 순" || $(this).val()=="開始が最近" || $(this).val()=="Start Date(R)"){
            get_member_ing_list("callback",function(jsondata){
                memberListSet('current','date','yes',jsondata);
            })
            get_member_end_list("callback",function(jsondata){
                memberListSet('finished','date','yes',jsondata);
            })
            alignType = 'startR'
        }
    })

//#####################회원정보 팝업 //#####################

    $(document).on('click','.memberline',function(){  //회원이름을 클릭했을때 새로운 팝업을 보여주며 정보를 채워준다.
        var dbID = $(this).find('._id').attr('data-dbid');
        shade_index(100)
        if($('body').width()<600){
            get_indiv_member_info(dbID)
            get_indiv_repeat_info(dbID);
            get_member_lecture_list(dbID);
            get_member_history_list(dbID);
        }else if($('body').width()>=600){
            get_indiv_member_info(dbID)
            get_indiv_repeat_info(dbID);
            get_member_lecture_list(dbID);
            get_member_history_list(dbID);
            $('#info_shift_base, #info_shift_lecture').show();
            $('#info_shift_schedule, #info_shift_history').hide();
            $('#select_info_shift_lecture').addClass('button_active')
            $('#select_info_shift_schedule, #select_info_shift_history').removeClass('button_active')
        }
        shade_index(100)
    });

    //PC 회원 이력 엑셀 다운로드 버튼 (회원목록에서)
    $(document).on('click','._manage img._info_download',function(e){
        e.stopPropagation()
        var memberID = $(this).parent('td').siblings('.id').text()
        var dbID = $(this).parent('td').siblings('._id').attr('data-dbid')
        if(platform_check == 'mobile'){
            alert('엑셀 다운로드는 PC에서만 다운로드 가능합니다.')
        }else{
            alert('회원님 정보를 엑셀 다운로드를 시작합니다.\n 브라우저의 다운로드 창을 확인 해주세요.')
            location.href="/trainer/export_excel_member_info/?member_id="+dbID
        }
    })

    //PC 회원 이력 엑셀 다운로드 버튼 (회원정보창에서)
    $(document).on('click','button._info_download',function(){
        var memberID = $('#memberInfoPopup_PC').attr('data-userid')
        var dbID = $('#memberInfoPopup_PC').attr('data-dbid')
        if(platform_check == 'mobile'){
            alert('엑셀 다운로드는 PC에서만 다운로드 가능합니다.')
        }else {
            alert('회원님 정보를 엑셀 다운로드를 시작합니다.\n 브라우저의 다운로드 창을 확인 해주세요.')
            location.href = "/trainer/export_excel_member_info/?member_id=" + dbID
        }
    })

    /*
     //PC 회원 리스트 엑셀 다운로드 버튼 (회원목록에서, 진행중 멤버)
     $(document).on('click','#currentMemberList div._info_download',function(){

     if(platform_check == 'mobile'){
     alert('엑셀 다운로드는 PC에서만 다운로드 가능합니다.')
     }else {
     alert('회원님 정보를 엑셀 다운로드를 시작합니다.\n 브라우저의 다운로드 창을 확인 해주세요.')
     location.href = "/trainer/export_excel_member_list/?finish_flag=0"
     }
     })

     //PC 회원 리스트 엑셀 다운로드 버튼 (회원목록에서, 종료된 멤버)
     $(document).on('click','#finishedMemberList div._info_download',function(){

     if(platform_check == 'mobile'){
     alert('엑셀 다운로드는 PC에서만 사용 가능합니다.')
     }else {
     alert('회원님 정보를 엑셀 다운로드를 시작합니다.\n 브라우저의 다운로드 창을 확인 해주세요.')
     location.href = "/trainer/export_excel_member_list/?finish_flag=1"
     }
     })
     */

    $(document).on('click', '#alignBox div._info_download', function(){
        if(platform_check == 'mobile'){
            alert('엑셀 다운로드는 PC에서만 다운로드 가능합니다.')
        }else{
            if($('#currentMemberList').css('display') == "block"){ //진행중인 회원 전체 목록
                alert('회원님 정보를 엑셀 다운로드를 시작합니다.\n 브라우저의 다운로드 창을 확인 해주세요.')
                location.href = "/trainer/export_excel_member_list/?finish_flag=0"
            }else if($('#finishedMemberList').css('display') == "block"){ //종료된 회원 전체 목록
                alert('회원님 정보를 엑셀 다운로드를 시작합니다.\n 브라우저의 다운로드 창을 확인 해주세요.')
                location.href = "/trainer/export_excel_member_list/?finish_flag=1"
            }else if($('#currentGroupList').css('display') == "block"){ //진행중인 그룹 전체 목록
                alert('진행중 그룹 전체 목록 다운로드!!')
            }else if($('#finishedGroupList').css('display') == "block"){ //종료된 그룹 전체 목록
                alert('종료된 그룹 전체 목록 다운로드!!')
            }
        }
    })


    modify_member_base_info_eventGroup()
    function modify_member_base_info_eventGroup(){
        if(varUA.match('firefox')){
            $('#memberName_info_lastName_PC, #memberName_info_lastName').bind('keydown',function(e){
                var keyCode = e.which || e.keyCode;
                if(keyCode === 13 || keyCode === 9){
                    $('#form_lastname_modify').val($(this).val())
                }
            })

            $('#memberName_info_firstName_PC, #memberName_info_firstName').bind('keydown',function(e){
                var keyCode = e.which || e.keyCode;
                if(keyCode === 13 || keyCode === 9){
                    $('#form_firstname_modify').val($(this).val())
                }
            })
        }else{
            $('#memberName_info_lastName_PC, #memberName_info_lastName').keyup(function(){
                $('#form_lastname_modify').val($(this).val())
            })

            $('#memberName_info_firstName_PC, #memberName_info_firstName').keyup(function(){
                $('#form_firstname_modify').val($(this).val())
            })
        }

        $('#memberPhone_info, #memberPhone_info_PC').keyup(function(){
            $('#form_phone_modify').val($(this).val())
        })


        //Mobile 버전 회원정보창 생년월입 드랍다운
        $('#birth_year_info, #birth_month_info, #birth_date_info').change(function(){
            var birth = $('#birth_year_info').val().replace(/년/gi,'')+'-'+$('#birth_month_info').val().replace(/월/gi,'')+'-'+$('#birth_date_info').val().replace(/일/gi,'')
            if($('#birth_year_info').val().length < 1 || $('#birth_month_info').val().length < 1 || $('#birth_date_info').val().length < 1){
                $('#form_birth_modify').val('')
            }else{
                $('#form_birth_modify').val(birth)
            }
        })

        //PC버전 회원정보창 생년월입 드랍다운
        $('#memberBirth_Year_info_PC, #memberBirth_Month_info_PC, #memberBirth_Date_info_PC').change(function(){
            var birth = $('#memberBirth_Year_info_PC').val().replace(/년/gi,'')+'-'+$('#memberBirth_Month_info_PC').val().replace(/월/gi,'')+'-'+$('#memberBirth_Date_info_PC').val().replace(/일/gi,'')
            $('#form_birth_modify').val(birth)

        })

    }


    //PC 회원삭제버튼 (회원목록에서)
    $(document).on('click','._manage img._info_delete',function(e){
        e.stopPropagation();
        deleteTypeSelect = "memberinfodelete";
        var selectedUserId = $(this).parent('td').siblings('._id').text();
        var selectedUserName = $(this).parent('td').siblings('._tdname').text();
        if(Options.language == "KOR"){
            var text = "회원 삭제"
            var text2 = "정말 "
            var text3 = " 회원님을 삭제하시겠습니까?<br>삭제하면 복구할 수 없습니다.</p>"
        }else if(Options.language == "JPN"){
            var text = "メンバー削除"
            var text2 = "<p>"
            var text3 = "様の情報や記録を削除しますか。<br>復旧できません。</p>"
        }else if(Options.language == "ENG"){
            var text =　"Delete Member"
            var text2 = "<p>Are you sure to delete "
            var text3 = "'s data?</p>"
        }
        $('#popup_delete_title').text(text);
        $('#popup_delete_question').html(text2+selectedUserName+text3);


        $('#deleteMemberId').val(selectedUserId);
        //$('.confirmPopup').fadeIn('fast');
        $('#cal_popup_plandelete').show();
        $('#shade3').show('fast');
    })

    //PC & Mobile 회원삭제버튼 (회원정보창에서)
    $(document).on('click','button._info_delete',function(){
        //$('.confirmPopup').fadeIn('fast');
        deleteTypeSelect = "memberinfodelete";
        $('#cal_popup_plandelete').show();
        $('#popup_delete_question').text('정말 회원님을 삭제하시겠습니까?')
    })


    //회원 등록이력 수정 버튼
    $(document).on('click','#memberRegHistory_info_PC img, #memberRegHistory_info img',function(){
        if(Options.language == "KOR"){
            var text = "완료"
        }else if(Options.language == "JPN"){
            var text = "決定"
        }else if(Options.language == "ENG"){
            var text =　"OK"
        }

        $(this).attr('src','/static/user/res/btn-pt-complete.png');
        var dbID = $(this).attr('data-dbid');
        var userName = $(this).attr('data-username')
        var lectureID = $(this).attr('data-leid');
        if($(this).attr('data-type')=="view"){
            if($('body').width()<600){
                var myRow = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').siblings('div').find('input');
                var myRowSelect = $(this).parent('div').siblings('div.whatGroupType').find('select');
                var myNoteRow = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').siblings('div.mobile_member_note').find('input')
            }else if($('body').width()>=600){
                var myRow = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').find('input');
                var myRowSelect = $('select[data-leid='+$(this).attr('data-leid')+']');
                var myNoteRow = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').siblings('div[data-leid='+$(this).attr('data-leid')+']').find('input');

            }
            myRow.addClass('input_available').attr('disabled',false);
            myRowSelect.addClass('input_available').attr('disabled',false);
            myNoteRow.addClass('input_available').attr('disabled',false);


            $('#memberRegHistory_info_PC img[data-leid!='+$(this).attr('data-leid')+']').hide();
            $(this).text(text).attr('data-type',"modify");
            $('#form_member_dbid').val(dbID);
            $('#form_lecture_id').val(lectureID);
            $('#form_start_date').val($(this).parent('div').siblings('div').find('.lec_start_date').val())
            $('#form_end_date').val($(this).parent('div').siblings('div').find('.lec_end_date').val())
            $('#form_price').val($(this).parent('div').siblings('div').find('#regPrice').val())
            $('#form_lecture_reg_count').val($(this).parent('div').siblings('div').find('.lec_reg_count').val())
            $('#form_note').val(myNoteRow.val())
        }else if($(this).attr('data-type')=="modify"){
            $('#form_price').val($('#form_price').val().replace(/,/gi,''))
            send_member_modified_data(dbID);
        }else if($(this).attr('data-type')=="resend"){

        }
    });



    $('#popup_delete_btn_no, #cal_popup_plandelete .popup_close_x_button').click(function(){
        if(!$('._calmonth') && !$('._calweek')){
            close_info_popup('cal_popup_plandelete')
        }
    });

    $('#select_info_shift_lecture').click(function(){
        $('#info_shift_lecture').show();
        $('#info_shift_schedule').hide();
        $('#info_shift_history').hide();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});\
        $(this).addClass('button_active')
        $(this).siblings('.button_shift_info').removeClass('button_active')
    });

    $('#select_info_shift_schedule').click(function(){
        $('#info_shift_lecture').hide();
        $('#info_shift_schedule').show();
        $('#info_shift_history').hide();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});
        $(this).addClass('button_active')
        $(this).siblings('.button_shift_info').removeClass('button_active')
    });

    $('#select_info_shift_history').click(function(){
        $('#info_shift_lecture').hide();
        $('#info_shift_schedule').hide();
        $('#info_shift_history').show();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});
        $(this).addClass('button_active')
        $(this).siblings('.button_shift_info').removeClass('button_active')
    });

    $('#select_info_shift_lecture_mobile').click(function(){
        $('#mobile_lecture_info').show();
        $('#mobile_repeat_info').hide();
        $('#mobile_history_info').hide();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});\
        $(this).addClass('button_active')
        $(this).siblings('.button_shift_info').removeClass('button_active')
    });

    $('#select_info_shift_schedule_mobile').click(function(){
        $('#mobile_lecture_info').hide();
        $('#mobile_repeat_info').show();
        $('#mobile_history_info').hide();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});
        $(this).addClass('button_active')
        $(this).siblings('.button_shift_info').removeClass('button_active')
    });

    $('#select_info_shift_history_mobile').click(function(){
        $('#mobile_lecture_info').hide();
        $('#mobile_repeat_info').hide();
        $('#mobile_history_info').show();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});
        $(this).addClass('button_active')
        $(this).siblings('.button_shift_info').removeClass('button_active')
    });


    //???
    $(document).on('click','div.lectureType_RJ',function(){
        $('.resendPopup').show().attr({'data-type':'resend',
            'data-leid':$(this).attr('data-leid'),
            'data-dbid':$(this).attr('data-dbid'),
            'data-name':$(this).attr('data-name')});
        show_shadow_reponsively();
    });

    //미연결
    $(document).on('click','div.lectureType_DELETE',function(){
        $('.resendPopup').show().attr({'data-type':'resend',
            'data-leid':$(this).attr('data-leid'),
            'data-dbid':$(this).attr('data-dbid'),
            'data-name':$(this).attr('data-name')});
        show_shadow_reponsively();
    });

    //연결됨, 대기
    $(document).on('click','div.lectureType_WAIT, div.lectureType_VIEW',function(){
        $('.lectureConnectStateChangePopup').show().attr({'data-type':'resend',
            'data-leid':$(this).attr('data-leid'),
            'data-dbid':$(this).attr('data-dbid'),
            'data-name':$(this).attr('data-name')});
        show_shadow_reponsively();
    });


    //진행중
    $(document).on('click','div.lecConnectType_IP',function(){
        //$('.lectureRefundPopup').fadeIn('fast').attr({'data-type':'resend','data-leid':$(this).attr('data-leid')});
        $('.lectureStateChangeSelectPopup').show().attr({'data-leid':$(this).attr('data-leid'),
            'data-dbid':$(this).attr('data-dbid'),
            'data-username':$(this).parents('._member_info_popup').attr('data-username'),
            'data-userid':$(this).parents('._member_info_popup').attr('data-userid')});
        $('._resume, ._delete').css('display','none')
        if($('body').width()>600){
            $('._complete, ._refund').css('display','inline-block')
        }else{
            $('._complete, ._refund').css('display','block')
        }
        $('.lectureStateChangeSelectPopup').find('._explain').html('※진행완료 : 남은 횟수를 0으로 만들고 종료 처리<br>※환불 : 환불 금액을 입력하고 종료 처리')
        show_shadow_reponsively();
    });

    //진행완료 텍스트를 클릭했을때
    $(document).on('click','div.lecConnectType_PE',function(){
        var bodywidth = window.innerWidth;
        var selector_lectureStateChangeSelectPopup = $('.lectureStateChangeSelectPopup');
        //$('.lectureRefundPopup').fadeIn('fast').attr({'data-type':'resend','data-leid':$(this).attr('data-leid')});
        selector_lectureStateChangeSelectPopup.show().attr({'data-leid':$(this).attr('data-leid'),
            'data-dbid':$(this).attr('data-dbid'),
            'data-username':$(this).parents('._member_info_popup').attr('data-username'),
            'data-userid':$(this).parents('._member_info_popup').attr('data-userid')});
        $('._complete, ._refund').css('display','none');
        if(bodywidth > 600){
            $('._resume, ._delete').css('display','inline-block');
        }else{
            $('._resume, ._delete').css('display','block');
        }
        selector_lectureStateChangeSelectPopup.find('._explain').html('※재개 : 남은 횟수를 다시 가져옵니다.');
        
        //수강자동 완료처리가 ON일떄 재개 버튼을 막는다.
        var enddate_thislect = $(this).siblings('div').find('.lec_end_date').val().replace(/\./gi,'-')
        if(Options.lecture_autocomplete == 0){                  //수강 자동완료 기능 OFF
            $('div._resume').removeClass('disabled_button');
        }else if(Options.lecture_autocomplete == 1 ){           //수강 자동완료 기능 ON
            if(compare_date2(enddate_thislect, today_YY_MM_DD) == true){
                $('div._resume').removeClass('disabled_button');
            }else{
                $('div._resume').addClass('disabled_button');
            }
        }
        show_shadow_reponsively();
    });


    //환불 텍스트를 클릭했을때
    $(document).on('click','div.lecConnectType_RF',function(){
        var bodywidth = window.innerWidth;
        var selector_lectureStateChangeSelectPopup = $('.lectureStateChangeSelectPopup');
        //$('.lectureRefundPopup').fadeIn('fast').attr({'data-type':'resend','data-leid':$(this).attr('data-leid')});
        selector_lectureStateChangeSelectPopup.show().attr({'data-leid':$(this).attr('data-leid'),
            'data-dbid':$(this).attr('data-dbid'),
            'data-username':$(this).parents('._member_info_popup').attr('data-username'),
            'data-userid':$(this).parents('._member_info_popup').attr('data-userid')});
        $('._complete, ._refund').css('display','none');
        if(bodywidth > 600){
            $('._resume, ._delete').css('display','inline-block');
        }else{
            $('._resume, ._delete').css('display','block');
        }
        selector_lectureStateChangeSelectPopup.find('._explain').html('※재개 : 남은 횟수를 다시 가져옵니다.');

        $('div._resume').removeClass('disabled_button');

        show_shadow_reponsively();
    });



    $('._btn_close_resend_PC, ._btn_close_statechange_PC').click(function(){
        $(this).parents('.popups').hide();
        hide_shadow_responsively();
    });

    $('span.resend').parent('div').click(function(){
        var lectureID = $('.resendPopup').attr('data-leid');
        var dbID = $('.resendPopup').attr('data-dbid')
        resend_member_reg_data_pc(lectureID, dbID)
        $('.resendPopup').css('display','none');
        $('#shade3').css('display','none');
    });

    $('span.cancel_resend').parent('div').click(function(){
        $('.resendPopup').css('display','none');
        hide_shadow_responsively();
    });

    /*
     $('span.delete_resend').parent('div').click(function(){
     var lectureID;
     var userName;
     var userId;
     delete_member_reg_data_pc(lectureID, userName, userId)
     $('.resendPopup').css('display','none');
     hide_shadow_responsively();
     });
     */

    /*그룹 진행완료, 재개와 겹침*/
     //진행 완료 처리 버튼
     $('.lectureStateChangeSelectPopup ._complete').click(function(){
        if($('.lectureStateChangeSelectPopup').attr('data-grouptype') !='group'){
            var lectureID = $('.lectureStateChangeSelectPopup').attr('data-leid');
            var dbID = $('.lectureStateChangeSelectPopup').attr('data-dbid');
            complete_member_reg_data_pc(lectureID, dbID)
            $('.lectureStateChangeSelectPopup').css('display','none')
        }
         
     })

     //재개 처리 버튼
     $('.lectureStateChangeSelectPopup ._resume').click(function(){
        if($('.lectureStateChangeSelectPopup').attr('data-grouptype') !='group'){
            if(!$(this).hasClass('disabled_button')){
                var selectore_lectureStateChangeSelectPopup = $('.lectureStateChangeSelectPopup');
                var lectureID = selectore_lectureStateChangeSelectPopup.attr('data-leid');
                var dbID = selectore_lectureStateChangeSelectPopup.attr('data-dbid');
                resume_member_reg_data_pc(lectureID, dbID);
                selectore_lectureStateChangeSelectPopup.css('display','none');
            }else{
                show_caution_popup(
                                    '<p style="color:#fe4e65;">수강 자동 완료 기능이 활성화 상태입니다.</p>'+
                                        '<div style="width:95%;border:1px solid #cccccc;margin:0 auto;padding-top:10px;margin-bottom:10px;">'+
                                            '<p>- 옵션에서 수강 자동완료 해제 혹은<br>- 종료일자를 오늘 이후 날짜로 설정해주세요.</p>'+
                                        '</div>'+
                                    '<p>확인 후 다시 시도해주세요.</p>'
                                    )
            }
        }
     })
     /*그룹 진행완료, 재개와 겹침*/

    //삭제 처리 버튼
    $('.lectureStateChangeSelectPopup ._delete').click(function(){
        var lectureID = $('.lectureStateChangeSelectPopup').attr('data-leid');
        var dbID = $('.lectureStateChangeSelectPopup').attr('data-dbid');
        delete_member_reg_data_pc(lectureID, dbID);
        $('.lectureStateChangeSelectPopup').css('display','none')
    })

    //환불 입력으로 이동 버튼
    $('.lectureStateChangeSelectPopup ._refund').click(function(){
        $('.lectureStateChangeSelectPopup').css('display','none')
        $('.lectureRefundPopup').css('display','block').attr({'data-leid':$('.lectureStateChangeSelectPopup').attr('data-leid'),
            'data-username':$('.lectureStateChangeSelectPopup').attr('data-username'),
            'data-dbid':$('.lectureStateChangeSelectPopup').attr('data-dbid')
        })
        $('#datepicker_refund').val(today_YY_MM_DD);
    })

    $('.lectureStateChangeSelectPopup ._cancel').click(function(){
        $('.lectureStateChangeSelectPopup').css('display','none');
        hide_shadow_responsively();
    })


    $('span.refund').parent('div').click(function(){
        var lectureID = $('.lectureRefundPopup').attr('data-leid');
        var dbID = $('.lectureRefundPopup').attr('data-dbid');
        var refund_price = $('div.lectureRefundPopup input[name="refund_price"]').val().replace(/,/gi,'');
        var refund_date = $('#datepicker_refund').val();
        refund_member_lecture_data(lectureID, dbID, refund_price, refund_date);
        $('.lectureRefundPopup').css('display','none');
    });

    $('.lectureRefundPopup input').keyup(function(){
        var priceInputValue = Number($(this).val().replace(/,/g, ""));
        $(this).val(numberWithCommas(priceInputValue));

    })

    $("#datepicker_refund").datepicker({
        onSelect : function(curDate, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
            if( curDate != instance.lastVal ){
               
            }
        }
    });

    $('span.cancel_refund').parent('div').click(function(){
        $('.lectureRefundPopup').css('display','none');
        hide_shadow_responsively();
    });


    $('span.connectchange').parent('div').click(function(){
        var stateCode =  $(this).attr('data-stat');
        var lectureID = $('.lectureConnectStateChangePopup').attr('data-leid')
        var dbID =$('.lectureConnectStateChangePopup').attr('data-dbid')
        disconnect_member_lecture_data(stateCode, lectureID, dbID)
        $('.lectureConnectStateChangePopup').css('display','none');
    });
    $('span.cancel_connectchange').parent('div').click(function(){
        $('.lectureConnectStateChangePopup').css('display','none');
        hide_shadow_responsively();
    });





    //회원 정보팝업의 일정정보내 반복일정 취소버튼
    $(document).on('click','.deleteBtn',function(e){ //일정요약에서 반복일정 오른쪽 화살표 누르면 휴지통 열림
        e.stopPropagation()
        var $btn = $(this).find('div');
        if($btn.css('width')=='0px'){
            $btn.animate({'width':'40px'},300);
            $btn.find('img').css({'display':'block'});
            $('.deleteBtnBin').not($btn).animate({'width':'0px'},230);
            $('.deleteBtnBin img').not($btn.find('img')).css({'display':'none'});
        }
    });


    $(document).on('click','div.deleteBtnBin',function(e){
        e.stopPropagation()
        var id_info = $(this).parents('div.summaryInnerBox').attr('data-id');
        $('#id_repeat_schedule_id_confirm').val(id_info);
        $('#cal_popup_plandelete').show().attr({'data-repeatid':$(this).attr('data-repeatid'), 'data-dbid':$(this).attr('data-dbid'), 'data-groupid':$(this).attr('data-groupid')});
        if($(this).attr('data-deletetype') == 'grouprepeatinfo'){
            deleteTypeSelect = 'grouprepeatinfodelete';
            shade_index(100)
        }else if($(this).attr('data-deletetype') == 'repeatinfo'){
            deleteTypeSelect = 'repeatinfodelete';
            shade_index(200)
        }else if($(this).attr('data-deletetype') == 'class'){
            deleteTypeSelect = 'repeatptdelete';
            shade_index(200)
        }else if($(this).attr('data-deletetype') == 'off'){
            deleteTypeSelect = 'repeatoffdelete';
            shade_index(200)
        }else if($(this).attr('data-deletetype') == 'group'){
            deleteTypeSelect = 'repeatgroupptdelete';
            shade_index(200)
        }

    });

    $(document).on('click','.summaryInnerBox',function(e){ //반복일정 텍스트 누르면 휴지통 닫힘
        e.stopPropagation()
        var $btn = $('.deleteBtnBin');
        $btn.animate({'width':'0px'},230);
        $btn.find('img').css({'display':'none'});
    });


    $('#popup_delete_btn_yes').click(function(){
        //if($('#calendar').length==0){
        if(deleteTypeSelect == "repeatinfodelete"){
            var repeat_schedule_id = $(this).parent('#cal_popup_plandelete').attr('data-repeatid');
            var dbID = $(this).parent('#cal_popup_plandelete').attr('data-dbid');
            send_repeat_delete_personal(repeat_schedule_id, 'callback', function(jsondata){
                get_indiv_repeat_info(dbID);
                get_member_lecture_list(dbID);
                get_member_history_list(dbID);
                close_info_popup('cal_popup_plandelete')
                deleteTypeSelect = "memberinfodelete";
                if($('#calendar').length!=0){
                    ajaxClassTime()
                }
            })

        }else if(deleteTypeSelect == "memberinfodelete"){
            deleteMemberAjax();
            closePopup('member_info');
            closePopup('member_info_PC')

        }else if(deleteTypeSelect == "groupdelete"){
            var group_id = group_delete_JSON.group_id
            var groupmember_fullnames = group_delete_JSON.fullnames
            var groupmember_ids = group_delete_JSON.ids

            //그룹을 지운다.
            delete_group_from_list(group_delete_JSON.group_id)
            //그룹원들에게서 그룹에 대한 수강이력을 지운다.
            delete_groupmember_from_grouplist()

            group_delete_JSON.group_id = ""
            group_delete_JSON.fullnames = []
            group_delete_JSON.ids = []
            close_info_popup('cal_popup_plandelete')

        }else if(deleteTypeSelect == "grouprepeatinfodelete"){
            var group_id = $(this).parent('#cal_popup_plandelete').attr('data-groupid')
            var repeat_schedule_id = $(this).parent('#cal_popup_plandelete').attr('data-repeatid');
            send_repeat_delete_group(repeat_schedule_id, 'callback', function(){
                close_info_popup('cal_popup_plandelete')
                get_group_repeat_info(group_id)
                if($('body').width()>=600){
                    $('#calendar').css('position','relative')
                }
            })
            // get_member_repeat_id_in_group_repeat(repeat_schedule_id, 'callback', function(jsondata){
            //     for(var i=0; i<jsondata.repeatScheduleIdArray.length; i++){
            //         send_repeat_delete_personal(jsondata.repeatScheduleIdArray[i])
            //     }
            // })
        }
    });


    function get_member_repeat_id_in_group_repeat(group_repeat_id, use, callback){
        //var AJAXTESTTIMER =  TEST_CODE_FOR_AJAX_TIMER_starts('/trainer/get_group_member_repeat_schedule_list')
        $.ajax({
            url: '/trainer/get_group_member_repeat_schedule_list/',
            type : 'GET',
            data : {"group_repeat_schedule_id":group_repeat_id},
            dataType : 'html',

            beforeSend:function(){
                beforeSend()
            },

            success:function(data){
                //TEST_CODE_FOR_AJAX_TIMER_ends(AJAXTESTTIMER)
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show()
                    $('#errorMessageText').text(jsondata.messageArray)
                }else{
                    if(use == "callback"){
                        callback(jsondata)
                    }
                }
            },

            complete:function(){
                completeSend()
            },

            error:function(){
                $('#errorMessageBar').show()
                $('#errorMessageText').text('통신 에러: 관리자 문의')
            }
        })
    }




//#####################회원정보 팝업 //#####################



//#####################회원정보 도움말 팝업 //#####################
    $('._regcount, ._remaincount').mouseenter(function(){
        if(Options.language == "KOR"){
            var text = '등록횟수는 회원님께서 계약시 등록하신 횟수를 의미합니다.'
            var text2 = '남은횟수는 회원님의 등록횟수에서 현재까지 진행완료된 강의 횟수를 뺀 값을 의미합니다.'
        }else if(Options.language == "JPN"){
            var text = "登録回数はメンバーが契約時に登録した回数です。"
            var text2 = "残り回数はメンバーの登録回数から現在まで進行完了した授業回数をひいた値です。"
        }else if(Options.language == "ENG"){
            var text =　"Regisration Count means total lesson counts."
            var text2 = "Remain counts = Registration count - completed lesson count"
        }
        var LOCTOP = $(this).offset().top;
        var LOCLEFT = $(this).offset().left;
        if($('#currentMemberList').width()>=600){
            $('.instructPopup').show().css({'top':LOCTOP+40,'left':LOCLEFT});
        };

        if($(this).hasClass('_regcount')){
            $('.instructPopup').text(text);
        }else if($(this).hasClass('_remaincount')){
            $('.instructPopup').text(text2);
        }
    });


    $('#alignBox,.centeralign').mouseenter(function(){
        $('.instructPopup').hide();
    });
//#####################회원정보 도움말 팝업 //#####################



    $('#memberSearchButton').click(function(e){
        e.preventDefault()
        var searchID = $('#memberSearch_add').val()
        $.ajax({
            url:'/trainer/get_member_info/',
            type:'GET',
            data: {'id':searchID, 'id_flag':user_id_flag},
            dataType : 'html',

            beforeSend:function(){
                beforeSend();
            },

            //보내기후 팝업창 닫기
            complete:function(){
                completeSend();
            },

            //통신성공시 처리
            success:function(data){
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray);
                }else{
                    $('#errorMessageBar').hide();
                    $('#errorMessageText').text('');
                    id_search_memberLastName = jsondata.lastnameInfo;
                    id_search_memberFirstName = jsondata.firstnameInfo;
                    id_search_memberPhone = jsondata.phoneInfo;
                    id_search_memberBirth = jsondata.birthdayInfo + ''; //형식 1999년 02월 08일
                    id_search_memberEmail = jsondata.emailInfo;
                    id_search_memberId = jsondata.idInfo;
                    id_search_memberSex = jsondata.sexInfo;
                    $('#id_username_info').val(jsondata.idInfo);
                    $('#id_user_id').val(jsondata.dbIdInfo);
                    $('#memberSex .selectboxopt').removeClass('selectbox_checked');
                    fill_member_info_by_ID_search();
                    $('#memberSearchButton').attr('data-type','searched');
                    $('#memberSex .selectboxopt').addClass('selectbox_disable');
                    $('._ADD_MEMBER_NEW').show();
                }

            },

            //통신 실패시 처리
            error:function(){
                $('#errorMessageBar').show();
                $('#errorMessageText').text('아이디를 입력해주세요');
            },
        });
    });

    $("#datepicker_add, #datepicker2_add").datepicker({
        //minDate : 0,
        onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
            $(this).css({
                             "-webkit-text-fill-color":'#282828'
                        })

            $(this).addClass("dropdown_selected");
            $("#datepicker2_add").datepicker('option','minDate',$("#datepicker_add").val());
            $("#datepicker_add").datepicker('option','maxDate',$("#datepicker2_add").val());
            check_dropdown_selected();
        }
    });


    $("#datepicker_fast").datepicker({
        //minDate : 0,
        onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
            $(this).css({
                             "-webkit-text-fill-color":'#282828'
                        })
            
            $(this).addClass("dropdown_selected");
            autoDateInput();
            check_dropdown_selected();
        }
    });


    $(document).on("focus","input.lec_start_date, input.lec_end_date",function(){
        $(this).datepicker({
            onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
                $('#'+$(this).attr('data-type').replace(/lec_/gi,'form_')).val($(this).val());
                var startDatepicker = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').find('input.lec_start_date');
                var endDatepicker = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').find('input.lec_end_date');
                $("input.lec_end_date").datepicker('option','minDate',startDatepicker.val());
                $("input.lec_start_date").datepicker('option','maxDate',endDatepicker.val());
            }
        });
    });


    $("#memberEmail_add").keyup(function(){  //이메일 입력시 하단에 핑크선
        if($(this).val().length>8){
            $(this).addClass("dropdown_selected");
            check_dropdown_selected();
        }else{
            $(this).removeClass("dropdown_selected");
            check_dropdown_selected();
        }
        $('#id_email').val($('#memberEmail_add').val());
    });

    if(varUA.match('firefox')){
        $("#memberLastName_add, #memberFirstName_add").bind("keydown",function(e){  //이름 입력시 하단에 핑크선
            var keyCode = e.which || e.keyCode;
            if(keyCode === 13 || keyCode === 9){
                if($(this).val().length>=1){
                    limit_char(this);
                    $(this).addClass("dropdown_selected");
                    check_dropdown_selected();
                }else{
                    limit_char(this);
                    $(this).removeClass("dropdown_selected");
                    check_dropdown_selected();
                }
                $('#form_name').val($('#memberLastName_add').val()+$('#memberFirstName_add').val());
                $('#add_member_form_first_name').val($('#memberFirstName_add').val());
                $('#add_member_form_last_name').val($('#memberLastName_add').val());
                $('#add_member_form_name').val($('#memberLastName_add').val()+$('#memberFirstName_add').val());
            }
        });
    }else{
        $("#memberLastName_add, #memberFirstName_add").keyup(function(){  //이름 입력시 하단에 핑크선
            if($(this).val().length>=1){
                limit_char(this);
                $(this).addClass("dropdown_selected");
                check_dropdown_selected();
            }else{
                limit_char(this);
                $(this).removeClass("dropdown_selected");
                check_dropdown_selected();
            }
            $('#form_name').val($('#memberLastName_add').val()+$('#memberFirstName_add').val());
            $('#add_member_form_first_name').val($('#memberFirstName_add').val());
            $('#add_member_form_last_name').val($('#memberLastName_add').val());
            $('#add_member_form_name').val($('#memberLastName_add').val()+$('#memberFirstName_add').val());
        });
    }



    $(document).on('click','#memberSex .selectboxopt',function(){
        if($('#memberSearchButton').attr('data-type') == "searched"){

        }else{
            $(this).addClass('selectbox_checked');
            $(this).siblings().removeClass('selectbox_checked');
            $('#form_sex').attr('value',$(this).attr('value'));
            check_dropdown_selected();
        }
    });

    $(document).on('click','#memberSex_info .selectboxopt',function(){
        if($('#upbutton-modify').attr('data-type') == "modify"){
            $(this).addClass('selectbox_checked');
            $(this).siblings().removeClass('selectbox_checked');
            $('#form_sex_modify').attr('value',$(this).attr('value'));
        }else{

        }
    });

    $("#memberPhone_add").keyup(function(){  //전화번호 입력시 하단에 핑크선
        if($(this).val().length>8){
            limit_char(this);
            $(this).addClass("dropdown_selected");
            check_dropdown_selected();
        }else{
            limit_char(this);
            $(this).removeClass("dropdown_selected");
            check_dropdown_selected();
        }
        // $('#id_username').val($('#memberPhone_add').val());
        // $('#id_user_id').val($('#memberPhone_add').val());
    });

    $("#memberCount_add").keyup(function(){  //남은횟수 입력시 하단에 핑크선
        if($(this).val().length>0){
            limit_char(this);
            $(this).addClass("dropdown_selected");
            check_dropdown_selected();
        }else{
            limit_char(this);
            $(this).removeClass("dropdown_selected");
            check_dropdown_selected();
        }
    });


    //빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////
    $('.btnCallSimple').click(function(){
        $(this).parent('div').siblings('.manualReg').hide()
        $(this).parent('div').siblings('.simpleReg').fadeIn('fast');
        $(this).addClass('selectbox_checked');
        $(this).siblings('.btnCallManual').removeClass('selectbox_checked');
        $('p, .datepicktext input').removeClass("dropdown_selected");
        $('#memberCount_add_fast').removeClass('dropdown_selected');
        $('#datepicker_add,#datepicker2_add,#memberCount_add,#lecturePrice_add_2').val("");
        $('#fast_check').val('0');
        if($('._ADD_GROUPMEMBER_NEW').css('display') == 'none'){
            $('#form_member_groupid').val($('#simpleReg select.grouptypeselect').val())
        }
        check_dropdown_selected();
    });

    $('.btnCallManual').click(function(){
        $(this).parent('div').siblings('.simpleReg').hide()
        $(this).parent('div').siblings('.manualReg').fadeIn('fast');
        $(this).addClass('selectbox_checked');
        $(this).siblings('.btnCallSimple').removeClass('selectbox_checked');
        $('._due div.checked').removeClass('checked ptersCheckboxInner');
        $('._count div.checked').removeClass('checked ptersCheckboxInner');
        $('p, .datepicktext input').removeClass("dropdown_selected");
        $('#datepicker_fast,#lecturePrice_add,#memberDue_add_2').val("");
        $("#datepicker2_add").datepicker('option','minDate',$("#datepicker_add").val());
        $("#datepicker_add").datepicker('option','maxDate',$("#datepicker2_add").val());
        $('#fast_check').val('1');
        if($('._ADD_GROUPMEMBER_NEW').css('display') == 'none'){
            $('#form_member_groupid').val($('#manualReg select.grouptypeselect').val())
        }
        check_dropdown_selected();
    });

    //진행기간(빠른입력방식) 선택
    $('._due .ptersCheckbox').parent('td').click(function(){
        $('._due div.checked').removeClass('checked ptersCheckboxInner');
        var pterscheckbox = $(this).find('div');
        $(this).find('div:nth-child(1)').addClass('checked');
        pterscheckbox.find('div').addClass('ptersCheckboxInner');
        if($("#datepicker_fast").val()!=""){
            autoDateInput();
        }
    });

    //등록횟수(빠른입력방식) 선택
    $('._count .ptersCheckbox').parent('td').click(function(){
        $('._count div.checked').removeClass('checked ptersCheckboxInner');
        var pterscheckbox = $(this).find('div');
        $(this).find('div:nth-child(1)').addClass('checked');
        pterscheckbox.find('div').addClass('ptersCheckboxInner');
        $('#memberCount_add_fast').val(pterscheckbox.attr('data-count'));
        $('#memberCount_add_fast').addClass("dropdown_selected");
        check_dropdown_selected();
    });

    //등록유형 선택
    $('.grouptypeselect').change(function(){
        $('#form_member_groupid').val($(this).val())
    })
    //빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////

    //회원 등록 폼 작성후 완료버튼 클릭
    $("#upbutton-check, #pcBtn").click(function(e){
        e.preventDefault()
        //회원 추가, 재등록
        if($('#page_addmember').css('display')=='block' && $('._ADD_GROUP_NEW').css('display') == "none" && $('._ADD_GROUPMEMBER_NEW').css('display') == "none"){
            var id_search_confirm = $('#id_search_confirm').val();
            if(select_all_check==true){
                if(id_search_confirm==0){ //신규 회원을 직접 정보를 입력했을 때
                    add_member_form_noemail_func()
                }else{                    //회원을 PTERS에서 검색했을 때

                    add_member_form_func();
                }
            }else{
                scrollToDom($('#page_addmember'));
                //$('#errorMessageBar').show();
                //$('#errorMessageText').text('모든 필수 정보를 입력해주세요')
                //입력값 확인 메시지 출력 가능
            }

            //그룹 추가
        }else if($('#page_addmember').css('display')=='block' && $('._ADD_GROUP_NEW').css('display') == "block"){
            if(select_all_check==true){
                add_group_form_func()
            }

            //그룹원 추가
        }else if($('#page_addmember').css('display')=='block' && $('._ADD_GROUPMEMBER_NEW').css('display') == "block"){
            if(select_all_check==true){
                add_groupmember_form_func()
            }
        }


    });

    //PC 회원기본 정보 수정 버튼 (회원정보창에서)
    $(document).on('click','button._info_baseedit',function(){
        if($(this).attr('data-view') == 'view'){
            $(this).attr('data-view','edit')
            $(this).find('img').attr('src','/static/user/res/btn-pt-complete.png')
            $('#memberPhone_info_PC, #memberBirth_select_wrap select, #memberName_info_PC, #memberName_info_lastName_PC, #memberName_info_firstName_PC').addClass('input_available').attr('disabled',false);
            $('#memberSex_info_PC .selectboxopt').show()
            $('#memberSex_info_PC .selectboxopt[value="'+$('#form_sex_modify').val()+'"]').addClass('selectbox_checked')

            $('#memberName_info_PC').hide()
            $('#memberName_info_lastName_PC, #memberName_info_firstName_PC').show()


        }else if($(this).attr('data-view') == 'edit'){
            $(this).attr('data-view','view')
            $(this).find('img').attr('src','/static/user/res/icon-pencil.png')
            $('#memberPhone_info_PC, #memberBirth_select_wrap select, #memberName_info_PC, #memberName_info_lastName_PC, #memberName_info_firstName_PC').removeClass('input_available').attr('disabled',true);
            $('#memberSex_info_PC .selectboxopt').hide()
            $('#memberSex_info_PC .selectbox_checked').show().removeClass('selectbox_checked')

            $('#memberName_info_PC').show().val($('#memberName_info_lastName_PC').val()+$('#memberName_info_firstName_PC').val())
            $('#memberName_info_lastName_PC, #memberName_info_firstName_PC').hide()

            send_modified_member_base_data()
        }
    })

    $('#upbutton-modify').click(function(){ //모바일 회원정보창에서 수정 눌렀을때
        if(Options.language == "KOR"){
            var text = '회원 정보 수정'
            var text2 = '모든 필수 정보를 입력해주세요'
        }else if(Options.language == "JPN"){
            var text = 'メンバー情報変更'
            var text2 = '全ての必修情報を入力してください。'
        }else if(Options.language == "ENG"){
            var text = 'Edit Member Info'
            var text2 = 'Please fill all input field'
        }
        if($(this).attr('data-type') == "view" ){
            $('#uptext3').text(text);
            $('#uptext-pc-modify').text(text);
            $(this).find('img').attr('src','/static/user/res/ptadd/btn-complete-checked.png');
            $('#upbutton-modify').attr('data-type','modify');
            $(this).attr('data-type','modify');

            $('#memberName_info').hide()
            $('#memberName_info_lastName, #memberName_info_firstName').show()

            $('#form_sex_modify').val()
            $('#form_birth_modify').val()
            $('#form_name_modify').val()
            $('#form_id_modify').val($('#memberId').val())

            $('#mobile_basic_info #memberName_info, #mobile_basic_info #memberPhone_info, #mobile_basic_info select, #memberName_info_lastName, #memberName_info_firstName').attr('disabled',false).addClass('input_available')
            $('#memberInfoPopup button._info_delete').hide()

        }else if($(this).attr('data-type') == "modify" ){
            if(select_all_check==false){
                send_modified_member_base_data()
                $('#memberName_info').show().val($('#memberName_info_lastName').val()+$('#memberName_info_firstName').val())
                $('#memberName_info_lastName, #memberName_info_firstName').hide()

            }else{
                scrollToDom($('#memberInfoPopup'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(text2);
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

function send_modified_member_base_data(){
    var $form = $('#member-add-form-modify');
    $.ajax({
        url:'/trainer/update_member_info/',
        type:'POST',
        data:$form.serialize(),
        dataType : 'html',

        beforeSend:function(){
            // $('html').css("cursor","wait");
            $('#upbutton-modify img').attr('src','/static/user/res/ajax/loading.gif');
        },

        //보내기후 팝업창 닫기
        complete:function(){

        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data)
            if(jsondata.messageArray.length>0){
                ////$('html').css("cursor","auto");
                $('#upbutton-modify img').attr('src','/static/user/res/icon-pencil.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }
            else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if($('body').width()<600){
                    closePopup('member_info');
                    $('#page_managemember').show();
                }
                ////$('html').css("cursor","auto");
                $('#upbutton-modify img').attr('src','/static/user/res/ptadd/icon-pencil.png');
                get_member_ing_list("callback",function(jsondata){
                    memberListSet('current','date','yes',jsondata);
                })
                get_member_end_list("callback",function(jsondata){
                    memberListSet('finished','date','yes',jsondata);
                })
                $('#startR').attr('selected','selected');
                console.log('success');

                if($('._calmonth').length == 1 || $('._calweek').length == 1){
                    ajaxClassTime()
                }
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        },
    })
}


function float_btn_managemember(option){
    if(Options.language == "KOR"){
        var text = '신규 회원 등록'
    }else if(Options.language == "JPN"){
        var text = '新規会員登録'
    }else if(Options.language == "ENG"){
        var text = 'Register New Member'
    }
    if(option == 0){ //모바일 플로팅 버튼
        //$("#float_btn").animate({opacity:'1'});
        if($('#mshade').css('display')=='none'){
            $('#float_inner1').animate({'opacity':'1','bottom':'85px'},120);
            $('#float_inner2').animate({'opacity':'1','bottom':'145px'},120);
            $('#float_btn').addClass('rotate_btn');
            shade_index(100)
        }else{
            $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
            $('#float_btn').removeClass('rotate_btn');
            shade_index(-100)
        }
    }else if(option == 1){ //모바일 플로팅 버튼 신규회원 추가
        initialize_add_member_sheet()
        get_group_ing_list('callback', function(json){grouptype_dropdown_set(json)})
        $('#page_addmember').show();
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').hide();
        $('#uptext2').text(text);

        scrollToDom($('#page_addmember'));
        if($('body').width()<600){
            $('#page_managemember').hide();
            $('#page-base').hide();
            $('#page-base-addstyle').show();
            shade_index(100);
        }

        $('#memberBirthDate, #memberBirthDate_info').html('');
        birth_dropdown_set();

        $('#memberSearchButton').attr('data-type','');
        $('#memberSex .selectboxopt').removeClass('selectbox_disable');
        if($('._nomember').length>0){
            $('#how_to_add_member').show()
        }else{
            $('#how_to_add_member').css('display','none')
        }
        $('._ADD_MEMBER_NEW, ._SEARCH_MEMBER_NEW, ._ADD_MEMBER_REG').show();
        $('._ADD_GROUP_NEW, ._ADD_GROUPMEMBER_NEW').hide();
    }else if(option == "group"){
        initialize_add_member_sheet();
        $('#page_addmember').show();
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').hide();

        scrollToDom($('#page_addmember'));
        if(bodywidth<600){
            $('#page_managemember').hide();
            $('#page-base').hide();
            $('#page-base-addstyle').show();
        }

        $('#grouptype').hide()
        $('#explain_group_lesson').show()
        $('#explain_open_lesson').hide()

        $('#grouptype option[value="NORMAL"]').attr({'selected':true,'disabled':true})
        $('#form_grouptype').val('NORMAL')
        $('#addgrouptypename').text('신규 그룹')

        $('#uptext2, #uptext2_PC').text('신규 그룹 추가');

        $('._ADD_MEMBER_NEW, ._ADD_MEMBER_REG ,._SEARCH_MEMBER_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        //$('._ADD_GROUPMEMBER_NEW').show()
        $('._ADD_GROUP_NEW').show();
        shade_index(100);
    }else if(option == "openlesson"){
        initialize_add_member_sheet();
        $('#page_addmember').show();
        $('#shade').hide();
        $('#shade3').show();
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').hide();

        scrollToDom($('#page_addmember'));
        if(bodywidth<600){
            $('#page_managemember').hide();
            $('#page-base').hide();
            $('#page-base-addstyle').show();
        }

        $('#grouptype').hide()
        $('#explain_open_lesson').show()
        $('#explain_group_lesson').hide()
        $('#grouptype option[value="EMPTY"]').attr({'selected':true,'disabled':true})
        $('#form_grouptype').val('EMPTY')
        $('#addgrouptypename').text('신규 클래스')

        $('#uptext2, #uptext2_PC').text('신규 클래스 추가');

        $('._ADD_MEMBER_NEW, ._ADD_MEMBER_REG ,._SEARCH_MEMBER_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('._ADD_GROUP_NEW').show();
        shade_index(100);
    }else if(option == "groupmember"){
        initialize_add_member_sheet();
        $('#page_addmember').show();
        $('#shade').hide();
        $('#shade3').show();
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').hide();

        scrollToDom($('#page_addmember'));
        if($('body').width()<600){
            $('#page_managemember').hide();
            $('#page-base').hide();
            $('#page-base-addstyle').show();
        }

        $('._ADD_MEMBER_NEW, ._SEARCH_MEMBER_NEW, ._ADD_GROUP_NEW').hide();
        $('._ADD_GROUPMEMBER_NEW, ._ADD_MEMBER_REG').show();
    }
}

//PC버전 회원추가 버튼

function pc_add_member(option){
    if(Options.language == "KOR"){
        var text = '신규 회원 등록'
        var text2 = '회원 재등록'
    }else if(Options.language == "JPN"){
        var text = '新規会員登録'
        var text2 = '再登録'
    }else if(Options.language == "ENG"){
        var text = 'New Contract'
        var text2 = 'Re-Contract'
    }

    var window_height = $(window).height();
    var selector_page_addmember = $('#page_addmember');
    var selector_memberSearchButton = $('#memberSearchButton');
    var selector_page_addmember_input_wrap = $('#page_addmember_input_wrap');
    var title_height = 47//$('#addpopup_pc_label_new').height();
    var buttonwrap_height = 55//$('#page_addmember .member_info_PC_buttons_wrap').height();

    var userID;
    if(option == 0){ //PC버전에서 회원추가 버튼 누름
        /*
        initialize_add_member_sheet();
        $('#uptext2, #uptext2_PC').text(text);

        $('._ADD_MEMBER_NEW, ._SEARCH_MEMBER_NEW, ._ADD_MEMBER_REG').show();
        $('._ADD_GROUP_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('#memberBirthDate, #memberBirthDate_info').html('');
        birth_dropdown_set();

        selector_memberSearchButton.attr('data-type','');
        $('#memberSex .selectboxopt').removeClass('selectbox_disable');
        if($('._nomember').length>0){
            $('#how_to_add_member').show();
        }else{
            $('#how_to_add_member').css('display','none');
        }

        var centerLoc = (($(window).height()-selector_page_addmember.outerHeight())/2+$(window).scrollTop());
        if( selector_page_addmember.height() > $(window).height() ){
            centerLoc = '70px';
        }

        selector_page_addmember.show().css({'top':centerLoc,
            'left':(($(window).width()-selector_page_addmember.outerWidth())/2+$(window).scrollLeft())});

        get_group_ing_list('callback', function(json){grouptype_dropdown_set(json)});
        */

        initialize_add_member_sheet();
        $('#uptext2, #uptext2_PC').text(text);

        $('._ADD_MEMBER_NEW, ._SEARCH_MEMBER_NEW, ._ADD_MEMBER_REG').show();
        $('._ADD_GROUP_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('#memberBirthDate, #memberBirthDate_info').html('');
        birth_dropdown_set();

        selector_memberSearchButton.attr('data-type','');
        $('#memberSex .selectboxopt').removeClass('selectbox_disable');
        if($('._nomember').length>0){
            $('#how_to_add_member').show();
        }else{
            $('#how_to_add_member').css('display','none');
        }

        $('body').css('overflow-y','hidden');
        selector_page_addmember_input_wrap.css('height',window_height - 100 - title_height - buttonwrap_height);
        var centerLoc = (($(window).height()-selector_page_addmember.outerHeight())/2+$(window).scrollTop());
        selector_page_addmember.show().css({'top':centerLoc,
                                            'left':(($(window).width()-selector_page_addmember.outerWidth())/2+$(window).scrollLeft()),
                                            });

        get_group_ing_list('callback', function(json){grouptype_dropdown_set(json)});
    }else if(option == 1){ //PC버전에서 연장추가 버튼 누름
        /*
        initialize_add_member_sheet();
        $('#uptext2, #uptext2_PC').text(text2);

        $('._ADD_MEMBER_NEW, ._ADD_GROUP_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('._SEARCH_MEMBER_NEW, ._ADD_MEMBER_REG').show();
        $('#memberBirthDate, #memberBirthDate_info').html('');
        birth_dropdown_set();

        selector_memberSearchButton.attr('data-type','');
        $('#memberSex .selectboxopt').removeClass('selectbox_disable');

        var centerLoc = (($(window).height()-selector_page_addmember.outerHeight())/2+$(window).scrollTop());
        if( selector_page_addmember.height() > $(window).height() ){
            centerLoc = '70px';
        }

        selector_page_addmember.show().css({'top':centerLoc,
            'left':(($(window).width()-selector_page_addmember.outerWidth())/2+$(window).scrollLeft())});

        get_group_ing_list('callback', function(json){grouptype_dropdown_set(json)});
        */
        initialize_add_member_sheet();
        $('#uptext2, #uptext2_PC').text(text2);

        $('._ADD_MEMBER_NEW, ._ADD_GROUP_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('._SEARCH_MEMBER_NEW, ._ADD_MEMBER_REG').show();
        $('#memberBirthDate, #memberBirthDate_info').html('');
        birth_dropdown_set();

        selector_memberSearchButton.attr('data-type','');
        $('#memberSex .selectboxopt').removeClass('selectbox_disable');

        $('body').css('overflow-y','hidden');
        selector_page_addmember_input_wrap.css('height',window_height - 100 - title_height - buttonwrap_height);
        var centerLoc = (($(window).height()-selector_page_addmember.outerHeight())/2+$(window).scrollTop());
        selector_page_addmember.show().css({'top':centerLoc,
            'left':(($(window).width()-selector_page_addmember.outerWidth())/2+$(window).scrollLeft())});

        get_group_ing_list('callback', function(json){grouptype_dropdown_set(json)});
    }else if(option == 2){ //PC 회원정보창에서 연장추가 버튼 누름
        initialize_add_member_sheet();
        $('#uptext2, #uptext2_PC').text(text2);

        $('._ADD_GROUP_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('._SEARCH_MEMBER_NEW, ._ADD_MEMBER_REG').show();
        $('#memberBirthDate, #memberBirthDate_info').html('');
        birth_dropdown_set();

        selector_memberSearchButton.attr('data-type','');
        $('#memberSex .selectboxopt').removeClass('selectbox_disable');
        /*회원정보창에서 수강추가를 했을때 회원검색란에 아이디를 넣어준다.*/
        if($('#memberInfoPopup_PC').css('display') == 'block'){
            userID = $('#memberId_info_PC').val();
            $('#memberSearch_add').val(userID);
        }
        /*회원정보창에서 수강추가를 했을때 회원검색란에 아이디를 넣어준다.*/

        /*회원정보창에서 수강추가를 했을때 가장마지막 종료일을 시작일로 셋팅해준다.*/
        var regEnddate = [];
        $('.lec_end_date').each(function(index){
            regEnddate.push($(this).val().replace(/\./gi,'-'))
        })

        $('#datepicker_fast').datepicker('setDate',find_max_date(regEnddate)).addClass("dropdown_selected");
        $('#datepicker_add').datepicker('setDate',find_max_date(regEnddate)).addClass("dropdown_selected");
        $('#datepicker2_add').datepicker('option','minDate',find_max_date(regEnddate));

        check_dropdown_selected();
        /*회원정보창에서 수강추가를 했을때 가장마지막 종료일을 시작일로 셋팅해준다.*/

        selector_memberSearchButton.trigger('click');

        $('body').css('overflow-y','hidden');
        selector_page_addmember_input_wrap.css('height',window_height - 100 - title_height - buttonwrap_height);
        selector_page_addmember.show().css({'top':(($(window).height()-selector_page_addmember.outerHeight())/2+$(window).scrollTop()),
            'left':(($(window).width()-selector_page_addmember.outerWidth())/2+$(window).scrollLeft())});

        get_group_ing_list('callback', function(json){grouptype_dropdown_set(json)});

    }else if(option == 3){ //모바일 회원정보창에서 연장추가 버튼 누름
        float_btn_managemember(1);
        /*회원정보창에서 수강추가를 했을때 회원검색란에 아이디를 넣어준다.*/
        $('#uptext2').text(text2);
        if($('#memberInfoPopup').css('display') == 'block'){
            userID = $('#memberId').val();
            $('#memberSearch_add').val(userID);
        }
        /*회원정보창에서 수강추가를 했을때 회원검색란에 아이디를 넣어준다.*/

        /*회원정보창에서 수강추가를 했을때 가장마지막 종료일을 시작일로 셋팅해준다.*/
        var regEnddate = [];
        $('.wraps .lec_end_date').each(function(index){
            regEnddate.push($(this).val().replace(/\./gi,'-'))
        });
        $('#datepicker_fast').datepicker('setDate',find_max_date(regEnddate)).addClass("dropdown_selected");
        $('#datepicker_add').datepicker('setDate',find_max_date(regEnddate)).addClass("dropdown_selected");
        $('#datepicker2_add').datepicker('option','minDate',find_max_date(regEnddate));

        check_dropdown_selected();
        /*회원정보창에서 수강추가를 했을때 가장마지막 종료일을 시작일로 셋팅해준다.*/

        
        closePopup('member_info');
        $('#page_managemember').css({'height':'0','overflow-y':'hidden'});
        
        $('._ADD_MEMBER_NEW, ._ADD_GROUP_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('._SEARCH_MEMBER_NEW, ._ADD_MEMBER_REG').show();
        $('#memberBirthDate, #memberBirthDate_info').html('');

        birth_dropdown_set();
        selector_memberSearchButton.attr('data-type','');
        $('#memberSex .selectboxopt').removeClass('selectbox_disable');

        get_group_ing_list('callback', function(json){grouptype_dropdown_set(json)});
        selector_memberSearchButton.trigger('click');

    }else if(option == 'group'){
        initialize_add_member_sheet();

        $('#grouptype').hide()
        $('#explain_group_lesson').show()
        $('#explain_open_lesson').hide()
        $('#grouptype option[value="NORMAL"]').attr({'selected':true,'disabled':true})
        $('#form_grouptype').val('NORMAL')
        $('#addgrouptypename').text('신규 고정 클래스')

        $('#uptext2, #uptext2_PC').text('신규 고정 클래스 추가');

        $('._ADD_MEMBER_NEW, ._ADD_MEMBER_REG ,._SEARCH_MEMBER_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('._ADD_GROUP_NEW').show();

        $('body').css('overflow-y','hidden');
        $('#page_addmember').show().css({'top':(($(window).height()-$('#page_addmember').outerHeight())/2+$(window).scrollTop()),
            'left':(($(window).width()-$('#page_addmember').outerWidth())/2+$(window).scrollLeft())})

    }else if(option == 'openlesson'){
        initialize_add_member_sheet();

        $('#grouptype').hide()
        $('#explain_open_lesson').show()
        $('#explain_group_lesson').hide()
        $('#grouptype option[value="EMPTY"]').attr({'selected':true,'disabled':true})
        $('#form_grouptype').val('EMPTY')
        $('#addgrouptypename').text('신규 클래스')

        $('#uptext2, #uptext2_PC').text('신규 클래스 추가');

        $('._ADD_MEMBER_NEW, ._ADD_MEMBER_REG ,._SEARCH_MEMBER_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('._ADD_GROUP_NEW').show();

        $('body').css('overflow-y','hidden');
        $('#page_addmember').show().css({'top':(($(window).height()-$('#page_addmember').outerHeight())/2+$(window).scrollTop()),
            'left':(($(window).width()-$('#page_addmember').outerWidth())/2+$(window).scrollLeft())})

    }else if(option == 'groupmember'){
        initialize_add_member_sheet();

        $('._ADD_MEMBER_NEW, ._SEARCH_MEMBER_NEW, ._ADD_GROUP_NEW').hide();
        $('._ADD_GROUPMEMBER_NEW, ._ADD_MEMBER_REG').show();

        $('body').css('overflow-y','hidden');
        selector_page_addmember_input_wrap.css('height',window_height - 100 - title_height - buttonwrap_height);
        $('#page_addmember').show().css({'top':(($(window).height()-$('#page_addmember').outerHeight())/2+$(window).scrollTop()),
            'left':(($(window).width()-$('#page_addmember').outerWidth())/2+$(window).scrollLeft())})
    }
    shade_index(300);
}


//진행중 회원, 종료된 회원 리스트 스왑
function shiftMemberList(type){
    switch(type){
        case "current":
            get_group_ing_list()
            $('#currentGroupList, #memberNumber_current_group').css('display','block');
            $('#memberNumber_finish_group, #finishedGroupList, #finishGroupNum').css('display','none')
            $('._GROUP_THEAD, ._groupaddbutton').show()
            $('._MEMBER_THEAD, ._memberaddbutton, ._ALIGN_DROPDOWN').hide()
            break;
        case "finished":
            get_group_end_list()
            $('#finishedGroupList, #memberNumber_finish_group').css('display','block');
            $('#memberNumber_current_group, #currentGroupList, #currentGroupNum').css('display','none')
            $('._GROUP_THEAD, ._groupaddbutton').show()
            $('._MEMBER_THEAD, ._memberaddbutton, ._ALIGN_DROPDOWN').hide()
            break;
    }
}


//간편 가격입력
function priceInput(price, type, selector){
    if(selector == 2){
        var select = '_2';
        var loc = "_fast";
    }else if(selector == 1){
        var select = '';
        var loc = '';
    }
    if(type == "sum"){
        var priceInputValue = $('#lecturePrice_add'+select).val().replace(/,/g, "");
        var priceInputValue = price + Number(priceInputValue);
        $('#lecturePrice_add'+select).val(numberWithCommas(priceInputValue)).attr('readonly',true);
        $('#lecturePrice_add_value'+loc).val(priceInputValue);
    }else if(type == "del"){
        $('#lecturePrice_add'+select).val("").attr('readonly',false);
        $('#lecturePrice_add_value'+loc).val(0);
    }
    check_dropdown_selected()
}
//수동 가격입력
$('#lecturePrice_add, #lecturePrice_add_2').keyup(function(){
    var priceInputValue = $(this).val().replace(/,/g, "");
    $(this).val(numberWithCommas(priceInputValue));
    $('#lecturePrice_add_value, #lecturePrice_add_value_fast').val(priceInputValue);
    check_dropdown_selected()
});




//생일입력 드랍다운
function birth_dropdown_set(){
    if(Options.language == "KOR"){
        var text = '연도'
        var text2 = '년'
        var text3 = '월'
        var text4 = '일'
    }else if(Options.language == "JPN"){
        var text = '年'
        var text2 = '年'
        var text3 = '月'
        var text4 = '日'
    }else if(Options.language == "ENG"){
        var text = 'Birth'
        var text2 = '.'
        var text3 = '.'
        var text4 = ''
    }
    var yearoption = ['<option selected disabled hidden>'+text+'</option>'];
    for(var i=2018; i>=1908; i--){
        yearoption.push('<option data-year="'+i+text2+'">'+i+text2+'</option>');
    }
    var birth_year_options = yearoption.join('');
    $('#birth_year, #birth_year_info, #memberBirth_Year_info_PC').html(birth_year_options);


    var monthoption = ['<option selected disabled hidden>'+text3+'</option>'];
    for(var i=1; i<=12; i++){
        monthoption.push('<option data-month="'+i+text3+'">'+i+text3+'</option>');
    }
    var birth_month_options = monthoption.join('');
    $('#birth_month, #birth_month_info, #memberBirth_Month_info_PC').html(birth_month_options);


    var dateoption = ['<option selected disabled hidden>'+text4+'</option>'];
    for(var i=1; i<=31; i++){
        dateoption.push('<option data-date="'+i+text4+'">'+i+text4+'</option>');
    }
    var birth_date_options = dateoption.join('');
    $('#birth_date, #birth_date_info, #memberBirth_Date_info_PC').html(birth_date_options);


    $('#birth_month, #birth_month_info').change(function(){
        var dateoption = ['<option selected disabled hidden>'+text4+'</option>'];
        $('#birth_date, #birth_date_info').html("");
        var lastDay = [31,29,31,30,31,30,31,31,30,31,30,31];
        var month = $(this).val().replace(/월|月|\\./gi,"");
        for(var i=1; i<=lastDay[month-1]; i++){
            dateoption.push('<option data-date="'+i+text4+'">'+i+text4+'</option>');
        }
        var birth_date_options = dateoption.join('');
        $('#birth_date, #birth_date_info').html(birth_date_options);
    });

    $('#birth_year, #birth_month, #birth_date').change(function(){
        $(this).addClass("dropdown_selected");
        $(this).css('color','#282828');
        var year = $('#birth_year').val().replace(/년|\\.|年/gi,"");
        var month = $('#birth_month').val().replace(/월|\\.|月/gi,"");
        var date = $('#birth_date').val().replace(/일|日/gi,"");
        var birthdata = year+'-'+month+'-'+date;
        $('#form_birth').attr('value',birthdata);
    });

    /*
     $('#birth_year_info, #birth_month_info, #birth_date_info').change(function(){
     $(this).addClass("dropdown_selected");
     $(this).css('color','#282828');
     var year = $('#birth_year_info').val().replace(/년|\\.|年/gi,"");
     var month = $('#birth_month_info').val().replace(/월|\\.|月/gi,"");
     var date = $('#birth_date_info').val().replace(/일|日/gi,"");
     var birthdata = year+'-'+month+'-'+date;
     $('#form_birth_modify').attr('value',birthdata);
     });
     */
}

//등록유형 드랍다운
function grouptype_dropdown_set(grouplistJSON){
    var len = grouplistJSON.group_id.length;

    var optionsToJoin = ['<option value="">1:1 레슨</option>']
    for(var i=0; i<len; i++){
        optionsToJoin.push('<option value="'+grouplistJSON.group_id[i]+'">['+grouplistJSON.group_type_cd_nm[i]+'] '+grouplistJSON.name[i]+'</option>')
    }
    $('.grouptypeselect').html(optionsToJoin.join(''))
}


//DB데이터를 memberListSet에서 사용가능하도록 가공
function DataFormatting(jsondata){

    var countListResult = [];
    var nameListResult = [];
    var dateListResult = [];

    var nameInfoArray = jsondata.name;
    var dbIdInfoArray = jsondata.db_id;
    var idInfoArray = jsondata.member_id;
    var groupTypeArray = jsondata.groupInfoArray;
    var emailInfoArray = jsondata.email;
    var startDateArray = jsondata.start_date;
    var endDateArray = jsondata.end_date;
    var remainCountArray = jsondata.rem_count;
    var regCountInfoArray = jsondata.reg_count;
    var phoneInfoArray = jsondata.phone;
    var contentInfoArray = jsondata.note;
    var npCountInfoArray = jsondata.npLectureCountsArray;
    var rjCountInfoArray = jsondata.rjLectureCountsArray;
    var yetRegCountInfoArray = jsondata.yetRegCountArray;
    var yetCountInfoArray = jsondata.yetCountArray;
    var len = jsondata.db_id.length;



    for(i=0; i<len; i++){
        var date    = date_format_to_yyyymmdd(startDateArray[i],'');
        var enddate = date_format_to_yyyymmdd(endDateArray[i],'');
        //날짜형식을 yyyymmdd 로 맞추기

        var countOri = remainCountArray[i];
        var countFix = count_format_to_nnnn(remainCountArray[i]);

        var regcountOri = regCountInfoArray[i];
        var regcountFix = count_format_to_nnnn(regCountInfoArray[i]);

        countListResult[i]=countFix+'/'+regcountFix+'/'+nameInfoArray[i]+'/'+idInfoArray[i]+'/'+phoneInfoArray[i]+'/'+contentInfoArray[i]+'/'+date+'/'+enddate+'/'+emailInfoArray[i]+'/'+npCountInfoArray[i]+'/'+rjCountInfoArray[i]+'/'+yetRegCountInfoArray[i]+'/'+yetCountInfoArray[i]+'/'+dbIdInfoArray[i]+'/'+groupTypeArray[i];
        nameListResult[i]=nameInfoArray[i]+'/'+idInfoArray[i]+'/'+phoneInfoArray[i]+'/'+contentInfoArray[i]+'/'+countOri+'/'+regcountOri+'/'+date+'/'+enddate+'/'+emailInfoArray[i]+'/'+npCountInfoArray[i]+'/'+rjCountInfoArray[i]+'/'+yetRegCountInfoArray[i]+'/'+yetCountInfoArray[i]+'/'+dbIdInfoArray[i]+'/'+groupTypeArray[i];
        dateListResult[i]=date+'/'+nameInfoArray[i]+'/'+idInfoArray[i]+'/'+phoneInfoArray[i]+'/'+contentInfoArray[i]+'/'+countOri+'/'+regcountOri+'/'+enddate+'/'+emailInfoArray[i]+'/'+npCountInfoArray[i]+'/'+rjCountInfoArray[i]+'/'+yetRegCountInfoArray[i]+'/'+yetCountInfoArray[i]+'/'+dbIdInfoArray[i]+'/'+groupTypeArray[i];
    }

    return {"countSorted":countListResult, "nameSorted":nameListResult, "dateSorted":dateListResult}
}

//DB데이터를 사전형태로 만드는 함수
function DataFormattingDict(Option, jsondata){
    if(Options.language == "KOR"){
        var text = '진행중 : '
        var text2 = '종료 : '
        var text3 = '명'
    }else if(Options.language == "JPN"){
        var text = '進行中 : '
        var text2 = '終了 : '
        var text3 = '名'
    }else if(Options.language == "ENG"){
        var text = 'Ongoing : '
        var text2 = 'Finished : '
        var text3 = 'Person'
    }
    switch(Option){
        case 'name':
            var DBlength = jsondata.nameArray.length;
            for(var i=0; i<DBlength;i++){
                DB[jsondata.nameArray[i]] = {'id':jsondata.idArray[i],
                    'dbId':jsondata.dIdArray[i],
                    'email':jsondata.emailArray[i],
                    'count':jsondata.countArray[i],
                    'regcount':jsondata.regCountArray[i],
                    'availCount':jsondata.availCountArray[i],
                    'phone':jsondata.phoneArray[i],
                    'contents':jsondata.contentsArray[i],
                    'start':jsondata.startArray[i],
                    'end':jsondata.endArray[i],
                    'birth':jsondata.birthdayArray[i],
                    'sex':jsondata.sexArray[i],
                    'npCount':jsondata.npLectureCountsArray[i],
                    'rjCount':jsondata.rjLectureCountsArray[i],
                    'yetRegCount':jsondata.yetRegCountArray[i],
                    'yetCount':jsondata.yetCountArray[i],
                    'activation':jsondata.activationArray[i],
                    'firstName':jsondata.firstNameArray[i],
                    'lastName':jsondata.lastNameArray[i],
                    'groupType':jsondata.groupInfoArray[i]
                };
            }
            var DBendlength = finishnameArray.length;
            for(var j=0; j<DBendlength;j++){
                DBe[jsondata.finishnameArray[j]] = {'id':jsondata.finishIdArray[j],
                    'dbId':jsondata.finishDidArray[j],
                    'email':jsondata.finishemailArray[j],
                    'count':jsondata.finishcountArray[j],
                    'regcount':jsondata.finishRegCountArray[j],
                    'availCount':jsondata.finishAvailCountArray[j],
                    'phone':jsondata.finishphoneArray[j],
                    'contents':jsondata.finishContentsArray[j],
                    'start':jsondata.finishstartArray[j],
                    'end':jsondata.finishendArray[j],
                    'birth':jsondata.finishbirthdayArray[j],
                    'sex':jsondata.finishsexArray[j],
                    'activation':jsondata.activationArray[j],
                    'firstName':jsondata.finishFirstNameArray[j],
                    'lastName':jsondata.finishLastNameArray[j],
                    'groupType':jsondata.finishGroupInfoArray[j]
                };
            }
            $('#currentMemberNum').text(text+DBlength+text3);
            $('#finishMemberNum').text(text2+DBendlength+text3);
            break;

        case 'ID':
            var DBlength = jsondata.idArray.length;
            for(var i=0; i<DBlength;i++){
                DB[jsondata.idArray[i]] = {'id':jsondata.idArray[i],
                    'name':jsondata.nameArray[i],
                    'dbId':jsondata.dIdArray[i],
                    'email':jsondata.emailArray[i],
                    'count':jsondata.countArray[i],
                    'regcount':jsondata.regCountArray[i],
                    'availCount':jsondata.availCountArray[i],
                    'phone':jsondata.phoneArray[i],
                    'contents':jsondata.contentsArray[i],
                    'start':jsondata.startArray[i],
                    'end':jsondata.endArray[i],
                    'birth':jsondata.birthdayArray[i],
                    'sex':jsondata.sexArray[i],
                    'npCount':jsondata.npLectureCountsArray[i],
                    'rjCount':jsondata.rjLectureCountsArray[i],
                    'yetRegCount':jsondata.yetRegCountArray[i],
                    'yetCount':jsondata.yetCountArray[i],
                    'activation':jsondata.activationArray[i],
                    'firstName':jsondata.firstNameArray[i],
                    'lastName':jsondata.lastNameArray[i],
                    'groupType':jsondata.groupInfoArray[i]
                };
            }
            var DBendlength = jsondata.finishIdArray.length;
            for(var j=0; j<DBendlength;j++){
                DBe[jsondata.finishIdArray[j]] = {'id':jsondata.finishIdArray[i],
                    'name':jsondata.finishnameArray[j],
                    'dbId':jsondata.finishDidArray[j],
                    'email':jsondata.finishemailArray[j],
                    'count':jsondata.finishcountArray[j],
                    'regcount':jsondata.finishRegCountArray[j],
                    'availCount':jsondata.finishAvailCountArray[j],
                    'phone':jsondata.finishphoneArray[j],
                    'contents':jsondata.finishContentsArray[j],
                    'start':jsondata.finishstartArray[j],
                    'end':jsondata.finishendArray[j],
                    'birth':jsondata.finishbirthdayArray[j],
                    'sex':jsondata.finishsexArray[j],
                    'activation':jsondata.activationArray[j],
                    'firstName':jsondata.finishFirstNameArray[j],
                    'lastName':jsondata.finishLastNameArray[j],
                    'groupType':jsondata.finishGroupInfoArray[j]
                };
            }
            $('#currentMemberNum').text(text+DBlength+text3);
            $('#finishMemberNum').text(text2+DBendlength+text3);
            break;

        case 'DBID':
            var DBlength = jsondata.dIdArray.length;
            for(var i=0; i<DBlength;i++){
                DB[jsondata.dIdArray[i]] = {'id':jsondata.idArray[i],
                    'name':jsondata.nameArray[i],
                    'dbId':jsondata.dIdArray[i],
                    'email':jsondata.emailArray[i],
                    'count':jsondata.countArray[i],
                    'regcount':jsondata.regCountArray[i],
                    'availCount':jsondata.availCountArray[i],
                    'phone':jsondata.phoneArray[i],
                    'contents':jsondata.contentsArray[i],
                    'start':jsondata.startArray[i],
                    'end':jsondata.endArray[i],
                    'birth':jsondata.birthdayArray[i],
                    'sex':jsondata.sexArray[i],
                    'npCount':jsondata.npLectureCountsArray[i],
                    'rjCount':jsondata.rjLectureCountsArray[i],
                    'yetRegCount':jsondata.yetRegCountArray[i],
                    'yetCount':jsondata.yetCountArray[i],
                    'activation':jsondata.activationArray[i],
                    'firstName':jsondata.firstNameArray[i],
                    'lastName':jsondata.lastNameArray[i],
                    'groupType':jsondata.groupInfoArray[i]
                };
            }
            var DBendlength = jsondata.finishDidArray.length;
            for(var j=0; j<DBendlength;j++){
                DBe[jsondata.finishDidArray[j]] = {'id':jsondata.finishIdArray[i],
                    'name':jsondata.finishnameArray[j],
                    'dbId':jsondata.finishDidArray[j],
                    'email':jsondata.finishemailArray[j],
                    'count':jsondata.finishcountArray[j],
                    'regcount':jsondata.finishRegCountArray[j],
                    'availCount':jsondata.finishAvailCountArray[j],
                    'phone':jsondata.finishphoneArray[j],
                    'contents':jsondata.finishContentsArray[j],
                    'start':jsondata.finishstartArray[j],
                    'end':jsondata.finishendArray[j],
                    'birth':jsondata.finishbirthdayArray[j],
                    'sex':jsondata.finishsexArray[j],
                    'activation':jsondata.activationArray[j],
                    'firstName':jsondata.finishFirstNameArray[j],
                    'lastName':jsondata.finishLastNameArray[j],
                    'groupType':jsondata.finishGroupInfoArray[j]
                };
            }
            for(var i=0; i<DBlength;i++){
                DB_All[jsondata.dIdArray[i]] = {'id':jsondata.idArray[i],
                    'name':jsondata.nameArray[i],
                    'dbId':jsondata.dIdArray[i],
                    'email':jsondata.emailArray[i],
                    'count':jsondata.countArray[i],
                    'regcount':jsondata.regCountArray[i],
                    'availCount':jsondata.availCountArray[i],
                    'phone':jsondata.phoneArray[i],
                    'contents':jsondata.contentsArray[i],
                    'start':jsondata.startArray[i],
                    'end':jsondata.endArray[i],
                    'birth':jsondata.birthdayArray[i],
                    'sex':jsondata.sexArray[i],
                    'npCount':jsondata.npLectureCountsArray[i],
                    'rjCount':jsondata.rjLectureCountsArray[i],
                    'yetRegCount':jsondata.yetRegCountArray[i],
                    'yetCount':jsondata.yetCountArray[i],
                    'activation':jsondata.activationArray[i],
                    'firstName':jsondata.firstNameArray[i],
                    'lastName':jsondata.lastNameArray[i],
                    'groupType':jsondata.groupInfoArray[i]
                };
            }
            var DBendlength = jsondata.finishDidArray.length;
            for(var j=0; j<DBendlength;j++){
                DB_All[jsondata.finishDidArray[j]] = {'id':jsondata.finishIdArray[i],
                    'name':jsondata.finishnameArray[j],
                    'dbId':jsondata.finishDidArray[j],
                    'email':jsondata.finishemailArray[j],
                    'count':jsondata.finishcountArray[j],
                    'regcount':jsondata.finishRegCountArray[j],
                    'availCount':jsondata.finishAvailCountArray[j],
                    'phone':jsondata.finishphoneArray[j],
                    'contents':jsondata.finishContentsArray[j],
                    'start':jsondata.finishstartArray[j],
                    'end':jsondata.finishendArray[j],
                    'birth':jsondata.finishbirthdayArray[j],
                    'sex':jsondata.finishsexArray[j],
                    'activation':jsondata.activationArray[j],
                    'firstName':jsondata.finishFirstNameArray[j],
                    'lastName':jsondata.finishLastNameArray[j],
                    'groupType':jsondata.finishGroupInfoArray[j]
                };
            }
            $('#currentMemberNum').text(text+DBlength+text3);
            $('#finishMemberNum').text(text2+DBendlength+text3);
            break;
    }
}


//서버로부터 회원 목록 가져오기
var global_json;
function get_member_list(use, callback){
    //returnvalue 1이면 jsondata를 리턴
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_member_list/',

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
            global_json = jsondata;
            if(jsondata.messageArray.length>0){
                ////$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')

                if(use == "callback"){
                    callback(jsondata)

                }else{
                    //memberListSet('current','name','no',jsondata);
                    //memberListSet('finished','name','no',jsondata);
                }
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


function get_member_ing_list(use, callback){
    //returnvalue 1이면 jsondata를 리턴
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_member_ing_list/',

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
            global_json = jsondata;
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')

                if(use == "callback"){
                    callback(jsondata)

                }else{
                    memberListSet('current','name','no',jsondata);
                }
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

function get_member_end_list(use, callback){
    //returnvalue 1이면 jsondata를 리턴
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_member_end_list/',

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
            global_json = jsondata;
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')

                if(use == "callback"){
                    callback(jsondata)

                }else{
                    memberListSet('finished','name','no',jsondata);
                }
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


//회원목록을 테이블로 화면에 뿌리는 함수
function memberListSet (type,option,Reverse, jsondata){
    if(Options.language == "KOR"){
        var text = '소진시까지'
        var text2 = '이번달 신규회원'
    }else if(Options.language == "JPN"){
        var text = '残余回数終わるまで'
        var text2 = '今月新規メンバー'
    }else if(Options.language == "ENG"){
        var text = ''
        var text2 = 'New Member this month'
    }

    var tbodyStart = '<tbody>';
    var tbodyEnd = '</tbody>';
    var tbodyToAppend = $(tbodyStart);
    switch(type){
        case 'current':
            var data = DataFormatting(jsondata);
            var countList = data["countSorted"]
            var nameList = data["nameSorted"]
            var dateList = data["dateSorted"]
            var $table = $('#currentMember');
            var $tabletbody = $('#currentMember tbody');
            var $membernum = $('#memberNumber_current_member')
            var text_membernum = "진행중인 회원 "
            break;
        case 'finished':
            var data = DataFormatting(jsondata);
            var countList = data["countSorted"]
            var nameList = data["nameSorted"]
            var dateList = data["dateSorted"]
            var $table = $('#finishedMember');
            var $tabletbody = $('#finishedMember tbody');
            var $membernum = $('#memberNumber_finish_member')
            var text_membernum = "종료된 회원 "
            break;
    }

    if(Reverse == 'yes'){
        var countLists =countList.sort().reverse();
        var nameLists = nameList.sort().reverse();
        var dateLists = dateList.sort().reverse();
    }else{
        var countLists =countList.sort();
        var nameLists = nameList.sort();
        var dateLists = dateList.sort();
    }

    var len = countLists.length;
    var arrayResult = [];
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
            if(name.length105){
                var name = array[2].substr(0,9)+'..';
            }
            var npCounts = array[9];
            var rjCounts = array[10];
            var yetRegCounts = array[11];
            var yetCounts = array[12];
            var groupType = array[14];
            if(array[15]){
                var groupType2 = '/'+array[15];
            }else{
                var groupType2 = ''
            }
            if(array[16]){
                var groupType3 = '/'+array[16];
            }else{
                var groupType3 = ''
            }
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
            if(name.length>10){
                var name = array[0].substr(0,9)+'..'
            }
            var npCounts = array[9];
            var rjCounts = array[10];
            var yetRegCounts = array[11];
            var yetCounts = array[12];
            var groupType = array[14];
            if(array[15]){
                var groupType2 = '/'+array[15];
            }else{
                var groupType2 = ''
            }
            if(array[16]){
                var groupType3 = '/'+array[16];
            }else{
                var groupType3 = ''
            }
        }else if(option == "date"){
            var array = dateLists[i].split('/');
            var arrayforemail = dateLists[i].split('/');
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
            if(name.length>10){
                var name = array[1].substr(0,9)+'..';
            }
            var npCounts = array[9];
            var rjCounts = array[10];
            var yetRegCounts = array[11];
            var yetCounts = array[12];
            var groupType = array[14];
            if(array[15]){
                var groupType2 = '/'+array[15];
            }else{
                var groupType2 = ''
            }
            if(array[16]){
                var groupType3 = '/'+array[16];
            }else{
                var groupType3 = ''
            }
        }

        var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2);
        var end = ends.substr(0,4)+'.'+ends.substr(4,2)+'.'+ends.substr(6,2);
        if(end == "9999.12.31"){
            var end = text;
        }

        var newReg = ""
        if(starts.substr(0,4) == currentYear && Number(starts.substr(4,2)) == currentMonth+1){
            var newReg = '<img src="/static/user/res/icon-new.png" title="'+text2+'" class="newRegImg">';
        }


        if(phoneToEdit.substr(0,2)=="02"){
            var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4);
        }else{
            var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4);
        }

        var npCountImg = ""
        if(npCounts == 0 && rjCounts == 0){
            var npCountImg = '<img src="/static/user/res/icon-link.png" title="Connected" class="npCountImg_wait">';
        }else if(rjCounts > 0){
            var npCountImg = '<img src="/static/user/res/icon-alert.png" title="Disconnected" class="npCountImg_x">';
        }

        var yetReg = "";
        var yet = "";
        if(yetRegCounts > 0){
            var yetReg = '(+'+yetRegCounts+')';
        }
        if(yetCounts > 0){
            var yet = '(+'+yetCounts+')';
        }



        var count = remove_front_zeros(count);
        var regcount = remove_front_zeros(regcount);

        var phonenum = '<a class="phonenum" href="tel:'+phone+'">'+phone+'</a>';
        var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms">'+phonenum+'</a>';
        var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>';
        var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">';
        var pcdownloadimage = '<img src="/static/user/res/member/pters-download.png" class="pcmanageicon _info_download" title="엑셀 다운로드">';
        var pcprintimage = '<img src="/static/user/res/member/pters-print.png" class="pcmanageicon _info_print" title="프린트">';
        var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제">';
        var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="Edit">';
        var pcinfoimage = '<img src="/static/user/res/member/icon-info.png" class="pcmanageicon _info_view" title="Info">';

        var grouptypetd = '<td class="_grouptype" data-name="'+groupType+groupType2+groupType3+'">'+groupType+groupType2+groupType3+'</td>';
        var nametd = '<td class="_tdname" data-name="'+name+'">'+newReg+name+'</td>';
        var idtd = '<td class="_id" data-name="'+id+'" data-dbid="'+dbId+'">'+id+'</td>';
        var emailtd = '<td class="_email">'+email+'</td>';
        var regcounttd = '<td class="_regcount">'+regcount+yetReg+'</td>';
        var remaincounttd = '<td class="_remaincount">'+count+yet+'</td>';
        var startdatetd = '<td class="_startdate">'+start+'</td>';
        var enddatetd = '<td class="_finday">'+end+'</td>';
        var mobiletd = '<td class="_contact">'+phoneimage+smsimage+'</td>';
        var pctd = '<td class="_manage">'+pcinfoimage+pceditimage+pcdownloadimage+pcdeleteimage+'</td>';
        var scrolltd = '<td class="forscroll"></td>';

        var td = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+grouptypetd+idtd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+'</tr>';
        arrayResult[i] = td;
    }
    $membernum.html(text_membernum+'<span style="font-size:16px;">'+len+'</span>'+'명');


    var resultToAppend = arrayResult.join("");
    if(type=='current' && len == 0){
        var resultToAppend = '<td class="forscroll _nomember" rowspan="9" style="height:50px;padding-top: 17px !important;">등록 된 회원이 없습니다.</td>'
        if($('body').width()>600){
            $('#please_add_member_pc').show()
        }else{
            $('#please_add_member').show()
        }
    }else if(type=="finished" && len ==0){
        var resultToAppend = '<td class="forscroll" rowspan="9" style="height:50px;padding-top: 17px !important;">종료 된 회원이 없습니다.</td>'
    }
    var result = tbodyStart + resultToAppend + tbodyEnd;
    $tabletbody.remove();
    $table.append(result);
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
        $('#shade3').show('fast');
    }else{
        $('#shade').show('fast');
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
    var priceInput_detail = $('#lecturePrice_add').val()
    var priceInput_fast = $('#lecturePrice_add_2').val()
    //var sexInput = $('#form_sex').val();
    var sexInput = "임시";

    var countInput_fast = $("#memberCount_add_fast");
    var dateInput_fast = $("#datepicker_fast");

    var groupname = $('#groupname')
    var grouptype = $('#grouptype')
    var groupcapacity = $('#groupcapacity')


    var fast = $('#fast_check').val();

    //회원추가, 회원재등록 창일때
    if($('._ADD_GROUP_NEW').css('display')=="none" && $('._ADD_MEMBER_NEW').css('display')=="block"){
        if(fast=='1'){
            if((lastnameInput).hasClass("dropdown_selected")==true && (firstnameInput).hasClass("dropdown_selected")==true && (countInput).hasClass("dropdown_selected")==true && (priceInput_detail).length>0 && (startInput).hasClass("dropdown_selected")==true&&(endInput).hasClass("dropdown_selected")==true && sexInput.length>0){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page_addmember .submitBtn:first-child').addClass('submitBtnActivated');
                select_all_check=true;


            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#page_addmember .submitBtn:first-child').removeClass('submitBtnActivated');
                select_all_check=false;
            }
        }
        else{
            if((lastnameInput).hasClass("dropdown_selected")==true && (firstnameInput).hasClass("dropdown_selected")==true && (countInput_fast).hasClass("dropdown_selected")==true && (priceInput_fast).length>0 && (dateInput_fast).hasClass("dropdown_selected")==true && sexInput.length>0){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page_addmember .submitBtn:first-child').addClass('submitBtnActivated');
                select_all_check=true;

            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#page_addmember .submitBtn:first-child').removeClass('submitBtnActivated');
                select_all_check=false;
            }
        }
        //그룹 추가 창일때
    }else if($('._ADD_GROUP_NEW').css('display')=="block"){
        //if(groupname.val().length > 0 && grouptype.val().length > 0 && groupcapacity.val().length > 0){
        if(groupname.val().length > 0 && $('#form_grouptype').val().length > 0 && groupcapacity.val().length > 0){

            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            $('#page_addmember .submitBtn:first-child').addClass('submitBtnActivated');
            select_all_check=true;
        }else{
            $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            $('#page_addmember .submitBtn:first-child').removeClass('submitBtnActivated');
            select_all_check=false;
        }

        //그룹원 추가 창일때
    }else if($('._ADD_GROUPMEMBER_NEW').css('display')=="block"){
        if(fast=='1'){ //상세 입력 방식
            if((countInput).hasClass("dropdown_selected")==true && (priceInput_detail).length>0 && (startInput).hasClass("dropdown_selected")==true&&(endInput).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page_addmember .submitBtn:first-child').addClass('submitBtnActivated');
                select_all_check=true;
            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#page_addmember .submitBtn:first-child').removeClass('submitBtnActivated');
                select_all_check=false;
            }
        }
        else{   // 빠른 입력 방식
            if((countInput_fast).hasClass("dropdown_selected")==true && (priceInput_fast).length>0 && (dateInput_fast).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('#page_addmember .submitBtn:first-child').addClass('submitBtnActivated');
                select_all_check=true;

            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('#page_addmember .submitBtn:first-child').removeClass('submitBtnActivated');
                select_all_check=false;
            }
        }
    }
}

//빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택
function autoDateInput(){
    if(Options.language == "KOR"){
        var text = '소진시까지'
        var text2 = '진행기간을 선택해주세요'
    }else if(Options.language == "JPN"){
        var text = '残余回数終わるまで'
        var text2 = '進行期間を選んでください。'
    }else if(Options.language == "ENG"){
        var text = 'No cutoff'
        var text2 = 'Please enter contract period'
    }

    /// 빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택///// 
    var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31];
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
    var finishDate = yy +"-"+ mm +"-"+ dd;
    if(dd>lastDay[Number(mm)-1]){
        var dd = Number(dd)-lastDay[Number(mm)-1];
        var mm = Number(mm)+1;
        if(String(dd).length<2){
            var dd = "0"+dd;
        }
        if(String(mm).length<2){
            var mm = "0"+mm;
        }
        var finishDate = yy +"-"+ mm +"-"+ dd;
    }
    $('#memberDue_add_2').val(finishDate);
    $('#memberDue_add_2_fast').val(finishDate);
    if(selectedD==99){
        $('#memberDue_add_2').val(text);
        $('#memberDue_add_2_fast').val("9999-12-31");
    }

    if(selectedD==undefined){
        $('#memberDue_add_2').val(text2);
    }

    if($('#memberDue_add_2').val()!=text2 && $('#memberDue_add_2').val()!="" ){
        $('#memberDue_add_2').addClass("dropdown_selected");
    }
    selector_memberDue_add_2.css({
                                     "-webkit-text-fill-color":'#282828'
                                })
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
//서버로부터 회원의 기본정보를 받아온다.
function get_indiv_member_info(dbID){
    $.ajax({
        url: '/trainer/get_member_info/',
        type:'GET',
        data: {"member_id": dbID, 'id_flag':db_id_flag},
        dataType : 'html',

        beforeSend:function(){
            //beforeSend(); //ajax 로딩이미지 출력
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show()
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if($('body').width() < 600){
                    open_member_info_popup_mobile(dbID, jsondata);
                    shade_index(100)
                }else{
                    open_member_info_popup_pc(dbID, jsondata);
                }

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

//회원클릭시 회원정보 팝업을 띄우고 내용을 채운다. PC
/*
function open_member_info_popup_pc(dbID, jsondata){
    if(Options.language == "KOR"){
        var text = ' '
        var text2 = '소진시까지'
        var text3 = ''
    }else if(Options.language == "JPN"){
        var text = ' '
        var text2 = '残余回数終わるまで'
        var text3 = ''
    }else if(Options.language == "ENG"){
        var text = ''
        var text2 = ''
        var text3 = ''
    }
    var userName  = jsondata.lastnameInfo + jsondata.firstnameInfo;
    var userID    = jsondata.idInfo;
    var userBirth = jsondata.birthdayInfo;
    var userPhone = jsondata.phoneInfo;
    var userSex   = jsondata.sexInfo;
    var userActivation = jsondata.emailActiveInfo;

    $('#memberInfoPopup_PC').fadeIn('fast').attr({'data-username':userName,'data-userid': userID,'data-dbid': dbID});
    if(userActivation == 'True'){
        $('button._info_baseedit').hide()
    }else{
        $('button._info_baseedit').show()
    }

    $('#memberName_info_PC').val(userName)
    $('#memberName_info_lastName_PC, #form_lastname_modify').val(jsondata.lastnameInfo)
    $('#memberName_info_firstName_PC, #form_firstname_modify').val(jsondata.firstnameInfo)


    //var member_info_PC = '\'member_info_PC\'';
    $('#memberSex_info_PC .selectboxopt').removeClass('selectbox_checked')
    $('#memberMale_info_PC, #memberFemale_info_PC').hide()
    if(userSex == "M"){
        $('#memberMale_info_PC').show()
        $('#memberFemale_info_PC').hide()
        $('#form_sex_modify').val('M');
    }else if(userSex == "W"){
        $('#memberFemale_info_PC').show()
        $('#memberMale_info_PC').hide()
        $('#form_sex_modify').val('W');
    }else{
        $('#form_sex_modify').val('');
    }



    $(document).on('click','#memberSex_info_PC .selectboxopt',function(){
        if($('button._info_baseedit').attr('data-view') == "edit"){
            $(this).addClass('selectbox_checked');
            $(this).siblings().removeClass('selectbox_checked');
            $('#form_sex_modify').attr('value',$(this).attr('value'));
        }else{

        }
    });

    if(userBirth[0].length < 1){
        var birth_year = "-"
        var birth_month = "-"
        var birth_date = "-"
    }else{
        var birth_year = Number(userBirth[0].split('-')[0]) + '년'
        var birth_month = Number(userBirth[0].split('-')[1]) + '월'
        var birth_date = Number(userBirth[0].split('-')[2]) + '일'
    }

    var yearoption = ['<option selected disabled hidden>'+'연도'+'</option>'];
    for(var i=2018; i>=1908; i--){
        yearoption.push('<option data-year="'+i+'년'+'">'+i+'년'+'</option>');
    }
    var birth_year_options = yearoption.join('');
    $('#memberBirth_Year_info_PC').html(birth_year_options);


    var monthoption = ['<option selected disabled hidden>'+'월'+'</option>'];
    for(var i=1; i<=12; i++){
        monthoption.push('<option data-month="'+i+'월'+'">'+i+'월'+'</option>');
    }
    var birth_month_options = monthoption.join('');
    $('#memberBirth_Month_info_PC').html(birth_month_options);


    var dateoption = ['<option selected disabled hidden>'+'일'+'</option>'];
    for(var i=1; i<=31; i++){
        dateoption.push('<option data-date="'+i+'일'+'">'+i+'일'+'</option>');
    }
    var birth_date_options = dateoption.join('');
    $('#memberBirth_Date_info_PC').html(birth_date_options);
    if(birth_year != '-'){
        $('#memberBirth_Year_info_PC option[data-year="'+birth_year+'"]').prop('selected',true)
        $('#memberBirth_Month_info_PC option[data-month="'+birth_month+'"]').prop('selected',true)
        $('#memberBirth_Date_info_PC option[data-date="'+birth_date+'"]').prop('selected',true)
    }else{

    }

    if(userBirth[0] != 'None' && userBirth[0] != '' ){
        $('#form_birth_modify').val(date_format_yyyy_mm_dd_to_yyyy_m_d(userBirth[0], '-'))
    }else{
        $('#form_birth_modify').val('')
    }

    $('#form_name_modify').val(userName)
    $('#form_dbid_modify').val(dbID)
    $('#form_phone_modify').val(userPhone)

    $('#deleteMemberId').val(userID);
    $('#memberName_info').val(userName)
    $('#memberId').text(userID).val(userID).attr('data-dbid', dbID);
    $('#memberId_info_PC').val(userID).attr('data-dbid', dbID);
    $('#memberPhone_info, #memberPhone_info_PC').val(userPhone);

    $('#memberInfoPopup_PC input, #memberInfoPopup_PC select, #memberName_info_lastName_PC, #memberName_info_firstName_PC').removeClass('input_available').attr('disabled',true);
    $('#memberName_info_PC').show()
    $('#memberName_info_lastName_PC, #memberName_info_firstName_PC').hide()
    //$('button._info_modify').text('수정').attr('data-type',"view")

    $('#memberRegHistory_info_PC img').text('수정').attr('data-type',"view")
    $('._info_baseedit_img').attr('data-view','view')
    $('._info_baseedit_img img').attr('src','/static/user/res/icon-pencil.png')
    $('#inputError_info_PC').css('display','none')
}
*/
//회원클릭시 회원정보 팝업을 띄우고 내용을 채운다. PC
function open_member_info_popup_pc(dbID, jsondata){
    // var text = ' ';
    // var text2 = '소진시까지';
    // var text3 = '';
    // if(Options.language == "JPN"){
    //     text = ' ';
    //     text2 = '残余回数終わるまで';
    //     text3 = '';
    // }else if(Options.language == "ENG"){
    //     text = '';
    //     text2 = '';
    //     text3 = '';
    // }
    var userName  = jsondata.lastnameInfo + jsondata.firstnameInfo;
    var userID    = jsondata.idInfo;
    var userBirth = jsondata.birthdayInfo;
    var userPhone = jsondata.phoneInfo;
    var userSex   = jsondata.sexInfo;
    var userActivation = jsondata.emailActiveInfo;

    about_member_sex();
    about_set_birthdata();
    about_form_set();
    about_value_set();
    about_etc1();
    about_etc2();
    about_member_window_show1();
    about_member_window_show2();

    function about_member_window_show1(){
        if(userActivation == 'True'){
            $('button._info_baseedit').css('visibility','hidden');
        }else{
            $('button._info_baseedit').css('visibility','visible');
        }
    }


    function about_member_window_show2(){
        var selector_memberInfoPopup_PC = $('#memberInfoPopup_PC');
        selector_memberInfoPopup_PC.attr({'data-username':userName,'data-userid': userID,'data-dbid': dbID});
        //$('#memberInfoPopup_PC').show()
        selector_memberInfoPopup_PC.addClass('display_block')
                                    .css({'top':(($(window).height()-selector_memberInfoPopup_PC.outerHeight())/2+$(window).scrollTop()),
                                          'left':(($(window).width()-selector_memberInfoPopup_PC.outerWidth())/2+$(window).scrollLeft())});
    }

    $('#memberName_info_PC').val(userName);
    $('#memberName_info_lastName_PC, #form_lastname_modify').val(jsondata.lastnameInfo);
    $('#memberName_info_firstName_PC, #form_firstname_modify').val(jsondata.firstnameInfo);

    function about_member_sex(){
        //var member_info_PC = '\'member_info_PC\'';
        $('#memberSex_info_PC .selectboxopt').removeClass('selectbox_checked');
        $('#memberMale_info_PC, #memberFemale_info_PC').hide();
        if(userSex == "M"){
            $('#memberMale_info_PC').show();
            $('#memberFemale_info_PC').hide();
            $('#form_sex_modify').val('M');
        }else if(userSex == "W"){
            $('#memberFemale_info_PC').show();
            $('#memberMale_info_PC').hide();
            $('#form_sex_modify').val('W');
        }else{
            $('#form_sex_modify').val('');
        }
    }


    $(document).on('click','#memberSex_info_PC .selectboxopt',function(){
        if($('button._info_baseedit').attr('data-view') == "edit"){
            $(this).addClass('selectbox_checked');
            $(this).siblings().removeClass('selectbox_checked');
            $('#form_sex_modify').attr('value',$(this).attr('value'));
        }else{

        }
    });

    function about_set_birthdata(){
        var birth_year = "-";
        var birth_month = "-";
        var birth_date = "-";
        // if(userBirth[0].length < 1){
        //     var birth_year = "-";
        //     var birth_month = "-";
        //     var birth_date = "-";
        // }else{
        if(userBirth[0].length >= 1){
            birth_year = Number(userBirth[0].split('-')[0]) + '년';
            birth_month = Number(userBirth[0].split('-')[1]) + '월';
            birth_date = Number(userBirth[0].split('-')[2]) + '일';
        }

        var yearoption = ['<option selected disabled hidden>'+'연도'+'</option>'];
        var i;
        for(i=2018; i>=1908; i--){
            yearoption.push('<option data-year="'+i+'년'+'">'+i+'년'+'</option>');
        }
        var birth_year_options = yearoption.join('');
        $('#memberBirth_Year_info_PC').html(birth_year_options);


        var monthoption = ['<option selected disabled hidden>'+'월'+'</option>'];
        for(i=1; i<=12; i++){
            monthoption.push('<option data-month="'+i+'월'+'">'+i+'월'+'</option>');
        }
        var birth_month_options = monthoption.join('');
        $('#memberBirth_Month_info_PC').html(birth_month_options);


        var dateoption = ['<option selected disabled hidden>'+'일'+'</option>'];
        for(i=1; i<=31; i++){
            dateoption.push('<option data-date="'+i+'일'+'">'+i+'일'+'</option>');
        }
        var birth_date_options = dateoption.join('');
        $('#memberBirth_Date_info_PC').html(birth_date_options);
        if(birth_year != '-'){
            $('#memberBirth_Year_info_PC option[data-year="'+birth_year+'"]').prop('selected',true);
            $('#memberBirth_Month_info_PC option[data-month="'+birth_month+'"]').prop('selected',true);
            $('#memberBirth_Date_info_PC option[data-date="'+birth_date+'"]').prop('selected',true);
        }else{

        }

        if(userBirth[0] != 'None' && userBirth[0] != '' ){
            $('#form_birth_modify').val(date_format_yyyy_mm_dd_to_yyyy_m_d(userBirth[0], '-'));
        }else{
            $('#form_birth_modify').val('');
        }
    }


    function about_form_set(){
        $('#form_name_modify').val(userName);
        $('#form_dbid_modify').val(dbID);
        $('#form_phone_modify').val(userPhone);
    }

    function about_value_set(){
        $('#deleteMemberId').val(userID);
        $('#memberName_info').val(userName);
        $('#memberId').text(userID).val(userID).attr('data-dbid', dbID);
        $('#memberId_info_PC').val(userID).attr('data-dbid', dbID);
        $('#memberPhone_info, #memberPhone_info_PC').val(userPhone);
    }


    function about_etc1(){
        $('#memberInfoPopup_PC input, #memberInfoPopup_PC select, #memberName_info_lastName_PC, #memberName_info_firstName_PC').removeClass('input_available').attr('disabled',true);
        $('#memberName_info_PC').css('display','inline-block');
        $('#memberName_info_lastName_PC, #memberName_info_firstName_PC').css('display','none');
        //$('button._info_modify').text('수정').attr('data-type',"view");
    }

    function about_etc2(){
        $('#memberRegHistory_info_PC img').text('수정').attr('data-type',"view");
        $('._info_baseedit_img').attr('data-view','view');
        $('._info_baseedit_img img').attr('src','/static/user/res/icon-pencil.png');
        //$('#inputError_info_PC').css('display','none');
        $('#inputError_info_PC').css('display','none');
    }

}

//회원클릭시 회원정보 팝업을 띄우고 내용을 채운다. MOBILE
/*
function open_member_info_popup_mobile(dbID, jsondata){
    var userName  = jsondata.lastnameInfo + jsondata.firstnameInfo;
    var userID    = jsondata.idInfo;
    var userBirth = jsondata.birthdayInfo;
    var userPhone = jsondata.phoneInfo;
    var userSex   = jsondata.sexInfo;
    var userActivation = jsondata.emailActiveInfo;

    if(userActivation == 'True'){
        $('#upbutton-modify').hide()
    }else{
        $('#upbutton-modify').show()
    }

    birth_dropdown_set()
    $('#float_btn_wrap').fadeOut();
    $('#page-base').fadeOut('fast');
    $('#page-base-modifystyle').fadeIn('fast');
    $('#memberName_info').val(userName)
    $('#memberName_info_lastName, #form_lastname_modify').val(jsondata.lastnameInfo)
    $('#memberName_info_firstName, #form_firstname_modify').val(jsondata.firstnameInfo)
    $('#memberId').val(userID).attr('data-dbid', dbID)
    $('#deleteMemberId').val(userID).attr('data-dbid',dbID)
    $('#memberPhone_info').val(userPhone);

    var dropdown_year_selected = $('#birth_year_info option[data-year="'+userBirth[0].split('-')[0]+'년'+'"]')
    var dropdown_month_selected = $('#birth_month_info option[data-month="'+Number(userBirth[0].split('-')[1])+'월'+'"]')
    var dropdown_date_selected = $('#birth_date_info option[data-date="'+Number(userBirth[0].split('-')[2])+'일'+'"]')
    dropdown_year_selected.prop('selected',true)
    dropdown_month_selected.prop('selected',true)
    dropdown_date_selected.prop('selected',true)


    //회원정보 수정 Form도 현재 보는 회원 정보값으로 채워두기
    $('#form_birth_modify').val(date_format_yyyy_mm_dd_to_yyyy_m_d(userBirth[0]))
    $('#form_name_modify').val(userName)
    $('#form_sex_modify').val(userSex)
    $('#form_dbid_modify').val(dbID)
    $('#form_phone_modify').val(userPhone)


    $('#memberSex_info .selectbox_checked').removeClass('selectbox_checked');
    if(userSex == "M"){
        $('#memberMale_info').addClass('selectbox_checked')
    }else if(userSex == "W"){
        $('#memberFemale_info').addClass('selectbox_checked')
    }
    $('#memberInfoPopup').fadeIn('fast').attr({'data-username': userName, 'data-userid' : userID});
    $('#memberInfoPopup input, #memberInfoPopup select').removeClass('input_available').attr('disabled',true);
    $('#memberName_info').show()
    $('#memberName_info_lastName, #memberName_info_firstName').hide()
    $('#shade3').fadeIn('fast');
    scrollToDom($('#page_managemember'));
    if($('body').width()<600){
        $('#page_managemember').hide();
    }

    $('#inputError_info').css('display','none')
    $('#fast_check').val('0')
    $('#form_birth').val('')
}
*/
//회원클릭시 회원정보 팝업을 띄우고 내용을 채운다. MOBILE
function open_member_info_popup_mobile(dbID, jsondata){
    var bodywidth = window.innerWidth;
    var userName  = jsondata.lastnameInfo + jsondata.firstnameInfo;
    var userID    = jsondata.idInfo;
    var userBirth = jsondata.birthdayInfo;
    var userPhone = jsondata.phoneInfo;
    var userSex   = jsondata.sexInfo;
    var userActivation = jsondata.emailActiveInfo;

    if(userActivation == 'True'){
        $('#upbutton-modify').hide();
    }else{
        $('#upbutton-modify').show();
    }

    birth_dropdown_set();
    $('#float_btn_wrap').css('display','none');
    $('#page-base').css('display','none');
    $('#page-base-modifystyle').css('display','block');
    $('#upbutton-x, #upbutton-x-modify').attr('data-page', 'memberinfo');
    var selector_memberInfoPopup = $('#memberInfoPopup');
    selector_memberInfoPopup.attr({'data-username': userName, 'data-userid' : userID});
    selector_memberInfoPopup.addClass('display_block');
    shade_index(100);
    var selector_memberName_info = $('#memberName_info');
    selector_memberName_info.val(userName);
    $('#memberName_info_lastName, #form_lastname_modify').val(jsondata.lastnameInfo);
    $('#memberName_info_firstName, #form_firstname_modify').val(jsondata.firstnameInfo);
    $('#memberId').val(userID).attr('data-dbid', dbID);
    $('#deleteMemberId').val(userID).attr('data-dbid',dbID);
    $('#memberPhone_info').val(userPhone);

    var dropdown_year_selected = $('#birth_year_info option[data-year="'+userBirth[0].split('-')[0]+'년'+'"]');
    var dropdown_month_selected = $('#birth_month_info option[data-month="'+Number(userBirth[0].split('-')[1])+'월'+'"]');
    var dropdown_date_selected = $('#birth_date_info option[data-date="'+Number(userBirth[0].split('-')[2])+'일'+'"]');
    dropdown_year_selected.prop('selected',true);
    dropdown_month_selected.prop('selected',true);
    dropdown_date_selected.prop('selected',true);


    //회원정보 수정 Form도 현재 보는 회원 정보값으로 채워두기
    if(userBirth[0] != 'None' && userBirth[0] != '' ){
        $('#form_birth_modify').val(date_format_yyyy_mm_dd_to_yyyy_m_d(userBirth[0], '-'));
    }else{
        $('#form_birth_modify').val('');
    }
    $('#form_name_modify').val(userName);
    $('#form_sex_modify').val(userSex);
    $('#form_dbid_modify').val(dbID);
    $('#form_phone_modify').val(userPhone);


    $('#memberSex_info .selectbox_checked').removeClass('selectbox_checked');
    if(userSex == "M"){
        $('#memberMale_info').addClass('selectbox_checked');
    }else if(userSex == "W"){
        $('#memberFemale_info').addClass('selectbox_checked');
    }

    $('#memberInfoPopup input, #memberInfoPopup select').removeClass('input_available').attr('disabled',true);
    selector_memberName_info.css('display','block');
    $('#memberName_info_lastName, #memberName_info_firstName').css('display','none');
    //$('#shade3').fadeIn('fast');
    //scrollToDom($('#page_managemember'));
    if(bodywidth < 600){
        //$('#page_managemember').hide();
        $('#page_managemember').css({'height':'0','overflow-y':'hidden'});
        if($('._calmonth').length != 0 || $('._calweek').length != 0){
            $('#upbutton-modify, #mobile_basic_info .member_info_tool').css('display','none');
        }
    }

    $('#inputError_info').css('display','none');
    $('#fast_check').val('0');
    $('#form_birth').val('');
    $('#id_phone').val('');
}

modify_member_lec_info_pc()
//회원의 수강정보(등록횟수)를 수정한다.
function modify_member_lec_info_pc(){
    $(document).on('keyup','.lec_reg_count',function(){
        var remainCount = $(this).parent('div').siblings('.lec_rem_count').text()
        if(Number($(this).val()) >= Number(remainCount)){
            $(this).css('color','#282828')
            $('#form_lecture_reg_count').val($(this).val())
        }else{
            $(this).css('color','red')
            $('#form_lecture_reg_count').val($(this).val())
        }
    })
    $(document).on('keyup','#regPrice',function(){
        $('#form_price').val($(this).val())
    })

    $(document).on('keyup','#lectureNote',function(){
        if($(this).val()==''){
            $('#form_note').val(' ')
        }else{
            $('#form_note').val($(this).val())
        }

    })
}



//회원의 수정된 수강정보를 서버로 전송한다.
function send_member_modified_data(dbID){
    var $form = $('#update_member_lecture_info');
    $.ajax({
        url:'/trainer/update_lecture_info/',
        type:'POST',
        data: $form.serialize(),
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
            var jsondata = JSON.parse(data)
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                $('#startR').attr('selected','selected')
                $('#memberRegHistory_info_PC img').attr('src','/static/user/res/icon-pencil.png').show()
                get_member_list()
                get_member_lecture_list(dbID)
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
function resend_member_reg_data_pc(lectureID, dbID){
    $.ajax({
        url:'/trainer/update_lecture_connection_info/',
        type:'POST',
        data:{"lecture_id":lectureID,"member_id":dbID,"member_view_state_cd": 'WAIT' , "next_page":'/trainer/get_member_list/'},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data)
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }
            else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')

                get_member_list()
                get_member_lecture_list(dbID)
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
function delete_member_reg_data_pc(lectureID, dbID){
    $.ajax({
        url:'/trainer/delete_lecture_info/',
        type:'POST',
        data:{"lecture_id":lectureID, "member_id":dbID, "next_page":'/trainer/get_member_list/'},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data)
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }
            else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                get_member_list()
                get_member_lecture_list(dbID)
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

//회원의 수강정보를 완료 처리한다.
function complete_member_reg_data_pc(lectureID, dbID){
    $.ajax({
        url:'/trainer/finish_lecture_info/',
        type:'POST',
        data:{"lecture_id":lectureID,"member_id": dbID, "next_page":'/trainer/get_error_info/'},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data)
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }
            else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                $('#startR').attr('selected','selected')
                get_member_list()
                get_member_lecture_list(dbID)
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

//회원의 수강정보를 진행중으로 처리한다.
function resume_member_reg_data_pc(lectureID, dbID){
    $.ajax({
        url:'/trainer/progress_lecture_info/',
        type:'POST',
        data:{"lecture_id":lectureID, "member_id" : dbID, "next_page":'/trainer/get_member_list/'},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data)
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }
            else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                $('#startR').attr('selected','selected')
                get_member_list()
                get_member_lecture_list(dbID)
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
function refund_member_lecture_data(lectureID, dbID, refund_price, refund_date){
    if(Options.language == "KOR"){
        var text = ' 환불 처리 되었습니다.'
        var text2 = '환불 금액을 입력해주세요.'
    }else if(Options.language == "JPN"){
        var text = '　様払い戻ししました。'
        var text2 = '払戻金額を入力してください。'
    }else if(Options.language == "ENG"){
        var text = 'has been refunded.'
        var text2 = 'Please input refund'
    }

    if(refund_price.length>0){
        $.ajax({
            url:'/trainer/refund_lecture_info/',
            type:'POST',
            data:{"lecture_id":lectureID, "member_id": dbID, "refund_price": refund_price , "refund_date":refund_date, "next_page":'/trainer/get_member_list/'},
            dataType : 'html',

            beforeSend:function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
                beforeSend()
            },

            //보내기후 팝업창 닫기
            complete:function(){
                completeSend()
            },

            //통신성공시 처리
            success:function(data){
                var jsondata = JSON.parse(data)
                if(jsondata.messageArray.length>0){
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray)
                }
                else{
                    $('#errorMessageBar').hide()
                    $('#errorMessageText').text('')
                    $('#startR').attr('selected','selected')
                    get_member_list()
                    get_member_lecture_list(dbID)

                    $('#shade3').css('display','none')
                    $('div.lectureRefundPopup.popups input[type="number"]').val('')
                    console.log('success');

                    alert(text)
                }
            },

            //통신 실패시 처리
            error:function(){
                $('#errorMessageBar').show()
                $('#errorMessageText').text('통신 에러: 관리자 문의')
            },
        })
    }else{
        alert(text2)
    }
}

//회원의 진행상태 연결해제를 한다.
function disconnect_member_lecture_data(stateCode, lectureID, dbID){
    $.ajax({
        url:'/trainer/update_lecture_connection_info/',
        type:'POST',
        data:{"lecture_id":lectureID, "member_id": dbID, "member_view_state_cd": stateCode ,"next_page":'/trainer/get_member_list/'},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data)
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }
            else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')

                $('#startR').attr('selected','selected')
                get_member_list()
                get_member_lecture_list(dbID)

                $('#shade3').css('display','none')
                $('div.lectureRefundPopup.popups input[type="number"]').val('')
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
function get_member_lecture_list(dbID, use, callback){
    $.ajax({
        url:'/trainer/get_lecture_list/',
        type:'GET',
        data:{"member_id":dbID},
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
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if(use == "callback"){
                    callback(jsondata)
                }else{
                    if($('body').width() < 600){
                        draw_member_lecture_list_table(jsondata, dbID, 'mobile')
                    }else{
                        draw_member_lecture_list_table(jsondata, dbID, 'pc')
                    }
                }

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
function draw_member_lecture_list_table(jsondata, dbID, PCorMobile){
    var bodywidth = window.innerWidth;
    var $regHistory;
    if(PCorMobile == "pc"){
        $regHistory = $('#memberRegHistory_info_PC');
    }else if(PCorMobile == "mobile"){
        $regHistory = $('#memberRegHistory_info');
    }

    var result_history_html = [];
    var result_history_html2 = [];
    //시작, 종료, 등록횟수, 남은횟수,
    //등록금액, 회당 금액, 전행상태, 연결상태, 수정
    var regCount_group_personal = [];
    var remCount_group_personal = [];
    var availCount_group_personal = [];
    var finishCount_group_personal = [];
    if(PCorMobile == "pc"){
        regCount_group_personal = [];
        remCount_group_personal = [];
        availCount_group_personal = [];
        finishCount_group_personal = [];
        result_history_html = ['<div style="background:#f5f5f5"><div>시작</div><div>종료</div><div>등록횟수</div><div>남은횟수</div><div>등록금액</div><div>회당금액</div><div>진행상태</div><div>연결상태</div><div>수정</div></div>'];
        for(var i=0; i<jsondata.lectureIdArray.length; i++){
            var availcount =  '<div>'+jsondata.availCountArray[i]+'</div>';
            var lectureId =   '<div>'+jsondata.lectureIdArray[i]+'</div>';
            var lectureType = '<div>'+jsondata.lectureStateArray[i]+'</div>';
            var lectureTypeName = '<div class="lectureType_IP" data-leid =" '+jsondata.lectureIdArray[i]+'">'+jsondata.lectureStateNameArray[i]+'</div>';
            var lectureConnectType = '<div class="lectureType_IP" data-leid =" '+jsondata.lectureIdArray[i]+'">'+jsondata.memberViewStateArray[i]+'</div>';
            var lectureConnectTypeName = '<div class="lectureType_IP" data-leid =" '+jsondata.lectureIdArray[i]+'">'+jsondata.memberViewStateNameArray[i]+'</div>';
            var modDateTime = '<div>'+jsondata.modDateTimeArray[i]+'</div>';
            //var regcount =    '<div>'+jsondata.regCountArray[i]+'</div>';
            var regDateTime = '<div>'+jsondata.regDateTimeArray[i]+'</div>';
            var remcount =    '<div class="lec_rem_count">'+jsondata.remCountArray[i]+'</div>';

            var regPrice;
            var regUnitPrice;
            if(bodywidth > 600){
                regPrice = '<div><input id="regPrice" value='+numberWithCommas(jsondata.priceArray[i])+' disabled>'+'</div>';
                regUnitPrice = '<div id="regPrice">'+numberWithCommas(parseInt(Number(jsondata.priceArray[i])/Number(jsondata.regCountArray[i])))+'</div>';
            }else if(bodywidth <= 600){
                regPrice = '<div><input id="regPrice" value='+numberWithCommas(jsondata.priceArray[i])+' disabled>'+'</div>';
                regUnitPrice = '<div id="regUnitPrice">'+numberWithCommas(parseInt(Number(jsondata.priceArray[i])/Number(jsondata.regCountArray[i])))+'</div>';
            }
            //var start = '<div class="regHistoryDateInfo">'+jsondata.startArray[i]+'</div>'
            //var end = '<div class="regHistoryDateInfo">'+jsondata.endArray[i]+'</div>'
            var regcount =    '<div><input class="lec_reg_count" value="'+jsondata.regCountArray[i]+'" disabled></div>';
            var start = '<div><input data-type="lec_start_date" data-leid ="'+jsondata.lectureIdArray[i]+'" class="lec_start_date regHistoryDateInfo" value="'+date_format_yyyymmdd_to_yyyymmdd_split(jsondata.startArray[i],'.')+'" disabled readonly></div>';
            var end = '<div><input data-type="lec_end_date" data-leid ="'+jsondata.lectureIdArray[i]+'" class="lec_end_date regHistoryDateInfo" value="'+date_format_yyyymmdd_to_yyyymmdd_split(jsondata.endArray[i],'.')+'" disabled readonly></div>';
            var modifyActiveBtn = '<div><img src="/static/user/res/icon-pencil.png" class="regHistoryModifyBtn" data-type="view" data-leid="'+jsondata.lectureIdArray[i]+'" data-dbid="'+dbID+'"></div>';
            var howManyReg = '<div class="howManyReg_PC">'+(jsondata.lectureIdArray.length-i)+'회차 등록 '+'</div>';


            var yourgroup = jsondata.groupNameArray[i];
            if(jsondata.groupNameArray[i] == '그룹'){
                if(jsondata.lectureStateArray[i] == "IP"){
                    regCount_group_personal.push('G'+jsondata.regCountArray[i]);
                    remCount_group_personal.push('G'+jsondata.remCountArray[i]);
                    availCount_group_personal.push('G'+jsondata.availCountArray[i]);
                    finishCount_group_personal.push('G'+jsondata.finishCountArray[i]);
                }

            }
            else if(jsondata.groupNameArray[i] == '클래스'){
                if(jsondata.lectureStateArray[i] == "IP"){
                    regCount_group_personal.push('C'+jsondata.regCountArray[i]);
                    remCount_group_personal.push('C'+jsondata.remCountArray[i]);
                    availCount_group_personal.push('C'+jsondata.availCountArray[i]);
                    finishCount_group_personal.push('C'+jsondata.finishCountArray[i]);
                }
            }
            else if(jsondata.groupNameArray[i] == '1:1 레슨'){
                if(jsondata.lectureStateArray[i] == "IP"){
                    regCount_group_personal.push(jsondata.regCountArray[i]);
                    remCount_group_personal.push(jsondata.remCountArray[i]);
                    availCount_group_personal.push(jsondata.availCountArray[i]);
                    finishCount_group_personal.push(jsondata.finishCountArray[i]);
                }
            }
            //var whatGroupType = '<div class="whatGroupType_PC"><select data-leid="'+jsondata.lectureIdArray[i]+'" disabled><option value="1" selected>'+yourgroup+'</option></select></div>';
            var whatGroupType = '<div class="whatGroupType_PC"><span data-leid="'+jsondata.lectureIdArray[i]+'">'+yourgroup+'</span></div>';


            
            if(jsondata.memberViewStateArray[i] == "WAIT"){ // 연결안됨 WAIT, 연결됨 VIEW, 연결취소 DELETE
                lectureConnectTypeName = '<div class="lectureType_WAIT" data-dbid="'+dbID+'" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.memberViewStateNameArray[i]+'</div>';
            }else if(jsondata.memberViewStateArray[i] == "DELETE"){
                lectureConnectTypeName = '<div class="lectureType_DELETE" data-dbid="'+dbID+'" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.memberViewStateNameArray[i]+'</div>';
            }else if(jsondata.memberViewStateArray[i] == "VIEW"){
                lectureConnectTypeName = '<div class="lectureType_VIEW" data-dbid="'+dbID+'" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.memberViewStateNameArray[i]+'</div>';
            }
            

            if(jsondata.lectureStateArray[i] == "IP"){ //진행중 IP, 완료 PE, 환불 RF
                lectureTypeName = '<div class="lecConnectType_IP" data-dbid="'+dbID+'" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.lectureStateNameArray[i]+'</div>';
            }else if(jsondata.lectureStateArray[i] == "PE"){
                lectureTypeName = '<div class="lecConnectType_PE" data-dbid="'+dbID+'" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.lectureStateNameArray[i]+'</div>';
                lectureConnectTypeName = '<div data-dbid="'+dbID+'" data-leid ="'+jsondata.lectureIdArray[i]+'"> - </div>';
            }else if(jsondata.lectureStateArray[i] == "RF"){
                lectureTypeName = '<div class="lecConnectType_RF" data-dbid="'+dbID+'" data-leid ="'+jsondata.lectureIdArray[i]+'">'+jsondata.lectureStateNameArray[i]+'</div>';
                lectureConnectTypeName = '<div data-dbid="'+dbID+'" data-leid ="'+jsondata.lectureIdArray[i]+'"> - </div>';
            };


            var note = '<div class="pc_member_note" data-dbid="'+dbID+'" data-leid="'+jsondata.lectureIdArray[i]+'"><span>특이사항: </span>'+'<input id="lectureNote" value="'+jsondata.noteArray[i]+'" disabled></span></div>';
            var contents = start+end+regcount+remcount+regPrice+regUnitPrice+lectureTypeName+lectureConnectTypeName+modifyActiveBtn
            result_history_html.push('<div style="border-top:1px solid #cccccc;">'+howManyReg+whatGroupType+'</div>'+'<div data-leid='+jsondata.lectureIdArray[i]+'>'+contents+'</div>'+note);
        }
        $('#memberRegCount_info_PC').html(sumCount(jsondata.regCountArray)+'<span style="font-size:11px;"> ('+regCount_group_personal.join(',')+')</span>');  //전체 등록횟수
        $('#memberRemainCount_info_PC').html(sumCount(jsondata.remCountArray)+'<span style="font-size:11px;"> ('+remCount_group_personal.join(',')+')</span>');  //전체 남은횟수
        $('#memberAvailCount_info_PC').html(sumCount(jsondata.availCountArray)+'<span style="font-size:11px;"> ('+availCount_group_personal.join(',')+')</span>'); //전체 예약가능횟수
        $('#memberFinishCount_info_PC').html(sumCount(jsondata.finishCountArray)+'<span style="font-size:11px;"> ('+finishCount_group_personal.join(',')+')</span>');  //전체 완료횟수

        var result_history = result_history_html.join('');
        $regHistory.html(result_history);
    }else if(PCorMobile == "mobile"){
        result_history_html = [];
        result_history_html2 = [];
        //시작, 종료, 등록횟수, 남은횟수, 
        //등록금액, 회당 금액, 전행상태, 연결상태, 수정
        regCount_group_personal = [];
        remCount_group_personal = [];
        availCount_group_personal = [];
        finishCount_group_personal = [];
        var jsonlen = jsondata.lectureIdArray.length;

        var jsondata_availCountArray = jsondata.availCountArray;
        var jsondata_lectureIdArray = jsondata.lectureIdArray;
        var jsondata_lectureStateArray = jsondata.lectureStateArray;
        var jsondata_lectureStateNameArray = jsondata.lectureStateNameArray;
        var jsondata_memberViewStateArray = jsondata.memberViewStateArray;
        var jsondata_memberViewStateNameArray = jsondata.memberViewStateNameArray;
        var jsondata_modDateTimeArray = jsondata.modDateTimeArray;
        var jsondata_regDateTimeArray = jsondata.regDateTimeArray;
        var jsondata_remCountArray = jsondata.remCountArray;
        var jsondata_priceArray = jsondata.priceArray;
        var jsondata_regCountArray = jsondata.regCountArray;
        var jsondata_finishCountArray = jsondata.finishCountArray;
        var jsondata_startArray = jsondata.startArray;
        var jsondata_endArray = jsondata.endArray;
        var jsondata_groupNameArray = jsondata.groupNameArray;
        var jsondata_noteArray = jsondata.noteArray;

        for(var i=0; i<jsonlen; i++){
            var table_title1 = '<div><div class="regHistory_table_title">시작</div><div class="regHistory_table_title">종료</div><div class="regHistory_table_title">등록횟수</div><div class="regHistory_table_title">남은횟수</div></div>';
            var table_title2 = '<div><div class="regHistory_table_title">등록금액</div><div class="regHistory_table_title">회당금액</div><div class="regHistory_table_title">진행상태</div><div class="regHistory_table_title">연결상태</div></div>';

            var availcount =  '<div>'+jsondata_availCountArray[i]+'</div>';
            var lectureId =   '<div>'+jsondata_lectureIdArray[i]+'</div>';
            var lectureType = '<div>'+jsondata_lectureStateArray[i]+'</div>';
            var lectureTypeName = '<div class="lectureType_IP" data-leid =" '+jsondata_lectureIdArray[i]+'">'+jsondata_lectureStateNameArray[i]+'</div>';
            var lectureConnectType = '<div class="lectureType_IP" data-leid =" '+jsondata_lectureIdArray[i]+'">'+jsondata_memberViewStateArray[i]+'</div>';
            var lectureConnectTypeName = '<div class="lectureType_IP" data-leid =" '+jsondata_lectureIdArray[i]+'">'+jsondata_memberViewStateNameArray[i]+'</div>';
            var modDateTime = '<div>'+jsondata_modDateTimeArray[i]+'</div>';
            //var regcount =    '<div>'+jsondata.regCountArray[i]+'</div>';
            var regDateTime = '<div>'+jsondata_regDateTimeArray[i]+'</div>';
            var remcount =    '<div class="lec_rem_count">'+jsondata_remCountArray[i]+'</div>';
            var regPrice;
            var regUnitPrice;
            if(bodywidth > 600){
                regPrice = '<div><input id="regPrice" value='+numberWithCommas(jsondata_priceArray[i])+' disabled>'+'</div>';
                regUnitPrice = '<div id="regPrice">'+numberWithCommas(parseInt(Number(jsondata_priceArray[i])/Number(jsondata_regCountArray[i])))+'</div>';
            }else if(bodywidth <= 600){
                regPrice = '<div><input id="regPrice" value='+numberWithCommas(jsondata_priceArray[i])+' disabled>'+'</div>';
                regUnitPrice = '<div id="regUnitPrice">'+numberWithCommas(parseInt(Number(jsondata_priceArray[i])/Number(jsondata_regCountArray[i])))+'</div>';
            }
            //var start = '<div class="regHistoryDateInfo">'+jsondata.startArray[i]+'</div>'
            //var end = '<div class="regHistoryDateInfo">'+jsondata.endArray[i]+'</div>'
            var regcount =    '<div><input class="lec_reg_count" value="'+jsondata_regCountArray[i]+'" disabled></div>';
            var start = '<div><input data-type="lec_start_date" data-leid ="'+jsondata_lectureIdArray[i]+'" class="lec_start_date regHistoryDateInfo" value="'+date_format_yyyymmdd_to_yyyymmdd_split(jsondata_startArray[i],'.')+'" disabled readonly></div>';
            var end = '<div><input data-type="lec_end_date" data-leid ="'+jsondata_lectureIdArray[i]+'" class="lec_end_date regHistoryDateInfo" value="'+date_format_yyyymmdd_to_yyyymmdd_split(jsondata_endArray[i],'.')+'" disabled readonly></div>';
            var modifyActiveBtn = '<div style="width:10%;border:0;"><img src="/static/user/res/icon-pencil.png" class="regHistoryModifyBtn" data-type="view" data-leid="'+jsondata_lectureIdArray[i]+'" data-dbid="'+dbID+'"></div>';
            var howManyReg = '<div class="howManyReg">'+(jsonlen-i)+'회차 등록 '+'</div>';

            var yourgroup = jsondata_groupNameArray[i];
            if(jsondata_groupNameArray[i] == '그룹'){
                if(jsondata.lectureStateArray[i] == "IP"){
                    regCount_group_personal.push('G'+jsondata_regCountArray[i]);
                    remCount_group_personal.push('G'+jsondata_remCountArray[i]);
                    availCount_group_personal.push('G'+jsondata_availCountArray[i]);
                    finishCount_group_personal.push('G'+jsondata_finishCountArray[i]);
                }

            }
            else if(jsondata_groupNameArray[i] == '클래스'){
                if(jsondata_lectureStateArray[i] == "IP"){
                    regCount_group_personal.push('C'+jsondata_regCountArray[i]);
                    remCount_group_personal.push('C'+jsondata_remCountArray[i]);
                    availCount_group_personal.push('C'+jsondata_availCountArray[i]);
                    finishCount_group_personal.push('C'+jsondata_finishCountArray[i]);
                }
            }
            else if(jsondata_groupNameArray[i] == '1:1 레슨'){
                if(jsondata_lectureStateArray[i] == "IP"){
                    regCount_group_personal.push(jsondata_regCountArray[i]);
                    remCount_group_personal.push(jsondata_remCountArray[i]);
                    availCount_group_personal.push(jsondata_availCountArray[i]);
                    finishCount_group_personal.push(jsondata_finishCountArray[i]);
                }
            }
            var whatGroupType = '<div class="whatGroupType_PC"><select data-leid="'+jsondata_lectureIdArray[i]+'" disabled><option value="1" selected>'+yourgroup+'</option></select></div>';

            //var whatGroupType = '<div class="whatGroupType"><select disabled><option value="1" selected>1:1 레슨</option><option value="2">그룹 레슨</option><option value="3">1:1 + 그룹 레슨</option></select></div>'
            

            lectureConnectTypeName = "";

            if(jsondata_memberViewStateArray[i] == "WAIT"){ // 연결안됨 WAIT, 연결됨 VIEW, 연결취소 DELETE
                lectureConnectTypeName = '<div class="lectureType_WAIT" data-dbid="'+dbID+'"  data-leid ="'+jsondata_lectureIdArray[i]+'">'+jsondata_memberViewStateNameArray[i]+'</div>';
            }else if(jsondata_memberViewStateArray[i] == "DELETE"){
                lectureConnectTypeName = '<div class="lectureType_DELETE" data-dbid="'+dbID+'"  data-leid ="'+jsondata_lectureIdArray[i]+'">'+jsondata_memberViewStateNameArray[i]+'</div>';
            }else if(jsondata_memberViewStateArray[i] == "VIEW"){
                lectureConnectTypeName = '<div class="lectureType_VIEW" data-dbid="'+dbID+'"  data-leid ="'+jsondata_lectureIdArray[i]+'">'+jsondata_memberViewStateNameArray[i]+'</div>';
            }

            if(jsondata_lectureStateArray[i] == "IP"){ //진행중 IP, 완료 PE, 환불 RF
                lectureTypeName = '<div class="lecConnectType_IP" data-dbid="'+dbID+'"  data-leid ="'+jsondata_lectureIdArray[i]+'">'+jsondata_lectureStateNameArray[i]+'</div>';
            }else if(jsondata_lectureStateArray[i] == "PE"){
                lectureTypeName = '<div class="lecConnectType_PE" data-dbid="'+dbID+'"  data-leid ="'+jsondata_lectureIdArray[i]+'">'+jsondata_lectureStateNameArray[i]+'</div>';
                lectureConnectTypeName = '<div data-dbid="'+dbID+'"  data-leid ="'+jsondata_lectureIdArray[i]+'"> - </div>';
            }else if(jsondata_lectureStateArray[i] == "RF"){
                lectureTypeName = '<div class="lecConnectType_RF" data-dbid="'+dbID+'"  data-leid ="'+jsondata_lectureIdArray[i]+'">'+jsondata_lectureStateNameArray[i]+'</div>';
                lectureConnectTypeName = '<div data-dbid="'+dbID+'"  data-leid ="'+jsondata_lectureIdArray[i]+'"> - </div>';
            }
            

            var note = '<div class="mobile_member_note" data-leid="'+jsondata_lectureIdArray[i]+'"><span>특이사항: </span>'+'<input id="lectureNote" value="'+jsondata_noteArray[i]+'" disabled></span></div>';

            result_history_html.push('<div class="wraps"><div data-leid='+jsondata_lectureIdArray[i]+' style="text-align:right;">'+howManyReg+whatGroupType+'수정: '+modifyActiveBtn+'</div>'+
                table_title1+
                '<div data-leid='+jsondata_lectureIdArray[i]+'>'+start+end+regcount+remcount+'</div>'+
                table_title2+
                '<div data-leid='+jsondata_lectureIdArray[i]+'>'+regPrice+regUnitPrice+lectureTypeName+lectureConnectTypeName+'</div>'+
                note+'</div>');
        }
        $('#memberRegCount_info').val(sumCount(jsondata_regCountArray)+' ('+regCount_group_personal.join(',')+')');  //전체 등록횟수
        $('#memberRemainCount_info').val(sumCount(jsondata_remCountArray)+' ('+remCount_group_personal.join(',')+')'); //전체 남은횟수
        $('#memberAvailCount_info').val(sumCount(jsondata_availCountArray)+' ('+availCount_group_personal.join(',')+')');  //전체 예약가능횟수
        $('#memberFinishCount_info').val(sumCount(jsondata_finishCountArray)+' ('+finishCount_group_personal.join(',')+')');  //전체 완료횟수

        var result_history = result_history_html.join('');
        $regHistory.html(result_history);
    }

    function sumCount(numberarray){
        var count = 0;
        for(var i=0; i<numberarray.length; i++){
            count = count + Number(numberarray[i]);
        }
        return count;
    }
}

function get_member_history_list(dbID){
    $.ajax({
        url:'/trainer/get_member_schedule/',
        type:'GET',
        data:{"member_id":dbID},
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
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if($('body').width() < 600){
                    draw_member_history_list_table(jsondata, 'mobile')
                }else{
                    draw_member_history_list_table(jsondata, 'pc')
                }

            }

        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text('통신 에러: 관리자 문의')
        },
    })
}

function draw_member_history_list_table(jsondata, PCorMobile){
    if(PCorMobile == "pc"){
        var $regHistory = $('#memberLectureHistory_info_PC')
    }else if(PCorMobile == "mobile"){
        var $regHistory = $('#memberLectureHistory_info')
    }
    if(Options.language == "KOR"){
        var text = '수행일시'
        var text2 = '진행시간'
        var text3 = '구분'
        var text4 = '메모'
        var text5 = '완료'
        var text6 = '시작전'
        var text7 = '시작전'
        var text9 = '시간'
        var text10 = '회차'
    }else if(Options.language == "JPN"){
        var text = '授業日'
        var text2 = '進行時間'
        var text3 = '状態'
        var text4 = 'メモ―'
        var text5 = '完了'
        var text6 = '未完了'
        var text7 = '未完了'
        var text9 = '時間'
        var text10 = 'No.'
    }else if(Options.language == "ENG"){
        var text = 'Date'
        var text2 = 'Period'
        var text3 = 'Status'
        var text4 = 'Memo'
        var text5 = 'Fin.'
        var text6 = 'Yet'
        var text7 = 'Yet'
        var text9 = 'h'
        var text10 = 'No.'
    }

    var result_history_html = ['<div><div>'+text10+'</div><div>'+text+'</div><div>'+text2+'</div><div>'+text3+'</div><div>'+text4+'</div></div>']
    var stateCodeDict = {"PE":text5,"NP":text6,"IP":text7}
    for(var i=0; i<jsondata.ptScheduleStartDtArray.length; i++){
        var day = new Date(jsondata.ptScheduleStartDtArray[i].split(' ')[0]).getDay()
        var startDate = Number(jsondata.ptScheduleStartDtArray[i].split(' ')[0].split('-')[2])
        var endDate = Number(jsondata.ptScheduleEndDtArray[i].split(' ')[0].split('-')[2])
        var startTime = Number(jsondata.ptScheduleStartDtArray[i].split(' ')[1].split(':')[0]) + Number(jsondata.ptScheduleStartDtArray[i].split(' ')[1].split(':')[1])/60
        var endTime = Number(jsondata.ptScheduleEndDtArray[i].split(' ')[1].split(':')[0]) + Number(jsondata.ptScheduleEndDtArray[i].split(' ')[1].split(':')[1])/60

        var dur = calc_duration_by_start_end_2(jsondata.ptScheduleStartDtArray[i].split(' ')[0], jsondata.ptScheduleStartDtArray[i].split(' ')[1], jsondata.ptScheduleEndDtArray[i].split(' ')[0], jsondata.ptScheduleEndDtArray[i].split(' ')[1]);

        var ptScheduleNo = '<div data-id="'+jsondata.ptScheduleIdArray[i]+'">'+jsondata.ptScheduleIdxArray[i]+'</div>'
        var ptScheduleStartDt =  '<div data-id="'+jsondata.ptScheduleIdArray[i]+'">'+date_format_yyyymmdd_to_yyyymmdd_split(jsondata.ptScheduleStartDtArray[i].split(' ')[0],'.')+' ('+multiLanguage[Options.language]['WeekSmpl'][day]+') '+jsondata.ptScheduleStartDtArray[i].split(' ')[1].substr(0,5)+'</div>'
        var ptScheduleStateCd =   '<div class="historyState_'+jsondata.ptScheduleStateCdArray[i]+'" data-id="'+jsondata.ptScheduleIdArray[i]+'">'+stateCodeDict[jsondata.ptScheduleStateCdArray[i]]+'</div>'
        var ptScheduleDuration = '<div data-id="'+jsondata.ptScheduleIdArray[i]+'">'+duration_number_to_hangul_minute(dur)+'</div>'
        var ptScheduleNote =   '<div data-id="'+jsondata.ptScheduleIdArray[i]+'">'+jsondata.ptScheduleNoteArray[i]+'</div>'
        if(jsondata.ptScheduleIdxArray[i] == "1" && i!=0){
            result_history_html.push('<div style="border-bottom:1px solid #cccccc;" data-leid='+jsondata.ptScheduleIdArray[i]+'>'+ptScheduleNo+ptScheduleStartDt+ptScheduleDuration+ptScheduleStateCd+ptScheduleNote+'</div>')
        }else{
            result_history_html.push('<div data-leid='+jsondata.ptScheduleIdArray[i]+'>'+ptScheduleNo+ptScheduleStartDt+ptScheduleDuration+ptScheduleStateCd+ptScheduleNote+'</div>')
        }
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
    // $('#id_user_id').val(id_search_memberId);
    if(id_search_memberSex != ''){
        $('.selectboxopt[value='+id_search_memberSex+']').addClass('selectbox_checked');
    }
    else{
        $('memberSex_info').addClass('selectbox_checked');
    }

    var dropdown_year_selected = ''
    var dropdown_month_selected = ''
    var dropdown_date_selected = ''

    if(id_search_memberBirth == ''){
        $('#birth_year, #birth_month, #birth_date').find('option:first').prop('selected', true)
    }
    else{
        dropdown_year_selected = $('#birth_year option[data-year="'+id_search_memberBirth.split(' ')[0]+'"]');
        dropdown_month_selected = $('#birth_month option[data-month="'+id_search_memberBirth.split(' ')[1]+'"]');
        dropdown_date_selected = $('#birth_date option[data-date="'+id_search_memberBirth.split(' ')[2]+'"]');
        dropdown_year_selected.prop('selected',true);
        dropdown_month_selected.prop('selected',true);
        dropdown_date_selected.prop('selected',true);
    }

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
    $.ajax({
        url:'/trainer/add_lecture_info/',
        type:'POST',
        data: $('#member-add-form-new').serialize(),
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
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if($('body').width()<600){
                    $('#page_managemember').show();
                }else{
                    $('body').css('overflow-y','auto');
                }
                /*
                 if($('#memberInfoPopup_PC').css('display') == "block" || $('#memberInfoPopup').css('display') == "block"){
                 get_member_lecture_list(dbID)
                 }
                 */
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')

                $('#startR').attr('selected','selected')
                get_member_list()

                closePopup('member_add')
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


function add_member_form_noemail_func(){
    $.ajax({
        url:'/login/add_member_info_no_email/',
        type:'POST',
        data: $('#add-member-id-form').serialize(),
        dataType : 'html',

        beforeSend:function(){
            beforeSend();
        },

        //보내기후 팝업창 닫기
        complete:function(){
            //completeSend()
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                ////$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#id_user_id').val(jsondata.user_db_id)
                add_member_form_func();
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        },
    })
}

//새로운 그룹 정보 서버로 보내 등록하기
function add_group_form_func(){
    $.ajax({
        url:'/trainer/add_group_info/',
        type:'POST',
        data: {
            "name" : $('#groupname').val(),
            "group_type_cd" : $('#form_grouptype').val(),
            "member_num" : $('#form_groupcapacity').val(),
            "note" : $('#comment').val()
        },
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if($('body').width()<600){
                    $('#page_managemember').show();
                }else{
                    $('body').css('overflow-y','auto');
                }
                /*
                 if($('#memberInfoPopup_PC').css('display') == "block" || $('#memberInfoPopup').css('display') == "block"){
                 get_member_lecture_list(dbID)
                 }
                 */
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')


                if($('#currentGroupList').css('display') == "block"){
                    groupListSet('current',jsondata)
                }else if($('#finishedGroupList').css('display') == "block"){
                    groupListSet('finished',jsondata)
                }

                closePopup('member_add')
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






//새로운 그룹멤버 정보 서버로 보내 등록하기
function add_groupmember_form_func(){
    $.ajax({
        url:'/trainer/add_group_member/',
        type:'POST',
        data: JSON.stringify(added_member_info_to_jsonformat()),
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend()
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if($('body').width()<600){
                    $('#page_managemember').show();
                }else{
                    $('body').css('overflow-y','auto');
                }
                /*
                 if($('#memberInfoPopup_PC').css('display') == "block" || $('#memberInfoPopup').css('display') == "block"){
                 get_member_lecture_list(dbID)
                 }
                 */
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')

                get_member_list()
                if($('#currentGroupList').css('display') == "block"){
                    groupListSet('current',jsondata)
                }else if($('#finishedGroupList').css('display') == "block"){
                    groupListSet('finished',jsondata)
                }
                $('#startR').attr('selected','selected')
                closePopup('member_add')
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
        data: $form.serialize(),
        dataType : 'html',

        beforeSend:function(){
            beforeSend();
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-modify img').attr('src','/static/user/res/icon-pencil.png')
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }
            else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                close_info_popup('cal_popup_plandelete')

                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto")
                $('#upbutton-modify img').attr('src','/static/user/res/icon-pencil.png')

                $('#startR').attr('selected','selected')
                switch(alignType){
                    case 'name':
                        get_member_ing_list('callback',function(json){
                            memberListSet ('current','name','no',json)
                            $('#name').attr('selected','selected')
                        })
                        get_member_end_list('callback',function(json){
                            memberListSet('finished','name','no',json)
                            $('#name').attr('selected','selected')
                        })

                        break;
                    case 'countH':
                        get_member_ing_list('callback',function(json){
                            memberListSet('current','count','yes',json);
                            $('#countH').attr('selected','selected')
                        })
                        get_member_end_list('callback',function(json){
                            memberListSet('finished','count','yes',json);
                            $('#countH').attr('selected','selected')
                        })

                        break;
                    case 'countL':
                        get_member_ing_list('callback',function(json){
                            memberListSet('current','count','no',json);
                            $('#countL').attr('selected','selected')
                        })
                        get_member_end_list('callback',function(json){
                            memberListSet('finished','count','no',json);
                            $('#countL').attr('selected','selected')
                        })
                        break;
                    case 'startP':
                        get_member_ing_list('callback',function(json){
                            memberListSet('current','date','no',json);
                            $('#startP').attr('selected','selected')
                        })
                        get_member_end_list('callback',function(json){
                            memberListSet('finished','date','no',json);
                            $('#startP').attr('selected','selected')
                        })
                        break;
                    case 'startR':
                        get_member_ing_list('callback',function(json){
                            memberListSet('current','date','yes',json);
                            $('#startR').attr('selected','selected')
                        })
                        get_member_end_list('callback',function(json){
                            memberListSet('finished','date','yes',json);
                            $('#startR').attr('selected','selected')
                        })
                        break;
                    case 'recent':
                        get_member_ing_list('callback',function(json){
                            memberListSet('current','date','yes',json);
                            $('#recent').attr('selected','selected')
                        })
                        get_member_end_list('callback',function(json){
                            memberListSet('finished','date','yes',json);
                            $('#recent').attr('selected','selected')
                        })
                        break;
                }
                console.log('success');
            }
        },

        complete:function(){
            //completeSend();
        },

        error:function(){
            $('#errorMessageBar').show()
            $('#errorMessageText').text('통신 에러: 관리자 문의')
        }
    })
}




//여러종류의 팝업을 닫는다.
function closePopup(option){
    if(Options.language == "KOR"){
        var text = '회원 정보 조회'

    }else if(Options.language == "JPN"){
        var text = 'メンバー情報'

    }else if(Options.language == "ENG"){
        var text = 'Member Info.'

    }
    if(option == 'member_info'){
        $('#memberRegHistory_info_PC, #memberRepeat_info_PC, #memberLectureHistory_info_PC').html('')
        hide_this();
        $('#page_managemember').css({'height':'100%','overflow-y':'auto'});
        float_btn_show();
        base_show();
        base_modify_hide();

        function float_btn_show(){
            $('#float_btn_wrap').show();
            $('#float_btn').removeClass('rotate_btn');
        }

        function base_show(){
            $('#page-base').css('display','block');
        }

        function base_modify_hide(){
            $('#page-base-modifystyle').css('display','none');
        }
        var selector_upbutton_modify = $('#upbutton-modify');
        selector_upbutton_modify.find('img').attr({'src':'/static/user/res/icon-pencil.png'});
        selector_upbutton_modify.attr({'data-type':'view'});
        $('#uptext-pc-modify').text(text);

        function hide_this(){
            $('#memberInfoPopup').removeClass('display_block');
            if($('#mshade').css('z-index')==150){
                shade_index(150);
            }else{
                shade_index(-100);
            }
        }

        $('#memberRegHistory_info').html("");
        $('#memberRepeat_info').html("");
        $('#memberLectureHistory_info').html("");

        hide_plandelete();
        close_others();

        function hide_plandelete(){
            $('#cal_popup_plandelete').css('display','none');
        }

        function close_others(){
            if($('._calmonth').css('display')=="block"){
                close_info_popup('cal_popup_plancheck');
                close_info_popup('cal_popup_planinfo');
            }
        }
    }else if(option == 'member_info_PC'){
        $('#memberRegHistory_info_PC, #memberRepeat_info_PC, #memberLectureHistory_info_PC').html('')
        $('#memberInfoPopup_PC').removeClass('display_block')
        if($('#pshade').css('z-index')==150 || $('#mshade').css('z-index') == 150){

        }else{
            shade_index(-100)
        }
    }else if(option == 'member_add'){
        $('body').css('overflow-y','auto');
        if(bodywidth<600){
            $('#page_managemember').show();
            $('#float_btn_wrap').show();
            $('#float_btn').removeClass('rotate_btn');
        }
        $('#page_addmember').hide();

        $('#float_btn').show();
        $('#page-base').show();
        $('#page-base-addstyle').hide();

        $('.ptaddbox input,#memberDue_add_2, .ptaddbox textarea').val("");
        $('#birth_year, #birth_month, #birth_date').find('option:first').prop('selected', true)
        $('#birth_year, #birth_month, #birth_date').css('color','#cccccc')
        if($('#memberInfoPopup_PC').css('display')=="block"){
            shade_index(100)
        }else if($('#mshade').css('z-index')==150){
            shade_index(150)
        }
        else{
            shade_index(-100)
        }
    }else if(option == 'group_add'){
        if(bodywidth < 600){
            $('#page_managemember').show();
            $('#float_btn_wrap').show();
            $('#float_btn').removeClass('rotate_btn');
        }
        $('#page_addgroup').hide();

        $('#float_btn').show();
        $('#page-base').show();
        $('#page-base-addstyle').hide();

        $('.ptaddbox input,#memberDue_add_2, .ptaddbox textarea').val("");

        if($('#memberInfoPopup_PC').css('display')=="block"){
            shade_index(100)
        }else if($('#mshade').css('z-index')==150){
            shade_index(150)
        }
        else{
            shade_index(-100)
        }
    }
};

function initialize_add_member_sheet(){
    $('#id_search_confirm').val('0');
    $('#form_member_groupid').val('')
    $('#memberLastName_add').prop('disabled',false);
    $('#memberFirstName_add').prop('disabled',false);
    $('#memberPhone_add').prop('disabled',false);
    $('#memberEmail_add').prop('disabled',false);
    $('#birth_year').prop('disabled',false);
    $('#birth_month').prop('disabled',false);
    $('#birth_date').prop('disabled',false);

    if($('#page_addmember .btnCallSimple').hasClass('selectbox_checked')){
        $('#fast_check').val('0')
    }else if($('#page_addmember .btnCallManual').hasClass('selectbox_checked')){
        $('#fast_check').val('1')
    }

    $('.ptaddbox input,#memberDue_add_2').val("");
    $('#birth_year, #birth_month, #birth_date').find('option:first').prop('selected', true)
    $('#birth_year, #birth_month, #birth_date').css('color','#cccccc')

    $('#form_birth').val('')

    $('.dropdown_selected').removeClass('dropdown_selected')
    $('.checked').removeClass('checked')
    $('.ptersCheckboxInner').removeClass('ptersCheckboxInner')
    $('#memberSex div').removeClass('selectbox_checked')
    $('.submitBtnActivated').removeClass('submitBtnActivated')

    //그룹추가관련 입력 초기화
    $('.subpopup_addGroup').hide()
    $('#addedMemberListBox div').remove()
    $('#addedMemberListBox span').text('0 명')
    added_New_Member_Num = 0
    //그룹추가관련 입력 초기화
}




//서버로부터 회원의 반복일정 정보를 받아온다.
function get_indiv_repeat_info(dbID){
    $.ajax({
        url: '/trainer/get_member_repeat_schedule/',
        type:'GET',
        data: {"member_id": dbID},
        dataType : 'html',

        beforeSend:function(){
            //beforeSend(); //ajax 로딩이미지 출력
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show()
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if($('body').width() < 600){
                    set_indiv_repeat_info(dbID, jsondata, 'mobile')
                }else{
                    set_indiv_repeat_info(dbID, jsondata, 'pc')
                }
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
function set_indiv_repeat_info(dbID, jsondata, PCorMobile){
    if(PCorMobile == "pc"){
        var $regHistory =  $('#memberRepeat_info_PC')
    }else if(PCorMobile == "mobile"){
        var $regHistory = $('#memberRepeat_info')
    }
    if(Options.language == "KOR"){
        var text = '시'
        var text2 = '시간'
        var text3 = '반복 : '
    }else if(Options.language == "JPN"){
        var text = '時'
        var text2 = '時間'
        var text3 = '繰り返し : '
    }else if(Options.language == "ENG"){
        var text = ''
        var text2 = 'h'
        var text3 = 'Repeat : '
    }
    var repeat_info_dict= { 'KOR':
        {'DD':'매일', 'WW':'매주', '2W':'격주',
            'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일'},
        'JPN':
            {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日'},
        'JAP':
            {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat'}
    }
    var len = jsondata.ptRepeatScheduleIdArray.length
    var dbId = dbID
    var repeat_id_array = jsondata.ptRepeatScheduleIdArray
    var repeat_type_array = jsondata.ptRepeatScheduleTypeArray
    var repeat_day_info_raw_array = jsondata.ptRepeatScheduleWeekInfoArray
    var repeat_start_array = jsondata.ptRepeatScheduleStartDateArray
    var repeat_end_array = jsondata.ptRepeatScheduleEndDateArray
    var repeat_time_array = jsondata.ptRepeatScheduleStartTimeArray
    var repeat_endTime_array = jsondata.ptRepeatScheduleEndTimeArray
    var repeat_dur_array = jsondata.ptRepeatScheduleTimeDurationArray

    var schedulesHTML = []
    for(var i=0; i<jsondata.ptRepeatScheduleIdArray.length; i++){
        var repeat_group_name = jsondata.ptRepeatScheduleGroupNameArray[i];
        var repeat_group_type = "["+jsondata.ptRepeatScheduleGroupTypeCdNameArray[i]+"]";
        if(repeat_group_name.length == 0 ){
            repeat_group_name = "";
        }
        var repeat_title = repeat_group_type+' '+repeat_group_name;


        var repeat_id = repeat_id_array[i]
        var repeat_type = repeat_info_dict[Options.language][repeat_type_array[i]]
        var repeat_start = repeat_start_array[i].replace(/-/gi,".");
        var repeat_start_text = "<span class='summaryInnerBoxText_Repeatendtext'>"+text3+"</span>"
        //var repeat_end_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복종료 : </span>"
        var repeat_end_text = ""
        var repeat_end = repeat_end_array[i].replace(/-/gi,".");
        var repeat_time = Number(repeat_time_array[i].split(':')[0]) // 06 or 18
        var repeat_min = Number(repeat_time_array[i].split(':')[1])  // 00 or 30

        var repeat_start_time = repeat_time_array[i].split(':')[0] +':'+ repeat_time_array[i].split(':')[1]
        var repeat_end_time = repeat_endTime_array[i].split(':')[0] +':'+ repeat_endTime_array[i].split(':')[1]

        var repeat_day =  function(){
            var repeat_day_info_raw = repeat_day_info_raw_array[i].split('/')
            var repeat_day_info = ""
            if(repeat_day_info_raw.length>1){
                for(var j=0; j<repeat_day_info_raw.length; j++){
                    var repeat_day_info = repeat_day_info + '/' + repeat_info_dict[Options.language][repeat_day_info_raw[j]].substr(0,1)
                }
            }else if(repeat_day_info_raw.length == 1){
                var repeat_day_info = repeat_info_dict[Options.language][repeat_day_info_raw[0]]
            }
            if(repeat_day_info.substr(0,1) == '/'){
                var repeat_day_info = repeat_day_info.substr(1,repeat_day_info.length)
            }
            return repeat_day_info
        };
        var summaryInnerBoxText_title = '<p class="summaryInnerBoxText">'+repeat_title+'</p>'
        var summaryInnerBoxText_1 = '<p class="summaryInnerBoxText">'+repeat_type +' '+repeat_day() +' '+repeat_start_time+' ~ '+repeat_end_time+'</p>'
        var summaryInnerBoxText_2 = '<p class="summaryInnerBoxText">'+repeat_start_text+repeat_start+' ~ '+repeat_end_text+repeat_end+'</p>'
        var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin" data-dbid="'+dbId+'" data-deletetype="repeatinfo" data-repeatid="'+repeat_id+'"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>'
        schedulesHTML[i] = '<div class="summaryInnerBox" data-repeatid="'+repeat_id+'">'+summaryInnerBoxText_title+summaryInnerBoxText_1+summaryInnerBoxText_2+deleteButton+'</div>'
    }
    $regHistory.html(schedulesHTML.join(''))
}
//회원등록////////////////////////////////////////////////////////

//개인의 반복일정을 지운다
function send_repeat_delete_personal(repeat_schedule_id, use, callback){
    $.ajax({
        url:'/schedule/delete_repeat_schedule/',
        type:'POST',
        data:{"repeat_schedule_id" : repeat_schedule_id, "next_page" : '/trainer/get_trainer_schedule/'},
        dataType:'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{

                if(jsondata.push_lecture_id.length>0){
                    for(var i=0; i<jsondata.push_lecture_id.length; i++) {
                        send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i])
                    }
                }
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(use == "callback"){
                    callback(jsondata)
                }
            }
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        },
    })
}

function send_push_func(lecture_id, title, message){

    $.ajax({
        url: '/schedule/send_push_to_trainee/',
        type : 'POST',
        dataType: 'html',
        data : {"lecture_id":lecture_id, "title":title, "message":message, "next_page":'/trainer/get_error_info/'},

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
        },

        success:function(response){
            console.log(response);
        },

        complete:function(){
            completeSend();
        },

        error:function(){
            console.log('server error')
        }
    })
}

//그룹의 반복일정을 지운다
function send_repeat_delete_group(repeat_schedule_id, use, callback){
    $.ajax({
        url:'/schedule/delete_group_repeat_schedule/',
        type:'POST',
        data:{"repeat_schedule_id" : repeat_schedule_id, "next_page" : '/trainer/get_error_info/'},
        dataType:'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend()
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show()
                $('#errorMessageText').text(jsondata.messageArray)
            }else{

                if(jsondata.push_lecture_id.length>0){
                    for(var i=0; i<jsondata.push_lecture_id.length; i++) {
                        send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i])
                    }
                }
                if(use == 'callback'){
                    callback(jsondata)
                }
            }
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend()
        },

        //통신 실패시 처리
        error:function(){
            alert("Server Error: \nSorry for inconvenience. \nPTERS server is unstable now.")
            completeSend()
        },
    })
}


//ajax 로딩이미지 표기
function beforeSend(){
    // $('html').css("cursor","wait");
    $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
    $('.ajaxloadingPC').show();
}

//ajax 로딩이미지 숨기기
function completeSend(){
    ////$('html').css("cursor","auto");
    $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
    $('.ajaxloadingPC').hide();
    //alert('complete: 일정 정상 등록')
}

function numberWithCommas(x) { //천단위 콤마 찍기
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
