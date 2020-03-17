import datetime
import json
import logging
import collections
import httplib2

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import EmailMessage
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils import timezone
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from configs.const import USE, UN_USE, DISABLE, ALL_MEMBER, NO_PAYMENT_MEMBER, ING_PAYMENT_MEMBER, END_PAYMENT_MEMBER, \
    NEW_MEMBER, NEW_MEMBER
from configs import settings
from login.models import MemberTb

from .functions import func_set_billing_schedule, func_get_imp_token, func_resend_payment_info, \
    func_check_payment_price_info, func_get_end_date, func_cancel_period_billing_schedule, \
    func_set_billing_schedule_now, func_get_payment_info_from_imp, func_set_iamport_schedule, func_check_coupon_use, \
    func_get_end_date_by_day
from .models import PaymentInfoTb, BillingInfoTb, ProductTb, BillingCancelInfoTb, ProductPriceTb, \
    ProductFunctionAuthTb, IosReceiptCheckTb, CouponTb, CouponMemberTb

logger = logging.getLogger(__name__)


class PaymentView(LoginRequiredMixin, View):
    template_name = 'payment.html'

    def get(self, request):
        context = {}
        product_list = ProductTb.objects.filter(upper_product_id='1', use=USE).exclude(product_id='6').order_by('order')
        for product_info in product_list:
            product_price_list = ProductPriceTb.objects.filter(product_tb_id=product_info.product_id,
                                                               use=USE).order_by('order')
            sub_product_list = ProductTb.objects.filter(upper_product_id=product_info.product_id,
                                                        use=USE).order_by('order')
            product_info.price_list = product_price_list
            if len(sub_product_list) > 0:
                product_info.sub_product_list = sub_product_list
                for sub_product_info in sub_product_list:
                    sub_product_price_list = ProductPriceTb.objects.filter(product_tb_id=sub_product_info.product_id,
                                                                           use=USE).order_by('order')
                    sub_product_info.sub_price_list = sub_product_price_list
        payment_count = PaymentInfoTb.objects.filter(member_id=request.user.id).count()
        context['payment_count'] = payment_count
        context['payment_id'] = getattr(settings, "PAYMENT_ID", '')
        context['product_data'] = product_list

        return render(request, self.template_name, context)


# 회원이 결제 버튼을 누르는 경우 검사
def check_before_billing_logic(request):

    product_id = request.POST.get('product_id', None)
    payment_type_cd = request.POST.get('payment_type_cd', None)
    input_price = request.POST.get('price', 0)
    period_month = request.POST.get('period_month', 1)
    pay_method = request.POST.get('pay_method')
    merchant_uid = request.POST.get('merchant_uid')
    customer_uid = request.POST.get('customer_uid')
    payment_name = request.POST.get('name')
    today = datetime.date.today()
    payment_date = today
    start_date = today
    end_date = today
    context = {}
    error = None

    if product_id is None or product_id == '':
        error = '오류가 발생했습니다.[1]'
    if payment_type_cd is None or payment_type_cd == '':
        error = '오류가 발생했습니다.[2]'
    if input_price is None or input_price == '':
        error = '오류가 발생했습니다.[3]'
    if period_month is None or period_month == '':
        error = '오류가 발생했습니다.[4]'
    if pay_method is None or pay_method == '':
        error = '오류가 발생했습니다.[5]'

    # 사전 가격 검사 작업
    if error is None:
        if pay_method != 'iap':
            error = func_check_payment_price_info(product_id, payment_type_cd,
                                                  int(input_price), int(period_month))

    if error is None:
        # 프리미엄 기능때 사용
        if str(product_id) == '11':
            period_payment_counter = BillingInfoTb.objects.filter(member_id=request.user.id,
                                                                  product_tb_id='8',
                                                                  next_payment_date__gt=today,
                                                                  state_cd='IP',
                                                                  use=USE).count()
            if period_payment_counter == 0:
                error = '프리미엄 고객 전용 상품입니다. 먼저 프리미엄 기능을 구매해 주세요.'

        else:
            # 정기 결제 테이블에서 데이터를 가져오기
            period_payment_counter = BillingInfoTb.objects.filter(member_id=request.user.id,
                                                                  next_payment_date__gt=today,
                                                                  state_cd='IP',
                                                                  use=USE).count()
            # 현재 진행중인 정기 결제 기능이 있는 경우 오류 발
            if period_payment_counter > 0:
                error = '이용권을 변경하시려는 경우 이용권 변경 메뉴를 이용해주세요.'

    if error is None:
        # 현재 결제가된 이용권이 있는 경우 마지막 일자 + 1일 후부터 사용가능한 일자로 설정
        try:
            payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id, status='paid',
                                                        end_date__gte=today,
                                                        use=USE).latest('end_date')
            payment_date = payment_info.end_date
            start_date = payment_info.end_date + datetime.timedelta(days=1)
            # '일'을 확인해서 다음달 일자를 확인
            context['next_payment_date'] = str(payment_date)
            context['next_start_date'] = str(start_date)
            context['next_end_date'] = str(func_get_end_date(payment_type_cd, start_date,
                                                             int(period_month), int(payment_date.strftime('%d'))))
            start_date = payment_date
            end_date = start_date

        except ObjectDoesNotExist:
            # 결제가된 이용권이 없는 경우 오늘부터 사용가능한 일자 설정
            context['next_start_date'] = str(start_date)
            context['next_end_date'] = str(func_get_end_date(payment_type_cd, start_date,
                                                             int(period_month), int(payment_date.strftime('%d'))))
            context['next_payment_date'] = context['next_end_date']
            start_date = context['next_start_date']
            end_date = context['next_end_date']

    if error is None:

        try:
            with transaction.atomic():
                payment_info = PaymentInfoTb(member_id=request.user.id,
                                             product_tb_id=product_id,
                                             payment_type_cd=payment_type_cd,
                                             merchant_uid=merchant_uid,
                                             customer_uid=customer_uid,
                                             start_date=start_date, end_date=end_date,
                                             paid_date=today,
                                             period_month=period_month,
                                             price=int(input_price),
                                             name=payment_name,
                                             buyer_email=str(request.user.email),
                                             status='ready',
                                             pay_method=pay_method,
                                             buyer_name=str(request.user.first_name),
                                             use=UN_USE)

                if payment_type_cd == 'PERIOD':
                    billing_info = BillingInfoTb(member_id=request.user.id,
                                                 price=int(input_price),
                                                 name=payment_name,
                                                 pay_method=pay_method,
                                                 product_tb_id=product_id,
                                                 period_month=period_month,
                                                 payment_type_cd=payment_type_cd,
                                                 merchant_uid=merchant_uid,
                                                 customer_uid=customer_uid,
                                                 payment_reg_date=datetime.date.today(),
                                                 next_payment_date=context['next_payment_date'],
                                                 payed_date=int(payment_date.strftime('%d')),
                                                 state_cd='NP', use=UN_USE)
                    billing_info.save()
                payment_info.save()

        except TypeError:
            error = '오류가 발생했습니다.[6]'
        except ValueError:
            error = '오류가 발생했습니다.[7]'

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    return render(request, 'ajax/payment_error_info.html', context)


def check_finish_billing_logic(request):

    merchant_uid = request.POST.get('merchant_uid')
    imp_uid = request.POST.get('imp_uid')
    pre_payment_info = None
    pre_billing_info = None
    payment_info = None
    context = {}
    error = None
    access_token = func_get_imp_token()
    today = datetime.date.today()

    if access_token['error'] is None:
        payment_info = func_get_payment_info_from_imp(imp_uid, access_token['access_token'])
        if payment_info is None:
            error = '결제에 실패했습니다.[0]'
    else:
        error = access_token['error']

    if error is None:
        try:
            pre_payment_info = PaymentInfoTb.objects.get(merchant_uid=merchant_uid)
        except ObjectDoesNotExist:
            error = '결제에 실패했습니다.[1]'

    # print('check_finish::'+str(product_id))
    if error is None:
        try:
            # 기존 결제 정보 update
            with transaction.atomic():
                if pre_payment_info.status == 'ready':
                    pre_payment_info.paid_date = today
                    pre_payment_info.status = payment_info['status']
                    pre_payment_info.price = payment_info['amount']
                    if int(payment_info['amount']) == 0:
                        pre_payment_info.status = 'pre_paid'
                    pre_payment_info.imp_uid = payment_info['imp_uid']
                    pre_payment_info.channel = payment_info['channel']
                    pre_payment_info.buyer_email = payment_info['buyer_email']
                    pre_payment_info.receipt_url = payment_info['receipt_url']
                    pre_payment_info.buyer_name = payment_info['buyer_name']
                    pre_payment_info.pg_provider = payment_info['pg_provider']
                    pre_payment_info.fail_reason = payment_info['fail_reason']
                    pre_payment_info.currency = payment_info['currency']
                    pre_payment_info.card_name = payment_info['card_name']
                    pre_payment_info.use = USE
                    pre_payment_info.save()

                    # 정기 결제인 경우 정보 update
                    if pre_payment_info.payment_type_cd == 'PERIOD':
                        before_billing_data = BillingInfoTb.objects.filter(
                            member_id=pre_payment_info.member_id,
                            use=USE).exclude(customer_uid=pre_payment_info.customer_uid)
                        try:
                            pre_billing_info = BillingInfoTb.objects.get(customer_uid=pre_payment_info.customer_uid)
                        except ObjectDoesNotExist:
                            error = '결제에 실패했습니다.[2]'

                        if error is None:
                            if payment_info['status'] == 'paid':
                                pre_billing_info.state_cd = 'IP'
                                pre_billing_info.next_payment_date = pre_payment_info.end_date
                                if len(before_billing_data) > 0:
                                    before_billing_data.update(use=UN_USE)
                                pre_billing_info.use = USE
                            elif payment_info['status'] == 'failed':
                                pre_billing_info.state_cd = 'ERR'
                            elif payment_info['status'] == 'cancelled':  # 결제 취소 상태로 업데이트
                                pre_billing_info.state_cd = 'CANCEL'
                            else:  # 결제 오류 상태로 업데이트
                                pre_billing_info.state_cd = 'ERR'
                            pre_billing_info.card_name = payment_info['card_name']
                            pre_billing_info.save()

        except TypeError:
            error = '오류가 발생했습니다.[2]'
        except ValueError:
            error = '오류가 발생했습니다.[3]'
    if error is not None:
        logger.error('[결제 오류]:' + str(error))

    return render(request, 'ajax/payment_error_info.html', context)


