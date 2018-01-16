$(document).ready(function(){
      $(".btn-group > .btn").click(function(){
   	  		$(this).addClass("active").siblings().removeClass("active");
		});

/*
      $(document).on('click',".dropdown-menu li a",function(){
      		//$(".dropdown .btn:first-child").text($(this).text());
      		//$(".dropdown .btn:first-child").val($(this).text());
  		    $(this).parents('ul').siblings('button').text($(this).text());
          $(this).parents('ul').siblings('button').val($(this).text());
          console.log($(this).val(), $(this).attr('value'))
       });
*/  
    $('.alignSelect li a').click(function(){
        $('.alignSelect button').text($(this).text())
    })

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
        $('html, body').css('overflow-y','hidden')
    })

    

    $('li').click(function(){
        if($('.dropdown').hasClass('open')){
          $('html, body').css('overflow-y','auto')
        }else{
          $('html, body').css('overflow-y','hidden')
        }
    })
 

////////////신규 회원등록 레이어 팝업 띄우기//////////////////////////////////////////////////////////////
    $('#float_btn').click(function(){
      $('#page_addmember').fadeIn('fast')
      $('#shade3').fadeIn('fast');
      $(this).fadeOut();
      $('#uptext2').text('신규 회원 등록')
      $('#page-base').fadeOut();
      $('#page-base-addstyle').fadeIn();
      scrollToIndicator($('#page_addmember'))
      if($('body').width()<600){
        $('#page_managemember').hide();
      }
    })

    $('#upbutton-x,.cancelBtn').click(function(){
      if($('body').width()<600){
        $('#page_managemember').show();
      }
      $('#page_addmember').fadeOut('fast');
      $('#shade3').fadeOut('fast');
      $('#float_btn').fadeIn('fast');
      $('#page-base').fadeIn();
      $('#page-base-addstyle').fadeOut();

      $('input,#memberDue_add_2').val("")
      $('#memberBirthMonthSelected button').val("").text("")
      $('#memberBirthDateSelected button').val("").text("")

      $('._due div.checked').removeClass('checked ptersCheckboxInner')
      $('._count div.checked').removeClass('checked ptersCheckboxInner')
      $('p,input,div,.pters_input_custom').removeClass("dropdown_selected")
      $('#memberSex div').removeClass('selectbox_checked')
      $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>"); 
      $('.submitBtn').removeClass('submitBtnActivated')
    })
////////////신규 회원등록 레이어 팝업 띄우기//////////////////////////////////////////////////////////////

		$("#btnCallCurrent").click(function(){
			var currentMemberList = $("#currentMemberList");
      var currentMemberNum = $('#currentMemberNum')
			var finishedMemberList = $("#finishedMemberList");
      var finishedMemberNum = $('#finishMemberNum')
			if(currentMemberList.css("display")=="none"){
				finishedMemberList.css("display","none");
        finishedMemberNum.css("display","none")
				currentMemberList.css("display","block");
        currentMemberNum.css("display","block");
			}
		})

		$("#btnCallFinished").click(function(){
			var currentMemberList = $("#currentMemberList");
      var currentMemberNum = $('#currentMemberNum')
      var finishedMemberList = $("#finishedMemberList");
      var finishedMemberNum = $('#finishMemberNum')
			if(finishedMemberList.css("display")=="none"){
				finishedMemberList.css("display","block");
        finishedMemberNum.css("display","block");
				currentMemberList.css("display","none");
        currentMemberNum.css("display","none");
			}
		})


		$('#name').click(function(){
        currentMemberListSet('name')
        finishMemberListSet('name')

		})

		$('#countH').click(function(){
        currentMemberListSet('count','yes')
          	
		})

    $('#countL').click(function(){
        currentMemberListSet('count')
    })

		$('#startR').click(function(){
        currentMemberListSet('date','yes')
        finishMemberListSet('date','yes')

		})

    $('#startP').click(function(){
        currentMemberListSet('date')
        finishMemberListSet('date')
    })


