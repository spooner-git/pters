

/////////////신규 회원으로 추가 버튼 누르면 행 생성/////////////////////////////////////////
var added_New_Member_Num = 0
$('button#addByNew').click(function(e){
	e.preventDefault()
	added_New_Member_Num++
	var htmlstart = '<div class="addByNewRaw">'
	var nameinput = '<input class="new_member_lastname" placeholder="회원 성"><input class="new_member_firstname" placeholder="회원 이름">'
	var sexinput = '<select><option selected disabled>성별</option><option>남</option><option>여</option></select>'
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
/////////////신규 회원으로 추가 버튼 누르면 행 생성/////////////////////////////////////////



/////////////리스트에서 추가 버튼 누르면 회원리스트 팝업//////////////////////////////////
$('button#addByList, button#addBySearch').click(function(e){
	e.preventDefault()
	$('#subpopup_'+$(this).attr('id')).show()

	if($(this).attr('id')=="addByList"){

		draw_memberlist_for_addByList()
		
	}else if($(this).attr('id')=="addBySearch"){

	}
})

$(document).on('click','#subpopup_addByList .listTitle_addByList span',function(){
	$('#subpopup_addByList').hide()
})


//[리스트에서 추가]를 눌러 나온 팝업의 리스트에서 + 버튼을 누르면 회원 추가란으로 해당회원을 보낸다.
$(document).on('click','img.add_listedMember',function(){
	var selected_name = $(this).parents('div.list_addByList').attr('data-name')
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

	var html = '<div class="addByNewRaw" data-name="'+selected_name+'" data-dbid="'+selected_dbid+'" data-id="'+selected_id+'" data-sex="'+selected_sex+'" data-phone="'+selected_phone+'">'+'<div>'+selected_name+'</div>'+'<div>'+sexInfo+'</div>'+'<div>'+selected_phone+'</div>'+'<img src="/static/user/res/member/icon-x-red.png" class="substract_addedMember _addedByList">'+'</div>'

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
		htmlToJoin[i] = '<div class="list_addByList" data-name="'+nameArray[i-1]+'" data-dbid="'+dIdArray[i-1]+'" data-id="'+idArray[i-1]+'" data-sex="'+sexArray[i-1]+'" data-phone="'+phoneArray[i-1]+'"><div data-dbid="'+dIdArray[i-1]+'">'+sexInfo+nameArray[i-1]+' (ID: '+idArray[i-1]+')'+'</div>'+'<div>'+phoneArray[i-1]+'</div>'+'<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>'
	}
	var html = htmlToJoin.join('')
	$('#subpopup_addByList').html(html)
}


/////////////리스트에서 추가 버튼 누르면 회원리스트 팝업//////////////////////////////////



$('button#addBySearch_search').click(function(){
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
	var data = '<div class="list_addByList" data-name="'+lastname+firstname+'" data-dbid="'+'" data-id="'+id+'" data-sex="'+sex+'" data-phone="'+phone+'"><div data-dbid="'+'">'+sexInfo+lastname+firstname+' (ID: '+id+')'+'</div>'+'<div>'+phone+'</div>'+'<div><img src="/static/user/res/floatbtn/btn-plus.png" class="add_listedMember"></div>'+'</div>'
	var html = table + data

	$('#searchedMemberListBox').html(html)
}