# import 예약 로직
@csrf_exempt
def billing_check_logic(request):

    merchant_uid = request.POST.get('merchant_uid')
    imp_uid = request.POST.get('imp_uid')
    pre_payment_info = None
    pre_billing_info = None
    payment_info = None
    member_info = None
    context = {}
    error = None
    access_token = func_get_imp_token()
    today = datetime.date.today()
    info_message = ''

    if access_token['error'] is None:
        payment_info = func_get_payment_info_from_imp(imp_uid, access_token['access_token'])
        if payment_info is None:
            error = '결제에 실패했습니다.[0]'
    else:
        error = access_token['error']

    if error is None:
        try:
            pre_payment_info = PaymentInfoTb.objects.get(merchant_uid=merchant_uid)
        except ObjectDoesNotExist:
            error = '결제에 실패했습니다.[1]'

    if error is None:
        try:
            # 기존 결제 정보 update
            with transaction.atomic():
                pre_payment_info.paid_date = today
                pre_payment_info.status = payment_info['status']
                pre_payment_info.price = payment_info['amount']
                if int(payment_info['amount']) == 0:
                    pre_payment_info.status = 'pre_paid'
                pre_payment_info.imp_uid = payment_info['imp_uid']
                pre_payment_info.channel = payment_info['channel']
                pre_payment_info.buyer_email = payment_info['buyer_email']
                pre_payment_info.receipt_url = payment_info['receipt_url']
                pre_payment_info.buyer_name = payment_info['buyer_name']
                pre_payment_info.pg_provider = payment_info['pg_provider']
                pre_payment_info.fail_reason = payment_info['fail_reason']
                pre_payment_info.currency = payment_info['currency']
                pre_payment_info.card_name = payment_info['card_name']
                pre_payment_info.use = USE
                pre_payment_info.save()

                # 정기 결제인 경우 정보 update
                if pre_payment_info.payment_type_cd == 'PERIOD':
                    before_billing_data = BillingInfoTb.objects.filter(
                        member_id=pre_payment_info.member_id,
                        use=USE).exclude(customer_uid=pre_payment_info.customer_uid)
                    try:
                        pre_billing_info = BillingInfoTb.objects.get(customer_uid=pre_payment_info.customer_uid)
                    except ObjectDoesNotExist:
                        error = '결제에 실패했습니다.[2]'

                    if error is None:
                        if payment_info['status'] == 'paid':
                            pre_billing_info.state_cd = 'IP'
                            pre_billing_info.next_payment_date = pre_payment_info.end_date
                            pre_billing_info.use = USE
                            if len(before_billing_data) > 0:
                                before_billing_data.update(use=UN_USE)
                            info_message = '결제 완료'
                        elif payment_info['status'] == 'failed':
                            pre_billing_info.state_cd = 'ERR'
                            info_message = '결제 실패'
                        elif payment_info['status'] == 'cancelled':  # 결제 취소 상태로 업데이트
                            pre_billing_info.state_cd = 'CANCEL'
                            info_message = '결제 취소'
                        else:  # 결제 오류 상태로 업데이트
                            pre_billing_info.state_cd = 'ERR'
                            info_message = '에러 발생'
                        pre_billing_info.card_name = payment_info['card_name']
                        pre_billing_info.save()

                        if payment_info['status'] == 'paid':
                            # 정상 결제, 정기 결제인 경우 예약
                            error = func_set_billing_schedule(pre_payment_info.customer_uid,
                                                              pre_payment_info, int(pre_billing_info.payed_date))

                        else:
                            # 결제 오류인 경우 iamport 상의 예약 제거
                            error = func_cancel_period_billing_schedule(pre_payment_info.customer_uid)
                            reserve_payment_data = PaymentInfoTb.objects.filter(
                                customer_uid=pre_payment_info.customer_uid, status='reserve')
                            reserve_payment_data.delete()

        except TypeError:
            error = '오류가 발생했습니다.[2]'
        except ValueError:
            error = '오류가 발생했습니다.[3]'

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=pre_payment_info.member_id)
        except ObjectDoesNotExist:
            member_info = None

    if error is None:
        if member_info is not None:
            logger.info(str(member_info.name) + '님 '+info_message+' ['
                        + str(member_info.member_id) + ']' + str(merchant_uid))

            email = EmailMessage('[PTERS 결제]' + member_info.name + '회원', info_message + ':' + str(timezone.now()),
                                 to=['support@pters.co.kr'])
            email.send()
    else:
        if member_info is not None:
            logger.error(str(member_info.name) + '님 '+info_message+' ['
                         + str(member_info.member_id) + ']' + str(error))
        else:
            logger.error('[결제 오류]:' + str(error))

    return render(request, 'ajax/payment_error_info.html', context)


# 정기 결제 취소 기능
def cancel_period_billing_logic(request):
    customer_uid = request.POST.get('customer_uid', '')
    cancel_type = request.POST.get('cancel_type', '')
    cancel_reason = request.POST.get('cancel_reason', '')
    context = {'error': None}
    billing_info = None
    error = None

    try:
        billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid, use=USE)
    except ObjectDoesNotExist:
        error = '정기 결제 정보를 불러오지 못했습니다.'

    if error is None:
        billing_cancel_info = BillingCancelInfoTb(billing_info_tb_id=billing_info.billing_info_id,
                                                  member_id=request.user.id,
                                                  cancel_type=cancel_type,
                                                  cancel_reason=cancel_reason,
                                                  use=USE)
        billing_cancel_info.save()
        billing_info.state_cd = 'ST'
        billing_info.save()

    if error is None:
        # 예약된 일정 취소
        error = func_cancel_period_billing_schedule(customer_uid)

    if error is None:
        payment_data = PaymentInfoTb.objects.filter(customer_uid=customer_uid,
                                                    status='reserve',
                                                    payment_type_cd='PERIOD')
        if len(payment_data) > 0:
            payment_data.update(status='cancelled', use=UN_USE)

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


# 정기 결제 재시작 기능 - 확인 필요
def restart_period_billing_logic(request):
    customer_uid = request.POST.get('customer_uid', '')
    next_page = request.POST.get('next_page', '')
    context = {'error': None}
    error = None
    today = datetime.date.today()
    date = int(today.strftime('%d'))

    if error is None:
        try:
            billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid, use=USE)
            if date != billing_info.payed_date:
                billing_info.payed_date = date
            billing_info.state_cd = 'IP'
            billing_info.save()
        except ObjectDoesNotExist:
            error = '정기 결제 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            pre_payment_info = PaymentInfoTb.objects.filter(status='paid',
                                                            member_id=request.user.id, customer_uid=customer_uid,
                                                            payment_type_cd='PERIOD').latest('end_date')
        except ObjectDoesNotExist:
            pre_payment_info = None

        try:
            payment_info = PaymentInfoTb.objects.filter(Q(status='cancelled') | Q(status='failed')
                                                        | Q(status='pre_paid'),
                                                        member_id=request.user.id, customer_uid=customer_uid,
                                                        payment_type_cd='PERIOD').latest('end_date')
        except ObjectDoesNotExist:
            payment_info = None

        if pre_payment_info is not None:
            if pre_payment_info.end_date <= today:
                # 결제일이 지난 경우 오늘 바로 결제를 시도한다.
                pre_payment_info.end_date = today
                error = func_set_billing_schedule_now(customer_uid, pre_payment_info, date)
            else:
                # 결제일이 지나지 않은 경우 예약을 다시 생성한다.
                error = func_set_billing_schedule(customer_uid, pre_payment_info, date)
        else:
            if payment_info is not None:
                # 오늘 바로 결제를 시도한다.
                payment_info.end_date = today
                error = func_set_billing_schedule_now(customer_uid, payment_info, date)

    context['error'] = error
    if error is not None:
        messages.error(request, error)
        logger.error(str(request.user.first_name) + '(' + str(request.user.id) + ')님 재결제 신청 오류:' + str(error))
    else:
        logger.info(str(request.user.first_name) + '(' + str(request.user.id) + ')님 재결제 신청 완료')

    context['error'] = error
    return redirect(next_page)