//#####################회원정보 팝업 //#####################

    $(document).on('click','._tdname',function(){  //회원이름을 클릭했을때 새로운 팝업을 보여주며 정보를 채워준다.
      var name = $(this).attr('data-name')
      console.log(name)
      $('#memberName').attr('placeholder',name)
      $('#memberPhone').attr('placeholder',DB[name].phone)
      $('#memberCount').attr('placeholder',DB[name].count)
      $('#memberEmail').attr('placeholder',DB[name].email)
      $('#datepicker').attr('placeholder',DB[name].start)
      $('#datepicker2').attr('placeholder',DB[name].end)
      $('#memberInfoPopup').show().animate({'top':'50px'});
      scrollToIndicator($('#page_managemember'));
      $('#shade3').fadeIn('fast');
    })

    $(document).on('click','._tdnamee',function(){  //종료 회원이름을 클릭했을때 새로운 팝업을 보여주며 정보를 채워준다.
      var name = $(this).attr('data-name')
      $('#memberName').attr('placeholder',name)
      $('#memberPhone').attr('placeholder',DBe[name].phone)
      $('#memberCount').attr('placeholder',DBe[name].count)
      $('#memberEmail').attr('placeholder',DBe[name].email)
      $('#datepicker').attr('placeholder',DBe[name].start)
      $('#datepicker2').attr('placeholder',DBe[name].end)
      $('#memberInfoPopup').show().animate({'top':'50px'});
      scrollToIndicator($('#page_managemember'));
      $('html,body').scrollTop();
      $('#shade3').fadeIn('fast');
    })

    $('#infoClose').click(function(){ //회원정보창에서 닫기 눌렀을때
      $('#memberInfoPopup').animate({'top':'-800px'}).hide('fast');
      $('#memberName').attr('readonly',true).val('')
      $('#memberPhone').attr('readonly',true).val('')
      $('#memberCount').attr('readonly',true).val('')
      $('#shade3').fadeOut('fast');
    })

    $('#infoEdit').click(function(){ //회원정보창에서 수정 눌렀을때
      $('#memberName').attr('readonly',false)
      $('#memberPhone').attr('readonly',false)
      $('#memberCount').attr('readonly',false)
    })
//#####################회원정보 팝업 //#####################


//#####################회원정보 도움말 팝업 //#####################
  $('th').mouseenter(function(){
      var LOCTOP = $(this).offset().top
      var LOCLEFT = $(this).offset().left
      
      if($('#currentMemberList').width()>=600){
          $('.instructPopup').fadeIn().css({'top':LOCTOP+40,'left':LOCLEFT})
      }
      
      if($(this).hasClass('_countnum')){
        $('.instructPopup').text('회원 순번')
      }else if($(this).hasClass('_tdname')){
        $('.instructPopup').text('등록한 회원님의 성함을 표시합니다.')
      }else if($(this).hasClass('_email')){
        $('.instructPopup').text('회원님의 ID를 표시합니다.')
      }else if($(this).hasClass('_regcount')){
        $('.instructPopup').text('등록횟수는 회원님께서 계약시 등록하신 횟수를 의미합니다.')
      }else if($(this).hasClass('_remaincount')){
        $('.instructPopup').text('남은횟수는 회원님의 등록횟수에서 현재까지 진행완료된 강의 횟수를 뺀 값을 의미합니다.')
      }else if($(this).hasClass('_startdate')){
        $('.instructPopup').text('회원님께서 등록하신 날짜')
      }else if($(this).hasClass('_finday')){
        $('.instructPopup').text('남은 횟수와 관계없이 회원님의 모든 횟수가 소멸되는 계약 종료날짜를 의미합니다.')
      }else if($(this).hasClass('_contact')){
        $('.instructPopup').text('회원님 연락처')
      }else if($(this).hasClass('_manage')){
        $('.instructPopup').text('회원 관리페이지에서는 회원님의 정보를 등록/수정/삭제가 가능합니다. 삭제시 복구가 불가능하오니 다시 한번 확인해주세요')
      }
  })

  /*
  $('.instructPopup').click(function(){
      $(this).fadeOut()
  })
  */
  
  $('#alignBox,.centeralign').mouseenter(function(){
    $('.instructPopup').fadeOut()
  })
  
