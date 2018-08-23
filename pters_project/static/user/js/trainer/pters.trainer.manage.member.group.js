var db_id_flag = 0;
var user_id_flag = 1;

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


/////////////신규 회원으로 추가 버튼 누르면 행 생성/////////////////////////////////////////
var added_New_Member_Num = 0;
$('button#addByNew').click(function(e){
    if(!$(this).hasClass('disabled_button')){
        var group_id = $('#form_member_groupid').val()
        var group_type = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-grouptype')
        var group_capacity = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-groupcapacity')
        var alreadyParticipateNumber = $('div.groupMembersWrap[data-groupid="'+group_id+'"] div.memberline').length
        var addedParticipateNumber = $('#addedMemberListBox div.addByNewRaw').length

        if(alreadyParticipateNumber + addedParticipateNumber == group_capacity && group_type == "NORMAL" ){
            alert('고정 그룹 : 이미 정원이 가득 찼습니다.')
        }else{
            addByNew_input_eventGroup()
            e.preventDefault()
            added_New_Member_Num++
            var htmlstart = '<div class="addByNewRaw" data-dbid="" data-id="" data-phone="" data-sex="" data-firstname="" data-lastname="">'
            var nameinput = '<input class="new_member_lastname" placeholder="성"><input class="new_member_firstname" placeholder="이름">'
            var sexinput = '<select><option selected disabled>성별</option><option value="M">남</option><option value="W">여</option></select>'
            var phoneinput = '<input type="tel" class="new_member_phone" placeholder="전화번호">'
            var substract = '<img src="/static/user/res/member/icon-x-red.png" class="substract_addedMember">'
            var htmlend = '</div>'

            var html = htmlstart + nameinput + sexinput + phoneinput + substract + htmlend
            $('#addedMemberListBox span').text(added_New_Member_Num+' 명')
            $('#addedMemberListBox').prepend(html)
        }
    }
})

//회원추가된 항목에서 x버튼을 누르면 목록에서 뺀다.
$(document).on('click','img.substract_addedMember',function(){
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

});

//신규로 새로 그룹원으로 추가된 행의 input값들에 대한 key,드랍다운 이벤트모음
function addByNew_input_eventGroup(){
    //이름 input이 자신이 속한 부모 행의 attr에 이름 정보를 입력해둔다.
    $(document).on('keyup', '.addByNewRaw input.new_member_lastname', function(){
        $(this).parent('.addByNewRaw').attr({'data-lastname': $(this).val()});
    });

    $(document).on('keyup', '.addByNewRaw input.new_member_firstname', function(){
        $(this).parent('.addByNewRaw').attr({'data-firstname': $(this).val()});
    });

    $(document).on('change', '.addByNewRaw select', function(){
        $(this).parent('.addByNewRaw').attr('data-sex', $(this).val());
    });

    $(document).on('keyup', '.addByNewRaw input.new_member_phone', function(){
        $(this).parent('.addByNewRaw').attr('data-phone', $(this).val());
    });

}
/////////////신규 회원으로 추가 버튼 누르면 행 생성/////////////////////////////////////////



/////////////리스트에서 추가 버튼 누르면 회원리스트 팝업//////////////////////////////////
$('button#addByList, button#addBySearch').click(function(e){
    e.preventDefault()
    e.stopPropagation()
    
    if(!$(this).hasClass('disabled_button')){
        $(this).siblings('button').addClass('disabled_button');
        $('#subpopup_'+$(this).attr('id')).show();
        if($(this).attr('id')=="addByList"){
            draw_memberlist_for_addByList($('#subpopup_addByList'))
        }else if($(this).attr('id')=="addBySearch"){
            //
        }
    
    }
})

$(document).on('click','#subpopup_addByList .listTitle_addByList span, ._ADD_MEMBER_REG',function(){
    if($('#subpopup_addByList').css('display') == "block"){
        $('#subpopup_addByList').hide()
        $('.groupMemberAddBox button').removeClass('disabled_button');
    }
})

function close_addByList_popup(){
    $('#subpopup_addByList').hide();
    $('#subpopup_addByList_plan').hide();
}


