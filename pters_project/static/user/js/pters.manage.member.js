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
				$("#float_btn").animate({opacity:'0'})
			}else if(ts<te-5){
				$("#float_btn").animate({opacity:'1'})
			}
		})

		$("#btnCallCurrent").click(function(){
			var currentMemberList = $("#currentMemberList");
			var finishedMemberList = $("#finishedMemberList");
			if(currentMemberList.css("display")=="none"){
				finishedMemberList.css("display","none");
				currentMemberList.css("display","block");
			}
		})

		$("#btnCallFinished").click(function(){
			var currentMemberList = $("#currentMemberList");
			var finishedMemberList = $("#finishedMemberList");
			if(finishedMemberList.css("display")=="none"){
				finishedMemberList.css("display","block");
				currentMemberList.css("display","none");
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
        
        finishcountList[i]=countFix+'_'+nameArray[i]+'_'+phoneArray[i]+'_'+date
        finishnameList[i]=nameArray[i]+'_'+phoneArray[i]+'_'+countOri+'_'+date
        finishdateList[i]=date+'_'+nameArray[i]+'_'+phoneArray[i]+'_'+countOri
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
                      
                var td = '<tr><td>'+name+'</td><td>'+phone+'</td><td>'+count+'</td><td>'+start+'</td></tr>'    
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
                      
                var td = '<tr><td>'+name+'</td><td>'+phone+'</td><td>'+count+'</td><td>'+start+'</td></tr>'    
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
                      
                var td = '<tr><td>'+name+'</td><td>'+phone+'</td><td>'+count+'</td><td>'+start+'</td></tr>'    
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
                      
                var td = '<tr><td>'+name+'</td><td>'+phone+'</td><td>'+count+'</td><td>'+start+'</td></tr>'    
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
                      
                var td = '<tr><td>'+name+'</td><td>'+phone+'</td><td>'+count+'</td><td>'+start+'</td></tr>'    
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
                      
                var td = '<tr><td>'+name+'</td><td>'+phone+'</td><td>'+count+'</td><td>'+start+'</td></tr>'    
                arrayResult[i] = td
            }
            var resultToAppend = arrayResult.join("")
            var result = tbodyStart + resultToAppend + tbodyEnd
            $('#finishedMember tbody').remove()
            currentTable.append(result)
          break;
        }
      }  

});