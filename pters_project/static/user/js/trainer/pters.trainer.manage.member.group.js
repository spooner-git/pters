
/////////////그룹타입, 그룹정원 드랍다운 값을 Form에 셋팅/////////////////////////////////////////
$('#groupname').keyup(function(){
	check_dropdown_selected()
})
$('#grouptype').change(function(){
	$('#form_grouptype').val($(this).val())
	check_dropdown_selected()
})
$('#groupcapacity').change(function(){
	$('#form_groupcapacity').val($(this).val())
	check_dropdown_selected()
})
/////////////그룹타입, 그룹정원 드랍다운 값을 Form에 셋팅/////////////////////////////////////////


/////////////신규 회원으로 추가 버튼 누르면 행 생성/////////////////////////////////////////
var added_New_Member_Num = 0
$('button#addByNew').click(function(e){
	addByNew_input_eventGroup()
	e.preventDefault()
	added_New_Member_Num++
	var htmlstart = '<div class="addByNewRaw" data-dbid="" data-id="">'
	var nameinput = '<input class="new_member_lastname" placeholder="회원 성"><input class="new_member_firstname" placeholder="회원 이름">'
	var sexinput = '<select><option selected disabled>성별</option><option value="M">남</option><option value="W">여</option></select>'
	var phoneinput = '<input type="tel" class="new_member_phone" placeholder="전화번호">'
	var substract = '<img src="/static/user/res/member/icon-x-red.png" class="substract_addedMember">'
	var htmlend = '</div>'

	var html = htmlstart + nameinput + sexinput + phoneinput + substract + htmlend
	$('#addedMemberListBox span').text(added_New_Member_Num+' 명')
	$('#addedMemberListBox').prepend(html)
})

//회원추가된 항목에서 x버튼을 누르면 목록에서 뺀다.
$(document).on('click','img.substract_addedMember',function(){
	added_New_Member_Num--
	$('#addedMemberListBox span').text(added_New_Member_Num+' 명')
	$(this).parent('.addByNewRaw').remove()

	//목록에서 뺄때 [리스트에서 추가]로 추가된 항목은 리스트로 다시 돌려놓는다.
	if($(this).hasClass('_addedByList')){
		var name = $(this).parent('.addByNewRaw').attr('data-name')
		var dbid = $(this).parent('.addByNewRaw').attr('data-dbid')
		var id = $(this).parent('.addByNewRaw').attr('data-id')
		var sex = $(this).parent('.addByNewRaw').attr('data-sex')
		var phone = $(this).parent('.addByNewRaw').attr('data-phone')

		var sexInfo = '<img src="/static/user/res/member/icon-sex-'+sex+'.png">'
		var html = '<div class="list_addByList" data-name="'+name+'" data-dbid="'+dbid+'" data-id="'+id+'" data-sex="'+sex+'" data-phone="'+phone+'"><div data-dbid="'+dbid+'">'+sexInfo+name+' (ID: '+id+')'+'</div>'+'<div>'+phone+'</div>'+'<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>'
	
		$('#subpopup_addByList').append(html)
	}

})

//신규로 새로 그룹원으로 추가된 행의 input값들에 대한 key,드랍다운 이벤트모음
function addByNew_input_eventGroup(){
	//이름 input이 자신이 속한 부모 행의 attr에 이름 정보를 입력해둔다.
	$(document).on('keyup', '.addByNewRaw input.new_member_lastname', function(){
		$(this).parent('.addByNewRaw').attr({'data-lastname': $(this).val()})
	})

	$(document).on('keyup', '.addByNewRaw input.new_member_firstname', function(){
		$(this).parent('.addByNewRaw').attr({'data-firstname': $(this).val()})
	})

	$(document).on('change', '.addByNewRaw select', function(){
		$(this).parent('.addByNewRaw').attr('data-sex', $(this).val())
	})

	$(document).on('keyup', '.addByNewRaw input.new_member_phone', function(){
		$(this).parent('.addByNewRaw').attr('data-phone', $(this).val())
	})

}
/////////////신규 회원으로 추가 버튼 누르면 행 생성/////////////////////////////////////////



