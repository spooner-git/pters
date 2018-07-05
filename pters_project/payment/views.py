import datetime
import json

import httplib2
import logging

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render

# Create your views here.
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from django.utils import timezone

from configs import settings
from configs.const import USE, UN_USE
from payment.function import func_set_billing_schedule, func_get_payment_token, func_resend_payment_info, \
    func_check_payment_info, func_get_end_date, func_send_refund_payment
from payment.models import PaymentInfoTb, BillingInfoTb

logger = logging.getLogger(__name__)


class PaymentView(LoginRequiredMixin, View):
    template_name = 'payment.html'

    def get(self, request):
        context = {}
        payment_count = PaymentInfoTb.objects.filter(member_id=request.user.id).count()
        context['payment_count'] = payment_count
        context['payment_id'] = getattr(settings, "PAYMENT_ID", '')

        return render(request, self.template_name, context)


@csrf_exempt
def add_billing_logic(request):
    json_data = request.body.decode('utf-8')
    json_loading_data = None
    context = {'error': None}
    error = None
    merchandise_type_cd = None
    payment_type_cd = None
    pay_method_type_cd = None
    merchant_uid = None
    customer_uid = None
    start_date = None
    end_date = None
    date = None
    name = None
    input_price = 0
    today = datetime.date.today()

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        start_date = json_loading_data['start_date']
        start_date = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
        payment_type_cd = json_loading_data['payment_type_cd']
        pay_method_type_cd = json_loading_data['pay_method_type_cd']
        merchandise_type_cd = json_loading_data['merchandise_type_cd']
        merchant_uid = json_loading_data['merchant_uid']
        input_price = json_loading_data['price']
        date = int(start_date.strftime('%d'))

    if error is None:
        if payment_type_cd == 'PERIOD':
            customer_uid = json_loading_data['customer_uid']

    if error is None:
        error = func_check_payment_info(merchandise_type_cd, payment_type_cd, input_price)

    if error is None:
        end_date = func_get_end_date(payment_type_cd, start_date, 1, date)

    if error is None:
        payment_info = PaymentInfoTb(member_id=request.user.id, merchandise_type_cd=merchandise_type_cd,
                                     payment_type_cd=payment_type_cd,
                                     merchant_uid=merchant_uid, customer_uid=customer_uid,
                                     start_date=start_date, end_date=end_date,
                                     price=input_price,
                                     name=name,
                                     mod_dt=timezone.now(), reg_dt=timezone.now(), use=UN_USE)

        billing_info = BillingInfoTb(member_id=request.user.id,
                                     pay_method_type_cd=pay_method_type_cd,
                                     payment_type_cd=payment_type_cd,
                                     merchant_uid=merchant_uid,
                                     customer_uid=customer_uid,
                                     payment_date=datetime.date.today(),
                                     payed_date=date,
                                     mod_dt=timezone.now(), reg_dt=timezone.now(), use=UN_USE)
        payment_info.save()
        billing_info.save()
    if error is not None:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


@csrf_exempt
def check_billing_logic(request):
    json_data = request.body.decode('utf-8')
    json_loading_data = None
    context = {'error': None, 'start_date': None}
    error = None
    merchandise_type_cd = None
    payment_type_cd = None
    start_date = None
    end_date = None
    date = None
    input_price = 0
    today = datetime.date.today()

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        payment_type_cd = json_loading_data['payment_type_cd']
        merchandise_type_cd = json_loading_data['merchandise_type_cd']

    if error is None:
        if payment_type_cd == 'PERIOD':
            customer_uid = json_loading_data['customer_uid']

    if error is None:
        # today = datetime.datetime.combine(today, datetime.datetime.min.time())
        payment_user_info_count_period = PaymentInfoTb.objects.filter(end_date__gte=today,
                                                                      member_id=request.user.id,
                                                                      merchandise_type_cd=merchandise_type_cd,
                                                                      payment_type_cd='PERIOD',
                                                                      use=USE).order_by('end_date')
        if payment_user_info_count_period != 0:
            error = '이미 정기결제 중인 기능입니다.'

    if error is None:
        payment_user_info_count_single = PaymentInfoTb.objects.filter(end_date__gte=today,
                                                                      member_id=request.user.id,
                                                                      merchandise_type_cd=merchandise_type_cd,
                                                                      payment_type_cd='SINGLE',
                                                                      use=USE).count()

    if error is None:
        error = func_check_payment_info(merchandise_type_cd, payment_type_cd, input_price)

    if error is not None:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


