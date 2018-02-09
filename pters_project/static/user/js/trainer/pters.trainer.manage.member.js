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
      if($('#memberInfoPopup').css('display')=='block'){
        $('#page-base').fadeIn();
        $('#page-base-addstyle').fadeOut();
        $('#memberInfoPopup').fadeOut('fast')
        $('#memberName').attr('readonly',true)
        $('#memberPhone').attr('readonly',true)
        $('#memberCount').attr('readonly',true)
        $('#memberSex div').removeClass('selectbox_checked')
        $('.dropdown_selected').removeClass("dropdown_selected")
        $('.confirmPopup').fadeOut()
        $('#shade').fadeOut()
      }else{
        if($('body').width()<600){
        $('#page_managemember').show();
        }
        $('#page_addmember').fadeOut('fast');
        $('#shade3').fadeOut('fast');
        $('#float_btn').fadeIn('fast');
        $('#page-base').fadeIn();
        $('#page-base-addstyle').fadeOut();

        $('#page_addmember input,#memberDue_add_2').val("")
        $('#memberBirthMonthSelected button').val("").text("")
        $('#memberBirthDateSelected button').val("").text("")

        $('._due div.checked').removeClass('checked ptersCheckboxInner')
        $('._count div.checked').removeClass('checked ptersCheckboxInner')
        $('p,#page_addmember input,div,.pters_input_custom').removeClass("dropdown_selected")
        $('#memberSex div').removeClass('selectbox_checked')
        $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>"); 
        $('.submitBtn').removeClass('submitBtnActivated')
      }
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
        $('.alignSelect button').attr('data-align','name')
		})

		$('#countH').click(function(){
        currentMemberListSet('count','yes')
        $('.alignSelect button').attr('data-align','countH')
		})

    $('#countL').click(function(){
        currentMemberListSet('count')
        $('.alignSelect button').attr('data-align','countL')
    })

		$('#startR').click(function(){
        currentMemberListSet('date','yes')
        finishMemberListSet('date','yes')
        $('.alignSelect button').attr('data-align','startR')
		})

    $('#startP').click(function(){
        currentMemberListSet('date')
        finishMemberListSet('date')
        $('.alignSelect button').attr('data-align','startP')
    })


//#####################회원정보 팝업 //#####################

    $(document).on('click','td._tdname',function(){  //회원이름을 클릭했을때 새로운 팝업을 보여주며 정보를 채워준다.
      $('#uptext2').text('회원 정보')
      $('#page-base').fadeOut();
      $('#page-base-addstyle').fadeIn();
      var name = $(this).attr('data-name')
      console.log(name)
      $('#memberName').attr('value',name)
      $('#memberPhone').attr('value',DB[name].phone).text(DB[name].phone)
      $('#memberCount').attr('value',DB[name].count)
      $('#memberEmail').attr('value',DB[name].email)
      $('#datepicker').attr('value',DB[name].start)
      $('#datepicker2').attr('value',DB[name].end)
      $('#memberInfoPopup').fadeIn();
      scrollToIndicator($('#page_managemember'));
    })

    $(document).on('click','td._tdnamee',function(){  //종료 회원이름을 클릭했을때 새로운 팝업을 보여주며 정보를 채워준다.
      $('#uptext2').text('회원 정보')
      $('#page-base').fadeOut();
      $('#page-base-addstyle').fadeIn();
      var name = $(this).attr('data-name')
      $('#memberName').attr('value',name)
      $('#memberPhone').attr('value',DBe[name].phone)
      $('#memberCount').attr('value',DBe[name].count)
      $('#memberEmail').attr('value',DBe[name].email)
      $('#datepicker').attr('value',DBe[name].start)
      $('#datepicker2').attr('value',DBe[name].end)
      $('#memberInfoPopup').fadeIn()
      scrollToIndicator($('#page_managemember'));
      $('html,body').scrollTop();
    })

    $("#datepicker_info").datepicker({
        minDate : 0,
        onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
          $("#dateSelector p").addClass("dropdown_selected");
          check_dropdown_selected();
        }
    });

    $("#datepicker2_info").datepicker({
        minDate : 0,
        onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
          $("#dateSelector2 p").addClass("dropdown_selected");
          check_dropdown_selected();
        }
    });

    $('#infoMemberDelete').click(function(){
      $('.confirmPopup').fadeIn()
      $('#shade').fadeIn()
    })

    $('.confirmYes').click(function(){
      $('.confirmPopup').fadeOut()
      $('#shade').fadeOut()
    })

    $('.confirmNo').click(function(){
      $('.confirmPopup').fadeOut()
      $('#shade').fadeOut()
    })


    $('#infoMemberEdit').click(function(){ //회원정보창에서 수정 눌렀을때
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

 
  $('#alignBox,.centeralign').mouseenter(function(){
    $('.instructPopup').fadeOut()
  })
  
//#####################회원정보 도움말 팝업 //#####################



//#####################페이지 들어오면 초기 시작 함수//#####################
DataFormattingDict()
DataFormatting()
currentMemberListSet('name')
finishMemberListSet('name')
//#####################페이지 들어오면 초기 시작 함수//#####################
function DataFormatting(){
    countList = []
    regcountList = [] //20180115
    nameList = []
    dateList = []
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
    finishcountList = []
    finishregcountList = [] //20180115
    finishnameList = []
    finishdateList = []
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
}

function DataFormattingDict(){
    var DBlength = nameArray.length;
    for(var i=0; i<DBlength;i++){
      DB[nameArray[i]] = {'email':emailArray[i],'count':countArray[i],'phone':phoneArray[i],'start':startArray[i],'end':endArray[i]};
    }
    var DBendlength = finishnameArray.length;
    for(var j=0; j<DBendlength;j++){
      DBe[finishnameArray[j]] = {'email':finishemailArray[j],'count':finishcountArray[j],'phone':finishphoneArray[j],'start':finishstartArray[j],'end':finishendArray[j]}; 
    }
    $('#currentMemberNum').text("진행중 회원수 : "+DBlength)
    $('#finishMemberNum').text("종료된 회원수 : "+DBendlength)
}

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


//이 위까지는 회원정보 나열해서 보여주는데 필요한 함수
//여기서부터 회원등록 팝업에서 필요한 함수


var select_all_check = false;
$('#inputError').fadeIn('slow')


$("#datepicker_add").datepicker({
  minDate : 0,
  onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
    $("#dateSelector p").addClass("dropdown_selected");
    check_dropdown_selected();
  }
});

$("#datepicker2_add").datepicker({
  minDate : 0,
  onSelect:function(curDate,inst){ //달력날짜 선택시 하단에 핑크선
    $("#dateSelector2 p").addClass("dropdown_selected");
    check_dropdown_selected();
  }
});


 $("#datepicker_fast").datepicker({
  minDate : 0,
  onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
    $("#dateSelector3 p").addClass("dropdown_selected");

    autoDateInput();
    check_dropdown_selected();
  }
});


