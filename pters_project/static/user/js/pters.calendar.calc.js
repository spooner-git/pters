/*####################################################################################################*/
//										SPOONER / PTERS.co.kr
//										   Date Calculator
//										  2018.07.05 SKKIM
/*####################################################################################################*/
var date = new Date();
var currentYear = date.getFullYear(); //현재 년도
var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31];      //각 달의 일수
if( (currentYear % 4 == 0 && currentYear % 100 != 0) || currentYear % 400 == 0 ){  //윤년
    lastDay[1] = 29;
}else{
    lastDay[1] = 28;
}

//날짜 더하기 계산 : 2018-7-5에서 10일 후는 언제?
function add_date(startdate, addvalue){
	var year = Number(startdate.split('-')[0]);
	var month = Number(startdate.split('-')[1]);
	var date = Number(startdate.split('-')[2]);
	var sumdate = date + addvalue;
	var currentLastday = lastDay[month-1];
	var index = month - 1;
	var newdate = sumdate;
	var newmonth = month;
	var newyear = year;
	while(newdate > lastDay[index]){
		newdate = newdate - lastDay[index];
		newmonth++;
		index++;
		if(index == 12){
			index = 0;
			newyear++;
			newmonth = 1;
		}
	}
	var result = newyear + '-' + newmonth + '-' + newdate;

	return result;
}


//날짜 빼기 계산 : 2018-7-5에서 10일 전은 언제?
function substract_date(startdate, subvalue){ //subvalue는 음수값 입력
	var year = Number(startdate.split('-')[0]);
	var month = Number(startdate.split('-')[1]);
	var date = Number(startdate.split('-')[2]);
	var subsdate = date + subvalue;
	var monthindex = month - 2;
	// if(month-2 == 0){
	// 	monthindex = 11;
	// }else if(month - 2 == -1){
	// 	monthindex = 10;
	// }
	var index = monthindex;
	var newdate = subsdate;
	var newmonth = month;
	var newyear = year;
	while(newdate <= 0){
		newmonth--;
		if(index == -1 ){
			index = 11;
			newyear--;
			newmonth = 12;
		}
		newdate = newdate + lastDay[index];

		index--;
		
	}
	var result = newyear + '-' + newmonth + '-' + newdate;

	return result;
}

function diff_month(startdate, enddate){ //2018-07-01 ~ 2018-09-31
	var zz =0;
	while(add_month(startdate, zz).split('-')[1] != Number(enddate.split('-')[1]) ){
		zz++;
		if(zz > 20000){
			break;
			alert('오류 발생 : 기능이 현재 사용 불가합니다.\n 관리자 점검이 필요합니다.')
		}
	}
	return zz
}

//날짜 차이 계산 : 2018-7-5 ~ 2018-9-25 일 사이는 몇일이 있는가?
function diff_date(startdate, enddate){
	var enddate_ = Number(enddate.split('-')[0]) + '-' + Number(enddate.split('-')[1]) + '-' + Number(enddate.split('-')[2]);
	var datesum = startdate;
	var diff = 0;
	while(datesum != enddate_){
		diff++;
		datesum = add_date(startdate, diff)
	}
	return diff
}

//달 더하기 계산 : 2018-7-5에서 7개월 후는 언제?
function add_month(startdate, addvalue){
	var year = Number(startdate.split('-')[0]);
	var month = Number(startdate.split('-')[1]);
	var date = Number(startdate.split('-')[2]);
	var summonth = month + addvalue;
	var newmonth = summonth;
	var newyear  = year;
	var newdate  = date;
	while(newmonth > 12){
		newmonth = newmonth - 12;
		newyear++
	}
	if(date == lastDay[month-1]){
		var newdate = lastDay[newmonth-1];
	}


	var result = newyear + '-' + newmonth + '-' + newdate;
	return result
}


