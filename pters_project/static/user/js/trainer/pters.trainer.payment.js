$(document).ready(function(){
    //////////////////////////////메뉴들 탭 이동//////////////////////////////////////////////

    function payment_for_ios(payment_date , product_price_id){
        $.ajax({
            url: "/payment/payment_for_ios/", // 서비스 웹서버
            type: "POST",
            headers: {"Content-Type": "application/json"},
            data: JSON.stringify({
                product_price_id: product_price_id,
                start_date: payment_date
            }),

            beforeSend: function (xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
                beforeSend();
            },

            success: function (data) {
                var jsondata = JSON.parse(data);
                if (jsondata.messageArray.length > 0) {
                    msg = '결제에 실패하였습니다.';
                    msg += ' : ' + jsondata.messageArray;
                    url_move = "/payment/";
                } else {
                    msg = '결제가 완료되었습니다.';
                    url_move = "/payment/payment_history/";
                }
                alert(msg);
                location.href = url_move;

            },

            complete: function () {
                completeSend();
            },

            error: function () {
                console.log('server error');
            }
        });
    }

});