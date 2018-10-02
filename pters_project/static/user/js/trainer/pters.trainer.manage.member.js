$(document).ready(function(){

    //ESC키를 눌러서 팝업 닫기
    $(document).keyup(function(e){
        if(e.keyCode == 27){
            if($('#cal_popup_plandelete').css('display') == 'block'){
                close_info_popup('cal_popup_plandelete');
            }else if($('#page_addmember').css('display') == 'block'){
                close_manage_popup('member_add');
            }else if($('#memberInfoPopup_PC').css('display') == 'block'){
                close_manage_popup('member_info_PC');
            }
        }
    });
    //ESC키를 눌러서 팝업 닫기

    $('.hastooltips').click(function(e){
        e.stopPropagation();
        var $title = $(this).find(".mobile_title_popup");
        if( !$title.length ){
            $(this).append('<span class="mobile_title_popup" style="position:absolute;top:20px;background:white;border:1px solid #cccccc;padding:4px;left:0;max-width:100%;">'+$(this).find(".mobile_title").val()+'</span>');
        }else{
            $title.remove();
        }
    });

    $(document).on('click', '.phonesms', function(e){
        e.stopPropagation();
    });

    $('form button').click(function(e){
        e.preventDefault();
    });
    var db_id_flag = 0;
    var user_id_flag = 1;
    var filter = "win16|win32|win64|mac|macintel";
    var platform_check;
    // var browser_check;
    // var agent = navigator.userAgent.toLowerCase();
    if ( navigator.platform ) {
        if ( filter.indexOf( navigator.platform.toLowerCase() ) < 0 ) {
            //mobile
            platform_check = 'mobile';
        }else{
            //pc
            platform_check = 'pc';
        }
    }

    // if (agent.indexOf("safari") != -1) {
    //     browser_check = 'safari';
    // }
    // if (agent.indexOf("chrome") != -1) {
    //     browser_check = 'chrome';
    // }
    // if (agent.indexOf("firefox") != -1) {
    //     browser_check = 'firefox';
    // }

    $(".btn-group > .btn").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
    });

    $('.list_switch').click(function(){
        $(this).addClass("list_switch_selected").siblings().removeClass("list_switch_selected");
    });




    $('li').click(function(){
        if($('#calendar').length==0){
            if($('.dropdown').hasClass('open')){
                $('html, body').css('overflow-y','auto');
            }else{
                $('html, body').css('overflow-y','hidden');
            }
        }
    });

////////////신규 회원등록 레이어 팝업 띄우기//////////////////////////////////////////////////////////////




////////////신규 회원등록 레이어 팝업 띄우기//////////////////////////////////////////////////////////////

    $('.alignSelect').change(function(){
        //var jsondata = global_json
        if($(this).val()=="회원명 가나다 순" || $(this).val()=="名前順" || $(this).val()=="Name" ){
            if($('#currentMemberList').css('display') == "block"){
                get_member_ing_list("callback",function(jsondata){
                    memberListSet('current','name','no',jsondata);
                });
            }else if($('#finishedMemberList').css('display') == "block"){
                get_member_end_list("callback",function(jsondata){
                    memberListSet('finished','name','no',jsondata);
                });
            }
            alignType = 'name';
        }else if($(this).val()=="남은 횟수 많은 순" || $(this).val()=="残り回数が多い" || $(this).val()=="Remain Count(H)"){
            if($('#currentMemberList').css('display') == "block"){
                get_member_ing_list("callback",function(jsondata){
                    memberListSet('current','count','yes',jsondata);
                });
            }else if($('#finishedMemberList').css('display') == "block"){

            }

            alignType = 'countH'
        }else if($(this).val()=="남은 횟수 적은 순" || $(this).val()=="残り回数が少ない" || $(this).val()=="Remain Count(L)"){
            if($('#currentMemberList').css('display') == "block"){
                get_member_ing_list("callback",function(jsondata){
                    memberListSet('current','count','no',jsondata);
                });
            }else if($('#finishedMemberList').css('display') == "block"){

            }
            alignType = 'countL'
        }else if($(this).val()=="시작 일자 과거 순" || $(this).val()=="開始が過去" || $(this).val()=="Start Date(P)"){
            if($('#currentMemberList').css('display') == "block"){
                get_member_ing_list("callback",function(jsondata){
                    memberListSet('current','date','no',jsondata);
                });
            }else if($('#finishedMemberList').css('display') == "block"){
                get_member_end_list("callback",function(jsondata){
                    memberListSet('finished','date','no',jsondata);
                });
            }
            alignType = 'startP'
        }else if($(this).val()=="시작 일자 최근 순" || $(this).val()=="開始が最近" || $(this).val()=="Start Date(R)"){
            if($('#currentMemberList').css('display') == "block"){
                get_member_ing_list("callback",function(jsondata){
                    memberListSet('current','date','yes',jsondata);
                });
            }else if($('#finishedMemberList').css('display') == "block"){
                get_member_end_list("callback",function(jsondata){
                    memberListSet('finished','date','yes',jsondata);
                });
            }
            alignType = 'startR'
        }
    });

