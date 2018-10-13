import datetime
import html.parser as parser
import logging
from django import template
from django.core.exceptions import ObjectDoesNotExist

from django.utils import timezone
from configs.const import USE, UN_USE, AUTO_FINISH_ON, ON_SCHEDULE_TYPE
from login.models import PushInfoTb
from payment.models import BillingInfoTb, PaymentInfoTb, ProductFunctionAuthTb
from schedule.functions import func_refresh_lecture_count, func_refresh_group_status
from schedule.models import ScheduleTb, RepeatScheduleTb
from trainer.models import ClassLectureTb, GroupLectureTb, BackgroundImgTb, ClassTb
from trainer.functions import func_get_trainer_setting_list

register = template.Library()
logger = logging.getLogger(__name__)


@register.simple_tag
def get_background_url(request):
    class_id = request.session.get('class_id', '')
    background_url = []
    if class_id != '':
        background_img_data = BackgroundImgTb.objects.select_related('class_tb').filter(class_tb_id=class_id,
                                                                                        use=USE).order_by('-class_tb_id')
        for background_img_info in background_img_data:
            background_url.append(parser.unescape(background_img_info.url))
    return background_url


@register.simple_tag
def get_background_type_cd(request):
    class_id = request.session.get('class_id', '')
    background_img_type_cd = []
    if class_id != '':
        background_img_data = BackgroundImgTb.objects.filter(class_tb_id=class_id,
                                                             use=USE).order_by('-class_tb_id')
        for background_img_info in background_img_data:
            background_img_type_cd.append(parser.unescape(background_img_info.background_img_type_cd))
    return background_img_type_cd


@register.simple_tag
def get_setting_info(request):
    context = {}
    now = timezone.now()
    class_id = request.session.get('class_id', '')
    device_id = request.session.get('device_id', 'pc')
    if class_id != '':

        token_data = PushInfoTb.objects.filter(member_id=request.user.id, device_id=device_id, use=USE)
        if len(token_data) == 0:
            token_info = ''
        elif len(token_data) == 1:
            token_info = token_data[0].token
        else:
            token_data.delete()
            token_info = ''

        request.session['push_token'] = token_info

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            class_info = None

        if class_info is not None:
            request.session['class_hour'] = class_info.class_hour
            request.session['class_type_code'] = class_info.subject_cd
            request.session['class_type_name'] = class_info.get_class_type_cd_name()
            request.session['class_center_name'] = class_info.get_center_name()

        context = func_get_trainer_setting_list(context, request.user.id, class_id)

        request.session['setting_member_reserve_time_available'] = context['lt_res_01']
        request.session['setting_member_reserve_time_prohibition'] = context['lt_res_02']
        request.session['setting_member_reserve_prohibition'] = context['lt_res_03']
        # request.session['setting_trainer_work_time_available'] = context['lt_res_04']

        request.session['setting_trainer_work_sun_time_avail'] = context['lt_work_sun_time_avail']
        request.session['setting_trainer_work_mon_time_avail'] = context['lt_work_mon_time_avail']
        request.session['setting_trainer_work_tue_time_avail'] = context['lt_work_tue_time_avail']
        request.session['setting_trainer_work_wed_time_avail'] = context['lt_work_wed_time_avail']
        request.session['setting_trainer_work_ths_time_avail'] = context['lt_work_ths_time_avail']
        request.session['setting_trainer_work_fri_time_avail'] = context['lt_work_fri_time_avail']
        request.session['setting_trainer_work_sat_time_avail'] = context['lt_work_sat_time_avail']

        request.session['setting_member_reserve_date_available'] = context['lt_res_05']
        request.session['setting_member_reserve_enable_time'] = context['lt_res_enable_time']
        request.session['setting_member_reserve_cancel_time'] = context['lt_res_cancel_time']
        request.session['setting_member_time_duration'] = context['lt_res_member_time_duration']
        request.session['setting_member_start_time'] = context['lt_res_member_start_time']
        request.session['setting_schedule_auto_finish'] = context['lt_schedule_auto_finish']
        request.session['setting_lecture_auto_finish'] = context['lt_lecture_auto_finish']
        request.session['setting_to_trainee_lesson_alarm'] = context['lt_pus_to_trainee_lesson_alarm']
        request.session['setting_from_trainee_lesson_alarm'] = context['lt_pus_from_trainee_lesson_alarm']
        request.session['setting_language'] = context['lt_lan_01']

        if context['lt_schedule_auto_finish'] == AUTO_FINISH_ON:
            not_finish_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                 end_dt__lte=now, state_cd='NP',
                                                                 en_dis_type=ON_SCHEDULE_TYPE, use=USE)
            for not_finish_schedule_info in not_finish_schedule_data:
                not_finish_schedule_info.state_cd = 'PE'
                not_finish_schedule_info.save()
                func_refresh_lecture_count(not_finish_schedule_info.lecture_tb_id)

        if context['lt_lecture_auto_finish'] == AUTO_FINISH_ON:
            class_lecture_data = ClassLectureTb.objects.select_related('lecture_tb').filter(class_tb_id=class_id,
                                                                                            auth_cd='VIEW',
                                                                                            lecture_tb__end_date__lt
                                                                                            =datetime.date.today(),
                                                                                            lecture_tb__state_cd='IP',
                                                                                            lecture_tb__use=USE,
                                                                                            use=USE)

            for class_lecture_info in class_lecture_data:
                lecture_info = class_lecture_info.lecture_tb

                try:
                    group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=USE)
                except ObjectDoesNotExist:
                    group_info = None

                schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                          end_dt__lte=now, use=USE).exclude(state_cd='PE')
                schedule_data_delete = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                                 end_dt__gt=now, use=USE).exclude(state_cd='PE')
                repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                if len(schedule_data) > 0:
                    schedule_data.update(state_cd='PE')
                if len(schedule_data_delete) > 0:
                    schedule_data_delete.delete()
                if len(repeat_schedule_data) > 0:
                    repeat_schedule_data.delete()
                lecture_info.lecture_avail_count = 0
                lecture_info.lecture_rem_count = 0
                lecture_info.state_cd = 'PE'
                lecture_info.save()

                if group_info is not None:
                    func_refresh_group_status(group_info.group_tb_id, None, None)

    return context