//[리스트에서 추가]를 눌러 나온 팝업의 리스트에서 + 버튼을 누르면 회원 추가란으로 해당회원을 보낸다.
$(document).on('click','img.add_listedMember',function(){
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
                    draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id ,max);
                    get_groupmember_list(group_id, 'callback', function(jsondata){draw_groupParticipantsList_to_add(jsondata, $('#subpopup_addByList_thisgroup'))});//특정그룹 회원목록 업데이트
                    enable_group_member_add_after_ajax();
                    
                    if($('#cal_popup_planinfo').attr('group_plan_finish_check') == 1){
                        alert('지난 그룹일정 참석자 정상 등록되었습니다.');
                        if(bodywidth<600){
                            $('#subpopup_addByList_plan').css({'top': ($('#cal_popup_planinfo').height()-$('#subpopup_addByList_plan').height())/2})
                        }
                    }else{
                        alert('그룹일정 참석자 정상 등록되었습니다.');
                        if(bodywidth<600){
                            $('#subpopup_addByList_plan').css({'top': ($('#cal_popup_planinfo').height()-$('#subpopup_addByList_plan').height())/2})
                        }
                    }

                });
            });
        }

    //회원관리 : 리스트로 그룹회원 추가
    }else{
        var sexInfo = "-";
        if(selected_sex=="M"){
            sexInfo = "남";
        }else if(selected_sex=="W"){
            sexInfo = "여";
        }

        var selected_phone = $(this).parents('div.list_addByList').attr('data-phone');
        if(selected_phone.length == 0){
            selected_phone = "-";
        }

        var html = '<div class="addByNewRaw" data-lastname="'+selected_lastname+'" data-firstname="'+selected_firstname+'" data-dbid="'+selected_dbid+'" data-id="'+selected_id+'" data-sex="'+selected_sex+'" data-phone="'+selected_phone+'">'+'<div>'+selected_lastname+selected_firstname+'</div>'+'<div>'+sexInfo+'</div>'+'<div>'+selected_phone+'</div>'+'<img src="/static/user/res/member/icon-x-red.png" class="substract_addedMember _addedByList">'+'</div>';

        $('#addedMemberListBox').prepend(html);

        added_New_Member_Num++;
        $('#addedMemberListBox span').text(added_New_Member_Num+' 명');
        $(this).parents('div.list_addByList').remove();
    }
});

function disable_group_member_add_during_ajax(){
    $('.add_listedMember').addClass('disabled_button');
}
function enable_group_member_add_after_ajax(){
    $('.add_listedMember').removeClass('disabled_button');
}