$("#memberEmail_add").keyup(function(){  //이메일 입력시 하단에 핑크선
  if($(this).val().length>8){
    $(this).parent("div").addClass("dropdown_selected")
    check_dropdown_selected();
  }else{
    $(this).parent("div").removeClass("dropdown_selected")
    check_dropdown_selected();
  }
})

$("#memberName_add").keyup(function(){  //이름 입력시 하단에 핑크선
  if($(this).val().length>1){
    limit_char(this);
    $(this).parent("div").addClass("dropdown_selected")
    check_dropdown_selected();
  }else{
    limit_char(this);
    $(this).parent("div").removeClass("dropdown_selected")
    check_dropdown_selected();
  }
})

$('#memberBirthYear').keyup(function(){
  var input = $(this).val()
  if(input.length==4 && input>=1900 && input<=2200){
    $(this).addClass("dropdown_selected")
    birthdayInput()
  }else{
    $(this).removeClass("dropdown_selected")
  }
})

$('#memberBirthMonth li a').click(function(){ //생년월일 "월" 선택했을때 핑크선 + "일" 드롭다운 채워주기
   $(this).parents('ul').siblings('button').text($(this).text());
   $(this).parents('ul').siblings('button').val($(this).attr('value'));
   $('#memberBirthMonthSelected').addClass("dropdown_selected")
   var lastDay = [31,29,31,30,31,30,31,31,30,31,30,31]
   var length = lastDay[Number($(this).attr('value'))-1]
   var datesList = []
   for(i=0; i<=length-1; i++){
      datesList[i] = '<li><a value="'+(i+1)+'">'+(i+1)+' 일</a></li>'
   }
   var dates = datesList.join("")
   $('#memberBirthDate').html(dates)
   birthdayInput()
})

$(document).on('click','#memberBirthDate li a',function(){
   $(this).parents('ul').siblings('button').text($(this).text());
   $(this).parents('ul').siblings('button').val($(this).attr('value'));
   birthdayInput()
})

$(document).on('click','#memberBirthDate li a',function(){
  $('#memberBirthDateSelected').addClass("dropdown_selected")
})

$('#memberSex .selectboxopt').click(function(){
  $(this).addClass('selectbox_checked')
  $(this).siblings().removeClass('selectbox_checked')
  $('#form_sex').attr('value',$(this).attr('value'))
})


