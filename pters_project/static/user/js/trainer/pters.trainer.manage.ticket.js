const SORT_TICKET_TYPE = 0;
const SORT_TICKET_NAME = 1;
const SORT_TICKET_MEMBER_COUNT = 2;
const SORT_TICKET_CREATE_DATE = 3;
var ticket_sort_val = SORT_TICKET_TYPE;
var ticket_sort_order_by = SORT_ASC;
var ticket_tab = TAB_ING;
var ticket_keyword = '';
var ticketListSet_len = 1;
var ticket_page_num = 1;
var ticket_mutex_val = 1;

var db_id_flag = 0;
var user_id_flag = 1;

var ticket_ing_list_cache;
var ticket_end_list_cache;

/////////////옵션
if(Options.auth_class == 0){
    $('._groupaddbutton').attr('onclick', "purchase_annai()");
    $('._groupaddbutton').append('<img src="/static/user/res/login/icon-lock-grey.png" style="margin-bottom:3px;height:16px;">');
}
function purchase_annai(){
    alert('수강권 기능 이용권 구매후 이용이 가능합니다.');
}
/////////////옵션


/////////////그룹타입, 그룹정원 드랍다운 값을 Form에 셋팅/////////////////////////////////////////
$('#groupname').keyup(function(){
    check_dropdown_selected();
});
$('#grouptype').change(function(){
    $('#form_grouptype').val($(this).val());
    check_dropdown_selected();
});
$('#groupcapacity').change(function(){
    $('#form_groupcapacity').val($(this).val());
    check_dropdown_selected();
});
/////////////그룹타입, 그룹정원 드랍다운 값을 Form에 셋팅/////////////////////////////////////////

$('#search_ticket_input').keyup(function(e){
    // e.stopPropagation();
    // e.preventDefault();
    // var search_value = $(this).val();
    ticket_keyword =  $(this).val();
    // $('div.memberline').hide();
    // $('div.memberline').each(function(){
    //     if($(this).find("._tdname").attr('data-name').match(search_value) != null || $(this).find("._id").attr('data-name').match(search_value) != null || $(this).find("._contact .phonenum").text().match(search_value) != null){
    //         $(this).show();
    //     }
    // });
    // if(search_value.length == 0){
    //     $('div.memberline').show();
    // }
    if (e.keyCode == 13){
       $('#id_ticket_search').trigger('click');
    }

});

$('#search_ticket_box').click(function(e){
    var $alignSelect = $('._ALIGN_DROPDOWN');
    // var selector_currentMemberList = $('#currentMemberList');
    // var selector_finishedMemberList = $('#finishedMemberList');
    var $search_input_div = $('.ymdText-pc-add-member-wrap');
    var $search_member_input = $('#search_ticket_input');
    var $search_x_button = $('#id_search_x_button');

    if($search_input_div.css('display')=="none"){
        $alignSelect.css('display', 'none');
        $search_input_div.css('display', 'inline-block');
        $search_x_button.attr('src','/static/user/res/ptadd/btn-x.png');
        $search_x_button.css('width','15px');
    }else{
        ticket_keyword = '';
        $search_member_input.val('');
        $alignSelect.css('display', 'inline-block');
        $search_input_div.css('display', 'none');
        $search_x_button.attr('src','/static/user/res/icon-search-black.png');
        $search_x_button.css('width','25px');
        if(ticket_tab == TAB_ING) {
            get_package_ing_list("callback", function(jsondata){
                var group_class_Html = '';
                if(bodywidth <= 1000) {
                    group_class_Html = package_ListHtml_mobile('current', jsondata);
                }
                else if(bodywidth > 1000){
                    group_class_Html = package_ListHtml('current', jsondata);
                }
                $('#currentPackageList').html(group_class_Html);
            });
        }
        else if(ticket_tab == TAB_END) {
            get_package_end_list("callback", function(jsondata){
                // console.log("get_package_end_list", jsondata)
                var group_class_Html = '';
                if(bodywidth <= 1000) {
                    group_class_Html = package_ListHtml_mobile('finished', jsondata);
                }
                else if(bodywidth > 1000){
                    group_class_Html = package_ListHtml('finished', jsondata);
                }
                $('#finishedPackageList').html(group_class_Html);
            });
        }
    }
});

$('#id_ticket_search').click(function(e){
    e.preventDefault();
    e.stopPropagation();
    if(ticket_tab == TAB_ING) {
        get_package_ing_list("callback", function(jsondata){
            var group_class_Html = '';
            if(bodywidth <= 1000) {
                group_class_Html = package_ListHtml_mobile('current', jsondata);
            }
            else if(bodywidth > 1000){
                group_class_Html = package_ListHtml('current', jsondata);
            }
            $('#currentPackageList').html(group_class_Html);
        });
    }
    else if(ticket_tab == TAB_END) {
        get_package_end_list("callback", function(jsondata){
            // console.log("get_package_end_list", jsondata)
            var group_class_Html = '';
            if(bodywidth <= 1000) {
                group_class_Html = package_ListHtml_mobile('finished', jsondata);
            }
            else if(bodywidth > 1000){
                group_class_Html = package_ListHtml('finished', jsondata);
            }
            $('#finishedPackageList').html(group_class_Html);
        });
    }


});

$('.alignSelect_ticket').change(function(){
        //var jsondata = global_json
        if($(this).val()=="수강권명 가나다 순" || $(this).val()=="名前順" || $(this).val()=="Name" ){
            ticket_sort_val = SORT_TICKET_NAME;
            ticket_sort_order_by = SORT_ASC;
        }else if($(this).val()=="참여중 회원 많은 순" || $(this).val()=="残り回数が多い" || $(this).val()=="Remain Count(H)"){
            ticket_sort_val = SORT_TICKET_MEMBER_COUNT;
            ticket_sort_order_by = SORT_DESC;
        }else if($(this).val()=="참여중 회원 적은 순" || $(this).val()=="残り回数が少ない" || $(this).val()=="Remain Count(L)"){
            ticket_sort_val = SORT_TICKET_MEMBER_COUNT;
            ticket_sort_order_by = SORT_ASC;
        }else if($(this).val()=="수강권 타입 순" || $(this).val()=="残り回数が多い" || $(this).val()=="Remain Count(H)"){
            ticket_sort_val = SORT_TICKET_TYPE;
            ticket_sort_order_by = SORT_DESC;
        }else if($(this).val()=="생성 일자 과거 순" || $(this).val()=="開始が過去" || $(this).val()=="Start Date(P)"){
            ticket_sort_val = SORT_TICKET_CREATE_DATE;
            ticket_sort_order_by = SORT_ASC;
        }else if($(this).val()=="생성 일자 최근 순" || $(this).val()=="開始が最近" || $(this).val()=="Start Date(R)"){
            ticket_sort_val = SORT_TICKET_CREATE_DATE;
            ticket_sort_order_by = SORT_DESC;
        }
        if(ticket_tab == TAB_ING) {
            get_package_ing_list("callback", function(jsondata){
                var group_class_Html = '';
                if(bodywidth <= 1000) {
                    group_class_Html = package_ListHtml_mobile('current', jsondata);
                }
                else if(bodywidth > 1000){
                    group_class_Html = package_ListHtml('current', jsondata);
                }
                $('#currentPackageList').html(group_class_Html);
            });
        }
        else if(ticket_tab == TAB_END) {
            get_package_end_list("callback", function(jsondata){
                // console.log("get_package_end_list", jsondata)
                var group_class_Html = '';
                if(bodywidth <= 1000) {
                    group_class_Html = package_ListHtml_mobile('finished', jsondata);
                }
                else if(bodywidth > 1000){
                    group_class_Html = package_ListHtml('finished', jsondata);
                }
                $('#finishedPackageList').html(group_class_Html);
            });
        }
});

//진행중 클래스, 종료된 클래스 리스트 스왑 (통합)
function shiftPackageList(type){
    $('html').scrollTop(0);
    ticket_page_num = 1;
    ticketListSet_len = 1;
    $('#search_ticket_input').val("").css("-webkit-text-fill-color", "#cccccc");
    ticket_keyword = '';
    switch(type){
        case "current":
            ticket_tab = TAB_ING;
            $('#currentPackageList').css('display', 'block');
            $('#finishedPackageList, #finishGroupNum').css('display', 'none');
            if(bodywidth > 1000){
                $('._GROUP_THEAD').show();
                $('._MEMBER_THEAD, ._memberaddbutton').hide();
                $('#memberNumber_current_ticket').css('display', 'block');
                $('#memberNumber_finish_ticket').css('display', 'none');
                get_package_ing_list("callback", function(jsondata){
                    var group_class_Html = package_ListHtml('current', jsondata);
                    $('#currentPackageList').html(group_class_Html);
                });
            }else if (bodywidth >600){
                $('#memberNumber_current_ticket').css('display', 'block');
                $('#memberNumber_finish_ticket').css('display', 'none');
                get_package_ing_list("callback", function(jsondata){
                    var group_class_Html = package_ListHtml_mobile('current', jsondata);
                    $('#currentPackageList').html(group_class_Html);
                });
            }
            else{
                get_package_ing_list("callback", function(jsondata){
                    var group_class_Html = package_ListHtml_mobile('current', jsondata);
                    $('#currentPackageList').html(group_class_Html);
                });
            }
            break;
        case "finished":
            ticket_tab = TAB_END;

            $('#finishedPackageList').css('display', 'block');
            $('#currentPackageList, #currentGroupNum').css('display', 'none');
            if(bodywidth > 1000){
                $('._GROUP_THEAD').show();
                $('._MEMBER_THEAD, ._memberaddbutton').hide();
                $('#memberNumber_finish_ticket').css('display', 'block');
                $('#memberNumber_current_ticket').css('display', 'none');
                get_package_end_list("callback", function(jsondata){
                    // console.log("get_package_end_list", jsondata)
                    var group_class_Html = package_ListHtml('finished', jsondata);
                    $('#finishedPackageList').html(group_class_Html);
                });
            }else if (bodywidth >600){
                $('#memberNumber_finish_ticket').css('display', 'block');
                $('#memberNumber_current_ticket').css('display', 'none');
                get_package_end_list("callback", function(jsondata){
                    var group_class_Html = package_ListHtml_mobile('finished', jsondata);
                    $('#finishedPackageList').html(group_class_Html);
                });
            }else{
                get_package_end_list("callback", function(jsondata){
                    // console.log("get_package_end_list", jsondata)
                    var group_class_Html = package_ListHtml_mobile('finished', jsondata);
                    $('#finishedPackageList').html(group_class_Html);
                });
            }
            break;
    }
}
/////////////신규 회원으로 추가 버튼 누르면 행 생성/////////////////////////////////////////
var added_New_Member_Num = 0;
$('button#addByNew').click(function(e){
    var $this = $(this);
    if(!$this.hasClass('disabled_button')){
        $this.addClass('disabled_button');
        get_member_ing_list_all("callback", function(jsondata){
            var member_list_data = jsondata;
            pters_option_inspector("member_create", "", member_list_data.db_id.length);
        
            if($('#caution_popup').css('display') == "none"){
                var group_id = $('#form_member_groupid').val();
                var group_type = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-grouptype');
                var group_capacity = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-groupcapacity');
                var alreadyParticipateNumber = $('div.groupMembersWrap[data-groupid="'+group_id+'"] div.memberline').length;
                var addedParticipateNumber = $('#addedMemberListBox div.addByNewRaw').length;

                if(alreadyParticipateNumber + addedParticipateNumber == group_capacity && group_type == "NORMAL" ){
                    alert('그룹 : 이미 정원이 가득 찼습니다.');
                }else{
                    pters_option_inspector("member_create", "", member_list_data.db_id.length + added_New_Member_Num);
                    if($('#caution_popup').css('display') == "none"){
                        addByNew_input_eventGroup();
                        e.preventDefault();
                        added_New_Member_Num++;
                        var htmlstart = '<div class="addByNewRaw" data-dbid="" data-id="" data-phone="" data-sex="" data-firstname="" data-lastname="">';
                        //var nameinput = '<input class="new_member_lastname" placeholder="성"><input class="new_member_firstname" placeholder="이름">';
                        var nameinput = '<input class="new_member_firstname" placeholder="이름">';
                        var sexinput = '<select><option selected disabled>성별</option><option value="M">남</option><option value="W">여</option></select>';
                        var phoneinput = '<input type="tel" class="new_member_phone" placeholder="전화번호">';
                        var substract = '<img src="/static/user/res/member/icon-x-red.png" class="substract_addedMember">';
                        var htmlend = '</div>';

                        var html = htmlstart + nameinput + sexinput + phoneinput + substract + htmlend;
                        $('#addedMemberListBox span').text(added_New_Member_Num+' 명');
                        $('#addedMemberListBox').prepend(html);
                    }
                }
            }
            $this.removeClass('disabled_button');
        });
    }
    check_dropdown_selected();
});

//회원추가된 항목에서 x버튼을 누르면 목록에서 뺀다.
$(document).on('click', 'img.substract_addedMember', function(){
    added_New_Member_Num--;
    $('#addedMemberListBox span').text(added_New_Member_Num+' 명');
    $(this).parent('.addByNewRaw').remove();

    //목록에서 뺄때 [리스트에서 추가]로 추가된 항목은 리스트로 다시 돌려놓는다.
    if($(this).hasClass('_addedByList')){
        var name = $(this).parent('.addByNewRaw').attr('data-name');
        var dbid = $(this).parent('.addByNewRaw').attr('data-dbid');
        var id = $(this).parent('.addByNewRaw').attr('data-id');
        var sex = $(this).parent('.addByNewRaw').attr('data-sex');
        var phone = $(this).parent('.addByNewRaw').attr('data-phone');

        var sexInfo = '<img src="/static/user/res/member/icon-sex-'+sex+'.png">';
        var html = '<div class="list_addByList" data-name="'+name+'" data-dbid="'+dbid+'" data-id="'+id+'" data-sex="'+sex+'" data-phone="'+phone+'"><div data-dbid="'+dbid+'">'+sexInfo+name+' (ID: '+id+')'+'</div>'+'<div>'+phone+'</div>'+'<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>';

        $('#subpopup_addByList').append(html);
    }
    check_dropdown_selected();
});

//신규로 새로 그룹원으로 추가된 행의 input값들에 대한 key,드랍다운 이벤트모음
function addByNew_input_eventGroup(){
    //이름 input이 자신이 속한 부모 행의 attr에 이름 정보를 입력해둔다.
    $(document).on('keyup', '.addByNewRaw input.new_member_lastname', function(){
        $(this).parent('.addByNewRaw').attr({'data-lastname': $(this).val()});
        check_dropdown_selected();
    });

    $(document).on('keyup', '.addByNewRaw input.new_member_firstname', function(){
        limit_char(this);
        $(this).parent('.addByNewRaw').attr({'data-firstname': $(this).val()});
        check_dropdown_selected();
    });

    $(document).on('change', '.addByNewRaw select', function(){
        $(this).parent('.addByNewRaw').attr('data-sex', $(this).val());
        check_dropdown_selected();
    });

    $(document).on('keyup', '.addByNewRaw input.new_member_phone', function(){
        limit_char_only_number(this);
        $(this).parent('.addByNewRaw').attr('data-phone', $(this).val());
        check_dropdown_selected();
    });

}
/////////////신규 회원으로 추가 버튼 누르면 행 생성/////////////////////////////////////////



/////////////리스트에서 추가 버튼 누르면 회원리스트 팝업//////////////////////////////////
$('button#addByList, button#addBySearch').click(function(e){
    e.preventDefault();
    e.stopPropagation();
    var $this = $(this);
    if(!$this.hasClass('disabled_button')){
        $this.addClass('disabled_button');
            shade_index(400);
            var page_add_member_popup_top = $('#page_addmember').css('top').replace('px', '');
            var page_add_member_popup_width = $('#page_addmember').css('width');
            page_add_member_popup_top = Number(page_add_member_popup_top) + 40;
            $('#subpopup_addByList').css({'top':page_add_member_popup_top+'px', 'width':page_add_member_popup_width});
            $('#subpopup_addBySearch').css({'top':page_add_member_popup_top+'px', 'width':page_add_member_popup_width});
            $(this).siblings('button').addClass('disabled_button');
            $('#subpopup_'+$(this).attr('id')).show();
            if($(this).attr('id')=="addByList"){
                draw_memberlist_for_addByList($('#subpopup_addByList'));
            }else if($(this).attr('id')=="addBySearch"){
                //
            }
            $this.removeClass('disabled_button');


    }
});

$(document).on('click', '#subpopup_addByList .listTitle_addByList span, ._ADD_MEMBER_REG',function(){
    if($('#subpopup_addByList').css('display') == "block"){
        $('#subpopup_addByList').hide();
        $('.groupMemberAddBox button').removeClass('disabled_button');
        if($('#pshade').css('z-index')==400) {
            shade_index(300);
        }else{
            shade_index(-100);
        }
    }
});

function close_addByList_popup(){
    $('#subpopup_addByList').hide();
    $('#subpopup_addByList_plan').hide();
}