# 정기 결제 일시정지 해제 기능 - 확인 필요
def clear_pause_period_billing_logic(request):
    customer_uid = request.POST.get('customer_uid', '')
    next_page = request.POST.get('next_page', '')

    context = {'error': None}
    error = None
    today = datetime.date.today()
    date = int(today.strftime('%d'))

    if error is None:
        try:
            pre_payment_info = PaymentInfoTb.objects.filter(status='paid',
                                                            member_id=request.user.id, customer_uid=customer_uid,
                                                            payment_type_cd='PERIOD').latest('end_date')
        except ObjectDoesNotExist:
            pre_payment_info = None

        try:
            payment_info = PaymentInfoTb.objects.filter(Q(status='cancelled') | Q(status='failed')
                                                        | Q(status='pre_paid'),
                                                        member_id=request.user.id, customer_uid=customer_uid,
                                                        payment_type_cd='PERIOD').latest('end_date')
        except ObjectDoesNotExist:
            payment_info = None

        if pre_payment_info is not None:
            if pre_payment_info.end_date <= today:
                # 결제일이 지난 경우 오늘 바로 결제를 시도한다.
                pre_payment_info.end_date = today
                error = func_set_billing_schedule_now(customer_uid, pre_payment_info, date)
            else:
                # 결제일이 지나지 않은 경우 예약을 다시 생성한다.
                error = func_set_billing_schedule(customer_uid, pre_payment_info, date)
        else:
            if payment_info is not None:
                # 오늘 바로 결제를 시도한다.
                payment_info.end_date = today
                error = func_set_billing_schedule_now(customer_uid, payment_info, date)

    if error is None:
        try:
            billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid, use=USE)
            if date != billing_info.payed_date:
                billing_info.payed_date = date
            billing_info.state_cd = 'IP'
            billing_info.save()
        except ObjectDoesNotExist:
            error = '정기 결제 정보를 불러오지 못했습니다.'

    context['error'] = error
    if error is not None:
        messages.error(request, error)
        logger.error(str(request.user.first_name) + '(' + str(request.user.id) + ')님 재결제 신청 오류:' + str(error))
    else:
        logger.info(str(request.user.first_name) + '(' + str(request.user.id) + ')님 재결제 신청 완료:')

    context['error'] = error
    return redirect(next_page)


# 정기 결제 카드 제거 기능 - 확인 필요
def delete_period_billing_logic(request):
    customer_uid = request.POST.get('customer_uid', '')
    next_page = request.POST.get('next_page', '')
    error = None
    billing_info = None

    if error is None:
        try:
            billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid, use=USE)
        except ObjectDoesNotExist:
            error = '정기 결제 정보를 불러오지 못했습니다.'
    if error is None:
        if billing_info.state_cd == 'IP':
            error = '정기 결제 진행중 상태에서는 삭제할수 없습니다.'
        else:
            billing_info.use = UN_USE
            billing_info.save()
            error = '정기 결제 카드가 정상적으로 삭제됐습니다.'

    if error is not None:
        messages.error(request, error)
        logger.error(str(request.user.first_name) + '(' + str(request.user.id) + ')님 정기 결제 카드 삭제 신청 :' + str(error))

    return redirect(next_page)


def update_period_billing_logic(request):
    # json_data = request.body.decode('utf-8')
    # json_loading_data = None
    error = None
    # customer_uid = None
    customer_uid = request.POST.get('customer_uid')
    # try:
    #     json_loading_data = json.loads(json_data)
    # except ValueError:
    #     error = '오류가 발생했습니다.'
    # except TypeError:
    #     error = '오류가 발생했습니다.'

    # if error is None:
    #     customer_uid = json_loading_data['customer_uid']
    # next_page = request.POST.get('next_page', '')
    context = {'error': None}
    payment_data = None
    billing_info = None
    if error is None:
        payment_data = PaymentInfoTb.objects.filter(customer_uid=customer_uid,
                                                    status='reserve',
                                                    payment_type_cd='PERIOD')
    if error is None:
        try:
            billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid)
        except ObjectDoesNotExist:
            error = '정기 결제 정보를 불러오지 못했습니다.'

    if error is None:
        error = func_cancel_period_billing_schedule(customer_uid)

    if error is None:
        billing_info.state_cd = 'DEL'
        billing_info.use = UN_USE
        billing_info.save()

    if error is None:
        if len(payment_data) > 0:
            payment_data.update(status='cancelled', use=UN_USE)

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


def update_payment_product_info_logic(request):
    update_product_id = request.POST.get('update_product_id', '')
    update_product_name = request.POST.get('update_product_name', '')
    update_product_price = request.POST.get('update_product_price', '')
    update_merchant_uid = request.POST.get('update_merchant_uid', '')
    remain_product_price = request.POST.get('remain_product_price', '')
    update_date = request.POST.get('update_date', '')

    error = None
    context = {'error': None}
    product_price_info = None
    next_schedule_timestamp = ''
    payment_info = None
    current_payment_info = None
    today = datetime.date.today()

    payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                payment_type_cd='PERIOD',
                                                status='reserve',
                                                use=UN_USE).order_by('-end_date')
    if len(payment_data) > 0:
        payment_info = payment_data[0]
    else:
        error = '오류가 발생했습니다.[-1]'
    current_payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                        payment_type_cd='PERIOD',
                                                        status='paid', use=USE).order_by('-payment_info_id')
    if len(current_payment_data) > 0:
        current_payment_info = current_payment_data[0]
        if current_payment_info.merchant_uid == '':
            error = '다음 결제일까지 변경이 불가합니다.'
    else:
        error = '오류가 발생했습니다.[0]'

    if update_product_id == '' or update_product_id is None:
        error = '오류가 발생했습니다.[1]'
    if update_product_name == '' or update_product_name is None:
        error = '오류가 발생했습니다.[2]'
    if update_product_name == '' or update_product_price is None:
        error = '오류가 발생했습니다.[3]'
    if update_merchant_uid == '' or update_merchant_uid is None:
        error = '오류가 발생했습니다.[4]'
    if update_date == '' or update_date is None:
        error = '오류가 발생했습니다.[5]'

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb_id=update_product_id, payment_type_cd='PERIOD',
                                                            period_month=1)
            if str(product_price_info.sale_price) != str(update_product_price):
                error = '결제 금액에 오류가 발생했습니다.'
        except ObjectDoesNotExist:
            error = '상품 정보를 불러오지 못했습니다.[0]'

    if error is None:
        # try:
        #     # 기존 결제 정보 update
        #     with transaction.atomic():
        # 관련 데이터 취소하기
        error = func_cancel_period_billing_schedule(payment_info.customer_uid)

        if error is None:
            # 예약 데이터 업데이트
            payment_info.name = update_product_name
            payment_info.product_tb_id = update_product_id
            payment_info.merchant_uid = update_merchant_uid
            payment_info.paid_date = str(update_date)
            payment_info.start_date = str(update_date)
            payment_info.end_date = func_get_end_date(payment_info.payment_type_cd,
                                                      datetime.datetime.strptime(str(update_date), '%Y-%m-%d'),
                                                      int(payment_info.period_month),
                                                      int(str(update_date).split('-')[2]))
            payment_info.price = int(update_product_price)
            payment_info.save()
            current_payment_info.end_date = str(today)
            current_payment_info.save()
            change_payment_info = PaymentInfoTb(member_id=request.user.id,
                                                product_tb_id=update_product_id,
                                                payment_type_cd='CHANGE',
                                                merchant_uid='',
                                                customer_uid=current_payment_info.customer_uid,
                                                start_date=str(today),
                                                end_date=str(update_date),
                                                paid_date=str(today),
                                                period_month=1,
                                                price=0,
                                                name=product_price_info.product_tb.name + ' - 상품 변경',
                                                buyer_email=str(request.user.email),
                                                status='paid',
                                                pay_method='card',
                                                card_name='상품 변경',
                                                buyer_name=str(request.user.first_name),
                                                use=USE)
            change_payment_info.save()

            # 정기결제 결제 정보 업데이트
            try:
                billing_info = BillingInfoTb.objects.get(customer_uid=payment_info.customer_uid, use=USE)
                billing_info.product_tb_id = update_product_id
                billing_info.name = product_price_info.product_tb.name + ' - ' + product_price_info.name
                billing_info.price = int(update_product_price)
                billing_info.next_payment_date = str(update_date)
                billing_info.payed_date = str(update_date).split('-')[2]
                billing_info.save()
                # 정기 결제 다음 결제일을 자동 결제 예약 시간으로 설정
                next_billing_date_time = datetime.datetime.combine(
                    datetime.datetime.strptime(str(update_date), '%Y-%m-%d'),
                    datetime.datetime.min.time())
                next_schedule_timestamp = next_billing_date_time.replace(hour=15, minute=0, second=0,
                                                                         microsecond=0).timestamp()
            except ObjectDoesNotExist:
                error = '정기 결제 정보를 불러오지 못했습니다.'

        if error is None:
            token_result = func_get_imp_token()
            access_token = token_result['access_token']
            error = token_result['error']
            if error is None:
                # iamport 정기 결제 예약 신청
                error = func_set_iamport_schedule(access_token, update_product_name,
                                                  int(product_price_info.sale_price),
                                                  payment_info.customer_uid, update_merchant_uid,
                                                  next_schedule_timestamp,
                                                  str(request.user.first_name), str(request.user.email))
        #         if error is not None:
        #             raise InternalError
        #
        # except TypeError:
        #     error = '오류가 발생했습니다.[0]'
        # except ValueError:
        #     error = '오류가 발생했습니다.[1]'
        # except IntegrityError:
        #     error = '오류가 발생했습니다.[2]'
        # except InternalError:
        #     error = error

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


