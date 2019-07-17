import logging
import datetime
from html import parser

from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.shortcuts import render, redirect
from django.views.generic import RedirectView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import TemplateView
from django.utils import timezone

# Create your views here.
from board.models import QATb
from configs.const import USE, AUTO_FINISH_ON, ON_SCHEDULE_TYPE, UN_USE, AUTO_CANCEL_ON, AUTO_ABSENCE_ON
from login.models import PushInfoTb
from payment.models import ProductFunctionAuthTb, PaymentInfoTb, BillingInfoTb
from schedule.functions import func_refresh_member_ticket_count
from schedule.models import ScheduleTb, RepeatScheduleTb, DeleteScheduleTb
from trainer.functions import func_get_trainer_setting_list, func_update_lecture_member_fix_status_cd
from trainer.models import ClassTb, ClassMemberTicketTb, SettingTb, BackgroundImgTb

logger = logging.getLogger(__name__)


def index(request):
    # login 완료시 main page 이동
    template_name = 'index.html'

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
                self.url = '/spooner_adm/'
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

        group_name = self.request.session.get('group_name', '')

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
                    func_data_update(self.request, group_name)
                    get_function_auth_type_cd(self.request)
                    test_result = True
            if url[1] == 'trainer':
                if group_name == 'trainer':
                    func_data_update(self.request, group_name)
                    get_function_auth_type_cd(self.request)
                    test_result = True
            if url[1] == 'center':
                if group_name == 'center':
                    test_result = True
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