function draw_memberlist_for_addByList(targetHTML){
    $.ajax({
        url:'/trainer/get_member_list/',

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
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if($('body').width()<600){
                    //$('#page_managemember').show();
                }
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                var len = jsondata.dIdArray.length;
                var htmlToJoin = ['<div class="list_addByList listTitle_addByList" style="border-color:#ffffff;text-align:center;">내 리스트에서 추가<span>닫기</span></div>'+'<div class="list_addByList listTitle_addByList"><div>'+'회원명(ID)'+'</div>'+'<div>'+'연락처'+'</div>'+'<div>추가</div>'+'</div>'];
                var addedNum = 0;
                for(var i=1; i<=len; i++){
                    if($('#addedMemberListBox div[data-dbid="'+jsondata.dIdArray[i-1]+'"]').length == 0){
                        var sexInfo = '<img src="/static/user/res/member/icon-sex-'+jsondata.sexArray[i-1]+'.png">';
                        htmlToJoin[i] = '<div class="list_addByList" data-lastname="'+jsondata.lastNameArray[i-1]+
                            '" data-firstname="'+jsondata.firstNameArray[i-1]+
                            '" data-dbid="'+jsondata.dIdArray[i-1]+
                            '" data-id="'+jsondata.idArray[i-1]+
                            '" data-sex="'+jsondata.sexArray[i-1]+
                            '" data-phone="'+jsondata.phoneArray[i-1]+
                            '"><div data-dbid="'+jsondata.dIdArray[i-1]+
                            '">'+
                            sexInfo+jsondata.nameArray[i-1]+' (ID: '+jsondata.idArray[i-1]+')'+'</div>'+'<div>'+jsondata.phoneArray[i-1]+'</div>'+
                            //sexInfo+jsondata.nameArray[i-1]+'</div>'+'<div>'+jsondata.phoneArray[i-1]+'</div>'+
                            '<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>';
                        addedNum++
                    }
                }
                var len_finish = jsondata.finishDidArray.length;
                for(var j=1; j<=len_finish; j++){
                    if($('#addedMemberListBox div[data-dbid="'+jsondata.finishDidArray[j-1]+'"]').length == 0 && $('div.groupMembersWrap[data-groupid="'+$('#form_member_groupid').val()+'"] div.memberline[data-dbid="'+jsondata.finishDidArray[j-1]+'"]').length == 0){ //추가될 리스트에 이미 있으면 목록에 보여주지 않는다.
                        var sexInfo = '<img src="/static/user/res/member/icon-sex-'+jsondata.finishsexArray[j-1]+'.png">'
                        htmlToJoin[i+j-1] = '<div class="list_addByList" data-lastname="'+jsondata.finishLastNameArray[j-1]+
                            '" data-firstname="'+jsondata.finishFirstNameArray[j-1]+
                            '" data-dbid="'+jsondata.finishDidArray[j-1]+
                            '" data-id="'+jsondata.finishIdArray[j-1]+
                            '" data-sex="'+jsondata.finishsexArray[j-1]+
                            '" data-phone="'+jsondata.finishphoneArray[j-1]+
                            '"><div data-dbid="'+jsondata.finishDidArray[j-1]+
                            '">'+
                            sexInfo+jsondata.finishnameArray[j-1]+' (ID: '+jsondata.finishIdArray[j-1]+')'+'</div>'+'<div>'+jsondata.finishphoneArray[j-1]+'</div>'+
                            //sexInfo+jsondata.finishnameArray[j-1]+'</div>'+'<div>'+jsondata.finishphoneArray[j-1]+'</div>'+
                            '<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>';
                        addedNum++
                    }
                }
                if(addedNum == 0){
                    htmlToJoin.push('<div class="list_addByList">'+'추가 가능한 회원이 없습니다.'+'</div>')
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
    })
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
            console.log(jsondata);
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
        $('#subpopup_addBySearch').hide()
        $('#searchedMemberListBox').html('')
        $('#addBySearch_input').val('')
        $('.groupMemberAddBox button').removeClass('disabled_button');
    }
})

function draw_memberlist_for_addBySearch(jsondata){
    var lastname = jsondata.lastnameInfo;
    var firstname = jsondata.firstnameInfo;
    var	phone = jsondata.phoneInfo;
    var	birth = jsondata.birthdayInfo + ''; //형식 1999년 02월 08일
    var	email = jsondata.emailInfo;
    var	id = jsondata.idInfo;
    var dbid = jsondata.dbIdInfo;
    var	sex = jsondata.sexInfo;


    var table = ['<div class="list_addByList listTitle_addByList"><div>'+'회원명(ID)'+'</div>'+'<div>'+'연락처'+'</div>'+'<div>추가</div>'+'</div>'];
    var sexInfo = '<img src="/static/user/res/member/icon-sex-'+sex+'.png">';
    var data = '<div class="list_addByList" data-lastname="'+lastname+'" data-firstname="'+firstname+'" data-dbid="'+dbid+'" data-id="'+id+'" data-sex="'+sex+'" data-phone="'+phone+'"><div data-dbid="'+dbid+'">'+sexInfo+lastname+firstname+' (ID: '+id+')'+'</div>'+'<div>'+phone+'</div>'+'<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>';
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
        var selector_addedMemberListBox = $('#addedMemberListBox .addByNewRaw:nth-child('+i+')');
        if(selector_addedMemberListBox.attr('data-dbid').length == 0){
            data = {
                "first_name" : selector_addedMemberListBox.attr('data-firstname'),
                "last_name" : selector_addedMemberListBox.attr('data-lastname'),
                "phone" : selector_addedMemberListBox.attr('data-phone'),
                "sex" : selector_addedMemberListBox.attr('data-sex'),
                "birthday_dt" : ""
            };
            dataObject["new_member_data"].push(data);
        }else{
            data = {"db_id" : selector_addedMemberListBox.attr('data-dbid')};
            dataObject["old_member_data"].push(data);
        }
    }

    return dataObject;
}