def update_reserve_product_info_logic(request):
    customer_uid = request.POST.get('customer_uid', '')
    change_product_id = request.POST.get('change_product_id', '')

    error = None
    context = {'error': None}
    product_price_info = None
    next_schedule_timestamp = ''

    if customer_uid == '' or customer_uid is None:
        error = '결제 정보를 불러오지 못했습니다.'

    if change_product_id == '' or change_product_id is None:
        error = '결제 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_id=change_product_id, payment_type_cd='PERIOD',
                                                            period_month=1)
        except ObjectDoesNotExist:
            error = '상품 정보를 불러오지 못했습니다.[0]'

    if error is None:
        try:
            # 기존 결제 정보 update
            with transaction.atomic():
                # 관련 데이터 취소하기
                error = func_cancel_period_billing_schedule(customer_uid)

                if error is None:
                    # 예약 데이터 삭제하기
                    payment_data = PaymentInfoTb.objects.filter(customer_uid=customer_uid,
                                                                status='reserve',
                                                                payment_type_cd='PERIOD')
                    payment_data.delete()

                    # 정기결제 결제 정보 업데이트
                    try:
                        billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid, use=USE)
                        billing_info.product_tb_id = change_product_id
                        billing_info.name = product_price_info.product_tb.name + ' - ' + product_price_info.name
                        billing_info.price = int(product_price_info.sale_price)
                        billing_info.save()
                        # 정기 결제 다음 결제일을 자동 결제 예약 시간으로 설정
                        next_billing_date_time = datetime.datetime.combine(billing_info.next_payment_date,
                                                                           datetime.datetime.min.time())
                        next_schedule_timestamp = next_billing_date_time.replace(hour=15, minute=0, second=0,
                                                                                 microsecond=0).timestamp()
                    except ObjectDoesNotExist:
                        error = '정기 결제 정보를 불러오지 못했습니다.'

                if error is None:
                    # iamport 상의 예약 제거
                    error = func_cancel_period_billing_schedule(customer_uid)

                if error is None:
                    token_result = func_get_imp_token()
                    access_token = token_result['access_token']
                    error = token_result['error']
                    if error is None:
                        # merchant_uid 값 셋팅
                        merchant_uid = 'm_' + str(request.user.id) + '_' + change_product_id\
                                       + '_' + str(next_schedule_timestamp).split('.')[0]
                        # iamport 정기 결제 예약 신청
                        error = func_set_iamport_schedule(access_token['access_token'],
                                                          product_price_info.product_tb.name + ' - '
                                                          + product_price_info.name,
                                                          int(product_price_info.sale_price),
                                                          customer_uid, merchant_uid, next_schedule_timestamp,
                                                          str(request.user.first_name), str(request.user.email))
                if error is not None:
                    raise InternalError

        except TypeError:
            error = '오류가 발생했습니다.[0]'
        except ValueError:
            error = '오류가 발생했습니다.[1]'
        except IntegrityError:
            error = '오류가 발생했습니다.[2]'
        except InternalError:
            error = error

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


# 결제 수단 변경 체크 기능
def check_update_period_billing_logic(request):
    context = {'error': None, 'start_date': None, 'end_date': None}
    error = None
    billing_info = None
    today = datetime.date.today()
    customer_uid = request.POST.get('customer_uid')
    new_merchant_uid = request.POST.get('new_merchant_uid')
    new_customer_uid = request.POST.get('new_customer_uid')

    if error is None:
        try:
            billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid, use=USE)
        except ObjectDoesNotExist:
            billing_info = None

    if error is None:
        # 결제일이 지난 경우 결제 금액 셋팅
        if today > billing_info.next_payment_date:
            paid_date = int(today.strftime('%d'))
            context['next_start_date'] = str(today)
            context['next_end_date'] = func_get_end_date('PERIOD', today, billing_info.period_month, paid_date)
            context['price'] = billing_info.price
            status = 'ready'
        else:
            # 결제일이 지나지 않은 경우 0원으로 결제
            paid_date = int(billing_info.next_payment_date.strftime('%d'))
            context['next_start_date'] = str(billing_info.next_payment_date)
            context['next_end_date'] = str(billing_info.next_payment_date)
            context['price'] = 0
            status = 'pre_paid'
        try:
            with transaction.atomic():
                payment_info = PaymentInfoTb(member_id=request.user.id,
                                             product_tb_id=billing_info.product_tb_id,
                                             payment_type_cd='PERIOD',
                                             merchant_uid=new_merchant_uid,
                                             customer_uid=new_customer_uid,
                                             start_date=context['next_start_date'], end_date=context['next_end_date'],
                                             paid_date=today,
                                             period_month=billing_info.period_month,
                                             price=context['price'],
                                             name=billing_info.name,
                                             buyer_email=str(request.user.email),
                                             status=status,
                                             pay_method='card',
                                             buyer_name=request.user.first_name,
                                             use=UN_USE)
                payment_info.save()
                billing_info = BillingInfoTb(member_id=request.user.id,
                                             price=billing_info.price,
                                             name=billing_info.name,
                                             pay_method='card',
                                             product_tb_id=billing_info.product_tb_id,
                                             period_month=billing_info.period_month,
                                             payment_type_cd='PERIOD',
                                             merchant_uid=new_merchant_uid,
                                             customer_uid=new_customer_uid,
                                             payment_reg_date=datetime.date.today(),
                                             next_payment_date=context['next_end_date'],
                                             payed_date=paid_date,
                                             state_cd='NP', use=UN_USE)
                billing_info.save()

        except TypeError:
            error = '오류가 발생했습니다.[6]'
        except ValueError:
            error = '오류가 발생했습니다.[7]'
    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


class GetPaymentScheduleInfoView(LoginRequiredMixin, View):
    template_name = 'ajax/payment_info.html'

    def get(self, request):
        context = {}
        payment_info = None
        payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                    payment_type_cd='PERIOD',
                                                    status='reserve',
                                                    use=UN_USE).order_by('-payment_info_id')
        if len(payment_data) > 0:
            payment_info = payment_data[0]
        context['payment_info'] = payment_info

        return render(request, self.template_name, context)


class GetPaymentInfoView(LoginRequiredMixin, View):
    template_name = 'ajax/payment_info.html'

    def get(self, request):
        context = {}
        payment_info = None

        today = datetime.date.today()
        payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                    status='paid',
                                                    start_date__lte=today, end_date__gte=today,
                                                    use=USE).order_by('-payment_info_id')
        if len(payment_data) > 0:
            payment_info = payment_data[0]
            payment_info.start_date = str(payment_info.start_date)
            payment_info.end_date = str(payment_info.end_date)

        context['payment_info'] = payment_info

        return render(request, self.template_name, context)


class GetBillingInfoView(LoginRequiredMixin, View):
    template_name = 'ajax/billing_list.html'

    def get(self, request):
        context = {'error': None, 'billing_info': None}
        billing_data = BillingInfoTb.objects.filter(member_id=request.user.id, state_cd='IP', use=USE)

        context['billing_data'] = billing_data

        return render(request, self.template_name, context)


class GetPaymentListView(LoginRequiredMixin, View):
    template_name = 'ajax/payment_list.html'

    def get(self, request):
        context = {}
        payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                    use=USE).exclude(status='pre_paid').order_by('-end_date')
        context['payment_data'] = payment_data

        return render(request, self.template_name, context)


