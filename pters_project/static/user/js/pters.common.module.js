//피터스 상단 셀렉트 박스 모듈
	$('.pters_selectbox_btn').click(function(e){
		e.stopPropagation();
		$(this).addClass('pters_selectbox_btn_selected');
		$(this).siblings('.pters_selectbox_btn').removeClass('pters_selectbox_btn_selected');
	})
//피터스 상단 셀렉트 박스 모듈

//피터스 On/Off 스위치
	var PTERS_SWITCH_ON = 1;
	var PTERS_SWITCH_OFF = 0;
	$('.pters_switch').click(function(){
	    if($(this).find('.switchball').hasClass('switchoff')){
	        $(this).find('.switchball').removeClass('switchoff').addClass('switchon')
	        $(this).find('.switchback').addClass('switchon-back')
	        $(this).attr('value',PTERS_SWITCH_ON);
	    }else{
	        $(this).find('.switchball').removeClass('switchon').addClass('switchoff')
	        $(this).find('.switchback').removeClass('switchon-back')
	        $(this).attr('value',PTERS_SWITCH_OFF);
	    }
	});
//피터스 On/Off 스위치

//작업중인 항목
//피터스 seekbar 모듈
	function initialize_pters_seekbar_module(selector, initLoc_start, initLoc_end, breakpoint, callback){
		var bodywidth = window.innerWidth
		var $selector = selector;
		var $segment = $selector.find('.pters_seekbar_segment');
		var $startball = $selector.find('.pters_seekbar_start_ball');
		var $endball = $selector.find('.pters_seekbar_end_ball');
		var $lengthbar = $selector.find('.pters_seekbar_length_bar');
		var $mobileguide = $selector.find('.pters_seekbar_mobile_guide');
		$startball.off('mousedown touchstart');
		$endball.off('mousedown touchstart');
		
		//각 세그먼트 좌표값 구해놓기
		var seek_divide = []; //각 세그먼트의 좌표 값
		var seek_topLoc = $segment.position().top;
		var seek_height = $segment.outerHeight();
		$segment.each(function(){
			seek_divide.push( 
								$(this).position().left
							);
		});
		seek_divide.push($selector.find('.pters_seekbar_bar').width() + $segment.position().left)
		//각 세그먼트 좌표값 구해놓기

		//Ball 위치를 initLoc_start,와 initLoc_end에 맞춰서 정렬시켜놓는다.
		$startball.css({'left':seek_divide[initLoc_start] - $startball.outerWidth()/2 }).attr('value',initLoc_start);
		$segment.find(`span[data-value="${initLoc_start}"]`).show().addClass('_startball');
		$endball.css({'left':seek_divide[initLoc_end] - $startball.outerWidth()/2 }).attr('value',initLoc_end);
		$segment.find(`span[data-value="${initLoc_end}"]`).show().addClass('_endball');
		$selector.attr('value',`${initLoc_start}:00-${initLoc_end}:00`)
		//Ball 위치를 initLoc_start,와 initLoc_end에 맞춰서 정렬시켜놓는다.


		//Ball의 위치에 맞게 pters_seekbar_length_bar를 초기 셋팅하기
		$lengthbar.css({
						'top':seek_topLoc,
						'left':$startball.position().left + $startball.width()/2,
						'width':$endball.position().left - $startball.position().left,
						'height':seek_height
						})
		//Ball의 위치에 맞게 pters_seekbar_length_bar를 초기 셋팅하기

		//startBall을 끌고 당기는 Seekbar 액션
		$startball.on('mousedown',function(e){
			var hardstopX = $selector.find('.pters_seekbar_bar').position().left  - $startball.width()/2;
			var oriX = e.pageX
			var startball_oriX = $startball.position().left;
			var endball_oriX = $endball.position().left;
			var lengthbar_width = $lengthbar.width();

			$('body').on('mousemove',function(event){
				var moveX = event.pageX
				var diffX = moveX - oriX;

				var destinationX = startball_oriX +  diffX;
				var destinationW = endball_oriX - $startball.position().left;

				if(destinationX >= hardstopX && destinationX < $endball.position().left - $endball.width()/2 ){
					$startball.css({
									'left': destinationX
									})
					$lengthbar.css({
									'left': startball_oriX + $startball.width()/2 + diffX,
									'width': endball_oriX - $startball.position().left
									})
				}
			})
			$('body').on('mouseup',function(){
				$('body').off('mousemove mouseup')
				
				var tempArray = seek_divide.slice();
				var finalDesitination = $startball.position().left + $startball.width()/2;
				tempArray.push(finalDesitination);
				var sortedlist = tempArray.sort(function(a,b){return a-b});
				var index = sortedlist.indexOf(finalDesitination);
				var prev_val = sortedlist[index-1];
				var next_val = sortedlist[index+1];
				if(finalDesitination - prev_val < next_val - finalDesitination ){
					$startball.css({
									'left':prev_val - $startball.width()/2
									}).attr('value', index-1)
					$lengthbar.css({
									'left': $startball.position().left+$startball.outerWidth()/2,
									'width': $endball.position().left - $startball.position().left
									})
					$selector.attr('value', `${index-1}:00-${$endball.attr('value')}:00` )
				}else{
					$startball.css({
									'left':next_val - $startball.width()/2
									}).attr('value', index)
					$lengthbar.css({
									'left':$startball.position().left+$startball.outerWidth()/2,
									'width': $endball.position().left - $startball.position().left
									})
					$selector.attr('value', `${index}:00-${$endball.attr('value')}:00` )
				}
				callback();
			})
		})


		$startball.on('touchstart',function(e){
			var hardstopX = $selector.find('.pters_seekbar_bar').offset().left;
			var oriX = e.originalEvent.touches[0].pageX;
			var startball_oriX = $startball.offset().left;
			var endball_oriX = $endball.offset().left;
			var lengthbar_width = $lengthbar.width();
			$('body').on('touchmove',function(event){
				var moveX = event.originalEvent.touches[0].pageX;
				var diffX = moveX - oriX;

				var destinationX = startball_oriX + diffX;

				if(destinationX >= hardstopX - $startball.outerWidth()/2 && destinationX < $endball.offset().left - $endball.outerWidth()/2 ){
					$startball.css({
									'left': destinationX - hardstopX
									}).attr('data-des',hardstopX - $startball.outerWidth()/2)
					$lengthbar.css({
									'left': destinationX - hardstopX + $startball.outerWidth()/2,
									'width': endball_oriX - $startball.offset().left
									})
				}



				var tempArray = seek_divide.slice();
				var finalDesitination = $startball.position().left + $startball.width()/2;
				tempArray.push(finalDesitination);
				var sortedlist = tempArray.sort(function(a,b){return a-b});
				var index = sortedlist.indexOf(finalDesitination);
				var prev_val = sortedlist[index-1];
				var next_val = sortedlist[index+1];

				$mobileguide.css({
									'display':'block',
									'left':destinationX - hardstopX - $mobileguide.width()/4,
									'top':-40
								})
				if(finalDesitination - prev_val < next_val - finalDesitination){
					$mobileguide.text(index-1);
				}else{
					$mobileguide.text(index);
				}


			})
			$('body').on('touchend',function(){
				$('body').off('touchmove touchend')
				var tempArray = seek_divide.slice();
				var finalDesitination = $startball.position().left + $startball.width()/2;
				tempArray.push(finalDesitination);
				var sortedlist = tempArray.sort(function(a,b){return a-b});
				var index = sortedlist.indexOf(finalDesitination);
				var prev_val = sortedlist[index-1];
				var next_val = sortedlist[index+1];

				if(bodywidth < breakpoint){
					$segment.find('._startball').hide();	
				}
				if(finalDesitination - prev_val < next_val - finalDesitination){
					$startball.css({
									'left':prev_val - $startball.outerWidth()/2
									}).attr('value', index-1)
					$lengthbar.css({
									'left': $startball.position().left+$startball.outerWidth()/2,
									'width': $endball.position().left - $startball.position().left
									})
					$mobileguide.css({'display':'none',	'left':prev_val - $mobileguide.width()/2,'top':-40})
					if(bodywidth < breakpoint){	
						$segment.find(`span[data-value="${index-1}"]`).show().addClass('_startball');
					}
					$selector.attr('value', `${index-1}:00-${$endball.attr('value')}:00` )
				}else{
					$startball.css({
									'left':next_val - $startball.outerWidth()/2
									}).attr('value', index)
					$lengthbar.css({
									'left':$startball.position().left+$startball.outerWidth()/2,
									'width': $endball.position().left - $startball.position().left
									})
					$mobileguide.css({'display':'none',	'left':next_val -$mobileguide.width()/2,'top':-40})
					if(bodywidth < breakpoint){
						$segment.find(`span[data-value="${index}"]`).show().addClass('_startball');
					}
					$selector.attr('value', `${index}:00-${$endball.attr('value')}:00` )
				}
				callback();
			})
		})
		//startBall을 끌고 당기는 Seekbar 액션

		//endBall을 끌고 당기는 Seekbar 액션
		$endball.on('mousedown',function(e){
			var hardstopX2 = $selector.find('.pters_seekbar_bar').width();
			var oriX = e.pageX
			var startball_oriX = $startball.position().left;
			var endball_oriX = $endball.position().left;
			var lengthbar_width = $lengthbar.width();

			$('body').on('mousemove',function(event){

				var moveX = event.pageX
				var diffX = moveX - oriX;

				var destinationX = endball_oriX + diffX;
				var destinationW = endball_oriX - $endball.position().left;
				if(destinationX <= hardstopX2 - $endball.width()/2 && destinationX > $startball.position().left + $startball.width()/2 ){
					$endball.css({
									'left': destinationX
									})
					$lengthbar.css({
									'width': $endball.position().left - startball_oriX
									})
				}
			})
			$('body').on('mouseup',function(){
				$('body').off('mousemove mouseup')
				
				var tempArray = seek_divide.slice();
				var finalDesitination = $endball.position().left + $endball.width()/2;
				tempArray.push(finalDesitination);
				var sortedlist = tempArray.sort(function(a,b){return a-b});
				var index = sortedlist.indexOf(finalDesitination);
				var prev_val = sortedlist[index-1];
				var next_val = sortedlist[index+1];
				if(finalDesitination - prev_val < next_val - finalDesitination){
					$endball.css({
									'left':prev_val - $endball.width()/2
									}).attr('value', index-1)
					$lengthbar.css({
									'width': $endball.position().left - startball_oriX
									})
					$selector.attr('value', `${$startball.attr('value')}:00-${index-1}:00` )
				}else{
					$endball.css({
									'left':next_val - $endball.width()/2
									}).attr('value',index)
					$lengthbar.css({
									'width': $endball.position().left - startball_oriX
									})
					$selector.attr('value', `${$startball.attr('value')}:00-${index}:00` )
				}
				callback();
			})
			
		})
		

		$endball.on('touchstart',function(e){
			var hardstopX2 = $selector.find('.pters_seekbar_bar').offset().left + $selector.find('.pters_seekbar_bar').width();
			var oriX = e.originalEvent.touches[0].pageX;
			var startball_oriX = $startball.offset().left;
			var endball_oriX = $endball.offset().left;
			var lengthbar_width = $lengthbar.width();

			$('body').on('touchmove',function(event){
				var moveX = event.originalEvent.touches[0].pageX;
				var diffX = moveX - oriX;

				var destinationX = endball_oriX + diffX;
				var destinationW = endball_oriX - $endball.position().left;

				if(destinationX + $endball.outerWidth()/2 <= hardstopX2 && destinationX > $startball.offset().left + $startball.outerWidth()/2 ){
					$endball.css({
									//'left': endball_oriX + $endball.width()/2 + diffX
									'left':destinationX - $selector.find('.pters_seekbar_bar').offset().left
									})
					$lengthbar.css({
									'width': $endball.offset().left - startball_oriX
									})
				}


				var tempArray = seek_divide.slice();
				var finalDesitination = $endball.position().left + $endball.width()/2;
				tempArray.push(finalDesitination);
				var sortedlist = tempArray.sort(function(a,b){return a-b});
				var index = sortedlist.indexOf(finalDesitination);
				var prev_val = sortedlist[index-1];
				var next_val = sortedlist[index+1];

				$mobileguide.css({
									'display':'block',
									'left':destinationX - $selector.find('.pters_seekbar_bar').offset().left - $mobileguide.width()/4,
									'top':-40
								})
				if(finalDesitination - prev_val < next_val - finalDesitination){
					$mobileguide.text(index-1);
				}else{
					$mobileguide.text(index);
				}
			})

			$('body').on('touchend',function(e){
				$('body').off('touchmove touchend')
				var tempArray = seek_divide.slice();
				var finalDesitination = $endball.position().left + $endball.width()/2;
				tempArray.push(finalDesitination);
				var sortedlist = tempArray.sort(function(a,b){return a-b});
				var index = sortedlist.indexOf(finalDesitination);
				var prev_val = sortedlist[index-1];
				var next_val = sortedlist[index+1];

				if(bodywidth < breakpoint){
					$segment.find('._endball').hide();
				}
				if(finalDesitination - prev_val < next_val - finalDesitination){
					$endball.css({
									'left':prev_val - $endball.outerWidth()/2
									}).attr('value', index-1)
					$lengthbar.css({
									'width': $endball.offset().left - startball_oriX
									})
					$mobileguide.css({'display':'none',	'left':prev_val -$mobileguide.width()/2,'top':-40})
					if(bodywidth < breakpoint){
						$segment.find(`span[data-value="${index-1}"]`).show().addClass('_endball');
					}
					$selector.attr('value', `${$startball.attr('value')}:00-${index-1}:00` )
				}else{
					$endball.css({
									'left':next_val - $endball.outerWidth()/2
									}).attr('value', index)
					$lengthbar.css({
									'width': $endball.offset().left - startball_oriX
									})
					$mobileguide.css({'display':'none',	'left':next_val -$mobileguide.width()/2,'top':-40})
					if(bodywidth < breakpoint){
						$segment.find(`span[data-value="${index}"]`).show().addClass('_endball');
					}
					$selector.attr('value', `${$startball.attr('value')}:00-${index}:00` )
				}
				callback();
			})
		})
		//endBall을 끌고 당기는 Seekbar 액션
	}; 
