import datetime
import json
import httplib2
from django.utils import timezone

from configs.const import USE
from payment.models import PaymentInfoTb


def func_set_billing_schedule(customer_uid, payment_user_info, billing_info):
    today = timezone.now()
    start_date = payment_user_info.end_date
    payment_type_cd = payment_user_info.payment_type_cd
    date = billing_info.payed_date
    end_date = start_date
    end_date_day = int(end_date.strftime('%d'))

    if payment_type_cd == 'PERIOD':
        next_month = int(end_date.strftime('%m')) % 12 + 1
        # end_date = end_date + datetime.timedelta(days=1)
        test = True
        while test:
            try:
                end_date = end_date.replace(month=next_month)
                test = False
            except ValueError:
                end_date = end_date - datetime.timedelta(days=1)

        end_date_day = int(end_date.strftime('%d'))

    if payment_type_cd == 'PERIOD':
        if end_date_day != date:
            test = True
            while test:
                try:
                    end_date = end_date.replace(days=int(date))
                    test = False
                except ValueError:
                    date -= 1

    today_unix_timestamp = today.timestamp()
    unix_timestamp = end_date.timestamp()

    token_result = func_get_payment_token()
    access_token = token_result['access_token']
    error = token_result['error']
    merchant_uid = 'pters_group_merchant_'+str(today_unix_timestamp).split('.')[0]
    merchandise_type_cd = payment_user_info.merchandise_type_cd
    price = payment_user_info.price
    if error is None and access_token is not None:
        data = {
                'customer_uid': customer_uid,  # 카드(빌링키)와 1: 1 로 대응하는 값
                'schedules': [
                    {
                        'merchant_uid': merchant_uid,  # 주문 번호
                        'schedule_at': unix_timestamp,  # 결제 시도 시각 in Unix Time Stamp.ex.다음 달  1 일
                        'amount': price,
                        'name': 'PTERS - 월간 이용권 정기결제',
                        'buyer_name': '김현기',
                        'buyer_tel': '01011112222',
                        'buyer_email': 'savekhg@gmail.com'
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

    if error is None:

        payment_info = PaymentInfoTb(member_id=payment_user_info.member.member_id,
                                     merchandise_type_cd=merchandise_type_cd,
                                     payment_type_cd=payment_type_cd,
                                     merchant_uid=merchant_uid, customer_uid=customer_uid,
                                     start_date=start_date, end_date=end_date,
                                     price=price,
                                     mod_dt=timezone.now(), reg_dt=timezone.now(), use=USE)
        payment_info.save()

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


def func_resend_payment_info(customer_uid, merchant_uid):
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
                        'amount': 3300,
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