//#####################회원정보 도움말 팝업 //#####################



//#####################페이지 들어오면 초기 DB 프로세싱 시작//#####################
      //날짜형식을 yyyymmdd 로 맞추기
      var countList = []
      var regcountList = [] //20180115
      var nameList = []
      var dateList = []
      var len = startArray.length; 
      for(i=0; i<len; i++){
        var dateFixArry = startArray[i].replace(/년 |월 |일|:| /gi,'_').split('_')
        if(dateFixArry[1].length==1 && dateFixArry[2].length==2){
          var date = dateFixArry[0]+'0'+dateFixArry[1]+dateFixArry[2] 
        }else if(dateFixArry[1].length==1 && dateFixArry[2].length==1){
          var date = dateFixArry[0]+'0'+dateFixArry[1]+'0'+dateFixArry[2]
        }else if(dateFixArry[1].length==2 && dateFixArry[2].length==1){
          var date = dateFixArry[0]+dateFixArry[1]+'0'+dateFixArry[2]
        }else{
          var date = dateFixArry[0]+dateFixArry[1]+dateFixArry[2]
        }

        var enddateFixArry = endArray[i].replace(/년 |월 |일|:| /gi,'_').split('_')
        if(enddateFixArry[1].length==1 && enddateFixArry[2].length==2){
          var enddate = enddateFixArry[0]+'0'+enddateFixArry[1]+enddateFixArry[2] 
        }else if(enddateFixArry[1].length==1 && enddateFixArry[2].length==1){
          var enddate = enddateFixArry[0]+'0'+enddateFixArry[1]+'0'+enddateFixArry[2]
        }else if(enddateFixArry[1].length==2 && enddateFixArry[2].length==1){
          var enddate = enddateFixArry[0]+enddateFixArry[1]+'0'+enddateFixArry[2]
        }else{
          var enddate = enddateFixArry[0]+enddateFixArry[1]+enddateFixArry[2]
        }
      //날짜형식을 yyyymmdd 로 맞추기

        var countOri = countArray[i]
        var len2 = countOri.length
        if(len2==1){
          var countFix = '000'+countOri
        }else if(len2==2){
          var countFix = '00'+countOri
        }else if(len2==3){
          var countFix = '0'+countOri
        }else if(len2==4){
          var countFix = countOri
        }
        var regcountOri = regCountArray[i]
        var len3 = regcountOri.length
        if(len3==1){
          var regcountFix = '000'+regcountOri
        }else if(len3==2){
          var regcountFix = '00'+regcountOri
        }else if(len3==3){
          var regcountFix = '0'+regcountOri
        }else if(len3==4){
          var regcountFix = regcountOri
        }
        countList[i]=countFix+'_'+regcountFix+'_'+nameArray[i]+'_'+phoneArray[i]+'_'+date+'_'+enddate+'/'+emailArray[i]
        nameList[i]=nameArray[i]+'_'+phoneArray[i]+'_'+countOri+'_'+regcountOri+'_'+date+'_'+enddate+'/'+emailArray[i]
        dateList[i]=date+'_'+nameArray[i]+'_'+phoneArray[i]+'_'+countOri+'_'+regcountOri+'_'+enddate+'/'+emailArray[i]
      }

      //날짜형식을 yyyymmdd 로 맞추기
      var finishcountList = []
      var finishregcountList = [] //20180115
      var finishnameList = []
      var finishdateList = []
      var len = finishstartArray.length; 
      for(i=0; i<len; i++){
        var dateFixArry = finishstartArray[i].replace(/년 |월 |일|:| /gi,'_').split('_')
        if(dateFixArry[1].length==1 && dateFixArry[2].length==2){
          var date = dateFixArry[0]+'0'+dateFixArry[1]+dateFixArry[2] 
        }else if(dateFixArry[1].length==1 && dateFixArry[2].length==1){
          var date = dateFixArry[0]+'0'+dateFixArry[1]+'0'+dateFixArry[2]
        }else if(dateFixArry[1].length==2 && dateFixArry[2].length==1){
          var date = dateFixArry[0]+dateFixArry[1]+'0'+dateFixArry[2]
        }else{
          var date = dateFixArry[0]+dateFixArry[1]+dateFixArry[2]
        }

        var enddateFixArry = finishendArray[i].replace(/년 |월 |일|:| /gi,'_').split('_')
        if(enddateFixArry[1].length==1 && enddateFixArry[2].length==2){
          var enddate = enddateFixArry[0]+'0'+enddateFixArry[1]+enddateFixArry[2] 
        }else if(enddateFixArry[1].length==1 && enddateFixArry[2].length==1){
          var enddate = enddateFixArry[0]+'0'+enddateFixArry[1]+'0'+enddateFixArry[2]
        }else if(enddateFixArry[1].length==2 && enddateFixArry[2].length==1){
          var enddate = enddateFixArry[0]+enddateFixArry[1]+'0'+enddateFixArry[2]
        }else{
          var enddate = enddateFixArry[0]+enddateFixArry[1]+enddateFixArry[2]
        }
      //날짜형식을 yyyymmdd 로 맞추기
        var countOri = finishcountArray[i]
        finishcountList[i]=finishcountArray[i]+'_'+finishnameArray[i]+'_'+finishphoneArray[i]+'_'+date+'_'+enddate+'/'+finishemailArray[i]
        finishnameList[i]=finishnameArray[i]+'_'+finishphoneArray[i]+'_'+finishcountArray[i]+'_'+date+'_'+enddate+'/'+finishemailArray[i]
        finishdateList[i]=date+'_'+finishnameArray[i]+'_'+finishphoneArray[i]+'_'+finishcountArray[i]+'_'+enddate+'/'+finishemailArray[i]
      }
      console.log(finishcountList)
