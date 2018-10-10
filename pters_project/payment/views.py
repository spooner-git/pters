import datetime
import json

import httplib2
import logging

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.shortcuts import render, redirect
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

# Create your views here.

from configs import settings
from configs.const import USE, UN_USE

from login.models import MemberTb
from .models import PaymentInfoTb, BillingInfoTb, ProductTb, BillingCancelInfoTb, ProductPriceTb

from .functions import func_set_billing_schedule, func_get_payment_token, func_resend_payment_info, \
    func_check_payment_price_info, func_get_end_date, func_cancel_period_billing_schedule, \
    func_iamport_webhook_customer_billing_logic

logger = logging.getLogger(__name__)


class PaymentView(LoginRequiredMixin, View):
    template_name = 'payment.html'

    def get(self, request):
        context = {}

        product_list = ProductTb.objects.filter(upper_product_id='1', use=USE).order_by('order')
        for product_info in product_list:
            product_price_list = ProductPriceTb.objects.filter(product_tb_id=product_info.product_id, use=USE).order_by('order')
            sub_product_list = ProductTb.objects.filter(upper_product_id=product_info.product_id, use=USE).order_by('order')
            product_info.price_list = product_price_list
            if len(sub_product_list) > 0:
                product_info.sub_product_list = sub_product_list
                for sub_product_info in sub_product_list:
                    sub_product_price_list = ProductPriceTb.objects.filter(product_tb_id=sub_product_info.product_id, use=USE).order_by('order')
                    sub_product_info.sub_price_list = sub_product_price_list
        payment_count = PaymentInfoTb.objects.filter(member_id=request.user.id).count()
        context['payment_count'] = payment_count
        context['payment_id'] = getattr(settings, "PAYMENT_ID", '')
        context['product_data'] = product_list

        return render(request, self.template_name, context)


def check_before_billing_logic(request):
    json_data = request.body.decode('utf-8')
    json_loading_data = None
    context = {}
    error = None
    product_id = None
    payment_type_cd = None
    input_price = 0
    single_payment_counter = 0
    billing_info = ''
    today = datetime.date.today()
    next_payment_date = today

    month_first_day = today.replace(day=1)
    next_year = int(month_first_day.strftime('%Y')) + 1
    next_month = (int(month_first_day.strftime('%m')) + 1) % 13
    if next_month == 0:
        next_month = 1
    next_month_first_day = month_first_day.replace(month=next_month)
    if next_month == 1:
        next_month_first_day = next_month_first_day.replace(year=next_year)

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        try:
            payment_type_cd = json_loading_data['payment_type_cd']
            product_id = json_loading_data['product_id']
            input_price = json_loading_data['price']
            period_month = json_loading_data['period_month']
        except KeyError:
            error = '오류가 발생했습니다.'

    if error is None:
        error = func_check_payment_price_info(product_id, payment_type_cd, input_price, period_month)

    if error is None:
        # merchandise_type_cd_list = merchandise_type_cd.split('/')

        equal_period_payment_counter = BillingInfoTb.objects.filter(member_id=request.user.id,
                                                                    merchandise_type_cd=product_id,
                                                                    next_payment_date__gt=today,
                                                                    use=USE).count()

        if equal_period_payment_counter > 0:
            error = '이미 정기결제 중인 기능이 포함되어있어 결제할수 없습니다.'

    if error is None:
        # for merchandise_type in merchandise_type_cd_list:
        contain_period_payment_counter = BillingInfoTb.objects.filter(member_id=request.user.id,
                                                                      merchandise_type_cd__contains=product_id,
                                                                      next_payment_date__gt=today,
                                                                      use=USE).count()
        if contain_period_payment_counter > 0:
            billing_info = '이미 정기결제 중인 이용권에 기능이 포함되어있습니다. 그래도 결제 진행하시겠습니까? '
            # error = '이미 정기결제 중인 기능이 포함되어있어 결제할수 없습니다.'
            # break

        single_payment_counter += PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                               payment_type_cd='SINGLE',
                                                               merchandise_type_cd__contains=product_id,
                                                               end_date__gt=today, use=USE).count()
    # 정기 결제가 포함되어있지 않은 경우만 실행, 마지막 결제 정보 불러오기
    if error is None:
        try:
            payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                        merchandise_type_cd__contains=product_id,
                                                        use=USE).latest('end_date')
            next_payment_date = payment_info.end_date
        except ObjectDoesNotExist:
            next_payment_date = today

    if error is None:
        date = int(next_payment_date.strftime('%d'))
        context['next_start_date'] = str(next_payment_date)
        context['next_end_date'] = str(func_get_end_date(payment_type_cd, next_payment_date, 1, date))

        if single_payment_counter > 0:
            if payment_type_cd == 'PERIOD':
                billing_info += context['next_start_date'] + '부터 결제가 진행됩니다.'
                # billing_info = '이미 결제중인 기능이 포함되어 있습니다. ' + context['next_start_date'] + '부터 결제가 진행됩니다.'
            else:
                billing_info = '이미 결제중인 이용권에 기능이 포함되어 있어 ' + \
                               context['next_start_date'] + '~' + context['next_end_date'] + ' 이용권 결제가 진행됩니다. '

    if error is not None:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['billing_info'] = billing_info

    return render(request, 'ajax/payment_error_info.html', context)