//[리스트에서 추가]를 눌러 나온 팝업의 리스트에서 + 버튼을 누르면 회원 추가란으로 해당회원을 보낸다.
$(document).on('click', 'img.add_listedMember', function(){
    var $this = $(this);
    var selected_lastname = $(this).parents('div.list_addByList').attr('data-lastname');
    var selected_firstname = $(this).parents('div.list_addByList').attr('data-firstname');
    var selected_dbid = $(this).parents('div.list_addByList').attr('data-dbid');
    var selected_id = $(this).parents('div.list_addByList').attr('data-id');
    var selected_sex = $(this).parents('div.list_addByList').attr('data-sex');

    //주간, 월간달력 : 그룹레슨에 회원 추가할때.
    if($('#calendar').length != 0 ){
        if(!$(this).hasClass('disabled_button')){
            disable_group_member_add_during_ajax();
            $('#form_add_member_group_plan_memberid').val(selected_dbid);
            send_add_groupmember_plan('callback', function(data){
                var selector_popup_btn_viewGroupParticipants = $('#popup_btn_viewGroupParticipants');
                var group_schedule_id = $('#cal_popup_planinfo').attr('schedule-id');
                var group_id = selector_popup_btn_viewGroupParticipants.attr('data-groupid');
                var max = selector_popup_btn_viewGroupParticipants.attr('data-membernum');

                get_group_plan_participants(group_schedule_id, 'callback', function(jsondata){
                    ajaxClassTime();
                    draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id, max);
                    get_groupmember_list(group_id, 'callback', function(jsondata){
                                                                                    draw_groupParticipantsList_to_add(jsondata, $('#subpopup_addByList_thisgroup'));
                                                                                    $('#groupplan_participants_status').text(
                                                                                                                                ' ('+$('div.groupParticipantsRow').length +
                                                                                                                                '/'+
                                                                                                                                max+')'
                                                                                                                            );
                                                                                 });//특정그룹 회원목록 업데이트
                    enable_group_member_add_after_ajax();
                    
                    if($('#cal_popup_planinfo').attr('group_plan_finish_check') == 1){
                        alert('지난 일정 참석자 정상 등록되었습니다.');
                        if(bodywidth<600){
                            $('#subpopup_addByList_plan').css({'top': ($('#cal_popup_planinfo').height()-$('#subpopup_addByList_plan').height())/2})
                        }
                    }else{
                        alert('일정 참석자 정상 등록되었습니다.');
                        if(bodywidth<600){
                            $('#subpopup_addByList_plan').css({'top': ($('#cal_popup_planinfo').height()-$('#subpopup_addByList_plan').height())/2})
                        }
                    }

                });
            });
        }

        //회원관리 : 리스트로 그룹회원 추가
    }else{
        if(!$this.hasClass('disabled_button')){
            $this.addClass('disabled_button');
            get_member_ing_list_all("callback", function(jsondata){
                var member_list_data = jsondata;

                if(member_list_data.db_id.indexOf(selected_dbid) == -1){
                    if($this.hasClass("add_by_search")){
                        pters_option_inspector("member_create", "", member_list_data.db_id.length);
                    }
                }
                if($('#caution_popup').css('display') == "none"){
                    var group_id = $('#form_member_groupid').val();
                    var group_type = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-grouptype');
                    var group_capacity = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-groupcapacity');
                    var alreadyParticipateNumber = $('div.groupMembersWrap[data-groupid="'+group_id+'"] div.memberline').length;
                    var addedParticipateNumber = $('#addedMemberListBox div.addByNewRaw').length;

                    if(alreadyParticipateNumber + addedParticipateNumber == group_capacity && group_type == "NORMAL" ){
                        alert('고정 그룹 : 이미 정원이 가득 찼습니다.');
                    }else{
                        if($this.hasClass("add_by_search")){
                            pters_option_inspector("member_create", "", member_list_data.db_id.length + added_New_Member_Num);
                        }
                        if($('#caution_popup').css('display') == "none"){
                            var sexInfo;
                            if(selected_sex == "M"){
                                sexInfo = "남";
                            }else if(selected_sex =="W"){
                                sexInfo = "여";
                            }else{
                                sexInfo = "-";
                            }
                            var selected_phone = $this.parents('div.list_addByList').attr('data-phone');
                            if(selected_phone.length == 0){
                                selected_phone = "-";
                            }

                            var html = '<div class="addByNewRaw" data-lastname="' + selected_lastname + '" data-firstname="' + selected_firstname + '" data-dbid="'+selected_dbid+'" data-id="'+selected_id+'" data-sex="'+selected_sex+'" data-phone="'+selected_phone+'">'+'<div>'+selected_lastname+selected_firstname+'</div>'+'<div>'+sexInfo+'</div>'+'<div>'+selected_phone+'</div>'+'<img src="/static/user/res/member/icon-x-red.png" class="substract_addedMember _addedByList">'+'</div>';

                            $('#addedMemberListBox').prepend(html);

                            added_New_Member_Num++;
                            $('#addedMemberListBox span').text(added_New_Member_Num+' 명');
                            $this.parents('div.list_addByList').remove();
                        }
                    }
                    check_dropdown_selected();
                }
                $this.removeClass('disabled_button');
            });
        }
    }
});

function disable_group_member_add_during_ajax(){
    $('.add_listedMember').addClass('disabled_button');
}
function enable_group_member_add_after_ajax(){
    $('.add_listedMember').removeClass('disabled_button');
}

function draw_memberlist_for_addByList(targetHTML){
    var bodywidth = window.innerWidth;
    $.ajax({
        url: '/trainer/get_member_list/',

        dataType: 'html',

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
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    //$('#page_managemember').show();
                }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                var len = jsondata.dIdArray.length;
                var htmlToJoin = ['<div class="list_addByList listTitle_addByList" style="border-color:#ffffff;text-align:center;">내 리스트에서 추가<span>닫기</span></div>'+'<div class="list_addByList listTitle_addByList"><div>'+'회원명(ID)'+'</div>'+'<div>'+'연락처'+'</div>'+'<div>추가</div>'+'</div>'];
                var addedNum = 0;
                var sexInfo;
                for(var i=1; i<=len; i++){
                    if($('#addedMemberListBox div[data-dbid="'+jsondata.dIdArray[i-1]+'"]').length == 0 && $('div.groupMembersWrap[data-groupid="'+$('#form_member_groupid').val()+'"] div.memberline[data-dbid="'+jsondata.dIdArray[i-1]+'"]').length == 0){ //추가될 리스트에 이미 있으면 목록에 보여주지 않는다.
                        sexInfo = '<img src="/static/user/res/member/icon-sex-'+jsondata.sexArray[i-1]+'.png">';
                        htmlToJoin[i] = '<div class="list_addByList_padding list_addByList" data-lastname="'+jsondata.lastNameArray[i-1]+'" data-firstname="'+jsondata.firstNameArray[i-1]+'" data-dbid="'+jsondata.dIdArray[i-1]+'" data-id="'+jsondata.idArray[i-1]+'" data-sex="'+jsondata.sexArray[i-1]+'" data-phone="'+jsondata.phoneArray[i-1]+'">'+
                                            '<div data-dbid="'+jsondata.dIdArray[i-1]+'">'+sexInfo+jsondata.nameArray[i-1]+' (ID: '+jsondata.idArray[i-1]+')'+'</div>'+
                                            '<div>'+jsondata.phoneArray[i-1]+'</div>'+
                                            '<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+
                                        '</div>';
                        addedNum++;
                    }
                }
                var len_finish = jsondata.finishDidArray.length;
                for(var j=1; j<=len_finish; j++){
                    if($('#addedMemberListBox div[data-dbid="'+jsondata.finishDidArray[j-1]+'"]').length == 0 && $('div.groupMembersWrap[data-groupid="'+$('#form_member_groupid').val()+'"] div.memberline[data-dbid="'+jsondata.finishDidArray[j-1]+'"]').length == 0){ //추가될 리스트에 이미 있으면 목록에 보여주지 않는다.
                        sexInfo = '<img src="/static/user/res/member/icon-sex-'+jsondata.finishsexArray[j-1]+'.png">';
                        htmlToJoin[i+j-1] = '<div class="list_addByList_padding list_addByList" data-lastname="'+jsondata.finishLastNameArray[j-1]+'" data-firstname="'+jsondata.finishFirstNameArray[j-1]+'" data-dbid="'+jsondata.finishDidArray[j-1]+'" data-id="'+jsondata.finishIdArray[j-1]+'" data-sex="'+jsondata.finishsexArray[j-1]+'" data-phone="'+jsondata.finishphoneArray[j-1]+'">'+
                                                '<div data-dbid="'+jsondata.finishDidArray[j-1]+'">'+sexInfo+jsondata.finishnameArray[j-1]+' (ID: '+jsondata.finishIdArray[j-1]+')'+'</div>'+
                                                '<div>'+jsondata.finishphoneArray[j-1]+'</div>'+
                                                '<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+
                                            '</div>';
                        addedNum++;
                    }
                }
                if(addedNum == 0){
                    htmlToJoin.push('<div class="list_addByList_padding list_addByList">'+'추가 가능한 회원이 없습니다.'+'</div>');
                }
                var html = htmlToJoin.join('');
                targetHTML.html(html);
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}
/////////////리스트에서 추가 버튼 누르면 회원리스트 팝업//////////////////////////////////



/////////////PTERS에서 ID로 검색해서 그룹원 추가하기/////////////////////////////////////////
$('button#addBySearch_search').click(function(e){
    e.preventDefault();
    var searchID = $('#addBySearch_input').val();
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
                draw_memberlist_for_addBySearch(jsondata);
            }

        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('아이디를 입력해주세요');
        }
    });
});

$('#subpopup_addBySearch .listTitle_addByList span, ._ADD_MEMBER_REG').click(function(e){
    if($('#subpopup_addBySearch').css('display') == "block"){
        $('#subpopup_addBySearch').hide();
        $('#searchedMemberListBox').html('');
        $('#addBySearch_input').val('');
        $('.groupMemberAddBox button').removeClass('disabled_button');
        if($('#pshade').css('z-index')==400) {
            shade_index(300);
        }else{
            shade_index(-100);
        }
    }
});

function draw_memberlist_for_addBySearch(jsondata){
    var lastname = jsondata.lastnameInfo;
    var firstname = jsondata.firstnameInfo;
    var phone = jsondata.phoneInfo;
    var birth = jsondata.birthdayInfo + ''; //형식 1999년 02월 08일
    var email = jsondata.emailInfo;
    var id = jsondata.idInfo;
    var dbid = jsondata.dbIdInfo;
    var sex = jsondata.sexInfo;


    var table = ['<div class="list_addByList listTitle_addByList"><div>'+'회원명(ID)'+'</div>'+'<div>'+'연락처'+'</div>'+'<div>추가</div>'+'</div>'];
    var sexInfo = '<img src="/static/user/res/member/icon-sex-'+sex+'.png">';
    var data = '<div class="list_addByList" data-lastname="'+lastname+'" data-firstname="'+firstname+'" data-dbid="'+dbid+'" data-id="'+id+'" data-sex="'+sex+'" data-phone="'+phone+'"><div data-dbid="'+dbid+'">'+sexInfo+lastname+firstname+' (ID: '+id+')'+'</div>'+'<div>'+phone+'</div>'+'<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember add_by_search"></div>'+'</div>';
    var html = table + data;

    $('#searchedMemberListBox').html(html);
}
/////////////PTERS에서 ID로 검색해서 그룹원 추가하기/////////////////////////////////////////




