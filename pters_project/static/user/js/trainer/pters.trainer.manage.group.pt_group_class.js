
var db_id_flag = 0;
var user_id_flag = 1;

/////////////옵션
if(Options.auth_class == 0){
    $('._groupaddbutton').attr('onclick', "purchase_annai()");
    $('._groupaddbutton').append('<img src="/static/user/res/login/icon-lock-grey.png" style="margin-bottom:3px;height:16px;">');
}
function purchase_annai(){
    alert('그룹 기능 이용권 구매후 이용이 가능합니다.');
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


/////////////신규 회원으로 추가 버튼 누르면 행 생성/////////////////////////////////////////
var added_New_Member_Num = 0;
$('button#addByNew').click(function(e){
    if(!$(this).hasClass('disabled_button')){
        var group_id = $('#form_member_groupid').val();
        var group_type = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-grouptype');
        var group_capacity = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-groupcapacity');
        var alreadyParticipateNumber = $('div.groupMembersWrap[data-groupid="'+group_id+'"] div.memberline').length;
        var addedParticipateNumber = $('#addedMemberListBox div.addByNewRaw').length;

        if(alreadyParticipateNumber + addedParticipateNumber == group_capacity && group_type == "NORMAL" ){
            alert('고정 그룹 : 이미 정원이 가득 찼습니다.');
        }else{
            addByNew_input_eventGroup();
            e.preventDefault();
            added_New_Member_Num++;
            var htmlstart = '<div class="addByNewRaw" data-dbid="" data-id="" data-phone="" data-sex="" data-firstname="" data-lastname="">';
            var nameinput = '<input class="new_member_lastname" placeholder="성"><input class="new_member_firstname" placeholder="이름">';
            var sexinput = '<select><option selected disabled>성별</option><option value="M">남</option><option value="W">여</option></select>';
            var phoneinput = '<input type="tel" class="new_member_phone" placeholder="전화번호">';
            var substract = '<img src="/static/user/res/member/icon-x-red.png" class="substract_addedMember">';
            var htmlend = '</div>';

            var html = htmlstart + nameinput + sexinput + phoneinput + substract + htmlend;
            $('#addedMemberListBox span').text(added_New_Member_Num+' 명');
            $('#addedMemberListBox').prepend(html);
        }
    }
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

});

//신규로 새로 그룹원으로 추가된 행의 input값들에 대한 key,드랍다운 이벤트모음
function addByNew_input_eventGroup(){
    //이름 input이 자신이 속한 부모 행의 attr에 이름 정보를 입력해둔다.
    $(document).on('keyup', '.addByNewRaw input.new_member_lastname', function(){
        $(this).parent('.addByNewRaw').attr({'data-lastname': $(this).val()});
        check_dropdown_selected();
    });

    $(document).on('keyup', '.addByNewRaw input.new_member_firstname', function(){
        $(this).parent('.addByNewRaw').attr({'data-firstname': $(this).val()});
        check_dropdown_selected();
    });

    $(document).on('change', '.addByNewRaw select', function(){
        $(this).parent('.addByNewRaw').attr('data-sex', $(this).val());
        check_dropdown_selected();
    });

    $(document).on('keyup', '.addByNewRaw input.new_member_phone', function(){
        $(this).parent('.addByNewRaw').attr('data-phone', $(this).val());
        check_dropdown_selected();
    });

}
/////////////신규 회원으로 추가 버튼 누르면 행 생성/////////////////////////////////////////



/////////////리스트에서 추가 버튼 누르면 회원리스트 팝업//////////////////////////////////
$('button#addByList, button#addBySearch').click(function(e){
    e.preventDefault();
    e.stopPropagation();

    if(!$(this).hasClass('disabled_button')){
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

    }
});

$(document).on('click','#subpopup_addByList .listTitle_addByList span, ._ADD_MEMBER_REG',function(){
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
    var selected_lastname = $(this).parents('div.list_addByList').attr('data-lastname');
    var selected_firstname = $(this).parents('div.list_addByList').attr('data-firstname');
    var selected_dbid = $(this).parents('div.list_addByList').attr('data-dbid');
    var selected_id = $(this).parents('div.list_addByList').attr('data-id');
    var selected_sex = $(this).parents('div.list_addByList').attr('data-sex');

    //주간, 월간달력 : 그룹레슨에 회원 추가할때.
    if($('#calendar').length != 0 ){
        $('#form_add_member_group_plan_memberid').val(selected_dbid);
        send_add_groupmember_plan('callback', function(data){

            var group_schedule_id = $('#cal_popup_planinfo').attr('schedule_id');
            var group_id = $('#popup_btn_viewGroupParticipants').attr('data-groupid');
            var max = $('#popup_btn_viewGroupParticipants').attr('data-membernum');

            get_group_plan_participants(group_schedule_id, 'callback', function(jsondata){
                if($('#cal_popup_planinfo').attr('group_plan_finish_check') == 1){
                    for(var i = 0; i < jsondata.scheduleIdArray.length; i++){
                        if(jsondata.scheduleFinishArray[i] == 0){
                            $('#id_schedule_id_finish').val(jsondata.scheduleIdArray[i]);
                            $('#id_lecture_id_finish').val(jsondata.classArray_lecture_id[i]);

                            send_plan_complete('callback', function(json, senddata){
                                z++;
                                send_memo();
                                signImageSend(senddata);
                                completeSend();
                                set_schedule_time(json);
                                get_group_plan_participants(group_schedule_id, 'callback', function(d){draw_groupParticipantsList_to_popup(d, group_id, group_schedule_id ,max);});
                                alert('지난 일정 참석자 정상 등록되었습니다.');
                                if(bodywidth < 600){
                                    $('#subpopup_addByList_plan').css({'top': ($('#cal_popup_planinfo').height()-$('#subpopup_addByList_plan').height())/2});
                                }
                                /*
                                 if(z==len){
                                 completeSend();
                                 set_schedule_time(json);
                                 close_info_popup('cal_popup_planinfo')
                                 ajax_block_during_complete_weekcal = true
                                 }
                                 */
                            });
                        }else{

                        }
                    }
                }else{
                    scheduleTime('class', data);
                    scheduleTime('off', data);
                    scheduleTime('group', data);
                    draw_groupParticipantsList_to_popup(jsondata, group_id, group_schedule_id ,max);
                    alert('일정 참석자 정상 등록되었습니다.');
                    if(bodywidth < 600){
                        $('#subpopup_addByList_plan').css({'top': ($('#cal_popup_planinfo').height() - $('#subpopup_addByList_plan').height())/2});
                    }
                }
            });
        });

        //회원관리 : 리스트로 그룹회원 추가
    }else{

        var group_id = $('#form_member_groupid').val();
        var group_type = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-grouptype');
        var group_capacity = $('div.groupMembersWrap[data-groupid="'+group_id+'"]').attr('data-groupcapacity');
        var alreadyParticipateNumber = $('div.groupMembersWrap[data-groupid="'+group_id+'"] div.memberline').length;
        var addedParticipateNumber = $('#addedMemberListBox div.addByNewRaw').length;

        if(alreadyParticipateNumber + addedParticipateNumber == group_capacity && group_type == "NORMAL" ){
            alert('고정 그룹 : 이미 정원이 가득 찼습니다.');
        }else{
            var sexInfo;
            if(selected_sex == "M"){
                sexInfo = "남";
            }else if(selected_sex =="W"){
                sexInfo = "여";
            }else{
                sexInfo = "-";
            }
            var selected_phone = $(this).parents('div.list_addByList').attr('data-phone');
            if(selected_phone.length == 0){
                selected_phone = "-";
            }

            var html = '<div class="addByNewRaw" data-lastname="' + selected_lastname + '" data-firstname="' + selected_firstname + '" data-dbid="'+selected_dbid+'" data-id="'+selected_id+'" data-sex="'+selected_sex+'" data-phone="'+selected_phone+'">'+'<div>'+selected_lastname+selected_firstname+'</div>'+'<div>'+sexInfo+'</div>'+'<div>'+selected_phone+'</div>'+'<img src="/static/user/res/member/icon-x-red.png" class="substract_addedMember _addedByList">'+'</div>';

            $('#addedMemberListBox').prepend(html);

            added_New_Member_Num++;
            $('#addedMemberListBox span').text(added_New_Member_Num+' 명');
            $(this).parents('div.list_addByList').remove();
        }
    }
});

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
                scrollToDom($('#page_addmember'));
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
    e.stopPropagation();
    var group_id = $(this).attr('data-groupid');
    var repeat_list = $(this).siblings('div[data-groupid="'+group_id+'"].groupRepeatWrap');
    var memberlist = $(this).siblings('div[data-groupid="'+group_id+'"].groupMembersWrap');
    if(memberlist.css('display')=='none'){
        if(group_id != "1:1"){
            $(this).addClass('groupWrap_selected');
            memberlist.addClass('groupMembersWrap_selected').show();
            repeat_list.show();
            get_groupmember_list(group_id);
            get_group_repeat_info(group_id);
        }else if(group_id == "1:1"){
            $(this).addClass('groupWrap_selected');
            memberlist.addClass('groupMembersWrap_selected').show();
            if( $('#btnCallCurrent').hasClass('pters_selectbox_btn_selected') ){
                get_member_one_to_one_ing_list("callback", function(jsondata){
                    memberlist.html('<div style="width:100%;">'+ptmember_ListHtml('current', 'name', 'no', jsondata).html+'</div>');
                });
            }else if( $('#btnCallFinished').hasClass('pters_selectbox_btn_selected') ){
                get_member_one_to_one_end_list("callback", function(jsondata){
                    memberlist.html('<div style="width:100%;">'+ptmember_ListHtml('finished', 'name', 'no', jsondata).html+'</div>');
                });
            }
        }
    }else{
        $(this).removeClass('groupWrap_selected');
        memberlist.removeClass('groupMembersWrap_selected').hide();
        repeat_list.hide();
        $(this).find('div._groupmanage img._info_delete').css('opacity', 0.4);
    }
});