def func_data_update(request, group):

    context = {}
    now = timezone.now()
    class_id = request.session.get('class_id', '')
    device_id = request.session.get('device_id', 'pc')
    if device_id == 'pc':
        request.session['device_info'] = 'web'
    else:
        request.session['device_info'] = 'app'

    if class_id != '':
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
        request.session['setting_member_ticket_auto_finish'] = context['lt_member_ticket_auto_finish']
        request.session['setting_to_trainee_lesson_alarm'] = context['lt_pus_to_trainee_lesson_alarm']
        request.session['setting_from_trainee_lesson_alarm'] = context['lt_pus_from_trainee_lesson_alarm']
        request.session['setting_language'] = context['lt_lan_01']
        request.session['setting_admin_password'] = context['setting_admin_password']

        if group == 'trainee':
            try:
                setting_data = SettingTb.objects.get(member_id=request.user.id, setting_type_cd='LT_LAN_01')
                lt_lan_01 = setting_data.setting_info
            except ObjectDoesNotExist:
                lt_lan_01 = 'KOR'

            context['lt_lan_01'] = lt_lan_01
            request.session['setting_language'] = context['lt_lan_01']

        if context['lt_schedule_auto_finish'] == AUTO_FINISH_ON:
            not_finish_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id, state_cd='NP',
                                                                 en_dis_type=ON_SCHEDULE_TYPE, end_dt__lte=now,
                                                                 use=USE)
            for not_finish_schedule_info in not_finish_schedule_data:
                not_finish_schedule_info.state_cd = 'PE'
                not_finish_schedule_info.save()
                func_refresh_member_ticket_count(class_id, not_finish_schedule_info.member_ticket_tb_id)
        elif context['lt_schedule_auto_finish'] == AUTO_ABSENCE_ON:
            not_finish_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id, state_cd='NP',
                                                                 en_dis_type=ON_SCHEDULE_TYPE, end_dt__lte=now,
                                                                 use=USE)
            for not_finish_schedule_info in not_finish_schedule_data:
                not_finish_schedule_info.state_cd = 'PC'
                not_finish_schedule_info.save()
                func_refresh_member_ticket_count(class_id, not_finish_schedule_info.member_ticket_tb_id)
        elif context['lt_schedule_auto_finish'] == AUTO_CANCEL_ON:
            not_finish_schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id, state_cd='NP',
                                                                 en_dis_type=ON_SCHEDULE_TYPE, end_dt__lte=now,
                                                                 use=USE)
            for not_finish_schedule_info in not_finish_schedule_data:
                delete_schedule_info = DeleteScheduleTb(
                    schedule_id=not_finish_schedule_info.schedule_id, class_tb_id=not_finish_schedule_info.class_tb_id,
                    lecture_tb_id=not_finish_schedule_info.lecture_tb_id,
                    member_ticket_tb_id=not_finish_schedule_info.member_ticket_tb_id,
                    lecture_schedule_id=not_finish_schedule_info.lecture_schedule_id,
                    delete_repeat_schedule_tb=not_finish_schedule_info.repeat_schedule_tb_id,
                    start_dt=not_finish_schedule_info.start_dt, end_dt=not_finish_schedule_info.end_dt,
                    permission_state_cd=not_finish_schedule_info.permission_state_cd,
                    state_cd=not_finish_schedule_info.state_cd, note=not_finish_schedule_info.note,
                    en_dis_type=not_finish_schedule_info.en_dis_type, member_note=not_finish_schedule_info.member_note,
                    reg_member_id=not_finish_schedule_info.reg_member_id, del_member_id=request.user.id,
                    reg_dt=not_finish_schedule_info.reg_dt, mod_dt=timezone.now(),
                    use=UN_USE)
                delete_schedule_info.save()
                not_finish_schedule_info.delete()
                func_refresh_member_ticket_count(class_id, delete_schedule_info.member_ticket_tb_id)

        if context['lt_member_ticket_auto_finish'] == AUTO_FINISH_ON:
            class_member_ticket_data = ClassMemberTicketTb.objects.select_related(
                'member_ticket_tb__ticket_tb').filter(class_tb_id=class_id, auth_cd='VIEW',
                                                      member_ticket_tb__end_date__lt=datetime.date.today(),
                                                      member_ticket_tb__state_cd='IP', member_ticket_tb__use=USE,
                                                      use=USE)

            for class_member_ticket_info in class_member_ticket_data:
                member_ticket_info = class_member_ticket_info.member_ticket_tb
                schedule_data = ScheduleTb.objects.filter(member_ticket_tb_id=member_ticket_info.member_ticket_id,
                                                          end_dt__lte=now,
                                                          use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
                schedule_data_delete = ScheduleTb.objects.filter(
                    member_ticket_tb_id=member_ticket_info.member_ticket_id, end_dt__gt=now,
                    use=USE).exclude(Q(state_cd='PE') | Q(state_cd='PC'))
                repeat_schedule_data = RepeatScheduleTb.objects.filter(
                    member_ticket_tb_id=member_ticket_info.member_ticket_id)
                if len(schedule_data) > 0:
                    schedule_data.update(state_cd='PE')
                if len(schedule_data_delete) > 0:
                    schedule_data_delete.delete()
                if len(repeat_schedule_data) > 0:
                    repeat_schedule_data.delete()
                member_ticket_info.member_ticket_avail_count = 0
                member_ticket_info.member_ticket_rem_count = 0
                member_ticket_info.state_cd = 'PE'
                member_ticket_info.save()

                if member_ticket_info is not None and member_ticket_info != '':
                    func_update_lecture_member_fix_status_cd(class_id, member_ticket_info.member_id)


def get_function_auth_type_cd(request):
    today = datetime.date.today()
    class_id = request.session.get('class_id', '')
    trainer_id = request.session.get('trainer_id', '')
    if trainer_id is None or trainer_id == '':
        if class_id is not None and class_id != '':
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
                trainer_id = class_info.member_id
                request.session['trainer_id'] = trainer_id
            except ObjectDoesNotExist:
                trainer_id = ''

    if trainer_id != '' and trainer_id is not None:
        billing_data = BillingInfoTb.objects.filter(member_id=trainer_id,
                                                    next_payment_date__lt=today, use=USE)

        payment_data = PaymentInfoTb.objects.filter(member_id=trainer_id, status='paid',
                                                    start_date__lte=today, end_date__gte=today,
                                                    use=USE).order_by('product_tb_id', '-end_date')
        if len(payment_data) == 0:
            payment_data = PaymentInfoTb.objects.filter(member_id=trainer_id, status='reserve',
                                                        start_date__lte=today, end_date__gte=today,
                                                        use=USE).order_by('product_tb_id', '-end_date')

        if len(payment_data) == 0:
            for billing_info in billing_data:
                billing_info.state_cd = 'END'
                # billing_info.use = UN_USE
                billing_info.save()

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
                    request.session['product_type_name'] += function_list[0].product_tb.name
                    request.session['product_id'] = function_list[0].product_tb.product_id
                else:
                    request.session['product_type_name'] += ',' + function_list[0].product_tb.name
                    request.session['product_id'] += ',' + function_list[0].product_tb.product_id

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
                request.session['auth_info'][function_auth_type_cd_name] = auth_info
            payment_data_counter += 1

        if len(payment_data) == 0:
            function_list = ProductFunctionAuthTb.objects.select_related(
                'function_auth_tb', 'product_tb').filter(product_tb_id=6,
                                                         use=USE).order_by('product_tb_id',
                                                                           'function_auth_tb_id',
                                                                           'auth_type_cd')
            if len(function_list) > 0:
                request.session['product_type_name'] += function_list[0].product_tb.name
                request.session['product_id'] = function_list[0].product_tb.product_id

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
                request.session['auth_info'][function_auth_type_cd_name] = auth_info


def get_background_url(request):
    class_id = request.session.get('class_id', '')
    background_url = []
    if class_id != '':
        background_img_data = BackgroundImgTb.objects.select_related('class_tb').filter(class_tb_id=class_id,
                                                                                        use=USE).order_by('-class_tb_id')
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