//ajax로 서버에 보낼 때, 추가된 회원들의 정보를 form에 채운다.
function added_member_info_to_jsonformat(){
    var fast_check = $('#fast_check').val();
    var search_confirm = $('#id_search_confirm').val();
    var group_id = $('#form_member_groupid').val();
    var counts;
    var price;
    var start_date;
    var end_date;
    var memo;
    if(fast_check == 1){
        counts = $('#memberCount_add').val();
        price = $('#lecturePrice_add_value').val();
        start_date = $('#datepicker_add').val();
        end_date = $('#datepicker2_add').val();
        memo = $('#comment').val();
    }else if(fast_check == 0){
        counts = $('#memberCount_add_fast').val();
        price = $('#lecturePrice_add_value_fast').val();
        start_date = $('#datepicker_fast').val();
        end_date = $('#memberDue_add_2_fast').val();
        memo = $('#comment_fast').val();
    }

    var dataObject = {
        "new_member_data":[],
        "old_member_data":[],
        "lecture_info":{
            "fast_check":fast_check,
            "memo": memo,
            "counts": counts,
            "price": price,
            "search_confirm": search_confirm,
            "start_date": start_date,
            "end_date": end_date,
            "group_id":group_id
        }
    };

    var len = $('#addedMemberListBox .addByNewRaw').length;
    for(var i=1; i<len+1; i++){
        var data;
        if($('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-dbid').length == 0){
            var firstname = $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-firstname');
            var lastname = $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-lastname');
            var phone = $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-phone');
            var sex = $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-sex');
            data = {
                "first_name" : firstname,
                "last_name" : lastname,
                "phone" : phone,
                "sex" : sex,
                "birthday_dt" : ""
            };
            dataObject.new_member_data.push(data);
        }else{
            data = {"db_id" : $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-dbid')};
            dataObject.old_member_data.push(data);
        }
    }

    return dataObject;
}


//////////////////////////////////그룹 목록 화면/////////////////////////////////////////
//그룹 리스트에서 그룹을 클릭하면 속해있는 멤버 리스트를 보여준다.
$(document).on('click', 'div.groupWrap', function(e){
    ticket_mutex_val = 0;
    e.stopPropagation();
    var package_id = $(this).attr('data-packageid');
    var memo_list =  $(this).siblings('div[data-packageid="'+package_id+'"].groupMemoWrap');
    var repeat_list = $(this).siblings('div[data-packageid="'+package_id+'"].groupRepeatWrap');
    var memberlist = $(this).siblings('div[data-packageid="'+package_id+'"].groupMembersWrap');
    var grouplist = $(this).siblings('div[data-packageid="'+package_id+'"].groupPackageWrap');
    if(bodywidth > 1000){
        if(memberlist.css('display')=='none'){
            //if(package_id != "1:1"){
                $(this).addClass('groupWrap_selected');
                memberlist.addClass('groupMembersWrap_selected').show();
                repeat_list.show();
                grouplist.show();
                if(bodywidth < 600){
                   memo_list.show();
                }
                if($(this).attr('data-packagestatecd')=='current'){
                    get_package_member_list(package_id);
                    get_grouplist_in_package(package_id,'current', "callback", function(jsondata){
                        draw_grouplist_in_package(grouplist, jsondata);
                    });
                }
                else{
                    get_end_package_member_list(package_id);
                    get_grouplist_in_package(package_id, 'finished', "callback", function(jsondata){
                        draw_grouplist_in_package(grouplist, jsondata);
                    });
                }
                get_group_repeat_info(package_id);
        }else{
            $(this).removeClass('groupWrap_selected');
            memberlist.removeClass('groupMembersWrap_selected').hide();
            repeat_list.hide();
            grouplist.hide();
            if(bodywidth < 600){
               memo_list.hide();
            }
            $(this).find('div._groupmanage img._info_delete').css('opacity', 0.4);
        }
    }else if(bodywidth <= 1000){
        var package_name = $(this).find('div._groupname_mobile').text();
        var package_type = $(this).find('div._grouptype_mobile').text();
        var package_membernum = $(this).find('div._groupparticipants_mobile > div:nth-of-type(2)').text();
        var package_memo = $(this).find('div._groupmemo_mobile > div:nth-of-type(2)').text();
        var package_status = $('div.pters_selectbox_btn_selected > span').text();
        var package_statuscd = $('div.pters_selectbox_btn_selected > span').attr('data-status');
        var $targetlecturelist = $('#popup_ticket_info_mobile_lecturelist');

        // var package_statuscd = $('div.pters_selectbox_btn_selected').attr('data-status');
        // var ticket_data;
        // if(package_statuscd == "current"){
        //     ticket_data = ticket_ing_list_cache;
        // }else if(package_statuscd == "finished"){
        //     ticket_data = ticket_end_list_cache;
        // }
        // var package_name = ticket_data[package_id].package_name;
        // var package_type = ticket_data[package_id].package_type_cd_nm;
        // var package_membernum = ticket_data[package_id].package_ing_member_num;
        // var package_memo = ticket_data[package_id].package_note;
        // var package_status = ticket_data[package_id].package_state_cd_name;
        // // var package_statuscd = ticket_data[package_id].package_statuscd;
        // var $targetlecturelist = $('#popup_ticket_info_mobile_lecturelist');

        current_Scroll_Position = $(document).scrollTop();
        $('#uptext3').text(package_name);
        // $('#page_managemember').css({'height':'0'});
        $('#page_managemember').css({'display':'none'});
        $('#page-base').css('display', 'none');
        $('#page-base-modifystyle').css('display', 'block');
        $('#upbutton-x, #upbutton-x-modify').attr('data-page', 'ticket_info');
        $('#popup_ticket_info_mobile_lecturelist').html('').attr("data-packageid", package_id);
        $('#popup_ticket_info_mobile').css({'display':'block'});
        set_ticket_info_for_mobile_popup(package_id, package_name, package_status, package_statuscd, package_type, package_membernum, package_memo);
        if($(this).attr('data-packagestatecd')=='current'){
            get_package_member_list(package_id);
            get_grouplist_in_package(package_id, package_statuscd, "callback", function(jsondata){
                draw_grouplist_in_package($targetlecturelist, jsondata);
            });
        }
        else{
            get_end_package_member_list(package_id);
            get_grouplist_in_package(package_id, package_statuscd, "callback", function(jsondata){
                draw_grouplist_in_package($targetlecturelist, jsondata);
            });
        }
        if(bodywidth<600){
            shade_index(100);
            $('#mshade').css('display', 'none');
        }
        
    }
});

//그룹 관리 아이콘 클릭시 자꾸 그룹원 정보가 닫히는 것을 방지
$(document).on('click', 'div._groupmanage', function(e){
    e.stopPropagation();
});
//그룹 리스트에서 그룹을 클릭하면 속해있는 멤버 리스트를 보여준다.

//그룹 리스트에서 그룹 삭제버튼을 누른다.
//var group_delete_JSON = {"group_id":"", "lecture_ids":[], "fullnames":[], "ids":[]}
var group_delete_JSON = {"package_id":"", "fullnames":[], "ids":[]};
$(document).on('click', '._groupmanage img._info_delete', function(e){
    e.stopPropagation();
    group_delete_JSON = {"package_id":"", "fullnames":[], "ids":[]};
    if($(this).css('opacity') == 1){
        deleteTypeSelect = 'packagedelete';
        $('#cal_popup_plandelete').show();
        $('#popup_delete_question').html('정말 삭제하시겠습니까? <br> 삭제하면 복구할 수 없습니다.');
        //삭제 확인팝업에서 확인할 수 있도록 삭제대상을 JSON 형식으로 만든다.
        var package_id = $(this).attr('data-packageid');
        var memberLen = $('div.memberline[data-packageid="'+package_id+'"]').length;
        for(var k=2; k<=memberLen+1; k++){
            //group_delete_JSON.lecture_ids.push($('div.groupMembersWrap[data-groupid="'+group_id+'"]').find('.memberline:nth-of-type('+k+')').attr('data-lecid'))
            group_delete_JSON.ids.push($('div.groupMembersWrap[data-packageid="'+package_id+'"]').find('.memberline:nth-of-type('+k+')').attr('data-dbid'));
            group_delete_JSON.fullnames.push($('div.groupMembersWrap[data-packageid="'+package_id+'"]').find('.memberline:nth-of-type('+k+')').attr('data-fullname'));
        }
        group_delete_JSON.package_id = package_id;
        shade_index(150);
    }else{
        alert('리스트를 펼쳐 확인 후 삭제 해주세요.');
    }

});

    //모바일
$(document).on('click', '#ticketdelete', function(e){
    e.stopPropagation();
    group_delete_JSON = {"package_id":"", "fullnames":[], "ids":[]};
    if($(this).css('opacity') == 1){
        deleteTypeSelect = 'packagedelete';
        $('#cal_popup_plandelete').show();
        $('#popup_delete_question').html('정말 삭제하시겠습니까? <br> 삭제하면 복구할 수 없습니다.');
        //삭제 확인팝업에서 확인할 수 있도록 삭제대상을 JSON 형식으로 만든다.
        var package_id = $(this).attr('data-packageid');
        var memberLen = $('#popup_ticket_info_mobile_memberlist div.memberline').length;
        for(var k=3; k<=memberLen+2; k++){
            //group_delete_JSON.lecture_ids.push($('div.groupMembersWrap[data-groupid="'+group_id+'"]').find('.memberline:nth-of-type('+k+')').attr('data-lecid'))
            group_delete_JSON.ids.push($('#popup_ticket_info_mobile_memberlist').find('div.memberline:nth-of-type('+k+')').attr('data-dbid'));
            group_delete_JSON.fullnames.push($('#popup_ticket_info_mobile_memberlist').find('div.memberline:nth-of-type('+k+')').attr('data-fullname'));
        }
        group_delete_JSON.package_id = package_id;
        shade_index(150);
    }else{
        alert('리스트를 펼쳐 확인 후 삭제 해주세요.');
    }
});
//그룹 리스트에서 그룹 삭제버튼을 누른다.


var ori_group_name;
var ori_group_capacity;
var ori_group_memo;
var ori_group_type;
//그룹 리스트에서 그룹 수정버튼을 누른다.
$(document).on('click', '._groupmanage img._info_modify', function(e){
    var bodywidth = window.innerWidth;
    if(!$(this).hasClass('disabled_button')){
        e.stopPropagation();
        var package_id = $(this).attr('data-packageid');
        var status = $(this).attr('data-edit');


        switch(status){
            case 'view':
                ori_group_name = $(this).parent('div').siblings('._groupname').find('input').val();
                ori_group_capacity = $(this).parent('div').siblings('._grouppartystatus').find('input').val();
                ori_group_memo = $(this).parent('div').siblings('._groupmemo').find('input').val();
                ori_group_type = $(this).parent('div').siblings('._grouptypecd').attr('data-package-type');

                $(this).attr({'data-edit':'edit', 'src':'/static/user/res/btn-pt-complete-small.png'});
                $(this).siblings('img._info_cancel').show();
                $(this).siblings('img._info_download, img._info_delete').hide();
                $('img._info_modify[data-edit="view"]').addClass('disabled_button');
                toggle_lock_unlock_inputfield_grouplist(package_id, false);
                break;
            case 'edit':
                var package_name = $(this).parent('div').siblings('._groupname').find('input').val();
                var package_memo;
                if(bodywidth < 600){
                    package_memo = $('div.groupMemoWrap[data-packageid="'+package_id+'"] input').val();
                }else{
                    package_memo = $(this).parent('div').siblings('._groupmemo').find('input').val();
                }
                if(package_memo.length == 0){
                    package_memo = " ";
                }

                $(this).attr({'data-edit':'view', 'src':'/static/user/res/member/icon-edit.png'});
                //toggle_lock_unlock_inputfield_grouplist(group_id, true)
                modify_package_from_list(package_id, package_name, package_memo);
                break;
        }

        //그룹 리스트에서 그룹 수정 취소 버튼을 누른다.
        $(document).on('click', 'img._info_cancel', function(e){
            $(this).hide();
            $(this).siblings('img._info_modify').attr({'data-edit':'view', 'src':'/static/user/res/member/icon-edit.png'});
            $('img._info_modify').removeClass('disabled_button');
            if(bodywidth > 600){
                $('img._info_download, img._info_delete').show();
            }else{
                $('img._info_delete').show();
            }
            $(this).parent('div').siblings('._groupname').find('input').val(ori_group_name);
            $(this).parent('div').siblings('._grouppartystatus').find('input').val(ori_group_capacity);
            $(this).parent('div').siblings('._groupmemo').find('input').val(ori_group_memo);
            toggle_lock_unlock_inputfield_grouplist(package_id, true);
            e.stopPropagation();
        });
        //그룹 리스트에서 그룹 수정 취소 버튼을 누른다.
    }

});

$(document).on('click', '._groupstatus_disabled_false', function(e){
    e.stopPropagation();
    $('#shade_caution').show();
    $('.lectureStateChangeSelectPopup').css('display', 'block').attr('data-packagetype', 'package');
    $('.lectureStateChangeSelectPopup ._complete').attr('data-packageid', $(this).attr('data-packageid'));
    $('.lectureStateChangeSelectPopup ._resume').attr('data-packageid', $(this).attr('data-packageid'));
    show_shadow_reponsively();
    var display_type = "block";
    if(bodywidth > 600){
        display_type = "inline-block";
    }
    if($(this).attr('data-packagestatus') == "IP"){
        var change_explain_text = '1) 소속된 회원의 수강권이 종료됩니다.';
        $('._explain').html(change_explain_text);
        $('._complete').css('display', display_type);
        $('._resume, ._refund, ._delete').css('display', 'none');
        $(document).on('click', 'div.lectureStateChangeSelectPopup ._complete', function(){
            if($('.lectureStateChangeSelectPopup').attr('data-packagetype')=='package'){
                modify_package_status($(this).attr('data-packageid'), 'complete');
            }else{
                // var lectureID = $('.lectureStateChangeSelectPopup').attr('data-leid');
                // var dbID = $('.lectureStateChangeSelectPopup').attr('data-dbid');
                // complete_member_reg_data_pc(lectureID, dbID);
                // $('.lectureStateChangeSelectPopup').css('display', 'none');
            }
            // $('#shade_caution').hide();
            // hide_shadow_responsively();
            // $('.lectureStateChangeSelectPopup').attr('data-grouptype','');
        });
    }else if($(this).attr('data-packagestatus') == "PE"){
        var change_explain_text = '1) 남은 횟수가 있는 소속된 회원의 수강권이 재개됩니다.';
        $('._explain').html(change_explain_text);
        $('._resume').css('display', display_type);
        $('._complete, ._refund, ._delete').css('display', 'none');
        $(document).on('click', 'div.lectureStateChangeSelectPopup ._resume', function(){
            if($('.lectureStateChangeSelectPopup').attr('data-packagetype')=='package'){
                modify_package_status($(this).attr('data-packageid'), 'resume');
            }else{
                // var lectureID = $('.lectureStateChangeSelectPopup').attr('data-leid');
                // var dbID = $('.lectureStateChangeSelectPopup').attr('data-dbid');
                // resume_member_reg_data_pc(lectureID, dbID);
                // $('.lectureStateChangeSelectPopup').css('display', 'none');
            }
            // $('#shade_caution').hide();
            // hide_shadow_responsively();
            // $('.lectureStateChangeSelectPopup').attr('data-grouptype', '');
        });
    }
});

$(document).on('click', '.groupWrap input', function(e){
    e.stopPropagation();
});
//그룹 리스트에서 그룹 수정버튼을 누른다.


//그룹 멤버 리스트에서 멤버 추가 버튼을 누른다.
$(document).on('click', 'img.btn_add_member_to_group, div.btn_add_member_to_ticket_mobile', function(){
    current_Scroll_Position = $(document).scrollTop();
    var bodywidth = window.innerWidth;
    // var package_id = $(this).parents('.groupMembersWrap').attr('data-packageid');
    // var package_name = $(this).parents('.groupMembersWrap').attr('data-packagename');
    // var package_capacity = $(this).parents('.groupMembersWrap').attr('data-packagecapacity');
    // var package_type = $(this).parents('.groupMembersWrap').attr('data-packagetype');
    var selected_status = $('.pters_selectbox_btn_selected').attr('data-status');
    var list_cached;
    if(selected_status == "current"){
        list_cached = ticket_ing_list_cache;
    }else if(selected_status == "finished"){
        list_cached = ticket_end_list_cache;
    }

    var package_id = $(this).attr('data-packageid');
    var package_name = list_cached[package_id]["package_name"];

    if(bodywidth < 600){
        float_btn_managemember("groupmember");
    }else{
        pc_add_member('groupmember');
    }
    $('#uptext2, #uptext2_PC').text('수강권 인원 추가'+' ('+package_name+')');
    $('#form_member_groupid').val(package_id);
});
//그룹 멤버 리스트에서 멤버 추가 버튼을 누른다.


//서버로부터 그룹 목록 가져오기
function get_group_ing_list(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴하고 드랍다운을 생성
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_group_ing_list/',

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
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);
                }else{
                    //group_class_ListHtml('current',jsondata)
                }

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



//서버로부터 그룹 목록 가져오기
function get_group_end_list(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴하고 드랍다운을 생성
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_group_end_list/',

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
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);
                }else{
                    //group_class_ListHtml('finished',jsondata)
                }

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
//서버로부터 그룹 목록 가져오기