//#####################회원정보 팝업 //#####################

    $(document).on('click', '.memberline', function(){  //회원이름을 클릭했을때 새로운 팝업을 보여주며 정보를 채워준다.
        var bodywidth = window.innerWidth;
        var dbID = $(this).find('._id').attr('data-dbid');
        shade_index(100);
        if(bodywidth < 600){
            get_indiv_member_info(dbID);
            get_indiv_repeat_info(dbID);
            get_member_lecture_list(dbID);
            get_member_history_list(dbID);
        }else if(bodywidth >= 600){
            $('body').css('overflow-y','hidden');
            get_indiv_member_info(dbID);
            get_indiv_repeat_info(dbID);
            get_member_lecture_list(dbID);
            get_member_history_list(dbID);
            $('#info_shift_base, #info_shift_lecture').show();
            $('#info_shift_schedule, #info_shift_history').hide();
            $('#select_info_shift_lecture').addClass('button_active');
            $('#select_info_shift_schedule, #select_info_shift_history').removeClass('button_active');
        }
        shade_index(100);
    });

    //PC 회원 이력 엑셀 다운로드 버튼 (회원목록에서)
    $(document).on('click','._manage img._info_download',function(e){
        e.stopPropagation();
        // var memberID = $(this).parent('td').siblings('.id').text();
        var dbID = $(this).parent('td').siblings('._id').attr('data-dbid');
        if(platform_check == 'mobile'){
            alert('엑셀 다운로드는 PC에서만 다운로드 가능합니다.');
        }else{
            alert('회원님 정보를 엑셀 다운로드를 시작합니다.\n 브라우저의 다운로드 창을 확인 해주세요.');
            location.href="/trainer/export_excel_member_info/?member_id="+dbID;
        }
    });

    //PC 회원 이력 엑셀 다운로드 버튼 (회원정보창에서)
    $(document).on('click','button._info_download',function(){
        var selector_memberInfoPopup_PC = $('#memberInfoPopup_PC');
        // var memberID = selector_memberInfoPopup_PC.attr('data-userid');
        var dbID = selector_memberInfoPopup_PC.attr('data-dbid');
        if(platform_check == 'mobile'){
            alert('엑셀 다운로드는 PC에서만 다운로드 가능합니다.');
        }else {
            alert('회원님 정보를 엑셀 다운로드를 시작합니다.\n 브라우저의 다운로드 창을 확인 해주세요.');
            location.href = "/trainer/export_excel_member_info/?member_id=" + dbID;
        }
    });

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
            alert('엑셀 다운로드는 PC에서만 다운로드 가능합니다.');
        }else{
            if($('#currentMemberList').css('display') == "block"){ //진행중인 회원 전체 목록
                alert('회원님 정보를 엑셀 다운로드를 시작합니다.\n 브라우저의 다운로드 창을 확인 해주세요.');
                location.href = "/trainer/export_excel_member_list/?finish_flag=0";
            }else if($('#finishedMemberList').css('display') == "block"){ //종료된 회원 전체 목록
                alert('회원님 정보를 엑셀 다운로드를 시작합니다.\n 브라우저의 다운로드 창을 확인 해주세요.');
                location.href = "/trainer/export_excel_member_list/?finish_flag=1";
            }else if($('#currentGroupList').css('display') == "block"){ //진행중인 그룹 전체 목록
                alert('진행중 그룹 전체 목록 다운로드!!');
            }else if($('#finishedGroupList').css('display') == "block"){ //종료된 그룹 전체 목록
                alert('종료된 그룹 전체 목록 다운로드!!');
            }
        }
    });


    modify_member_base_info_eventGroup();
    function modify_member_base_info_eventGroup(){
        if(varUA.match('firefox')){
            $('#memberName_info_lastName_PC, #memberName_info_lastName').bind('keydown',function(e){
                var keyCode = e.which || e.keyCode;
                if(keyCode === 13 || keyCode === 9){
                    $('#form_lastname_modify').val($(this).val());
                }
            });

            $('#memberName_info_firstName_PC, #memberName_info_firstName').bind('keydown',function(e){
                var keyCode = e.which || e.keyCode;
                if(keyCode === 13 || keyCode === 9){
                    $('#form_firstname_modify').val($(this).val());
                }
            });
        }else{
            $('#memberName_info_lastName_PC, #memberName_info_lastName').keyup(function(){
                $('#form_lastname_modify').val($(this).val());
            });

            $('#memberName_info_firstName_PC, #memberName_info_firstName').keyup(function(){
                $('#form_firstname_modify').val($(this).val());
            });
        }

        $('#memberPhone_info, #memberPhone_info_PC').keyup(function(){
            $('#form_phone_modify').val($(this).val());
        });


        //Mobile 버전 회원정보창 생년월입 드랍다운
        $('#birth_year_info, #birth_month_info, #birth_date_info').change(function(){
            var selector_birth_year_info = $('#birth_year_info');
            var selector_birth_month_info = $('#birth_month_info');
            var selector_birth_date_info = $('#birth_date_info');
            var birth = selector_birth_year_info.val().replace(/년/gi,'')+'-'+selector_birth_month_info.val().replace(/월/gi,'')+'-'+ selector_birth_date_info.val().replace(/일/gi,'');
            if(selector_birth_year_info.val().length < 1 || selector_birth_month_info.val().length < 1 || selector_birth_date_info.val().length < 1){
                $('#form_birth_modify').val('');
            }else{
                $('#form_birth_modify').val(birth);
            }
        });

        //PC버전 회원정보창 생년월입 드랍다운
        $('#memberBirth_Year_info_PC, #memberBirth_Month_info_PC, #memberBirth_Date_info_PC').change(function(){
            var birth = $('#memberBirth_Year_info_PC').val().replace(/년/gi,'')+'-'+$('#memberBirth_Month_info_PC').val().replace(/월/gi,'')+'-'+$('#memberBirth_Date_info_PC').val().replace(/일/gi,'');
            $('#form_birth_modify').val(birth);

        });

    }


    //PC 회원삭제버튼 (회원목록에서)
    $(document).on('click','._manage img._info_delete',function(e){
        e.stopPropagation();
        deleteTypeSelect = "memberinfodelete";
        var selectedUserId = $(this).parent('td').siblings('._id').text();
        var selectedUserName = $(this).parent('td').siblings('._tdname').text();
        var text = "회원 삭제";
        var text2 = "정말 ";
        var text3 = " 회원님을 삭제하시겠습니까?<br>삭제하면 복구할 수 없습니다.</p>";
        if(Options.language == "JPN"){
            text = "メンバー削除";
            text2 = "<p>";
            text3 = "様の情報や記録を削除しますか。<br>復旧できません。</p>";
        }else if(Options.language == "ENG"){
            text =　"Delete Member";
            text2 = "<p>Are you sure to delete ";
            text3 = "'s data?</p>";
        }
        $('#popup_delete_title').text(text);
        $('#popup_delete_question').html(text2+selectedUserName+text3);


        $('#deleteMemberId').val(selectedUserId);
        //$('.confirmPopup').fadeIn('fast');
        $('#cal_popup_plandelete').show();
        shade_index(150);
    });

    //PC & Mobile 회원삭제버튼 (회원정보창에서)
    $(document).on('click','button._info_delete',function(){
        //$('.confirmPopup').fadeIn('fast');
        deleteTypeSelect = "memberinfodelete";
        $('#cal_popup_plandelete').show();
        $('#popup_delete_question').html('정말 회원님을 삭제하시겠습니까? <br> 삭제하면 복구할 수 없습니다.');
        shade_index(300);
    });


    //회원 등록이력 수정 버튼
    $(document).on('click','#memberRegHistory_info_PC img, #memberRegHistory_info img',function(){
        var bodywidth = window.innerWidth;
        var text = "완료";
        if(Options.language == "JPN"){
            text = "決定";
        }else if(Options.language == "ENG"){
            text =　"OK";
        }

        var dbID = $(this).attr('data-dbid');
        // var userName = $(this).attr('data-username');
        var lectureID = $(this).attr('data-leid');

        if($(this).attr('data-type')=="view" && !$(this).hasClass('disabled_button')){
            var myRow;
            var myRowSelect;
            var myNoteRow;
            var myRowParent;
            if(bodywidth < 600){
                myRow = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').siblings('div').find('input');
                myRowSelect = $(this).parent('div').siblings('div.whatGroupType').find('select');
                myNoteRow = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').siblings('div.mobile_member_note').find('input');
                myRowParent = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').siblings('div');
            }else if(bodywidth >= 600){
                myRow = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').find('input');
                myRowSelect = $('select[data-leid='+$(this).attr('data-leid')+']');
                myNoteRow = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').siblings('div[data-leid='+$(this).attr('data-leid')+']').find('input');
                myRowParent = $(this).parent('div').siblings('div')
            }
            myRow.addClass('input_available').attr('disabled',false);
            myRowSelect.addClass('input_available').attr('disabled',false);
            myNoteRow.addClass('input_available').attr('disabled',false);
            var myStartDate = myRowParent.find('.lec_start_date').val();
            var myEndDate = myRowParent.find('.lec_end_date').val();
            var myPrice = myRowParent.find('#regPrice').val();
            var myRegCount = myRowParent.find('.lec_reg_count').val();

            $('#memberRegHistory_info_PC img[data-leid!='+$(this).attr('data-leid')+']').hide();
            $(this).text(text).attr('data-type',"modify");
            $('img.regHistoryModifyBtn[data-type="view"]').addClass('disabled_button');
            $(this).attr('src','/static/user/res/btn-pt-complete.png');
            $('#form_member_dbid').val(dbID);
            $('#form_lecture_id').val(lectureID);
            $('#form_start_date').val(date_format_yyyymmdd_to_yyyymmdd_split(myStartDate,'-'));
            $('#form_end_date').val(date_format_yyyymmdd_to_yyyymmdd_split(myEndDate,'-'));
            $('#form_price').val(myPrice);
            $('#form_lecture_reg_count').val(myRegCount);
            $('#form_note').val(myNoteRow.val());

        }else if($(this).attr('data-type')=="modify"){
            var selector_from_price = $('#form_price');
            $('img.regHistoryModifyBtn[data-type="view"]').removeClass('disabled_button');
            selector_from_price.val(selector_from_price.val().replace(/,/gi,''));
            send_member_modified_data(dbID);
        }else if($(this).attr('data-type')=="resend"){

        }
    });



    $('#popup_delete_btn_no, #cal_popup_plandelete .popup_close_x_button').click(function(){
        if(!$('._calmonth') && !$('._calweek')){
            close_info_popup('cal_popup_plandelete');
        }
    });

    $('#select_info_shift_lecture').click(function(){
        $('#info_shift_lecture').show();
        $('#info_shift_schedule').hide();
        $('#info_shift_history').hide();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});\
        $(this).addClass('button_active');
        $(this).siblings('.button_shift_info').removeClass('button_active');
    });

    $('#select_info_shift_schedule').click(function(){
        $('#info_shift_lecture').hide();
        $('#info_shift_schedule').show();
        $('#info_shift_history').hide();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});
        $(this).addClass('button_active');
        $(this).siblings('.button_shift_info').removeClass('button_active');
    });

    $('#select_info_shift_history').click(function(){
        $('#info_shift_lecture').hide();
        $('#info_shift_schedule').hide();
        $('#info_shift_history').show();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});
        $(this).addClass('button_active');
        $(this).siblings('.button_shift_info').removeClass('button_active');
    });

    $('#select_info_shift_lecture_mobile').click(function(){
        $('#mobile_lecture_info').show();
        $('#mobile_repeat_info').hide();
        $('#mobile_history_info').hide();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});\
        $(this).addClass('button_active');
        $(this).siblings('.button_shift_info').removeClass('button_active');
    });

    $('#select_info_shift_schedule_mobile').click(function(){
        $('#mobile_lecture_info').hide();
        $('#mobile_repeat_info').show();
        $('#mobile_history_info').hide();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});
        $(this).addClass('button_active');
        $(this).siblings('.button_shift_info').removeClass('button_active');
    });

    $('#select_info_shift_history_mobile').click(function(){
        $('#mobile_lecture_info').hide();
        $('#mobile_repeat_info').hide();
        $('#mobile_history_info').show();
        //$(this).css({'color':'#ffffff','background':'#fe4e65'});
        //$(this).siblings('.button_shift_info').css({'color':'#888888','background':'#f1f1f1'});
        $(this).addClass('button_active');
        $(this).siblings('.button_shift_info').removeClass('button_active');
    });


    //
    $(document).on('click','div.lectureType_RJ',function(){
        $('#shade_caution').show();
        $('.resendPopup').show().attr({'data-type':'resend',
            'data-leid':$(this).attr('data-leid'),
            'data-dbid':$(this).attr('data-dbid'),
            'data-name':$(this).attr('data-name')});
        show_shadow_reponsively();
    });

    //미연결
    $(document).on('click', 'div.lectureType_DELETE', function(){
        $('#shade_caution').show();
        $('.resendPopup').show().attr({'data-type':'resend',
            'data-leid':$(this).attr('data-leid'),
            'data-dbid':$(this).attr('data-dbid'),
            'data-name':$(this).attr('data-name')});
        show_shadow_reponsively();
    });

    //연결됨, 대기
    $(document).on('click', 'div.lectureType_WAIT, div.lectureType_VIEW', function(){
        $('#shade_caution').show();
        $('.lectureConnectStateChangePopup').show().attr({  'data-type':'resend',
                                                            'data-leid':$(this).attr('data-leid'),
                                                            'data-dbid':$(this).attr('data-dbid'),
                                                            'data-name':$(this).attr('data-name'),
                                                        });
        show_shadow_reponsively();
    });


    //진행중
    $(document).on('click', 'div.lecConnectType_IP', function(){
        var bodywidth = window.innerWidth;
        var selector_lectureStateChangeSelectPopup = $('.lectureStateChangeSelectPopup');
        //$('.lectureRefundPopup').fadeIn('fast').attr({'data-type':'resend','data-leid':$(this).attr('data-leid')});
        $('#shade_caution').show();
        selector_lectureStateChangeSelectPopup.show().attr({'data-leid':$(this).attr('data-leid'),
                                                            'data-dbid':$(this).attr('data-dbid'),
                                                            'data-username':$(this).parents('._member_info_popup').attr('data-username'),
                                                            'data-userid':$(this).parents('._member_info_popup').attr('data-userid'),
                                                            'data-grouptype': ''
                                                        });
        $('._resume, ._delete').css('display', 'none');
        if(bodywidth > 600){
            $('._complete, ._refund').css('display', 'inline-block');
        }else{
            $('._complete, ._refund').css('display', 'block');
        }
        selector_lectureStateChangeSelectPopup.find('._explain').html('※진행완료 : 남은 횟수를 0으로 만들고 종료 처리<br>※환불 : 환불 금액을 입력하고 종료 처리');
        show_shadow_reponsively();
    });

    //진행완료 텍스트를 클릭했을때
    $(document).on('click','div.lecConnectType_PE',function(){
        var bodywidth = window.innerWidth;
        var selector_lectureStateChangeSelectPopup = $('.lectureStateChangeSelectPopup');
        //$('.lectureRefundPopup').fadeIn('fast').attr({'data-type':'resend','data-leid':$(this).attr('data-leid')});
        $('#shade_caution').show();
        selector_lectureStateChangeSelectPopup.show().attr({'data-leid':$(this).attr('data-leid'),
                                                            'data-dbid':$(this).attr('data-dbid'),
                                                            'data-username':$(this).parents('._member_info_popup').attr('data-username'),
                                                            'data-userid':$(this).parents('._member_info_popup').attr('data-userid'),
                                                            'data-grouptype': ''
                                                        });
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
        $('#shade_caution').show();
        selector_lectureStateChangeSelectPopup.show().attr({'data-leid':$(this).attr('data-leid'),
                                                            'data-dbid':$(this).attr('data-dbid'),
                                                            'data-username':$(this).parents('._member_info_popup').attr('data-username'),
                                                            'data-userid':$(this).parents('._member_info_popup').attr('data-userid'),
                                                            'data-grouptype': ''
                                                        });
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
        $('#shade_caution').hide();
        hide_shadow_responsively();
    });

    $('span.resend').parent('div').click(function(){
        var selectore_resendPopup = $('.resendPopup');
        var lectureID = selectore_resendPopup.attr('data-leid');
        var dbID = selectore_resendPopup.attr('data-dbid');
        resend_member_reg_data_pc(lectureID, dbID);
        selectore_resendPopup.css('display','none');
        $('#shade_caution').hide();
        $('#shade3').css('display','none');
    });

    $('span.cancel_resend').parent('div').click(function(){
        $('.resendPopup').css('display','none');
        $('#shade_caution').hide();
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

    //진행 완료 처리 버튼
    $('.lectureStateChangeSelectPopup ._complete').click(function(){
        if($('.lectureStateChangeSelectPopup').attr('data-grouptype') != "group"){
            var selectore_lectureStateChangeSelectPopup = $('.lectureStateChangeSelectPopup');
            var lectureID = selectore_lectureStateChangeSelectPopup.attr('data-leid');
            var dbID = selectore_lectureStateChangeSelectPopup.attr('data-dbid');
            complete_member_reg_data_pc(lectureID, dbID);
            selectore_lectureStateChangeSelectPopup.css('display', 'none');
            $('#shade_caution').hide();
        }
    });

    //재개 처리 버튼
    $('.lectureStateChangeSelectPopup ._resume').click(function(){
        if($('.lectureStateChangeSelectPopup').attr('data-grouptype') != "group"){
            if(!$(this).hasClass('disabled_button')){
                var selectore_lectureStateChangeSelectPopup = $('.lectureStateChangeSelectPopup');
                var lectureID = selectore_lectureStateChangeSelectPopup.attr('data-leid');
                var dbID = selectore_lectureStateChangeSelectPopup.attr('data-dbid');
                resume_member_reg_data_pc(lectureID, dbID);
                selectore_lectureStateChangeSelectPopup.css('display','none');
                $('#shade_caution').hide();
            }else{
                show_caution_popup(
                                    '<p style="color:#fe4e65;">수강 자동 완료 기능이 활성화 상태입니다.</p>'+
                                        '<div style="width:95%;border:1px solid #cccccc;margin:0 auto;padding-top:10px;margin-bottom:10px;">'+
                                            '<p>- 옵션에서 수강 자동완료 해제 혹은<br>- 종료일자를 오늘 이후 날짜로 설정해주세요.</p>'+
                                        '</div>'+
                                    '<p>확인 후 다시 시도해주세요.</p>'
                                    );
            }
        }
    });

    //삭제 처리 버튼
    $('.lectureStateChangeSelectPopup ._delete').click(function(){
        var selectore_lectureStateChangeSelectPopup = $('.lectureStateChangeSelectPopup');
        var lectureID = selectore_lectureStateChangeSelectPopup.attr('data-leid');
        var dbID = selectore_lectureStateChangeSelectPopup.attr('data-dbid');
        delete_member_reg_data_pc(lectureID, dbID);
        selectore_lectureStateChangeSelectPopup.css('display', 'none');
        $('#shade_caution').hide();
    });

    //환불 입력으로 이동 버튼
    $('.lectureStateChangeSelectPopup ._refund').click(function(){
        var selectore_lectureStateChangeSelectPopup = $('.lectureStateChangeSelectPopup');
        selectore_lectureStateChangeSelectPopup.css('display','none');
        $('.lectureRefundPopup').css('display','block').attr({'data-leid':selectore_lectureStateChangeSelectPopup.attr('data-leid'),
                                                            'data-username':selectore_lectureStateChangeSelectPopup.attr('data-username'),
                                                            'data-dbid':selectore_lectureStateChangeSelectPopup.attr('data-dbid')
        });
        $('#datepicker_refund').val(today_YY_MM_DD);
    });

    $('.lectureStateChangeSelectPopup ._cancel').click(function(){
        $('.lectureStateChangeSelectPopup').css('display','none');
        $('#shade_caution').hide();
        hide_shadow_responsively();
    });


    $('span.refund').parent('div').click(function(){
        var selectore_lectureRefundPopup = $('.lectureRefundPopup');
        var lectureID = selectore_lectureRefundPopup.attr('data-leid');
        var dbID = selectore_lectureRefundPopup.attr('data-dbid');
        var refund_price = $('div.lectureRefundPopup input[name="refund_price"]').val().replace(/,/gi,'');
        var refund_date = $('#datepicker_refund').val();
        refund_member_lecture_data(lectureID, dbID, refund_price, refund_date);
        selectore_lectureRefundPopup.css('display','none');
        $('#shade_caution').hide();
    });

    $('.lectureRefundPopup input').keyup(function(){
        var priceInputValue = Number($(this).val().replace(/,/g, ""));
        $(this).val(numberWithCommas(priceInputValue));

    });

    $("#datepicker_refund").datepicker({
        onSelect : function(curDate, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
            if( curDate != instance.lastVal ){
               
            }
        }
    });

    $('span.cancel_refund').parent('div').click(function(){
        $('.lectureRefundPopup').css('display','none');
        $('#shade_caution').hide();
        hide_shadow_responsively();
    });


    $('span.connectchange').parent('div').click(function(){
        var selectore_lectureStateChangeSelectPopup = $('.lectureConnectStateChangePopup');
        var stateCode =  $(this).attr('data-stat');
        var lectureID = selectore_lectureStateChangeSelectPopup.attr('data-leid');
        var dbID =selectore_lectureStateChangeSelectPopup.attr('data-dbid');
        disconnect_member_lecture_data(stateCode, lectureID, dbID);
        selectore_lectureStateChangeSelectPopup.css('display','none');
        $('#shade_caution').hide();
    });

    $('span.cancel_connectchange').parent('div').click(function(){
        $('.lectureConnectStateChangePopup').css('display','none');
        $('#shade_caution').hide();
        hide_shadow_responsively();
    });





    //회원 정보팝업의 일정정보내 반복일정 취소버튼
    $(document).on('click','.deleteBtn',function(e){ //일정요약에서 반복일정 오른쪽 화살표 누르면 휴지통 열림
        e.stopPropagation();
        var $btn = $(this).find('div');
        if($btn.css('width')=='0px'){
            $btn.animate({'width':'40px'},300);
            $btn.find('img').css({'display':'block'});
            $('.deleteBtnBin').not($btn).animate({'width':'0px'}, 230);
            $('.deleteBtnBin img').not($btn.find('img')).css({'display':'none'});
        }
    });


    $(document).on('click', 'div.deleteBtnBin', function(e){
        e.stopPropagation();
        var id_info = $(this).parents('div.summaryInnerBox').attr('data-id');
        $('#id_repeat_schedule_id_confirm').val(id_info);
        $('#cal_popup_plandelete').show().attr({'data-repeatid':$(this).attr('data-repeatid'), 'data-dbid':$(this).attr('data-dbid'), 'data-groupid':$(this).attr('data-groupid')});
        $('#popup_delete_title').text('');
        $('#popup_delete_question').html('선택한 반복 일정을 취소 하시겠습니까?');

        if($(this).attr('data-deletetype') == 'grouprepeatinfo'){
            deleteTypeSelect = 'grouprepeatinfodelete';
            shade_index(100);
        }else if($(this).attr('data-deletetype') == 'repeatinfo'){
            deleteTypeSelect = 'repeatinfodelete';
            if($("._calmonth").length ==1 ){

            }else{
                shade_index(300);
            }
        }else if($(this).attr('data-deletetype') == 'class'){
            deleteTypeSelect = 'repeatptdelete';
            shade_index(200);
        }else if($(this).attr('data-deletetype') == 'off'){
            deleteTypeSelect = 'repeatoffdelete';
            shade_index(200);
        }else if($(this).attr('data-deletetype') == 'group'){
            deleteTypeSelect = 'repeatgroupptdelete';
            shade_index(200);
        }

    });

    $(document).on('click', '.summaryInnerBox', function(e){ //반복일정 텍스트 누르면 휴지통 닫힘
        e.stopPropagation();
        var $btn = $('.deleteBtnBin');
        $btn.animate({'width':'0px'},230);
        $btn.find('img').css({'display':'none'});
    });


    $('#popup_delete_btn_yes').click(function(){
        var bodywidth = window.innerWidth;
        //if($('#calendar').length==0){
        var repeat_schedule_id;
        var group_id;
        if(deleteTypeSelect == "repeatinfodelete"){
            var dbID = $(this).parent('#cal_popup_plandelete').attr('data-dbid');
            repeat_schedule_id = $(this).parent('#cal_popup_plandelete').attr('data-repeatid');
            send_repeat_delete_personal(repeat_schedule_id, 'callback', function(jsondata){
                get_indiv_repeat_info(dbID);
                get_member_lecture_list(dbID);
                get_member_history_list(dbID);
                enable_delete_btns_after_ajax();
                close_info_popup('cal_popup_plandelete');
                deleteTypeSelect = "memberinfodelete";
                if($('#calendar').length!=0){
                    ajaxClassTime();
                    $('#members_mobile, #members_pc').html('');
                    get_current_member_list();
                    get_current_group_list();
                    get_member_group_class_ing_list("callback", function(jsondata){
                        var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
                        var member_Html = memberlist.html;
                        var group_class_Html = group_class_ListHtml('current', jsondata);
                        $('#currentGroupList').html(group_class_Html);
                    });
                }
            });
        }else if(deleteTypeSelect == "memberinfodelete"){
            deleteMemberAjax();
            enable_delete_btns_after_ajax();
            close_manage_popup('member_info');
            close_manage_popup('member_info_PC');
        }else if(deleteTypeSelect == "groupdelete"){
            var groupmember_fullnames = group_delete_JSON.fullnames;
            var groupmember_ids = group_delete_JSON.ids;
            group_id = group_delete_JSON.group_id;

            //그룹을 지운다.
            delete_group_from_list(group_delete_JSON.group_id);
            //그룹원들에게서 그룹에 대한 수강이력을 지운다.
            delete_groupmember_from_grouplist();
            enable_delete_btns_after_ajax();

            group_delete_JSON.group_id = "";
            group_delete_JSON.fullnames = [];
            group_delete_JSON.ids = [];
            close_info_popup('cal_popup_plandelete');
        }else if(deleteTypeSelect == "grouprepeatinfodelete"){
            group_id = $(this).parent('#cal_popup_plandelete').attr('data-groupid');
            repeat_schedule_id = $(this).parent('#cal_popup_plandelete').attr('data-repeatid');
            send_repeat_delete_group(repeat_schedule_id, 'callback', function(){
                enable_delete_btns_after_ajax();
                close_info_popup('cal_popup_plandelete');
                get_group_repeat_info(group_id);
                if(bodywidth >= 600){
                    $('#calendar').css('position','relative');
                }else{
                    get_current_member_list();
                    get_current_group_list();
                    get_member_group_class_ing_list("callback", function(jsondata){
                        var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
                        var member_Html = memberlist.html;
                        var group_class_Html = group_class_ListHtml('current', jsondata);
                        $('#currentGroupList').html(group_class_Html);
                    });
                }

            });
            // get_member_repeat_id_in_group_repeat(repeat_schedule_id, 'callback', function(jsondata){
            //     for(var i=0; i<jsondata.repeatScheduleIdArray.length; i++){
            //         send_repeat_delete_personal(jsondata.repeatScheduleIdArray[i])
            //     }
            // })
        }
        function disable_delete_btns_during_ajax(){
            $('#popup_delete_btn_yes, #popup_delete_btn_no').addClass('disabled_button');
            //ajax_block_during_delete_weekcal = false;
        }

        function enable_delete_btns_after_ajax(){
            $('#popup_delete_btn_yes, #popup_delete_btn_no').removeClass('disabled_button');
            //ajax_block_during_delete_weekcal = false;
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
                    $('#errorMessageBar').show();
                    $('#errorMessageText').text(jsondata.messageArray);
                }else{
                    if(use == "callback"){
                        callback(jsondata);
                    }
                }
            },

            complete:function(){
                completeSend();
            },

            error:function(){
                $('#errorMessageBar').show();
                $('#errorMessageText').text('통신 에러: 관리자 문의');
            }
        })
    }




