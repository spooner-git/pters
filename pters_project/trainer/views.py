# Create your views here.
import copy
import datetime
import json

import logging
import urllib
from collections import OrderedDict

import openpyxl
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError
from django.db import InternalError
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from django.views.generic import TemplateView
from django.views.generic.base import ContextMixin, RedirectView
from el_pagination.views import AjaxListView
from openpyxl import Workbook
from openpyxl.styles import Font
from openpyxl.writer.excel import save_virtual_workbook

from center.models import CenterTrainerTb
from configs import settings
from configs.views import AccessTestMixin
from login.models import MemberTb, LogTb, HolidayTb, CommonCdTb, PushInfoTb, BoardTb
from login.views import add_member_no_email_func
from schedule.views import get_trainer_schedule_data_func
from schedule.models import LectureTb, ClassLectureTb, MemberClassTb, MemberLectureTb, GroupTb, GroupLectureTb
from schedule.models import ClassTb
from trainee.views import get_trainee_repeat_schedule_data_func, get_trainee_repeat_schedule_data_func_from_schedule
from schedule.models import ScheduleTb, RepeatScheduleTb, SettingTb

logger = logging.getLogger(__name__)


class IndexView(LoginRequiredMixin, AccessTestMixin, RedirectView):
    url = '/trainer/class_select/'

    def get(self, request, **kwargs):

        class_id = request.session.get('class_id', '')
        class_auth_data = MemberClassTb.objects.filter(member_id=self.request.user.id, auth_cd='VIEW', use=1)

        error = None
        if class_id is None or class_id == '':
            if len(class_auth_data) == 0:
                self.url = '/trainer/add_class/'
            elif len(class_auth_data) == 1:
                self.url = '/trainer/trainer_main/'
                for class_info in class_auth_data:
                    self.request.session['class_id'] = class_info.class_tb_id
                    class_type_name = ''
                    class_name = None
                    self.request.session['class_hour'] = class_info.class_tb.class_hour

                    try:
                        class_name = CommonCdTb.objects.get(common_cd=class_info.class_tb.subject_cd)
                    except ObjectDoesNotExist:
                        error = '강좌 과목 정보를 불러오지 못했습니다.'
                    if error is None:
                        if class_info.class_tb.subject_detail_nm is None or class_info.class_tb.subject_detail_nm == '':
                            class_type_name = class_name.common_cd_nm
                        else:
                            class_type_name = class_info.class_tb.subject_detail_nm

                    if error is None:
                        self.request.session['class_type_name'] = class_type_name
                    else:
                        self.request.session['class_type_name'] = ''

                    if error is None:
                        if class_info.class_tb.center_tb is None or class_info.class_tb.center_tb == '':
                            self.request.session['class_center_name'] = ''
                        else:
                            self.request.session['class_center_name'] = class_info.class_tb.center_tb.center_name

            else:
                self.url = '/trainer/class_select/'
        else:
            self.url = '/trainer/trainer_main/'

        if error is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+error)
            messages.error(self.request, error)

        return super(IndexView, self).get(request, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        return super(IndexView, self).get_redirect_url(*args, **kwargs)


class TrainerMainView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'main_trainer.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerMainView, self).get_context_data(**kwargs)

        class_id = self.request.session.get('class_id', '')
        error = None

        today = datetime.date.today()
        one_day_after = today + datetime.timedelta(days=1)
        month_first_day = today.replace(day=1)
        next_year = int(month_first_day.strftime('%Y')) + 1
        next_month = int(month_first_day.strftime('%m')) % 12 + 1
        next_month_first_day = month_first_day.replace(month=next_month)

        if next_month == 1:
            next_month_first_day = next_month_first_day.replace(year=next_year)

        today_schedule_num = 0
        new_member_num = 0
        total_member_num = 0
        to_be_end_member_num = 0
        np_member_num = 0

        class_info = None

        context['total_member_num'] = 0
        context['to_be_end_member_num'] = 0
        context['today_schedule_num'] = 0
        context['new_member_num'] = 0

        if class_id is None or class_id == '':
            error = '강사 정보를 불러오지 못했습니다.'

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

        if error is None:
            self.request.session['class_hour'] = class_info.class_hour

        if error is None:
            all_member = MemberTb.objects.filter().order_by('name')

            for member_info in all_member:
                # member_data = member_info

                member_lecture_reg_count = 0
                member_lecture_rem_count = 0
                member_lecture_avail_count = 0
                # 강좌에 해당하는 수강/회원 정보 가져오기
                class_lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                                   lecture_tb__member_id=member_info.member_id,
                                                                   lecture_tb__state_cd='IP',
                                                                   lecture_tb__use=1,
                                                                   auth_cd='VIEW', use=1).order_by('-lecture_tb__start_date')
                start_date = ''
                if len(class_lecture_list) > 0:
                    total_member_num += 1

                    for lecture_info_data in class_lecture_list:
                        lecture_info = lecture_info_data.lecture_tb
                        if lecture_info_data.auth_cd == 'WAIT':
                            np_member_num += 1
                        member_lecture_reg_count += lecture_info.lecture_reg_count
                        member_lecture_rem_count += lecture_info.lecture_rem_count
                        member_lecture_avail_count += lecture_info.lecture_avail_count

                        if lecture_info.state_cd == 'IP':
                            if start_date == '':
                                start_date = lecture_info.start_date
                            else:
                                if start_date > lecture_info.start_date:
                                    start_date = lecture_info.start_date
                    if start_date != '':
                        if month_first_day <= start_date < next_month_first_day:
                            new_member_num += 1

                    if 0 < member_lecture_rem_count < 4:
                        to_be_end_member_num += 1

        if error is None :
            # 남은 횟수 1개 이상인 경우 - 180314 hk.kim
            context['total_member_num'] = total_member_num
            # 남은 횟수 1개 이상 3개 미만인 경우 - 180314 hk.kim
            context['to_be_end_member_num'] = to_be_end_member_num
            context['np_member_num'] = np_member_num
            context['new_member_num'] = new_member_num

        if error is None:
            today_schedule_num = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                           start_dt__gte=today, start_dt__lt=one_day_after,
                                                           en_dis_type='1').count()

        context['today_schedule_num'] = today_schedule_num

        context = get_trainer_setting_data(context, self.request.user.id, class_id)

        self.request.session['setting_member_reserve_time_available'] = context['lt_res_01']
        self.request.session['setting_member_reserve_time_prohibition'] = context['lt_res_02']
        self.request.session['setting_member_reserve_prohibition'] = context['lt_res_03']
        self.request.session['setting_trainer_work_time_available'] = context['lt_res_04']
        self.request.session['setting_member_reserve_date_available'] = context['lt_res_05']
        self.request.session['setting_language'] = context['lt_lan_01']

        self.request.session['setting_trainee_schedule_confirm1'] = context['lt_pus_01']
        self.request.session['setting_trainee_schedule_confirm2'] = context['lt_pus_02']
        self.request.session['setting_trainee_no_schedule_confirm'] = context['lt_pus_03']
        self.request.session['setting_trainer_schedule_confirm'] = context['lt_pus_04']
        self.request.session['setting_trainer_no_schedule_confirm1'] = context['lt_pus_05']
        self.request.session['setting_trainer_no_schedule_confirm2'] = context['lt_pus_06']

        if error is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+error)
            messages.error(self.request, error)
        else:
            logger.info(self.request.user.last_name+self.request.user.first_name+'['+str(self.request.user.id)+'] : login success')

        return context


class CalDayView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_day.html'

    def get_context_data(self, **kwargs):
        context = super(CalDayView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        today = datetime.date.today()
        start_date = today
        end_date = today + datetime.timedelta(days=1)
        context = get_trainer_schedule_data_func(context, class_id, start_date, end_date)

        holiday = HolidayTb.objects.filter(use=1)
        context['holiday'] = holiday

        return context


@method_decorator(csrf_exempt, name='dispatch')
class CalDayViewAjax(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'schedule_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(CalDayViewAjax, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        date = request.session.get('date', '')
        day = request.session.get('day', '')
        lecture_id = request.session.get('lecture_id', '')
        today = datetime.date.today()
        push_data = []
        badge_counter = []

        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 46
        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(47))

        context = get_trainer_schedule_data_func(context, class_id, start_date, end_date)
        context = get_member_data(context, class_id, None, request.user.id)

        if lecture_id is not None and lecture_id != '':
            member_lecture_data = MemberLectureTb.objects.filter(lecture_tb_id=lecture_id, use=1)

            for class_lecture_info in member_lecture_data:
                lecture_info = MemberLectureTb.objects.filter(lecture_tb_id=class_lecture_info.lecture_tb_id, auth_cd='VIEW', use=1)
                for lecture_info in lecture_info:

                    token_data = PushInfoTb.objects.filter(member_id=lecture_info.member.member_id)
                    for token_info in token_data:
                        token_info.badge_counter += 1
                        token_info.save()
                        push_data.append(token_info)

        context['push_server_id'] = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
        context['push_data'] = push_data
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        class_id = request.session.get('class_id', '')
        date = request.POST.get('date', '')
        day = request.POST.get('day', '')
        today = datetime.date.today()
        if date != '':
            today = datetime.datetime.strptime(date, '%Y-%m-%d')
        if day == '':
            day = 18

        start_date = today - datetime.timedelta(days=int(day))
        end_date = today + datetime.timedelta(days=int(day)+1)

        context = super(CalDayViewAjax, self).get_context_data(**kwargs)
        context = get_trainer_schedule_data_func(context, class_id, start_date, end_date)
        context = get_member_data(context, class_id, None, request.user.id)

        return render(request, self.template_name, context)


class CalWeekView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_week.html'

    def get_context_data(self, **kwargs):
        context = super(CalWeekView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=18)
        end_date = today + datetime.timedelta(days=19)
        class_info = None
        error = None

        context = get_trainer_schedule_data_func(context, class_id, start_date, end_date)
        context = get_member_data(context, class_id, None, self.request.user.id)

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

        if error is None:
            self.request.session['class_hour'] = class_info.class_hour

        holiday = HolidayTb.objects.filter(use=1)
        context['holiday'] = holiday

        return context


class CalMonthView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_month.html'

    def get_context_data(self, **kwargs):
        context = super(CalMonthView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=46)
        end_date = today + datetime.timedelta(days=47)
        context = get_trainer_schedule_data_func(context, class_id, start_date, end_date)
        context = get_member_data(context, class_id, None, self.request.user.id)
        class_info = None
        error = None

        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

        if error is None:
            self.request.session['class_hour'] = class_info.class_hour

        holiday = HolidayTb.objects.filter(use=1)
        context['holiday'] = holiday

        return context


class OffRepeatAddView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'cal_add_off_repeat.html'

    def get_context_data(self, **kwargs):
        context = super(OffRepeatAddView, self).get_context_data(**kwargs)

        return context


class ManageMemberView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_member.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_member_data(context, class_id, None, self.request.user.id)
        return context


class ManageMemberViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_member_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(ManageMemberViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        lecture_id = self.request.session.get('lecture_id', '')
        context = get_member_data(context, class_id, None, self.request.user.id)
        push_data = []

        if lecture_id is not None and lecture_id != '':
            member_lecture_data = MemberLectureTb.objects.filter(lecture_tb_id=lecture_id, use=1)

            for class_lecture_info in member_lecture_data:
                lecture_info = MemberLectureTb.objects.filter(lecture_tb_id=class_lecture_info.lecture_tb_id, auth_cd='VIEW', use=1)
                for lecture_info in lecture_info:
                    token_data = PushInfoTb.objects.filter(member_id=lecture_info.member.member_id)
                    for token_info in token_data:
                        token_info.badge_counter += 1
                        token_info.save()
                        push_data.append(token_info)

        context['push_server_id'] = getattr(settings, "PTERS_PUSH_SERVER_KEY", '')
        context['push_data'] = push_data
        return context


class ManageWorkView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'manage_work.html'

    def get_context_data(self, **kwargs):
        context = super(ManageWorkView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_member_data(context, class_id, None, self.request.user.id)

        return context


def get_member_data(context, class_id, member_id, user_id):

    error = None
    class_info = None

    member_list = []
    member_finish_list = []
    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강사 정보를 불러오지 못했습니다.'

    if error is None:
        if member_id is None or member_id == '':
            all_member = MemberTb.objects.filter().order_by('name')
        else:
            all_member = MemberTb.objects.filter(member_id=member_id).order_by('name')

        for member_info in all_member:

            member_data = copy.copy(member_info)
            member_data_finish = copy.copy(member_info)

            try:
                user = User.objects.get(id=member_info.member_id)
                if user.is_active:
                    member_data.is_active = True
                    member_data_finish.is_active = True
                else:
                    if str(member_info.reg_info) == str(user_id):
                        member_data.is_active = False
                        member_data_finish.is_active = False
                    else:
                        member_data.is_active = True
                        member_data_finish.is_active = True

            except ObjectDoesNotExist:
                error = None

            lecture_finish_check = 0
            # 강좌에 해당하는 수강/회원 정보 가져오기
            lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                         lecture_tb__member_id=member_data.member_id,
                                                         lecture_tb__state_cd='IP', auth_cd='VIEW',
                                                         lecture_tb__use=1, use=1)

            lecture_finish_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                                lecture_tb__member_id=member_data.member_id,
                                                                auth_cd='VIEW', lecture_tb__use=1,
                                                                use=1).exclude(lecture_tb__state_cd='IP')

            if len(lecture_list) == 0:
                if len(lecture_finish_list) > 0:
                    lecture_finish_check = 1

            if len(lecture_list) > 0:
                lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                             lecture_tb__member_id=member_data.member_id,
                                                             auth_cd='VIEW', lecture_tb__use=1, use=1)

                member_data.rj_lecture_counts = 0
                member_data.np_lecture_counts = 0

                member_data.lecture_reg_count_yet = 0
                member_data.lecture_rem_count_yet = 0
                member_data.lecture_avail_count_yet = 0

                member_data.lecture_counts = len(lecture_list)
                member_data.lecture_reg_count = 0
                member_data.lecture_rem_count = 0
                member_data.lecture_avail_count = 0

                member_data.lecture_reg_count_total = 0
                member_data.lecture_rem_count_total = 0
                member_data.lecture_avail_count_total = 0

                member_data.start_date = None
                member_data.end_date = None
                member_data.mod_dt = None
                member_data.group_info = ''

                lecture_count = 0

                for lecture_info_data in lecture_list:
                    # if lecture_info.state_cd == 'RJ':
                    lecture_info = lecture_info_data.lecture_tb
                    if lecture_info_data.auth_cd == 'DELETE':
                        member_data.rj_lecture_counts += 1
                    # if lecture_info.state_cd == 'NP':
                    if lecture_info_data.auth_cd == 'WAIT':
                        member_data.np_lecture_counts += 1

                    group_check = 0
                    try:
                        GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=1)
                    except ObjectDoesNotExist:
                        group_check = 1

                    if group_check == 0:
                        if member_data.group_info == '':
                            member_data.group_info = '그룹'
                        else:
                            member_data.group_info += '/그룹'
                    else:
                        if member_data.group_info == '':
                            member_data.group_info = '1:1'
                        else:
                            member_data.group_info += '/1:1'

                    lecture_count += MemberLectureTb.objects.filter(member_id=member_data.member_id,
                                                                    lecture_tb=lecture_info.lecture_id,
                                                                    auth_cd='VIEW', lecture_tb__use=1, use=1).count()

                    if lecture_info.use != 0:
                        # if lecture_info.state_cd == 'IP' or lecture_info.state_cd == 'PE':
                        if lecture_info.state_cd == 'IP':
                            member_data.lecture_reg_count += lecture_info.lecture_reg_count
                            member_data.lecture_rem_count += lecture_info.lecture_rem_count
                            member_data.lecture_avail_count += lecture_info.lecture_avail_count
                            member_data.end_date = lecture_info.end_date
                            if member_data.start_date is None or member_data.start_date == '':
                                member_data.start_date = lecture_info.start_date
                            else:
                                if member_data.start_date > lecture_info.start_date:
                                    member_data.start_date = lecture_info.start_date
                            if member_data.end_date is None or member_data.end_date == '':
                                member_data.end_date = lecture_info.end_date
                            else:
                                if member_data.end_date < lecture_info.end_date:
                                    member_data.end_date = lecture_info.end_date

                        # if lecture_info.state_cd == 'NP' or lecture_info.state_cd == 'RJ':
                        #    member_data.lecture_reg_count_yet += lecture_info.lecture_reg_count
                        #    member_data.lecture_rem_count_yet += lecture_info.lecture_rem_count
                        #    member_data.lecture_avail_count_yet += lecture_info.lecture_avail_count

                        if member_data.mod_dt is None or member_data.mod_dt == '':
                            member_data.mod_dt = lecture_info.mod_dt
                        else:
                            if member_data.mod_dt > lecture_info.mod_dt:
                                member_data.mod_dt = lecture_info.mod_dt
                        member_data.lecture_reg_count_total += lecture_info.lecture_reg_count
                        member_data.lecture_rem_count_total += lecture_info.lecture_rem_count
                        member_data.lecture_avail_count_total += lecture_info.lecture_avail_count
                        member_data.lecture_id = lecture_info.lecture_id
                if member_data.reg_info is None or str(member_data.reg_info) != str(user_id):
                    if lecture_count == 0:
                        member_data.sex = ''
                        member_data.birthday_dt = ''
                        member_data.phone = '***-****-'+member_data.phone[7:]
                        member_data.user.email = ''

                member_data.start_date = str(member_data.start_date)
                member_data.end_date = str(member_data.end_date)
                member_data.mod_dt = str(member_data.mod_dt)
                if member_data.birthday_dt is None or member_data.birthday_dt == '':
                    member_data.birthday_dt = ''
                else:
                    member_data.birthday_dt = str(member_data.birthday_dt)
                member_list.append(member_data)

            if lecture_finish_check > 0:
                member_data_finish.rj_lecture_counts = 0
                member_data_finish.np_lecture_counts = 0

                member_data_finish.lecture_reg_count_yet = 0
                member_data_finish.lecture_rem_count_yet = 0
                member_data_finish.lecture_avail_count_yet = 0

                member_data_finish.lecture_counts = len(lecture_finish_list)
                member_data_finish.lecture_reg_count = 0
                member_data_finish.lecture_rem_count = 0
                member_data_finish.lecture_avail_count = 0

                member_data_finish.lecture_reg_count_total = 0
                member_data_finish.lecture_rem_count_total = 0
                member_data_finish.lecture_avail_count_total = 0
                member_data_finish.start_date = None
                member_data_finish.end_date = None
                member_data_finish.mod_dt = None
                member_data_finish.group_info = ''
                lecture_finish_count = 0

                for lecture_info_data in lecture_finish_list:
                    # if lecture_info.state_cd == 'RJ':
                    lecture_info = lecture_info_data.lecture_tb
                    if lecture_info_data.auth_cd == 'DELETE':
                        member_data_finish.rj_lecture_counts += 1
                    # if lecture_info.state_cd == 'NP':
                    if lecture_info_data.auth_cd == 'WAIT':
                        member_data_finish.np_lecture_counts += 1

                    group_check = 0
                    try:
                        GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=1)
                    except ObjectDoesNotExist:
                        group_check = 1

                    if group_check == 0:
                        if member_data_finish.group_info == '':
                            member_data_finish.group_info = '그룹'
                        else:
                            member_data_finish.group_info += '/그룹'
                    else:
                        if member_data_finish.group_info == '':
                            member_data_finish.group_info = '1:1'
                        else:
                            member_data_finish.group_info += '/1:1'

                    lecture_finish_count += MemberLectureTb.objects.filter(member_id=member_data.member_id,
                                                                           lecture_tb=lecture_info.lecture_id,
                                                                           auth_cd='VIEW', lecture_tb__use=1, use=1).count()

                    if lecture_info.use != 0:
                        # if lecture_info.state_cd == 'IP' or lecture_info.state_cd == 'PE':
                        # if lecture_info.state_cd == 'IP':
                        member_data_finish.lecture_reg_count += lecture_info.lecture_reg_count
                        member_data_finish.lecture_rem_count += lecture_info.lecture_rem_count
                        member_data_finish.lecture_avail_count += lecture_info.lecture_avail_count
                        member_data_finish.end_date = lecture_info.end_date
                        if member_data_finish.start_date is None or member_data_finish.start_date == '':
                            member_data_finish.start_date = lecture_info.start_date
                        else:
                            if member_data_finish.start_date > lecture_info.start_date:
                                member_data_finish.start_date = lecture_info.start_date

                        if member_data_finish.end_date is None or member_data_finish.end_date == '':
                            member_data_finish.end_date = lecture_info.end_date
                        else:
                            if member_data_finish.end_date < lecture_info.end_date:
                                member_data_finish.end_date = lecture_info.end_date

                        # if lecture_info.state_cd == 'NP' or lecture_info.state_cd == 'RJ':
                        #    member_data_finish.lecture_reg_count_yet += lecture_info.lecture_reg_count
                        #    member_data_finish.lecture_rem_count_yet += lecture_info.lecture_rem_count
                        #    member_data_finish.lecture_avail_count_yet += lecture_info.lecture_avail_count

                        if member_data_finish.mod_dt is None or member_data_finish.mod_dt == '':
                            member_data_finish.mod_dt = lecture_info.mod_dt
                        else:
                            if member_data_finish.mod_dt > lecture_info.mod_dt:
                                member_data_finish.mod_dt = lecture_info.mod_dt

                        member_data_finish.lecture_reg_count_total += lecture_info.lecture_reg_count
                        member_data_finish.lecture_rem_count_total += lecture_info.lecture_rem_count
                        member_data_finish.lecture_avail_count_total += lecture_info.lecture_avail_count
                        member_data_finish.lecture_id = lecture_info.lecture_id

                if member_data_finish.reg_info is None or str(member_data_finish.reg_info) != str(user_id):
                    if lecture_finish_count == 0:
                        member_data_finish.sex = ''
                        member_data_finish.birthday_dt = ''
                        member_data_finish.phone = '***-****-'+member_data_finish.phone[7:]
                        member_data_finish.user.email = ''

                member_data_finish.start_date = str(member_data_finish.start_date)
                member_data_finish.end_date = str(member_data_finish.end_date)
                member_data_finish.mod_dt = str(member_data_finish.mod_dt)
                if member_data_finish.birthday_dt is None or member_data_finish.birthday_dt == '':
                    member_data_finish.birthday_dt = ''
                else:
                    member_data_finish.birthday_dt = str(member_data_finish.birthday_dt)
                member_finish_list.append(member_data_finish)

        context['member_data'] = member_list
        context['member_finish_data'] = member_finish_list

    return context