//////////////////////////////////그룹 목록 화면/////////////////////////////////////////
//그룹 리스트에서 그룹을 클릭하면 속해있는 멤버 리스트를 보여준다.
$(document).on('click','div.groupWrap',function(e){
    var group_id = $(this).attr('data-groupid');
    var repeat_list = $(this).siblings('div[data-groupid="'+group_id+'"].groupRepeatWrap');
    var memberlist = $(this).siblings('div[data-groupid="'+group_id+'"].groupMembersWrap');
    if(memberlist.css('display')=='none'){
        $(this).addClass('groupWrap_selected');
        memberlist.addClass('groupMembersWrap_selected').show();
        repeat_list.show();
        get_groupmember_list(group_id);
        get_group_repeat_info(group_id);
    }else{
        $(this).removeClass('groupWrap_selected');
        memberlist.removeClass('groupMembersWrap_selected').hide();
        repeat_list.hide();
        $(this).find('div._groupmanage img._info_delete').css('opacity', 0.4);
    }
});
//그룹 리스트에서 그룹을 클릭하면 속해있는 멤버 리스트를 보여준다.

//그룹 리스트에서 그룹 삭제버튼을 누른다.
//var group_delete_JSON = {"group_id":"", "lecture_ids":[], "fullnames":[], "ids":[]}
var group_delete_JSON = {"group_id":"", "fullnames":[], "ids":[]};
$(document).on('click','._groupmanage img._info_delete',function(e){
    e.stopPropagation();
    group_delete_JSON = {"group_id":"", "fullnames":[], "ids":[]};
    if($(this).css('opacity') == 1){
        deleteTypeSelect = 'groupdelete';
        $('#cal_popup_plandelete').fadeIn('fast');
        $('#popup_delete_question').text('정말 이 그룹을 삭제하시겠습니까?');
        //삭제 확인팝업에서 확인할 수 있도록 삭제대상을 JSON 형식으로 만든다.
        var group_id = $(this).attr('data-groupid');
        var memberLen = $('div.memberline[data-groupid="'+group_id+'"]').length;
        for(var k=2; k<=memberLen+1; k++){
            //group_delete_JSON.lecture_ids.push($('div.groupMembersWrap[data-groupid="'+group_id+'"]').find('.memberline:nth-of-type('+k+')').attr('data-lecid'))
            var selector_div_groupMembersWrap_data_groupid = $('div.groupMembersWrap[data-groupid="'+group_id+'"]');
            group_delete_JSON.ids.push(selector_div_groupMembersWrap_data_groupid.find('.memberline:nth-of-type('+k+')').attr('data-id'));
            group_delete_JSON.fullnames.push(selector_div_groupMembersWrap_data_groupid.find('.memberline:nth-of-type('+k+')').attr('data-fullname'));
        }
        group_delete_JSON.group_id = group_id;
        console.log(group_delete_JSON);
    }else{
        alert('그룹원 리스트를 펼쳐 확인 후 삭제 해주세요.');
    }

});
//그룹 리스트에서 그룹 삭제버튼을 누른다.


//그룹 리스트에서 그룹 수정버튼을 누른다.
$(document).on('click','._groupmanage img._info_modify',function(e){
    e.stopPropagation();
    var group_id = $(this).attr('data-groupid');
    var status = $(this).attr('data-edit');

    var group_name = $(this).parent('div').siblings('._groupname').find('input').val();
    var group_capacity = $(this).parent('div').siblings('._groupcapacity').find('input').val();
    var group_memo = $(this).parent('div').siblings('._groupmemo').find('input').val();
    var group_type = $(this).parent('div').siblings('._grouptypecd').find('input').val();
    if(group_capacity == '∞'){ //비정기 그룹일때 무한대로 정원 설정
        group_capacity = 99;
    }

    switch(status){
        case 'view':
            $(this).attr({'data-edit':'edit', 'src':'/static/user/res/btn-pt-complete-small.png'});
            toggle_lock_unlock_inputfield_grouplist(group_id, false);
            break;
        case 'edit':
            $(this).attr({'data-edit':'view', 'src':'/static/user/res/member/icon-edit.png'});
            toggle_lock_unlock_inputfield_grouplist(group_id, true);
            modify_group_from_list(group_id, group_name, group_capacity, group_memo, group_type);
            break;
    }
});
//그룹 리스트에서 그룹 수정버튼을 누른다.


