import datetime
import json
import logging

import httplib2
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from configs.const import USE, UN_USE, DISABLE, ALL_MEMBER, END_PAYMENT_MEMBER, ING_PAYMENT_MEMBER, NO_PAYMENT_MEMBER, \
    NEW_MEMBER, NEW_MEMBER_DAY
from configs import settings
from .models import PaymentInfoTb, ProductPriceTb, CouponTb, CouponMemberTb

logger = logging.getLogger(__name__)


def func_set_billing_schedule(customer_uid, pre_payment_info, paid_date):
    product_price_info = None
    access_token = func_get_imp_token()
    error = access_token['error']

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb_id=pre_payment_info.product_tb_id,
                                                            payment_type_cd=pre_payment_info.payment_type_cd,
                                                            period_month=pre_payment_info.period_month,
                                                            use=USE)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'

    if error is None:
        next_billing_date_time = datetime.datetime.combine(pre_payment_info.end_date, datetime.datetime.min.time())
        next_schedule_timestamp = next_billing_date_time.replace(hour=15, minute=0, second=0, microsecond=0).timestamp()

        merchant_uid = 'm_' + str(pre_payment_info.member_id) + '_' + pre_payment_info.product_tb_id\
                       + '_' + str(next_schedule_timestamp).split('.')[0]

        price = int(product_price_info.sale_price)
        name = product_price_info.product_tb.name + ' - ' + product_price_info.name
        next_start_date = pre_payment_info.end_date
        next_end_date = func_get_end_date(pre_payment_info.payment_type_cd,
                                          next_start_date, int(pre_payment_info.period_month), paid_date)
        next_start_date = next_start_date + datetime.timedelta(days=1)

        payment_info = PaymentInfoTb(member_id=pre_payment_info.member.member_id,
                                     product_tb_id=pre_payment_info.product_tb_id,
                                     payment_type_cd=pre_payment_info.payment_type_cd, customer_uid=customer_uid,
                                     start_date=next_start_date,
                                     end_date=next_end_date,
                                     paid_date=pre_payment_info.end_date,
                                     period_month=pre_payment_info.period_month,
                                     name=name,
                                     price=price,
                                     status='reserve',
                                     pay_method=pre_payment_info.pay_method,
                                     card_name=pre_payment_info.card_name,
                                     use=UN_USE)
        payment_info.save()

        merchant_uid = merchant_uid + '_' + str(payment_info.payment_info_id)

        payment_info.merchant_uid = merchant_uid
        payment_info.save()

        error = func_set_iamport_schedule(access_token['access_token'], name, price,
                                          customer_uid, merchant_uid, next_schedule_timestamp,
                                          pre_payment_info.member.name, pre_payment_info.member.user.email)
    return error


def func_set_billing_schedule_now(customer_uid, pre_payment_info, paid_date):
    product_price_info = None
    today = datetime.date.today()
    access_token = func_get_imp_token()
    error = access_token['error']

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb_id=pre_payment_info.product_tb_id,
                                                            payment_type_cd=pre_payment_info.payment_type_cd,
                                                            period_month=pre_payment_info.period_month,
                                                            use=USE)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'

    if error is None:
        next_schedule_timestamp = timezone.now() + timezone.timedelta(seconds=2)
        next_schedule_timestamp = next_schedule_timestamp.timestamp()
        merchant_uid = 'm_' + str(pre_payment_info.member_id) + '_' + pre_payment_info.product_tb_id\
                       + '_' + str(next_schedule_timestamp).split('.')[0]

        price = int(product_price_info.sale_price)
        name = product_price_info.product_tb.name + ' - ' + product_price_info.name
        next_start_date = today
        next_end_date = func_get_end_date(pre_payment_info.payment_type_cd, next_start_date,
                                          int(pre_payment_info.period_month), paid_date)

        payment_info = PaymentInfoTb(member_id=pre_payment_info.member.member_id,
                                     product_tb_id=pre_payment_info.product_tb_id,
                                     payment_type_cd=pre_payment_info.payment_type_cd, customer_uid=customer_uid,
                                     start_date=next_start_date, end_date=next_end_date,
                                     paid_date=pre_payment_info.end_date,
                                     period_month=pre_payment_info.period_month,
                                     name=name,
                                     price=price,
                                     status='reserve',
                                     pay_method=pre_payment_info.pay_method,
                                     card_name=pre_payment_info.card_name, use=UN_USE)
        payment_info.save()

        merchant_uid = merchant_uid + '_' + str(payment_info.payment_info_id)

        payment_info.merchant_uid = merchant_uid
        payment_info.save()

        error = func_set_iamport_schedule(access_token['access_token'], name, price,
                                          customer_uid, merchant_uid, next_schedule_timestamp,
                                          pre_payment_info.member.name, pre_payment_info.member.user.email)

    return error