class AlarmView(LoginRequiredMixin, AccessTestMixin, AjaxListView):
    context_object_name = "log_data"
    template_name = "alarm.html"
    page_template = 'alarm_page.html'

    def get_queryset(self):
        class_id = self.request.session.get('class_id', '')
        error = None
        log_data = None
        if error is None:
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
            log_data = LogTb.objects.filter(class_tb_id=class_id, use=1).order_by('read', '-reg_dt')
            # log_data.order_by('-reg_dt')

        if error is None:
            for log_info in log_data:
                if log_info.read == 0:
                    log_info.log_read = 0
                    log_info.read = 1
                    log_info.save()
                elif log_info.read == 1:
                    log_info.log_read = 1
                else:
                    log_info.log_read = 2
                log_info.time_ago = timezone.now() - log_info.reg_dt
                log_info.reg_dt = str(log_info.reg_dt).split('.')[0]
                # log_info.time_ago = str(log_info.time_ago).split('.')[0]

                if log_info.log_detail is not None and log_info.log_detail != '':
                    before_day = str(log_info.log_detail).split('/')[0]
                    after_day = str(log_info.log_detail).split('/')[1]

                    if '반복 일정' in log_info.log_info:
                        log_info.log_detail = before_day + '~' + after_day
                    else:
                        log_info.log_detail = before_day + '~' + after_day.split(' ')[1]

                day = int(log_info.time_ago.days)
                hour = int(log_info.time_ago.seconds/3600)
                minute = int(log_info.time_ago.seconds/60)
                sec = int(log_info.time_ago.seconds)

                if day > 0:
                    log_info.time_ago = str(day) + '일 전'
                else:
                    if hour > 0:
                        log_info.time_ago = str(hour) + '시간 전'
                    else:
                        if minute > 0:
                            log_info.time_ago = str(minute) + '분 전'
                        else:
                            log_info.time_ago = str(sec) + '초 전'

        return log_data


'''
@page_template('alarm_test_page.html')  # just add this decorator
def entry_index(
        request, template='alarm_test.html', extra_context=None):

    class_id = request.session.get('class_id', '')
    error = None
    log_data = None
    if error is None:
        # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
        log_data = LogTb.objects.filter(class_tb_id=class_id, use=1).order_by('-reg_dt')
        log_data.order_by('-reg_dt')

    context = {
        'log_data': log_data,
    }
    if extra_context is not None:
        context.update(extra_context)
    return render(request, template, context)
'''


class TrainerSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerSettingView, self).get_context_data(**kwargs)

        return context


class HelpPtersView(AccessTestMixin, TemplateView):
    template_name = 'setting_help.html'

    def get_context_data(self, **kwargs):
        context = super(HelpPtersView, self).get_context_data(**kwargs)

        return context


class DeleteAccountView(AccessTestMixin, TemplateView):
    template_name = 'delete_account_form.html'

    def get_context_data(self, **kwargs):
        context = super(DeleteAccountView, self).get_context_data(**kwargs)

        return context


class MyPageView(AccessTestMixin, TemplateView):
    template_name = 'setting_mypage.html'

    def get_context_data(self, **kwargs):
        context = super(MyPageView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        class_info = None
        now = timezone.now()
        next_schedule_start_dt = ''
        next_schedule_end_dt = ''

        context = get_trainer_setting_data(context, self.request.user.id, class_id)
        today = datetime.date.today()
        month_first_day = today.replace(day=1)
        next_year = int(month_first_day.strftime('%Y')) + 1
        next_month = int(month_first_day.strftime('%m')) % 12 + 1
        next_month_first_day = month_first_day.replace(month=next_month)

        if next_month == 1:
            next_month_first_day = next_month_first_day.replace(year=next_year)

        end_schedule_num = 0
        new_member_num = 0
        total_member_num = 0
        current_total_member_num = 0
        center_name = '없음'

        off_repeat_schedule_id = []
        off_repeat_schedule_type = []
        off_repeat_schedule_week_info = []
        off_repeat_schedule_start_date = []
        off_repeat_schedule_end_date = []
        off_repeat_schedule_start_time = []
        off_repeat_schedule_time_duration = []
        context['total_member_num'] = 0
        context['current_total_member_num'] = 0
        context['end_schedule_num'] = 0
        context['new_member_num'] = 0

        if class_id is None or class_id == '':
            error = '강사 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                user_member_info = MemberTb.objects.get(member_id=self.request.user.id)
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '강좌 정보를 불러오지 못했습니다.'

        if error is None:
            if class_info.center_tb is None or class_info.center_tb == '':
                center_name = '없음'
            else:
                center_name = class_info.center_tb.center_name
        if error is None:
            off_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                       en_dis_type='0')

        if error is None:
            for off_repeat_schedule_info in off_repeat_schedule_data:
                off_repeat_schedule_id.append(off_repeat_schedule_info.repeat_schedule_id)
                off_repeat_schedule_type.append(off_repeat_schedule_info.repeat_type_cd)
                off_repeat_schedule_week_info.append(off_repeat_schedule_info.week_info)
                off_repeat_schedule_start_date.append(str(off_repeat_schedule_info.start_date))
                off_repeat_schedule_end_date.append(str(off_repeat_schedule_info.end_date))
                off_repeat_schedule_start_time.append(off_repeat_schedule_info.start_time)
                off_repeat_schedule_time_duration.append(off_repeat_schedule_info.time_duration)

        if error is None:
            all_member = MemberTb.objects.filter().order_by('name')

            for member_info in all_member:
                # member_data = member_info

                # 강좌에 해당하는 수강/회원 정보 가져오기
                total_class_lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                                         lecture_tb__member_id=member_info.member_id,
                                                                         lecture_tb__use=1, auth_cd='VIEW',
                                                                         use=1).order_by('-lecture_tb__start_date')
                class_lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                                   lecture_tb__member_id=member_info.member_id,
                                                                   lecture_tb__state_cd='IP',
                                                                   lecture_tb__use=1,
                                                                   auth_cd='VIEW',
                                                                   use=1).order_by('-lecture_tb__start_date')

                if len(total_class_lecture_list) > 0:
                    total_member_num += 1

                if len(class_lecture_list) > 0:
                    current_total_member_num += 1
                    start_date = ''
                    for lecture_info_data in class_lecture_list:
                        lecture_info = lecture_info_data.lecture_tb
                        if lecture_info.state_cd == 'IP':
                            if start_date == '':
                                start_date = lecture_info.start_date
                            else:
                                if start_date > lecture_info.start_date:
                                    start_date = lecture_info.start_date
                    if start_date != '':
                        if month_first_day <= start_date < next_month_first_day:
                            new_member_num += 1

        if error is None :
            # 남은 횟수 1개 이상인 경우 - 180314 hk.kim
            context['total_member_num'] = total_member_num
            # 남은 횟수 1개 이상 3개 미만인 경우 - 180314 hk.kim
            context['current_total_member_num'] = current_total_member_num
            context['new_member_num'] = new_member_num

        if error is None:
            end_schedule_num = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                         en_dis_type='1', state_cd='PE').count()
        if error is None:
            if user_member_info.birthday_dt is None:
                user_member_info.birthday_dt = '미입력'
            else:
                user_member_info.birthday_dt = str(user_member_info.birthday_dt)
            if user_member_info.country is None:
                user_member_info.country = '미입력'
            if user_member_info.address is None:
                user_member_info.address = '미입력'

            user_member_info.reg_dt = str(user_member_info.reg_dt).split('.')[0]

        pt_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                     en_dis_type='1',
                                                     start_dt__gte=now, use=1).order_by('start_dt')
        if len(pt_schedule_data) > 0:
            next_schedule_start_dt = pt_schedule_data[0].start_dt
            next_schedule_end_dt = pt_schedule_data[0].end_dt

        context['next_schedule_start_dt'] = str(next_schedule_start_dt)
        context['next_schedule_end_dt'] = str(next_schedule_end_dt)
        context['member_info'] = user_member_info
        context['end_schedule_num'] = end_schedule_num
        context['center_name'] = center_name

        context['off_repeat_schedule_id_data'] = off_repeat_schedule_id
        context['off_repeat_schedule_type_data'] = off_repeat_schedule_type
        context['off_repeat_schedule_week_info_data'] = off_repeat_schedule_week_info
        context['off_repeat_schedule_start_date_data'] = off_repeat_schedule_start_date
        context['off_repeat_schedule_end_date_data'] = off_repeat_schedule_end_date
        context['off_repeat_schedule_start_time_data'] = off_repeat_schedule_start_time
        context['off_repeat_schedule_time_duration_data'] = off_repeat_schedule_time_duration

        return context


class MyPageViewAjax(AccessTestMixin, TemplateView):
    template_name = 'mypage_member_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(MyPageViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        class_info = None
        now = timezone.now()
        next_schedule_start_dt = ''
        next_schedule_end_dt = ''

        context = get_trainer_setting_data(context, self.request.user.id, class_id)
        today = datetime.date.today()
        month_first_day = today.replace(day=1)
        next_year = int(month_first_day.strftime('%Y')) + 1
        next_month = int(month_first_day.strftime('%m')) % 12 + 1
        next_month_first_day = month_first_day.replace(month=next_month)

        if next_month == 1:
            next_month_first_day = next_month_first_day.replace(year=next_year)

        end_schedule_num = 0
        new_member_num = 0
        total_member_num = 0
        current_total_member_num = 0
        center_name = '없음'
        off_repeat_schedule_id = []
        off_repeat_schedule_type = []
        off_repeat_schedule_week_info = []
        off_repeat_schedule_start_date = []
        off_repeat_schedule_end_date = []
        off_repeat_schedule_start_time = []
        off_repeat_schedule_time_duration = []
        context['total_member_num'] = 0
        context['current_total_member_num'] = 0
        context['end_schedule_num'] = 0
        context['new_member_num'] = 0

        if class_id is None or class_id == '':
            error = '강사 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                user_member_info = MemberTb.objects.get(member_id=self.request.user.id)
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '강좌 정보를 불러오지 못했습니다.'

        if error is None:
            if class_info.center_tb is None or class_info.center_tb == '':
                center_name = '없음'
            else:
                center_name = class_info.center_tb.center_name
        if error is None:
            off_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                       en_dis_type='0')

        if error is None:
            for off_repeat_schedule_info in off_repeat_schedule_data:
                off_repeat_schedule_id.append(off_repeat_schedule_info.repeat_schedule_id)
                off_repeat_schedule_type.append(off_repeat_schedule_info.repeat_type_cd)
                off_repeat_schedule_week_info.append(off_repeat_schedule_info.week_info)
                off_repeat_schedule_start_date.append(str(off_repeat_schedule_info.start_date))
                off_repeat_schedule_end_date.append(str(off_repeat_schedule_info.end_date))
                off_repeat_schedule_start_time.append(off_repeat_schedule_info.start_time)
                off_repeat_schedule_time_duration.append(off_repeat_schedule_info.time_duration)
        # error = 'test'
        if error is None:
            all_member = MemberTb.objects.filter().order_by('name')

            for member_info in all_member:
                # member_data = member_info

                # 강좌에 해당하는 수강/회원 정보 가져오기
                total_class_lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                                         lecture_tb__member_id=member_info.member_id,
                                                                         lecture_tb__use=1,
                                                                         auth_cd='VIEW',
                                                                         use=1).order_by('-lecture_tb__start_date')
                class_lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id,
                                                                   lecture_tb__member_id=member_info.member_id,
                                                                   lecture_tb__state_cd='IP',
                                                                   lecture_tb__use=1,
                                                                   auth_cd='VIEW',
                                                                   use=1).order_by('-lecture_tb__start_date')

                if len(total_class_lecture_list) > 0:
                    total_member_num += 1

                if len(class_lecture_list) > 0:
                    total_member_num += 1
                    start_date = ''
                    for lecture_info_data in class_lecture_list:
                        lecture_info = lecture_info_data.lecture_tb
                        if lecture_info.state_cd == 'IP':
                            if start_date == '':
                                start_date = lecture_info.start_date
                            else:
                                if start_date > lecture_info.start_date:
                                    start_date = lecture_info.start_date
                    if start_date != '':
                        if month_first_day <= start_date < next_month_first_day:
                            new_member_num += 1

        if error is None :
            # 남은 횟수 1개 이상인 경우 - 180314 hk.kim
            context['total_member_num'] = total_member_num
            # 남은 횟수 1개 이상 3개 미만인 경우 - 180314 hk.kim
            context['current_total_member_num'] = current_total_member_num
            context['new_member_num'] = new_member_num

        if error is None:
            end_schedule_num = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                         en_dis_type='1',
                                                         state_cd='PE', use=1).count()
            # new_member_num = LectureTb.objects.filter(class_tb_id=class_info.class_id,
            #                                          start_date__gte=month_first_day,
            #                                          start_date__lt=next_month_first_day, use=1).count()

        if error is None:
            if user_member_info.birthday_dt is None:
                user_member_info.birthday_dt = '미입력'
            else:
                user_member_info.birthday_dt = str(user_member_info.birthday_dt)
            if user_member_info.country is None:
                user_member_info.country = '미입력'
            if user_member_info.address is None:
                user_member_info.address = '미입력'

        pt_schedule_data = ScheduleTb.objects.filter(class_tb=class_id,
                                                     en_dis_type='1',
                                                     start_dt__gte=now,
                                                     use=1).order_by('start_dt')
        if len(pt_schedule_data) > 0:
            next_schedule_start_dt = pt_schedule_data[0].start_dt
            next_schedule_end_dt = pt_schedule_data[0].end_dt

        context['next_schedule_start_dt'] = str(next_schedule_start_dt)
        context['next_schedule_end_dt'] = str(next_schedule_end_dt)
        context['member_info'] = user_member_info
        context['end_schedule_num'] = end_schedule_num
        context['center_name'] = center_name

        context['off_repeat_schedule_id_data'] = off_repeat_schedule_id
        context['off_repeat_schedule_type_data'] = off_repeat_schedule_type
        context['off_repeat_schedule_week_info_data'] = off_repeat_schedule_week_info
        context['off_repeat_schedule_start_date_data'] = off_repeat_schedule_start_date
        context['off_repeat_schedule_end_date_data'] = off_repeat_schedule_end_date
        context['off_repeat_schedule_start_time_data'] = off_repeat_schedule_start_time
        context['off_repeat_schedule_time_duration_data'] = off_repeat_schedule_time_duration

        return context


class PushSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_push.html'

    def get_context_data(self, **kwargs):
        context = super(PushSettingView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_trainer_setting_data(context, self.request.user.id, class_id)

        return context


class ReserveSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_reserve.html'

    def get_context_data(self, **kwargs):
        context = super(ReserveSettingView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_trainer_setting_data(context, self.request.user.id, class_id)

        return context


class ClassSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_class.html'

    def get_context_data(self, **kwargs):
        context = super(ClassSettingView, self).get_context_data(**kwargs)

        return context


class SalesSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_sales.html'

    def get_context_data(self, **kwargs):
        context = super(SalesSettingView, self).get_context_data(**kwargs)

        return context


class LanguageSettingView(AccessTestMixin, TemplateView):
    template_name = 'setting_language.html'

    def get_context_data(self, **kwargs):
        context = super(LanguageSettingView, self).get_context_data(**kwargs)

        return context


# 회원가입 api
def add_member_info_logic(request):
    fast_check = request.POST.get('fast_check', '0')
    user_id = request.POST.get('user_id')
    username = request.POST.get('username', '')
    name = request.POST.get('name')
    phone = request.POST.get('phone')
    contents = request.POST.get('contents')
    counts = request.POST.get('counts')
    price = request.POST.get('price')
    start_date = request.POST.get('start_date')
    end_date = request.POST.get('end_date')
    counts_fast = request.POST.get('counts_fast')
    price_fast = request.POST.get('price_fast')
    start_date_fast = request.POST.get('start_date_fast')
    end_date_fast = request.POST.get('end_date_fast')
    search_confirm = request.POST.get('search_confirm', '0')
    class_id = request.session.get('class_id', '')
    group_id = request.POST.get('group_id', '')
    next_page = request.POST.get('next_page')

    error = None
    input_start_date = ''
    input_end_date = ''
    input_counts = 0
    input_price = 0
    lecture_info = None
    # username = name
    if username is None or username == '':
       error = '오류가 발생했습니다. 다시 시도해주세요.'

    if search_confirm == '0':
        if name == '':
            error = '이름을 입력해 주세요.'

    if error is None:
        # username = name.replace(' ', '')
        if fast_check == '0':
            if counts_fast == '':
                error = '남은 횟수를 입력해 주세요.'
            elif start_date_fast == '':
                error = '시작 날짜를 입력해 주세요.'
            else:
                input_counts = counts_fast
                input_start_date = start_date_fast
                if price_fast == '':
                    input_price = 0
                else:
                    input_price = price_fast
                if end_date_fast == '':
                    input_end_date = '9999-12-31'
                else:
                    input_end_date = end_date_fast

        elif fast_check == '1':
            if counts == '':
                error = '남은 횟수를 입력해 주세요.'
            elif start_date == '':
                error = '시작 날짜를 입력해 주세요.'
            else:
                input_counts = counts
                input_start_date = start_date
                if price == '':
                    input_price = 0
                else:
                    input_price = price
                if end_date == '':
                    input_end_date = '9999-12-31'
                else:
                    input_end_date = end_date

    if error is None:
        try:
            user = User.objects.get(username=username)

        except ObjectDoesNotExist:
            error = '가입되지 않은 회원입니다.'

    if error is None:
        if group_id != '' and group_id is not None:
            try:
                group_info = GroupTb.objects.get(group_id=group_id)
            except ObjectDoesNotExist:
                error = '그룹 정보를 불러오지 못했습니다.'

            if error is None:
                group_counter = GroupLectureTb.objects.filter(group_tb_id=group_id, use=1).count()
                if group_info.group_type_cd == 'NORMAL':
                    if group_counter >= group_info.member_num:
                        error = '그룹 허용 인원을 초과했습니다.'

    if error is None:
        error = add_member_lecture_info(request.user.id, request.user.last_name, request.user.first_name,
                                        class_id, group_id, input_counts, input_price,
                                        input_start_date, input_end_date, contents, user.id)
    if error is None:
        return redirect(next_page)

    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


def add_lecture_info_logic_func(member_id, state_cd, counts, price, start_date, end_date, contents):

    lecture = LectureTb(member_id=member_id,
                        lecture_reg_count=counts, lecture_rem_count=counts,
                        lecture_avail_count=counts, price=price, option_cd='DC',
                        state_cd=state_cd,
                        start_date=start_date, end_date=end_date,
                        note=contents,
                        mod_dt=timezone.now(),
                        reg_dt=timezone.now(), use=1)
    lecture.save()

    return lecture


# 회원수정 api
def update_member_info_logic(request):
    member_id = request.POST.get('member_id')
    first_name = request.POST.get('first_name', '')
    last_name = request.POST.get('last_name', '')
    phone = request.POST.get('phone', '')
    sex = request.POST.get('sex', '')
    birthday_dt = request.POST.get('birthday', '')
    next_page = request.POST.get('next_page')

    error = None
    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    input_first_name = ''
    input_last_name = ''
    input_phone = ''
    input_sex = ''
    input_birthday_dt = ''
    if error is None:
        if user.is_active:
            error = '회원 정보를 수정할수 없습니다.'

    if error is None:
        if first_name is None or first_name == '':
            input_first_name = user.first_name
        else:
            input_first_name = first_name

        if last_name is None or last_name == '':
            input_last_name = user.last_name
        else:
            input_last_name = last_name

        if sex is None or sex == '':
            input_sex = member.sex
        else:
            input_sex = sex

        if birthday_dt is None or birthday_dt == '':
            input_birthday_dt = member.birthday_dt
        else:
            input_birthday_dt = birthday_dt

        if phone is None or phone == '':
            input_phone = member.phone
        else:
            if len(phone) != 11 and len(phone) != 10:
                error = '연락처를 확인해 주세요.'
            elif not phone.isdigit():
                error = '연락처를 확인해 주세요.'
            else:
                input_phone = phone

    if error is None:
        try:
            with transaction.atomic():
                if user.first_name != input_first_name or user.last_name != input_last_name:
                    user.first_name = input_first_name
                    user.last_name = input_last_name
                    member.name = input_last_name + input_first_name
                    username = user.last_name + user.first_name

                    count = MemberTb.objects.filter(name=username).count()
                    if count != 0:
                        # username += str(count + 1)
                        test = False
                        i = count + 1

                        while True:
                            username = user.last_name + user.first_name + str(i)
                            try:
                                User.objects.get(username=username)
                            except ObjectDoesNotExist:
                                test = True

                            if test:
                                break
                            else:
                                i += 1

                    user.username = username
                    user.save()

                member.phone = input_phone
                member.sex = input_sex
                if input_birthday_dt is not None and input_birthday_dt != '':
                    member.birthday_dt = input_birthday_dt
                member.mod_dt = timezone.now()
                member.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=user.last_name+user.first_name,
                         log_info='회원 정보', log_how='수정',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


# 회원가입 api
def delete_member_info_logic(request):
    member_id = request.POST.get('id')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')
    member_name = None
    error = None

    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:

        try:
            user = User.objects.get(username=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=user.id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    if error is None:
        class_lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__member_id=user.id, use=1, auth_cd='VIEW')
        member_name = member.name

    if error is None:
        try:
            with transaction.atomic():
                if user.is_active == 1:
                    for class_lecture_info in class_lecture_data:
                        lecture_info = class_lecture_info.lecture_tb

                        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                  lecture_tb_id=lecture_info.lecture_id,
                                                                  state_cd='NP')

                        schedule_data_finish = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                         lecture_tb_id=lecture_info.lecture_id,
                                                                         state_cd='PE')
                        repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                               lecture_tb_id=lecture_info.lecture_id)

                        member_lecture_list = MemberLectureTb.objects.filter(member_id=user.id,
                                                                             lecture_tb_id=lecture_info.lecture_id).exclude(auth_cd='VIEW')

                        # group_info = GroupLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, use=1)

                        if len(member_lecture_list) > 0:
                            schedule_data.delete()
                            schedule_data_finish.delete()
                            repeat_schedule_data.delete()
                            lecture_info.delete()
                            # group_info.delete()
                        else:
                            # schedule_data.delete()
                            # repeat_schedule_data.delete()
                            if len(schedule_data) > 0:
                                schedule_data.delete()
                            if len(schedule_data_finish) > 0:
                                schedule_data_finish.update(mod_dt=timezone.now(), use=0)
                            # lecture_info.use = 0
                            # lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                            if lecture_info.state_cd == 'IP':
                                lecture_info.state_cd = 'PE'
                                lecture_info.mod_dt = timezone.now()
                                lecture_info.save()
                            # lecture_info.mod_dt = timezone.now()
                            # lecture_info.save()

                    class_lecture_data.update(auth_cd='DELETE', mod_member_id=request.user.id, mod_dt=timezone.now())
                else:
                    for class_lecture_info in class_lecture_data:
                        lecture_info = class_lecture_info.lecture_tb
                        schedule_data = ScheduleTb.objects.filter(class_tb_id=class_id,
                                                                  lecture_tb_id=lecture_info.lecture_id)
                        repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                               lecture_tb_id=lecture_info.lecture_id)
                        # schedule_data.delete()
                        if len(schedule_data) > 0:
                            schedule_data.delete()
                        repeat_schedule_data.delete()
                        # lecture_info.use = 0
                        # lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                        lecture_info.delete()
                        # lecture_info.mod_dt = timezone.now()
                        # lecture_info.save()
                        member_lecture_list = MemberLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
                        if len(member_lecture_list) > 0:
                            member_lecture_list.delete()

                    class_lecture_data.delete()
                    if str(member.reg_info) == str(request.user.id):
                        member_lecture_list_confirm = MemberLectureTb.objects.filter(member_id=user.id)
                        if len(member_lecture_list_confirm) == 0:
                            member.delete()
                            user.delete()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member.name + ' 회원님의</span> 수강정보를 <span class="status">삭제</span>했습니다.'

        log_data = LogTb(log_type='LB02', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id,
                         log_info='수강 정보', log_how='삭제',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


# 회원수정 api
def update_trainer_info_logic(request):
    member_id = request.POST.get('id')
    email = request.POST.get('email', '')
    first_name = request.POST.get('first_name', '')
    last_name = request.POST.get('last_name', '')
    phone = request.POST.get('phone', '')
    contents = request.POST.get('contents', '')
    country = request.POST.get('country', '')
    address = request.POST.get('address', '')
    sex = request.POST.get('sex', '')
    birthday_dt = request.POST.get('birthday', '')
    next_page = request.POST.get('next_page')

    error = None
    member_id = request.user.id
    if member_id == '':
        error = '회원 ID를 확인해 주세요.'

    if error is None:
        try:
            user = User.objects.get(id=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=user.id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    input_first_name = ''
    input_last_name = ''
    input_phone = ''
    input_contents = ''
    input_country = ''
    input_address = ''
    input_sex = ''
    input_birthday_dt = ''

    if first_name is None or first_name == '':
        input_first_name = user.first_name
    else:
        input_first_name = first_name

    if last_name is None or last_name == '':
        input_last_name = user.last_name
    else:
        input_last_name = last_name

    if contents is None or contents == '':
        input_contents = member.contents
    else:
        input_contents = contents

    if country is None or country == '':
        input_country = member.country
    else:
        input_country = country

    if address is None or address == '':
        input_address = member.address
    else:
        input_address = address

    if sex is None or sex == '':
        input_sex = member.sex
    else:
        input_sex = sex

    if birthday_dt is None or birthday_dt == '':
        input_birthday_dt = member.birthday_dt
    else:
        input_birthday_dt = birthday_dt

    if phone is None or phone == '':
        input_phone = member.phone
    else:
        if len(phone) != 11 and len(phone) != 10:
            error = '연락처를 확인해 주세요.'
        elif not phone.isdigit():
            error = '연락처를 확인해 주세요.'
        else:
            input_phone = phone

    if error is None:
        try:
            with transaction.atomic():
                user.first_name = input_first_name
                user.last_name = input_last_name
                # user.email = email
                user.save()
                member.name = input_last_name + input_first_name
                member.phone = input_phone
                member.contents = input_contents
                member.sex = input_sex
                if input_birthday_dt is not None and input_birthday_dt != '':
                    member.birthday_dt = input_birthday_dt
                member.country = input_country
                member.address = input_address
                member.mod_dt = timezone.now()
                member.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id,
                         from_member_name=request.user.last_name + request.user.first_name,
                         log_info='본인 정보', log_how='수정',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + error)
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def resend_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page', '')

    error = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = MemberLectureTb.objects.get(lecture_tb_id=lecture_id)
            # lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        # lecture_info.state_cd = 'NP'
        lecture_info.auth_cd = 'WAIT'
        # lecture_info.member_view_state_cd = 'WAIT'
        lecture_info.mod_dt = timezone.now()

        lecture_info.save()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status">재요청</span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_id,
                         log_info='수강 정보 연동', log_how='재요청',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def delete_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    member_id = request.POST.get('member_id', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_lecture_info = ClassLectureTb.objects.get(class_tb_id=class_id, lecture_tb_id=lecture_id)
            # lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            user = User.objects.get(username=member_id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

        try:
            member = MemberTb.objects.get(user_id=user.id)
        except ObjectDoesNotExist:
            error = '회원 ID를 확인해 주세요.'

    if error is None:
        lecture_info = class_lecture_info.lecture_tb
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                  state_cd='NP')
        schedule_data_finish = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                         state_cd='PE')
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_id)
        # schedule_data.delete()
        # repeat_schedule_data.delete()

        member_lecture_list = MemberLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_id).exclude(
            auth_cd='VIEW')
        if user.is_active:
            if len(member_lecture_list) > 0:
                class_lecture_info.delete()
                member_lecture_list.delete()
                schedule_data.delete()
                schedule_data_finish.delete()
                repeat_schedule_data.delete()
                lecture_info.delete()

            else:
                schedule_data.update(mod_dt=timezone.now(), use=0)
                schedule_data_finish.update(mod_dt=timezone.now(), use=0)
                class_lecture_info.auth_cd = 'DELETE'
                # lecture_info.use = 0
                # lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                class_lecture_info.mod_dt = timezone.now()
                # if lecture_info.state_cd == 'IP':
                #    lecture_info.state_cd = 'PE'
                class_lecture_info.save()
                if lecture_info.state_cd == 'IP':
                    lecture_info.state_cd = 'PE'
                    lecture_info.mod_dt = timezone.now()
                    lecture_info.save()
        else:
            class_lecture_info.delete()
            member_lecture_list.delete()
            schedule_data.delete()
            schedule_data_finish.delete()
            repeat_schedule_data.delete()
            lecture_info.delete()
            # 회원의 수강정보가 더이상 없는경우
            if str(member.reg_info) == str(request.user.id):
                member_lecture_list_confirm = MemberLectureTb.objects.filter(member_id=user.id)
                if len(member_lecture_list_confirm) == 0:
                    member.delete()
                    user.delete()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status"> 삭제 </span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_id,
                         log_info='수강 정보', log_how='삭제',
                         reg_dt=timezone.now(), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def refund_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                  state_cd='NP')
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
        # schedule_data.delete()
        # repeat_schedule_data.delete()
        # lecture_info.use = 0
        # lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
        lecture_info.mod_dt = timezone.now()
        lecture_info.state_cd = 'RF'
        lecture_info.save()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status"> 삭제 </span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='환불 처리',
                         reg_dt=timezone.now(), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def update_member_lecture_view_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    auth_cd = request.POST.get('member_view_state_cd', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        if auth_cd != 'VIEW' and auth_cd != 'WAIT' and auth_cd != 'DELETE':
            error = '수강정보 연결 상태를 불러오지 못했습니다.'

    if error is None:
        try:
            member_lecture_info = MemberLectureTb.objects.get(lecture_tb_id=lecture_id)
            # lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        member_lecture_info.auth_cd = auth_cd
        # lecture_info.member_view_state_cd = member_view_state_cd
        # lecture_info.mod_dt = timezone.now()
        # lecture_info.save()
        member_lecture_info.mod_dt = timezone.now()
        member_lecture_info.save()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status"> 삭제 </span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_id,
                         log_info='수강 정보 연동', log_how='수정',
                         reg_dt=timezone.now(), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def refund_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    refund_price = request.POST.get('refund_price', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    input_refund_price = 0
    error = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        if refund_price is None or refund_price == 0:
            error = '환불 금액을 입력해 주세요.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            input_refund_price = int(refund_price)
        except ValueError:
            error = '환불 금액은 숫자만 입력 가능합니다.'

    if error is None:
        if input_refund_price > lecture_info.price:
            error = '환불 금액이 등록 금액보다 많습니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id).exclude(state_cd='PE')
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
        schedule_data.delete()
        repeat_schedule_data.delete()
        lecture_info.refund_price = input_refund_price
        lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
        lecture_info.mod_dt = timezone.now()
        lecture_info.state_cd = 'RF'
        lecture_info.save()

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='환불 처리',
                         reg_dt=timezone.now(), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def progress_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
        schedule_data_finish = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id, state_cd='PE')
        lecture_info.lecture_avail_count = lecture_info.lecture_reg_count - len(schedule_data)
        lecture_info.lecture_rem_count = lecture_info.lecture_reg_count - len(schedule_data_finish)
        lecture_info.mod_dt = timezone.now()
        lecture_info.state_cd = 'IP'
        lecture_info.save()

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='진행중 처리',
                         reg_dt=timezone.now(), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def finish_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    member_name = request.POST.get('member_name', '')
    next_page = request.POST.get('next_page', '')
    class_id = request.session.get('class_id', '')
    error = None

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id).exclude(state_cd='PE')
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id)
        schedule_data.delete()
        repeat_schedule_data.delete()
        lecture_info.lecture_avail_count = 0
        lecture_info.lecture_rem_count = 0
        lecture_info.mod_dt = timezone.now()
        lecture_info.state_cd = 'PE'
        lecture_info.save()

    if error is None:
        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='완료 처리',
                         reg_dt=timezone.now(), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