//그룹 멤버 리스트에서 멤버 추가 버튼을 누른다.
$(document).on('click','img.btn_add_member_to_group',function(){
    var group_id = $(this).parents('.groupMembersWrap').attr('data-groupid');
    var group_name = $(this).parents('.groupMembersWrap').attr('data-groupname');
    var group_capacity = $(this).parents('.groupMembersWrap').attr('data-groupcapacity');
    if($('body').width()<600){
        float_btn_managemember("groupmember");
    }else{
        pc_add_member('groupmember');
    }
    $('#uptext2, #uptext2_PC').text('그룹원 추가'+' ('+group_name+')');
    $('#form_member_groupid').val(group_id);
});
//그룹 멤버 리스트에서 멤버 추가 버튼을 누른다.;


//서버로부터 그룹 목록 가져오기
function get_group_ing_list(use, callback){
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
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);
                }else{
                    groupListSet('current',jsondata);
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
//서버로부터 그룹 목록 가져오기

//서버로부터 그룹 목록 가져오기
function get_group_end_list(use, callback){
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
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                if(use == "callback"){
                    callback(jsondata);
                }else{
                    groupListSet('finished',jsondata);
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
//서버로부터 그룹 목록 가져오기

//그룹 지우기
function delete_group_from_list(group_id){
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
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                // $('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                if($('#currentGroupList').css('display') == "block"){
                    groupListSet('current',jsondata);
                }else if($('#finishedGroupList').css('display') == "block"){
                    groupListSet('finished',jsondata);
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
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            enable_delete_btns_after_ajax()
            var jsondata = JSON.parse(data);
            //ajax_received_json_data_member_manage(data);
            if(jsondata.messageArray.length>0){
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }
            else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                get_group_ing_list();
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
    })
}
//그룹원 지우기

//그룹 정보 수정
function modify_group_from_list(group_id, group_name, group_capacity, group_memo, group_type){
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
        },

        //보내기후 팝업창 닫기
        complete:function(){
            completeSend();
        },

        //통신성공시 처리
        success:function(data){
            var jsondata = JSON.parse(data);
            if(jsondata.messageArray.length>0){
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');

                groupListSet('current',jsondata);
                groupListSet('finished',jsondata);
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
//그룹 정보 수정

//그룹 목록을 화면에 뿌리기
function groupListSet(option, jsondata){ //option : current, finished
    console.log('grouplist',jsondata);
    var $membernum;
    var text_membernum;
    switch(option){
        case 'current':
            $membernum = $('#memberNumber_current_group');
            text_membernum = "진행중인 그룹 ";
            break;
        case 'finished':
            $membernum = $('#memberNumber_finish_group');
            text_membernum = "종료된 그룹 ";
            break;
    }

    var htmlToJoin = [];
    var groupNum = jsondata.group_id.length;
    for(var i=0; i<groupNum; i++){
        var group_name = jsondata.name[i];
        var group_id = jsondata.group_id[i];
        var group_type = jsondata.group_type_cd[i];
        var group_createdate = date_format_to_yyyymmdd(jsondata.reg_dt[i].split(' ')[0]+' '+jsondata.reg_dt[i].split(' ')[1]+' '+jsondata.reg_dt[i].split(' ')[2], '-');
        var group_memo = jsondata.note[i];
        var group_memberlist = [];
        var group_membernum = jsondata.group_member_num[i];
        var group_capacity = jsondata.member_num[i];

        var full_group = "";
        if(group_membernum == group_capacity && group_type == "NORMAL"){
            full_group = "red_color_text";
        }

        var pcdownloadimage = '<img src="/static/user/res/member/pters-download.png" class="pcmanageicon _info_download" title="엑셀 다운로드" data-groupid="'+group_id+'">';
        var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제" data-groupid="'+group_id+'">';
        var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="수정" data-groupid="'+group_id+'" data-edit="view">';

        var htmlstart = '<div class="groupWrap" data-groupid="'+group_id+'">';
        var htmlend = '</div>';
        var repeatlist = '<div class="groupRepeatWrap" data-groupid="'+group_id+'"></div>';
        var memberlist = '<div class="groupMembersWrap" data-groupid="'+group_id+'" data-groupname="'+group_name+'" data-groupcapacity="'+group_capacity+'" data-grouptype="'+group_type+'">'+group_memberlist+'</div>';

        var main = '<div class="_groupnum">'+(i+1)+'</div>'+
            '<div class="_groupname"><input class="group_listinput input_disabled_true _editable" value="'+group_name+'" disabled>'+'</div>'+
            '<div class="_grouptypecd"><input class="group_listinput input_disabled_true" value="'+group_type+'" disabled>'+'</div>'+
            '<div class="_groupparticipants '+full_group+'">'+ group_membernum+'</div>'+
            '<div class="_groupcapacity">'+'<input style="width:25px;" class="group_listinput input_disabled_true _editable '+full_group+'" value="'+group_capacity+'" disabled>'+'</div>'+
            '<div class="_groupmemo"><input class="group_listinput input_disabled_true _editable" value="'+group_memo+'" disabled>'+'</div>'+
            '<div class="_groupcreatedate"><input class="group_listinput input_disabled_true" value="'+group_createdate+'" disabled>'+'</div>'+
            '<div class="_groupmanage">'+pceditimage+pcdownloadimage+pcdeleteimage+'</div>';
        htmlToJoin.push(htmlstart+main+htmlend+repeatlist+memberlist);
    }
    if(groupNum == 0){
        if(option == "current"){
            htmlToJoin.push('<div class="groupWrap">추가 된 그룹이 없습니다.</div>')
        }else if(option == "finished"){
            htmlToJoin.push('<div class="groupWrap">종료 된 그룹이 없습니다.</div>')
        }
    }
    $membernum.html(text_membernum+'<span style="font-size:16px;">'+groupNum+'</span>');
    $('#currentGroupList').html(htmlToJoin.join(''));
}
//그룹 목록을 화면에 뿌리기

//그룹원 목록을 그룹에 뿌리기
function get_groupmember_list(group_id, use, callback){
    $.ajax({
        url:'/trainer/get_group_member/',
        data: {"group_id":group_id},
        type:'GET',
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
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                scrollToDom($('#page_addmember'));
                $('#errorMessageBar').show();
                $('#errorMessageText').text(jsondata.messageArray);
            }else{
                $('#errorMessageBar').hide();
                $('#errorMessageText').text('');
                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                //$('html').css("cursor","auto");
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
                if(use == 'callback'){
                    callback(jsondata);
                }else{
                    groupMemberListSet(group_id, jsondata);
                    $('div._groupmanage img._info_delete[data-groupid="'+group_id+'"]').css('opacity', 1);
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
                        '</div>')
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
                        '</div>')
    }
    var len = jsondata.db_id.length;
    var selector_div_groupMembersWrap_data_groupid = $('div.groupMembersWrap[data-groupid="'+group_id+'"]');
    var groupcapacity = selector_div_groupMembersWrap_data_groupid.attr('data-groupcapacity');
    var grouptype = selector_div_groupMembersWrap_data_groupid.attr('data-grouptype');

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

        if(bodywidth < 600){
            var memberRow = htmlStart +
            '<div class="_tdname" data-name="'+groupmember_lastname+groupmember_firstname+'">'+groupmember_lastname+groupmember_firstname+'</div>' +
            '<div class="_id" data-dbid="'+groupmember_dbid+'" data-name="'+groupmember_id+'">'+groupmember_id+'</div>' +
            '<div class="_regcount" data-name="'+groupmember_regcount+'">'+groupmember_regcount+'</div>' +
            '<div class="_remaincount" data-name="'+groupmember_remcount+'">'+groupmember_remcount+'</div>' +
            //'<div class="_startdate" data-name="'+groupmember_startdate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_startdate,'.')+'</div>' +
            //'<div class="_finday" data-name="'+groupmember_enddate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_enddate,'.')+'</div>' +
            //'<div class="_contact" data-name="'+groupmember_phone+'">'+groupmember_phone+'</div>' +
            '<div class="_manage"><img src="/static/user/res/member/icon-x-red.png" class="substract_groupMember" data-fullname="'+groupmember_lastname+groupmember_firstname+'" data-id="'+groupmember_id+'" data-dbid="'+groupmember_dbid+'" data-groupid="'+group_id+'"></div>' +
            htmlEnd
        }else if(bodywidth >= 600){
            var memberRow = htmlStart +
            '<div class="_tdname" data-name="'+groupmember_lastname+groupmember_firstname+'">'+groupmember_lastname+groupmember_firstname+'</div>' +
            '<div class="_id" data-dbid="'+groupmember_dbid+'" data-name="'+groupmember_id+'">'+groupmember_id+'</div>' +
            '<div class="_regcount" data-name="'+groupmember_regcount+'">'+groupmember_regcount+'</div>' +
            '<div class="_remaincount" data-name="'+groupmember_remcount+'">'+groupmember_remcount+'</div>' +
            '<div class="_startdate" data-name="'+groupmember_startdate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_startdate,'.')+'</div>' +
            '<div class="_finday" data-name="'+groupmember_enddate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_enddate,'.')+'</div>' +
            '<div class="_contact" data-name="'+groupmember_phone+'">'+groupmember_phone+'</div>' +
            '<div class="_manage"><img src="/static/user/res/member/icon-x-red.png" class="substract_groupMember" data-fullname="'+groupmember_lastname+groupmember_firstname+'" data-id="'+groupmember_id+'" data-dbid="'+groupmember_dbid+'" data-groupid="'+group_id+'"></div>' +
            htmlEnd
        }

        htmlToJoin.push(memberRow);
    }

    console.log(grouptype);
    var EMPTY_EXPLAIN;
    if(grouptype == 'EMPTY'){
        //var group_type = group_capacity+"인 공개"
        EMPTY_EXPLAIN = "<p style='color:#fe4e65;font-size:11px;'>이 그룹 참여인원은 이 그룹명으로 개설된 레슨에 예약 가능하며, 그룹 참여인원수는 제한이 없습니다. 한 레슨단위 정원은 "+groupcapacity+" 명입니다.</p>";
    }else if(grouptype == "NORMAL"){
        //var group_type = group_capacity+"인 비공개"
        EMPTY_EXPLAIN = "";
    }
    var addButton;
    if(groupcapacity <= len && grouptype =='NORMAL'){
        addButton = '';
    }else{
        addButton = '<div><img src="/static/user/res/floatbtn/btn-plus.png" class="btn_add_member_to_group" data-groupid="'+group_id+'"></div>';
    }

    var html = htmlToJoin.join('') + addButton;
    if(jsondata.db_id.length == 0){
        html = '<p">이 그룹에 참여중인 회원이 없습니다.</p><div><img src="/static/user/res/floatbtn/btn-plus.png" class="btn_add_member_to_group" data-groupid="'+group_id+'"></div>';
    }

    selector_div_groupMembersWrap_data_groupid.html(EMPTY_EXPLAIN+html);
}
//그룹원 목록을 그룹에 그리기

