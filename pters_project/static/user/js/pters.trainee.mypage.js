/*달력 만들기

1. 각달의 일수를 리스트로 만들어 둔다.
[31,28,31,30,31,30,31,31,30,31,30,31]
2. 4년마다 2월 윤달(29일)
year를 4로 나누었을때 0이 되는 year에는 2월을 29일로 계산
3. Date() 클래스의 getDay를 이용해서 무슨 요일인지 구한다.
 Sunday is 0, Monday is 1 

*/

$(document).ready(function(){

	var countPerMonth = [1,10,20,15,25,20,15,0,0,10,25,20] //12달 순서대로 각달의 PT 수업 갯수

	graphSet(36,30);
	dataSet();







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
			console.log(trSums)
		}
		var tableSet = table + trSums + tableEnd
		loc.append(tableSet)
	}

//graphcoloring  2,5,8,11,.... 2+(3*i)
	function dataSet(){
		for(var i=0; i<12; i++){
			var thismonth = countPerMonth[i]
			var loc = 2+(3*i)+"_"
			for(var j=0; j<=thismonth;j++){
				$('#'+loc+j).addClass('graphcoloring')
			}
		}
	}




});//document(ready)