class GetProductInfoView(LoginRequiredMixin, View):
    template_name = 'ajax/product_info.html'

    def get(self, request):
        context = {}
        # product_id = request.GET.get('product_id', '')
        product_id = request.session.get('product_id', '')
        product_function_data = []
        try:
            product_info = ProductTb.objects.get(product_id=product_id, use=USE)
        except ObjectDoesNotExist:
            product_info = None

        product_function_auth_data = ProductFunctionAuthTb.objects.select_related(
            'function_auth_tb').filter(product_tb_id=product_id, use=USE).order_by('function_auth_tb_id',
                                                                                   'auth_type_cd')
        temp_function_auth_tb_id = ''

        for product_function_auth_info in product_function_auth_data:
            if temp_function_auth_tb_id == '':
                temp_function_auth_tb_id = product_function_auth_info.function_auth_tb_id
                product_function_data.append(product_function_auth_info.function_auth_tb.function_auth_type_name)
            else:
                if temp_function_auth_tb_id != product_function_auth_info.function_auth_tb_id:
                    temp_function_auth_tb_id = product_function_auth_info.function_auth_tb_id
                    product_function_data.append(product_function_auth_info.function_auth_tb.function_auth_type_name)

        product_price_data = ProductPriceTb.objects.filter(product_tb_id=product_id, use=USE).order_by('order')

        context['product_info'] = product_info
        context['product_function_data'] = product_function_data
        context['product_function_auth_data'] = product_function_auth_data
        context['product_price_data'] = product_price_data

        return render(request, self.template_name, context)


class GetCouponProductInfoView(LoginRequiredMixin, View):
    template_name = 'ajax/product_info.html'

    def get(self, request):
        context = {}
        # product_id = request.GET.get('product_id', '')
        coupon_cd = request.GET.get('coupon_cd', '')
        product_function_data = []
        error = None
        if coupon_cd is None or coupon_cd == '':
            error = '쿠폰 코드를 다시 확인해주세요.[1]'

        if error is None:
            try:
                product_info = ProductTb.objects.get(coupon_cd=coupon_cd, use=USE)
                if product_info.expiry_date < timezone.now():
                    error = '오류 : 유효기간이 지난 쿠폰입니다.'
                if product_info.coupon_amount <= 0:
                    error = '오류 : 쿠폰이 모두 소진됐습니다.'
            except ObjectDoesNotExist:
                error = '쿠폰 코드를 다시 확인해주세요.[2]'

        if error is None:
            product_function_auth_data = ProductFunctionAuthTb.objects.select_related(
                'function_auth_tb').filter(product_tb_id=product_info.product_id,
                                           use=USE).order_by('function_auth_tb_id', 'auth_type_cd')
            temp_function_auth_tb_id = ''

            for product_function_auth_info in product_function_auth_data:
                if temp_function_auth_tb_id == '':
                    temp_function_auth_tb_id = product_function_auth_info.function_auth_tb_id
                    product_function_data.append(product_function_auth_info.function_auth_tb.function_auth_type_name)
                else:
                    if temp_function_auth_tb_id != product_function_auth_info.function_auth_tb_id:
                        temp_function_auth_tb_id = product_function_auth_info.function_auth_tb_id
                        product_function_data.append(product_function_auth_info.function_auth_tb.function_auth_type_name)

            product_price_data = ProductPriceTb.objects.filter(product_tb_id=product_info.product_id,
                                                               use=USE).order_by('order')

            context['product_info'] = product_info
            context['product_function_data'] = product_function_data
            context['product_function_auth_data'] = product_function_auth_data
            context['product_price_data'] = product_price_data
        else:
            messages.error(request, error)

        return render(request, self.template_name, context)


class PaymentCompleteView(LoginRequiredMixin, TemplateView):
    template_name = 'payment_complete.html'

    def get_context_data(self, **kwargs):
        context = super(PaymentCompleteView, self).get_context_data(**kwargs)

        return context


def payment_for_iap_logic(request):
    product_id = request.POST.get('product_price_id', '')
    start_date = request.POST.get('start_date', '')
    os_info = request.POST.get('os_info', '')
    payment_type_cd = None
    end_date = None
    context = {}
    error = None
    today = datetime.date.today()
    product_info = None
    product_price_info = None

    if error is None:
        try:
            payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id, status='paid',
                                                        end_date__gte=today,
                                                        use=USE).latest('end_date')
            start_date = payment_info.end_date + datetime.timedelta(days=1)
        except ObjectDoesNotExist:
            start_date = today

    if error is None:
        try:
            product_info = ProductTb.objects.get(product_id=product_id, use=USE)
        except ObjectDoesNotExist:
            error = '인앱 결제 오류 발생'

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb_id=product_info.product_tb_id,
                                                            payment_type_cd='SINGLE',
                                                            period_month=1,
                                                            use=USE)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'
    if error is None:
        date = int(start_date.strftime('%d'))
        end_date = str(func_get_end_date(payment_type_cd, start_date, 1, date)).split(' ')[0]
        start_date = str(start_date).split(' ')[0]

    if error is None:
        payment_info = PaymentInfoTb(member_id=str(request.user.id),
                                     product_tb_id=product_id,
                                     payment_type_cd='SINGLE',
                                     merchant_uid='m_'+str(request.user.id)+'_'+str(product_id)
                                                  + '_' + str(timezone.now().timestamp()),
                                     customer_uid='c_'+str(request.user.id)+'_'+str(product_id)
                                                  + '_' + str(timezone.now().timestamp()),
                                     start_date=start_date, end_date=end_date,
                                     paid_date=today,
                                     period_month=1,
                                     price=int(product_price_info.sale_price),
                                     name=product_info.name + ' - 30일권',
                                     imp_uid='',
                                     channel='iap',
                                     card_name='인앱 결제',
                                     buyer_email=str(request.user.email),
                                     status='paid',
                                     fail_reason='',
                                     currency='',
                                     pay_method='android',
                                     pg_provider=os_info,
                                     receipt_url='',
                                     buyer_name=str(request.user.first_name),
                                     # amount=int(payment_result['amount']),
                                     use=USE)
        payment_info.save()

    if error is None:
        logger.info(str(request.user.first_name) + '(' + str(request.user.id) + ')님 iap 결제 완료:'
                    + str(product_id) + ':'+' '+str(start_date))
        email = EmailMessage('[PTERS 결제]' + str(request.user.first_name) + '회원', 'android 인앱 결제 :' + str(timezone.now()),
                             to=['support@pters.co.kr'])
        email.send()
    else:
        messages.error(request, error)
        logger.error(str(request.user.first_name) + '(' + str(request.user.id) + ')님 결제 완료 오류:' + str(error))

    return render(request, 'ajax/payment_error_info.html', context)


def payment_for_ios_logic(request):
    product_id = request.POST.get('product_id', '')
    receipt_data = request.POST.get('receipt_data', '')
    transaction_id = request.POST.get('transaction_id', '')
    payment_type_cd = None
    start_date = None
    context = {}
    error = None
    today = datetime.date.today()
    pay_info = '인앱 결제'
    product_info = None
    product_price_info = None

    if error is None:
        try:
            payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id, status='paid',
                                                        end_date__gte=today,
                                                        use=USE).latest('end_date')
            start_date = payment_info.end_date + datetime.timedelta(days=1)
        except ObjectDoesNotExist:
            start_date = today

    if error is None:
        try:
            product_info = ProductTb.objects.get(product_id=product_id, use=USE)
        except ObjectDoesNotExist:
            error = '인앱 결제 오류 발생'

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb_id=product_info.product_tb_id,
                                                            payment_type_cd='SINGLE',
                                                            period_month=1,
                                                            use=USE)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'

    if error is None:
        date = int(start_date.strftime('%d'))
        end_date = str(func_get_end_date(payment_type_cd, start_date, 1, date)).split(' ')[0]
        start_date = str(start_date).split(' ')[0]

        payment_info = PaymentInfoTb(member_id=str(request.user.id),
                                     product_tb_id=product_id,
                                     payment_type_cd='SINGLE',
                                     merchant_uid='m_'+str(request.user.id)+'_'+str(product_id)
                                                  + '_' + str(timezone.now().timestamp()),
                                     customer_uid='c_'+str(request.user.id)+'_'+str(product_id)
                                                  + '_' + str(timezone.now().timestamp()),
                                     start_date=start_date, end_date=end_date,
                                     paid_date=today,
                                     period_month=1,
                                     price=int(product_price_info.sale_price),
                                     name=product_info.name + ' - 30일권',
                                     imp_uid='',
                                     # imp_uid=input_transaction_id,
                                     channel='iap',
                                     card_name=pay_info,
                                     buyer_email=str(request.user.email),
                                     status='paid',
                                     fail_reason='',
                                     currency='',
                                     pay_method='ios',
                                     pg_provider='IOS',
                                     receipt_url='',
                                     buyer_name=str(request.user.first_name),
                                     # amount=int(payment_result['amount']),
                                     use=USE)

        payment_info.save()
        ios_receipt_check = IosReceiptCheckTb(member_id=request.user.id,
                                              payment_tb_id=payment_info.payment_info_id,
                                              original_transaction_id=transaction_id, receipt_data=receipt_data,
                                              iap_status_cd='YET_VALIDATION')
        ios_receipt_check.save()

    if error is None:
        logger.info(str(request.user.first_name)
                    + '(' + str(request.user.id) + ')님 ios 결제 완료:' + str(product_id) + ':' + ' '
                    + str(start_date))

        email = EmailMessage('[PTERS 결제]' + request.user.first_name + '회원', 'ios 인앱 결제 :' + str(timezone.now()),
                             to=['support@pters.co.kr'])
        email.send()
    else:
        messages.error(request, error)
        logger.error(str(request.user.first_name) + '(' + str(request.user.id) + ')님 결제 완료 오류:' + str(error))

    return render(request, 'ajax/payment_error_info.html', context)