function substract_month(startdate, addvalue){
	var year = Number(startdate.split('-')[0]);
	var month = Number(startdate.split('-')[1]);
	var date = Number(startdate.split('-')[2]);
	var summonth = month + addvalue;
	var newmonth = summonth;
	var newyear  = year;
	var newdate  = date;
	while(newmonth <= 0){
		newmonth = newmonth + 12;
		newyear--
	}
	if(date == lastDay[month-1]){
		var newdate = lastDay[newmonth-1];
	}


	var result = newyear + '-' + newmonth + '-' + newdate;
	return result
}

function compare_date(date1, date2){
	var year1 = date1.split('-')[0];
	var month1  = date1.split('-')[1];
	var year2 = date2.split('-')[0];
	var month2  = date2.split('-')[1];

	if(year1.length<2){year1 = '0'+ year1;}
	if(month1.length<2){month1 = '0'+ month1;}
	if(year2.length<2){year2 = '0'+ year2;}
	if(month2.length<2){month2 = '0'+ month2;}

	var date1_num = year1+month1;
	var date2_num = year2+month2;

	if(date1_num > date2_num){
		return true;
	}else{
		return false;
	}
}

function compare_date2(date1, date2){
	var date1_split =  date1.split('-');
	var date2_split =  date2.split('-');
	var yy1 = date1_split[0];
	var mm1  = date1_split[1];
	var dd1 = date1_split[2];
	var yy2 = date2_split[0];
	var mm2  = date2_split[1];
	var dd2 = date2_split[2];

	if(yy1.length<2){yy1 = '0'+ yy1;}
	if(mm1.length<2){mm1 = '0'+ mm1;}
	if(dd1.length<2){dd1 = '0'+ dd1;}
	if(yy2.length<2){yy2 = '0'+ yy2;}
	if(mm2.length<2){mm2 = '0'+ mm2;}
	if(dd2.length<2){dd2 = '0' + dd2}


	var date1_num = yy1+mm1+dd1;
	var date2_num = yy2+mm2+dd2;
	if(date1_num > date2_num){
		return true;
	}else{
		return false;
	}
}


function find_max_date(dateArray){ //어레이 안에서 가장 최근 날짜를 찾아낸다.
	var len = dateArray.length;
	var dates = [];

	for(var i=0; i<len; i++){
		var date = dateArray[i];
		if(date == '9999-12-31' || date == '소진시까지'){

		}else{
			dates.push(date);
		}
	}
	var sorted = dates.sort();
	if(sorted.length==0){
		return today_YY_MM_DD;
	}else{
		return sorted[sorted.length-1];
	}
}


// 시간에서 시간을 빼면 몇시?
// 11:30 에서 2시간을 빼면 ??
function substract_time(starttime, subvalue){
	var shour = Number(starttime.split(':')[0]);
	var smin = Number(starttime.split(':')[1]);
	var subhour = Number(subvalue.split(':')[0]);
	var submin = Number(subvalue.split(':')[1]);
	if(submin > 60){
		subhour = subhour + parseInt(submin/60);
		submin = submin%60;
	}

	if(smin - submin >= 0){
		if(shour - subhour >= 0){
			var resultHour = shour - subhour;
			var resultMin = smin - submin;
		}else if(shour - subhour < 0){
			var resultHour = 24 + (shour - subhour);
			var resultMin = smin - submin;
		}

	}else if(smin - submin < 0){
		if(shour - subhour > 0){
			var resultHour = shour - subhour - 1;
			var resultMin = smin + (60 - submin);
			// var hourminus = parseInt( (submin + smin)/60 );
			// var resultHour = shour - subhour - hourminus - 1;
			// var resultMin = (smin - submin)%60;
			// if(resultMin < 0){
			// 	resultMin = 60 + resultMin;
			// }

		}else if(shour - subhour <= 0){
			var resultHour = 24 + (shour - subhour) - 1;
			var resultMin = smin + (60 - submin);
			// var hourminus = parseInt( (smin - submin)/60 );
			// var resultHour = shour - subhour + hourminus - 1;
			// var resultMin = (smin - submin)%60;
			// if(resultMin < 0){
			// 	resultMin = 60 + resultMin;
			// }
		}
	}

	if(resultHour<10){
		var resultHour = '0' + resultHour;
	}
	if(resultMin<10){
		var resultMin = '0' + resultMin;
	}


	return resultHour + ":" + resultMin;
}

