import datetime
import logging
import random

from html import parser

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.sites.shortcuts import get_current_site
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, redirect
from django.utils.datastructures import MultiValueDictKeyError
from django.views.generic import TemplateView, RedirectView

from configs import settings
from configs.const import USE, STATE_CD_NOT_PROGRESS, ON_SCHEDULE_TYPE, AUTO_FINISH_ON, STATE_CD_FINISH, \
    STATE_CD_ABSENCE, AUTO_ABSENCE_ON, AUTO_CANCEL_ON, UN_USE, AUTO_FINISH_OFF
from board.models import QATb
from configs.functions import func_delete_profile_image_logic, func_upload_profile_image_logic
from login.models import PushInfoTb, MemberTb
from payment.models import ProductFunctionAuthTb, PaymentInfoTb
from schedule.functions import func_refresh_member_ticket_count
from schedule.models import ScheduleTb, DeleteScheduleTb
from trainer.functions import func_get_trainer_setting_list
from trainer.models import ClassTb, SettingTb, BackgroundImgTb, ProgramAuthTb

logger = logging.getLogger(__name__)


def index(request):
    # login 완료시 main page 이동
    template_name = 'index.html'
    request.session['APP_VERSION'] = settings.APP_VERSION
    current_site = get_current_site(request)
    request.session['domain'] = current_site.domain
    request.session['PTERS_NAVER_ID_LOGIN_CLIENT_ID'] = settings.PTERS_NAVER_ID_LOGIN_CLIENT_ID
    request.session['PTERS_NAVER_ID_LOGIN_CLIENT_SECRET'] = settings.PTERS_NAVER_ID_LOGIN_CLIENT_SECRET
    # request.session['device_info'] = 'web'
    request.session['setting_theme'] = 'light'
    if request.user.is_authenticated():
        next_page = '/check/'
    else:
        next_page = ''

    if next_page == '':
        return render(request, template_name)
    else:
        return redirect(next_page)


