/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/

$(document).ready(function(){

	var currentYearhistory = [10,5,16,17,22,20,18,11,3,16,19,0] //12달 순서대로 각달의 PT 수업 갯수
	var lastYearhistory = [1,5,10,15,29,10,12,22,27,12,18,12]

	var graphVerticalLength = 30;
	var graphHorizontalLength = 36
	graphSet(graphHorizontalLength,graphVerticalLength); //그래프 수직,수평 셋팅
	dataSet(currentYearhistory); //그래프에 데이터 채우기
	graphUnit(5); //그래프에 일정 단위마다 빨간선 긋기
	


	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1

	$('#yy').text(year);
	arrowSet();

	$('#leftArrow').click(function(){
		$('td').removeClass('graphcoloring')
		$('#yy').text(year-1);
		arrowSet();
		dataSet(lastYearhistory);
	})

	$('#rightArrow').click(function(){
		$('td').removeClass('graphcoloring')
		$('#yy').text(year);
		arrowSet();
		dataSet(currentYearhistory);
	})


	function graphSet(horizontal,vertical){ //그래프 눈금 셋팅 horizontal*vertical 갯수 타일
		var loc = $('.graph_main')
		var table = "<table>"
		var tableEnd = "</table>"
		var trSums = ""
		for(var i=vertical; i>0; i--){
			var tr = "<tr data-hori="+i+">"
			var trEnd = "</tr>"
			var tds = ""
			for(var j=1; j<=horizontal; j++){
				var td = "<td id="+j+"_"+i+"></td>"
				var tds = tds + td
			}
			var trSum = tr + tds + trEnd;
			var trSums = trSums + trSum
		}
		var tableSet = table + trSums + tableEnd
		loc.append(tableSet)
	}

//graphcoloring  2,5,8,11,.... 2+(3*i)
	function dataSet(year){
		for(var i=0; i<12; i++){
			var thismonth = year[i]
			var loc = 2+(3*i)+"_"
			for(var j=0; j<=thismonth;j++){
				$('#'+loc+j).addClass('graphcoloring')
			}
		}
	}

	function graphUnit(unit){
		var len = graphHorizontalLength;
		for(var i=1; i<=len; i++){
			for(var j=0; j<graphVerticalLength/unit ;j++){
				$('#'+i+'_'+unit*j).addClass('graphunit')
			}
		}
	}

	function arrowSet(){
		if($('#yy').text()==year){
			$('#rightArrow').hide()
			$('#leftArrow').show()
		}else{
			$('#rightArrow').show()
			$('#leftArrow').hide()
		}
	}

	 var repeat_info_dict= { 'KOR':
                                  {'DD':'매일', 'WW':'매주', '2W':'격주',
                                   'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일'},
                                  'JAP':
                                  {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
                                   'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日'},
                                  'JAP':
                                  {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
                                   'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat'}
                                 }

    if(ptRepeatScheduleTypeArray.length>0){
    	for(var i=0; i<ptRepeatScheduleTypeArray.length; i++){
    		var trainee_repeat_type = repeat_info_dict[Options.language][ptRepeatScheduleTypeArray[i]]
	        var trainee_repeat_days = function(){
	                                  var repeat_day_info_raw = ptRepeatScheduleWeekInfoArray[i].split('/')
	                                  var repeat_day_info = ""
	                                  if(repeat_day_info_raw.length>1){
	                                      for(var j=0; j<repeat_day_info_raw.length; j++){
	                                          var repeat_day_info = repeat_day_info + '/' + repeat_info_dict['KOR'][repeat_day_info_raw[j]].substr(0,1)
	                                      }
	                                  }else if(repeat_day_info_raw.length == 1){
	                                      var repeat_day_info = repeat_info_dict['KOR'][repeat_day_info_raw[0]]
	                                  }
	                                  if(repeat_day_info.substr(0,1) == '/'){
	                                      var repeat_day_info = repeat_day_info.substr(1,repeat_day_info.length)
	                                  }
	                                    return repeat_day_info
	                                };
	        var trainee_repeat_time = time_format_to_hangul(ptRepeatScheduleStartTimeArray[i])
	        var trainee_repeat_end = '반복종료 : '+ date_format_to_hangul(ptRepeatScheduleEndDateArray[i])
	        var trainee_repeat_day = trainee_repeat_days()
	        $('#planBoardWrap > div.planBoard._Next_Info > p:nth-child(2)').text(trainee_next_schedule)
		    $('._Repeat_Info p:nth-child(2)').text(trainee_repeat_type+' '
		                                          +trainee_repeat_day + ' '
		                                          +trainee_repeat_time)
		    $('._Repeat_Info span').text(trainee_repeat_end)
    	}
        
    }else{
        var trainee_repeat_type = ''
        var trainee_repeat_day = '설정된 반복일정이 없습니다.'
        var trainee_repeat_time = ''
        var trainee_repeat_end = ''
        $('#planBoardWrap > div.planBoard._Next_Info > p:nth-child(2)').text(trainee_next_schedule)
	    $('._Repeat_Info p:nth-child(2)').text(trainee_repeat_type+' '
	                                          +trainee_repeat_day + ' '
	                                          +trainee_repeat_time)
	    $('._Repeat_Info span').text(trainee_repeat_end)
    }


    $('.mode_switch_button').click(function(){
    	var page = $(this).attr('data-page')
    	$('#'+page).show()
    	$('#'+page).siblings('.mypage_page').hide()
    	$(this).addClass('mode_active')
    	$(this).siblings('.mode_switch_button').removeClass('mode_active')
    })

    // /trainee/read_trainee_all_schedule_ajax/ PT 일정 이력
    get_trainee_lecture_history()
    get_trainee_reg_history()
    function get_trainee_lecture_history(){
    	$.ajax({
	          url: '/trainee/read_trainee_all_schedule_ajax/',
			  dataType : 'html',
			  type:'POST',

	          beforeSend:function(){
	          	//AjaxBeforeSend();
	          },

	          success:function(data){
	          	var jsondata = JSON.parse(data);
	          	console.log(jsondata)
	          	if(jsondata.messageArray.length>0){
	              	$('#errorMessageBar').show()
	              	$('#errorMessageText').text(jsondata.messageArray)
	            }else{
					draw_trainee_lecture_history(jsondata,$('#myActiveHistory'))
	            }
	            
			  },

	          complete:function(){
	          	
	          },

	          error:function(){
	            console.log('server error')
	          }
        })
    }

    function draw_trainee_lecture_history(jsondata, targetHTML){
    	var stateCodeDict = {"PE":"완료","NP":"시작전","IP":"시작전"}
    	var $Loc = targetHTML
    	var tableHeader = '<div class="lecture_history_table_header">'+
    						'<div class="cell1">회차</div>'+
    						'<div class="cell2">날짜</div>'+
    						'<div class="cell3">진행시간</div>'+
    						'<div class="cell4">상태</div>'+
    						'<div class="cell5">노트</div>'+
    					   '</div>'
    	var html = []
    	for(var i=jsondata.ptScheduleStateCdArray.length-1; i>=0; i--){
    		var number 	     = '<div class="cell1">'+jsondata.ptScheduleIdxArray[i]+'</div>'
    		if($('body').width()>600){
    			var dateFormat = date_format_to_user_hangul(jsondata.ptScheduleStartDtArray[i])
    		}else if($('body').width()<=600){
    			var dateFormat = date_format_to_user_hangul(jsondata.ptScheduleStartDtArray[i],'minimize')
    		}
    		var date         = '<div class="cell2">'+dateFormat+'</div>'
    		var durationcalc = Number(jsondata.ptScheduleEndDtArray[i].split(' ')[1].split(':')[0])-Number(jsondata.ptScheduleStartDtArray[i].split(' ')[1].split(':')[0])
    		var durationcalc_minute = Number(jsondata.ptScheduleEndDtArray[i].split(' ')[1].split(':')[1])-Number(jsondata.ptScheduleStartDtArray[i].split(' ')[1].split(':')[1])

    		console.log('끝:',Number(jsondata.ptScheduleEndDtArray[i].split(' ')[1].split(':')[0]), durationcalc_minute)
    		console.log('시작:',Number(jsondata.ptScheduleStartDtArray[i].split(' ')[1].split(':')[0]),durationcalc_minute)
    		console.log('durationcalc',durationcalc)

    		if(durationcalc == 1 && durationcalc_minute == -30){
    			var durationText = Math.abs(durationcalc_minute)+'분'
    		}else if(durationcalc == 0 && durationcalc_minute == 30){
    			var durationText = Math.abs(durationcalc_minute)+'분'
    		}else if(durationcalc > 1 && durationcalc_minute == -30){
    			var durationText = (durationcalc-1)+'시간'+Math.abs(durationcalc_minute)+'분'
    		}else if(durationcalc >= 1 && durationcalc_minute == 30){
    			var durationText = durationcalc+'시간'+Math.abs(durationcalc_minute)+'분'
    		}else if(durationcalc >=1 && durationcalc_minute == 0){
    			var durationText = durationcalc+'시간'
    		}

    		var duration     = '<div class="cell3">'+durationText+'</div>'
    		var state        = '<div class="cell4 state_'+jsondata.ptScheduleStateCdArray[i]+'">'+stateCodeDict[jsondata.ptScheduleStateCdArray[i]]+'</div>'
    		var memo         = '<div class="cell5">'+jsondata.ptScheduleNoteArray[i]+'</div>'
    		html.push('<div class="lecture_history_table_row">'+number+date+duration+state+memo+'</div>')
    	}
    	$Loc.html(tableHeader+html.join(''))
    }

    function get_trainee_reg_history(){
    	$.ajax({
	          url: '/trainee/read_trainee_lecture_view_by_class_ajax/',
	          data:{"class_id":class_id[0]},
			  dataType : 'html',
			  type:'POST',

	          beforeSend:function(){
	          	//AjaxBeforeSend();
	          },

	          success:function(data){
	          	var jsondata = JSON.parse(data);
	          	console.log(jsondata)
	          	if(jsondata.messageArray.length>0){
	              	$('#errorMessageBar').show()
	              	$('#errorMessageText').text(jsondata.messageArray)
	            }else{
					draw_trainee_reg_history(jsondata,$('#myRegHistory'))
	            }
	            
			  },

	          complete:function(){
	          	
	          },

	          error:function(){
	            console.log('server error')
	          }
        })
    }

    function draw_trainee_reg_history(jsondata, targetHTML){
    	//var connectStateCodeDict = {"VIEW":"연결됨","WAIT":"연결안됨","DELETE":"연결안됨"}
    	
    	var $Loc = targetHTML
    	var tableHeader = '<div class="lecture_history_table_header">'+
    						'<div class="cell1">No.</div>'+
    						'<div class="cell3">등록 날짜</div>'+
    						'<div class="cell3">종료 날짜</div>'+
    						'<div class="cell4">등록 횟수</div>'+
    						'<div class="cell4">남은 횟수</div>'+
    						'<div class="cell4">상태</div>'+
    					   '</div>'
    	var html = []
    	for(var i=0; i<jsondata.countArray.length; i++){
    		var number 	     = '<div class="cell1">'+(i+1)+'</div>'
    		if($('body').width()>600){
    			var sdateFormat = date_format_to_hangul(jsondata.startArray[i])
    			var edateFormat = date_format_to_hangul(jsondata.endArray[i])
    		}else if($('body').width()<=600){
    			var sdateFormat = jsondata.startArray[i]
    			var edateFormat =jsondata.endArray[i]
    		}
    		var sdate        = '<div class="cell3">'+sdateFormat+'</div>'
    		var edate  		 = '<div class="cell3">'+edateFormat+'</div>'
    		var regCount     = '<div class="cell4">'+jsondata.countArray[i]+'</div>'
    		var remCount     = '<div class="cell4">'+jsondata.remCountArray[i]+'</div>'
    		var state     = '<div class="cell4">'+jsondata.lectureStateNameArray[i]+'</div>'
    		html.push('<div class="lecture_history_table_row">'+number+sdate+edate+regCount+remCount+state+'</div>')
    	}
    	$Loc.html(tableHeader+html.join(''))
    }




});//document(ready)