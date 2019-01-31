var date = new Date();
var current_year = date.getFullYear(); //현재 년도
var current_month = date.getMonth(); //달은 0부터 출력해줌 0~11
var current_date = date.getDate();
var current_day = date.getDay(); // 0,1,2,3,4,5,6,7
var current_hour = date.getHours();
var current_minute = date.getMinutes();
var lastday_array = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];      //각 달의 일수
if( (current_year % 4 == 0 && current_year % 100 != 0) || current_year % 400 == 0 ){  //윤년
    lastday_array[1] = 29;
}else{
    lastday_array[1] = 28;
}

init_month_calendar("2019-01-31");

/*입력된 날짜를 기준으로 월간 달력을 그린다. */
function init_month_calendar(referencedate){
    //referencedate의 형식 yyyy-mm-dd
    draw_month_calendar_table(referencedate, '#calendar');  //2번 슬라이드에 현재년도, 현재달 달력 채우기

    // monthText(); //상단에 연, 월 표시
    // krHoliday_month(); //대한민국 공휴일
    // ajaxClassTime();
}

//선택한 Index를 가지는 슬라이드에 6개행을 생성 및 날짜 채우기
function draw_month_calendar_table(referencedate, targetHTML){
    var $targetHTML = $(targetHTML);
    var referencedate_split_array = referencedate.split('-');
    var referencedate_year = referencedate_split_array[0];
    var referencedate_month = referencedate_split_array[1];
    var referencedate_date = referencedate_split_array[2];
    var current_month_firstdate_day = date.getDay(`${referencedate_year}-${referencedate_month}-${referencedate_date}`);

    var date_cache = 1;
    var htmlToJoin = [];
    for(var i=1; i<=6; i++){
        var dateCellsToJoin = [];
        
        for(var j=0; j<=7; j++){
            if(i==1 && j<current_month_firstdate_day){ //첫번째 주일때 처리
                dateCellsToJoin.push(`<div></div>`);
            }else if(date_cache > lastday_array[referencedate_month-1]){
                dateCellsToJoin.push(`<div></div>`);
            }else{
                dateCellsToJoin.push(`<div>${date_cache}</div>`);
                date_cache++;
            }
        }

        var week_row = `<div class="week" id="week_row_${i}">${dateCellsToJoin}</div>`;
        htmlToJoin.push(week_row);
    }

    $targetHTML.html(htmlToJoin.join(''));
}; //calTable_Set







//캘린더 테이블에 연월에 맞게 날짜 채우기
function set_month_calendar_table(Year, Month){
    var currentPageFirstDayInfo = new Date(Year, Month-1, 1); //현재달의 1일에 대한 연월일시간등 전체 정보
    
}; //calendarSetting()