//그룹 관리 아이콘 클릭시 자꾸 그룹원 정보가 닫히는 것을 방지
$(document).on('click', 'div._groupmanage', function(e){
    e.stopPropagation();
});
//그룹 리스트에서 그룹을 클릭하면 속해있는 멤버 리스트를 보여준다.

//그룹 리스트에서 그룹 삭제버튼을 누른다.
//var group_delete_JSON = {"group_id":"", "lecture_ids":[], "fullnames":[], "ids":[]}
var group_delete_JSON = {"group_id":"", "fullnames":[], "ids":[]};
$(document).on('click', '._groupmanage img._info_delete', function(e){
    e.stopPropagation();
    group_delete_JSON = {"group_id":"", "fullnames":[], "ids":[]};
    if($(this).css('opacity') == 1){
        deleteTypeSelect = 'groupdelete';
        $('#cal_popup_plandelete').show();
        $('#popup_delete_question').text('정말 이 그룹을 삭제하시겠습니까?');
        //삭제 확인팝업에서 확인할 수 있도록 삭제대상을 JSON 형식으로 만든다.
        var group_id = $(this).attr('data-groupid');
        var memberLen = $('div.memberline[data-groupid="'+group_id+'"]').length;
        for(var k=2; k<=memberLen+1; k++){
            //group_delete_JSON.lecture_ids.push($('div.groupMembersWrap[data-groupid="'+group_id+'"]').find('.memberline:nth-of-type('+k+')').attr('data-lecid'))
            group_delete_JSON.ids.push($('div.groupMembersWrap[data-groupid="'+group_id+'"]').find('.memberline:nth-of-type('+k+')').attr('data-dbid'));
            group_delete_JSON.fullnames.push($('div.groupMembersWrap[data-groupid="'+group_id+'"]').find('.memberline:nth-of-type('+k+')').attr('data-fullname'));
        }
        group_delete_JSON.group_id = group_id;
        shade_index(150);
    }else{
        alert('그룹원 리스트를 펼쳐 확인 후 삭제 해주세요.');
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
        var group_id = $(this).attr('data-groupid');
        var status = $(this).attr('data-edit');


        switch(status){
            case 'view':
                ori_group_name = $(this).parent('div').siblings('._groupname').find('input').val();
                ori_group_capacity = $(this).parent('div').siblings('._grouppartystatus').find('input').val();
                ori_group_memo = $(this).parent('div').siblings('._groupmemo').find('input').val();
                ori_group_type = $(this).parent('div').siblings('._grouptypecd').attr('data-group-type');

                $(this).attr({'data-edit':'edit', 'src':'/static/user/res/btn-pt-complete-small.png'});
                $(this).siblings('img._info_cancel').show();
                $(this).siblings('img._info_download, img._info_delete').hide();
                $('img._info_modify[data-edit="view"]').addClass('disabled_button');
                toggle_lock_unlock_inputfield_grouplist(group_id, false);
                break;
            case 'edit':
                var group_name = $(this).parent('div').siblings('._groupname').find('input').val();
                var group_capacity = $(this).parent('div').siblings('._grouppartystatus').find('input').val();
                var group_memo = $(this).parent('div').siblings('._groupmemo').find('input').val();
                var group_type = $(this).parent('div').siblings('._grouptypecd').attr('data-group-type');


                $(this).attr({'data-edit':'view', 'src':'/static/user/res/member/icon-edit.png'});
                //toggle_lock_unlock_inputfield_grouplist(group_id, true)
                modify_group_from_list(group_id, group_name, group_capacity, group_memo, group_type);
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
            toggle_lock_unlock_inputfield_grouplist(group_id, true);
            e.stopPropagation();
        });
        //그룹 리스트에서 그룹 수정 취소 버튼을 누른다.
    }

});