@csrf_exempt
def update_member_lecture_info_logic(request):

    lecture_id = request.POST.get('lecture_id', '')
    start_date = request.POST.get('start_date', '')
    end_date = request.POST.get('end_date', '')
    price = request.POST.get('price', '')
    refund_price = request.POST.get('refund_price', '')
    lecture_reg_count = request.POST.get('lecture_reg_count', '')
    note = request.POST.get('note', '')
    member_name = request.POST.get('member_name', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page', '')

    error = None
    input_refund_price = 0
    input_price = 0
    input_lecture_reg_count = 0
    finish_pt_count = 0
    reserve_pt_count = 0

    if lecture_id is None or lecture_id == '':
        error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        try:
            lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:

        if start_date is None or start_date == '':
            start_date = lecture_info.start_date
        if end_date is None or end_date == '':
            end_date = lecture_info.end_date
        if price is None or price == '':
            input_price = lecture_info.price
        else:
            try:
                input_price = int(price)
            except ValueError:
                error = '강의 금액은 숫자만 입력 가능합니다.'
        if refund_price is None or refund_price == '':
            input_refund_price = lecture_info.refund_price
        else:
            try:
                input_refund_price = int(refund_price)
            except ValueError:
                error = '환불 금액은 숫자만 입력 가능합니다.'
        if lecture_reg_count is None or lecture_reg_count == '':
            input_lecture_reg_count = lecture_info.lecture_reg_count
        else:
            try:
                input_lecture_reg_count = int(lecture_reg_count)
            except ValueError:
                error = '등록 횟수는 숫자만 입력 가능합니다.'

        if note is None or note == '':
            note = lecture_info.note

    if error is None:
        if input_lecture_reg_count < lecture_info.lecture_reg_count-lecture_info.lecture_avail_count:
            error = '등록 횟수가 이미 등록한 스케쥴보다 작습니다.'

    if error is None:
        schedule_list = ScheduleTb.objects.filter(lecture_tb=lecture_id)
        if len(schedule_list) > 0:
            reserve_pt_count = schedule_list.count()
            finish_pt_count = schedule_list.filter(state_cd='PE').count()

    if error is None:
        lecture_info.start_date = start_date
        lecture_info.end_date = end_date
        lecture_info.price = input_price
        lecture_info.refund_price = input_refund_price
        lecture_info.note = note
        if lecture_info.state_cd == 'IP':
            lecture_info.lecture_reg_count = input_lecture_reg_count
            lecture_info.lecture_rem_count = input_lecture_reg_count - finish_pt_count
            lecture_info.lecture_avail_count = input_lecture_reg_count - reserve_pt_count
        lecture_info.mod_dt = timezone.now()
        lecture_info.save()

    if error is None:
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 강사님께서 ' \
        #               + member_name + ' 회원님의</span> 수강정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='수정',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


@method_decorator(csrf_exempt, name='dispatch')
class GetMemberInfoView(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'search_member_id_ajax.html'

    def get(self, request, *args, **kwargs):

        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        context = super(GetMemberInfoView, self).get_context_data(**kwargs)
        user_id = request.POST.get('id', '')
        class_id = request.session.get('class_id', '')

        member = ''
        user = ''
        error = None

        if user_id == '':
            error = '회원 ID를 입력해주세요.'
        if error is None:
            try:
                user = User.objects.get(username=user_id)
            except ObjectDoesNotExist:
                error = '회원 ID를 확인해 주세요.'

        if error is None:
            try:
                group = user.groups.get(user=user.id)
            except ObjectDoesNotExist:
                error = '회원 ID를 확인해 주세요.'

            if error is None:
                if group.name != 'trainee':
                    error = '회원 ID를 확인해 주세요.'

        if error is None:
            try:
                member = MemberTb.objects.get(user_id=user.id)
            except ObjectDoesNotExist:
                error = '회원 ID를 확인해 주세요.'
        if error is None:
            lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__member_id=user.id,
                                                         lecture_tb__use=1, auth_cd='VIEW', use=1)
        lecture_count = 0

        if error is None:
            for lecture_info_data in lecture_list:
                member_lecture_list = MemberLectureTb.objects.filter(member_id=user.id,
                                                                     lecture_tb=lecture_info_data.lecture_tb_id,
                                                                     auth_cd='VIEW', lecture_tb__use=1)
                lecture_count += len(member_lecture_list)

        if error is None:
            if member.reg_info is None or member.reg_info != request.user.id:
                if lecture_count == 0:
                    member.sex = ''
                    member.birthday_dt = ''
                    member.phone = '***-****-'+member.phone[7:]
                    member.user.email = ''

            if member.birthday_dt is None or member.birthday_dt == '':
                member.birthday_dt = ''
            else:
                member.birthday_dt = str(member.birthday_dt)

        context['member_info'] = member
        if error is not None:
            logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
            messages.error(request, error)

        return render(request, self.template_name, context)


# log 삭제
def alarm_delete_logic(request):
    log_size = request.POST.get('log_id_size')
    delete_log_id = request.POST.getlist('log_id_array[]')
    next_page = request.POST.get('next_page')

    error = None
    if log_size == '0':
        error = '로그가 없습니다.'

    if error is None:

        for i in range(0, int(log_size)):
            try:
                log_info = LogTb.objects.get(log_id=delete_log_id[i])
            except ObjectDoesNotExist:
                error = '로그를 불러오지 못했습니다.'
            if error is None:
                log_info.use = 0
                log_info.mod_dt = timezone.now()
                log_info.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
        return redirect(next_page)


@method_decorator(csrf_exempt, name='dispatch')
class ReadMemberLectureData(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'member_lecture_data_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(ReadMemberLectureData, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        context['error'] = None

        context = get_trainee_repeat_schedule_data_func(context, class_id, None)
        if context['error'] is None:
            context = get_member_data(context, class_id, None, request.user.id)

        if context['error'] is not None:
            logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+context['error'])
            messages.error(request, context['error'])

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        context = super(ReadMemberLectureData, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        member_id = request.POST.get('member_id', None)
        context['error'] = None
        context = get_trainee_repeat_schedule_data_func(context, class_id, member_id)
        if context['error'] is None:
            context = get_member_data(context, class_id, member_id, request.user.id)

        if context['error'] is not None:
            logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+context['error'])
            messages.error(request, context['error'])

        return render(request, self.template_name, context)


@method_decorator(csrf_exempt, name='dispatch')
class ReadMemberLectureDataFromSchedule(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'member_lecture_data_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(ReadMemberLectureDataFromSchedule, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        context['error'] = None

        context = get_trainee_repeat_schedule_data_func_from_schedule(context, class_id, None)
        if context['error'] is None:
            context = get_member_data(context, class_id, None, request.user.id)

        if context['error'] is not None:
            logger.error(
                request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + context[
                    'error'])
            messages.error(request, context['error'])

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        context = super(ReadMemberLectureDataFromSchedule, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        member_id = request.POST.get('member_id', None)
        context['error'] = None
        context = get_trainee_repeat_schedule_data_func_from_schedule(context, class_id, member_id)
        if context['error'] is None:
            context = get_member_data(context, class_id, member_id, request.user.id)

        if context['error'] is not None:
            logger.error(
                request.user.last_name + ' ' + request.user.first_name + '[' + str(request.user.id) + ']' + context[
                    'error'])
            messages.error(request, context['error'])

        return render(request, self.template_name, context)


# 강사 예약허용시간 setting 업데이트 api
def update_setting_push_logic(request):
    setting_trainee_schedule_confirm1 = request.POST.get('setting_trainee_schedule_confirm1', '')
    setting_trainee_schedule_confirm2 = request.POST.get('setting_trainee_schedule_confirm2', '')
    setting_trainee_no_schedule_confirm = request.POST.get('setting_trainee_no_schedule_confirm', '')
    setting_trainer_schedule_confirm = request.POST.get('setting_trainer_schedule_confirm', '')
    setting_trainer_no_schedule_confirm1 = request.POST.get('setting_trainer_no_schedule_confirm1', '')
    setting_trainer_no_schedule_confirm2 = request.POST.get('setting_trainer_no_schedule_confirm2', '')
    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    lt_pus_01 = None
    lt_pus_02 = None
    lt_pus_03 = None
    lt_pus_04 = None

    if error is None:
        try:
            lt_pus_01 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_01')
        except ObjectDoesNotExist:
            lt_pus_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_01', reg_dt=timezone.now(),
                                  use=1)
        try:
            lt_pus_02 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_02')
        except ObjectDoesNotExist:
            lt_pus_02 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_02', reg_dt=timezone.now(),
                                  use=1)
        try:
            lt_pus_03 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_03')
        except ObjectDoesNotExist:
            lt_pus_03 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_03', reg_dt=timezone.now(),
                                  use=1)
        try:
            lt_pus_04 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_04')
        except ObjectDoesNotExist:
            lt_pus_04 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_PUS_04', reg_dt=timezone.now(),
                                  use=1)

    if error is None:
        try:
            with transaction.atomic():
                lt_pus_01.mod_dt = timezone.now()
                lt_pus_01.setting_info = setting_trainee_schedule_confirm1+'/'+setting_trainee_schedule_confirm2
                lt_pus_01.save()

                lt_pus_02.mod_dt = timezone.now()
                lt_pus_02.setting_info = setting_trainee_no_schedule_confirm
                lt_pus_02.save()

                lt_pus_03.mod_dt = timezone.now()
                lt_pus_03.setting_info = setting_trainer_schedule_confirm
                lt_pus_03.save()

                lt_pus_04.mod_dt = timezone.now()
                lt_pus_04.setting_info = setting_trainer_no_schedule_confirm1+'/'+setting_trainer_no_schedule_confirm2
                lt_pus_04.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        request.session.setting_trainee_schedule_confirm = setting_trainee_schedule_confirm1+'/'+setting_trainee_schedule_confirm2
        request.session.setting_trainee_no_schedule_confirm = setting_trainee_no_schedule_confirm
        request.session.setting_trainer_schedule_confirm = setting_trainer_schedule_confirm
        request.session.setting_trainer_no_schedule_confirm1 = setting_trainer_no_schedule_confirm1 + '/' + setting_trainer_no_schedule_confirm2

        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 ' \
        #               + 'PUSH 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LT03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info='PUSH 설정 정보', log_how='수정',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


# 강사 예약허용시간 setting 업데이트 api
def update_setting_reserve_logic(request):
    setting_member_reserve_time_available = request.POST.get('setting_member_reserve_time_available', '')
    setting_member_reserve_time_prohibition = request.POST.get('setting_member_reserve_time_prohibition', '')
    setting_member_reserve_prohibition = request.POST.get('setting_member_reserve_prohibition', '')
    setting_trainer_work_time_available = request.POST.get('setting_trainer_work_time_available', '')
    setting_member_reserve_date_available = request.POST.get('setting_member_reserve_date_available', '')

    class_id = request.session.get('class_id', '')

    next_page = request.POST.get('next_page')

    error = None
    lt_res_01 = None
    lt_res_02 = None
    lt_res_03 = None
    lt_res_04 = None
    lt_res_05 = None

    if error is None:
        if setting_member_reserve_time_available == '':
            setting_member_reserve_time_available = '00:00-23:59'
        if setting_member_reserve_time_prohibition == '':
            setting_member_reserve_time_prohibition = '1'
        if setting_member_reserve_prohibition == '':
            setting_member_reserve_prohibition = '1'
        if setting_trainer_work_time_available == '':
            setting_trainer_work_time_available = '00:00-23:59'
        if setting_member_reserve_date_available == '':
            setting_member_reserve_date_available = '14'

    if error is None:
        try:
            lt_res_01 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_01')
        except ObjectDoesNotExist:
            lt_res_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_01', reg_dt=timezone.now(), use=1)
        try:
            lt_res_02 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_02')
        except ObjectDoesNotExist:
            lt_res_02 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_02', reg_dt=timezone.now(), use=1)
        try:
            lt_res_03 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_03')
        except ObjectDoesNotExist:
            lt_res_03 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_03', reg_dt=timezone.now(), use=1)
        try:
            lt_res_04 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_04')
        except ObjectDoesNotExist:
            lt_res_04 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_04', reg_dt=timezone.now(), use=1)
        try:
            lt_res_05 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_05')
        except ObjectDoesNotExist:
            lt_res_05 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_RES_05', reg_dt=timezone.now(), use=1)

    if error is None:
        try:
            with transaction.atomic():
                lt_res_01.mod_dt = timezone.now()
                lt_res_01.setting_info = setting_member_reserve_time_available
                lt_res_01.save()

                lt_res_02.mod_dt = timezone.now()
                lt_res_02.setting_info = setting_member_reserve_time_prohibition
                lt_res_02.save()

                lt_res_03.mod_dt = timezone.now()
                lt_res_03.setting_info = setting_member_reserve_prohibition
                lt_res_03.save()

                lt_res_04.mod_dt = timezone.now()
                lt_res_04.setting_info = setting_trainer_work_time_available
                lt_res_04.save()

                lt_res_05.mod_dt = timezone.now()
                lt_res_05.setting_info = setting_member_reserve_date_available
                lt_res_05.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        request.session['setting_member_reserve_prohibition'] = setting_member_reserve_prohibition
        request.session['setting_member_reserve_time_available'] = setting_member_reserve_time_available
        request.session['setting_member_reserve_time_prohibition'] = setting_member_reserve_time_prohibition
        request.session['setting_trainer_work_time_available'] = setting_trainer_work_time_available
        request.session['setting_member_reserve_date_available'] = setting_member_reserve_date_available
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 '\
        #               + '예약 허용대 시간 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LT03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info='예약 관련 설정 정보', log_how='수정',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


# 강사 예약허용시간 setting 업데이트 api
def update_setting_sales_logic(request):
    setting_sales_10 = request.POST.get('setting_sales_10', '')
    setting_sales_20 = request.POST.get('setting_sales_20', '')
    setting_sales_30 = request.POST.get('setting_sales_30', '')
    setting_sales_40 = request.POST.get('setting_sales_40', '')
    setting_sales_50 = request.POST.get('setting_sales_50', '')
    setting_sales = request.POST.get('setting_sales', '')
    setting_sales_type = request.POST.get('setting_sales_type', '0')
    class_id = request.session.get('class_id', '')

    next_page = request.POST.get('next_page')

    error = None
    lt_sal_01 = ''
    lt_sal_02 = ''
    lt_sal_03 = ''
    lt_sal_04 = ''
    lt_sal_05 = ''
    lt_sal_00 = ''

    if error is None:
        if setting_sales_type == '0':
            setting_sal_01 = setting_sales_10
            setting_sal_02 = setting_sales_20
            setting_sal_03 = setting_sales_30
            setting_sal_04 = setting_sales_40
            setting_sal_05 = setting_sales_50
        else:
            setting_sal_00 = setting_sales

    if error is None:
            try:
                lt_sal_01 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_01', use=1)
            except ObjectDoesNotExist:
                lt_sal_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_01', reg_dt=timezone.now(),
                                      use=1)
            try:
                lt_sal_02 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_02', use=1)
            except ObjectDoesNotExist:
                lt_sal_02 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_02', reg_dt=timezone.now(),
                                      use=1)
            try:
                lt_sal_03 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_03', use=1)
            except ObjectDoesNotExist:
                lt_sal_03 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_03', reg_dt=timezone.now(),
                                      use=1)
            try:
                lt_sal_04 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_04', use=1)
            except ObjectDoesNotExist:
                lt_sal_04 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_04', reg_dt=timezone.now(),
                                      use=1)
            try:
                lt_sal_05 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_05', use=1)
            except ObjectDoesNotExist:
                lt_sal_05 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_05', reg_dt=timezone.now(),
                                      use=1)
            try:
                lt_sal_00 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_00', use=1)
            except ObjectDoesNotExist:
                lt_sal_00 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_SAL_00', reg_dt=timezone.now(),
                                      use=1)

    if error is None:
        try:
            with transaction.atomic():
                if setting_sales_type == '0':
                    lt_sal_01.mod_dt = timezone.now()
                    lt_sal_01.setting_info = setting_sal_01
                    lt_sal_01.save()

                    lt_sal_02.mod_dt = timezone.now()
                    lt_sal_02.setting_info = setting_sal_02
                    lt_sal_02.save()

                    lt_sal_03.mod_dt = timezone.now()
                    lt_sal_03.setting_info = setting_sal_03
                    lt_sal_03.save()

                    lt_sal_04.mod_dt = timezone.now()
                    lt_sal_04.setting_info = setting_sal_04
                    lt_sal_04.save()

                    lt_sal_05.mod_dt = timezone.now()
                    lt_sal_05.setting_info = setting_sal_05
                    lt_sal_05.save()

                    lt_sal_00.mod_dt = timezone.now()
                    lt_sal_00.setting_info = ''
                    lt_sal_00.save()
                else:
                    lt_sal_01.mod_dt = timezone.now()
                    lt_sal_01.setting_info = ''
                    lt_sal_01.save()

                    lt_sal_02.mod_dt = timezone.now()
                    lt_sal_02.setting_info = ''
                    lt_sal_02.save()

                    lt_sal_03.mod_dt = timezone.now()
                    lt_sal_03.setting_info = ''
                    lt_sal_03.save()

                    lt_sal_04.mod_dt = timezone.now()
                    lt_sal_04.setting_info = ''
                    lt_sal_04.save()

                    lt_sal_05.mod_dt = timezone.now()
                    lt_sal_05.setting_info = ''
                    lt_sal_05.save()

                    lt_sal_00.mod_dt = timezone.now()
                    lt_sal_00.setting_info = setting_sal_00
                    lt_sal_00.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:

        log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 ' \
                       + '강의금액 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LB03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info='강의 금액 설정 정보', log_how='수정',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