/////////////리스트에서 추가 버튼 누르면 회원리스트 팝업//////////////////////////////////
$('button#addByList, button#addBySearch').click(function(e){
	e.preventDefault()
	$('#subpopup_'+$(this).attr('id')).show()

	if($(this).attr('id')=="addByList"){
		draw_memberlist_for_addByList()
	}else if($(this).attr('id')=="addBySearch"){
		//
	}
})

$(document).on('click','#subpopup_addByList .listTitle_addByList span',function(){
	$('#subpopup_addByList').hide()
})


//[리스트에서 추가]를 눌러 나온 팝업의 리스트에서 + 버튼을 누르면 회원 추가란으로 해당회원을 보낸다.
$(document).on('click','img.add_listedMember',function(){
	var selected_lastname = $(this).parents('div.list_addByList').attr('data-lastname')
    var selected_firstname = $(this).parents('div.list_addByList').attr('data-firstname')
	var selected_dbid = $(this).parents('div.list_addByList').attr('data-dbid')
	var selected_id = $(this).parents('div.list_addByList').attr('data-id')
	var selected_sex = $(this).parents('div.list_addByList').attr('data-sex')
	if(selected_sex=="M"){
		var sexInfo = "남"
	}else if(selected_sex=="W"){
		var sexInfo = "여"
	}else{
		var sexInfo = "-"
	}
	var selected_phone = $(this).parents('div.list_addByList').attr('data-phone')
	if(selected_phone.length == 0){
		var selected_phone = "-"
	}

	var html = '<div class="addByNewRaw" data-lastname="'+selected_lastname+'" data-firstname="'+selected_firstname+'" data-dbid="'+selected_dbid+'" data-id="'+selected_id+'" data-sex="'+selected_sex+'" data-phone="'+selected_phone+'">'+'<div>'+selected_lastname+selected_firstname+'</div>'+'<div>'+sexInfo+'</div>'+'<div>'+selected_phone+'</div>'+'<img src="/static/user/res/member/icon-x-red.png" class="substract_addedMember _addedByList">'+'</div>'

	$('#addedMemberListBox').prepend(html)

	added_New_Member_Num++
	$('#addedMemberListBox span').text(added_New_Member_Num+' 명')
	$(this).parents('div.list_addByList').remove()
})

function draw_memberlist_for_addByList(){
	var len = dIdArray.length;
	var htmlToJoin = ['<div class="list_addByList listTitle_addByList" style="border-color:#ffffff;text-align:center;">내 리스트에서 추가<span>닫기</span></div>'+'<div class="list_addByList listTitle_addByList"><div>'+'회원명(ID)'+'</div>'+'<div>'+'연락처'+'</div>'+'<div>추가</div>'+'</div>']
	for(var i=1; i<=len; i++){
		var sexInfo = '<img src="/static/user/res/member/icon-sex-'+sexArray[i-1]+'.png">'
		htmlToJoin[i] = '<div class="list_addByList" data-lastname="'+lastNameArray[i-1]+'" data-firstname="'+firstNameArray[i-1]+'" data-dbid="'+dIdArray[i-1]+'" data-id="'+idArray[i-1]+'" data-sex="'+sexArray[i-1]+'" data-phone="'+phoneArray[i-1]+'"><div data-dbid="'+dIdArray[i-1]+'">'+sexInfo+nameArray[i-1]+' (ID: '+idArray[i-1]+')'+'</div>'+'<div>'+phoneArray[i-1]+'</div>'+'<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>'
	}
	var html = htmlToJoin.join('')
	$('#subpopup_addByList').html(html)
}
/////////////리스트에서 추가 버튼 누르면 회원리스트 팝업//////////////////////////////////



