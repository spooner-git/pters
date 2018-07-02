import datetime
import json
import httplib2
from django.utils import timezone


def func_set_billing_schedule(customer_uid):
    today = timezone.now()
    today = today.replace(hour=14, minute=0)
    # next_year = int(month_first_day.strftime('%Y')) + 1
    this_month = int(today.strftime('%m'))
    # if this_month == 2:
    #     next_month_today = today + datetime.timedelta(days=28)
    # elif this_month == 1 or this_month == 3 or this_month == 5 or this_month == 7\
    #         or this_month == 8 or this_month == 10 or this_month == 12:
    #     next_month_today = today + datetime.timedelta(days=31)
    # else:
    #     next_month_today = today + datetime.timedelta(days=30)
    # current_time = timezone.now()
    next_month_today = today + datetime.timedelta(minute=5)
    today_unix_timestamp = today.timestamp()
    unix_timestamp = next_month_today.timestamp()

    token_result = func_get_payment_token()
    access_token = token_result['access_token']
    error = token_result['error']

    if error is None and access_token is not None:
        data = {
                'customer_uid': customer_uid,  # 카드(빌링키)와 1: 1 로 대응하는 값
                'schedules': [
                    {
                        'merchant_uid': today_unix_timestamp,  # 주문 번호
                        'schedule_at': unix_timestamp,  # 결제 시도 시각 in Unix Time Stamp.ex.다음 달  1 일
                        'amount': 3000,
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
