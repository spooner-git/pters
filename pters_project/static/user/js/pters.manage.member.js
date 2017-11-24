$(document).ready(function(){
      $(".btn-group > .btn").click(function(){
   	  		$(this).addClass("active").siblings().removeClass("active");
		});

      $(".dropdown-menu li a").click(function(){
      		$(".dropdown .btn:first-child").text($(this).text());
      		$(".dropdown .btn:first-child").val($(this).text());

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


    $('#float_btn').click(function(){
      $('#page_addmember').fadeIn('fast')
      $('#shade3').fadeIn('fast');
      $(this).fadeOut();
      $('#uptext2').text('신규 회원 등록')
      $('#page-base').fadeOut();
      $('#page-base-addstyle').fadeIn();
      scrollToIndicator($('#memberEmail_add'))

    })

    $('#upbutton-x').click(function(){
      $('#page_addmember').fadeOut('fast');
      $('#shade3').fadeOut('fast');
      $('#float_btn').fadeIn('fast');
      $('#page-base').fadeIn();
      $('#page-base-addstyle').fadeOut();

      $('input').val("")
      $('p,.pters_input_custom').removeClass("dropdown_selected")
      $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
     
    })

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
      $('#memberInfoPopup').show().animate({'top':'0px'});
      $('#shade').show()
      $('body').scrollTop();
    })

    $(document).on('click','._tdnamee',function(){  //종료 회원이름을 클릭했을때 새로운 팝업을 보여주며 정보를 채워준다.
      var name = $(this).attr('data-name')
      $('#memberName').attr('placeholder',name)
      $('#memberPhone').attr('placeholder',DBe[name].phone)
      $('#memberCount').attr('placeholder',DBe[name].count)
      $('#memberEmail').attr('placeholder',DBe[name].email)
      $('#datepicker').attr('placeholder',DBe[name].start)
      $('#datepicker2').attr('placeholder',DBe[name].end)
      $('#memberInfoPopup').show().animate({'top':'0px'});
      $('#shade').show()
      $('body').scrollTop();
    })

    $('#infoClose').click(function(){ //회원정보창에서 닫기 눌렀을때
      $('#memberInfoPopup').animate({'top':'-800px'}).hide('fast');
      $('#shade').hide()
      $('#memberName').attr('readonly',true).val('')
      $('#memberPhone').attr('readonly',true).val('')
      $('#memberCount').attr('readonly',true).val('')
    })

    $('#infoEdit').click(function(){ //회원정보창에서 수정 눌렀을때
      $('#memberName').attr('readonly',false)
      $('#memberPhone').attr('readonly',false)
      $('#memberCount').attr('readonly',false)
    })
//#####################회원정보 팝업 //#####################


//#####################페이지 들어오면 초기 DB 프로세싱 시작//#####################
      //날짜형식을 yyyymmdd 로 맞추기
      var countList = []
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
        countList[i]=countFix+'_'+nameArray[i]+'_'+phoneArray[i]+'_'+date
        nameList[i]=nameArray[i]+'_'+phoneArray[i]+'_'+countOri+'_'+date
        dateList[i]=date+'_'+nameArray[i]+'_'+phoneArray[i]+'_'+countOri
      }

      //날짜형식을 yyyymmdd 로 맞추기
      var finishcountList = []
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
      //날짜형식을 yyyymmdd 로 맞추기
        var countOri = finishcountArray[i]
        
        finishcountList[i]=countFix+'_'+finishnameArray[i]+'_'+finishphoneArray[i]+'_'+date
        finishnameList[i]=finishnameArray[i]+'_'+finishphoneArray[i]+'_'+countOri+'_'+date
        finishdateList[i]=date+'_'+finishnameArray[i]+'_'+finishphoneArray[i]+'_'+countOri
      }
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
                var name = array[1];
                var count = array[0];
                var starts = array[3];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var phoneToEdit = array[2].replace(/-| |/gi,"");
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

                if(name.length>5){
                  var name = array[1].substr(0,5)+'..'
                }
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms"></a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>'     
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'
                var td = '<tr><td class="_tdname" data-name="'+array[1]+'">'+name+nameimage+'</td><td>'+count+'</td><td>'+start+'</td><td>'+phoneimage+smsimage+'</td></tr>'    
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
                var name = array[0];
                var count = array[2];
                var starts = array[3];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var phoneToEdit = array[1].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }

                if(name.length>5){
                  var name = array[0].substr(0,5)+'..'
                }
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms"></a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>' 
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'
                var td = '<tr><td class="_tdname" data-name="'+array[0]+'">'+name+nameimage+'</td><td>'+count+'</td><td>'+start+'</td><td>'+phoneimage+smsimage+'</td></tr>'     
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
                var name = array[1];
                var count = array[3];
                var starts = array[0];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var phoneToEdit = array[2].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }

                if(name.length>5){
                  var name = array[1].substr(0,5)+'..'
                }
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms"></a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>' 
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'    
                var td = '<tr><td class="_tdname" data-name="'+array[1]+'">'+name+nameimage+'</td><td>'+count+'</td><td>'+start+'</td><td>'+phoneimage+smsimage+'</td></tr>'      
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
                var name = array[1];
                var count = array[0];
                var starts = array[3];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var phoneToEdit = array[2].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }

                if(name.length>5){
                  var name = array[1].substr(0,5)+'..'
                }
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms"></a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>' 
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'      
                var td = '<tr><td class="_tdnamee" data-name="'+array[1]+'">'+name+nameimage+'</td><td>'+count+'</td><td>'+start+'</td><td>'+phoneimage+smsimage+'</td></tr>'      
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
                var name = array[0];
                var count = array[2];
                var starts = array[3];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var phoneToEdit = array[1].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }

                if(name.length>5){
                  var name = array[0].substr(0,5)+'..'
                }
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms"></a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>'  
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'      
                var td = '<tr><td class="_tdnamee" data-name="'+array[0]+'">'+name+nameimage+'</td><td>'+count+'</td><td>'+start+'</td><td>'+phoneimage+smsimage+'</td></tr>'      
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
                var name = array[1];
                var count = array[3];
                var starts = array[0];
                var start = starts.substr(0,4)+'.'+starts.substr(4,2)+'.'+starts.substr(6,2)
                var phoneToEdit = array[2].replace(/-| |/gi,"");
                if(phoneToEdit.substr(0,2)=="02"){
                    var phone = phoneToEdit.substr(0,2)+'-'+phoneToEdit.substr(2,3)+'-'+phoneToEdit.substr(5,4)
                }else{
                    var phone = phoneToEdit.substr(0,3)+'-'+phoneToEdit.substr(3,4)+'-'+phoneToEdit.substr(7,4)
                }

                if(name.length>5){
                  var name = array[1].substr(0,5)+'..'
                }
                var phoneimage = '<a href="tel:'+phone+'"><img src="/static/user/res/memberadd/phone.png" class="phonesms"></a>'
                var smsimage = '<a href="sms:'+phone+'"><img src="/static/user/res/memberadd/sms.png" class="phonesms sms"></a>' 
                var nameimage ='<img src="/static/user/res/icon-setting-arrow.png" class="nameimg">'      
                var td = '<tr><td class="_tdnamee" data-name="'+array[1]+'">'+name+nameimage+'</td><td>'+count+'</td><td>'+start+'</td><td>'+phoneimage+smsimage+'</td></tr>'       
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