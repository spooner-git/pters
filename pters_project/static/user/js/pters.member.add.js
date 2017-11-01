$(document).ready(function(){
	  var select_all_check = false;

      $( "#datepicker" ).datepicker({
        minDate : 0,
      	onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
      		$("#dateSelector p").addClass("dropdown_selected");
      		check_dropdown_selected();
      	}
      });
      $( "#datepicker2" ).datepicker({
        minDate : 0,
      	onSelect:function(dateText,inst){ //달력날짜 선택시 하단에 핑크선
      		$("#dateSelector2 p").addClass("dropdown_selected");
      		check_dropdown_selected();
      	}
      });


      $("#memberEmail").keyup(function(){  //이메일 입력시 하단에 핑크선
        if($(this).val().length>8){
      		$(this).parent("div").addClass("dropdown_selected")
      		check_dropdown_selected();
      	}else{
      		$(this).parent("div").removeClass("dropdown_selected")
      		check_dropdown_selected();
      	}
      })

      $("#memberName").keyup(function(){  //이름 입력시 하단에 핑크선
        if($(this).val().length>1){
          limit_char(this);
      		$(this).parent("div").addClass("dropdown_selected")
      		check_dropdown_selected();
      	}else{
          limit_char(this);
      		$(this).parent("div").removeClass("dropdown_selected")
      		check_dropdown_selected();
      	}
      })

      $("#memberPhone").keyup(function(){  //전화번호 입력시 하단에 핑크선
      	if($(this).val().length>8){
          limit_char(this);
      		$(this).parent("div").addClass("dropdown_selected")
      		check_dropdown_selected();
      	}else{
          limit_char(this);
      		$(this).parent("div").removeClass("dropdown_selected")
      		check_dropdown_selected();
      	}
      })

      $("#memberCount").keyup(function(){  //남은횟수 입력시 하단에 핑크선
      	if($(this).val().length>0){
          limit_char(this);
      		$(this).parent("div").addClass("dropdown_selected")
      		check_dropdown_selected();
      	}else{
          limit_char(this);
      		$(this).parent("div").removeClass("dropdown_selected")
      		check_dropdown_selected();
      	}
      })


     function check_dropdown_selected(){ //모든 입력란을 채웠을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
        var emailInput = $("#memberEmail").parent("div");
        var nameInput = $("#memberName").parent("div");
        var phoneInput = $("#memberPhone").parent("div");
        var countInput = $("#memberCount").parent("div");
        var startInput = $("#datepicker").parent("p");
        var endInput = $("#datepicker2").parent("p");
        if((emailInput).hasClass("dropdown_selected")==true && (nameInput).hasClass("dropdown_selected")==true && (phoneInput).hasClass("dropdown_selected")==true &&(countInput).hasClass("dropdown_selected")==true&&(startInput).hasClass("dropdown_selected")==true&&(endInput).hasClass("dropdown_selected")==true){
            $("#upbutton-alarm").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
			select_all_check=true;

        }else{
        	$("#upbutton-alarm").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
            select_all_check=false;

        }
     }

     function limit_char(e){
      var limit =  /[~!@\#$%^&*\()\-=+_'|\:;\"\'\?.,/\\]/gi;
      var temp = $(e).val();
      if(limit.test(temp)){
        $(e).val(temp.replace(limit,""));
      };
     };


     $("#upbutton-alarm").click(function(){
         if(select_all_check==true){
             document.getElementById('member-add-form').submit();
         }else{
            //입력값 확인 메시지 출력 가능
         }
     })

     //작은달력 설정
     $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd',
        prevText: '이전 달',
        nextText: '다음 달',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년'
    });

});