//#####################페이지 들어오면 초기 DB 프로세싱 시작//#####################

//#####################페이지 들어오면 초기 시작 함수//#####################
      currentMemberListSet('name')
      finishMemberListSet('name')
//#####################페이지 들어오면 초기 시작 함수//#####################

      function currentMemberListSet (option,Reverse){  //멤버 리스트 뿌리기
        var currentTable = $('#currentMember');
        var tbodyStart = '<tbody>'
        var tbodyEnd = '</tbody>'
        var tbodyToAppend = $(tbodyStart)

        if(Reverse == 'yes'){
          var countLists =countList.sort().reverse()
          var nameLists = nameList.sort().reverse()
          var dateLists = dateList.sort().reverse()
        }else{
          var countLists =countList.sort()
          var nameLists = nameList.sort()
          var dateLists = dateList.sort()
        }

        switch(option){
          case 'count' :
            var len = countLists.length;
            var arrayResult = []
            for(var i=0; i<len; i++){
                var array = countLists[i].split('_');
                var arrayforemail = countLists[i].split('/')
                var email = arrayforemail[1];
                var name = array[2];
                var count = array[0];
                var regcount = array[1]
                var starts = array[4];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var ends = array[5];
                var end = ends.substr(0,4)+'.'+ends.substr(4,2)+'.'+ends.substr(6,2)
                var phoneToEdit = array[3].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }
                if(count.substr(0,3)=="000"){
                  var count = count.substr(3,1)
                }else if(count.substr(0,2)=="00"){
                  var count = count.substr(2,2)
                }else if(count.substr(0,1)=="0"){
                  var count = count.substr(1,3)
                }
                if(regcount.substr(0,3)=="000"){
                  var regcount = regcount.substr(3,1)
                }else if(regcount.substr(0,2)=="00"){
                  var regcount = regcount.substr(2,2)
                }else if(regcount.substr(0,1)=="0"){
                  var regcount = regcount.substr(1,3)
                }

                if(name.length>5){
                  var name = array[2].substr(0,5)+'..'
                }
                var phonenum = '<a class="phonenum" href="tel:'+phone+'">'+phone+'</a>'
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms">'+phonenum+'</a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>'     
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'
                var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon" title="삭제">'
                var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon" title="수정">'
                var pcinfoimage = '<img src="/static/user/res/member/icon-info.png" class="pcmanageicon" title="정보">'

                var nametd = '<td class="_tdname" data-name="'+array[2]+'">'+name+nameimage+'</td>'
                var emailtd = '<td class="_email">'+email+'</td>'
                var regcounttd = '<td class="_regcount">'+regcount+'</td>'
                var remaincounttd = '<td class="_remaincount">'+count+'</td>'
                var startdatetd = '<td class="_startdate">'+start+'</td>'
                var enddatetd = '<td class="_finday">'+end+'</td>'
                var mobiletd = '<td class="_contact">'+phoneimage+smsimage+'</td>'
                var pctd = '<td class="_manage">'+pcinfoimage+pceditimage+pcdeleteimage+'</td>'
                var scrolltd = '<td class="forscroll"></td>'

                var td = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+scrolltd+'</tr>'    
                arrayResult[i] = td
            }
            var resultToAppend = arrayResult.join("")
            var result = tbodyStart + resultToAppend + tbodyEnd
            $('#currentMember tbody').remove()
            currentTable.append(result)
          break;

          case 'name' :
            var len = nameLists.length;
            var arrayResult = []
            for(var i=0; i<len; i++){
                var array = nameLists[i].split('_');
                var arrayforemail = nameLists[i].split('/')
                var email = arrayforemail[1];
                var name = array[0];
                var count = array[2];
                var regcount = array[3]
                var starts = array[4];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var ends = array[5];
                var end = ends.substr(0,4)+'.'+ends.substr(4,2)+'.'+ends.substr(6,2)
                var phoneToEdit = array[1].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }

                if(name.length>5){
                  var name = array[0].substr(0,5)+'..'
                }
                var phonenum = '<a class="phonenum" href="tel:'+phone+'">'+phone+'</a>'
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms">'+phonenum+'</a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>' 
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'
                var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon" title="삭제">'
                var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon" title="수정">'
                var pcinfoimage = '<img src="/static/user/res/member/icon-info.png" class="pcmanageicon" title="정보">'

                var nametd = '<td class="_tdname" data-name="'+array[0]+'">'+name+nameimage+'</td>'
                var emailtd = '<td class="_email">'+email+'</td>'
                var regcounttd = '<td class="_regcount">'+regcount+'</td>'
                var remaincounttd = '<td class="_remaincount">'+count+'</td>'
                var startdatetd = '<td class="_startdate">'+start+'</td>'
                var enddatetd = '<td class="_finday">'+end+'</td>'
                var mobiletd = '<td class="_contact">'+phoneimage+smsimage+'</td>'
                var pctd = '<td class="_manage">'+pcinfoimage+pceditimage+pcdeleteimage+'</td>'
                var scrolltd = '<td class="forscroll"></td>'

                var td = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+scrolltd+'</tr>'   
                arrayResult[i] = td
            }
            var resultToAppend = arrayResult.join("")
            var result = tbodyStart + resultToAppend + tbodyEnd
            $('#currentMember tbody').remove()
            currentTable.append(result)
          break;

          case 'date' :
            var len = dateLists.length;
            var arrayResult = []
            for(var i=0; i<len; i++){
                var array = dateLists[i].split('_');
                var arrayforemail = dateLists[i].split('/')
                var email = arrayforemail[1];
                var name = array[1];
                var count = array[3];
                var regcount = array[4];
                var starts = array[0];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var ends = array[5];
                var end = ends.substr(0,4)+'.'+ends.substr(4,2)+'.'+ends.substr(6,2)
                var phoneToEdit = array[2].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }

                if(name.length>5){
                  var name = array[1].substr(0,5)+'..'
                }
                var phonenum = '<a class="phonenum" href="tel:'+phone+'">'+phone+'</a>'
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms">'+phonenum+'</a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>' 
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'
                var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon" title="삭제">'
                var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon" title="수정">'
                var pcinfoimage = '<img src="/static/user/res/member/icon-info.png" class="pcmanageicon" title="정보">'    
                
                var nametd = '<td class="_tdname" data-name="'+array[1]+'">'+name+nameimage+'</td>'
                var emailtd = '<td class="_email">'+email+'</td>'
                var regcounttd = '<td class="_regcount">'+regcount+'</td>'
                var remaincounttd = '<td class="_remaincount">'+count+'</td>'
                var startdatetd = '<td class="_startdate">'+start+'</td>'
                var enddatetd = '<td class="_finday">'+end+'</td>'
                var mobiletd = '<td class="_contact">'+phoneimage+smsimage+'</td>'
                var pctd = '<td class="_manage">'+pcinfoimage+pceditimage+pcdeleteimage+'</td>'
                var scrolltd = '<td class="forscroll"></td>'

                var td = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+scrolltd+'</tr>'     
                arrayResult[i] = td
            }
            var resultToAppend = arrayResult.join("")
            var result = tbodyStart + resultToAppend + tbodyEnd
            $('#currentMember tbody').remove()
            currentTable.append(result)
          break;
        }
      }  

      function finishMemberListSet (option,Reverse){  //멤버 리스트 뿌리기
        var currentTable = $('#finishedMember');
        var tbodyStart = '<tbody>'
        var tbodyEnd = '</tbody>'
        var tbodyToAppend = $(tbodyStart)

        if(Reverse == 'yes'){
          var countLists = finishcountList.sort().reverse()
          var nameLists = finishnameList.sort().reverse()
          var dateLists = finishdateList.sort().reverse()
        }else{
          var countLists = finishcountList
          var nameLists = finishnameList.sort()
          var dateLists = finishdateList.sort()
        }

        switch(option){
          case 'count' :
            var len = countLists.length;
            var arrayResult = []
            for(var i=0; i<len; i++){
                var array = countLists[i].split('_');
                var arrayforemail = countLists[i].split('/')
                var email = arrayforemail[1];
                var name = array[1];
                var count = array[0];
                var starts = array[3];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var ends = array[4];
                var end = ends.substr(0,4)+'.'+ends.substr(4,2)+'.'+ends.substr(6,2)
                var phoneToEdit = array[2].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }

                if(name.length>5){
                  var name = array[1].substr(0,5)+'..'
                }
                var phonenum = '<a class="phonenum" href="tel:'+phone+'">'+phone+'</a>'
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms">'+phonenum+'</a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>' 
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'
                var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon" title="삭제">'
                var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon" title="수정">'
                var pcinfoimage = '<img src="/static/user/res/member/icon-info.png" class="pcmanageicon" title="정보">'
                
                var nametd = '<td class="_tdname" data-name="'+array[1]+'">'+name+nameimage+'</td>'
                var emailtd = '<td class="_email">'+email+'</td>'
                var regcounttd = '<td class="_regcount">'+count+'</td>'
                var remaincounttd = '<td class="_remaincount">'+count+'</td>'
                var startdatetd = '<td class="_startdate">'+start+'</td>'
                var enddatetd = '<td class="_finday">'+end+'</td>'
                var mobiletd = '<td class="_contact">'+phoneimage+smsimage+'</td>'
                var pctd = '<td class="_manage">'+pcinfoimage+pceditimage+pcdeleteimage+'</td>'
                var scrolltd = '<td class="forscroll"></td>'

                var td = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+scrolltd+'</tr>'     
                arrayResult[i] = td
            }
            var resultToAppend = arrayResult.join("")
            var result = tbodyStart + resultToAppend + tbodyEnd
            $('#finishedMember tbody').remove()
            currentTable.append(result)
          break;

          case 'name' :
            var len = nameLists.length;
            var arrayResult = []
            for(var i=0; i<len; i++){
                var array = nameLists[i].split('_');
                var arrayforemail = nameLists[i].split('/')
                var email = arrayforemail[1];
                var name = array[0];
                var count = array[2];
                var starts = array[3];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var ends = array[4];
                var end = ends.substr(0,4)+'.'+ends.substr(4,2)+'.'+ends.substr(6,2)
                var phoneToEdit = array[1].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }

                if(name.length>5){
                  var name = array[0].substr(0,5)+'..'
                }
                var phonenum = '<a class="phonenum" href="tel:'+phone+'">'+phone+'</a>'
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms">'+phonenum+'</a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>'  
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'
                var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon" title="삭제">'
                var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon" title="수정">'
                var pcinfoimage = '<img src="/static/user/res/member/icon-info.png" class="pcmanageicon" title="정보">'    
                
                var nametd = '<td class="_tdname" data-name="'+array[0]+'">'+name+nameimage+'</td>'
                var emailtd = '<td class="_email">'+email+'</td>'
                var regcounttd = '<td class="_regcount">'+count+'</td>'
                var remaincounttd = '<td class="_remaincount">'+count+'</td>'
                var startdatetd = '<td class="_startdate">'+start+'</td>'
                var enddatetd = '<td class="_finday">'+end+'</td>'
                var mobiletd = '<td class="_contact">'+phoneimage+smsimage+'</td>'
                var pctd = '<td class="_manage">'+pcinfoimage+pceditimage+pcdeleteimage+'</td>'
                var scrolltd = '<td class="forscroll"></td>'

                var td = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+scrolltd+'</tr>'         
                arrayResult[i] = td
            }
            var resultToAppend = arrayResult.join("")
            var result = tbodyStart + resultToAppend + tbodyEnd
            $('#finishedMember tbody').remove()
            currentTable.append(result)
          break;

          case 'date' :
            var len = dateLists.length;
            var arrayResult = []
            for(var i=0; i<len; i++){
                var array = dateLists[i].split('_');
                var arrayforemail = dateLists[i].split('/')
                var email = arrayforemail[1];
                var name = array[1];
                var count = array[3];
                var starts = array[0];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var ends = array[4];
                var end = ends.substr(0,4)+'.'+ends.substr(4,2)+'.'+ends.substr(6,2)
                var phoneToEdit = array[2].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }

                if(name.length>5){
                  var name = array[1].substr(0,5)+'..'
                }
                var phonenum = '<a class="phonenum" href="tel:'+phone+'">'+phone+'</a>'
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms">'+phonenum+'</a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>' 
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">' 
                var pcdeleteimage = '<img src="/static/user/res/member/icon-delete.png" class="pcmanageicon" title="삭제">'
                var pceditimage = '<img src="/static/user/res/member/icon-edit.png" class="pcmanageicon" title="수정">'
                var pcinfoimage = '<img src="/static/user/res/member/icon-info.png" class="pcmanageicon" title="정보">'    

                var nametd = '<td class="_tdname" data-name="'+array[1]+'">'+name+nameimage+'</td>'
                var emailtd = '<td class="_email">'+email+'</td>'
                var regcounttd = '<td class="_regcount">'+count+'</td>'
                var remaincounttd = '<td class="_remaincount">'+count+'</td>'
                var startdatetd = '<td class="_startdate">'+start+'</td>'
                var enddatetd = '<td class="_finday">'+end+'</td>'
                var mobiletd = '<td class="_contact">'+phoneimage+smsimage+'</td>'
                var pctd = '<td class="_manage">'+pcinfoimage+pceditimage+pcdeleteimage+'</td>'
                var scrolltd = '<td class="forscroll"></td>'

                var td = '<tr class="memberline"><td class="_countnum">'+(i+1)+'</td>'+nametd+emailtd+regcounttd+remaincounttd+startdatetd+enddatetd+mobiletd+pctd+scrolltd+'</tr>'       
                arrayResult[i] = td
            }
            var resultToAppend = arrayResult.join("")
            var result = tbodyStart + resultToAppend + tbodyEnd
            $('#finishedMember tbody').remove()
            currentTable.append(result)
          break;
        }
      }  

      function scrollToIndicator(dom){
        var offset = dom.offset();
        console.log(offset)
          $('body, html').animate({scrollTop : offset.top-180},0)
      }

});