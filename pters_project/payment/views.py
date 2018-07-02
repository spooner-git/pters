import datetime
import json

import httplib2
import logging
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render

# Create your views here.
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from django.utils import timezone

from configs import settings
from configs.const import USE
from payment.function import func_set_billing_schedule, func_get_payment_token, func_resend_payment_info
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
    error = None
    merchandise_type_cd = None
    payment_type_cd = None
    merchant_uid = None
    customer_uid = None
    start_date = None
    end_date = None
    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    if error is None:
        start_date = json_loading_data['start_date']
        end_date = json_loading_data['end_date']
        payment_type_cd = json_loading_data['payment_type_cd']
        merchandise_type_cd = json_loading_data['merchandise_type_cd']
        merchant_uid = json_loading_data['merchant_uid']
        customer_uid = json_loading_data['customer_uid']
        price = json_loading_data['price']

    if error is None:
        payment_info = PaymentInfoTb(member_id=request.user.id, merchandise_type_cd=merchandise_type_cd,
                                     payment_type_cd=payment_type_cd,
                                     merchant_uid=merchant_uid, customer_uid=customer_uid,
                                     start_date=start_date, end_date=end_date,
                                     price=price,
                                     mod_dt=timezone.now(), reg_dt=timezone.now(), use=USE)
        billing_info = BillingInfoTb(member_id=request.user.id,
                                     payment_type_cd=payment_type_cd,
                                     merchant_uid=merchant_uid,
                                     customer_uid=customer_uid,
                                     payment_date=datetime.date.today(),
                                     mod_dt=timezone.now(), reg_dt=timezone.now(), use=USE)
        payment_info.save()
        billing_info.save()
    return render(request, 'ajax/payment_error_info.html', error)


@csrf_exempt
def delete_billing_logic(request):
    json_data = request.body.decode('utf-8')
    json_loading_data = None
    error = None
    # merchandise_type_cd = None
    # payment_type_cd = None
    merchant_uid = None
    # customer_uid = None
    # start_date = None
    # end_date = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    if error is None:
        # start_date = json_loading_data['start_date']
        # end_date = json_loading_data['end_date']
        # payment_type_cd = json_loading_data['payment_type_cd']
        # merchandise_type_cd = json_loading_data['merchandise_type_cd']
        merchant_uid = json_loading_data['merchant_uid']
        # customer_uid = json_loading_data['customer_uid']
        # price = json_loading_data['price']

    if error is None:
        try:
            payment_user_info = PaymentInfoTb.objects.get(merchant_uid=str(merchant_uid))
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오는데 실패했습니다.'
        payment_user_info.delete()
    if error is None:
        try:
            billing_user_info = BillingInfoTb.objects.get(merchant_uid=str(merchant_uid))
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오는데 실패했습니다.'
        billing_user_info.delete()

    return render(request, 'ajax/payment_error_info.html', error)


@csrf_exempt
def billing_check_logic(request):

    json_data = request.body.decode('utf-8')
    json_loading_data = None

    token_result = func_get_payment_token()
    access_token = token_result['access_token']
    error = token_result['error']
    payment_user_info = None

    logger.info('test0')
    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    logger.info('test1')
    if error is None:
        merchant_uid = json_loading_data['merchant_uid']
        # print('merchant_uid:'+merchant_uid)
        try:
            payment_user_info = PaymentInfoTb.objects.get(merchant_uid=str(merchant_uid))
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오는데 실패했습니다.'
        # if error is None:
        #     user_id = payment_user_info.member_id

    logger.info(str(payment_user_info.member.name) + '님 결제 완료 체크1'
                + str(payment_user_info.member_id) + ':' + str(error))
    if error is None:
        h = httplib2.Http()
        resp, content = h.request("https://api.iamport.kr/payments/"+json_loading_data['imp_uid'], method="GET",
                                  headers={'Authorization': access_token})
        if resp['status'] != '200':
            error = '통신중 에러가 발생했습니다.'

    logger.info(str(payment_user_info.member.name) + '님 결제 완료 체크2'
                + str(payment_user_info.member_id) + ':' + str(error))
    if error is None:
        status = json_loading_data['status']
        if status == 'paid':  # 결제 완료
            if payment_user_info.payment_type_cd == 'PERIOD':
                func_set_billing_schedule(payment_user_info.customer_uid)  # 결제 정보 저장
        elif status == 'ready':
            logger.info('ready Test 상태입니다..')
        else:  # 재결제 시도
            func_resend_payment_info(payment_user_info.customer_uid, payment_user_info.merchant_uid)

    if error is None:
        error = 'test'
        logger.info(str(payment_user_info.member.name) + '님 결제 완료 체크3'
                    + str(payment_user_info.member_id) + ':' + str(json_loading_data['merchant_uid']))
        return render(request, 'ajax/payment_error_info.html', error)
    else:
        logger.error(str(payment_user_info.member.name) + '님 결제 완료 체크4'
                     + str(payment_user_info.member_id) + ':' + str(error))
        return render(request, 'ajax/payment_error_info.html', error)


class PaymentCompleteView(LoginRequiredMixin, TemplateView):
    template_name = 'payment_complete.html'

    def get_context_data(self, **kwargs):
        context = super(PaymentCompleteView, self).get_context_data(**kwargs)

        return context