$(document).on('click', '._groupstatus_disabled_false', function(e){
    e.stopPropagation();
    $('.lectureStateChangeSelectPopup').css('display', 'block').attr('data-grouptype', 'group');
    $('.lectureStateChangeSelectPopup ._complete').attr('data-groupid', $(this).attr('data-groupid'));
    $('.lectureStateChangeSelectPopup ._resume').attr('data-groupid', $(this).attr('data-groupid'));

    if($(this).attr('data-groupstatus') == "IP"){
        $('._complete').css('display', 'block');
        $('._resume, ._refund, ._delete').css('display', 'none');
        $(document).on('click', '._complete', function(){
            if($('.lectureStateChangeSelectPopup').attr('data-grouptype')=='group'){
                modify_group_status($(this).attr('data-groupid'), 'complete');
            }else{
                var lectureID = $('.lectureStateChangeSelectPopup').attr('data-leid');
                var dbID = $('.lectureStateChangeSelectPopup').attr('data-dbid');
                complete_member_reg_data_pc(lectureID, dbID);
                $('.lectureStateChangeSelectPopup').css('display','none');
            }
            $('.lectureStateChangeSelectPopup').attr('data-grouptype','');
        });
    }else if($(this).attr('data-groupstatus') == "PE"){
        $('._resume').css('display', 'block');
        $('._complete, ._refund, ._delete').css('display', 'none');
        $(document).on('click', '._resume', function(){
            if($('.lectureStateChangeSelectPopup').attr('data-grouptype')=='group'){
                modify_group_status($(this).attr('data-groupid'), 'resume');
            }else{
                var lectureID = $('.lectureStateChangeSelectPopup').attr('data-leid');
                var dbID = $('.lectureStateChangeSelectPopup').attr('data-dbid');
                resume_member_reg_data_pc(lectureID, dbID);
                $('.lectureStateChangeSelectPopup').css('display', 'none');
            }
            $('.lectureStateChangeSelectPopup').attr('data-grouptype', '');
        });
    }
});

