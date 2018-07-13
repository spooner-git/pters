import html.parser as parser
import logging
from django import template

from configs.const import USE
from schedule.models import BackgroundImgTb
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
    request.session['setting_language'] = context['lt_lan_01']

    request.session['setting_trainee_schedule_confirm1'] = context['lt_pus_01']
    request.session['setting_trainee_schedule_confirm2'] = context['lt_pus_02']
    request.session['setting_trainee_no_schedule_confirm'] = context['lt_pus_03']
    request.session['setting_trainer_schedule_confirm'] = context['lt_pus_04']
    request.session['setting_trainer_no_schedule_confirm1'] = context['lt_pus_05']
    request.session['setting_trainer_no_schedule_confirm2'] = context['lt_pus_06']

    return context