def payment_for_coupon_logic(request):
    product_id = request.POST.get('product_id', '')
    payment_type_cd = None
    context = {}
    error = None
    today = datetime.date.today()
    start_date = today
    pay_info = '쿠폰 등록'
    product_info = None
    product_price_info = None

    if error is None:
        try:
            payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id, status='paid',
                                                        product_tb_id=product_id,
                                                        use=USE).latest('end_date')
            error = '[오류] 이미 사용한 쿠폰입니다.'
        except ObjectDoesNotExist:
            start_date = today

    if error is None:
        try:
            payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id, status='paid',
                                                        product_tb__promotion_type_cd='NORMAL_PRODUCT',
                                                        end_date__gte=today,
                                                        use=USE).latest('end_date')
            error = '[오류] 이미 사용중인 이용권이 있습니다.'
        except ObjectDoesNotExist:
            start_date = today

    if error is None:
        try:
            payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id, status='paid',
                                                        product_tb__promotion_type_cd='COUPON_PRODUCT',
                                                        end_date__gte=today,
                                                        use=USE).latest('end_date')
            start_date = payment_info.end_date + datetime.timedelta(days=1)
        except ObjectDoesNotExist:
            start_date = today

    if error is None:
        try:
            product_info = ProductTb.objects.get(product_id=product_id, use=USE)
            if product_info.expiry_date < timezone.now():
                error = '[오류] 유효기간이 지난 쿠폰입니다.'
            if product_info.coupon_amount <= 0:
                error = '[오류] 쿠폰이 모두 소진됐습니다.'
        except ObjectDoesNotExist:
            error = '[오류] 쿠폰 등록 오류[0]'

    if error is None:
        try:
            product_price_info = ProductPriceTb.objects.get(product_tb_id=product_id,
                                                            payment_type_cd='SINGLE',
                                                            use=USE)
        except ObjectDoesNotExist:
            error = '[오류] 쿠폰 등록 오류[1]'

    if error is None:
        date = int(start_date.strftime('%d'))
        end_date = str(func_get_end_date(payment_type_cd, start_date,
                                         product_price_info.period_month, date)).split(' ')[0]
        start_date = str(start_date).split(' ')[0]

        payment_info = PaymentInfoTb(member_id=str(request.user.id),
                                     product_tb_id=product_id,
                                     payment_type_cd='SINGLE',
                                     merchant_uid='m_'+str(request.user.id)+'_'+str(product_id)
                                                  + '_' + str(timezone.now().timestamp()),
                                     customer_uid='c_'+str(request.user.id)+'_'+str(product_id)
                                                  + '_' + str(timezone.now().timestamp()),
                                     start_date=start_date, end_date=end_date,
                                     paid_date=today,
                                     period_month=product_price_info.period_month,
                                     price=int(product_price_info.sale_price),
                                     name=product_info.name + ' - '+str(product_price_info.period_month)+'개월 이용권',
                                     imp_uid='',
                                     # imp_uid=input_transaction_id,
                                     channel='coupon',
                                     card_name=pay_info,
                                     buyer_email=str(request.user.email),
                                     status='paid',
                                     fail_reason='',
                                     currency='',
                                     pay_method='coupon',
                                     pg_provider='PTERS',
                                     receipt_url='',
                                     buyer_name=str(request.user.first_name),
                                     # amount=int(payment_result['amount']),
                                     use=USE)

        payment_info.save()

    if error is None:
        product_info.coupon_amount -= 1
        product_info.save()
        logger.info(str(request.user.first_name)
                    + '(' + str(request.user.id) + ')님 coupon 결제 완료:' + str(product_id) + ':' + ' '
                    + str(start_date))

        email = EmailMessage('[PTERS 결제]' + request.user.first_name + '회원', 'coupon 결제 :' + str(timezone.now()),
                             to=['support@pters.co.kr'])
        email.send()
    else:
        messages.error(request, error)
        logger.error(str(request.user.first_name) + '(' + str(request.user.id) + ')님 결제 완료 오류:' + str(error))

    return render(request, 'ajax/payment_error_info.html', context)


def resend_period_billing_logic(request):

    json_data = request.body.decode('utf-8')
    json_loading_data = None
    payment_user_info = None
    context = {'error': None}
    error = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        merchant_uid = json_loading_data['merchant_uid']
        try:
            payment_user_info = PaymentInfoTb.objects.get(merchant_uid=str(merchant_uid))
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'

    if error is None:
        error = func_resend_payment_info(payment_user_info.customer_uid, payment_user_info.merchant_uid,
                                         payment_user_info.price)

    context['error'] = error
    if error is not None:
        messages.error(request, error)
        logger.error(str(request.user.first_name) + '(' + str(request.user.id) + ')님 재결제 신청 오류:' + str(error))
    else:
        logger.info(str(request.user.first_name) + '(' + str(request.user.id) + ')님 재결제 신청 완료:')

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


def delete_billing_info_logic(request):
    json_data = request.body.decode('utf-8')
    json_loading_data = None
    context = {'error': None}
    error = None
    merchant_uid = None
    payment_user_info = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        merchant_uid = json_loading_data['merchant_uid']

    if error is None:
        try:
            payment_user_info = PaymentInfoTb.objects.get(merchant_uid=merchant_uid)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'
    if error is None:
        if payment_user_info is not None:
            payment_user_info.use = UN_USE
            payment_user_info.save()

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


def delete_billing_logic(request):
    json_data = request.body.decode('utf-8')
    json_loading_data = None
    context = {'error': None}
    error = None
    merchant_uid = None
    payment_user_info = None
    billing_user_info = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        merchant_uid = json_loading_data['merchant_uid']

    if error is None:
        try:
            payment_user_info = PaymentInfoTb.objects.get(merchant_uid=merchant_uid)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오지 못했습니다.'
    if error is None:
        if payment_user_info.customer_uid is not None and payment_user_info.customer_uid != '':
            try:
                billing_user_info = BillingInfoTb.objects.get(customer_uid=payment_user_info.customer_uid)
            except ObjectDoesNotExist:
                error = '결제 정보를 불러오지 못했습니다.'
    if error is None:
        if payment_user_info is not None:
            payment_user_info.delete()
        if billing_user_info is not None:
            billing_user_info.delete()

    if error is not None:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