# 강사 언어 setting 업데이트 api
def update_setting_language_logic(request):
    setting_member_language = request.POST.get('setting_member_language', '')
    next_page = request.POST.get('next_page')
    class_id = request.session.get('class_id', '')

    error = None
    lt_lan_01 = None
    if error is None:
        if setting_member_language == '':
            setting_member_language = 'KOR'

    if error is None:
        try:
            lt_lan_01 = SettingTb.objects.get(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_LAN_01')
        except ObjectDoesNotExist:
            lt_lan_01 = SettingTb(member_id=request.user.id, class_tb_id=class_id, setting_type_cd='LT_LAN_01', reg_dt=timezone.now(), use=1)

    if error is None:
        try:
            with transaction.atomic():
                lt_lan_01.mod_dt = timezone.now()
                lt_lan_01.setting_info = setting_member_language
                lt_lan_01.save()

        except ValueError as e:
            error = '등록 값에 문제가 있습니다.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'
        except InternalError:
            error = '등록 값에 문제가 있습니다.'

    if error is None:
        request.session['setting_language'] = setting_member_language
        # log_contents = '<span>' + request.user.last_name + request.user.first_name + ' 님께서 '\
        #               + '언어 설정</span> 정보를 <span class="status">수정</span>했습니다.'

        log_data = LogTb(log_type='LT03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id, log_info='언어 설정 정보', log_how='수정',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


class TrainerSettingViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'setting_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerSettingViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        context = get_trainer_setting_data(context, self.request.user.id, class_id)
        return context


def get_trainer_setting_data(context, user_id, class_id):

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_01', use=1)
        lt_res_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_01 = '00:00-23:59'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_02', use=1)
        lt_res_02 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_02 = '0'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_03', use=1)
        lt_res_03 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_03 = '0'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_04', use=1)
        lt_res_04 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_04 = '00:00-23:59'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_RES_05', use=1)
        lt_res_05 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_res_05 = '14'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_LAN_01', use=1)
        lt_lan_01 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_lan_01 = 'KOR'

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_01', use=1)
        lt_pus_data = setting_data.setting_info.split('/')
        lt_pus_01 = lt_pus_data[0]
        lt_pus_02 = lt_pus_data[1]
    except ObjectDoesNotExist:
        lt_pus_01 = ''
        lt_pus_02 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_02', use=1)
        lt_pus_03 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_pus_03 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_03', use=1)
        lt_pus_04 = setting_data.setting_info
    except ObjectDoesNotExist:
        lt_pus_04 = ''

    try:
        setting_data = SettingTb.objects.get(member_id=user_id, class_tb_id=class_id, setting_type_cd='LT_PUS_04', use=1)
        lt_pus_data = setting_data.setting_info.split('/')
        lt_pus_05 = lt_pus_data[0]
        lt_pus_06 = lt_pus_data[1]
    except ObjectDoesNotExist:
        lt_pus_05 = ''
        lt_pus_06 = ''

    context['lt_res_01'] = lt_res_01
    context['lt_res_02'] = lt_res_02
    context['lt_res_03'] = lt_res_03
    context['lt_res_04'] = lt_res_04
    context['lt_res_05'] = lt_res_05
    context['lt_lan_01'] = lt_lan_01

    context['lt_pus_01'] = lt_pus_01
    context['lt_pus_02'] = lt_pus_02
    context['lt_pus_03'] = lt_pus_03
    context['lt_pus_04'] = lt_pus_04
    context['lt_pus_05'] = lt_pus_05
    context['lt_pus_06'] = lt_pus_06

    return context


@method_decorator(csrf_exempt, name='dispatch')
class ReadLectureByClassMemberAjax(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'member_class_lecture_data_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(ReadLectureByClassMemberAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        member_id = request.POST.get('member_id', '')
        context['error'] = None

        context = get_lecture_list_by_class_member_id(context, class_id, member_id)

        if context['error'] is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+context['error'])
            messages.error(self.request, context['error'])

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        context = super(ReadLectureByClassMemberAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        member_id = request.POST.get('member_id', '')
        context['error'] = None

        context = get_lecture_list_by_class_member_id(context, class_id, member_id)
        if context['error'] is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+context['error'])
            messages.error(self.request, context['error'])

        return render(request, self.template_name, context)


def get_lecture_list_by_class_member_id(context, class_id, member_id):
    error = None
    class_data = None
    context['error'] = None
    lecture_counts = 0
    np_lecture_counts = 0
    if class_id is None or class_id == '':
        error = '강사 정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_data = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_data.trainer_info = MemberTb.objects.get(member_id=class_data.member_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_data.class_type_name = CommonCdTb.objects.get(common_cd=class_data.subject_cd)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        lecture_data = ClassLectureTb.objects.filter(class_tb_id=class_id, lecture_tb__member_id=member_id,
                                                     lecture_tb__use=1, auth_cd='VIEW').order_by('-lecture_tb__start_date')
        # lecture_data = LectureTb.objects.filter(class_tb_id=class_id, member_id=member_id, use=1).order_by('-start_date')

        for lecture_info_data in lecture_data:
            lecture_info = lecture_info_data.lecture_tb
            lecture_info.start_date = str(lecture_info.start_date)
            lecture_info.end_date = str(lecture_info.end_date)
            lecture_info.mod_dt = str(lecture_info.mod_dt)
            lecture_info.reg_dt = str(lecture_info.reg_dt)

            lecture_info.group_name = '1:1'
            lecture_info.group_type_cd = ''
            lecture_info.group_member_num = ''
            lecture_info.group_state_cd = ''
            lecture_info.group_state_cd_nm = ''
            lecture_info.group_note = ''
            group_check = 0
            group_info = None

            try:
                group_info = GroupLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_id, use=1)
            except ObjectDoesNotExist:
                group_check = 1

            if group_check == 0:
                lecture_info.group_name = group_info.group_tb.name
                lecture_info.group_type_cd = group_info.group_tb.group_type_cd
                lecture_info.group_member_num = group_info.group_tb.member_num
                lecture_info.group_note = group_info.group_tb.note
                lecture_info.group_state_cd = group_info.group_tb.state_cd
                try:
                    state_cd_nm = CommonCdTb.objects.get(common_cd=group_info.group_tb.state_cd)
                    lecture_info.group_state_cd_nm = state_cd_nm.common_cd_nm
                except ObjectDoesNotExist:
                    error = '그룹 정보를 불러오지 못했습니다.'

            try:
                lecture_info.state_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.state_cd)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'
            try:
                lecture_test = MemberLectureTb.objects.get(lecture_tb__lecture_id=lecture_info.lecture_id)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

            lecture_info.auth_cd = lecture_test.auth_cd

            try:
                lecture_info.auth_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.auth_cd)
            except ObjectDoesNotExist:
                error = '수강정보를 불러오지 못했습니다.'

            if lecture_info.auth_cd == 'WAIT':
                np_lecture_counts += 1
            lecture_counts += 1

            # for line in lecture_info.note:

            #    if line in ['\n', '\r\n']:
            #        line
            #        print('empty line')

            if '\r\n' in lecture_info.note:
                lecture_info.note = lecture_info.note.replace('\r\n', ' ')

    class_data.lecture_counts = lecture_counts
    class_data.np_lecture_counts = np_lecture_counts
    context['class_data'] = class_data
    context['lecture_data'] = lecture_data

    # print(error)
    if error is not None:
        context['error'] = error

    return context


class ClassSelectView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainer_class_select.html'

    def get_context_data(self, **kwargs):
        context = super(ClassSelectView, self).get_context_data(**kwargs)
        return context


class AddClassView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainer_class_add.html'

    def get_context_data(self, **kwargs):
        context = super(AddClassView, self).get_context_data(**kwargs)

        class_type_cd_data = CommonCdTb.objects.filter(common_cd='TR', use=1).order_by('order')

        for class_type_cd_info in class_type_cd_data:
            class_type_cd_info.subject_type_cd = CommonCdTb.objects.filter(upper_common_cd='03', group_cd=class_type_cd_info.common_cd, use=1).order_by('order')

        center_list = CenterTrainerTb.objects.filter(member_id=self.request.user.id, use=1)

        context['center_list'] = center_list
        context['class_type_cd_data'] = class_type_cd_data

        return context


class GetClassDataViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = "trainer_class_ajax.html"

    def get_context_data(self, **kwargs):
        context = super(GetClassDataViewAjax, self).get_context_data(**kwargs)
        # class_id = self.request.session.get('class_id', '')
        error = None
        class_auth_data = None

        if error is None:
            class_auth_data = MemberClassTb.objects.filter(member_id=self.request.user.id, auth_cd__contains='VIEW', use=1).order_by('-reg_dt')
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
            # class_data = ClassTb.objects.filter(member_id=self.request.user.id, member_view_state_cd='VIEW', use=1).order_by('-reg_dt')
            # log_data.order_by('-reg_dt')

        if error is None:
            for class_auth_info in class_auth_data:

                class_info = class_auth_info.class_tb
                all_member = MemberTb.objects.filter().order_by('name')
                total_member_num = 0
                for member_info in all_member:
                    # member_data = member_info

                    member_lecture_reg_count = 0
                    member_lecture_rem_count = 0
                    member_lecture_avail_count = 0
                    # 강좌에 해당하는 수강/회원 정보 가져오기
                    class_lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                                       lecture_tb__member_id=member_info.member_id,
                                                                       lecture_tb__state_cd='IP',
                                                                       lecture_tb__use=1,
                                                                       auth_cd='VIEW', use=1).order_by('-lecture_tb__start_date')

                    if len(class_lecture_list) > 0:
                        total_member_num += 1

                subject_type_name_code = CommonCdTb.objects.get(common_cd=class_info.subject_cd)
                class_info.subject_type_name = subject_type_name_code.common_cd_nm

                if class_info.subject_detail_nm is not None and class_info.subject_detail_nm != '':
                    class_info.subject_type_name = class_info.subject_detail_nm
                class_info.state_cd_name = CommonCdTb.objects.get(common_cd=class_info.state_cd)
                class_info.total_member_num = total_member_num

        context['class_data'] = class_auth_data

        if error is not None:
            messages.error(self.request, error)

        return context


def class_processing_logic(request):

    class_id = request.POST.get('class_id', '')
    next_page = request.POST.get('next_page')

    error = None
    if class_id == '':
        error = '강좌를 선택해 주세요.'

    if error is None:
        try:
            class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        request.session['class_id'] = class_id
        class_type_name = ''
        class_name = None

        request.session['class_hour'] = class_info.class_hour

        try:
            class_name = CommonCdTb.objects.get(common_cd=class_info.subject_cd)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

        if error is None:
            if class_info.subject_detail_nm is None or class_info.subject_detail_nm == '':
                class_type_name = class_name.common_cd_nm
            else:
                class_type_name = class_info.subject_detail_nm

        if error is None:
            request.session['class_type_name'] = class_type_name
        else:
            request.session['class_type_name'] = ''

        if error is None:
            if class_info.center_tb is None or class_info.center_tb == '':
                request.session['class_center_name'] = ''
            else:
                request.session['class_center_name'] = class_info.center_tb.center_name

    if error is None:
        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)
    return redirect(next_page)


@csrf_exempt
def delete_class_info_logic(request):

    class_id = request.session.get('class_id', '')
    next_page = request.POST.get('next_page', '')
    error = None

    if class_id is None or class_id == '':
        error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_info = MemberClassTb.objects.get(member_id=request.user.id, class_tb_id=class_id)
            # class_info = ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        class_info.auth_cd = 'DELETE'
        class_info.mod_dt = timezone.now()
        class_info.save()
        # class_info.member_view_state_cd = 'DELETE'
        # class_info.mod_dt = timezone.now()
        # class_info.save()

    if error is None:
        log_data = LogTb(log_type='LC02', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info='강좌 정보', log_how='연동 해제',
                         reg_dt=timezone.now(), use=1)

        log_data.save()

        return redirect(next_page)
    else:
        logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
        messages.error(request, error)

        return redirect(next_page)


@method_decorator(csrf_exempt, name='dispatch')
class DeleteClassInfoView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'trainer_error_ajax.html'

    def post(self, request, *args, **kwargs):
        class_id = request.POST.get('class_id', '')
        class_id_session = request.session.get('class_id', '')

        error = None

        if class_id is None or class_id == '':
            error = '강좌 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                class_info = MemberClassTb.objects.get(member_id=request.user.id, class_tb_id=class_id)
                # class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '강좌 정보를 불러오지 못했습니다.'

        if error is None:
            class_info.auth_cd = 'DELETE'
            class_info.mod_dt = timezone.now()
            class_info.save()
            # class_info.member_view_state_cd = 'DELETE'
            # class_info.mod_dt = timezone.now()
            # class_info.save()

        if error is None:
            if class_id == class_id_session:
                request.session['class_id'] = ''
                request.session['class_type_name'] = ''
                request.session['class_center_name'] = ''

        if error is None:
            log_data = LogTb(log_type='LC02', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                             class_tb_id=class_id,
                             log_info='강좌 정보', log_how='연동 해제',
                             reg_dt=timezone.now(), use=1)

            log_data.save()

        if error is not None:
            logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
            messages.error(request, error)

        return render(request, self.template_name)


@method_decorator(csrf_exempt, name='dispatch')
class UpdateClassInfoView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'trainer_error_ajax.html'

    def post(self, request, *args, **kwargs):
        class_id = request.POST.get('class_id', '')
        subject_cd = request.POST.get('subject_cd', '')
        subject_detail_nm = request.POST.get('subject_detail_nm', '')
        start_date = request.POST.get('start_date', '')
        end_date = request.POST.get('end_date', '')
        class_hour = request.POST.get('class_hour', '')
        start_hour_unit = request.POST.get('start_hour_unit', '')
        class_member_num = request.POST.get('class_member_num', '')

        error = None

        if class_id is None or class_id == '':
            error = '강좌 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '강좌 정보를 불러오지 못했습니다.'

        if error is None:

            if subject_cd is not None or subject_cd != '':
                class_info.subject_cd = subject_cd

            if class_hour is not None or class_hour != '':
                class_info.class_hour = class_hour

            if start_hour_unit is not None or start_hour_unit != '':
                class_info.start_hour_unit = start_hour_unit

            if start_date is not None or start_date != '':
                class_info.start_date = start_date
            if end_date is not None and end_date != '':
                class_info.end_date = end_date

            if subject_detail_nm is not None:
                class_info.subject_detail_nm = subject_detail_nm

            if class_member_num is not None or class_member_num != '':
                class_info.class_member_num = class_member_num

        if error is None:
            class_info.mod_dt = timezone.now()
            class_info.save()

        if error is None:
            log_data = LogTb(log_type='LC02', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                             class_tb_id=class_id,
                             log_info='강좌 정보', log_how='수정',
                             reg_dt=timezone.now(), use=1)

            log_data.save()

        if error is not None:
            logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
            messages.error(request, error)

        return render(request, self.template_name)


@method_decorator(csrf_exempt, name='dispatch')
class UpdateClassInfoView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'trainer_error_ajax.html'

    def post(self, request, *args, **kwargs):
        class_id = request.POST.get('class_id', '')
        subject_cd = request.POST.get('subject_cd', '')
        subject_detail_nm = request.POST.get('subject_detail_nm', '')
        start_date = request.POST.get('start_date', '')
        end_date = request.POST.get('end_date', '')
        class_hour = request.POST.get('class_hour', '')
        start_hour_unit = request.POST.get('start_hour_unit', '')
        class_member_num = request.POST.get('class_member_num', '')

        error = None

        if class_id is None or class_id == '':
            error = '강좌 정보를 불러오지 못했습니다.'

        if error is None:
            try:
                class_info = ClassTb.objects.get(class_id=class_id)
            except ObjectDoesNotExist:
                error = '강좌 정보를 불러오지 못했습니다.'

        if error is None:

            if subject_cd is not None and subject_cd != '':
                class_info.subject_cd = subject_cd

            if class_hour is not None and class_hour != '':
                class_info.class_hour = class_hour

            if start_hour_unit is not None and start_hour_unit != '':
                class_info.start_hour_unit = start_hour_unit

            if start_date is not None and start_date != '':
                class_info.start_date = start_date
            if end_date is not None and end_date != '':
                class_info.end_date = end_date

            if subject_detail_nm is not None and subject_detail_nm != '':
                class_info.subject_detail_nm = subject_detail_nm

            if class_member_num is not None and class_member_num != '':
                class_info.class_member_num = class_member_num

        if error is None:
            class_info.mod_dt = timezone.now()
            class_info.save()

        if error is None:
            log_data = LogTb(log_type='LC02', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                             class_tb_id=class_id,
                             log_info='강좌 정보', log_how='수정',
                             reg_dt=timezone.now(), use=1)

            log_data.save()

        if error is not None:
            logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
            messages.error(request, error)
        else:
            request.session['class_hour'] = class_info.class_hour

        return render(request, self.template_name)


class AddClassInfoView(LoginRequiredMixin, AccessTestMixin, View):
    template_name = 'trainer_error_ajax.html'

    def post(self, request, *args, **kwargs):
        center_id = request.POST.get('center_id', '')
        subject_cd = request.POST.get('subject_cd', '')
        subject_detail_nm = request.POST.get('subject_detail_nm', '')
        start_date = request.POST.get('start_date', '')
        end_date = request.POST.get('end_date', '')
        class_hour = request.POST.get('class_hour', '')
        start_hour_unit = request.POST.get('start_hour_unit', '')
        class_member_num = request.POST.get('class_member_num', '')

        error = None

        if subject_cd is None or subject_cd == '':
            error = '강좌 종류를 설정해주세요.'

        if class_hour is None or class_hour == '':
            class_hour = 60

        if start_hour_unit is None or start_hour_unit == '':
            start_hour_unit = 1.0

        if start_date is None or start_date == '':
            start_date = datetime.date.today()
        if end_date is None or end_date == '':
            end_date = start_date + timezone.timedelta(days=3650)

        if subject_detail_nm is None:
            subject_detail_nm = ''

        if class_member_num is None or class_member_num == '':
            error = '수업당 최대 허용 인원을 설정해 주세요.'

        if error is None:
            try:
                with transaction.atomic():
                    if center_id is None or center_id == '':
                        class_info = ClassTb(member_id=request.user.id,
                                             subject_cd=subject_cd, start_date=start_date, end_date=end_date,
                                             class_hour=float(class_hour), start_hour_unit=float(start_hour_unit),
                                             # member_view_state_cd='VIEW',
                                             subject_detail_nm=subject_detail_nm,
                                             class_member_num=int(class_member_num), state_cd='IP',
                                             reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)

                    else:
                        class_info = ClassTb(member_id=request.user.id, center_tb_id=center_id,
                                             subject_cd=subject_cd, start_date=start_date, end_date=end_date,
                                             class_hour=float(class_hour), start_hour_unit=float(start_hour_unit),
                                             # member_view_state_cd='VIEW',
                                             subject_detail_nm=subject_detail_nm,
                                             class_member_num=int(class_member_num), state_cd='IP',
                                             reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)

                    class_info.save()
                    member_class_info = MemberClassTb(member_id=request.user.id, class_tb_id=class_info.class_id,
                                                      auth_cd='VIEW', mod_member_id=request.user.id,
                                                      reg_dt=timezone.now(), mod_dt=timezone.now(), use=1)
                    member_class_info.save()

            except ValueError as e:
                error = '등록 값에 문제가 있습니다.'
            except IntegrityError as e:
                error = '등록 값에 문제가 있습니다.'
            except TypeError as e:
                error = '등록 값의 형태가 문제 있습니다.'
            except ValidationError as e:
                error = '등록 값의 형태가 문제 있습니다.'
            except InternalError:
                error = '등록 값에 문제가 있습니다.'

        if error is None:
            request.session['class_id'] = class_info.class_id
            request.session['class_hour'] = class_info.class_hour
            class_type_name = ''
            class_name = None
            try:
                class_name = CommonCdTb.objects.get(common_cd=class_info.subject_cd)
            except ObjectDoesNotExist:
                error = '강좌 정보를 불러오지 못했습니다.'

            if error is None:
                if class_info.subject_detail_nm is None or class_info.subject_detail_nm == '':
                    class_type_name = class_name.common_cd_nm
                else:
                    class_type_name = class_info.subject_detail_nm

            if error is None:
                request.session['class_type_name'] = class_type_name
            else:
                request.session['class_type_name'] = ''

            if error is None:
                if class_info.center_tb is None or class_info.center_tb == '':
                    request.session['class_center_name'] = ''
                else:
                    request.session['class_center_name'] = class_info.center_tb.center_name

        if error is None:
            log_data = LogTb(log_type='LC01', auth_member_id=request.user.id,
                             from_member_name=request.user.last_name + request.user.first_name,
                             log_info='강좌 정보', log_how='등록',
                             reg_dt=timezone.now(), use=1)

            log_data.save()

        if error is not None:
            logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+error)
            messages.error(request, error)
        return render(request, self.template_name)


class TrainerErrorInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'trainer_error_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(TrainerErrorInfoView, self).get_context_data(**kwargs)
        return context


@method_decorator(csrf_exempt, name='dispatch')
class ReadMemberScheduleDataView(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'member_schedule_data_ajax.html'

    def post(self, request, *args, **kwargs):
        context = super(ReadMemberScheduleDataView, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        member_id = request.POST.get('member_id', None)
        context['error'] = None

        if member_id is None or member_id == '':
            context['error'] = '회원 정보를 불러오지 못했습니다.'

        if context['error'] is None:
            context = get_trainee_schedule_data_func(context, class_id, member_id)

        if context['error'] is not None:
            logger.error(request.user.last_name+' '+request.user.first_name+'['+str(request.user.id)+']'+context['error'])
            messages.error(request, context['error'])

        return render(request, self.template_name, context)


def get_trainee_schedule_data_func(context, class_id, member_id):

    error = None
    class_info = None

    pt_schedule_data = None

    lecture_list = None
    pt_schedule_id = []
    pt_schedule_lecture_id = []
    pt_schedule_start_datetime = []
    pt_schedule_end_datetime = []
    pt_schedule_state_cd = []
    pt_schedule_note = []
    pt_schedule_reg_datetime = []
    pt_schedule_mod_datetime = []
    pt_schedule_idx = []

    # 강좌 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강좌 정보를 불러오지 못했습니다.'

    # 수강 정보 불러 오기
    if error is None:
        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                     lecture_tb__member_id=member_id,
                                                     lecture_tb__use='1', auth_cd='VIEW', use=1).order_by('lecture_tb__start_date')
    if error is None:
        # 강사 클래스의 반복일정 불러오기
        if len(lecture_list) > 0:
            for idx, lecture_list_info in enumerate(lecture_list):
                lecture_info = lecture_list_info.lecture_tb
                pt_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                             en_dis_type='1', use=1).order_by('start_dt')

                if pt_schedule_data is not None and len(pt_schedule_data) > 0:
                    idx = 0
                    for pt_schedule_info in pt_schedule_data:
                        idx += 1
                        # lecture schedule id 셋팅
                        pt_schedule_id.append(pt_schedule_info.schedule_id)
                        # lecture schedule 에 해당하는 lecture id 셋팅
                        pt_schedule_lecture_id.append(pt_schedule_info.lecture_tb_id)

                        pt_schedule_start_datetime.append(str(pt_schedule_info.start_dt))
                        pt_schedule_end_datetime.append(str(pt_schedule_info.end_dt))
                        pt_schedule_reg_datetime.append(str(pt_schedule_info.mod_dt))
                        pt_schedule_mod_datetime.append(str(pt_schedule_info.reg_dt))
                        pt_schedule_idx.append(idx)

                        if pt_schedule_info.note is None:
                            pt_schedule_note.append('')
                        else:
                            pt_schedule_note.append(pt_schedule_info.note)
                        # 끝난 스케쥴인지 확인
                        pt_schedule_state_cd.append(str(pt_schedule_info.state_cd))

    context['pt_schedule_id'] = pt_schedule_id
    context['pt_schedule_lecture_id'] = pt_schedule_lecture_id
    context['pt_schedule_start_datetime'] = pt_schedule_start_datetime
    context['pt_schedule_end_datetime'] = pt_schedule_end_datetime
    context['pt_schedule_reg_datetime'] = pt_schedule_reg_datetime
    context['pt_schedule_mod_datetime'] = pt_schedule_mod_datetime
    context['pt_schedule_state_cd'] = pt_schedule_state_cd
    context['pt_schedule_note'] = pt_schedule_note
    context['pt_schedule_idx'] = pt_schedule_idx

    if error is None:
        context['error'] = error

    return context


class AlarmCheckView(LoginRequiredMixin, AccessTestMixin, View):
    context_object_name = "log_data"
    template_name = "alarm.html"
    page_template = 'alarm_page.html'

    def get_queryset(self):
        class_id = self.request.session.get('class_id', '')
        error = None
        log_data = None
        if error is None:
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
            log_data = LogTb.objects.filter(class_tb_id=class_id, use=1).order_by('-reg_dt')
            # log_data.order_by('-reg_dt')

        if error is None:
            for log_info in log_data:
                if log_info.read == 0:
                    log_info.log_read = 0
                    log_info.read = 1
                    log_info.save()
                elif log_info.read == 1:
                    log_info.log_read = 1
                else:
                    log_info.log_read = 2
                log_info.reg_dt = str(log_info.reg_dt).split('.')[0]

        return log_data


class AlarmCheckView(LoginRequiredMixin, TemplateView):
    template_name = 'alarm_change_check_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmCheckView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')

        # update_check 0 : data update 없음
        # update_check 1 : data update 있음
        update_check = 0

        error = None
        if error is None:
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
            log_count = LogTb.objects.filter(class_tb_id=class_id, read=0,
                                             push_check=0, use=1).exclude(auth_member_id=self.request.user.id).order_by('-reg_dt').count()
            # log_data.order_by('-reg_dt')
            if log_count > 0:
                update_check = 1

        # print(error)
        context['data_changed'] = update_check
        if error is not None:
            logger.error(self.request.user.last_name+' '+self.request.user.first_name+'['+str(self.request.user.id)+']'+error)
            messages.error(self.request, error)

        return context


class AlarmPushView(LoginRequiredMixin, TemplateView):
    template_name = 'alarm_push_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmPushView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')

        log_data = None
        error = None
        if error is None:
            # log_data = LogTb.objects.filter(class_tb_id=self.request.user.id, use=1).order_by('-reg_dt')
            log_data = LogTb.objects.filter(class_tb_id=class_id, read=0,
                                            push_check=0, use=1).exclude(auth_member_id=self.request.user.id).order_by('-reg_dt')
            # log_data.order_by('-reg_dt')

        if error is None:
            for log_info in log_data:
                if log_info.push_check == 0:
                    log_info.push_check = 1
                    log_info.save()
                log_info.reg_dt = str(log_info.reg_dt).split('.')[0]

        context['log_data'] = log_data
        if error is not None:
            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        return context


class GetOffRepeatScheduleDataViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'off_schedule_data_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetOffRepeatScheduleDataViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        off_repeat_schedule_id = []
        off_repeat_schedule_type = []
        off_repeat_schedule_week_info = []
        off_repeat_schedule_start_date = []
        off_repeat_schedule_end_date = []
        off_repeat_schedule_start_time = []
        off_repeat_schedule_time_duration = []
        off_repeat_schedule_state_cd = []
        off_repeat_schedule_state_cd_nm = []

        # 강좌 정보 가져오기
        try:
            ClassTb.objects.get(class_id=class_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

        if error is None:
            # 강사 클래스의 반복일정 불러오기
            off_repeat_schedule_data = RepeatScheduleTb.objects.filter(class_tb_id=class_id,
                                                                       en_dis_type='0')

            for off_repeat_schedule_info in off_repeat_schedule_data:
                off_repeat_schedule_id.append(off_repeat_schedule_info.repeat_schedule_id)
                off_repeat_schedule_type.append(off_repeat_schedule_info.repeat_type_cd)
                off_repeat_schedule_week_info.append(off_repeat_schedule_info.week_info)
                off_repeat_schedule_start_date.append(str(off_repeat_schedule_info.start_date))
                off_repeat_schedule_end_date.append(str(off_repeat_schedule_info.end_date))
                off_repeat_schedule_start_time.append(off_repeat_schedule_info.start_time)
                off_repeat_schedule_time_duration.append(off_repeat_schedule_info.time_duration)
                off_repeat_schedule_state_cd.append(off_repeat_schedule_info.state_cd)
                try:
                    state_cd_name = CommonCdTb.objects.get(common_cd=off_repeat_schedule_info.state_cd)
                except ObjectDoesNotExist:
                    error = '반복일정 정보를 불러오지 못했습니다.'
                if error is None:
                    off_repeat_schedule_state_cd_nm.append(state_cd_name.common_cd_nm)

        context['off_repeat_schedule_id_data'] = off_repeat_schedule_id
        context['off_repeat_schedule_type_data'] = off_repeat_schedule_type
        context['off_repeat_schedule_week_info_data'] = off_repeat_schedule_week_info
        context['off_repeat_schedule_start_date_data'] = off_repeat_schedule_start_date
        context['off_repeat_schedule_end_date_data'] = off_repeat_schedule_end_date
        context['off_repeat_schedule_start_time_data'] = off_repeat_schedule_start_time
        context['off_repeat_schedule_time_duration_data'] = off_repeat_schedule_time_duration
        context['off_repeat_schedule_state_cd'] = off_repeat_schedule_state_cd
        context['off_repeat_schedule_state_cd_nm'] = off_repeat_schedule_state_cd_nm
        if error is None:
            context['error'] = error

        return context


@csrf_exempt
def export_excel_member_list_logic(request):

    class_id = request.session.get('class_id', '')
    finish_flag = request.GET.get('finish_flag', '0')

    error = None
    class_info = None
    member_id = None
    member_list = []
    member_finish_list = []
    filename_temp = ''
    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강사 정보를 불러오지 못했습니다.'

    if error is None:
        if member_id is None or member_id == '':
            all_member = MemberTb.objects.filter().order_by('name')
        else:
            all_member = MemberTb.objects.filter(member_id=member_id).order_by('name')

        for member_info in all_member:
            member_data = copy.copy(member_info)
            member_data_finish = copy.copy(member_info)
            lecture_finish_check = 0
            # 강좌에 해당하는 수강/회원 정보 가져오기
            lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                         lecture_tb__member_id=member_data.member_id,
                                                         lecture_tb__state_cd='IP', auth_cd='VIEW',
                                                         lecture_tb__use=1, use=1)

            lecture_finish_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                                lecture_tb__member_id=member_data.member_id,
                                                                auth_cd='VIEW', lecture_tb__use=1,
                                                                use=1).exclude(lecture_tb__state_cd='IP')

            if len(lecture_list) == 0:
                if len(lecture_finish_list) > 0:
                    lecture_finish_check = 1

            if len(lecture_list) > 0:
                lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                             lecture_tb__member_id=member_data.member_id,
                                                             auth_cd='VIEW', lecture_tb__use=1, use=1)

                member_data.rj_lecture_counts = 0
                member_data.np_lecture_counts = 0

                member_data.lecture_reg_count_yet = 0
                member_data.lecture_rem_count_yet = 0
                member_data.lecture_avail_count_yet = 0

                member_data.lecture_counts = len(lecture_list)
                member_data.lecture_reg_count = 0
                member_data.lecture_rem_count = 0
                member_data.lecture_avail_count = 0

                member_data.lecture_reg_count_total = 0
                member_data.lecture_rem_count_total = 0
                member_data.lecture_avail_count_total = 0

                member_data.start_date = None
                member_data.end_date = None
                member_data.mod_dt = None

                lecture_count = 0

                for lecture_info_data in lecture_list:
                    # if lecture_info.state_cd == 'RJ':
                    lecture_info = lecture_info_data.lecture_tb
                    if lecture_info_data.auth_cd == 'DELETE':
                        member_data.rj_lecture_counts += 1
                    # if lecture_info.state_cd == 'NP':
                    if lecture_info_data.auth_cd == 'WAIT':
                        member_data.np_lecture_counts += 1

                    lecture_count += MemberLectureTb.objects.filter(member_id=member_data.member_id,
                                                                    lecture_tb=lecture_info.lecture_id,
                                                                    auth_cd='VIEW', lecture_tb__use=1, use=1).count()

                    if lecture_info.use != 0:
                        # if lecture_info.state_cd == 'IP' or lecture_info.state_cd == 'PE':
                        if lecture_info.state_cd == 'IP':
                            member_data.lecture_reg_count += lecture_info.lecture_reg_count
                            member_data.lecture_rem_count += lecture_info.lecture_rem_count
                            member_data.lecture_avail_count += lecture_info.lecture_avail_count
                            member_data.end_date = lecture_info.end_date
                            if member_data.start_date is None or member_data.start_date == '':
                                member_data.start_date = lecture_info.start_date
                            else:
                                if member_data.start_date > lecture_info.start_date:
                                    member_data.start_date = lecture_info.start_date
                            if member_data.end_date is None or member_data.end_date == '':
                                member_data.end_date = lecture_info.end_date
                            else:
                                if member_data.end_date < lecture_info.end_date:
                                    member_data.end_date = lecture_info.end_date

                        # if lecture_info.state_cd == 'NP' or lecture_info.state_cd == 'RJ':
                        #    member_data.lecture_reg_count_yet += lecture_info.lecture_reg_count
                        #    member_data.lecture_rem_count_yet += lecture_info.lecture_rem_count
                        #    member_data.lecture_avail_count_yet += lecture_info.lecture_avail_count

                        if member_data.mod_dt is None or member_data.mod_dt == '':
                            member_data.mod_dt = lecture_info.mod_dt
                        else:
                            if member_data.mod_dt > lecture_info.mod_dt:
                                member_data.mod_dt = lecture_info.mod_dt
                        member_data.lecture_reg_count_total += lecture_info.lecture_reg_count
                        member_data.lecture_rem_count_total += lecture_info.lecture_rem_count
                        member_data.lecture_avail_count_total += lecture_info.lecture_avail_count
                        member_data.lecture_id = lecture_info.lecture_id
                if member_data.reg_info is None or str(member_data.reg_info) != str(request.user.id):
                    if lecture_count == 0:
                        member_data.sex = ''
                        member_data.birthday_dt = ''
                        member_data.phone = '*******'+member_data.phone[7:]
                        member_data.user.email = ''

                member_data.start_date = str(member_data.start_date)
                member_data.end_date = str(member_data.end_date)
                member_data.mod_dt = str(member_data.mod_dt)
                if member_data.birthday_dt is None or member_data.birthday_dt == '':
                    member_data.birthday_dt = ''
                else:
                    member_data.birthday_dt = str(member_data.birthday_dt)
                member_list.append(member_data)

            if lecture_finish_check > 0:
                member_data_finish.rj_lecture_counts = 0
                member_data_finish.np_lecture_counts = 0

                member_data_finish.lecture_reg_count_yet = 0
                member_data_finish.lecture_rem_count_yet = 0
                member_data_finish.lecture_avail_count_yet = 0

                member_data_finish.lecture_counts = len(lecture_finish_list)
                member_data_finish.lecture_reg_count = 0
                member_data_finish.lecture_rem_count = 0
                member_data_finish.lecture_avail_count = 0

                member_data_finish.lecture_reg_count_total = 0
                member_data_finish.lecture_rem_count_total = 0
                member_data_finish.lecture_avail_count_total = 0
                member_data_finish.start_date = None
                member_data_finish.end_date = None
                member_data_finish.mod_dt = None

                lecture_finish_count = 0

                for lecture_info_data in lecture_finish_list:
                    # if lecture_info.state_cd == 'RJ':
                    lecture_info = lecture_info_data.lecture_tb
                    if lecture_info_data.auth_cd == 'DELETE':
                        member_data_finish.rj_lecture_counts += 1
                    # if lecture_info.state_cd == 'NP':
                    if lecture_info_data.auth_cd == 'WAIT':
                        member_data_finish.np_lecture_counts += 1

                    lecture_finish_count += MemberLectureTb.objects.filter(member_id=member_data.member_id,
                                                                           lecture_tb=lecture_info.lecture_id,
                                                                           auth_cd='VIEW', lecture_tb__use=1, use=1).count()

                    if lecture_info.use != 0:
                        # if lecture_info.state_cd == 'IP' or lecture_info.state_cd == 'PE':
                        # if lecture_info.state_cd == 'IP':
                        member_data_finish.lecture_reg_count += lecture_info.lecture_reg_count
                        member_data_finish.lecture_rem_count += lecture_info.lecture_rem_count
                        member_data_finish.lecture_avail_count += lecture_info.lecture_avail_count
                        member_data_finish.end_date = lecture_info.end_date
                        if member_data_finish.start_date is None or member_data_finish.start_date == '':
                            member_data_finish.start_date = lecture_info.start_date
                        else:
                            if member_data_finish.start_date > lecture_info.start_date:
                                member_data_finish.start_date = lecture_info.start_date

                        if member_data_finish.end_date is None or member_data_finish.end_date == '':
                            member_data_finish.end_date = lecture_info.end_date
                        else:
                            if member_data_finish.end_date < lecture_info.end_date:
                                member_data_finish.end_date = lecture_info.end_date

                        # if lecture_info.state_cd == 'NP' or lecture_info.state_cd == 'RJ':
                        #    member_data_finish.lecture_reg_count_yet += lecture_info.lecture_reg_count
                        #    member_data_finish.lecture_rem_count_yet += lecture_info.lecture_rem_count
                        #    member_data_finish.lecture_avail_count_yet += lecture_info.lecture_avail_count

                        if member_data_finish.mod_dt is None or member_data_finish.mod_dt == '':
                            member_data_finish.mod_dt = lecture_info.mod_dt
                        else:
                            if member_data_finish.mod_dt > lecture_info.mod_dt:
                                member_data_finish.mod_dt = lecture_info.mod_dt

                        member_data_finish.lecture_reg_count_total += lecture_info.lecture_reg_count
                        member_data_finish.lecture_rem_count_total += lecture_info.lecture_rem_count
                        member_data_finish.lecture_avail_count_total += lecture_info.lecture_avail_count
                        member_data_finish.lecture_id = lecture_info.lecture_id

                if member_data_finish.reg_info is None or str(member_data_finish.reg_info) != str(request.user.id):
                    if lecture_finish_count == 0:
                        member_data_finish.sex = ''
                        member_data_finish.birthday_dt = ''
                        member_data_finish.phone = '*******'+member_data_finish.phone[7:]
                        member_data_finish.user.email = ''

                member_data_finish.start_date = str(member_data_finish.start_date)
                member_data_finish.end_date = str(member_data_finish.end_date)
                member_data_finish.mod_dt = str(member_data_finish.mod_dt)
                if member_data_finish.birthday_dt is None or member_data_finish.birthday_dt == '':
                    member_data_finish.birthday_dt = ''
                else:
                    member_data_finish.birthday_dt = str(member_data_finish.birthday_dt)
                member_finish_list.append(member_data_finish)

    wb = Workbook()
    ws1 = wb.active
    start_raw = 3

    ws1['A2'] = '회원명'
    ws1['B2'] = '회원 ID'
    ws1['C2'] = '등록 횟수'
    ws1['D2'] = '남은 횟수'
    ws1['E2'] = '시작 일자'
    ws1['F2'] = '종료 일자'
    ws1['G2'] = '연락처'
    ws1.column_dimensions['A'].width = 10
    ws1.column_dimensions['B'].width = 20
    ws1.column_dimensions['C'].width = 10
    ws1.column_dimensions['D'].width = 10
    ws1.column_dimensions['E'].width = 15
    ws1.column_dimensions['F'].width = 15
    ws1.column_dimensions['G'].width = 20
    filename_temp = request.user.last_name+request.user.first_name+'님_'
    if finish_flag == '0':
        filename_temp += '진행중_회원목록'
        ws1.title = "진행중 회원"
        ws1['A1'] = '진행중 회원정보'
        ws1['A1'].font = Font(bold=True, size=15)
        for member_info in member_list:
            ws1['A'+str(start_raw)] = member_info.name
            ws1['B'+str(start_raw)] = member_info.user.username
            ws1['C'+str(start_raw)] = member_info.lecture_reg_count
            ws1['D'+str(start_raw)] = member_info.lecture_rem_count
            ws1['E'+str(start_raw)] = member_info.start_date
            if member_info.end_date == '9999-12-31':
                ws1['F' + str(start_raw)] = '소진시까지'
            else:
                ws1['F'+str(start_raw)] = member_info.end_date
            ws1['G'+str(start_raw)] = member_info.phone[0:3]+'-'+member_info.phone[3:7]+'-'+member_info.phone[7:]
            start_raw += 1
    else:
        ws1.title = "종료된 회원"
        filename_temp += '종료된_회원목록'
        ws1['A1'] = '종료된 회원정보'
        ws1['A1'].font = Font(bold=True, size=15)
        for member_info in member_finish_list:
            ws1['A'+str(start_raw)] = member_info.name
            ws1['B'+str(start_raw)] = member_info.user.username
            ws1['C'+str(start_raw)] = member_info.lecture_reg_count
            ws1['D'+str(start_raw)] = member_info.lecture_rem_count
            ws1['E'+str(start_raw)] = member_info.start_date
            if member_info.end_date == '9999-12-31':
                ws1['F' + str(start_raw)] = '소진시까지'
            else:
                ws1['F'+str(start_raw)] = member_info.end_date
            ws1['G'+str(start_raw)] = member_info.phone[0:3]+'-'+member_info.phone[3:7]+'-'+member_info.phone[7:]
            start_raw += 1

    user_agent = request.META['HTTP_USER_AGENT']
    filename_temp += '.xlsx'
    filename = filename_temp.encode('utf-8')
    response = HttpResponse(save_virtual_workbook(wb), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    if 'chrome' in str(user_agent) or 'Chrome' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'
    elif 'safari' in str(user_agent) or 'Safari' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'
    elif 'firefox' in str(user_agent) or 'Firefox' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename*="'+urllib.parse.quote(filename)+'"'
    else:
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'

    # response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    # response['Content-Disposition'] = 'attachment; filename=mydata.xlsx'

    if error is None:

        return response
    else:

        return response


@csrf_exempt
def export_excel_member_info_logic(request):

    class_id = request.session.get('class_id', '')
    member_id = request.GET.get('member_id', '')

    error = None
    class_info = None
    member_info = None
    lecture_counts = 0
    np_lecture_counts = 0

    if class_id is None or class_id == '':
        error = '강사 정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    wb = Workbook()
    ws1 = wb.active

    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

    # 수강 정보 불러 오기
    if error is None:
        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                     lecture_tb__member_id=member_id,
                                                     lecture_tb__use='1', auth_cd='VIEW', use=1).order_by('-lecture_tb__start_date')
    if error is None:
        # 강사 클래스의 반복일정 불러오기
        if len(lecture_list) > 0:

            for idx, lecture_list_info in enumerate(lecture_list):
                lecture_info = lecture_list_info.lecture_tb
                lecture_info.start_date = str(lecture_info.start_date)
                lecture_info.end_date = str(lecture_info.end_date)
                lecture_info.mod_dt = str(lecture_info.mod_dt)
                lecture_info.reg_dt = str(lecture_info.reg_dt)

                start_raw = 7
                ws1.title = lecture_info.start_date + ' 수강정보'
                ws1['A1'] = '수강 정보'
                ws1['A1'].font = Font(bold=True, size=15)
                ws1['A2'] = '시작일자'
                ws1['B2'] = '종료일자'
                ws1['C2'] = '등록횟수'
                ws1['D2'] = '남은횟수'
                ws1['E2'] = '등록금액'
                ws1['F2'] = '진행상태'
                ws1['G2'] = '회원님과 연결상태'
                ws1['H2'] = '특이사항'

                ws1['A5'] = '수강 이력'
                ws1['A5'].font = Font(bold=True, size=15)
                ws1['A6'] = '회차'
                ws1['B6'] = '시작일자'
                ws1['C6'] = '진행시간'
                ws1['D6'] = '구분'
                ws1['E6'] = '메모'

                ws1.column_dimensions['A'].width = 15
                ws1.column_dimensions['B'].width = 20
                ws1.column_dimensions['C'].width = 10
                ws1.column_dimensions['D'].width = 10
                ws1.column_dimensions['E'].width = 20
                ws1.column_dimensions['F'].width = 10
                ws1.column_dimensions['G'].width = 10
                ws1.column_dimensions['H'].width = 20

                try:
                    lecture_info.state_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.state_cd)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'
                try:
                    lecture_test = MemberLectureTb.objects.get(lecture_tb__lecture_id=lecture_info.lecture_id)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                lecture_info.auth_cd = lecture_test.auth_cd

                try:
                    lecture_info.auth_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.auth_cd)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                if lecture_info.auth_cd == 'WAIT':
                    np_lecture_counts += 1
                lecture_counts += 1

                # for line in lecture_info.note:

                #    if line in ['\n', '\r\n']:
                #        line
                #        print('empty line')

                if '\r\n' in lecture_info.note:
                    lecture_info.note = lecture_info.note.replace('\r\n', ' ')

                ws1['A3'] = lecture_info.start_date
                ws1['B3'] = lecture_info.end_date
                ws1['C3'] = lecture_info.lecture_reg_count
                ws1['D3'] = lecture_info.lecture_rem_count
                ws1['E3'] = lecture_info.price
                ws1['F3'] = lecture_info.state_cd_name.common_cd_nm
                ws1['G3'] = lecture_info.auth_cd_name.common_cd_nm
                ws1['H3'] = lecture_info.note

                pt_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                             en_dis_type='1', use=1).order_by('-start_dt')

                if pt_schedule_data is not None and len(pt_schedule_data) > 0:
                    schedule_idx = len(pt_schedule_data)
                    for pt_schedule_info in pt_schedule_data:

                        ws1['A' + str(start_raw)] = str(schedule_idx)
                        start_date_temp = str(pt_schedule_info.start_dt).split(':')
                        ws1['B' + str(start_raw)] = start_date_temp[0]+':'+start_date_temp[1]

                        time_duration_temp = pt_schedule_info.end_dt-pt_schedule_info.start_dt
                        time_duration = str(time_duration_temp).split(':')
                        time_duration_str = ''
                        if time_duration[0] != '00' and time_duration[0] != '0':
                            time_duration_str += time_duration[0]+'시간'
                        if time_duration[1] != '00' and time_duration[1] != '0':
                            time_duration_str += time_duration[1]+'분'

                        ws1['C' + str(start_raw)] = time_duration_str
                        if pt_schedule_info.state_cd == 'PE':
                            ws1['D' + str(start_raw)] = '완료'
                        else:
                            ws1['D' + str(start_raw)] = '시작전'

                        if pt_schedule_info.note is None:
                            ws1['E' + str(start_raw)] = ''
                        else:
                            ws1['E' + str(start_raw)] = pt_schedule_info.note
                        start_raw += 1
                        schedule_idx -= 1

                ws1 = wb.create_sheet()
    user_agent = request.META['HTTP_USER_AGENT']
    filename = str(member_info.name+'_회원님_수강정보.xlsx').encode('utf-8')
    # test_str = urllib.parse.unquote('한글')
    response = HttpResponse(save_virtual_workbook(wb), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    if 'chrome' in str(user_agent) or 'Chrome' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'
    elif 'safari' in str(user_agent) or 'Safari' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'
    elif 'firefox' in str(user_agent) or 'Firefox' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename*="'+urllib.parse.quote(filename)+'"'
    else:
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'
    # filename="'+test_str+'.xlsx"'
    # response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    # response['Content-Disposition'] = 'attachment; filename=mydata.xlsx'

    if error is None:

        return response
    else:

        return response


@csrf_exempt
def import_excel_member_list_logic(request):

    class_id = request.session.get('class_id', '')
    finish_flag = request.GET.get('finish_flag', '0')

    error = None
    class_info = None
    member_id = None
    member_list = []
    member_finish_list = []
    filename_temp = ''
    # 강사 정보 가져오기
    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강사 정보를 불러오지 못했습니다.'

    wb = Workbook()
    ws1 = wb.active
    start_raw = 3

    ws1['A2'] = '회원명'
    ws1['B2'] = '회원 ID'
    ws1['C2'] = '등록 횟수'
    ws1['D2'] = '남은 횟수'
    ws1['E2'] = '시작 일자'
    ws1['F2'] = '종료 일자'
    ws1['G2'] = '연락처'
    ws1.column_dimensions['A'].width = 10
    ws1.column_dimensions['B'].width = 20
    ws1.column_dimensions['C'].width = 10
    ws1.column_dimensions['D'].width = 10
    ws1.column_dimensions['E'].width = 15
    ws1.column_dimensions['F'].width = 15
    ws1.column_dimensions['G'].width = 20
    filename_temp = request.user.last_name+request.user.first_name+'님_'
    if finish_flag == '0':
        filename_temp += '진행중_회원목록'
        ws1.title = "진행중 회원"
        ws1['A1'] = '진행중 회원정보'
        ws1['A1'].font = Font(bold=True, size=15)
        for member_info in member_list:
            ws1['A'+str(start_raw)] = member_info.name
            ws1['B'+str(start_raw)] = member_info.user.username
            ws1['C'+str(start_raw)] = member_info.lecture_reg_count
            ws1['D'+str(start_raw)] = member_info.lecture_rem_count
            ws1['E'+str(start_raw)] = member_info.start_date
            if member_info.end_date == '9999-12-31':
                ws1['F' + str(start_raw)] = '소진시까지'
            else:
                ws1['F'+str(start_raw)] = member_info.end_date
            ws1['G'+str(start_raw)] = member_info.phone[0:3]+'-'+member_info.phone[3:7]+'-'+member_info.phone[7:]
            start_raw += 1
    else:
        ws1.title = "종료된 회원"
        filename_temp += '종료된_회원목록'
        ws1['A1'] = '종료된 회원정보'
        ws1['A1'].font = Font(bold=True, size=15)
        for member_info in member_finish_list:
            ws1['A'+str(start_raw)] = member_info.name
            ws1['B'+str(start_raw)] = member_info.user.username
            ws1['C'+str(start_raw)] = member_info.lecture_reg_count
            ws1['D'+str(start_raw)] = member_info.lecture_rem_count
            ws1['E'+str(start_raw)] = member_info.start_date
            if member_info.end_date == '9999-12-31':
                ws1['F' + str(start_raw)] = '소진시까지'
            else:
                ws1['F'+str(start_raw)] = member_info.end_date
            ws1['G'+str(start_raw)] = member_info.phone[0:3]+'-'+member_info.phone[3:7]+'-'+member_info.phone[7:]
            start_raw += 1

    user_agent = request.META['HTTP_USER_AGENT']
    filename_temp += '.xlsx'
    filename = filename_temp.encode('utf-8')
    response = HttpResponse(save_virtual_workbook(wb), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    if 'chrome' in str(user_agent) or 'Chrome' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'
    elif 'safari' in str(user_agent) or 'Safari' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'
    elif 'firefox' in str(user_agent) or 'Firefox' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename*="'+urllib.parse.quote(filename)+'"'
    else:
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'

    # response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    # response['Content-Disposition'] = 'attachment; filename=mydata.xlsx'

    if error is None:

        return response
    else:

        return response


@csrf_exempt
def import_excel_member_info_logic(request):

    class_id = request.session.get('class_id', '')
    member_id = request.GET.get('member_id', '')

    error = None
    class_info = None
    member_info = None
    lecture_counts = 0
    np_lecture_counts = 0

    if class_id is None or class_id == '':
        error = '강사 정보를 불러오지 못했습니다.'

    if member_id is None or member_id == '':
        error = '회원 정보를 불러오지 못했습니다.'

    wb = Workbook()
    ws1 = wb.active

    try:
        class_info = ClassTb.objects.get(class_id=class_id)
    except ObjectDoesNotExist:
        error = '강좌 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            member_info = MemberTb.objects.get(member_id=member_id)
        except ObjectDoesNotExist:
            error = '강사 정보를 불러오지 못했습니다.'

    # 수강 정보 불러 오기
    if error is None:
        lecture_list = ClassLectureTb.objects.filter(class_tb_id=class_info.class_id,
                                                     lecture_tb__member_id=member_id,
                                                     lecture_tb__use='1', auth_cd='VIEW', use=1).order_by('-lecture_tb__start_date')
    if error is None:
        # 강사 클래스의 반복일정 불러오기
        if len(lecture_list) > 0:

            for idx, lecture_list_info in enumerate(lecture_list):
                lecture_info = lecture_list_info.lecture_tb
                lecture_info.start_date = str(lecture_info.start_date)
                lecture_info.end_date = str(lecture_info.end_date)
                lecture_info.mod_dt = str(lecture_info.mod_dt)
                lecture_info.reg_dt = str(lecture_info.reg_dt)

                start_raw = 7
                ws1.title = lecture_info.start_date + ' 수강정보'
                ws1['A1'] = '수강 정보'
                ws1['A1'].font = Font(bold=True, size=15)
                ws1['A2'] = '시작일자'
                ws1['B2'] = '종료일자'
                ws1['C2'] = '등록횟수'
                ws1['D2'] = '남은횟수'
                ws1['E2'] = '등록금액'
                ws1['F2'] = '진행상태'
                ws1['G2'] = '회원님과 연결상태'
                ws1['H2'] = '특이사항'

                ws1['A5'] = '수강 이력'
                ws1['A5'].font = Font(bold=True, size=15)
                ws1['A6'] = '회차'
                ws1['B6'] = '시작일자'
                ws1['C6'] = '진행시간'
                ws1['D6'] = '구분'
                ws1['E6'] = '메모'

                ws1.column_dimensions['A'].width = 15
                ws1.column_dimensions['B'].width = 20
                ws1.column_dimensions['C'].width = 10
                ws1.column_dimensions['D'].width = 10
                ws1.column_dimensions['E'].width = 20
                ws1.column_dimensions['F'].width = 10
                ws1.column_dimensions['G'].width = 10
                ws1.column_dimensions['H'].width = 20

                try:
                    lecture_info.state_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.state_cd)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'
                try:
                    lecture_test = MemberLectureTb.objects.get(lecture_tb__lecture_id=lecture_info.lecture_id)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                lecture_info.auth_cd = lecture_test.auth_cd

                try:
                    lecture_info.auth_cd_name = CommonCdTb.objects.get(common_cd=lecture_info.auth_cd)
                except ObjectDoesNotExist:
                    error = '수강정보를 불러오지 못했습니다.'

                if lecture_info.auth_cd == 'WAIT':
                    np_lecture_counts += 1
                lecture_counts += 1

                # for line in lecture_info.note:

                #    if line in ['\n', '\r\n']:
                #        line
                #        print('empty line')

                if '\r\n' in lecture_info.note:
                    lecture_info.note = lecture_info.note.replace('\r\n', ' ')

                ws1['A3'] = lecture_info.start_date
                ws1['B3'] = lecture_info.end_date
                ws1['C3'] = lecture_info.lecture_reg_count
                ws1['D3'] = lecture_info.lecture_rem_count
                ws1['E3'] = lecture_info.price
                ws1['F3'] = lecture_info.state_cd_name.common_cd_nm
                ws1['G3'] = lecture_info.auth_cd_name.common_cd_nm
                ws1['H3'] = lecture_info.note

                pt_schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_info.lecture_id,
                                                             en_dis_type='1', use=1).order_by('-start_dt')

                if pt_schedule_data is not None and len(pt_schedule_data) > 0:
                    schedule_idx = len(pt_schedule_data)
                    for pt_schedule_info in pt_schedule_data:

                        ws1['A' + str(start_raw)] = str(schedule_idx)
                        start_date_temp = str(pt_schedule_info.start_dt).split(':')
                        ws1['B' + str(start_raw)] = start_date_temp[0]+':'+start_date_temp[1]

                        time_duration_temp = pt_schedule_info.end_dt-pt_schedule_info.start_dt
                        time_duration = str(time_duration_temp).split(':')
                        time_duration_str = ''
                        if time_duration[0] != '00' and time_duration[0] != '0':
                            time_duration_str += time_duration[0]+'시간'
                        if time_duration[1] != '00' and time_duration[1] != '0':
                            time_duration_str += time_duration[1]+'분'

                        ws1['C' + str(start_raw)] = time_duration_str
                        if pt_schedule_info.state_cd == 'PE':
                            ws1['D' + str(start_raw)] = '완료'
                        else:
                            ws1['D' + str(start_raw)] = '시작전'

                        if pt_schedule_info.note is None:
                            ws1['E' + str(start_raw)] = ''
                        else:
                            ws1['E' + str(start_raw)] = pt_schedule_info.note
                        start_raw += 1
                        schedule_idx -= 1

                ws1 = wb.create_sheet()
    user_agent = request.META['HTTP_USER_AGENT']
    filename = str(member_info.name+'_회원님_수강정보.xlsx').encode('utf-8')
    # test_str = urllib.parse.unquote('한글')
    response = HttpResponse(save_virtual_workbook(wb), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    if 'chrome' in str(user_agent) or 'Chrome' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'
    elif 'safari' in str(user_agent) or 'Safari' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'
    elif 'firefox' in str(user_agent) or 'Firefox' in str(user_agent):
        response['Content-Disposition'] = 'attachment; filename*="'+urllib.parse.quote(filename)+'"'
    else:
        response['Content-Disposition'] = 'attachment; filename="'+urllib.parse.quote(filename)+'"'
    # filename="'+test_str+'.xlsx"'
    # response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    # response['Content-Disposition'] = 'attachment; filename=mydata.xlsx'

    if error is None:

        return response
    else:

        return response


@csrf_exempt
def check_import_excel_member_list_logic(request):

    class_id = request.session.get('class_id', '')
    member_id = request.GET.get('member_id', '')

    error = None
    response = None

    if error is None:

        return response
    else:

        return response


@csrf_exempt
def check_import_excel_member_info_logic(request):

    class_id = request.session.get('class_id', '')
    member_id = request.GET.get('member_id', '')

    error = None
    excel_document = openpyxl.load_workbook('sample.xlsx')
    response = None
    # response = HttpResponse(save_virtual_workbook(wb), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    if error is None:

        return response
    else:

        return response


class GetNoticeInfoView(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'notice_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetNoticeInfoView, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')

        board_list = BoardTb.objects.filter(board_type_cd='NOTICE', to_member_type_cd='ALL', use=1).order_by('mod_dt')
        board_list |= BoardTb.objects.filter(board_type_cd='NOTICE', to_member_type_cd='TRAINEE', use=1).order_by('mod_dt')
        board_list.order_by('mod_dt')
        for board_info in board_list:
            board_info.hits += 1
            board_info.save()

        context['board_list'] = board_list

        return context


@csrf_exempt
def add_group_info_logic(request):

    class_id = request.session.get('class_id', '')
    group_type_cd = request.POST.get('group_type_cd', '')
    member_num = request.POST.get('member_num', '')
    name = request.POST.get('name', '')
    note = request.POST.get('note', '')
    next_page = request.POST.get('next_page', '/trainer/get_group_info/')
    error = None
    try:
        with transaction.atomic():
            group_info = GroupTb(class_tb_id=class_id, group_type_cd=group_type_cd, member_num=member_num,
                                 name=name, note=note, state_cd='IP',
                                 mod_dt=timezone.now(), reg_dt=timezone.now(), use=1)

            group_info.save()
    except ValueError as e:
        error = '등록 중 오류가 생겼습니다. 다시 시도해주세요.'
    except IntegrityError as e:
        error = '등록 중 오류가 생겼습니다. 다시 시도해주세요.'
    except TypeError as e:
        error = '등록 중 오류가 생겼습니다. 다시 시도해주세요.'
    except ValidationError as e:
        error = '등록 중 오류가 생겼습니다. 다시 시도해주세요.'
    except InternalError:
        error = '등록 중 오류가 생겼습니다. 다시 시도해주세요.'

    if error is None:
        log_data = LogTb(log_type='LG01', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name+' 그룹 정보', log_how='등록',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

    else:
        messages.error(request, error)

    return redirect(next_page)


@method_decorator(csrf_exempt, name='dispatch')
class GetGroupInfoViewAjax(LoginRequiredMixin, AccessTestMixin, TemplateView):
    template_name = 'group_info_ajax.html'

    def get_context_data(self, **kwargs):
        context = super(GetGroupInfoViewAjax, self).get_context_data(**kwargs)
        class_id = self.request.session.get('class_id', '')
        error = None
        group_data = GroupTb.objects.filter(class_tb_id=class_id, use=1)

        for group_info in group_data:
            try:
                state_cd_nm = CommonCdTb.objects.get(common_cd=group_info.state_cd)
                group_info.state_cd_nm = state_cd_nm.common_cd_nm
            except ObjectDoesNotExist:
                error = '그룹 정보를 불러오지 못했습니다.'

            group_info.group_member_num = GroupLectureTb.objects.filter(group_tb_id=group_info.group_id, use=1).count()

        if error is not None:

            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(self.request, error)

        context['group_data'] = group_data

        return context


@csrf_exempt
def delete_group_info_logic(request):

    class_id = request.session.get('class_id', '')
    group_id = request.POST.get('group_id', '')
    next_page = request.POST.get('next_page', '/trainer/get_group_info/')
    error = None
    group_info = None
    try:
        group_info = GroupTb.objects.get(group_id=group_id)
    except ObjectDoesNotExist:
        error = '그룹 정보를 불러오지 못했습니다.'

    if error is None:
        group_info.use = 0
        group_info.mod_dt = timezone.now()
        group_info.save()

        log_data = LogTb(log_type='LG01', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name+' 그룹 정보', log_how='삭제',
                         reg_dt=timezone.now(), use=1)
        log_data.save()
    else:

        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(
            request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


@csrf_exempt
def update_group_info_logic(request):

    class_id = request.session.get('class_id', '')
    group_id = request.POST.get('group_id', '')
    group_type_cd = request.POST.get('group_type_cd', '')
    member_num = request.POST.get('member_num', '')
    name = request.POST.get('name', '')
    note = request.POST.get('note', '')
    next_page = request.POST.get('next_page', '/trainer/get_group_info/')
    group_info = None
    error = None

    try:
        group_info = GroupTb.objects.get(group_id=group_id)
    except ObjectDoesNotExist:
        error = '그룹 정보를 불러오지 못했습니다.'

    if error is None:

        if group_type_cd == '' or group_type_cd is None:
            group_type_cd = group_info.group_type_cd

        if member_num == '' or member_num is None:
            member_num = group_info.member_num

        if name == '' or name is None:
            name = group_info.name

        if note == '' or note is None:
            note = group_info.note

        group_info.group_type_cd = group_type_cd
        group_info.member_num = member_num
        group_info.name = name
        group_info.note = note
        group_info.mod_dt = timezone.now()
        group_info.save()

    if error is None:
        log_data = LogTb(log_type='LG03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name+' 그룹 정보', log_how='수정',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(
            request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


@csrf_exempt
def add_group_member_logic(request):

    class_id = request.session.get('class_id', '')
    json_data = request.body.decode('utf-8')
    json_loading_data = None
    error = None
    user_db_id_list = []
    user_name_list = []
    group_info = None

    try:
        json_loading_data = json.loads(json_data)
    except ValueError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'
    except TypeError:
        error = '오류가 발생했습니다. 관리자에게 문의해주세요.'

    if error is None:
        group_id = json_loading_data['lecture_info']['group_id']
        if group_id != '' and group_id is not None:
            try:
                group_info = GroupTb.objects.get(group_id=group_id)
            except ObjectDoesNotExist:
                error = '그룹 정보를 불러오지 못했습니다.'

            if error is None:
                group_counter = GroupLectureTb.objects.filter(group_tb_id=group_id, use=1).count()
                group_counter += len(json_loading_data['new_member_data']) + len(json_loading_data['old_member_data'])
                if group_info.group_type_cd == 'NORMAL':
                    if group_counter > group_info.member_num:
                        error = '그룹 허용 인원을 초과했습니다.'
    if error is None:
        try:
            with transaction.atomic():
                if json_loading_data['new_member_data'] != '[]':
                    for json_info in json_loading_data['new_member_data']:
                        context = add_member_no_email_func(request.user.id,
                                                           json_info['first_name'], json_info['last_name'],
                                                           json_info['phone'], json_info['sex'],
                                                           json_info['birthday_dt'])
                        if context['error'] is None:
                            try:
                                user_info = User.objects.get(username=context['username'])
                                user_name_list.append(user_info.last_name+user_info.first_name)
                                user_db_id_list.append(user_info.id)
                            except ObjectDoesNotExist:
                                error = '회원 등록중 오류가 발생했습니다.'

                        else:
                            error = context['error']
                            messages.error(request, context['error'])
                            break

                if error is None:
                    if json_loading_data['old_member_data'] != '[]':
                        for json_info in json_loading_data['old_member_data']:
                            user_db_id_list.append(json_info['db_id'])

                if error is None:
                    for user_info in user_db_id_list:
                        error = add_member_lecture_info(request.user.id, request.user.last_name, request.user.first_name,
                                                        class_id, json_loading_data['lecture_info']['group_id'],
                                                        json_loading_data['lecture_info']['counts'],
                                                        json_loading_data['lecture_info']['price'],
                                                        json_loading_data['lecture_info']['start_date'],
                                                        json_loading_data['lecture_info']['end_date'],
                                                        json_loading_data['lecture_info']['memo'],
                                                        user_info)
                if error is not None:
                    raise InternalError
        except InternalError:
            error = error

    next_page = request.POST.get('next_page', '/trainer/get_group_info/')

    if error is None:
        log_data = LogTb(log_type='LG03', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         class_tb_id=class_id,
                         log_info=group_info.name+' 그룹에 회원을', log_how='추가',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(
            request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)


def add_member_lecture_info(user_id, user_last_name, user_first_name, class_id, group_id, counts, price, start_date, end_date, contents, member_id):

    error = None
    lecture_info = None
    if group_id != '' and group_id is not None:
        try:
            group_info = GroupTb.objects.get(group_id=group_id)
        except ObjectDoesNotExist:
            error = '그룹 정보를 불러오지 못했습니다.'

        if error is None:
            group_counter = GroupLectureTb.objects.filter(group_tb_id=group_id, use=1).count()
            if group_info.group_type_cd == 'NORMAL':
                if group_counter >= group_info.member_num:
                    error = '그룹 허용 인원을 초과했습니다.'

    if error is None:
        try:
            with transaction.atomic():

                state_cd = 'IP'

                lecture_info = add_lecture_info_logic_func(member_id, state_cd, counts, price, start_date, end_date, contents)
                member_lecture_info = MemberLectureTb(member_id=member_id, lecture_tb_id=lecture_info.lecture_id,
                                                      auth_cd='DELETE', mod_member_id=user_id,
                                                      reg_dt=timezone.now(), mod_dt=timezone.now(),
                                                      use=1)
                member_lecture_info.save()
                class_lecture_info = ClassLectureTb(class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                                                    auth_cd='VIEW', mod_member_id=user_id,
                                                    reg_dt=timezone.now(), mod_dt=timezone.now(),
                                                    use=1)
                class_lecture_info.save()

                if group_id != '' and group_id is not None:
                    group_info = GroupLectureTb(group_tb_id=group_id, lecture_tb_id=lecture_info.lecture_id, use=1)
                    group_info.save()

        except ValueError as e:
            error = '오류가 발생했습니다. 다시 시도해주세요.'
        except IntegrityError as e:
            error = '등록 값에 문제가 있습니다.'
        except TypeError as e:
            error = '등록 값의 형태가 문제 있습니다.'
        except ValidationError as e:
            error = '등록 값의 형태가 문제 있습니다'

    if error is None:
        member_name = ''
        try:
            user_info = MemberTb.objects.get(member_id=user_id)
            member_name = user_info.name
        except ObjectDoesNotExist:
            error = '회원 정보를 불러오지 못했습니다.'

        log_data = LogTb(log_type='LB01', auth_member_id=user_id, from_member_name=user_last_name+user_first_name,
                         to_member_name=member_name, class_tb_id=class_id, lecture_tb_id=lecture_info.lecture_id,
                         log_info='수강 정보', log_how='등록',
                         reg_dt=timezone.now(), use=1)

        log_data.save()
    return error


@method_decorator(csrf_exempt, name='dispatch')
class GetGroupMemberViewAjax(LoginRequiredMixin, AccessTestMixin, ContextMixin, View):
    template_name = 'group_member_ajax.html'

    def get(self, request, *args, **kwargs):
        context = super(GetGroupMemberViewAjax, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        group_id = request.GET.get('group_id', '')
        error = None
        member_data = []
        lecture_list = GroupLectureTb.objects.filter(group_tb_id=group_id, use=1)

        for lecture_info in lecture_list:
            try:
                member_info = MemberLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb_id, use=1)
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

            if error is None:
                member_info.member.lecture_tb = lecture_info.lecture_tb
                member_info.member.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                member_info.member.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                member_info.member.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt)
                member_info.member.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt)
                if '\r\n' in member_info.member.lecture_tb.note:
                    member_info.member.lecture_tb.note = member_info.member.lecture_tb.note.replace('\r\n', ' ')

                member_info.member.lecture_tb.auth_cd = member_info.auth_cd

                try:
                    auth_cd_nm = CommonCdTb.objects.get(common_cd=member_info.auth_cd)
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'
                if error is None:
                    member_info.member.lecture_tb.auth_cd_nm = auth_cd_nm.common_cd_nm

                try:
                    state_cd_nm = CommonCdTb.objects.get(common_cd=lecture_info.lecture_tb.state_cd)
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'
                if error is None:
                    member_info.member.lecture_tb.state_cd_nm = state_cd_nm.common_cd_nm

                if member_info.member.birthday_dt is None or member_info.member.birthday_dt == '':
                    member_info.member.birthday_dt = ''
                else:
                    member_info.member.birthday_dt = str(member_info.member.birthday_dt)

                if member_info.member.reg_info is None or str(member_info.member.reg_info) != str(request.user.id):
                    if member_info.auth_cd != 'VIEW':
                        member_info.member.sex = ''
                        member_info.member.birthday_dt = ''
                        member_info.member.phone = '***-****-' + member_info.member.phone[7:]

                member_data.append(member_info.member)

        if error is not None:

            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(request, error)

        context['member_data'] = member_data

        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        context = super(GetGroupMemberViewAjax, self).get_context_data(**kwargs)
        class_id = request.session.get('class_id', '')
        group_id = request.POST.get('group_id', '')
        error = None
        member_data = []
        lecture_list = GroupLectureTb.objects.filter(group_tb_id=group_id, use=1)

        for lecture_info in lecture_list:
            try:
                member_info = MemberLectureTb.objects.get(lecture_tb_id=lecture_info.lecture_tb_id, use=1)
            except ObjectDoesNotExist:
                error = '회원 정보를 불러오지 못했습니다.'

            if error is None:
                member_info.member.lecture_tb = lecture_info.lecture_tb
                member_info.member.lecture_tb.start_date = str(lecture_info.lecture_tb.start_date)
                member_info.member.lecture_tb.end_date = str(lecture_info.lecture_tb.end_date)
                member_info.member.lecture_tb.mod_dt = str(lecture_info.lecture_tb.mod_dt)
                member_info.member.lecture_tb.reg_dt = str(lecture_info.lecture_tb.reg_dt)
                if '\r\n' in member_info.member.lecture_tb.note:
                    member_info.member.lecture_tb.note = member_info.member.lecture_tb.note.replace('\r\n', ' ')

                member_info.member.lecture_tb.auth_cd = member_info.auth_cd

                try:
                    auth_cd_nm = CommonCdTb.objects.get(common_cd=member_info.auth_cd)
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'
                if error is None:
                    member_info.member.lecture_tb.auth_cd_nm = auth_cd_nm.common_cd_nm

                try:
                    state_cd_nm = CommonCdTb.objects.get(common_cd=lecture_info.lecture_tb.state_cd)
                except ObjectDoesNotExist:
                    error = '회원 정보를 불러오지 못했습니다.'
                if error is None:
                    member_info.member.lecture_tb.state_cd_nm = state_cd_nm.common_cd_nm

                if member_info.member.birthday_dt is None or member_info.member.birthday_dt == '':
                    member_info.member.birthday_dt = ''
                else:
                    member_info.member.birthday_dt = str(member_info.member.birthday_dt)

                if member_info.member.reg_info is None or str(member_info.member.reg_info) != str(request.user.id):
                    if member_info.auth_cd != 'VIEW':
                        member_info.member.sex = ''
                        member_info.member.birthday_dt = ''
                        member_info.member.phone = '*******' + member_info.member.phone[7:]

                member_data.append(member_info.member)

        if error is not None:

            logger.error(self.request.user.last_name + ' ' + self.request.user.first_name + '[' + str(
                self.request.user.id) + ']' + error)
            messages.error(request, error)

        context['member_data'] = member_data

        return render(request, self.template_name, context)


@csrf_exempt
def delete_group_member_info_logic(request):

    class_id = request.session.get('class_id', '')
    group_id = request.POST.get('group_id', '')
    lecture_id = request.POST.get('lecture_id', '')
    member_id = request.POST.get('member_id', '')
    next_page = request.POST.get('next_page', '/trainer/get_group_info/')
    error = None

    try:
        user_info = User.objects.get(id=member_id)
    except ObjectDoesNotExist:
        error = '회원 정보를 불러오지 못했습니다.'

    try:
        member = MemberTb.objecats.get(member_id=user_info.id)
    except ObjectDoesNotExist:
        error = '회원 정보를 불러오지 못했습니다.'

    if error is None:
        try:
            class_lecture_info = ClassLectureTb.objects.get(class_tb_id=class_id, lecture_tb_id=lecture_id)
            # lecture_info = LectureTb.objects.get(lecture_id=lecture_id)
        except ObjectDoesNotExist:
            error = '수강정보를 불러오지 못했습니다.'

    if error is None:
        lecture_info = class_lecture_info.lecture_tb
        schedule_data = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                  state_cd='NP')
        schedule_data_finish = ScheduleTb.objects.filter(lecture_tb_id=lecture_id,
                                                         state_cd='PE')
        repeat_schedule_data = RepeatScheduleTb.objects.filter(lecture_tb_id=lecture_id)
        # schedule_data.delete()
        # repeat_schedule_data.delete()

        member_lecture_list = MemberLectureTb.objects.filter(lecture_tb_id=lecture_info.lecture_id).exclude(
            auth_cd='VIEW')
        if user_info.active:
            if len(member_lecture_list) > 0:
                class_lecture_info.delete()
                member_lecture_list.delete()
                schedule_data.delete()
                schedule_data_finish.delete()
                repeat_schedule_data.delete()
                lecture_info.delete()
            else:
                schedule_data.delete()
                schedule_data_finish.update(mod_dt=timezone.now(), use=0)
                class_lecture_info.auth_cd = 'DELETE'
                # lecture_info.use = 0
                # lecture_info.lecture_avail_count = lecture_info.lecture_rem_count
                class_lecture_info.mod_dt = timezone.now()
                # if lecture_info.state_cd == 'IP':
                #    lecture_info.state_cd = 'PE'
                class_lecture_info.save()
                if lecture_info.state_cd == 'IP':
                    lecture_info.state_cd = 'PE'
                    lecture_info.mod_dt = timezone.now()
                    lecture_info.save()
        else:
            class_lecture_info.delete()
            member_lecture_list.delete()
            schedule_data.delete()
            schedule_data_finish.delete()
            repeat_schedule_data.delete()
            lecture_info.delete()
            if str(member.reg_info) == str(request.user.id):
                member_lecture_list_confirm = MemberLectureTb.objects.filter(member_id=user_info.id)
                if len(member_lecture_list_confirm) == 0:
                    member.delete()
                    user_info.delete()

    if error is None:
        log_data = LogTb(log_type='LG02', auth_member_id=request.user.id, from_member_name=request.user.last_name+request.user.first_name,
                         to_member_name=member.name, class_tb_id=class_id,
                         log_info='그룹 정보', log_how='삭제',
                         reg_dt=timezone.now(), use=1)
        log_data.save()

    else:
        logger.error(request.user.last_name + ' ' + request.user.first_name + '[' + str(
            request.user.id) + ']' + error)
        messages.error(request, error)

    return redirect(next_page)

