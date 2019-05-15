$(document).ready(function(){
	  var select_all_check = false;
      $('#inputError').fadeIn('slow')
     

      $("#datepicker_add").datepicker({
        minDate : 0,
        onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
          $("#dateSelector p").addClass("dropdown_selected");
          check_dropdown_selected();
        }
      });

      $("#datepicker2_add").datepicker({
        minDate : 0,
        onSelect:function(curDate,inst){ //달력날짜 선택시 하단에 핑크선
          $("#dateSelector2 p").addClass("dropdown_selected");
          check_dropdown_selected();
        }
      });


       $("#datepicker_fast").datepicker({
        minDate : 0,
        onSelect:function(dateText,inst){  //달력날짜 선택시 하단에 핑크선
          $("#dateSelector3 p").addClass("dropdown_selected");

          autoDateInput();
          check_dropdown_selected();
        }
      });


      $("#memberEmail_add").keyup(function(){  //이메일 입력시 하단에 핑크선
        if($(this).val().length>8){
      		$(this).parent("div").addClass("dropdown_selected")
      		check_dropdown_selected();
      	}else{
      		$(this).parent("div").removeClass("dropdown_selected")
      		check_dropdown_selected();
      	}
      })

      $("#memberName_add").keyup(function(){  //이름 입력시 하단에 핑크선
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

      $('#memberBirthYear').keyup(function(){
        var input = $(this).val()
        if(input.length==4 && input>=1900 && input<=2200){
          $(this).addClass("dropdown_selected")
          birthdayInput()
        }else{
          $(this).removeClass("dropdown_selected")
        }
      })

      $('#memberBirthMonth li a').click(function(){ //생년월일 "월" 선택했을때 핑크선 + "일" 드롭다운 채워주기
         $(this).parents('ul').siblings('button').text($(this).text());
         $(this).parents('ul').siblings('button').val($(this).attr('value'));
         $('#memberBirthMonthSelected').addClass("dropdown_selected")
         var lastDay = [31,29,31,30,31,30,31,31,30,31,30,31]
         var length = lastDay[Number($(this).attr('value'))-1]
         var datesList = []
         for(i=0; i<=length-1; i++){
            datesList[i] = '<li><a value="'+(i+1)+'">'+(i+1)+' 일</a></li>'
         }
         var dates = datesList.join("")
         $('#memberBirthDate').html(dates)
         birthdayInput()
      })

      $(document).on('click','#memberBirthDate li a',function(){
         $(this).parents('ul').siblings('button').text($(this).text());
         $(this).parents('ul').siblings('button').val($(this).attr('value'));
         birthdayInput()
      })

      $(document).on('click','#memberBirthDate li a',function(){
        $('#memberBirthDateSelected').addClass("dropdown_selected")
      })

      $('#memberSex .selectboxopt').click(function(){
        $(this).addClass('selectbox_checked')
        $(this).siblings().removeClass('selectbox_checked')
        $('#form_sex').attr('value',$(this).attr('value'))
      })


      $("#memberPhone_add").keyup(function(){  //전화번호 입력시 하단에 핑크선
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

      $("#memberCount_add").keyup(function(){  //남은횟수 입력시 하단에 핑크선
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

      function birthdayInput(){
        var yy = $('#memberBirthYear').val()
        var mm = $('#memberBirthMonth').siblings('button').val()
        var dd = $('#memberBirthDate').siblings('button').val()
        $('#form_birth').val(yy+'-'+mm+'-'+dd)
      }


      //빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////
      $('#btnCallSimple').click(function(){
        $('#manualReg').hide();
        $('#simpleReg').fadeIn('fast');
        $(this).addClass('selectbox_checked')
        $('#btnCallManual').removeClass('selectbox_checked')
        $('p').removeClass("dropdown_selected")
        $('#memberCount_add_fast').parent('div').removeClass('dropdown_selected')
        $('#datepicker_add,#datepicker2_add,#memberCount_add,#lecturePrice_add_2').val("")
        $('#fast_check').val('0')
        check_dropdown_selected();
      })

      $('#btnCallManual').click(function(){
        $('#simpleReg').hide()
        $('#manualReg').fadeIn('fast');
        $(this).addClass('selectbox_checked')
        $('#btnCallSimple').removeClass('selectbox_checked')
        $('._due div.checked').removeClass('checked ptersCheckboxInner')
        $('._count div.checked').removeClass('checked ptersCheckboxInner')
        $('p').removeClass("dropdown_selected")
        $('#datepicker_fast,#lecturePrice_add,#memberDue_add_2').val("")
        $('#fast_check').val('1')
        check_dropdown_selected();
      })

      $('._due .ptersCheckbox').parent('td').click(function(){
        $('._due div.checked').removeClass('checked ptersCheckboxInner')
        var pterscheckbox = $(this).find('div')
        $(this).find('div:nth-child(1)').addClass('checked')
        pterscheckbox.find('div').addClass('ptersCheckboxInner')
        if($("#datepicker_fast").val()!=""){
          autoDateInput();
        }
      })

      $('._count .ptersCheckbox').parent('td').click(function(){
        $('._count div.checked').removeClass('checked ptersCheckboxInner')
        var pterscheckbox = $(this).find('div')
        $(this).find('div:nth-child(1)').addClass('checked')
        pterscheckbox.find('div').addClass('ptersCheckboxInner')
        $('#memberCount_add_fast').val(pterscheckbox.attr('data-count'))
        $('#memberCount_add_fast').addClass("dropdown_selected")
        check_dropdown_selected();

      })

      $('#price1').click(function(){
        var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
        var priceInputValue = 1000000 + Number(priceInputValue);
        $('#lecturePrice_add').val(numberWithCommas(priceInputValue))
        $('#lecturePrice_add_value').val(priceInputValue)

      })

      $('#price2').click(function(){
        var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
        var priceInputValue = 500000 + Number(priceInputValue);
        $('#lecturePrice_add').val(numberWithCommas(priceInputValue))
        $('#lecturePrice_add_value').val(priceInputValue)
      })

      $('#price3').click(function(){
        var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
        var priceInputValue = 100000 + Number(priceInputValue);
        $('#lecturePrice_add').val(numberWithCommas(priceInputValue))
        $('#lecturePrice_add_value').val(priceInputValue)
      })

      $('#price4').click(function(){
        var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
        var priceInputValue = 50000 + Number(priceInputValue);
        $('#lecturePrice_add').val(numberWithCommas(priceInputValue))
        $('#lecturePrice_add_value').val(priceInputValue)
      })

      $('#price5').click(function(){
        var priceInputValue = $('#lecturePrice_add').val().replace(/,/g, "")
        var priceInputValue = 10000 + Number(priceInputValue);
        $('#lecturePrice_add').val(numberWithCommas(priceInputValue))
        $('#lecturePrice_add_value').val(priceInputValue)
      })

      $('#price6').click(function(){
        $('#lecturePrice_add').val("")
        $('#lecturePrice_add_value').val(0)
      })

      $('#price1_2').click(function(){
        var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
        var priceInputValue = 1000000 + Number(priceInputValue);
        $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue))
        $('#lecturePrice_add_value_fast').val(priceInputValue)
      })

      $('#price2_2').click(function(){
        var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
        var priceInputValue = 500000 + Number(priceInputValue);
        $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue))
        $('#lecturePrice_add_value_fast').val(priceInputValue)
      })

      $('#price3_2').click(function(){
        var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
        var priceInputValue = 100000 + Number(priceInputValue);
        $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue))
        $('#lecturePrice_add_value_fast').val(priceInputValue)
      })

      $('#price4_2').click(function(){
        var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
        var priceInputValue = 50000 + Number(priceInputValue);
        $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue))
        $('#lecturePrice_add_value_fast').val(priceInputValue)
      })

      $('#price5_2').click(function(){
        var priceInputValue = $('#lecturePrice_add_2').val().replace(/,/g, "")
        var priceInputValue = 10000 + Number(priceInputValue);
        $('#lecturePrice_add_2').val(numberWithCommas(priceInputValue))
        $('#lecturePrice_add_value_fast').val(priceInputValue)
      })

      $('#price6_2').click(function(){
        $('#lecturePrice_add_2').val("")
        $('#lecturePrice_add_value_fast').val(0)
      })

      //빠른 입력 방식, 세부설정 방식 버튼 기능//////////////////////////////////////////////////


     function check_dropdown_selected(){ //모든 입력란을 채웠을때 상단 Bar의 체크 아이콘 활성화(색상변경: 검은색-->초록색)
        //var emailInput = $("#memberEmail_add").parent("div");
        var nameInput = $("#memberName_add").parent("div");
        var phoneInput = $("#memberPhone_add").parent("div");
        var countInput = $("#memberCount_add").parent("div");
        var startInput = $("#datepicker_add").parent("p");
        var endInput = $("#datepicker2_add").parent("p");

        var countInput_fast = $("#memberCount_add_fast");
        var dateInput_fast = $("#datepicker_fast").parent("p");

        var fast = $('#fast_check').val()

        if(fast=='1'){
            //(emailInput).hasClass("dropdown_selected")==true &&
            if((nameInput).hasClass("dropdown_selected")==true && (phoneInput).hasClass("dropdown_selected")==true &&(countInput).hasClass("dropdown_selected")==true&&(startInput).hasClass("dropdown_selected")==true&&(endInput).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('.submitBtn').addClass('submitBtnActivated')
                select_all_check=true;

            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('.submitBtn').removeClass('submitBtnActivated')
                select_all_check=false;
            }
        }
        else{
            //(emailInput).hasClass("dropdown_selected")==true &&
            if((nameInput).hasClass("dropdown_selected")==true && (phoneInput).hasClass("dropdown_selected")==true &&(countInput_fast).hasClass("dropdown_selected")==true&&(dateInput_fast).hasClass("dropdown_selected")==true){
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete-checked.png' style='width:100%;'>");
                $('.submitBtn').addClass('submitBtnActivated')
                select_all_check=true;

            }else{
                $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>");
                $('.submitBtn').removeClass('submitBtnActivated')
                select_all_check=false;
            }
        }
     }


     function autoDateInput(){

          /// 빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택///// 
          var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31]
          var selected = $('#datepicker_fast').val();
          var selectedDate = Number(selected.replace(/-/g, ""));
          var selectedD = $('._due div.checked').parent('td').attr('data-check'); // 1,2,3,6,12,99
          var selectedDue = Number(selectedD + '00');
          var finishDate =  selectedDate+selectedDue
          var yy = String(finishDate).substr(0,4);
          var mm = String(finishDate).substr(4,2);
          var dd = String(finishDate).substr(6,2);
          

          if(mm>12){ //해 넘어갈때 날짜처리
            //var finishDate = finishDate + 10000 - 1200
            var yy = Number(yy)+1;
            var mm = Number(mm)-12;
          }
          if(String(mm).length<2){
              var mm = "0"+mm;
          }
          var finishDate = yy +"-"+ mm +"-"+ dd
          if(dd>lastDay[Number(mm)-1]){
            var dd = Number(dd)-lastDay[Number(mm)-1]
            var mm = Number(mm)+1
            if(String(dd).length<2){
              var dd = "0"+dd
            }
            if(String(mm).length<2){
              var mm = "0"+mm
            }
            var finishDate = yy +"-"+ mm +"-"+ dd;
          }
          $('#memberDue_add_2').val(finishDate)
          $('#memberDue_add_2_fast').val(finishDate)
          if(selectedD==99){
            $('#memberDue_add_2').val("소진시까지")
            $('#memberDue_add_2_fast').val("9999-12-31")
          }

          if(selectedD==undefined){
            $('#memberDue_add_2').val("진행기간을 선택해주세요")
          }

          if($('#memberDue_add_2').val()!="진행기간을 선택해주세요" && $('#memberDue_add_2').val()!="" ){
            $('#memberDue_add_2').parent('div').addClass("dropdown_selected")
          }
          /// 빠른 입력방식에서 시작일자 선택했을때 종료일자 자동 선택/////
     }


     function limit_char(e){
      var limit =  /[~!@\#$%^&*\()\-=+_'|\:;\"\'\?.,/\\]/gi;
      var temp = $(e).val();
      if(limit.test(temp)){
        $(e).val(temp.replace(limit,""));
      };
     };


     $("#upbutton-check,.submitBtn").click(function(){
        var $form = $('#member-add-form-new');
         if(select_all_check==true){
            console.log('ajax')
           
                 //ajax 회원정보 입력된 데이터 송신
                 
                 $.ajax({
                    url:'/trainer/member_registration/',
                    type:'POST',
                    data:$form.serialize(),

                    beforeSend:function(){
                      // $('html').css("cursor","wait")
                      $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif')
                    },

                    //보내기후 팝업창 닫기
                    complete:function(){
                      closePopup()
                       if($('body').width()<600){
                          $('#page_managemember').show();
                        }
                        // $('html').css("cursor","auto")
                        $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png')
                      //alert('complete: 회원 정상 등록')
                      },

                    //통신성공시 처리
                    success:function(){
                        ajaxMemberData();
                      console.log('success')
                      },

                    //통신 실패시 처리
                    error:function(){
                      alert("error: 이미 등록된 회원인지 확인")
                    },
                 })
            
         }else{
            $('#inputError').fadeIn('slow')
            //입력값 확인 메시지 출력 가능
            console.log('submit ng')
         }
     })


	function ajaxMemberData(){

            $.ajax({
              url: '/trainer/get_member_list',
              dataType : 'html',

              beforeSend:function(){
              		beforeSend();
              },

              success:function(data){
              	var jsondata = JSON.parse(data);
              	nameArray =[];
              	phoneArray = [];
              	countArray = [];
              	startArray = [];
              	modifyDateArray = [];
              	emailArray = [];
              	endArray = [];
              	regCountArray = [];
              	availCountArray = [];

              	finishnameArray =[];
              	finishphoneArray = [];
              	finishcountArray = [];
              	finishstartArray = [];
              	finishmodifyDateArray = [];
              	finishemailArray = [];
              	finishendArray = [];

                  //처리 필요 - hk.kim 180110
                finishRegCountArray = [];
                finishAvailCountArray = [];

                nameArray =jsondata.nameArray;
              	phoneArray = jsondata.phoneArray;
              	countArray = jsondata.countArray;
              	startArray = jsondata.startArray;
              	modifyDateArray = jsondata.modifyDateArray;
              	emailArray = jsondata.emailArray;
              	endArray = jsondata.endArray;
              	regCountArray = jsondata.regCountArray;
              	availCountArray = jsondata.availCountArray;

              	finishnameArray =jsondata.finishnameArray;
              	finishphoneArray = jsondata.finishphoneArray;
              	finishcountArray = jsondata.finishcountArray;
              	finishstartArray = jsondata.finishstartArray;
              	finishmodifyDateArray = jsondata.finishmodifyDateArray;
              	finishemailArray = jsondata.finishemailArray;
              	finishendArray = jsondata.finishendArray;

                  //처리 필요 - hk.kim 180110
                finishRegCountArray = jsondata.finishRegCountArray;
                finishAvailCountArray = jsondata.finishAvailCountArray;


              },

              complete:function(){
              	completeSend();
              },

              error:function(){
                console.log('server error')
              }
            })
     }



      function beforeSend(){
        // $('html').css("cursor","wait");
        $('#upbutton-check img').attr('src','/static/user/res/ajax/loading.gif');
        $('.ajaxloadingPC').show();
        $('#shade').css({'z-index':'200'});
      }

      function completeSend(){
        //$('html').css("cursor","auto");
        $('#upbutton-check img').attr('src','/static/user/res/ptadd/btn-complete.png');
        $('.ajaxloadingPC').hide();
        $('#shade').css({'z-index':'100'});
        $('#shade').hide();
        //$('#calendar').show();
        //alert('complete: 일정 정상 등록')
      }

     function closePopup(){
        $('#page_addmember').fadeOut('fast');
        $('#shade3').fadeOut('fast');
        $('#float_btn').fadeIn('fast');
        $('#page-base').fadeIn();
        $('#page-base-addstyle').fadeOut();

        $('input,#memberDue_add_2').val("")
        $('._due div.checked').removeClass('checked ptersCheckboxInner')
        $('._count div.checked').removeClass('checked ptersCheckboxInner')
        $('p,.pters_input_custom').removeClass("dropdown_selected")
        $("#upbutton-check").html("<img src='/static/user/res/ptadd/btn-complete.png' style='width:100%;'>"); 
        $('.submitBtn').removeClass('submitBtnActivated')
     };
     


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

    function numberWithCommas(x) { //천단위 콤마 찍기
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

});