@csrf_exempt
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
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        merchant_uid = json_loading_data['merchant_uid']

    if error is None:
        try:
            payment_user_info = PaymentInfoTb.objects.get(merchant_uid=merchant_uid)
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오는데 실패했습니다.'
    if error is None:
        if payment_user_info.customer_uid is not None and payment_user_info.customer_uid != '':
            try:
                billing_user_info = BillingInfoTb.objects.get(customer_uid=payment_user_info.customer_uid)
            except ObjectDoesNotExist:
                error = '결제 정보를 불러오는데 실패했습니다.'
    if error is None:
        if payment_user_info is not None:
            payment_user_info.delete()
        if billing_user_info is not None:
            billing_user_info.delete()

    if error is not None:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


@csrf_exempt
def billing_check_logic(request):

    json_data = request.body.decode('utf-8')
    json_loading_data = None

    token_result = func_get_payment_token()
    access_token = token_result['access_token']
    error = token_result['error']
    payment_user_info = None
    billing_info = None
    context = {'error': None}

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        user_id = json_loading_data['custom_data']
        logger.info('user_id::::'+str(user_id))

    if error is None:
        merchant_uid = json_loading_data['merchant_uid']
        # print('merchant_uid:'+merchant_uid)
        try:
            payment_user_info = PaymentInfoTb.objects.get(merchant_uid=str(merchant_uid))
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오는데 실패했습니다.'
        # print('merchant_uid:'+merchant_uid)

    if error is None:
        if payment_user_info.payment_type_cd == 'PERIOD':
            try:
                billing_info = BillingInfoTb.objects.get(customer_uid=payment_user_info.customer_uid)
            except ObjectDoesNotExist:
                error = '결제 정보를 불러오는데 실패했습니다.'
        # if error is None:
        #     user_id = payment_user_info.member_id

    if error is None:
        # json_loading_data = None
        h = httplib2.Http()
        resp, content = h.request("https://api.iamport.kr/payments/" + json_loading_data['imp_uid'], method="GET",
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
        # if payment_result_status['error'] is not None:
        #     error = payment_result_status['error']
        # else:
        #     logger.info('second::'+str(json_loading_data))
    # if error is None:
    #     if json_loading_data['success'] is False:
    #         error = '결제중 오류가 발생했습니다.'

    if error is None:
        # json_loading_data = payment_result_status['json_loading_data']
        status = json_loading_data['response']['status']
        if status == 'paid':  # 결제 완료
            if int(json_loading_data['response']['amount']) == int(payment_user_info.price):
                if payment_user_info.payment_type_cd == 'PERIOD':
                    # 결제 정보 저장
                    func_set_billing_schedule(payment_user_info.customer_uid, payment_user_info, billing_info)
                    payment_user_info.use = USE
                    payment_user_info.mod_dt = timezone.now()
                    payment_user_info.save()
                    billing_info.use = USE
                    billing_info.mod_dt = timezone.now()
                    billing_info.save()
            else:
                # 결제 취소 날리기
                func_send_refund_payment(json_loading_data['response']['imp_uid'],
                                         json_loading_data['response']['merchant_uid'], access_token)
        elif status == 'ready':
            logger.info('ready Test 상태입니다..')
        else:  # 재결제 시도
            func_resend_payment_info(payment_user_info.customer_uid, payment_user_info.merchant_uid,
                                     payment_user_info.price)

    if error is None:
        logger.info(str(payment_user_info.member.name) + '님 정기 결제 완료 '
                    + str(payment_user_info.member_id) + ':' + str(json_loading_data['response']['merchant_uid']))
        context['error'] = error
        return render(request, 'ajax/payment_error_info.html', context)
    else:
        logger.error(str(payment_user_info.member.name) + '님 결제 완료 체크'
                     + str(payment_user_info.member_id) + ':' + str(error))
        context['error'] = error
        return render(request, 'ajax/payment_error_info.html', context)


class PaymentCompleteView(LoginRequiredMixin, TemplateView):
    template_name = 'payment_complete.html'

    def get_context_data(self, **kwargs):
        context = super(PaymentCompleteView, self).get_context_data(**kwargs)

        return context