function diff_time(starttime, endtime){
	var starttimeSplit = starttime.split(':');
	var endtimeSplit = endtime.split(':');
	var sHour = Number(starttimeSplit[0]);
	var sMin = Number(starttimeSplit[1]);
	var eHour = Number(endtimeSplit[0]);
	var eMin = Number(endtimeSplit[1]);

	return (eHour - sHour)*60 + (eMin - sMin);
}

function add_time(starttime, addvalue){
	var starttimeSplit = starttime.split(':');
	var addvalueSplit = addvalue.split(':');
	var shour = Number(starttimeSplit[0]);
	var smin = Number(starttimeSplit[1]);
	var addhour = Number(addvalueSplit[0]);
	var addmin = Number(addvalueSplit[1]);

	if(smin + addmin >= 60){
		if(shour + addhour >= 24){  // 23 + 4 --> 3
			if(shour + addhour == 24){
				var resultHour = 25;
			}else{
				var resultHour = addhour - (24-shour);
			}
			var resultMin = smin + addmin - 60;
		}else if(shour + addhour < 24){
			var hourplus = parseInt((smin + addmin)/60);
			var resultHour = shour + addhour + hourplus;
			var resultMin = (smin + addmin)%60;
		}
	}else if(smin + addmin < 60){
		if(shour + addhour >= 24){  //23 + 1 --> 00
			if(shour + addhour == 24){
				var resultHour = 24;
			}else{
				var resultHour = (shour + addhour) - 24;
			}
			var resultMin = smin + addmin;
		}else if(shour + addhour < 24){
			var resultHour = shour + addhour;
			var resultMin = smin + addmin;
		}
	}

	if(resultHour<10){
		var resultHour = '0' + resultHour;
	}
	if(resultMin<10){
		var resultMin = '0' + resultMin;
	}


	return resultHour + ":" + resultMin;
}


function compare_time(time1, time2){
	var hour1 = time1.split(':')[0];
	var min1  = time1.split(':')[1];
	var hour2 = time2.split(':')[0];
	var min2  = time2.split(':')[1];

	var time1_num = hour1+min1;
	var time2_num = hour2+min2;

	if(Number(time1_num) > Number(time2_num) ){
		return true;
	}else{
		return false;
	}
}

// "0:00-23:59" 형식에서 시간만 뽑아오기 (업무시간 설정)
function worktime_extract_hour(worktimeformat){
    var worktime = worktimeformat;
    var starthour = worktime.split('-')[0].split(':')[0];
    var endhour = worktime.split('-')[1].split(':')[0];
    var startmin = worktime.split('-')[0].split(':')[1];
    var endmin = worktime.split('-')[1].split(':')[1];
    if(startmin == "59" && starthour == "23"){
        starthour = 24
    }
    if(endmin == "59" && endhour == "23"){
        endhour = 24
    }
    return {"start": Number(starthour), "end":Number(endhour)}
}

function worktime_extract_maxmin(worktimeArray){
	var len = worktimeArray.length;
	var extracted = [];
	for(var i=0; i<len; i++){
		if(worktime_extract_hour(worktimeArray[i])["start"] == 0 && worktime_extract_hour(worktimeArray[i])["end"] == 0 ){
			
		}else{
			extracted.push(worktime_extract_hour(worktimeArray[i])["start"], worktime_extract_hour(worktimeArray[i])["end"] )
		}
		
	}
	return {"max":Math.max.apply(null,extracted), "min":Math.min.apply(null,extracted)}
}
