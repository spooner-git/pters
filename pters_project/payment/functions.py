import datetime
import json
import httplib2
import logging

from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone

from configs.const import USE, UN_USE

from .models import PaymentInfoTb, ProductPriceTb, BillingInfoTb, BillingCancelInfoTb

logger = logging.getLogger(__name__)


def func_set_billing_schedule(customer_uid, payment_user_info):
    error = None
    product_price_info = None
    try:
        billing_info = BillingInfoTb.objects.get(member_id=payment_user_info.member.member_id,
                                                 customer_uid=customer_uid, use=USE)
        billing_info.next_payment_date = payment_user_info.end_date
        billing_info.save()
    except ObjectDoesNotExist:
        error = '정기 결제 등록에 실패했습니다.'

    if error is None:
        payment_type_cd = payment_user_info.payment_type_cd
        product_id = payment_user_info.product_tb_id
        # price = payment_user_info.price
        date = int(billing_info.payed_date)

        next_billing_date_time = datetime.datetime.combine(payment_user_info.end_date, datetime.datetime.min.time())
        next_schedule_timestamp = next_billing_date_time.replace(hour=15, minute=0, second=0, microsecond=0)
        # next_schedule_timestamp = timezone.now() + timezone.timedelta(minutes=5)
        next_schedule_timestamp = next_schedule_timestamp.timestamp()
        token_result = func_get_payment_token()
        access_token = token_result['access_token']
        error = token_result['error']
        merchant_uid = 'm_' + str(payment_user_info.member_id) + '_' + payment_user_info.product_tb_id\
                       + '_' + str(next_schedule_timestamp).split('.')[0]

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb_id=product_id,
                                                            payment_type_cd=payment_type_cd,
                                                            period_month=payment_user_info.period_month,
                                                            use=USE)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'

    if error is None:
        price = int(product_price_info.sale_price * 1.1)
        name = product_price_info.product_tb.name + ' - ' + product_price_info.name

    if error is None:
        start_date = payment_user_info.end_date
        end_date = func_get_end_date(payment_type_cd, start_date, int(payment_user_info.period_month), date)
        start_date = start_date + datetime.timedelta(days=1)
        payment_info = PaymentInfoTb(member_id=payment_user_info.member.member_id,
                                     product_tb_id=product_id,
                                     payment_type_cd=payment_type_cd, customer_uid=customer_uid,
                                     start_date=start_date, end_date=end_date,
                                     paid_date=payment_user_info.end_date,
                                     period_month=payment_user_info.period_month,
                                     name=name,
                                     price=price,
                                     status='reserve',
                                     pay_method=payment_user_info.pay_method,
                                     card_name=payment_user_info.card_name, use=UN_USE)
        # payment_info.save()
        payment_info.save()
        merchant_uid = merchant_uid + '_' + str(payment_info.payment_info_id)
        payment_info.merchant_uid = merchant_uid
        payment_info.save()
    if error is None and access_token is not None:
        data = {
                'customer_uid': customer_uid,  # 카드(빌링키)와 1: 1 로 대응하는 값
                'schedules': [
                    {
                        'merchant_uid': merchant_uid,  # 주문 번호
                        'schedule_at': next_schedule_timestamp,  # 결제 시도 시각 in Unix Time Stamp.ex.다음 달  1 일
                        'amount': price,
                        'name': name,
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
            error = '오류가 발생했습니다.'
    return error


def func_set_billing_schedule_now(customer_uid, payment_user_info):
    error = None
    product_price_info = None
    try:
        billing_info = BillingInfoTb.objects.get(member_id=payment_user_info.member.member_id,
                                                 customer_uid=customer_uid, use=USE)
        # billing_info.next_payment_date = payment_user_info.end_date
        # billing_info.save()
    except ObjectDoesNotExist:
        error = '정기 결제 등록에 실패했습니다.'

    if error is None:
        payment_type_cd = payment_user_info.payment_type_cd
        product_id = payment_user_info.product_tb_id
        # price = payment_user_info.price
        date = int(billing_info.payed_date)

        # next_billing_date_time = datetime.datetime.combine(payment_user_info.end_date, datetime.datetime.min.time())
        # next_schedule_timestamp = next_billing_date_time.replace(hour=15, minute=0, second=0, microsecond=0)
        # next_schedule_timestamp = timezone.now() + timezone.timedelta(minutes=5)
        next_schedule_timestamp = timezone.now() + timezone.timedelta(seconds=2)
        next_schedule_timestamp = next_schedule_timestamp.timestamp()
        token_result = func_get_payment_token()
        access_token = token_result['access_token']
        error = token_result['error']
        merchant_uid = 'm_' + str(payment_user_info.member_id) + '_' + payment_user_info.product_tb_id\
                       + '_' + str(next_schedule_timestamp).split('.')[0]

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb_id=product_id,
                                                            payment_type_cd=payment_type_cd,
                                                            period_month=payment_user_info.period_month,
                                                            use=USE)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'

    if error is None:
        price = int(product_price_info.sale_price * 1.1)
        name = product_price_info.product_tb.name + ' - ' + product_price_info.name

    if error is None:
        start_date = payment_user_info.end_date
        end_date = func_get_end_date(payment_type_cd, start_date, int(payment_user_info.period_month), date)
        # start_date = start_date + datetime.timedelta(days=1)
        payment_info = PaymentInfoTb(member_id=payment_user_info.member.member_id,
                                     product_tb_id=product_id,
                                     payment_type_cd=payment_type_cd, customer_uid=customer_uid,
                                     start_date=start_date, end_date=end_date,
                                     paid_date=payment_user_info.end_date,
                                     period_month=payment_user_info.period_month,
                                     name=name,
                                     price=price,
                                     status='reserve',
                                     pay_method=payment_user_info.pay_method,
                                     card_name=payment_user_info.card_name, use=UN_USE)
        # payment_info.save()
        payment_info.save()
        billing_info.next_payment_date = end_date
        billing_info.save()
        merchant_uid = merchant_uid + '_' + str(payment_info.payment_info_id)
        payment_info.merchant_uid = merchant_uid
        payment_info.save()
    if error is None and access_token is not None:
        data = {
                'customer_uid': customer_uid,  # 카드(빌링키)와 1: 1 로 대응하는 값
                'schedules': [
                    {
                        'merchant_uid': merchant_uid,  # 주문 번호
                        'schedule_at': next_schedule_timestamp,  # 결제 시도 시각 in Unix Time Stamp.ex.다음 달  1 일
                        'amount': price,
                        'name': name,
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
            error = '오류가 발생했습니다.'

    # if error is None:
    #     func_set_billing_schedule(customer_uid, payment_info)

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
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

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
        price = int(product_price_info.sale_price * 1.1)
        if price != input_price:
            error = '결제금액 오류가 발생했습니다.'

    return error


def func_get_end_date(payment_type_cd, start_date, month, date):
    end_date = start_date
    if payment_type_cd == 'PERIOD':
        next_month_origin = int(end_date.strftime('%m')) + month
        next_month = next_month_origin
        origin_year = int(end_date.strftime('%Y'))
        if next_month_origin > 12:
            next_month = next_month_origin % 12
            if next_month == 0:
                next_month = 1

        # end_date = end_date + datetime.timedelta(days=1)
        # 다음 결제 달로 이동
        for i in range(1, 32):
            try:
                end_date = end_date.replace(month=next_month)
                break
            except ValueError:
                end_date = end_date - datetime.timedelta(days=1)

            if int(end_date.strftime('%d')) <= 1:
                break
        # 년도 변경 (2/29일 때문에 마지막에 변경)
        if next_month_origin > 12:
            end_date = end_date.replace(year=origin_year+1)

        # 다음달 날짜 확인
        end_date_day = int(end_date.strftime('%d'))
        if end_date_day != date:
            for i in range(1, 32):
                try:
                    end_date = end_date.replace(day=date)
                    break
                except ValueError:
                    date -= 1
                if date <= 1:
                    break
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
        error = '오류가 발생했습니다.'

    if error is None:
        json_data = content.decode('utf-8')
        try:
            json_loading_data = json.loads(json_data)
        except ValueError:
            error = '오류가 발생했습니다.'
        except TypeError:
            error = '오류가 발생했습니다.'

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
            'merchant_uid': merchant_uid
            }
    data = json.dumps(data)

    logger.error('refund::'+str(data))
    h = httplib2.Http()
    resp, content = h.request("https://api.iamport.kr/payments/cancel", method="POST",
                              headers={'Content-Type': 'application/json;',
                                       'Authorization': access_token}, body=data)
    if resp['status'] != '200':
        error = '통신중 에러가 발생했습니다.'

    if error is None:
        json_data = content.decode('utf-8')
        try:
            # json_loading_data = json.loads(json_data)
            json.loads(json_data)
        except ValueError:
            error = '오류가 발생했습니다.'
        except TypeError:
            error = '오류가 발생했습니다.'

    if error is not None:
        context['error'] = error

    return context


def func_add_billing_logic(custom_data, payment_result):
    context = {'error': None, 'payment_user_info': None}
    error = None
    end_date = None
    date = None
    customer_uid = None
    payment_info = None
    empty_period_billing_check = False
    today = datetime.date.today()
    payment_name = ''
    status = ''
    usage = USE
    if error is None:
        try:
            customer_uid = custom_data['customer_uid']
        except KeyError:
            customer_uid = None
        except TypeError:
            customer_uid = None
        except ValueError:
            customer_uid = None

    if error is None:
        try:
            payment_info = PaymentInfoTb.objects.filter(member_id=custom_data['user_id'],
                                                        product_tb_id=custom_data['product_id'],
                                                        end_date__gte=today,
                                                        use=USE).exclude(status='cancelled').latest('end_date')
        except ObjectDoesNotExist:
            payment_info = None
        # payment_user_info = PaymentInfoTb.objects.filter(member_id=custom_data['user_id'],
        #                                                  end_date__lt=datetime.date.today(),
        #                                                  use=USE).order_by('end_date')
        # if len(payment_user_info) > 0:
        #     payment_info = payment_user_info[0]

    if error is None:
        if payment_info is None:
            start_date = datetime.datetime.strptime(custom_data['start_date'], "%Y-%m-%d").date()
        else:
            start_date = payment_info.end_date
        date = int(start_date.strftime('%d'))

    if error is None:
        if today != start_date and custom_data['payment_type_cd'] == 'PERIOD':
            empty_period_billing_check = True

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb_id=custom_data['product_id'],
                                                            payment_type_cd=custom_data['payment_type_cd'],
                                                            period_month=custom_data['period_month'],
                                                            use=USE)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'

    if error is None:
        if not empty_period_billing_check:
            payment_name = payment_result['name']
            end_date = func_get_end_date(custom_data['payment_type_cd'], start_date, int(custom_data['period_month']),
                                         date)
            status = payment_result['status']
            usage = USE
        else:
            # payment_name = payment_result['name'] + ' - ' + product_price_info.name
            payment_name = payment_result['name']
            end_date = start_date
            status = 'pre_paid'
            usage = UN_USE

    if error is None:
        payment_info_check = PaymentInfoTb.objects.filter(merchant_uid=payment_result['merchant_uid']).count()
        if payment_info_check > 0:
            error = '이미 등록된 결제 정보입니다.'
        if custom_data['payment_type_cd'] == 'PERIOD':
            billing_product_data = BillingInfoTb.objects.filter(member_id=custom_data['user_id'],
                                                                product_tb_id=custom_data['product_id'],
                                                                use=USE)
            if len(billing_product_data) > 0:
                billing_product_data.update(use=UN_USE)
            billing_info_check = BillingInfoTb.objects.filter(customer_uid=customer_uid).count()
            if billing_info_check > 0:
                error = '이미 등록된 결제 정보입니다.'

    if error is None:
        try:
            with transaction.atomic():
                payment_info = PaymentInfoTb(member_id=custom_data['user_id'],
                                             product_tb_id=custom_data['product_id'],
                                             payment_type_cd=custom_data['payment_type_cd'],
                                             merchant_uid=payment_result['merchant_uid'],
                                             customer_uid=customer_uid,
                                             start_date=start_date, end_date=end_date,
                                             paid_date=today,
                                             period_month=custom_data['period_month'],
                                             price=int(payment_result['amount']),
                                             name=payment_name,
                                             imp_uid=payment_result['imp_uid'],
                                             channel=payment_result['channel'],
                                             card_name=payment_result['card_name'],
                                             buyer_email=payment_result['buyer_email'],
                                             status=status,
                                             fail_reason=payment_result['fail_reason'],
                                             currency=payment_result['currency'],
                                             pay_method=payment_result['pay_method'],
                                             pg_provider=payment_result['pg_provider'],
                                             receipt_url=payment_result['receipt_url'],
                                             buyer_name=payment_result['buyer_name'],
                                             # amount=int(payment_result['amount']),
                                             use=usage)
                # merchandise_type_cd_list = custom_data['merchandise_type_cd'].split('/')
                # for merchandise_type_cd_info in merchandise_type_cd_list:
                #     try:
                #         function_auth_info = FunctionAuthTb.objects.get(member_id=custom_data['user_id'],
                #                                                         function_auth_type_cd=merchandise_type_cd_info,
                #                                                         use=USE)
                #     except ObjectDoesNotExist:
                #         function_auth_info = FunctionAuthTb(member_id=custom_data['user_id'],
                #                                             function_auth_type_cd=merchandise_type_cd_info,
                #                                             reg_dt=timezone.now(),
                #                                             mod_dt=timezone.now(),
                #                                             use=USE)
                #     function_auth_info.payment_type_cd = custom_data['payment_type_cd']
                #     function_auth_info.expired_date = end_date
                #     function_auth_info.save()

                if custom_data['payment_type_cd'] == 'PERIOD':
                    billing_info = BillingInfoTb(member_id=str(custom_data['user_id']),
                                                 price=int(product_price_info.sale_price * 1.1),
                                                 name=payment_name,
                                                 card_name=payment_result['card_name'],
                                                 pay_method=payment_result['pay_method'],
                                                 product_tb_id=custom_data['product_id'],
                                                 period_month=custom_data['period_month'],
                                                 payment_type_cd=custom_data['payment_type_cd'],
                                                 merchant_uid=payment_result['merchant_uid'],
                                                 customer_uid=customer_uid,
                                                 payment_reg_date=datetime.date.today(),
                                                 next_payment_date=end_date,
                                                 payed_date=date,
                                                 state_cd='IP', use=USE)
                    billing_info.save()
                payment_info.save()

                context['payment_user_info'] = payment_info
        except TypeError:
            error = '오류가 발생했습니다.'
        except ValueError:
            error = '오류가 발생했습니다.'

    context['error'] = error
    return context


def func_update_billing_logic(payment_result):
    context = {'error': None, 'payment_user_info': None}
    error = None

    if error is None:
        try:
            payment_info = PaymentInfoTb.objects.get(merchant_uid=payment_result['merchant_uid'])
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'

    today = datetime.date.today()
    if error is None:
        try:
            with transaction.atomic():
                payment_info.paid_date = today
                payment_info.imp_uid = payment_result['imp_uid']
                payment_info.channel = payment_result['channel']
                payment_info.buyer_email = payment_result['buyer_email']
                if int(payment_result['amount']) == 0:
                    payment_info.status = 'pre_paid'
                else:
                    payment_info.status = payment_result['status']
                if payment_result['status'] != 'failed':
                    payment_info.card_name = payment_result['card_name']
                payment_info.price = int(payment_result['amount'])
                payment_info.fail_reason = payment_result['fail_reason']
                payment_info.currency = payment_result['currency']
                payment_info.pay_method = payment_result['pay_method']
                payment_info.pg_provider = payment_result['pg_provider']
                payment_info.receipt_url = payment_result['receipt_url']
                payment_info.buyer_name = payment_result['buyer_name']
                payment_info.use = USE
                payment_info.save()
                context['payment_user_info'] = payment_info
        except TypeError:
            error = '오류가 발생했습니다.'
        except ValueError:
            error = '오류가 발생했습니다.'

    if error is None:
        if payment_info.status == 'cancelled' and payment_info.payment_type_cd == 'PERIOD':
            payment_data = PaymentInfoTb.objects.filter(customer_uid=payment_info.customer_uid,
                                                        status='reserve',
                                                        payment_type_cd='PERIOD')
            check_billing_info = None
            try:
                billing_info = BillingInfoTb.objects.get(customer_uid=payment_info.customer_uid, use=USE)
                billing_info.state_cd = 'CANCEL'
                billing_info.save()
                check_billing_info = billing_info
            except ObjectDoesNotExist:
                check_billing_info = None

            if check_billing_info is not None:
                billing_cancel_info = BillingCancelInfoTb(billing_info_tb_id=billing_info.billing_info_id,
                                                          member_id=payment_info.member_id,
                                                          cancel_type='관리자',
                                                          cancel_reason='관리자 임의 취소',
                                                          use=USE)
                billing_cancel_info.save()
            if len(payment_data) > 0:
                payment_data.update(status='cancelled', use=UN_USE)
            error = func_cancel_period_billing_schedule(payment_info.customer_uid)

            if error is None:
                billing_list = BillingInfoTb.objects.filter(member_id=payment_info.member_id, state_cd='IP', use=USE)
                if len(billing_list) > 0:
                    for billing_list_info in billing_list:
                        billing_cancel_info = BillingCancelInfoTb(billing_info_tb_id=billing_list_info.billing_info_id,
                                                                  member_id=payment_info.member_id,
                                                                  cancel_type='관리자',
                                                                  cancel_reason='관리자 임의 취소',
                                                                  use=USE)
                        billing_cancel_info.save()
                        billing_list_info.state_cd = 'CANCEL'
                        billing_list_info.save()
                        payment_data_list = PaymentInfoTb.objects.filter(customer_uid=billing_list_info.customer_uid,
                                                                         status='reserve', payment_type_cd='PERIOD')
                        if len(payment_data_list) > 0:
                            payment_data_list.update(status='cancelled', use=UN_USE)
                        error = func_cancel_period_billing_schedule(billing_list_info.customer_uid)

        elif payment_info.status != 'paid' and payment_info.payment_type_cd == 'PERIOD':
            try:
                billing_info = BillingInfoTb.objects.get(member_id=payment_info.member_id,
                                                         customer_uid=payment_info.customer_uid,
                                                         use=USE)
                billing_info.state_cd = 'ERR'
                billing_info.save()
            except ObjectDoesNotExist:
                error = '정기 결제 정보를 불러오지 못했습니다.'
            payment_data = PaymentInfoTb.objects.filter(customer_uid=payment_info.customer_uid,
                                                        status='reserve',
                                                        payment_type_cd='PERIOD')
            payment_data.delete()
            error = func_cancel_period_billing_schedule(payment_info.customer_uid)

    context['error'] = error
    return context


def func_cancel_period_billing_schedule(customer_uid):
    token_result = func_get_payment_token()
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


def func_iamport_webhook_customer_billing_logic(custom_data, payment_result, merchant_uid, imp_uid, access_token):
    context = {}
    error = None
    customer_uid = None
    product_id = None
    today = datetime.date.today()
    empty_period_billing_check = False
    if custom_data is None:
        try:
            payment_user_info = PaymentInfoTb.objects.get(merchant_uid=merchant_uid)
            payment_type_cd = payment_user_info.payment_type_cd
            customer_uid = payment_user_info.customer_uid
            context['user_id'] = payment_user_info.member_id
        except ObjectDoesNotExist:
            error = '오류가 발생했습니다.'
            # error = '결제 정보 [정기결제 예약 스케쥴] 세부 사항 조회 에러'
    else:
        try:
            payment_type_cd = custom_data['payment_type_cd']
            product_id = custom_data['product_id']
            period_month = custom_data['period_month']
            context['user_id'] = custom_data['user_id']
        except KeyError:
            error = '오류가 발생했습니다.'
        except TypeError:
            error = '오류가 발생했습니다.'
        except ValueError:
            error = '오류가 발생했습니다.'

        try:
            customer_uid = custom_data['customer_uid']
        except KeyError:
            customer_uid = None
        except TypeError:
            customer_uid = None
        except ValueError:
            customer_uid = None

        try:
            payment_info = PaymentInfoTb.objects.filter(member_id=custom_data['user_id'],
                                                        product_tb_id=product_id,
                                                        use=USE).latest('end_date')
        except ObjectDoesNotExist:
            payment_info = None

        if payment_info is None:
            start_date = datetime.datetime.strptime(custom_data['start_date'], "%Y-%m-%d").date()
        else:
            start_date = payment_info.end_date

        if today != start_date and custom_data['payment_type_cd'] == 'PERIOD':
            empty_period_billing_check = True

    # if error is None:
    #     if not empty_period_billing_check:
    #         error = func_check_payment_price_info(custom_data['product_id'], custom_data['payment_type_cd'],
    #                                               payment_result['amount'], custom_data['period_month'])

    if error is None:
        if payment_result['status'] == 'paid':  # 결제 완료
            if error is None:
                # 정기 결제로 인한 webhook인 경우
                if custom_data is None:
                    payment_user_info_result = func_update_billing_logic(payment_result)
                else:
                    payment_user_info_result = func_add_billing_logic(custom_data, payment_result)

                if payment_user_info_result['error'] is None:
                    if payment_type_cd == 'PERIOD':
                        # 결제 정보 저장
                        # if error is None:
                        error = func_set_billing_schedule(customer_uid, payment_user_info_result['payment_user_info'])
                else:
                    error = payment_user_info_result['error']

            if error is not None:
                # 결제 취소 날리기 / 결제 오류 상태로 바꾸기
                func_send_refund_payment(imp_uid, merchant_uid, access_token)

        elif payment_result['status'] == 'ready':
            logger.info('ready Test 상태입니다..')
            payment_user_info_result = func_update_billing_logic(payment_result)
            # func_resend_payment_info(customer_uid, merchant_uid,
            #                          payment_result['amount'])
            if payment_user_info_result['error'] is not None:
                error = payment_user_info_result['error']
        elif payment_result['status'] == 'failed':  # 결제 오류 상태로 업데이트
            payment_user_info_result = func_update_billing_logic(payment_result)
            if payment_user_info_result['error'] is not None:
                error = payment_user_info_result['error']
        elif payment_result['status'] == 'cancelled':  # 결제 취소 상태로 업데이트
            payment_user_info_result = func_update_billing_logic(payment_result)
            # func_resend_payment_info(customer_uid, merchant_uid,
            #                          payment_result['amount'])
            if payment_user_info_result['error'] is not None:
                error = payment_user_info_result['error']
        else:  # 결제 오류 상태로 업데이트
            payment_user_info_result = func_update_billing_logic(payment_result)
            # func_resend_payment_info(customer_uid, merchant_uid,
            #                          payment_result['amount'])
            if payment_user_info_result['error'] is not None:
                error = payment_user_info_result['error']

    context['error'] = error

    return error