//그룹 지우기
function delete_group_from_list(group_id, use, callback){
    var bodywidth = window.innerWidth;
    var next_page = '/trainer/get_group_ing_list';
    if($('#currentGroupList').css('display') == "block"){
        next_page = '/trainer/get_group_ing_list';
    }else if($('#finishedGroupList').css('display') == "block"){
        next_page = '/trainer/get_group_end_list';
    }
    $.ajax({
        url:'/trainer/delete_group_info/',
        type:'POST',
        data: {"group_id":group_id, "next_page":next_page},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            pters_option_inspector("group_delete", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                // if($('#currentGroupList').css('display') == "block"){
                //     get_member_group_class_ing_list("callback", function(jsondata){
                //         var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
                //         var member_Html = memberlist.html;
                //         var group_class_Html = group_class_ListHtml('current', jsondata);
                //         $('#currentGroupList').html(group_class_Html);
                //     });
                // }else if($('#finishedGroupList').css('display') == "block"){
                //     get_member_group_class_end_list("callback", function(jsondata){
                //         var memberlist = ptmember_ListHtml('finished', 'name', 'no', jsondata);
                //         var member_Html = memberlist.html;
                //         var group_class_Html = group_class_ListHtml('finished', jsondata);
                //         $('#finishedGroupList').html(group_class_Html);
                //     });
                // }
                smart_refresh_member_group_class_list();
                if(use == "callback"){
                    callback();
                }

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
//그룹 지우기

//그룹원 지우기
function delete_groupmember_from_grouplist(use, callback){
    $.ajax({
        url:'/trainer/delete_group_member_info/',
        type:'POST',
        data:JSON.stringify(group_delete_JSON),
        //data:{"member_name":fullname, "member_id":id, "group_id":group_id, "next_page":'/trainer/get_group_info/'},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            pters_option_inspector("groupmember_delete", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            enable_delete_btns_after_ajax();
            var jsondata = JSON.parse(data);
            //ajax_received_json_data_member_manage(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                get_group_ing_list("callback", function(json){
                    group_class_ListHtml('current', json);
                });
                console.log('success');
                if(use == "callback"){
                    callback();
                }
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}
//그룹원 지우기

//그룹 정보 수정
function modify_group_from_list(group_id, group_name, group_capacity, group_memo, group_type){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/update_group_info/',
        type:'POST',
        data: {"group_id":group_id, "name":group_name, "member_num":group_capacity, "note":group_memo, "group_type_cd":group_type},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            pters_option_inspector("group_update", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                // if($('#currentGroupList').css('display') == "block"){
                //     get_member_group_class_ing_list("callback", function(jsondata){
                //         var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
                //         var member_Html = memberlist.html;
                //         var group_class_Html = group_class_ListHtml('current', jsondata);
                //         $('#currentGroupList').html(group_class_Html);
                //     });
                // }else if($('#finishedGroupList').css('display') == "block"){
                //     get_member_group_class_end_list("callback", function(jsondata){
                //         var memberlist = ptmember_ListHtml('finished', 'name', 'no', jsondata);
                //         var member_Html = memberlist.html;
                //         var group_class_Html = group_class_ListHtml('finished', jsondata);
                //         $('#finishedGroupList').html(group_class_Html);
                //     });
                // }
                smart_refresh_member_group_class_list();

                toggle_lock_unlock_inputfield_grouplist(group_id, true);
                $('img._info_cancel').hide();
                if(bodywidth > 600){
                    $('img._info_download, img._info_delete').show();
                }else{
                    $('img._info_delete').show();
                }
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
//그룹 정보 수정

//그룹 완료/재개 하기
function modify_group_status(group_id, option){
    var bodywidth = window.innerWidth;
    var _URL;
    if(option == 'complete'){
        _URL = '/trainer/finish_group_info/';
    }else if(option == 'resume'){
        _URL = '/trainer/progress_group_info/';
    }

    $.ajax({
        url: _URL,
        type:'POST',
        data: {"group_id":group_id},
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
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                // if($('#currentGroupList').css('display') == "block"){
                //     get_member_group_class_ing_list("callback", function(jsondata){
                //         var memberlist = ptmember_ListHtml('current', 'name', 'no', jsondata);
                //         var member_Html = memberlist.html;
                //         var group_class_Html = group_class_ListHtml('current', jsondata);
                //         $('#currentGroupList').html(group_class_Html);
                //     });
                // }else if($('#finishedGroupList').css('display') == "block"){
                //     get_member_group_class_end_list("callback", function(jsondata){
                //         var memberlist = ptmember_ListHtml('finished', 'name', 'no', jsondata);
                //         var member_Html = memberlist.html;
                //         var group_class_Html = group_class_ListHtml('finished', jsondata);
                //         $('#finishedGroupList').html(group_class_Html);
                //     });
                // }
                
                smart_refresh_member_group_class_list();
                $('.lectureStateChangeSelectPopup').css('display', 'none');

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

//그룹 완료/재개 하기


//회원목록을 테이블로 화면에 뿌리는 함수
var g_ptmembernum;
function ptmember_ListHtml(type, option, Reverse, jsondata){
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
            countList = data.countSorted;
            nameList = data.nameSorted;
            dateList = data.dateSorted;
            $table = $('#currentMember');
            $tabletbody = $('#currentMember tbody');
            $membernum = $('#memberNumber_current_member');
            text_membernum = "진행중인 회원 ";
            break;
        case 'finished':
            data = DataFormatting(jsondata);
            countList = data.countSorted;
            nameList = data.nameSorted;
            dateList = data.dateSorted;
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
    // var arrayforemail;
    var name;
    var id;
    var dbId;
    var contents;
    var count;
    var regcount;
    var starts;
    var ends;
    var phoneToEdit;
    var groupType;
    var groupType2;
    var groupType3;
    var member_number = 0;
    var full_data = '';
    for(var i=0; i<len; i++){
        if(option == "count") {
            full_data = countLists[i];
            array = countLists[i].split('/');
        }else if(option == "name"){
            full_data = nameLists[i];
            array = nameLists[i].split('/');
        }else if(option == "date") {
            full_data = dateLists[i];
            array = dateLists[i].split('/');
        }
        if(full_data.split('/').indexOf('1:1') >= 0){
            member_number++;
            if(option == "count"){
                // array = countLists[i].split('/');
                email = array[8];
                name = array[2];
                id = array[3];
                dbId = array[13];
                contents = array[5];
                count = array[0];
                regcount = array[1];
                starts = array[6];
                ends = array[7];
                phoneToEdit = array[4].replace(/-| |/gi, "");
                if(name.length>10){
                    name = array[2].substr(0,9)+'..';
                }
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
                // array = nameLists[i].split('/');
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
                // array = dateLists[i].split('/');
                // arrayforemail = dateLists[i].split('/');
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

            var start = starts.substr(0, 4)+'.'+starts.substr(4, 2)+'.'+starts.substr(6, 2);
            var end = ends.substr(0, 4)+'.'+ends.substr(4, 2)+'.'+ends.substr(6, 2);
            if(end == "9999.12.31"){
                end = text;
            }

            var phone;
            if(phoneToEdit.substr(0, 2)=="02"){
                phone = phoneToEdit.substr(0, 2)+'-'+phoneToEdit.substr(2, 3)+'-'+phoneToEdit.substr(5, 4);
            }else{
                phone = phoneToEdit.substr(0, 3)+'-'+phoneToEdit.substr(3, 4)+'-'+phoneToEdit.substr(7, 4);
            }


            count = remove_front_zeros(count);
            regcount = remove_front_zeros(regcount);

            var phonenum = '<a class="phonenum" href="tel:'+phone+'">'+phone+'</a>';
            var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms">'+phonenum+'</a>';
            var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>';
            var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">';
            var pcprintimage = '<img src="/static/user/res/member/pters-print.png" class="pcmanageicon _info_print" title="프린트">';
            /*
            var pcdownloadimage = '<img src="/static/user/res/member/pters-download.png" class="pcmanageicon _info_download" title="엑셀 다운로드">';
            var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제">';
            var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="Edit">';
            */
            var pcinfoimage = '<img src="/static/user/res/member/icon-info.png" class="pcmanageicon _info_view" title="Info">';
            var pcdownloadimage = '<img src="/static/user/res/member/pters-download.png" class="pcmanageicon _info_download" title="엑셀 다운로드" data-groupid="1:1">';
            var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제" data-groupid="1:1">';
            var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="수정" data-groupid="1:1" data-edit="view">';
            var pceditcancelimage = '<img src="/static/user/res/member/icon-x-red.png" class="pcmanageicon _info_cancel" title="취소" data-groupid="1:1">';
            var manageimgs = '<div class="_manage"><img src="/static/user/res/member/icon-x-red.png" class="substract_groupMember" data-fullname="'+name+'" data-id="'+id+'" data-dbid="'+dbId+'" data-groupid="1:1" hidden></div>';

            var grouptypetd = '<div class="_grouptype" data-name="'+groupType+groupType2+groupType3+'">'+groupType+groupType2+groupType3+'</div>';
            var nametd = '<div class="_tdname" data-name="'+name+'" title="'+name+'">'+/*newReg+*/name+'</div>';
            var idtd = '<div class="_id" data-name="'+id+'" data-dbid="'+dbId+'" title="'+id+'">'+id+'</div>';
            var emailtd = '<div class="_email">'+email+'</div>';
            var phone = '<div class="_contact" data-phone="'+phone+'">'+phone+'</div>';
            var regcounttd = '<div class="_regcount">'+regcount+'</div>';
            var remaincounttd = '<div class="_remaincount">'+count+'</div>';
            var startdatetd = '<div class="_startdate">'+start+'</div>';
            var enddatetd = '<div class="_finday">'+end+'</div>';
            /*
            if(phoneToEdit != ""){
                var mobiletd = '<div class="_contact">'+phoneimage+smsimage+'</div>';
            }else{
                var mobiletd = '<div class="_contact">-'+'</div>';
            }
            var pctd = '<div class="_manage">'+pcinfoimage+pceditimage+pcdownloadimage+pcdeleteimage+'</div>';
            */
            var scrolltd = '<div class="forscroll"></div>';
            var order = '<div class="_countnum">'+(i+1)+'</div>';
            // var td = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+grouptypetd+idtd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+'</tr>';
            // arrayResult[i] = td;
            //arrayResult[i] = '<tr class="memberline">'+order+nametd+grouptypetd+idtd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+'</tr>';
            arrayResult[i] = '<div class="memberline">'+nametd+idtd+regcounttd+remaincounttd+startdatetd+enddatetd+phone+manageimgs+'</div>';
        }
    }
    $membernum.html(text_membernum+'<span style="font-size:16px;">'+len+'</span>'+'명');

    if(bodywidth < 600){
        arrayResult.unshift('<div class="groupmemberline_thead">'+
                        '<div class="_tdname">회원명</div>'+
                        //'<div class="_id">회원 ID</div>'+
                        '<div class="_regcount">등록 횟수</div>'+
                        '<div class="_remaincount">남은 횟수</div>'+
                        //'<div class="_startdate">시작일</div>'+
                        //'<div class="_finday">종료일</div>'+
                        //'<div class="_contact">연락처</div>'+
                        '<div class="_manage">관리</div>'+
                        '</div>');
    }else if(bodywidth >= 600){
        arrayResult.unshift('<div class="groupmemberline_thead">'+
                        '<div class="_tdname">회원명</div>'+
                        '<div class="_id">회원 ID</div>'+
                        '<div class="_regcount">등록 횟수</div>'+
                        '<div class="_remaincount">남은 횟수</div>'+
                        '<div class="_startdate">시작일</div>'+
                        '<div class="_finday">종료일</div>'+
                        '<div class="_contact">연락처</div>'+
                        '<div class="_manage">관리</div>'+
                        '</div>');
    }

    var resultToAppend = arrayResult.join("");

    if(type=='current' && len == 0){
        resultToAppend = '<div class="_nomember" rowspan="9" style="height:50px;padding-top: 17px !important;">등록 된 회원이 없습니다.</div>';
        if(bodywidth > 600){
            $('#please_add_member_pc').show();
        }else{
            $('#please_add_member').show();
        }
    }else if(type=="finished" && len == 0){
        resultToAppend = '<div class="" rowspan="9" style="height:50px;padding-top: 17px !important;">종료 된 회원이 없습니다.</div>';
    }
    var result = tbodyStart + resultToAppend + tbodyEnd;
    //$tabletbody.remove();
    //$table.append(result);
    g_ptmembernum = member_number;
    return {"html": result, "number": member_number};
}


//그룹 목록을 화면에 뿌리기
var $membernum;
var $targetHTML;
var text_membernum;
function group_class_ListHtml(option, jsondata){ //option : current, finished
    switch(option){
        case 'current':
            $membernum = $('#memberNumber_current_group');
            $targetHTML = $('#currentGroupList');
            text_membernum = "진행중인 그룹 ";
            break;
        case 'finished':
            $membernum = $('#memberNumber_finish_group');
            $targetHTML = $('#finishedGroupList');
            text_membernum = "종료된 그룹 ";
            break;
    }
    var htmlToAdd = [];
    var htmlToJoin = [];
    var htmlToJoin2 = [];
    var groupNum = jsondata.group_id.length;
    var ordernum = 0;
    for(var i=0; i<groupNum; i++){
        var group_name = jsondata.group_name[i];
        var group_id = jsondata.group_id[i];
        var group_type = jsondata.group_type_cd[i];
        var group_type_nm = jsondata.group_type_cd_nm[i];
        var group_createdate = date_format_to_yyyymmdd(jsondata.group_reg_dt[i].split(' ')[0]+' '+jsondata.group_reg_dt[i].split(' ')[1]+' '+jsondata.group_reg_dt[i].split(' ')[2], '-');
        var group_memo = jsondata.group_note[i];
        var group_memberlist = [];
        var group_capacity = jsondata.member_num[i];
        var groupstatus = jsondata.state_cd_name[i];
        var groupstatus_cd = jsondata.state_cd[i];

        var group_membernum;
        switch(option){
            case 'current':
                group_membernum = jsondata.group_member_num[i];
                break;
            case 'finished':
                group_membernum = jsondata.end_group_member_num[i];
                break;
        }

        ordernum++;
        var full_group = "";
        if(group_membernum == group_capacity && group_type == "NORMAL"){
            var full_group = "red_color_text";
        }

        var pcdownloadimage = '<img src="/static/user/res/member/pters-download.png" class="pcmanageicon _info_download" title="엑셀 다운로드" data-groupid="'+group_id+'">';
        var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제" data-groupid="'+group_id+'">';
        var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="수정" data-groupid="'+group_id+'" data-edit="view">';
        var pceditcancelimage = '<img src="/static/user/res/member/icon-x-red.png" class="pcmanageicon _info_cancel" title="취소" data-groupid="'+group_id+'">';
        var img_lock_function = '<img src="/static/user/res/login/icon-lock-grey.png" class="pcmanageicon lock_function" title="기능 구매후 이용 가능" onclick="purchase_annai()">';

        var htmlstart = '<div class="groupWrap" data-groupstatecd="'+option+'" data-groupid="'+group_id+'">';
        var htmlend = '</div>';
        var memolist = '<div class="groupMemoWrap" data-groupid="'+group_id+'">메모: '+'<input class="input_disabled_true _editable" value="'+group_memo+'" disabled>'+'</div>';
        var repeatlist = '<div class="groupRepeatWrap" data-groupid="'+group_id+'"></div>';
        var memberlist = '<div class="groupMembersWrap" data-groupid="'+group_id+'" data-groupname="'+group_name+'" data-groupcapacity="'+group_capacity+'" data-grouptype="'+group_type+'">'+group_memberlist+'</div>';

        if(group_type == "ONE_TO_ONE") {
            manageimgs = '<div class="_groupmanage"></div>';
        }
        else{
            var manageimgs = '<div class="_groupmanage">' + pceditimage + pceditcancelimage + pcdeleteimage + '</div>';
            if (Options.auth_class == 0) {
                manageimgs = '<div class="_groupmanage">' + img_lock_function + '</div>';
            }
        }

        var main = '<div class="_groupnum">'+ordernum+'</div>'+
            '<div class="_grouptypecd" data-group-type="'+group_type+'" style="display:none;"><input class="group_listinput input_disabled_true" value="'+group_type_nm+'" disabled>'+'</div>'+
            '<div class="_groupname"><input class="group_listinput input_disabled_true _editable" value="'+'['+group_type_nm+'] '+group_name+'" disabled>'+'</div>'+
            '<div class="_groupparticipants '+full_group+'">'+ group_membernum+'</div>'+
            '<div class="_groupcapacity">'+'<input style="width:25px;" class="group_listinput input_disabled_true _editable '+full_group+'" value="'+group_capacity+'" disabled>'+'</div>'
            if(group_type == "ONE_TO_ONE") {
                main += '<div class="_grouppartystatus '+"full_group"+'"><span>'+ group_membernum + ' </span> ' +'</div>';
            }
            else{
                main += '<div class="_grouppartystatus ' + full_group + '">' + '<div class="group_member_current_num">' + group_membernum + '</div>' + '<span></div>'
            }
            main += '<div class="_groupmemo"><input class="group_listinput input_disabled_true _editable" value="'+group_memo+'" disabled>'+'</div>'

            if(group_type == "ONE_TO_ONE"){
                main += '<div class="_groupcreatedate"><input class="group_listinput input_disabled_true" value="'+'기본 생성'+'" disabled>'+'</div>';
            }
            else{
                main += '<div class="_groupcreatedate"><input class="group_listinput input_disabled_true" value="'+date_format_yyyymmdd_to_yyyymmdd_split(group_createdate, '.')+'" disabled>'+'</div>'
            }
            main += '<div class="_groupstatus" data-groupid="'+group_id+'">'+'<span class="_editable _groupstatus_'+groupstatus_cd+'" data-groupstatus="'+groupstatus_cd+'" data-groupid="'+group_id+'">'+groupstatus+'</span>'+'</div>'+ manageimgs;
            //'<div class="_groupmanage">'+pceditimage+pceditcancelimage+pcdeleteimage+'</div>'

        if(group_type == "EMPTY"){
            htmlToJoin.push(htmlstart+main+htmlend+memolist+repeatlist+memberlist);
        }else if(group_type == "NORMAL"){
            htmlToJoin2.push(htmlstart+main+htmlend+memolist+repeatlist+memberlist);
        }else if(group_type == "ONE_TO_ONE"){
            htmlToAdd.push(htmlstart+main+htmlend+memolist+repeatlist+memberlist);
        }

    }

    if(htmlToJoin.length == 0){
        if(option == "current"){
            htmlToJoin.push('<div class="groupWrap" data-groupstatecd="'+option+'" style="height:50px;padding-top:17px !important">추가 된 그룹이 없습니다.</div>');
        }else if(option == "finished"){
            htmlToJoin.push('<div class="groupWrap" data-groupstatecd="'+option+'" style="height:50px;padding-top:17px !important">종료 된 그룹이 없습니다.</div>');
        }
    }
    $membernum.html(text_membernum+'<span style="font-size:16px;">'+jsondata.total_group_num+'</span>');
    //$targetHTML.html(htmlToJoin2.join('') + htmlToJoin.join(''))
    return htmlToAdd+ htmlToJoin2.join('') + htmlToJoin.join('');
}
//그룹원 목록을 그룹에 뿌리기
function get_groupmember_list(group_id, use, callback){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/get_group_member/',
        data: {"group_id":group_id},
        type:'GET',
        dataType : 'html',

        beforeSend:function(xhr){
            beforeSend();
            pters_option_inspector("group_read", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                if(use == 'callback'){
                    callback(jsondata)
                }else{
                    groupMemberListSet(group_id, jsondata)
                    $('div._groupmanage img._info_delete[data-groupid="'+group_id+'"]').css('opacity', 1)
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

//그룹원 목록을 그룹에 뿌리기
function get_end_groupmember_list(group_id, use, callback){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/get_end_group_member/',
        data: {"group_id":group_id},
        type:'GET',
        dataType : 'html',

        beforeSend:function(xhr){
            beforeSend();
            pters_option_inspector("group_read", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            console.log(jsondata);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                if(use == 'callback'){
                    callback(jsondata)
                }else{
                    groupMemberListSet(group_id, jsondata)
                    $('div._groupmanage img._info_delete[data-groupid="'+group_id+'"]').css('opacity', 1)
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
//그룹원 목록을 그룹에 뿌리기

//그룹원 목록을 그룹에 그리기 
function groupMemberListSet(group_id, jsondata){
    var htmlToJoin = [];
    if(bodywidth < 600){
        htmlToJoin.push('<div class="groupmemberline_thead">'+
                        '<div class="_tdname">회원명</div>'+
                        //'<div class="_id">회원 ID</div>'+
                        '<div class="_regcount">등록 횟수</div>'+
                        '<div class="_remaincount">남은 횟수</div>'+
                        //'<div class="_startdate">시작일</div>'+
                        //'<div class="_finday">종료일</div>'+
                        //'<div class="_contact">연락처</div>'+
                        '<div class="_manage">관리</div>'+
                        '</div>');
    }else if(bodywidth >= 600){
        htmlToJoin.push('<div class="groupmemberline_thead">'+
                        '<div class="_tdname">회원명</div>'+
                        '<div class="_id">회원 ID</div>'+
                        '<div class="_regcount">등록 횟수</div>'+
                        '<div class="_remaincount">남은 횟수</div>'+
                        '<div class="_startdate">시작일</div>'+
                        '<div class="_finday">종료일</div>'+
                        '<div class="_contact">연락처</div>'+
                        '<div class="_manage">관리</div>'+
                        '</div>');
    }
    var len = jsondata.db_id.length;
    var groupcapacity = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-groupcapacity');
    var grouptype = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-grouptype');

    for(var i=0; i<len; i++){
        var groupmember_dbid = jsondata.db_id[i];
        var groupmember_id = jsondata.member_id[i];
        var groupmember_lecid = jsondata.lecture_id[i];
        var groupmember_lastname = jsondata.last_name[i];
        var groupmember_firstname = jsondata.first_name[i];
        var groupmember_regcount = jsondata.reg_count[i];
        var groupmember_remcount = jsondata.rem_count[i];
        var groupmember_startdate = jsondata.start_date[i];
        var groupmember_enddate = jsondata.end_date[i];
        var groupmember_phone = jsondata.phone[i];

        var htmlStart = '<div class="memberline" data-id="'+groupmember_id+'" data-dbid="'+groupmember_dbid+'" data-groupid="'+group_id+'" data-lecid="'+groupmember_lecid+'" data-fullname="'+groupmember_lastname+groupmember_firstname+'">';
        var htmlEnd = '</div>';

        var memberRow;
        if(bodywidth < 600){
            memberRow = htmlStart +
            '<div class="_tdname" data-name="'+groupmember_lastname+groupmember_firstname+'">'+groupmember_lastname+groupmember_firstname+'</div>' +
            '<div class="_id" data-dbid="'+groupmember_dbid+'" data-name="'+groupmember_id+'">'+groupmember_id+'</div>' +
            '<div class="_regcount" data-name="'+groupmember_regcount+'">'+groupmember_regcount+'</div>' +
            '<div class="_remaincount" data-name="'+groupmember_remcount+'">'+groupmember_remcount+'</div>'
            //'<div class="_startdate" data-name="'+groupmember_startdate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_startdate,'.')+'</div>' +
            //'<div class="_finday" data-name="'+groupmember_enddate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_enddate,'.')+'</div>' +
            //'<div class="_contact" data-name="'+groupmember_phone+'">'+groupmember_phone+'</div>' +
            if(grouptype!='ONE_TO_ONE') {
                memberRow += '<div class="_manage"><img src="/static/user/res/member/icon-x-red.png" class="substract_groupMember" data-fullname="' + groupmember_lastname + groupmember_firstname + '" data-id="' + groupmember_id + '" data-dbid="' + groupmember_dbid + '" data-groupid="' + group_id + '"></div>'
            }else{
                 memberRow += '<div class="_manage"></div>'
            }
            memberRow += htmlEnd;
        }else if(bodywidth >= 600){
            memberRow = htmlStart +
            '<div class="_tdname" data-name="'+groupmember_lastname+groupmember_firstname+'" title="'+groupmember_lastname+groupmember_firstname+'">'+groupmember_lastname+groupmember_firstname+'</div>' +
            '<div class="_id" data-dbid="'+groupmember_dbid+'" data-name="'+groupmember_id+'" title="'+groupmember_id+'">'+groupmember_id+'</div>' +
            '<div class="_regcount" data-name="'+groupmember_regcount+'">'+groupmember_regcount+'</div>' +
            '<div class="_remaincount" data-name="'+groupmember_remcount+'">'+groupmember_remcount+'</div>' +
            '<div class="_startdate" data-name="'+groupmember_startdate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_startdate,'.')+'</div>' +
            '<div class="_finday" data-name="'+groupmember_enddate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_enddate,'.')+'</div>' +
            '<div class="_contact" data-name="'+groupmember_phone+'">'+groupmember_phone+'</div>'

            if(grouptype!='ONE_TO_ONE'){
                memberRow += '<div class="_manage"><img src="/static/user/res/member/icon-x-red.png" class="substract_groupMember" data-fullname="'+groupmember_lastname+groupmember_firstname+'" data-id="'+groupmember_id+'" data-dbid="'+groupmember_dbid+'" data-groupid="'+group_id+'"></div>'
            }else{
                 memberRow += '<div class="_manage"></div>';
            }
            memberRow += htmlEnd;
        }


        htmlToJoin.push(memberRow);
    }

    var EMPTY_EXPLAIN;
    if(grouptype == 'EMPTY'){
        //var group_type = group_capacity+"인 공개"
        EMPTY_EXPLAIN = "<p style='color:#fe4e65;font-size:11px;'>이 클래스 소속인원은 이 클래스명으로 개설된 레슨에 예약 가능하며, 클래스 소속인원수는 제한이 없습니다. 수업당 정원은 "+groupcapacity+" 명입니다.</p>";
    }else if(grouptype == "NORMAL"){
        //var group_type = group_capacity+"인 비공개"
        EMPTY_EXPLAIN = "";
    }else{
        EMPTY_EXPLAIN = "";
    }

    var addButton = '';

    if(groupcapacity <= len && grouptype =='NORMAL'){
        addButton = '';
    }else{
        addButton = '<div><img src="/static/user/res/floatbtn/btn-plus.png" class="btn_add_member_to_group" data-grouptype="'+grouptype+'" data-groupid="'+group_id+'"></div>';
    }

    if(grouptype=='ONE_TO_ONE' || $('#finishedGroupList').css('display') == "block"){
        addButton = '';
    }

    var html = htmlToJoin.join('') + addButton;
    if(jsondata.db_id.length == 0){
        if($('#currentGroupList').css('display') == "block"){
            if(grouptype == 'EMPTY') {
                html = '<p">이 클래스에 소속 된 회원이 없습니다.</p><div>' + addButton;
            }else if(grouptype == 'NORMAL'){
                html = '<p">이 그룹에 소속 된 회원이 없습니다.</p><div>' + addButton;
            }
        }
    }

    $('div.groupMembersWrap[data-groupid="'+group_id+'"]').html(EMPTY_EXPLAIN+html);
}
//그룹원 목록을 그룹에 그리기

//수강권 목록에서 관리의 x 버튼으로 수강권에서 회원 빼기
$(document).on('click', 'img.substract_groupMember', function(e){
    e.stopPropagation();

    var groupmember_name = $(this).attr('data-fullname');
    var groupmember_dbid = $(this).attr('data-dbid');
    var groupmember_groupid = $(this).attr('data-groupid');
    var groupname = $(`div.groupWrap[data-packageid="${groupmember_groupid}"] ._groupname input`).val();
    group_delete_JSON = {"package_id":"", "fullnames":[], "ids":[]};
    group_delete_JSON.ids.push(groupmember_dbid);
    group_delete_JSON.fullnames.push(groupmember_name);
    group_delete_JSON.package_id = groupmember_groupid;

    $('#cal_popup_plandelete').css('display','block');
    $('#popup_delete_question').text(`${groupname}에서 ${groupmember_name}님을 제외 하시겠습니까?`);
    deleteTypeSelect = "ticketMember_Substract_From_Group";
    shade_index(150);
});

$('#popup_delete_btn_yes').click(function(){
    var bodywidth = window.innerWidth;
    //if(ajax_block_during_delete_weekcal == true){
    if(!$(this).hasClass('disabled_button')){
        //ajax_block_during_delete_weekcal = false;
        if(deleteTypeSelect == "ticketMember_Substract_From_Group"){
            disable_delete_btns_during_ajax();
            delete_ticketmember_from_grouplist('callback', function(){
                close_info_popup('cal_popup_plandelete');
                smart_refresh_member_group_class_list();
            });
        }
    }
});



function disable_delete_btns_during_ajax(){
    $('#popup_delete_btn_yes, #popup_delete_btn_no').addClass('disabled_button');
    //ajax_block_during_delete_weekcal = false;
}

function enable_delete_btns_after_ajax(){
    $('#popup_delete_btn_yes, #popup_delete_btn_no').removeClass('disabled_button');
    //ajax_block_during_delete_weekcal = false;
}
//////////////////////////////////그룹 목록 화면/////////////////////////////////////////


/////////////////////////////그룹 반복일정 조회 및 그리기/////////////////////////////
//서버로부터 회원의 반복일정 정보를 받아온다.
function get_group_repeat_info(group_id){
    $.ajax({
        url: '/trainer/get_group_repeat_schedule_list/',
        type:'GET',
        data: {"group_id": group_id},
        dataType : 'html',

        beforeSend:function(xhr){
            //beforeSend(); //ajax 로딩이미지 출력
            pters_option_inspector("group_read", xhr, "");
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                set_group_repeat_info(jsondata, group_id);
            }
        },

        complete:function(){
            //completeSend(); //ajax 로딩이미지 숨기기
        },

        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}

//서버로부터 받아온 반복일정을 회원정보 팝업에 그린다.
function set_group_repeat_info(jsondata, group_id){
    var $regHistory =  $('div[data-groupid="'+group_id+'"].groupRepeatWrap');

    var text;
    var text2;
    var text3;
    if(Options.language == "KOR"){
        text = '시';
        text2 = '시간';
        text3 = '반복 : ';
    }else if(Options.language == "JPN"){
        text = '時';
        text2 = '時間';
        text3 = '繰り返し : ';
    }else if(Options.language == "ENG"){
        text = '';
        text2 = 'h';
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
    var len = jsondata.repeatScheduleIdArray.length;
    var repeat_schedule_id_array = jsondata.repeatScheduleIdArray;
    var repeat_type_array = jsondata.repeatScheduleTypeArray;
    var repeat_day_info_raw_array = jsondata.repeatScheduleWeekInfoArray;
    var repeat_start_array = jsondata.repeatScheduleStartDateArray;
    var repeat_end_array = jsondata.repeatScheduleEndDateArray;
    var repeat_time_array = jsondata.repeatScheduleStartTimeArray;
    var repeat_endTime_array = jsondata.repeatScheduleEndTimeArray;
    var repeat_dur_array = jsondata.repeatScheduleTimeDurationArray;

    var schedulesHTML = [];
    for(var i=0; i<len; i++){
        var repeat_id = repeat_schedule_id_array[i];
        var repeat_type = repeat_info_dict[Options.language][repeat_type_array[i]];
        var repeat_start = repeat_start_array[i].replace(/-/gi,".");
        var repeat_start_text = "<span class='summaryInnerBoxText_Repeatendtext'>"+text3+"</span>";
        //var repeat_end_text = "<span class='summaryInnerBoxText_Repeatendtext'>반복종료 : </span>"
        var repeat_end_text = "";
        var repeat_end = repeat_end_array[i].replace(/-/gi,".");
        var repeat_time = Number(repeat_time_array[i].split(':')[0]); // 06 or 18
        var repeat_min = Number(repeat_time_array[i].split(':')[1]);  // 00 or 30

        if(repeat_min == "30"){
            repeat_time = Number(repeat_time_array[i].split(':')[0])+0.5;
        }
        var repeat_dur = calc_duration_by_start_end(repeat_start_array[i], repeat_time_array[i], repeat_end_array[i], repeat_endTime_array[i]);
        if(repeat_dur - parseInt(repeat_dur) == 0.5){
            if(parseInt(repeat_dur) != 0){
                repeat_dur = parseInt(repeat_dur)+'시간' + ' 30분';
            }else if(parseInt(repeat_dur) == 0){
                repeat_dur = '30분';
            }
        }else{
            repeat_dur = repeat_dur + '시간';
        }
        //var repeat_dur = Number(repeat_dur_array[i])/(60/Options.classDur)
        var repeat_sum = Number(repeat_time) + Number(repeat_dur);

        var repeat_end_time_hour = parseInt(repeat_sum);
        var repeat_end_time_min;
        if(parseInt(repeat_sum)<10){
            repeat_end_time_hour = '0'+parseInt(repeat_sum);
        }
        if((repeat_sum%parseInt(repeat_sum))*60 == 0){
            repeat_end_time_min = '00';
        }else if((repeat_sum%parseInt(repeat_sum))*60 == 30){
            repeat_end_time_min = '30';
        }

        var repeat_start_time = repeat_time_array[i].split(':')[0] +':'+ repeat_time_array[i].split(':')[1]
        var repeat_end_time = repeat_endTime_array[i].split(':')[0] +':'+ repeat_endTime_array[i].split(':')[1]



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
        var summaryInnerBoxText_1 = '<p class="summaryInnerBoxText">'+repeat_type +' '+repeat_day() +' '+repeat_start_time+' ~ '+repeat_end_time+' ('+repeat_dur+')'+'</p>';
        var summaryInnerBoxText_2 = '<p class="summaryInnerBoxText">'+repeat_start_text+repeat_start+' ~ '+repeat_end_text+repeat_end+'</p>';
        var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin" data-deletetype="grouprepeatinfo" data-groupid="'+group_id+'" data-repeatid="'+repeat_id+'"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>';
        schedulesHTML[i] = '<div class="summaryInnerBox" data-repeatid="'+repeat_id+'">'+summaryInnerBoxText_1+summaryInnerBoxText_2+deleteButton+'</div>';
    }
    var title;
    var repeat_bg;
    if(len == 0){
        title = '';
        repeat_bg = '';
    }else{
        title = '<div class="summaryInnerBox_repeat_title" data-repeatid="766"><img src="/static/user/res/offadd/icon-repeat-cal.png" class="pcmanageicon">반복 일정</div>';
        repeat_bg = 'repeat_bg';
    }
    $regHistory.html(title + schedulesHTML.join('')).addClass(repeat_bg);

}


//그룹의 반복일정 id를 보내서 그 반복일정에 묶여있는 회원들의 반복일정 id를 불러온다. (그룹의 반복일정을 삭제할 때 회원들의 반복일정도 같이 지워주기 위해)
function set_group_member_repeat_info(group_repeat_id, use, callback){
    $.ajax({
        url: '/trainer/get_group_repeat_schedule_list/',
        type:'GET',
        data: {"group_repeat_id": group_repeat_id},
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
                if(use == "callback"){
                    callback(jsondata);
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
    });
}

//어떤 그룹반복일정id에 엮인 회원들의 반복일정id들을 모두 삭제요청한다. (그룹의 반복일정을 삭제할 때 회원들의 반복일정도 같이 지워주기 위해)
function send_delete_member_repeat_infos(jsondata){
    //var len = jsondata.{멤버 리피트 id 배열 길이};
    for(var i=0; i<len; i++){

    }
}
/////////////////////////////그룹 반복일정 조회 및 그리기/////////////////////////////


function toggle_lock_unlock_inputfield_grouplist(package_id, disable){ //disable=false 수정가능, disable=true 수정불가
    var ori_name = $('div[data-packageid="'+package_id+'"]').find("._groupname input").val();
    if(disable == true){
        $('div[data-packageid="'+package_id+'"]').find("._groupname input").val(ori_name);
    }else if(disable == false){
        var namesplitarray = $('div[data-packageid="'+package_id+'"]').find("._groupname input").val().split(' ');
        namesplitarray.splice(0, 1);
        $('div[data-packageid="'+package_id+'"]').find("._groupname input").val(namesplitarray.join(' '));
    }
    $('div[data-packageid="'+package_id+'"] input._editable').attr('disabled', disable).removeClass('input_disabled_true').removeClass('input_disabled_false').addClass('input_disabled_'+String(disable));
    $('div[data-packageid="'+package_id+'"] span._editable').removeClass('_groupstatus_disabled_false').removeClass('_groupstatus_disabled_true').addClass('_groupstatus_disabled_'+String(disable));
}


/*패키지 페이지 전용*/

$(document).on("change", '#lecture_list_to_package', function(e){
    e.stopPropagation();
    var selected_groupid = $(this).val();
    var selected_groupname = $(this).find("option[value='"+$(this).val()+"']").text();
    add_lecture_bubble_to_make_package("#selected_lectures_to_package_wrap", selected_groupid, selected_groupname);
    $(this).find(".disabled_option").trigger("click");
    $('#lecture_list_to_package option:eq(0)').prop('selected', 'selected');
    $(this).find("option[value='"+selected_groupid+"']").css({"background":"#cccccc"});
    check_dropdown_selected();
});


function add_lecture_bubble_to_make_package(targetSelector, groupid, groupname){
    var $targetHTML = $(targetSelector);
    var bubble = `<div class="lecture_bubble" data-groupid=${groupid} data-groupname='${groupname}'>
                    <p><span>${groupname}</span><img src="/static/user/res/member/icon-x-red.png"></p>
                  </div>`;
    if($targetHTML.find(`div.lecture_bubble[data-groupid=${groupid}]`).length == 0 ){
        $targetHTML.append(bubble);
        var lecture_bubbles_groupid_array = [];
        $(`div.lecture_bubble`).each(function(){
            lecture_bubbles_groupid_array.push($(this).attr("data-groupid"));
        });
        $('#form_package_groupids').val(lecture_bubbles_groupid_array);
        update_selected_package_num();
    }
}

//패키지 만들때, 그룹을 빼는 이벤트
$(document).on("click", "#selected_lectures_to_package_wrap div.lecture_bubble img", function(e){
    e.stopPropagation();
    var $thisBubble = $(this).parents("div.lecture_bubble");
    $thisBubble.remove();
    var lecture_bubbles_groupid_array = [];
    $(`div.lecture_bubble`).each(function(){
        lecture_bubbles_groupid_array.push($(this).attr("data-groupid"));
    });
    $('#form_package_groupids').val(lecture_bubbles_groupid_array);
    $("#packaggSelector option[value='"+$(this).parents("div.lecture_bubble").attr('data-groupid')+"']").css({"background":"#ffffff"});
    update_selected_package_num();
    check_dropdown_selected();
});

//이미 만들어진 패키지에서, 그룹을 빼는 이벤트
// $(document).on("click", "div.groupPackageWrap div.lecture_bubble_mini img", function(e){
$(document).on("click", "div.lecture_bubble_mini img", function(e){
    e.stopPropagation();
    var package_id = $(this).parents("div.groupPackageWrap").attr("data-packageid");
    var package_number = $(this).parents("div.groupPackageWrap").find(".lecture_bubble_mini").length;
    if($('#popup_ticket_info_mobile').css('display') == "block"){
        package_id = $(this).parents("#popup_ticket_info_mobile_lecturelist").attr('data-packageid');
        package_number = $(this).parents("#popup_ticket_info_mobile_lecturelist").find(".lecture_bubble_mini").length;
    }
    var group_id = $(this).attr('data-groupid');
    var group_name = $(this).siblings('span').text();

    if(package_number < 2){
        alert("패키지내에는 최소 1개의 수강권이 존재해야 합니다.");
    }else{
        deleteTypeSelect = 'package_group_delete';
        $('#cal_popup_plandelete').show().attr({'data-packageid':package_id, 'data-groupid':group_id});
        $('#popup_delete_question').text(`정말 패키지에서 ${group_name} 수강권을 삭제하시겠습니까?`);
        shade_index(250);
    };
});

//이미 만들어진 패키지에 그룹을 추가하기 위한 이벤트
// $(document).on("click", "div.groupPackageWrap img.btn_add_lecture_bubble_mini", function(e){
$(document).on("click", "img.btn_add_lecture_bubble_mini", function(e){
    e.stopPropagation();
    $("#add_group_to_package_selector_popup").remove();
    var package_id = $(this).attr("data-packageid");
    var $targetHTML = $(this).parent("div.groupPackageWrap");
    if($('#popup_ticket_info_mobile').css('display') == "block"){
        $targetHTML = $("#popup_ticket_info_mobile_lecturelist");
    }
    
    if($targetHTML.find("#add_group_to_package_selector_popup").length <= 0){
        var html = `<div id="add_group_to_package_selector_popup" class="dropdown" data-packageid="${package_id}">
                        <ul id="add_group_to_package_selector" class="dropdown-menu pters_dropdown_custom_list">
                            
                        </ul>
                    </div>
                    `;
        get_group_ing_list('callback', function(jsondata){
            fill_single_package_list_to_dropdown_to_make_new_package("#add_group_to_package_selector", "pters", jsondata);
        });
        if($('#popup_ticket_info_mobile').css('display') == "block"){

        }else{
            shade_index(100);    
        }
        $targetHTML.append(html);
    }
});

//이미 만들어진 패키지에 그룹을 추가하기 위한 이벤트
$(document).on("click", "#add_group_to_package_selector li a", function(){
    var package_id = $('#add_group_to_package_selector_popup').attr("data-packageid");
    var group_id = $(this).attr("data-groupid");
    var group_name = $(this).text();
    add_group_from_package(package_id, group_id, "callback", function(){
        alert(`${group_name}이 패키지에 추가 되었습니다.`);
        if($("#popup_ticket_info_mobile").css('display') == "block"){
            var package_statuscd = $('#mypackagestatuscd').attr('data-status');
            var $targetlecturelist = $('#popup_ticket_info_mobile_lecturelist');
            get_grouplist_in_package(package_id, package_statuscd, "callback", function(jsondata){
                draw_grouplist_in_package($targetlecturelist, jsondata);
            });
        }
        shade_index(-100);
    });
});


$(document).on("click", '.add_group_to_package_dropdown_title img', function(){
    $('#add_group_to_package_selector_popup').hide();
    shade_index(-100);
});

function update_selected_package_num(){
    var packagenum = $(`#selected_lectures_to_package_wrap div.lecture_bubble`).length;
    if(packagenum == 0){
        $('#selected_lectures_to_package_num').text('*');
    }else{
        $('#selected_lectures_to_package_num').text(packagenum+'개 선택됨' );
    }
}

$('#packagename').keyup(function(){
    check_dropdown_selected();
});



// function get_single_package_list(use, callback){
//     $.ajax({
//         url:'/trainer/get_single_package_list/',
//         dataType : 'html',

//         beforeSend:function(){
//             beforeSend();
//         },

//         //보내기후 팝업창 닫기
//         complete:function(){
//             completeSend();
//         },

//         //통신성공시 처리
//         success:function(data){
//             var jsondata = JSON.parse(data);
//             if(jsondata.messageArray.length>0){
//                 $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
//                 scrollToDom($('#page_addmember'));
//                 $('#errorMessageBar').show();
//                 $('#errorMessageText').text(jsondata.messageArray);
//             }else{
//                console.log("get_single_package_list", jsondata);
//                if(use == "callback"){
//                    callback(jsondata);
//                }
//             }
//         },

//         //통신 실패시 처리
//         error:function(){
//             $('#errorMessageBar').show();
//             $('#errorMessageText').text('통신 에러: 관리자 문의');
//         }
//     });
// }

//서버로부터 패키지 목록 가져오기
function get_package_ing_list(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴하고 드랍다운을 생성
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.

    ticket_page_num = 1;
    ticketListSet_len = 1;
    ticket_mutex_val = 1;
    $.ajax({
        url:'/trainer/get_package_ing_list/',
        type:'GET',
        data: {"page": ticket_page_num, "sort_val": ticket_sort_val, "sort_order_by":ticket_sort_order_by, "keyword":ticket_keyword},
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
            console.log("get_package_ing_list", jsondata);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                ticket_ing_list_cache = ticket_jsondata_to_dict(jsondata);         
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);
                }else{
                    //group_class_ListHtml('current',jsondata)
                }

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
//서버로부터 그룹 목록 가져오기
//서버로부터 그룹 목록 가져오기
function get_package_end_list(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴하고 드랍다운을 생성
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    ticket_page_num = 1;
    ticketListSet_len = 1;
    ticket_mutex_val = 1;
    $.ajax({
        url:'/trainer/get_package_end_list/',
        type:'GET',
        data: {"page": ticket_page_num, "sort_val": ticket_sort_val, "sort_order_by":ticket_sort_order_by, "keyword":ticket_keyword},
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
            console.log("get_package_end_list", jsondata);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                ticket_end_list_cache = ticket_jsondata_to_dict(jsondata);
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);
                }else{
                    //group_class_ListHtml('finished',jsondata)
                }

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
//서버로부터 그룹 목록 가져오기


function ticket_jsondata_to_dict(jsondata){
    var len = jsondata.package_id.length;
    var result = {};
    for(var j=0; j<len; j++){
        result[jsondata.package_id[j]] = {};
        result[jsondata.package_id[j]]["package_name"] = jsondata.package_name[j];
        result[jsondata.package_id[j]]["package_state_cd"] = jsondata.package_state_cd[j];
        result[jsondata.package_id[j]]["package_state_cd_name"] = jsondata.package_state_cd_name[j];
        result[jsondata.package_id[j]]["package_type_cd"] = jsondata.package_type_cd[j];
        result[jsondata.package_id[j]]["package_type_cd_nm"] = jsondata.package_type_cd_nm[j];
        result[jsondata.package_id[j]]["package_note"] = jsondata.package_note[j];
        result[jsondata.package_id[j]]["package_group_name"] = jsondata.package_group_name[j];
        result[jsondata.package_id[j]]["package_group_num"] = jsondata.package_group_num[j];
        result[jsondata.package_id[j]]["package_ing_member_num"] = jsondata.package_ing_member_num[j];
        result[jsondata.package_id[j]]["package_end_member_num"] = jsondata.package_end_member_num[j];
        result[jsondata.package_id[j]]["package_reg_dt"] = jsondata.package_reg_dt[j];
        result[jsondata.package_id[j]]["package_mod_dt"] = jsondata.package_mod_dt[j];
    }
    return result;
}

//서버로부터 패키지 목록 가져오기
function get_package_ing_list_page(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴하고 드랍다운을 생성
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_package_ing_list/',
        type:'GET',
        data: {"page": ++ticket_page_num, "sort_val": ticket_sort_val, "sort_order_by":ticket_sort_order_by, "keyword":ticket_keyword},
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
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                if(jsondata.package_id.length>0) {
                    ticket_ing_list_cache = Object.assign(ticket_ing_list_cache, ticket_jsondata_to_dict(jsondata));
                    $('#errorMessageBar').hide();
                    $('#errorMessageText').text('');
                    // if (bodywidth < 600) {
                    //     $('#page_managemember').show();
                    // }
                    //$('html').css("cursor","auto")
                    $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                    if (use == "callback") {
                        callback(jsondata);
                    } else {
                        //group_class_ListHtml('current',jsondata)
                    }

                    console.log('success');
                }else{
                    ticket_page_num -= 1;
                }
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}
//서버로부터 그룹 목록 가져오기
//서버로부터 그룹 목록 가져오기
function get_package_end_list_page(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴하고 드랍다운을 생성
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_package_end_list/',
        type:'GET',
        data: {"page": ++ticket_page_num, "sort_val": ticket_sort_val, "sort_order_by":ticket_sort_order_by, "keyword":ticket_keyword},
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
            console.log("get_package_end_list", jsondata);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                if(jsondata.package_id.length>0) {
                    ticket_end_list_cache = Object.assign(ticket_end_list_cache, ticket_jsondata_to_dict(jsondata));
                    $('#errorMessageBar').hide();
                    $('#errorMessageText').text('');
                    // if(bodywidth < 600){
                    //     $('#page_managemember').show();
                    // }
                    //$('html').css("cursor","auto")
                    $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                    if(use == "callback"){
                        callback(jsondata);
                    }else{
                        //group_class_ListHtml('finished',jsondata)
                    }

                    console.log('success');
                }else{
                    ticket_page_num -= 1;
                }
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}

function fill_single_package_list_to_dropdown_to_make_new_package(targetHTML, type, jsondata){
    var $targetHTML = $(targetHTML);
    var html;
    if(type == "pure"){
        html = ['<option class="disabled_option" selected disabled style="color:#cccccc;">수업 선택</option>'];
        for(var i=0; i<jsondata.group_id.length; i++){
            html.push(`<option value="${jsondata.group_id[i]}">[${jsondata.group_type_cd_nm[i]}] ${jsondata.group_name[i]}</option>`);
        }
    }else if(type == "pters"){
        html = ['<div class="add_group_to_package_dropdown_title" style="display:block;"><a disabled="">추가할 수업 선택<img src="/static/user/res/member/icon-x-grey.png"></a></div>'];
        var package_id = $('#add_group_to_package_selector_popup').attr('data-packageid');
        for(var i=0; i<jsondata.group_id.length; i++){
            if($(`div.groupPackageWrap[data-packageid="${package_id}"]`).find(`div.lecture_bubble_mini[data-groupid="${jsondata.group_id[i]}"]`).length ==0){
                html.push(`<li><a data-groupid="${jsondata.group_id[i]}">[${jsondata.group_type_cd_nm[i]}] ${jsondata.group_name[i]}</a></option>`);
            }else{

            }
        }
        if(html.length == 1){
            html.push(`<div>추가 가능한 수업이 없습니다.</div>`);
        }
    }
    $targetHTML.html(html.join(""));
}

//패키지 목록을 화면에 뿌리기
var $membernum;
var $targetHTML;
var text_membernum;
function package_ListHtml(option, jsondata){ //option : current, finished
    console.log("package_ListHtml", jsondata)
    $('#uptext').text("수강권("+jsondata.total_package_num+"개)");
    switch(option){
        case 'current':
            $membernum = $('#memberNumber_current_ticket');
            $targetHTML = $('#currentPackageList');
            text_membernum = "진행중인 수강권 ";
            $targetHTML.attr('total_package_num', jsondata.total_package_num);
            break;
        case 'finished':
            $membernum = $('#memberNumber_finish_ticket');
            $targetHTML = $('#finishedPackageList');
            text_membernum = "종료된 수강권 ";
            break;
    }
    var htmlToAdd = [];
    var htmlToJoin = [];
    var htmlToJoin2 = [];
    var htmlToJoin3 = [];
    var groupNum = jsondata.package_id.length;
    var ordernum = 1;
    var input_order_num = 0;
    // if(ticket_keyword != ''){
    //     ordernum = 0;
    //     input_order_num = 0;
    // }
    for(var i=0; i<groupNum; i++){
        var package_name = jsondata.package_name[i];
        var package_id = jsondata.package_id[i];
        var package_type = jsondata.package_type_cd[i];
        var package_type_nm = jsondata.package_type_cd_nm[i];
        var package_createdate = date_format_to_yyyymmdd(jsondata.package_reg_dt[i].split(' ')[0]+' '+jsondata.package_reg_dt[i].split(' ')[1]+' '+jsondata.package_reg_dt[i].split(' ')[2], '-');
        var package_memo = jsondata.package_note[i];
        var package_memberlist = [];
        var package_capacity = jsondata.package_group_num[i];
        var packagestatus = jsondata.package_state_cd_name[i];
        var packagestatus_cd = jsondata.package_state_cd[i];

        var package_membernum;
        switch(option){
            case 'current':
                package_membernum = jsondata.package_ing_member_num[i];
                break;
            case 'finished':
                package_membernum = jsondata.package_end_member_num[i];
                break;
        }

        // if(package_type == "ONE_TO_ONE"){
        //     input_order_num = 1;
        // }else{
        //     ordernum++;
        //     input_order_num = ordernum;
        // }
        input_order_num++;
        var full_package = "";
        // if(package_membernum >= package_capacity && package_type == "NORMAL"){
        //     var full_package = "red_color_text";
        // }

        var pcdownloadimage = '<img src="/static/user/res/member/pters-download.png" class="pcmanageicon _info_download" title="엑셀 다운로드" data-packageid="'+package_id+'">';
        var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제" data-packageid="'+package_id+'">';
        var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="수정" data-packageid="'+package_id+'" data-edit="view">';
        var pceditcancelimage = '<img src="/static/user/res/member/icon-x-red.png" class="pcmanageicon _info_cancel" title="취소" data-packageid="'+package_id+'">';
        var img_lock_function = '<img src="/static/user/res/login/icon-lock-grey.png" class="pcmanageicon lock_function" title="기능 구매후 이용 가능" onclick="purchase_annai()">';

        var htmlstart = '<div class="groupWrap _ticket_list_pc_style" data-packagestatecd="'+option+'" data-packageid="'+package_id+'">';
        var htmlend = '</div>';
        var memolist = '<div class="groupMemoWrap" data-packageid="'+package_id+'">메모: '+'<input class="input_disabled_true _editable" value="'+package_memo+'" disabled>'+'</div>';
        var repeatlist = '<div class="groupRepeatWrap" data-packageid="'+package_id+'"></div>';
        var packagelist = '<div class="groupPackageWrap" data-packageid="'+package_id+'"></div>';
        var memberlist = '<div class="groupMembersWrap" data-packageid="'+package_id+'" data-packagename="'+package_name+'" data-packagecapacity="'+package_capacity+'" data-packagetype="'+package_type+'">'+package_memberlist+'</div>';

        // if(package_type == "ONE_TO_ONE") {
        //     manageimgs = '<div class="_groupmanage"></div>';
        // }
        // else{
            var manageimgs = '<div class="_groupmanage">' + pceditimage + pceditcancelimage + pcdeleteimage + '</div>';
            if (Options.auth_class == 0) {
                manageimgs = '<div class="_groupmanage">' + img_lock_function + '</div>';
            }
        // }

        var main = '<div class="_groupnum">'+input_order_num+'</div>'+
            // '<div class="_grouptypecd" data-package-type="'+package_type+'"><input class="group_listinput input_disabled_true" value="'+package_type_nm+'" disabled>'+'</div>'+
            '<div class="_groupname"><input class="group_listinput input_disabled_true _editable" value="'+'['+package_type_nm+'] '+package_name+'" disabled>'+'</div>'+
            '<div class="_groupparticipants '+full_package+'">'+ package_membernum+'</div>'+
            '<div class="_groupcapacity">'+'<input style="width:25px;" class="group_listinput input_disabled_true _editable '+full_package+'" value="'+package_capacity+'" disabled>'+'</div>';
            // if(package_type == "ONE_TO_ONE") {
            //     main += '<div class="_grouppartystatus '+full_package+'"><span>'+ package_membernum + ' </span> ' +'</div>';
            // }
            // else{
                main += '<div class="_grouppartystatus ' + full_package + '">' + '<div class="group_member_current_num" style="text-align:center;">' + package_membernum + '</div>' + '<span> </div>';
            // }
            main += '<div class="_groupmemo"><input class="group_listinput input_disabled_true _editable" value="'+package_memo+'" disabled>'+'</div>';

            // if(package_type == "ONE_TO_ONE"){
            //     main += '<div class="_groupcreatedate"><input class="group_listinput input_disabled_true" value="'+'기본 생성'+'" disabled>'+'</div>';
            // }
            // else{
                main += '<div class="_groupcreatedate"><input class="group_listinput input_disabled_true" value="'+date_format_yyyymmdd_to_yyyymmdd_split(package_createdate, '.')+'" disabled>'+'</div>';
            // }
            main += '<div class="_groupstatus" data-packageid="'+package_id+'">'+'<span class="_editable _groupstatus_'+packagestatus_cd+'" data-packagestatus="'+packagestatus_cd+'" data-packageid="'+package_id+'">'+packagestatus+'</span>'+'</div>'+ manageimgs;
            //'<div class="_groupmanage">'+pceditimage+pceditcancelimage+pcdeleteimage+'</div>'

        // if(package_type == "EMPTY"){
        //     htmlToJoin.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }else if(package_type == "NORMAL"){
        //     htmlToJoin2.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }else if(package_type == "ONE_TO_ONE"){
        // if(package_type == "ONE_TO_ONE"){
        //     htmlToAdd.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }else{
            htmlToJoin3.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }
    }
    ticketListSet_len = groupNum+1;

    if((htmlToJoin.length+htmlToJoin2.length+htmlToJoin3.length+htmlToAdd.length) == 0){
        if(option == "current"){
            // htmlToJoin.push('<div class="groupWrap" data-packagestatecd="'+option+'" style="height:50px;padding-top:17px !important">추가 된 수강권이 없습니다.</div>');
        }else if(option == "finished"){
            htmlToJoin.push('<div class="groupWrap" data-packagestatecd="'+option+'" style="height:50px;padding-top:17px !important">종료 된 수강권이 없습니다.</div>');
        }
    }

    $membernum.html(text_membernum+'<span style="font-size:16px;">'+jsondata.total_package_num+'개</span>');
    ticket_mutex_val = 1;
    return htmlToAdd.join('')+ htmlToJoin2.join('') + htmlToJoin.join('') + htmlToJoin3.join('');
}

function package_ListHtml_page(option, jsondata){ //option : current, finished
    console.log("package_ListHtml", jsondata)
    $('#uptext').text("수강권("+jsondata.total_package_num+"개)");
    switch(option){
        case 'current':
            $membernum = $('#memberNumber_current_ticket');
            $targetHTML = $('#currentPackageList');
            text_membernum = "진행중인 수강권 ";
            $targetHTML.attr('total_package_num', jsondata.total_package_num);
            break;
        case 'finished':
            $membernum = $('#memberNumber_finish_ticket');
            $targetHTML = $('#finishedPackageList');
            text_membernum = "종료된 수강권 ";
            break;
    }
    var htmlToAdd = [];
    var htmlToJoin = [];
    var htmlToJoin2 = [];
    var htmlToJoin3 = [];
    var groupNum = jsondata.package_id.length;
    var ordernum = 1;
    var input_order_num = 0;
    // if(ticket_keyword != ''){
    //     ordernum = 0;
    //     input_order_num = 0;
    // }
    for(var i=0; i<groupNum; i++){
        var package_name = jsondata.package_name[i];
        var package_id = jsondata.package_id[i];
        var package_type = jsondata.package_type_cd[i];
        var package_type_nm = jsondata.package_type_cd_nm[i];
        var package_createdate = date_format_to_yyyymmdd(jsondata.package_reg_dt[i].split(' ')[0]+' '+jsondata.package_reg_dt[i].split(' ')[1]+' '+jsondata.package_reg_dt[i].split(' ')[2], '-');
        var package_memo = jsondata.package_note[i];
        var package_memberlist = [];
        var package_capacity = jsondata.package_group_num[i];
        var packagestatus = jsondata.package_state_cd_name[i];
        var packagestatus_cd = jsondata.package_state_cd[i];

        var package_membernum;
        switch(option){
            case 'current':
                package_membernum = jsondata.package_ing_member_num[i];
                break;
            case 'finished':
                package_membernum = jsondata.package_end_member_num[i];
                break;
        }

        // if(package_type == "ONE_TO_ONE"){
        //     input_order_num = 1;
        // }else{
        //     ordernum++;
        //     input_order_num = ordernum;
        // }
        input_order_num++;

        var full_package = "";
        // if(package_membernum >= package_capacity && package_type == "NORMAL"){
        //     var full_package = "red_color_text";
        // }

        var pcdownloadimage = '<img src="/static/user/res/member/pters-download.png" class="pcmanageicon _info_download" title="엑셀 다운로드" data-packageid="'+package_id+'">';
        var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제" data-packageid="'+package_id+'">';
        var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="수정" data-packageid="'+package_id+'" data-edit="view">';
        var pceditcancelimage = '<img src="/static/user/res/member/icon-x-red.png" class="pcmanageicon _info_cancel" title="취소" data-packageid="'+package_id+'">';
        var img_lock_function = '<img src="/static/user/res/login/icon-lock-grey.png" class="pcmanageicon lock_function" title="기능 구매후 이용 가능" onclick="purchase_annai()">';

        var htmlstart = '<div class="groupWrap _ticket_list_pc_style" data-packagestatecd="'+option+'" data-packageid="'+package_id+'">';
        var htmlend = '</div>';
        var memolist = '<div class="groupMemoWrap" data-packageid="'+package_id+'">메모: '+'<input class="input_disabled_true _editable" value="'+package_memo+'" disabled>'+'</div>';
        var repeatlist = '<div class="groupRepeatWrap" data-packageid="'+package_id+'"></div>';
        var packagelist = '<div class="groupPackageWrap" data-packageid="'+package_id+'"></div>';
        var memberlist = '<div class="groupMembersWrap" data-packageid="'+package_id+'" data-packagename="'+package_name+'" data-packagecapacity="'+package_capacity+'" data-packagetype="'+package_type+'">'+package_memberlist+'</div>';

        // if(package_type == "ONE_TO_ONE") {
        //     manageimgs = '<div class="_groupmanage"></div>';
        // }
        // else{
            var manageimgs = '<div class="_groupmanage">' + pceditimage + pceditcancelimage + pcdeleteimage + '</div>';
            if (Options.auth_class == 0) {
                manageimgs = '<div class="_groupmanage">' + img_lock_function + '</div>';
            }
        // }

        var main = '<div class="_groupnum">'+(i+ticketListSet_len)+'</div>'+
            // '<div class="_grouptypecd" data-package-type="'+package_type+'"><input class="group_listinput input_disabled_true" value="'+package_type_nm+'" disabled>'+'</div>'+
            '<div class="_groupname"><input class="group_listinput input_disabled_true _editable" value="'+'['+package_type_nm+'] '+package_name+'" disabled>'+'</div>'+
            '<div class="_groupparticipants '+full_package+'">'+ package_membernum+'</div>'+
            '<div class="_groupcapacity">'+'<input style="width:25px;" class="group_listinput input_disabled_true _editable '+full_package+'" value="'+package_capacity+'" disabled>'+'</div>';
            // if(package_type == "ONE_TO_ONE") {
            //     main += '<div class="_grouppartystatus '+full_package+'"><span>'+ package_membernum + ' </span> ' +'</div>';
            // }
            // else{
                main += '<div class="_grouppartystatus ' + full_package + '">' + '<div class="group_member_current_num" style="text-align:center;">' + package_membernum + '</div>' + '<span> </div>';
            // }
            main += '<div class="_groupmemo"><input class="group_listinput input_disabled_true _editable" value="'+package_memo+'" disabled>'+'</div>';

            // if(package_type == "ONE_TO_ONE"){
            //     main += '<div class="_groupcreatedate"><input class="group_listinput input_disabled_true" value="'+'기본 생성'+'" disabled>'+'</div>';
            // }
            // else{
                main += '<div class="_groupcreatedate"><input class="group_listinput input_disabled_true" value="'+date_format_yyyymmdd_to_yyyymmdd_split(package_createdate, '.')+'" disabled>'+'</div>';
            // }
            main += '<div class="_groupstatus" data-packageid="'+package_id+'">'+'<span class="_editable _groupstatus_'+packagestatus_cd+'" data-packagestatus="'+packagestatus_cd+'" data-packageid="'+package_id+'">'+packagestatus+'</span>'+'</div>'+ manageimgs;
            //'<div class="_groupmanage">'+pceditimage+pceditcancelimage+pcdeleteimage+'</div>'

        // if(package_type == "EMPTY"){
        //     htmlToJoin.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }else if(package_type == "NORMAL"){
        //     htmlToJoin2.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }else if(package_type == "ONE_TO_ONE"){
        // if(package_type == "ONE_TO_ONE"){
        //     htmlToAdd.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }else{
            htmlToJoin3.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }
    }
    ticketListSet_len += groupNum;
    if((htmlToJoin.length+htmlToJoin2.length+htmlToJoin3.length+htmlToAdd.length) == 0){
        if(option == "current"){
            // htmlToJoin.push('<div class="groupWrap" data-packagestatecd="'+option+'" style="height:50px;padding-top:17px !important">추가 된 수강권이 없습니다.</div>');
        }else if(option == "finished"){
            htmlToJoin.push('<div class="groupWrap" data-packagestatecd="'+option+'" style="height:50px;padding-top:17px !important">종료 된 수강권이 없습니다.</div>');
        }
    }

    $membernum.html(text_membernum+'<span style="font-size:16px;">'+jsondata.total_package_num+'개</span>');
    ticket_mutex_val = 1;
    return htmlToAdd.join('')+ htmlToJoin2.join('') + htmlToJoin.join('') + htmlToJoin3.join('');
}

function package_ListHtml_mobile(option, jsondata){ //option : current, finished
    $('#uptext').text("수강권("+jsondata.total_package_num+"개)");
    switch(option){
        case 'current':
            $membernum = $('#memberNumber_current_ticket');
            $targetHTML = $('#currentPackageList');
            text_membernum = "진행중인 수강권 ";
            $targetHTML.attr('total_package_num', jsondata.total_package_num);
            break;
        case 'finished':
            $membernum = $('#memberNumber_finish_ticket');
            $targetHTML = $('#finishedPackageList');
            text_membernum = "종료된 수강권 ";
            break;
    }
    var htmlToAdd = [];
    var htmlToJoin = [];
    var htmlToJoin2 = [];
    var htmlToJoin3 = [];
    var groupNum = jsondata.package_id.length;
    var ordernum = 0;
    for(var i=0; i<groupNum; i++){
        var package_name = jsondata.package_name[i];
        var package_id = jsondata.package_id[i];
        var package_type = jsondata.package_type_cd[i];
        var package_type_nm = jsondata.package_type_cd_nm[i];
        var package_createdate = date_format_to_yyyymmdd(jsondata.package_reg_dt[i].split(' ')[0]+' '+jsondata.package_reg_dt[i].split(' ')[1]+' '+jsondata.package_reg_dt[i].split(' ')[2], '-');
        var package_memo = jsondata.package_note[i];
        var package_memberlist = [];
        var package_capacity = jsondata.package_group_num[i];
        var packagestatus = jsondata.package_state_cd_name[i];
        var packagestatus_cd = jsondata.package_state_cd[i];

        var package_membernum;
        switch(option){
            case 'current':
                package_membernum = jsondata.package_ing_member_num[i];
                break;
            case 'finished':
                package_membernum = jsondata.package_end_member_num[i];
                break;
        }

        ordernum++;
        var full_package = "";
        // if(package_membernum >= package_capacity && package_type == "NORMAL"){
        //     var full_package = "red_color_text";
        // }

        var pcdownloadimage = '<img src="/static/user/res/member/pters-download.png" class="pcmanageicon _info_download" title="엑셀 다운로드" data-packageid="'+package_id+'">';
        var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제" data-packageid="'+package_id+'">';
        var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="수정" data-packageid="'+package_id+'" data-edit="view">';
        var pceditcancelimage = '<img src="/static/user/res/member/icon-x-red.png" class="pcmanageicon _info_cancel" title="취소" data-packageid="'+package_id+'">';
        var img_lock_function = '<img src="/static/user/res/login/icon-lock-grey.png" class="pcmanageicon lock_function" title="기능 구매후 이용 가능" onclick="purchase_annai()">';

        var htmlstart = '<div class="groupWrap _ticket_list_mobile_style" data-packagestatecd="'+option+'" data-packageid="'+package_id+'">';
        var htmlend = '</div>';
        var memolist = '<div class="groupMemoWrap" data-packageid="'+package_id+'">메모: '+'<input class="input_disabled_true _editable" value="'+package_memo+'" disabled>'+'</div>';
        var repeatlist = '<div class="groupRepeatWrap" data-packageid="'+package_id+'"></div>';
        var packagelist = '<div class="groupPackageWrap" data-packageid="'+package_id+'"></div>';
        var memberlist = '<div class="groupMembersWrap" data-packageid="'+package_id+'" data-packagename="'+package_name+'" data-packagecapacity="'+package_capacity+'" data-packagetype="'+package_type+'">'+package_memberlist+'</div>';

        // if(package_type == "ONE_TO_ONE") {
        //     manageimgs = '<div class="_groupmanage"></div>';
        // }
        // else{
            var manageimgs = '<div class="_groupmanage">' + pceditimage + pceditcancelimage + pcdeleteimage + '</div>';
            if (Options.auth_class == 0) {
                manageimgs = '<div class="_groupmanage">' + img_lock_function + '</div>';
            }
        // }

        var main = 
            `<div class="_grouptype_mobile">${package_type_nm}</div>
             <div class="_groupname_mobile">${package_name}</div>
             <div class="_groupparticipants_mobile"><div>회원수</div><div>${package_membernum}</div></div>
             <div class="_grouplectures_mobile"><div>수업</div><div></div></div>
             <div class="_groupmemo_mobile"><div>메모</div><div>${package_memo}</div></div>
            `;

        // if(package_type == "EMPTY"){
        //     htmlToJoin.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }else if(package_type == "NORMAL"){
        //     htmlToJoin2.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }else if(package_type == "ONE_TO_ONE"){
        // if(package_type == "ONE_TO_ONE"){
        //     htmlToAdd.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }else{
            htmlToJoin3.push(htmlstart+main+htmlend+packagelist+memolist+repeatlist+memberlist);
        // }
    }

    if((htmlToJoin.length+htmlToJoin2.length+htmlToJoin3.length+htmlToAdd.length) == 0){
        if(option == "current"){
            // htmlToJoin.push('<div class="groupWrap" data-packagestatecd="'+option+'" style="height:50px;padding-top:17px !important">추가 된 수강권이 없습니다.</div>');
        }else if(option == "finished"){
            htmlToJoin.push('<div class="groupWrap" data-packagestatecd="'+option+'" style="height:50px;padding-top:17px !important">종료 된 수강권이 없습니다.</div>');
        }
    }
    $membernum.html(text_membernum+'<span style="font-size:16px;">'+jsondata.total_package_num+'개</span>');
    ticket_mutex_val = 1;
    return htmlToAdd.join('')+ htmlToJoin2.join('') + htmlToJoin.join('') + htmlToJoin3.join('');
}
//패키지 목록을 화면에 뿌리기


//수강권 정보 모바일 팝업
function set_ticket_info_for_mobile_popup(package_id, package_name, package_status, package_statuscd, package_type, package_membernum, package_memo){
    var color;
    var selected1;
    var selected2;
    if(package_status == "진행중"){
        color = "green";
        selected1 = "mobile_status_selected";
        selected2 = ""
    }else{
        color = "red";
        selected1 = ""
        selected2 = "mobile_status_selected";
    }
    var status    = `<div class="mobile_status_color_palette" data-groupid=${package_id}>
                        <div class="ticket_ongoing ${selected1}" data-status="resume" style="margin-right:10px;">진행중</div>
                        <div class="ticket_finished ${selected2}" data-status="complete">종료</div>
                    </div>`;

    var html = `<div class="pters_table" style="display:none;" id="ticketdelete" data-packageid="${package_id}"><img src="/static/user/res/member/icon-delete-black.png" style="cursor:pointer;width:20px;margin:10px;"></div>
                <div class="pters_table" id="ticketnametitle"><div class="pters_table_cell">수강권명</div><div class="pters_table_cell" id="ticketname"><input type="text" class="mobile_memo_input" value="${package_name}" readonly></div></div>
                <div class="pters_table"><div class="pters_table_cell">타입</div><div class="pters_table_cell">${package_type}</div></div>
                <div class="pters_table"><div class="pters_table_cell">회원수</div><div class="pters_table_cell">${package_membernum}명</div></div>
                <div class="pters_table"><div class="pters_table_cell">상태</div><div class="pters_table_cell"><div style="color:${color}">${package_status}</div>${status}</div></div>
                <div class="pters_table"><div class="pters_table_cell">메모</div><div class="pters_table_cell" id="ticketmemo"><input type="text" class="mobile_memo_input" value="${package_memo}" readonly></div></div>
                <div class="pters_table"><div class="pters_table_cell">포함된 수업</div><div class="pters_table_cell"></div></div>
                <div id="ticketlectures"></div>


                <div style="display:none;" id="mypackageid" data-packageid="${package_id}"></div>
                <div style="display:none;" id="mypackagestatuscd" data-status="${package_statuscd}"></div>`;
    $('#popup_ticket_info_mobile_basic').html(html);
}
//수강권 정보 모바일 팝업

$(document).on('click', '.mobile_status_color_palette > div', function(){
    $(this).addClass('mobile_status_selected');
    $(this).siblings('div').removeClass('mobile_status_selected');
});


//패키지 소속 회원 목록을 그룹에 뿌리기
function get_package_member_list(package_id, use, callback){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/get_package_member/',
        data: {"package_id":package_id},
        type:'GET',
        dataType : 'html',

        beforeSend:function(xhr){
            beforeSend();
            // pters_option_inspector("group_read", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            console.log("get_package_member", jsondata);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(use == 'callback'){
                    callback(jsondata);
                }else{
                    if(bodywidth > 1000){
                        packageMemberListSet(package_id, jsondata);
                        $('div._groupmanage img._info_delete[data-packageid="'+package_id+'"]').css('opacity', 1);
                    }else if(bodywidth <= 1000){
                        packageMemberListSet_mobile(package_id, jsondata);
                    }
                    
                }

                console.log('success');


            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        },
    })
}

//패키지 소속 회원 목록을 그룹에 뿌리기
function get_end_package_member_list(package_id, use, callback){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/get_end_package_member/',
        data: {"package_id":package_id},
        type:'GET',
        dataType : 'html',

        beforeSend:function(xhr){
            beforeSend();
            // pters_option_inspector("group_read", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            console.log(jsondata);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(use == 'callback'){
                    callback(jsondata);
                }else{
                    // packageMemberListSet(package_id, jsondata);
                    // $('div._groupmanage img._info_delete[data-packageid="'+package_id+'"]').css('opacity', 1);
                    if(bodywidth > 1000){
                        packageMemberListSet(package_id, jsondata);
                        $('div._groupmanage img._info_delete[data-packageid="'+package_id+'"]').css('opacity', 1);
                    }else if(bodywidth <= 1000){
                        packageMemberListSet_mobile(package_id, jsondata);
                    }
                }

                console.log('success');


            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        },
    })
}
//패키지 소속 회원 목록을 그룹에 뿌리기

//패키지 소속 회원 목록을 그룹에 그리기
function packageMemberListSet(package_id, jsondata){
    var htmlToJoin = [];
    if(bodywidth < 600){
        htmlToJoin.push('<div class="groupmemberline_thead">'+
                        '<div class="_tdname">회원명</div>'+
                        //'<div class="_id">회원 ID</div>'+
                        '<div class="_regcount">등록 횟수</div>'+
                        '<div class="_remaincount">남은 횟수</div>'+
                        //'<div class="_startdate">시작일</div>'+
                        //'<div class="_finday">종료일</div>'+
                        //'<div class="_contact">연락처</div>'+
                        '<div class="_manage">관리</div>'+
                        '</div>');
    }else if(bodywidth >= 600){
        htmlToJoin.push('<div class="groupmemberline_thead">'+
                        '<div class="_tdname">회원명</div>'+
                        '<div class="_id">회원 ID</div>'+
                        '<div class="_regcount">등록 횟수</div>'+
                        '<div class="_remaincount">남은 횟수</div>'+
                        '<div class="_startdate">시작일</div>'+
                        '<div class="_finday">종료일</div>'+
                        '<div class="_contact">연락처</div>'+
                        '<div class="_manage">관리</div>'+
                        '</div>');
    }
    var len = jsondata.db_id.length;
    var groupcapacity = $('div.groupMembersWrap[data-groupid="'+package_id+'"]').attr('data-groupcapacity');
    var grouptype = $('div.groupMembersWrap[data-groupid="'+package_id+'"]').attr('data-grouptype');

    for(var i=0; i<len; i++){
        var groupmember_dbid = jsondata.db_id[i];
        var groupmember_id = jsondata.member_id[i];
        var groupmember_lecid = jsondata.lecture_id[i];
        var groupmember_lastname = jsondata.last_name[i];
        var groupmember_firstname = jsondata.first_name[i];
        var groupmember_regcount = jsondata.reg_count[i];
        var groupmember_remcount = jsondata.rem_count[i];
        var groupmember_startdate = jsondata.start_date[i];
        var groupmember_enddate = jsondata.end_date[i];
        var groupmember_phone = jsondata.phone[i];

        var htmlStart = '<div class="memberline" data-id="'+groupmember_id+'" data-dbid="'+groupmember_dbid+'" data-groupid="'+package_id+'" data-lecid="'+groupmember_lecid+'" data-fullname="'+groupmember_lastname+groupmember_firstname+'">';
        var htmlEnd = '</div>';

        var memberRow;
        if(bodywidth < 600){
            memberRow = htmlStart +
            '<div class="_tdname" data-name="'+groupmember_lastname+groupmember_firstname+'">'+groupmember_lastname+groupmember_firstname+'</div>' +
            '<div class="_id" data-dbid="'+groupmember_dbid+'" data-name="'+groupmember_id+'">'+groupmember_id+'</div>' +
            '<div class="_regcount" data-name="'+groupmember_regcount+'">'+groupmember_regcount+'</div>' +
            '<div class="_remaincount" data-name="'+groupmember_remcount+'">'+groupmember_remcount+'</div>'
            //'<div class="_startdate" data-name="'+groupmember_startdate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_startdate,'.')+'</div>' +
            //'<div class="_finday" data-name="'+groupmember_enddate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_enddate,'.')+'</div>' +
            //'<div class="_contact" data-name="'+groupmember_phone+'">'+groupmember_phone+'</div>' +
            // if(grouptype!='ONE_TO_ONE') {
                memberRow += '<div class="_manage"><img src="/static/user/res/member/icon-x-red.png" class="substract_groupMember" data-fullname="' + groupmember_lastname + groupmember_firstname + '" data-id="' + groupmember_id + '" data-dbid="' + groupmember_dbid + '" data-groupid="' + package_id + '"></div>'
            // }else{
            //      memberRow += '<div class="_manage"></div>';
            // }
            memberRow += htmlEnd;
        }else if(bodywidth >= 600){
            memberRow = htmlStart +
            '<div class="_tdname" data-name="'+groupmember_lastname+groupmember_firstname+'" title="'+groupmember_lastname+groupmember_firstname+'">'+groupmember_lastname+groupmember_firstname+'</div>' +
            '<div class="_id" data-dbid="'+groupmember_dbid+'" data-name="'+groupmember_id+'" title="'+groupmember_id+'">'+groupmember_id+'</div>' +
            '<div class="_regcount" data-name="'+groupmember_regcount+'">'+groupmember_regcount+'</div>' +
            '<div class="_remaincount" data-name="'+groupmember_remcount+'">'+groupmember_remcount+'</div>' +
            '<div class="_startdate" data-name="'+groupmember_startdate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_startdate, '.')+'</div>' +
            '<div class="_finday" data-name="'+groupmember_enddate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_enddate, '.')+'</div>' +
            '<div class="_contact" data-name="'+groupmember_phone+'">'+groupmember_phone+'</div>';

            // if(grouptype!='ONE_TO_ONE'){
                memberRow += '<div class="_manage"><img src="/static/user/res/member/icon-x-red.png" class="substract_groupMember" data-fullname="'+groupmember_lastname+groupmember_firstname+'" data-id="'+groupmember_id+'" data-dbid="'+groupmember_dbid+'" data-groupid="'+package_id+'"></div>'
            // }else{
            //      memberRow += '<div class="_manage"></div>';
            // }
            memberRow += htmlEnd;
        }


        htmlToJoin.push(memberRow);
    }

    var EMPTY_EXPLAIN;
    if(grouptype == 'EMPTY'){
        //var group_type = group_capacity+"인 공개"
        EMPTY_EXPLAIN = "<p style='color:#fe4e65;font-size:11px;'>이 클래스 소속인원은 이 클래스명으로 개설된 레슨에 예약 가능하며, 클래스 소속인원수는 제한이 없습니다. 수업당 정원은 "+groupcapacity+" 명입니다.</p>";
    }else if(grouptype == "NORMAL"){
        //var group_type = group_capacity+"인 비공개"
        EMPTY_EXPLAIN = "";
    }else{
        EMPTY_EXPLAIN = "";
    }

    var addButton = '';

    // if(groupcapacity <= len && grouptype =='NORMAL'){
    //     addButton = '';
    // }else{
        addButton = '<div><img src="/static/user/res/floatbtn/btn-plus.png" class="btn_add_member_to_group" data-grouptype="'+grouptype+'" data-packageid="'+package_id+'"></div>';
    // }

    if($('#finishedGroupList').css('display') == "block"){
        addButton = '';
    }

    var html = htmlToJoin.join('') + addButton;
    if(jsondata.db_id.length == 0){
        if($('#currentPackageList').css('display') == "block"){
            if(grouptype == 'EMPTY') {
                html = '<p">이 클래스에 소속된 회원이 없습니다.</p><div>' + addButton;
            }else if(grouptype == 'NORMAL'){
                html = '<p">이 그룹에 소속된 회원이 없습니다.</p><div>' + addButton;
            }
        }
    }

    $('div.groupMembersWrap[data-packageid="'+package_id+'"]').html(EMPTY_EXPLAIN+html);
}
//패키지 소속 회원 목록을 그룹에 그리기

//패키지 소속 회원 목록을 그룹에 그리기 모바일
function packageMemberListSet_mobile(package_id, jsondata){
    var htmlToJoin = [];
    var len = jsondata.db_id.length;

    htmlToJoin.push(`
                        <div id="mobile_comment_1">
                            <span>참여중 회원</span><span>${len}</span><div style="display:inline-block;cursor:pointer" class="btn_add_member_to_ticket_mobile" data-packageid=${package_id}>+</div>
                        </div>
                        <div id="mobile_comment_2">
                            <p>회원을 체크하면 일정 등록시 함께 추가합니다.</p>
                        </div>
                    `
                    )
    

    var groupcapacity = $('div.groupMembersWrap[data-groupid="'+package_id+'"]').attr('data-groupcapacity');
    var grouptype = $('div.groupMembersWrap[data-groupid="'+package_id+'"]').attr('data-grouptype');

    for(var i=0; i<len; i++){
        var groupmember_dbid = jsondata.db_id[i];
        var groupmember_id = jsondata.member_id[i];
        var groupmember_lecid = jsondata.lecture_id[i];
        var groupmember_lastname = jsondata.last_name[i];
        var groupmember_firstname = jsondata.first_name[i];
        var groupmember_regcount = jsondata.reg_count[i];
        var groupmember_remcount = jsondata.rem_count[i];
        var groupmember_startdate = jsondata.start_date[i];
        var groupmember_enddate = jsondata.end_date[i];
        var groupmember_phone = jsondata.phone[i];
        var groupmember_fixed;
        // if(jsondata.fix_state_cd[i] == "FIX"){
        //     groupmember_fixed = "checked";
        // }else{
        //     groupmember_fixed = "";
        // }

        var htmlStart = '<div class="memberline" data-id="'+groupmember_id+'" data-dbid="'+groupmember_dbid+'" data-groupid="'+package_id+'" data-lecid="'+groupmember_lecid+'" data-fullname="'+groupmember_lastname+groupmember_firstname+'">';
        var htmlEnd = '</div>';

        var memberRow;

        memberRow = htmlStart +
        '<div class="_tdname" data-name="'+groupmember_lastname+groupmember_firstname+'">'+groupmember_lastname+groupmember_firstname+'</div>' +
        '<div class="_id" data-dbid="'+groupmember_dbid+'" data-name="'+groupmember_id+'">'+groupmember_id+'</div>' +
        '<div class="_regandremaincount" data-name="'+groupmember_regcount+'"><p><span style="margin-right:20px;">등록 횟수</span>'+groupmember_regcount+'</p>'
                                                                            +'<p>'+'<span style="margin-right:20px;">잔여 횟수</span>'+groupmember_remcount+'</p>'+
                                                                            '</div>';

        //if(grouptype!='ONE_TO_ONE') {
            //memberRow += '<div class="_fixedmember" data-dbid="' + groupmember_dbid + '" data-groupid="' + package_id + '">' + '<div></div>' + '<input type="checkbox" ' + groupmember_fixed + '>' + '</div>';
        //}else{
            memberRow += '<div class="" style="width:10%"></div>';
        //}
       

        memberRow += htmlEnd;
    


        htmlToJoin.push(memberRow);
    }

    var EMPTY_EXPLAIN;
    if(grouptype == 'EMPTY'){
        //var group_type = group_capacity+"인 공개"
        EMPTY_EXPLAIN = "<p style='color:#fe4e65;font-size:11px;'>이 클래스 소속인원은 이 클래스명으로 개설된 레슨에 예약 가능하며, 클래스 소속인원수는 제한이 없습니다. 수업당 정원은 "+groupcapacity+" 명입니다.</p>";
    }else if(grouptype == "NORMAL"){
        //var group_type = group_capacity+"인 비공개"
        EMPTY_EXPLAIN = "";
    }else{
        EMPTY_EXPLAIN = "";
    }

    var addButton = '';

    if(groupcapacity <= len && grouptype =='NORMAL'){
        addButton = '';
    }else{
        addButton = '<div><img src="/static/user/res/floatbtn/btn-plus.png" class="btn_add_member_to_group" data-grouptype="'+grouptype+'" data-packageid="'+package_id+'"></div>';
    }

    if(grouptype=='ONE_TO_ONE' || $('#finishedGroupList').css('display') == "block"){
        addButton = '';
    }

    // var html = htmlToJoin.join('') + addButton;
    // if(jsondata.db_id.length == 0){
    //     if($('#currentGroupList').css('display') == "block"){
    //         if(grouptype == 'EMPTY') {
    //             html = '<p">이 클래스에 소속 된 회원이 없습니다.</p><div>' + addButton;
    //         }else if(grouptype == 'NORMAL'){
    //             html = '<p">이 그룹에 소속 된 회원이 없습니다.</p><div>' + addButton;
    //         }
    //     }
    // }
    //$('div.groupMembersWrap[data-groupid="'+package_id+'"]').html(EMPTY_EXPLAIN+html);

    //수업관리에서 수업에 회원을 넣고 빼는건 이제 금지. 수강권에서 한다.
    var html = htmlToJoin.join('');
    if(jsondata.db_id.length == 0){
        if($('#currentGroupList').css('display') == "block"){
            if(grouptype == 'EMPTY') {
                html = '<p">이 클래스에 소속 된 회원이 없습니다.</p><div>';
            }else if(grouptype == 'NORMAL'){
                html = '<p">이 그룹에 소속 된 회원이 없습니다.</p><div>';
            }
        }
    }

    $('#popup_ticket_info_mobile_memberlist').html(html);
}
//패키지 소속 회원 목록을 그룹에 그리기 모바일

//새로운 패키지를 만든다
function send_new_package_info(packagedata, use, callback){
    var bodywidth = window.innerWidth;
    var grouptype = $('#form_grouptype').val();
    var option_limit_type;
    var number_has;
    // if(grouptype == "NORMAL" ){
    //     option_limit_type = "group_create";
    //     number_has = $(`div._grouptypecd[data-package-type="${grouptype}"]`).length;
    // }else if(grouptype == "EMPTY"){
    //     option_limit_type = "class_create";
    //     number_has = $(`div._grouptypecd[data-package-type="${grouptype}"]`).length;
    // }else if(grouptype == "PACKAGE"){
    //     option_limit_type = "package_create";
    //     number_has = $(`div._grouptypecd[data-package-type="${grouptype}"]`).length;
    // }
    option_limit_type = "package_create";
    // number_has = $(`div._grouptypecd[data-package-type]`).length;
    number_has = $('#currentPackageList').attr('total_package_num');
    $.ajax({
        url:'/trainer/add_package_info/',
        data: JSON.stringify(packagedata),
        type:'POST',
        dataType : 'html',

        beforeSend:function(xhr, settings){
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            pters_option_inspector(option_limit_type, xhr, number_has);
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            console.log("add_package_info",jsondata);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(use == 'callback'){
                    callback(jsondata);
                }

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
//새로운 패키지를 만든다
function make_new_package_info_to_json_form(){
    //{ “package_info” : [  {“package_name”: xx , “package_note”:xx}], “new_package_group_data” : [{“group_id”: xx}, {“group_id”:xx}, ….]}
    // var groupids = [];

    var jsondata = {
                    "package_info":{"package_name":$('#packagename').val(), "package_note":$('#packagememo').val()},
                    "new_package_group_data":[]
                    };
    $('#selected_lectures_to_package_wrap .lecture_bubble').each(function(){
        jsondata.new_package_group_data.push({"group_id":$(this).attr('data-groupid')});
    });
    return jsondata;
}

function get_grouplist_in_package(package_id, state, use, callback){
    var url = '/trainer/get_package_group_list/';
    if(state == 'current'){
        url = '/trainer/get_package_group_list/';
    }else if(state == 'finished'){
        url = '/trainer/get_end_package_group_list/';
    }
    $.ajax({
        url: url,
        data: {"package_id": package_id},
        type:'GET',
        dataType : 'html',

        beforeSend:function(xhr, settings){
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            // pters_option_inspector("group_read", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            console.log("get_grouplist_in_package",jsondata);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                // if(bodywidth < 600){
                //     scrollToDom($('#page_addmember'));
                // }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(use == 'callback'){
                    callback(jsondata);
                }
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}

function draw_grouplist_in_package($targetHTML, jsondata){
    var htmlToJoin = [];
    for(var i=0; i<jsondata.group_id.length; i++){
        htmlToJoin.push(
                            `<div class="lecture_bubble lecture_bubble_mini" data-groupid=${jsondata.group_id[i]} data-groupname='${jsondata.group_name[i]}'>
                                <p><span>${jsondata.group_name[i]}</span><img src="/static/user/res/member/icon-x-grey.png" data-groupid="${jsondata.group_id[i]}"></p>
                              </div>`
                        );
    }
    var group_add_button = `<img src="/static/user/res/member/icon-x-red.png" data-packageid="${$targetHTML.attr("data-packageid")}" class="btn_add_lecture_bubble_mini" title="패키지에 수강권 추가하기">`;
    //var html = htmlToJoin.join("");
    //if(jsondata.group_type_cd != "ONE_TO_ONE"){
        html = htmlToJoin.join("")+group_add_button;
    //
    $targetHTML.html(html);
}

//패키지 지우기
function delete_package_from_list(package_id, use, callback){
    var bodywidth = window.innerWidth;
    var next_page = '/trainer/get_group_ing_list';
    if($('#currentPackageList').css('display') == "block"){
        next_page = '/trainer/get_package_ing_list';
    }else if($('#finishedPackageList').css('display') == "block"){
        next_page = '/trainer/get_package_end_list';
    }
    $.ajax({
        url:'/trainer/delete_package_info/',
        type:'POST',
        data: {"package_id":package_id, "next_page":next_page},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            pters_option_inspector("package_delete", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                smart_refresh_member_group_class_list();
                if(use == "callback"){
                    callback();
                }

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
//패키지 지우기


//패키지에서 그룹뺴기
function delete_group_from_package(package_id, group_id, use, callback){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/delete_package_group_info/',
        type:'POST',
        data: {"package_id":package_id, "group_id":group_id},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            pters_option_inspector("package_delete", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                smart_refresh_member_group_class_list();
                if($('#popup_ticket_info_mobile').css('display') == "block"){
                    var package_statuscd = $('#mypackagestatuscd').attr('data-status');
                    var $targetlecturelist = $('#popup_ticket_info_mobile_lecturelist');
                    get_grouplist_in_package(package_id, package_statuscd, "callback", function(jsondata){
                        draw_grouplist_in_package($targetlecturelist, jsondata);
                    });
                }
                if(use == "callback"){
                    callback();
                }

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
//패키지 지우기


//이미 있는 패키지에 그룹추가하기
function add_group_from_package(package_id, group_id, use, callback){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/add_package_group_info/',
        type:'POST',
        data: {"package_id":package_id, "group_id":group_id},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            // pters_option_inspector("package_create", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                smart_refresh_member_group_class_list();
                if(use == "callback"){
                    callback();
                }

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
//패키지 지우기

//패키지 정보 수정
function modify_package_from_list(package_id, package_name, package_note, use, callback){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/update_package_info/',
        type:'POST',
        data: {"package_id":package_id, "package_name":package_name, "package_note":package_note},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            pters_option_inspector("package_update", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                smart_refresh_member_group_class_list();

                $('img._info_cancel').hide();
                if(bodywidth > 1000){
                    $('img._info_download, img._info_delete').show();
                    toggle_lock_unlock_inputfield_grouplist(package_id, true);
                }else{
                    $('img._info_delete').show();
                }

                if($('#popup_ticket_info_mobile').css('display') == "block"){
                    if(package_name.length != 0){
                        if(bodywidth<600){
                            $('#uptext3').text(package_name);
                            $('#ticketnametitle, #ticketdelete').hide();
                            $('#upbutton-modify').find('img').attr('src', '/static/user/res/icon-pencil.png');
                        }else{
                            $('#ticketdelete').hide();
                            $('#popup_ticket_info_mobile_modify_btn').find('img').attr('src', '/static/user/res/icon-pencil.png');
                        }
                       
                    }
                    
                }
                console.log('success');

                if(use == "callback"){
                    callback(jsondata);
                }
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}
//패키지 정보 수정

//패키지 완료, 재개하기
function modify_package_status(package_id, option){

    var bodywidth = window.innerWidth;
    var _URL;
    var text_for_mobile;
    var color_for_mobile;
    if(option == 'complete'){
        _URL = '/trainer/finish_package_info/';
        text_for_mobile = "종료";
        color_for_mobile = "red";
    }else if(option == 'resume'){
        _URL = '/trainer/progress_package_info/';
        text_for_mobile = "진행중";
        color_for_mobile = "green";
    }
    var option_limit_type = "package_update";
    // number_has = $(`div._grouptypecd[data-package-type]`).length;
    var number_has = $('#currentPackageList').attr('total_package_num');

    $('#shade_caution').hide();
    hide_shadow_responsively();
    $('.lectureStateChangeSelectPopup').css('display', 'none');

    $.ajax({
        url: _URL,
        type:'POST',
        data: {"package_id":package_id},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            if(option=='resume'){
                pters_option_inspector(option_limit_type, xhr, number_has);
            }
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                // if(bodywidth < 600){
                //     $('#page_managemember').show();
                // }
                //$('html').css("cursor","auto")
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                smart_refresh_member_group_class_list();
                $('.mobile_status_color_palette').siblings('div').text(text_for_mobile).css('color', color_for_mobile);
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}
//패키지 완료, 재개하기


//새로운 수강권 멤버 정보 서버로 보내 등록하기
function add_ticketmember_form_func(){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/add_package_member/',
        type:'POST',
        data: JSON.stringify(added_ticket_member_info_to_jsonformat()),
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            // pters_option_inspector("groupmember_create", xhr, "");
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
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');
                if(bodywidth < 600){
                    scrollToDom($('#page_addmember'));
                }
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if(bodywidth < 1000){
                    var package_id = $('#mypackageid').attr('data-packageid');
                    if(bodywidth < 600){
                        closePopup_mobile('upbutton-x');
                    }else{
                        close_manage_popup('member_add');
                    }
                    
                    if($('.pters_selectbox_btn_selected').attr('data-status')=='current'){
                        get_package_member_list(package_id);
                    }else{
                        get_end_package_member_list(package_id);
                    }
                    //$('#page_managemember').show();
                    //$('#page_managemember').css({'height':'100%'});
                }else{
                    $('body').css('overflow-y', 'auto');
                    close_manage_popup('member_add');
                }
                $('#upbutton-check img').attr('src', '/static/user/res/ptadd/btn-complete.png');

                smart_refresh_member_group_class_list();
                $('#startR').attr('selected', 'selected');
                
                
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

//ajax로 서버에 보낼 때, 추가된 회원들의 정보를 form에 채운다.
function added_ticket_member_info_to_jsonformat(){
    var fast_check = $('#fast_check').val();
    var search_confirm = $('#id_search_confirm').val();
    var package_id = $('#form_member_groupid').val();
    var counts;
    var price;
    var start_date;
    var end_date;
    var memo;
    if(fast_check == 1){
        counts = $('#memberCount_add').val();
        price = $('#lecturePrice_add_value').val();
        start_date = $('#datepicker_add').val();
        end_date = $('#datepicker2_add').val();
        memo = $('#comment').val();
    }else if(fast_check == 0){
        counts = $('#memberCount_add_fast').val();
        price = $('#lecturePrice_add_value_fast').val();
        start_date = $('#datepicker_fast').val();
        end_date = $('#memberDue_add_2_fast').val();
        memo = $('#comment_fast').val();
    }

    var dataObject = {
        "new_member_data":[],
        "old_member_data":[],
        "lecture_info":{
            "fast_check":fast_check,
            "memo": memo,
            "counts": counts,
            "price": price,
            "search_confirm": search_confirm,
            "start_date": start_date,
            "end_date": end_date,
            "package_id":package_id
        }
    };

    var len = $('#addedMemberListBox .addByNewRaw').length;
    for(var i=1; i<len+1; i++){
        var data;
        if($('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-dbid').length == 0){
            var firstname = $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-firstname');
            var lastname = $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-lastname');
            var phone = $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-phone');
            var sex = $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-sex');
            data = {
                "first_name" : firstname,
                "last_name" : lastname,
                "phone" : phone,
                "sex" : sex,
                "birthday_dt" : ""
            };
            dataObject.new_member_data.push(data);
        }else{
            data = {"db_id" : $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-dbid')};
            dataObject.old_member_data.push(data);
        }
    }

    return dataObject;
}

//수강권에서 인원 지우기
function delete_ticketmember_from_grouplist(use, callback){
    console.log(JSON.stringify(group_delete_JSON))
    $.ajax({
        url:'/trainer/delete_package_member_info/',
        type:'POST',
        data:JSON.stringify(group_delete_JSON),
        //data:{"member_name":fullname, "member_id":id, "group_id":group_id, "next_page":'/trainer/get_group_info/'},
        dataType : 'html',

        beforeSend:function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
            beforeSend();
            pters_option_inspector("groupmember_delete", xhr, "");
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            enable_delete_btns_after_ajax();
            var jsondata = JSON.parse(data);
            //ajax_received_json_data_member_manage(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                console.log('success');
                if(use == "callback"){
                    callback();
                }
            }
        },

        //통신 실패시 처리
        error:function(){
            $('#errorMessageBar').show();
            $('#errorMessageText').text('통신 에러: 관리자 문의');
        }
    });
}
//수강권에서 인원 지우기