def func_get_imp_token():

    access_token = None
    error = None

    data_token = {
        'imp_key': getattr(settings, "PTERS_IMP_REST_API_KEY", ''),  # REST API 키
        'imp_secret': getattr(settings, "PTERS_IMP_REST_API_SECRET", '')  # REST API Secret
    }
    body = json.dumps(data_token)
    h = httplib2.Http()

    resp, content = h.request("https://api.iamport.kr/users/getToken", method="POST", body=body,
                              headers={'Content-Type': 'application/json;'})

    json_data = content.decode('utf-8')
    json_loading_data = None
    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        if resp['status'] == '200':
            access_token = json_loading_data['response']['access_token']

    return {'access_token': access_token, 'error': error}


def func_resend_payment_info(customer_uid, merchant_uid, price):
    token_result = func_get_imp_token()
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
            error = '오류가 발생했습니다.'

    return error


def func_check_payment_price_info(product_id, payment_type_cd, input_price, period_month):
    error = None
    product_price_info = None
    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb_id=product_id,
                                                            payment_type_cd=payment_type_cd,
                                                            period_month=period_month, use=USE)
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    if error is None:
        price = int(product_price_info.sale_price)
        if price != input_price:
            error = '결제금액 오류가 발생했습니다.'

    return error


def func_get_end_date(payment_type_cd, start_date, month, date):

    end_date = start_date

    if payment_type_cd == 'PERIOD':
        next_month = int(end_date.strftime('%m')) + month
        next_year = int(end_date.strftime('%Y'))
        if next_month > 12:
            next_month %= 12
            next_year += 1

        # 다음 결제 달로 이동
        end_date = end_date.replace(year=next_year, month=next_month, day=1)

        # 직전달 결제일로 이동
        for i in range(1, 32):
            try:
                end_date = end_date.replace(day=date)
                break
            except ValueError:
                date -= 1

            if date <= 1:
                break
    else:
        # 인앱 결제를 통한 단일 결제의 경우 30일 이용권
        end_date += datetime.timedelta(days=30*month)

    return end_date


def func_get_end_date_by_day(start_date, day):

    end_date = start_date + datetime.timedelta(days=day)

    return end_date


def func_cancel_period_billing_schedule(customer_uid):
    token_result = func_get_imp_token()
    access_token = token_result['access_token']
    error = token_result['error']

    if error is None and access_token is not None:
        data = {
            'customer_uid': customer_uid,  # 카드(빌링키)와 1: 1 로 대응하는 값
        }

        body = json.dumps(data)
        h = httplib2.Http()
        resp, content = h.request("https://api.iamport.kr/subscribe/payments/unschedule", method="POST", body=body,
                                  headers={'Content-Type': 'application/json;',
                                           'Authorization': access_token})
        if resp['status'] != '200':
            error = '오류가 발생했습니다.'

    return error


