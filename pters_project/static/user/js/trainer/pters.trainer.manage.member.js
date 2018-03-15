$(document).ready(function(){

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

    $('button').on('click',function(){
       // $('html, body').css('overflow-y','hidden')
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

    $('#float_inner1').click(function(){
        $('#page_addmember').fadeIn('fast')
        $('#shade').hide()
        $('#shade3').fadeIn('fast');
        $('#float_inner1,#float_inner2').animate({'opacity':'0','bottom':'25px'},10);
        $('#float_btn_wrap').fadeOut();
        $('#uptext2').text('신규 회원 등록')
        $('#page-base').fadeOut();
        $('#page-base-addstyle').fadeIn();
        scrollToIndicator($('#page_addmember'))
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
        scrollToIndicator($('#page_addmember'))
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

    $('.ymdText-pc-add').click(function(){
        $('#page_addmember').fadeIn('fast')
        $('#shade3').fadeIn('fast');
        $('#uptext2').text('신규 회원 등록')
        $('#page-base').fadeOut();
        $('#page-base-addstyle').fadeIn();
        scrollToIndicator($('#page_addmember'))

        $('#inputError').css('display','none')
        $('#fast_check').val('0')
        $('#form_birth').val('')
        $('#memberBirthDate, #memberBirthDate_info').html('')
        birth_dropdown_set()

        $('#memberSearchButton').attr('data-type','')
        $('#memberSex .selectboxopt').removeClass('selectbox_disable')
    })

    $(document).on('click','#upbutton-x,#upbutton-x-modify,.cancelBtn, ._btn_close_info_PC',function(){
        closePopup()
    })
////////////신규 회원등록 레이어 팝업 띄우기//////////////////////////////////////////////////////////////

		$("#btnCallCurrent").click(function(){
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
		});

		$("#btnCallFinished").click(function(){
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
		});

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

    $(document).on('click','td._tdname',function(){  //회원이름을 클릭했을때 새로운 팝업을 보여주며 정보를 채워준다.
        var userID = $(this).siblings('._id').attr('data-name');
        if($('body').width()<600){
            open_member_info_popup_mobile(userID)
        }else if($('body').width()>=600){
            open_member_info_popup_pc(userID)
        }
    });

    $(document).on('click','img._info_view',function(){
        var userID = $(this).parent('td').siblings('._id').text()
        if($('body').width()<600){
            open_member_info_popup_mobile(userID)
        }else if($('body').width()>=600){
            open_member_info_popup_pc(userID)
        }
    })

    $(document).on('click','img._info_delete',function(){
      var selectedUserId = $(this).parent('td').siblings('._id').text()
      $('#deleteMemberId').val(selectedUserId)
      $('.confirmPopup').fadeIn('fast');
      $('#shade').fadeIn('fast');
    })

    $('#infoMemberDelete').click(function(){
      $('.confirmPopup').fadeIn('fast');
      $('#shade').fadeIn('fast');
    });

    $(document).on('click','button._info_delete',function(){
      $('.confirmPopup').fadeIn('fast');
      $('#shade').fadeIn('fast');
    })


    $(document).on('click','img._info_modify',function(){
        var userID = $(this).parent('td').siblings('._id').text()
        if($('body').width()<600){
            open_member_info_popup_mobile(userID)
        }else if($('body').width()>=600){
            open_member_info_popup_pc(userID)
            modify_member_info_pc(userID)
            $('#memberInfoPopup_PC input').addClass('input_avaiable').attr('readonly',false);
            $('button._info_modify').text('완료').attr('data-type',"modify")
        }
    })

    $(document).on('click','button._info_modify',function(){
      var userID = $('#memberId_info_PC').text()
      modify_member_info_pc(userID)
      if($(this).attr('data-type')=="view"){
        $('#memberInfoPopup_PC input').addClass('input_avaiable').attr('readonly',false).attr('disabled',false);
        $(this).text('완료').attr('data-type',"modify");
      }else if($(this).attr('data-type')=="modify"){
        console.log('수정송신')
        send_member_modified_data_pc()
      }
    })

    $('.confirmYes').click(function(){
      $('.confirmPopup').fadeOut('fast');
      $('#shade').fadeOut('fast');
      deleteMemberAjax();
    });

    $('.confirmNo').click(function(){
      $('.confirmPopup').fadeOut('fast');
      $('#shade').fadeOut('fast');
    });

    function open_member_info_popup_pc(userID){
        if($('#currentMemberList').css('display') == "block"){
          var Data = DB
        }else if($('#finishedMemberList').css('display') == "block"){
           var Data = DBe
        }
        $('#memberInfoPopup_PC').fadeIn('fast')
        $('#shade3').fadeIn('fast');

        var npCountImg = ""
        if(Data[userID].npCount > 0){
          var npCountImg = '<span style="font-size:12px;"><img src="/static/user/res/member/icon-np-wait.png" style="width:18px;margin:0 0 5px 3px" title="수락 대기중"> (요청 수락 대기중)</span>'
        }
        if(Data[userID].rjCount > 0){
          var npCountImg = '<span style="font-size:12px;"><img src="/static/user/res/member/icon-x-red.png" style="width:11px;margin:0 0 5px 3px" title="수락 거절"> (수락 거절)</span>'
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

        if(Data[userID].email.length==0){
          var email = '-'
        }else{
          var email = Data[userID].email
        }
        var birth_year = Data[userID].birth.split(' ')[0]
        var birth_month = Data[userID].birth.split(' ')[1]
        var birth_date = Data[userID].birth.split(' ')[2]
        if(Data[userID].birth == "None"){
          var birth_year = "-"
        }
        $('#memberBirth_Year_info_PC').val(birth_year)
        $('#memberBirth_Month_info_PC').val(birth_month)
        $('#memberBirth_Date_info_PC').val(birth_date)
        if(Data[userID].birth != 'None'){
          $('#form_birth_modify').val(birth_year.replace(/년/gi,"-")+birth_month.replace(/월/gi,"-")+birth_date.replace(/일/gi,""))
        }else{
          $('#form_birth_modify').val('')
        }
        
        $('#deleteMemberId').val(userID);
        $('#memberName_info').val(Data[userID].name)
        $('#memberId').val(userID)
        $('#memberId_info_PC').text(userID);
        $('#memberPhone_info, #memberPhone_info_PC').val(Data[userID].phone);
        $('#memberRegCount_info_PC').val(Data[userID].regcount + yetReg)
        $('#memberRemainCount_info_PC').val(Data[userID].count + yet)
        $('#memberEmail_info, #memberEmail_info_PC').val(email)
        $('#memberStart_info_PC').val(Data[userID].start.replace(/년 |월 /gi,"-").replace(/일/gi,""))
        var end = Data[userID].end
        if(end == "9999년 12월 31일"){
          var end = "소진시까지"
        }else{
          var end = Data[userID].end.replace(/년 |월 /gi,"-").replace(/일/gi,"")
        }
        $('#memberEnd_info_PC').val(end)
        $('#comment_info, #memberComment_info_PC').val(Data[userID].contents)
        $('#memberInfoPopup_PC input').removeClass('input_avaiable').attr('readonly',true).attr('disabled',true);
        $('button._info_modify').text('수정').attr('data-type',"view")

        $('#inputError_info_PC').css('display','none')
    }

    function open_member_info_popup_mobile(userID){
        if($('#currentMemberList').css('display') == "block"){
          var Data = DB
        }else if($('#finishedMemberList').css('display') == "block"){
           var Data = DBe
        }
        birth_dropdown_set()
        $('#float_btn_wrap').fadeOut();
        $('#page-base').fadeOut('fast');
        $('#page-base-modifystyle').fadeIn('fast');
        $('#memberName_info').val(Data[userID].name)
        $('#memberId').val(userID);
        $('#deleteMemberId').val(userID);
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
        if(Data[userID].npCount > 0){
          var npCountImg = '<span style="font-size:12px;"><img src="/static/user/res/member/icon-np-wait.png" style="width:18px;margin:0 0 5px 3px" title="수락 대기중"> (요청 수락 대기중)</span>'
        }
        else if(Data[userID].npCount > 0){
          var npCountImg = '<span style="font-size:12px;"><img src="/static/user/res/member/icon-x-red.png" style="width:11px;margin:0 0 5px 3px" title="수락 거절"> (수락 거절)</span>'
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
        scrollToIndicator($('#page_managemember'));
        if($('body').width()<600){
          $('#page_managemember').hide();
        }

        $('#inputError_info').css('display','none')
        $('#fast_check').val('0')
        $('#form_birth').val('')
    }

    function modify_member_info_pc(userID){
        if($('#currentMemberList').css('display') == "block"){
            var Data = DB
        }else if($('#finishedMemberList').css('display') == "block"){
            var Data = DBe
        }
        $('#memberPhone_info_PC').keyup(function(){
          $('#memberPhone_info').val($(this).val())
        })

        $('#memberEmail_info_PC').keyup(function(){
          $('#memberEmail_info').val($(this).val())
        })
    }

    function send_member_modified_data_pc(){
        var $form = $('#member-add-form-modify');
        console.log($form.serialize())
           $.ajax({
              url:'/trainer/update_member_info/',
              type:'POST',
              data:$form.serialize(),
              dataType : 'html',

              beforeSend:function(){
                beforeSend()
              },

              //보내기후 팝업창 닫기
              complete:function(){
                
              },

              //통신성공시 처리
              success:function(data){
                  ajax_received_json_data(data);

                  if(messageArray.length>0){
                      completeSend()
                      $('#inputError_info_PC').fadeIn()
                      setTimeout(function(){$('#inputError_info_PC').fadeOut()},10000)
                      $('#errorMsg_info_PC p').text(messageArray)
                  }
                  else{
                      completeSend()
                      DataFormattingDict('ID');
                      DataFormatting('current');
                      DataFormatting('finished');
                      memberListSet('current','date','yes');
                      memberListSet('finished','date','yes');
                      $('#startR').attr('selected','selected')
                      open_member_info_popup_pc($('#memberId_info_PC').text())
                      console.log('success');
                  }
              },

              //통신 실패시 처리
              error:function(){
                alert("서버 통신 : error")
              },
          })
    }

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



//#####################페이지 들어오면 초기 시작 함수//#####################
DataFormattingDict('ID');
DataFormatting('current');
DataFormatting('finished');
memberListSet('current','name')
memberListSet('finished','name')
//#####################페이지 들어오면 초기 시작 함수//#####################


/*
function date_format_to_yyyymmdd(rawData){
  var replaced =  rawData.replace(/년 |월 |일|:|-| /gi,'_').split('_')
  var yyyy = replaced[0]
  var mm   = replaced[1]
  var dd   = replaced[2]
  if(mm.length<2){
    var mm = '0' + replaced[1]
  }
  if(dd.length<2){
    var dd = '0' + replaced[2]
  }
  return yyyy+mm+dd
}
*/

function count_format_to_nnnn(rawData){
  if(rawData == '0'){
    return rawData
  }
  var maxlen = String(rawData).length
  var repeat =  4 - Number(maxlen)
  var data = rawData
  for(var j=0; j<repeat; j++){
    var data = '0'+data
  }
  return data
}

function count_format_to_nnnn_Array(rawDataArray){
  var maxlen = String(Math.max.apply(null, rawDataArray)).length
  var result = []
  for(var i=0;i<rawDataArray.length ;i++){
    var repeat =  Number(maxlen)-Number(String(rawDataArray[i]).length)
    var data = rawDataArray[i]
    for(var j=0; j<repeat; j++){
      var data = '0'+data
    }
    result[i] = data
  }
  return result
}

function remove_front_zeros(rawData){
    var len = String(rawData).length;
    var raw = rawData
    var result;
    if(rawData =='0'){
      return rawData
    }else{
      for(var i=0; i<len; i++){
        if(raw.substr(i,1)!='0'){
          var result = raw.substr(i,len)
          return result
        }
      }
    }
}

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

      countListResult[i]=countFix+'/'+regcountFix+'/'+nameInfoArray[i]+'/'+idInfoArray[i]+'/'+phoneInfoArray[i]+'/'+contentInfoArray[i]+'/'+date+'/'+enddate+'/'+emailInfoArray[i]+'/'+npCountInfoArray[i]+'/'+rjCountInfoArray[i]+'/'+yetRegCountInfoArray[i]+'/'+yetCountInfoArray[i]
      nameListResult[i]=nameInfoArray[i]+'/'+idInfoArray[i]+'/'+phoneInfoArray[i]+'/'+contentInfoArray[i]+'/'+countOri+'/'+regcountOri+'/'+date+'/'+enddate+'/'+emailInfoArray[i]+'/'+npCountInfoArray[i]+'/'+rjCountInfoArray[i]+'/'+yetRegCountInfoArray[i]+'/'+yetCountInfoArray[i]
      dateListResult[i]=date+'/'+nameInfoArray[i]+'/'+idInfoArray[i]+'/'+phoneInfoArray[i]+'/'+contentInfoArray[i]+'/'+countOri+'/'+regcountOri+'/'+enddate+'/'+emailInfoArray[i]+'/'+npCountInfoArray[i]+'/'+rjCountInfoArray[i]+'/'+yetRegCountInfoArray[i]+'/'+yetCountInfoArray[i]
    }
}


function DataFormattingDict(Option){
    switch(Option){
      case 'name':
          var DBlength = nameArray.length;
          for(var i=0; i<DBlength;i++){
            DB[nameArray[i]] = {'id':idArray[i],
                                'email':emailArray[i],
                                'count':countArray[i],
                                'regcount':regCountArray[i], 
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
                                        'email':finishemailArray[j],
                                        'count':finishcountArray[j],
                                        'regcount':regCountArray[j],
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

      case 'ID':
          var DBlength = idArray.length;
          for(var i=0; i<DBlength;i++){
            DB[idArray[i]] = {'name':nameArray[i],
                              'email':emailArray[i],
                              'count':countArray[i],
                              'regcount':regCountArray[i], 
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
            DBe[finishIdArray[j]] = {'id':finishnameArray[j], 
                                    'email':finishemailArray[j],
                                    'count':finishcountArray[j],
                                    'regcount':regCountArray[j],
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

function memberListSet (type,option,Reverse){  //멤버 리스트 뿌리기
    
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
            console.log(countLists)
            var array = countLists[i].split('/');
            var email = array[8];
            var name = array[2];
            var id = array[3];
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
        if(phoneToEdit.substr(0,2)=="02"){
            var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
        }else{
            var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
        }

        var npCountImg = ""
        if(npCounts > 0){
          var npCountImg = '<img src="/static/user/res/member/icon-np-wait.png" title="수락 대기중" class="npCountImg_wait">'
        }
        if(rjCounts > 0){
          var npCountImg = '<img src="/static/user/res/member/icon-x-red.png" title="수락 거절" class="npCountImg_x">'
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
        var nametd = '<td class="_tdname" data-name="'+name+'">'+name+npCountImg+'</td>'
        var idtd = '<td class="_id" data-name="'+id+'">'+id+'</td>'
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

function scrollToIndicator(dom){
  var offset = dom.offset();
    $('body, html').animate({scrollTop : offset.top-180},0)
    //$('body, html').animate({scrollTop : offset.top},0)
}


//이 위까지는 회원정보 나열해서 보여주는데 필요한 함수
//여기서부터 회원등록 팝업에서 필요한 함수


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
                console.log(data)
                var jsondata = JSON.parse(data);
                if(jsondata.messageArray.length>0){
                  $('#inputError').fadeIn()
                  setTimeout(function(){$('#inputError').fadeOut()},10000)
                  $('#errorMsg p').text('검색된 아이디가 없습니다')
                }else{
                  id_search_memberLastName = jsondata.nameInfo;
                  id_search_memberFirstName = jsondata.nameInfo;
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
              $('#inputError').fadeIn()
              setTimeout(function(){$('#inputError').fadeOut()},10000)
              $('#errorMsg p').text('아이디를 입력해주세요')
            },
    })
})

function fill_member_info_by_ID_search(){
    $('#id_search_confirm').val('1');
    $('#memberLastName_add').val(id_search_memberLastName);
    $('#memberFirstName_add').val(id_search_memberFirstName);
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

$("#memberStart_info_PC, #memberEnd_info_PC").datepicker({
  minDate : 0,
  onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
      $("#memberEnd_info_PC").datepicker('option','minDate',$("#memberStart_info_PC").val())
      $("#memberStart_info_PC").datepicker('option','maxDate',$("#memberEnd_info_PC").val())
  }
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

$('#price1').click(function(){
  var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
  var priceInputValue = 1000000 + Number(priceInputValue);
  $('#lecturePrice_add').val(numberWithCommas(priceInputValue)).attr('readonly',true)
  $('#lecturePrice_add_value').val(priceInputValue)

})

$('#price2').click(function(){
  var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
  var priceInputValue = 500000 + Number(priceInputValue);
  $('#lecturePrice_add').val(numberWithCommas(priceInputValue)).attr('readonly',true)
  $('#lecturePrice_add_value').val(priceInputValue)
})

$('#price3').click(function(){
  var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
  var priceInputValue = 100000 + Number(priceInputValue);
  $('#lecturePrice_add').val(numberWithCommas(priceInputValue)).attr('readonly',true)
  $('#lecturePrice_add_value').val(priceInputValue)
})

$('#price4').click(function(){
  var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
  var priceInputValue = 50000 + Number(priceInputValue);
  $('#lecturePrice_add').val(numberWithCommas(priceInputValue)).attr('readonly',true)
  $('#lecturePrice_add_value').val(priceInputValue)
})

$('#price5').click(function(){
  var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
  var priceInputValue = 10000 + Number(priceInputValue);
  $('#lecturePrice_add').val(numberWithCommas(priceInputValue)).attr('readonly',true)
  $('#lecturePrice_add_value').val(priceInputValue)
})

$('#price6').click(function(){
  $('#lecturePrice_add').val("").attr('readonly',false)
  $('#lecturePrice_add_value').val(0)
})

$('#price1_2').click(function(){
  var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
  var priceInputValue = 1000000 + Number(priceInputValue);
  $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue)).attr('readonly',true)
  $('#lecturePrice_add_value_fast').val(priceInputValue)
})

$('#price2_2').click(function(){
  var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
  var priceInputValue = 500000 + Number(priceInputValue);
  $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue)).attr('readonly',true)
  $('#lecturePrice_add_value_fast').val(priceInputValue)
})

$('#price3_2').click(function(){
  var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
  var priceInputValue = 100000 + Number(priceInputValue);
  $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue)).attr('readonly',true)
  $('#lecturePrice_add_value_fast').val(priceInputValue)
})

$('#price4_2').click(function(){
  var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
  var priceInputValue = 50000 + Number(priceInputValue);
  $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue)).attr('readonly',true)
  $('#lecturePrice_add_value_fast').val(priceInputValue)
})

$('#price5_2').click(function(){
  var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
  var priceInputValue = 10000 + Number(priceInputValue);
  $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue)).attr('readonly',true)
  $('#lecturePrice_add_value_fast').val(priceInputValue)
})

$('#price6_2').click(function(){
  $('#lecturePrice_add_2').val("").attr('readonly',false)
  $('#lecturePrice_add_value_fast').val(0)
})

$('#lecturePrice_add, #lecturePrice_add_2').keyup(function(){
    var priceInputValue = $(this).val().replace(/,/g, "")
    $(this).val(numberWithCommas(priceInputValue))
})

//빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////


function check_dropdown_selected(){ //모든 입력란을 채웠을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
    //var emailInput = $("#memberEmail_add").parent("div");
    var lastnameInput = $("#memberLastName_add");
    var firstnameInput = $("#memberFirstName_add");
    var phoneInput = $("#memberPhone_add");
    var countInput = $("#memberCount_add");
    var startInput = $("#datepicker_add");
    var endInput = $("#datepicker2_add");
    var sexInput = $('#form_sex').val();

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

function limit_char(e){
    var limit =  /[~!@\#$%^&*\()\-=+_'|\:;\"\'\?.,/\\]/gi;
    var temp = $(e).val();
    if(limit.test(temp)){
      $(e).val(temp.replace(limit,""));
    };
};


$("#upbutton-check, .submitBtn").click(function(){ //회원 등록 폼 작성후 완료버튼 클릭
    var test = $('#id_search_confirm').val();
    var $form2 = $('#add-member-id-form');
    var url2 = '/accounts/register/';
     if(select_all_check==true){
         if(test==0){
             $.ajax({
                url:'/accounts/register/',
                type:'POST',
                data:$form2.serialize(),
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
                    //var jsondata = JSON.parse(data);
                    add_member_form_func();
                },

                //통신 실패시 처리
                error:function(){
                  alert("error")
                },
             })
        }
        else{
            add_member_form_func();
         }
     }else{
        scrollToIndicator($('#page_addmember'))
        $('#inputError').fadeIn()
        setTimeout(function(){$('#inputError').fadeOut()},10000)
        $('#errorMsg p').text('모든 필수 정보를 입력해주세요')
        //입력값 확인 메시지 출력 가능
     }
})


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
                    ajax_received_json_data(data);
                    if(messageArray.length>0){
                      $('html').css("cursor","auto")
                      $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                      scrollToIndicator($('#page_addmember'))
                      $('#inputError').fadeIn()
                      setTimeout(function(){$('#inputError').fadeOut()},10000)
                      $('#errorMsg p').text(messageArray)
                    }else{
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
                      console.log('ajax_send_for add ')
                    }
                },

                //통신 실패시 처리
                error:function(){
                  alert("error")
                },
             })
    }