//그룹 목록에서 그룹원 관리의 x 버튼으로 그룹에서 빼기
$(document).on('click','img.substract_groupMember',function(e){
    e.stopPropagation();

    var groupmember_name = $(this).attr('data-fullname')
    var groupmember_dbid = $(this).attr('data-dbid')
    var groupmember_groupid = $(this).attr('data-groupid')
    var groupname = $(`div.groupWrap[data-groupid="${groupmember_groupid}"] ._groupname input`).val();
    group_delete_JSON = {"group_id":"", "fullnames":[], "ids":[]}
    group_delete_JSON.ids.push(groupmember_dbid)
    group_delete_JSON.fullnames.push(groupmember_name)
    group_delete_JSON.group_id = groupmember_groupid

    $('#cal_popup_plandelete').css('display','block');
    $('#popup_delete_question').text(`${groupname}에서 ${groupmember_name}님을 제외 하시겠습니까?`)
    deleteTypeSelect = "groupMember_Substract_From_Group"

})

$('#popup_delete_btn_yes').click(function(){
    var bodywidth = window.innerWidth;
    //if(ajax_block_during_delete_weekcal == true){
    if(!$(this).hasClass('disabled_button')){
        //ajax_block_during_delete_weekcal = false;
        if(deleteTypeSelect == "groupMember_Substract_From_Group"){
            disable_delete_btns_during_ajax();
            delete_groupmember_from_grouplist('callback',function(){
                close_info_popup('cal_popup_plandelete');
            })
        }
    }
});
function disable_delete_btns_during_ajax(){
    $('#popup_delete_btn_yes, #popup_delete_btn_no').addClass('disabled_button')
    //ajax_block_during_delete_weekcal = false;
}