def func_cancel_period_billing_schedule_by_merchant_uid(customer_uid, merchant_uid):
    token_result = func_get_imp_token()
    access_token = token_result['access_token']
    error = token_result['error']

    if error is None and access_token is not None:
        data = {
            'customer_uid': customer_uid,  # 카드(빌링키)와 1: 1 로 대응하는 값
            'merchant_uid': merchant_uid
        }

        body = json.dumps(data)
        h = httplib2.Http()
        resp, content = h.request("https://api.iamport.kr/subscribe/payments/unschedule", method="POST", body=body,
                                  headers={'Content-Type': 'application/json;',
                                           'Authorization': access_token})
        if resp['status'] != '200':
            error = '오류가 발생했습니다.'

    return error


# imp_uid 를 통해 결제 정보 가져오기
def func_get_payment_info_from_imp(imp_uid, access_token):

    error_message = None
    payment_info = None

    h = httplib2.Http()

    resp, content = h.request("https://api.iamport.kr/payments/"+str(imp_uid), method="GET",
                              headers={'Authorization': access_token})

    json_data = content.decode('utf-8')
    json_loading_data = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error_message = '오류가 발생했습니다.'
    except TypeError:
        error_message = '오류가 발생했습니다.'

    if error_message is None:
        if resp['status'] == '200':
            payment_info = json_loading_data['response']

    return payment_info


def func_set_iamport_schedule(access_token, name, price, customer_uid, merchant_uid, next_schedule_timestamp,
                              buyer_name, buyer_email):
    error = None
    data = {
        'customer_uid': customer_uid,  # 카드(빌링키)와 1: 1 로 대응하는 값
        'schedules': [
            {
                'merchant_uid': merchant_uid,  # 주문 번호
                'schedule_at': next_schedule_timestamp,  # 결제 시도 시각 in Unix Time Stamp.ex.다음 달  1 일
                'amount': price,
                'name': name,
                'buyer_name': buyer_name,
                'buyer_tel': '',
                'buyer_email': buyer_email
            }
        ]
    }

    body = json.dumps(data)
    h = httplib2.Http()
    resp, content = h.request("https://api.iamport.kr/subscribe/payments/schedule", method="POST", body=body,
                              headers={'Content-Type': 'application/json;',
                                       'Authorization': access_token})
    if resp['status'] != '200':
        error = '오류가 발생했습니다.'

    return error


def func_check_coupon_reg(coupon_cd, user_id, user_join_date):
    error = None

    today = datetime.date.today()
    coupon_info = None
    try:
        coupon_info = CouponTb.objects.get(coupon_cd=coupon_cd, use=USE)
        # 쿠폰 유효기간 체크
        if coupon_info.end_date < today:
            error = '오류 : 유효기간이 지난 쿠폰입니다.'
        # 쿠폰 갯수 체크
        if coupon_info.amount <= 0:
            error = '오류 : 쿠폰이 모두 소진됐습니다.'
        # 회원 직접 등록 가능 여부 체크
        if coupon_info.direct_reg_enable == DISABLE:
            error = '쿠폰 코드를 다시 확인해주세요.[2]'
    except ObjectDoesNotExist:
        error = '쿠폰 코드를 다시 확인해주세요.[3]'

    if error is None:
        new_member_check_date = today - datetime.timedelta(days=NEW_MEMBER_DAY)
        coupon_member_data = CouponMemberTb.objects.select_related(
            'coupon_tb__product_tb').filter(member_id=user_id, coupon_tb__coupon_cd=coupon_cd)

        # 중복 등록 가능 여부 체크
        if coupon_info.duplicate_enable == DISABLE and len(coupon_member_data) > 0:
            error = '이미 등록된 쿠폰입니다.'

        # target 체크
        if coupon_info.target != ALL_MEMBER:
            target = coupon_info.target
            payment_data = PaymentInfoTb.objects.filter(member_id=user_id,
                                                        status='paid',
                                                        use=USE)
            # 결제 했던 내역 count
            payment_count = payment_data.count()
            # 결제 진행중인 내역 count
            payment_ing_count = payment_data.filter(start_date__lte=today, end_date__gte=today).count()

            # 타겟이 신규 회원인 경우
            if target == NEW_MEMBER:
                # 한달보다 더 전에 가입한 경우 에러 표시
                if user_join_date < new_member_check_date:
                    error = '등록 가능한 쿠폰이 아닙니다.[1]'
            # 타겟이 결제를 한번도 한적 없는 회원인 경우
            elif target == NO_PAYMENT_MEMBER:
                # 결제 내역이 한번이라도 있으면 에러 표시
                if payment_count > 0:
                    error = '등록 가능한 쿠폰이 아닙니다.[2]'
            # 타겟이 결제를 하고있는 회원인 경우
            elif target == ING_PAYMENT_MEMBER:
                # 진행중인 결제가 없는 경우 에러 표시
                if payment_ing_count == 0:
                    error = '등록 가능한 쿠폰이 아닙니다.[3]'
            # 타겟이 결제 종료된 회원인 경우
            elif target == END_PAYMENT_MEMBER:
                # 결제 내역이 없거나 진행중인 결제내역이 있으면 에러 표시
                if payment_count == 0 or payment_ing_count > 0:
                    error = '등록 가능한 쿠폰이 아닙니다.[4]'
    return error


