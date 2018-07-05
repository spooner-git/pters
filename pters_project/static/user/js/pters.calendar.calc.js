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

console.log('더하기 계산 : ', add_date('2017-7-3', 368))
console.log('뺴기 계산 : ', substract_date('2018-7-5', -45))
console.log('날짜 차이 계산 : ', diff_date('2017-12-5', '2018-7-5'))


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


/*
function add_month(){

}

function substract_month(){

}

function add_year(){

}

function substract_year(){

}
*/