$('#upbutton-modify, #infoMemberModify').click(function(){ //회원정보창에서 수정 눌렀을때
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
        console.log($form.serialize())
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
                    ajax_received_json_data(data);

                    if(messageArray.length>0){
                        $('html').css("cursor","auto")
                        $('#upbutton-modify img').attr('src','/static/user/res/ptadd/btn-complete.png')
                        scrollToIndicator($('#page_addmember'))
                        $('#inputError_info').fadeIn()
                        setTimeout(function(){$('#inputError_info').fadeOut()},10000)
                        $('#errorMsg_info p').text(messageArray)

                    }
                    else{
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
                alert("error")
              },
          })
        
        }else{
            scrollToIndicator($('#memberInfoPopup'))
            $('#inputError_info').fadeIn()
            setTimeout(function(){$('#inputError_info').fadeOut()},10000)
            $('#errorMsg_info p').text('모든 필수 정보를 입력해주세요')
            //입력값 확인 메시지 출력 가능
        }
    }
      
});


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
                ajax_received_json_data(data);
                if(messageArray.length>0){
                    $('html').css("cursor","auto")
                    $('#upbutton-modify img').attr('src','/static/user/res/ptadd/btn-complete.png')
                    scrollToIndicator($('#page_addmember'))
                    $('#inputError_info').fadeIn()
                    setTimeout(function(){$('#inputError_info').fadeOut()},10000)
                    $('#errorMsg_info p').text(messageArray)
                    console.log('ajax delete')
                }
                else{
                  console.log('ajax delete1111')
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
              console.log('server error')
            }
          })
}

function ajax_received_json_data(data){
    var jsondata = JSON.parse(data);
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

function beforeSend(){
  $('html').css("cursor","wait");
  $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
  $('.ajaxloadingPC').show();
}

function completeSend(){
  $('html').css("cursor","auto");
  $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
  $('.ajaxloadingPC').hide();
  $('#shade').hide();
  //$('#calendar').show();
  //alert('complete: 일정 정상 등록')
}

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
          $('.confirmPopup').fadeOut('fast');
          $('#shade3').fadeOut('fast');
    }else if($('#memberInfoPopup_PC').css('display')=="block"){             //회원정보팝업 PC버전 띄웠을때 x눌렀을 경우
          $('#memberInfoPopup_PC').fadeOut('fast')
          $('#shade3').fadeOut('fast');
    }else{                                          //회원등록팝업 띄웠을때 x눌렀을 경우
          if($('body').width()<600){
            $('#page_managemember').show();
            $('#float_btn_wrap').show();
            $('#float_btn').removeClass('rotate_btn');
          }
          $('#page_addmember').fadeOut('fast');
          $('#shade3').fadeOut('fast');
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

function numberWithCommas(x) { //천단위 콤마 찍기
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

});