def func_check_coupon_use(coupon_cd, user_id, user_join_date):
    error = None

    today = datetime.date.today()
    coupon_info = None
    try:
        coupon_info = CouponTb.objects.get(coupon_cd=coupon_cd, use=USE)
        # 쿠폰 유효기간 체크
        if coupon_info.end_date < today:
            error = '오류 : 유효기간이 지난 쿠폰입니다.'
        # 쿠폰 갯수 체크
        if coupon_info.amount <= 0:
            error = '오류 : 쿠폰이 모두 소진됐습니다.'
        # 회원 직접 등록 가능 여부 체크
        # if coupon_info.direct_reg_enable == DISABLE:
        #     error = '쿠폰 코드를 다시 확인해주세요.[2]'
    except ObjectDoesNotExist:
        error = '쿠폰 코드를 다시 확인해주세요.[3]'

    if error is None:
        new_member_check_date = today - datetime.timedelta(days=NEW_MEMBER_DAY)
        coupon_member_data = CouponMemberTb.objects.select_related(
            'coupon_tb__product_tb').filter(member_id=user_id, coupon_tb__coupon_cd=coupon_cd)

        # 중복 등록 가능 여부 체크
        if coupon_info.duplicate_enable == DISABLE and len(coupon_member_data) > 0:
            error = '이미 등록된 쿠폰입니다.'

        # target 체크
        if coupon_info.target != ALL_MEMBER:
            target = coupon_info.target
            payment_data = PaymentInfoTb.objects.filter(member_id=user_id,
                                                        status='paid',
                                                        use=USE)
            # 결제 했던 내역 count
            payment_count = payment_data.count()
            # 결제 진행중인 내역 count
            payment_ing_count = payment_data.filter(start_date__lte=today, end_date__gte=today).count()

            # 타겟이 신규 회원인 경우
            if target == NEW_MEMBER:
                # 한달보다 더 전에 가입한 경우 에러 표시
                if user_join_date < new_member_check_date:
                    error = '등록 가능한 쿠폰이 아닙니다.[1]'
            # 타겟이 결제를 한번도 한적 없는 회원인 경우
            elif target == NO_PAYMENT_MEMBER:
                # 결제 내역이 한번이라도 있으면 에러 표시
                if payment_count > 0:
                    error = '등록 가능한 쿠폰이 아닙니다.[2]'
            # 타겟이 결제를 하고있는 회원인 경우
            elif target == ING_PAYMENT_MEMBER:
                # 진행중인 결제가 없는 경우 에러 표시
                if payment_ing_count == 0:
                    error = '등록 가능한 쿠폰이 아닙니다.[3]'
            # 타겟이 결제 종료된 회원인 경우
            elif target == END_PAYMENT_MEMBER:
                # 결제 내역이 없거나 진행중인 결제내역이 있으면 에러 표시
                if payment_count == 0 or payment_ing_count > 0:
                    error = '등록 가능한 쿠폰이 아닙니다.[4]'
    return error
