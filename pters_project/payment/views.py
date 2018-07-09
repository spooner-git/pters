import datetime
import json

import httplib2
import logging

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.shortcuts import render

# Create your views here.
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from django.utils import timezone

from configs import settings
from configs.const import USE, UN_USE
from login.models import MemberTb
from payment.function import func_set_billing_schedule, func_get_payment_token, func_resend_payment_info, \
    func_check_payment_price_info, func_get_end_date, func_send_refund_payment, func_add_billing_logic, \
    func_update_billing_logic
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
        error = func_check_payment_price_info(merchandise_type_cd, payment_type_cd, input_price)

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
def billing_finish_logic(request):

    json_data = request.body.decode('utf-8')
    json_loading_data = None

    merchandise_type_cd = None
    payment_type_cd = None
    paid_amount = 0
    context = {'error': None}
    error = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        try:
            merchandise_type_cd = json_loading_data['merchandise_type_cd']
        except KeyError:
            error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
        try:
            payment_type_cd = json_loading_data['payment_type_cd']
        except KeyError:
            error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
        try:
            paid_amount = json_loading_data['paid_amount']
        except KeyError:
            paid_amount = 0

    if error is None:
        error = func_check_payment_price_info(merchandise_type_cd,
                                              payment_type_cd, paid_amount)

    context['error'] = error
    if error is not None:
        messages.error(request, error)
        logger.error(str(request.user.last_name)+str(request.user.first_name)
                     + '(' + str(request.user.id) + ')님 결제 완료 오류:'
                     + str(error))
    return render(request, 'ajax/payment_error_info.html', context)


@csrf_exempt
def billing_check_logic(request):

    json_data = request.body.decode('utf-8')
    json_loading_data = None

    token_result = func_get_payment_token()
    access_token = token_result['access_token']
    error = token_result['error']
    payment_result = None
    imp_uid = None
    merchant_uid = None
    custom_data = None
    user_id = None
    member_info = None
    context = {'error': None}

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = 'imp_uid json parsing 에러 .'
    except TypeError:
        error = 'imp_uid json parsing 에러 .'

    if error is None:
        try:
            imp_uid = json_loading_data['imp_uid']
        except KeyError:
            error = 'imp_uid json parsing 에러 .'

    if error is None:
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
                error = '결제 정보 json data parsing 에러'
            except TypeError:
                error = '결제 정보 json data parsing 에러'

    if error is None:
        try:
            payment_result = json_loading_data['response']
            # logger.info(str(payment_result))

        except KeyError:
            error = '결제 정보 [response] json data parsing 에러'

    if error is None:
        try:
            merchant_uid = payment_result['merchant_uid']
        except KeyError:
            error = '결제 정보 [response] merchant_uid json data parsing 에러'

    if error is None:
        try:
            custom_data = json.loads(payment_result['custom_data'])
        except ValueError:
            custom_data = None
        except TypeError:
            custom_data = None

    if error is None:
        if custom_data is not None:
            try:
                user_id = custom_data['user_id']
                payment_type_cd = custom_data['payment_type_cd']
                merchandise_type_cd = custom_data['merchandise_type_cd']
                customer_uid = payment_result['customer_uid']
            except KeyError:
                error = '결제 정보 [custom_data] 세부사항 json data parsing KeyError'
            except TypeError:
                error = '결제 정보 [custom_data] 세부사항 json data parsing TypeError'
            except ValueError:
                error = '결제 정보 [custom_data] 세부사항 json data parsing ValueError'
        else:
            try:
                payment_user_info = PaymentInfoTb.objects.get(merchant_uid=merchant_uid)
                user_id = payment_user_info.member_id
                payment_type_cd = payment_user_info.payment_type_cd
                merchandise_type_cd = payment_user_info.payment_type_cd
                customer_uid = payment_user_info.customer_uid
            except ObjectDoesNotExist:
                error = '결제 정보 [정기결제 예약 스케쥴] 세부 사항 조회 에러'

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=user_id)
        except ObjectDoesNotExist:
            member_info = None
        logger.info(str(user_id))

    logger.info('pp1:'+str(error))
    if error is None:
        if payment_result['status'] == 'paid':  # 결제 완료
            logger.info('pp2')
            error = func_check_payment_price_info(merchandise_type_cd, payment_type_cd, payment_result['amount'])
            logger.info('pp3')
            if error is None:
                logger.info('pp4')
                if custom_data is not None:
                    payment_user_info_result = func_add_billing_logic(custom_data, payment_result)
                else:
                    payment_user_info_result = func_update_billing_logic(payment_result)
                logger.info('pp5')
                if payment_user_info_result['error'] is None:
                    logger.info('pp6')
                    if payment_type_cd == 'PERIOD':
                        # 결제 정보 저장
                        # if error is None:
                        func_set_billing_schedule(customer_uid, payment_user_info_result['payment_user_info'])
                else:
                    logger.info('pp7')
                    error = payment_user_info_result['error']

            else:
                # 결제 취소 날리기
                func_send_refund_payment(imp_uid, merchant_uid, access_token)
        elif payment_result['status'] == 'ready':
            logger.info('ready Test 상태입니다..')
        else:  # 재결제 시도
            func_resend_payment_info(customer_uid, merchant_uid,
                                     payment_result['amount'])

    if error is None:
        if member_info is not None:
            logger.info(str(member_info.name) + '님 정기 결제 완료['
                        + str(member_info.member_id) + ']' + str(payment_result['merchant_uid']))
    else:
        if member_info is not None:
            logger.error(str(member_info.name) + '님 결제 완료 체크['
                         + str(member_info.member_id) + ']' + str(error))
    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


class PaymentCompleteView(LoginRequiredMixin, TemplateView):
    template_name = 'payment_complete.html'

    def get_context_data(self, **kwargs):
        context = super(PaymentCompleteView, self).get_context_data(**kwargs)

        return context


@csrf_exempt
def resend_period_billing_logic(request):

    json_data = request.body.decode('utf-8')
    json_loading_data = None
    payment_user_info = None
    context = {'error': None}

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        merchant_uid = json_loading_data['merchant_uid']
        try:
            payment_user_info = PaymentInfoTb.objects.get(merchant_uid=str(merchant_uid))
        except ObjectDoesNotExist:
            error = '결제 정보를 불러오는데 실패했습니다.'

    if error is None:
        error = func_resend_payment_info(payment_user_info.customer_uid, payment_user_info.merchant_uid,
                                         payment_user_info.price)

    context['error'] = error
    if error is not None:
        messages.error(request, error)
        logger.error(str(request.user.last_name)+str(request.user.first_name)
                     + '(' + str(request.user.id) + ')님 재결제 신청 오류:'
                     + str(error))
    else:
        logger.info(str(request.user.last_name)+str(request.user.first_name)
                    + '(' + str(request.user.id) + ')님 재결제 신청 완료:')

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)
