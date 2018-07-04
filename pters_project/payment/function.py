import datetime
import json
import httplib2
import logging

from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from configs.const import USE
from payment.models import PaymentInfoTb, ProductPriceTb

logger = logging.getLogger(__name__)


def func_set_billing_schedule(customer_uid, payment_user_info, billing_info):
    today = timezone.now()
    start_date = payment_user_info.start_date
    payment_type_cd = payment_user_info.payment_type_cd
    merchandise_type_cd = payment_user_info.merchandise_type_cd
    price = payment_user_info.price
    logger.info('test00')
    date = int(billing_info.payed_date)

    end_date = func_get_end_date(payment_type_cd, str(start_date), 1, date)
    end_date = datetime.datetime.combine(end_date, datetime.datetime.min.time())
    end_date = end_date.replace(hour=15, minute=0)
    # today_unix_timestamp = today.timestamp()
    next_schedule_timestamp = end_date.timestamp()

    token_result = func_get_payment_token()
    access_token = token_result['access_token']
    error = token_result['error']
    merchant_uid = 'pters_merchant_'+str(next_schedule_timestamp).split('.')[0]

    logger.info('test11:'+merchant_uid)
    logger.info('test22:'+str(next_schedule_timestamp))
    logger.info('price:'+str(price))
    if error is None and access_token is not None:
        data = {
                'customer_uid': customer_uid,  # 카드(빌링키)와 1: 1 로 대응하는 값
                'schedules': [
                    {
                        'merchant_uid': merchant_uid,  # 주문 번호
                        'schedule_at': next_schedule_timestamp,  # 결제 시도 시각 in Unix Time Stamp.ex.다음 달  1 일
                        'amount': price,
                        'name': 'PTERS - 월간 이용권 정기결제',
                        'buyer_name': payment_user_info.member.name,
                        'buyer_tel': '',
                        'buyer_email': payment_user_info.member.user.email
                    }
                ]
        }

        body = json.dumps(data)
        h = httplib2.Http()
        resp, content = h.request("https://api.iamport.kr/subscribe/payments/schedule", method="POST", body=body,
                                  headers={'Content-Type': 'application/json;',
                                           'Authorization': access_token})
        if resp['status'] != '200':
            error = '통신중 에러가 발생했습니다.'

        logger.info(str(payment_user_info.member.name) + '님 정기 결제 예약 등록 '
                    + str(payment_user_info.member_id) + ':' + str(resp))
    logger.info('test33')
    if error is None:

        payment_info = PaymentInfoTb(member_id=payment_user_info.member.member_id,
                                     merchandise_type_cd=merchandise_type_cd,
                                     payment_type_cd=payment_type_cd,
                                     merchant_uid=merchant_uid, customer_uid=customer_uid,
                                     start_date=start_date, end_date=end_date,
                                     price=price,
                                     mod_dt=timezone.now(), reg_dt=timezone.now(), use=USE)
        payment_info.save()

    logger.info('test44')
    return error


def func_get_payment_token():
    context = {'error': None, 'access_token': None}
    data_token = {
        'imp_key': "3714680457579852",  # REST API키
        'imp_secret': "2lsGAvxWcGqTtsjZcSK8LimgEuzYnJRq5j6GPEC1k3VOveNH6yQSQd8uIIt6rkwxEDdthPvBTqpoFd6M"
        # REST API Secret
    }

    body = json.dumps(data_token)
    h = httplib2.Http()

    resp, content = h.request("https://api.iamport.kr/users/getToken", method="POST", body=body,
                              headers={'Content-Type': 'application/json;'})

    json_data = content.decode('utf-8')
    json_loading_data = None
    error = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        if resp['status'] == '200':
            context['access_token'] = json_loading_data['response']['access_token']
    else:
        context['error'] = error

    return context


def func_resend_payment_info(customer_uid, merchant_uid, price):
    token_result = func_get_payment_token()
    access_token = token_result['access_token']
    error = token_result['error']

    if error is None and access_token is not None:
        data = {
                'customer_uid': customer_uid,  # 카드(빌링키)와 1: 1 로 대응하는 값
                'schedules': [
                    {
                        'customer_uid': customer_uid,  # 주문 번호
                        'merchant_uid': merchant_uid,  # 결제 시도 시각 in Unix Time Stamp.ex.다음 달  1 일
                        'amount': price,
                        'name': 'PTERS - 월간 이용권 정기결제',
                    }
                ]
        }

        body = json.dumps(data)
        h = httplib2.Http()
        resp, content = h.request("https://api.iamport.kr/subscribe/payments/again", method="POST", body=body,
                                  headers={'Content-Type': 'application/json;',
                                           'Authorization': access_token})
        if resp['status'] != '200':
            error = '통신중 에러가 발생했습니다.'

    return error


def func_check_payment_info(merchandise_type_cd, payment_type_cd, input_price):
    error = None
    product_price_info = None

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb__merchandise_type_cd=merchandise_type_cd,
                                                            payment_type_cd=payment_type_cd, use=1)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'

    if error is None:
        price = product_price_info.sale_price
        if price != input_price:
            error = '결제중 오류가 발생했습니다. 다시 시도해주세요.'

    return error


def func_get_end_date(payment_type_cd, start_date, month, date):
    end_date = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
    if payment_type_cd == 'PERIOD':
        next_month = int(end_date.strftime('%m')) % 12 + month
        # end_date = end_date + datetime.timedelta(days=1)
        test = True
        # 다음달로 이동
        while test:
            try:
                end_date = end_date.replace(month=next_month)
                test = False
            except ValueError:
                end_date = end_date - datetime.timedelta(days=1)

        # 다음달 날짜 확인
        end_date_day = int(end_date.strftime('%d'))
        if end_date_day != date:
            test = True
            while test:
                try:
                    end_date = end_date.replace(day=date)
                    test = False
                except ValueError:
                    date -= 1
    else:
        end_date += datetime.timedelta(days=30)

    return end_date


def func_get_payment_result(imp_uid, access_token):
    context = {'error': None, 'status': None}
    error = None
    json_loading_data = None
    h = httplib2.Http()
    resp, content = h.request("https://api.iamport.kr/payments/" + imp_uid, method="GET",
                              headers={'Authorization': access_token})
    if resp['status'] != '200':
        error = '통신중 에러가 발생했습니다.'

    if error is None:
        json_data = content.decode('utf-8')
        try:
            json_loading_data = json.loads(json_data)
        except ValueError:
            error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
        except TypeError:
            error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        if resp['status'] == '200':
            context['json_loading_data'] = json_loading_data
    else:
        context['error'] = error

    return context


def func_send_refund_payment(imp_uid, merchant_uid, access_token):
    context = {'error': None, 'status': None}
    error = None
    # json_loading_data = None

    data = {'imp_uid': imp_uid,
            'merchant_uid': merchant_uid}
    data = json.dumps(data)

    h = httplib2.Http()
    resp, content = h.request("https://api.iamport.kr/payments/cancel", method="POST",
                              headers={'Authorization': access_token}, body=data)
    if resp['status'] != '200':
        error = '통신중 에러가 발생했습니다.'

    if error is None:
        json_data = content.decode('utf-8')
        try:
            # json_loading_data = json.loads(json_data)
            json.loads(json_data)
        except ValueError:
            error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
        except TypeError:
            error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is not None:
        context['error'] = error

    #     if resp['status'] == '200':
    #         context['status'] = json_loading_data['response']['status']
    # else:

    return context