@register.simple_tag
def get_function_auth_type_cd(request):
    context = {}
    today = datetime.date.today()
    billing_data = BillingInfoTb.objects.filter(member_id=request.user.id,
                                                next_payment_date__lt=today, use=USE)
    payment_data = PaymentInfoTb.objects.filter(member_id=request.user.id, status='paid',
                                                start_date__lte=today, end_date__gte=today, use=USE)

    for billing_info in billing_data:
        billing_info.state_cd = 'END'
        # billing_info.use = UN_USE
        billing_info.save()

    request.session['product_type_name'] = ''
    payment_data_counter = 0
    for payment_info in payment_data:
        function_list = ProductFunctionAuthTb.objects.select_related('function_auth_tb', 'product_tb'
                                                                     ).filter(product_tb_id=payment_info.product_tb_id,
                                                                              use=USE).order_by('product_tb_id',
                                                                                                'function_auth_tb_id',
                                                                                                'auth_type_cd')
        if len(function_list) > 0:
            if payment_data_counter == 0:
                request.session['product_type_name'] += function_list[0].product_tb.name
            else:
                request.session['product_type_name'] += function_list[0].product_tb.name + ','

        for function_info in function_list:
            auth_info = {}
            if function_info.auth_type_cd is None:
                function_auth_type_cd_name = function_info.function_auth_tb.function_auth_type_cd
            else:
                function_auth_type_cd_name = function_info.function_auth_tb.function_auth_type_cd \
                                             + str(function_info.auth_type_cd)

            auth_info['active'] = 1
            auth_info['limit_num'] = function_info.counts
            auth_info['limit_type'] = function_info.product_tb.name
            context[function_auth_type_cd_name] = auth_info
            # merchandise_type_cd_list.append(function_info.function_auth_tb.function_auth_type_cd)
        payment_data_counter += 1

    if len(payment_data) == 0:
        function_list = ProductFunctionAuthTb.objects.select_related('function_auth_tb', 'product_tb'
                                                                     ).filter(product_tb_id=6,
                                                                              use=USE).order_by('product_tb_id',
                                                                                                'function_auth_tb_id',
                                                                                                'auth_type_cd')
        if len(function_list) > 0:
            request.session['product_type_name'] += function_list[0].product_tb.name

        for function_info in function_list:
            auth_info = {}
            if function_info.auth_type_cd is None:
                function_auth_type_cd_name = function_info.function_auth_tb.function_auth_type_cd
            else:
                function_auth_type_cd_name = function_info.function_auth_tb.function_auth_type_cd \
                                             + str(function_info.auth_type_cd)
            auth_info['active'] = 1
            auth_info['limit_num'] = function_info.counts
            auth_info['limit_type'] = function_info.product_tb.name
            context[function_auth_type_cd_name] = auth_info
            # merchandise_type_cd_list.append(function_info.function_auth_tb.function_auth_type_cd)

    return context