/////////////PTERS에서 ID로 검색해서 그룹원 추가하기/////////////////////////////////////////
$('button#addBySearch_search').click(function(e){
	e.preventDefault()
	var searchID = $('#addBySearch_input').val()
	$.ajax({
            url:'/trainer/get_member_info/',
            type:'POST',
            data: {'id':searchID},
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
					draw_memberlist_for_addBySearch(jsondata)
                }
                
            },

            //통신 실패시 처리
            error:function(){
                $('#errorMessageBar').show();
                $('#errorMessageText').text('아이디를 입력해주세요');
            },
        });
})

$('#subpopup_addBySearch .listTitle_addByList span').click(function(){
	$('#subpopup_addBySearch').hide()
	$('#searchedMemberListBox').html('')
	$('#addBySearch_input').val('')

})

function draw_memberlist_for_addBySearch(jsondata){
	console.log(jsondata)
	var lastname = jsondata.lastnameInfo;
	var firstname = jsondata.firstnameInfo;
	var	phone = jsondata.phoneInfo;
	var	birth = jsondata.birthdayInfo + ''; //형식 1999년 02월 08일
	var	email = jsondata.emailInfo;
	var	id = jsondata.idInfo;
	var	sex = jsondata.sexInfo;


	var table = ['<div class="list_addByList listTitle_addByList"><div>'+'회원명(ID)'+'</div>'+'<div>'+'연락처'+'</div>'+'<div>추가</div>'+'</div>']
	var sexInfo = '<img src="/static/user/res/member/icon-sex-'+sex+'.png">'
	var data = '<div class="list_addByList" data-lastname="'+lastname+'" data-firstname="'+firstname+'" data-dbid="'+'" data-id="'+id+'" data-sex="'+sex+'" data-phone="'+phone+'"><div data-dbid="'+'">'+sexInfo+lastname+firstname+' (ID: '+id+')'+'</div>'+'<div>'+phone+'</div>'+'<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>'
	var html = table + data

	$('#searchedMemberListBox').html(html)
}
/////////////PTERS에서 ID로 검색해서 그룹원 추가하기/////////////////////////////////////////



//ajax로 서버에 보낼 때, 추가된 회원들의 정보를 form에 채운다.
function added_member_info_to_jsonformat(){
    var fast_check = $('#fast_check').val();
    var memo = $('#comment').val();
    var search_confirm = $('#id_search_confirm').val()
    var group_id = $('#form_member_groupid').val()
    if(fast_check == 1){
        var counts = $('#memberCount_add').val()
        var price = $('#lecturePrice_add_value').val()
        var start_date = $('#datepicker_add').val()
        var end_date = $('#datepicker2_add').val()
    }else if(fast_check == 0){
        var counts = $('#memberCount_add_fast').val()
        var price = $('#lecturePrice_add_value_fast').val()
        var start_date = $('#datepicker_fast').val()
        var end_date = $('#memberDue_add_2_fast').val()
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
                    }

	var len = $('#addedMemberListBox .addByNewRaw').length;
	for(var i=1; i<len+1; i++){
		if($('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-dbid').length == 0){
			var data = {
                       "first_name" : $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-firstname'),
                       "last_name" : $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-lastname'),
                       "phone" : $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-phone'),
                       "sex" : $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-sex'),
                       "birthday_dt" : ""
                    }
            dataObject["new_member_data"].push(data)
		}else{
            var data = {"db_id" : $('#addedMemberListBox .addByNewRaw:nth-child('+i+')').attr('data-dbid')}
			dataObject["old_member_data"].push(data)
		}
	}
    console.log(dataObject)

    return dataObject
}


//그룹 리스트에서 그룹을 클릭하면 속해있는 멤버 리스트를 보여준다.
$(document).on('click','div.groupWrap',function(){
	var group_id = $(this).attr('data-groupid');
	var memberlist = $(this).siblings('div[data-groupid="'+group_id+'"]')
	if(memberlist.css('display')=='none'){
		memberlist.show()
	}else{
		memberlist.hide()
	}
})
//그룹 리스트에서 그룹을 클릭하면 속해있는 멤버 리스트를 보여준다.