//#####################회원정보 팝업 //#####################



//#####################회원정보 도움말 팝업 //#####################
    $('._regcount, ._remaincount').mouseenter(function(){
        var text = '등록횟수는 회원님께서 계약시 등록하신 횟수를 의미합니다.';
        var text2 = '남은횟수는 회원님의 등록횟수에서 현재까지 진행완료된 강의 횟수를 뺀 값을 의미합니다.';
        if(Options.language == "JPN"){
            text = "登録回数はメンバーが契約時に登録した回数です。";
            text2 = "残り回数はメンバーの登録回数から現在まで進行完了した授業回数をひいた値です。";
        }else if(Options.language == "ENG"){
            text =　"Regisration Count means total lesson counts.";
            text2 = "Remain counts = Registration count - completed lesson count";
        }
        var LOCTOP = $(this).offset().top;
        var LOCLEFT = $(this).offset().left;
        if($('#currentMemberList').width()>=600){
            $('.instructPopup').show().css({'top':LOCTOP+40,'left':LOCLEFT});
        }

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
        e.preventDefault();
        var searchID = $('#memberSearch_add').val();
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
                    var selectore_memberSex = $('#memberSex .selectboxopt');
                    selectore_memberSex.removeClass('selectbox_checked');
                    fill_member_info_by_ID_search();
                    $('#memberSearchButton').attr('data-type','searched');
                    selectore_memberSex.addClass('selectbox_disable');
                    $('._ADD_MEMBER_NEW').show();
                }

            },

            //통신 실패시 처리
            error:function(){
                $('#errorMessageBar').show();
                $('#errorMessageText').text('아이디를 입력해주세요');
            }
        });
    });

    $("#datepicker_add, #datepicker2_add").datepicker({
        //minDate : 0,
        onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
            $(this).css({
                             "-webkit-text-fill-color":'#282828'
                        })

            var selector_datepicker_add = $("#datepicker_add");
            var selector_datepicker2_add = $("#datepicker2_add");

            $(this).addClass("dropdown_selected");
            selector_datepicker2_add.datepicker('option','minDate',selector_datepicker_add.val());
            //selector_datepicker_add.datepicker('option','maxDate',selector_datepicker2_add.val());
            check_dropdown_selected();
        }
    });


    $("#datepicker_fast").datepicker({
        //minDate : 0,
        onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
            $(this).css({
                            "-webkit-text-fill-color":'#282828'
                        });

            $(this).addClass("dropdown_selected");
            autoDateInput();
            check_dropdown_selected();
        }
    });

    $("#memberDue_add_2_fast").datepicker({
        //minDate : 0,
        onSelect:function(dateText, inst){  //달력날짜 선택시 하단에 핑크선
            var selectedStartDate = $('#datepicker_fast').val();
            if( selectedStartDate == undefined || selectedStartDate.length == 0 ){
                $(this).datepicker('setDate', null).removeClass("dropdown_selected");
                show_caution_popup('<p style="color:#fe4e65;">날짜 선택</p>'+
                                    '<div style="width:95%;border:1px solid #cccccc;margin:0 auto;padding-top:10px;margin-bottom:10px;">'+
                                        '<p>시작 일자를 먼저 선택해주세요</p>'+
                                    '</div>');
            }else if(compare_date2( dateText, selectedStartDate ) == false){
                $(this).datepicker('setDate', selectedStartDate).removeClass("dropdown_selected");
                show_caution_popup('<p style="color:#fe4e65;">종료일자가 시작일자보다 앞섭니다.</p>'+
                                    '<div style="width:95%;border:1px solid #cccccc;margin:0 auto;padding-top:10px;margin-bottom:10px;">'+
                                        '<p>종료일자는 시작날짜 이후로 선택해주세요.</p>'+
                                    '</div>');
            }else{
                $(this).addClass("dropdown_selected");
            }
            var $datepicker = $('div._due');
            $datepicker.find('.checked').removeClass('checked ptersCheckboxInner');
            $datepicker.find('td[data-check="0"]').find('.ptersCheckbox').addClass('checked');
            $datepicker.find('td[data-check="0"]').find('.ptersCheckbox').find('div').addClass('checked ptersCheckboxInner');


            $(this).css({
                            "-webkit-text-fill-color":'#282828'
                        });

            check_dropdown_selected();
        }
    });


    $(document).on("focus","input.lec_start_date, input.lec_end_date",function(){
        $(this).datepicker({
            onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
                $('#'+$(this).attr('data-type').replace(/lec_/gi,'form_')).val($(this).val());
                var startDatepicker = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').find('input.lec_start_date');
                var endDatepicker = $(this).parents('div[data-leid='+$(this).attr('data-leid')+']').find('input.lec_end_date');
                //$("input.lec_end_date").datepicker('option','minDate',startDatepicker.val());
                //$("input.lec_start_date").datepicker('option','maxDate',endDatepicker.val());
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
            var selector_memberLastName_add = $('#memberLastName_add');
            var selector_memberFirstName_add = $('#memberFirstName_add');

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
                $('#form_name').val(selector_memberLastName_add.val()+selector_memberFirstName_add.val());
                $('#add_member_form_first_name').val(selector_memberFirstName_add.val());
                $('#add_member_form_last_name').val(selector_memberLastName_add.val());
                $('#add_member_form_name').val(selector_memberLastName_add.val()+selector_memberFirstName_add.val());
            }
        });
    }else{
        $("#memberLastName_add, #memberFirstName_add").keyup(function(){  //이름 입력시 하단에 핑크선
            var selector_memberLastName_add = $('#memberLastName_add');
            var selector_memberFirstName_add = $('#memberFirstName_add');
            if($(this).val().length>=1){
                limit_char(this);
                $(this).addClass("dropdown_selected");
                check_dropdown_selected();
            }else{
                limit_char(this);
                $(this).removeClass("dropdown_selected");
                check_dropdown_selected();
            }
            $('#form_name').val(selector_memberLastName_add.val()+selector_memberFirstName_add.val());
            $('#add_member_form_first_name').val(selector_memberFirstName_add.val());
            $('#add_member_form_last_name').val(selector_memberLastName_add.val());
            $('#add_member_form_name').val(selector_memberLastName_add.val()+selector_memberFirstName_add.val());
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
        $('#id_phone').val($('#memberPhone_add').val());
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
        $(this).parent('div').siblings('.manualReg').hide();
        $(this).parent('div').siblings('.simpleReg').fadeIn('fast');
        $(this).addClass('selectbox_checked');
        $(this).siblings('.btnCallManual').removeClass('selectbox_checked');
        /*
        $('p, #datepicker_add').removeClass("dropdown_selected");
        $('#memberCount_add_fast').removeClass('dropdown_selected');
        $('#datepicker_add,#datepicker2_add,#memberCount_add,#lecturePrice_add_2').val("");
        */
        $('#fast_check').val('0');
        if($('._ADD_GROUPMEMBER_NEW').css('display') == 'none'){
            $('#form_member_groupid').val($('#simpleReg select.grouptypeselect').val());
        }
        check_dropdown_selected();
    });

    $('.btnCallManual').click(function(){
        $(this).parent('div').siblings('.simpleReg').hide();
        $(this).parent('div').siblings('.manualReg').fadeIn('fast');
        $(this).addClass('selectbox_checked');
        $(this).siblings('.btnCallSimple').removeClass('selectbox_checked');
        /*
        $('._due div.checked').removeClass('checked ptersCheckboxInner');
        $('._count div.checked').removeClass('checked ptersCheckboxInner');
        $('p, #datepicker_fast').removeClass("dropdown_selected");
        $('#datepicker_fast,#lecturePrice_add,#memberDue_add_2').val("");
        var selector_datepicker_add = $("#datepicker_add");
        var selector_datepicker2_add = $("#datepicker2_add");
        selector_datepicker2_add.datepicker('option','minDate',selector_datepicker_add.val());
        selector_datepicker_add.datepicker('option','maxDate',selector_datepicker2_add.val());
        */
        $('#fast_check').val('1');
        if($('._ADD_GROUPMEMBER_NEW').css('display') == 'none'){
            $('#form_member_groupid').val($('#manualReg select.grouptypeselect').val());
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
            check_dropdown_selected();
        }
    });

    //등록횟수(빠른입력방식) 선택
    /*
    $('._count .ptersCheckbox').parent('td').click(function(){
        $('._count div.checked').removeClass('checked ptersCheckboxInner');
        var pterscheckbox = $(this).find('div');
        $(this).find('div:nth-child(1)').addClass('checked');
        pterscheckbox.find('div').addClass('ptersCheckboxInner');
        var selector_memberCount_add_fast = $('#memberCount_add_fast');
        selector_memberCount_add_fast.val(pterscheckbox.attr('data-count'));
        selector_memberCount_add_fast.addClass("dropdown_selected");
        check_dropdown_selected();
    });
    */
    $('._count .ptersCheckbox').parent('td').click(function(){
        $('._count div.checked').removeClass('checked ptersCheckboxInner');
        var pterscheckbox = $(this).find('div');
        $(this).find('div:nth-child(1)').addClass('checked');
        pterscheckbox.find('div').addClass('ptersCheckboxInner');

        var selector_memberCount_add_fast = $('#memberCount_add_fast');
        selector_memberCount_add_fast.val(pterscheckbox.attr('data-count')).css({"-webkit-text-fill-color":'#282828'});
        selector_memberCount_add_fast.addClass("dropdown_selected");
        check_dropdown_selected();
    });

    $('#memberCount_add_fast').keyup(function(e){
        if($(this).val() > 0){
            $('#memberCount_add_fast').addClass("dropdown_selected");
        }else{
            $('#memberCount_add_fast').removeClass("dropdown_selected");
        }
        $('._count div.checked').removeClass('checked ptersCheckboxInner');
        var pterscheckbox = $("#userInputCount");
        pterscheckbox.addClass('checked');
        pterscheckbox.find('div').addClass('checked ptersCheckboxInner');
        check_dropdown_selected();
    });


    //등록유형 선택
    $('.grouptypeselect').change(function(){
        $('#form_member_groupid').val($(this).val());
    });
    //빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////

    //회원 등록 폼 작성후 완료버튼 클릭
    $("#upbutton-check, #pcBtn").click(function(e){
        e.preventDefault();
        //회원 추가, 재등록
        var selector_page_addmember = $('#page_addmember');
        var selector_ADD_GROUP_NEW = $('._ADD_GROUP_NEW');
        var selector_ADD_GROUPMEMBER_NEW = $('._ADD_GROUPMEMBER_NEW');
        if(selector_page_addmember.css('display')=='block' && selector_ADD_GROUP_NEW.css('display') == "none" && selector_ADD_GROUPMEMBER_NEW.css('display') == "none"){
            var id_search_confirm = $('#id_search_confirm').val();
            check_dropdown_selected();
            if(select_all_check == true){
                if(id_search_confirm==0){ //신규 회원을 직접 정보를 입력했을 때
                    add_member_form_noemail_func();
                }else{                    //회원을 PTERS에서 검색했을 때
                    add_member_form_func();
                }
            }else{
                scrollToDom(selector_page_addmember);
                //$('#errorMessageBar').show();
                //$('#errorMessageText').text('모든 필수 정보를 입력해주세요')
                //입력값 확인 메시지 출력 가능
            }

            //그룹 추가
        }else if(selector_page_addmember.css('display')=='block' && selector_ADD_GROUP_NEW.css('display') == "block"){
            check_dropdown_selected();
            if(select_all_check == true){
                add_group_form_func();
            }

            //그룹원 추가
        }else if(selector_page_addmember.css('display')=='block' && selector_ADD_GROUPMEMBER_NEW.css('display') == "block"){
            check_dropdown_selected();
            if(select_all_check == true){
                add_groupmember_form_func()
            }
        }


    });

    //PC 회원기본 정보 수정 버튼 (회원정보창에서)
    $(document).on('click','button._info_baseedit',function(){
        var selector_memberSex_info_PC_selectboxopt = $('#memberSex_info_PC .selectboxopt');
        if($(this).attr('data-view') == 'view'){
            $(this).attr('data-view','edit');
            $(this).find('img').attr('src','/static/user/res/btn-pt-complete.png');
            $('#memberPhone_info_PC, #memberBirth_select_wrap select, #memberName_info_PC, #memberName_info_lastName_PC, #memberName_info_firstName_PC').addClass('input_available').attr('disabled',false);
            selector_memberSex_info_PC_selectboxopt.show();
            $('#memberSex_info_PC .selectboxopt[value="'+$('#form_sex_modify').val()+'"]').addClass('selectbox_checked');

            $('#memberPhone_info_PC').attr('placeholder','숫자만 입력해주세요.');


            $('#memberName_info_PC').hide();
            $('#memberName_info_lastName_PC, #memberName_info_firstName_PC').show();


        }else if($(this).attr('data-view') == 'edit'){
            $(this).attr('data-view','view');
            $(this).find('img').attr('src','/static/user/res/icon-pencil.png');
            $('#memberPhone_info_PC, #memberBirth_select_wrap select, #memberName_info_PC, #memberName_info_lastName_PC, #memberName_info_firstName_PC').removeClass('input_available').attr('disabled',true);
            selector_memberSex_info_PC_selectboxopt.hide();
            $('#memberSex_info_PC .selectbox_checked').show().removeClass('selectbox_checked');

            $('#memberPhone_info_PC').attr('placeholder','');

            $('#memberName_info_PC').show().val($('#memberName_info_lastName_PC').val()+$('#memberName_info_firstName_PC').val());
            $('#memberName_info_lastName_PC, #memberName_info_firstName_PC').hide();

            send_modified_member_base_data();
        }
    });

    $('#upbutton-modify').click(function(){ //모바일 회원정보창에서 수정 눌렀을때
        var text = '회원 정보 수정';
        // var text2 = '모든 필수 정보를 입력해주세요';
        if(Options.language == "JPN"){
            text = 'メンバー情報変更';
            // text2 = '全ての必修情報を入力してください。';
        }else if(Options.language == "ENG"){
            text = 'Edit Member Info';
            // text2 = 'Please fill all input field';
        }
        if($(this).attr('data-type') == "view" ){
            $('#uptext3').text(text);
            $('#uptext-pc-modify').text(text);
            $(this).find('img').attr('src','/static/user/res/ptadd/btn-complete-checked.png');
            $('#upbutton-modify').attr('data-type','modify');
            $(this).attr('data-type','modify');

            $('#memberName_info').hide();
            $('#memberName_info_lastName, #memberName_info_firstName').show();

            $('#form_sex_modify').val();
            $('#form_birth_modify').val();
            $('#form_phone_modify').val();
            $('#form_name_modify').val();
            $('#form_id_modify').val($('#memberId').val());

            $('#mobile_basic_info #memberName_info, #mobile_basic_info #memberPhone_info, #mobile_basic_info select, #memberName_info_lastName, #memberName_info_firstName').attr('disabled',false).addClass('input_available');
            $('#memberInfoPopup button._info_delete').hide();

        }else if($(this).attr('data-type') == "modify" ){
            // if(select_all_check==false){
            send_modified_member_base_data();
            $('#memberName_info').show().val($('#memberName_info_lastName').val()+$('#memberName_info_firstName').val());
            $('#memberName_info_lastName, #memberName_info_firstName').hide();
            /*
             }else{
             scrollToDom($('#memberInfoPopup'));
             $('#errorMessageBar').show();
             $('#errorMessageText').text(text2);
             //입력값 확인 메시지 출력 가능
             }
             */
        }
    });

    $('#mshade_popup').click(function(){console.log(select_all_check)});


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
    var bodywidth = window.innerWidth;
    var $form = $('#member-add-form-modify');
    $.ajax({
        url:'/trainer/update_member_info/',
        type:'POST',
        data:$form.serialize(),
        dataType : 'html',

        beforeSend:function(){
            $('#upbutton-modify img').attr('src','/static/user/res/ajax/loading.gif');
        },

        //보내기후 팝업창 닫기
        complete:function(){

        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#upbutton-modify img').attr('src','/static/user/res/icon-pencil.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }
            else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    close_manage_popup('member_info');
                    //$('#page_managemember').show();
                    $('#page_managemember').css({'height':'100%'});
                }
                // $('html').css("cursor","auto");
                $('#upbutton-modify img').attr('src','/static/user/res/ptadd/icon-pencil.png');
                if($('#currentMemberList').css('display') == "block"){
                    get_member_ing_list("callback",function(jsondata){
                        memberListSet('current','date','yes',jsondata);
                    })
                }else if($('#finishedMemberList').css('display') == "block"){
                    get_member_end_list("callback",function(jsondata){
                        memberListSet('finished','date','yes',jsondata);
                    })
                }
                $('#startR').attr('selected', 'selected');
                console.log('success');

                if($('._calmonth').length == 1 || $('._calweek').length == 1){
                    ajaxClassTime();
                }
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}


function float_btn_managemember(option){
    var bodywidth = window.innerWidth;
    var text = '신규 회원 등록';
    if(Options.language == "JPN"){
        text = '新規会員登録'
    }else if(Options.language == "ENG"){
        text = 'Register New Member'
    }
    var selector_page_addmember = $('#page_addmember');
    if(option == 0){ //모바일 플로팅 버튼
        //$("#float_btn").animate({opacity:'1'});
        if($('#mshade').css('display')=='none'){
            $('#float_inner1').animate({'opacity':'1','bottom':'85px'},120);
            $('#float_inner2').animate({'opacity':'1','bottom':'145px'},120);
            $('#float_btn').addClass('rotate_btn');
            shade_index(100);
        }else{
            $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
            $('#float_btn').removeClass('rotate_btn');
            shade_index(-100);
        }
    }else if(option == 1){ //모바일 플로팅 버튼 신규회원 추가
        initialize_add_member_sheet();
        get_group_ing_list('callback', function(json){grouptype_dropdown_set(json)});
        selector_page_addmember.css('display','block');
        $('#upbutton-x, #upbutton-x-modify').attr('data-page','memberadd');
        $('#float_inner1,#float_inner2').css({'opacity':'0','bottom':'25px'});
        $('#float_btn_wrap').css('display','none');
        $('#uptext2').text(text);

        scrollToDom(selector_page_addmember);
        if(bodywidth < 600){
            //$('#page_managemember').hide();
            $('#page_managemember').css({'height':'0'});
            $('#page-base').css('display','none');
            $('#page-base-addstyle').css('display','block');
            shade_index(100);
        }

        $('#memberBirthDate, #memberBirthDate_info').html('');
        birth_dropdown_set();

        $('#memberSearchButton').attr('data-type','');
        $('#memberSex .selectboxopt').removeClass('selectbox_disable');
        if($('._nomember').length>0){
            $('#how_to_add_member').show();
        }else{
            $('#how_to_add_member').css('display','none');
        }
        $('._ADD_MEMBER_NEW, ._SEARCH_MEMBER_NEW, ._ADD_MEMBER_REG').show();
        $('._ADD_GROUP_NEW, ._ADD_GROUPMEMBER_NEW').hide();
    }else if(option == "group"){
        initialize_add_member_sheet();
        $('#upbutton-x, #upbutton-x-modify').attr('data-page','memberadd');
        $('#page_addmember').show();
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').hide();

        scrollToDom($('#page_addmember'));
        if(bodywidth < 600){
            //$('#page_managemember').hide();
            $('#page_managemember').css({'height':'0'});
            $('#page-base').css('display','none');
            $('#page-base-addstyle').css('display','block');
            shade_index(100);
        }

        $('#grouptype').hide();
        $('#explain_group_lesson').show();
        $('#explain_open_lesson').hide();

        $('#grouptype option[value="NORMAL"]').attr({'selected':true,'disabled':true});
        $('#form_grouptype').val('NORMAL');
        $('#addgrouptypename').text('신규 그룹');

        $('#uptext2, #uptext2_PC').text('신규 그룹 추가');

        $('._ADD_MEMBER_NEW, ._ADD_MEMBER_REG ,._SEARCH_MEMBER_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        //$('._ADD_GROUPMEMBER_NEW').show()
        $('._ADD_GROUP_NEW').show();
        shade_index(100);

    }else if(option == "openlesson"){
        initialize_add_member_sheet();
        $('#upbutton-x, #upbutton-x-modify').attr('data-page','memberadd');
        $('#page_addmember').show();
        $('#shade').hide();
        $('#shade3').show();
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').hide();

        scrollToDom($('#page_addmember'));
        if(bodywidth < 600){
            //$('#page_managemember').hide();
            $('#page_managemember').css({'height':'0'});
            $('#page-base').css('display','none');
            $('#page-base-addstyle').css('display','block');
            shade_index(100);
        }

        $('#grouptype').hide();
        $('#explain_open_lesson').show();
        $('#explain_group_lesson').hide();
        $('#grouptype option[value="EMPTY"]').attr({'selected':true,'disabled':true});
        $('#form_grouptype').val('EMPTY');
        $('#addgrouptypename').text('신규 클래스');

        $('#uptext2, #uptext2_PC').text('신규 클래스 추가');

        $('._ADD_MEMBER_NEW, ._ADD_MEMBER_REG ,._SEARCH_MEMBER_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('._ADD_GROUP_NEW').show();
        shade_index(100);
    }else if(option == "groupmember"){
        initialize_add_member_sheet();
        $('#upbutton-x, #upbutton-x-modify').attr('data-page','memberadd');
        selector_page_addmember.show();
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').hide();

        scrollToDom(selector_page_addmember);
        if(bodywidth < 600){
            //$('#page_managemember').hide();
            $('#page_managemember').css({'height':'0'});
            $('#page-base').css('display','none');
            $('#page-base-addstyle').css('display','block');
            shade_index(100);
        }

        $('._ADD_MEMBER_NEW, ._SEARCH_MEMBER_NEW, ._ADD_GROUP_NEW').hide();
        $('._ADD_GROUPMEMBER_NEW, ._ADD_MEMBER_REG').show();
    }
}

//PC버전 회원추가 버튼

function pc_add_member(option){
    var text = '신규 회원 등록';
    var text2 = '회원 재등록';
    if(Options.language == "JPN"){
        text = '新規会員登録';
        text2 = '再登録';
    }else if(Options.language == "ENG"){
        text = 'New Contract';
        text2 = 'Re-Contract';
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

        $('body').css('overflow-y', 'hidden');
        selector_page_addmember_input_wrap.css('height',window_height - 100 - title_height - buttonwrap_height);
        var centerLoc = (($(window).height()-selector_page_addmember.outerHeight())/2+$(window).scrollTop());
        selector_page_addmember.show().css({'top':centerLoc,
                                            'left':(($(window).width()-selector_page_addmember.outerWidth())/2+$(window).scrollLeft())
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

        selector_memberSearchButton.attr('data-type', '');
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
            regEnddate.push($(this).val().replace(/\./gi,'-'));
        });

        $('#datepicker_fast').datepicker('setDate', find_max_date(regEnddate)).addClass("dropdown_selected");
        $('#memberDue_add_2_fast').datepicker('setDate', find_max_date(regEnddate)).addClass("dropdown_selected");
        $('#datepicker_add').datepicker('setDate', find_max_date(regEnddate)).addClass("dropdown_selected");
        $('#datepicker2_add').datepicker('option', 'minDate', find_max_date(regEnddate));

        check_dropdown_selected();
        /*회원정보창에서 수강추가를 했을때 가장마지막 종료일을 시작일로 셋팅해준다.*/

        selector_memberSearchButton.trigger('click');

        $('body').css('overflow-y','hidden');
        selector_page_addmember_input_wrap.css('height', window_height - 100 - title_height - buttonwrap_height);
        var centerLoc = (($(window).height()-selector_page_addmember.outerHeight())/2+$(window).scrollTop());
        selector_page_addmember.show().css({'top':centerLoc,
            'left':(($(window).width()-selector_page_addmember.outerWidth())/2+$(window).scrollLeft())});

        get_group_ing_list('callback', function(json){grouptype_dropdown_set(json);});

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

        
        close_manage_popup('member_info');
        $('#page_managemember').css({'height':'0'});
        
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
        selector_page_addmember_input_wrap.css({'height':260+'px'});
        $('#grouptype').hide()
        $('#explain_group_lesson').show()
        $('#explain_open_lesson').hide()
        $('#grouptype option[value="NORMAL"]').attr({'selected':true,'disabled':true})
        $('#form_grouptype').val('NORMAL')
        $('#addgrouptypename').text('신규 그룹')

        $('#uptext2, #uptext2_PC').text('신규 그룹 추가');

        $('._ADD_MEMBER_NEW, ._ADD_MEMBER_REG ,._SEARCH_MEMBER_NEW, ._ADD_GROUPMEMBER_NEW').hide();
        $('._ADD_GROUP_NEW').show();

        $('body').css('overflow-y','hidden');
        $('#page_addmember').show().css({'top':(($(window).height()-$('#page_addmember').outerHeight())/2+$(window).scrollTop()),
            'left':(($(window).width()-$('#page_addmember').outerWidth())/2+$(window).scrollLeft())})

    }else if(option == 'openlesson'){
        initialize_add_member_sheet();
        selector_page_addmember_input_wrap.css({'height':260+'px'});

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
            'left':(($(window).width()-$('#page_addmember').outerWidth())/2+$(window).scrollLeft())});
    }
    shade_index(300);
}


//진행중 회원, 종료된 회원 리스트 스왑
function shiftMemberList(type){
    var selector_GROUP_THEAD_groupaddbutton = $('._GROUP_THEAD, ._groupaddbutton');
    var selector_MEMBER_THEAD__memberaddbutton = $('._MEMBER_THEAD, ._memberaddbutton, ._ALIGN_DROPDOWN');
    switch(type){
        case "current":
            get_member_ing_list("callback", function(jsondata){
                memberListSet('current','name','no',jsondata);
            });
            $('#currentMemberList, #memberNumber_current_member').css('display','block');
            $('#finishedMemberList, #memberNumber_finish_member, #memberNumber_current_group, #memberNumber_finish_group, #currentGroupList, #currentGroupNum, #finishedGroupList, #finishGroupNum').css('display','none');
            selector_GROUP_THEAD_groupaddbutton.hide();
            selector_MEMBER_THEAD__memberaddbutton.show();
            break;
        case "finished":
            //if($('#btnCallMemberList').hasClass('list_switch_selected')){
            get_member_end_list("callback", function(jsondata){
                memberListSet('finished','name','no',jsondata);
            });
            $('#finishedMemberList, #memberNumber_finish_member').css('display','block');
            $('#currentMemberList, #memberNumber_current_member, #memberNumber_current_group, #memberNumber_finish_group, #currentGroupList, #currentGroupNum, #finishedGroupList, #finishGroupNum').css('display','none');
            selector_GROUP_THEAD_groupaddbutton.hide();
            selector_MEMBER_THEAD__memberaddbutton.show();
            break;
    }
}

//진행중 클래스, 종료된 클래스 리스트 스왑
function shiftGroupClassList(type){
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

//진행중 클래스, 종료된 클래스 리스트 스왑 (통합)
function shiftPtGroupClassList(type){
    switch(type){
        case "current":
            get_member_group_class_ing_list("callback", function(jsondata){
                var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
                var member_Html = memberlist.html;
                var group_class_Html = group_class_ListHtml('current', jsondata);
                $('#currentGroupList').html(group_class_Html);
            });
            // get_member_ing_list("callback", function(jsondata){
            //     var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
            //     var member_Html = memberlist.html;
            //     var group_class_Html;
            //
            //     get_group_ing_list("callback", function(jsondata){
            //         group_class_Html = group_class_ListHtml('current', jsondata);
            //         $('#currentGroupList').html(group_class_Html);
            //     }); //그룹 + 클래스
            // });
            $('#currentGroupList, #memberNumber_current_group').css('display','block');
            $('#memberNumber_finish_group, #finishedGroupList, #finishGroupNum').css('display','none')
            $('._GROUP_THEAD, ._groupaddbutton').show()
            $('._MEMBER_THEAD, ._memberaddbutton, ._ALIGN_DROPDOWN').hide()
            break;
        case "finished":
            get_member_group_class_end_list("callback", function(jsondata){
                var memberlist = ptmember_ListHtml('finished', 'name', 'no', jsondata);
                var member_Html = memberlist.html;
                var group_class_Html = group_class_ListHtml('finished', jsondata);
                $('#finishedGroupList').html(group_class_Html);
            });
            // get_member_end_list("callback", function(jsondata){
            //     var memberlist = ptmember_ListHtml('finished', 'name', 'no', jsondata);
            //     var member_Html = memberlist.html;
            //     var group_class_Html;
            //
            //     get_group_end_list("callback", function(jsondata){
            //         group_class_Html = group_class_ListHtml('finished', jsondata);
            //         $('#finishedGroupList').html(group_class_Html);
            //     }); //그룹 + 클래스
            // });
            $('#finishedGroupList, #memberNumber_finish_group').css('display','block');
            $('#memberNumber_current_group, #currentGroupList, #currentGroupNum').css('display','none')
            $('._GROUP_THEAD, ._groupaddbutton').show()
            $('._MEMBER_THEAD, ._memberaddbutton, ._ALIGN_DROPDOWN').hide()
            break;
    }
}


//간편 가격입력
function priceInput(price, type, selector){
    var select = '';
    var loc = '';
    if(selector == 2){
        select = '_2';
        loc = "_fast";
    }else if(selector == 1){
        select = '';
        loc = '';
    }
    var selector_lecturPrice_add_select = $('#lecturePrice_add'+select);
    if(type == "sum"){
        var priceInputValue = selector_lecturPrice_add_select.val().replace(/,/g, "");
        priceInputValue = price + Number(priceInputValue);
        // selector_lecturPrice_add_select.val(numberWithCommas(priceInputValue)).attr('readonly',true).css('-webkit-text-fill-color','#282828');
        selector_lecturPrice_add_select.val(numberWithCommas(priceInputValue)).css('-webkit-text-fill-color', '#282828');
        $('#lecturePrice_add_value'+loc).val(priceInputValue);
    }else if(type == "del"){
        // selector_lecturPrice_add_select.val("").attr('readonly',false).css('-webkit-text-fill-color', '#cccccc');
        selector_lecturPrice_add_select.val("").css('-webkit-text-fill-color', '#cccccc');
        $('#lecturePrice_add_value'+loc).val(0);
    }
    check_dropdown_selected();
}
//수동 가격입력
$('#lecturePrice_add, #lecturePrice_add_2').keyup(function(){
    var priceInputValue = $(this).val().replace(/,/g, "");
    $(this).val(numberWithCommas(priceInputValue));
    $(this).siblings('input').val(priceInputValue);
    check_dropdown_selected();
});



//생일입력 드랍다운
function birth_dropdown_set(){
    var text = '연도';
    var text2 = '년';
    var text3 = '월';
    var text4 = '일';
    if(Options.language == "JPN"){
        text = '年';
        text2 = '年';
        text3 = '月';
        text4 = '日';
    }else if(Options.language == "ENG"){
        text = 'Birth';
        text2 = '.';
        text3 = '.';
        text4 = '';
    }
    var yearoption = ['<option selected disabled hidden>'+text+'</option>'];
    var i;
    for(i=2018; i>=1908; i--){
        yearoption.push('<option data-year="'+i+text2+'">'+i+text2+'</option>');
    }
    var birth_year_options = yearoption.join('');
    $('#birth_year, #birth_year_info, #memberBirth_Year_info_PC').html(birth_year_options);


    var monthoption = ['<option selected disabled hidden>'+text3+'</option>'];
    for(i=1; i<=12; i++){
        monthoption.push('<option data-month="'+i+text3+'">'+i+text3+'</option>');
    }
    var birth_month_options = monthoption.join('');
    $('#birth_month, #birth_month_info, #memberBirth_Month_info_PC').html(birth_month_options);


    var dateoption = ['<option selected disabled hidden>'+text4+'</option>'];
    for(i=1; i<=31; i++){
        dateoption.push('<option data-date="'+i+text4+'">'+i+text4+'</option>');
    }
    var birth_date_options = dateoption.join('');
    $('#birth_date, #birth_date_info, #memberBirth_Date_info_PC').html(birth_date_options);


    $('#birth_month, #birth_month_info').change(function(){
        var dateoption = ['<option selected disabled hidden>'+text4+'</option>'];
        var selector_birth_date_birth_date_info = $('#birth_date, #birth_date_info');
        selector_birth_date_birth_date_info.html("");
        var lastDay = [31,29,31,30,31,30,31,31,30,31,30,31];
        var month = $(this).val().replace(/월|月|\\./gi,"");
        for(var i=1; i<=lastDay[month-1]; i++){
            dateoption.push('<option data-date="'+i+text4+'">'+i+text4+'</option>');
        }
        var birth_date_options = dateoption.join('');
        selector_birth_date_birth_date_info.html(birth_date_options);
    });

    $('#birth_year, #birth_month, #birth_date').change(function(){
        $(this).addClass("dropdown_selected");
        $(this).css('color', '#282828');
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
    var optionsToJoin = ['<option value="">1:1 레슨</option>'];
    for(var i=0; i<len; i++){
        optionsToJoin.push('<option value="'+grouplistJSON.group_id[i]+'">['+grouplistJSON.group_type_cd_nm[i]+'] '+grouplistJSON.group_name[i]+'</option>');
    }
    $('.grouptypeselect').html(optionsToJoin.join(''));
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

    return {"countSorted":countListResult, "nameSorted":nameListResult, "dateSorted":dateListResult};
}

//DB데이터를 사전형태로 만드는 함수
function DataFormattingDict(Option, jsondata){
    var text = '진행중 : ';
    var text2 = '종료 : ';
    var text3 = '명';
    if(Options.language == "JPN"){
        text = '進行中 : ';
        text2 = '終了 : ';
        text3 = '名';
    }else if(Options.language == "ENG"){
        text = 'Ongoing : ';
        text2 = 'Finished : ';
        text3 = 'Person';
    }
    var DBlength;
    var DBendlength;
    var i;
    var j;
    var selector_currentMemberNum = $('#currentMemberNum');
    var selector_finishMemberNum = $('#finishMemberNum');
    switch(Option){
        case 'name':
            DBlength = jsondata.nameArray.length;
            for(i=0; i<DBlength;i++){
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
            DBendlength = finishnameArray.length;
            for(j=0; j<DBendlength;j++){
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
            selector_currentMemberNum.text(text+DBlength+text3);
            selector_finishMemberNum.text(text2+DBendlength+text3);
            break;

        case 'ID':
            DBlength = jsondata.idArray.length;
            for(i=0; i<DBlength;i++){
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
            DBendlength = jsondata.finishIdArray.length;
            for(j=0; j<DBendlength;j++){
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
            selector_currentMemberNum.text(text+DBlength+text3);
            selector_finishMemberNum.text(text2+DBendlength+text3);
            break;

        case 'DBID':
            DBlength = jsondata.dIdArray.length;
            for(i=0; i<DBlength;i++){
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
            DBendlength = jsondata.finishDidArray.length;
            for(j=0; j<DBendlength;j++){
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
            for(i=0; i<DBlength;i++){
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
            DBendlength = jsondata.finishDidArray.length;
            for(j=0; j<DBendlength;j++){
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
            selector_currentMemberNum.text(text+DBlength+text3);
            selector_finishMemberNum.text(text2+DBendlength+text3);
            break;
    }
}


//서버로부터 회원 목록 가져오기
var global_json;
function get_member_list(use, callback){
    var bodywidth = window.innerWidth;
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
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    //$('#page_managemember').show();
                    $('#page_managemember').css({'height':'100%',});
                }
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);

                }else{
                    //memberListSet('current','name','no',jsondata);
                    //memberListSet('finished','name','no',jsondata);
                }
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}


function get_member_ing_list(use, callback){
    var bodywidth = window.innerWidth;
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
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    //$('#page_managemember').show();
                    $('#page_managemember').css({'height':'100%'});
                }
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);

                }else{
                    //memberListSet('current','name','no',jsondata);
                }
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}

function get_member_end_list(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_member_end_list/',
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
            global_json = jsondata;
            if(jsondata.messageArray.length>0){
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    //$('#page_managemember').show();
                    $('#page_managemember').css({'height':'100%'});
                }
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);

                }else{
                    //memberListSet('finished','name','no',jsondata);
                }
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}

function get_member_one_to_one_ing_list(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_member_one_to_one_ing_list/',

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
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    //$('#page_managemember').show();
                    $('#page_managemember').css({'height':'100%'});
                }
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);

                }else{
                    //memberListSet('current','name','no',jsondata);
                }
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}

function get_member_one_to_one_end_list(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_member_one_to_one_end_list/',
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
            global_json = jsondata;
            if(jsondata.messageArray.length>0){
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    //$('#page_managemember').show();
                    $('#page_managemember').css({'height':'100%'});
                }
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);

                }else{
                    //memberListSet('finished','name','no',jsondata);
                }
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}