$("#memberPhone_add").keyup(function(){  //전화번호 입력시 하단에 핑크선
  if($(this).val().length>8){
    limit_char(this);
    $(this).parent("div").addClass("dropdown_selected")
    check_dropdown_selected();
  }else{
    limit_char(this);
    $(this).parent("div").removeClass("dropdown_selected")
    check_dropdown_selected();
  }
})

$("#memberCount_add").keyup(function(){  //남은횟수 입력시 하단에 핑크선
  if($(this).val().length>0){
    limit_char(this);
    $(this).parent("div").addClass("dropdown_selected")
    check_dropdown_selected();
  }else{
    limit_char(this);
    $(this).parent("div").removeClass("dropdown_selected")
    check_dropdown_selected();
  }
})

function birthdayInput(){
  var yy = $('#memberBirthYear').val()
  var mm = $('#memberBirthMonth').siblings('button').val()
  var dd = $('#memberBirthDate').siblings('button').val()
  $('#form_birth').val(yy+'-'+mm+'-'+dd)
}


//빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////
$('#btnCallSimple').click(function(){
  $('#manualReg').hide();
  $('#simpleReg').fadeIn('fast');
  $(this).addClass('selectbox_checked')
  $('#btnCallManual').removeClass('selectbox_checked')
  $('p').removeClass("dropdown_selected")
  $('#memberCount_add_fast').parent('div').removeClass('dropdown_selected')
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
  $('#lecturePrice_add').val(numberWithCommas(priceInputValue))
  $('#lecturePrice_add_value').val(priceInputValue)

})

$('#price2').click(function(){
  var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
  var priceInputValue = 500000 + Number(priceInputValue);
  $('#lecturePrice_add').val(numberWithCommas(priceInputValue))
  $('#lecturePrice_add_value').val(priceInputValue)
})

$('#price3').click(function(){
  var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
  var priceInputValue = 100000 + Number(priceInputValue);
  $('#lecturePrice_add').val(numberWithCommas(priceInputValue))
  $('#lecturePrice_add_value').val(priceInputValue)
})

$('#price4').click(function(){
  var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
  var priceInputValue = 50000 + Number(priceInputValue);
  $('#lecturePrice_add').val(numberWithCommas(priceInputValue))
  $('#lecturePrice_add_value').val(priceInputValue)
})

$('#price5').click(function(){
  var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
  var priceInputValue = 10000 + Number(priceInputValue);
  $('#lecturePrice_add').val(numberWithCommas(priceInputValue))
  $('#lecturePrice_add_value').val(priceInputValue)
})

$('#price6').click(function(){
  $('#lecturePrice_add').val("")
  $('#lecturePrice_add_value').val(0)
})

$('#price1_2').click(function(){
  var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
  var priceInputValue = 1000000 + Number(priceInputValue);
  $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue))
  $('#lecturePrice_add_value_fast').val(priceInputValue)
})

$('#price2_2').click(function(){
  var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
  var priceInputValue = 500000 + Number(priceInputValue);
  $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue))
  $('#lecturePrice_add_value_fast').val(priceInputValue)
})

$('#price3_2').click(function(){
  var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
  var priceInputValue = 100000 + Number(priceInputValue);
  $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue))
  $('#lecturePrice_add_value_fast').val(priceInputValue)
})

$('#price4_2').click(function(){
  var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
  var priceInputValue = 50000 + Number(priceInputValue);
  $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue))
  $('#lecturePrice_add_value_fast').val(priceInputValue)
})

$('#price5_2').click(function(){
  var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
  var priceInputValue = 10000 + Number(priceInputValue);
  $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue))
  $('#lecturePrice_add_value_fast').val(priceInputValue)
})

$('#price6_2').click(function(){
  $('#lecturePrice_add_2').val("")
  $('#lecturePrice_add_value_fast').val(0)
})

//빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////


