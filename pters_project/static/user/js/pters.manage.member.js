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
			DataSummaryByName.sort()
          	currentMemberListSet();
		})

		$('#countH').click(function(){
			DataSummaryByCountH.sort()
          	currentMemberListSet();
		})

		$('#startR').click(function(){
			DataSummaryByStartR.sort()
          	currentMemberListSet();
		})




          var DataSummaryByName = {} // 최종 어레이 [김선겸_01034435752_99_2017년 10월 4일, 원빈.....]
          var DataSummaryByCountH = {}
          var DataSummaryByStartR = {}
          //var DataSummaryByRecent = []




          var len = nameArray.length; 
          for(var i=0; i<len; i++){
          		var dateFix = startArray[i].replace(/년 |월 |일|:| /gi,"_"); //날짜에서 연월일 지우고 '_' 로 치환
          		var dateFixArry = dateFix.split('_')
          		if(dateFixArry[1].length==1 && dateFixArry[2].length==2){
          			var date = dateFixArry[0]+'0'+dateFixArry[1]+dateFixArry[2]	
          		}else if(dateFixArry[1].length==1 && dateFixArry[2].length==1){
          			var date = dateFixArry[0]+'0'+dateFixArry[1]+'0'+dateFixArry[2]
          		}else if(dateFixArry[1].length==2 && dateFixArry[2].length==1){
          			var date = dateFixArry[0]+dateFixArry[1]+'0'+dateFixArry[2]
          		}else{
          			var date = dateFixArry[0]+dateFixArry[1]+dateFixArry[2]
          		}
          		
          		DataSummaryByName[nameArray[i]] = {'count':countArray[i],'start':date,'phone':phoneArray[i]};
          		DataSummaryByCountH[countArray[i]] = {'name':nameArray[i],'start':date,'phone':phoneArray[i]};
          		DataSummaryByStartR[date] = {'name':nameArray[i],'count':countArray[i],'phone':phoneArray[i]}
          }  

          currentMemberDBListProcess()
          	
          function currentMemberDBListProcess (){
          	var countAlign=[]
          	var nameAlign=[]
          	var startAlign=[]
          	for(var count in DataSummaryByCountH){
          		countAlign.push(count+'_'+DataSummaryByCountH[count].name+'_'+DataSummaryByCountH[count].start+'_'+DataSummaryByCountH[count].phone)
          	}
          	for(var start in DataSummaryByStartR){
          		startAlign.push(start+'_'+DataSummaryByStartR[start].name+'_'+DataSummaryByStartR[start].count+'_'+DataSummaryByStartR[start].phone)
          	}
          	for(var name in DataSummaryByName){
          		nameAlign.push(name+'_'+DataSummaryByName[name].count+'_'+DataSummaryByName[name].start+'_'+DataSummaryByName[name].phone)
          	}

          		console.log(countAlign)
          		console.log(nameAlign.sort())
          		console.log(startAlign)
          }



         function currentMemberListSet (){  //멤버 리스트 뿌리기
          	
          	var currentTable = $('#currentMember');
          	var tbodyStart = '<tbody>'
          	var tbodyEnd = '</tbody>'
          	var tbodyToAppend = $(tbodyStart)
    		  	
          	var len = DataSummaryByName.length;
          	var arrayResult = []
          	for(var i=0; i<len; i++){
	          	var array = DataSummaryByName[i].split('_');
	          	var name = array[0];
	          	var count = array[2];
	          	var start = array[3]+'.'+array[4]+'.'+array[5];
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
          }




         /*
          function currentMemberListSet (){  //멤버 리스트 뿌리기
          	
          	var currentTable = $('#currentMember');
          	var tbodyStart = '<tbody>'
          	var tbodyEnd = '</tbody>'
          	var tbodyToAppend = $(tbodyStart)
    		  	
          	var len = DataSummaryByName.length;
          	var arrayResult = []
          	for(var i=0; i<len; i++){
	          	var array = DataSummaryByName[i].split('_');
	          	var name = array[0];
	          	var count = array[2];
	          	var start = array[3]+'.'+array[4]+'.'+array[5];
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
          }
*/
});