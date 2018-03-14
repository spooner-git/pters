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

});//document(ready)