function check_dropdown_selected(){ //모든 입력란을 채웠을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
    //var emailInput = $("#memberEmail_add").parent("div");
    var nameInput = $("#memberName_add").parent("div");
    var phoneInput = $("#memberPhone_add").parent("div");
    var countInput = $("#memberCount_add").parent("div");
    var startInput = $("#datepicker_add").parent("p");
    var endInput = $("#datepicker2_add").parent("p");

    var countInput_fast = $("#memberCount_add_fast");
    var dateInput_fast = $("#datepicker_fast").parent("p");

    var fast = $('#fast_check').val()

    if(fast=='1'){
        //(emailInput).hasClass("dropdown_selected")==true &&
        if((nameInput).hasClass("dropdown_selected")==true && (phoneInput).hasClass("dropdown_selected")==true &&(countInput).hasClass("dropdown_selected")==true&&(startInput).hasClass("dropdown_selected")==true&&(endInput).hasClass("dropdown_selected")==true){
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
        //(emailInput).hasClass("dropdown_selected")==true &&
        if((nameInput).hasClass("dropdown_selected")==true && (phoneInput).hasClass("dropdown_selected")==true &&(countInput_fast).hasClass("dropdown_selected")==true&&(dateInput_fast).hasClass("dropdown_selected")==true){
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
        $('#memberDue_add_2').parent('div').addClass("dropdown_selected")
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

$("#upbutton-check,.submitBtn").click(function(){
    var $form = $('#member-add-form-new');
     if(select_all_check==true){
        console.log('ajax')
       
             //ajax 회원정보 입력된 데이터 송신
             
             $.ajax({
                url:'/trainer/member_registration/',
                type:'POST',
                data:$form.serialize(),

                beforeSend:function(){
                  $('html').css("cursor","wait")
                  $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif')
                },

                //보내기후 팝업창 닫기
                complete:function(){
                  closePopup()
                   if($('body').width()<600){
                      $('#page_managemember').show();
                    }
                    $('html').css("cursor","auto")
                    $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                  //alert('complete: 회원 정상 등록')
                  },

                //통신성공시 처리
                success:function(){
                    ajaxMemberData();
                  console.log('success')
                  },

                //통신 실패시 처리
                error:function(){
                  alert("error: 이미 등록된 회원인지 확인")
                },
             })
        
     }else{
        $('#inputError').fadeIn('slow')
        //입력값 확인 메시지 출력 가능
        console.log('submit ng')
     }
})

function ajaxMemberData(){

          $.ajax({
            url: '/trainer/member_manage_ajax',
            dataType : 'html',

            beforeSend:function(){
                beforeSend();
            },

            success:function(data){
              var jsondata = JSON.parse(data);
              nameArray =[];
              phoneArray = [];
              countArray = [];
              startArray = [];
              modifyDateArray = [];
              emailArray = [];
              endArray = [];
              regCountArray = [];
              availCountArray = [];

              finishnameArray =[];
              finishphoneArray = [];
              finishcountArray = [];
              finishstartArray = [];
              finishmodifyDateArray = [];
              finishemailArray = [];
              finishendArray = [];

                //처리 필요 - hk.kim 180110
              finishRegCountArray = [];
              finishAvailCountArray = [];

              nameArray =jsondata.nameArray;
              phoneArray = jsondata.phoneArray;
              countArray = jsondata.countArray;
              startArray = jsondata.startArray;
              modifyDateArray = jsondata.modifyDateArray;
              emailArray = jsondata.emailArray;
              endArray = jsondata.endArray;
              regCountArray = jsondata.regCountArray;
              availCountArray = jsondata.availCountArray;

              finishnameArray = jsondata.finishnameArray;
              finishphoneArray = jsondata.finishphoneArray;
              finishcountArray = jsondata.finishcountArray;
              finishstartArray = jsondata.finishstartArray;
              finishmodifyDateArray = jsondata.finishmodifyDateArray;
              finishemailArray = jsondata.finishemailArray;
              finishendArray = jsondata.finishendArray;

                //처리 필요 - hk.kim 180110
              finishRegCountArray = jsondata.finishRegCountArray;
              finishAvailCountArray = jsondata.finishAvailCountArray;

              DataFormattingDict()
              DataFormatting()
              currentMemberListSet('name')
              finishMemberListSet('name')
            },

            complete:function(){
              completeSend();
            },

            error:function(){
              console.log('server error')
            }
          })
}

function beforeSend(){
  $('html').css("cursor","wait");
  $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
  $('.ajaxloadingPC').show();
  $('#shade').css({'z-index':'200'});
}

function completeSend(){
  $('html').css("cursor","auto");
  $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
  $('.ajaxloadingPC').hide();
  $('#shade').css({'z-index':'100'});
  $('#shade').hide();
  //$('#calendar').show();
  //alert('complete: 일정 정상 등록')
}

function closePopup(){
  $('#page_addmember').fadeOut('fast');
  $('#shade3').fadeOut('fast');
  $('#float_btn').fadeIn('fast');
  $('#page-base').fadeIn();
  $('#page-base-addstyle').fadeOut();

  $('input,#memberDue_add_2').val("")
  $('._due div.checked').removeClass('checked ptersCheckboxInner')
  $('._count div.checked').removeClass('checked ptersCheckboxInner')
  $('p,.pters_input_custom').removeClass("dropdown_selected")
  $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>"); 
  $('.submitBtn').removeClass('submitBtnActivated')
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