class PaymentHistoryView(LoginRequiredMixin, View):
    template_name = 'history_payment.html'

    def get(self, request):
        context = {'payment_data': None, 'current_payment_data': None}
        product_list = ProductTb.objects.filter(use=USE)
        current_payment_data = []
        current_period_payment_data = []
        change_period_payment_data = []
        cancel_period_payment_data = []
        stop_period_payment_data = []
        current_billing_info = []
        # period_info_flag = []
        today = datetime.date.today()
        period_payment_no = 1
        for product_info in product_list:
            # try:
            #     payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id,
            #                                                 merchandise_type_cd=product_info.merchandise_type_cd,
            #                                                 start_date__lte=today, end_date__gte=today,
            #                                                 use=USE).latest('end_date')
            # except ObjectDoesNotExist:
            #     payment_info = None
            payment_data = PaymentInfoTb.objects.select_related(
                'product_tb').filter(member_id=request.user.id, product_tb_id=product_info.product_id,
                                     start_date__lte=today, end_date__gte=today, status='paid', use=USE)

            period_payment_data = PaymentInfoTb.objects.select_related('product_tb'
                                                                       ).filter(Q(status='reserve')
                                                                                | Q(status='cancelled')
                                                                                | Q(status='failed'),
                                                                                member_id=request.user.id,
                                                                                product_tb_id=product_info.product_id,
                                                                                end_date__gte=today,
                                                                                # price__gt=0,
                                                                                payment_type_cd='PERIOD',
                                                                                # use=USE
                                                                                ).order_by('-end_date',
                                                                                           '-mod_dt',
                                                                                           '-payment_info_id')
            if len(period_payment_data) > 0:
                # paid_period_payment_data = period_payment_data.filter(status='paid')
                # if len(paid_period_payment_data):
                #     period_payment_info = paid_period_payment_data[0]
                # else:
                period_payment_info = period_payment_data[0]
            else:
                period_payment_info = None

            # try:
            #     period_payment_info = PaymentInfoTb.objects.filter(Q(status='reserve') | Q(status='cancelled'),
            #                                                        member_id=request.user.id,
            #                                                        merchandise_type_cd=product_info.merchandise_type_cd,
            #                                                        end_date__gte=today,
            #                                                        payment_type_cd='PERIOD').latest('end_date')
            # except ObjectDoesNotExist:
            #     period_payment_info = None

            try:
                billing_info = BillingInfoTb.objects.get(member_id=request.user.id,
                                                         product_tb_id=product_info.product_id,
                                                         state_cd='IP',
                                                         use=USE)
            except ObjectDoesNotExist:
                billing_info = None

            if billing_info is None:
                try:
                    billing_info = BillingInfoTb.objects.get(member_id=request.user.id,
                                                             product_tb_id=product_info.product_id,
                                                             use=USE)
                except ObjectDoesNotExist:
                    billing_info = None

            if len(payment_data) > 0:
                for payment_info in payment_data:
                    try:
                        merchandise_type = ProductTb.objects.get(product_id=payment_info.product_tb_id, use=USE)
                        merchandise_type_name = merchandise_type.contents
                    except ObjectDoesNotExist:
                        merchandise_type_name = ''
                    # merchandise_type_name_list = merchandise_type_name.split('+')
                    # payment_info.merchandise_type_name = merchandise_type_name_list
                    payment_info.merchandise_type_name = merchandise_type_name

                    if payment_info.status == 'cancelled':
                        payment_info.status_name = '결제 취소'
                    elif payment_info.status == 'paid':
                        payment_info.status_name = '결제 완료'
                    elif payment_info.status == 'failed':
                        payment_info.status_name = '결제 실패'

                    if payment_info.fail_reason is None:
                        payment_info.fail_reason = '고객 요청'

                    # if billing_info is None:
                    if payment_info.payment_type_cd != 'PERIOD':
                        payment_info.next_payment_date = payment_info.end_date
                        payment_info.billing_state_name = '종료 예정일'
                    else:
                        payment_info.billing_info = billing_info
                        payment_info.next_payment_date = billing_info.next_payment_date
                        payment_info.billing_state_cd = billing_info.state_cd
                        # period_payment_info.customer_uid = billing_info.customer_uid
                        # period_payment_info.pay_method = billing_info.pay_method
                        if billing_info.state_cd == 'IP':
                            payment_info.billing_state_name = '결제 예정일'
                            # current_period_payment_data.append(payment_info)
                        elif billing_info.state_cd == 'ST':
                            payment_info.billing_state_name = '종료 예정일'
                            # cancel_period_payment_data.append(payment_info)
                        else:
                            payment_info.billing_state_name = '종료 예정일'
                            # current_period_payment_data.append(payment_info)

                    current_payment_data.append(payment_info)

            if period_payment_info is not None:
                period_payment_no += len(payment_data)
                period_payment_info.counter = period_payment_no
                try:
                    merchandise_type = ProductTb.objects.get(product_id=period_payment_info.product_tb_id, use=USE)
                    merchandise_type_name = merchandise_type.contents
                except ObjectDoesNotExist:
                    merchandise_type_name = ''
                # merchandise_type_name_list = merchandise_type_name.split('+')
                # period_payment_info.merchandise_type_name = merchandise_type_name_list
                period_payment_info.merchandise_type_name = merchandise_type_name
                # period_payment_info.start_date = payment_info.start_date
                # period_payment_info.end_date = payment_info.end_date

                if billing_info is None:
                    period_payment_info.next_payment_date = period_payment_info.end_date
                    period_payment_info.billing_state_name = '종료 예정일'
                else:
                    if billing_info.state_cd == 'IP':
                        period_payment_info.status_name = '정상 결제'
                    elif billing_info.state_cd == 'ST':
                        period_payment_info.status_name = '정지 예정'
                    elif billing_info.state_cd == 'CANCEL':
                        period_payment_info.status_name = '결제 취소'
                    elif billing_info.state_cd == 'ERR':
                        period_payment_info.status_name = '결제 실패'
                    elif billing_info.state_cd == 'END':
                        period_payment_info.status_name = '결제 종료'

                    period_payment_info.billing_info = billing_info
                    period_payment_info.next_payment_date = billing_info.next_payment_date
                    period_payment_info.billing_state_cd = billing_info.state_cd
                    period_payment_info.payed_date = billing_info.payed_date
                    # period_payment_info.customer_uid = billing_info.customer_uid
                    # period_payment_info.pay_method = billing_info.pay_method
                    if billing_info.state_cd == 'IP':
                        period_payment_info.billing_state_name = '결제 예정일'
                        current_period_payment_data.append(period_payment_info)
                        change_period_payment_data.append(period_payment_info)
                    elif billing_info.state_cd == 'ST':
                        period_payment_info.billing_state_name = '종료 예정일'
                        cancel_period_payment_data.append(period_payment_info)
                    else:
                        period_payment_info.billing_state_name = '종료 예정일'
                        change_period_payment_data.append(period_payment_info)
                        stop_period_payment_data.append(period_payment_info)

                current_billing_info.append(period_payment_info)

        payment_data_history = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                            # status='paid',
                                                            # price__gt=0,
                                                            use=USE).exclude(status='pre_paid').order_by('-end_date',
                                                                                                         '-mod_dt')
        for payment_info in payment_data_history:
            if payment_info.status == 'cancelled':
                payment_info.status_name = '결제 취소'
            elif payment_info.status == 'paid':
                payment_info.status_name = '결제 완료'
            elif payment_info.status == 'failed':
                payment_info.status_name = '결제 실패'
            if payment_info.pay_method is None:
                payment_info.pay_method = ''

        context['payment_id'] = getattr(settings, "PAYMENT_ID", '')
        context['payment_data_history'] = payment_data_history
        context['current_payment_data'] = current_payment_data
        context['change_period_payment_data'] = change_period_payment_data
        context['current_period_payment_data'] = current_period_payment_data
        context['cancel_period_payment_data'] = cancel_period_payment_data
        context['stop_period_payment_data'] = stop_period_payment_data

        context['current_billing_info'] = current_billing_info

        return render(request, self.template_name, context)


def ios_receipt_validation_logic(request):

    ios_receipt_validation_data = IosReceiptCheckTb.objects.filter(use=USE).exclude('FINISH_VALIDATION')

    h = httplib2.Http()

    for ios_receipt_validation_info in ios_receipt_validation_data:
        data = {
            'exclude-old-transactions': "true",
            'receipt-data': ios_receipt_validation_data.receipt_data,
            'password': settings.PTERS_IOS_SUBSCRIPTION_SECRET
        }

        body = json.dumps(data)

        resp, content = h.request("https://buy.itunes.apple.com/verifyReceipt", method="POST", body=body,
                                  headers={'Content-Type': 'application/json;'})

        json_loading_data = None
        error = None
        if error is None:

            if resp['status'] == '200':
                json_data = content.decode('utf-8')
                try:
                    json_loading_data = json.loads(json_data)
                except ValueError:
                    error = '오류가 발생했습니다.'
                except TypeError:
                    error = '오류가 발생했습니다.'

        if error is None:
            if str(json_loading_data['status']) == '0':
                in_app_info = json_loading_data['receipt']['in_app']
                transaction_id = str(in_app_info[0]['transaction_id'])
                ios_receipt_validation_info.transaction_id = transaction_id
                if ios_receipt_validation_info.original_transaction_id != transaction_id:
                    ios_receipt_validation_info.iap_status_cd = 'TRANSACTION_ID_FAULT'
                else:
                    try:
                        ios_receipt_validation_info.cancellation_date = str(in_app_info[0]['cancellation_date'])
                        ios_receipt_validation_info.iap_status_cd = 'CANCEL'
                    except KeyError:
                        ios_receipt_validation_info.iap_status_cd = 'FINISH_VALIDATION'
            else:
                ios_receipt_validation_info.iap_status_cd = str(json_loading_data['status'])

            ios_receipt_validation_info.save()

    return render(request, 'ajax/payment_error_info.html')