//스크롤 맨 아래나 위로 올라가면 +0 or -1픽셀
$('#page_managemember').scroll(function(){
    var scrollHeight = $(this).prop('scrollHeight');
    var popupHeight = $(this).height();
    var scrollLocation = $(this).scrollTop();
    //scrollHeight = popupHeight + scrollLocation(끝)
    if(popupHeight + scrollLocation == scrollHeight){
        $(this).animate({scrollTop : scrollLocation-1},10)
    }else if(popupHeight + scrollLocation == popupHeight){
        $(this).animate({scrollTop : scrollLocation+1},10)
    }
});
//스크롤 맨 아래나 위로 올라가면 +0 or -1픽셀


//회원목록을 테이블로 화면에 뿌리는 함수
function memberListSet (type,option,Reverse, jsondata){
    var bodywidth = window.innerWidth;
    var text = '소진시까지';
    var text2 = '이번달 신규회원';
    if(Options.language == "JPN"){
        text = '残余回数終わるまで';
        text2 = '今月新規メンバー';
    }else if(Options.language == "ENG"){
        text = '';
        text2 = 'New Member this month';
    }

    var tbodyStart = '<tbody>';
    var tbodyEnd = '</tbody>';
    var tbodyToAppend = $(tbodyStart);
    var data;
    var countList;
    var nameList;
    var dateList;
    var $table;
    var $tabletbody;
    var $membernum;
    var text_membernum;
    switch(type){
        case 'current':
            data = DataFormatting(jsondata);
            countList = data["countSorted"];
            nameList = data["nameSorted"];
            dateList = data["dateSorted"];
            $table = $('#currentMember');
            $tabletbody = $('#currentMember tbody');
            $membernum = $('#memberNumber_current_member');
            text_membernum = "진행중인 회원 ";
            break;
        case 'finished':
            data = DataFormatting(jsondata);
            countList = data["countSorted"];
            nameList = data["nameSorted"];
            dateList = data["dateSorted"];
            $table = $('#finishedMember');
            $tabletbody = $('#finishedMember tbody');
            $membernum = $('#memberNumber_finish_member');
            text_membernum = "종료된 회원 ";
            break;
    }

    var countLists;
    var nameLists;
    var dateLists;
    if(Reverse == 'yes'){
        countLists =countList.sort().reverse();
        nameLists = nameList.sort().reverse();
        dateLists = dateList.sort().reverse();
    }else{
        countLists =countList.sort();
        nameLists = nameList.sort();
        dateLists = dateList.sort();
    }

    var len = countLists.length;
    var arrayResult = [];
    var array;
    var email;
    var arrayforemail;
    var name;
    var id;
    var dbId;
    var contents;
    var count;
    var regcount;
    var starts;
    var ends;
    var phoneToEdit;
    var npCounts;
    var rjCounts;
    var yetRegCounts;
    var yetCounts;
    var groupType;
    var groupType2;
    var groupType3;

    for(var i=0; i<len; i++){
        if(option == "count"){
            array = countLists[i].split('/');
            email = array[8];
            name = array[2];
            id = array[3];
            dbId = array[13];
            contents = array[5];
            count = array[0];
            regcount = array[1];
            starts = array[6];
            ends = array[7];
            phoneToEdit = array[4].replace(/-| |/gi,"");
            if(name.length>10){
                name = array[2].substr(0,9)+'..';
            }
            npCounts = array[9];
            rjCounts = array[10];
            yetRegCounts = array[11];
            yetCounts = array[12];
            groupType = array[14];
            if(array[15]){
                groupType2 = '/'+array[15];
            }else{
                groupType2 = '';
            }
            if(array[16]){
                groupType3 = '/'+array[16];
            }else{
                groupType3 = '';
            }
        }else if(option == "name"){
            array = nameLists[i].split('/');
            email = array[8];
            name = array[0];
            id = array[1];
            dbId = array[13];
            contents = array[3];
            count = array[4];
            regcount = array[5];
            starts = array[6];
            ends = array[7];
            phoneToEdit = array[2].replace(/-| |/gi,"");
            if(name.length>10){
                name = array[0].substr(0,9)+'..';
            }
            npCounts = array[9];
            rjCounts = array[10];
            yetRegCounts = array[11];
            yetCounts = array[12];
            groupType = array[14];
            if(array[15]){
                groupType2 = '/'+array[15];
            }else{
                groupType2 = '';
            }
            if(array[16]){
                groupType3 = '/'+array[16];
            }else{
                groupType3 = '';
            }
        }else if(option == "date"){
            array = dateLists[i].split('/');
            arrayforemail = dateLists[i].split('/');
            email = array[8];
            name = array[1];
            id = array[2];
            dbId = array[13];
            contents = array[4];
            count = array[5];
            regcount = array[6];
            starts = array[0];
            ends = array[7];
            phoneToEdit = array[3].replace(/-| |/gi,"");
            if(name.length>10){
                name = array[1].substr(0,9)+'..';
            }
            npCounts = array[9];
            rjCounts = array[10];
            yetRegCounts = array[11];
            yetCounts = array[12];
            groupType = array[14];
            if(array[15]){
                groupType2 = '/'+array[15];
            }else{
                groupType2 = '';
            }
            if(array[16]){
                groupType3 = '/'+array[16];
            }else{
                groupType3 = '';
            }
        }

        var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2);
        var end = ends.substr(0,4)+'.'+ends.substr(4,2)+'.'+ends.substr(6,2);
        if(end == "9999.12.31"){
            end = text;
        }

        var newReg = "";
        if(starts.substr(0,4) == currentYear && Number(starts.substr(4,2)) == currentMonth+1){
            newReg = '<img src="/static/user/res/icon-new.png" title="'+text2+'" class="newRegImg">';
        }

        var phone;
        if(phoneToEdit.substr(0,2)=="02"){
            phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4);
        }else{
            phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4);
        }

        var npCountImg = "";
        if(npCounts == 0 && rjCounts == 0){
            npCountImg = '<img src="/static/user/res/icon-link.png" title="Connected" class="npCountImg_wait">';
        }else if(rjCounts > 0){
            npCountImg = '<img src="/static/user/res/icon-alert.png" title="Disconnected" class="npCountImg_x">';
        }

        var yetReg = "";
        var yet = "";
        if(yetRegCounts > 0){
            yetReg = '(+'+yetRegCounts+')';
        }
        if(yetCounts > 0){
            yet = '(+'+yetCounts+')';
        }



        count = remove_front_zeros(count);
        regcount = remove_front_zeros(regcount);

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
        if(phoneToEdit != ""){
            var mobiletd = '<td class="_contact">'+phoneimage+smsimage+'</td>';
        }else{
            var mobiletd = '<td class="_contact">-'+'</td>';
        }
        var pctd = '<td class="_manage">'+pcinfoimage+pceditimage+pcdownloadimage+pcdeleteimage+'</td>';
        var scrolltd = '<td class="forscroll"></td>';

        // var td = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+grouptypetd+idtd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+'</tr>';
        // arrayResult[i] = td;
        arrayResult[i] = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+grouptypetd+idtd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+'</tr>';
    }
    $membernum.html(text_membernum+'<span style="font-size:16px;">'+len+'</span>'+'명');


    var resultToAppend = arrayResult.join("");
    if(type=='current' && len == 0){
        resultToAppend = '<td class="forscroll _nomember" rowspan="9" style="height:50px;padding-top: 17px !important;">등록 된 회원이 없습니다.</td>';
        if(bodywidth > 600){
            $('#please_add_member_pc').show();
        }else{
            $('#please_add_member').show();
        }
    }else if(type=="finished" && len ==0){
        resultToAppend = '<td class="forscroll" rowspan="9" style="height:50px;padding-top: 17px !important;">종료 된 회원이 없습니다.</td>';
    }
    var result = tbodyStart + resultToAppend + tbodyEnd;
    $tabletbody.remove();
    $table.append(result);
}