//그룹 리스트에서 그룹 삭제버튼을 누른다.
$(document).on('click','._groupmanage img._info_delete',function(){
	var group_id = $(this).attr('data-groupid')
	delete_group_from_list(group_id)

})
//그룹 리스트에서 그룹 삭제버튼을 누른다.

//그룹 리스트에서 그룹 수정버튼을 누른다.
$(document).on('click','._groupmanage img._info_modify',function(){
	var group_id = $(this).attr('data-groupid')
	var status = $(this).attr('data-edit')

	var group_name = $(this).parent('div').siblings('._groupname').find('input').val()
	var group_capacity = $(this).parent('div').siblings('._groupcapacity').find('input').val()
	var group_memo = $(this).parent('div').siblings('._groupmemo').find('input').val()
	var group_type = $(this).parent('div').siblings('._grouptypecd').find('input').val()
    if(group_capacity == '∞'){ //비정기 그룹일때 무한대로 정원 설정
        var group_capacity = 99
    }

	switch(status){
		case 'view':
			$(this).attr({'data-edit':'edit', 'src':'/static/user/res/btn-pt-complete-small.png'})
			toggle_lock_unlock_inputfield_grouplist(group_id, false)
		break;
		case 'edit':
			$(this).attr({'data-edit':'view', 'src':'/static/user/res/member/icon-edit.png'})
			toggle_lock_unlock_inputfield_grouplist(group_id, true)
			modify_group_from_list(group_id, group_name, group_capacity, group_memo, group_type)
		break;
	}
})
//그룹 리스트에서 그룹 수정버튼을 누른다.


//그룹 멤버 리스트에서 멤버 추가 버튼을 누른다.
$(document).on('click','img.btn_add_member_to_group',function(){
    var group_id = $(this).parents('.groupMembersWrap').attr('data-groupid')
    var group_name = $(this).parents('.groupMembersWrap').attr('data-groupname')
    var group_capacity = $(this).parents('.groupMembersWrap').attr('data-groupcapacity')
    pc_add_member('groupmember')
    $('#uptext2, #uptext2_PC').text('그룹원 추가'+' ('+group_name+')');
    $('#form_member_groupid').val(group_id)
})
//그룹 멤버 리스트에서 멤버 추가 버튼을 누른다.