class CheckView(LoginRequiredMixin, RedirectView):

    def get(self, request, **kwargs):
        user_for_group = User.objects.get(id=request.user.id)
        group_list = user_for_group.groups.filter(user=request.user.id)
        if len(group_list) == 1:
            group = group_list[0]

            request.session['base_html'] = group.name + '_base.html'
            request.session['group_name'] = group.name
            if group.name == 'admin':
                self.url = '/admin_spooner/'
            else:
                self.url = '/' + group.name + '/'
        else:
            self.url = '/login/logout/'
        return super(CheckView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(CheckView, self).get_redirect_url(*args, **kwargs)


class SiteUsePolicyView(TemplateView):
    template_name = 'policy.html'

    def get_context_data(self, **kwargs):
        context = super(SiteUsePolicyView, self).get_context_data(**kwargs)
        return context


class SiteUsePolicyChargeView(TemplateView):
    template_name = 'policy_charge.html'

    def get_context_data(self, **kwargs):
        context = super(SiteUsePolicyChargeView, self).get_context_data(**kwargs)
        return context


class PrivacyView(TemplateView):
    template_name = 'privacy.html'

    def get_context_data(self, **kwargs):
        context = super(PrivacyView, self).get_context_data(**kwargs)
        return context


class AccessTestMixin(UserPassesTestMixin):

    def test_func(self):
        test_result = False
        error = None
        user_for_group = self.request.user
        # group = None
        url = None
        self.login_url = '/'
        group_name = self.request.session.get('group_name', '')
        session_app_version = self.request.session.get('APP_VERSION', '')
        if session_app_version == '' or session_app_version is None:
            self.request.session['APP_VERSION'] = settings.APP_VERSION

        if error is None:
            if group_name == '':
                group_list = user_for_group.groups.filter(user=self.request.user.id)
                if len(group_list) == 1:
                    group_name = group_list[0].name
                    self.request.session['base_html'] = group_name+'_base.html'
                    self.request.session['group_name'] = group_name
                else:
                    error = '세션이 만료됐습니다.'

        if error is None:
            url = self.request.get_full_path().split('/')

        if error is None:
            if url[1] == 'trainee':
                if group_name == 'trainee':
                    func_setting_data_update(self.request, group_name)
                    # get_function_auth_type_cd(self.request)
                    update_finish_schedule_data(self.request)
                    test_result = True
            if url[1] == 'trainer':
                if group_name == 'trainer':
                    func_setting_data_update(self.request, group_name)
                    # get_function_auth_type_cd(self.request)
                    update_finish_schedule_data(self.request)
                    test_result = True
            if url[1] == 'center':
                if group_name == 'center':
                    test_result = True
            if url[1] == 'admin_spooner':
                if group_name == 'admin':
                    test_result = True

        if session_app_version != settings.APP_VERSION:
            test_result = False
            self.login_url = '/app_version_error/'
            self.request.session['app_version_error_next_page'] = self.request.get_full_path()

        self.request.session['is_ajax'] = self.request.is_ajax()

        return test_result


def date_check_func(pt_schedule_date, add_start_dt, add_end_dt, origin_start_dt, origin_end_dt):
    error = None

    if origin_start_dt >= add_start_dt:
        if origin_start_dt < add_end_dt:
            error = str(pt_schedule_date)
    if origin_end_dt > add_start_dt:
        if origin_end_dt < add_end_dt:
            error = str(pt_schedule_date)
    if origin_start_dt <= add_start_dt:
        if origin_end_dt >= add_end_dt:
            error = str(pt_schedule_date)

    return error


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class Error404View(TemplateView):
    template_name = '404_page.html'

    def get_context_data(self, **kwargs):
        context = super(Error404View, self).get_context_data(**kwargs)

        return context


class Error500View(TemplateView):
    template_name = '500_page.html'

    def get_context_data(self, **kwargs):
        context = super(Error500View, self).get_context_data(**kwargs)

        return context


def func_setting_data_update(request, group):

    context = {}
    class_id = request.session.get('class_id', '')
    device_id = request.session.get('device_id', 'pc')
    trainer_id = request.session.get('trainer_id', '')
    if device_id == 'pc':
        request.session['device_info'] = 'web'
    else:
        request.session['device_info'] = 'app'

    if class_id != '' and class_id is not None:
        question_counts = QATb.objects.filter(member_id=request.user.id, status_type_cd='QA_COMPLETE',
                                              read=0, use=USE).count()
        request.session['question_counts'] = question_counts

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
            trainer_id = class_info.member_id
            request.session['trainer_id'] = trainer_id
        except ObjectDoesNotExist:
            class_info = None

        if class_info is not None:
            request.session['class_hour'] = class_info.class_hour
            request.session['class_type_code'] = class_info.subject_cd
            request.session['class_type_name'] = class_info.get_class_type_cd_name()
            if str(class_info.member_id) != str(request.user.id):
                request.session['class_type_name'] += ' - ' + class_info.member.name
            request.session['class_center_name'] = class_info.get_center_name()
            request.session['trainer_name'] = class_info.member.name
        context = func_get_trainer_setting_list(context, trainer_id, class_id, class_info.class_hour)
        request.session['setting_member_reserve_time_available'] = context['setting_member_reserve_time_available']
        request.session['setting_member_reserve_prohibition'] = context['setting_member_reserve_prohibition']

        request.session['setting_trainer_work_sun_time_avail'] = context['setting_trainer_work_sun_time_avail']
        request.session['setting_trainer_work_mon_time_avail'] = context['setting_trainer_work_mon_time_avail']
        request.session['setting_trainer_work_tue_time_avail'] = context['setting_trainer_work_tue_time_avail']
        request.session['setting_trainer_work_wed_time_avail'] = context['setting_trainer_work_wed_time_avail']
        request.session['setting_trainer_work_ths_time_avail'] = context['setting_trainer_work_ths_time_avail']
        request.session['setting_trainer_work_fri_time_avail'] = context['setting_trainer_work_fri_time_avail']
        request.session['setting_trainer_work_sat_time_avail'] = context['setting_trainer_work_sat_time_avail']

        request.session['setting_member_reserve_date_available'] = context['setting_member_reserve_date_available']
        request.session['setting_member_reserve_enable_time'] = context['setting_member_reserve_enable_time']
        request.session['setting_member_reserve_cancel_time'] = context['setting_member_reserve_cancel_time']
        # request.session['setting_member_time_duration'] = context['setting_member_time_duration']
        request.session['setting_member_start_time'] = context['setting_member_start_time']
        request.session['setting_schedule_auto_finish'] = context['setting_schedule_auto_finish']
        request.session['setting_member_ticket_auto_finish'] = context['setting_member_ticket_auto_finish']
        request.session['setting_to_trainee_lesson_alarm'] = context['setting_to_trainee_lesson_alarm']
        request.session['setting_from_trainee_lesson_alarm'] = context['setting_from_trainee_lesson_alarm']
        request.session['setting_language'] = context['setting_language']
        request.session['setting_admin_password'] = context['setting_admin_password']
        request.session['setting_attend_class_prev_display_time'] = context['setting_attend_class_prev_display_time']
        request.session['setting_attend_class_after_display_time'] = context['setting_attend_class_after_display_time']
        request.session['setting_week_start_date'] = context['setting_week_start_date']
        request.session['setting_holiday_hide'] = context['setting_holiday_hide']

        request.session['setting_calendar_basic_select_time'] = context['setting_calendar_basic_select_time']
        request.session['setting_calendar_time_selector_type'] = context['setting_calendar_time_selector_type']
        request.session['one_to_one_lecture_time_duration'] = context['one_to_one_lecture_time_duration']
        request.session['setting_trainer_statistics_lock'] = context['setting_trainer_statistics_lock']
        request.session['setting_trainer_attend_mode_out_lock'] = context['setting_trainer_attend_mode_out_lock']

        request.session['setting_member_lecture_max_num_view_available'] = context['setting_member_lecture_max_num_view_available']
        request.session['setting_schedule_sign_enable'] = context['setting_schedule_sign_enable']
        if group == 'trainee':
            try:
                setting_data = SettingTb.objects.get(member_id=request.user.id, setting_type_cd='LT_LAN_01')
                context['setting_language'] = setting_data.setting_info
            except ObjectDoesNotExist:
                context['setting_language'] = 'KOR'
            # request.session['setting_language'] = context['lt_lan_01']

        try:
            setting_info = SettingTb.objects.get(member_id=request.user.id, setting_type_cd='THEME')
            context['setting_theme'] = setting_info.setting_info
        except ObjectDoesNotExist:
            context['setting_theme'] = 'light'
        request.session['setting_theme'] = context['setting_theme']

        request.session['setting_data'] = context


def get_function_auth_type_cd(request):
    today = datetime.date.today()
    class_id = request.session.get('class_id', '')
    # trainer_id = request.user.id
    trainer_id = request.session.get('trainer_id', '')
    # if trainer_id is None or trainer_id == '':
    if class_id is not None and class_id != '':
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
            trainer_id = class_info.member_id
            request.session['trainer_id'] = trainer_id
        except ObjectDoesNotExist:
            trainer_id = ''

    if trainer_id != '' and trainer_id is not None:
        payment_data = PaymentInfoTb.objects.filter(member_id=trainer_id, status='paid',
                                                    start_date__lte=today, end_date__gte=today,
                                                    use=USE).order_by('payment_info_id', '-mod_dt')
        if len(payment_data) == 0:
            payment_data = PaymentInfoTb.objects.filter(member_id=trainer_id, status='reserve',
                                                        start_date__lte=today, end_date__gte=today,
                                                        use=USE).order_by('product_tb_id', '-end_date')

        request.session['product_type_name'] = ''
        request.session['product_id'] = ''
        request.session['auth_info'] = {}
        payment_data_counter = 0
        for payment_info in payment_data:
            function_list = ProductFunctionAuthTb.objects.select_related(
                'function_auth_tb', 'product_tb').filter(product_tb_id=payment_info.product_tb_id,
                                                         use=USE).order_by('product_tb_id',
                                                                           'function_auth_tb_id',
                                                                           'auth_type_cd')
            if len(function_list) > 0:
                if payment_data_counter == 0:
                    request.session['product_type_name'] += str(function_list[0].product_tb.name)
                    request.session['product_id'] = str(function_list[0].product_tb.product_id)
                else:
                    request.session['product_type_name'] += ',' + str(function_list[0].product_tb.name)
                    request.session['product_id'] += ',' + str(function_list[0].product_tb.product_id)

            for function_info in function_list:
                auth_info = {}
                if function_info.auth_type_cd is None:
                    function_auth_type_cd_name = str(function_info.function_auth_tb.function_auth_type_cd)
                else:
                    function_auth_type_cd_name = str(function_info.function_auth_tb.function_auth_type_cd) \
                                                 + str(function_info.auth_type_cd)

                auth_info['active'] = 1
                auth_info['limit_num'] = function_info.counts
                auth_info['limit_type'] = function_info.product_tb.name
                request.session['auth_info'][function_auth_type_cd_name] = auth_info
            payment_data_counter += 1

        if len(payment_data) == 0:
            function_list = ProductFunctionAuthTb.objects.select_related(
                'function_auth_tb', 'product_tb').filter(product_tb_id=6, use=USE).order_by('product_tb_id',
                                                                                            'function_auth_tb_id',
                                                                                            'auth_type_cd')
            if len(function_list) > 0:
                request.session['product_type_name'] += str(function_list[0].product_tb.name)
                request.session['product_id'] = str(function_list[0].product_tb.product_id)

            for function_info in function_list:
                auth_info = {}
                if function_info.auth_type_cd is None:
                    function_auth_type_cd_name = str(function_info.function_auth_tb.function_auth_type_cd)
                else:
                    function_auth_type_cd_name = str(function_info.function_auth_tb.function_auth_type_cd) \
                                                 + str(function_info.auth_type_cd)
                auth_info['active'] = 1
                auth_info['limit_num'] = function_info.counts
                auth_info['limit_type'] = str(function_info.product_tb.name)
                request.session['auth_info'][function_auth_type_cd_name] = auth_info

        if str(trainer_id) != str(request.user.id):
            function_list = ProgramAuthTb.objects.select_related('function_auth_tb').filter(class_tb_id=class_id,
                                                                                            member_id=request.user.id)

            for function_info in function_list:
                auth_info = {}
                if function_info.auth_type_cd is None:
                    function_auth_type_cd_name = str(function_info.function_auth_tb.function_auth_type_cd)
                else:
                    function_auth_type_cd_name = str(function_info.function_auth_tb.function_auth_type_cd) \
                                                 + str(function_info.auth_type_cd)
                if function_info.auth_type_cd != '_crate':
                    request.session['auth_info'][function_auth_type_cd_name]['active'] = function_info.enable_flag
                    if str(function_info.enable_flag) == '0':
                        request.session['auth_info'][function_auth_type_cd_name]['limit_num'] = function_info.enable_flag
                    request.session['auth_info'][function_auth_type_cd_name]['limit_type'] = str('공유 프로그램')


def get_background_url(request):
    class_id = request.session.get('class_id', '')
    background_url = []
    if class_id != '':
        background_img_data = BackgroundImgTb.objects.select_related(
            'class_tb').filter(class_tb_id=class_id, use=USE).order_by('-class_tb_id')
        for background_img_info in background_img_data:
            background_url.append(parser.unescape(background_img_info.url))
    return background_url


def get_background_type_cd(request):
    class_id = request.session.get('class_id', '')
    background_img_type_cd = []
    if class_id != '':
        background_img_data = BackgroundImgTb.objects.filter(class_tb_id=class_id,
                                                             use=USE).order_by('-class_tb_id')
        for background_img_info in background_img_data:
            background_img_type_cd.append(parser.unescape(background_img_info.background_img_type_cd))
    return background_img_type_cd


# 프로필 사진 수정
def update_profile_img_logic(request):
    error = None
    member_info = None
    img_url = None
    group_name = request.session.get('group_name', 'trainer')
    try:
        member_info = MemberTb.objects.get(member_id=request.user.id)
    except ObjectDoesNotExist:
        error = '회원 정보를 불러오지 못했습니다.'
    if error is None:
        if member_info.profile_url is not None and member_info.profile_url != '':
            error = func_delete_profile_image_logic(member_info.profile_url)
    if error is None:
        max_range = 9999999999
        random_file_name = str(random.randrange(0, max_range)).zfill(len(str(max_range)))
        if request.method == 'POST':
            try:
                img_url = func_upload_profile_image_logic(request.POST.get('profile_img_file'),
                                                          str(request.user.id)+'/'+str(random_file_name), group_name)
                if img_url is None:
                    error = '프로필 이미지 변경에 실패했습니다.[1]'
            except MultiValueDictKeyError:
                error = '프로필 이미지 변경에 실패했습니다.[2]'

    if error is None:
        member_info.profile_url = img_url
        member_info.save()

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return render(request, 'ajax/trainer_error_ajax.html')


# 프로필 사진 삭제
def delete_profile_img_logic(request):
    error = None
    member_info = None

    try:
        member_info = MemberTb.objects.get(member_id=request.user.id)
    except ObjectDoesNotExist:
        error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        if member_info.profile_url is not None and member_info.profile_url != '':
            error = func_delete_profile_image_logic(member_info.profile_url)

    if error is None:
        member_info.profile_url = ''
        member_info.save()

    if error is not None:
        logger.error(request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

    return render(request, 'ajax/trainer_error_ajax.html')


def app_version_error(request):
    # login 완료시 main page 이동
    template_name = 'app_version_error.html'
    is_ajax = request.session.get('is_ajax', 'False')
    app_version_error_next_page = request.session.get('app_version_error_next_page')
    if is_ajax == 'False' or is_ajax is False:
        request.session['APP_VERSION'] = settings.APP_VERSION
        return redirect(app_version_error_next_page)
    else:
        return render(request, template_name, {'app_version': settings.APP_VERSION})


# 지난 일정 처리
def update_finish_schedule_data(request):
    now = timezone.now()
    class_id = request.session.get('class_id', '')
    setting_schedule_auto_finish = request.session.get('setting_schedule_auto_finish', AUTO_FINISH_OFF)
    if class_id is not None and class_id != '':
        if str(setting_schedule_auto_finish) != str(AUTO_FINISH_OFF):
            not_finish_schedule_data = ScheduleTb.objects.select_related(
                'member_ticket_tb'
            ).filter(class_tb_id=class_id, state_cd=STATE_CD_NOT_PROGRESS,
                     en_dis_type=ON_SCHEDULE_TYPE, end_dt__lte=now, use=USE
                     )
            for not_finish_schedule_info in not_finish_schedule_data:
                lecture_tb = not_finish_schedule_info.lecture_tb
                lecture_tb_id = None
                member_ticket_tb = not_finish_schedule_info.member_ticket_tb
                member_ticket_tb_id = None
                repeat_schedule_tb = not_finish_schedule_info.repeat_schedule_tb
                repeat_schedule_tb_id = None

                if member_ticket_tb is not None and member_ticket_tb != '':
                    member_ticket_tb_id = not_finish_schedule_info.member_ticket_tb_id
                if lecture_tb is not None and lecture_tb != '':
                    lecture_tb_id = not_finish_schedule_info.lecture_tb_id
                if repeat_schedule_tb is not None and repeat_schedule_tb != '':
                    repeat_schedule_tb_id = not_finish_schedule_info.repeat_schedule_tb_id

                if str(setting_schedule_auto_finish) == str(AUTO_FINISH_ON):
                    not_finish_schedule_info.state_cd = STATE_CD_FINISH
                    not_finish_schedule_info.save()
                elif str(setting_schedule_auto_finish) == str(AUTO_ABSENCE_ON):
                    not_finish_schedule_info.state_cd = STATE_CD_ABSENCE
                    not_finish_schedule_info.save()
                elif str(setting_schedule_auto_finish) == str(AUTO_CANCEL_ON):
                    finish_lecture_member_schedule_count = 0
                    if lecture_tb_id is not None and lecture_tb_id != '':
                        if member_ticket_tb_id is None or member_ticket_tb_id == '':
                            finish_lecture_member_schedule_count = ScheduleTb.objects.filter(
                                lecture_schedule_id=not_finish_schedule_info.schedule_id,
                                use=USE).exclude(state_cd=STATE_CD_NOT_PROGRESS).count()

                    if finish_lecture_member_schedule_count == 0:
                        delete_schedule_info = DeleteScheduleTb(
                            schedule_id=not_finish_schedule_info.schedule_id,
                            class_tb_id=not_finish_schedule_info.class_tb_id,
                            lecture_tb_id=lecture_tb_id,
                            member_ticket_tb_id=member_ticket_tb_id,
                            lecture_schedule_id=not_finish_schedule_info.lecture_schedule_id,
                            delete_repeat_schedule_tb=repeat_schedule_tb_id,
                            start_dt=not_finish_schedule_info.start_dt, end_dt=not_finish_schedule_info.end_dt,
                            permission_state_cd=not_finish_schedule_info.permission_state_cd,
                            state_cd=not_finish_schedule_info.state_cd, note=not_finish_schedule_info.note,
                            en_dis_type=not_finish_schedule_info.en_dis_type,
                            member_note=not_finish_schedule_info.member_note,
                            reg_member_id=not_finish_schedule_info.reg_member_id, del_member='auto',
                            reg_dt=not_finish_schedule_info.reg_dt, mod_dt=timezone.now(),
                            use=UN_USE)
                        delete_schedule_info.save()
                        not_finish_schedule_info.delete()
                    # member_ticket_tb_id = delete_schedule_info.member_ticket_tb_id
                if member_ticket_tb_id is not None:
                    func_refresh_member_ticket_count(not_finish_schedule_info.class_tb_id, member_ticket_tb_id)
    return render(request, 'ajax/task_error_info.html')