def add_member_coupon_logic(request):
    coupon_cd = request.POST.get('coupon_cd', '')
    coupon_info = None
    error = None

    today = datetime.date.today()

    if coupon_cd is None or coupon_cd == '':
        error = '쿠폰 코드를 다시 확인해주세요.[1]'

    if error is None:
        try:
            coupon_info = CouponTb.objects.get(coupon_cd=coupon_cd, use=USE)
        except ObjectDoesNotExist:
            error = '쿠폰 코드를 다시 확인해주세요.[3]'

    if error is None:
        error = func_check_coupon_use(coupon_cd, request.user.id, request.user.date_joined)

    if error is None:
        expiry_date = today + datetime.timedelta(days=coupon_info.effective_days)
        coupon_member = CouponMemberTb(member_id=request.user.id, coupon_tb_id=coupon_info.coupon_id,
                                       name=coupon_info.name, contents=coupon_info.contents,
                                       start_date=today, expiry_date=expiry_date, use=USE)
        coupon_member.save()

    else:
        logger.error(request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    return render(request, 'ajax/payment_error_info.html')


class GetMemberCouponListView(LoginRequiredMixin, View):
    # template_name = 'test.html'
    def get(self, request):
        coupon_member_data_dict = collections.OrderedDict()
        coupon_member_data = CouponMemberTb.objects.select_related(
            'coupon_tb__product_tb').filter(member_id=request.user.id, use=USE)

        for coupon_member_info in coupon_member_data:
            product_tb = coupon_member_info.coupon_tb.product_tb
            product_id = ''
            product_name = '기존 결제 상품'

            if product_tb is not None and product_tb != '':
                product_id = product_tb.product_id
                product_name = product_tb.name

            coupon_member_data_dict[coupon_member_info.coupon_id] = {
                'coupon_id': coupon_member_info.coupon_id,
                'coupon_name': coupon_member_info.name,
                'coupon_contents': coupon_member_info.contents,
                'coupon_start_date': str(coupon_member_info.start_date),
                'coupon_expiry_date': str(coupon_member_info.expiry_date),
                'coupon_target': coupon_member_info.coupon_info.target,
                'coupon_product_id': product_id,
                'coupon_product_name': product_name,
                'coupon_product_effective_days': coupon_member_info.coupon_info.product_effective_days,
                'coupon_mod_dt': coupon_member_info.mod_dt,
                'coupon_reg_dt': coupon_member_info.reg_dt,
                'coupon_exhaustion': coupon_member_info.exhaustion
            }

        return JsonResponse({'coupon_member_data': coupon_member_data_dict}, json_dumps_params={'ensure_ascii': True})


def add_coupon_product_info_logic(request):
    coupon_member_id = request.POST.get('coupon_member_id', '')

    error = None
    context = {'error': None}
    coupon_info = None
    payment_name = None
    today = datetime.date.today()
    product_id = None
    start_date = today

    if coupon_member_id is None or coupon_member_id == '':
        error = '오류가 발생했습니다.[0]'

    if error is None:
        try:
            coupon_member_info = CouponMemberTb.objects.get(coupon_member_id=coupon_member_id,
                                                            member_id=request.user.id,
                                                            use=USE)
            payment_name = coupon_member_info.name
            coupon_info = coupon_member_info.coupon_tb
            if coupon_info.product_tb is not None and coupon_info.product_tb != '':
                product_id = coupon_info.product_tb_id
        except ObjectDoesNotExist:
            error = '쿠폰함을 확인해주세요.[0]'

    if error is None:
        error = func_check_coupon_use(coupon_info.coupon_cd, request.user.id, request.user.date_joined)

    if error is None:
        # 결제 예약 스케쥴 정보 가져오기
        payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                    payment_type_cd='PERIOD',
                                                    status='reserve',
                                                    use=UN_USE).order_by('-end_date')
        # 결제 예약 스케쥴이 있는 경우 (현재 결제중인것이 있음)
        if len(payment_data) > 0:
            payment_info = payment_data[0]
            next_schedule_timestamp = ''

            if error is None:
                # 예약 데이터 업데이트
                # if product_id is None or product_id == '':
                product_id = payment_info.product_tb_id

                # 다음 결제 예정일 업데이트
                next_paid_date = str(func_get_end_date_by_day(payment_info.paid_date,
                                                              coupon_info.product_effective_days))

                # 쿠폰 등록 결제 정보 추가
                # 시작일 : 다음 결제시 시작일 , 종료일 : 수정된 다음 결제 예정일
                coupon_payment_info = PaymentInfoTb(
                    member_id=str(request.user.id),
                    product_tb_id=product_id,
                    payment_type_cd='SINGLE',
                    merchant_uid='m_coupon_' + str(request.user.id) + '_' + str(product_id)
                                 + '_' + str(timezone.now().timestamp()),
                    customer_uid=payment_info.customer_uid,
                    start_date=str(payment_info.start_date), end_date=str(next_paid_date),
                    paid_date=today,
                    period_month=0,
                    price=0,
                    name=payment_name,
                    imp_uid=str(coupon_member_id),
                    channel='coupon',
                    card_name='coupon',
                    buyer_email=str(request.user.email),
                    status='paid',
                    fail_reason='',
                    currency='',
                    pay_method='coupon',
                    pg_provider='PTERS',
                    receipt_url='',
                    buyer_name=str(request.user.first_name),
                    use=USE)

                coupon_payment_info.save()

                # 쿠폰 한도 차감
                coupon_info.coupon_amount -= 1
                coupon_info.save()

                # merchant_uid 업데이트
                merchant_uid = 'm_' + str(request.user.id) + '_' + str(product_id)\
                               + '_' + str(timezone.now().timestamp())

                payment_info.merchant_uid = merchant_uid
                # 다음 결제일 업데이트
                payment_info.paid_date = next_paid_date
                # 다음 시작일 기간 만큼 업데이트
                payment_info.start_date = str(func_get_end_date_by_day(payment_info.start_date,
                                                                       coupon_info.product_effective_days))
                # 다음 종료일 기간 만큼 업데이트
                payment_info.end_date = str(func_get_end_date_by_day(payment_info.end_date,
                                                                     coupon_info.product_effective_days))
                payment_info.save()

                # 정기결제 결제 정보 업데이트
                try:
                    billing_info = BillingInfoTb.objects.get(customer_uid=payment_info.customer_uid, use=USE)
                    # 다음 결제 예정일 업데이트
                    billing_info.next_payment_date = next_paid_date
                    billing_info.payed_date = next_paid_date.split('-')[2]
                    billing_info.save()
                    # 정기 결제 다음 결제일을 자동 결제 예약 시간으로 설정
                    next_billing_date_time = datetime.datetime.combine(
                        datetime.datetime.strptime(next_paid_date, '%Y-%m-%d'),
                        datetime.datetime.min.time())
                    next_schedule_timestamp = next_billing_date_time.replace(hour=15, minute=0, second=0,
                                                                             microsecond=0).timestamp()
                except ObjectDoesNotExist:
                    error = '정기 결제 정보를 불러오지 못했습니다.'

            if error is None:
                error = func_cancel_period_billing_schedule(payment_info.customer_uid)

            if error is None:
                token_result = func_get_imp_token()
                access_token = token_result['access_token']
                error = token_result['error']
                if error is None:
                    # iamport 정기 결제 예약 신청
                    error = func_set_iamport_schedule(access_token, payment_info.name,
                                                      int(payment_info.price),
                                                      payment_info.customer_uid, payment_info.merchant_uid,
                                                      next_schedule_timestamp,
                                                      str(request.user.first_name), str(request.user.email))

        else:
            # 결제 예약 스케쥴이 없는 경우

            # 현재 진행중인 상품이 있다면 다음날, 없다면 오늘 시작
            try:
                payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id, status='paid',
                                                            end_date__gte=today,
                                                            use=USE).latest('end_date')
                start_date = payment_info.end_date + datetime.timedelta(days=1)
                if product_id is None or product_id == '':
                    product_id = payment_info.product_tb_id
            except ObjectDoesNotExist:
                product_id = 8
                start_date = today

            if error is None:
                try:
                    with transaction.atomic():
                        end_date = str(func_get_end_date_by_day(start_date, coupon_info.product_effective_days))
                        payment_info = PaymentInfoTb(member_id=str(request.user.id),
                                                     product_tb_id=product_id,
                                                     payment_type_cd='SINGLE',
                                                     merchant_uid='m_coupon_' + str(request.user.id) + '_'
                                                                  + str(product_id)
                                                                  + '_' + str(timezone.now().timestamp()),
                                                     customer_uid='c_coupon_' + str(request.user.id) + '_'
                                                                  + str(product_id)
                                                                  + '_' + str(timezone.now().timestamp()),
                                                     start_date=start_date, end_date=end_date,
                                                     paid_date=today,
                                                     period_month=0,
                                                     price=0,
                                                     name=payment_name,
                                                     imp_uid=str(coupon_member_id),
                                                     channel='coupon',
                                                     card_name='coupon',
                                                     buyer_email=str(request.user.email),
                                                     status='paid',
                                                     fail_reason='',
                                                     currency='',
                                                     pay_method='coupon',
                                                     pg_provider='PTERS',
                                                     receipt_url='',
                                                     buyer_name=str(request.user.first_name),
                                                     use=USE)

                        payment_info.save()

                        # 쿠폰 한도 차감
                        coupon_info.coupon_amount -= 1
                        coupon_info.save()
                except TypeError:
                    error = '쿠폰 등록중 발생했습니다.[0]'
                except ValueError:
                    error = '쿠폰 등록중 발생했습니다.[1]'

    if error is None:
        logger.info(str(request.user.first_name)
                    + '(' + str(request.user.id) + ')님 coupon 등록 완료:' + str(payment_name) + ':' + ' '
                    + str(start_date))

        email = EmailMessage('[PTERS 쿠폰 등록]' + str(request.user.first_name) + '회원',
                             str(payment_name)+':' + str(timezone.now()),
                             to=['support@pters.co.kr'])
        email.send()
    else:
        messages.error(request, error)
        logger.error(str(request.user.first_name) + '(' + str(request.user.id) + ')님 '
                     + str(payment_name)+' 쿠폰 등록 오류:' + str(error))

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)
