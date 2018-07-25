import datetime
import html.parser as parser
import logging
from django import template
from django.core.exceptions import ObjectDoesNotExist

from django.utils import timezone
from configs.const import USE, UN_USE, AUTO_FINISH_ON, ON_SCHEDULE_TYPE
from payment.models import BillingInfoTb
from schedule.functions import func_refresh_lecture_count, func_refresh_group_status
from schedule.models import BackgroundImgTb, ScheduleTb, ClassLectureTb, LectureTb, GroupLectureTb, RepeatScheduleTb
from trainer.function import func_get_trainer_setting_list

register = template.Library()
logger = logging.getLogger(__name__)


@register.simple_tag
def get_background_url(request):
    class_id = request.session.get('class_id', '')
    background_url = []
    background_img_data = BackgroundImgTb.objects.filter(class_tb_id=class_id,
                                                         use=USE).order_by('-class_tb_id')
    for background_img_info in background_img_data:
        background_url.append(parser.unescape(background_img_info.url))
    return background_url


@register.simple_tag
def get_background_type_cd(request):
    class_id = request.session.get('class_id', '')
    background_img_type_cd = []
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
    context = func_get_trainer_setting_list(context, request.user.id, class_id)

    request.session['setting_member_reserve_time_available'] = context['lt_res_01']
    request.session['setting_member_reserve_time_prohibition'] = context['lt_res_02']
    request.session['setting_member_reserve_prohibition'] = context['lt_res_03']
    request.session['setting_trainer_work_time_available'] = context['lt_res_04']
    request.session['setting_member_reserve_date_available'] = context['lt_res_05']
    request.session['setting_member_reserve_enable_time'] = context['lt_res_enable_time']
    request.session['setting_member_reserve_cancel_time'] = context['lt_res_cancel_time']
    request.session['setting_member_time_duration'] = context['lt_res_member_time_duration']
    request.session['setting_member_start_time'] = context['lt_res_member_start_time']
    request.session['setting_schedule_auto_finish'] = context['lt_schedule_auto_finish']
    request.session['setting_lecture_auto_finish'] = context['lt_lecture_auto_finish']
    request.session['setting_language'] = context['lt_lan_01']

    request.session['setting_trainee_schedule_confirm1'] = context['lt_pus_01']
    request.session['setting_trainee_schedule_confirm2'] = context['lt_pus_02']
    request.session['setting_trainee_no_schedule_confirm'] = context['lt_pus_03']
    request.session['setting_trainer_schedule_confirm'] = context['lt_pus_04']
    request.session['setting_trainer_no_schedule_confirm1'] = context['lt_pus_05']
    request.session['setting_trainer_no_schedule_confirm2'] = context['lt_pus_06']

    if context['lt_schedule_auto_finish'] == AUTO_FINISH_ON:
        not_finish_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                             end_dt__lt=now, state_cd='NP',
                                                             en_dis_type=ON_SCHEDULE_TYPE, use=USE)
        for not_finish_schedule_info in not_finish_schedule_data:
            not_finish_schedule_info.state_cd = 'PE'
            not_finish_schedule_info.save()
            func_refresh_lecture_count(not_finish_schedule_info.lecture_tb_id)

    if context['lt_lecture_auto_finish'] == AUTO_FINISH_ON:
        class_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, auth_cd='VIEW',
                                                           lecture_tb__end_date__lt=datetime.date.today(),
                                                           lecture_tb__state_cd='IP',
                                                           lecture_tb__use=USE,
                                                           use=USE)

        for class_lecture_info in class_lecture_data:
            lecture_info = class_lecture_info.lecture_tb

            try:
                group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=USE)
            except ObjectDoesNotExist:
                group_info = None

            schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id).exclude(state_cd='PE')
            repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
            if len(schedule_data) > 0:
                schedule_data.delete()
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
def get_function_auth(request):
    today = datetime.date.today()
    # function_auth = []
    # function_auth_data = FunctionAuthTb.objects.filter(member_id=request.user.id,
    #                                                    expired_date__gte=today,
    #                                                    use=USE)
    # for function_auth_info in function_auth_data:
    #     function_auth.append(parser.unescape(function_auth_info.function_auth_type_cd))

    billing_data = BillingInfoTb.objects.filter(next_payment_date__lt=today, use=USE)

    if len(billing_data) > 0:
        for billing_info in billing_data:
            billing_info.state_cd = 'ST'
            billing_info.use = UN_USE
            billing_info.save()

    return billing_data