//shade 보이기, 숨기기
function hide_shadow_responsively(){
    var bodywidth = window.innerWidth;
    if(bodywidth > 600){
        $('#shade3').css('display','none');
    }else{
        $('#shade').css('display','none');
    }
}

function show_shadow_reponsively(){
    var bodywidth = window.innerWidth;
    if(bodywidth > 600){
        $('#shade3').show();
    }else{
        $('#shade').show();
    }
}

//모든 입력란을 채웠을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
// function check_dropdown_selected(){
//     var emailInput = $("#memberEmail_add");
//     var lastnameInput = $("#memberLastName_add");
//     var firstnameInput = $("#memberFirstName_add");
//     var phoneInput = $("#memberPhone_add");
//     var countInput = $("#memberCount_add");
//     var startInput = $("#datepicker_add");
//     var endInput = $("#datepicker2_add");
//     var priceInput_detail = $('#lecturePrice_add').val();
//     var priceInput_fast = $('#lecturePrice_add_2').val();
//     //var sexInput = $('#form_sex').val();
//     var sexInput = "임시";

//     var countInput_fast = $("#memberCount_add_fast");
//     var dateInput_fast = $("#datepicker_fast");

//     var groupname = $('#groupname');
//     var grouptype = $('#grouptype');
//     var groupcapacity = $('#groupcapacity');