//서버로부터 그룹 목록 가져오기
function get_group_list(returnvalue){
    //returnvalue 1이면 jsondata를 리턴하고 드랍다운을 생성
    //returnvalue 0이면 리턴하지 않고 리스트를 그린다.
    $.ajax({
        url:'/trainer/get_group_info/',

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
            if(messageArray.length>0){
                $('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                scrollToDom($('#page_addmember'))
                $('#errorMessageBar').show();
                $('#errorMessageText').text(messageArray)
            }else{
                $('#errorMessageBar').hide()
                $('#errorMessageText').text('')
                if($('body').width()<600){
                    $('#page_managemember').show();
                }
                $('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')

                if(returnvalue == "dropdown"){
                    grouptype_dropdown_set(jsondata)
                    return jsondata

                }else{
                    groupListSet('current',jsondata)
                    groupListSet('finished',jsondata)
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


//그룹 지우기
function delete_group_from_list(group_id){
	$.ajax({
        url:'/trainer/delete_group_info/',
        type:'POST',
        data: {"group_id":group_id},
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
                $('html').css("cursor","auto")
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
                $('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')

                groupListSet('current',jsondata)
                groupListSet('finished',jsondata)

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

//그룹 정보 수정
function modify_group_from_list(group_id, group_name, group_capacity, group_memo, group_type){
	$.ajax({
        url:'/trainer/update_group_info/',
        type:'POST',
        data: {"group_id":group_id, "name":group_name, "member_num":group_capacity, "note":group_memo, "group_type_cd":group_type},
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
                $('html').css("cursor","auto")
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
                $('html').css("cursor","auto")
                $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')

                groupListSet('current',jsondata)
                groupListSet('finished',jsondata)

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

//그룹 목록을 화면에 뿌리기
function groupListSet(option, jsondata){ //option : current, finished
    console.log(jsondata)
    switch(option){
        case 'current':
        break;
        case 'finished':
        break;
    }

    var htmlToJoin = [];
    var groupNum = jsondata.group_id.length;
    for(var i=0; i<groupNum; i++){
        var group_name = jsondata.name[i];
        var group_id = jsondata.group_id[i];
        var group_type = jsondata.group_type_cd[i];
        var group_capacity = jsondata.member_num[i];
        var group_createdate = jsondata.reg_dt[i];
        var group_memo = jsondata.note[i];
        var group_memberlist = []
        var group_membernum = jsondata.group_member_num[i] + ' /'
        if(jsondata.group_member_num[i] == 0){
            var group_memberlist = '<p>이 그룹에 등록된 회원이 없습니다.</p><div><img src="/static/user/res/floatbtn/btn-plus.png" class="btn_add_member_to_group" data-groupid="'+group_id+'"></div>'
        }else{
            var group_memberlist = '<p>{회원 리스트 출력!}</p><div><img src="/static/user/res/floatbtn/btn-plus.png" class="btn_add_member_to_group" data-groupid="'+group_id+'"></div>'
        }
        if(group_type == 'EMPTY'){
            var group_capacity = '∞'
        }

        var pcdownloadimage = '<img src="/static/user/res/member/pters-download.png" class="pcmanageicon _info_download" title="엑셀 다운로드" data-groupid="'+group_id+'">';
        var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon _info_delete" title="삭제" data-groupid="'+group_id+'">';
        var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon _info_modify" title="수정" data-groupid="'+group_id+'" data-edit="view">';

        var htmlstart = '<div class="groupWrap" data-groupid="'+group_id+'">'
        var htmlend = '</div>'
        var memberlist = '<div class="groupMembersWrap" data-groupid="'+group_id+'" data-groupname="'+group_name+'" data-groupcapacity="'+group_capacity+'">'+group_memberlist+'</div>'

        var main = '<div class="_groupnum">'+(i+1)+'</div>'+
                    '<div class="_groupname"><input class="group_listinput input_disabled_true _editable" value="'+group_name+'" disabled>'+'</div>'+
                    '<div class="_grouptypecd"><input class="group_listinput input_disabled_true" value="'+group_type+'" disabled>'+'</div>'+
                    '<div class="_groupcapacity">'+group_membernum+'<input style="width:25px;" class="group_listinput input_disabled_true _editable" value="'+group_capacity+'" disabled>'+'</div>'+
                    '<div class="_groupmemo"><input class="group_listinput input_disabled_true _editable" value="'+group_memo+'" disabled>'+'</div>'+
                    '<div class="_groupcreatedate"><input class="group_listinput input_disabled_true" value="'+group_createdate+'" disabled>'+'</div>'+
                    '<div class="_groupmanage">'+pceditimage+pcdownloadimage+pcdeleteimage+'</div>'
        htmlToJoin.push(htmlstart+main+htmlend+memberlist)
    }

    $('#currentGroupList').html(htmlToJoin.join(''))
}

function toggle_lock_unlock_inputfield_grouplist(group_id, disable){ //disable=false 수정가능, disable=true 수정불가
	$('div[data-groupid="'+group_id+'"] input._editable').attr('disabled',disable).removeClass('input_disabled_true').removeClass('input_disabled_false').addClass('input_disabled_'+String(disable))
}



//test
$('#uptext2_PC').click(function(){
    console.log($('.addByNewRaw').length, $('.addByNewRaw:nth-child(1)').attr('data-name'), $('.addByNewRaw:nth-child(2)').attr('data-name'),$('.addByNewRaw:nth-child(3)').attr('data-name'))
    console.log('그룹원 추가',added_member_info_to_jsonformat())
})