def check_finish_billing_logic(request):

    json_data = request.body.decode('utf-8')
    json_loading_data = None

    product_id = None
    payment_type_cd = None
    paid_amount = 0
    context = {}
    error = None
    today = datetime.date.today()

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        try:
            product_id = json_loading_data['product_id']
            payment_type_cd = json_loading_data['payment_type_cd']
            paid_amount = json_loading_data['paid_amount']
            start_date = json_loading_data['start_date']
            period_month = json_loading_data['period_month']
        except KeyError:
            error = '오류가 발생했습니다.'

    if error is None:
        if str(today) == start_date or payment_type_cd == 'SINGLE':
            error = func_check_payment_price_info(product_id, payment_type_cd, paid_amount, period_month)

    if error is not None:
        messages.error(request, error)
        logger.error(str(request.user.last_name)+str(request.user.first_name)
                     + '(' + str(request.user.id) + ')님 결제 완료 오류:' + str(error))

    return render(request, 'ajax/payment_error_info.html', context)


@csrf_exempt
def billing_check_logic(request):

    json_data = request.body.decode('utf-8')
    json_loading_data = None

    payment_result = None
    imp_uid = None
    merchant_uid = None
    custom_data = None
    user_id = None
    member_info = None
    context = {}

    token_result = func_get_payment_token()
    access_token = token_result['access_token']
    error = token_result['error']

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        try:
            imp_uid = json_loading_data['imp_uid']
        except KeyError:
            error = '오류가 발생했습니다.'

    # 결제 정보 가져오기
    if error is None:
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
        try:
            payment_result = json_loading_data['response']
            merchant_uid = payment_result['merchant_uid']

        except KeyError:
            error = '오류가 발생했습니다.'

    if error is None:
        try:
            custom_data = json.loads(payment_result['custom_data'])
        except ValueError:
            custom_data = None
        except TypeError:
            custom_data = None

    if error is None:
        webhook_info = func_iamport_webhook_customer_billing_logic(custom_data, payment_result, merchant_uid,
                                                                   imp_uid, access_token)
        error = webhook_info['error']
        user_id = webhook_info['user_id']

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=user_id)
        except ObjectDoesNotExist:
            member_info = None

    if error is None:
        if member_info is not None:
            logger.info(str(member_info.name) + '님 정기 결제 완료['
                        + str(member_info.member_id) + ']' + str(payment_result['merchant_uid']))
    else:
        if member_info is not None:
            logger.error(str(member_info.name) + '님 결제 오류['
                         + str(member_info.member_id) + ']' + str(error))

    return render(request, 'ajax/payment_error_info.html', context)