//피터스 seekbar 모듈

//피터스 Scrolling 모듈
	//드랍다운에서 가속도 스크롤을 같은방향으로 더 튕겼을때 드랍다운 멈추는 형상 해결
	function append_dropdown_scroll_arrow(selector, selector_arrowParent, user_offset_topArrow ,user_offset_bottomArrow){
		console.log('a;sodfj;aoehgoaihseg')
	    var bottom_offset = $(selector).height() + $(selector_arrowParent).height() + user_offset_bottomArrow;
	    var top_offset = 0 + user_offset_topArrow
	    if($(selector).find('.dropdown_scroll_arrow_top').length == 0 ){
	        $(selector_arrowParent).append(
	                                        `<img src="/static/user/res/btn-today-left.png" class="dropdown_scroll_arrow_top" style="top:${top_offset}px;">
	                                        <img src="/static/user/res/btn-today-left.png" class="dropdown_scroll_arrow_bottom" style="bottom: -${bottom_offset}px;">`
	                                        )
	    }
	}


	function set_list_overflow_scrolling(selector, selector_arrowParent){
		$(selector).addClass('pters_overflow_scrolling')
		//드랍다운 씹힘현상 해결
		if($(selector).scrollTop() < 30 ){
	        $(`${selector_arrowParent} img.dropdown_scroll_arrow_top`).css('visibility','hidden');
	    };
	    /*
	    if($(selector).scrollTop() < $(selector).height() + 25 ){
	    	$(`${selector_arrowParent} img.dropdown_scroll_arrow_bottom`).css('visibility','hidden');
	    }
	    */
	    if($(selector).height() + 20  >  $(selector).prop('scrollHeight') ){
	    	$(`${selector_arrowParent} img.dropdown_scroll_arrow_bottom`).css('visibility','hidden');
	    }
	    $(selector).scroll(function(){
	        var scrollHeight = $(this).prop('scrollHeight');
	        var popupHeight = $(this).height();
	        var scrollLocation = $(this).scrollTop();
	        //scrollHeight = popupHeight + scrollLocation(끝)
	        if(popupHeight + scrollLocation == scrollHeight){
	            $(this).animate({scrollTop : scrollLocation-1},10)
	        }else if(popupHeight + scrollLocation == popupHeight){
	            $(this).animate({scrollTop : scrollLocation+1},10)
	        }

	        // 좌측 스크롤 애로우 보이기
	        if(popupHeight + scrollLocation < scrollHeight-30){
	            $(`${selector_arrowParent} img.dropdown_scroll_arrow_bottom`).css('visibility','visible')
	        }else{
	            $(`${selector_arrowParent} img.dropdown_scroll_arrow_bottom`).css('visibility','hidden')
	        }
	        if(scrollLocation > 30){
	            $(`${selector_arrowParent} img.dropdown_scroll_arrow_top`).css('visibility','visible')
	        }else{
	            $(`${selector_arrowParent} img.dropdown_scroll_arrow_top`).css('visibility','hidden')
	        }
	        //좌측 스크롤 애로우 보이기
	    });
	    //드랍다운 씹힘현상 해결
	    //드랍다운에서 가속도 스크롤을 같은방향으로 더 튕겼을때 드랍다운 멈추는 형상 해결

	    //드랍다운리스트에서 위 화살표를 누르면 리스트의 맨위로 이동한다.
	        $(document).on('click',`${selector_arrowParent} img.dropdown_scroll_arrow_top`,function(e){
	            e.stopPropagation();
	            var $thisparent = $(selector);
	            var $thisparent_scroll_height = $thisparent.prop('scrollHeight');
	            var $thisparent_display_height = $thisparent.height();
	            if($(this).css('visibility') == 'visible'){
	                $thisparent.animate({scrollTop: 0},200)
	            }
	        });
	    //드랍다운리스트에서 위 화살표를 누르면 리스트의 맨위로 이동한다.
	    //드랍다운리스트에서 아래 화살표를 누르면 리스트의 맨아래로 이동한다.
	        $(document).on('click',`${selector_arrowParent} img.dropdown_scroll_arrow_bottom`,function(e){
	            e.stopPropagation();
	            var $thisparent = $(selector);
	            var $thisparent_scroll_height = $thisparent.prop('scrollHeight');
	            var $thisparent_display_height = $thisparent.height();
	            if($(this).css('visibility') == 'visible'){
	                $thisparent.animate({scrollTop: $thisparent_scroll_height + $thisparent_display_height},200)
	            }
	        });
	    //드랍다운리스트에서 아래 화살표를 누르면 리스트의 맨아래로 이동한다.
	}
//피터스 Scrolling 모듈


//피터스 input 커스텀
//placeholder는 회색으로, 사용자가 입력하면 검정색으로 바꾸기 (iphone때문에..)
$('input').keyup(function(e){
	var $this = $(this);
	if($this.val().length > 0){
		$this.css({
 					"-webkit-text-fill-color":'#282828'
		})
	}else{
		$this.css({
 					"-webkit-text-fill-color":'#cccccc'
		})
	}
});

$('input').change(function(e){
	var $this = $(this);
	if($this.val().length > 0){
		$this.css({
 					"-webkit-text-fill-color":'#282828'
		})
	}else{
		$this.css({
 					"-webkit-text-fill-color":'#cccccc'
		})
	}
});
//피터스 input 커스텀

//피터스 jqeury 미니달력 커스텀
//날짜 선택하면 글씨를 검정색으로 바꾸기..
/*
$("p.datepicktext input").datepicker({
    //minDate : 0,
    onSelect : function(curDate, instance){ //미니 달력에서 날짜 선택했을때 실행되는 콜백 함수
    											
    										}
 })
 */
 //문제 : 일정 등록시 날짜 선택이 동작 안함
//피터스 jquery 미니달력 커스텀