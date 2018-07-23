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

console.log('일 더하기 계산 : ', add_date('2017-7-3', 368))
console.log('일 뺴기 계산 : ', substract_date('2018-7-5', -45))
console.log('날짜 차이 계산 : ', diff_date('2017-12-5', '2018-7-5'))

console.log('달 더하기 계산', add_month('2018-7-31', 10))
console.log('달 빼기 계산', substract_month('2018-7-31',-17))


//날짜 더하기 계산 : 2018-7-5에서 10일 후는 언제?
function add_date(startdate, addvalue){
	var year = Number(startdate.split('-')[0]);
	var month = Number(startdate.split('-')[1]);
	var date = Number(startdate.split('-')[2]);
	var sumdate = date + addvalue;
	var currentLastday = lastDay[month-1]
	var index = month - 1;
	var newdate = sumdate;
	var newmonth = month
	var newyear = year
	while(newdate > lastDay[index]){
		newdate = newdate - lastDay[index];
		newmonth++
		index++
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
	var monthindex = month - 2
	if(month-2 == 0){
		monthindex = 11
	}else if(month - 2 == -1){
		monthindex = 10
	}
	var index = monthindex;
	var newdate = subsdate;
	var newmonth = month
	var newyear = year
	while(newdate <= 0){
		newmonth--
		if(index == -1){
			index = 11;
			newyear--;
			newmonth = 12;
		}
		newdate = newdate + lastDay[index]
		
		index--
		
	}
	var result = newyear + '-' + newmonth + '-' + newdate;

	return result;
}

//날짜 차이 계산 : 2018-7-5 ~ 2018-9-25 일 사이는 몇일이 있는가?
function diff_date(startdate, enddate){
	var enddate_ = Number(enddate.split('-')[0]) + '-' + Number(enddate.split('-')[1]) + '-' + Number(enddate.split('-')[2])
	var datesum = startdate;
	var diff = 0;
	while(datesum != enddate_){
		diff++
		datesum = add_date(startdate, diff)
	}
	return diff
}

//달 더하기 계산 : 2018-7-5에서 7개월 후는 언제?
function add_month(startdate, addvalue){
	var year = Number(startdate.split('-')[0]);
	var month = Number(startdate.split('-')[1]);
	var date = Number(startdate.split('-')[2]);
	var summonth = month + addvalue
	var newmonth = summonth;
	var newyear  = year;
	var newdate  = date;
	while(newmonth > 12){
		newmonth = newmonth - 12
		newyear++
	}
	if(date == lastDay[month-1]){
		var newdate = lastDay[newmonth-1]
	}


	var result = newyear + '-' + newmonth + '-' + newdate
	return result
}


function substract_month(startdate, addvalue){
	var year = Number(startdate.split('-')[0]);
	var month = Number(startdate.split('-')[1]);
	var date = Number(startdate.split('-')[2]);
	var summonth = month + addvalue
	var newmonth = summonth;
	var newyear  = year;
	var newdate  = date;
	while(newmonth <= 0){
		newmonth = newmonth + 12
		newyear--
	}
	if(date == lastDay[month-1]){
		var newdate = lastDay[newmonth-1]
	}


	var result = newyear + '-' + newmonth + '-' + newdate
	return result
}


function find_max_date(dateArray){ //어레이 안에서 가장 최근 날짜를 찾아낸다.
	var len = dateArray.length;
	var dates = [];
	console.log(dateArray)
	for(var i=0; i<len; i++){
		var date = dateArray[i]
		if(date == '9999-12-31' || date == '소진시까지'){

		}else{
			dates.push(date)
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
			var resultMin = smin + (60 - submin)
		}else if(shour - subhour <= 0){
			var resultHour = 24 + (shour - subhour) - 1;
			var resultMin = smin + (60 - submin)
		}
	}

	if(resultHour<10){
		var resultHour = '0' + resultHour
	}
	if(resultMin<10){
		var resultMin = '0' + resultMin
	}


	return resultHour + ":" + resultMin;
}

function add_time(starttime, addvalue){
	var shour = Number(starttime.split(':')[0]);
	var smin = Number(starttime.split(':')[1]);
	var addhour = Number(addvalue.split(':')[0]);
	var addmin = Number(addvalue.split(':')[1]);

	if(smin + addmin >= 60){
		if(shour + addhour >= 24){  // 23 + 4 --> 3
			if(shour + addhour == 24){
				var resultHour = 24
			}else{
				var resultHour = addhour - (24-shour);
			}
			var resultMin = smin + addmin - 60;
		}else if(shour + addhour < 24){
			var hourplus = parseInt((smin + addmin)/60)
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
			var resultHour = shour + addhour ;
			var resultMin = smin + addmin;
		}
	}

	if(resultHour<10){
		var resultHour = '0' + resultHour
	}
	if(resultMin<10){
		var resultMin = '0' + resultMin
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

	if(time1_num > time2_num){
		return true;
	}else{
		return false;
	}
}