//     var fast = $('#fast_check').val();

//     //회원추가, 회원재등록 창일때
//     var selector_ADD_GROUP_NEW = $('._ADD_GROUP_NEW');
//     var selector_upbutton_check = $("#upbutton-check");
//     var selector_page_addmember_submitBtn_first_child = $('#page_addmember .submitBtn:first-child');
//     if(selector_ADD_GROUP_NEW.css('display')=="none" && $('._ADD_MEMBER_NEW').css('display')=="block"){
//         if(fast=='1'){
//             if((lastnameInput).hasClass("dropdown_selected")==true && (firstnameInput).hasClass("dropdown_selected")==true && (countInput).hasClass("dropdown_selected")==true && (priceInput_detail).length>0 && (startInput).hasClass("dropdown_selected")==true&&(endInput).hasClass("dropdown_selected")==true && sexInput.length>0){
//                 selector_upbutton_check.html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
//                 selector_page_addmember_submitBtn_first_child.addClass('submitBtnActivated');
//                 select_all_check=true;


//             }else{
//                 selector_upbutton_check.html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
//                 selector_page_addmember_submitBtn_first_child.removeClass('submitBtnActivated');
//                 select_all_check=false;
//             }
//         }
//         else{
//             if((lastnameInput).hasClass("dropdown_selected")==true && (firstnameInput).hasClass("dropdown_selected")==true && (countInput_fast).hasClass("dropdown_selected")==true && (priceInput_fast).length>0 && (dateInput_fast).hasClass("dropdown_selected")==true && sexInput.length>0){
//                 selector_upbutton_check.html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
//                 selector_page_addmember_submitBtn_first_child.addClass('submitBtnActivated');
//                 select_all_check=true;

//             }else{
//                 selector_upbutton_check.html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
//                 selector_page_addmember_submitBtn_first_child.removeClass('submitBtnActivated');
//                 select_all_check=false;
//             }
//         }
//         //그룹 추가 창일때
//     }else if(selector_ADD_GROUP_NEW.css('display')=="block"){
//         //if(groupname.val().length > 0 && grouptype.val().length > 0 && groupcapacity.val().length > 0){
//         if(groupname.val().length > 0 && $('#form_grouptype').val().length > 0 && groupcapacity.val().length > 0){

//             $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
//             $('#page_addmember .submitBtn:first-child').addClass('submitBtnActivated');
//             select_all_check=true;
//         }else{
//             $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
//             $('#page_addmember .submitBtn:first-child').removeClass('submitBtnActivated');
//             select_all_check=false;
//         }

//         //그룹원 추가 창일때
//     }else if($('._ADD_GROUPMEMBER_NEW').css('display')=="block"){
//         if(fast=='1'){ //상세 입력 방식
//             if((countInput).hasClass("dropdown_selected")==true && (priceInput_detail).length>0 && (startInput).hasClass("dropdown_selected")==true&&(endInput).hasClass("dropdown_selected")==true){
//                 $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
//                 $('#page_addmember .submitBtn:first-child').addClass('submitBtnActivated');
//                 select_all_check=true;
//             }else{
//                 $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
//                 $('#page_addmember .submitBtn:first-child').removeClass('submitBtnActivated');
//                 select_all_check=false;
//             }
//         }
//         else{   // 빠른 입력 방식
//             if((countInput_fast).hasClass("dropdown_selected")==true && (priceInput_fast).length>0 && (dateInput_fast).hasClass("dropdown_selected")==true){
//                 $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
//                 $('#page_addmember .submitBtn:first-child').addClass('submitBtnActivated');
//                 select_all_check=true;

//             }else{
//                 $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
//                 $('#page_addmember .submitBtn:first-child').removeClass('submitBtnActivated');
//                 select_all_check=false;
//             }
//         }
//     }

// }

function check_dropdown_selected(){
    var emailInput = $("#memberEmail_add");
    var lastnameInput = $("#memberLastName_add");
    var firstnameInput = $("#memberFirstName_add");
    var phoneInput = $("#memberPhone_add");
    var countInput = $("#memberCount_add");
    var startInput = $("#datepicker_add");
    var endInput = $("#datepicker2_add");
    var priceInput_detail = $('#lecturePrice_add').val();
    var priceInput_fast = $('#lecturePrice_add_2').val();
    //var sexInput = $('#form_sex').val();
    var sexInput = "임시";

    var countInput_fast = $("#memberCount_add_fast");
    var dateInput_fast = $("#datepicker_fast");
    var dueInput_fast = $("#memberDue_add_2_fast");

    var groupname = $('#groupname');
    var grouptype = $('#grouptype');
    var groupcapacity = $('#groupcapacity');


    var fast = $('#fast_check').val();

    //회원추가, 회원재등록 창일때
    var selector_ADD_GROUP_NEW = $('._ADD_GROUP_NEW');
    var selector_upbutton_check = $("#upbutton-check");
    var selector_page_addmember_submitBtn_first_child = $('#page_addmember .submitBtn:first-child');

    if(selector_ADD_GROUP_NEW.css('display')=="none" && $('._ADD_MEMBER_NEW').css('display')=="block"){
        if((lastnameInput).hasClass("dropdown_selected")==true && (firstnameInput).hasClass("dropdown_selected")==true && (countInput_fast).hasClass("dropdown_selected")==true && (priceInput_fast).length>0 && (dateInput_fast).hasClass("dropdown_selected")==true && (dueInput_fast).hasClass("dropdown_selected") == true && sexInput.length>0){
            selector_upbutton_check.html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
            selector_page_addmember_submitBtn_first_child.addClass('submitBtnActivated');
            select_all_check=true;

        }else{
            selector_upbutton_check.html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            selector_page_addmember_submitBtn_first_child.removeClass('submitBtnActivated');
            select_all_check=false;
        }
        //그룹 추가 창일때
    }else if(selector_ADD_GROUP_NEW.css('display')=="block"){
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

//빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택
// function autoDateInput(){
//     var text = '소진시까지';
//     var text2 = '선택';
//     if(Options.language == "JPN"){
//         text = '残余回数終わるまで';
//         text2 = '進行期間を選んでください。';
//     }else if(Options.language == "ENG"){
//         text = 'No cutoff';
//         text2 = 'Please enter contract period';
//     }

//     /// 빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택///// 
//     var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31];
//     var selected = $('#datepicker_fast').val();
//     var selectedDate = Number(selected.replace(/-/g, ""));
//     var selectedD = $('._due div.checked').parent('td').attr('data-check'); // 1,2,3,6,12,99
//     var selectedDue = Number(selectedD + '00');
//     var finishDate =  selectedDate+selectedDue;
//     var yy = String(finishDate).substr(0,4);
//     var mm = String(finishDate).substr(4,2);
//     var dd = String(finishDate).substr(6,2);


//     if(mm>12){ //해 넘어갈때 날짜처리
//         //var finishDate = finishDate + 10000 - 1200
//         yy = Number(yy)+1;
//         mm = Number(mm)-12;
//     }
//     if(String(mm).length<2){
//         mm = "0"+mm;
//     }
//     finishDate = yy +"-"+ mm +"-"+ dd;
//     if(dd>lastDay[Number(mm)-1]){
//         dd = Number(dd)-lastDay[Number(mm)-1];
//         mm = Number(mm)+1;
//         if(String(dd).length<2){
//             dd = "0"+dd;
//         }
//         if(String(mm).length<2){
//             mm = "0"+mm;
//         }
//         finishDate = yy +"-"+ mm +"-"+ dd;
//     }
//     var selector_memberDue_add_2 = $('#memberDue_add_2');
//     var selector_memberDue_add_2_fast = $('#memberDue_add_2_fast');
//     //selector_memberDue_add_2.val(finishDate);
//     selector_memberDue_add_2_fast.val(finishDate);
//     if(selectedD==99){
//         selector_memberDue_add_2_fast.text(text);
//         selector_memberDue_add_2_fast.val("9999-12-31");
//     }

//     if(selectedD==undefined){
//         selector_memberDue_add_2_fast.val(text2);
//     }

//     if(selectedD == 0){

//     }

//     if(selector_memberDue_add_2_fast.val()!=text2 && selector_memberDue_add_2_fast.val()!="" ){
//         selector_memberDue_add_2_fast.addClass("dropdown_selected");
//     }
//     selector_memberDue_add_2_fast.css({
//                                      "-webkit-text-fill-color":'#282828'
//                                 });
//     /// 빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택/////
// }

//빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택
function autoDateInput(){
    var text = '소진시까지';
    var text2 = '선택';
    if(Options.language == "JPN"){
        text = '残余回数終わるまで';
        text2 = '進行期間を選んでください。';
    }else if(Options.language == "ENG"){
        text = 'No cutoff';
        text2 = 'Please enter contract period';
    }

    /// 빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택/////
    var lastDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var selected = $('#datepicker_fast').val();
    var selectedDate = Number(selected.replace(/-/g, ""));
    var selectedD = $('._due div.checked').parent('td').attr('data-check'); // 1,2,3,6,12,99
    var selectedDue = Number(selectedD + '00');
    var finishDate =  selectedDate+selectedDue;
    var yy = String(finishDate).substr(0, 4);
    var mm = String(finishDate).substr(4, 2);
    var dd = String(finishDate).substr(6, 2);


    if(mm>12){ //해 넘어갈때 날짜처리
        //var finishDate = finishDate + 10000 - 1200
        yy = Number(yy)+1;
        mm = Number(mm)-12;
    }
    if(String(mm).length<2){
        mm = "0"+mm;
    }
    finishDate = yy +"-"+ mm +"-"+ dd;
    if(dd>lastDay[Number(mm)-1]){
        dd = lastDay[Number(mm)-1];
        finishDate = yy +"-"+ mm +"-"+ dd;
    }
    var selector_memberDue_add_2 = $('#memberDue_add_2');
    var selector_memberDue_add_2_fast = $('#memberDue_add_2_fast');
    //selector_memberDue_add_2.val(finishDate);
    selector_memberDue_add_2_fast.val(finishDate);
    if(selectedD==99){
        selector_memberDue_add_2_fast.text(text);
        selector_memberDue_add_2_fast.val("9999-12-31");
    }

    if(selectedD==undefined){
        selector_memberDue_add_2_fast.val(text2);
    }

    if(selectedD == 0){

    }

    if(selector_memberDue_add_2_fast.val()!=text2 && selector_memberDue_add_2_fast.val()!="" ){
        selector_memberDue_add_2_fast.addClass("dropdown_selected");
    }
    selector_memberDue_add_2_fast.css({
                                     "-webkit-text-fill-color":'#282828'
                                });
    /// 빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택/////
}

//특수문자 입력 제한
function limit_char(e){
    var limit =  /[~!@\#$%^&*\()\-=+_'|\:;\"\'\?.,/\\]/gi;
    var temp = $(e).val();
    if(limit.test(temp)){
        $(e).val(temp.replace(limit,""));
    }
}


//회원정보////////////////////////////////////////////////////////
//서버로부터 회원의 기본정보를 받아온다.
function get_indiv_member_info(dbID){
    var bodywidth = window.innerWidth;
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
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    open_member_info_popup_mobile(dbID, jsondata);
                }else{
                    open_member_info_popup_pc(dbID, jsondata);
                }

            }


        },

        complete:function(){
            //completeSend(); //ajax 로딩이미지 숨기기
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}

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

    $('#memberInfoPopup input, #memberInfoPopup select').removeClass('input_available').attr('disabled', true);
    selector_memberName_info.css('display', 'block');
    $('#memberName_info_lastName, #memberName_info_firstName').css('display', 'none');
    //$('#shade3').fadeIn('fast');
    //scrollToDom($('#page_managemember'));
    if(bodywidth < 600){
        //$('#page_managemember').hide();
        $('#page_managemember').css({'height':'0'});
        if($('._calmonth').length != 0 || $('._calweek').length != 0){
            $('#upbutton-modify, #mobile_basic_info .member_info_tool').css('display','none');
        }
    }

    $('#inputError_info').css('display', 'none');
    $('#fast_check').val('0');
    $('#form_birth').val('');
    $('#id_phone').val('');
}

