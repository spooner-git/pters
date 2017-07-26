$(document).ready(function(){
  
     $("div.container").click(function(e){ // When any `div.container` is clicked
         // to check if it's not the menu links that are clicked
          if($('.navbar-collapse').hasClass('in')){ //if the navbar is open (we only want to close it when it is open or else it causes a glitch when you first click outside)
        	$('.navbar-collapse').collapse('hide'); //hide the navbar
          }
      });
/*
     $('#date').swipe(function(event){
      if(event=="right"){
        alert("오른쪽 스와이프")
      }else if(event=="left"){
        alert("왼쪽 스와이프")
      };
     },{preventDefault:false, mouse:true, pen:true, distance:100});
     //jquery (http://a-fung.github.io/jQueryTouch/swipe.html)
*/
  //var imgHeight = $('img[alt=bg-image]').css('height');
  //$('#ymdText').css('height',imgHeight);
});


