function enable_delete_btns_after_ajax(){
    $('#popup_delete_btn_yes, #popup_delete_btn_no').removeClass('disabled_button')
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

        beforeSend:function(){
            //beforeSend(); //ajax 로딩이미지 출력
        },

        success:function(data){
            var jsondata = JSON.parse(data);
            console.log('get_group_repeat_info',jsondata);
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
    })
}

//서버로부터 받아온 반복일정을 회원정보 팝업에 그린다.
function set_group_repeat_info(jsondata, group_id){
    var $regHistory =  $('div[data-groupid="'+group_id+'"].groupRepeatWrap');

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
    console.log('set_group_repeat_info',jsondata);

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
        if(parseInt(repeat_sum)<10){
            repeat_end_time_hour = '0'+parseInt(repeat_sum);
        }
        var repeat_end_time_min;
        if((repeat_sum%parseInt(repeat_sum))*60 == 0){
            repeat_end_time_min = '00';
        }else if((repeat_sum%parseInt(repeat_sum))*60 == 30){
            repeat_end_time_min = '30';
        }

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
        var summaryInnerBoxText_1 = '<p class="summaryInnerBoxText">'+repeat_type +' '+repeat_day() +' '+repeat_start_time+' ~ '+repeat_end_time+' ('+repeat_dur+')'+'</p>';
        var summaryInnerBoxText_2 = '<p class="summaryInnerBoxText">'+repeat_start_text+repeat_start+' ~ '+repeat_end_text+repeat_end+'</p>';
        var deleteButton = '<span class="deleteBtn"><img src="/static/user/res/daycal_arrow.png" alt="" style="width: 5px;"><div class="deleteBtnBin" data-deletetype="grouprepeatinfo" data-groupid="'+group_id+'" data-repeatid="'+repeat_id+'"><img src="/static/user/res/offadd/icon-bin.png" alt=""></div>';
        schedulesHTML[i] = '<div class="summaryInnerBox" data-repeatid="'+repeat_id+'">'+summaryInnerBoxText_1+summaryInnerBoxText_2+deleteButton+'</div>';
    }
    var title = '';
    var repeat_bg = '';
    if(len != 0){
        title = '<div class="summaryInnerBox_repeat_title" data-repeatid="766"><img src="/static/user/res/offadd/icon-repeat-cal.png" class="pcmanageicon">반복 일정</div>';
        repeat_bg = 'repeat_bg';
    }
    $regHistory.html(title + schedulesHTML.join('')).addClass(repeat_bg);

}


