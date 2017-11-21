$(document).ready(function(){


      var newSales = sum(newSalesArrayThisMonth)
      $('#regiSales td:nth-child(3)').text(numberWithCommas(newSales)+" 원")
      
      var subsSales = sum(subsSalesArray)
      $('#subsSales td:nth-child(3)').text(numberWithCommas(subsSales)+" 원")

      var totalSales = newSales+subsSales
      $('#totalSales td:nth-child(3)').text(numberWithCommas(totalSales)+" 원")

      $('#subsSalesChild td:nth-child(3)').text(subsSalesArray.length+" 건")

      $('#regiSalesChild td:nth-child(3)').text(newSalesArrayThisMonth.length+" 건")

      $('#totalMember td:nth-child(3)').text(len+' 명')
      $('#newMember td:nth-child(3)').text(newSalesArrayThisMonth.length+" 명")



      $('#subsSales').click(function(){
        if($('#subsSalesChild').css('display')=="none"){
          $('#subsSalesChild').fadeIn('fast')
        }else{
          $('#subsSalesChild').fadeOut('fast')
        }
      })

      $('#regiSales').click(function(){
        if($('#regiSalesChild').css('display')=="none"){
          $('#regiSalesChild').fadeIn('fast')  
        }else{
          $('#regiSalesChild').fadeOut('fast')
        }
        
      })

      function sum(array) { //배열의 값 모두 더하기
        var result = 0;
        var len = array.length;
        for (var i = 0; i < len; i++){
          result += array[i];
        }
        return result
      }

      function numberWithCommas(x) { //천단위 콤마 찍기
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }


});