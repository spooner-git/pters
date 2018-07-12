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
    func_update_billing_logic, func_cancel_period_billing_schedule
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
    # start_date = None
    # end_date = None
    # date = None
    input_price = 0
    payment_info = None
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
        input_price = json_loading_data['price']

    if error is None:
        # today = datetime.datetime.combine(today, datetime.datetime.min.time())
        billing_info = BillingInfoTb.objects.filter(member_id=request.user.id, state_cd='IP', use=USE).count()
        if billing_info > 0:
            error = '이미 정기결제 중인 기능입니다.'

    if error is None:
        payment_user_info = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                         end_date__lt=datetime.date.today(),
                                                         use=USE).order_by('end_date')
        if len(payment_user_info) > 0:
            payment_info = payment_user_info[0]

    if error is None:
        if payment_info is not None:
            date = int(payment_info.start_date.strftime('%d'))
            context['start_date'] = payment_info.start_date
            context['end_date'] = payment_info.end_date
            context['next_start_date'] = payment_info.end_date
            context['next_end_date'] = func_get_end_date(payment_info.payment_type_cd,
                                                         payment_info.start_date, 1, date)

    if error is None:
        error = func_check_payment_price_info(merchandise_type_cd, payment_type_cd, input_price)

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
            except KeyError:
                error = '결제 정보 [custom_data] 세부사항 json data parsing KeyError'
            except TypeError:
                error = '결제 정보 [custom_data] 세부사항 json data parsing TypeError'
            except ValueError:
                error = '결제 정보 [custom_data] 세부사항 json data parsing ValueError'

            try:
                customer_uid = custom_data['customer_uid']
            except KeyError:
                customer_uid = None
            except TypeError:
                customer_uid = None
            except ValueError:
                customer_uid = None
        else:
            try:
                payment_user_info = PaymentInfoTb.objects.get(merchant_uid=merchant_uid)
                user_id = payment_user_info.member_id
                payment_type_cd = payment_user_info.payment_type_cd
                merchandise_type_cd = payment_user_info.merchandise_type_cd
                customer_uid = payment_user_info.customer_uid
            except ObjectDoesNotExist:
                error = '결제 정보 [정기결제 예약 스케쥴] 세부 사항 조회 에러'

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=user_id)
        except ObjectDoesNotExist:
            member_info = None

    if error is None:
        if payment_result['status'] == 'paid':  # 결제 완료
            error = func_check_payment_price_info(merchandise_type_cd, payment_type_cd, payment_result['amount'])
            if error is None:
                if custom_data is not None:
                    payment_user_info_result = func_add_billing_logic(custom_data, payment_result)
                else:
                    payment_user_info_result = func_update_billing_logic(payment_result)
                if payment_user_info_result['error'] is None:
                    if payment_type_cd == 'PERIOD':
                        # 결제 정보 저장
                        # if error is None:
                        func_set_billing_schedule(customer_uid, payment_user_info_result['payment_user_info'])
                else:
                    error = payment_user_info_result['error']

            else:
                # 결제 취소 날리기
                func_send_refund_payment(imp_uid, merchant_uid, access_token)
        elif payment_result['status'] == 'ready':
            logger.info('ready Test 상태입니다..')
        else:  # 재결제 시도
            payment_user_info_result = func_update_billing_logic(payment_result)
            # func_resend_payment_info(customer_uid, merchant_uid,
            #                          payment_result['amount'])
            if payment_user_info_result['error'] is not None:
                error = payment_user_info_result['error']

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