modify_member_lec_info_pc();
//회원의 수강정보(등록횟수)를 수정한다.
function modify_member_lec_info_pc(){
    $(document).on('keyup','.lec_reg_count',function(){
        var remainCount = $(this).parent('div').siblings('.lec_rem_count').text();
        if(Number($(this).val()) >= Number(remainCount)){
            $(this).css('color', '#282828');
            $('#form_lecture_reg_count').val($(this).val());
        }else{
            $(this).css('color', 'red');
            $('#form_lecture_reg_count').val($(this).val());
        }
    });
    $(document).on('keyup', '#regPrice', function(){
        $('#form_price').val($(this).val());
    });

    $(document).on('keyup', '#lectureNote', function(){
        if($(this).val()==''){
            $('#form_note').val(' ');
        }else{
            $('#form_note').val($(this).val());
        }

    });
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
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                $('#startR').attr('selected','selected');
                $('#memberRegHistory_info_PC img').attr('src','/static/user/res/icon-pencil.png').show();
                get_member_list();
                get_member_lecture_list(dbID);
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
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

                get_member_list();
                get_member_lecture_list(dbID);
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
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
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }
            else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if($('#currentMemberList').css('display') == "block"){
                    get_member_ing_list("callback", function(jsondata){
                        memberListSet('current', 'date', 'yes', jsondata);
                    });
                }else if($('#finishedMemberList').css('display') == "block"){
                    get_member_end_list("callback", function(jsondata){
                        memberListSet('finished', 'date', 'yes', jsondata);
                    });
                }else if($("#calendar").length > 0 ){
                    $('#members_mobile, #members_pc').html('');
                    get_current_member_list();
                    get_current_group_list();
                    get_member_group_class_ing_list("callback", function(jsondata){
                        var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
                        var member_Html = memberlist.html;
                        var group_class_Html = group_class_ListHtml('current', jsondata);
                        $('#currentGroupList').html(group_class_Html);
                    });
                }
                if($('#calendar').length > 0){
                    ajaxClassTime();
                    close_info_popup('cal_popup_planinfo');
                    close_info_popup('cal_popup_plancheck');
                    shade_index(100);
                }
                get_member_lecture_list(dbID);
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
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
            }
            else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                $('#startR').attr('selected', 'selected');
                smart_refresh_member_group_class_list();

                if($('#calendar').length > 0){
                    ajaxClassTime();
                }
                get_member_lecture_list(dbID);
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
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
                $('#startR').attr('selected', 'selected');
                smart_refresh_member_group_class_list();

                get_member_lecture_list(dbID);
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}

//회원 환불 정보를 전송한다.
function refund_member_lecture_data(lectureID, dbID, refund_price, refund_date){
    var text = ' 환불 처리 되었습니다.';
    var text2 = '환불 금액을 입력해주세요.';
    if(Options.language == "JPN"){
        text = '　様払い戻ししました。';
        text2 = '払戻金額を入力してください。';
    }else if(Options.language == "ENG"){
        text = 'has been refunded.';
        text2 = 'Please input refund';
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
                }
                else{
                    $('#errorMessageBar').hide();
                    $('#errorMessageText').text('');
                    $('#startR').attr('selected', 'selected');
                    smart_refresh_member_group_class_list();

                    if($('#calendar').length > 0){
                        ajaxClassTime();
                    }
                    get_member_lecture_list(dbID);

                    //$('#shade3').css('display','none');
                    $('div.lectureRefundPopup.popups input[type="number"]').val('');
                    console.log('success');

                    alert(text);
                }
            },

            //통신 실패시 처리
            error:function(){
                $('#errorMessageBar').show();
                $('#errorMessageText').text('통신 에러: 관리자 문의');
            }
        })
    }else{
        alert(text2);
    }
}

function smart_refresh_member_group_class_list(){
    if($('#currentMemberList').css('display') == "block"){
        get_member_ing_list("callback", function(jsondata){
            memberListSet('current', 'date', 'yes', jsondata);
        });
    }else if($('#finishedMemberList').css('display') == "block"){
        get_member_end_list("callback", function(jsondata){
            memberListSet('finished', 'date', 'yes', jsondata);
        });
    }else if($('#currentGroupList').css('display') == "block"){
        var opened_group = [];
        $('#currentGroupList div.groupWrap_selected').each(function(){
            opened_group.push($(this).attr('data-groupid'))
        });
        get_member_group_class_ing_list("callback", function(jsondata){
            var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
            var group_class_Html = group_class_ListHtml('current', jsondata);
            $('#currentGroupList').html(group_class_Html);
            for(var i=0; i<opened_group.length; i++){
               $(`#currentGroupList div.groupWrap[data-groupid="${opened_group[i]}"]`).trigger('click'); 
            }
        });
    }else if($('#finishedGroupList').css('display') == "block"){
        var opened_group = [];
        $('#finishedGroupList div.groupWrap_selected').each(function(){
            opened_group.push($(this).attr('data-groupid'));
        });
        get_member_group_class_end_list("callback", function(jsondata){
            var memberlist = ptmember_ListHtml('finished', 'name', 'no', jsondata);
            var group_class_Html = group_class_ListHtml('finished', jsondata);
            $('#finishedGroupList').html(group_class_Html);
            for(var i=0; i<opened_group.length; i++){
                $(`#finishedGroupList div.groupWrap[data-groupid="${opened_group[i]}"]`).trigger('click');
            }
        });
    }else if($("#calendar").length > 0 ){
        $('#members_mobile, #members_pc').html('');
        get_current_member_list();
        get_current_group_list();
        get_member_group_class_ing_list("callback", function(jsondata){
            var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
            var member_Html = memberlist.html;
            var group_class_Html = group_class_ListHtml('current', jsondata);
            $('#currentGroupList').html(group_class_Html);
        });
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
            beforeSend();
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data)
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }
            else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');

                $('#startR').attr('selected','selected');
                get_member_list();
                get_member_lecture_list(dbID);

                $('#shade3').css('display','none');
                $('div.lectureRefundPopup.popups input[type="number"]').val('');
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}

//회원의 등록 이력을 서버로부터 받아온다.
function get_member_lecture_list(dbID, use, callback){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/get_lecture_list/',
        type:'GET',
        data:{"member_id":dbID},
        dataType : 'html',

        beforeSend:function(){
            beforeSend();
        },

        //보내기후 팝업창 닫기
        complete:function(){
            
        },

        //통신성공시 처리
        success:function(data){
            completeSend();
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(use == "callback"){
                    callback(jsondata);
                }else{
                    if(bodywidth < 600){
                        draw_member_lecture_list_table(jsondata, dbID, 'mobile');
                    }else{
                        draw_member_lecture_list_table(jsondata, dbID, 'pc');
                    }
                }
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
            completeSend();
        }
    })
}

function notice_lecture_status_changed_to_inprogress(lecturename, member_name){
    console.log(member_name)
    show_caution_popup(`진행완료 되었던 ${member_name} 회원님의 <br> <span style="color:#fe4e65;font-weight:500";>수강정보 [${lecturename}]의</span> <br> 상태가 <span style="color:green">진행중</span>으로 변경됩니다.<p></p>`);
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
    var bodywidth = window.innerWidth;
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
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    draw_member_history_list_table(jsondata, 'mobile');
                }else{
                    draw_member_history_list_table(jsondata, 'pc');
                }

            }

        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}

function draw_member_history_list_table(jsondata, PCorMobile){
    if(PCorMobile == "pc"){
        var $regHistory = $('#memberLectureHistory_info_PC');
    }else if(PCorMobile == "mobile"){
        var $regHistory = $('#memberLectureHistory_info');
    }
    var text = '수행일시';
    var text2 = '진행시간';
    var text3 = '구분';
    var text4 = '메모';
    var text5 = '완료';
    var text6 = '시작전';
    var text7 = '시작전';
    var text9 = '시간';
    var text10 = '회차';
    if(Options.language == "JPN"){
        text = '授業日';
        text2 = '進行時間';
        text3 = '状態';
        text4 = 'メモ―';
        text5 = '完了';
        text6 = '未完了';
        text7 = '未完了';
        text9 = '時間';
        text10 = 'No.';
    }else if(Options.language == "ENG"){
        text = 'Date';
        text2 = 'Period';
        text3 = 'Status';
        text4 = 'Memo';
        text5 = 'Fin.';
        text6 = 'Yet';
        text7 = 'Yet';
        text9 = 'h';
        text10 = 'No.';
    }

    var result_history_html = ['<div><div>'+text10+'</div><div>'+text+'</div><div>'+text2+'</div><div>'+text3+'</div><div>'+text4+'</div></div>'];
    var stateCodeDict = {"PE":text5,"NP":text6,"IP":text7};
    for(var i=0; i<jsondata.ptScheduleStartDtArray.length; i++){
        var day = new Date(jsondata.ptScheduleStartDtArray[i].split(' ')[0]).getDay();
        var startDate = Number(jsondata.ptScheduleStartDtArray[i].split(' ')[0].split('-')[2]);
        var endDate = Number(jsondata.ptScheduleEndDtArray[i].split(' ')[0].split('-')[2]);
        var startTime = Number(jsondata.ptScheduleStartDtArray[i].split(' ')[1].split(':')[0]) + Number(jsondata.ptScheduleStartDtArray[i].split(' ')[1].split(':')[1])/60;
        var endTime = Number(jsondata.ptScheduleEndDtArray[i].split(' ')[1].split(':')[0]) + Number(jsondata.ptScheduleEndDtArray[i].split(' ')[1].split(':')[1])/60;

        /*
         if(endDate == startDate+1 && endTime==0){
         var duration = 24 - startTime
         }else if(endTime==0 && endDate == 1){
         var duration = 24 - startTime
         }else{
         var duration = endTime - startTime
         }
         */

        var dur = calc_duration_by_start_end_2(jsondata.ptScheduleStartDtArray[i].split(' ')[0], jsondata.ptScheduleStartDtArray[i].split(' ')[1], jsondata.ptScheduleEndDtArray[i].split(' ')[0], jsondata.ptScheduleEndDtArray[i].split(' ')[1]);

        var ptScheduleNo = '<div data-id="'+jsondata.ptScheduleIdArray[i]+'">'+jsondata.ptScheduleIdxArray[i]+'</div>';
        var ptScheduleStartDt =  '<div data-id="'+jsondata.ptScheduleIdArray[i]+'">'+date_format_yyyymmdd_to_yyyymmdd_split(jsondata.ptScheduleStartDtArray[i].split(' ')[0],'.')+' ('+multiLanguage[Options.language]['WeekSmpl'][day]+') '+jsondata.ptScheduleStartDtArray[i].split(' ')[1].substr(0,5)+'</div>';
        var ptScheduleStateCd =   '<div class="historyState_'+jsondata.ptScheduleStateCdArray[i]+'" data-id="'+jsondata.ptScheduleIdArray[i]+'">'+stateCodeDict[jsondata.ptScheduleStateCdArray[i]]+'</div>';
        var ptScheduleDuration = '<div data-id="'+jsondata.ptScheduleIdArray[i]+'">'+duration_number_to_hangul_minute(dur)+'</div>';
        var ptScheduleNote =   '<div data-id="'+jsondata.ptScheduleIdArray[i]+'">'+jsondata.ptScheduleNoteArray[i]+'</div>';
        if(jsondata.ptScheduleIdxArray[i] == "1" && i!=0){
            result_history_html.push('<div style="border-bottom:1px solid #cccccc;" data-leid='+jsondata.ptScheduleIdArray[i]+'>'+ptScheduleNo+ptScheduleStartDt+ptScheduleDuration+ptScheduleStateCd+ptScheduleNote+'</div>');
        }else{
            result_history_html.push('<div data-leid='+jsondata.ptScheduleIdArray[i]+'>'+ptScheduleNo+ptScheduleStartDt+ptScheduleDuration+ptScheduleStateCd+ptScheduleNote+'</div>');
        }
    }

    var result_history = result_history_html.join('');
    $regHistory.html(result_history);
}
//회원정보////////////////////////////////////////////////////////



//회원등록////////////////////////////////////////////////////////
//회원추가시 아이디 검색하면 해당회원정보를 필드에 채워주기
function fill_member_info_by_ID_search(){
    var selector_memberLastName_add = $('#memberLastName_add');
    var selector_memberFirstName_add = $('#memberFirstName_add');
    var selector_memberPhone_add = $('#memberPhone_add');
    var selector_memberEmail_add = $('#memberEmail_add');
    var selector_birth_year = $('#birth_year');
    var selector_birth_month = $('#birth_month');
    var selector_birth_date = $('#birth_date');
    $('#id_search_confirm').val('1');
    selector_memberLastName_add.val(id_search_memberLastName);
    selector_memberFirstName_add.val(id_search_memberFirstName);
    $('#form_name').val(id_search_memberLastName+id_search_memberFirstName);
    selector_memberPhone_add.val(id_search_memberPhone);
    selector_memberEmail_add.val(id_search_memberEmail);
    // $('#id_user_id').val(id_search_memberId);
    if(id_search_memberSex != ''){
        $('.selectboxopt[value='+id_search_memberSex+']').addClass('selectbox_checked');
    }
    else{
        $('memberSex_info').addClass('selectbox_checked');
    }

    var dropdown_year_selected = '';
    var dropdown_month_selected = '';
    var dropdown_date_selected = '';

    if(id_search_memberBirth == ''){
        $('#birth_year, #birth_month, #birth_date').find('option:first').prop('selected', true);
    }
    else{
        dropdown_year_selected = $('#birth_year option[data-year="'+id_search_memberBirth.split('-')[0]+'년"]');
        dropdown_month_selected = $('#birth_month option[data-month="'+Number(id_search_memberBirth.split('-')[1])+'월"]');
        dropdown_date_selected = $('#birth_date option[data-date="'+Number(id_search_memberBirth.split('-')[2])+'일"]');
        dropdown_year_selected.prop('selected',true);
        dropdown_month_selected.prop('selected',true);
        dropdown_date_selected.prop('selected',true);
    }

    selector_memberLastName_add.prop('disabled',true);
    selector_memberFirstName_add.prop('disabled',true);
    selector_memberPhone_add.prop('disabled',true);
    selector_memberEmail_add.prop('disabled',true);
    selector_birth_year.prop('disabled',true);
    selector_birth_month.prop('disabled',true);
    selector_birth_date.prop('disabled',true);
    selector_memberLastName_add.addClass("dropdown_selected");
    selector_memberFirstName_add.addClass("dropdown_selected");
    selector_memberPhone_add.addClass("dropdown_selected");
    selector_memberEmail_add.addClass("dropdown_selected");
    selector_birth_year.addClass('dropdown_selected');
    selector_birth_month.addClass('dropdown_selected');
    selector_birth_date.addClass('dropdown_selected');
}