$(document).on('click', '.groupWrap input', function(e){
    e.stopPropagation();
});
//그룹 리스트에서 그룹 수정버튼을 누른다.


//그룹 멤버 리스트에서 멤버 추가 버튼을 누른다.
$(document).on('click', 'img.btn_add_member_to_group', function(){
    var bodywidth = window.innerWidth;
    var group_id = $(this).parents('.groupMembersWrap').attr('data-groupid');
    var group_name = $(this).parents('.groupMembersWrap').attr('data-groupname');
    var group_capacity = $(this).parents('.groupMembersWrap').attr('data-groupcapacity');
    if(bodywidth < 600){
        float_btn_managemember("groupmember");
    }else{
        pc_add_member('groupmember');
    }
    $('#uptext2, #uptext2_PC').text('그룹원 추가'+' ('+group_name+')');
    $('#form_member_groupid').val(group_id);
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
                scrollToDom($('#page_addmember'));
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
                scrollToDom($('#page_addmember'));
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
function delete_group_from_list(group_id){
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
                scrollToDom($('#page_addmember'));
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
                scrollToDom($('#page_addmember'));
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
                scrollToDom($('#page_addmember'));
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
                //     get_group_ing_list("callback", function(json){
                //         group_class_ListHtml('current', json);
                //     });
                //     //group_class_ListHtml('current',jsondata)
                // }else if($('#finishedGroupList').css('display') == "block"){
                //     get_group_end_list("callback", function(json){
                //         group_class_ListHtml('finished', json);
                //     });
                //     //group_class_ListHtml('finished',jsondata)
                // }
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
    var groupType;
    var groupType2;
    var groupType3;
    var member_number = 0;
    for(var i=0; i<len; i++){
        if(jsondata.groupInfoArray[i].split('/').indexOf('1:1') >= 0){
            member_number++;
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

    var htmlToAdd = '<div class="groupWrap" data-groupid="'+'1:1"'+' group_id="'+'1:1"'+'">'+
                    '<div class="_groupnum"></div>'+
                        '<div class="_grouptypecd" data-group-type="'+"group_type"+'"><input class="group_listinput input_disabled_true" value="'+"1:1"+'" disabled>'+'</div>'+
                        '<div class="_groupname"><input class="group_listinput input_disabled_true _editable" value="'+"1:1 레슨"+'" disabled>'+'</div>'+
                        '<div class="_groupparticipants '+"full_group"+'">'+ "group_membernum"+'</div>'+
                        '<div class="_groupcapacity">'+'<input style="width:25px;" class="group_listinput input_disabled_true _editable '+"full_group"+'" value="'+"group_capacity"+'" disabled>'+'</div>'+
                        '<div class="_grouppartystatus '+"full_group"+'"><span>'+ g_ptmembernum + ' </span> ' +'</div>'+
                        '<div class="_groupmemo"><input class="group_listinput input_disabled_true _editable" value="'+""+'" disabled>'+'</div>'+
                        '<div class="_groupcreatedate"><input class="group_listinput input_disabled_true" value="'+'기본 생성'+'" disabled>'+'</div>'+
                        '<div class="_groupstatus" data-groupid="'+"group_id"+'">'+'<span class="_editable _groupstatus_'+"groupstatus_cd"+'" data-groupstatus="'+"groupstatus_cd"+'" data-groupid="'+"group_id"+'">'+"-"+'</span>'+'</div>'+
                        '<div class="_groupmanage">'+'</div>'+
                    '</div></div>'+
                    '<div class="groupMembersWrap" data-groupid="'+'1:1'+'" data-groupname="'+'1:1'+'" data-groupcapacity="'+'" data-grouptype="'+'1:1'+'">'+'</div>'
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
        var group_memberlist = []
        var group_membernum = jsondata.group_member_num[i];
        var group_capacity = jsondata.member_num[i];
        var groupstatus = jsondata.state_cd_name[i];
        var groupstatus_cd = jsondata.state_cd[i];

        ordernum++
        var full_group = ""
        if(group_membernum == group_capacity && group_type == "NORMAL"){
            var full_group = "red_color_text"
        }

        var pcdownloadimage = '<img src="/static/user/res/member/pters-download.png" class="pcmanageicon _info_download" title="엑셀 다운로드" data-groupid="'+group_id+'">';
        var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제" data-groupid="'+group_id+'">';
        var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="수정" data-groupid="'+group_id+'" data-edit="view">';
        var pceditcancelimage = '<img src="/static/user/res/member/icon-x-red.png" class="pcmanageicon _info_cancel" title="취소" data-groupid="'+group_id+'">';
        var img_lock_function = '<img src="/static/user/res/login/icon-lock-grey.png" class="pcmanageicon lock_function" title="기능 구매후 이용 가능" onclick="purchase_annai()">'

        var htmlstart = '<div class="groupWrap" data-groupid="'+group_id+'">'
        var htmlend = '</div>'
        var repeatlist = '<div class="groupRepeatWrap" data-groupid="'+group_id+'"></div>'
        var memberlist = '<div class="groupMembersWrap" data-groupid="'+group_id+'" data-groupname="'+group_name+'" data-groupcapacity="'+group_capacity+'" data-grouptype="'+group_type+'">'+group_memberlist+'</div>'
        var manageimgs = '<div class="_groupmanage">'+pceditimage+pceditcancelimage+pcdeleteimage+'</div>';
        if(Options.auth_class == 0){
            manageimgs ='<div class="_groupmanage">'+img_lock_function+'</div>'
        }

        var main = '<div class="_groupnum">'+ordernum+'</div>'+
            '<div class="_grouptypecd" data-group-type="'+group_type+'"><input class="group_listinput input_disabled_true" value="'+group_type_nm+'" disabled>'+'</div>'+
            '<div class="_groupname"><input class="group_listinput input_disabled_true _editable" value="'+group_name+'" disabled>'+'</div>'+
            '<div class="_groupparticipants '+full_group+'">'+ group_membernum+'</div>'+
            '<div class="_groupcapacity">'+'<input style="width:25px;" class="group_listinput input_disabled_true _editable '+full_group+'" value="'+group_capacity+'" disabled>'+'</div>'+
            '<div class="_grouppartystatus '+full_group+'">'+'<div class="group_member_current_num">'+group_membernum+'</div>'+'<span> /</span> ' + '<input style="width:40%;text-align:left;" class="group_listinput input_disabled_true _editable '+full_group+'" value="'+group_capacity+'" disabled>'+'</div>'+
            '<div class="_groupmemo"><input class="group_listinput input_disabled_true _editable" value="'+group_memo+'" disabled>'+'</div>'+
            '<div class="_groupcreatedate"><input class="group_listinput input_disabled_true" value="'+date_format_yyyymmdd_to_yyyymmdd_split(group_createdate,'.')+'" disabled>'+'</div>'+
            '<div class="_groupstatus" data-groupid="'+group_id+'">'+'<span class="_editable _groupstatus_'+groupstatus_cd+'" data-groupstatus="'+groupstatus_cd+'" data-groupid="'+group_id+'">'+groupstatus+'</span>'+'</div>'+
            manageimgs
            //'<div class="_groupmanage">'+pceditimage+pceditcancelimage+pcdeleteimage+'</div>'
        if(group_type == "EMPTY"){
            htmlToJoin.push(htmlstart+main+htmlend+repeatlist+memberlist)
        }else if(group_type == "NORMAL"){
            htmlToJoin2.push(htmlstart+main+htmlend+repeatlist+memberlist)
        }
        
    }

    if(htmlToJoin.length == 0){
        if(option == "current"){
            htmlToJoin.push('<div class="groupWrap" style="height:50px;padding-top:17px !important">추가 된 그룹이 없습니다.</div>')
        }else if(option == "finished"){
            htmlToJoin.push('<div class="groupWrap" style="height:50px;padding-top:17px !important">종료 된 그룹이 없습니다.</div>')
        }
    }
    //$membernum.html(text_membernum+'<span style="font-size:16px;">'+ordernum+'</span>');
    //$targetHTML.html(htmlToJoin2.join('') + htmlToJoin.join(''))
    return htmlToAdd+ htmlToJoin2.join('') + htmlToJoin.join('');
}
//그룹 목록을 화면에 뿌리기

//그룹원 목록을 그룹에 뿌리기
function get_groupmember_list(group_id, use, callback){
    var bodywidth = window.innerWidth;
    $.ajax({
        url:'/trainer/get_group_member/',
        data: {"group_id":group_id},
        type:'GET',
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
                if(bodywidth < 600){
                    $('#page_managemember').show();
                }
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
            '<div class="_remaincount" data-name="'+groupmember_remcount+'">'+groupmember_remcount+'</div>' +
            //'<div class="_startdate" data-name="'+groupmember_startdate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_startdate,'.')+'</div>' +
            //'<div class="_finday" data-name="'+groupmember_enddate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_enddate,'.')+'</div>' +
            //'<div class="_contact" data-name="'+groupmember_phone+'">'+groupmember_phone+'</div>' +
            '<div class="_manage"><img src="/static/user/res/member/icon-x-red.png" class="substract_groupMember" data-fullname="'+groupmember_lastname+groupmember_firstname+'" data-id="'+groupmember_id+'" data-dbid="'+groupmember_dbid+'" data-groupid="'+group_id+'"></div>' +
            htmlEnd;
        }else if(bodywidth >= 600){
            memberRow = htmlStart +
            '<div class="_tdname" data-name="'+groupmember_lastname+groupmember_firstname+'" title="'+groupmember_lastname+groupmember_firstname+'">'+groupmember_lastname+groupmember_firstname+'</div>' +
            '<div class="_id" data-dbid="'+groupmember_dbid+'" data-name="'+groupmember_id+'" title="'+groupmember_id+'">'+groupmember_id+'</div>' +
            '<div class="_regcount" data-name="'+groupmember_regcount+'">'+groupmember_regcount+'</div>' +
            '<div class="_remaincount" data-name="'+groupmember_remcount+'">'+groupmember_remcount+'</div>' +
            '<div class="_startdate" data-name="'+groupmember_startdate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_startdate,'.')+'</div>' +
            '<div class="_finday" data-name="'+groupmember_enddate+'">'+date_format_yyyymmdd_to_yyyymmdd_split(groupmember_enddate,'.')+'</div>' +
            '<div class="_contact" data-name="'+groupmember_phone+'">'+groupmember_phone+'</div>' +
            '<div class="_manage"><img src="/static/user/res/member/icon-x-red.png" class="substract_groupMember" data-fullname="'+groupmember_lastname+groupmember_firstname+'" data-id="'+groupmember_id+'" data-dbid="'+groupmember_dbid+'" data-groupid="'+group_id+'"></div>' +
            htmlEnd;
        }
        

        htmlToJoin.push(memberRow);
    }

    var EMPTY_EXPLAIN;
    if(grouptype == 'EMPTY'){
        //var group_type = group_capacity+"인 공개"
        EMPTY_EXPLAIN = "<p style='color:#fe4e65;font-size:11px;'>이 그룹 소속인원은 이 그룹명으로 개설된 레슨에 예약 가능하며, 그룹 소속인원수는 제한이 없습니다. 수업당 정원은 "+groupcapacity+" 명입니다.</p>";
    }else if(grouptype == "NORMAL"){
        //var group_type = group_capacity+"인 비공개"
        EMPTY_EXPLAIN = "";
    }

    var addButton;
    if(Options.auth_class == 0){
        addButton = '<div><img src="/static/user/res/login/icon-lock-grey.png" style="width:20px;margin-top: 10px;margin-bottom:10px;"  title="기능 구매 후 이용가능" onclick="purchase_annai()"></div>';
    }else{
        if(groupcapacity <= len && grouptype =='NORMAL'){
            addButton = '';
        }else{
            addButton = '<div><img src="/static/user/res/floatbtn/btn-plus.png" class="btn_add_member_to_group" data-grouptype="'+grouptype+'" data-groupid="'+group_id+'"></div>';
        }
    }

    var html = htmlToJoin.join('') + addButton;
    if(jsondata.db_id.length == 0){
        html = '<p">이 그룹에 소속 된 회원이 없습니다.</p><div><img src="/static/user/res/floatbtn/btn-plus.png" class="btn_add_member_to_group" data-grouptype="'+grouptype+'" data-groupid="'+group_id+'"></div>';
    }

    $('div.groupMembersWrap[data-groupid="'+group_id+'"]').html(EMPTY_EXPLAIN+html);
}
//그룹원 목록을 그룹에 그리기

//그룹 목록에서 그룹원 관리의 x 버튼으로 그룹에서 빼기
$(document).on('click','img.substract_groupMember',function(e){
    e.stopPropagation();

    var groupmember_name = $(this).attr('data-fullname');
    var groupmember_dbid = $(this).attr('data-dbid');
    var groupmember_groupid = $(this).attr('data-groupid');
    var groupname = $(`div.groupWrap[data-groupid="${groupmember_groupid}"] ._groupname input`).val();
    group_delete_JSON = {"group_id":"", "fullnames":[], "ids":[]};
    group_delete_JSON.ids.push(groupmember_dbid);
    group_delete_JSON.fullnames.push(groupmember_name);
    group_delete_JSON.group_id = groupmember_groupid;

    $('#cal_popup_plandelete').css('display','block');
    $('#popup_delete_question').text(`${groupname}에서 ${groupmember_name}님을 제외 하시겠습니까?`);
    deleteTypeSelect = "groupMember_Substract_From_Group";
    shade_index(150);
});

$('#popup_delete_btn_yes').click(function(){
    var bodywidth = window.innerWidth;
    //if(ajax_block_during_delete_weekcal == true){
    if(!$(this).hasClass('disabled_button')){
        //ajax_block_during_delete_weekcal = false;
        if(deleteTypeSelect == "groupMember_Substract_From_Group"){
            disable_delete_btns_during_ajax();
            delete_groupmember_from_grouplist('callback',function(){
                close_info_popup('cal_popup_plandelete');
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



function toggle_lock_unlock_inputfield_grouplist(group_id, disable){ //disable=false 수정가능, disable=true 수정불가
    $('div[data-groupid="'+group_id+'"] input._editable').attr('disabled',disable).removeClass('input_disabled_true').removeClass('input_disabled_false').addClass('input_disabled_'+String(disable));
    $('div[data-groupid="'+group_id+'"] span._editable').removeClass('_groupstatus_disabled_false').removeClass('_groupstatus_disabled_true').addClass('_groupstatus_disabled_'+String(disable));
}



//test
$('#uptext2_PC').click(function(){
    console.log($('.addByNewRaw').length, $('.addByNewRaw:nth-child(1)').attr('data-name'), $('.addByNewRaw:nth-child(2)').attr('data-name'),$('.addByNewRaw:nth-child(3)').attr('data-name'));
    console.log('그룹원 추가',added_member_info_to_jsonformat());
});


//서버로부터 그룹 목록 가져오기
function get_member_group_class_ing_list(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴하고 드랍다운을 생성
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_member_group_class_ing_list/',

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
                scrollToDom($('#page_addmember'));
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

                if(use == "callback"){
                    callback(jsondata);
                }else{
                    //groupListSet('current',jsondata)
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
function get_member_group_class_end_list(use, callback){
    var bodywidth = window.innerWidth;
    //returnvalue 1이면 jsondata를 리턴하고 드랍다운을 생성
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_member_group_class_end_list/',

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
                scrollToDom($('#page_addmember'));
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

                if(use == "callback"){
                    callback(jsondata);
                }else{
                    //groupListSet('current',jsondata)
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