def cancel_period_billing_logic(request):
    customer_uid = request.POST.get('customer_uid', '')
    cancel_type = request.POST.get('cancel_type', '')
    cancel_reason = request.POST.get('cancel_reason', '')
    next_page = request.POST.get('next_page', '')
    context = {'error': None}
    payment_data = None
    billing_info = None
    error = None

    payment_data = PaymentInfoTb.objects.filter(customer_uid=customer_uid,
                                                status='reserve',
                                                payment_type_cd='PERIOD')

    try:
        billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid, use=USE)
    except ObjectDoesNotExist:
        error = '정기 결제 정보를 불러오지 못했습니다.'

    if error is None:
        error = func_cancel_period_billing_schedule(customer_uid)
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
        if len(payment_data) > 0:
            payment_data.update(status='cancelled', use=UN_USE)

    if error is not None:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return redirect(next_page)


# 정기 결제 재시작 기능 - 확인 필요
def restart_period_billing_logic(request):
    customer_uid = request.POST.get('customer_uid', '')
    next_page = request.POST.get('next_page', '')
    # json_data = request.body.decode('utf-8')
    # json_loading_data = None
    # customer_uid = None
    context = {'error': None}
    error = None
    payment_info = None
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
            payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id, customer_uid=customer_uid,
                                                        payment_type_cd='PERIOD', status='paid').latest('end_date')
        except ObjectDoesNotExist:
            payment_info = None
        # payment_data = PaymentInfoTb.objects.filter(customer_uid=customer_uid,
        #                                             payment_type_cd='PERIOD', use=USE).order_by('end_date')
        # if len(payment_data) > 0:
        #     payment_info = payment_data[0]
        if payment_info is not None:
            if payment_info.end_date < today:
                payment_info.end_date = today

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
                    + '(' + str(request.user.id) + ')님 재결제 신청 완료')

    context['error'] = error
    return redirect(next_page)


# 정기 결제 일시정지 해제 기능 - 확인 필요
def clear_pause_period_billing_logic(request):
    customer_uid = request.POST.get('customer_uid', '')
    next_page = request.POST.get('next_page', '')
    # json_data = request.body.decode('utf-8')
    # json_loading_data = None
    # customer_uid = None
    context = {'error': None}
    error = None
    payment_info = None
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
            payment_info = PaymentInfoTb.objects.filter(member_id=request.user.id, customer_uid=customer_uid,
                                                        payment_type_cd='PERIOD', status='paid',
                                                        use=USE).latest('end_date')
        except ObjectDoesNotExist:
            payment_info = None
        # payment_data = PaymentInfoTb.objects.filter(customer_uid=customer_uid,
        #                                             payment_type_cd='PERIOD', use=USE).order_by('end_date')
        # if len(payment_data) > 0:
        #     payment_info = payment_data[0]
        if payment_info is not None:
            if payment_info.end_date < today:
                payment_info.end_date = today

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
    return redirect(next_page)


def update_period_billing_logic(request):
    json_data = request.body.decode('utf-8')
    json_loading_data = None
    error = None
    customer_uid = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        customer_uid = json_loading_data['customer_uid']
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
            billing_info = BillingInfoTb.objects.get(customer_uid=customer_uid, use=USE)
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
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

    context['error'] = error
    return render(request, 'ajax/payment_error_info.html', context)


def check_update_period_billing_logic(request):
    json_data = request.body.decode('utf-8')
    json_loading_data = None
    context = {'error': None, 'start_date': None}
    error = None
    billing_info = None
    today = datetime.date.today()
    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다.'
    except TypeError:
        error = '오류가 발생했습니다.'

    if error is None:
        customer_uid = json_loading_data['customer_uid']

    if error is None:
        try:
            billing_info = BillingInfoTb.objects.get(member_id=request.user.id, customer_uid=customer_uid, use=USE)
        except ObjectDoesNotExist:
            billing_info = None

    if error is None:
        if billing_info is not None:
            context['next_start_date'] = str(billing_info.next_payment_date)
        else:
            context['next_start_date'] = str(today)

    if error is not None:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
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
                                                    use=UN_USE).order_by('-end_date')
        if len(payment_data) > 0:
            payment_info = payment_data[0]
        context['payment_info'] = payment_info

        return render(request, self.template_name, context)