//그룹의 반복일정 id를 보내서 그 반복일정에 묶여있는 회원들의 반복일정 id를 불러온다. (그룹의 반복일정을 삭제할 때 회원들의 반복일정도 같이 지워주기 위해)
function set_group_member_repeat_info(group_repeat_id, use, callback){
    console.log(group_repeat_id);
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
            console.log('set_group_member_repeat_info',jsondata);
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
    })
}

//어떤 그룹반복일정id에 엮인 회원들의 반복일정id들을 모두 삭제요청한다. (그룹의 반복일정을 삭제할 때 회원들의 반복일정도 같이 지워주기 위해)
function send_delete_member_repeat_infos(jsondata){
    //var len = jsondata.{멤버 리피트 id 배열 길이};
    for(var i=0; i<len; i++){

    }
}
/////////////////////////////그룹 반복일정 조회 및 그리기/////////////////////////////



function toggle_lock_unlock_inputfield_grouplist(group_id, disable){ //disable=false 수정가능, disable=true 수정불가
    $('div[data-groupid="'+group_id+'"] input._editable').attr('disabled',disable).removeClass('input_disabled_true').removeClass('input_disabled_false').addClass('input_disabled_'+String(disable));
}



//test
$('#uptext2_PC').click(function(){
    console.log($('.addByNewRaw').length, $('.addByNewRaw:nth-child(1)').attr('data-name'), $('.addByNewRaw:nth-child(2)').attr('data-name'),$('.addByNewRaw:nth-child(3)').attr('data-name'));
    console.log('그룹원 추가',added_member_info_to_jsonformat());
});