@csrf_exempt
def cancel_period_billing_logic(request):
    json_data = request.body.decode('utf-8')
    json_loading_data = None
    context = {'error': None}
    customer_uid = None
    # merchant_uid = None
    payment_data = None
    billing_info = None
    error = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        try:
            customer_uid = json_loading_data['customer_uid']
            # merchant_uid = json_loading_data['merchant_uid']
        except KeyError:
            error = '결제 정보 json data parsing KeyError'
        except TypeError:
            error = '결제 정보 json data parsing TypeError'
        except ValueError:
            error = '결제 정보 json data parsing ValueError'

    if error is None:
        payment_data = PaymentInfoTb.objects.filter(customer_uid=customer_uid,
                                                    status__isnull=True,
                                                    payment_type_cd='PERIOD', use=UN_USE)
    if error is None:
        try:
            billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid, use=USE)
        except ObjectDoesNotExist:
            error = '정기 결제 정보를 불러오지 못했습니다.'

    if error is None:
        error = func_cancel_period_billing_schedule(customer_uid)

    if error is None:
        billing_info.state_cd = 'ST'
        billing_info.save()

    if error is None:
        if len(payment_data) > 0:
            payment_data.update(mod_dt=timezone.now(), status='cancel', use=UN_USE)

    if error is not None:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


# 정기 결제 재시작 기능 - 확인 필요
@csrf_exempt
def restart_period_billing_logic(request):

    json_data = request.body.decode('utf-8')
    json_loading_data = None
    customer_uid = None
    context = {'error': None}

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        try:
            customer_uid = json_loading_data['customer_uid']
        except KeyError:
            error = '결제 정보 json data parsing KeyError'
        except TypeError:
            error = '결제 정보 json data parsing TypeError'
        except ValueError:
            error = '결제 정보 json data parsing ValueError'

    if error is None:
        payment_data = PaymentInfoTb.objects.filter(customer_uid=customer_uid,
                                                    payment_type_cd='PERIOD', use=USE).order_by('end_date')
        if len(payment_data) > 0:
            payment_info = payment_data[0]
    if error is None:
        try:
            billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid, state_cd='ST', use=USE)
            billing_info.state_cd = 'IP'
            billing_info.save()
        except ObjectDoesNotExist:
            error = '정기 결제 정보를 불러오지 못했습니다.'

    if error is None:
        error = func_set_billing_schedule(customer_uid, payment_info)

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


@csrf_exempt
def update_period_billing_logic(request):
    # 기존 예약 결제 취소 -> 0원으로 billing 결제 및 새로운 예약 스케쥴 등록
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
        payment_user_info_result = func_update_billing_logic(payment_user_info)
        func_set_billing_schedule(payment_user_info.customer_uid, payment_user_info_result['payment_user_info'])
        error = payment_user_info_result['error']

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


class GetPaymentScheduleInfoView(LoginRequiredMixin, View):
    template_name = 'payment_complete.html'

    def get(self, request):
        context = {}
        payment_info = None
        payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                    end_date__lt=datetime.date.today(),
                                                    payment_type_cd='PERIOD',
                                                    use=UN_USE).order_by('end_date')
        if len(payment_data) > 0:
            payment_info = payment_data[0]
        context['payment_info'] = payment_info

        return context


class GetPaymentInfoView(LoginRequiredMixin, View):
    template_name = 'payment_complete.html'

    def get(self, request):
        context = {}
        payment_info = None
        payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                    end_date__lt=datetime.date.today(),
                                                    use=USE).order_by('end_date')
        if len(payment_data) > 0:
            payment_info = payment_data[0]
        context['payment_info'] = payment_info

        return context


class GetBillingInfoView(LoginRequiredMixin, View):
    template_name = 'payment_complete.html'

    def get(self, request):
        context = {'error': None, 'billing_info': None}

        try:
            billing_info = BillingInfoTb.objects.get(member_id=request.user.id,
                                                     state_cd='IP',
                                                     use=USE)
        except ObjectDoesNotExist:
            context['error'] = '정기 결제 진행중인 내역이 없습니다.'

        if context['error'] is not None:
            context['billing_info'] = billing_info

        return context


class GetPaymentListView(LoginRequiredMixin, View):
    template_name = 'payment_list.html'

    def get(self, request):
        context = {}
        payment_list = PaymentInfoTb.objects.filter(member_id=request.user.id, use=USE)
        context['payment_list'] = payment_list

        return context


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


@csrf_exempt
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
        if payment_user_info is not None:
            payment_user_info.use = UN_USE
            payment_user_info.save()

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