class GetPaymentInfoView(LoginRequiredMixin, View):
    template_name = 'ajax/payment_info.html'

    def get(self, request):
        context = {}
        payment_info = None
        payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                    use=USE).order_by('-end_date')
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
        payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id, use=USE).order_by('-end_date')
        context['payment_data'] = payment_data

        return render(request, self.template_name, context)


class PaymentCompleteView(LoginRequiredMixin, TemplateView):
    template_name = 'payment_complete.html'

    def get_context_data(self, **kwargs):
        context = super(PaymentCompleteView, self).get_context_data(**kwargs)

        return context


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
        logger.error(str(request.user.last_name)+str(request.user.first_name)
                     + '(' + str(request.user.id) + ')님 재결제 신청 오류:'
                     + str(error))
    else:
        logger.info(str(request.user.last_name)+str(request.user.first_name)
                    + '(' + str(request.user.id) + ')님 재결제 신청 완료:')

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
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
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
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
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
        cancel_period_payment_data = []
        stop_period_payment_data = []
        current_billing_info = []
        period_info_flag = []
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
            payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                        merchandise_type_cd=product_info.product_id,
                                                        # payment_type_cd='SINGLE',
                                                        end_date__gte=today,
                                                        status='paid',
                                                        # price__gt=0,
                                                        use=USE)

            period_payment_data = PaymentInfoTb.objects.filter(Q(status='reserve') | Q(status='cancelled'),
                                                               member_id=request.user.id,
                                                               merchandise_type_cd=product_info.product_id,
                                                               end_date__gte=today,
                                                               # price__gt=0,
                                                               payment_type_cd='PERIOD').order_by('-end_date',
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
                                                         merchandise_type_cd=product_info.product_id,
                                                         use=USE)
            except ObjectDoesNotExist:
                billing_info = None

            if len(payment_data) > 0:
                for payment_info in payment_data:
                    try:
                        merchandise_type = ProductTb.objects.get(merchandise_type_cd=payment_info.product_id)
                        merchandise_type_name = merchandise_type.contents
                    except ObjectDoesNotExist:
                        merchandise_type_name = ''
                    merchandise_type_name_list = merchandise_type_name.split('+')
                    payment_info.merchandise_type_name = merchandise_type_name_list

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
                    merchandise_type = ProductTb.objects.get(merchandise_type_cd=period_payment_info.product_id)
                    merchandise_type_name = merchandise_type.contents
                except ObjectDoesNotExist:
                    merchandise_type_name = ''
                merchandise_type_name_list = merchandise_type_name.split('+')
                period_payment_info.merchandise_type_name = merchandise_type_name_list
                # period_payment_info.start_date = payment_info.start_date
                # period_payment_info.end_date = payment_info.end_date
                if billing_info is None:
                    period_payment_info.next_payment_date = period_payment_info.end_date
                    period_payment_info.billing_state_name = '종료 예정일'
                else:

                    period_payment_info.billing_info = billing_info
                    period_payment_info.next_payment_date = billing_info.next_payment_date
                    period_payment_info.billing_state_cd = billing_info.state_cd
                    # period_payment_info.customer_uid = billing_info.customer_uid
                    # period_payment_info.pay_method = billing_info.pay_method
                    if billing_info.state_cd == 'IP':
                        period_payment_info.billing_state_name = '결제 예정일'
                        current_period_payment_data.append(period_payment_info)
                    elif billing_info.state_cd == 'ST':
                        period_payment_info.billing_state_name = '종료 예정일'
                        cancel_period_payment_data.append(period_payment_info)
                    else:
                        period_payment_info.billing_state_name = '종료 예정일'
                        current_period_payment_data.append(period_payment_info)
                        stop_period_payment_data.append(period_payment_info)

                current_billing_info.append(period_payment_info)

        payment_data_history = PaymentInfoTb.objects.filter(member_id=request.user.id,
                                                            # status='paid',
                                                            # price__gt=0,
                                                            use=USE).exclude(status='pre_paid').order_by('-end_date')
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
        context['current_period_payment_data'] = current_period_payment_data
        context['cancel_period_payment_data'] = cancel_period_payment_data
        context['stop_period_payment_data'] = stop_period_payment_data

        context['current_billing_info'] = current_billing_info

        return render(request, self.template_name, context)