//새로운 회원 정보 서버로 보내 등록하기
function add_member_form_func(){
    var bodywidth = window.innerWidth;
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
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    //$('#page_managemember').show();
                    $('#page_managemember').css({'height':'100%'});
                }else{
                    $('body').css('overflow-y','auto');
                }
                /*
                 if($('#memberInfoPopup_PC').css('display') == "block" || $('#memberInfoPopup').css('display') == "block"){
                 get_member_lecture_list(dbID)
                 }
                 */
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                $('#startR').attr('selected','selected');
                if($('#currentMemberList').css('display') == "block"){
                    get_member_ing_list("callback",function(jsondata){
                        memberListSet('current','date','yes',jsondata);
                    })
                }else if($('#finishedMemberList').css('display') == "block"){
                    get_member_end_list("callback",function(jsondata){
                        memberListSet('finished','date','yes',jsondata);
                    })
                }
                if($('#currentGroupList').length || $('#finishedGroupList').length ){
                    get_member_group_class_ing_list("callback", function(jsondata){
                        var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
                        var member_Html = memberlist.html;
                        var group_class_Html = group_class_ListHtml('current', jsondata);
                        $('#currentGroupList').html(group_class_Html);
                    });
                }
                

                close_manage_popup('member_add');
                if($('#memberInfoPopup_PC').css('display') == "block"){
                    close_manage_popup('member_info_PC');
                }else if($('#memberInfoPopup').css('display') == "block"){
                    close_manage_popup('member_info');
                }
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
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
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#id_user_id').val(jsondata.user_db_id);
                add_member_form_func();
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}

//새로운 그룹 정보 서버로 보내 등록하기
function add_group_form_func(){
    var bodywidth = window.innerWidth;
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
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    //$('#page_managemember').show();
                    $('#page_managemember').css({'height':'100%'});
                }else{
                    $('body').css('overflow-y','auto');
                }
                /*
                 if($('#memberInfoPopup_PC').css('display') == "block" || $('#memberInfoPopup').css('display') == "block"){
                 get_member_lecture_list(dbID)
                 }
                 */
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');



                if($('#currentGroupList').css('display') == "block"){
                    get_member_group_class_ing_list("callback", function(jsondata){
                        var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
                        var member_Html = memberlist.html;
                        var group_class_Html = group_class_ListHtml('current', jsondata);
                        $('#currentGroupList').html(group_class_Html);
                    });
                }else if($('#finishedGroupList').css('display') == "block"){
                    get_member_group_class_end_list("callback", function(jsondata){
                        var memberlist = ptmember_ListHtml('finished', 'name', 'no', jsondata);
                        var member_Html = memberlist.html;
                        var group_class_Html = group_class_ListHtml('finished', jsondata);
                        $('#finishedGroupList').html(group_class_Html);
                    });
                }

                close_manage_popup('member_add');
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}






//새로운 그룹멤버 정보 서버로 보내 등록하기
function add_groupmember_form_func(){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/add_group_member/',
        type:'POST',
        data: JSON.stringify(added_member_info_to_jsonformat()),
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
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
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    //$('#page_managemember').show();
                    $('#page_managemember').css({'height':'100%'});
                }else{
                    $('body').css('overflow-y','auto');
                }
                /*
                 if($('#memberInfoPopup_PC').css('display') == "block" || $('#memberInfoPopup').css('display') == "block"){
                 get_member_lecture_list(dbID)
                 }
                 */
                // $('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                get_member_list()
                if($('#currentGroupList').css('display') == "block"){
                    get_member_group_class_ing_list("callback", function(jsondata){
                        var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
                        var member_Html = memberlist.html;
                        var group_class_Html = group_class_ListHtml('current', jsondata);
                        $('#currentGroupList').html(group_class_Html);
                    });
                }else if($('#finishedGroupList').css('display') == "block"){
                    get_member_group_class_end_list("callback", function(jsondata){
                        var memberlist = ptmember_ListHtml('finished', 'name', 'no', jsondata);
                        var member_Html = memberlist.html;
                        var group_class_Html = group_class_ListHtml('finished', jsondata);
                        $('#finishedGroupList').html(group_class_Html);
                    });
                }
                $('#startR').attr('selected','selected');
                close_manage_popup('member_add');
                console.log('success');
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })

}


//회원을 삭제 요청을 서버로 보낸다.
function deleteMemberAjax(){
    var bodywidth = window.innerWidth;
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
                // $('html').css("cursor","auto");
                $('#upbutton-modify img').attr('src','/static/user/res/icon-pencil.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }
            else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                close_info_popup('cal_popup_plandelete');

                if(bodywidth < 600){
                    //$('#page_managemember').show();
                    $('#page_managemember').css({'height':'100%'});
                }
                // $('html').css("cursor","auto");
                $('#upbutton-modify img').attr('src','/static/user/res/icon-pencil.png');

                $('#startR').attr('selected','selected');
                var selector_currentMemberList = $('#currentMemberList');
                var selector_finishedMemberList = $('#finishedMemberList');
                switch(alignType){
                    case 'name':
                        if(selector_currentMemberList.css('display') == "block"){
                            get_member_ing_list('callback',function(json){
                                memberListSet ('current','name','no',json);
                                $('#name').attr('selected','selected');
                            })
                        }else if($selector_finishedMemberList.css('display') == "block"){
                            get_member_end_list('callback',function(json){
                                memberListSet('finished','name','no',json);
                                $('#name').attr('selected','selected');
                            })
                        }
                        break;
                    case 'countH':
                        if(selector_currentMemberList.css('display') == "block"){
                            get_member_ing_list('callback',function(json){
                                memberListSet('current','count','yes',json);
                                $('#countH').attr('selected','selected');
                            })
                        }else if(selector_finishedMemberList.css('display') == "block"){
                            get_member_end_list('callback',function(json){
                                memberListSet('finished','count','yes',json);
                                $('#countH').attr('selected','selected');
                            })
                        }
                        break;
                    case 'countL':
                        if(selector_currentMemberList.css('display') == "block"){
                            get_member_ing_list('callback',function(json){
                                memberListSet('current','count','no',json);
                                $('#countL').attr('selected','selected');
                            })
                        }else if(selector_finishedMemberList.css('display') == "block"){
                            get_member_end_list('callback',function(json){
                                memberListSet('finished','count','no',json);
                                $('#countL').attr('selected','selected');
                            })
                        }
                        break;
                    case 'startP':
                        if($selector_currentMemberList.css('display') == "block"){

                        }else if(selector_finishedMemberList.css('display') == "block"){

                        }
                        get_member_ing_list('callback',function(json){
                            memberListSet('current','date','no',json);
                            $('#startP').attr('selected','selected');
                        })
                        get_member_end_list('callback',function(json){
                            memberListSet('finished','date','no',json);
                            $('#startP').attr('selected','selected');
                        })
                        break;
                    case 'startR':
                        if(selector_currentMemberList.css('display') == "block"){
                            get_member_ing_list('callback',function(json){
                                memberListSet('current','date','yes',json);
                                $('#startR').attr('selected','selected');
                            })
                        }else if(selector_finishedMemberList.css('display') == "block"){
                            get_member_end_list('callback',function(json){
                                memberListSet('finished','date','yes',json);
                                $('#startR').attr('selected','selected');
                            })
                        }
                        break;
                    case 'recent':
                        if(selector_currentMemberList.css('display') == "block"){
                            get_member_ing_list('callback',function(json){
                                memberListSet('current','date','yes',json);
                                $('#recent').attr('selected','selected');
                            })
                        }else if(selector_finishedMemberList.css('display') == "block"){
                            get_member_end_list('callback',function(json){
                                memberListSet('finished','date','yes',json);
                                $('#recent').attr('selected','selected');
                            })
                        }
                        break;
                }
                console.log('success');
            }
        },

        complete:function(){
            //completeSend();
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}





function initialize_add_member_sheet(){
    $('#id_search_confirm').val('0');
    $('#form_member_groupid').val('');
    $('#memberLastName_add').prop('disabled', false);
    $('#memberFirstName_add').prop('disabled', false);
    $('#memberPhone_add').prop('disabled', false);
    $('#memberEmail_add').prop('disabled', false);
    $('#birth_year').prop('disabled', false);
    $('#birth_month').prop('disabled', false);
    $('#birth_date').prop('disabled', false);

    if($('#page_addmember .btnCallSimple').hasClass('selectbox_checked')){
        $('#fast_check').val('0');
    }else if($('#page_addmember .btnCallManual').hasClass('selectbox_checked')){
        $('#fast_check').val('1');
    }

    $('.ptaddbox input,#memberDue_add_2').val("");
    var selector_birth_year_month_date = $('#birth_year, #birth_month, #birth_date');
    selector_birth_year_month_date.find('option:first').prop('selected', true);
    selector_birth_year_month_date.css('color', '#cccccc');

    $('#form_birth').val('');
    $('#id_phone').val('');

    $('.dropdown_selected').removeClass('dropdown_selected');
    $('.checked').removeClass('checked');
    $('.ptersCheckboxInner').removeClass('ptersCheckboxInner');
    $('#memberSex div').removeClass('selectbox_checked');
    $('.submitBtnActivated').removeClass('submitBtnActivated');

    //그룹추가관련 입력 초기화
    $('.subpopup_addGroup').hide();
    $('#addedMemberListBox div').remove();
    $('#addedMemberListBox span').text('0 명');
    added_New_Member_Num = 0;
    //그룹추가관련 입력 초기화
    $("#page_addmember input").css({"-webkit-text-fill-color":"#cccccc"})
}




//서버로부터 회원의 반복일정 정보를 받아온다.
function get_indiv_repeat_info(dbID){
    var bodywidth = window.innerWidth;
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
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    set_indiv_repeat_info(dbID, jsondata, 'mobile');
                }else{
                    set_indiv_repeat_info(dbID, jsondata, 'pc');
                }
            }
        },

        complete:function(){
            //completeSend(); //ajax 로딩이미지 숨기기
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    })
}

//서버로부터 받아온 반복일정을 회원정보 팝업에 그린다.
function set_indiv_repeat_info(dbID, jsondata, PCorMobile){
    var $regHistory;
    if(PCorMobile == "pc"){
        $regHistory =  $('#memberRepeat_info_PC');
    }else if(PCorMobile == "mobile"){
        $regHistory = $('#memberRepeat_info');
    }
    // var text = '시';
    // var text2 = '시간';
    var text3 = '반복 : ';
    if(Options.language == "JPN"){
        // text = '時';
        // text2 = '時間';
        text3 = '繰り返し : ';
    }else if(Options.language == "ENG"){
        // text = '';
        // text2 = 'h';
        text3 = 'Repeat : ';
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
    };
    var len = jsondata.ptRepeatScheduleIdArray.length;
    var dbId = dbID;
    var repeat_id_array = jsondata.ptRepeatScheduleIdArray;
    var repeat_type_array = jsondata.ptRepeatScheduleTypeArray;
    var repeat_day_info_raw_array = jsondata.ptRepeatScheduleWeekInfoArray;
    var repeat_start_array = jsondata.ptRepeatScheduleStartDateArray;
    var repeat_end_array = jsondata.ptRepeatScheduleEndDateArray;
    var repeat_time_array = jsondata.ptRepeatScheduleStartTimeArray;
    var repeat_endTime_array = jsondata.ptRepeatScheduleEndTimeArray;
    var repeat_dur_array = jsondata.ptRepeatScheduleTimeDurationArray;

    var schedulesHTML = [];
    for(var i=0; i<jsondata.ptRepeatScheduleIdArray.length; i++){
        var repeat_group_name = jsondata.ptRepeatScheduleGroupNameArray[i];
        var repeat_group_type = "["+jsondata.ptRepeatScheduleGroupTypeCdNameArray[i]+"]";
        if(repeat_group_name.length == 0 ){
            repeat_group_name = "";
        }
        var repeat_title = repeat_group_type+' '+repeat_group_name;

        var repeat_id = repeat_id_array[i];
        var repeat_type = repeat_info_dict[Options.language][repeat_type_array[i]];
        var repeat_start = repeat_start_array[i].replace(/-/gi,".");
        var repeat_start_text = "<span class='summaryInnerBoxText_Repeatendtext'>"+text3+"</span>";
        //var repeat_end_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복종료 : </span>"
        var repeat_end_text = "";
        var repeat_end = repeat_end_array[i].replace(/-/gi,".");
        var repeat_time = Number(repeat_time_array[i].split(':')[0]); // 06 or 18
        var repeat_min = Number(repeat_time_array[i].split(':')[1]);  // 00 or 30

        var repeat_start_time = repeat_time_array[i].split(':')[0] +':'+ repeat_time_array[i].split(':')[1];
        var repeat_end_time = repeat_endTime_array[i].split(':')[0] +':'+ repeat_endTime_array[i].split(':')[1];

        var repeat_day =  function(){
            var repeat_day_info_raw = repeat_day_info_raw_array[i].split('/');
            var repeat_day_info = "";
            if(repeat_day_info_raw.length>1){
                for(var j=0; j<repeat_day_info_raw.length; j++){
                    repeat_day_info = repeat_day_info + '/' + repeat_info_dict[Options.language][repeat_day_info_raw[j]].substr(0,1);
                }
            }else if(repeat_day_info_raw.length == 1){
                repeat_day_info = repeat_info_dict[Options.language][repeat_day_info_raw[0]];
            }
            if(repeat_day_info.substr(0,1) == '/'){
                repeat_day_info = repeat_day_info.substr(1,repeat_day_info.length);
            }
            return repeat_day_info;
        };
        var summaryInnerBoxText_title = '<p class="summaryInnerBoxText">'+repeat_title+'</p>';
        var summaryInnerBoxText_1 = '<p class="summaryInnerBoxText">'+repeat_type +' '+repeat_day() +' '+repeat_start_time+' ~ '+repeat_end_time+'</p>';
        var summaryInnerBoxText_2 = '<p class="summaryInnerBoxText">'+repeat_start_text+repeat_start+' ~ '+repeat_end_text+repeat_end+'</p>';
        var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin" data-dbid="'+dbId+'" data-deletetype="repeatinfo" data-repeatid="'+repeat_id+'"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>';
        schedulesHTML[i] = '<div class="summaryInnerBox" data-repeatid="'+repeat_id+'">'+summaryInnerBoxText_title+summaryInnerBoxText_1+summaryInnerBoxText_2+deleteButton+'</div>';
    }
    $regHistory.html(schedulesHTML.join(''));
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
                        send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i]);
                    }
                }
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(use == "callback"){
                    callback(jsondata);
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
        }
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
            console.log('server error');
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
                        send_push_func(jsondata.push_lecture_id[i], jsondata.push_title[i], jsondata.push_message[i]);
                    }
                }
                ajaxClassTime();
                if(use == 'callback'){
                    callback(jsondata);
                }
            }
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신 실패시 처리
        error:function(){
            alert("Server Error: \nSorry for inconvenience. \nPTERS server is unstable now.");
            completeSend();
        }
    })
}

/*
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
 //alert('complete: 일정 정상 등록')
 }
 */

function numberWithCommas(x) { //천단위 콤마 찍기
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
